# Progreso de CERCO profesional

Este archivo resume en qué punto está el trabajo. Se actualiza después de cada paso.
Se trabaja en la rama `profesional`; la web publicada (rama `main`) no se toca sin el visto bueno de Asish.

## Fase actual: Fase 1 — Ordenar el código sin cambiar nada

Para el usuario la web tiene que ser idéntica antes y después. Cada paso es un commit en la rama `profesional`, con todas las pruebas y capturas en verde. No se publica nada en `main` sin el visto bueno de Asish.

### Pasos de la Fase 1
- [x] **1.1 Vite.** El proyecto compila las dos páginas tal como están (`npm run build` → `dist/`). Las pruebas abren ahora la web compilada, y las 26 pasan con las capturas idénticas.
- [x] **1.2 Publicación automática** preparada en `.github/workflows/publicar.yml`:
  - En cada pull request hacia `main`, pasa todas las pruebas.
  - Al llegar un cambio a `main`, pasa las pruebas y, solo si están en verde, compila y publica en las mismas direcciones.
  - **Cuando Asish apruebe publicar la Fase 1**, tendrá que cambiar en GitHub: Settings → Pages → Source → «GitHub Actions» (hoy está en «Deploy from a branch»). Sin ese cambio, `main` seguiría publicándose como hasta ahora, y con el código de la Fase 1 sin compilar la web no funcionaría.
- [x] **1.3 Estilos** en `src/estilos/`, con capturas idénticas:
  - `clinica.css`: lo que estaba en la cabecera de `index.html`.
  - `clinica-final.css`: lo que estaba dentro del cuerpo; se sigue aplicando al final, en el mismo orden que antes.
  - `profesional.css`: los estilos de `candidato.html`.
  - Curiosidad apuntada, sin tocar: la primera regla de `clinica.css` empieza con un resto (`__SCREENS_CSS__:root{…}`) que hace que el navegador la ignore. Se deja igual para que nada cambie.
- [x] **1.4 Test DISC y % de encaje** en un único módulo, `src/comun/disc.js`, que usan los dos lados.
  - Antes había dos copias del cálculo del test y dos del encaje; el de la clínica estaba reescrito a mano.
  - Pruebas propias en `pruebas/unidad/`: con 2.000 tests y 2.000 ofertas el resultado es **exactamente** el mismo que con las funciones de antes, así que la puntuación de los tests ya hechos no cambia.
- [x] **1.5 Municipios** en un archivo de datos aparte.
  - Antes la lista (6.801 municipios, 200 KB) estaba **copiada dentro de las dos páginas**.
  - Ahora está en `public/datos/municipios.js` (solo datos), y la búsqueda y los km en `public/comun/geo.js`. Las dos páginas comparten los mismos archivos y el navegador los descarga una sola vez.
  - Pruebas nuevas (`pruebas/unidad/geo.test.mjs`): 400 direcciones, 150 búsquedas y 300 distancias dan exactamente lo mismo que antes.
  - **Pendiente dentro de la Fase 1:** que la lista se cargue *solo cuando haga falta*. Hoy se sigue cargando al abrir la página, porque el código la pide «al instante» desde muchos sitios. Se podrá hacer en los pasos 1.6 y 1.7, cuando ese código esté ordenado.
- [ ] **1.6 Código en carpetas:** clínica, profesional y común.
  - [x] **1.6a** Los 30 bloques de código que había dentro de las páginas están en archivos aparte, en el mismo orden: `public/clinica/` (16), `public/profesional/` (9) y `public/comun/` (los 2 que eran idénticos en las dos páginas, más los municipios). Las páginas pasan de 1,4 MB y 1,1 MB a 470 KB y 415 KB. Capturas idénticas.
  - [ ] **1.6b** Dividir los dos archivos grandes (`clinica/01-panel.js`, 281 KB, y `profesional/01-portal.js`, 206 KB), que mezclan Firebase, textos y pantallas. Se hará junto con el paso 1.7.
