// Entorno común de todas las pruebas de navegador.
//
// La web (index.html y candidato.html) NO se modifica. Lo que hacemos es
// interceptar lo que la web descarga de Internet y darle copias locales:
//
//  · Firebase 10.12.0 (www.gstatic.com) → copia idéntica del paquete oficial
//    de npm, con un añadido al final que, al arrancar, conecta la web con el
//    EMULADOR (Firebase falso en este ordenador) en vez del Firebase real.
//  · pdf.js 3.11.174 (cdnjs) → copia del paquete oficial de npm.
//  · Tipografía Inter (Google Fonts) → copia guardada en pruebas/recursos.
//
// Cualquier otra petición a Internet se BLOQUEA. Así es imposible que una
// prueba toque los datos reales de CERCO.
const path = require('path');
const fs = require('fs');
const base = require('@playwright/test');

const NM = path.join(__dirname, '..', 'node_modules');
const RECURSOS = path.join(__dirname, '..', 'recursos');
const PROYECTO = 'demo-cerco';
const AUTH = 'http://127.0.0.1:9099';
const FIRESTORE = { host: '127.0.0.1', port: 8080 };

const PARCHE_EMULADOR = `
;(function(){
  if (!window.firebase || firebase.__emuladorCERCO) return;
  firebase.__emuladorCERCO = true;
  var original = firebase.initializeApp;
  firebase.initializeApp = function(cfg, nombre){
    cfg = Object.assign({}, cfg, { projectId: '${PROYECTO}', apiKey: 'clave-de-pruebas' });
    var app = original.call(firebase, cfg, nombre);
    try { app.auth().useEmulator('${AUTH}', { disableWarnings: true }); } catch (e) { console.error('emulador auth', e); }
    try { app.firestore().useEmulator('${FIRESTORE.host}', ${FIRESTORE.port}); } catch (e) { console.error('emulador firestore', e); }
    return app;
  };
})();
`;

function leer(ruta) { return fs.readFileSync(ruta); }

// Math.random con semilla fija: el orden «aleatorio» de las preguntas del test
// sale siempre igual en las pruebas y las capturas son comparables.
const SEMILLA = `
(function(){
  var s = 20261112;
  Math.random = function(){ s = (s * 1664525 + 1013904223) % 4294967296; return s / 4294967296; };
})();
`;

async function prepararContexto(context) {
  await context.addInitScript(SEMILLA);
  await context.route('**/*', async (route) => {
    const url = route.request().url();
    const u = new URL(url);
    if (['127.0.0.1', 'localhost'].includes(u.hostname)) return route.continue();

    let m = url.match(/www\.gstatic\.com\/firebasejs\/10\.12\.0\/(firebase-(app|auth|firestore)-compat\.js)/);
    if (m) {
      let cuerpo = leer(path.join(NM, 'firebase', m[1])).toString();
      if (m[2] === 'app') cuerpo += PARCHE_EMULADOR;
      return route.fulfill({ status: 200, contentType: 'text/javascript', body: cuerpo });
    }
    m = url.match(/cdnjs\.cloudflare\.com\/ajax\/libs\/pdf\.js\/3\.11\.174\/(pdf(\.worker)?\.min\.js)/);
    if (m) return route.fulfill({ status: 200, contentType: 'text/javascript', body: leer(path.join(NM, 'pdfjs-dist', 'build', m[1])) });

    if (u.hostname === 'fonts.googleapis.com') {
      return route.fulfill({ status: 200, contentType: 'text/css', body: leer(path.join(RECURSOS, 'fuentes', 'inter.css')) });
    }
    if (u.hostname === 'fonts.gstatic.com') {
      const archivo = path.join(RECURSOS, 'fuentes', path.basename(u.pathname));
      if (fs.existsSync(archivo)) return route.fulfill({ status: 200, contentType: 'font/woff2', body: leer(archivo) });
    }
    return route.abort('blockedbyclient');
  });
}

// Borra todos los datos del emulador (como empezar con una base de datos vacía).
async function vaciarEmulador() {
  await fetch(`http://${FIRESTORE.host}:${FIRESTORE.port}/emulator/v1/projects/${PROYECTO}/databases/(default)/documents`, { method: 'DELETE' });
  await fetch(`${AUTH}/emulator/v1/projects/${PROYECTO}/accounts`, { method: 'DELETE' });
}

// Fecha y hora fijas para las pruebas del recorrido: lunes 9 de noviembre de
// 2026 a las 10:00 (hora de Madrid). El reloj avanza normal desde ahí. Así
// los textos como «Buenos días» o «Hace 5 min» salen siempre igual y las
// capturas se pueden comparar.
const HORA_FIJA = new Date('2026-11-09T10:00:00+01:00');

