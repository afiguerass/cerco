/* Archivo sacado tal cual de candidato.html (Fase 1, paso 1.6). El orden de carga
   importa: se carga en el mismo sitio de la página donde estaba. */
/* ================================================================
   CERCO · LO QUE FALLA EN EL SECTOR, RESUELTO AQUÍ (lado profesional)
   Cada bloque responde a una queja repetida contra portales, redes
   y agencias de empleo:
   1. Plazos justos: días laborables y clínicas de vacaciones
   2. Consentimiento claro antes del test
   3. Denunciar una oferta o una clínica, y dejar de verla
   4. Clínicas verificadas (y decir cuándo aún no lo están)
   5. Quién puede ver tu perfil completo
   6. Que una persona revise tu caso; cómo se calcula el encaje
   7. ¿Te dieron lo que prometía la oferta? (seguimiento)
   8. Recordatorio de la entrevista
   ================================================================ */
Object.assign(ICO, {
  flag:'<path d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1z"/><line x1="4" x2="4" y1="22" y2="15"/>',
  ban:'<circle cx="12" cy="12" r="10"/><path d="m4.9 4.9 14.2 14.2"/>',
  help:'<circle cx="12" cy="12" r="10"/><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"/><path d="M12 17h.01"/>'
});

/* ---------- 1. plazos en días laborables ---------- */
// horas transcurridas contando solo de lunes a viernes
function horasHabiles(desde, hasta){
  var t = new Date(desde).getTime(), fin = hasta || Date.now(), n = 0;
  if(isNaN(t) || fin <= t) return 0;
  var tope = Math.min(fin, t + 90*86400000);
  for(var x = t; x < tope; x += 3600000){ var d = new Date(x).getDay(); if(d !== 0 && d !== 6) n++; }
  return n;
}
function vacacionesDe(cid){
  var c = S.clinicas[cid] || {}, v = c.vacacionesHasta;
  return v && new Date(v + 'T23:59:59').getTime() > Date.now() ? v : null;
}
function inicioPlazo(s){
  var u = ultimaActividadClinica(s), c = S.clinicas[s.clinicaId] || {};
  // si la clínica estuvo de vacaciones, el plazo cuenta desde que volvió
  if(c.vacacionesHasta){ var f = new Date(c.vacacionesHasta + 'T23:59:59').toISOString(); if(f > u && f < new Date().toISOString()) u = f; }
  return u;
}
function horasEsperando(s){ return horasHabiles(inicioPlazo(s)); }
function fechaCorta(iso){ var d = new Date(iso + (String(iso).length === 10 ? 'T12:00:00' : '')); return isNaN(d) ? '' : d.getDate() + ' de ' + ['enero','febrero','marzo','abril','mayo','junio','julio','agosto','septiembre','octubre','noviembre','diciembre'][d.getMonth()]; }
procesarCaducadas = function(){
  if(_caducando || !S.solsCargadas || !S.clinicasCargadas || !Nube.uid) return;
  var lim = diasCaduca() * 24;
  var l = S.sols.filter(function(s){ return (s.estado === 'enviada' || s.estado === 'vista') && !vacacionesDe(s.clinicaId) && horasEsperando(s) > lim; });
  if(!l.length) return;
  _caducando = true;
  Promise.all(l.map(function(s){
    var ahora = new Date().toISOString();
    return Nube.cambiar(s, {estado:'caducada', historial:(s.historial || []).concat([{estado:'caducada', fecha:ahora}])}).then(function(){ _estadosVistos[s.id] = 'caducada'; return s; }).catch(function(){ return null; });
  })).then(function(r){
    r = r.filter(Boolean); if(!r.length) return;
    var reb = ['auto','preguntar'].indexOf((S.perfil||{}).rebote) > -1;
    avisar((r.length === 1 ? (r[0].clinicaNombre || 'Una clínica') + ' no ha contestado en ' + diasCaduca() + ' días laborables: hemos cerrado la solicitud.' : r.length + ' clínicas no han contestado en ' + diasCaduca() + ' días laborables: hemos cerrado esas solicitudes.')
      + (reb ? ' Te buscamos otra.' : ''), r.length === 1 ? 'solicitud:' + r[0].id : 'inicio');
  }).then(function(){ _caducando = false; refrescar(); });
};
// la tarjeta de espera de cada solicitud
function tarjetaPlazo(s){
  if(s.estado !== 'enviada' && s.estado !== 'vista') return '';
  var vac = vacacionesDe(s.clinicaId), reb = ['auto','preguntar'].indexOf((S.perfil||{}).rebote) > -1;
  if(vac) return '<div class="card" style="background:#F4F7FE;border-color:#C9D6F5;display:flex;gap:12px;align-items:flex-start;">'+svg('cal','#1A56DB',20)+'<div><div style="font-size:14px;font-weight:800;color:#1E3A8A;margin-bottom:3px;">La clínica está de vacaciones hasta el '+esc(fechaCorta(vac))+'</div><div style="font-size:13px;color:#1E3A8A;line-height:1.55;">Ha pausado sus plazos. Te contestará a la vuelta; el plazo de '+diasCaduca()+' días laborables empieza entonces.</div></div></div>';
  var hh = horasEsperando(s), quedan = Math.max(0, Math.ceil((diasCaduca()*24 - hh) / 24));
  if(hh < 48) return '<div class="card" style="background:#F3FBF7;border-color:#BFE9D7;display:flex;gap:12px;align-items:flex-start;">'+svg('clock','#0E9F6E',20)+'<div><div style="font-size:14px;font-weight:800;color:#0B5B43;margin-bottom:3px;">Siempre tendrás respuesta</div><div style="font-size:13px;color:#0B5B43;line-height:1.55;">CERCO pide a las clínicas que contesten en 2 días laborables. Si en '+diasCaduca()+' no lo ha hecho, cerramos la solicitud para que no esperes'+(reb ? ' y te buscamos otra clínica' : '')+'. Los fines de semana no cuentan.</div></div></div>';
  return '<div class="card" style="background:#FFF8EC;border-color:#FDE9C8;display:flex;gap:12px;align-items:flex-start;">'+svg('clock','#8A5A00',20)+'<div><div style="font-size:14px;font-weight:800;color:#8A5A00;margin-bottom:3px;">Lleva más de 2 días laborables sin contestar</div><div style="font-size:13px;color:#8A5A00;line-height:1.55;">En su panel ya le aparece como fuera de plazo. '+(quedan ? 'Si en '+quedan+' día'+(quedan === 1 ? '' : 's')+' laborable'+(quedan === 1 ? '' : 's')+' más no contesta, la cerramos' : 'La cerramos hoy')+(reb ? ' y te presentamos a otra clínica' : '')+'. Mientras, puedes escribirle abajo o mirar otras ofertas.</div></div></div>';
}