- [ ] **1.7 Deshacer las «capas»:** cada función con una sola versión final.
  - Hay unas 45 funciones redefinidas de 2 a 7 veces en archivos distintos; por ejemplo, `abrirFichaCandidato`, `renderPortalReal` y `renderInicioReal` tienen 7 versiones cada una.
  - [x] **Antes de tocarlas, red de seguridad más grande.** Dos pruebas nuevas recorren el resto de pantallas con los datos del recorrido, en ordenador y en móvil:
    - Clínica: Inicio, Mis ofertas, Candidatos, Agenda, Mi equipo, Estadísticas, Herramientas, Mi clínica, Perfil público, Mi cuenta y Seimian.
    - Profesional: Inicio, Ofertas, Solicitudes, Mi perfil, el centro de herramientas con sus 6 herramientas, y Seimian.
    - Son 46 capturas nuevas y se comprueba que no hay errores. En total, 30 pruebas de navegador.
- [ ] **1.8 Firebase** del SDK *compat* al modular, sin cambiar datos ni rutas.
- [ ] **1.9 Datos de `localStorage`** pasan a leerse de Firestore; `localStorage` queda solo para preferencias.
- [ ] **1.10 Comprobación final:** todas las pruebas de la Fase 0 en verde y las capturas iguales.

## Fase 0 — Preparar el terreno (terminada y publicada)

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
Fase 1, paso 1.7: deshacer las capas, empezando por las funciones con 2 versiones.

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

## Segunda tanda de arreglos (pedidos por Asish)
Cada uno tiene su propio commit en la rama `profesional`:
- [x] Cerrar el visor del CV con **Esc** ya no deja la ficha sin actualizar. El mismo fallo estaba también en el menú «Correo» y está arreglado en su propio commit.
- [x] Una persona que solicita dos ofertas ya no se cuenta dos veces:
  - Dentro de una oferta, la cabecera y los filtros cuentan solo esa oferta.
  - En la vista general y en «Candidatos totales» se cuentan personas.
- [x] «Guardar y continuar» del test del equipo espera a que el resultado llegue de verdad (mientras tanto dice «Enviando…»). Si no llega, la persona se queda con su código de reserva.
- [x] El menú «Correo» lleva iconos de trazo (sobre, bandeja, portátil, copiar) en lugar de emojis.
- [x] «Perfil sin definir» enseña solo la frase y la opción de repasar. Se mantienen los botones de salir («Ahora no» / «Atrás»).
- [x] El seguimiento del profesional dice «Será el…» si la entrevista aún no ha llegado y «Fue el…» si ya pasó.
- [x] El rol «Responsable de personal» se llama «Coordinador/a de clínica». El dato guardado sigue siendo el mismo.

## Pendiente para más adelante
- **Cosas vistas en las capturas nuevas (sin tocar; decide Asish):**
  - **Agenda** de la clínica: dice «Todavía no tienes entrevistas» aunque hubo una entrevista programada para el 12 de noviembre. Puede ser a propósito, porque después esa persona fue contratada.
  - **Seimian del profesional:** a Laura le dice «Eres concienzudo con rasgo influyente», en masculino.
- **Reglas de seguridad: puntos mejorables** (previsto en la Fase 3):
  - Cualquier cuenta puede crearse un documento en `clinicas/{su uid}` y así leer `talento`, que de todas formas es anónimo.
  - `tiempos_respuesta`, `condiciones` y `valoraciones` no comprueban bien quién escribe ni qué escribe.
  - La clínica puede devolver una solicitud a un estado anterior.
- **Doble clic:** la web ignora un segundo «Publicar oferta» en menos de 0,9 s y un segundo «Enviar solicitud» en menos de 2 s. No es un fallo: es una protección. Solo se apunta porque las pruebas tienen que esperar.

## Notas técnicas
- Desde el entorno de Claude Code no se puede descargar Firebase desde `www.gstatic.com`. En las pruebas se sirve una copia idéntica (misma versión 10.12.0, paquete oficial `firebase` de npm). La web publicada no cambia.
