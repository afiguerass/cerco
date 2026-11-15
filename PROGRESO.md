# Progreso de CERCO profesional

Este archivo resume en qué punto está el trabajo. Se actualiza después de cada paso.
Se trabaja en la rama `profesional`; la web publicada (rama `main`) no se toca sin el visto bueno de Asish.

## Fase 1 — Ordenar el código sin cambiar nada (TERMINADA Y PUBLICADA el 15 de noviembre de 2026)

Publicada en `main` con el commit 39577f1. Desde ahora, cada cambio que llega a `main` pasa todas las pruebas solo y, si están en verde, se publica solo en afiguerass.github.io/cerco. Asish cambió en GitHub: Settings → Pages → Source → «GitHub Actions».

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
  - [x] **La lista ya no frena el arranque de la página.** Se descarga aparte, en segundo plano (`CGeo.listo` avisa cuando llega). Todo lo que muestra km (después de entrar en la cuenta) espera a que esté; el buscador de ciudad de la clínica añade los municipios en cuanto llegan; y si una clínica ya tenía la sesión abierta, Inicio se vuelve a pintar al llegar la lista. Si la lista no llegara (sin conexión), la web sigue funcionando, sin km.
    - Por qué no «solo al abrir un buscador»: casi todas las pantallas después de entrar enseñan km, así que la lista se necesita casi siempre; cargarla más tarde haría que los km aparecieran con retraso, y eso cambiaría lo que se ve.
    - Prueba nueva (`52-municipios-aparte`): con la lista retrasada 2 segundos, las páginas arrancan sin ella y los km salen bien; sin lista, la web funciona sin errores.
- [x] **1.6 Código en carpetas:** clínica, profesional y común.
  - [x] **1.6a** Los 30 bloques de código que había dentro de las páginas están en archivos aparte, en el mismo orden: `public/clinica/` (16), `public/profesional/` (9) y `public/comun/` (los 2 que eran idénticos en las dos páginas, más los municipios). Las páginas pasan de 1,4 MB y 1,1 MB a 470 KB y 415 KB. Capturas idénticas.
  - [x] **1.6b** Dividir los dos archivos grandes, que mezclan Firebase, textos y pantallas.
    - [x] `clinica/01-panel.js` (281 KB) → 9 archivos por pantallas, en el mismo orden: `01a-alta-y-test-disc`, `01b-candidatos-y-seimian`, `01c-entrevista-ofertas-y-guia`, `01d-nueva-oferta-herramientas-y-cuenta`, `01e-cuentas-y-sesion`, `01f-entrevista-calendario-y-ubicaciones`, `01g-datos-de-la-clinica`, `01h-nube`, `01i-navegacion`. Comprobado que el código es exactamente el mismo y que ningún trozo usa, al cargar, algo de un trozo posterior. Capturas idénticas.
    - [x] `profesional/01-portal.js` (206 KB) → 6 archivos, en el mismo orden: `01a-base-y-nube`, `01b-estado-navegacion-y-acceso`, `01c-datos-alta-test-y-descubrir`, `01d-pantallas-y-guia`, `01e-presentacion-foto-video-cv`, `01f-seimian-cita-y-mensajes`. Mismas comprobaciones. Capturas idénticas.
