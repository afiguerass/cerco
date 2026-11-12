// Prueba de arranque: las dos páginas cargan y se conectan al emulador
// (Firebase falso), nunca al Firebase real.
const { test, expect } = require('../apoyo/entorno');

for (const pagina of ['index.html', 'candidato.html']) {
  test(`${pagina} carga y usa el emulador`, async ({ page, erroresPagina }) => {
    await page.goto('/' + pagina);
    await expect(page.locator('body')).toBeVisible();
    // Forzamos la carga de Firebase como hace la propia web.
    const proyecto = await page.evaluate(async () => {
      await window.Nube?.cargar?.();
      return window.firebase?.app?.().options.projectId;
    });
    expect(proyecto).toBe('demo-cerco');
    expect(erroresPagina).toEqual([]);
  });
}
