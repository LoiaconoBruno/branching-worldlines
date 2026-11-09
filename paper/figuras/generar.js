#!/usr/bin/env node
// Genera las figuras del paper (SVG) en esta carpeta y escribe las cifras que cita el texto.
// Uso: node paper/figuras/generar.js
// Contiene solo las funciones del modelo que hacen falta. Licencia MIT (ver LICENSE).
// Unidades: el tiempo se mide en pasos y las posiciones en unidades arbitrarias de longitud.
"use strict";
const fs = require("node:fs");
const path = require("node:path");

const COLORES = ["#2a55c9", "#c25a00", "#1f7a4d", "#b3261e", "#7a3fb8", "#555555"];
const FUENTE = 'font-family="DejaVu Sans, Helvetica, Arial, sans-serif"';

const esc = (s) => String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

// Números con coma decimal y signo menos tipográfico.
function num(x) {
  if (x === 0) return "0";
  const a = Math.abs(x);
  let s;
  if (a >= 1e4 || a < 1e-3) {
    const e = Math.floor(Math.log10(a));
    const m = x / 10 ** e;
    s = (Math.abs(m - 1) < 1e-9 ? "" : `${Number(m.toPrecision(2))}×`) + `10^${e}`;
  } else s = String(Number(x.toPrecision(3)));
  return s.replace(".", ",").replace(/-/g, "−");
}

function marcas(min, max, n = 5) {
  const crudo = (max - min) / n;
  const pot = 10 ** Math.floor(Math.log10(crudo));
  const paso = [1, 2, 2.5, 5, 10].map((m) => m * pot).find((p) => p >= crudo);
  const out = [];
  for (let x = Math.ceil(min / paso - 1e-9) * paso; x <= max + paso * 1e-9; x += paso) out.push(Math.abs(x) < paso * 1e-9 ? 0 : x);
  return out;
}

function potencias(min, max) {
  const out = [];
  for (let k = Math.floor(Math.log10(min)); k <= Math.ceil(Math.log10(max)); k++) out.push(10 ** k);
  return out;
}

// Texto con superíndices para etiquetas del tipo 10^3.
function textoSVG(s) {
  return esc(s).replace(/\^(−?[0-9A-Za-z]+)/g, '<tspan baseline-shift="super" font-size="70%">$1</tspan>');
}

/**
 * Gráfico de líneas.
 * op: { series: [{nombre, puntos: [[x,y]], color?, punteada?, grosor?}], xMin, xMax, yMin, yMax,
 *       xEtiqueta, yEtiqueta, logX, logY, verticales: [{x, etiqueta}], horizontales: [{y, etiqueta}],
 *       ancho, alto, leyenda: "arriba" | "abajo" | null }
 */
