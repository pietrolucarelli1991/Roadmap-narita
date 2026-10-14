/* ==========================================================================
   Mappa Spesa — logica della pagina
   I dati arrivano da Flask (dati_spesa.py) dentro window.SPESA.
   ========================================================================== */
(function () {
  "use strict";

  var D = window.SPESA;
  var HOTEL = D.hotel;
  var CATS = D.categories;
  // Flask ordina le chiavi in ordine alfabetico: qui decidiamo noi l'ordine dei filtri
  var CAT_ORDER = ["farmacia", "conbini", "supermercato", "baby"].filter(function (k) { return CATS[k]; });

  // Passo di una famiglia col passeggino e fattore "le strade non sono dritte"
  var PACE_M_PER_MIN = 60;
  var DETOUR = 1.3;
  var RINGS_MIN = [5, 10, 15];
  var STORAGE_KEY = "spesa-bimbe-v1";
  var isPhone = window.matchMedia("(max-width: 820px)");
  var reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)");

  /* ---------- Piccoli aiuti ---------- */
  function $(sel, el) { return (el || document).querySelector(sel); }
  function esc(s) {
    return String(s == null ? "" : s)
      .replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;").replace(/'/g, "&#39;");
  }
  function fmtNum(n) { return Math.round(n).toLocaleString("it-IT"); }
  function fmtYen(n) { return fmtNum(n) + " ¥"; }

  function toast(msg) {
    var t = $("#toast");
    t.textContent = msg;
    t.hidden = false;
    clearTimeout(toast._t);
    toast._t = setTimeout(function () { t.hidden = true; }, 2200);
  }

  /* ---------- Distanze ---------- */
  function metersBetween(a, b) {
    var R = 6371000, rad = Math.PI / 180;
    var dLat = (b.lat - a.lat) * rad, dLng = (b.lng - a.lng) * rad;
    var h = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
            Math.cos(a.lat * rad) * Math.cos(b.lat * rad) * Math.sin(dLng / 2) * Math.sin(dLng / 2);
    return 2 * R * Math.asin(Math.sqrt(h));
  }
  function walkMinutes(m) { return Math.max(1, Math.round((m * DETOUR) / PACE_M_PER_MIN)); }

  /* ---------- Ora di Tokyo e orari ---------- */
  function tokyoMinutes() {
    var parts = new Intl.DateTimeFormat("en-GB", {
      timeZone: "Asia/Tokyo", hour: "2-digit", minute: "2-digit", hourCycle: "h23"
    }).formatToParts(new Date());
    var h = 0, m = 0;
    parts.forEach(function (p) {
      if (p.type === "hour") h = parseInt(p.value, 10);
      if (p.type === "minute") m = parseInt(p.value, 10);
    });
    return (h % 24) * 60 + m;
  }
  function toMin(s) { var p = s.split(":"); return parseInt(p[0], 10) * 60 + parseInt(p[1], 10); }
  function fmtTime(min) {
    var h = Math.floor(min / 60) % 24, m = min % 60;
    return h + ":" + (m < 10 ? "0" : "") + m;
  }
  function closeLabel(min) { return min === 1440 ? "a mezzanotte" : "alle " + fmtTime(min); }

  function openInfo(shop, now) {
    if (!shop.hours) return { state: "unknown", label: "Orari da verificare", sub: "" };
    var segs = shop.hours.map(function (h) { return [toMin(h[0]), toMin(h[1])]; })
                         .sort(function (a, b) { return a[0] - b[0]; });
    if (segs.length === 1 && segs[0][0] === 0 && segs[0][1] === 1440) {
      return { state: "open", label: "Aperto ora", sub: "aperto 24 ore" };
    }
    for (var i = 0; i < segs.length; i++) {
      if (now >= segs[i][0] && now < segs[i][1]) {
        var end = segs[i][1];
        if (end === 1440) {
          var early = segs.filter(function (s) { return s[0] === 0; })[0];
          if (early) end = early[1];
        }
        return { state: "open", label: "Aperto ora", sub: "chiude " + closeLabel(end) };
      }
    }
    var next = segs.filter(function (s) { return s[0] > now; })[0] || segs[0];
    return { state: "closed", label: "Chiuso", sub: "apre alle " + fmtTime(next[0]) };
  }

  /* ---------- Dati calcolati dei negozi ---------- */
  var shops = D.shops.map(function (s) {
    var dist = metersBetween(HOTEL, s);
    return Object.assign({}, s, { dist: dist, minutes: walkMinutes(dist), cat: CATS[s.category] });
  });
  shops.sort(function (a, b) {
    if (!!b.featured !== !!a.featured) return b.featured ? 1 : -1;
    return a.dist - b.dist;
  });
  function shopById(id) { return shops.filter(function (s) { return s.id === id; })[0]; }

  function distanceShort(s) {
    return s.transit ? "1 fermata di treno" : "≈ " + s.minutes + " min a piedi";
  }
  function mapsUrl(s) {
    return "https://www.google.com/maps/dir/?api=1&destination=" +
      encodeURIComponent(s.maps_query) + "&travelmode=" + (s.transit ? "transit" : "walking");
  }
  function telUrl(phone) { return "tel:+81" + phone.replace(/\D/g, "").replace(/^0/, ""); }

  /* ======================================================================
     MAPPA
     ====================================================================== */
  var map = null, markers = {}, routeLine = null, selectedId = null;

  function initMap() {
    if (!window.L) {
      $("#map").innerHTML = '<p style="padding:1.5rem;font-size:.9rem;color:#4b4f58">' +
        "La mappa non si è caricata: controlla la connessione. La lista dei negozi funziona lo stesso.</p>";
      $("#btn-recenter").hidden = true;
      return;
    }

    map = L.map("map", { zoomControl: false, attributionControl: true });
    L.control.zoom({ position: "bottomright" }).addTo(map);

    var cartoUrl = "https://tile.openstreetmap.org/{z}/{x}/{y}.png";
    var osmUrl = "https://tile.openstreetmap.org/{z}/{x}/{y}.png";
    var attrib = '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>';
    var tiles = L.tileLayer(cartoUrl, { attribution: attrib, maxZoom: 19 }).addTo(map);
    var swapped = false;
    tiles.on("tileerror", function () {
      if (swapped) return;
      swapped = true;
      map.removeLayer(tiles);
      L.tileLayer(osmUrl, { attribution: attrib, maxZoom: 19 }).addTo(map);
    });

    // Cerchi dei minuti a piedi
    RINGS_MIN.forEach(function (min, i) {
      var radius = (min * PACE_M_PER_MIN) / DETOUR;
      L.circle([HOTEL.lat, HOTEL.lng], {
        radius: radius, color: "#2b4c7e", weight: 1.5, opacity: 0.7, dashArray: "4 6",
        fill: i === 0, fillColor: "#2b4c7e", fillOpacity: 0.06, interactive: false
      }).addTo(map);
      L.marker([HOTEL.lat + radius / 111320, HOTEL.lng], {
        icon: L.divIcon({ className: "ring-label", html: "<span>" + min + " min</span>", iconSize: [0, 0] }),
        interactive: false, keyboard: false
      }).addTo(map);
    });

    // Hotel
    L.marker([HOTEL.lat, HOTEL.lng], {
      icon: L.divIcon({
        className: "",
        html: '<div class="pin-hotel"><span class="pin-hotel-mark">宿</span><span class="pin-hotel-label">Il vostro hotel</span></div>',
        iconSize: [150, 40], iconAnchor: [20, 20]
      }),
      zIndexOffset: -500, keyboard: false
    }).addTo(map).bindTooltip(HOTEL.name + " · " + HOTEL.name_jp, { direction: "top", offset: [0, -22], className: "pin-tip" });

    // Negozi
    shops.forEach(function (s) {
      var html = '<div class="pin" style="--c:' + s.cat.color + '">' +
        '<span class="pin-drop"></span><span class="pin-glyph">' + esc(s.cat.glyph) + "</span>" +
        (s.featured ? '<span class="pin-star" aria-hidden="true">★</span>' : "") + "</div>";
      var m = L.marker([s.lat, s.lng], {
        icon: L.divIcon({ className: "", html: html, iconSize: [34, 34], iconAnchor: [17, 41] }),
        title: s.name, riseOnHover: true
      }).addTo(map);
      m.bindTooltip(s.name, { direction: "top", offset: [0, -40], className: "pin-tip" });
      m.on("click", function () { selectShop(s.id, { fromMap: true }); });
      markers[s.id] = m;
    });

    fitAll(false);
    setTimeout(function () { map.invalidateSize(); }, 200);
    window.addEventListener("resize", function () { map.invalidateSize(); });

    $("#btn-recenter").addEventListener("click", function () {
      if (reduceMotion.matches) map.setView([HOTEL.lat, HOTEL.lng], 16);
      else map.flyTo([HOTEL.lat, HOTEL.lng], 16, { duration: 0.6 });
    });
  }

  function fitAll(animate) {
    if (!map) return;
    var pts = [[HOTEL.lat, HOTEL.lng]].concat(shops.map(function (s) { return [s.lat, s.lng]; }));
    map.fitBounds(pts, { padding: [40, 40], animate: !!animate });
  }

  function highlightOnMap(id) {
    if (!map) return;
    Object.keys(markers).forEach(function (k) {
      var el = markers[k].getElement();
      var pin = el && el.querySelector(".pin");
      if (pin) pin.classList.toggle("is-selected", k === id);
      markers[k].setZIndexOffset(k === id ? 900 : 0);
    });
    if (routeLine) { map.removeLayer(routeLine); routeLine = null; }
    if (!id) return;
    var s = shopById(id);
    routeLine = L.polyline([[HOTEL.lat, HOTEL.lng], [s.lat, s.lng]], {
      color: s.cat.color, weight: 3, opacity: 0.9, dashArray: "1 8", lineCap: "round", interactive: false
    }).addTo(map);
    map.fitBounds([[HOTEL.lat, HOTEL.lng], [s.lat, s.lng]], {
      padding: [70, 70], maxZoom: 17, animate: !reduceMotion.matches
    });
  }

  /* ======================================================================
     NEGOZI: filtri, lista, dettaglio
     ====================================================================== */
  var activeFilter = "all";

  function renderFilters() {
    var items = [{ key: "all", html: "Tutti" }, { key: "open", html: '<span class="chip-dot"></span>Aperti ora' }];
    CAT_ORDER.forEach(function (k) {
      items.push({
        key: k,
        html: '<span class="chip-glyph" style="--c:' + CATS[k].color + '">' + esc(CATS[k].glyph) + "</span>" + esc(CATS[k].label)
      });
    });
    $("#filters").innerHTML = items.map(function (it) {
      return '<button type="button" class="chip" data-filter="' + it.key + '" aria-pressed="' +
        (it.key === activeFilter) + '">' + it.html + "</button>";
    }).join("");
  }

  function visibleShops(now) {
    return shops.filter(function (s) {
      if (activeFilter === "all") return true;
      if (activeFilter === "open") return openInfo(s, now).state === "open";
      return s.category === activeFilter;
    });
  }

  function renderList() {
    var now = tokyoMinutes();
    var list = visibleShops(now);
    var note = $("#filters-note");

    if (activeFilter === "open") {
      var unknown = shops.filter(function (s) { return !s.hours; }).length;
      note.hidden = false;
      note.textContent = list.length
        ? "Ci sono " + unknown + " negozi con orari da verificare: non li conto tra gli aperti."
        : "In questo momento nessun negozio con orari confermati è aperto. Controlla i conbini su Google Maps.";
    } else if (activeFilter !== "all") {
      note.hidden = false;
      note.textContent = CATS[activeFilter].hint;
    } else {
      note.hidden = true;
    }

    $("#shop-list").innerHTML = list.map(function (s) {
      var info = openInfo(s, now);
      return '<li><button type="button" class="shop-card' + (s.featured ? " is-featured" : "") +
        '" data-shop="' + s.id + '">' +
        '<span class="tile" style="--c:' + s.cat.color + '">' + esc(s.cat.glyph) + "</span>" +
        "<span>" +
          '<span class="shop-name">' + esc(s.name) +
            (s.featured ? '<span class="badge-featured">Consigliata</span>' : "") + "</span>" +
          '<span class="shop-jp" style="display:block">' + esc(s.name_jp) + "</span>" +
          '<span class="shop-meta">' +
            "<span>" + esc(distanceShort(s)) + "</span>" +
            '<span class="status status-' + info.state + '">' + esc(info.label) + "</span>" +
          "</span>" +
        "</span>" +
        '<span class="shop-go" aria-hidden="true">›</span>' +
        "</button></li>";
    }).join("");
  }

  function renderDetail(s) {
    var now = tokyoMinutes();
    var info = openInfo(s, now);
    var distBig = s.transit ? "1 fermata" : s.minutes + " min";
    var distCap = s.transit
      ? esc(s.transit) + ", " + (s.dist / 1000).toFixed(1).replace(".", ",") + " km in linea d'aria"
      : "a piedi col passeggino, " + fmtNum(Math.round(s.dist / 10) * 10) + " m in linea d'aria";

    $("#shop-detail").innerHTML =
      '<button type="button" class="detail-back" id="detail-back">← Tutti i negozi</button>' +
      '<div class="detail-head">' +
        '<span class="tile tile-lg" style="--c:' + s.cat.color + '">' + esc(s.cat.glyph) + "</span>" +
        "<div><h2>" + esc(s.name) + "</h2>" +
        '<div class="shop-jp">' + esc(s.name_jp) + "</div></div>" +
      "</div>" +
      '<div class="detail-status">' +
        '<span class="status status-' + info.state + '">' + esc(info.label) + "</span>" +
        (info.sub ? "<span>" + esc(info.sub) + "</span>" : "") +
        "<span>" + esc(s.hours_text) + "</span>" +
      "</div>" +
      '<div class="distance"><span class="distance-big">' + esc(distBig) + "</span>" +
        '<span class="distance-cap">' + distCap + "</span></div>" +
      '<div class="actions">' +
        '<a class="btn btn-primary" href="' + mapsUrl(s) + '" target="_blank" rel="noopener">' +
          (s.transit ? "Indicazioni in treno" : "Indicazioni a piedi") + "</a>" +
        '<a class="btn" href="' + telUrl(s.phone) + '">Chiama</a>' +
        '<button type="button" class="btn" id="btn-show-address">Mostra il nome in giapponese</button>' +
      "</div>" +
      '<p class="section-title">Cosa trovi</p>' +
      '<ul class="finds">' + s.finds.map(function (f) { return "<li>" + esc(f) + "</li>"; }).join("") + "</ul>" +
      '<p class="tip">' + esc(s.why) + " " + esc(s.tip) + "</p>" +
      (s.address_jp
        ? '<div class="address"><span class="address-jp">' + esc(s.address_jp) + "</span>" +
          '<button type="button" class="btn" id="btn-copy">Copia</button></div>'
        : "") +
      (s.approx ? '<p class="approx-note">Posizione sulla mappa indicativa: usa le indicazioni per arrivare esatto.</p>' : "");

    $("#detail-back").addEventListener("click", closeDetail);
    $("#btn-show-address").addEventListener("click", function (e) {
      openShow({ jp: s.name_jp + (s.address_jp ? "\n" + s.address_jp : ""), romaji: s.name, it: s.why }, e.currentTarget);
    });
    var copy = $("#btn-copy");
    if (copy) copy.addEventListener("click", function () {
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(s.address_jp).then(
          function () { toast("Indirizzo copiato"); },
          function () { toast("Copia non riuscita: tieni premuto sul testo"); }
        );
      } else {
        toast("Copia non disponibile: tieni premuto sul testo");
      }
    });
  }

  function selectShop(id, opts) {
    var s = shopById(id);
    if (!s) return;
    opts = opts || {};
    selectedId = id;
    showView("negozi");
    $("#shops-browse").hidden = true;
    $("#shop-detail").hidden = false;
    renderDetail(s);
    highlightOnMap(id);
    if (history.replaceState) history.replaceState(null, "", "#" + id);
    if (opts.fromMap && isPhone.matches) {
      $(".panel").scrollIntoView({ behavior: reduceMotion.matches ? "auto" : "smooth", block: "start" });
    } else {
      $(".panel").scrollTop = 0;
    }
  }

  function closeDetail() {
    var lastId = selectedId;
    selectedId = null;
    $("#shop-detail").hidden = true;
    $("#shops-browse").hidden = false;
    highlightOnMap(null);
    fitAll(!reduceMotion.matches);
    if (history.replaceState) history.replaceState(null, "", location.pathname);
    var card = lastId && document.querySelector('[data-shop="' + lastId + '"]');
    if (card) card.focus();
  }

  /* ======================================================================
     SCHEDE
     ====================================================================== */
  function showView(name) {
    ["negozi", "lista", "frasi"].forEach(function (v) {
      var tab = $("#tab-" + v), view = $("#view-" + v), on = v === name;
      tab.classList.toggle("is-active", on);
      tab.setAttribute("aria-selected", on ? "true" : "false");
      view.hidden = !on;
      view.classList.toggle("is-active", on);
    });
  }

  /* ======================================================================
     LISTA SPESA
     ====================================================================== */
  var state = loadState();

  function loadState() {
    var base = { qty: {}, rate: 170, weight: 10 };
    try {
      var saved = JSON.parse(localStorage.getItem(STORAGE_KEY) || "null");
      if (saved && typeof saved === "object") {
        base.qty = saved.qty || {};
        if (saved.rate > 0) base.rate = saved.rate;
        if (saved.weight > 0) base.weight = saved.weight;
      }
    } catch (e) { /* memoria del browser non disponibile: si riparte vuoti */ }
    return base;
  }
  function saveState() {
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(state)); } catch (e) { /* ignora */ }
  }

  function renderProducts() {
    var groups = [];
    D.products.forEach(function (p) { if (groups.indexOf(p.group) === -1) groups.push(p.group); });
    $("#product-groups").innerHTML = groups.map(function (g) {
      return '<div class="group"><h3>' + esc(g) + "</h3>" +
        D.products.filter(function (p) { return p.group === g; }).map(function (p) {
          var q = state.qty[p.id] || 0;
          return '<div class="product' + (q ? " in-cart" : "") + '" data-product="' + p.id + '">' +
            "<div>" +
              '<div class="product-name">' + esc(p.name) + "</div>" +
              '<div class="product-jp">' + esc(p.jp) + "</div>" +
            "</div>" +
            '<div class="product-right">' +
              '<div class="product-price">' + fmtYen(p.price) + ' <span class="product-src">' + esc(p.src) + "</span></div>" +
              '<div class="stepper">' +
                '<button type="button" data-step="-1" aria-label="Togli ' + esc(p.name) + '"' + (q ? "" : " disabled") + ">−</button>" +
                "<output>" + q + "</output>" +
                '<button type="button" data-step="1" aria-label="Aggiungi ' + esc(p.name) + '">+</button>' +
              "</div>" +
            "</div>" +
          "</div>";
        }).join("") + "</div>";
    }).join("");
  }

  function cartTotals() {
    var yen = 0, count = 0;
    D.products.forEach(function (p) {
      var q = state.qty[p.id] || 0;
      yen += q * p.price;
      count += q;
    });
    return { yen: yen, count: count };
  }

  function updateCart() {
    var t = cartTotals();
    $("#cart-yen").textContent = fmtYen(t.yen);
    $("#cart-eur").textContent = "≈ " + fmtNum(t.yen / state.rate) + " €";
    var badge = $("#cart-badge");
    badge.hidden = t.count === 0;
    badge.textContent = t.count;

    var share = $("#btn-share");
    if (t.count === 0) {
      share.setAttribute("aria-disabled", "true");
      share.href = "#";
    } else {
      share.removeAttribute("aria-disabled");
      var lines = ["Lista spesa bimbe, Ryogoku", ""];
      D.products.forEach(function (p) {
        var q = state.qty[p.id] || 0;
        if (q) lines.push("• " + q + " × " + p.name + "\n   " + p.jp + " — " + fmtYen(q * p.price));
      });
      lines.push("", "Totale stimato: " + fmtYen(t.yen) + " (≈ " + fmtNum(t.yen / state.rate) + " €)");
      lines.push("Farmacia consigliata: Drug Seims, 両国2-10-14, aperta quasi 24 ore");
      lines.push("Mappa: " + location.origin + "/spesa");
      share.href = "https://wa.me/?text=" + encodeURIComponent(lines.join("\n"));
    }
  }

  function changeQty(id, delta) {
    var q = Math.max(0, Math.min(20, (state.qty[id] || 0) + delta));
    if (q) state.qty[id] = q; else delete state.qty[id];
    saveState();
    var row = document.querySelector('[data-product="' + id + '"]');
    if (row) {
      row.querySelector("output").textContent = q;
      row.querySelector('[data-step="-1"]').disabled = q === 0;
      row.classList.toggle("in-cart", q > 0);
    }
    updateCart();
  }

  /* ======================================================================
     TAGLIE, PAROLE, FRASI
     ====================================================================== */
  var KG_MIN = 4, KG_MAX = 22;
  function pct(kg) { return ((kg - KG_MIN) / (KG_MAX - KG_MIN)) * 100; }

  function renderSizes() {
    var w = state.weight;
    var rows = D.sizes.map(function (z) {
      var match = w >= z.min && w <= z.max;
      return '<div class="size-row"><div class="size-band' + (match ? " is-match" : "") +
        '" style="left:' + pct(z.min) + "%;width:" + (pct(z.max) - pct(z.min)) + '%">' +
        esc(z.size) + " · " + z.min + "–" + z.max + " kg</div></div>";
    }).join("");
    var axis = '<div class="size-axis">';
    for (var k = KG_MIN; k <= KG_MAX; k += 2) axis += '<span style="left:' + pct(k) + '%">' + k + "</span>";
    axis += "</div>";
    var clamped = Math.max(KG_MIN, Math.min(KG_MAX, w));
    var marker = '<div class="size-marker" data-kg="' + String(w).replace(".", ",") + ' kg" style="left:' + pct(clamped) + '%"></div>';
    $("#size-scale").innerHTML = rows + axis + marker;

    var m = D.sizes.filter(function (z) { return w >= z.min && w <= z.max; });
    var text;
    if (!m.length && w < D.sizes[0].min) text = "Sotto i " + D.sizes[0].min + " kg serve una taglia più piccola (S): chiedila in farmacia.";
    else if (!m.length) text = "Oltre i " + D.sizes[D.sizes.length - 1].max + " kg cerca la taglia ビッグより大きい (più grande della Big).";
    else if (m.length === 1) text = "Prendi la taglia " + m[0].size + ".";
    else text = "Vanno bene sia la " + m[0].size + " sia la " + m[1].size +
      ": se è vicina al limite alto o si muove tanto, scegli la " + m[1].size + ".";
    $("#size-advice").textContent = text;
  }

  function renderWords() {
    $("#words").innerHTML = D.words.map(function (w) {
      return "<dt>" + esc(w.jp) + "</dt><dd><em>" + esc(w.romaji) + "</em>" + esc(w.it) + "</dd>";
    }).join("");
  }

  function renderPhrases() {
    $("#phrases").innerHTML = D.phrases.map(function (p, i) {
      return '<button type="button" class="phrase" data-phrase="' + i + '">' +
        '<span class="phrase-jp">' + esc(p.jp) + "</span>" +
        '<span class="phrase-it">' + esc(p.it) + "</span></button>";
    }).join("");
  }

  /* ---------- Mostra a tutto schermo ---------- */
  var showOpener = null;
  function openShow(item, opener) {
    showOpener = opener || null;
    $("#show-jp").innerHTML = esc(item.jp).replace(/\n/g, "<br>");
    $("#show-romaji").textContent = item.romaji || "";
    $("#show-it").textContent = item.it || "";
    $("#show").hidden = false;
    document.body.style.overflow = "hidden";
    $("#show-close").focus();
  }
  function closeShow() {
    $("#show").hidden = true;
    document.body.style.overflow = "";
    if (showOpener) showOpener.focus();
  }

  /* ---------- Orologio di Tokyo ---------- */
  var lastMinute = -1;
  function tick() {
    var now = tokyoMinutes();
    $("#tokyo-clock").textContent = fmtTime(now);
    if (now !== lastMinute) {
      if (lastMinute !== -1) {
        renderList();
        if (selectedId) renderDetail(shopById(selectedId));
      }
      lastMinute = now;
    }
  }

  /* ======================================================================
     EVENTI
     ====================================================================== */
  function bindEvents() {
    document.querySelector(".tabs").addEventListener("click", function (e) {
      var tab = e.target.closest(".tab");
      if (tab) showView(tab.dataset.view);
    });

    $("#filters").addEventListener("click", function (e) {
      var chip = e.target.closest(".chip");
      if (!chip) return;
      activeFilter = chip.dataset.filter;
      renderFilters();
      renderList();
    });

    $("#shop-list").addEventListener("click", function (e) {
      var card = e.target.closest(".shop-card");
      if (card) selectShop(card.dataset.shop);
    });

    $("#product-groups").addEventListener("click", function (e) {
      var btn = e.target.closest("[data-step]");
      if (!btn) return;
      changeQty(btn.closest("[data-product]").dataset.product, parseInt(btn.dataset.step, 10));
    });

    var rate = $("#rate");
    rate.value = state.rate;
    rate.addEventListener("input", function () {
      var v = parseFloat(rate.value);
      if (v >= 50 && v <= 400) { state.rate = v; saveState(); updateCart(); }
    });

    $("#btn-clear").addEventListener("click", function () {
      if (!cartTotals().count) return;
      if (!window.confirm("Vuoi svuotare la lista spesa?")) return;
      state.qty = {};
      saveState();
      renderProducts();
      updateCart();
      toast("Lista svuotata");
    });

    var weight = $("#weight");
    weight.value = state.weight;
    weight.addEventListener("input", function () {
      var v = parseFloat(String(weight.value).replace(",", "."));
      if (v >= 2 && v <= 30) { state.weight = v; saveState(); renderSizes(); }
    });

    $("#phrases").addEventListener("click", function (e) {
      var btn = e.target.closest(".phrase");
      if (btn) openShow(D.phrases[parseInt(btn.dataset.phrase, 10)], btn);
    });

    $("#show-close").addEventListener("click", closeShow);
    $("#show").addEventListener("click", function (e) { if (e.target.id === "show") closeShow(); });
    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape" && !$("#show").hidden) closeShow();
    });
  }

  /* ======================================================================
     AVVIO
     ====================================================================== */
  renderFilters();
  renderList();
  renderProducts();
  updateCart();
  renderSizes();
  renderWords();
  renderPhrases();
  bindEvents();
  initMap();
  tick();
  setInterval(tick, 20000);

  var fromHash = location.hash.replace("#", "");
  if (fromHash && shopById(fromHash)) selectShop(fromHash);

  // Per i test automatici
  window.__spesa = { openInfo: openInfo, metersBetween: metersBetween, walkMinutes: walkMinutes };
})();
