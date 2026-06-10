/* =========================================================
   WANDERCOCKTAILS — Datos base
   Catálogo de cristalería, hielos, técnicas, ingredientes
   y recetario clásico de referencia.
   ========================================================= */

// ---------- Catálogo de vasos / copas ----------
// ml = capacidad típica por defecto (cada negocio la ajusta a su cristalería real)
// rango = capacidades habituales en el mercado, para validar la medida introducida
const VASOS = [
  { id: "margarita",   nombre: "Copa Margarita",            ml: 300, rango: [250, 440], desc: "Copa ancha de doble cuenco. Margaritas y daiquiris frozen." },
  { id: "coupe",       nombre: "Copa Coupe",                ml: 200, rango: [160, 250], desc: "Copa baja y ancha. Cócteles servidos sin hielo (straight up)." },
  { id: "martini",     nombre: "Copa Martini / Cocktail",   ml: 240, rango: [180, 300], desc: "Copa cónica clásica. Martinis, cosmopolitan, espresso martini." },
  { id: "rocks",       nombre: "Vaso Old Fashioned (Rocks)",ml: 300, rango: [250, 330], desc: "Vaso bajo y ancho. Cócteles sobre hielo grande." },
  { id: "rocks-doble", nombre: "Vaso Doble Old Fashioned",  ml: 410, rango: [350, 470], desc: "Versión grande del rocks. Negronis generosos, sours con hielo." },
  { id: "highball",    nombre: "Vaso Highball",             ml: 320, rango: [270, 350], desc: "Vaso alto. Combinados con refresco o soda." },
  { id: "collins",     nombre: "Vaso Collins",              ml: 360, rango: [300, 420], desc: "Más alto y estrecho que el highball. Mojitos, Tom Collins." },
  { id: "hurricane",   nombre: "Copa Hurricane",            ml: 460, rango: [400, 500], desc: "Copa curvada grande. Piña colada y tropicales." },
  { id: "balon",       nombre: "Copa de Balón (Gin Tonic)", ml: 620, rango: [560, 700], desc: "Copa globo. Gin tonics y combinados premium." },
  { id: "tiki",        nombre: "Tiki Mug",                  ml: 450, rango: [350, 550], desc: "Vaso cerámico tiki. Mai tai, zombies, exóticos." },
  { id: "zombie",      nombre: "Vaso Zombie",               ml: 400, rango: [380, 430], desc: "Vaso alto y recto, más alto que el collins. Tikis largos." },
  { id: "mule",        nombre: "Taza Mule (cobre)",         ml: 400, rango: [350, 500], desc: "Taza de cobre. Moscow mule y variantes." },
  { id: "julep",       nombre: "Vaso Julep (metal)",        ml: 380, rango: [340, 420], desc: "Vaso metálico. Mint julep con hielo picado." },
  { id: "sour",        nombre: "Copa Sour",                 ml: 140, rango: [100, 160], desc: "Copa pequeña con pie. Whisky sour, pisco sour sin hielo." },
  { id: "nick-nora",   nombre: "Copa Nick & Nora",          ml: 150, rango: [130, 170], desc: "Copa pequeña elegante. Manhattan, martinis cortos." },
  { id: "flauta",      nombre: "Copa Flauta",               ml: 170, rango: [150, 200], desc: "Copa alargada. Espumosos y cócteles con cava." },
  { id: "vino",        nombre: "Copa de Vino",              ml: 350, rango: [300, 450], desc: "Copa de vino estándar. Spritz y cócteles de vino." },
  { id: "shot",        nombre: "Vaso Shot / Caballito",     ml: 50,  rango: [30, 70],   desc: "Vaso pequeño para chupitos y shooters." },
];

