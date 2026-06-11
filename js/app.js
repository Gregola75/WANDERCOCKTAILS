/* =========================================================
   WANDERCOCKTAILS — Lógica de la aplicación
   - Configuración de cristalería y hielo por establecimiento
   - Escalado automático de recetas al vaso/hielo configurado
   - Inventario con coste por ml y coste de producción
   - Motor de "¿qué puedo crear?" según inventario
   ========================================================= */

const CLAVE_STORAGE = "wandercocktails-v1";

// ---------- Estado del establecimiento ----------
let estado = {
  nombreNegocio: "",
  vasos: {},            // { vasoId: mlAjustado } -> solo los vasos que usa el negocio
  hielos: {},           // { hieloId: despPct ajustado } -> hielos disponibles
  diluciones: {},       // { tecnicaId: pct } -> ajuste fino por técnica
  llenadoPct: 90,       // % del vaso que se llena (espacio libre para decorar/transportar)
  margen: 4,            // multiplicador sobre coste para precio sugerido
  moneda: "€",
  inventario: [],       // [{id, nombre, tipo, precio, cantidad, unidad: "ml"|"ud"}]
  recetasPropias: [],   // recetas creadas por el negocio (mismo formato que las clásicas)
  ofertas: [],          // [{id, nombre, recetaId, recetaId2, tipo: "2x1"|"descuento"|"precio"|"combo", valor}]
  pinMaster: "",        // PIN del máster: protege la vuelta desde el modo barra
  modo: "master",       // "master" (dueño: edita todo) | "barra" (bartender: solo guía)
};

function cargarEstado() {
  try {
    const raw = localStorage.getItem(CLAVE_STORAGE);
    if (raw) estado = Object.assign(estado, JSON.parse(raw));
  } catch (e) { /* estado por defecto */ }
  // valores por defecto para diluciones/hielos no guardados
  TECNICAS.forEach(t => { if (estado.diluciones[t.id] == null) estado.diluciones[t.id] = t.dilucionPct; });
}

function guardarEstado() {
  localStorage.setItem(CLAVE_STORAGE, JSON.stringify(estado));
}

