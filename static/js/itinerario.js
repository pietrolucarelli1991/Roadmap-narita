/* ==========================================================================
   Viaggio — il planner dei 23 giorni
   Ogni giorno: uno o più piani. Si confrontano, si mette il cuore, si sceglie.
   ========================================================================== */
(function () {
  "use strict";

  var T = window.TokyoApp;
  var P = window.Planner;
  var V = window.VIAGGIO;
  var esc = T.esc;
  var state = T.loadState();
  var today = T.tokyoToday();

  var list = document.getElementById("trip-list");
  var sheet = document.getElementById("day-sheet");
  var body = document.getElementById("sheet-body");
  var current = { date: null, planId: null, opener: null };

  function $(sel) { return document.querySelector(sel); }
  function save() { T.saveState(state); }
  function isStamped(date) { return state.stamps.indexOf(date) !== -1; }
  function anyLiked(date) { return P.plansFor(date).some(function (p) { return state.likes[p.id]; }); }
  function shortDate(date) {
    var p = T.parts(date);
    return T.WD_LONG[p.wd] + " " + p.d + " " + T.MONTHS[p.m - 1];
  }

  /* ---------- Lista ---------- */
  function rowHtml(d) {
    var p = T.parts(d.date);
    var chosen = P.chosenPlan(d.date, state);
    var warn = P.warnings(d.date, chosen, state);
    var multi = d.plans.length > 1;
    var meta = multi
      ? "Piano " + P.letterOf(d.date, chosen.id) + " di " + d.plans.length
      : (P.KIND[chosen.kind] || "Giornata");
    return '<li class="trip-day' + (d.date === today ? " is-today" : "") + '" id="d-' + d.date + '">' +
      '<button type="button" class="trip-day-head" data-date="' + d.date + '">' +
        '<span class="trip-date"><span class="trip-wd">' + T.WD_SHORT[p.wd] + '</span><span class="trip-num">' + p.d + "</span>" +
          (p.m === 1 ? '<span class="trip-month">gen</span>' : "") + "</span>" +
        '<span class="trip-main">' +
          '<span class="trip-title">' + esc(chosen.title) + "</span>" +
          '<span class="trip-meta">' +
            "<span>" + esc(meta) + "</span>" +
            (d.date === today ? '<span class="today-tag">oggi</span>' : "") +
            (chosen.treasure ? '<span class="mini-tag tag-treasure">tesoro</span>' : "") +
            (!chosen.complete ? '<span class="mini-tag tag-soon">dettagli in arrivo</span>' : "") +
            (warn.length ? '<span class="mini-tag tag-warn">' + warn.length + (warn.length === 1 ? " avviso" : " avvisi") + "</span>" : "") +
            (anyLiked(d.date) ? '<span class="mini-heart" aria-label="Avete messo un cuore">♥</span>' : "") +
          "</span>" +
        "</span>" +
        '<span class="seal' + (isStamped(d.date) ? " is-stamped" : "") + '" lang="ja" aria-hidden="true">' + esc(chosen.kanji) + "</span>" +
      "</button></li>";
  }

  function render() {
    list.innerHTML = V.chapters.map(function (c) {
      var days = V.days.filter(function (d) { return d.chapter === c.id; });
      var a = T.parts(c.start), b = T.parts(c.end);
      return '<section class="chapter" aria-labelledby="ch-' + c.id + '">' +
        '<header class="chapter-head">' +
          '<span class="chapter-glyph" lang="ja" aria-hidden="true">' + esc(c.glyph) + "</span>" +
          "<div>" +
            '<h2 id="ch-' + c.id + '">' + esc(c.title) + "</h2>" +
            '<p class="chapter-sub">' + esc(c.subtitle) + ", dal " + a.d + " " + T.MONTHS[a.m - 1] + " al " + b.d + " " + T.MONTHS[b.m - 1] + "</p>" +
            '<p class="chapter-hotel">' + esc(c.hotel) + ' <a href="' + T.mapsUrl(c.address_jp) + '" target="_blank" rel="noopener">mappa</a></p>' +
            (c.hotel_note ? '<p class="chapter-note">' + esc(c.hotel_note) + "</p>" : "") +
          "</div>" +
        "</header>" +
        '<ol class="chapter-days">' + days.map(rowHtml).join("") + "</ol>" +
      "</section>";
    }).join("");
    updateShare();
  }

  /* ---------- Scheda del giorno ---------- */
  function renderSheet() {
    var d = P.day(current.date);
    var plans = P.plansFor(current.date);
    var chapter = P.chapter(d.chapter);
    var plan = P.plan(current.planId) || P.chosenPlan(current.date, state);
    var idx = P.dayIndex(current.date);

    body.innerHTML =
      '<div class="sheet-handle" aria-hidden="true"></div>' +
      '<button type="button" class="sheet-close" data-action="close">Chiudi</button>' +
      '<div class="sheet-top">' +
        '<p class="sheet-date">' + P.cap(shortDate(current.date)) + ", giorno " + (idx + 1) + " di " + V.days.length + "</p>" +
        '<h2 id="sheet-title">' + esc(chapter.title) + ": " + esc(chapter.subtitle.charAt(0).toLowerCase() + chapter.subtitle.slice(1)) + "</h2>" +
        (d.note ? '<p class="sheet-note">' + esc(d.note) + "</p>" : "") +
      "</div>" +
      (plans.length > 1
        ? '<div class="plan-tabs" role="tablist" aria-label="Piani per questo giorno">' + plans.map(function (p) {
            var on = p.id === plan.id;
            var isChosen = P.chosenId(current.date, state) === p.id;
            return '<button type="button" role="tab" class="plan-tab' + (on ? " is-active" : "") + '" aria-selected="' + on + '" data-tab="' + p.id + '">' +
              '<span class="plan-tab-letter">' + P.letterOf(current.date, p.id) + "</span>" +
              '<span class="plan-tab-title">' + esc(p.title) + "</span>" +
              '<span class="plan-tab-badges">' +
                (isChosen ? '<span class="plan-tab-chosen">scelto</span>' : "") +
                (state.likes[p.id] ? '<span class="plan-tab-heart" aria-label="Ci piace">♥</span>' : "") +
              "</span>" +
              "</button>";
          }).join("") + "</div>"
        : "") +
      P.renderPlan(plan, current.date, state) +
      '<div class="trip-note">' +
        '<label for="note-field">Le vostre note per ' + esc(shortDate(current.date)) + "</label>" +
        '<textarea id="note-field" data-note="' + current.date + '" placeholder="Es. prenotare il ristorante, cose da comprare...">' +
          esc(state.notes[current.date] || "") + "</textarea>" +
        '<span class="note-saved" aria-live="polite"></span>' +
      "</div>";
  }

  function openDay(date, opener, planId) {
    if (!P.day(date)) return;
    current = { date: date, planId: planId || P.chosenId(date, state), opener: opener || null };
    renderSheet();
    if (typeof sheet.showModal === "function") { if (!sheet.open) sheet.showModal(); }
    else sheet.setAttribute("open", "");
    sheet.scrollTop = 0;
    if (history.replaceState) history.replaceState(null, "", "#d-" + date);
  }

  function closeDay() {
    if (typeof sheet.close === "function") sheet.close();
    else { sheet.removeAttribute("open"); afterClose(); }
  }
  function afterClose() {
    var openerDate = current.opener && current.opener.dataset ? current.opener.dataset.date : null;
    current = { date: null, planId: null, opener: null };
    if (history.replaceState) history.replaceState(null, "", location.pathname);
    render();
    var row = openerDate && document.querySelector('.trip-day-head[data-date="' + openerDate + '"]');
    if (row) row.focus();
  }

  /* ---------- Azioni ---------- */
  body.addEventListener("click", function (e) {
    var t;
    if ((t = e.target.closest('[data-action="close"]'))) { closeDay(); return; }
    if ((t = e.target.closest("[data-tab]"))) {
      current.planId = t.dataset.tab;
      renderSheet();
      return;
    }
    if ((t = e.target.closest("[data-choose]"))) {
      state = T.loadState();
      state.choices[current.date] = t.dataset.choose;
      save();
      renderSheet();
      T.toast("Scelto: " + P.plan(t.dataset.choose).title);
      return;
    }
    if ((t = e.target.closest("[data-like]"))) {
      state = T.loadState();
      var id = t.dataset.like;
      if (state.likes[id]) delete state.likes[id]; else state.likes[id] = true;
      save();
      renderSheet();
      return;
    }
    if ((t = e.target.closest("[data-phrase]"))) {
      T.openShow(P.plan(t.dataset.phrase).phrase, t);
    }
  });

  var noteTimer = null;
  body.addEventListener("input", function (e) {
    var ta = e.target.closest("[data-note]");
    if (!ta) return;
    clearTimeout(noteTimer);
    noteTimer = setTimeout(function () {
      state = T.loadState();
      if (ta.value.trim()) state.notes[ta.dataset.note] = ta.value; else delete state.notes[ta.dataset.note];
      save();
      var hint = body.querySelector(".note-saved");
      if (hint) {
        hint.textContent = "Nota salvata sul telefono";
        setTimeout(function () { hint.textContent = ""; }, 1800);
      }
    }, 450);
  });

  sheet.addEventListener("click", function (e) { if (e.target === sheet) closeDay(); });
  sheet.addEventListener("close", afterClose);

  list.addEventListener("click", function (e) {
    var b = e.target.closest(".trip-day-head");
    if (b) openDay(b.dataset.date, b);
  });

  /* ---------- Condivisione ---------- */
  function updateShare() {
    var link = P.shareLink(state);
    var n = Object.keys(state.choices).length;
    var text = "Le nostre scelte per il viaggio (" + n + (n === 1 ? " giorno scelto" : " giorni scelti") +
      "). Apri il link per vederle nell'app:\n" + link;
    $("#btn-share").href = "https://wa.me/?text=" + encodeURIComponent(text);
  }

  function importShared() {
    var shared = P.readShared(location.hash);
    if (!shared) return false;
    var n = Object.keys(shared.choices).length;
    if (history.replaceState) history.replaceState(null, "", location.pathname);
    var ok = window.confirm("Hai ricevuto delle scelte per il viaggio (" + n + " giorni). Vuoi copiarle in questa app? Le tue scelte per quei giorni verranno sostituite.");
    if (!ok) return true;
    state = T.loadState();
    Object.keys(shared.choices).forEach(function (date) { state.choices[date] = shared.choices[date]; });
    Object.keys(shared.likes).forEach(function (id) { state.likes[id] = true; });
    save();
    render();
    T.toast("Scelte importate");
    return true;
  }

  /* ---------- Avvio ---------- */
  render();
  if (!importShared()) {
    var m = /^#d-(\d{4}-\d{2}-\d{2})$/.exec(location.hash);
    if (m) {
      var row = document.querySelector('.trip-day-head[data-date="' + m[1] + '"]');
      if (row) row.scrollIntoView({ block: "center" });
      openDay(m[1], row);
    } else {
      var t = document.querySelector(".trip-day.is-today");
      if (t) t.scrollIntoView({ block: "center" });
    }
  }
})();
