/* Portal del profesional: estado, navegación y entrar / registrarse.
   Parte del antiguo profesional/01-portal.js (Fase 1, paso 1.6b). El orden de carga
   importa: los archivos 01a…01f se cargan seguidos y en este orden. */
/* ================================================================
   ESTADO
   ================================================================ */
var S = { perfil:null, ofertas:[], ofertasCargadas:false, sols:[], solsCargadas:false, filtro:'todas', actual:null, vista:null, clinicas:{}, tiempos:{} };
var _unsubSol = null;
var _estadosVistos = {}, _msgsVistos = {}, _citasVistas = {};

var EJEMPLOS = [
  {id:'ej1', ejemplo:true, titulo:'Higienista dental', clinica:'Clínica Dental Mar Blau', ubicacion:'Girona', jornada:'Completa', salario:'20.000–24.000 €', disponibilidad:'Inmediata', perfiles:['I','S'],
   descripcion:'Buscamos higienista para un equipo de seis personas. Trato muy cercano con el paciente, agenda bien organizada y formación continua pagada por la clínica.', requisitos:'Técnico Superior en Higiene Bucodental\nExperiencia en periodoncia valorable\nGanas de trabajar en equipo', fecha:new Date(Date.now()-2*86400000).toISOString()},
  {id:'ej2', ejemplo:true, titulo:'Auxiliar de clínica dental', clinica:'Centro Odontológico Sants', ubicacion:'Barcelona', jornada:'Parcial', salario:'A convenir', disponibilidad:'En 15 días', perfiles:['S','C'],
   descripcion:'Asistencia en gabinete, esterilización y preparación de material. Horario de tardes.', requisitos:'Título de Auxiliar de Enfermería o similar\nRigor con los protocolos de esterilización', fecha:new Date(Date.now()-5*86400000).toISOString()},
  {id:'ej3', ejemplo:true, titulo:'Coordinador/a de recepción', clinica:'Clínica Dental Retiro', ubicacion:'Madrid', jornada:'Completa', salario:'22.000 €', disponibilidad:'En 1 mes', perfiles:['D','I'],
   descripcion:'Llevarás la agenda de cuatro doctores, la relación con los pacientes y los presupuestos.', requisitos:'Experiencia en atención al paciente\nManejo de software de gestión clínica', fecha:new Date(Date.now()-86400000).toISOString()}
];

/* Ofertas que se ven: todas menos las de clínicas que la persona ha bloqueado (Fase 1: una sola versión) */
function ofertasVisibles(){
  var b = (S.perfil||{}).bloqueadas || [], l = S.ofertas;
  return b.length ? l.filter(function(o){ return b.indexOf(String(o.clinicaId)) === -1; }) : l;
}
function hayReales(){ return S.ofertas.length > 0; }

/* ---------- distancias ----------
   Tu pueblo (perfil) -> el pueblo de la oferta, en línea recta.
   La clínica guarda las coordenadas al publicar; si una oferta antigua
   no las tiene, las sacamos del nombre del municipio. */
