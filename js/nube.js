/* =========================================================
   WANDERCOCKTAILS — Sincronización en la nube (Firebase)
   - Auth con email/contraseña (una cuenta por negocio)
   - Firestore: negocios/{uid} (configuración) y
     negocios/{uid}/fotos/{recetaId} (fotos, 1 doc por foto)
   - Tiempo real con onSnapshot + caché offline persistente
   - Si no hay configuración de nube, la app sigue 100% local
   ========================================================= */

const NUBE_SDK = "https://www.gstatic.com/firebasejs/10.12.2/";

// Configuración por defecto del negocio: integrada para que ningún
// dispositivo tenga que pegarla. Es config pública de cliente (la
// protección real son las reglas de Firestore y las contraseñas).
const NUBE_CONFIG_DEFECTO = {
  apiKey: "AIzaSyAxFyZvoK0rKP5bxqvGStsYoEsbugHlDPI",
  authDomain: "wandercoctel.firebaseapp.com",
  projectId: "wandercoctel",
  storageBucket: "wandercoctel.firebasestorage.app",
  messagingSenderId: "641950578392",
  appId: "1:641950578392:web:929c5f8d6a357d732ac9ad",
};
const nubeConfigActiva = () => estado.nubeConfig || NUBE_CONFIG_DEFECTO;
// Campos del estado que viajan a la nube (las fotos van aparte;
// el modo máster/barra es propio de cada dispositivo)
const CAMPOS_SYNC = [
  "nombreNegocio", "misVasos", "hielos", "diluciones", "llenadoPct",
  "margen", "moneda", "inventario", "recetasPropias", "ofertas",
  "pinMaster", "equipo", "rev",
];

const nube = {
  listo: false, user: null, db: null, auth: null,
  fs: null, authM: null, timer: null, unsub: [], fotoMeta: {},
  rol: null,        // "master" (dueño del negocio) | "bartender" (solo lectura)
  negocioId: null,  // uid del negocio cuyos datos se leen
};
nube.authPromesa = new Promise(res => { nube._resAuth = res; });
// Para la pantalla de entrada: ¿hay nube y hace falta iniciar sesión?
window.nubeEsperarAuth = () => Promise.race([
  nube.authPromesa,
  new Promise(res => setTimeout(res, 6000)),
]);
window.nubeHayUsuario = () => !!nube.user;
window.nubeHayConfig = () => !!nubeConfigActiva();
window.__rolNube = null;
window.__nubeRemoto = false; // evita re-subir lo que acaba de llegar

async function nubeInit() {
  const cfg = nubeConfigActiva();
  nubeUi();
  if (!cfg) { nube._resAuth && nube._resAuth(); return; }
  try {
    const [appM, authM, fsM] = await Promise.all([
      import(NUBE_SDK + "firebase-app.js"),
      import(NUBE_SDK + "firebase-auth.js"),
      import(NUBE_SDK + "firebase-firestore.js"),
    ]);
    const app = appM.initializeApp(cfg);
    nube.appM = appM;
    nube.cfg = cfg;
    nube.auth = authM.getAuth(app);
    try {
      nube.db = fsM.initializeFirestore(app, {
        localCache: fsM.persistentLocalCache({ tabManager: fsM.persistentMultipleTabManager() }),
      });
    } catch (e) {
      nube.db = fsM.getFirestore(app);
    }
    nube.fs = fsM;
    nube.authM = authM;
    nube.listo = true;
    try { nube.fotoMeta = JSON.parse(localStorage.getItem("wc-nube-fotos") || "{}"); } catch (e) { nube.fotoMeta = {}; }
    authM.onAuthStateChanged(nube.auth, async u => {
      nube.user = u;
      nube.unsub.forEach(f => f());
      nube.unsub = [];
      if (u) {
        await nubeDetectarRol();
        nubeEscuchar();
      } else {
        nube.rol = null;
        nube.negocioId = null;
        window.__rolNube = null;
      }
      nubeUi();
      aplicarModo();
      nube._resAuth && nube._resAuth();
    });
  } catch (e) {
    console.warn("Nube no disponible:", e);
    nubeUi("No se pudo cargar Firebase (revisa la conexión o la configuración). La app sigue funcionando en local.");
    nube._resAuth && nube._resAuth();
  }
}

// ---------- Rol: máster (dueño) o bartender (asignado por correo) ----------
async function nubeDetectarRol() {
  const { doc, getDoc } = nube.fs;
  nube.rol = "master";
  nube.negocioId = nube.user.uid;
  try {
    const email = (nube.user.email || "").toLowerCase();
    const acc = await getDoc(doc(nube.db, "accesos", email));
    if (acc.exists() && acc.data().negocioId) {
      nube.rol = "bartender";
      nube.negocioId = acc.data().negocioId;
    }
  } catch (e) { /* sin acceso: queda como master de su propio espacio */ }
  window.__rolNube = nube.rol;
  if (nube.rol === "bartender" && estado.modo !== "barra") {
    estado.modo = "barra";
    window.__nubeRemoto = true;
    guardarEstado();
    window.__nubeRemoto = false;
  }
}

