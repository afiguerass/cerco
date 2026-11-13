/* Portal del profesional: Seimian, cita, mensajes y contratación. Al final arranca el portal.
   Parte del antiguo profesional/01-portal.js (Fase 1, paso 1.6b). El orden de carga
   importa: los archivos 01a…01f se cargan seguidos y en este orden. */
/* ================================================================
   SEIMIAN para el candidato
   Un asistente automático de CERCO: solo usa tu perfil y las ofertas
   publicadas, y dice claramente cuando algo no lo sabe.
   ================================================================ */
var SEI = { abierto:false };
function abrirSeimian(){
  if(SEI.abierto) return;
  SEI.abierto = true;
  var fab = $('sei-fab'); if(fab) fab.hidden = true;
  var m = document.createElement('div');
  m.id = 'sei'; m.className = 'sei-bg';
  m.onclick = function(e){ if(e.target === m) cerrarSeimian(); };
  m.innerHTML = '<div class="sei" role="dialog" aria-modal="true" aria-label="Seimian">'
    + '<div class="sei-h"><div class="sei-av">'+svg('sparkles','#fff',17)+'</div><div style="flex:1;min-width:0;"><div class="sei-n">Seimian</div><div class="sei-s">Asistente automático de CERCO · no es una persona · solo ve tu perfil y las ofertas</div></div>'
    + '<button class="gu-x" aria-label="Cerrar" onclick="cerrarSeimian()">'+svg('x','#9CA3AF',18)+'</button></div>'
    + '<div class="sei-msgs" id="sei-msgs"></div>'
    + '<form class="sei-in" onsubmit="event.preventDefault(); seiPreguntar();"><input class="inp" id="sei-q" autocomplete="off" placeholder="Pregunta por tus solicitudes, ofertas o entrevista"><button class="btn btn-p" type="submit" aria-label="Enviar">'+svg('send','#fff',16)+'</button></form>'
    + '</div>';
  document.body.appendChild(m);
  var p = S.perfil || {};
  seiCaja();
  var hola = 'Hola' + (p.nombre ? ', ' + esc(primerNom(p.nombre)) : '') + '. ';
  if(!p.disc) hola += 'Aún no has hecho el test de personalidad. Sin él no puedo decirte qué ofertas te encajan ni prepararte la entrevista.';
  else if(!p.video) hola += 'Tu perfil está casi listo. Lo que más te ayudaría ahora es un vídeo corto: las clínicas lo ven antes que el CV.';
  else hola += 'Tu perfil es ' + NOMBRE[p.disc.dom].toLowerCase() + ' con rasgo ' + NOMBRE[p.disc.sec].toLowerCase() + '. ¿Miramos qué ofertas te encajan más?';
  seiDice(hola, true);
  try{ $('sei-q').focus({preventScroll:true}); }catch(e){}
}
function cerrarSeimian(){ var m = $('sei'); if(m) m.remove(); SEI.abierto = false; var fab = $('sei-fab'); if(fab) fab.hidden = !Nube.uid; }
function seiCaja(){
  var c = $('sei-msgs'); if(!c) return;
  var d = document.createElement('div'); d.className = 'sei-caja';
  d.innerHTML = '<div class="sei-caja-t">'+svg('sparkles','#8AB4FF',14)+'ESTO ES LO QUE HAGO</div>'
    + '<div><b>Te digo qué ofertas te encajan</b> y por qué, con tu test</div>'
    + '<div><b>Te preparo la entrevista</b> con las preguntas que suelen hacer</div>'
    + '<div><b>Te digo qué mejorar</b> en tu perfil para que te contesten antes</div>'
    + '<div class="sei-caja-p">Soy un asistente automático: respondo con tus datos y las ofertas publicadas. Si algo no lo sé, te lo digo.</div>';
  c.appendChild(d);
}
function seiDice(html, conAtajos){
  var c = $('sei-msgs'); if(!c) return;
  var a = $('sei-at'); if(a) a.remove();
  var d = document.createElement('div'); d.className = 'sei-m'; d.innerHTML = html; c.appendChild(d);
  if(conAtajos !== false) seiAtajos();
  c.scrollTop = c.scrollHeight;
}
function seiYo(t){
  var c = $('sei-msgs'); if(!c) return;
  var a = $('sei-at'); if(a) a.remove();
  var d = document.createElement('div'); d.className = 'sei-m yo'; d.textContent = t; c.appendChild(d);
  c.scrollTop = c.scrollHeight;
}
/* ---- lo que Seimian sabe además de ofertas, entrevista, perfil y test ---- */
function seiLink(txt, js){ return ' <button class="sei-link" onclick="'+js+'">'+txt+'</button>'; }
function seiQuien(){ return 'Soy el asistente automático de CERCO, no una persona. Puedo decirte: <b>cómo van tus solicitudes</b>, <b>qué oferta te encaja</b>, prepararte <b>la entrevista</b>, <b>qué mejorar</b> en tu perfil, cuánto es un sueldo <b>en neto</b>, <b>quién ve tu perfil</b> y cómo funciona el test.'; }
function seiSols(){
  var l = S.sols.filter(function(s){ return !esVisita(s); });
  if(!l.length) return 'Todavía no has enviado ninguna solicitud. ¿Miramos qué ofertas te encajan?' + seiLink('Ver ofertas', "cerrarSeimian(); ir('ofertas')");
  var viv = l.filter(function(s){ return ['enviada','vista','entrevista'].indexOf(s.estado) > -1; });
  var h = 'Tienes ' + l.length + ' solicitud' + (l.length === 1 ? '' : 'es') + (viv.length ? ', ' + viv.length + ' en marcha:' : ', ninguna en marcha ahora.') + '<br>';
  viv.slice(0,5).forEach(function(s){
    var q = diasQuedan(s);
    h += '• <b>' + esc(s.clinicaNombre || 'Clínica') + '</b> · ' + (s.estado === 'entrevista' ? 'te proponen entrevista' : s.estado === 'vista' ? 'han abierto tu perfil' : 'aún no la han abierto')
      + (s.estado !== 'entrevista' && q !== null ? ' · ' + (q === 0 ? 'se cierra hoy si no contestan' : 'les quedan ' + q + (q === 1 ? ' día' : ' días') + ' para contestar') : '') + '<br>';
  });
  var ent = viv.filter(function(s){ return s.estado === 'entrevista'; })[0];
  if(ent) h += 'Lo primero: la entrevista con ' + esc(ent.clinicaNombre || 'la clínica') + '.' + seiLink('Abrirla', "cerrarSeimian(); ir('solicitud','" + esc(ent.id) + "')") + seiLink('Ensayarla', "cerrarSeimian(); abrirHerramienta('ensayo','" + esc(ent.ofertaId) + "')");
  else h += seiLink('Ver mis solicitudes', "cerrarSeimian(); ir('solicitudes')");
  return h;
}
function seiHoy(p){
  var ent = S.sols.filter(function(s){ return s.estado === 'entrevista' && !esVisita(s); })[0];
  if(ent) return 'Lo más importante hoy: la entrevista con <b>' + esc(ent.clinicaNombre || 'la clínica') + '</b>. Confírmala y ensáyala con sus preguntas.' + seiLink('Abrirla', "cerrarSeimian(); ir('solicitud','" + esc(ent.id) + "')") + seiLink('Ensayar', "cerrarSeimian(); abrirHerramienta('ensayo','" + esc(ent.ofertaId) + "')");
  if(!p.disc) return 'Lo primero es el test: sin él no puedes enviar solicitudes. Son 5 minutos.' + seiLink('Hacer el test', "cerrarSeimian(); abrirTest(false)");
  if(!p.video) return 'Graba tu vídeo de presentación (hasta 1 minuto): es lo que más hace que una clínica te conteste.' + seiLink('Ir a mi perfil', "cerrarSeimian(); ir('perfil')");
  if(!p.cv) return 'Sube tu CV: la clínica lo puede leer dentro de CERCO sin descargarlo.' + seiLink('Ir a mi perfil', "cerrarSeimian(); ir('perfil')");
  var viv = S.sols.filter(function(s){ return ['enviada','vista'].indexOf(s.estado) > -1; }).length;
  if(viv < 3) return (viv ? 'Tienes ' + viv + ' solicitud' + (viv === 1 ? '' : 'es') + ' esperando. ' : '') + 'Con el perfil completo, lo que toca es solicitar 2 o 3 ofertas que te encajen: más no hace falta.' + seiLink('Ver ofertas', "cerrarSeimian(); ir('ofertas')");
  return 'Vas bien: tienes ' + viv + ' solicitudes esperando respuesta. Las clínicas tienen 2 días laborables para contestar; te aviso en cuanto lo hagan.';
}
function seiExtra(tema, p){
  if(tema === 'sols') return seiSols();
  if(tema === 'hoy') return seiHoy(p);
  if(tema === 'quien') return seiQuien();
  if(tema === 'plazo') return 'La clínica se compromete a contestarte en <b>2 días laborables</b>. Si a los <b>5 días</b> no ha dicho nada, CERCO cierra la solicitud, te avisa y a la clínica le baja su tasa de respuesta, que todo el mundo ve en sus ofertas. Nadie se queda semanas sin saber.';
  if(tema === 'descarte'){
    var d = S.sols.filter(function(s){ return s.estado === 'descartada' && !esVisita(s); }).sort(function(a,b){ return new Date(b.fecha) - new Date(a.fecha); })[0];
    if(!d) return 'No tienes ninguna solicitud descartada. Si una clínica dice que no, tiene que elegir un motivo del puesto y lo verás en la solicitud.';
    var m = MOTIVOS[d.motivo];
    return 'La última fue <b>' + esc(d.clinicaNombre || 'una clínica') + '</b>. ' + (m ? 'Motivo: ' + esc(m[0]) + ' ' + esc(m[1]) : 'No indicaron un motivo concreto.') + ' Un «no» habla de ese puesto en ese momento, no de ti.' + seiLink('Ver la solicitud', "cerrarSeimian(); ir('solicitud','" + esc(d.id) + "')");
  }
  if(tema === 'neto') return 'Te paso cualquier sueldo bruto anual a lo que cobrarías cada mes, en 12 o 14 pagas.' + seiLink('Abrir Sueldo neto', "cerrarSeimian(); abrirHerramienta('neto')");
  if(tema === 'comparar') return 'Puedes poner hasta 3 ofertas lado a lado: sueldo neto, distancia, contrato y cómo responde cada clínica.' + seiLink('Comparar ofertas', "cerrarSeimian(); abrirHerramienta('comparar')");
  if(tema === 'mensaje') return 'Te escribo tres versiones del mensaje para la clínica con lo que ellos buscan y lo que tú aportas; tú eliges y retocas.' + seiLink('Escribir mensaje', "cerrarSeimian(); abrirHerramienta('mensaje')");
  if(tema === 'test') return 'El test tiene 15 preguntas. Puntúas cada frase del 1 al 4 y puedes repetir nota: lo que cuenta es la diferencia entre unas frases y otras, así que poner lo mismo a todo no suma. No hay respuestas buenas: cada clínica busca formas de trabajar distintas. Puedes repetirlo una vez sin esperar y después cada ' + DISC_ESPERA_DIAS + ' días; la clínica ve cuántas veces lo has cambiado.';
  if(tema === 'priv') return 'Las clínicas ven tu perfil completo (nombre, vídeo, CV y contacto) <b>solo cuando les envías una solicitud</b>, o si CERCO te presenta y tú lo has activado. En Perfil → Ajustes eliges quién puede verte y puedes ocultarte de clínicas concretas, por ejemplo donde trabajas ahora. También puedes eliminar tu cuenta y tus datos cuando quieras.' + seiLink('Ir a Ajustes', "cerrarSeimian(); ir('perfil'); setTimeout(function(){ pfIr('pf-ajustes'); }, 300)");
  if(tema === 'rebote') return 'Si una clínica te dice que no, CERCO puede presentarte a otra cercana que busca tu profesión, para que no empieces de cero. Tú decides en Perfil → Ajustes: que te pregunte antes, que lo haga solo o que no lo haga. La nueva clínica nunca sabe que vienes de un «no».' + seiLink('Ir a Ajustes', "cerrarSeimian(); ir('perfil'); setTimeout(function(){ pfIr('pf-ajustes'); }, 300)");
  if(tema === 'video') return 'Para tu vídeo de presentación, tres ideas bastan:<br>1. Quién eres y qué haces («Soy Laia, higienista con 4 años en clínica»).<br>2. Qué se te da mejor, con un ejemplo real.<br>3. Qué buscas ahora (horario, tipo de clínica).<br>Luz de frente, móvil a la altura de los ojos y sin leer. Después puedes recortarlo y elegir la portada.' + seiLink('Ir a mi perfil', "cerrarSeimian(); ir('perfil')");
  if(tema === 'primerdia') return 'Antes de empezar, pide por escrito lo mismo que salía en la oferta: sueldo, horario, convenio y periodo de prueba. El primer día pregunta quién es tu persona de referencia y cómo son los protocolos de esterilización y agenda. A los 90 días CERCO os preguntará a los dos si seguís y si las condiciones se cumplieron.';
  return null;
}
function seiAtajos(){
  var c = $('sei-msgs'); if(!c) return;
  var d = document.createElement('div'); d.className = 'sei-at'; d.id = 'sei-at';
  [['¿Qué hago hoy?','hoy'],['¿Cómo van mis solicitudes?','sols'],['¿Qué oferta me encaja más?','ofertas'],['Prepárame la entrevista','entrevista'],['¿Cómo mejoro mi perfil?','mejorar'],['Explícame mi perfil','disc']].forEach(function(x){
    var b = document.createElement('button'); b.type = 'button'; b.textContent = x[0];
    b.onclick = function(){ seiTema(x[1], x[0]); };
    d.appendChild(b);
  });
  c.appendChild(d);
}
function seiPreguntar(){
  var i = $('sei-q'); var q = (i && i.value || '').trim(); if(!q) return;
  i.value = '';
  var t = q.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g,'');
  var tema = /hoy|que hago|por donde|siguiente paso|que me falta hacer/.test(t) ? 'hoy'
    : /descart|rechaz|por que no|no me (han )?(cogid|elegid|llam)/.test(t) ? 'descarte'
    : /mis solicitudes|como va|contestad|respondid|me han|estado de|novedad/.test(t) ? 'sols'
    : /plazo|cuanto tardan|cuando (me )?contest|cuantos dias|tardan/.test(t) ? 'plazo'
    : /neto|al mes|14 pagas|12 pagas/.test(t) ? 'neto'
    : /compar/.test(t) ? 'comparar'
    : /que digo en el video|grabar|video/.test(t) ? 'video'
    : /mensaje|que (le )?(escribo|digo|pongo)|carta/.test(t) ? 'mensaje'
    : /repetir|trampa|como funciona el test|cuantas veces|sin perfil|repasar/.test(t) ? 'test'
    : /quien (puede )?ve|privacidad|ocult|mi jefe|mi clinica actual|datos|borrar|eliminar/.test(t) ? 'priv'
    : /rebote|presenta|otra clinica|otras clinicas/.test(t) ? 'rebote'
    : /primer dia|contratad|me han cogido|empiezo/.test(t) ? 'primerdia'
    : /quien eres|eres (una )?(ia|persona|robot)|que (sabes|puedes)/.test(t) ? 'quien'
    : /salari|sueldo|cobr|pagan|€|euros/.test(t) ? 'salario'
           : /entrevist|pregunt|prepar/.test(t) ? 'entrevista'
           : /ofert|encaj|trabajo|puesto|cl[ií]nica/.test(t) ? 'ofertas'
           : /mejor|v[ií]deo|foto|cv|curr[ií]c|perfil (incompleto|mejor)|complet/.test(t) ? 'mejorar'
           : /disc|personalidad|test|soy|rasgo|perfil/.test(t) ? 'disc' : null;
  seiTema(tema, q);
}
function seiTema(tema, pregunta){
  seiYo(pregunta);
  var p = S.perfil || {}, d = p.disc, r;
  var t = document.createElement('div'); t.className = 'sei-m sei-esc'; t.innerHTML = '<span></span><span></span><span></span>';
  var c = $('sei-msgs'); if(c){ c.appendChild(t); c.scrollTop = c.scrollHeight; }
  setTimeout(function(){
    t.remove();
    var ex = tema ? seiExtra(tema, p) : null;
    if(ex) r = ex;
    else if(!tema) r = 'Eso no lo sé contestar con seguridad, y prefiero decírtelo a inventarlo. ' + seiQuien();
    else if(tema === 'salario') r = seiSalario();
    else if(tema !== 'mejorar' && !d) r = 'Primero necesito tu test de personalidad: son 5 minutos. <button class="sei-link" onclick="cerrarSeimian(); abrirTest(false)">Hacer el test</button>';
    else if(tema === 'ofertas') r = seiOfertas(d);
    else if(tema === 'entrevista') r = seiEntrevista(d);
    else if(tema === 'mejorar') r = seiMejorar(p);
    else r = seiDisc(d);
    seiDice(r);
  }, 650);
}
function seiOfertas(d){
  var pf = S.perfil || {}, zc = ofertasCerca(ofertasVisibles().filter(function(o){ return !solDeOferta(o.id); }));
  var lejos = !zc.dentro.length && zc.fuera.length;
  var l = (lejos ? zc.fuera : zc.dentro)
    .map(function(o){ return {o:o, p:encaje(d, o)}; }).filter(function(x){ return x.p !== null; })
    .sort(function(a,b){ return b.p - a.p; }).slice(0,3);
  if(!l.length) return 'Ahora mismo no hay ofertas nuevas que no hayas solicitado. Te aviso aquí cuando se publiquen.';
  var h = (!hayReales() ? 'Todavía no hay ofertas reales; con las de ejemplo, así lo vería:'
    : lejos ? 'No hay ofertas ' + esc(txtRadio(pf.radio||25, pf.geo)) + '. De las que hay más lejos, estas te encajan mejor:'
    : 'Estas son las que mejor te encajan' + (pf.geo ? ' ' + esc(txtRadio(pf.radio||25, pf.geo)) : '') + ':') + '<ol class="sei-ol">';
  l.forEach(function(x){
    var ps = perfilesDe(x.o), coinc = ps.filter(function(k){ return k === d.dom || k === d.sec; });
    var st = statsResp(x.o.clinicaId);
    h += '<li><button class="sei-link" onclick="cerrarSeimian(); ir(\'oferta\',\''+esc(x.o.id)+'\')">'+esc(x.o.titulo)+' · '+esc(x.o.clinica||'')+'</button> <b>'+x.p+' %</b><br>'
      + (coinc.length ? 'Buscan ' + coinc.map(function(k){ return NOMBRE[k].toLowerCase(); }).join(' y ') + ', como tú.' : 'Buscan otro perfil, pero tu punto fuerte puede sumar.')
      + (st && !st.nueva ? ' Contestan al ' + st.pct + ' %.' : '')
      + (!x.o.ejemplo && pf.geo && kmDe(x.o, pf.geo) !== null ? ' Te queda a ' + kmDe(x.o, pf.geo) + ' km.' : '') + '</li>';
  });
  return h + '</ol>El porcentaje es orientativo: la entrevista es lo que cuenta.';
}
var PREG_DISC = {
  D:['Cuéntame una vez que tuviste que decidir rápido con un paciente. ¿Qué hiciste?','¿Cómo reaccionas cuando alguien del equipo no sigue tu ritmo?'],
  I:['¿Cómo tranquilizas a un paciente con miedo al dentista?','Háblame de una vez que tu forma de comunicar evitó un problema.'],
  S:['¿Qué haces cuando la agenda se complica y todos van con prisa?','¿Cómo te adaptas a un cambio de protocolo que no te convence?'],
  C:['¿Cómo te aseguras de no saltarte ningún paso de esterilización?','Cuéntame un error que detectaste antes que nadie.']
};
var CUIDA = {
  D:'no parecer impaciente: escucha la pregunta entera antes de contestar.',
  I:'no irte por las ramas: responde con un ejemplo concreto y cierra.',
  S:'venderte más: di en voz alta lo que haces bien, no solo lo que hace el equipo.',
  C:'no quedarte solo en el detalle técnico: habla también del trato con el paciente.'
};
function seiEntrevista(d){
  var ent = S.sols.filter(function(s){ return s.estado === 'entrevista' && !esVisita(s); })[0];
  var o = ent ? buscarOferta(ent.ofertaId) : null;
  var ps = o ? perfilesDe(o) : [];
  var h = ent ? 'Para tu entrevista en <b>' + esc(ent.clinicaNombre||'la clínica') + '</b> (' + esc(ent.ofertaTitulo||'') + ')' + (ent.cita ? ', el <b>' + esc(fechaCitaC(ent.cita.fecha).toLowerCase()) + '</b> (' + esc((MODO_C[ent.cita.modo]||'').toLowerCase()) + ')' : '') + ':' : 'No tienes ninguna entrevista todavía. Te preparo lo que suelen preguntar en clínicas dentales:';
  h += '<ol class="sei-ol"><li>Háblame de ti y de por qué quieres este puesto.</li>';
  (ps.length ? ps : [d.dom]).slice(0,2).forEach(function(k){ h += '<li>' + PREG_DISC[k][0] + '</li>'; });
  h += '<li>' + PREG_DISC[d.dom][1] + '</li><li>¿Qué esperas del equipo y de la clínica?</li></ol>';
  h += '<b>Tu punto fuerte:</b> ' + APORTA[d.dom] + '. Llévalo con un ejemplo real.<br><b>Cuida:</b> ' + CUIDA[d.dom];
  if(ps.length && ps.indexOf(d.dom) === -1) h += '<br><b>Ojo:</b> buscan ' + ps.map(function(k){ return NOMBRE[k].toLowerCase(); }).join(' y ') + '. Prepara un ejemplo donde lo demostraras.';
  return h;
}
function seiMejorar(p){
  var f = [];
  if(!p.disc) f.push(['Hacer el test de personalidad', 'sin él no puedes solicitar', "cerrarSeimian(); abrirTest(false)", 'Hacer el test']);
  if(!p.video) f.push(['Grabar tu vídeo de presentación', 'es lo primero que ve la clínica', "cerrarSeimian(); ir('perfil'); setTimeout(abrirGrabadora, 200)", 'Grabar']);
  if(!p.resumen) f.push(['Presentarte en pocas líneas', 'las clínicas lo leen antes de llamarte', "cerrarSeimian(); editarPerfil()", 'Escribirlo']);
  if(!(p.trabajos||[]).length && p.experiencia && p.experiencia.indexOf('Sin experiencia') !== 0) f.push(['Añadir dónde has trabajado', 'da confianza aunque sea poco tiempo', "cerrarSeimian(); editarPerfil()", 'Añadir']);
  if(!p.foto) f.push(['Poner una foto', 'ayuda a que te recuerden después de la entrevista', "cerrarSeimian(); ir('perfil')", 'Añadir foto']);
  if(!p.cv) f.push(['Subir tu CV completo en PDF', 'algunas clínicas lo piden para decidir', "cerrarSeimian(); ir('perfil')", 'Subir']);
  if(!f.length) return 'Tu perfil está completo. Ahora lo que más cuenta es contestar rápido cuando una clínica te escriba.';
  var h = 'Por orden de importancia:<ol class="sei-ol">';
  f.slice(0,4).forEach(function(x){ h += '<li><b>' + x[0] + '</b>: ' + x[1] + '. <button class="sei-link" onclick="' + x[2] + '">' + x[3] + '</button></li>'; });
  return h + '</ol>';
}
function seiSalario(){
  var l = ofertasVisibles().filter(function(o){ return o.salario; });
  if(!l.length){ var rp0 = (S.perfil||{}).profesion, g0 = txtGuia(guiaSalarial(PROF_RE[rp0] ? rp0 : null, null), rp0); return g0 || 'Ninguna oferta publicada indica salario todavía.'; }
  var d = S.perfil && S.perfil.disc;
  l = l.slice().sort(function(a,b){ return (encaje(d,b)||0) - (encaje(d,a)||0); }).slice(0,4);
  var rolP = (S.perfil||{}).profesion, gs = txtGuia(guiaSalarial(PROF_RE[rolP] ? rolP : null, ((S.perfil||{}).geo||{}).prov), rolP);
  return (gs ? gs + '<br><br>' : '') + 'Lo que pagan las ofertas que más te encajan' + (hayReales() ? '' : ' (de ejemplo)') + ':<ol class="sei-ol">'
    + l.map(function(o){ return '<li><button class="sei-link" onclick="cerrarSeimian(); ir(\'oferta\',\''+esc(o.id)+'\')">'+esc(o.titulo)+'</button>: <b>'+esc(o.salario)+'</b></li>'; }).join('')
    + '</ol>Todas las clínicas de CERCO tienen que indicar el salario antes de la entrevista. En la entrevista no te pueden preguntar cuánto cobrabas antes.';
}
function seiDisc(d){
  var n = d.norm;
  return 'Eres <b>' + NOMBRE[d.dom] + '</b> con rasgo ' + NOMBRE[d.sec].toLowerCase() + '. ' + DESC[d.dom]
    + '<br><br>En tu test: ' + LETRAS.slice().sort(function(a,b){ return n[b]-n[a]; }).map(function(k){ return NOMBRE[k] + ' ' + n[k] + ' %'; }).join(' · ') + '.'
    + '<br><br>En un equipo dental sueles aportar ' + APORTA[d.dom] + '. Te encajan mejor las ofertas que buscan ' + NOMBRE[d.dom].toLowerCase() + ' o ' + NOMBRE[d.sec].toLowerCase() + '.'
    + '<br><br><span style="color:#6B7280;">No es una etiqueta fija: si crees que no te refleja, repite el test desde Mi perfil.</span>';
}

