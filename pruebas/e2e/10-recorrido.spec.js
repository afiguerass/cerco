// RECORRIDO COMPLETO de CERCO, de punta a punta, como lo haría la gente real:
//
//   1. Una clínica se registra, configura su perfil y hace su test DISC.
//   2. Un trabajador de la clínica hace el test con el enlace del equipo.
//   3. La clínica publica dos ofertas (puesto, proceso con varios pasos, salario).
//   4. Una profesional se registra y hace el test (primero sale «sin perfil
//      definido», repasa y le sale su perfil), sube vídeo y CV, ve las ofertas
//      con su % de encaje y solicita las dos.
//   5. La clínica ve la solicitud, abre la ficha grande, «me interesa»,
//      entrevista con cita, contrata, envía el contrato y marca el plan de acogida.
//   6. La profesional ve el estado, «Tu incorporación», confirma el contrato
//      y retira la otra solicitud.
//
// Hay tres ventanas a la vez, cada una con su sesión: la clínica (ventana
// normal), la profesional (como una ventana de incógnito) y el trabajador.
// Se ejecuta dos veces: ordenador (1400 px) y móvil (390 px).
const { test, expect, nuevaVentana, capturar, vaciarEmulador } = require('../apoyo/entorno');
const A = require('../apoyo/acciones');

// Comprueba que un texto se ve en pantalla (el primero visible, si sale varias veces)
const seVe = (page, texto, opciones = {}) =>
  expect(page.getByText(texto, opciones).locator('visible=true').first()).toBeVisible({ timeout: opciones.timeout });

test.describe.configure({ mode: 'serial' });

const OFERTA_1 = {
  titulo: 'Higienista dental',
  municipio: 'Girona',
  jornada: 'Completa · 40 h/semana',
  salarioMin: '22000',
  salarioMax: '26000',
  contrato: 'Indefinido',
  convenio: 'Convenio colectivo de clínicas dentales de la provincia',
  horario: ['Mañanas'],
  tareas: ['Higienes y mantenimientos', 'Radiografías'],
  proceso: ['Entrevista', 'Prueba práctica', 'Segunda entrevista'],
  requisitos: 'Titulación de higienista, Colegiada',
};
const OFERTA_2 = {
  ...OFERTA_1,
  titulo: 'Higienista dental de tarde',
  jornada: 'Parcial · 20 h/semana',
  salarioMin: '12000',
  salarioMax: '14000',
  horario: ['Tardes'],
  tareas: ['Higienes y mantenimientos'],
  proceso: ['Entrevista', 'Visita a la clínica'],
};

let clinica, pro; // { context, page }
let correoClinica, correoPro;

test.beforeAll(async ({ browser }, testInfo) => {
  await vaciarEmulador();
  const p = testInfo.project.name;
  correoClinica = `clinica-${p}@prueba.es`;
  correoPro = `laura-${p}@prueba.es`;
  clinica = await nuevaVentana(browser, testInfo, { permissions: ['clipboard-read', 'clipboard-write'] });
  pro = await nuevaVentana(browser, testInfo);
});

test.afterAll(async () => {
  await clinica?.context.close();
  await pro?.context.close();
});

test('1. La clínica se registra, configura su perfil y hace su test', async () => {
  const page = clinica.page;
  await page.goto('/index.html');
  await capturar(page, 'clinica-01-inicio-sesion');
  await A.registrarClinica(page, correoClinica);
  await capturar(page, 'clinica-02-bienvenida');
  await A.configurarClinica(page, {
    alPaso1: () => capturar(page, 'clinica-03-perfil-paso1'),
    alPaso2: async () => {
      await expect(page.locator('#screen-2-onboarding')).toContainText('Puedes repetir número');
      await expect(page.locator('#screen-2-onboarding')).not.toContainText('una sola vez');
      await capturar(page, 'clinica-04-que-es-disc');
    },
    alResultado: async () => {
      await expect(page.locator('#badge-onboarding')).toHaveText('Perfil D/C');
      await expect(page.locator('#result-name-onboarding')).toHaveText('Dominante con rasgo de concienzudo');
      await capturar(page, 'clinica-05-resultado-test');
    },
  });
  await expect(page.locator('#screen-publicat')).toContainText(A.CLINICA.clinica);
  await expect(page.locator('#screen-publicat')).toContainText('QUIÉN RESPONDE A LOS CANDIDATOS');
  await expect(page.locator('#screen-publicat')).not.toContainText(/responsable de contratación/i);
  await capturar(page, 'clinica-06-perfil-publicado');

  // Mi cuenta: el rol se elige con el nombre «Coordinador/a de clínica», pero
  // el dato que se guarda sigue siendo el de siempre («Responsable de RRHH»)
  await page.evaluate(() => showScreen('mi-cuenta'));
  await page.selectOption('#mc-rol', { label: 'Coordinador/a de clínica' });
  await expect(page.locator('#mc-rol')).toHaveValue('Responsable de RRHH');
  await expect(page.locator('#mc-hero-role')).toContainText('Coordinador/a de clínica');
  await expect.poll(() => page.evaluate(() => JSON.parse(localStorage.getItem('cerco_empresa') || '{}').rol)).toBe('Responsable de RRHH');
  await capturar(page, 'clinica-06b-mi-cuenta');
});