- [x] **1.7 Deshacer las «capas»:** cada función con una sola versión final.
  - Hay unas 45 funciones redefinidas de 2 a 7 veces en archivos distintos; por ejemplo, `abrirFichaCandidato`, `renderPortalReal` y `renderInicioReal` tienen 7 versiones cada una.
  - [x] **Antes de tocarlas, red de seguridad más grande.** Dos pruebas nuevas recorren el resto de pantallas con los datos del recorrido, en ordenador y en móvil:
    - Clínica: Inicio, Mis ofertas, Candidatos, Agenda, Mi equipo, Estadísticas, Herramientas, Mi clínica, Perfil público, Mi cuenta y Seimian.
    - Profesional: Inicio, Ofertas, Solicitudes, Mi perfil, el centro de herramientas con sus 6 herramientas, y Seimian.
    - Son 46 capturas nuevas y se comprueba que no hay errores. En total, 30 pruebas de navegador.
  - [x] **Duplicados en el mismo archivo** (`clinica/01-panel.js`):
    - `toggleOfferStatus`: tenía dos versiones y solo funcionaba la segunda. Se quita la primera.
    - `copyLink_onboarding`: ninguna de sus dos versiones se usaba. Se quitan las dos.
    - `_esc`: funcionaba la **primera**, porque la segunda estaba fuera del bloque y nunca llegaba a usarse (comprobado en el navegador). Se deja la que funcionaba.
  - [x] **Versiones sustituidas del todo**: una versión posterior las reemplazaba sin usarlas, así que eran código que nunca se ejecutaba. Se han quitado:
    - Clínica: `_subirOferta`, `_dreceresSeimian`.
    - Profesional: `pintarInicio` (la original y dos capas), `fechaCorta`, `esIOS`.
    - En total, unos 10.400 caracteres.
  - [x] **`submitNewOffer` («Publicar oferta»)**: tenía 5 versiones envueltas unas en otras, en 5 archivos. Ahora hay una sola, en `clinica/01-panel.js`, con los pasos en el mismo orden: palabras prohibidas → contrato y convenio → municipio → salario → publicar → limpiar el formulario.
    - Prueba nueva (`40-validaciones-oferta`): cada comprobación con su mensaje exacto. Pasa igual con el código anterior y con el nuevo, captura incluida.
  - [x] **Acciones de «Mis ofertas»**, una sola versión cada una (antes, dos):
    - `pintarOfertasReales`: pinta las ofertas y las agrupa por profesión.
    - `cambiarEstadoOferta` y `eliminarOferta`: con gente esperando respuesta, antes sale la ventana de cierre.
    - `editarOferta`: carga la oferta y rellena el salario.
    - Prueba nueva (`41-acciones-oferta`): editar, pausar, reactivar, cerrar y eliminar. Pasa igual con el código anterior y con el nuevo.
  - [x] **Seis funciones más de la clínica**, una sola versión cada una (antes, dos):
    - `_pintarPerfilPublico`, `cerrarSesion`, `pickLocation`, `renderStatsReal`, `_cabeceraPortal`, `alternarRecomendados`.
    - Prueba nueva en el recorrido (paso 9): «Recomendados para mi equipo», elegir la dirección de la clínica, cerrar sesión y volver a entrar en los dos lados (los datos vuelven de la nube). Pasa igual con el código anterior y con el nuevo.
  - [x] **Seimian, vídeo, citas, página pública y plan de acogida**, una sola versión cada una:
    - `abrirSeimian` y `respuestaSeimian`: la antigua queda solo como respaldo, con su propio nombre (`_respuestaSeimianAntigua`).
    - `verVideoCandidato`, `_publicarClinica`, `programarCita`, `_citaSet`.
    - `CERCO_plan`: la versión solo local se llama ahora `CERCO_planLocal`.
    - Prueba nueva: el vídeo de la ficha se abre en grande y se cierra. Pasa igual con el código anterior y con el nuevo.
  - [x] **Cuatro funciones de 3 capas de la clínica**, una sola versión cada una: `_subirClinica`, `_escucharEquipoEnDirecto`, `applyFilters_portal` y `responderCandidato`.
    - Prueba nueva (`42-descartar-con-motivo`): una clínica descarta con motivo y el profesional lo ve en su solicitud. Pasa igual con el código anterior y con el nuevo.
    - **Lección aprendida (y ya vigilada):** `clinica/01-panel.js` está envuelto en un bloque que, si algo falla mientras se carga, se calla y deja sin crear las funciones que vienen detrás. Una versión única llamaba durante la carga a una pieza de un archivo que aún no existía. La prueba nueva lo detectó.
      - Arreglo: cada versión única comprueba que la pieza ya existe; si no, hace lo mismo que la original en ese momento.
      - Prueba nueva (`01-todo-cargado`): al abrir cada página comprueba que **todas** las funciones de sus archivos existen.
  - [x] **`showScreen`** (cambiar de pantalla): de 5 versiones a una sola. Pasos en orden: quitar la ficha provisional → llevar las entrevistas de ejemplo a la Agenda → mostrar la pantalla → ajustes de interfaz → pintar la Agenda → preparar «Nueva oferta».
  - [x] **`renderInicioReal`** (Inicio de la clínica): de 7 versiones a una sola. Se pinta la base y después cada bloque en el mismo orden (necesitan respuesta → citas y mensajes → plazos → seguimiento y valoraciones → confianza y plazos → agenda). Cada bloque es una pieza con nombre en su archivo.
  - [x] **`renderPortalReal`** («Candidatos»): de 7 versiones a una sola. Se pinta la base y después cada parte en el mismo orden: cabecera y solicitudes reales → tasa de respuesta → etiquetas → talento → agrupar por profesión → entrada a herramientas.
  - [x] **`abrirFichaCandidato`** (ficha del candidato): de 7 versiones a una sola. Pasos en orden: vaciar la ficha anterior → abrir → acciones según el estado → guardar → valorar y plan → «me interesa» y cita → correo y contrato → ficha a pantalla completa.
  - [x] **Otras formas de envolver en la clínica**, ahora una sola versión cada una:
    - `CDB.candidatosRecibidos`, `CDB.resumen` y `CDB.renderTodo`.
    - `Nube.borrarOferta`.
    - `enviarMensajeClinica`: bloquea las preguntas prohibidas.
    - `cerrarFichaCandidato`.
    - Prueba ampliada: una pregunta prohibida («¿Tienes hijos?») no se envía; un mensaje normal sí, y le llega al profesional. Pasa igual con el código anterior y con el nuevo.
  - **Lado clínica terminado: ninguna función con varias versiones.**
  - [x] **Profesional, primer grupo** (una sola versión cada una): `refrescar` (antes 4 versiones), `ir`, `pintarDetalle`, `pintarSolicitud` (antes 3) y `pintarAjustes`.
  - [x] **Profesional, segundo grupo** (una sola versión cada una): `testEmpezar` (consentimiento antes del test), `ofertasVisibles` (sin las clínicas bloqueadas), `extrasSolicitud`, `bloqueInicioExtra`. Prueba ampliada: sin marcar la casilla de consentimiento no se puede empezar el test (igual con el código anterior y con el nuevo).
  - **Falta en el profesional:** `Nube.guardarPerfil` (3 capas), `verMiVideo` (3), `pintarMedia` y las del editor de vídeo (`abrirEditorVideo`, `evTab`, `evGuardar`, `usarVideo`).
