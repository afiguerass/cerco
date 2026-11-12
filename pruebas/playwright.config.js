// Configuración de las pruebas de navegador (Playwright).
// Se ejecutan dos veces: como ordenador (1400 px de ancho) y como móvil (390 px).
const { defineConfig, devices } = require('@playwright/test');

module.exports = defineConfig({
  testDir: './e2e',
  timeout: 120_000,
  expect: { timeout: 15_000, toHaveScreenshot: { maxDiffPixelRatio: 0.01, animations: 'disabled' } },
  fullyParallel: false,
  workers: 1,
  retries: 0,
  reporter: [['list'], ['html', { open: 'never' }]],
  snapshotPathTemplate: '{testDir}/../capturas/{projectName}/{arg}{ext}',
  use: {
    baseURL: 'http://127.0.0.1:5500',
    locale: 'es-ES',
    timezoneId: 'Europe/Madrid',
    trace: 'off',
    screenshot: 'only-on-failure',
  },
  projects: [
    { name: 'ordenador', use: { ...devices['Desktop Chrome'], viewport: { width: 1400, height: 900 }, deviceScaleFactor: 1 } },
    { name: 'movil', use: { ...devices['Desktop Chrome'], viewport: { width: 390, height: 844 }, deviceScaleFactor: 1, isMobile: true, hasTouch: true } },
  ],
  webServer: {
    command: 'node apoyo/servidor.js',
    url: 'http://127.0.0.1:5500/index.html',
    reuseExistingServer: true,
  },
});