// ---------- Utilidades ----------
const $ = sel => document.querySelector(sel);
const $$ = sel => Array.from(document.querySelectorAll(sel));
const vasoPorId = id => VASOS.find(v => v.id === id);
const hieloPorId = id => HIELOS.find(h => h.id === id);
const tecnicaPorId = id => TECNICAS.find(t => t.id === id);
const tipoPorId = id => TIPOS_INGREDIENTE.find(t => t.id === id);
const esc = s => String(s ?? "").replace(/[&<>"']/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));

function fmtMl(ml) {
  if (ml >= 10) return Math.round(ml) + " ml";
  return (Math.round(ml * 10) / 10) + " ml";
}
function fmtDinero(n) {
  return n.toFixed(2).replace(".", ",") + " " + estado.moneda;
}
function todasRecetas() {
  return RECETAS_CLASICAS.concat(RECETAS_SHOTS, estado.recetasPropias);
}
const esModoBarra = () => estado.modo === "barra";
function recetaPorId(id) {
  return todasRecetas().find(r => r.id === id);
}

// Densidad aproximada de un ingrediente (para el orden de capas):
// el azúcar la sube, el alcohol la baja. Más denso = se vierte primero.
function densidadTipo(tipoId) {
  const p = PERFIL_TIPO[tipoId] || {};
  return 1 + (p.azucar || 0) * 0.4 - (p.abv || 0) * 0.21;
}

// ---------- Motor de escalado ----------
// Calcula la receta ajustada a la cristalería y hielo del establecimiento.
// Mantiene las proporciones de la receta de referencia y rellena el volumen útil:
//   volumen útil = capacidad real del vaso × % llenado − desplazamiento del hielo
//   ingredientes + agua de dilución (según técnica) = volumen útil
function escalarReceta(receta) {
  const refVaso = vasoPorId(receta.vaso);
  const avisos = [];

  // Vaso real del negocio: el de la receta si lo tiene seleccionado,
  // si no, el vaso seleccionado con capacidad más parecida.
  let vasoUsado = receta.vaso;
  let capacidad = estado.vasos[receta.vaso];
  if (capacidad == null) {
    const seleccionados = Object.keys(estado.vasos);
    if (seleccionados.length) {
      vasoUsado = seleccionados.reduce((mejor, id) =>
        Math.abs(estado.vasos[id] - refVaso.ml) < Math.abs(estado.vasos[mejor] - refVaso.ml) ? id : mejor
      );
      capacidad = estado.vasos[vasoUsado];
      avisos.push(`No tienes ${refVaso.nombre} en tu barra: se usa ${vasoPorId(vasoUsado).nombre} (${capacidad} ml), el más parecido.`);
    } else {
      capacidad = refVaso.ml;
      avisos.push("Aún no has seleccionado vasos en «Mi barra»: se usan las medidas de referencia.");
    }
  }

  // Hielo real: el de la receta si está disponible; si no, el primero disponible (o sin hielo).
  let hieloUsado = receta.hielo;
  let despPct = estado.hielos[receta.hielo];
  if (despPct == null) {
    if (receta.hielo === "sin-hielo") {
      despPct = 0;
    } else {
      const disponibles = Object.keys(estado.hielos).filter(h => h !== "sin-hielo");
      if (disponibles.length) {
        hieloUsado = disponibles.reduce((mejor, id) =>
          Math.abs(estado.hielos[id] - hieloPorId(receta.hielo).despPct) < Math.abs(estado.hielos[mejor] - hieloPorId(receta.hielo).despPct) ? id : mejor
        );
        despPct = estado.hielos[hieloUsado];
        avisos.push(`Sin ${hieloPorId(receta.hielo).nombre.toLowerCase()}: se usa ${hieloPorId(hieloUsado).nombre.toLowerCase()}.`);
      } else {
        despPct = hieloPorId(receta.hielo).despPct;
        avisos.push("Configura tus hielos en «Mi barra» para afinar las medidas.");
      }
    }
  }

  const dilucionPct = estado.diluciones[receta.tecnica] ?? tecnicaPorId(receta.tecnica).dilucionPct;
  const volUtil = capacidad * (estado.llenadoPct / 100) - capacidad * (despPct / 100);
  const hieloMl = capacidad * (despPct / 100);

  // Volumen de la receta de referencia (solo líquidos medibles)
  const liquidosRef = receta.ingredientes.reduce((s, i) =>
    s + (i.ml || 0) + (i.dash ? i.dash * ML_POR_DASH : 0), 0);
  const factor = volUtil / (liquidosRef * (1 + dilucionPct / 100));

  const ingredientes = receta.ingredientes.map(i => {
    const t = tipoPorId(i.tipo);
    if (i.ml != null) return { ...i, nombreTipo: t.nombre, mlFinal: i.ml * factor, texto: fmtMl(i.ml * factor) };
    if (i.dash != null) {
      const dashes = Math.max(1, Math.round(i.dash * factor));
      return { ...i, nombreTipo: t.nombre, mlFinal: dashes * ML_POR_DASH, texto: dashes + (dashes === 1 ? " dash" : " dashes") };
    }
    const uds = Math.max(1, Math.round((i.ud || 1) * factor));
    return { ...i, nombreTipo: t.nombre, mlFinal: 0, uds, texto: uds + " ud" };
  });

  return {
    receta, ingredientes, avisos, factor,
    vasoUsado, capacidad, hieloUsado, despPct, hieloMl,
    dilucionPct, volUtil,
    volFinal: volUtil, // ingredientes + dilución = volumen útil por diseño
  };
}

// ---------- Costes ----------
// Coste por ml de cada tipo de ingrediente según inventario (el más barato si hay varios).
function costePorTipo() {
  const mapa = {};
  estado.inventario.forEach(item => {
    if (!item.precio || !item.cantidad) return;
    const cu = item.precio / item.cantidad; // €/ml o €/ud
    if (mapa[item.tipo] == null || cu < mapa[item.tipo].cu) {
      mapa[item.tipo] = { cu, unidad: item.unidad, nombre: item.nombre };
    }
  });
  return mapa;
}

function costeReceta(escalada) {
  const costes = costePorTipo();
  let total = 0;
  const faltantes = [];
  escalada.ingredientes.forEach(i => {
    // Si la receta fija una marca concreta del inventario, se usa su precio;
    // si no, el producto más económico de ese tipo.
    let c = costes[i.tipo];
    if (i.marca) {
      const item = estado.inventario.find(x => x.id === i.marca);
      if (item && item.precio && item.cantidad) {
        c = { cu: item.precio / item.cantidad, unidad: item.unidad, nombre: item.nombre };
      }
    }
    if (!c) { faltantes.push(i.nombreTipo); return; }
    if (i.uds != null && c.unidad === "ud") total += i.uds * c.cu;
    else if (i.uds != null) faltantes.push(i.nombreTipo);
    else total += i.mlFinal * c.cu;
  });
  return { total, faltantes, completo: faltantes.length === 0 };
}

// ---------- Disponibilidad según inventario ----------
function tiposEnInventario() {
  return new Set(estado.inventario.map(i => i.tipo));
}

function analizarDisponibilidad(receta) {
  const disponibles = tiposEnInventario();
  const faltan = [];
  receta.ingredientes.forEach(i => {
    if (!disponibles.has(i.tipo)) faltan.push(tipoPorId(i.tipo).nombre);
  });
  return { posibles: faltan.length === 0, faltan };
}

// =========================================================
//  RENDERIZADO
// =========================================================

// Subsecciones activas (acordeón del menú lateral)
let subBarra = "vasos";      // "vasos" | "hielos"
let subRecetas = "clasicas"; // "clasicas" | "propias" | "shots"

function cambiarSeccion(id, sub) {
  if (esModoBarra()) id = "recetas"; // en modo barra solo existe la guía de recetas
  if (id === "barra" && sub) subBarra = sub;
  if (id === "recetas" && sub) subRecetas = sub;

  // Estado activo y grupo abierto en el menú lateral
  $$("#menu-lateral [data-sec]").forEach(b => {
    const subEsperado = id === "barra" ? subBarra : id === "recetas" ? subRecetas : null;
    const activo = b.dataset.sec === id && (!b.dataset.sub || b.dataset.sub === subEsperado);
    b.classList.toggle("activo", activo);
  });
  $$("#menu-lateral .menu-grupo").forEach(g => {
    if (g.querySelector(`[data-sec="${id}"]`)) g.classList.add("abierto");
  });

  $$(".seccion").forEach(s => s.classList.toggle("activa", s.id === "sec-" + id));
  if (id === "barra") renderBarra();
  if (id === "inventario") renderInventario();
  if (id === "recetas") renderRecetas();
  if (id === "crear") renderCrear();
  if (id === "inventar") renderInventar();
  if (id === "descubrir") renderDescubrir();
  if (id === "ofertas") renderOfertas();
  if (id === "ajustes") renderAjustes();
  cerrarMenu();
  window.scrollTo({ top: 0 });
}

function abrirMenu() {
  $("#menu-lateral").classList.add("abierto");
  $("#menu-overlay").classList.add("visible");
}
function cerrarMenu() {
  $("#menu-lateral").classList.remove("abierto");
  $("#menu-overlay").classList.remove("visible");
}

// Opciones <select> de tipos agrupadas por categoría · subcategoría
// (con el origen del destilado entre paréntesis, para formar al personal)
function opcionesTiposHtml(soloCat) {
  const tipos = TIPOS_INGREDIENTE.filter(t => !soloCat || t.cat === soloCat);
  let grupo = "", html = "";
  tipos.forEach(t => {
    const origen = SUB_ORIGEN[t.sub] ? ` — ${SUB_ORIGEN[t.sub]}` : "";
    const g = t.cat + " · " + t.sub + origen;
    if (g !== grupo) {
      if (grupo) html += "</optgroup>";
      html += `<optgroup label="${esc(g)}">`;
      grupo = g;
    }
    html += `<option value="${t.id}">${esc(t.nombre)}</option>`;
  });
  return html + (grupo ? "</optgroup>" : "");
}

// ---------- Mi barra (vasos + hielos) ----------
function renderBarra() {
  $("#bloque-vasos").style.display = subBarra === "vasos" ? "" : "none";
  $("#bloque-hielos").style.display = subBarra === "hielos" ? "" : "none";
  const contV = $("#lista-vasos");
  contV.innerHTML = VASOS.map(v => {
    const sel = estado.vasos[v.id] != null;
    const ml = sel ? estado.vasos[v.id] : v.ml;
    return `
      <div class="card ${sel ? "sel" : ""}">
        <label class="check">
          <input type="checkbox" data-vaso="${v.id}" ${sel ? "checked" : ""}>
          <h4>${esc(v.nombre)}</h4>
        </label>
        <p class="desc">${esc(v.desc)}</p>
        <div class="fila">
          <label>Capacidad real:</label>
          <input type="number" min="10" max="2000" step="5" value="${ml}" data-vaso-ml="${v.id}" ${sel ? "" : "disabled"}>
          <span>ml</span>
        </div>
        <p class="rango">Rango habitual verificado: ${v.rango[0]}–${v.rango[1]} ml (referencia ${v.ml} ml)</p>
        <p class="rango aviso-rango" data-aviso-vaso="${v.id}"></p>
      </div>`;
  }).join("");

  contV.querySelectorAll("input[data-vaso]").forEach(chk => {
    chk.addEventListener("change", () => {
      const id = chk.dataset.vaso;
      if (chk.checked) estado.vasos[id] = vasoPorId(id).ml;
      else delete estado.vasos[id];
      guardarEstado(); renderBarra();
    });
  });
  contV.querySelectorAll("input[data-vaso-ml]").forEach(inp => {
    inp.addEventListener("change", () => {
      const id = inp.dataset.vasoMl;
      const v = vasoPorId(id);
      const ml = parseFloat(inp.value);
      if (!ml || ml <= 0) { inp.value = estado.vasos[id]; return; }
      estado.vasos[id] = ml;
      const aviso = contV.querySelector(`[data-aviso-vaso="${id}"]`);
      if (ml < v.rango[0] || ml > v.rango[1]) {
        inp.classList.add("fuera-rango");
        aviso.innerHTML = `<span class="mal">⚠ ${ml} ml está fuera del rango habitual de este vaso. Verifica la medida (llénalo de agua y mídelo).</span>`;
      } else {
        inp.classList.remove("fuera-rango");
        aviso.textContent = "";
      }
      guardarEstado();
    });
  });

  const contH = $("#lista-hielos");
  contH.innerHTML = HIELOS.filter(h => h.id !== "sin-hielo").map(h => {
    const sel = estado.hielos[h.id] != null;
    const pct = sel ? estado.hielos[h.id] : h.despPct;
    return `
      <div class="card ${sel ? "sel" : ""}">
        <label class="check">
          <input type="checkbox" data-hielo="${h.id}" ${sel ? "checked" : ""}>
          <h4>${esc(h.nombre)}</h4>
        </label>
        <p class="desc">${esc(h.desc)}</p>
        <div class="fila">
          <label>Desplazamiento en tu negocio:</label>
          <input type="number" min="0" max="80" step="1" value="${pct}" data-hielo-pct="${h.id}" ${sel ? "" : "disabled"}>
          <span>% del vaso</span>
        </div>
        <p class="rango">Ajústalo a tu hielo real: llena un vaso con tu hielo, añade agua hasta arriba y mide cuánta agua entra.</p>
      </div>`;
  }).join("");

  contH.querySelectorAll("input[data-hielo]").forEach(chk => {
    chk.addEventListener("change", () => {
      const id = chk.dataset.hielo;
      if (chk.checked) estado.hielos[id] = hieloPorId(id).despPct;
      else delete estado.hielos[id];
      guardarEstado(); renderBarra();
    });
  });
  contH.querySelectorAll("input[data-hielo-pct]").forEach(inp => {
    inp.addEventListener("change", () => {
      const pct = parseFloat(inp.value);
      if (isNaN(pct) || pct < 0 || pct > 80) { inp.value = estado.hielos[inp.dataset.hieloPct]; return; }
      estado.hielos[inp.dataset.hieloPct] = pct;
      guardarEstado();
    });
  });

  const nVasos = Object.keys(estado.vasos).length;
  const nHielos = Object.keys(estado.hielos).length;
  $("#resumen-barra").innerHTML = `
    <div class="kpi"><b>${nVasos}</b> vasos seleccionados</div>
    <div class="kpi"><b>${nHielos}</b> tipos de hielo</div>
    <div class="kpi"><b>${estado.llenadoPct} %</b> de llenado del vaso</div>`;
}

// ---------- Inventario ----------
let filtroCatInv = "todas"; // chip de categoría activo en la vista de inventario

function renderInventario() {
  // Selector de tipo del formulario: la categoría elegida en el desplegable
  // de categoría acota los tipos disponibles.
  const selCat = $("#inv-cat");
  if (!selCat.options.length) {
    selCat.innerHTML = `<option value="">Todas las categorías</option>` +
      CATEGORIAS.map(c => `<option value="${c.id}">${c.emoji} ${esc(c.id)}</option>`).join("");
    selCat.addEventListener("change", () => {
      $("#inv-tipo").innerHTML = opcionesTiposHtml(selCat.value || null);
    });
  }
  if (!$("#inv-tipo").options.length) $("#inv-tipo").innerHTML = opcionesTiposHtml(null);

  // Chips de filtrado de la lista
  const conteo = {};
  estado.inventario.forEach(i => {
    const t = tipoPorId(i.tipo);
    if (t) conteo[t.cat] = (conteo[t.cat] || 0) + 1;
  });
  $("#inv-chips").innerHTML =
    `<button class="chip ${filtroCatInv === "todas" ? "activo" : ""}" data-chip="todas">Todas (${estado.inventario.length})</button>` +
    CATEGORIAS.map(c =>
      `<button class="chip ${filtroCatInv === c.id ? "activo" : ""}" data-chip="${c.id}">${c.emoji} ${esc(c.id)} (${conteo[c.id] || 0})</button>`
    ).join("");
  $$("#inv-chips .chip").forEach(ch => ch.addEventListener("click", () => {
    filtroCatInv = ch.dataset.chip;
    renderInventario();
  }));

  // Lista agrupada por categoría → subcategoría
  const cont = $("#inv-lista");
  if (!estado.inventario.length) {
    cont.innerHTML = `<p class="vacio">Añade tus botellas, siropes, zumos y concentrados con su precio para calcular costes.</p>`;
  } else {
    cont.innerHTML = CATEGORIAS.filter(c => filtroCatInv === "todas" || filtroCatInv === c.id).map(c => {
      const items = estado.inventario.filter(i => tipoPorId(i.tipo)?.cat === c.id);
      if (!items.length) return "";
      const valor = items.reduce((s, i) => s + (i.precio || 0), 0);
      const filas = items.map(item => {
        const t = tipoPorId(item.tipo);
        const cu = item.precio && item.cantidad ? item.precio / item.cantidad : 0;
        return `<tr>
          <td><b>${esc(item.nombre)}</b></td>
          <td><span class="tag" ${SUB_ORIGEN[t.sub] ? `title="Origen: ${esc(SUB_ORIGEN[t.sub])}"` : ""}>${esc(t.sub)}${SUB_ORIGEN[t.sub] ? ` · ${esc(SUB_ORIGEN[t.sub])}` : ""}</span> <span class="tag tag-oro">${esc(t.nombre)}</span></td>
          <td class="num">${fmtDinero(item.precio)}</td>
          <td class="num">${item.cantidad} ${item.unidad}</td>
          <td class="num">${(cu * (item.unidad === "ml" ? 100 : 1)).toFixed(2).replace(".", ",")} ${estado.moneda}${item.unidad === "ml" ? "/100ml" : "/ud"}</td>
          <td><button class="btn btn-peligro btn-mini" data-borrar-inv="${item.id}">Quitar</button></td>
        </tr>`;
      }).join("");
      return `
        <div class="cat-bloque">
          <div class="cat-cabecera">
            <span>${c.emoji} <b>${esc(c.id)}</b> · ${items.length} producto${items.length > 1 ? "s" : ""}</span>
            <span class="meta">${esc(c.desc)} · stock: ${fmtDinero(valor)}</span>
          </div>
          <table><tbody>${filas}</tbody></table>
        </div>`;
    }).join("") || `<p class="vacio">No hay productos en esta categoría.</p>`;
  }
  cont.querySelectorAll("[data-borrar-inv]").forEach(b => {
    b.addEventListener("click", () => {
      estado.inventario = estado.inventario.filter(i => i.id !== b.dataset.borrarInv);
      guardarEstado(); renderInventario();
    });
  });

  const tipos = tiposEnInventario();
  const posibles = todasRecetas().filter(r => analizarDisponibilidad(r).posibles).length;
  $("#resumen-inv").innerHTML = `
    <div class="kpi"><b>${estado.inventario.length}</b> productos en inventario</div>
    <div class="kpi"><b>${tipos.size}</b> tipos de ingrediente cubiertos</div>
    <div class="kpi"><b>${posibles}</b> recetas posibles ahora mismo</div>`;
}

function agregarInventario(ev) {
  ev.preventDefault();
  const nombre = $("#inv-nombre").value.trim();
  const tipo = $("#inv-tipo").value;
  const precio = parseFloat($("#inv-precio").value);
  const cantidad = parseFloat($("#inv-cantidad").value);
  const unidad = $("#inv-unidad").value;
  if (!nombre || !tipo || !(precio >= 0) || !(cantidad > 0)) return;
  estado.inventario.push({ id: "inv-" + Date.now(), nombre, tipo, precio, cantidad, unidad });
  guardarEstado();
  $("#form-inventario").reset();
  renderInventario();
}

// ---------- Indicador de sabor y método (reglas de oro) ----------
// Perfil del cóctel ya escalado y diluido: graduación, dulzor y acidez finales.
function perfilSabor(escalada) {
  let alcohol = 0, azucar = 0, acido = 0, gas = false, turbio = false, amargo = false, cremoso = false;
  escalada.ingredientes.forEach(i => {
    const p = PERFIL_TIPO[i.tipo] || {};
    const ml = i.mlFinal || 0;
    alcohol += ml * (p.abv || 0);
    azucar += ml * (p.azucar || 0);
    acido += ml * (p.acido || 0);
    if (p.gas) gas = true;
    if (p.turbio) turbio = true;
    if (p.amargo) amargo = true;
    if (p.cremoso) cremoso = true;
  });
  const vol = escalada.volFinal || 1;
  return {
    abv: alcohol / vol * 100,      // % alcohol en el vaso
    dulzor: azucar / vol * 100,    // g de azúcar por 100 ml
    acidez: acido / vol * 100,     // g de ácido por 100 ml
    gas, turbio, amargo, cremoso,
  };
}

function etiquetaFuerza(abv) {
  if (abv < 5) return "Sin apenas alcohol";
  if (abv < 9) return "Suave";
  if (abv < 15) return "Ligero";
  if (abv < 22) return "Clásico";
  if (abv < 30) return "Fuerte";
  return "Muy fuerte";
}

// Veredicto de equilibrio según la regla de oro: el dulce se compensa
// con ácido, amargor o burbuja; si nada lo compensa, avisa.
function veredictoSabor(p) {
  if (p.acidez >= 0.15) {
    const ratio = p.dulzor / p.acidez;
    if (ratio < 3.5) return { clase: "tag-mal", texto: "⚠ Ácido dominante: sube el dulce o baja el cítrico (busca la 2:1:1)" };
    if (ratio < 6) return { clase: "tag-ok", texto: "✓ Cítrico y fresco: ácido marcado (perfil margarita / daiquiri)" };
    if (ratio <= 13) return { clase: "tag-ok", texto: "✓ Equilibrado dulce-ácido (cumple la regla de oro)" };
  }
  // Sin ácido que compense (o con muy poco)
  if (p.dulzor < 1.5) return { clase: "tag-ok", texto: "✓ Seco y espirituoso (estilo martini / ancestral)" };
  if (p.amargo && p.dulzor <= 12) return { clase: "tag-ok", texto: "✓ Agridulce: el amargor compensa el dulzor (perfil aperitivo)" };
  if (p.cremoso && p.dulzor <= 18) return { clase: "tag-ok", texto: "✓ Cremoso y goloso (perfil tropical / postre)" };
  if (p.gas && p.dulzor <= 11) return { clase: "tag-ok", texto: "✓ Refrescante y dulce (perfil combinado)" };
  if (p.dulzor <= 6) return { clase: "tag-ok", texto: "✓ Semiseco: dulzor sutil sobre la base" };
  if (p.dulzor <= 11) return { clase: "tag", texto: "Perfil dulce y afrutado: un toque de cítrico lo equilibraría aún más" };
  return { clase: "tag-mal", texto: "⚠ Muy dulce y sin ácido ni amargor que lo compense" };
}

// Regla de oro del método: lo turbio se agita, lo transparente se remueve,
// la burbuja nunca se agita.
function metodoRecomendado(perfil) {
  if (perfil.gas) return {
    id: "directo",
    razon: perfil.turbio
      ? "lleva burbuja: agita el resto sin el gas y corónalo al final en el vaso"
      : "lleva burbuja: constrúyelo directo en el vaso, el gas nunca se agita",
  };
  if (perfil.turbio) return {
    id: "agitado",
    razon: "lleva zumo, puré, huevo o lácteo: lo turbio siempre se agita (12-15 s)",
  };
  return {
    id: "removido",
    razon: "solo alcoholes limpios: lo transparente se remueve, nunca se agita",
  };
}

function barraSabor(label, valor, max, clase, textoValor) {
  const pct = Math.max(2, Math.min(100, valor / max * 100));
  return `
    <div class="sabor-fila">
      <span class="sabor-label">${label}</span>
      <div class="sabor-track"><div class="sabor-fill ${clase}" style="width:${pct}%"></div></div>
      <span class="sabor-val">${textoValor}</span>
    </div>`;
}

// Estos ingredientes exigen agitado sí o sí (emulsionan o son densos)
const NECESITAN_SHAKE = new Set([
  "clara-huevo", "nata", "crema-coco", "miel", "orgeat", "espresso",
  "pure-fresa", "pure-maracuya", "pure-mango",
]);

function panelSabor(receta, escalada) {
  const p = perfilSabor(escalada);
  const v = veredictoSabor(p);
  const m = metodoRecomendado(p);
  // El batido (con o sin helado) es un agitado con frío dentro: vale si tocaba agitar
  const coincide = receta.tecnica === m.id ||
    ((receta.tecnica === "batido" || receta.tecnica === "batido-helado") && m.id === "agitado");
  // Excepción de barra: zumos construidos sobre hielo (macerados, combinados)
  // valen en directo si no llevan nada que exija emulsión.
  const construidoValido = !coincide && m.id === "agitado" && receta.tecnica === "directo" &&
    receta.hielo !== "sin-hielo" && !receta.ingredientes.some(i => NECESITAN_SHAKE.has(i.tipo));
  let metodoHtml;
  if (receta.tecnica === "capas") {
    metodoHtml = `<span class="tag tag-ok">✓ En capas: vierte despacio sobre el dorso de una cuchara, el más denso abajo</span>`;
  } else if (coincide) {
    metodoHtml = `<span class="tag tag-ok">✓ Método correcto: ${esc(tecnicaPorId(receta.tecnica).nombre)} — ${esc(m.razon)}</span>`;
  } else if (construidoValido) {
    metodoHtml = `<span class="tag tag-ok">✓ Construido sobre hielo vale (estilo macerado / combinado); un agitado rápido lo integraría aún más</span>`;
  } else {
    metodoHtml = `<span class="tag tag-mal">💡 Mejor ${esc(tecnicaPorId(m.id).nombre.toLowerCase())}: ${esc(m.razon)}</span>`;
  }
  return `
    <div class="sabor-panel">
      ${barraSabor("Fuerza", p.abv, 30, "f-fuerza", p.abv.toFixed(0) + "% · " + etiquetaFuerza(p.abv))}
      ${barraSabor("Dulzor", p.dulzor, 15, "f-dulzor", p.dulzor.toFixed(1) + " g/100ml")}
      ${barraSabor("Acidez", p.acidez, 1.5, "f-acidez", p.acidez.toFixed(2) + " g/100ml")}
      <div><span class="tag ${v.clase}">${v.texto}</span></div>
      <div>${metodoHtml}</div>
    </div>`;
}

// ---------- Control frozen (que no quede aguado) ----------
// Reglas físicas del frozen: el alcohol no congela (máx. ~24 % del líquido),
// el frío apaga el dulzor (objetivo 10-14 g/100ml) y sin cuerpo queda granizado.
function panelFrozen(receta, escalada) {
  if (receta.tecnica !== "batido" && receta.tecnica !== "batido-helado") return "";
  let liquido = 0, alcohol = 0, cuerpo = 0;
  escalada.ingredientes.forEach(i => {
    const p = PERFIL_TIPO[i.tipo] || {};
    const ml = i.mlFinal || 0;
    liquido += ml;
    alcohol += ml * (p.abv || 0);
    if (p.cremoso || tipoPorId(i.tipo)?.rol === "pure") cuerpo += ml;
  });
  if (!liquido) return "";
  const abvLiq = alcohol / liquido * 100;
  const cuerpoPct = cuerpo / liquido * 100;
  const p = perfilSabor(escalada);
  const avisos = [];
  if (abvLiq > 24) avisos.push(`<span class="tag tag-mal">⚠ ${abvLiq.toFixed(0)} % de alcohol en el líquido: el alcohol no congela y quedará aguado — baja el destilado o sube fruta/helado (ideal ≤ 20-24 %)</span>`);
  if (p.dulzor < 8) avisos.push(`<span class="tag tag-mal">⚠ Poco dulce (${p.dulzor.toFixed(1)} g/100ml): el frío apaga el sabor — en frozen sube el dulzor un 25 % (objetivo 10-14)</span>`);
  if (cuerpoPct < 15) avisos.push(`<span class="tag">💡 Apenas hay cuerpo (puré/crema/helado/plátano): saldrá tipo granizado; añade fruta con cuerpo para textura cremosa</span>`);
  if (!avisos.length) avisos.push(`<span class="tag tag-ok">✓ Frozen estable: alcohol ${abvLiq.toFixed(0)} %, dulzor y cuerpo correctos — no se aguará</span>`);
  const hieloTxt = receta.tecnica === "batido"
    ? `🧊 Hielo para batir: ~${Math.round(liquido * 1.7)} g (1,7× el líquido). Menos hielo = sopa; más = granizado sin sabor.`
    : `🍨 Sin hielo: el helado congela y da el cuerpo. Vaso e ingredientes muy fríos y batir poco tiempo a máxima potencia.`;
  return `
    <div class="frozen-panel">
      <b>🥶 Control frozen</b>
      ${avisos.map(a => `<div>${a}</div>`).join("")}
      <p class="meta">${hieloTxt}</p>
    </div>`;
}

// ---------- Recetas ----------
function tarjetaReceta(receta, opciones = {}) {
  const barra = esModoBarra(); // modo bartender: guía sin costes ni edición
  const e = escalarReceta(receta);
  const c = costeReceta(e);
  const disp = analizarDisponibilidad(receta);
  const vReal = vasoPorId(e.vasoUsado);
  const h = hieloPorId(e.hieloUsado);
  const tec = tecnicaPorId(receta.tecnica);

  const lineas = e.ingredientes.map(i => {
    let marca = "";
    if (i.marca) {
      const item = estado.inventario.find(x => x.id === i.marca);
      if (item) marca = ` <span class="meta">· ${esc(item.nombre)}</span>`;
    }
    return `<div class="ing-linea"><span>${esc(i.nombreTipo)}${marca}</span><span class="cant">${i.texto}</span></div>`;
  }).join("");

  // Orden de vertido para chupitos en capas (más denso primero)
  let capasHtml = "";
  if (receta.tecnica === "capas") {
    const orden = [...e.ingredientes]
      .sort((a, b) => densidadTipo(b.tipo) - densidadTipo(a.tipo))
      .map((i, n) => `${n + 1}º ${esc(i.nombreTipo)}`);
    capasHtml = `<p class="meta">🌈 Orden de vertido (por densidad): ${orden.join(" → ")}</p>`;
  }

  const precioSugerido = c.total * estado.margen;
  const costeHtml = barra ? "" : c.completo
    ? `<div class="coste">${fmtDinero(c.total)}</div>`
    : `<div class="coste" title="Faltan precios de: ${esc(c.faltantes.join(", "))}">${c.total > 0 ? "≥ " + fmtDinero(c.total) : "—"}</div>`;

  const avisos = e.avisos.map(a => `<div class="aviso">${esc(a)}</div>`).join("");
  const dispTag = disp.posibles
    ? `<span class="tag tag-ok">✓ Disponible con tu inventario</span>`
    : `<span class="tag tag-mal">Falta: ${esc(disp.faltan.join(", "))}</span>`;

  return `
    <div class="card receta-card">
      <div class="cabecera">
        <h4>${esc(receta.nombre)}</h4>
        ${costeHtml}
      </div>
      <div>
        <span class="tag tag-oro">${esc(vReal.nombre)} · ${e.capacidad} ml</span>
        <span class="tag">${esc(h.nombre)}${e.despPct ? ` · ${Math.round(e.hieloMl)} ml desplazados` : ""}</span>
        <span class="tag">${esc(tec.nombre)} · ${e.dilucionPct}% dilución</span>
      </div>
      ${avisos}
      <div>${lineas}</div>
      ${capasHtml}
      ${panelSabor(receta, e)}
      ${panelFrozen(receta, e)}
      <p class="meta">
        Volumen servido: <b>${Math.round(e.volFinal)} ml</b> de líquido
        ${e.despPct ? `+ hielo (vaso lleno al ${estado.llenadoPct} %)` : `(${estado.llenadoPct} % del vaso)`}
        ${!barra && c.completo ? ` · Precio sugerido (coste × ${estado.margen}): <b>${fmtDinero(precioSugerido)}</b> · Coste = ${precioSugerido > 0 ? Math.round(c.total / precioSugerido * 100) : 0}% del PVP` : ""}
      </p>
      ${receta.decoracion ? `<p class="meta">🍋 ${esc(receta.decoracion)}</p>` : ""}
      ${receta.pasos ? `<p class="pasos">${esc(receta.pasos)}</p>` : ""}
      <div>${dispTag}</div>
      <div class="fila">
        ${recetaPorId(receta.id) ? `<button class="btn btn-mini" data-ficha="${receta.id}">👨‍🍳 Ficha de preparación</button>` : ""}
        ${!barra && opciones.editable !== false && recetaPorId(receta.id) ? `<button class="btn btn-sec btn-mini" data-personalizar="${receta.id}">🛠 ${opciones.propia ? "Editar" : "Personalizar con mis marcas"}</button>` : ""}
        ${!barra && opciones.propia ? `<button class="btn btn-peligro btn-mini" data-borrar-receta="${receta.id}">Eliminar</button>` : ""}
      </div>
    </div>`;
}

// ---------- Ficha de preparación (estación del bartender) ----------
// Guía paso a paso en grande para aprender y ejecutar el trago igual siempre.
const TEXTO_TECNICA = {
  agitado: "Agita fuerte con hielo 12-15 segundos, hasta que la coctelera escarche por fuera. Cuela al servir.",
  removido: "Remueve con hielo en vaso mezclador 20-30 segundos, con suavidad. Cuela al servir.",
  directo: "Construye los ingredientes directamente en el vaso y remueve suavemente de abajo arriba.",
  batido: "Bate a máxima potencia hasta textura de granizado fino, sin pasarte (batir de más calienta y agua).",
  "batido-helado": "Bate con el helado SIN hielo, poco tiempo y a máxima potencia. Todo muy frío.",
  capas: "Vierte cada capa muy despacio sobre el dorso de una cucharilla apoyada en la pared del vaso.",
  ninguna: "Sirve directamente.",
};

function abrirFicha(recetaId) {
  const receta = recetaPorId(recetaId);
  if (!receta) return;
  const e = escalarReceta(receta);
  const vaso = vasoPorId(e.vasoUsado);
  const hielo = hieloPorId(e.hieloUsado);
  const tecnica = tecnicaPorId(receta.tecnica);

  // Para los chupitos en capas, los ingredientes van en orden de densidad
  const orden = receta.tecnica === "capas"
    ? [...e.ingredientes].sort((a, b) => densidadTipo(b.tipo) - densidadTipo(a.tipo))
    : e.ingredientes;
  const listaIngs = orden.map(i => {
    let marca = "";
    if (i.marca) {
      const item = estado.inventario.find(x => x.id === i.marca);
      if (item) marca = ` — usa <b>${esc(item.nombre)}</b>`;
    }
    return `<li><b>${i.texto}</b> de ${esc(i.nombreTipo)}${marca}</li>`;
  }).join("");

  let pasoTecnica = TEXTO_TECNICA[receta.tecnica] || "";
  if (receta.tecnica === "batido") {
    const liquido = e.ingredientes.reduce((s, i) => s + (i.mlFinal || 0), 0);
    pasoTecnica = `Añade ~${Math.round(liquido * 1.7)} g de hielo (1,7× el líquido). ` + pasoTecnica;
  }

  const overlay = document.createElement("div");
  overlay.className = "ficha-overlay";
  overlay.innerHTML = `
    <div class="ficha">
      <button class="ficha-cerrar" title="Cerrar">✕</button>
      <h2>${esc(receta.nombre)}</h2>
      <p class="meta">${esc(vaso.nombre)} · ${e.capacidad} ml · ${esc(tecnica.nombre)}</p>
      <ol class="ficha-pasos">
        <li><b>Vaso:</b> ${esc(vaso.nombre)} de ${e.capacidad} ml.${receta.hielo === "sin-hielo" ? " Enfríalo antes (hielo y agua, o congelador)." : ""}</li>
        <li><b>Hielo:</b> ${receta.hielo === "sin-hielo" ? "se sirve sin hielo (el frío se consigue al elaborar)." : esc(hielo.nombre.toLowerCase()) + ` hasta ocupar ~${Math.round(e.hieloMl)} ml del vaso.`}</li>
        <li><b>Mide e incorpora${receta.tecnica === "capas" ? " EN ESTE ORDEN (capas, el más denso primero)" : ""}:</b>
          <ul>${listaIngs}</ul>
        </li>
        <li><b>Elabora:</b> ${esc(pasoTecnica)}</li>
        ${receta.decoracion ? `<li><b>Decora y sirve:</b> ${esc(receta.decoracion)}.</li>` : `<li><b>Sirve</b> inmediatamente.</li>`}
      </ol>
      ${receta.pasos ? `<p class="pasos">📋 Nota del máster: ${esc(receta.pasos)}</p>` : ""}
      <p class="meta">Volumen final: ${Math.round(e.volFinal)} ml de líquido · Dilución ${e.dilucionPct} % · Sigue la ficha al milímetro: el cliente debe recibir siempre el mismo cóctel.</p>
    </div>`;
  overlay.addEventListener("click", ev => {
    if (ev.target === overlay || ev.target.classList.contains("ficha-cerrar")) overlay.remove();
  });
  document.body.appendChild(overlay);
}

// ---------- Modo máster / modo barra ----------
function aplicarModo() {
  const barra = esModoBarra();
  document.body.classList.toggle("modo-barra", barra);
  $("#btn-modo").textContent = barra ? "🔓 Soy el máster" : "🔒 Bloquear";
  $("#btn-modo").title = barra ? "Desbloquear modo máster (PIN)" : "Bloquear en modo barra para el equipo";
  $("#badge-modo").textContent = barra ? "MODO BARRA · solo guía" : "";
  if (barra) {
    cambiarSeccion("recetas");
  } else {
    renderRecetas();
  }
}

function toggleModo() {
  if (esModoBarra()) {
    const pin = prompt("PIN de máster para desbloquear:");
    if (pin === null) return;
    if (pin !== estado.pinMaster) { alert("PIN incorrecto."); return; }
    estado.modo = "master";
  } else {
    if (!estado.pinMaster) {
      const pin = prompt("Crea un PIN de máster (mínimo 4 caracteres).\nSe pedirá para volver del modo barra al modo máster:");
      if (!pin || pin.trim().length < 4) { alert("PIN no válido: necesita al menos 4 caracteres."); return; }
      estado.pinMaster = pin.trim();
    }
    estado.modo = "barra";
  }
  guardarEstado();
  aplicarModo();
}

function renderRecetas() {
  const filtro = $("#filtro-recetas").value.toLowerCase();
  const soloPosibles = $("#filtro-posibles").checked;

  const filtrar = lista => lista.filter(r => {
    if (filtro && !r.nombre.toLowerCase().includes(filtro)) return false;
    if (soloPosibles && !analizarDisponibilidad(r).posibles) return false;
    return true;
  });

  // Mostrar solo la sublista elegida en el menú (clásicas / propias / chupitos)
  $("#bloque-clasicas").style.display = subRecetas === "clasicas" ? "" : "none";
  $("#bloque-propias").style.display = subRecetas === "propias" ? "" : "none";
  $("#bloque-shots").style.display = subRecetas === "shots" ? "" : "none";
  $("#lista-recetas").style.display = subRecetas === "clasicas" ? "" : "none";
  $("#lista-recetas-propias").style.display = subRecetas === "propias" ? "" : "none";
  $("#lista-shots").style.display = subRecetas === "shots" ? "" : "none";

  if (subRecetas === "propias") {
    const propias = filtrar(estado.recetasPropias);
    $("#lista-recetas-propias").innerHTML = propias.length
      ? propias.map(r => tarjetaReceta(r, { propia: true })).join("")
      : `<p class="vacio">${estado.recetasPropias.length ? "Ninguna receta propia coincide con el filtro." : "Aún no tienes recetas propias. Créalas en ✨ Crear, con el generador de chupitos, o pulsando «Personalizar» en cualquier clásico."}</p>`;
  } else if (subRecetas === "shots") {
    const shots = filtrar(RECETAS_SHOTS);
    $("#lista-shots").innerHTML = shots.length
      ? shots.map(r => tarjetaReceta(r)).join("")
      : `<p class="vacio">Ningún chupito coincide con el filtro.</p>`;
  } else {
    const clasicas = filtrar(RECETAS_CLASICAS);
    $("#lista-recetas").innerHTML = clasicas.length
      ? clasicas.map(r => tarjetaReceta(r)).join("")
      : `<p class="vacio">Ninguna receta coincide con el filtro.</p>`;
  }
}

// ---------- Personalizar / editar recetas en el formulario ----------
let recetaEditandoId = null; // si se edita una receta propia, su id

function opcionesMarcaHtml(tipoId, marcaSel) {
  const items = estado.inventario.filter(i => i.tipo === tipoId);
  return `<option value="">Marca: la más económica</option>` +
    items.map(i => `<option value="${i.id}" ${i.id === marcaSel ? "selected" : ""}>${esc(i.nombre)}</option>`).join("");
}

function cargarEnEditor(recetaId) {
  const r = recetaPorId(recetaId);
  if (!r) return;
  const esPropia = estado.recetasPropias.some(x => x.id === r.id);
  cambiarSeccion("crear");
  recetaEditandoId = esPropia ? r.id : null;

  $("#nr-nombre").value = esPropia ? r.nombre : r.nombre + " de la casa";
  // Garantiza que el vaso/hielo de la receta estén en los desplegables
  // aunque el negocio no los tenga seleccionados en su barra.
  const selVaso = $("#nr-vaso");
  if (![...selVaso.options].some(o => o.value === r.vaso)) {
    const v = vasoPorId(r.vaso);
    selVaso.insertAdjacentHTML("beforeend", `<option value="${v.id}">${esc(v.nombre)} (${v.ml} ml)</option>`);
  }
  selVaso.value = r.vaso;
  $("#nr-tecnica").value = r.tecnica;
  const selHielo = $("#nr-hielo");
  if (![...selHielo.options].some(o => o.value === r.hielo)) {
    const h = hieloPorId(r.hielo);
    selHielo.insertAdjacentHTML("beforeend", `<option value="${h.id}">${esc(h.nombre)}</option>`);
  }
  selHielo.value = r.hielo;

  const cont = $("#nr-ingredientes");
  cont.innerHTML = "";
  r.ingredientes.forEach(ing => {
    cont.insertAdjacentHTML("beforeend", filaIngredienteHtml());
    const row = cont.lastElementChild;
    row.querySelector(".ing-tipo").value = ing.tipo;
    if (ing.ml != null) {
      row.querySelector(".ing-cant").value = ing.ml;
      row.querySelector(".ing-unidad").value = "ml";
    } else if (ing.dash != null) {
      row.querySelector(".ing-cant").value = ing.dash;
      row.querySelector(".ing-unidad").value = "dash";
    } else {
      row.querySelector(".ing-cant").value = ing.ud || 1;
      row.querySelector(".ing-unidad").value = "ud";
    }
    row.querySelector(".ing-marca").innerHTML = opcionesMarcaHtml(ing.tipo, ing.marca);
  });
  activarBotonesQuitar();
  $("#nr-decoracion").value = r.decoracion || "";
  $("#nr-pasos").value = r.pasos || "";
  $("#aviso-edicion").innerHTML = esPropia
    ? `Editando «${esc(r.nombre)}»: al guardar se actualizará.`
    : `Personalizando el clásico «${esc(r.nombre)}»: se guardará como receta de la casa con tus marcas (el original no se toca).`;
  vistaPrevia();
  window.scrollTo({ top: 0, behavior: "smooth" });
}

// ---------- Crear receta ----------
let filasIngredientes = 0;

function filaIngredienteHtml() {
  filasIngredientes++;
  const opciones = opcionesTiposHtml(null);
  return `
    <div class="ing-row" data-fila="${filasIngredientes}">
      <select class="ing-tipo">${opciones}</select>
      <input type="number" class="ing-cant" min="0.5" step="0.5" value="30" style="width:80px">
      <select class="ing-unidad" style="width:90px">
        <option value="ml">ml</option>
        <option value="dash">dash</option>
        <option value="ud">ud</option>
      </select>
      <select class="ing-marca" style="width:200px">
        <option value="">Marca: la más económica</option>
      </select>
      <button type="button" class="btn btn-peligro btn-mini quitar-ing">✕</button>
    </div>`;
}

function renderCrear() {
  recetaEditandoId = null;
  $("#aviso-edicion").innerHTML = "";
  const selVaso = $("#nr-vaso");
  const seleccionados = Object.keys(estado.vasos);
  const fuente = seleccionados.length ? VASOS.filter(v => seleccionados.includes(v.id)) : VASOS;
  selVaso.innerHTML = fuente.map(v =>
    `<option value="${v.id}">${esc(v.nombre)} (${estado.vasos[v.id] ?? v.ml} ml)</option>`
  ).join("");

  $("#nr-tecnica").innerHTML = TECNICAS.map(t => `<option value="${t.id}">${esc(t.nombre)}</option>`).join("");

  const hielosDisp = Object.keys(estado.hielos);
  const fuenteH = HIELOS.filter(h => h.id === "sin-hielo" || !hielosDisp.length || hielosDisp.includes(h.id));
  $("#nr-hielo").innerHTML = fuenteH.map(h => `<option value="${h.id}">${esc(h.nombre)}</option>`).join("");

  const cont = $("#nr-ingredientes");
  if (!cont.children.length) {
    cont.innerHTML = filaIngredienteHtml() + filaIngredienteHtml();
  }
  poblarMarcasFilas();
  activarBotonesQuitar();
}

// Rellena el selector de marca de cada fila con los productos del
// inventario que coinciden con el tipo elegido.
function poblarMarcasFilas() {
  $$("#nr-ingredientes .ing-row").forEach(row => {
    const sel = row.querySelector(".ing-marca");
    const tipo = row.querySelector(".ing-tipo").value;
    sel.innerHTML = opcionesMarcaHtml(tipo, sel.value);
  });
}

function activarBotonesQuitar() {
  $$("#nr-ingredientes .quitar-ing").forEach(b => {
    b.onclick = () => {
      if ($("#nr-ingredientes").children.length > 1) b.closest(".ing-row").remove();
    };
  });
}

function leerIngredientesFormulario() {
  return $$("#nr-ingredientes .ing-row").map(row => {
    const tipo = row.querySelector(".ing-tipo").value;
    const cant = parseFloat(row.querySelector(".ing-cant").value);
    const unidad = row.querySelector(".ing-unidad").value;
    const marca = row.querySelector(".ing-marca").value;
    if (!tipo || !(cant > 0)) return null;
    const ing = unidad === "ml" ? { tipo, ml: cant } : unidad === "dash" ? { tipo, dash: cant } : { tipo, ud: cant };
    if (marca) ing.marca = marca;
    return ing;
  }).filter(Boolean);
}

function guardarRecetaNueva(ev) {
  ev.preventDefault();
  const nombre = $("#nr-nombre").value.trim();
  const ingredientes = leerIngredientesFormulario();
  if (!nombre || !ingredientes.length) return;
  if (!ingredientes.some(i => i.ml)) {
    alert("La receta necesita al menos un ingrediente medido en ml para poder escalarse.");
    return;
  }
  const receta = {
    id: recetaEditandoId || "propia-" + Date.now(),
    nombre,
    vaso: $("#nr-vaso").value,
    tecnica: $("#nr-tecnica").value,
    hielo: $("#nr-hielo").value,
    ingredientes,
    decoracion: $("#nr-decoracion").value.trim(),
    pasos: $("#nr-pasos").value.trim(),
  };
  if (recetaEditandoId) {
    const idx = estado.recetasPropias.findIndex(r => r.id === recetaEditandoId);
    if (idx >= 0) estado.recetasPropias[idx] = receta;
    recetaEditandoId = null;
  } else {
    estado.recetasPropias.push(receta);
  }
  guardarEstado();
  $("#form-receta").reset();
  $("#nr-ingredientes").innerHTML = "";
  $("#vista-previa").innerHTML = "";
  renderCrear();
  cambiarSeccion("recetas", "propias");
}

function vistaPrevia() {
  const ingredientes = leerIngredientesFormulario();
  if (!ingredientes.some(i => i.ml)) {
    $("#vista-previa").innerHTML = `<p class="vacio">Añade al menos un ingrediente en ml para previsualizar.</p>`;
    return;
  }
  const recetaTemp = {
    id: "preview", nombre: $("#nr-nombre").value.trim() || "Nueva creación",
    vaso: $("#nr-vaso").value, tecnica: $("#nr-tecnica").value, hielo: $("#nr-hielo").value,
    ingredientes,
    decoracion: $("#nr-decoracion").value.trim(),
    pasos: $("#nr-pasos").value.trim(),
  };
  $("#vista-previa").innerHTML = tarjetaReceta(recetaTemp);
}

// ---------- Inventar (asistente con las reglas de oro) ----------
let propuestaActual = null;   // última receta generada, lista para guardar

// Agrupa el inventario por rol coctelero: rol -> [{tipo, productos}]
function inventarioPorRol() {
  const porTipo = {};
  estado.inventario.forEach(item => {
    (porTipo[item.tipo] = porTipo[item.tipo] || []).push(item.nombre);
  });
  const mapa = {};
  Object.keys(porTipo).forEach(tipoId => {
    const t = tipoPorId(tipoId);
    if (!t) return;
    (mapa[t.rol] = mapa[t.rol] || []).push({ tipo: t, productos: porTipo[tipoId] });
  });
  return mapa;
}

// Nombre corto de un tipo para bautizar la creación ("Zumo de piña" -> "Piña")
function nombreCortoTipo(t) {
  let n = t.nombre
    .replace(/^(Zumo de|Puré \/ concentrado de|Sirope de|Licor de(?: flor de)?|Crema de|Refresco de|Whisky de|Whisky)\s*/i, "")
    .replace(/\s*\(.*\)$/, "")
    .split("/")[0].trim();
  return n.charAt(0).toUpperCase() + n.slice(1);
}

function generarPropuesta(plantilla) {
  const porRol = inventarioPorRol();
  const usados = new Set();
  const ingredientes = [];
  const detalle = [];
  const faltan = [];

  plantilla.slots.forEach(slot => {
    const candidatos = slot.rol.flatMap(r => porRol[r] || []).filter(c => !usados.has(c.tipo.id));
    if (!candidatos.length) {
      if (!slot.opcional) faltan.push(slot);
      return;
    }
    const elegido = candidatos[Math.floor(Math.random() * candidatos.length)];
    usados.add(elegido.tipo.id);
    const ing = { tipo: elegido.tipo.id };
    if (slot.dash) ing.dash = slot.dash; else ing.ml = slot.ml;
    ingredientes.push(ing);
    detalle.push({ slot, tipo: elegido.tipo, productos: elegido.productos });
  });

  if (faltan.length) return { plantilla, faltan };

  const base = detalle.find(d => d.tipo.rol === "base") || detalle[0];
  const distintivo = [...detalle].reverse().find(d =>
    d !== base && ["pure", "zumo", "licor-dulce", "aperitivo", "dulce", "aroma", "vermut"].includes(d.tipo.rol));
  const nombre = `${plantilla.nombreCorto} de ${nombreCortoTipo(base.tipo)}` +
    (distintivo ? ` y ${nombreCortoTipo(distintivo.tipo)}` : "");

  const receta = {
    id: "propuesta",
    nombre,
    vaso: plantilla.vaso,
    tecnica: plantilla.tecnica,
    hielo: plantilla.hielo,
    ingredientes,
    decoracion: "",
    pasos: `Fórmula ${plantilla.nombreCorto}: ${plantilla.formula}. Prueba, ajusta el punto dulce/ácido a tu gusto y bautízala.`,
  };
  return { plantilla, receta, detalle };
}

function renderInventar() {
  const cont = $("#lista-plantillas");
  cont.innerHTML = PLANTILLAS_CREACION.map(p => `
    <div class="card plantilla-card">
      <h4>${p.emoji} ${esc(p.nombre)}</h4>
      <p class="formula">${esc(p.formula)}</p>
      <p class="desc">${esc(p.desc)}</p>
      <p class="meta">Clásicos de esta familia: ${esc(p.ejemplos)}</p>
      <button class="btn btn-sec btn-mini" data-plantilla="${p.id}">Proponer con mi inventario</button>
    </div>`).join("");
  cont.querySelectorAll("[data-plantilla]").forEach(b =>
    b.addEventListener("click", () => mostrarPropuesta(b.dataset.plantilla)));
}

function mostrarPropuesta(plantillaId) {
  const zona = $("#zona-propuesta");
  if (!estado.inventario.length) {
    zona.innerHTML = `<div class="aviso">Añade primero productos a tu inventario: el asistente crea cócteles solo con lo que tienes en tu negocio.</div>`;
    zona.scrollIntoView({ behavior: "smooth" });
    return;
  }
  const plantilla = plantillaId === "azar"
    ? PLANTILLAS_CREACION[Math.floor(Math.random() * PLANTILLAS_CREACION.length)]
    : PLANTILLAS_CREACION.find(p => p.id === plantillaId);

  const prop = generarPropuesta(plantilla);
  if (prop.faltan) {
    propuestaActual = null;
    const roles = prop.faltan.map(s =>
      `<b>${esc(s.nombre)}</b> (${s.rol.map(r => ROLES[r].toLowerCase()).join(" o ")})`).join(", ");
    zona.innerHTML = `
      <h3>${plantilla.emoji} ${esc(plantilla.nombre)}</h3>
      <div class="aviso">A tu inventario le falta: ${roles}. Añádelo en «Inventario» y esta familia entera de cócteles se desbloquea.</div>`;
    zona.scrollIntoView({ behavior: "smooth" });
    return;
  }

  propuestaActual = prop;
  const detalleHtml = prop.detalle.map(d => `
    <div class="ing-linea">
      <span><span class="tag">${esc(ROLES[d.tipo.rol])}</span> ${esc(d.tipo.nombre)}</span>
      <span class="meta">tu producto: ${esc(d.productos.join(", "))}</span>
    </div>`).join("");

  zona.innerHTML = `
    <h3>${prop.plantilla.emoji} Propuesta: ${esc(prop.receta.nombre)}</h3>
    <div class="grid">
      <div>${tarjetaReceta(prop.receta)}</div>
      <div class="card">
        <h4>Cómo se construye el equilibrio</h4>
        <p class="formula">${esc(prop.plantilla.formula)}</p>
        ${detalleHtml}
        <div class="fila" style="margin-top:14px">
          <button class="btn" id="btn-guardar-propuesta">💾 Guardar en mis recetas</button>
          <button class="btn btn-sec" id="btn-otra-propuesta">🎲 Otra versión</button>
        </div>
      </div>
    </div>`;
  $("#btn-guardar-propuesta").addEventListener("click", () => {
    estado.recetasPropias.push({ ...prop.receta, id: "propia-" + Date.now() });
    guardarEstado();
    cambiarSeccion("recetas", "propias");
  });
  $("#btn-otra-propuesta").addEventListener("click", () => mostrarPropuesta(prop.plantilla.id));
  zona.scrollIntoView({ behavior: "smooth" });
}

// ---------- Generador de carta de chupitos ----------
// Combina el inventario en patrones de shot probados y clasifica el resultado
// por intensidad real (graduación final), ordenado por rentabilidad.
let cartaShotsActual = {};

function generarCartaChupitos() {
  const porRol = inventarioPorRol();
  const bases = porRol.base || [];
  const licores = porRol["licor-dulce"] || [];
  const dulces = porRol.dulce || [];
  const acidos = porRol.acido || [];
  const frutas = (porRol.zumo || []).concat(porRol.pure || []);
  const candidatos = [];
  const visto = new Set();
  const add = (nombre, tecnica, ings, pasos) => {
    const clave = ings.map(i => i.tipo).sort().join("|") + tecnica;
    if (visto.has(clave)) return;
    visto.add(clave);
    candidatos.push({
      id: "shotgen-" + candidatos.length, nombre, vaso: "shot", tecnica,
      hielo: "sin-hielo", esShot: true, ingredientes: ings, decoracion: "", pasos,
    });
  };

  // Suaves: licor + fruta (agitado y colado)
  licores.forEach(l => frutas.forEach(f =>
    add(`Shot de ${nombreCortoTipo(l.tipo)} y ${nombreCortoTipo(f.tipo)}`, "agitado",
      [{ tipo: l.tipo.id, ml: 25 }, { tipo: f.tipo.id, ml: 20 }],
      "Agitar con hielo y colar fino en el caballito.")));
  // Medios: mini sour (base + cítrico + dulce/licor)
  bases.forEach(b => acidos.forEach(a => dulces.concat(licores).forEach(d => {
    if (d.tipo.id === b.tipo.id) return;
    add(`Mini sour de ${nombreCortoTipo(b.tipo)} y ${nombreCortoTipo(d.tipo)}`, "agitado",
      [{ tipo: b.tipo.id, ml: 22 }, { tipo: a.tipo.id, ml: 13 }, { tipo: d.tipo.id, ml: 10 }],
      "Agitar con hielo y colar fino: la regla de oro en 45 ml.");
  })));
  // En capas: sirope denso + licor + remate (espectáculo)
  dulces.forEach(d => licores.forEach(l => bases.concat(licores).forEach(t => {
    if (t.tipo.id === l.tipo.id) return;
    add(`Capas de ${nombreCortoTipo(l.tipo)} y ${nombreCortoTipo(t.tipo)}`, "capas",
      [{ tipo: d.tipo.id, ml: 15 }, { tipo: l.tipo.id, ml: 15 }, { tipo: t.tipo.id, ml: 15 }],
      "Verter por capas sobre el dorso de una cuchara, el más denso abajo.");
  })));
  // Fuertes: base + licor, directo
  bases.forEach(b => licores.forEach(l =>
    add(`Trago corto de ${nombreCortoTipo(b.tipo)} y ${nombreCortoTipo(l.tipo)}`, "directo",
      [{ tipo: b.tipo.id, ml: 25 }, { tipo: l.tipo.id, ml: 20 }],
      "Construir directo en el caballito.")));

  const grupos = { suave: [], medio: [], fuerte: [] };
  candidatos.forEach(r => {
    const e = escalarReceta(r);
    const c = costeReceta(e);
    if (!c.completo) return;
    const p = perfilSabor(e);
    const g = p.abv < 15 ? "suave" : p.abv < 25 ? "medio" : "fuerte";
    grupos[g].push({ r, e, c, p });
  });
  Object.values(grupos).forEach(g => g.sort((a, b) => a.c.total - b.c.total));
  return grupos;
}

function renderCartaShots() {
  const zona = $("#zona-carta-shots");
  if (!estado.inventario.length) {
    zona.innerHTML = `<div class="aviso">Añade primero productos con precio a tu inventario: la carta se genera solo con lo que tienes.</div>`;
    return;
  }
  const grupos = generarCartaChupitos();
  cartaShotsActual = {};
  const bloque = (titulo, desc, lista) => {
    let html = `<h4 class="grupo-shots">${titulo}</h4><p class="sub">${desc}</p>`;
    if (!lista.length) return html + `<p class="vacio">Sin combinaciones en este grupo: amplía el inventario.</p>`;
    return html + `<div class="grid">` + lista.slice(0, 8).map(x => {
      cartaShotsActual[x.r.id] = x.r;
      const ings = x.e.ingredientes.map(i => `${i.texto} ${i.nombreTipo}`).join(" + ");
      const pvp = x.c.total * estado.margen;
      return `
        <div class="card">
          <h4>${esc(x.r.nombre)}</h4>
          <p class="desc">${esc(ings)}${x.r.tecnica === "capas" ? " · en capas" : ""}</p>
          <div>
            <span class="tag tag-oro">${x.p.abv.toFixed(0)}º · ${etiquetaFuerza(x.p.abv)}</span>
            <span class="tag">coste ${fmtDinero(x.c.total)}</span>
            <span class="tag tag-ok">PVP ${fmtDinero(pvp)} · ganas ${fmtDinero(pvp - x.c.total)}</span>
          </div>
          <div class="fila" style="margin-top:8px">
            <button class="btn btn-sec btn-mini" data-guardar-shot="${x.r.id}">💾 Añadir a mi carta</button>
          </div>
        </div>`;
    }).join("") + `</div>`;
  };
  const total = grupos.suave.length + grupos.medio.length + grupos.fuerte.length;
  zona.innerHTML = `
    <div class="kpis"><div class="kpi"><b>${total}</b> chupitos posibles con tu inventario (mostrando los 8 más rentables de cada grupo)</div></div>
    ${bloque("🍑 Suaves (menos de 15º)", "Para abrir la noche, rondas grandes y público que no busca alcohol fuerte. Los más rentables de la carta.", grupos.suave)}
    ${bloque("⚡ Medios (15-25º)", "El punto kamikaze: cítricos y equilibrados, los que más se venden.", grupos.medio)}
    ${bloque("🔥 Fuertes (más de 25º)", "Para celebraciones y valientes: capas vistosas y tragos secos.", grupos.fuerte)}`;
  zona.querySelectorAll("[data-guardar-shot]").forEach(b => b.addEventListener("click", () => {
    const r = cartaShotsActual[b.dataset.guardarShot];
    if (!r) return;
    estado.recetasPropias.push({ ...r, id: "propia-" + Date.now() });
    guardarEstado();
    b.textContent = "✓ Añadido a mi carta";
    b.disabled = true;
  }));
  zona.scrollIntoView({ behavior: "smooth" });
}

// ---------- Descubrir (¿qué puedo crear?) ----------
function renderDescubrir() {
  const cont = $("#lista-descubrir");
  if (!estado.inventario.length) {
    cont.innerHTML = `<p class="vacio">Añade primero productos a tu inventario para descubrir qué cócteles puedes preparar.</p>`;
    $("#lista-casi").innerHTML = "";
    $("#resumen-descubrir").innerHTML = "";
    return;
  }
  const analisis = todasRecetas().map(r => ({ r, d: analizarDisponibilidad(r) }));
  const posibles = analisis.filter(a => a.d.posibles);
  const casi = analisis.filter(a => !a.d.posibles && a.d.faltan.length === 1);

  $("#resumen-descubrir").innerHTML = `
    <div class="kpi"><b>${posibles.length}</b> cócteles listos para servir</div>
    <div class="kpi"><b>${casi.length}</b> a un solo ingrediente de distancia</div>`;

  cont.innerHTML = posibles.length
    ? posibles.map(a => tarjetaReceta(a.r)).join("")
    : `<p class="vacio">Con el inventario actual no se completa ninguna receta. Mira abajo qué te falta.</p>`;

  $("#lista-casi").innerHTML = casi.length
    ? casi.map(a => tarjetaReceta(a.r)).join("")
    : `<p class="vacio">Nada pendiente de un solo ingrediente.</p>`;
}

// ---------- Ofertas ----------
// Una oferta solo es buena si conoces tu coste: la app calcula el margen
// real de cada promoción y avisa con un semáforo de rentabilidad.
function calcularOferta(o) {
  const r1 = recetaPorId(o.recetaId);
  if (!r1) return null;
  const c1 = costeReceta(escalarReceta(r1));
  const pvp1 = c1.total * estado.margen;
  let ingreso, coste, descripcion;
  if (o.tipo === "2x1") {
    ingreso = pvp1; coste = 2 * c1.total;
    descripcion = `2 × ${r1.nombre} al precio de 1 (${fmtDinero(pvp1)})`;
  } else if (o.tipo === "descuento") {
    ingreso = pvp1 * (1 - o.valor / 100); coste = c1.total;
    descripcion = `${r1.nombre} con −${o.valor}%: ${fmtDinero(ingreso)} (antes ${fmtDinero(pvp1)})`;
  } else if (o.tipo === "precio") {
    ingreso = o.valor; coste = c1.total;
    descripcion = `${r1.nombre} a precio cerrado ${fmtDinero(o.valor)} (normal ${fmtDinero(pvp1)})`;
  } else { // combo
    const r2 = recetaPorId(o.recetaId2);
    if (!r2) return null;
    const c2 = costeReceta(escalarReceta(r2));
    ingreso = o.valor; coste = c1.total + c2.total;
    descripcion = `Combo ${r1.nombre} + ${r2.nombre} por ${fmtDinero(o.valor)}`;
  }
  const costePct = ingreso > 0 ? coste / ingreso * 100 : 999;
  const salud = costePct <= 35
    ? { clase: "tag-ok", texto: "✓ Rentable (coste ≤ 35 %)" }
    : costePct <= 50
      ? { clase: "tag-oro", texto: "Ajustada: coste " + costePct.toFixed(0) + " % — válida para atraer clientes en horas valle" }
      : { clase: "tag-mal", texto: "⚠ Pierdes margen: el coste se come el " + costePct.toFixed(0) + " % del ingreso" };
  return { descripcion, ingreso, coste, margen: ingreso - coste, costePct, salud };
}

function recetasConCosteCompleto() {
  return todasRecetas()
    .map(r => ({ r, c: costeReceta(escalarReceta(r)) }))
    .filter(x => x.c.completo && x.c.total > 0);
}

function renderOfertas() {
  const disponibles = recetasConCosteCompleto();
  const opciones = disponibles.map(x =>
    `<option value="${x.r.id}">${esc(x.r.nombre)} (coste ${fmtDinero(x.c.total)} · PVP ${fmtDinero(x.c.total * estado.margen)})</option>`).join("");
  $("#of-receta").innerHTML = opciones;
  $("#of-receta2").innerHTML = opciones;

  // Sugerencias automáticas según el margen configurado
  const margen = estado.margen;
  const descMax = Math.max(0, (1 - 1 / (0.35 * margen)) * 100);
  const coste2x1 = 200 / margen;
  const baratos = [...disponibles].sort((a, b) => a.c.total - b.c.total).slice(0, 3);
  $("#of-sugerencias").innerHTML = `
    <div class="kpi"><b>−${descMax.toFixed(0)} %</b> descuento máximo manteniendo coste ≤ 35 % (con tu margen ×${margen})</div>
    <div class="kpi"><b>${coste2x1.toFixed(0)} %</b> coste real de un 2×1 con tus precios — ${coste2x1 <= 50 ? "viable para horas valle" : "cuidado: muy justo"}</div>
    ${baratos.length ? `<div class="kpi"><b>Mejores para 2×1</b> ${baratos.map(x => esc(x.r.nombre)).join(" · ")} (los de menor coste)</div>` : ""}`;

  const cont = $("#lista-ofertas");
  if (!estado.ofertas.length) {
    cont.innerHTML = `<p class="vacio">Aún no hay ofertas creadas. Diseña la primera con el formulario.</p>`;
  } else {
    cont.innerHTML = estado.ofertas.map(o => {
      const calc = calcularOferta(o);
      if (!calc) return "";
      return `
        <div class="card receta-card">
          <div class="cabecera">
            <h4>💰 ${esc(o.nombre)}</h4>
            <div class="coste">${fmtDinero(calc.ingreso)}</div>
          </div>
          <p class="meta">${esc(calc.descripcion)}</p>
          <div class="ing-linea"><span>Coste de producción</span><span class="cant">${fmtDinero(calc.coste)}</span></div>
          <div class="ing-linea"><span>Margen por venta</span><span class="cant">${fmtDinero(calc.margen)}</span></div>
          <div class="ing-linea"><span>Coste sobre ingreso</span><span class="cant">${calc.costePct.toFixed(0)} %</span></div>
          <div><span class="tag ${calc.salud.clase}">${calc.salud.texto}</span></div>
          <div><button class="btn btn-peligro btn-mini" data-borrar-oferta="${o.id}">Eliminar oferta</button></div>
        </div>`;
    }).join("");
  }
  cont.querySelectorAll("[data-borrar-oferta]").forEach(b => b.addEventListener("click", () => {
    estado.ofertas = estado.ofertas.filter(o => o.id !== b.dataset.borrarOferta);
    guardarEstado(); renderOfertas();
  }));
  actualizarFormularioOferta();
}

function actualizarFormularioOferta() {
  const tipo = $("#of-tipo").value;
  $("#of-valor-campo").style.display = tipo === "2x1" ? "none" : "";
  $("#of-receta2-campo").style.display = tipo === "combo" ? "" : "none";
  $("#of-valor-label").textContent =
    tipo === "descuento" ? "% de descuento" : "Precio de la oferta (" + estado.moneda + ")";
}

function guardarOferta(ev) {
  ev.preventDefault();
  const tipo = $("#of-tipo").value;
  const recetaId = $("#of-receta").value;
  if (!recetaId) return;
  const valor = parseFloat($("#of-valor").value);
  if (tipo !== "2x1" && !(valor > 0)) return;
  const r1 = recetaPorId(recetaId);
  const oferta = {
    id: "oferta-" + Date.now(),
    tipo, recetaId,
    recetaId2: tipo === "combo" ? $("#of-receta2").value : null,
    valor: tipo === "2x1" ? null : valor,
    nombre: $("#of-nombre").value.trim() ||
      (tipo === "2x1" ? "2×1 en " + r1.nombre
        : tipo === "descuento" ? "Happy hour " + r1.nombre
        : tipo === "combo" ? "Combo " + r1.nombre
        : r1.nombre + " a precio especial"),
  };
  if (tipo === "combo" && !oferta.recetaId2) return;
  estado.ofertas.push(oferta);
  guardarEstado();
  $("#form-oferta").reset();
  renderOfertas();
}

// ---------- Ajustes ----------
function renderAjustes() {
  $("#aj-pin").value = "";
  $("#aj-pin").placeholder = estado.pinMaster ? "PIN configurado ✓ (escribe para cambiarlo)" : "Sin PIN: crea uno";
  $("#aj-nombre").value = estado.nombreNegocio;
  $("#aj-llenado").value = estado.llenadoPct;
  $("#aj-margen").value = estado.margen;
  $("#aj-moneda").value = estado.moneda;
  $("#aj-diluciones").innerHTML = TECNICAS.map(t => `
    <div class="fila" style="margin-bottom:8px">
      <label style="min-width:200px">${esc(t.nombre)}</label>
      <input type="number" min="0" max="80" step="1" value="${estado.diluciones[t.id]}" data-dilucion="${t.id}">
      <span>% de agua incorporada</span>
    </div>`).join("");
  $$("#aj-diluciones [data-dilucion]").forEach(inp => {
    inp.addEventListener("change", () => {
      const v = parseFloat(inp.value);
      if (isNaN(v) || v < 0 || v > 80) { inp.value = estado.diluciones[inp.dataset.dilucion]; return; }
      estado.diluciones[inp.dataset.dilucion] = v;
      guardarEstado();
    });
  });
}

function guardarAjustes(ev) {
  ev.preventDefault();
  estado.nombreNegocio = $("#aj-nombre").value.trim();
  const llenado = parseFloat($("#aj-llenado").value);
  const margen = parseFloat($("#aj-margen").value);
  if (llenado >= 50 && llenado <= 100) estado.llenadoPct = llenado;
  const moneda = $("#aj-moneda").value.trim();
  if (moneda) estado.moneda = moneda;
  if (margen > 0) estado.margen = margen;
  const pin = $("#aj-pin").value.trim();
  if (pin) {
    if (pin.length < 4) { alert("El PIN necesita al menos 4 caracteres."); return; }
    estado.pinMaster = pin;
    $("#aj-pin").value = "";
  }
  guardarEstado();
  $("#aj-guardado").textContent = "✓ Ajustes guardados";
  setTimeout(() => $("#aj-guardado").textContent = "", 2000);
  actualizarCabecera();
}

function exportarDatos() {
  const blob = new Blob([JSON.stringify(estado, null, 2)], { type: "application/json" });
  const a = document.createElement("a");
  a.href = URL.createObjectURL(blob);
  a.download = "wandercocktails-config.json";
  a.click();
  URL.revokeObjectURL(a.href);
}

function importarDatos(ev) {
  const f = ev.target.files[0];
  if (!f) return;
  const lector = new FileReader();
  lector.onload = () => {
    try {
      const datos = JSON.parse(lector.result);
      estado = Object.assign(estado, datos);
      guardarEstado();
      actualizarCabecera();
      aplicarModo();
      cambiarSeccion("barra");
      alert("Configuración importada correctamente.");
    } catch (e) {
      alert("El archivo no es una configuración válida.");
    }
  };
  lector.readAsText(f);
  ev.target.value = "";
}

function actualizarCabecera() {
  $("#nombre-negocio").textContent = estado.nombreNegocio ? " — " + estado.nombreNegocio : "";
}

// ---------- Inicio ----------
document.addEventListener("DOMContentLoaded", () => {
  cargarEstado();
  actualizarCabecera();

  // Menú lateral (acordeón)
  $("#btn-menu").addEventListener("click", abrirMenu);
  $("#btn-cerrar-menu").addEventListener("click", cerrarMenu);
  $("#menu-overlay").addEventListener("click", cerrarMenu);
  $$("#menu-lateral .menu-titulo:not(.directo)").forEach(t =>
    t.addEventListener("click", () => t.closest(".menu-grupo").classList.toggle("abierto")));
  $$("#menu-lateral [data-sec]").forEach(b =>
    b.addEventListener("click", () => cambiarSeccion(b.dataset.sec, b.dataset.sub)));
  $("#form-inventario").addEventListener("submit", agregarInventario);
  $("#form-receta").addEventListener("submit", guardarRecetaNueva);
  $("#btn-add-ing").addEventListener("click", () => {
    $("#nr-ingredientes").insertAdjacentHTML("beforeend", filaIngredienteHtml());
    poblarMarcasFilas();
    activarBotonesQuitar();
  });
  // Al cambiar el tipo de un ingrediente, ofrecer las marcas de ese tipo
  $("#nr-ingredientes").addEventListener("change", ev => {
    if (ev.target.classList.contains("ing-tipo")) {
      const row = ev.target.closest(".ing-row");
      row.querySelector(".ing-marca").innerHTML = opcionesMarcaHtml(ev.target.value, "");
    }
  });
  // Ficha de preparación, personalizar clásicos y borrar propias (delegado)
  document.addEventListener("click", ev => {
    const f = ev.target.closest("[data-ficha]");
    if (f) { abrirFicha(f.dataset.ficha); return; }
    const p = ev.target.closest("[data-personalizar]");
    if (p) { if (!esModoBarra()) cargarEnEditor(p.dataset.personalizar); return; }
    const b = ev.target.closest("[data-borrar-receta]");
    if (b && !esModoBarra()) {
      if (!confirm("¿Eliminar esta receta propia?")) return;
      estado.recetasPropias = estado.recetasPropias.filter(r => r.id !== b.dataset.borrarReceta);
      guardarEstado(); renderRecetas();
    }
  });
  $("#btn-modo").addEventListener("click", toggleModo);
  $("#form-oferta").addEventListener("submit", guardarOferta);
  $("#of-tipo").addEventListener("change", actualizarFormularioOferta);
  aplicarModo();

  // PWA: funcionamiento offline e instalación en móvil/tablet
  if ("serviceWorker" in navigator) {
    navigator.serviceWorker.register("sw.js").catch(() => { /* sin https no hay SW */ });
  }
  let eventoInstalar = null;
  window.addEventListener("beforeinstallprompt", ev => {
    ev.preventDefault();
    eventoInstalar = ev;
    $("#btn-instalar").style.display = "";
  });
  $("#btn-instalar").addEventListener("click", async () => {
    if (!eventoInstalar) return;
    eventoInstalar.prompt();
    await eventoInstalar.userChoice;
    eventoInstalar = null;
    $("#btn-instalar").style.display = "none";
  });
  window.addEventListener("appinstalled", () => {
    $("#btn-instalar").style.display = "none";
  });
  $("#btn-preview").addEventListener("click", vistaPrevia);
  // Vista previa en vivo: el indicador de sabor se actualiza mientras escribes
  let temporizadorPreview = null;
  $("#form-receta").addEventListener("input", () => {
    clearTimeout(temporizadorPreview);
    temporizadorPreview = setTimeout(() => {
      if (leerIngredientesFormulario().some(i => i.ml)) vistaPrevia();
    }, 400);
  });
  $("#btn-sorprendeme").addEventListener("click", () => mostrarPropuesta("azar"));
  $("#btn-carta-shots").addEventListener("click", renderCartaShots);
  $("#filtro-recetas").addEventListener("input", renderRecetas);
  $("#filtro-posibles").addEventListener("change", renderRecetas);
  $("#form-ajustes").addEventListener("submit", guardarAjustes);
  $("#btn-exportar").addEventListener("click", exportarDatos);
  $("#input-importar").addEventListener("change", importarDatos);

  cambiarSeccion("barra");
});
