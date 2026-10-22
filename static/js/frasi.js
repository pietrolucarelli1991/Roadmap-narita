/* ==========================================================================
   Frasario e SOS
   - frasi per situazione, ricerca, preferite
   - "Mostra" a tutto schermo, "Ascolta" con la voce giapponese del telefono
   - carta delle allergie che si scrive da sola
   - dati dell'assicurazione (pagina SOS), salvati solo sul telefono
   ========================================================================== */
(function () {
  "use strict";

  var T = window.TokyoApp;
  var esc = T.esc;

  /* ---------- Voce giapponese ---------- */
  var jaVoice = null;
  function pickVoice() {
    if (!("speechSynthesis" in window)) return;
    var voices = window.speechSynthesis.getVoices() || [];
    jaVoice = voices.filter(function (v) { return /^ja/i.test(v.lang.replace("_", "-")); })[0] || null;
  }
  if ("speechSynthesis" in window) {
    pickVoice();
    window.speechSynthesis.onvoiceschanged = pickVoice;
  }
  function speak(jp, btn) {
    if (!("speechSynthesis" in window)) {
      T.toast("Questo browser non sa parlare: usate Mostra");
      return;
    }
    var synth = window.speechSynthesis;
    synth.cancel();
    var u = new SpeechSynthesisUtterance(jp.replace(/\s*\/\s*/g, "、"));
    u.lang = "ja-JP";
    u.rate = 0.85;
    if (jaVoice) u.voice = jaVoice;
    if (btn) {
      btn.classList.add("is-speaking");
      u.onend = u.onerror = function () { btn.classList.remove("is-speaking"); };
    }
    synth.speak(u);
    if (!jaVoice && synth.getVoices().length) {
      T.toast("Se non sentite nulla, manca la voce giapponese: si aggiunge nelle impostazioni della sintesi vocale");
    }
  }

  /* ==========================================================================
     PAGINA FRASARIO
     ========================================================================== */
  var F = window.FRASI;
  if (F && document.getElementById("frasi-list")) {
    var KEY = "tokyo-frasi-v1";
    var store = (function () {
      try { return JSON.parse(localStorage.getItem(KEY) || "{}") || {}; } catch (e) { return {}; }
    })();
    store.stars = store.stars || {};
    store.allergy = store.allergy || { who: "musume", items: [] };
    function save() { try { localStorage.setItem(KEY, JSON.stringify(store)); } catch (e) { /* ignora */ } }

    var all = [];
    F.phrases.forEach(function (cat) {
      cat.phrases.forEach(function (p, i) { all.push(Object.assign({ id: cat.id + "-" + i, cat: cat.id }, p)); });
    });
    function byId(id) { return all.filter(function (p) { return p.id === id; })[0]; }
    function norm(s) { return (s || "").toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, ""); }

    var filter = { cat: null, q: "" };

    function card(p) {
      var on = !!store.stars[p.id];
      return '<article class="frase" data-id="' + p.id + '">' +
        '<p class="frase-it">' + esc(p.it) + "</p>" +
        '<p class="frase-jp" lang="ja">' + esc(p.jp) + "</p>" +
        '<p class="frase-romaji">' + esc(p.romaji) + "</p>" +
        '<div class="frase-actions">' +
          '<button type="button" class="frase-btn" data-show="' + p.id + '">Mostra</button>' +
          '<button type="button" class="frase-btn" data-speak="' + p.id + '"><span aria-hidden="true">♪</span> Ascolta</button>' +
          '<button type="button" class="frase-star" data-star="' + p.id + '" aria-pressed="' + on + '" aria-label="' +
            (on ? "Togli dalle preferite" : "Aggiungi alle preferite") + '">' + (on ? "★" : "☆") + "</button>" +
        "</div></article>";
    }

    function renderCats() {
      var nStars = Object.keys(store.stars).length;
      var html = '<button type="button" class="chip-btn" data-cat="" aria-pressed="' + (!filter.cat) + '">Tutte</button>' +
        '<button type="button" class="chip-btn" data-cat="stars" aria-pressed="' + (filter.cat === "stars") + '">★ Preferite' + (nStars ? " (" + nStars + ")" : "") + "</button>" +
        '<a class="chip-btn" href="#allergie">Allergie</a>';
      F.phrases.forEach(function (c) {
        html += '<button type="button" class="chip-btn" data-cat="' + c.id + '" aria-pressed="' + (filter.cat === c.id) + '">' + esc(c.title) + "</button>";
      });
      document.getElementById("frasi-cats").innerHTML = html;
    }

    function renderList() {
      var q = norm(filter.q.trim());
      var list = document.getElementById("frasi-list");
      var html = "";
      if (q) {
        var hits = all.filter(function (p) { return norm(p.it).indexOf(q) !== -1 || norm(p.romaji).indexOf(q) !== -1 || p.jp.indexOf(filter.q.trim()) !== -1; });
        html = '<section class="frasi-cat"><h2>Risultati per "' + esc(filter.q.trim()) + '"</h2>' +
          (hits.length ? hits.map(card).join("") : '<p class="frasi-empty">Nessuna frase trovata. Provate con un\'altra parola, o con Google Traduttore qui sotto.</p>') + "</section>";
      } else if (filter.cat === "stars") {
        var stars = all.filter(function (p) { return store.stars[p.id]; });
        html = '<section class="frasi-cat"><h2>Le vostre preferite</h2>' +
          (stars.length ? stars.map(card).join("") : '<p class="frasi-empty">Ancora nessuna. Toccate la stellina ☆ delle frasi che usate di più: le ritrovate qui al volo.</p>') + "</section>";
      } else {
        F.phrases.forEach(function (c) {
          if (filter.cat && filter.cat !== c.id) return;
          html += '<section class="frasi-cat" id="' + c.id + '"><h2><span class="h-jp" lang="ja">' + esc(c.jp) + " <i>" + esc(c.romaji) + "</i></span>" + esc(c.title) + "</h2>" +
            all.filter(function (p) { return p.cat === c.id; }).map(card).join("") + "</section>";
        });
      }
      list.innerHTML = html;
    }

    /* ---------- Carta delle allergie ---------- */
    var WHO = { musume: { jp: "娘", romaji: "Musume", it: "Mia figlia è allergica" }, watashi: { jp: "私", romaji: "Watashi", it: "Sono allergico/a" } };
    function allergyPhrase() {
      var items = F.allergens.filter(function (a) { return store.allergy.items.indexOf(a.id) !== -1; });
      if (!items.length) return null;
      var w = WHO[store.allergy.who] || WHO.musume;
      var jpItems = items.map(function (a) { return a.jp; }).join("と");
      var roItems = items.map(function (a) { return a.romaji; }).join(" to ");
      var itItems = items.map(function (a) { return a.it; });
      var itList = itItems.length > 1 ? itItems.slice(0, -1).join(", ") + " e " + itItems[itItems.length - 1] : itItems[0];
      return {
        jp: w.jp + "は" + jpItems + "のアレルギーがあります。この料理に" + jpItems + "は入っていますか？",
        romaji: w.romaji + " wa " + roItems + " no arerugī ga arimasu. Kono ryōri ni " + roItems + " wa haitte imasu ka?",
        it: w.it + " a " + itList + ". In questo piatto ci sono?"
      };
    }
    function renderAllergy() {
      document.getElementById("allergy-items").innerHTML = F.allergens.map(function (a) {
        var on = store.allergy.items.indexOf(a.id) !== -1;
        return '<button type="button" class="chip-btn allergy-chip" data-allergen="' + a.id + '" aria-pressed="' + on + '">' +
          '<span lang="ja">' + esc(a.jp) + "</span> " + esc(a.it) + "</button>";
      }).join("");
      document.querySelectorAll("[data-who]").forEach(function (b) {
        b.setAttribute("aria-pressed", b.dataset.who === store.allergy.who ? "true" : "false");
      });
      var p = allergyPhrase();
      var box = document.getElementById("allergy-card");
      box.hidden = !p;
      if (p) {
        box.innerHTML = '<p class="frase-jp" lang="ja">' + esc(p.jp) + "</p>" +
          '<p class="frase-romaji">' + esc(p.romaji) + "</p>" +
          '<p class="allergy-it">' + esc(p.it) + "</p>" +
          '<div class="frase-actions">' +
            '<button type="button" class="frase-btn frase-btn-light" data-allergy-show>Mostra al ristorante</button>' +
            '<button type="button" class="frase-btn frase-btn-light" data-allergy-speak><span aria-hidden="true">♪</span> Ascolta</button>' +
          "</div>";
      }
    }

    /* ---------- Eventi ---------- */
    document.addEventListener("click", function (e) {
      var t;
      if ((t = e.target.closest("[data-show]"))) { var p = byId(t.dataset.show); T.openShow({ jp: p.jp, romaji: p.romaji, it: p.it }, t); return; }
      if ((t = e.target.closest("[data-speak]"))) { speak(byId(t.dataset.speak).jp, t); return; }
      if ((t = e.target.closest("[data-star]"))) {
        var id = t.dataset.star;
        if (store.stars[id]) delete store.stars[id]; else store.stars[id] = true;
        save();
        var on = !!store.stars[id];
        document.querySelectorAll('[data-star="' + id + '"]').forEach(function (b) {
          b.setAttribute("aria-pressed", on ? "true" : "false");
          b.textContent = on ? "★" : "☆";
          b.setAttribute("aria-label", on ? "Togli dalle preferite" : "Aggiungi alle preferite");
        });
        renderCats();
        if (filter.cat === "stars") renderList();
        return;
      }
      if ((t = e.target.closest("[data-cat]"))) {
        filter.cat = t.dataset.cat || null;
        filter.q = "";
        document.getElementById("frasi-search").value = "";
        renderCats();
        renderList();
        var top = document.getElementById("frasi-list");
        if (top) top.scrollIntoView({ block: "start", behavior: T.reduceMotion.matches ? "auto" : "smooth" });
        return;
      }
      if ((t = e.target.closest("[data-allergen]"))) {
        var a = t.dataset.allergen, i = store.allergy.items.indexOf(a);
        if (i === -1) store.allergy.items.push(a); else store.allergy.items.splice(i, 1);
        save();
        renderAllergy();
        return;
      }
      if ((t = e.target.closest("[data-who]"))) { store.allergy.who = t.dataset.who; save(); renderAllergy(); return; }
      if ((t = e.target.closest("[data-allergy-show]"))) { T.openShow(allergyPhrase(), t); return; }
      if ((t = e.target.closest("[data-allergy-speak]"))) { speak(allergyPhrase().jp, t); }
    });
    var searchTimer = null;
    document.getElementById("frasi-search").addEventListener("input", function () {
      var v = this.value;
      clearTimeout(searchTimer);
      searchTimer = setTimeout(function () { filter.q = v; renderList(); }, 150);
    });

    renderCats();
    renderList();
    renderAllergy();
    // arrivo diretto a una situazione, es. /frasi#emergenza
    var h = location.hash.slice(1);
    if (h && h !== "allergie") {
      var sec = document.getElementById(h);
      if (sec) setTimeout(function () { sec.scrollIntoView({ block: "start" }); }, 60);
    }
  }

  /* ==========================================================================
     PAGINA SOS: assicurazione
     ========================================================================== */
  document.addEventListener("click", function (e) {
    var a = e.target.closest("[data-addr-jp]");
    if (a) T.openShow({ jp: a.dataset.addrJp, romaji: a.dataset.addrName, it: a.dataset.addrIt }, a);
  });

  var ins = document.getElementById("insurance");
  if (ins) {
    var IKEY = "tokyo-sos-v1";
    var data = (function () {
      try { return JSON.parse(localStorage.getItem(IKEY) || "{}") || {}; } catch (e) { return {}; }
    })();
    var callBtn = document.getElementById("ins-call");
    function updateCall() {
      var tel = (data.phone || "").replace(/[^\d+]/g, "");
      callBtn.hidden = !tel;
      if (tel) {
        callBtn.href = "tel:" + tel;
        callBtn.textContent = "Chiama l'assistenza " + (data.company || "");
      }
    }
    ins.querySelectorAll("[data-ins]").forEach(function (input) {
      input.value = data[input.dataset.ins] || "";
      input.addEventListener("input", function () {
        data[input.dataset.ins] = input.value;
        try { localStorage.setItem(IKEY, JSON.stringify(data)); } catch (e) { /* ignora */ }
        updateCall();
      });
    });
    updateCall();
  }
})();