function geoLimpio(g){
  if(!g || g.lat == null || isNaN(+g.lat)) return null;
  return { lat:Math.round(+g.lat*1000)/1000, lng:Math.round(+g.lng*1000)/1000, prov:String(g.prov||g.p||'').slice(0,40), n:String(g.n||'').slice(0,80) };
}
function radioLimpio(r){ if(r === 'prov' || r === 'todo') return r; r = parseInt(r,10); return r > 0 && r <= 1000 ? r : 25; }
function geoOferta(o){
  if(!o) return null;
  if(o.lat != null && !isNaN(+o.lat)) return { lat:+o.lat, lng:+o.lng, prov:o.prov||'', n:o.ubicacion||'' };
  if(o._g === undefined){ var l = CGeo.lugar(o.ubicacion || o.ciudad); Object.defineProperty(o, '_g', {value: l ? CGeo.geo(l) : null, enumerable:false, writable:true}); }
  return o._g;
}
function zona(){
  if(!S.zona){ var p = S.perfil || {}; S.zona = { origen:p.geo || null, radio:p.radio || 25 }; }
  return S.zona;
}
function kmDe(o, desde){ return CGeo.km(desde || zona().origen, geoOferta(o)); }
function enRadio(o, desde, radio){ if(o.ejemplo || !desde) return true; return CGeo.dentro(desde, geoOferta(o), radio); }
function txtRadio(r, g){
  return r === 'todo' ? 'en toda España' : (r === 'prov' ? 'en la provincia de ' + ((g && g.prov) || 'tu provincia') : 'a menos de ' + r + ' km' + (g && g.n ? ' de ' + g.n : ''));
}
function txtRadioCorto(r){ return r === 'todo' ? 'cualquier sitio' : (r === 'prov' ? 'toda su provincia' : 'hasta ' + r + ' km'); }
// ofertas dentro de lo que marcaste en tu perfil (para Inicio y Seimian)
function ofertasCerca(l){
  var p = S.perfil || {};
  if(!p.geo) return { dentro:l, fuera:[] };
  var r = p.radio || 25, dentro = [], fuera = [];
  l.forEach(function(o){ (enRadio(o, p.geo, r) ? dentro : fuera).push(o); });
  fuera.sort(function(a,b){ return (kmDe(a,p.geo)||1e9) - (kmDe(b,p.geo)||1e9); });
  return { dentro:dentro, fuera:fuera };
}
function buscarOferta(id){
  var l = S.ofertas.concat(EJEMPLOS);
  for(var i=0;i<l.length;i++) if(String(l[i].id) === String(id)) return l[i];
  return null;
}
/* Una oferta solo se puede solicitar una vez: si la retiraste, se queda retirada */
function esVisita(s){ return s && s.tipo === 'visita'; }
function solDeOferta(id){
  for(var i=0;i<S.sols.length;i++) if(String(S.sols[i].ofertaId) === String(id) && !esVisita(S.sols[i])) return S.sols[i];
  return null;
}
function visitaDeOferta(id){
  for(var i=0;i<S.sols.length;i++) if(String(S.sols[i].ofertaId) === String(id) && esVisita(S.sols[i])) return S.sols[i];
  return null;
}

/* Cuánto contesta cada clínica. Cuenta lo respondido y lo que lleva más de
   3 días sin respuesta; lo reciente todavía no cuenta en su contra.
   Con menos de 3 casos no decimos nada: sería injusto con una clínica nueva. */
function statsResp(cid){
  var l = S.tiempos[cid]; if(!l) return null;
  var ahora = Date.now(), horas = [], sin = 0;
  l.forEach(function(t){
    if(t.respondida){ var hh = (new Date(t.respondida) - new Date(t.enviada)) / 3600000; if(hh >= 0) horas.push(hh); }
    else if(!t.retirada && ahora - new Date(t.enviada) > 72*3600000) sin++;
  });
  var n = horas.length + sin;
  if(n < 3) return { nueva:true, n:n };
  horas.sort(function(a,b){ return a-b; });
  var med = horas.length ? horas[Math.floor((horas.length-1)/2)] : null;
  return { pct:Math.round(horas.length/n*100), med:med, n:n };
}
function ultimaRespuesta(cid){ var l = (S.tiempos[cid] || []).map(function(t){ return t.respondida; }).filter(Boolean).sort(); return l.length ? l[l.length-1] : null; }
function textoHoras(hh){ if(hh === null) return ''; if(hh < 1) return 'menos de 1 h'; if(hh < 24) return Math.round(hh) + ' h'; var d = Math.round(hh/24); return d === 1 ? '1 día' : d + ' días'; }
function colorResp(p){ return p >= 80 ? '#0E9F6E' : (p >= 50 ? '#8A5A00' : '#B42318'); }
function solsActivas(){ return S.sols.filter(function(s){ return s.estado !== 'retirada'; }); }

/* ================================================================
   NAVEGACIÓN
   ================================================================ */
