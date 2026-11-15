// «Buscar talento»: la clínica busca ella misma entre los profesionales de
// toda España. Se cargan de 20 en 20, se ordenan por encaje y cercanía, y de
// los «Anónimo» no se ve ni el nombre ni la foto.
const { test, expect, nuevaVentana, vaciarEmulador, capturar, FIRESTORE, PROYECTO } = require('../apoyo/entorno');
const A = require('../apoyo/acciones');
const fs = require('fs');

const base = `http://${FIRESTORE.host}:${FIRESTORE.port}/v1/projects/${PROYECTO}/databases/(default)/documents`;

// Convierte un objeto normal al formato que pide la base de datos por web
function valor(v) {
  if (v === null) return { nullValue: null };
  if (typeof v === 'boolean') return { booleanValue: v };
  if (typeof v === 'number') return { doubleValue: v };
  if (Array.isArray(v)) return { arrayValue: { values: v.map(valor) } };
  if (typeof v === 'object') {
    const fields = {};
    for (const k of Object.keys(v)) fields[k] = valor(v[k]);
    return { mapValue: { fields } };
  }
  return { stringValue: String(v) };
}
// Siembra un perfil de «Buscar talento» saltándose las reglas, como si lo
// hubiera publicado esa persona desde su móvil.
async function sembrarTalento(id, datos) {
  const fields = {};
  for (const k of Object.keys(datos)) fields[k] = valor(datos[k]);
  const r = await fetch(`${base}/talento/${id}`, {
    method: 'PATCH',
    headers: { Authorization: 'Bearer owner', 'Content-Type': 'application/json' },
    body: JSON.stringify({ fields }),
  });
  if (!r.ok) throw new Error('no se ha podido sembrar ' + id + ': ' + (await r.text()));
}
// Deja el perfil privado (hace falta para que existan los trozos del vídeo) y
// sube el vídeo en trozos, igual que lo sube la persona desde su móvil.
async function sembrarVideo(id, ruta, trozos = 3) {
  const b64 = fs.readFileSync(ruta).toString('base64');
  const porTrozo = Math.ceil(b64.length / trozos);
  await fetch(`${base}/candidatos/${id}`, {
    method: 'PATCH',
    headers: { Authorization: 'Bearer owner', 'Content-Type': 'application/json' },
    body: JSON.stringify({ fields: { tipo: valor('candidato'), nombre: valor('No se ve') } }),
  });
  for (let k = 0; k < trozos; k++) {
    const r = await fetch(`${base}/candidatos/${id}/media/video_${k}`, {
      method: 'PATCH',
      headers: { Authorization: 'Bearer owner', 'Content-Type': 'application/json' },
      body: JSON.stringify({ fields: { d: valor(b64.slice(k * porTrozo, (k + 1) * porTrozo)), i: valor(k), n: valor(trozos) } }),
    });
    if (!r.ok) throw new Error('no se ha podido subir el trozo ' + k + ': ' + (await r.text()));
  }
  return { n: trozos, mime: 'video/webm', v: 1 };
}

const DISC = (dom, sec) => ({ dom, sec, norm: { D: dom === 'D' ? 90 : 20, I: dom === 'I' ? 90 : 20, S: dom === 'S' ? 90 : 20, C: dom === 'C' ? 90 : 20 } });
const GIRONA = { lat: 41.98, lng: 2.82, prov: 'Girona', n: 'Girona' };
const OFERTA_HIG = {
  titulo: 'Higienista dental', municipio: 'Girona', jornada: 'Completa · 40 h/semana',
  salarioMin: '22000', salarioMax: '26000', contrato: 'Indefinido',
  convenio: 'Convenio colectivo de clínicas dentales de la provincia',
  horario: ['Mañanas'], tareas: ['Higienes y mantenimientos'], proceso: ['Entrevista'], requisitos: 'Titulación',
};
const MADRID = { lat: 40.42, lng: -3.7, prov: 'Madrid', n: 'Madrid' };

