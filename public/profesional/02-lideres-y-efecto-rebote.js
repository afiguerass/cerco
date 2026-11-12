/* Archivo sacado tal cual de candidato.html (Fase 1, paso 1.6). El orden de carga
   importa: se carga en el mismo sitio de la página donde estaba. */
/* ================================================================
   CERCO · LO QUE HACEN LOS LÍDERES + EFECTO REBOTE
   - Avisos del navegador y app instalable (sin servidor)
   - Efecto rebote: si una clínica te descarta (o no contesta en 5 días),
     CERCO te presenta a otra a la que le falte justo tu perfil
   - Invitaciones de clínicas, perfil anónimo visible y ocultable
   - Caducidad a los 5 días, solicitudes destacadas, ofertas guardadas
     y alertas, guía salarial, seguimiento a los 90 días, valoración
   - Descargar tus datos y eliminar tu cuenta
   ================================================================ */
Object.assign(ICO, {
  bookmark:'<path d="m19 21-7-4-7 4V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v16z"/>',
  bell:'<path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9"/><path d="M10.3 21a1.94 1.94 0 0 0 3.4 0"/>',
  star:'<polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>',
  share:'<circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/><path d="m8.59 13.51 6.83 3.98"/><path d="m15.41 6.51-6.82 3.98"/>',
  download:'<path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><path d="m7 10 5 5 5-5"/><path d="M12 15V3"/>',
  shield:'<path d="M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z"/>',
  rebote:'<path d="m17 2 4 4-4 4"/><path d="M3 11v-1a4 4 0 0 1 4-4h14"/><path d="m7 22-4-4 4-4"/><path d="M21 13v1a4 4 0 0 1-4 4H3"/>',
  movil:'<rect width="14" height="20" x="5" y="2" rx="2"/><path d="M12 18h.01"/>'
});

/* ---------- 1. avisos fuera de la pantalla ---------- */
var AV = { sw:null, instalar:null };
function avisosSoportados(){ return 'Notification' in window; }
function avisosActivos(){ return avisosSoportados() && Notification.permission === 'granted'; }
function registrarSW(){
  if(!('serviceWorker' in navigator) || !/^https?:/.test(location.protocol)) return;
  try{
    navigator.serviceWorker.register('sw.js').then(function(r){ AV.sw = r; }).catch(function(){});
    navigator.serviceWorker.addEventListener('message', function(e){ if(e.data && e.data.cerco === 'abrir') abrirDesdeAviso(e.data.url); });
  }catch(e){}
}
window.addEventListener('beforeinstallprompt', function(e){ e.preventDefault(); AV.instalar = e; refrescarAjustes(); });
// Lo que antes era solo un aviso en pantalla: si la app está en segundo plano, también llega como notificación
function avisar(txt, dest){
  toast(txt);
  if(!avisosActivos() || !document.hidden) return;
  var url = 'candidato.html' + (dest ? '#' + dest : '');
  var op = { body:txt, icon:'icono-192.png', badge:'icono-192.png', tag:dest || 'cerco', data:{url:url} };
  try{
    if(AV.sw && AV.sw.showNotification) AV.sw.showNotification('CERCO', op);
    else { var n = new Notification('CERCO', op); n.onclick = function(){ try{ window.focus(); }catch(e){} abrirDesdeAviso(url); n.close(); }; }
  }catch(e){}
}
function abrirDesdeAviso(url){
  var h = String(url || '').split('#')[1] || '', p = h.split(':');
  if((p[0] === 'solicitud' || p[0] === 'oferta') && p[1]) ir(p[0], p.slice(1).join(':'));
  else if(p[0] === 'inicio') ir('inicio');
}
function activarAvisos(){
  if(!avisosSoportados()){ toast(esIOS() && !enApp() ? 'En iPhone, primero añade CERCO a tu pantalla de inicio.' : 'Este navegador no permite avisos.'); return; }
  Notification.requestPermission().then(function(r){
    toast(r === 'granted' ? 'Avisos activados en este dispositivo' : 'Has bloqueado los avisos. Puedes activarlos en los ajustes del navegador.');
    refrescarAjustes(); if(S.vista === 'inicio') pintarInicio();
  });
}
function instalarApp(){
  if(!AV.instalar) return;
  AV.instalar.prompt();
  AV.instalar.userChoice.then(function(){ AV.instalar = null; refrescarAjustes(); }).catch(function(){});
}
function esIOS(){ return /iphone|ipad|ipod/i.test(navigator.userAgent || ''); }
function enApp(){ try{ return matchMedia('(display-mode: standalone)').matches || !!navigator.standalone; }catch(e){ return false; } }

/* ---------- 2. perfil: ajustes nuevos ---------- */
var _gpOrig = Nube.guardarPerfil;
Nube.guardarPerfil = function(p){
  var self = this;
  return _gpOrig.call(this, p).then(function(r){
    var d = {};
    if(p.rebote !== undefined) d.rebote = ['auto','preguntar','no'].indexOf(p.rebote) > -1 ? p.rebote : 'no';
    if(p.visible !== undefined) d.visible = !!p.visible;
    if(p.alertas !== undefined) d.alertas = !!p.alertas;
    if(Array.isArray(p.ocultar)) d.ocultar = p.ocultar.slice(0,50).map(String);
    if(Array.isArray(p.guardadas)) d.guardadas = p.guardadas.slice(-100).map(String);
    if(Array.isArray(p.rebotados)) d.rebotados = p.rebotados.slice(-200).map(String);
    if(Array.isArray(p.propuestas)) d.propuestas = p.propuestas.slice(-20);
    if(p.colegiado !== undefined) d.colegiado = String(p.colegiado||'').slice(0,20);
    if(p.colegio !== undefined) d.colegio = String(p.colegio||'').slice(0,80);
    if(p.ref) d.ref = String(p.ref).slice(0,40);
    var w = Object.keys(d).length ? self.db().collection('candidatos').doc(self.uid).set(d, {merge:true}) : Promise.resolve();
    return w.then(function(){ try{ publicarTalento(p); }catch(e){} return r; });
  });
};
function guardarAjuste(cambios, msg){
  var p = Object.assign({}, S.perfil, cambios);
  return Nube.guardarPerfil(p).then(function(){ S.perfil = p; refrescarAjustes(); if(msg) toast(msg); refrescar(); })
    .catch(function(){ toast('No se ha podido guardar. Revisa tu conexión.'); });
}

/* Perfil anónimo para que las clínicas que buscan tu perfil te inviten.
   Sin nombre, foto, teléfono ni correo. */
function publicarTalento(p){
  p = p || S.perfil || {};
  if(!Nube.uid) return;
  var ref = Nube.db().collection('talento').doc(Nube.uid);
  if(!p.visible || !p.disc || !p.profesion){ ref.delete().catch(function(){}); return; }
  var g = geoLimpio(p.geo);
  ref.set({
    profesion:p.profesion||'', experiencia:p.experiencia||'', jornada:p.jornada||'', disponibilidad:p.disponibilidad||'',
    fuertes:(p.fuertes||[]).slice(0,5), disc:{dom:p.disc.dom, sec:p.disc.sec, norm:p.disc.norm},
    geo: g ? {lat:Math.round(g.lat*100)/100, lng:Math.round(g.lng*100)/100, prov:g.prov, n:g.n} : null,
    radio: p.radio || 25, video:!!p.video, cv:!!p.cv, colegiado:!!p.colegiado,
    ocultar:(p.ocultar||[]).slice(0,50), actualizado:new Date().toISOString()
  }).catch(function(){});
}

