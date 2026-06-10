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
- Cada receta muestra su **coste de producción real** ya escalado, el **precio de venta sugerido** (coste × margen configurable) y el % de coste sobre PVP.

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
