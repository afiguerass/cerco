// Acciones de usuario reutilizables: lo que haría una persona con la web.
const path = require('path');
const { expect } = require('@playwright/test');

const ARCHIVOS = path.join(__dirname, '..', 'recursos', 'archivos');
const archivo = (nombre) => path.join(ARCHIVOS, nombre);

// Las 4 frases de cada pregunta del test van siempre en el orden D, I, S, C
// dentro del código (aunque en pantalla salgan barajadas). Con «pesos»
// decimos qué nota damos a cada letra, p. ej. { D:1, I:2, S:4, C:3 }.
const LETRAS = ['D', 'I', 'S', 'C'];

// Nota que da una persona a cada frase.
// - Con «pesos» (objeto) da siempre la misma nota a cada letra.
// - Con «plano: true» da un 2 a todo → «sin perfil definido».
function notaPara(opciones, pregunta, letra) {
  if (opciones.plano) return 2;
  return opciones.pesos[letra];
}

// Test DISC del lado clínica (index.html). ctx: 'onboarding' o 'testdisc'.
async function contestarTestClinica(page, ctx, opciones) {
  const cont = page.locator(`#options-container-${ctx}`);
  for (let q = 0; q < 15; q++) {
    await expect(page.locator(`#progress-label-${ctx}`)).toHaveText(`Pregunta ${q + 1} de 15`);
    for (let k = 0; k < 4; k++) {
      const nota = notaPara(opciones, q, LETRAS[k]);
      await cont.locator(`.option[data-k="${k}"] .tag-btn`).nth(nota - 1).click();
    }
    await page.locator(`#btn-next-${ctx}`).click();
  }
}

// Test DISC del lado profesional (candidato.html).
async function contestarTestProfesional(page, opciones) {
  for (let q = 0; q < 15; q++) {
    await expect(page.locator('#t-lbl')).toHaveText(`Pregunta ${q + 1} de 15`);
    for (let k = 0; k < 4; k++) {
      const nota = notaPara(opciones, q, LETRAS[k]);
      await page.locator(`#t-ops .opt[data-k="${k}"] button`).nth(nota - 1).click();
    }
    await page.locator('#t-next').click();
  }
}

// ---------- LADO CLÍNICA ----------

const CLINICA = {
  responsable: 'Marta Gil',
  clinica: 'Clínica Dental Prueba',
  ciudadBuscar: 'Gir',
  ciudad: 'Girona · Girona, Cataluña',
  trabajadores: '8',
  direccion: 'C/ Nou 10',
  telefono: '972000000',
  correoContacto: 'hola@prueba.es',
  descripcion: 'Equipo joven y formación continua',
  pwd: 'secreto123',
};

async function registrarClinica(page, email, datos = CLINICA) {
  await page.goto('/index.html');
  await page.getByText('Regístrate aquí').click();
  await page.fill('#reg-nombre', datos.responsable);
  await page.fill('#reg-email', email);
  await page.fill('#reg-pwd', datos.pwd);
  await page.fill('#reg-pwd2', datos.pwd);
  await page.check('#reg-acepto');
  await page.getByRole('button', { name: 'Crear mi cuenta' }).click();
  await expect(page.locator('#screen-benvinguda')).toBeVisible();
}

// Pantallas de bienvenida → «Saltar y configurar mi clínica» → paso 1 → test → Finalizar
async function configurarClinica(page, opciones = {}, datos = CLINICA) {
  await page.getByText('Saltar y configurar mi clínica').click();
  await expect(page.locator('#screen-1-onboarding')).toBeVisible();
  await page.fill('#f-nombre-responsable', datos.responsable);
  await page.fill('#f-nom-onboarding', datos.clinica);
  await page.click('#f-ciutat-onboarding');
  await page.keyboard.type(datos.ciudadBuscar);
  await page.getByText(datos.ciudad, { exact: true }).locator('visible=true').click();
  await page.fill('#f-treb-onboarding', datos.trabajadores);
  await page.fill('#f-adreca-onboarding', datos.direccion);
  await page.fill('#f-tel-onboarding', datos.telefono);
  await page.fill('#f-email-onboarding', datos.correoContacto);
  await page.fill('#f-desc-onboarding', datos.descripcion);
  if (opciones.alPaso1) await opciones.alPaso1();
  await page.locator('#screen-1-onboarding').getByRole('button', { name: 'Continuar' }).click();
  await expect(page.locator('#screen-2-onboarding')).toBeVisible();
  if (opciones.alPaso2) await opciones.alPaso2();
  await page.getByText('Entendido — empezar el test').click();
  await contestarTestClinica(page, 'onboarding', { pesos: opciones.pesos || { D: 4, I: 2, S: 1, C: 3 } });
  await expect(page.locator('#screen-results-onboarding')).toBeVisible();
  if (opciones.alResultado) await opciones.alResultado();
  await page.locator('#screen-results-onboarding').getByRole('button', { name: 'Finalizar' }).click();
  await expect(page.locator('#screen-publicat')).toBeVisible();
}

