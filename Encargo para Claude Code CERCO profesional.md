# Encargo para Claude Code: CERCO profesional

Nov 12, 2026 · @Asish

Convertir el CERCO que ya funciona (dos archivos HTML en GitHub + Firebase) en un proyecto profesional, por fases y sin cambiar nada de lo que el usuario ve, hasta tener vídeos en Storage, avisos por correo y dominio propio.

## Cómo dárselo a Claude Code

Claude Code trabaja sobre el repositorio de GitHub `afiguerass/cerco`, no sobre archivos pegados en el chat: así cada cambio queda guardado y se puede deshacer.

1. Abre Claude Code con el repositorio `afiguerass/cerco` conectado (en la web, en claude.ai/code, eligiendo ese repositorio).
2. Exporta este documento como Markdown (clic en el nombre del documento → Exportar → Markdown) y súbelo al repositorio con el nombre `ENCARGO.md`. Si no, cópialo entero y pégalo como primer mensaje.
3. Escríbele: «Lee ENCARGO.md entero. Empieza por la Fase 0 y no pases a la siguiente fase hasta que yo te lo diga. Háblame en español y explícame cada paso como a alguien que no es programador».
4. Al acabar cada fase, prueba tú la web como siempre (clínica en ventana normal, candidato en ventana de incógnito) antes de decirle que siga.
5. Si algo deja de funcionar, dile: «Esto funcionaba antes de tu último cambio: vuelve atrás y arréglalo sin tocar el diseño».

## Qué es CERCO

CERCO es una plataforma de selección de personal para clínicas dentales que une candidatos y clínicas por el perfil de personalidad DISC del equipo. Todos los textos de la app están en español de España.

- **Lado clínica** (`index.html`): la clínica crea su perfil, pasa el test DISC a su equipo con un enlace, publica ofertas eligiendo los perfiles DISC que le faltan, recibe solicitudes con vídeo y CV, contesta (me interesa, entrevista con cita, descarte con motivo, contratar), envía contrato y sigue un plan de acogida de 90 días.
- **Lado profesional** (`candidato.html`): el candidato hace el mismo test DISC, sube su vídeo de presentación (hasta 1 minuto, vertical), su CV, ve ofertas reales con su % de encaje y la distancia, solicita, sigue el estado, chatea con la clínica, recibe el contrato y ve su plan de acogida.
- **Asistente**: se llama «Seimian».
- **Usuarios reales**: ya hay clínicas que han usado el test DISC con sus equipos y ven sus resultados. Cualquier cambio en cómo se puntúa el test afecta a datos reales.

## Reglas que no se pueden romper

La regla número uno: **nada de lo que el usuario ve cambia** salvo que Asish lo pida. Si algo parece mejorable, se propone y se espera su sí.

**Diseño**

- No inventar ni cambiar pantallas ya aprobadas. Antes de tocar una pantalla, mirar cómo es y conservar su aspecto exacto.
- El lado del candidato es el espejo del lado de la clínica: mismo estilo, mismos pasos inteligentes (Inicio con primeros pasos, test, vídeo, perfil).
- La ficha de un candidato en la clínica es la pantalla grande de siempre (resumen arriba, vídeo + CV resumido, perfil de personalidad, contacto, acciones), nunca una ventana pequeña.
- En «Candidatos» las tarjetas llevan el vídeo bien visible. Los candidatos se agrupan por profesión (higienistas juntos, odontólogos juntos…).
- La portada de entrada del candidato que está aprobada se mantiene. Cerrar sesión siempre a mano.
- Iconos SVG de trazo redondeado (estilo Lucide), sin emojis en la interfaz.

**Textos**

- Español de España, sin faltas, sin catalán, sin jerga («matching», «Kanban», «caja negra») ni lenguaje de marketing.
- Nunca «responsable de contratación» ni «RRHH»: las clínicas dentales no tienen. Se usa el rol real (gerente, director/a clínico…).
- Nada de «TikTok»: quita credibilidad. El vídeo es «vídeo de presentación», de 15 segundos a 1 minuto.
- No poner «IA» en algo que no lo hace una IA.

**Test DISC**

