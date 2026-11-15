// Pruebas de las reglas de seguridad de Firestore (../../firestore.rules).
//
// Cada prueba hace de una persona concreta (una clínica, un profesional, un
// trabajador que entra por el enlace del test, alguien sin sesión…) e intenta
// leer o escribir algo. Comprobamos que las reglas dejan lo que deben dejar
// y bloquean lo que deben bloquear.
//
// Se ejecutan contra el emulador (Firebase falso). Nunca contra datos reales.
const { test, describe, before, after, beforeEach } = require('node:test');
const fs = require('fs');
const path = require('path');
const {
  initializeTestEnvironment, assertSucceeds, assertFails,
} = require('@firebase/rules-unit-testing');
const {
  doc, getDoc, setDoc, updateDoc, deleteDoc, collection, getDocs, addDoc,
} = require('firebase/firestore');

let entorno;

// Personas de las pruebas
const CLINICA = 'clinica-A';
const OTRA_CLINICA = 'clinica-B';
const PRO = 'pro-1';
const OTRO_PRO = 'pro-2';
const OFERTA = 'oferta-1';
const SOL = `${OFERTA}_${PRO}`; // id de la solicitud: oferta + profesional

const cuenta = (uid) => entorno.authenticatedContext(uid, { firebase: { sign_in_provider: 'password' } }).firestore();
const anonimo = (uid = 'anon-1') => entorno.authenticatedContext(uid, { firebase: { sign_in_provider: 'anonymous' } }).firestore();
const sinSesion = () => entorno.unauthenticatedContext().firestore();

// Mete datos saltándose las reglas (como haría la consola de Firebase)
async function sembrar(ruta, datos) {
  await entorno.withSecurityRulesDisabled(async (ctx) => { await setDoc(doc(ctx.firestore(), ruta), datos); });
}

const solicitudBase = (extra = {}) => ({
  candidatoUid: PRO, clinicaId: CLINICA, ofertaId: OFERTA, estado: 'enviada',
  nombre: 'Laura Pérez', email: 'laura@ejemplo.es', telefono: '600000000', profesion: 'Higienista dental',
  disc: { dom: 'S', sec: 'C' }, encaje: 82, mensaje: 'Hola', fecha: 1,
  ...extra,
});

// Perfil de «Buscar talento». «video» y «cv» son solo un sí/no («tiene vídeo»,
// «tiene CV»), nunca el vídeo ni el CV en sí.
const talentoBase = (extra = {}) => ({
  modo: 'anonimo', profesion: 'Higienista dental', experiencia: 'de 2 a 5 años',
  jornada: 'Completa', disponibilidad: 'Ya', disc: { dom: 'S', sec: 'C' },
  geo: { lat: 41.98, lng: 2.82, prov: 'Girona', n: 'Girona' }, radio: 25,
  video: true, cv: true, actualizado: '2026-11-15T10:00:00.000Z',
  ...extra,
});

before(async () => {
  entorno = await initializeTestEnvironment({
    projectId: 'demo-cerco',
    firestore: {
      host: '127.0.0.1', port: 8080,
      rules: fs.readFileSync(path.join(__dirname, '..', '..', 'firestore.rules'), 'utf8'),
    },
  });
});
after(async () => { await entorno?.cleanup(); });

beforeEach(async () => {
  await entorno.clearFirestore();
  await sembrar(`clinicas/${CLINICA}`, { nombre: 'Clínica A' });
  await sembrar(`clinicas/${OTRA_CLINICA}`, { nombre: 'Clínica B' });
  await sembrar(`candidatos/${PRO}`, { nombre: 'Laura Pérez', clinicas: [CLINICA] });
  await sembrar(`candidatos/${PRO}/media/video_0`, { d: 'AAAA' });
  await sembrar(`candidatos/${OTRO_PRO}`, { nombre: 'Marc Soler', clinicas: [] });
  await sembrar(`candidatos/${OTRO_PRO}/media/video_0`, { d: 'CCCC' });
  await sembrar(`candidatos/${OTRO_PRO}/media/cv_0`, { d: 'DDDD' });
  await sembrar(`candidaturas/${SOL}`, solicitudBase());
});