function grafico(op) {
  const W = op.ancho || 640, H = op.alto || 400;
  const m = { l: 70, r: 18, t: op.leyenda === null ? 16 : 40, b: 56 };
  const tx = (x) => (op.logX ? Math.log10(x) : x);
  const ty = (y) => (op.logY ? Math.log10(y) : y);
  const pts = op.series.flatMap((s) => s.puntos).filter(([x, y]) => isFinite(tx(x)) && isFinite(ty(y)));
  const xMin = op.xMin ?? Math.min(...pts.map((p) => p[0]));
  const xMax = op.xMax ?? Math.max(...pts.map((p) => p[0]));
  const yMin = op.yMin ?? Math.min(...pts.map((p) => p[1]));
  const yMax = op.yMax ?? Math.max(...pts.map((p) => p[1]));
  const X = (x) => m.l + ((tx(x) - tx(xMin)) / (tx(xMax) - tx(xMin))) * (W - m.l - m.r);
  const Y = (y) => H - m.b - ((ty(y) - ty(yMin)) / (ty(yMax) - ty(yMin))) * (H - m.t - m.b);
  const o = [`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}" width="${W}" height="${H}" ${FUENTE} font-size="13">`,
    `<rect width="${W}" height="${H}" fill="#ffffff"/>`];
  const mx = op.logX ? potencias(xMin, xMax) : marcas(xMin, xMax, op.marcasX || 6);
  const my = op.logY ? potencias(yMin, yMax) : marcas(yMin, yMax, op.marcasY || 5);
  for (const x of mx) {
    if (x < xMin - 1e-12 || x > xMax + 1e-12) continue;
    o.push(`<line x1="${X(x)}" y1="${m.t}" x2="${X(x)}" y2="${H - m.b}" stroke="#e3e1db"/>`);
    o.push(`<text x="${X(x)}" y="${H - m.b + 18}" text-anchor="middle" fill="#333">${textoSVG(num(x))}</text>`);
  }
  for (const y of my) {
    if (y < yMin - 1e-12 || y > yMax + 1e-12) continue;
    o.push(`<line x1="${m.l}" y1="${Y(y)}" x2="${W - m.r}" y2="${Y(y)}" stroke="#e3e1db"/>`);
    o.push(`<text x="${m.l - 8}" y="${Y(y) + 4}" text-anchor="end" fill="#333">${textoSVG(num(y))}</text>`);
  }
  o.push(`<rect x="${m.l}" y="${m.t}" width="${W - m.l - m.r}" height="${H - m.t - m.b}" fill="none" stroke="#333"/>`);
  if (op.xEtiqueta) o.push(`<text x="${m.l + (W - m.l - m.r) / 2}" y="${H - 14}" text-anchor="middle" fill="#111">${textoSVG(op.xEtiqueta)}</text>`);
  if (op.yEtiqueta) o.push(`<text transform="translate(18 ${m.t + (H - m.t - m.b) / 2}) rotate(-90)" text-anchor="middle" fill="#111">${textoSVG(op.yEtiqueta)}</text>`);
  o.push(`<clipPath id="area"><rect x="${m.l}" y="${m.t}" width="${W - m.l - m.r}" height="${H - m.t - m.b}"/></clipPath><g clip-path="url(#area)">`);
  (op.verticales || []).forEach((v, j) => {
    o.push(`<line x1="${X(v.x)}" y1="${m.t}" x2="${X(v.x)}" y2="${H - m.b}" stroke="#666" stroke-dasharray="4 4"/>`);
    // etiquetas escalonadas para que no se pisen si las líneas están cerca
    if (v.etiqueta) o.push(`<text x="${X(v.x) + 5}" y="${m.t + 16 + 15 * j}" fill="#444" font-size="12">${textoSVG(v.etiqueta)}</text>`);
  });
  for (const h of op.horizontales || []) {
    o.push(`<line x1="${m.l}" y1="${Y(h.y)}" x2="${W - m.r}" y2="${Y(h.y)}" stroke="#666" stroke-dasharray="4 4"/>`);
    if (h.etiqueta) o.push(`<text x="${W - m.r - 6}" y="${Y(h.y) - 6}" text-anchor="end" fill="#444" font-size="12">${textoSVG(h.etiqueta)}</text>`);
  }
  op.series.forEach((s, i) => {
    const d = [];
    let abierto = false;
    for (const [x, y] of s.puntos) {
      if (!isFinite(tx(x)) || !isFinite(ty(y))) { abierto = false; continue; }
      d.push(`${abierto ? "L" : "M"}${X(x).toFixed(2)} ${Y(y).toFixed(2)}`);
      abierto = true;
    }
    const color = s.color || COLORES[i % COLORES.length];
    o.push(`<path d="${d.join(" ")}" fill="none" stroke="${color}" stroke-width="${s.grosor || 2.2}"${s.punteada ? ' stroke-dasharray="7 5"' : ""} stroke-linejoin="round"/>`);
  });
  o.push("</g>");
  if (op.leyenda !== null) {
    let lx = m.l;
    op.series.forEach((s, i) => {
      if (!s.nombre) return;
      const color = s.color || COLORES[i % COLORES.length];
      o.push(`<line x1="${lx}" y1="${m.t - 16}" x2="${lx + 22}" y2="${m.t - 16}" stroke="${color}" stroke-width="3"${s.punteada ? ' stroke-dasharray="6 4"' : ""}/>`);
      o.push(`<text x="${lx + 28}" y="${m.t - 12}" fill="#111">${textoSVG(s.nombre)}</text>`);
      lx += 40 + s.nombre.length * 7.2;
    });
  }
  o.push("</svg>");
  return o.join("\n");
}