- [ ] **1.8 Firebase** (1.8a hecho; 1.8b pasa a la Fase 2) del SDK *compat* al modular, sin cambiar datos ni rutas.
  - [x] **1.8a** Firebase (10.12.0, igual que antes) va dentro de la web compilada (`src/comun/firebase.js`), en su propio archivo (`firebase-….js`), en lugar de descargarse de www.gstatic.com al abrir la página.
    - La versión de pruebas se conecta sola al Firebase falso. Comprobado que la versión publicable no tiene ningún rastro de él.
    - Las pruebas ya no cambian archivos al vuelo: si la web volviera a pedir Firebase a Google, la petición estaría bloqueada y fallarían.
  - [ ] **1.8b** Pasar las llamadas a la forma modular, archivo por archivo, y quitar *compat* al final. **Se pasa al principio de la Fase 2** (decisión de Asish), con copia de seguridad antes.
- [ ] **1.9 Datos de `localStorage`** pasan a leerse de Firestore; `localStorage` queda solo para preferencias. **Se pasa al principio de la Fase 2** (decisión de Asish), con copia de seguridad antes.
- [x] **1.10 Comprobación final** con `npm test` desde cero: 11 pruebas de cálculo (DISC y municipios), 33 de reglas de la base de datos y 51 de navegador, todas en verde, con las capturas idénticas. La web real compilada (`npm run build`) no lleva nada de las pruebas (ni emulador ni proyecto de pruebas).

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

## Fase 0 — notas de cuando terminó

### Lista corta para probar a mano
En la web publicada (`main`) todavía no ha cambiado nada. Comprueba que todo sigue igual:
1. **Clínica** (ventana normal, https://afiguerass.github.io/cerco/): entra con tu cuenta y mira que se vean tus ofertas, tus candidatos y «Mi equipo».
2. **Profesional** (ventana de incógnito, https://afiguerass.github.io/cerco/candidato.html): entra con una cuenta de prueba y abre «Ofertas» y «Mis solicitudes».
3. **Opcional, para ver uno de los fallos encontrados:** en el móvil, como clínica, abre la ficha de un candidato y pulsa «Ver CV completo». Comprueba si puedes cerrar el visor.

### Falta (Fase 0)

### Siguiente paso
**Fase 1 terminada — esperando que Asish la pruebe y dé el visto bueno.** No se ha publicado nada en `main`.
- Vista previa en línea (rama `vista-previa`, web compilada del commit 3f5397b, con todos los arreglos): clínica https://raw.githack.com/afiguerass/cerco/vista-previa/index.html y profesional https://raw.githack.com/afiguerass/cerco/vista-previa/candidato.html. Usa la base de datos real. Para entrar con Google hace falta autorizar `raw.githack.com` en Firebase.
- Para publicarla: pull request de `profesional` a `main` y, antes de fusionar, cambiar en GitHub Settings → Pages → Source → «GitHub Actions» (ver 1.2).
- Después empieza la **Fase 2** con 1.8b y 1.9, haciendo antes una copia de seguridad de los datos reales.

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

## Arreglos pedidos por Asish durante la Fase 1 (hechos)
Cada uno con su commit y con una prueba que fallaba con el código anterior:
- [x] **La Agenda** enseña también la entrevista de quien ya está contratado (la del 12 de noviembre), con la etiqueta «Contratada». También en el bloque de Inicio.
- [x] **Seimian no da por hecho el género.** El perfil no guarda el género y deducirlo del nombre falla, así que se describe el perfil: «Tu perfil es concienzudo con rasgo influyente». En el saludo de Seimian y en dos tarjetas de Herramientas.
- [x] **iPad en modo escritorio:** ahora se reconoce como iPad (lado profesional).
- [x] **Protección de textos de la clínica (`_esc`):** trata bien las comillas dobles y simples, y un valor vacío deja de escribirse como «null».

## Revisión pedida por Asish el 13 de noviembre — esperando su visto bueno (no se ha tocado nada)

### 1. Candidatos: cada persona solo en la pestaña de su fase
**Qué pasa ahora.** «Candidatos» se abre en la pestaña «Todos», donde salen todas las personas mezcladas. Al invitar a alguien a entrevista, sí pasa a «Entrevistas» (el dato se guarda bien), pero como la pantalla se abre en «Todos», sigue saliendo junto a los demás. Si una persona tiene dos solicitudes (por ejemplo, una contratada y otra retirada), en «Todos» sale dos veces.

**Propuesta:**
- Quitar la pestaña «Todos». Quedan: Por contestar · Me interesan · Entrevistas · Contratados · Cerrados, cada una con su número.
- «Candidatos» se abre siempre en «Por contestar», aunque esté vacía (sale el aviso que ya existe: «Ahora no hay nadie aquí»). Si eliges otra pestaña, se queda elegida mientras no cierres la web.
- La búsqueda, la distancia, los filtros por profesión y «Guardados» siguen funcionando dentro de cada pestaña.
- Los accesos de Inicio (por ejemplo, «Ver «Me interesan»») siguen llevando a su pestaña.

**Agenda.** Cada entrevista ya tiene un botón «Abrir ficha» que funciona (probado en ordenador y en móvil). Propuesta: que la ficha se abra también al pulsar en cualquier parte de la entrevista (nombre, hora, oferta). Los demás botones (Entrar en la sala, Cambiar día u hora, Google Calendar, Apple u Outlook) siguen haciendo lo mismo.

### 2. Botón «Buscar» junto a la ciudad (lado clínica)
Hay tres campos de municipio: «Dirección de tu clínica» (en Candidatos), «Ubicación» (en Nueva oferta) y «Ciudad» (en Mi clínica). Ninguno tiene botón.

**Qué pasa ahora:**
- **Fallo:** en Candidatos, si escribes «Biure» y pulsas Enter, los km de los candidatos no se recalculan. Siguen «a 3 km» (desde Girona) hasta que cambias de pantalla; desde Biure son 41 km.
- En Nueva oferta y en Mi clínica, Enter acepta el texto tal como está escrito: si escribes «biure» en minúsculas, se queda así.

**Propuesta:**
- Un botón «Buscar», igual que el del lado profesional (azul, con lupa), a la derecha de los tres campos.
- «Buscar» y Enter hacen lo mismo:
  - si el municipio existe, lo escriben bien («Biure») y, en Candidatos, recalculan los km al momento;
  - si no existe, avisan debajo con el mismo texto que el lado profesional: «No encontramos «…». Escribe el nombre del pueblo o la ciudad y elígelo de la lista.»
- Con una prueba nueva.

### 3. Todos los botones, uno por uno
**Cómo se ha hecho.** Un programa ha pulsado, uno a uno, todo lo que se puede pulsar en cada pantalla y en cada ventana que se abre. Ha recorrido los dos lados, en ordenador y en móvil, y la clínica también con «Datos de ejemplo». Usa los datos del recorrido completo: clínica, dos ofertas, candidata con entrevista, contratada y otra solicitud retirada.
- En total, unas 1.700 pulsaciones.
- Después de cada una mira si cambia la pantalla, si se guarda algo, si se descarga o se abre algo, o si sale un error.
- Lo que salía como «no hace nada» se ha vuelto a probar a mano.

**Resultado: usados con normalidad, no ha aparecido ningún botón que no haga nada.** Sí han salido estas cosas:

a) **Botones que, con el campo vacío, no hacen nada y no avisan:**
- «Enviar» de los mensajes, en la ficha del candidato (clínica) y en la solicitud (profesional);
- la flecha de Seimian (clínica) y «Enviar» de Seimian (profesional);
- «Revisar con Seimian», en «Ensaya tu entrevista».

Con texto, todos funcionan. Propuesta: si el campo está vacío, que salga un aviso corto («Escribe algo antes de enviar») y que el cursor se ponga en el campo.

b) **«Dirección de tu clínica» + Enter no recalcula los km.** Es el fallo del punto 2.