- Escala numérica del 1 al 4 (no botones MÁS/MENOS). Los números se pueden repetir, pero hay que seguir evitando que se haga trampa. Opciones en orden aleatorio.
- Si el resultado sale plano: dice exactamente «Perfil sin definir», sin colores ni porcentajes, solo la frase y la opción de repasar; no se puede dar por terminado así, y no cuenta en las estadísticas del equipo.
- El candidato usa el mismo test que los equipos de las clínicas, para que se puedan comparar.
- El candidato puede repetir el test, pero se guarda cada cambio y cuántas veces, y la clínica lo ve.
- Cada oferta pide como mínimo dos perfiles DISC, sin jerarquía entre ellos.

**Funcionamiento**

- La clínica contesta en 2 días laborables; a los 5 días sin respuesta, CERCO cierra la solicitud y avisa al candidato.
- «Efecto rebote»: si una clínica descarta a alguien, el sistema lo propone a otra clínica a la que le faltan sus colores DISC. Que todos ganen.
- La ubicación acepta cualquier dirección o municipio de España; la distancia se calcula por municipio.
- CV: «CV resumido» visible en la app y «Descargar CV completo» aparte; el PDF se puede ver sin descargarlo.
- Un correo = una cuenta (clínica y profesional comparten la lista de usuarios de Firebase).
- El candidato nunca ve ofertas falsas o de ejemplo en la app real.

## Cómo está hecho hoy

Todo funciona de punta a punta con datos reales: una clínica publica, un profesional solicita, la clínica contesta, contrata y envía el contrato. Pero está en dos archivos enormes, con muchos arreglos encima, en el plan gratuito de Firebase.

| Pieza | Cómo es hoy |
| --- | --- |
| `index.html` (clínica) | Un solo archivo: 14.658 líneas, 1,4 MB, 19 bloques `<script>` (varios envuelven funciones anteriores: `window.abrirFichaCandidato = function(){ … }` sobre la versión previa) |
| `candidato.html` (profesional) | Un solo archivo: 6.907 líneas, 1,1 MB, 12 bloques `<script>`, mismo patrón |
| Publicación | GitHub Pages: `afiguerass.github.io/cerco/` y `/candidato.html` |
| Firebase | Proyecto `cerco-c5724`, plan Spark (gratuito). SDK *compat* 10.12.0: Auth + Firestore. Sin Storage ni Functions |
| Inicio de sesión | Correo y contraseña, y Google. Recuperar contraseña con plantilla en español |
| Vídeos y CV | Se guardan en Firestore en base64 partido en trozos de 400.000 caracteres (`candidatos/{uid}/media/{tipo}_{n}`). El vídeo se re-codifica en el navegador (canvas + MediaRecorder + Web Audio) a 720p, \~1,1 Mbps, hasta 15 MB |
| Contrato | La clínica lo sube en trozos a `candidaturas/{id}/docs/contrato_{n}` |
| Municipios | Lista de municipios de España con coordenadas metida en el propio archivo; distancia en línea recta |
| Datos locales | Varias cosas viven también en `localStorage` (`cerco_ofertas`, `cerco_candidaturas`, `cerco_empresa`, `cerco_disc_*`, `cerco_acogida`…) como copia o preferencia |
| Probador | Un archivo aparte («CERCO conjunto») mete las dos apps en una página con un Firebase falso en memoria. No se sube a GitHub |

**Colecciones de Firestore** (las reglas actuales están publicadas y hay que respetarlas o mejorarlas, nunca abrirlas):

- `clinicas/{uid}` privado de la clínica, con `equipo` (resultados del test que envían los trabajadores por el enlace, aunque entren de forma anónima) y `ofertas`.
- `clinicas_publicas`, `verificaciones` (solo las pone CERCO), `solicitudes_verificacion`.
- `ofertas_publicas` (lectura pública, escribe solo su clínica).
- `candidatos/{uid}` + `media`: solo el profesional, y la clínica a la que ha enviado solicitud.
- `talento` (perfil anónimo para «Buscar talento»).
- `candidaturas` (una por oferta y persona; estados `enviada → vista → entrevista → contratada / descartada / caducada / retirada`; cada parte solo puede tocar sus campos) + `docs` del contrato.
- `tiempos_respuesta`, `invitaciones`, `valoraciones` (anónimas, 1–5), `condiciones`, `denuncias` (solo las lee CERCO).
- Todo lo demás, cerrado.

Las reglas completas están en `firestore.rules` (Asish la tiene; si no está en el repositorio, pídesela).