/* ---------- 3. invitaciones de clínicas y propuestas de CERCO ---------- */
S.invs = [];
var _unsubInv = null;
function escucharInvs(){
  if(_unsubInv){ try{ _unsubInv(); }catch(e){} }
  var primera = true;
  try{
    _unsubInv = Nube.db().collection('invitaciones').where('candidatoUid','==',Nube.uid).onSnapshot(function(s){
      var l = []; s.forEach(function(d){ var x = d.data(); x.id = d.id; l.push(x); });
      if(!primera){
        var antes = {}; S.invs.forEach(function(i){ antes[i.id] = 1; });
        l.filter(function(i){ return !antes[i.id] && i.estado === 'pendiente'; }).forEach(function(i){
          avisar((i.clinica || 'Una clínica') + ' te invita a solicitar ' + (i.ofertaTitulo || 'una oferta'), 'oferta:' + i.ofertaId);
        });
      }
      primera = false; S.invs = l; refrescar();
    }, function(){});
  }catch(e){}
}
function invDeOferta(id){ for(var i=0;i<S.invs.length;i++) if(String(S.invs[i].ofertaId) === String(id) && S.invs[i].estado === 'pendiente') return S.invs[i]; return null; }
function propDeOferta(id){ var l = (S.perfil||{}).propuestas || []; for(var i=0;i<l.length;i++) if(String(l[i].ofertaId) === String(id) && !l[i].no) return l[i]; return null; }
function propuestas(){
  var out = [];
  S.invs.forEach(function(i){
    var o = buscarOferta(i.ofertaId);
    if(i.estado === 'pendiente' && o && !solDeOferta(o.id)) out.push({tipo:'clinica', o:o, inv:i});
  });
  ((S.perfil||{}).propuestas || []).forEach(function(pr){
    var o = buscarOferta(pr.ofertaId);
    if(!pr.no && o && !solDeOferta(o.id) && !out.some(function(x){ return x.o.id === o.id; })) out.push({tipo:'cerco', o:o, pr:pr});
  });
  return out;
}
function tarjetaPropuesta(x){
  var o = x.o, p = S.perfil || {}, k = kmDe(o, p.geo), pct = encaje(p.disc, o);
  var cab = x.tipo === 'clinica'
    ? '<b>'+esc(o.clinica||'Una clínica')+'</b> te invita a solicitar'
    : '<b>CERCO te propone</b> otra clínica que busca tu perfil';
  var porque = x.tipo === 'clinica' ? (x.inv.mensaje ? '«'+esc(x.inv.mensaje)+'»' : 'Ha visto tu perfil anónimo y cree que encajas.') : esc(x.pr.motivo || '');
  return '<div class="card prop'+(x.tipo === 'cerco' ? ' prop-c' : '')+'">'
    + '<div class="prop-h">'+svg(x.tipo === 'cerco' ? 'rebote' : 'send', x.tipo === 'cerco' ? '#66328A' : '#1A56DB', 17)+'<span>'+cab+'</span></div>'
    + '<div class="prop-t" onclick="ir(\'oferta\',\''+esc(o.id)+'\')">'+esc(o.titulo)+'</div>'
    + '<div class="prop-s">'+esc(o.clinica||'')+(k !== null ? ' · a '+k+' km' : '')+(pct !== null ? ' · '+etiquetaEncaje(pct).toLowerCase()+' ('+pct+' %)' : '')+(o.salario ? ' · '+esc(o.salario) : '')+'</div>'
    + '<div class="prop-p">'+porque+'</div>'
    + '<div class="prop-a"><button class="btn btn-p" onclick="modalSolicitar(\''+esc(o.id)+'\')">'+svg('send','#fff',15)+(x.tipo === 'cerco' ? 'Enviar mi perfil' : 'Solicitar')+'</button>'
    + '<button class="btn btn-s" onclick="ir(\'oferta\',\''+esc(o.id)+'\')">Ver la oferta</button>'
    + '<button class="btn btn-g" onclick="rechazarPropuesta(\''+esc(x.tipo)+'\',\''+esc(o.id)+'\')">No me interesa</button></div></div>';
}
function rechazarPropuesta(tipo, oid){
  if(tipo === 'clinica'){
    var i = invDeOferta(oid); if(!i) return;
    Nube.db().collection('invitaciones').doc(i.id).update({estado:'rechazada', respondida:new Date().toISOString()})
      .then(function(){ i.estado = 'rechazada'; toast('Hecho. La clínica sabrá que esta vez no te interesa.'); refrescar(); })
      .catch(function(){ toast('No se ha podido guardar. Revisa tu conexión.'); });
  } else {
    var l = ((S.perfil||{}).propuestas || []).map(function(p){ return String(p.ofertaId) === String(oid) ? Object.assign({}, p, {no:true}) : p; });
    guardarAjuste({propuestas:l}, 'Hecho. Te seguiremos buscando otras.');
  }
}

