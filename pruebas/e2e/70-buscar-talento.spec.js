// «Buscar talento»: la clínica busca ella misma entre los profesionales de
// toda España. Se cargan de 20 en 20, se ordenan por encaje y cercanía, y de
// los «Anónimo» no se ve ni el nombre ni la foto.
const { test, expect, nuevaVentana, vaciarEmulador, capturar, FIRESTORE, PROYECTO } = require('../apoyo/entorno');
const A = require('../apoyo/acciones');

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
const DISC = (dom, sec) => ({ dom, sec, norm: { D: dom === 'D' ? 90 : 20, I: dom === 'I' ? 90 : 20, S: dom === 'S' ? 90 : 20, C: dom === 'C' ? 90 : 20 } });
const GIRONA = { lat: 41.98, lng: 2.82, prov: 'Girona', n: 'Girona' };
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