## Fase 0 — Preparar el terreno

Objetivo: poder cambiar cosas con red de seguridad. No se toca ni una línea de lo que ve el usuario.

- [ ] Crear una rama `profesional` en el repositorio. La web publicada (rama principal) no se toca hasta que Asish lo apruebe.
- [ ] Guardar en el repositorio `firestore.rules` (las reglas que están publicadas en Firebase) y un `README.md` en español que explique qué es cada archivo.
- [ ] Escribir pruebas automáticas de punta a punta con Playwright contra el emulador de Firebase (Auth + Firestore), sobre los dos archivos tal y como están hoy. Como mínimo:
  - Clínica: registrarse, perfil, enlace del test al equipo, publicar oferta (puesto, proceso con varios pasos, salario).
  - Profesional: registrarse, test DISC (incluido el caso «Perfil sin definir»), subir vídeo y CV, ver la oferta con su % de encaje, solicitar.
  - Clínica: ver la solicitud, abrir la ficha grande, me interesa, entrevista con cita, contratar, enviar contrato, marcar el plan de acogida.
  - Profesional: ver el estado, «Tu incorporación», confirmar el contrato, retirar otras solicitudes.
  - Reglas: que un profesional no pueda leer datos de otro ni tocar lo que decide la clínica, y al revés.
  - Ordenador (1400 px) y móvil (390 px).
- [ ] Capturas de pantalla de referencia de cada pantalla, para comparar después de cada cambio (que se vea igual, píxel a píxel o casi).
- [ ] Todas las pruebas en verde antes de pasar a la Fase 1.

## Fase 1 — Ordenar el código sin cambiar nada

Objetivo: que el código sea mantenible. Para el usuario, la web es idéntica antes y después.

- [ ] Pasar a un proyecto con Vite (JavaScript con módulos; TypeScript opcional, poco a poco). Sin cambiar de framework visual de golpe: primero mover, después mejorar.
- [ ] Separar en carpetas: estilos, pantallas de la clínica, pantallas del profesional, y una parte común (Firebase, test DISC, cálculo de encaje, municipios y distancias, vídeo, textos).
- [ ] Deshacer las capas de «envolver la función anterior»: cada función con una sola versión final que haga lo mismo que hoy hace la cadena entera.
- [ ] El test DISC, la puntuación y el % de encaje en un único módulo compartido por los dos lados, con pruebas propias. La puntuación de los tests ya hechos no puede cambiar.
- [ ] La lista de municipios en un archivo de datos aparte, cargado solo cuando haga falta.
- [ ] Pasar el SDK de Firebase de *compat* al modular (10.x o el actual), sin cambiar datos ni rutas de Firestore.
- [ ] Lo que hoy vive en `localStorage` como dato (ofertas, solicitudes, empresa) pasa a leerse de Firestore; `localStorage` queda solo para preferencias del navegador.
- [ ] Publicación automática: al aprobar un cambio en la rama principal, GitHub Actions compila y publica. Las mismas dos direcciones de siempre, para no romper enlaces ya enviados (incluidos los enlaces del test que tienen las clínicas).
- [ ] Comprobación: todas las pruebas de la Fase 0 en verde y capturas iguales.

## Fase 2 — Plan Blaze: archivos, avisos y cierre automático

Objetivo: lo que hoy no se puede hacer sin servidor. Antes de empezar, Asish pasa el proyecto `cerco-c5724` al plan Blaze y pone un **límite de gasto** (por ejemplo, alerta a 10 €/mes); Claude Code le explica el coste esperado en euros antes de activar nada.

- [ ] **Vídeos, CV, fotos y contratos a Firebase Storage**, con reglas equivalentes a las de hoy (solo el dueño, y la clínica a la que ha solicitado). Migrar los que ya están en trozos de Firestore y borrar los trozos después.
- [ ] Con Storage, el vídeo se puede subir tal cual y re-codificar en el servidor si pesa mucho (o seguir haciéndolo en el navegador si sale más barato). Mantener: vertical, de 15 s a 1 min, portada elegida, recorte, editor.
- [ ] **Avisos por correo** con Cloud Functions y Brevo (remitente «CERCO», en español, sin enlaces de seguimiento raros):
  - Al profesional: le han visto, le interesa a una clínica, entrevista con fecha y hora, descarte con su motivo, contratado, contrato recibido, mensaje nuevo.
  - A la clínica: solicitud nueva, faltan 24 h para el plazo de respuesta, la persona confirmó o cambió la cita, mensaje nuevo, contrato recibido.
  - Recordatorio de la cita 24 h antes a los dos.
  - Cada persona puede elegir qué avisos recibe.
