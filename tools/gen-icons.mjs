// Genera los iconos PNG de la PWA (icons/icon-192.png e icons/icon-512.png)
// sin dependencias: dibuja una copa de cóctel sobre fondo oscuro y codifica
// el PNG a mano con zlib. Ejecutar: node tools/gen-icons.mjs
import { deflateSync } from "node:zlib";
import { writeFileSync, mkdirSync } from "node:fs";

const TABLA_CRC = (() => {
  const t = new Uint32Array(256);
  for (let n = 0; n < 256; n++) {
    let c = n;
    for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
    t[n] = c >>> 0;
  }
  return t;
})();

function crc32(buf) {
  let c = 0xffffffff;
  for (const b of buf) c = TABLA_CRC[(c ^ b) & 0xff] ^ (c >>> 8);
  return (c ^ 0xffffffff) >>> 0;
}

function chunk(tipo, datos) {
  const len = Buffer.alloc(4);
  len.writeUInt32BE(datos.length);
  const cuerpo = Buffer.concat([Buffer.from(tipo, "ascii"), datos]);
  const crc = Buffer.alloc(4);
  crc.writeUInt32BE(crc32(cuerpo));
  return Buffer.concat([len, cuerpo, crc]);
}

function png(ancho, alto, rgba) {
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(ancho, 0);
  ihdr.writeUInt32BE(alto, 4);
  ihdr[8] = 8;  // profundidad
  ihdr[9] = 6;  // color RGBA
  // líneas con byte de filtro 0
  const crudo = Buffer.alloc(alto * (1 + ancho * 4));
  for (let y = 0; y < alto; y++) {
    rgba.copy(crudo, y * (1 + ancho * 4) + 1, y * ancho * 4, (y + 1) * ancho * 4);
  }
  return Buffer.concat([
    Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]),
    chunk("IHDR", ihdr),
    chunk("IDAT", deflateSync(crudo, { level: 9 })),
    chunk("IEND", Buffer.alloc(0)),
  ]);
}

function dibujarIcono(S) {
  const px = Buffer.alloc(S * S * 4);
  const FONDO = [0x1c, 0x14, 0x10], ORO = [0xd9, 0xa4, 0x41], CLARO = [0xf0, 0xc3, 0x6b], CEREZA = [0xe0, 0x7a, 0x5f];
  const set = (x, y, c) => {
    const i = (y * S + x) * 4;
    px[i] = c[0]; px[i + 1] = c[1]; px[i + 2] = c[2]; px[i + 3] = 255;
  };
  for (let y = 0; y < S; y++) {
    for (let x = 0; x < S; x++) {
      set(x, y, FONDO);
      const u = x / S, v = y / S;
      // copa: triángulo invertido (solo el borde, grosor relativo)
      const g = 0.022;
      const enTri = (margen) => {
        if (v < 0.20 - margen || v > 0.54 + margen) return false;
        const semiancho = 0.31 * (1 - (v - 0.20) / 0.34);
        return Math.abs(u - 0.5) <= semiancho + margen;
      };
      const borde = enTri(0) && !enTri(-g);
      // líquido dentro de la copa (mitad inferior del triángulo)
      const semiancho = 0.31 * (1 - (v - 0.20) / 0.34);
      const liquido = v >= 0.30 && v <= 0.52 && Math.abs(u - 0.5) <= semiancho - g;
      // tallo y base
      const tallo = Math.abs(u - 0.5) <= 0.018 && v > 0.54 && v <= 0.78;
      const base = Math.abs(u - 0.5) <= 0.20 && v > 0.78 && v <= 0.825;
      // cereza decorativa
      const cereza = Math.hypot(u - 0.665, v - 0.155) <= 0.055;
      if (liquido) set(x, y, ORO);
      if (borde || tallo || base) set(x, y, CLARO);
      if (cereza) set(x, y, CEREZA);
    }
  }
  return png(S, S, px);
}

mkdirSync("icons", { recursive: true });
for (const S of [192, 512]) {
  writeFileSync(`icons/icon-${S}.png`, dibujarIcono(S));
  console.log(`icons/icon-${S}.png generado`);
}
