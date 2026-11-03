# Líneas de mundo que se ramifican: paper de uso y guía de la idea

## Resumen

Este documento acompaña a **Branching Worldlines**, una visualización interactiva de una idea: si se mira la vida entera de algo como un solo objeto, con el tiempo como una dimensión más, y ese algo se divide, su forma completa no es un bloque sino **un árbol**. Lo que vemos día a día son sus cortes.

La primera parte es un paper de uso: cómo se usa la página, qué significa cada control, un ejemplo resuelto con los números que da la herramienta y sus límites. La segunda es una guía de la idea. Distingue las tres "cuartas dimensiones" que la idea mezcla (el espacio extra, el tiempo y las posibilidades) y recorre lo que dijeron sobre cada una los físicos, biólogos, filósofos y escritores que las pensaron: el espacio-tiempo de Minkowski y el universo bloque, los linajes celulares de Sulston y los procesos de ramificación de Galton, Watson y Yule, el tiempo ramificado de Arthur Prior y "El jardín de senderos que se bifurcan" de Borges, la interpretación de muchos mundos de Everett y el debate filosófico entre perdurantismo y endurantismo. También explica dos ajustes que la herramienta le hace a la idea: un objeto que no se ramifica es un **tubo**, no un árbol, y un **corte** no es lo mismo que una **proyección**.

## Parte I. Paper de uso

### 1. Qué es la herramienta

