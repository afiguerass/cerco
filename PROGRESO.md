# Progreso de CERCO profesional

Este archivo resume en qué punto está el trabajo. Se actualiza después de cada paso.
Se trabaja en la rama `profesional`; la web publicada (rama `main`) no se toca sin el visto bueno de Asish.

## Fase actual: Fase 0 — Preparar el terreno

### Hecho
- [x] **Paso 1** — Creada la rama `profesional` y este archivo `PROGRESO.md`.
- [x] Comprobado que `firestore.rules` ya está en el repositorio (reglas del 11 de noviembre de 2026). Asish ha confirmado que son las que están publicadas en Firebase.
- [x] **Paso 2** — Escrito `README.md` en español: qué es cada archivo, dónde se guardan los datos y qué son las pruebas.
- [x] **Paso 3** — Montado el banco de pruebas en `pruebas/`: emulador de Firebase (Auth + Firestore, proyecto ficticio `demo-cerco`), Playwright en ordenador y móvil, y una primera prueba que comprueba que las dos páginas cargan conectadas al emulador. Instrucciones en `pruebas/LEEME.md`.

### Falta (Fase 0)
- [ ] **Paso 4** — Pruebas de las reglas de seguridad de Firestore.
- [ ] **Paso 5** — Pruebas del recorrido completo clínica ↔ profesional, en ordenador (1400 px) y móvil (390 px).
- [ ] **Paso 6** — Capturas de pantalla de referencia de cada pantalla.
- [ ] **Paso 7** — Todas las pruebas en verde y lista corta para que Asish pruebe a mano.

### Siguiente paso
**Paso 4:** pruebas de las reglas de seguridad de Firestore.

## Avisos y fallos encontrados (no se arreglan en la Fase 0)
- **`candidato.html` intenta registrar un archivo `sw.js` que no existe en el repositorio** (función `registrarSW`). El navegador recibe un «no encontrado» (error 404). Consecuencia probable: los avisos del portal del profesional cuando la app está en segundo plano no llegan como notificación del sistema. Dentro de la app se siguen viendo.

## Notas técnicas
- Desde el entorno de Claude Code no se puede descargar Firebase desde `www.gstatic.com`. En las pruebas se sirve una copia idéntica (misma versión 10.12.0, paquete oficial `firebase` de npm). La web publicada no cambia.