/* ---------- 4. efecto rebote ---------- */
var PROF_RE = {
  'Higienista dental':/higien/i, 'Auxiliar de clínica dental':/auxiliar|asistente|ayudante/i,
  'Odontólogo/a':/odont|dentist|implant|endodon|periodon|est[eé]tica dental|general/i, 'Ortodoncista':/ortodon/i,
  'Protésico/a dental':/prot[eé]sic|laboratorio/i, 'Recepción y atención al paciente':/recepci|atenci[oó]n al paciente|front ?desk|administrativ/i,
  'Coordinación o gerencia de clínica':/coordinad|gerent|direct|manager|responsable/i
};
function mismaProfesion(o, p){ var re = PROF_RE[(p||{}).profesion]; return re ? re.test(o.titulo || '') : true; }
function clinicasQueDescartaron(){ var no = {}; S.sols.forEach(function(s){ if(s.estado === 'descartada') no[s.clinicaId] = 1; }); return no; }
function elegirRebote(s){
  var p = S.perfil || {}, d = p.disc; if(!d) return null;
  var no = clinicasQueDescartaron(); no[s.clinicaId] = 1;
  var mejor = null;
  S.ofertas.forEach(function(o){
    if(!o.clinicaId || no[o.clinicaId] || solDeOferta(o.id) || propDeOferta(o.id) || invDeOferta(o.id)) return;
    if(!mismaProfesion(o, p)) return;
    if(p.geo && !enRadio(o, p.geo, p.radio || 25)) return;
    var eq = ((S.clinicas[o.clinicaId] || {}).equipo) || {}, fit = encaje(d, o) || 0;
    var falta = eq.falta === d.dom ? 2 : (eq.falta === d.sec ? 1 : 0);
    var comp = eq.comp && eq.comp[d.dom] != null ? +eq.comp[d.dom] : null;
    if(fit < 55 && !falta) return;
    var sc = fit + falta*20 + (comp !== null ? (50 - comp)/2 : 0) - (kmDe(o, p.geo) || 0)/5;
    if(!mejor || sc > mejor.sc){
      var ps = perfilesDe(o);
      mejor = { o:o, sc:sc, pct:encaje(d, o),
        motivo: falta === 2 ? 'A su equipo le falta sobre todo perfil ' + NOMBRE[d.dom].toLowerCase() + ', que es justo el tuyo.'
              : falta === 1 ? 'A su equipo le falta perfil ' + NOMBRE[d.sec].toLowerCase() + ', tu segundo rasgo.'
              : (ps.indexOf(d.dom) > -1 ? 'Busca perfil ' + NOMBRE[d.dom].toLowerCase() + ', que es el tuyo.' : (ps.indexOf(d.sec) > -1 ? 'Busca perfil ' + NOMBRE[d.sec].toLowerCase() + ', tu segundo rasgo.' : 'Tu forma de trabajar encaja con lo que buscan.')),
        motivoCl: falta === 2 ? 'A tu equipo le falta sobre todo perfil ' + NOMBRE[d.dom] + ' (' + d.dom + ') y es su rasgo principal.'
                : falta === 1 ? 'A tu equipo le falta perfil ' + NOMBRE[d.sec] + ' (' + d.sec + ') y es su segundo rasgo.'
                : 'Pides ' + ps.join(' + ') + ' y es ' + NOMBRE[d.dom] + ' con rasgo ' + NOMBRE[d.sec].toLowerCase() + ' (' + encaje(d, o) + ' % de encaje).' };
    }
  });
  return mejor;
}
var _rebotando = false;
function procesarRebotes(){
  var p = S.perfil || {};
  if(_rebotando || !Nube.uid || !p.disc || (p.rebote !== 'auto' && p.rebote !== 'preguntar')) return;
  if(!S.solsCargadas || !S.ofertasCargadas || !S.clinicasCargadas || !hayReales()) return;
  var hechos = p.rebotados || [];
  var pend = S.sols.filter(function(s){ return !esVisita(s) && (s.estado === 'descartada' || s.estado === 'caducada') && hechos.indexOf(s.id) === -1; });
  if(!pend.length) return;
  // nunca más de 3 presentaciones de CERCO abiertas a la vez
  var vivas = S.sols.filter(function(s){ return s.origen === 'rebote' && ['enviada','vista','entrevista'].indexOf(s.estado) > -1; }).length
            + propuestas().filter(function(x){ return x.tipo === 'cerco'; }).length;
  if(vivas >= 3) return;
  var s = null, el = null;
  for(var i=0;i<pend.length && !el;i++){ el = elegirRebote(pend[i]); if(el) s = pend[i]; }
  if(!el) return;   // ahora no hay ninguna; lo volveremos a intentar cuando se publiquen más
  _rebotando = true;
  var nHechos = hechos.concat([s.id]), n = (s.rebote && s.rebote.n || 0) + 1;
  var fin = function(){ _rebotando = false; setTimeout(procesarRebotes, 300); };
  if(p.rebote === 'auto'){
    var msg = 'Hola. CERCO me ha propuesto para este puesto porque mi forma de trabajar encaja con lo que buscáis. Me encantaría conoceros.';
    Nube.solicitar(el.o, p, msg, el.pct, null, null, {origen:'rebote', rebote:{motivo:el.motivoCl, motivoC:el.motivo, n:n}}).then(function(doc){
      if(!S.sols.some(function(x){ return x.id === doc.id; })) S.sols.unshift(doc);
      _estadosVistos[doc.id] = 'enviada';
      return guardarAjuste({rebotados:nHechos}).then(function(){
        avisar('Te hemos presentado a ' + (el.o.clinica || 'otra clínica') + ' (' + el.o.titulo + '). ' + el.motivo, 'solicitud:' + doc.id);
      });
    }).catch(function(){}).then(fin);
  } else {
    var pr = ((p.propuestas || []).slice()); pr.push({ofertaId:String(el.o.id), motivo:el.motivo, motivoCl:el.motivoCl, n:n, f:new Date().toISOString()});
    guardarAjuste({rebotados:nHechos, propuestas:pr}).then(function(){
      avisar('CERCO te propone ' + (el.o.clinica || 'otra clínica') + ': ' + el.motivo, 'oferta:' + el.o.id);
    }).then(fin);
  }
}

/* ---------- 5. si la clínica no contesta en 5 días, se cierra ---------- */
function ultimaActividadClinica(s){
  var t = [s.fecha];
  (s.historial || []).forEach(function(h){ if(h.estado === 'vista') t.push(h.fecha); });
  (s.mensajes || []).forEach(function(m){ if(m.de === 'clinica') t.push(m.f); });
  return t.filter(Boolean).sort().slice(-1)[0];
}
function diasCaduca(){ return window.CERCO_DIAS_CADUCA || 5; }
var _caducando = false;
function procesarCaducadas(){
  if(_caducando || !S.solsCargadas || !Nube.uid) return;
  var lim = diasCaduca() * 86400000;
  var l = S.sols.filter(function(s){ return (s.estado === 'enviada' || s.estado === 'vista') && Date.now() - new Date(ultimaActividadClinica(s)) > lim; });
  if(!l.length) return;
  _caducando = true;
  Promise.all(l.map(function(s){
    var ahora = new Date().toISOString();
    return Nube.cambiar(s, {estado:'caducada', historial:(s.historial || []).concat([{estado:'caducada', fecha:ahora}])}).then(function(){ _estadosVistos[s.id] = 'caducada'; return s; }).catch(function(){ return null; });
  })).then(function(r){
    r = r.filter(Boolean); if(!r.length) return;
    var reb = ['auto','preguntar'].indexOf((S.perfil||{}).rebote) > -1;
    avisar((r.length === 1 ? (r[0].clinicaNombre || 'Una clínica') + ' no ha contestado en ' + diasCaduca() + ' días: hemos cerrado la solicitud.' : r.length + ' clínicas no han contestado en ' + diasCaduca() + ' días: hemos cerrado esas solicitudes.')
      + (reb ? ' Te buscamos otra.' : ''), r.length === 1 ? 'solicitud:' + r[0].id : 'inicio');
  }).then(function(){ _caducando = false; refrescar(); });
}