/* ---------- 2. consentimiento antes del test ---------- */
var _testEmpezarOrig = window.testEmpezar;
window.testEmpezar = function(){
  var c = $('t-consent');
  if(c && !c.checked && !((S.perfil||{}).consentTest)){ error('t-cons-err', 'Marca la casilla para hacer el test. Si prefieres no hacerlo ahora, puedes seguir viendo las ofertas.'); try{ c.focus(); }catch(e){} return; }
  error('t-cons-err', '');
  if(S.perfil && !S.perfil.consentTest) S.perfil.consentTest = new Date().toISOString();
  return _testEmpezarOrig.apply(this, arguments);
};
var _gpSector = Nube.guardarPerfil;
Nube.guardarPerfil = function(p){
  var self = this;
  return _gpSector.call(this, p).then(function(r){
    var d = {};
    if(p.consentTest) d.consentTest = String(p.consentTest).slice(0,30);
    if(Array.isArray(p.bloqueadas)) d.bloqueadas = p.bloqueadas.slice(-100).map(String);
    return Object.keys(d).length ? self.db().collection('candidatos').doc(self.uid).set(d, {merge:true}).then(function(){ return r; }) : r;
  });
};

/* ---------- 3. denunciar y dejar de ver ---------- */
var MOTIVOS_C = ['La oferta parece falsa o no existe','Me piden dinero, el DNI o datos bancarios','Texto o preguntas discriminatorias (edad, sexo, origen, embarazo, salud)','El salario o las condiciones no son los de la oferta','Trato inadecuado','Se hacen pasar por otra clínica','Otro motivo'];
function modalDenuncia(tipo, objetoId, clinicaId, nombre){
  cerrarModal();
  var m = document.createElement('div'); m.className = 'modal-bg'; m.id = 'modal';
  m.onclick = function(e){ if(e.target === m) cerrarModal(); };
  m.innerHTML = '<div class="modal" role="dialog" aria-modal="true"><h2>Denunciar '+(tipo === 'oferta' ? 'esta oferta' : 'a esta clínica')+'</h2>'
    + '<p>'+esc(nombre || '')+'. Lo revisa una persona de CERCO. La clínica no sabrá que has sido tú.</p>'
    + '<div class="ops" role="radiogroup" id="dn-ops">' + MOTIVOS_C.map(function(t, i){ return '<button type="button" role="radio" aria-checked="false" class="op" data-i="'+i+'" onclick="document.querySelectorAll(\'#dn-ops .op\').forEach(function(o){ o.classList.remove(\'on\'); o.setAttribute(\'aria-checked\',\'false\'); }); this.classList.add(\'on\'); this.setAttribute(\'aria-checked\',\'true\');"><b>'+esc(t)+'</b></button>'; }).join('') + '</div>'
    + '<div class="field" style="margin-top:12px;"><label for="dn-t">Cuéntanos qué ha pasado <span class="opc">(opcional)</span></label><textarea class="inp" id="dn-t" maxlength="600"></textarea></div>'
    + '<div class="err" id="m-err"></div>'
    + '<div class="acts"><button class="btn btn-s" onclick="cerrarModal()">Cancelar</button><button class="btn btn-p" id="m-btn" onclick="enviarDenuncia(\''+esc(tipo)+'\',\''+esc(objetoId)+'\',\''+esc(clinicaId)+'\')">Enviar</button></div></div>';
  document.body.appendChild(m);
}
function enviarDenuncia(tipo, objetoId, clinicaId){
  var on = document.querySelector('#dn-ops .op.on'); if(!on) return error('m-err', 'Elige un motivo.');
  if(!unaVez('denuncia', 1500)) return;
  bloquear('m-btn', 'Enviando…');
  Nube.db().collection('denuncias').add({ de:Nube.uid, rol:'candidato', tipo:tipo, objetoId:String(objetoId), clinicaId:String(clinicaId||''), motivo:MOTIVOS_C[+on.dataset.i], texto:val('dn-t').slice(0,600), fecha:new Date().toISOString(), estado:'nueva' })
    .then(function(){ cerrarModal(); toast('Recibido. Una persona de CERCO lo revisará. Gracias por avisar.'); })
    .catch(function(){ bloquear('m-btn'); error('m-err', 'No se ha podido enviar. Revisa tu conexión.'); });
}
function pedirRevision(sid){
  var s = buscarSol(sid); if(!s || !unaVez('revision', 1500)) return;
  Nube.db().collection('denuncias').add({ de:Nube.uid, rol:'candidato', tipo:'revision', objetoId:String(sid), clinicaId:String(s.clinicaId||''), motivo:'Pide que una persona revise su caso', texto:'Estado: ' + s.estado + (s.origen === 'rebote' ? ' · presentada por CERCO' : ''), fecha:new Date().toISOString(), estado:'nueva' })
    .then(function(){ toast('Hecho. Una persona de CERCO revisará tu caso y te escribirá a tu correo.'); })
    .catch(function(){ toast('No se ha podido enviar. Revisa tu conexión.'); });
}
function bloquearClinica(cid, nombre){
  var l = ((S.perfil||{}).bloqueadas || []).slice(); if(l.indexOf(String(cid)) === -1) l.push(String(cid));
  var oc = ((S.perfil||{}).ocultar || []).slice(); if(oc.indexOf(String(cid)) === -1) oc.push(String(cid));
  guardarAjuste({bloqueadas:l, ocultar:oc}, 'Ya no verás ofertas de ' + (nombre || 'esa clínica') + ' ni podrá invitarte.').then(function(){ ir('ofertas'); });
}
function desbloquearClinica(cid){
  guardarAjuste({ bloqueadas:((S.perfil||{}).bloqueadas || []).filter(function(x){ return x !== String(cid); }), ocultar:((S.perfil||{}).ocultar || []).filter(function(x){ return x !== String(cid); }) }, 'Vuelves a ver sus ofertas');
}
var _ofVisSector = window.ofertasVisibles;
window.ofertasVisibles = function(){
  var b = (S.perfil||{}).bloqueadas || [], l = _ofVisSector();
  return b.length ? l.filter(function(o){ return b.indexOf(String(o.clinicaId)) === -1; }) : l;
};

