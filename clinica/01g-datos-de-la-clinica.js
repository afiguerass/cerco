/* Enlace del test para el equipo y datos de la clínica (Inicio, Estadísticas, Mi equipo, Mis ofertas, Mi cuenta, Candidatos).
   Parte del antiguo clinica/01-panel.js (Fase 1, paso 1.6b). El orden de carga
   importa: los archivos 01a…01i se cargan uno detrás de otro, como antes. */
// ---- Enlace de invitación al equipo (funciona sin servidor) ----
function getBaseUrl(){
  return location.origin + location.pathname;
}
function buildInviteLink(){
  let nombre = '';
  try { const d = JSON.parse(localStorage.getItem('cerco_empresa')||'{}'); nombre = d.nom||''; } catch(e){}
  if(!nombre) nombre = document.getElementById('f-nom-onboarding')?.value.trim()||'';
  if(!nombre) return null;
  var base = location.origin + location.pathname;
  // Si hay nube, el enlace lleva el identificador de la clínica: así el
  // resultado del trabajador llega solo, sin códigos de por medio.
  try {
    if(window.Nube && Nube.activa && Nube.uid){
      return base + '?c=' + encodeURIComponent(Nube.uid) + '&n=' + encodeURIComponent(nombre);
    }
  } catch(e){}
  return base + '?equipo=' + encodeURIComponent(nombre);
}
function refreshInviteLink(){
  const link = buildInviteLink();
  ['invite-link-input','invite-link-stats'].forEach(function(id){
    const inp = document.getElementById(id);
    if(inp) inp.value = link || 'Completa el nombre de tu clínica en Mi clínica';
  });
}
function copyInviteLink(btn){
  const link = buildInviteLink();
  if(!link){
    showToast('Primero escribe el nombre de tu clínica en el paso 1');
    return;
  }
  const done = function(){
    if(btn){ const t = btn.textContent; btn.textContent = 'Copiado'; setTimeout(function(){ btn.textContent = t; }, 1600); }
    showToast('Enlace copiado — ya puedes enviarlo por WhatsApp');
  };
  if(navigator.clipboard && navigator.clipboard.writeText){
    navigator.clipboard.writeText(link).then(done).catch(function(){
      const inp = document.getElementById('invite-link-stats') || document.getElementById('invite-link-input');
      if(inp){ inp.select(); document.execCommand('copy'); done(); }
    });
  } else {
    const inp = document.getElementById('invite-link-stats') || document.getElementById('invite-link-input');
    if(inp){ inp.select(); document.execCommand('copy'); done(); }
  }
}

// Detectar si alguien llega por un enlace de invitación
function detectarInvitacion(){
  const params = new URLSearchParams(location.search);
  const cid = params.get('c');
  const equipo = params.get('equipo') || params.get('n');
  if(!cid && !equipo) return false;

  window.cercoClinicaId = cid || null;
  const el = document.getElementById('invitado-clinica');
  if(el) el.textContent = equipo || 'Tu clínica';
  try { sessionStorage.setItem('cerco_invitado_clinica', equipo || ''); } catch(e){}
  if(cid){ try { sessionStorage.setItem('cerco_invitado_cid', cid); } catch(e){} }

  // Si no nos han dicho el nombre, lo preguntamos a la nube
  if(cid && !equipo && window.Nube){
    Nube.nombreClinicaPorId(cid).then(function(n){
      if(n && el) el.textContent = n;
      try { sessionStorage.setItem('cerco_invitado_clinica', n||''); } catch(e){}
    }).catch(function(){});
  }

  try{
    var propi = CDB.registrado() || CAuth.existe();
    var sal = document.getElementById('invitado-salida');
    if(sal && propi) sal.style.display = 'block';
  }catch(e){}
  return true;
}
function empezarTestInvitado(){
  const nombre = document.getElementById('invitado-nombre')?.value.trim();
  if(!nombre){ showToast('Escribe tu nombre para empezar'); return; }
  try { sessionStorage.setItem('cerco_invitado_nombre', nombre); } catch(e){}
  window.esInvitado = true;
  showScreen('testdisc');
}


/* ============================================================
   CERCO · DATOS DE LA CLÍNICA
   Todo lo que ve el propietario sale de aquí. Si acaba de
   registrarse, las cifras son cero y van subiendo con lo que
   hace. Los datos de ejemplo viven aparte y siempre van
   marcados como ejemplo.
   ============================================================ */
