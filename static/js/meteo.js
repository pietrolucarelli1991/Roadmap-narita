/* ==========================================================================
   Meteo del viaggio
   Previsioni giornaliere (Open-Meteo, gratis, senza chiavi) per le città
   dei tre capitoli. Arrivano quando un giorno entra nei 16 giorni di previsione.
   L'ultima previsione resta salvata per l'offline.
   ========================================================================== */
(function () {
  "use strict";

  var T = window.TokyoApp;
  var V = window.VIAGGIO;
  if (!T || !V) return;

  var KEY = "tokyo-meteo-v1";
  var MAX_AGE = 3 * 60 * 60 * 1000;   // si riscarica dopo 3 ore
  var FORECAST_DAYS = 16;
  var data = load();                 // { at, byChapter: { tokyo1: { "2026-12-15": {...} } } }

  var ICONS = {
    clear: '<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="4.5" fill="#e0a526"/><g stroke="#e0a526" stroke-width="2" stroke-linecap="round"><path d="M12 2.5v2.5M12 19v2.5M2.5 12H5M19 12h2.5M5.2 5.2l1.8 1.8M17 17l1.8 1.8M5.2 18.8 7 17M17 7l1.8-1.8"/></g></svg>',
    partly: '<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="9" cy="9" r="3.6" fill="#e0a526"/><path d="M8 19h9.5a3.5 3.5 0 0 0 0-7 5 5 0 0 0-9.6 1.4A2.8 2.8 0 0 0 8 19z" fill="#9aa6b8"/></svg>',
    cloudy: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M7 18h10.5a4 4 0 0 0 0-8 5.6 5.6 0 0 0-10.8 1.6A3.2 3.2 0 0 0 7 18z" fill="#8e99ab"/></svg>',
    fog: '<svg viewBox="0 0 24 24" aria-hidden="true"><g stroke="#8e99ab" stroke-width="2.2" stroke-linecap="round"><path d="M4 9h16M6 13h12M4 17h16"/></g></svg>',
    rain: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M7 14h10.5a3.6 3.6 0 0 0 0-7.2 5 5 0 0 0-9.7 1.4A2.9 2.9 0 0 0 7 14z" fill="#7d8aa0"/><g stroke="#2b6cb0" stroke-width="2" stroke-linecap="round"><path d="M9 17l-1 3M13 17l-1 3M17 17l-1 3"/></g></svg>',
    snow: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M7 14h10.5a3.6 3.6 0 0 0 0-7.2 5 5 0 0 0-9.7 1.4A2.9 2.9 0 0 0 7 14z" fill="#7d8aa0"/><g fill="#5b8fd1"><circle cx="9" cy="18" r="1.4"/><circle cx="13" cy="20" r="1.4"/><circle cx="16.5" cy="17.5" r="1.4"/></g></svg>'
  };
  var LABEL = { clear: "sereno", partly: "qualche nuvola", cloudy: "nuvoloso", fog: "nebbia", rain: "pioggia", snow: "neve" };

  function kindOf(code) {
    if ([71, 73, 75, 77, 85, 86].indexOf(code) !== -1) return "snow";
    if ([51, 53, 55, 56, 57, 61, 63, 65, 66, 67, 80, 81, 82, 95, 96, 99].indexOf(code) !== -1) return "rain";
    if ([45, 48].indexOf(code) !== -1) return "fog";
    if (code === 3) return "cloudy";
    if (code === 1 || code === 2) return "partly";
    return "clear";
  }

  function load() {
    try { return JSON.parse(localStorage.getItem(KEY) || "null") || { at: 0, byChapter: {} }; } catch (e) { return { at: 0, byChapter: {} }; }
  }
  function save() { try { localStorage.setItem(KEY, JSON.stringify(data)); } catch (e) { /* ignora */ } }

  // Il primo giorno del viaggio che può avere una previsione
  function firstForecastDate() {
    var p = T.parts(V.trip.start);
    var d = new Date(p.time - (FORECAST_DAYS - 1) * 86400000);
    return d.toISOString().slice(0, 10);
  }
  function inRange() {
    var t = T.realTokyoToday();
    var last = new Date(T.parts(t).time + (FORECAST_DAYS - 1) * 86400000).toISOString().slice(0, 10);
    return t <= V.trip.end && last >= V.trip.start;
  }

  function fetchAll() {
    if (!inRange()) return;
    var chs = V.chapters;
    var url = "https://api.open-meteo.com/v1/forecast?latitude=" + chs.map(function (c) { return c.sky.lat; }).join(",") +
      "&longitude=" + chs.map(function (c) { return c.sky.lng; }).join(",") +
      "&daily=weather_code,temperature_2m_max,temperature_2m_min,precipitation_probability_max" +
      "&timezone=Asia%2FTokyo&forecast_days=" + FORECAST_DAYS;
    fetch(url).then(function (r) {
      if (!r.ok) throw new Error("HTTP " + r.status);
      return r.json();
    }).then(function (json) {
      var arr = Array.isArray(json) ? json : [json];
      var by = {};
      chs.forEach(function (c, i) {
        var d = arr[i] && arr[i].daily;
        if (!d) return;
        by[c.id] = {};
        d.time.forEach(function (date, k) {
          by[c.id][date] = {
            code: d.weather_code[k],
            tmax: d.temperature_2m_max[k],
            tmin: d.temperature_2m_min[k],
            pp: d.precipitation_probability_max ? d.precipitation_probability_max[k] : null
          };
        });
      });
      data = { at: Date.now(), byChapter: by };
      save();
      document.dispatchEvent(new CustomEvent("tokyo:meteo"));
    }).catch(function () { /* offline: restano le previsioni salvate */ });
  }

  // Previsione per un giorno del viaggio (null se non disponibile)
  function forDate(date) {
    var day = V.days.filter(function (d) { return d.date === date; })[0];
    if (!day) return null;
    var f = data.byChapter && data.byChapter[day.chapter] && data.byChapter[day.chapter][date];
    if (!f || f.code === null || f.code === undefined) return null;
    var kind = kindOf(f.code);
    var wet = kind === "rain" || kind === "snow" || (typeof f.pp === "number" && f.pp >= 60);
    return {
      kind: kind, label: LABEL[kind], icon: ICONS[kind],
      tmax: Math.round(f.tmax), tmin: Math.round(f.tmin),
      pp: typeof f.pp === "number" ? Math.round(f.pp) : null,
      wet: wet
    };
  }

  function mini(date) {
    var f = forDate(date);
    if (!f) return "";
    return '<span class="wx-mini' + (f.wet ? " is-wet" : "") + '" title="' + f.label + '">' + f.icon +
      "<span>" + f.tmin + "°/" + f.tmax + "°</span></span>";
  }

  window.TripWeather = {
    forDate: forDate, mini: mini, firstForecastDate: firstForecastDate,
    savedAt: function () { return data.at; }
  };

  if (!data.at || Date.now() - data.at > MAX_AGE) fetchAll();
})();
