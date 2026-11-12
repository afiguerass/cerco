// Descartar con motivo: la clínica dice que no con un motivo del puesto y el
// profesional lo ve en su solicitud.
const { test, expect, nuevaVentana, capturar, vaciarEmulador } = require('../apoyo/entorno');
const A = require('../apoyo/acciones');

test.describe.configure({ mode: 'serial' });

test('Descartar con motivo: la clínica lo elige y el profesional lo ve', async ({ browser }, testInfo) => {
  await vaciarEmulador(); // datos limpios: así las capturas salen siempre igual
  const sufijo = testInfo.project.name;
  const clinica = await nuevaVentana(browser, testInfo);
  const pro = await nuevaVentana(browser, testInfo);
  const c = clinica.page, p = pro.page;

  await A.registrarClinica(c, `desc-clinica-${sufijo}@prueba.es`);
  const nombreClinica = 'Clínica Dental Descarte';
  await A.configurarClinica(c, {}, { ...A.CLINICA, clinica: nombreClinica });
  await A.publicarOferta(c, {
    titulo: 'Higienista dental', municipio: 'Girona', jornada: 'Completa · 40 h/semana', salarioMin: '22000', salarioMax: '26000',
    contrato: 'Indefinido', convenio: 'Convenio colectivo de clínicas dentales de la provincia', horario: ['Mañanas'], tareas: ['Higienes y mantenimientos'], proceso: ['Entrevista'], requisitos: 'Titulación',
  });

  await A.registrarProfesional(p, `desc-pro-${sufijo}@prueba.es`);
  await A.altaProfesional(p);
  await p.check('#t-consent');
  await p.getByRole('button', { name: 'Empezar el test' }).click();
  await A.contestarTestProfesional(p, { pesos: { D: 1, I: 3, S: 2, C: 4 } });
  await p.click('#tr-btn');
  await p.locator('#gu-next').waitFor(); // la guía de Seimian sale la primera vez
  await p.evaluate(() => { guiaCerrar(); ir('ofertas'); });
  await p.getByText(nombreClinica).locator('visible=true').first().click();
  await p.getByRole('button', { name: 'Solicitar esta oferta' }).click();
  await p.click('#m-btn');
  await expect(p.getByText('Solicitud enviada').locator('visible=true').first()).toBeVisible();

  // La clínica abre la ficha y descarta con motivo
  await c.evaluate(() => showScreen('ofertes'));
  await c.locator('#screen-ofertes').getByRole('button', { name: 'Ver candidatos' }).first().click();
  await c.locator('[onclick^="abrirFichaCandidato"]', { hasText: 'Laura Prueba' }).locator('visible=true').first().click();
  await c.waitForTimeout(1500);
  await c.getByRole('button', { name: 'Descartar' }).locator('visible=true').first().click();
  await expect(c.locator('#mk-motivos')).toBeVisible();
  await c.locator('#mk-motivos').getByRole('button', { name: 'Buscamos más experiencia' }).click();
  await expect(c.locator('#cand-nota')).toHaveValue(/más experiencia/);
  await capturar(c, 'clinica-42-descartar-con-motivo', { centrar: c.locator('#mk-motivos') });
  await c.click('#cand-ok');
  await expect(c.locator('#cand-ok')).toHaveCount(0, { timeout: 15_000 });

  // El profesional lo ve en su solicitud, con el motivo
  await p.evaluate(() => ir('solicitudes'));
  await expect(p.locator('main')).toContainText(/No han seguido|Descartada|No seguimos/, { timeout: 15_000 });
  await p.locator('main').getByText(nombreClinica, { exact: false }).locator('visible=true').first().click();
  await expect(p.locator('body')).toContainText('más experiencia');
  await capturar(p, 'pro-42-descartada-con-motivo');
  expect(c.erroresPagina).toEqual([]);
  expect(p.erroresPagina).toEqual([]);
  await clinica.context.close(); await pro.context.close();
});