/* ---------- 4. clínicas verificadas y condiciones cumplidas ---------- */
S.verif = {}; S.condiciones = {};
function cargarConfianza(cid){
  if(!cid || S.verif[cid] !== undefined) return;
  S.verif[cid] = null;
  var db = Nube.db();
  db.collection('verificaciones').doc(String(cid)).get().then(function(d){ S.verif[cid] = d.exists && d.data().verificada ? d.data() : false; if(S.vista === 'oferta') pintarDetalle(); }).catch(function(){ S.verif[cid] = false; });
  db.collection('condiciones').where('clinicaId','==',String(cid)).get().then(function(q){ var l = []; q.forEach(function(x){ l.push(!!x.data().ok); }); S.condiciones[cid] = l; if(S.vista === 'oferta') pintarDetalle(); }).catch(function(){});
}
function bloqueConfianza(o){
  if(o.ejemplo) return '';
  cargarConfianza(o.clinicaId);
  var v = S.verif[o.clinicaId], c = S.condiciones[o.clinicaId] || [], h = '';
  if(v) h += '<span class="resp-ok">'+svg('shield','#0E9F6E',13)+'Clínica verificada por CERCO</span>';
  else if(v === false) h += '<span class="sin-ver">'+svg('info','#8A5A00',13)+'Aún sin verificar por CERCO</span>';
  if(c.length >= 3){ var ok = c.filter(Boolean).length / c.length; if(ok >= 0.8) h += '<span class="resp-ok">'+svg('check','#0E9F6E',13)+'Cumple lo que promete en sus ofertas</span>'; }
  return h ? '<div class="confi">'+h+'</div>' : '';
}