/* ================================================================
   CITA, MENSAJES Y CONTRATACIÓN (lo que te manda la clínica)
   ================================================================ */
var DIAS_C = ['domingo','lunes','martes','miércoles','jueves','viernes','sábado'];
var MESES_C = ['enero','febrero','marzo','abril','mayo','junio','julio','agosto','septiembre','octubre','noviembre','diciembre'];
var MODO_C = { video:'Videollamada', clinica:'En la clínica', tel:'Por teléfono' };
function fechaCitaC(iso){
  var d = new Date(iso); if(isNaN(d)) return '';
  var t = DIAS_C[d.getDay()] + ' ' + d.getDate() + ' de ' + MESES_C[d.getMonth()] + ', a las ' + String(d.getHours()).padStart(2,'0') + ':' + String(d.getMinutes()).padStart(2,'0');
  return t.charAt(0).toUpperCase() + t.slice(1);
}
Nube.cambiar = function(s, campos){
  var c = Object.assign({}, campos, { actualizado: new Date().toISOString() });
  return this.db().collection('candidaturas').doc(s.id).update(c).then(function(){ Object.assign(s, c); return c; });
};

/* ---------- mensajes ---------- */
function vistosC(){ try{ return JSON.parse(localStorage.getItem('cerco_c_vistos_' + Nube.uid) || '{}'); }catch(e){ return {}; } }
function marcarVistosC(s){ var v = vistosC(); v[s.id] = (s.mensajes || []).length; try{ localStorage.setItem('cerco_c_vistos_' + Nube.uid, JSON.stringify(v)); }catch(e){} }
function sinLeerC(s){ var v = vistosC()[s.id] || 0; return (s.mensajes || []).slice(v).filter(function(x){ return x.de === 'clinica'; }).length; }
function pendientesC(){
  var n = 0;
  S.sols.forEach(function(s){ n += sinLeerC(s); if(s.estado === 'entrevista' && s.cita && s.cita.estado === 'propuesta') n++; });
  return n;
}
function bloqueMensajesC(s){
  if(s.estado === 'retirada') return '';
  var m = s.mensajes || [];
  return '<div class="card"><h3>'+svg('msg','currentColor',16)+'Mensajes con '+esc(s.clinicaNombre||'la clínica')+'</h3>'
    + '<div class="msgs" id="sd-msgs">'
    + (m.length ? m.map(function(x){ var yo = x.de === 'candidato'; return '<div class="msg'+(yo?' yo':'')+'">'+esc(x.t)+'<small>'+esc(cuando(x.f))+'</small></div>'; }).join('')
               : '<div class="msg-vacio">Todavía no os habéis escrito. Si tienes una duda sobre el puesto, pregúntala aquí: la clínica la recibe en CERCO.</div>')
    + '</div>'
    + '<form class="msg-in" onsubmit="event.preventDefault(); enviarMensajeC(\''+esc(s.id)+'\')"><input class="inp" id="sd-msg-in" maxlength="600" placeholder="Escribe a la clínica…" aria-label="Mensaje para la clínica"><button class="btn btn-p" type="submit">Enviar</button></form></div>';
}
function enviarMensajeC(id){
  var s = buscarSol(id), i = $('sd-msg-in'); if(!s || !i) return;
  var t = (i.value || '').trim(); if(!t || !unaVez('msgC', 600)) return;
  var m = (s.mensajes || []).concat([{de:'candidato', t:t.slice(0,600), f:new Date().toISOString()}]).slice(-100);
  i.value = '';
  Nube.cambiar(s, {mensajes: m}).then(function(){ marcarVistosC(s); pintarSolicitud(); setTimeout(function(){ var b = $('sd-msgs'); if(b) b.scrollTop = b.scrollHeight; var ii = $('sd-msg-in'); if(ii) try{ ii.focus({preventScroll:true}); }catch(e){} }, 30); })
    .catch(function(){ i.value = t; toast('No se ha podido enviar. Revisa tu conexión.'); });
}

