/* ==========================================================================
   Viaggio — l'itinerario dei 13 giorni
   Ogni giorno si apre e si chiude. Le note restano salvate sul telefono.
   ========================================================================== */
(function () {
  "use strict";

  var T = window.TokyoApp;
  var V = window.VIAGGIO;
  var DAYS = V.days;
  var esc = T.esc;
  var state = T.loadState();
  var MOOD = { leggera: "Giornata leggera", piena: "Giornata piena", jolly: "Giorno jolly" };
  var CHEV = '<svg class="trip-chev" viewBox="0 0 16 16" aria-hidden="true"><path fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" d="M4 6l4 4 4-4"/></svg>';
  var PIN_SVG = '<svg viewBox="0 0 16 16" aria-hidden="true"><path fill="currentColor" d="M8 1.5a4.5 4.5 0 0 0-4.5 4.5c0 3.2 4.5 8.5 4.5 8.5s4.5-5.3 4.5-8.5A4.5 4.5 0 0 0 8 1.5zm0 6.2a1.7 1.7 0 1 1 0-3.4 1.7 1.7 0 0 1 0 3.4z"/></svg>';

  var list = document.getElementById("trip-list");
  var today = T.tokyoToday();

  function isStamped(iso) { return state.stamps.indexOf(iso) !== -1; }

  function render() {
    list.innerHTML = DAYS.map(function (d, i) {
      var p = T.parts(d.date);
      var isToday = d.date === today;
      var bodyId = "body-" + d.date;
      return '<article class="trip-day' + (isToday ? " is-today" : "") + '" id="d-' + d.date + '">' +
        '<button type="button" class="trip-day-head" aria-expanded="false" aria-controls="' + bodyId + '">' +
          '<span class="trip-date"><span class="trip-wd">' + T.WD_SHORT[p.wd] + '</span><span class="trip-num">' + p.d + "</span></span>" +
          "<span>" +
            '<span class="trip-title">' + esc(d.title) + "</span>" +
            '<span class="trip-meta"><i class="mood-dot mood-' + d.mood + '" aria-hidden="true"></i>' + MOOD[d.mood] +
              (isToday ? '<span class="today-tag">oggi</span>' : "") + "</span>" +
          "</span>" +
          '<span class="seal' + (isStamped(d.date) ? " is-stamped" : "") + '" lang="ja" aria-label="' +
            (isStamped(d.date) ? "Timbro preso" : "Timbro non ancora preso") + '">' + esc(d.kanji) + "</span>" +
          CHEV +
        "</button>" +
        '<div class="trip-day-body" id="' + bodyId + '" hidden>' +
          '<ol class="moments">' + d.parts.map(function (part) {
            return '<li><span class="moment-when">' + esc(part.when) + '</span><span class="moment-what">' + esc(part.what) + "</span></li>";
          }).join("") + "</ol>" +
          '<p class="day-tip">' + esc(d.tip) + "</p>" +
          (d.maps.length
            ? '<div class="places"><p class="places-title">Apri in Google Maps</p><div class="places-row">' +
              d.maps.map(function (m) {
                return '<a class="place" href="' + T.mapsUrl(m.q) + '" target="_blank" rel="noopener">' + PIN_SVG + esc(m.label) + "</a>";
              }).join("") + "</div></div>"
            : "") +
          (d.links.length
            ? '<div class="sheet-links">' + d.links.map(function (l) {
                return '<a class="t-btn" href="' + esc(l.href) + '">' + esc(l.label) + "</a>";
              }).join("") + "</div>"
            : "") +
          '<button type="button" class="phrase-card" data-phrase="' + i + '">' +
            '<span class="phrase-card-jp" lang="ja">' + esc(d.phrase.jp) + "</span>" +
            '<span class="phrase-card-romaji">' + esc(d.phrase.romaji) + "</span>" +
            '<span class="phrase-card-it">' + esc(d.phrase.it) + "</span>" +
            '<span class="phrase-card-hint">Tocca per mostrarla a tutto schermo</span>' +
          "</button>" +
          '<div class="trip-note">' +
            '<label for="note-' + d.date + '">Le vostre note per questo giorno</label>' +
            '<textarea id="note-' + d.date + '" data-note="' + d.date + '" placeholder="Es. prenotare il ristorante, cose da comprare...">' +
              esc(state.notes[d.date] || "") + "</textarea>" +
            '<span class="note-saved" aria-live="polite"></span>' +
          "</div>" +
        "</div>" +
      "</article>";
    }).join("");
  }

  function setOpen(article, open) {
    var head = article.querySelector(".trip-day-head");
    var body = article.querySelector(".trip-day-body");
    head.setAttribute("aria-expanded", open ? "true" : "false");
    body.hidden = !open;
  }

  list.addEventListener("click", function (e) {
    var head = e.target.closest(".trip-day-head");
    if (head) {
      var art = head.closest(".trip-day");
      setOpen(art, head.getAttribute("aria-expanded") !== "true");
      return;
    }
    var phrase = e.target.closest("[data-phrase]");
    if (phrase) T.openShow(DAYS[parseInt(phrase.dataset.phrase, 10)].phrase, phrase);
  });

  var saveTimers = {};
  list.addEventListener("input", function (e) {
    var ta = e.target.closest("[data-note]");
    if (!ta) return;
    var iso = ta.dataset.note;
    var hint = ta.parentNode.querySelector(".note-saved");
    clearTimeout(saveTimers[iso]);
    saveTimers[iso] = setTimeout(function () {
      state = T.loadState();
      var v = ta.value.trim();
      if (v) state.notes[iso] = ta.value; else delete state.notes[iso];
      T.saveState(state);
      hint.textContent = "Nota salvata sul telefono";
      setTimeout(function () { hint.textContent = ""; }, 1800);
    }, 450);
  });

  render();

  // Apre il giorno richiesto (link da Oggi), altrimenti oggi, altrimenti il primo giorno
  var target = location.hash.replace("#", "");
  var art = (target && document.getElementById(target)) ||
            document.querySelector(".trip-day.is-today") ||
            document.querySelector(".trip-day");
  if (art) {
    setOpen(art, true);
    if (target || art.classList.contains("is-today")) {
      setTimeout(function () { art.scrollIntoView({ block: "start", behavior: "auto" }); }, 50);
    }
  }
})();
