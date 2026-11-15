// En la web real (con «Datos de ejemplo» apagado) nunca salen datos inventados:
// ni candidatos, ni ofertas, ni clínicas. Y una cuenta de clínica que entra en el
// lado del profesional ve un aviso claro de que esa cuenta es de clínica.
const { test, expect, nuevaVentana, vaciarEmulador } = require('../apoyo/entorno');
const A = require('../apoyo/acciones');

const INVENTADOS = ['María García', 'Jana Moreno', 'Lucía Pérez', 'Ana Castro', 'Marcos Roca', 'Elena Navarro',
  'David Vidal', 'Paula Solís', 'Óscar Gallego', 'Carmen Ruiz', 'Íñigo Fernández', 'Nerea Blanco',
  'Mar Blau', 'Madrid Centro', 'Dental Retiro', 'Odontológico Sants', '23 candidatos'];
async function sinInventados(page, donde) {
  const texto = await page.evaluate(() => document.body.innerText);
  for (const n of INVENTADOS) expect(texto.includes(n), `«${n}» sale en ${donde}`).toBe(false);
}

test('Clínica sin «Datos de ejemplo»: ninguna pantalla enseña datos inventados', async ({ browser }, testInfo) => {
  await vaciarEmulador();
  const v = await nuevaVentana(browser, testInfo), c = v.page;
  await A.registrarClinica(c, `real-${testInfo.project.name}@prueba.es`);
  await A.configurarClinica(c, {}, { ...A.CLINICA, clinica: 'Clínica Real' });
  for (const s of ['inicio', 'ofertes', 'portal', 'agenda', 'equipo', 'stats', 'herramientas', 'onboarding', 'publicat', 'mi-cuenta']) {
    await c.evaluate((s) => { const m = document.getElementById('global-chat-modal'); if (m) m.remove(); showScreen(s); }, s);
    await c.waitForTimeout(600);
    await sinInventados(c, 'la pantalla ' + s);
  }
  // Candidatos: sin candidatos reales, ni tarjetas ni cuentas inventadas, y se explica cuándo aparecen
  await c.evaluate(() => showScreen('portal'));
  await expect(c.locator('#screen-portal .candidate-card').locator('visible=true')).toHaveCount(0);
  await expect(c.locator('#screen-portal')).not.toContainText('(12)');
  await expect(c.locator('#portal-aviso-real')).toContainText('Aquí aparecerán las personas que soliciten tus ofertas.');
  await expect(c.locator('#portal-aviso-real')).toContainText('que las clínicas me inviten');
  expect(c.erroresPagina).toEqual([]);
  await v.context.close();
});

test('Lado del profesional: sin datos inventados, y una cuenta de clínica ve el aviso', async ({ browser }, testInfo) => {
  test.skip(testInfo.project.name !== 'ordenador', 'basta con un tamaño de pantalla');
  await vaciarEmulador();
  // Una cuenta de clínica recién creada, todavía sin configurar
  const vc = await nuevaVentana(browser, testInfo);
  await A.registrarClinica(vc.page, 'clinica-sin-configurar@prueba.es');
  await vc.page.waitForTimeout(2000); // lo que tarda en crear su ficha
  await vc.context.close();
  const v = await nuevaVentana(browser, testInfo), p = v.page;
  await p.goto('/candidato.html');
  await sinInventados(p, 'la portada');
  await p.evaluate(() => ir('login'));
  await p.fill('#li-email', 'clinica-sin-configurar@prueba.es');
  await p.fill('#li-pwd', A.CLINICA.pwd);
  await p.click('#li-btn');
  await expect(p.locator('#v-esclinica')).toBeVisible({ timeout: 20_000 });
  await expect(p.locator('#v-esclinica')).toContainText('Esta cuenta es de una clínica');
  // Un profesional, sin ninguna oferta publicada: ninguna oferta inventada
  const w = await nuevaVentana(browser, testInfo), q = w.page;
  await A.registrarProfesional(q, 'pro-real@prueba.es');
  await A.altaProfesional(q);
  await q.check('#t-consent'); await q.getByRole('button', { name: 'Empezar el test' }).click();
  await A.contestarTestProfesional(q, { pesos: { D: 1, I: 3, S: 2, C: 4 } });
  await q.click('#tr-btn'); await A.elegirComoTeVen(q); await q.locator('#gu-next').waitFor(); await q.evaluate(() => guiaCerrar());
  for (const s of ['inicio', 'ofertas', 'descubrir', 'solicitudes', 'perfil']) {
    await q.evaluate((s) => ir(s), s); await q.waitForTimeout(800);
    await sinInventados(q, 'la pantalla ' + s + ' del profesional');
  }
  await expect(q.locator('#v-ofertas')).toContainText('Todavía no hay ofertas publicadas');
  expect(p.erroresPagina).toEqual([]);
  expect(q.erroresPagina).toEqual([]);
  await v.context.close(); await w.context.close();
});