test('Buscar talento: de 20 en 20, con filtros, y los anónimos sin nombre ni foto', async ({ browser }, testInfo) => {
  test.skip(testInfo.project.name !== 'ordenador', 'basta con un tamaño de pantalla');
  await vaciarEmulador();

  // 22 higienistas cerca (para que haga falta más de una página) + 1 ortodoncista
  // + 1 perfil de los de antes, sin elección hecha, que se trata como anónimo.
  for (let i = 0; i < 22; i++) {
    const visible = i % 2 === 0;
    await sembrarTalento('hig-' + String(i).padStart(2, '0'), {
      modo: visible ? 'visible' : 'anonimo',
      profesion: 'Higienista dental',
      experiencia: 'De 3 a 5 años',
      jornada: 'Completa',
      disponibilidad: 'Ya',
      disc: DISC(i === 0 ? 'C' : 'S', 'I'),
      geo: GIRONA, radio: 25, video: true, cv: true, colegiado: false,
      ocultar: [], actualizado: '2026-11-15T09:00:00.000Z',
      ...(visible ? { nombre: 'Nombre' + i, inicial: 'A' } : {}),
    });
  }
  await sembrarTalento('orto-1', {
    modo: 'visible', profesion: 'Ortodoncista', experiencia: 'Más de 5 años',
    jornada: 'Parcial', disponibilidad: 'En un mes', disc: DISC('D', 'C'),
    geo: MADRID, radio: 50, video: false, cv: true, colegiado: true,
    ocultar: [], actualizado: '2026-11-15T09:00:00.000Z', nombre: 'Marc', inicial: 'S',
  });
  await sembrarTalento('antigua-1', { profesion: 'Higienista dental', experiencia: 'De 3 a 5 años' });

  const v = await nuevaVentana(browser, testInfo);
  const c = v.page;
  await A.registrarClinica(c, 'buscar-clinica@prueba.es');
  await A.configurarClinica(c, {}, { ...A.CLINICA, clinica: 'Clínica Buscadora' });
  await A.publicarOferta(c, {
    titulo: 'Higienista dental', municipio: 'Girona', jornada: 'Completa · 40 h/semana',
    salarioMin: '22000', salarioMax: '26000', contrato: 'Indefinido',
    convenio: 'Convenio colectivo de clínicas dentales de la provincia',
    horario: ['Mañanas'], tareas: ['Higienes y mantenimientos'], proceso: ['Entrevista'], requisitos: 'Titulación',
  });

  // 1. Desde Candidatos se entra a la pantalla nueva
  await c.evaluate(() => showScreen('portal'));
  const acceso = c.locator('.talento-acceso').locator('visible=true').first();
  await expect(acceso).toBeVisible({ timeout: 20_000 });
  await expect(acceso).toContainText('10 de 10 invitaciones esta semana');
  await acceso.click();
  await expect(c.locator('#screen-buscar')).toBeVisible();

  // 2. En el menú queda justo debajo de «Candidatos»
  const menu = c.locator('.shell-nav-item').locator('visible=true');
  const orden = await menu.allInnerTexts();
  expect(orden.indexOf('Buscar talento')).toBe(orden.indexOf('Candidatos') + 1);

  // 3. Trae 20, no los 24 de golpe
  const tarjetas = c.locator('#buscar-box .bt-card');
  await expect(tarjetas).toHaveCount(20, { timeout: 20_000 });
  await capturar(c, 'clinica-70-buscar-talento');

  // 4. «Ver más» trae el resto (24 en total: 22 higienistas + 1 ortodoncista + 1 de antes)
  await c.locator('#bt-mas').click();
  await expect(tarjetas).toHaveCount(24, { timeout: 20_000 });
  await expect(c.locator('#buscar-box')).toContainText('24 profesionales');

  // 5. De los «Anónimo» no se ve el nombre; de los «Visible», nombre e inicial
  await expect(c.locator('#buscar-box .bt-anon').first()).toBeVisible();
  await expect(c.locator('#buscar-box .bt-n', { hasText: 'Nombre0 A.' })).toHaveCount(1);
  const anon = c.locator('#buscar-box .bt-card', { hasText: 'Anónimo' }).first();
  await expect(anon).not.toContainText('Nombre');
  await expect(anon.locator('img')).toHaveCount(0);

  // 6. El perfil de los de antes (sin elección) se trata como anónimo
  await expect(c.locator('#buscar-box .bt-card', { hasText: 'Anónimo' })).toHaveCount(12); // 11 anónimos + el de antes

  // 7. Filtro de profesión: se lo pide a la base de datos, y solo queda el ortodoncista
  await c.getByRole('button', { name: 'Ortodoncista', exact: true }).click();
  await expect(tarjetas).toHaveCount(1, { timeout: 20_000 });
  await expect(tarjetas.first()).toContainText('Marc S.');
  await expect(c.locator('#buscar-box')).toContainText('No hay más profesionales');

  // 8. Filtro de distancia: el ortodoncista está en Madrid, así que a 25 km no sale
  await c.getByRole('button', { name: '25 km', exact: true }).click();
  await expect(tarjetas).toHaveCount(0);
  await c.getByRole('button', { name: 'Toda España', exact: true }).click();
  await expect(tarjetas).toHaveCount(1);

  // 9. Y volviendo a «Todas», están otra vez todos
  await c.getByRole('button', { name: 'Todas', exact: true }).first().click();
  await expect(tarjetas).toHaveCount(20, { timeout: 20_000 });

  // 10. El botón «Invitar» abre su ventana con la oferta y el mensaje
  await c.locator('#buscar-box .bt-inv-b').first().click();
  await expect(c.locator('#modal-inv')).toBeVisible();
  await expect(c.locator('#modal-inv')).toContainText('Invitar a solicitar');
  await c.locator('#modal-inv').getByRole('button', { name: 'Cancelar' }).click();

  expect(c.erroresPagina).toEqual([]);
  await v.context.close();
});

