/* ==========================================================================
   Il cielo vivo (pagina Oggi)
   Segue l'ora vera e il meteo vero della città del capitolo:
   alba, giorno, tramonto, notte con le stelle; nuvole, pioggia, neve.
   Dati: Open-Meteo (gratis, senza chiavi). L'ultimo meteo resta salvato per l'offline.
   ========================================================================== */
(function () {
  "use strict";

  var T = window.TokyoApp;
  var V = window.VIAGGIO;
  var sky = document.getElementById("sky");
  if (!sky || !T || !V) return;

  var CACHE_KEY = "tokyo-sky-v1";
  var DEMO_KEY = "tokyo-sky-demo";
  var MAX_AGE = 30 * 60 * 1000;
  var reduce = T.reduceMotion.matches;
  var lastKind = null;

  var LABEL = { clear: "sereno", partly: "qualche nuvola", cloudy: "nuvoloso", fog: "nebbia", rain: "pioggia", snow: "neve" };
  var DEMOS = {
    neve: { phase: "night", kind: "snow", temp: -1 },
    pioggia: { phase: "day", kind: "rain", temp: 9 },
    tramonto: { phase: "dusk", kind: "clear", temp: 8 },
    alba: { phase: "dawn", kind: "partly", temp: 3 }
  };

  /* ---------- Dove e quando ---------- */
  function chapterNow() {
    var t = T.tokyoToday();
    var d = V.days.filter(function (x) { return x.date === t; })[0];
    var id = d ? d.chapter : (t > V.trip.end ? V.chapters[V.chapters.length - 1].id : V.chapters[0].id);
    return V.chapters.filter(function (c) { return c.id === id; })[0] || V.chapters[0];
  }
  function minutesNow() {
    var h = 0, m = 0;
    new Intl.DateTimeFormat("en-GB", { timeZone: "Asia/Tokyo", hour: "2-digit", minute: "2-digit", hourCycle: "h23" })
      .formatToParts(new Date()).forEach(function (p) {
        if (p.type === "hour") h = parseInt(p.value, 10) % 24;
        if (p.type === "minute") m = parseInt(p.value, 10);
      });
    return h * 60 + m;
  }
  function toMinutes(iso) {
    var t = String(iso || "").split("T")[1];
    if (!t) return null;
    var a = t.split(":");
    return parseInt(a[0], 10) * 60 + parseInt(a[1], 10);
  }

  function phaseFor(now, rise, set) {
    if (now >= rise - 40 && now < rise + 40) return "dawn";
    if (now >= rise + 40 && now < set - 40) return "day";
    if (now >= set - 40 && now < set + 40) return "dusk";
    return "night";
  }
  function sunPosition(now, rise, set, phase) {
    if (phase === "night") return { x: 80, y: 18 };
    var t = (now - rise) / (set - rise);
    t = Math.max(-0.06, Math.min(1.06, t));
    var arc = Math.sin(Math.max(0, Math.min(1, t)) * Math.PI);
    return { x: 8 + t * 84, y: 72 - arc * 52 };
  }
  function kindOf(code, cover) {
    if ([71, 73, 75, 77, 85, 86].indexOf(code) !== -1) return "snow";
    if ([51, 53, 55, 56, 57, 61, 63, 65, 66, 67, 80, 81, 82, 95, 96, 99].indexOf(code) !== -1) return "rain";
    if ([45, 48].indexOf(code) !== -1) return "fog";
    if (code === 3 || cover >= 70) return "cloudy";
    if (code === 2 || cover >= 35) return "partly";
    return "clear";
  }

  /* ---------- Meteo ---------- */
  function readCache() {
    try { return JSON.parse(localStorage.getItem(CACHE_KEY) || "{}") || {}; } catch (e) { return {}; }
  }
  function writeCache(all) {
    try { localStorage.setItem(CACHE_KEY, JSON.stringify(all)); } catch (e) { /* ignora */ }
  }
  function fetchWeather(place) {
    var url = "https://api.open-meteo.com/v1/forecast?latitude=" + place.lat + "&longitude=" + place.lng +
      "&current=temperature_2m,weather_code,cloud_cover&daily=sunrise,sunset&timezone=Asia%2FTokyo&forecast_days=1";
    return fetch(url).then(function (r) {
      if (!r.ok) throw new Error("HTTP " + r.status);
      return r.json();
    }).then(function (j) {
      var all = readCache();
      all[place.city] = {
        at: Date.now(),
        temp: j.current ? j.current.temperature_2m : null,
        code: j.current ? j.current.weather_code : null,
        cover: j.current ? j.current.cloud_cover : 0,
        rise: j.daily ? toMinutes(j.daily.sunrise[0]) : null,
        set: j.daily ? toMinutes(j.daily.sunset[0]) : null
      };
      writeCache(all);
      render();
    }).catch(function () { /* offline: restano ora del giorno e ultimo meteo salvato */ });
  }

  /* ---------- Prova del cielo ---------- */
  function readDemo() {
    try { return DEMOS[sessionStorage.getItem(DEMO_KEY)] || null; } catch (e) { return null; }
  }
  function setDemo(name) {
    try {
      if (name && DEMOS[name]) sessionStorage.setItem(DEMO_KEY, name);
      else sessionStorage.removeItem(DEMO_KEY);
    } catch (e) { /* ignora */ }
    render();
  }

  /* ---------- Stelle e precipitazioni ---------- */
  function buildStars() {
    var svg = sky.querySelector(".sky-stars");
    if (!svg || svg.childNodes.length) return;
    var seed = 7;
    function rnd() { seed = (seed * 9301 + 49297) % 233280; return seed / 233280; }
    var html = "";
    for (var i = 0; i < 60; i++) {
      var r = (0.5 + rnd() * 1.2).toFixed(2);
      html += '<circle cx="' + (rnd() * 400).toFixed(1) + '" cy="' + (rnd() * 210).toFixed(1) + '" r="' + r + '"' +
        (i % 4 === 0 ? ' class="twinkle" style="animation-delay:' + (rnd() * 4).toFixed(2) + 's"' : "") + "/>";
    }
    svg.innerHTML = html;
  }

  function buildPrecip(kind) {
    var box = sky.querySelector(".sky-precip");
    if (!box) return;
    box.innerHTML = "";
    if (kind !== "snow" && kind !== "rain") return;
    var n = kind === "snow" ? 46 : 70;
    var html = "";
    for (var i = 0; i < n; i++) {
      var left = (Math.random() * 100).toFixed(1);
      var delay = (-Math.random() * (kind === "snow" ? 12 : 1.2)).toFixed(2);
      var dur = kind === "snow" ? (7 + Math.random() * 7).toFixed(2) : (0.55 + Math.random() * 0.5).toFixed(2);
      var size = kind === "snow" ? (2 + Math.random() * 3.5).toFixed(1) : null;
      var top = reduce ? (Math.random() * 90).toFixed(1) + "%" : "-20px";
      html += '<span class="' + (kind === "snow" ? "flake" : "drop") + '" style="left:' + left + "%;top:" + top +
        ";animation-delay:" + delay + "s;animation-duration:" + dur + "s" +
        (size ? ";width:" + size + "px;height:" + size + "px;--sway:" + ((Math.random() - 0.5) * 60).toFixed(0) + "px" : "") +
        '"></span>';
    }
    box.innerHTML = html;
    sky.style.setProperty("--fall", sky.offsetHeight + 40 + "px");
  }

  /* ---------- La frase sotto il cielo ---------- */
  function caption(city, w, phase, now) {
    var head = "Il cielo sopra " + city + ", adesso" +
      (w && typeof w.temp === "number" ? ": " + Math.round(w.temp) + "°, " + LABEL[w.kind] : "") + ".";
    var line;
    var late = now >= 20 * 60 || now < 5 * 60;
    if (!w) {
      line = phase === "night" ? "Laggiù è notte." : phase === "dawn" ? "Laggiù sta sorgendo il sole."
           : phase === "dusk" ? "Laggiù il sole sta tramontando." : "Laggiù è giorno.";
    } else if (w.kind === "snow") line = "Nevica! Le bimbe darebbero qualsiasi cosa per essere lì.";
    else if (w.kind === "rain") line = "Piove: giornata perfetta per musei e centri commerciali.";
    else if (w.kind === "fog") line = "C'è nebbia: oggi il Fuji gioca a nascondino.";
    else if (phase === "night") line = late ? "Le bimbe giapponesi dormono già da un pezzo." : "Si accendono le luci della città.";
    else if (phase === "dawn") line = "Laggiù sta sorgendo il sole. Letteralmente: è il Paese del Sol Levante.";
    else if (phase === "dusk") line = "Tramonto su " + city + ": arriva l'ora delle luci.";
    else if (w.kind === "cloudy") line = "Grigio, ma niente drammi.";
    else line = "Cielo limpido: giornata da Fuji.";
    if (w && typeof w.temp === "number" && w.temp <= 4) line += " Cappellino e guanti per le bimbe.";
    return head + " " + line;
  }

  /* ---------- Disegno ---------- */
  function render() {
    var chapter = chapterNow();
    var place = chapter.sky;
    var now = minutesNow();
    var cached = readCache()[place.city];
    var rise = cached && cached.rise != null ? cached.rise : 6 * 60 + 15;
    var set = cached && cached.set != null ? cached.set : 17 * 60;
    var demo = readDemo();

    var phase = demo ? demo.phase : phaseFor(now, rise, set);
    var w = cached && cached.code != null ? { temp: cached.temp, kind: kindOf(cached.code, cached.cover || 0) } : null;
    if (demo) w = { temp: demo.temp, kind: demo.kind };
    var kind = w ? w.kind : "clear";

    sky.dataset.phase = phase;
    sky.dataset.weather = kind;
    var pos = demo
      ? (phase === "dusk" ? { x: 86, y: 66 } : phase === "dawn" ? { x: 14, y: 66 } : phase === "night" ? { x: 80, y: 18 } : { x: 62, y: 22 })
      : sunPosition(now, rise, set, phase);
    sky.style.setProperty("--sun-x", pos.x.toFixed(1) + "%");
    sky.style.setProperty("--sun-y", pos.y.toFixed(1) + "%");

    if (kind !== lastKind) { buildPrecip(kind); lastKind = kind; }
    var hr = T.tokyoHour();
    var g = demo
      ? (phase === "dawn" ? ["おはよう", "Buongiorno"] : phase === "day" ? ["こんにちは", "Buon pomeriggio"] : ["こんばんは", "Buonasera"])
      : (hr >= 5 && hr < 11 ? ["おはよう", "Buongiorno"] : hr >= 11 && hr < 18 ? ["こんにちは", "Buon pomeriggio"] : ["こんばんは", "Buonasera"]);
    {
      var gj = document.getElementById("greet-jp"), gi = document.getElementById("greet-it");
      if (gj) gj.textContent = g[0];
      if (gi) gi.textContent = g[1];
    }
    var cap = document.getElementById("sky-weather");
    if (cap) cap.textContent = caption(place.city, w, phase, now) + (demo ? " (prova)" : "");

    document.querySelectorAll("[data-sky-demo]").forEach(function (b) {
      var name = b.dataset.skyDemo;
      var active = demo ? DEMOS[name] === demo : name === "vero";
      b.setAttribute("aria-pressed", active ? "true" : "false");
    });
  }

  function refresh() {
    var place = chapterNow().sky;
    var cached = readCache()[place.city];
    if (!cached || Date.now() - cached.at > MAX_AGE) fetchWeather(place);
    render();
  }

  document.addEventListener("click", function (e) {
    var b = e.target.closest("[data-sky-demo]");
    if (!b) return;
    var name = b.dataset.skyDemo;
    setDemo(name === "vero" ? null : name);
    window.scrollTo({ top: 0, behavior: reduce ? "auto" : "smooth" });
  });
  window.addEventListener("resize", function () { sky.style.setProperty("--fall", sky.offsetHeight + 40 + "px"); });
  document.addEventListener("tokyo:refresh", refresh);   // quando cambia la data di prova

  buildStars();
  refresh();
  setInterval(refresh, 60000);

  window.TokyoSky = { render: render, refresh: refresh, setDemo: setDemo, kindOf: kindOf, phaseFor: phaseFor };
})();
