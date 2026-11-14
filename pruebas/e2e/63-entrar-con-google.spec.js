// Entrar con Google con una clínica que ya existe: va directa a Inicio, sin la
// bienvenida, desde cualquier navegador y también al abrir la página con la sesión
// ya iniciada. (La ventana de Google no se puede abrir en las pruebas: se entra con
// una credencial de Google del emulador y se sigue el mismo camino que la web.)
const { test, expect, nuevaVentana, vaciarEmulador, FIRESTORE, PROYECTO } = require('../apoyo/entorno');
const A = require('../apoyo/acciones');

const CREDENCIAL = JSON.stringify({ sub: 'google-marta', email: 'marta.google@prueba.es', email_verified: true, name: 'Marta Gil' });
async function entrarConGoogle(page) {
  await page.goto('/index.html');
  await page.evaluate(async (cred) => {
    await Nube.cargar();
    const res = await firebase.auth().signInWithCredential(firebase.auth.GoogleAuthProvider.credential(cred));
    _entrarDespuesDeGoogle(res.user);   // lo mismo que hace la web cuando Google contesta
  }, CREDENCIAL);
}

test('Google: una clínica que ya existe entra directa a Inicio', async ({ browser }, testInfo) => {
  test.skip(testInfo.project.name !== 'ordenador', 'basta con un tamaño de pantalla');
  await vaciarEmulador();
  // 1. Primera vez con Google: cuenta nueva → bienvenida y se configura la clínica
  const v1 = await nuevaVentana(browser, testInfo);
  await entrarConGoogle(v1.page);
  await expect(v1.page.locator('#screen-benvinguda')).toBeVisible({ timeout: 20_000 });
  await A.configurarClinica(v1.page, {}, { ...A.CLINICA, clinica: 'Clínica Google' });
  await v1.page.waitForTimeout(2000); // lo que tarda en subir su ficha
  await v1.context.close();

  // 2. Desde otro navegador, la misma cuenta de Google: directa a Inicio
  const v2 = await nuevaVentana(browser, testInfo), p = v2.page;
  await entrarConGoogle(p);
  await expect(p.locator('#screen-inicio')).toBeVisible({ timeout: 20_000 });
  await expect(p.locator('#screen-benvinguda')).toBeHidden();
  expect(await p.evaluate(() => CDB.clinica().nom)).toBe('Clínica Google');

  // 3. Abrir la página con la sesión de Google ya iniciada y el navegador sin los datos
  //    de la clínica: también directa a Inicio
  await p.evaluate(() => ['cerco_empresa', 'cerco_equipo', 'cerco_ofertas', 'cerco_disc_empresa'].forEach((k) => localStorage.removeItem(k)));
  await p.reload();
  await expect(p.locator('#screen-inicio')).toBeVisible({ timeout: 20_000 });
  await expect(p.locator('#screen-benvinguda')).toBeHidden();
  await expect(p.getByText('Clínica Google').locator('visible=true').first()).toBeVisible();

  expect(p.erroresPagina).toEqual([]);
  await v2.context.close();
});

// Una clínica creada como con una versión antigua de la web: en la nube tiene sus cosas
// (página pública, una oferta publicada), pero su ficha no tiene el nombre. Se tiene que
// reconocer igual, con correo o con Google, y recuperar su nombre.
const BASE = `http://${FIRESTORE.host}:${FIRESTORE.port}/v1/projects/${PROYECTO}/databases/(default)/documents`;
const ADMIN = { Authorization: 'Bearer owner', 'Content-Type': 'application/json' };
const campos = (o) => ({ fields: Object.fromEntries(Object.entries(o).map(([k, v]) => [k, { stringValue: String(v) }])) });
async function uidDe(correo) {
  const r = await (await fetch(`http://127.0.0.1:9099/identitytoolkit.googleapis.com/v1/projects/${PROYECTO}/accounts:query`, { method: 'POST', headers: ADMIN, body: '{}' })).json();
  return (r.userInfo || []).find((u) => u.email === correo).localId;
}
const fichaDe = async (uid) => { const d = await (await fetch(`${BASE}/clinicas/${uid}`, { headers: ADMIN })).json(); return d.fields || {}; };

