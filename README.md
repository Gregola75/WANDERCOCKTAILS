# 🍸 WanderCocktails

Aplicación web para **estandarizar cócteles entre establecimientos**: el mismo cóctel, con el mismo sabor y la misma presentación, salga de la barra que salga.

## El problema que resuelve

Cada negocio tiene cristalería distinta (una copa margarita puede ir de 250 a 430 ml), hielo distinto (cubo de máquina, picado, esferas…) y proveedores distintos. Con la misma receta «de libro», el resultado cambia de un local a otro.

WanderCocktails parte de un **recetario de referencia con proporciones verificadas** y lo **re-escala automáticamente** a la configuración real de cada establecimiento.

## Funcionalidades

### 🥃 Mi barra
- Catálogo de 18 vasos y copas con sus **capacidades habituales verificadas** (rango de mercado + valor de referencia) y **silueta ilustrada** de cada vaso (SVG integrado, funciona offline) para que el bartender lo identifique de un vistazo.
- Cada negocio construye su lista «Mis vasos en uso»: elige del catálogo, ajusta los **ml reales** y añade — puede repetir **el mismo tipo de vaso en varias medidas** (ej. highball de 320 y de 400 ml); las recetas eligen automáticamente el más adecuado. Si la medida queda fuera del rango habitual, la app avisa para que se verifique.
- Tipos de hielo (cubos, picado, frappé, esfera, bloque, columna…) con su **% de desplazamiento ajustable**, porque es el factor que más varía entre negocios. Incluye instrucciones para medirlo con agua.

### 📖 Recetas estandarizadas
- 22 cócteles clásicos (Margarita, Daiquiri, Negroni, Mojito, Piña Colada, Espresso Martini…) con medidas de referencia.
- Cada receta se muestra **ya escalada** al vaso, hielo, % de llenado y dilución del establecimiento:
  `volumen útil = capacidad real × % llenado − desplazamiento del hielo`
  `ingredientes + agua de dilución (según técnica) = volumen útil`
- Si el negocio no tiene el vaso original de la receta, la app propone el más parecido de su barra y lo avisa.

### 🧾 Inventario y costes
- Registro de licores, siropes, zumos y concentrados con precio de compra y contenido → coste por ml.
- **Taxonomía en dos niveles**: 7 categorías (🥃 Destilados, 🍷 Licores, 🍯 Siropes, 🍋 Zumos, 🥭 Concentrados, 🫧 Refrescos, 🌿 Frescos) con subcategorías con los nombres de barra de toda la vida: en Destilados aparecen directamente **Ron, Whisky, Vodka, Tequila, Mezcal, Ginebra, Brandy, Pisco y Cachaça** (y dentro, sus variantes: ron blanco/oscuro/especiado, bourbon/centeno/escocés…); en Licores, los de fruta, dulces, vermuts, aperitivos amargos y espumosos.
- Lista agrupada por categoría con filtros tipo chip, valor de stock por categoría y coste unitario por 100 ml.
- Cada receta muestra su **coste de producción real** ya escalado, el **precio de venta sugerido** (coste × margen configurable) y el % de coste sobre PVP.

### 🎚️ Indicador de sabor y método (en cada receta)
Cada cóctel — clásico, propio o en el editor mientras lo escribes — muestra su **perfil de sabor calculado** sobre el volumen final (ya escalado y diluido):

- **Fuerza**: % de alcohol en el vaso (suave → muy fuerte)
- **Dulzor**: gramos de azúcar por 100 ml
- **Acidez**: gramos de ácido por 100 ml

Con un **veredicto de equilibrio** según la regla de oro: equilibrado ✓, cítrico y fresco ✓ (perfil margarita), agridulce ✓ (el amargor compensa), cremoso tropical ✓, seco espirituoso ✓… o aviso ⚠ si domina el ácido o el dulce, con la corrección sugerida.

Y la **recomendación de método** de elaboración: *lo turbio se agita, lo transparente se remueve y la burbuja nunca se agita*. Si la técnica elegida no es la idónea, la app sugiere la correcta (con la excepción de barra: macerados y combinados construidos sobre hielo). En «Crear receta» el indicador se actualiza **en vivo** mientras escribes las medidas.

### 🧪 Inventar — el asistente con las reglas de oro
Cada tipo de ingrediente tiene asignado un **rol coctelero** (base alcohólica, dulce, ácido, alargador, textura, bitter, aperitivo, espumoso…). Sobre esos roles, el asistente aplica las **8 fórmulas de equilibrio** con las que trabajan los bartenders profesionales:

| Familia | Fórmula | Ejemplos clásicos |
|---|---|---|
| 🍋 Sour (la regla de oro) | 2 base : 1 ácido : 1 dulce | Margarita, Daiquiri, Whisky Sour |
| 🫧 Highball | 1 base : 3 alargador | Gin Tonic, Paloma, Moscow Mule |
| 🥃 Ancestral | base + pizca de dulce + bitters | Old Fashioned, Sazerac |
| 🍸 Estilo Martini | 2-3 base : 1 vermut/aperitivo | Dry Martini, Manhattan, Negroni |
| 🍹 Spritz | 3 aperitivo : 2 espumoso : 1 soda | Aperol Spritz, Hugo |
| 🗿 Tiki | base partida + ácido + sirope + fruta | Mai Tai, Zombie |
| 🥥 Frozen / Cremoso | base + textura + fruta, batido | Piña Colada |
| 🥭 Sour de fruta | sour 2:1:1 + puré intenso | Margarita de maracuyá, Mango Sour |