window.CDB = {
  K: { emp:'cerco_empresa', eq:'cerco_equipo', of:'cerco_ofertas',
       pl:'cerco_plantilla', demo:'cerco_demo', me:'cerco_disc_empresa',
       alta:'cerco_alta' },
  LETRAS: ['D','I','S','C'],
  COLOR: { D:'#FF5A5F', I:'#F0A800', S:'#00B488', C:'#5B5FE0' },
  NOMBRE: { D:'Dominante', I:'Influyente', S:'Estable', C:'Concienzudo' },

  _get: function(k, def){ try{ var v = localStorage.getItem(k); return v===null? def : JSON.parse(v); }catch(e){ return def; } },
  _set: function(k, v){ try{ localStorage.setItem(k, JSON.stringify(v)); }catch(e){} },

  clinica: function(){ var c = this._get(this.K.emp, {}); return (c && typeof c==='object') ? c : {}; },
  nombreClinica: function(){ return (this.clinica().nom || '').trim(); },
  registrado: function(){ return !!this.nombreClinica(); },
  miDisc: function(){ return this._get(this.K.me, null); },
  equipo: function(){ var e = this._get(this.K.eq, []); return Array.isArray(e)? e : []; },
  ofertas: function(){ var o = this._get(this.K.of, []); return Array.isArray(o)? o : []; },
  plantilla: function(){ var n = parseInt(this._get(this.K.pl, 0),10); return isNaN(n)?0:n; },
  setPlantilla: function(n){
    var v = parseInt(n,10);
    if(isNaN(v) || v < 0) v = 0;
    if(v > 999) v = 999;
    this._set(this.K.pl, v);
  },

  fechaAlta: function(){
    var f = this._get(this.K.alta, null);
    if(!f){ f = new Date().toISOString(); this._set(this.K.alta, f); }
    return f;
  },
  diasDesdeAlta: function(){
    var d = Math.floor((Date.now() - new Date(this.fechaAlta()).getTime()) / 86400000);
    return d < 0 ? 0 : d;
  },

  /* modo ejemplo: encendido mientras no hay clínica registrada */
  demo: function(){
    var v = null;
    try{ v = localStorage.getItem(this.K.demo); }catch(e){}
    if(v === null) return !this.registrado();
    return v === '1';
  },
  setDemo: function(b){
    try{ localStorage.setItem(this.K.demo, b ? '1':'0'); }catch(e){}
    this.aplicarModo();
    this.renderTodo();
  },
  aplicarModo: function(){
    document.body.classList.toggle('solo-real', !this.demo());
  },

  /* --- equipo --- */
  addMiembro: function(m){
    var l = this.equipo();
    m.id = 'm' + Date.now() + Math.floor(Math.random()*1000);
    m.fecha = new Date().toISOString();
    l.push(m);
    this._set(this.K.eq, l);
    try{ if(window._subirMiembro) _subirMiembro(m); }catch(e){}
    return m;
  },
  delMiembro: function(id){
    this._set(this.K.eq, this.equipo().filter(function(x){ return x.id !== id; }));
    try{ if(window.Nube && Nube.activa) Nube.borrarMiembro(id); }catch(e){}
  },

  /* el responsable cuenta como miembro en cuanto hace su test */
  equipoCompleto: function(){
    var l = this.equipo().slice();
    var mio = this.miDisc();
    if(mio && mio.dominant){
      l.unshift({ id:'__yo__', nombre:(this.clinica().nomResp || 'Tú'), rol:'Responsable',
                  dom:mio.dominant, sec:mio.secondary, pct:(mio.norm? mio.norm[mio.dominant]:null), yo:true });
    }
    return l;
  },

  /* --- cálculo de la composición DISC ---
     el perfil principal pesa el doble que el secundario */
  composicion: function(){
    var eq = this.equipoCompleto(), p = {D:0,I:0,S:0,C:0}, tot = 0;
    eq.forEach(function(m){
      if(p[m.dom] !== undefined){ p[m.dom] += 2; tot += 2; }
      if(p[m.sec] !== undefined){ p[m.sec] += 1; tot += 1; }
    });
    var out = {};
    this.LETRAS.forEach(function(l){ out[l] = tot ? Math.round(p[l]/tot*100) : 0; });
    if(tot){
      var suma = out.D+out.I+out.S+out.C;
      if(suma !== 100){
        var mayor = this.LETRAS.slice().sort(function(a,b){ return out[b]-out[a]; })[0];
        out[mayor] += (100 - suma);
      }
    }
    return out;
  },

  /* Quin perfil te menys pes a l equip. Amb menys de 3 tests no hi ha
     prou base per dir res: ho diem, en lloc d inventar-nos-ho. */
  perfilQueFalta: function(){
    var eq = this.equipoCompleto();
    var ambTest = eq.filter(function(m){ return !!m.dom; }).length;
    var comp = this.composicion();
    var orden = this.LETRAS.slice().sort(function(a,b){ return comp[a]-comp[b]; });
    return {
      fiable: ambTest >= 3,
      tests: ambTest,
      falta: orden[0],
      segona: orden[1],
      pct: comp[orden[0]],
      comp: comp
    };
  },

  ofertasPorEstado: function(){
    var r = { activa:0, pausada:0, cerrada:0 };
    this.ofertas().forEach(function(o){ var e = o.estado || 'activa'; if(r[e]!==undefined) r[e]++; });
    return r;
  },

  candidatosRecibidos: function(){
    // con solicitudes reales se cuentan personas (clinica/02-solicitudes-reales.js)
    if(!(this.demo && this.demo()) && window.CERCO_contarCandidatosReales) return CERCO_contarCandidatosReales();
    var n = 0;
    this.ofertas().forEach(function(o){ n += (parseInt(o.candidatos,10) || 0); });
    return n;
  },

  resumen: function(){
    var eq = this.equipoCompleto();
    var est = this.ofertasPorEstado();
    var pl = this.plantilla();
    var r = {
      clinica: this.nombreClinica(),
      responsable: (this.clinica().nomResp || '').trim(),
      miembros: eq.length,
      plantilla: pl,
      pendientes: pl > eq.length ? pl - eq.length : 0,
      comp: this.composicion(),
      ofertas: this.ofertas().length,
      activas: est.activa, pausadas: est.pausada, cerradas: est.cerrada,
      candidatos: this.candidatosRecibidos(),
      contratados: 0,
      miDiscHecho: !!this.miDisc(),
      dias: this.diasDesdeAlta()
    };
    // contratados: de las solicitudes reales (clinica/04-clinica-y-candidato.js)
    try{ if(!this.demo() && window.CERCO_contarContratados) r.contratados = CERCO_contarContratados(); }catch(x){}
    return r;
  },

  /* --- código de resultado del test: MG-IC-08 --- */
  parseCodigo: function(txt){
    if(!txt) return null;
    var c = txt.trim().toUpperCase().replace(/\s+/g,'');
    var m = c.match(/^([A-ZÑ]{1,3})-([DISC])([DISC])-(\d{1,3})$/);
    if(!m) return null;
    if(m[2] === m[3]) return null;           // el perfil principal i el secundari no poden ser el mateix
    var pct = parseInt(m[4],10);
    if(isNaN(pct) || pct > 100) return null; // un percentatge per sobre de 100 no existeix
    return { ini:m[1], dom:m[2], sec:m[3], pct:pct };
  },

  reset: function(){
    var self = this;
    [this.K.emp, this.K.eq, this.K.of, this.K.pl, this.K.me, this.K.alta,
     'cerco_disc_individual', 'cerco_disc_empresa_pendiente', 'cerco_disc_empresa_uid'].forEach(function(k){
      try{ localStorage.removeItem(k); }catch(e){}
    });
    try{ localStorage.removeItem(self.K.demo); }catch(e){}
  },

  renderTodo: function(){
    // avisos de lo que ha hecho el candidato desde la última vez (clinica/04-clinica-y-candidato.js)
    try{ if(window.CERCO_avisosCandidatos) CERCO_avisosCandidatos(); }catch(x){}
    try{ if(typeof renderInicioReal==='function') renderInicioReal(); }catch(e){}
    try{ if(typeof renderStatsReal==='function') renderStatsReal(); }catch(e){}
    try{ if(typeof renderEquipo==='function') renderEquipo(); }catch(e){}
    try{ if(typeof pintarOfertasReales==='function') pintarOfertasReales(); }catch(e){}
    try{ if(typeof renderPortalReal==='function') renderPortalReal(); }catch(e){}
    try{ if(typeof renderMiCuenta==='function') renderMiCuenta(); }catch(e){}
    try{ if(typeof renderPerfilPublico==='function') renderPerfilPublico(); }catch(e){}
    try{ if(typeof renderSwitchDemo==='function') renderSwitchDemo(); }catch(e){}
    try{ if(typeof syncWorkspaceName==='function') syncWorkspaceName(); }catch(e){}
  }
};