function guardar(nombre, svg) {
  fs.writeFileSync(path.join(__dirname, nombre + ".svg"), svg + "\n");
  console.log("figura:", nombre + ".svg");
}

/**
 * Barras apiladas horizontales. grupos: [{nombre, partes: [valor...]}], categorias: [nombre...]
 */
function barras(op) {
  const W = op.ancho || 640, alto = op.alturaBarra || 34, sep = op.separacion || 22;
  const m = { l: op.margenIzq || 210, r: 30, t: 54, b: 46 };
  const H = m.t + op.grupos.length * (alto + sep) - sep + m.b;
  const total = op.maximo || Math.max(...op.grupos.map((g) => g.partes.reduce((a, b) => a + b, 0)));
  const X = (v) => m.l + (v / total) * (W - m.l - m.r);
  const o = [`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}" width="${W}" height="${H}" ${FUENTE} font-size="13">`,
    `<rect width="${W}" height="${H}" fill="#ffffff"/>`];
  let lx = m.l;
  op.categorias.forEach((c, i) => {
    o.push(`<rect x="${lx}" y="${m.t - 36}" width="14" height="14" fill="${(op.colores || COLORES)[i]}"/>`);
    o.push(`<text x="${lx + 20}" y="${m.t - 24}" fill="#111">${esc(c)}</text>`);
    lx += 34 + c.length * 7.2;
  });
  for (const v of marcas(0, total, op.marcas || 5)) {
    o.push(`<line x1="${X(v)}" y1="${m.t - 6}" x2="${X(v)}" y2="${H - m.b}" stroke="#e3e1db"/>`);
    o.push(`<text x="${X(v)}" y="${H - m.b + 18}" text-anchor="middle" fill="#333">${num(v)}</text>`);
  }
  op.grupos.forEach((g, k) => {
    const y = m.t + k * (alto + sep);
    o.push(`<text x="${m.l - 10}" y="${y + alto / 2 + 5}" text-anchor="end" fill="#111">${esc(g.nombre)}</text>`);
    let acum = 0;
    g.partes.forEach((v, i) => {
      if (!v) return;
      o.push(`<rect x="${X(acum)}" y="${y}" width="${X(acum + v) - X(acum)}" height="${alto}" fill="${(op.colores || COLORES)[i]}"/>`);
      o.push(`<text x="${(X(acum) + X(acum + v)) / 2}" y="${y + alto / 2 + 5}" text-anchor="middle" fill="#fff" font-weight="bold">${num(v)}</text>`);
      acum += v;
    });
  });
  if (op.xEtiqueta) o.push(`<text x="${m.l + (W - m.l - m.r) / 2}" y="${H - 10}" text-anchor="middle" fill="#111">${esc(op.xEtiqueta)}</text>`);
  o.push("</svg>");
  return o.join("\n");
}

