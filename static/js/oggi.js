/* ==========================================================================
   Oggi
   - prima di partire: conto alla rovescia, i 3 capitoli, le cose da prenotare
   - durante il viaggio: il programma di oggi e il timbro di fine giornata
   - sempre: il calendario dei 23 giorni con i timbri
   ========================================================================== */
(function () {
  "use strict";

  var T = window.TokyoApp;
  var P = window.Planner;
  var V = window.VIAGGIO;
  var esc = T.esc;
  var state = T.loadState();
  var START = V.trip.start, END = V.trip.end;

  function $(sel) { return document.querySelector(sel); }
  function cap(s) { return s.charAt(0).toUpperCase() + s.slice(1); }
  function today() { return T.tokyoToday(); }
  function dayNumber(iso) { return P.dayIndex(iso) + 1; }
  function isStamped(iso) { return state.stamps.indexOf(iso) !== -1; }
  function stampCount() { return V.days.filter(function (d) { return isStamped(d.date); }).length; }
  function shortRange(a, b) {
    var x = T.parts(a), y = T.parts(b);
    return x.d + " " + T.MONTHS[x.m - 1].slice(0, 3) + " – " + y.d + " " + T.MONTHS[y.m - 1].slice(0, 3);
  }

  /* ---------- Parte alta ---------- */
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
    var main = $("#sky-main");
    if (t < START) {
      var n = T.daysBetween(t, START);
      $("#sky-title").textContent = n === 1 ? "Domani si parte" : "Mancano " + n + " giorni";
      $("#sky-sub").textContent =
        n === 1 ? "Passaporti, caricabatterie, pannolini. E un bel respiro." :
        n <= 7 ? "Fate la lista della valigia. Poi rifatela: qualcosa manca sempre." :
        n <= 30 ? "È il momento di prenotare quello che manca: la lista è qui sotto." :
        "23 giorni in Giappone, in 3 capitoli. Le valigie non si fanno da sole, ma i piani sì: sceglieteli nella scheda Viaggio.";
      main.innerHTML = '<ol class="chapter-cards">' + V.chapters.map(function (c) {
        return '<li class="chapter-card" style="--ch:' + c.color + '">' +
          '<span class="chapter-card-glyph" lang="ja" aria-hidden="true">' + esc(c.glyph) + "</span>" +
          '<span class="chapter-card-title">' + esc(c.title) + "</span>" +
          '<span class="chapter-card-dates">' + shortRange(c.start, c.end) + "</span>" +
          '<span class="chapter-card-hotel">' + esc(c.hotel) + "</span>" +
          "</li>";
      }).join("") + "</ol>";
    } else if (t > END) {
      $("#sky-title").textContent = "Bentornati a casa";
      $("#sky-sub").textContent = "Avete raccolto " + stampCount() + " timbri su " + V.days.length + ". Il jet lag passa, i ricordi no.";
      main.innerHTML = "";
    } else {
      renderToday(t, main);
    }

    var sim = T.simDate();
    $("#sim-bar").hidden = !sim;
    if (sim) $("#sim-text").textContent = "Stai provando " + T.longDate(sim);
  }

  function renderToday(t, main) {
    var d = P.day(t);
    var plan = P.chosenPlan(t, state);
    var chapter = P.chapter(d.chapter);
    var warn = P.warnings(t, plan, state);
    var idx = P.dayIndex(t);
    var next = V.days[idx + 1];
    $("#sky-title").textContent = "Giorno " + dayNumber(t) + " di " + V.days.length;
    $("#sky-sub").textContent = chapter.title + ": " + chapter.subtitle.charAt(0).toLowerCase() + chapter.subtitle.slice(1) + ".";

    var stops = plan.complete ? (plan.stops || []) : [];
    main.innerHTML =
      '<article class="today-card">' +
        '<div class="today-head">' +
          '<span class="seal' + (isStamped(t) ? " is-stamped" : "") + '" lang="ja" aria-hidden="true">' + esc(plan.kanji) + "</span>" +
          "<div>" +
            '<p class="today-label">Il programma di oggi</p>' +
            '<h2 class="today-title">' + esc(plan.title) + "</h2>" +
          "</div>" +
        "</div>" +
        '<p class="today-summary">' + esc(plan.summary) + "</p>" +
        (stops.length
          ? '<ol class="today-stops">' + stops.map(function (s) {
              return "<li><strong>" + esc(s.when) + "</strong> " + esc(s.what.split(". ")[0].replace(/\.$/, "")) + "</li>";
            }).join("") + "</ol>"
          : "") +
        (warn.length ? '<p class="today-warn">' + esc(warn[0].text) + (warn.length > 1 ? " E altri " + (warn.length - 1) + " avvisi." : "") + "</p>" : "") +
        wetNote(t, plan) +
        '<div class="today-actions">' +
          '<button type="button" class="t-btn t-btn-primary" data-open="' + t + '">Apri il programma completo</button>' +
          (isStamped(t)
            ? '<span class="stamp-done">Timbro preso</span>'
            : '<button type="button" class="t-btn t-btn-stamp-sm" data-stamp="' + t + '">Prendi il timbro di oggi</button>') +
        "</div>" +
      "</article>" +
      (next ? '<p class="tomorrow">Domani: <a href="/itinerario#d-' + next.date + '">' + esc(P.chosenPlan(next.date, state).title) + "</a></p>" : "");
  }

  function wetNote(date, plan) {
    var f = window.TripWeather && window.TripWeather.forDate(date);
    if (!f) return "";
    return '<p class="today-wx' + (f.wet ? " is-wet" : "") + '">' + f.icon +
      "<span>" + (f.wet
        ? "Oggi " + f.label + (f.pp !== null ? " (" + f.pp + "%)" : "") + ", " + f.tmin + "°/" + f.tmax + "°. " +
          (plan.rain_ok ? "Buone notizie: il piano di oggi va bene anche con la pioggia." : (plan.rain ? "Piano per la pioggia: " + esc(plan.rain) : "Ombrelli pronti."))
        : "Oggi " + f.label + ", " + f.tmin + "°/" + f.tmax + "°.") +
      "</span></p>";
  }

  /* ---------- Da preparare ---------- */
  function renderTodo() {
    var section = $("#todo-section");
    var t = today();
    if (t >= START) { section.hidden = true; return; }
    section.hidden = false;
    $("#todo").innerHTML = V.todo.map(function (item) {
      var done = !!state.done[item.id];
      var when = item.date ? (item.date < t ? "Scadenza passata: controllate se c'è ancora speranza" : "Entro " + T.longDate(item.date)) : "Appena possibile";
      return '<li class="todo-item' + (done ? " is-done" : "") + (item.date && item.date < t && !done ? " is-late" : "") + '">' +
        '<button type="button" class="todo-check" data-todo="' + item.id + '" aria-pressed="' + done + '" aria-label="' +
          esc((done ? "Fatto: " : "Da fare: ") + item.title) + '"><span aria-hidden="true">' + (done ? "✓" : "") + "</span></button>" +
        "<div>" +
          '<p class="todo-title">' + esc(item.title) + "</p>" +
          '<p class="todo-when">' + esc(when) + "</p>" +
          '<p class="todo-detail">' + esc(item.detail) + "</p>" +
        "</div></li>";
    }).join("");
  }

  /* ---------- Calendario ---------- */
  function renderCal() {
    var t = today();
    var sc = stampCount();
    $("#stamp-count").textContent = sc + (sc === 1 ? " timbro" : " timbri") + " su " + V.days.length;
    var lastChapter = null;
    $("#cal").innerHTML = V.days.map(function (d) {
      var p = T.parts(d.date);
      var plan = P.chosenPlan(d.date, state);
      var warn = P.warnings(d.date, plan, state);
      var chapterStart = d.chapter !== lastChapter;
      lastChapter = d.chapter;
      var ch = P.chapter(d.chapter);
      return '<li class="cal-day' + (d.date === t ? " is-today" : "") + (d.date < t ? " is-past" : "") +
        (chapterStart ? " is-chapter-start" : "") + '" style="--ch:' + ch.color + '">' +
        '<a href="/itinerario#d-' + d.date + '" aria-label="' + esc(cap(T.longDate(d.date)) + ": " + plan.title + (warn.length ? ", con avvisi" : "")) + '">' +
          '<span class="cal-date"><span class="cal-wd">' + T.WD_SHORT[p.wd] + (p.m === 1 ? " gen" : "") + '</span><span class="cal-num">' + p.d + "</span></span>" +
          '<span class="seal seal-sm' + (isStamped(d.date) ? " is-stamped" : "") + '" lang="ja" aria-hidden="true">' + esc(plan.kanji) + "</span>" +
          '<span class="cal-title">' + esc(plan.title) + "</span>" +
          (window.TripWeather ? window.TripWeather.mini(d.date) : "") +
          (warn.length ? '<span class="cal-warn" aria-hidden="true">!</span>' : "") +
        "</a></li>";
    }).join("");
  }

  /* ---------- Scheda di oggi (dialog) ---------- */
  var sheet = $("#day-sheet");
  var body = $("#sheet-body");
  var sheetDate = null, lastOpener = null;

  function renderSheet(justStamped) {
    var plan = P.chosenPlan(sheetDate, state);
    body.innerHTML =
      '<div class="sheet-handle" aria-hidden="true"></div>' +
      '<button type="button" class="sheet-close" data-action="close">Chiudi</button>' +
      '<div class="sheet-top"><p class="sheet-date">' + cap(T.longDate(sheetDate)) + ", giorno " + dayNumber(sheetDate) + " di " + V.days.length + "</p>" +
      '<h2 id="sheet-title" class="visually-hidden">' + esc(plan.title) + "</h2></div>" +
      P.renderPlan(plan, sheetDate, state, { readonly: true }) +
      '<div class="sheet-foot">' +
        (isStamped(sheetDate)
          ? '<p class="stamp-done" role="status"><span class="seal seal-sm is-stamped' + (justStamped ? " just-stamped" : "") + '" lang="ja" aria-hidden="true">' +
              esc(plan.kanji) + "</span>Timbro preso</p>" +
            '<button type="button" class="t-link" data-action="unstamp">Togli il timbro</button>'
          : '<button type="button" class="t-btn t-btn-stamp" data-action="stamp">Giornata finita: prendi il timbro</button>') +
        '<a class="t-link" href="/itinerario#d-' + sheetDate + '">Cambia piano per questo giorno</a>' +
      "</div>" +
      '<div class="stamp-fx" id="stamp-fx-live" aria-hidden="true" hidden><span lang="ja"></span></div>';
  }

  function openSheet(date, opener) {
    sheetDate = date;
    lastOpener = opener || null;
    renderSheet(false);
    if (typeof sheet.showModal === "function") { if (!sheet.open) sheet.showModal(); }
    else sheet.setAttribute("open", "");
    sheet.scrollTop = 0;
  }
  function closeSheet() {
    if (typeof sheet.close === "function") sheet.close();
    else { sheet.removeAttribute("open"); }
    if (lastOpener && document.body.contains(lastOpener)) lastOpener.focus();
  }

  function playStampFx(kanji) {
    if (T.reduceMotion.matches) return;
    var fx = document.getElementById("stamp-fx-live");
    if (!fx) return;
    var span = fx.querySelector("span");
    span.textContent = kanji;
    fx.hidden = false;
    span.addEventListener("animationend", function (e) { if (e.animationName === "stamp-out") fx.hidden = true; });
  }

  function stamp(date, inSheet) {
    state = T.loadState();
    if (!isStamped(date)) state.stamps.push(date);
    T.saveState(state);
    if (navigator.vibrate) navigator.vibrate(35);
    refreshAll();
    if (inSheet) {
      renderSheet(true);
      playStampFx(P.chosenPlan(date, state).kanji);
    } else {
      T.toast(stampMessage());
    }
  }
  function stampMessage() {
    var n = stampCount(), tot = V.days.length;
    if (n >= tot) return "Ventitré timbri su ventitré. Viaggio completato: siete leggenda.";
    if (n === 1) return "Primo timbro! Ne mancano " + (tot - 1) + ": l'album vi aspetta.";
    if (n === Math.round(tot / 2)) return "Giornata timbrata: siete a metà viaggio. La parte bella continua.";
    return "Giornata timbrata. " + n + " su " + tot + ": altri ricordi in cassaforte.";
  }

  function unstamp(date) {
    state = T.loadState();
    state.stamps = state.stamps.filter(function (d) { return d !== date; });
    T.saveState(state);
    refreshAll();
    renderSheet(false);
  }

  body.addEventListener("click", function (e) {
    var t = e.target.closest("[data-action]");
    if (t) {
      if (t.dataset.action === "close") closeSheet();
      else if (t.dataset.action === "stamp") stamp(sheetDate, true);
      else if (t.dataset.action === "unstamp") unstamp(sheetDate);
      return;
    }
    var ph = e.target.closest("[data-phrase]");
    if (ph) T.openShow(P.plan(ph.dataset.phrase).phrase, ph);
  });
  sheet.addEventListener("click", function (e) { if (e.target === sheet) closeSheet(); });

  $("#sky-main").addEventListener("click", function (e) {
    var o = e.target.closest("[data-open]");
    if (o) { openSheet(o.dataset.open, o); return; }
    var s = e.target.closest("[data-stamp]");
    if (s) stamp(s.dataset.stamp, false);
  });

  $("#todo").addEventListener("click", function (e) {
    var b = e.target.closest("[data-todo]");
    if (!b) return;
    state = T.loadState();
    var id = b.dataset.todo;
    if (state.done[id]) delete state.done[id]; else state.done[id] = true;
    T.saveState(state);
    renderTodo();
    var again = document.querySelector('[data-todo="' + id + '"]');
    if (again) again.focus();
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
      p.userChoice.then(function () { window.__installPrompt = null; btn.hidden = true; });
    });
    window.addEventListener("appinstalled", function () {
      section.hidden = true;
      T.toast("App installata: la trovi nella schermata Home");
    });
  }

  /* ---------- Prova un giorno e Ricomincia ---------- */
  function refreshAll() {
    state = T.loadState();
    renderTop();
    renderTodo();
    renderCal();
    document.dispatchEvent(new CustomEvent("tokyo:refresh"));
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
  $("#btn-reset").addEventListener("click", function () {
    var preview = T.isPreview();
    var msg = preview ? "Cancello i timbri di questa prova?" : "Cancello tutti i timbri? Scelte, cuori e note restano dove sono.";
    if (!window.confirm(msg)) return;
    state = T.loadState();
    state.opened = [];
    state.stamps = [];
    T.saveState(state);
    refreshAll();
    T.toast(preview ? "Prova azzerata" : "Timbri cancellati. Si ricomincia, con calma.");
  });

  /* ---------- Copia di sicurezza ---------- */
  function restore(obj) {
    var when = obj && obj.saved ? new Date(obj.saved).toLocaleString("it-IT", { day: "numeric", month: "long", hour: "2-digit", minute: "2-digit" }) : "";
    var ok = window.confirm("Vuoi ripristinare la copia" + (when ? " del " + when : "") + "? Sostituisce scelte, note, timbri e lista della spesa di questo telefono.");
    if (!ok) return;
    try {
      T.importData(obj);
      T.toast("Copia ripristinata");
      setTimeout(function () { location.replace("/"); }, 700);
    } catch (e) {
      T.toast("Questa copia non sembra valida");
    }
  }

  $("#backup-box").addEventListener("toggle", function () {
    if (!this.open) return;
    var text = "Copia di sicurezza dell'app Tokyo 2026 (" + new Date().toLocaleDateString("it-IT") + "). Per ripristinarla apri questo link sul telefono:\n" + T.backupLink();
    $("#btn-backup-wa").href = "https://wa.me/?text=" + encodeURIComponent(text);
  });
  $("#btn-backup-file").addEventListener("click", function () {
    var blob = new Blob([JSON.stringify(T.exportData(), null, 2)], { type: "application/json" });
    var a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = "tokyo2026-copia-" + T.realTokyoToday() + ".json";
    document.body.appendChild(a);
    a.click();
    setTimeout(function () { URL.revokeObjectURL(a.href); a.remove(); }, 1000);
    T.toast("Copia scaricata");
  });
  $("#restore-file").addEventListener("change", function () {
    var f = this.files && this.files[0];
    if (!f) return;
    var reader = new FileReader();
    reader.onload = function () {
      try { restore(JSON.parse(reader.result)); } catch (e) { T.toast("Questo file non è una copia dell'app"); }
    };
    reader.readAsText(f);
    this.value = "";
  });

  document.addEventListener("tokyo:meteo", function () { renderTop(); renderCal(); });

  /* ---------- Avvio ---------- */
  var fromLink = T.readBackupHash(location.hash);
  if (fromLink) {
    if (history.replaceState) history.replaceState(null, "", "/");
    setTimeout(function () { restore(fromLink); }, 300);
  }
  refreshAll();
  setupInstall();
  var lastDay = today();
  setInterval(function () {
    if (today() !== lastDay) { lastDay = today(); refreshAll(); }
    else {
      $("#clock-tokyo").textContent = T.clock("Asia/Tokyo");
      $("#clock-italy").textContent = T.clock("Europe/Rome");
    }
  }, 30000);
})();