c) **Error en el editor de vídeo (profesional).** Si el editor se cierra mientras prepara las miniaturas de la tira, da un error de programa. No se ve en pantalla, pero queda registrado. Propuesta: comprobar que el editor sigue abierto antes de añadir cada miniatura, con una prueba nueva.

d) **Herramienta que no se ofrece.** En el código hay una 7.ª herramienta del profesional, «Dónde encajas», que nunca aparece en el menú, y si se abriera daría error. No la ve nadie. Propuesta: dejarla para cuando se revisen las herramientas.

**Qué no se ha pulsado, y por qué:**
- «Eliminar mi cuenta»: a propósito.
- Entrar con Google: necesita Google de verdad.
- Los enlaces de correo, teléfono y web: se ha comprobado que llevan a la dirección correcta.
- Los botones de las solicitudes «Por contestar» y «Me interesan» (Me interesa, Invitar a entrevista, Descartar con motivo) no estaban en estos datos, pero ya los pulsan las pruebas automáticas del recorrido.

**Si Asish ha visto un botón concreto que no hace nada**, hace falta saber la pantalla y el nombre del botón. Puede depender de sus datos reales (por ejemplo, una oferta pausada) o de la vista previa: «Continuar con Google» no funciona hasta autorizar raw.githack.com en Firebase.

### Hecho después de la revisión (con el visto bueno de Asish)
Cada cosa con su commit y con una prueba que fallaba con el código anterior:
- [x] **Candidatos** se abre en «Por contestar». Las pestañas son: Por contestar · Me interesan · Entrevistas · Contratados · Cerrados · Todos.
  - En «Todos», cada persona sale una sola vez, con su solicitud más avanzada.
  - Al volver de una ficha, sigue en la pestaña donde estaba. «Ver guardados» los enseña en «Todos».
- [x] **Agenda:** pulsando en cualquier parte de una entrevista se abre la ficha. Los botones de la entrevista siguen haciendo lo suyo.
- [x] **Botón «Buscar»** en «Dirección de tu clínica», «Ubicación» (Nueva oferta) y «Ciudad» (Mi clínica). Enter hace lo mismo que el botón.
  - Arreglado de paso: al cambiar la dirección de la clínica, los km de los candidatos se recalculan al momento. Antes se quedaban con la dirección anterior, también al elegirla de la lista.
- [x] **Aviso «Escribe algo antes de enviar»** en Enviar (mensajes), la flecha y el Enviar de Seimian, y «Revisar con Seimian» (este dice «Escribe tu respuesta antes de revisarla.»).
- [x] **Editor de vídeo:** ya no da error si se cierra mientras prepara las miniaturas.
- «Dónde encajas»: se deja para más adelante, como pidió Asish.

