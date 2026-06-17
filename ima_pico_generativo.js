//  Interacción por voz:
//    · Volumen sostenido  → intensidad visual (saturación + grosor de bordes)
//    · Golpe              → muta una forma al azar
//    · Silencio 3s        → resetea todas las mutaciones
//    · Silbido/agudo      → cicla la paleta de colores

//Interacción por teclado:
//    · flecha hacia arriba/abajo  → intensidad visual (saturación + grosor de bordes)
//    · "R" → muta una forma al azar
//    · "X" → resetea todas las mutaciones
//    · Barra Espaciadora → cicla la paleta de colores
//    · "D" → debug

//--- CANVAS / GRILLA
const LADO  = 600;
const MARCO = 22;
const GRID  = 500.0;
let s;

//--- PALETAS 
const NUM_PALETAS        = 4;
const COLORES_POR_PALETA = 14;
let paletas      = [];
let indicePaleta = 0;

//--- PARÁMETRO VISUAL
let intensidad = 0.0;
const PASO_INTENSIDAD   = 0.05;
const GROSOR_BORDE_MIN  = 12.0;
const GROSOR_BORDE_MAX  = 32.0;
const AMPL_ZIGZAG_MIN   = 1.0;
const AMPL_ZIGZAG_MAX   = 1.8;
const AMPL_ONDA_MIN     = 1.0;
const AMPL_ONDA_MAX     = 1.4;
const FACTOR_SAT_MIN    = 0.85;
const FACTOR_SAT_MAX    = 1.15;
const FACTOR_BR_MIN     = 0.95;
const FACTOR_BR_MAX     = 1.10;
const MOTIVO_LADO_MIN   = 70;
const MOTIVO_LADO_MAX   = 110;

//--- SLOTS DE PALETA
const SLOT_FONDO          = 0;
const SLOT_ZIGZAG         = 1;
const SLOT_ONDA           = 2;
const SLOT_CUARTO_CIRCULO = 3;
const SLOT_BARRA_AMARILLA = 4;
const SLOT_RECT_AZUL      = 5;
const SLOT_TRIANGULO      = 6;
const SLOT_ARCADA         = 7;
const SLOT_CUADRADO_ROJO  = 8;
const SLOT_PILDORA        = 9;
const SLOT_MOTIVO_SUP     = 10;
const SLOT_MOTIVO_DER     = 11;
const SLOT_MOTIVO_INF     = 12;
const SLOT_MOTIVO_IZQ     = 13;

//--- FORMAS Y VARIANTES
const NUM_FORMAS        = 10;
const F_ZIGZAG          = 0;
const F_ONDA            = 1;
const F_CUARTO_CIRCULO  = 2;
const F_BARRA_AMARILLA  = 3;
const F_RECT_AZUL       = 4;
const F_TRIANGULO       = 5;
const F_ARCADA          = 6;
const F_CUADRADO_ROJO   = 7;
const F_PILDORA         = 8;
const F_MOTIVO          = 9;

const VARIANTES_POR_FORMA   = 4;
let variantes               = new Array(NUM_FORMAS).fill(0);
let flashFrames             = new Array(NUM_FORMAS).fill(0);
const FLASH_DURACION        = 20;

let modoDebug = false;

//--- WEB AUDIO API 
let audioCtx   = null;
let analyser   = null;
let micStream  = null;
let audioListo = false;

const FFT_SIZE   = 1024;
let bufferTiempo = null;
let bufferFreq   = null;

let rmsRaw    = 0.0;
let rmsPrev   = 0.0;
let rmsSmooth = 0.0;

let noiseFloor = 0.02;
const NOISE_ADAPT_RATE   = 0.001;
const NOISE_MARGIN       = 1.8;
const NOISE_ADAPT_MARGIN = 2.6;

let intensidadTarget = 0.0;
const SMOOTH_UP   = 0.08;
const SMOOTH_DOWN = 0.04;