// ---------- Escucha en tiempo real ----------
function nubeEscuchar() {
  const { doc, collection, onSnapshot } = nube.fs;
  const refDoc = doc(nube.db, "negocios", nube.negocioId);

  nube.unsub.push(onSnapshot(refDoc, snap => {
    if (snap.metadata.hasPendingWrites) return;
    const datos = snap.data();
    if (!datos) {
      if (nube.rol === "master") nubeProgramarSubida(100); // primera vez: sube lo local
      return;
    }
    if ((datos.rev || 0) <= (estado.rev || 0) && nube.rol === "master") return;
    if ((datos.rev || 0) === (estado.rev || 0)) return;
    window.__nubeRemoto = true;
    CAMPOS_SYNC.forEach(c => {
      if (c === "pinMaster" && nube.rol === "bartender") return; // el PIN no baja a bartenders
      if (datos[c] !== undefined && datos[c] !== null) estado[c] = datos[c];
    });
    guardarEstado();
    window.__nubeRemoto = false;
    actualizarCabecera();
    cambiarSeccion(seccionActual);
    nubeUi("✓ Actualizado desde la nube");
  }, e => nubeUi("Error de lectura: " + (e.code || e.message))));

  nube.unsub.push(onSnapshot(collection(nube.db, "negocios", nube.negocioId, "fotos"), snap => {
    let cambio = false;
    snap.docChanges().forEach(ch => {
      if (ch.doc.metadata.hasPendingWrites) return;
      if (ch.type === "removed") {
        delete estado.fotos[ch.doc.id];
        delete nube.fotoMeta[ch.doc.id];
        cambio = true;
      } else {
        const d = ch.doc.data().d;
        if (d && estado.fotos[ch.doc.id] !== d) {
          estado.fotos[ch.doc.id] = d;
          nube.fotoMeta[ch.doc.id] = d.length;
          cambio = true;
        }
      }
    });
    if (cambio) {
      window.__nubeRemoto = true;
      guardarEstado();
      window.__nubeRemoto = false;
      localStorage.setItem("wc-nube-fotos", JSON.stringify(nube.fotoMeta));
      cambiarSeccion(seccionActual);
    }
  }));
}

// ---------- Subida (con espera para agrupar cambios) ----------
function nubeProgramarSubida(ms = 1200) {
  if (!nube.user || nube.rol !== "master") return;
  clearTimeout(nube.timer);
  nube.timer = setTimeout(nubeSubir, ms);
}

async function nubeSubir() {
  if (!nube.user || nube.rol !== "master") return;
  try {
    const { doc, setDoc, deleteDoc } = nube.fs;
    const datos = {};
    CAMPOS_SYNC.forEach(c => { datos[c] = estado[c] ?? null; });
    await setDoc(doc(nube.db, "negocios", nube.user.uid), datos);

    // Fotos: una a una (límite de tamaño por documento)
    for (const [id, data] of Object.entries(estado.fotos || {})) {
      if (nube.fotoMeta[id] !== data.length) {
        await setDoc(doc(nube.db, "negocios", nube.user.uid, "fotos", id), { d: data });
        nube.fotoMeta[id] = data.length;
      }
    }
    for (const id of Object.keys(nube.fotoMeta)) {
      if (!estado.fotos || !estado.fotos[id]) {
        await deleteDoc(doc(nube.db, "negocios", nube.user.uid, "fotos", id));
        delete nube.fotoMeta[id];
      }
    }
    localStorage.setItem("wc-nube-fotos", JSON.stringify(nube.fotoMeta));
    nubeUi("✓ Sincronizado");
  } catch (e) {
    console.warn("Error al sincronizar:", e);
    nubeUi("Error al sincronizar: " + (e.code || e.message));
  }
}

// ---------- Cuenta ----------
const ERRORES_AUTH = {
  "auth/invalid-credential": "Correo o contraseña incorrectos.",
  "auth/wrong-password": "Contraseña incorrecta.",
  "auth/user-not-found": "No existe una cuenta con ese correo: usa «Crear cuenta».",
  "auth/email-already-in-use": "Ese correo ya tiene cuenta: usa «Iniciar sesión».",
  "auth/weak-password": "La contraseña necesita al menos 6 caracteres.",
  "auth/invalid-email": "El correo no es válido.",
  "auth/network-request-failed": "Sin conexión: inténtalo cuando tengas internet.",
};

