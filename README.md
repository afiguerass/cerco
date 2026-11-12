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

## Probar la rama `profesional` antes de publicarla

La web publicada (`afiguerass.github.io/cerco`) sale siempre de `main`. Los cambios de la rama `profesional` no se ven ahí hasta que se aprueban y se pasan a `main`. Para probarlos antes hay tres formas, de más fácil a menos:

### 1. Ver las capturas (sin riesgo, sin instalar nada)
En GitHub, cambia a la rama `profesional` y abre la carpeta `pruebas/capturas/`. Hay una imagen de cada pantalla, en `ordenador/` y en `movil/`, tal como queda con los cambios.

### 2. Abrir la rama en el navegador (sin instalar nada)
Estas dos direcciones enseñan los archivos de la rama `profesional` como si fueran una web:

- Clínica: https://raw.githack.com/afiguerass/cerco/profesional/index.html
- Profesional: https://raw.githack.com/afiguerass/cerco/profesional/candidato.html

Cosas a tener en cuenta:
- **Usa la base de datos real** (la misma que la web publicada). Entra con **cuentas de prueba** (correos nuevos), no con las de clínicas reales, y no envíes desde aquí el enlace del test a ningún equipo.
- raw.githack.com es un servicio gratuito externo. Solo funciona si el repositorio es público. Después de cada cambio puede tardar unos minutos en verse.
- Entrar con correo y contraseña debería funcionar. «Continuar con Google» probablemente no funcionará hasta que se añada `raw.githack.com` en la consola de Firebase: Authentication → Configuración → Dominios autorizados.

### 3. En tu ordenador (hace falta instalar Node.js)
1. En GitHub, en la rama `profesional`: botón verde «Code» → «Download ZIP», y descomprímelo.
2. Abre una terminal en esa carpeta y escribe `npx serve .`
3. Abre en el navegador la dirección que te indica (normalmente `http://localhost:3000`).

También usa la base de datos real, así que conviene hacerlo con cuentas de prueba. «localhost» ya está autorizado en Firebase, así que también funciona entrar con Google.

Las pruebas automáticas (que no tocan datos reales) se explican en [`pruebas/LEEME.md`](pruebas/LEEME.md).