test('2. Un trabajador hace el test con el enlace del equipo', async ({ browser }, testInfo) => {
  const page = clinica.page;
  await page.evaluate(() => showScreen('equipo'));
  await expect(page.locator('#screen-equipo')).toContainText('Envía el enlace a tu gente');
  await capturar(page, 'clinica-07-mi-equipo');
  await page.locator('#screen-equipo').getByRole('button', { name: 'Copiar' }).first().click();
  const enlace = await page.evaluate(() => navigator.clipboard.readText());
  expect(enlace).toContain('index.html?c=');

  const trabajador = await nuevaVentana(browser, testInfo);
  const t = trabajador.page;
  await t.goto(enlace);
  await expect(t.locator('#screen-invitado')).toBeVisible();
  await expect(t.locator('#invitado-clinica')).toHaveText(A.CLINICA.clinica);
  await capturar(t, 'equipo-01-invitacion');
  await t.fill('#invitado-nombre', 'Carmen Ruiz');
  await t.getByRole('button', { name: 'Empezar el test' }).click();
  await expect(t.locator('#screen-testdisc')).toBeVisible();
  await capturar(t, 'equipo-02-portada-test');
  await t.locator('#screen-intro-testdisc').getByRole('button').last().click();
  // Para ver qué pasa mientras se envía, el envío tarda 3 segundos en esta prueba
  await t.evaluate(() => {
    const orig = Nube.enviarResultado.bind(Nube);
    Nube.enviarResultado = (...args) => new Promise((r) => setTimeout(r, 3000)).then(() => orig(...args));
  });
  await A.contestarTestClinica(t, 'testdisc', { pesos: { D: 1, I: 4, S: 3, C: 2 } });
  await expect(t.locator('#screen-results-testdisc')).toBeVisible();
  // Mientras se envía, «Guardar y continuar» no se puede pulsar
  await expect(t.locator('#btn-guardar-testdisc')).toBeDisabled();
  await expect(t.locator('#btn-guardar-testdisc')).toHaveText('Enviando…');
  await expect(t.locator('#btn-guardar-testdisc')).toBeEnabled({ timeout: 20_000 });
  await expect(t.locator('#btn-guardar-testdisc')).toHaveText('Guardar y continuar');
  await expect(t.locator('#insight-box-testdisc')).toContainText('Ya está, Carmen');
  await expect(t.locator('#insight-box-testdisc')).toContainText(`Tu resultado ya le ha llegado a ${A.CLINICA.clinica}`);
  await capturar(t, 'equipo-03-resultado');
  await t.locator('#btn-guardar-testdisc').click();
  await expect(t.locator('#screen-gracias')).toBeVisible();
  await capturar(t, 'equipo-04-gracias');
  await trabajador.context.close();

  // La clínica ve a Carmen en «Mi equipo» (al volver a entrar en la pantalla)
  await page.reload();
  await page.evaluate(() => showScreen('equipo'));
  await expect(page.locator('#screen-equipo')).toContainText('Carmen Ruiz', { timeout: 20_000 });
});

test('3. La clínica publica dos ofertas', async () => {
  const page = clinica.page;
  await page.evaluate(() => showScreen('ofertes'));
  await capturar(page, 'clinica-08-mis-ofertas-vacia');
  await A.publicarOferta(page, {
    ...OFERTA_1,
    alRellenar: async () => {
      await expect(page.locator('#screen-crear-oferta')).toContainText('El candidato verá: Entrevista + Prueba práctica + Segunda entrevista');
      await capturar(page, 'clinica-09-nueva-oferta-rellena');
    },
  });
  await A.publicarOferta(page, OFERTA_2);
  const activas = page.locator('#screen-ofertes');
  await expect(activas).toContainText('Higienista dental de tarde');
  await expect(activas).toContainText('Girona · Completa · 40 h/semana');
  await capturar(page, 'clinica-10-mis-ofertas');
});