//--- DETECCIÓN DE ONSET (golpe/palmas) 
const ONSET_THRESHOLD_FACTOR = 4.0;
const ONSET_MIN_RMS_FACTOR   = 2.5;
const ONSET_COOLDOWN_MS      = 350;
let lastOnsetTime = 0;

//--- DETECCIÓN DE SILENCIO SOSTENIDO → reset
const SILENCIO_UMBRAL_FACTOR = 1.3;
const SILENCIO_RESET_MS      = 3000;
let silenceStartTime = null;
let silenceResetDone = false;

//--- DETECCIÓN DE SONIDO AGUDO SOSTENIDO → cambio de paleta
const HIGH_FREQ_BIN_START_RATIO = 0.05;
const HIGH_FREQ_ENERGY_RATIO    = 0.62;
const HIGH_FREQ_MIN_RMS_FACTOR  = 3.0;
const PITCH_FRAMES_NEEDED       = 8;
let pitchHighCount   = 0;
const PALETA_COOLDOWN_MS = 1200;
let lastPaletaChange = 0;


//---------- SETUP DE MICRÓFONO ----------
async function iniciarMicrofono() {
  if (audioListo) return;

  if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
    const msg =
      'El navegador no permite acceder al micrófono en este contexto.\n\n' +
      'Esto pasa típicamente si abriste el archivo con doble-click (file://).\n' +
      'Abrí el sketch desde un servidor local (http://localhost:...) o por HTTPS.';
    console.error(msg);
    alert(msg);
    throw new Error('getUserMedia no disponible en este contexto');
  }

  try {
    micStream = await navigator.mediaDevices.getUserMedia({
      audio: { echoCancellation: false, noiseSuppression: false, autoGainControl: false }
    });

    audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    if (audioCtx.state === 'suspended') await audioCtx.resume();

    analyser = audioCtx.createAnalyser();
    analyser.fftSize               = FFT_SIZE;
    analyser.smoothingTimeConstant = 0.5;

    audioCtx.createMediaStreamSource(micStream).connect(analyser);

    bufferTiempo = new Uint8Array(analyser.fftSize);
    bufferFreq   = new Uint8Array(analyser.frequencyBinCount);

    noiseFloor = 0.02;
    audioListo = true;

    console.log('Micrófono activo. AudioContext sampleRate:', audioCtx.sampleRate);

  } catch (err) {
    console.error('Error al acceder al micrófono:', err.name, err.message);
    alert(
      'No se pudo acceder al micrófono.\n' +
      'Causa: ' + err.name + ' — ' + err.message + '\n\n' +
      'Asegurate de:\n' +
      '  • Abrir el sketch desde un servidor local (no desde file://)\n' +
      '  • Permitir el acceso al micrófono en el navegador\n' +
      '  • Tener un micrófono conectado'
    );
    throw err;
  }
}

