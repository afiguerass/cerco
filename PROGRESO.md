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
- [x] **Paso 5** — Recorrido completo de punta a punta (`pruebas/e2e/10-recorrido.spec.js`), en ordenador (1400 px) y en móvil (390 px). Lo hacen tres ventanas a la vez, cada una con su sesión: clínica, profesional y un trabajador del equipo.
  - **Clínica:** se registra, rellena el perfil y hace su test DISC. Envía el enlace del test al equipo y un trabajador lo hace. Publica dos ofertas con puesto, varios pasos de proceso y salario.
  - **Profesional:** se registra y rellena el alta. Hace el test: primero sale «sin perfil definido», sin colores ni porcentajes y sin poder solicitar; repasa y le sale su perfil. Sube vídeo y CV. Ve las ofertas con su 97 % de encaje y a 3 km, y solicita las dos.
  - **Clínica:** ve las solicitudes agrupadas por profesión y abre la ficha grande, con el CV completo sin descargarlo. Marca «Me interesa», programa la entrevista con día y hora, contrata, envía el contrato con PDF y marca un paso del plan de acogida.
  - **Profesional:** ve «¡Te han contratado!» y «Tu incorporación» con el plan (2 de 8, lo mismo que marcó la clínica). Confirma «Lo he recibido» y retira la otra solicitud. La clínica ve que lo ha confirmado.
  - Al final se comprueba que no ha habido ningún error de JavaScript en las páginas.
- [x] **Paso 6** — 88 capturas de referencia (44 en ordenador y 44 en móvil) en `pruebas/capturas/`. Cada vez que se pasan las pruebas se comparan con estas. Para que salgan siempre igual: fecha y hora fijas (lunes 9 de noviembre de 2026, 10:00), y se tapan los vídeos, las frases del test (salen en orden aleatorio) y los avisos flotantes. En el móvil la web se desplaza por dentro, así que cada captura muestra lo que cabe en la pantalla.

### Falta (Fase 0)
- [ ] **Paso 7** — Todas las pruebas en verde y lista corta para que Asish pruebe a mano.

### Siguiente paso
**Paso 7:** pasar todas las pruebas juntas desde cero y preparar la lista para que Asish pruebe a mano.

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
