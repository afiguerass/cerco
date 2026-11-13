// Los datos de la clínica guardados en el navegador son de una sola cuenta: si en el
// mismo navegador se registra o entra otra cuenta, se guarda una copia de lo anterior y
// se empieza vacío. Ninguna cuenta ve ni hereda datos de otra, y la anterior recupera lo
// suyo al volver.
const { test, expect, nuevaVentana, vaciarEmulador, FIRESTORE, PROYECTO } = require('../apoyo/entorno');
const A = require('../apoyo/acciones');

const fichaNube = async (correo) => {
  const base = `http://${FIRESTORE.host}:${FIRESTORE.port}/v1/projects/${PROYECTO}/databases/(default)/documents`;
  const r = await (await fetch(`${base}/clinicas`, { headers: { Authorization: 'Bearer owner' } })).json();
  const d = (r.documents || []).find((x) => x.fields.email && x.fields.email.stringValue === correo);
  return d ? Object.fromEntries(Object.entries(d.fields).map(([k, v]) => [k, Object.values(v)[0]])) : null;
};

test('Una cuenta por navegador: nadie hereda ni ve datos de otra cuenta', async ({ browser }, testInfo) => {
  test.skip(testInfo.project.name !== 'ordenador', 'basta con un tamaño de pantalla');
  await vaciarEmulador();
  const v = await nuevaVentana(browser, testInfo), c = v.page;

  // 1. La primera clínica se configura y guarda algo que solo vive en el navegador
  await A.registrarClinica(c, 'primera@prueba.es');
  await A.configurarClinica(c, {}, { ...A.CLINICA, clinica: 'Clínica Primera' });
  await c.evaluate(() => localStorage.setItem('cerco_valoraciones', JSON.stringify({ x: { v: [3, 0, 0, 0] } })));
  await c.evaluate(() => cerrarSesion());

  // 2. En el mismo navegador se registra otra cuenta: empieza vacía y no hereda nada
  await A.registrarClinica(c, 'segunda@prueba.es', { ...A.CLINICA, responsable: 'Pau Roca' });
  expect(await c.evaluate(() => CDB.clinica().nom || '')).toBe('');
  expect(await c.evaluate(() => CDB.miDisc())).toBeNull();
  expect(await c.evaluate(() => localStorage.getItem('cerco_valoraciones'))).toBeNull();
  await expect(c.locator('#screen-benvinguda')).toBeVisible();
  await c.waitForTimeout(2500); // lo que tarda en subir su ficha
  const segunda = await fichaNube('segunda@prueba.es');
  expect(segunda && segunda.nom).toBeFalsy();                 // antes subía «Clínica Primera»
  expect(segunda && segunda.nomResp).toBe('Pau Roca');
  // la copia de la primera cuenta está guardada en el navegador
  const copia = await c.evaluate(() => Object.keys(localStorage).filter((k) => k.startsWith('cerco_copia_')).map((k) => JSON.parse(localStorage.getItem(k)).datos));
  expect(copia).toHaveLength(1);
  expect(JSON.parse(copia[0].cerco_empresa).nom).toBe('Clínica Primera');

  // 3. La primera vuelve a entrar en este navegador: recupera lo suyo y no ve nada de la segunda
  await c.evaluate(() => cerrarSesion());
  await c.fill('#login-email', 'primera@prueba.es');
  await c.fill('#login-pwd', A.CLINICA.pwd);
  await c.getByRole('button', { name: 'Iniciar sesión' }).click();
  await expect(c.locator('#screen-inicio')).toBeVisible({ timeout: 20_000 });
  expect(await c.evaluate(() => CDB.clinica().nom)).toBe('Clínica Primera');
  expect(await c.evaluate(() => CDB.clinica().nomResp)).toBe('Marta Gil');
  expect(JSON.parse(await c.evaluate(() => localStorage.getItem('cerco_valoraciones')))).toEqual({ x: { v: [3, 0, 0, 0] } });
  expect(await c.evaluate(() => (CDB.miDisc() || {}).dominant)).toBeTruthy();
  await expect(c.locator('body')).not.toContainText('Pau Roca');

  expect(c.erroresPagina).toEqual([]);
  await v.context.close();
});
