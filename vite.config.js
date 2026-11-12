// Configuración de Vite: compila las dos páginas de CERCO.
//   index.html      → lado clínica
//   candidato.html  → lado profesional
// «base: './'» hace que funcione igual en afiguerass.github.io/cerco/ que en
// un dominio propio, sin cambiar las direcciones de siempre.
import { defineConfig } from 'vite';
import { resolve } from 'node:path';

export default defineConfig({
  base: './',
  build: {
    outDir: 'dist',
    emptyOutDir: true,
    rollupOptions: {
      input: {
        index: resolve(import.meta.dirname, 'index.html'),
        candidato: resolve(import.meta.dirname, 'candidato.html'),
      },
    },
  },
});