/* ---------- utilidades de pintado ---------- */
function _ini(nombre){
  return (nombre||'?').trim().split(/\s+/).map(function(p){ return p.charAt(0).toUpperCase(); }).join('').slice(0,2) || '?';
}
function _svg(d, color, size){
  return '<svg xmlns="http://www.w3.org/2000/svg" width="'+(size||16)+'" height="'+(size||16)+'" viewBox="0 0 24 24" fill="none" stroke="'+(color||'currentColor')+'" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round" style="display:inline-block;vertical-align:-0.15em;flex-shrink:0;">'+d+'</svg>';
}
var ICO = {
  check:'<path d="M20 6 9 17l-5-5"/>',
  users:'<path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/>',
  chart:'<path d="M3 3v16a2 2 0 0 0 2 2h16"/><path d="M18 17V9"/><path d="M13 17V5"/><path d="M8 17v-3"/>',
  spark:'<path d="m12 3-1.9 5.8a2 2 0 0 1-1.3 1.3L3 12l5.8 1.9a2 2 0 0 1 1.3 1.3L12 21l1.9-5.8a2 2 0 0 1 1.3-1.3L21 12l-5.8-1.9a2 2 0 0 1-1.3-1.3z"/>',
  link:'<path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/>',
  brief:'<path d="M12 17v5"/><path d="M9 10.76a2 2 0 0 1-1.11 1.79l-1.78.9A2 2 0 0 0 5 15.24V16a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1v-.76a2 2 0 0 0-1.11-1.79l-1.78-.9A2 2 0 0 1 15 10.76V7a1 1 0 0 1 1-1 2 2 0 0 0 0-4H8a2 2 0 0 0 0 4 1 1 0 0 1 1 1z"/>',
  build:'<path d="M6 22V4a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v18Z"/><path d="M10 6h4"/><path d="M10 10h4"/><path d="M10 14h4"/><path d="M10 18h4"/>',
  trash:'<path d="M3 6h18"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6"/><path d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>',
  info:'<circle cx="12" cy="12" r="10"/><path d="M12 16v-4"/><path d="M12 8h.01"/>'
};

/* ============================ INICIO ============================ */
/* Inicio de la clínica (Fase 1: una sola versión). Antes eran siete versiones
   envueltas; ahora se pinta la base y después cada bloque, en el mismo orden.
   Un fallo en un bloque no impide pintar los demás, igual que antes. */
function renderInicioReal(){
  try{ _pintarInicioBase(); }catch(x){}
  ['CERCO_inicioSolicitudes', 'CERCO_inicioCitas', 'CERCO_inicioContratos', 'CERCO_inicioPlazos', 'CERCO_inicioLider', 'CERCO_inicioConfianza', 'CERCO_inicioAgenda']
    .forEach(function(bloque){ try{ if(window[bloque]) window[bloque](); }catch(x){} });
}
function _pintarInicioBase(){
  var box = document.getElementById('inicio-real');
  if(!box) return;
  if(CDB.demo()){ box.innerHTML=''; box.style.display='none'; return; }
  box.style.display='';

  var r = CDB.resumen();
  var hoy = new Date();
  var dias=['domingo','lunes','martes','miércoles','jueves','viernes','sábado'];
  var meses=['enero','febrero','marzo','abril','mayo','junio','julio','agosto','septiembre','octubre','noviembre','diciembre'];
  var fecha = dias[hoy.getDay()] + ', ' + hoy.getDate() + ' de ' + meses[hoy.getMonth()];
  fecha = fecha.charAt(0).toUpperCase() + fecha.slice(1);
  var h = hoy.getHours();
  var saludo = h < 14 ? 'Buenos días' : (h < 21 ? 'Buenas tardes' : 'Buenas noches');
  var nom = r.responsable ? (', ' + r.responsable.split(/\s+/)[0]) : '';

  var pasos = [
    { ok: !!r.clinica, tit:'Completa los datos de tu clínica',
      sub: r.clinica ? r.clinica : 'Nombre, dirección y especialidades',
      btn:'Completar', scr:'onboarding' },
    { ok: r.miDiscHecho, tit:'Haz tu test de personalidad',
      sub: r.miDiscHecho ? 'Hecho — ya contamos tu perfil en el equipo' : 'Son 5 minutos. Es la base de todo lo demás',
      btn:'Hacer el test', scr:'testdisc' },
    { ok: r.miembros > 1, tit:'Invita a tu equipo',
      sub: r.miembros > 1 ? (r.miembros + ' personas con el test hecho') : 'Envíales el enlace y añade sus resultados',
      btn:'Invitar', scr:'equipo' },
    { ok: r.ofertas > 0, tit:'Publica tu primera oferta',
      sub: r.ofertas > 0 ? (r.ofertas + ' oferta' + (r.ofertas>1?'s':'') + ' publicada' + (r.ofertas>1?'s':'')) : 'Cuando necesites cubrir un puesto',
      btn:'Publicar', scr:'crear-oferta' }
  ];
  var hechos = pasos.filter(function(p){ return p.ok; }).length;

  var html = '';
  html += '<div style="margin-bottom:24px;">'
        + '<div style="font-size:13px;color:#6B7280;margin-bottom:4px;">'+fecha+'</div>'
        + '<h1 style="font-size:24px;font-weight:800;color:#111827;margin:0;">'+saludo+_esc(nom)+'</h1>'
        + '</div>';

  /* --- primeros pasos, mientras queden --- */
  if(hechos < 4){
    html += '<div style="background:white;border-radius:16px;border:1px solid #EAECF0;overflow:hidden;margin-bottom:16px;box-shadow:0 1px 4px rgba(0,0,0,.04);">'
          + '<div style="padding:18px 20px 14px;border-bottom:1px solid #F3F4F6;">'
          + '<div style="display:flex;justify-content:space-between;align-items:center;gap:12px;">'
          + '<div><div style="font-size:15px;font-weight:800;color:#111827;">Primeros pasos</div>'
          + '<div style="font-size:12.5px;color:#6B7280;margin-top:2px;">Tu panel se irá llenando a medida que los completes</div></div>'
          + '<div style="font-size:13px;font-weight:800;color:#1A56DB;white-space:nowrap;">'+hechos+' de 4</div></div>'
          + '<div style="background:#F3F4F6;border-radius:99px;height:6px;margin-top:12px;">'
          + '<div style="width:'+(hechos/4*100)+'%;background:#1A56DB;height:100%;border-radius:99px;transition:width .3s;"></div></div>'
          + '</div>';
    pasos.forEach(function(p,i){
      html += '<div class="paso-row'+(p.ok?' hecho':'')+'">'
            + '<div class="paso-num">'+(p.ok? _svg(ICO.check,'#0E9F6E',15) : (i+1))+'</div>'
            + '<div style="flex:1;min-width:0;"><div class="paso-tit">'+p.tit+'</div><div class="paso-sub">'+_esc(p.sub)+'</div></div>'
            + (p.ok ? '' : '<button class="paso-btn" onclick="showScreen(\''+p.scr+'\')">'+p.btn+'</button>')
            + '</div>';
    });
    html += '</div>';
  }

  /* --- cifras reales --- */
  html += '<div style="display:grid;grid-template-columns:repeat(4,1fr);gap:12px;margin-bottom:16px;" class="inicio-kpis">'
    + _kpi(r.activas, 'Ofertas activas', 'ofertes')
    + _kpi(r.candidatos, 'Candidatos recibidos', 'portal')
    + _kpi(r.miembros + (r.plantilla ? '/'+r.plantilla : ''), 'Test del equipo', 'equipo')
    + '<div onclick="showScreen(\'crear-oferta\')" style="background:#1A56DB;border-radius:14px;padding:16px;text-align:center;cursor:pointer;box-shadow:0 4px 12px rgba(26,86,219,.25);">'
    + '<div style="font-size:24px;font-weight:800;color:white;">+</div>'
    + '<div style="font-size:11.5px;color:rgba(255,255,255,.85);margin-top:2px;">Nueva oferta</div></div>'
    + '</div>';

  /* --- qué pasa hoy --- */
  if(r.candidatos === 0){
    html += '<div class="cerco-empty" style="margin-bottom:16px;">'
          + _svg(ICO.users,'#C3CBD9',30)
          + '<h3>Aún no tienes candidatos</h3>'
          + '<p>Cuando publiques una oferta y alguien se inscriba, aparecerá aquí con su encaje calculado. '
          + 'Todo lo que veas en esta pantalla será tuyo, nunca datos inventados.</p>'
          + '<button class="paso-btn" style="margin-top:16px;" onclick="showScreen(\'crear-oferta\')">Publicar una oferta</button>'
          + '</div>';
  }

  /* --- Seimian: solo dice algo cuando hay datos para decirlo --- */
  html += '<div style="background:linear-gradient(135deg,#0F1C3F,#1A3A6B);border-radius:16px;padding:20px;">'
        + '<div style="font-size:11px;font-weight:800;text-transform:uppercase;letter-spacing:.5px;color:rgba(255,255,255,.5);margin-bottom:10px;">'
        + '<span style="display:inline-flex;align-items:center;gap:7px;">'+_svg(ICO.spark,'#F5A623',15)+'Seimian</span></div>'
        + '<div style="font-size:13.5px;color:white;line-height:1.6;">' + _mensajeSeimian(r) + '</div>'
        + '</div>';

  box.innerHTML = html;
}