//----------- PROCESAMIENTO DE AUDIO ----------
function procesarAudio() {
  if (!audioListo) return;

  //--- RMS 
  analyser.getByteTimeDomainData(bufferTiempo);
  let suma = 0;
  for (let i = 0; i < bufferTiempo.length; i++) {
    const v = (bufferTiempo[i] / 128.0) - 1.0;
    suma += v * v;
  }
  rmsRaw    = Math.sqrt(suma / bufferTiempo.length);
  rmsSmooth = rmsSmooth * 0.85 + rmsRaw * 0.15;

  //--- CALIBRACIÓN DEL PISO DE RUIDO 
  if (rmsRaw < noiseFloor * NOISE_ADAPT_MARGIN) {
    noiseFloor = Math.max(noiseFloor * (1 - NOISE_ADAPT_RATE) + rmsRaw * NOISE_ADAPT_RATE, 0.004);
  }

  const effective = Math.max(0, rmsRaw - noiseFloor * NOISE_MARGIN);

  //--- VOLUMEN → INTENSIDAD
  const iTarget = constrain(map(effective, 0, 0.18, 0, 1), 0, 1);
  const smooth  = iTarget > intensidadTarget ? SMOOTH_UP : SMOOTH_DOWN;
  intensidadTarget += (iTarget - intensidadTarget) * smooth;
  intensidad = intensidadTarget;

  //--- ONSET → MUTAR FORMA
  const now = Date.now();
  if (
    rmsRaw - rmsPrev > noiseFloor * ONSET_THRESHOLD_FACTOR &&
    rmsRaw > noiseFloor * ONSET_MIN_RMS_FACTOR &&
    now - lastOnsetTime > ONSET_COOLDOWN_MS
  ) {
    mutarUnaForma();
    lastOnsetTime = now;
  }
  rmsPrev = rmsRaw;

  //--- SILENCIO SOSTENIDO → RESET 
  if (rmsRaw < noiseFloor * SILENCIO_UMBRAL_FACTOR) {
    if (silenceStartTime === null) { silenceStartTime = now; silenceResetDone = false; }
    if (now - silenceStartTime >= SILENCIO_RESET_MS && !silenceResetDone) {
      resetearMutaciones();
      silenceResetDone = true;
    }
  } else {
    silenceStartTime = null;
    silenceResetDone = false;
  }

  //--- FRECUENCIA AGUDA SOSTENIDA → CICLAR PALETA
  analyser.getByteFrequencyData(bufferFreq);
  const highStart = Math.floor(bufferFreq.length * HIGH_FREQ_BIN_START_RATIO);
  let energiaTotal = 0, energiaAguda = 0;
  for (let i = 1; i < bufferFreq.length; i++) {
    energiaTotal += bufferFreq[i];
    if (i >= highStart) energiaAguda += bufferFreq[i];
  }

  const esSonidoAgudo =
    energiaTotal > 10 &&
    energiaAguda / energiaTotal > HIGH_FREQ_ENERGY_RATIO &&
    rmsRaw > noiseFloor * HIGH_FREQ_MIN_RMS_FACTOR;

  if (esSonidoAgudo) {
    pitchHighCount++;
    if (pitchHighCount >= PITCH_FRAMES_NEEDED && now - lastPaletaChange > PALETA_COOLDOWN_MS) {
      indicePaleta     = (indicePaleta + 1) % NUM_PALETAS;
      lastPaletaChange = now;
      pitchHighCount   = 0;
    }
  } else {
    pitchHighCount = Math.max(0, pitchHighCount - 1);
  }
}

//---------- SETUP Y DRAW ----------
function setup() {
  createCanvas(LADO, LADO);
  s = (LADO - 2 * MARCO) / GRID;
  inicializarPaletas();

  console.log(
    '%c Obra visual interactiva por voz\n' +
    ' Presioná M para activar el micrófono\n' +
    ' Controles de teclado:\n' +
    '   SPACE    → ciclar paleta\n' +
    '   R        → mutar una forma\n' +
    '   X        → resetear mutaciones\n' +
    '   +/-      → subir/bajar intensidad manualmente\n' +
    '   D        → debug\n' +
    '   M        → activar/desactivar micrófono',
    'background:#0C482E; color:#88B914; padding:4px 8px; font-family:monospace'
  );
}

function draw() {
  procesarAudio();

  background(255);
  push();
  translate(MARCO, MARCO);

  noStroke();
  fill(colorDePaleta(SLOT_FONDO));
  rect(0, 0, GRID * s, GRID * s);

  drawingContext.save();
  drawingContext.beginPath();
  drawingContext.rect(0, 0, GRID * s, GRID * s);
  drawingContext.clip();

  dibujarFormaZigzag();
  dibujarFormaOnda();
  dibujarCuartoCirculoRosa();
  dibujarBarraAmarilla();
  dibujarRectanguloAzul();
  dibujarTrianguloCeleste();
  dibujarArcadaLavanda();
  dibujarCuadradoRojo();
  dibujarPildoraVerde();
  dibujarMotivo();

  for (let i = 0; i < NUM_FORMAS; i++) { if (flashFrames[i] > 0) flashFrames[i]--; }

  drawingContext.restore();
  pop();

  if (modoDebug) dibujarDebug();
}

