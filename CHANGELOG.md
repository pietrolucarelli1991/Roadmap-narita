# Diario delle versioni

Ogni rilascio ha un numero nel formato MAGGIORE.MINORE.CORREZIONE:

- MAGGIORE cambia quando stravolgi l'app (es. 2.0.0)
- MINORE cambia quando aggiungi una funzione nuova (es. 1.1.0)
- CORREZIONE cambia quando sistemi un errore o un testo (es. 1.1.1)

## 3.1.0 — 16 ottobre 2026

Aggiunto
- Password di famiglia controllata dal server: senza la parola d'ordine non si vedono né
  le pagine né i dati. La password si imposta su Render (variabile APP_PASSWORD), mai nel codice
- Copia di sicurezza: si manda su WhatsApp come link oppure si scarica come file, e si ripristina
- Giorni 19–25 completi: Jump Festa, Odaiba, Stazione di Tokyo, Fuji, Shibuya e Harajuku,
  Nikko, Vigilia delle luci, Natale tra Tsukiji e Tsukishima, con pasti verificati
- Una missione per le piccole esploratrici in ogni giorno completo
- Due nuove cose da prenotare: treno Tobu per Nikko e bus per il Fuji

Modificato
- I testi nuovi hanno la voce dell'app: calda e ironica, giocosa quando parla alle bimbe
- Il service worker non salva mai la pagina della password al posto dell'app

## 3.0.0 — 16 ottobre 2026

Il primo numero cambia perché l'app cambia idea di fondo: da calendario a sorpresa
a planner per scegliere insieme. Il viaggio ora va dal 14 dicembre al 5 gennaio.

Aggiunto
- Il viaggio in 3 capitoli: Tokyo (base Ryogoku), Kyoto con Nara e Osaka, Capodanno ad Asakusa
- Planner dei 23 giorni nella sezione Viaggio: ogni giorno ha uno o più piani da confrontare
- "Ci piace" (cuore) e "Scegliamo questo" per ogni piano
- Avvisi automatici: posto chiuso nel giorno scelto, piano scelto due volte
- Schede complete per i giorni 14–18: tappe, treni, passeggino, costi, pranzo, merenda e cena
  verificati sotto i 1.500 ¥ a persona, piano per la pioggia
- Invio delle scelte su WhatsApp: chi apre il link le copia nella sua app
- Pagina Oggi nuova: conto alla rovescia, i 3 capitoli, le cose da prenotare con le scadenze,
  calendario dei 23 giorni; durante il viaggio il programma del giorno e il timbro di fine giornata
- Note per ogni giorno

Modificato
- Il calendario dell'Avvento è stato sostituito dal planner (i timbri restano)
- Le scelte, i cuori e le note restano salvati anche in modalità prova; i timbri di prova no

## 2.1.0 — 16 ottobre 2026

Aggiunto
- Fuji-metro (nuova sezione 富 Fuji nella barra in basso): voto da 0 a 10 alla visibilità
  del Fuji dal lago Kawaguchiko, mattina e pomeriggio, per i prossimi 16 giorni
- Disegno del Fuji che si copre di nuvole in base alle previsioni del giorno scelto
- Sezione "La vostra finestra del Fuji" (21–23 dicembre) con il giorno consigliato
- Temperature di Tokyo e del lago con consiglio su come vestire le bimbe
- Le ultime previsioni restano salvate per quando sei offline
- Scorciatoia al Fuji-metro nella pagina Oggi e nei giorni 21 e 23 dell'itinerario

Corretto (segnalato da Pietro)
- Le prove fatte con "Prova un giorno del viaggio" non restano più salvate:
  quando torni a oggi o chiudi l'app, caselle e timbri tornano com'erano
- I timbri dei giorni non ancora arrivati, rimasti dalle prove, vengono tolti in automatico
- Nuovo pulsante "Richiudi la casella" nella scheda di ogni giorno
- Nuova voce "Ricomincia da capo" in fondo alla pagina Oggi

Fonte dati: Open-Meteo.com, gratuito e senza chiavi (CC BY 4.0)

## 2.0.0 — 15 ottobre 2026

Il primo numero cambia perché l'app cambia faccia: la pagina iniziale ora è "Oggi"
e la roadmap dell'arrivo si è spostata su /arrivo.

Aggiunto
- App installabile sul telefono e utilizzabile senza internet (service worker)
- Avviso "È pronta una nuova versione" quando pubblichi un aggiornamento
- Barra in basso con 4 sezioni: Oggi, Viaggio, Arrivo, Spesa
- Pagina Oggi: calendario del viaggio a 13 caselle che si aprono un giorno alla volta
- Timbri rossi da collezionare ogni giorno, con album
- Pagina Viaggio: itinerario dei 12 giorni con luoghi, frasi del giorno e note personali
- "Prova un giorno del viaggio" per vedere il calendario prima di partire
- Icona dell'app per la schermata Home

Modificato
- La roadmap dell'arrivo è ora su /arrivo (prima era la pagina iniziale)
- Font uguali in tutte le pagine
- I pezzi di mappa già visti restano salvati per l'uso offline

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
