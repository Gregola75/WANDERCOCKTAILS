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
  "pinMaster", "equipo", "ocultas", "rev",
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
    nube.auth.languageCode = "es"; // correos de recuperación en español
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

// Conectar el dispositivo al negocio desde la pantalla de entrada
// (solo la primera vez, con el correo del máster). Al conectar, vuelve
// a la pantalla de elección para que cada uno entre con su PIN.
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
    $("#entrada-email").value = "";
    mostrarEntrada("opciones"); // dispositivo conectado: ahora cada uno entra con su PIN
  } catch (e) {
    error.textContent = ERRORES_AUTH[e.code] || "Error: " + (e.code || e.message);
  } finally {
    $("#btn-entrada-login").disabled = false;
  }
}

// Recuperar contraseña: Firebase envía un correo para crear una nueva.
// Los datos no se pierden: viven en la cuenta, no en la contraseña.
async function nubeRecuperarPass(origen) {
  const inpEmail = origen === "ajustes" ? $("#nube-email") : $("#entrada-email");
  const salida = origen === "ajustes" ? null : $("#entrada-login-error");
  const aviso = txt => { if (salida) salida.textContent = txt; else nubeUi(txt); };
  const email = inpEmail.value.trim();
  if (!email || !email.includes("@")) {
    aviso("Escribe arriba tu correo y vuelve a tocar «¿Olvidaste la contraseña?».");
    return;
  }
  try {
    for (let i = 0; i < 40 && !nube.listo; i++) await new Promise(r => setTimeout(r, 200));
    if (!nube.listo) { aviso("Sin conexión con la nube. Inténtalo de nuevo."); return; }
    await nube.authM.sendPasswordResetEmail(nube.auth, email);
    aviso("📬 Enviado: revisa el correo de " + email + " (mira también en spam) y sigue el enlace para crear una contraseña nueva. Tus datos no se pierden.");
  } catch (e) {
    aviso(e.code === "auth/user-not-found"
      ? "No existe ninguna cuenta con ese correo."
      : ERRORES_AUTH[e.code] || "Error: " + (e.code || e.message));
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
  if (mensaje) elEstado.textContent = mensaje;
  else if (!cfg) elEstado.textContent = "Sin configurar: la app funciona solo en este dispositivo.";
  else if (!nube.listo) elEstado.textContent = "Cargando Firebase…";
  else if (!nube.user) elEstado.textContent = "Configurada. Inicia sesión para sincronizar.";
  else elEstado.textContent = "🟢 Conectado — el negocio se sincroniza solo en todos los dispositivos.";
}

document.addEventListener("DOMContentLoaded", () => {
  $("#btn-nube-config").addEventListener("click", nubeGuardarConfig);
  $("#btn-nube-entrar").addEventListener("click", () => nubeAcceder(false));
  $("#btn-nube-crear").addEventListener("click", () => nubeAcceder(true));
  $("#btn-nube-salir").addEventListener("click", nubeSalir);
  $("#btn-nube-quitar").addEventListener("click", nubeQuitarConfig);
  $("#btn-entrada-login").addEventListener("click", nubeAccederEntrada);
  $("#entrada-pass").addEventListener("keydown", ev => { if (ev.key === "Enter") nubeAccederEntrada(); });
  $("#btn-volver-login").addEventListener("click", () => mostrarEntrada("opciones"));
  $("#btn-olvido-pass").addEventListener("click", () => nubeRecuperarPass("entrada"));
  $("#btn-olvido-pass-aj").addEventListener("click", () => nubeRecuperarPass("ajustes"));
  nubeInit();
});
