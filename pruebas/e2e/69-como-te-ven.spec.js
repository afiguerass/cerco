// «Cómo te ven las clínicas»: la persona elige una de tres opciones y eso
// decide qué se publica de ella. El apellido entero, el teléfono, el correo
// y el CV no se publican nunca.
const { test, expect, nuevaVentana, vaciarEmulador, FIRESTORE, PROYECTO } = require('../apoyo/entorno');
const A = require('../apoyo/acciones');

// Lo que la clínica vería de esta persona en «Buscar talento» (null = no aparece)
const enTalento = (page) => page.evaluate(async () => {
  while (!(window.firebase && firebase.apps && firebase.apps.length && firebase.auth().currentUser)) await new Promise((r) => setTimeout(r, 200));
  const d = await firebase.firestore().collection('talento').doc(firebase.auth().currentUser.uid).get();
  return d.exists ? d.data() : null;
});

test('La elección decide qué se publica, y se puede cambiar cuando quiera', async ({ browser }, testInfo) => {
  test.skip(testInfo.project.name !== 'ordenador', 'basta con un tamaño de pantalla');
  await vaciarEmulador();
  const v = await nuevaVentana(browser, testInfo);
  const p = v.page;
  await A.registrarProfesional(p, 'modo-pro@prueba.es');
  await A.altaProfesional(p);
  await p.check('#t-consent');
  await p.getByRole('button', { name: 'Empezar el test' }).click();
  await A.contestarTestProfesional(p, { pesos: { D: 1, I: 3, S: 2, C: 4 } });
  await p.click('#tr-btn');

  // 1. La pregunta sale sola después del test y hay que contestarla:
  //    ninguna opción viene marcada y el botón no deja seguir sin elegir.
  await expect(p.locator('#md-ops')).toBeVisible();
  await expect(p.locator('#md-ops .ctv-op.on')).toHaveCount(0);
  await expect(p.locator('#md-btn')).toBeDisabled();
  // El aviso del vídeo se lee ANTES de elegir «Anónimo»
  await expect(p.locator('#md-ops .ctv-op[data-k="anonimo"]'))
    .toContainText('Tu vídeo se ve: si sales en él, la clínica verá tu cara.');

  // 2. «Anónimo»: ni nombre, ni inicial, ni foto
  await p.locator('#md-ops .ctv-op[data-k="anonimo"]').click();
  await expect(p.locator('#md-btn')).toBeEnabled();
  await p.click('#md-btn');
  await p.locator('#gu-next').waitFor();
  await p.evaluate(() => guiaCerrar());
  let t = await enTalento(p);
  expect(t.modo).toBe('anonimo');
  expect(t.profesion).toBe(A.PROFESIONAL.profesion);
  expect(t.nombre).toBeUndefined();
  expect(t.inicial).toBeUndefined();
  expect(t.fotoMini).toBeUndefined();

  // 3. En ningún caso se publican el apellido entero, el teléfono, el correo ni el CV
  const prohibido = (d) => Object.keys(d).filter((k) => ['telefono', 'email', 'correo', 'apellido', 'nombreCompleto'].includes(k))
    .concat(typeof d.cv === 'string' ? ['cv con contenido'] : []);
  expect(prohibido(t)).toEqual([]);

  // 4. Se cambia desde Mi perfil, y se aplica al momento
  await p.evaluate(() => ir('perfil'));
  const tarjeta = p.locator('#aj-comoteven');
  await expect(tarjeta).toBeVisible();
  await expect(tarjeta.locator('.ctv-op[data-k="anonimo"]')).toHaveClass(/\bon\b/);

  await tarjeta.locator('.ctv-op[data-k="visible"]').click();
  await expect(p.getByText('Las clínicas te ven como «Visible».')).toBeVisible();
  await expect.poll(() => enTalento(p).then((x) => x && x.modo)).toBe('visible');
  t = await enTalento(p);
  // Nombre de pila e inicial del apellido: «Laura P.», nunca «Laura Prueba»
  expect(t.nombre).toBe('Laura');
  expect(t.inicial).toBe('P');
  expect(JSON.stringify(t)).not.toContain('Prueba');
  expect(JSON.stringify(t)).not.toContain(A.PROFESIONAL.telefono);
  expect(prohibido(t)).toEqual([]);

  // 5. «Solo cuando yo solicite»: desaparece de las búsquedas
  await p.waitForTimeout(700); // la web ignora dos cambios seguidos en menos de 0,6 s
  await tarjeta.locator('.ctv-op[data-k="solicito"]').click();
  await expect(p.getByText('Ya no apareces en las búsquedas de las clínicas.')).toBeVisible();
  await expect.poll(() => enTalento(p)).toBeNull();

  expect(p.erroresPagina).toEqual([]);
  await v.context.close();
});