/* ---------- 6. encaje en palabras, ofertas guardadas y alertas ---------- */
function etiquetaEncaje(p, o){ if(o && otraProfesion(o)) return 'Otra profesión'; return p === null ? 'Haz el test' : (p >= 80 ? 'Encaje alto' : (p >= 65 ? 'Encaje medio' : 'Encaje bajo')); }
function estaGuardada(id){ return ((S.perfil||{}).guardadas || []).indexOf(String(id)) > -1; }
function alternarGuardada(id, ev){
  if(ev){ ev.stopPropagation(); ev.preventDefault(); }
  var l = ((S.perfil||{}).guardadas || []).slice(), i = l.indexOf(String(id));
  if(i > -1) l.splice(i, 1); else l.push(String(id));
  guardarAjuste({guardadas:l}).then(function(){
    if(i > -1) toast('Quitada de tus guardadas');
    else toast('Oferta guardada', 'Ver mis guardadas', verGuardadas);
    if(S.vista === 'ofertas') pintarOfertas();
  });
}
function nGuardadas(){
  var ids = (S.perfil||{}).guardadas || [];
  return ofertasVisibles().filter(function(o){ return ids.indexOf(String(o.id)) > -1; }).length;
}
// lleva a Ofertas con el filtro «Guardadas» puesto
function verGuardadas(){
  cerrarModal();
  S.filtro = 'guardadas';
  ir('ofertas');
  document.querySelectorAll('#of-fil .chip').forEach(function(x){ x.classList.toggle('on', x.dataset.f === 'guardadas'); });
  pintarOfertas(); window.scrollTo(0, 0);
}
function botonGuardar(o, grande){
  if(o.ejemplo) return '';
  var on = estaGuardada(o.id);
  return '<button class="guardar'+(on ? ' on' : '')+(grande ? ' g' : '')+'" aria-pressed="'+on+'" aria-label="'+(on ? 'Quitar de guardadas' : 'Guardar oferta')+'" onclick="alternarGuardada(\''+esc(o.id)+'\', event)">'+svg('bookmark', on ? '#1A56DB' : '#9CA3AF', grande ? 16 : 17)+(grande ? (on ? 'Guardada' : 'Guardar') : '')+'</button>';
}
function ofertaParaMi(o){
  var p = S.perfil || {};
  return mismaProfesion(o, p) && (!p.geo || enRadio(o, p.geo, p.radio || 25));
}

/* ---------- 7. guía salarial (con las ofertas reales de CERCO) ---------- */
var REF_SALARIO = { // referencia del sector, orientativa (EmpleoDental 2026)
  'Auxiliar de clínica dental':[15000,23000], 'Recepción y atención al paciente':[15000,24000],
  'Higienista dental':[18000,32000], 'Odontólogo/a':[30000,90000], 'Ortodoncista':[30000,90000]
};
function rolDe(o){ for(var k in PROF_RE) if(PROF_RE[k].test(o.titulo || '')) return k; return null; }
function anualDe(txt){
  var t = String(txt || ''); if(!/año/i.test(t)) return null;
  var n = (t.match(/\d{1,3}(?:[.\s]\d{3})+|\d{4,6}/g) || []).map(function(x){ return +x.replace(/[.\s]/g,''); }).filter(function(x){ return x >= 8000 && x <= 250000; });
  if(!n.length) return null;
  return [Math.min.apply(null, n), Math.max.apply(null, n)];
}
function milesK(x){ return (Math.round(x/500)/2).toLocaleString('es-ES') + 'k'; }
function guiaSalarial(rol, prov){
  if(!rol) return null;
  var l = S.ofertas.filter(function(o){ return rolDe(o) === rol && anualDe(o.salario); });
  var enProv = prov ? l.filter(function(o){ var g = geoOferta(o); return g && g.prov === prov; }) : [];
  var base = enProv.length >= 3 ? enProv : (l.length >= 3 ? l : null);
  if(base){
    var mins = base.map(function(o){ return anualDe(o.salario)[0]; }).sort(function(a,b){ return a-b; });
    var maxs = base.map(function(o){ return anualDe(o.salario)[1]; }).sort(function(a,b){ return a-b; });
    var med = function(a){ return a[Math.floor((a.length-1)/2)]; };
    return { min:med(mins), max:med(maxs), n:base.length, donde: base === enProv ? prov : 'España', fuente:'cerco' };
  }
  var r = REF_SALARIO[rol];
  return r ? { min:r[0], max:r[1], n:0, donde:'España', fuente:'sector' } : null;
}
function txtGuia(g, rol){
  if(!g) return '';
  var quien = {'Higienista dental':'higienistas','Auxiliar de clínica dental':'auxiliares','Odontólogo/a':'odontólogos','Ortodoncista':'ortodoncistas','Recepción y atención al paciente':'recepción','Protésico/a dental':'protésicos','Coordinación o gerencia de clínica':'coordinación'}[rol] || 'este puesto';
  return g.fuente === 'cerco'
    ? 'En CERCO, las ofertas de ' + quien + ' en ' + g.donde + ' pagan entre ' + milesK(g.min) + ' y ' + milesK(g.max) + ' € brutos al año (mediana de ' + g.n + ' ofertas).'
    : 'Referencia del sector para ' + quien + ': entre ' + milesK(g.min) + ' y ' + milesK(g.max) + ' € brutos al año (orientativo, EmpleoDental 2026).';
}

/* ---------- 8. solicitud: destacada, invitada, rebote ---------- */
function destacadasEsteMes(){
  var m = new Date().toISOString().slice(0,7);
  return S.sols.filter(function(s){ return s.destacada && String(s.fecha || '').slice(0,7) === m; }).length;
}
var MAX_DESTACADAS = 2;
/* Datos extra de una solicitud (y si ya preparaste la entrevista) (Fase 1: una sola versión) */
function extrasSolicitud(o){
  var r = _extrasSolicitudBase.apply(this, arguments);
  if(((S.perfil||{}).ensayos || []).indexOf(String(o.id)) > -1) r.preparada = true;
  return r;
}
function _extrasSolicitudBase(o){
  var x = {}, inv = invDeOferta(o.id), pr = propDeOferta(o.id), p = S.perfil || {};
  if(inv) x.invitada = true;
  if(pr) { x.origen = 'rebote'; x.rebote = {motivo:pr.motivoCl || '', motivoC:pr.motivo || '', n:pr.n || 1}; }
  var ch = $('m-dest'); if(ch && ch.checked && destacadasEsteMes() < MAX_DESTACADAS) x.destacada = true;
  if(p.colegiado){ x.colegiado = p.colegiado; x.colegio = p.colegio || ''; }
  return x;
}
function trasSolicitar(o){
  var inv = invDeOferta(o.id);
  if(inv) Nube.db().collection('invitaciones').doc(inv.id).update({estado:'aceptada', respondida:new Date().toISOString()}).then(function(){ inv.estado = 'aceptada'; }).catch(function(){});
}
function bloqueDestacar(){
  var q = MAX_DESTACADAS - destacadasEsteMes();
  var f = new Date(), ren = new Date(f.getFullYear(), f.getMonth() + 1, 1).toLocaleDateString('es-ES', {day:'numeric', month:'long'});
  if(q <= 0) return '<div class="dest-box off">'+svg('star','#9CA3AF',16)+'<span>Ya has usado tus 2 solicitudes destacadas de este mes. Puedes enviar esta igualmente, sin estrella. Tendrás 2 nuevas el '+ren+'.</span></div>';
  return '<label class="dest-box"><input type="checkbox" id="m-dest"><span>'+svg('star','#B45309',16)+'<span><b>Destacar esta solicitud</b> · te quedan '+q+' este mes<br><small>La clínica la verá arriba del todo, con una estrella: sabrá que es la que más te importa. Tienes 2 al mes, gratis; no se acumulan y vuelves a tener 2 el '+ren+'.</small></span></span></label>';
}

