/* Portal del profesional: ofertas y solicitudes, alta del perfil, test y «Descubrir».
   Parte del antiguo profesional/01-portal.js (Fase 1, paso 1.6b). El orden de carga
   importa: los archivos 01a…01f se cargan seguidos y en este orden. */
/* ================================================================
   DATOS: ofertas y solicitudes
   ================================================================ */
function cargarOfertas(){
  return Nube.ofertas().then(function(l){
    S.ofertas = l.filter(function(o){ return o && o.titulo && o.clinicaId; });
    S.ofertasCargadas = true;
  }).catch(function(){ S.ofertasCargadas = true; S.errOfertas = true; })
  .then(function(){ refrescar(); escucharOfertasDirecto(); return cargarClinicas(); });
}
/* Si una clínica cierra o publica una oferta, se ve sin recargar */
var _unsubOf = null;
function escucharOfertasDirecto(){
  if(_unsubOf) return;
  try{
    var primera = true;
    _unsubOf = Nube.escucharOfertas(function(l){
      if(primera){ primera = false; return; }
      var antes = {}; S.ofertas.forEach(function(o){ antes[o.id] = 1; });
      S.ofertas = l.filter(function(o){ return o && o.titulo && o.clinicaId; });
      var nuevas = S.ofertas.filter(function(o){ return !antes[o.id]; });
      var faltan = S.ofertas.some(function(o){ return !S.tiempos[o.clinicaId]; });
      var mias = ((S.perfil||{}).alertas !== false) ? nuevas.filter(ofertaParaMi) : [];
      if(mias.length === 1){ var km1 = kmDe(mias[0], (S.perfil||{}).geo); avisar('Nueva oferta para ti' + (km1 !== null ? ' a ' + km1 + ' km' : '') + ': ' + mias[0].titulo + ' en ' + (mias[0].clinica || 'una clínica'), 'oferta:' + mias[0].id); }
      else if(mias.length > 1) avisar(mias.length + ' ofertas nuevas para ti', 'inicio');
      else if(nuevas.length === 1) toast('Nueva oferta: ' + nuevas[0].titulo + ' en ' + (nuevas[0].clinica || 'una clínica'));
      else if(nuevas.length > 1) toast(nuevas.length + ' ofertas nuevas');
      refrescar();
      if(faltan) cargarClinicas();
    });
  }catch(e){}
}
/* La página de cada clínica y cómo responde: llegan después, sin bloquear las ofertas */
function cargarClinicas(){
  var ids = {}; S.ofertas.forEach(function(o){ ids[o.clinicaId] = 1; });
  return Promise.all(Object.keys(ids).map(function(cid){
    return Promise.all([
      Nube.clinicaPublica(cid).then(function(c){ S.clinicas[cid] = c; }).catch(function(){}),
      Nube.tiempos(cid).then(function(t){ S.tiempos[cid] = t; }).catch(function(){})
    ]);
  })).then(function(){ S.clinicasCargadas = true; refrescar(); });
}

var TXT_ESTADO = { caducada:'Cerrada sin respuesta', enviada:'Enviada', vista:'Abierta', entrevista:'Te invitan a entrevista', descartada:'No seleccionada', retirada:'Retirada', contratada:'¡Te han contratado!' };
var TXT_VISITA = { caducada:'Sin respuesta', enviada:'Petición enviada', vista:'Vista por la clínica', entrevista:'Te proponen día y hora', descartada:'Ahora no pueden', retirada:'Retirada' };
function txtEstado(s){ if(!esVisita(s) && s.estado === 'vista' && s.interesa) return 'Les interesas'; return (esVisita(s) ? TXT_VISITA : TXT_ESTADO)[s.estado] || s.estado; }
var _intVistos = {};
function escucharSols(){
  if(_unsubSol){ try{ _unsubSol(); }catch(e){} }
  var primer = true;
  _unsubSol = Nube.escucharSolicitudes(function(l){
    l.sort(function(a,b){ return String(b.fecha||'').localeCompare(String(a.fecha||'')); });
    if(!primer){
      l.forEach(function(s){
        var ant = _estadosVistos[s.id], antM = _msgsVistos[s.id], antC = _citasVistas[s.id];
        var cita = s.cita ? s.cita.v + '|' + s.cita.estado : '';
        var quien = s.clinicaNombre || 'La clínica';
        var cambioEst = ant && ant !== s.estado && ['vista','entrevista','descartada','contratada'].indexOf(s.estado) > -1;
        var intNuevo = !!s.interesa && _intVistos[s.id] === false && s.estado === 'vista';
        var citaNueva = antC !== undefined && cita !== antC && s.cita && s.cita.estado === 'propuesta';
        var msgNuevo = antM !== undefined && (s.mensajes||[]).length > antM && ((s.mensajes||[]).slice(-1)[0]||{}).de === 'clinica';
        // lo más importante primero; si además hay mensaje, se dice
        var dst = 'solicitud:' + s.id;
        var frase = { vista:' ha abierto tu solicitud', entrevista: esVisita(s) ? ' te propone día y hora para conocerla' : ' quiere hacerte una entrevista', descartada:' ha elegido otro perfil', contratada:' te ha elegido. ¡Enhorabuena!' }[s.estado] || (': ' + txtEstado(s).toLowerCase());
        if(intNuevo) avisar(quien + ' ha marcado tu perfil como «Me interesa»: sigues en el proceso', dst);
        else if(cambioEst && s.estado !== 'vista') avisar(quien + frase, dst);
        else if(citaNueva) avisar(quien + ' te propone ' + fechaCitaC(s.cita.fecha).toLowerCase(), dst);
        else if(msgNuevo) avisar(quien + (cambioEst ? ' ha visto tu solicitud y te ha escrito' : ' te ha escrito'), dst);
        else if(cambioEst) avisar(quien + frase, dst);
      });
    }
    l.forEach(function(s){ _intVistos[s.id] = !!s.interesa; _estadosVistos[s.id] = s.estado; _msgsVistos[s.id] = (s.mensajes||[]).length; _citasVistas[s.id] = s.cita ? s.cita.v + '|' + s.cita.estado : ''; });
    primer = false;
    S.sols = l; S.solsCargadas = true;
    refrescar();
  }, function(){ S.solsCargadas = true; refrescar(); });
}

