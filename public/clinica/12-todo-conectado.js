/* Archivo sacado tal cual de index.html (Fase 1, paso 1.6). El orden de carga
   importa: se carga en el mismo sitio de la página donde estaba. */
/* ================================================================
   TODO CONECTADO (lado clínica)
   1. «Me interesa» es una etapa de verdad: el candidato lo ve, tiene
      plazo y está en su sitio en Candidatos.
   2. Agenda: cada entrevista propuesta queda en un calendario, con
      su sala, su ficha y «añadir a mi calendario».
   3. Las pantallas de muestra ya no son un callejón: en una clínica
      real, «entrevista» lleva a la Agenda.
   4. Herramientas: cada tarjeta dice lo que hace hoy y abre algo real.
   ================================================================ */
(function(){
  function $(id){ return document.getElementById(id); }
  function e(t){ return String(t == null ? '' : t).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;'); }
  function leer(k, d){ try{ var v = JSON.parse(localStorage.getItem(k) || 'null'); return v == null ? d : v; }catch(x){ return d; } }
  function cands(){ try{ return (window.CERCO_candidaturas ? CERCO_candidaturas() : []) || []; }catch(x){ return []; } }
  function buscar(id){ return cands().filter(function(c){ return String(c.id) === String(id); })[0]; }
  function visita(c){ return c && c.tipo === 'visita'; }
  function abierta(c){ return c && (c.estado === 'enviada' || c.estado === 'vista'); }
  function nom(c){ return String((c && c.nombre) || 'Esta persona').trim().split(/\s+/)[0]; }
  function real(){ try{ return !(window.CDB && CDB.demo && CDB.demo()); }catch(x){ return true; } }
  function aviso(t, accion, fn){ if(window.CERCO_aviso) CERCO_aviso(t, accion, fn); else if(window.showToast) showToast(t); }
  function ico(d, col, s){ return '<svg xmlns="http://www.w3.org/2000/svg" width="'+(s||16)+'" height="'+(s||16)+'" viewBox="0 0 24 24" fill="none" stroke="'+(col||'currentColor')+'" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" style="flex-shrink:0;">'+d+'</svg>'; }
  var I = {
    cal:'<path d="M8 2v4"/><path d="M16 2v4"/><rect width="18" height="18" x="3" y="4" rx="2"/><path d="M3 10h18"/>',
    video:'<path d="m16 13 5.223 3.482a.5.5 0 0 0 .777-.416V7.87a.5.5 0 0 0-.752-.432L16 10.5"/><rect x="2" y="6" width="14" height="12" rx="2"/>',
    pin:'<path d="M20 10c0 4.993-5.539 10.193-7.399 11.799a1 1 0 0 1-1.202 0C9.539 20.193 4 14.993 4 10a8 8 0 0 1 16 0"/><circle cx="12" cy="10" r="3"/>',
    tel:'<path d="M13.832 16.568a1 1 0 0 0 1.213-.303l.355-.465A2 2 0 0 1 17 15h3a2 2 0 0 1 2 2v3a2 2 0 0 1-2 2A18 18 0 0 1 2 4a2 2 0 0 1 2-2h3a2 2 0 0 1 2 2v3a2 2 0 0 1-.8 1.6l-.468.351a1 1 0 0 0-.292 1.233 14 14 0 0 0 6.392 6.384"/>',
    star:'<path d="M11.525 2.295a.53.53 0 0 1 .95 0l2.31 4.679a2.123 2.123 0 0 0 1.595 1.16l5.166.756a.53.53 0 0 1 .294.904l-3.736 3.638a2.123 2.123 0 0 0-.611 1.878l.882 5.14a.53.53 0 0 1-.771.56l-4.618-2.428a2.122 2.122 0 0 0-1.973 0L6.396 21.01a.53.53 0 0 1-.77-.56l.881-5.139a2.122 2.122 0 0 0-.611-1.879L2.16 9.795a.53.53 0 0 1 .294-.906l5.165-.755a2.122 2.122 0 0 0 1.597-1.16z"/>',
    der:'<path d="m9 18 6-6-6-6"/>', izq:'<path d="m15 18-6-6 6-6"/>',
    user:'<path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>',
    down:'<path d="M12 15V3"/><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><path d="m7 10 5 5 5-5"/>'
  };

  var css = document.createElement('style');
  css.textContent = ''
  + '.int-box{display:flex;gap:12px;align-items:center;justify-content:space-between;flex-wrap:wrap;border:1px solid #D5DAE1;background:#FAFBFC;border-radius:12px;padding:12px 14px;margin-bottom:12px;font-size:13px;line-height:1.5;color:#374151;}'
  + '.int-box b{color:#111827;}.int-box span{display:block;color:#6B7280;font-size:12.5px;}'
  + '.int-box > div{flex:1;min-width:200px;}'
  + '.int-box.on{border-color:#BFE9D7;background:#F3FBF7;display:block;color:#0B5B43;}.int-box.on b{color:#0B5B43;}'
  + '.int-btn{background:#fff;border:1.5px solid #0E9F6E;color:#0B6B4F;border-radius:10px;padding:10px 14px;font:inherit;font-size:13.5px;font-weight:800;cursor:pointer;display:inline-flex;align-items:center;gap:7px;min-height:42px;}'
  + '.int-lnk{background:none;border:0;padding:0;margin-left:4px;font:inherit;font-size:12.5px;font-weight:700;color:#0B6B4F;text-decoration:underline;cursor:pointer;}'
  + '.cita-extra{margin-top:10px;display:flex;gap:8px;flex-wrap:wrap;align-items:center;}'
  + '.ag-btn{background:#fff;border:1px solid #D5DAE1;border-radius:9px;padding:8px 12px;font:inherit;font-size:12.5px;font-weight:700;color:#374151;cursor:pointer;display:inline-flex;align-items:center;gap:6px;text-decoration:none;min-height:36px;}'
  + '.ag-btn.pri{background:#1A56DB;border-color:#1A56DB;color:#fff;}'
  + '.ag-btn.osc{background:#0F1C3F;border-color:#0F1C3F;color:#fff;}'
  + '.ag-btn:focus-visible,.ag-d:focus-visible,.int-btn:focus-visible{outline:2px solid #1A56DB;outline-offset:2px;}'
  + '.ag-wrap{max-width:1040px;margin:0 auto;padding:24px 16px 90px;}'
  + '.ag-wrap h1{font-size:24px;font-weight:800;color:#111827;margin:0 0 4px;letter-spacing:-.3px;}'
  + '.ag-sub{font-size:13.5px;color:#4B5563;margin:0 0 18px;line-height:1.5;}'
  + '.ag-g{display:grid;grid-template-columns:minmax(0,340px) minmax(0,1fr);gap:18px;align-items:start;}'
  + '.ag-cal{background:#fff;border:1px solid #EAECF0;border-radius:16px;padding:14px;}'
  + '.ag-mes{display:flex;align-items:center;justify-content:space-between;gap:8px;margin-bottom:10px;}'
  + '.ag-mes b{font-size:15px;color:#111827;}'
  + '.ag-mes button{width:36px;height:36px;border-radius:9px;border:1px solid #E5E7EB;background:#fff;cursor:pointer;display:inline-flex;align-items:center;justify-content:center;color:#374151;}'
  + '.ag-sem,.ag-dias{display:grid;grid-template-columns:repeat(7,minmax(0,1fr));gap:4px;}'
  + '.ag-sem span{text-align:center;font-size:10.5px;font-weight:800;color:#9CA3AF;padding:4px 0;}'
  + '.ag-d{aspect-ratio:1;border:0;background:transparent;border-radius:10px;font:inherit;font-size:13px;font-weight:600;color:#374151;cursor:pointer;position:relative;display:flex;align-items:center;justify-content:center;}'
  + '.ag-d.fuera{color:#D1D5DB;cursor:default;}'
  + '.ag-d.hoy{box-shadow:inset 0 0 0 1.5px #1A56DB;color:#1A56DB;font-weight:800;}'
  + '.ag-d.con{background:#EEF3FE;color:#1A3A9B;font-weight:800;}'
  + '.ag-d.con:after{content:attr(data-n);position:absolute;top:3px;right:4px;font-size:9px;font-weight:800;color:#1A56DB;}'
  + '.ag-d.sel{background:#1A56DB;color:#fff;}.ag-d.sel:after{color:#fff;}'
  + '.ag-pie{font-size:12px;color:#6B7280;line-height:1.5;margin-top:10px;}'
  + '.ag-lt{display:flex;align-items:center;justify-content:space-between;gap:10px;margin:0 0 10px;flex-wrap:wrap;}'
  + '.ag-lt h2{font-size:15px;font-weight:800;color:#111827;margin:0;}'
  + '.ag-dia{font-size:11px;font-weight:800;letter-spacing:.6px;color:#6B7280;text-transform:uppercase;margin:16px 0 8px;}'
  + '.ag-dia:first-child{margin-top:0;}'
  + '.ag-it{display:flex;gap:14px;background:#fff;border:1px solid #EAECF0;border-radius:14px;padding:14px;margin-bottom:10px;}'
  + '.ag-it.cambio{border-color:#F5D9A8;background:#FFFBF2;}'
  + '.ag-h{flex-shrink:0;width:58px;text-align:center;border-right:1px solid #F1F3F5;padding-right:12px;}'
  + '.ag-h b{display:block;font-size:17px;font-weight:800;color:#111827;}.ag-h span{font-size:11px;color:#6B7280;}'
  + '.ag-c{flex:1;min-width:0;}'
  + '.ag-c > b{font-size:15px;color:#111827;}'
  + '.ag-c > span{display:block;font-size:12.5px;color:#4B5563;margin-top:2px;}'
  + '.ag-pill{display:inline-block;border-radius:99px;padding:3px 9px;font-size:11px;font-weight:800;margin-left:6px;vertical-align:1px;}'
  + '.ag-a{display:flex;gap:7px;flex-wrap:wrap;margin-top:10px;}'
  + '.ag-vacio{background:#fff;border:1px dashed #D8DEE9;border-radius:14px;padding:22px;text-align:center;font-size:13.5px;color:#4B5563;line-height:1.6;}'
  + '.ag-vacio b{display:block;color:#111827;font-size:15px;margin-bottom:4px;}'
  + '#inicio-agenda{background:#fff;border:1px solid #EAECF0;border-radius:16px;margin-bottom:16px;overflow:hidden;box-shadow:0 1px 4px rgba(0,0,0,.04);}'
  + '.ia-h{display:flex;justify-content:space-between;align-items:center;gap:10px;padding:13px 18px;border-bottom:1px solid #F1F3F5;}'
  + '.ia-h b{font-size:13px;font-weight:800;color:#111827;letter-spacing:.3px;}'
  + '.ia-f{display:flex;gap:12px;align-items:center;padding:11px 18px;border-top:1px solid #F7F8FA;cursor:pointer;background:none;border-left:0;border-right:0;border-bottom:0;width:100%;text-align:left;font:inherit;}'
  + '.ia-f:first-of-type{border-top:0;}'
  + '.ia-f i{font-style:normal;font-size:12px;font-weight:800;color:#1A3A9B;background:#EEF3FE;border-radius:8px;padding:6px 8px;white-space:nowrap;}'
  + '.ia-f span{flex:1;min-width:0;font-size:13.5px;color:#111827;font-weight:700;}'
  + '.ia-f small{display:block;font-size:12px;color:#6B7280;font-weight:500;}'
  + '.ocup{opacity:.38;text-decoration:line-through;pointer-events:none;}'
  + '@media(max-width:860px){.ag-g{grid-template-columns:minmax(0,1fr);}.ag-wrap{padding:18px 14px 110px;}}';
  document.head.appendChild(css);

  /* =============== 1. «ME INTERESA» =============== */
  function quedan(c){ try{ return window.CERCO_quedanDias ? CERCO_quedanDias(c) : null; }catch(x){ return null; } }
  function txtQuedan(q){ return q === null ? '' : (q <= 0 ? 'hoy se acaba el plazo' : (q === 1 ? 'te queda 1 día laborable' : 'te quedan ' + q + ' días laborables')); }
  window.CERCO_meInteresa = function(id, quitar){
    var c = buscar(id); if(!c || visita(c)) return;
    if(!abierta(c)){ abrirFichaCandidato(id); return; }
    if(!quitar && c.interesa){ abrirFichaCandidato(id); responderCandidato(id, 'entrevista'); return; }
    if(window._unaSolaVez && !window._unaSolaVez('int' + id, 1200)) return;
    var ahora = new Date().toISOString(), h = (c.historial || []).slice(), campos;
    if(quitar) campos = { interesa:false };
    else {
      if(c.estado === 'enviada') h.push({estado:'vista', fecha:ahora});
      h.push({estado:'interesa', fecha:ahora});
      campos = { interesa:true, interesaFecha:ahora, historial:h };
      if(c.estado === 'enviada') campos.estado = 'vista';
    }
    Nube.cambiarCandidatura(c, campos, null).then(function(){
      try{ CDB.renderTodo(); }catch(x){}
      if($('modal-cand')) abrirFichaCandidato(id, 'ver');
      if(quitar) aviso(nom(c) + ' vuelve a «Por contestar»');
      else aviso(nom(c) + ' pasa a «Me interesan». Ya ve que sigue en el proceso.', 'Ver «Me interesan»', function(){ CERCO_verEtapa('int'); });
    }).catch(function(){ aviso('No se ha podido guardar. Revisa tu conexión.'); });
  };
  function bloqueInteres(c){
    var id = e(c.id);
    if(c.interesa){
      var q = quedan(c), t = txtQuedan(q);
      return '<div class="int-box on"><b>'+ico(I.star,'#0E9F6E',14)+' Te interesa.</b> '+e(nom(c))+' ve que sigue en el proceso. '
        + (t ? t.charAt(0).toUpperCase() + t.slice(1) + ' para proponerle entrevista o cerrarlo con un motivo; después la solicitud se cierra sola.' : 'Proponle entrevista o ciérralo con un motivo.')
        + ' <button type="button" class="int-lnk" onclick="CERCO_meInteresa(\''+id+'\',true)">Quitar de «Me interesan»</button></div>';
    }
    return '<div class="int-box"><div><b>¿Te gusta pero aún no quieres citarle?</b><span>Márcalo: pasa a «Me interesan», '+e(nom(c))+' ve que sigue en el proceso y tú tienes 5 días laborables para decidir.</span></div>'
      + '<button type="button" class="int-btn" onclick="CERCO_meInteresa(\''+id+'\')">'+ico(I.star,'#0E9F6E',15)+'Me interesa</button></div>';
  }

  /* =============== 2. AGENDA =============== */
  var MODO = { video:'Videollamada', clinica:'En la clínica', tel:'Por teléfono' };
  var AG = { y:new Date().getFullYear(), m:new Date().getMonth(), dia:null };
  function citas(){
    // también las de quien ya está contratada: la entrevista sigue en la agenda
    return cands().filter(function(c){ return c.cita && c.cita.fecha && (c.estado === 'entrevista' || c.estado === 'contratada'); })
      .sort(function(a,b){ return new Date(a.cita.fecha) - new Date(b.cita.fecha); });
  }
  function clave(d){ d = new Date(d); return d.getFullYear() + '-' + ('0'+(d.getMonth()+1)).slice(-2) + '-' + ('0'+d.getDate()).slice(-2); }
  function hora(d){ d = new Date(d); return ('0'+d.getHours()).slice(-2) + ':' + ('0'+d.getMinutes()).slice(-2); }
  function diaLargo(d){ var t = new Date(d).toLocaleDateString('es-ES', {weekday:'long', day:'numeric', month:'long'}); return t.charAt(0).toUpperCase() + t.slice(1); }
  function valorada(c){ var v = ((leer('cerco_valoraciones', {})[c.id] || {}).v || []); return v.some(function(x){ return x > 0; }); }
  function pill(c){
    var t = c.cita.estado;
    if(c.estado === 'contratada') return '<span class="ag-pill" style="background:#E8F8F1;color:#0B6B4F;">Contratada</span>';
    return t === 'confirmada' ? '<span class="ag-pill" style="background:#E8F8F1;color:#0B6B4F;">Confirmada</span>'
      : t === 'cambio' ? '<span class="ag-pill" style="background:#FFF4E5;color:#B45309;">Pide otro día</span>'
      : '<span class="ag-pill" style="background:#F1F3F6;color:#4B5563;">Sin confirmar</span>';
  }
  // --- añadir al calendario ---
  function z(n){ return ('0'+n).slice(-2); }
  function utc(d){ d = new Date(d); return d.getUTCFullYear() + z(d.getUTCMonth()+1) + z(d.getUTCDate()) + 'T' + z(d.getUTCHours()) + z(d.getUTCMinutes()) + '00Z'; }
  function datosEvento(c){
    var t = c.cita, ini = new Date(t.fecha), fin = new Date(ini.getTime() + 30*60000);
    var que = (visita(c) ? 'Visita de ' : 'Entrevista con ') + (c.nombre || 'candidato') + (c.ofertaTitulo ? ' · ' + c.ofertaTitulo : '');
    var donde = t.modo === 'video' ? (t.sala || 'Videollamada') : (t.modo === 'tel' ? 'Por teléfono' + (c.telefono ? ': ' + c.telefono : '') : (t.lugar || 'En la clínica'));
    var det = 'Organizada con CERCO.' + (t.modo === 'video' && t.sala ? ' Sala: ' + t.sala : '') + (c.telefono ? ' Teléfono: ' + c.telefono + '.' : '');
    return { ini:ini, fin:fin, que:que, donde:donde, det:det, uid:'cerco-' + String(c.id).replace(/[^a-zA-Z0-9]/g,'') + '@cerco' };
  }
  function esc(t){ return String(t || '').replace(/\\/g,'\\\\').replace(/;/g,'\\;').replace(/,/g,'\\,').replace(/\n/g,'\\n'); }
  function ics(l){
    var out = ['BEGIN:VCALENDAR','VERSION:2.0','PRODID:-//CERCO//Agenda//ES','CALSCALE:GREGORIAN','METHOD:PUBLISH'];
    l.forEach(function(c){ var d = datosEvento(c);
      out.push('BEGIN:VEVENT','UID:' + d.uid,'DTSTAMP:' + utc(new Date()),'DTSTART:' + utc(d.ini),'DTEND:' + utc(d.fin),'SUMMARY:' + esc(d.que),'LOCATION:' + esc(d.donde),'DESCRIPTION:' + esc(d.det),
        'BEGIN:VALARM','TRIGGER:-PT30M','ACTION:DISPLAY','DESCRIPTION:' + esc(d.que),'END:VALARM','END:VEVENT'); });
    out.push('END:VCALENDAR');
    return out.join('\r\n');
  }
  function bajar(nombre, texto){
    try{
      var b = new Blob([texto], {type:'text/calendar;charset=utf-8'}), u = URL.createObjectURL(b), a = document.createElement('a');
      a.href = u; a.download = nombre; document.body.appendChild(a); a.click(); a.remove(); setTimeout(function(){ URL.revokeObjectURL(u); }, 4000);
      aviso('Archivo descargado: ábrelo y se añade a tu calendario');
    }catch(x){ aviso('Tu navegador no ha dejado descargar el archivo'); }
  }
  window.CERCO_icsCita = function(id){ var c = buscar(id); if(c && c.cita) bajar('entrevista-' + nom(c).toLowerCase().replace(/[^a-z0-9]/g,'') + '.ics', ics([c])); };
  window.CERCO_icsTodas = function(){ var l = citas().filter(function(c){ return new Date(c.cita.fecha) > new Date(Date.now() - 3600000); }); if(l.length) bajar('agenda-cerco.ics', ics(l)); };
  function google(c){ var d = datosEvento(c); return 'https://calendar.google.com/calendar/render?action=TEMPLATE&text=' + encodeURIComponent(d.que) + '&dates=' + utc(d.ini) + '/' + utc(d.fin) + '&location=' + encodeURIComponent(d.donde) + '&details=' + encodeURIComponent(d.det); }
  function botonesCal(c){
    return '<a class="ag-btn" href="'+e(google(c))+'" target="_blank" rel="noopener">'+ico(I.cal,'#374151',14)+'Google Calendar</a>'
      + '<button type="button" class="ag-btn" onclick="CERCO_icsCita(\''+e(c.id)+'\')">'+ico(I.down,'#374151',14)+'Apple u Outlook</button>';
  }
  function itemAgenda(c, pasada){
    var t = c.cita, id = e(c.id);
    return '<div class="ag-it'+(t.estado === 'cambio' ? ' cambio' : '')+'"><div class="ag-h"><b>'+hora(t.fecha)+'</b><span>30 min</span></div><div class="ag-c">'
      + '<b>'+e(c.nombre || 'Sin nombre')+'</b>'+pill(c)
      + '<span>'+(visita(c) ? 'Visita a la clínica' : 'Entrevista') + (c.ofertaTitulo ? ' · ' + e(c.ofertaTitulo) : '')+'</span>'
      + '<span style="display:flex;align-items:center;gap:6px;">'+ico(t.modo === 'video' ? I.video : (t.modo === 'tel' ? I.tel : I.pin),'#6B7280',13)+e(MODO[t.modo] || '')+(t.modo === 'clinica' && t.lugar ? ' · ' + e(t.lugar) : '')+(t.modo === 'tel' && c.telefono ? ' · ' + e(c.telefono) : '')+'</span>'
      + (t.estado === 'cambio' ? '<span style="color:#8A5A00;"><b>Pide otro día'+(t.msgCambio ? ':' : '.')+'</b> '+e(t.msgCambio || '')+'</span>' : '')
      + '<div class="ag-a">'
      + (pasada ? '<button type="button" class="ag-btn pri" onclick="CERCO_abrirDesdeAgenda(\''+id+'\')">Valorar la entrevista</button>'
          : (t.modo === 'video' && t.sala ? '<a class="ag-btn osc" href="'+e(t.sala)+'" target="_blank" rel="noopener">'+ico(I.video,'#fff',14)+'Entrar en la sala</a>' : ''))
      + '<button type="button" class="ag-btn" onclick="CERCO_abrirDesdeAgenda(\''+id+'\')">'+ico(I.user,'#374151',14)+'Abrir ficha</button>'
      + (pasada ? '' : '<button type="button" class="ag-btn" onclick="CERCO_abrirDesdeAgenda(\''+id+'\',true)">'+(t.estado === 'cambio' ? 'Proponer otro día' : 'Cambiar día u hora')+'</button>' + botonesCal(c))
      + '</div></div></div>';
  }
  window.CERCO_abrirDesdeAgenda = function(id, cambiar){ abrirFichaCandidato(id); if(cambiar) setTimeout(function(){ try{ programarCita(id); }catch(x){} }, 250); };
  window.CERCO_agMes = function(n){ if(n === 0){ var h = new Date(); AG.y = h.getFullYear(); AG.m = h.getMonth(); AG.dia = null; } else { var d = new Date(AG.y, AG.m + n, 1); AG.y = d.getFullYear(); AG.m = d.getMonth(); AG.dia = null; } pintarAgenda(); };
  window.CERCO_agDia = function(k){ AG.dia = AG.dia === k ? null : k; pintarAgenda(); };
  function pintarAgenda(){
    var box = $('agenda-box'); if(!box) return;
    var l = citas(), ahora = Date.now(), por = {};
    l.forEach(function(c){ var k = clave(c.cita.fecha); (por[k] = por[k] || []).push(c); });
    var prox = l.filter(function(c){ return new Date(c.cita.fecha).getTime() > ahora - 3600000; });
    var pas = l.filter(function(c){ return new Date(c.cita.fecha).getTime() <= ahora - 3600000 && !visita(c) && !valorada(c); });
    // calendario
    var primero = new Date(AG.y, AG.m, 1), ini = (primero.getDay() + 6) % 7, nDias = new Date(AG.y, AG.m + 1, 0).getDate(), hoy = clave(new Date());
    var dias = '';
    for(var i = 0; i < ini; i++) dias += '<span class="ag-d fuera" aria-hidden="true"></span>';
    for(var d = 1; d <= nDias; d++){
      var k = clave(new Date(AG.y, AG.m, d)), n = (por[k] || []).length;
      dias += '<button type="button" class="ag-d'+(k === hoy ? ' hoy' : '')+(n ? ' con' : '')+(AG.dia === k ? ' sel' : '')+'"'+(n ? ' data-n="'+n+'"' : '')+' aria-pressed="'+(AG.dia === k)+'" aria-label="'+d+(n ? ', ' + n + (n === 1 ? ' entrevista' : ' entrevistas') : '')+'" onclick="CERCO_agDia(\''+k+'\')">'+d+'</button>';
    }
    var mes = primero.toLocaleDateString('es-ES', {month:'long', year:'numeric'}); mes = mes.charAt(0).toUpperCase() + mes.slice(1);
    var cal = '<div class="ag-cal"><div class="ag-mes"><button type="button" aria-label="Mes anterior" onclick="CERCO_agMes(-1)">'+ico(I.izq,'#374151',16)+'</button><b>'+e(mes)+'</b><button type="button" aria-label="Mes siguiente" onclick="CERCO_agMes(1)">'+ico(I.der,'#374151',16)+'</button></div>'
      + '<div class="ag-sem" aria-hidden="true"><span>LU</span><span>MA</span><span>MI</span><span>JU</span><span>VI</span><span>SÁ</span><span>DO</span></div><div class="ag-dias">'+dias+'</div>'
      + '<div class="ag-pie">Los días en azul tienen entrevista; el número dice cuántas. Toca un día para ver solo las suyas.'
      + (prox.length ? '<div style="margin-top:10px;"><button type="button" class="ag-btn" onclick="CERCO_icsTodas()">'+ico(I.down,'#374151',14)+'Pasar todas a mi calendario</button></div>' : '')+'</div></div>';
    // lista
    var lista = '';
    if(AG.dia){
      var del = (por[AG.dia] || []);
      lista += '<div class="ag-lt"><h2>'+e(diaLargo(AG.dia + 'T12:00:00'))+'</h2><button type="button" class="ag-btn" onclick="CERCO_agDia(\''+AG.dia+'\')">Ver todas</button></div>';
      lista += del.length ? del.map(function(c){ return itemAgenda(c, new Date(c.cita.fecha).getTime() <= ahora - 3600000 && !visita(c)); }).join('')
        : '<div class="ag-vacio"><b>Día libre</b>No tienes ninguna entrevista este día.</div>';
    } else {
      lista += '<div class="ag-lt"><h2>Próximas entrevistas</h2>'+(prox.length ? '<span style="font-size:12.5px;color:#6B7280;font-weight:600;">'+prox.length+(prox.length === 1 ? ' programada' : ' programadas')+'</span>' : '')+'</div>';
      if(!prox.length) lista += '<div class="ag-vacio"><b>Todavía no tienes entrevistas</b>Se apuntan solas: en Candidatos, abre una ficha y pulsa «Invitar a entrevista». Eliges día, hora y cómo será; la persona lo recibe en CERCO y confirma o pide otro día.'
        + '<div style="margin-top:14px;"><button type="button" class="ag-btn pri" onclick="showScreen(\'portal\')">Ir a Candidatos</button></div></div>';
      else { var ult = ''; prox.forEach(function(c){ var k = clave(c.cita.fecha); if(k !== ult){ ult = k; lista += '<div class="ag-dia">'+(k === hoy ? 'Hoy · ' : '')+e(diaLargo(c.cita.fecha))+'</div>'; } lista += itemAgenda(c, false); }); }
      if(pas.length) lista += '<div class="ag-lt" style="margin-top:22px;"><h2>Pendientes de valorar</h2><span style="font-size:12.5px;color:#6B7280;font-weight:600;">'+pas.length+'</span></div>'
        + '<div style="font-size:12.5px;color:#6B7280;line-height:1.5;margin:-4px 0 10px;">Ya han pasado. Ponles nota con las 4 preguntas y decide: contratar, seguir o cerrar con un motivo.</div>'
        + pas.map(function(c){ return itemAgenda(c, true); }).join('');
    }
    box.innerHTML = '<div class="ag-wrap"><h1>Agenda</h1><p class="ag-sub">Tus entrevistas y visitas, en orden. Se apuntan solas cuando propones día y hora a un candidato, y cambian si te pide otro día.</p>'
      + '<div class="ag-g">'+cal+'<div>'+lista+'</div></div></div>';
  }
  window.CERCO_pintarAgenda = pintarAgenda;
  function montarAgenda(){
    if($('screen-agenda')) return;
    var ref = $('screen-herramientas'); if(!ref || !ref.parentElement) return;
    var s = document.createElement('div'); s.id = 'screen-agenda'; s.className = 'app-screen'; s.innerHTML = '<div id="agenda-box"></div>';
    ref.parentElement.insertBefore(s, ref);
    try{ MTAB_TITLES.agenda = 'Agenda'; }catch(x){}
    // menú de escritorio
    var it = document.querySelector('.shell-nav-item[data-screen="portal"]');
    if(it && !document.querySelector('.shell-nav-item[data-screen="agenda"]')){
      var n = it.cloneNode(true); n.dataset.screen = 'agenda'; n.classList.remove('active');
      var ic = n.querySelector('.shell-nav-icon'), lb = n.querySelector('.shell-nav-label');
      if(ic) ic.innerHTML = ico(I.cal,'currentColor',17); if(lb) lb.textContent = 'Agenda';
      [].forEach.call(n.querySelectorAll('.shell-nav-badge,[class*="badge"],[class*="count"]'), function(x){ x.remove(); });
      n.addEventListener('click', function(){ showScreen('agenda'); });
      it.parentElement.insertBefore(n, it.nextSibling);
    }
    // menú «Más» del móvil
    var ms = document.querySelector('#mobile-sheet .msheet-item');
    if(ms && !$('msheet-agenda')){
      var m = ms.cloneNode(false); m.id = 'msheet-agenda'; m.setAttribute('onclick', "mobileGo('agenda')");
      m.innerHTML = '<span class="msheet-ico">'+ico(I.cal,'currentColor',18)+'</span> Agenda de entrevistas';
      ms.parentElement.insertBefore(m, ms);
    }
  }
  // en la ficha: tras proponer día, qué pasa ahora y al calendario
  function extraCita(c){
    var t = c.cita; if(!t || c.estado !== 'entrevista') return '';
    var pasada = new Date(t.fecha) < new Date();
    return '<div class="cita-extra">' + (pasada ? '' : botonesCal(c))
      + '<button type="button" class="ag-btn" onclick="(function(){var m=document.getElementById(\'modal-cand\');if(m){m.remove();document.body.style.overflow=\'\';}showScreen(\'agenda\');})()">'+ico(I.cal,'#374151',14)+'Ver mi agenda</button></div>'
      + (pasada ? '' : '<div style="font-size:12.5px;color:#6B7280;line-height:1.5;margin-top:8px;">'
        + (t.estado === 'confirmada' ? 'Queda apuntada en tu agenda. ' + e(nom(c)) + ' ha confirmado que va.'
          : t.estado === 'cambio' ? e(nom(c)) + ' te ha pedido otro día: proponle uno nuevo con «Proponer otro día».'
          : 'Queda apuntada en tu agenda. ' + e(nom(c)) + ' la ve en CERCO y te confirmará o te pedirá otro día; te avisaremos aquí.') + '</div>');
  }
  // el programador no ofrece una hora que ya tienes ocupada
  var _dia = null;
  function marcarOcupadas(){
    try{
      var box = $('cand-acciones'); if(!box || !_dia) return;
      var k = clave(_dia), mias = citas().filter(function(c){ return clave(c.cita.fecha) === k && String(c.id) !== String(_pid); });
      if(!mias.length) return;
      [].forEach.call(box.querySelectorAll('button[onclick*="_citaSet(\'hora\'"]'), function(b){
        var h = (b.getAttribute('onclick').match(/'(\d\d:\d\d)'/) || [])[1];
        var c = mias.filter(function(x){ return hora(x.cita.fecha) === h; })[0];
        if(c){ b.classList.add('ocup'); b.disabled = true; b.title = 'Ya tienes entrevista con ' + (c.nombre || 'otra persona'); b.setAttribute('aria-label', h + ', ocupada: entrevista con ' + (c.nombre || 'otra persona')); }
      });
      if(!box.querySelector('.ocup-nota')){ var hh = box.querySelector('button.ocup'); if(hh && hh.parentElement) hh.parentElement.insertAdjacentHTML('afterend', '<div class="ocup-nota" style="font-size:12px;color:#6B7280;margin-top:6px;">Las horas tachadas ya las tienes ocupadas ese día.</div>'); }
    }catch(x){}
  }
  var _pid = null;
  // Las usan programarCita y _citaSet (clinica/04-clinica-y-candidato.js)
  window.CERCO_agendaCitas = {
    alProgramar: function(id){ _pid = id; _dia = null; },
    alElegir: function(k, v){ if(k === 'dia') _dia = v; },
    marcarOcupadas: marcarOcupadas
  };

  // Ficha: «Me interesa» y datos de la cita. La usa abrirFichaCandidato (clinica/02-solicitudes-reales.js)
  window.CERCO_fichaInteresYCita = function(id, modo){
    try{
      var c = buscar(id), box = $('cand-acciones'); if(!c || !box) return;
      if(abierta(c) && !visita(c) && !box.querySelector('.int-box')) box.insertAdjacentHTML('afterbegin', bloqueInteres(c));
      if(c.cita && c.estado === 'entrevista' && !box.querySelector('.cita-extra')){
        var ref = box.firstElementChild;
        if(ref) ref.insertAdjacentHTML('afterend', extraCita(c)); else box.insertAdjacentHTML('afterbegin', extraCita(c));
      }
    }catch(x){}
  };

  // Inicio: lo próximo de la agenda y quién tiene plazo en «Me interesan»
  // Inicio: próximas entrevistas y «Me interesan». Lo usa renderInicioReal (clinica/01-panel.js)
  window.CERCO_inicioAgenda = function(){
    try{
      var box = $('inicio-real'); if(!box) return;
      var v = $('inicio-agenda'); if(v) v.remove();
      var prox = citas().filter(function(c){ return new Date(c.cita.fecha).getTime() > Date.now() - 3600000; }).slice(0,3);
      var ints = cands().filter(function(c){ return abierta(c) && c.interesa && !visita(c); });
      if(!prox.length && !ints.length) return;
      var el = document.createElement('div'); el.id = 'inicio-agenda';
      var h = '';
      if(prox.length){
        h += '<div class="ia-h"><b>PRÓXIMAS ENTREVISTAS</b><button type="button" class="ag-btn" onclick="showScreen(\'agenda\')">Ver agenda</button></div>'
          + prox.map(function(c){ var d = new Date(c.cita.fecha), hoy = clave(d) === clave(new Date());
              return '<button type="button" class="ia-f" onclick="abrirFichaCandidato(\''+e(c.id)+'\')"><i>'+(hoy ? 'Hoy' : d.toLocaleDateString('es-ES',{weekday:'short', day:'numeric', month:'short'}))+' · '+hora(d)+'</i><span>'+e(c.nombre || '')+'<small>'+e(MODO[c.cita.modo] || '')+' · '+(c.estado === 'contratada' ? 'contratada' : c.cita.estado === 'confirmada' ? 'confirmada' : (c.cita.estado === 'cambio' ? 'pide otro día' : 'sin confirmar'))+'</small></span>'+ico(I.der,'#9CA3AF',16)+'</button>'; }).join('');
      }
      if(ints.length){
        var min = ints.map(quedan).filter(function(x){ return x !== null; }).sort(function(a,b){ return a-b; })[0];
        h += '<div class="ia-h"'+(prox.length ? ' style="border-top:1px solid #F1F3F5;"' : '')+'><b>ME INTERESAN · '+ints.length+'</b><button type="button" class="ag-btn" onclick="CERCO_verEtapa(\'int\')">Ver</button></div>'
          + '<div style="padding:11px 18px;font-size:13px;color:#4B5563;line-height:1.5;">'+ints.slice(0,3).map(function(c){ return e(c.nombre || ''); }).join(', ')+(ints.length > 3 ? ' y ' + (ints.length - 3) + ' más' : '')+'. '
          + (min !== undefined ? (min <= 1 ? '<b style="color:#B42318;">Al primero se le acaba el plazo ' + (min <= 0 ? 'hoy' : 'mañana') + '.</b>' : 'Al primero le quedan ' + min + ' días laborables.') : '') + ' Proponles entrevista o ciérralo con un motivo.</div>';
      }
      el.innerHTML = h;
      var ref = $('inicio-solicitudes');
      if(ref && ref.parentElement) ref.parentElement.insertBefore(el, ref.nextSibling);
      else box.insertBefore(el, box.querySelector('.inicio-kpis') ? box.querySelector('.inicio-kpis').nextSibling : box.firstChild);
    }catch(x){}
  };

  /* =============== 3. PANTALLAS DE MUESTRA =============== */
  // Las usa showScreen (clinica/01-panel.js)
  window.CERCO_agendaRedirigir = function(id){
    if(id === 'entrevista' && real()){
      var desde = (document.querySelector('.app-screen.active') || {}).id;
      id = 'agenda';
      if(desde === 'screen-candidat') setTimeout(function(){ aviso('Esa ficha es de ejemplo. Las entrevistas de verdad se programan desde la ficha de un candidato y quedan aquí.'); }, 300);
    }
    return id;
  };
  window.CERCO_agendaAlMostrar = function(){
    try{ pintarAgenda(); }catch(x){} try{ document.querySelectorAll('.shell-nav-item').forEach(function(n){ n.classList.toggle('active', n.dataset.screen === 'agenda'); }); }catch(x){}
  };
  // si cambian las solicitudes con la agenda abierta, se repinta
  var _todo = window.CDB && CDB.renderTodo;
  if(typeof _todo === 'function') CDB.renderTodo = function(){ var r = _todo.apply(this, arguments); try{ if(document.querySelector('#screen-agenda.active')) pintarAgenda(); }catch(x){} return r; };

  /* =============== 4. HERRAMIENTAS QUE DICEN LA VERDAD =============== */
  function herramienta(id, o){
    var c = $('tc-' + id); if(!c) return;
    var t = c.querySelector('.tool-title'), d = c.querySelector('.tool-desc'), bd = c.querySelector('.tool-badge'), mas = c.querySelector('.tc-more');
    if(o.t && t) t.textContent = o.t;
    if(o.d && d) d.textContent = o.d;
    if(bd && o.badge !== undefined){ if(o.badge) bd.textContent = o.badge; else bd.remove(); }
    if(mas){
      var filas = [].filter.call(mas.children, function(x){ return x.tagName === 'DIV' && x.children.length === 2 && /^\d$/.test((x.children[0].textContent || '').trim()); });
      (o.pasos || []).forEach(function(p, i){ if(filas[i]) filas[i].children[1].textContent = p; });
      for(var i = (o.pasos || []).length; o.pasos && i < filas.length; i++) filas[i].remove();
      var b = mas.querySelector('button'), nota = b ? b.previousElementSibling : null;
      if(o.nota && nota && filas.indexOf(nota) === -1) nota.textContent = o.nota;
      if(o.ir && b) b.setAttribute('onclick', 'event.stopPropagation(); ' + o.ir);
      if(o.boton && b) b.textContent = o.boton;
    }
  }
  function arreglarHerramientas(){
    herramienta('portal', { t:'Candidatos', badge:'', d:'Quienes han solicitado tus ofertas, ordenados por etapa (por contestar, me interesan, entrevistas…) y por profesión.',
      pasos:['Empieza por «Por contestar»: son las solicitudes que esperan tu respuesta.','Abre una tarjeta para ver el vídeo, el CV y la experiencia.','Decide: «Me interesa», invitar a entrevista o descartar con un motivo.','Filtra por nombre, por distancia a tu clínica o por profesión.'],
      nota:'Lo acordado en CERCO es contestar en 2 días laborables. A los 5, la solicitud se cierra sola y el candidato lo ve.' });
    herramienta('candidat', { t:'Ficha de un candidato', d:'Todo de una persona en una pantalla: vídeo, CV, experiencia, distancia y forma de trabajar, con las acciones para decidir.',
      pasos:['Abre cualquier candidato desde Candidatos.','Mira el vídeo y lee el CV sin descargarlo.','Marca «Me interesa» si quieres pensarlo: tienes 5 días laborables.','Invita a entrevista o descarta con un motivo: siempre recibe respuesta.'],
      nota:'La forma de trabajar (test) es orientativa: sirve para preparar la conversación, no para decidir por ti.', ir:"showScreen('portal')", boton:'Ir a Candidatos' });
    herramienta('testdisc', { d:'15 preguntas, unos 5 minutos. Tu forma de trabajar y la de tu equipo, con la misma regla que los candidatos.',
      pasos:['Haz el test tú primero.','Comparte el enlace con tu equipo: lo hacen desde el móvil.','Con 3 test o más, CERCO lee cómo está repartido el equipo.','Al publicar una oferta te propone qué formas de trabajar encajan.'] });
    herramienta('stats', { t:'Estadísticas', badge:'', d:'Cuánto tardas en contestar, cuántas solicitudes llegan a entrevista y cómo está repartido tu equipo.',
      pasos:['Arriba, tu contratación: solicitudes, respuestas y tiempos.','Debajo, por qué descartas: te dice qué cambiar en la oferta.','Y tu equipo, cuando al menos 3 personas hayan hecho el test.'],
      nota:'La mitad de los candidatos espera noticias en 3 días o menos: es la cifra que más conviene mirar.' });
    herramienta('crear-oferta', { t:'Redactar la oferta con Seimian', badge:'Seimian', d:'Escribe el puesto y unas palabras clave y Seimian te deja una descripción lista para retocar.',
      pasos:['Pulsa «Nueva oferta» y escribe el puesto y el municipio.','Marca horario, tareas del día a día y cómo será el proceso.','Pide a Seimian la descripción y ajústala a tu manera.','Publica: los profesionales de tu zona la ven al momento.'],
      nota:'El medidor de la oferta te dice cuántas de las 7 preguntas de un candidato contesta.' });
    herramienta('entrevista', { t:'Agenda de entrevistas', badge:'', d:'Todas tus entrevistas en un calendario: quién, cuándo, cómo, la sala de vídeo y si ha confirmado.',
      pasos:['Desde la ficha de un candidato, pulsa «Invitar a entrevista».','Elige día, hora y si es por vídeo, en la clínica o por teléfono.','La persona lo recibe en CERCO y confirma o pide otro día.','Después, valórala con las mismas 4 preguntas para todos.'],
      nota:'Puedes pasar cada entrevista a Google Calendar, Apple u Outlook con un toque.', ir:"showScreen('agenda')", boton:'Abrir mi agenda' });
    herramienta('ofertes', { pasos:['Revisa el estado de cada oferta de un vistazo.','Los avisos marcan las solicitudes que llevan tiempo sin respuesta.','Pausa una oferta si no quieres recibir más solicitudes por ahora.','Toca una oferta para ver solo sus candidatos.'] });
    herramienta('nueva', { d:'Publica una vacante en un par de minutos con lo que un candidato quiere saber.',
      pasos:['Escribe el puesto, el municipio y la jornada.','Pon el sueldo y marca horario, tareas y proceso.','Elige al menos dos formas de trabajar que encajen con el puesto.','Publica: empiezas a recibir solicitudes.'],
      nota:'La oferta se publica al momento y la ven los profesionales de tu zona en su portal.' });
    herramienta('publicat', { pasos:['Cuenta cómo es un día en vuestro equipo.','Marca lo que ofrecéis: formación, horario, parking…','Sube hasta 4 fotos de la clínica y del equipo.','Los candidatos lo ven dentro de cada oferta tuya.'],
      nota:'Una clínica que se enseña recibe solicitudes de gente que ya sabe dónde va.' });
    var hs = $('hub-search'); if(hs) hs.placeholder = 'Busca un candidato por nombre, puesto o habilidad';
  }

  function listo(){
    try{ montarAgenda(); }catch(x){}
    try{ arreglarHerramientas(); }catch(x){}
    try{ var u = $('co-ubicacion'); if(u) u.placeholder = 'Municipio de la clínica (ej.: Girona)'; var f = $('f-ciutat-onboarding'); if(f) f.placeholder = 'Escribe el municipio (ej.: Girona)'; }catch(x){}
  }
  if(document.readyState === 'loading') document.addEventListener('DOMContentLoaded', listo); else listo();
})();
(function(){
  var st = document.createElement('style');
  st.textContent = '.etapas{display:flex;gap:6px;overflow-x:auto;padding:2px 0 8px;margin:0 0 4px;scrollbar-width:none;-webkit-overflow-scrolling:touch;}'
  + '.etapas::-webkit-scrollbar{display:none;}'
  + '.etapa{flex-shrink:0;border:0;background:#EEF1F5;color:#374151;border-radius:10px;padding:9px 13px;font:inherit;font-size:13px;font-weight:700;cursor:pointer;min-height:40px;display:inline-flex;align-items:center;gap:7px;}'
  + '.etapa b{background:#fff;border-radius:99px;padding:1px 7px;font-size:11.5px;color:#111827;}'
  + '.etapa.on{background:#0F1C3F;color:#fff;}.etapa.on b{background:rgba(255,255,255,.18);color:#fff;}'
  + '.etapa.urg:not(.on) b{background:#FDE2E2;color:#B42318;}'
  + '.etapa:focus-visible{outline:2px solid #1A56DB;outline-offset:2px;}'
  + '.etapa-nota{font-size:12.5px;color:#4B5563;line-height:1.5;background:#F7F8FA;border-radius:10px;padding:9px 12px;margin:0 0 10px;}'
  + '.oculta-e{display:none !important;}'
  + '.int-tag{position:absolute;left:10px;bottom:10px;z-index:2;background:#0E9F6E;color:#fff;border-radius:99px;padding:4px 10px;font-size:11.5px;font-weight:800;box-shadow:0 1px 4px rgba(0,0,0,.2);}'
  + '.int-tag.urg{background:#B42318;}';
  document.head.appendChild(st);
})();

