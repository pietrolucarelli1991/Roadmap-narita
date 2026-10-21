"""
I percorsi passo passo (sezione 道 Percorsi).

Ogni percorso ha: titolo, data, destinazione, biglietto per il taxi (facoltativo)
e una lista di passi con lo stesso formato della roadmap dell'arrivo:
n, emoji, title, location, time, cost, cost_detail, actions, kids, japanese, signs.

Fonti principali (ottobre 2026): Keisei (Access Express), JR Central (bagagli voluminosi),
siti degli hotel, guide di viaggio verificate.
"""

# ---------------------------------------------------------------------------
# 1. Narita → Ryogoku (14 dicembre): la roadmap originale dell'app
# ---------------------------------------------------------------------------
STEPS = [
    {
        "n": 1,
        "emoji": "📱",
        "title": "Pre-volo — Visit Japan Web",
        "location": "Casa • Prima della partenza",
        "time": "10 min a casa",
        "cost": "0 ¥",
        "cost_detail": "gratuito",
        "actions": [
            "Crea 1 account su vjw-lp.digital.go.jp per tutta la famiglia",
            "Registra: 2 adulti + Child (5a) + Infant (1.5a) — stesso volo/hotel",
            "Compila Immigration + Customs → genera 1 QR per persona",
            "Screenshot di tutti i QR (anche offline) + salva in preferiti",
            "Prepara marsupio per bimba piccola: mani libere = vittoria"
        ],
        "kids": [
            "Bimba grande fa la foto QR = si sente capitano in seconda",
            "Passeggini già taggati con nome + telefono"
        ],
        "japanese": [
            {"label": "Non serve JP qui", "text": "Mostra solo QR al tablet"}
        ],
        "signs": [
            {"icon": "📱", "en": "Visit Japan Web", "jp": "Visit Japan Web", "note": "QR su telefono — screenshot obbligatorio"}
        ]
    },
    {
        "n": 2,
        "emoji": "🛂",
        "title": "Controllo Passaporti — Joint Kiosk",
        "location": "Narita T1 / T2 — Area arrivi",
        "time": "15–25 min",
        "cost": "0 ¥",
        "cost_detail": "immigrazione",
        "actions": [
            "Segui cartelli gialli [Immigration] → cerca corsia FAMILY / Priority",
            "Joint Kiosk: scansioni tutti e 4 i passaporti uno dopo l'altro",
            "Bimba 5 anni: fa da sola impronta + foto (tu la tieni per mano)",
            "Bimba 1.5 anni: esente impronte, solo foto tenuta in braccio",
            "Staff timbra • ritira scontrino dogana per step successivo"
        ],
        "kids": [
            "Passeggino aperto ammesso in coda, nessun problema",
            "Se coda lunga: chiedi 'Baby priority?' indicano corsia rapida"
        ],
        "japanese": [
            {"label": "Da dire:", "text": "Kazoku desu (Siamo famiglia) — 4 nin"},
            {"label": "Da mostrare:", "text": "Visit Japan Web QR code onegai shimasu"}
        ],
        "signs": [
            {"icon": "🛂", "en": "Immigration / Passport Control", "jp": "入国審査", "note": "Sfondo BLU, scritta bianca — segui frecce gialle"},
            {"icon": "🧑‍💻", "en": "Visit Japan Web / Automated Gates", "jp": "自動化ゲート", "note": "Cartello giallo con QR + scritta Joint Kiosk — 4 persone insieme"},
            {"icon": "👨‍👩‍👧‍👶", "en": "Family / Priority Lane", "jp": "優先レーン / 家族", "note": "Omino con bimbo — corsia larga per passeggini"}
        ]
    },
    {
        "n": 3,
        "emoji": "🧳",
        "title": "Bagagli e Passeggini",
        "location": "Baggage Claim — Narita",
        "time": "15–20 min",
        "cost": "0 ¥",
        "cost_detail": "ritiro",
        "actions": [
            "Nastro bagagli: monitor mostra numero volo",
            "Passeggini: spesso escono su nastro OVERSIZED accanto, non sul nastro normale",
            "Carrelli gratis: 1 carrello = 2 trolley + 1 zaino",
            "Baby Room a lato nastri: fasciatoio + acqua calda se serve reset",
            "Conta: 4 bagagli? Apri subito 2 passeggini, incastra zaini sotto"
        ],
        "kids": [
            "Bimba grande sul carrello (gioco del razzo) = niente corsa",
            "Marsupio ora: piccola davanti, mani libere per trolley"
        ],
        "japanese": [
            {"label": "Da mostrare allo staff:", "text": "Bebīkā doko desu ka? (Dov'è il passeggino?)"}
        ],
        "signs": [
            {"icon": "🧳", "en": "Baggage Claim", "jp": "手荷物受取所", "note": "Valigia nera su giallo — guarda monitor n. volo"},
            {"icon": "👶", "en": "Oversized Baggage / Bulky", "jp": "大型手荷物", "note": "Icona passeggino grande — 20m a lato nastro normale"},
            {"icon": "🛃", "en": "Customs", "jp": "税関", "note": "Cartello rosso 'Customs' dopo ritiro — mostra QR dogana"},
            {"icon": "🍼", "en": "Baby Room / Nursery", "jp": "ベビールーム", "note": "Icona biberon — a lato nastri"}
        ]
    },
    {
        "n": 4,
        "emoji": "💴",
        "title": "ATM + Welcome Suica",
        "location": "Dopo dogana — Atrio arrivi",
        "time": "10 min",
        "cost": "2.000 ¥",
        "cost_detail": "solo 2 adulti • child gratis",
        "actions": [
            "ATM 7-Bank (Seven): logo 7-Eleven VERDE + JP Post ROSSO — funzionano con Visa",
            "Preleva 20.000¥ — commissione bassa, accetta carte estere",
            "Welcome Suica Machine ROSSA vicino JR Gate: Adult 2000¥ (1500 viaggio + 500 deposito)",
            "Child Suica: OPZIONALE — se vuoi farla pagare, serve sportello JR",
            "Tocca Suica ai WIDE GATE (cancello largo 90cm) — perfetto per passeggino"
        ],
        "kids": [
            "Se bimba gratis: passa mano nella mano al WIDE GATE con te — 1 bip per 2",
            "Se Child Suica: rosa = souvenir, falla tenere in tasca sua"
        ],
        "japanese": [
            {"label": "Allo sportello:", "text": "Kodomo Welcome Suica kudasai. 5-sai desu. Ryogoku made."}
        ],
        "signs": [
            {"icon": "🏧", "en": "ATM Seven Bank / JP Bank", "jp": "現金自動預払機 / セブン銀行", "note": "Insegna VERDE 7-Bank + rossa JP — cerca International ATM"},
            {"icon": "💱", "en": "Currency Exchange", "jp": "両替 / 外貨両替", "note": "NON serve, ATM meglio — tasso pessimo"},
            {"icon": "🎫", "en": "JR East / Welcome Suica", "jp": "JR東日本旅行センター / Welcome Suica", "note": "Macchinetta ROSSA grande + sportello verde Midori no Madoguchi"},
            {"icon": "♿", "en": "Priority / Elevator / Wide Gate", "jp": "優先 / エレベーター", "note": "Icona omino con cerchio blu — cancello largo 90cm"}
        ]
    },
    {
        "n": 5,
        "emoji": "🎒",
        "title": "Strategia Bagagli — No Yamato",
        "location": "Narita → treno • Hotel Ryogoku View",
        "time": "5 min organizzazione",
        "cost": "0 ¥",
        "cost_detail": "voi facchini top • 2-19-1 Ryogoku",
        "actions": [
            "Adulto 1: trolley grande + zaino + spinge passeggino con bimba grande",
            "Adulto 2: trolley grande + zaino + bimba piccola in marsupio + passeggino chiuso",
            "Treni giapponesi: bagagli ok fino a 160cm totali senza prenotazione — Keisei ok",
            "Evita fascia pendolari: partite dopo le 10:00 se atterrate la mattina = treno vuoto",
            "Ascensori sempre, non scale mobili con trolley — cerca simbolo ascensore"
        ],
        "kids": [
            "Spuntino + acqua già pronti nello zaino frontale",
            "Priorità posti: cercate carrozza con spazio bagagli dietro ultimo sedile"
        ],
        "japanese": [
            {"label": "Tip:", "text": "Sumimasen, elevator wa doko desu ka?"}
        ],
        "signs": [
            {"icon": "🛗", "en": "Elevator", "jp": "エレベーター", "note": "Segui sempre icona ascensore — MAI scale mobili con trolley"}
        ]
    },
    {
        "n": 6,
        "emoji": "🚃",
        "title": "Keisei Access Express → Asakusabashi",
        "location": "Narita → Asakusabashi (senza cambi)",
        "time": "55 min treno",
        "cost": "2.540 ¥ famiglia",
        "cost_detail": "1.270¥ x2 adulti • bimbe FREE",
        "actions": [
            "Segui segni ARANCIONI Access Express (NON blu Skyliner — quello costa 2.580¥ a persona!)",
            "Riconosci treno GIUSTO: scritta arancione 'Access Express' + destinazione 'Haneda / Asakusa'",
            "Binario Keisei: parte ogni 20 min — treno normale pendolari, non riservato",
            "Sali, cerca Priority Seats + area bagagli fondo carrozza",
            "Fermate: Narita → ... → Asakusa → Asakusabashi (scendi qui!) — 9a fermata dopo Oshiage",
            "Tocca Suica all'uscita: bip unico, no biglietto cartaceo"
        ],
        "kids": [
            "Finestrino lato dx = vista Skytree alla fine",
            "Bimba grande conta fermate: Asakusa è la festa, Asakusabashi è casa"
        ],
        "japanese": [
            {"label": "Sul display treno:", "text": "Asakusabashi de orimasu"},
            {"label": "Se dubbio al capotreno:", "text": "Kono densha wa Asakusabashi ni tomarimasu ka?"}
        ],
        "signs": [
            {"icon": "🚃", "en": "Keisei Line / Access Express", "jp": "京成線 / アクセス特急", "note": "ARANCIONE con scritta Access — icona treno + aereo"},
            {"icon": "✈️", "en": "Narita Sky Access", "jp": "成田スカイアクセス", "note": "Linea arancione, NON blu Skyliner. Costa metà."},
            {"icon": "🚫", "en": "NOT Skyliner (blu)", "jp": "スカイライナーではありません", "note": "Se vedi BLU + sedili riservati = SBAGLIATO, costa 2.580¥"},
            {"icon": "🚉", "en": "To Asakusa / Haneda", "jp": "浅草・羽田方面", "note": "Sul display: Asakusa / Haneda — verifica fermi a Asakusabashi"}
        ]
    },
    {
        "n": 7,
        "emoji": "🚕",
        "title": "Asakusabashi + Taxi → Ryogoku View Hotel",
        "location": "Uscita A4 con ascensore → Taxi",
        "time": "5–7 min taxi",
        "cost": "1.000–1.500 ¥",
        "cost_detail": "~8–12€",
        "actions": [
            "Asakusabashi: segui Exit A4 — UNICO con ascensore (cruciale con trolley)",
            "Fuori: Taxi stand a 20m a destra, o alza mano — Taxi rossi sempre liberi",
            "Mostra al tassista foglio con indirizzo giapponese (sezione sotto)",
            "Corsa: 1.2km, 4 min, attraversa fiume Sumida — vista bellissima",
            "Scendi davanti a Ryogoku View Hotel — parcheggio coperto per scarico"
        ],
        "kids": [
            "Taxi JPN hanno porte automatiche: non toccare!",
            "Chiedi seggiolino? Non serve per taxi in Giappone (legge esenta)"
        ],
        "japanese": [
            {"label": "Da mostrare GRANDE:", "text": "両国ビューホテルまでお願いします\n墨田区両国2-19-1"},
            {"label": "Aggiungi:", "text": "JR両国駅西口から1分です"}
        ],
        "signs": [
            {"icon": "🅰️", "en": "Exit A4 Elevator", "jp": "出口 A4 エレベーター", "note": "Cartello GIALLO A4 con icona ascensore — UNICO con ascensore!"},
            {"icon": "🚕", "en": "Taxi Stand", "jp": "タクシー乗り場", "note": "Icona taxi + freccia — 20m fuori A4 a destra"},
            {"icon": "🏨", "en": "Ryogoku View Hotel", "jp": "両国ビューホテル", "note": "2-19-1 Ryogoku — 1 min da JR Ryogoku West Exit"}
        ]
    },
    {
        "n": 8,
        "emoji": "✅",
        "title": "Check-in — Ryogoku View Hotel",
        "location": "2-19-1 Ryogoku, Sumida-ku • 1 min da JR Ryogoku West Exit",
        "time": "15 min",
        "cost": "0 ¥",
        "cost_detail": "già pagato • bagagli con voi",
        "actions": [
            "Check-in 15:00 — se arrivi prima: 'Nimotsu azukatte kudasai' (tenete bagagli)",
            "Chiedi: stanza piano alto, vista Skytree? / Yokuasa (letto basso) per bimbe",
            "Conbini vicino: FamilyMart 50m a sinistra + Lawson 100m — pannolini + onigiri",
            "Bagno rigenerante: vasca grande in camera — perfetto dopo volo",
            "Missione compiuta: sei arrivato, papà. Birra + Skytree dalla finestra."
        ],
        "kids": [
            "Hotel presta bollitore + cuscini extra — chiedi in reception",
            "Passeggini in camera: entrano, ascensore hotel grande"
        ],
        "japanese": [
            {"label": "Check-in:", "text": "Lucarelli desu. Check-in onegai shimasu."},
            {"label": "Bagagli:", "text": "Nimotsu o azukatte kudasai"}
        ],
        "signs": [
            {"icon": "✅", "en": "Hotel — Missione compiuta", "jp": "両国ビューホテル到着", "note": "2-19-1 — hai portato tutto tu, senza Yamato!"}
        ]
    }
]


