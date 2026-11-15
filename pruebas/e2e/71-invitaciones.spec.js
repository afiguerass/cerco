// Invitaciones: la clínica encuentra a alguien en «Buscar talento», le invita a
// una oferta concreta y, si la persona acepta, se crea la solicitud y aparece
// en «Candidatos» con su nombre, su contacto y su CV. Hasta ese momento la
// clínica no ve nada de eso. Y como mucho, 10 invitaciones por semana.
const { test, expect, nuevaVentana, vaciarEmulador, capturar, FIRESTORE, PROYECTO } = require('../apoyo/entorno');
const A = require('../apoyo/acciones');

const base = `http://${FIRESTORE.host}:${FIRESTORE.port}/v1/projects/${PROYECTO}/databases/(default)/documents`;

const OFERTA = {
  titulo: 'Higienista dental', municipio: 'Girona', jornada: 'Completa · 40 h/semana',
  salarioMin: '22000', salarioMax: '26000', contrato: 'Indefinido',
  convenio: 'Convenio colectivo de clínicas dentales de la provincia',
  horario: ['Mañanas'], tareas: ['Higienes y mantenimientos'], proceso: ['Entrevista'], requisitos: 'Titulación',
};

test('Invitar: la clínica invita, la profesional acepta y pasa a «Candidatos» con su contacto', async ({ browser }, testInfo) => {
  test.skip(testInfo.project.name !== 'ordenador', 'basta con un tamaño de pantalla');
  await vaciarEmulador();

  // La profesional se da de alta y elige «Anónimo»: sale en las búsquedas,
  // pero sin su nombre y sin su foto.
  const vp = await nuevaVentana(browser, testInfo);
  const p = vp.page;
  await A.registrarProfesional(p, 'invitada@prueba.es');
  await A.altaProfesional(p);
  await p.check('#t-consent');
  await p.getByRole('button', { name: 'Empezar el test' }).click();
  await A.contestarTestProfesional(p, { pesos: { D: 1, I: 3, S: 2, C: 4 } });
  await p.click('#tr-btn');
  await A.elegirComoTeVen(p, 'anonimo');
  await p.locator('#gu-next').waitFor();
  await p.evaluate(() => guiaCerrar());

  // La clínica publica una oferta y la busca
  const vc = await nuevaVentana(browser, testInfo);
  const c = vc.page;
  await A.registrarClinica(c, 'invitadora@prueba.es');
  await A.configurarClinica(c, {}, { ...A.CLINICA, clinica: 'Clínica Invitadora' });
  await A.publicarOferta(c, OFERTA);
  await c.evaluate(() => showScreen('buscar'));
  const tarjeta = c.locator('#buscar-box .bt-card').first();
  await expect(tarjeta).toBeVisible({ timeout: 20_000 });

  // 1. Antes de invitar, la clínica no ve ni el nombre ni el contacto
  await expect(tarjeta).toContainText('Anónimo');
  await expect(tarjeta).not.toContainText('Laura');
  await expect(c.locator('#buscar-box')).not.toContainText(A.PROFESIONAL.telefono);

  // 2. Invita: elige la oferta y escribe un mensaje
  await tarjeta.getByRole('button', { name: 'Invitar' }).click();
  await expect(c.locator('#modal-inv')).toBeVisible();
  await expect(c.locator('#inv-of')).toHaveValue(/.+/);
  await c.fill('#inv-msg', 'Nos encantaría conocerte. Buscamos a alguien con tu forma de trabajar.');
  await capturar(c, 'clinica-72-invitar');
  await c.click('#inv-ok');
  await expect(c.getByText('Invitación enviada. Te avisaremos si solicita.')).toBeVisible();
  await expect(c.locator('#buscar-box')).toContainText('9 de 10 invitaciones esta semana');

  // 3. A la profesional le llega: en su Inicio, entre lo que necesita respuesta
  await p.evaluate(() => ir('inicio'));
  await expect(p.locator('#in2')).toContainText('Clínica Invitadora te invita a solicitar', { timeout: 20_000 });
  await capturar(p, 'pro-40-invitacion');

  // 4. Al abrir la oferta ve quién le invita y su mensaje
  await p.getByRole('button', { name: /^Ver la? oferta$/ }).first().click();
  await expect(p.locator('#v-oferta')).toContainText('te invita a solicitar esta oferta');
  await expect(p.locator('#v-oferta')).toContainText('Nos encantaría conocerte.');

  // 5. Acepta: solicita
  await p.getByRole('button', { name: 'Solicitar esta oferta' }).click();
  await p.waitForTimeout(2100);  // la web ignora un segundo «Enviar» en menos de 2 s
  await p.click('#m-btn');
  await expect(p.getByText('Solicitud enviada').locator('visible=true').first()).toBeVisible();

  // 6. En «Candidatos» aparece en «Por contestar», ya con su nombre y su contacto
  await c.evaluate(() => showScreen('portal'));
  const fila = c.locator('[onclick^="abrirFichaCandidato"]', { hasText: 'Laura Prueba' }).locator('visible=true');
  await expect(fila.first()).toBeVisible({ timeout: 30_000 });
  // queda en «Por contestar» (etapa «nuevas») y marcada como venida de la invitación
  await expect(fila.first()).toHaveAttribute('data-etapa', 'nuevas');
  await expect(fila.first()).toContainText('Aceptó tu invitación');
  // Y al abrir su ficha ya están el nombre completo y el contacto, que antes de
  // aceptar la invitación la clínica no podía ver.
  await fila.first().click();
  const ficha = c.locator('#screen-ficha');
  await expect(ficha).toBeVisible({ timeout: 20_000 });
  await expect(ficha).toContainText('Laura Prueba');
  await expect(ficha).toContainText(A.PROFESIONAL.telefono);
  await capturar(c, 'clinica-73-ficha-tras-invitacion');

  // 7. La invitación queda marcada como aceptada, y esa persona ya no sale en la búsqueda
  await expect.poll(async () => {
    const r = await fetch(`${base}/invitaciones`, { headers: { Authorization: 'Bearer owner' } });
    const l = (await r.json()).documents || [];
    return l.map((d) => d.fields.estado.stringValue);
  }, { timeout: 20_000 }).toEqual(['aceptada']);

  expect(c.erroresPagina).toEqual([]);
  expect(p.erroresPagina).toEqual([]);
  await vp.context.close(); await vc.context.close();
});