## Revisión de acciones y pantallas (13 de noviembre) — hecha
Se comprobó, acción por acción, qué cambia en cada pantalla de los dos lados. Lo que fallaba ya está arreglado, cada cosa con su commit y con una prueba que fallaba antes:
- [x] **El test DISC de la clínica, también en la nube.** Antes solo estaba en el navegador: desde otro ordenador o la vista previa, «Mi equipo» salía sin la responsable y Estadísticas escondía sus cifras. Esto explica que no apareciera la contratación de asish figueras.
  - Al terminar el test se guarda en la ficha de la clínica (`discResponsable`). Solo se **añade** ese dato: no se borra ni se cambia nada más.
  - Las clínicas que ya tenían el test solo en el navegador lo **suben solas** la próxima vez que entran desde ese navegador, con los mismos resultados. Si la subida falla, se reintenta la vez siguiente.
  - Desde otro navegador, el test se trae de la nube.
  - El test queda marcado con su cuenta: si en el mismo navegador entra otra clínica, no se le sube ni se le enseña, y se guarda una copia en el navegador.
  - **Copia de seguridad:** desde aquí no hay acceso a la base de datos real. Como el cambio solo añade un dato y no toca nada de lo que ya hay, no hace falta borrar ni migrar nada.
- [x] **Estadísticas enseña siempre las contrataciones**, dentro de «Tu contratación», aunque el equipo aún no tenga tests.
- [x] **«Me interesa» cuenta como contestada**, y quien la tiene ya no sale en «esperan tu respuesta».
- [x] **Textos de Estadísticas:** «contrataciónes» → «contrataciones», y singulares con 1 («1 solicitud», «1 oferta publicada», «1 activa», «1 candidato recibido»).
- [x] **Mis ofertas:** el número de candidatos de cada oferta se cuenta en el momento con las solicitudes reales. Antes salía «0 candidatos» al entrar desde otro ordenador.
- [x] **Quien se contrata pasa a «Mi equipo»** con su perfil DISC, el puesto y la etiqueta «Contratación en CERCO», y cuenta en las estadísticas del equipo.
  - Una sola vez: si la clínica la quita, no vuelve. Si ya está en el equipo con el mismo nombre (por ejemplo, hizo el test con el enlace), no se repite.
  - Las contrataciones de antes, como la de asish figueras, pasan solas al entrar.
- [x] **Inicio avisa de los contratos enviados sin confirmar** («Contratos sin confirmar»), con acceso a la ficha. El aviso se quita cuando la persona confirma.

**Arreglado después, con el visto bueno de Asish** (cada uno con su commit y su prueba):
- [x] **Una clínica que ya existe en la nube entra directa a Inicio** desde cualquier navegador, con correo o con Google, sin las pantallas de bienvenida. Una cuenta que aún no ha configurado su clínica sigue viendo la bienvenida.
- [x] **La ficha abierta se pone al día sola** cuando el candidato hace algo: escribe, confirma la cita o pide otro día, confirma el contrato, retira… Se conserva lo que se estaba escribiendo. Si la clínica está a medias de algo, espera a que acabe.

- [x] **Ninguna cuenta ve ni hereda datos de otra en el mismo navegador** (lado clínica).
  - Los datos del navegador quedan marcados con su cuenta. Si se registra o entra otra, antes se guarda una copia de lo de la anterior y se empieza vacío.
  - Si la anterior vuelve a entrar en ese navegador, recupera su copia, y encima lo de la nube.
  - Lo del lado del profesional ya iba separado por cuenta.

## Pruebas de Asish con la vista previa (14 de noviembre)
Hecho (cada uno con su commit y una prueba que fallaba antes):
- [x] **1. Google:** una clínica que ya existe entra directa a Inicio, sin la bienvenida, por cualquier camino: los botones, abrir la página con la sesión iniciada o volver de Google.
- [x] **2. Lado del profesional:**
  - una cuenta de clínica ve siempre el aviso «Esta cuenta es de una clínica», aunque no la haya configurado;
  - fuera las ofertas de ejemplo;
  - la portada ya no nombra una clínica inventada.
- [x] **3. Clínica sin «Datos de ejemplo»:**
  - nunca salen candidatos inventados ni sus cuentas («Todos (12)»);
  - un aviso explica cuándo aparece un profesional.
- [x] **6. Opciones que se pueden quitar** volviendo a tocarlas: «Te ayudo a presentarte» de Seimian y las preguntas de una sola opción del perfil.

- [x] **1 bis. Clínicas antiguas (16 nov):** la clínica real de Asish, creada con una versión antigua, seguía viendo la bienvenida.
  - Ahora una clínica se reconoce por cualquier dato suyo en la nube (ficha, página pública, ofertas, equipo o solicitudes), y su nombre se recupera de donde esté.
  - Arreglado de paso: al entrar desde un navegador nuevo, la página pública se sobrescribía vacía; y un nombre vacío podía pisar el guardado.
  - Si aun así fallara: mirar en la consola de Firebase (Firestore → `clinicas` → el documento de la cuenta) qué campos tiene.

Hecho después, con el visto bueno de Asish:
- [x] **4. Test DISC:**
  - el mismo diseño en los dos lados (el de la clínica) y el texto «Puedes repetir nota»;
  - ninguna frase se sale del recuadro, ni con la pantalla ampliada.
- [x] **5. Sueldos de referencia** en todas las profesiones con cifras, como «Referencia orientativa del sector».
  - En odontología, con la nota «Muchos cobran un porcentaje de lo que facturan.».
  - Las cifras están en un solo archivo, `public/comun/sueldos.js`, para revisarlas con el socio.
  - Asesor/a de pacientes, gerente y prostodoncista: sin sugerencia por ahora.
  - Fuentes de cada cifra: EmpleoDental (higienista, auxiliar, coordinador), Indeed y Glassdoor (recepcionista, protésico), Metrodora FP (protésico), Laboria y Nubidoc (ortodoncista, odontopediatra), blogs de clínicas (especialidades de odontología) y convenios provinciales (Alicante, Valencia).
