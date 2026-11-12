# Progreso de CERCO profesional

Este archivo resume en qué punto está el trabajo. Se actualiza después de cada paso.
Se trabaja en la rama `profesional`; la web publicada (rama `main`) no se toca sin el visto bueno de Asish.

## Fase actual: Fase 0 — Preparar el terreno (terminada)

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
- [x] **Paso 7** — Todo en verde con `npm test` desde cero: 33 pruebas de reglas y 24 de navegador (12 en ordenador y 12 en móvil). En la Fase 0 no se cambió ni una línea de la web; después, con el visto bueno de Asish, se han hecho los arreglos de abajo.

## Fase 0 terminada — esperando el visto bueno de Asish

### Lista corta para probar a mano
En la web publicada (`main`) todavía no ha cambiado nada. Comprueba que todo sigue igual:
1. **Clínica** (ventana normal, https://afiguerass.github.io/cerco/): entra con tu cuenta y mira que se vean tus ofertas, tus candidatos y «Mi equipo».
2. **Profesional** (ventana de incógnito, https://afiguerass.github.io/cerco/candidato.html): entra con una cuenta de prueba y abre «Ofertas» y «Mis solicitudes».
3. **Opcional, para ver uno de los fallos encontrados:** en el móvil, como clínica, abre la ficha de un candidato y pulsa «Ver CV completo». Comprueba si puedes cerrar el visor.

### Falta (Fase 0)

### Siguiente paso
Asish prueba la rama `profesional` (instrucciones en el README, apartado «Probar la rama profesional») y decide si se pasa a la **Fase 1** (ordenar el código sin cambiar nada).

## Arreglos hechos después de la Fase 0 (pedidos por Asish)
Cada uno tiene su propio commit en la rama `profesional`:
- [x] El resultado plano del test dice exactamente «Perfil sin definir» (clínica y profesional). En la clínica, el distintivo gris es un «?», como en el lado del profesional.
- [x] Fuera «Responsable de contratación». El perfil público dice «QUIÉN RESPONDE A LOS CANDIDATOS». En «Mi cuenta», el rol «Responsable de RRHH» se muestra como «Responsable de personal»; el dato guardado no cambia.
- [x] Fuera «IA» de todos los textos visibles. Ahora dice «con Seimian», como ya hacía el lado del profesional.
- [x] La explicación del test ya no dice «usando cada número una sola vez»: dice que se puede repetir número.
- [x] Faltas: «con entre 3 y 5 años de experiencia», «Equipo de 1 persona», «1 candidato».
- [x] El contrato adjunto lleva un icono de trazo en lugar del emoji 📄.
- [x] En el móvil, el visor del CV queda por encima de la barra superior y del botón de Seimian: se ven el nombre, «Descargar» y la «×».
- [x] Pruebas más finas: las capturas admiten como mucho 10 píxeles distintos (una letra ya se nota). En cada pantalla capturada se comprueba que no salgan palabras prohibidas (IA, RRHH, responsable de contratación, TikTok, matching, Kanban, caja negra) ni emojis. Hay una prueba nueva del caso «Perfil sin definir» en el lado clínica.

## Fallos que siguen pendientes (no se han tocado; decide Asish)
- **Visor del CV en el ordenador:** si la clínica lo cierra con la tecla **Esc**, la ficha deja de actualizarse. Con la «×» funciona bien.
- **Una persona que solicita dos ofertas de la misma clínica:** en «Candidatos» de una oferta concreta la cabecera cuenta las solicitudes de todas las ofertas («2 candidatos han aplicado»).
- **Trabajador del equipo (enlace del test):** el botón «Guardar y continuar» se puede pulsar mientras el resultado aún se está enviando. Si la persona cierra la página en ese momento, el resultado puede perderse.
- **Más emojis** en el menú «Correo» de la ficha del candidato (lado clínica): ✉️ 📨 💻 📋.
- **«Perfil sin definir»:** el encargo dice «solo la frase y la opción de repasar». Hoy, además de la frase, sale un párrafo que explica por qué y cómo repasar. Se ha dejado; si sobra, se quita.
- **Seguimiento del profesional:** cuando le contratan, la entrevista aparece en pasado («Fue el jueves 12 de noviembre…») aunque la fecha todavía no haya llegado.
- **Reglas de seguridad: puntos mejorables** (para la Fase 3):
  - Cualquier cuenta puede crearse un documento en `clinicas/{su uid}` y así leer `talento`, que de todas formas es anónimo.
  - `tiempos_respuesta`, `condiciones` y `valoraciones` no comprueban bien quién escribe ni qué escribe.
  - La clínica puede devolver una solicitud a un estado anterior.
- **Doble clic:** la web ignora un segundo «Publicar oferta» en menos de 0,9 s y un segundo «Enviar solicitud» en menos de 2 s. No es un fallo: es una protección. Solo se apunta porque las pruebas tienen que esperar.

## Notas técnicas
- Desde el entorno de Claude Code no se puede descargar Firebase desde `www.gstatic.com`. En las pruebas se sirve una copia idéntica (misma versión 10.12.0, paquete oficial `firebase` de npm). La web publicada no cambia.
