// FIREBASE para las dos páginas de CERCO (Fase 1, paso 1.8a).
// Antes se descargaba de www.gstatic.com mientras se abría la página; ahora va
// dentro de la web compilada, con la misma versión (10.12.0) y el mismo uso
// (*compat*). Cuando está listo se avisa con el evento «cerco-firebase-listo»:
// Nube.cargar() (clinica/01-panel.js y profesional/01-portal.js) lo espera.
import firebase from 'firebase/compat/app';
import 'firebase/compat/auth';
import 'firebase/compat/firestore';

// Solo en la versión de PRUEBAS (npm run build:pruebas): todo va al emulador,
// un Firebase falso que vive en el ordenador de las pruebas, con un proyecto
// ficticio. En la versión que se publica este bloque ni siquiera existe.
if (import.meta.env.MODE === 'pruebas') {
  const original = firebase.initializeApp.bind(firebase);
  firebase.initializeApp = (cfg, nombre) => {
    const app = original({ ...cfg, projectId: 'demo-cerco', apiKey: 'clave-de-pruebas' }, nombre);
    app.auth().useEmulator('http://127.0.0.1:9099', { disableWarnings: true });
    app.firestore().useEmulator('127.0.0.1', 8080);
    return app;
  };
}

window.firebase = firebase;
window.__cercoFirebaseListo = true;
window.dispatchEvent(new Event('cerco-firebase-listo'));