function _kpi(valor, etiqueta, pantalla){
  return '<div onclick="showScreen(\''+pantalla+'\')" style="background:white;border-radius:14px;border:1px solid #EAECF0;padding:16px;text-align:center;cursor:pointer;box-shadow:0 1px 3px rgba(0,0,0,.04);">'
       + '<div style="font-size:24px;font-weight:800;color:#111827;">'+valor+'</div>'
       + '<div style="font-size:11.5px;color:#6B7280;margin-top:2px;">'+etiqueta+'</div></div>';
}

function _mensajeSeimian(r){
  // El teu test compta si el tens guardat O si ja surts a la llista
  // de l equip amb perfil. Abans mirava nomes una cosa i es
  // contradeia amb el que es veia a la llista del costat.
  var joHiSoc = !!r.miDiscHecho;
  if(!joHiSoc){
    try {
      joHiSoc = (CDB.equipoCompleto()||[]).some(function(m){ return m.yo && m.dom; });
    } catch(e){}
  }
  var falta = joHiSoc ? '' :
    ' Te falta tu propio test: sin él no cuento contigo en la lectura del equipo.';
  if(r.miembros === 0)
    return 'Empieza por tu test de personalidad. Sin él no puedo calcular el encaje de nadie con tu equipo, y es lo que hace que CERCO sirva de algo.';
  if(r.miembros < 3)
    return 'Con '+r.miembros+' persona'+(r.miembros===1?'':'s')+' todavía no puedo leer el equipo. A partir de 3 test hechos empiezo a decirte qué perfil te falta.'+falta;
  var comp = r.comp, min = 101;
  ['D','I','S','C'].forEach(function(l){ if(comp[l] < min) min = comp[l]; });
  var fluixos = ['D','I','S','C'].filter(function(l){ return comp[l] === min; });
  if(fluixos.length === 4)
    return 'Tu equipo está repartido entre los cuatro perfiles, sin huecos claros. Cuando publiques una oferta te diré qué perfil encaja mejor con ese puesto concreto.' + falta;

  var noms = fluixos.map(function(l){
    return '<b style="color:#F5A623;">' + (CDB.NOMBRE[l]||l) + ' (' + l + ')</b>';
  });
  var unir = function(union){
    return noms.length > 1 ? noms.slice(0,-1).join(', ') + ' ' + union + ' ' + noms[noms.length-1] : noms[0];
  };
  var cua = ' En la próxima incorporación, dale peso a ' + (noms.length>1?'esos perfiles':'ese perfil') + '.';

  if(min === 0)
    return 'En tu equipo no hay nadie con perfil ' + unir('ni') + '.' + cua + falta;
  if(min < 15)
    return 'Tu equipo tiene poca presencia ' + (noms.length>1?'de los perfiles ':'del perfil ') + unir('y')
         + ' — un ' + min + '%' + (noms.length>1?' cada uno':'') + '.' + cua + falta;
  return 'Tu equipo está repartido entre los cuatro perfiles, sin huecos claros. Cuando publiques una oferta te diré qué perfil encaja mejor con ese puesto concreto.'+falta;
}