function refrescarBadge(){
  var n = Nube.uid ? pendientesC() : 0;
  ['nav-cnt','tab-cnt'].forEach(function(id){ var e = $(id); if(!e) return; e.textContent = n; e.style.display = n ? '' : 'none'; });
}
/* Repintar lo que se ve: base, ajustes y rebote, herramientas y recordatorios de cita (Fase 1: una sola versión) */
function refrescar(){
  var r = _refrescarBase.apply(this, arguments);
  if(window.CERCO_refrescarRebote) CERCO_refrescarRebote.apply(this, arguments);
  if(window.CERCO_refrescarHerramientas) CERCO_refrescarHerramientas.apply(this, arguments);
  if(window.CERCO_refrescarRecordatorios) CERCO_refrescarRecordatorios.apply(this, arguments);
  return r;
}
function _refrescarBase(){
  var n = Nube.uid ? pendientesC() : 0;
  [['nav-cnt'],['tab-cnt']].forEach(function(a){ var e = $(a[0]); if(!e) return; e.textContent = n; e.style.display = n ? '' : 'none'; });
  if(S.vista === 'inicio') pintarInicio();
  if(S.vista === 'ofertas') pintarOfertas();
  if(S.vista === 'oferta') pintarDetalle();
  if(S.vista === 'solicitudes') pintarSolicitudes();
  if(S.vista === 'solicitud') pintarSolicitud();
  pintarIconos();
}

function pintarUsuario(){
  var p = S.perfil || {};
  ['nav-av','mtop-av'].forEach(function(id){ avatar($(id), p); });
  var fab = $('sei-fab'); if(fab) fab.hidden = !Nube.uid;
  $('nav-nom').textContent = p.nombre || '';
  $('nav-rol').textContent = p.profesion || 'Profesional';
}

function avatar(el, p){
  if(!el) return;
  if(p && p.foto) el.innerHTML = '<img src="'+esc(p.foto)+'" alt="" style="width:100%;height:100%;object-fit:cover;border-radius:50%;display:block;">';
  else el.textContent = inicial(p && p.nombre);
}

/* ================================================================
   ALTA (pasos 1 y 2) — también sirve para editar el perfil
   ================================================================ */
var _editant = false;
function abrirAlta(editar){
  _editant = !!editar;
  var p = S.perfil || {};
  $('al-nom').value = p.nombre || '';
  $('al-prof').value = p.profesion || '';
  $('al-exp').value = p.experiencia || '';
  $('al-ciu').value = p.ciudad || '';
  var ci = $('al-ciu'); CGeo.autocompletar(ci, null, function(){ return (S.perfil||{}).geo; }); if(p.geo){ ci.dataset.lat = p.geo.lat; ci.dataset.lng = p.geo.lng; ci.dataset.prov = p.geo.prov; } else delete ci.dataset.lat;
  marcarChips('al-rad', [String(p.radio || 25)]);
  $('al-rad-n').value = chipsSel('al-rad').length ? '' : (typeof p.radio === 'number' ? p.radio : '');
  $('al-tel').value = p.telefono || '';
  $('al-tit').value = p.titulacion || '';
  $('al-res').value = p.resumen || '';
  $('al-res-n').textContent = ($('al-res').value||'').length;
  marcarChips('al-jor', p.jornada ? [p.jornada] : []);
  marcarChips('al-disp', p.disponibilidad ? [p.disponibilidad] : []);
  (p.fuertes || []).forEach(function(f){ pfChip(f); });
  marcarChips('al-pf', p.fuertes || []);
  _exps = (p.trabajos || []).map(function(t){ return {puesto:t.puesto||'', centro:t.centro||'', tiempo:t.tiempo||''}; });
  $('al-sin-exp').checked = !!p.sinExperiencia && !_exps.length;
  pintarExps();
  document.querySelector('#v-alta .steps').style.display = editar ? 'none' : '';
  document.querySelectorAll('#v-alta .step-lbl').forEach(function(e){ e.style.display = editar ? 'none' : ''; });
  $('alta-tit').textContent = editar ? 'Editar mi perfil' : 'Sobre ti';
  $('al-btn2').textContent = editar ? 'Guardar cambios' : 'Continuar';
  botonSalirOb('al-salir', editar);
  error('al-err1',''); error('al-err2','');
  altaPaso(1, true);
  ir('alta', null, true);
}
function altaPaso(n, sinValidar){
  if(n === 2 && !sinValidar){
    error('al-err1','');
    if(val('al-nom').length < 3) return error('al-err1', 'Escribe tu nombre y apellido.');
    if(!val('al-prof')) return error('al-err1', 'Elige tu profesión.');
    if(!val('al-exp')) return error('al-err1', 'Elige cuánta experiencia tienes.');
    if(val('al-ciu').length < 2) return error('al-err1', 'Escribe el pueblo o la ciudad donde vives.');
    if(!geoCiudad()) return error('al-err1', 'No encontramos «' + val('al-ciu') + '». Empieza a escribir y elígelo de la lista.');
    var tel = val('al-tel').replace(/[^\d+]/g,'');
    if(tel.replace(/\D/g,'').length < 9) return error('al-err1', 'Escribe un teléfono de al menos 9 cifras.');
  }
  $('alta-1').style.display = n === 1 ? '' : 'none';
  $('alta-2').style.display = n === 2 ? '' : 'none';
  ['st-1','st-2','st-3'].forEach(function(id, i){ $(id).classList.toggle('on', i < n); });
  window.scrollTo(0,0);
}
function marcarChips(id, vals){
  document.querySelectorAll('#'+id+' .chip').forEach(function(c){ c.classList.toggle('on', vals.indexOf(c.dataset.v) > -1); });
}
function chipsSel(id){
  return [].slice.call(document.querySelectorAll('#'+id+' .chip.on')).map(function(c){ return c.dataset.v; });
}
document.addEventListener('click', function(ev){
  var c = ev.target.closest && ev.target.closest('.chips[id^="al-"] .chip');
  if(!c) return;
  var g = c.parentNode;
  if(g.dataset.uno){ g.querySelectorAll('.chip').forEach(function(x){ if(x !== c) x.classList.remove('on'); }); c.classList.add('on'); return; }
  var max = parseInt(g.dataset.max,10) || 99;
  if(!c.classList.contains('on') && g.querySelectorAll('.chip.on').length >= max){ toast('Puedes elegir hasta ' + max); return; }
  c.classList.toggle('on');
});
document.addEventListener('input', function(ev){
  if(!ev.target) return;
  if(ev.target.id === 'al-res') $('al-res-n').textContent = ev.target.value.length;
  // escribir los km quita la opción marcada, y al revés
  if(ev.target.id === 'al-rad-n' && ev.target.value) marcarChips('al-rad', []);
});
document.addEventListener('click', function(ev){ if(ev.target.closest && ev.target.closest('#al-rad .chip')){ var n = $('al-rad-n'); if(n) n.value = ''; } });
document.addEventListener('change', function(ev){
  if(ev.target && ev.target.id === 'of-rad-n'){ var n = parseInt(ev.target.value, 10); if(n > 0 && n <= 1000) ponerRadio(String(n)); }
});

