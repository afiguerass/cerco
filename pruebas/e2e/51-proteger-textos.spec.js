// La función que protege los textos de la clínica (_esc) trata bien las
// comillas y los valores vacíos, y un nombre de clínica con comillas se ve
// tal cual en la página.
const { test, expect, nuevaVentana } = require('../apoyo/entorno');
const A = require('../apoyo/acciones');

test('_esc: comillas, símbolos y valores vacíos', async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== 'ordenador', 'basta con un tamaño de pantalla');
  await page.goto('/index.html');
  const r = await page.evaluate(() => [_esc('Clínica "La Sonrisa" & <Cía> d\'Aro'), _esc(null), _esc(undefined), _esc(0)]);
  expect(r).toEqual(['Clínica &quot;La Sonrisa&quot; &amp; &lt;Cía&gt; d&#39;Aro', '', '', '0']);
});

test('Una clínica con comillas en el nombre se ve bien', async ({ browser }, testInfo) => {
  test.skip(testInfo.project.name !== 'ordenador', 'basta con un tamaño de pantalla');
  const { context, page } = await nuevaVentana(browser, testInfo);
  const nombre = 'Clínica "La Sonrisa" d\'Aro';
  await A.registrarClinica(page, `comillas-${Date.now()}@prueba.es`);
  await A.configurarClinica(page, {}, { ...A.CLINICA, clinica: nombre });
  await expect(page.locator('#screen-publicat')).toContainText(nombre);
  await page.evaluate(() => showScreen('equipo'));
  await expect(page.locator('#screen-equipo')).toBeVisible();
  expect(page.erroresPagina).toEqual([]);
  await context.close();
});