Branching Worldlines es una página estática sin dependencias que se abre desde la [demo en vivo](https://loiaconobruno.github.io/branching-worldlines/) o con doble clic en `index.html`. Para poder dibujar, usa una dimensión menos que la idea original: un objeto que vive en un **plano** y se divide con el tiempo. Su historia completa, plano más tiempo, es un árbol en tres dimensiones que se puede dibujar en perspectiva. La idea original (espacio de tres dimensiones más tiempo, un árbol de cuatro) funciona igual con una dimensión más.

La página tiene tres zonas:

1. **Controles**, con las estadísticas del instante elegido.
2. **La historia completa:** el árbol en perspectiva, con el tiempo hacia arriba y el plano del corte marcado.
3. **Lo que se ve en el plano:** el corte (los objetos que existen en ese instante) o la proyección (la sombra de toda la historia).

La lógica está en `src/arbol.js`, sin acceso al DOM. `src/grafico.js` dibuja y `src/app.js` conecta los controles. Los tests se corren con `npm test` (Node 18 o más nuevo).

### 2. Instalación

```bash
git clone https://github.com/LoiaconoBruno/branching-worldlines.git
cd branching-worldlines
npm test
```

Después se abre `index.html` con doble clic.

### 3. Controles

| Control | Rango | Qué hace |
|---|---|---|
| ¿Qué es la dimensión extra? | El tiempo · Las posibilidades | Cambia la lectura del árbol: ramas que existen todas, o futuros alternativos de los que se vive uno |
| Instante del corte | 0 a 59 | Elige el instante en el que se corta la historia |
| Probabilidad de dividirse por paso | 0 a 0,15 | Probabilidad de que cada objeto se divida en cada paso; regenera el árbol |
| Giro de la vista | 0° a 360° | Rota el árbol en la vista en perspectiva |
| Otro árbol | botón | Cambia la semilla del generador y dibuja un árbol nuevo |
| Corte / Proyección | botones | Cambia lo que muestra el panel del plano |

Estadísticas:

- **En este instante:** cuántas piezas hay en el corte. En el modo "posibilidades" se separa en "1 vivida y n posibles".
- **Ramas al final:** cuántas hojas tiene el árbol en el último instante.

### 4. Ejemplo resuelto

Este ejemplo usa el estado con el que abre la página (semilla 5, probabilidad 0,06, 60 instantes).

1. **El tiempo, corte en 45.** La página informa **8 piezas** en este instante y **15 ramas** al final. A la izquierda se ve el árbol completo con el plano del corte atravesándolo a la altura 45; a la derecha, ocho objetos separados. Alguien que viviera en el plano vería ocho cosas independientes. En la historia completa, son una sola pieza conectada por debajo del corte: todas descienden del mismo objeto inicial.
2. **Las posibilidades.** Al cambiar a "Las posibilidades: futuros alternativos", el árbol es el mismo, pero se resalta en naranja una sola historia: un camino desde la raíz hasta una hoja. Las estadísticas dicen **1 vivida y 7 posibles**. Las otras siete piezas no existen; son lo que podría haber pasado si en alguna bifurcación se hubiera tomado el otro camino.
3. **Proyección.** Al apretar "Proyección", el panel del plano muestra todos los puntos de todas las trayectorias aplanados juntos, como una foto de exposición larga. Ya no se distingue qué pasó antes y qué después.
4. **Un tubo.** De vuelta en "Corte" y "El tiempo", con la probabilidad de dividirse en 0, queda **1 pieza** en cualquier instante y la historia completa es un **tubo**: una línea de mundo engrosada que sube sin ramificarse.
5. **Giro y otro árbol.** El deslizador de giro rota la vista para ver el árbol desde otro ángulo; "Otro árbol" genera uno nuevo con otra semilla.

### 5. Cómo leer los resultados

- El **árbol** es la historia completa: todo lo que pasó, desde el principio hasta el final, visto como un solo objeto.
- El **corte** es lo que ve alguien que vive en un instante. Es siempre un conjunto de piezas separadas; la conexión entre ellas está en el pasado, que el corte no muestra.
- La **proyección** es lo que ve alguien que acumula toda la historia en una sola imagen. Pierde el orden temporal.
- En el modo **tiempo**, todas las ramas son reales: si una célula se divide, las dos hijas existen.
- En el modo **posibilidades**, solo una rama es real (la vivida); las demás son alternativas. El árbol pasa a representar un espacio de decisiones, no un objeto físico.

#### 5.1 Preguntas frecuentes

**¿Por qué el número de piezas no supera nunca 48?** Porque el generador tiene un máximo de 48 objetos simultáneos (`maxCelulas`). Es un tope práctico para que el dibujo se lea; sin él, con probabilidad 0,15 el árbol crecería como (1,15)^t y tendría miles de ramas.

**¿Por qué las hijas aparecen separadas y no pegadas?** Porque al dividirse, las dos hijas nacen a una distancia de 0,2 en direcciones opuestas, elegidas al azar. Después cada una se mueve un poco al azar en cada paso (una caminata aleatoria con desvío 0,012). Así las ramas se distinguen en el dibujo.

**¿El mismo árbol sale siempre igual?** Sí. Todo usa un generador pseudoaleatorio con semilla: la misma semilla y la misma probabilidad dan el mismo árbol. Hay un test que lo verifica.

**¿Cómo elige la página la historia vivida?** Empieza en la raíz y, en cada división, elige una de las dos hijas con probabilidad 1/2, hasta llegar a una hoja. Uno de los tests comprueba que la historia vivida tiene exactamente una pieza en cada instante.

**¿Por qué la cantidad de ramas varía tanto entre árboles?** Porque la división es aleatoria. Con probabilidad 0,06 por paso, el número esperado de piezas después de t pasos es (1,06)^t, unas 31 a los 59 pasos, pero la dispersión es enorme: algunos árboles casi no se ramifican al principio y quedan chicos, y otros explotan temprano. La sección 12 explica por qué.

#### 5.2 Recorrido guiado

1. **El corte que miente.** Con el modo tiempo y el corte en 45, mirá solo el panel de la derecha. *¿Cuántos objetos hay y qué relación tienen?* Ocho, y desde el plano no hay forma de saber que están emparentados.
2. **Bajar el corte.** Mové el instante hacia 0. *¿En qué instante deja de haber ocho piezas?* Las piezas se van juntando de a pares a medida que se baja, hasta quedar una sola. Es el árbol leído desde arriba hacia abajo, como el coalescente de la sección 12.4.
3. **El tubo.** Probabilidad 0. *¿Qué forma tiene la historia?* Un tubo. Subí la probabilidad de a poco y mirá en qué valor aparece la primera rama con esta semilla.
4. **Posibilidades.** Cambiá de modo sin tocar nada más. *¿Qué cambió en el dibujo y qué no?* El árbol es idéntico; cambió el significado. Esa es la lección más importante de la herramienta: la misma figura puede ser un objeto real o un mapa de alternativas.
5. **Proyección.** Apretá "Proyección" y preguntá: *¿se puede saber, mirando solo esta imagen, cuál de las piezas es la más vieja?* No: la sombra perdió el orden temporal.
6. **Otro árbol, diez veces.** Apretá "Otro árbol" diez veces y anotá las ramas al final. Con p = 0,06 salen números entre menos de 10 y el máximo de 48. *¿Por qué tanta diferencia si las reglas son iguales?*

### 6. Limitaciones

- Usa una dimensión menos que la idea original: plano más tiempo, no espacio más tiempo.
- No modela la cuarta dimensión **espacial** (un objeto de cuatro dimensiones que atraviesa nuestro espacio), que es la tercera lectura posible de la idea.
- Los objetos solo se dividen; no se fusionan ni mueren antes del final.
- La interpretación de muchos mundos es una interpretación de la mecánica cuántica, no un hecho probado: el modo "posibilidades" es una imagen, no física.

## Parte II. Guía de la idea

### 7. Tres cuartas dimensiones

La idea original se formulaba así: si se mira algo a lo largo de toda su existencia como un solo objeto, y ese algo se ramifica, entonces su forma en "la cuarta dimensión" es un árbol. La frase es sugerente, pero "cuarta dimensión" puede querer decir tres cosas muy distintas:

1. **Una cuarta dimensión espacial.** Una dirección más del espacio, perpendicular a las tres que conocemos. Es la de Abbott, Hinton y los teseractos.
2. **El tiempo.** En la relatividad, el tiempo forma con el espacio un continuo de cuatro dimensiones. La historia entera de un objeto es una figura en ese continuo.
3. **Las posibilidades.** El conjunto de todos los futuros alternativos. No es una dimensión del espacio ni del tiempo, sino del "espacio de lo que podría pasar".

La herramienta obliga a elegir entre la segunda y la tercera, y deja la primera como próximo paso. Esta guía recorre las tres, con más detalle en las dos que la herramienta implementa.

### 8. El tiempo como dimensión

#### 8.1 Minkowski y las líneas de mundo

El 21 de septiembre de 1908, Hermann Minkowski dio en Colonia una conferencia que empezaba con una frase famosa: desde ese momento, el espacio por sí mismo y el tiempo por sí mismo estaban condenados a desvanecerse en meras sombras, y solo una especie de unión de ambos conservaría una realidad independiente. La conferencia, *Raum und Zeit*, se publicó en 1909 (*Physikalische Zeitschrift*, 10, 104–111) y le dio a la relatividad especial de Einstein (1905) su forma geométrica: el **espacio-tiempo**.

Minkowski introdujo la noción de **línea de mundo** (*Weltlinie*): la trayectoria de una partícula en el espacio-tiempo, el conjunto de todos los eventos de su existencia. Una partícula quieta tiene una línea de mundo recta y paralela al eje del tiempo; una que se mueve, una línea inclinada; una que acelera, una curva. Un objeto extendido, como una pelota o una persona, no tiene una línea sino un **tubo de mundo**: el conjunto de todos los puntos que ocupa en todos los instantes.

Ese tubo es exactamente lo que la herramienta dibuja cuando la probabilidad de dividirse es cero.

#### 8.2 El universo bloque

Si el espacio-tiempo es una estructura de cuatro dimensiones y las historias de los objetos son figuras en ella, surge una imagen inquietante: el **universo bloque**. Todo lo que pasó, pasa y pasará está "ahí", en el bloque. El presente no tiene privilegio físico; es solo el corte en el que nos encontramos.

Hermann Weyl lo expresó en *Philosophie der Mathematik und Naturwissenschaft* (1927; edición inglesa ampliada de 1949) con una fórmula que se cita a menudo: el mundo objetivo simplemente **es**, no **sucede**; solo para la conciencia que recorre la línea de mundo de su cuerpo aparece una sección del mundo como imagen fugaz. Einstein, en una carta de condolencias a la familia de su amigo Michele Besso en 1955, escribió que para los físicos convencidos la distinción entre pasado, presente y futuro es solo una ilusión, aunque persistente.

La herramienta es una maqueta del universo bloque en miniatura: el árbol completo es la historia; el plano del corte es el presente de alguien adentro; mover el deslizador de "instante" es recorrer la línea de mundo.

#### 8.3 Por qué el presente no es único

La relatividad especial agrega un argumento a favor del bloque. Dos observadores que se mueven uno respecto del otro no coinciden en qué eventos son simultáneos: cortan el espacio-tiempo con "planos de simultaneidad" inclinados distinto. C. W. Rietdijk (1966) y Hilary Putnam (*Journal of Philosophy*, 64, 240–247, 1967) argumentaron que, si cada observador tiene el mismo derecho a considerar real su presente, y los presentes de observadores en movimiento relativo incluyen eventos que para otro son futuros, entonces el futuro tiene que ser tan real como el presente.

En la herramienta, el corte es siempre horizontal: un solo "ahora". Con la relatividad habría que permitir cortes inclinados, y dos observadores verían conjuntos distintos de piezas. El número de piezas en un corte no es una propiedad absoluta del árbol, sino del árbol **y** del corte elegido.

#### 8.4 Los conos de luz

La relatividad pone además una restricción a la forma de los árboles: ningún objeto puede moverse más rápido que la luz, así que ninguna línea de mundo puede inclinarse más que 45° (en unidades donde c = 1). Cada evento tiene un **cono de luz**, y las ramas que salen de él tienen que quedar adentro. En la herramienta, la deriva por paso es 0,012 y la separación inicial de las hijas es 0,2 por división: las ramas suben casi verticales, muy lejos de cualquier límite. Pero en un modelo relativista de un proceso que se ramifica (por ejemplo, la cascada de partículas que produce un rayo cósmico al entrar en la atmósfera), los conos de luz son los que dan la forma del árbol.

Stephen Hawking y George Ellis desarrollaron la geometría de estas estructuras causales en *The Large Scale Structure of Space-Time* (1973), donde el conjunto de eventos que pueden influir sobre otro es una parte central de la teoría.

### 9. Perdurar o durar: lo que dicen los filósofos

#### 9.1 McTaggart y las dos series

En 1908, el mismo año de la conferencia de Minkowski, el filósofo británico John McTaggart publicó *The unreality of time* (*Mind*, 17, 457–474). Distinguió dos formas de ordenar los eventos. La **serie A** los ordena como pasados, presentes y futuros, propiedades que cambian (lo futuro se vuelve presente y luego pasado). La **serie B** los ordena como anteriores o posteriores unos a otros, relaciones que no cambian nunca. McTaggart argumentó que el tiempo requiere la serie A, que la serie A es contradictoria y que, por lo tanto, el tiempo es irreal. Pocos aceptan la conclusión, pero la distinción quedó: el universo bloque es un mundo de pura serie B.

La herramienta tiene las dos. El árbol completo es serie B: cada punto tiene una altura fija. El deslizador de instante agrega la serie A: marca un "ahora" y lo mueve.

#### 9.2 Perdurantismo y endurantismo

La idea original pide mirar "la vida entera de algo como un solo objeto". En metafísica, esa postura tiene nombre: **perdurantismo** o **cuatridimensionalismo**. Según ella, un objeto que existe a lo largo del tiempo es como un gusano en el espacio-tiempo, formado por **partes temporales**: la persona de hoy es un corte de un objeto que se extiende desde su nacimiento hasta su muerte. La postura opuesta, el **endurantismo**, dice que el objeto está entero en cada instante y "atraviesa" el tiempo, como un viajero.

David Lewis defendió el perdurantismo en *On the Plurality of Worlds* (1986), y Theodore Sider lo desarrolló en *Four-Dimensionalism: An Ontology of Persistence and Time* (2001). Uno de los argumentos a favor es que resuelve con naturalidad algunos acertijos sobre la identidad, y la ramificación es uno de ellos.

#### 9.3 La ameba y la identidad

Si una ameba se divide en dos, ¿cuál de las hijas es la ameba original? Ninguna, ambas, o la pregunta no tiene sentido. Derek Parfit discutió casos así en *Reasons and Persons* (1984), con experimentos mentales de personas que se "dividen" (por ejemplo, un cerebro cuyos hemisferios se trasplantan a dos cuerpos). Su conclusión fue que la identidad personal no es lo que importa; lo que importa es la continuidad psicológica, que sí puede ramificarse.

El perdurantista tiene una respuesta limpia: el objeto de cuatro dimensiones es el árbol entero. Antes de la división, el tronco es parte de dos gusanos que se solapan; después, cada rama es parte de uno. La herramienta dibuja exactamente esa respuesta: el árbol es un solo objeto, y la pregunta "¿cuál de las hijas es la madre?" se reemplaza por "¿qué partes del árbol comparten estas dos ramas?". En el corte del instante 45 hay ocho piezas, pero todas son partes del mismo objeto.

### 10. Corte y proyección: dos maneras de aplanar una historia

#### 10.1 El corte

Un corte es la intersección del árbol con un plano de tiempo constante. Es lo que ve alguien que vive en un instante: piezas separadas, sin historia visible. La función `corte` del código devuelve las células que existen en el instante elegido (las que cumplen nace ≤ t < muere) con su posición en ese instante.

El corte es la forma natural de la experiencia. En cada momento vemos un estado del mundo; el pasado lo reconstruimos con memoria, registros y razonamiento.

#### 10.2 La proyección

Una proyección aplana todo el árbol sobre el plano, ignorando la altura. Es una sombra: muestra por dónde pasó cada rama, pero no cuándo. La función `proyeccion` del código junta todos los puntos de todas las trayectorias.

La proyección conserva información espacial que el corte pierde (todas las posiciones por las que pasó algo) y pierde información temporal que el corte conserva (qué estaba dónde a la vez). Ninguna de las dos alcanza para reconstruir el árbol. Las dos juntas, tampoco del todo: varias historias distintas pueden tener la misma proyección y los mismos cortes en algunos instantes.

#### 10.3 Muybridge y Marey

La diferencia entre corte y proyección tiene una historia visual. En 1878, Eadweard Muybridge fotografió un caballo al galope con una fila de cámaras disparadas en sucesión, y resolvió una vieja discusión: en algún momento, las cuatro patas están en el aire. Cada foto de Muybridge es un **corte**: un instante aislado. Su serie es una secuencia de cortes, la base del cine.

Étienne-Jules Marey, fisiólogo francés, hizo en los años 1880 lo contrario: la **cronofotografía** en una sola placa, en la que un hombre que camina o un pájaro que vuela aparecen superpuestos en muchas posiciones en una sola imagen. Es una **proyección**: toda la historia del movimiento aplanada sobre el espacio. Marey lo describió en *Le mouvement* (1894). Marcel Duchamp tomó la idea para *Desnudo bajando una escalera n.º 2* (1912), y los futuristas italianos la convirtieron en un programa estético.

Linda Dalrymple Henderson mostró en *The Fourth Dimension and Non-Euclidean Geometry in Modern Art* (1983) cuánto influyeron la "cuarta dimensión" de Hinton y la cronofotografía en el cubismo y el futurismo: pintar un objeto desde varios puntos de vista a la vez era, para muchos de esos artistas, un intento de mostrar su forma en una dimensión más.

### 11. El tiempo que se ramifica de verdad: los linajes

#### 11.1 La célula que se divide

El modo "tiempo" de la herramienta tiene un modelo físico concreto: un linaje celular. Una célula se divide en dos, cada hija en dos, y así sucesivamente. Rudolf Virchow resumió en 1855 un principio de la biología celular con la frase *omnis cellula e cellula*: toda célula proviene de otra célula. Si se dibuja la historia de todas las células de un organismo con el tiempo hacia arriba, el resultado es un árbol cuya raíz es el cigoto.

#### 11.2 Sulston y el gusano transparente

Ese árbol se reconstruyó completo para un animal. *Caenorhabditis elegans* es un gusano de un milímetro, transparente, cuyo desarrollo es casi idéntico en todos los individuos. John Sulston, observando embriones vivos al microscopio durante horas, siguió cada división desde el huevo hasta el adulto. El trabajo, publicado con Einhard Schierenberg, John White y Nichol Thomson (*Developmental Biology*, 100, 64–119, 1983), describe el **linaje celular completo**: el árbol de las 671 células que se generan en el embrión, de las cuales 113 mueren por muerte celular programada. Sulston compartió el Premio Nobel de Fisiología o Medicina en 2002 con Sydney Brenner y Robert Horvitz.

El linaje de *C. elegans* es la idea de la herramienta hecha dato: una historia completa, vista como un solo objeto de cuatro dimensiones, con forma de árbol. Cada corte es el embrión en un instante; la historia completa es el árbol.

#### 11.3 Darwin y el árbol de la vida

A una escala mucho mayor, la historia de las especies también es un árbol. La única figura de *On the Origin of Species* (1859) de Charles Darwin es un diagrama de ramas que se dividen a lo largo del tiempo, con la mayoría extinguiéndose y algunas llegando al presente. Darwin cierra el capítulo IV con la imagen del "gran árbol de la vida", cuyas ramas muertas y rotas llenan la corteza de la tierra y cuyas ramificaciones vivas cubren la superficie.

Un corte en el presente muestra las especies vivas como piezas separadas; la historia completa las conecta. Es la misma relación entre corte y árbol que la herramienta dibuja. Ernst Haeckel popularizó en 1866 los árboles genealógicos de los seres vivos en *Generelle Morphologie der Organismen*, y hoy la filogenética reconstruye esos árboles a partir de secuencias de ADN, es decir, a partir del corte actual.

Una diferencia importante: el árbol de la vida no es estrictamente un árbol. La transferencia horizontal de genes entre bacterias y la hibridación entre especies hacen que algunas ramas se vuelvan a juntar. W. Ford Doolittle planteó en 1999 (*Science*, 284, 2124–2128) que, al menos en la base, la historia de la vida se parece más a una red que a un árbol. La herramienta solo permite divisiones, nunca fusiones; un modelo con fusiones daría un grafo con ciclos.

#### 11.4 Árboles que quedan escritos en el espacio

Algunos procesos que se ramifican en el tiempo dejan su historia grabada en el espacio, como si la naturaleza hiciera la proyección por nosotros. Un rayo avanza en pasos cortos, ramificándose; la figura que queda en una placa de acrílico atravesada por una descarga (una figura de Lichtenberg) es su historia aplanada. Un coral, un árbol de verdad o una red de ríos crecen agregando material en las puntas, y su forma final es el registro de todas las ramificaciones. Thomas Witten y Leonard Sander mostraron en 1981 (*Physical Review Letters*, 47, 1400–1403) que un modelo muy simple, partículas que se mueven al azar y se pegan al primer contacto con un agregado (la **agregación limitada por difusión**), produce estructuras ramificadas de dimensión fractal cercana a 1,7 en el plano, con el aspecto de esos objetos naturales. En todos estos casos, lo que vemos al final es una proyección, y para reconstruir el orden en que crecieron las ramas hay que saber algo del proceso: las puntas son lo más nuevo, la base lo más viejo.

### 12. La matemática de los árboles aleatorios

#### 12.1 Galton, Watson y la extinción de los apellidos

En 1873, Francis Galton propuso en *Educational Times* un problema: si en cada generación un hombre tiene un número aleatorio de hijos varones, ¿cuál es la probabilidad de que su apellido se extinga? El reverendo Henry William Watson dio una solución, y ambos publicaron *On the probability of the extinction of families* (*Journal of the Anthropological Institute*, 4, 138–144, 1875). Así nació la teoría de los **procesos de ramificación**.

El resultado central es que, si el número medio de hijos por individuo es m, el linaje se extingue con probabilidad 1 si m ≤ 1, y sobrevive con probabilidad positiva si m > 1. Theodore Harris sistematizó la teoría en *The Theory of Branching Processes* (1963). En la herramienta los objetos nunca mueren, así que no hay extinción, pero la variabilidad de los árboles viene de la misma matemática.

#### 12.2 El proceso de Yule

El generador de la herramienta es, salvo por el tope de 48 piezas, un **proceso de Yule** en tiempo discreto. George Udny Yule lo introdujo en 1925 (*Philosophical Transactions of the Royal Society B*, 213, 21–87) para explicar por qué algunos géneros biológicos tienen muchas especies y otros pocas. En cada paso, cada pieza se divide con probabilidad p, independientemente de las demás. El número esperado de piezas crece como

$$ E[N(t)] = (1 + p)^t $$

Con p = 0,06 y t = 59, eso da unas 31 piezas. El árbol del ejemplo tiene 15, la mitad de lo esperado; otros árboles de la misma probabilidad tienen 40 o más. La varianza es grande porque lo que pasa al principio pesa mucho: si la primera división tarda en llegar, todo el árbol queda atrasado; si llega pronto, se duplica la cantidad de "lugares" donde pueden ocurrir las siguientes. En el límite de tiempo largo, N(t) dividido por su media converge a una variable aleatoria con distribución exponencial, no a una constante: un proceso de Yule nunca "olvida" el azar de sus primeras divisiones.

#### 12.3 El camino vivido y su probabilidad

En el modo posibilidades, la historia vivida se elige tomando una hija al azar en cada división. Un camino que pasa por k divisiones tiene probabilidad (1/2)^k. Eso significa que las hojas de un árbol **no** son equiprobables: una hoja a la que se llega con pocas divisiones es mucho más probable que una que está al final de una rama muy ramificada. Si el árbol representara posibilidades, esta asimetría sería una afirmación fuerte: las ramas que se ramifican más "diluyen" su probabilidad. Es una pregunta que, en la interpretación de muchos mundos, se discute con mucho más cuidado (sección 14.3).

#### 12.4 Kingman y la mirada hacia atrás

Hay una manera complementaria de mirar el árbol: desde el corte hacia el pasado. Si se toman dos piezas del corte y se sigue su historia hacia abajo, en algún instante se encuentran en un antepasado común. John Kingman formalizó en 1982 (*Stochastic Processes and their Applications*, 13, 235–248) el **coalescente**, el proceso aleatorio que describe cómo se van juntando, hacia el pasado, los linajes de una muestra. Es la herramienta matemática básica de la genética de poblaciones: a partir del corte actual (el ADN de los individuos vivos) se infiere la forma del árbol que lo produjo.

En la herramienta, mirar hacia atrás desde el corte es fácil porque se ve el árbol entero. En la vida real solo se tiene el corte, y la forma del árbol se infiere.

### 13. Las posibilidades: tiempo ramificado

#### 13.1 Borges, 1941

En 1941, Jorge Luis Borges publicó "El jardín de senderos que se bifurcan", el cuento que da nombre a su libro de ese año, luego incluido en *Ficciones* (1944). Un espía chino en Inglaterra descubre que su antepasado Ts'ui Pên escribió una novela laberíntica en la que, a diferencia de todas las ficciones, cuando un personaje enfrenta una alternativa no elige una opción sino todas: crea diversos porvenires, diversos tiempos, que también proliferan y se bifurcan. El laberinto de Ts'ui Pên no está en el espacio sino en el tiempo.

Es exactamente el modo "posibilidades" de la herramienta. Y es también una anticipación literaria, unos quince años antes, de la idea que Hugh Everett propondría para la mecánica cuántica. Borges, que conocía bien las paradojas del tiempo de la filosofía, lo presentó como una "imagen incompleta, pero no falsa, del universo".

#### 13.2 Prior y la lógica del tiempo ramificado

En filosofía y lógica, el futuro abierto tiene una formalización precisa. Arthur Prior, lógico neozelandés, creó la **lógica temporal** en los años cincuenta y sesenta. En *Past, Present and Future* (1967) discutió modelos en los que el tiempo es lineal hacia el pasado pero se ramifica hacia el futuro: cada instante tiene un único pasado y muchos futuros posibles. Richmond Thomason (1970, *Theoria*, 36, 264–281) y, más tarde, Nuel Belnap, Michael Perloff y Ming Xu en *Facing the Future* (2001) desarrollaron la semántica de esos árboles, llamada *branching time*.

La pregunta que esos lógicos se hacían es antigua: Aristóteles, en el capítulo 9 de *Sobre la interpretación*, discutió si la oración "mañana habrá una batalla naval" es verdadera o falsa hoy. Si lo es, el futuro parece determinado; si no lo es, el principio de bivalencia (toda oración es verdadera o falsa) falla. En un tiempo ramificado, la oración es verdadera en algunas ramas y falsa en otras, y su valor hoy depende de cómo se cuantifique sobre las ramas.

#### 13.3 Leibniz y los mundos posibles

Gottfried Wilhelm Leibniz pensó el espacio de las posibilidades como un conjunto de **mundos posibles**, cada uno una historia completa y coherente. En los *Ensayos de Teodicea* (1710) sostuvo que Dios eligió crear el mejor de ellos. David Lewis, en *On the Plurality of Worlds* (1986), llevó la idea al extremo con el **realismo modal**: todos los mundos posibles existen tan concretamente como el nuestro. En la herramienta, eso equivaldría a que todas las ramas del modo "posibilidades" fueran tan reales como la naranja: la diferencia entre los dos modos desaparecería.

#### 13.4 Árboles de decisión y de juego

Fuera de la filosofía, el árbol de posibilidades es una herramienta práctica. John von Neumann y Oskar Morgenstern formalizaron en *Theory of Games and Economic Behavior* (1944) los juegos en **forma extensiva**: un árbol en el que cada nodo es una situación, cada rama una jugada y cada hoja un resultado. Los programas que juegan ajedrez o go exploran árboles de este tipo. En economía y medicina, los árboles de decisión ordenan elecciones bajo incertidumbre. En todos estos casos, se recorre un solo camino; el árbol representa lo que se pudo hacer.

### 14. Muchos mundos

#### 14.1 Everett, 1957

En 1957, Hugh Everett III, estudiante de doctorado de John Wheeler en Princeton, publicó *"Relative state" formulation of quantum mechanics* (*Reviews of Modern Physics*, 29, 454–462). Propuso tomar la ecuación de Schrödinger al pie de la letra, sin colapso de la función de onda. Cuando un observador mide un sistema en superposición, el observador queda entrelazado con el sistema, y el estado total contiene una "rama" por cada resultado posible, con un observador que vio ese resultado.

Bryce DeWitt popularizó la propuesta en 1970 con un artículo en *Physics Today* (23(9), 30–35) y la llamó la interpretación de los **muchos mundos**. En ella, el árbol de posibilidades deja de ser una imagen de lo que podría haber pasado y se vuelve una descripción de lo que pasa: todas las ramas existen.

#### 14.2 Decoherencia y ramas

Una objeción clásica a Everett era que no queda claro qué cuenta como "rama". La teoría de la decoherencia (Zeh, 1970; Zurek, 2003) dio una respuesta: el entorno selecciona ciertos estados robustos y destruye las superposiciones entre ellos, y las ramas son las historias de esos estados. David Wallace defendió esta versión en *The Emergent Multiverse* (2012). Murray Gell-Mann y James Hartle desarrollaron, con el formalismo de las **historias decoherentes**, una manera de asignar probabilidades a historias completas, que es la noción más cercana a "un camino por el árbol" en la mecánica cuántica.

#### 14.3 El problema de las probabilidades

Si todas las ramas existen, ¿qué significa que un resultado tenga probabilidad 0,3? Es el problema más discutido de la interpretación de Everett. David Deutsch (1999) y Wallace propusieron derivar la regla de Born (las probabilidades son el cuadrado de la amplitud) a partir de la teoría de la decisión: un agente racional que sabe que se va a ramificar debería apostar como si las ramas tuvieran esos pesos. No hay consenso sobre si el argumento funciona.

En la herramienta, la historia vivida se elige con probabilidad 1/2 en cada división, y por eso las hojas tienen probabilidades distintas según cuántas divisiones haya en su camino. En la mecánica cuántica, las ramas no tienen por qué ser equiprobables: el peso de cada una lo da la amplitud. La herramienta no pretende modelar esto; el README lo aclara: el modo posibilidades "es una imagen, no física".

#### 14.4 Lo que no se puede observar

Un punto que la herramienta deja ver con claridad: en el modo posibilidades, alguien que vive en la rama naranja **no puede** ver las otras ramas. Su corte tiene una sola pieza. Las siete "posibles" que informa la estadística son visibles solo para quien mira el árbol desde afuera. Esa asimetría es la que hace que la interpretación de muchos mundos sea tan difícil de poner a prueba: las otras ramas no dejan huella en la nuestra. La diferencia con el modo tiempo es tajante: allí, alguien en el corte ve las ocho piezas.

### 15. La tercera lectura: un objeto de cuatro dimensiones espaciales

La idea original podía referirse también a una cuarta dimensión **espacial**. En ese caso, el árbol no sería la historia de un objeto en el tiempo sino un objeto quieto en un espacio de cuatro dimensiones, y lo que veríamos sería su corte con nuestro espacio de tres. Si ese objeto de cuatro dimensiones se moviera a través de nuestro espacio, veríamos una secuencia de cortes: objetos que aparecen, se dividen y desaparecen.

Es la misma geometría que la del modo tiempo, con una diferencia de interpretación: en un caso la dirección extra es el tiempo y los cortes se suceden; en el otro es espacio y los cortes se suceden solo si el objeto se mueve. Edwin Abbott, en *Flatland* (1884), y Charles Hinton, en *The Fourth Dimension* (1904), exploraron esa lectura. La herramienta la deja como próximo paso; el proyecto Dimensional Fishbowl, del mismo autor, la desarrolla para objetos simples.

### 16. Tubos, árboles y redes: una clasificación de historias

La herramienta muestra dos formas de historia: el **tubo** (sin divisiones) y el **árbol** (con divisiones). Hay más:

| Forma de la historia | Qué pasa en el tiempo | Ejemplo |
|---|---|---|
| Tubo | Un objeto persiste sin dividirse | Una piedra, un electrón libre |
| Tubo que termina | Un objeto se destruye | Una vela que se consume |
| Árbol | Un objeto se divide y las partes persisten | Un linaje celular, un río que forma un delta |
| Árbol invertido | Varios objetos se fusionan en uno | Afluentes que forman un río, gotas que se juntan |
| Red | Hay divisiones y fusiones | La historia evolutiva con transferencia horizontal de genes; la genealogía humana |
| Bucle | Una línea de mundo vuelve sobre sí misma | Solo en soluciones exóticas de la relatividad general (curvas temporales cerradas) |

Topológicamente, un árbol es un grafo sin ciclos. Esa propiedad tiene una consecuencia que el corte deja ver: dos piezas de un corte tienen **un único** antepasado común más reciente. En una red, en cambio, puede haber varios. La genealogía humana es una red: cada persona tiene dos padres, cuatro abuelos, y unas pocas decenas de generaciones atrás aparecen los mismos antepasados por muchos caminos. Joseph Chang mostró en 1999 (*Advances in Applied Probability*, 31, 1002–1026) que, en una población que se mezcla al azar, el antepasado común más reciente de todos sus individuos vivió hace un número de generaciones del orden del logaritmo en base 2 del tamaño de la población.

Richard Feynman agregó una forma más en 1949 (*Physical Review*, 76, 749–759): en su teoría del positrón, un positrón puede describirse como un electrón cuya línea de mundo va hacia atrás en el tiempo. Una línea que sube, da la vuelta y baja se ve, en los cortes, como un par electrón-positrón que se crea y, más tarde, como un par que se aniquila. La forma de la historia determina lo que se ve en cada corte de una manera que ningún corte aislado revela.

### 17. Una dimensión más: lo que cambiaría con espacio de tres dimensiones

El próximo paso del proyecto es llevar la visualización a la idea original: un objeto en el espacio de tres dimensiones que se divide con el tiempo. La historia completa sería un árbol de cuatro dimensiones, que ya no se puede dibujar entero. ¿Qué se puede mostrar, entonces?

**Cortes animados.** Un corte de un árbol de cuatro dimensiones a tiempo constante es un conjunto de objetos de tres dimensiones: por ejemplo, esferas que representan células. Recorrer el tiempo es animar esos cortes. Es lo que hacen los microscopios de lámina de luz que filman embriones completos durante horas: Philipp Keller y colaboradores reconstruyeron así, en 2008, el desarrollo temprano del pez cebra célula por célula (*Science*, 322, 1065–1069). El resultado es una película de cortes tridimensionales y, a partir de ella, el árbol de linajes.

**Proyecciones parciales.** Se puede proyectar el árbol de cuatro dimensiones a tres olvidando una coordenada espacial, y dibujar en tres dimensiones el árbol resultante (dos de espacio más tiempo). Es exactamente lo que la herramienta hace hoy: su "plano" puede pensarse como una proyección del espacio de tres dimensiones. La información que se pierde es la profundidad.

**El grafo del linaje.** Si lo que interesa es la forma (quién viene de quién y cuándo), no hace falta dibujar posiciones: el árbol se dibuja como un dendrograma, con el tiempo en un eje y las ramas separadas en el otro sin significado espacial. Los biólogos lo hacen así, desde el diagrama de Darwin hasta los árboles filogenéticos actuales. Se pierde la geometría, se gana claridad.

**Lo que no cambia.** Las propiedades que la herramienta ilustra no dependen de la dimensión: el corte sigue mostrando piezas separadas que comparten un pasado, la proyección sigue perdiendo el orden temporal, un objeto que no se divide sigue siendo un tubo, y la diferencia entre el modo tiempo y el modo posibilidades sigue siendo de interpretación, no de forma. Por eso la versión plana es un buen modelo de la idea: es la idea con una dimensión menos, no una idea distinta.

### 18. Del modelo al código

| Concepto | Función en `src/arbol.js` | Qué produce en la página |
|---|---|---|
| Generador con semilla | `rng(semilla)` (interno) | Árboles reproducibles |
| Proceso de división con deriva | `generar(params)` | El árbol completo, con `celulas` que guardan `nace`, `muere`, `padre`, `hijos` y `tray` |
| Posición en un instante | `posicion(c, t)` | Dónde está cada pieza |
| Corte | `corte(arbol, t)` | El panel "Lo que se ve en el plano", modo corte |
| Proyección | `proyeccion(arbol)` | El panel en modo proyección |
| Historia vivida | `historia(arbol, semilla)` | La rama naranja |
| Hojas | `hojas(arbol)` | "Ramas al final" |

Parámetros por defecto (`DEFECTO`): 60 instantes, probabilidad de división 0,06, máximo de 48 piezas, deriva 0,012 por paso, separación inicial de las hijas 0,2 y semilla 5.

Los tests (`test/arbol.test.js`) verifican: que si nunca se divide la historia es un tubo con una sola célula siempre; que si se divide el corte crece con el tiempo sin pasar del máximo; que cada hija nace justo cuando termina su madre; que las hojas son las que existen al final; que una historia vivida tiene exactamente una célula en cada instante; que la proyección junta todos los puntos de la historia, y que la misma semilla da el mismo árbol.

```js
const A = require("./src/arbol.js");
const arbol = A.generar({});            // semilla 5, p = 0,06
A.corte(arbol, 45).length;              // 8
A.hojas(arbol).length;                  // 15
A.generar({ probDivision: 0 }).celulas.length;   // 1 (un tubo)
```

### 19. Ejercicios

1. Con p = 0,06, calculá el número esperado de piezas en el instante 30. Después generá varios árboles con "Otro árbol" y anotá cuántas piezas hay en el corte 30. ¿Cuánto se dispersan?
2. ¿Qué probabilidad de división hace que el número esperado de ramas al final sea 48? (Resolvé (1 + p)^59 = 48.)
3. En el modo posibilidades, si la historia vivida pasó por 4 divisiones, ¿qué probabilidad tenía de ser elegida?
4. Dibujá a mano el árbol de un objeto que se divide en el instante 10, cuyas hijas se vuelven a juntar en el instante 30. ¿Qué ve alguien en los cortes 5, 20 y 40? ¿Por qué ese objeto no puede salir de la herramienta?
5. Leé "El jardín de senderos que se bifurcan" y señalá en qué se parece y en qué no la novela de Ts'ui Pên al modo posibilidades.
6. Con una foto de exposición larga (o una app que la simule), fotografiá a alguien caminando. Explicá por qué la imagen es una proyección y no un corte.
7. Escribí, en una página, cuál de las tres "cuartas dimensiones" es la de la idea original y por qué. Es el tercer próximo paso del proyecto.

### 20. Glosario

- **Línea de mundo:** la trayectoria de una partícula en el espacio-tiempo.
- **Tubo de mundo:** la región del espacio-tiempo ocupada por un objeto extendido a lo largo de su existencia.
- **Universo bloque:** la idea de que pasado, presente y futuro existen por igual en el espacio-tiempo.
- **Corte:** intersección de una historia con un instante.
- **Proyección:** aplanamiento de una historia sobre el espacio, sin el orden temporal.
- **Perdurantismo:** la tesis de que los objetos persisten teniendo partes temporales.
- **Proceso de ramificación:** modelo aleatorio en el que cada individuo produce un número aleatorio de descendientes.
- **Proceso de Yule:** proceso de ramificación sin muerte, en el que cada individuo se divide a tasa constante.
- **Coalescente:** proceso que describe cómo se juntan hacia el pasado los linajes de una muestra.
- **Tiempo ramificado:** modelo lógico en el que el pasado es único y el futuro tiene muchas ramas posibles.
- **Muchos mundos:** interpretación de la mecánica cuántica en la que todas las ramas de una medición existen.

### 21. Conclusión

La idea de que la historia completa de algo que se divide tiene forma de árbol es correcta, y la herramienta la muestra con un ejemplo que se puede girar, cortar y proyectar. Pero la idea gana precisión al separar sus tres lecturas. Si la dimensión extra es el **tiempo**, el árbol es un objeto real del espacio-tiempo de Minkowski, como el linaje celular de *C. elegans* que Sulston reconstruyó célula por célula, y cada instante es un corte en el que piezas que parecen independientes comparten un pasado. Si la dimensión extra es el conjunto de las **posibilidades**, el árbol es el jardín de Borges y el tiempo ramificado de Prior, y en él se vive una sola rama; si además todas las ramas existen, es el multiverso de Everett. Si es una dimensión **espacial**, el árbol sería un objeto de cuatro dimensiones que atraviesa nuestro espacio, la lectura que la herramienta deja para después.

La herramienta agrega dos correcciones a la idea: un objeto que no se ramifica no es un árbol sino un tubo, y lo que vemos en un instante es un corte, no una sombra. El paso siguiente, según el propio proyecto, es escribir el concepto en una página eligiendo una de las tres lecturas, y llevar la visualización a espacio de tres dimensiones más tiempo.

## Referencias

- Aristóteles. (ca. 350 a. C.). *Sobre la interpretación* (*Peri hermeneias*), cap. 9.
- Belnap, N., Perloff, M., & Xu, M. (2001). *Facing the Future: Agents and Choices in Our Indeterminist World*. Oxford University Press. ISBN 978-0-19-513878-8.
- Borges, J. L. (1941). *El jardín de senderos que se bifurcan*. Buenos Aires: Sur. (Incluido en *Ficciones*, 1944.)
- Chang, J. T. (1999). Recent common ancestors of all present-day individuals. *Advances in Applied Probability*, 31(4), 1002–1026. https://doi.org/10.1239/aap/1029955256
- Darwin, C. (1859). *On the Origin of Species by Means of Natural Selection*. Londres: John Murray.
- DeWitt, B. S. (1970). Quantum mechanics and reality. *Physics Today*, 23(9), 30–35. https://doi.org/10.1063/1.3022331
- Doolittle, W. F. (1999). Phylogenetic classification and the universal tree. *Science*, 284(5423), 2124–2128. https://doi.org/10.1126/science.284.5423.2124
- Everett, H. (1957). "Relative state" formulation of quantum mechanics. *Reviews of Modern Physics*, 29(3), 454–462. https://doi.org/10.1103/RevModPhys.29.454
- Feynman, R. P. (1949). The theory of positrons. *Physical Review*, 76(6), 749–759. https://doi.org/10.1103/PhysRev.76.749
- Haeckel, E. (1866). *Generelle Morphologie der Organismen*. Berlín: Georg Reimer.
- Harris, T. E. (1963). *The Theory of Branching Processes*. Springer.
- Hawking, S. W., & Ellis, G. F. R. (1973). *The Large Scale Structure of Space-Time*. Cambridge University Press. ISBN 978-0-521-09906-6.
- Henderson, L. D. (1983). *The Fourth Dimension and Non-Euclidean Geometry in Modern Art*. Princeton University Press. ISBN 978-0-691-10142-2.
- Hinton, C. H. (1904). *The Fourth Dimension*. Londres: Swan Sonnenschein.
- Keller, P. J., Schmidt, A. D., Wittbrodt, J., & Stelzer, E. H. K. (2008). Reconstruction of zebrafish early embryonic development by scanned light sheet microscopy. *Science*, 322(5904), 1065–1069. https://doi.org/10.1126/science.1162493
- Kingman, J. F. C. (1982). The coalescent. *Stochastic Processes and their Applications*, 13(3), 235–248. https://doi.org/10.1016/0304-4149(82)90011-4
- Leibniz, G. W. (1710). *Essais de Théodicée sur la bonté de Dieu, la liberté de l'homme et l'origine du mal*. Ámsterdam: Isaac Troyel.
- Lewis, D. (1986). *On the Plurality of Worlds*. Blackwell. ISBN 978-0-631-13994-6.
- Marey, É.-J. (1894). *Le mouvement*. París: G. Masson.
- McTaggart, J. M. E. (1908). The unreality of time. *Mind*, 17(68), 457–474. https://doi.org/10.1093/mind/XVII.4.457
- Minkowski, H. (1909). Raum und Zeit. *Physikalische Zeitschrift*, 10, 104–111.
- von Neumann, J., & Morgenstern, O. (1944). *Theory of Games and Economic Behavior*. Princeton University Press.
- Parfit, D. (1984). *Reasons and Persons*. Oxford University Press. ISBN 978-0-19-824908-5.
- Prior, A. N. (1967). *Past, Present and Future*. Oxford: Clarendon Press.
- Putnam, H. (1967). Time and physical geometry. *The Journal of Philosophy*, 64(8), 240–247. https://doi.org/10.2307/2024493
- Rietdijk, C. W. (1966). A rigorous proof of determinism derived from the special theory of relativity. *Philosophy of Science*, 33(4), 341–344. https://doi.org/10.1086/288106
- Sider, T. (2001). *Four-Dimensionalism: An Ontology of Persistence and Time*. Oxford University Press. ISBN 978-0-19-924443-0.
- Sulston, J. E., Schierenberg, E., White, J. G., & Thomson, J. N. (1983). The embryonic cell lineage of the nematode *Caenorhabditis elegans*. *Developmental Biology*, 100(1), 64–119. https://doi.org/10.1016/0012-1606(83)90201-4
- Thomason, R. H. (1970). Indeterminist time and truth-value gaps. *Theoria*, 36(3), 264–281. https://doi.org/10.1111/j.1755-2567.1970.tb00427.x
- Wallace, D. (2012). *The Emergent Multiverse: Quantum Theory According to the Everett Interpretation*. Oxford University Press. ISBN 978-0-19-954696-1.
- Watson, H. W., & Galton, F. (1875). On the probability of the extinction of families. *Journal of the Anthropological Institute of Great Britain and Ireland*, 4, 138–144. https://doi.org/10.2307/2841222
- Weyl, H. (1949). *Philosophy of Mathematics and Natural Science*. Princeton University Press.
- Witten, T. A., & Sander, L. M. (1981). Diffusion-limited aggregation, a kinetic critical phenomenon. *Physical Review Letters*, 47(19), 1400–1403. https://doi.org/10.1103/PhysRevLett.47.1400
- Yule, G. U. (1925). A mathematical theory of evolution, based on the conclusions of Dr. J. C. Willis, F.R.S. *Philosophical Transactions of the Royal Society B*, 213, 21–87. https://doi.org/10.1098/rstb.1925.0002
- Zurek, W. H. (2003). Decoherence, einselection, and the quantum origins of the classical. *Reviews of Modern Physics*, 75(3), 715–775. https://doi.org/10.1103/RevModPhys.75.715