/* experiencia */
var _exps = [];
function pintarExps(){
  var h = '';
  _exps.forEach(function(t, i){
    h += '<div class="exp-i"><div class="field"><label>Puesto</label><input class="inp" type="text" value="'+esc(t.puesto)+'" oninput="_exps['+i+'].puesto=this.value" placeholder="Ej: Higienista"></div>'
      + '<div class="row2"><div class="field"><label>Clínica</label><input class="inp" type="text" value="'+esc(t.centro)+'" oninput="_exps['+i+'].centro=this.value" placeholder="Nombre de la clínica"></div>'
      + '<div class="field"><label>Tiempo</label><input class="inp" type="text" value="'+esc(t.tiempo)+'" oninput="_exps['+i+'].tiempo=this.value" placeholder="Ej: 2 años"></div></div>'
      + '<button class="btn btn-g" style="padding:4px 0;color:#DC2626;font-size:13px;" onclick="delExp('+i+')">'+svg('trash','#DC2626',14)+'Quitar</button></div>';
  });
  $('al-exps').innerHTML = h;
  $('al-exp-add').style.display = _exps.length >= 5 ? 'none' : '';
  var se = $('al-sin-exp-l'); if(se){ se.style.display = _exps.length ? 'none' : ''; if(_exps.length) $('al-sin-exp').checked = false; }
}
function addExp(){ if(_exps.length >= 5) return; _exps.push({puesto:'',centro:'',tiempo:''}); pintarExps(); var ins = $('al-exps').querySelectorAll('.exp-i'); var ult = ins[ins.length-1]; if(ult){ var f = ult.querySelector('input'); try{ f.focus({preventScroll:true}); }catch(e){} ult.scrollIntoView({behavior:'smooth', block:'center'}); } }
function delExp(i){ _exps.splice(i,1); pintarExps(); }


/* ---------- puntos fuertes propios ---------- */
function pfChip(txt){
  txt = String(txt||'').trim().slice(0,40); if(!txt) return null;
  var g = $('al-pf'), ya = null;
  g.querySelectorAll('.chip').forEach(function(c){ if(c.dataset.v.toLowerCase() === txt.toLowerCase()) ya = c; });
  if(ya) return ya;
  var c = document.createElement('span'); c.className = 'chip chip-mio'; c.dataset.v = txt; c.textContent = txt; g.appendChild(c); return c;
}
function pfAnadir(){
  var i = $('al-pf-n'), c = pfChip(i.value); if(!c){ i.focus(); return; }
  var g = $('al-pf');
  if(!c.classList.contains('on')){
    if(g.querySelectorAll('.chip.on').length >= 5){ toast('Puedes elegir hasta 5. Quita uno para añadir este.'); return; }
    c.classList.add('on');
  }
  i.value = ''; i.focus();
}
document.addEventListener('keydown', function(e){ if(e.target && e.target.id === 'al-pf-n' && e.key === 'Enter'){ e.preventDefault(); pfAnadir(); } });

/* ---------- preséntate con Seimian ----------
   Tres preguntas de un toque y Seimian escribe tres versiones con lo que
   ya sabe de ti (profesión, experiencia, puntos fuertes). Tú eliges una y
   la retocas. En la versión real lo escribe un modelo de IA. */
