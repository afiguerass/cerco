// El test DISC se ve igual en la clínica y en el profesional (el modelo es el de la
// clínica) y ninguna frase ni número se sale de su recuadro: en ordenador, en móvil y
// con la tarjeta estrecha (como con la pantalla ampliada al 125-150 %).
const { test, expect, nuevaVentana, vaciarEmulador } = require('../apoyo/entorno');
const A = require('../apoyo/acciones');

// Lo que sobresale de cada frase (de su recuadro), en píxeles
const sobresale = (page, sel) => page.evaluate((sel) => {
  const out = [];
  document.querySelectorAll(sel).forEach((op) => {
    const r = op.getBoundingClientRect();
    op.querySelectorAll('*').forEach((x) => { const q = x.getBoundingClientRect(); if (q.width && (q.right > r.right + 1 || q.left < r.left - 1)) out.push((op.innerText.split('\n')[0] || '').slice(0, 40)); });
  });
  return [...new Set(out)];
}, sel);

async function revisar(page, opciones, tarjeta, siguiente, notas) {
  for (let q = 0; q < 15; q++) {
    expect(await sobresale(page, opciones), `pregunta ${q + 1}`).toEqual([]);
    // con la tarjeta estrecha, como con la pantalla ampliada
    await page.evaluate((t) => { document.querySelector(t).style.maxWidth = '330px'; }, tarjeta);
    expect(await sobresale(page, opciones), `pregunta ${q + 1}, tarjeta estrecha`).toEqual([]);
    await page.evaluate((t) => { document.querySelector(t).style.maxWidth = ''; }, tarjeta);
    await notas();
    await page.locator(siguiente).click();
  }
}

test('Test DISC: igual en los dos lados y nada se sale del recuadro', async ({ browser }, testInfo) => {
  await vaciarEmulador();
  const s = testInfo.project.name;
  // Clínica
  const v = await nuevaVentana(browser, testInfo), c = v.page;
  await A.registrarClinica(c, `disc-c-${s}@prueba.es`);
  await A.configurarClinica(c, { alPaso2: async () => { throw new Error('PARAR'); } }).catch((e) => { if (!/PARAR/.test(e.message)) throw e; });
  await c.getByText('Entendido — empezar el test').click();
  await revisar(c, '#options-container-onboarding .option', '#screen-test-onboarding', '#btn-next-onboarding', async () => {
    for (let k = 0; k < 4; k++) await c.locator(`#options-container-onboarding .option[data-k="${k}"] .tag-btn`).nth(1).click();
  });
  // Profesional
  const w = await nuevaVentana(browser, testInfo), p = w.page;
  await A.registrarProfesional(p, `disc-p-${s}@prueba.es`);
  await A.altaProfesional(p);
  await p.check('#t-consent'); await p.getByRole('button', { name: 'Empezar el test' }).click();
  // Las mismas instrucciones que la clínica (se puede repetir nota)
  await expect(p.locator('#t-preg .q-help')).toContainText('Puedes repetir nota: lo que cuenta es la diferencia entre unas frases y otras.');
  await expect(p.locator('#t-preg')).not.toContainText('número distinto');
  // El mismo diseño: tarjeta del mismo ancho y frase y escala en la misma fila (en ordenador)
  if (s === 'ordenador') {
    const anchoP = await p.evaluate(() => document.getElementById('t-preg').getBoundingClientRect().width);
    expect(Math.abs(anchoP - 488)).toBeLessThan(2); // el ancho de la tarjeta de la clínica
    const misma = await p.evaluate(() => { const o = document.querySelector('#t-ops .opt'), t = o.querySelector('.opt-t').getBoundingClientRect(), n = o.querySelector('.opt-n').getBoundingClientRect(); return n.top < t.bottom; });
    expect(misma).toBe(true);
  }
  await revisar(p, '#t-ops .opt', '#t-preg', '#t-next', async () => {
    for (let k = 0; k < 4; k++) await p.locator(`#t-ops .opt[data-k="${k}"] button`).nth(1).click();
  });
  expect(c.erroresPagina).toEqual([]);
  expect(p.erroresPagina).toEqual([]);
  await v.context.close(); await w.context.close();
});
