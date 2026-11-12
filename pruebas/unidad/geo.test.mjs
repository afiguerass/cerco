// Pruebas de los municipios y las distancias (public/datos/municipios.js +
// public/comun/geo.js). Comprueban que, después de sacar la lista a un archivo
// aparte, se encuentra lo mismo y se calculan los mismos km que antes
// (referencia-geo.json se sacó del código original).
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import vm from 'node:vm';

const REF = JSON.parse(readFileSync(new URL('./referencia-geo.json', import.meta.url)));
const ctx = { window: {}, document: {} };
vm.createContext(ctx);
for (const f of ['../../public/datos/municipios.js', '../../public/comun/geo.js']) {
  vm.runInContext(readFileSync(new URL(f, import.meta.url), 'utf8'), ctx);
}
const G = ctx.window.CGeo;

test('están todos los municipios', () => assert.equal(G.todos().length, REF.total));

test('las direcciones y municipios se entienden igual que antes', () => {
  REF.entradas.forEach((t, i) => {
    const r = G.lugar(t);
    assert.deepEqual(r ? { n: r.n, p: r.p, lat: r.lat, lng: r.lng } : null, REF.lugar[i], t);
  });
});

test('el buscador propone lo mismo que antes', () => {
  for (const b of REF.busq) assert.deepEqual([...G.buscar(b.q, 8, b.cerca)].map((x) => x.n + '|' + x.p), b.res, b.q);
});

test('los km y los radios dan lo mismo que antes', () => {
  for (const k of REF.km) {
    assert.equal(G.km(k.a, k.b), k.res);
    assert.equal(G.dentro(k.a, k.b, [10, 25, 50, 'prov', 'todo'][REF.km.indexOf(k) % 5]), k.dentro);
  }
});

test('Salt está a 3 km de Girona', () => assert.equal(G.km(G.lugar('Salt'), G.lugar('Girona')), 3));