describe('Clínicas: datos privados', () => {
  test('la clínica lee y escribe sus propios datos', async () => {
    await assertSucceeds(getDoc(doc(cuenta(CLINICA), `clinicas/${CLINICA}`)));
    await assertSucceeds(setDoc(doc(cuenta(CLINICA), `clinicas/${CLINICA}/ofertas/o1`), { puesto: 'Higienista' }));
  });
  test('otra clínica NO puede leer ni tocar sus datos', async () => {
    await assertFails(getDoc(doc(cuenta(OTRA_CLINICA), `clinicas/${CLINICA}`)));
    await assertFails(setDoc(doc(cuenta(OTRA_CLINICA), `clinicas/${CLINICA}`), { nombre: 'Robada' }));
    await assertFails(getDocs(collection(cuenta(OTRA_CLINICA), `clinicas/${CLINICA}/equipo`)));
  });
  test('un profesional NO puede leer los datos privados de una clínica', async () => {
    await assertFails(getDoc(doc(cuenta(PRO), `clinicas/${CLINICA}`)));
    await assertFails(getDocs(collection(cuenta(PRO), `clinicas/${CLINICA}/ofertas`)));
  });
  test('una sesión anónima (enlace del test) no es la dueña aunque tenga el mismo uid', async () => {
    await assertFails(getDoc(doc(anonimo(CLINICA), `clinicas/${CLINICA}`)));
  });
});

describe('Enlace del test para el equipo', () => {
  const resultado = { nombre: 'Ana', rol: 'Auxiliar', dom: 'I', sec: 'S', pct: 74, codigo: 'X1', origen: 'enlace', fecha: 1 };
  test('un trabajador anónimo puede enviar un resultado válido', async () => {
    await assertSucceeds(setDoc(doc(anonimo(), `clinicas/${CLINICA}/equipo/m1`), resultado));
  });
  test('pero no puede leer el equipo ni enviar datos raros', async () => {
    await assertFails(getDocs(collection(anonimo(), `clinicas/${CLINICA}/equipo`)));
    await assertFails(setDoc(doc(anonimo(), `clinicas/${CLINICA}/equipo/m2`), { ...resultado, dom: 'X' }));
    await assertFails(setDoc(doc(anonimo(), `clinicas/${CLINICA}/equipo/m3`), { ...resultado, pct: 150 }));
    await assertFails(setDoc(doc(anonimo(), `clinicas/${CLINICA}/equipo/m4`), { ...resultado, extra: 'campo no permitido' }));
  });
  test('sin sesión no se puede enviar nada', async () => {
    await assertFails(setDoc(doc(sinSesion(), `clinicas/${CLINICA}/equipo/m5`), resultado));
  });
});

describe('Ofertas públicas', () => {
  test('cualquiera las lee; solo su clínica las crea, cambia o borra', async () => {
    await assertSucceeds(setDoc(doc(cuenta(CLINICA), `ofertas_publicas/${OFERTA}`), { clinicaId: CLINICA, puesto: 'Higienista' }));
    await assertSucceeds(getDoc(doc(sinSesion(), `ofertas_publicas/${OFERTA}`)));
    await assertFails(updateDoc(doc(cuenta(OTRA_CLINICA), `ofertas_publicas/${OFERTA}`), { puesto: 'Cambiada' }));
    await assertFails(deleteDoc(doc(cuenta(PRO), `ofertas_publicas/${OFERTA}`)));
    await assertFails(setDoc(doc(cuenta(OTRA_CLINICA), 'ofertas_publicas/falsa'), { clinicaId: CLINICA }));
    await assertFails(setDoc(doc(anonimo(), 'ofertas_publicas/anon'), { clinicaId: 'anon-1' }));
  });
});

describe('Verificaciones (insignia de clínica verificada)', () => {
  test('nadie puede ponerse la insignia desde la web', async () => {
    await assertFails(setDoc(doc(cuenta(CLINICA), `verificaciones/${CLINICA}`), { ok: true }));
  });
});