/* ---------- 9. seguimiento y valoración ---------- */
S.valoraciones = {};
function cargarValoraciones(cid){
  if(!cid || S.valoraciones[cid] !== undefined) return;
  S.valoraciones[cid] = null;
  Nube.db().collection('valoraciones').where('clinicaId','==',String(cid)).get().then(function(q){
    var l = []; q.forEach(function(d){ var x = d.data(); if(x.n >= 1 && x.n <= 5) l.push(+x.n); });
    S.valoraciones[cid] = l; if(S.vista === 'oferta') pintarDetalle();
  }).catch(function(){});
}
function mediaValoraciones(cid){
  var l = S.valoraciones[cid]; if(!l || l.length < 5) return null;
  return { m: Math.round(l.reduce(function(a,b){ return a+b; }, 0) / l.length * 10) / 10, n: l.length };
}
function diasSeguimiento(){ return window.CERCO_DIAS_SEGUIMIENTO || 90; }
function seguimientosPendientes(){
  return S.sols.filter(function(s){
    var f = fechaDe(s, 'contratada');
    return s.estado === 'contratada' && f && !s.seguimientoC && Date.now() - new Date(f) > diasSeguimiento()*86400000;
  });
}
function responderSeguimiento(id, sigue){
  var s = buscarSol(id); if(!s || !unaVez('seg', 800)) return;
  Nube.cambiar(s, {seguimientoC:{sigue:!!sigue, f:new Date().toISOString()}})
    .then(function(){ toast(sigue ? '¡Qué bien! Gracias por contárnoslo.' : 'Gracias. Si buscas algo nuevo, aquí tienes tus ofertas.'); refrescar(); })
    .catch(function(){ toast('No se ha podido guardar. Revisa tu conexión.'); });
}
function puedeValorar(s){
  if(esVisita(s) || s.valorada) return false;
  return s.estado === 'contratada' || (s.estado === 'descartada' && !!fechaDe(s, 'entrevista'));
}
function bloqueValorar(s){
  if(!puedeValorar(s)) return s.valorada ? '<div class="card"><h3>'+svg('star','currentColor',16)+'Has valorado este proceso</h3><p class="txt" style="font-size:13px;color:#6B7280;">Gracias. La clínica no sabe quién ha escrito cada valoración: solo ve la media cuando tiene al menos 5.</p></div>' : '';
  return '<div class="card" id="val-card"><h3>'+svg('star','currentColor',16)+'¿Cómo te han tratado en el proceso?</h3>'
    + '<p class="txt" style="font-size:13.5px;margin-bottom:10px;">Trato, puntualidad y claridad de '+esc(s.clinicaNombre||'la clínica')+'. Se guarda sin tu nombre; la clínica y los demás profesionales solo ven la media cuando hay al menos 5.</p>'
    + '<div class="estrellas" role="radiogroup" aria-label="Valoración">'+[1,2,3,4,5].map(function(n){ return '<button type="button" role="radio" aria-checked="false" aria-label="'+n+' de 5" data-n="'+n+'" onclick="marcarEstrellas('+n+')">'+svg('star','#E5E7EB',26)+'</button>'; }).join('')+'</div>'
    + '<textarea class="inp" id="val-t" maxlength="300" placeholder="Si quieres, cuéntanos algo más (opcional)" style="margin-top:10px;min-height:70px;"></textarea>'
    + '<div class="acts" style="margin-top:10px;"><button class="btn btn-p" id="val-ok" onclick="enviarValoracion(\''+esc(s.id)+'\')" disabled>Enviar valoración</button></div></div>';
}
var _estr = 0;
function marcarEstrellas(n){
  _estr = n;
  document.querySelectorAll('#val-card .estrellas button').forEach(function(b){
    var on = +b.dataset.n <= n; b.setAttribute('aria-checked', +b.dataset.n === n ? 'true' : 'false');
    b.innerHTML = svg('star', on ? '#F0A000' : '#E5E7EB', 26);
  });
  var ok = $('val-ok'); if(ok) ok.disabled = false;
}
function enviarValoracion(id){
  var s = buscarSol(id); if(!s || !_estr || !unaVez('val', 1000)) return;
  // la nota va a una colección aparte, sin quién la escribe; en la solicitud solo queda que ya valoraste
  var mes = new Date().toISOString().slice(0,7);
  Nube.db().collection('valoraciones').add({clinicaId:String(s.clinicaId), n:_estr, t:val('val-t').slice(0,300), mes:mes})
    .then(function(){ return Nube.cambiar(s, {valorada:true}); })
    .then(function(){ _estr = 0; toast('Gracias por tu valoración'); refrescar(); })
    .catch(function(){ toast('No se ha podido enviar. Revisa tu conexión.'); });
}

/* ---------- 10. inicio: lo nuevo ---------- */
/* Bloques extra de Inicio; si toca, la pregunta de seguimiento de condiciones (Fase 1: una sola versión) */
function bloqueInicioExtra(){
  var r = _bloqueInicioExtraBase.apply(this, arguments);
  // pregunta de seguimiento (salario y horario), de profesional/04-fallos-del-sector.js
  if(typeof _segPaso === 'undefined') return r;
  var h = r, pend = seguimientosPendientes()[0];
  if(pend && _segPaso[pend.id]){
    var card = '<div class="card seg-card"><div class="eyebrow">'+svg('users','currentColor',13)+'SEGUIMIENTO</div>'
      + '<div style="font-size:15px;font-weight:800;margin-bottom:4px;">¿El salario y el horario fueron los de la oferta?</div>'
      + '<p class="txt" style="font-size:13.5px;margin-bottom:12px;">En '+esc(pend.clinicaNombre||'la clínica')+'. Se guarda sin tu nombre.</p>'
      + '<div class="prop-a"><button class="btn btn-p" onclick="responderCondiciones(\''+esc(pend.id)+'\', true)">Sí, lo que ponía</button><button class="btn btn-s" onclick="responderCondiciones(\''+esc(pend.id)+'\', false)">No coincidían</button></div></div>';
    h = h.replace(/<div class="card seg-card">[\s\S]*?<\/div><\/div>/, card);
  }
  r = h;
  return r;
}
function _bloqueInicioExtraBase(){
  var p = S.perfil || {}, h = '';
  // seguimiento a los 90 días
  seguimientosPendientes().slice(0,1).forEach(function(s){
    h += '<div class="card seg-card"><div class="eyebrow">'+svg('users','currentColor',13)+'SEGUIMIENTO</div>'
      + '<div style="font-size:15px;font-weight:800;margin-bottom:4px;">¿Sigues en '+esc(s.clinicaNombre||'la clínica')+'?</div>'
      + '<p class="txt" style="font-size:13.5px;margin-bottom:12px;">Hace unos meses que empezaste. Tu respuesta nos ayuda a proponer mejores equipos a todos.</p>'
      + '<div class="prop-a"><button class="btn btn-p" onclick="responderSeguimiento(\''+esc(s.id)+'\', true)">Sí, sigo</button><button class="btn btn-s" onclick="responderSeguimiento(\''+esc(s.id)+'\', false)">Ya no</button></div></div>';
  });
  // las invitaciones y propuestas ya salen arriba, en "Necesitan tu respuesta"
  return h;
}
/* Sugerencias que se eligen una vez (rebote, que te encuentren, avisos): van al final del Inicio */
function bloqueSugerencias(){
  var p = S.perfil || {}, h = '';
  if(p.disc && !p.rebote){
    h += '<div class="card reb-card"><div class="eyebrow" style="color:#66328A;">'+svg('rebote','#66328A',13)+'NUEVO · EFECTO REBOTE</div>'
      + '<div style="font-size:15px;font-weight:800;margin-bottom:4px;">Si una clínica te dice que no, que no se pierda tu perfil</div>'
      + '<p class="txt" style="font-size:13.5px;margin-bottom:12px;">Cuando una clínica te descarte o no conteste en '+diasCaduca()+' días, CERCO busca otra de tu zona a la que le falte justo tu forma de trabajar.</p>'
      + '<div class="reb-ops">'
      + '<button class="btn btn-p" onclick="guardarAjuste({rebote:\'preguntar\'}, \'Te preguntaremos antes de cada una\')">Sí, pregúntame antes</button>'
      + '<button class="btn btn-s" onclick="guardarAjuste({rebote:\'auto\'}, \'Efecto rebote activado\')">Sí, preséntame automáticamente</button>'
      + '<button class="btn btn-g" onclick="guardarAjuste({rebote:\'no\'})">No, gracias</button></div>'
      + '<div class="hint" style="margin-top:8px;">Puedes cambiarlo cuando quieras en tu perfil. Solo te presentamos a clínicas dentro de tu distancia.</div></div>';
  } else if(p.disc && p.visible === undefined){
    h += '<div class="card"><div class="eyebrow">'+svg('eye','currentColor',13)+'QUE TE ENCUENTREN</div>'
      + '<div style="font-size:15px;font-weight:800;margin-bottom:4px;">¿Dejas que las clínicas que buscan tu perfil te inviten?</div>'
      + '<p class="txt" style="font-size:13.5px;margin-bottom:12px;">Verían tu profesión, tu experiencia, tu zona y tu perfil de personalidad. <b>Sin tu nombre, foto, teléfono ni correo.</b> Si te interesa, tú decides si solicitas.</p>'
      + '<div class="reb-ops"><button class="btn btn-p" onclick="guardarAjuste({visible:true}, \'Listo. Las clínicas que buscan tu perfil podrán invitarte.\')">Sí, que me inviten</button><button class="btn btn-g" onclick="guardarAjuste({visible:false})">Ahora no</button></div></div>';
  } else if(avisosSoportados() && Notification.permission === 'default' && !sessionStorage.getItem('cerco_av_no')){
    h += '<div class="card av-card">'+svg('bell','#1A56DB',20)+'<div style="flex:1;min-width:0;"><div style="font-size:14.5px;font-weight:800;">Entérate al momento cuando una clínica te conteste</div><div style="font-size:13px;color:#4B5563;">Activa los avisos en este dispositivo.</div></div>'
      + '<button class="btn btn-p" onclick="activarAvisos()">Activar</button><button class="gu-x" aria-label="Ahora no" onclick="sessionStorage.setItem(\'cerco_av_no\',\'1\'); pintarInicio()">'+svg('x','#9CA3AF',16)+'</button></div>';
  }
  return h;
}

