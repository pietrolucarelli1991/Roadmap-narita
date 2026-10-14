# Diario delle versioni

Ogni rilascio ha un numero nel formato MAGGIORE.MINORE.CORREZIONE:

- MAGGIORE cambia quando stravolgi l'app (es. 2.0.0)
- MINORE cambia quando aggiungi una funzione nuova (es. 1.1.0)
- CORREZIONE cambia quando sistemi un errore o un testo (es. 1.1.1)

## 1.1.0 — 14 ottobre 2026

Aggiunto
- Pagina "Spesa per le bimbe" su /spesa con mappa OpenStreetMap
- 8 negozi verificati intorno al Ryogoku View Hotel: farmacie, conbini, supermercato, negozio baby
- Cerchi dei minuti a piedi col passeggino attorno all'hotel
- Stato "aperto ora" calcolato sull'ora di Tokyo
- Lista spesa con prezzi di riferimento 2026, totale in yen ed euro, invio su WhatsApp
- Guida taglie pannolini in base al peso, parole da riconoscere, frasi da mostrare
- Invito alla mappa spesa nello step 8 della roadmap
- Numero di versione visibile in fondo alle pagine

Modificato
- Dati dei negozi spostati in dati_spesa.py, così si aggiornano senza toccare il codice
- requirements.txt ripulito: solo flask e gunicorn

Corretto
- Le schede della roadmap ora funzionano anche sui browser più vecchi

## 1.0.0 — 13 ottobre 2026

- Prima versione: roadmap interattiva Narita → Ryogoku in 8 step, pubblicata su Render
