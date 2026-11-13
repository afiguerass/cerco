// La lista de municipios (datos/municipios.js, 200 KB) se descarga aparte,
// sin frenar el arranque de la página. Lo que muestra km espera a que llegue.
const { test, expect } = require('../apoyo/entorno');

for (const pagina of ['/index.html', '/candidato.html']) {
  test(`Municipios aparte: ${pagina} no la carga con el resto y la tiene cuando hace falta`, async ({ page }, testInfo) => {
    test.skip(testInfo.project.name !== 'ordenador', 'basta con un tamaño de pantalla');
    // Se retrasa la lista 2 segundos, como en una conexión lenta
    await page.route('**/datos/municipios.js', async (route) => {
      await new Promise((r) => setTimeout(r, 2000));
      await route.continue();
    });
    const resp = await page.goto(pagina, { waitUntil: 'domcontentloaded' });
    const html = await resp.text();
    expect(html).not.toContain('datos/municipios.js');
    // Sin esperar a la lista, la página ya ha arrancado
    expect(await page.evaluate(() => typeof window.CGeo === 'object' && !window.CERCO_MUNICIPIOS)).toBe(true);
    // La nube (de la que depende todo lo que muestra km) espera a que llegue
    expect(await page.evaluate(() => Nube.cargar().then(() => !!window.CERCO_MUNICIPIOS))).toBe(true);
    expect(await page.evaluate(() => CGeo.km(CGeo.lugar('Salt'), CGeo.lugar('Girona')))).toBe(3);
    // Clínica: el buscador de ciudad acaba teniendo todos los municipios (p. ej. Biure)
    if (pagina === '/index.html') await expect.poll(() => page.evaluate(() => ES_LOCATIONS.some((l) => l.c === 'Biure'))).toBe(true);
  });
}

test('Municipios aparte: si la lista no llega, la web funciona igual (sin km)', async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== 'ordenador', 'basta con un tamaño de pantalla');
  const errores = [];
  page.on('pageerror', (e) => errores.push(String(e.message)));
  await page.route('**/datos/municipios.js', (route) => route.abort());
  await page.goto('/candidato.html');
  await expect(page.getByText('Crear mi perfil gratis')).toBeVisible();
  expect(await page.evaluate(() => CGeo.listo)).toBe(false);
  expect(await page.evaluate(() => CGeo.lugar('Salt'))).toBeNull();
  expect(errores).toEqual([]);
});
