/* Archivo sacado tal cual de candidato.html (Fase 1, paso 1.6). El orden de carga
   importa: se carga en el mismo sitio de la página donde estaba. */
/* ================================================================
   CERCO · CENTRO DE HERRAMIENTAS DEL PROFESIONAL
   Cada herramienta usa algo que solo CERCO sabe (el perfil del equipo
   de cada clínica, cómo responde, tu encaje) y deja una señal que la
   clínica ve: así el candidato gana ventaja y la clínica, información.
   1. Ensaya tu entrevista    -> la clínica ve «Ha preparado la entrevista»
   2. Mensaje para la clínica -> se usa al solicitar
   3. Revisión de tu perfil   -> lo que la clínica ve primero
   4. Comparar ofertas        -> neto, km, encaje, contrato, cómo responde
   5. Sueldo neto             -> de bruto anual a lo que cobras al mes
   6. Tu valor en el mercado  -> qué pagan las ofertas de tu profesión
   7. Dónde encajas           -> clínicas cerca a las que les falta tu perfil
   ================================================================ */
Object.assign(ICO, {
  tools:'<path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"/>',
  scale:'<path d="m16 16 3-8 3 8c-.87.65-1.92 1-3 1s-2.13-.35-3-1Z"/><path d="m2 16 3-8 3 8c-.87.65-1.92 1-3 1s-2.13-.35-3-1Z"/><path d="M7 21h10"/><path d="M12 3v18"/><path d="M3 7h2c2 0 5-1 7-2 2 1 5 2 7 2h2"/>',
  calc:'<rect width="16" height="20" x="4" y="2" rx="2"/><line x1="8" x2="16" y1="6" y2="6"/><line x1="16" x2="16" y1="14" y2="18"/><path d="M16 10h.01"/><path d="M12 10h.01"/><path d="M8 10h.01"/><path d="M12 14h.01"/><path d="M8 14h.01"/><path d="M12 18h.01"/><path d="M8 18h.01"/>',
  target:'<circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="6"/><circle cx="12" cy="12" r="2"/>',
  trend:'<polyline points="22 7 13.5 15.5 8.5 10.5 2 17"/><polyline points="16 7 22 7 22 13"/>',
  mic:'<path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z"/><path d="M19 10v2a7 7 0 0 1-14 0v-2"/><line x1="12" x2="12" y1="19" y2="22"/>',
  grid:'<rect width="7" height="7" x="3" y="3" rx="1"/><rect width="7" height="7" x="14" y="3" rx="1"/><rect width="7" height="7" x="14" y="14" rx="1"/><rect width="7" height="7" x="3" y="14" rx="1"/>'
});

var HER = { t:null, of:null, cmp:[], resp:{} };
var HERRAMIENTAS = [
  {grupo:'Conseguir el puesto', items:[
    {id:'ensayo', ico:'mic', col:'#1A56DB', bg:'#EEF3FE', t:'Ensaya tu entrevista', ia:true,
     d:'Las mismas preguntas que la clínica tiene en su panel para tu perfil. Escribe tu respuesta y Seimian te dice qué le falta.'},
    {id:'mensaje', ico:'msg', col:'#0E9F6E', bg:'#E8F8F1', t:'Mensaje para la clínica', ia:true,
     d:'Tres versiones de tu mensaje al solicitar, escritas con lo que busca esa clínica y lo que tú aportas.'},
    {id:'revision', ico:'check', col:'#B45309', bg:'#FFF4DB', t:'Revisión de tu perfil',
     d:'Qué ve la clínica de ti, en qué orden, y qué te falta para que te llamen antes.'}
  ]},
  {grupo:'Decidir bien', items:[
    {id:'comparar', ico:'scale', col:'#66328A', bg:'#F3EEFA', t:'Comparar ofertas',
     d:'Hasta 3 ofertas lado a lado: sueldo neto, distancia, encaje, contrato y cómo responde cada clínica.'},
    {id:'neto', ico:'calc', col:'#1A56DB', bg:'#EEF3FE', t:'Sueldo neto',
     d:'Pasa el bruto anual de una oferta a lo que cobrarías cada mes, en 12 o 14 pagas.'},
    {id:'mercado', ico:'trend', col:'#0E9F6E', bg:'#E8F8F1', t:'Tu valor en el mercado',
     d:'Qué pagan las ofertas de tu profesión en tu provincia y cómo pedir lo que vales.'}
  ]}
];

