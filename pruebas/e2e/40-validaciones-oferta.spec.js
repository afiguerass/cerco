// «Publicar oferta»: cada comprobación que hace la web antes de publicar, con
// su mensaje exacto. Sirve para asegurar que al ordenar el código (Fase 1)
// todas siguen igual y en el mismo orden.
const { test, expect, nuevaVentana, capturar } = require('../apoyo/entorno');
const A = require('../apoyo/acciones');

test('Publicar oferta: comprobaciones y mensajes', async ({ browser }, testInfo) => {
  const { context, page } = await nuevaVentana(browser, testInfo);
  await A.registrarClinica(page, `valida-${testInfo.project.name}-${Date.now()}@prueba.es`);
  await A.configurarClinica(page);
  await page.evaluate(() => showScreen('crear-oferta'));
  const err = page.locator('#co-err');
  const publicar = async () => { await page.waitForTimeout(1000); await page.locator('#screen-crear-oferta').getByRole('button', { name: 'Publicar oferta' }).click(); };
  const rellenarBase = async () => {
    await page.fill('#co-titulo', 'Auxiliar de clínica dental');
    await page.fill('#co-ubicacion', 'Girona');
  };

  // Sin título: se pide título y ubicación
  await publicar();
  await expect(err).toHaveText('Completa al menos el título y la ubicación.');

  // Palabra prohibida por ley (edad), aunque falte todo lo demás
  await page.fill('#co-titulo', 'Auxiliar menores de 30');
  await publicar();
  await expect(err).toContainText('La oferta menciona «menores de 30». Un anuncio de empleo no puede pedir ni excluir por edad');

  // Falta el tipo de contrato
  await rellenarBase();
  await publicar();
  await expect(err).toHaveText('Elige el tipo de contrato.');
  await page.selectOption('#co-contrato', 'Indefinido');

  // Falta el convenio
  await publicar();
  await expect(err).toHaveText('Indica el convenio colectivo (o «Sin convenio aplicable» si es una colaboración como autónomo).');
  await page.fill('#co-convenio', 'Convenio colectivo de clínicas dentales de la provincia');

  // Municipio que no existe
  await page.fill('#co-ubicacion', 'Villaninguna');
  await publicar();
  await expect(err).toContainText('No encontramos «Villaninguna». Escribe el municipio donde está la clínica');
  await page.fill('#co-ubicacion', 'Girona');

  // Sin salario
  await publicar();
  await expect(err).toHaveText('Indica el salario: la ley obliga a darlo antes de la entrevista.');
  await page.fill('#co-sal-min', '20000');
  await page.fill('#co-sal-max', '18000');
  await publicar();
  await expect(err).toHaveText('El máximo no puede ser menor que el mínimo.');
  await capturar(page, 'clinica-40-oferta-error-salario', { centrar: page.locator('#co-err') });

  // Todo bien: se publica y el formulario queda limpio
  await page.fill('#co-sal-max', '22000');
  await publicar();
  await expect(page.locator('#screen-ofertes')).toBeVisible();
  await expect(page.locator('#screen-ofertes')).toContainText('Auxiliar de clínica dental');
  await page.evaluate(() => showScreen('crear-oferta'));
  for (const id of ['#co-titulo', '#co-sal-min', '#co-sal-max', '#co-convenio']) await expect(page.locator(id)).toHaveValue('');
  await expect(page.locator('#co-contrato')).toHaveValue('');
  expect(page.erroresPagina).toEqual([]);
  await context.close();
});
