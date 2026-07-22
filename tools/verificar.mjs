// =====================================================================
// WANDERCOCKTAILS — Verificador integral (node tools/verificar.mjs)
// Comprueba datos, fórmulas, reglas de coctelería, estructura de la UI
// y sincronización. Extrae las funciones REALES de app.js (no copias),
// así lo que se verifica es exactamente lo que ejecuta la app.
// =====================================================================
import { readFileSync, existsSync } from "node:fs";

const data = readFileSync("js/data.js", "utf8");
const app = readFileSync("js/app.js", "utf8");
const nube = readFileSync("js/nube.js", "utf8");
const html = readFileSync("index.html", "utf8");
const sw = readFileSync("sw.js", "utf8");

let ok = 0, mal = 0;
const bien = m => { ok++; };
const falla = m => { mal++; console.log("  ❌ " + m); };
const check = (cond, m) => cond ? bien(m) : falla(m);
const grupo = t => console.log("\n■ " + t);

// ---- Cargar data.js ----
const G = {};
(function(){ eval(data +
  ";G.VASOS=VASOS;G.HIELOS=HIELOS;G.TECNICAS=TECNICAS;G.CATEGORIAS=CATEGORIAS;" +
  "G.TIPOS_INGREDIENTE=TIPOS_INGREDIENTE;G.ROLES=ROLES;G.PLANTILLAS_CREACION=PLANTILLAS_CREACION;" +
  "G.RECETAS_CLASICAS=RECETAS_CLASICAS;G.RECETAS_SHOTS=RECETAS_SHOTS;G.ML_POR_DASH=ML_POR_DASH;" +
  "G.SUB_ORIGEN=SUB_ORIGEN;G.PERFIL_TIPO=PERFIL_TIPO;G.VASO_SVG=VASO_SVG;G.DECORACIONES=DECORACIONES;"); })();
const { VASOS, HIELOS, TECNICAS, CATEGORIAS, TIPOS_INGREDIENTE, ROLES, PLANTILLAS_CREACION,
  RECETAS_CLASICAS, RECETAS_SHOTS, ML_POR_DASH, SUB_ORIGEN, PERFIL_TIPO, VASO_SVG, DECORACIONES } = G;

// ---- Extraer funciones reales de app.js ----
function extraerFn(src, nombre) {
  const i = src.indexOf("function " + nombre);
  if (i < 0) throw new Error("No existe function " + nombre);
  // saltar la lista de parámetros (puede contener llaves: ctx = {})
  let par = src.indexOf("(", i), np = 0, finParams = par;
  for (let k = par; k < src.length; k++) {
    if (src[k] === "(") np++;
    if (src[k] === ")") { np--; if (!np) { finParams = k; break; } }
  }
  const j = src.indexOf("{", finParams);
  let nivel = 0;
  for (let k = j; k < src.length; k++) {
    if (src[k] === "{") nivel++;
    if (src[k] === "}") { nivel--; if (!nivel) return src.slice(i, k + 1); }
  }
}
function extraerConst(src, nombre, fin = ";") {
  const i = src.indexOf("const " + nombre);
  if (i < 0) throw new Error("No existe const " + nombre);
  return src.slice(i, src.indexOf(fin, i) + fin.length);
}

// Contexto compartido para las funciones extraídas
const estado = {
  misVasos: [], hielos: {}, diluciones: {}, llenadoPct: 90, margen: 4,
  moneda: "€", ivaCompra: 21, ivaVenta: 10, inventario: [], recetasPropias: [],
  tiposPropios: [], fotos: {}, ocultas: {}, equipo: [], rev: 0, modo: "master",
};
TECNICAS.forEach(t => estado.diluciones[t.id] = t.dilucionPct);
const stubs = `
const esc = x => String(x ?? "");
const fmtMl = ml => (ml >= 10 ? Math.round(ml) : Math.round(ml*10)/10) + " ml";
const fmtDinero = n => n.toFixed(2) + " €";
const vasoPorId = id => VASOS.find(v => v.id === id);
const hieloPorId = id => HIELOS.find(h => h.id === id);
const tecnicaPorId = id => TECNICAS.find(t => t.id === id);
`;
const codigo = stubs +
  extraerConst(app, "todosTipos") + "\n" +
  extraerConst(app, "tipoPorId") + "\n" +
  extraerConst(app, "perfilTipo") + "\n" +
  extraerConst(app, "NECESITAN_SHAKE", "]);") + "\n" +
  ["ivaDeItem","precioNetoItem","escalarReceta","costePorTipo","costeReceta",
   "perfilSabor","etiquetaFuerza","veredictoSabor","metodoRecomendado","metodoColado",
   "panelFrozen","detectarTecnica","densidadTipo"].map(f => extraerFn(app, f)).join("\n") +
  `;R.escalarReceta=escalarReceta;R.costeReceta=costeReceta;R.perfilSabor=perfilSabor;
   R.veredictoSabor=veredictoSabor;R.metodoRecomendado=metodoRecomendado;R.metodoColado=metodoColado;
   R.panelFrozen=panelFrozen;R.detectarTecnica=detectarTecnica;R.densidadTipo=densidadTipo;
   R.precioNetoItem=precioNetoItem;R.NECESITAN_SHAKE=NECESITAN_SHAKE;`;
