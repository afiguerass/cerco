/* Archivo sacado tal cual de candidato.html (Fase 1, paso 1.6). El orden de carga
   importa: se carga en el mismo sitio de la página donde estaba. */
/* ================================================================
   CERCO · INICIO DEL PROFESIONAL, IGUAL QUE EL DE LA CLÍNICA
   - "Primeros pasos": la misma tarjeta que ve el propietario
     (datos, test, vídeo, foto y CV, primera solicitud).
   - Seimian te recomienda clínicas, con el motivo de cada una.
   - Editar el vídeo: recortar el principio y el final y elegir portada.
   ================================================================ */

/* ---------- primeros pasos ---------- */
function pasosCandidato(){
  var p = S.perfil || {};
  return [
    { ok: !!(p.alta && p.profesion && p.ciudad), tit:'Completa tu perfil',
      sub: p.profesion ? p.profesion + (p.ciudad ? ' · ' + p.ciudad : '') : 'Profesión, experiencia y dónde vives',
      btn:'Completar', acc:'editarPerfil()' },
    { ok: !!p.disc, tit:'Haz tu test de personalidad',
      sub: p.disc ? 'Hecho — eres ' + NOMBRE[p.disc.dom].toLowerCase() + ' con rasgo ' + NOMBRE[p.disc.sec].toLowerCase() : 'Son 5 minutos. Sin él no puedes solicitar ofertas',
      btn:'Hacer el test', acc:'abrirTest(false)' },
    { ok: !!p.video, tit:'Graba tu vídeo de presentación',
      sub: p.video ? 'Hecho — es lo primero que ve la clínica' : 'Hasta 1 minuto. Es lo primero que ve la clínica',
      btn:'Grabar', acc:'ir(\'perfil\'); setTimeout(abrirGrabadora, 200)' },
    { ok: !!(p.foto && p.cv), tit:'Añade tu foto y tu CV',
      sub: p.foto && p.cv ? 'Hecho — foto y CV en PDF' : (p.foto ? 'Falta tu CV en PDF' : (p.cv ? 'Falta tu foto' : 'La foto sale en tu tarjeta; el CV lo descarga la clínica')),
      btn:'Añadir', acc:'ir(\'perfil\')' },
    { ok: S.sols.length > 0, tit:'Envía tu primera solicitud',
      sub: S.sols.length ? (S.sols.length + ' solicitud' + (S.sols.length > 1 ? 'es' : '') + ' enviada' + (S.sols.length > 1 ? 's' : '')) : 'Elige una oferta que encaje contigo',
      btn:'Ver ofertas', acc:'ir(\'ofertas\')' }
  ];
}
function tarjetaPasos(){
  var pasos = pasosCandidato(), hechos = pasos.filter(function(x){ return x.ok; }).length, n = pasos.length;
  if(hechos >= n) return '';
  var sig = -1; pasos.forEach(function(x, i){ if(sig < 0 && !x.ok) sig = i; });
  var h = '<div class="pasos-card"><div class="pasos-cab">'
    + '<div style="display:flex;justify-content:space-between;align-items:center;gap:12px;">'
    + '<div><div class="pasos-t">Primeros pasos</div><div class="pasos-s">Tu panel se irá llenando a medida que los completes</div></div>'
    + '<div class="pasos-n">'+hechos+' de '+n+'</div></div>'
    + '<div class="pasos-barra"><div style="width:'+(hechos/n*100)+'%;"></div></div></div>';
  // el siguiente paso, el único con botón principal
  var x = pasos[sig];
  h += '<div class="paso-row paso-sig"><div class="paso-num">'+(sig+1)+'</div>'
    + '<div style="flex:1;min-width:0;"><div class="paso-eti">Siguiente paso</div><div class="paso-tit">'+x.tit+'</div><div class="paso-sub">'+esc(x.sub)+'</div></div>'
    + '<button class="paso-btn" onclick="'+x.acc+'">'+x.btn+'</button></div>';
  // los demás pendientes, discretos
  pasos.forEach(function(y, i){
    if(y.ok || i === sig) return;
    h += '<button class="paso-row paso-luego" onclick="'+y.acc+'"><div class="paso-num">'+(i+1)+'</div><div style="flex:1;min-width:0;text-align:left;"><div class="paso-tit">'+y.tit+'</div></div>'+svg('right','#6B7280',16)+'</button>';
  });
  if(hechos) h += '<details class="pasos-hechos"><summary>'+svg('check','#047857',14)+hechos+' '+(hechos === 1 ? 'paso hecho' : 'pasos hechos')+'</summary>'
    + pasos.filter(function(y){ return y.ok; }).map(function(y){ return '<div class="paso-row hecho"><div class="paso-num">'+svg('check','#0E9F6E',15)+'</div><div style="flex:1;min-width:0;"><div class="paso-tit">'+y.tit+'</div><div class="paso-sub">'+esc(y.sub)+'</div></div></div>'; }).join('')
    + '</details>';
  return h + '</div>';
}