var PIA = { gusta:'', busca:'', extra:'' };
function abrirPresentacionIA(){
  cerrarModal();
  var ops = function(id, l){ return '<div class="chips" id="'+id+'" data-uno="1">'+l.map(function(x){ return '<span class="chip" data-v="'+esc(x)+'">'+esc(x)+'</span>'; }).join('')+'</div>'; };
  var m = document.createElement('div'); m.className = 'modal-bg'; m.id = 'modal';
  m.onclick = function(e){ if(e.target === m) cerrarModal(); };
  m.innerHTML = '<div class="modal" role="dialog" aria-modal="true" aria-labelledby="pia-t" style="max-width:520px;">'
    + '<h2 id="pia-t">'+svg('sparkles','#B45309',18)+' Te ayudo a presentarte</h2><p>Contesta con un toque. Con eso y tu perfil te escribo tres versiones.</p>'
    + '<div class="field"><label>Lo que más te gusta de tu trabajo</label>'+ops('pia-g', ['Ver al paciente salir tranquilo','Explicar bien los tratamientos','Que todo esté organizado','Aprender técnicas nuevas','Trabajar en equipo'])+'</div>'
    + '<div class="field"><label>Qué buscas</label>'+ops('pia-b', ['Un equipo estable','Seguir formándome','Más responsabilidad','Buen horario','Una clínica cerca de casa'])+'</div>'
    + '<div class="field"><label for="pia-x">Algo más de ti <span class="opc">(opcional)</span></label><input class="inp" id="pia-x" maxlength="120" placeholder="Ej: hablo inglés, me encanta la ortodoncia…"></div>'
    + '<div class="err" id="pia-err"></div><div id="pia-res"></div>'
    + '<div class="acts"><button class="btn btn-s" onclick="cerrarModal()">Cancelar</button><button class="btn btn-p" id="pia-btn" onclick="generarPresentacion()">'+svg('sparkles','#fff',15)+'Escribir</button></div></div>';
  document.body.appendChild(m);
  m.addEventListener('click', function(ev){ var c = ev.target.closest && ev.target.closest('#pia-g .chip, #pia-b .chip'); if(!c) return; c.parentNode.querySelectorAll('.chip').forEach(function(x){ x.classList.toggle('on', x === c); }); });
}
function generarPresentacion(){
  var g = (document.querySelector('#pia-g .chip.on')||{}).dataset, b = (document.querySelector('#pia-b .chip.on')||{}).dataset;
  if(!g || !b) return error('pia-err', 'Elige una opción en cada pregunta.');
  error('pia-err', '');
  var prof = (val('al-prof') || 'profesional del sector dental').toLowerCase(), exp = val('al-exp'), x = val('pia-x').replace(/[.\s]+$/,'');
  var fu = chipsSel('al-pf').map(function(f){ return f.toLowerCase(); });
  var pf = fu.length ? (fu.length === 1 ? fu[0] : fu.slice(0,-1).join(', ') + ' y ' + fu[fu.length-1]) : '';
  var anos = /Sin experiencia/.test(exp) ? 'Acabo de terminar mis prácticas' : (/Menos de 1/.test(exp) ? 'Llevo menos de un año trabajando' : (exp ? 'Llevo ' + exp.replace(/^De /,'de ').replace(/^Más de/,'más de').toLowerCase() + ' trabajando' : 'Trabajo'));
  var gusta = g.v.charAt(0).toLowerCase() + g.v.slice(1), busca = b.v.charAt(0).toLowerCase() + b.v.slice(1);
  var v = [
    'Soy ' + prof + '. ' + anos + ' y lo que más me gusta es ' + gusta + '.' + (pf ? ' Destaco por ' + pf + '.' : '') + ' Busco ' + busca + '.' + (x ? ' ' + x.charAt(0).toUpperCase() + x.slice(1) + '.' : ''),
    'Me gusta ' + gusta + ', y eso se nota en mi día a día como ' + prof + '.' + (pf ? ' Mis compañeros dirían que lo mío es ' + pf + '.' : '') + ' Ahora busco ' + busca + '.' + (x ? ' ' + x.charAt(0).toUpperCase() + x.slice(1) + '.' : ''),
    anos + ' como ' + prof + '.' + (pf ? ' Aporto ' + pf + '.' : '') + ' Disfruto cuando consigo ' + gusta + '. Busco ' + busca + (x ? '. ' + x.charAt(0).toUpperCase() + x.slice(1) : '') + '.'
  ].map(function(t){ return t.replace(/\.\./g,'.').slice(0, 400); });
  $('pia-res').innerHTML = '<div class="pia-l">'+v.map(function(t, i){ return '<button type="button" class="pia-v" onclick="usarPresentacion('+i+')"><span class="pia-n">Versión '+(i+1)+'</span>'+esc(t)+'</button>'; }).join('')+'</div><p class="hint">Elige una. Luego puedes cambiar lo que quieras.</p>';
  PIA.v = v; $('pia-btn').textContent = 'Escribir otras';
}
function usarPresentacion(i){ var t = PIA.v[i]; $('al-res').value = t; $('al-res-n').textContent = t.length; cerrarModal(); toast('Listo. Puedes retocarlo.'); try{ $('al-res').focus(); }catch(e){} }