El generador propone cócteles nuevos **solo con los productos del inventario del negocio**, ya escalados a su cristalería y con coste calculado; muestra qué producto concreto cubre cada rol, permite pedir «otra versión» y guardar la propuesta en «Mis recetas». Si falta un rol (p. ej. no hay espumoso), indica exactamente qué comprar para desbloquear esa familia entera. Todo funciona **sin IA externa**: es un motor de reglas de coctelería, sin API ni conexión.

### 🔍 ¿Qué puedo crear?
- Cruza el recetario (clásicos + creaciones propias) con el inventario del negocio.
- Lista los cócteles **listos para servir** y los que están a **un solo ingrediente** de distancia (sugerencia de compra).

### ✨ Crear receta y personalizar clásicos
- Editor de creaciones propias (ingredientes en ml, dashes o unidades, técnica, hielo, vaso) con **vista previa escalada** y coste en tiempo real.
- Botón **«Personalizar con mis marcas»** en cualquier clásico o chupito: se carga en el editor, se le asigna la marca concreta del inventario a cada ingrediente (ej. *tu* ron) y se guarda como receta de la casa sin tocar el original. El coste usa el precio de la marca elegida (o la más económica si no se fija).
- Las recetas propias se pueden **editar** después.

### 🔥 Carta de chupitos
- 10 shots famosos (B-52, Kamikaze, Lemon Drop, Baby Guinness, Cerebrito, Bandera Mexicana, Cucaracha…) escalados al caballito real del negocio.
- En los chupitos **en capas (pousse-café)**, la app calcula el **orden de vertido por densidad** (más azúcar = más denso = abajo); el orden del B-52 calculado coincide con el real: café → crema irlandesa → triple sec.
- Dos plantillas nuevas en «Inventar»: chupito en capas y chupito cítrico (mini sour), para crear la carta de shots de la casa con el inventario propio.

### 🔥 Generador de carta de chupitos
En «Inventar», un clic genera **decenas de chupitos nuevos** combinando el inventario del negocio con patrones probados, clasificados por intensidad real (graduación final calculada):

- 🍑 **Suaves** (< 15º): licor + fruta — los más rentables, para rondas grandes
- ⚡ **Medios** (15-25º): mini sours estilo kamikaze — los más vendidos
- 🔥 **Fuertes** (> 25º): capas vistosas y tragos secos

Cada grupo se ordena por rentabilidad (menor coste primero) y muestra graduación, coste, PVP y ganancia por unidad. Cualquier propuesta se guarda en la carta con un clic.

### 🥶 Frozen y cócteles con helado que no se aguan
Las reglas físicas del frozen están codificadas en la app:

1. **Alcohol máx. 20-24 % del líquido** — el alcohol no congela; pasarse es la causa nº 1 de frozen aguados
2. **Dulzor +25 % vs. la versión fría** (el frío apaga el sabor; objetivo 10-14 g/100 ml)
3. **Hielo 1,7× el líquido** en frozen clásico; **sin hielo** si lleva helado (el helado es el hielo)
4. **Cuerpo mínimo 15-20 %** (puré, crema, plátano o helado) para que no quede granizado
5. **Todo frío y batido corto** a máxima potencia

Toda receta batida muestra el panel **«Control frozen»**: % real de alcohol en el líquido, avisos si algo va a salir aguado o soso, y los **gramos exactos de hielo** para batir. Incluye técnica nueva «Batido con helado», plantilla 🍨 en el asistente, ingredientes helado de vainilla y plátano, y 3 clásicos nuevos: Frozen Margarita, Frozen Daiquiri de Fresa y Mudslide con helado.

### 💰 Ofertas rentables
- Creador de promociones sobre el **coste real**: 2×1, happy hour (% descuento), precio cerrado y combos de 2 cócteles.
- Cada oferta muestra ingreso, coste de producción, margen por venta y **semáforo de rentabilidad**: verde (coste ≤ 35 %), ámbar (≤ 50 %, para horas valle), rojo (pierdes margen).
- Sugerencias automáticas según tu margen: descuento máximo que aguanta el 35 % de coste, coste real de un 2×1 y los cócteles más baratos de producir (ideales para 2×1).

### 👨‍🍳 Dos capas: modo máster y modo barra
Pensado para el modelo real de un local: **el dueño (máster) crea y controla todo; el bartender solo ejecuta**.

