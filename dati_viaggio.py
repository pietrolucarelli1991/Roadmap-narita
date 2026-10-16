"""
Il viaggio: 14 dicembre 2026 – 5 gennaio 2027, in 3 capitoli.

Come è fatto:
- CHAPTERS: i tre capitoli, ognuno con il suo hotel di base
- PLANS:    il catalogo dei piani (un piano può comparire in più giorni)
- DAYS:     i 23 giorni; per ognuno la lista dei piani tra cui scegliere (il primo è il consigliato)
- TODO:     le cose da prenotare prima di partire

Giorni di chiusura: "closed" è una lista tra "lun", "mar", "mer", "gio", "ven", "sab", "dom".
"closed_dates" è una lista di date precise (es. chiusure di Capodanno).
L'app usa questi dati per avvisarvi se scegliete un piano in un giorno in cui un posto è chiuso.

"complete": True vuol dire che il piano è verificato in dettaglio (orari, prezzi, ristoranti).
I piani con False hanno già il programma, i dettagli arrivano nelle prossime versioni.

Fonti principali (ottobre 2026): siti ufficiali, The Tokyo Chapter (blog di famiglia a Tokyo),
Gurunavi, Time Out Tokyo, Kanagawa Travel.
"""

# Fuji-metro: punti per le previsioni e finestra del viaggio
FUJI = {
    "forecast_days": 16,
    "window": {"start": "2026-12-21", "end": "2026-12-23"},
    "points": {
        "summit": {"name": "Cima del Fuji", "lat": 35.3606, "lng": 138.7274},
        "lake": {"name": "Lago Kawaguchiko", "lat": 35.5130, "lng": 138.7550},
        "tokyo": {"name": "Ryogoku", "lat": 35.6954, "lng": 139.7926},
    },
    "ropeway_note": "La funivia del lago Kawaguchiko è prevista chiusa dal 7 al 18 dicembre 2026.",
}

TRIP = {
    "start": "2026-12-14",
    "end": "2027-01-05",
    "budget_meal": 1500,
}

CHAPTERS = [
    {
        "id": "tokyo1",
        "title": "Tokyo",
        "subtitle": "Base Ryogoku, con il Natale",
        "start": "2026-12-14",
        "end": "2026-12-26",
        "glyph": "東",
        "hotel": "Ryogoku View Hotel",
        "hotel_jp": "両国ビューホテル",
        "address_jp": "東京都墨田区両国2-19-1",
    },
    {
        "id": "kyoto",
        "title": "Kyoto",
        "subtitle": "Con le gite a Nara e Osaka",
        "start": "2026-12-26",
        "end": "2026-12-31",
        "glyph": "京",
        "hotel": "Stay SAKURA Kyoto Shijo Karasuma",
        "hotel_jp": "Stay SAKURA 京都 四条烏丸",
        "address_jp": "京都市下京区本柳水町770-2",
        "hotel_note": "Appartamento con cucina e lavatrice. Check-in dalle 15 alle 21, check-out alle 11.",
    },
    {
        "id": "tokyo2",
        "title": "Capodanno",
        "subtitle": "Base Asakusa, fino alla partenza",
        "start": "2026-12-31",
        "end": "2027-01-05",
        "glyph": "春",
        "hotel": "Hotel Keihan Asakusa",
        "hotel_jp": "ホテル京阪 浅草",
        "address_jp": "東京都台東区浅草2-12-4",
        "hotel_note": "2 minuti dall'uscita A1 della stazione Tsukuba Express di Asakusa, 5 minuti dal Senso-ji.",
    },
]

