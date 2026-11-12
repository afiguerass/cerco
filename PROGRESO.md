# Progreso de CERCO profesional

Este archivo resume en qué punto está el trabajo. Se actualiza después de cada paso.
Se trabaja en la rama `profesional`; la web publicada (rama `main`) no se toca sin el visto bueno de Asish.

## Fase actual: Fase 0 — Preparar el terreno

### Hecho
- [x] **Paso 1** — Creada la rama `profesional` y este archivo `PROGRESO.md`.
- [x] Comprobado que `firestore.rules` ya está en el repositorio (reglas del 11 de noviembre de 2026). Asish ha confirmado que son las que están publicadas en Firebase.

### Falta (Fase 0)
- [ ] **Paso 2** — `README.md` en español que explique qué es cada archivo.
- [ ] **Paso 3** — Montar el banco de pruebas (Playwright + emulador de Firebase) en una carpeta aparte, sin tocar `index.html` ni `candidato.html`.
- [ ] **Paso 4** — Pruebas de las reglas de seguridad de Firestore.
- [ ] **Paso 5** — Pruebas del recorrido completo clínica ↔ profesional, en ordenador (1400 px) y móvil (390 px).
- [ ] **Paso 6** — Capturas de pantalla de referencia de cada pantalla.
- [ ] **Paso 7** — Todas las pruebas en verde y lista corta para que Asish pruebe a mano.

### Siguiente paso
**Paso 2:** escribir el `README.md`.

## Avisos y fallos encontrados (no se arreglan en la Fase 0)
- Ninguno por ahora.

## Notas técnicas
- Desde el entorno de Claude Code no se puede descargar Firebase desde `www.gstatic.com`. En las pruebas se sirve una copia idéntica (misma versión 10.12.0, paquete oficial `firebase` de npm). La web publicada no cambia.
