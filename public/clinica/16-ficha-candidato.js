/* Archivo sacado tal cual de index.html (Fase 1, paso 1.6). El orden de carga
   importa: se carga en el mismo sitio de la página donde estaba. */
/* ================================================================
   FICHA DEL CANDIDATO = LA PANTALLA DE SIEMPRE
   La ficha real se pinta con el mismo diseño de la pantalla
   «candidat» de antes (resumen arriba, vídeo + CV resumido, sobre
   mí, cualidades, experiencia; a la derecha información rápida,
   perfil de personalidad, contacto y acciones), con todo lo nuevo:
   vídeo vertical, CV en PDF, entrevista, contrato, acogida, mensajes.
   Los botones y bloques que ya funcionan se trasladan tal cual.
   ================================================================ */
(function(){
  function $(i){ return document.getElementById(i); }
  function e(t){ return String(t == null ? '' : t).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;').replace(/'/g,'&#39;'); }
  function buscar(id){ try{ return (window.CERCO_candidaturas ? CERCO_candidaturas() : []).filter(function(x){ return x.id === id; })[0] || null; }catch(x){ return null; } }
  var IC = {
    spark:'<path d="M12 3l1.9 5.1L19 10l-5.1 1.9L12 17l-1.9-5.1L5 10l5.1-1.9z"/>',
    pin:'<path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0z"/><circle cx="12" cy="10" r="3"/>',
    clock:'<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/>',
    cal:'<rect x="3" y="4" width="18" height="18" rx="2"/><path d="M16 2v4M8 2v4M3 10h18"/>',
    brief:'<rect x="2" y="7" width="20" height="14" rx="2"/><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/>',
    file:'<path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><path d="M14 2v6h6M16 13H8M16 17H8"/>',
    user:'<path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>',
    cap:'<path d="M22 10L12 5 2 10l10 5 10-5z"/><path d="M6 12v5c3 2 9 2 12 0v-5"/>',
    compass:'<circle cx="12" cy="12" r="10"/><path d="M16.2 7.8l-2.1 6.3-6.3 2.1 2.1-6.3z"/>',
    mail:'<rect x="2" y="4" width="20" height="16" rx="2"/><path d="M22 6l-10 7L2 6"/>',
    phone:'<path d="M22 16.9v3a2 2 0 0 1-2.2 2 19.8 19.8 0 0 1-8.6-3.1 19.5 19.5 0 0 1-6-6A19.8 19.8 0 0 1 2.1 4.2 2 2 0 0 1 4.1 2h3a2 2 0 0 1 2 1.7c.1.9.4 1.8.7 2.7a2 2 0 0 1-.5 2.1L8 9.8a16 16 0 0 0 6 6l1.3-1.3a2 2 0 0 1 2.1-.4c.9.3 1.8.6 2.7.7a2 2 0 0 1 1.7 2z"/>',
    msg:'<path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>',
    check:'<path d="M20 6L9 17l-5-5"/>'
  };
  function ico(n, c, s){ return '<svg xmlns="http://www.w3.org/2000/svg" width="'+(s||15)+'" height="'+(s||15)+'" viewBox="0 0 24 24" fill="none" stroke="'+(c||'currentColor')+'" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="flex-shrink:0;">'+(IC[n]||'')+'</svg>'; }
  var NOM = {D:'Dominante', I:'Influyente', S:'Estable', C:'Concienzudo'};
  var COL = {D:'#FF5A5F', I:'#F0A800', S:'#00B488', C:'#5B5FE0'};
  var RASGO = {D:'decide rápido y tira del equipo', I:'comunicativo/a y cercano/a con el paciente', S:'constante, paciente y de trato tranquilo', C:'ordenado/a, meticuloso/a y riguroso/a'};
  var ESTADO = {
    enviada:['Nueva solicitud','#EEF3FE','#1A56DB'], vista:['Pendiente de tu respuesta','#FFFBEB','#8A5A00'],
    interesa:['Te interesa','#E8F8F1','#0E9F6E'], entrevista:['En entrevista','#E8F8F1','#0E9F6E'],
    contratada:['Contratada','#059669','#fff'], descartada:['Descartada','#F3F4F6','#6B7280'],
    caducada:['Cerrada sin respuesta','#F3F4F6','#6B7280'], retirada:['Retirada por la persona','#F3F4F6','#6B7280']
  };

  /* --- el mismo estilo que la pantalla de siempre, copiado para esta --- */
  function copiarEstilo(){
    if($('ficha-estilo')) return;
    var out = [];
    function recorrer(rs){ [].forEach.call(rs, function(r){
      if(r.cssText && r.cssText.indexOf('#screen-candidat') > -1 && r.cssText.indexOf('#screen-candidat-publica') === -1) out.push(r.cssText.split('#screen-candidat').join('#screen-ficha'));
    }); }
    [].forEach.call(document.styleSheets, function(sh){ try{ recorrer(sh.cssRules); }catch(x){} });
    var st = document.createElement('style'); st.id = 'ficha-estilo';
    st.textContent = out.join('\n') + '\n'
      + '#screen-ficha .topbar{position:sticky;top:0;z-index:20;}'
      + '#screen-ficha .grid > div{min-width:0;}#screen-ficha .grid{grid-template-columns:minmax(0,1.6fr) minmax(0,1fr);}#screen-ficha .video-cv-row{grid-template-columns:minmax(0,1fr) minmax(0,1fr);}'
      + '@media (max-width:760px){#screen-ficha .grid,#screen-ficha .video-cv-row{grid-template-columns:minmax(0,1fr);}}'
      + '#screen-ficha .back{font-size:13.5px;font-weight:600;display:inline-flex;align-items:center;gap:6px;padding:6px 0;}'
      + '#screen-ficha .back:hover{color:#1A56DB;}'
      + '#screen-ficha .video-card{display:flex;flex-direction:column;}'
      + '#screen-ficha .video-frame{height:auto;min-height:300px;padding:0;background:#0F1420;}'
      + '#screen-ficha .video-frame.sin{height:300px;flex-direction:column;gap:8px;color:rgba(255,255,255,.75);font-size:13px;}'
      + '#screen-ficha #ficha-video{margin:0 !important;border-radius:0 !important;width:100% !important;}'
      + '#screen-ficha .cand-name{display:flex;align-items:center;gap:10px;}'
      + '#screen-ficha .cand-foto{width:38px;height:38px;border-radius:50%;object-fit:cover;flex-shrink:0;}'
      + '#screen-ficha .geo, #screen-ficha .plazo{font-size:12.5px;color:#4B5563;line-height:1.5;margin-top:8px;}'
      + '#screen-ficha .cv-panel{margin-top:12px;}'
      + '#screen-ficha .cv-acc{display:flex;gap:8px;flex-wrap:wrap;margin-top:auto;}'
      + '#screen-ficha .cv-acc button{flex:1;min-width:120px;justify-content:center;}'
      + '#screen-ficha .status-pill{background:var(--pb);color:var(--pc);}'
      + '#screen-ficha .contact-row a{color:#1A56DB;text-decoration:none;overflow-wrap:anywhere;}'
      + '#screen-ficha .contacto-acc > div{margin:10px 0 0 !important;}'
      + '#screen-ficha .fit-callout .nota{display:block;margin-top:6px;color:#4B5563;font-size:11px;}'
      + '#screen-ficha .msg-card > *{margin-top:0 !important;}'
      + '#screen-ficha .acc-card{padding:16px;}'
      + '#screen-ficha .acc-card > #cand-acciones{margin-top:0 !important;}'
      + '#screen-ficha .ficha-guard{margin:0 !important;}'
      + '#screen-ficha #fs-ancho > .card{margin:0 0 16px !important;padding:20px 22px !important;border-radius:16px !important;background:#fff !important;border:1px solid #E5E7EB !important;}'
      + '#screen-ficha .pie{font-size:12px;color:#6B7280;line-height:1.5;padding:0 4px;}'
      + '@media (max-width:760px){#screen-ficha .topbar{padding:12px 14px;}#screen-ficha #ficha-video.vid-vertical{width:min(100%,270px) !important;margin:0 auto !important;}#screen-ficha .crumb{display:none;}#screen-ficha .back{white-space:nowrap;}#screen-ficha .wrap{padding:14px 10px 40px;}}';
    document.head.appendChild(st);
  }
  function pantalla(){
    var s = $('screen-ficha'); if(s) return s;
    s = document.createElement('div'); s.id = 'screen-ficha'; s.className = 'app-screen';
    var ref = $('screen-candidat');
    if(ref && ref.parentNode) ref.parentNode.insertBefore(s, ref.nextSibling); else (document.querySelector('main') || document.body).appendChild(s);
    return s;
  }

  var desde = 'portal', actual = null;
  window.CERCO_fichaVolver = function(){
    actual = null;
    var m = $('modal-cand'); if(m) m.remove();
    document.body.style.overflow = '';
    try{ showScreen(desde || 'portal'); }catch(x){}
  };

  function pasar(nodo, destino){ if(nodo && destino) destino.appendChild(nodo); }

  function pintar(id){
    var m = $('modal-cand'); if(!m || m.dataset.stub) return;
    var c = buscar(id); if(!c) return;
    copiarEstilo();
    var s = pantalla(), act = document.querySelector('.app-screen.active');
    if(act && act.id !== 'screen-ficha') desde = act.id.replace(/^screen-/, '');
    var vuelve = actual === id ? (window.scrollY || 0) : 0;
    actual = id;

    // lo que ya funciona en la ficha y nos llevamos tal cual
    var vid = m.querySelector('#ficha-video');
    var contacto = null;
    [].slice.call(m.querySelectorAll('a[href^="tel:"], a[href*="wa.me"], a[href^="mailto:"]')).some(function(a){ var p = a.parentNode; if(p && p.querySelectorAll('a').length >= 1 && !p.id){ contacto = p; return true; } return false; });
    var acciones = $('cand-acciones');
    var traer = []; if(acciones){ var n = acciones.nextElementSibling; while(n){ traer.push(n); n = n.nextElementSibling; } }
    var guard = $('ficha-guard');
    var cvVer = $('ficha-cv-ver'), cvBajar = $('ficha-cv');
    var txt = m.textContent || '', mEnc = txt.match(/(\d{1,3})%\s*encaje/), pct = mEnc ? +mEnc[1] : null;
    var porque = '';
    [].slice.call(m.querySelectorAll('div')).some(function(d){ if(/^Para esta oferta marcaste/.test((d.textContent || '').trim()) && d.children.length < 6){ porque = d.innerHTML.replace(/<b>/g, '<strong>').replace(/<\/b>/g, '</strong>'); return true; } return false; });

    var d = c.disc || null, est = c.estado === 'vista' && c.interesa ? 'interesa' : c.estado, E = ESTADO[est] || ESTADO.enviada;
    var nombre = c.nombre || 'Candidato', prof = c.profesion || '';
    var exp = c.experiencia ? String(c.experiencia).toLowerCase() : '';
    // «De 3 a 5 años» → «con entre 3 y 5 años de experiencia» (antes salía «con de 3 a 5 años»)
    var _textoExp = function(x){
      var T = { 'sin experiencia (prácticas)':', sin experiencia en clínica (prácticas)', 'menos de 1 año':' con <b>menos de 1 año</b> de experiencia',
                'de 1 a 3 años':' con <b>entre 1 y 3 años</b> de experiencia', 'de 3 a 5 años':' con <b>entre 3 y 5 años</b> de experiencia',
                'más de 5 años':' con <b>más de 5 años</b> de experiencia' };
      return T[x] || (' con <b>' + e(x) + '</b> de experiencia');
    };

    // resumen de arriba
    var resumen = '<b>' + e(prof || 'Profesional') + '</b>'
      + (c.sinExperiencia && !(c.trabajos || []).length ? ', todavía sin experiencia en clínica' : (exp ? _textoExp(exp) : ''))
      + (d && d.dom ? ', perfil <b>' + NOM[d.dom] + ' (' + d.dom + ')</b> — ' + RASGO[d.dom] : '')
      + '.' + (c.disponibilidad ? ' Incorporación: ' + e(String(c.disponibilidad).toLowerCase()) + '.' : '')
      + (pct !== null ? ' Encaje con tu oferta: <b>' + pct + '%</b>.' : '');

    // etiquetas rápidas
    var tags = [];
    if(c.kmOferta != null && c.kmOferta !== '') tags.push(ico('pin','#6B7280',12) + (c.kmOferta < 1 ? 'Muy cerca' : 'A ' + Math.round(c.kmOferta) + ' km'));
    if(c.disponibilidad) tags.push(ico('clock','#6B7280',12) + e(c.disponibilidad));
    if(c.jornada) tags.push(ico('brief','#6B7280',12) + e(c.jornada));
    if(c.colegiado) tags.push(ico('cap','#6B7280',12) + 'Colegiado/a');

    // CV resumido (como un folio)
    var trabajos = (c.trabajos || []);
    var cvDoc = '<div class="cv-doc"><div class="cv-doc-top"><div class="cv-doc-name">' + e(nombre) + '</div><div class="cv-doc-role">' + e(c.titulacion || prof) + '</div></div>'
      + '<div class="cv-doc-section"><div class="cv-doc-label">Experiencia</div>'
      + (trabajos.length ? trabajos.map(function(t){ return '<div class="cv-doc-item"><b>' + e(t.puesto || '') + '</b><span>' + e([t.centro, t.tiempo].filter(Boolean).join(' · ')) + '</span></div>'; }).join('')
         : '<div class="cv-doc-item"><b>' + e(c.experiencia || 'Sin experiencia en clínica') + '</b></div>') + '</div>'
      + (c.titulacion ? '<div class="cv-doc-section"><div class="cv-doc-label">Formación</div><div class="cv-doc-item"><b>' + e(c.titulacion) + '</b>' + (c.colegiado ? '<span>Colegiado/a nº ' + e(c.colegiado) + (c.colegio ? ' · ' + e(c.colegio) : '') + '</span>' : '') + '</div></div>' : '')
      + '<div class="cv-doc-section"><div class="cv-doc-label">Disponibilidad</div><div class="cv-doc-item"><b>' + e([c.jornada, c.disponibilidad].filter(Boolean).join(' · ') || '—') + '</b></div></div>'
      + '</div>';

    // perfil de personalidad
    var discCard = '';
    if(d && d.norm){
      var ord = ['D','I','S','C'];
      discCard = '<div class="card disc-result-card"><h3>' + ico('compass','#1A1D23',15) + ' Perfil de personalidad</h3>'
        + '<div class="disc-headline"><div class="disc-big-dot" style="background:' + COL[d.dom] + ';">' + d.dom + '</div><div><div class="disc-headline-name">' + NOM[d.dom] + '</div><div class="disc-headline-sub">con rasgo de ' + NOM[d.sec] + ' (' + d.sec + ')</div></div></div>'
        + '<div class="mini-bars">' + ord.map(function(l){ var v = Math.round(d.norm[l] || 0); return '<div class="mini-row"><div class="mini-label">' + l + '</div><div class="mini-track"><div class="mini-fill" style="width:' + v + '%;background:' + COL[l] + ';"></div></div><div class="mini-pct">' + v + '%</div></div>'; }).join('') + '</div>'
        + (pct !== null || porque ? '<div class="fit-callout"><b>' + (pct !== null ? 'POR QUÉ ' + pct + '% DE ENCAJE' : 'CÓMO ENCAJA') + '</b>' + (porque || '') + '<span class="nota">Es orientativo. Haz la entrevista igualmente.</span></div>' : '')
        + (d.definido === false ? '<div style="font-size:12px;color:#7A5200;background:#FFFBEB;border-radius:10px;padding:9px 11px;margin-top:10px;line-height:1.5;">Resultado poco definido: dio notas muy parecidas a casi todo. Tómalo con cautela y coméntalo en la entrevista.</div>' : '')
        + (window._discHistFicha ? _discHistFicha(c) : '')
        + '</div>';
    } else {
      discCard = '<div class="card"><h3>' + ico('compass','#1A1D23',15) + ' Perfil de personalidad</h3><p>Todavía no ha hecho el test de personalidad.</p></div>';
    }

    var tel = c.telefono && c.estado !== 'retirada' ? String(c.telefono) : '', mail = c.email && c.estado !== 'retirada' ? String(c.email) : '';

    s.innerHTML = ''
      + '<div class="topbar"><div class="back" onclick="CERCO_fichaVolver()">← ' + (desde === 'portal' ? 'Portal de candidatos' : 'Volver') + '</div>'
      +   '<div class="topbar-right"><span id="fs-guard-slot"></span><div class="crumb">' + e(c.ofertaTitulo || '') + '</div></div></div>'
      + '<div class="wrap">'
      +   '<div class="ai-summary"><div class="ai-summary-icon">' + ico('spark','#fff',17) + '</div><div><div class="ai-summary-label">RESUMEN DEL CANDIDATO</div><div class="ai-summary-text">' + resumen + '</div></div></div>'
      +   '<div class="grid"><div id="fs-izq">'
      +     '<div class="video-cv-row">'
      +       '<div class="card video-card"><div class="video-frame' + (vid ? '' : ' sin') + '" id="fs-video">' + (vid ? '' : '<div class="play-circle" style="opacity:.5;">▶</div>Sin vídeo de presentación') + '</div>'
      +         '<div class="video-info"><div class="cand-name">' + (c.foto ? '<img class="cand-foto" src="' + e(c.foto) + '" alt="">' : '') + '<span>' + e(nombre) + '</span></div>'
      +         '<div class="cand-meta">' + ico('pin','#6B7280',13) + ' ' + e([c.ciudad, prof].filter(Boolean).join(' · ')) + '</div>'
      +         (tags.length ? '<div class="quick-tags">' + tags.map(function(t){ return '<span class="quick-tag" style="display:inline-flex;align-items:center;gap:5px;">' + t + '</span>'; }).join('') + '</div>' : '')
      +       '</div></div>'
      +       '<div class="card cv-card"><div class="cv-card-header"><h3 style="margin:0;"><span style="display:inline-flex;align-items:center;gap:7px;">' + ico('file','#1A1D23',15) + 'CV resumido</span></h3>'
      +         (d ? '<div class="cv-verified-badge"><span style="display:inline-flex;align-items:center;gap:5px;">' + ico('check','#0E9F6E',12) + 'Con vídeo y test</span></div>' : '') + '</div>'
      +         '<div class="cv-panel">' + cvDoc + '</div><div class="cv-acc" id="fs-cv"></div></div>'
      +     '</div>'
      +     (c.mensaje ? '<div class="card"><h3>' + ico('msg','#1A1D23',15) + ' Su mensaje para esta oferta</h3><p style="white-space:pre-line;">' + e(c.mensaje) + '</p></div>' : '')
      +     (c.resumen ? '<div class="card"><h3>' + ico('user','#1A1D23',15) + ' Sobre mí</h3><p style="white-space:pre-line;">' + e(c.resumen) + '</p></div>' : '')
      +     ((c.fuertes || []).length ? '<div class="card"><h3>Cualidades y puntos fuertes</h3><div class="skills-row">' + c.fuertes.map(function(f){ return '<span class="skill-pill">' + e(f) + '</span>'; }).join('') + '</div></div>' : '')
      +     (c.titulacion ? '<div class="card"><h3>' + ico('cap','#1A1D23',15) + ' Formación</h3><div class="edu-item"><div class="exp-dot"></div><div><div class="exp-title">' + e(c.titulacion) + '</div>' + (c.colegiado ? '<div class="exp-sub">Colegiado/a nº ' + e(c.colegiado) + (c.colegio ? ' · ' + e(c.colegio) : '') + '</div>' : '') + '</div></div></div>' : '')
      +     '<div class="card"><h3>' + ico('brief','#1A1D23',15) + ' Experiencia profesional</h3>'
      +       (trabajos.length ? trabajos.map(function(t){ return '<div class="exp-item"><div class="exp-dot"></div><div><div class="exp-title">' + e(t.puesto || '') + '</div><div class="exp-sub">' + e([t.centro, t.tiempo].filter(Boolean).join(' · ')) + '</div></div></div>'; }).join('')
               : '<p>' + e(c.experiencia ? c.experiencia + (c.sinExperiencia ? ' · todavía sin experiencia en clínica' : '') : 'Todavía no ha trabajado en una clínica.') + '</p>')
      +     '</div>'
      +     '<div class="card msg-card" id="fs-msgs"></div>'
      +     '<div class="pie">' + (window._pieFicha ? _pieFicha(c) : '') + '</div>'
      +   '</div><div id="fs-der">'
      +     '<div class="card"><h3>Información rápida</h3>'
      +       '<div class="status-pill" style="--pb:' + E[1] + ';--pc:' + E[2] + ';">● ' + E[0] + '</div>'
      +       (c.disponibilidad ? '<div class="contact-row">' + ico('cal','#6B7280',14) + ' Puede empezar: ' + e(String(c.disponibilidad).toLowerCase()) + '</div>' : '')
      +       (c.ciudad ? '<div class="contact-row">' + ico('pin','#6B7280',14) + ' Ubicación: ' + e(c.ciudad) + '</div>' : '')
      +       (c.jornada ? '<div class="contact-row">' + ico('clock','#6B7280',14) + ' Jornada: ' + e(c.jornada) + '</div>' : '')
      +       '<div class="geo">' + (window._geoLinea ? _geoLinea(c, true) : '') + '</div>'
      +       '<div class="plazo">' + (window._extraFicha ? _extraFicha(c) : '') + '</div>'
      +     '</div>'
      +     discCard
      +     '<div class="card"><h3>' + ico('mail','#1A1D23',15) + ' Contacto</h3>'
      +       (mail ? '<div class="contact-row">' + ico('mail','#6B7280',14) + ' <a href="mailto:' + e(mail) + '?subject=' + encodeURIComponent((c.ofertaTitulo || 'Tu solicitud') + ' · ' + ((window.CDB && CDB.nombreClinica && CDB.nombreClinica()) || 'CERCO')) + '">' + e(mail) + '</a></div>' : '')
      +       (tel ? '<div class="contact-row">' + ico('phone','#6B7280',14) + ' <a href="tel:' + e(tel.replace(/\s+/g, '')) + '">' + e(tel) + '</a></div>' : '')
      +       (!mail && !tel ? '<p>Ha retirado su solicitud: ya no ves sus datos de contacto.</p>' : '')
      +       '<div class="contacto-acc" id="fs-contacto"></div>'
      +     '</div>'
      +     '<div class="card acc-card" id="fs-acc"></div>'
      +   '</div></div>'
      + '</div>';

    // trasladar lo que funciona
    if(vid) pasar(vid, $('fs-video'));
    if(contacto) pasar(contacto, $('fs-contacto'));
    if(acciones) pasar(acciones, $('fs-acc'));
    // lo largo (contrato, plan de acogida, valoración de la entrevista) va a la columna ancha
    if(acciones){
      var ancho = $('fs-ancho'); if(!ancho){ ancho = document.createElement('div'); ancho.id = 'fs-ancho'; var ref = $('fs-msgs'); $('fs-izq').insertBefore(ancho, ref || $('fs-izq').lastChild); }
      [].slice.call(acciones.querySelectorAll('#ct-card, .mk-card')).forEach(function(n){ n.classList.add('card'); ancho.appendChild(n); });
    }
    var mc = $('fs-msgs'); traer.forEach(function(n){ pasar(n, mc); }); if(!mc.children.length) mc.remove();
    if(guard) pasar(guard, $('fs-guard-slot'));
    if(cvVer) pasar(cvVer, $('fs-cv')); if(cvBajar) pasar(cvBajar, $('fs-cv'));
    if(!$('fs-cv').children.length) $('fs-cv').remove();

    // la ventana ya no hace falta: queda una marca para que los botones sepan que la ficha está abierta
    m.remove(); document.body.style.overflow = '';
    var stub = document.createElement('div'); stub.id = 'modal-cand'; stub.dataset.stub = '1'; stub.hidden = true; document.body.appendChild(stub);

    if(!s.classList.contains('active')) showScreen('ficha');
    document.querySelectorAll('.shell-nav-item').forEach(function(n){ n.classList.toggle('active', n.dataset.screen === 'portal'); });
    window.scrollTo(0, vuelve);
    try{ var mn = document.querySelector('.shell-main'); if(mn && !vuelve) mn.scrollTop = 0; }catch(x){}
  }

  // Las usa abrirFichaCandidato (clinica/02-solicitudes-reales.js): antes de abrir,
  // se vacía la ficha anterior; después, se pinta la ficha a pantalla completa.
  window.CERCO_fichaAntes = function(){
    var y = window.scrollY || 0;
    // la página anterior se vacía antes: si no, sus ids (#cand-acciones, #mk-plan…) confundirían a la ficha nueva
    var s = $('screen-ficha'); if(s){ try{ CERCO_cerrarVisor && CERCO_cerrarVisor(); }catch(x){} if(s.firstChild){ s.style.minHeight = s.offsetHeight + 'px'; s.innerHTML = ''; } }
    return { y: y, s: s };
  };
  window.CERCO_fichaDespues = function(id, modo, antes){
    var s = antes.s, y = antes.y;
    if(s) s.style.minHeight = '';
    try{ pintar(id); if(modo && actual === id) window.scrollTo(0, y); }catch(x){ try{ console.error(x); }catch(z){} }
  };
  // La ficha que está abierta ahora (o null). La usa CERCO_fichaAlDia (clinica/02-solicitudes-reales.js)
  window.CERCO_fichaAbierta = function(){
    var s = $('screen-ficha');
    return (actual && s && s.classList.contains('active') && $('modal-cand')) ? actual : null;
  };
  // La usa cerrarFichaCandidato (clinica/02-solicitudes-reales.js)
  window.CERCO_fichaVolverSiAbierta = function(){
    if($('screen-ficha') && $('screen-ficha').classList.contains('active')) CERCO_fichaVolver();
  };
  // si se va a otra pantalla, la ficha deja de estar «abierta»
  // La usa showScreen (clinica/01i-navegacion.js): al salir de la ficha se quita la provisional
  window.CERCO_fichaAlCambiarPantalla = function(id){
    if(id !== 'ficha'){ var st = $('modal-cand'); if(st && st.dataset.stub) st.remove(); actual = null; }
  };
})();