# ---------------------------------------------------------------------------
# 2. Ryogoku → Kyoto (26 dicembre)
# ---------------------------------------------------------------------------
STEPS_KYOTO = [
    {
        "n": 1, "emoji": "🧳",
        "title": "Valigie: prenotare o spedire",
        "location": "Hotel di Ryogoku • il giorno prima",
        "time": "10 minuti",
        "cost": "0–1.000 ¥", "cost_detail": "a bagaglio, se non prenotato",
        "actions": [
            "Misurate i trolley: se la somma di altezza, larghezza e profondità supera i 160 cm, va prenotato il posto per bagagli voluminosi",
            "La prenotazione si fa solo insieme al biglietto dello shinkansen; senza, a bordo si pagano 1.000 ¥ a bagaglio",
            "Alternativa comoda: spedite le valigie da hotel a hotel. Chiedete alla reception come fare e in quanto tempo arrivano",
            "Nella borsa a mano: pannolini, pappe, cambio e medicine per due giorni",
        ],
        "kids": [
            "La bimba grande prepara il suo zainetto da viaggiatrice: un gioco, un libro, una merenda",
        ],
        "japanese": [
            {"label": "Spedire le valigie", "text": "荷物を京都のホテルに送りたいです (Nimotsu o Kyōto no hoteru ni okuritai desu)"},
        ],
        "signs": [
            {"icon": "📦", "en": "Luggage delivery", "jp": "宅急便", "note": "Takkyūbin: il servizio di spedizione bagagli"},
        ],
    },
    {
        "n": 2, "emoji": "🚕",
        "title": "Check-out e taxi per la stazione di Tokyo",
        "location": "Ryogoku → stazione di Tokyo, lato Yaesu",
        "time": "15–25 minuti",
        "cost": "taxi o treno", "cost_detail": "in treno: JR fino ad Akihabara, poi Yamanote fino a Tokyo",
        "actions": [
            "Con valigie e passeggini il taxi è la scelta più tranquilla: mostrate il biglietto qui sotto",
            "In treno: linea JR Sobu fino ad Akihabara (2 fermate), poi Yamanote o Keihin-Tohoku fino a Tokyo (2 fermate)",
            "Calcolate almeno 30 minuti di margine prima del treno: la stazione di Tokyo è enorme",
        ],
        "kids": [
            "Chi trova per primo il cartello 新幹線 (shinkansen) vince il posto vicino al finestrino",
        ],
        "japanese": [
            {"label": "Al tassista", "text": "東京駅の八重洲口までお願いします (Tōkyō-eki no Yaesu-guchi made onegaishimasu)"},
        ],
        "signs": [
            {"icon": "🚪", "en": "Yaesu Exit", "jp": "八重洲口", "note": "Il lato della stazione con l'ingresso dello shinkansen Tokaido"},
        ],
    },
    {
        "n": 3, "emoji": "🍱",
        "title": "Bento e binario dello shinkansen",
        "location": "Stazione di Tokyo • tornelli dello shinkansen Tokaido",
        "time": "20–30 minuti",
        "cost": "circa 1.000–1.500 ¥", "cost_detail": "a bento",
        "actions": [
            "Seguite i cartelli blu del Tokaido Shinkansen (東海道新幹線)",
            "Prima dei tornelli o subito dopo ci sono i negozi di ekiben, i bento da treno",
            "Controllate sul biglietto numero di carrozza (号車) e di posto, e mettetevi sul segno del binario",
        ],
        "kids": [
            "Esistono bento a forma di shinkansen: è il momento di scoprirlo",
        ],
        "japanese": [
            {"label": "Dov'è il binario?", "text": "新幹線のりばはどこですか？ (Shinkansen noriba wa doko desu ka?)"},
        ],
        "signs": [
            {"icon": "🚄", "en": "Tokaido Shinkansen", "jp": "東海道新幹線", "note": "Cartelli blu"},
            {"icon": "🔢", "en": "Car No.", "jp": "号車", "note": "Numero della carrozza, segnato anche sul pavimento del binario"},
        ],
    },
    {
        "n": 4, "emoji": "🚄",
        "title": "Nozomi verso Kyoto",
        "location": "A bordo • poco più di 2 ore",
        "time": "circa 2 ore e 15 minuti",
        "cost": "biglietti presi prima", "cost_detail": "le bimbe sotto i 6 anni senza posto proprio non pagano",
        "actions": [
            "Andando verso Kyoto, il Fuji si vede dal lato destro, a circa metà viaggio, se il cielo è limpido",
            "I bagagli voluminosi prenotati vanno nello spazio dietro l'ultima fila",
            "Il treno è silenzioso: telefonate nello spazio tra le carrozze",
        ],
        "kids": [
            "Contare le gallerie. Poi contare di nuovo, perché qualcuno ha sbagliato",
            "Fare ciao al Fuji dal finestrino",
        ],
        "japanese": [
            {"label": "Scendiamo a Kyoto", "text": "京都で降ります (Kyōto de orimasu)"},
        ],
        "signs": [
            {"icon": "🗻", "en": "Mt. Fuji", "jp": "富士山", "note": "Lato destro andando verso Kyoto"},
        ],
    },
    {
        "n": 5, "emoji": "🚕",
        "title": "Da Kyoto all'appartamento",
        "location": "Stazione di Kyoto → Stay SAKURA Kyoto Shijo Karasuma",
        "time": "circa 10–15 minuti",
        "cost": "taxi o bus", "cost_detail": "c'è una fermata del bus davanti all'appartamento",
        "actions": [
            "All'uscita della stazione seguite i cartelli del taxi (タクシー)",
            "Mostrate al tassista il biglietto con l'indirizzo in giapponese",
            "In alternativa il bus, che ferma davanti all'appartamento",
        ],
        "kids": [
            "Prima missione a Kyoto: trovare la torre di Kyoto davanti alla stazione. Sembra una candela!",
        ],
        "japanese": [
            {"label": "Al tassista", "text": "この住所までお願いします (Kono jūsho made onegaishimasu)"},
        ],
        "signs": [
            {"icon": "🚕", "en": "Taxi", "jp": "タクシーのりば", "note": "Fermata dei taxi"},
        ],
    },
    {
        "n": 6, "emoji": "🔑",
        "title": "Check-in dalle 15 alle 21",
        "location": "Stay SAKURA Kyoto Shijo Karasuma",
        "time": "15 minuti",
        "cost": "0 ¥", "cost_detail": "già pagato",
        "actions": [
            "La reception è aperta dalle 15 alle 21: se arrivate prima, chiedete se possono tenere i bagagli",
            "L'appartamento ha cucina e lavatrice: prima lavatrice del capitolo, prima vittoria",
            "Cena facile vicino: i gyoza di Gyoza no Ohsho, nato proprio a Kyoto",
        ],
        "kids": [
            "Scegliere chi dorme dove nella casa nuova",
        ],
        "japanese": [
            {"label": "Check-in", "text": "チェックインをお願いします (Chekku-in o onegaishimasu)"},
        ],
        "signs": [
            {"icon": "🏠", "en": "Reception", "jp": "フロント", "note": "Furonto"},
        ],
    },
]

