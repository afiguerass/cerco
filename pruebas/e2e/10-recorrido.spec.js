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
    alPaso2: () => capturar(page, 'clinica-04-que-es-disc'),
    alResultado: async () => {
      await expect(page.locator('#badge-onboarding')).toHaveText('Perfil D/C');
      await expect(page.locator('#result-name-onboarding')).toHaveText('Dominante con rasgo de concienzudo');
      await capturar(page, 'clinica-05-resultado-test');
    },
  });
  await expect(page.locator('#screen-publicat')).toContainText(A.CLINICA.clinica);
  await capturar(page, 'clinica-06-perfil-publicado');
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
  await A.contestarTestClinica(t, 'testdisc', { pesos: { D: 1, I: 4, S: 3, C: 2 } });
  await expect(t.locator('#screen-results-testdisc')).toBeVisible();
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
  await expect(page.getByText('Todavía sin perfil definido')).toBeVisible();
  await expect(page.getByText('Hasta que lo repases no hay colores ni perfil, y no puedes enviar solicitudes.')).toBeVisible();
  await expect(page.getByText('Concienzudo (C)')).toHaveCount(0); // sin barras ni porcentajes
  await capturar(page, 'pro-07-test-sin-perfil');

  // Repasa las preguntas y ahora sí distingue → perfil C con rasgo I
  await page.getByRole('button', { name: 'Repasar 15 preguntas' }).click();
  await A.contestarTestProfesional(page, { pesos: { D: 1, I: 3, S: 2, C: 4 } });
  await expect(page.getByText('Concienzudo con rasgo influyente')).toBeVisible();
  await capturar(page, 'pro-08-test-resultado');
  await page.click('#tr-btn');
  await expect(page.getByText('Buenos días, Laura')).toBeVisible();
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
  await expect(page.getByText('cv-prueba.pdf')).toBeVisible();
  await expect(page.getByText('Tu perfil está al 86 %')).toBeVisible();
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
  await expect(page.getByText('2 ofertas a menos de 25 km de Salt')).toBeVisible();
  await capturar(page, 'pro-12-ofertas');
  await page.getByText('Higienista dental de tarde', { exact: true }).locator('visible=true').first().click();
  await expect(page.getByText('Tu encaje')).toBeVisible();
  await expect(page.getByText('A 3 km de Salt')).toBeVisible();
  await capturar(page, 'pro-13-oferta-detalle');
  await page.getByRole('button', { name: 'Solicitar esta oferta' }).click();
  await capturar(page, 'pro-14-solicitar');
  await page.fill('#m-msg', 'Me encantaría conoceros.');
  await page.click('#m-btn');
  await expect(page.getByText('Solicitud enviada').first()).toBeVisible();

  await page.evaluate(() => ir('ofertas'));
  await page.getByText('Higienista dental', { exact: true }).locator('visible=true').first().click();
  await expect(page.getByText('97%').first()).toBeVisible();
  await page.getByRole('button', { name: 'Solicitar esta oferta' }).click();
  await page.click('#m-btn');
  await page.evaluate(() => ir('solicitudes'));
  await expect(page.locator('body')).toContainText('Higienista dental de tarde');
  await capturar(page, 'pro-15-mis-solicitudes');
});