/* ---------- 11. perfil: ajustes, datos y cuenta ---------- */
function refrescarAjustes(){ if(S.vista === 'perfil') pintarAjustes(); }
function interruptor(id, on, fn, txt, sub){
  return '<label class="sw-row"><span><b>'+txt+'</b>'+(sub ? '<small>'+sub+'</small>' : '')+'</span><input type="checkbox" role="switch" id="'+id+'"'+(on ? ' checked' : '')+' onchange="'+fn+'"><span class="sw" aria-hidden="true"></span></label>';
}
function clinicasConocidas(){
  var m = {};
  S.ofertas.forEach(function(o){ if(o.clinicaId) m[o.clinicaId] = o.clinica || 'Clínica'; });
  S.sols.forEach(function(s){ if(s.clinicaId) m[s.clinicaId] = s.clinicaNombre || m[s.clinicaId] || 'Clínica'; });
  return m;
}
/* Ajustes del perfil, con quién puede ver tu perfil (Fase 1: una sola versión) */
function pintarAjustes(){
  var r = _pintarAjustesBase.apply(this, arguments);
  if(window.CERCO_ajustesQuienTeVe) CERCO_ajustesQuienTeVe.apply(this, arguments);
  return r;
}
function _pintarAjustesBase(){
  var box = $('pf-ajustes'); if(!box) return;
  // no borrar lo que estás escribiendo si llega un cambio mientras tanto
  var ae = document.activeElement;
  if(ae && box.contains(ae) && ae.tagName === 'INPUT' && ae.type !== 'checkbox') return;
  var p = S.perfil || {}, h = '';
  // avisos y app
  var est = !avisosSoportados() ? (esIOS() && !enApp() ? 'En iPhone, primero añade CERCO a tu pantalla de inicio (abajo).' : 'Este navegador no permite avisos.')
          : Notification.permission === 'granted' ? '<span class="ok">'+svg('check','#0E9F6E',14)+'Activados en este dispositivo</span>'
          : Notification.permission === 'denied' ? 'Bloqueados. Actívalos en los ajustes del navegador para este sitio.' : '';
  h += '<div class="card" id="pf-avisos"><h3>'+svg('bell','currentColor',16)+'Avisos y app</h3>'
    + '<div class="aj-row"><div><b>Avisos en este dispositivo</b><small>Cuando una clínica te conteste, te invite o te proponga una cita.'+(est ? '<br>'+est : '')+'</small></div>'
    + (avisosSoportados() && Notification.permission === 'default' ? '<button class="btn btn-p" onclick="activarAvisos()">Activar</button>' : '') + '</div>'
    + interruptor('aj-alertas', p.alertas !== false, 'guardarAjuste({alertas:this.checked})', 'Alertas de ofertas nuevas', 'Te avisamos cuando se publique una oferta de tu profesión dentro de tu distancia.')
    + '<div class="aj-row"><div><b>CERCO en tu pantalla de inicio</b><small>'
    + (enApp() ? 'Ya la estás usando como app.' : (AV.instalar ? 'Se abre como una app, sin buscarla en el navegador.' : (esIOS() ? 'En Safari: botón Compartir → «Añadir a pantalla de inicio».' : 'En el menú del navegador: «Instalar app» o «Añadir a pantalla de inicio».')))
    + '</small></div>' + (AV.instalar && !enApp() ? '<button class="btn btn-s" onclick="instalarApp()">'+svg('movil','currentColor',15)+'Instalar</button>' : '') + '</div>'
    + '<div class="hint" style="margin-top:10px;">Los avisos llegan mientras CERCO esté abierto o en segundo plano. Muy pronto también por correo.</div></div>';
  // rebote
  var ops = [['preguntar','Pregúntame antes','Te llega la propuesta con el nombre de la clínica y tú decides con un toque.'],
             ['auto','Preséntame automáticamente','CERCO envía tu perfil a la siguiente clínica que busca tu forma de trabajar y te avisa de cuál es.'],
             ['no','No, gracias','Solo recibirás las respuestas de las clínicas a las que escribas tú.']];
  h += '<div class="card"><h3>'+svg('rebote','currentColor',16)+'Si una clínica te dice que no</h3>'
    + '<p class="txt" style="font-size:13.5px;margin-bottom:12px;">Efecto rebote: cuando una clínica te descarta o no contesta en '+diasCaduca()+' días, buscamos otra de tu zona a la que le falte justo tu perfil. Como mucho, 3 a la vez.</p>'
    + '<div class="ops" role="radiogroup">' + ops.map(function(o){ var on = (p.rebote || '') === o[0];
        return '<button type="button" role="radio" aria-checked="'+on+'" class="op'+(on ? ' on' : '')+'" onclick="guardarAjuste({rebote:\''+o[0]+'\'}, \'Guardado\')"><b>'+o[1]+'</b><small>'+o[2]+'</small></button>'; }).join('') + '</div></div>';
  // visibilidad
  var cls = clinicasConocidas(), oc = p.ocultar || [];
  h += '<div class="card"><h3>'+svg('eye','currentColor',16)+'Clínicas que buscan tu perfil</h3>'
    + interruptor('aj-visible', !!p.visible, 'guardarAjuste({visible:this.checked}, this.checked ? \'Las clínicas que buscan tu perfil podrán invitarte\' : \'Ya no apareces en las búsquedas\')', 'Dejar que me inviten', 'Ven tu profesión, experiencia, zona y perfil de personalidad. Nunca tu nombre, foto, teléfono ni correo.')
    + (p.visible ? '<div style="margin-top:12px;"><div style="font-size:13px;font-weight:700;margin-bottom:6px;">Ocultarme a estas clínicas</div><div class="hint" style="margin:0 0 8px;">Por ejemplo, la clínica donde trabajas ahora.</div>'
        + (Object.keys(cls).length ? '<div class="chips">' + Object.keys(cls).map(function(id){ var on = oc.indexOf(id) > -1; return '<span class="chip'+(on ? ' on' : '')+'" role="button" aria-pressed="'+on+'" onclick="alternarOculta(\''+esc(id)+'\')">'+(on ? svg('eye','#fff',12)+' ' : '')+esc(cls[id])+'</span>'; }).join('') + '</div>' : '<div class="hint">Aún no hay clínicas en CERCO de tu zona.</div>')
        + '</div>' : '')
    + '</div>';
  // credenciales
  h += '<div class="card"><h3>'+svg('shield','currentColor',16)+'Colegiación <span class="opc" style="font-size:12.5px;font-weight:500;color:var(--faint);">(opcional)</span></h3>'
    + '<p class="txt" style="font-size:13.5px;margin-bottom:10px;">Si estás colegiado/a, las clínicas lo ven en tu solicitud y pueden comprobarlo en el registro público de tu colegio.</p>'
    + '<div class="row2"><div class="field"><label for="aj-col">Nº de colegiado/a</label><input class="inp" id="aj-col" maxlength="20" value="'+esc(p.colegiado||'')+'" placeholder="Ej: 28004512"></div>'
    + '<div class="field"><label for="aj-cole">Colegio</label><input class="inp" id="aj-cole" maxlength="80" value="'+esc(p.colegio||'')+'" placeholder="Ej: Colegio de Dentistas de Girona"></div></div>'
    + '<button class="btn btn-s" onclick="guardarAjuste({colegiado:val(\'aj-col\'), colegio:val(\'aj-cole\')}, \'Colegiación guardada\')">Guardar</button></div>';
  // datos
  h += '<div class="card"><h3>'+svg('shield','currentColor',16)+'Tus datos</h3>'
    + '<p class="txt" style="font-size:13.5px;margin-bottom:12px;">Tus datos son tuyos. Puedes descargarlos o borrarlo todo cuando quieras.</p>'
    + '<div class="prop-a"><button class="btn btn-s" onclick="descargarDatos()">'+svg('download','currentColor',15)+'Descargar mis datos</button>'
    + '<button class="btn btn-d" onclick="modalEliminar()">'+svg('trash','currentColor',15)+'Eliminar mi cuenta</button></div></div>';
  box.innerHTML = h;
}
function alternarOculta(id){
  var l = ((S.perfil||{}).ocultar || []).slice(), i = l.indexOf(id);
  if(i > -1) l.splice(i,1); else l.push(id);
  guardarAjuste({ocultar:l}, i > -1 ? 'Esa clínica ya puede verte' : 'Esa clínica ya no te verá en sus búsquedas');
}
function enlaceInvitar(){
  var base = location.protocol === 'file:' ? 'https://afiguerass.github.io/cerco/candidato.html' : location.origin + location.pathname;
  return base + '?registro&ref=' + encodeURIComponent(String(Nube.uid || '').slice(0,12));
}
function copiarInvitacion(){
  var t = enlaceInvitar();
  try{ navigator.clipboard.writeText(t).then(function(){ toast('Enlace copiado'); }, function(){ toast(t); }); }catch(e){ toast(t); }
}
try{ var _ref = new URLSearchParams(location.search).get('ref'); if(_ref) sessionStorage.setItem('cerco_ref', _ref.slice(0,40)); }catch(e){}