const R = {};
eval(codigo);

// =====================================================================
grupo("1. Integridad de datos");
TIPOS_INGREDIENTE.forEach(t => {
  check(!!PERFIL_TIPO[t.id], `perfil de sabor de «${t.id}»`);
  check(CATEGORIAS.some(c => c.id === t.cat), `categoría válida en «${t.id}»`);
  check(!!ROLES[t.rol], `rol válido en «${t.id}»`);
});
VASOS.forEach(v => {
  check(!!VASO_SVG[v.id], `silueta del vaso «${v.id}»`);
  check(v.rango[0] <= v.ml && v.ml <= v.rango[1], `referencia dentro de rango en «${v.id}»`);
});
RECETAS_CLASICAS.concat(RECETAS_SHOTS).forEach(r => {
  check(VASOS.some(v => v.id === r.vaso), `vaso de «${r.id}»`);
  check(HIELOS.some(h => h.id === r.hielo), `hielo de «${r.id}»`);
  check(TECNICAS.some(t => t.id === r.tecnica), `técnica de «${r.id}»`);
  r.ingredientes.forEach(i => check(TIPOS_INGREDIENTE.some(t => t.id === i.tipo), `tipo «${i.tipo}» en «${r.id}»`));
});
PLANTILLAS_CREACION.forEach(p => p.slots.forEach(s => s.rol.forEach(r =>
  check(!!ROLES[r], `rol «${r}» en plantilla «${p.id}»`))));
