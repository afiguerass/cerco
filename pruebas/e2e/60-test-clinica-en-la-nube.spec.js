// El test DISC de la responsable de la clínica se guarda también en la nube
// (antes solo en el navegador): se ve desde cualquier ordenador, las clínicas
// de antes lo suben solas sin cambiar sus resultados y nunca pasa a otra cuenta.
const { test, expect, nuevaVentana, vaciarEmulador } = require('../apoyo/entorno');
const A = require('../apoyo/acciones');

const leerNube = (page) => page.evaluate(async () => {
  // después de recargar, la sesión tarda un momento en estar lista
  while (!(window.firebase && firebase.apps && firebase.apps.length && firebase.auth().currentUser)) await new Promise((r) => setTimeout(r, 200));
  const d = await firebase.firestore().collection('clinicas').doc(firebase.auth().currentUser.uid).get();
  return (d.data() || {}).discResponsable || null;
});
const sinFecha = (d) => d && { dominant: d.dominant, secondary: d.secondary, norm: d.norm };

test('El test de la clínica está en la nube y no se pierde', async ({ browser }, testInfo) => {
  test.skip(testInfo.project.name !== 'ordenador', 'basta con un tamaño de pantalla');
  await vaciarEmulador();
  const v1 = await nuevaVentana(browser, testInfo);
  const c = v1.page;
  await A.registrarClinica(c, 'nube-clinica@prueba.es');
  await A.configurarClinica(c, { pesos: { D: 2, I: 4, S: 1, C: 3 } }, { ...A.CLINICA, clinica: 'Clínica Nube' });
  const local = await c.evaluate(() => CDB.miDisc());
  expect(local.dominant).toBe('I');

  // 1. Al terminar el test se guarda en la nube, igual que en el navegador
  await expect.poll(() => leerNube(c).then(sinFecha)).toEqual(local);
  const uid = await c.evaluate(() => Nube.uid);

  // 2. Clínica de antes: el test solo estaba en el navegador (sin marca de cuenta).
  //    Al volver a entrar se sube solo, con los mismos resultados.
  await c.evaluate(async () => {
    await firebase.firestore().collection('clinicas').doc(firebase.auth().currentUser.uid)
      .update({ discResponsable: firebase.firestore.FieldValue.delete() });
    localStorage.removeItem('cerco_disc_empresa_uid');
    localStorage.removeItem('cerco_disc_empresa_pendiente');
  });
  expect(await leerNube(c)).toBeNull();
  await c.reload();
  await expect.poll(() => leerNube(c).then(sinFecha), { timeout: 20_000 }).toEqual(local);
  expect(await c.evaluate(() => CDB.miDisc())).toEqual(local);

  // 3. Desde otro ordenador (navegador vacío): el test llega de la nube
  const v2 = await nuevaVentana(browser, testInfo);
  const o = v2.page;
  await o.goto('/index.html');
  await o.fill('#login-email', 'nube-clinica@prueba.es');
  await o.fill('#login-pwd', A.CLINICA.pwd);
  await o.getByRole('button', { name: 'Iniciar sesión' }).click();
  await expect.poll(() => o.evaluate(() => CDB.miDisc()), { timeout: 20_000 }).toEqual(local);
  await o.evaluate(() => showScreen('equipo'));
  await expect(o.locator('#screen-equipo')).toContainText('Marta Gil · tú');
  await o.evaluate(() => showScreen('stats'));
  await expect(o.locator('#screen-stats')).toContainText('persona con el test hecho');

  // 4. En ese navegador entra otra clínica: no recibe el test de la primera
  //    (no se le sube ni se le enseña), y la copia queda guardada en el navegador
  await o.evaluate(() => cerrarSesion());
  await A.registrarClinica(o, 'nube-otra@prueba.es');
  await expect.poll(() => o.evaluate(() => CDB.miDisc())).toBeNull();
  expect(await leerNube(o)).toBeNull();
  expect(JSON.parse(await o.evaluate((u) => localStorage.getItem('cerco_disc_empresa_de_' + u), uid))).toEqual(local);

  expect(c.erroresPagina).toEqual([]);
  expect(o.erroresPagina).toEqual([]);
  await v1.context.close(); await v2.context.close();
});