// Publicar una oferta desde «Nueva oferta».
async function publicarOferta(page, oferta) {
  await page.evaluate(() => showScreen('crear-oferta'));
  const s = page.locator('#screen-crear-oferta');
  await expect(s).toBeVisible();
  await page.fill('#co-titulo', oferta.titulo);
  // Municipio: se borra lo que haya y se elige de la lista
  await page.fill('#co-ubicacion', '');
  await page.click('#co-ubicacion');
  await page.keyboard.type(oferta.municipio);
  await page.locator(`div[onclick="pickLocation('co-ubicacion','${oferta.municipio}')"]`).first().click();
  await page.selectOption('#co-jornada', oferta.jornada);
  await page.fill('#co-sal-min', oferta.salarioMin);
  await page.fill('#co-sal-max', oferta.salarioMax);
  await page.selectOption('#co-contrato', oferta.contrato);
  await page.fill('#co-convenio', oferta.convenio);
  const marcar = (t) => s.getByText(t, { exact: true }).locator('visible=true').first().click();
  for (const t of oferta.horario) await marcar(t);
  for (const t of oferta.tareas) await marcar(t);
  for (const t of oferta.proceso) await marcar(t);
  await page.fill('#co-requisitos', oferta.requisitos);
  if (oferta.alRellenar) await oferta.alRellenar();
  // La web ignora un segundo «Publicar» en menos de 0,9 s (evita dobles clics).
  // Una persona tarda más que eso en rellenar una oferta; la prueba espera 1 s.
  await page.waitForTimeout(1000);
  await s.getByRole('button', { name: 'Publicar oferta' }).click();
  await expect(page.locator('#screen-ofertes')).toBeVisible();
  await expect(page.locator('#screen-ofertes').getByText(oferta.titulo).first()).toBeVisible();
}

// ---------- LADO PROFESIONAL ----------

const PROFESIONAL = {
  nombre: 'Laura Prueba',
  pwd: 'secreto123',
  profesion: 'Higienista dental',
  experiencia: 'De 3 a 5 años',
  municipioBuscar: 'Salt',
  provincia: 'Girona',
  telefono: '600111222',
  titulacion: 'Técnico Superior en Higiene Bucodental',
  resumen: 'Me gusta el trato con el paciente y trabajar con calma y orden.',
};

async function registrarProfesional(page, email, datos = PROFESIONAL) {
  await page.goto('/candidato.html');
  await page.getByText('Crear mi perfil gratis').click();
  await page.fill('#re-nom', datos.nombre);
  await page.fill('#re-email', email);
  await page.fill('#re-pwd', datos.pwd);
  await page.check('#re-ok');
  await page.click('#re-btn');
  await expect(page.locator('#bv-next')).toBeVisible();
}

// Bienvenida (4 pantallas) y pasos 1 y 2 del alta. Termina en la portada del test.
async function altaProfesional(page, opciones = {}, datos = PROFESIONAL) {
  for (let i = 0; i < 4; i++) await page.click('#bv-next');
  await expect(page.locator('#al-nom')).toBeVisible();
  await page.fill('#al-nom', datos.nombre);
  await page.selectOption('#al-prof', datos.profesion);
  await page.selectOption('#al-exp', datos.experiencia);
  await page.click('#al-ciu');
  await page.keyboard.type(datos.municipioBuscar);
  await page.locator('.geo-op', { hasText: datos.provincia }).first().click();
  await page.fill('#al-tel', datos.telefono);
  await page.fill('#al-tit', datos.titulacion);
  if (opciones.alPaso1) await opciones.alPaso1();
  await page.getByRole('button', { name: 'Continuar' }).click();
  await expect(page.locator('#al-btn2')).toBeVisible();
  const chip = (t) => page.getByText(t, { exact: true }).locator('visible=true').first().click();
  for (const t of ['Completa', 'Ya mismo', '25 km', 'Trato con el paciente', 'Precisión']) await chip(t);
  await page.fill('#al-res', datos.resumen);
  await page.click('#al-exp-add');
  await page.getByPlaceholder('Ej: Higienista').fill('Higienista dental');
  await page.getByPlaceholder('Nombre de la clínica').fill('Clínica Sonrisa');
  await page.getByPlaceholder('Ej: 2 años').fill('5 años');
  if (opciones.alPaso2) await opciones.alPaso2();
  await page.click('#al-btn2');
  await expect(page.locator('#t-consent')).toBeVisible();
}

module.exports = {
  archivo, LETRAS, contestarTestClinica, contestarTestProfesional,
  CLINICA, registrarClinica, configurarClinica, publicarOferta,
  PROFESIONAL, registrarProfesional, altaProfesional,
};