function abrirHerramienta(id, of){ HER.t = id || null; if(of !== undefined) HER.of = of; ir('herramientas'); }
function pintarHerr(){
  var box = $('hr-box'); if(!box) return;
  if(!HER.t) box.innerHTML = portadaHerr();
  else {
    var f = { ensayo:hEnsayo, mensaje:hMensaje, revision:hRevision, comparar:hComparar, neto:hNeto, mercado:hMercado, encajas:hEncajas }[HER.t];
    var it = null; HERRAMIENTAS.forEach(function(g){ g.items.forEach(function(x){ if(x.id === HER.t) it = x; }); });
    box.innerHTML = '<button class="back" onclick="abrirHerramienta(null)">'+svg('left','currentColor',16)+'Herramientas</button>'
      + '<div class="hr-cab"><div class="hr-ico" style="background:'+it.bg+';">'+svg(it.ico, it.col, 22)+'</div><div style="min-width:0;"><h1 class="t" style="margin:0;">'+esc(it.t)+(it.ia ? ' <span class="ia-t">Seimian</span>' : '')+'</h1><p class="sub" style="margin:2px 0 0;">'+esc(it.d)+'</p></div></div>'
      + (f ? f() : '');
  }
  pintarIconos(box);
}
function portadaHerr(){
  var p = S.perfil || {}, n = clinicasQueTeBuscan().length, rv = revisionPerfil();
  var h = '<h1 class="t">Herramientas</h1><p class="sub">Para conseguir el puesto que buscas y decidir bien. Todas usan lo que CERCO sabe de cada clínica.</p>';
  // lo más útil ahora mismo, según tu momento
  var ent = S.sols.filter(function(s){ return s.estado === 'entrevista' && !esVisita(s); })[0];
  var sug = ent ? {id:'ensayo', of:ent.ofertaId, t:'Tienes una entrevista con '+(ent.clinicaNombre||'una clínica')+'. Ensáyala con sus preguntas.'}
          : rv.pct < 70 ? {id:'revision', t:'Tu perfil está al '+rv.pct+' %. Lo que falta es lo que más pesa para que te llamen.'}
          : {id:'comparar', t:'Compara las ofertas que te interesan antes de decidir.'};
  h += '<div class="card hr-sug" onclick="abrirHerramienta(\''+sug.id+'\''+(sug.of ? ',\''+esc(sug.of)+'\'' : '')+')" role="button" tabindex="0">'+svg('sparkles','#fff',20)+'<div style="flex:1;min-width:0;"><div class="hr-sug-e">AHORA TE SIRVE</div><div class="hr-sug-t">'+esc(sug.t)+'</div></div>'+svg('right','#fff',18)+'</div>';
  HERRAMIENTAS.forEach(function(g){
    h += '<div class="hr-gr" id="hr-g-'+HERRAMIENTAS.indexOf(g)+'"><div class="eyebrow" style="margin-top:22px;">'+esc(g.grupo)+'</div><div class="hr-grid">';
    g.items.forEach(function(x){
      var dato = x.id === 'revision' ? rv.pct + ' %' : x.id === 'encajas' ? (n ? n + (n === 1 ? ' clínica' : ' clínicas') : '') : '';
      h += '<button class="hr-card" onclick="abrirHerramienta(\''+x.id+'\')"><span class="hr-ico" style="background:'+x.bg+';">'+svg(x.ico, x.col, 20)+'</span>'
        + '<span class="hr-txt"><b>'+esc(x.t)+(x.ia ? ' <span class="ia-t">Seimian</span>' : '')+'</b><small>'+esc(x.d)+'</small></span>'
        + (dato ? '<span class="hr-dato">'+esc(dato)+'</span>' : '') + '</button>';
    });
    h += '</div></div>';
  });
  h += '<p class="hint" style="margin-top:18px;">Seimian es un asistente automático de CERCO, no una persona. Tus respuestas de los ensayos se quedan en este dispositivo: la clínica solo sabe que has preparado la entrevista.</p>';
  return h;
}

/* ---------- elegir oferta ---------- */
function ofertasParaHerr(){
  var vis = {}, out = [];
  var add = function(o){ if(o && !o.ejemplo && !vis[o.id]){ vis[o.id] = 1; out.push(o); } };
  S.sols.filter(function(s){ return s.estado === 'entrevista'; }).forEach(function(s){ add(buscarOferta(s.ofertaId)); });
  S.sols.filter(function(s){ return ['enviada','vista'].indexOf(s.estado) > -1; }).forEach(function(s){ add(buscarOferta(s.ofertaId)); });
  ((S.perfil||{}).guardadas || []).forEach(function(id){ add(buscarOferta(id)); });
  ordenarOfertas(ofertasCerca(ofertasVisibles()).dentro).forEach(add);
  ofertasVisibles().forEach(add);
  return out;
}
function selectorOferta(fn){
  var l = ofertasParaHerr();
  if(!l.length) return '<div class="aviso">'+svg('info','#8A5A00',16)+'<span>Todavía no hay ofertas publicadas. Cuando las haya, podrás usar esta herramienta con ellas.</span></div>';
  if(!HER.of || !l.some(function(o){ return String(o.id) === String(HER.of); })) HER.of = l[0].id;
  return '<div class="field"><label for="hr-of">Oferta</label><select class="inp" id="hr-of" onchange="HER.of=this.value; '+fn+'">'
    + l.map(function(o){ var s = solDeOferta(o.id); return '<option value="'+esc(o.id)+'"'+(String(o.id) === String(HER.of) ? ' selected' : '')+'>'+esc(o.titulo)+' · '+esc(o.clinica||'')+(s && s.estado === 'entrevista' ? ' (entrevista)' : s ? ' (solicitada)' : '')+'</option>'; }).join('')
    + '</select></div>';
}