async function nubeAcceder(crear) {
  const email = $("#nube-email").value.trim();
  const pass = $("#nube-pass").value;
  if (!email || !pass) { nubeUi("Escribe correo y contraseña."); return; }
  try {
    nubeUi("Conectando…");
    if (crear) await nube.authM.createUserWithEmailAndPassword(nube.auth, email, pass);
    else await nube.authM.signInWithEmailAndPassword(nube.auth, email, pass);
    $("#nube-pass").value = "";
  } catch (e) {
    nubeUi(ERRORES_AUTH[e.code] || "Error: " + e.code);
  }
}

// ---------- Equipo: el máster crea las cuentas de sus bartenders ----------
// Crea el usuario en una instancia secundaria de Firebase para no cerrar
// la sesión del máster, registra su acceso de solo lectura y lo añade al equipo.
async function nubeCrearUsuarioEmpleado(email, pass) {
  const sec = nube.appM.initializeApp(nube.cfg, "alta-" + Date.now());
  try {
    const secAuth = nube.authM.getAuth(sec);
    await nube.authM.createUserWithEmailAndPassword(secAuth, email, pass);
    await nube.authM.signOut(secAuth);
  } finally {
    if (nube.appM.deleteApp) { try { await nube.appM.deleteApp(sec); } catch (e) {} }
  }
}

async function nubeAgregarEquipo() {
  if (nube.rol !== "master") return;
  const inpE = $("#equipo-email");
  const inpP = $("#equipo-pass");
  const email = inpE.value.trim().toLowerCase();
  const pass = inpP.value;
  if (!email || !email.includes("@")) { nubeUi("Escribe un correo válido para el bartender."); return; }
  if (!pass || pass.length < 6) { nubeUi("Ponle una contraseña de al menos 6 caracteres (se la das tú al empleado)."); return; }
  estado.equipo = estado.equipo || [];
  if (estado.equipo.includes(email)) { nubeUi("Ese correo ya está en el equipo."); return; }
  try {
    nubeUi("Creando la cuenta del bartender…");
    // 1. Registrar el acceso de solo lectura (lo escribe el máster)
    const { doc, setDoc } = nube.fs;
    await setDoc(doc(nube.db, "accesos", email), { negocioId: nube.user.uid });
    // 2. Crear la cuenta de acceso del empleado (si no existía ya)
    let aviso = "✓ " + email + " creado. Dale al empleado su correo y la contraseña: solo tiene que iniciar sesión.";
    try {
      await nubeCrearUsuarioEmpleado(email, pass);
    } catch (e) {
      if (e.code === "auth/email-already-in-use") {
        aviso = "✓ " + email + " añadido (ya tenía cuenta; usará su contraseña actual).";
      } else { throw e; }
    }
    estado.equipo.push(email);
    guardarEstado();
    inpE.value = "";
    inpP.value = "";
    nubeUi(aviso);
  } catch (e) {
    nubeUi("No se pudo añadir: " + (e.code || e.message));
  }
}

async function nubeQuitarEquipo(email) {
  if (nube.rol !== "master") return;
  if (!confirm("¿Quitar a " + email + " del equipo? Dejará de ver los datos del negocio.")) return;
  try {
    const { doc, deleteDoc } = nube.fs;
    await deleteDoc(doc(nube.db, "accesos", email));
    estado.equipo = (estado.equipo || []).filter(e => e !== email);
    guardarEstado();
    nubeUi("Quitado del equipo.");
  } catch (e) {
    nubeUi("No se pudo quitar: " + (e.code || e.message));
  }
}

// Inicio de sesión desde la pantalla de entrada (correo del bartender o del máster)
async function nubeAccederEntrada() {
  const email = $("#entrada-email").value.trim();
  const pass = $("#entrada-pass").value;
  const error = $("#entrada-login-error");
  if (!email || !pass) { error.textContent = "Escribe correo y contraseña."; return; }
  error.textContent = "";
  $("#btn-entrada-login").disabled = true;
  try {
    // Esperar a que el SDK esté listo (por si acaba de arrancar)
    for (let i = 0; i < 40 && !nube.listo; i++) await new Promise(r => setTimeout(r, 200));
    if (!nube.listo) { error.textContent = "Sin conexión con la nube. Inténtalo de nuevo."; return; }
    await nube.authM.signInWithEmailAndPassword(nube.auth, email, pass);
    $("#entrada-pass").value = "";
    estado.modo = "barra";
    window.__nubeRemoto = true; guardarEstado(); window.__nubeRemoto = false;
    aplicarModo();
    ocultarEntrada();
  } catch (e) {
    error.textContent = ERRORES_AUTH[e.code] || "Error: " + (e.code || e.message);
  } finally {
    $("#btn-entrada-login").disabled = false;
  }
}