- **Modo máster** 🔓: acceso completo — barra, inventario, costes, recetas, ofertas, ajustes.
- **Modo barra** 🔒: la app queda bloqueada como **guía de aprendizaje** para el equipo. Solo se ven las recetas, **sin costes, sin precios y sin botones de edición**. Nada se puede modificar.
- El cambio se hace con un botón en la cabecera; volver al modo máster exige el **PIN** que el dueño configura en Ajustes. (Es un bloqueo de uso en barra, no un sistema de seguridad: los datos viven en el navegador.)

### 📋 Ficha de preparación (estación del bartender)
Cada receta tiene el botón **«Ficha de preparación»**: una ficha a pantalla completa, con letra grande, pensada para aprender y ejecutar en barra:

1. Vaso (con la capacidad real del local y si hay que enfriarlo)
2. Hielo (tipo y ml que debe ocupar)
3. Medidas exactas en orden — en los chupitos de capas, **en orden de densidad**, y con la **marca obligatoria** si el máster la fijó
4. Elaboración con tiempos (agitar 12-15 s, remover 20-30 s, gramos de hielo si es frozen…)
5. Decoración y servicio, más la nota del máster

### ⚙️ Ajustes y multi-establecimiento
- % de llenado del vaso, margen de beneficio, moneda y dilución por técnica (agitado, removido, directo, batido).
- **Exportar / importar la configuración completa** en JSON: la central define vasos, hielos, recetas e inventario y la distribuye a todos sus locales para que todos sirvan exactamente igual.

### 📲 App instalable (PWA) con modo offline
- Se **instala como app** en el móvil o la tablet del local (botón «Instalar app» en la cabecera, o desde el menú del navegador) sin pasar por tiendas de aplicaciones.
- **Funciona sin internet**: un service worker cachea la app completa, así la guía del bartender nunca se cae en plena barra. Las actualizaciones se descargan solas en segundo plano cuando hay conexión.
- Icono propio y pantalla completa sin barra de navegador (`display: standalone`).
- Requisito: servirse por **HTTPS** (GitHub Pages lo cumple). Al publicar cambios, subir la versión de `CACHE` en `sw.js`.

### 🌩 Base de datos en la nube (Firebase, opcional)
- En Ajustes se pega el bloque `firebaseConfig` del proyecto de Firebase del negocio y se crea una cuenta (email + contraseña).
- A partir de ahí **todos los dispositivos con sesión iniciada comparten los datos en tiempo real**: vasos, inventario, recetas, ofertas, fotos y PIN. El modo máster/barra sigue siendo por dispositivo.
- Funciona offline (caché persistente de Firestore): los cambios se suben al volver la conexión. Conflictos: gana la última escritura.
- Estructura en Firestore: `negocios/{uid}` (configuración, con contador de revisión) y `negocios/{uid}/fotos/{recetaId}` (una foto por documento).
- Reglas de seguridad recomendadas (cada cuenta solo accede a lo suyo):

```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /negocios/{uid} {
      allow read, write: if request.auth != null && request.auth.uid == uid;
      match /fotos/{foto} {
        allow read, write: if request.auth != null && request.auth.uid == uid;
      }
    }
  }
}
```

- Sin configuración de nube, la app funciona 100 % local como siempre.

## Uso

No requiere instalación ni servidor: es una aplicación 100 % cliente.

```bash
# Opción 1: abrir directamente
open index.html

# Opción 2: servir en local
python3 -m http.server 8000
# → http://localhost:8000
```

Los datos se guardan en el `localStorage` del navegador. Usa **Exportar configuración** como copia de seguridad o para compartir entre locales.

También puede publicarse tal cual en GitHub Pages (Settings → Pages → rama principal).

## Estructura

```
index.html             Interfaz (7 secciones + modo barra)
css/styles.css         Estilos (tema oscuro de bar)
js/data.js             Catálogos: vasos, hielos, técnicas, ingredientes, recetas, plantillas
js/app.js              Motor de escalado, sabor, costes, ofertas, generadores y UI
manifest.webmanifest   Manifiesto PWA (instalación como app)
sw.js                  Service worker (funcionamiento offline)
icons/                 Iconos de la app (generados con tools/gen-icons.mjs)
```

## Verificación automática

`node tools/verificar.mjs` ejecuta 600+ comprobaciones sobre el código REAL de la app (extrae las funciones de app.js, no copias): integridad de datos (tipos↔perfiles, vasos↔siluetas, recetas↔referencias), motor de escalado (proporciones exactas, test del agua del hielo, dilución), costes e IVA, reglas de oro (veredicto, método, colado, técnica automática, frozen, orden de capas), y estructura (IDs↔HTML, secciones del menú, funciones de listeners, campos sincronizados, app shell del service worker). Ejecutar tras cada cambio.

## Modelo de cálculo

| Concepto | Cálculo |
|---|---|
| Volumen útil | `capacidad vaso × % llenado − capacidad × % desplazamiento hielo` |
| Factor de escala | `volumen útil ÷ (líquidos de la receta base × (1 + % dilución))` |
| Coste | `Σ (ml escalados × €/ml del producto más económico de ese tipo)` |
| Precio sugerido | `coste × margen` |

1 dash ≈ 0,9 ml. Los dashes y unidades (hojas de menta, etc.) se redondean a valores prácticos para barra.