/* ========================== ESTADÍSTICAS ========================== */
/* Estadísticas: las pinta y añade las cifras de contratación (Fase 1: una sola versión) */
function renderStatsReal(){
  var r = _renderStatsRealBase.apply(this, arguments);
  try{ CERCO_cifrasEstadisticas(); }catch(x){}
  return r;
}
function _renderStatsRealBase(){
  var box = document.getElementById('stats-real');
  if(!box) return;
  if(CDB.demo()){ box.innerHTML=''; box.style.display='none'; return; }
  box.style.display='';

  var r = CDB.resumen();
  var eq = CDB.equipoCompleto();
  var html = '';

  html += '<div style="margin-bottom:24px;">'
        + '<h1 style="font-size:22px;font-weight:800;color:#111827;margin:0 0 4px;">Estadísticas</h1>'
        + '<div style="font-size:13.5px;color:#6B7280;">'
        + (r.clinica ? _esc(r.clinica) + ' · ' : '')
        + (r.dias === 0 ? 'desde hoy' : 'desde hace ' + r.dias + ' día' + (r.dias===1?'':'s'))
        + '</div></div>';

  /* sin equipo: no hay nada que medir */
  if(eq.length === 0){
    html += '<div class="cerco-empty">'
          + _svg(ICO.chart,'#C3CBD9',32)
          + '<h3>Todavía no hay nada que medir</h3>'
          + '<p>Las estadísticas se construyen con los test de personalidad de tu equipo. '
          + 'Haz el tuyo y pásale el enlace a tu gente: en cuanto haya resultados, esta pantalla cobra vida.</p>'
          + '<div style="display:flex;gap:10px;justify-content:center;flex-wrap:wrap;margin-top:18px;">'
          + '<button class="paso-btn" onclick="showScreen(\'testdisc\')">Hacer mi test</button>'
          + '<button class="paso-btn ghost" onclick="showScreen(\'equipo\')">Invitar a mi equipo</button>'
          + '</div></div>';
    box.innerHTML = html;
    return;
  }

  /* KPIs honestos: solo lo que podemos contar */
  // (las contrataciones están arriba, en «Tu contratación», que sale siempre)
  html += '<div style="display:grid;grid-template-columns:repeat(3,1fr);gap:12px;margin-bottom:20px;" class="stats-kpis">'
        + _kpiStat(eq.length, eq.length === 1 ? 'persona con el test hecho' : 'personas con el test hecho', r.pendientes ? r.pendientes+' pendientes' : 'todo el equipo', r.pendientes?'#D97706':'#059669')
        + _kpiStat(r.ofertas, r.ofertas === 1 ? 'oferta publicada' : 'ofertas publicadas', r.activas + (r.activas === 1 ? ' activa' : ' activas'), '#6B7280')
        + _kpiStat(r.candidatos, r.candidatos === 1 ? 'candidato recibido' : 'candidatos recibidos', r.candidatos ? 'en tus ofertas' : 'aún ninguno', '#6B7280')
        + '</div>';

  /* composición real */
  var comp = r.comp;
  html += '<div style="display:grid;grid-template-columns:1fr 1fr;gap:14px;" class="stats-cols">';
  html += '<div style="background:white;border-radius:14px;border:1px solid #EAECF0;padding:20px;box-shadow:0 1px 3px rgba(0,0,0,.04);">'
        + '<div style="font-size:14px;font-weight:800;color:#111827;margin-bottom:4px;">Composición de tu equipo</div>'
        + '<div style="font-size:12px;color:#6B7280;margin-bottom:16px;">Calculado con '+eq.length+' test'+(eq.length===1?'':'s')+'. El perfil principal cuenta el doble que el secundario.</div>'
        + '<div style="display:flex;flex-direction:column;gap:10px;">';
  ['D','I','S','C'].forEach(function(l){
    html += '<div><div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:4px;">'
          + '<div style="display:flex;align-items:center;gap:8px;"><div style="width:10px;height:10px;border-radius:50%;background:'+CDB.COLOR[l]+';"></div>'
          + '<span style="font-size:13px;color:#374151;">'+CDB.NOMBRE[l]+' ('+l+')</span></div>'
          + '<span style="font-size:13px;font-weight:700;color:'+CDB.COLOR[l]+';">'+comp[l]+'%</span></div>'
          + '<div style="background:#F3F4F6;border-radius:99px;height:7px;"><div style="width:'+comp[l]+'%;background:'+CDB.COLOR[l]+';height:100%;border-radius:99px;"></div></div></div>';
  });
  html += '</div>';
  if(eq.length < 3){
    html += '<div style="margin-top:14px;background:#F8F9FA;border-radius:8px;padding:10px 12px;font-size:12px;color:#6B7280;">'
          + '<span style="display:inline-flex;align-items:flex-start;gap:7px;">'+_svg(ICO.info,'#9CA3AF',14)
          + '<span>Con '+eq.length+' test'+(eq.length===1?'':'s')+' esta lectura aún es orientativa. A partir de 3 personas empieza a ser fiable.</span></span></div>';
  }
  html += '</div>';

  /* El mateix bloc que a Mi equipo: capcalera amb el compte,
     barra de progres, i cada persona amb el seu nom i els seus
     xips de color. */
  var plEq = 0; try { plEq = CDB.plantilla() || 0; } catch(e){}

  html += '<div style="background:white;border-radius:14px;border:1px solid #EAECF0;padding:20px;box-shadow:0 1px 3px rgba(0,0,0,.04);">'
        + '<div style="display:flex;justify-content:space-between;align-items:center;gap:10px;flex-wrap:wrap;">'
        + '<div style="font-size:14.5px;font-weight:800;color:#111827;">Personas con el test hecho</div>'
        + '<div style="display:flex;align-items:center;gap:10px;">'
        + '<div style="font-size:13px;font-weight:800;color:#1A56DB;">' + eq.length + (plEq ? ' de ' + plEq : '') + '</div>'
        + '<button class="paso-btn ghost" onclick="showScreen(\'equipo\')">Gestionar</button></div></div>';

  if(plEq > 0){
    var pctEq = Math.min(100, Math.round(eq.length / plEq * 100));
    html += '<div style="background:#F3F4F6;border-radius:99px;height:7px;margin:10px 0 16px;">'
          + '<div style="width:' + pctEq + '%;background:linear-gradient(90deg,#1A56DB,#3B82F6);height:100%;border-radius:99px;transition:width .3s;"></div></div>';
  } else {
    html += '<div style="height:12px;"></div>';
  }

  eq.slice(0, 8).forEach(function(m){ html += _filaMiembro(m, false); });
  if(eq.length > 8)
    html += '<div style="text-align:center;padding-top:12px;"><span onclick="showScreen(\'equipo\')" style="font-size:12.5px;color:#1A56DB;font-weight:700;cursor:pointer;">Ver las ' + eq.length + ' personas &rarr;</span></div>';

  html += '</div></div>';

  /* Seimian solo si hay base */
  if(eq.length >= 3){
    html += '<div style="background:linear-gradient(135deg,#0F1C3F,#1A3A6B);border-radius:16px;padding:20px 22px;margin-top:16px;">'
          + '<div style="font-size:10px;font-weight:800;color:rgba(255,255,255,.5);letter-spacing:.6px;text-transform:uppercase;margin-bottom:6px;">'
          + '<span style="display:inline-flex;align-items:center;gap:7px;">'+_svg(ICO.spark,'#F5A623',15)+'Seimian · Recomendación</span></div>'
          + '<div style="font-size:14px;color:white;line-height:1.6;">'+_mensajeSeimian(r)+'</div></div>';
  }

  box.innerHTML = html;
}

function _kpiStat(valor, etiqueta, nota, color){
  return '<div style="background:white;border-radius:14px;border:1px solid #EAECF0;padding:18px 16px;text-align:center;box-shadow:0 1px 3px rgba(0,0,0,.04);">'
       + '<div style="font-size:28px;font-weight:800;color:#111827;">'+valor+'</div>'
       + '<div style="font-size:12px;color:#6B7280;margin-top:2px;">'+etiqueta+'</div>'
       + (nota ? '<div style="font-size:11px;color:'+color+';font-weight:600;margin-top:4px;">'+nota+'</div>' : '')
       + '</div>';
}

/* Un xip de color per al perfil: ple si es el dominant, clar si
   es el secundari. Aixi es veu d un cop d ull i no cal desxifrar
   un "C/D" en gris. */
var _NOMCURT = { D:'Dominante', I:'Influyente', S:'Estable', C:'Concienzudo' };

function _xipPerfil(lletra, esDominant){
  if(!lletra || !_NOMCURT[lletra]) return '';
  var col = (window.CDB && CDB.COLOR && CDB.COLOR[lletra]) || '#9CA3AF';
  var base = 'display:inline-flex;align-items:center;gap:4px;border-radius:999px;'
           + 'padding:2px 8px 2px 5px;font-size:10.5px;font-weight:700;line-height:1.5;white-space:nowrap;';
  if(esDominant){
    return '<span style="'+base+'background:'+col+';color:#fff;">'
         + '<span style="width:13px;height:13px;border-radius:50%;background:rgba(255,255,255,.28);display:inline-flex;align-items:center;justify-content:center;font-size:8.5px;font-weight:800;">'+lletra+'</span>'
         + _NOMCURT[lletra] + '</span>';
  }
  return '<span style="'+base+'background:'+col+'1F;color:'+col+';">'
       + '<span style="width:13px;height:13px;border-radius:50%;background:'+col+';color:#fff;display:inline-flex;align-items:center;justify-content:center;font-size:8.5px;font-weight:800;">'+lletra+'</span>'
       + _NOMCURT[lletra] + '</span>';
}