/* ---------- 1. ensayo de entrevista ---------- */
// las mismas preguntas, en el mismo orden, que la clínica ve en su ficha
function preguntasDe(o){
  var d = (S.perfil||{}).disc; if(!d) return [];
  var ps = perfilesDe(o), eq = ((S.clinicas[o.clinicaId] || {}).equipo) || {};
  var falta = eq.fiable ? eq.falta : null;
  var l = [PREG_DISC[d.dom][0], PREG_DISC[d.sec][0], PREG_DISC[d.dom][1]];
  ps.forEach(function(k){ if(k !== d.dom && k !== d.sec) l.push(PREG_DISC[k][0]); });
  if(falta && falta !== d.dom && falta !== d.sec) l.push(PREG_DISC[falta][1]);
  return l.slice(0,5);
}
function claveEnsayo(oid){ return 'cerco_ensayo_' + Nube.uid + '_' + oid; }
function leerEnsayo(oid){ try{ return JSON.parse(localStorage.getItem(claveEnsayo(oid)) || '{}'); }catch(e){ return {}; } }
function guardarEnsayo(oid, r){ try{ localStorage.setItem(claveEnsayo(oid), JSON.stringify(r)); }catch(e){} }
function revisarRespuesta(t){
  var x = ' ' + String(t||'').toLowerCase().replace(/[^a-záéíóúüñ0-9]+/g, ' ') + ' ', pal = x.trim().split(' ').filter(Boolean).length;
  // palabras enteras, también las que acaban en tilde (hablé, decidí)
  var hay = function(l){ return l.some(function(w){ return x.indexOf(' ' + w + ' ') > -1; }); };
  var sit = hay(['una vez','cuando','en mi anterior','en mi último','en mi ultimo','en la clínica','en la clinica','un día','un dia','teníamos','teniamos','me pasó','me paso','había','habia','un paciente','una paciente']);
  var acc = hay(['hice','decidí','decidi','hablé','hable','propuse','revisé','revise','expliqué','explique','organicé','organice','llamé','llame','me encargué','me encargue','cambié','cambie','pregunté','pregunte','preparé','prepare','ayudé','ayude','avisé','avise','paré','pare']);
  var res = hay(['al final','conseguí','consegui','resultado','gracias a','desde entonces','aprendí','aprendi','volvió','volvio','se quedó','se quedo','mejoró','mejoro','funcionó','funciono','terminó','termino','acabó','acabo']);
  var num = /\d/.test(x);
  var tips = [];
  if(pal < 25) tips.push('Es corta. Las respuestas que convencen duran entre 40 segundos y 2 minutos: unas 60-150 palabras.');
  if(!sit) tips.push('Sitúa un caso real: «Una vez, en mi anterior clínica…». Un ejemplo concreto vale más que una opinión.');
  if(!acc) tips.push('Di qué hiciste tú, en primera persona: «hablé con…», «decidí…», «revisé…».');
  if(!res) tips.push('Cierra con el resultado: qué pasó al final y qué aprendiste.');
  if(sit && acc && res && !num) tips.push('Bien estructurada. Si puedes, añade un dato: cuántos pacientes, cuánto tiempo, qué cambió.');
  return { sit:sit, acc:acc, res:res, est:(sit ? 1 : 0) + (acc ? 1 : 0) + (res ? 1 : 0), tips:tips, pal:pal };
}
function hEnsayo(){
  var p = S.perfil || {}; if(!p.disc) return '<div class="aviso aviso-info">'+svg('compass','#1E3A8A',16)+'<span>Primero haz el test de personalidad: las preguntas dependen de tu perfil. <button class="link" onclick="abrirTest(false)">Hacer el test</button></span></div>';
  var h = selectorOferta('pintarHerr()');
  var o = buscarOferta(HER.of); if(!o) return h;
  var qs = preguntasDe(o), r = leerEnsayo(o.id), hechas = 0;
  var sol = solDeOferta(o.id);
  h += '<div class="aviso aviso-info">'+svg('info','#1E3A8A',16)+'<span>Son las preguntas que '+esc(o.clinica||'la clínica')+' tiene en su panel para un perfil como el tuyo. Responde como lo dirías en voz alta. <b>Tus respuestas no se envían</b>: se quedan en este dispositivo.</span></div>';
  qs.forEach(function(q, i){
    var a = r[i] || '', rv = a ? revisarRespuesta(a) : null; if(rv && rv.est >= 2) hechas++;
    h += '<div class="card hr-q"><div class="hr-qn">Pregunta '+(i+1)+' de '+qs.length+'</div><div class="hr-qt">'+esc(q)+'</div>'
      + '<textarea class="inp" id="hr-a'+i+'" maxlength="1500" placeholder="Escribe tu respuesta…" oninput="HER.resp['+i+']=this.value">'+esc(a)+'</textarea>'
      + '<div class="hr-qa"><button class="btn btn-s" onclick="revisarEnsayo('+i+')">'+svg('sparkles','currentColor',15)+'Revisar con Seimian</button>'
      + (rv ? '<span class="hr-est" aria-label="'+rv.est+' de 3">'+[['Situación',rv.sit],['Acción',rv.acc],['Resultado',rv.res]].map(function(n){ return '<span class="'+(n[1] ? 'on' : '')+'">'+(n[1] ? '✓ ' : '')+n[0]+'</span>'; }).join('')+'</span>' : '') + '</div>'
      + (rv && rv.tips.length ? '<ul class="hr-tips">'+rv.tips.map(function(t){ return '<li>'+esc(t)+'</li>'; }).join('')+'</ul>' : (rv ? '<div class="hr-ok">'+svg('check','#0E9F6E',15)+'Respuesta completa: caso, lo que hiciste y el resultado.</div>' : ''))
      + '</div>';
  });
  h += '<div class="card dark"><div class="eyebrow" style="color:rgba(255,255,255,.6);">'+svg('compass','rgba(255,255,255,.6)',13)+'PARA TU PERFIL</div><p style="margin:0;font-size:14px;line-height:1.6;color:rgba(255,255,255,.92);">Eres '+NOMBRE[p.disc.dom].toLowerCase()+': cuida '+esc(CUIDA[p.disc.dom])+'</p></div>';
  var lista = hechas >= Math.min(3, qs.length);
  h += '<div class="card"><div style="display:flex;gap:12px;align-items:center;flex-wrap:wrap;"><div style="flex:1;min-width:200px;"><b style="font-size:15px;">'+(lista ? 'Lista para la entrevista' : 'Responde al menos 3 preguntas')+'</b><div style="font-size:13px;color:var(--muted);margin-top:2px;">'
    + (sol ? 'Al terminar, '+esc(o.clinica||'la clínica')+' verá en tu solicitud que has preparado la entrevista (no lo que has escrito).' : 'Si luego solicitas esta oferta, la clínica verá que la has preparado.')+'</div></div>'
    + '<button class="btn btn-p" '+(lista ? '' : 'disabled ')+'onclick="terminarEnsayo(\''+esc(o.id)+'\')">'+svg('check','#fff',16)+'He terminado</button></div></div>';
  return h;
}
function revisarEnsayo(i){
  var o = buscarOferta(HER.of); if(!o) return;
  var r = leerEnsayo(o.id); r[i] = (($('hr-a'+i)||{}).value || '').trim(); guardarEnsayo(o.id, r);
  var y = window.scrollY; pintarHerr(); window.scrollTo(0, y);
}
function terminarEnsayo(oid){
  var p = S.perfil || {}, l = (p.ensayos || []).slice(); if(l.indexOf(String(oid)) === -1) l.push(String(oid));
  var s = solDeOferta(oid);
  guardarAjuste({ensayos:l.slice(-50)}).then(function(){
    if(s && !s.preparada && ['enviada','vista','entrevista'].indexOf(s.estado) > -1) return Nube.cambiar(s, {preparada:true}).catch(function(){});
  }).then(function(){ toast(s ? 'Hecho. ' + (s.clinicaNombre || 'La clínica') + ' verá que has preparado la entrevista.' : 'Hecho. Si solicitas esta oferta, la clínica verá que la has preparado.'); });
}

