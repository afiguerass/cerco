// Ofertas del profesional: se ve claro qué son «las de tu profesión» y dónde están
// todas. Fichas «De tu profesión» / «Todas las profesiones», la frase de arriba con los
// dos filtros y, debajo de la lista, lo que queda fuera y cómo verlo.
const { test, expect, nuevaVentana, vaciarEmulador, FIRESTORE, PROYECTO } = require('../apoyo/entorno');
const A = require('../apoyo/acciones');

const OFERTA = (titulo, municipio) => ({ titulo, municipio, jornada: 'Completa · 40 h/semana', salarioMin: '22000', salarioMax: '26000',
  contrato: 'Indefinido', convenio: 'Convenio colectivo de clínicas dentales de la provincia', horario: ['Mañanas'], tareas: [], proceso: ['Entrevista'], requisitos: 'Titulación' });

test('Ofertas: de tu profesión, todas las profesiones y las que quedan lejos', async ({ browser }, testInfo) => {
  test.skip(testInfo.project.name !== 'ordenador', 'basta con un tamaño de pantalla');
  await vaciarEmulador();
  const vc = await nuevaVentana(browser, testInfo), c = vc.page;
  await A.registrarClinica(c, 'ofertas@prueba.es');
  await A.configurarClinica(c);
  await A.publicarOferta(c, OFERTA('Higienista dental', 'Girona'));
  await A.publicarOferta(c, OFERTA('Auxiliar de clínica dental', 'Girona'));
  await A.publicarOferta(c, OFERTA('Higienista dental de Madrid', 'Madrid'));
  // (se espera a que las tres estén publicadas de verdad en la nube)
  await expect.poll(async () => {
    const r = await (await fetch(`http://${FIRESTORE.host}:${FIRESTORE.port}/v1/projects/${PROYECTO}/databases/(default)/documents/ofertas_publicas`, { headers: { Authorization: 'Bearer owner' } })).json();
    return (r.documents || []).length;
  }, { timeout: 30_000 }).toBe(3);
  await vc.context.close();

  const v = await nuevaVentana(browser, testInfo), p = v.page;
  await A.registrarProfesional(p, 'higienista@prueba.es');
  await A.altaProfesional(p);
  await p.check('#t-consent'); await p.getByRole('button', { name: 'Empezar el test' }).click();
  await A.contestarTestProfesional(p, { pesos: { D: 1, I: 3, S: 2, C: 4 } });
  await p.click('#tr-btn'); await p.locator('#gu-next').waitFor(); await p.evaluate(() => guiaCerrar());
  await p.evaluate(() => ir('ofertas'));

  const fichas = p.locator('#of-fil .chip');
  const tarjetas = p.locator('#of-list .of-t');
  // Al entrar: «De tu profesión», y la frase dice qué y dónde
  await expect(fichas.first()).toHaveText('De tu profesión');
  await expect(fichas.first()).toHaveClass(/on/);
  await expect(p.locator('#of-fil .chip[data-f="todas-prof"]')).toBeVisible();
  await expect(p.locator('#of-sub')).toHaveText('1 oferta de higienista dental a menos de 25 km de Salt · 3 en total en CERCO');
  await expect(tarjetas).toHaveText(['Higienista dental']);
  // Debajo de la lista: lo que queda fuera, con cómo verlo
  await expect(p.locator('.of-mas').nth(0)).toContainText('Hay 1 oferta más lejos · Ver en toda España');
  await expect(p.locator('.of-mas').nth(1)).toContainText('Hay 1 oferta de otra profesión · Ver todas las profesiones');
  // «Todas las profesiones»
  await p.locator('#of-fil .chip[data-f="todas-prof"]').click();
  await expect(p.locator('#of-fil .chip[data-f="todas-prof"]')).toHaveClass(/on/);
  await expect(fichas.first()).not.toHaveClass(/on/);
  await expect(tarjetas).toHaveCount(2);
  await expect(p.locator('#of-sub')).toHaveText('2 ofertas de todas las profesiones a menos de 25 km de Salt · 3 en total en CERCO');
  // «Ver en toda España»
  await p.getByRole('button', { name: 'Ver en toda España' }).click();
  await expect(tarjetas).toHaveCount(3);
  await expect(p.locator('#of-sub')).toHaveText('3 ofertas de todas las profesiones en toda España · 3 en total en CERCO');
  // Vuelta a «De tu profesión»
  await fichas.first().click();
  await expect(tarjetas).toHaveCount(2);
  // Lo que has estudiado también cuenta: auxiliar con el título de higiene bucodental ve las dos
  await p.evaluate(() => { S.perfil.profesion = 'Auxiliar de clínica dental'; S.perfil.titulacion = 'Técnico Superior en Higiene Bucodental'; pintarOfertas(); });
  await expect(p.locator('#of-sub')).toHaveText('3 ofertas de auxiliar de clínica dental o higienista dental en toda España · 3 en total en CERCO');
  await expect(tarjetas).toHaveCount(3);
  expect(p.erroresPagina).toEqual([]);
  await v.context.close();
});
