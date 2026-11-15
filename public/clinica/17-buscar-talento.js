/* ================================================================
   CERCO · BUSCAR TALENTO (lado clínica)
   Una pantalla propia, debajo de «Candidatos». Enseña a todos los
   profesionales de España que han elegido «Visible» o «Anónimo»:
     - de 20 en 20 (con «Ver más» y al llegar abajo), nunca todos de
       golpe: así la pantalla va rápida y no gasta lecturas de más;
     - ordenados por encaje (con la oferta elegida o con el perfil
       que le falta al equipo) y luego por cercanía;
     - con filtros de profesión, kilómetros y forma de trabajar.
   «Visible»: nombre de pila, inicial del apellido y foto pequeña.
   «Anónimo»: ni nombre ni foto. El nombre completo, el contacto y el
   CV solo se ven cuando la persona acepta la invitación.
   ================================================================ */
(function(){
  var e = function(t){ return _esc(t); };
  var IC = {
    search:'<circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/>',
    send:'<path d="M14.536 21.686a.5.5 0 0 0 .937-.024l6.5-19a.496.496 0 0 0-.635-.635l-19 6.5a.5.5 0 0 0-.024.937l7.93 3.18a2 2 0 0 1 1.112 1.11z"/><path d="m21.854 2.147-10.94 10.939"/>',
    check:'<path d="M20 6 9 17l-5-5"/>',
    pin:'<path d="M20 10c0 4.993-5.539 10.193-7.399 11.799a1 1 0 0 1-1.202 0C9.539 20.193 4 14.993 4 10a8 8 0 0 1 16 0"/><circle cx="12" cy="10" r="3"/>',
    video:'<path d="m16 13 5.223 3.482a.5.5 0 0 0 .777-.416V7.87a.5.5 0 0 0-.752-.432L16 10.5"/><rect x="2" y="6" width="14" height="12" rx="2"/>',
    left:'<path d="m15 18-6-6 6-6"/>'
  };
  function sv(k, c, s){ return _svg(IC[k] || '', c, s); }
  var COL = {D:'#FF5A5F', I:'#F0A800', S:'#00B488', C:'#5B5FE0'};
  var NOM = {D:'Dominante', I:'Influyente', S:'Estable', C:'Concienzudo'};
  var POR_PAGINA = 20;
  var PROFESIONES = ['Higienista dental', 'Auxiliar de clínica dental', 'Odontólogo/a', 'Ortodoncista',
    'Protésico/a dental', 'Recepción y atención al paciente', 'Coordinación o gerencia de clínica', 'Otra'];
  var KMS = [['10','10 km'], ['25','25 km'], ['50','50 km'], ['100','100 km'], ['prov','Mi provincia'], ['', 'Toda España']];

  var B = { l:[], vistos:{}, cursor:null, fin:false, cargando:false, prof:'', km:'', disc:'', oferta:'', error:false };
  function db(){ try{ return Nube.db(); }catch(x){ return null; } }
  function uid(){ return (window.Nube && Nube.uid) || null; }
  function enDemo(){ try{ return CDB.demo(); }catch(x){ return true; } }
  function origen(){ try{ return window.CERCO_origenClinica ? CERCO_origenClinica() : null; }catch(x){ return null; } }
  function ofertas(){ try{ return window.CERCO_ofertasActivas ? CERCO_ofertasActivas() : []; }catch(x){ return []; } }
  function ofertaElegida(){ var l = ofertas(); return l.filter(function(o){ return String(o.id) === String(B.oferta); })[0] || l[0] || null; }
  function yaSolicitaron(){
    var m = {}; try{ (CERCO_candidaturas() || []).forEach(function(c){ if(c.candidatoUid) m[c.candidatoUid] = 1; }); }catch(x){}
    return m;
  }
  // La persona que está en la lista, para la ventana de invitar (clinica/06-lideres.js)
  window.CERCO_talentoDe = function(tuid){ return B.l.filter(function(t){ return t.uid === tuid; })[0] || null; };

  /* ---------- traer una página de 20 ---------- */
  function cargarPagina(){
    if(B.cargando || B.fin || !db() || !uid()) return Promise.resolve();
    B.cargando = true; B.error = false; pintar();
    var q = db().collection('talento');
    if(B.prof) q = q.where('profesion', '==', B.prof);
    q = q.limit(POR_PAGINA);
    if(B.cursor) q = q.startAfter(B.cursor);
    return q.get().then(function(s){
      s.forEach(function(d){
        if(B.vistos[d.id]) return;
        B.vistos[d.id] = 1;
        var x = d.data(); x.uid = d.id; B.l.push(x);
      });
      B.cursor = s.docs.length ? s.docs[s.docs.length - 1] : B.cursor;
      if(s.docs.length < POR_PAGINA) B.fin = true;
      B.cargando = false; pintar();
    }).catch(function(){ B.cargando = false; B.error = true; pintar(); });
  }
  function reiniciar(){
    B.l = []; B.vistos = {}; B.cursor = null; B.fin = false; B.error = false;
    pintar(); cargarPagina();
  }

  /* ---------- filtrar y ordenar lo que ya está cargado ---------- */
  function lista(){
    var org = origen(), o = ofertaElegida(), ya = yaSolicitaron(), mi = uid();
    var falta = null; try{ var d = CDB.perfilQueFalta(); if(d && d.fiable) falta = d.falta; }catch(x){}
    return B.l.filter(function(t){
      if(t.uid === mi || ya[t.uid]) return false;
      if((t.ocultar || []).indexOf(mi) > -1) return false;          // se ha ocultado a esta clínica
      if(B.disc && !(t.disc && t.disc.dom === B.disc)) return false;
      if(B.km){
        if(!t.geo || !window.CGeo) return false;
        if(B.km === 'prov'){ if(!org || t.geo.prov !== org.prov) return false; }
        else if(!org || CGeo.km(org, t.geo) > parseInt(B.km, 10)) return false;
      }
      return true;
    }).map(function(t){
      var p = o && window.CERCO_encajeTalento ? CERCO_encajeTalento(t, o) : null;
      var km = org && t.geo && window.CGeo ? CGeo.km(org, t.geo) : null;
      return { t:t, p:p, km:km, falta: !!(falta && t.disc && t.disc.dom === falta) };
    }).sort(function(a, b){
      // primero el encaje, y a igualdad de encaje, quien esté más cerca
      var ea = (a.p === null ? 0 : a.p) + (a.falta ? 15 : 0), eb = (b.p === null ? 0 : b.p) + (b.falta ? 15 : 0);
      if(eb !== ea) return eb - ea;
      if(a.km === null) return 1;
      if(b.km === null) return -1;
      return a.km - b.km;
    });
  }

  /* ---------- pintar ---------- */
  function chip(txt, on, accion){
    return '<button type="button" class="bt-chip'+(on ? ' on' : '')+'" aria-pressed="'+on+'" onclick="'+accion+'">'+e(txt)+'</button>';
  }
  function filtros(){
    var ofs = ofertas(), o = ofertaElegida();
    var h = '<div class="bt-filtros">';
    if(ofs.length > 1){
      h += '<div class="bt-f"><span class="bt-f-t">Para la oferta</span><div class="bt-chips">'
        + ofs.map(function(x){ return chip(x.titulo, o && String(o.id) === String(x.id), "btFiltro('oferta','"+e(x.id)+"')"); }).join('')
        + '</div></div>';
    }
    h += '<div class="bt-f"><span class="bt-f-t">Profesión</span><div class="bt-chips">'
      + chip('Todas', !B.prof, "btFiltro('prof','')")
      + PROFESIONES.map(function(p){ return chip(p, B.prof === p, "btFiltro('prof','"+e(p)+"')"); }).join('')
      + '</div></div>';
    h += '<div class="bt-f"><span class="bt-f-t">Distancia</span><div class="bt-chips">'
      + KMS.map(function(k){ return chip(k[1], B.km === k[0], "btFiltro('km','"+k[0]+"')"); }).join('')
      + '</div></div>';
    h += '<div class="bt-f"><span class="bt-f-t">Forma de trabajar</span><div class="bt-chips">'
      + chip('Todas', !B.disc, "btFiltro('disc','')")
      + ['D','I','S','C'].map(function(l){ return chip(NOM[l], B.disc === l, "btFiltro('disc','"+l+"')"); }).join('')
      + '</div></div>';
    return h + '</div>';
  }
  function tarjeta(x){
    var t = x.t, d = t.disc || {}, visible = t.modo === 'visible';
    var inv = window.CERCO_invitacionDe ? CERCO_invitacionDe(t.uid, ofertaElegida()) : null;
    var est = '';
    if(inv) est = inv.estado === 'aceptada' ? '<span class="bt-pill bt-ok">'+sv('check','#0B5B43',12)+'Ha solicitado</span>'
      : (inv.estado === 'rechazada' ? '<span class="bt-pill">Esta vez no le interesa</span>'
      : '<span class="bt-pill bt-inv">'+sv('send','#1A56DB',12)+'Invitación enviada</span>');
    var av = visible && t.fotoMini
      ? '<img class="bt-av" src="'+e(t.fotoMini)+'" alt="">'
      : '<span class="bt-av bt-av-l" style="background:'+(d.dom ? COL[d.dom] : '#9CA3AF')+';">'+e(visible ? (t.nombre || '?').charAt(0) : (d.dom || '?'))+'</span>';
    var titulo = visible
      ? e((t.nombre || '') + (t.inicial ? ' ' + t.inicial + '.' : ''))
      : e(t.profesion || 'Profesional');
    var sub = visible
      ? e(t.profesion || '') + (t.experiencia ? ' · ' + e(t.experiencia) : '')
      : e(t.experiencia || '');
    var linea2 = [
      d.dom ? NOM[d.dom] + (d.sec ? ' con rasgo ' + NOM[d.sec].toLowerCase() : '') : '',
      t.geo ? (x.km !== null ? 'a ' + x.km + ' km' : t.geo.n) : ''
    ].filter(Boolean).map(e).join(' · ');
    var linea3 = [t.jornada ? 'Jornada ' + String(t.jornada).toLowerCase() : '',
      t.disponibilidad ? 'Empieza: ' + String(t.disponibilidad).toLowerCase() : '',
      t.video ? 'con vídeo' : '', t.colegiado ? 'colegiado/a' : ''].filter(Boolean).map(e).join(' · ');
    return '<div class="bt-card">'
      + av
      + '<div class="bt-txt">'
      +   '<div class="bt-n">'+titulo+(visible ? '' : ' <span class="bt-anon">Anónimo</span>')+'</div>'
      +   (sub ? '<div class="bt-s">'+sub+'</div>' : '')
      +   (linea2 ? '<div class="bt-s2">'+linea2+'</div>' : '')
      +   (linea3 ? '<div class="bt-s3">'+linea3+'</div>' : '')
      +   (x.falta ? '<div class="bt-falta"><b>Es el perfil que más le falta a tu equipo.</b></div>' : '')
      +   (est ? '<div style="margin-top:6px;">'+est+'</div>' : '')
      + '</div>'
      + '<div class="bt-der">'
      +   (x.p !== null ? '<div class="bt-pct" style="color:'+(x.p >= 80 ? '#0E9F6E' : (x.p >= 65 ? '#1A56DB' : '#6B7280'))+';">'+x.p+' %</div><div class="bt-pct-l">encaje</div>' : '')
      +   (inv ? '' : '<button type="button" class="bt-inv-b" onclick="abrirInvitar(\'' + e(t.uid) + '\')">'+sv('send','#fff',14)+'Invitar</button>')
      + '</div></div>';
  }
  function pintar(){
    var box = document.getElementById('buscar-box'); if(!box) return;
    if(enDemo() || !uid()){
      box.innerHTML = '<div class="bt-vacio">Esta pantalla usa tus datos reales. Sal de «Datos de ejemplo» para buscar profesionales.</div>';
      return;
    }
    var l = lista();
    var inv = window.CERCO_invitacionesSemana ? CERCO_invitacionesSemana() : {usadas:0, max:10};
    var quedan = Math.max(0, inv.max - inv.usadas);
    var h = '<div class="bt-top">'
      + '<div><h1 class="bt-h1">'+sv('search','#1A56DB',20)+'Buscar talento</h1>'
      + '<p class="bt-p">Profesionales de toda España que han elegido que las clínicas puedan encontrarles. El nombre completo, el teléfono, el correo y el CV los verás cuando acepten tu invitación.</p></div>'
      + '<span class="bt-cuota" style="color:'+(quedan > 0 ? '#1A56DB' : '#B42318')+';background:'+(quedan > 0 ? '#EEF3FE' : '#FEF2F2')+';">'+quedan+' de '+inv.max+' invitaciones esta semana</span>'
      + '</div>' + filtros();
    h += '<div class="bt-n-res">' + (l.length ? l.length + ' profesional' + (l.length === 1 ? '' : 'es') : '') + '</div>';
    if(B.error) h += '<div class="bt-vacio">No hemos podido cargar la lista. Revisa tu conexión y vuelve a intentarlo.<div style="margin-top:10px;"><button type="button" class="bt-mas" onclick="btVerMas()">Volver a intentarlo</button></div></div>';
    else if(!l.length && B.cargando) h += '<div class="bt-vacio">Buscando…</div>';
    else if(!l.length) h += '<div class="bt-vacio">' + (B.fin
        ? 'Nadie encaja con estos filtros. Prueba a ampliar la distancia o a quitar alguno.'
        : 'Nadie de los cargados encaja con estos filtros. Pulsa «Ver más» para seguir buscando.') + '</div>';
    else {
      var conVideo = l.filter(function(x){ return x.t.videoMeta && x.t.videoMeta.n; });
      if(conVideo.length) h += '<div class="bt-vid-w"><button type="button" class="bt-vid-b" id="bt-videos" onclick="btVideos()">'
        + sv('video','#fff',16) + 'Verlos en vídeo <span class="bt-vid-n">'+conVideo.length+'</span></button>'
        + '<span class="bt-vid-h">Uno detrás de otro, a pantalla completa. Puedes invitar sin salir.</span></div>';
      h += '<div class="bt-lista">' + l.map(tarjeta).join('') + '</div>';
    }
    if(!B.fin) h += '<div class="bt-mas-w"><button type="button" class="bt-mas" id="bt-mas" onclick="btVerMas()"'+(B.cargando ? ' disabled' : '')+'>'+(B.cargando ? 'Cargando…' : 'Ver más')+'</button></div>';
    else if(l.length) h += '<div class="bt-fin">No hay más profesionales que encajen.</div>';
    box.innerHTML = h;
    vigilarFinal();
  }
  window.btFiltro = function(cual, valor){
    if(B[cual] === valor) return;
    B[cual] = valor;
    if(cual === 'prof') reiniciar(); else pintar();   // la profesión se pide a la base de datos; el resto se filtra aquí
  };
  window.btVerMas = function(){ cargarPagina(); };

  // Al llegar al final de la lista, se traen 20 más sin tener que pulsar
  var _ojo = null;
  function vigilarFinal(){
    if(_ojo){ _ojo.disconnect(); _ojo = null; }
    var b = document.getElementById('bt-mas'); if(!b || !window.IntersectionObserver) return;
    _ojo = new IntersectionObserver(function(ents){
      if(ents.some(function(x){ return x.isIntersecting; })) cargarPagina();
    }, { rootMargin: '300px' });
    _ojo.observe(b);
  }

  /* ---------- verlos en vídeo, uno detrás de otro ---------- */
  var V = { l:[], i:0, url:null, cache:{} };
  // Monta el vídeo a partir de sus trozos. La clínica puede leer el vídeo de
  // quien está en «Buscar talento», nunca su CV (lo dicen las reglas).
  function traerVideo(t){
    var m = t.videoMeta || {}, clave = t.uid + '_' + (m.v || 0);
    if(V.cache[clave]) return Promise.resolve(V.cache[clave]);
    var col = db().collection('candidatos').doc(t.uid).collection('media'), ps = [];
    for(var k = 0; k < m.n; k++) ps.push(col.doc('video_' + k).get());
    return Promise.all(ps).then(function(docs){
      var b64 = docs.map(function(d){ if(!d.exists) throw 'falta'; return d.data().d; }).join('');
      var bin = atob(b64), arr = new Uint8Array(bin.length);
      for(var j = 0; j < bin.length; j++) arr[j] = bin.charCodeAt(j);
      var u = URL.createObjectURL(new Blob([arr], {type: m.mime || 'video/webm'}));
      V.cache[clave] = u; return u;
    });
  }
  window.btVideos = function(){
    V.l = lista().filter(function(x){ return x.t.videoMeta && x.t.videoMeta.n; });
    if(!V.l.length) return;
    V.i = 0;
    var m = document.createElement('div'); m.id = 'bt-visor'; m.className = 'bt-visor';
    m.setAttribute('role', 'dialog'); m.setAttribute('aria-modal', 'true'); m.setAttribute('aria-label', 'Profesionales en vídeo');
    m.innerHTML = '<div class="bt-v-caja"><div class="bt-v-video" id="bt-v-video"></div><div class="bt-v-pie" id="bt-v-pie"></div></div>'
      + '<button type="button" class="bt-v-x" id="bt-v-x" aria-label="Cerrar" onclick="btVisorCerrar()">✕</button>';
    document.body.appendChild(m);
    document.body.style.overflow = 'hidden';
    document.addEventListener('keydown', teclas);
    pintarVisor();
  };
  function teclas(ev){
    if(ev.key === 'Escape') btVisorCerrar();
    else if(ev.key === 'ArrowRight' || ev.key === 'ArrowDown') btVisorMover(1);
    else if(ev.key === 'ArrowLeft' || ev.key === 'ArrowUp') btVisorMover(-1);
  }
  window.btVisorCerrar = function(){
    var m = document.getElementById('bt-visor'); if(m) m.remove();
    document.body.style.overflow = '';
    document.removeEventListener('keydown', teclas);
  };
  window.btVisorMover = function(d){
    var n = V.i + d; if(n < 0 || n >= V.l.length) return;
    V.i = n; pintarVisor();
  };
  function pintarVisor(){
    var caja = document.getElementById('bt-v-video'), pie = document.getElementById('bt-v-pie');
    if(!caja || !pie) return;
    var x = V.l[V.i], t = x.t, d = t.disc || {}, visible = t.modo === 'visible';
    var inv = window.CERCO_invitacionDe ? CERCO_invitacionDe(t.uid, ofertaElegida()) : null;
    var nombre = visible ? e((t.nombre || '') + (t.inicial ? ' ' + t.inicial + '.' : '')) : e(t.profesion || 'Profesional');
    caja.innerHTML = '<div class="bt-v-cargando">Cargando el vídeo…</div>';
    pie.innerHTML = '<div class="bt-v-datos">'
      + '<div class="bt-v-n">'+nombre+(visible ? '' : ' <span class="bt-anon">Anónimo</span>')+'</div>'
      + '<div class="bt-v-s">'+[visible ? e(t.profesion || '') : '', e(t.experiencia || ''),
          d.dom ? e(NOM[d.dom]) : '', x.km !== null ? 'a ' + x.km + ' km' : ''].filter(Boolean).join(' · ')+'</div>'
      + '</div>'
      + '<div class="bt-v-acc">'
      +   (inv ? '<span class="bt-pill bt-inv">'+sv('check','#1A56DB',12)+(inv.estado === 'aceptada' ? 'Ha solicitado' : 'Ya invitada')+'</span>'
               : '<button type="button" class="bt-inv-b" onclick="abrirInvitar(\''+e(t.uid)+'\')">'+sv('send','#fff',14)+'Invitar</button>')
      +   '<button type="button" class="bt-v-nav" onclick="btVisorMover(-1)"'+(V.i === 0 ? ' disabled' : '')+' aria-label="Anterior">'+sv('left','currentColor',16)+'</button>'
      +   '<button type="button" class="bt-v-nav" id="bt-v-sig" onclick="btVisorMover(1)"'+(V.i >= V.l.length - 1 ? ' disabled' : '')+'>Siguiente</button>'
      +   '<span class="bt-v-cuenta">'+(V.i + 1)+' de '+V.l.length+'</span>'
      + '</div>';
    var turno = V.i;
    traerVideo(t).then(function(u){
      if(turno !== V.i) return;                      // ya ha pasado al siguiente
      caja.innerHTML = '<video src="'+e(u)+'" controls autoplay playsinline></video>';
    }).catch(function(){
      if(turno !== V.i) return;
      caja.innerHTML = '<div class="bt-v-cargando">No hemos podido cargar este vídeo.</div>';
    });
    // se va adelantando el siguiente, para que no haya espera al pasar
    var sig = V.l[V.i + 1]; if(sig) traerVideo(sig.t).catch(function(){});
  }

  /* ---------- montar la pantalla y el menú ---------- */
  function montar(){
    menu();
    if(document.getElementById('screen-buscar')) return;
    var ref = document.getElementById('screen-equipo'); if(!ref || !ref.parentElement) return;
    var s = document.createElement('div'); s.id = 'screen-buscar'; s.className = 'app-screen';
    s.innerHTML = '<div class="wrap-buscar" id="buscar-box"></div>';
    ref.parentElement.insertBefore(s, ref);
    try{ if(window.MTAB_TITLES) MTAB_TITLES.buscar = 'Buscar talento'; }catch(x){}
  }
  /* El menú de la izquierda, con «Buscar talento» justo debajo de «Candidatos».
     Se vuelve a colocar cada vez, porque la Agenda también se añade ahí y
     según lo que tarde cada archivo en cargar podría quedar por delante. */
  function menu(){
    var it = document.querySelector('.shell-nav-item[data-screen="portal"]');
    if(!it || !it.parentElement) return;
    var n = document.querySelector('.shell-nav-item[data-screen="buscar"]');
    if(!n){
      n = it.cloneNode(true); n.dataset.screen = 'buscar'; n.classList.remove('active');
      var ic = n.querySelector('.shell-nav-icon'), lb = n.querySelector('.shell-nav-label');
      if(ic) ic.innerHTML = _svg(IC.search, 'currentColor', 17);
      if(lb) lb.textContent = 'Buscar talento';
      [].forEach.call(n.querySelectorAll('.shell-nav-badge,[class*="badge"],[class*="count"]'), function(x){ x.remove(); });
      n.addEventListener('click', function(){ showScreen('buscar'); });
    }
    if(it.nextSibling !== n) it.parentElement.insertBefore(n, it.nextSibling);
    // menú «Más» del móvil
    var ms = document.querySelector('#mobile-sheet .msheet-item');
    if(ms && !document.getElementById('msheet-buscar')){
      var m = ms.cloneNode(false); m.id = 'msheet-buscar'; m.setAttribute('onclick', "mobileGo('buscar')");
      m.innerHTML = '<span class="msheet-ico">'+_svg(IC.search, 'currentColor', 18)+'</span> Buscar talento';
      ms.parentElement.insertBefore(m, ms);
    }
  }
  // Al entrar en la pantalla. La usa showScreen (clinica/01i-navegacion.js)
  window.CERCO_buscarAlMostrar = function(){
    montar();
    // las invitaciones ya enviadas (para el contador y para no repetir)
    if(window.CERCO_cargarInvitaciones) CERCO_cargarInvitaciones();
    if(!B.l.length && !B.cargando && !B.fin) cargarPagina(); else pintar();
  };
  window.CERCO_buscarMontar = montar;
  window.CERCO_buscarPintar = pintar;

  /* ---------- estilos ---------- */
  var css = document.createElement('style');
  css.textContent = ''
    + '.wrap-buscar{max-width:1000px;margin:0 auto;padding:22px 20px 60px;}'
    + '.bt-top{display:flex;gap:14px;align-items:flex-start;justify-content:space-between;flex-wrap:wrap;margin-bottom:16px;}'
    + '.bt-h1{display:flex;align-items:center;gap:9px;font-size:22px;font-weight:800;color:#111827;margin:0;}'
    + '.bt-p{font-size:13px;color:#6B7280;line-height:1.55;margin:6px 0 0;max-width:620px;}'
    + '.bt-cuota{font-size:12px;font-weight:700;border-radius:99px;padding:6px 12px;white-space:nowrap;}'
    + '.bt-filtros{background:white;border:1px solid #EAECF0;border-radius:14px;padding:14px 16px;display:grid;gap:12px;}'
    + '.bt-f{display:flex;gap:10px;align-items:baseline;flex-wrap:wrap;}'
    + '.bt-f-t{font-size:12px;font-weight:800;color:#6B7280;letter-spacing:.3px;min-width:132px;}'
    + '.bt-chips{display:flex;gap:7px;flex-wrap:wrap;flex:1;}'
    + '.bt-chip{background:#F3F4F6;border:1px solid transparent;color:#374151;border-radius:99px;padding:6px 12px;font-size:12.5px;font-weight:700;cursor:pointer;font-family:inherit;}'
    + '.bt-chip.on{background:#1A56DB;color:white;}'
    + '.bt-chip:focus-visible{outline:2px solid #1A56DB;outline-offset:2px;}'
    + '.bt-n-res{font-size:12.5px;color:#6B7280;margin:14px 0 8px;}'
    + '.bt-lista{display:grid;gap:10px;}'
    + '.bt-card{background:white;border:1px solid #EAECF0;border-radius:14px;padding:14px 16px;display:flex;gap:14px;align-items:center;flex-wrap:wrap;}'
    + '.bt-av{width:46px;height:46px;border-radius:50%;object-fit:cover;flex-shrink:0;display:block;}'
    + '.bt-av-l{display:flex;align-items:center;justify-content:center;color:white;font-weight:800;font-size:17px;}'
    + '.bt-txt{flex:1;min-width:200px;}'
    + '.bt-n{font-size:15px;font-weight:800;color:#111827;display:flex;align-items:center;gap:8px;flex-wrap:wrap;}'
    + '.bt-anon{font-size:10.5px;font-weight:800;color:#6B7280;background:#F3F4F6;border-radius:99px;padding:2px 8px;letter-spacing:.3px;}'
    + '.bt-s{font-size:13px;color:#4B5563;margin-top:2px;}'
    + '.bt-s2{font-size:12.5px;color:#4B5563;margin-top:2px;}'
    + '.bt-s3{font-size:12px;color:#6B7280;margin-top:3px;}'
    + '.bt-falta{font-size:12px;color:#0B6B4F;background:#E8F8F1;border-radius:8px;padding:5px 9px;margin-top:6px;display:inline-block;}'
    + '.bt-pill{display:inline-flex;align-items:center;gap:4px;background:#F3F4F6;color:#6B7280;border-radius:99px;padding:3px 9px;font-size:11px;font-weight:800;}'
    + '.bt-pill.bt-ok{background:#E8F8F1;color:#0B5B43;}'
    + '.bt-pill.bt-inv{background:#E8EFFD;color:#1A56DB;}'
    + '.bt-der{display:flex;align-items:center;gap:12px;flex-shrink:0;}'
    + '.bt-pct{font-size:20px;font-weight:800;line-height:1.1;}'
    + '.bt-pct-l{font-size:10.5px;color:#6B7280;margin-top:-2px;}'
    + '.bt-inv-b{background:#1A56DB;color:white;border:none;border-radius:9px;padding:9px 14px;font-size:13px;font-weight:800;cursor:pointer;font-family:inherit;display:inline-flex;align-items:center;gap:6px;white-space:nowrap;}'
    + '.bt-vacio{background:white;border:1px dashed #D8DEE9;border-radius:14px;padding:20px;text-align:center;font-size:13.5px;color:#6B7280;line-height:1.6;}'
    + '.bt-mas-w{text-align:center;margin-top:16px;}'
    + '.bt-mas{background:white;border:1px solid #D8DEE9;color:#374151;border-radius:10px;padding:11px 22px;font-size:13.5px;font-weight:800;cursor:pointer;font-family:inherit;}'
    + '.bt-mas[disabled]{color:#9CA3AF;cursor:default;}'
    + '.bt-fin{text-align:center;font-size:12.5px;color:#9CA3AF;margin-top:16px;}'
    + '.bt-vid-w{display:flex;align-items:center;gap:12px;flex-wrap:wrap;margin:0 0 12px;}'
    + '.bt-vid-b{background:#111827;color:white;border:none;border-radius:10px;padding:11px 18px;font-size:13.5px;font-weight:800;cursor:pointer;font-family:inherit;display:inline-flex;align-items:center;gap:8px;}'
    + '.bt-vid-n{background:rgba(255,255,255,.22);border-radius:99px;padding:1px 8px;font-size:12px;}'
    + '.bt-vid-h{font-size:12.5px;color:#6B7280;}'
    + '.bt-visor{position:fixed;inset:0;background:#0A0E1E;z-index:10050;display:flex;align-items:center;justify-content:center;}'
    + '.bt-v-caja{display:flex;flex-direction:column;width:100%;height:100%;max-width:520px;}'
    + '.bt-v-video{flex:1;min-height:0;display:flex;align-items:center;justify-content:center;background:#000;}'
    + '.bt-v-video video{width:100%;height:100%;object-fit:contain;display:block;}'
    + '.bt-v-cargando{color:#9CA3AF;font-size:13.5px;}'
    + '.bt-v-pie{background:#111827;color:white;padding:14px 16px;display:flex;gap:12px;align-items:center;justify-content:space-between;flex-wrap:wrap;}'
    + '.bt-v-n{font-size:15.5px;font-weight:800;display:flex;align-items:center;gap:8px;flex-wrap:wrap;}'
    + '.bt-v-s{font-size:12.5px;color:#C3C9D4;margin-top:3px;}'
    + '.bt-v-acc{display:flex;align-items:center;gap:8px;flex-wrap:wrap;}'
    + '.bt-v-nav{background:#1F2937;color:white;border:none;border-radius:9px;padding:9px 14px;font-size:13px;font-weight:800;cursor:pointer;font-family:inherit;display:inline-flex;align-items:center;gap:6px;}'
    + '.bt-v-nav[disabled]{opacity:.4;cursor:default;}'
    + '.bt-v-cuenta{font-size:12px;color:#9CA3AF;}'
    + '.bt-v-x{position:absolute;top:14px;right:16px;background:rgba(255,255,255,.14);color:white;border:none;border-radius:50%;width:38px;height:38px;font-size:17px;cursor:pointer;font-family:inherit;}'
    + '@media(max-width:700px){.bt-f-t{min-width:100%;}.bt-der{width:100%;justify-content:space-between;}}';
  document.head.appendChild(css);
  try{ montar(); }catch(x){}
})();
