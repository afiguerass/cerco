// Estadísticas de la clínica: «Me interesa» cuenta como contestada y las
// contrataciones se ven siempre, aunque el equipo aún no tenga tests.
const { test, expect, nuevaVentana, vaciarEmulador, FIRESTORE, PROYECTO } = require('../apoyo/entorno');
const A = require('../apoyo/acciones');

const OFERTA = (titulo) => ({ titulo, municipio: 'Girona', jornada: 'Completa · 40 h/semana', salarioMin: '22000', salarioMax: '26000',
  contrato: 'Indefinido', convenio: 'Convenio colectivo de clínicas dentales de la provincia', horario: ['Mañanas'], tareas: ['Higienes y mantenimientos'], proceso: ['Entrevista'], requisitos: 'Titulación' });

test('Estadísticas: «Me interesa» cuenta como contestada y las contrataciones se ven siempre', async ({ browser }, testInfo) => {
  test.skip(testInfo.project.name !== 'ordenador', 'basta con un tamaño de pantalla');
  await vaciarEmulador();
  const vc = await nuevaVentana(browser, testInfo), vp = await nuevaVentana(browser, testInfo);
  const c = vc.page, p = vp.page;
  await A.registrarClinica(c, 'stats-clinica@prueba.es');
  await A.configurarClinica(c, {}, { ...A.CLINICA, clinica: 'Clínica Cifras' });
  await A.publicarOferta(c, OFERTA('Higienista A'));
  await A.publicarOferta(c, OFERTA('Higienista B'));

  await A.registrarProfesional(p, 'stats-pro@prueba.es');
  await A.altaProfesional(p);
  await p.check('#t-consent'); await p.getByRole('button', { name: 'Empezar el test' }).click();
  await A.contestarTestProfesional(p, { pesos: { D: 1, I: 3, S: 2, C: 4 } });
  await p.click('#tr-btn'); await p.locator('#gu-next').waitFor(); await p.evaluate(() => guiaCerrar());
  for (const t of ['Higienista A', 'Higienista B']) {
    await p.evaluate(() => ir('ofertas'));
    await p.locator('.of-t', { hasText: new RegExp('^' + t + '$') }).locator('visible=true').first().click();
    await p.getByRole('button', { name: 'Solicitar esta oferta' }).click();
    await p.waitForTimeout(2100); await p.click('#m-btn');
    await expect(p.getByText('Solicitud enviada').locator('visible=true').first()).toBeVisible();
    await p.waitForTimeout(3500); // la web lleva sola al detalle de la solicitud
  }

  const cifras = c.locator('#mk-cifras');
  const abrir = async (t) => {
    await expect.poll(() => c.evaluate((t) => !!CERCO_candidaturas().find((x) => x.ofertaTitulo === t), t)).toBe(true);
    await c.evaluate((t) => abrirFichaCandidato(CERCO_candidaturas().find((x) => x.ofertaTitulo === t).id), t);
    await c.waitForTimeout(1500); // la ficha se vuelve a dibujar sola al abrirla (pasa a «vista»)
  };
  // «Me interesa» en A: es una respuesta (1 de 2 contestadas) y A ya no «espera respuesta»
  await abrir('Higienista A');
  await c.getByRole('button', { name: 'Me interesa', exact: true }).locator('visible=true').first().click();
  await expect(c.getByText('pasa a «Me interesan»', { exact: false }).locator('visible=true').first()).toBeVisible();
  await c.evaluate(() => showScreen('stats'));
  await expect(cifras.locator('.mk-kpi', { hasText: 'contestadas' })).toContainText('50 %');
  await expect(cifras.locator('.mk-kpi', { hasText: /esperan tu respuesta/ })).toContainText('1');
  await expect(cifras.locator('.mk-kpi', { hasText: 'contrataciones' })).toContainText('0');

  // Entrevista y contratación en A
  await abrir('Higienista A');
  await c.getByRole('button', { name: 'Invitar a entrevista' }).locator('visible=true').first().click();
  await c.locator('[onclick^="_citaSet(\'dia\'"]').filter({ hasText: '12 nov' }).click();
  await c.locator('[onclick="_citaSet(\'hora\',\'10:30\')"]').click();
  await c.locator('[onclick="_citaSet(\'modo\',\'clinica\')"]').click();
  await c.click('#cita-ok');
  await abrir('Higienista A');
  await c.getByRole('button', { name: 'Contratar' }).locator('visible=true').first().click();
  await c.click('#hire-ok');
  await c.waitForTimeout(1500);
  await c.evaluate(() => showScreen('stats'));
  await expect(cifras.locator('.mk-kpi', { hasText: 'contratación' })).toContainText('1');
  await expect(cifras).toContainText('2 solicitudes → 1 entrevista → 1 contratación.');
  await expect(c.locator('#screen-stats')).not.toContainText('contrataciónes');

  // Sin ningún test del equipo, la contratación se sigue viendo
  await c.evaluate(() => { localStorage.removeItem('cerco_disc_empresa'); localStorage.setItem('cerco_equipo', '[]'); renderStatsReal(); });
  await expect(c.locator('#screen-stats')).toContainText('Falta la parte de tu equipo');
  await expect(cifras.locator('.mk-kpi', { hasText: 'contratación' })).toContainText('1');

  // Contratación de antes (como las que se hicieron antes de este cambio): sin pasar al equipo
  const base = `http://${FIRESTORE.host}:${FIRESTORE.port}/v1/projects/${PROYECTO}/databases/(default)/documents`;
  const miembrosCerco = async () => {
    const r = await (await fetch(`${base}/clinicas`, { headers: { Authorization: 'Bearer owner' } })).json();
    let n = 0;
    for (const d of r.documents || []) {
      const e = await (await fetch(`http://${FIRESTORE.host}:${FIRESTORE.port}/v1/${d.name}/equipo`, { headers: { Authorization: 'Bearer owner' } })).json();
      n += (e.documents || []).filter((x) => x.fields.origen && x.fields.origen.stringValue === 'cerco').length;
    }
    return n;
  };
  await expect.poll(miembrosCerco, { timeout: 30_000 }).toBe(1); // al contratar pasó al equipo
  await c.evaluate(async () => {
    const db = firebase.firestore(), uid = firebase.auth().currentUser.uid;
    const eq = await db.collection('clinicas').doc(uid).collection('equipo').get();
    for (const d of eq.docs) if ((d.data() || {}).origen === 'cerco') await d.ref.delete();
    const x = CERCO_candidaturas().find((x) => x.estado === 'contratada');
    await db.collection('candidaturas').doc(x.id).update({ alEquipo: firebase.firestore.FieldValue.delete() });
  });
  await expect.poll(miembrosCerco, { timeout: 30_000 }).toBe(0);
  await expect.poll(async () => {
    const r = await (await fetch(`${base}/candidaturas`, { headers: { Authorization: 'Bearer owner' } })).json();
    return (r.documents || []).some((d) => d.fields.estado.stringValue === 'contratada' && d.fields.alEquipo);
  }, { timeout: 30_000 }).toBe(false);
  expect(c.erroresPagina).toEqual([]);
  await vc.context.close();

  // Mis ofertas, desde otro ordenador: cada oferta dice cuántos candidatos tiene de verdad
  // (antes salía «0 candidatos» en las ofertas cuyo número no se había subido a la nube)
  const vo = await nuevaVentana(browser, testInfo), o = vo.page;
  await o.goto('/index.html');
  await o.fill('#login-email', 'stats-clinica@prueba.es');
  await o.fill('#login-pwd', A.CLINICA.pwd);
  await o.getByRole('button', { name: 'Iniciar sesión' }).click();
  await expect(o.locator('#login-email')).toBeHidden();
  await o.evaluate(() => showScreen('ofertes'));
  await expect.poll(() => o.locator('#screen-ofertes .offer-card:not(.ejemplo)').locator('visible=true').allInnerTexts()
    .then((l) => l.map((t) => (t.match(/Higienista [AB]/) || [''])[0] + ': ' + (t.match(/\d+ candidatos?/) || [''])[0]).sort()), { timeout: 20_000 })
    .toEqual(['Higienista A: 1 candidato', 'Higienista B: 1 candidato']);
  // La contratación de antes pasa sola a «Mi equipo», con su perfil y el puesto
  await o.evaluate(() => showScreen('equipo'));
  const fila = o.locator('#screen-equipo .miembro-row', { hasText: 'Laura Prueba' }).locator('visible=true');
  await expect(fila).toHaveCount(1, { timeout: 20_000 });
  await expect(fila).toContainText('Contratación en CERCO');
  await expect(fila).toContainText('Higienista A');

  expect(o.erroresPagina).toEqual([]);
  await vp.context.close(); await vo.context.close();
});
