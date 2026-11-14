// Las opciones que se eligen tocando se pueden quitar volviendo a tocarlas:
// puntos fuertes, las preguntas de «Te ayudo a presentarte» (Seimian) y las de una
// sola opción del perfil (por ejemplo, la jornada).
const { test, expect, nuevaVentana, vaciarEmulador } = require('../apoyo/entorno');
const A = require('../apoyo/acciones');

test('Profesional: las opciones elegidas se pueden quitar', async ({ browser }, testInfo) => {
  test.skip(testInfo.project.name !== 'ordenador', 'basta con un tamaño de pantalla');
  await vaciarEmulador();
  const v = await nuevaVentana(browser, testInfo), p = v.page;
  await A.registrarProfesional(p, 'opciones@prueba.es');
  await A.altaProfesional(p, {
    alPaso2: async () => {
      const elegida = (loc) => loc.evaluate((x) => x.classList.contains('on'));
      // Puntos fuertes
      const pf = p.locator('#al-pf .chip', { hasText: 'Trato con el paciente' });
      expect(await elegida(pf)).toBe(true);
      await pf.click(); expect(await elegida(pf)).toBe(false);
      await pf.click(); expect(await elegida(pf)).toBe(true);
      // Una sola opción (jornada): tocar la elegida la quita
      const jor = p.locator('#al-jor .chip', { hasText: 'Completa' });
      await jor.click(); expect(await elegida(jor)).toBe(false);
      await expect(p.locator('#al-jor .chip.on')).toHaveCount(0);
      await jor.click(); expect(await elegida(jor)).toBe(true);
      // Seimian «Te ayudo a presentarte»
      await p.evaluate(() => abrirPresentacionIA());
      const op = p.locator('#pia-g .chip').first(), otra = p.locator('#pia-g .chip').nth(1);
      await op.click(); expect(await elegida(op)).toBe(true);
      await otra.click(); expect(await elegida(op)).toBe(false); expect(await elegida(otra)).toBe(true);
      await otra.click(); expect(await elegida(otra)).toBe(false);
      await expect(p.locator('#pia-g .chip.on')).toHaveCount(0);
      await p.evaluate(() => cerrarModal());
    },
  });
  expect(p.erroresPagina).toEqual([]);
  await v.context.close();
});
