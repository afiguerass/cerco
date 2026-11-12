// Comprueba que, al abrir cada página, TODAS las funciones globales de sus
// archivos de código existen de verdad. Algunos archivos están envueltos en
// un bloque que, si algo falla mientras se cargan, se calla y deja sin crear
// las funciones que vienen detrás (sin ningún error visible). Esta prueba lo
// detecta en el momento.
const fs = require('fs');
const path = require('path');
const acorn = require('acorn');
const { test, expect } = require('../apoyo/entorno');

const RAIZ = path.join(__dirname, '..', '..');

function scriptsDe(pagina) {
  const html = fs.readFileSync(path.join(RAIZ, pagina), 'utf8');
  return [...html.matchAll(/<script src="\.\/([^"]+)"><\/script>/g)].map((m) => m[1]);
}
function funcionesGlobales(archivo) {
  const src = fs.readFileSync(path.join(RAIZ, 'public', archivo), 'utf8');
  const ast = acorn.parse(src, { ecmaVersion: 'latest', allowReturnOutsideFunction: true });
  const nombres = [];
  const bloques = [ast.body];
  while (bloques.length) {
    for (const st of bloques.pop()) {
      if (st.type === 'FunctionDeclaration') nombres.push(st.id.name);
      else if (st.type === 'TryStatement') bloques.push(st.block.body);
    }
  }
  return nombres;
}

for (const pagina of ['index.html', 'candidato.html']) {
  test(`${pagina}: todas las funciones de sus archivos existen al abrirla`, async ({ page }) => {
    await page.goto('/' + pagina);
    await page.waitForLoadState('load');
    for (const archivo of scriptsDe(pagina)) {
      const nombres = funcionesGlobales(archivo);
      const faltan = await page.evaluate((ns) => ns.filter((n) => typeof window[n] !== 'function'), nombres);
      expect(faltan, `faltan en ${archivo}`).toEqual([]);
    }
  });
}