function _filaMiembro(m, conBorrar){
  var col = CDB.COLOR[m.dom] || '#9CA3AF';
  return '<div class="miembro-row">'
       + '<div class="mini-disc" style="background:'+col+';">'+(m.dom||'?')+'</div>'
       + '<div style="flex:1;min-width:0;">'
       + '<div style="font-size:13.5px;font-weight:600;color:#111827;">'+_esc(m.nombre)+(m.yo?' <span style="font-size:11px;color:#1A56DB;font-weight:700;">· tú</span>':'')+'</div>'
       + '<div style="font-size:11.5px;color:#6B7280;display:flex;align-items:center;gap:6px;flex-wrap:wrap;">'
       + '<span>'+_esc(m.rol||'Sin rol')+'</span>'
       + _xipPerfil(m.dom, true) + _xipPerfil(m.sec, false)
       + (m.origen === 'cerco' ? '<span class="xip-cerco" style="font-size:10.5px;font-weight:700;color:#065F46;background:#ECFDF5;border-radius:99px;padding:2px 8px;">Contratación en CERCO</span>' : '')
       + '</div></div>'
       + (conBorrar && !m.yo
          ? '<button onclick="borrarMiembro(\''+m.id+'\')" title="Quitar" style="background:none;border:none;cursor:pointer;padding:6px;border-radius:6px;">'+_svg(ICO.trash,'#C3CBD9',15)+'</button>'
          : '')
       + '</div>';
}

/* ============================ MI EQUIPO ============================ */
function renderEquipo(){
  var box = document.getElementById('equipo-body');
  if(!box) return;
  var eq = CDB.equipoCompleto();
  var pl = CDB.plantilla();
  var link = (typeof buildInviteLink === 'function') ? buildInviteLink() : null;
  var nomClinica = CDB.nombreClinica();
  var html = '';

  /* cabecera */
  html += '<div style="margin-bottom:22px;">'
        + '<h1 style="font-size:22px;font-weight:800;color:#111827;margin:0 0 4px;">Mi equipo</h1>'
        + '<div style="font-size:13.5px;color:#6B7280;">Cada persona que hace el test suma a las estadísticas de tu clínica</div></div>';

  /* paso 1: enlace */
  html += '<div style="background:white;border-radius:16px;border:1px solid #EAECF0;padding:20px;margin-bottom:14px;box-shadow:0 1px 3px rgba(0,0,0,.04);">'
        + '<div style="display:flex;align-items:center;gap:9px;margin-bottom:4px;">'
        + '<div style="width:22px;height:22px;border-radius:50%;background:#EEF2FF;color:#1A56DB;display:flex;align-items:center;justify-content:center;font-size:11px;font-weight:800;">1</div>'
        + '<div style="font-size:14.5px;font-weight:800;color:#111827;">Envía el enlace a tu gente</div></div>'
        + '<div style="font-size:12.5px;color:#6B7280;margin-bottom:14px;padding-left:31px;">Quien lo abra hace el test directamente, sin registrarse ni instalar nada. Al terminar recibe un código.</div>';

  if(!nomClinica){
    html += '<div style="background:#FFF8EC;border:1px solid #FDE9C8;border-radius:10px;padding:13px 15px;font-size:13px;color:#92400E;line-height:1.55;">'
          + 'Primero pon el nombre de tu clínica en <b>Mi clínica</b>: es lo que verán tus compañeros al abrir el enlace.'
          + '<div style="margin-top:11px;"><button class="paso-btn" onclick="showScreen(\'onboarding\')">Ir a Mi clínica</button></div></div>';
  } else {
    html += '<div style="display:flex;gap:8px;align-items:center;flex-wrap:wrap;">'
          + '<input type="text" readonly id="invite-link-equipo" value="'+_esc(link||'')+'" style="flex:1;min-width:220px;border:1px solid #E5E7EB;border-radius:9px;padding:11px 12px;font-size:12px;color:#4B5563;background:#F9FAFB;font-family:inherit;outline:none;">'
          + '<button onclick="copyInviteLink(this)" style="background:#1A56DB;color:white;border:none;border-radius:9px;padding:12px 18px;font-size:13px;font-weight:700;cursor:pointer;">Copiar</button>'
          + '<button onclick="compartirWhatsapp()" style="background:#E8F8F1;color:#0E9F6E;border:none;border-radius:9px;padding:12px 18px;font-size:13px;font-weight:700;cursor:pointer;">WhatsApp</button>'
          + '</div>';
  }
  html += '</div>';

  /* paso 2: añadir código */
  html += '<div style="background:white;border-radius:16px;border:1px solid #EAECF0;padding:20px;margin-bottom:14px;box-shadow:0 1px 3px rgba(0,0,0,.04);">'
        + '<div style="display:flex;align-items:center;gap:9px;margin-bottom:4px;">'
        + '<div style="width:22px;height:22px;border-radius:50%;background:#EEF2FF;color:#1A56DB;display:flex;align-items:center;justify-content:center;font-size:11px;font-weight:800;">2</div>'
        + '<div style="font-size:14.5px;font-weight:800;color:#111827;">Añade el código que te envíen</div></div>'
        + '<div style="font-size:12.5px;color:#6B7280;margin-bottom:14px;padding-left:31px;">Te llegará algo como <b style="font-family:ui-monospace,Menlo,monospace;color:#374151;">MG-IC-84</b>. Lo pegas aquí con el nombre y el puesto.</div>'
        + '<div style="display:grid;grid-template-columns:1.4fr 1.2fr 1fr auto;gap:8px;align-items:center;" class="equipo-form">'
        + '<input type="text" id="eq-nombre" placeholder="Nombre y apellido" style="border:1px solid #E5E7EB;border-radius:9px;padding:11px 12px;font-size:13px;font-family:inherit;outline:none;">'
        + '<select id="eq-rol" style="border:1px solid #E5E7EB;border-radius:9px;padding:11px 12px;font-size:13px;font-family:inherit;outline:none;background:white;color:#374151;">'
        + '<option value="">Puesto…</option>'
        + '<option>Odontólogo/a</option><option>Higienista dental</option><option>Auxiliar dental</option>'
        + '<option>Recepción</option><option>Gerencia</option><option>Ortodoncista</option>'
        + '<option>Protésico/a</option><option>Otro</option></select>'
        + '<input type="text" id="eq-codigo" placeholder="Código" maxlength="12" oninput="this.value=this.value.toUpperCase()" style="border:1px solid #E5E7EB;border-radius:9px;padding:11px 12px;font-size:13px;font-family:ui-monospace,Menlo,monospace;letter-spacing:1px;outline:none;">'
        + '<button onclick="anadirMiembro()" style="background:#1A56DB;color:white;border:none;border-radius:9px;padding:12px 20px;font-size:13px;font-weight:700;cursor:pointer;white-space:nowrap;">Añadir</button>'
        + '</div>'
        + '<div id="eq-error" style="font-size:12.5px;color:#DC2626;margin-top:9px;min-height:1px;"></div>'
        + '</div>';

  /* tamaño de plantilla */
  html += '<div style="background:white;border-radius:16px;border:1px solid #EAECF0;padding:18px 20px;margin-bottom:14px;box-shadow:0 1px 3px rgba(0,0,0,.04);">'
        + '<div style="display:flex;align-items:center;gap:12px;flex-wrap:wrap;">'
        + '<div style="flex:1;min-width:200px;"><div style="font-size:13.5px;font-weight:700;color:#111827;">¿Cuántas personas sois en total?</div>'
        + '<div style="font-size:12.5px;color:#6B7280;margin-top:2px;">Para saber cuántos test faltan por hacer</div></div>'
        + '<input type="number" min="0" max="999" id="eq-plantilla" value="'+(pl||'')+'" placeholder="0" onchange="guardarPlantilla()" style="width:88px;border:1px solid #E5E7EB;border-radius:9px;padding:10px 12px;font-size:14px;font-family:inherit;text-align:center;outline:none;">'
        + '</div></div>';

  /* lista */
  html += '<div style="background:white;border-radius:16px;border:1px solid #EAECF0;padding:20px;box-shadow:0 1px 3px rgba(0,0,0,.04);">'
        + '<div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:6px;">'
        + '<div style="font-size:14.5px;font-weight:800;color:#111827;">Personas con el test hecho</div>'
        + '<div style="font-size:13px;font-weight:800;color:#1A56DB;">'+eq.length+(pl?' de '+pl:'')+'</div></div>';

  if(pl > 0){
    var pct = Math.min(100, Math.round(eq.length/pl*100));
    html += '<div style="background:#F3F4F6;border-radius:99px;height:7px;margin:10px 0 16px;">'
          + '<div style="width:'+pct+'%;background:linear-gradient(90deg,#1A56DB,#3B82F6);height:100%;border-radius:99px;transition:width .3s;"></div></div>';
  } else {
    html += '<div style="height:12px;"></div>';
  }

  if(eq.length === 0){
    html += '<div style="text-align:center;padding:26px 10px;">'
          + _svg(ICO.users,'#C3CBD9',28)
          + '<div style="font-size:14px;font-weight:700;color:#374151;margin-top:12px;">Todavía no hay nadie</div>'
          + '<div style="font-size:13px;color:#6B7280;margin-top:5px;line-height:1.55;">Empieza por ti: haz tu test y entrarás automáticamente en la lista.</div>'
          + '<button class="paso-btn" style="margin-top:15px;" onclick="showScreen(\'testdisc\')">Hacer mi test</button></div>';
  } else {
    eq.forEach(function(m){ html += _filaMiembro(m, true); });
  }
  html += '</div>';

  box.innerHTML = html;
}

