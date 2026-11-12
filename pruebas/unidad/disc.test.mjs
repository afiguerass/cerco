// Pruebas del módulo del test DISC (src/comun/disc.js).
// La más importante: con las mismas respuestas, da EXACTAMENTE el mismo
// resultado que las funciones que había antes en la web (guardado en
// referencia-disc.json). Si esta prueba falla, cambiaría la puntuación de
// tests ya hechos por clínicas reales.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { LETRAS, calcularPerfil, barajarPreguntas, perfilesDeOferta, porcentajeEncaje } from '../../src/comun/disc.js';

const REF = JSON.parse(readFileSync(new URL('./referencia-disc.json', import.meta.url)));

// Math.random con semilla, igual que al generar la referencia
function conSemilla(semilla, fn) {
  const orig = Math.random; let s = semilla;
  Math.random = () => { s = (s * 1664525 + 1013904223) % 4294967296; return s / 4294967296; };
  try { return fn(); } finally { Math.random = orig; }
}

test('la puntuación no cambia: 2.000 tests dan lo mismo que antes', () => {
  for (const c of REF.casos) {
    const r = conSemilla(c.semilla, () => calcularPerfil(c.lista, LETRAS));
    assert.deepEqual(JSON.parse(JSON.stringify(r)), c.res);
  }
});

test('el orden aleatorio de las frases no cambia', () => {
  for (const b of REF.barajar) assert.deepEqual(conSemilla(b.semilla, () => barajarPreguntas(b.n)), b.res);
});

test('el % de encaje no cambia: 2.000 casos dan lo mismo que antes', () => {
  for (const e of REF.encajes) assert.equal(porcentajeEncaje(e.norm, perfilesDeOferta(e.oferta)), e.res);
});

test('todo igual → «sin definir»; contestado de verdad → perfil', () => {
  const plano = Array.from({ length: 15 }, () => [2, 2, 2, 2]);
  assert.equal(calcularPerfil(plano, LETRAS).definido, false);
  const claro = Array.from({ length: 15 }, () => [1, 3, 2, 4]); // C, luego I
  const r = calcularPerfil(claro, LETRAS);
  assert.equal(r.definido, true);
  assert.deepEqual(r.ord.slice(0, 2), ['C', 'I']);
  assert.deepEqual(r.norm, { D: 0, I: 67, S: 33, C: 100 });
});

test('poner un 4 a todo no sube nada (no se puede hacer trampa)', () => {
  const todo4 = Array.from({ length: 15 }, () => [4, 4, 4, 4]);
  assert.deepEqual(calcularPerfil(todo4, LETRAS).norm, { D: 50, I: 50, S: 50, C: 50 });
});

test('encaje: entre 30 y 97, y null sin datos', () => {
  assert.equal(porcentajeEncaje({ D: 0, I: 67, S: 33, C: 100 }, ['I', 'C']), 97);
  assert.equal(porcentajeEncaje({ D: 100, I: 0, S: 0, C: 0 }, ['I', 'C']), 30);
  assert.equal(porcentajeEncaje(null, ['I', 'C']), null);
  assert.equal(porcentajeEncaje({ D: 50, I: 50, S: 50, C: 50 }, []), null);
  assert.deepEqual(perfilesDeOferta({ disc: 'I + C' }), ['I', 'C']);
  assert.deepEqual(perfilesDeOferta({ perfiles: ['S', 'X', 'D'] }), ['S', 'D']);
});