/* ---------- Seimian te recomienda clínicas ---------- */
function clinicasRecomendadas(){
  var p = S.perfil || {}, d = p.disc; if(!d || !hayReales()) return [];
  var zc = ofertasCerca(ofertasVisibles().filter(function(o){ return !o.ejemplo && !solDeOferta(o.id) && mismaProfesion(o, p); }));
  var base = zc.dentro.length ? zc.dentro : zc.fuera;
  var vis = {}, out = [];
  base.filter(function(o){ return mismaProfesion(o, p); }).map(function(o){
    var eq = ((S.clinicas[o.clinicaId] || {}).equipo) || {}, fit = encaje(d, o), st = statsResp(o.clinicaId), km = kmDe(o, p.geo);
    var falta = eq.fiable ? (eq.falta === d.dom ? 2 : (eq.falta === d.sec ? 1 : 0)) : 0;
    var sc = (fit || 50) + falta*20 - (km || 0)/5 + (st && !st.nueva && st.pct >= 80 ? 8 : 0);
    var motivo = falta === 2 ? 'A su equipo le falta sobre todo perfil ' + NOMBRE[d.dom].toLowerCase() + ', que es justo el tuyo.'
               : falta === 1 ? 'A su equipo le falta perfil ' + NOMBRE[d.sec].toLowerCase() + ', tu segundo rasgo.'
               : fit !== null && fit >= 80 ? 'Busca justo tu forma de trabajar: ' + perfilesDe(o).map(function(l){ return NOMBRE[l].toLowerCase(); }).join(' y ') + '.'
               : km !== null && km <= 10 ? 'Te queda muy cerca y es de tu profesión.'
               : 'Es de tu profesión y está dentro de tu distancia.';
    if(st && !st.nueva && st.pct >= 80) motivo += ' Contesta al ' + st.pct + ' % de las solicitudes.';
    return { o:o, sc:sc, fit:fit, km:km, motivo:motivo, lejos: !zc.dentro.length };
  }).sort(function(a,b){ return b.sc - a.sc; }).forEach(function(x){ if(!vis[x.o.clinicaId] && out.length < 3){ vis[x.o.clinicaId] = 1; out.push(x); } });
  return out;
}
function mensajeSeimianC(rec){
  var p = S.perfil || {};
  if(!p.disc) return 'Cuando hagas el test te diré qué clínicas buscan justo tu forma de trabajar. Son 5 minutos.';
  if(!hayReales()) return 'Todavía no hay clínicas con ofertas publicadas. En cuanto las haya, te digo cuáles te convienen y por qué.';
  if(!rec.length) return 'Ahora mismo no hay clínicas nuevas de tu profesión que no hayas solicitado. Te aviso cuando se publique una.';
  var l = rec[0].lejos;
  return (l ? 'Dentro de tu distancia no hay ninguna ahora. Estas son las más cercanas que te recomiendo: ' : (rec.length === 1 ? 'Te recomiendo esta clínica: ' : 'Te recomiendo estas ' + rec.length + ' clínicas, por este orden: '))
    + 'miro qué le falta a su equipo, lo que pide la oferta, cuánto contesta y lo cerca que te queda.';
}
function bloqueSeimianInicio(){
  var rec = clinicasRecomendadas(), p = S.perfil || {};
  var h = '<div class="sei-ini"><div class="sei-ini-e">'+svg('sparkles','#F5A623',15)+'Seimian</div>'
    + '<div class="sei-ini-t">'+esc(mensajeSeimianC(rec))+'</div>'
    + (!p.disc ? '<button class="paso-btn" style="margin-top:12px;" onclick="abrirTest(false)">Hacer el test</button>' : '') + '</div>';
  rec.forEach(function(x, i){
    var o = x.o;
    h += '<div class="rec-cl" onclick="ir(\'oferta\',\''+esc(o.id)+'\')"><div class="rec-n">'+(i+1)+'</div>'
      + '<div style="flex:1;min-width:0;"><div class="rec-t">'+esc(o.clinica||'Clínica')+'</div>'
      + '<div class="rec-s">'+esc(o.titulo)+(x.km !== null ? (x.km < 1 ? ' · en tu zona' : ' · a '+x.km+' km') : '')+(o.salario ? ' · '+esc(o.salario) : '')+'</div>'
      + '<div class="rec-m">'+esc(x.motivo)+'</div></div>'
      + '<div class="ring">'+anillo(x.fit)+'<small>'+etiquetaEncaje(x.fit)+'</small></div></div>';
  });
  return h;
}


/* ================================================================
   INICIO · lo que necesita tu respuesta y las novedades
   Igual que en el panel de la clínica («Necesitan tu respuesta» y
   «Para hoy»): lo urgente arriba, una fila por cosa, un botón por fila.
   ================================================================ */
function filaIn(ic, col, fondo, tit, sub, btn, acc, extra){
  return '<div class="inb-f"><div class="inb-ic" style="background:'+fondo+'">'+svg(ic, col, 18)+'</div>'
    + '<div class="inb-tx"><div class="inb-t">'+tit+'</div>'+(sub ? '<div class="inb-s">'+sub+'</div>' : '')+'</div>'
    + (btn ? '<button class="btn '+(extra === 'sec' ? 'btn-s' : 'btn-p')+' inb-b" onclick="'+acc+'">'+btn+'</button>' : '')
    + '</div>';
}
function bloqueRespuesta(){
  var f = [];
  S.sols.forEach(function(s){
    if(s.estado !== 'entrevista') return;
    var cl = esc(s.clinicaNombre || 'La clínica');
    if(s.cita && s.cita.estado === 'propuesta')
      f.push({o:0, h:filaIn('cal','#1A56DB','#EEF2FF', 'Confirma tu '+(esVisita(s)?'visita':'entrevista')+' en '+cl, esc(fechaCitaC(s.cita.fecha))+' · '+esc(MODO_C[s.cita.modo]||''), 'Confirmar', "ir('solicitud','"+esc(s.id)+"')")});
    else if(!s.cita)
      f.push({o:1, h:filaIn(esVisita(s)?'pin':'video','#0E9F6E','#E8F8F1', cl+' quiere conocerte', esc(s.ofertaTitulo||'')+' · te propondrá día y hora', 'Ver', "ir('solicitud','"+esc(s.id)+"')")});
  });
  S.sols.forEach(function(s){
    var n = sinLeerC(s); if(!n) return;
    f.push({o:2, h:filaIn('msg','#1A56DB','#EEF2FF', esc(s.clinicaNombre||'La clínica')+' te ha escrito', n+' mensaje'+(n>1?'s':'')+' sin leer · '+esc(s.ofertaTitulo||''), 'Leer', "ir('solicitud','"+esc(s.id)+"')")});
  });
  propuestas().forEach(function(x){
    var o = x.o, pct = encaje((S.perfil||{}).disc, o);
    var dat = esc(o.titulo)+(pct !== null ? ' · encaje '+pct+' %' : '')+(o.salario ? ' · '+esc(o.salario) : '');
    if(x.tipo === 'clinica') f.push({o:3, h:filaIn('send','#1A56DB','#EEF2FF', '<b>'+esc(o.clinica||'Una clínica')+'</b> te invita a solicitar'+(x.inv.fecha ? ' <span class="inb-cu">'+esc(cuando(x.inv.fecha).toLowerCase())+'</span>' : ''), dat, 'Ver oferta', "ir('oferta','"+esc(o.id)+"')")});
    else f.push({o:4, h:filaIn('rebote','#66328A','#F3EEFA', 'CERCO te propone <b>'+esc(o.clinica||'otra clínica')+'</b>', dat, 'Ver oferta', "ir('oferta','"+esc(o.id)+"')")});
  });
  if(!f.length) return '';
  f.sort(function(a,b){ return a.o - b.o; });
  return '<div class="inb inb-r"><div class="inb-cab"><span>NECESITAN TU RESPUESTA</span><b>'+f.length+' pendiente'+(f.length>1?'s':'')+'</b></div>'+f.map(function(x){ return x.h; }).join('')+'</div>';
}
function diasQuedan(s){
  var t = new Date(ultimaActividadClinica(s)).getTime(); if(!t) return null;
  return Math.max(0, diasCaduca() - Math.floor((Date.now() - t) / 86400000));
}
function bloqueNovedades(){
  var f = [], hace14 = Date.now() - 14*86400000, reb = ['auto','preguntar'].indexOf((S.perfil||{}).rebote) > -1;
  S.sols.forEach(function(s){
    var cl = esc(s.clinicaNombre || 'La clínica'), ti = esc(s.ofertaTitulo || ''), go = "ir('solicitud','"+esc(s.id)+"')";
    if(s.estado === 'enviada' || s.estado === 'vista'){
      var q = diasQuedan(s), fv = fechaDe(s, 'vista');
      var plazo = q === null ? '' : (q <= 0 ? 'Hoy se acaba su plazo para contestarte' : 'Tiene '+q+' día'+(q>1?'s':'')+' más para contestarte');
      f.push({t:new Date(fv || s.fecha).getTime(), h: s.estado === 'vista'
        ? filaIn('eye','#1A56DB','#EEF2FF', cl+' ha abierto tu solicitud', ti+' · '+esc(cuando(fv).toLowerCase())+'. '+plazo+'.', 'Ver', go, 'sec')
        : filaIn('clock', q !== null && q <= 1 ? '#B42318' : '#8A5A00', q !== null && q <= 1 ? '#FEF2F2' : '#FFF7E6', cl+' todavía no ha contestado', ti+'. '+plazo+'; si no, cerramos la solicitud para que no esperes'+(reb ? ' y te buscamos otra clínica' : '')+'.', 'Ver', go, 'sec')});
    } else if(s.estado === 'descartada' || s.estado === 'caducada'){
      var fd = fechaDe(s, s.estado); if(!fd || new Date(fd).getTime() < hace14) return;
      f.push({t:new Date(fd).getTime(), h: filaIn(s.estado === 'caducada' ? 'clock' : 'x', '#6B7280', '#F3F4F6',
        s.estado === 'caducada' ? cl+' no contestó a tiempo' : cl+' ha elegido otro perfil',
        ti+' · '+esc(cuando(fd).toLowerCase())+'. '+(reb ? 'CERCO ya te busca otra clínica a la que le falte tu perfil.' : 'Activa el efecto rebote y te buscamos otra clínica.'), reb ? 'Ver' : 'Activar', reb ? go : "ir('perfil')", 'sec')});
    }
  });
  f.sort(function(a,b){ return b.t - a.t; });
  f = f.map(function(x){ return x.h; });
  // ofertas nuevas desde hace una semana que todavía no has mirado ni solicitado
  try{
    var nuevas = ofertasVisibles().filter(function(o){ return !o.ejemplo && o.fecha && Date.now() - new Date(o.fecha) < 7*86400000 && !solDeOferta(o.id); });
    if(nuevas.length) f.push(filaIn('sparkles','#B45309','#FFF7E6', nuevas.length === 1 ? 'Una oferta nueva esta semana' : nuevas.length+' ofertas nuevas esta semana', 'De tu profesión y dentro de tu distancia.', 'Verlas', "ir('ofertas')", 'sec'));
  }catch(e){}
  if(!f.length) return '';
  return '<div class="inb"><div class="inb-cab"><span>NOVEDADES</span></div>'+f.slice(0,5).join('')+(f.length > 5 ? '<button class="inb-mas" onclick="ir(\'solicitudes\')">Ver todas en Mis solicitudes</button>' : '')+'</div>';
}