/* ---------- 5 y 6. pie de la oferta y de la solicitud ---------- */
function pieOferta(o){
  if(o.ejemplo) return '';
  return '<div class="pie-seg">'
    + '<div class="pie-aviso">'+svg('shield','#6B7280',15)+'<span>CERCO nunca te pedirá dinero ni tu DNI para solicitar. Una clínica tampoco debería hacerlo antes de contratarte.</span></div>'
    + '<div class="pie-links"><button class="link" onclick="modalEncaje()">'+svg('help','currentColor',14)+'Cómo calculamos el encaje y el orden</button>'
    + '<button class="link" onclick="modalDenuncia(\'oferta\',\''+esc(o.id)+'\',\''+esc(o.clinicaId)+'\',\''+esc(String(o.titulo||'').replace(/'/g,''))+' · '+esc(String(o.clinica||'').replace(/'/g,''))+'\')">'+svg('flag','currentColor',14)+'Denunciar esta oferta</button>'
    + '<button class="link" onclick="bloquearClinica(\''+esc(o.clinicaId)+'\',\''+esc(String(o.clinica||'').replace(/'/g,''))+'\')">'+svg('ban','currentColor',14)+'No ver más ofertas de esta clínica</button></div></div>';
}
function pieSolicitud(s){
  var cerrada = s.estado === 'descartada' || s.estado === 'caducada';
  return '<div class="pie-seg">'
    + '<div class="pie-aviso">'+svg('shield','#6B7280',15)+'<span>Si te piden dinero, el DNI o datos del banco antes de contratarte, o te hacen preguntas sobre edad, embarazo o salud, denúncialo aquí.</span></div>'
    + '<div class="pie-links">'
    + (cerrada || s.origen === 'rebote' ? '<button class="link" onclick="pedirRevision(\''+esc(s.id)+'\')">'+svg('user','currentColor',14)+'Pedir que una persona de CERCO revise mi caso</button>' : '')
    + '<button class="link" onclick="modalEncaje()">'+svg('help','currentColor',14)+'Cómo calculamos el encaje</button>'
    + '<button class="link" onclick="modalDenuncia(\'clinica\',\''+esc(s.id)+'\',\''+esc(s.clinicaId)+'\',\''+esc(String(s.clinicaNombre||'').replace(/'/g,''))+'\')">'+svg('flag','currentColor',14)+'Denunciar a esta clínica</button></div></div>';
}
function modalEncaje(){
  cerrarModal();
  var m = document.createElement('div'); m.className = 'modal-bg'; m.id = 'modal';
  m.onclick = function(e){ if(e.target === m) cerrarModal(); };
  m.innerHTML = '<div class="modal" role="dialog" aria-modal="true"><h2>Cómo calculamos el encaje y el orden</h2>'
    + '<p><b>El encaje</b> compara tu test de estilo de trabajo con los rasgos que la clínica marcó al publicar la oferta. 100 % sería que tus dos rasgos más altos son justo los que pide. Es una fórmula fija, igual para todos; no la decide una persona ni aprende sola.</p>'
    + '<p><b>Qué no es:</b> no mide tu capacidad ni tu experiencia, y no predice cómo te irá en el puesto. Por eso siempre va con la palabra «orientativo» y la clínica ve el aviso «Haz la entrevista igualmente».</p>'
    + '<p><b>El orden de las ofertas</b> lo eliges tú: por encaje, por cercanía o por fecha. Ninguna clínica paga por salir antes.</p>'
    + '<p><b>Ninguna decisión es automática:</b> quién pasa a entrevista y a quién se contrata lo decide siempre la clínica. Si crees que no te han tratado bien, puedes pedir que una persona de CERCO revise tu caso desde la solicitud.</p>'
    + '<div class="acts"><button class="btn btn-p" onclick="cerrarModal()">Entendido</button></div></div>';
  document.body.appendChild(m);
}
function anadirPie(boxId, html){ var b = $(boxId); if(!b || !html) return; var v = b.querySelector('.pie-seg'); if(v) v.remove(); b.insertAdjacentHTML('beforeend', html); }
// Detalle de oferta: confianza, vacaciones y pie. La usa pintarDetalle (profesional/01-portal.js)
  window.CERCO_detalleConfianza = function(){
    try{
    var o = buscarOferta(S.actual); if(!o) return;
    var cab = document.querySelector('#od .det-h'); if(cab && !document.querySelector('#od .confi')) cab.insertAdjacentHTML('afterend', bloqueConfianza(o));
    var vac = vacacionesDe(o.clinicaId);
    if(vac && cab && !document.querySelector('#od .vac-av')) cab.insertAdjacentHTML('afterend', '<div class="aviso aviso-info vac-av">'+svg('cal','#1E3A8A',16)+'<span>La clínica está de vacaciones hasta el '+esc(fechaCorta(vac))+'. Puedes solicitar ya: te contestará a la vuelta.</span></div>');
    anadirPie('od', pieOferta(o)); pintarIconos($('od'));
  }catch(e){}
  };
// Solicitud: pie con denunciar y cómo calculamos el encaje. La usa pintarSolicitud (profesional/01-portal.js)
  window.CERCO_solicitudPie = function(){
    try{ var s = buscarSol(S.actualSol); if(s){ anadirPie('sd', pieSolicitud(s)); pintarIconos($('sd')); } }catch(e){}
  };

/* ---------- 5. quién puede ver tu perfil completo ---------- */
// Ajustes: quién puede ver tu perfil completo. La usa pintarAjustes (profesional/02-lideres-y-efecto-rebote.js)
  window.CERCO_ajustesQuienTeVe = function(){
    try{
    var box = $('pf-ajustes'); if(!box || box.querySelector('#aj-quien')) return;
    var vis = {}, filas = [];
    S.sols.slice().sort(function(a,b){ return String(a.fecha).localeCompare(String(b.fecha)); }).forEach(function(s){
      if(vis[s.clinicaId]) return; vis[s.clinicaId] = 1;
      filas.push('<div class="aj-row"><div><b>'+esc(s.clinicaNombre||'Clínica')+'</b><small>Desde el '+esc(fechaCorta(s.fecha))+' · '+(s.origen === 'rebote' ? 'te presentó CERCO, con tu permiso' : (s.invitada ? 'solicitaste tras su invitación' : (esVisita(s) ? 'pediste conocer la clínica' : 'le enviaste una solicitud')))+'</small></div></div>');
    });
    var bl = (S.perfil||{}).bloqueadas || [], nom = clinicasConocidas();
    var h = '<div class="card" id="aj-quien"><h3>'+svg('eye','currentColor',16)+'Quién puede ver tu perfil completo</h3>'
      + '<p class="txt" style="font-size:13.5px;margin-bottom:8px;">Tu nombre, vídeo, CV y contacto solo los ven las clínicas de esta lista. Nadie más, y nunca se venden ni se ceden a terceros.</p>'
      + (filas.length ? filas.join('') : '<div class="hint" style="margin:0;">Todavía ninguna: no has enviado solicitudes.</div>')
      + (bl.length ? '<div style="margin-top:14px;font-size:13px;font-weight:700;">Clínicas que has dejado de ver</div><div class="chips" style="margin-top:8px;">' + bl.map(function(id){ return '<span class="chip" role="button" onclick="desbloquearClinica(\''+esc(id)+'\')">'+esc(nom[id] || 'Clínica')+' · volver a ver</span>'; }).join('') + '</div>' : '')
      + '</div>';
    var datos = box.lastElementChild; if(datos) datos.insertAdjacentHTML('beforebegin', h); else box.insertAdjacentHTML('beforeend', h);
    pintarIconos(box);
  }catch(e){}
  };

/* ---------- 7. seguimiento: ¿te dieron lo que prometía la oferta? ---------- */
var _segPaso = {};
responderSeguimiento = function(id, sigue){
  _segPaso[id] = { sigue:!!sigue }; pintarInicio();
};
function responderCondiciones(id, ok){
  var s = buscarSol(id), a = _segPaso[id]; if(!s || !a || !unaVez('seg', 800)) return;
  var mes = new Date().toISOString().slice(0,7);
  Nube.cambiar(s, {seguimientoC:{sigue:a.sigue, f:new Date().toISOString()}})
    .then(function(){ return Nube.db().collection('condiciones').add({clinicaId:String(s.clinicaId), ok:!!ok, mes:mes}).catch(function(){}); })
    .then(function(){ delete _segPaso[id]; toast('Gracias. Con esto los demás profesionales saben qué clínicas cumplen.'); refrescar(); })
    .catch(function(){ toast('No se ha podido guardar. Revisa tu conexión.'); });
}
var _extraSector = window.bloqueInicioExtra;
window.bloqueInicioExtra = function(){
  var h = _extraSector.apply(this, arguments), pend = seguimientosPendientes()[0];
  if(pend && _segPaso[pend.id]){
    var card = '<div class="card seg-card"><div class="eyebrow">'+svg('users','currentColor',13)+'SEGUIMIENTO</div>'
      + '<div style="font-size:15px;font-weight:800;margin-bottom:4px;">¿El salario y el horario fueron los de la oferta?</div>'
      + '<p class="txt" style="font-size:13.5px;margin-bottom:12px;">En '+esc(pend.clinicaNombre||'la clínica')+'. Se guarda sin tu nombre.</p>'
      + '<div class="prop-a"><button class="btn btn-p" onclick="responderCondiciones(\''+esc(pend.id)+'\', true)">Sí, lo que ponía</button><button class="btn btn-s" onclick="responderCondiciones(\''+esc(pend.id)+'\', false)">No coincidían</button></div></div>';
    h = h.replace(/<div class="card seg-card">[\s\S]*?<\/div><\/div>/, card);
  }
  return h;
};

/* ---------- 8. recordatorio de la entrevista ---------- */
// Al refrescar: recordatorio de la cita 24 h antes. La usa refrescar (profesional/01-portal.js)
  window.CERCO_refrescarRecordatorios = function(){
    try{
    S.sols.forEach(function(s){
      if(s.estado !== 'entrevista' || !s.cita) return;
      var falta = new Date(s.cita.fecha).getTime() - Date.now(), k = 'cerco_rec_' + s.id + '_' + s.cita.v;
      if(falta > 0 && falta < 26*3600000 && !sessionStorage.getItem(k)){
        sessionStorage.setItem(k, '1');
        avisar((s.cita.estado === 'confirmada' ? 'Recuerda: ' : 'Sin confirmar: ') + (esVisita(s) ? 'visita' : 'entrevista') + ' con ' + (s.clinicaNombre || 'la clínica') + ' ' + fechaCitaC(s.cita.fecha).toLowerCase() + (s.cita.estado === 'confirmada' ? '.' : '. Confírmala o pide otro día.'), 'solicitud:' + s.id);
      }
    });
  }catch(e){}
  };

