const test = require("node:test");
const assert = require("node:assert/strict");
const A = require("../src/arbol.js");

test("si nunca se divide, la historia es un tubo: una sola célula siempre", () => {
  const a = A.generar({ probDivision: 0 });
  assert.equal(a.celulas.length, 1);
  for (let t = 0; t < a.pasos; t++) assert.equal(A.corte(a, t).length, 1);
  assert.equal(a.celulas[0].tray.length, a.pasos);
});

test("si se divide, el corte crece con el tiempo y nunca pasa del máximo", () => {
  const a = A.generar({ probDivision: 0.1, maxCelulas: 20, semilla: 3 });
  let antes = 0;
  for (let t = 0; t < a.pasos; t++) {
    const n = A.corte(a, t).length;
    assert.ok(n >= antes, `en t=${t} bajó de ${antes} a ${n}`);
    assert.ok(n <= 20);
    antes = n;
  }
  assert.ok(antes > 1);
});

test("cada hija nace justo cuando termina su madre", () => {
  const a = A.generar({ semilla: 9 });
  for (const c of a.celulas) {
    if (c.padre === null) continue;
    assert.equal(a.celulas[c.padre].muere, c.nace);
    assert.equal(c.tray.length, c.muere - c.nace);
  }
});

test("las hojas son las que existen al final", () => {
  const a = A.generar({ semilla: 4 });
  assert.equal(A.hojas(a).length, A.corte(a, a.pasos - 1).length);
});

test("una historia vivida tiene exactamente una célula en cada instante", () => {
  const a = A.generar({ semilla: 7, probDivision: 0.1 });
  const camino = A.historia(a, 2);
  for (let i = 1; i < camino.length; i++) assert.equal(a.celulas[camino[i]].padre, camino[i - 1]);
  for (let t = 0; t < a.pasos; t++) {
    const vivas = camino.filter((id) => a.celulas[id].nace <= t && t < a.celulas[id].muere);
    assert.equal(vivas.length, 1, `t=${t}`);
  }
});

test("la proyección junta todos los puntos de la historia", () => {
  const a = A.generar({ semilla: 7 });
  const total = a.celulas.reduce((s, c) => s + c.tray.length, 0);
  assert.equal(A.proyeccion(a).length, total);
});

test("misma semilla, mismo árbol", () => {
  assert.deepEqual(A.generar({ semilla: 11 }), A.generar({ semilla: 11 }));
});