/* ================================================================
   INICIO (versión ordenada)
   Se lee de arriba abajo y cada bloque responde a una sola pregunta:
   1. ¿Qué tengo que hacer ahora?      → una tarjeta, un botón
   2. ¿Cómo van mis solicitudes?       → un camino de 4 pasos por solicitud
   3. ¿Qué ofertas me convienen?       → tarjetas con el encaje en grande
   Lo demás (perfil, sugerencias) va en una línea, al final.
   ================================================================ */
function inPendientes(){
  var it = [];
  S.sols.forEach(function(s){
    var cl = esc(s.clinicaNombre || 'La clínica'), ti = esc(s.ofertaTitulo || ''), go = "ir('solicitud','"+esc(s.id)+"')";
    if(s.estado === 'contratada' && !s.ganVista) it.push({o:0, e:'¡ENHORABUENA!', ic:'sparkles', t:cl+' te ha elegido', s:ti, b:'Ver su mensaje', a:go});
    else if(s.estado === 'contratada' && s.contrato && !contratoRecibido(s)) it.push({o:0, e:'TU INCORPORACIÓN', ic:'file', t:cl+' te ha enviado el contrato', s:ti, b:'Verlo', a:go});
    if(s.estado === 'entrevista' && s.cita && s.cita.estado === 'propuesta') it.push({o:1, ic:'cal', t:'Confirma tu '+(esVisita(s)?'visita':'entrevista'), s:cl+' · '+esc(fechaCitaC(s.cita.fecha)), b:'Confirmar', a:go});
    else if(s.estado === 'entrevista' && !s.cita) it.push({o:2, ic:esVisita(s)?'pin':'video', t:cl+' quiere conocerte', s:ti, b:'Ver', a:go});
    var n = sinLeerC(s); if(n) it.push({o:3, ic:'msg', t:cl+' te ha escrito', s:n+' mensaje'+(n>1?'s':'')+' sin leer', b:'Leer', a:go});
  });
  propuestas().forEach(function(x){
    var o = x.o, pct = encaje((S.perfil||{}).disc, o), go = "ir('oferta','"+esc(o.id)+"')";
    var sub = esc(o.titulo) + (pct !== null ? ' · encaje '+pct+' %' : '');
    if(x.tipo === 'clinica') it.push({o:4, ic:'send', t:esc(o.clinica||'Una clínica')+' te invita a solicitar', s:sub, b:'Ver la oferta', a:go});
    else it.push({o:5, ic:'rebote', t:'CERCO te propone '+esc(o.clinica||'otra clínica'), s:sub, b:'Ver la oferta', a:go});
  });
  return it.sort(function(a,b){ return a.o - b.o; });
}
function inHero(pend, pasos){
  var x, eti, mas = '';
  if(pend.length){
    x = pend[0];
    eti = x.e || ('NECESITA TU RESPUESTA' + (pend.length > 1 ? ' · 1 de ' + pend.length : ''));
    if(pend.length > 1) mas = '<div class="h2-mas">' + pend.slice(1, 4).map(function(y){
      return '<button onclick="'+y.a+'">'+svg(y.ic,'#9FB6E8',16)+'<span>'+y.t+'</span>'+svg('right','#9FB6E8',16)+'</button>'; }).join('')
      + (pend.length > 4 ? '<div class="h2-mas-n">y '+(pend.length - 4)+' más en Mis solicitudes</div>' : '') + '</div>';
  } else {
    var sig = pasos.filter(function(y){ return !y.ok; })[0];
    if(sig){
      var hechos = pasos.filter(function(y){ return y.ok; }).length;
      var tx = String(sig.tit).toLowerCase();
      x = {ic: /v[ií]deo/.test(tx) ? 'video' : (/test/.test(tx) ? 'compass' : (/foto|cv/.test(tx) ? 'camera' : (/solicitud/.test(tx) ? 'send' : 'user'))), t:sig.tit, s:esc(sig.sub), b:sig.btn, a:sig.acc};
      eti = 'TU SIGUIENTE PASO · ' + hechos + ' DE ' + pasos.length;
      mas = '<div class="h2-barra" aria-hidden="true"><div style="width:'+Math.round(hechos/pasos.length*100)+'%"></div></div>';
    } else {
      var rec = []; try{ rec = clinicasRecomendadas(); }catch(e){}
      if(rec.length){ var r = rec[0]; x = {ic:'sparkles', t:esc(r.o.clinica||'Clínica'), s:esc(r.o.titulo) + (r.fit !== null ? ' · encaje '+r.fit+' %' : ''), b:'Ver la oferta', a:"ir('oferta','"+esc(r.o.id)+"')"}; eti = 'TE RECOMENDAMOS'; }
      else { x = {ic:'check', t:'Lo tienes todo al día', s:'Te avisamos en cuanto una clínica te conteste.', b:'Ver ofertas', a:"ir('ofertas')"}; eti = 'TODO AL DÍA'; }
    }
  }
  return '<section class="h2" id="in2-hero" aria-label="Lo más importante ahora">'
    + '<div class="h2-e">'+eti+'</div>'
    + '<div class="h2-f"><div class="h2-ic">'+svg(x.ic,'#fff',22)+'</div><div style="min-width:0;flex:1;"><h2 class="h2-t">'+x.t+'</h2>'+(x.s ? '<p class="h2-s">'+x.s+'</p>' : '')+'</div></div>'
    + '<button class="h2-b" onclick="'+x.a+'">'+x.b+svg('right','#0F1C3F',17)+'</button>'
    + mas + '</section>';
}
function inTramo(s){
  var e = s.estado, q = diasQuedan(s), reb = ['auto','preguntar'].indexOf((S.perfil||{}).rebote) > -1;
  var paso = {enviada:1, vista:2, entrevista:3, descartada:4, caducada:4, contratada:4}[e] || 1;
  var fin = e === 'descartada' || e === 'caducada';
  var chip = {enviada:['Enviada','az'], vista: s.interesa ? ['Les interesas','ve'] : ['Abierta','az'], entrevista:['Entrevista','ve'], descartada:['No seleccionada','gr'], caducada:['Sin respuesta','gr'], contratada:['¡Elegida!','ve']}[e] || ['',''];
  var plazo = q === null ? '' : (q <= 0 ? 'hoy acaba su plazo para contestarte' : 'le quedan '+q+' día'+(q>1?'s':'')+' para contestarte');
  var nota = e === 'enviada' ? 'Aún no la han abierto · ' + plazo
    : e === 'vista' ? (s.interesa ? 'Siguen con tu candidatura · ' : 'La abrieron ' + esc(cuando(fechaDe(s,'vista')).toLowerCase()) + ' · ') + plazo
    : e === 'entrevista' ? (s.cita ? (s.cita.estado === 'propuesta' ? 'Confirma el día: ' : 'Entrevista: ') + esc(fechaCitaC(s.cita.fecha)) : 'Te propondrán día y hora')
    : e === 'contratada' ? 'Mira su mensaje'
    : (reb ? 'CERCO ya te busca otra clínica' : 'Hay más ofertas para ti');
  var urg = (e === 'enviada' || e === 'vista') && q !== null && q <= 1;
  var seg = '';
  var sinEnt = fin && !fechaDe(s, 'entrevista'), sinVista = fin && !fechaDe(s, 'vista');
  for(var i = 1; i <= 4; i++) seg += '<i class="'+((i === 3 && sinEnt) || (i === 2 && sinVista) ? '' : (i <= paso ? (fin && i === 4 ? 'gr' : 'on') : ''))+'"></i>';
  return '<button class="tr" onclick="ir(\'solicitud\',\''+esc(s.id)+'\')">'
    + '<div class="tr-cab"><span class="tr-av">'+esc(inicial(String(s.clinicaNombre||'C').replace(/^(clínica|centro)\s+(dental|odontológico)?\s*/i,'')))+'</span>'
    + '<span class="tr-tx"><b>'+esc(s.clinicaNombre||'Clínica')+'</b><span>'+(esVisita(s)?'Conocer la clínica · ':'')+esc(s.ofertaTitulo||'')+'</span></span>'
    + '<span class="tr-chip '+chip[1]+'">'+chip[0]+'</span></div>'
    + '<div class="tr-seg" aria-label="Paso '+paso+' de 4">'+seg+'</div>'
    + '<div class="tr-lb" aria-hidden="true"><span>Enviada</span><span>Abierta</span><span>Entrevista</span><span>Respuesta</span></div>'
    + '<div class="tr-nota'+(urg ? ' urg' : '')+'">'+svg(e === 'entrevista' ? 'cal' : (fin ? 'info' : 'clock'), 'currentColor', 14)+'<span>'+nota+'</span></div>'
    + '</button>';
}
function inSolicitudes(){
  var hace14 = Date.now() - 14*86400000;
  var l = S.sols.filter(function(s){
    if(['enviada','vista','entrevista'].indexOf(s.estado) > -1) return true;
    // el contrato se queda en Inicio los primeros 90 días; luego, en tu historial
    if(s.estado === 'contratada'){ var fc = fechaDe(s, 'contratada'); return !s.seguimientoC && (!fc || Date.now() - new Date(fc).getTime() < 100*86400000); }
    var f = fechaDe(s, s.estado); return (s.estado === 'descartada' || s.estado === 'caducada') && f && new Date(f).getTime() > hace14;
  }).sort(function(a,b){ return new Date(b.actualizado||b.fecha) - new Date(a.actualizado||a.fecha); });
  var tot = solsActivas().length;
  var h = '<section id="in2-sols" class="in2-sec"><div class="in2-h"><h2>Tus solicitudes</h2>'+(tot ? '<button onclick="ir(\'solicitudes\')">Ver todas ('+tot+')'+svg('right','currentColor',15)+'</button>' : '')+'</div>';
  if(!S.solsCargadas) return h + '<div class="cargando"><div class="spin"></div></div></section>';
  if(!l.length) return h + '<div class="in2-vacio">'+svg('send','#9CA3AF',20)+'<span>'+(S.sols.length ? 'No tienes ninguna en marcha ahora mismo.' : 'Todavía no has enviado ninguna.')+'</span>'+((S.perfil||{}).disc ? '<button class="btn btn-s" onclick="ir(\'ofertas\')">Ver ofertas</button>' : '')+'</div></section>';
  return h + l.slice(0,3).map(inTramo).join('') + '</section>';
}
function inOfertas(){
  var p = S.perfil || {}, l = [];
  try{ l = clinicasRecomendadas(); }catch(e){}
  if(l.length < 3){
    // completar hasta 3 con las que mejor encajan dentro de tu distancia
    var ya = {}; l.forEach(function(x){ ya[x.o.id] = 1; });
    var libres = ofertasVisibles().filter(function(o){ return !solDeOferta(o.id) && !ya[o.id]; }), zc = ofertasCerca(libres);
    l = l.concat(ordenarOfertas(zc.dentro).concat(zc.fuera).slice(0, 3 - l.length).map(function(o){ return {o:o, fit:encaje(p.disc, o), km:kmDe(o, p.geo), motivo:''}; }));
  }
  var nG = nGuardadas();
  var h = '<section id="in2-ofs" class="in2-sec"><div class="in2-h"><h2>Ofertas para ti</h2><span class="in2-hb">'+(nG ? '<button onclick="verGuardadas()">'+svg('bookmark','currentColor',14)+'Guardadas ('+nG+')</button>' : '')+'<button onclick="ir(\'ofertas\')">Ver todas'+svg('right','currentColor',15)+'</button></span></div>';
  if(!S.ofertasCargadas) return h + '<div class="cargando"><div class="spin"></div></div></section>';
  if(!l.length) return h + '<div class="in2-vacio">'+svg('search','#9CA3AF',20)+'<span>'+(hayReales() ? 'Ahora mismo no hay ofertas nuevas para ti. Te avisamos cuando se publique una.' : 'Todavía no hay ofertas publicadas en CERCO. Cuando una clínica publique una de tu profesión, saldrá aquí.')+'</span></div></section>';
  if(!p.disc) h += '<p class="in2-nota">Haz el test para ver cuánto encajas con cada una.</p>';
  h += '<div class="oc-l">' + l.map(function(x){
    var o = x.o, km = x.km, nueva = !o.ejemplo && o.fecha && Date.now() - new Date(o.fecha) < 7*86400000;
    var chip = /le falta/i.test(x.motivo||'') ? '<span class="oc-chip">'+svg('users','currentColor',12)+'Le falta tu perfil</span>' : (x.fit !== null && x.fit >= 80 ? '<span class="oc-chip az">Busca tu perfil</span>' : '');
    return '<button class="oc" onclick="ir(\'oferta\',\''+esc(o.id)+'\')">'
      + '<span class="oc-ring">'+anillo(x.fit, 54)+'</span>'
      + '<span class="oc-tx">'+(nueva ? '<span class="in2-nuevas" style="align-self:flex-start;margin-bottom:4px;">Nueva</span>' : '')+'<b class="oc-t">'+esc(o.titulo)+'</b><span class="oc-cl">'+esc(o.clinica||'Clínica')+'</span>'
      + '<span class="oc-d">'+[o.salario ? esc(o.salario) : '', km !== null && km !== undefined ? (km < 1 ? 'En tu zona' : 'A '+Math.round(km)+' km') : ''].filter(Boolean).join(' · ')+'</span>'
      + chip + '</span></button>';
  }).join('') + '</div></section>';
  return h;
}
function inPerfilLinea(pasos, heroEsPaso){
  var falta = pasos.filter(function(y){ return !y.ok; });
  if(heroEsPaso || !falta.length) return '';
  var hechos = pasos.length - falta.length;
  return '<button class="in2-pf" onclick="'+falta[0].acc+'"><span class="in2-pf-n">'+hechos+'/'+pasos.length+'</span>'
    + '<span class="in2-pf-tx"><b>Completa tu perfil</b><span>'+(/^Falta/.test(falta[0].sub||'') ? esc(falta[0].sub) : 'Siguiente: '+falta[0].tit)+'</span></span>'+svg('right','#6B7280',17)+'</button>';
}
function inSugerencia(){
  var p = S.perfil || {};
  if(p.disc && !p.rebote)
    return '<div class="in2-sug"><span class="in2-sug-ic" style="background:#F3EEFA;">'+svg('rebote','#66328A',18)+'</span><span class="in2-sug-tx"><b>Efecto rebote</b><span>Si una clínica te dice que no, te buscamos otra.</span></span>'
      + '<button class="btn btn-s" onclick="guardarAjuste({rebote:\'preguntar\'}, \'Activado. Te preguntaremos antes de presentarte a cada clínica.\')">Activar</button></div>';
  if(p.disc && p.visible === undefined)
    return '<div class="in2-sug"><span class="in2-sug-ic">'+svg('eye','#1A56DB',18)+'</span><span class="in2-sug-tx"><b>Que te encuentren</b><span>Las clínicas ven tu perfil sin tu nombre ni tu foto y te invitan.</span></span>'
      + '<button class="btn btn-s" onclick="guardarAjuste({visible:true}, \'Listo. Las clínicas que buscan tu perfil podrán invitarte.\')">Activar</button></div>';
  if(avisosSoportados() && Notification.permission === 'default' && !sessionStorage.getItem('cerco_av_no'))
    return '<div class="in2-sug"><span class="in2-sug-ic">'+svg('bell','#1A56DB',18)+'</span><span class="in2-sug-tx"><b>Avisos</b><span>Entérate al momento cuando te contesten.</span></span>'
      + '<button class="btn btn-s" onclick="activarAvisos()">Activar</button></div>';
  return '';
}
window.pintarInicio = function(){
  var box = $('in2'); if(!box) return;
  var p = S.perfil || {}, h = new Date().getHours();
  var fecha = new Date().toLocaleDateString('es-ES',{weekday:'long', day:'numeric', month:'long'}).replace(/^./, function(c){ return c.toUpperCase(); });
  var pend = inPendientes(), pasos = []; try{ pasos = pasosCandidato(); }catch(e){}
  var heroEsPaso = !pend.length && pasos.some(function(y){ return !y.ok; });
  var seg = ''; try{ seg = bloqueInicioExtra(); }catch(e){}
  box.innerHTML = '<div class="in2-hola"><span>'+esc(fecha)+'</span><h1 class="t">'+(h < 14 ? 'Buenos días' : (h < 21 ? 'Buenas tardes' : 'Buenas noches'))+(p.nombre ? ', ' + esc(primerNom(p.nombre)) : '')+'</h1></div>'
    + '<div class="in2-g"><div class="in2-m">' + inHero(pend, pasos) + seg + inPerfilLinea(pasos, heroEsPaso) + inSolicitudes() + '</div>'
    + '<div class="in2-a">' + inOfertas() + inSugerencia() + '</div></div>';
};

