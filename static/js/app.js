/* ==========================================================================
   Tokyo 2026 — parti comuni a tutte le pagine
   - salva l'app sul telefono per l'uso offline (service worker)
   - avvisa quando c'è una nuova versione
   - mostra "Sei offline"
   - piccoli aiuti usati da Oggi e Itinerario (window.TokyoApp)
   ========================================================================== */
(function () {
  "use strict";

  /* ---------- Offline e aggiornamenti ---------- */
  if ("serviceWorker" in navigator) {
    window.addEventListener("load", function () {
      var userAskedUpdate = false;

      navigator.serviceWorker.register("/sw.js").then(function (reg) {
        navigator.serviceWorker.ready.then(function (r) { if (r.active) r.active.postMessage("WARM"); });
        function offerUpdate(worker) {
          var bar = document.getElementById("update-bar");
          if (!bar) return;
          bar.hidden = false;
          document.getElementById("btn-update").onclick = function () {
            userAskedUpdate = true;
            worker.postMessage("SKIP_WAITING");
          };
        }
        if (reg.waiting && navigator.serviceWorker.controller) offerUpdate(reg.waiting);
        reg.addEventListener("updatefound", function () {
          var w = reg.installing;
          if (!w) return;
          w.addEventListener("statechange", function () {
            if (w.state === "installed" && navigator.serviceWorker.controller) offerUpdate(w);
          });
        });
        // Controlla se c'è una versione nuova ogni volta che l'app torna in primo piano
        document.addEventListener("visibilitychange", function () {
          if (document.visibilityState === "visible") reg.update().catch(function () {});
        });
      }).catch(function () { /* il browser non permette l'offline: l'app funziona online */ });

      navigator.serviceWorker.addEventListener("controllerchange", function () {
        if (userAskedUpdate) location.reload();
      });
    });
  }

  var pill = document.getElementById("offline-pill");
  function updateOnline() { if (pill) pill.hidden = navigator.onLine; }
  window.addEventListener("online", updateOnline);
  window.addEventListener("offline", updateOnline);
  updateOnline();

  // Su Android il browser propone l'installazione: teniamo l'evento per il pulsante "Installa"
  window.addEventListener("beforeinstallprompt", function (e) {
    e.preventDefault();
    window.__installPrompt = e;
    document.dispatchEvent(new CustomEvent("tokyo:installable"));
  });

  /* ---------- Aiuti condivisi ---------- */
  var STATE_KEY = "tokyo-viaggio-v1";
  var SIM_KEY = "tokyo-sim-date";
  var SANDBOX_KEY = "tokyo-viaggio-prova";   // caselle e timbri della modalità prova
  var WD_LONG = ["domenica", "lunedì", "martedì", "mercoledì", "giovedì", "venerdì", "sabato"];
  var WD_SHORT = ["dom", "lun", "mar", "mer", "gio", "ven", "sab"];
  var MONTHS = ["gennaio", "febbraio", "marzo", "aprile", "maggio", "giugno", "luglio",
                "agosto", "settembre", "ottobre", "novembre", "dicembre"];

  function esc(s) {
    return String(s == null ? "" : s)
      .replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;").replace(/'/g, "&#39;");
  }

  function parts(iso) {
    var p = iso.split("-").map(Number);
    var d = new Date(Date.UTC(p[0], p[1] - 1, p[2]));
    return { y: p[0], m: p[1], d: p[2], wd: d.getUTCDay(), time: d.getTime() };
  }
  function daysBetween(a, b) { return Math.round((parts(b).time - parts(a).time) / 86400000); }

  function realTokyoToday() {
    return new Intl.DateTimeFormat("en-CA", {
      timeZone: "Asia/Tokyo", year: "numeric", month: "2-digit", day: "2-digit"
    }).format(new Date());
  }
  function simDate() {
    try { return sessionStorage.getItem(SIM_KEY); } catch (e) { return null; }
  }
  function setSimDate(iso) {
    try {
      if (iso) {
        if (!sessionStorage.getItem(SIM_KEY)) {
          var real = readReal();
          sessionStorage.setItem(SANDBOX_KEY, JSON.stringify({ opened: real.opened, stamps: real.stamps }));
        }
        sessionStorage.setItem(SIM_KEY, iso);
      } else {
        sessionStorage.removeItem(SIM_KEY);
        sessionStorage.removeItem(SANDBOX_KEY);
      }
    } catch (e) { /* ignora */ }
  }
  function tokyoToday() { return simDate() || realTokyoToday(); }

  function clock(tz) {
    return new Intl.DateTimeFormat("it-IT", { timeZone: tz, hour: "2-digit", minute: "2-digit" }).format(new Date());
  }
  function tokyoHour() {
    return parseInt(new Intl.DateTimeFormat("en-GB", { timeZone: "Asia/Tokyo", hour: "2-digit", hourCycle: "h23" }).format(new Date()), 10);
  }

  function longDate(iso) {
    var p = parts(iso);
    return WD_LONG[p.wd] + " " + p.d + " " + MONTHS[p.m - 1];
  }

  function cleanList(v) { return Array.isArray(v) ? v.filter(function (x) { return typeof x === "string"; }) : []; }

  // Situazione vera, salvata sul telefono. I giorni che nella realtà non sono ancora
  // arrivati non possono essere aperti: se ci sono, vengono da una prova e si tolgono.
  function obj(v) { return v && typeof v === "object" && !Array.isArray(v) ? v : {}; }

  function readReal() {
    var base = { opened: [], stamps: [], notes: {}, choices: {}, likes: {}, done: {} };
    try {
      var s = JSON.parse(localStorage.getItem(STATE_KEY) || "null");
      if (s && typeof s === "object") {
        base.opened = cleanList(s.opened);
        base.stamps = cleanList(s.stamps);
        base.notes = obj(s.notes);
        base.choices = obj(s.choices);   // giorno -> piano scelto
        base.likes = obj(s.likes);       // piano -> true (cuore)
        base.done = obj(s.done);         // cose da prenotare già fatte
      }
    } catch (e) { /* memoria non disponibile: si riparte vuoti */ }
    var today = realTokyoToday();
    var before = base.opened.length + base.stamps.length;
    base.opened = base.opened.filter(function (d) { return d <= today; });
    base.stamps = base.stamps.filter(function (d) { return d <= today; });
    if (base.opened.length + base.stamps.length !== before) writeReal(base);
    return base;
  }
  function writeReal(state) {
    try { localStorage.setItem(STATE_KEY, JSON.stringify(state)); } catch (e) { /* ignora */ }
  }

  function isPreview() { return !!simDate(); }

  function loadState() {
    var real = readReal();
    if (!isPreview()) return real;
    var box = { opened: [], stamps: [] };
    try { box = JSON.parse(sessionStorage.getItem(SANDBOX_KEY) || "null") || box; } catch (e) { /* ignora */ }
    return { opened: cleanList(box.opened), stamps: cleanList(box.stamps),
             notes: real.notes, choices: real.choices, likes: real.likes, done: real.done };
  }
  // Scelte, cuori, note e prenotazioni sono "pianificazione": restano salvate anche in modalità prova.
  // Solo caselle e timbri della prova vengono buttati via.
  function saveState(state) {
    var real = readReal();
    real.notes = state.notes || real.notes;
    real.choices = state.choices || real.choices;
    real.likes = state.likes || real.likes;
    real.done = state.done || real.done;
    if (isPreview()) {
      try { sessionStorage.setItem(SANDBOX_KEY, JSON.stringify({ opened: state.opened, stamps: state.stamps })); }
      catch (e) { /* ignora */ }
    } else {
      real.opened = state.opened;
      real.stamps = state.stamps;
    }
    writeReal(real);
  }

  function mapsUrl(q) {
    return "https://www.google.com/maps/search/?api=1&query=" + encodeURIComponent(q);
  }

  /* Avviso breve in basso */
  var toastEl = null, toastTimer = null;
  function toast(msg) {
    if (!toastEl) {
      toastEl = document.createElement("div");
      toastEl.className = "t-toast";
      toastEl.setAttribute("role", "status");
      document.body.appendChild(toastEl);
    }
    toastEl.textContent = msg;
    toastEl.hidden = false;
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function () { toastEl.hidden = true; }, 2600);
  }

  /* Frase a tutto schermo, da mostrare a chi non parla italiano */
  var showEl = null, showOpener = null;
  function closeShow() {
    if (!showEl) return;
    showEl.hidden = true;
    document.body.style.overflow = "";
    if (showOpener) showOpener.focus();
  }
  function openShow(item, opener) {
    if (!showEl) {
      showEl = document.createElement("div");
      showEl.className = "t-show";
      showEl.setAttribute("role", "dialog");
      showEl.setAttribute("aria-modal", "true");
      showEl.innerHTML = '<button type="button" class="t-show-close">Chiudi</button>' +
        '<div class="t-show-body"><p class="t-show-jp" lang="ja"></p><p class="t-show-romaji"></p><p class="t-show-it"></p></div>';
      document.body.appendChild(showEl);
      showEl.querySelector(".t-show-close").addEventListener("click", closeShow);
      showEl.addEventListener("click", function (e) { if (e.target === showEl) closeShow(); });
      document.addEventListener("keydown", function (e) {
        if (e.key === "Escape" && !showEl.hidden) { e.preventDefault(); closeShow(); }
      });
    }
    // Se è aperta una scheda (dialog), la frase va dentro la scheda per stare sopra
    var host = document.querySelector("dialog[open]") || document.body;
    if (showEl.parentNode !== host) host.appendChild(showEl);
    showOpener = opener || null;
    showEl.querySelector(".t-show-jp").textContent = item.jp;
    showEl.querySelector(".t-show-romaji").textContent = item.romaji || "";
    showEl.querySelector(".t-show-it").textContent = item.it || "";
    showEl.hidden = false;
    document.body.style.overflow = "hidden";
    showEl.querySelector(".t-show-close").focus();
  }

  /* ---------- Copia di sicurezza ---------- */
  var BACKUP_KEYS = [STATE_KEY, "spesa-bimbe-v1", "tokyo-frasi-v1", "tokyo-sos-v1"];
  function exportData() {
    var data = { app: "tokyo2026", v: 1, saved: new Date().toISOString(), keys: {} };
    BACKUP_KEYS.forEach(function (k) {
      try { var v = localStorage.getItem(k); if (v) data.keys[k] = JSON.parse(v); } catch (e) { /* ignora */ }
    });
    return data;
  }
  function importData(obj) {
    if (!obj || obj.app !== "tokyo2026" || !obj.keys || typeof obj.keys !== "object") throw new Error("copia non valida");
    BACKUP_KEYS.forEach(function (k) {
      if (obj.keys[k]) localStorage.setItem(k, JSON.stringify(obj.keys[k]));
    });
  }
  function backupLink() {
    return location.origin + "/#copia=" + encodeURIComponent(JSON.stringify(exportData()));
  }
  function readBackupHash(hash) {
    if (!hash || hash.indexOf("#copia=") !== 0) return null;
    try { return JSON.parse(decodeURIComponent(hash.slice(7))); } catch (e) { return null; }
  }

  window.TokyoApp = {
    exportData: exportData, importData: importData, backupLink: backupLink, readBackupHash: readBackupHash,
    esc: esc, parts: parts, daysBetween: daysBetween,
    tokyoToday: tokyoToday, realTokyoToday: realTokyoToday,
    simDate: simDate, setSimDate: setSimDate, isPreview: isPreview,
    clock: clock, tokyoHour: tokyoHour, longDate: longDate,
    WD_LONG: WD_LONG, WD_SHORT: WD_SHORT, MONTHS: MONTHS,
    loadState: loadState, saveState: saveState,
    mapsUrl: mapsUrl, toast: toast, openShow: openShow,
    reduceMotion: window.matchMedia("(prefers-reduced-motion: reduce)")
  };
})();
