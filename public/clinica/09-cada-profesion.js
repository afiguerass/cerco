/* Archivo sacado tal cual de index.html (Fase 1, paso 1.6). El orden de carga
   importa: se carga en el mismo sitio de la página donde estaba. */
/* ================================================================
   CERCO · CADA PROFESIÓN EN SU SITIO
   Lo pidieron las clínicas: los higienistas juntos, los odontólogos
   juntos… En Candidatos (bloques por profesión y botones para ver
   solo una), en Mis ofertas y en Buscar talento.
   ================================================================ */
(function(){
  window.CERCO_GRUPOS = [
    {k:'orto', n:'Ortodoncistas', re:/ortodon/i},
    {k:'prot', n:'Protésicos', re:/prot[eé]sic|laboratorio/i},
    {k:'coord', n:'Coordinación', re:/coordina|gerent|gerencia|direct|responsable|asesor/i},
    {k:'recep', n:'Recepción', re:/recepci|atenci[oó]n al paciente|administrativ/i},
    {k:'hig', n:'Higienistas', re:/higien/i},
    {k:'aux', n:'Auxiliares', re:/auxiliar|asistente|ayudante/i},
    {k:'odo', n:'Odontólogos', re:/odont|dentist|implant|endodon|periodon|est[eé]tica/i},
    {k:'otros', n:'Otros', re:/.*/}
  ];
  // orden en el que se enseñan: primero las profesiones con más gente en una clínica
  var ORDEN = ['hig','aux','odo','orto','recep','coord','prot','otros'];
  window.CERCO_GRUPOS.sort(function(a,b){ return ORDEN.indexOf(a.k) - ORDEN.indexOf(b.k); });
  window.CERCO_grupo = function(txt){
    txt = String(txt || '');
    var prio = ['orto','prot','coord','recep','hig','aux','odo','otros'];
    for(var i = 0; i < prio.length; i++){ var g = CERCO_GRUPOS.filter(function(x){ return x.k === prio[i]; })[0]; if(g.re.test(txt)) return g; }
    return CERCO_GRUPOS[CERCO_GRUPOS.length - 1];
  };
  function e(t){ return String(t == null ? '' : t).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;'); }
  function chips(id, cuenta, activo, onclick, total, nGuard){
    var ks = ORDEN.filter(function(k){ return cuenta[k]; });
    if(ks.length < 2 && !nGuard) return '';
    if(ks.length < 2) ks = [];
    return '<div class="prof-chips" id="'+id+'" role="group" aria-label="Ver por profesión">'
      + '<button type="button" class="prof-chip'+(!activo ? ' on' : '')+'" aria-pressed="'+!activo+'" onclick="'+onclick+'(\'\')">Todas <b>'+total+'</b></button>'
      + (nGuard ? '<button type="button" class="prof-chip guard-chip'+(activo === 'guardados' ? ' on' : '')+'" aria-pressed="'+(activo === 'guardados')+'" onclick="'+onclick+'(\'guardados\')"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="m19 21-7-4-7 4V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v16z"/></svg>Guardados <b>'+nGuard+'</b></button>' : '')
      + ks.map(function(k){ var g = CERCO_GRUPOS.filter(function(x){ return x.k === k; })[0], on = activo === k;
          return '<button type="button" class="prof-chip'+(on ? ' on' : '')+'" aria-pressed="'+on+'" onclick="'+onclick+'(\''+k+'\')">'+e(g.n)+' <b>'+cuenta[k]+'</b></button>'; }).join('')
      + '</div>';
  }

  /* ---------- Candidatos ---------- */
  // Candidatos se abre en «Por contestar»: cada persona sale solo en la pestaña de su fase.
  var PROF_C = '', ETAPA = 'nuevas';
  // Cada solicitud está en una etapa. Es lo que contesta a «¿dónde ha ido?».
  var ETAPAS = [
    ['nuevas', 'Por contestar', 'Solicitudes que aún no has contestado. Lo acordado son 2 días laborables; a los 5 se cierran solas y el candidato lo ve.'],
    ['int', 'Me interesan', 'Quienes has marcado con «Me interesa». Ellos ven que siguen en el proceso. Se quedan aquí 5 días laborables: en ese tiempo proponles entrevista o ciérralo con un motivo. Si no, la solicitud se cierra sola.'],
    ['entr', 'Entrevistas', 'Con entrevista propuesta o confirmada. Las tienes también, por día y hora, en tu Agenda.'],
    ['contr', 'Contratados', 'Personas que has contratado. En su ficha tienes el plan de acogida de 90 días.'],
    ['cerr', 'Cerrados', 'Descartados, retirados o cerrados por plazo. Se guardan por si quieres volver a alguno.'],
    ['', 'Todos', 'Cada persona una sola vez, aunque haya solicitado más de una oferta: se enseña su solicitud más avanzada.']
  ];
  // En «Todos», si una persona tiene varias solicitudes, se enseña la más avanzada
  var PESO_ETAPA = {contr:5, entr:4, int:3, nuevas:2, cerr:1};
  function personaDe(x){ return x.candidatoUid || x.email || x.id; }
  function etapaDe(x){
    var s = x.estado;
    if(s === 'descartada' || s === 'caducada' || s === 'retirada') return 'cerr';
    if(s === 'contratada') return 'contr';
    if(s === 'entrevista') return 'entr';
    return x.interesa ? 'int' : 'nuevas';
  }
  window.CERCO_etapaDe = etapaDe;
  window.verProfesionCand = function(k){ PROF_C = k; agruparCandidatos(); try{ document.getElementById('portal-reales').scrollIntoView({block:'start', behavior:'smooth'}); }catch(x){} };
  window.CERCO_etapa = function(k){ ETAPA = k || ''; agruparCandidatos(); };
  // La usa showScreen (clinica/01i-navegacion.js) al entrar en Candidatos
  window.CERCO_candidatosAlEntrar = function(){ ETAPA = 'nuevas'; };
  window.CERCO_verEtapa = function(k){
    if(PROF_C === 'guardados') PROF_C = '';
    var m = document.getElementById('modal-cand'); if(m){ m.remove(); document.body.style.overflow = ''; }
    if(!document.querySelector('#screen-portal.active')){ try{ ofertaEnPortal = null; }catch(x){} showScreen('portal'); }
    ETAPA = k || '';
    setTimeout(function(){ agruparCandidatos(); try{ document.getElementById('etapa-tabs').scrollIntoView({block:'start', behavior:'smooth'}); }catch(x){} }, 140);
  };
  function marcarEtapa(card, x, k){
    var top = card.querySelector('.card-top'); if(!top) return;
    var t = top.querySelector('.int-tag');
    if(k !== 'int'){ if(t) t.remove(); return; }
    if(!t){ t = document.createElement('span'); t.className = 'int-tag'; top.appendChild(t); }
    var q = null; try{ q = window.CERCO_quedanDias ? CERCO_quedanDias(x) : null; }catch(z){}
    t.textContent = 'Te interesa' + (q === null ? '' : (q <= 0 ? ' · se cierra hoy' : ' · ' + q + (q === 1 ? ' día' : ' días')));
    t.classList.toggle('urg', q !== null && q <= 1);
  }
  function agruparCandidatos(){
    var raiz = document.getElementById('portal-reales'), box = document.getElementById('portal-reales-lista');
    if(!raiz || !box) return;
    var por = {}; try{ (window.CERCO_candidaturas ? CERCO_candidaturas() : []).forEach(function(c){ por[c.id] = c; }); }catch(x){}
    var cards = [].slice.call(box.querySelectorAll('.cand-real'));
    // si algo ha reordenado las tarjetas, respetamos ese orden dentro de cada grupo
    cards.forEach(function(c){ box.appendChild(c); });
    box.querySelectorAll('.grupo-prof').forEach(function(g){ g.remove(); });
    box.classList.remove('rgrid'); box.classList.add('prof-lista');
    var grupos = {}, cuenta = {}, total = 0;
    var gs = guardados(), nGuard = 0;
    var nEt = {nuevas:0, int:0, entr:0, contr:0, cerr:0}, totalEt = 0;
    cards.forEach(function(c){
      var x = por[c.dataset.id]; if(!x) return;
      var k = etapaDe(x); nEt[k]++; totalEt++; c.dataset.etapa = k;
      marcarEtapa(c, x, k);
    });
    // «Todos»: una tarjeta por persona (la de su solicitud más avanzada)
    var mejor = {}, nPersonas = 0;
    cards.forEach(function(c){
      var x = por[c.dataset.id]; if(!x) return;
      var k = personaDe(x), m = mejor[k];
      if(!m){ nPersonas++; mejor[k] = c; }
      else if((PESO_ETAPA[c.dataset.etapa] || 0) > (PESO_ETAPA[m.dataset.etapa] || 0)) mejor[k] = c;
    });
    cards.forEach(function(c){
      var x = por[c.dataset.id], repetida = !!x && mejor[personaDe(x)] !== c;
      c.classList.toggle('oculta-e', ETAPA ? c.dataset.etapa !== ETAPA : repetida);
    });
    cards.forEach(function(c){
      var on = gs.indexOf(c.dataset.id) > -1; if(on && (por[c.dataset.id]||{}).estado !== 'retirada') nGuard++;
      c.classList.toggle('oculta-g', PROF_C === 'guardados' && !on);
      var top = c.querySelector('.card-top'), b = c.querySelector('.guard-btn');
      if(top && !b){ b = document.createElement('button'); b.type = 'button'; b.className = 'guard-btn'; top.appendChild(b);
        b.addEventListener('click', function(ev){ ev.stopPropagation(); alternarGuardado(c.dataset.id); }); }
      if(b){ b.classList.toggle('on', on); b.setAttribute('aria-pressed', on); b.setAttribute('aria-label', on ? 'Quitar de guardados' : 'Guardar candidato'); b.innerHTML = iconoGuard(on); }
    });
    if(PROF_C === 'guardados' && !nGuard) PROF_C = '';
    cards.forEach(function(c){ c.classList.toggle('oculta-g', PROF_C === 'guardados' && guardados().indexOf(c.dataset.id) === -1); });
    cards.forEach(function(c){
      var x = por[c.dataset.id] || {}, g = CERCO_grupo(x.profesion || x.ofertaTitulo || c.dataset.txt);
      (grupos[g.k] = grupos[g.k] || {g:g, l:[]}).l.push(c);
      if(x.estado !== 'retirada'){ cuenta[g.k] = (cuenta[g.k] || 0) + 1; total++; }
    });
    if(PROF_C && PROF_C !== 'guardados' && !grupos[PROF_C]) PROF_C = '';
    var visTotal = 0;
    ORDEN.forEach(function(k){
      var x = grupos[k]; if(!x) return;
      var vis = x.l.filter(function(c){ return c.style.display !== 'none' && !c.classList.contains('oculta-g') && !c.classList.contains('oculta-e'); }).length;
      var sec = document.createElement('section'); sec.className = 'grupo-prof'; sec.dataset.k = k;
      sec.hidden = !vis || (PROF_C && PROF_C !== 'guardados' && PROF_C !== k);
      if(!sec.hidden) visTotal += vis;
      sec.setAttribute('aria-label', x.g.n);
      sec.innerHTML = '<h2 class="grupo-prof-h"><span>'+e(x.g.n)+'</span><b>'+vis+'</b></h2><div class="rgrid"></div>';
      x.l.forEach(function(c){ sec.lastChild.appendChild(c); });
      box.appendChild(sec);
    });
    var vieja = document.getElementById('prof-chips-c'); if(vieja) vieja.remove();
    var h = chips('prof-chips-c', cuenta, PROF_C, 'verProfesionCand', total, nGuard);
    if(h) box.insertAdjacentHTML('beforebegin', h);
    var vg = document.getElementById('guard-vacio'); if(vg) vg.remove();
    // etapas: arriba del todo, antes de las profesiones
    ['etapa-tabs','etapa-nota'].forEach(function(id){ var v = document.getElementById(id); if(v) v.remove(); });
    if(totalEt){
      var th = '<div class="etapas" id="etapa-tabs" role="tablist" aria-label="Etapa del proceso">' + ETAPAS.map(function(t){
        var n = t[0] ? nEt[t[0]] : nPersonas, on = ETAPA === t[0];
        return '<button type="button" role="tab" class="etapa'+(on ? ' on' : '')+(t[0] === 'nuevas' && n ? ' urg' : '')+'" aria-selected="'+on+'" onclick="CERCO_etapa(\''+t[0]+'\')">'+t[1]+' <b>'+n+'</b></button>';
      }).join('') + '</div>';
      var et = ETAPAS.filter(function(t){ return t[0] === ETAPA; })[0];
      if(et && (ETAPA || !visTotal)) th += '<div class="etapa-nota" id="etapa-nota">'+e(et[2])+(visTotal ? '' : ' <b>Ahora no hay nadie aquí.</b>')+'</div>';
      (document.getElementById('prof-chips-c') || document.getElementById('cmp-entry') || box).insertAdjacentHTML('beforebegin', th);
    }
  }
  /* ---------- candidatos guardados ---------- */
  var KG = 'cerco_cand_guardados';
  function guardados(){ try{ var l = JSON.parse(localStorage.getItem(KG) || '[]'); return Array.isArray(l) ? l.map(String) : []; }catch(x){ return []; } }
  function iconoGuard(on){ return '<svg width="17" height="17" viewBox="0 0 24 24" fill="'+(on ? '#F0A000' : 'none')+'" stroke="'+(on ? '#F0A000' : '#fff')+'" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="m19 21-7-4-7 4V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v16z"/></svg>'; }
  window.CERCO_guardados = guardados;
  window.alternarGuardado = function(id){
    id = String(id); var l = guardados(), i = l.indexOf(id);
    if(i > -1) l.splice(i, 1); else l.push(id);
    try{ localStorage.setItem(KG, JSON.stringify(l.slice(-300))); }catch(x){}
    // también en la nube, para verlo desde otro ordenador de la clínica
    try{ var u = firebase.auth().currentUser; if(u) firebase.firestore().collection('clinicas').doc(u.uid).set({guardados:l.slice(-300)}, {merge:true}).catch(function(){}); }catch(x){}
    agruparCandidatos(); pintarGuardFicha(id);
    avisoGuard(i > -1 ? 'Quitado de guardados' : 'Candidato guardado', i > -1 ? '' : 'Ver guardados');
  };
  window.verGuardados = function(){
    var m = document.getElementById('modal-cand'); if(m) m.remove();
    PROF_C = 'guardados';
    if(!document.querySelector('#screen-portal.active')){ try{ ofertaEnPortal = null; }catch(x){} showScreen('portal'); }
    ETAPA = ''; // los guardados se ven todos juntos, en «Todos»
    setTimeout(function(){ agruparCandidatos(); try{ document.getElementById('prof-chips-c').scrollIntoView({block:'start', behavior:'smooth'}); }catch(x){} }, 120);
  };
  function avisoGuard(txt, accion){
    var t = document.getElementById('guard-toast');
    if(!t){ t = document.createElement('div'); t.id = 'guard-toast'; t.setAttribute('role','status'); document.body.appendChild(t); }
    t.innerHTML = '<span>'+e(txt)+'</span>' + (accion ? '<button type="button" onclick="document.getElementById(\'guard-toast\').classList.remove(\'on\'); verGuardados()">'+e(accion)+'</button>' : '');
    t.classList.add('on'); clearTimeout(t._t); t._t = setTimeout(function(){ t.classList.remove('on'); }, 4000);
  }
  // aviso con botón, para cualquier parte del panel
  window.CERCO_aviso = function(txt, accion, fn){
    var t = document.getElementById('guard-toast');
    if(!t){ t = document.createElement('div'); t.id = 'guard-toast'; t.setAttribute('role','status'); document.body.appendChild(t); }
    t.innerHTML = '<span>'+e(txt)+'</span>' + (accion ? '<button type="button">'+e(accion)+'</button>' : '');
    var b = t.querySelector('button'); if(b) b.onclick = function(){ t.classList.remove('on'); try{ if(fn) fn(); }catch(x){} };
    t.classList.add('on'); clearTimeout(t._t); t._t = setTimeout(function(){ t.classList.remove('on'); }, accion ? 6500 : 4000);
  };
  // en la ficha: el mismo botón, con texto
  function pintarGuardFicha(id){
    var b = document.getElementById('ficha-guard');
    var m = document.getElementById('modal-cand'), panel = m && m.firstElementChild;
    if(!b && !panel) return;
    if(!b){ b = document.createElement('button'); b.type = 'button'; b.id = 'ficha-guard'; var cab = panel.firstElementChild; if(cab && cab.nextSibling) panel.insertBefore(b, cab.nextSibling); else panel.appendChild(b); }
    var on = guardados().indexOf(String(id)) > -1;
    b.className = 'ficha-guard' + (on ? ' on' : ''); b.setAttribute('aria-pressed', on);
    b.innerHTML = iconoGuard(on).replace('#fff', '#1A56DB').replace('#fff','#1A56DB') + (on ? 'Guardado' : 'Guardar');
    b.onclick = function(){ alternarGuardado(id); };
  }
  // Ficha: botón «Guardar». La usa abrirFichaCandidato (clinica/02-solicitudes-reales.js)
  window.CERCO_fichaGuardar = function(id){
    try{ pintarGuardFicha(id); }catch(x){}
  };
  window.CERCO_agruparCandidatos = agruparCandidatos;
  // Candidatos: agrupados por profesión. Lo usa renderPortalReal (clinica/01g-datos-de-la-clinica.js)
  window.CERCO_candidatosPorProfesion = function(){
    try{ agruparCandidatos(); }catch(x){}
  };
  // cuando cambian el buscador, el color o la distancia, se vuelve a agrupar
  function luego(){ setTimeout(function(){ try{ agruparCandidatos(); }catch(x){} }, 30); }
  document.addEventListener('input', function(ev){ if(ev.target && ev.target.id === 'search-portal') luego(); });
  document.addEventListener('click', function(ev){ if(ev.target.closest && ev.target.closest('#screen-portal .filter-chip, #screen-portal .radius-chip')) luego(); });
  window.CERCO_agruparTrasFiltrar = luego; // la usa applyFilters_portal (clinica/01b-candidatos-y-seimian.js)

  /* ---------- Mis ofertas ---------- */
  var PROF_O = '';
  window.verProfesionOf = function(k){ PROF_O = k; agruparOfertas(); };
  function agruparOfertas(){
    var board = document.querySelector('#screen-ofertes .board'); if(!board) return;
    var l = []; try{ l = getSavedOffers(); }catch(x){}
    var por = {}; l.forEach(function(o){ por[String(o.id)] = o; });
    var cuenta = {}, total = 0;
    board.querySelectorAll('.prof-sep').forEach(function(x){ x.remove(); });
    board.querySelectorAll('.board-col').forEach(function(col){
      var cards = [].slice.call(col.querySelectorAll('.offer-card:not(.ejemplo)'));
      if(!cards.length) return;
      cards.forEach(function(c){ var o = por[String(c.dataset.oid)] || {}; c._g = CERCO_grupo(o.titulo); c._t = String(o.fecha || ''); cuenta[c._g.k] = (cuenta[c._g.k] || 0) + 1; total++; });
      cards.sort(function(a,b){ return (ORDEN.indexOf(a._g.k) - ORDEN.indexOf(b._g.k)) || b._t.localeCompare(a._t); });
      var ancla = col.querySelector('.board-col-header'), ult = ancla, prev = '';
      cards.forEach(function(c){
        var oculto = PROF_O && c._g.k !== PROF_O;
        c.style.display = oculto ? 'none' : '';
        if(!oculto && c._g.k !== prev){
          var sep = document.createElement('div'); sep.className = 'prof-sep'; sep.textContent = c._g.n;
          if(ult) ult.insertAdjacentElement('afterend', sep); else col.appendChild(sep); ult = sep; prev = c._g.k;
        }
        if(ult) ult.insertAdjacentElement('afterend', c); else col.appendChild(c); ult = c;
      });
    });
    var vieja = document.getElementById('prof-chips-o'); if(vieja) vieja.remove();
    if(PROF_O && !cuenta[PROF_O]){ PROF_O = ''; return agruparOfertas(); }
    var h = chips('prof-chips-o', cuenta, PROF_O, 'verProfesionOf', total);
    if(h) board.insertAdjacentHTML('beforebegin', h);
  }
  window.CERCO_agruparOfertas = agruparOfertas;
  try{ agruparOfertas(); agruparCandidatos(); }catch(x){}
})();
