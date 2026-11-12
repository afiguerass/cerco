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

module.exports = { test, expect: base.expect, prepararContexto, vaciarEmulador, PROYECTO, AUTH, FIRESTORE };
