/* ==========================================================================
   Oggi — il calendario del viaggio
   Le caselle si aprono un giorno alla volta (ora di Tokyo).
   A fine giornata si prende il timbro, che finisce nell'album.
   ========================================================================== */
(function () {
  "use strict";

  var T = window.TokyoApp;
  var V = window.VIAGGIO;
  var DAYS = V.days;
  var TRIP = V.trip;
  var esc = T.esc;
  var state = T.loadState();
  var lastOpener = null;

  var MOOD = { leggera: "Giornata leggera", piena: "Giornata piena", jolly: "Giorno jolly" };
  var ROT = [-8, 6, -4, 9, -10, 3, -6, 8, -3, 5, -9, 4, -5];
  var LOCK_SVG = '<svg class="door-lock" viewBox="0 0 12 12" aria-hidden="true"><path fill="currentColor" d="M3.5 5V3.6a2.5 2.5 0 0 1 5 0V5H9a1 1 0 0 1 1 1v4.5a1 1 0 0 1-1 1H3a1 1 0 0 1-1-1V6a1 1 0 0 1 1-1zm1.2 0h2.6V3.6a1.3 1.3 0 0 0-2.6 0z"/></svg>';
  var PIN_SVG = '<svg viewBox="0 0 16 16" aria-hidden="true"><path fill="currentColor" d="M8 1.5a4.5 4.5 0 0 0-4.5 4.5c0 3.2 4.5 8.5 4.5 8.5s4.5-5.3 4.5-8.5A4.5 4.5 0 0 0 8 1.5zm0 6.2a1.7 1.7 0 1 1 0-3.4 1.7 1.7 0 0 1 0 3.4z"/></svg>';

  function $(sel) { return document.querySelector(sel); }
  function cap(s) { return s.charAt(0).toUpperCase() + s.slice(1); }
  function today() { return T.tokyoToday(); }
  function dayByDate(iso) { return DAYS.filter(function (d) { return d.date === iso; })[0]; }
  function dayNumber(iso) { return T.daysBetween(TRIP.start, iso) + 1; }
  function isUnlocked(d) { return d.date <= today(); }
  function isStamped(iso) { return state.stamps.indexOf(iso) !== -1; }
  function isOpened(iso) { return state.opened.indexOf(iso) !== -1 || isStamped(iso); }
  function stampCount() { return DAYS.filter(function (d) { return isStamped(d.date); }).length; }

  function markOpened(iso) {
    if (state.opened.indexOf(iso) === -1) { state.opened.push(iso); T.saveState(state); }
  }

  /* ---------- Parte alta: saluto, orologi, titolo ---------- */
  function renderTop() {
    var h = T.tokyoHour();
    var g = h >= 5 && h < 11 ? ["おはよう", "Buongiorno"]
          : h >= 11 && h < 18 ? ["こんにちは", "Buon pomeriggio"]
          : ["こんばんは", "Buonasera"];
    $("#greet-jp").textContent = g[0];
    $("#greet-it").textContent = g[1];
    $("#clock-tokyo").textContent = T.clock("Asia/Tokyo");
    $("#clock-italy").textContent = T.clock("Europe/Rome");

    var t = today();
    var title, sub;
    if (t < TRIP.start) {
      var n = T.daysBetween(t, TRIP.start);
      title = n === 1 ? "Domani si parte" : "Mancano " + n + " giorni";
      sub = "Le caselle si aprono una al giorno, dal 14 al 26 dicembre. Intanto il programma completo è nella scheda Viaggio.";
    } else if (t > TRIP.end) {
      title = "Bentornati a casa";
      sub = "Avete raccolto " + stampCount() + " timbri su " + DAYS.length + ". Le caselle restano aperte per ricordare il viaggio.";
    } else {
      var d = dayByDate(t);
      title = "Giorno " + dayNumber(t) + " di " + DAYS.length;
      sub = d.title + ". " + (isOpened(t) ? "Tocca la casella di oggi per rivedere il programma." : "Tocca la casella di oggi per aprirla.");
    }
    $("#sky-title").textContent = title;
    $("#sky-sub").textContent = sub;

    var sim = T.simDate();
    $("#sim-bar").hidden = !sim;
    if (sim) $("#sim-text").textContent = "Stai provando " + T.longDate(sim);
  }

  /* ---------- Caselle ---------- */
  function renderDoors() {
    var t = today();
    $("#doors").innerHTML = DAYS.map(function (d, i) {
      var p = T.parts(d.date);
      var last = i === DAYS.length - 1;
      var unlocked = d.date <= t;
      var isToday = d.date === t;
      var stamped = isStamped(d.date);
      var opened = isOpened(d.date);
      var cls = "door" + (unlocked ? "" : " is-locked") + (isToday ? " is-today" : "") +
        (opened ? " is-open" : "") + (stamped ? " is-stamped" : "");
      var label = cap(T.longDate(d.date)) + ": " + (unlocked ? d.title : "si apre quel giorno") +
        (stamped ? ", timbro preso" : "");
      var month = isToday ? "oggi" : last ? "dicembre, si torna a casa" : "dic";
      return '<div class="door-cell' + (last ? " is-last" : "") + '" role="listitem">' +
        '<button type="button" class="' + cls + '" data-date="' + d.date + '" aria-label="' + esc(label) + '">' +
          '<span class="door-back" aria-hidden="true"><span class="door-kanji" lang="ja">' + esc(d.kanji) + "</span></span>" +
          '<span class="door-front" aria-hidden="true">' +
            '<span class="door-wd">' + T.WD_SHORT[p.wd] + "</span>" +
            '<span class="door-num">' + p.d + "</span>" +
            '<span class="door-month">' + month + "</span>" +
            (unlocked ? "" : LOCK_SVG) +
          "</span>" +
        "</button></div>";
    }).join("");
  }

  function shake(btn) {
    btn.classList.remove("is-shaking");
    void btn.offsetWidth;
    btn.classList.add("is-shaking");
    btn.addEventListener("animationend", function () { btn.classList.remove("is-shaking"); }, { once: true });
  }

  function knockToday() {
    if (T.reduceMotion.matches) return;
    var btn = document.querySelector(".door.is-today:not(.is-open)");
    if (!btn) return;
    setTimeout(function () {
      btn.classList.add("is-knocking");
      btn.addEventListener("animationend", function () { btn.classList.remove("is-knocking"); }, { once: true });
    }, 700);
  }

  function onDoorClick(e) {
    var btn = e.target.closest(".door");
    if (!btn) return;
    var d = dayByDate(btn.dataset.date);
    if (!isUnlocked(d)) {
      shake(btn);
      T.toast("Questa casella si apre " + T.longDate(d.date) + ". Il programma è già nella scheda Viaggio.");
      return;
    }
    if (btn.classList.contains("is-open") || T.reduceMotion.matches) {
      markOpened(d.date);
      btn.classList.add("is-open");
      openSheet(d, btn);
      return;
    }
    btn.classList.add("is-opening");
    setTimeout(function () {
      markOpened(d.date);
      btn.classList.remove("is-opening");
      btn.classList.add("is-open");
      renderTop();
      openSheet(d, btn);
    }, 520);
  }

  /* ---------- Scheda del giorno ---------- */
  var sheet = $("#day-sheet");
  var sheetBody = $("#sheet-body");
  var currentDay = null;

  function renderSheet(d, justStamped) {
    var stamped = isStamped(d.date);
    var isToday = d.date === today();
    sheetBody.innerHTML =
      '<div class="sheet-handle" aria-hidden="true"></div>' +
      '<button type="button" class="sheet-close" data-action="close">Chiudi</button>' +
      '<div class="sheet-head">' +
        '<span class="seal' + (stamped ? " is-stamped" : "") + (justStamped ? " just-stamped" : "") +
          '" lang="ja" aria-hidden="true">' + esc(d.kanji) + "</span>" +
        "<div>" +
          '<p class="sheet-date">' + cap(T.longDate(d.date)) + ", giorno " + dayNumber(d.date) + " di " + DAYS.length + "</p>" +
          '<h2 id="sheet-title">' + esc(d.title) + "</h2>" +
          '<p class="sheet-kanji">Il timbro di oggi è <span lang="ja">' + esc(d.kanji) + "</span>: si legge " +
            esc(d.reading) + " e vuol dire " + esc(d.meaning) + ".</p>" +
          '<span class="mood-chip mood-' + d.mood + '">' + MOOD[d.mood] + "</span>" +
        "</div>" +
      "</div>" +
      '<ol class="moments">' + d.parts.map(function (p) {
        return '<li><span class="moment-when">' + esc(p.when) + '</span><span class="moment-what">' + esc(p.what) + "</span></li>";
      }).join("") + "</ol>" +
      '<p class="day-tip">' + esc(d.tip) + "</p>" +
      (d.maps.length
        ? '<div class="places"><p class="places-title">Apri in Google Maps</p><div class="places-row">' +
          d.maps.map(function (m) {
            return '<a class="place" href="' + T.mapsUrl(m.q) + '" target="_blank" rel="noopener">' + PIN_SVG + esc(m.label) + "</a>";
          }).join("") + "</div></div>"
        : "") +
      '<button type="button" class="phrase-card" data-action="phrase">' +
        '<span class="phrase-card-jp" lang="ja">' + esc(d.phrase.jp) + "</span>" +
        '<span class="phrase-card-romaji">' + esc(d.phrase.romaji) + "</span>" +
        '<span class="phrase-card-it">' + esc(d.phrase.it) + "</span>" +
        '<span class="phrase-card-hint">Frase del giorno: tocca per mostrarla a tutto schermo</span>' +
      "</button>" +
      (d.links.length
        ? '<div class="sheet-links">' + d.links.map(function (l) {
            return '<a class="t-btn" href="' + esc(l.href) + '">' + esc(l.label) + "</a>";
          }).join("") + "</div>"
        : "") +
      '<div class="sheet-foot">' +
        (stamped
          ? '<p class="stamp-done" role="status"><span class="seal seal-sm is-stamped" lang="ja" aria-hidden="true">' +
              esc(d.kanji) + "</span>Timbro preso</p>" +
            '<button type="button" class="t-link" data-action="unstamp">Togli il timbro</button>'
          : '<button type="button" class="t-btn t-btn-stamp" data-action="stamp">Prendi il timbro' +
              (isToday ? " di oggi" : "") + "</button>") +
        '<a class="t-link" href="/itinerario#d-' + d.date + '">Vedi nell\'itinerario</a>' +
      "</div>" +
      '<div class="stamp-fx" id="stamp-fx-live" aria-hidden="true" hidden><span lang="ja"></span></div>';
  }

  function openSheet(d, opener) {
    currentDay = d;
    lastOpener = opener || null;
    renderSheet(d, false);
    if (typeof sheet.showModal === "function") {
      if (!sheet.open) sheet.showModal();
    } else {
      sheet.setAttribute("open", "");
    }
    sheet.scrollTop = 0;
  }

  function closeSheet() {
    if (typeof sheet.close === "function") sheet.close();
    else { sheet.removeAttribute("open"); afterClose(); }
  }

  function afterClose() {
    currentDay = null;
    if (lastOpener && document.body.contains(lastOpener)) lastOpener.focus();
  }

  function playStampFx(kanji) {
    if (T.reduceMotion.matches) return;
    var fx = document.getElementById("stamp-fx-live");
    if (!fx) return;
    fx.querySelector("span").textContent = kanji;
    fx.hidden = false;
    var span = fx.querySelector("span");
    span.addEventListener("animationend", function (e) {
      if (e.animationName === "stamp-out") fx.hidden = true;
    });
  }

  function stamp(d) {
    if (!isStamped(d.date)) state.stamps.push(d.date);
    if (state.opened.indexOf(d.date) === -1) state.opened.push(d.date);
    T.saveState(state);
    renderSheet(d, true);
    playStampFx(d.kanji);
    if (navigator.vibrate) navigator.vibrate(35);
    renderDoors();
    renderAlbum();
    renderTop();
  }

  function unstamp(d) {
    state.stamps = state.stamps.filter(function (iso) { return iso !== d.date; });
    T.saveState(state);
    renderSheet(d, false);
    renderDoors();
    renderAlbum();
    renderTop();
  }

  sheetBody.addEventListener("click", function (e) {
    var el = e.target.closest("[data-action]");
    if (!el || !currentDay) return;
    var a = el.dataset.action;
    if (a === "close") closeSheet();
    else if (a === "stamp") stamp(currentDay);
    else if (a === "unstamp") unstamp(currentDay);
    else if (a === "phrase") T.openShow(currentDay.phrase, el);
  });
  sheet.addEventListener("click", function (e) { if (e.target === sheet) closeSheet(); });
  sheet.addEventListener("close", afterClose);

  /* ---------- Album dei timbri ---------- */
  function renderAlbum() {
    $("#album-count").textContent = stampCount() + " su " + DAYS.length;
    $("#album").innerHTML = DAYS.map(function (d, i) {
      var p = T.parts(d.date);
      if (isStamped(d.date)) {
        return '<button type="button" class="album-slot" data-date="' + d.date + '" aria-label="' +
          esc(cap(T.longDate(d.date)) + ": timbro " + d.kanji + ", " + d.title) + '">' +
          '<span class="seal is-stamped" style="--rot:' + ROT[i % ROT.length] + 'deg" lang="ja">' + esc(d.kanji) + "</span></button>";
      }
      return '<span class="album-slot" role="img" aria-label="' + esc(cap(T.longDate(d.date)) + ": ancora senza timbro") +
        '"><span class="album-empty">' + p.d + "</span></span>";
    }).join("");
  }

  $("#album").addEventListener("click", function (e) {
    var slot = e.target.closest("button.album-slot");
    if (slot) openSheet(dayByDate(slot.dataset.date), slot);
  });

  /* ---------- Installa sul telefono ---------- */
  function setupInstall() {
    var standalone = window.matchMedia("(display-mode: standalone)").matches || window.navigator.standalone === true;
    if (standalone) return;
    var section = $("#install"), btn = $("#btn-install"), text = $("#install-text");
    var ua = navigator.userAgent;
    var isIOS = /iphone|ipad|ipod/i.test(ua) || (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1);
    if (isIOS) {
      section.hidden = false;
      text.textContent = "Su iPhone apri questa pagina con Safari, tocca il pulsante Condividi (il quadrato con la freccia verso l'alto) e scegli \"Aggiungi alla schermata Home\".";
    }
    function enable() { section.hidden = false; btn.hidden = false; }
    if (window.__installPrompt) enable();
    document.addEventListener("tokyo:installable", enable);
    btn.addEventListener("click", function () {
      var p = window.__installPrompt;
      if (!p) return;
      p.prompt();
      p.userChoice.then(function () {
        window.__installPrompt = null;
        btn.hidden = true;
      });
    });
    window.addEventListener("appinstalled", function () {
      section.hidden = true;
      T.toast("App installata: la trovi nella schermata Home");
    });
  }

  /* ---------- Prova un giorno ---------- */
  function refreshAll() {
    renderTop();
    renderDoors();
    renderAlbum();
    knockToday();
  }

  $("#sim-apply").addEventListener("click", function () {
    var v = $("#sim-date").value;
    if (!v) return;
    T.setSimDate(v);
    document.querySelector(".sim").open = false;
    refreshAll();
    window.scrollTo({ top: 0, behavior: T.reduceMotion.matches ? "auto" : "smooth" });
  });
  $("#sim-exit").addEventListener("click", function () {
    T.setSimDate(null);
    refreshAll();
  });

  $("#doors").addEventListener("click", onDoorClick);

  /* ---------- Avvio ---------- */
  refreshAll();
  setupInstall();

  var lastDay = today();
  setInterval(function () {
    renderTop();
    if (today() !== lastDay) { lastDay = today(); renderDoors(); renderAlbum(); }
  }, 30000);
})();
