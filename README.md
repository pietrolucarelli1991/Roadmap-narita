# Roadmap Narita → Ryogoku View Hotel

App web della Famiglia Lucarelli per il viaggio del 14 dicembre 2026.

## Pagine

- `/` — Oggi: calendario del viaggio con i timbri
- `/itinerario` — il planner dei 23 giorni, con i piani alternativi
- `/fuji` — il Fuji-metro
- `/arrivo` — la roadmap in 8 step dall'aeroporto all'hotel
- `/spesa` — mappa dei negozi per pannolini e spesa bimbe

## Struttura

```
roadmap_app/
├── app.py              # Server Flask e step della roadmap
├── dati_spesa.py       # Negozi, prezzi, frasi: si modificano qui
├── dati_viaggio.py     # Capitoli, piani, giorni e cose da prenotare: si modifica qui
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

## Password

L'app online chiede una parola d'ordine. Non è scritta nel codice (il progetto è su GitHub):
si imposta su Render in Environment, con la variabile `APP_PASSWORD`.
Sul PC, se la variabile non c'è, l'app resta aperta per comodità.

## Avviare sul PC

```
pip install -r requirements.txt
python app.py
```

Poi apri http://localhost:5000

## Pubblicare un aggiornamento

1. In `app.py` aumenta `APP_VERSION` (es. da "2.0.0" a "2.0.1")
2. Scrivi la novità in `CHANGELOG.md`
3. Pubblica:

```
git add .
git commit -m "v2.0.1: cosa hai cambiato"
git tag v2.0.1
git push
git push --tags
```

Render si aggiorna da solo in 1–2 minuti. Sui telefoni comparirà
"È pronta una nuova versione": basta toccare Aggiorna.