- [x] **7. Ofertas del profesional:**
  - fichas «De tu profesión» y «Todas las profesiones»;
  - la frase de arriba con los dos filtros y el total;
  - debajo de la lista, lo que queda fuera y cómo verlo;
  - lo que has estudiado también cuenta como «tu profesión».

Para el final de la prueba piloto:
- **8.** Al registrarse: contraseña segura y correo de verificación.

## «Buscar talento» — TERMINADA, PUBLICADA Y COMPROBADA (15-16 de noviembre de 2026)
**Comprobado por Asish en la web publicada, de principio a fin:** buscar, filtros, abrir la
ficha, ver el vídeo con su portada, invitar, que el profesional solicite y que entonces la
clínica vea su nombre completo, su contacto y su CV. Las reglas están publicadas en Firebase.

### Detalle de la tarea
Publicada en `main` a las 15:05 (la web) y reglas de Firebase publicadas por Asish justo después.
Los cinco pasos están hechos; el detalle de cada uno, más abajo.
Propuesta aprobada el 15 de noviembre.

Objetivo: una clínica puede buscar profesionales aunque nadie haya solicitado sus ofertas (como en InfoJobs o LinkedIn). Hoy «Talento que encaja» es demasiado restrictivo (solo misma profesión, misma zona y con la opción activada).

**Tres ajustes de Asish (15 de noviembre, al dar el «adelante»):**
6. En «Anónimo», avisar claro antes de elegir: «Tu vídeo se ve: si sales en él, la clínica verá tu cara».
7. En «Buscar talento», cargar de 20 en 20 (con «Ver más» o al bajar), no todos de golpe: va más rápido y gasta menos lecturas de Firebase.
8. En «Visible», en la lista y en la ficha solo nombre e inicial del apellido («Laura M.»). El nombre completo, el contacto y el CV, solo cuando acepte la invitación.
9. La foto de la lista es una copia pequeña (`fotoMini`); la grande se ve al abrir la ficha o el vídeo.

**Decisiones de Asish:**
1. Pueden buscar todas las clínicas registradas y configuradas (durante la prueba piloto).
2. Se mantiene el límite de 10 invitaciones por semana.
3. «Visible» incluye nombre, **foto**, vídeo y perfil.
4. El **CV** solo se ve cuando el profesional acepta la invitación.
5. Los profesionales que ya existen se quedan como estaban hasta que elijan: anónimos si habían activado «que las clínicas me inviten»; si no, «Solo cuando yo solicite».

**Qué se hace:**
- **Profesional:**
  - En el alta, pregunta obligatoria «¿Cómo quieres que te vean las clínicas?» con tres opciones **sin ninguna marcada** (elección activa, RGPD):
    - «Visible»: nombre, foto, vídeo y perfil, sin teléfono, correo ni CV;
    - «Anónimo»: vídeo y perfil, sin nombre, foto ni contacto;
    - «Solo cuando yo solicite».
  - Debajo de cada opción, un ejemplo de lo que vería la clínica. Se guardan la opción y la fecha.
  - En «Mi perfil», apartado «Cómo te ven las clínicas», para cambiarlo cuando quiera (se aplica al momento).
  - A los que ya existen se les pregunta una vez, al entrar.
- **Clínica:**
  - Pantalla nueva «Buscar talento», en el menú debajo de «Candidatos». Enseña a todos los profesionales visibles o anónimos de España:
    - ordenados por encaje (con la oferta elegida o con el perfil que le falta al equipo) y luego por distancia;
    - con filtros de profesión, km desde la clínica (10, 25, 50, 100, provincia o toda España) y perfil DISC.
  - Las tarjetas «Visible» llevan nombre y foto; las «Anónimo», solo profesión, experiencia y km.
  - «Verlos en vídeo»: los vídeos a pantalla completa, uno detrás de otro, con «Invitar» en cada uno.
  - En «Candidatos», «Talento que encaja» pasa a ser un acceso a «Buscar talento».
- **Invitar:** se elige la oferta y se escribe un mensaje opcional. Si el profesional acepta, se crea la solicitud y aparece en «Candidatos» («Por contestar») con nombre, contacto y CV.

**Reglas de seguridad (`firestore.rules`): sí cambian.** Asish tendrá que publicarlas en la consola de Firebase cuando se publique esto.
- `talento`:
  - guarda el modo («visible» o «anonimo»);
  - nombre y foto solo si es «visible»;
  - nunca teléfono, correo ni CV.
- `candidatos/{uid}/media`: una clínica puede leer el **vídeo** (no el CV) de quien esté en «Visible» o «Anónimo».
- `invitaciones`: sin cambios.
- Pruebas de reglas nuevas para cada caso:
  - un anónimo sin nombre;
  - nada de vídeo de «Solo cuando yo solicite»;
  - nada de CV sin aceptar;
  - una cuenta que no es de clínica no lee la lista.
- Aviso: para las reglas, «ser clínica» es tener ficha de clínica, y cualquiera que se registre como clínica la tiene (ya apuntado para la Fase 3). Quien se registre como clínica verá nombres y vídeos de los «Visible». Lo protegen la opción «Anónimo», el contacto y el CV solo tras aceptar, el botón de denunciar y el límite de invitaciones.