test('Verlos en vídeo: uno detrás de otro, y se puede invitar sin salir', async ({ browser }, testInfo) => {
  test.skip(testInfo.project.name !== 'ordenador', 'basta con un tamaño de pantalla');
  await vaciarEmulador();

  // Dos profesionales con vídeo (una «Visible» y otro «Anónimo») y una sin vídeo
  const meta = await sembrarVideo('vid-1', A.archivo('video-vertical.webm'), 3);
  const meta2 = await sembrarVideo('vid-2', A.archivo('video-vertical.webm'), 3);
  await sembrarTalento('vid-1', {
    modo: 'visible', profesion: 'Higienista dental', experiencia: 'De 3 a 5 años',
    jornada: 'Completa', disponibilidad: 'Ya', disc: DISC('S', 'I'), geo: GIRONA, radio: 25,
    video: true, videoMeta: meta, cv: true, colegiado: false, ocultar: [],
    actualizado: '2026-11-15T09:00:00.000Z', nombre: 'Ana', inicial: 'R',
  });
  await sembrarTalento('vid-2', {
    modo: 'anonimo', profesion: 'Higienista dental', experiencia: 'Más de 5 años',
    jornada: 'Parcial', disponibilidad: 'En un mes', disc: DISC('C', 'S'), geo: GIRONA, radio: 25,
    video: true, videoMeta: meta2, cv: false, colegiado: false, ocultar: [],
    actualizado: '2026-11-15T09:00:00.000Z',
  });
  await sembrarTalento('sin-video', {
    modo: 'visible', profesion: 'Higienista dental', experiencia: 'De 3 a 5 años',
    jornada: 'Completa', disponibilidad: 'Ya', disc: DISC('I', 'D'), geo: GIRONA, radio: 25,
    video: false, videoMeta: null, cv: false, colegiado: false, ocultar: [],
    actualizado: '2026-11-15T09:00:00.000Z', nombre: 'Sin', inicial: 'V',
  });

  const v = await nuevaVentana(browser, testInfo);
  const c = v.page;
  await A.registrarClinica(c, 'videos-clinica@prueba.es');
  await A.configurarClinica(c, {}, { ...A.CLINICA, clinica: 'Clínica de los Vídeos' });
  await c.evaluate(() => showScreen('buscar'));
  await expect(c.locator('#buscar-box .bt-card')).toHaveCount(3, { timeout: 20_000 });

  // 1. El botón cuenta solo a quien tiene vídeo (2 de los 3)
  const boton = c.locator('#bt-videos');
  await expect(boton).toContainText('Verlos en vídeo');
  await expect(boton.locator('.bt-vid-n')).toHaveText('2');
  await boton.click();

  // 2. El primer vídeo se monta de verdad a partir de sus tres trozos
  const visor = c.locator('#bt-visor');
  await expect(visor).toBeVisible();
  await expect(visor).toContainText('1 de 2');
  await expect(visor).toContainText('Ana R.');
  const video = visor.locator('video');
  await expect(video).toHaveCount(1, { timeout: 30_000 });
  await expect(video).toHaveAttribute('src', /^blob:/);
  expect(await video.evaluate((el) => new Promise((ok) => {
    if (el.readyState >= 1) return ok(el.duration);
    el.onloadedmetadata = () => ok(el.duration);
    setTimeout(() => ok(0), 15000);
  }))).toBeGreaterThan(0);

  // 3. «Siguiente» pasa al segundo, que es anónimo: sin nombre
  await visor.getByRole('button', { name: 'Siguiente' }).click();
  await expect(visor).toContainText('2 de 2');
  await expect(visor).toContainText('Anónimo');
  await expect(visor).not.toContainText('Ana R.');
  await expect(visor.locator('video')).toHaveCount(1, { timeout: 30_000 });
  await capturar(c, 'clinica-71-verlos-en-video', { tapar: [visor.locator('video')] });

  // 4. Esta clínica no tiene ninguna oferta publicada: se invita siempre a una
  //    oferta, así que se le dice en vez de no hacer nada (la ventana de
  //    invitar con oferta se comprueba en la prueba de arriba).
  await visor.getByRole('button', { name: 'Invitar' }).click();
  await expect(c.getByText('Para invitar a alguien necesitas una oferta publicada.')).toBeVisible();
  await expect(c.locator('#modal-inv')).toHaveCount(0);

  // 5. Se cierra con la tecla Escape
  await c.keyboard.press('Escape');
  await expect(visor).toHaveCount(0);

  expect(c.erroresPagina).toEqual([]);
  await v.context.close();
});

