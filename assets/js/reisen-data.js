const reisen = [
  {
    id: "wien",
    titel: "Wien",
    ort: "Wien, Österreich",
    ordner: "vienna",
    praefix: "vienna",
    anzahl: 11,
    kategorie: "Städtetrip",
    zeitraum: "Mai 2026",
    teaser:
      "Kaiserliche Prunkbauten, der Stephansdom im Abendlicht und ein Spaziergang durch die Innenstadt.",
    beschreibung:
      "Drei Tage Wien, drei Tage zwischen Kaiserzeit und Gegenwart: von der Hofburg über den Stephansdom bis zu den Dächern der Innenstadt im goldenen Abendlicht. Dazwischen Museen, kleine Kaffeehäuser und ein Abstecher zum Riesenrad. Wien zu fotografieren heißt vor allem, auf Licht und Details zu achten – die Stadt liefert an jeder Ecke ein neues Motiv.",
  },
  {
    id: "london",
    titel: "London",
    ort: "London, Vereinigtes Königreich",
    ordner: "london",
    praefix: "london",
    anzahl: 24,
    kategorie: "Städtetrip",
    zeitraum: "Dezember 2025",
    teaser:
      "Weihnachtliches London: Tower Bridge bei Nacht, rote Telefonzellen und Streetfood in Camden.",
    beschreibung:
      "Ein paar Tage London kurz vor Weihnachten: funkelnde Lichter in der Oxford Street, die Tower Bridge im Nachtlicht und der Blick vom Big Ben über die Stadt. Dazu Streetfood-Märkte, U-Bahn-Impressionen und die typischen roten Details, die London so fotogen machen.",
  },
  {
    id: "florenz",
    titel: "Florenz",
    ort: "Florenz, Italien",
    ordner: "fierence",
    praefix: "fierence",
    anzahl: 15,
    kategorie: "Städtetrip",
    zeitraum: "Mai 2026",
    teaser:
      "Renaissance pur: der Dom, Michelangelos David und Sonnenuntergänge über dem Arno.",
    beschreibung:
      "Florenz ist wie ein Freilichtmuseum: Kunstwerke, kunstvolle Fassaden und enge Gassen, die sich immer wieder zu spektakulären Ausblicken öffnen. Highlights waren der Sonnenaufgang über den Dächern, der David in der Galleria dell'Accademia und die Abendstimmung überem Arno.",
  },
  {
    id: "mailand",
    titel: "Mailand",
    ort: "Mailand, Italien",
    ordner: "milan",
    praefix: "milan",
    anzahl: 25,
    kategorie: "Städtetrip",
    zeitraum: "Februar 2025", 
    teaser:
      "Der Dom bei Nacht, die Galleria Vittorio Emanuele II und italienisches Design.",
    beschreibung:
      "Mailand verbindet gotische Baukunst mit modernem Design: der imposante Dom, die glitzernde Einkaufspassage Galleria Vittorio Emanuele II und dazwischen kleine Details aus Mode, Kunst und Küche. Eine Stadt, die tagsüber wie abends völlig unterschiedliche Motive bietet.",
  },
  {
    id: "prag",
    titel: "Prag",
    ort: "Prag, Tschechien",
    ordner: "Prague",
    praefix: "prague",
    anzahl: 20,
    kategorie: "Städtetrip",
    zeitraum: "August 2025", 
    teaser:
      "Die Goldene Stadt: Türme, Ausblicke über die Moldau und gemütliche Cafés.",
    beschreibung:
      "Prag zeigt sich als Mix aus Türmen, engen Gassen und Ausblicken über die Moldau. Zwischen Burgviertel und Altstadt gab es genug Zeit für Museen, lokale Küche und die berühmte Prager Skyline bei Sonnenuntergang.",
  },
  {
    id: "kappadokien",
    titel: "Kappadokien",
    ort: "Kappadokien & Nevşehir, Türkei",
    ordner: "kapadokien",
    anzahl: 6,
    praefix: "kapadokien",
    kategorie: "Reise-Highlight",
    zeitraum: "Juli 2025",
    teaser:
      "Feenkamine, Höhlenstädte und die berühmten Sonnenaufgänge mit Heißluftballons.",
    beschreibung:
      "Kappadokien und die Region rund um Nevşehir gehören zum Eindrucksvollsten, was ich bisher fotografiert habe: bizarre Felsformationen, jahrhundertealte Höhlenstädte und Sonnenaufgänge, an denen der Himmel voller Heißluftballons ist. Eine Landschaft, die aussieht wie von einem anderen Planeten.",
  },
  {
    id: "tuningworld",
    titel: "Tuningworld Bodensee",
    ort: "Tuningworld Bodensee, Friedrichshafen",
    ordner: "tunningWorld",
    praefix: "tunningWorld",
    anzahl: 5,
    kategorie: "Event & Motorsport",
    zeitraum: "August 2025",
    teaser:
      "Getunte Autos, satte Farben und viel Liebe zum Detail auf Europas größter Tuning-Messe.",
    beschreibung:
      "Auf der Tuningworld Bodensee dreht sich alles um PS, Design und Details: umgebaute Klassiker, glänzender Lack und stimmungsvolles Messelicht. Für mich eine willkommene Abwechslung zur klassischen Reisefotografie – hier zählen Reflexionen, Linien und Farben.",
  },
  {
    id: "aesthetik",
    titel: "Ästhetische Eindrücke",
    ort: "Verschiedene Orte",
    ordner: "views",
    praefix: "view",
    anzahl: 40,
    kategorie: "Momentaufnahmen",
    zeitraum: "laufend",
    teaser:
      "Berge, Seen, Sonnenuntergänge und kleine Alltagsmomente abseits der großen Reisen.",
    beschreibung:
      "Nicht jedes Foto braucht eine große Reise: diese Sammlung zeigt Berge, Seen, Sonnenuntergänge und kleine, ästhetische Alltagsmomente – Motive, die mir einfach ins Auge gefallen sind, egal ob unterwegs oder zuhause.",
  },
];


const favoriten = [
  { ort: "wien", index: 5, groesse: "gross" },
  { ort: "kappadokien", index: 1, groesse: "gross" },
  { ort: "florenz", index: 3, groesse: "klein" },
  { ort: "tuningworld", index: 2, groesse: "klein" },
  { ort: "london", index: 8, groesse: "klein" },
  { ort: "aesthetik", index: 6, groesse: "gross" },
  { ort: "prag", index: 4, groesse: "klein" },
  { ort: "mailand", index: 1, groesse: "klein" },
];
