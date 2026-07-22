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
  { id: "sidra",       nombre: "Vaso de Sidra",             ml: 380, rango: [300, 500], desc: "Vaso ancho de cristal fino. Sidra escanciada y combinados largos." },
];

// ---------- Siluetas de los vasos (línea dorada, sin imágenes externas) ----------
const _svg = inner => `<svg viewBox="0 0 64 96" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round">${inner}</svg>`;
const VASO_SVG = {
  "martini":     _svg('<path d="M6 12h52L32 44Z"/><path d="M32 44v32"/><path d="M16 84h32"/>'),
  "coupe":       _svg('<path d="M8 14c2 16 14 22 24 22s22-6 24-22Z"/><path d="M32 36v40"/><path d="M16 84h32"/>'),
  "margarita":   _svg('<path d="M6 12h52c0 9-12 13-18 14-1 4-4 7-8 7s-7-3-8-7c-6-1-18-5-18-14Z"/><path d="M32 33v43"/><path d="M16 84h32"/>'),
  "rocks":       _svg('<path d="M14 38h36l-3 46H17Z"/><path d="M18 54h28" opacity=".35"/>'),
  "rocks-doble": _svg('<path d="M12 30h40l-3 54H15Z"/><path d="M16 48h32" opacity=".35"/>'),
  "highball":    _svg('<path d="M18 12h28l-2 72H20Z"/><path d="M21 32h22" opacity=".35"/>'),
  "collins":     _svg('<path d="M21 8h22l-1 78H22Z"/><path d="M23 28h18" opacity=".35"/>'),
  "zombie":      _svg('<path d="M20 8h24v78H20Z"/><path d="M24 26h16" opacity=".35"/>'),
  "hurricane":   _svg('<path d="M24 8h16c3 12-3 18-3 26 0 10 7 14 6 24-1 9-5 12-11 12s-10-3-11-12c-1-10 6-14 6-24 0-8-6-14-3-26Z"/><path d="M32 70v6"/><path d="M22 84h20"/>'),
  "balon":       _svg('<path d="M32 10c-14 0-22 9-22 21 0 13 10 21 22 21s22-8 22-21c0-12-8-21-22-21Z"/><path d="M32 52v26"/><path d="M18 84h28"/>'),
  "tiki":        _svg('<path d="M19 10h26v74H19Z"/><path d="M24 30h16M24 42h16"/><path d="M26 58h4m6 0h4"/>'),
  "mule":        _svg('<path d="M14 24h30v56H14Z"/><path d="M44 34c11 0 11 22 0 22"/><path d="M18 36h22" opacity=".35"/>'),
  "julep":       _svg('<path d="M18 20h28l-4 62H22Z"/><path d="M19 32h26"/>'),
  "sour":        _svg('<path d="M19 12c0 16 5 22 13 22s13-6 13-22Z"/><path d="M32 34v42"/><path d="M16 84h32"/>'),
  "nick-nora":   _svg('<path d="M15 12c0 15 7 22 17 22s17-7 17-22Z"/><path d="M32 34v42"/><path d="M16 84h32"/>'),
  "flauta":      _svg('<path d="M25 8c0 26 1 36 7 36s7-10 7-36Z"/><path d="M32 44v32"/><path d="M18 84h28"/>'),
  "vino":        _svg('<path d="M17 10c0 18 5 26 15 26s15-8 15-26Z"/><path d="M32 36v40"/><path d="M16 84h32"/>'),
  "shot":        _svg('<path d="M22 50h20l-2 34H24Z"/><path d="M25 62h14" opacity=".35"/>'),
  "sidra":       _svg('<path d="M16 14h32l-3 70H19Z"/><path d="M20 34h24" opacity=".35"/>'),
};

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
  { id: "batido-helado", nombre: "Batido con helado (sin hielo)", dilucionPct: 10 },
  { id: "capas",    nombre: "En capas (pousse-café)",  dilucionPct: 0 },
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
  { id: "crema-irlandesa", nombre: "Crema irlandesa (tipo Baileys)", cat: "Licores", sub: "Licores dulces", rol: "licor-dulce" },
  { id: "licor-menta",     nombre: "Crema de menta (verde)", cat: "Licores", sub: "Licores dulces",     rol: "licor-dulce" },
  { id: "vermut-rojo",     nombre: "Vermut rojo",            cat: "Licores", sub: "Vermuts",            rol: "vermut" },
  { id: "vermut-seco",     nombre: "Vermut seco",            cat: "Licores", sub: "Vermuts",            rol: "vermut" },
  { id: "campari",         nombre: "Campari (bitter rojo)",  cat: "Licores", sub: "Aperitivos amargos", rol: "aperitivo" },
  { id: "aperol",          nombre: "Aperol",                 cat: "Licores", sub: "Aperitivos amargos", rol: "aperitivo" },
  { id: "cava-prosecco",   nombre: "Cava / Prosecco",        cat: "Licores", sub: "Espumosos",          rol: "espumoso" },
  { id: "vino-tinto",      nombre: "Vino tinto",             cat: "Licores", sub: "Vinos",               rol: "base" },
  { id: "vino-blanco",     nombre: "Vino blanco",            cat: "Licores", sub: "Vinos",               rol: "base" },
  { id: "vino-rosado",     nombre: "Vino rosado",            cat: "Licores", sub: "Vinos",               rol: "base" },
  { id: "vino-dulce",      nombre: "Vino dulce (moscatel, oporto)", cat: "Licores", sub: "Vinos",        rol: "licor-dulce" },
  // Siropes
  { id: "sirope-simple",   nombre: "Sirope simple (azúcar)", cat: "Siropes", sub: "Básicos",    rol: "dulce" },
  { id: "sirope-agave",    nombre: "Sirope de agave",        cat: "Siropes", sub: "Básicos",    rol: "dulce" },
  { id: "miel",            nombre: "Miel / sirope de miel",  cat: "Siropes", sub: "Básicos",    rol: "dulce" },
  { id: "granadina",       nombre: "Granadina",              cat: "Siropes", sub: "Especiales", rol: "dulce" },
  { id: "orgeat",          nombre: "Orgeat (almendra)",      cat: "Siropes", sub: "Especiales", rol: "dulce" },
  { id: "sirope-vainilla", nombre: "Sirope de vainilla",     cat: "Siropes", sub: "Especiales", rol: "dulce" },
  { id: "sirope-canela",   nombre: "Sirope de canela",       cat: "Siropes", sub: "Especiales", rol: "dulce" },
  { id: "sirope-jengibre", nombre: "Sirope de jengibre",     cat: "Siropes", sub: "Especiales", rol: "dulce" },
  { id: "sirope-caramelo", nombre: "Sirope de caramelo",     cat: "Siropes", sub: "Especiales", rol: "dulce" },
  { id: "sirope-cafe",     nombre: "Sirope de café",         cat: "Siropes", sub: "Especiales", rol: "dulce" },
  // Siropes de fruta
  { id: "sirope-maracuya", nombre: "Sirope de maracuyá",     cat: "Siropes", sub: "Siropes de fruta", rol: "dulce" },
  { id: "sirope-mango",    nombre: "Sirope de mango",        cat: "Siropes", sub: "Siropes de fruta", rol: "dulce" },
  { id: "sirope-coco",     nombre: "Sirope de coco",         cat: "Siropes", sub: "Siropes de fruta", rol: "dulce" },
  { id: "sirope-fresa",    nombre: "Sirope de fresa",        cat: "Siropes", sub: "Siropes de fruta", rol: "dulce" },
  { id: "sirope-frambuesa",nombre: "Sirope de frambuesa",    cat: "Siropes", sub: "Siropes de fruta", rol: "dulce" },
  { id: "sirope-frutos-rojos", nombre: "Sirope de frutos rojos", cat: "Siropes", sub: "Siropes de fruta", rol: "dulce" },
  { id: "sirope-melocoton",nombre: "Sirope de melocotón",    cat: "Siropes", sub: "Siropes de fruta", rol: "dulce" },
  { id: "sirope-pina",     nombre: "Sirope de piña",         cat: "Siropes", sub: "Siropes de fruta", rol: "dulce" },
  { id: "sirope-sandia",   nombre: "Sirope de sandía",       cat: "Siropes", sub: "Siropes de fruta", rol: "dulce" },
  { id: "sirope-platano",  nombre: "Sirope de plátano",      cat: "Siropes", sub: "Siropes de fruta", rol: "dulce" },
  { id: "sirope-lichi",    nombre: "Sirope de lichi",        cat: "Siropes", sub: "Siropes de fruta", rol: "dulce" },
  { id: "sirope-manzana",  nombre: "Sirope de manzana verde",cat: "Siropes", sub: "Siropes de fruta", rol: "dulce" },
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
  { id: "pure-frambuesa",  nombre: "Puré / concentrado de frambuesa",cat: "Concentrados", sub: "Purés de fruta", rol: "pure" },
  { id: "pure-melocoton",  nombre: "Puré / concentrado de melocotón",cat: "Concentrados", sub: "Purés de fruta", rol: "pure" },
  { id: "pure-platano",    nombre: "Puré / concentrado de plátano",  cat: "Concentrados", sub: "Purés de fruta", rol: "pure" },
  { id: "pure-coco",       nombre: "Puré / concentrado de coco",     cat: "Concentrados", sub: "Purés de fruta", rol: "pure" },
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
  { id: "helado-vainilla", nombre: "Helado de vainilla",     cat: "Frescos", sub: "Perecederos", rol: "textura" },
  { id: "platano",         nombre: "Plátano fresco",         cat: "Frescos", sub: "Perecederos", rol: "pure" },
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
    id: "frozen-helado", nombreCorto: "Batido con helado", emoji: "🍨",
    nombre: "Batido con helado — Postre con alcohol",
    formula: "base + licor + 2 bolas de helado, batido sin hielo",
    desc: "El helado sustituye al hielo: congela, endulza y da cremosidad de postre. La regla anti-aguado: poco alcohol (el alcohol no congela), nada de hielo y batir poco tiempo a máxima potencia.",
    ejemplos: "Mudslide, Brandy Alexander helado",
    vaso: "hurricane", tecnica: "batido-helado", hielo: "sin-hielo",
    slots: [
      { rol: ["base"],                 ml: 30,  nombre: "Destilado base" },
      { rol: ["licor-dulce"],          ml: 30,  nombre: "Licor que da el sabor" },
      { rol: ["textura"],              ml: 120, nombre: "Helado (2 bolas) o crema" },
      { rol: ["pure", "zumo"],         ml: 40,  nombre: "Fruta", opcional: true },
    ],
  },
  {
    id: "shot-capas", nombreCorto: "Chupito en capas", emoji: "🌈",
    nombre: "Chupito en capas — Pousse-café",
    formula: "3 capas: el más denso abajo, el más seco arriba",
    desc: "Espectáculo puro en barra: licores vertidos por orden de densidad (más azúcar = más denso = abajo). La app calcula el orden de vertido automáticamente.",
    ejemplos: "B-52, Baby Guinness, Bandera Mexicana",
    vaso: "shot", tecnica: "capas", hielo: "sin-hielo",
    slots: [
      { rol: ["dulce"],                 ml: 15, nombre: "Capa densa (sirope/granadina)" },
      { rol: ["licor-dulce"],           ml: 15, nombre: "Capa media (licor)" },
      { rol: ["base", "licor-dulce"],   ml: 15, nombre: "Capa superior (destilado o licor seco)" },
    ],
  },
  {
    id: "shot-citrico", nombreCorto: "Chupito cítrico", emoji: "⚡",
    nombre: "Chupito cítrico — Mini sour",
    formula: "la regla de oro en 45 ml: base + cítrico + dulce, agitado",
    desc: "Un sour concentrado en un trago: se agita con hielo, se cuela fino y entra frío y equilibrado. La fórmula del Kamikaze y el Lemon Drop.",
    ejemplos: "Kamikaze, Lemon Drop",
    vaso: "shot", tecnica: "agitado", hielo: "sin-hielo",
    slots: [
      { rol: ["base"],                 ml: 22, nombre: "Destilado base" },
      { rol: ["acido"],                ml: 13, nombre: "Cítrico" },
      { rol: ["dulce", "licor-dulce"], ml: 10, nombre: "Dulce" },
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
  {
    id: "frozen-margarita", nombre: "Frozen Margarita", vaso: "margarita", tecnica: "batido", hielo: "frappe",
    ingredientes: [
      { tipo: "tequila", ml: 45 }, { tipo: "triple-sec", ml: 15 },
      { tipo: "zumo-lima", ml: 25 }, { tipo: "sirope-agave", ml: 15 },
    ],
    decoracion: "Borde de sal y rodaja de lima",
    pasos: "Batir con hielo frappé hasta textura de granizado fino. Todo muy frío antes de batir.",
  },
  {
    id: "frozen-daiquiri-fresa", nombre: "Frozen Daiquiri de Fresa", vaso: "hurricane", tecnica: "batido", hielo: "frappe",
    ingredientes: [
      { tipo: "ron-blanco", ml: 50 }, { tipo: "zumo-lima", ml: 20 },
      { tipo: "sirope-simple", ml: 15 }, { tipo: "pure-fresa", ml: 50 },
    ],
    decoracion: "Fresa en el borde",
    pasos: "Batir con hielo frappé; el puré da el cuerpo que evita que se ague.",
  },
  {
    id: "mudslide", nombre: "Mudslide (con helado)", vaso: "hurricane", tecnica: "batido-helado", hielo: "sin-hielo",
    ingredientes: [
      { tipo: "vodka", ml: 30 }, { tipo: "licor-cafe", ml: 30 },
      { tipo: "crema-irlandesa", ml: 30 }, { tipo: "helado-vainilla", ml: 120 },
    ],
    decoracion: "Sirope de chocolate en las paredes y nata",
    pasos: "Batir con el helado SIN hielo, poco tiempo y a máxima potencia. Copa helada.",
  },
];

// ---------- Carta de chupitos (los shots más famosos del mundo) ----------
// Referenciados al vaso shot del catálogo (50 ml); se escalan al caballito
// real de cada negocio. Los de capas se vierten por orden de densidad.
const RECETAS_SHOTS = [
  {
    id: "b52", nombre: "B-52", vaso: "shot", tecnica: "capas", hielo: "sin-hielo", esShot: true,
    ingredientes: [
      { tipo: "licor-cafe", ml: 15 }, { tipo: "crema-irlandesa", ml: 15 }, { tipo: "triple-sec", ml: 15 },
    ],
    decoracion: "Se puede flamear la capa superior unos segundos",
    pasos: "Verter por capas sobre el dorso de una cuchara, sin mezclar.",
  },
  {
    id: "baby-guinness", nombre: "Baby Guinness", vaso: "shot", tecnica: "capas", hielo: "sin-hielo", esShot: true,
    ingredientes: [
      { tipo: "licor-cafe", ml: 30 }, { tipo: "crema-irlandesa", ml: 15 },
    ],
    decoracion: "Parece una Guinness en miniatura: 'espuma' de crema",
    pasos: "Café abajo y una capa fina de crema irlandesa por encima, vertida sobre cuchara.",
  },
  {
    id: "kamikaze", nombre: "Kamikaze", vaso: "shot", tecnica: "agitado", hielo: "sin-hielo", esShot: true,
    ingredientes: [
      { tipo: "vodka", ml: 20 }, { tipo: "triple-sec", ml: 13 }, { tipo: "zumo-lima", ml: 12 },
    ],
    decoracion: "Gajo de lima",
    pasos: "Agitar con hielo y colar fino en el caballito.",
  },
  {
    id: "lemon-drop", nombre: "Lemon Drop", vaso: "shot", tecnica: "agitado", hielo: "sin-hielo", esShot: true,
    ingredientes: [
      { tipo: "vodka", ml: 22 }, { tipo: "zumo-limon", ml: 13 }, { tipo: "sirope-simple", ml: 10 },
    ],
    decoracion: "Borde de azúcar y piel de limón",
    pasos: "Agitar con hielo, colar y servir con el borde escarchado de azúcar.",
  },
  {
    id: "cerebrito", nombre: "Cerebrito (Brain)", vaso: "shot", tecnica: "capas", hielo: "sin-hielo", esShot: true,
    ingredientes: [
      { tipo: "licor-melocoton", ml: 25 }, { tipo: "crema-irlandesa", ml: 15 }, { tipo: "granadina", ml: 5 },
    ],
    decoracion: "La granadina 'rompe' la crema y forma el cerebro",
    pasos: "Melocotón de base, crema irlandesa vertida despacio y unas gotas de granadina al final.",
  },
  {
    id: "bandera-mexicana", nombre: "Bandera Mexicana", vaso: "shot", tecnica: "capas", hielo: "sin-hielo", esShot: true,
    ingredientes: [
      { tipo: "granadina", ml: 15 }, { tipo: "zumo-lima", ml: 15 }, { tipo: "tequila", ml: 15 },
    ],
    decoracion: "Tres capas: rojo, verde lima y blanco",
    pasos: "Granadina abajo, lima en medio y tequila arriba, siempre sobre cuchara.",
  },
  {
    id: "tequila-clasico", nombre: "Tequila Clásico", vaso: "shot", tecnica: "directo", hielo: "sin-hielo", esShot: true,
    ingredientes: [
      { tipo: "tequila", ml: 45 },
    ],
    decoracion: "Sal y gajo de lima",
    pasos: "El ritual: sal en la mano, tequila de un trago y lima al final.",
  },
  {
    id: "cucaracha", nombre: "Cucaracha", vaso: "shot", tecnica: "directo", hielo: "sin-hielo", esShot: true,
    ingredientes: [
      { tipo: "licor-cafe", ml: 22 }, { tipo: "tequila", ml: 23 },
    ],
    decoracion: "Tradicionalmente se flamea (con mucho cuidado)",
    pasos: "Construir en el caballito. Si se flamea, apagar antes de beber y avisar al cliente.",
  },
  {
    id: "beach-shot", nombre: "Sex on the Beach Shot", vaso: "shot", tecnica: "agitado", hielo: "sin-hielo", esShot: true,
    ingredientes: [
      { tipo: "vodka", ml: 15 }, { tipo: "licor-melocoton", ml: 10 },
      { tipo: "zumo-naranja", ml: 10 }, { tipo: "zumo-arandanos", ml: 10 },
    ],
    decoracion: "Media cereza",
    pasos: "Agitar con hielo y colar fino.",
  },
  {
    id: "menta-polar", nombre: "Beso Polar", vaso: "shot", tecnica: "capas", hielo: "sin-hielo", esShot: true,
    ingredientes: [
      { tipo: "licor-menta", ml: 22 }, { tipo: "crema-irlandesa", ml: 22 },
    ],
    decoracion: "Verde y crema: refrescante y dulce",
    pasos: "Crema de menta abajo y crema irlandesa flotando encima.",
  },
];

const ML_POR_DASH = 0.9; // 1 dash ≈ 0,9 ml

// ---------- Catálogo de decoraciones / garnish ----------
// Ilustraciones a línea dorada (sin imágenes externas). Cada negocio puede
// sustituir el dibujo por una foto real de su decoración.
const _dsvg = inner => `<svg viewBox="0 0 64 64" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round">${inner}</svg>`;
const DECORACIONES = [
  { id: "rodaja-lima",   nombre: "Rodaja de lima",   grupo: "Cítricos", como: "Corta una rueda fina de lima y engánchala en el borde o déjala flotar.",
    svg: _dsvg('<circle cx="32" cy="32" r="21"/><circle cx="32" cy="32" r="5"/><path d="M32 11v42M11 32h42M17 17l30 30M47 17 17 47"/>') },
  { id: "rodaja-limon",  nombre: "Rodaja de limón",  grupo: "Cítricos", como: "Rueda fina de limón al borde del vaso.",
    svg: _dsvg('<circle cx="32" cy="32" r="21"/><circle cx="32" cy="32" r="5"/><path d="M32 11v42M11 32h42M17 17l30 30M47 17 17 47"/>') },
  { id: "rodaja-naranja",nombre: "Rodaja de naranja",grupo: "Cítricos", como: "Media rueda de naranja pinchada o al borde.",
    svg: _dsvg('<path d="M11 32a21 21 0 0 1 42 0Z"/><path d="M32 11v21M18 15 32 32M46 15 32 32"/>') },
  { id: "gajo-lima",     nombre: "Gajo de lima",     grupo: "Cítricos", como: "Cuña de lima para exprimir y decorar.",
    svg: _dsvg('<path d="M14 46 50 18a24 24 0 0 1-36 28Z"/><path d="M20 40 44 22"/>') },
  { id: "twist-naranja", nombre: "Twist de naranja", grupo: "Cítricos", como: "Piel de naranja en espiral; exprime los aceites sobre la copa.",
    svg: _dsvg('<path d="M42 14c-14 0-22 9-22 19s7 17 15 17 12-6 12-12-5-11-11-11-8 4-8 9"/>') },
  { id: "twist-limon",   nombre: "Twist de limón",   grupo: "Cítricos", como: "Espiral de piel de limón sobre el borde.",
    svg: _dsvg('<path d="M42 14c-14 0-22 9-22 19s7 17 15 17 12-6 12-12-5-11-11-11-8 4-8 9"/>') },
  { id: "cereza",        nombre: "Cereza",           grupo: "Frutas",   como: "Cereza al marrasquino, pinchada o al fondo.",
    svg: _dsvg('<circle cx="26" cy="44" r="10"/><circle cx="43" cy="46" r="8"/><path d="M26 34c1-13 10-18 20-20"/>') },
  { id: "fresa",         nombre: "Fresa",            grupo: "Frutas",   como: "Fresa entera con corte para el borde, o en láminas.",
    svg: _dsvg('<path d="M32 54c-11 0-18-8-18-18 0-6 8-8 18-8s18 2 18 8c0 10-7 18-18 18Z"/><path d="M24 24l8-8 8 8"/><path d="M26 36h.01M32 40h.01M38 36h.01M30 46h.01M36 46h.01"/>') },
  { id: "pina",          nombre: "Trozo de piña",    grupo: "Frutas",   como: "Cuña de piña al borde, sola o con cereza.",
    svg: _dsvg('<path d="M20 52 44 52 40 26 24 26Z"/><path d="M32 26 24 8M32 26 40 8M32 26v-20"/><path d="M26 36l12 6M26 44l12-6"/>') },
  { id: "rodaja-pepino", nombre: "Rodaja de pepino", grupo: "Botánicos",como: "Lámina fina de pepino dentro del gin tonic o al borde.",
    svg: _dsvg('<circle cx="32" cy="32" r="21"/><path d="M28 24h.01M36 26h.01M26 34h.01M34 38h.01M38 32h.01M30 40h.01"/>') },
  { id: "menta",         nombre: "Ramillete de menta",grupo: "Botánicos",como: "Golpea la menta en la mano y clávala como sombrilla verde.",
    svg: _dsvg('<path d="M32 54V30"/><path d="M32 32c-11 0-17-6-17-17 11 0 17 6 17 17Z"/><path d="M32 36c11 0 17-6 17-15-11 0-17 6-17 15Z"/>') },
  { id: "romero",        nombre: "Ramita de romero", grupo: "Botánicos",como: "Rama de romero, se puede flamear ligeramente por el aroma.",
    svg: _dsvg('<path d="M32 54V12"/><path d="M32 20l8-6M32 20l-8-6M32 30l9-6M32 30l-9-6M32 40l8-6M32 40l-8-6"/>') },
  { id: "borde-sal",     nombre: "Borde de sal",     grupo: "Bordes",   como: "Humedece el borde con lima y gíralo sobre sal (solo media vuelta).",
    svg: _dsvg('<path d="M14 22c0 20 4 30 18 30s18-10 18-30"/><ellipse cx="32" cy="22" rx="18" ry="6"/><path d="M18 17h.01M24 14h.01M32 13h.01M40 14h.01M46 17h.01"/>') },
  { id: "borde-azucar",  nombre: "Borde de azúcar",  grupo: "Bordes",   como: "Igual que la sal pero con azúcar; ideal para cítricos dulces.",
    svg: _dsvg('<path d="M14 22c0 20 4 30 18 30s18-10 18-30"/><ellipse cx="32" cy="22" rx="18" ry="6"/><path d="M18 17h.01M24 14h.01M32 13h.01M40 14h.01M46 17h.01"/>') },
  { id: "granos-cafe",   nombre: "Granos de café",   grupo: "Especias", como: "3 granos de café sobre la espuma (espresso martini).",
    svg: _dsvg('<ellipse cx="24" cy="26" rx="7" ry="10" transform="rotate(-20 24 26)"/><path d="M24 18v16"/><ellipse cx="40" cy="30" rx="7" ry="10" transform="rotate(20 40 30)"/><path d="M40 22v16"/><ellipse cx="32" cy="44" rx="7" ry="10"/><path d="M32 36v16"/>') },
  { id: "canela",        nombre: "Rama de canela",   grupo: "Especias", como: "Rama de canela, se puede rallar o flamear por encima.",
    svg: _dsvg('<rect x="27" y="10" width="10" height="44" rx="5"/><path d="M32 12v40"/>') },
  { id: "anis",          nombre: "Anís estrellado",  grupo: "Especias", como: "Estrella de anís flotando, aroma especiado.",
    svg: _dsvg('<path d="M32 10l5 10 11 1-8 8 3 11-11-6-11 6 3-11-8-8 11-1Z"/>') },
  { id: "aceituna",      nombre: "Aceituna",         grupo: "Salados",  como: "1-3 aceitunas en palillo (dry martini).",
    svg: _dsvg('<ellipse cx="32" cy="34" rx="14" ry="18"/><circle cx="32" cy="30" r="4"/><path d="M46 20 24 46"/>') },
];


// ---------- Origen de cada destilado (formación del personal) ----------
const SUB_ORIGEN = {
  "Ron":     "caña de azúcar",
  "Whisky":  "cereal / grano",
  "Vodka":   "grano o patata",
  "Tequila": "agave azul",
  "Mezcal":  "agave",
  "Ginebra": "grano + botánicos (enebro)",
  "Brandy":  "uva (vino destilado)",
  "Pisco":   "uva (mosto)",
  "Cachaça": "caña de azúcar",
};

// ---------- Perfil de sabor por tipo de ingrediente ----------
// Valores aproximados por ml: abv = graduación alcohólica,
// azucar / acido = gramos por ml, gas = carbonatado (nunca se agita),
// turbio = zumo/puré/lácteo/huevo (siempre se agita).
const PERFIL_TIPO = {
  // Destilados (~40º, secos)
  "tequila": { abv: .40 }, "mezcal": { abv: .42 },
  "ron-blanco": { abv: .40 }, "ron-oscuro": { abv: .40 }, "ron-especiado": { abv: .35 },
  "cachaca": { abv: .40 }, "vodka": { abv: .40 },
  "bourbon": { abv: .43 }, "whisky-centeno": { abv: .45 }, "whisky-escoces": { abv: .40 },
  "ginebra": { abv: .42 }, "brandy": { abv: .38 }, "pisco": { abv: .40 },
  // Licores
  "triple-sec": { abv: .30, azucar: .25 }, "blue-curacao": { abv: .22, azucar: .28 },
  "licor-melocoton": { abv: .18, azucar: .30 }, "licor-coco": { abv: .20, azucar: .32 },
  "licor-sauco": { abv: .20, azucar: .30 }, "licor-cafe": { abv: .20, azucar: .33 },
  "amaretto": { abv: .25, azucar: .30 }, "licor-hierbas": { abv: .30, azucar: .25, amargo: true },
  "crema-irlandesa": { abv: .17, azucar: .20, turbio: true, cremoso: true },
  "licor-menta": { abv: .24, azucar: .32 },
  "vermut-rojo": { abv: .15, azucar: .15 }, "vermut-seco": { abv: .15, azucar: .03 },
  "campari": { abv: .25, azucar: .20, amargo: true }, "aperol": { abv: .11, azucar: .24, amargo: true },
  "cava-prosecco": { abv: .11, azucar: .01, gas: true },
  "vino-tinto": { abv: .13, acido: .005 }, "vino-blanco": { abv: .12, acido: .006 },
  "vino-rosado": { abv: .12, acido: .005, azucar: .01 }, "vino-dulce": { abv: .15, azucar: .12 },
  // Siropes
  "sirope-simple": { azucar: .62 }, "sirope-agave": { azucar: .68 },
  "miel": { azucar: .70, turbio: true }, "granadina": { azucar: .55 },
  "orgeat": { azucar: .55, turbio: true }, "sirope-vainilla": { azucar: .60 }, "sirope-canela": { azucar: .60 },
  "sirope-jengibre": { azucar: .58 }, "sirope-caramelo": { azucar: .62 }, "sirope-cafe": { azucar: .60 },
  // Siropes de fruta (dulces, con un punto de acidez los cítricos/rojos)
  "sirope-maracuya": { azucar: .58, acido: .010 }, "sirope-mango": { azucar: .60 },
  "sirope-coco": { azucar: .60 }, "sirope-fresa": { azucar: .58, acido: .004 },
  "sirope-frambuesa": { azucar: .58, acido: .006 }, "sirope-frutos-rojos": { azucar: .58, acido: .006 },
  "sirope-melocoton": { azucar: .60 }, "sirope-pina": { azucar: .58, acido: .005 },
  "sirope-sandia": { azucar: .58 }, "sirope-platano": { azucar: .60 },
  "sirope-lichi": { azucar: .60 }, "sirope-manzana": { azucar: .58, acido: .005 },
  // Zumos
  "zumo-lima": { acido: .060, azucar: .015, turbio: true },
  "zumo-limon": { acido: .055, azucar: .025, turbio: true },
  "zumo-pomelo": { acido: .016, azucar: .07, turbio: true },
  "zumo-naranja": { acido: .010, azucar: .09, turbio: true },
  "zumo-pina": { acido: .009, azucar: .10, turbio: true },
  "zumo-arandanos": { acido: .013, azucar: .12, turbio: true },
  "zumo-manzana": { acido: .005, azucar: .10, turbio: true },
  "zumo-tomate": { acido: .004, azucar: .03, turbio: true },
  // Concentrados
  "pure-fresa": { acido: .008, azucar: .25, turbio: true },
  "pure-maracuya": { acido: .025, azucar: .22, turbio: true },
  "pure-mango": { acido: .005, azucar: .28, turbio: true },
  "pure-frambuesa": { acido: .012, azucar: .22, turbio: true },
  "pure-melocoton": { acido: .005, azucar: .24, turbio: true },
  "pure-platano": { acido: .003, azucar: .26, turbio: true, cremoso: true },
  "pure-coco": { azucar: .24, turbio: true, cremoso: true },
  "crema-coco": { azucar: .40, turbio: true, cremoso: true },
  // Refrescos
  "soda": { gas: true }, "tonica": { azucar: .08, gas: true, amargo: true },
  "ginger-beer": { azucar: .09, gas: true }, "ginger-ale": { azucar: .09, gas: true },
  "cola": { azucar: .105, gas: true }, "refresco-pomelo": { azucar: .09, gas: true },
  // Frescos y otros
  "espresso": { acido: .004, turbio: true, amargo: true }, "clara-huevo": { turbio: true },
  "nata": { azucar: .03, turbio: true, cremoso: true }, "angostura": { abv: .44, amargo: true }, "menta": {},
  "helado-vainilla": { azucar: .21, turbio: true, cremoso: true },
  "platano": { azucar: .12, acido: .003, turbio: true, cremoso: true },
};