//--- HELPERS DE COLOR E INTENSIDAD
function colorDePaleta(slot) { return ajustarColor(paletas[indicePaleta][slot]); }
function grosorBordeBlanco()  { return lerp(GROSOR_BORDE_MIN, GROSOR_BORDE_MAX, intensidad); }
function amplitudZigzag()     { return lerp(AMPL_ZIGZAG_MIN,  AMPL_ZIGZAG_MAX,  intensidad); }
function amplitudOnda()       { return lerp(AMPL_ONDA_MIN,    AMPL_ONDA_MAX,    intensidad); }
function ladoMotivo()         { return lerp(MOTIVO_LADO_MIN,  MOTIVO_LADO_MAX,  intensidad); }

function amplificar(valor, eje, factor) { return lerp(eje, valor, factor); }

function ajustarColor(c) {
  push();
  colorMode(HSB, 360, 100, 100);
  const col = color(c);
  const resultado = color(
    hue(col),
    constrain(saturation(col) * lerp(FACTOR_SAT_MIN, FACTOR_SAT_MAX, intensidad), 0, 100),
    constrain(brightness(col) * lerp(FACTOR_BR_MIN,  FACTOR_BR_MAX,  intensidad), 0, 100)
  );
  pop();
  return resultado;
}

//--- INICIALIZACIÓN DE PALETAS
function inicializarPaletas() {
  paletas = [
    ['#0C482E','#602143','#88B914','#D63583','#F0B000','#1C3D92','#2FA7D1','#BA81B9','#D12731','#279E39','#00A4B2','#1D1D1B','#FBDF15','#F15C29'],
    ['#2B1A4C','#D63583','#2FA7D1','#F0B000','#88B914','#00A4B2','#BA81B9','#F15C29','#1C3D92','#FBDF15','#D12731','#1D1D1B','#88B914','#D63583'],
    ['#0F1E4D','#F15C29','#FBDF15','#00A4B2','#D63583','#D12731','#F0B000','#88B914','#BA81B9','#2FA7D1','#88B914','#1D1D1B','#D63583','#F0B000'],
    ['#103A2E','#1C3D92','#F0B000','#00A4B2','#D63583','#F15C29','#BA81B9','#FBDF15','#D63583','#88B914','#D12731','#1D1D1B','#2FA7D1','#F0B000'],
  ];
}

//--- FLASH DE FORMAS MUTADAS
function aplicarFlash(idxForma, x, y, w, h) {
  if (flashFrames[idxForma] <= 0) return;
  push();
  noStroke();
  fill(255, map(flashFrames[idxForma], 0, FLASH_DURACION, 0, 200));
  rect(x, y, w, h);
  pop();
}
//--- FORMAS
function dibujarFormaZigzag() {
  let v = variantes[F_ZIGZAG];
  let zz, ejeX;

  switch (v) {
    case 1: zz = [[-30,230],[110,300],[30,350],[130,400],[40,450],[200,530]]; ejeX = -30; break;
    case 2: zz = [[530,250],[375,365],[460,430],[290,530]];                  ejeX = 530; break;
    case 3: zz = [[-30,230],[180,340],[30,400],[250,530]];                   ejeX = -30; break;
    default: zz = [[-30,250],[125,365],[40,430],[210,530]];                  ejeX = -30;
  }

  const a  = amplitudZigzag();
  const pp = zz.map(pt => [amplificar(pt[0], ejeX, a), pt[1]]);

  fill(colorDePaleta(SLOT_ZIGZAG));
  noStroke();
  beginShape();
  for (const pt of pp) vertex(pt[0] * s, pt[1] * s);
  vertex(ejeX * s, 530 * s);
  endShape(CLOSE);

  stroke('#FBFCFC');
  strokeWeight(grosorBordeBlanco() * s);
  noFill();
  strokeCap(SQUARE);
  strokeJoin(MITER);
  beginShape();
  for (const pt of pp) vertex(pt[0] * s, pt[1] * s);
  endShape();
  noStroke();

  aplicarFlash(F_ZIGZAG, Math.min(ejeX, 290) * s, 220 * s, 320 * s, 320 * s);
}