test('«Solo cuando yo solicite»: desaparece de la búsqueda, y al volver a «Visible» reaparece', async ({ browser }, testInfo) => {
  test.skip(testInfo.project.name !== 'ordenador', 'basta con un tamaño de pantalla');
  await vaciarEmulador();

  // Una profesional que NO ha solicitado a nadie: así lo único que decide si
  // sale en la búsqueda es su elección, no el haber solicitado.
  const vp = await nuevaVentana(browser, testInfo);
  const p = vp.page;
  await A.registrarProfesional(p, 'elige@prueba.es');
  await A.altaProfesional(p);
  await p.check('#t-consent');
  await p.getByRole('button', { name: 'Empezar el test' }).click();
  await A.contestarTestProfesional(p, { pesos: { D: 1, I: 3, S: 2, C: 4 } });
  await p.click('#tr-btn');
  await A.elegirComoTeVen(p, 'visible');
  await p.locator('#gu-next').waitFor();
  await p.evaluate(() => guiaCerrar());

  const vc = await nuevaVentana(browser, testInfo);
  const c = vc.page;
  await A.registrarClinica(c, 'elige-clinica@prueba.es');
  await A.configurarClinica(c, {}, { ...A.CLINICA, clinica: 'Clínica que Busca' });
  const tarjetas = c.locator('#buscar-box .bt-card');
  // La lista se vuelve a pedir cada vez que se entra en la pantalla
  const mirar = async () => {
    await c.evaluate(() => showScreen('inicio'));
    await c.evaluate(() => showScreen('buscar'));
  };
  // Antes de que mire la clínica, se espera a que la elección esté guardada
  const yaGuardado = async (debeSalir) => {
    await expect.poll(() => p.evaluate(() => firebase.firestore().collection('talento').doc(Nube.uid)
      .get().then((d) => d.exists)), { timeout: 20_000 }).toBe(debeSalir);
  };

  // 1. En «Visible» sale, con su nombre de pila y la inicial
  await yaGuardado(true);
  await mirar();
  await expect(tarjetas).toHaveCount(1, { timeout: 20_000 });
  await expect(tarjetas.first()).toContainText('Laura P.');
  await expect(tarjetas.first().locator('img')).toHaveCount(0); // no tiene foto puesta

  // 2. Elige «Solo cuando yo solicite» desde Mi perfil
  await p.evaluate(() => ir('perfil'));
  await p.locator('#aj-comoteven .ctv-op[data-k="solicito"]').click();
  await expect(p.getByText('Ya no apareces en las búsquedas de las clínicas.')).toBeVisible();

  // 3. Ya no sale. Y no es porque haya solicitado: no ha solicitado nada.
  expect(await p.evaluate(() => S.sols.length)).toBe(0);
  await yaGuardado(false);
  await mirar();
  await expect(tarjetas).toHaveCount(0, { timeout: 20_000 });
  await expect(c.locator('#buscar-box')).toContainText('Nadie encaja con estos filtros');

  // 4. Vuelve a «Visible» y reaparece
  await p.waitForTimeout(700);  // la web ignora dos cambios seguidos en menos de 0,6 s
  await p.locator('#aj-comoteven .ctv-op[data-k="visible"]').click();
  await expect(p.getByText('Las clínicas te ven como «Visible».')).toBeVisible();
  await yaGuardado(true);
  await mirar();
  await expect(tarjetas).toHaveCount(1, { timeout: 20_000 });
  await expect(tarjetas.first()).toContainText('Laura P.');

  expect(c.erroresPagina).toEqual([]);
  expect(p.erroresPagina).toEqual([]);
  await vp.context.close(); await vc.context.close();
});