for (const [caso, preparar, nombreEsperado] of [
  ['ficha sin nombre, con página pública y una oferta', async (uid) => {
    await fetch(`${BASE}/clinicas/${uid}`, { method: 'PATCH', headers: ADMIN, body: JSON.stringify(campos({ nomResp: 'Asish Figueras', email: 'antigua@prueba.es' })) });
    await fetch(`${BASE}/clinicas_publicas/${uid}`, { method: 'PATCH', headers: ADMIN, body: JSON.stringify(campos({ nom: 'Clinica dr figui', ciutat: 'Girona' })) });
    await fetch(`${BASE}/ofertas_publicas/of-antigua`, { method: 'PATCH', headers: ADMIN, body: JSON.stringify(campos({ clinicaId: uid, clinica: 'Clinica dr figui', titulo: 'Higienista dental', estado: 'activa' })) });
  }, 'Clinica dr figui'],
  ['ficha con el nombre vacío y solo una oferta guardada', async (uid) => {
    await fetch(`${BASE}/clinicas/${uid}`, { method: 'PATCH', headers: ADMIN, body: JSON.stringify(campos({ nom: '', nomResp: 'Asish Figueras' })) });
    await fetch(`${BASE}/clinicas/${uid}/ofertas/of1`, { method: 'PATCH', headers: ADMIN, body: JSON.stringify(campos({ titulo: 'Auxiliar', estado: 'activa' })) });
  }, 'Mi clínica'],
  ['sin ficha, solo con solicitudes recibidas', async (uid) => {
    await fetch(`${BASE}/clinicas/${uid}`, { method: 'DELETE', headers: ADMIN });
    await fetch(`${BASE}/candidaturas/sol-antigua`, { method: 'PATCH', headers: ADMIN, body: JSON.stringify(campos({ clinicaId: uid, clinicaNombre: 'Clinica dr figui', candidatoUid: 'otro', estado: 'enviada', nombre: 'Persona' })) });
  }, 'Clinica dr figui'],
]) {
  test(`Clínica antigua (${caso}): entra directa a Inicio con correo`, async ({ browser }, testInfo) => {
    test.skip(testInfo.project.name !== 'movil', 'se prueba en el tamaño de móvil, que es donde fallaba');
    await vaciarEmulador();
    // La cuenta existe (se registra) y su navegador se cierra sin configurar nada
    const v0 = await nuevaVentana(browser, testInfo);
    await A.registrarClinica(v0.page, 'antigua@prueba.es');
    await v0.page.waitForTimeout(1500);
    await v0.context.close();
    const uid = await uidDe('antigua@prueba.es');
    await preparar(uid);

    // Con correo y contraseña, desde un navegador nuevo (como una pestaña privada)
    const v = await nuevaVentana(browser, testInfo), p = v.page;
    await p.goto('/index.html');
    await p.fill('#login-email', 'antigua@prueba.es');
    await p.fill('#login-pwd', A.CLINICA.pwd);
    await p.getByRole('button', { name: 'Iniciar sesión' }).click();
    await expect(p.locator('#screen-inicio')).toBeVisible({ timeout: 40_000 });
    await expect(p.locator('#screen-benvinguda')).toBeHidden();
    // Recupera el nombre de donde esté (o «Mi clínica» si no está en ningún sitio)
    expect(await p.evaluate(() => CDB.clinica().nom)).toBe(nombreEsperado);
    // La ficha de la nube queda reparada con su nombre
    await expect.poll(async () => ((await fichaDe(uid)).nom || {}).stringValue, { timeout: 20_000 }).toBe(nombreEsperado);
    // Al recargar (sesión ya iniciada), sigue en Inicio
    await p.reload();
    await expect(p.locator('#screen-inicio')).toBeVisible({ timeout: 40_000 });
    expect(p.erroresPagina).toEqual([]);
    await v.context.close();
  });
}

test('Clínica antigua con Google (ficha sin nombre): entra directa a Inicio', async ({ browser }, testInfo) => {
  test.skip(testInfo.project.name !== 'movil', 'se prueba en el tamaño de móvil, que es donde fallaba');
  await vaciarEmulador();
  const v1 = await nuevaVentana(browser, testInfo);
  await entrarConGoogle(v1.page);
  await expect(v1.page.locator('#screen-benvinguda')).toBeVisible({ timeout: 20_000 });
  await A.configurarClinica(v1.page, {}, { ...A.CLINICA, clinica: 'Clinica dr figui' });
  await v1.page.waitForTimeout(4000); // lo que tarda en subir la ficha y la página pública
  await v1.context.close();
  // Como una clínica antigua: a su ficha le falta el nombre (lo demás sigue en la nube)
  const uid = await uidDe('marta.google@prueba.es');
  await fetch(`${BASE}/clinicas/${uid}?updateMask.fieldPaths=nom`, { method: 'PATCH', headers: ADMIN, body: JSON.stringify({ fields: {} }) });
  expect((await fichaDe(uid)).nom).toBeUndefined();

  const v2 = await nuevaVentana(browser, testInfo), p = v2.page;
  await entrarConGoogle(p);
  await expect(p.locator('#screen-inicio')).toBeVisible({ timeout: 40_000 });
  await expect(p.locator('#screen-benvinguda')).toBeHidden();
  expect(await p.evaluate(() => CDB.clinica().nom)).toBe('Clinica dr figui');
  // Entrar desde un navegador nuevo no deja vacía la página pública que ya había en la nube
  await p.waitForTimeout(5000);
  const pub = await (await fetch(`${BASE}/clinicas_publicas/${uid}`, { headers: ADMIN })).json();
  expect(pub.fields.nom.stringValue).toBe('Clinica dr figui');
  expect(p.erroresPagina).toEqual([]);
  await v2.context.close();
});