/** Diagrama de pasos en fila: cajas con número y texto, unidas por flechas. */
function pasos(lista, op = {}) {
  const W = op.ancho || 640, porFila = op.porFila || 3, cw = (W - 40 - (porFila - 1) * 30) / porFila, ch = op.altoCaja || 92;
  const filas = Math.ceil(lista.length / porFila);
  const H = 20 + filas * ch + (filas - 1) * 40 + 20;
  const o = [`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}" width="${W}" height="${H}" ${FUENTE} font-size="13">`,
    `<rect width="${W}" height="${H}" fill="#ffffff"/>`,
    `<defs><marker id="flecha" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path d="M0 0 L10 5 L0 10 z" fill="#555"/></marker></defs>`];
  const pos = lista.map((_, i) => {
    const f = Math.floor(i / porFila), c = f % 2 === 0 ? i % porFila : porFila - 1 - (i % porFila);
    return { x: 20 + c * (cw + 30), y: 20 + f * (ch + 40) };
  });
  lista.forEach((p, i) => {
    const { x, y } = pos[i];
    o.push(`<rect x="${x}" y="${y}" width="${cw}" height="${ch}" rx="10" fill="#f3f5fc" stroke="${COLORES[0]}" stroke-width="1.5"/>`);
    o.push(`<text x="${x + 12}" y="${y + 24}" fill="${COLORES[0]}" font-weight="bold" font-size="14">${esc(p.titulo)}</text>`);
    (p.lineas || []).forEach((l, j) => o.push(`<text x="${x + 12}" y="${y + 46 + j * 17}" fill="#222">${esc(l)}</text>`));
    if (i + 1 < lista.length) {
      const a = pos[i], b = pos[i + 1];
      if (a.y === b.y) {
        const izq = b.x > a.x;
        o.push(`<line x1="${izq ? a.x + cw : a.x}" y1="${a.y + ch / 2}" x2="${izq ? b.x - 2 : b.x + cw + 2}" y2="${b.y + ch / 2}" stroke="#555" stroke-width="1.6" marker-end="url(#flecha)"/>`);
      } else {
        o.push(`<line x1="${a.x + cw / 2}" y1="${a.y + ch}" x2="${b.x + cw / 2}" y2="${b.y - 2}" stroke="#555" stroke-width="1.6" marker-end="url(#flecha)"/>`);
      }
    }
  });
  o.push("</svg>");
  return o.join("\n");
}

// ---------------------------------------------------------------------------
// Modelo: objetos en un plano que se dividen con probabilidad p en cada paso
// ---------------------------------------------------------------------------
const DEFECTO = { pasos: 60, probDivision: 0.06, maxCelulas: 48, deriva: 0.012, separacion: 0.2, semilla: 5 };

function rng(semilla) {
  let a = semilla >>> 0;
  const u = () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
  return { u, normal: () => Math.sqrt(-2 * Math.log(u() || 1e-12)) * Math.cos(2 * Math.PI * u()) };
}

// Una célula existe en los instantes nace ≤ t < muere; tray = [[t, x, y], ...].
function generar(params = {}) {
  const p = { ...DEFECTO, ...params };
  const r = rng(p.semilla);
  const celulas = [{ id: 0, padre: null, hijos: [], nace: 0, muere: null, tray: [], x: 0, y: 0 }];
  for (let t = 0; t < p.pasos; t++) {
    const vivas = celulas.filter((c) => c.nace <= t && c.muere === null);
    let total = vivas.length;
    for (const c of vivas) {
      c.tray.push([t, c.x, c.y]);
      if (t < p.pasos - 1 && total < p.maxCelulas && r.u() < p.probDivision) {
        c.muere = t + 1;
        total++;
        const ang = 2 * Math.PI * r.u();
        const dx = (Math.cos(ang) * p.separacion) / 2, dy = (Math.sin(ang) * p.separacion) / 2;
        for (const s of [1, -1]) {
          const hija = { id: celulas.length, padre: c.id, hijos: [], nace: t + 1, muere: null, tray: [], x: c.x + s * dx, y: c.y + s * dy };
          c.hijos.push(hija.id);
          celulas.push(hija);
        }
      } else {
        c.x += p.deriva * r.normal();
        c.y += p.deriva * r.normal();
      }
    }
  }
  for (const c of celulas) { if (c.muere === null) c.muere = p.pasos; delete c.x; delete c.y; }
  return { pasos: p.pasos, celulas };
}
const corte = (arbol, t) => arbol.celulas.filter((c) => c.nace <= t && t < c.muere);
const hojas = (arbol) => arbol.celulas.filter((c) => c.hijos.length === 0);
// Un camino de la raíz a una hoja, eligiendo una hija al azar en cada división.
function historia(arbol, semilla = 1) {
  const r = rng(semilla);
  const camino = [0];
  let c = arbol.celulas[0];
  while (c.hijos.length) { c = arbol.celulas[c.hijos[r.u() < 0.5 ? 0 : 1]]; camino.push(c.id); }
  return camino;
}
// Profundidad (número de divisiones) de cada hoja: su probabilidad como camino vivido es 2^(−k).
function profundidad(arbol, c) { let k = 0; while (c.padre !== null) { c = arbol.celulas[c.padre]; k++; } return k; }