function altaGuardar(){
  error('al-err2','');
  if(!chipsSel('al-jor').length) return error('al-err2', 'Elige qué jornada buscas.');
  if(!chipsSel('al-disp').length) return error('al-err2', 'Dinos cuándo puedes empezar.');
  var kmN = parseInt($('al-rad-n').value, 10);
  if(!chipsSel('al-rad').length && !(kmN > 0)) return error('al-err2', 'Dinos hasta dónde te desplazas: elige una opción o escribe los km.');
  if(!chipsSel('al-rad').length && kmN > 1000) return error('al-err2', 'Escribe una distancia de hasta 1.000 km, o elige «Me mudaría».');
  if(_exps.filter(function(t){ return (t.puesto||'').trim() || (t.centro||'').trim(); }).length === 0 && !$('al-sin-exp').checked)
    return error('al-err2', val('al-exp').indexOf('Sin experiencia') === 0 ? 'Añade tus prácticas o marca que todavía no has trabajado en una clínica.' : 'Has dicho que tienes experiencia: añade al menos un sitio donde hayas trabajado.');
  if(!unaVez('altaG')) return;
  var p = Object.assign({}, S.perfil || {});
  p.nombre = val('al-nom'); p.profesion = val('al-prof'); p.experiencia = val('al-exp');
  var gl = geoCiudad(); p.ciudad = gl ? gl.n : val('al-ciu'); p.geo = CGeo.geo(gl);
  var rd = chipsSel('al-rad')[0] || String(kmN); p.radio = /^\d+$/.test(rd) ? +rd : rd;
  p.telefono = val('al-tel'); p.titulacion = val('al-tit');
  p.jornada = chipsSel('al-jor')[0]; p.disponibilidad = chipsSel('al-disp')[0];
  p.fuertes = chipsSel('al-pf'); p.resumen = val('al-res');
  p.trabajos = _exps.filter(function(t){ return (t.puesto||'').trim() || (t.centro||'').trim(); })
                    .map(function(t){ return {puesto:t.puesto.trim(), centro:t.centro.trim(), tiempo:(t.tiempo||'').trim()}; });
  p.sinExperiencia = !p.trabajos.length && $('al-sin-exp').checked;
  p.email = p.email || Nube.email || '';
  if(!p.ref){ try{ var rf = sessionStorage.getItem('cerco_ref'); if(rf && rf !== String(Nube.uid).slice(0,12)) p.ref = rf; }catch(e){} }
  bloquear('al-btn2', 'Guardando…');
  Nube.guardarPerfil(p).then(function(){
    if(!p.alta) p.alta = new Date().toISOString();
    S.perfil = p; S.zona = null; pintarUsuario();
    if(_editant){ toast('Perfil actualizado'); ir('perfil'); }
    else if(!p.disc) abrirTest(false);
    else ir('inicio');
  }).catch(function(){
    error('al-err2', 'No hemos podido guardar. Revisa tu conexión y vuelve a pulsar.');
  }).then(function(){ bloquear('al-btn2'); });
}
function editarPerfil(){ abrirAlta(true); }
// el sitio que ha elegido (o que ha escrito exacto)
function geoCiudad(){
  var i = $('al-ciu'); if(!i) return null;
  if(i.dataset.lat) return { n:i.value, lat:+i.dataset.lat, lng:+i.dataset.lng, p:i.dataset.prov };
  var h = CGeo.buscar(i.value, 2); var k = CGeo.norm(i.value);
  return h.length && (h[0].k === k || h.length === 1 && k.length > 3) ? h[0] : null;
}

/* ================================================================
   TEST
   ================================================================ */
var T = { i:0, resp:[], repetir:false, res:null };
/* Repetir el test: la primera vez cuando quieras (por si te equivocaste);
   después, cada 30 días como mínimo. Así el resultado refleja cómo trabajas
   y no lo que pide cada oferta. Todas las veces quedan registradas. */
var DISC_ESPERA_DIAS = 30;
function discRepetible(p){
  p = p || S.perfil || {}; var d = p.disc;
  if(!d || (p.discVeces || 1) < 2) return {ok:true};
  var t = new Date(d.fecha).getTime() + DISC_ESPERA_DIAS * 86400000;
  return {ok: !t || Date.now() >= t, fecha: new Date(t)};
}
function abrirTest(repetir){
  if(repetir){ var rp = discRepetible(); if(!rp.ok){ toast('Podrás repetir el test a partir del ' + fechaCorta(rp.fecha) + '.'); return; } }
  T.repetir = !!repetir; T.i = 0; T.res = null;
  T.resp = PREG.map(function(){ return {}; });
  $('t-intro').style.display = ''; $('t-preg').style.display = 'none'; $('t-res').style.display = 'none';
  $('t-steps').style.display = repetir ? 'none' : '';
  $('t-paso').style.display = repetir ? 'none' : '';
  $('t-luego').textContent = repetir ? 'Cancelar' : 'Lo haré más tarde';
  if($('t-rep-aviso')) $('t-rep-aviso').hidden = !repetir;
  botonSalirOb('t-salir', repetir || !!(S.perfil && S.perfil.disc));
  ir('test', null, true);
}
function testLuego(){
  if(T.repetir){ ir('perfil'); return; }
  ir('inicio');
  toast('Sin el test no podrás enviar solicitudes. Hazlo cuando quieras.');
}
/* Empezar el test: antes, la casilla de consentimiento (Fase 1: una sola versión) */
function testEmpezar(){
  var c = $('t-consent');
  if(c && !c.checked && !((S.perfil||{}).consentTest)){ error('t-cons-err', 'Marca la casilla para hacer el test. Si prefieres no hacerlo ahora, puedes seguir viendo las ofertas.'); try{ c.focus(); }catch(e){} return; }
  error('t-cons-err', '');
  if(S.perfil && !S.perfil.consentTest) S.perfil.consentTest = new Date().toISOString();
  $('t-intro').style.display = 'none'; $('t-preg').style.display = ''; pintarPregunta(); window.scrollTo(0,0);
}
function pintarPregunta(){
  var r = T.resp[T.i], h = '';
  if(!T.ord || T.ord.length !== PREG.length) T.ord = CERCO_discBarajar(PREG.length);
  T.ord[T.i].forEach(function(k){
    var txt = PREG[T.i][k];
    h += '<div class="opt" data-k="'+k+'"><div class="opt-t">'+esc(txt)+'</div><div class="opt-n"><small>Menos</small>';
    for(var n=1;n<=4;n++) h += '<button type="button" class="'+(r[k]===n?'on':'')+'" onclick="puntuar('+k+','+n+')" aria-label="'+n+'">'+n+'</button>';
    h += '<small>Más</small></div></div>';
  });
  $('t-ops').innerHTML = h;
  $('t-lbl').textContent = 'Pregunta ' + (T.i+1) + ' de ' + PREG.length;
  var pct = Math.round((T.i+1)/PREG.length*100);
  $('t-pct').textContent = pct + '%'; $('t-bar').style.width = pct + '%';
  $('t-next').textContent = T.i === PREG.length-1 ? 'Ver resultado' : 'Continuar';
  error('t-err', '');
}