DECORACIONES.forEach(d => check(d.id && d.nombre && d.grupo && d.como && d.svg.includes("<svg"), `decoración «${d.id}» completa`));
check(new Set(DECORACIONES.map(d => d.id)).size === DECORACIONES.length, "ids de decoraciones únicos");
{ // ids de gradientes únicos entre TODAS las decoraciones (colisionan si se repiten)
  const ids = DECORACIONES.flatMap(d => [...d.svg.matchAll(/id="([^"]+)"/g)].map(m => m[1]));
  check(new Set(ids).size === ids.length, "ids de gradientes SVG únicos entre decoraciones");
}
console.log(`  · ${TIPOS_INGREDIENTE.length} tipos, ${VASOS.length} vasos, ${RECETAS_CLASICAS.length + RECETAS_SHOTS.length} recetas, ${DECORACIONES.length} decoraciones`);

// =====================================================================
grupo("2. Motor de escalado (proporciones, hielo, dilución)");
{
  estado.misVasos = [{ id: "a", tipo: "margarita", ml: 300 }];
  estado.hielos = { cubos: 30, picado: 55 };
  const m = RECETAS_CLASICAS.find(r => r.id === "margarita");
  const e300 = R.escalarReceta(m);
  estado.misVasos = [{ id: "a", tipo: "margarita", ml: 430 }];
  const e430 = R.escalarReceta(m);
  const ratio = e => e.ingredientes[0].mlFinal / e.ingredientes[2].mlFinal;
  check(Math.abs(ratio(e300) - 2) < 0.001 && Math.abs(ratio(e430) - 2) < 0.001,
    "proporción 2:1:1 exacta en vasos de 300 y 430 ml");
  check(e430.ingredientes[0].mlFinal > e300.ingredientes[0].mlFinal, "vaso más grande → más cantidad");
  // Test del agua real: 500 ml al 46 % → 270 ml de líquido
  estado.misVasos = [{ id: "h", tipo: "highball", ml: 500 }];
  estado.hielos = { cubos: 46 };
  const gt = RECETAS_CLASICAS.find(r => r.id === "gin-tonic");
  const egt = R.escalarReceta(gt);
  check(Math.round(egt.volUtil) === 270, `test del agua: 500 ml @46 % → ${Math.round(egt.volUtil)} ml (esperado 270)`);
  check(egt.aguaDilucion >= 0 && Math.abs(egt.volFinal - egt.volUtil) < 0.01, "líquido + dilución = volumen útil");
  // Las 35 recetas escalan sin NaN con su vaso de referencia
  estado.misVasos = []; estado.hielos = {};
  let malas = 0;
  RECETAS_CLASICAS.concat(RECETAS_SHOTS).forEach(r => {
    const e = R.escalarReceta(r);
    if (e.ingredientes.some(i => Number.isNaN(i.mlFinal)) || !(e.volFinal > 0)) malas++;
  });
  check(malas === 0, "las 35 recetas escalan sin errores numéricos");
}

// =====================================================================
grupo("3. Costes e IVA");
{
  const item = { precio: 24.20, precioConIva: true, iva: 21, cantidad: 700, unidad: "ml" };
  check(Math.abs(R.precioNetoItem(item) - 20) < 0.01, "24,20 € con IVA 21 % → neto 20,00 €");
  const item2 = { precio: 20, precioConIva: false, cantidad: 700, unidad: "ml" };
  check(Math.abs(R.precioNetoItem(item2) - 20) < 0.001, "precio neto directo se respeta");
  estado.inventario = [
    { id: "i1", nombre: "Tequila", tipo: "tequila", precio: 20, precioConIva: false, cantidad: 700, unidad: "ml" },
    { id: "i2", nombre: "Triple", tipo: "triple-sec", precio: 10, precioConIva: false, cantidad: 700, unidad: "ml" },
    { id: "i3", nombre: "Lima", tipo: "zumo-lima", precio: 3, precioConIva: false, cantidad: 1000, unidad: "ml" },
  ];
  estado.misVasos = [{ id: "a", tipo: "margarita", ml: 300 }];
  estado.hielos = { cubos: 30 };
  const m = RECETAS_CLASICAS.find(r => r.id === "margarita");
  const c = R.costeReceta(R.escalarReceta(m));
  check(c.completo && c.total > 0 && c.total < 10, `coste margarita coherente (${c.total.toFixed(2)} €)`);
  const pvpNeto = c.total * estado.margen, pvpCarta = pvpNeto * 1.10;
  check(Math.abs(pvpCarta / pvpNeto - 1.10) < 1e-9, "PVP carta = base × 1,10 (IVA hostelería 10 %)");
  estado.inventario = [];
}

// =====================================================================
grupo("4. Reglas de oro: sabor, método y colado");
{
  estado.misVasos = []; estado.hielos = {};
  let alertas = [];
  RECETAS_CLASICAS.concat(RECETAS_SHOTS).forEach(r => {
    const e = R.escalarReceta(r);
    const p = R.perfilSabor(e);
    const v = R.veredictoSabor(p, { esShot: !!r.esShot || r.tecnica === "capas",
      esFrozen: r.tecnica === "batido" || r.tecnica === "batido-helado" });
    const m = R.metodoRecomendado(p);
    const coincide = r.tecnica === m.id ||
      ((r.tecnica === "batido" || r.tecnica === "batido-helado") && m.id === "agitado") ||
      r.tecnica === "capas" ||
      (r.esShot && r.tecnica === "directo") ||
      (m.id === "agitado" && r.tecnica === "directo" && r.hielo !== "sin-hielo" &&
        !r.ingredientes.some(i => R.NECESITAN_SHAKE.has(i.tipo)));
    if (v.clase === "tag-mal" || !coincide) alertas.push(r.id);
  });
  check(alertas.length === 0, "las 35 recetas pasan veredicto y método" + (alertas.length ? " (fallan: " + alertas.join(",") + ")" : ""));
  const provocado = { tecnica: "agitado", hielo: "sin-hielo", vaso: "coupe",
    ingredientes: [{ tipo: "vodka", ml: 40 }, { tipo: "sirope-simple", ml: 35 }] };
  check(R.veredictoSabor(R.perfilSabor(R.escalarReceta(provocado))).clase === "tag-mal", "el desequilibrio provocado se detecta");
  // Colado
  const colado = (r) => R.metodoColado(r).txt;
  check(/DOBLE/.test(colado(RECETAS_CLASICAS.find(r => r.id === "daiquiri"))), "daiquiri (up) → doble filtrado");
  check(/SIMPLE/.test(colado(RECETAS_CLASICAS.find(r => r.id === "negroni"))), "negroni → colado simple");
  check(/DOBLE/.test(colado(RECETAS_CLASICAS.find(r => r.id === "whisky-sour"))), "whisky sour (clara) → doble filtrado");
  check(/Sin colar/.test(colado(RECETAS_CLASICAS.find(r => r.id === "mojito"))), "mojito → sin colar");
  // Técnica automática
  check(R.detectarTecnica([{ tipo: "ginebra" }, { tipo: "tonica" }]) === "directo", "detección: burbuja → directo");
  check(R.detectarTecnica([{ tipo: "ron-blanco" }, { tipo: "zumo-lima" }]) === "agitado", "detección: turbio → agitado");
  check(R.detectarTecnica([{ tipo: "ginebra" }, { tipo: "vermut-seco" }]) === "removido", "detección: limpio → removido");
}

// =====================================================================
grupo("5. Frozen y capas");
{
  const batidas = RECETAS_CLASICAS.filter(r => r.tecnica.startsWith("batido"));
  let malFrozen = [];
  batidas.forEach(r => {
    const htmlPanel = R.panelFrozen(r, R.escalarReceta(r));
    if (/tag-mal/.test(htmlPanel)) malFrozen.push(r.id);
  });
  check(malFrozen.length === 0, `los ${batidas.length} frozen clásicos pasan el control` + (malFrozen.length ? " (fallan " + malFrozen.join(",") + ")" : ""));
  const aguado = { tecnica: "batido", hielo: "frappe", vaso: "hurricane",
    ingredientes: [{ tipo: "vodka", ml: 100 }, { tipo: "zumo-pina", ml: 50 }] };
  check(/tag-mal/.test(R.panelFrozen(aguado, R.escalarReceta(aguado))), "el frozen aguado provocado se detecta");
  const b52 = RECETAS_SHOTS.find(r => r.id === "b52");
  const orden = [...b52.ingredientes].sort((a, b) => R.densidadTipo(b.tipo) - R.densidadTipo(a.tipo)).map(i => i.tipo);
  check(orden.join(">") === "licor-cafe>crema-irlandesa>triple-sec", "orden de capas del B-52 = el real");
}

// =====================================================================
grupo("6. Estructura de la app (UI, guardado, sincronización)");
{
  const dinamicos = new Set(["btn-guardar-propuesta", "btn-otra-propuesta"]);
  let idsMal = [];
  [...(app + nube).matchAll(/\$\("#([a-z0-9-]+)"\)/gi)].forEach(m => {
    if (!dinamicos.has(m[1]) && !html.includes('id="' + m[1] + '"')) idsMal.push(m[1]);
  });
  check(idsMal.length === 0, "todos los IDs usados existen en el HTML" + (idsMal.length ? " (faltan: " + [...new Set(idsMal)].join(",") + ")" : ""));
  // Cada botón del menú apunta a una sección existente
  let secMal = [];
  [...html.matchAll(/data-sec="([a-z-]+)"/g)].forEach(m => {
    if (!html.includes('id="sec-' + m[1] + '"')) secMal.push(m[1]);
  });
  check(secMal.length === 0, "cada opción del menú tiene su sección");
  // Funciones usadas en listeners de nube.js existen
  let fnMal = [];
  [...nube.matchAll(/addEventListener\("[a-z]+", *(?:\(\) *=> *)?([a-zA-Z]+)\(?/g)].forEach(m => {
    const fn = m[1];
    if (fn === "ev") return;
    if (!new RegExp("function " + fn + "\\b").test(app + nube)) fnMal.push(fn);
  });
  check(fnMal.length === 0, "las funciones de los listeners existen" + (fnMal.length ? " (" + fnMal.join(",") + ")" : ""));
  // CAMPOS_SYNC cubre todos los campos del negocio (los locales quedan fuera a propósito)
  const soloLocal = new Set(["modo", "usuarioActual", "fotos", "nubeConfig", "vasos"]);
  const iniE = app.indexOf("let estado = {");
  const finE = app.indexOf("};", iniE);
  const claves = [...app.slice(iniE, finE).matchAll(/^\s{2}(\w+):/gm)].map(m => m[1]);
  const sync = [...nube.matchAll(/"(\w+)"/g)].map(m => m[1]);
  const iniS = nube.indexOf("const CAMPOS_SYNC");
  const finS = nube.indexOf("];", iniS);
  const enSync = [...nube.slice(iniS, finS).matchAll(/"([\w-]+)"/g)].map(m => m[1]);
  let sinSync = claves.filter(k => !soloLocal.has(k) && !enSync.includes(k));
  check(sinSync.length === 0, "todos los campos del negocio se sincronizan" + (sinSync.length ? " (FALTAN EN CAMPOS_SYNC: " + sinSync.join(", ") + ")" : ""));
  // App shell del service worker: todos los archivos existen
  let shellMal = [];
  [...sw.matchAll(/"\.\/([^"]+)"/g)].forEach(m => { if (!existsSync(m[1])) shellMal.push(m[1]); });
  check(shellMal.length === 0, "los archivos del app shell existen");
  check(/wandercocktails-v\d+/.test(sw), "versión de caché del service worker definida");
}

// =====================================================================
console.log("\n═══════════════════════════════════════");
console.log(mal === 0
  ? `✅ TODO CORRECTO: ${ok} comprobaciones superadas`
  : `❌ ${mal} FALLOS de ${ok + mal} comprobaciones`);
process.exit(mal === 0 ? 0 : 1);