test('4. La profesional se registra y hace el test («sin perfil» y después su perfil)', async () => {
  const page = pro.page;
  await page.goto('/candidato.html');
  await capturar(page, 'pro-01-portada');
  await A.registrarProfesional(page, correoPro);
  await capturar(page, 'pro-02-bienvenida');
  await A.altaProfesional(page, {
    alPaso1: () => capturar(page, 'pro-03-alta-paso1'),
    alPaso2: () => capturar(page, 'pro-04-alta-paso2'),
  });
  await capturar(page, 'pro-05-portada-test');
  await page.check('#t-consent');
  await page.getByRole('button', { name: 'Empezar el test' }).click();
  await capturar(page, 'pro-06-pregunta-test');

  // Primero lo contesta todo con la misma nota → no hay perfil
  await A.contestarTestProfesional(page, { plano: true });
  await seVe(page, 'Perfil sin definir', { exact: true });
  // Solo la frase y la opción de repasar: sin párrafos de explicación
  await expect(page.locator('#tr-desc')).toBeHidden();
  await expect(page.locator('#tr-h')).toBeHidden();
  await expect(page.locator('body')).not.toContainText('Has dado casi la misma nota');
  await expect(page.getByText('Concienzudo (C)')).toHaveCount(0); // sin barras ni porcentajes
  await capturar(page, 'pro-07-test-sin-perfil');

  // Repasa las preguntas y ahora sí distingue → perfil C con rasgo I
  await page.getByRole('button', { name: 'Repasar 15 preguntas' }).click();
  await A.contestarTestProfesional(page, { pesos: { D: 1, I: 3, S: 2, C: 4 } });
  await seVe(page, 'Concienzudo con rasgo influyente');
  await capturar(page, 'pro-08-test-resultado');
  await page.click('#tr-btn');
  await seVe(page, 'Buenos días, Laura');
  // La guía de Seimian sale la primera vez: la cerramos
  await page.locator('#gu-next').waitFor();
  await capturar(page, 'pro-09-inicio-con-guia');
  await page.evaluate(() => guiaCerrar());
});

test('4b. La profesional sube su vídeo y su CV', async () => {
  const page = pro.page;
  await page.getByRole('button', { name: 'Grabar' }).first().click();
  await page.locator('input[onchange^="subirVideoArchivo"]').setInputFiles(A.archivo('video-vertical.webm'));
  await expect(page.locator('#gv-usar')).toBeVisible();
  await capturar(page, 'pro-10-video-vista-previa');
  await page.click('#gv-usar');
  await expect(page.getByText('Ver mi vídeo (0:16)')).toBeVisible({ timeout: 60_000 });
  await page.locator('input[onchange^="elegirCV"]').setInputFiles(A.archivo('cv-prueba.pdf'));
  await seVe(page, 'cv-prueba.pdf');
  await seVe(page, 'Tu perfil está al 86 %');
  await capturar(page, 'pro-11-mi-perfil');
  // El vídeo y el CV se han guardado en la base de datos (en trozos)
  const trozos = await page.evaluate(async () => {
    const u = firebase.auth().currentUser.uid;
    const s = await firebase.firestore().collection(`candidatos/${u}/media`).get();
    return s.docs.map((d) => d.id);
  });
  expect(trozos.some((t) => t.startsWith('video_'))).toBeTruthy();
  expect(trozos.some((t) => t.startsWith('cv_'))).toBeTruthy();
});

test('4c. La profesional ve las ofertas con su % de encaje y solicita las dos', async () => {
  const page = pro.page;
  await page.evaluate(() => ir('ofertas'));
  await seVe(page, '2 ofertas a menos de 25 km de Salt');
  await capturar(page, 'pro-12-ofertas');
  await page.locator('.of-t', { hasText: /^Higienista dental de tarde$/ }).locator('visible=true').first().click();
  await seVe(page, 'Tu encaje');
  await seVe(page, 'A 3 km de Salt');
  await expect(page.locator('body')).toContainText('Te responde Marta, coordinador/a de clínica.');
  await expect(page.locator('body')).not.toContainText('1 personas');
  await capturar(page, 'pro-13-oferta-detalle');
  await page.getByRole('button', { name: 'Solicitar esta oferta' }).click();
  await capturar(page, 'pro-14-solicitar');
  await page.fill('#m-msg', 'Me encantaría conoceros.');
  await page.click('#m-btn');
  await seVe(page, 'Solicitud enviada');

  await page.evaluate(() => ir('ofertas'));
  await page.locator('.of-t', { hasText: /^Higienista dental$/ }).locator('visible=true').first().click();
  await seVe(page, '97%');
  await page.getByRole('button', { name: 'Solicitar esta oferta' }).click();
  // La web ignora un segundo «Enviar solicitud» en menos de 2 s (evita dobles
  // clics). Una persona tarda más; la prueba espera lo mismo.
  await page.waitForTimeout(2100);
  await page.click('#m-btn');
  await seVe(page, 'Solicitud enviada');
  await page.evaluate(() => ir('solicitudes'));
  await expect(page.locator('main').getByText('Clínica Dental Prueba · Ahora mismo')).toHaveCount(2);
  await expect(page.locator('main')).toContainText('Higienista dental de tarde');
  await capturar(page, 'pro-15-mis-solicitudes');
});