describe('Perfil del profesional (vídeo, CV…)', () => {
  test('el profesional lee y escribe su perfil y su vídeo', async () => {
    await assertSucceeds(getDoc(doc(cuenta(PRO), `candidatos/${PRO}`)));
    await assertSucceeds(setDoc(doc(cuenta(PRO), `candidatos/${PRO}/media/cv_0`), { d: 'BBBB' }));
  });
  test('otro profesional NO puede leer ni tocar su perfil ni su vídeo', async () => {
    await assertFails(getDoc(doc(cuenta(OTRO_PRO), `candidatos/${PRO}`)));
    await assertFails(getDoc(doc(cuenta(OTRO_PRO), `candidatos/${PRO}/media/video_0`)));
    await assertFails(setDoc(doc(cuenta(OTRO_PRO), `candidatos/${PRO}`), { nombre: 'Cambiado' }));
  });
  test('la clínica a la que ha solicitado lo lee (con vídeo), pero no lo puede cambiar', async () => {
    await assertSucceeds(getDoc(doc(cuenta(CLINICA), `candidatos/${PRO}`)));
    await assertSucceeds(getDoc(doc(cuenta(CLINICA), `candidatos/${PRO}/media/video_0`)));
    await assertFails(updateDoc(doc(cuenta(CLINICA), `candidatos/${PRO}`), { nombre: 'Cambiado' }));
  });
  test('una clínica a la que NO ha solicitado no lo puede leer', async () => {
    await assertFails(getDoc(doc(cuenta(OTRA_CLINICA), `candidatos/${PRO}`)));
    await assertFails(getDoc(doc(cuenta(OTRA_CLINICA), `candidatos/${PRO}/media/video_0`)));
  });
  test('sin sesión no se ve nada', async () => {
    await assertFails(getDoc(doc(sinSesion(), `candidatos/${PRO}`)));
  });
});