// ---------- Tipos de hielo ----------
// despPct = % del volumen del vaso que ocupa (desplaza) el hielo.
// Es el valor que más varía entre negocios: cada uno lo ajusta al hielo que compra/produce.
const HIELOS = [
  { id: "sin-hielo", nombre: "Sin hielo (straight up)", despPct: 0,  desc: "El cóctel se enfría al elaborarlo y se sirve sin hielo." },
  { id: "cubos",     nombre: "Cubos estándar (3-4 cm)", despPct: 30, desc: "Cubo de máquina estándar. Desplaza ~30 % del vaso." },
  { id: "cubitos",   nombre: "Cubitos pequeños",        despPct: 35, desc: "Hielo pequeño de máquina doméstica. Se compacta más." },
  { id: "picado",    nombre: "Hielo picado (crushed)",  despPct: 50, desc: "Hielo triturado. Llena ~la mitad del volumen útil." },
  { id: "frappe",    nombre: "Frappé fino",             despPct: 55, desc: "Hielo muy fino tipo nieve. Máximo desplazamiento." },
  { id: "esfera",    nombre: "Esfera grande",           despPct: 20, desc: "Una esfera de 5-6 cm. Para old fashioned y destilados." },
  { id: "bloque",    nombre: "Cubo grande / bloque XL", despPct: 25, desc: "Un cubo tallado de 5 cm. Dilución lenta." },
  { id: "columna",   nombre: "Columna (Collins spear)", despPct: 25, desc: "Barra de hielo a medida del vaso collins." },
];

// ---------- Técnicas y dilución ----------
// dilucionPct = agua que se incorpora al cóctel al elaborarlo, en % sobre los ingredientes.
const TECNICAS = [
  { id: "agitado",  nombre: "Agitado (shake)",    dilucionPct: 25 },
  { id: "removido", nombre: "Removido (stir)",    dilucionPct: 15 },
  { id: "directo",  nombre: "Directo en vaso (build)", dilucionPct: 5 },
  { id: "batido",   nombre: "Batido / Frozen (blend)", dilucionPct: 45 },
  { id: "ninguna",  nombre: "Sin dilución",       dilucionPct: 0 },
];

// ---------- Categorías de producto ----------
// Taxonomía profesional del inventario: categoría → subcategoría → tipo.
const CATEGORIAS = [
  { id: "Destilados",   emoji: "🥃", desc: "La base alcohólica: aporta fuerza y carácter" },
  { id: "Licores",      emoji: "🍷", desc: "Modificadores: licores, vermuts, aperitivos y espumosos" },
  { id: "Siropes",      emoji: "🍯", desc: "El dulzor que equilibra la acidez" },
  { id: "Zumos",        emoji: "🍋", desc: "Acidez y fruta natural" },
  { id: "Concentrados", emoji: "🥭", desc: "Purés y cremas: sabor intenso y cuerpo" },
  { id: "Refrescos",    emoji: "🫧", desc: "Alargadores y burbujas" },
  { id: "Frescos",      emoji: "🌿", desc: "Perecederos, bitters, hierbas y texturas" },
];

