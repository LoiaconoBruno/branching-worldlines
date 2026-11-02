// Interfaz: el árbol en perspectiva, el plano del corte y la vista desde el plano.
(() => {
  const $ = (id) => document.getElementById(id);
  let semilla = Arbol.DEFECTO.semilla;
  let vista = "corte";
  let arbol, camino, enCamino;

  function generar() {
    arbol = Arbol.generar({ probDivision: parseFloat($("p").value), semilla });
    camino = Arbol.historia(arbol, semilla);
    enCamino = new Set(camino);
  }

  function escala() {
    let m = 0.3;
    for (const c of arbol.celulas) for (const [, x, y] of c.tray) m = Math.max(m, Math.abs(x), Math.abs(y));
    return m * 1.15;
  }

  function dibujarArbol() {
    const { ctx, w, h } = Grafico.preparar($("c-arbol"), 420);
    const col = Grafico.colores();
    const t0 = parseInt($("t").value, 10);
    const phi = (parseFloat($("giro").value) * Math.PI) / 180;
    const R = escala();
    const S = Math.min(w * 0.42, 170) / R;
    const HT = (h - 90) / arbol.pasos;
    const cx = w / 2, base = h - 40;
    const P = (t, x, y) => {
      const xr = x * Math.cos(phi) - y * Math.sin(phi);
      const yr = x * Math.sin(phi) + y * Math.cos(phi);
      return [cx + xr * S, base - t * HT - yr * S * 0.35];
    };
    const posibles = $("modo").value === "posibilidades";

    // Plano del corte
    const esquinas = [[-R, -R], [R, -R], [R, R], [-R, R]].map(([x, y]) => P(t0, x, y));
    ctx.beginPath(); esquinas.forEach(([X, Y], i) => (i ? ctx.lineTo(X, Y) : ctx.moveTo(X, Y))); ctx.closePath();
    ctx.fillStyle = col.series[1]; ctx.globalAlpha = 0.12; ctx.fill(); ctx.globalAlpha = 0.6; ctx.strokeStyle = col.series[1]; ctx.lineWidth = 1; ctx.stroke(); ctx.globalAlpha = 1;

    // Ramas
    for (const c of arbol.celulas) {
      const vivida = enCamino.has(c.id);
      ctx.strokeStyle = posibles ? (vivida ? col.series[1] : col.muted) : col.series[0];
      ctx.lineWidth = posibles ? (vivida ? 3 : 1) : 2;
      ctx.globalAlpha = posibles && !vivida ? 0.45 : 1;
      ctx.beginPath();
      let pts = c.tray.map(([t, x, y]) => P(t, x, y));
      if (c.padre !== null) {
        const madre = arbol.celulas[c.padre];
        const [t, x, y] = madre.tray[madre.tray.length - 1];
        pts = [P(t, x, y), ...pts];
      }
      pts.forEach(([X, Y], i) => (i ? ctx.lineTo(X, Y) : ctx.moveTo(X, Y)));
      ctx.stroke();
    }
    ctx.globalAlpha = 1;

    // Intersecciones con el plano
    for (const k of Arbol.corte(arbol, t0)) {
      const [X, Y] = P(t0, k.x, k.y);
      const vivida = enCamino.has(k.id);
      ctx.beginPath(); ctx.arc(X, Y, posibles && !vivida ? 3 : 5, 0, 2 * Math.PI);
      ctx.fillStyle = posibles && !vivida ? col.muted : col.series[1]; ctx.fill();
    }

    // Eje del tiempo
    ctx.strokeStyle = col.border; ctx.lineWidth = 1;
    ctx.beginPath(); ctx.moveTo(14, base); ctx.lineTo(14, base - arbol.pasos * HT); ctx.stroke();
    ctx.fillStyle = col.muted; ctx.font = "12px system-ui"; ctx.textAlign = "left";
    ctx.fillText("tiempo ↑", 20, base - arbol.pasos * HT + 4);
  }

  function dibujarPlano() {
    const { ctx, w, h } = Grafico.preparar($("c-plano"), 320);
    const col = Grafico.colores();
    const t0 = parseInt($("t").value, 10);
    const R = escala();
    const S = (Math.min(w, h) / 2 - 12) / R;
    const cx = w / 2, cy = h / 2;
    const posibles = $("modo").value === "posibilidades";
    ctx.strokeStyle = col.border; ctx.strokeRect(cx - R * S, cy - R * S, 2 * R * S, 2 * R * S);
    if (vista === "proyeccion") {
      for (const c of arbol.celulas) {
        ctx.strokeStyle = posibles && enCamino.has(c.id) ? col.series[1] : col.series[0];
        ctx.globalAlpha = 0.6; ctx.lineWidth = 1.5;
        ctx.beginPath();
        c.tray.forEach(([, x, y], i) => (i ? ctx.lineTo(cx + x * S, cy - y * S) : ctx.moveTo(cx + x * S, cy - y * S)));
        ctx.stroke();
      }
      ctx.globalAlpha = 1;
      $("txt-vista").textContent = "La sombra junta todos los instantes a la vez: se ve por dónde pasó todo, pero ya no se distingue el antes del después ni qué rama salió de cuál.";
      return;
    }
    const corte = Arbol.corte(arbol, t0);
    for (const k of corte) {
      const vivida = enCamino.has(k.id);
      ctx.beginPath(); ctx.arc(cx + k.x * S, cy - k.y * S, 7, 0, 2 * Math.PI);
      if (posibles && !vivida) { ctx.strokeStyle = col.muted; ctx.lineWidth = 1.5; ctx.setLineDash([3, 3]); ctx.stroke(); ctx.setLineDash([]); }
      else { ctx.fillStyle = col.series[1]; ctx.fill(); }
    }
    $("txt-vista").textContent = posibles
      ? `En el instante ${t0} solo existe una (la historia vivida). Las otras ${corte.length - 1} son lo que podría haber pasado.`
      : corte.length === 1
        ? `En el instante ${t0} hay un solo objeto.${Arbol.hojas(arbol).length === 1 ? " Como nunca se dividió, su historia completa es un tubo, no un árbol." : ""}`
        : `En el instante ${t0} hay ${corte.length} objetos separados. Desde adentro del plano parecen cosas distintas; en la historia completa son ramas de una misma pieza.`;
  }

  function render() {
    $("v-t").textContent = $("t").value;
    $("v-p").textContent = Number($("p").value).toLocaleString("es-AR");
    $("v-giro").textContent = $("giro").value + "°";
    const posibles = $("modo").value === "posibilidades";
    const corte = Arbol.corte(arbol, parseInt($("t").value, 10));
    $("s-corte").textContent = posibles ? `1 vivida, ${corte.length - 1} posibles` : `${corte.length} ${corte.length === 1 ? "pieza" : "piezas"}`;
    $("s-hojas").textContent = Arbol.hojas(arbol).length;
    $("txt-modo").textContent = posibles
      ? "Cada bifurcación es una elección entre futuros: se vive un solo camino (naranja). Las demás ramas no existen; son posibilidades, como en el jardín de senderos que se bifurcan de Borges o en la interpretación de los muchos mundos."
      : "Todas las ramas existen de verdad, como el linaje de una célula que se divide: una sola historia que se ramifica en el espacio.";
    document.getElementById("v-corte").classList.toggle("activo", vista === "corte");
    document.getElementById("v-proy").classList.toggle("activo", vista === "proyeccion");
    dibujarArbol();
    dibujarPlano();
  }

  $("t").addEventListener("input", render);
  $("giro").addEventListener("input", render);
  $("modo").addEventListener("change", render);
  $("p").addEventListener("input", () => { generar(); render(); });
  $("otro").addEventListener("click", () => { semilla++; generar(); render(); });
  $("v-corte").addEventListener("click", () => { vista = "corte"; render(); });
  $("v-proy").addEventListener("click", () => { vista = "proyeccion"; render(); });
  window.addEventListener("resize", render);

  generar();
  render();
})();
