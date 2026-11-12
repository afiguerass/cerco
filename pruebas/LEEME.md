# Pruebas automáticas de CERCO

Esta carpeta **no forma parte de la web**. Sirve para comprobar, después de cada cambio, que todo lo que funcionaba sigue funcionando y se ve igual.

## Qué hay aquí

| Carpeta / archivo | Qué es |
| --- | --- |
| `reglas/` | Pruebas de las **reglas de seguridad** (`../firestore.rules`): quién puede leer y escribir cada dato. |
| `e2e/` | Pruebas «de punta a punta»: un navegador automático usa la web como lo haría una persona, en ordenador (1400 px) y móvil (390 px). |
| `capturas/` | **Capturas de referencia** de cada pantalla (ordenador y móvil). Después de cada cambio se comparan con las nuevas: si algo se ve distinto, la prueba falla. Se tapan los vídeos, las frases del test (orden aleatorio), los avisos flotantes y los enlaces con números internos. Se admiten como mucho 10 píxeles distintos por captura: cambiar una sola letra ya lo supera. |
| `apoyo/` | Piezas comunes: el servidor web de pruebas y la conexión con el emulador. |
| `recursos/` | Copia local de la tipografía Inter, para que las capturas no dependan de Internet. |
| `firebase.json` | Configuración del **emulador**: un Firebase falso que vive solo en este ordenador. |

## Seguridad: nunca se tocan los datos reales

- Las pruebas usan un proyecto ficticio (`demo-cerco`) dentro del emulador.
- La web se abre sin modificarla. Firebase, pdf.js y la tipografía se sirven desde copias locales idénticas, y **cualquier otra conexión a Internet se bloquea**.

## Cómo ejecutarlas

Hace falta Node.js 20 o superior y Java 11 o superior (el emulador de Firebase lo necesita).

```bash
cd pruebas
npm install
npm test
```

`npm test` arranca el emulador, pasa las pruebas de reglas, después las de la web, y lo apaga al acabar.

Otras órdenes útiles:

- `npm run emulador`: deja el emulador encendido (para usar `npm run test:web` o `npm run test:reglas` sueltos mientras se trabaja).
- `npm run capturas:nuevas`: vuelve a hacer las capturas de referencia. **Solo** cuando Asish haya aprobado un cambio visual.
- `npx playwright show-report`: abre un informe con el resultado de la última ejecución.