// ---------- Tipos de ingrediente ----------
// Las recetas referencian estos tipos; el inventario de cada negocio
// asocia sus botellas/productos concretos a un tipo.
// rol = papel que cumple en el equilibrio del cóctel (motor de creación):
//   base · licor-dulce · vermut · aperitivo · espumoso · dulce · acido ·
//   zumo · pure · textura · alargador · bitter · aroma
const TIPOS_INGREDIENTE = [
  // Destilados — la subcategoría es el nombre de cada licor, tal como se pide en barra
  { id: "ron-blanco",      nombre: "Ron blanco",             cat: "Destilados", sub: "Ron",            rol: "base" },
  { id: "ron-oscuro",      nombre: "Ron oscuro / añejo",     cat: "Destilados", sub: "Ron",            rol: "base" },
  { id: "ron-especiado",   nombre: "Ron especiado",          cat: "Destilados", sub: "Ron",            rol: "base" },
  { id: "bourbon",         nombre: "Whisky bourbon",         cat: "Destilados", sub: "Whisky",         rol: "base" },
  { id: "whisky-centeno",  nombre: "Whisky de centeno (rye)",cat: "Destilados", sub: "Whisky",         rol: "base" },
  { id: "whisky-escoces",  nombre: "Whisky escocés",         cat: "Destilados", sub: "Whisky",         rol: "base" },
  { id: "vodka",           nombre: "Vodka",                  cat: "Destilados", sub: "Vodka",          rol: "base" },
  { id: "tequila",         nombre: "Tequila",                cat: "Destilados", sub: "Tequila",        rol: "base" },
  { id: "mezcal",          nombre: "Mezcal",                 cat: "Destilados", sub: "Mezcal",         rol: "base" },
  { id: "ginebra",         nombre: "Ginebra",                cat: "Destilados", sub: "Ginebra",        rol: "base" },
  { id: "brandy",          nombre: "Brandy / Coñac",         cat: "Destilados", sub: "Brandy",         rol: "base" },
  { id: "pisco",           nombre: "Pisco",                  cat: "Destilados", sub: "Pisco",          rol: "base" },
  { id: "cachaca",         nombre: "Cachaça",                cat: "Destilados", sub: "Cachaça",        rol: "base" },
  // Licores
  { id: "triple-sec",      nombre: "Triple sec / Curaçao naranja", cat: "Licores", sub: "Licores de fruta", rol: "licor-dulce" },
  { id: "blue-curacao",    nombre: "Blue curaçao",           cat: "Licores", sub: "Licores de fruta",   rol: "licor-dulce" },
  { id: "licor-melocoton", nombre: "Licor de melocotón",     cat: "Licores", sub: "Licores de fruta",   rol: "licor-dulce" },
  { id: "licor-coco",      nombre: "Licor de coco",          cat: "Licores", sub: "Licores de fruta",   rol: "licor-dulce" },
  { id: "licor-sauco",     nombre: "Licor de flor de saúco", cat: "Licores", sub: "Licores de fruta",   rol: "licor-dulce" },
  { id: "licor-cafe",      nombre: "Licor de café",          cat: "Licores", sub: "Licores dulces",     rol: "licor-dulce" },
  { id: "amaretto",        nombre: "Amaretto",               cat: "Licores", sub: "Licores dulces",     rol: "licor-dulce" },
  { id: "licor-hierbas",   nombre: "Licor de hierbas",       cat: "Licores", sub: "Licores dulces",     rol: "licor-dulce" },
  { id: "vermut-rojo",     nombre: "Vermut rojo",            cat: "Licores", sub: "Vermuts",            rol: "vermut" },
  { id: "vermut-seco",     nombre: "Vermut seco",            cat: "Licores", sub: "Vermuts",            rol: "vermut" },
  { id: "campari",         nombre: "Campari (bitter rojo)",  cat: "Licores", sub: "Aperitivos amargos", rol: "aperitivo" },
  { id: "aperol",          nombre: "Aperol",                 cat: "Licores", sub: "Aperitivos amargos", rol: "aperitivo" },
  { id: "cava-prosecco",   nombre: "Cava / Prosecco",        cat: "Licores", sub: "Espumosos",          rol: "espumoso" },
  // Siropes
  { id: "sirope-simple",   nombre: "Sirope simple (azúcar)", cat: "Siropes", sub: "Básicos",    rol: "dulce" },
  { id: "sirope-agave",    nombre: "Sirope de agave",        cat: "Siropes", sub: "Básicos",    rol: "dulce" },
  { id: "miel",            nombre: "Miel / sirope de miel",  cat: "Siropes", sub: "Básicos",    rol: "dulce" },
  { id: "granadina",       nombre: "Granadina",              cat: "Siropes", sub: "Especiales", rol: "dulce" },
  { id: "orgeat",          nombre: "Orgeat (almendra)",      cat: "Siropes", sub: "Especiales", rol: "dulce" },
  { id: "sirope-vainilla", nombre: "Sirope de vainilla",     cat: "Siropes", sub: "Especiales", rol: "dulce" },
  { id: "sirope-canela",   nombre: "Sirope de canela",       cat: "Siropes", sub: "Especiales", rol: "dulce" },
  // Zumos
  { id: "zumo-lima",       nombre: "Zumo de lima",           cat: "Zumos", sub: "Cítricos", rol: "acido" },
  { id: "zumo-limon",      nombre: "Zumo de limón",          cat: "Zumos", sub: "Cítricos", rol: "acido" },
  { id: "zumo-pomelo",     nombre: "Zumo de pomelo",         cat: "Zumos", sub: "Cítricos", rol: "zumo" },
  { id: "zumo-naranja",    nombre: "Zumo de naranja",        cat: "Zumos", sub: "Cítricos", rol: "zumo" },
  { id: "zumo-pina",       nombre: "Zumo de piña",           cat: "Zumos", sub: "Frutas",   rol: "zumo" },
  { id: "zumo-arandanos",  nombre: "Zumo de arándanos",      cat: "Zumos", sub: "Frutas",   rol: "zumo" },
  { id: "zumo-manzana",    nombre: "Zumo de manzana",        cat: "Zumos", sub: "Frutas",   rol: "zumo" },
  { id: "zumo-tomate",     nombre: "Zumo de tomate",         cat: "Zumos", sub: "Frutas",   rol: "zumo" },
  // Concentrados y purés
  { id: "pure-fresa",      nombre: "Puré / concentrado de fresa",    cat: "Concentrados", sub: "Purés de fruta", rol: "pure" },
  { id: "pure-maracuya",   nombre: "Puré / concentrado de maracuyá", cat: "Concentrados", sub: "Purés de fruta", rol: "pure" },
  { id: "pure-mango",      nombre: "Puré / concentrado de mango",    cat: "Concentrados", sub: "Purés de fruta", rol: "pure" },
  { id: "crema-coco",      nombre: "Crema de coco",          cat: "Concentrados", sub: "Cremas", rol: "textura" },
  // Refrescos y mixers
  { id: "soda",            nombre: "Agua con gas / soda",    cat: "Refrescos", sub: "Carbonatados", rol: "alargador" },
  { id: "tonica",          nombre: "Tónica",                 cat: "Refrescos", sub: "Carbonatados", rol: "alargador" },
  { id: "ginger-beer",     nombre: "Ginger beer",            cat: "Refrescos", sub: "Carbonatados", rol: "alargador" },
  { id: "ginger-ale",      nombre: "Ginger ale",             cat: "Refrescos", sub: "Carbonatados", rol: "alargador" },
  { id: "cola",            nombre: "Refresco de cola",       cat: "Refrescos", sub: "Carbonatados", rol: "alargador" },
  { id: "refresco-pomelo", nombre: "Refresco de pomelo",     cat: "Refrescos", sub: "Carbonatados", rol: "alargador" },
  // Frescos y otros
  { id: "espresso",        nombre: "Café espresso",          cat: "Frescos", sub: "Perecederos", rol: "aroma" },
  { id: "clara-huevo",     nombre: "Clara de huevo",         cat: "Frescos", sub: "Perecederos", rol: "textura" },
  { id: "nata",            nombre: "Nata / crema de leche",  cat: "Frescos", sub: "Perecederos", rol: "textura" },
  { id: "menta",           nombre: "Menta / hierbabuena fresca", cat: "Frescos", sub: "Hierbas", rol: "aroma" },
  { id: "angostura",       nombre: "Angostura bitters",      cat: "Frescos", sub: "Bitters",    rol: "bitter" },
];

