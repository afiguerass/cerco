/* Archivo sacado tal cual de index.html (Fase 1, paso 1.6). El orden de carga
   importa: se carga en el mismo sitio de la página donde estaba. */
/* ================================================================
   SEIMIAN (clínica): de 5 respuestas sobre el test a un asistente
   que lee todo lo que pasa en la clínica: quién espera, a quién
   entrevistar, qué le falta a cada oferta, qué preguntar, qué no
   se puede preguntar, sueldos de referencia y cifras propias.
   Sigue siendo automático (reglas, no una IA generativa): solo
   afirma lo que sale de los datos de la clínica.
   ================================================================ */
(function(){
  function e(t){ return String(t == null ? '' : t).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;'); }
  function norm(t){ return String(t || '').toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g,''); }
  function leer(k, d){ try{ var v = JSON.parse(localStorage.getItem(k) || 'null'); return v == null ? d : v; }catch(x){ return d; } }
  function cands(){ try{ return ((window.CERCO_candidaturas ? CERCO_candidaturas() : []) || []).filter(function(c){ return c.tipo !== 'visita'; }); }catch(x){ return []; } }
  function ofertas(){ var l = leer('cerco_ofertas', []); return (Array.isArray(l) ? l : []).filter(function(o){ return o && !o.ejemplo; }); }
  function grupo(t){ try{ return CERCO_grupo(t).k; }catch(x){ return 'otros'; } }
  function nom(c){ return String(c.nombre || 'Sin nombre').trim().split(/\s+/)[0]; }
  function dias(f){ var t = new Date(f).getTime(); return t ? Math.floor((Date.now() - t) / 86400000) : 0; }
  function btn(txt, js){ return '<button type="button" onclick="'+js+'" style="display:inline-block;margin:6px 6px 0 0;background:#EEF3FE;border:1px solid #C9D6F5;color:#1A56DB;border-radius:999px;padding:7px 12px;font:inherit;font-size:12.5px;font-weight:700;cursor:pointer;">'+txt+'</button>'; }
  function cerrar(){ return "var m=document.getElementById('global-chat-modal');if(m)m.remove();"; }
  function ficha(c){ return btn('Abrir a ' + e(nom(c)), cerrar() + "showScreen('portal');setTimeout(function(){abrirFichaCandidato('" + e(c.id) + "')},350)"); }
  function nota(id){ var v = ((leer('cerco_valoraciones', {})[id] || {}).v || []).filter(function(x){ return x > 0; }); return v.length ? v.reduce(function(a,b){ return a+b; }, 0) / v.length : null; }
  var REF = { hig:['higienista',18000,32000], aux:['auxiliar',15000,23000], recep:['recepción',15000,24000], odo:['odontólogo/a',30000,90000], orto:['ortodoncista',30000,90000] };
  var EXP = ['sin','menos de 1','1','2','3','5','más de 5','10'];
  function expN(c){ if(c.sinExperiencia) return 0; var t = norm(c.experiencia), m = t.match(/\d+/); var n = m ? +m[0] : 0; return /mas de/.test(t) ? n + 1 : (/menos/.test(t) ? 0.5 : n); }

  function esperan(){ return cands().filter(function(c){ return c.estado === 'enviada' || c.estado === 'vista'; }).sort(function(a,b){ return new Date(a.fecha) - new Date(b.fecha); }); }
  function sinValorar(){ return cands().filter(function(c){ return c.estado === 'entrevista' && nota(c.id) == null; }); }
  function faltaOferta(o){
    var f = [];
    if(!String(o.salario || '').replace(/[^\d]/g,'')) f.push('el sueldo');
    if(!((o.turnos || []).length || o.horario)) f.push('el horario');
    if((o.funciones || []).length < 2) f.push('las tareas del día a día');
    if(!o.proceso) f.push('cómo será el proceso');
    if(String(o.descripcion || '').length < 60) f.push('una descripción de la clínica');
    return f;
  }
  function activas(){ return ofertas().filter(function(o){ return !o.cerrada && o.estado !== 'cerrada' && o.estado !== 'pausada'; }); }
  function porOferta(id){ return cands().filter(function(c){ return String(c.ofertaId) === String(id); }); }

  /* ---- respuestas ---- */
  function rEsperan(){
    var l = esperan();
    if(!l.length) return 'Nadie espera tu respuesta ahora mismo. Vas al día.';
    var h = (l.length === 1 ? '<b>1 persona espera</b> tu respuesta:' : '<b>' + l.length + ' personas esperan</b> tu respuesta, de más a menos tiempo:') + '<br>';
    l.slice(0,5).forEach(function(c){
      var d = dias(c.fecha), q = Math.max(0, 5 - d);
      h += '• <b>' + e(c.nombre || 'Sin nombre') + '</b> · ' + e(c.ofertaTitulo || '') + ' · ' + (d === 0 ? 'hoy' : 'hace ' + d + (d === 1 ? ' día' : ' días')) + (q <= 2 ? ' · <b style="color:#B42318;">' + (q === 0 ? 'se cierra hoy' : 'quedan ' + q + (q === 1 ? ' día' : ' días')) + '</b>' : '') + '<br>';
    });
    h += 'Lo acordado en CERCO es contestar en 2 días laborables; a los 5 la solicitud se cierra sola y cuenta en tu tasa de respuesta.<br>';
    l.slice(0,3).forEach(function(c){ h += ficha(c); });
    return h;
  }
  function rHoy(){
    var p = [], l = esperan(), sv = sinValorar();
    if(l.length) p.push('<b>Contestar a ' + (l.length === 1 ? e(l[0].nombre || 'un candidato') : l.length + ' candidatos') + '</b>' + (dias(l[0].fecha) >= 2 ? ' — ' + e(nom(l[0])) + ' lleva ' + dias(l[0].fecha) + ' días esperando' : '') + '.');
    if(sv.length) p.push('<b>Valorar la entrevista de ' + sv.map(function(c){ return e(nom(c)); }).slice(0,3).join(', ') + '</b>: con la nota puesta puedo compararlos.');
    activas().forEach(function(o){ var f = faltaOferta(o); if(f.length) p.push('<b>Completar la oferta «' + e(o.titulo || 'sin título') + '»</b>: le falta ' + f.slice(0,3).join(', ') + '.'); });
    activas().forEach(function(o){ var n = porOferta(o.id).length, d = dias(o.fecha || o.creada || o.publicada); if(!n && d >= 7) p.push('<b>«' + e(o.titulo) + '» lleva ' + d + ' días sin solicitudes</b>. Pregúntame «revisa mis ofertas».'); });
    cands().filter(function(c){ return c.estado === 'contratada'; }).forEach(function(c){ var h = (c.acogida && c.acogida.h) || leer('cerco_acogida', {})[c.id] || []; var n = h.filter(Boolean).length; if(n < 8) p.push('<b>Plan de acogida de ' + e(nom(c)) + '</b>: ' + n + ' de 8 pasos hechos.'); });
    var r; try{ r = CDB.resumen(); }catch(x){}
    if(r && !r.miDiscHecho) p.push('<b>Hacer tu test</b>: sin él no puedo leer tu equipo.');
    if(!ofertas().length) p.push('<b>Publicar tu primera oferta</b>: sin oferta no llegan candidatos.');
    if(!p.length) return 'Lo tienes todo al día: nadie espera respuesta y tus ofertas están completas.';
    var h = 'Por orden de importancia:<br>' + p.slice(0,5).map(function(x, i){ return (i+1) + '. ' + x; }).join('<br>');
    if(l.length) h += '<br>' + ficha(l[0]);
    return h;
  }
  function puntos(c){
    var s = 0, m = [];
    if(c.titulacion){ s += 3; m.push('titulación indicada'); }
    var x = expN(c); s += Math.min(3, x * 0.6); if(x >= 3) m.push(e(c.experiencia)); else if(x === 0) m.push('primer empleo');
    if(typeof c.kmOferta === 'number'){ s += c.kmOferta <= 10 ? 2 : (c.kmOferta <= 25 ? 1 : 0); m.push(c.kmOferta < 1 ? 'misma zona' : 'a ' + Math.round(c.kmOferta) + ' km'); }
    if(/inmediat|ya|ahora/i.test(c.disponibilidad || '')){ s += 1.5; m.push('puede empezar ya'); } else if(c.disponibilidad) m.push('incorporación: ' + e(String(c.disponibilidad).toLowerCase()));
    if(c.cv) s += 0.5; if(c.video){ s += 0.5; }
    var n = nota(c.id); if(n != null){ s += n * 1.5; m.push('tu nota de entrevista: ' + n.toLocaleString('es-ES', {maximumFractionDigits:1}) + ' de 4'); }
    return { s:s, m:m };
  }
  function rQuien(){
    var vivos = cands().filter(function(c){ return ['enviada','vista','entrevista'].indexOf(c.estado) > -1; });
    if(!vivos.length) return 'Ahora no tienes solicitudes abiertas. Cuando lleguen, te digo por quién empezar y por qué.';
    var por = {}; vivos.forEach(function(c){ (por[c.ofertaId] = por[c.ofertaId] || []).push(c); });
    var h = '', ks = Object.keys(por);
    ks.slice(0,3).forEach(function(k){
      var l = por[k].map(function(c){ var p = puntos(c); return { c:c, s:p.s, m:p.m }; }).sort(function(a,b){ return b.s - a.s; });
      h += '<b>' + e(l[0].c.ofertaTitulo || 'Oferta') + '</b> (' + l.length + ')<br>';
      l.slice(0,3).forEach(function(x, i){ h += (i+1) + '. <b>' + e(x.c.nombre || 'Sin nombre') + '</b> — ' + (x.m.slice(0,4).join(', ') || 'pocos datos en su perfil') + '<br>'; });
      if(l.length >= 2) h += btn('Comparar lado a lado', cerrar() + "CERCO_comparar('" + e(k) + "')") + '<br>';
    });
    return h + '<span style="color:#6B7280;font-size:12.5px;">Ordeno por lo que pide el puesto: titulación, experiencia, distancia, disponibilidad y tu nota de entrevista. No uso la foto, el vídeo ni el test para ordenar. La decisión es tuya.</span>';
  }
  function rCandidato(c){
    var n = nota(c.id), T = { enviada:'sin abrir', vista:'pendiente de tu respuesta', entrevista:'en entrevista', contratada:'contratada', descartada:'descartada', caducada:'cerrada sin respuesta', retirada:'retirada por la persona' };
    var h = '<b>' + e(c.nombre) + '</b> · ' + e(c.ofertaTitulo || '') + ' · ' + (T[c.estado] || c.estado) + '.<br>'
      + [c.sinExperiencia ? 'Primer empleo en clínica' : (c.experiencia ? 'Experiencia: ' + e(c.experiencia) : ''), c.titulacion ? 'Titulación: ' + e(c.titulacion) : '', typeof c.kmOferta === 'number' ? (c.kmOferta < 1 ? 'Misma zona' : 'A ' + Math.round(c.kmOferta) + ' km') : '', c.disponibilidad ? 'Incorporación: ' + e(c.disponibilidad) : '', c.jornada ? 'Jornada: ' + e(c.jornada) : '', (c.fuertes || []).length ? 'Puntos fuertes: ' + e(c.fuertes.slice(0,3).join(', ')) : '', n != null ? 'Tu nota de entrevista: ' + n.toLocaleString('es-ES', {maximumFractionDigits:1}) + ' de 4' : ''].filter(Boolean).join(' · ') + '.<br>';
    if(c.estado === 'enviada' || c.estado === 'vista') h += 'Lleva ' + dias(c.fecha) + ' días esperando. ';
    if(c.estado === 'entrevista' && n == null) h += 'Aún no has valorado su entrevista: en su ficha tienes las 4 preguntas. ';
    return h + '<br>' + ficha(c);
  }
  function rOfertas(){
    var l = ofertas();
    if(!l.length) return 'No tienes ninguna oferta publicada. Las que más solicitudes reciben dejan claro cinco cosas: sueldo, horario, tareas, contrato y cómo es el proceso.<br>' + btn('Crear oferta', cerrar() + "showScreen('crear-oferta')");
    var h = '';
    l.slice(0,4).forEach(function(o){
      var n = porOferta(o.id).length, f = faltaOferta(o), g = REF[grupo(o.titulo)];
      h += '<b>' + e(o.titulo || 'Sin título') + '</b> · ' + n + ' solicitud' + (n === 1 ? '' : 'es') + '<br>';
      if(f.length) h += '• Le falta ' + f.join(', ') + '. Cada cosa que falta es gente que no solicita.<br>'; else h += '• Está completa.<br>';
      var nums = (String(o.salario || '').match(/\d{1,3}(?:[.\s]\d{3})+|\d{4,6}/g) || []).map(function(x){ return +x.replace(/[.\s]/g,''); }).filter(function(x){ return x >= 8000; });
      if(g && nums.length && /año/i.test(o.salario)){ var med = (Math.min.apply(null,nums) + Math.max.apply(null,nums)) / 2, t1 = g[1] + (g[2]-g[1]) / 3; if(med < t1) h += '• El sueldo queda en la parte baja de la referencia para ' + g[0] + ' (' + g[1].toLocaleString('es-ES') + '–' + g[2].toLocaleString('es-ES') + ' €). Si no puedes subirlo, compénsalo con horario o formación y dilo en la oferta.<br>'; }
    });
    return h + btn('Ver mis ofertas', cerrar() + "showScreen('ofertes')");
  }
  function rSueldo(q){
    var k = /higien/.test(q) ? 'hig' : /auxiliar/.test(q) ? 'aux' : /recep/.test(q) ? 'recep' : /ortodon/.test(q) ? 'orto' : /odontol|dentista/.test(q) ? 'odo' : null;
    var f = function(g){ return '<b>' + g[0].charAt(0).toUpperCase() + g[0].slice(1) + '</b>: ' + g[1].toLocaleString('es-ES') + '–' + g[2].toLocaleString('es-ES') + ' € brutos/año'; };
    return (k ? f(REF[k]) : ['hig','aux','recep','odo'].map(function(x){ return f(REF[x]); }).join('<br>'))
      + '.<br>Es una referencia orientativa del sector a jornada completa; el convenio de tu provincia marca el mínimo. El sueldo es lo primero que mira un candidato: 6 de cada 10 no solicitan si no aparece.';
  }
  function rPreguntas(c){
    var g = grupo((c && (c.profesion || c.ofertaTitulo)) || ((activas()[0] || {}).titulo));
    var P1 = { hig:'Explícame paso a paso cómo haces un mantenimiento periodontal.', aux:'¿Cómo preparas el gabinete y el instrumental para una endodoncia?', odo:'Cuéntame un caso complejo reciente y cómo lo planificaste.', orto:'Cuéntame cómo planificas un caso de alineadores de principio a fin.', recep:'Un paciente pide cita urgente y la agenda está llena. ¿Qué haces?', coord:'¿Qué miras cada semana para saber si la clínica va bien?' };
    return 'Haz <b>las mismas 4 preguntas a todos</b> y ponles nota del 1 al 4. Es la forma de entrevistar que mejor acierta:<br>'
      + '1. «' + (P1[g] || 'Cuéntame una tarea habitual de tu puesto y cómo la haces paso a paso.') + '»<br>'
      + '2. «Cuéntame una vez que un paciente estaba nervioso o molesto. ¿Qué hiciste exactamente?»<br>'
      + '3. «Cuéntame un desacuerdo con un compañero y cómo lo resolvisteis.»<br>'
      + '4. «Este es el horario y el sueldo de la oferta. ¿Hay algo que no te encaje?»<br>'
      + 'Pide siempre un caso real, no una opinión. <b>No preguntes</b> por edad, embarazo o planes de familia, salud, origen ni religión.'
      + (c ? '<br>' + ficha(c) : '');
  }
  function rLegal(){ return 'En una entrevista o en un mensaje <b>no se puede preguntar</b> por: edad, embarazo o planes de tener hijos, estado civil, salud o bajas anteriores, origen o nacionalidad, religión, ideas políticas ni afiliación sindical. Tampoco descartar por ninguno de esos motivos.<br>Sí puedes preguntar todo lo del puesto: titulación, experiencia, disponibilidad horaria y cuándo puede empezar.<br><span style="color:#6B7280;font-size:12.5px;">Es una orientación general, no asesoramiento legal.</span>'; }
  function rDescartar(){ return 'Di que no pronto y con motivo: 7 de cada 10 candidatos prefieren un «no» rápido a quedarse sin saber. En la ficha, al pulsar <b>Descartar</b>, eliges uno de los 6 motivos del puesto y te dejo el mensaje escrito; tú lo retocas.<br>Solo motivos del puesto, nunca personales.' + (esperan()[0] ? '<br>' + ficha(esperan()[0]) : ''); }
  function rCifras(){
    var l = cands(); if(!l.length) return 'Todavía no hay solicitudes, así que no hay cifras. En cuanto llegue la primera empiezo a medir cuánto tardas en contestar.';
    var t = [], ent = 0, con = 0;
    l.forEach(function(c){ var h = (c.historial || []).filter(function(x){ return ['entrevista','descartada','contratada'].indexOf(x.estado) > -1; })[0]; if(h) t.push((new Date(h.fecha) - new Date(c.fecha)) / 3600000); if((c.historial || []).some(function(x){ return x.estado === 'entrevista'; })) ent++; if(c.estado === 'contratada') con++; });
    var m = t.length ? t.reduce(function(a,b){ return a+b; }, 0) / t.length : null;
    return '<b>' + l.length + '</b> solicitudes → <b>' + ent + '</b> entrevistas → <b>' + con + '</b> contrataciones.<br>'
      + (m == null ? 'Aún no has contestado ninguna.' : 'Tardas de media <b>' + (m < 24 ? Math.max(1, Math.round(m)) + ' h' : (m / 24).toLocaleString('es-ES', {maximumFractionDigits:1}) + ' días') + '</b> en contestar. ' + (m <= 72 ? 'Vas dentro de lo que espera la mitad de los candidatos (3 días).' : 'La mitad de los candidatos espera noticias en 3 días: ahí se pierden los mejores.'))
      + '<br>' + btn('Ver estadísticas', cerrar() + "showScreen('stats')");
  }
  function rAcogida(){
    var l = cands().filter(function(c){ return c.estado === 'contratada'; });
    return 'La mayoría de las bajas llegan en los tres primeros meses, y casi siempre por el ambiente. En la ficha de cada persona contratada tienes el <b>plan de acogida de 90 días</b>: condiciones por escrito antes de empezar, presentación al equipo, charla a la semana, al mes y antes de acabar el periodo de prueba.' + (l[0] ? '<br>' + ficha(l[0]) : '');
  }
  function rEquipo(){
    var r; try{ r = CDB.resumen(); }catch(x){ return 'Ahora mismo no puedo leer los datos de tu equipo.'; }
    if(r.miembros === 0) return 'Todavía no hay ningún test hecho, así que no puedo decirte nada de tu equipo. Empieza por el tuyo.' + '<br>' + btn('Hacer mi test', cerrar() + "showScreen('testdisc')");
    if(r.miembros < 3) return 'De momento tengo ' + r.miembros + ' test. Con menos de 3 personas cualquier lectura sería inventada. Pásales el enlace desde Mi equipo.';
    var c = r.comp, fl = 'D', min = 101; ['D','I','S','C'].forEach(function(l){ if(c[l] < min){ min = c[l]; fl = l; } });
    return 'Con ' + r.miembros + ' test: D ' + c.D + '%, I ' + c.I + '%, S ' + c.S + '%, C ' + c.C + '%. '
      + (min < 15 ? 'La forma de trabajar con menos presencia es ' + CDB.NOMBRE[fl] + ' (' + fl + ').' : 'Está bastante repartido, sin huecos claros.')
      + '<br><span style="color:#6B7280;font-size:12.5px;">Úsalo para preparar la conversación con un candidato, no para descartar a nadie: el test describe un estilo, no predice quién trabajará mejor.</span>';
  }
  function rTest(){ return 'El test tiene 15 preguntas con 4 frases cada una; cada frase se puntúa del 1 al 4 y se puede repetir nota. Lo que cuenta es la diferencia entre frases, así que poner un 4 a todo no sube nada. Las frases salen en un orden distinto para cada persona. Si alguien deja casi todo igual, sale «Perfil sin definir» y no cuenta en el equipo hasta que lo repase.'; }
  function rGuardados(){ var n = 0; try{ n = (leer('cerco_cand_guardados', []) || []).length; }catch(x){} return (n ? 'Tienes ' + n + ' candidato' + (n === 1 ? '' : 's') + ' guardado' + (n === 1 ? '' : 's') + '.' : 'Aún no has guardado a nadie. En cada tarjeta y en la ficha tienes el marcador para guardar.') + '<br>' + btn('Ver guardados', cerrar() + "showScreen('portal');setTimeout(function(){try{verGuardados()}catch(x){}},350)"); }

  var _viejo = window.respuestaSeimian;
  window.respuestaSeimian = function(pregunta){
    var q = norm(pregunta);
    try{
      // ¿nombra a un candidato?
      var c = cands().filter(function(x){ var n = norm(nom(x)); return n.length > 2 && new RegExp('\\b' + n.replace(/[^a-z]/g,'') + '\\b').test(q); })[0];
      if(/no (puedo|debo|se puede) pregunt|ilegal|prohibid|embaraz|discrimin|\bedad\b/.test(q)) return rLegal();
      if(/que (le )?pregunt|preguntas|guion|como entrevist|prepar\w* (la )?entrevista/.test(q)) return rPreguntas(c);
      if(c) return rCandidato(c);
      if(/hoy|pendiente|prioridad|que hago|por donde|resumen|que tengo|urgente/.test(q)) return rHoy();
      if(/cifra|estadist|cuanto tardo|tasa|numeros|datos|embudo/.test(q)) return rCifras();
      if(/espera|contest|respond|plazo|sin responder|cuanto tiempo tengo/.test(q)) return rEsperan();
      if(/a quien|mejor candidat|recomiend|compar|quien (es|encaja)|ordena|ranking|por quien/.test(q)) return rQuien();
      if(/descart|rechaz|decir que no|decirle que no/.test(q)) return rDescartar();
      if(/sueldo|salario|cuanto (se )?(paga|cobra)|pagar|bruto/.test(q)) return rSueldo(q);
      if(/acogida|primer dia|incorpora|onboarding|rotacion|se van|se marchan|reten/.test(q)) return rAcogida();
      if(/guardad/.test(q)) return rGuardados();
      if(/como funciona el test|repetir (nota|numero)|trampa|sin perfil/.test(q)) return rTest();
      if(/enlace|invitar|codigo/.test(q)) return 'En Mi equipo tienes el enlace para tu gente. Lo abren, hacen el test (5 minutos) y el resultado te llega solo; si no hay conexión, te pasan un código que pegas ahí mismo.' + '<br>' + btn('Ir a Mi equipo', cerrar() + "showScreen('equipo')");
      if(/oferta|publicar|puesto|vacante|no (recibo|llegan|me llegan)|pocas solicitudes|mejorar/.test(q)) return rOfertas();
      if(/equipo|plantilla|disc|composici|falta|perfil/.test(q)) return rEquipo();
      if(/candidat|solicitud|curriculum|\bcv\b|encaje/.test(q)){ var n = cands().length; return n ? 'Tienes ' + n + ' solicitud' + (n === 1 ? '' : 'es') + ', ' + esperan().length + ' esperando respuesta. ' + 'Pregúntame «¿a quién entrevisto primero?» y te los ordeno con el porqué.' : 'Aún no has recibido solicitudes reales. Los perfiles de la pantalla de Candidatos marcados como ejemplo son de muestra.'; }
      if(/^(hola|buenas|hey|que tal)/.test(q)) return 'Hola. ' + rHoy();
      if(/gracias|perfecto|vale|ok\b/.test(q)) return 'A ti. Aquí sigo.';
      if(/quien eres|eres (una )?(ia|persona|robot)|que (eres|sabes|puedes)/.test(q)) return capacidades();
    }catch(x){ try{ return _viejo(pregunta); }catch(y){} }
    return 'Eso no lo sé contestar con seguridad, y prefiero decírtelo a inventarlo.<br>' + capacidades();
  };
  function capacidades(){ return 'Soy el asistente automático de CERCO (no una persona) y solo leo los datos de tu clínica. Puedo decirte:<br>• <b>qué hacer hoy</b> y quién espera respuesta<br>• <b>a quién entrevistar primero</b> y por qué<br>• <b>qué preguntar</b> en la entrevista y qué no se puede preguntar<br>• <b>qué le falta a tus ofertas</b> y sueldos de referencia<br>• <b>tus cifras</b>, tu equipo y el plan de acogida<br>También puedes escribir el nombre de un candidato.'; }

  // atajos nuevos
  window._dreceresSeimian = function(cont){
    if(!cont) cont = document.getElementById('chat-messages'); if(!cont) return;
    var vell = document.getElementById('seimian-dreceres'); if(vell) vell.remove();
    var caixa = document.createElement('div'); caixa.id = 'seimian-dreceres';
    caixa.style.cssText = 'display:flex;flex-wrap:wrap;gap:6px;align-self:flex-start;max-width:100%;margin-top:2px;';
    ['¿Qué hago hoy?','¿A quién entrevisto primero?','Revisa mis ofertas','¿Qué pregunto en la entrevista?','¿Qué le falta a mi equipo?'].forEach(function(t){
      var b = document.createElement('button'); b.type = 'button'; b.textContent = t;
      b.style.cssText = 'background:white;border:1.5px solid #DBEAFE;color:#1A56DB;border-radius:999px;padding:8px 12px;font-size:12.5px;font-weight:700;cursor:pointer;font-family:inherit;line-height:1.3;min-height:36px;';
      b.onclick = function(){ caixa.remove(); addChatMsg(e(t), 'me'); var ty = document.getElementById('chat-typing'); if(ty) ty.style.display = 'block'; setTimeout(function(){ if(ty) ty.style.display = 'none'; addChatMsg(window.respuestaSeimian(t), 'them'); window._dreceresSeimian(); }, 500); };
      caixa.appendChild(b);
    });
    cont.appendChild(caixa); cont.scrollTop = cont.scrollHeight;
  };
  // al abrir: primero lo urgente
  var _abrir = window.abrirSeimian;
  if(typeof _abrir === 'function') window.abrirSeimian = function(){
    var r = _abrir.apply(this, arguments);
    setTimeout(function(){
      try{
        var cont = document.getElementById('chat-messages'); if(!cont || !window.__chatSeimian) return;
        if(esperan().length || sinValorar().length || activas().some(function(o){ return faltaOferta(o).length; })){
          var dr = document.getElementById('seimian-dreceres'); if(dr) dr.remove();
          var ult = cont.lastElementChild; if(ult && /^\s*Hola/.test(ult.textContent || '')) ult.remove();
          addChatMsg('Hola. ' + rHoy(), 'them');
        }
        window._dreceresSeimian(cont);
        var i = document.getElementById('chat-input'); if(i) i.placeholder = 'Pregunta o escribe el nombre de un candidato';
      }catch(x){}
    }, 120);
    return r;
  };
})();

