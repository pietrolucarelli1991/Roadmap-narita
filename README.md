# 🇯🇵 Roadmap Narita → Ryogoku View Hotel
**App web interattiva — Famiglia Lucarelli • 14 Dic 2026**

---

## Struttura del progetto

```
roadmap_app/
├── app.py                  # Server Flask + dati dei 8 step
├── requirements.txt        # Dipendenze Python
├── templates/
│   └── index.html          # Interfaccia web interattiva
└── static/
    └── css/
        └── style.css       # Stile grafico
```

---

## Come avviare (in VS Code)

### 1. Apri il terminale integrato
`Ctrl+ò` oppure `View → Terminal`

### 2. Installa le dipendenze
```bash
pip install -r requirements.txt
```

### 3. Avvia il server
```bash
python app.py
```

### 4. Apri nel browser
```
http://localhost:5000
```

---

## Cosa fa l'app

- **Mappa visuale a sinistra** con 8 step cliccabili
- **Dettaglio interattivo a destra** con 4 schede:
  - **Azioni** — checklist interattiva (clicca per spuntare)
  - **Cartelli** — simboli reali aeroporto/treno con traduzione JP
  - **Giapponese** — frasi da mostrare allo schermo
  - **Bimbe** — consigli pratici passeggini e kids
- **Pulsante tassista** (step 7) — mostra l'indirizzo in giapponese grande
- **Barra costi** in basso — sempre visibile
- **Navigazione** precedente/successivo tra gli step

---

## API JSON (bonus per sviluppatori)

```
GET /api/steps        → tutti gli 8 step
GET /api/step/1       → solo step 1
GET /api/step/6       → solo step 6 (treno Keisei)
```

---

## Note tecniche

- Python 3.8+ richiesto
- Flask 3.x
- Zero dipendenze frontend (vanilla JS + CSS puro)
- Font: Inter + Noto Serif JP (Google Fonts, richiede connessione)
- Responsive mobile incluso