// Nombre legible de cada rol (para el asistente de creación)
const ROLES = {
  "base":        "Base alcohólica",
  "licor-dulce": "Licor dulce",
  "vermut":      "Vermut",
  "aperitivo":   "Aperitivo amargo",
  "espumoso":    "Espumoso",
  "dulce":       "Sirope / dulce",
  "acido":       "Ácido cítrico",
  "zumo":        "Zumo de fruta",
  "pure":        "Puré / concentrado",
  "textura":     "Textura / cremosidad",
  "alargador":   "Alargador con burbuja",
  "bitter":      "Bitters",
  "aroma":       "Aromático",
};

// ---------- Plantillas de creación (las "reglas de oro") ----------
// Fórmulas clásicas con las que los bartenders construyen cócteles nuevos.
// Cada slot define qué rol debe cumplir el ingrediente y cuánto lleva.
const PLANTILLAS_CREACION = [
  {
    id: "sour", nombreCorto: "Sour", emoji: "🍋",
    nombre: "Sour — La regla de oro 2:1:1",
    formula: "2 partes de base · 1 parte de ácido · 1 parte de dulce",
    desc: "La fórmula madre de la coctelería: el dulce equilibra el ácido y la base aporta carácter. Si dominas esta proporción, puedes crear un cóctel con casi cualquier destilado y fruta.",
    ejemplos: "Margarita, Daiquiri, Whisky Sour, Pisco Sour",
    vaso: "coupe", tecnica: "agitado", hielo: "sin-hielo",
    slots: [
      { rol: ["base"],                 ml: 60, nombre: "Destilado base" },
      { rol: ["acido"],                ml: 30, nombre: "Ácido cítrico" },
      { rol: ["dulce", "licor-dulce"], ml: 25, nombre: "Dulce (sirope o licor)" },
      { rol: ["textura"],              ml: 20, nombre: "Espuma (clara/nata)", opcional: true },
    ],
  },
  {
    id: "highball", nombreCorto: "Highball", emoji: "🫧",
    nombre: "Highball — Refrescante 1:3",
    formula: "1 parte de base · 3 partes de alargador",
    desc: "Sencillo y rentable: un destilado alargado con burbuja. El secreto está en el hielo abundante y en no romper el gas al remover.",
    ejemplos: "Gin Tonic, Cuba Libre, Paloma, Moscow Mule",
    vaso: "highball", tecnica: "directo", hielo: "cubos",
    slots: [
      { rol: ["base"],                  ml: 50,  nombre: "Destilado base" },
      { rol: ["alargador"],             ml: 150, nombre: "Alargador con burbuja" },
      { rol: ["acido"],                 ml: 10,  nombre: "Toque cítrico", opcional: true },
    ],
  },
  {
    id: "ancestral", nombreCorto: "Ancestral", emoji: "🥃",
    nombre: "Ancestral — Espirituoso",
    formula: "1 base protagonista · pizca de dulce · bitters",
    desc: "El cóctel en su forma más pura: destilado, un punto de azúcar y amargos. Para clientes que quieren saborear el licor. Hielo grande y dilución lenta.",
    ejemplos: "Old Fashioned, Sazerac",
    vaso: "rocks", tecnica: "removido", hielo: "bloque",
    slots: [
      { rol: ["base"],                 ml: 60, nombre: "Destilado protagonista" },
      { rol: ["dulce", "licor-dulce"], ml: 10, nombre: "Dulzor sutil" },
      { rol: ["bitter"],               dash: 2, nombre: "Bitters" },
    ],
  },
  {
    id: "martini", nombreCorto: "Martini", emoji: "🍸",
    nombre: "Estilo Martini — Elegante",
    formula: "2-3 partes de base · 1 parte de vermut o aperitivo",
    desc: "Base + vino fortificado o aperitivo, removido y muy frío. Cambiando el modificador nacen familias enteras: seco, perfecto, negroni a partes iguales…",
    ejemplos: "Dry Martini, Manhattan, Negroni",
    vaso: "martini", tecnica: "removido", hielo: "sin-hielo",
    slots: [
      { rol: ["base"],                              ml: 60, nombre: "Destilado base" },
      { rol: ["vermut", "aperitivo", "licor-dulce"],ml: 25, nombre: "Modificador" },
      { rol: ["bitter"],                            dash: 1, nombre: "Bitters", opcional: true },
    ],
  },
  {
    id: "spritz", nombreCorto: "Spritz", emoji: "🍹",
    nombre: "Spritz — Aperitivo 3:2:1",
    formula: "3 partes de aperitivo · 2 de espumoso · 1 de soda",
    desc: "Ligero, de baja graduación y muy visual. Ideal para terraza y para dar salida a aperitivos y espumosos.",
    ejemplos: "Aperol Spritz, Campari Spritz, Hugo (con licor de saúco)",
    vaso: "vino", tecnica: "directo", hielo: "cubos",
    slots: [
      { rol: ["aperitivo", "licor-dulce"], ml: 60, nombre: "Aperitivo / licor" },
      { rol: ["espumoso"],                 ml: 90, nombre: "Espumoso" },
      { rol: ["alargador"],                ml: 30, nombre: "Soda" },
    ],
  },
  {
    id: "tiki", nombreCorto: "Tiki", emoji: "🗿",
    nombre: "Tiki — Tropical complejo",
    formula: "base partida en dos · ácido · sirope · fruta",
    desc: "Capas de sabor: dos bases (o base + licor), cítrico, un sirope con personalidad y fruta. Servido sobre hielo picado con decoración generosa.",
    ejemplos: "Mai Tai, Zombie, Jungle Bird",
    vaso: "tiki", tecnica: "agitado", hielo: "picado",
    slots: [
      { rol: ["base"],                 ml: 40, nombre: "Base principal" },
      { rol: ["base", "licor-dulce"],  ml: 20, nombre: "Segunda base o licor" },
      { rol: ["acido"],                ml: 25, nombre: "Ácido cítrico" },
      { rol: ["dulce"],                ml: 15, nombre: "Sirope con carácter" },
      { rol: ["zumo", "pure"],         ml: 40, nombre: "Fruta" },
    ],
  },
  {
    id: "frozen", nombreCorto: "Frozen", emoji: "🥥",
    nombre: "Frozen / Cremoso",
    formula: "base · textura cremosa · fruta — todo batido",
    desc: "Batido con hielo hasta textura de granizado. La crema o clara da cuerpo; la fruta, el sabor. Perfecto para playa y carta de verano.",
    ejemplos: "Piña Colada, Daiquiri frozen de fresa",
    vaso: "hurricane", tecnica: "batido", hielo: "frappe",
    slots: [
      { rol: ["base"],          ml: 50, nombre: "Destilado base" },
      { rol: ["textura"],       ml: 30, nombre: "Cuerpo cremoso" },
      { rol: ["zumo", "pure"],  ml: 90, nombre: "Fruta" },
    ],
  },
  {
    id: "fruta-moderna", nombreCorto: "Sour de fruta", emoji: "🥭",
    nombre: "Sour de fruta — Firma de la casa",
    formula: "sour 2:1:1 + puré de fruta intenso",
    desc: "La forma más fácil de crear un cóctel de autor: toma la regla de oro del sour y súmale un puré o concentrado. Cada fruta nueva de tu inventario es un cóctel nuevo en la carta.",
    ejemplos: "Margarita de maracuyá, Daiquiri de fresa, Mango Sour",
    vaso: "margarita", tecnica: "agitado", hielo: "cubos",
    slots: [
      { rol: ["base"],                 ml: 50, nombre: "Destilado base" },
      { rol: ["licor-dulce", "dulce"], ml: 20, nombre: "Dulce" },
      { rol: ["acido"],                ml: 25, nombre: "Ácido cítrico" },
      { rol: ["pure"],                 ml: 30, nombre: "Puré / concentrado" },
    ],
  },
];