test('Como mucho 10 invitaciones por semana', async ({ browser }, testInfo) => {
  test.skip(testInfo.project.name !== 'ordenador', 'basta con un tamaño de pantalla');
  await vaciarEmulador();

  const v = await nuevaVentana(browser, testInfo);
  const c = v.page;
  await A.registrarClinica(c, 'tope@prueba.es');
  await A.configurarClinica(c, {}, { ...A.CLINICA, clinica: 'Clínica del Tope' });
  await A.publicarOferta(c, OFERTA);
  const uid = await c.evaluate(() => Nube.uid);

  // Se le dan 10 invitaciones ya enviadas esta semana
  const hoy = new Date().toISOString();
  for (let i = 0; i < 10; i++) {
    await fetch(`${base}/invitaciones/vieja-${i}`, {
      method: 'PATCH',
      headers: { Authorization: 'Bearer owner', 'Content-Type': 'application/json' },
      body: JSON.stringify({ fields: {
        clinicaId: { stringValue: uid }, candidatoUid: { stringValue: 'otro-' + i },
        ofertaId: { stringValue: 'x' }, estado: { stringValue: 'pendiente' }, fecha: { stringValue: hoy },
      } }),
    });
  }
  await fetch(`${base}/talento/libre-1`, {
    method: 'PATCH',
    headers: { Authorization: 'Bearer owner', 'Content-Type': 'application/json' },
    body: JSON.stringify({ fields: {
      modo: { stringValue: 'anonimo' }, profesion: { stringValue: 'Higienista dental' },
      experiencia: { stringValue: 'De 3 a 5 años' }, actualizado: { stringValue: hoy },
    } }),
  });

  await c.evaluate(() => showScreen('buscar'));
  await expect(c.locator('#buscar-box')).toContainText('0 de 10 invitaciones esta semana', { timeout: 20_000 });

  // Se puede abrir la ventana, pero no enviar: se dice por qué
  await c.locator('#buscar-box .bt-card').first().getByRole('button', { name: 'Invitar' }).click();
  await expect(c.locator('#modal-inv')).toBeVisible();
  await c.click('#inv-ok');
  await expect(c.locator('#inv-err')).toContainText('Ya has enviado 10 invitaciones esta semana.');

  expect(c.erroresPagina).toEqual([]);
  await v.context.close();
});