describe('Talento (cómo te ven las clínicas en «Buscar talento»)', () => {
  test('lo leen las clínicas, no otros profesionales, y nadie más lo escribe', async () => {
    await sembrar(`talento/${PRO}`, talentoBase());
    await assertSucceeds(getDoc(doc(cuenta(CLINICA), `talento/${PRO}`)));
    await assertSucceeds(getDoc(doc(cuenta(PRO), `talento/${PRO}`)));
    await assertFails(getDoc(doc(cuenta(OTRO_PRO), `talento/${PRO}`)));
    await assertFails(setDoc(doc(cuenta(CLINICA), `talento/${PRO}`), talentoBase()));
  });

  test('una cuenta que no es de clínica no puede leer la lista', async () => {
    await sembrar(`talento/${PRO}`, talentoBase());
    await assertFails(getDocs(collection(cuenta(OTRO_PRO), 'talento')));
    await assertFails(getDocs(collection(anonimo(), 'talento')));
    await assertFails(getDocs(collection(sinSesion(), 'talento')));
  });

  test('en «Anónimo» NO se puede guardar nombre, inicial ni foto', async () => {
    const yo = doc(cuenta(PRO), `talento/${PRO}`);
    await assertSucceeds(setDoc(yo, talentoBase()));
    await assertFails(setDoc(yo, talentoBase({ nombre: 'Laura' })));
    await assertFails(setDoc(yo, talentoBase({ inicial: 'M' })));
    await assertFails(setDoc(yo, talentoBase({ fotoMini: 'data:image/jpeg;base64,AAAA' })));
  });

  test('en «Visible» van el nombre de pila y la inicial, nunca el apellido entero', async () => {
    const yo = doc(cuenta(PRO), `talento/${PRO}`);
    await assertSucceeds(setDoc(yo, talentoBase({ modo: 'visible', nombre: 'Laura', inicial: 'M', fotoMini: 'data:image/jpeg;base64,AAAA' })));
    await assertFails(setDoc(yo, talentoBase({ modo: 'visible', nombre: 'Laura Pérez' })));
    await assertFails(setDoc(yo, talentoBase({ modo: 'visible', nombre: 'Laura', inicial: 'Pérez' })));
  });

  test('el modo tiene que ser «visible» o «anonimo»', async () => {
    const yo = doc(cuenta(PRO), `talento/${PRO}`);
    await assertFails(setDoc(yo, talentoBase({ modo: 'solicito' })));
    await assertFails(setDoc(yo, talentoBase({ modo: '' })));
    const { modo, ...sinModo } = talentoBase();
    await assertFails(setDoc(yo, sinModo));
  });

  test('«videoMeta» solo puede decir en cuántos trozos está el vídeo', async () => {
    const yo = doc(cuenta(PRO), `talento/${PRO}`);
    await assertSucceeds(setDoc(yo, talentoBase({ videoMeta: { n: 2, mime: 'video/webm', v: 17 } })));
    await assertSucceeds(setDoc(yo, talentoBase({ videoMeta: null })));
    await assertFails(setDoc(yo, talentoBase({ videoMeta: { n: 2, mime: 'video/webm', v: 17, nombre: 'Laura Pérez' } })));
    await assertFails(setDoc(yo, talentoBase({ videoMeta: { n: 0, mime: 'video/webm', v: 1 } })));
  });

  test('aquí nunca caben el teléfono, el correo ni el CV', async () => {
    const yo = doc(cuenta(PRO), `talento/${PRO}`);
    await assertFails(setDoc(yo, talentoBase({ telefono: '600000000' })));
    await assertFails(setDoc(yo, talentoBase({ email: 'laura@ejemplo.es' })));
    await assertFails(setDoc(yo, talentoBase({ cv: 'data:application/pdf;base64,AAAA' })));
    await assertFails(setDoc(yo, talentoBase({ video: 'data:video/webm;base64,AAAA' })));
  });

  test('la presentación y los trabajos solo caben en «Visible»', async () => {
    const yo = doc(cuenta(PRO), `talento/${PRO}`);
    const extra = { resumen: 'Me gusta el trato con el paciente.', trabajos: [{ puesto: 'Higienista', centro: 'Clínica Sonrisa', tiempo: '5 años' }] };
    await assertSucceeds(setDoc(yo, talentoBase({ modo: 'visible', nombre: 'Laura', inicial: 'P', ...extra })));
    await assertFails(setDoc(yo, talentoBase({ ...extra })));                       // anónimo
    await assertFails(setDoc(yo, talentoBase({ resumen: extra.resumen })));
    await assertFails(setDoc(yo, talentoBase({ trabajos: extra.trabajos })));
    // la titulación sí, porque es genérica y no dice quién es
    await assertSucceeds(setDoc(yo, talentoBase({ titulacion: 'Técnico Superior en Higiene Bucodental' })));
  });

  test('la portada del vídeo es una foto suya: solo en «Visible»', async () => {
    const yo = doc(cuenta(PRO), `talento/${PRO}`);
    const portada = 'data:image/jpeg;base64,AAAA';
    await assertSucceeds(setDoc(yo, talentoBase({ modo: 'visible', nombre: 'Laura', inicial: 'P', videoPortada: portada })));
    await assertFails(setDoc(yo, talentoBase({ videoPortada: portada })));   // anónimo
  });

  test('al elegir «Solo cuando yo solicite», el profesional borra su perfil', async () => {
    await sembrar(`talento/${PRO}`, talentoBase());
    await assertFails(deleteDoc(doc(cuenta(CLINICA), `talento/${PRO}`)));
    await assertSucceeds(deleteDoc(doc(cuenta(PRO), `talento/${PRO}`)));
  });
});

