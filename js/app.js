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
  return RECETAS_CLASICAS.concat(estado.recetasPropias);
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
    const c = costes[i.tipo];
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

function cambiarSeccion(id) {
  $$("nav button").forEach(b => b.classList.toggle("activo", b.dataset.sec === id));
  $$(".seccion").forEach(s => s.classList.toggle("activa", s.id === "sec-" + id));
  if (id === "barra") renderBarra();
  if (id === "inventario") renderInventario();
  if (id === "recetas") renderRecetas();
  if (id === "crear") renderCrear();
  if (id === "inventar") renderInventar();
  if (id === "descubrir") renderDescubrir();
  if (id === "ajustes") renderAjustes();
}

// Opciones <select> de tipos agrupadas por categoría · subcategoría
function opcionesTiposHtml(soloCat) {
  const tipos = TIPOS_INGREDIENTE.filter(t => !soloCat || t.cat === soloCat);
  let grupo = "", html = "";
  tipos.forEach(t => {
    const g = t.cat + " · " + t.sub;
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
          <td><span class="tag">${esc(t.sub)}</span> <span class="tag tag-oro">${esc(t.nombre)}</span></td>
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

// ---------- Recetas ----------
function tarjetaReceta(receta, opciones = {}) {
  const e = escalarReceta(receta);
  const c = costeReceta(e);
  const disp = analizarDisponibilidad(receta);
  const vReal = vasoPorId(e.vasoUsado);
  const h = hieloPorId(e.hieloUsado);
  const tec = tecnicaPorId(receta.tecnica);

  const lineas = e.ingredientes.map(i =>
    `<div class="ing-linea"><span>${esc(i.nombreTipo)}</span><span class="cant">${i.texto}</span></div>`
  ).join("");

  const precioSugerido = c.total * estado.margen;
  const costeHtml = c.completo
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
      <p class="meta">
        Volumen servido: <b>${Math.round(e.volFinal)} ml</b> de líquido
        ${e.despPct ? `+ hielo (vaso lleno al ${estado.llenadoPct} %)` : `(${estado.llenadoPct} % del vaso)`}
        ${c.completo ? ` · Precio sugerido (coste × ${estado.margen}): <b>${fmtDinero(precioSugerido)}</b> · Coste = ${precioSugerido > 0 ? Math.round(c.total / precioSugerido * 100) : 0}% del PVP` : ""}
      </p>
      ${receta.decoracion ? `<p class="meta">🍋 ${esc(receta.decoracion)}</p>` : ""}
      ${receta.pasos ? `<p class="pasos">${esc(receta.pasos)}</p>` : ""}
      <div>${dispTag}</div>
      ${opciones.propia ? `<div><button class="btn btn-peligro btn-mini" data-borrar-receta="${receta.id}">Eliminar receta</button></div>` : ""}
    </div>`;
}

function renderRecetas() {
  const filtro = $("#filtro-recetas").value.toLowerCase();
  const soloPosibles = $("#filtro-posibles").checked;

  const filtrar = lista => lista.filter(r => {
    if (filtro && !r.nombre.toLowerCase().includes(filtro)) return false;
    if (soloPosibles && !analizarDisponibilidad(r).posibles) return false;
    return true;
  });

  const propias = filtrar(estado.recetasPropias);
  const clasicas = filtrar(RECETAS_CLASICAS);

  $("#recetas-propias-bloque").style.display = estado.recetasPropias.length ? "" : "none";
  $("#lista-recetas-propias").innerHTML = propias.length
    ? propias.map(r => tarjetaReceta(r, { propia: true })).join("")
    : `<p class="vacio">Ninguna receta propia coincide con el filtro.</p>`;
  $("#lista-recetas").innerHTML = clasicas.length
    ? clasicas.map(r => tarjetaReceta(r)).join("")
    : `<p class="vacio">Ninguna receta coincide con el filtro.</p>`;

  $$("#sec-recetas [data-borrar-receta]").forEach(b => {
    b.addEventListener("click", () => {
      if (!confirm("¿Eliminar esta receta propia?")) return;
      estado.recetasPropias = estado.recetasPropias.filter(r => r.id !== b.dataset.borrarReceta);
      guardarEstado(); renderRecetas();
    });
  });
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
      <button type="button" class="btn btn-peligro btn-mini quitar-ing">✕</button>
    </div>`;
}

function renderCrear() {
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
  activarBotonesQuitar();
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
    if (!tipo || !(cant > 0)) return null;
    if (unidad === "ml") return { tipo, ml: cant };
    if (unidad === "dash") return { tipo, dash: cant };
    return { tipo, ud: cant };
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
  estado.recetasPropias.push({
    id: "propia-" + Date.now(),
    nombre,
    vaso: $("#nr-vaso").value,
    tecnica: $("#nr-tecnica").value,
    hielo: $("#nr-hielo").value,
    ingredientes,
    decoracion: $("#nr-decoracion").value.trim(),
    pasos: $("#nr-pasos").value.trim(),
  });
  guardarEstado();
  $("#form-receta").reset();
  $("#nr-ingredientes").innerHTML = "";
  $("#vista-previa").innerHTML = "";
  renderCrear();
  cambiarSeccion("recetas");
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
    cambiarSeccion("recetas");
  });
  $("#btn-otra-propuesta").addEventListener("click", () => mostrarPropuesta(prop.plantilla.id));
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

// ---------- Ajustes ----------
function renderAjustes() {
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
  $("#nombre-negocio").textContent = estado.nombreNegocio
    ? " · " + estado.nombreNegocio
    : "";
}

// ---------- Inicio ----------
document.addEventListener("DOMContentLoaded", () => {
  cargarEstado();
  actualizarCabecera();

  $$("nav button").forEach(b => b.addEventListener("click", () => cambiarSeccion(b.dataset.sec)));
  $("#form-inventario").addEventListener("submit", agregarInventario);
  $("#form-receta").addEventListener("submit", guardarRecetaNueva);
  $("#btn-add-ing").addEventListener("click", () => {
    $("#nr-ingredientes").insertAdjacentHTML("beforeend", filaIngredienteHtml());
    activarBotonesQuitar();
  });
  $("#btn-preview").addEventListener("click", vistaPrevia);
  $("#btn-sorprendeme").addEventListener("click", () => mostrarPropuesta("azar"));
  $("#filtro-recetas").addEventListener("input", renderRecetas);
  $("#filtro-posibles").addEventListener("change", renderRecetas);
  $("#form-ajustes").addEventListener("submit", guardarAjustes);
  $("#btn-exportar").addEventListener("click", exportarDatos);
  $("#input-importar").addEventListener("change", importarDatos);

  cambiarSeccion("barra");
});
