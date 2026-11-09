# Líneas de mundo que se ramifican

**Cortes, proyecciones y tres lecturas de una cuarta dimensión.** Preprint de Bruno Loiacono, estudiante de Física (Universidad de Buenos Aires).

Si se mira la vida entera de algo como un solo objeto, con el tiempo como una dimensión más, y ese algo se divide, su forma completa es un árbol, y lo que vemos en cada instante es un corte. El paper separa las tres lecturas posibles de esa «cuarta dimensión»: el tiempo, las posibilidades y una dimensión espacial extra. Con un modelo de objetos que se dividen en un plano muestra la diferencia entre tubo y árbol y entre corte y proyección, y deriva la estadística del número de piezas.

- 📄 **[PDF](paper/paper.pdf)**
- 🌐 **[Versión web](https://loiaconobruno.github.io/branching-worldlines/)**

> Preprint, documento de trabajo sin revisión por pares.

## Cómo se genera

`paper/paper.tex` es la única fuente. En cada push, GitHub Actions compila el PDF con TeX Live y arma la versión web (`index.html`). Para regenerar a mano las figuras, chequear las referencias o rearmar la página:

```bash
node paper/figuras/generar.js     # figuras y todas las cifras de la sección 4
python3 paper/verificar_bib.py    # cada referencia contra Crossref, Open Library o su URL
python3 paper/web.py              # index.html a partir del .tex
```

## Cómo citarlo

```bibtex
@misc{loiacono2026ramas,
  author       = {Loiacono, Bruno},
  title        = {Líneas de mundo que se ramifican: cortes, proyecciones y tres lecturas de una cuarta dimensión},
  year         = {2026},
  howpublished = {Preprint, documento de trabajo sin revisión por pares},
  url          = {https://github.com/LoiaconoBruno/branching-worldlines}
}
```

## Licencia

El texto, las figuras y el PDF están bajo [CC BY 4.0](LICENSE-CC-BY-4.0.txt). Los scripts que generan las figuras y la página están bajo MIT. El detalle está en [LICENSE](LICENSE).