function descargarDatos(){
  var p = Object.assign({}, S.perfil || {});
  var datos = { exportado:new Date().toISOString(), cuenta:Nube.email || p.email || '', perfil:p,
    solicitudes:S.sols.map(function(s){ var c = Object.assign({}, s); delete c.foto; return c; }), invitaciones:S.invs };
  try{
    var a = document.createElement('a');
    a.href = URL.createObjectURL(new Blob([JSON.stringify(datos, null, 2)], {type:'application/json'}));
    a.download = 'mis-datos-cerco.json'; document.body.appendChild(a); a.click();
    setTimeout(function(){ URL.revokeObjectURL(a.href); a.remove(); }, 1000);
    toast('Descargando tus datos');
  }catch(e){ toast('No se ha podido descargar.'); }
}
function modalEliminar(){
  cerrarModal();
  var m = document.createElement('div'); m.className = 'modal-bg'; m.id = 'modal';
  m.onclick = function(e){ if(e.target === m) cerrarModal(); };
  m.innerHTML = '<div class="modal" role="dialog" aria-modal="true"><h2>¿Eliminar tu cuenta?</h2>'
    + '<p>Se borran para siempre tu perfil, tu vídeo, tu CV, tu test y todas tus solicitudes. Las clínicas dejarán de verlas. No se puede deshacer.</p>'
    + '<div class="field"><label for="m-conf">Escribe <b>ELIMINAR</b> para confirmar</label><input class="inp" id="m-conf" autocomplete="off" oninput="$(\'m-btn\').disabled = this.value.trim().toUpperCase() !== \'ELIMINAR\'"></div>'
    + '<div class="err" id="m-err"></div>'
    + '<div class="acts"><button class="btn btn-s" onclick="cerrarModal()">Cancelar</button><button class="btn btn-d" id="m-btn" disabled onclick="eliminarCuenta()">Eliminar todo</button></div></div>';
  document.body.appendChild(m);
  try{ $('m-conf').focus(); }catch(e){}
}
function eliminarCuenta(){
  if(!unaVez('elim', 3000)) return;
  bloquear('m-btn', 'Eliminando…');
  var db = Nube.db(), uid = Nube.uid, p = S.perfil || {}, ops = [];
  try{ if(_unsubSol) _unsubSol(); if(_unsubInv) _unsubInv(); }catch(e){}
  ['video','cv'].forEach(function(t){ var n = (p[t] && p[t].n) || 0; for(var i=0;i<n;i++) ops.push(db.collection('candidatos').doc(uid).collection('media').doc(t + '_' + i).delete()); });
  // primero el contrato que te envió la clínica (si lo hay), luego la solicitud
  var pre = []; S.sols.forEach(function(s){ var a = s.contrato && s.contrato.archivo; for(var i = 0; a && i < a.n; i++) pre.push(db.collection('candidaturas').doc(s.id).collection('docs').doc('contrato_' + i).delete().catch(function(){})); });
  ops.push(Promise.all(pre).then(function(){ return Promise.all(S.sols.map(function(s){ return db.collection('candidaturas').doc(s.id).delete().catch(function(){}); })); }));
  S.invs.forEach(function(i){ ops.push(db.collection('invitaciones').doc(i.id).delete()); });
  ops.push(db.collection('talento').doc(uid).delete());
  Promise.all(ops.map(function(x){ return x.catch(function(){}); }))
    .then(function(){ return db.collection('candidatos').doc(uid).delete(); })
    .then(function(){
      try{ Object.keys(localStorage).forEach(function(k){ if(k.indexOf(uid) > -1) localStorage.removeItem(k); }); }catch(e){}
      var u = firebase.auth().currentUser;
      return u && u.delete ? u.delete() : null;
    })
    .then(function(){ cerrarModal(); S.sols = []; S.invs = []; S.perfil = null; toast('Tu cuenta y tus datos se han eliminado'); try{ firebase.auth().signOut(); }catch(e){} })
    .catch(function(x){
      if(x && x.code === 'auth/requires-recent-login'){
        cerrarModal(); toast('Tus datos ya están borrados. Para cerrar también el acceso, vuelve a entrar y repite.');
        try{ firebase.auth().signOut(); }catch(e){}
      } else { bloquear('m-btn'); error('m-err', 'No se ha podido terminar. Revisa tu conexión y vuelve a intentarlo.'); }
    });
}

