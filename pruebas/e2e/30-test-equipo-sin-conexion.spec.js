// Trabajador que hace el test con el enlace del equipo y su resultado NO
// llega a la clínica (por ejemplo, sin conexión): no puede ver la pantalla de
// «Tu resultado ya está con tu clínica»; se queda con su código de reserva.
const { test, expect, nuevaVentana } = require('../apoyo/entorno');
const A = require('../apoyo/acciones');

test('Equipo: si el resultado no llega, no se da por enviado', async ({ browser }, testInfo) => {
  const { context, page } = await nuevaVentana(browser, testInfo);
  await page.goto('/index.html?c=clinica-inventada&n=Cl%C3%ADnica%20Prueba');
  await page.fill('#invitado-nombre', 'Pau Serra');
  await page.getByRole('button', { name: 'Empezar el test' }).click();
  await page.locator('#screen-intro-testdisc').getByRole('button').last().click();
  // Simulamos que el envío falla
  await page.evaluate(() => { Nube.enviarResultado = () => Promise.resolve(false); });
  await A.contestarTestClinica(page, 'testdisc', { pesos: { D: 4, I: 1, S: 2, C: 3 } });
  await expect(page.locator('#screen-results-testdisc')).toBeVisible();
  await expect(page.locator('#btn-guardar-testdisc')).toBeHidden();
  await expect(page.locator('#insight-box-testdisc')).toContainText('No hemos podido enviarlo');
  await expect(page.locator('#insight-box-testdisc')).not.toContainText('ya le ha llegado');
  await expect(page.locator('#screen-gracias')).toBeHidden();
  await context.close();
});