/* ---------- 2. mensaje para la clínica ---------- */
var RASGO_FRASE = { D:'tomar decisiones con agilidad cuando la agenda aprieta', I:'que el paciente se sienta cómodo y bien atendido', S:'constancia y calma en el día a día del gabinete', C:'rigor con los protocolos y atención al detalle' };
function mensajesPara(o){
  var p = S.perfil || {}, d = p.disc || {}, nom = primerNom(p.nombre || ''), k = kmDe(o, p.geo);
  var eq = ((S.clinicas[o.clinicaId] || {}).equipo) || {}, ps = perfilesDe(o);
  var comun = ps.filter(function(l){ return l === d.dom || l === d.sec; })[0] || d.dom;
  var aporta = RASGO_FRASE[comun] || 'mi forma de trabajar';
  var fuerte = (p.fuertes || [])[0] ? (p.fuertes[0]).toLowerCase() : '';
  var EXPF = {'Sin experiencia (prácticas)':'formación reciente y prácticas', 'Menos de 1 año':'menos de un año de experiencia', 'De 1 a 3 años':'entre 1 y 3 años de experiencia', 'De 3 a 5 años':'entre 3 y 5 años de experiencia', 'Más de 5 años':'más de 5 años de experiencia'};
  var exp = p.experiencia ? String(p.experiencia).toLowerCase() : '', expF = EXPF[p.experiencia] || '';
  var cerca = k !== null && k <= 15 ? (k < 1 ? 'Vivo en la misma zona' : 'Vivo a ' + k + ' km') : '';
  var falta = eq.fiable && (eq.falta === d.dom || eq.falta === d.sec) ? eq.falta : null;
  var disp = p.disponibilidad === 'Inmediata' ? 'Puedo incorporarme ya.' : (p.disponibilidad ? 'Puedo incorporarme ' + String(p.disponibilidad).toLowerCase() + '.' : '');
  return [
    { t:'Cercano', m:'Hola, soy ' + nom + '. Me encantaría formar parte de vuestro equipo como ' + String(o.titulo||'').toLowerCase() + '. Lo que más me gusta de mi trabajo es ' + aporta + (fuerte ? ', y mi punto fuerte es el ' + fuerte : '') + '. ' + (cerca ? cerca + ' de la clínica, ' : '') + (disp ? disp.charAt(0).toLowerCase() + disp.slice(1) : '') + ' ¿Os iría bien una llamada esta semana?' },
    { t:'Profesional', m:'Buenos días. Les escribo por la oferta de ' + String(o.titulo||'').toLowerCase() + '. Tengo ' + (expF || 'experiencia') + ' en clínica dental' + (p.titulacion ? ' y soy ' + String(p.titulacion) : '') + '. ' + (falta ? 'He visto que a su equipo le vendría bien un perfil ' + NOMBRE[falta].toLowerCase() + ', que es justo el mío: ' + RASGO_FRASE[falta] + '. ' : 'Aporto ' + aporta + '. ') + disp + ' Quedo a su disposición para una entrevista.' },
    { t:'Breve', m:nom + ', ' + String(p.profesion||'').toLowerCase() + (exp ? ' (' + exp + ')' : '') + '. Me interesa mucho el puesto. ' + (cerca ? cerca + '. ' : '') + disp + ' ¿Cuándo podemos hablar?' }
  ].map(function(x){ x.m = x.m.replace(/\s+/g, ' ').replace(/ \./g, '.').trim().slice(0, 500); return x; });
}
function hMensaje(){
  var p = S.perfil || {}; if(!p.disc) return '<div class="aviso aviso-info">'+svg('compass','#1E3A8A',16)+'<span>Haz primero el test: el mensaje usa tu forma de trabajar. <button class="link" onclick="abrirTest(false)">Hacer el test</button></span></div>';
  var h = selectorOferta('pintarHerr()'); var o = buscarOferta(HER.of); if(!o) return h;
  var s = solDeOferta(o.id);
  if(s) h += '<div class="aviso aviso-info">'+svg('check','#1E3A8A',16)+'<span>Ya has solicitado esta oferta. Puedes escribir a la clínica desde <button class="link" onclick="ir(\'solicitud\',\''+esc(s.id)+'\')">tu solicitud</button>.</span></div>';
  mensajesPara(o).forEach(function(x, i){
    h += '<div class="card"><div style="display:flex;justify-content:space-between;align-items:center;gap:10px;margin-bottom:8px;"><b style="font-size:14.5px;">'+esc(x.t)+'</b><span class="hint" style="margin:0;">'+x.m.length+'/500</span></div>'
      + '<textarea class="inp" id="hr-m'+i+'" maxlength="500" style="min-height:110px;">'+esc(x.m)+'</textarea>'
      + (s ? '' : '<div class="prop-a" style="margin-top:10px;"><button class="btn btn-p" onclick="usarMensaje('+i+',\''+esc(o.id)+'\')">'+svg('send','#fff',15)+'Solicitar con este mensaje</button></div>') + '</div>';
  });
  h += '<p class="hint">Revísalo y cámbialo a tu manera: la clínica nota cuando un mensaje suena a ti.</p>';
  return h;
}
function usarMensaje(i, oid){
  var t = (($('hr-m'+i)||{}).value || '').trim();
  modalSolicitar(oid);
  setTimeout(function(){ var m = $('m-msg'); if(m){ m.value = t; } }, 30);
}

