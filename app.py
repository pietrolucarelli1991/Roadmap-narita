import hashlib
import hmac
import os
import time
from datetime import timedelta

from flask import Flask, render_template, jsonify, url_for, make_response, request, session, redirect

from dati_spesa import HOTEL, CATEGORIES, SHOPS, PRODUCTS, DIAPER_SIZES, WORDS, PHRASES
from dati_percorsi import ROUTES, STEPS
from dati_viaggio import TRIP, CHAPTERS, PLANS, DAYS, TODO, FUJI

# Ad ogni rilascio aumenta questo numero (e usa lo stesso per il tag git):
# così i telefoni vedono "Nuova versione pronta" e scaricano l'app aggiornata.
APP_VERSION = "4.2.0"

# Font e mappe usati da tutte le pagine (salvati anche per l'uso offline)
FONTS_URL = ("https://fonts.googleapis.com/css2?family=Shippori+Mincho:wght@500;700;800"
             "&family=Zen+Kaku+Gothic+New:wght@400;500;700&display=swap")
LEAFLET_CSS = "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/leaflet.min.css"
LEAFLET_JS = "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/leaflet.min.js"

app = Flask(__name__)

# ---------- Password di famiglia ----------
# La password NON sta nel codice (il progetto è su GitHub): si imposta su Render
# come variabile d'ambiente APP_PASSWORD. Sul PC, senza variabile, l'app resta aperta.
APP_PASSWORD = os.environ.get("APP_PASSWORD", "").strip()
PASSWORD_FINGERPRINT = hashlib.sha256(("tokyo2026:" + APP_PASSWORD).encode()).hexdigest()[:16]
app.secret_key = os.environ.get("SECRET_KEY") or hashlib.sha256(("chiave:" + APP_PASSWORD).encode()).hexdigest()
app.config.update(
    PERMANENT_SESSION_LIFETIME=timedelta(days=400),   # si entra una volta e si resta dentro
    SESSION_COOKIE_HTTPONLY=True,
    SESSION_COOKIE_SAMESITE="Lax",
    SESSION_COOKIE_SECURE=bool(os.environ.get("RENDER")),  # su Render il sito è https
)
OPEN_PATHS = {"/entra", "/manifest.webmanifest", "/sw.js", "/favicon.ico"}


@app.before_request
def require_password():
    if not APP_PASSWORD:
        return None
    path = request.path
    if path in OPEN_PATHS or path.startswith("/static/"):
        return None
    if session.get("ok") == PASSWORD_FINGERPRINT:
        return None
    if path.startswith("/api/"):
        return jsonify({"error": "serve la password"}), 401
    target = request.full_path if request.query_string else path
    return redirect(url_for("entra", next=target))


@app.route("/entra", methods=["GET", "POST"])
def entra():
    if not APP_PASSWORD:
        return redirect("/")
    nxt = request.values.get("next") or "/"
    if not nxt.startswith("/") or nxt.startswith("//"):
        nxt = "/"
    error = False
    if request.method == "POST":
        typed = request.form.get("password", "").strip()
        if hmac.compare_digest(typed.encode(), APP_PASSWORD.encode()):
            session.permanent = True
            session["ok"] = PASSWORD_FINGERPRINT
            frag = request.form.get("hash", "")
            if not frag.startswith("#"):
                frag = ""
            return redirect(nxt + frag)
        time.sleep(1)   # rallenta chi prova a indovinare
        error = True
    resp = make_response(render_template("entra.html", error=error, next=nxt), 401 if error else 200)
    resp.headers["Cache-Control"] = "no-store"
    return resp

# I passi dei percorsi sono in dati_percorsi.py


@app.context_processor
def inject_globals():
    # Disponibili in tutte le pagine HTML
    return {"app_version": APP_VERSION, "fonts_url": FONTS_URL,
            "leaflet_css": LEAFLET_CSS, "leaflet_js": LEAFLET_JS}


def static_v(filename):
    """Indirizzo di un file statico con la versione, es. /static/css/app.css?v=2.0.0"""
    return url_for("static", filename=filename) + "?v=" + APP_VERSION


app.jinja_env.globals["static_v"] = static_v


# ---------- Pagine dell'app ----------