- [ ] **Cierre automático a los 5 días** (función programada): cerrar solicitudes sin respuesta, avisar al profesional y aplicar el «efecto rebote» en el servidor, no en el navegador.
- [ ] **Seguimiento a los 90 días** del contratado («¿seguís trabajando juntos?») enviado por correo a los dos.
- [ ] **Verificar el correo** al registrarse antes de poder solicitar o publicar.
- [ ] Comprobación: pruebas en verde con el emulador de Functions y Storage, y una prueba real con dos correos de Asish.

## Fase 3 — Dominio propio, parte legal y seguridad

Objetivo: poder enseñarlo a clínicas e inversores como una empresa seria.

- [ ] **Dominio propio** (por ejemplo `cerco.es`; Asish lo compra) con Firebase Hosting o GitHub Pages, HTTPS. Redirigir las direcciones antiguas de github.io para no romper enlaces del test ya enviados.
- [ ] **Correo del dominio** para los avisos (SPF, DKIM y DMARC configurados, para que no lleguen a spam).
- [ ] **Parte legal** (RGPD y LOPDGDD): política de privacidad, condiciones de uso, aviso de cookies, consentimiento explícito para el vídeo y para el test de personalidad, derecho a borrar la cuenta y descargar los datos, plazo de conservación. Claude Code prepara los borradores; los revisa un abogado antes de publicarlos.
- [ ] **Seguridad**: revisión de las reglas de Firestore y Storage (con pruebas), App Check, límites para que nadie pueda llenar la base de datos, copias de seguridad diarias de Firestore.
- [ ] **Medición** sin datos personales: cuántas ofertas, solicitudes, contestadas en plazo, contrataciones (lo que pedirán los inversores).
- [ ] **Errores**: que los fallos de la web lleguen a CERCO (Sentry o similar) en vez de quedarse en el móvil del usuario.

## Cómo trabajar y comprobar cada paso

Asish no es programador y prueba él mismo la app como un usuario real: lo que funciona hoy tiene que seguir funcionando, en ordenador y en móvil (incluido iPhone con Safari).

- **Idioma**: hablar con Asish en español (o catalán si escribe en catalán), sin tecnicismos, explicando qué se va a hacer y por qué antes de hacerlo.
- **Pasos pequeños**: un cambio, sus pruebas, un commit con mensaje en español. Nunca un cambio enorme de golpe.
- **Nada a producción sin su sí**: se trabaja en la rama `profesional` y en una dirección de pruebas; Asish lo prueba y dice «adelante».
- **Datos reales**: hay clínicas con resultados del test guardados. No borrar ni migrar datos sin copia de seguridad previa y sin explicarlo antes.
- **iPhone**: Safari solo deja reproducir vídeo con sonido si nace del toque del usuario; el «Modo de aislamiento» bloquea cámara y audio web (la app ya lo explica). Probar siempre el vídeo en iPhone.
- **Antes de dar algo por hecho**: pruebas en verde, capturas comparadas, y una lista corta para Asish de qué probar con sus manos (clínica en ventana normal, candidato en ventana de incógnito).
- **Si algo se rompe**: volver atrás primero, arreglar después.
- **Costes**: cualquier servicio de pago, decirlo antes con el coste estimado en euros al mes.

## Decisiones abiertas que Claude Code debe preguntar

Estas no están decididas: Claude Code las pregunta a Asish en su momento, con las opciones y lo que cuesta cada una, y no elige por su cuenta.

- [ ] Nombre del dominio y dónde comprarlo.
- [ ] Cuándo pasar a Blaze y el límite de gasto mensual.
- [ ] Qué avisos por correo se activan primero.
- [ ] Si los profesionales también pueden entrar con Apple (además de correo y Google).
- [ ] Precio para las clínicas y cómo se cobra (está sin decidir).
- [ ] Quién revisa los textos legales (abogado).
- [ ] Si, en lugar de las páginas sueltas, se hace también una app para móvil más adelante (no ahora).