/* ---------- 3. revisión del perfil ---------- */
function clinicasCerca(){
  var p = S.perfil || {}, m = {};
  S.ofertas.forEach(function(o){ if(o.clinicaId && (!p.geo || enRadio(o, p.geo, p.radio || 25)) && mismaProfesion(o, p)) m[o.clinicaId] = 1; });
  return Object.keys(m).length;
}
function revisionPerfil(){
  var p = S.perfil || {};
  var colegiable = /odont|ortodon|higien/i.test(p.profesion || '');
  var l = [
    {ok:!!p.disc, w:20, t:'Test de personalidad', por:'Sin él no puedes solicitar y no sale tu encaje.', acc:'abrirTest(false)', b:'Hacer el test'},
    {ok:!!p.video, w:20, t:'Vídeo de presentación', por:'Es lo primero que ve la clínica en tu ficha, antes que el CV.', acc:'ir(\'perfil\'); setTimeout(abrirGrabadora, 200)', b:'Grabar'},
    {ok:!!p.foto, w:8, t:'Foto', por:'Tu tarjeta sale con tu cara en lugar de tus iniciales.', acc:'ir(\'perfil\')', b:'Añadir'},
    {ok:!!p.cv, w:8, t:'CV completo en PDF', por:'La clínica lo descarga cuando le interesas.', acc:'ir(\'perfil\')', b:'Subir'},
    {ok:!!(p.resumen && p.resumen.length > 60), w:10, t:'Presentación', por:'Unas líneas tuyas, con tus palabras. Sale en tu ficha.', acc:'editarPerfil()', b:'Escribir'},
    {ok:!!(p.trabajos||[]).length || /^Sin experiencia/.test(p.experiencia||''), w:10, t:'Dónde has trabajado', por:'Da contexto a tus años de experiencia.', acc:'editarPerfil()', b:'Añadir'},
    {ok:(p.fuertes||[]).length >= 2, w:4, t:'Puntos fuertes', por:'Salen en tu tarjeta y en el buscador de la clínica.', acc:'editarPerfil()', b:'Elegir'},
    {ok:!!p.visible, w:10, t:'Que las clínicas te inviten', por:'Te encuentran aunque tú no hayas solicitado.', acc:'guardarAjuste({visible:true}, \'Listo: las clínicas podrán invitarte\')', b:'Activar'},
    {ok:['auto','preguntar'].indexOf(p.rebote) > -1, w:5, t:'Efecto rebote', por:'Si una clínica te dice que no, CERCO te presenta a otra.', acc:'guardarAjuste({rebote:\'auto\'}, \'Efecto rebote activado\')', b:'Activar'}
  ];
  if(colegiable) l.push({ok:!!p.colegiado, w:5, t:'Número de colegiado/a', por:'La clínica lo ve en tu solicitud y puede comprobarlo.', acc:'ir(\'perfil\'); setTimeout(function(){ var e = document.getElementById(\'aj-col\'); if(e){ e.scrollIntoView({block:\'center\'}); e.focus(); } }, 300)', b:'Añadir'});
  var tot = l.reduce(function(a, x){ return a + x.w; }, 0), hecho = l.reduce(function(a, x){ return a + (x.ok ? x.w : 0); }, 0);
  return { l:l, pct:Math.round(hecho / tot * 100) };
}
function hRevision(){
  var rv = revisionPerfil(), n = clinicasCerca(), falta = rv.l.filter(function(x){ return !x.ok; }).sort(function(a,b){ return b.w - a.w; });
  var h = '<div class="card"><div style="display:flex;align-items:center;gap:16px;flex-wrap:wrap;">'+anillo(rv.pct, 64)
    + '<div style="flex:1;min-width:200px;"><b style="font-size:16px;">'+(rv.pct >= 90 ? 'Perfil muy completo' : rv.pct >= 70 ? 'Buen perfil, con margen' : 'A tu perfil le falta lo importante')+'</b>'
    + '<div style="font-size:13.5px;color:var(--muted);margin-top:3px;line-height:1.5;">'+(n ? n + (n === 1 ? ' clínica de tu zona busca' : ' clínicas de tu zona buscan') + ' tu profesión ahora mismo. Esto es lo que verán.' : 'Esto es lo que verá cada clínica cuando solicites.')+'</div></div></div></div>';
  if(falta.length){
    h += '<div class="eyebrow">Lo que más te suma, primero</div>';
    falta.forEach(function(x){
      h += '<div class="card hr-row"><div style="flex:1;min-width:0;"><b>'+esc(x.t)+' <span class="hr-w">+'+x.w+'</span></b><small>'+esc(x.por)+'</small></div><button class="btn btn-s" onclick="'+x.acc+'">'+esc(x.b)+'</button></div>';
    });
  }
  var ok = rv.l.filter(function(x){ return x.ok; });
  if(ok.length) h += '<div class="eyebrow" style="margin-top:18px;">Ya lo tienes</div><div class="card">' + ok.map(function(x){ return '<div class="hr-ok" style="margin:6px 0;">'+svg('check','#0E9F6E',15)+esc(x.t)+'</div>'; }).join('') + '</div>';
  return h;
}

