/* Archivo sacado tal cual de index.html (Fase 1, paso 1.6). El orden de carga
   importa: se carga en el mismo sitio de la página donde estaba. */
/* ================================================================
   CERCO · TODO LO QUE PASA ENTRE CLÍNICA Y CANDIDATO
   Cada cosa que hace la clínica le llega al candidato, y al revés:
   - Entrevista o visita con día, hora y lugar; el candidato confirma
     o pide otro día, y la clínica lo ve.
   - Mensajes en los dos sentidos dentro de cada solicitud.
   - Contratar: avisa a la persona elegida, cierra la oferta y
     contesta a los demás para que nadie se quede esperando.
   - Cerrar o borrar una oferta con gente esperando: se les contesta.
   - Compromiso de 24 h: lo que se acerca o se pasa se marca.
   ================================================================ */
(function(){
  var DIAS = ['domingo','lunes','martes','miércoles','jueves','viernes','sábado'];
  var MESES = ['enero','febrero','marzo','abril','mayo','junio','julio','agosto','septiembre','octubre','noviembre','diciembre'];
  var MODO = { video:'Videollamada', clinica:'En la clínica', tel:'Por teléfono' };
  var L = ['D','I','S','C'], NOM = {D:'Dominante', I:'Influyente', S:'Estable', C:'Concienzudo'};
  var COL = {D:'#FF5A5F', I:'#F0A800', S:'#00B488', C:'#5B5FE0'};
  function e(t){ return _esc(t); }
  function lista(){ try{ return (window.CERCO_candidaturas ? CERCO_candidaturas() : []); }catch(x){ return []; } }
  function buscar(id){ var l = lista(); for(var i=0;i<l.length;i++) if(l[i].id === id) return l[i]; return null; }
  function guardarLista(l){ try{ localStorage.setItem('cerco_candidaturas', JSON.stringify(l)); }catch(x){} }
  function esVisita(c){ return c && c.tipo === 'visita'; }
  function primer(n){ return String(n||'').trim().split(/\s+/)[0] || ''; }
  window.fechaCita = function(iso){
    var d = new Date(iso); if(isNaN(d)) return '';
    return DIAS[d.getDay()] + ' ' + d.getDate() + ' de ' + MESES[d.getMonth()] + ' · ' + String(d.getHours()).padStart(2,'0') + ':' + String(d.getMinutes()).padStart(2,'0');
  };
  function ico(p, c, s){ return _svg(p, c, s); }
  var I = {
    cal:'<path d="M8 2v4"/><path d="M16 2v4"/><rect width="18" height="18" x="3" y="4" rx="2"/><path d="M3 10h18"/>',
    video:'<path d="m16 13 5.223 3.482a.5.5 0 0 0 .777-.416V7.87a.5.5 0 0 0-.752-.432L16 10.5"/><rect x="2" y="6" width="14" height="12" rx="2"/>',
    pin:'<path d="M20 10c0 4.993-5.539 10.193-7.399 11.799a1 1 0 0 1-1.202 0C9.539 20.193 4 14.993 4 10a8 8 0 0 1 16 0"/><circle cx="12" cy="10" r="3"/>',
    phone:'<path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/>',
    msg:'<path d="M7.9 20A9 9 0 1 0 4 16.1L2 22Z"/>',
    check:'<path d="M20 6 9 17l-5-5"/>',
    star:'<path d="M11.525 2.295a.53.53 0 0 1 .95 0l2.31 4.679a2.12 2.12 0 0 0 1.595 1.16l5.166.756a.53.53 0 0 1 .294.904l-3.736 3.638a2.12 2.12 0 0 0-.611 1.878l.882 5.14a.53.53 0 0 1-.771.56l-4.618-2.428a2.12 2.12 0 0 0-1.973 0L6.396 21.01a.53.53 0 0 1-.77-.56l.881-5.139a2.12 2.12 0 0 0-.611-1.879L2.16 9.795a.53.53 0 0 1 .294-.906l5.165-.755a2.12 2.12 0 0 0 1.597-1.16z"/>',
    list:'<path d="M3 12h.01"/><path d="M3 18h.01"/><path d="M3 6h.01"/><path d="M8 12h13"/><path d="M8 18h13"/><path d="M8 6h13"/>',
    alert:'<circle cx="12" cy="12" r="10"/><line x1="12" x2="12" y1="8" y2="12"/><line x1="12" x2="12.01" y1="16" y2="16"/>'
  };

  /* ---------- escribir en la solicitud ---------- */
  Nube.cambiarCandidatura = function(c, campos, estadoHist){
    var d = this.db(); if(!d) return Promise.reject('sin-nube');
    var ahora = new Date().toISOString();
    var cambio = Object.assign({}, campos, { actualizado: ahora });
    if(estadoHist){ var h = (c.historial || []).slice(); h.push({estado: estadoHist, fecha: ahora}); cambio.historial = h; }
    var ya = (c.historial || []).some(function(x){ return x.estado === 'entrevista' || x.estado === 'descartada' || x.estado === 'contratada'; });
    return d.collection('candidaturas').doc(c.id).update(cambio).then(function(){
      if(!ya && (cambio.estado === 'entrevista' || cambio.estado === 'descartada' || cambio.estado === 'contratada')){
        try{ d.collection('tiempos_respuesta').doc(c.id).set({respondida: ahora}, {merge:true}).catch(function(){}); }catch(x){}
      }
      var l = lista(); l.forEach(function(x){ if(x.id === c.id) Object.assign(x, cambio); }); guardarLista(l);
      return cambio;
    });
  };

  /* ---------- programar entrevista o visita ---------- */
  var P = {};
  function laborables(n){
    var out = [], d = new Date(); d.setHours(0,0,0,0);
    while(out.length < n){ d = new Date(d.getTime() + 86400000); if(d.getDay() !== 0 && d.getDay() !== 6) out.push(new Date(d)); }
    return out;
  }
  function salaNueva(){ try{ if(typeof _nombreSala === 'function') return 'https://meet.jit.si/' + _nombreSala(); }catch(x){} return 'https://meet.jit.si/cerco-' + Math.random().toString(36).slice(2,14) + Math.random().toString(36).slice(2,10); }
  function lugarClinica(){ var c = {}; try{ c = CDB.clinica() || {}; }catch(x){} return [c.nom, c.adreca || c.direccion, c.ciutat].filter(Boolean).join(', '); }
  function textoCita(c){
    var nombre = primer(c.nombre), cu = P.dia && P.hora ? fechaCita(isoCita()) : '';
    var v = esVisita(c);
    var donde = P.modo === 'video' ? 'Será por videollamada. Entra desde CERCO a esa hora; se abre en el navegador, no hace falta instalar nada.'
              : P.modo === 'tel' ? 'Te llamaremos por teléfono a esa hora.'
              : 'Te esperamos en ' + (P.lugar || 'la clínica') + '.';
    return 'Hola ' + nombre + ', ' + (v ? 'encantados de que quieras conocernos' : 'gracias por tu solicitud para ' + (c.ofertaTitulo || 'el puesto')) + '. '
      + (v ? 'Te proponemos ' : 'Nos gustaría hacerte una entrevista ') + (cu ? 'el ' + cu.replace(' · ', ' a las ') : '') + '. ' + donde
      + ' Confírmanos en CERCO si te va bien o pídenos otro día.';
  }
  function isoCita(){ var d = new Date(P.dia); var hm = P.hora.split(':'); d.setHours(+hm[0], +hm[1], 0, 0); return d.toISOString(); }
  function estBtn(on){ return 'border:1px solid '+(on?'#1A56DB':'#E5E7EB')+';background:'+(on?'#1A56DB':'white')+';color:'+(on?'white':'#374151')+';border-radius:9px;padding:8px 6px;font-size:12.5px;font-weight:700;cursor:pointer;font-family:inherit;'; }

  window.programarCita = function(id){
    var c = buscar(id), box = document.getElementById('cand-acciones'); if(!c || !box) return;
    var pref = String(c.modo || '').toLowerCase();
    P = { id:id, dia:null, hora:null, editado:false,
          modo: esVisita(c) ? (/video/.test(pref) ? 'video' : (/llamada/.test(pref) ? 'tel' : 'clinica')) : 'video',
          sala: (c.cita && c.cita.sala) || salaNueva(), lugar: (c.cita && c.cita.lugar) || lugarClinica() };
    pintarProgramador();
    try{ box.scrollIntoView({behavior:'smooth', block:'nearest'}); }catch(x){}
  };
  function pintarProgramador(){
    var c = buscar(P.id), box = document.getElementById('cand-acciones'); if(!c || !box) return;
    var v = esVisita(c), dias = laborables(10), horas = [];
    for(var h=9; h<=19; h++){ horas.push(String(h).padStart(2,'0')+':00'); if(h<19) horas.push(String(h).padStart(2,'0')+':30'); }
    var html = '<div style="border:1px solid #C9D6F5;border-radius:14px;padding:14px;background:#FBFCFF;">'
      + '<div style="font-size:14px;font-weight:800;color:#111827;margin-bottom:2px;">'+(v ? 'Proponer día para conocerla' : 'Programar la entrevista')+'</div>'
      + '<div style="font-size:12px;color:#6B7280;margin-bottom:12px;">'+e(primer(c.nombre))+' lo recibirá en CERCO y podrá confirmar o pedir otro día.</div>'
      + '<div style="font-size:11px;font-weight:800;letter-spacing:.5px;color:#6B7280;margin-bottom:6px;">DÍA</div>'
      + '<div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(64px,1fr));gap:6px;margin-bottom:12px;">'
      + dias.map(function(d){ var k = d.toISOString(), on = P.dia === k; return '<button type="button" onclick="_citaSet(\'dia\',\''+k+'\')" style="'+estBtn(on)+'line-height:1.25;"><span style="display:block;font-size:10.5px;opacity:.75;text-transform:uppercase;">'+DIAS[d.getDay()].slice(0,3)+'</span>'+d.getDate()+' '+MESES[d.getMonth()].slice(0,3)+'</button>'; }).join('')
      + '</div>'
      + '<div style="font-size:11px;font-weight:800;letter-spacing:.5px;color:#6B7280;margin-bottom:6px;">HORA</div>'
      + '<div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(62px,1fr));gap:6px;margin-bottom:12px;">'
      + horas.map(function(t){ return '<button type="button" onclick="_citaSet(\'hora\',\''+t+'\')" style="'+estBtn(P.hora===t)+'">'+t+'</button>'; }).join('')
      + '</div>'
      + '<div style="font-size:11px;font-weight:800;letter-spacing:.5px;color:#6B7280;margin-bottom:6px;">CÓMO</div>'
      + '<div style="display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:6px;margin-bottom:10px;">'
      + ['video','clinica','tel'].map(function(m){ return '<button type="button" onclick="_citaSet(\'modo\',\''+m+'\')" style="'+estBtn(P.modo===m)+'">'+MODO[m]+'</button>'; }).join('')
      + '</div>'
      + (P.modo === 'video' ? '<div style="background:#0F1C3F;border-radius:10px;padding:11px 12px;margin-bottom:10px;"><div style="font-size:10.5px;font-weight:800;letter-spacing:.6px;color:#8AB4FF;margin-bottom:5px;">SALA DE VÍDEO</div>'
          + '<input id="cita-sala" value="'+e(P.sala)+'" oninput="_citaCampo(\'sala\', this.value)" aria-label="Enlace de la videollamada" style="width:100%;box-sizing:border-box;background:rgba(255,255,255,.1);border:none;border-radius:8px;padding:9px 10px;color:white;font-size:12.5px;font-family:ui-monospace,Menlo,monospace;">'
          + '<div style="font-size:11px;color:rgba(255,255,255,.55);margin-top:6px;line-height:1.45;">Sala creada por CERCO, sin nombres en la dirección. Si prefieres tu Meet o tu Zoom, pega aquí su enlace.</div></div>' : '')
      + (P.modo === 'clinica' ? '<input id="cita-lugar" value="'+e(P.lugar)+'" oninput="_citaCampo(\'lugar\', this.value)" placeholder="Dirección de la clínica" aria-label="Dirección" style="width:100%;box-sizing:border-box;border:1px solid #E5E7EB;border-radius:9px;padding:10px 12px;font-size:13.5px;font-family:inherit;margin-bottom:10px;">' : '')
      + (P.modo === 'tel' ? '<div style="font-size:12.5px;color:#4B5563;background:#F8F9FA;border-radius:9px;padding:10px 12px;margin-bottom:10px;">Le llamarás al <b>'+e(c.telefono || 'teléfono de su perfil')+'</b>.</div>' : '')
      + '<div style="font-size:11px;font-weight:800;letter-spacing:.5px;color:#6B7280;margin-bottom:6px;">MENSAJE</div>'
      + '<textarea id="cita-msg" oninput="_citaCampo(\'msg\', this.value)" style="width:100%;box-sizing:border-box;min-height:100px;border:1px solid #E5E7EB;border-radius:10px;padding:10px 12px;font-size:13.5px;font-family:inherit;line-height:1.5;resize:vertical;">'+e(P.editado ? P.msg : (P.dia && P.hora ? textoCita(c) : ''))+'</textarea>'
      + '<div id="cita-err" style="font-size:12.5px;color:#DC2626;margin:6px 0;min-height:1px;"></div>'
      + '<div style="display:flex;gap:8px;"><button type="button" onclick="abrirFichaCandidato(\''+e(P.id)+'\',\'ver\')" style="flex:1;background:white;color:#374151;border:1px solid #E5E7EB;border-radius:10px;padding:12px;font-size:13.5px;font-weight:700;cursor:pointer;font-family:inherit;">Cancelar</button>'
      + '<button type="button" id="cita-ok" onclick="enviarCita()" style="flex:2;background:'+(v?'#66328A':'#1A56DB')+';color:white;border:none;border-radius:10px;padding:12px;font-size:13.5px;font-weight:800;cursor:pointer;font-family:inherit;">'+(c.cita ? 'Enviar nuevo día' : (v ? 'Enviar propuesta' : 'Enviar invitación'))+'</button></div>'
      + '</div>';
    box.innerHTML = html;
  }
  window._citaSet = function(k, v){ P[k] = v; pintarProgramador(); };
  window._citaCampo = function(k, v){ if(k === 'msg'){ P.msg = v; P.editado = true; } else { P[k] = v; if(!P.editado){ var t = document.getElementById('cita-msg'); var c = buscar(P.id); if(t && c && P.dia && P.hora) t.value = textoCita(c); } } };
  window.enviarCita = function(){
    var c = buscar(P.id); if(!c) return;
    var err = document.getElementById('cita-err');
    if(!P.dia) return err && (err.textContent = 'Elige el día.');
    if(!P.hora) return err && (err.textContent = 'Elige la hora.');
    if(P.modo === 'video' && !/^https?:\/\/\S+\.\S+/.test(P.sala||'')) return err && (err.textContent = 'Pega un enlace de videollamada que empiece por https://');
    if(P.modo === 'clinica' && !(P.lugar||'').trim()) return err && (err.textContent = 'Escribe la dirección de la clínica.');
    if(!window._unaSolaVez('cita', 1500)) return;
    var nota = ((document.getElementById('cita-msg')||{}).value || '').trim() || textoCita(c);
    var cita = { fecha: isoCita(), modo: P.modo, sala: P.modo === 'video' ? P.sala.trim() : '', lugar: P.modo === 'clinica' ? P.lugar.trim() : '', estado: 'propuesta', v: Date.now() };
    var b = document.getElementById('cita-ok'); if(b){ b.disabled = true; b.textContent = 'Enviando…'; }
    var campos = { cita: cita, nota: nota };
    if(c.estado !== 'entrevista') campos.estado = 'entrevista';
    Nube.cambiarCandidatura(c, campos, c.estado !== 'entrevista' ? 'entrevista' : 'cita').then(function(){
      if(typeof showToast === 'function') showToast((esVisita(c) ? 'Propuesta enviada a ' : 'Invitación enviada a ') + (c.nombre || ''));
      try{ CDB.renderTodo(); }catch(x){}
      abrirFichaCandidato(P.id, 'ver');
    }).catch(function(){ if(b){ b.disabled = false; b.textContent = 'Volver a enviar'; } if(err) err.textContent = 'No se ha podido enviar. Revisa tu conexión.'; });
  };

  /* ---------- preguntas para la entrevista, según su perfil ---------- */
  var PREG = {
    D:['Cuéntame una vez que tuviste que decidir rápido con un paciente. ¿Qué hiciste?','¿Cómo reaccionas cuando alguien del equipo no sigue tu ritmo?'],
    I:['¿Cómo tranquilizas a un paciente con miedo al dentista?','Háblame de una vez que tu forma de comunicar evitó un problema.'],
    S:['¿Qué haces cuando la agenda se complica y todos van con prisa?','¿Cómo te adaptas a un cambio de protocolo que no te convence?'],
    C:['¿Cómo te aseguras de no saltarte ningún paso de esterilización?','Cuéntame un error que detectaste antes que nadie.']
  };
  var OJO = {
    D:'puede ir más rápido que el equipo: pregunta cómo escucha a los demás.',
    I:'puede sacrificar el detalle por la conversación: pregunta por protocolos.',
    S:'le cuestan los cambios bruscos: pregunta cómo lleva los días imprevisibles.',
    C:'puede ser muy exigente: pregunta cómo trata los errores de otros.'
  };
  function preguntas(c){
    var d = c.disc; if(!d) return '';
    var ps = (c.perfiles || []).filter(function(x){ return L.indexOf(x) > -1; });
    var falta = null; try{ var q = CDB.perfilQueFalta(); if(q && q.fiable) falta = q.falta; }catch(x){}
    var l = [PREG[d.dom][0], PREG[d.sec][0], PREG[d.dom][1]];
    ps.forEach(function(k){ if(k !== d.dom && k !== d.sec) l.push(PREG[k][0]); });
    if(falta && falta !== d.dom && falta !== d.sec) l.push(PREG[falta][1]);
    return '<details style="border:1px solid #EAECF0;border-radius:12px;padding:0 14px;margin-top:10px;"><summary style="cursor:pointer;padding:12px 0;font-size:13.5px;font-weight:800;color:#111827;display:flex;align-items:center;gap:8px;">'+ico(I.list,'#1A56DB',15)+'Preguntas para la entrevista</summary>'
      + '<ol style="margin:0 0 10px;padding-left:20px;font-size:13.5px;color:#374151;line-height:1.55;display:grid;gap:6px;">' + l.slice(0,5).map(function(x){ return '<li>'+e(x)+'</li>'; }).join('') + '</ol>'
      + '<div style="font-size:12.5px;color:#4B5563;background:#F8F9FA;border-radius:9px;padding:9px 11px;margin-bottom:12px;line-height:1.5;"><b>Ojo:</b> perfil '+NOM[d.dom].toLowerCase()+', '+OJO[d.dom]+'</div></details>';
  }

  /* ---------- lo que se ve de la cita en la ficha ---------- */
  function bloqueCita(c){
    var t = c.cita; if(!t) return '';
    var est = t.estado === 'confirmada' ? '<span style="background:#E8F8F1;color:#0E9F6E;border-radius:99px;padding:3px 9px;font-size:11px;font-weight:800;">Confirmada</span>'
            : t.estado === 'cambio' ? '<span style="background:#FFF4E5;color:#B45309;border-radius:99px;padding:3px 9px;font-size:11px;font-weight:800;">Pide otro día</span>'
            : '<span style="background:#F1F3F6;color:#4B5563;border-radius:99px;padding:3px 9px;font-size:11px;font-weight:800;">Sin confirmar</span>';
    var pasada = new Date(t.fecha) < new Date();
    var h = '<div style="border:1px solid '+(t.estado==='cambio'?'#F5D9A8':'#BFE9D7')+';background:'+(t.estado==='cambio'?'#FFFBF2':'#F3FBF7')+';border-radius:12px;padding:12px 14px;">'
      + '<div style="display:flex;justify-content:space-between;align-items:center;gap:8px;flex-wrap:wrap;margin-bottom:6px;"><div style="font-size:13px;font-weight:800;color:#111827;display:flex;align-items:center;gap:7px;">'+ico(I.cal,'#0E9F6E',15)+(esVisita(c)?'Visita':'Entrevista')+(pasada?' (ya pasó)':'')+'</div>'+est+'</div>'
      + '<div style="font-size:14px;font-weight:700;color:#111827;">'+e(fechaCita(t.fecha).replace(/^./, function(x){ return x.toUpperCase(); }))+'</div>'
      + '<div style="font-size:12.5px;color:#4B5563;margin-top:2px;display:flex;align-items:center;gap:6px;">'+ico(t.modo==='video'?I.video:(t.modo==='tel'?I.phone:I.pin),'#6B7280',13)+e(MODO[t.modo]||'')+(t.lugar ? ' · '+e(t.lugar) : '')+'</div>'
      + (t.estado === 'cambio' && t.msgCambio ? '<div style="font-size:13px;color:#8A5A00;margin-top:8px;line-height:1.5;"><b>Su mensaje:</b> '+e(t.msgCambio)+'</div>' : '')
      + '<div style="display:flex;gap:8px;flex-wrap:wrap;margin-top:10px;">'
      + (t.modo === 'video' && t.sala ? '<a href="'+e(t.sala)+'" target="_blank" rel="noopener" style="background:#0F1C3F;color:white;border-radius:9px;padding:8px 12px;font-size:12.5px;font-weight:700;text-decoration:none;display:inline-flex;align-items:center;gap:6px;">'+ico(I.video,'white',13)+'Entrar en la sala</a>' : '')
      + '<button type="button" onclick="programarCita(\''+e(c.id)+'\')" style="background:white;border:1px solid #E5E7EB;border-radius:9px;padding:8px 12px;font-size:12.5px;font-weight:700;color:#374151;cursor:pointer;font-family:inherit;">'+(t.estado==='cambio'?'Proponer otro día':'Cambiar día u hora')+'</button>'
      + '</div></div>';
    return h;
  }

  /* ---------- mensajes ---------- */
  var VISTOS_K = 'cerco_msg_vistos';
  function vistos(){ try{ return JSON.parse(localStorage.getItem(VISTOS_K) || '{}'); }catch(x){ return {}; } }
  function marcarVistos(c){ var v = vistos(); v[c.id] = (c.mensajes || []).length; try{ localStorage.setItem(VISTOS_K, JSON.stringify(v)); }catch(x){} }
  window.mensajesSinLeer = function(c){ var m = (c.mensajes || []), v = vistos()[c.id] || 0; return m.slice(v).filter(function(x){ return x.de === 'candidato'; }).length; };
  function bloqueMensajes(c){
    if(c.estado === 'retirada') return '';
    var m = c.mensajes || [];
    var h = '<div style="border-top:1px solid #F3F4F6;margin-top:16px;padding-top:14px;"><div style="font-size:13px;font-weight:800;color:#374151;margin-bottom:8px;display:flex;align-items:center;gap:7px;">'+ico(I.msg,'#374151',14)+'Mensajes con '+e(primer(c.nombre))+'</div>'
      + '<div id="ficha-msgs" style="display:flex;flex-direction:column;gap:6px;max-height:240px;overflow-y:auto;margin-bottom:8px;">'
      + (m.length ? m.map(function(x){ var mio = x.de === 'clinica'; return '<div style="align-self:'+(mio?'flex-end':'flex-start')+';max-width:85%;background:'+(mio?'#1A56DB':'#F1F3F6')+';color:'+(mio?'white':'#111827')+';border-radius:12px;padding:8px 11px;font-size:13px;line-height:1.5;white-space:pre-line;overflow-wrap:anywhere;">'+e(x.t)+'<div style="font-size:10.5px;opacity:.65;margin-top:3px;">'+e(hace2(x.f))+'</div></div>'; }).join('')
                 : '<div style="font-size:12.5px;color:#6B7280;">Todavía no os habéis escrito. Lo que escribas aquí le llega en CERCO.</div>')
      + '</div>'
      + '<form onsubmit="event.preventDefault(); enviarMensajeClinica(\''+e(c.id)+'\')" style="display:flex;gap:6px;"><input id="ficha-msg-in" maxlength="600" placeholder="Escribe a '+e(primer(c.nombre))+'…" aria-label="Mensaje" style="flex:1;min-width:0;border:1px solid #E5E7EB;border-radius:10px;padding:10px 12px;font-size:13.5px;font-family:inherit;">'
      + '<button type="submit" style="background:#1A56DB;color:white;border:none;border-radius:10px;padding:0 14px;font-size:13px;font-weight:800;cursor:pointer;font-family:inherit;">Enviar</button></form></div>';
    return h;
  }
  function hace2(iso){ var m = Math.round((Date.now() - new Date(iso))/60000); if(m < 1) return 'ahora'; if(m < 60) return 'hace ' + m + ' min'; var h = Math.round(m/60); if(h < 24) return 'hace ' + h + ' h'; var d = Math.round(h/24); return d === 1 ? 'ayer' : 'hace ' + d + ' días'; }
  window.enviarMensajeClinica = function(id){
    var c = buscar(id), i = document.getElementById('ficha-msg-in'); if(!c || !i) return;
    var t = (i.value || '').trim(); if(!t || !window._unaSolaVez('msgC', 600)) return;
    var m = (c.mensajes || []).concat([{de:'clinica', t:t.slice(0,600), f:new Date().toISOString()}]).slice(-100);
    i.value = '';
    Nube.cambiarCandidatura(c, {mensajes: m}).then(function(){ marcarVistos(buscar(id)); abrirFichaCandidato(id, 'ver'); setTimeout(function(){ var b = document.getElementById('ficha-msgs'); if(b) b.scrollTop = b.scrollHeight; var ii = document.getElementById('ficha-msg-in'); if(ii) try{ ii.focus({preventScroll:true}); }catch(x){} }, 30); })
      .catch(function(){ i.value = t; if(typeof showToast === 'function') showToast('No se ha podido enviar. Revisa tu conexión.'); });
  };

  /* ---------- contratar ---------- */
  window.abrirContratar = function(id){
    var c = buscar(id), box = document.getElementById('cand-acciones'); if(!c || !box) return;
    var otros = lista().filter(function(x){ return x.ofertaId === c.ofertaId && x.candidatoUid !== c.candidatoUid && ['enviada','vista','entrevista'].indexOf(x.estado) > -1; });
    var clinica = ''; try{ clinica = CDB.nombreClinica(); }catch(x){}
    box.innerHTML = '<div style="border:1px solid #A7E3C9;background:#F3FBF7;border-radius:14px;padding:14px;">'
      + '<div style="font-size:15px;font-weight:800;color:#0B5B43;margin-bottom:6px;">¿Contratas a '+e(c.nombre)+'?</div>'
      + '<div style="font-size:13px;color:#374151;line-height:1.6;margin-bottom:10px;">Al confirmar: le avisamos con tu mensaje, la oferta <b>'+e(c.ofertaTitulo||'')+'</b> pasa a Cerradas'
      + (otros.length ? ' y las <b>'+otros.length+'</b> personas que esperaban respuesta reciben un aviso para que no se queden esperando.' : '.') + ' Después, en «Contratados», le envías el contrato y las condiciones por CERCO.</div>'
      + '<textarea id="hire-msg" style="width:100%;box-sizing:border-box;min-height:90px;border:1px solid #CDEBDD;border-radius:10px;padding:10px 12px;font-size:13.5px;font-family:inherit;line-height:1.5;">'+e('¡Hola ' + primer(c.nombre) + '! Queremos que te unas a ' + (clinica || 'nuestro equipo') + ' como ' + (c.ofertaTitulo || 'parte del equipo') + '. Te llamamos para concretar la incorporación.')+'</textarea>'
      + '<div id="hire-err" style="font-size:12.5px;color:#DC2626;margin:6px 0;min-height:1px;"></div>'
      + '<div style="display:flex;gap:8px;"><button type="button" onclick="abrirFichaCandidato(\''+e(id)+'\',\'ver\')" style="flex:1;background:white;color:#374151;border:1px solid #E5E7EB;border-radius:10px;padding:12px;font-size:13.5px;font-weight:700;cursor:pointer;font-family:inherit;">Cancelar</button>'
      + '<button type="button" id="hire-ok" onclick="confirmarContratar(\''+e(id)+'\')" style="flex:2;background:#059669;color:white;border:none;border-radius:10px;padding:12px;font-size:13.5px;font-weight:800;cursor:pointer;font-family:inherit;">Sí, contratar</button></div></div>';
  };
  function avisoCubierta(x){ return 'Hola ' + primer(x.nombre) + ', gracias por tu interés en ' + (x.ofertaTitulo || 'el puesto') + '. La clínica ya ha cubierto la plaza. Te deseamos mucha suerte: sigue mirando ofertas en CERCO.'; }
  function contestarPendientes(ofertaId, excepto, texto){
    var exc = excepto ? buscar(excepto) : null;
    var pend = lista().filter(function(x){ return x.ofertaId === ofertaId && x.id !== excepto && !(exc && x.candidatoUid === exc.candidatoUid) && ['enviada','vista','entrevista'].indexOf(x.estado) > -1; });
    return Promise.all(pend.map(function(x){ return Nube.cambiarCandidatura(x, { estado:'descartada', nota: texto ? texto(x) : avisoCubierta(x) }, 'descartada').catch(function(){}); })).then(function(){ return pend.length; });
  }
  window.confirmarContratar = function(id){
    var c = buscar(id); if(!c || !window._unaSolaVez('hire', 2000)) return;
    var b = document.getElementById('hire-ok'); if(b){ b.disabled = true; b.textContent = 'Guardando…'; }
    var nota = ((document.getElementById('hire-msg')||{}).value || '').trim();
    Nube.cambiarCandidatura(c, { estado:'contratada', nota: nota }, 'contratada').then(function(){
      return contestarPendientes(c.ofertaId, c.id);
    }).then(function(n){
      try{ window.__noAvisarCierre = true; cambiarEstadoOferta(c.ofertaId, 'cerrada'); }catch(x){} window.__noAvisarCierre = false;
      if(typeof showToast === 'function') showToast(c.nombre + ' contratada' + (n ? '. Hemos avisado a ' + n + ' persona' + (n>1?'s':'') + ' más.' : '.'));
      try{ CDB.renderTodo(); }catch(x){}
      if(window.CERCO_trasContratar) CERCO_trasContratar(id); else abrirFichaCandidato(id, 'ver');
    }).catch(function(){ if(b){ b.disabled = false; b.textContent = 'Sí, contratar'; } var er = document.getElementById('hire-err'); if(er) er.textContent = 'No se ha podido guardar. Revisa tu conexión.'; });
  };

  /* ---------- la ficha: acciones según el momento ---------- */
  var _fichaOrig = window.abrirFichaCandidato;
  window.abrirFichaCandidato = function(id, modo){
    var r = _fichaOrig.apply(this, arguments);
    var c = buscar(id), box = document.getElementById('cand-acciones'); if(!c || !box) return r;
    marcarVistos(c);
    var extra = '';
    if(c.estado === 'entrevista'){
      extra = bloqueCita(c);
      if(!c.cita) extra = '<div style="background:#E8F8F1;border-radius:10px;padding:12px 14px;font-size:13px;color:#0B5B43;line-height:1.55;white-space:pre-line;"><b>'+(esVisita(c)?'Le has propuesto una visita.':'Le has invitado a una entrevista.')+'</b>'+(c.nota ? '\n'+e(c.nota) : '')+'</div>'
          + '<button type="button" onclick="programarCita(\''+e(c.id)+'\')" style="width:100%;margin-top:8px;background:white;border:1px solid #E5E7EB;border-radius:10px;padding:11px;font-size:13.5px;font-weight:700;color:#1A56DB;cursor:pointer;font-family:inherit;">Poner día y hora</button>';
      if(!esVisita(c)) extra += preguntas(c);
      extra += '<div style="display:flex;gap:8px;margin-top:10px;">'
        + '<button type="button" onclick="responderCandidato(\''+e(c.id)+'\',\'descartada\')" style="flex:1;background:white;color:#6B7280;border:1px solid #E5E7EB;border-radius:10px;padding:12px;font-size:13.5px;font-weight:700;cursor:pointer;font-family:inherit;">'+(esVisita(c)?'Ahora no':'Descartar')+'</button>'
        + (esVisita(c) ? '' : '<button type="button" onclick="abrirContratar(\''+e(c.id)+'\')" style="flex:2;background:#059669;color:white;border:none;border-radius:10px;padding:12px;font-size:13.5px;font-weight:800;cursor:pointer;font-family:inherit;display:inline-flex;align-items:center;justify-content:center;gap:7px;">'+ico(I.check,'white',15)+'Contratar</button>')
        + '</div>';
      box.innerHTML = extra;
    } else if(c.estado === 'contratada'){
      box.innerHTML = '<div style="background:#E8F8F1;border-radius:10px;padding:12px 14px;font-size:13px;color:#0B5B43;line-height:1.55;white-space:pre-line;"><b>Contratada.</b> La oferta está cerrada.'+(c.nota ? '\nTu mensaje: '+e(c.nota) : '')+'</div>';
    }
    // la cita y las 24 h también cuando aún no se ha contestado
    if(c.estado === 'enviada' || c.estado === 'vista'){
      var hh = window._hHab ? _hHab(c) : (Date.now() - new Date(c.fecha)) / 3600000;
      if(hh >= 36){
        box.insertAdjacentHTML('afterbegin', '<div style="display:flex;gap:8px;align-items:flex-start;background:'+(hh>=48?'#FEF2F2':'#FFFBEB')+';color:'+(hh>=48?'#B42318':'#8A5A00')+';border-radius:10px;padding:10px 12px;font-size:12.5px;line-height:1.5;margin-bottom:10px;">'+ico(I.alert, hh>=48?'#B42318':'#8A5A00', 15)
          + '<span>'+(hh>=48 ? 'Lleva más de <b>2 días laborables</b> esperando. El candidato ya lo ve como fuera de plazo.' : 'Quedan <b>'+Math.max(1, Math.round(48-hh))+' h laborables</b> para contestar dentro del plazo de 2 días.')+'</span></div>');
      }
    }
    box.insertAdjacentHTML('afterend', bloqueMensajes(c));
    setTimeout(function(){ var b = document.getElementById('ficha-msgs'); if(b) b.scrollTop = b.scrollHeight; }, 20);
    return r;
  };
  // "Invitar a entrevista" y "Proponer visita" pasan por el día y la hora
  var _respOrig = window.responderCandidato;
  window.responderCandidato = function(id, estado){
    if(estado === 'entrevista') return programarCita(id);
    return _respOrig.apply(this, arguments);
  };

  /* ---------- estados nuevos en las tarjetas ---------- */
  var _renderPortal = window.renderPortalReal;
  window.renderPortalReal = function(){
    var r; try{ r = _renderPortal && _renderPortal.apply(this, arguments); }catch(x){}
    try{
      document.querySelectorAll('#portal-reales .cand-real').forEach(function(card){
        var c = buscar(card.dataset.id); if(!c) return;
        var extra = [];
        var n = mensajesSinLeer(c);
        if(n) extra.push('<span style="background:#1A56DB;color:white;border-radius:99px;padding:2px 8px;font-size:11px;font-weight:800;">'+n+' mensaje'+(n>1?'s':'')+'</span>');
        if(c.estado === 'contratada') extra.push('<span style="background:#059669;color:white;border-radius:99px;padding:2px 8px;font-size:11px;font-weight:800;">Contratada</span>');
        if(c.cita && c.estado === 'entrevista') extra.push('<span style="background:'+(c.cita.estado==='confirmada'?'#E8F8F1':(c.cita.estado==='cambio'?'#FFF4E5':'#F1F3F6'))+';color:'+(c.cita.estado==='confirmada'?'#0E9F6E':(c.cita.estado==='cambio'?'#B45309':'#4B5563'))+';border-radius:99px;padding:2px 8px;font-size:11px;font-weight:800;text-transform:none;">'+e(fechaCita(c.cita.fecha).split(' · ')[0])+' · '+(c.cita.estado==='confirmada'?'confirmada':(c.cita.estado==='cambio'?'pide otro día':'sin confirmar'))+'</span>');
        if(c.estado === 'enviada' || c.estado === 'vista'){
          var hh = window._hHab ? _hHab(c) : (Date.now() - new Date(c.fecha)) / 3600000;
          if(hh >= 36) extra.push('<span style="background:'+(hh>=48?'#FEF2F2':'#FFFBEB')+';color:'+(hh>=48?'#B42318':'#8A5A00')+';border-radius:99px;padding:2px 8px;font-size:11px;font-weight:800;">'+(hh>=48?'Más de 2 días sin respuesta':'Quedan '+Math.max(1,Math.round(48-hh))+' h')+'</span>');
        }
        if(extra.length){
          var fila = card.querySelector('.cand-extra');
          if(!fila){ fila = document.createElement('div'); fila.className = 'cand-extra'; fila.style.cssText = 'display:flex;gap:6px;flex-wrap:wrap;margin-top:6px;'; var body = card.children[1]; if(body){ var ac = body.querySelector('.card-actions'); if(ac){ fila.style.margin = '0 0 10px'; body.insertBefore(fila, ac); } else body.appendChild(fila); } }
          fila.innerHTML = extra.join('');
        }
      });
      // "Recomendados para mi equipo" también ordena los candidatos reales
      var lst = document.getElementById('portal-reales-lista');
      if(lst && typeof ordenRecomendados_portal !== 'undefined' && ordenRecomendados_portal){
        var d = CDB.perfilQueFalta();
        if(d && d.fiable){
          var cards = [].slice.call(lst.children);
          cards.sort(function(a,b){ var ca = buscar(a.dataset.id), cb = buscar(b.dataset.id); var pa = ca && ca.disc ? [d.falta, d.segona].indexOf(ca.disc.dom) : -1, pb = cb && cb.disc ? [d.falta, d.segona].indexOf(cb.disc.dom) : -1; pa = pa < 0 ? 9 : pa; pb = pb < 0 ? 9 : pb; return pa - pb; });
          cards.forEach(function(x){ lst.appendChild(x); var c = buscar(x.dataset.id); var pos = c && c.disc ? [d.falta, d.segona].indexOf(c.disc.dom) : -1;
            var v = x.querySelector('.rec-real'); if(v) v.remove();
            if(pos > -1){ var t = document.createElement('div'); t.className = 'rec-real'; t.style.cssText = 'margin-top:6px;font-size:12px;color:#0B6B4F;background:#E8F8F1;border-radius:8px;padding:6px 9px;'; t.innerHTML = '<b>Te lo recomiendo:</b> es '+NOM[c.disc.dom]+', el '+(pos===0?'perfil que más':'segundo que más')+' le falta a tu equipo.'; var body = x.children[1]; if(body){ var ac2 = body.querySelector('.card-actions'); if(ac2){ t.style.margin = '0 0 10px'; body.insertBefore(t, ac2); } else body.appendChild(t); } }
          });
        }
      }
    }catch(x){}
    return r;
  };

  /* ---------- Inicio: próxima cita y respuestas del candidato ---------- */
  var _inicio = window.renderInicioReal;
  window.renderInicioReal = function(){
    var r; try{ r = _inicio && _inicio.apply(this, arguments); }catch(x){}
    try{
      var box = document.getElementById('inicio-real'); if(!box || box.style.display === 'none') return r;
      var vell = document.getElementById('inicio-citas'); if(vell) vell.remove();
      var ahora = Date.now();
      var citas = lista().filter(function(c){ return c.estado === 'entrevista' && c.cita && new Date(c.cita.fecha).getTime() > ahora - 3600000; })
        .sort(function(a,b){ return new Date(a.cita.fecha) - new Date(b.cita.fecha); });
      var msgs = lista().filter(function(c){ return mensajesSinLeer(c) > 0; });
      if(!citas.length && !msgs.length) return r;
      var el = document.createElement('div'); el.id = 'inicio-citas';
      el.style.cssText = 'background:white;border:1px solid #EAECF0;border-radius:16px;overflow:hidden;margin-bottom:16px;box-shadow:0 1px 4px rgba(0,0,0,.04);';
      var h = '<div style="padding:14px 18px;border-bottom:1px solid #F3F4F6;font-size:13px;font-weight:800;color:#111827;letter-spacing:.3px;">PRÓXIMAS CITAS Y MENSAJES</div>';
      citas.slice(0,4).forEach(function(c){
        var t = c.cita, col = t.estado==='confirmada'?'#0E9F6E':(t.estado==='cambio'?'#B45309':'#6B7280');
        h += '<div onclick="abrirFichaCandidato(\''+e(c.id)+'\')" style="display:flex;align-items:center;gap:12px;padding:12px 18px;border-top:1px solid #F3F4F6;cursor:pointer;">'
          + '<div style="width:38px;height:38px;border-radius:10px;background:#EEF3FE;display:flex;align-items:center;justify-content:center;flex-shrink:0;">'+ico(I.cal,'#1A56DB',17)+'</div>'
          + '<div style="flex:1;min-width:0;"><div style="font-size:14px;font-weight:800;color:#111827;">'+e(c.nombre)+' <span style="font-size:12px;font-weight:700;color:'+col+';">'+(t.estado==='confirmada'?'Confirmada':(t.estado==='cambio'?'Pide otro día':'Sin confirmar'))+'</span></div>'
          + '<div style="font-size:12.5px;color:#6B7280;">'+(esVisita(c)?'Visita':'Entrevista')+' · '+e(fechaCita(t.fecha))+' · '+e(MODO[t.modo]||'')+'</div></div></div>';
      });
      msgs.slice(0,3).forEach(function(c){
        var n = mensajesSinLeer(c), ult = (c.mensajes||[]).filter(function(x){ return x.de === 'candidato'; }).slice(-1)[0];
        h += '<div onclick="abrirFichaCandidato(\''+e(c.id)+'\')" style="display:flex;align-items:center;gap:12px;padding:12px 18px;border-top:1px solid #F3F4F6;cursor:pointer;">'
          + '<div style="width:38px;height:38px;border-radius:10px;background:#EEF3FE;display:flex;align-items:center;justify-content:center;flex-shrink:0;">'+ico(I.msg,'#1A56DB',17)+'</div>'
          + '<div style="flex:1;min-width:0;"><div style="font-size:14px;font-weight:800;color:#111827;">'+e(c.nombre)+' <span style="font-size:12px;color:#1A56DB;">'+n+' mensaje'+(n>1?'s':'')+' nuevo'+(n>1?'s':'')+'</span></div>'
          + '<div style="font-size:12.5px;color:#6B7280;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;">'+e(ult ? ult.t : '')+'</div></div></div>';
      });
      el.innerHTML = h;
      var ref = document.getElementById('inicio-solicitudes') || box.querySelector('.inicio-kpis');
      if(ref && ref.nextSibling) box.insertBefore(el, ref.nextSibling); else box.appendChild(el);
    }catch(x){}
    return r;
  };

  /* ---------- 24 h en el bloque "Necesitan tu respuesta" ---------- */
  var _inicio2 = window.renderInicioReal;
  window.renderInicioReal = function(){
    var r = _inicio2.apply(this, arguments);
    try{
      var bl = document.getElementById('inicio-solicitudes'); if(!bl) return r;
      bl.querySelectorAll('[onclick^="abrirFichaCandidato"]').forEach(function(row){
        var m = row.getAttribute('onclick').match(/'([^']+)'/); var c = m && buscar(m[1]); if(!c) return;
        var hh = window._hHab ? _hHab(c) : (Date.now() - new Date(c.fecha)) / 3600000;
        var sp = row.querySelector('b + span, span[style*="#B42318"]');
        var tag = row.querySelector('.sla-real'); if(tag) tag.remove();
        if(hh >= 36){ var s = document.createElement('span'); s.className = 'sla-real'; s.style.cssText = 'margin-left:6px;background:'+(hh>=48?'#FEF2F2':'#FFFBEB')+';color:'+(hh>=48?'#B42318':'#8A5A00')+';border-radius:99px;padding:2px 7px;font-size:10.5px;font-weight:800;'; s.textContent = hh >= 24 ? 'Fuera de plazo' : 'Quedan ' + Math.max(1, Math.round(48-hh)) + ' h'; var nm = row.querySelector('div[style*="font-size:14px;font-weight:800"]'); if(nm) nm.appendChild(s); }
      });
    }catch(x){}
    return r;
  };

  /* ---------- avisos cuando el candidato hace algo ---------- */
  var _prev = null;
  var _renderTodo = CDB.renderTodo;
  CDB.renderTodo = function(){
    try{
      var ahora = {}; lista().forEach(function(c){ ahora[c.id] = { m:(c.mensajes||[]).length, ult:((c.mensajes||[]).slice(-1)[0]||{}).de, cita:c.cita ? c.cita.estado + '|' + c.cita.v : '', nombre:c.nombre, msgC:c.cita && c.cita.msgCambio }; });
      if(_prev && typeof showToast === 'function'){
        Object.keys(ahora).forEach(function(id){
          var a = ahora[id], b = _prev[id]; if(!b) return;
          if(a.m > b.m && a.ult === 'candidato') showToast(a.nombre + ' te ha escrito');
          else if(a.cita !== b.cita && a.cita.indexOf('confirmada|') === 0) showToast(a.nombre + ' ha confirmado la cita');
          else if(a.cita !== b.cita && a.cita.indexOf('cambio|') === 0) showToast(a.nombre + ' pide otro día');
        });
      }
      _prev = ahora;
    }catch(x){}
    return _renderTodo.apply(this, arguments);
  };

  /* ---------- cerrar o borrar una oferta con gente esperando ---------- */
  // La usan cambiarEstadoOferta y eliminarOferta (clinica/01-panel.js): si hay
  // gente esperando respuesta en esa oferta, enseña la ventana de cierre y
  // devuelve true; «seguir» se hace cuando la clínica confirma.
  window.CERCO_avisarCierreOferta = function(id, seguir, borrar){
    var pend = lista().filter(function(x){ return x.ofertaId === id && ['enviada','vista','entrevista'].indexOf(x.estado) > -1; });
    if(!pend.length) return false;
    modalCierre(id, pend, seguir, borrar);
    return true;
  };
  function modalCierre(id, pend, seguir, borrar){
    var vell = document.getElementById('modal-cierre'); if(vell) vell.remove();
    var of = null; try{ of = getSavedOffers().filter(function(o){ return o.id === id; })[0]; }catch(x){}
    var m = document.createElement('div'); m.id = 'modal-cierre';
    m.style.cssText = 'position:fixed;inset:0;background:rgba(10,14,30,.55);display:flex;align-items:center;justify-content:center;z-index:10003;padding:20px;box-sizing:border-box;';
    m.innerHTML = '<div style="background:white;border-radius:18px;max-width:440px;width:100%;padding:22px;box-shadow:0 24px 60px rgba(0,0,0,.25);">'
      + '<div style="font-size:18px;font-weight:800;color:#111827;margin-bottom:8px;">'+pend.length+' persona'+(pend.length>1?'s esperan':' espera')+' respuesta</div>'
      + '<div style="font-size:13.5px;color:#374151;line-height:1.6;margin-bottom:12px;">Antes de '+(borrar?'borrar':'cerrar')+' <b>'+e(of ? of.titulo : 'la oferta')+'</b>, les enviamos este mensaje para que nadie se quede esperando:</div>'
      + '<textarea id="cierre-msg" style="width:100%;box-sizing:border-box;min-height:84px;border:1px solid #E5E7EB;border-radius:10px;padding:10px 12px;font-size:13.5px;font-family:inherit;line-height:1.5;">Gracias por tu interés en '+e(of ? of.titulo : 'el puesto')+'. La clínica ha cerrado esta oferta y no seguirá con el proceso. Te deseamos mucha suerte.</textarea>'
      + '<div style="display:flex;gap:8px;margin-top:12px;"><button type="button" onclick="document.getElementById(\'modal-cierre\').remove()" style="flex:1;background:white;color:#374151;border:1px solid #E5E7EB;border-radius:10px;padding:12px;font-size:13.5px;font-weight:700;cursor:pointer;font-family:inherit;">Cancelar</button>'
      + '<button type="button" id="cierre-ok" style="flex:2;background:#374151;color:white;border:none;border-radius:10px;padding:12px;font-size:13.5px;font-weight:800;cursor:pointer;font-family:inherit;">Avisarles y '+(borrar?'borrar':'cerrar')+'</button></div></div>';
    document.body.appendChild(m);
    document.getElementById('cierre-ok').onclick = function(){
      var t = (document.getElementById('cierre-msg').value || '').trim();
      this.disabled = true; this.textContent = 'Avisando…';
      contestarPendientes(id, null, function(x){ return 'Hola ' + primer(x.nombre) + '. ' + t; }).then(function(n){
        m.remove(); seguir();
        if(typeof showToast === 'function') showToast('Hemos avisado a ' + n + ' persona' + (n>1?'s':''));
      });
    };
  }

  /* ---------- cifras: contratados ---------- */
  var _res = CDB.resumen;
  CDB.resumen = function(){ var r = _res.apply(this, arguments); try{ if(!this.demo()) r.contratados = lista().filter(function(c){ return c.estado === 'contratada'; }).length; }catch(x){} return r; };
  try{ CDB.renderTodo(); }catch(x){}
})();