var VISTAS_APP = ['inicio','descubrir','ofertas','oferta','solicitudes','solicitud','perfil','herramientas'];
var _saltant = false;
/* Ir a una pantalla del portal (y pintar Herramientas al entrar) (Fase 1: una sola versión) */
function ir(v, arg, noHist){
  var r = _irBase.apply(this, arguments);
  if(window.CERCO_irHerramientas) CERCO_irHerramientas.apply(this, arguments);
  return r;
}
function _irBase(v, arg, noHist){
  if(VISTAS_APP.indexOf(v) > -1 && !Nube.uid) v = 'login';
  if(v === 'oferta') S.actual = arg;
  if(v === 'solicitud') S.actualSol = arg;
  S.vista = v;
  document.querySelectorAll('.view').forEach(function(s){ s.classList.toggle('active', s.id === 'v-' + v); });
  var nav = { oferta:'ofertas', solicitud:'solicitudes' }[v] || v;
  document.querySelectorAll('.nav-item[data-v], .tab[data-v]').forEach(function(b){ b.classList.toggle('active', b.dataset.v === nav); });
  document.body.classList.toggle('sin-nav', VISTAS_APP.indexOf(v) === -1);
  if(v === 'inicio'){ pintarInicio(); guiaSiToca(); }
  if(v !== 'inicio' && !window._guiaNavega) guiaCerrar(true);
  if(v === 'ofertas') pintarOfertas();
  document.body.classList.toggle('en-dx', v === 'descubrir');
  if(v === 'descubrir'){ try{ pintarDescubrir(); }catch(e){} } else { try{ document.querySelectorAll('#dx video').forEach(function(x){ x.pause(); }); }catch(e){} }
  try{ var tt = {inicio:'Inicio', descubrir:'Descubrir', ofertas:'Ofertas', oferta:'Oferta', solicitudes:'Mis solicitudes', solicitud:'Solicitud', perfil:'Mi perfil', herramientas:'Herramientas'}[v]; $('mtop-t').textContent = tt || ''; }catch(e){}
  if(v === 'oferta') pintarDetalle();
  if(v === 'solicitudes') pintarSolicitudes();
  if(v === 'solicitud') pintarSolicitud();
  if(v === 'perfil') pintarPerfil();
  if(!noHist && !_saltant){
    try{
      var st = {v:v, a:arg||null};
      if(!history.state || !history.state.v) history.replaceState(st, '');
      else if(history.state.v !== v || history.state.a !== (arg||null)) history.pushState(st, '');
    }catch(e){}
  }
  window.scrollTo(0,0);
  pintarIconos();
}
window.addEventListener('popstate', function(ev){
  var st = ev.state; if(!st || !st.v) return;
  // Sin sesión no se vuelve a pantallas de dentro
  if(VISTAS_APP.indexOf(st.v) > -1 && !Nube.uid) return;
  if((st.v === 'login' || st.v === 'registro' || st.v === 'portada') && Nube.uid) return;
  _saltant = true; try{ ir(st.v, st.a, true); }catch(e){} _saltant = false;
});

/* ================================================================
   ENTRAR / REGISTRARSE
   ================================================================ */
function verPwd(id){ var i = $(id); if(i) i.type = i.type === 'password' ? 'text' : 'password'; }

function traducirError(x, ctx){
  var c = (x && x.code) || '';
  if(c === 'auth/wrong-password' || c === 'auth/invalid-credential' || c === 'auth/invalid-login-credentials') return 'El correo o la contraseña no son correctos. Si creaste la cuenta con Google, pulsa «Continuar con Google». Si no la recuerdas, pulsa «¿Olvidaste tu contraseña?».';
  if(c === 'auth/user-not-found') return 'No existe ninguna cuenta con ese correo. Pulsa "Regístrate gratis" para crearla.';
  if(c === 'auth/email-already-in-use') return 'Ya existe una cuenta con ese correo (de profesional o de clínica). Inicia sesión; si no recuerdas la contraseña, pulsa «¿Olvidaste tu contraseña?». Para probar los dos lados, usa otro correo.';
  if(c === 'auth/weak-password') return 'La contraseña necesita al menos 6 caracteres.';
  if(c === 'auth/invalid-email') return 'Ese correo no parece correcto.';
  if(c === 'auth/too-many-requests') return 'Demasiados intentos. Espera un minuto y vuelve a probar.';
  if(c === 'auth/network-request-failed' || c === 'sin-nube') return 'No hay conexión. Revisa tu internet y vuelve a intentarlo.';
  if(c === 'auth/popup-blocked') return 'Tu navegador ha bloqueado la ventana de Google. Permite las ventanas emergentes y vuelve a pulsar.';
  if(c === 'auth/unauthorized-domain') return 'Esta dirección no está autorizada todavía en Firebase.';
  return ctx === 'reg' ? 'No hemos podido crear la cuenta. Inténtalo de nuevo.' : 'No hemos podido entrar. Inténtalo de nuevo.';
}
function bloquear(id, txt){ var b = $(id); if(!b) return; b.disabled = !!txt; if(txt){ b.dataset.t = b.dataset.t || b.textContent; b.textContent = txt; } else if(b.dataset.t){ b.textContent = b.dataset.t; } }