test('Una clínica sin pueblo: aviso, y del anónimo nunca se dice su pueblo', async ({ browser }, testInfo) => {
  test.skip(testInfo.project.name !== 'ordenador', 'basta con un tamaño de pantalla');
  await vaciarEmulador();

  // Alguien en «Anónimo» que vive en un pueblo pequeño
  await sembrarTalento('anon-pueblo', {
    modo: 'anonimo', profesion: 'Higienista dental', experiencia: 'De 3 a 5 años',
    jornada: 'Completa', disponibilidad: 'Ya', disc: DISC('S', 'I'),
    geo: { lat: 40.9, lng: -5.9, prov: 'Salamanca', n: 'Galindo y Perahuy' },
    radio: 25, video: false, videoMeta: null, cv: true, colegiado: false,
    ocultar: [], actualizado: '2026-11-15T09:00:00.000Z',
  });

  // Una clínica cuya dirección no es un pueblo, así que no se pueden medir km
  const v = await nuevaVentana(browser, testInfo);
  const c = v.page;
  await A.registrarClinica(c, 'sin-pueblo@prueba.es');
  await A.configurarClinica(c, {}, { ...A.CLINICA, clinica: 'Clínica Sin Pueblo' });
  await A.publicarOferta(c, OFERTA_HIG);   // hace falta una oferta para poder invitar
  // Su dirección es «Castilla y León», sin pueblo: así no se pueden medir km.
  // Se cambia en la nube y en el navegador, porque la ficha se sincroniza.
  await c.evaluate(async () => {
    await firebase.firestore().collection('clinicas').doc(Nube.uid).set({ ciutat: 'Castilla y León' }, { merge: true });
    await firebase.firestore().collection('clinicas_publicas').doc(Nube.uid).set({ ciutat: 'Castilla y León' }, { merge: true });
  });
  await c.reload();
  await expect.poll(() => c.evaluate(() => (CDB.clinica() || {}).ciutat), { timeout: 20_000 }).toBe('Castilla y León');
  // Y tampoco ha puesto la dirección desde la que se miden los km
  await c.evaluate(() => { const i = document.getElementById('clinic-address-portal'); if (i) i.value = ''; });
  await c.evaluate(() => showScreen('buscar'));
  // no se puede medir ninguna distancia
  expect(await c.evaluate(() => CERCO_origenClinica())).toBeNull();

  const caja = c.locator('#buscar-box');
  await expect(caja.locator('.bt-card')).toHaveCount(1, { timeout: 20_000 });

  // 1. Se avisa de que falta el pueblo, con el camino para ponerlo
  await expect(caja.locator('.bt-aviso')).toContainText('Pon el pueblo de tu clínica para ver distancias');

  // 2. Su pueblo NO sale por ningún lado: como no hay km, sale su provincia
  await expect(caja).not.toContainText('Galindo y Perahuy');
  await expect(caja.locator('.bt-card').first()).toContainText('Salamanca');
  await capturar(c, 'clinica-74-buscar-sin-pueblo');

  // 3. Tampoco en su ficha
  await caja.locator('.bt-card').first().click();
  const ficha = c.locator('#screen-talento');
  await expect(ficha).toBeVisible();
  await expect(ficha).not.toContainText('Galindo y Perahuy');
  await expect(ficha).toContainText('Salamanca');

  // 4. Ni en la ventana de invitar
  await ficha.getByRole('button', { name: 'Invitar a solicitar' }).click();
  await expect(c.locator('#modal-inv')).toBeVisible();
  await expect(c.locator('#modal-inv')).not.toContainText('Galindo y Perahuy');

  expect(c.erroresPagina).toEqual([]);
  await v.context.close();
});

