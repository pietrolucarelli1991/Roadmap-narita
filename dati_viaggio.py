"""
Itinerario del viaggio: 14–26 dicembre 2026, 12 notti al Ryogoku View Hotel.

È una BOZZA da sistemare insieme. Le date fisse sono:
- 17 dicembre: Studio Tour Harry Potter (biglietto già preso)
- 19 dicembre: Jump Festa (se arriva il biglietto)
Il giorno del Fuji si sceglie in base al meteo (finestra 21–23 dicembre).

Ogni giorno ha:
- "kanji": il timbro del giorno, con lettura e significato
- "mood": "leggera", "piena" oppure "jolly"
- "parts": i momenti della giornata
- "maps": luoghi da aprire in Google Maps (nome in giapponese = più preciso)
- "phrase": la frase giapponese del giorno
"""

TRIP = {
    "start": "2026-12-14",
    "end": "2026-12-26",
    "nights": 12,
    "hotel": "Ryogoku View Hotel",
}

DAYS = [
    {
        "date": "2026-12-14",
        "kanji": "着", "reading": "chaku", "meaning": "arrivo",
        "title": "Benvenuti a Tokyo",
        "mood": "leggera",
        "parts": [
            {"when": "Giornata", "what": "Da Narita all'hotel seguendo gli 8 step della roadmap dell'arrivo."},
            {"when": "Pomeriggio", "what": "Check-in e prime scorte per le bimbe da Drug Seims, a pochi minuti dall'hotel."},
            {"when": "Sera", "what": "Cena semplice vicino all'hotel e tutti a nanna presto."},
        ],
        "tip": "Il primo giorno vince chi va piano: l'obiettivo è solo arrivare, mangiare e dormire. Un po' di luce del giorno aiuta col fuso orario.",
        "links": [
            {"label": "Roadmap dell'arrivo", "href": "/arrivo"},
            {"label": "Spesa per le bimbe", "href": "/spesa#seims"},
        ],
        "maps": [],
        "phrase": {"jp": "よろしくお願いします", "romaji": "Yoroshiku onegaishimasu", "it": "Piacere, conto su di voi (per presentarsi)"},
    },
    {
        "date": "2026-12-15",
        "kanji": "博", "reading": "haku", "meaning": "museo",
        "title": "Ryogoku, il quartiere del sumo",
        "mood": "leggera",
        "parts": [
            {"when": "Mattina", "what": "Museo Edo-Tokyo, riaperto a marzo 2026 e a pochi minuti a piedi dall'hotel: ricostruzioni a grandezza naturale della vecchia Tokyo."},
            {"when": "Pranzo", "what": "Chanko, lo stufato dei lottatori di sumo, da Tomoegata: seggioloni e piatti per bambini. Chiude il lunedì, oggi è martedì."},
            {"when": "Pomeriggio", "what": "Riposo in hotel, poi passeggiata lungo il fiume Sumida."},
        ],
        "tip": "Le palestre dei lottatori di sumo sono proprio qui intorno: per strada può capitare di incontrarli in kimono.",
        "links": [],
        "maps": [
            {"label": "Museo Edo-Tokyo", "q": "江戸東京博物館"},
            {"label": "Chanko Tomoegata", "q": "ちゃんこ巴潟 両国"},
        ],
        "phrase": {"jp": "いただきます", "romaji": "Itadakimasu", "it": "Si dice prima di mangiare"},
    },
    {
        "date": "2026-12-16",
        "kanji": "秋", "reading": "aki", "meaning": "il primo kanji di Akihabara",
        "title": "Akihabara, la città elettrica",
        "mood": "piena",
        "parts": [
            {"when": "Mattina", "what": "Akihabara, 2 fermate col treno JR Sobu da Ryogoku. Caccia alle figure usate al Mandarake Complex."},
            {"when": "Pomeriggio", "what": "Parco di Ueno, poco distante: spazio per correre dopo i negozi."},
        ],
        "tip": "Fate a turno: uno va a caccia di figure, l'altro porta le bimbe al parco, poi vi date il cambio. Nei negozi piccoli servono i contanti.",
        "links": [],
        "maps": [
            {"label": "Mandarake Complex", "q": "まんだらけコンプレックス 秋葉原"},
            {"label": "Parco di Ueno", "q": "上野恩賜公園"},
        ],
        "phrase": {"jp": "これはいくらですか？", "romaji": "Kore wa ikura desu ka?", "it": "Quanto costa questo?"},
    },
    {
        "date": "2026-12-17",
        "kanji": "魔", "reading": "ma", "meaning": "magia",
        "title": "Il giorno della magia",
        "mood": "piena",
        "parts": [
            {"when": "Mattina", "what": "Verso lo Studio Tour Harry Potter, stazione Toshimaen. Con la linea Oedo si parte da Ryogoku: controlla su Google Maps se serve un cambio."},
            {"when": "Giornata", "what": "Calcola 4–5 ore dentro, circa 6 porta a porta. Ci sono rampe, fasciatoi, sale allattamento e guardaroba gratuito."},
            {"when": "Sera", "what": "Cena tranquilla vicino all'hotel."},
        ],
        "tip": "L'orario sul biglietto è l'inizio del tour: meglio arrivare prima. E mangiate prima che qualcuno abbia fame, non dopo.",
        "links": [],
        "maps": [
            {"label": "Studio Tour Tokyo", "q": "ワーナー ブラザース スタジオツアー東京"},
        ],
        "phrase": {"jp": "写真を撮ってもいいですか？", "romaji": "Shashin o tottemo ii desu ka?", "it": "Posso fare una foto?"},
    },
    {
        "date": "2026-12-18",
        "kanji": "塔", "reading": "tō", "meaning": "torre",
        "title": "Sulla torre più alta",
        "mood": "leggera",
        "parts": [
            {"when": "Mattina", "what": "Tokyo Skytree e il centro commerciale Solamachi, dove c'è anche un Jump Shop."},
            {"when": "Pomeriggio", "what": "Asakusa e il tempio Senso-ji, dall'altra parte del fiume Sumida."},
            {"when": "Sera", "what": "Rientro presto: domani c'è la Jump Festa."},
        ],
        "tip": "Dalla torre, con il cielo limpido, a volte si vede il Fuji in lontananza: guardate verso ovest.",
        "links": [],
        "maps": [
            {"label": "Tokyo Skytree", "q": "東京スカイツリー"},
            {"label": "Tempio Senso-ji", "q": "浅草寺"},
        ],
        "phrase": {"jp": "トイレはどこですか？", "romaji": "Toire wa doko desu ka?", "it": "Dov'è il bagno?"},
    },
    {
        "date": "2026-12-19",
        "kanji": "祭", "reading": "matsuri", "meaning": "festa",
        "title": "Jump Festa",
        "mood": "piena",
        "parts": [
            {"when": "Mattina", "what": "Jump Festa a Makuhari Messe, dalle 9 alle 17. Ingresso gratuito ma solo con il biglietto dell'app Jump NAVI. I biglietti per i gadget ufficiali valgono solo al mattino."},
            {"when": "Mamma e bimbe", "what": "Mattina tranquilla vicino all'hotel: la fiera è molto affollata."},
            {"when": "Sera", "what": "Tutti insieme: si mostra il bottino."},
        ],
        "tip": "Nel 2025 ci sono state oltre 120.000 persone. Se il biglietto non arriva, scambia questo giorno con il giorno jolly e vai a Odaiba, dove c'è un Mugiwara Store.",
        "links": [],
        "maps": [
            {"label": "Makuhari Messe", "q": "幕張メッセ"},
        ],
        "phrase": {"jp": "一番人気はどれですか？", "romaji": "Ichiban ninki wa dore desu ka?", "it": "Qual è il più popolare?"},
    },
    {
        "date": "2026-12-20",
        "kanji": "休", "reading": "kyū", "meaning": "riposo",
        "title": "Giorno jolly",
        "mood": "jolly",
        "parts": [
            {"when": "A scelta", "what": "Riposo vero, oppure il secondo giorno di Jump Festa, oppure Odaiba con il Mugiwara Store."},
            {"when": "Se piove", "what": "Il Museo Edo-Tokyo, se non l'avete già visto: è a pochi minuti dall'hotel."},
        ],
        "tip": "Con 12 notti, un giorno senza programmi è un regalo: le bimbe lo ricorderanno quanto i giorni pieni.",
        "links": [],
        "maps": [
            {"label": "Mugiwara Store Odaiba", "q": "麦わらストア お台場"},
        ],
        "phrase": {"jp": "すみません", "romaji": "Sumimasen", "it": "Scusi, permesso (la parola più utile del viaggio)"},
    },
    {
        "date": "2026-12-21",
        "kanji": "富", "reading": "fu", "meaning": "il primo kanji di Fuji",
        "title": "Il Fuji",
        "mood": "piena",
        "parts": [
            {"when": "Quando", "what": "Il 21, 22 o 23 dicembre: scegliete il primo giorno limpido. La funivia del lago Kawaguchiko è prevista chiusa fino al 18 dicembre."},
            {"when": "Mattina", "what": "Bus presto da Shinjuku a Kawaguchiko. Una sola attività col Fuji, al mattino, quando si vede meglio."},
            {"when": "Poi", "what": "Oishi Park, che ha anche un parco giochi per le bimbe."},
        ],
        "tip": "In inverno evitate la salita alla 5ª stazione. Controllate la visibilità la sera prima: nella prossima versione lo farà il Fuji-metro dell'app.",
        "links": [],
        "maps": [
            {"label": "Stazione Kawaguchiko", "q": "河口湖駅"},
            {"label": "Oishi Park", "q": "大石公園 富士河口湖町"},
        ],
        "phrase": {"jp": "富士山が見えますか？", "romaji": "Fujisan ga miemasu ka?", "it": "Si vede il Fuji?"},
    },
    {
        "date": "2026-12-22",
        "kanji": "宝", "reading": "takara", "meaning": "tesoro",
        "title": "La caccia al tesoro",
        "mood": "piena",
        "parts": [
            {"when": "Tarda mattina", "what": "Nakano Broadway: 33 negozi Mandarake, e lo Special 8 è dedicato alle figure dei manga shonen. Molti negozi non aprono prestissimo."},
            {"when": "Pausa", "what": "Nel seminterrato c'è Daily Chiko, famoso per i suoi gelati altissimi."},
            {"when": "Pomeriggio", "what": "Shinjuku, a pochi minuti di treno, oppure rientro."},
        ],
        "tip": "Porta contanti: i negozietti più piccoli li preferiscono. Per una figura usata chiedi sempre se c'è la scatola originale.",
        "links": [],
        "maps": [
            {"label": "Nakano Broadway", "q": "中野ブロードウェイ"},
        ],
        "phrase": {"jp": "箱はありますか？", "romaji": "Hako wa arimasu ka?", "it": "C'è la scatola originale?"},
    },
    {
        "date": "2026-12-23",
        "kanji": "犬", "reading": "inu", "meaning": "cane",
        "title": "Shibuya e il cane fedele",
        "mood": "piena",
        "parts": [
            {"when": "Mattina", "what": "Shibuya: la statua di Hachiko e l'incrocio più famoso del mondo. Il Mugiwara Store principale è al 6° piano di Magnet by Shibuya109."},
            {"when": "Pomeriggio", "what": "Harajuku, dove c'è un altro Mugiwara Store."},
            {"when": "Se serve", "what": "Ultima occasione per il Fuji, se il 21 e il 22 erano nuvolosi."},
        ],
        "tip": "Racconta alla bimba grande la storia di Hachiko prima di andare: il cane che aspettò il suo padrone alla stazione per anni.",
        "links": [],
        "maps": [
            {"label": "Statua di Hachiko", "q": "忠犬ハチ公像"},
            {"label": "Mugiwara Store Shibuya", "q": "麦わらストア 渋谷本店"},
        ],
        "phrase": {"jp": "子ども用の椅子はありますか？", "romaji": "Kodomo-yō no isu wa arimasu ka?", "it": "Avete un seggiolone?"},
    },
    {
        "date": "2026-12-24",
        "kanji": "光", "reading": "hikari", "meaning": "luce",
        "title": "La vigilia delle luci",
        "mood": "leggera",
        "parts": [
            {"when": "Pomeriggio", "what": "Stazione di Tokyo: Mugiwara Store dentro Tokyo Character Street, uscita Yaesu nord, fuori dai tornelli JR."},
            {"when": "Sera", "what": "Luminarie natalizie nella zona di Marunouchi, accanto alla stazione."},
        ],
        "tip": "In Giappone la Vigilia si festeggia con il pollo fritto e la torta con panna e fragole: provatela!",
        "links": [],
        "maps": [
            {"label": "Tokyo Character Street", "q": "東京キャラクターストリート"},
        ],
        "phrase": {"jp": "メリークリスマス", "romaji": "Merī Kurisumasu", "it": "Buon Natale"},
    },
    {
        "date": "2026-12-25",
        "kanji": "鮨", "reading": "sushi", "meaning": "sushi",
        "title": "Natale a tavola",
        "mood": "leggera",
        "parts": [
            {"when": "Mattina", "what": "Mercato esterno di Tsukiji: assaggi di strada davanti ai banchi."},
            {"when": "Sera", "what": "Monjayaki a Tsukishima: si cuoce sulla piastra al tavolo e le bimbe si divertono. Tsukishima è sulla linea Oedo, come Ryogoku."},
        ],
        "tip": "Al mercato si mangia in piedi davanti al banco: è normale e fa parte del divertimento.",
        "links": [],
        "maps": [
            {"label": "Mercato esterno di Tsukiji", "q": "築地場外市場"},
            {"label": "Via del monja a Tsukishima", "q": "月島もんじゃストリート"},
        ],
        "phrase": {"jp": "おいしい！", "romaji": "Oishii!", "it": "Buonissimo!"},
    },
    {
        "date": "2026-12-26",
        "kanji": "帰", "reading": "kaeru", "meaning": "ritorno",
        "title": "Arrivederci Tokyo",
        "mood": "leggera",
        "parts": [
            {"when": "Mattina", "what": "Check-out e ultime scorte per il volo."},
            {"when": "Viaggio", "what": "Verso Narita: la roadmap del ritorno arriverà in una prossima versione."},
            {"when": "In aeroporto", "what": "Il rimborso tax-free si chiede alla partenza, prima del check-in, solo per gli acquisti tax-free non usati in Giappone."},
        ],
        "tip": "Tieni un'ora di margine in più: con bagagli, passeggini e souvenir tutto va più piano.",
        "links": [],
        "maps": [],
        "phrase": {"jp": "ありがとう、また来ます", "romaji": "Arigatō, mata kimasu", "it": "Grazie, torneremo"},
    },
]