# ---------------------------------------------------------------------------
# Ristoranti verificati (riusati in più piani)
# ---------------------------------------------------------------------------
DANDADAN = {
    "name": "Nikujyu no Gyoza Dandadan Asakusabashi",
    "jp": "肉汁餃子のダンダダン 浅草橋店",
    "what": "Gyoza grossi e succosi, la specialità della casa",
    "price": "circa 1.500 ¥ a persona",
    "kids": "Accoglie i bambini, ha il menu in inglese e fa anche da asporto",
    "hours": "Feriali 11:45–15 e 16–24, weekend 11:45–24",
    "where": "Asakusabashi, a circa 600 metri dalla stazione di Ryogoku",
    "q": "肉汁餃子のダンダダン 浅草橋店",
}
TOMOEGATA = {
    "name": "Chanko Tomoegata",
    "jp": "ちゃんこ巴潟",
    "what": "Chanko-nabe, lo stufato dei lottatori di sumo. Ristorante fondato da un ex lottatore",
    "price": "pranzo circa 1.000 ¥",
    "kids": "Seggioloni, piatti per bambini e passeggini ammessi",
    "where": "Ryogoku 2-17-6, a due passi dall'hotel",
    "q": "ちゃんこ巴潟 両国",
    "closed": ["lun"],
}
JURAKU = {
    "name": "Juraku Ueno",
    "jp": "聚楽 上野",
    "what": "Trattoria giapponese anni '60 (yoshoku): menu per bimbi e gelati galleggianti colorati",
    "price": "circa 1.500 ¥ a persona",
    "kids": "Seggioloni, piatti e posate di plastica per i piccoli, tutto non fumatori",
    "hours": "11:30–21 (ultimi ordini alle 20)",
    "where": "Ueno 6-11-11, accanto alla stazione",
    "q": "聚楽 上野",
}
MARUI_FOOD = {
    "name": "Area ristoranti di Marui Ueno (6° piano)",
    "jp": "上野マルイ 6F",
    "what": "Food court e pasta all'italiana-giapponese: ognuno sceglie quello che vuole",
    "price": "1.000–2.000 ¥ a piatto",
    "kids": "Seggioloni e piatto bimbi con i pancake. Al piano B2 c'è la sala allattamento con acqua calda",
    "where": "2 minuti dalla stazione di Ueno",
    "q": "上野マルイ",
}
KAMASHO = {
    "name": "Fukagawa Kamasho",
    "jp": "深川釜匠",
    "what": "Fukagawa-meshi: riso con zuppa di vongole e porri, il piatto dei pescatori di Edo",
    "price": "pranzo circa 1.050 ¥",
    "kids": "Bambini benvenuti, si può portare la pappa, passeggini ammessi. Sala al piano di sopra con tatami",
    "hours": "Martedì e giovedì solo 11–15, gli altri giorni 11–22",
    "where": "Shirakawa 2-1-13, 2 minuti dalla stazione Kiyosumi-Shirakawa",
    "q": "深川釜匠",
    "closed": ["lun"],
}

