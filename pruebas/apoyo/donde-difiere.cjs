// Dice, EN TEXTO, dónde se diferencian las capturas que no han coincidido.
// Se usa en GitHub cuando falla una prueba de captura: desde aquí no siempre se
// puede abrir el informe en imágenes, y con esto se ve si la diferencia está en un
// sitio concreto (un fallo de verdad) o repartida por toda la pantalla (una
// diferencia de dibujado entre ordenadores).
// Lee los PNG con lo que trae Node (zlib), sin instalar nada.
const fs = require('fs');
const path = require('path');
const zlib = require('zlib');

function leerPNG(ruta) {
  const b = fs.readFileSync(ruta);
  let p = 8, ancho = 0, alto = 0, prof = 0, tipo = 0;
  const trozos = [];
  while (p < b.length) {
    const largo = b.readUInt32BE(p), nombre = b.toString('ascii', p + 4, p + 8);
    const datos = b.subarray(p + 8, p + 8 + largo);
    if (nombre === 'IHDR') { ancho = datos.readUInt32BE(0); alto = datos.readUInt32BE(4); prof = datos[8]; tipo = datos[9]; }
    else if (nombre === 'IDAT') trozos.push(datos);
    else if (nombre === 'IEND') break;
    p += 12 + largo;
  }
  if (prof !== 8 || (tipo !== 6 && tipo !== 2)) throw new Error('PNG no soportado (profundidad ' + prof + ', tipo ' + tipo + ')');
  const canales = tipo === 6 ? 4 : 3;
  const crudo = zlib.inflateSync(Buffer.concat(trozos));
  const pix = Buffer.alloc(ancho * alto * canales);
  const porFila = ancho * canales;
  let anterior = Buffer.alloc(porFila);
  for (let y = 0; y < alto; y++) {
    const filtro = crudo[y * (porFila + 1)];
    const fila = crudo.subarray(y * (porFila + 1) + 1, (y + 1) * (porFila + 1));
    const salida = Buffer.alloc(porFila);
    for (let i = 0; i < porFila; i++) {
      const a = i >= canales ? salida[i - canales] : 0, c = i >= canales ? anterior[i - canales] : 0, bb = anterior[i];
      let v = fila[i];
      if (filtro === 1) v += a;
      else if (filtro === 2) v += bb;
      else if (filtro === 3) v += (a + bb) >> 1;
      else if (filtro === 4) {
        const pp = a + bb - c, pa = Math.abs(pp - a), pb = Math.abs(pp - bb), pc = Math.abs(pp - c);
        v += (pa <= pb && pa <= pc) ? a : (pb <= pc ? bb : c);
      }
      salida[i] = v & 255;
    }
    salida.copy(pix, y * porFila);
    anterior = salida;
  }
  return { ancho, alto, canales, pix };
}

const RAIZ = path.join(__dirname, '..', 'test-results');
if (!fs.existsSync(RAIZ)) { console.log('No hay capturas que comparar.'); process.exit(0); }
function buscar(dir, out = []) {
  for (const n of fs.readdirSync(dir)) {
    const q = path.join(dir, n);
    if (fs.statSync(q).isDirectory()) buscar(q, out);
    else if (n.endsWith('-actual.png')) out.push(q);
  }
  return out;
}

for (const rutaActual of buscar(RAIZ)) {
  const nombre = path.basename(rutaActual).replace('-actual.png', '');
  const carpeta = /-movil(\/|$)/.test(path.dirname(rutaActual)) || /movil/.test(rutaActual) ? 'movil' : 'ordenador';
  const rutaEsperada = path.join(__dirname, '..', 'capturas', carpeta, nombre + '.png');
  if (!fs.existsSync(rutaEsperada)) { console.log('\n=== ' + nombre + ': no hay captura guardada con la que comparar'); continue; }
  let a, b;
  try { a = leerPNG(rutaEsperada); b = leerPNG(rutaActual); }
  catch (e) { console.log('\n=== ' + nombre + ': no se ha podido leer (' + e.message + ')'); continue; }
  console.log('\n=== ' + nombre + ' [' + carpeta + ']  guardada ' + a.ancho + 'x' + a.alto + ', obtenida ' + b.ancho + 'x' + b.alto);
  if (a.ancho !== b.ancho || a.alto !== b.alto) { console.log('    El tamaño es distinto: la pantalla cambió de alto.'); continue; }

  const FIL = 36, COL = 60;
  const mapa = Array.from({ length: FIL }, () => new Array(COL).fill(0));
  let total = 0, x0 = a.ancho, y0 = a.alto, x1 = 0, y1 = 0;
  for (let y = 0; y < a.alto; y++) {
    for (let x = 0; x < a.ancho; x++) {
      const ia = (y * a.ancho + x) * a.canales, ib = (y * b.ancho + x) * b.canales;
      const d = Math.abs(a.pix[ia] - b.pix[ib]) + Math.abs(a.pix[ia + 1] - b.pix[ib + 1]) + Math.abs(a.pix[ia + 2] - b.pix[ib + 2]);
      if (d > 30) {
        total++;
        if (x < x0) x0 = x; if (x > x1) x1 = x;
        if (y < y0) y0 = y; if (y > y1) y1 = y;
        mapa[Math.floor(y / a.alto * FIL)][Math.floor(x / a.ancho * COL)]++;
      }
    }
  }
  if (!total) { console.log('    Sin diferencias apreciables.'); continue; }
  console.log('    ' + total + ' puntos distintos, desde (x=' + x0 + ', y=' + y0 + ') hasta (x=' + x1 + ', y=' + y1 + ')');
  console.log('    Mapa de la pantalla (. = igual, 1-9 = cuánto cambia):');
  for (let f = 0; f < FIL; f++) {
    const fila = mapa[f].map((n) => (n === 0 ? '.' : String(Math.min(9, Math.ceil(n / 15))))).join('');
    if (fila.replace(/\./g, '')) console.log('    |' + fila + '|  y≈' + Math.round(f / FIL * a.alto));
  }
}
