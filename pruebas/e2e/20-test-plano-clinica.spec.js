// Test DISC del lado clínica con todas las notas iguales:
// tiene que decir exactamente «Perfil sin definir», sin colores ni
// porcentajes, y solo dejar repasar (no se puede dar por terminado).
const { test, expect, nuevaVentana, capturar } = require('../apoyo/entorno');
const A = require('../apoyo/acciones');

test('Clínica: resultado plano → «Perfil sin definir»', async ({ browser }, testInfo) => {
  const { context, page } = await nuevaVentana(browser, testInfo);
  await A.registrarClinica(page, `plana-${testInfo.project.name}@prueba.es`);
  await page.getByText('Saltar y configurar mi clínica').click();
  await page.fill('#f-nom-onboarding', 'Clínica Plana');
  await page.locator('#screen-1-onboarding').getByRole('button', { name: 'Continuar' }).click();
  await page.getByText('Entendido — empezar el test').click();
  await A.contestarTestClinica(page, 'onboarding', { plano: true });

  const res = page.locator('#screen-results-onboarding');
  await expect(res).toBeVisible();
  await expect(page.locator('#result-name-onboarding')).toHaveText('Perfil sin definir');
  await expect(page.locator('#bars-container-onboarding')).toBeHidden();      // sin barras
  await expect(res).not.toContainText('%');                                    // sin porcentajes
  await expect(res.getByRole('button', { name: 'Finalizar' })).toBeHidden();   // no se puede terminar
  await expect(res.getByRole('button', { name: /Repasar/ })).toBeVisible();    // solo repasar
  await expect(page.locator('#result-desc-onboarding')).toBeHidden();         // sin párrafo de explicación
  await expect(res).not.toContainText('Hasta que lo repases');
  await capturar(page, 'clinica-21-test-perfil-sin-definir');
  await context.close();
});
