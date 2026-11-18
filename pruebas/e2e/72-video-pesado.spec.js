// Un vídeo demasiado pesado se vuelve a grabar dentro de la página, más
// pequeño, antes de subirlo. Es lo que falla en el iPhone con los vídeos 4K:
// aquí se comprueba que el camino entero funciona y que el resultado pesa menos.
const { test, expect, nuevaVentana, vaciarEmulador } = require('../apoyo/entorno');
const A = require('../apoyo/acciones');

test('Vídeo pesado: se prepara más pequeño y se sube', async ({ browser }, testInfo) => {
  test.skip(testInfo.project.name !== 'ordenador', 'basta con un tamaño de pantalla');
  test.setTimeout(180_000);   // preparar el vídeo dura lo que dura el vídeo
  await vaciarEmulador();

  const v = await nuevaVentana(browser, testInfo);
  const p = v.page;
  await A.registrarProfesional(p, 'video-pesado@prueba.es');
  await A.altaProfesional(p);
  await p.check('#t-consent');
  await p.getByRole('button', { name: 'Empezar el test' }).click();
  await A.contestarTestProfesional(p, { pesos: { D: 1, I: 3, S: 2, C: 4 } });
  await p.click('#tr-btn');
  await A.elegirComoTeVen(p, 'visible');
  await p.locator('#gu-next').waitFor();
  await p.evaluate(() => guiaCerrar());

  await p.evaluate(() => ir('perfil'));
  await p.getByRole('button', { name: 'Grabar' }).first().click();
  await expect(p.locator('#gv-sub')).toBeVisible();

  // El vídeo de prueba pesa poco, así que se baja el tope para que entre por el
  // mismo camino que el vídeo de 69 MB de un iPhone.
  await p.evaluate(() => { window.VIDEO_MAX_MB = 0.1; });
  await p.locator('input[onchange^="subirVideoArchivo"]').setInputFiles(A.archivo('video-vertical.webm'));

  // Dice lo que pesa y ofrece prepararlo
  const prep = p.locator('#gv-prep');
  await expect(prep).toHaveText('Preparar mi vídeo');
  await expect(p.locator('.gv-tramo')).toContainText('Lo preparamos para que pese menos');

  // Se prepara: mientras tanto va diciendo cuánto queda
  await prep.click();
  await expect(prep).toContainText('Preparando', { timeout: 20_000 });
  await expect(p.locator('#gv-usar')).toBeVisible({ timeout: 120_000 });

  // El resultado cabe de sobra en lo que se puede subir, y no es más grande de
  // 720 por el lado corto. (No se compara con el original: el vídeo de prueba
  // ya viene muy comprimido, así que volver a grabarlo lo engorda. Con un vídeo
  // de iPhone de verdad, de 18 Mbps, esto lo deja en menos de 5 MB.)
  const r = await p.evaluate(() => ({ tam: GV.blob.size, w: GV.w, h: GV.h, seg: GV.dur }));
  expect(r.tam).toBeLessThan(15 * 1048576);
  expect(r.tam / r.seg).toBeLessThan(250000);   // menos de 2 Mbps
  expect(Math.min(r.w, r.h)).toBeLessThanOrEqual(720);

  // Y se sube
  await p.click('#gv-usar');
  await expect(p.getByText(/Ver mi vídeo/)).toBeVisible({ timeout: 90_000 });
  await expect.poll(() => p.evaluate(() => ((S.perfil || {}).video || {}).n || 0), { timeout: 30_000 })
    .toBeGreaterThan(0);

  expect(p.erroresPagina).toEqual([]);
  await v.context.close();
});

// Preparar el vídeo con las cuatro calidades hasta donde haga falta.
// «fallos» dice cuántos intentos se van al traste antes de que uno salga bien.
async function conFallos(p, fallos) {
  await p.evaluate((n) => {
    const orig = MediaRecorder.prototype.start;
    let v = 0;
    MediaRecorder.prototype.start = function (...a) {
      if (v++ < n) throw new Error('sin memoria');
      return orig.apply(this, a);
    };
  }, fallos);
}
async function hastaElVideo(p, correo) {
  await A.registrarProfesional(p, correo);
  await A.altaProfesional(p);
  await p.check('#t-consent');
  await p.getByRole('button', { name: 'Empezar el test' }).click();
  await A.contestarTestProfesional(p, { pesos: { D: 1, I: 3, S: 2, C: 4 } });
  await p.click('#tr-btn');
  await A.elegirComoTeVen(p, 'visible');
  await p.locator('#gu-next').waitFor();
  await p.evaluate(() => guiaCerrar());
  await p.evaluate(() => ir('perfil'));
  await p.getByRole('button', { name: 'Grabar' }).first().click();
  await p.evaluate(() => { window.VIDEO_MAX_MB = 0.1; });
  await p.locator('input[onchange^="subirVideoArchivo"]').setInputFiles(A.archivo('video-vertical.webm'));
  await expect(p.locator('#gv-prep')).toHaveText('Preparar mi vídeo');
}

test('Si el móvil no puede, baja la calidad solo hasta que entra', async ({ browser }, testInfo) => {
  test.skip(testInfo.project.name !== 'ordenador', 'basta con un tamaño de pantalla');
  test.setTimeout(180_000);
  await vaciarEmulador();
  const v = await nuevaVentana(browser, testInfo);
  const p = v.page;
  await hastaElVideo(p, 'video-escalera@prueba.es');

  // Los dos primeros intentos se van al traste, como en un iPhone con un 4K
  await conFallos(p, 2);
  await p.click('#gv-prep');

  // Lo dice y sigue solo, sin que la persona tenga que tocar nada
  await expect(p.locator('#gv-err')).toContainText('Lo estamos intentando con la', { timeout: 20_000 });
  await expect(p.locator('#gv-usar')).toBeVisible({ timeout: 120_000 });

  // Ha salido con la tercera calidad: 360 por el lado corto
  const r = await p.evaluate(() => ({ w: GV.w, h: GV.h, tam: GV.blob.size }));
  expect(Math.min(r.w, r.h)).toBe(360);
  expect(r.tam).toBeLessThan(15 * 1048576);

  // Y se sube igual
  await p.click('#gv-usar');
  await expect(p.getByText(/Ver mi vídeo/)).toBeVisible({ timeout: 90_000 });

  expect(p.erroresPagina).toEqual([]);
  await v.context.close();
});

test('Si no puede ni con la mínima: lo dice y ofrece grabar al momento', async ({ browser }, testInfo) => {
  test.skip(testInfo.project.name !== 'ordenador', 'basta con un tamaño de pantalla');
  await vaciarEmulador();
  const v = await nuevaVentana(browser, testInfo);
  const p = v.page;
  await hastaElVideo(p, 'video-falla@prueba.es');

  await conFallos(p, 99);   // no puede con ninguna
  await p.click('#gv-prep');
  await expect(p.locator('#gv-err')).toContainText('Hemos probado con cuatro calidades', { timeout: 30_000 });

  // Quedan las tres salidas, con la que siempre funciona bien visible
  await expect(p.locator('#gv-prep')).toHaveText('Probar otra vez');
  await expect(p.getByRole('button', { name: 'Grabar aquí mismo' })).toBeVisible();

  // Y «Cancelar» cierra de verdad (antes se quedaba muerto tras el fallo)
  await p.locator('.gv-tr-a').getByRole('button', { name: 'Cancelar' }).click();
  await expect(p.locator('#modal')).toHaveCount(0);

  expect(p.erroresPagina).toEqual([]);
  await v.context.close();
});
