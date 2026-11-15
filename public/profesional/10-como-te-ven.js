/* ================================================================
   CERCO · CÓMO TE VEN LAS CLÍNICAS (lado profesional)
   La persona elige una de tres opciones, sin ninguna marcada de
   antemano: tiene que elegir ella (lo pide la ley de datos).
     visible   → nombre de pila e inicial del apellido, foto, vídeo y perfil
     anonimo   → vídeo y perfil, sin nombre ni foto
     solicito  → no aparece en las búsquedas
   En ningún caso se publican el apellido entero, el teléfono, el
   correo ni el CV: eso solo lo ve la clínica cuando la persona
   acepta su invitación o le envía una solicitud.
   Se pregunta en el alta (después del test), se puede cambiar en Mi
   perfil, y a quien ya tenía cuenta se le pregunta al entrar.
   ================================================================ */
(function(){
  var MODOS = [
    { k:'visible', t:'Visible',
      r:'Tu nombre y la inicial de tu apellido, tu foto, tu vídeo y tu perfil.',
      ej:'foto' },
    { k:'anonimo', t:'Anónimo',
      r:'Tu vídeo y tu perfil, sin tu nombre y sin tu foto.',
      av:'Tu vídeo se ve: si sales en él, la clínica verá tu cara.',
      ej:'sinfoto' },
    { k:'solicito', t:'Solo cuando yo solicite',
      r:'No apareces en las búsquedas. Una clínica te ve solo si tú le envías una solicitud.',
      ej:'nada' }
  ];
  window.CERCO_MODOS = MODOS;
  function nombrePila(n){ return String(n || '').trim().split(/\s+/)[0] || ''; }
  function inicialApellido(n){ var p = String(n || '').trim().split(/\s+/); return p.length > 1 ? p[1].charAt(0).toUpperCase() : ''; }
  window.CERCO_nombreCorto = function(n){ var a = inicialApellido(n); return nombrePila(n) + (a ? ' ' + a + '.' : ''); };
  // ¿Esta persona sale en «Buscar talento»?
  window.CERCO_apareceEnBuscar = function(p){ p = p || S.perfil || {}; return p.modo === 'visible' || p.modo === 'anonimo'; };
  window.CERCO_modoElegido = function(p){ p = p || S.perfil || {}; return MODOS.some(function(m){ return m.k === p.modo; }) ? p.modo : null; };

  /* El ejemplo de lo que vería la clínica, debajo de cada opción */
  function ejemplo(m){
    var p = S.perfil || {}, d = p.disc || {};
    var prof = esc(p.profesion || 'Higienista dental'), exp = esc(p.experiencia || 'de 2 a 5 años');
    var don = d.dom ? esc(nombreDisc(d.dom)) : 'Estable';
    var ini = esc((nombrePila(p.nombre) || 'L').charAt(0).toUpperCase());
    var cab = '<div style="font-size:11px;font-weight:800;color:#6B7280;letter-spacing:.4px;margin-bottom:6px;">LO QUE VERÍA LA CLÍNICA</div>';
    if(m.ej === 'nada')
      return '<div class="ctv-ej">'+cab+'<div style="font-size:13px;color:#6B7280;line-height:1.5;">Nada. No apareces en su búsqueda.</div></div>';
    var av = m.ej === 'foto'
      ? (p.foto ? '<img src="'+esc(p.foto)+'" alt="" class="ctv-av">' : '<span class="ctv-av ctv-av-l">'+ini+'</span>')
      : '<span class="ctv-av ctv-av-l" style="background:#9CA3AF;">?</span>';
    var nom = m.ej === 'foto'
      ? esc(CERCO_nombreCorto(p.nombre) || 'Laura M.')
      : prof;
    var sub = m.ej === 'foto' ? prof + ' · ' + exp : exp + ' · ' + don;
    return '<div class="ctv-ej">'+cab+'<div class="ctv-f">'+av+'<div><b>'+nom+'</b><small>'+sub+'</small></div></div></div>';
  }
  function nombreDisc(l){ return ({D:'Dominante', I:'Influyente', S:'Estable', C:'Concienzudo'})[l] || ''; }

  /* Las tres opciones. «elegido» puede ser null: entonces no hay ninguna marcada. */
  window.CERCO_modoOpciones = function(elegido, accion){
    return '<div class="ctv-ops" role="radiogroup" aria-label="Cómo quieres que te vean las clínicas">'
      + MODOS.map(function(m){
          var on = elegido === m.k;
          return '<div class="ctv-op'+(on ? ' on' : '')+'" data-k="'+m.k+'" role="radio" tabindex="0" aria-checked="'+on+'"'
            + ' onclick="'+accion.replace('{k}', m.k)+'"'
            + ' onkeydown="if(event.key===\'Enter\'||event.key===\' \'){event.preventDefault(); '+accion.replace('{k}', m.k)+';}">'
            + '<div class="ctv-op-h"><span class="ctv-ra" aria-hidden="true"></span><b>'+esc(m.t)+'</b></div>'
            + '<div class="ctv-op-r">'+esc(m.r)+'</div>'
            + (m.av ? '<div class="ctv-av-w">'+svg('info','#8A5A00',15)+'<span><b>'+esc(m.av)+'</b></span></div>' : '')
            + ejemplo(m) + '</div>';
        }).join('')
      + '</div>';
  };

  /* ---------- la pantalla del alta ---------- */
  var elegido = null;
  window.pintarModo = function(){
    var box = $('md-ops'); if(!box) return;
    box.innerHTML = CERCO_modoOpciones(elegido, "marcarModo('{k}')");
    pintarIconos(box);
    var b = $('md-btn'); if(b) b.disabled = !elegido;
  };
  window.marcarModo = function(k){ elegido = k; error('md-err',''); pintarModo(); };
  window.abrirModo = function(){ elegido = CERCO_modoElegido(); ir('modo'); pintarModo(); };
  window.guardarModo = function(){
    if(!elegido) return error('md-err', 'Elige una de las tres opciones para continuar.');
    if(!unaVez('modo', 800)) return;
    bloquear('md-btn', 'Guardando…');
    guardarModoEn(elegido).then(function(){ ir('inicio'); })
      .catch(function(){ error('md-err', 'No hemos podido guardar tu elección. Revisa tu conexión y vuelve a pulsar.'); })
      .then(function(){ bloquear('md-btn'); });
  };
  /* Guarda la elección (y la fecha, para poder demostrar cuándo se eligió) */
  function guardarModoEn(k){
    var p = Object.assign({}, S.perfil || {});
    p.modo = k; p.modoFecha = new Date().toISOString();
    return Nube.guardarPerfil(p).then(function(){ S.perfil = p; try{ refrescar(); }catch(e){} return p; });
  }
  window.CERCO_guardarModo = guardarModoEn;
  /* Desde Mi perfil y desde el aviso del Inicio: se guarda al tocar, sin botón */
  window.cambiarModo = function(k){
    if(CERCO_modoElegido() === k) return;
    if(!unaVez('modoC', 600)) return;
    var m = MODOS.filter(function(x){ return x.k === k; })[0] || {};
    guardarModoEn(k).then(function(){
      toast(k === 'solicito' ? 'Listo. Ya no apareces en las búsquedas de las clínicas.' : 'Listo. Las clínicas te ven como «' + m.t + '».');
    }).catch(function(){ toast('No se ha podido guardar. Revisa tu conexión.'); });
  };

  /* ---------- Mi perfil: «Cómo te ven las clínicas» ---------- */
  // Ajustes: la elección, para cambiarla cuando quiera. La usa pintarAjustes (profesional/02-lideres-y-efecto-rebote.js)
  window.CERCO_ajustesComoTeVen = function(){
    try{
      var box = $('pf-ajustes'); if(!box || box.querySelector('#aj-comoteven')) return;
      var k = CERCO_modoElegido();
      var h = '<div class="card" id="aj-comoteven"><h3>'+svg('eye','currentColor',16)+'Cómo te ven las clínicas</h3>'
        + '<p class="txt" style="font-size:13.5px;margin-bottom:10px;">Elige qué ven de ti las clínicas que buscan profesionales. Se aplica al momento y puedes cambiarlo cuando quieras.</p>'
        + (k ? '' : '<div class="aviso aviso-info" style="margin-bottom:10px;">'+svg('info','#1E3A8A',16)+'<span>Todavía no has elegido. Mientras no elijas, no te enseñamos a ninguna clínica nueva.</span></div>')
        + CERCO_modoOpciones(k, "cambiarModo('{k}')")
        + '<div class="hint" style="margin-top:10px;">Tu apellido entero, tu teléfono, tu correo y tu CV no se publican nunca aquí: solo los ve una clínica cuando aceptas su invitación o le envías una solicitud.</div>'
        + '</div>';
      // justo antes de «Ocultarme a alguna clínica», que depende de esta elección
      var ref = box.querySelector('#aj-ocultar') || box.querySelector('#aj-quien') || box.lastElementChild;
      if(ref) ref.insertAdjacentHTML('beforebegin', h); else box.insertAdjacentHTML('beforeend', h);
      pintarIconos(box);
    }catch(e){}
  };

  /* ---------- estilos ---------- */
  var css = document.createElement('style');
  css.textContent = ''
    + '.ctv-ops{display:grid;gap:10px;}'
    + '.ctv-op{border:1.5px solid #E5E7EB;border-radius:14px;padding:14px;background:#fff;cursor:pointer;}'
    + '.ctv-op.on{border-color:#1A56DB;background:#F7F9FF;box-shadow:0 0 0 3px rgba(26,86,219,.10);}'
    + '.ctv-op:focus-visible{outline:2px solid #1A56DB;outline-offset:2px;}'
    + '.ctv-op-h{display:flex;align-items:center;gap:9px;font-size:15px;}'
    + '.ctv-ra{width:19px;height:19px;border-radius:50%;border:2px solid #C3C9D4;flex-shrink:0;}'
    + '.ctv-op.on .ctv-ra{border-color:#1A56DB;background:radial-gradient(circle,#1A56DB 0 42%,#fff 46%);}'
    + '.ctv-op-r{font-size:13.5px;color:#4B5563;line-height:1.55;margin:6px 0 0 28px;}'
    + '.ctv-av-w{display:flex;gap:7px;align-items:flex-start;background:#FFF8E6;border:1px solid #F3DFA8;border-radius:10px;padding:9px 11px;margin:9px 0 0 28px;font-size:12.5px;color:#6B4A00;line-height:1.5;}'
    + '.ctv-ej{margin:9px 0 0 28px;background:#F6F7F9;border-radius:10px;padding:10px 12px;}'
    + '.ctv-f{display:flex;align-items:center;gap:10px;}'
    + '.ctv-f b{display:block;font-size:13.5px;color:#111827;}'
    + '.ctv-f small{display:block;font-size:12px;color:#6B7280;margin-top:1px;}'
    + '.ctv-av{width:36px;height:36px;border-radius:50%;object-fit:cover;flex-shrink:0;display:block;}'
    + '.ctv-av-l{background:#1A56DB;color:#fff;display:flex;align-items:center;justify-content:center;font-weight:800;font-size:14px;}';
  document.head.appendChild(css);
})();
