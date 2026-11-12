// Acciones sobre una oferta publicada: editar (con el salario bien cargado),
// pausar, reactivar, cerrar y eliminar.
const { test, expect, nuevaVentana, capturar } = require('../apoyo/entorno');
const A = require('../apoyo/acciones');

test('Mis ofertas: editar, pausar, reactivar, cerrar y eliminar', async ({ browser }, testInfo) => {
  const { context, page } = await nuevaVentana(browser, testInfo);
  page.on('dialog', (d) => d.accept()); // «¿Eliminar la oferta…?»
  await A.registrarClinica(page, `acciones-${testInfo.project.name}-${Date.now()}@prueba.es`);
  await A.configurarClinica(page);
  await A.publicarOferta(page, {
    titulo: 'Recepción', municipio: 'Girona', jornada: 'Parcial · 30 h/semana', salarioMin: '15000', salarioMax: '18000',
    contrato: 'Indefinido', convenio: 'Convenio colectivo de clínicas dentales de la provincia', horario: ['Mañanas'], tareas: [], proceso: ['Entrevista'], requisitos: 'Trato con el paciente',
  });
  const tarjeta = page.locator('#screen-ofertes .offer-card', { hasText: 'Recepción' }).first();

  // Editar: el formulario se llena con sus datos y el salario
  await tarjeta.getByRole('button', { name: 'Editar' }).click();
  await expect(page.locator('#co-titulo')).toHaveValue('Recepción');
  await expect(page.locator('#co-sal-min')).toHaveValue('15.000');
  await expect(page.locator('#co-sal-max')).toHaveValue('18.000');
  await capturar(page, 'clinica-41-editar-oferta');
  await page.getByText('← Cancelar y volver').first().click();

  // Pausar y reactivar
  await tarjeta.getByRole('button', { name: 'Pausar' }).click();
  await expect(page.locator('#screen-ofertes')).toContainText(/1\s*Pausadas/);
  await page.locator('#screen-ofertes .offer-card', { hasText: 'Recepción' }).first().getByRole('button', { name: /Reactivar|Activar/ }).click();
  await expect(page.locator('#screen-ofertes')).toContainText(/1\s*Ofertas activas/);

  // Cerrar (solo se puede desde una oferta pausada; sin gente esperando, no sale la ventana de cierre)
  await page.locator('#screen-ofertes .offer-card', { hasText: 'Recepción' }).first().getByRole('button', { name: 'Pausar' }).click();
  await page.locator('#screen-ofertes .offer-card', { hasText: 'Recepción' }).first().getByRole('button', { name: 'Cerrar' }).click();
  await expect(page.locator('#screen-ofertes')).toContainText(/1\s*Cerradas/);
  await expect(page.locator('#modal-cierre')).toHaveCount(0);

  // Eliminar (sin gente esperando: solo la confirmación del navegador)
  await page.locator('#screen-ofertes .offer-card', { hasText: 'Recepción' }).first().getByRole('button', { name: 'Eliminar' }).click();
  await expect(page.locator('#screen-ofertes .offer-card', { hasText: 'Recepción' })).toHaveCount(0);
  await capturar(page, 'clinica-41-oferta-eliminada');
  expect(page.erroresPagina).toEqual([]);
  await context.close();
});