// ---------- Recetario clásico de referencia ----------
// Cantidades en ml para el vaso de referencia del catálogo.
// La app re-escala automáticamente a la cristalería y hielo de cada negocio.
// unidades: ml (mililitros), dash (≈0,9 ml), ud (unidades: hojas, etc.)
const RECETAS_CLASICAS = [
  {
    id: "margarita", nombre: "Margarita", vaso: "margarita", tecnica: "agitado", hielo: "cubos",
    ingredientes: [
      { tipo: "tequila", ml: 50 }, { tipo: "triple-sec", ml: 25 }, { tipo: "zumo-lima", ml: 25 },
    ],
    decoracion: "Borde de sal y rodaja de lima",
    pasos: "Agitar con hielo 12-15 s y colar sobre hielo nuevo en la copa con borde de sal.",
  },
  {
    id: "tommys-margarita", nombre: "Tommy's Margarita", vaso: "rocks", tecnica: "agitado", hielo: "cubos",
    ingredientes: [
      { tipo: "tequila", ml: 50 }, { tipo: "zumo-lima", ml: 25 }, { tipo: "sirope-agave", ml: 15 },
    ],
    decoracion: "Rodaja de lima",
    pasos: "Agitar con hielo y colar sobre cubos en vaso rocks.",
  },
  {
    id: "daiquiri", nombre: "Daiquiri", vaso: "coupe", tecnica: "agitado", hielo: "sin-hielo",
    ingredientes: [
      { tipo: "ron-blanco", ml: 60 }, { tipo: "zumo-lima", ml: 25 }, { tipo: "sirope-simple", ml: 15 },
    ],
    decoracion: "Twist de lima",
    pasos: "Agitar fuerte con hielo y colar fino en copa fría.",
  },
  {
    id: "mojito", nombre: "Mojito", vaso: "collins", tecnica: "directo", hielo: "picado",
    ingredientes: [
      { tipo: "ron-blanco", ml: 50 }, { tipo: "zumo-lima", ml: 30 }, { tipo: "sirope-simple", ml: 20 },
      { tipo: "menta", ud: 8 }, { tipo: "soda", ml: 60 },
    ],
    decoracion: "Ramillete de menta y caña",
    pasos: "Macerar suavemente la menta con lima y sirope, llenar de hielo picado, añadir ron, remover y terminar con soda.",
  },
  {
    id: "gin-tonic", nombre: "Gin Tonic", vaso: "balon", tecnica: "directo", hielo: "cubos",
    ingredientes: [
      { tipo: "ginebra", ml: 50 }, { tipo: "tonica", ml: 200 },
    ],
    decoracion: "Botánico según ginebra (lima, pepino, enebro…)",
    pasos: "Enfriar la copa con hielo, escurrir, añadir hielo nuevo, ginebra y tónica por bailarina.",
  },
  {
    id: "pina-colada", nombre: "Piña Colada", vaso: "hurricane", tecnica: "batido", hielo: "frappe",
    ingredientes: [
      { tipo: "ron-blanco", ml: 50 }, { tipo: "crema-coco", ml: 30 }, { tipo: "zumo-pina", ml: 90 },
    ],
    decoracion: "Trozo de piña y cereza",
    pasos: "Batir con hielo frappé hasta textura cremosa y servir.",
  },
  {
    id: "cosmopolitan", nombre: "Cosmopolitan", vaso: "martini", tecnica: "agitado", hielo: "sin-hielo",
    ingredientes: [
      { tipo: "vodka", ml: 40 }, { tipo: "triple-sec", ml: 15 },
      { tipo: "zumo-arandanos", ml: 30 }, { tipo: "zumo-lima", ml: 15 },
    ],
    decoracion: "Twist de naranja flameado",
    pasos: "Agitar con hielo y colar fino en copa fría.",
  },
  {
    id: "negroni", nombre: "Negroni", vaso: "rocks", tecnica: "removido", hielo: "bloque",
    ingredientes: [
      { tipo: "ginebra", ml: 30 }, { tipo: "vermut-rojo", ml: 30 }, { tipo: "campari", ml: 30 },
    ],
    decoracion: "Rodaja o twist de naranja",
    pasos: "Remover con hielo en vaso mezclador y colar sobre bloque de hielo.",
  },
  {
    id: "old-fashioned", nombre: "Old Fashioned", vaso: "rocks", tecnica: "removido", hielo: "esfera",
    ingredientes: [
      { tipo: "bourbon", ml: 60 }, { tipo: "sirope-simple", ml: 10 }, { tipo: "angostura", dash: 2 },
    ],
    decoracion: "Twist de naranja",
    pasos: "Remover con hielo y servir sobre esfera o bloque grande.",
  },
  {
    id: "whisky-sour", nombre: "Whisky Sour", vaso: "rocks", tecnica: "agitado", hielo: "cubos",
    ingredientes: [
      { tipo: "bourbon", ml: 60 }, { tipo: "zumo-limon", ml: 30 },
      { tipo: "sirope-simple", ml: 20 }, { tipo: "clara-huevo", ml: 20 },
    ],
    decoracion: "Piel de limón y cereza",
    pasos: "Dry shake sin hielo para emulsionar, agitar con hielo y colar sobre cubos.",
  },
  {
    id: "moscow-mule", nombre: "Moscow Mule", vaso: "mule", tecnica: "directo", hielo: "cubos",
    ingredientes: [
      { tipo: "vodka", ml: 50 }, { tipo: "zumo-lima", ml: 15 }, { tipo: "ginger-beer", ml: 120 },
    ],
    decoracion: "Rodaja de lima y menta",
    pasos: "Construir en la taza con hielo y remover suavemente.",
  },
  {
    id: "paloma", nombre: "Paloma", vaso: "highball", tecnica: "directo", hielo: "cubos",
    ingredientes: [
      { tipo: "tequila", ml: 50 }, { tipo: "zumo-lima", ml: 15 }, { tipo: "refresco-pomelo", ml: 110 },
    ],
    decoracion: "Borde de sal y rodaja de pomelo",
    pasos: "Construir en vaso con hielo y borde de sal opcional.",
  },
  {
    id: "caipirinha", nombre: "Caipirinha", vaso: "rocks", tecnica: "directo", hielo: "picado",
    ingredientes: [
      { tipo: "cachaca", ml: 60 }, { tipo: "zumo-lima", ml: 30 }, { tipo: "sirope-simple", ml: 20 },
    ],
    decoracion: "Trozos de lima macerados",
    pasos: "Macerar lima en trozos con el azúcar/sirope, llenar de hielo picado, añadir cachaça y remover.",
  },
  {
    id: "aperol-spritz", nombre: "Aperol Spritz", vaso: "vino", tecnica: "directo", hielo: "cubos",
    ingredientes: [
      { tipo: "aperol", ml: 60 }, { tipo: "cava-prosecco", ml: 90 }, { tipo: "soda", ml: 30 },
    ],
    decoracion: "Rodaja de naranja",
    pasos: "Construir en copa con hielo: prosecco, aperol y golpe de soda.",
  },
  {
    id: "espresso-martini", nombre: "Espresso Martini", vaso: "martini", tecnica: "agitado", hielo: "sin-hielo",
    ingredientes: [
      { tipo: "vodka", ml: 50 }, { tipo: "licor-cafe", ml: 20 },
      { tipo: "espresso", ml: 30 }, { tipo: "sirope-simple", ml: 10 },
    ],
    decoracion: "3 granos de café",
    pasos: "Agitar fuerte con hielo y colar fino en copa fría para conservar la crema.",
  },
  {
    id: "mai-tai", nombre: "Mai Tai", vaso: "tiki", tecnica: "agitado", hielo: "picado",
    ingredientes: [
      { tipo: "ron-blanco", ml: 30 }, { tipo: "ron-oscuro", ml: 30 }, { tipo: "triple-sec", ml: 15 },
      { tipo: "orgeat", ml: 15 }, { tipo: "zumo-lima", ml: 25 },
    ],
    decoracion: "Menta y media lima exprimida",
    pasos: "Agitar con hielo y verter sin colar sobre hielo picado.",
  },
  {
    id: "sex-on-the-beach", nombre: "Sex on the Beach", vaso: "highball", tecnica: "directo", hielo: "cubos",
    ingredientes: [
      { tipo: "vodka", ml: 40 }, { tipo: "licor-melocoton", ml: 20 },
      { tipo: "zumo-naranja", ml: 80 }, { tipo: "zumo-arandanos", ml: 80 },
    ],
    decoracion: "Rodaja de naranja y cereza",
    pasos: "Construir en vaso con hielo y remover.",
  },
  {
    id: "tequila-sunrise", nombre: "Tequila Sunrise", vaso: "highball", tecnica: "directo", hielo: "cubos",
    ingredientes: [
      { tipo: "tequila", ml: 50 }, { tipo: "zumo-naranja", ml: 120 }, { tipo: "granadina", ml: 15 },
    ],
    decoracion: "Rodaja de naranja y cereza",
    pasos: "Construir tequila y naranja sobre hielo, dejar caer la granadina al fondo.",
  },
  {
    id: "manhattan", nombre: "Manhattan", vaso: "nick-nora", tecnica: "removido", hielo: "sin-hielo",
    ingredientes: [
      { tipo: "whisky-centeno", ml: 60 }, { tipo: "vermut-rojo", ml: 30 }, { tipo: "angostura", dash: 2 },
    ],
    decoracion: "Cereza al marrasquino",
    pasos: "Remover con hielo en vaso mezclador y colar en copa fría.",
  },
  {
    id: "dry-martini", nombre: "Dry Martini", vaso: "martini", tecnica: "removido", hielo: "sin-hielo",
    ingredientes: [
      { tipo: "ginebra", ml: 70 }, { tipo: "vermut-seco", ml: 15 },
    ],
    decoracion: "Aceituna o twist de limón",
    pasos: "Remover con hielo hasta enfriar bien y colar en copa fría.",
  },
  {
    id: "cuba-libre", nombre: "Cuba Libre", vaso: "highball", tecnica: "directo", hielo: "cubos",
    ingredientes: [
      { tipo: "ron-blanco", ml: 50 }, { tipo: "cola", ml: 120 }, { tipo: "zumo-lima", ml: 10 },
    ],
    decoracion: "Gajos de lima",
    pasos: "Construir en vaso con hielo, exprimir la lima dentro y remover.",
  },
  {
    id: "pisco-sour", nombre: "Pisco Sour", vaso: "sour", tecnica: "agitado", hielo: "sin-hielo",
    ingredientes: [
      { tipo: "pisco", ml: 60 }, { tipo: "zumo-lima", ml: 30 }, { tipo: "sirope-simple", ml: 20 },
      { tipo: "clara-huevo", ml: 30 }, { tipo: "angostura", dash: 3 },
    ],
    decoracion: "Gotas de angostura sobre la espuma",
    pasos: "Dry shake, agitar con hielo, colar fino y decorar la espuma con angostura.",
  },
];

const ML_POR_DASH = 0.9; // 1 dash ≈ 0,9 ml
