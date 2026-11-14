// Entrar con Google con una clínica que ya existe: va directa a Inicio, sin la
// bienvenida, desde cualquier navegador y también al abrir la página con la sesión
// ya iniciada. (La ventana de Google no se puede abrir en las pruebas: se entra con
// una credencial de Google del emulador y se sigue el mismo camino que la web.)
const { test, expect, nuevaVentana, vaciarEmulador } = require('../apoyo/entorno');
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