function dibujarFormaOnda() {
  let v = variantes[F_ONDA];
  let ejeX, xs;

  switch (v) {
    case 1: xs = [320,470,470,320,190,560,450,510,510]; ejeX = 510; break;
    case 2: xs = [175, 60, 60,175,290,-30, 55, 20,  0]; ejeX =   0; break;
    case 3: xs = [380,470,470,380,280,520,450,480,510]; ejeX = 510; break;
    default: xs = [335,450,450,335,220,530,455,490,510]; ejeX = 510;
  }

  const ax = xs.map(x => amplificar(x, ejeX, amplitudOnda()));

  const ondaCurva = () => {
    vertex(ax[0]*s, -10*s);
    bezierVertex(ax[1]*s, 45*s,  ax[2]*s, 65*s,  ax[3]*s, 115*s);
    bezierVertex(ax[4]*s, 160*s, ax[5]*s, 175*s, ax[6]*s, 255*s);
    bezierVertex(ax[7]*s, 330*s, ax[8]*s, 370*s, ejeX*s,  400*s);
  };

  fill(colorDePaleta(SLOT_ONDA));
  noStroke();
  beginShape();
  ondaCurva();
  vertex(ejeX * s, -10 * s);
  endShape(CLOSE);

  stroke('#FBFCFC');
  strokeWeight(grosorBordeBlanco() * s);
  noFill();
  strokeCap(SQUARE);
  strokeJoin(ROUND);
  beginShape();
  ondaCurva();
  endShape();
  noStroke();

  aplicarFlash(F_ONDA, (ejeX === 0 ? 0 : 200) * s, 0, 310 * s, 410 * s);
}

function dibujarCuartoCirculoRosa() {
  let v = variantes[F_CUARTO_CIRCULO];
  const d = 210 * s;
  let cx, cy, start, stop;

  switch (v) {
    case 1: cx = GRID * s; cy = 0;        start = HALF_PI;  stop = PI;            break;
    case 2: cx = 0;        cy = GRID * s; start = -HALF_PI; stop = 0;             break;
    case 3: cx = GRID * s; cy = GRID * s; start = PI;       stop = PI + HALF_PI;  break;
    default: cx = 0;       cy = 0;        start = 0;        stop = HALF_PI;
  }

  fill(colorDePaleta(SLOT_CUARTO_CIRCULO));
  noStroke();
  arc(cx, cy, d, d, start, stop);
  aplicarFlash(F_CUARTO_CIRCULO, cx - d / 2, cy - d / 2, d, d);
}

function dibujarBarraAmarilla() {
  let v = variantes[F_BARRA_AMARILLA];
  let x, y, w, h;

  switch (v) {
    case 1: x =   0; y = 300; w = 35; h = 85; break;
    case 2: x = 415; y = 142; w = 85; h = 35; break;
    case 3: x =  60; y = 465; w = 85; h = 35; break;
    default: x =   0; y = 142; w = 85; h = 35;
  }

  fill(colorDePaleta(SLOT_BARRA_AMARILLA));
  noStroke();
  rect(x * s, y * s, w * s, h * s);
  aplicarFlash(F_BARRA_AMARILLA, x * s, y * s, w * s, h * s);
}

function dibujarRectanguloAzul() {
  let v = variantes[F_RECT_AZUL];
  let x, y, w, h;

  switch (v) {
    case 1: x =   0; y = 0; w = 140; h =  95; break;
    case 2: x = 330; y = 0; w = 170; h =  95; break;
    case 3: x = 405; y = 0; w =  95; h = 190; break;
    default: x = 105; y = 0; w = 190; h =  95;
  }

  fill(colorDePaleta(SLOT_RECT_AZUL));
  noStroke();
  rect(x * s, y * s, w * s, h * s);
  aplicarFlash(F_RECT_AZUL, x * s, y * s, w * s, h * s);
}

