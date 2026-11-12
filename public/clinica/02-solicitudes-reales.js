/* Archivo sacado tal cual de index.html (Fase 1, paso 1.6). El orden de carga
   importa: se carga en el mismo sitio de la página donde estaba. */
/* ================================================================
   CERCO · SOLICITUDES REALES (conexión con el portal del profesional)
   - Cada oferta que publica la clínica se copia a ofertas_publicas,
     que es lo que ven los candidatos en candidato.html.
   - Las solicitudes llegan a candidaturas y aparecen aquí en directo:
     en Inicio, en Candidatos y en el contador de cada oferta.
   - Lo que la clínica decide (vista, entrevista, descartada) le llega
     al candidato al momento.
   ================================================================ */
(function(){
  var KCAND = 'cerco_candidaturas';
  var L = ['D','I','S','C'];
  var COL = {D:'#FF5A5F', I:'#F0A800', S:'#00B488', C:'#5B5FE0'};
  var NOM = {D:'Dominante', I:'Influyente', S:'Estable', C:'Concienzudo'};
  var APORTA = {
    D:'decide rápido y tira del equipo cuando hay presión',
    I:'trato cercano con el paciente y energía en el equipo',
    S:'paciencia y constancia en el día a día',
    C:'precisión y método, no se salta un protocolo'
  };
  var TXT = { enviada:'Nueva', vista:'Vista', entrevista:'Entrevista', descartada:'Descartada', retirada:'Retirada', contratada:'Contratada', caducada:'Sin respuesta' };
  var EST = {
    enviada:'background:#E8EFFD;color:#1A56DB;', vista:'background:#F1F3F6;color:#4B5563;',
    entrevista:'background:#E8F8F1;color:#0E9F6E;', descartada:'background:#F3F4F6;color:#6B7280;',
    retirada:'background:#F3F4F6;color:#6B7280;', contratada:'background:#059669;color:white;',
    caducada:'background:#FEF2F2;color:#B42318;'
  };
  var IC = {
    phone:'<path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/>',
    mail:'<rect width="20" height="16" x="2" y="4" rx="2"/><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/>',
    msg:'<path d="M7.9 20A9 9 0 1 0 4 16.1L2 22Z"/>',
    video:'<path d="m16 13 5.223 3.482a.5.5 0 0 0 .777-.416V7.87a.5.5 0 0 0-.752-.432L16 10.5"/><rect x="2" y="6" width="14" height="12" rx="2"/>',
    x:'<path d="M18 6 6 18"/><path d="m6 6 12 12"/>',
    pin:'<path d="M20 10c0 4.993-5.539 10.193-7.399 11.799a1 1 0 0 1-1.202 0C9.539 20.193 4 14.993 4 10a8 8 0 0 1 16 0"/><circle cx="12" cy="10" r="3"/>',
    brief:'<path d="M16 20V4a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/><rect width="20" height="14" x="2" y="6" rx="2"/>',
    right:'<path d="m9 18 6-6-6-6"/>',
    play:'<polygon points="6 3 20 12 6 21 6 3"/>',
    file:'<path d="M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z"/><path d="M14 2v4a2 2 0 0 0 2 2h4"/>',
    send:'<path d="M14.536 21.686a.5.5 0 0 0 .937-.024l6.5-19a.496.496 0 0 0-.635-.635l-19 6.5a.5.5 0 0 0-.024.937l7.93 3.18a2 2 0 0 1 1.112 1.11z"/><path d="m21.854 2.147-10.94 10.939"/>'
  };
  function sv(k, c, s){ return _svg(IC[k] || '', c, s); }
  function e(t){ return _esc(t); }
  function ini(n){ var p = String(n||'').trim().split(/\s+/); return p[0] ? (p[0].charAt(0) + (p.length>1 ? p[p.length-1].charAt(0) : '')).toUpperCase() : '?'; }
  function hace(iso){
    var d = new Date(iso); if(isNaN(d)) return '';
    var m = Math.round((Date.now() - d)/60000);
    if(m < 1) return 'ahora mismo';
    if(m < 60) return 'hace ' + m + ' min';
    var h = Math.round(m/60); if(h < 24) return 'hace ' + h + ' h';
    var dd = Math.round(h/24); return dd === 1 ? 'ayer' : ('hace ' + dd + ' días');
  }

  /* ---------- datos locales ---------- */
  function lista(){ try{ var l = JSON.parse(localStorage.getItem(KCAND) || '[]'); return Array.isArray(l) ? l : []; }catch(x){ return []; } }
  function guardarLista(l){ try{ localStorage.setItem(KCAND, JSON.stringify(l)); }catch(x){} }
  function activas(){ return lista().filter(function(c){ return c.estado !== 'retirada'; }); }
  // Una persona que solicita dos ofertas es una sola persona: se cuenta una vez
  function unaPorPersona(l){
    var vistas = {};
    return l.filter(function(c){ var k = c.candidatoUid || c.email || c.id; if(vistas[k]) return false; vistas[k] = 1; return true; });
  }
  // Lo que se ve en Candidatos: las solicitudes de la oferta abierta o, si no hay, todas
  function activasEnVista(){
    var o = (typeof ofertaEnPortal !== 'undefined') ? ofertaEnPortal : null;
    return activas().filter(function(c){ return !o || String(c.ofertaId) === String(o.id); });
  }
  function buscar(id){ var l = lista(); for(var i=0;i<l.length;i++) if(l[i].id === id) return l[i]; return null; }
  window.CERCO_candidaturas = lista;

  CDB.candidaturas = activas;
  var _recibOrig = CDB.candidatosRecibidos;
  CDB.candidatosRecibidos = function(){
    if(this.demo && this.demo()) return _recibOrig.call(this);
    return unaPorPersona(activas()).length;
  };

  function perfilesOferta(o){
    if(!o) return [];
    var ps = (Array.isArray(o.perfiles) && o.perfiles.length) ? o.perfiles
           : (o.disc ? String(o.disc).split('+').map(function(x){ return x.trim(); }) : []);
    return ps.filter(function(x){ return L.indexOf(x) > -1; });
  }

  /* ---------- nube: ofertas públicas ---------- */
  function docOferta(o){
    var doc = {};
    ['titulo','ubicacion','jornada','salario','disponibilidad','descripcion','requisitos','disc','estado','fecha','editada','contrato','convenio','prueba']
      .forEach(function(k){ if(o[k] !== undefined && o[k] !== null) doc[k] = String(o[k]).slice(0, (k==='descripcion'||k==='requisitos') ? 3000 : 200); });
    doc.perfiles = perfilesOferta(o);
    ['horario','proceso'].forEach(function(k){ if(o[k]) doc[k] = String(o[k]).slice(0,200); });
    ['turnos','funciones'].forEach(function(k){ if(o[k] && o[k].length) doc[k] = o[k].slice(0,8).map(function(x){ return String(x).slice(0,60); }); });
    doc.candidatos = parseInt(o.candidatos,10) || 0;
    return doc;
  }
  Nube.guardarOferta = function(o){
    var r = this.refClinica(), d = this.db();
    if(!r || !d || !o || !o.id) return Promise.resolve(false);
    var doc = docOferta(o);
    var cli = {}; try{ cli = CDB.clinica(); }catch(x){}
    var pub = Object.assign({}, doc, {
      clinicaId: this.uid,
      clinica: String(cli.nom || 'Clínica').slice(0,120),
      ciudad: String(cli.ciutat || '').slice(0,120),
      estado: doc.estado || 'activa',
      actualizado: new Date().toISOString()
    });
    delete pub.candidatos;
    // coordenadas del municipio: el candidato ve a cuántos km le queda
    var g = window.CGeo ? (CGeo.lugar(o.ubicacion) || CGeo.lugar(cli.ciutat)) : null;
    if(g){ pub.lat = g.lat; pub.lng = g.lng; pub.prov = g.p; pub.municipio = g.n; }
    return Promise.all([
      r.collection('ofertas').doc(String(o.id)).set(doc),
      d.collection('ofertas_publicas').doc(String(o.id)).set(pub)
    ]).then(function(){ return true; }).catch(function(){ return false; });
  };
  var _borrarOrig = Nube.borrarOferta;
  Nube.borrarOferta = function(id){
    var d = this.db();
    try{ if(d && this.uid) d.collection('ofertas_publicas').doc(String(id)).delete().catch(function(){}); }catch(x){}
    return _borrarOrig.call(this, id);
  };
  // Sin argumento (al editar) se suben todas: así nunca queda una a medias
  window._subirOferta = function(o){
    if(!Nube.activa) return;
    if(o) return Nube.guardarOferta(o);
    var l = []; try{ l = getSavedOffers(); }catch(x){}
    l.forEach(function(x){ Nube.guardarOferta(x); });
  };
  // Si cambia el nombre de la clínica, las ofertas públicas lo reflejan
  var _subirCliOrig = window._subirClinica;
  window._subirClinica = function(){
    try{ _subirCliOrig && _subirCliOrig(); }catch(x){}
    try{ if(Nube.activa) window._subirOferta(); }catch(x){}
  };

  /* ---------- nube: solicitudes ---------- */
  Nube.escucharCandidaturas = function(fn){
    var d = this.db();
    if(!d || !this.uid) return null;
    try{
      return d.collection('candidaturas').where('clinicaId','==',this.uid).onSnapshot(function(s){
        var out = []; s.forEach(function(x){ var v = x.data(); v.id = x.id; out.push(v); }); fn(out);
      }, function(){});
    }catch(x){ return null; }
  };
  Nube.actualizarCandidatura = function(c, estado, nota){
    var d = this.db();
    if(!d) return Promise.reject('sin-nube');
    var ahora = new Date().toISOString();
    var h = (c.historial || []).slice(); h.push({estado:estado, fecha:ahora});
    var cambio = {estado:estado, actualizado:ahora, historial:h};
    if(nota !== undefined) cambio.nota = String(nota||'').slice(0,800);
    if(estado === 'descartada' && window.__motivoDesc){ cambio.motivo = String(window.__motivoDesc).slice(0,20); window.__motivoDesc = ''; }
    var yaRespondida = (c.historial || []).some(function(x){ return x.estado === 'entrevista' || x.estado === 'descartada'; });
    return d.collection('candidaturas').doc(c.id).update(cambio).then(function(){
      // Lo que ven los candidatos: cuánto tarda esta clínica en contestar (sin datos personales)
      if(!yaRespondida && (estado === 'entrevista' || estado === 'descartada')){
        try{ d.collection('tiempos_respuesta').doc(c.id).set({respondida:ahora}, {merge:true}).catch(function(){}); }catch(x){}
      }
      return cambio;
    });
  };

  var _unsubC = null, _primera = true;
  function contarPorOferta(l){
    try{
      var of = getSavedOffers(), cambia = false;
      of.forEach(function(o){
        var n = l.filter(function(c){ return String(c.ofertaId) === String(o.id) && c.estado !== 'retirada'; }).length;
        if((parseInt(o.candidatos,10)||0) !== n){ o.candidatos = n; cambia = true; }
      });
      if(cambia) setSavedOffers(of);
    }catch(x){}
  }
  window._escucharCandidaturas = function(){
    if(_unsubC){ try{ _unsubC(); }catch(x){} _unsubC = null; }
    _primera = true;
    _unsubC = Nube.escucharCandidaturas(function(l){
      var antes = {}; lista().forEach(function(c){ antes[c.id] = c.estado; });
      l.sort(function(a,b){ return String(b.fecha||'').localeCompare(String(a.fecha||'')); });
      guardarLista(l);
      contarPorOferta(l);
      if(!_primera){
        var nuevas = l.filter(function(c){ return !antes[c.id]; });
        if(nuevas.length && typeof showToast === 'function')
          showToast(nuevas.length === 1 ? (nuevas[0].origen === 'rebote' ? 'CERCO te presenta a ' + (nuevas[0].nombre||'un candidato') + ' para ' + (nuevas[0].ofertaTitulo||'tu oferta') : (nuevas[0].nombre||'Alguien') + (esVisita(nuevas[0]) ? ' quiere conocer la clínica' : (nuevas[0].destacada ? ' ha destacado su solicitud para ' : ' ha solicitado ') + (nuevas[0].ofertaTitulo||'tu oferta'))) : (nuevas.length + ' solicitudes nuevas'));
        var ret = l.filter(function(c){ return antes[c.id] && antes[c.id] !== 'retirada' && c.estado === 'retirada'; });
        if(ret.length && typeof showToast === 'function') showToast((ret[0].nombre||'Un candidato') + ' ha retirado su solicitud');
      }
      _primera = false;
      try{ CDB.renderTodo(); }catch(x){}
      try{ if(typeof pintarOfertasReales === 'function') pintarOfertasReales(); }catch(x){}
    });
  };
  // Se engancha cada vez que Firebase confirma la sesión del propietario
  var _eqOrig = window._escucharEquipoEnDirecto;
  var _publicadas = false;
  window._escucharEquipoEnDirecto = function(){
    try{ _eqOrig && _eqOrig(); }catch(x){}
    try{ window._escucharCandidaturas(); }catch(x){}
    // Las ofertas creadas antes de existir el portal del candidato también se publican
    if(!_publicadas){
      _publicadas = true;
      setTimeout(function(){ try{ if(Nube.activa) window._subirOferta(); }catch(x){} }, 4000);
    }
  };
  // Al cerrar sesión, lo de esta clínica no se queda en el navegador
  // La usa cerrarSesion (clinica/01-panel.js)
  window.CERCO_soltarCandidaturas = function(){
    if(_unsubC){ try{ _unsubC(); }catch(x){} _unsubC = null; }
    try{ localStorage.removeItem(KCAND); }catch(x){}
  };

  /* ---------- encaje, con la misma regla que ve el candidato ---------- */
  function encaje(c){
    if(typeof c.encaje === 'number') return c.encaje;
    return CERCO_encaje(c.disc && c.disc.norm, c.perfiles || []);
  }
  function chip(l){ return '<span style="display:inline-flex;align-items:center;background:'+COL[l]+';color:white;border-radius:99px;padding:2px 9px;font-size:11px;font-weight:800;">'+l+' · '+NOM[l]+'</span>'; }
  function esVisita(c){ return c && c.tipo === 'visita'; }
  var TXTV = { enviada:'Quiere conocerte', vista:'Quiere conocerte', entrevista:'Visita propuesta', descartada:'Ahora no', retirada:'Retirada', caducada:'Sin respuesta' };
  function pill(est, c){ var t = esVisita(c) ? (TXTV[est]||est) : (TXT[est]||est); var st = esVisita(c) && (est==='enviada'||est==='vista') ? 'background:#F3EEFA;color:#66328A;' : (EST[est]||''); return '<span style="'+st+'border-radius:99px;padding:3px 9px;font-size:11px;font-weight:800;white-space:nowrap;">'+t+'</span>'; }

  /* ---------- tarjeta de candidato real ---------- */
  function tarjeta(c){
    var p = encaje(c), d = c.disc || {}, abierta = c.estado === 'enviada' || c.estado === 'vista';
    var rol = [c.profesion, c.experiencia ? String(c.experiencia).toLowerCase() : ''].filter(Boolean).join(', ');
    var tags = (c.fuertes || []).slice(0,3).map(function(x){ return '<span class="hashtag">#'+e(String(x).toLowerCase().replace(/\s+/g,''))+'</span>'; }).join('');
    var quick = [c.ciudad ? '<span class="quick-tag dist-tag">'+sv('pin','currentColor',11)+' '+e(c.ciudad)+'</span>' : '',
                 c.disponibilidad ? '<span class="quick-tag">'+e(c.disponibilidad === 'Inmediata' ? 'Disp. inmediata' : c.disponibilidad)+'</span>' : '',
                 c.jornada ? '<span class="quick-tag">'+e(c.jornada)+'</span>' : '', c.cv ? '<span class="quick-tag">CV en PDF</span>' : ''].join('');
    var acciones = abierta
      ? '<button class="act-btn act-pass" onclick="event.stopPropagation(); abrirFichaCandidato(\''+e(c.id)+'\'); responderCandidato(\''+e(c.id)+'\',\'descartada\')">'+sv('x','currentColor',13)+' '+(esVisita(c)?'Ahora no':'Descartar')+'</button>'
        + '<button class="act-btn act-like" onclick="event.stopPropagation(); '+(esVisita(c) ? 'abrirFichaCandidato(\''+e(c.id)+'\'); responderCandidato(\''+e(c.id)+'\',\'entrevista\')' : 'CERCO_meInteresa(\''+e(c.id)+'\')')+'">'+_svg('<path d="M20 6 9 17l-5-5"/>','currentColor',12)+' '+(esVisita(c) ? 'Proponer visita' : (c.interesa ? 'Programar entrevista' : 'Me interesa'))+'</button>'
      : '<button class="act-btn act-pass" style="flex:1;">Ver ficha</button>';
    return '<div class="candidate-card cand-real" data-id="'+e(c.id)+'" data-disc="'+e(d.dom||'')+'" data-txt="'+e([c.nombre,c.profesion,c.ciudad,c.ofertaTitulo,(c.fuertes||[]).join(' ')].join(' ').toLowerCase())+'"'+(window._geoAttrs ? _geoAttrs(c) : '')+' onclick="abrirFichaCandidato(\''+e(c.id)+'\')" '
      + 'style="'+(c.estado==='retirada'||c.estado==='descartada'||c.estado==='caducada'?'opacity:.6;':'')+(c.destacada&&abierta?'border-color:#F0A000;box-shadow:0 0 0 2px #F0A000;':(c.estado==='enviada'?'border-color:#C9D6F5;':''))+'">'
      + '<div class="card-top"'+(((c.video && c.video.poster) || c.foto) ? ' style="background-image:url(\''+e((c.video && c.video.poster) || c.foto)+'\');background-size:cover;background-position:center 25%;"' : '')+'>'
      +   (((c.video && c.video.poster) || c.foto) ? '' : '<div class="avatar-circle-big">'+e(ini(c.nombre))+'</div>')
      +   '<div class="top-meta"><div class="match-badge">'+_svg('<circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="6"/><circle cx="12" cy="12" r="2"/>','currentColor',12)+' '+(p===null?'–':p+'%')+'</div>'
      +   (c.video ? '<div class="play-btn" role="button" aria-label="Ver su vídeo" onclick="event.stopPropagation(); abrirFichaCandidato(\''+e(c.id)+'\'); setTimeout(function(){ verVideoCandidato(\''+e(c.id)+'\'); }, 150)">▶</div>' : '<div class="sin-video">Sin vídeo</div>')
      +   '</div>'
      +   '<div class="overlay-bottom"><div class="cand-name-overlay">'+e(c.nombre||'Sin nombre')+'</div>'
      +   '<div class="hashtags-row">'+(d.dom ? '<span class="hashtag disc-tag" style="background:'+COL[d.dom]+'">#'+d.dom+'_'+NOM[d.dom]+'</span>' : '')+tags+'</div></div>'
      + '</div>'
      + '<div class="card-body">'
      +   '<div style="display:flex;align-items:center;gap:6px;flex-wrap:wrap;margin-bottom:6px;">'+pill(c.estado, c)+(window._extraPills ? _extraPills(c) : '')+'</div>'
      +   (window._extraLinea ? _extraLinea(c) : '')
      +   '<div class="cand-role">'+e(rol)+'</div>'
      +   (window._geoLinea ? _geoLinea(c) : '')
      +   '<div class="disc-row">'+(d.dom ? '<span class="disc-pill" style="background:'+COL[d.dom]+'">'+d.dom+' · '+NOM[d.dom]+'</span>' : '')+(d.sec ? '<span class="disc-pill" style="background:'+COL[d.sec]+';opacity:.85;">'+d.sec+' · '+NOM[d.sec]+'</span>' : '')+'</div>'
      +   '<div class="quick-tags">'+quick+'</div>'
      +   '<div style="font-size:11.5px;color:#6B7280;margin:-6px 0 12px;">'+(esVisita(c) ? 'Quiere conocer la clínica · ' : 'Para ')+'<b style="color:#6B7280;">'+e(c.ofertaTitulo||'tu oferta')+'</b> · '+e(hace(c.fecha))+'</div>'
      +   '<div class="card-actions">'+acciones+'</div>'
      + '</div></div>';
  }

  /* ---------- Candidatos: las solicitudes reales arriba ---------- */
  function contenedorReales(){
    var box = document.getElementById('portal-reales');
    if(box) return box;
    var grid = document.getElementById('grid-portal');
    if(!grid || !grid.parentNode) return null;
    box = document.createElement('div');
    box.id = 'portal-reales';
    grid.parentNode.insertBefore(box, grid);
    return box;
  }
  function pintarReales(){
    var box = contenedorReales(); if(!box) return;
    var grid = document.getElementById('grid-portal');
    var enDemo = false; try{ enDemo = CDB.demo(); }catch(x){}
    if(enDemo){ box.innerHTML = ''; box.style.display = 'none'; if(grid) grid.style.display = ''; ajustarFiltros(false); return; }
    var o = (typeof ofertaEnPortal !== 'undefined') ? ofertaEnPortal : null;
    var l = lista().filter(function(c){ return !o || String(c.ofertaId) === String(o.id); });
    var peso = {enviada:0, vista:1, entrevista:1, contratada:2, descartada:3, caducada:3, retirada:4};
    l.sort(function(a,b){
      var pa = peso[a.estado]||0, pb = peso[b.estado]||0;
      if(pa !== pb) return pa - pb;
      if(pa <= 1 && !!a.destacada !== !!b.destacada) return a.destacada ? -1 : 1;
      var ea = encaje(a), eb = encaje(b); ea = ea===null?-1:ea; eb = eb===null?-1:eb;
      if(ea !== eb) return eb - ea;
      return String(b.fecha||'').localeCompare(String(a.fecha||''));
    });
    var hay = activas().length > 0;
    // Con candidatos de verdad, los de ejemplo sobran
    if(grid) grid.style.display = hay ? 'none' : '';
    ajustarFiltros(hay);
    var av = document.getElementById('portal-aviso-real');
    if(av && hay){ av.innerHTML = ''; av.style.display = 'none'; }
    if(!l.length){
      box.style.display = hay ? '' : 'none';
      box.innerHTML = hay ? '<div style="background:white;border:1px dashed #D8DEE9;border-radius:16px;padding:28px 22px;text-align:center;margin-bottom:16px;"><div style="font-size:15px;font-weight:800;color:#111827;margin-bottom:6px;">Esta oferta aún no tiene solicitudes</div><div style="font-size:13.5px;color:#6B7280;line-height:1.6;">Las verás aquí en cuanto alguien la solicite.</div></div>' : '';
      return;
    }
    box.style.display = '';
    box.innerHTML = '<div class="rgrid" id="portal-reales-lista">' + l.map(tarjeta).join('') + '</div>';
    try{ filtrarReales(); }catch(x){}
  }
  /* Los filtros de distancia y los contadores eran de los ejemplos:
     con candidatos reales, las cifras son las suyas */
  function ajustarFiltros(hay){
    var scr = document.getElementById('screen-portal'); if(!scr) return;
    var addr = document.getElementById('clinic-address-portal');
    var card = addr ? addr.closest('div[style*="border-radius:12px"]') : null;
    // con candidatos reales se mide desde la clínica: sobra el buscador de zona de los ejemplos
    try{ window._geoPrepReal && _geoPrepReal(hay); }catch(x){}
    [scr.querySelector('.location-bar-left')]
      .forEach(function(el){ if(!el) return; if(hay) el.style.setProperty('display','none','important'); else el.style.removeProperty('display'); });
    var n = {T:0, D:0, I:0, S:0, C:0};
    unaPorPersona(activasEnVista()).forEach(function(c){ n.T++; if(c.disc && n[c.disc.dom] !== undefined) n[c.disc.dom]++; });
    scr.querySelectorAll('.filters-row .filter-chip:not(.orden-chip)').forEach(function(ch){
      if(!ch.dataset.orig) ch.dataset.orig = ch.innerHTML;
      var t = ch.dataset.orig.replace(/<[^>]+>/g,'');
      var m = t.match(/Perfil ([DISC])/);
      if(!hay){ if(ch.innerHTML !== ch.dataset.orig) ch.innerHTML = ch.dataset.orig; ch.style.removeProperty('display'); return; }
      if(/Todos/.test(t)) ch.innerHTML = ch.dataset.orig.replace(/\(\d+\)/, '(' + n.T + ')');
      else if(m) ch.innerHTML = ch.dataset.orig.replace(/\(\d+\)/, '(' + n[m[1]] + ')');
      else ch.style.setProperty('display','none','important');
    });
  }
  function filtrarReales(){
    var q = ((document.getElementById('search-portal')||{}).value || '').toLowerCase().trim();
    // El filtro de color vive dentro del portal: lo leemos del chip marcado
    var act = document.querySelector('#screen-portal .filters-row .filter-chip.active:not(.orden-chip)');
    var mm = act ? (act.textContent || '').match(/Perfil\s+([DISC])\b/) : null;
    var disc = mm ? mm[1] : null;
    document.querySelectorAll('#portal-reales .cand-real').forEach(function(card){
      var ok = (!q || card.dataset.txt.indexOf(q) > -1) && (!disc || card.dataset.disc === disc) && (!window._geoOkReal || _geoOkReal(card));
      card.style.display = ok ? '' : 'none';
    });
    try{ window._geoDespuesReal && _geoDespuesReal(); }catch(x){}
  }
  var _renderPortalOrig = window.renderPortalReal;
  window.renderPortalReal = function(){
    try{ _renderPortalOrig && _renderPortalOrig(); }catch(x){}
    var enDemo = false; try{ enDemo = CDB.demo(); }catch(x){}
    if(!enDemo){
      var vis = activasEnVista();
      var n = unaPorPersona(vis).length, h1 = document.getElementById('portal-h1'), sub = document.getElementById('portal-sub');
      var nuevas = vis.filter(function(c){ return c.estado === 'enviada'; }).length;
      if(n && h1) h1.textContent = n + (n === 1 ? ' candidato ha aplicado' : ' candidatos han aplicado');
      if(n && sub) sub.textContent = nuevas ? (nuevas === 1 ? 'Tienes 1 solicitud sin abrir' : 'Tienes ' + nuevas + ' solicitudes sin abrir') : 'Ordenados por encaje con el perfil que pide cada oferta';
    }
    pintarReales();
  };
  var _filtrosOrig = window.applyFilters_portal;
  if(typeof _filtrosOrig === 'function'){
    window.applyFilters_portal = function(){
      var r; try{ r = _filtrosOrig.apply(this, arguments); }catch(x){}
      try{
        filtrarReales();
        // El aviso "sin resultados" de los ejemplos no vale si hay reales visibles
        if(activas().length){
          var v = document.getElementById('portal-sin-resultados');
          var vis = [].slice.call(document.querySelectorAll('#portal-reales .cand-real')).filter(function(c){ return c.style.display !== 'none'; }).length;
          if(v && vis) v.remove();
        }
      }catch(x){}
      return r;
    };
  }
  // El buscador y los chips llaman a su propia copia del filtro: escuchamos también
  (function(){
    var s = document.getElementById('search-portal');
    if(s) s.addEventListener('input', function(){ try{ filtrarReales(); }catch(x){} });
    document.querySelectorAll('#screen-portal .filters-row .filter-chip:not(.orden-chip)').forEach(function(ch){
      ch.addEventListener('click', function(){ setTimeout(function(){ try{ filtrarReales(); }catch(x){} }, 0); });
    });
  })();
  window.CERCO_pintarSolicitudesReales = pintarReales; // la usa _cabeceraPortal (clinica/01-panel.js)

  /* ---------- Inicio: lo que necesita respuesta ---------- */
  var _inicioOrig = window.renderInicioReal;
  window.renderInicioReal = function(){
    try{ _inicioOrig && _inicioOrig(); }catch(x){}
    var box = document.getElementById('inicio-real');
    if(!box || box.style.display === 'none') return;
    var vell = document.getElementById('inicio-solicitudes'); if(vell) vell.remove();
    var pend = activas().filter(function(c){ return c.estado === 'enviada'; });
    if(!pend.length) return;
    var el = document.createElement('div');
    el.id = 'inicio-solicitudes';
    el.style.cssText = 'background:white;border:1px solid #F5C2C2;border-radius:16px;overflow:hidden;margin-bottom:16px;box-shadow:0 1px 4px rgba(0,0,0,.04);';
    el.innerHTML = '<div style="background:#FFF5F5;padding:14px 18px;display:flex;justify-content:space-between;align-items:center;gap:10px;border-bottom:1px solid #FDE2E2;">'
      + '<div style="font-size:13px;font-weight:800;color:#B42318;letter-spacing:.3px;">NECESITAN TU RESPUESTA</div>'
      + '<div style="font-size:12px;font-weight:700;color:#B42318;">'+pend.length+(pend.length===1?' solicitud':' solicitudes')+'</div></div>'
      + pend.slice(0,4).map(function(c){
          var p = encaje(c);
          return '<div onclick="abrirFichaCandidato(\''+e(c.id)+'\')" style="display:flex;align-items:center;gap:12px;padding:13px 18px;border-top:1px solid #F3F4F6;cursor:pointer;">'
            + '<div style="width:38px;height:38px;border-radius:50%;background:#EEF3FE;color:#1A56DB;display:flex;align-items:center;justify-content:center;font-weight:800;font-size:13px;flex-shrink:0;">'+e(ini(c.nombre))+'</div>'
            + '<div style="flex:1;min-width:0;"><div style="font-size:14px;font-weight:800;color:#111827;">'+e(c.nombre)+' <span style="font-size:11.5px;font-weight:700;color:#B42318;">'+e(hace(c.fecha))+'</span></div>'
            + '<div style="font-size:12.5px;color:#6B7280;">'+(esVisita(c)?'<b style="color:#66328A;">Quiere conocer la clínica</b> · ':'')+e(c.ofertaTitulo||'')+(p!==null?' · '+p+'% encaje':'')+'</div></div>'
            + '<span style="background:#1A56DB;color:white;border-radius:9px;padding:8px 13px;font-size:12.5px;font-weight:800;white-space:nowrap;">Ver perfil</span></div>';
        }).join('')
      + (pend.length > 4 ? '<div onclick="showScreen(\'portal\')" style="padding:12px 18px;border-top:1px solid #F3F4F6;font-size:13px;font-weight:700;color:#1A56DB;cursor:pointer;text-align:center;">Ver las '+pend.length+' solicitudes</div>' : '');
    var kpis = box.querySelector('.inicio-kpis');
    if(kpis && kpis.nextSibling) box.insertBefore(el, kpis.nextSibling); else box.appendChild(el);
  };

  /* ---------- ficha del candidato ---------- */
  function cerrar(){ var m = document.getElementById('modal-cand'); if(m) m.remove(); document.body.style.overflow = ''; }
  window.cerrarFichaCandidato = cerrar;
  function waNum(t){ var n = String(t||'').replace(/[^\d]/g,''); if(n.length === 9) n = '34' + n; return n; }

  window.abrirFichaCandidato = function(id, modo){
    var c = buscar(id); if(!c) return;
    // Abrirla ya es "vista": el candidato lo sabe al momento
    if(c.estado === 'enviada' && !modo){
      Nube.actualizarCandidatura(c, 'vista').then(function(cambio){
        var l = lista(); l.forEach(function(x){ if(x.id === c.id) Object.assign(x, cambio); }); guardarLista(l);
        try{ CDB.renderTodo(); }catch(x){}
      }).catch(function(){});
    }
    cerrar();
    var d = c.disc || null, p = encaje(c), ps = c.perfiles || [];
    var m = document.createElement('div');
    m.id = 'modal-cand';
    m.style.cssText = 'position:fixed;inset:0;background:rgba(10,14,30,.55);display:flex;align-items:center;justify-content:center;z-index:10002;padding:16px;box-sizing:border-box;';
    m.onclick = function(ev){ if(ev.target === m) cerrar(); };
    var fila = function(k, v){ return v ? '<div style="display:flex;gap:12px;padding:7px 0;border-top:1px solid #F3F4F6;font-size:13.5px;"><div style="width:120px;flex-shrink:0;color:#6B7280;">'+k+'</div><div style="color:#111827;font-weight:600;min-width:0;overflow-wrap:anywhere;">'+e(v)+'</div></div>' : ''; };
    var barras = d && d.norm ? L.slice().sort(function(a,b){ return d.norm[b]-d.norm[a]; }).map(function(l){
      return '<div style="margin-bottom:8px;"><div style="display:flex;justify-content:space-between;font-size:12.5px;color:#374151;font-weight:600;margin-bottom:4px;"><span>'+NOM[l]+' ('+l+')</span><span>'+d.norm[l]+'%</span></div>'
        + '<div style="height:7px;background:#F1F3F6;border-radius:99px;overflow:hidden;"><div style="height:100%;width:'+d.norm[l]+'%;background:'+COL[l]+';border-radius:99px;"></div></div></div>';
    }).join('') : '';
    var porque = '';
    if(d && ps.length){
      var coinc = ps.filter(function(l){ return l === d.dom || l === d.sec; });
      porque = coinc.length
        ? 'Para esta oferta marcaste <b>'+ps.join(' + ')+'</b>. Coincide en <b>'+coinc.map(function(l){ return NOM[l]; }).join(' y ')+'</b>: '+coinc.map(function(l){ return APORTA[l]; }).join(', y ')+'.'
        : 'Para esta oferta marcaste <b>'+ps.join(' + ')+'</b>. Su perfil principal es otro ('+NOM[d.dom]+'): '+APORTA[d.dom]+'. Puede aportar lo que al equipo le falta.';
    }
    var contacto = '';
    if(c.estado !== 'retirada'){
      contacto = '<div style="display:flex;gap:8px;flex-wrap:wrap;margin:14px 0 4px;">'
        + (c.telefono ? '<a href="tel:'+e(String(c.telefono).replace(/\s+/g,''))+'" style="flex:1;min-width:92px;display:inline-flex;align-items:center;justify-content:center;gap:6px;border:1px solid #E5E7EB;border-radius:10px;padding:10px;font-size:13px;font-weight:700;color:#374151;text-decoration:none;">'+sv('phone','#374151',14)+'Llamar</a>'
                      + '<a href="https://wa.me/'+waNum(c.telefono)+'" target="_blank" rel="noopener" style="flex:1;min-width:92px;display:inline-flex;align-items:center;justify-content:center;gap:6px;border:1px solid #E5E7EB;border-radius:10px;padding:10px;font-size:13px;font-weight:700;color:#374151;text-decoration:none;">'+sv('msg','#374151',14)+'WhatsApp</a>' : '')
        + (c.email ? '<a href="mailto:'+e(c.email)+'" style="flex:1;min-width:92px;display:inline-flex;align-items:center;justify-content:center;gap:6px;border:1px solid #E5E7EB;border-radius:10px;padding:10px;font-size:13px;font-weight:700;color:#374151;text-decoration:none;">'+sv('mail','#374151',14)+'Correo</a>' : '')
        + '</div>';
    }
    var acciones;
    if(c.estado === 'retirada') acciones = '<div style="background:#F3F4F6;border-radius:10px;padding:12px 14px;font-size:13px;color:#6B7280;line-height:1.5;">Ha retirado su solicitud. Ya no le interesa este puesto.</div>';
    else if(c.estado === 'caducada')
      acciones = '<div style="background:#FEF2F2;border-radius:10px;padding:12px 14px;font-size:13px;color:#B42318;line-height:1.55;"><b>Se cerró sin respuesta.</b> Pasaron '+(window.CERCO_DIAS_CADUCA||5)+' días laborables sin que le contestaras y CERCO cerró la solicitud para que no siguiera esperando.</div>'
        + '<button onclick="responderCandidato(\''+e(c.id)+'\',\'entrevista\')" style="width:100%;margin-top:10px;background:white;color:#374151;border:1px solid #E5E7EB;border-radius:10px;padding:11px;font-size:13.5px;font-weight:700;cursor:pointer;font-family:inherit;">Invitarle igualmente</button>';
    else if(c.estado === 'entrevista' || c.estado === 'descartada')
      acciones = '<div style="background:'+(c.estado==='entrevista'?'#E8F8F1':'#F3F4F6')+';border-radius:10px;padding:12px 14px;font-size:13px;color:'+(c.estado==='entrevista'?'#0B5B43':'#6B7280')+';line-height:1.55;white-space:pre-line;"><b>'+(c.estado==='entrevista'?(esVisita(c)?'Le has propuesto una visita.':'Le has invitado a una entrevista.'):(esVisita(c)?'Le has dicho que ahora no podéis recibirle.':'Le has dicho que esta vez no.'))+'</b>'+(c.nota?'\nTu mensaje: '+e(c.nota):'')+'</div>'
        + (c.estado==='descartada' ? '<button onclick="responderCandidato(\''+e(c.id)+'\',\'entrevista\')" style="width:100%;margin-top:10px;background:white;color:#374151;border:1px solid #E5E7EB;border-radius:10px;padding:11px;font-size:13.5px;font-weight:700;cursor:pointer;font-family:inherit;">'+(esVisita(c)?'Cambiar de idea y proponer visita':'Cambiar de idea e invitarle')+'</button>' : '');
    else acciones = '<div style="display:flex;gap:8px;">'
        + '<button onclick="responderCandidato(\''+e(c.id)+'\',\'descartada\')" style="flex:1;background:white;color:#6B7280;border:1px solid #E5E7EB;border-radius:10px;padding:12px;font-size:13.5px;font-weight:700;cursor:pointer;font-family:inherit;">'+(esVisita(c)?'Ahora no':'Descartar')+'</button>'
        + '<button onclick="responderCandidato(\''+e(c.id)+'\',\'entrevista\')" style="flex:2;background:'+(esVisita(c)?'#66328A':'#1A56DB')+';color:white;border:none;border-radius:10px;padding:12px;font-size:13.5px;font-weight:800;cursor:pointer;font-family:inherit;display:inline-flex;align-items:center;justify-content:center;gap:7px;">'+(esVisita(c)?sv('pin','white',15)+(/llamada/i.test(c.modo||'')?'Proponer día y hora':'Proponer una visita'):sv('video','white',15)+'Invitar a entrevista')+'</button></div>';

    m.innerHTML = '<div style="background:white;border-radius:18px;max-width:520px;width:100%;max-height:calc(100dvh - 32px);overflow-y:auto;box-shadow:0 24px 60px rgba(0,0,0,.25);">'
      + '<div style="padding:20px 20px 0;display:flex;gap:14px;align-items:flex-start;">'
      +   (c.foto ? '<img src="'+e(c.foto)+'" alt="" style="width:54px;height:54px;border-radius:50%;object-fit:cover;flex-shrink:0;">'
                  : '<div style="width:54px;height:54px;border-radius:50%;background:'+(d?COL[d.dom]:'#EEF3FE')+';color:white;display:flex;align-items:center;justify-content:center;font-weight:800;font-size:18px;flex-shrink:0;">'+e(ini(c.nombre))+'</div>')
      +   '<div style="flex:1;min-width:0;"><div style="font-size:19px;font-weight:800;color:#111827;">'+e(c.nombre)+'</div>'
      +   '<div style="font-size:13.5px;color:#4B5563;margin-top:2px;">'+e([c.profesion, c.ciudad].filter(Boolean).join(' · '))+'</div>'
      +   (window._geoLinea ? _geoLinea(c, true) : '')
      +   (window._extraFicha ? _extraFicha(c) : '')
      +   '<div style="font-size:12px;color:#6B7280;margin-top:4px;">'+(esVisita(c)?'Quiere conocer la clínica antes de solicitar':'Solicita')+' <b style="color:#6B7280;">'+e(c.ofertaTitulo||'')+'</b> · '+e(hace(c.fecha))+'</div>'
      +   (esVisita(c) ? '<div style="display:inline-block;margin-top:8px;background:#F3EEFA;color:#66328A;border-radius:8px;padding:5px 10px;font-size:12px;font-weight:700;">Prefiere: '+e(c.modo||'visita presencial')+'</div>' : '')
      +   '</div>'
      +   '<button onclick="cerrarFichaCandidato()" aria-label="Cerrar" style="background:none;border:none;cursor:pointer;padding:4px;color:#6B7280;">'+sv('x','#9CA3AF',20)+'</button></div>'
      + '<div style="padding:4px 20px 20px;">'
      +   (c.video ? '<div id="ficha-video" data-w="'+e(c.video.w||'')+'" data-h="'+e(c.video.h||'')+'" style="margin:14px 0 4px;aspect-ratio:16/9;border-radius:14px;overflow:hidden;background:'+(c.video.poster ? 'linear-gradient(rgba(15,28,63,.35),rgba(15,28,63,.6)), url(\''+e(c.video.poster)+'\') center/cover' : 'linear-gradient(135deg,#0F1C3F,#1A3A6B)')+';display:flex;align-items:center;justify-content:center;">'
              + '<button type="button" onclick="verVideoCandidato(\''+e(c.id)+'\')" style="background:none;border:none;color:white;cursor:pointer;display:flex;flex-direction:column;align-items:center;gap:10px;font-size:14px;font-weight:700;font-family:inherit;">'
              + '<span style="width:58px;height:58px;border-radius:50%;background:rgba(255,255,255,.16);display:flex;align-items:center;justify-content:center;">'+sv('play','white',22)+'</span>'
              + 'Ver su vídeo de presentación'+(c.video.dur ? ' ('+Math.floor(c.video.dur/60)+':'+String(c.video.dur%60).padStart(2,'0')+')' : '')+'</button></div>' : '')
      +   contacto
      +   (c.mensaje ? '<div style="background:#F4F7FE;border-radius:12px;padding:12px 14px;margin:12px 0;font-size:13.5px;color:#1E3A8A;line-height:1.6;white-space:pre-line;"><b>Su mensaje:</b>\n'+e(c.mensaje)+'</div>' : '')
      +   (d ? '<div style="border:1px solid #EAECF0;border-radius:14px;padding:14px;margin:12px 0;">'
            + '<div style="display:flex;justify-content:space-between;align-items:center;gap:10px;margin-bottom:10px;"><div style="font-size:14px;font-weight:800;color:#111827;">'+NOM[d.dom]+' con rasgo '+NOM[d.sec].toLowerCase()+'</div>'
            + (p!==null ? '<div style="font-size:18px;font-weight:800;color:'+(p>=80?'#0E9F6E':(p>=65?'#1A56DB':'#6B7280'))+';white-space:nowrap;">'+p+'% <span style="font-size:11px;color:#6B7280;font-weight:600;">encaje</span></div>' : '')+'</div>'
            + barras
            + (porque ? '<div style="font-size:12.5px;color:#4B5563;line-height:1.6;margin-top:8px;">'+porque+'</div>' : '')
            + '<div style="font-size:11px;color:#6B7280;margin-top:8px;">Es orientativo. Haz la entrevista igualmente.</div>' + (c.disc && c.disc.definido === false ? '<div style="font-size:12px;color:#7A5200;background:#FFFBEB;border-radius:8px;padding:8px 10px;margin-top:8px;line-height:1.5;">Resultado poco definido: dio notas muy parecidas a casi todo. Tómalo con más cautela y coméntalo en la entrevista.</div>' : '')
            + (window._discHistFicha ? _discHistFicha(c) : '') + '</div>' : '')
      +   '<div style="display:flex;justify-content:space-between;align-items:center;gap:10px;margin:16px 0 4px;"><div style="font-size:13px;font-weight:800;color:#374151;">CV resumido</div>'
      +   (c.cv ? '<span style="display:inline-flex;gap:6px;flex-wrap:wrap;"><button type="button" id="ficha-cv-ver" onclick="verCVCandidato(\''+e(c.id)+'\')" style="background:#1A56DB;border:1px solid #1A56DB;border-radius:9px;padding:7px 12px;font-size:12.5px;font-weight:700;color:#fff;cursor:pointer;font-family:inherit;display:inline-flex;align-items:center;gap:6px;">'+sv('file','#fff',14)+'Ver CV completo</button><button type="button" id="ficha-cv" onclick="descargarCVCandidato(\''+e(c.id)+'\')" aria-label="Descargar el CV completo" style="background:white;border:1px solid #E5E7EB;border-radius:9px;padding:7px 12px;font-size:12.5px;font-weight:700;color:#1A56DB;cursor:pointer;font-family:inherit;display:inline-flex;align-items:center;gap:6px;">Descargar</button></span>' : '')
      +   '</div>'
      +   fila('Experiencia', c.experiencia) + (c.sinExperiencia && !(c.trabajos||[]).length ? fila('En clínicas', 'Todavía no ha trabajado en una clínica') : '') + fila('Titulación', c.titulacion) + fila('Jornada', c.jornada) + fila('Incorporación', c.disponibilidad)
      +   fila('Puntos fuertes', (c.fuertes||[]).join(', ')) + fila('Colegiación', c.colegiado ? 'Nº ' + c.colegiado + (c.colegio ? ' · ' + c.colegio : '') : '') + fila('Teléfono', c.estado!=='retirada'?c.telefono:'') + fila('Correo', c.estado!=='retirada'?c.email:'')
      +   (c.resumen ? '<div style="font-size:13.5px;color:#374151;line-height:1.6;padding:10px 0;border-top:1px solid #F3F4F6;white-space:pre-line;">'+e(c.resumen)+'</div>' : '')
      +   ((c.trabajos||[]).length ? '<div style="font-size:13px;font-weight:800;color:#374151;margin:14px 0 4px;">Dónde ha trabajado</div>' + c.trabajos.map(function(t){ return '<div style="display:flex;gap:10px;padding:7px 0;border-top:1px solid #F3F4F6;">'+sv('brief','#9CA3AF',15)+'<div><div style="font-size:13.5px;font-weight:700;color:#111827;">'+e(t.puesto||'')+'</div><div style="font-size:12.5px;color:#6B7280;">'+e([t.centro,t.tiempo].filter(Boolean).join(' · '))+'</div></div></div>'; }).join('') : '')
      +   (window._pieFicha ? _pieFicha(c) : '')
      +   '<div id="cand-acciones" style="margin-top:18px;">'+acciones+'</div>'
      + '</div></div>';
    document.body.appendChild(m);
    document.body.style.overflow = 'hidden';
  };

  /* ---------- vídeo y CV del candidato ---------- */
  function leerMedia(uid, tipo, meta){
    var col = Nube.db().collection('candidatos').doc(uid).collection('media'), ps = [];
    for(var k=0;k<meta.n;k++) ps.push(col.doc(tipo + '_' + k).get());
    return Promise.all(ps).then(function(docs){
      var b64 = docs.map(function(d){ if(!d.exists) throw 'falta'; return d.data().d; }).join('');
      var bin = atob(b64), arr = new Uint8Array(bin.length);
      for(var j=0;j<bin.length;j++) arr[j] = bin.charCodeAt(j);
      return new Blob([arr], {type: meta.mime});
    });
  }
  // Si el candidato ha cambiado el vídeo después de escribirte, vemos el de ahora
  function metaActual(c, tipo){
    return Nube.db().collection('candidatos').doc(c.candidatoUid).get()
      .then(function(d){ var m = d.exists && d.data()[tipo]; return m || c[tipo]; })
      .catch(function(){ return c[tipo]; });
  }
  var _urls = {};
  function urlDe(c, tipo){
    var k = c.candidatoUid + '_' + tipo;
    if(_urls[k]) return Promise.resolve(_urls[k]);
    return metaActual(c, tipo).then(function(meta){
      if(!meta) throw 'sin';
      return leerMedia(c.candidatoUid, tipo, meta);
    }).then(function(b){ _urls[k] = URL.createObjectURL(b); return _urls[k]; });
  }
  window.verVideoCandidato = function(id){
    var c = buscar(id), box = document.getElementById('ficha-video'); if(!c || !box) return;
    box.innerHTML = '<div style="color:rgba(255,255,255,.8);font-size:13px;">Cargando vídeo…</div>';
    urlDe(c, 'video').then(function(u){
      box.innerHTML = '<video src="'+u+'" controls playsinline autoplay style="width:100%;height:100%;display:block;background:black;"></video>';
      // si el candidato recortó su vídeo, se ve solo ese trozo
      metaActual(c, 'video').then(function(m){
        var v = box.querySelector('video'); if(!v || !m || !(m.ini || m.fin)) return;
        var ini = m.ini || 0, fin = m.fin || 0;
        var ir = function(){ try{ v.currentTime = ini; }catch(x){} };
        if(v.readyState >= 1) ir(); else v.addEventListener('loadedmetadata', ir);
        v.addEventListener('timeupdate', function(){ if(fin && v.currentTime >= fin){ v.pause(); ir(); } else if(v.currentTime < ini - 0.3) ir(); });
      });
    }).catch(function(){ box.innerHTML = '<div style="color:rgba(255,255,255,.8);font-size:13px;padding:0 20px;text-align:center;">No se ha podido cargar el vídeo. Revisa tu conexión y vuelve a abrir la ficha.</div>'; });
  };
  /* ver el CV sin descargarlo: cada página se pinta aquí con PDF.js (también en el móvil) */
  var _pdfjsCl = null;
  function pdfjsCl(){
    if(window.pdfjsLib) return Promise.resolve(window.pdfjsLib);
    if(_pdfjsCl) return _pdfjsCl;
    _pdfjsCl = new Promise(function(res, rej){ var sc = document.createElement('script'); sc.src = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.min.js';
      sc.onload = function(){ try{ pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js'; res(pdfjsLib); }catch(x){ rej(x); } };
      sc.onerror = function(){ _pdfjsCl = null; rej('pdfjs'); }; document.head.appendChild(sc); });
    return _pdfjsCl;
  }
  window.verCVCandidato = function(id){
    var c = buscar(id); if(!c) return;
    var nombre = 'CV ' + (c.nombre || 'candidato') + '.pdf';
    var m = document.createElement('div'); m.id = 'cv-visor';
    m.style.cssText = 'position:fixed;inset:0;z-index:9900;background:rgba(10,14,30,.6);display:flex;justify-content:center;';
    m.innerHTML = '<div role="dialog" aria-modal="true" aria-label="'+e(nombre)+'" style="background:#F3F4F6;width:100%;max-width:900px;height:100%;display:flex;flex-direction:column;">'
      + '<div style="display:flex;align-items:center;gap:10px;padding:10px 12px 10px 16px;background:#fff;border-bottom:1px solid #EAECF0;">'+sv('file','#1A56DB',18)+'<b style="flex:1;min-width:0;font-size:14.5px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;">'+e(nombre)+'</b>'
      + '<button type="button" onclick="descargarCVCandidato(\''+e(c.id)+'\')" style="background:#fff;border:1px solid #E5E7EB;border-radius:9px;padding:8px 12px;font:inherit;font-size:13px;font-weight:700;color:#1A56DB;cursor:pointer;">Descargar</button>'
      + '<button type="button" id="cv-x" aria-label="Cerrar" style="width:44px;height:44px;border:0;background:none;border-radius:10px;cursor:pointer;font-size:22px;color:#374151;">×</button></div>'
      + '<div id="cv-pag" style="flex:1;overflow:auto;padding:12px;display:flex;flex-direction:column;align-items:center;gap:12px;"><div style="padding:40px;color:#6B7280;font-size:14px;">Abriendo el CV…</div></div></div>';
    document.body.appendChild(m);
    // Esc cierra solo el visor: se queda la tecla para que no cierre también la ficha que hay debajo
    var cerrar = function(){ m.remove(); document.removeEventListener('keydown', esc1, true); };
    var esc1 = function(ev){ if(ev.key === 'Escape'){ ev.stopPropagation(); cerrar(); } };
    document.addEventListener('keydown', esc1, true);
    document.getElementById('cv-x').onclick = cerrar; m.onclick = function(ev){ if(ev.target === m) cerrar(); };
    var box = document.getElementById('cv-pag');
    urlDe(c, 'cv').then(function(u){
      return pdfjsCl().then(function(lib){ return lib.getDocument(u).promise; }).then(function(pdf){
        box.innerHTML = ''; var ancho = Math.min(box.clientWidth - 24, 820), dpr = Math.min(window.devicePixelRatio || 1, 2), cad = Promise.resolve();
        for(var i = 1; i <= pdf.numPages; i++) (function(n){ cad = cad.then(function(){ return pdf.getPage(n); }).then(function(pg){
          var vp = pg.getViewport({scale: ancho / pg.getViewport({scale:1}).width * dpr}), cv = document.createElement('canvas');
          cv.width = vp.width; cv.height = vp.height; cv.style.cssText = 'width:'+Math.round(vp.width/dpr)+'px;max-width:100%;height:auto;background:#fff;border-radius:4px;box-shadow:0 2px 10px rgba(0,0,0,.12);';
          box.appendChild(cv); return pg.render({canvasContext:cv.getContext('2d'), viewport:vp}).promise; }); })(i);
        return cad;
      }).catch(function(){ box.innerHTML = '<iframe src="'+u+'#view=FitH" title="'+e(nombre)+'" style="width:100%;flex:1;min-height:75vh;border:0;background:#fff;"></iframe>'; });
    }).catch(function(){ box.innerHTML = '<div style="padding:40px;color:#B42318;font-size:14px;">No se ha podido abrir el CV.</div>'; });
  };
  window.descargarCVCandidato = function(id){
    var c = buscar(id), b = document.getElementById('ficha-cv'); if(!c) return;
    if(b){ b.disabled = true; b.dataset.t = b.innerHTML; b.textContent = 'Preparando…'; }
    urlDe(c, 'cv').then(function(u){
      var a = document.createElement('a'); a.href = u; a.target = '_blank'; a.rel = 'noopener';
      a.download = 'CV ' + (c.nombre || 'candidato') + '.pdf';
      document.body.appendChild(a); a.click(); a.remove();
    }).catch(function(){ if(typeof showToast === 'function') showToast('No se ha podido descargar el CV.'); })
    .then(function(){ if(b){ b.disabled = false; b.innerHTML = b.dataset.t; } });
  };

  window.responderCandidato = function(id, estado){
    var c = buscar(id); if(!c) return;
    var box = document.getElementById('cand-acciones'); if(!box) return;
    var nom = String(c.nombre||'').trim().split(/\s+/)[0] || '';
    var clinica = ''; try{ clinica = CDB.nombreClinica(); }catch(x){}
    var dir = ''; try{ var cc = CDB.clinica(); dir = cc.adreca || cc.direccion || cc.ciutat || ''; }catch(x){}
    var txt = esVisita(c)
      ? (estado === 'entrevista'
          ? (/llamada/i.test(c.modo||'')
              ? 'Hola ' + nom + ', encantados de que quieras conocernos. ¿Te va bien que ' + (/video/i.test(c.modo||'') ? 'hagamos una videollamada' : 'te llamemos') + ' el jueves a las 17:00? Si no te va bien, dinos qué día prefieres.'
              : 'Hola ' + nom + ', encantados de que quieras conocernos. ¿Te iría bien pasarte el jueves a las 17:00' + (dir ? ' por ' + dir : '') + '? Si no te va bien, dinos qué día prefieres.')
          : 'Hola ' + nom + ', gracias por tu interés. Ahora mismo no podemos recibirte, pero puedes solicitar la oferta directamente y la revisaremos.')
      : (estado === 'entrevista'
          ? 'Hola ' + nom + ', gracias por tu solicitud para ' + (c.ofertaTitulo||'el puesto') + '. Nos gustaría conocerte. ¿Te iría bien una videollamada esta semana? Dinos qué días y horas te vienen mejor.'
          : 'Hola ' + nom + ', gracias por tu interés en ' + (c.ofertaTitulo||'el puesto') + '. En esta ocasión hemos seguido con otro perfil. Te deseamos mucha suerte.');
    box.innerHTML = '<div style="font-size:13px;font-weight:800;color:#374151;margin-bottom:6px;">'+(estado==='entrevista'?(esVisita(c)?'Propuesta de visita':'Mensaje de invitación'):'Mensaje para '+e(nom))+'</div>'
      + '<div style="font-size:12px;color:#6B7280;line-height:1.5;margin-bottom:8px;">'+(estado==='entrevista'?'Le llegará en CERCO al momento. Puedes cambiarlo.':'Nadie se queda sin respuesta: le llegará este mensaje en CERCO. Puedes cambiarlo.'+(esVisita(c) ? '' : ' Si lo tiene activado, CERCO le presentará a otra clínica a la que le falte su perfil (efecto rebote).'))+'</div>'
      + '<textarea id="cand-nota" maxlength="800" style="width:100%;box-sizing:border-box;min-height:110px;border:1px solid #E5E7EB;border-radius:10px;padding:11px 13px;font-size:14px;font-family:inherit;line-height:1.5;color:#111827;resize:vertical;">'+e(txt)+'</textarea>'
      + '<div id="cand-err" style="font-size:12.5px;color:#DC2626;margin:6px 0;"></div>'
      + '<div style="display:flex;gap:8px;">'
      + '<button onclick="abrirFichaCandidato(\''+e(id)+'\',\'ver\')" style="flex:1;background:white;color:#374151;border:1px solid #E5E7EB;border-radius:10px;padding:12px;font-size:13.5px;font-weight:700;cursor:pointer;font-family:inherit;">Cancelar</button>'
      + '<button id="cand-ok" onclick="confirmarRespuesta(\''+e(id)+'\',\''+estado+'\')" style="flex:2;background:'+(estado==='entrevista'?(esVisita(c)?'#66328A':'#1A56DB'):'#374151')+';color:white;border:none;border-radius:10px;padding:12px;font-size:13.5px;font-weight:800;cursor:pointer;font-family:inherit;">'+(estado==='entrevista'?(esVisita(c)?'Enviar propuesta':'Enviar invitación'):(esVisita(c)?'Enviar respuesta':'Enviar y descartar'))+'</button></div>';
    try{ document.getElementById('cand-nota').focus({preventScroll:true}); }catch(x){}
    try{ box.scrollIntoView({behavior:'smooth', block:'nearest'}); }catch(x){}
  };

  window.confirmarRespuesta = function(id, estado){
    var c = buscar(id); if(!c) return;
    if(!window._unaSolaVez('respCand', 1500)) return;
    var nota = ((document.getElementById('cand-nota')||{}).value || '').trim();
    var b = document.getElementById('cand-ok'); if(b){ b.disabled = true; b.textContent = 'Enviando…'; }
    Nube.actualizarCandidatura(c, estado, nota).then(function(cambio){
      var l = lista(); l.forEach(function(x){ if(x.id === c.id) Object.assign(x, cambio); }); guardarLista(l);
      try{ CDB.renderTodo(); }catch(x){}
      if(typeof showToast === 'function') showToast(estado === 'entrevista' ? ((esVisita(c)?'Visita propuesta a ':'Invitación enviada a ') + (c.nombre||'')) : 'Respuesta enviada');
      abrirFichaCandidato(id, 'ver');
      // Para quedar el día, WhatsApp va más rápido: se lo ponemos a mano
      if(estado === 'entrevista' && c.telefono){
        var box = document.getElementById('cand-acciones');
        if(box) box.insertAdjacentHTML('beforeend', '<a href="https://wa.me/'+waNum(c.telefono)+'?text='+encodeURIComponent(nota)+'" target="_blank" rel="noopener" style="margin-top:10px;display:flex;align-items:center;justify-content:center;gap:7px;border:1px solid #BFE9D7;background:#F3FBF7;color:#0B5B43;border-radius:10px;padding:11px;font-size:13.5px;font-weight:800;text-decoration:none;">'+sv('msg','#0B5B43',15)+'Enviarle también por WhatsApp</a>');
      }
    }).catch(function(){
      if(b){ b.disabled = false; b.textContent = 'Volver a enviar'; }
      var er = document.getElementById('cand-err'); if(er) er.textContent = 'No se ha podido enviar. Revisa tu conexión y vuelve a pulsar.';
    });
  };
  document.addEventListener('keydown', function(ev){ if(ev.key === 'Escape') cerrar(); });

  // Si la sesión ya estaba activa cuando se cargó este bloque
  try{ if(Nube.activa) window._escucharCandidaturas(); }catch(x){}
  try{ CDB.renderTodo(); }catch(x){}
})();