function guardarPlantilla(){
  var el = document.getElementById('eq-plantilla');
  if(!el) return;
  CDB.setPlantilla(el.value);
  CDB.renderTodo();
  try{ if(window._subirClinica) _subirClinica(); }catch(e){}
}

function anadirMiembro(){
  var nEl = document.getElementById('eq-nombre'),
      rEl = document.getElementById('eq-rol'),
      cEl = document.getElementById('eq-codigo'),
      err = document.getElementById('eq-error');
  if(!nEl || !cEl) return;
  var nombre = nEl.value.trim(), rol = rEl ? rEl.value : '', codigo = cEl.value.trim();
  err.textContent = ''; if(window.verAviso) verAviso(err);

  if(!nombre){ err.textContent = 'Escribe el nombre de la persona.'; if(window.verAviso) verAviso(err); nEl.focus(); return; }
  var p = CDB.parseCodigo(codigo);
  if(!p){ err.textContent = 'Ese código no tiene el formato correcto. Debe ser algo como MG-IC-84.'; if(window.verAviso) verAviso(err); cEl.focus(); return; }

  // Aviso solo si no coincide NI la primera inicial: quien hizo el test pudo
  // escribir solo su nombre de pila y el responsable escribe nombre y apellido.
  var ini = _ini(nombre);
  var encaja = (p.ini === ini) || (p.ini.charAt(0) === ini.charAt(0));
  if(!encaja){
    if(cEl.dataset.avisado !== codigo + nombre){
      cEl.dataset.avisado = codigo + nombre;
      err.innerHTML = 'Ese código parece de otra persona: empieza por <b>'+p.ini+'</b> y el nombre que has escrito por <b>'+ini+'</b>.'
                    + '<br><span style="color:#6B7280; if(window.verAviso) verAviso(err);">Si estás seguro, pulsa <b>Añadir</b> otra vez y lo guardo igualmente.</span>';
      return;
    }
  }

  var repe = CDB.equipo().some(function(m){ return m.codigo === codigo.toUpperCase(); });
  if(repe){ err.textContent = 'Ese código ya está añadido.'; if(window.verAviso) verAviso(err); return; }

  var norm = function(t){ return (t||'').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/\s+/g,' ').trim(); };

  // El responsable ya cuenta con su propio test: no puede entrar dos veces
  if(CDB.miDisc() && norm(nombre) === norm(CDB.clinica().nomResp)){
    err.innerHTML = 'Tú ya estás en el equipo con tu propio test. Si quieres cambiar tu resultado, vuelve a hacer el test desde <b>Mi cuenta</b>.'; if(window.verAviso) verAviso(err);
    return;
  }
  // Y tampoco dos personas con el mismo nombre
  var mismoNombre = CDB.equipo().some(function(m){ return norm(m.nombre) === norm(nombre); });
  if(mismoNombre){
    err.textContent = 'Ya hay alguien con ese nombre en el equipo. Añade el apellido para distinguirlos.'; if(window.verAviso) verAviso(err);
    return;
  }

  CDB.addMiembro({ nombre:nombre, rol:rol||'Sin puesto', dom:p.dom, sec:p.sec, pct:p.pct, codigo:codigo.toUpperCase() });
  nEl.value=''; cEl.value=''; if(rEl) rEl.value='';
  CDB.renderTodo();
  if(typeof showToast === 'function') showToast(nombre.split(/\s+/)[0] + ' añadido al equipo · Perfil ' + p.dom + '/' + p.sec);
}

function borrarMiembro(id){
  CDB.delMiembro(id);
  CDB.renderTodo();
  if(typeof showToast === 'function') showToast('Persona quitada del equipo');
}

function compartirWhatsapp(){
  var link = (typeof buildInviteLink === 'function') ? buildInviteLink() : null;
  if(!link){ if(typeof showToast==='function') showToast('Pon antes el nombre de tu clínica'); return; }
  var txt = 'Hola, estamos usando CERCO para conocer mejor cómo trabajamos en equipo. '
          + '¿Puedes hacer este test? Son 5 minutos y al final te da un código: pásamelo y ya está.\n\n' + link;
  window.open('https://wa.me/?text=' + encodeURIComponent(txt), '_blank');
}

