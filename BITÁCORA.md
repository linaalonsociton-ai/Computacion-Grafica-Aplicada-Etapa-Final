**TP1 — Bitácora de proceso con IA 2026**  
**Estudiantes: Alonso Citón, Bello, Capurro, Celi, Gómez, Hansen.**

**\---**

**Entrada \#1 — 5/6 —** 

**Objetivo**  
**Obtener una primera versión en código de la pintura de referencia de Ima Pico, para entender qué tan bien la IA podía interpretar la composición a partir de una imagen.**

**Obtener una primera versión generativa e interactiva por sonido en código de la obra visual creada a partir de la serie de Ima Pico.**

**Prompt**  
**“Incorpora interacción por voz a este sketch sin alterar el resto del código. Que el volumen, el silencio, y los sonidos bruscos, sustituyan las tareas que realizan ahora los atajos de teclado”**

**Evaluación y corrección**  
**La IA generó una estructura general reconocible: fondo verde oscuro, el cuarto de círculo rosa, la barra azul, el triángulo celeste, la píldora lavanda y el bloque rojo. Sin embargo, las proporciones estaban desajustadas y varios colores eran aproximaciones. Las formas orgánicas (zigzag y onda) aparecían como líneas sueltas sin relación con las figuras que bordean. El resultado era útil como punto de partida pero no como réplica fiel.**

**La IA incorporó dicha interacción sin alterar el resto del sketch. Las bandas encargadas de detectar las frecuencias del sonido recibido por el usuario y traducirlas a interacciones en el sketch, estaban calibradas de forma ineficaz y poco confiable.**

**Aprendizaje**  
**La IA puede funcionar como punto de partida para incorporar determinadas herramientas, pero luego deben ser ajustadas manualmente y revisadas por bloques para asegurar su correcto funcionamiento.**  
**\---**

**Entrada \#2 — 5/6 — Señalame las líneas encargadas de calibrar el sonido y explicame que rol cumple cada una para que pueda ajustarlas manualmente.**

**Objetivo**  
**Comprender la incorporación de Audio en el Sketch realizada en la interacción anterior con la IA, y poder ajustar los aspectos deficientes del código con mayor precisión de qué es lo que genera el conflicto.**

**Aprendizaje**  
**Al comprender la lógica de las herramientas utilizadas y sugeridas por la IA para implementar en el sketch; es más sencillo reconocer dónde se encuentran los errores y “conversar” para arreglarlos con mayor precisión.**

**\---**

**Entrada \#3 — 5/6 — Al correr mi Sketch este error aparece (error de consola pegado). ¿Qué significa?**

**Objetivo**  
**Que la IA funcione como una asistencia cuando se nos traba el sketch y no comprendemos a qué se debe.**

**Aprendizaje**  
**Aunque a veces no entendamos exactamente los códigos o nomenclaturas dadas por la consola cuando hay un error; en general encontramos “pistas” que nos indican de donde proviene el inconveniente. Ejemplo: el término “eval” aparecía constantemente y resultó ser un error de permisos al incorporar audio al sketch y querer correrlo posteriormente en servidores como Chrome.**

**\---**

**Entrada \#4 — 5/6 — Sin alterar nada relacionado a la funcionalidad, emprolija el código limpiando comentarios redundantes o innecesarios y líneas repetidas o que hayan quedado viejas.**

**Objetivo**  
**Eliminar todo el contenido innecesario del código.**

**\---**

**Entrada \#5 — 14/6 — Explicame por qué no funciona bien mi audio cuando utilizo la librería de p5.js de sonido y que alternativa tengo.**

**Objetivo**  
**Corregir los problemas presentados durante la devolución de la preentrega final.**

**Aprendizaje**  
**p5.sound es una librería de JavaScript  que por razones técnicas hace que el micrófono tenga problemas para arrancar, y en ocasiones resulte menos eficiente.**  
**La alternativa más viable era Web Audio API, que es nativa del navegador.**

**\---**

**Entrada \#6 — 14/6 — Desglosa todos los bloques del sketch relacionados a la implementación del audio y explicamelos teniendo en cuenta este temario de conocimientos previos que poseo (lista con cosas que aprendimos como arrays, variables, etc.).** 

**Objetivo**  
**Terminar de comprender los puntos que quedaron “sueltos” en el código. Revisar que todo pueda ser comprendido por un estudiante universitario de segundo año de multimedial.**

**—**

**Entrada \#7 — 16/6 — Saca comentarios redundantes, líneas comentadas que ya no tengan funcionalidad clara. Ordena los bloques por función para que sea más fácil ubicarse.**

**Objetivo**  
**Emprolijar el sketch**

**Aprendizaje**  
**La IA usa muchos comentarios \!**

