# Progreso de CERCO profesional

Este archivo resume en qué punto está el trabajo. Se actualiza después de cada paso.
Se trabaja en la rama `profesional`; la web publicada (rama `main`) no se toca sin el visto bueno de Asish.

## Fase actual: Fase 0 — Preparar el terreno

### Hecho
- [x] **Paso 1** — Creada la rama `profesional` y este archivo `PROGRESO.md`.
- [x] Comprobado que `firestore.rules` ya está en el repositorio (reglas del 11 de noviembre de 2026). Asish ha confirmado que son las que están publicadas en Firebase.
- [x] **Paso 2** — Escrito `README.md` en español: qué es cada archivo, dónde se guardan los datos y qué son las pruebas.
- [x] **Paso 3** — Montado el banco de pruebas en `pruebas/`: emulador de Firebase (Auth + Firestore, proyecto ficticio `demo-cerco`), Playwright en ordenador y móvil, y una primera prueba que comprueba que las dos páginas cargan conectadas al emulador. Instrucciones en `pruebas/LEEME.md`.
- [x] **Paso 4** — 33 pruebas de las reglas de seguridad (`pruebas/reglas/`), todas en verde. Comprueban, entre otras cosas, que un profesional no puede leer el perfil ni el vídeo de otro, que la clínica no puede cambiar los datos del profesional en una solicitud, que el profesional no puede marcarse «contratado», que otra clínica no ve nada que no sea suyo y que el contrato solo lo ven las dos partes.

### Falta (Fase 0)
- [ ] **Paso 5** — Pruebas del recorrido completo clínica ↔ profesional, en ordenador (1400 px) y móvil (390 px).
- [ ] **Paso 6** — Capturas de pantalla de referencia de cada pantalla.
- [ ] **Paso 7** — Todas las pruebas en verde y lista corta para que Asish pruebe a mano.

### Siguiente paso
**Paso 5 (casi terminado):** el recorrido completo ya pasa en ordenador y en móvil. Falta: repasarlo todo junto y pasar al Paso 6 (capturas).

## Avisos y fallos encontrados (no se arreglan en la Fase 0)
- **`candidato.html` intenta registrar un archivo `sw.js` que no existe en el repositorio** (función `registrarSW`). El navegador recibe un «no encontrado» (error 404). Consecuencia probable: los avisos del portal del profesional cuando la app está en segundo plano no llegan como notificación del sistema. Dentro de la app se siguen viendo.
- **Reglas de seguridad: puntos mejorables** (no son fallos visibles; se proponen para la Fase 3):
  - Cualquier cuenta, también la de un profesional, puede crearse un documento en `clinicas/{su uid}`. Con eso las reglas la tratan como «clínica» y puede leer `talento`. Los perfiles de `talento` son anónimos, así que el riesgo es bajo.
  - `tiempos_respuesta` y `condiciones` aceptan cualquier contenido de cualquier cuenta con sesión, sin comprobar quién escribe ni qué escribe. `valoraciones` solo comprueba que la nota sea de 1 a 5.
  - La clínica puede devolver una solicitud a un estado anterior (por ejemplo, de «contratada» a «vista»). Puede que sea a propósito, para corregir errores.
- **Clínica · visor del CV en el ordenador:** si la clínica abre el CV completo y lo cierra con la tecla **Esc**, la ficha deja de actualizarse. Al pulsar «Me interesa» el cambio se guarda, pero en pantalla sigue apareciendo «Nueva solicitud» y el botón «Me interesa». Cerrando con la «×» funciona bien.
- **Clínica · visor del CV en el móvil:** la barra superior de CERCO tapa la cabecera del visor del CV. No se ven el nombre del archivo ni la «×» para cerrar, así que en el móvil no hay forma visible de cerrarlo.
- **Cuando una persona solicita dos ofertas de la misma clínica:** en «Candidatos» de una oferta concreta la cabecera dice «2 candidatos han aplicado» y «Tienes 2 solicitudes sin abrir», aunque a esa oferta solo ha aplicado una persona. Parece que cuenta las solicitudes de todas las ofertas.
- **Trabajador del equipo (enlace del test):** el resultado se envía a la clínica mientras sale «Enviando…», pero el botón «Guardar y continuar» ya se puede pulsar. Si la persona lo pulsa y cierra la página antes de que termine, el resultado puede no llegar, aunque la pantalla final dice «Tu resultado ya está con tu clínica».
- **Textos que van contra las reglas del encargo** (no se han tocado):
  - El caso de resultado plano dice «Todavía sin perfil definido» y «Sin perfil definido». El encargo pide exactamente «Perfil sin definir».
  - El perfil público de la clínica muestra «RESPONSABLE DE CONTRATACIÓN» encima del nombre de la persona. Está prohibido.
  - «Ampliar con IA», «Generar descripción con IA» y «la IA ordenará la información…»: el texto se genera con una plantilla, no con una IA.
  - Paso 2 del alta de la clínica: dice «usando cada número una sola vez», pero en el test sí se pueden repetir números.
  - El contrato adjunto se muestra con un emoji (📄), y la interfaz no debe llevar emojis.
- **Pequeñas faltas en textos:** «Higienista dental con de 3 a 5 años de experiencia» (resumen de la ficha), «Equipo de 1 personas» (oferta vista por el profesional), «1 candidatos» (Mis ofertas de la clínica).
- **Doble clic:** la web ignora un segundo «Publicar oferta» en menos de 0,9 s y un segundo «Enviar solicitud» en menos de 2 s. Está bien para evitar duplicados; solo se apunta porque las pruebas tienen que esperar.

## Notas técnicas
- Desde el entorno de Claude Code no se puede descargar Firebase desde `www.gstatic.com`. En las pruebas se sirve una copia idéntica (misma versión 10.12.0, paquete oficial `firebase` de npm). La web publicada no cambia.