/* ---------- 4. comparar ofertas ---------- */
function hComparar(){
  var l = ofertasParaHerr();
  if(!l.length) return '<div class="aviso">'+svg('info','#8A5A00',16)+'<span>Todavía no hay ofertas publicadas.</span></div>';
  HER.cmp = HER.cmp.filter(function(id){ return l.some(function(o){ return String(o.id) === String(id); }); });
  if(!HER.cmp.length) HER.cmp = l.slice(0, Math.min(3, l.length)).map(function(o){ return String(o.id); });
  var h = '<div class="eyebrow">Elige hasta 3</div><div class="chips cmp-chips" style="margin-bottom:16px;">' + l.slice(0, 12).map(function(o){
    var on = HER.cmp.indexOf(String(o.id)) > -1;
    return '<span class="chip'+(on ? ' on' : '')+'" role="button" aria-pressed="'+on+'" onclick="alternarCmp(\''+esc(o.id)+'\')">'+esc(o.clinica||'')+' · '+esc(o.titulo)+'</span>';
  }).join('') + '</div>';
  var os = HER.cmp.map(buscarOferta).filter(Boolean), p = S.perfil || {};
  if(!os.length) return h;
  var filas = [
    ['Distancia', function(o){ var k = kmDe(o, p.geo); return {t: k === null ? '—' : (k < 1 ? 'En tu zona' : k + ' km'), v: k === null ? null : -k}; }],
    ['Encaje', function(o){ var e = encaje(p.disc, o); return {t: e === null ? '—' : e + ' % · ' + etiquetaEncaje(e).replace('Encaje ',''), v:e}; }],
    ['Bruto', function(o){ return {t:o.salario || 'Sin indicar', v:null}; }],
    ['Neto al mes', function(o){ var a = anualDe(o.salario); if(!a) return {t:'—', v:null}; var n1 = netoAnual(a[0]) / 12, n2 = netoAnual(a[1]) / 12; return {t: Math.round(n1).toLocaleString('es-ES') + (a[1] !== a[0] ? '–' + Math.round(n2).toLocaleString('es-ES') : '') + ' €', v:(n1+n2)/2}; }],
    ['Jornada', function(o){ return {t:o.jornada || '—', v:null}; }],
    ['Contrato', function(o){ return {t:o.contrato || 'Sin indicar', v: o.contrato ? (/^Indefinido$/.test(o.contrato) ? 2 : 1) : 0}; }],
    ['Periodo de prueba', function(o){ return {t:o.prueba || 'Sin indicar', v:null}; }],
    ['Convenio', function(o){ return {t:o.convenio || 'Sin indicar', v:null}; }],
    ['Cómo responde', function(o){ var st = statsResp(o.clinicaId); return st && !st.nueva ? {t: st.pct + ' %' + (st.med !== null ? ' · en ' + textoHoras(st.med) : ''), v:st.pct} : {t:'Clínica nueva', v:null}; }],
    ['Valoración', function(o){ cargarValoraciones(o.clinicaId); var m = mediaValoraciones(o.clinicaId); return m ? {t: String(m.m).replace('.',',') + ' de 5 (' + m.n + ')', v:m.m} : {t:'Aún sin media', v:null}; }],
    ['Le falta a su equipo', function(o){ var eq = ((S.clinicas[o.clinicaId]||{}).equipo) || {}; if(!eq.fiable || !eq.falta) return {t:'—', v:null}; var tu = p.disc && (eq.falta === p.disc.dom || eq.falta === p.disc.sec); return {t: NOMBRE[eq.falta] + (tu ? ' · eres tú' : ''), v: tu ? 1 : 0}; }]
  ];
  h += '<div class="hr-tabla"><table><thead><tr><th></th>' + os.map(function(o){ return '<th><a href="#" onclick="event.preventDefault(); ir(\'oferta\',\''+esc(o.id)+'\')">'+esc(o.titulo)+'</a><small>'+esc(o.clinica||'')+'</small></th>'; }).join('') + '</tr></thead><tbody>';
  filas.forEach(function(f){
    var cs = os.map(f[1]), vs = cs.map(function(c){ return c.v; }).filter(function(v){ return v !== null; });
    var mejor = vs.length > 1 && Math.max.apply(null, vs) !== Math.min.apply(null, vs) ? Math.max.apply(null, vs) : null;
    h += '<tr><th scope="row">'+esc(f[0])+'</th>' + cs.map(function(c){ return '<td'+(mejor !== null && c.v === mejor ? ' class="mejor"' : '')+'>'+esc(c.t)+'</td>'; }).join('') + '</tr>';
  });
  h += '</tbody></table></div><p class="hint">En verde, la mejor de cada fila. El neto es orientativo (escala general del IRPF, sin situación familiar).</p>';
  return h;
}
function alternarCmp(id){
  id = String(id); var i = HER.cmp.indexOf(id);
  if(i > -1) HER.cmp.splice(i, 1); else { if(HER.cmp.length >= 3) HER.cmp.shift(); HER.cmp.push(id); }
  pintarHerr();
}

