# Diario delle versioni

Ogni rilascio ha un numero nel formato MAGGIORE.MINORE.CORREZIONE:

- MAGGIORE cambia quando stravolgi l'app (es. 2.0.0)
- MINORE cambia quando aggiungi una funzione nuova (es. 1.1.0)
- CORREZIONE cambia quando sistemi un errore o un testo (es. 1.1.1)

## 4.6.0 — 22 ottobre 2026

Aggiunto
- Meteo nel planner: quando i giorni entrano nei 16 giorni di previsione, caselle e righe
  mostrano il tempo e le temperature della città del capitolo (Tokyo o Kyoto)
- Nella scheda del giorno: previsione completa e, se piove, il piano per la pioggia.
  Se il piano scelto non è al coperto e c'è un'alternativa che lo è, l'app la propone
- Nella pagina Oggi, durante il viaggio: il meteo di oggi con il consiglio giusto
- "Aggiungi il viaggio al calendario": i 23 giorni con il piano scelto, uscita dall'hotel
  e volo del 5 gennaio con promemoria, scadenze delle prenotazioni ancora da fare
- "Aggiungi questa giornata al calendario" in ogni scheda
- Prima del 29 novembre la pagina Viaggio dice da quando arriveranno le previsioni

## 4.5.0 — 22 ottobre 2026

Aggiunto
- Lista della spesa da 10 a 21 prodotti, con i marchi più diffusi in Giappone
- Per ogni prodotto: il marchio, dove si trova davvero (farmacia, konbini, supermercato,
  negozi per bimbi), "Guarda le foto della confezione" con il nome giapponese esatto
  e "Come riconoscerlo" sullo scaffale
- Nuovo gruppo "Dal konbini": onigiri, tamago sando, pollo fritto del banco caldo,
  frutta tagliata, budino, latte, Pocari Sweat
- Nuovo gruppo "Se arriva la febbre": cerotti rinfrescanti, OS-1, gallette per bebè
- Filtro rapido: Tutto, In farmacia, Al konbini

Note
- Le foto non sono copiate nell'app (appartengono ai marchi e le confezioni cambiano spesso):
  il pulsante apre le immagini aggiornate della confezione
- Prezzi della farmacia verificati; quelli dei konbini sono indicativi (segno ≈)

## 4.4.0 — 22 ottobre 2026

Aggiunto
- Frasario (sezione 話 Frasi): 86 frasi in 9 situazioni, dalle parole magiche alle emergenze,
  con ricerca, preferite, "Mostra" a tutto schermo e "Ascolta" con la voce giapponese del telefono.
  Funziona anche offline
- La carta delle allergie: si scelgono chi e cosa, la frase in giapponese si scrive da sola
- Pagina SOS: 119, 110 e Japan Visitor Hotline con un tocco, come chiamare il 119,
  gli indirizzi dei tre hotel da mostrare a tutto schermo, gli ospedali con pediatria vicino
  a ogni hotel, altri numeri utili, Ambasciata e Consolato, i dati dell'assicurazione
- Scorciatoia SOS nella pagina Oggi
- Consigli per usare Google Traduttore come scorta

Modificato
- Nella barra in basso 話 Frasi prende il posto di 富 Fuji: il Fuji-metro resta nella pagina Oggi
  e nelle schede dei giorni del Fuji
- La copia di sicurezza include anche preferite, allergie e assicurazione

## 4.3.0 — 21 ottobre 2026

Restyling: ora tutta l'app parla la stessa lingua visiva.

Modificato
- Percorsi ridisegnati come una linea del treno: ogni passo è una stazione con il suo sigillo,
  sulla linea del colore del capitolo di arrivo. Si apre una stazione alla volta
- L'app ricorda a che passo siete e cosa avete spuntato, anche se il telefono si chiude
- Frasi giapponesi dei percorsi da mostrare a tutto schermo con un tocco
- Biglietto per il taxi a tutto schermo, con caratteri grandi
- Spesa con la grafica della v4: intestazione 買い物, mappa incorniciata, linguette a pillola,
  negozi con il sigillo della categoria, carrello blu notte, frasi come nel resto dell'app
- Testi di Percorsi e Spesa con la voce dell'app

## 4.2.0 — 21 ottobre 2026

Tutti i 23 giorni sono completi.

Aggiunto
- Capodanno ad Asakusa completo: l'ultimo dell'anno con la soba della lunga vita,
  il primo giorno con la prima visita al tempio e l'acquario di Sumida, le borse fortunate,
  Nakano Broadway e la partenza
- Dove mangiare quando quasi tutto è chiuso (orari di Capodanno dell'anno scorso, segnalati come tali)
- La sezione 着 Arrivo diventa 道 Percorsi, con quattro roadmap passo passo:
  Narita → Ryogoku, Ryogoku → Kyoto, Kyoto → Asakusa, Asakusa → Narita
- Biglietto per il taxi con l'indirizzo giusto in ogni percorso
- Le schede dei giorni di trasferimento portano al percorso passo passo

Modificato
- I passi dei percorsi sono ora in dati_percorsi.py

## 4.1.0 — 21 ottobre 2026

Aggiunto
- Capitolo Kyoto completo, giorni 26–30: shinkansen verso Kyoto, Kyoto classica
  (Fushimi Inari e Kiyomizu-dera), Arashiyama con il trenino di Sagano, gita a Nara,
  Museo dei treni, gita a Osaka (acquario Kaiyukan e Dotonbori), Universal Studios Japan
- Pasti verificati: Gyoza no Ohsho (nato a Kyoto), kitsune udon, mochi di Nakatanidou,
  takoyaki di Dotonbori, cena in appartamento dal Daimaru
- Chiusure di fine anno: trenino di Sagano (fino al 29/12), Museo dei treni (30/12–1/1)
- Due nuove cose da prenotare: trenino di Sagano e acquario di Osaka (dal 30 novembre)
- Missioni per le bimbe e frasi del giorno per tutti i giorni di Kyoto

## 4.0.0 — 21 ottobre 2026

Il pacchetto wow: l'app cambia faccia.

Aggiunto
- Il cielo vivo in cima a Oggi: segue l'ora vera (alba, giorno, tramonto, notte con stelle e luna)
  e il meteo vero (nuvole, pioggia, neve, nebbia) della città del capitolo: Tokyo o Kyoto
- La frase sotto il cielo con temperatura e un consiglio ("Cappellino e guanti per le bimbe")
- Prova del cielo: neve, pioggia, alba e tramonto anche prima di partire
- Un colore per capitolo: Tokyo indaco, Kyoto cachi, Capodanno oro
- Titoli dei capitoli in verticale: 東京, 京都, お正月
- Parole giapponesi nei titoli delle sezioni, con la pronuncia
- Il timbro 決 ("deciso") quando si sceglie un piano
- Passaggi fluidi tra le sezioni (sui browser che li supportano)

Modificato
- Nuovi caratteri: Shippori Mincho per i titoli, Zen Kaku Gothic New per il testo
- La voce dell'app in tutti i testi: calda e ironica, giocosa per le bimbe

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