function dibujarTrianguloCeleste() {
  let v = variantes[F_TRIANGULO];
  let x1, y1, x2, y2, x3, y3;

  switch (v) {
    case 1: x1=105; y1=250; x2=295; y2=250; x3=200; y3= 95; break;
    case 2: x1=295; y1= 95; x2=295; y2=250; x3=105; y3=170; break;
    case 3: x1=105; y1= 95; x2=105; y2=250; x3=295; y3=170; break;
    default: x1=105; y1= 95; x2=295; y2= 95; x3=200; y3=250;
  }

  fill(colorDePaleta(SLOT_TRIANGULO));
  noStroke();
  triangle(x1*s, y1*s, x2*s, y2*s, x3*s, y3*s);
  aplicarFlash(F_TRIANGULO, 105*s, 95*s, 190*s, 160*s);
}

function dibujarArcadaLavanda() {
  let v = variantes[F_ARCADA];
  let cx = 330;
  const cy = 350, d = 185, rectAlto = 50;

  fill(colorDePaleta(SLOT_ARCADA));
  noStroke();

  switch (v) {
    case 1:
      arc(cx*s, cy*s, d*s, d*s, 0, PI);
      rect((cx - d/2)*s, (cy - rectAlto)*s, d*s, rectAlto*s);
      break;
    case 2:
      arc(cx*s, cy*s, d*0.6*s, d*0.6*s, PI, TWO_PI);
      rect((cx - d*0.3)*s, cy*s, d*0.6*s, rectAlto*s);
      break;
    case 3:
      cx = 160;
      arc(cx*s, cy*s, d*s, d*s, PI, TWO_PI);
      rect((cx - d/2)*s, cy*s, d*s, rectAlto*s);
      break;
    default:
      arc(cx*s, cy*s, d*s, d*s, PI, TWO_PI);
      rect((cx - d/2)*s, cy*s, d*s, rectAlto*s);
  }

  aplicarFlash(F_ARCADA, 60*s, 250*s, 380*s, 160*s);
}

function dibujarCuadradoRojo() {
  let v = variantes[F_CUADRADO_ROJO];
  const x = 270, y = 400, w = 152, h = 100;

  fill(colorDePaleta(SLOT_CUADRADO_ROJO));
  noStroke();

  switch (v) {
    case 1: triangle(x*s, (y+h)*s, (x+w)*s, (y+h)*s, (x+w/2)*s, y*s);  break;
    case 2: arc((x+w/2)*s, (y+h)*s, w*s, h*2*s, PI, TWO_PI);            break;
    case 3: rect((x+25)*s, (y-40)*s, (w-50)*s, (h+40)*s);               break;
    default: rect(x*s, y*s, w*s, h*s);
  }

  aplicarFlash(F_CUADRADO_ROJO, x*s, (y-40)*s, w*s, (h+40)*s);
}

function dibujarPildoraVerde() {
  let v = variantes[F_PILDORA];
  let x, y, w, h, r;

  switch (v) {
    case 1: x=205; y=340; w= 45; h=130; r=22; break;
    case 2: x=175; y=390; w=110; h= 45; r=22; break;
    case 3: x=195; y=365; w= 95; h= 95; r=40; break;
    default: x=205; y=375; w= 75; h= 75; r=35;
  }

  fill(colorDePaleta(SLOT_PILDORA));
  noStroke();
  rect(x*s, y*s, w*s, h*s, r*s);
  aplicarFlash(F_PILDORA, x*s, y*s, w*s, h*s);
}