**Pasos** (cada uno con su commit y su prueba; solo las pruebas afectadas mientras se trabaja y la batería completa una vez al final):
1. ~~Reglas de seguridad y sus pruebas.~~ **HECHO** (15 de noviembre). `firestore.rules`:
   - `talento` tiene lista cerrada de campos: ahí nunca caben el teléfono, el correo ni el CV.
     `modo` solo puede ser `visible` o `anonimo`. En `anonimo` no se puede guardar nombre,
     inicial ni foto. En `visible`, `nombre` es una sola palabra (nombre de pila) e `inicial`
     una sola letra: el apellido entero no cabe en las reglas.
   - El **vídeo** (`candidatos/{uid}/media/video_N`) lo puede leer una clínica si la persona
     está en `visible` o `anonimo`. El **CV** (`cv_N`) no, nunca: solo tras aceptar la invitación.
   - Los perfiles de antes (sin `modo`) se quedan como estaban: su vídeo no se ve hasta que elijan.
   - 14 pruebas nuevas en `pruebas/reglas/reglas.test.js` (47 en total, en verde).
   - **Asish tendrá que publicar estas reglas en la consola de Firebase** antes de que esto
     funcione en la web publicada. Se le darán los pasos al final de la tarea.
2. ~~Elección del profesional (alta, Mi perfil y la pregunta a los que ya existen).~~ **HECHO** (15 de noviembre).
   - Pantalla nueva `v-modo` («¿Cómo quieres que te vean las clínicas?»), con las tres
     opciones sin ninguna marcada, el ejemplo de lo que vería la clínica debajo de cada
     una y el aviso en «Anónimo»: «Tu vídeo se ve: si sales en él, la clínica verá tu cara».
     Sale sola al acabar el test y el botón no deja seguir hasta elegir.
   - En «Mi perfil», tarjeta «Cómo te ven las clínicas», justo encima de «Ocultarme a
     alguna clínica». Se cambia tocando una opción y se aplica al momento.
   - A quien ya tenía cuenta se le ofrece elegir en el Inicio, **antes** que el efecto
     rebote. Mientras no elija, su perfil se queda exactamente como estaba (su vídeo
     no se ve: en las reglas, un perfil sin `modo` no cuenta).
   - En «Visible» se publican el nombre de pila y la inicial del apellido («Laura P.»)
     y una copia pequeña de la foto (96 px); nunca el apellido entero, el teléfono,
     el correo ni el CV.
   - Código nuevo: `public/profesional/10-como-te-ven.js`. Pruebas nuevas:
     `pruebas/e2e/69-como-te-ven.spec.js` (2) y una captura nueva en el recorrido.
   - De paso: las fechas relativas («Ahora mismo», «Hace 3 min») hacían que una misma
     pantalla saliera distinta de un día a otro, porque el recuadro que las tapa medía
     lo que midiera el texto. Ahora tienen ancho fijo en las capturas (`pruebas/apoyo/captura.css`).
3. ~~«Buscar talento» en la clínica (lista, filtros y orden).~~ **HECHO** (15 de noviembre).
   - Pantalla propia (`screen-buscar`), en el menú justo debajo de «Candidatos»
     (se recoloca sola, porque la Agenda también se añade ahí).
   - Se trae **de 20 en 20**: con «Ver más» y también sola al llegar al final de la lista.
     Nunca se descargan todos los perfiles de golpe (antes se pedían 400 de una vez).
   - Filtros: profesión (se la pide a la base de datos, así que no hay que cargarlo todo
     para filtrar), distancia (10, 25, 50, 100 km, mi provincia o toda España) y forma de
     trabajar. Si hay más de una oferta activa, se elige con cuál se mide el encaje.
   - Orden: primero el encaje (con un extra para el perfil que le falta al equipo) y,
     a igual encaje, quien esté más cerca.
   - Las fichas «Visible» llevan nombre de pila, inicial y foto pequeña; las «Anónimo»,
     solo profesión, experiencia, forma de trabajar y km. Los perfiles de antes (sin
     elección hecha) salen como anónimos.
   - En «Candidatos», «Talento que encaja» pasa a ser un acceso a esta pantalla.
   - Código nuevo: `public/clinica/17-buscar-talento.js`. Prueba nueva:
     `pruebas/e2e/70-buscar-talento.spec.js`, con 24 perfiles sembrados.
   - **Nota:** la consulta no necesita ningún índice nuevo en Firebase.
4. ~~Vista en vídeo, uno detrás de otro.~~ **HECHO** (15 de noviembre).
   - Botón «Verlos en vídeo» encima de la lista, que cuenta solo a quien tiene vídeo.
   - Visor a pantalla completa: un vídeo cada vez, con el nombre (o «Anónimo»), la
     forma de trabajar y los km; «Invitar» sin salir, «Siguiente»/«Anterior»,
     flechas del teclado y Escape para cerrar. El siguiente se va adelantando solo.
   - Para poder montar el vídeo, `talento` publica ahora `videoMeta` (en cuántos
     trozos está y de qué tipo es). **No lleva ningún dato de la persona** y las
     reglas lo comprueban: solo puede tener `n`, `mime` y `v`.
   - Arreglado de paso: si la clínica no tenía ninguna oferta publicada, el botón
     «Invitar» no hacía nada y no se entendía por qué. Ahora lo dice.