async function nubeSalir() {
  if (nube.authM && nube.auth) await nube.authM.signOut(nube.auth);
  nubeUi();
}

// ---------- Configuración pegada desde la consola de Firebase ----------
// Acepta el snippet completo de la consola (con imports y todo): localiza
// el objeto que sigue a "firebaseConfig" y lo extrae emparejando llaves.
function nubeExtraerConfig(texto) {
  let ini = texto.indexOf("firebaseConfig");
  ini = texto.indexOf("{", ini >= 0 ? ini : 0);
  if (ini < 0) return null;
  let nivel = 0;
  for (let i = ini; i < texto.length; i++) {
    if (texto[i] === "{") nivel++;
    if (texto[i] === "}") {
      nivel--;
      if (nivel === 0) return texto.slice(ini, i + 1);
    }
  }
  return null;
}

function nubeGuardarConfig() {
  const texto = $("#nube-config").value;
  const bloque = nubeExtraerConfig(texto);
  if (!bloque) { nubeUi("Pega el bloque firebaseConfig completo, con sus llaves { }."); return; }
  let cfg;
  try {
    cfg = Function('"use strict"; return (' + bloque + ")")();
  } catch (e) {
    nubeUi("No se pudo leer la configuración. Pega el bloque firebaseConfig tal cual sale en la consola de Firebase.");
    return;
  }
  if (!cfg || !cfg.apiKey || !cfg.projectId || !cfg.appId) {
    nubeUi("Faltan datos (apiKey, projectId, appId). Copia el bloque completo.");
    return;
  }
  estado.nubeConfig = {
    apiKey: cfg.apiKey, authDomain: cfg.authDomain, projectId: cfg.projectId,
    storageBucket: cfg.storageBucket || "", messagingSenderId: cfg.messagingSenderId || "",
    appId: cfg.appId,
  };
  guardarEstado();
  location.reload();
}

function nubeQuitarConfig() {
  if (!confirm("¿Desconectar la nube en este dispositivo? Los datos locales se conservan.")) return;
  estado.nubeConfig = null;
  guardarEstado();
  location.reload();
}

// ---------- UI ----------
function nubeUi(mensaje) {
  const elEstado = $("#nube-estado");
  if (!elEstado) return;
  const cfg = nubeConfigActiva();
  $("#nube-paso-config").style.display = cfg ? "none" : "";
  $("#nube-paso-login").style.display = cfg && nube.listo && !nube.user ? "" : "none";
  $("#nube-paso-sesion").style.display = cfg && nube.user ? "" : "none";
  const esMaster = nube.user && nube.rol === "master";
  $("#nube-equipo").style.display = esMaster ? "" : "none";
  if (esMaster) {
    $("#equipo-lista").innerHTML = (estado.equipo || []).length
      ? estado.equipo.map(e =>
        `<div class="ing-linea"><span>👨‍🍳 ${e}</span><button class="btn btn-peligro btn-mini" data-equipo-quitar="${e}">Quitar</button></div>`).join("")
      : `<p class="vacio">Aún no hay bartenders asignados.</p>`;
  }
  if (mensaje) elEstado.textContent = mensaje;
  else if (!cfg) elEstado.textContent = "Sin configurar: la app funciona solo en este dispositivo.";
  else if (!nube.listo) elEstado.textContent = "Cargando Firebase…";
  else if (!nube.user) elEstado.textContent = "Configurada. Inicia sesión para sincronizar.";
  else if (nube.rol === "bartender") elEstado.textContent = "🟢 Conectado como " + (nube.user.email || "") + " (bartender, solo lectura).";
  else elEstado.textContent = "🟢 Conectado como " + (nube.user.email || "") + " (máster) — todo se sincroniza solo.";
}

document.addEventListener("DOMContentLoaded", () => {
  $("#btn-nube-config").addEventListener("click", nubeGuardarConfig);
  $("#btn-nube-entrar").addEventListener("click", () => nubeAcceder(false));
  $("#btn-nube-crear").addEventListener("click", () => nubeAcceder(true));
  $("#btn-nube-salir").addEventListener("click", nubeSalir);
  $("#btn-nube-quitar").addEventListener("click", nubeQuitarConfig);
  $("#btn-equipo-add").addEventListener("click", nubeAgregarEquipo);
  $("#btn-entrada-login").addEventListener("click", nubeAccederEntrada);
  $("#entrada-pass").addEventListener("keydown", ev => { if (ev.key === "Enter") nubeAccederEntrada(); });
  $("#btn-volver-login").addEventListener("click", () => mostrarEntrada("opciones"));
  $("#equipo-lista").addEventListener("click", ev => {
    const b = ev.target.closest("[data-equipo-quitar]");
    if (b) nubeQuitarEquipo(b.dataset.equipoQuitar);
  });
  nubeInit();
});