// Crea una ventana de navegador independiente (como una ventana normal o una
// de incógnito: cada una con su propia sesión), con el tamaño del proyecto
// (ordenador o móvil).
async function nuevaVentana(browser, testInfo, extra = {}) {
  const u = testInfo.project.use;
  const opciones = {};
  for (const k of ['viewport', 'deviceScaleFactor', 'isMobile', 'hasTouch', 'userAgent', 'locale', 'timezoneId', 'baseURL']) {
    if (u[k] !== undefined) opciones[k] = u[k];
  }
  const context = await browser.newContext({ ...opciones, ...extra });
  await prepararContexto(context);
  await context.clock.install({ time: HORA_FIJA });
  const page = await context.newPage();
  page.erroresPagina = [];
  page.on('pageerror', (e) => page.erroresPagina.push(String(e && e.message || e)));
  return { context, page };
}

// Captura de referencia de la pantalla actual (Paso 6). La primera vez se
// guarda; las siguientes se compara con la guardada. Se tapan los vídeos
// (cada fotograma es distinto) y los avisos flotantes que desaparecen solos.
const CSS_CAPTURA = path.join(__dirname, 'captura.css');

// Palabras que el encargo prohíbe en la interfaz. Se comprueban en cada
// pantalla de la que se hace captura.
const PROHIBIDAS = [
  /responsable de contrataci[oó]n/i, /\bRRHH\b/, /\bIA\b/, /tik ?tok/i,
  /\bmatching\b/i, /\bkanban\b/i, /caja negra/i,
  /[\u{1F300}-\u{1FAFF}]/u, // emojis
];
async function sinPalabrasProhibidas(page, nombre) {
  const texto = await page.evaluate(() => document.body.innerText);
  for (const p of PROHIBIDAS) {
    const m = texto.match(p);
    base.expect(m, `«${m && m[0]}» aparece en la pantalla ${nombre}`).toBeNull();
  }
}
async function capturar(page, nombre, opciones = {}) {
  await sinPalabrasProhibidas(page, nombre);
  if (process.env.SIN_CAPTURAS) return;
  // Si se pide, se coloca un elemento en el centro de la pantalla antes de
  // la captura, para que el desplazamiento sea siempre el mismo.
  if (opciones.centrar) {
    // Dos veces: lo que hay encima puede acabar de cargar y mover la página.
    for (let i = 0; i < 2; i++) {
      await opciones.centrar.evaluate((el) => { if (document.activeElement) document.activeElement.blur(); el.scrollIntoView({ block: 'start' }); });
      await page.waitForTimeout(600);
    }
  } else {
    // Si no, todo lo que se desplaza vuelve arriba del todo (en el móvil la web
    // se desplaza por dentro y cada vez quedaría a una altura distinta).
    // Dos veces, por si algo acaba de cargar y mueve la página
    for (let i = 0; i < 2; i++) {
      await page.evaluate(() => {
        window.scrollTo(0, 0);
        document.querySelectorAll('*').forEach((el) => { if (el.scrollTop > 0) el.scrollTop = 0; });
      });
      await page.waitForTimeout(300);
    }
  }
  await page.waitForTimeout(400);
  await base.expect(page).toHaveScreenshot(`${nombre}.png`, {
    fullPage: true,
    // Se tapan: los vídeos (cada fotograma es distinto) y las frases del test
    // DISC, que salen en orden aleatorio a propósito.
    // y los enlaces que llevan números internos distintos en cada ejecución.
    mask: [
      page.locator('video'),
      page.locator('#t-ops, [id^="options-container-"]'),
      page.locator('#invite-link-input, #invite-link-stats, #invite-link-equipo, #cita-sala'),
      ...(opciones.tapar || []),
    ],
    stylePath: CSS_CAPTURA,
    timeout: 20_000,
  });
}

const test = base.test.extend({
  context: async ({ context }, use) => {
    await prepararContexto(context);
    await use(context);
  },
  // Errores de JavaScript de la página: se recogen para poder revisarlos.
  erroresPagina: async ({ page }, use) => {
    const errores = [];
    page.on('pageerror', (e) => errores.push(String(e && e.message || e)));
    await use(errores);
  },
});

module.exports = {
  test, expect: base.expect, prepararContexto, vaciarEmulador, nuevaVentana, capturar,
  HORA_FIJA, PROYECTO, AUTH, FIRESTORE,
};
