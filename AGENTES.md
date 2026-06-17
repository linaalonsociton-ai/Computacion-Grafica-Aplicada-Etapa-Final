**Guía para agentes** (Kiro, Claude, Copilot, etc.) que trabajen sobre este repositorio. Leé esto antes de hacer cambios.

---

## Qué es este proyecto

TP Computación Gráfica Aplicada a Sistemas Generativos. Ima Pico Generativo. Sketch de Processing (P5.js); una obra visual generativa e interactiva inspirada en la familia visual de las pinturas "Ima Pico / Q3".

* Tecnología: Processing 4 (P5.js).  
* Entrega: universitaria. El código debe adaptarse a los conocimientos.  
* Estado actual: versión generativa e interactiva mediante sonido.  
* Idioma: todo el código, variables, comentarios y documentos en español.

---

## Reglas no negociables

Estas reglas vienen de la consigna académica y del criterio del autor. Respetalas sin excepción.

1. Processing p5.js exclusivamente.   
2. Sin recursos externos. Cero imágenes, cero fuentes externas, cero videos. Todo procedural.  
3. Renderizado 2D. No usar P3D, lights(), camera(), ni ningún efecto tridimensional.  
4. Estética plana. Nada de gradientes, sombras, blur. Colores sólidos.  
5. No inventar formas fuera del vocabulario de la serie.

---

## Cómo trabajar con el usuario

El usuario prefiere:

* Preguntar antes de asumir. Si una forma, posición o color no está clara, preguntar con opciones concretas.  
* Implementar pieza por pieza cuando estamos construyendo una composición nueva. No entregar todo junto de un tirón.  
* Planear antes de codear cuando el cambio es grande o ambiguo. Primero el plan, después el código.  
* Respuestas cortas. Directo al grano, sin preámbulos largos ni emojis.  
* Iteración visual. El usuario prueba en Processing, manda captura, ajustamos.

---

## Convenciones de código

* Nombres en español (dibujarCuartoCirculoRosa, colorFondo, etc.).  
* Orden de dibujo dentro de draw():

---

## Vocabulario de formas permitido

* Rectángulo (barra ancha o cuadrado)  
* Píldora (rectángulo con esquinas redondeadas)  
* Cuarto de círculo (arc con modo PIE)  
* Triángulo  
* Arcada (semicírculo sobre rectángulo)  
* Zigzag cerrado con borde blanco grueso  
* Onda cerrada con borde blanco grueso (bezier)  
* Motivo 4 triángulos (cuadrado dividido por diagonales)

Si el usuario pide una forma que no esté en esta lista, preguntar antes de implementar.

---

## Reglas compositivas

* Formas orgánicas (zigzag/onda) siempre con borde blanco grueso, siempre pegadas a un borde del lienzo, siempre solas (no tienen figuras pegadas a ellas).  
* Figuras geométricas simples nunca llevan stroke blanco — esto arruina la familia visual.

---

## Si el agente tiene que investigar

Orden de consulta:

1. .kiro/skills/ima-pico-painter.md — patrones de código probados y vocabulario de formas.  
2. .kiro/specs/ima-pico-generative/requirements.md — requerimientos formales (17 requerimientos, invariantes verificables).  
3. .kiro/specs/ima-pico-generative/design.md — diseño arquitectónico (aplica cuando se reintroduzca la parte generativa).  
4. \_ref\_replicator/src/components/P5Canvas.tsx — código p5.js de referencia del replicador web, útil para extraer coordenadas y curvas. Solo lectura.

---

## Qué NO hacer

* No reescribir todo el sketch sin preguntar.  
* No mezclar p5.js con Processing Java Mode.  
* No generar imágenes con loadImage() ni descargar recursos.  
* No usar colores random sin respetar la paleta de la serie.  
* No agregar stroke blanco a rectángulos, triángulos, círculos o arcadas.  
* No incrementar la complejidad arquitectónica sin que el usuario lo pida. Esto es un TP universitario, no un sistema de producción.