test('5. La clínica ve la solicitud, la ficha grande, me interesa, entrevista y contrata', async () => {
  const page = clinica.page;
  await page.evaluate(() => showScreen('ofertes'));
  await expect(page.locator('#screen-ofertes')).toContainText(/\b1 candidato\b/);
  await expect(page.locator('#screen-ofertes')).not.toContainText('1 candidatos');
  await expect(page.locator('#screen-ofertes')).toContainText(/1\s*Candidatos totales/);
  await capturar(page, 'clinica-11-ofertas-con-solicitudes');
  await page.locator('#screen-ofertes').getByRole('button', { name: 'Ver candidatos' }).first().click();
  // Laura ha solicitado las dos ofertas: es una sola persona, y en esta oferta solo hay una solicitud
  await seVe(page, '1 candidato ha aplicado');
  await seVe(page, 'Tienes 1 solicitud sin abrir');
  await seVe(page, 'Higienistas'); // agrupados por profesión
  await capturar(page, 'clinica-12-candidatos');

  // Ficha grande: resumen arriba, vídeo + CV resumido, personalidad, contacto, acciones
  await page.locator('[onclick^="abrirFichaCandidato"]', { hasText: 'Laura Prueba' }).locator('visible=true').first().click();
  await seVe(page, 'RESUMEN DEL CANDIDATO');
  await expect(page.locator('body')).toContainText('Higienista dental con entre 3 y 5 años de experiencia');
  await seVe(page, 'Ver su vídeo de presentación (0:16)');
  await seVe(page, 'CV resumido');
  await seVe(page, 'Perfil de personalidad');
  await seVe(page, 'POR QUÉ 97% DE ENCAJE');
  await seVe(page, correoPro);
  await capturar(page, 'clinica-13-ficha-candidata');

  // Menú «Correo» del contacto: iconos de trazo, sin emojis
  await page.locator('a[href^="mailto:"]').locator('visible=true').last().click();
  await seVe(page, 'Abrir en Gmail');
  await expect(page.locator('#correo-menu svg')).toHaveCount(4);
  await capturar(page, 'clinica-13b-menu-correo', { centrar: page.locator('#correo-menu') });
  // Se cierra con Esc (y la ficha tiene que seguir funcionando: se comprueba después con «Me interesa»)
  await page.keyboard.press('Escape');
  await expect(page.locator('#correo-menu')).toHaveCount(0);


  // El CV completo se puede ver sin descargarlo
  await page.click('#ficha-cv-ver');
  // El visor se ve entero (también en el móvil, por encima de la barra de arriba)
  await seVe(page, 'CV Laura Prueba.pdf');
  await capturar(page, 'clinica-14-ver-cv');
  // En el ordenador se cierra con la tecla Esc; en el móvil, con la «×».
  if (test.info().project.name === 'ordenador') await page.keyboard.press('Escape');
  else await page.click('#cv-x');
  await expect(page.getByText('CV Laura Prueba.pdf').locator('visible=true')).toHaveCount(0);
  await page.waitForTimeout(1500); // la ficha se vuelve a dibujar sola al abrirla (pasa a «vista»)
  await page.getByRole('button', { name: 'Me interesa', exact: true }).locator('visible=true').first().click();
  await seVe(page, 'Laura pasa a «Me interesan». Ya ve que sigue en el proceso.');
  await seVe(page, 'Te interesa');

  await page.getByRole('button', { name: 'Invitar a entrevista' }).locator('visible=true').first().click();
  await expect(page.locator('#cita-ok')).toBeVisible();
  await page.locator('[onclick^="_citaSet(\'dia\'"]').filter({ hasText: '12 nov' }).click();
  await page.locator('[onclick="_citaSet(\'hora\',\'10:30\')"]').click();
  await page.locator('[onclick="_citaSet(\'modo\',\'clinica\')"]').click();
  await page.fill('#cita-msg', 'Te esperamos en la clínica.');
  await capturar(page, 'clinica-15-programar-entrevista');
  await page.click('#cita-ok');
  await seVe(page, 'Jueves 12 de noviembre · 10:30');
  await capturar(page, 'clinica-16-entrevista-programada');

  await page.getByRole('button', { name: 'Contratar' }).locator('visible=true').first().click();
  await expect(page.locator('#hire-ok')).toBeVisible();
  await page.click('#hire-ok');
  await seVe(page, 'Laura está en «Contratados». Ábrela para enviarle el contrato y seguir el plan de acogida.');
  await capturar(page, 'clinica-17-contratados');
});