/* ---------- 5. sueldo neto (orientativo) ---------- */
// Seguridad Social del trabajador ~6,5 %; IRPF con la escala general estatal+autonómica
// tipo, reducción por rendimientos del trabajo y mínimo personal. Sin situación familiar.
function cuotaEscala(b){
  var T = [[12450,.19],[20200,.24],[35200,.30],[60000,.37],[300000,.45],[Infinity,.47]], c = 0, prev = 0;
  for(var i=0;i<T.length && b > prev;i++){ var tope = Math.min(b, T[i][0]); c += (tope - prev) * T[i][1]; prev = T[i][0]; }
  return c;
}
function irpfAnual(bruto){
  if(bruto <= 15876) return 0;
  var ss = bruto * 0.065, rn = Math.max(0, bruto - ss - 2000), red = 0;
  if(rn <= 14852) red = 7302; else if(rn <= 17673.52) red = 7302 - 1.75*(rn - 14852); else if(rn <= 19747.5) red = 2364.34 - 1.14*(rn - 17673.52);
  var base = Math.max(0, rn - red);
  return Math.max(0, cuotaEscala(base) - cuotaEscala(Math.min(base, 5550)));
}
function netoAnual(bruto){ return bruto - bruto*0.065 - irpfAnual(bruto); }
function hNeto(){
  var l = ofertasParaHerr().filter(function(o){ return anualDe(o.salario); });
  var h = '';
  if(l.length) h += '<div class="field"><label for="hr-nof">Coger el sueldo de una oferta</label><select class="inp" id="hr-nof" onchange="var a = anualDe((buscarOferta(this.value)||{}).salario); if(a){ $(\'hr-bruto\').value = Math.round((a[0]+a[1])/2); calcNeto(); }"><option value="">Elige una oferta</option>'
    + l.map(function(o){ return '<option value="'+esc(o.id)+'">'+esc(o.titulo)+' · '+esc(o.clinica||'')+' · '+esc(o.salario)+'</option>'; }).join('') + '</select></div>';
  h += '<div class="row2"><div class="field"><label for="hr-bruto">Bruto al año (€)</label><input class="inp" id="hr-bruto" inputmode="numeric" value="22000" oninput="calcNeto()"></div>'
    + '<div class="field"><label>Pagas</label><div class="chips" id="hr-pagas"><span class="chip on" data-p="14" onclick="marcarPagas(14)">14 pagas</span><span class="chip" data-p="12" onclick="marcarPagas(12)">12 pagas</span></div></div></div>'
    + '<div class="card" id="hr-neto-r"></div>'
    + '<p class="hint">Orientativo: Seguridad Social del 6,5 % y la escala general del IRPF, sin hijos ni otras situaciones. Tu nómina real depende de tu comunidad autónoma y tu situación familiar.</p>';
  setTimeout(calcNeto, 0);
  return h;
}
var _pagas = 14;
function marcarPagas(n){ _pagas = n; document.querySelectorAll('#hr-pagas .chip').forEach(function(c){ c.classList.toggle('on', +c.dataset.p === n); }); calcNeto(); }
function calcNeto(){
  var b = parseInt(String(($('hr-bruto')||{}).value || '').replace(/\D/g,''), 10) || 0, box = $('hr-neto-r'); if(!box) return;
  if(b < 5000){ box.innerHTML = '<div style="color:var(--muted);font-size:14px;">Escribe el sueldo bruto anual.</div>'; return; }
  var ss = b*0.065, irpf = irpfAnual(b), n = b - ss - irpf, f = function(x){ return Math.round(x).toLocaleString('es-ES') + ' €'; };
  box.innerHTML = '<div class="hr-neto"><div><small>Cobrarías al mes</small><b>'+f(n/_pagas)+'</b><span>'+(_pagas === 14 ? 'más 2 pagas extra de '+f(n/14) : 'en 12 pagas')+'</span></div>'
    + '<div class="hr-neto-d"><div><span>Bruto al año</span><b>'+f(b)+'</b></div><div><span>Seguridad Social</span><b>−'+f(ss)+'</b></div><div><span>IRPF (≈'+(Math.round(irpf/b*1000)/10).toString().replace('.',',')+' %)</span><b>−'+f(irpf)+'</b></div><div><span>Neto al año</span><b>'+f(n)+'</b></div></div></div>';
}

/* ---------- 6. tu valor en el mercado ---------- */
var PEDIR = {
  D:'Ve al grano, pero escucha primero su oferta. Da una cifra concreta y justifícala con un resultado tuyo.',
  I:'Tu cercanía ayuda, pero lleva el número pensado de casa. No lo dejes en «lo que consideréis».',
  S:'No aceptes lo primero por no incomodar. Pide unos días para pensarlo: es normal y se respeta.',
  C:'Llévalo preparado con datos: lo que pagan otras ofertas iguales en tu provincia. Esta página te los da.'
};
function hMercado(){
  var p = S.perfil || {}, rol = PROF_RE[p.profesion] ? p.profesion : null, prov = (p.geo||{}).prov;
  if(!rol) return '<div class="aviso aviso-info">'+svg('info','#1E3A8A',16)+'<span>Indica tu profesión en tu perfil para ver lo que se paga. <button class="link" onclick="editarPerfil()">Editar perfil</button></span></div>';
  var g = guiaSalarial(rol, prov), h = '';
  if(g) h += '<div class="card"><div class="eyebrow">'+esc(rol)+' · '+esc(g.donde)+'</div><div style="font-size:26px;font-weight:800;font-variant-numeric:tabular-nums;">'+milesK(g.min)+' – '+milesK(g.max)+' €</div><div style="font-size:13.5px;color:var(--muted);margin-top:4px;">'+esc(txtGuia(g, rol))+'</div>'
    + '<div style="font-size:13.5px;margin-top:10px;">En neto, unos <b>'+Math.round(netoAnual(g.min)/14).toLocaleString('es-ES')+' – '+Math.round(netoAnual(g.max)/14).toLocaleString('es-ES')+' € al mes</b> en 14 pagas.</div></div>';
  var l = S.ofertas.filter(function(o){ return rolDe(o) === rol && anualDe(o.salario); }).sort(function(a,b){ return anualDe(b.salario)[1] - anualDe(a.salario)[1]; });
  if(l.length){
    var max = anualDe(l[0].salario)[1];
    h += '<div class="eyebrow" style="margin-top:6px;">Lo que pagan las ofertas de CERCO</div><div class="card">' + l.slice(0, 8).map(function(o){
      var a = anualDe(o.salario), k = kmDe(o, p.geo);
      return '<div class="hr-bar" onclick="ir(\'oferta\',\''+esc(o.id)+'\')"><div class="hr-bar-t"><b>'+esc(o.clinica||'')+'</b><span>'+(k !== null ? k + ' km · ' : '')+esc(o.salario)+'</span></div><div class="hr-bar-r"><span style="left:'+(a[0]/max*100)+'%;width:'+Math.max(2,(a[1]-a[0])/max*100)+'%;"></span></div></div>';
    }).join('') + '</div>';
  }
  if(p.disc) h += '<div class="card dark"><div class="eyebrow" style="color:rgba(255,255,255,.6);">'+svg('msg','rgba(255,255,255,.6)',13)+'CÓMO PEDIRLO, SIENDO '+NOMBRE[p.disc.dom].toUpperCase()+'</div><p style="margin:0;font-size:14px;line-height:1.6;color:rgba(255,255,255,.92);">'+esc(PEDIR[p.disc.dom])+'</p></div>';
  h += '<p class="hint">Por ley, la oferta tiene que decir el sueldo antes de la entrevista y no pueden preguntarte cuánto cobras ahora.</p>';
  return h;
}