/* El cálculo del test DISC está en src/comun/disc.js (compartido por los dos lados). */
var CERCO_DISC_PLANA = 'Has puesto la misma nota a las cuatro, así que esta pregunta no contará. Si alguna te describe un poco más, súbele la nota.';
var CERCO_DISC_FLOJO = 'Tu resultado sale poco definido: has dado notas muy parecidas a casi todo. Si quieres, vuelve atrás y marca más la diferencia entre lo que es muy tú y lo que no.';

/* Se puede repetir número: solo guardamos la nota y avisamos si las cuatro son iguales. */
function puntuar(k, n){
  var r = T.resp[T.i];
  r[k] = n;
  $('t-ops').querySelectorAll('.opt').forEach(function(op){
    var i = +op.dataset.k;
    op.querySelectorAll('button').forEach(function(b, j){ b.classList.toggle('on', r[i] === j+1); b.setAttribute('aria-pressed', r[i] === j+1); });
  });
  var igual = Object.keys(r).length === 4 && r[0] === r[1] && r[1] === r[2] && r[2] === r[3];
  error('t-err', igual ? CERCO_DISC_PLANA : '');
}
function testPlanas(){ var l = []; T.resp.forEach(function(r, i){ if(Object.keys(r).length === 4 && r[0] === r[1] && r[1] === r[2] && r[2] === r[3]) l.push(i); }); return l; }
function testRepasar(){
  var pl = testPlanas(); T.solo = pl.length ? pl : null; T.i = pl.length ? pl[0] : 0;
  $('t-res').style.display = 'none'; $('t-preg').style.display = ''; pintarPregunta(); window.scrollTo(0,0);
}
/* Notas casi iguales en todo: no inventamos un perfil y no se guarda nada. */
function testSinPerfil(){
  var n = testPlanas().length;
  $('tr-big').style.background = '#6B7280'; $('tr-big').textContent = '?';
  $('tr-nom').textContent = 'Perfil sin definir';
  // Solo la frase «Perfil sin definir» y la opción de repasar (sin párrafos de explicación)
  $('tr-desc').textContent = ''; $('tr-desc').style.display = 'none';
  $('tr-h').style.display = 'none';
  $('tr-bars').innerHTML = '<button type="button" class="btn btn-p btn-block" onclick="testRepasar()">'+(n ? 'Repasar '+n+' pregunta'+(n === 1 ? '' : 's')+(n <= 8 ? ' · 2 minutos' : '') : 'Repasar mis respuestas')+'</button>';
  $('tr-btn').textContent = 'Ahora no'; $('tr-btn').className = 'btn btn-block';
  error('tr-err', '');
  $('t-preg').style.display = 'none'; $('t-res').style.display = '';
  window.scrollTo(0,0);
}
function testSeguir(){
  if(Object.keys(T.resp[T.i]).length < 4) return error('t-err', 'Puntúa las 4 frases (del 1 al 4) antes de continuar.');
  if(T.solo){
    var sg = T.solo.filter(function(i){ return i > T.i; })[0];
    if(sg !== undefined){ T.i = sg; pintarPregunta(); window.scrollTo(0,0); return; }
    T.solo = null;
  } else if(T.i < PREG.length-1){ T.i++; pintarPregunta(); window.scrollTo(0,0); return; }
  T.res = calcularDisc(T.resp);
  if(T.res.definido === false) return testSinPerfil();
  var d = T.res;
  $('tr-big').style.background = COLOR[d.dom]; $('tr-big').textContent = d.dom;
  $('tr-nom').textContent = NOMBRE[d.dom] + ' con rasgo ' + NOMBRE[d.sec].toLowerCase();
  $('tr-desc').textContent = DESC[d.dom]; $('tr-desc').style.display = '';
  $('tr-bars').innerHTML = barras(d.norm); $('tr-h').textContent = 'Cómo te repartes'; $('tr-h').style.display = ''; $('tr-btn').className = 'btn btn-p btn-block';
  $('tr-btn').textContent = T.repetir ? 'Guardar resultado' : 'Ir a mi panel';
  error('tr-err', '');
  $('t-preg').style.display = 'none'; $('t-res').style.display = '';
  window.scrollTo(0,0);
}
function testAtras(){
  if(T.i > 0){ T.i--; pintarPregunta(); window.scrollTo(0,0); return; }
  $('t-preg').style.display = 'none'; $('t-intro').style.display = ''; window.scrollTo(0,0);
}
function testAcabar(){
  if(T.res && T.res.definido === false){ T.res = null; return testLuego(); }
  if(!T.res || !unaVez('testA')) return;
  var p = Object.assign({}, S.perfil || {}), antes = p.disc;
  p.disc = T.res;
  // cada repetición queda registrada: el resultado anterior pasa al historial
  if(antes && antes.dom){
    p.discHist = (p.discHist || []).concat([{ dom:antes.dom, sec:antes.sec, norm:antes.norm, fecha:antes.fecha || '' }]).slice(-20);
    p.discVeces = (p.discVeces || 1) + 1;
  } else if(!p.discVeces) p.discVeces = 1;
  bloquear('tr-btn', 'Guardando…');
  Nube.guardarPerfil(p).then(function(){
    S.perfil = p; pintarUsuario();
    if(antes && antes.dom) discASolicitudes(p);
    toast(T.repetir ? 'Resultado actualizado' : 'Perfil completo. Ya puedes solicitar ofertas.');
    ir(T.repetir ? 'perfil' : 'inicio');
  }).catch(function(){ error('tr-err', 'No hemos podido guardar el resultado. Revisa tu conexión y vuelve a pulsar.'); })
  .then(function(){ bloquear('tr-btn'); });
}

/* ================================================================
   DESCUBRIR · ofertas y vídeos de clínicas, una por pantalla (estilo TikTok)
   Una sola cosa a la vez, a pantalla completa. Se pasa a la siguiente
   deslizando hacia arriba. Las acciones van a la derecha, donde llega
   el pulgar; la información, abajo a la izquierda.
   ================================================================ */
