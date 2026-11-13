// Detección de iPhone / iPad (esIOS, lado profesional): los iPad en modo
// escritorio se presentan como un Mac con pantalla táctil y tienen que contar
// como iPad (el vídeo con sonido funciona distinto en Safari).
const { test, expect } = require('../apoyo/entorno');

const CASOS = [
  ['iPhone', 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 Version/17.0 Mobile/15E148 Safari/604.1', 'iPhone', 5, true],
  ['iPad en modo escritorio', 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 Version/17.0 Safari/605.1.15', 'MacIntel', 5, true],
  ['Mac de verdad', 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 Version/17.0 Safari/605.1.15', 'MacIntel', 0, false],
  ['Android', 'Mozilla/5.0 (Linux; Android 14) AppleWebKit/537.36 Chrome/120.0 Mobile Safari/537.36', 'Linux armv8l', 5, false],
];

for (const [nombre, ua, plataforma, toques, esperado] of CASOS) {
  test(`esIOS: ${nombre} → ${esperado ? 'sí' : 'no'}`, async ({ page }, testInfo) => {
    test.skip(testInfo.project.name !== 'ordenador', 'basta con un tamaño de pantalla');
    await page.addInitScript(([u, p, t]) => {
      Object.defineProperty(navigator, 'userAgent', { get: () => u });
      Object.defineProperty(navigator, 'platform', { get: () => p });
      Object.defineProperty(navigator, 'maxTouchPoints', { get: () => t });
    }, [ua, plataforma, toques]);
    await page.goto('/candidato.html');
    expect(await page.evaluate(() => esIOS())).toBe(esperado);
  });
}