const f4 = (x) => Number(x.toPrecision(4));

// ---------------------------------------------------------------------------
// Cifras del texto: el árbol de ejemplo
// ---------------------------------------------------------------------------
const ej = generar();
const camino = historia(ej, 1);
const hojasEj = hojas(ej);
const ks = hojasEj.map((h) => profundidad(ej, h));
console.log(`Ejemplo (semilla 5, p = 0,06): piezas en t = 45: ${corte(ej, 45).length}; ramas al final: ${hojasEj.length}; células en total: ${ej.celulas.length}`);
console.log(`Camino vivido (semilla 1): ${camino.length - 1} divisiones, probabilidad 2^−${camino.length - 1} = ${f4(2 ** -(camino.length - 1))}`);
console.log(`Profundidades de las hojas: min ${Math.min(...ks)}, max ${Math.max(...ks)}; suma de 2^−k = ${f4(ks.reduce((s, k) => s + 2 ** -k, 0))}`);
console.log(`Probabilidad máx./mín. de hoja: ${f4(2 ** -Math.min(...ks))} / ${f4(2 ** -Math.max(...ks))}`);
const tubo = generar({ probDivision: 0 });
console.log(`p = 0: piezas en t = 0, 30, 59: ${[0, 30, 59].map((t) => corte(tubo, t).length).join(", ")}`);
// Máxima pendiente de una rama (para la discusión de conos de luz)
let pend = 0;
for (const c of ej.celulas) for (let i = 1; i < c.tray.length; i++) pend = Math.max(pend, Math.hypot(c.tray[i][1] - c.tray[i - 1][1], c.tray[i][2] - c.tray[i - 1][2]));
console.log(`Máximo desplazamiento por paso dentro de una rama: ${f4(pend)}`);

// ---------------------------------------------------------------------------
// Monte Carlo: proceso de ramificación sin tope
// ---------------------------------------------------------------------------
const p = DEFECTO.probDivision, m = 1 + p, s2 = p * (1 - p), T = 59, M = 5000;
const conteos = []; // conteos[i][t]
let topados = 0;
for (let s = 1; s <= M; s++) {
  const a = generar({ semilla: 1000 + s, maxCelulas: Infinity });
  const n = new Array(T + 1).fill(0);
  for (const c of a.celulas) for (let t = c.nace; t < c.muere; t++) n[t]++;
  conteos.push(n);
  if (n[T] > 48) topados++;
}
const media = (xs) => xs.reduce((a, b) => a + b, 0) / xs.length;
const varianza = (xs) => { const mm = media(xs); return xs.reduce((a, x) => a + (x - mm) ** 2, 0) / (xs.length - 1); };
const cuantil = (xs, q) => { const o = [...xs].sort((a, b) => a - b); return o[Math.floor(q * (o.length - 1))]; };
const nT = conteos.map((n) => n[T]);
const varTeo = (s2 * m ** (T - 1) * (m ** T - 1)) / (m - 1);
const W = nT.map((n) => n / m ** T);
console.log(`Monte Carlo (${M} árboles sin tope): media N(59) = ${f4(media(nT))} (teoría ${f4(m ** T)}); desvío ${f4(Math.sqrt(varianza(nT)))} (teoría ${f4(Math.sqrt(varTeo))})`);
console.log(`W = N/m^t: media ${f4(media(W))}, varianza ${f4(varianza(W))} (límite teórico (1−p)/(1+p) = ${f4((1 - p) / (1 + p))})`);
console.log(`Percentiles 10/50/90 de N(59): ${cuantil(nT, 0.1)} / ${cuantil(nT, 0.5)} / ${cuantil(nT, 0.9)}; ${f4((100 * topados) / M)} % superaría el tope de 48`);
console.log(`Fracción con N(59) ≤ 15: ${f4((100 * nT.filter((n) => n <= 15).length) / M)} %`);