/* ====================== MIS OFERTAS (reales) ====================== */
function renderOfertasReal(){
  if(!window.CDB) return;
  var strip = document.getElementById('ofertes-strip-real');
  var sub = document.getElementById('ofertes-sub');
  if(sub) sub.textContent = CDB.nombreClinica() ? (CDB.nombreClinica() + ' — control total, de un solo vistazo') : 'Control total, de un solo vistazo';
  if(!strip) return;

  if(CDB.demo()){ strip.innerHTML=''; strip.style.display='none'; }
  else {
    strip.style.display='';
    var r = CDB.resumen();
    strip.innerHTML = '<div class="glance-strip">'
      + _pill('#E8F8F1', r.activas, 'Ofertas activas')
      + _pill('#EAF0FF', r.candidatos, 'Candidatos totales')
      + _pill('#FFF4E5', r.pausadas, 'Pausadas')
      + _pill('#F3F1FF', r.cerradas, 'Cerradas')
      + '</div>';
  }

  /* contadores de columna: solo las tarjetas visibles */
  ['activa','pausada','cerrada'].forEach(function(est){
    var badge = document.querySelector('.board-count[data-col="'+est+'"]');
    if(!badge) return;
    var col = badge.closest('.board-col');
    if(!col) return;
    var n = 0;
    col.querySelectorAll('.offer-card').forEach(function(c){
      if(CDB.demo() || !c.classList.contains('ejemplo')) n++;
    });
    badge.textContent = n;
  });
}
function _pill(bg, val, label){
  return '<div class="glance-pill"><div class="gp-icon" style="background:'+bg+';">'+_svg(ICO.brief,'#1A56DB',17)+'</div>'
       + '<div><div class="gp-val">'+val+'</div><div class="gp-label">'+label+'</div></div></div>';
}


/* ====================== MI CUENTA (dades reals) ====================== */
function renderMiCuenta(){
  var demo = CDB.demo();
  var c = CDB.clinica(), r = CDB.resumen();
  var set = function(id, val){ var e=document.getElementById(id); if(e) e.textContent = val; };
  var setv = function(id, val){ var e=document.getElementById(id); if(e && !e.value) e.value = val; };

  if(demo){
    set('mc-hero-name','Tu nombre');
    set('mc-hero-role','Gerente · Clínica Dental Madrid Centro');
    set('mc-st-ofertas','3'); set('mc-st-cand','45'); set('mc-st-equipo','3');
    set('mc-st-equipo-lbl','Esperan respuesta');
    return;
  }

  var nom = (c.nomResp||'').trim();
  var rolSel = document.getElementById('mc-rol');
  if(rolSel && c.rol){
    var hi = [].some.call(rolSel.options, function(o){ return o.value === c.rol; });
    if(hi) rolSel.value = c.rol;
  }
  var rol = rolSel ? rolSel.value : 'Gerente';
  set('mc-hero-name', nom || 'Tu nombre');
  set('mc-hero-role', (rol === 'Responsable de RRHH' ? 'Coordinador/a de clínica' : rol) + (c.nom ? ' · ' + c.nom : ''));
  set('mc-st-ofertas', r.activas);
  set('mc-st-cand', r.candidatos);
  set('mc-st-equipo', r.miembros);
  set('mc-st-equipo-lbl', 'Test del equipo');

  // camps del formulari: omplim només si estan buits, per no trepitjar el que escrigui
  var nEl = document.getElementById('mc-nombre');
  if(nEl && !nEl.value && nom) nEl.value = nom;
  var eEl = document.getElementById('mc-email');
  if(eEl && eEl.value === 'contacto@dentalmadrid.es') eEl.value = '';
  var tEl = document.getElementById('mc-telefono');
  if(tEl && tEl.value === '+34 600 000 000') tEl.value = '';

  // inicial de l'avatar
  var av = document.getElementById('mc-avatar-letter');
  if(av && !document.getElementById('mc-avatar-circle').style.backgroundImage)
    av.textContent = nom ? nom.trim().charAt(0).toUpperCase() : '?';

  // membres amb accés
  var acc = document.getElementById('mc-miembros-acceso');
  if(acc) acc.textContent = '1 de 1';
}

/* ====================== CANDIDATOS ====================== */
/* «Candidatos» (Fase 1: una sola versión). Antes eran siete versiones
   envueltas; ahora se pinta la base y después cada parte, en el mismo orden.
   Un fallo en una parte no impide pintar las demás, igual que antes. */
function renderPortalReal(){
  try{ _pintarCandidatosBase(); }catch(x){}
  ['CERCO_candidatosReales', 'CERCO_candidatosTasaRespuesta', 'CERCO_candidatosEtiquetas', 'CERCO_candidatosTalento', 'CERCO_candidatosPorProfesion', 'CERCO_candidatosEntrada']
    .forEach(function(parte){ try{ if(window[parte]) window[parte](); }catch(x){} });
}
function _pintarCandidatosBase(){
  var h1 = document.getElementById('portal-h1');
  var sub = document.getElementById('portal-sub');
  var aviso = document.getElementById('portal-aviso-real');
  if(CDB.demo()){
    if(h1) h1.textContent = '23 candidatos han aplicado';
    if(sub) sub.textContent = 'Ordenados por encaje con el perfil que necesitas';
    if(aviso){ aviso.innerHTML=''; aviso.style.display='none'; }
    return;
  }
  var n = CDB.candidatosRecibidos();
  if(h1) h1.textContent = n === 0 ? 'Todavía no tienes candidatos' : (n + (n===1?' candidato ha aplicado':' candidatos han aplicado'));
  if(sub) sub.textContent = n === 0
    ? 'En cuanto alguien se inscriba en una de tus ofertas, aparecerá aquí'
    : 'Ordenados por encaje con el perfil que necesitas';
  if(aviso){
    aviso.style.display='';
    aviso.innerHTML = '<div style="background:#F8F9FA;border:1px solid #E5E7EB;border-radius:12px;padding:16px 18px;margin-bottom:16px;">'
      + '<div style="display:flex;align-items:flex-start;gap:11px;">'
      + _svg(ICO.info,'#9CA3AF',17)
      + '<div style="flex:1;font-size:13px;color:#4B5563;line-height:1.6;">'
      + '<b style="color:#111827;">Los perfiles que ves debajo son de ejemplo.</b> '
      + 'Sirven para enseñarte cómo CERCO ordena y puntúa a los candidatos. '
      + 'Los tuyos aparecerán aquí en cuanto publiques una oferta y alguien se inscriba.'
      + (CDB.resumen().ofertas === 0
          ? '<div style="margin-top:12px;"><button class="paso-btn" onclick="showScreen(\'crear-oferta\')">Publicar mi primera oferta</button></div>'
          : '')
      + '</div></div></div>';
  }
}

/* ====================== INTERRUPTOR DE EJEMPLO ====================== */
function renderSwitchDemo(){
  var el = document.getElementById('demo-switch');
  if(!el) return;
  var on = CDB.demo();
  el.innerHTML = '<div onclick="CDB.setDemo('+(on?'false':'true')+')" style="display:flex;align-items:center;gap:10px;cursor:pointer;padding:9px 10px;border-radius:9px;">'
    + '<div class="sw-track'+(on?' on':'')+'"><div class="sw-knob"></div></div>'
    + '<div style="min-width:0;"><div style="font-size:12px;font-weight:700;color:'+(on?'#92400E':'#6B7280')+';">Datos de ejemplo</div>'
    + '<div style="font-size:10.5px;color:#6B7280;line-height:1.35;">'+(on?'Verás una clínica inventada':'Solo ves lo tuyo')+'</div></div></div>';

  /* aviso visible en las pantallas de ejemplo */
  document.querySelectorAll('.aviso-ejemplo').forEach(function(a){ a.style.display = on ? '' : 'none'; });
}