function entrar(){
  var e = val('li-email'), p = ($('li-pwd')||{}).value || '';
  error('li-err', '');
  if(!emailOk(e)) return error('li-err', 'Escribe un correo válido.');
  if(!p) return error('li-err', 'Escribe tu contraseña.');
  if(!unaVez('entrar')) return;
  bloquear('li-btn', 'Comprobando…');
  Nube.cargar().then(function(ok){
    if(!ok) throw {code:'sin-nube'};
    return firebase.auth().signInWithEmailAndPassword(e, p);
  }).then(function(){ $('li-pwd').value = ''; })
  .catch(function(x){ error('li-err', traducirError(x)); })
  .then(function(){ bloquear('li-btn'); });
}

function registrar(){
  var n = val('re-nom'), e = val('re-email'), p = ($('re-pwd')||{}).value || '';
  error('re-err', '');
  if(n.length < 3) return error('re-err', 'Escribe tu nombre y apellido.');
  if(!emailOk(e)) return error('re-err', 'Ese correo no parece correcto. Revísalo.');
  if(p.length < 6) return error('re-err', 'La contraseña necesita al menos 6 caracteres.');
  if(!$('re-ok').checked) return error('re-err', 'Marca la casilla para poder continuar.');
  if(!unaVez('registrar')) return;
  bloquear('re-btn', 'Creando tu cuenta…');
  window.__nomRegistro = n;
  Nube.cargar().then(function(ok){
    if(!ok) throw {code:'sin-nube'};
    return firebase.auth().createUserWithEmailAndPassword(e, p);
  }).then(function(r){
    $('re-pwd').value = '';
    try{ if(r && r.user && r.user.updateProfile) r.user.updateProfile({displayName:n}).catch(function(){}); }catch(x){}
  }).catch(function(x){ error('re-err', traducirError(x, 'reg')); })
  .then(function(){ bloquear('re-btn'); });
}

function google(errId){
  error(errId, '');
  if(!unaVez('google', 1000)) return;
  Nube.cargar().then(function(ok){
    if(!ok) throw {code:'sin-nube'};
    var prov = new firebase.auth.GoogleAuthProvider();
    prov.setCustomParameters({prompt:'select_account'});
    return firebase.auth().signInWithPopup(prov).catch(function(x){
      var c = (x && x.code) || '';
      if(c === 'auth/popup-blocked' || c === 'auth/operation-not-supported-in-this-environment')
        return firebase.auth().signInWithRedirect(prov);
      throw x;
    });
  }).catch(function(x){
    var c = (x && x.code) || '';
    if(c === 'auth/popup-closed-by-user' || c === 'auth/cancelled-popup-request' || c === 'auth/user-cancelled') return;
    error(errId, traducirError(x));
  });
}


/* Correo para cambiar la contraseña: en español, con vuelta a esta misma página.
   Si Firebase no acepta la dirección de vuelta, se manda igualmente sin ella. */
window.CERCO_enviarReset = function(email){
  try{ firebase.auth().languageCode = 'es'; }catch(x){}
  var vuelta = { url: location.origin + location.pathname };
  return firebase.auth().sendPasswordResetEmail(email, vuelta).catch(function(x){
    var c = (x && x.code) || '';
    if(/continue-uri|unauthorized-domain|invalid-dynamic-link|argument-error/.test(c)) return firebase.auth().sendPasswordResetEmail(email);
    throw x;
  });
};
window.CERCO_textoReset = function(email){
  return 'Listo. Si ' + email + ' tiene cuenta con contraseña, en 1 o 2 minutos te llegará un correo de CERCO (remitente: noreply@cerco-c5724.firebaseapp.com). Búscalo también en Spam y en la pestaña Promociones. ¿Creaste la cuenta con Google? Entonces no tienes contraseña: pulsa «Continuar con Google».';
};
window.CERCO_esperaReenvio = function(boton){
  if(!boton) return; var n = 60;
  boton.disabled = true; boton.style.opacity = '.5'; boton.style.pointerEvents = 'none';
  var iv = setInterval(function(){ n--; boton.textContent = 'Reenviar en ' + n + ' s'; if(n <= 0){ clearInterval(iv); boton.disabled = false; boton.style.opacity = ''; boton.style.pointerEvents = ''; boton.textContent = '¿No te llega? Reenviar'; } }, 1000);
};
function recuperar(){
  var e = val('li-email');
  if(!emailOk(e)){ error('li-err', 'Escribe primero tu correo aquí arriba y vuelve a pulsar.'); try{ $('li-email').focus(); }catch(x){} return; }
  var el = $('li-err'); el.style.color = '#6B7280'; el.textContent = 'Enviando…';
  Nube.cargar().then(function(ok){
    if(!ok) throw {code:'sin-nube'};
    return CERCO_enviarReset(e);
  }).then(function(){
    el.style.color = '#0E9F6E'; el.textContent = CERCO_textoReset(e);
    var b = [].filter.call(document.querySelectorAll('#v-login button, #v-login a'), function(x){ return /olvidaste|reenviar/i.test(x.textContent); })[0];
    try{ CERCO_esperaReenvio(b); }catch(z){}
  }).catch(function(x){
    el.style.color = ''; el.textContent = traducirError(x);
  });
}