/* ---------- 7. dónde encajas ---------- */
function clinicasQueTeBuscan(){
  var p = S.perfil || {}, d = p.disc; if(!d) return [];
  var vis = {}, out = [];
  S.ofertas.forEach(function(o){
    var eq = ((S.clinicas[o.clinicaId] || {}).equipo) || {};
    if(!eq.fiable || !eq.falta || vis[o.clinicaId]) return;
    if(eq.falta !== d.dom && eq.falta !== d.sec) return;
    if(!mismaProfesion(o, p) || (p.geo && !enRadio(o, p.geo, p.radio || 25))) return;
    vis[o.clinicaId] = 1; out.push({o:o, eq:eq, principal: eq.falta === d.dom});
  });
  return out.sort(function(a,b){ return (b.principal ? 1 : 0) - (a.principal ? 1 : 0) || (kmDe(a.o, p.geo)||0) - (kmDe(b.o, p.geo)||0); });
}
function hEncajas(){
  var p = S.perfil || {}; if(!p.disc) return '<div class="aviso aviso-info">'+svg('compass','#1E3A8A',16)+'<span>Haz el test para saber dónde encajas. <button class="link" onclick="abrirTest(false)">Hacer el test</button></span></div>';
  var l = clinicasQueTeBuscan(), d = p.disc;
  var h = '<div class="card dark"><div style="display:flex;gap:14px;align-items:center;"><div class="disc-big" style="background:'+COLOR[d.dom]+';width:48px;height:48px;font-size:19px;border-radius:13px;">'+d.dom+'</div><div style="font-size:14px;line-height:1.6;color:rgba(255,255,255,.92);">Eres <b style="color:#fff;">'+NOMBRE[d.dom]+'</b> con rasgo '+NOMBRE[d.sec].toLowerCase()+'. Aportas '+esc(APORTA[d.dom])+'.</div></div></div>';
  if(!l.length) h += '<div class="vacio"><b>Ahora mismo ninguna clínica de tu zona tiene ese hueco</b><p>Las clínicas actualizan el perfil de su equipo cuando su gente hace el test. Te avisaremos cuando una busque tu forma de trabajar.</p></div>';
  else l.forEach(function(x){
    var o = x.o, k = kmDe(o, p.geo), s = solDeOferta(o.id), c = x.eq.comp || {};
    h += '<div class="card"><div style="display:flex;justify-content:space-between;gap:10px;align-items:flex-start;flex-wrap:wrap;"><div style="min-width:0;"><b style="font-size:15.5px;">'+esc(o.clinica||'')+'</b><div style="font-size:13px;color:var(--muted);">'+esc(o.titulo)+(k !== null ? ' · a '+k+' km' : '')+'</div></div>'
      + '<span class="reb-t" style="border-radius:99px;padding:4px 10px;font-size:12px;">'+(x.principal ? 'Tu rasgo principal' : 'Tu segundo rasgo')+'</span></div>'
      + '<div class="hr-eq">'+['D','I','S','C'].map(function(L){ var v = +c[L] || 0; return '<div><span style="width:'+Math.max(4, v)+'%;background:'+COLOR[L]+';'+(L === x.eq.falta ? '' : 'opacity:.45;')+'"></span><small>'+L+' '+v+' %</small></div>'; }).join('')+'</div>'
      + '<p class="txt" style="font-size:13.5px;margin:8px 0 12px;">A su equipo le falta perfil <b>'+NOMBRE[x.eq.falta].toLowerCase()+'</b>: '+esc(APORTA[x.eq.falta])+'. Llegarías a cubrir ese hueco.</p>'
      + '<div class="prop-a">'+(s ? '<button class="btn btn-s" onclick="ir(\'solicitud\',\''+esc(s.id)+'\')">Ya la has solicitado</button>' : '<button class="btn btn-p" onclick="modalSolicitar(\''+esc(o.id)+'\')">'+svg('send','#fff',15)+'Solicitar</button>')+'<button class="btn btn-s" onclick="ir(\'oferta\',\''+esc(o.id)+'\')">Ver la oferta</button></div></div>';
  });
  return h;
}

/* ---------- enganches ---------- */
// Al ir a Herramientas, pintarlas. La usa ir (profesional/01-portal.js)
  window.CERCO_irHerramientas = function(v, arg, noHist){
    if(v === 'herramientas'){ pintarHerr(); }
  };
// Al refrescar: repintar Herramientas si está abierta. La usa refrescar (profesional/01-portal.js)
  window.CERCO_refrescarHerramientas = function(){
    if(S.vista === 'herramientas'){ var ae = document.activeElement; if(!(ae && /TEXTAREA|INPUT|SELECT/.test(ae.tagName))) pintarHerr(); }
  };
// la solicitud lleva si la has preparado
var _extHerr = window.extrasSolicitud;
window.extrasSolicitud = function(o){ var x = _extHerr(o); if(((S.perfil||{}).ensayos || []).indexOf(String(o.id)) > -1) x.preparada = true; return x; };
var _gpHerr = Nube.guardarPerfil;
Nube.guardarPerfil = function(p){
  var self = this;
  return _gpHerr.call(this, p).then(function(r){
    if(Array.isArray(p.ensayos)) return self.db().collection('candidatos').doc(self.uid).set({ensayos:p.ensayos.slice(-50).map(String)}, {merge:true}).then(function(){ return r; });
    return r;
  });
};

