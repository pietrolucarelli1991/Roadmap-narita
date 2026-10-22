# Tokyo 2026 — contesto per Claude Code

Questo file riassume tutto quello che serve sapere per continuare il progetto.
Leggilo all'inizio di ogni sessione, insieme a `CHANGELOG.md` e `README.md`.

## Chi sono e come lavoro

- Mi chiamo Pietro. Sono **alle prime armi** con la programmazione: guidami **un passo alla volta**,
  spiegando cosa fa ogni comando e cosa devo aspettarmi di vedere.
- Lavoro su **Windows**, con **VS Code** e il terminale **PowerShell**. Python 3.13.
- Preferisco capire prima di fare: quando proponi modifiche, dimmi in breve *cosa* cambia e *perché*.
- Scrivimi in **italiano**.

## Il viaggio

- Famiglia di 4: io, mia moglie, due bimbe di **5 anni** e di **circa 1 anno**, con **2 passeggini**.
- **14 dicembre 2026 → 5 gennaio 2027**, in 3 capitoli:
  1. **Tokyo**, base **Ryogoku View Hotel** (東京都墨田区両国2-19-1), 14–26 dicembre. Natale incluso.
  2. **Kyoto**, base **Stay SAKURA Kyoto Shijo Karasuma** (京都市下京区本柳水町770-2,
     appartamento con cucina e lavatrice), 26–31 dicembre, con gite a **Nara** e **Osaka**.
  3. **Capodanno ad Asakusa**, base **Hotel Keihan Asakusa** (東京都台東区浅草2-12-4), 31 dicembre – 5 gennaio.
- Arrivo a **Narita** il 14/12; partenza da **Narita il 5/1 alle 14:00** (uscire dall'hotel verso le 9:30,
  treno Keisei diretto da Asakusa).