# ---------------------------------------------------------------------------
# 3. Kyoto → Asakusa (31 dicembre)
# ---------------------------------------------------------------------------
STEPS_ASAKUSA = [
    {
        "n": 1, "emoji": "🌅",
        "title": "Check-out presto e taxi per la stazione",
        "location": "Stay SAKURA → stazione di Kyoto",
        "time": "15 minuti",
        "cost": "taxi o bus", "cost_detail": "il check-out è entro le 11, ma voi partite prima",
        "actions": [
            "Per arrivare a Tokyo in mattinata, partite da Kyoto verso le 8–9",
            "Ultimo giro dell'appartamento: caricabatterie, ciuccio, peluche del cuore",
            "Taxi per la stazione di Kyoto: mostrate la frase qui sotto",
        ],
        "kids": [
            "Salutare la casa di Kyoto: さようなら! (sayōnara)",
        ],
        "japanese": [
            {"label": "Al tassista", "text": "京都駅までお願いします (Kyōto-eki made onegaishimasu)"},
        ],
        "signs": [
            {"icon": "🚄", "en": "Shinkansen", "jp": "新幹線", "note": "Seguite i cartelli dei tornelli dello shinkansen"},
        ],
    },
    {
        "n": 2, "emoji": "🍙",
        "title": "Colazione da treno",
        "location": "Stazione di Kyoto",
        "time": "15 minuti",
        "cost": "1.000–1.500 ¥", "cost_detail": "a bento",
        "actions": [
            "Bento, onigiri e frutta prima dei tornelli o vicino ai binari",
            "Ricordate i bagagli voluminosi: lo spazio va prenotato anche al ritorno",
        ],
        "kids": [
            "Onigiri: scegliere quello col disegno più strano sulla confezione",
        ],
        "japanese": [
            {"label": "Questo, per favore", "text": "これをください (Kore o kudasai)"},
        ],
        "signs": [
            {"icon": "🍱", "en": "Ekiben", "jp": "駅弁", "note": "Bento da treno"},
        ],
    },
    {
        "n": 3, "emoji": "🚄",
        "title": "Nozomi verso Tokyo",
        "location": "A bordo • poco più di 2 ore",
        "time": "circa 2 ore e 15 minuti",
        "cost": "biglietti presi prima", "cost_detail": "",
        "actions": [
            "Andando verso Tokyo il Fuji si vede dal lato sinistro",
            "Scendete alla stazione di Tokyo, il capolinea",
            "Il 31 si va controcorrente: è il giorno in cui molti lasciano Tokyo, non quello in cui arrivano",
        ],
        "kids": [
            "Ultimo saluto al Fuji. Questa volta dal finestrino opposto!",
        ],
        "japanese": [
            {"label": "È la stazione di Tokyo?", "text": "東京駅ですか？ (Tōkyō-eki desu ka?)"},
        ],
        "signs": [
            {"icon": "🗻", "en": "Mt. Fuji", "jp": "富士山", "note": "Lato sinistro andando verso Tokyo"},
        ],
    },
    {
        "n": 4, "emoji": "🚃",
        "title": "Due treni brevi fino ad Asakusa",
        "location": "Tokyo → Akihabara → Asakusa",
        "time": "circa 20–30 minuti",
        "cost": "pochi centinaia di yen", "cost_detail": "a adulto, con la Suica",
        "actions": [
            "Linea JR Yamanote o Keihin-Tohoku dalla stazione di Tokyo ad Akihabara: 2 fermate",
            "Ad Akihabara cambiate per la Tsukuba Express (つくばエクスプレス) fino ad Asakusa: 1 fermata",
            "Uscite dalla A1 della stazione Tsukuba Express di Asakusa: l'hotel è a 2 minuti",
            "In alternativa, taxi dal lato Yaesu della stazione di Tokyo",
        ],
        "kids": [
            "Cercare insieme i cartelli エレベーター (ascensore): con i passeggini sono la vostra stella polare",
        ],
        "japanese": [
            {"label": "Dov'è l'ascensore?", "text": "エレベーターはどこですか？ (Erebētā wa doko desu ka?)"},
        ],
        "signs": [
            {"icon": "🚇", "en": "Tsukuba Express", "jp": "つくばエクスプレス", "note": "Ad Akihabara, verso Asakusa"},
            {"icon": "🚪", "en": "Exit A1", "jp": "A1出口", "note": "Uscita più vicina all'hotel"},
        ],
    },
    {
        "n": 5, "emoji": "🏨",
        "title": "Hotel Keihan Asakusa: bagagli in reception",
        "location": "Asakusa 2-12-4",
        "time": "10 minuti",
        "cost": "0 ¥", "cost_detail": "già pagato",
        "actions": [
            "Se è presto per il check-in, chiedete di lasciare i bagagli e uscite leggeri",
            "Il Senso-ji è a 5 minuti a piedi: è la vostra nuova base per Capodanno",
            "Fate scorta al konbini: il 1° gennaio molti posti sono chiusi",
        ],
        "kids": [
            "Trovare dalla finestra (o dalla strada) la grande lanterna rossa del Kaminarimon",
        ],
        "japanese": [
            {"label": "Possiamo lasciare i bagagli?", "text": "荷物を預けてもいいですか？ (Nimotsu o azukete mo ii desu ka?)"},
        ],
        "signs": [
            {"icon": "🏨", "en": "Hotel Keihan Asakusa", "jp": "ホテル京阪 浅草", "note": "2-12-4 Asakusa"},
        ],
    },
    {
        "n": 6, "emoji": "🍜",
        "title": "La soba di fine anno",
        "location": "Asakusa • la sera del 31",
        "time": "la sera",
        "cost": "sotto i 1.500 ¥", "cost_detail": "a ciotola, di solito",
        "actions": [
            "La toshikoshi soba si mangia il 31, prima di mezzanotte: i noodle lunghi portano lunga vita",
            "A mezzanotte la campana del Senso-ji suona per l'anno nuovo",
            "I treni corrono tutta la notte: chi vuole vivere la mezzanotte al tempio può farlo",
        ],
        "kids": [
            "Mangiare la soba facendo slurp: in Giappone è educato!",
        ],
        "japanese": [
            {"label": "Buona fine d'anno", "text": "よいお年を (Yoi otoshi o)"},
        ],
        "signs": [
            {"icon": "🍜", "en": "Soba", "jp": "そば", "note": "Toshikoshi soba: 年越しそば"},
        ],
    },
]

