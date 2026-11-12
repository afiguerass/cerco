# CERCO

CERCO es una plataforma de selección de personal para clínicas dentales. Une candidatos y clínicas según el perfil de personalidad DISC del equipo.

## Dónde está publicada

- Clínicas: https://afiguerass.github.io/cerco/
- Profesionales: https://afiguerass.github.io/cerco/candidato.html

La web se publica con GitHub Pages desde la rama principal (`main`). Lo que se sube a `main` lo ven los usuarios reales.

## Qué es cada archivo

| Archivo | Para qué sirve |
| --- | --- |
| `index.html` | **Lado clínica.** Perfil de la clínica, test DISC del equipo (con enlace para los trabajadores), ofertas, candidatos, solicitudes, entrevistas, contratación, contrato y plan de acogida de 90 días. Es un solo archivo con todo dentro (diseño, textos y funcionamiento). |
| `candidato.html` | **Lado profesional.** Registro, test DISC, vídeo de presentación, CV, ofertas con su % de encaje y distancia, solicitudes, chat con la clínica, contrato y «Tu incorporación». También es un solo archivo. |
| `firestore.rules` | **Reglas de seguridad de la base de datos** (Firebase Firestore). Dicen quién puede leer y escribir cada dato. Es la misma versión que está publicada en Firebase (proyecto `cerco-c5724`). Si se cambia aquí, hay que publicarla también en la consola de Firebase. |
| `Encargo para Claude Code CERCO profesional.md` | El encargo: qué es CERCO, las reglas que no se pueden romper y el plan por fases para profesionalizarlo. |
| `PROGRESO.md` | Cuaderno de trabajo: qué está hecho, qué falta y cuál es el siguiente paso. |
| `README.md` | Este archivo. |
| `pruebas/` | Pruebas automáticas (ver más abajo). **No forma parte de la web**: solo sirve para comprobar que todo sigue funcionando después de cada cambio. |

## Dónde se guardan los datos

En Firebase (proyecto `cerco-c5724`, plan gratuito Spark):

- **Inicio de sesión** (Firebase Auth): correo y contraseña, y Google. Un correo = una cuenta, compartida entre el lado clínica y el lado profesional.
- **Base de datos** (Firestore): clínicas, equipos, ofertas, candidatos, solicitudes, contratos, valoraciones… Los vídeos y los CV se guardan también ahí, partidos en trozos.
- Algunas cosas se copian también en el propio navegador (`localStorage`).

## Pruebas automáticas

Las pruebas abren la web en un navegador automático y hacen lo mismo que haría una persona: registrarse, hacer el test, publicar una oferta, solicitar, contratar… Lo hacen contra una **copia falsa de Firebase** (el «emulador») que vive solo en el ordenador donde se ejecutan: **nunca tocan los datos reales**.

Las instrucciones para ejecutarlas están en [`pruebas/LEEME.md`](pruebas/LEEME.md).
