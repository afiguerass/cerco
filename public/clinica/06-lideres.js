/* Archivo sacado tal cual de index.html (Fase 1, paso 1.6). El orden de carga
   importa: se carga en el mismo sitio de la página donde estaba. */
/* ================================================================
   CERCO · LO QUE HACEN LOS LÍDERES, LADO CLÍNICA
   - Efecto rebote: el candidato que CERCO te presenta llega marcado,
     con el motivo (lo que a tu equipo le falta).
   - Solicitudes destacadas (2 al mes por candidato), invitadas y
     colegiación, visibles en la tarjeta y en la ficha.
   - Si no contestas en 5 días, la solicitud se cierra: lo ves venir
     (la cuenta atrás aparece a partir del segundo día).
   - Buscar talento anónimo e invitarle a solicitar (10 por semana).
   - Contrato, convenio y periodo de prueba en cada oferta (RD 723/2026).
   - Seguimiento a los 90 días y valoración media del proceso.
   ================================================================ */
(function(){
  var e = function(t){ return _esc(t); };
  var IC5 = {
    star:'<polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>',
    rebote:'<path d="m17 2 4 4-4 4"/><path d="M3 11v-1a4 4 0 0 1 4-4h14"/><path d="m7 22-4-4 4-4"/><path d="M21 13v1a4 4 0 0 1-4 4H3"/>',
    send:'<path d="M14.536 21.686a.5.5 0 0 0 .937-.024l6.5-19a.496.496 0 0 0-.635-.635l-19 6.5a.5.5 0 0 0-.024.937l7.93 3.18a2 2 0 0 1 1.112 1.11z"/><path d="m21.854 2.147-10.94 10.939"/>',
    shield:'<path d="M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z"/>',
    clock:'<circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>',
    check:'<path d="M20 6 9 17l-5-5"/>',
    repetir:'<path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/><path d="M3 3v5h5"/>',
    users:'<path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/>',
    search:'<circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/>',
    video:'<path d="m16 13 5.223 3.482a.5.5 0 0 0 .777-.416V7.87a.5.5 0 0 0-.752-.432L16 10.5"/><rect x="2" y="6" width="14" height="12" rx="2"/>',
    file:'<path d="M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z"/><path d="M14 2v4a2 2 0 0 0 2 2h4"/>',
    x:'<path d="M18 6 6 18"/><path d="m6 6 12 12"/>'
  };
  function sv(k, c, s){ return _svg(IC5[k] || '', c, s); }
  var COL = {D:'#FF5A5F', I:'#F0A800', S:'#00B488', C:'#5B5FE0'};
  var NOM = {D:'Dominante', I:'Influyente', S:'Estable', C:'Concienzudo'};
  var L = ['D','I','S','C'];
  window.CERCO_DIAS_CADUCA = window.CERCO_DIAS_CADUCA || 5;
  function lista(){ try{ return (window.CERCO_candidaturas ? CERCO_candidaturas() : []); }catch(x){ return []; } }
  function enDemo(){ try{ return CDB.demo(); }catch(x){ return true; } }
  function db(){ try{ return Nube.db(); }catch(x){ return null; } }
  function uid(){ return (window.Nube && Nube.uid) || null; }
  function pill(txt, bg, col, ico){ return '<span style="display:inline-flex;align-items:center;gap:4px;background:'+bg+';color:'+col+';border-radius:99px;padding:3px 9px;font-size:11px;font-weight:800;white-space:nowrap;">'+(ico ? sv(ico, col, 11) : '')+txt+'</span>'; }
  function diasDesde(iso){ var t = new Date(iso).getTime(); return isNaN(t) ? 0 : (Date.now() - t) / 86400000; }
  function ultimaActividad(c){
    var t = [c.fecha];
    (c.historial || []).forEach(function(h){ if(h.estado === 'vista' || h.estado === 'interesa') t.push(h.fecha); });
    (c.mensajes || []).forEach(function(m){ if(m.de === 'clinica') t.push(m.f); });
    return t.filter(Boolean).sort().slice(-1)[0];
  }
  window.CERCO_quedanDias = function(c){ return quedanDias(c); };
  function quedanDias(c){
    if(c.estado !== 'enviada' && c.estado !== 'vista') return null;
    if(c.tipo === 'visita') return null;
    if(window._enVacaciones && _enVacaciones()) return null;   // plazos en pausa
    var h = window._hHab ? _hHab(c, ultimaActividad(c)) : diasDesde(ultimaActividad(c)) * 24;
    return Math.ceil(CERCO_DIAS_CADUCA - h / 24);
  }

  /* ---------- 1. tarjeta y ficha ---------- */
  window._extraPills = function(c){
    var h = '';
    if(c.destacada) h += ' ' + pill('Destacada', '#FFF4DB', '#8A5A00', 'star');
    if(c.origen === 'rebote') h += ' ' + pill('Te la presenta CERCO', '#F3EEFA', '#66328A', 'rebote');
    if(c.invitada) h += ' ' + pill('Aceptó tu invitación', '#E8EFFD', '#1A56DB', 'send');
    if(c.colegiado) h += ' ' + pill('Colegiado/a', '#E8F8F1', '#0B5B43', 'shield');
    if(c.preparada) h += ' ' + pill('Ha preparado la entrevista', '#EEF3FE', '#1E3A8A', 'check');
    if((c.discVeces || 1) > 1) h += ' ' + pill('Test repetido · ' + c.discVeces + ' veces', '#FFF4DB', '#8A5A00', 'repetir');
    return h;
  };
  window._extraLinea = function(c){
    var q = quedanDias(c), h = '';
    if(q !== null && q <= CERCO_DIAS_CADUCA - 2) h += '<div style="font-size:12px;font-weight:700;color:'+(q <= 1 ? '#B42318' : '#B45309')+';margin:2px 0 4px;display:flex;align-items:center;gap:5px;">'+sv('clock', q <= 1 ? '#B42318' : '#B45309', 12)+(q <= 0 ? 'Se cierra hoy si no le contestas' : 'Se cierra en '+q+' día'+(q === 1 ? '' : 's')+' laborable'+(q === 1 ? '' : 's')+' si no le contestas')+'</div>';
    if(c.origen === 'rebote' && c.rebote && c.rebote.motivo) h += '<div style="font-size:12.5px;color:#66328A;margin:2px 0 6px;line-height:1.45;">'+e(c.rebote.motivo)+'</div>';
    return h;
  };
  window._extraFicha = function(c){
    var h = '';
    if(c.origen === 'rebote') h += '<div style="margin-top:8px;background:#F6F0FB;border-radius:10px;padding:9px 11px;font-size:12.5px;color:#4A2266;line-height:1.5;">'+sv('rebote','#66328A',13)+' <b>Te lo presenta CERCO.</b> '+e((c.rebote && c.rebote.motivo) || 'Su perfil encaja con lo que buscas.')+' Ha aceptado que CERCO le presente a clínicas que buscan su forma de trabajar.</div>';
    if(c.destacada) h += '<div style="margin-top:8px;background:#FFF8EC;border-radius:10px;padding:9px 11px;font-size:12.5px;color:#8A5A00;line-height:1.5;">'+sv('star','#B45309',13)+' <b>Solicitud destacada.</b> Cada profesional solo puede destacar 2 al mes: esta es de las que más le importan.</div>';
    if(c.invitada) h += '<div style="margin-top:8px;background:#F4F7FE;border-radius:10px;padding:9px 11px;font-size:12.5px;color:#1E3A8A;line-height:1.5;">'+sv('send','#1A56DB',13)+' Ha solicitado después de que le invitaras.</div>';
    if(c.preparada) h += '<div style="margin-top:8px;background:#F4F7FE;border-radius:10px;padding:9px 11px;font-size:12.5px;color:#1E3A8A;line-height:1.5;">'+sv('check','#1A56DB',13)+' <b>Ha preparado la entrevista</b> con las mismas preguntas que tienes abajo. No sabes qué ha respondido: eso te lo cuenta en la entrevista.</div>';
    var q = quedanDias(c);
    if(q !== null) h += '<div style="margin-top:8px;font-size:12.5px;color:'+(q <= CERCO_DIAS_CADUCA - 2 ? '#B45309' : '#6B7280')+';">'+sv('clock', q <= CERCO_DIAS_CADUCA - 2 ? '#B45309' : '#9CA3AF', 12)+' Si no le contestas, CERCO cerrará la solicitud '+(q <= 0 ? 'hoy' : 'en '+q+' día'+(q === 1 ? '' : 's'))+' para que no siga esperando.</div>';
    return h;
  };

  /* ---------- 1b. test DISC repetido: cuántas veces y qué cambió ---------- */
  function nomDisc(x){ return x && x.dom ? NOM[x.dom] + (x.sec ? ' con rasgo ' + NOM[x.sec].toLowerCase() : '') : ''; }
  function fechaDisc(iso){
    var d = new Date(iso); if(isNaN(d)) return 'sin fecha';
    return d.getDate() + ' de ' + ['enero','febrero','marzo','abril','mayo','junio','julio','agosto','septiembre','octubre','noviembre','diciembre'][d.getMonth()] + ' de ' + d.getFullYear();
  }
  window._discHistFicha = function(c){
    var hist = (c.discHist || []).filter(function(x){ return x && x.dom; }), veces = c.discVeces || (hist.length + 1);
    if(veces < 2 && !hist.length) return '';
    var alSolicitar = null;
    if(c.discCambio && c.fecha && c.discCambio > c.fecha){
      // el resultado vigente al solicitar es el último hecho antes de esa fecha
      var antes = hist.filter(function(x){ return x.fecha && x.fecha <= c.fecha; });
      alSolicitar = antes.length ? antes[antes.length - 1] : null;
    }
    var cambio = alSolicitar && c.disc && (alSolicitar.dom !== c.disc.dom || alSolicitar.sec !== c.disc.sec);
    var h = '<div style="border-top:1px solid #F1F2F4;margin-top:12px;padding-top:12px;">'
      + '<div style="display:flex;align-items:center;gap:6px;font-size:13px;font-weight:800;color:#8A5A00;">' + sv('repetir', '#B45309', 14) + 'Ha hecho el test ' + veces + ' veces</div>';
    if(c.discCambio && c.fecha && c.discCambio > c.fecha) h += '<div style="font-size:12.5px;color:#374151;line-height:1.55;margin-top:6px;">Lo repitió el ' + e(fechaDisc(c.discCambio)) + ', después de solicitar. '
      + (!alSolicitar ? '' : cambio ? 'Cuando solicitó era <b>' + e(nomDisc(alSolicitar)) + '</b>; ahora es <b>' + e(nomDisc(c.disc)) + '</b>.' : 'Su perfil no ha cambiado.') + '</div>';
    if(hist.length) h += '<div style="font-size:12px;color:#6B7280;margin:10px 0 4px;">Resultados anteriores</div>'
      + hist.slice().reverse().map(function(x){
          return '<div style="display:flex;align-items:center;gap:8px;padding:5px 0;font-size:12.5px;color:#374151;">'
            + '<span style="width:22px;height:22px;border-radius:50%;background:' + COL[x.dom] + ';color:white;display:inline-flex;align-items:center;justify-content:center;font-size:11px;font-weight:800;flex-shrink:0;">' + x.dom + '</span>'
            + '<span style="flex:1;min-width:0;">' + e(nomDisc(x)) + '</span><span style="color:#6B7280;white-space:nowrap;">' + e(fechaDisc(x.fecha)) + '</span></div>';
        }).join('');
    h += '<div style="font-size:11.5px;color:#6B7280;line-height:1.5;margin-top:6px;">Repetirlo es normal si la primera vez lo hizo con prisa. Si el resultado cambia mucho, pregúntale en la entrevista cómo se ve.</div></div>';
    return h;
  };

  /* ---------- 2. oferta: contrato, convenio y prueba ---------- */
    
  /* ---------- 3. buscar talento e invitar ---------- */
  var PROF_RE = {
    'Higienista dental':/higien/i, 'Auxiliar de clínica dental':/auxiliar|asistente|ayudante/i,
    'Odontólogo/a':/odont|dentist|implant|endodon|periodon|est[eé]tica dental|general/i, 'Ortodoncista':/ortodon/i,
    'Protésico/a dental':/prot[eé]sic|laboratorio/i, 'Recepción y atención al paciente':/recepci|atenci[oó]n al paciente|front ?desk|administrativ/i,
    'Coordinación o gerencia de clínica':/coordinad|gerent|direct|manager|responsable/i
  };
  var MAX_INV = 10;
  var T = { l:null, cargando:false, invs:[], hora:0 };
  function ofertasActivas(){ var l = []; try{ l = getSavedOffers(); }catch(x){} return l.filter(function(o){ return o.estado !== 'cerrada' && o.estado !== 'pausada'; }); }
  function perfilesDe(o){ var ps = (o && Array.isArray(o.perfiles) && o.perfiles.length) ? o.perfiles : (o && o.disc ? String(o.disc).split('+').map(function(x){ return x.trim(); }) : []); return ps.filter(function(x){ return L.indexOf(x) > -1; }); }
  function encajeT(t, o){
    var ps = perfilesDe(o), d = t.disc; if(!d || !d.norm || !ps.length) return null;
    var s = 0; ps.forEach(function(l){ s += d.norm[l] || 0; });
    var top = L.map(function(l){ return d.norm[l] || 0; }).sort(function(a,b){ return b-a; }).slice(0, ps.length).reduce(function(a,b){ return a+b; }, 0);
    return top ? Math.max(30, Math.min(97, Math.round(100*s/top))) : null;
  }
  function origen(){
    var c = {}; try{ c = CDB.clinica() || {}; }catch(x){}
    var i = document.getElementById('clinic-address-portal');
    var g = (i && i.value.trim() && window.CGeo && CGeo.lugar(i.value)) || (window.CGeo && CGeo.lugar(c.ciutat));
    return g ? CGeo.geo(g) : null;
  }
  // en directo: si alguien se activa o responde a tu invitación, lo ves sin recargar
  var _subT = null, _subI = null;
  function cargarTalento(){
    if(_subT || !db() || !uid()) return;
    try{
      _subT = db().collection('talento').limit(400).onSnapshot(function(q){ var l = []; q.forEach(function(d){ var x = d.data(); x.uid = d.id; l.push(x); }); T.l = l; pintarTalento(); }, function(){ T.l = T.l || []; pintarTalento(); });
      _subI = db().collection('invitaciones').where('clinicaId','==',uid()).onSnapshot(function(q){
        var antes = {}; T.invs.forEach(function(i){ antes[i.id] = i.estado; });
        var l = []; q.forEach(function(d){ var x = d.data(); x.id = d.id; l.push(x); });
        if(T.invs.length && typeof showToast === 'function') l.forEach(function(i){ if(antes[i.id] === 'pendiente' && i.estado === 'rechazada') showToast('Un profesional al que invitaste ha dicho que esta vez no'); });
        T.invs = l; pintarTalento();
      }, function(){});
    }catch(x){}
  }
  function invitacionesSemana(){ return T.invs.filter(function(i){ return diasDesde(i.fecha) < 7; }).length; }
  function candidatosPara(o){
    var org = origen(), yaSol = {}, mi = uid();
    lista().forEach(function(c){ if(!o || String(c.ofertaId) === String(o.id)) yaSol[c.candidatoUid] = 1; });
    var re = null; if(o){ for(var k in PROF_RE) if(!re && PROF_RE[k].test(o.titulo || '')) re = k; }
    var falta = null; try{ var d = CDB.perfilQueFalta(); if(d && d.fiable) falta = d.falta; }catch(x){}
    return (T.l || []).filter(function(t){
      if(t.uid === mi || yaSol[t.uid]) return false;
      if((t.ocultar || []).indexOf(mi) > -1) return false;          // se ha ocultado a esta clínica
      if(re && t.profesion && t.profesion !== re) return false;
      if(org && t.geo && window.CGeo && !CGeo.dentro(t.geo, org, t.radio || 25)) return false;  // no se desplazaría
      return true;
    }).map(function(t){
      var p = o ? encajeT(t, o) : null, km = org && t.geo && window.CGeo ? CGeo.km(org, t.geo) : null;
      var sc = (p || 50) + (falta && t.disc && t.disc.dom === falta ? 15 : 0) - (km || 0)/5 + (t.video ? 3 : 0);
      return { t:t, p:p, km:km, sc:sc, falta: falta && t.disc && t.disc.dom === falta };
    }).sort(function(a,b){ return b.sc - a.sc; });
  }
  function invDe(t, o){ for(var i=0;i<T.invs.length;i++){ var x = T.invs[i]; if(x.candidatoUid === t.uid && (!o || String(x.ofertaId) === String(o.id))) return x; } return null; }
  function contenedor(){
    var box = document.getElementById('portal-talento'); if(box) return box;
    var ref = document.getElementById('portal-reales') || document.getElementById('grid-portal'); if(!ref || !ref.parentNode) return null;
    box = document.createElement('div'); box.id = 'portal-talento'; box.style.cssText = 'margin-bottom:20px;';
    ref.parentNode.insertBefore(box, ref.nextSibling); return box;
  }
  function pintarTalento(){
    var box = contenedor(); if(!box) return;
    if(enDemo() || !uid()){ box.innerHTML = ''; box.style.display = 'none'; return; }
    box.style.display = '';
    if(!T.l){ box.innerHTML = ''; cargarTalento(); return; }
    var oa = ofertasActivas(), elegida = window._talOferta ? oa.filter(function(x){ return String(x.id) === String(window._talOferta); })[0] : null;
    var o = (typeof ofertaEnPortal !== 'undefined' && ofertaEnPortal) ? ofertaEnPortal : (elegida || oa[0] || null);
    var l = candidatosPara(o), quedan = MAX_INV - invitacionesSemana();
    // una oferta por profesión: así la clínica busca higienistas, auxiliares… cada cosa en su sitio
    var porGrupo = {}, chipsT = '';
    if(!(typeof ofertaEnPortal !== 'undefined' && ofertaEnPortal) && window.CERCO_grupo){
      oa.forEach(function(x){ var g = CERCO_grupo(x.titulo); if(!porGrupo[g.k]) porGrupo[g.k] = {g:g, o:x}; });
      var ks = CERCO_GRUPOS.map(function(g){ return g.k; }).filter(function(k){ return porGrupo[k]; });
      if(ks.length > 1) chipsT = '<div class="prof-chips" role="group" aria-label="Buscar talento por profesión">' + ks.map(function(k){ var x = porGrupo[k], on = o && String(o.id) === String(x.o.id);
        return '<button type="button" class="prof-chip'+(on ? ' on' : '')+'" aria-pressed="'+on+'" onclick="window._talOferta=\''+e(x.o.id)+'\'; renderPortalReal()">'+e(x.g.n)+'</button>'; }).join('') + '</div>';
    }
    var h = '<div style="display:flex;align-items:flex-end;justify-content:space-between;gap:10px;flex-wrap:wrap;margin:6px 0 10px;">'
      + '<div><div style="font-size:16px;font-weight:800;color:#111827;display:flex;align-items:center;gap:8px;">'+sv('search','#1A56DB',17)+'Talento que encaja'+(o ? ' con «'+e(o.titulo)+'»' : '')+'</div>'
      + '<div style="font-size:12.5px;color:#6B7280;margin-top:2px;line-height:1.5;">Profesionales que han pedido que las clínicas les inviten. Son anónimos: verás su nombre y su contacto cuando solicite.</div>' + chipsT + '</div>'
      + '<div style="font-size:12px;font-weight:700;color:'+(quedan > 0 ? '#1A56DB' : '#B42318')+';background:'+(quedan > 0 ? '#EEF3FE' : '#FEF2F2')+';border-radius:99px;padding:5px 11px;white-space:nowrap;">'+Math.max(0, quedan)+' de '+MAX_INV+' invitaciones esta semana</div></div>';
    if(!o) h += '<div style="background:white;border:1px dashed #D8DEE9;border-radius:14px;padding:18px;text-align:center;font-size:13.5px;color:#6B7280;">Publica una oferta y aquí verás quién encaja con ella.</div>';
    else if(!l.length) h += '<div style="background:white;border:1px dashed #D8DEE9;border-radius:14px;padding:18px;text-align:center;font-size:13.5px;color:#6B7280;line-height:1.6;">Ahora mismo nadie de tu zona con esta profesión está buscando de forma activa. Cuando alguien se active, aparecerá aquí.</div>';
    else h += '<div style="display:grid;gap:10px;">' + l.slice(0,6).map(function(x){ return tarjetaTalento(x, o, quedan); }).join('') + '</div>'
      + (l.length > 6 ? '<div style="font-size:12.5px;color:#6B7280;margin-top:8px;">Y '+(l.length-6)+' más.</div>' : '');
    box.innerHTML = h;
  }
  function tarjetaTalento(x, o, quedan){
    var t = x.t, d = t.disc || {}, inv = invDe(t, o);
    var est = inv ? (inv.estado === 'aceptada' ? pill('Ha solicitado', '#E8F8F1', '#0B5B43', 'check') : (inv.estado === 'rechazada' ? pill('Esta vez no le interesa', '#F3F4F6', '#6B7280') : pill('Invitación enviada', '#E8EFFD', '#1A56DB', 'send'))) : '';
    var btn = inv ? '' : '<button onclick="abrirInvitar(\''+e(t.uid)+'\')" '+(quedan > 0 ? '' : 'disabled ')+'style="background:'+(quedan > 0 ? '#1A56DB' : '#E5E7EB')+';color:'+(quedan > 0 ? 'white' : '#9CA3AF')+';border:none;border-radius:9px;padding:9px 14px;font-size:13px;font-weight:800;cursor:'+(quedan > 0 ? 'pointer' : 'default')+';font-family:inherit;display:inline-flex;align-items:center;gap:6px;white-space:nowrap;">'+sv('send', quedan > 0 ? 'white' : '#9CA3AF', 14)+'Invitar a solicitar</button>';
    return '<div class="talento-card" style="background:white;border:1px solid #EAECF0;border-radius:14px;padding:14px 16px;display:flex;gap:14px;align-items:center;flex-wrap:wrap;">'
      + '<div style="width:44px;height:44px;border-radius:50%;background:'+(d.dom ? COL[d.dom] : '#EEF3FE')+';color:white;display:flex;align-items:center;justify-content:center;font-weight:800;flex-shrink:0;">'+e(d.dom || '?')+'</div>'
      + '<div style="flex:1;min-width:200px;">'
      +   '<div style="font-size:14.5px;font-weight:800;color:#111827;">'+e(t.profesion || 'Profesional')+' · '+e(t.experiencia || '')+'</div>'
      +   '<div style="font-size:12.5px;color:#4B5563;margin-top:2px;">'+(d.dom ? NOM[d.dom]+(d.sec ? ' con rasgo '+NOM[d.sec].toLowerCase() : '') : '')+(t.geo ? ' · vive en '+e(t.geo.n)+(x.km !== null ? ', a '+x.km+' km' : '') : '')+'</div>'
      +   '<div style="font-size:12px;color:#6B7280;margin-top:3px;">'+[t.jornada ? 'Jornada '+String(t.jornada).toLowerCase() : '', t.disponibilidad ? 'Empieza: '+String(t.disponibilidad).toLowerCase() : '', t.video ? 'con vídeo' : '', t.cv ? 'con CV' : '', t.colegiado ? 'colegiado/a' : ''].filter(Boolean).map(e).join(' · ')+'</div>'
      +   (x.falta ? '<div style="font-size:12px;color:#0B6B4F;background:#E8F8F1;border-radius:8px;padding:5px 9px;margin-top:6px;display:inline-block;"><b>Es el perfil que más le falta a tu equipo.</b></div>' : '')
      +   (est ? '<div style="margin-top:6px;">'+est+'</div>' : '')
      + '</div>'
      + '<div style="text-align:center;flex-shrink:0;min-width:56px;">'+(x.p !== null ? '<div style="font-size:20px;font-weight:800;color:'+(x.p >= 80 ? '#0E9F6E' : (x.p >= 65 ? '#1A56DB' : '#6B7280'))+';">'+x.p+'%</div><div style="font-size:10.5px;color:#6B7280;">encaje</div>' : '')+'</div>'
      + btn + '</div>';
  }
  window.abrirInvitar = function(tuid){
    var t = (T.l || []).filter(function(x){ return x.uid === tuid; })[0]; if(!t) return;
    var ofs = ofertasActivas(); if(!ofs.length) return;
    var o0 = (typeof ofertaEnPortal !== 'undefined' && ofertaEnPortal) ? ofertaEnPortal : ofs[0];
    var cli = ''; try{ cli = CDB.nombreClinica(); }catch(x){}
    var m = document.createElement('div'); m.id = 'modal-inv';
    m.style.cssText = 'position:fixed;inset:0;background:rgba(10,14,30,.55);display:flex;align-items:center;justify-content:center;z-index:10003;padding:16px;box-sizing:border-box;';
    m.onclick = function(ev){ if(ev.target === m) m.remove(); };
    m.innerHTML = '<div style="background:white;border-radius:18px;max-width:460px;width:100%;padding:20px;box-shadow:0 24px 60px rgba(0,0,0,.25);">'
      + '<div style="font-size:18px;font-weight:800;color:#111827;margin-bottom:4px;">Invitar a solicitar</div>'
      + '<div style="font-size:13px;color:#6B7280;line-height:1.55;margin-bottom:14px;">'+e(t.profesion||'')+' · '+e((t.geo||{}).n||'')+'. Le llegará un aviso en CERCO. Si le interesa, solicitará y verás su perfil completo.</div>'
      + '<label for="inv-of" style="display:block;font-size:13px;font-weight:700;color:#374151;margin-bottom:6px;">Oferta</label>'
      + '<select id="inv-of" style="width:100%;border:1px solid #E5E7EB;border-radius:10px;padding:10px 12px;font-size:14px;font-family:inherit;margin-bottom:12px;">'+ofs.map(function(o){ return '<option value="'+e(o.id)+'"'+(String(o.id) === String(o0.id) ? ' selected' : '')+'>'+e(o.titulo)+'</option>'; }).join('')+'</select>'
      + '<label for="inv-msg" style="display:block;font-size:13px;font-weight:700;color:#374151;margin-bottom:6px;">Mensaje <span style="font-weight:500;color:#6B7280;">(opcional)</span></label>'
      + '<textarea id="inv-msg" maxlength="300" style="width:100%;box-sizing:border-box;min-height:84px;border:1px solid #E5E7EB;border-radius:10px;padding:10px 12px;font-size:14px;font-family:inherit;line-height:1.5;">Hola, en '+e(cli || 'nuestra clínica')+' buscamos a alguien como tú. Nos encantaría que nos conocieras.</textarea>'
      + '<div id="inv-err" style="font-size:12.5px;color:#DC2626;margin:6px 0;"></div>'
      + '<div style="display:flex;gap:8px;"><button onclick="document.getElementById(\'modal-inv\').remove()" style="flex:1;background:white;color:#374151;border:1px solid #E5E7EB;border-radius:10px;padding:12px;font-size:13.5px;font-weight:700;cursor:pointer;font-family:inherit;">Cancelar</button>'
      + '<button id="inv-ok" onclick="enviarInvitacion(\''+e(tuid)+'\')" style="flex:2;background:#1A56DB;color:white;border:none;border-radius:10px;padding:12px;font-size:13.5px;font-weight:800;cursor:pointer;font-family:inherit;">Enviar invitación</button></div></div>';
    document.body.appendChild(m);
  };
  window.enviarInvitacion = function(tuid){
    if(!window._unaSolaVez('inv', 1500)) return;
    if(invitacionesSemana() >= MAX_INV){ document.getElementById('inv-err').textContent = 'Ya has enviado '+MAX_INV+' invitaciones esta semana.'; return; }
    var oid = (document.getElementById('inv-of')||{}).value, o = ofertasActivas().filter(function(x){ return String(x.id) === String(oid); })[0];
    if(!o) return;
    var t = (T.l || []).filter(function(x){ return x.uid === tuid; })[0] || {};
    var cli = ''; try{ cli = CDB.nombreClinica(); }catch(x){}
    var doc = { clinicaId:uid(), clinica:String(cli||'Clínica').slice(0,120), candidatoUid:tuid, ofertaId:String(o.id), ofertaTitulo:String(o.titulo||'').slice(0,120),
      mensaje:((document.getElementById('inv-msg')||{}).value||'').trim().slice(0,300), estado:'pendiente', fecha:new Date().toISOString(), encaje:encajeT(t, o) };
    var b = document.getElementById('inv-ok'); if(b){ b.disabled = true; b.textContent = 'Enviando…'; }
    db().collection('invitaciones').doc(String(o.id) + '_' + tuid).set(doc).then(function(){
      doc.id = String(o.id) + '_' + tuid; T.invs.push(doc);
      var m = document.getElementById('modal-inv'); if(m) m.remove();
      if(typeof showToast === 'function') showToast('Invitación enviada. Te avisaremos si solicita.');
      pintarTalento();
    }).catch(function(){ if(b){ b.disabled = false; b.textContent = 'Volver a enviar'; } document.getElementById('inv-err').textContent = 'No se ha podido enviar. Revisa tu conexión.'; });
  };
  // Candidatos: «Talento que encaja». Lo usa renderPortalReal (clinica/01g-datos-de-la-clinica.js)
  window.CERCO_candidatosTalento = function(){
    try{ pintarTalento(); cargarTalento(); }catch(x){}
  };

  /* ---------- 4. inicio: seguimiento, plazos, valoración ---------- */
  var VAL = { l:null };
  function cargarValoraciones(){
    if(VAL.sub || !db() || !uid()) return;
    try{
      VAL.sub = db().collection('valoraciones').where('clinicaId','==',uid()).onSnapshot(function(q){
        var l = []; q.forEach(function(d){ var x = d.data(); if(x.n >= 1 && x.n <= 5) l.push(x); });
        var cambia = !VAL.l || VAL.l.length !== l.length; VAL.l = l;
        if(cambia){ try{ renderInicioReal(); }catch(x){} }
      }, function(){});
    }catch(x){}
  }
  window.responderSeguimientoCl = function(id, sigue){
    var c = lista().filter(function(x){ return x.id === id; })[0]; if(!c) return;
    db().collection('candidaturas').doc(id).update({seguimientoCl:{sigue:!!sigue, f:new Date().toISOString()}}).then(function(){
      try{ var l = lista(); l.forEach(function(x){ if(x.id === id) x.seguimientoCl = {sigue:!!sigue}; }); localStorage.setItem('cerco_candidaturas', JSON.stringify(l)); }catch(x){}
      if(typeof showToast === 'function') showToast('Gracias. Con esto CERCO aprende qué perfiles se quedan en tu equipo.');
      try{ renderInicioReal(); }catch(x){}
    }).catch(function(){ if(typeof showToast === 'function') showToast('No se ha podido guardar.'); });
  };
  // Inicio: seguimiento a los 90 días, plazos y valoraciones. Lo usa renderInicioReal (clinica/01g-datos-de-la-clinica.js)
  window.CERCO_inicioLider = function(){
    try{
      var box = document.getElementById('inicio-real'); var v = document.getElementById('inicio-lider'); if(v) v.remove();
      if(!box || box.style.display === 'none' || enDemo()) return;
      cargarValoraciones();
      var filas = [];
      var hoy = Date.now();
      lista().filter(function(c){
        var f = (c.historial || []).filter(function(h){ return h.estado === 'contratada'; }).slice(-1)[0];
        return c.estado === 'contratada' && f && !c.seguimientoCl && hoy - new Date(f.fecha) > 90*86400000;
      }).slice(0,2).forEach(function(c){
        filas.push('<div style="padding:12px 18px;border-top:1px solid #F3F4F6;"><div style="font-size:14px;font-weight:800;color:#111827;">¿Sigue '+e(c.nombre)+' en tu equipo?</div><div style="font-size:12.5px;color:#6B7280;margin:2px 0 8px;">Hace 3 meses que le contrataste. Tu respuesta nos dice si el encaje DISC acierta.</div>'
          + '<div style="display:flex;gap:8px;"><button onclick="responderSeguimientoCl(\''+e(c.id)+'\', true)" style="background:#0E9F6E;color:white;border:none;border-radius:9px;padding:8px 14px;font-size:13px;font-weight:800;cursor:pointer;font-family:inherit;">Sí, sigue</button><button onclick="responderSeguimientoCl(\''+e(c.id)+'\', false)" style="background:white;color:#374151;border:1px solid #E5E7EB;border-radius:9px;padding:8px 14px;font-size:13px;font-weight:700;cursor:pointer;font-family:inherit;">Ya no</button></div></div>');
      });
      var urg = lista().filter(function(c){ var q = quedanDias(c); return q !== null && q <= CERCO_DIAS_CADUCA - 2; }).sort(function(a,b){ return quedanDias(a) - quedanDias(b); });
      if(urg.length) filas.push('<div onclick="abrirFichaCandidato(\''+e(urg[0].id)+'\')" style="display:flex;gap:12px;align-items:center;padding:12px 18px;border-top:1px solid #F3F4F6;cursor:pointer;"><div style="width:38px;height:38px;border-radius:10px;background:#FEF2F2;display:flex;align-items:center;justify-content:center;flex-shrink:0;">'+sv('clock','#B42318',17)+'</div><div style="flex:1;min-width:0;"><div style="font-size:14px;font-weight:800;color:#111827;">'+(urg.length === 1 ? e(urg[0].nombre)+' lleva días esperando' : urg.length+' solicitudes llevan días esperando')+'</div><div style="font-size:12.5px;color:#B42318;">'+(quedanDias(urg[0]) <= 0 ? 'Se cierra hoy' : 'La primera se cierra en '+quedanDias(urg[0])+' día'+(quedanDias(urg[0]) === 1 ? '' : 's'))+' si no contestas. Contestar a tiempo te da la insignia «Clínica que responde».</div></div></div>');
      if(VAL.l && VAL.l.length >= 5){
        var m = Math.round(VAL.l.reduce(function(a,b){ return a + b.n; }, 0) / VAL.l.length * 10) / 10;
        var com = VAL.l.filter(function(x){ return x.t; }).slice(-2);
        filas.push('<div style="padding:12px 18px;border-top:1px solid #F3F4F6;"><div style="font-size:14px;font-weight:800;color:#111827;display:flex;align-items:center;gap:6px;">'+sv('star','#F0A000',16)+String(m).replace('.',',')+' de 5 <span style="font-size:12.5px;font-weight:600;color:#6B7280;">· así valoran tu proceso '+VAL.l.length+' profesionales (anónimo)</span></div>'
          + com.map(function(x){ return '<div style="font-size:12.5px;color:#4B5563;margin-top:6px;font-style:italic;">«'+e(x.t)+'»</div>'; }).join('') + '</div>');
      } else if(VAL.l && VAL.l.length) filas.push('<div style="padding:12px 18px;border-top:1px solid #F3F4F6;font-size:12.5px;color:#6B7280;">'+sv('star','#F0A000',14)+' Tienes '+VAL.l.length+' valoraci'+(VAL.l.length === 1 ? 'ón' : 'ones')+' de profesionales. Verás la media cuando haya al menos 5.</div>');
      if(!filas.length) return;
      var el = document.createElement('div'); el.id = 'inicio-lider';
      el.style.cssText = 'background:white;border:1px solid #EAECF0;border-radius:16px;overflow:hidden;margin-bottom:16px;box-shadow:0 1px 4px rgba(0,0,0,.04);';
      el.innerHTML = '<div style="padding:14px 18px;font-size:13px;font-weight:800;color:#111827;letter-spacing:.3px;">PARA HOY</div>' + filas.join('');
      var ref = document.getElementById('inicio-citas') || document.getElementById('inicio-solicitudes') || box.querySelector('.inicio-kpis');
      if(ref && ref.nextSibling) box.insertBefore(el, ref.nextSibling); else box.appendChild(el);
    }catch(x){}
  };
  try{ CDB.renderTodo(); }catch(x){}
})();