PLANS = {
    # ===================== COMPLETI (v3.0.0) =====================
    "arrivo": {
        "title": "Benvenuti a Tokyo",
        "kanji": "着", "reading": "chaku", "meaning": "arrivo",
        "kind": "fisso",
        "complete": True,
        "summary": "Da Narita all'hotel con la roadmap in 8 step, poi prime scorte e una cena facile.",
        "transport": "Treno Keisei fino ad Asakusabashi, poi taxi",
        "stroller": "facile",
        "cost": "circa 4.000 ¥ di trasporti per tutta la famiglia",
        "stops": [
            {"when": "Giornata", "what": "Da Narita all'hotel seguendo gli 8 step della roadmap dell'arrivo."},
            {"when": "Pomeriggio", "what": "Check-in e prime scorte per le bimbe da Drug Seims, a pochi minuti dall'hotel."},
        ],
        "meals": [
            dict(DANDADAN, label="Cena"),
        ],
        "rain": "Non cambia niente: è tutto al coperto o in taxi.",
        "tip": "Il primo giorno vince chi va piano: l'obiettivo è arrivare, mangiare e dormire. Se siete stanchi, Dandadan fa anche da asporto.",
        "links": [{"label": "Roadmap dell'arrivo", "href": "/arrivo"}, {"label": "Spesa per le bimbe", "href": "/spesa#seims"}],
        "phrase": {"jp": "よろしくお願いします", "romaji": "Yoroshiku onegaishimasu", "it": "Piacere, conto su di voi (per presentarsi)"},
    },
    "ryogoku-calma": {
        "title": "Ryogoku con calma",
        "kanji": "博", "reading": "haku", "meaning": "museo",
        "kind": "tokyo",
        "complete": True,
        "summary": "Il museo della vecchia Tokyo sotto casa, il chanko dei lottatori e lo Skytree al tramonto.",
        "transport": "A piedi dall'hotel, poi pochi minuti di treno per lo Skytree",
        "stroller": "facile",
        "cost": "circa 1.600 ¥ di ingressi al museo per due adulti (bimbe gratis)",
        "stops": [
            {"when": "Mattina", "what": "Museo Edo-Tokyo, riaperto a marzo 2026: ricostruzioni a grandezza naturale e zone dove provare i costumi tradizionali. Calcolate 2–3 ore.",
             "place": {"name": "Museo Edo-Tokyo", "q": "江戸東京博物館", "closed": ["lun"],
                       "info": "9:30–17:30 (sabato fino alle 19:30). Adulti circa 800 ¥, gratis fino alle medie"}},
            {"when": "Pomeriggio", "what": "Riposo in hotel per il fuso orario."},
            {"when": "Tardo pomeriggio", "what": "Tokyo Skytree e il centro commerciale Solamachi ai suoi piedi. Salite sulla torre solo se il cielo è limpido.",
             "place": {"name": "Tokyo Skytree", "q": "東京スカイツリー"}},
        ],
        "meals": [
            dict(TOMOEGATA, label="Pranzo"),
            dict(DANDADAN, label="Cena"),
        ],
        "rain": "Va benissimo anche con la pioggia: museo e Solamachi sono al coperto.",
        "tip": "Le palestre dei lottatori di sumo sono qui intorno: per strada può capitare di incontrarli in kimono.",
        "links": [],
        "phrase": {"jp": "いただきます", "romaji": "Itadakimasu", "it": "Si dice prima di mangiare"},
    },
    "fukagawa": {
        "title": "Fukagawa, la Tokyo dei pescatori",
        "kanji": "深", "reading": "fuka", "meaning": "profondo, il primo kanji di Fukagawa",
        "kind": "tokyo",
        "complete": True,
        "summary": "Un quartiere tranquillo con un villaggio Edo ricostruito, un giardino giapponese e il riso alle vongole.",
        "transport": "Linea Oedo da Ryogoku a Kiyosumi-Shirakawa, 2 fermate",
        "stroller": "facile",
        "cost": "circa 1.100 ¥ di ingressi per due adulti (bimbe quasi gratis)",
        "stops": [
            {"when": "Mattina", "what": "Fukagawa Edo Museum: un intero quartiere di Edo ricostruito al chiuso, con case e botteghe in cui entrare.",
             "place": {"name": "Fukagawa Edo Museum", "q": "深川江戸資料館", "info": "Adulti 400 ¥, bambini delle elementari e medie 50 ¥"}},
            {"when": "Dopo pranzo", "what": "Giardino Kiyosumi: laghetto con le carpe koi e le pietre da attraversare.",
             "place": {"name": "Giardino Kiyosumi", "q": "清澄庭園", "info": "Adulti 150 ¥, gratis fino alle elementari"}},
        ],
        "meals": [
            dict(KAMASHO, label="Pranzo"),
            dict(DANDADAN, label="Cena"),
        ],
        "rain": "Il museo è al coperto; il giardino si può saltare.",
        "tip": "Il fukagawa-meshi si può anche portare via in una scatolina, se le bimbe non lo finiscono.",
        "links": [],
        "phrase": {"jp": "これは何ですか？", "romaji": "Kore wa nan desu ka?", "it": "Che cos'è questo?"},
    },
    "yokohama": {
        "title": "Gita a Yokohama",
        "kanji": "浜", "reading": "hama", "meaning": "spiaggia, il kanji di Yokohama",
        "kind": "gita",
        "complete": True,
        "summary": "Il museo di Anpanman per le bimbe, il museo delle Cup Noodles dove create la vostra e i panini al vapore di Chinatown.",
        "transport": "Da Kinshicho (1 fermata da Ryogoku) treno JR diretto fino a Yokohama: circa un'ora in tutto, verificate su Google Maps",
        "stroller": "facile",
        "cost": "il museo Anpanman costa 2.200–2.600 ¥ a persona sopra l'anno di età; Cup Noodles 500 ¥ gli adulti, bimbi gratis",
        "stops": [
            {"when": "Mattina", "what": "Museo di Anpanman: giochi, spettacoli e incontri con i personaggi, per bimbi da 1 a 6 anni. Il piano terra con negozi, panetteria e ristoranti è gratis.",
             "place": {"name": "Museo di Anpanman", "q": "横浜アンパンマンこどもミュージアム", "closed_dates": ["2026-12-31", "2027-01-01", "2027-01-02"],
                       "info": "Museo 10–17 (ultimo ingresso alle 16). Prezzo variabile in base al giorno"}},
            {"when": "Pranzo e primo pomeriggio", "what": "Cup Noodles Museum: con il laboratorio My Cup Noodles disegnate la vostra tazza e scegliete gli ingredienti.",
             "place": {"name": "Cup Noodles Museum", "q": "カップヌードルミュージアム 横浜", "closed": ["mar"],
                       "info": "10–18. Il laboratorio costa 500 ¥ a tazza e si prenota online: i posti finiscono presto"}},
            {"when": "Pomeriggio", "what": "Chinatown con la metro Minatomirai: due passi tra le bancarelle e un panino al vapore."},
        ],
        "meals": [
            {"label": "Pranzo", "name": "Noodles Bazaar", "jp": "カップヌードルミュージアム 4F", "what": "Noodle da tanti Paesi del mondo, al 4° piano del Cup Noodles Museum",
             "price": "porzioni piccole a prezzi bassi", "kids": "Si mangia tutti insieme in un ambiente pensato per le famiglie", "q": "カップヌードルミュージアム 横浜", "closed": ["mar"]},
            {"label": "Merenda", "name": "Panini al vapore di Chinatown", "jp": "中華街 肉まん", "what": "Nikuman: panini morbidi ripieni di carne, dalle bancarelle",
             "price": "pochi centinaia di yen", "kids": "Si mangiano in piedi davanti al banco, come fanno tutti", "q": "横浜中華街"},
            dict(DANDADAN, label="Cena", what="Rientro a Tokyo: gyoza vicino all'hotel"),
        ],
        "rain": "Perfetta anche con la pioggia: i due musei sono al coperto.",
        "tip": "Se il museo di Anpanman vi sembra caro, il piano terra è gratis e ha la panetteria con i panini a forma di personaggi.",
        "links": [],
        "phrase": {"jp": "子ども二人です", "romaji": "Kodomo futari desu", "it": "Siamo con due bambine"},
    },
    "harry-potter": {
        "title": "Il giorno della magia",
        "kanji": "魔", "reading": "ma", "meaning": "magia",
        "kind": "fisso",
        "complete": True,
        "summary": "Lo Studio Tour di Harry Potter a Toshimaen: biglietto già preso.",
        "transport": "Linea Oedo da Ryogoku fino a Toshimaen: controllate su Google Maps se serve un cambio",
        "stroller": "facile",
        "cost": "biglietti già pagati",
        "stops": [
            {"when": "Mattina", "what": "Partenza per lo Studio Tour, 4 minuti a piedi dalla stazione di Toshimaen.",
             "place": {"name": "Studio Tour Tokyo", "q": "ワーナー ブラザース スタジオツアー東京"}},
            {"when": "Giornata", "what": "Calcolate 4–5 ore dentro, circa 6 porta a porta. Ci sono rampe, fasciatoi, sale allattamento e guardaroba gratuito."},
        ],
        "meals": [
            {"label": "Pranzo", "name": "Allo Studio", "jp": "スタジオツアー東京", "what": "Punti ristoro dentro lo Studio",
             "price": "prezzi da parco a tema, sopra il vostro budget", "kids": "Mangiate prima che qualcuno abbia fame, non dopo", "q": "ワーナー ブラザース スタジオツアー東京"},
            dict(DANDADAN, label="Cena"),
        ],
        "rain": "Tutto al coperto.",
        "tip": "L'orario sul biglietto è l'inizio del tour: meglio arrivare prima.",
        "links": [],
        "phrase": {"jp": "写真を撮ってもいいですか？", "romaji": "Shashin o tottemo ii desu ka?", "it": "Posso fare una foto?"},
    },
    "ueno-akiba": {
        "title": "Ueno e Akihabara",
        "kanji": "秋", "reading": "aki", "meaning": "il primo kanji di Akihabara",
        "kind": "tokyo",
        "treasure": True,
        "complete": True,
        "summary": "Il parco di Ueno con lo zoo e le barche a cigno, il mercato Ameyoko e la caccia alle figure ad Akihabara.",
        "transport": "Linea Oedo fino a Ueno-Okachimachi, poi a piedi. Ritorno da Akihabara col treno JR Sobu, 2 fermate",
        "stroller": "medio: il parco è comodo, Ameyoko e i negozi di Akihabara sono affollati",
        "cost": "zoo 600 ¥ gli adulti, bimbe gratis; barca a cigno 1.000 ¥ per 30 minuti",
        "stops": [
            {"when": "Mattina", "what": "Zoo di Ueno, con il Children's Zoo dove vedere da vicino gli animali della fattoria. I panda giganti sono tornati in Cina a gennaio 2026.",
             "place": {"name": "Zoo di Ueno", "q": "上野動物園", "closed": ["lun"], "closed_dates": ["2026-12-29", "2026-12-30", "2026-12-31", "2027-01-01"],
                       "info": "9:30–17 (ultimo ingresso alle 16). Gratis fino alle elementari"}},
            {"when": "Tarda mattina", "what": "Laghetto Shinobazu: barche a cigno, il tempietto Benten-do e un piccolo parco giochi.",
             "place": {"name": "Noleggio barche a cigno", "q": "不忍池 ボート場", "closed": ["mer"],
                       "info": "A dicembre 9–16:30, si paga in contanti. Chiedete i giubbotti salvagente"}},
            {"when": "Primo pomeriggio", "what": "Ameyoko, il mercato sotto la ferrovia: bancarelle e street food, quasi tutte aprono dalle 11.",
             "place": {"name": "Ameyoko", "q": "アメ横商店街"}},
            {"when": "Pomeriggio", "what": "Akihabara: figure usate al Mandarake Complex. Uno di voi va a caccia, l'altro tiene le bimbe, poi vi date il cambio.",
             "place": {"name": "Mandarake Complex", "q": "まんだらけコンプレックス 秋葉原", "info": "Orari da verificare"}},
        ],
        "meals": [
            dict(JURAKU, label="Pranzo"),
            {"label": "Merenda", "name": "Hyakkaen", "jp": "百果園 上野店", "what": "Spiedini di frutta fresca, la frutta giapponese a poco prezzo",
             "price": "circa 200 ¥ a spiedino, solo contanti", "kids": "Lavata e pronta da mangiare", "hours": "10–19",
             "where": "Ueno 6-10-13", "q": "百果園 上野店", "closed": ["mer"]},
            dict(DANDADAN, label="Cena", what="Sulla strada del ritorno: Asakusabashi è la fermata prima di Ryogoku"),
            dict(MARUI_FOOD, label="Alternativa"),
        ],
        "rain": "Museo Nazionale della Natura e della Scienza nel parco di Ueno (chiuso il lunedì, adulti 630 ¥, gratis fino alle superiori), poi Akihabara al coperto.",
        "tip": "Al mercato e alle bancarelle non si mangia camminando: ci si ferma accanto al banco e si restituiscono lì i rifiuti.",
        "links": [],
        "phrase": {"jp": "これはいくらですか？", "romaji": "Kore wa ikura desu ka?", "it": "Quanto costa questo?"},
    },
    "riposo-ryogoku": {
        "title": "Giornata lenta a Ryogoku",
        "kanji": "休", "reading": "kyū", "meaning": "riposo",
        "kind": "riposo",
        "complete": True,
        "summary": "Niente treni: lavatrice, pisolino, una passeggiata sul fiume Sumida e un buon pranzo vicino all'hotel.",
        "transport": "Tutto a piedi",
        "stroller": "facile",
        "cost": "solo i pasti",
        "stops": [
            {"when": "Mattina", "what": "Colazione con calma e spesa per le bimbe."},
            {"when": "Pomeriggio", "what": "Passeggiata lungo il fiume Sumida e il parco Yokoamicho, accanto al palazzetto del sumo."},
            {"when": "Sera", "what": "Se avete energie, lo Skytree illuminato."},
        ],
        "meals": [
            dict(TOMOEGATA, label="Pranzo"),
            dict(DANDADAN, label="Cena"),
        ],
        "rain": "Giornata in hotel e al centro commerciale Solamachi dello Skytree.",
        "tip": "Con tanti giorni di viaggio, un giorno senza programmi è un regalo: le bimbe lo ricorderanno quanto i giorni pieni.",
        "links": [{"label": "Spesa per le bimbe", "href": "/spesa"}],
        "phrase": {"jp": "すみません", "romaji": "Sumimasen", "it": "Scusi, permesso (la parola più utile del viaggio)"},
    },

    # ===================== DA COMPLETARE (prossime versioni) =====================
    "jump-festa": {
        "title": "Jump Festa", "kanji": "祭", "reading": "matsuri", "meaning": "festa",
        "kind": "fisso", "treasure": True, "complete": False, "version": "3.1.0",
        "summary": "La fiera di Shueisha a Makuhari Messe, dalle 9 alle 17: ingresso solo col biglietto dell'app Jump NAVI. Meglio papà da solo, la fiera è affollatissima.",
        "stops": [], "meals": [],
        "phrase": {"jp": "一番人気はどれですか？", "romaji": "Ichiban ninki wa dore desu ka?", "it": "Qual è il più popolare?"},
    },
    "odaiba": {
        "title": "Odaiba sul mare", "kanji": "台", "reading": "dai", "meaning": "piattaforma, il kanji di Odaiba",
        "kind": "tokyo", "treasure": True, "complete": False, "version": "3.1.0",
        "summary": "L'isola artificiale nella baia, con il Mugiwara Store, centri commerciali al coperto e vista sul ponte.",
        "stops": [], "meals": [],
        "phrase": {"jp": "トイレはどこですか？", "romaji": "Toire wa doko desu ka?", "it": "Dov'è il bagno?"},
    },
    "tokyo-station": {
        "title": "Stazione di Tokyo e Nihonbashi", "kanji": "駅", "reading": "eki", "meaning": "stazione",
        "kind": "tokyo", "treasure": True, "complete": False, "version": "3.1.0",
        "summary": "Il Mugiwara Store dentro Tokyo Character Street (uscita Yaesu nord) e il Pokémon Center.",
        "stops": [], "meals": [],
        "phrase": {"jp": "これをください", "romaji": "Kore o kudasai", "it": "Prendo questo, per favore"},
    },
    "fuji": {
        "title": "Il Fuji dal lago Kawaguchiko", "kanji": "富", "reading": "fu", "meaning": "il primo kanji di Fuji",
        "kind": "gita", "complete": False, "version": "3.2.0",
        "summary": "Bus presto da Shinjuku, il Fuji al mattino e l'Oishi Park con il parco giochi. Il giorno lo sceglie il Fuji-metro.",
        "stops": [], "meals": [],
        "links": [{"label": "Apri il Fuji-metro", "href": "/fuji"}],
        "phrase": {"jp": "富士山が見えますか？", "romaji": "Fujisan ga miemasu ka?", "it": "Si vede il Fuji?"},
    },
    "shibuya": {
        "title": "Shibuya e Harajuku", "kanji": "犬", "reading": "inu", "meaning": "cane (per Hachiko)",
        "kind": "tokyo", "treasure": True, "complete": False, "version": "3.2.0",
        "summary": "La statua di Hachiko, l'incrocio più famoso del mondo, il Mugiwara Store principale e Harajuku.",
        "stops": [], "meals": [],
        "phrase": {"jp": "子ども用の椅子はありますか？", "romaji": "Kodomo-yō no isu wa arimasu ka?", "it": "Avete un seggiolone?"},
    },
    "nikko": {
        "title": "Gita a Nikko", "kanji": "日", "reading": "nichi", "meaning": "sole, il primo kanji di Nikko",
        "kind": "gita", "complete": False, "version": "3.3.0",
        "summary": "I templi dorati nel bosco, forse con la neve. Si parte da Asakusa con il treno Tobu.",
        "stops": [], "meals": [],
        "phrase": {"jp": "寒いですね", "romaji": "Samui desu ne", "it": "Fa freddo, eh?"},
    },
    "vigilia": {
        "title": "La vigilia delle luci", "kanji": "光", "reading": "hikari", "meaning": "luce",
        "kind": "tokyo", "complete": False, "version": "3.1.0",
        "summary": "Ginza e le luminarie di Marunouchi. In Giappone la Vigilia si festeggia con il pollo fritto e la torta con panna e fragole.",
        "stops": [], "meals": [],
        "phrase": {"jp": "メリークリスマス", "romaji": "Merī Kurisumasu", "it": "Buon Natale"},
    },
    "tsukiji-natale": {
        "title": "Natale a tavola", "kanji": "鮨", "reading": "sushi", "meaning": "sushi",
        "kind": "tokyo", "complete": False, "version": "3.1.0",
        "summary": "Assaggi al mercato esterno di Tsukiji al mattino, monjayaki sulla piastra a Tsukishima la sera.",
        "stops": [], "meals": [],
        "phrase": {"jp": "おいしい！", "romaji": "Oishii!", "it": "Buonissimo!"},
    },
    "to-kyoto": {
        "title": "In shinkansen verso Kyoto", "kanji": "京", "reading": "kyō", "meaning": "capitale",
        "kind": "fisso", "complete": False, "version": "3.3.0",
        "summary": "Check-out a Ryogoku, shinkansen da Tokyo a Kyoto e prima passeggiata a Gion.",
        "stops": [], "meals": [],
        "phrase": {"jp": "この席は空いていますか？", "romaji": "Kono seki wa aite imasu ka?", "it": "È libero questo posto?"},
    },
    "kyoto-classica": {
        "title": "Kyoto classica", "kanji": "稲", "reading": "ina", "meaning": "riso, il kanji di Inari",
        "kind": "kyoto", "complete": False, "version": "3.2.0",
        "summary": "Le mille porte rosse del Fushimi Inari al mattino presto, poi il tempio Kiyomizu-dera.",
        "stops": [], "meals": [],
        "phrase": {"jp": "きれいですね", "romaji": "Kirei desu ne", "it": "Che bello, eh?"},
    },
    "arashiyama": {
        "title": "Arashiyama e il Padiglione d'Oro", "kanji": "竹", "reading": "take", "meaning": "bambù",
        "kind": "kyoto", "complete": False, "version": "3.2.0",
        "summary": "Il bosco di bambù, il ponte sul fiume e il Kinkaku-ji tutto d'oro.",
        "stops": [], "meals": [],
        "phrase": {"jp": "写真をお願いできますか？", "romaji": "Shashin o onegai dekimasu ka?", "it": "Ci fa una foto, per favore?"},
    },
    "nara": {
        "title": "Gita a Nara", "kanji": "鹿", "reading": "shika", "meaning": "cervo",
        "kind": "gita", "complete": False, "version": "3.2.0",
        "summary": "I cervi che fanno l'inchino, il Grande Buddha del Todai-ji e il parco.",
        "stops": [], "meals": [],
        "phrase": {"jp": "鹿せんべいください", "romaji": "Shika senbei kudasai", "it": "Dei biscotti per i cervi, per favore"},
    },
    "museo-treni": {
        "title": "Museo dei treni di Kyoto", "kanji": "汽", "reading": "ki", "meaning": "vapore",
        "kind": "kyoto", "complete": False, "version": "3.2.0",
        "summary": "Locomotive a vapore, shinkansen e plastici: una giornata al coperto amatissima dai bambini.",
        "stops": [], "meals": [],
        "phrase": {"jp": "かっこいい！", "romaji": "Kakkoii!", "it": "Che figo!"},
    },
    "osaka": {
        "title": "Gita a Osaka", "kanji": "阪", "reading": "han", "meaning": "il kanji di Osaka",
        "kind": "gita", "complete": False, "version": "3.2.0",
        "summary": "L'acquario Kaiyukan con lo squalo balena, poi takoyaki e luci a Dotonbori.",
        "stops": [], "meals": [],
        "phrase": {"jp": "たこ焼き六個ください", "romaji": "Takoyaki rokko kudasai", "it": "Sei takoyaki, per favore"},
    },
    "usj": {
        "title": "Universal Studios Japan", "kanji": "遊", "reading": "asobi", "meaning": "gioco",
        "kind": "gita", "complete": False, "version": "3.2.0",
        "summary": "Il parco a tema di Osaka, con la zona Nintendo. Biglietti da prendere in anticipo.",
        "stops": [], "meals": [],
        "phrase": {"jp": "何分待ちですか？", "romaji": "Nanpun machi desu ka?", "it": "Quanti minuti di attesa?"},
    },
    "omisoka": {
        "title": "Ōmisoka, l'ultimo dell'anno", "kanji": "年", "reading": "toshi", "meaning": "anno",
        "kind": "capodanno", "complete": False, "version": "3.3.0",
        "summary": "Rientro a Tokyo al mattino, check-in ad Asakusa, la soba di fine anno e l'atmosfera serale al Senso-ji. I treni corrono tutta la notte.",
        "stops": [], "meals": [],
        "phrase": {"jp": "よいお年を", "romaji": "Yoi otoshi o", "it": "Buona fine d'anno"},
    },
    "gantan": {
        "title": "Il primo giorno dell'anno", "kanji": "初", "reading": "hatsu", "meaning": "primo",
        "kind": "capodanno", "complete": False, "version": "3.3.0",
        "summary": "La prima visita dell'anno al tempio, poi lo Skytree. Molti ristoranti sono chiusi: ci pensiamo prima.",
        "stops": [], "meals": [],
        "phrase": {"jp": "あけましておめでとうございます", "romaji": "Akemashite omedetō gozaimasu", "it": "Buon anno!"},
    },
    "fukubukuro": {
        "title": "Le borse fortunate", "kanji": "福", "reading": "fuku", "meaning": "fortuna",
        "kind": "capodanno", "treasure": True, "complete": False, "version": "3.3.0",
        "summary": "I grandi magazzini riaprono con i saldi e i fukubukuro, sacchetti a sorpresa con dentro più di quanto pagate.",
        "stops": [], "meals": [],
        "phrase": {"jp": "福袋はどこですか？", "romaji": "Fukubukuro wa doko desu ka?", "it": "Dove sono le borse fortunate?"},
    },
    "nakano": {
        "title": "Nakano Broadway", "kanji": "宝", "reading": "takara", "meaning": "tesoro",
        "kind": "tokyo", "treasure": True, "complete": False, "version": "3.3.0",
        "summary": "La caccia al tesoro vera: 33 negozi Mandarake, con lo Special 8 dedicato alle figure shonen. Il 4 gennaio riapre tutto.",
        "stops": [], "meals": [],
        "phrase": {"jp": "箱はありますか？", "romaji": "Hako wa arimasu ka?", "it": "C'è la scatola originale?"},
    },
    "partenza": {
        "title": "Arrivederci Giappone", "kanji": "帰", "reading": "kaeru", "meaning": "ritorno",
        "kind": "fisso", "complete": False, "version": "3.3.0",
        "summary": "Treno Keisei da Asakusa direttamente a Narita. Volo alle 14: uscite dall'hotel verso le 9:30.",
        "stops": [], "meals": [],
        "phrase": {"jp": "ありがとう、また来ます", "romaji": "Arigatō, mata kimasu", "it": "Grazie, torneremo"},
    },
}