5. ~~Invitaciones (elegir oferta y mensaje; al aceptar, pasa a «Candidatos»).~~ **HECHO** (15 de noviembre).
   - De punta a punta: la clínica invita desde la lista o desde el visor de vídeos,
     elige la oferta y escribe un mensaje; a la persona le llega en su Inicio, ve
     quién le invita y su mensaje al abrir la oferta, y si solicita aparece en
     «Candidatos» → «Por contestar» marcada como «Aceptó tu invitación», ya con su
     nombre completo, su contacto y su CV. Antes de aceptar, nada de eso se ve.
   - Prueba nueva: `pruebas/e2e/71-invitaciones.spec.js` (el recorrido entero y el tope).
   - Tres fallos reales encontrados y arreglados por el camino:
     - la pantalla de búsqueda no se refrescaba al enviar la invitación;
     - cada invitación se contaba **dos veces** contra el tope de 10 por semana;
     - la ventana de invitar enseñaba el pueblo de una persona anónima (ahora, los km).

### Arreglos pedidos por Asish tras probar la vista previa (15 de noviembre)
- [x] En «Buscar talento», los perfiles «Anónimo» llevan un **«?» gris**. Antes salía la
      letra de su forma de trabajar (la D, I, S o C), que se podía confundir con la
      inicial de su nombre y daba una pista de quién era.
- [x] **Fuera el interruptor «Datos de ejemplo»** del panel de la clínica. La clínica de
      ejemplo sigue siendo el escaparate de quien entra sin registrarse, y se apaga sola
      al registrarse o iniciar sesión; lo que ya no hay es forma de volver a encenderla.
- [x] Comprobado con una prueba que alguien en «Solo cuando yo solicite», **sin ninguna
      solicitud**, no sale en «Buscar talento», y que al volver a «Visible» vuelve a salir.
- [x] De paso: la lista de «Buscar talento» se vuelve a pedir **cada vez que se entra**.
      Antes se guardaba de antes, así que quien se apagaba seguía saliendo hasta recargar.

### Arreglos tras probar «Buscar talento» en la web publicada (15 de noviembre)
- [x] **Privacidad:** si no se podían calcular los km (clínica sin pueblo), de una persona
      anónima se enseñaba **su pueblo**. Ahora un solo sitio decide qué se dice del lugar
      (`CERCO_lugarTalento`), y lo usan la lista, la ficha, el visor de vídeos y la ventana
      de invitar: «Visible» → su pueblo; «Anónimo» → solo los km, o su provincia, o nada.
- [x] Si la clínica no tiene pueblo puesto, «Buscar talento» lo avisa y lleva a ponerlo.
- [x] **Ficha del profesional** (`screen-talento`), con el mismo diseño que la de Candidatos:
      vídeo, perfil DISC con sus barras, encaje, experiencia, formación, «Sobre mí»,
      cualidades, disponibilidad, jornada, km y radio, y el botón «Invitar».
      Nunca el nombre completo, el teléfono, el correo ni el CV.
      **«Sobre mí» y dónde ha trabajado solo se publican en «Visible»**: están escritos con
      sus palabras y llevan nombres de clínicas, así que en «Anónimo» dirían quién es.
      La titulación sí se enseña en los dos modos, porque es genérica.
- [x] El contador de «Verlos en vídeo» contaba solo a quien tuviera publicado en cuántos
      trozos está su vídeo. Los perfiles guardados antes de que eso existiera quedaban fuera.
      Ahora cuenta a quien dice tener vídeo, y los trozos se cuentan leyendo el primero.
- [x] El vídeo de la ficha ocupaba casi toda la pantalla y se cargaba solo. Ahora es una
      portada oscura con el botón de reproducir, en vertical y estrecha (250 px), con toda
      la información al lado: igual que la ficha de Candidatos. El vídeo se carga al pulsar.
- [x] Si no se puede publicar el perfil para las búsquedas, **se avisa a la persona**.
      Antes fallaba en silencio: creía que había quedado guardado y no era verdad.
- [x] La portada del vídeo en la ficha salía negra. Ahora se publica un fotograma del
      vídeo (`videoPortada`, 270 px), **solo en «Visible»**: es una imagen de su cara, así
      que en «Anónimo» se queda la portada oscura con el botón.
- [x] El título «Vídeo de presentación» estaba pegado al borde: era la clase `video-card`
      del estilo de la clínica, que quita el relleno. Ahora tiene el mismo margen que el resto.
- **Reglas de Firebase: vuelven a cambiar** (campos `titulacion`, `resumen`, `trabajos`
  y `videoPortada`).
  Asish tendrá que volver a publicarlas al publicar esto. **Comprobado** pasando las
  pruebas de reglas contra las que están publicadas ahora: rechazan esos tres campos,
  así que hasta que se publiquen las nuevas, un profesional no puede publicar su
  formación, su presentación ni sus trabajos (y por eso no salen en la ficha).

## Pendiente para más adelante
- **Reglas de seguridad: puntos mejorables** (previsto en la Fase 3):
  - Cualquier cuenta puede crearse un documento en `clinicas/{su uid}` y así leer `talento`, que de todas formas es anónimo.
  - `tiempos_respuesta`, `condiciones` y `valoraciones` no comprueban bien quién escribe ni qué escribe.
  - La clínica puede devolver una solicitud a un estado anterior.
- **Doble clic:** la web ignora un segundo «Publicar oferta» en menos de 0,9 s y un segundo «Enviar solicitud» en menos de 2 s. No es un fallo: es una protección. Solo se apunta porque las pruebas tienen que esperar.

## Notas técnicas
- Desde el entorno de Claude Code no se puede descargar Firebase desde `www.gstatic.com`. En las pruebas se sirve una copia idéntica (misma versión 10.12.0, paquete oficial `firebase` de npm). La web publicada no cambia.