/* ---------- la cita ---------- */
/* Archivo .ics: lo abren Apple Calendar, Outlook y casi cualquier calendario */
function icsCitaC(id){
  var s = buscarSol(id); if(!s || !s.cita) return;
  var t = s.cita, d = new Date(t.fecha), f = new Date(d.getTime() + 45*60000);
  var z = function(x){ return x.toISOString().replace(/[-:]/g,'').replace(/\.\d{3}/,''); };
  var lim = function(x){ return String(x || '').replace(/\\/g,'\\\\').replace(/[,;]/g, function(m){ return '\\' + m; }).replace(/\n/g,'\\n'); };
  var txt = ['BEGIN:VCALENDAR','VERSION:2.0','PRODID:-//CERCO//Entrevistas//ES','CALSCALE:GREGORIAN','METHOD:PUBLISH','BEGIN:VEVENT',
    'UID:' + s.id + '-' + (t.v || 1) + '@cerco', 'DTSTAMP:' + z(new Date()), 'DTSTART:' + z(d), 'DTEND:' + z(f),
    'SUMMARY:' + lim((esVisita(s) ? 'Visita a ' : 'Entrevista en ') + (s.clinicaNombre || 'la clínica')),
    'DESCRIPTION:' + lim((s.ofertaTitulo || '') + (t.sala ? '\nSala: ' + t.sala : '')),
    'LOCATION:' + lim(t.lugar || (t.modo === 'video' ? (t.sala || 'Videollamada') : 'Por teléfono')),
    'BEGIN:VALARM','TRIGGER:-PT1H','ACTION:DISPLAY','DESCRIPTION:Recordatorio de tu entrevista','END:VALARM',
    'END:VEVENT','END:VCALENDAR'].join('\r\n');
  var a = document.createElement('a'); a.href = URL.createObjectURL(new Blob([txt], {type:'text/calendar;charset=utf-8'}));
  a.download = 'entrevista-cerco.ics'; document.body.appendChild(a); a.click(); a.remove();
  toast('Ábrelo y se añadirá a tu calendario, con un aviso una hora antes.');
}
function enlaceCalendario(s){
  var t = s.cita, d = new Date(t.fecha), f = new Date(d.getTime() + 45*60000);
  var z = function(x){ return x.toISOString().replace(/[-:]/g,'').replace(/\.\d{3}/,''); };
  var q = 'action=TEMPLATE&text=' + encodeURIComponent((esVisita(s) ? 'Visita a ' : 'Entrevista en ') + (s.clinicaNombre || 'la clínica'))
    + '&dates=' + z(d) + '/' + z(f) + '&details=' + encodeURIComponent((s.ofertaTitulo || '') + (t.sala ? '\nSala: ' + t.sala : ''))
    + '&location=' + encodeURIComponent(t.lugar || (t.modo === 'video' ? 'Videollamada' : 'Por teléfono'));
  return 'https://calendar.google.com/calendar/render?' + q;
}
function bloqueCitaC(s){
  var t = s.cita; if(!t) return '';
  var pasada = new Date(t.fecha) < new Date(Date.now() - 3600000);
  var h = '<div class="card cita'+(t.estado === 'confirmada' ? ' ok' : (t.estado === 'cambio' ? ' cambio' : ''))+'">'
    + '<div class="eyebrow">'+(esVisita(s) ? 'TU VISITA' : 'TU ENTREVISTA')+(pasada ? ' · YA PASÓ' : '')+'</div>'
    + '<div class="cita-f">'+esc(fechaCitaC(t.fecha))+'</div>'
    + '<div class="cita-m">'+svg(t.modo === 'video' ? 'video' : (t.modo === 'tel' ? 'phone' : 'pin'), '#4B5563', 15)+esc(MODO_C[t.modo] || '')+(t.lugar ? ' · ' + esc(t.lugar) : '')
    + (t.modo === 'tel' ? ' · te llamarán al ' + esc((S.perfil||{}).telefono || 'teléfono de tu perfil') : '') + '</div>';
  if(t.modo === 'video' && t.sala) h += '<a class="btn btn-p cita-sala" href="'+esc(t.sala)+'" target="_blank" rel="noopener">'+svg('video','#fff',16)+'Entrar en la sala</a><div class="hint" style="margin:6px 0 0;">Se abre en el navegador, sin instalar nada. Entra un par de minutos antes.</div>';
  if(!pasada){
    if(t.estado === 'propuesta')
      h += '<div class="cita-acts"><button class="btn btn-p" id="cita-si" onclick="confirmarCita(\''+esc(s.id)+'\')">'+svg('check','#fff',16)+'Confirmo que voy</button><button class="btn btn-s" onclick="pedirOtroDia(\''+esc(s.id)+'\')">Necesito otro día</button></div>'
      + '<div class="hint" style="margin:8px 0 0;">Cuando confirmes, podrás apuntarla en tu calendario del móvil (Google, Apple u Outlook) con un toque.</div>';
    else if(t.estado === 'confirmada')
      h += '<div class="cita-est">'+svg('check','#0E9F6E',16)+'<span>Has confirmado. La clínica ya lo sabe.</span></div><div class="cita-acts"><a class="btn btn-s" href="'+esc(enlaceCalendario(s))+'" target="_blank" rel="noopener">'+svg('cal','currentColor',15)+'Google Calendar</a><button class="btn btn-s" onclick="icsCitaC(\''+esc(s.id)+'\')">'+svg('cal','currentColor',15)+'Apple u Outlook</button><button class="btn btn-g" onclick="pedirOtroDia(\''+esc(s.id)+'\')">Necesito cambiarla</button></div>';
    else if(t.estado === 'cambio')
      h += '<div class="cita-est camb">'+svg('clock','#8A5A00',16)+'<span>Has pedido otro día'+(t.msgCambio ? ': «' + esc(t.msgCambio) + '»' : '')+'. Esperando a que la clínica te proponga uno nuevo.</span></div>';
  }
  return h + '<div id="cita-cambio"></div></div>';
}
function confirmarCita(id){
  var s = buscarSol(id); if(!s || !s.cita || !unaVez('citaOk', 1200)) return;
  bloquear('cita-si', 'Confirmando…');
  var c = Object.assign({}, s.cita, { estado:'confirmada', msgCambio:'' });
  Nube.cambiar(s, {cita: c}).then(function(){ toast('Confirmado. ' + (s.clinicaNombre || 'La clínica') + ' ya lo sabe.'); refrescar(); })
    .catch(function(){ bloquear('cita-si'); toast('No se ha podido confirmar. Revisa tu conexión.'); });
}
function pedirOtroDia(id){
  var box = $('cita-cambio'); if(!box) return;
  box.innerHTML = '<div class="field" style="margin:14px 0 8px;"><label for="cita-alt">¿Qué días y horas te van bien?</label><textarea class="inp" id="cita-alt" maxlength="300" placeholder="Ej: cualquier tarde a partir de las 16:00, o el viernes por la mañana"></textarea></div>'
    + '<div class="err" id="cita-err"></div><div class="cita-acts"><button class="btn btn-s" onclick="pintarSolicitud()">Cancelar</button><button class="btn btn-p" id="cita-alt-ok" onclick="enviarOtroDia(\''+esc(id)+'\')">Enviar a la clínica</button></div>';
  try{ $('cita-alt').focus(); }catch(e){}
}
function enviarOtroDia(id){
  var s = buscarSol(id); if(!s || !s.cita) return;
  var t = val('cita-alt'); if(t.length < 4) return error('cita-err', 'Dinos qué días te van bien.');
  if(!unaVez('citaAlt', 1200)) return;
  bloquear('cita-alt-ok', 'Enviando…');
  var c = Object.assign({}, s.cita, { estado:'cambio', msgCambio:t.slice(0,300) });
  Nube.cambiar(s, {cita: c}).then(function(){ toast('Enviado. La clínica te propondrá otro día.'); refrescar(); })
    .catch(function(){ bloquear('cita-alt-ok'); error('cita-err', 'No se ha podido enviar. Revisa tu conexión.'); });
}

pintarIconos();
arrancar();
