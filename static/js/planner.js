/* ==========================================================================
   Planner — parti comuni a Oggi e Viaggio
   - quale piano è scelto per ogni giorno
   - avvisi: posti chiusi quel giorno, piano scelto due volte
   - disegno della scheda di un piano
   - condivisione delle scelte via link
   ========================================================================== */
(function () {
  "use strict";

  var T = window.TokyoApp;
  var V = window.VIAGGIO;
  var esc = T.esc;
  var WD = ["dom", "lun", "mar", "mer", "gio", "ven", "sab"];
  var WD_NAME = { dom: "la domenica", lun: "il lunedì", mar: "il martedì", mer: "il mercoledì", gio: "il giovedì", ven: "il venerdì", sab: "il sabato" };
  var KIND = { fisso: "Giornata fissa", tokyo: "A Tokyo", gita: "Gita fuori città", riposo: "Giornata lenta", kyoto: "A Kyoto", capodanno: "Capodanno" };
  var LETTERS = ["A", "B", "C", "D"];
  var PIN = '<svg viewBox="0 0 16 16" aria-hidden="true"><path fill="currentColor" d="M8 1.5a4.5 4.5 0 0 0-4.5 4.5c0 3.2 4.5 8.5 4.5 8.5s4.5-5.3 4.5-8.5A4.5 4.5 0 0 0 8 1.5zm0 6.2a1.7 1.7 0 1 1 0-3.4 1.7 1.7 0 0 1 0 3.4z"/></svg>';

  function cap(s) { return s.charAt(0).toUpperCase() + s.slice(1); }

  function day(date) { return V.days.filter(function (d) { return d.date === date; })[0]; }
  function dayIndex(date) { for (var i = 0; i < V.days.length; i++) if (V.days[i].date === date) return i; return -1; }
  function chapter(id) { return V.chapters.filter(function (c) { return c.id === id; })[0]; }
  function plan(id) { var p = V.plans[id]; return p ? Object.assign({ id: id }, p) : null; }
  function plansFor(date) { var d = day(date); return d ? d.plans.map(plan) : []; }

  function chosenId(date, state) {
    var d = day(date);
    if (!d) return null;
    var c = state.choices && state.choices[date];
    return c && d.plans.indexOf(c) !== -1 ? c : d.plans[0];
  }
  function chosenPlan(date, state) { return plan(chosenId(date, state)); }
  function letterOf(date, planId) { var d = day(date); return LETTERS[d.plans.indexOf(planId)] || ""; }

  function weekdayKey(date) { return WD[T.parts(date).wd]; }
  function closedOn(item, date) {
    if (!item) return false;
    if (item.closed_dates && item.closed_dates.indexOf(date) !== -1) return "date";
    if (item.closed && item.closed.indexOf(weekdayKey(date)) !== -1) return "weekday";
    return false;
  }
  function closedText(name, item, date, how) {
    return how === "date"
      ? name + ": chiuso " + T.longDate(date) + "."
      : name + ": chiuso " + WD_NAME[weekdayKey(date)] + ".";
  }

  // Avvisi per un piano in una data
  function warnings(date, p, state) {
    var out = [];
    (p.stops || []).forEach(function (s) {
      var how = closedOn(s.place, date);
      if (how) out.push({ level: "stop", text: closedText(s.place.name, s.place, date, how) });
    });
    (p.meals || []).forEach(function (m) {
      var how = closedOn(m, date);
      if (how) out.push({ level: "meal", text: closedText(m.name, m, date, how) + " Scegliete un'alternativa." });
    });
    if (state) {
      V.days.forEach(function (d) {
        if (d.date !== date && chosenId(d.date, state) === p.id) {
          out.push({ level: "dup", text: "Questo piano è scelto anche " + T.longDate(d.date) + "." });
        }
      });
    }
    return out;
  }

  /* ---------- Disegno ---------- */
  function placeChip(name, q) {
    return '<a class="place" href="' + T.mapsUrl(q) + '" target="_blank" rel="noopener">' + PIN + esc(name) + "</a>";
  }

  function renderMeal(m, date) {
    var how = closedOn(m, date);
    return '<div class="meal' + (how ? " is-closed" : "") + '">' +
      '<p class="meal-label">' + esc(m.label) + "</p>" +
      '<p class="meal-name">' + esc(m.name) + (m.jp ? ' <span class="meal-jp" lang="ja">' + esc(m.jp) + "</span>" : "") + "</p>" +
      '<p class="meal-what">' + esc(m.what) + "</p>" +
      '<ul class="meal-facts">' +
        (m.price ? "<li><strong>Prezzo</strong> " + esc(m.price) + "</li>" : "") +
        (m.hours ? "<li><strong>Orari</strong> " + esc(m.hours) + "</li>" : "") +
        (m.where ? "<li><strong>Dove</strong> " + esc(m.where) + "</li>" : "") +
        (m.kids ? "<li><strong>Con le bimbe</strong> " + esc(m.kids) + "</li>" : "") +
      "</ul>" +
      (how ? '<p class="meal-closed">' + esc(closedText("Quel giorno", m, date, how).replace("Quel giorno: chiuso", "Quel giorno è chiuso")) + "</p>" : "") +
      (m.q ? placeChip("Apri in Google Maps", m.q) : "") +
      "</div>";
  }

  function renderPlan(p, date, state, opts) {
    opts = opts || {};
    var chosen = chosenId(date, state) === p.id;
    var d = day(date);
    var multi = d && d.plans.length > 1;
    var letter = letterOf(date, p.id);
    var stamped = state.stamps && state.stamps.indexOf(date) !== -1 && chosen;
    var warn = warnings(date, p, state);
    var kind = KIND[p.kind] || "Giornata";
    var label = !multi ? kind
      : "Piano " + letter + (letter === "A" ? " (consigliato)" : "") + ": " + kind.charAt(0).toLowerCase() + kind.slice(1);
    var liked = !!(state.likes && state.likes[p.id]);

    var html = '<article class="plan" data-plan="' + p.id + '">' +
      '<div class="plan-head">' +
        '<span class="seal' + (stamped ? " is-stamped" : "") + '" lang="ja" aria-hidden="true">' + esc(p.kanji) + "</span>" +
        "<div>" +
          '<p class="plan-label">' + esc(label) + (p.treasure ? ' <span class="treasure-tag">tappa tesoro</span>' : "") + "</p>" +
          '<h3 class="plan-title">' + esc(p.title) + "</h3>" +
          '<p class="plan-summary">' + esc(p.summary) + "</p>" +
          '<p class="plan-kanji">Il timbro è <span lang="ja">' + esc(p.kanji) + "</span>: si legge " + esc(p.reading) + " e vuol dire " + esc(p.meaning) + ".</p>" +
        "</div>" +
      "</div>";

    if (warn.length) {
      html += '<ul class="plan-warn" aria-label="Avvisi">' + warn.map(function (w) {
        return '<li class="warn-' + w.level + '">' + esc(w.text) + "</li>";
      }).join("") + "</ul>";
    }

    if (p.complete) {
      html += '<dl class="plan-facts">' +
        (p.transport ? "<div><dt>Come ci si arriva</dt><dd>" + esc(p.transport) + "</dd></div>" : "") +
        (p.stroller ? "<div><dt>Col passeggino</dt><dd>" + esc(cap(p.stroller)) + "</dd></div>" : "") +
        (p.cost ? "<div><dt>Quanto costa</dt><dd>" + esc(cap(p.cost)) + "</dd></div>" : "") +
        "</dl>";
      html += '<ol class="moments">' + (p.stops || []).map(function (s) {
        var how = closedOn(s.place, date);
        return "<li" + (how ? ' class="is-closed"' : "") + '><span class="moment-when">' + esc(s.when) + '</span><span class="moment-what">' + esc(s.what) + "</span>" +
          (s.place && s.place.info ? '<span class="moment-info">' + esc(s.place.info) + "</span>" : "") +
          (s.place ? '<span class="moment-map">' + placeChip(s.place.name, s.place.q) + "</span>" : "") +
          "</li>";
      }).join("") + "</ol>";
      if (p.meals && p.meals.length) {
        html += '<h4 class="meals-title">Dove mangiare</h4><div class="meals">' +
          p.meals.map(function (m) { return renderMeal(m, date); }).join("") + "</div>";
      }
      if (p.rain) html += '<p class="plan-rain"><strong>Se piove.</strong> ' + esc(p.rain) + "</p>";
      if (p.tip) html += '<p class="day-tip">' + esc(p.tip) + "</p>";
    } else {
      html += '<p class="plan-soon">Il programma c\'è già. Orari, prezzi e ristoranti verificati arrivano nella versione ' + esc(p.version || "successiva") + ".</p>";
    }

    if (p.phrase) {
      html += '<button type="button" class="phrase-card" data-phrase="' + p.id + '">' +
        '<span class="phrase-card-jp" lang="ja">' + esc(p.phrase.jp) + "</span>" +
        '<span class="phrase-card-romaji">' + esc(p.phrase.romaji) + "</span>" +
        '<span class="phrase-card-it">' + esc(p.phrase.it) + "</span>" +
        '<span class="phrase-card-hint">Frase del giorno: tocca per mostrarla a tutto schermo</span></button>';
    }
    if (p.links && p.links.length) {
      html += '<div class="sheet-links">' + p.links.map(function (l) {
        return '<a class="t-btn" href="' + esc(l.href) + '">' + esc(l.label) + "</a>";
      }).join("") + "</div>";
    }

    if (!opts.readonly) {
      html += '<div class="plan-actions">' +
        '<button type="button" class="like-btn" data-like="' + p.id + '" aria-pressed="' + liked + '">' +
          '<span aria-hidden="true">' + (liked ? "♥" : "♡") + "</span> " + (liked ? "Ci piace" : "Ci piace?") + "</button>" +
        (multi
          ? (chosen
              ? '<span class="chosen-tag">✓ È il piano scelto per questo giorno</span>'
              : '<button type="button" class="t-btn t-btn-primary" data-choose="' + p.id + '">Scegliamo questo</button>')
          : "") +
        "</div>";
    }
    return html + "</article>";
  }

  /* ---------- Condivisione delle scelte ---------- */
  function shareLink(state) {
    var payload = { c: state.choices || {}, l: Object.keys(state.likes || {}).filter(function (k) { return state.likes[k]; }) };
    return location.origin + "/itinerario#scelte=" + encodeURIComponent(JSON.stringify(payload));
  }
  function readShared(hash) {
    if (!hash || hash.indexOf("#scelte=") !== 0) return null;
    try {
      var p = JSON.parse(decodeURIComponent(hash.slice(8)));
      var choices = {}, likes = {};
      Object.keys(p.c || {}).forEach(function (date) {
        var d = day(date);
        if (d && d.plans.indexOf(p.c[date]) !== -1) choices[date] = p.c[date];
      });
      (p.l || []).forEach(function (id) { if (V.plans[id]) likes[id] = true; });
      return { choices: choices, likes: likes };
    } catch (e) { return null; }
  }

  window.Planner = {
    day: day, dayIndex: dayIndex, chapter: chapter, plan: plan, plansFor: plansFor,
    chosenId: chosenId, chosenPlan: chosenPlan, letterOf: letterOf,
    warnings: warnings, renderPlan: renderPlan, shareLink: shareLink, readShared: readShared,
    KIND: KIND, cap: cap
  };
})();