test('5b. La clínica envía el contrato y marca el plan de acogida', async () => {
  const page = clinica.page;
  await page.getByRole('button', { name: 'Ver ficha' }).locator('visible=true').first().click();
  await seVe(page, 'Plan de acogida · primeros 90 días');
  await page.fill('#ct-ini', '2026-11-16');
  await page.locator('#ct-file').setInputFiles(A.archivo('contrato-prueba.pdf'));
  await capturar(page, 'clinica-18-contrato-rellenado', { centrar: page.locator('#ct-ok') });
  await page.click('#ct-ok');
  await seVe(page, 'Aún no ha confirmado que lo ha visto.', { exact: false });
  await seVe(page, 'Empieza el 16 de noviembre de 2026');
  await seVe(page, 'contrato-prueba.pdf', { exact: false });
  await expect(page.locator('body')).toContainText('1 de 8 hechos');
  // Marca un paso del plan de acogida
  await page.getByText('Uniforme, taquilla y acceso al programa de la clínica preparados.').locator('visible=true').first().click();
  await expect(page.locator('body')).toContainText('2 de 8 hechos');
  await capturar(page, 'clinica-19-contrato-y-acogida', { centrar: page.getByText('Plan de acogida · primeros 90 días').locator('visible=true').first() });
});

test('6. La profesional ve el estado, «Tu incorporación», confirma el contrato y retira la otra', async () => {
  const page = pro.page;
  await page.evaluate(() => ir('inicio'));
  await seVe(page, 'Clínica Dental Prueba te ha elegido');
  await capturar(page, 'pro-16-inicio-contratada');
  await page.evaluate(() => ir('solicitudes'));
  await seVe(page, '¡Te han contratado!');
  await capturar(page, 'pro-17-solicitudes-contratada');

  await page.evaluate(() => ir('inicio'));
  await page.getByRole('button', { name: 'Ver su mensaje' }).click();
  await seVe(page, 'Tu incorporación');
  await seVe(page, 'Empiezas el 16 de noviembre de 2026');
  // La entrevista (12 de noviembre) aún no ha llegado (hoy es 9 de noviembre): no sale en pasado
  await seVe(page, 'Será el jueves 12 de noviembre, a las 10:30.');
  await expect(page.locator('body')).toContainText(/Tus primeros 90 días\s*2 de 8/);
  await capturar(page, 'pro-18-tu-incorporacion');

  await page.getByRole('button', { name: 'Lo he recibido' }).click();
  await expect(page.getByRole('button', { name: 'Lo he recibido' })).toHaveCount(0);
  await page.click('#inc-ret');
  await expect(page.locator('#inc-ret')).toHaveCount(0);
  await capturar(page, 'pro-19-contrato-confirmado');

  await page.evaluate(() => ir('solicitudes'));
  await seVe(page, 'Retirada');
  await capturar(page, 'pro-20-solicitudes-final');

  // La clínica ve que Laura ha confirmado el contrato
  const c = clinica.page;
  await c.reload();
  await c.evaluate(() => showScreen('portal'));
  await c.locator('[onclick="CERCO_etapa(\'contr\')"]').locator('visible=true').first().click();
  await c.getByRole('button', { name: 'Ver ficha' }).locator('visible=true').first().click();
  await expect(c.getByText('Aún no ha confirmado que lo ha visto.', { exact: false })).toHaveCount(0);
  await capturar(c, 'clinica-20-contrato-confirmado');

  // Nada se ha roto por el camino: ningún error de JavaScript en las páginas
  expect(clinica.page.erroresPagina).toEqual([]);
  expect(pro.page.erroresPagina).toEqual([]);
});
