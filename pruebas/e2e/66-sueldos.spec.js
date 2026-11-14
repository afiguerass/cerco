// Sueldos de referencia: salen en todas las profesiones que tienen cifras (también
// cirugía), como «Referencia orientativa del sector», con la nota del porcentaje en
// odontología, y salen del mismo sitio (comun/sueldos.js) en los dos lados.
const { test, expect, nuevaVentana, vaciarEmulador } = require('../apoyo/entorno');
const A = require('../apoyo/acciones');

test('Nueva oferta: sugerencias de sueldo en todas las profesiones con cifras', async ({ browser }, testInfo) => {
  test.skip(testInfo.project.name !== 'ordenador', 'basta con un tamaño de pantalla');
  await vaciarEmulador();
  const v = await nuevaVentana(browser, testInfo), c = v.page;
  await A.registrarClinica(c, 'sueldos@prueba.es');
  await A.configurarClinica(c);
  await c.evaluate(() => showScreen('crear-oferta'));
  const puestos = await c.evaluate(() => CERCO_SUELDOS.puestos.map((p) => ({ puesto: p.puesto, bandas: p.bandas, odonto: !!p.odonto })));
  expect(puestos.length).toBe(15);
  const sug = c.locator('#co-sal-sug');
  for (const p of puestos) {
    await c.fill('#co-titulo', p.puesto);
    if (!p.bandas) { await expect(sug.locator('button')).toHaveCount(0); continue; }
    await expect(sug).toContainText('Referencia orientativa del sector');
    const botones = sug.locator('button');
    await expect(botones).toHaveCount(3);
    for (let k = 0; k < 3; k++) {
      const [a, b] = p.bandas[k], f = (x) => x.toLocaleString('es-ES');
      await expect(botones.nth(k)).toContainText(`${f(a)}–${f(b)} €/año`);
    }
    if (p.odonto) await expect(sug).toContainText('Muchos cobran un porcentaje de lo que facturan.');
    else await expect(sug).not.toContainText('porcentaje');
  }
  // Cirugía, el caso que no salía
  await c.fill('#co-titulo', 'Cirujano/a oral y maxilofacial');
  await expect(sug.locator('button')).toHaveCount(3);
  // Al pulsar un tramo, se rellena el sueldo
  await sug.locator('button').first().click();
  await expect(c.locator('#co-sal-min')).toHaveValue('60.000');
  await expect(c.locator('#co-sal-max')).toHaveValue('75.000');
  expect(c.erroresPagina).toEqual([]);

  // El profesional ve la misma referencia (sale del mismo archivo)
  const w = await nuevaVentana(browser, testInfo), p = w.page;
  await p.goto('/candidato.html');
  await p.waitForFunction(() => typeof txtGuia === 'function' && window.CERCO_SUELDOS);
  const txt = await p.evaluate(() => txtGuia(guiaSalarial('Higienista dental', null), 'Higienista dental'));
  expect(txt).toBe('Referencia orientativa del sector para higienistas: entre 18k y 32k € brutos al año.');
  await v.context.close(); await w.context.close();
});