test('A quien ya tenía cuenta se le pregunta, y hasta que elija se queda como estaba', async ({ browser }, testInfo) => {
  test.skip(testInfo.project.name !== 'ordenador', 'basta con un tamaño de pantalla');
  await vaciarEmulador();
  const v = await nuevaVentana(browser, testInfo);
  const p = v.page;
  await A.registrarProfesional(p, 'modo-antigua@prueba.es');
  await A.altaProfesional(p);
  await p.check('#t-consent');
  await p.getByRole('button', { name: 'Empezar el test' }).click();
  await A.contestarTestProfesional(p, { pesos: { D: 1, I: 3, S: 2, C: 4 } });
  await p.click('#tr-btn');
  await A.elegirComoTeVen(p, 'anonimo');
  await p.locator('#gu-next').waitFor();
  await p.evaluate(() => guiaCerrar());

  // Se deja la cuenta como estaban las de antes: con su perfil publicado pero
  // sin haber elegido nunca. Un perfil así ya no se puede escribir desde la
  // web (lo prohíben las reglas nuevas, que es justo lo que queremos), así que
  // se siembra saltándoselas, como estaba antes de este cambio.
  const uid = await p.evaluate(() => Nube.uid);
  const base = `http://${FIRESTORE.host}:${FIRESTORE.port}/v1/projects/${PROYECTO}/databases/(default)/documents`;
  const campos = async (col) => {
    const r = await fetch(`${base}/${col}/${uid}`, { headers: { Authorization: 'Bearer owner' } });
    return r.ok ? ((await r.json()).fields || {}) : null;
  };
  // Al cerrar la guía, la web guarda el perfil otra vez. Se espera a que acabe:
  // si no, ese guardado pisaría lo que la prueba cambia a continuación.
  await expect.poll(() => campos('candidatos').then((f) => !!(f && f.guia)), { timeout: 20_000 }).toBe(true);
  // Se lee de la base de datos, no del navegador: el navegador guarda su propia
  // copia y no vería lo que se siembra por fuera.
  const enTalentoReal = async () => {
    const f = await campos('talento');
    if (!f) return null;
    const out = {};
    for (const k of Object.keys(f)) out[k] = f[k].stringValue !== undefined ? f[k].stringValue : f[k];
    return out;
  };
  // Primero se le quita la elección, y se recarga: así la web ya no tiene
  // ningún «modo» en memoria y no puede volver a publicar nada.
  await p.evaluate(async () => {
    const db = firebase.firestore(), u = firebase.auth().currentUser.uid;
    await db.collection('candidatos').doc(u).update({
      modo: firebase.firestore.FieldValue.delete(),
      modoFecha: firebase.firestore.FieldValue.delete(),
      visible: true,
    });
  });
  await expect.poll(() => campos('candidatos').then((f) => !!(f && f.modo)), { timeout: 20_000 }).toBe(false);

  // Y después se deja su perfil publicado como estaba antes de este cambio:
  // sin «modo». Se borra primero, porque un PATCH solo cambia los campos que
  // se le dan y el «modo» anterior se quedaría.
  await fetch(`${base}/talento/${uid}`, { method: 'DELETE', headers: { Authorization: 'Bearer owner' } });
  const r = await fetch(`${base}/talento/${uid}`, {
    method: 'PATCH',
    headers: { Authorization: 'Bearer owner', 'Content-Type': 'application/json' },
    body: JSON.stringify({ fields: { profesion: { stringValue: 'Higienista dental' }, experiencia: { stringValue: 'De 3 a 5 años' } } }),
  });
  expect(r.ok).toBe(true);

  // Vuelve a entrar en CERCO, como cualquier día (ventana nueva: así se lee lo
  // que hay de verdad en la base de datos y no la copia del navegador anterior)
  await v.context.close();
  const v2 = await nuevaVentana(browser, testInfo);
  const q = v2.page;
  await q.goto('/candidato.html');
  await q.getByRole('button', { name: 'Ya tengo cuenta' }).first().click();
  await q.fill('#li-email', 'modo-antigua@prueba.es');
  await q.fill('#li-pwd', A.PROFESIONAL.pwd);
  await q.click('#li-btn');

  // Al entrar se le pregunta: el Inicio le ofrece elegir
  const aviso = q.locator('#in2 .in2-sug', { hasText: 'Que te encuentren' });
  await expect(aviso).toBeVisible({ timeout: 20_000 });

  // Mientras no elige, su perfil se queda tal cual: nadie se lo toca
  await q.evaluate(() => ir('perfil'));
  await q.evaluate(() => ir('inicio'));
  let t = await enTalentoReal();
  expect(t.modo).toBeUndefined();
  expect(t.experiencia).toBe('De 3 a 5 años');

  // Al pulsar «Elegir» se abre la pregunta, también sin ninguna opción marcada
  await aviso.getByRole('button', { name: 'Elegir' }).click();
  await expect(q.locator('#md-ops')).toBeVisible();
  await expect(q.locator('#md-ops .ctv-op.on')).toHaveCount(0);
  await expect(q.locator('#md-btn')).toBeDisabled();

  // Al elegir, ya se publica con su elección
  await q.locator('#md-ops .ctv-op[data-k="visible"]').click();
  await q.click('#md-btn');
  await expect.poll(() => enTalentoReal().then((x) => x && x.modo), { timeout: 20_000 }).toBe('visible');
  t = await enTalentoReal();
  expect(t.nombre).toBe('Laura');
  expect(t.inicial).toBe('P');

  expect(q.erroresPagina).toEqual([]);
  await v2.context.close();
});
