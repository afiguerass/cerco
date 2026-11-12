/* Archivo sacado tal cual de index.html (Fase 1, paso 1.6). El orden de carga
   importa: se carga en el mismo sitio de la página donde estaba. */
/* ================================================================
   LO QUE MÁS PIDE EL MERCADO (lado clínica)
   Sale de lo que dicen candidatos y pequeñas empresas en 2026:
   - Oferta clara: horario, funciones y proceso (la mitad de los
     candidatos rechaza por falta de claridad o de flexibilidad).
   - Un «no» con motivo: nadie se queda sin saber por qué.
   - Entrevista con las mismas preguntas y la misma nota para todos,
     y comparar candidatos lado a lado.
   - Cifras de tu contratación: cuánto tardas y quién espera.
   - Plan de acogida de 90 días cuando contratas.
   ================================================================ */
(function(){
  function $(id){ return document.getElementById(id); }
  function e(t){ return String(t == null ? '' : t).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;'); }
  function leer(k){ try{ return JSON.parse(localStorage.getItem(k) || '{}') || {}; }catch(x){ return {}; } }
  function guardar(k, v){ try{ localStorage.setItem(k, JSON.stringify(v)); }catch(x){} }
  function cands(){ try{ return (window.CERCO_candidaturas ? CERCO_candidaturas() : []) || []; }catch(x){ return []; } }
  function buscar(id){ return cands().filter(function(c){ return c.id === id; })[0]; }
  function grupo(t){ try{ return CERCO_grupo(t).k; }catch(x){ return 'otros'; } }
  function visita(c){ return c && c.tipo === 'visita'; }

  var css = document.createElement('style');
  css.textContent = ''
  + '.mk-box{border:1px solid #E5E7EB;border-radius:14px;padding:16px;margin:0 0 18px;background:#FAFBFC;}'
  + '.mk-box h4{margin:0 0 3px;font-size:14px;font-weight:800;color:#111827;}'
  + '.mk-box .mk-s{font-size:12.5px;color:#6B7280;line-height:1.5;margin:0 0 10px;}'
  + '.mk-chips{display:flex;flex-wrap:wrap;gap:7px;}'
  + '.mk-chip{border:1px solid #D5DAE1;background:#fff;color:#374151;border-radius:999px;padding:8px 13px;font:inherit;font-size:13px;font-weight:600;cursor:pointer;min-height:38px;}'
  + '.mk-chip.on{background:#1A56DB;border-color:#1A56DB;color:#fff;}'
  + '.mk-chip:focus-visible,.mk-n button:focus-visible{outline:2px solid #1A56DB;outline-offset:2px;}'
  + '.mk-in{width:100%;box-sizing:border-box;border:1px solid #E5E7EB;border-radius:10px;padding:11px 13px;font:inherit;font-size:14px;margin-top:10px;background:#fff;color:#111827;}'
  + '.mk-meter{border:1px solid #C9D6F5;background:#F5F8FF;border-radius:14px;padding:14px 16px;margin:0 0 16px;}'
  + '.mk-meter b{font-size:14px;color:#0F1C3F;}'
  + '.mk-bar{height:8px;border-radius:99px;background:#DCE5FA;overflow:hidden;margin:9px 0;}'
  + '.mk-bar i{display:block;height:100%;background:#1A56DB;border-radius:99px;transition:width .25s;}'
  + '.mk-falta{font-size:12.5px;color:#374151;line-height:1.6;}'
  + '.mk-sal{font-size:12.5px;line-height:1.5;color:#374151;background:#fff;border:1px solid #E5E7EB;border-radius:10px;padding:9px 12px;margin-top:8px;}'
  + '.mk-card{border:1px solid #E5E7EB;border-radius:14px;padding:14px;margin-top:12px;background:#fff;}'
  + '.mk-card h4{margin:0 0 2px;font-size:14px;font-weight:800;color:#111827;}'
  + '.mk-crit{padding:11px 0;border-top:1px solid #F1F3F5;}'
  + '.mk-crit:first-of-type{border-top:0;}'
  + '.mk-crit .q{font-size:12.5px;color:#6B7280;line-height:1.5;margin:2px 0 8px;}'
  + '.mk-n{display:flex;gap:6px;}'
  + '.mk-n button{flex:1;min-height:40px;border:1px solid #D5DAE1;background:#fff;border-radius:10px;font:inherit;font-size:14px;font-weight:800;color:#374151;cursor:pointer;}'
  + '.mk-n button.on{background:#0F1C3F;border-color:#0F1C3F;color:#fff;}'
  + '.mk-plan label{display:flex;gap:10px;align-items:flex-start;padding:9px 0;border-top:1px solid #F1F3F5;font-size:13.5px;line-height:1.45;color:#111827;cursor:pointer;}'
  + '.mk-plan label:first-of-type{border-top:0;}'
  + '.mk-plan input{width:18px;height:18px;margin-top:1px;flex-shrink:0;accent-color:#059669;}'
  + '.mk-plan small{display:block;color:#6B7280;font-size:12px;}'
  + '.mk-kpis{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:12px;margin-bottom:14px;}'
  + '.mk-kpi{background:#fff;border:1px solid #EAECF0;border-radius:14px;padding:16px;}'
  + '.mk-kpi b{display:block;font-size:26px;font-weight:800;color:#111827;line-height:1.1;}'
  + '.mk-kpi span{font-size:12px;font-weight:600;color:#6B7280;}'
  + '.mk-kpi.al{border-color:#F3C5C5;background:#FFF8F8;}.mk-kpi.al b{color:#B42318;}'
  + '.mk-lin{background:#fff;border:1px solid #EAECF0;border-radius:14px;padding:14px 16px;margin-bottom:14px;font-size:13.5px;color:#374151;line-height:1.6;}'
  + '.mk-lin h4{margin:0 0 6px;font-size:13px;font-weight:800;color:#111827;}'
  + '#cmp-modal{position:fixed;inset:0;z-index:100050;background:rgba(15,28,63,.55);display:none;align-items:center;justify-content:center;padding:16px;}'
  + '#cmp-modal .cmp{background:#fff;border-radius:18px;width:min(960px,100%);max-height:92vh;display:flex;flex-direction:column;overflow:hidden;}'
  + '.cmp-h{display:flex;align-items:center;justify-content:space-between;gap:10px;padding:16px 18px;border-bottom:1px solid #EAECF0;}'
  + '.cmp-h h3{margin:0;font-size:17px;font-weight:800;color:#111827;}'
  + '.cmp-x{border:0;background:#F3F4F6;border-radius:10px;width:40px;height:40px;font-size:20px;cursor:pointer;color:#374151;}'
  + '.cmp-b{overflow:auto;padding:14px 18px 18px;}'
  + '.cmp-t{border-collapse:separate;border-spacing:0;width:100%;font-size:13.5px;}'
  + '.cmp-t th,.cmp-t td{padding:10px 12px;border-bottom:1px solid #F1F3F5;text-align:left;vertical-align:top;min-width:150px;color:#111827;}'
  + '.cmp-t th:first-child,.cmp-t td:first-child{position:sticky;left:0;background:#fff;min-width:108px;width:108px;font-size:12px;font-weight:700;color:#6B7280;}'
  + '.cmp-t thead th{font-size:14px;font-weight:800;}'
  + '.cmp-t .mej{color:#047857;font-weight:800;}'
  + '.cmp-btn{border:1px solid #C9D6F5;background:#F5F8FF;color:#1A56DB;border-radius:10px;padding:9px 12px;font:inherit;font-size:13px;font-weight:700;cursor:pointer;}'
  + '.cmp-entry{display:inline-flex;align-items:center;gap:7px;border:1px solid #D5DAE1;background:#fff;color:#0F1C3F;border-radius:999px;padding:9px 14px;font:inherit;font-size:13px;font-weight:700;cursor:pointer;margin:0 0 12px;min-height:40px;}'
  + '@media(max-width:720px){.mk-kpis{grid-template-columns:repeat(2,minmax(0,1fr));}#cmp-modal{padding:0;align-items:flex-end;}#cmp-modal .cmp{border-radius:18px 18px 0 0;max-height:94vh;}.cmp-t th,.cmp-t td{min-width:132px;}}';
  document.head.appendChild(css);

  /* =============== 1. OFERTA CLARA =============== */
  var TURNOS = ['Mañanas','Tardes','Jornada partida','Intensiva','Turnos rotativos','Algún sábado'];
  var PASOS = ['Entrevista','Visita a la clínica','Prueba práctica','Día de prueba pagado','Segunda entrevista'];
  // de texto guardado («Entrevista + visita a la clínica») a pasos marcados; acepta las ofertas antiguas
  function pasosDe(t){
    var n = String(t || '').toLowerCase(), out = [];
    if(/entrevista/.test(n)) out.push('Entrevista');
    if(/visita/.test(n)) out.push('Visita a la clínica');
    if(/prueba pr[aá]ctica/.test(n)) out.push('Prueba práctica');
    if(/d[ií]a de prueba/.test(n)) out.push('Día de prueba pagado');
    if(/2 entrevistas|segunda entrevista/.test(n)) out.push('Segunda entrevista');
    return out;
  }
  // los pasos tal como los marcó la clínica, en su orden
  function pasosOF(){ var t = String(OF.proceso || ''), l = t ? t.split(' + ').filter(function(x){ return PASOS.indexOf(x) > -1; }) : []; return (l.length || !t) ? l : pasosDe(t); }
  var FUNC = {
    hig:['Higienes y mantenimientos','Periodoncia básica','Blanqueamientos','Educación en higiene oral','Radiografías','Esterilización'],
    aux:['Asistencia en gabinete','Esterilización e instrumental','Preparar el gabinete','Radiografías','Atención al paciente','Control de stock'],
    odo:['Odontología general','Endodoncia','Prótesis','Cirugía oral','Implantes','Estética dental','Odontopediatría'],
    orto:['Ortodoncia fija','Alineadores invisibles','Estudios y planificación','Revisiones'],
    recep:['Agenda y citas','Atención telefónica','Presupuestos y cobros','Recepción de pacientes','Gestión de seguros'],
    coord:['Coordinar el equipo','Presupuestos y financiación','Compras y proveedores','Indicadores de la clínica'],
    prot:['Prótesis fija','Prótesis removible','CAD/CAM','Cerámica'],
    otros:['Atención al paciente','Trabajo en equipo','Organización del día']
  };
  var REF = { hig:['higienistas',18000,32000], aux:['auxiliares',15000,23000], recep:['recepción',15000,24000], odo:['odontólogos',30000,90000], orto:['ortodoncistas',30000,90000] };
  var OF = { turnos:[], funciones:[], proceso:'', horario:'' };

  function val(id){ var x = $(id); return x ? String(x.value || '').trim() : ''; }
  function pintarOf(){
    var box = $('mk-oferta'); if(!box) return;
    var g = grupo(val('co-titulo'));
    var sug = FUNC[g] || FUNC.otros;
    var todas = sug.concat(OF.funciones.filter(function(f){ return sug.indexOf(f) === -1; }));
    box.innerHTML = ''
      + '<div class="mk-box"><h4>Horario</h4><p class="mk-s">Es lo segundo que mira un candidato después del sueldo. Marca los turnos y, si puedes, escribe el horario real.</p>'
      + '<div class="mk-chips" role="group" aria-label="Turnos">' + TURNOS.map(function(t){ var on = OF.turnos.indexOf(t) > -1; return '<button type="button" class="mk-chip'+(on?' on':'')+'" aria-pressed="'+on+'" onclick="CERCO_ofTurno(\''+t+'\')">'+t+'</button>'; }).join('') + '</div>'
      + '<input class="mk-in" id="mk-horario" maxlength="120" aria-label="Horario concreto" placeholder="Ej: L–J 9:00–14:00 y 16:00–20:00 · V 9:00–15:00" value="'+e(OF.horario)+'"></div>'
      + '<div class="mk-box"><h4>Qué hará en el día a día</h4><p class="mk-s">Marca las tareas reales del puesto (hasta 6). Evita sorpresas el primer día.</p>'
      + '<div class="mk-chips" role="group" aria-label="Funciones del puesto">' + todas.map(function(f, i){ var on = OF.funciones.indexOf(f) > -1; return '<button type="button" class="mk-chip'+(on?' on':'')+'" aria-pressed="'+on+'" data-f="'+e(f)+'" onclick="CERCO_ofFuncion(this.dataset.f)">'+e(f)+'</button>'; }).join('') + '</div>'
      + '<input class="mk-in" id="mk-func-n" maxlength="50" aria-label="Añadir otra tarea" placeholder="Añadir otra tarea y pulsar Intro"></div>'
      + '<div class="mk-box"><h4>Cómo será el proceso</h4><p class="mk-s">Marca todos los pasos que tendrá, en el orden que quieras: el candidato los verá en este orden. Con más de tres pasos, la mitad de los candidatos abandona.</p>'
      + '<div class="mk-chips" role="group" aria-label="Pasos del proceso">' + PASOS.map(function(p){ var on = pasosOF().indexOf(p) > -1; return '<button type="button" class="mk-chip'+(on?' on':'')+'" aria-pressed="'+on+'" onclick="CERCO_ofProceso(\''+p+'\')">'+p+'</button>'; }).join('') + '</div>'
      + (pasosOF().length > 3 ? '<div style="font-size:12.5px;color:#92400E;background:#FFFBEB;border-radius:10px;padding:8px 11px;margin-top:10px;line-height:1.5;">Son ' + pasosOF().length + ' pasos. Si puedes, quédate en tres o menos: es cuando menos candidatos abandonan.</div>' : '')
      + (OF.proceso ? '<div style="font-size:12.5px;color:#374151;margin-top:10px;">El candidato verá: <b>' + e(OF.proceso) + '</b></div>' : '') + '</div>';
    var h = $('mk-horario'); if(h) h.oninput = function(){ OF.horario = h.value; medidor(); };
    var n = $('mk-func-n'); if(n) n.onkeydown = function(ev){ if(ev.key === 'Enter'){ ev.preventDefault(); ev.stopPropagation(); var t = n.value.trim(); if(t){ CERCO_ofFuncion(t, true); var m = $('mk-func-n'); if(m) m.focus(); } } };
    medidor();
  }
  function salTxt(){
    var per = $('co-sal-per'), p = per ? (per.options[per.selectedIndex] || {}).text || per.value : '';
    var mm = [val('co-sal-min'), val('co-sal-max')].filter(Boolean).join(' ');
    return mm ? mm + ' ' + p : val('co-salario');
  }
  function anual(){
    var t = salTxt(); if(!/año/i.test(t)) return null;
    var n = (t.match(/\d{1,3}(?:[.\s]\d{3})+|\d{4,6}/g) || []).map(function(x){ return +x.replace(/[.\s]/g,''); }).filter(function(x){ return x >= 8000 && x <= 250000; });
    return n.length ? [Math.min.apply(null,n), Math.max.apply(null,n)] : null;
  }
  function medidor(){
    var box = $('mk-medidor'); if(!box) return;
    var q = [
      ['Cuánto cobraré', !!salTxt().replace(/[^\d]/g,'')],
      ['Qué horario tendré', !!(OF.turnos.length || OF.horario.trim())],
      ['Qué haré cada día', OF.funciones.length >= 2],
      ['Qué contrato es', !!val('co-contrato') && !/^elige$/i.test(val('co-contrato'))],
      ['Cómo es el proceso', !!OF.proceso],
      ['Qué piden', val('co-requisitos').length > 3],
      ['Cómo es el sitio', val('co-descripcion').length >= 60]
    ];
    var ok = q.filter(function(x){ return x[1]; }).length;
    var falta = q.filter(function(x){ return !x[1]; }).map(function(x){ return x[0]; });
    var h = '<b>Tu oferta responde '+ok+' de '+q.length+' preguntas que se hace un candidato</b>'
      + '<div class="mk-bar" role="progressbar" aria-valuemin="0" aria-valuemax="'+q.length+'" aria-valuenow="'+ok+'"><i style="width:'+Math.round(ok/q.length*100)+'%"></i></div>'
      + '<div class="mk-falta">' + (falta.length ? 'Te falta: ' + e(falta.join(' · ')) + '.' : 'Completa. Una oferta así recibe solicitudes de gente que ya sabe a qué viene.') + '</div>';
    var r = REF[grupo(val('co-titulo'))], a = anual();
    if(r && a){
      var medio = (a[0] + a[1]) / 2, t1 = r[1] + (r[2]-r[1])/3, t2 = r[1] + (r[2]-r[1])*2/3;
      var donde = medio < r[1] ? 'por debajo de' : (medio < t1 ? 'en la parte baja de' : (medio < t2 ? 'en la parte media de' : (medio <= r[2] ? 'en la parte alta de' : 'por encima de')));
      h += '<div class="mk-sal">Referencia del sector para '+r[0]+': '+r[1].toLocaleString('es-ES')+'–'+r[2].toLocaleString('es-ES')+' € brutos/año. Tu sueldo está <b>'+donde+'</b> ese rango.'+(medio < t1 ? ' El sueldo es lo primero que decide: si no puedes subirlo, compénsalo con horario o formación y dilo.' : '')+' <span style="color:#6B7280;">Orientativo.</span></div>';
    }
    box.innerHTML = h;
  }
  window.CERCO_ofTurno = function(t){ var i = OF.turnos.indexOf(t); if(i > -1) OF.turnos.splice(i,1); else OF.turnos.push(t); pintarOf(); };
  window.CERCO_ofFuncion = function(f, nueva){
    var i = OF.funciones.indexOf(f);
    if(i > -1 && !nueva) OF.funciones.splice(i,1);
    else if(i === -1){ if(OF.funciones.length >= 6){ if(window.showToast) showToast('Máximo 6 tareas: deja las que más pesan'); return; } OF.funciones.push(f); }
    pintarOf();
  };
  window.CERCO_ofProceso = function(p){
    var l = pasosOF(), i = l.indexOf(p);
    if(i > -1) l.splice(i, 1); else l.push(p);
    OF.proceso = l.join(' + '); pintarOf();
  };
  window.CERCO_ofExtra = function(){ return { turnos:OF.turnos.slice(), funciones:OF.funciones.slice(), proceso:OF.proceso, horario:OF.horario.trim() }; };
  window.CERCO_ofCargar = function(o){ o = o || {}; OF = { turnos:(o.turnos||[]).slice(), funciones:(o.funciones||[]).slice(), proceso:o.proceso||'', horario:o.horario||'' }; pintarOf(); };
  function montarOferta(){
    var d = $('co-descripcion'); if(!d || $('mk-oferta')) return;
    var campo = d.closest('.field') || d.parentElement;
    var box = document.createElement('div'); box.id = 'mk-oferta';
    campo.parentElement.insertBefore(box, campo);
    var btn = document.querySelector('#screen-crear-oferta .btn-submit');
    var med = document.createElement('div'); med.id = 'mk-medidor'; med.className = 'mk-meter'; med.setAttribute('aria-live','polite');
    var err = $('co-err');
    var ancla = (err && err.parentElement === (btn && btn.parentElement)) ? err : btn;
    if(ancla && ancla.parentElement) ancla.parentElement.insertBefore(med, ancla);
    var scr = $('screen-crear-oferta');
    if(scr){ scr.addEventListener('input', function(ev){ if(ev.target && ev.target.id === 'co-titulo') pintarOfSuave(); else medidor(); }); scr.addEventListener('change', medidor); }
    pintarOf();
  }
  var _t = 0;
  function pintarOfSuave(){ clearTimeout(_t); _t = setTimeout(function(){ var a = document.activeElement; if(a && (a.id === 'mk-horario' || a.id === 'mk-func-n')) return medidor(); pintarOf(); }, 350); }

  /* =============== 2. UN «NO» CON MOTIVO =============== */
  var MOTIVOS = [
    ['exp','Buscamos más experiencia','En esta ocasión buscamos a alguien con más experiencia en el puesto.'],
    ['horario','El horario no coincide','El horario y la disponibilidad que necesitamos no coinciden con los tuyos.'],
    ['titulo','Falta la titulación','El puesto requiere una titulación que no vemos en tu perfil.'],
    ['distancia','La distancia','Nos preocupa que la distancia complique el día a día.'],
    ['cubierta','Plaza cubierta','La plaza ya se ha cubierto.'],
    ['otro','Otro perfil encajaba más','Hemos seguido con otro perfil que encaja más con lo que necesitamos ahora.']
  ];
  // La usa responderCandidato (clinica/02-solicitudes-reales.js): al descartar, botones con el motivo
  window.CERCO_motivosDescarte = function(id, estado){
    var c = buscar(id), nota = $('cand-nota');
    if(estado !== 'descartada' || !c || visita(c) || !nota) return;
    var div = document.createElement('div'); div.style.marginBottom = '10px';
    div.innerHTML = '<div style="font-size:13px;font-weight:800;color:#374151;margin-bottom:3px;">¿Por qué no sigue?</div>'
      + '<div style="font-size:12px;color:#6B7280;line-height:1.5;margin-bottom:8px;">Un «no» con motivo se agradece y te deja en buen lugar. Solo motivos del puesto: nunca edad, salud, familia u origen.</div>'
      + '<div class="mk-chips" id="mk-motivos" role="group" aria-label="Motivo">' + MOTIVOS.map(function(m){ return '<button type="button" class="mk-chip" aria-pressed="false" onclick="CERCO_motivo(\''+m[0]+'\',\''+e(id)+'\')">'+m[1]+'</button>'; }).join('') + '</div>';
    nota.parentElement.insertBefore(div, nota.previousElementSibling && /Nadie se queda/.test(nota.previousElementSibling.textContent) ? nota.previousElementSibling.previousElementSibling || nota : nota);
  };
  window.CERCO_motivo = function(k, id){
    var c = buscar(id) || {}, m = MOTIVOS.filter(function(x){ return x[0] === k; })[0]; if(!m) return;
    window.__motivoDesc = k;
    [].forEach.call(document.querySelectorAll('#mk-motivos .mk-chip'), function(b, i){ var on = MOTIVOS[i][0] === k; b.classList.toggle('on', on); b.setAttribute('aria-pressed', on); });
    var nom = String(c.nombre || '').trim().split(/\s+/)[0] || '';
    var nota = $('cand-nota');
    if(nota) nota.value = 'Hola ' + nom + ', gracias por tu interés en ' + (c.ofertaTitulo || 'el puesto') + '. ' + m[2] + ' Te deseamos mucha suerte.';
  };

  /* =============== 3. ENTREVISTA: MISMAS PREGUNTAS, MISMA NOTA =============== */
  var P1 = {
    hig:'Explícame paso a paso cómo haces un mantenimiento periodontal.',
    aux:'¿Cómo preparas el gabinete y el instrumental para una endodoncia?',
    odo:'Cuéntame un caso complejo reciente y cómo lo planificaste.',
    orto:'Cuéntame cómo planificas un caso de alineadores de principio a fin.',
    recep:'Un paciente pide cita urgente y la agenda está llena. ¿Qué haces?',
    coord:'¿Qué miras cada semana para saber si la clínica va bien?',
    prot:'Cuéntame un trabajo que tuviste que repetir y qué cambiaste.',
    otros:'Cuéntame una tarea habitual de tu puesto y cómo la haces paso a paso.'
  };
  function criterios(c){
    return [
      ['Conocimientos del puesto', P1[grupo(c.profesion || c.ofertaTitulo)] || P1.otros],
      ['Trato con el paciente', 'Cuéntame una vez que un paciente estaba nervioso o molesto. ¿Qué hiciste exactamente?'],
      ['Trabajo en equipo', 'Cuéntame un desacuerdo con un compañero y cómo lo resolvisteis.'],
      ['Horario y condiciones', 'Este es el horario y el sueldo de la oferta. ¿Hay algo que no te encaje?']
    ];
  }
  function nota(id){ var v = (leer('cerco_valoraciones')[id] || {}).v || []; var n = v.filter(function(x){ return x > 0; }); return n.length ? n.reduce(function(a,b){ return a+b; }, 0) / n.length : null; }
  function txtNota(x){ return x == null ? 'Sin valorar' : x.toLocaleString('es-ES', {maximumFractionDigits:1}) + ' de 4'; }
  function bloqueValorar(c){
    var d = leer('cerco_valoraciones')[c.id] || {}, v = d.v || [], n = nota(c.id);
    return '<div class="mk-card" id="mk-val"><h4>Valora la entrevista</h4>'
      + '<div style="font-size:12.5px;color:#6B7280;line-height:1.5;margin-bottom:6px;">Las mismas 4 preguntas y la misma nota (1 flojo · 4 excelente) para todos los candidatos: es la forma de entrevistar que mejor acierta. Solo lo ves tú.</div>'
      + criterios(c).map(function(k, i){
          return '<div class="mk-crit"><b style="font-size:13.5px;color:#111827;">'+k[0]+'</b><div class="q">«'+e(k[1])+'»</div>'
            + '<div class="mk-n" role="group" aria-label="'+k[0]+'">' + [1,2,3,4].map(function(x){ return '<button type="button" class="'+(v[i] === x ? 'on' : '')+'" aria-pressed="'+(v[i] === x)+'" onclick="CERCO_valorar(\''+e(c.id)+'\','+i+','+x+')">'+x+'</button>'; }).join('') + '</div></div>';
        }).join('')
      + '<textarea id="mk-val-nota" maxlength="500" aria-label="Notas de la entrevista" placeholder="Notas de la entrevista (solo tú las ves)" style="width:100%;box-sizing:border-box;min-height:64px;border:1px solid #E5E7EB;border-radius:10px;padding:10px 12px;font:inherit;font-size:13.5px;margin-top:8px;" onchange="CERCO_valorarNota(\''+e(c.id)+'\',this.value)">'+e(d.nota || '')+'</textarea>'
      + '<div style="display:flex;align-items:center;justify-content:space-between;gap:10px;margin-top:10px;flex-wrap:wrap;"><span style="font-size:13.5px;font-weight:800;color:#0F1C3F;">Nota: '+txtNota(n)+'</span>'
      + (comparables(c.ofertaId).length >= 2 ? '<button type="button" class="cmp-btn" onclick="try{cerrarFichaCandidato()}catch(x){};CERCO_comparar(\''+e(c.ofertaId)+'\')">Comparar con los demás</button>' : '') + '</div></div>';
  }
  window.CERCO_valorar = function(id, i, x){
    var t = leer('cerco_valoraciones'), d = t[id] || {v:[0,0,0,0]};
    d.v = (d.v || [0,0,0,0]).slice(); d.v[i] = d.v[i] === x ? 0 : x; d.fecha = new Date().toISOString(); t[id] = d; guardar('cerco_valoraciones', t);
    var c = buscar(id), b = $('mk-val'); if(c && b) b.outerHTML = bloqueValorar(c);
  };
  window.CERCO_valorarNota = function(id, txt){ var t = leer('cerco_valoraciones'), d = t[id] || {v:[0,0,0,0]}; d.nota = String(txt || '').slice(0,500); t[id] = d; guardar('cerco_valoraciones', t); };

  /* =============== 4. PLAN DE ACOGIDA (90 DÍAS) =============== */
  var PLAN = [
    ['Antes del primer día','Contrato y condiciones por escrito: sueldo, horario, convenio y periodo de prueba, tal como salían en la oferta.'],
    ['Antes del primer día','Uniforme, taquilla y acceso al programa de la clínica preparados.'],
    ['Día 1','Presentarle al equipo y decirle quién es su persona de referencia.'],
    ['Día 1','Enseñarle los protocolos: esterilización, agenda y urgencias.'],
    ['Semana 1','10 minutos a solas: qué tal va y qué necesita.'],
    ['Mes 1','Conversación de media hora: qué funciona, qué cambiaríais los dos.'],
    ['Mes 3','Antes de acabar el periodo de prueba, decirle claramente cómo va.'],
    ['Día 90','Contestar en CERCO si seguís trabajando juntos.']
  ];
  function bloquePlan(c){
    var h = (leer('cerco_acogida')[c.id] || []), n = PLAN.filter(function(_, i){ return h[i]; }).length;
    return '<div class="mk-card mk-plan" id="mk-plan"><h4>Plan de acogida · primeros 90 días</h4>'
      + '<div style="font-size:12.5px;color:#6B7280;line-height:1.5;margin-bottom:6px;">Contratar bien es la mitad. La mayoría de las bajas llegan en los tres primeros meses y casi siempre por el ambiente, no por el sueldo. '+n+' de '+PLAN.length+' hechos.</div>'
      + PLAN.map(function(p, i){ return '<label><input type="checkbox" '+(h[i] ? 'checked' : '')+' onchange="CERCO_plan(\''+e(c.id)+'\','+i+',this.checked)"><span><small>'+p[0]+'</small>'+e(p[1])+'</span></label>'; }).join('')
      + '</div>';
  }
  // Plan de acogida guardado solo en este navegador: lo usa CERCO_plan (clinica/14-correo-contrato-acogida.js) cuando no hay solicitud real
  window.CERCO_planLocal = function(id, i, on){ var t = leer('cerco_acogida'), h = (t[id] || []).slice(); h[i] = !!on; t[id] = h; guardar('cerco_acogida', t); var c = buscar(id), b = $('mk-plan'); if(c && b) b.outerHTML = bloquePlan(c); };

  var _fichaOrig = window.abrirFichaCandidato;
  window.abrirFichaCandidato = function(id, modo){
    var r = _fichaOrig.apply(this, arguments);
    try{
      var c = buscar(id), box = $('cand-acciones'); if(!c || !box || visita(c)) return r;
      if(c.estado === 'entrevista') box.insertAdjacentHTML('beforeend', bloqueValorar(c));
      if(c.estado === 'contratada') box.insertAdjacentHTML('beforeend', bloquePlan(c));
    }catch(x){}
    return r;
  };

  /* =============== 5. COMPARAR CANDIDATOS =============== */
  var VIVOS = ['enviada','vista','entrevista','contratada'];
  var TXT = { enviada:'Sin abrir', vista:'Pendiente de respuesta', entrevista:'En entrevista', contratada:'Contratada' };
  function comparables(oid){ return cands().filter(function(c){ return String(c.ofertaId) === String(oid) && !visita(c) && VIVOS.indexOf(c.estado) > -1; }); }
  function ofertasComparables(){
    var m = {}; cands().forEach(function(c){ if(!visita(c) && VIVOS.indexOf(c.estado) > -1){ (m[c.ofertaId] = m[c.ofertaId] || {id:c.ofertaId, t:c.ofertaTitulo || 'Oferta', n:0}).n++; } });
    return Object.keys(m).map(function(k){ return m[k]; }).filter(function(o){ return o.n >= 2; }).sort(function(a,b){ return b.n - a.n; });
  }
  function estilo(c){
    var N = {D:'Dominante', I:'Influyente', S:'Estable', C:'Concienzudo'}, d = c.disc; if(!d) return 'Sin test';
    var p = d.pct || d.porc || d.scores || d;
    var l = ['D','I','S','C'].filter(function(k){ return typeof p[k] === 'number'; }).sort(function(a,b){ return p[b] - p[a]; });
    if(l.length >= 2) return N[l[0]] + ' y ' + N[l[1]].toLowerCase();
    return N[d.dom] || 'Hecho';
  }
  window.CERCO_comparar = function(oid){
    var ofs = ofertasComparables();
    var m = $('cmp-modal');
    if(!m){ m = document.createElement('div'); m.id = 'cmp-modal'; m.setAttribute('role','dialog'); m.setAttribute('aria-modal','true'); m.setAttribute('aria-label','Comparar candidatos'); document.body.appendChild(m); m.addEventListener('click', function(ev){ if(ev.target === m) CERCO_cerrarComparar(); }); document.addEventListener('keydown', function(ev){ if(ev.key === 'Escape' && m.style.display === 'flex') CERCO_cerrarComparar(); }); }
    var cab = '<div class="cmp-h"><h3>Comparar candidatos</h3><button type="button" class="cmp-x" aria-label="Cerrar" onclick="CERCO_cerrarComparar()">×</button></div>';
    if(!ofs.length){
      m.innerHTML = '<div class="cmp">'+cab+'<div class="cmp-b"><p style="font-size:14px;color:#374151;line-height:1.6;margin:6px 0 10px;">Aquí verás lado a lado a quienes solicitan la misma oferta: experiencia, distancia, disponibilidad y la nota de tu entrevista.</p><p style="font-size:13.5px;color:#6B7280;line-height:1.6;margin:0;">Hace falta que una oferta tenga al menos 2 solicitudes abiertas.</p></div></div>';
      m.style.display = 'flex'; return;
    }
    if(!oid || !ofs.some(function(o){ return String(o.id) === String(oid); })) oid = ofs[0].id;
    var l = comparables(oid).sort(function(a,b){ return (nota(b.id) || 0) - (nota(a.id) || 0) || VIVOS.indexOf(b.estado) - VIVOS.indexOf(a.estado); }).slice(0,4);
    var mejor = Math.max.apply(null, l.map(function(c){ return nota(c.id) || 0; }));
    var kmMin = Math.min.apply(null, l.map(function(c){ return typeof c.kmOferta === 'number' ? c.kmOferta : 1e9; }));
    function fila(t, fn){ return '<tr><td>'+t+'</td>' + l.map(function(c){ return '<td>'+fn(c)+'</td>'; }).join('') + '</tr>'; }
    var h = '<div class="cmp">'+cab+'<div class="cmp-b">'
      + (ofs.length > 1 ? '<div class="mk-chips" style="margin-bottom:12px;" role="group" aria-label="Oferta">' + ofs.map(function(o){ var on = String(o.id) === String(oid); return '<button type="button" class="mk-chip'+(on?' on':'')+'" aria-pressed="'+on+'" onclick="CERCO_comparar(\''+e(o.id)+'\')">'+e(o.t)+' · '+o.n+'</button>'; }).join('') + '</div>' : '<div style="font-size:13.5px;color:#6B7280;margin-bottom:10px;">'+e(ofs[0].t)+' · '+ofs[0].n+' solicitudes abiertas'+(comparables(oid).length > 4 ? ' (se muestran 4)' : '')+'</div>')
      + '<div style="overflow-x:auto;"><table class="cmp-t"><thead><tr><th></th>' + l.map(function(c){ return '<th>'+e(c.nombre || 'Sin nombre')+'</th>'; }).join('') + '</tr></thead><tbody>'
      + fila('Tu entrevista', function(c){ var n = nota(c.id); return '<span class="'+(n && n === mejor && l.length > 1 ? 'mej' : '')+'">'+txtNota(n)+'</span>'; })
      + fila('Estado', function(c){ return TXT[c.estado] || c.estado; })
      + fila('Experiencia', function(c){ return e(c.sinExperiencia ? 'Primer empleo en clínica' : (c.experiencia || 'Sin indicar')); })
      + fila('Titulación', function(c){ return e(c.titulacion || 'Sin indicar'); })
      + fila('Distancia', function(c){ return typeof c.kmOferta === 'number' ? '<span class="'+(c.kmOferta === kmMin && l.length > 1 ? 'mej' : '')+'">'+(c.kmOferta < 1 ? 'Misma zona' : 'A '+Math.round(c.kmOferta)+' km')+'</span>' : e(c.ciudad || 'Sin indicar'); })
      + fila('Incorporación', function(c){ return e(c.disponibilidad || 'Sin indicar'); })
      + fila('Jornada', function(c){ return e(c.jornada || 'Sin indicar'); })
      + fila('Puntos fuertes', function(c){ return e((c.fuertes || []).slice(0,3).join(', ') || '—'); })
      + fila('Vídeo y CV', function(c){ return (c.video ? 'Vídeo' : 'Sin vídeo') + ' · ' + (c.cv ? 'CV' : 'sin CV'); })
      + fila('Forma de trabajar', function(c){ return e(estilo(c)); })
      + fila('', function(c){ return '<button type="button" class="cmp-btn" onclick="CERCO_cerrarComparar();abrirFichaCandidato(\''+e(c.id)+'\')">Ver ficha</button>'; })
      + '</tbody></table></div>'
      + '<p style="font-size:12.5px;color:#6B7280;line-height:1.55;margin:12px 0 0;">Ordenados por la nota de tu entrevista. La forma de trabajar es orientativa: sirve para preparar la conversación, no para decidir.</p>'
      + '</div></div>';
    m.innerHTML = h; m.style.display = 'flex';
    var x = m.querySelector('.cmp-x'); if(x) try{ x.focus({preventScroll:true}); }catch(z){}
  };
  window.CERCO_cerrarComparar = function(){ var m = $('cmp-modal'); if(m) m.style.display = 'none'; };

  // entradas: Candidatos y Herramientas
  function entradaCandidatos(){
    var raiz = $('portal-reales'); if(!raiz) return;
    var viejo = $('cmp-entry'); if(viejo) viejo.remove();
    if(!ofertasComparables().length) return;
    var lista = $('portal-reales-lista'); if(!lista) return;
    var b = document.createElement('button'); b.type = 'button'; b.id = 'cmp-entry'; b.className = 'cmp-entry';
    b.innerHTML = '<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M8 3v18M16 3v18M3 8h5M16 16h5"/></svg>Comparar candidatos';
    b.onclick = function(){ CERCO_comparar(); };
    lista.parentElement.insertBefore(b, lista);
  }
  var _rpOrig = window.renderPortalReal;
  if(typeof _rpOrig === 'function') window.renderPortalReal = function(){ var r = _rpOrig.apply(this, arguments); try{ entradaCandidatos(); }catch(x){} return r; };
  function entradaHerramientas(){
    if($('mk-tool-cmp')) return;
    var t = [].filter.call(document.querySelectorAll('#screen-herramientas .tool-title'), function(x){ return x.textContent.trim() === 'Ver encaje de un candidato'; })[0]; if(!t) return;
    var card = t.parentElement;
    while(card.parentElement && card.parentElement.querySelectorAll('.tool-title').length === 1) card = card.parentElement;
    var n = card.cloneNode(false); n.id = 'mk-tool-cmp'; n.removeAttribute('onclick'); n.style.cursor = 'pointer'; n.setAttribute('role','button'); n.tabIndex = 0;
    n.innerHTML = '<div class="tool-icon" style="background:#EEF3FE;"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#1A56DB" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M8 3v18M16 3v18M3 8h5M16 16h5"/></svg></div>'
      + '<div class="tool-title">Comparar candidatos</div><div class="tool-desc">Quienes solicitan la misma oferta, lado a lado: experiencia, distancia, disponibilidad y la nota de tu entrevista.</div>';
    n.onclick = function(){ CERCO_comparar(); };
    n.onkeydown = function(ev){ if(ev.key === 'Enter' || ev.key === ' '){ ev.preventDefault(); CERCO_comparar(); } };
    card.parentElement.insertBefore(n, card.nextSibling);
  }

  /* =============== 6. CIFRAS DE TU CONTRATACIÓN =============== */
  function dur(h){ if(h < 1) return '< 1 h'; if(h < 24) return Math.round(h) + ' h'; var d = h / 24; return (d < 10 ? d.toLocaleString('es-ES', {maximumFractionDigits:1}) : Math.round(d)) + (d < 1.05 ? ' día' : ' días'); }
  function bloqueCifras(){
    var l = cands().filter(function(c){ return !visita(c) && c.estado !== 'retirada'; });
    if(!l.length) return '';
    var resp = [], esperan = 0, entrev = 0, contr = 0, mot = {};
    l.forEach(function(c){
      var h = (c.historial || []).filter(function(x){ return ['entrevista','descartada','contratada'].indexOf(x.estado) > -1; })[0];
      if(h) resp.push((new Date(h.fecha) - new Date(c.fecha)) / 3600000);
      if(c.estado === 'enviada' || c.estado === 'vista') esperan++;
      if((c.historial || []).some(function(x){ return x.estado === 'entrevista'; })) entrev++;
      if(c.estado === 'contratada') contr++;
      if(c.estado === 'descartada' && c.motivo) mot[c.motivo] = (mot[c.motivo] || 0) + 1;
    });
    var cerradas = l.filter(function(c){ return c.estado === 'caducada'; }).length;
    var base = resp.length + cerradas + esperan;
    var pct = base ? Math.round(resp.length / base * 100) : 0;
    var medio = resp.length ? resp.reduce(function(a,b){ return a+b; }, 0) / resp.length : null;
    var h = '<div style="font-size:11px;font-weight:800;letter-spacing:.8px;color:#6B7280;margin:0 0 10px;">TU CONTRATACIÓN</div><div class="mk-kpis">'
      + '<div class="mk-kpi"><b>'+l.length+'</b><span>solicitudes recibidas</span></div>'
      + '<div class="mk-kpi"><b>'+pct+' %</b><span>contestadas</span></div>'
      + '<div class="mk-kpi"><b>'+(medio == null ? '—' : dur(medio))+'</b><span>tardas en contestar</span></div>'
      + '<div class="mk-kpi'+(esperan ? ' al' : '')+'"'+(esperan ? ' role="button" tabindex="0" style="cursor:pointer;" onclick="showScreen(\'portal\')" onkeydown="if(event.key===\'Enter\')showScreen(\'portal\')"' : '')+'><b>'+esperan+'</b><span>'+(esperan ? 'esperan tu respuesta · contestar' : 'esperando respuesta')+'</span></div>'
      + '</div>';
    h += '<div class="mk-lin"><h4>De la solicitud al contrato</h4>'+l.length+' solicitudes → '+entrev+' entrevista'+(entrev === 1 ? '' : 's')+' → '+contr+' contratación'+(contr === 1 ? '' : 'es')+'.'
      + (medio != null ? ' La mitad de los candidatos espera noticias en 3 días o menos: ' + (medio <= 72 ? 'vas dentro.' : 'ahora tardas más que eso.') : '') + '</div>';
    var ks = Object.keys(mot).sort(function(a,b){ return mot[b] - mot[a]; });
    if(ks.length){
      var top = MOTIVOS.filter(function(m){ return m[0] === ks[0]; })[0];
      var pista = { exp:'Si se repite, dilo en los requisitos de la oferta: recibirás menos solicitudes que no puedes aceptar.', horario:'Si se repite, escribe el horario real en la oferta: es lo que más filtra antes de solicitar.', titulo:'Si se repite, pon la titulación como primer requisito.', distancia:'Si se repite, revisa la ubicación de la oferta.' }[ks[0]] || '';
      h += '<div class="mk-lin"><h4>Por qué descartas</h4>' + ks.map(function(k){ var m = MOTIVOS.filter(function(x){ return x[0] === k; })[0]; return e(m ? m[1] : k) + ': ' + mot[k]; }).join(' · ') + '.' + (pista && mot[ks[0]] >= 2 ? ' ' + pista : '') + '</div>';
    }
    return h;
  }
  // La usa renderStatsReal (clinica/01-panel.js)
  window.CERCO_cifrasEstadisticas = function(){
    var box = $('stats-real'), h = bloqueCifras();
    if(box && h && box.firstElementChild){
      var d = document.createElement('div'); d.id = 'mk-cifras'; d.innerHTML = h;
      box.insertBefore(d, box.firstElementChild.nextSibling);
      var v = box.querySelector('.cerco-empty h3'); if(v && /nada que medir/i.test(v.textContent)) v.textContent = 'Falta la parte de tu equipo';
    }
  };

  function listo(){ try{ montarOferta(); }catch(x){} try{ entradaHerramientas(); }catch(x){} }
  if(document.readyState === 'loading') document.addEventListener('DOMContentLoaded', listo); else listo();
})();

