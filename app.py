from flask import Flask, render_template, jsonify

from dati_spesa import HOTEL, CATEGORIES, SHOPS, PRODUCTS, DIAPER_SIZES, WORDS, PHRASES

APP_VERSION = "1.1.0"

app = Flask(__name__)

STEPS = [
    {
        "n": 1,
        "emoji": "📱",
        "title": "Pre-volo — Visit Japan Web",
        "location": "Casa • Prima della partenza",
        "time": "10 min a casa",
        "cost": "0 ¥",
        "cost_detail": "gratuito",
        "actions": [
            "Crea 1 account su vjw-lp.digital.go.jp per tutta la famiglia",
            "Registra: 2 adulti + Child (5a) + Infant (1.5a) — stesso volo/hotel",
            "Compila Immigration + Customs → genera 1 QR per persona",
            "Screenshot di tutti i QR (anche offline) + salva in preferiti",
            "Prepara marsupio per bimba piccola: mani libere = vittoria"
        ],
        "kids": [
            "Bimba grande fa la foto QR = si sente capitano in seconda",
            "Passeggini già taggati con nome + telefono"
        ],
        "japanese": [
            {"label": "Non serve JP qui", "text": "Mostra solo QR al tablet"}
        ],
        "signs": [
            {"icon": "📱", "en": "Visit Japan Web", "jp": "Visit Japan Web", "note": "QR su telefono — screenshot obbligatorio"}
        ]
    },
    {
        "n": 2,
        "emoji": "🛂",
        "title": "Controllo Passaporti — Joint Kiosk",
        "location": "Narita T1 / T2 — Area arrivi",
        "time": "15–25 min",
        "cost": "0 ¥",
        "cost_detail": "immigrazione",
        "actions": [
            "Segui cartelli gialli [Immigration] → cerca corsia FAMILY / Priority",
            "Joint Kiosk: scansioni tutti e 4 i passaporti uno dopo l'altro",
            "Bimba 5 anni: fa da sola impronta + foto (tu la tieni per mano)",
            "Bimba 1.5 anni: esente impronte, solo foto tenuta in braccio",
            "Staff timbra • ritira scontrino dogana per step successivo"
        ],
        "kids": [
            "Passeggino aperto ammesso in coda, nessun problema",
            "Se coda lunga: chiedi 'Baby priority?' indicano corsia rapida"
        ],
        "japanese": [
            {"label": "Da dire:", "text": "Kazoku desu (Siamo famiglia) — 4 nin"},
            {"label": "Da mostrare:", "text": "Visit Japan Web QR code onegai shimasu"}
        ],
        "signs": [
            {"icon": "🛂", "en": "Immigration / Passport Control", "jp": "入国審査", "note": "Sfondo BLU, scritta bianca — segui frecce gialle"},
            {"icon": "🧑‍💻", "en": "Visit Japan Web / Automated Gates", "jp": "自動化ゲート", "note": "Cartello giallo con QR + scritta Joint Kiosk — 4 persone insieme"},
            {"icon": "👨‍👩‍👧‍👶", "en": "Family / Priority Lane", "jp": "優先レーン / 家族", "note": "Omino con bimbo — corsia larga per passeggini"}
        ]
    },
    {
        "n": 3,
        "emoji": "🧳",
        "title": "Bagagli e Passeggini",
        "location": "Baggage Claim — Narita",
        "time": "15–20 min",
        "cost": "0 ¥",
        "cost_detail": "ritiro",
        "actions": [
            "Nastro bagagli: monitor mostra numero volo",
            "Passeggini: spesso escono su nastro OVERSIZED accanto, non sul nastro normale",
            "Carrelli gratis: 1 carrello = 2 trolley + 1 zaino",
            "Baby Room a lato nastri: fasciatoio + acqua calda se serve reset",
            "Conta: 4 bagagli? Apri subito 2 passeggini, incastra zaini sotto"
        ],
        "kids": [
            "Bimba grande sul carrello (gioco del razzo) = niente corsa",
            "Marsupio ora: piccola davanti, mani libere per trolley"
        ],
        "japanese": [
            {"label": "Da mostrare allo staff:", "text": "Bebīkā doko desu ka? (Dov'è il passeggino?)"}
        ],
        "signs": [
            {"icon": "🧳", "en": "Baggage Claim", "jp": "手荷物受取所", "note": "Valigia nera su giallo — guarda monitor n. volo"},
            {"icon": "👶", "en": "Oversized Baggage / Bulky", "jp": "大型手荷物", "note": "Icona passeggino grande — 20m a lato nastro normale"},
            {"icon": "🛃", "en": "Customs", "jp": "税関", "note": "Cartello rosso 'Customs' dopo ritiro — mostra QR dogana"},
            {"icon": "🍼", "en": "Baby Room / Nursery", "jp": "ベビールーム", "note": "Icona biberon — a lato nastri"}
        ]
    },
    {
        "n": 4,
        "emoji": "💴",
        "title": "ATM + Welcome Suica",
        "location": "Dopo dogana — Atrio arrivi",
        "time": "10 min",
        "cost": "2.000 ¥",
        "cost_detail": "solo 2 adulti • child gratis",
        "actions": [
            "ATM 7-Bank (Seven): logo 7-Eleven VERDE + JP Post ROSSO — funzionano con Visa",
            "Preleva 20.000¥ — commissione bassa, accetta carte estere",
            "Welcome Suica Machine ROSSA vicino JR Gate: Adult 2000¥ (1500 viaggio + 500 deposito)",
            "Child Suica: OPZIONALE — se vuoi farla pagare, serve sportello JR",
            "Tocca Suica ai WIDE GATE (cancello largo 90cm) — perfetto per passeggino"
        ],
        "kids": [
            "Se bimba gratis: passa mano nella mano al WIDE GATE con te — 1 bip per 2",
            "Se Child Suica: rosa = souvenir, falla tenere in tasca sua"
        ],
        "japanese": [
            {"label": "Allo sportello:", "text": "Kodomo Welcome Suica kudasai. 5-sai desu. Ryogoku made."}
        ],
        "signs": [
            {"icon": "🏧", "en": "ATM Seven Bank / JP Bank", "jp": "現金自動預払機 / セブン銀行", "note": "Insegna VERDE 7-Bank + rossa JP — cerca International ATM"},
            {"icon": "💱", "en": "Currency Exchange", "jp": "両替 / 外貨両替", "note": "NON serve, ATM meglio — tasso pessimo"},
            {"icon": "🎫", "en": "JR East / Welcome Suica", "jp": "JR東日本旅行センター / Welcome Suica", "note": "Macchinetta ROSSA grande + sportello verde Midori no Madoguchi"},
            {"icon": "♿", "en": "Priority / Elevator / Wide Gate", "jp": "優先 / エレベーター", "note": "Icona omino con cerchio blu — cancello largo 90cm"}
        ]
    },
    {
        "n": 5,
        "emoji": "🎒",
        "title": "Strategia Bagagli — No Yamato",
        "location": "Narita → treno • Hotel Ryogoku View",
        "time": "5 min organizzazione",
        "cost": "0 ¥",
        "cost_detail": "voi facchini top • 2-19-1 Ryogoku",
        "actions": [
            "Adulto 1: trolley grande + zaino + spinge passeggino con bimba grande",
            "Adulto 2: trolley grande + zaino + bimba piccola in marsupio + passeggino chiuso",
            "Treni giapponesi: bagagli ok fino a 160cm totali senza prenotazione — Keisei ok",
            "Evita fascia pendolari: partite dopo le 10:00 se atterrate la mattina = treno vuoto",
            "Ascensori sempre, non scale mobili con trolley — cerca simbolo ascensore"
        ],
        "kids": [
            "Spuntino + acqua già pronti nello zaino frontale",
            "Priorità posti: cercate carrozza con spazio bagagli dietro ultimo sedile"
        ],
        "japanese": [
            {"label": "Tip:", "text": "Sumimasen, elevator wa doko desu ka?"}
        ],
        "signs": [
            {"icon": "🛗", "en": "Elevator", "jp": "エレベーター", "note": "Segui sempre icona ascensore — MAI scale mobili con trolley"}
        ]
    },
    {
        "n": 6,
        "emoji": "🚃",
        "title": "Keisei Access Express → Asakusabashi",
        "location": "Narita → Asakusabashi (senza cambi)",
        "time": "55 min treno",
        "cost": "2.540 ¥ famiglia",
        "cost_detail": "1.270¥ x2 adulti • bimbe FREE",
        "actions": [
            "Segui segni ARANCIONI Access Express (NON blu Skyliner — quello costa 2.580¥ a persona!)",
            "Riconosci treno GIUSTO: scritta arancione 'Access Express' + destinazione 'Haneda / Asakusa'",
            "Binario Keisei: parte ogni 20 min — treno normale pendolari, non riservato",
            "Sali, cerca Priority Seats + area bagagli fondo carrozza",
            "Fermate: Narita → ... → Asakusa → Asakusabashi (scendi qui!) — 9a fermata dopo Oshiage",
            "Tocca Suica all'uscita: bip unico, no biglietto cartaceo"
        ],
        "kids": [
            "Finestrino lato dx = vista Skytree alla fine",
            "Bimba grande conta fermate: Asakusa è la festa, Asakusabashi è casa"
        ],
        "japanese": [
            {"label": "Sul display treno:", "text": "Asakusabashi de orimasu"},
            {"label": "Se dubbio al capotreno:", "text": "Kono densha wa Asakusabashi ni tomarimasu ka?"}
        ],
        "signs": [
            {"icon": "🚃", "en": "Keisei Line / Access Express", "jp": "京成線 / アクセス特急", "note": "ARANCIONE con scritta Access — icona treno + aereo"},
            {"icon": "✈️", "en": "Narita Sky Access", "jp": "成田スカイアクセス", "note": "Linea arancione, NON blu Skyliner. Costa metà."},
            {"icon": "🚫", "en": "NOT Skyliner (blu)", "jp": "スカイライナーではありません", "note": "Se vedi BLU + sedili riservati = SBAGLIATO, costa 2.580¥"},
            {"icon": "🚉", "en": "To Asakusa / Haneda", "jp": "浅草・羽田方面", "note": "Sul display: Asakusa / Haneda — verifica fermi a Asakusabashi"}
        ]
    },
    {
        "n": 7,
        "emoji": "🚕",
        "title": "Asakusabashi + Taxi → Ryogoku View Hotel",
        "location": "Uscita A4 con ascensore → Taxi",
        "time": "5–7 min taxi",
        "cost": "1.000–1.500 ¥",
        "cost_detail": "~8–12€",
        "actions": [
            "Asakusabashi: segui Exit A4 — UNICO con ascensore (cruciale con trolley)",
            "Fuori: Taxi stand a 20m a destra, o alza mano — Taxi rossi sempre liberi",
            "Mostra al tassista foglio con indirizzo giapponese (sezione sotto)",
            "Corsa: 1.2km, 4 min, attraversa fiume Sumida — vista bellissima",
            "Scendi davanti a Ryogoku View Hotel — parcheggio coperto per scarico"
        ],
        "kids": [
            "Taxi JPN hanno porte automatiche: non toccare!",
            "Chiedi seggiolino? Non serve per taxi in Giappone (legge esenta)"
        ],
        "japanese": [
            {"label": "Da mostrare GRANDE:", "text": "両国ビューホテルまでお願いします\n墨田区両国2-19-1"},
            {"label": "Aggiungi:", "text": "JR両国駅西口から1分です"}
        ],
        "signs": [
            {"icon": "🅰️", "en": "Exit A4 Elevator", "jp": "出口 A4 エレベーター", "note": "Cartello GIALLO A4 con icona ascensore — UNICO con ascensore!"},
            {"icon": "🚕", "en": "Taxi Stand", "jp": "タクシー乗り場", "note": "Icona taxi + freccia — 20m fuori A4 a destra"},
            {"icon": "🏨", "en": "Ryogoku View Hotel", "jp": "両国ビューホテル", "note": "2-19-1 Ryogoku — 1 min da JR Ryogoku West Exit"}
        ]
    },
    {
        "n": 8,
        "emoji": "✅",
        "title": "Check-in — Ryogoku View Hotel",
        "location": "2-19-1 Ryogoku, Sumida-ku • 1 min da JR Ryogoku West Exit",
        "time": "15 min",
        "cost": "0 ¥",
        "cost_detail": "già pagato • bagagli con voi",
        "actions": [
            "Check-in 15:00 — se arrivi prima: 'Nimotsu azukatte kudasai' (tenete bagagli)",
            "Chiedi: stanza piano alto, vista Skytree? / Yokuasa (letto basso) per bimbe",
            "Conbini vicino: FamilyMart 50m a sinistra + Lawson 100m — pannolini + onigiri",
            "Bagno rigenerante: vasca grande in camera — perfetto dopo volo",
            "Missione compiuta: sei arrivato, papà. Birra + Skytree dalla finestra."
        ],
        "kids": [
            "Hotel presta bollitore + cuscini extra — chiedi in reception",
            "Passeggini in camera: entrano, ascensore hotel grande"
        ],
        "japanese": [
            {"label": "Check-in:", "text": "Lucarelli desu. Check-in onegai shimasu."},
            {"label": "Bagagli:", "text": "Nimotsu o azukatte kudasai"}
        ],
        "signs": [
            {"icon": "✅", "en": "Hotel — Missione compiuta", "jp": "両国ビューホテル到着", "note": "2-19-1 — hai portato tutto tu, senza Yamato!"}
        ]
    }
]


@app.context_processor
def inject_version():
    # Rende disponibile la versione in tutte le pagine HTML
    return {"app_version": APP_VERSION}


@app.route("/")
def index():
    return render_template("index.html", steps=STEPS)


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
    return render_template("mappa_spesa.html", dati=dati)


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


@app.route("/api/version")
def api_version():
    return jsonify({"version": APP_VERSION})


if __name__ == "__main__":
    app.run(debug=True, port=5000)