describe('«Buscar talento»: el vídeo sí, el CV no', () => {
  // OTRO_PRO no ha solicitado a ninguna clínica: lo único que le hace visible
  // es haber elegido «Visible» o «Anónimo».
  const suVideo = (quien) => getDoc(doc(cuenta(quien), `candidatos/${OTRO_PRO}/media/video_0`));
  const suCV = (quien) => getDoc(doc(cuenta(quien), `candidatos/${OTRO_PRO}/media/cv_0`));

  test('una clínica ve el vídeo de quien está en «Anónimo» o en «Visible»', async () => {
    await sembrar(`talento/${OTRO_PRO}`, talentoBase());
    await assertSucceeds(suVideo(CLINICA));
    await sembrar(`talento/${OTRO_PRO}`, talentoBase({ modo: 'visible', nombre: 'Marc', inicial: 'S' }));
    await assertSucceeds(suVideo(OTRA_CLINICA));
  });

  test('el CV NO se ve, ni en «Visible»: solo cuando acepte la invitación', async () => {
    await sembrar(`talento/${OTRO_PRO}`, talentoBase({ modo: 'visible', nombre: 'Marc', inicial: 'S' }));
    await assertFails(suCV(CLINICA));
    await assertFails(suCV(OTRA_CLINICA));
  });

  test('el resto del perfil (nombre entero, teléfono, correo) tampoco se ve', async () => {
    await sembrar(`talento/${OTRO_PRO}`, talentoBase({ modo: 'visible', nombre: 'Marc', inicial: 'S' }));
    await assertFails(getDoc(doc(cuenta(CLINICA), `candidatos/${OTRO_PRO}`)));
  });

  test('de quien eligió «Solo cuando yo solicite» no se ve ni el vídeo', async () => {
    await assertFails(suVideo(CLINICA));   // no tiene perfil en «talento»
    await assertFails(suCV(CLINICA));
  });

  test('un perfil de antes, sin modo elegido, sigue como estaba: su vídeo no se ve', async () => {
    await sembrar(`talento/${OTRO_PRO}`, { profesion: 'Higienista dental', experiencia: 'de 2 a 5 años' });
    await assertFails(suVideo(CLINICA));
  });

  test('quien no es clínica no ve el vídeo, aunque esté en «Visible»', async () => {
    await sembrar(`talento/${OTRO_PRO}`, talentoBase({ modo: 'visible', nombre: 'Marc', inicial: 'S' }));
    await assertFails(suVideo(PRO));
    await assertFails(getDoc(doc(anonimo(), `candidatos/${OTRO_PRO}/media/video_0`)));
    await assertFails(getDoc(doc(sinSesion(), `candidatos/${OTRO_PRO}/media/video_0`)));
  });

  test('el dueño sí ve su vídeo y su CV', async () => {
    await assertSucceeds(suVideo(OTRO_PRO));
    await assertSucceeds(suCV(OTRO_PRO));
  });

  test('la clínica a la que SÍ ha solicitado sigue viendo el vídeo y el CV', async () => {
    await assertSucceeds(getDoc(doc(cuenta(CLINICA), `candidatos/${PRO}/media/video_0`)));
    await assertSucceeds(setDoc(doc(cuenta(PRO), `candidatos/${PRO}/media/cv_0`), { d: 'BBBB' }));
    await assertSucceeds(getDoc(doc(cuenta(CLINICA), `candidatos/${PRO}/media/cv_0`)));
  });
});

describe('Solicitudes: crear', () => {
  test('el profesional crea su solicitud como «enviada»', async () => {
    await assertSucceeds(setDoc(doc(cuenta(OTRO_PRO), `candidaturas/${OFERTA}_${OTRO_PRO}`),
      solicitudBase({ candidatoUid: OTRO_PRO })));
  });
  test('no puede crearla en nombre de otro ni ya «contratada»', async () => {
    await assertFails(setDoc(doc(cuenta(OTRO_PRO), `candidaturas/${OFERTA}_x`), solicitudBase({ candidatoUid: 'x' })));
    await assertFails(setDoc(doc(cuenta(OTRO_PRO), `candidaturas/${OFERTA}_${OTRO_PRO}`),
      solicitudBase({ candidatoUid: OTRO_PRO, estado: 'contratada' })));
    await assertFails(setDoc(doc(cuenta(OTRO_PRO), `candidaturas/otro-id`), solicitudBase({ candidatoUid: OTRO_PRO })));
  });
  test('ni otra persona ni otra clínica la pueden leer', async () => {
    await assertSucceeds(getDoc(doc(cuenta(PRO), `candidaturas/${SOL}`)));
    await assertSucceeds(getDoc(doc(cuenta(CLINICA), `candidaturas/${SOL}`)));
    await assertFails(getDoc(doc(cuenta(OTRO_PRO), `candidaturas/${SOL}`)));
    await assertFails(getDoc(doc(cuenta(OTRA_CLINICA), `candidaturas/${SOL}`)));
  });
});

