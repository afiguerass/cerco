// Grabar con la cámara desde CERCO. Es el camino que siempre funciona (no
// recodifica nada), así que tiene que aguantar también cuando la persona
// graba, no le gusta y vuelve a grabar.
const { test, expect, nuevaVentana, vaciarEmulador } = require('../apoyo/entorno');
const A = require('../apoyo/acciones');

// Una cámara de mentira: un lienzo que cambia de color y un pitido. Así se
// puede probar el recorrido entero sin cámara de verdad.
const CAMARA_FALSA = () => {
  navigator.mediaDevices = navigator.mediaDevices || {};
  navigator.mediaDevices.getUserMedia = async () => {
    const c = document.createElement('canvas');
    c.width = 320; c.height = 240;
    const cx = c.getContext('2d');
    setInterval(() => {
      cx.fillStyle = (Date.now() / 300 | 0) % 2 ? '#2a6' : '#26a';
      cx.fillRect(0, 0, 320, 240);
    }, 100);
    const s = c.captureStream(15);
    try {
      const ac = new (window.AudioContext || window.webkitAudioContext)();
      const dst = ac.createMediaStreamDestination();
      const osc = ac.createOscillator(); osc.connect(dst); osc.start();
      dst.stream.getAudioTracks().forEach((t) => s.addTrack(t));
    } catch (e) { /* sin audio también vale para esta prueba */ }
    return s;
  };
};

test('Grabar, no gustarme y volver a grabar: la cámara se vuelve a ver', async ({ browser }, testInfo) => {
  test.skip(testInfo.project.name !== 'ordenador', 'basta con un tamaño de pantalla');
  await vaciarEmulador();

  const v = await nuevaVentana(browser, testInfo);
  const p = v.page;
  await p.addInitScript(CAMARA_FALSA);
  await A.registrarProfesional(p, 'camara@prueba.es');
  await A.altaProfesional(p);
  await p.check('#t-consent');
  await p.getByRole('button', { name: 'Empezar el test' }).click();
  await A.contestarTestProfesional(p, { pesos: { D: 1, I: 3, S: 2, C: 4 } });
  await p.click('#tr-btn');
  await A.elegirComoTeVen(p, 'visible');
  await p.locator('#gu-next').waitFor();
  await p.evaluate(() => guiaCerrar());
  await p.evaluate(() => ir('perfil'));
  await p.getByRole('button', { name: 'Grabar' }).first().click();

  // 1. Se enciende la cámara y te ves
  await p.getByRole('button', { name: 'Encender cámara' }).click();
  const enMarcha = () => p.evaluate(() => {
    const v2 = document.getElementById('gv-v');
    return { hayCamara: !!v2.srcObject, parado: v2.paused, t: v2.currentTime };
  });
  await expect.poll(() => enMarcha().then((x) => x.hayCamara && !x.parado), { timeout: 20_000 }).toBe(true);

  // Se avisa de que es un espejo, que si no la gente cree que sale al revés
  await expect(p.locator('#gv-nota')).toContainText('como en un espejo');

  // 2. Graba un trozo corto y lo para
  await p.locator('.gv-rec').click();
  await p.waitForTimeout(2500);
  await p.getByRole('button', { name: 'Parar' }).click();

  // Es muy corto, así que ofrece grabar otra vez. Y aquí ya no hay espejo.
  await expect(p.locator('#gv-err')).toContainText('Graba entre 15 y 60', { timeout: 20_000 });
  await expect(p.locator('#gv-nota')).toBeHidden();

  // 3. «Grabar otra vez»: ANTES la pantalla se quedaba en negro
  await p.getByRole('button', { name: 'Grabar otra vez' }).click();
  await expect.poll(() => enMarcha().then((x) => x.hayCamara && !x.parado), { timeout: 20_000 }).toBe(true);
  await expect(p.locator('#gv-nota')).toBeVisible();
  // y de verdad avanza, no es una imagen congelada
  const t1 = (await enMarcha()).t;
  await p.waitForTimeout(1200);
  expect((await enMarcha()).t).toBeGreaterThan(t1);

  expect(p.erroresPagina).toEqual([]);
  await v.context.close();
});