var DX = { saltadas:{}, sonido:false, obs:null, i:0, n:0 };

function dxLista(){
  var libres = ofertasVisibles().filter(function(o){ return !o.ejemplo && !solDeOferta(o.id) && !DX.saltadas[o.id]; });
  var zc = ofertasCerca(libres);
  return ordenarOfertas(zc.dentro).concat(zc.fuera);
}
function dxFondo(o, cl){
  var v = cl && cl.video && cl.video.src;
  var foto = cl && (cl.fotos || [])[0];
  if(v) return '<video class="dx-media" src="'+esc(v)+'" muted loop playsinline preload="metadata"'+(foto ? ' poster="'+esc(foto)+'"' : '')+'></video>';
  if(foto) return '<img class="dx-media" src="'+esc(foto)+'" alt="">';
  var ps = perfilesDe(o), c1 = COLOR[ps[0]] || '#1A56DB', c2 = COLOR[ps[1]] || '#0F1C3F';
  var ini = String(o.clinica || 'C').replace(/^(clínica|centro|dental|clinica)\s+(dental\s+)?/i, '').trim().charAt(0).toUpperCase() || 'C';
  return '<div class="dx-media dx-sin" style="background:radial-gradient(circle at 30% 25%, '+c1+'55, transparent 55%), radial-gradient(circle at 75% 70%, '+c2+'55, transparent 55%), linear-gradient(160deg,#0B1220,#1A2A52);"><span>'+esc(ini)+'</span></div>';
}
function dxItem(o, i, n){
  var d = S.perfil && S.perfil.disc, cl = S.clinicas[o.clinicaId] || null, p = encaje(d, o), km = kmDe(o);
  var tieneVideo = !!(cl && cl.video && cl.video.src), guard = estaGuardada(o.id);
  var desc = (cl && (cl.dia || cl.pubDia)) || o.descripcion || '';
  var datos = [o.salario, km !== null ? (km < 1 ? 'En tu zona' : 'A ' + Math.round(km) + ' km') : '', o.jornada].filter(Boolean);
  var acc = !d
    ? '<button class="dx-a dx-a-p" onclick="abrirTest(false)" aria-label="Haz el test para poder solicitar">'+svg('compass','#fff',24)+'<span>Haz el test</span></button>'
    : '<button class="dx-a dx-a-p" onclick="modalSolicitar(\''+esc(o.id)+'\')" aria-label="Solicitar esta oferta">'+svg('send','#fff',24)+'<span>Solicitar</span></button>';
  return '<article class="dx-it" data-id="'+esc(o.id)+'" aria-label="'+esc(o.titulo + ' en ' + (o.clinica||'una clínica'))+'" aria-roledescription="oferta '+(i+1)+' de '+n+'">'
    + dxFondo(o, cl) + '<div class="dx-sombra"></div>'
    + (tieneVideo ? '<div class="dx-cap">'+svg('video','#fff',13)+'Vídeo de la clínica</div>' : '')
    + '<div class="dx-info">'
    +   (p !== null ? '<div class="dx-enc"><b>'+p+'%</b> encaje contigo</div>' : '')
    +   '<button class="dx-cl" onclick="ir(\'oferta\',\''+esc(o.id)+'\')">'+svg('building','#fff',15)+esc(o.clinica||'Clínica')+'</button>'
    +   '<h2>'+esc(o.titulo)+'</h2>'
    +   '<div class="dx-datos">'+datos.map(function(x){ return '<span>'+esc(x)+'</span>'; }).join('')+'</div>'
    +   (desc ? '<p class="dx-desc">'+esc(desc)+'</p>' : '')
    +   '<button class="dx-mas" onclick="ir(\'oferta\',\''+esc(o.id)+'\')">Ver la oferta completa '+svg('right','#fff',14)+'</button>'
    + '</div>'
    + '<div class="dx-acts">'
    +   acc
    +   '<button class="dx-a'+(guard ? ' on' : '')+'" onclick="dxGuardar(\''+esc(o.id)+'\', this)" aria-pressed="'+guard+'" aria-label="'+(guard ? 'Quitar de guardadas' : 'Guardar oferta')+'">'+svg('bookmark', guard ? '#F0A800' : '#fff', 24)+'<span>'+(guard ? 'Guardada' : 'Guardar')+'</span></button>'
    +   (tieneVideo ? '<button class="dx-a dx-son" onclick="dxSonido()" aria-pressed="'+DX.sonido+'" aria-label="'+(DX.sonido ? 'Quitar el sonido' : 'Poner el sonido')+'">'+svg(DX.sonido ? 'volume' : 'mute', '#fff', 24)+'<span>'+(DX.sonido ? 'Sonido' : 'Silencio')+'</span></button>' : '')
    +   '<button class="dx-a" onclick="dxSaltar(\''+esc(o.id)+'\')" aria-label="No me interesa, ver la siguiente">'+svg('x','#fff',24)+'<span>No me interesa</span></button>'
    + '</div>'
    + '</article>';
}
function pintarDescubrir(){
  var box = $('dx'); if(!box) return;
  if(!S.ofertasCargadas){ box.innerHTML = '<div class="dx-fin"><div class="spin"></div></div>'; return; }
  var l = dxLista(); DX.n = l.length;
  var fin = '<article class="dx-it dx-fin"><div>'+svg('check','#fff',34)
    + '<h2>'+(l.length ? 'Has visto todas las ofertas para ti' : 'Ahora mismo no hay ofertas nuevas para ti')+'</h2>'
    + '<p>Te avisamos cuando una clínica publique una oferta de tu profesión dentro de tu distancia.</p>'
    + '<div class="dx-fin-a"><button class="btn btn-p" onclick="ir(\'ofertas\')">Ver todas en lista</button>'
    + (Object.keys(DX.saltadas).length ? '<button class="btn btn-s" onclick="DX.saltadas = {}; pintarDescubrir();">Volver a ver las que pasé</button>' : '')
    + '</div></div></article>';
  box.innerHTML = l.map(function(o, i){ return dxItem(o, i, l.length); }).join('') + fin;
  box.scrollTop = 0;
  dxObservar();
  dxPista();
}
function dxObservar(){
  try{ if(DX.obs) DX.obs.disconnect(); }catch(e){}
  if(!('IntersectionObserver' in window)) return;
  DX.obs = new IntersectionObserver(function(es){
    es.forEach(function(e){
      var v = e.target.querySelector('video');
      if(e.isIntersecting && e.intersectionRatio > .6){
        DX.i = [].indexOf.call(e.target.parentNode.children, e.target);
        if(v){ v.muted = !DX.sonido; var pr = v.play(); if(pr && pr.catch) pr.catch(function(){}); }
      } else if(v){ try{ v.pause(); }catch(x){} }
    });
  }, { root: $('dx'), threshold: [0, .6, 1] });
  document.querySelectorAll('#dx .dx-it').forEach(function(it){ DX.obs.observe(it); });
}
function dxIrA(i){ var box = $('dx'), it = box && box.children[i]; if(it) box.scrollTo({top: it.offsetTop, behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth'}); }
function dxSaltar(id){ DX.saltadas[id] = 1; var i = DX.i; var it = document.querySelector('#dx .dx-it[data-id="'+id+'"]'); if(it){ it.classList.add('fuera'); setTimeout(function(){ pintarDescubrir(); dxIrA(Math.min(i, DX.n)); }, 220); } }
function dxGuardar(id, b){
  alternarGuardada(id);
  var on = !b.classList.contains('on'); b.classList.toggle('on', on); b.setAttribute('aria-pressed', on);
  b.innerHTML = svg('bookmark', on ? '#F0A800' : '#fff', 24) + '<span>'+(on ? 'Guardada' : 'Guardar')+'</span>';
}
function dxSonido(){
  DX.sonido = !DX.sonido;
  document.querySelectorAll('#dx video').forEach(function(v){ v.muted = !DX.sonido; });
  document.querySelectorAll('#dx .dx-son').forEach(function(b){ b.setAttribute('aria-pressed', DX.sonido); b.innerHTML = svg(DX.sonido ? 'volume' : 'mute', '#fff', 24) + '<span>'+(DX.sonido ? 'Sonido' : 'Silencio')+'</span>'; });
}
function dxPista(){
  var visto = false; try{ visto = localStorage.getItem('cerco_dx_pista') === '1'; }catch(e){}
  if(visto || DX.n < 2) return;
  var p = document.createElement('div'); p.className = 'dx-pista'; var tactil = matchMedia('(pointer:coarse)').matches;
  p.innerHTML = svg('up','#fff',22)+'<span>'+(tactil ? 'Desliza hacia arriba para ver la siguiente' : 'Baja con la rueda o las flechas ↑ ↓ para ver la siguiente')+'</span>';
  document.querySelector('#v-descubrir .dx-marco').appendChild(p);
  var quitar = function(){ p.remove(); try{ localStorage.setItem('cerco_dx_pista','1'); }catch(e){} };
  setTimeout(quitar, 4500); $('dx').addEventListener('scroll', quitar, {once:true});
}
document.addEventListener('keydown', function(e){
  if(S.vista !== 'descubrir' || /INPUT|TEXTAREA|SELECT/.test((e.target||{}).tagName||'') || $('modal')) return;
  if(e.key === 'ArrowDown' || e.key === 'PageDown'){ e.preventDefault(); dxIrA(DX.i + 1); }
  if(e.key === 'ArrowUp' || e.key === 'PageUp'){ e.preventDefault(); dxIrA(Math.max(0, DX.i - 1)); }
});

/* Historial del test: solo letras, porcentajes y fecha */
function histDiscLimpio(h){
  return (Array.isArray(h) ? h : []).slice(-20).filter(function(x){ return x && LETRAS.indexOf(x.dom) > -1; }).map(function(x){
    var n = {}; LETRAS.forEach(function(l){ n[l] = Math.max(0, Math.min(100, Math.round(+((x.norm||{})[l]) || 0))); });
    return { dom:x.dom, sec:LETRAS.indexOf(x.sec) > -1 ? x.sec : '', norm:n, fecha:String(x.fecha||'').slice(0,30) };
  });
}
/* Resultados anteriores, del más reciente al más antiguo */
function histDiscHtml(p){
  var h = (p.discHist || []).slice().reverse(); if(!h.length) return '';
  return '<details class="disc-hist"><summary>Tus resultados anteriores ('+h.length+')</summary>'
    + h.map(function(x){ return '<div class="disc-hist-i"><span class="disc-dot" style="background:'+COLOR[x.dom]+'">'+x.dom+'</span><span><b>'+NOMBRE[x.dom]+(x.sec ? ' con rasgo '+NOMBRE[x.sec].toLowerCase() : '')+'</b><small>'+esc(x.fecha ? fechaCorta(x.fecha.slice(0,10)) : 'Sin fecha')+'</small></span></div>'; }).join('')
    + '<p>Las clínicas a las que has enviado una solicitud ven estos cambios.</p></details>';
}
/* Al repetir el test, las clínicas a las que has escrito ven el cambio en tu solicitud */
function discASolicitudes(p){
  var ahora = new Date().toISOString();
  (S.sols || []).filter(function(s){ return s.estado !== 'retirada'; }).forEach(function(s){
    var c = { disc:p.disc, discHist:histDiscLimpio(p.discHist), discVeces:p.discVeces || 1, discCambio:ahora };
    var e = encaje(p.disc, s); if(e !== null) c.encaje = e;
    Nube.db().collection('candidaturas').doc(s.id).update(c).then(function(){ Object.assign(s, c); }).catch(function(){});
  });
}
