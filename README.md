# Roadmap Narita → Ryogoku View Hotel

App web della Famiglia Lucarelli per il viaggio del 14 dicembre 2026.

## Pagine

- `/` — la roadmap in 8 step dall'aeroporto all'hotel
- `/spesa` — mappa dei negozi per pannolini e spesa bimbe

## Struttura

```
roadmap_app/
├── app.py              # Server Flask e step della roadmap
├── dati_spesa.py       # Negozi, prezzi, frasi: si modificano qui
├── requirements.txt    # Librerie Python (flask, gunicorn)
├── CHANGELOG.md        # Diario delle versioni
├── templates/
│   ├── index.html      # Pagina roadmap
│   └── mappa_spesa.html
└── static/
    ├── css/style.css   # Stile roadmap
    ├── css/spesa.css   # Stile mappa spesa
    └── js/spesa.js     # Logica mappa spesa
```

## Avviare sul PC

```
pip install -r requirements.txt
python app.py
```

Poi apri http://localhost:5000

## Pubblicare un aggiornamento

```
git add .
git commit -m "cosa hai cambiato"
git push
```

Render si aggiorna da solo in 1–2 minuti.