test('La ficha del profesional: lo que se ve y lo que no', async ({ browser }, testInfo) => {
  test.skip(testInfo.project.name !== 'ordenador', 'basta con un tamaño de pantalla');
  await vaciarEmulador();

  const comun = {
    profesion: 'Higienista dental', experiencia: 'De 3 a 5 años', jornada: 'Completa',
    disponibilidad: 'Ya', disc: DISC('C', 'I'), geo: GIRONA, radio: 25,
    video: false, videoMeta: null, cv: true, colegiado: true,
    fuertes: ['Trato con el paciente', 'Precisión'],
    titulacion: 'Técnico Superior en Higiene Bucodental',
    ocultar: [], actualizado: '2026-11-15T09:00:00.000Z',
  };
  await sembrarTalento('ficha-vis', {
    ...comun, modo: 'visible', nombre: 'Ana', inicial: 'R',
    resumen: 'Me gusta el trato con el paciente y trabajar con calma.',
    trabajos: [{ puesto: 'Higienista dental', centro: 'Clínica Sonrisa', tiempo: '5 años' }],
  });
  await sembrarTalento('ficha-anon', { ...comun, modo: 'anonimo', experiencia: 'Más de 5 años' });

  const v = await nuevaVentana(browser, testInfo);
  const c = v.page;
  await A.registrarClinica(c, 'ficha-clinica@prueba.es');
  await A.configurarClinica(c, {}, { ...A.CLINICA, clinica: 'Clínica de la Ficha' });
  await A.publicarOferta(c, OFERTA_HIG);
  await c.evaluate(() => showScreen('buscar'));
  await expect(c.locator('#buscar-box .bt-card')).toHaveCount(2, { timeout: 20_000 });

  // 1. La ficha de quien está «Visible»
  await c.locator('#buscar-box .bt-card', { hasText: 'Ana R.' }).click();
  const f = c.locator('#screen-talento');
  await expect(f).toBeVisible();
  await expect(f).toContainText('Ana R.');
  await expect(f).toContainText('Higienista dental');
  await expect(f).toContainText('de 3 a 5 años');
  await expect(f).toContainText('Concienzudo');
  await expect(f).toContainText('Técnico Superior en Higiene Bucodental');
  await expect(f).toContainText('Me gusta el trato con el paciente');
  await expect(f).toContainText('Clínica Sonrisa');
  await expect(f).toContainText('Trato con el paciente');
  await expect(f).toContainText('Se desplaza hasta 25 km');
  await expect(f).toContainText('Encaje con');
  await expect(f.getByRole('button', { name: 'Invitar a solicitar' })).toBeVisible();
  await capturar(c, 'clinica-75-ficha-profesional');

  // 2. Lo que NO se ve hasta que acepte
  await expect(f).toContainText('Su nombre completo, su teléfono, su correo y su CV los verás cuando acepte');
  await expect(f).not.toContainText('@');
  await expect(f).not.toContainText('Descargar CV');

  // 3. Volver, y la ficha de quien está «Anónimo»
  await f.getByRole('button', { name: 'Volver a Buscar talento' }).click();
  await expect(c.locator('#screen-buscar')).toBeVisible();
  await c.locator('#buscar-box .bt-card', { hasText: 'Anónimo' }).click();
  await expect(f).toContainText('Anónimo');
  await expect(f).toContainText('Técnico Superior en Higiene Bucodental');  // la titulación sí
  await expect(f).not.toContainText('Ana');
  await expect(f).not.toContainText('Clínica Sonrisa');
  await expect(f).not.toContainText('Me gusta el trato con el paciente y trabajar con calma');
  await expect(f).toContainText('Ha elegido estar en anónimo');
  await expect(f.locator('img')).toHaveCount(0);

  expect(c.erroresPagina).toEqual([]);
  await v.context.close();
});