def viaggio_data():
    return {"trip": TRIP, "chapters": CHAPTERS, "plans": PLANS, "days": DAYS, "todo": TODO}


@app.route("/")
def oggi():
    return render_template("oggi.html", viaggio=viaggio_data(), tab="oggi")


@app.route("/itinerario")
def itinerario():
    return render_template("itinerario.html", viaggio=viaggio_data(), tab="viaggio")


@app.route("/fuji")
def fuji():
    return render_template("fuji.html", fuji=FUJI, tab="fuji")


@app.route("/arrivo")
def arrivo():
    return render_route(ROUTES[0])


def chapter_for(date):
    """Il capitolo di arrivo di un percorso: l'ultimo che inizia entro quella data."""
    chosen = CHAPTERS[0]
    for c in CHAPTERS:
        if c["start"] <= date:
            chosen = c
    return chosen


def render_route(route):
    return render_template("index.html", route=route, routes=ROUTES, steps=route["steps"],
                           chapter=chapter_for(route["date"]), tab="arrivo")


@app.route("/percorso/<rid>")
def percorso(rid):
    route = next((r for r in ROUTES if r["id"] == rid), None)
    if route is None:
        return redirect("/arrivo")
    return render_route(route)


@app.route("/spesa")
def mappa_spesa():
    dati = {
        "hotel": HOTEL,
        "categories": CATEGORIES,
        "shops": SHOPS,
        "products": PRODUCTS,
        "sizes": DIAPER_SIZES,
        "words": WORDS,
        "phrases": PHRASES,
    }
    return render_template("mappa_spesa.html", dati=dati, tab="spesa")


# ---------- App installabile e offline ----------

@app.route("/manifest.webmanifest")
def manifest():
    data = {
        "name": "Tokyo 2026",
        "short_name": "Tokyo 2026",
        "description": "Il nostro viaggio a Tokyo: arrivo, itinerario e spesa per le bimbe",
        "lang": "it",
        "start_url": "/",
        "scope": "/",
        "display": "standalone",
        "orientation": "portrait",
        "background_color": "#f7f5f0",
        "theme_color": "#1b2a47",
        "icons": [
            {"src": static_v("icons/icon-192.png"), "sizes": "192x192", "type": "image/png"},
            {"src": static_v("icons/icon-512.png"), "sizes": "512x512", "type": "image/png"},
            {"src": static_v("icons/icon-maskable-512.png"), "sizes": "512x512", "type": "image/png", "purpose": "maskable"},
        ],
    }
    resp = jsonify(data)
    resp.mimetype = "application/manifest+json"
    return resp


@app.route("/sw.js")
def service_worker():
    # Il "service worker" è il pezzo che salva l'app sul telefono per usarla offline
    pages = ["/", "/itinerario", "/fuji", "/spesa"] + [r["path"] for r in ROUTES]
    assets = [static_v(f) for f in [
        "css/app.css", "css/style.css", "css/spesa.css",
        "js/app.js", "js/planner.js", "js/oggi.js", "js/cielo.js", "js/percorso.js", "js/itinerario.js", "js/fuji.js", "js/spesa.js",
        "icons/icon-192.png", "icons/icon-512.png", "icons/apple-touch-icon.png",
    ]] + ["/manifest.webmanifest", FONTS_URL, LEAFLET_CSS, LEAFLET_JS]
    body = render_template("sw.js", pages=pages, assets=assets)
    resp = make_response(body)
    resp.headers["Content-Type"] = "application/javascript; charset=utf-8"
    resp.headers["Cache-Control"] = "no-cache"
    return resp


# ---------- Dati in formato JSON ----------

@app.route("/api/steps")
def api_steps():
    return jsonify(STEPS)


@app.route("/api/step/<int:n>")
def api_step(n):
    step = next((s for s in STEPS if s["n"] == n), None)
    if step:
        return jsonify(step)
    return jsonify({"error": "Step not found"}), 404


@app.route("/api/shops")
def api_shops():
    return jsonify(SHOPS)


@app.route("/api/itinerario")
def api_itinerario():
    return jsonify(viaggio_data())


@app.route("/api/version")
def api_version():
    return jsonify({"version": APP_VERSION})


if __name__ == "__main__":
    app.run(debug=True, port=5000)