// ---------------------------------------------------------------------------
// Figura 1: el árbol de ejemplo proyectado en el plano (x, t)
// ---------------------------------------------------------------------------
const vivido = new Set(camino);
const series = ej.celulas.map((c) => {
  // une cada hija con el último punto de la madre para que se vea la división
  const madre = c.padre === null ? null : ej.celulas[c.padre];
  const ini = madre ? [[madre.tray[madre.tray.length - 1][1], madre.tray[madre.tray.length - 1][0]]] : [];
  return {
    nombre: "",
    puntos: [...ini, ...c.tray.map(([t, x]) => [x, t])],
    color: vivido.has(c.id) ? COLORES[1] : COLORES[0],
    grosor: vivido.has(c.id) ? 3 : 1.4,
  };
});
const xs = ej.celulas.flatMap((c) => c.tray.map(([, x]) => x));
series.push({ nombre: "Ramas (modo tiempo)", puntos: [], color: COLORES[0] });
series.push({ nombre: "Camino vivido (modo posibilidades)", puntos: [], color: COLORES[1] });
guardar("arbol", grafico({
  series,
  xMin: Math.floor(Math.min(...xs) * 10) / 10, xMax: Math.ceil(Math.max(...xs) * 10) / 10, yMin: 0, yMax: 59,
  horizontales: [{ y: 45, etiqueta: "corte en t = 45" }],
  xEtiqueta: "Posición x (unidades arbitrarias)", yEtiqueta: "Tiempo t (pasos)",
}));

// ---------------------------------------------------------------------------
// Figura 2: crecimiento del número de piezas
// ---------------------------------------------------------------------------
const ts = Array.from({ length: T + 1 }, (_, t) => t);
const nEj = ts.map((t) => corte(ej, t).length);
guardar("crecimiento", grafico({
  series: [
    { nombre: "Media (5000 árboles)", puntos: ts.map((t) => [t, media(conteos.map((n) => n[t]))]), color: COLORES[0] },
    { nombre: "(1 + p)^t", puntos: ts.map((t) => [t, m ** t]), color: COLORES[5], punteada: true },
    { nombre: "Percentiles 10 y 90", puntos: ts.map((t) => [t, cuantil(conteos.map((n) => n[t]), 0.9)]), color: COLORES[2], punteada: true, grosor: 1.4 },
    { nombre: "", puntos: ts.map((t) => [t, cuantil(conteos.map((n) => n[t]), 0.1)]), color: COLORES[2], punteada: true, grosor: 1.4 },
    { nombre: "Ejemplo", puntos: nEj.map((n, t) => [t, n]), color: COLORES[1] },
  ],
  xMin: 0, xMax: 59, yMin: 0, yMax: 70,
  xEtiqueta: "Tiempo t (pasos)", yEtiqueta: "Piezas en el corte, N(t)",
}));

// ---------------------------------------------------------------------------
// Figura 3: distribución de W = N(59) / (1 + p)^59
// ---------------------------------------------------------------------------
const anchoCaja = 0.2, cajas = 20;
const histW = Array.from({ length: cajas }, (_, k) => {
  const desde = k * anchoCaja;
  const c = W.filter((w) => w >= desde && w < desde + anchoCaja).length;
  return [desde + anchoCaja / 2, c / (M * anchoCaja)];
});
guardar("dispersion", grafico({
  series: [
    { nombre: "5000 árboles (densidad)", puntos: histW, color: COLORES[0] },
    { nombre: "e^−w", puntos: Array.from({ length: 81 }, (_, i) => [i * 0.05, Math.exp(-i * 0.05)]), color: COLORES[1], punteada: true },
  ],
  xMin: 0, xMax: 4, yMin: 0, yMax: 1.2,
  verticales: [{ x: 15 / m ** T, etiqueta: "ejemplo (15 ramas)" }],
  xEtiqueta: "W = N(59) / (1 + p)^59", yEtiqueta: "Densidad de probabilidad",
}));