/* ---------- 12. enganches con el resto de la app ---------- */
// Al refrescar: ajustes, solicitudes caducadas y efecto rebote. La usa refrescar (profesional/01-portal.js)
  window.CERCO_refrescarRebote = function(){
    if(S.vista === 'perfil') pintarAjustes();
  try{ procesarCaducadas(); }catch(e){}
  try{ procesarRebotes(); }catch(e){}
  };
registrarSW();

/* ---------- 13. tu cuenta: menú del avatar y salir en cualquier momento ---------- */
function botonSalirOb(id, volver){
  var b = $(id); if(!b) return;
  b.dataset.volver = volver ? '1' : '';
  b.innerHTML = volver ? svg('left','currentColor',15) + '<span>Volver a mi perfil</span>' : svg('logout','currentColor',15) + '<span>Cerrar sesión</span>';
}
function salirOnboarding(donde){
  var b = $(donde === 'alta' ? 'al-salir' : 't-salir');
  if(b && b.dataset.volver){ ir(S.perfil && S.perfil.alta && S.perfil.disc ? 'perfil' : 'inicio'); return; }
  salir();
}
function cerrarMenuCuenta(){ ['cu','cu-bg'].forEach(function(id){ var e = $(id); if(e) e.remove(); }); }
function menuCuenta(ev){
  if(ev){ ev.stopPropagation(); }
  if($('cu')){ cerrarMenuCuenta(); return; }
  try{ guiaCerrar(true); }catch(e){}
  var p = S.perfil || {};
  var bg = document.createElement('div'); bg.className = 'cu-bg'; bg.id = 'cu-bg'; bg.onclick = cerrarMenuCuenta;
  var m = document.createElement('div'); m.className = 'cu'; m.id = 'cu'; m.setAttribute('role','menu');
  m.innerHTML = '<div class="cu-h"><div class="av" id="cu-av"></div><div style="min-width:0;"><b>'+esc(p.nombre || 'Tu cuenta')+'</b><small>'+esc(Nube.email || p.email || '')+'</small></div></div>'
    + '<button role="menuitem" onclick="cerrarMenuCuenta(); ir(\'perfil\')">'+svg('user','#4B5563',17)+'Mi perfil</button>'
    + '<button role="menuitem" onclick="cerrarMenuCuenta(); ir(\'perfil\'); setTimeout(function(){ var a = $(\'pf-ajustes\'); if(a) a.scrollIntoView({behavior:\'smooth\', block:\'start\'}); }, 250)">'+svg('bell','#4B5563',17)+'Avisos, privacidad y datos</button>'
    + '<button role="menuitem" onclick="cerrarMenuCuenta(); verGuardadas()">'+svg('bookmark','#4B5563',17)+'Ofertas guardadas'+(nGuardadas() ? ' <b class="chip-n" style="margin-left:auto;">'+nGuardadas()+'</b>' : '')+'</button>'
    + '<button role="menuitem" onclick="cerrarMenuCuenta(); abrirHerramienta(null)">'+svg('tools','#4B5563',17)+'Herramientas</button>'
    + '<button role="menuitem" onclick="cerrarMenuCuenta(); ir(\'inicio\'); setTimeout(guiaEmpezar, 300)">'+svg('compass','#4B5563',17)+'Ver la guía otra vez</button>'
    + '<button role="menuitem" id="cu-pwd" onclick="cambiarPwd()">'+svg('shield','#4B5563',17)+'Cambiar la contraseña</button>'
    + '<div class="cu-msg" id="cu-msg" hidden></div>'
    + '<div class="cu-sep"></div>'
    + '<button role="menuitem" class="cu-out" onclick="cerrarMenuCuenta(); salir()">'+svg('logout','#B42318',17)+'Cerrar sesión</button>';
  document.body.appendChild(bg); document.body.appendChild(m);
  avatar($('cu-av'), p);
  // en ordenador, junto a lo que has tocado
  if(innerWidth > 860 && ev && ev.currentTarget){
    var r = ev.currentTarget.getBoundingClientRect();
    m.style.left = Math.max(12, Math.min(r.left, innerWidth - m.offsetWidth - 12)) + 'px';
    m.style.top = Math.max(12, r.top - m.offsetHeight - 8) + 'px';
  }
  var f = m.querySelector('button'); if(f) try{ f.focus({preventScroll:true}); }catch(e){}
}
document.addEventListener('keydown', function(e){ if(e.key === 'Escape' && $('cu')) cerrarMenuCuenta(); });
function cambiarPwd(){
  var e = Nube.email || (S.perfil||{}).email, msg = $('cu-msg'); if(!msg) return;
  msg.hidden = false;
  var u = null; try{ u = firebase.auth().currentUser; }catch(x){}
  var google = u && u.providerData && u.providerData.some(function(pd){ return pd && pd.providerId === 'google.com'; });
  if(google){ msg.textContent = 'Entras con Google: la contraseña se cambia en tu cuenta de Google.'; return; }
  if(!e){ msg.textContent = 'No encontramos tu correo.'; return; }
  msg.textContent = 'Enviando…';
  try{
    firebase.auth().sendPasswordResetEmail(e).then(function(){ msg.textContent = 'Te hemos enviado un correo a ' + e + ' para elegir una contraseña nueva. Revisa también el spam.'; })
      .catch(function(){ msg.textContent = 'No se ha podido enviar. Revisa tu conexión y vuelve a probar.'; });
  }catch(x){ msg.textContent = 'No se ha podido enviar ahora mismo.'; }
}