# ---------------------------------------------------------------------------
# 4. Asakusa → Narita (5 gennaio, volo alle 14)
# ---------------------------------------------------------------------------
STEPS_NARITA = [
    {
        "n": 1, "emoji": "⏰",
        "title": "Il piano del mattino",
        "location": "Hotel Keihan Asakusa",
        "time": "dalle 7:30",
        "cost": "0 ¥", "cost_detail": "",
        "actions": [
            "Volo alle 14: in aeroporto entro le 11, quindi uscite dall'hotel verso le 9:30",
            "Colazione presto e check-out con calma",
            "Passaporti, biglietti e ricevute tax-free nella stessa tasca",
        ],
        "kids": [
            "Ultimo giro della stanza a caccia di calzini dispersi: chi ne trova di più vince",
        ],
        "japanese": [
            {"label": "Check-out", "text": "チェックアウトをお願いします (Chekku-auto o onegaishimasu)"},
        ],
        "signs": [
            {"icon": "🧾", "en": "Tax-free receipts", "jp": "免税", "note": "Menzei: tenete le ricevute a portata di mano"},
        ],
    },
    {
        "n": 2, "emoji": "🚕",
        "title": "Dall'hotel alla stazione Toei di Asakusa",
        "location": "Hotel → stazione della linea Toei Asakusa",
        "time": "8–10 minuti a piedi",
        "cost": "a piedi o taxi breve", "cost_detail": "con le valigie il taxi fa la differenza",
        "actions": [
            "Attenzione: serve la stazione della linea Toei Asakusa, non quella della Tsukuba Express vicino all'hotel",
            "Con valigie e passeggini, una corsa in taxi breve vi risparmia fatica",
            "Cercate gli ingressi con l'ascensore",
        ],
        "kids": [
            "Salutare la lanterna del Kaminarimon: またね! (mata ne, a presto)",
        ],
        "japanese": [
            {"label": "Al tassista", "text": "都営浅草線の浅草駅までお願いします (Toei Asakusa-sen no Asakusa-eki made onegaishimasu)"},
        ],
        "signs": [
            {"icon": "🚇", "en": "Toei Asakusa Line", "jp": "都営浅草線", "note": "La linea del treno diretto per Narita"},
        ],
    },
    {
        "n": 3, "emoji": "🚆",
        "title": "Access Express diretto per Narita",
        "location": "Linea Toei Asakusa → aeroporto di Narita",
        "time": "circa 55–80 minuti",
        "cost": "circa 1.300 ¥", "cost_detail": "a adulto; bimbe sotto i 6 anni gratis",
        "actions": [
            "Prendete un Access Express (アクセス特急) diretto a 成田空港 (Narita Airport): non tutti i treni ci vanno, controllate il cartello",
            "Si resta seduti fino all'aeroporto, senza cambi",
            "Con la Suica la tariffa è qualche yen più bassa",
        ],
        "kids": [
            "Contare le fermate al contrario fino all'aeroporto, come un conto alla rovescia",
        ],
        "japanese": [
            {"label": "Va a Narita?", "text": "成田空港に行きますか？ (Narita Kūkō ni ikimasu ka?)"},
        ],
        "signs": [
            {"icon": "🚆", "en": "Access Express", "jp": "アクセス特急", "note": "Tipo di treno giusto"},
            {"icon": "✈️", "en": "Narita Airport", "jp": "成田空港", "note": "Destinazione"},
        ],
    },
    {
        "n": 4, "emoji": "🛫",
        "title": "Scendere al terminal giusto",
        "location": "Aeroporto di Narita",
        "time": "5 minuti",
        "cost": "0 ¥", "cost_detail": "",
        "actions": [
            "Controllate sul biglietto aereo il vostro terminal",
            "Terminal 2 e 3: stazione 空港第2ビル (Airport Terminal 2·3), la penultima",
            "Terminal 1: stazione 成田空港 (Narita Airport), il capolinea",
        ],
        "kids": [
            "Trovare il primo aereo dalla vetrata",
        ],
        "japanese": [
            {"label": "Quale terminal?", "text": "第何ターミナルですか？ (Dai nan tāminaru desu ka?)"},
        ],
        "signs": [
            {"icon": "🛫", "en": "Terminal 2·3", "jp": "空港第2ビル", "note": "Penultima fermata"},
            {"icon": "🛫", "en": "Terminal 1", "jp": "成田空港", "note": "Capolinea"},
        ],
    },
    {
        "n": 5, "emoji": "🧾",
        "title": "Rimborso tax-free e check-in",
        "location": "Terminal di partenza",
        "time": "30–60 minuti",
        "cost": "0 ¥", "cost_detail": "",
        "actions": [
            "Dal 1° novembre 2026 il tax-free funziona a rimborso: si chiede alla partenza, seguendo i cartelli e le istruzioni sulle ricevute",
            "I prodotti consumati in Giappone, come pannolini e pappe, non danno rimborso",
            "Poi check-in, controlli di sicurezza e un ultimo giro dei negozi",
        ],
        "kids": [
            "Spendere le ultime monetine al konbini dell'aeroporto: vince il souvenir più strano",
        ],
        "japanese": [
            {"label": "Grazie di tutto", "text": "いろいろありがとうございました (Iroiro arigatō gozaimashita)"},
        ],
        "signs": [
            {"icon": "🧾", "en": "Tax refund", "jp": "免税", "note": "Menzei"},
        ],
    },
    {
        "n": 6, "emoji": "👋",
        "title": "Sayōnara, Giappone",
        "location": "Gate",
        "time": "l'ultimo minuto",
        "cost": "0 ¥", "cost_detail": "i ricordi sono gratis",
        "actions": [
            "23 giorni, 3 capitoli, tanti timbri: guardate insieme il calendario nell'app",
            "Il diario lo completiamo a casa",
        ],
        "kids": [
            "Promettere al Giappone di tornare. Con la mano sul cuore",
        ],
        "japanese": [
            {"label": "Torneremo", "text": "また来ます (Mata kimasu)"},
        ],
        "signs": [
            {"icon": "✈️", "en": "Departures", "jp": "出発", "note": "Shuppatsu"},
        ],
    },
]

