// TEST DISC Y % DE ENCAJE — un único módulo para los dos lados de CERCO
// (clínica y profesional), para que se calcule siempre igual y se pueda
// comparar a los candidatos con los equipos de las clínicas.
//
// IMPORTANTE: hay clínicas con tests ya hechos. Estas funciones son copia
// exacta de las que había en index.html y candidato.html, y las pruebas de
// pruebas/unidad/ comprueban que dan exactamente los mismos resultados que
// antes. No se puede cambiar la forma de puntuar.

export const LETRAS = ['D', 'I', 'S', 'C'];

/* ---- Test DISC con notas libres (se puede repetir número) ----
   Cada frase cuenta por cuánto queda por encima o por debajo de la
   media de SU pregunta. Así, poner un 4 a todo no sube nada: una
   pregunta con las cuatro notas iguales no cuenta. Es lo que evita
   la trampa sin obligar a ordenar.
   lista: una fila por pregunta con las 4 notas [D, I, S, C] (1 a 4). */
export function calcularPerfil(lista, letras) {
  var p = {D:0,I:0,S:0,C:0}, planas = 0, N = lista.length || 1, norm = {};
  lista.forEach(function(r){
    var m = (r[0]+r[1]+r[2]+r[3]) / 4;
    if(r[0]===r[1] && r[1]===r[2] && r[2]===r[3]) planas++;
    for(var k=0;k<4;k++) p[letras[k]] += r[k] - m;
  });
  letras.forEach(function(l){ norm[l] = Math.max(0, Math.min(100, Math.round(50 + 50 * p[l] / (1.5 * N)))); });
  // Solo es «sin perfil» quien no ha distinguido entre frases. Un perfil equilibrado pero contestado de verdad es válido.
  var definido = planas <= N/3;
  // Orden de los perfiles. En un empate ya no gana la D por ir primera:
  // decide quién tiene más 4, luego quién tiene menos 1 y, si aún empatan, el azar.
  var n4 = {D:0,I:0,S:0,C:0}, n1 = {D:0,I:0,S:0,C:0}, az = {};
  lista.forEach(function(r){ for(var k=0;k<4;k++){ if(r[k] === 4) n4[letras[k]]++; if(r[k] === 1) n1[letras[k]]++; } });
  letras.forEach(function(l){ az[l] = Math.random(); });
  var ord = letras.slice().sort(function(a,b){
    if(Math.abs(p[b] - p[a]) > 1e-9) return p[b] - p[a];
    return (n4[b] - n4[a]) || (n1[a] - n1[b]) || (az[b] - az[a]);
  });
  return { p:p, norm:norm, planas:planas, definido:definido, ord:ord };
}

/* Las 4 frases de cada pregunta salen en un orden distinto para cada persona,
   para que nadie pueda aprenderse «la primera es siempre la misma». */
export function barajarPreguntas(n) {
  var o = [];
  for(var q=0;q<n;q++){ var a = [0,1,2,3]; for(var i=3;i>0;i--){ var j = Math.floor(Math.random()*(i+1)); var t = a[i]; a[i] = a[j]; a[j] = t; } o.push(a); }
  return o;
}

/* Perfiles que pide una oferta: los marcados («perfiles») o, en ofertas
   antiguas, los del texto «I + C». */
export function perfilesDeOferta(o) {
  var ps = (o && Array.isArray(o.perfiles) && o.perfiles.length) ? o.perfiles
         : (o && o.disc ? String(o.disc).split('+').map(function(x){ return x.trim(); }) : []);
  return ps.filter(function(l){ return LETRAS.indexOf(l) > -1; });
}

/* % de encaje: cuánto de lo que pide el puesto es de lo más fuerte en la
   persona. 100 sería que sus rasgos más altos son justo los que marcó la
   clínica; por eso nunca pasa de 97 ni baja de 30. Sin datos: null. */
export function porcentajeEncaje(norm, perfiles) {
  var ps = perfiles || [];
  if(!norm || !ps.length) return null;
  var suma = ps.reduce(function(a,l){ return a + (norm[l]||0); }, 0);
  var top = LETRAS.map(function(l){ return norm[l]||0; }).sort(function(a,b){ return b-a; })
            .slice(0, ps.length).reduce(function(a,b){ return a+b; }, 0);
  if(!top) return null;
  return Math.max(30, Math.min(97, Math.round(100*suma/top)));
}
