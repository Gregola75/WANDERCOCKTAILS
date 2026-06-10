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

// ---------- Tipos de ingrediente ----------
// Las recetas referencian estos tipos; el inventario de cada negocio
// asocia sus botellas/productos concretos a un tipo.
const TIPOS_INGREDIENTE = [
  // Destilados base
  { id: "tequila",         nombre: "Tequila",                cat: "Destilados" },
  { id: "mezcal",          nombre: "Mezcal",                 cat: "Destilados" },
  { id: "ron-blanco",      nombre: "Ron blanco",             cat: "Destilados" },
  { id: "ron-oscuro",      nombre: "Ron oscuro / añejo",     cat: "Destilados" },
  { id: "ron-especiado",   nombre: "Ron especiado",          cat: "Destilados" },
  { id: "vodka",           nombre: "Vodka",                  cat: "Destilados" },
  { id: "ginebra",         nombre: "Ginebra",                cat: "Destilados" },
  { id: "bourbon",         nombre: "Whisky bourbon",         cat: "Destilados" },
  { id: "whisky-centeno",  nombre: "Whisky de centeno (rye)",cat: "Destilados" },
  { id: "whisky-escoces",  nombre: "Whisky escocés",         cat: "Destilados" },
  { id: "brandy",          nombre: "Brandy / Coñac",         cat: "Destilados" },
  { id: "pisco",           nombre: "Pisco",                  cat: "Destilados" },
  { id: "cachaca",         nombre: "Cachaça",                cat: "Destilados" },
  // Licores y aperitivos
  { id: "triple-sec",      nombre: "Triple sec / Curaçao naranja", cat: "Licores" },
  { id: "blue-curacao",    nombre: "Blue curaçao",           cat: "Licores" },
  { id: "licor-cafe",      nombre: "Licor de café",          cat: "Licores" },
  { id: "licor-melocoton", nombre: "Licor de melocotón",     cat: "Licores" },
  { id: "licor-coco",      nombre: "Licor de coco",          cat: "Licores" },
  { id: "amaretto",        nombre: "Amaretto",               cat: "Licores" },
  { id: "vermut-rojo",     nombre: "Vermut rojo",            cat: "Licores" },
  { id: "vermut-seco",     nombre: "Vermut seco",            cat: "Licores" },
  { id: "campari",         nombre: "Campari (bitter rojo)",  cat: "Licores" },
  { id: "aperol",          nombre: "Aperol",                 cat: "Licores" },
  { id: "cava-prosecco",   nombre: "Cava / Prosecco",        cat: "Licores" },
  // Siropes y endulzantes
  { id: "sirope-simple",   nombre: "Sirope simple (azúcar)", cat: "Siropes" },
  { id: "granadina",       nombre: "Granadina",              cat: "Siropes" },
  { id: "sirope-agave",    nombre: "Sirope de agave",        cat: "Siropes" },
  { id: "orgeat",          nombre: "Orgeat (almendra)",      cat: "Siropes" },
  { id: "miel",            nombre: "Miel / sirope de miel",  cat: "Siropes" },
  // Zumos
  { id: "zumo-lima",       nombre: "Zumo de lima",           cat: "Zumos" },
  { id: "zumo-limon",      nombre: "Zumo de limón",          cat: "Zumos" },
  { id: "zumo-naranja",    nombre: "Zumo de naranja",        cat: "Zumos" },
  { id: "zumo-pina",       nombre: "Zumo de piña",           cat: "Zumos" },
  { id: "zumo-arandanos",  nombre: "Zumo de arándanos",      cat: "Zumos" },
  { id: "zumo-pomelo",     nombre: "Zumo de pomelo",         cat: "Zumos" },
  { id: "zumo-tomate",     nombre: "Zumo de tomate",         cat: "Zumos" },
  // Concentrados y purés
  { id: "crema-coco",      nombre: "Crema de coco",          cat: "Concentrados" },
  { id: "pure-fresa",      nombre: "Puré / concentrado de fresa",   cat: "Concentrados" },
  { id: "pure-maracuya",   nombre: "Puré / concentrado de maracuyá",cat: "Concentrados" },
  { id: "pure-mango",      nombre: "Puré / concentrado de mango",   cat: "Concentrados" },
  // Refrescos y otros
  { id: "soda",            nombre: "Agua con gas / soda",    cat: "Refrescos" },
  { id: "tonica",          nombre: "Tónica",                 cat: "Refrescos" },
  { id: "ginger-beer",     nombre: "Ginger beer",            cat: "Refrescos" },
  { id: "ginger-ale",      nombre: "Ginger ale",             cat: "Refrescos" },
  { id: "cola",            nombre: "Refresco de cola",       cat: "Refrescos" },
  { id: "refresco-pomelo", nombre: "Refresco de pomelo",     cat: "Refrescos" },
  { id: "espresso",        nombre: "Café espresso",          cat: "Otros" },
  { id: "clara-huevo",     nombre: "Clara de huevo",         cat: "Otros" },
  { id: "nata",            nombre: "Nata / crema de leche",  cat: "Otros" },
  { id: "angostura",       nombre: "Angostura bitters",      cat: "Otros" },
  { id: "menta",           nombre: "Menta / hierbabuena fresca", cat: "Otros" },
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
