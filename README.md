# 🍸 WanderCocktails

Aplicación web para **estandarizar cócteles entre establecimientos**: el mismo cóctel, con el mismo sabor y la misma presentación, salga de la barra que salga.

## El problema que resuelve

Cada negocio tiene cristalería distinta (una copa margarita puede ir de 250 a 430 ml), hielo distinto (cubo de máquina, picado, esferas…) y proveedores distintos. Con la misma receta «de libro», el resultado cambia de un local a otro.

WanderCocktails parte de un **recetario de referencia con proporciones verificadas** y lo **re-escala automáticamente** a la configuración real de cada establecimiento.

## Funcionalidades

### 🥃 Mi barra
- Catálogo de 18 vasos y copas de coctelería con sus **capacidades habituales verificadas** (rango de mercado + valor de referencia).
- Cada negocio marca los vasos que usa y ajusta la **capacidad real en ml** (ej.: copa margarita de 430 ml). Si la medida queda fuera del rango habitual, la app avisa para que se verifique.
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

### ✨ Crear receta
- Editor de creaciones propias (ingredientes en ml, dashes o unidades, técnica, hielo, vaso) con **vista previa escalada** y coste en tiempo real.
- Las creaciones se estandarizan igual que los clásicos.

### ⚙️ Ajustes y multi-establecimiento
- % de llenado del vaso, margen de beneficio, moneda y dilución por técnica (agitado, removido, directo, batido).
- **Exportar / importar la configuración completa** en JSON: la central define vasos, hielos, recetas e inventario y la distribuye a todos sus locales para que todos sirvan exactamente igual.

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
index.html        Interfaz (6 secciones)
css/styles.css    Estilos (tema oscuro de bar)
js/data.js        Catálogos: vasos, hielos, técnicas, ingredientes, recetario clásico
js/app.js         Motor de escalado, costes, disponibilidad y UI
```

## Modelo de cálculo

| Concepto | Cálculo |
|---|---|
| Volumen útil | `capacidad vaso × % llenado − capacidad × % desplazamiento hielo` |
| Factor de escala | `volumen útil ÷ (líquidos de la receta base × (1 + % dilución))` |
| Coste | `Σ (ml escalados × €/ml del producto más económico de ese tipo)` |
| Precio sugerido | `coste × margen` |

1 dash ≈ 0,9 ml. Los dashes y unidades (hojas de menta, etc.) se redondean a valores prácticos para barra.