describe('Solicitudes: lo que decide la clínica', () => {
  test('la clínica marca vista, me interesa, entrevista, contrata', async () => {
    const db = cuenta(CLINICA);
    await assertSucceeds(updateDoc(doc(db, `candidaturas/${SOL}`), { estado: 'vista' }));
    await assertSucceeds(updateDoc(doc(db, `candidaturas/${SOL}`), { interesa: true, interesaFecha: 2 }));
    await assertSucceeds(updateDoc(doc(db, `candidaturas/${SOL}`), { estado: 'entrevista', cita: { dia: '2026-11-20', hora: '10:00' } }));
    await assertSucceeds(updateDoc(doc(db, `candidaturas/${SOL}`), { estado: 'contratada' }));
    await assertSucceeds(updateDoc(doc(db, `candidaturas/${SOL}`), { acogida: { d1: true } }));
  });
  test('la clínica NO puede cambiar los datos del profesional', async () => {
    const db = cuenta(CLINICA);
    for (const campo of ['nombre', 'email', 'telefono', 'disc', 'encaje', 'video', 'cv', 'mensaje', 'candidatoUid']) {
      await assertFails(updateDoc(doc(db, `candidaturas/${SOL}`), { [campo]: 'cambiado' }));
    }
  });
  test('la clínica NO puede «retirar» ni «caducar» una solicitud', async () => {
    await assertFails(updateDoc(doc(cuenta(CLINICA), `candidaturas/${SOL}`), { estado: 'retirada' }));
    await assertFails(updateDoc(doc(cuenta(CLINICA), `candidaturas/${SOL}`), { estado: 'caducada' }));
  });
  test('la clínica no puede tocar una solicitud ya retirada', async () => {
    await sembrar(`candidaturas/${SOL}`, solicitudBase({ estado: 'retirada' }));
    await assertFails(updateDoc(doc(cuenta(CLINICA), `candidaturas/${SOL}`), { estado: 'vista' }));
  });
  test('otra clínica no puede contestar una solicitud que no es suya', async () => {
    await assertFails(updateDoc(doc(cuenta(OTRA_CLINICA), `candidaturas/${SOL}`), { estado: 'vista' }));
  });
});

describe('Solicitudes: lo que hace el profesional', () => {
  test('el profesional puede retirarla, confirmar la cita y escribir', async () => {
    const db = cuenta(PRO);
    await assertSucceeds(updateDoc(doc(db, `candidaturas/${SOL}`), { citaConfirmada: true, chat: [{ t: 'Hola' }] }));
    await assertSucceeds(updateDoc(doc(db, `candidaturas/${SOL}`), { estado: 'retirada' }));
  });
  test('el profesional NO puede tocar lo que decide la clínica', async () => {
    const db = cuenta(PRO);
    await assertFails(updateDoc(doc(db, `candidaturas/${SOL}`), { estado: 'contratada' }));
    await assertFails(updateDoc(doc(db, `candidaturas/${SOL}`), { estado: 'entrevista' }));
    for (const campo of ['nota', 'motivo', 'interesa', 'contrato', 'acogida', 'clinicaId']) {
      await assertFails(updateDoc(doc(db, `candidaturas/${SOL}`), { [campo]: 'cambiado' }));
    }
  });
  test('no puede retirar una solicitud ya contratada o descartada', async () => {
    await sembrar(`candidaturas/${SOL}`, solicitudBase({ estado: 'contratada' }));
    await assertFails(updateDoc(doc(cuenta(PRO), `candidaturas/${SOL}`), { estado: 'retirada' }));
  });
  test('otro profesional no puede tocarla', async () => {
    await assertFails(updateDoc(doc(cuenta(OTRO_PRO), `candidaturas/${SOL}`), { estado: 'retirada' }));
    await assertFails(deleteDoc(doc(cuenta(OTRO_PRO), `candidaturas/${SOL}`)));
  });
});