# I 23 giorni: il primo piano della lista è quello consigliato
DAYS = [
    {"date": "2026-12-14", "chapter": "tokyo1", "plans": ["arrivo"]},
    {"date": "2026-12-15", "chapter": "tokyo1", "plans": ["ryogoku-calma", "fukagawa"]},
    {"date": "2026-12-16", "chapter": "tokyo1", "plans": ["yokohama", "ueno-akiba"]},
    {"date": "2026-12-17", "chapter": "tokyo1", "plans": ["harry-potter"]},
    {"date": "2026-12-18", "chapter": "tokyo1", "plans": ["ueno-akiba", "riposo-ryogoku"]},
    {"date": "2026-12-19", "chapter": "tokyo1", "plans": ["jump-festa", "odaiba"]},
    {"date": "2026-12-20", "chapter": "tokyo1", "plans": ["riposo-ryogoku", "tokyo-station"]},
    {"date": "2026-12-21", "chapter": "tokyo1", "plans": ["fuji", "nikko"], "note": "Finestra del Fuji: il 21 o il 23, quello più limpido. Nikko nell'altro."},
    {"date": "2026-12-22", "chapter": "tokyo1", "plans": ["shibuya"], "note": "Sempre in mezzo, così due gite lunghe non capitano attaccate."},
    {"date": "2026-12-23", "chapter": "tokyo1", "plans": ["nikko", "fuji"], "note": "Finestra del Fuji: il 21 o il 23, quello più limpido. Nikko nell'altro."},
    {"date": "2026-12-24", "chapter": "tokyo1", "plans": ["vigilia", "odaiba"]},
    {"date": "2026-12-25", "chapter": "tokyo1", "plans": ["tsukiji-natale", "riposo-ryogoku"]},
    {"date": "2026-12-26", "chapter": "kyoto", "plans": ["to-kyoto"]},
    {"date": "2026-12-27", "chapter": "kyoto", "plans": ["kyoto-classica", "arashiyama"]},
    {"date": "2026-12-28", "chapter": "kyoto", "plans": ["nara"]},
    {"date": "2026-12-29", "chapter": "kyoto", "plans": ["arashiyama", "museo-treni"]},
    {"date": "2026-12-30", "chapter": "kyoto", "plans": ["osaka", "usj"]},
    {"date": "2026-12-31", "chapter": "tokyo2", "plans": ["omisoka"]},
    {"date": "2027-01-01", "chapter": "tokyo2", "plans": ["gantan"]},
    {"date": "2027-01-02", "chapter": "tokyo2", "plans": ["fukubukuro"]},
    {"date": "2027-01-03", "chapter": "tokyo2", "plans": ["odaiba", "yokohama", "ueno-akiba"], "note": "Il 3 gennaio molti tornano in città e i treni sono affollati. I centri commerciali sono aperti."},
    {"date": "2027-01-04", "chapter": "tokyo2", "plans": ["nakano"]},
    {"date": "2027-01-05", "chapter": "tokyo2", "plans": ["partenza"]},
]

# Da prenotare prima di partire (date in ora italiana)
TODO = [
    {"id": "jumpfesta", "date": "2026-10-26", "title": "Richiesta biglietto Jump Festa",
     "detail": "Prima scadenza nell'app Jump NAVI. Dalle elementari in su serve il biglietto."},
    {"id": "ghibli", "date": "2026-11-10", "title": "Biglietti Museo Ghibli, se vi interessa",
     "detail": "Escono alle 10 giapponesi, le 2 di notte in Italia, e finiscono in fretta."},
    {"id": "shinkansen", "date": None, "title": "Shinkansen Tokyo–Kyoto (26/12) e Kyoto–Tokyo (31/12)",
     "detail": "Con i trolley grandi prenotate il posto con spazio per bagagli voluminosi, oppure spedite le valigie da hotel a hotel."},
    {"id": "cupnoodles", "date": None, "title": "Laboratorio My Cup Noodles a Yokohama",
     "detail": "Si prenota online sul sito del museo: i posti finiscono presto."},
]
