/* ==========================================================================
   Percorsi — una linea del treno, una stazione per passo
   - si apre una stazione alla volta
   - l'app ricorda a che passo siete (anche se il telefono si chiude)
   - le frasi giapponesi si mostrano a tutto schermo
   - il biglietto per il taxi compare al passo giusto
   ========================================================================== */
(function () {
  "use strict";

  var T = window.TokyoApp;
  var R = window.ROUTE;
  var esc = T.esc;
  var KEY = "tokyo-percorso-v1";
  var STEPS = R.steps;
  var current = 0;   // 0 = nessuna stazione aperta

  function $(sel) { return document.querySelector(sel); }
  function readProgress() {
    try { return JSON.parse(localStorage.getItem(KEY) || "{}") || {}; } catch (e) { return {}; }
  }
  function saveProgress() {
    var all = readProgress();
    all[R.id] = { step: current, checks: checks };
    try { localStorage.setItem(KEY, JSON.stringify(all)); } catch (e) { /* ignora */ }
  }
  var saved = readProgress()[R.id] || {};
  var checks = saved.checks || {};   // "passo-indice" -> true

  // "東京駅までお願いします (Tōkyō-eki made onegaishimasu)" -> giapponese e romaji
  function splitPhrase(text) {
    var m = /^(.*?)\s*\(([^()]*)\)\s*$/.exec(text);
    var jp = m ? m[1] : text;
    return { jp: jp, romaji: m ? m[2] : "", japanese: /[\u3040-\u30ff\u4e00-\u9fff]/.test(jp) };
  }

  function stepBody(step) {
    var html = '<dl class="stop-facts">' +
      "<div><dt>Dove</dt><dd>" + esc(step.location) + "</dd></div>" +
      "<div><dt>Quanto ci vuole</dt><dd>" + esc(step.time) + "</dd></div>" +
      "<div><dt>Quanto costa</dt><dd>" + esc(step.cost) + (step.cost_detail ? ' <span class="muted">' + esc(step.cost_detail) + "</span>" : "") + "</dd></div>" +
      "</dl>";

    html += '<h3 class="stop-h"><span class="h-jp" lang="ja">手順 <i>tejun</i></span>Cosa fare</h3><ul class="stop-checks">' +
      step.actions.map(function (a, i) {
        var id = step.n + "-" + i;
        var on = !!checks[id];
        return '<li><button type="button" class="stop-check" data-check="' + id + '" aria-pressed="' + on + '">' +
          '<span class="stop-check-box" aria-hidden="true">' + (on ? "✓" : "") + "</span>" +
          '<span class="stop-check-text">' + esc(a) + "</span></button></li>";
      }).join("") + "</ul>";

    if (step.signs && step.signs.length) {
      html += '<h3 class="stop-h"><span class="h-jp" lang="ja">看板 <i>kanban</i></span>Cartelli da cercare</h3><div class="stop-signs">' +
        step.signs.map(function (s) {
          return '<div class="stop-sign"><p class="stop-sign-jp" lang="ja">' + esc(s.jp) + "</p>" +
            '<p class="stop-sign-en">' + esc(s.en) + "</p>" +
            (s.note ? '<p class="stop-sign-note">' + esc(s.note) + "</p>" : "") + "</div>";
        }).join("") + "</div>";
    }

    if (step.japanese && step.japanese.length) {
      html += '<h3 class="stop-h"><span class="h-jp" lang="ja">言葉 <i>kotoba</i></span>Da mostrare</h3><div class="stop-phrases">' +
        step.japanese.map(function (j, i) {
          var p = splitPhrase(j.text);
          if (!p.japanese) {
            return '<div class="stop-phrase is-plain"><span class="stop-phrase-label">' + esc(j.label) + "</span>" +
              '<span class="stop-phrase-it">' + esc(j.text) + "</span></div>";
          }
          return '<button type="button" class="stop-phrase" data-phrase="' + step.n + "-" + i + '">' +
            '<span class="stop-phrase-label">' + esc(j.label) + "</span>" +
            '<span class="stop-phrase-jp" lang="ja">' + esc(p.jp) + "</span>" +
            (p.romaji ? '<span class="stop-phrase-romaji">' + esc(p.romaji) + "</span>" : "") +
            '<span class="stop-phrase-hint">Tocca per mostrarla a tutto schermo</span></button>';
        }).join("") + "</div>";
    }

    if (step.kids && step.kids.length) {
      html += '<div class="plan-kids"><p class="plan-kids-label"><span lang="ja" aria-hidden="true">冒険</span> Per le piccole esploratrici</p>' +
        step.kids.map(function (k) { return '<p class="plan-kids-text">' + esc(k) + "</p>"; }).join("") + "</div>";
    }

    var last = step.n === STEPS.length;
    if (last && R.id === "arrivo") {
      html += '<a class="stop-next-mission" href="/spesa"><span class="stop-next-glyph" lang="ja" aria-hidden="true">薬</span>' +
        "<span><strong>Prossima missione: la spesa per le bimbe</strong>" +
        "<span>La farmacia aperta quasi 24 ore è a pochi minuti dall'hotel.</span></span></a>";
    }

    html += '<div class="stop-nav">' +
      (step.n > 1 ? '<button type="button" class="t-link" data-go="' + (step.n - 1) + '">Passo precedente</button>' : "<span></span>") +
      (last
        ? '<button type="button" class="t-btn t-btn-primary" data-arrived="1">Siamo arrivati!</button>'
        : '<button type="button" class="t-btn t-btn-primary" data-go="' + (step.n + 1) + '">Fatto, avanti</button>') +
      "</div>";
    return html;
  }

  function render(scroll) {
    document.querySelectorAll(".route-stop[data-step]").forEach(function (li) {
      var n = parseInt(li.dataset.step, 10);
      var open = n === current;
      li.classList.toggle("is-open", open);
      li.classList.toggle("is-done", current > 0 && n < current);
      var head = li.querySelector(".route-stop-head");
      var body = li.querySelector(".route-stop-body");
      head.setAttribute("aria-expanded", open ? "true" : "false");
      if (open) {
        body.innerHTML = stepBody(STEPS[n - 1]);
        body.hidden = false;
      } else {
        body.hidden = true;
        body.innerHTML = "";
      }
    });
    $("#taxi-fab").hidden = current !== R.taxi_step;
    if (scroll && current) {
      var li = document.querySelector('.route-stop[data-step="' + current + '"]');
      if (li) li.scrollIntoView({ block: "start", behavior: T.reduceMotion.matches ? "auto" : "smooth" });
    }
  }

  function selectStep(n) {
    current = n;
    saveProgress();
    render(true);
  }

  $("#route-line").addEventListener("click", function (e) {
    var t;
    if ((t = e.target.closest("[data-open]"))) {
      var n = parseInt(t.dataset.open, 10);
      current = current === n ? 0 : n;
      saveProgress();
      render(current !== 0);
      return;
    }
    if ((t = e.target.closest("[data-go]"))) { selectStep(parseInt(t.dataset.go, 10)); return; }
    if ((t = e.target.closest("[data-arrived]"))) {
      T.toast("Arrivati! Un altro pezzo di viaggio è andato liscio.");
      current = 0;
      saveProgress();
      render(false);
      return;
    }
    if ((t = e.target.closest("[data-check]"))) {
      var id = t.dataset.check;
      if (checks[id]) delete checks[id]; else checks[id] = true;
      saveProgress();
      var on = !!checks[id];
      t.setAttribute("aria-pressed", on ? "true" : "false");
      t.querySelector(".stop-check-box").textContent = on ? "✓" : "";
      return;
    }
    if ((t = e.target.closest("[data-phrase]"))) {
      var parts = t.dataset.phrase.split("-");
      var j = STEPS[parseInt(parts[0], 10) - 1].japanese[parseInt(parts[1], 10)];
      var p = splitPhrase(j.text);
      T.openShow({ jp: p.jp, romaji: p.romaji, it: j.label }, t);
    }
  });

  /* ---------- Biglietto per il taxi ---------- */
  var taxi = $("#taxi-modal");
  var lastFocus = null;
  $("#taxi-fab").addEventListener("click", function () {
    lastFocus = this;
    taxi.hidden = false;
    $("#taxi-close").focus();
  });
  function closeTaxi() {
    taxi.hidden = true;
    if (lastFocus) lastFocus.focus();
  }
  $("#taxi-close").addEventListener("click", closeTaxi);
  document.addEventListener("keydown", function (e) { if (e.key === "Escape" && !taxi.hidden) closeTaxi(); });

  /* ---------- Avvio ---------- */
  current = saved.step && saved.step <= STEPS.length ? saved.step : 0;
  render(false);
  if (current) setTimeout(function () { render(true); }, 50);

  // usate anche dai test e dalla console
  window.selectStep = selectStep;
  window.navigate = function (dir) {
    var n = Math.max(1, Math.min(STEPS.length, (current || 1) + dir));
    selectStep(n);
  };
})();