- Date fisse: **Harry Potter Studio Tour il 17/12** (biglietti presi), **Jump Festa 19–20/12** (se arriva il biglietto).
- Fuji: finestra **21–23 dicembre**, si sceglie il giorno più limpido con il Fuji-metro.
- Gite scelte: **Nikko** e **Yokohama**. Sono appassionato di **One Piece** (collezione di action figure,
  cerco anche l'usato: Nakano Broadway, Akihabara, Mugiwara Store).
- **Budget pasti: fino a 1.500 ¥ a persona adulta.** Locali family-friendly, caratteristici, con le specialità.

## L'app

App web Flask, installabile sul telefono (PWA) e funzionante offline.
Online su Render (piano gratuito): https://roadmap-narita.onrender.com
Repository GitHub (privato): pietrolucarelli1991/Roadmap-narita, branch `main`.

### Sezioni (barra in basso, icone kanji)
- `/` **今 Oggi**: prima della partenza conto alla rovescia, 3 capitoli, cose da prenotare, calendario dei 23 giorni.
  Durante il viaggio il programma del giorno e il **timbro** di fine giornata. Contiene anche
  "Prova un giorno del viaggio" (anteprima), "Copia di sicurezza", "Ricomincia da capo".
- `/itinerario` **旅 Viaggio**: planner dei 23 giorni. Ogni giorno ha uno o più piani (A, B, C):
  si confrontano, si mette il cuore, si sceglie. Note per giorno. Invio delle scelte su WhatsApp.
- `/frasi` **話 Frasi**: frasario offline con ricerca, preferite, Mostra e Ascolta (sintesi vocale), carta delle allergie. `/sos`: emergenze.
- `/fuji` Fuji-metro (non più nella barra: si apre dalla pagina Oggi e dai giorni del Fuji), voto 0–10 di visibilità del Fuji da Kawaguchiko (dati Open-Meteo).
- `/arrivo` e `/percorso/<id>` **道 Percorsi**: quattro roadmap passo passo (Narita → Ryogoku, Ryogoku → Kyoto, Kyoto → Asakusa, Asakusa → Narita). Dati in `dati_percorsi.py`.
- `/spesa` **買 Spesa**: mappa Leaflet + OpenStreetMap di farmacie e negozi per le bimbe vicino all'hotel di Ryogoku,
  lista della spesa con prezzi, taglie dei pannolini, frasi.
- `/entra`: pagina della password.

### File principali
```
app.py              # Flask: route, versione, password, manifest, service worker
dati_viaggio.py     # CHAPTERS, PLANS (catalogo piani), DAYS (23 giorni), TODO, FUJI
dati_spesa.py       # negozi, prodotti, taglie, frasi per /spesa
templates/          # _head.html, _nav.html, oggi, itinerario, fuji, index (arrivo), mappa_spesa, entra, sw.js
static/css/         # app.css (stile v2+), style.css (arrivo), spesa.css
static/js/          # app.js (comune), planner.js, oggi.js, itinerario.js, fuji.js, spesa.js
static/icons/       # icone PWA (Fuji con sole rosso)
CHANGELOG.md        # diario delle versioni
```

### Come sono fatti i dati dei piani (`dati_viaggio.py`)
- Un piano ha: `title`, `kanji` (timbro, con `reading` e `meaning`), `kind`, `summary`, `transport`,
  `stroller`, `cost`, `stops` (con `place` → `name`, `q` per Google Maps in giapponese, `closed`, `closed_dates`, `info`),
  `meals` (pranzo/merenda/cena con `price`, `kids`, `hours`, `where`, `q`, `closed`), `rain`, `tip`,
  `kids` (missione giocosa per le bimbe), `phrase` (frase giapponese del giorno), `links`, `treasure` (tappa One Piece).
- `complete: True` = verificato in dettaglio. `False` = solo programma, dettagli in una versione futura (`version`).
- `closed` usa "lun", "mar", "mer", "gio", "ven", "sab", "dom": l'app avvisa se scelgo un piano in un giorno di chiusura.
- In `DAYS` il **primo** piano della lista è quello consigliato.

### Comportamenti importanti
- **Password**: variabile d'ambiente `APP_PASSWORD` impostata su Render. Mai scriverla nel codice o in chat.
  In locale, senza variabile, l'app resta aperta. Sessione di 400 giorni.
- **Service worker** (`templates/sw.js`): su localhost prova prima la rete (vedo subito le modifiche);
  online usa la copia salvata e aggiorna in background. Non salva mai risposte reindirizzate (la pagina password).
- **Versione**: `APP_VERSION` in `app.py`. Va aumentata a **ogni rilascio**: fa comparire "È pronta una nuova versione"
  sui telefoni e rinnova i file salvati offline.
- **Dati dell'utente** in `localStorage` (`tokyo-viaggio-v1`, `spesa-bimbe-v1`): scelte, cuori, note, timbri, cose fatte.
  In modalità prova i timbri vanno in una sandbox e spariscono; scelte, cuori e note restano.
- I dati sono **per telefono**: si condividono con il link delle scelte o con la copia di sicurezza.

## Regole per i contenuti

- **Solo dati verificati**: orari, prezzi, chiusure, indirizzi. Se non sono sicuro, lo scrivo ("da verificare")
  invece di inventare. In passato un negozio non verificato si è rivelato inesistente.
- Ristoranti: family-friendly (seggioloni, menu bimbi, passeggino), **≤ 1.500 ¥ a persona**, con la specialità del posto.
  Se qualcosa sfora, va detto.
- Nomi dei luoghi per Google Maps in **giapponese** (campo `q`), più precisi.
- Fatti utili già verificati: i panda di Ueno sono tornati in Cina a gennaio 2026; il Gundam di Odaiba doveva essere
  smontato ad agosto 2026; dal 1° novembre 2026 il tax-free è a rimborso in aeroporto (consumabili esclusi);
  a Capodanno molti posti chiudono (soprattutto il 1/1), i grandi magazzini riaprono il 2/1 con i fukubukuro.

## Voce dei testi

**Calda e ironica**, come un amico che è già stato in Giappone; **giocosa** quando parla alle bimbe
(il riquadro "Missione per le piccole esploratrici"). Esempi:
- "Mancano 53 giorni. Le valigie non si fanno da sole."
- "Il mercoledì le barche a cigno riposano."
- "Giornata timbrata. 4 su 23: un sesto di viaggio è già un ricordo."
- Bimbe: "Fare ciao al Fuji. Lui non risponde, ma apprezza."

Frasi brevi, niente maiuscole urlate, niente gergo tecnico. Dove serve, una parola giapponese con la pronuncia.

## Design

- Identità: inchiostro `#17191e`, carta `#f7f5f0`, rosso Giappone `#c0392b` (timbri), blu notte `#1b2a47`,
  indaco `#2b4c7e`, verde matcha `#2f7d4f`. Variabili CSS con prefisso `--t-` in `app.css`.
- **Colori dei capitoli** (campo `color` in `CHAPTERS`): Tokyo `#2f5a9a`, Kyoto `#c25a24`, Capodanno `#a07a1c`.
  Si usano con la variabile CSS `--ch`.
- **Font**: Shippori Mincho (titoli, kanji, pesi 500/700/800) e Zen Kaku Gothic New (testo).
- **Il cielo vivo** (`static/js/cielo.js`): fasi `dawn/day/dusk/night` da alba e tramonto veri,
  meteo `clear/partly/cloudy/fog/rain/snow` da Open-Meteo, città presa dal capitolo del giorno (`CHAPTERS[].sky`).
  Prove con i pulsanti `data-sky-demo` (neve, pioggia, alba, tramonto, vero).
- Titoli dei capitoli in verticale (`.chapter-tate`, un kanji sotto l'altro), parola giapponese nei titoli
  (`.jp-label`, `.h-jp`), timbro 決 quando si sceglie un piano, View Transitions tra le pagine.
- Principi: un solo momento memorabile per schermata, il resto sobrio; mobile prima di tutto;
  accessibile (contrasto, focus visibile, `prefers-reduced-motion`); il testo non va mai sopra le nuvole.

## Come si pubblica una nuova versione

1. Aumentare `APP_VERSION` in `app.py` (MAGGIORE.MINORE.CORREZIONE, vedi CHANGELOG).
2. Scrivere la novità in `CHANGELOG.md`.
3. Provare in locale: `python app.py` → http://localhost:5000
4. Pubblicare, in quest'ordine:
   ```
   git add .
   git commit -m "vX.Y.Z: cosa cambia"
   git tag vX.Y.Z
   git push
   git push --tags
   ```
5. Render ripubblica da solo in 1–2 minuti (è `git push` del branch a farlo partire, non il tag).

⚠️ Il remote di git contiene un token: **non mostrare** l'output di `git remote -v` e non scrivere token in chiaro.

## Prossimi passi

| Versione | Contenuto |
|---|---|
| ~~v4.0.0~~ | ✅ Fatto. **Pacchetto wow**: cielo in cima a Oggi che segue ora e meteo veri di Tokyo (alba, giorno, tramonto, notte con stelle; neve o pioggia se succede davvero, dati Open-Meteo); un colore per capitolo (Tokyo indaco invernale, Kyoto cachi e muschio, Capodanno rosso, bianco e oro); font Shippori Mincho per i titoli e Zen Kaku Gothic New per il testo; titoli dei capitoli in verticale (tategaki); voce nuova in tutti i testi vecchi; parola giapponese nei titoli di sezione; passaggi fluidi tra le pagine (View Transitions); timbro 決 quando si sceglie un piano |
| ~~v4.1.0~~ | ✅ Fatto. Kyoto, Nara e Osaka completi (giorni 26–30) |
| ~~v4.2.0~~ | ✅ Fatto. Capodanno completo e sezione 道 Percorsi con 4 roadmap (dati in `dati_percorsi.py`) |
| ~~v4.3.0~~ | ✅ Fatto. Restyling di Percorsi (linea del treno, `static/js/percorso.js`) e Spesa (grafica v4) |
| ~~v4.4.0~~ | ✅ Fatto. Frasario (`/frasi`, dati in `dati_frasi.py`) e SOS (`/sos`). Scelto: niente traduttore integrato, Google Traduttore come scorta |
| ~~v4.5.0~~ | ✅ Fatto. Spesa con 21 prodotti di marca, dove si trovano, foto della confezione (link alla ricerca immagini, niente foto copiate) |
| v4.6.0 | Traduttore integrato col microfono (da decidere: serve un servizio di traduzione con chiave, es. DeepL) |
| v4.7.0 | Meteo dentro il planner (proposta del piano B se piove) e "aggiungi al calendario del telefono" |

Il diario fotografico è stato scartato da Pietro.

## Cose ancora aperte

- Telefono dell'hotel di Ryogoku da verificare sulla prenotazione: nella roadmap c'è 03-3631-3241,
  in una fonte ho trovato 03-3631-8111.
- Biglietto Jump Festa (richiesta entro il 26/10), Museo Ghibli (10/11 alle 2 di notte ora italiana, se interessa),
  shinkansen del 26/12 e del 31/12, treno Tobu per Nikko: da prenotare.