/* ---------- editar el vídeo: recortar y portada ---------- */
var EV = { ini:0, fin:0, dur:0, poster:'', posterT:null, frames:[] };
function durVideo(v, meta){ var d = v && isFinite(v.duration) && v.duration > 0 ? v.duration : ((meta && meta.dur) || 0); return Math.max(1, d); }
/* ================================================================
   EDITAR EL VÍDEO, como en TikTok o Instagram
   · Recortar: una tira con fotogramas y dos bordes que se arrastran.
   · Portada: un recuadro que recorre la tira; lo que queda dentro es la
     imagen que ve la clínica. También se puede subir una foto.
   ================================================================ */
/* Abrir el editor de vídeo, con las pestañas del editor nuevo (filtros, encuadre, texto y sonido) (Fase 1: una sola versión) */
function abrirEditorVideo(){
  if(window.CERCO_editor2Antes) CERCO_editor2Antes();
  var r = _abrirEditorVideoBase.apply(this, arguments);
  if(window.CERCO_editor2Despues) CERCO_editor2Despues();
  return r;
}
function _abrirEditorVideoBase(){
  var meta = (S.perfil||{}).video; if(!meta) return;
  cerrarModal();
  EV = { ini:0, fin:0, dur:0, poster:meta.poster || '', posterT:meta.posterT != null ? meta.posterT : null, frames:[], tab:'r', listo:false };
  var m = document.createElement('div'); m.className = 'ev2-bg'; m.id = 'modal';
  m.innerHTML = '<div class="ev2" role="dialog" aria-modal="true" aria-labelledby="ev2-t">'
    + '<div class="ev2-top"><button class="ev2-tb" type="button" onclick="cerrarModal()">Cancelar</button><h2 id="ev2-t">Editar vídeo</h2><button class="ev2-tb ev2-ok" type="button" id="m-btn" onclick="evGuardar()" disabled>Guardar</button></div>'
    + '<div class="ev2-stage" id="ev2-stage"><div class="ev2-vw" id="ev-box"><div class="cargando" style="color:#fff;"><div class="spin"></div>Cargando vídeo…</div></div>'
    + '<button class="ev2-play" id="ev2-play" type="button" aria-label="Reproducir" onclick="evPlay()" hidden>'+svg('triang','#fff',30)+'</button>'
    + '<div class="ev2-time" id="ev2-time"></div></div>'
    + '<div class="ev2-tabs" role="tablist"><button role="tab" type="button" id="ev2-tab-r" aria-selected="true" onclick="evTab(\'r\')">'+svg('scissors','currentColor',17)+'Recortar</button>'
    + '<button role="tab" type="button" id="ev2-tab-p" aria-selected="false" onclick="evTab(\'p\')">'+svg('image','currentColor',17)+'Portada</button></div>'
    + '<div class="ev2-pan" id="ev2-r"><div class="ev2-info"><b id="ev2-dur">0:00</b><span>seleccionados · entre '+VIDEO_MIN_S+' y '+VIDEO_MAX_S+' segundos</span></div>'
    + '<div class="ev2-tira" id="ev2-tira"><div class="ev2-fr" id="ev2-fr"></div><div class="ev2-dim" id="ev2-dl"></div><div class="ev2-dim" id="ev2-dr"></div>'
    + '<div class="ev2-sel" id="ev2-sel"><span class="ev2-h" id="ev2-hi" role="slider" tabindex="0" aria-label="Dónde empieza"></span><span class="ev2-h ev2-hf" id="ev2-hf" role="slider" tabindex="0" aria-label="Dónde termina"></span></div>'
    + '<div class="ev2-ph" id="ev2-ph"></div></div>'
    + '<div class="ev2-ayuda">Arrastra los bordes blancos para elegir el trozo. Arrastra el centro para moverlo.</div></div>'
    + '<div class="ev2-pan" id="ev2-p" hidden><div class="ev2-info"><span>Desliza el recuadro hasta la imagen que quieras. Es lo que verá la clínica antes de darle a reproducir.</span></div>'
    + '<div class="ev2-tira" id="ev2-tira-p"><div class="ev2-fr" id="ev2-fr-p"></div><div class="ev2-cuadro" id="ev2-cuadro" role="slider" tabindex="0" aria-label="Imagen de portada"></div></div>'
    + '<div class="ev2-pie"><div class="ev2-elegida" id="ev2-elegida"></div><label class="ev2-subir">'+svg('camera','#fff',16)+'Subir una foto<input type="file" accept="image/*" class="sr" onchange="evPortadaFoto(this)"></label></div></div>'
    + '<div class="err ev2-err" id="m-err"></div></div>';
  document.body.appendChild(m);
  urlMedia('video').then(function(u){
    var box = $('ev-box'); if(!box) return;
    box.innerHTML = '<video id="ev-vid" src="'+u+'" playsinline preload="auto"></video>';
    var v = $('ev-vid');
    var listo = function(){
      if(EV.listo || !$('ev-vid')) return; EV.listo = true;
      EV.dur = durVideo(v, meta);
      EV.ini = Math.min(meta.ini || 0, Math.max(0, EV.dur - 1));
      EV.fin = meta.fin && meta.fin <= EV.dur ? meta.fin : Math.min(EV.dur, EV.ini + VIDEO_MAX_S);
      if(EV.posterT == null) EV.posterT = EV.ini;
      $('m-btn').disabled = false; $('ev2-play').hidden = false;
      try{ v.currentTime = EV.ini; }catch(e){}
      evPintar(); evTiras(u); evArrastres();
    };
    v.addEventListener('loadedmetadata', function(){
      // los vídeos grabados en el navegador a veces no traen la duración: se la sacamos
      if(!isFinite(v.duration)){ var una = function(){ v.removeEventListener('timeupdate', una); try{ v.currentTime = 0; }catch(e){} listo(); }; v.addEventListener('timeupdate', una); try{ v.currentTime = 1e7; }catch(e){ listo(); } setTimeout(listo, 1500); }
      else listo();
    });
    v.addEventListener('timeupdate', function(){ if(!EV.listo) return; if(EV.tab === 'r' && !v.paused && v.currentTime >= EV.fin - 0.05){ try{ v.currentTime = EV.ini; }catch(e){} } evPintarTiempo(); });
    v.addEventListener('play', function(){ $('ev2-play').hidden = true; evBucle(); });
    v.addEventListener('pause', function(){ $('ev2-play').hidden = false; });
    v.addEventListener('click', function(){ evPlay(); });
    setTimeout(listo, 4000);
  }).catch(function(){ var b = $('ev-box'); if(b) b.innerHTML = '<div class="cargando" style="color:#fff;">No hemos podido cargar el vídeo.</div>'; });
}
function evPlay(){ var v = $('ev-vid'); if(!v) return; if(v.paused){ if(EV.tab === 'p') evTab('r'); if(v.currentTime < EV.ini || v.currentTime >= EV.fin - 0.1){ try{ v.currentTime = EV.ini; }catch(e){} } var p = v.play(); if(p && p.catch) p.catch(function(){}); } else v.pause(); }
function evBucle(){ var v = $('ev-vid'); if(!v || v.paused) return; evPintarTiempo(); requestAnimationFrame(evBucle); }
function evPintarTiempo(){
  var v = $('ev-vid'); if(!v || !EV.dur) return;
  var t = v.currentTime, ph = $('ev2-ph');
  if(ph) ph.style.left = (Math.max(0, Math.min(1, t / EV.dur)) * 100) + '%';
  var tt = $('ev2-time'); if(tt) tt.textContent = EV.tab === 'r' ? mmss(Math.max(0, t - EV.ini)) + ' / ' + mmss(EV.fin - EV.ini) : 'Portada · ' + mmss(t);
}
function evPintar(){
  var d = EV.dur || 1, l = EV.ini / d * 100, r = EV.fin / d * 100;
  var sel = $('ev2-sel'); if(sel){ sel.style.left = l + '%'; sel.style.width = (r - l) + '%'; }
  $('ev2-dl').style.width = l + '%'; $('ev2-dr').style.left = r + '%'; $('ev2-dr').style.width = (100 - r) + '%';
  $('ev2-hi').setAttribute('aria-valuetext', mmss(EV.ini)); $('ev2-hf').setAttribute('aria-valuetext', mmss(EV.fin));
  var dur = EV.fin - EV.ini; $('ev2-dur').textContent = mmss(Math.round(dur));
  var c = $('ev2-cuadro'); if(c){ c.style.left = (Math.max(0, Math.min(1, EV.posterT / d)) * 100) + '%'; c.setAttribute('aria-valuetext', mmss(EV.posterT)); if(EV.frames.length) c.style.backgroundImage = 'url("'+evFrameEn(EV.posterT)+'")'; }
  var el = $('ev2-elegida');
  if(el) el.innerHTML = EV.poster ? '<img src="'+esc(EV.poster)+'" alt="Portada elegida"><span>'+(EV.posterFoto ? 'Tu foto' : 'Imagen del segundo ' + mmss(EV.posterT))+'</span>' : '<span>Sin portada todavía</span>';
  evPintarTiempo();
}
function evFrameEn(t){ var n = EV.frames.length; if(!n) return ''; return EV.frames[Math.max(0, Math.min(n - 1, Math.floor(t / EV.dur * n)))]; }
// fotogramas para las dos tiras, sacados de una copia oculta del vídeo
function evTiras(u){
  var tira = $('ev2-tira'), n = Math.max(6, Math.min(12, Math.round((tira.clientWidth || 360) / 44)));
  var v = document.createElement('video'); v.muted = true; v.playsInline = true; v.preload = 'auto'; v.src = u;
  var c = document.createElement('canvas'), out = [], i = 0;
  var sacar = function(){
    if(i >= n || !$('ev2-fr')){ EV.frames = out; return; }
    var t = Math.min(EV.dur - 0.05, (i + 0.5) * EV.dur / n), hecho = false;
    var cb = function(){ if(hecho) return; hecho = true;
      try{ var h = 96, w = Math.max(40, Math.round(h * (v.videoWidth || 9) / (v.videoHeight || 16))); c.width = w; c.height = h; c.getContext('2d').drawImage(v, 0, 0, w, h); out.push(c.toDataURL('image/jpeg', 0.6)); }catch(e){ out.push(''); }
      var img = '<span style="background-image:url(\''+out[out.length-1]+'\')"></span>';
      $('ev2-fr').insertAdjacentHTML('beforeend', img); $('ev2-fr-p').insertAdjacentHTML('beforeend', img);
      i++; EV.frames = out; evPintar(); sacar(); };
    v.addEventListener('seeked', cb, {once:true}); setTimeout(cb, 1500);
    try{ v.currentTime = t; }catch(e){ cb(); }
  };
  var empezar = function(){ v.removeEventListener('loadeddata', empezar); sacar(); };
  v.addEventListener('loadeddata', empezar); setTimeout(function(){ if(!i) empezar(); }, 2500);
}
/* Cambiar de pestaña en el editor: las nuevas las lleva el editor nuevo (profesional/07-editor-de-video.js) (Fase 1: una sola versión) */
function evTab(t){
  if(window.CERCO_editor2Pestana && CERCO_editor2Pestana.apply(this, arguments)) return;
  return _evTabBase.apply(this, arguments);
}
function _evTabBase(t){
  EV.tab = t; var v = $('ev-vid');
  $('ev2-r').hidden = t !== 'r'; $('ev2-p').hidden = t !== 'p';
  $('ev2-tab-r').setAttribute('aria-selected', t === 'r'); $('ev2-tab-p').setAttribute('aria-selected', t === 'p');
  if(v){ v.pause(); try{ v.currentTime = t === 'p' ? EV.posterT : EV.ini; }catch(e){} }
  $('ev2-play').style.visibility = t === 'p' ? 'hidden' : '';
  evPintar();
}
function evLimitar(cual){
  var min = Math.min(VIDEO_MIN_S, EV.dur), max = VIDEO_MAX_S;
  EV.ini = Math.max(0, EV.ini); EV.fin = Math.min(EV.dur, EV.fin);
  if(cual === 'ini'){ if(EV.fin - EV.ini < min) EV.ini = Math.max(0, EV.fin - min); if(EV.fin - EV.ini > max) EV.fin = EV.ini + max; }
  else if(cual === 'fin'){ if(EV.fin - EV.ini < min) EV.fin = Math.min(EV.dur, EV.ini + min); if(EV.fin - EV.ini > max) EV.ini = EV.fin - max; }
}
function evArrastres(){
  var tira = $('ev2-tira'), v = $('ev-vid');
  var aT = function(x, el){ var r = el.getBoundingClientRect(); return Math.max(0, Math.min(1, (x - r.left) / r.width)) * EV.dur; };
  var arr = function(el, mover, soltar){
    el.addEventListener('pointerdown', function(e){
      e.preventDefault(); e.stopPropagation(); if(v) v.pause(); el.setPointerCapture(e.pointerId); el.classList.add('on');
      var x0 = e.clientX, mv = function(ev){ mover(ev.clientX, ev.clientX - x0); }, up = function(){ el.classList.remove('on'); el.removeEventListener('pointermove', mv); el.removeEventListener('pointerup', up); el.removeEventListener('pointercancel', up); if(soltar) soltar(); };
      el.addEventListener('pointermove', mv); el.addEventListener('pointerup', up); el.addEventListener('pointercancel', up);
    });
  };
  arr($('ev2-hi'), function(x){ EV.ini = Math.min(aT(x, tira), EV.fin - Math.min(VIDEO_MIN_S, EV.dur)); evLimitar('ini'); try{ v.currentTime = EV.ini; }catch(e){} evPintar(); });
  arr($('ev2-hf'), function(x){ EV.fin = Math.max(aT(x, tira), EV.ini + Math.min(VIDEO_MIN_S, EV.dur)); evLimitar('fin'); try{ v.currentTime = Math.max(EV.ini, EV.fin - 0.1); }catch(e){} evPintar(); });
  var base = null;
  arr($('ev2-sel'), function(x, dx){
    if(!base) base = {i:EV.ini, f:EV.fin};
    var dt = dx / tira.getBoundingClientRect().width * EV.dur, len = base.f - base.i;
    EV.ini = Math.max(0, Math.min(EV.dur - len, base.i + dt)); EV.fin = EV.ini + len;
    try{ v.currentTime = EV.ini; }catch(e){} evPintar();
  }, function(){ base = null; });
  var tp = $('ev2-tira-p'), cu = $('ev2-cuadro');
  var ponPortada = function(x){ EV.posterT = aT(x, tp); EV.posterFoto = false; try{ v.currentTime = EV.posterT; }catch(e){} evPintar(); };
  arr(cu, function(x){ ponPortada(x); }, evCapturar);
  tp.addEventListener('pointerdown', function(e){ if(e.target === cu) return; ponPortada(e.clientX); evCapturar(); });
  // con el teclado: flechas, medio segundo cada vez
  var tecla = function(el, f){ el.addEventListener('keydown', function(e){ var d = e.key === 'ArrowLeft' || e.key === 'ArrowDown' ? -0.5 : (e.key === 'ArrowRight' || e.key === 'ArrowUp' ? 0.5 : 0); if(!d) return; e.preventDefault(); f(d); evPintar(); }); };
  tecla($('ev2-hi'), function(d){ EV.ini += d; evLimitar('ini'); });
  tecla($('ev2-hf'), function(d){ EV.fin += d; evLimitar('fin'); });
  tecla(cu, function(d){ EV.posterT = Math.max(0, Math.min(EV.dur, EV.posterT + d)); EV.posterFoto = false; try{ v.currentTime = EV.posterT; }catch(e){} clearTimeout(EV.tCap); EV.tCap = setTimeout(evCapturar, 400); });
}
// la portada es lo que se ve en grande en ese momento
function evCapturar(){
  var v = $('ev-vid'); if(!v) return;
  var cap = function(){
    try{
      if(!v.videoWidth) return;
      var w = 540, h = Math.round(w * v.videoHeight / v.videoWidth), c = document.createElement('canvas'); c.width = w; c.height = h;
      c.getContext('2d').drawImage(v, 0, 0, w, h);
      EV.poster = c.toDataURL('image/jpeg', 0.78); EV.posterFoto = false; error('m-err', ''); evPintar();
    }catch(e){ error('m-err', 'No se ha podido sacar la imagen. Prueba con otro momento.'); }
  };
  if(v.seeking) v.addEventListener('seeked', cap, {once:true}); else cap();
}
function evPortadaFoto(inp){
  var f = inp.files && inp.files[0]; inp.value = ''; if(!f) return;
  if(!/^image\//.test(f.type)) return toast('Elige una imagen (JPG o PNG).');
  var fr = new FileReader();
  fr.onload = function(){ var img = new Image(); img.onload = function(){
    var w = Math.min(720, img.width), h = Math.round(w * img.height / img.width), c = document.createElement('canvas'); c.width = w; c.height = h;
    c.getContext('2d').drawImage(img, 0, 0, w, h); EV.poster = c.toDataURL('image/jpeg', 0.8); EV.posterFoto = true; evPintar(); toast('Foto elegida como portada');
  }; img.src = fr.result; };
  fr.readAsDataURL(f);
}
/* Guardar el vídeo editado: si hay filtros o texto, lo hace el editor nuevo (profesional/07-editor-de-video.js) (Fase 1: una sola versión) */
function evGuardar(){
  if(window.CERCO_editor2Guardar && CERCO_editor2Guardar.apply(this, arguments)) return;
  return _evGuardarBase.apply(this, arguments);
}
function _evGuardarBase(){
  if(!unaVez('evG', 1200)) return;
  var p = Object.assign({}, S.perfil), recortado = EV.ini > 0.2 || EV.fin < EV.dur - 0.2;
  p.video = Object.assign({}, p.video, { ini: recortado ? Math.round(EV.ini*10)/10 : 0, fin: recortado ? Math.round(EV.fin*10)/10 : 0, poster: EV.poster || '', posterT: EV.posterFoto ? null : Math.round((EV.posterT||0)*10)/10 });
  if(recortado) p.video.dur = Math.round(EV.fin - EV.ini);
  bloquear('m-btn', 'Guardando…');
  guardarYRepintar(p, 'Vídeo actualizado').then(function(){ cerrarModal(); }).catch(function(){ bloquear('m-btn'); error('m-err', 'No se ha podido guardar. Revisa tu conexión.'); });
}
// reproducir respetando el recorte
function aplicarRecorte(v, meta){
  if(!v || !meta || !(meta.ini || meta.fin)) return;
  var ini = meta.ini || 0, fin = meta.fin || 0;
  v.addEventListener('loadedmetadata', function(){ try{ v.currentTime = ini; }catch(e){} });
  v.addEventListener('timeupdate', function(){ if(fin && v.currentTime >= fin){ v.pause(); try{ v.currentTime = ini; }catch(e){} } if(v.currentTime < ini - 0.3){ try{ v.currentTime = ini; }catch(e){} } });
}
// Ver mi vídeo: aplicar el recorte guardado. La usa verMiVideo (profesional/01-portal.js)
  window.CERCO_videoRecorteAlVer = function(){
    var meta = (S.perfil||{}).video, n = 0, iv = setInterval(function(){ var v = document.querySelector('#pf-vid video'); if(v){ clearInterval(iv); aplicarRecorte(v, meta); } else if(++n > 60) clearInterval(iv); }, 100);
  };
// Mi presentación: botón «Editar» y portada del vídeo. La usa pintarMedia (profesional/01-portal.js)
  window.CERCO_mediaEditar = function(){
    try{
    var v = (S.perfil||{}).video, fila = document.querySelector('#pf-media .pm-row'), caja = $('pf-vid');
    if(v && fila && !fila.querySelector('.pm-editar')) fila.insertAdjacentHTML('afterbegin', '<button class="btn btn-s pm-editar" onclick="abrirEditorVideo()">'+svg('pencil','currentColor',15)+'Editar</button>');
    if(v && v.poster && caja){ caja.style.backgroundImage = 'linear-gradient(rgba(15,28,63,.35),rgba(15,28,63,.55)), url("' + v.poster + '")'; caja.style.backgroundSize = 'cover'; caja.style.backgroundPosition = 'center'; }
  }catch(e){}
  };