describe('Contrato (documentos de la solicitud)', () => {
  test('solo se puede subir cuando la persona está contratada, y solo la clínica', async () => {
    await assertFails(setDoc(doc(cuenta(CLINICA), `candidaturas/${SOL}/docs/contrato_0`), { d: 'PDF' }));
    await sembrar(`candidaturas/${SOL}`, solicitudBase({ estado: 'contratada' }));
    await assertSucceeds(setDoc(doc(cuenta(CLINICA), `candidaturas/${SOL}/docs/contrato_0`), { d: 'PDF' }));
    await assertFails(setDoc(doc(cuenta(PRO), `candidaturas/${SOL}/docs/contrato_1`), { d: 'PDF' }));
  });
  test('lo leen las dos partes y nadie más', async () => {
    await sembrar(`candidaturas/${SOL}`, solicitudBase({ estado: 'contratada' }));
    await sembrar(`candidaturas/${SOL}/docs/contrato_0`, { d: 'PDF' });
    await assertSucceeds(getDoc(doc(cuenta(PRO), `candidaturas/${SOL}/docs/contrato_0`)));
    await assertSucceeds(getDoc(doc(cuenta(CLINICA), `candidaturas/${SOL}/docs/contrato_0`)));
    await assertFails(getDoc(doc(cuenta(OTRO_PRO), `candidaturas/${SOL}/docs/contrato_0`)));
    await assertFails(getDoc(doc(cuenta(OTRA_CLINICA), `candidaturas/${SOL}/docs/contrato_0`)));
  });
});

describe('Invitaciones', () => {
  test('el profesional solo puede contestar (estado), no cambiar el resto', async () => {
    await sembrar('invitaciones/i1', { clinicaId: CLINICA, candidatoUid: PRO, estado: 'pendiente', texto: 'Hola' });
    await assertSucceeds(updateDoc(doc(cuenta(PRO), 'invitaciones/i1'), { estado: 'aceptada', respondida: 1 }));
    await assertFails(updateDoc(doc(cuenta(PRO), 'invitaciones/i1'), { texto: 'Cambiado' }));
    await assertFails(getDoc(doc(cuenta(OTRO_PRO), 'invitaciones/i1')));
  });
});

describe('Valoraciones y denuncias', () => {
  test('la valoración tiene que ser de 1 a 5', async () => {
    await assertSucceeds(addDoc(collection(cuenta(PRO), 'valoraciones'), { n: 5 }));
    await assertFails(addDoc(collection(cuenta(PRO), 'valoraciones'), { n: 9 }));
    await assertFails(addDoc(collection(sinSesion(), 'valoraciones'), { n: 3 }));
  });
  test('las denuncias solo se envían; nadie las lee desde la web', async () => {
    await assertSucceeds(addDoc(collection(cuenta(PRO), 'denuncias'), { de: PRO, texto: 'x' }));
    await assertFails(addDoc(collection(cuenta(PRO), 'denuncias'), { de: OTRO_PRO, texto: 'x' }));
    await assertFails(getDocs(collection(cuenta(CLINICA), 'denuncias')));
  });
});

describe('Todo lo demás, cerrado', () => {
  test('una colección que no está en las reglas no se puede leer ni escribir', async () => {
    await assertFails(getDoc(doc(cuenta(CLINICA), 'usuarios/x')));
    await assertFails(setDoc(doc(cuenta(PRO), 'cualquier_cosa/x'), { a: 1 }));
  });
});
