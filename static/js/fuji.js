/* ==========================================================================
   Fuji-metro
   Scarica le previsioni da Open-Meteo (gratis, senza chiavi) e dà un voto
   da 0 a 10 alla visibilità del Fuji, per la mattina e per il pomeriggio.
   L'ultima previsione resta salvata sul telefono per quando sei offline.
   ========================================================================== */
(function () {
  "use strict";

  var T = window.TokyoApp;
  var F = window.FUJI;
  var esc = T.esc;
  var CACHE_KEY = "tokyo-fuji-v1";
  var MAX_AGE_MS = 60 * 60 * 1000;   // dopo un'ora si riscarica
  var PARTS = {
    morning: { label: "mattina", from: 6, to: 10 },
    afternoon: { label: "pomeriggio", from: 12, to: 16 }
  };
  var WEATHER = [
    [[0], "sereno"], [[1, 2], "poco nuvoloso"], [[3], "coperto"], [[45, 48], "nebbia"],
    [[51, 53, 55, 56, 57], "pioggerella"], [[61, 63, 65, 66, 67], "pioggia"],
    [[71, 73, 75, 77], "neve"], [[80, 81, 82], "rovesci"], [[85, 86], "rovesci di neve"],
    [[95, 96, 99], "temporale"]
  ];

  var view = { days: [], fetchedAt: 0, date: null, part: "morning" };

  function $(sel) { return document.querySelector(sel); }
  function cap(s) { return s.charAt(0).toUpperCase() + s.slice(1); }
  function avg(a) { return a.reduce(function (s, v) { return s + v; }, 0) / a.length; }
  function realToday() { return T.realTokyoToday(); }
  function addDays(iso, n) {
    var p = T.parts(iso);
    var d = new Date(p.time + n * 86400000);
    return d.toISOString().slice(0, 10);
  }
  function weatherText(code) {
    for (var i = 0; i < WEATHER.length; i++) if (WEATHER[i][0].indexOf(code) !== -1) return WEATHER[i][1];
    return "";
  }

  /* ---------- Scaricare le previsioni ---------- */
  function apiUrl() {
    var pts = [F.points.summit, F.points.lake, F.points.tokyo];
    return "https://api.open-meteo.com/v1/forecast" +
      "?latitude=" + pts.map(function (p) { return p.lat; }).join(",") +
      "&longitude=" + pts.map(function (p) { return p.lng; }).join(",") +
      "&hourly=cloud_cover_low,cloud_cover_mid,precipitation_probability,visibility" +
      "&daily=temperature_2m_max,temperature_2m_min,weather_code" +
      "&timezone=Asia%2FTokyo&forecast_days=" + F.forecast_days;
  }

  function score(bucket) {
    if (!bucket.obs.length) return null;
    var obs = avg(bucket.obs);
    var s = 10 * (1 - obs / 100);
    var pp = bucket.pp.length ? avg(bucket.pp) : 0;
    if (pp >= 60) s -= 2; else if (pp >= 40) s -= 1;
    if (bucket.vis.length && Math.min.apply(null, bucket.vis) < 10000) s -= 1;
    return { score: Math.max(0, Math.min(10, Math.round(s))), obs: Math.round(obs), pp: Math.round(pp) };
  }

  function buildDays(resp) {
    if (!Array.isArray(resp) || resp.length < 3) throw new Error("risposta inattesa");
    var summit = resp[0], lake = resp[1], tokyo = resp[2];
    var byDate = {};
    summit.hourly.time.forEach(function (ts, i) {
      var date = ts.slice(0, 10);
      var h = parseInt(ts.slice(11, 13), 10);
      var part = h >= PARTS.morning.from && h <= PARTS.morning.to ? "morning"
               : h >= PARTS.afternoon.from && h <= PARTS.afternoon.to ? "afternoon" : null;
      if (!part) return;
      var vals = [summit.hourly.cloud_cover_low[i], summit.hourly.cloud_cover_mid[i], lake.hourly.cloud_cover_low[i]]
        .filter(function (v) { return v !== null && v !== undefined; });
      var d = byDate[date] || (byDate[date] = {
        date: date,
        morning: { obs: [], pp: [], vis: [] },
        afternoon: { obs: [], pp: [], vis: [] }
      });
      if (vals.length) d[part].obs.push(Math.max.apply(null, vals));
      var pp = lake.hourly.precipitation_probability ? lake.hourly.precipitation_probability[i] : null;
      if (pp !== null && pp !== undefined) d[part].pp.push(pp);
      var vis = lake.hourly.visibility ? lake.hourly.visibility[i] : null;
      if (vis !== null && vis !== undefined) d[part].vis.push(vis);
    });

    function dailyFor(src, date) {
      var i = src.daily.time.indexOf(date);
      if (i === -1) return null;
      return {
        min: src.daily.temperature_2m_min[i],
        max: src.daily.temperature_2m_max[i],
        code: src.daily.weather_code ? src.daily.weather_code[i] : null
      };
    }

    return Object.keys(byDate).sort().map(function (date, idx) {
      var d = byDate[date];
      return {
        date: date,
        index: idx,
        morning: score(d.morning),
        afternoon: score(d.afternoon),
        tokyo: dailyFor(tokyo, date),
        lake: dailyFor(lake, date)
      };
    });
  }

  function loadCache() {
    try {
      var c = JSON.parse(localStorage.getItem(CACHE_KEY) || "null");
      if (c && Array.isArray(c.days)) return c;
    } catch (e) { /* ignora */ }
    return null;
  }
  function saveCache() {
    try { localStorage.setItem(CACHE_KEY, JSON.stringify({ days: view.days, fetchedAt: view.fetchedAt })); }
    catch (e) { /* ignora */ }
  }

  function fetchForecast(manual) {
    var btn = $("#btn-refresh");
    btn.disabled = true;
    btn.textContent = "Aggiorno…";
    return fetch(apiUrl())
      .then(function (r) {
        if (!r.ok) throw new Error("HTTP " + r.status);
        return r.json();
      })
      .then(function (json) {
        view.days = buildDays(json);
        view.fetchedAt = Date.now();
        saveCache();
        if (!view.date || !dayByDate(view.date)) view.date = defaultDate();
        renderAll();
        if (manual) T.toast("Previsioni aggiornate");
      })
      .catch(function () {
        if (view.days.length) {
          T.toast("Non riesco ad aggiornare: mostro le ultime previsioni salvate");
        } else {
          $("#scene").dataset.state = "error";
          $("#scene-when").textContent = "Previsioni non disponibili";
          $("#scene-verdict").textContent = "Non riesco a scaricarle: controlla la connessione e premi Aggiorna le previsioni.";
        }
        renderUpdated();
      })
      .then(function () {
        btn.disabled = false;
        btn.textContent = "Aggiorna le previsioni";
      });
  }

  /* ---------- Scelte ---------- */
  function dayByDate(iso) { return view.days.filter(function (d) { return d.date === iso; })[0]; }
  function futureDays() {
    var t = realToday();
    return view.days.filter(function (d) { return d.date >= t; });
  }
  function windowDays() {
    return futureDays().filter(function (d) { return d.date >= F.window.start && d.date <= F.window.end; });
  }
  function bestOf(days) {
    var best = null;
    days.forEach(function (d) {
      ["morning", "afternoon"].forEach(function (part) {
        var s = d[part];
        if (!s) return;
        // a parità di voto vince la mattina e il giorno più vicino
        var key = s.score * 10 + (part === "morning" ? 1 : 0);
        if (!best || key > best.key) best = { key: key, day: d, part: part, s: s };
      });
    });
    return best;
  }
  function defaultDate() {
    var w = windowDays();
    if (w.length) return bestOf(w).day.date;
    var f = futureDays();
    return f.length ? f[0].date : (view.days[0] && view.days[0].date);
  }

  function verdict(s) {
    if (!s) return { cls: "none", text: "Previsione non disponibile" };
    if (s.score >= 8) return { cls: "good", text: "Si vede bene" };
    if (s.score >= 5) return { cls: "maybe", text: "Forse si vede" };
    return { cls: "bad", text: "Probabilmente coperto" };
  }
  function coverLevel(s) {
    if (!s) return 2;
    if (s.obs < 20) return 0;
    if (s.obs < 45) return 1;
    if (s.obs < 70) return 2;
    return 3;
  }

  /* ---------- Disegno e testi ---------- */
  function renderScene() {
    var d = dayByDate(view.date);
    var scene = $("#scene");
    if (!d) return;
    var s = d[view.part];
    var v = verdict(s);
    scene.dataset.state = "ready";
    scene.dataset.part = view.part;
    scene.dataset.cover = coverLevel(s);
    scene.style.setProperty("--grey", s ? ((10 - s.score) / 10 * 0.45).toFixed(2) : "0.45");

    var far = d.index >= 7 ? " La previsione è lontana: ricontrolla nei giorni prima." : "";
    $("#scene-when").textContent = cap(T.longDate(d.date)) + ", " + PARTS[view.part].label;
    $("#scene-verdict").innerHTML = '<span class="verdict verdict-' + v.cls + '">' + v.text +
      (s ? ", " + s.score + " su 10" : "") + "</span>" +
      (s ? '<span class="verdict-detail">Nuvole che nascondono la montagna: ' + s.obs + "%. Probabilità di pioggia: " + s.pp + "%." + far + "</span>" : "");

    document.querySelectorAll(".part-toggle button").forEach(function (b) {
      b.setAttribute("aria-pressed", b.dataset.part === view.part ? "true" : "false");
    });
  }

  function bar(s) {
    var v = verdict(s);
    return '<span class="bar bar-' + v.cls + '"></span>';
  }

  function renderStrip() {
    var t = realToday();
    var days = futureDays();
    $("#day-strip").innerHTML = days.map(function (d) {
      var p = T.parts(d.date);
      var label = cap(T.longDate(d.date)) + ": mattina " + verdict(d.morning).text.toLowerCase() +
        ", pomeriggio " + verdict(d.afternoon).text.toLowerCase();
      var inWindow = d.date >= F.window.start && d.date <= F.window.end;
      return '<button type="button" class="strip-day' + (d.index >= 7 ? " is-far" : "") + (inWindow ? " is-window" : "") +
        '" data-date="' + d.date + '" aria-pressed="' + (d.date === view.date) + '" aria-label="' + esc(label) + '">' +
        '<span class="strip-wd">' + (d.date === t ? "oggi" : T.WD_SHORT[p.wd]) + "</span>" +
        '<span class="strip-num">' + p.d + "</span>" +
        '<span class="strip-bars">' + bar(d.morning) + bar(d.afternoon) + "</span>" +
        "</button>";
    }).join("");
    var sel = document.querySelector('.strip-day[aria-pressed="true"]');
    if (sel && sel.scrollIntoView) sel.scrollIntoView({ block: "nearest", inline: "center" });
  }

  function renderBest() {
    var box = $("#best");
    var b = bestOf(futureDays());
    if (!b) { box.hidden = true; return; }
    box.hidden = false;
    box.innerHTML = "<h2>Il giorno migliore dei prossimi " + futureDays().length + "</h2>" +
      "<p>" + cap(T.longDate(b.day.date)) + ", di " + PARTS[b.part].label + ": " +
      verdict(b.s).text.toLowerCase() + ", " + b.s.score + " su 10.</p>" +
      '<button type="button" class="t-btn" data-show="' + b.day.date + '" data-part="' + b.part + '">Mostralo nel disegno</button>';
  }

  function renderWindow() {
    var box = $("#window");
    var t = realToday();
    if (t > F.window.end) { box.hidden = true; return; }
    box.hidden = false;
    var w = windowDays();
    var range = "dal " + T.parts(F.window.start).d + " al " + T.parts(F.window.end).d + " dicembre";
    if (!w.length) {
      var from = addDays(F.window.start, -(F.forecast_days - 1));
      box.innerHTML = "<h2>La vostra finestra del Fuji</h2>" +
        "<p>Avete in programma il Fuji " + range + ". Quei giorni entrano nelle previsioni da " +
        T.longDate(from) + ": da allora qui comparirà il giorno migliore per partire.</p>" +
        '<p class="fine">' + esc(F.ropeway_note) + "</p>";
      return;
    }
    var b = bestOf(w);
    box.innerHTML = "<h2>La vostra finestra del Fuji</h2>" +
      '<ul class="window-days">' + w.map(function (d) {
        var isBest = b && b.day.date === d.date;
        return '<li class="' + (isBest ? "is-best" : "") + '"><button type="button" data-show="' + d.date + '" data-part="morning">' +
          "<strong>" + cap(T.longDate(d.date)) + "</strong>" +
          "<span>Mattina: " + (d.morning ? d.morning.score + " su 10" : "n.d.") +
          ", pomeriggio: " + (d.afternoon ? d.afternoon.score + " su 10" : "n.d.") + "</span>" +
          (isBest ? '<span class="best-tag">il migliore</span>' : "") + "</button></li>";
      }).join("") + "</ul>" +
      (b ? "<p>Il consiglio: partite " + T.longDate(b.day.date) + " e guardate il Fuji di " + PARTS[b.part].label + ".</p>" : "") +
      '<p class="fine">' + esc(F.ropeway_note) + "</p>";
  }

  function tempLine(name, x) {
    if (!x) return "";
    var w = x.code !== null && x.code !== undefined ? weatherText(x.code) : "";
    return "<li><strong>" + name + "</strong> da " + Math.round(x.min) + "° a " + Math.round(x.max) + "°" +
      (w ? ", " + w : "") + "</li>";
  }

  function renderTemps() {
    var box = $("#temps");
    var d = dayByDate(view.date);
    if (!d || (!d.tokyo && !d.lake)) { box.hidden = true; return; }
    box.hidden = false;
    var tip = "";
    if (d.tokyo) {
      var m = d.tokyo.min;
      tip = m <= 3 ? "Freddo vero: piumino, cappello e guanti per le bimbe, e una coperta per il passeggino."
          : m <= 8 ? "Fresco: giacca pesante e vestiti a strati, così togliete qualcosa nei negozi."
          : "Mite: una giacca leggera basta.";
    }
    if (d.lake && d.tokyo && d.lake.min < d.tokyo.min - 3) {
      tip += " Al lago fa molto più freddo che a Tokyo: il giorno del Fuji vestite le bimbe più pesanti.";
    }
    box.innerHTML = "<h2>Come vestirsi " + (d.date === realToday() ? "oggi" : T.longDate(d.date)) + "</h2>" +
      '<ul class="temps-list">' + tempLine("A Tokyo", d.tokyo) + tempLine("Al lago Kawaguchiko", d.lake) + "</ul>" +
      (tip ? '<p class="day-tip">' + esc(tip) + "</p>" : "");
  }

  function renderUpdated() {
    var el = $("#updated");
    if (!view.fetchedAt) { el.textContent = ""; return; }
    var dt = new Date(view.fetchedAt);
    var time = dt.toLocaleTimeString("it-IT", { hour: "2-digit", minute: "2-digit" });
    var sameDay = new Date().toDateString() === dt.toDateString();
    el.textContent = "Previsioni aggiornate alle " + time + (sameDay ? " di oggi" : " del " + dt.toLocaleDateString("it-IT", { day: "numeric", month: "long" })) + ".";
  }

  function renderAll() {
    renderStrip();
    renderScene();
    renderBest();
    renderWindow();
    renderTemps();
    renderUpdated();
  }

  function show(date, part) {
    if (!dayByDate(date)) return;
    view.date = date;
    if (part) view.part = part;
    renderStrip();
    renderScene();
    renderTemps();
    $("#scene").scrollIntoView({ block: "start", behavior: T.reduceMotion.matches ? "auto" : "smooth" });
  }

  /* ---------- Eventi ---------- */
  $("#day-strip").addEventListener("click", function (e) {
    var b = e.target.closest(".strip-day");
    if (!b) return;
    view.date = b.dataset.date;
    renderStrip();
    renderScene();
    renderTemps();
  });
  document.querySelector(".part-toggle").addEventListener("click", function (e) {
    var b = e.target.closest("button");
    if (!b) return;
    view.part = b.dataset.part;
    renderScene();
  });
  document.addEventListener("click", function (e) {
    var b = e.target.closest("[data-show]");
    if (b) show(b.dataset.show, b.dataset.part);
  });
  $("#btn-refresh").addEventListener("click", function () { fetchForecast(true); });

  /* ---------- Avvio ---------- */
  var cached = loadCache();
  if (cached) {
    view.days = cached.days;
    view.fetchedAt = cached.fetchedAt || 0;
    view.date = defaultDate();
    if (view.date) renderAll();
  }
  if (!cached || Date.now() - view.fetchedAt > MAX_AGE_MS) fetchForecast(false);

  window.__fuji = { buildDays: buildDays, score: score, bestOf: bestOf };
})();