ROUTES = [
    {
        "id": "arrivo", "path": "/arrivo", "date": "2026-12-14",
        "from": "Narita", "to": "Ryogoku", "short": "Arrivo",
        "sub": "14 dicembre • dall'aeroporto all'hotel",
        "cost_badge": "~21–25€", "cost_total": "3.540–4.040 ¥", "cost_note": "~21–25€ • bimbe gratis",
        "dest": "Ryogoku View Hotel", "dest_small": "2-19-1 Ryogoku",
        "taxi_step": 7,
        "taxi": {"jp": "両国ビューホテルまで<br>お願いします", "detail": "墨田区両国2-19-1<br>JR両国駅西口から1分<br>Tel: 03-3631-3241"},
        "steps": STEPS,
    },
    {
        "id": "ryogoku-kyoto", "path": "/percorso/ryogoku-kyoto", "date": "2026-12-26",
        "from": "Ryogoku", "to": "Kyoto", "short": "Verso Kyoto",
        "sub": "26 dicembre • in shinkansen verso il secondo capitolo",
        "cost_badge": "shinkansen", "cost_total": "biglietti dello shinkansen", "cost_note": "più taxi e bento",
        "dest": "Stay SAKURA Kyoto Shijo Karasuma", "dest_small": "Honryusuicho 770-2",
        "taxi_step": 5,
        "taxi": {"jp": "Stay SAKURA 京都 四条烏丸<br>までお願いします", "detail": "京都市下京区本柳水町770-2"},
        "steps": STEPS_KYOTO,
    },
    {
        "id": "kyoto-asakusa", "path": "/percorso/kyoto-asakusa", "date": "2026-12-31",
        "from": "Kyoto", "to": "Asakusa", "short": "Verso Asakusa",
        "sub": "31 dicembre • rientro a Tokyo per Capodanno",
        "cost_badge": "shinkansen", "cost_total": "biglietti dello shinkansen", "cost_note": "più taxi e pochi yen di treno",
        "dest": "Hotel Keihan Asakusa", "dest_small": "2-12-4 Asakusa",
        "taxi_step": 4,
        "taxi": {"jp": "ホテル京阪 浅草<br>までお願いします", "detail": "東京都台東区浅草2-12-4<br>つくばエクスプレス浅草駅 A1出口から2分"},
        "steps": STEPS_ASAKUSA,
    },
    {
        "id": "asakusa-narita", "path": "/percorso/asakusa-narita", "date": "2027-01-05",
        "from": "Asakusa", "to": "Narita", "short": "Partenza",
        "sub": "5 gennaio • volo alle 14, uscita dall'hotel alle 9:30",
        "cost_badge": "~2.600 ¥", "cost_total": "circa 2.600 ¥", "cost_note": "due adulti • bimbe gratis",
        "dest": "Aeroporto di Narita", "dest_small": "Volo alle 14:00",
        "taxi_step": 2,
        "taxi": {"jp": "都営浅草線の<br>浅草駅までお願いします", "detail": "都営浅草線 浅草駅"},
        "steps": STEPS_NARITA,
    },
]
