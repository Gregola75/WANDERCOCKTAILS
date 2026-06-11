/* =========================================================
   WANDERCOCKTAILS — Sincronización en la nube (Firebase)
   - Auth con email/contraseña (una cuenta por negocio)
   - Firestore: negocios/{uid} (configuración) y
     negocios/{uid}/fotos/{recetaId} (fotos, 1 doc por foto)
   - Tiempo real con onSnapshot + caché offline persistente
   - Si no hay configuración de nube, la app sigue 100% local
   ========================================================= */

const NUBE_SDK = "https://www.gstatic.com/firebasejs/10.12.2/";
// Campos del estado que viajan a la nube (las fotos van aparte;
// el modo máster/barra es propio de cada dispositivo)
const CAMPOS_SYNC = [
  "nombreNegocio", "misVasos", "hielos", "diluciones", "llenadoPct",
  "margen", "moneda", "inventario", "recetasPropias", "ofertas",
  "pinMaster", "rev",
];

const nube = {
  listo: false, user: null, db: null, auth: null,
  fs: null, authM: null, timer: null, unsub: [], fotoMeta: {},
};
window.__nubeRemoto = false; // evita re-subir lo que acaba de llegar

async function nubeInit() {
  const cfg = estado.nubeConfig;
  nubeUi();
  if (!cfg) return;
  try {
    const [appM, authM, fsM] = await Promise.all([
      import(NUBE_SDK + "firebase-app.js"),
      import(NUBE_SDK + "firebase-auth.js"),
      import(NUBE_SDK + "firebase-firestore.js"),
    ]);
    const app = appM.initializeApp(cfg);
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
    authM.onAuthStateChanged(nube.auth, u => {
      nube.user = u;
      nube.unsub.forEach(f => f());
      nube.unsub = [];
      if (u) nubeEscuchar();
      nubeUi();
    });
  } catch (e) {
    console.warn("Nube no disponible:", e);
    nubeUi("No se pudo cargar Firebase (revisa la conexión o la configuración). La app sigue funcionando en local.");
  }
}

// ---------- Escucha en tiempo real ----------
function nubeEscuchar() {
  const { doc, collection, onSnapshot } = nube.fs;
  const refDoc = doc(nube.db, "negocios", nube.user.uid);

  nube.unsub.push(onSnapshot(refDoc, snap => {
    if (snap.metadata.hasPendingWrites) return;
    const datos = snap.data();
    if (!datos) { nubeProgramarSubida(100); return; } // primera vez: sube lo local
    if ((datos.rev || 0) <= (estado.rev || 0)) return;
    window.__nubeRemoto = true;
    CAMPOS_SYNC.forEach(c => { if (datos[c] !== undefined && datos[c] !== null) estado[c] = datos[c]; });
    guardarEstado();
    window.__nubeRemoto = false;
    actualizarCabecera();
    cambiarSeccion(seccionActual);
    nubeUi("✓ Actualizado desde la nube");
  }, e => nubeUi("Error de lectura: " + e.code)));

  nube.unsub.push(onSnapshot(collection(nube.db, "negocios", nube.user.uid, "fotos"), snap => {
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
  if (!nube.user) return;
  clearTimeout(nube.timer);
  nube.timer = setTimeout(nubeSubir, ms);
}

async function nubeSubir() {
  if (!nube.user) return;
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

async function nubeSalir() {
  if (nube.authM && nube.auth) await nube.authM.signOut(nube.auth);
  nubeUi();
}

// ---------- Configuración pegada desde la consola de Firebase ----------
function nubeGuardarConfig() {
  const texto = $("#nube-config").value;
  const ini = texto.indexOf("{");
  const fin = texto.lastIndexOf("}");
  if (ini < 0 || fin < ini) { nubeUi("Pega el bloque completo, con sus llaves { }."); return; }
  let cfg;
  try {
    cfg = Function('"use strict"; return (' + texto.slice(ini, fin + 1) + ")")();
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
  const cfg = estado.nubeConfig;
  $("#nube-paso-config").style.display = cfg ? "none" : "";
  $("#nube-paso-login").style.display = cfg && nube.listo && !nube.user ? "" : "none";
  $("#nube-paso-sesion").style.display = cfg && nube.user ? "" : "none";
  if (mensaje) elEstado.textContent = mensaje;
  else if (!cfg) elEstado.textContent = "Sin configurar: la app funciona solo en este dispositivo.";
  else if (!nube.listo) elEstado.textContent = "Cargando Firebase…";
  else if (!nube.user) elEstado.textContent = "Configurada. Inicia sesión para sincronizar.";
  else elEstado.textContent = "🟢 Conectado como " + (nube.user.email || "") + " — todo se sincroniza solo.";
}

document.addEventListener("DOMContentLoaded", () => {
  $("#btn-nube-config").addEventListener("click", nubeGuardarConfig);
  $("#btn-nube-entrar").addEventListener("click", () => nubeAcceder(false));
  $("#btn-nube-crear").addEventListener("click", () => nubeAcceder(true));
  $("#btn-nube-salir").addEventListener("click", nubeSalir);
  $("#btn-nube-quitar").addEventListener("click", nubeQuitarConfig);
  nubeInit();
});