function salir(){
  try{ if(_unsubSol) _unsubSol(); }catch(e){} _unsubSol = null;
  try{ if(_unsubOf) _unsubOf(); }catch(e){} _unsubOf = null;
  try{ firebase.auth().signOut(); }catch(e){}
  Nube.uid = null; S.perfil = null; S.sols = []; S.solsCargadas = false; _estadosVistos = {};
  try{ cerrarSeimian(); }catch(e){} var fab = $('sei-fab'); if(fab) fab.hidden = true; _mediaUrl = {video:null, cv:null};
  ir('portada');
  toast('Sesión cerrada');
}

/* Cuando Firebase confirma quién eres, decidimos a qué pantalla vas */
function alEntrar(u){
  Nube.uid = u.uid; Nube.email = u.email || '';
  Nube.perfil().then(function(p){
    if(p) return p;
    // Una cuenta que ya es de clínica no se convierte en candidato sin querer
    return Nube.esClinica().then(function(es){ if(es){ ir('esclinica'); throw 'clinica'; } return null; });
  }).then(function(p){
    S.perfil = p || { nombre: window.__nomRegistro || u.displayName || '', email: u.email || '' };
    // perfiles de antes de los km: sacamos las coordenadas del nombre de su ciudad
    if(S.perfil.ciudad && !S.perfil.geo){ var gl0 = CGeo.lugar(S.perfil.ciudad); if(gl0) S.perfil.geo = CGeo.geo(gl0); }
    S.zona = null;
    if(!S.perfil.email) S.perfil.email = u.email || '';
    pintarUsuario();
    escucharSols();
    escucharInvs();
    cargarOfertas();
    try{ publicarTalento(); }catch(e){}
    if(!S.perfil.profesion){ if(!S.perfil.bienvenida) abrirBienvenida(); else abrirAlta(false); return; }
    if(!S.perfil.disc){ abrirTest(false); return; }
    // al tocar un aviso: abre justo esa pantalla
    var hs = (location.hash || '').slice(1).split(':');
    if((hs[0] === 'solicitud' || hs[0] === 'oferta') && hs[1]){ try{ history.replaceState(null, '', location.pathname + location.search); }catch(e){} ir(hs[0], hs.slice(1).join(':')); return; }
    var dest = (history.state && VISTAS_APP.indexOf(history.state.v) > -1) ? history.state.v : 'inicio';
    var arg = history.state && history.state.a;
    if((dest === 'oferta' || dest === 'solicitud') && !arg) dest = 'inicio';
    ir(dest, arg, true);
  }).catch(function(x){
    if(x === 'clinica') return;
    ir('login');
    error('li-err', 'No hemos podido cargar tu perfil. Revisa tu conexión y vuelve a entrar.');
  });
}

function arrancar(){
  Nube.cargar().then(function(ok){
    if(!ok){
      ir('login', null, true);
      error('li-err', 'No hemos podido conectar con CERCO. Revisa tu conexión y recarga la página.');
      return;
    }
    try{ firebase.auth().getRedirectResult().catch(function(x){ error('li-err', traducirError(x)); }); }catch(e){}
    firebase.auth().onAuthStateChanged(function(u){
      if(u && !u.isAnonymous){ alEntrar(u); }
      else {
        Nube.uid = null;
        var q = new URLSearchParams(location.search);
        ir(q.get('registro') !== null ? 'registro' : 'portada', null, true);
      }
    });
  });
}
