// El "tubo de mundo" de algo que se ramifica.
//
// Un objeto en un plano (2D) que con el tiempo se divide, como una célula.
// Su historia completa, con el tiempo como tercera dimensión, es un árbol.
// (Es la versión de una dimensión menos de la idea: un objeto 4D visto desde
// 3D. Cambiando "plano" por "espacio" y "árbol 3D" por "árbol 4D", vale igual.)
//
//   corte:      lo que existe en un instante t (lo que vemos día a día).
//   proyección: la sombra de toda la historia sobre el plano.
//   historia:   si las ramas son posibilidades y no hechos, solo se vive un
//               camino desde la raíz hasta una hoja.
const Arbol = (() => {
  const DEFECTO = {
    pasos: 60,           // instantes de tiempo
    probDivision: 0.06,  // probabilidad de dividirse en cada paso
    maxCelulas: 48,
    deriva: 0.012,       // cuánto se mueve cada célula por paso
    separacion: 0.2,     // distancia inicial entre las hijas
    semilla: 5,
  };

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

  // Devuelve { pasos, celulas: [{ id, padre, hijos, nace, muere, tray: [[t, x, y], ...] }] }.
  // Una célula existe en los instantes nace ≤ t < muere.
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
    for (const c of celulas) {
      if (c.muere === null) c.muere = p.pasos;
      delete c.x; delete c.y;
    }
    return { pasos: p.pasos, celulas };
  }

  function posicion(c, t) {
    const i = t - c.nace;
    return i >= 0 && i < c.tray.length ? c.tray[i] : null;
  }

  // Lo que existe en el instante t: [{ id, x, y }].
  function corte(arbol, t) {
    return arbol.celulas
      .filter((c) => c.nace <= t && t < c.muere)
      .map((c) => { const [, x, y] = posicion(c, t); return { id: c.id, x, y }; });
  }

  // La sombra de toda la historia sobre el plano: [[x, y], ...].
  function proyeccion(arbol) {
    return arbol.celulas.flatMap((c) => c.tray.map(([, x, y]) => [x, y]));
  }

  // Un solo camino de la raíz a una hoja, eligiendo una hija al azar en cada división.
  function historia(arbol, semilla = 1) {
    const r = rng(semilla);
    const camino = [0];
    let c = arbol.celulas[0];
    while (c.hijos.length) {
      c = arbol.celulas[c.hijos[r.u() < 0.5 ? 0 : 1]];
      camino.push(c.id);
    }
    return camino;
  }

  function hojas(arbol) {
    return arbol.celulas.filter((c) => c.hijos.length === 0);
  }

  return { DEFECTO, generar, posicion, corte, proyeccion, historia, hojas };
})();

if (typeof module !== "undefined") module.exports = Arbol;