function dibujarMotivo() {
  const lado = ladoMotivo();
  const half = lado / 2.0;
  let cx, cy;

  switch (variantes[F_MOTIVO]) {
    case 1: cx = half;       cy = 500 - half; break;
    case 2: cx = 500 - half; cy = half;       break;
    case 3: cx = half;       cy = half;       break;
    default: cx = 500 - half; cy = 500 - half;
  }

  const x1 = (cx - half) * s, y1 = (cy - half) * s;
  const x2 = (cx + half) * s, y2 = (cy + half) * s;
  const mx  = cx * s,          my  = cy * s;

  noStroke();
  fill(colorDePaleta(SLOT_MOTIVO_SUP)); triangle(x1, y1, x2, y1, mx, my);
  fill(colorDePaleta(SLOT_MOTIVO_DER)); triangle(x2, y1, x2, y2, mx, my);
  fill(colorDePaleta(SLOT_MOTIVO_INF)); triangle(x2, y2, x1, y2, mx, my);
  fill(colorDePaleta(SLOT_MOTIVO_IZQ)); triangle(x1, y2, x1, y1, mx, my);

  aplicarFlash(F_MOTIVO, x1, y1, lado * s, lado * s);
}

//--- MUTACIONES
function mutarUnaForma() {
  const forma    = int(random(NUM_FORMAS));
  let   varNueva = int(random(VARIANTES_POR_FORMA));
  if (varNueva === variantes[forma]) varNueva = (varNueva + 1) % VARIANTES_POR_FORMA;
  variantes[forma]   = varNueva;
  flashFrames[forma] = FLASH_DURACION;
}

function resetearMutaciones() {
  variantes.fill(0);
  flashFrames.fill(FLASH_DURACION);
}

//--- TECLADO
function keyPressed() {
  if (key === ' ')                                    indicePaleta = (indicePaleta + 1) % NUM_PALETAS;
  if (key === '+' || key === '=' || keyCode === UP_ARROW) intensidad = min(1.0, intensidad + PASO_INTENSIDAD);
  if (key === '-' || keyCode === DOWN_ARROW)          intensidad = max(0.0, intensidad - PASO_INTENSIDAD);
  if (key === 'r' || key === 'R')                     mutarUnaForma();
  if (key === 'x' || key === 'X')                     resetearMutaciones();
  if (key === 'd' || key === 'D')                     modoDebug = !modoDebug;
  if (key === 'm' || key === 'M')                     iniciarMicrofono();
  return false;
}

//--- PANEL DE DEBUG
function dibujarDebug() {
  noStroke();
  fill(0, 0, 0, 200);
  rect(10, 10, 360, 290);
  fill(255);
  textSize(11);
  textFont('monospace');
  textAlign(LEFT, TOP);

  const silMs = silenceStartTime !== null ? Date.now() - silenceStartTime : 0;

  text('=== DEBUG ===',                                           20,  18);
  text('Paleta     : ' + indicePaleta + ' / ' + (NUM_PALETAS-1), 20,  34);
  text('Intensidad : ' + nf(intensidad, 1, 3),                   20,  50);
  text('Grosor     : ' + nf(grosorBordeBlanco(), 1, 1),          20,  66);
  text('Lado motivo: ' + nf(ladoMotivo(), 1, 1),                 20,  82);
  text('─── AUDIO ───',                                          20, 102);
  text('Mic listo  : ' + audioListo,                             20, 118);
  text('RMS raw    : ' + nf(rmsRaw,     1, 4),                   20, 134);
  text('RMS smooth : ' + nf(rmsSmooth,  1, 4),                   20, 150);
  text('Noise floor: ' + nf(noiseFloor, 1, 4),                   20, 166);
  text('Silencio   : ' + nf(silMs/1000, 1, 1) + 's (reset a 3s)',20, 182);
  text('Pitch count: ' + pitchHighCount + ' / ' + PITCH_FRAMES_NEEDED, 20, 198);
  text('Variantes  : [' + variantes.join(' ') + ']',             20, 218);
  text('─── TECLAS ───',                                         20, 238);
  text('M=mic  SPACE=paleta  R=mutar  X=reset',                  20, 254);
  text('+/-=intensidad  D=debug',                                20, 270);
  text('FPS: ' + nf(frameRate(), 2, 1),                          20, 286);
}
