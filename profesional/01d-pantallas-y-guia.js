/* Portal del profesional: pantallas (ofertas, solicitudes, perfil), bienvenida y guía.
   Parte del antiguo profesional/01-portal.js (Fase 1, paso 1.6b). El orden de carga
   importa: los archivos 01a…01f se cargan seguidos y en este orden. */
/* ================================================================
   PANTALLAS
   ================================================================ */
function tarjetaOferta(o){
  var d = S.perfil && S.perfil.disc;
  var p = encaje(d, o);
  var sol = solDeOferta(o.id);
  var meta = [];
  if(o.jornada) meta.push('<span>'+svg('clock','#6B7280',12)+esc(o.jornada)+'</span>');
  if(o.salario) meta.push('<span>'+svg('euro','#6B7280',12)+esc(o.salario)+'</span>');
  var st = statsResp(o.clinicaId);
  if(st && !st.nueva) meta.push(st.pct >= 80 && st.n >= 5 ? '<span class="resp-ok">'+svg('check','#0E9F6E',12)+'Clínica que responde · '+st.pct+' %</span>' : '<span style="color:'+colorResp(st.pct)+';">'+svg('clock',colorResp(st.pct),12)+'Responde al '+st.pct+' %</span>');
  if(invDeOferta(o.id)) meta.unshift('<span class="inv-t">'+svg('send','#1A56DB',12)+'Te han invitado</span>');
  else if(propDeOferta(o.id)) meta.unshift('<span class="reb-t">'+svg('rebote','#66328A',12)+'CERCO te la propone</span>');
  if(sol) meta.push(sol.estado === 'retirada' ? '<span>Retirada</span>' : '<span class="ya">'+svg('check','#0E9F6E',12)+'Solicitada</span>');
  else if(visitaDeOferta(o.id)) meta.push('<span style="background:#F3EEFA;color:#66328A;">'+svg('pin','#66328A',12)+'Visita pedida</span>');
  return '<div class="of" onclick="ir(\'oferta\',\''+esc(o.id)+'\')">'
    + '<div class="of-main"><div class="of-t">'+esc(o.titulo)+(o.ejemplo?' <span class="badge-ej">EJEMPLO</span>':'')+'</div>'
    + '<div class="of-c"><span class="nw">'+svg('building','#9CA3AF',13)+esc(o.clinica||'Clínica')+'</span><span class="nw">'+svg('pin','#9CA3AF',13)+esc(o.ubicacion||'')+kmTxt(o)+'</span>'+(o.fecha?'<span class="nw">'+esc(cuando(o.fecha))+'</span>':'')+'</div>'
    + '<div class="of-meta">'+meta.join('')+'</div></div>'
    + '<div class="ring">'+anillo(p)+'<small>'+etiquetaEncaje(p, o)+'</small>'+botonGuardar(o)+'</div></div>';
}

function kmTxt(o){
  if(o.ejemplo) return '';
  var k = kmDe(o); if(k === null) return '';
  return ' <b class="km'+((S.perfil||{}).geo && !enRadio(o, S.perfil.geo, S.perfil.radio || 25) ? ' lejos' : '')+'">· '+(k < 1 ? 'en tu zona' : k + ' km')+'</b>';
}
function ordenarOfertas(l){
  var d = S.perfil && S.perfil.disc;
  return l.slice().sort(function(a,b){
    if(S.filtro === 'recientes') return String(b.fecha||'').localeCompare(String(a.fecha||''));
    if(S.filtro === 'cerca'){ var ka = kmDe(a), kb = kmDe(b); ka = ka === null ? 1e9 : ka; kb = kb === null ? 1e9 : kb; if(ka !== kb) return ka - kb; }
    var pa = encaje(d,a), pb = encaje(d,b);
    pa = pa===null?-1:pa; pb = pb===null?-1:pb;
    if(pa !== pb) return pb - pa;
    return String(b.fecha||'').localeCompare(String(a.fecha||''));
  });
}


document.addEventListener('click', function(ev){
  var c = ev.target.closest && ev.target.closest('#of-fil .chip');
  if(!c) return;
  S.filtro = c.dataset.f;
  document.querySelectorAll('#of-fil .chip').forEach(function(x){ x.classList.toggle('on', x === c); });
  pintarOfertas();
});

function pintarOfertas(){
  var box = $('of-list');
  if(!S.ofertasCargadas){ box.innerHTML = '<div class="cargando"><div class="spin"></div>Buscando ofertas…</div>'; $('of-aviso').innerHTML=''; return; }
  var d = S.perfil && S.perfil.disc;
  var q = val('of-q').toLowerCase();
  var base = ofertasVisibles();
  prepZona();
  var z = zona(), fuera = [], otras = [];
  var l = base.filter(function(o){
    if(!S.verOtrasProf && S.filtro !== 'guardadas' && otraProfesion(o)){ otras.push(o); return false; }
    var hay = [o.titulo, o.clinica, o.ubicacion, o.descripcion].join(' ').toLowerCase();
    if(q && hay.indexOf(q) === -1) return false;
    if(S.filtro === 'encajan'){ var p = encaje(d,o); if(p === null || p < 70) return false; }
    if(S.filtro === 'guardadas' && !estaGuardada(o.id)) return false;
    if(S.filtro === 'Completa' || S.filtro === 'Parcial'){ if(String(o.jornada||'').toLowerCase().indexOf(S.filtro.toLowerCase()) === -1) return false; }
    if(S.filtro !== 'guardadas' && !enRadio(o, z.origen, z.radio)){ fuera.push(o); return false; }
    return true;
  });
  var chG = document.querySelector('#of-fil .chip[data-f="guardadas"]'), nG = nGuardadas();
  var zb = $('of-zona'); if(zb) zb.style.display = S.filtro === 'guardadas' ? 'none' : '';
  if(chG) chG.innerHTML = svg('bookmark', S.filtro === 'guardadas' ? '#fff' : '#1A56DB', 14) + 'Guardadas' + (nG ? ' <b class="chip-n">' + nG + '</b>' : '');
  if(S.filtro === 'guardadas' && !l.length && !q){
    pintarNotaZona(0, []); $('of-aviso').innerHTML = '';
    box.innerHTML = '<div class="vacio"><b>Todavía no has guardado ninguna oferta</b><p>Toca el marcador '+svg('bookmark','#1A56DB',14)+' de una oferta para guardarla y volver a ella cuando quieras. Las tienes siempre aquí, en «Guardadas».</p><div style="margin-top:14px;"><button class="btn btn-s" onclick="limpiarFiltros()">Ver todas las ofertas</button></div></div>';
    return;
  }
  l = ordenarOfertas(l);
  if(S.filtro === 'guardadas'){ var nz = $('of-nota'); if(nz) nz.innerHTML = svg('bookmark','#1A56DB',14)+'<span><b>'+l.length+(l.length === 1 ? ' oferta guardada' : ' ofertas guardadas')+'</b>, estén donde estén</span>'; }
  else pintarNotaZona(l.length, fuera);
  var nz2 = $('of-nota'), pr = (S.perfil||{}).profesion;
  if(nz2 && pr && PROF_RE[pr] && S.filtro !== 'guardadas'){
    var otrasN = S.verOtrasProf ? base.filter(otraProfesion).length : otras.length;
    if(otrasN) nz2.insertAdjacentHTML('beforeend', '<span class="of-prof">' + (S.verOtrasProf
      ? 'Ves también ' + otrasN + ' de otras profesiones · <button class="link" onclick="S.verOtrasProf=false;pintarOfertas()">Ver solo ' + esc(pr.toLowerCase()) + '</button>'
      : 'Solo ofertas de ' + esc(pr.toLowerCase()) + ' · hay ' + otrasN + ' de otras profesiones <button class="link" onclick="S.verOtrasProf=true;pintarOfertas()">Mostrarlas también</button>') + '</span>');
  }
  var av = '';
  if(S.errOfertas && !hayReales()) av = '<div class="aviso">'+svg('info','#8A5A00',16)+'<span>No hemos podido cargar las ofertas. Revisa tu conexión y vuelve a abrir esta pantalla.</span></div>';
  else if(!hayReales()) av = '<div class="aviso aviso-info">'+svg('info','#1E3A8A',16)+'<span><b>Todavía no hay ofertas publicadas.</b> CERCO acaba de empezar: en cuanto una clínica publique una oferta de tu profesión, la verás aquí y en Inicio. Mientras tanto, deja tu perfil completo y activa «Que las clínicas me encuentren» en Ajustes.</span></div>';
  else if(!d) av = '<div class="aviso aviso-info">'+svg('compass','#1E3A8A',16)+'<span>Haz el test de personalidad para ver tu encaje con cada oferta y poder solicitarlas. <button class="link" onclick="abrirTest(false)">Hacerlo ahora</button></span></div>';
  $('of-aviso').innerHTML = av;
  $('of-sub').textContent = hayReales()
    ? ((function(){ var pr = (S.perfil||{}).profesion, n = (pr && PROF_RE[pr] && !S.verOtrasProf) ? base.filter(function(o){ return !otraProfesion(o); }).length : base.length; return n + (n === 1 ? ' oferta activa' : ' ofertas activas') + ((pr && PROF_RE[pr] && !S.verOtrasProf) ? ' de ' + pr.toLowerCase() : ''); })() + (S.filtro === 'recientes' ? ', de la más nueva a la más antigua.' : (d ? ', ordenadas por tu encaje.' : '.')))
    : 'Ordenadas por lo bien que encajas con cada puesto.';
  if(!l.length && fuera.length){
    var cer = fuera.slice().sort(function(a,b){ return (kmDe(a)||1e9) - (kmDe(b)||1e9); })[0], kc = kmDe(cer);
    box.innerHTML = '<div class="vacio"><b>Ninguna oferta '+esc(txtRadio(z.radio, z.origen))+'</b><p>Hay '+fuera.length+(fuera.length === 1 ? ' más lejos' : ' más lejos')+(kc !== null ? '; la más cercana, a '+kc+' km ('+esc(cer.ubicacion||'')+')' : '')+'.</p><div style="margin-top:14px;display:flex;gap:8px;justify-content:center;flex-wrap:wrap;">'
      + (radioQueLlega(cer) ? '<button class="btn btn-p" onclick="ponerRadio(\''+radioQueLlega(cer)+'\')">Ampliar a '+esc(radioQueLlega(cer) === 'prov' ? 'mi provincia' : radioQueLlega(cer) + ' km')+'</button>' : '')
      + '<button class="btn btn-s" onclick="ponerRadio(\'todo\')">Ver todas</button></div></div>';
    return;
  }
  if(!l.length){
    box.innerHTML = '<div class="vacio"><b>Sin resultados</b><p>'+(q ? 'Ninguna oferta coincide con «'+esc(q)+'». ' : 'Ninguna oferta cumple este filtro. ')+'Prueba con otra palabra o quita el filtro.</p><div style="margin-top:14px;"><button class="btn btn-p" onclick="limpiarFiltros()">Quitar los filtros</button></div></div>';
    return;
  }
  box.innerHTML = l.map(tarjetaOferta).join('');
}
/* Buscar: usa lo que haya escrito en «Desde» y en los km, aunque no se haya elegido de la lista */
function buscarZona(){
  var i = $('of-desde'), t = String(window.__ofTxt != null ? window.__ofTxt : (i ? i.value : '')).trim(), z = zona(); window.__ofTxt = null;
  if(t){
    var l = null; try{ l = CGeo.lugar(t); }catch(e){}
    if(!l){ $('of-nota').innerHTML = svg('info','#B45309',14)+'<span style="color:#B45309;">No encontramos «'+esc(t)+'». Escribe el nombre del pueblo o la ciudad y elígelo de la lista.</span>'; try{ i.focus(); }catch(e){} return; }
    z.origen = CGeo.geo(l);
  }
  var n = parseInt(($('of-rad-n')||{}).value, 10);
  if(n > 0 && n <= 1000) ponerRadio(String(n)); else pintarOfertas();
  try{ var dd = document.querySelector('.geo-dd'); if(dd) dd.remove(); }catch(e){}
  var lst = $('of-list'); if(lst) setTimeout(function(){ var y = lst.getBoundingClientRect().top + window.scrollY - 140; if(y < window.scrollY || y > window.scrollY + innerHeight * .6) window.scrollTo({top:y, behavior:'smooth'}); }, 60);
}
document.addEventListener('keydown', function(ev){ if(ev.key === 'Enter' && ev.target && (ev.target.id === 'of-desde' || ev.target.id === 'of-rad-n')){ var dd = document.querySelector('.geo-dd .act, .geo-dd [aria-selected="true"]'); if(ev.target.id === 'of-desde' && dd) return; window.__ofTxt = ($('of-desde')||{}).value; setTimeout(buscarZona, 30); } });
function prepZona(){
  var i = $('of-desde'), z = zona(); if(!i) return;
  if(!i.dataset.geo) CGeo.autocompletar(i, function(l){ zona().origen = CGeo.geo(l); pintarOfertas(); }, function(){ return zona().origen || (S.perfil||{}).geo; });
  if(document.activeElement !== i) i.value = z.origen ? z.origen.n : '';
  var hay = false; document.querySelectorAll('#of-rad .chip').forEach(function(c){ var on = String(z.radio) === c.dataset.r; hay = hay || on; c.classList.toggle('on', on); });
  var rn = $('of-rad-n'); if(rn && document.activeElement !== rn) rn.value = !hay && typeof z.radio === 'number' ? z.radio : '';
  $('of-zona').classList.toggle('sin', !z.origen);
}
// el radio más pequeño que ya incluye esa oferta (si no es "toda España")
function radioQueLlega(o){
  var z = zona(), g = geoOferta(o), k = kmDe(o); if(k === null || !z.origen) return '';
  var r = [5,10,25,50,100].filter(function(x){ return k <= x && (z.radio === 'prov' || typeof z.radio !== 'number' || x > z.radio); })[0];
  if(r) return String(r);
  return g && g.prov === z.origen.prov && z.radio !== 'prov' ? 'prov' : '';
}
function ponerRadio(r){ zona().radio = /^\d+$/.test(r) ? +r : r; pintarOfertas(); }
function pintarNotaZona(n, fuera){
  var z = zona(), b = $('of-nota'); if(!b) return;
  if(!hayReales()){ b.innerHTML = ''; return; }
  if(!z.origen){ b.innerHTML = svg('info','#6B7280',14)+'<span>Escribe desde dónde buscas y te decimos a cuántos km está cada oferta.</span>'; return; }
  var mio = (S.perfil||{}).geo, t = '<b>'+n+(n === 1 ? ' oferta ' : ' ofertas ')+esc(txtRadio(z.radio, z.origen))+'</b>';
  if(fuera.length && n) t += ' · hay '+fuera.length+' más lejos <button class="link" onclick="ponerRadio(\'todo\')">Verlas</button>';
  if(mio && z.origen.n !== mio.n) t += ' · <button class="link" onclick="zona().origen = (S.perfil||{}).geo; pintarOfertas()">Volver a '+esc(mio.n)+'</button>';
  b.innerHTML = svg('pin','#1A56DB',14)+'<span>'+t+'</span>';
}
document.addEventListener('click', function(ev){
  var c = ev.target.closest && ev.target.closest('#of-rad .chip');
  if(c) ponerRadio(c.dataset.r);
});
function limpiarFiltros(){ $('of-q').value = ''; S.filtro = 'todas'; document.querySelectorAll('#of-fil .chip').forEach(function(x){ x.classList.toggle('on', x.dataset.f === 'todas'); }); pintarOfertas(); }

function cellUbic(o){
  var k = o.ejemplo ? null : kmDe(o, (S.perfil||{}).geo), p = S.perfil || {};
  var fuera = k !== null && !enRadio(o, p.geo, p.radio || 25);
  return '<div class="cell"><div class="k">'+svg('pin','#9CA3AF',12)+'Ubicación</div><div class="v">'+esc(o.ubicacion||'—')+'</div>'
    + (k !== null ? '<div class="km-sub'+(fuera ? ' lejos' : '')+'">'+(k < 1 ? 'En tu misma zona' : 'A '+k+' km de '+esc(p.geo.n))+(fuera ? ' · más lejos de lo que marcaste ('+esc(txtRadioCorto(p.radio||25))+')' : '')+'</div>' : '')
    + '</div>';
}
/* Detalle de una oferta, con el bloque de confianza (Fase 1: una sola versión) */
function pintarDetalle(){
  var r = _pintarDetalleBase.apply(this, arguments);
  if(window.CERCO_detalleConfianza) CERCO_detalleConfianza.apply(this, arguments);
  return r;
}
function _pintarDetalleBase(){
  var o = buscarOferta(S.actual);
  var box = $('od');
  if(!o){
    box.innerHTML = '<button class="back" onclick="ir(\'ofertas\')">'+svg('left','currentColor',16)+'Ofertas</button>'
      + (S.ofertasCargadas ? '<div class="vacio"><b>Esta oferta ya no está disponible</b><p>Puede que la clínica la haya cerrado o que ya haya cubierto el puesto.</p></div>'
                           : '<div class="cargando"><div class="spin"></div></div>');
    return;
  }
  var d = S.perfil && S.perfil.disc;
  var p = encaje(d, o), ps = perfilesDe(o), sol = solDeOferta(o.id);
  var cell = function(ico, k, v){ return '<div class="cell"><div class="k">'+svg(ico,'#9CA3AF',12)+k+'</div><div class="v">'+esc(v||'—')+'</div></div>'; };
  var reqs = String(o.requisitos||'').split(/\n|·|;|,(?![^(]*\))/).map(function(x){ return x.replace(/^[-•*\s]+/,'').trim(); }).filter(Boolean);

  var encajeCard = '<div class="card"><h3>'+svg('compass','currentColor',16)+'Tu encaje</h3>';
  if(!ps.length) encajeCard += '<p class="txt" style="font-size:13.5px;">La clínica no ha indicado qué perfil busca para este puesto.</p>';
  else if(!d) encajeCard += '<p class="txt" style="font-size:13.5px;margin-bottom:12px;">Esta clínica busca <b>'+ps.map(function(l){ return NOMBRE[l]; }).join(' y ')+'</b>. Haz el test para ver cómo encajas.</p><button class="btn btn-p btn-block" onclick="abrirTest(false)">Hacer el test</button>';
  else encajeCard += '<div style="display:flex;align-items:center;gap:14px;margin-bottom:12px;">'+anillo(p,64)+'<div style="display:flex;gap:6px;flex-wrap:wrap;">'+ps.map(function(l){ return chipDisc(l, NOMBRE[l]); }).join('')+'</div></div>'
      + '<p class="txt" style="font-size:13.5px;">'+porQueEncaje(d,o)+'</p>'
      + '<div style="font-size:11.5px;color:#6B7280;margin-top:10px;line-height:1.5;">Es orientativo: la entrevista es lo que cuenta.</div>';
  encajeCard += '</div>';

  var cl = S.clinicas[o.clinicaId] || null, st = statsResp(o.clinicaId), vis = visitaDeOferta(o.id);
  var respCard = '';
  if(!o.ejemplo){
    respCard = '<div class="card"><h3>'+svg('clock','currentColor',16)+'Cómo responde</h3>';
    if(!st) respCard += '<p class="txt" style="font-size:13.5px;color:#6B7280;">Cargando…</p>';
    else if(st.nueva) respCard += '<p class="txt" style="font-size:13.5px;">Clínica nueva en CERCO: todavía no tiene historial de respuestas.</p>';
    else respCard += '<div style="display:flex;align-items:baseline;gap:4px 8px;flex-wrap:wrap;margin-bottom:6px;"><span style="font-size:28px;font-weight:800;color:'+colorResp(st.pct)+';font-variant-numeric:tabular-nums;white-space:nowrap;">'+st.pct+' %</span><span style="font-size:13px;color:#6B7280;">de las solicitudes contestadas</span></div>'
      + (st.med !== null ? '<p class="txt" style="font-size:13.5px;">Normalmente contesta en <b>'+textoHoras(st.med)+'</b>.</p>' : '')
      + (st.pct >= 80 && st.n >= 5 ? '<div class="resp-ok" style="margin-top:8px;">'+svg('check','#0E9F6E',13)+'Clínica que responde</div>' : '')
      + (ultimaRespuesta(o.clinicaId) ? '<p class="txt" style="font-size:13px;color:#6B7280;margin-top:6px;">Última respuesta a un candidato: '+esc(cuando(ultimaRespuesta(o.clinicaId)).toLowerCase())+'.</p>' : '')
      + '<div style="font-size:11.5px;color:#6B7280;margin-top:8px;">Calculado con '+st.n+' solicitudes.</div>';
    cargarValoraciones(o.clinicaId);
    var mv = mediaValoraciones(o.clinicaId);
    if(mv) respCard += '<div style="display:flex;align-items:center;gap:6px;margin-top:12px;padding-top:12px;border-top:1px solid #F3F4F6;font-size:13.5px;">'+svg('star','#F0A000',16)+'<b>'+String(mv.m).replace('.',',')+' de 5</b><span style="color:#6B7280;">· así valoran su proceso '+mv.n+' profesionales</span></div>';
    respCard += '</div>';
  }
  var clinCard = procesoCard(o) + tarjetaClinica(o, cl, d);

  var cta;
  if(o.ejemplo) cta = '<div class="aviso" style="margin:0;">'+svg('info','#8A5A00',16)+'<span>Es una oferta de ejemplo: no se puede solicitar.</span></div>';
  else if(sol && sol.estado === 'retirada') cta = '<button class="btn btn-s btn-block" onclick="ir(\'solicitud\',\''+esc(sol.id)+'\')">Retiraste tu solicitud para esta oferta</button>';
  else if(sol) cta = '<button class="btn btn-s btn-block" onclick="ir(\'solicitud\',\''+esc(sol.id)+'\')">'+svg('check','#0E9F6E',16)+'Ya la has solicitado · Ver en qué punto está</button>';
  else if(!d) cta = '<button class="btn btn-p btn-block" onclick="abrirTest(false)">Haz el test para poder solicitarla</button>';
  else cta = '<button class="btn btn-p btn-block" onclick="modalSolicitar(\''+esc(o.id)+'\')">'+svg('send','#fff',16)+'Solicitar esta oferta</button>';
  // Conocer la clínica antes: un paso más ligero que solicitar
  if(!o.ejemplo && !(sol && sol.estado !== 'retirada') && !(sol && sol.estado === 'retirada')){
    var sec = vis
      ? '<button class="btn btn-s btn-block" onclick="ir(\'solicitud\',\''+esc(vis.id)+'\')" style="color:#66328A;">'+svg('pin','#66328A',16)+'Pediste conocer la clínica · '+esc(txtEstado(vis))+'</button>'
      : '<button class="btn btn-s btn-block" onclick="modalVisita(\''+esc(o.id)+'\')">'+svg('pin','currentColor',16)+'Quiero conocer la clínica</button>';
    cta = '<div class="cta-dos">' + cta + sec + '</div>';
  }

  box.innerHTML = '<button class="back" onclick="history.state && history.length > 1 ? history.back() : ir(\'ofertas\')">'+svg('left','currentColor',16)+'Ofertas</button>'
    + (o.ejemplo ? '<div class="aviso">'+'<span class="badge-ej">EJEMPLO</span><span>Oferta de muestra para enseñarte cómo funciona CERCO.</span></div>' : '')
    + (invDeOferta(o.id) && !sol ? '<div class="aviso aviso-info">'+svg('send','#1E3A8A',16)+'<span><b>'+esc(o.clinica||'La clínica')+' te invita a solicitar esta oferta.</b>'+(invDeOferta(o.id).mensaje ? ' «'+esc(invDeOferta(o.id).mensaje)+'»' : '')+'</span></div>' : '')
    + (propDeOferta(o.id) && !sol ? '<div class="aviso aviso-reb">'+svg('rebote','#66328A',16)+'<span><b>CERCO te propone esta clínica.</b> '+esc(propDeOferta(o.id).motivo||'')+'</span></div>' : '')
    + '<div class="det-h"><div style="min-width:0;"><h1>'+esc(o.titulo)+'</h1><div class="cl">'+svg('building','currentColor',15)+esc(o.clinica||'Clínica')+'</div></div>'
    + (o.fecha ? '<div style="font-size:12.5px;color:#6B7280;padding-top:6px;">Publicada: '+esc(cuando(o.fecha))+'</div>' : '') + '</div>'
    + '<div class="cells">'+cellUbic(o)+cell('clock','Jornada',o.jornada)+cell('euro','Salario',o.salario||'Sin indicar')+cell('cal','Incorporación',o.disponibilidad||'A convenir')+(o.contrato ? cell('file','Contrato',o.contrato) : '')+(o.convenio ? cell('briefcase','Convenio',o.convenio) : '')+(o.prueba ? cell('clock','Periodo de prueba',o.prueba) : '')+(horarioDe(o) ? cell('clock','Horario',horarioDe(o)) : '')+'</div>'
    + (!o.ejemplo && txtGuia(guiaSalarial(rolDe(o), (geoOferta(o)||{}).prov), rolDe(o)) ? '<div class="guia-sal">'+svg('euro','#6B7280',14)+'<span>'+esc(txtGuia(guiaSalarial(rolDe(o), (geoOferta(o)||{}).prov), rolDe(o)))+'</span></div>' : '')
    + (!o.ejemplo ? '<div style="margin:-4px 0 16px;">'+botonGuardar(o, true)+'</div>' : '')
    + '<div class="det-g"><div>'
    +   (o.descripcion ? '<div class="card"><h3>Descripción del puesto</h3><p class="txt">'+esc(o.descripcion)+'</p></div>' : '')
    + ((o.funciones||[]).length ? '<div class="card"><h3>Lo que harás en el día a día</h3><ul class="req">'+o.funciones.map(function(r){ return '<li>'+esc(r)+'</li>'; }).join('')+'</ul></div>' : '')
    +   (reqs.length ? '<div class="card"><h3>Requisitos</h3><ul class="req">'+reqs.map(function(r){ return '<li>'+esc(r)+'</li>'; }).join('')+'</ul></div>' : '')
    +   (!o.descripcion && !reqs.length ? '<div class="card"><p class="txt" style="color:#6B7280;">La clínica no ha añadido más detalles. Si solicitas la oferta, podrás preguntarle todo en la entrevista.</p></div>' : '')
    +   clinCard
    + '</div><div>'+encajeCard+respCard+'</div></div>'
    + '<div class="cta-bar">'+cta+'</div>';
}

/* ---------- horario, proceso y motivo: lo que la clínica deja claro ---------- */
function horarioDe(o){
  var t = (o.turnos || []).join(' · ');
  return [t, o.horario || ''].filter(Boolean).join(' — ');
}
function procesoCard(o){
  if(o.ejemplo || !o.proceso) return '';
  var pasos = String(o.proceso).split(/\s*\+\s*/).filter(Boolean);
  return '<div class="card"><h3>'+svg('check','currentColor',16)+'Cómo será el proceso</h3>'
    + '<ol class="proc">' + ['Envías tu solicitud'].concat(pasos).concat(['Respuesta de la clínica']).map(function(p){ return '<li>'+esc(p)+'</li>'; }).join('') + '</ol>'
    + '<p class="txt" style="font-size:13px;color:#6B7280;margin-top:10px;">Te contestan en 2 días laborables. Si a los 5 no hay respuesta, CERCO cierra la solicitud y te avisa.</p></div>';
}
var MOTIVOS = {
  exp:['Buscaban más experiencia para este puesto.','Las ofertas que piden menos años o aceptan primer empleo son tu mejor opción ahora. Y cuenta en tu vídeo lo que ya sabes hacer.'],
  horario:['El horario o la disponibilidad no coincidían.','Revisa en tu perfil la jornada y la incorporación: así solo verás primero lo que te cuadra.'],
  titulo:['El puesto pide una titulación que no aparece en tu perfil.','Si la tienes, añádela en tu CV resumido: la clínica lo mira antes que nada.'],
  distancia:['La distancia complicaba el día a día.','Puedes ajustar hasta dónde te desplazas en tu perfil para ver primero lo que tienes cerca.'],
  cubierta:['La plaza ya se ha cubierto.','No tiene que ver contigo. Activa las alertas para enterarte antes de la próxima.'],
  otro:['Han seguido con otro perfil que encajaba más con lo que necesitan ahora.','No dice nada malo de ti: cada clínica busca algo distinto en cada momento.']
};
function motivoHtml(s){
  var m = s && s.estado === 'descartada' && MOTIVOS[s.motivo]; if(!m) return '';
  return '<div class="motivo"><b>Motivo:</b> '+esc(m[0])+'<span>'+esc(m[1])+'</span></div>';
}

/* ---------- la clínica y su equipo ---------- */
function tarjetaClinica(o, cl, d){
  if(o.ejemplo || !cl) return '';
  var h = '<div class="card cl-card"><h3>'+svg('users','currentColor',16)+'La clínica y su equipo</h3>';
  var f = (cl.fotos || []).filter(Boolean);
  if(f.length) h += '<div class="cl-fotos n'+Math.min(f.length,4)+'">' + f.slice(0,4).map(function(u, i){ return '<img src="'+esc(u)+'" alt="Foto '+(i+1)+' de '+esc(cl.nom||'la clínica')+'" loading="lazy">'; }).join('') + '</div>';
  if(cl.descripcion) h += '<p class="txt" style="margin-bottom:12px;">'+esc(cl.descripcion)+'</p>';
  if(cl.responsable){
    var ROL = {'Gerente':'gerente de la clínica', 'Director/a clínico':'director/a clínico', 'Odontólogo/a':'odontólogo/a de la clínica', 'Responsable de RRHH':'coordinador/a de clínica', 'Propietario/a':'propietario/a de la clínica'};
    var rol = ROL[cl.responsableRol] || '';
    h += '<div class="cl-resp">'+svg('user','#6B7280',15)+'<span>Te responde <b>'+esc(cl.responsable)+'</b>'+(rol ? ', ' + esc(rol) + '.' : ' directamente, sin intermediarios.')+'</span></div>';
  }
  if(cl.dia) h += '<div class="cl-dia"><div class="eyebrow" style="margin-bottom:6px;">UN DÍA EN EL EQUIPO</div><p class="txt">'+esc(cl.dia)+'</p></div>';
  if((cl.ventajas||[]).length) h += '<div class="chips" style="margin:12px 0 4px;">' + cl.ventajas.map(function(v){ return '<span class="pill" style="background:#EEF3FE;color:#1A56DB;padding:6px 11px;font-size:12px;">'+esc(v)+'</span>'; }).join('') + '</div>';
  var eq = cl.equipo;
  if(eq && eq.fiable && eq.comp){
    var c = eq.comp;
    h += '<div class="cl-eq"><div class="eyebrow" style="margin-bottom:10px;">CÓMO ES EL EQUIPO'+(eq.personas ? ' · '+eq.personas+(eq.personas == 1 ? ' PERSONA' : ' PERSONAS') : '')+'</div>'
      + '<div class="cl-barra">' + LETRAS.map(function(l){ return c[l] ? '<span style="width:'+c[l]+'%;background:'+COLOR[l]+'" title="'+NOMBRE[l]+' '+c[l]+' %"></span>' : ''; }).join('') + '</div>'
      + '<div class="cl-ley">' + LETRAS.map(function(l){ return '<span><i style="background:'+COLOR[l]+'"></i>'+NOMBRE[l]+' '+(c[l]||0)+' %</span>'; }).join('') + '</div>';
    var fa = eq.falta;
    if(fa){
      var t = 'Al equipo le falta sobre todo perfil <b>'+NOMBRE[fa]+'</b>. ';
      if(d && d.dom === fa) t += 'Es tu rasgo principal: aportarías justo lo que más les falta.';
      else if(d && d.sec === fa) t += 'Es tu segundo rasgo: también lo aportarías.';
      else if(d) t += 'Tu punto fuerte ('+NOMBRE[d.dom].toLowerCase()+') ya está en el equipo: encajarías con gente que trabaja como tú.';
      h += '<div class="cl-insight">'+svg('sparkles','#1A56DB',15)+'<span>'+t+'</span></div>';
    }
    h += '</div>';
  } else if(eq && eq.personas){
    h += '<div class="cl-eq"><div class="eyebrow" style="margin-bottom:6px;">CÓMO ES EL EQUIPO</div><p class="txt" style="font-size:13.5px;color:#6B7280;">Equipo de '+eq.personas+(eq.personas == 1 ? ' persona' : ' personas')+'. El perfil del equipo aparecerá cuando al menos 3 hayan hecho el test.</p></div>';
  }
  return h + '</div>';
}

var MODOS = ['Visita presencial','Llamada','Videollamada'];
function modalVisita(id){
  var o = buscarOferta(id); if(!o || o.ejemplo) return;
  if(!S.perfil || !S.perfil.disc){ abrirTest(false); return; }
  cerrarModal();
  var m = document.createElement('div');
  m.className = 'modal-bg'; m.id = 'modal';
  m.onclick = function(e){ if(e.target === m) cerrarModal(); };
  m.innerHTML = '<div class="modal" role="dialog" aria-modal="true">'
    + '<h2>Conocer '+esc(o.clinica||'la clínica')+'</h2>'
    + '<p>Pide pasar una hora por la clínica o hablar con ellos antes de solicitar. No te compromete a nada y la oferta sigue abierta para ti.</p>'
    + '<div class="field"><label>Cómo prefieres conocerla</label><div class="chips" id="m-modo">'
    + MODOS.map(function(x, i){ return '<span class="chip'+(i===0?' on':'')+'" role="button" tabindex="0" data-v="'+x+'">'+x+'</span>'; }).join('') + '</div></div>'
    + '<div class="field"><label for="m-msg">Mensaje <span class="opc">(opcional)</span></label><textarea class="inp" id="m-msg" maxlength="500" placeholder="Ej: me encantaría ver cómo trabajáis. Tengo libres las tardes de martes y jueves."></textarea></div>'
    + '<div class="hint" style="margin:-6px 0 12px;">La clínica verá tu CV resumido y tu perfil, igual que en una solicitud.</div>'
    + '<div class="err" id="m-err"></div>'
    + '<div class="acts"><button class="btn btn-s" onclick="cerrarModal()">Cancelar</button><button class="btn btn-p" id="m-btn" style="background:#66328A;" onclick="enviarVisita(\''+esc(o.id)+'\')">Enviar petición</button></div></div>';
  document.body.appendChild(m);
  m.querySelectorAll('#m-modo .chip').forEach(function(c){
    var pick = function(){ m.querySelectorAll('#m-modo .chip').forEach(function(x){ x.classList.toggle('on', x === c); }); };
    c.addEventListener('click', pick);
    c.addEventListener('keydown', function(e){ if(e.key === 'Enter' || e.key === ' '){ e.preventDefault(); pick(); } });
  });
}
function enviarVisita(id){
  var o = buscarOferta(id); if(!o) return;
  if(visitaDeOferta(id)){ cerrarModal(); toast('Ya habías pedido conocer esta clínica'); return; }
  if(!unaVez('visita', 2000)) return;
  var p = S.perfil || {};
  var modo = ((document.querySelector('#m-modo .chip.on')||{}).dataset||{}).v || MODOS[0];
  bloquear('m-btn', 'Enviando…');
  Nube.solicitar(o, p, val('m-msg'), encaje(p.disc, o), 'visita', modo).then(function(doc){
    if(!S.sols.some(function(s){ return s.id === doc.id; })) S.sols.unshift(doc);
    _estadosVistos[doc.id] = 'enviada';
    cerrarModal();
    toast('Petición enviada a ' + (o.clinica || 'la clínica'));
    ir('solicitud', doc.id);
  }).catch(function(){
    bloquear('m-btn');
    error('m-err', 'No hemos podido enviarla. Revisa tu conexión y vuelve a pulsar.');
  });
}

/* ---------- solicitar ---------- */
function cerrarModal(){ var m = $('modal'); if(m) m.remove(); }
function modalSolicitar(id){
  var o = buscarOferta(id); if(!o || o.ejemplo) return;
  var p = S.perfil || {};
  cerrarModal();
  var m = document.createElement('div');
  m.className = 'modal-bg'; m.id = 'modal';
  m.onclick = function(e){ if(e.target === m) cerrarModal(); };
  m.innerHTML = '<div class="modal" role="dialog" aria-modal="true">'
    + '<h2>Solicitar «'+esc(o.titulo)+'»</h2>'
    + '<p>'+esc(o.clinica||'La clínica')+' recibirá tu solicitud al momento.</p>'
    + '<div class="ve"><div style="font-weight:800;color:#111827;padding-bottom:6px;">Qué verá la clínica</div>'
    + '<div>'+svg('file','#6B7280',15)+'<span>Tu CV resumido: '+esc(p.profesion||'')+', '+esc((p.experiencia||'').toLowerCase())+', '+esc(p.ciudad||'')+'</span></div>'
    + '<div>'+svg('compass','#6B7280',15)+'<span>Tu perfil de personalidad ('+NOMBRE[p.disc.dom]+' con rasgo '+NOMBRE[p.disc.sec].toLowerCase()+')</span></div>'
    + (p.video ? '<div>'+svg('video','#6B7280',15)+'<span>Tu vídeo de presentación'+(p.cv ? ' y tu CV completo en PDF' : '')+'</span></div>' : (p.cv ? '<div>'+svg('file','#6B7280',15)+'<span>Tu CV completo en PDF</span></div>' : ''))
    + '<div>'+svg('phone','#6B7280',15)+'<span>Tu teléfono y tu correo, para poder llamarte</span></div></div>'
    + (!p.video ? '<div class="aviso aviso-info" style="margin:-4px 0 14px;">'+svg('video','#1E3A8A',16)+'<span>No tienes vídeo. Las clínicas lo ven antes que el CV. <button class="link" onclick="cerrarModal(); ir(\'perfil\'); setTimeout(abrirGrabadora, 200)">Grabarlo ahora</button></span></div>' : '')
    + (propDeOferta(o.id) ? '<div class="aviso aviso-info" style="margin:-4px 0 14px;">'+svg('rebote','#1E3A8A',16)+'<span>CERCO te propone esta clínica. '+esc(propDeOferta(o.id).motivo||'')+'</span></div>' : '')
    + bloqueDestacar()
    + '<div class="field"><label for="m-msg">Mensaje para la clínica <span class="opc">(opcional)</span></label><textarea class="inp" id="m-msg" maxlength="500" placeholder="Por qué te interesa este puesto, cuándo puedes hacer una entrevista…"></textarea></div>'
    + '<div class="err" id="m-err"></div>'
    + '<div class="acts"><button class="btn btn-s" onclick="cerrarModal()">Cancelar</button><button class="btn btn-p" id="m-btn" onclick="enviarSolicitud(\''+esc(o.id)+'\')">Enviar solicitud</button></div></div>';
  document.body.appendChild(m);
}
function enviarSolicitud(id){
  var o = buscarOferta(id); if(!o) return;
  if(solDeOferta(id)){ cerrarModal(); toast('Ya habías solicitado esta oferta'); return; }
  if(!unaVez('enviar', 2000)) return;
  var p = S.perfil || {};
  bloquear('m-btn', 'Enviando…');
  var ex = extrasSolicitud(o);
  Nube.solicitar(o, p, val('m-msg'), encaje(p.disc, o), null, null, ex).then(function(doc){
    trasSolicitar(o);
    // aparece al momento aunque el listener tarde
    if(!S.sols.some(function(s){ return s.id === doc.id; })) S.sols.unshift(doc);
    else S.sols = S.sols.map(function(s){ return s.id === doc.id ? doc : s; });
    _estadosVistos[doc.id] = 'enviada';
    cerrarModal();
    toast((ex.destacada ? 'Solicitud destacada enviada a ' : 'Solicitud enviada a ') + (o.clinica || 'la clínica'));
    ir('solicitud', doc.id);
  }).catch(function(){
    bloquear('m-btn');
    error('m-err', 'No hemos podido enviarla. Revisa tu conexión y vuelve a pulsar.');
  });
}

/* ---------- mis solicitudes ---------- */
function pillEstado(e, s){ var vis = esVisita(s) && (e === 'enviada' || e === 'vista'); return '<span class="pill est-'+esc(e)+'"'+(vis?' style="background:#F3EEFA;color:#66328A;"':'')+'>'+esc(s ? txtEstado(s) : (TXT_ESTADO[e] || e))+'</span>'; }
function pintarSolicitudes(){
  var box = $('so-list');
  if(!S.solsCargadas){ box.innerHTML = '<div class="cargando"><div class="spin"></div></div>'; return; }
  if(!S.sols.length){
    box.innerHTML = '<div class="vacio"><b>Todavía no has enviado ninguna solicitud</b><p>Busca una oferta que te encaje y solicítala con un toque. Aquí verás cuándo la clínica la abre y si te invita a una entrevista.</p><div style="margin-top:16px;"><button class="btn btn-p" onclick="ir(\'ofertas\')">Ver ofertas</button></div></div>';
    return;
  }
  var ico = {enviada:'send', vista:'eye', entrevista:'video', descartada:'x', retirada:'x', caducada:'clock', contratada:'sparkles'};
  var col = {enviada:'#1A56DB', vista:'#1A56DB', entrevista:'#0E9F6E', descartada:'#9CA3AF', retirada:'#9CA3AF', caducada:'#9CA3AF', contratada:'#fff'};
  box.innerHTML = S.sols.map(function(s){
    return '<div class="sol" onclick="ir(\'solicitud\',\''+esc(s.id)+'\')">'
      + '<div class="ic" style="'+(esVisita(s)?'background:#F3EEFA;':'')+(s.estado==='contratada'?'background:#059669;':'')+(s.estado==='entrevista'?'background:#E8F8F1;':'')+(s.estado==='descartada'||s.estado==='retirada'||s.estado==='caducada'?'background:#F3F4F6;':'')+'">'+svg(esVisita(s) && (s.estado==='enviada'||s.estado==='vista') ? 'pin' : (ico[s.estado]||'send'), esVisita(s) && (s.estado==='enviada'||s.estado==='vista') ? '#66328A' : (col[s.estado]||'#1A56DB'), 19)+'</div>'
      + '<div style="flex:1;min-width:0;"><div class="sol-t">'+(esVisita(s)?'Conocer la clínica · ':'')+esc(s.ofertaTitulo)+'</div>'
      + '<div class="sol-s">'+esc(s.clinicaNombre||'')+' · '+esc(cuando(s.actualizado||s.fecha))+(s.origen === 'rebote' ? ' · <span style="color:#66328A;font-weight:700;">te presentó CERCO</span>' : '')+(s.destacada ? ' · <span style="color:#B45309;font-weight:700;">destacada</span>' : '')+'</div>'
      + ((s.cita && s.estado === 'entrevista') || sinLeerC(s) ? '<div class="sol-extra">'
          + (s.cita && s.estado === 'entrevista' ? '<span class="'+(s.cita.estado==='propuesta'?'sx-p':'sx')+'">'+svg('cal','currentColor',12)+esc(fechaCitaC(s.cita.fecha).split(',')[0])+(s.cita.estado==='propuesta'?' · confírmala':(s.cita.estado==='cambio'?' · pediste otro día':' · confirmada'))+'</span>' : '')
          + (sinLeerC(s) ? '<span class="sx-m">'+svg('msg','currentColor',12)+sinLeerC(s)+' mensaje'+(sinLeerC(s)>1?'s':'')+' nuevo'+(sinLeerC(s)>1?'s':'')+'</span>' : '')
          + '</div>' : '')
      + '</div>'
      + '<div class="sol-r">'+pillEstado(s.estado, s)+svg('right','#C1C7D0',16)+'</div></div>';
  }).join('');
}

function buscarSol(id){ for(var i=0;i<S.sols.length;i++) if(S.sols[i].id === id) return S.sols[i]; return null; }
function fechaDe(s, e){
  var h = s.historial || [];
  for(var i=h.length-1;i>=0;i--) if(h[i].estado === e) return h[i].fecha;
  return e === 'enviada' ? s.fecha : null;
}
/* Detalle de una solicitud, con el pie y «Tu incorporación» (Fase 1: una sola versión) */
function pintarSolicitud(){
  var r = _pintarSolicitudBase.apply(this, arguments);
  if(window.CERCO_solicitudPie) CERCO_solicitudPie.apply(this, arguments);
  if(window.CERCO_solicitudIncorporacion) CERCO_solicitudIncorporacion.apply(this, arguments);
  return r;
}
function _pintarSolicitudBase(){
  var s = buscarSol(S.actualSol), box = $('sd');
  var back = '<button class="back" onclick="ir(\'solicitudes\')">'+svg('left','currentColor',16)+'Mis solicitudes</button>';
  if(!s){ box.innerHTML = back + (S.solsCargadas ? '<div class="vacio"><b>No encontramos esta solicitud</b><p>Vuelve a tu lista de solicitudes.</p></div>' : '<div class="cargando"><div class="spin"></div></div>'); return; }
  var e = s.estado;
  var V = esVisita(s);
  var pasos = V ? [
    {k:'enviada', t:'Petición enviada', n:'La clínica sabe que quieres conocerla ('+esc((s.modo||'visita presencial').toLowerCase())+').'},
    {k:'vista', t:'Vista por la clínica', n:'La clínica ha abierto tu perfil.'},
    {k:'final', t: e==='caducada' ? 'No contestaron en '+diasCaduca()+' días' : e==='entrevista' ? 'Te proponen día y hora' : (e==='descartada' ? 'Ahora no pueden recibirte' : (e==='retirada' ? 'Has retirado la petición' : 'Respuesta de la clínica')),
     n: e==='caducada' ? 'Hemos cerrado la petición para que no esperes más.' : e==='entrevista' ? (s.cita ? 'Confirma el día o pide otro aquí arriba.' : 'Mira su mensaje.') : (e==='descartada' ? 'Puedes solicitar la oferta igualmente: la revisarán.' : (e==='retirada' ? 'La clínica ya no la verá como activa.' : 'Te avisaremos aquí en cuanto contesten.'))}
  ] : [
    {k:'enviada', t:'Solicitud enviada', n:'Tu CV resumido y tu perfil han llegado a la clínica.'},
    {k:'vista', t: s.interesa ? 'Les interesas' : 'Vista por la clínica', n: s.interesa ? 'La clínica ha marcado tu perfil como «Me interesa»: sigues en el proceso. El siguiente paso es que te propongan entrevista.' : 'La clínica ha abierto tu perfil.'},
    {k:'entrevista', t:'Entrevista', n: e === 'entrevista' ? (s.cita ? 'El día y la hora están arriba.' : 'La clínica te propondrá día y hora.') : (fechaDe(s,'entrevista') ? (s.cita ? (new Date(s.cita.fecha) > new Date() ? 'Será el ' : 'Fue el ') + fechaCitaC(s.cita.fecha).toLowerCase() + '.' : 'Hecha.') : 'Si la clínica quiere conocerte, te propondrá día y hora aquí.')},
    {k:'final', t: e==='caducada' ? 'La clínica no contestó en '+diasCaduca()+' días' : e==='contratada' ? '¡Te han elegido!' : (e==='descartada' ? 'No han seguido con tu candidatura' : (e==='retirada' ? 'Has retirado la solicitud' : 'Decisión de la clínica')),
     n: e==='caducada' ? 'Hemos cerrado la solicitud para que no esperes más.' + (['auto','preguntar'].indexOf((S.perfil||{}).rebote) > -1 ? ' Te estamos buscando otra clínica que encaje.' : ' Activa el efecto rebote en tu perfil y te buscamos otra.') : e==='contratada' ? 'La clínica te llamará para concretar la incorporación.' : (e==='descartada' ? 'Esta vez han elegido otro perfil.' + (['auto','preguntar'].indexOf((S.perfil||{}).rebote) > -1 ? ' CERCO ya te está buscando otra clínica a la que le falte tu perfil.' : ' Sigue probando: hay más ofertas que te encajan.') : (e==='retirada' ? 'La clínica ya no verá esta solicitud como activa.' : 'Te avisaremos aquí en cuanto decidan.'))}
  ];
  var orden = V ? {enviada:0, vista:1, entrevista:2, descartada:2, retirada:2, caducada:2} : {enviada:0, vista:1, entrevista:2, descartada:3, retirada:3, contratada:3, caducada:3};
  if(!V && (e === 'descartada' || e === 'retirada' || e === 'caducada') && !fechaDe(s,'entrevista')) pasos.splice(2,1), orden = {enviada:0, vista:1, descartada:2, retirada:2, caducada:2};
  var pos = orden[e] || 0;
  var final = pos === pasos.length - 1;
  var tl = pasos.map(function(p, i){
    // lo hecho en verde; lo que esperas, marcado; lo que queda, en gris
    var cls = i <= pos ? 'done' : (i === pos+1 ? 'now' : '');
    // si la retiras antes de que la abran, "vista" no ha pasado nunca
    if(p.k === 'vista' && e === 'retirada' && !fechaDe(s,'vista')) cls = '';
    var f = (p.k === 'final' || (V && p.k === 'final')) ? (final ? fechaDe(s, e) : null) : fechaDe(s, p.k);
    var hecho = cls === 'done';
    var pie = f ? esc(cuando(f)) : (hecho || cls === 'now' ? '' : 'Pendiente');
    return '<div class="tl-i '+cls+'"><div class="tl-t">'+p.t+'</div>'
      + (pie ? '<div class="tl-d">'+pie+'</div>' : '')
      + (hecho || cls === 'now' ? '<div class="tl-n">'+(cls === 'now' && p.k === 'vista' ? 'Esperando a que la clínica abra tu perfil.' : p.n)+'</div>' : '')
      + (((p.k === 'final' && (e==='descartada'||e==='contratada'||(V && e==='entrevista'))) || (p.k === 'entrevista' && e === 'entrevista')) && s.nota ? '<div class="nota'+(e==='contratada'?' gana':'')+'"><b>Mensaje de '+esc(s.clinicaNombre||'la clínica')+':</b>\n'+esc(s.nota)+'</div>' : '')
      + (p.k === 'final' ? motivoHtml(s) : '')
      + '</div>';
  }).join('');
  var enCurso = e === 'enviada' || e === 'vista';
  var hh = (Date.now() - new Date(s.fecha)) / 3600000;
  var of = buscarOferta(s.ofertaId);
  marcarVistosC(s); setTimeout(refrescarBadge, 0);
  box.innerHTML = back
    + '<div class="eyebrow" style="'+(V?'color:#66328A;':'')+'">'+(V?'CONOCER LA CLÍNICA':'SOLICITUD')+'</div>'
    + '<h1 class="t">'+esc(s.ofertaTitulo)+'</h1>'
    + '<div style="display:flex;align-items:center;gap:10px;flex-wrap:wrap;margin:0 0 20px;"><span style="font-size:14px;color:#1A56DB;font-weight:700;display:inline-flex;align-items:center;gap:6px;">'+svg('building','currentColor',15)+esc(s.clinicaNombre||'')+'</span>'+pillEstado(e, s)+'</div>'
    + (e === 'contratada' ? '<div class="card gana-card">'+svg('sparkles','#fff',26)+'<div><div class="gana-t">¡Enhorabuena, '+esc(primerNom((S.perfil||{}).nombre))+'!</div><div class="gana-s">'+esc(s.clinicaNombre||'La clínica')+' te ha elegido para '+esc(s.ofertaTitulo||'el puesto')+'.</div></div></div>' : '')
    + (enCurso ? tarjetaPlazo(s) : '')
    + (!of && (enCurso || e === 'entrevista') ? '<div class="aviso">'+svg('info','#8A5A00',16)+'<span>La clínica ha pausado o cerrado esta oferta. Tu '+(V?'petición':'solicitud')+' sigue abierta hasta que te contesten.</span></div>' : '')
    + (s.origen === 'rebote' ? '<div class="aviso aviso-reb">'+svg('rebote','#66328A',16)+'<span><b>Te presentó CERCO.</b> '+esc(s.rebote && s.rebote.motivoC ? s.rebote.motivoC : 'Tu perfil encaja con lo que buscan.')+'</span></div>' : '')
    + (s.destacada ? '<div class="aviso aviso-dest">'+svg('star','#B45309',16)+'<span>Solicitud destacada: la clínica la ve arriba del todo.</span></div>' : '')
    + (e === 'entrevista' ? bloqueCitaC(s) : '')
    + '<div class="card"><h3>Seguimiento</h3><div class="tl">'+tl+'</div></div>'
    + bloqueValorar(s)
    + bloqueMensajesC(s)
    + (s.mensaje ? '<div class="card"><h3>Tu mensaje inicial</h3><p class="txt">'+esc(s.mensaje)+'</p></div>' : '')
    + '<div style="display:flex;gap:10px;flex-wrap:wrap;">'
    +   (of ? '<button class="btn btn-s" onclick="ir(\'oferta\',\''+esc(s.ofertaId)+'\')">Ver la oferta</button>' : '')
    +   (V && !solDeOferta(s.ofertaId) && buscarOferta(s.ofertaId) ? '<button class="btn btn-p" onclick="modalSolicitar(\''+esc(s.ofertaId)+'\')">Solicitar la oferta</button>' : '')
    +   (enCurso || e === 'entrevista' ? '<button class="btn btn-d" onclick="modalRetirar(\''+esc(s.id)+'\')">'+(V?'Retirar petición':'Retirar solicitud')+'</button>' : '')
    + '</div>';
}
function modalRetirar(id){
  var s = buscarSol(id); if(!s) return;
  cerrarModal();
  var m = document.createElement('div');
  m.className = 'modal-bg'; m.id = 'modal';
  m.onclick = function(e){ if(e.target === m) cerrarModal(); };
  m.innerHTML = '<div class="modal"><h2>'+(esVisita(s)?'¿Retirar la petición?':'¿Retirar la solicitud?')+'</h2><p>'+(esVisita(s) ? esc(s.clinicaNombre||'La clínica')+' verá que ya no quieres la visita. Podrás seguir solicitando la oferta.' : esc(s.clinicaNombre||'La clínica')+' verá que ya no te interesa el puesto de '+esc(s.ofertaTitulo)+'. No podrás volver a solicitarlo.')+'</p><div class="err" id="m-err"></div>'
    + '<div class="acts"><button class="btn btn-s" onclick="cerrarModal()">Cancelar</button><button class="btn btn-d" id="m-btn" onclick="retirar(\''+esc(id)+'\')">Sí, retirarla</button></div></div>';
  document.body.appendChild(m);
}
function retirar(id){
  var s = buscarSol(id); if(!s || !unaVez('retirar')) return;
  bloquear('m-btn', 'Retirando…');
  Nube.retirar(s).then(function(){
    s.estado = 'retirada'; _estadosVistos[s.id] = 'retirada';
    cerrarModal(); toast('Solicitud retirada'); refrescar();
  }).catch(function(){ bloquear('m-btn'); error('m-err', 'No hemos podido retirarla. Revisa tu conexión.'); });
}

/* ---------- perfil ---------- */
function pintarPerfil(){
  var p = S.perfil || {};
  avatar($('pf-av'), p);
  try{ pintarMedia(); }catch(e){}
  $('pf-nom').textContent = p.nombre || 'Mi perfil';
  $('pf-rol').textContent = [p.profesion, p.ciudad].filter(Boolean).join(' · ');
  var fila = function(k, v){ return '<dt>'+k+'</dt><dd>'+(v ? esc(v) : '<span style="color:#C1C7D0;font-weight:500;">Sin completar</span>')+'</dd>'; };
  $('pf-kv').innerHTML = fila('Profesión', p.profesion) + fila('Experiencia', p.experiencia) + fila('Titulación', p.titulacion)
    + fila('Zona', p.ciudad ? p.ciudad + (p.geo ? ' · ' + txtRadioCorto(p.radio || 25) : '') : '') + fila('Teléfono', p.telefono) + fila('Jornada', p.jornada) + fila('Incorporación', p.disponibilidad)
    + fila('Puntos fuertes', (p.fuertes||[]).join(', ')) + fila('Presentación', p.resumen) + (p.colegiado ? fila('Colegiación', 'Nº ' + p.colegiado + (p.colegio ? ' · ' + p.colegio : '')) : '');
  var t = p.trabajos || [];
  $('pf-exps').innerHTML = t.length ? '<div style="font-size:13px;font-weight:800;color:#374151;margin:18px 0 8px;">Dónde has trabajado</div>'
    + t.map(function(x){ return '<div style="display:flex;gap:10px;align-items:flex-start;padding:8px 0;border-top:1px solid #F3F4F6;">'+svg('briefcase','#9CA3AF',16)+'<div><div style="font-size:14px;font-weight:700;">'+esc(x.puesto||'')+'</div><div style="font-size:13px;color:#6B7280;">'+esc([x.centro,x.tiempo].filter(Boolean).join(' · '))+'</div></div></div>'; }).join('') : '';
  var d = p.disc;
  $('pf-disc').innerHTML = d
    ? '<h3>'+svg('compass','currentColor',16)+'Tu forma de trabajar</h3>'
      + '<div style="display:flex;gap:14px;align-items:center;margin-bottom:16px;"><div class="disc-big" style="background:'+COLOR[d.dom]+'">'+d.dom+'</div><div><div style="font-size:16px;font-weight:800;">'+NOMBRE[d.dom]+' con rasgo '+NOMBRE[d.sec].toLowerCase()+'</div><div style="font-size:13.5px;color:#6B7280;line-height:1.55;margin-top:3px;">'+DESC[d.dom]+'</div></div></div>'
      + '<div class="bars">'+barras(d.norm)+'</div>'
      + '<div style="display:flex;justify-content:space-between;align-items:center;gap:10px;flex-wrap:wrap;margin-top:6px;"><span style="font-size:12px;color:#6B7280;">Hecho '+esc(cuando(d.fecha).toLowerCase())+((p.discVeces||1) > 1 ? ' · lo has hecho '+p.discVeces+' veces' : '')+'</span>'+(discRepetible(p).ok ? '<button class="btn btn-s" style="padding:8px 14px;font-size:13px;" onclick="abrirTest(true)">Repetir el test</button>' : '<span class="pf-fh">Podrás repetirlo a partir del '+esc(fechaCorta(discRepetible(p).fecha))+'</span>')+'</div>'
      + histDiscHtml(p)
    : '<h3>'+svg('compass','currentColor',16)+'Tu forma de trabajar</h3><p class="txt" style="margin-bottom:14px;">Todavía no has hecho el test. Lo necesitas para poder solicitar ofertas.</p><button class="btn btn-p" onclick="abrirTest(false)">Hacer el test</button>';
  $('pf-email').textContent = p.email || Nube.email || '';
  try{ pintarCabPerfil(p); }catch(e){}
  try{ pintarAjustes(); }catch(e){}
}

/* ================================================================
   BIENVENIDA (antes de crear el perfil) y GUÍA (la primera vez en Inicio)
   ================================================================ */
var BV = 0;
function abrirBienvenida(){ BV = 0; bvPintar(); ir('bienvenida', null, true); }
function bvPintar(){
  document.querySelectorAll('#v-bienvenida .bv-sl').forEach(function(s,i){ s.classList.toggle('on', i === BV); });
  document.querySelectorAll('#bv-dots span').forEach(function(s,i){ s.classList.toggle('on', i === BV); });
  $('bv-atras').style.display = BV > 0 ? '' : 'none';
  $('bv-saltar').style.display = BV > 0 ? 'none' : '';
  $('bv-next').textContent = BV === 3 ? 'Crear mi perfil' : 'Siguiente';
}
function bvIr(d){ if(BV + d > 3) return bvAcabar(); BV = Math.max(0, BV + d); bvPintar(); }
function bvAcabar(){
  if(S.perfil){ S.perfil.bienvenida = true; try{ Nube.guardarPerfil(S.perfil).catch(function(){}); }catch(e){} }
  abrirAlta(false);
}

var GUIA = [
  { sel:null, t:'Hola, soy Seimian. Te enseño tu panel en un minuto para que sepas dónde está cada cosa.' },
  { sel:'#in2-hero', t:'Arriba, siempre una sola cosa: la que más importa ahora. Si una clínica espera tu respuesta, sale aquí; si no, tu siguiente paso.' },
  { sel:'#in2-sols', t:'Debajo ves cada solicitud como un camino de cuatro pasos y cuántos días le quedan a la clínica para contestarte.' },
  { sel:'#in2-ofs', t:'Y aquí, las ofertas que mejor te encajan. El círculo es tu encaje con el perfil que busca la clínica.' },
  { sel:{d:'.nav-item[data-v="ofertas"]', m:'.tab[data-v="ofertas"]'}, t:'En Ofertas ves todas las que hay publicadas. Puedes buscar por puesto, clínica o ciudad, y quedarte solo con las que encajan contigo.' },
  { sel:{d:'.nav-item[data-v="solicitudes"]', m:'.tab[data-v="solicitudes"]'}, t:'Cuando envíes una solicitud, aquí verás en qué punto está: si la clínica la ha abierto, si te invita a una entrevista o qué ha decidido.' },
  { sel:{d:'.nav-item[data-v="herramientas"]', m:'.tab[data-v="herramientas"]'}, t:'Y aquí tienes Herramientas. Entramos y te enseño qué hace cada una.' },
  { v:'herramientas', sel:'#hr-g-0', t:'<b>Para conseguir el puesto.</b> <i>Ensaya tu entrevista</i>: las mismas preguntas que la clínica tiene para tu perfil, y Seimian te dice qué le falta a tu respuesta. <i>Mensaje para la clínica</i>: tres versiones del mensaje al solicitar. <i>Revisión de tu perfil</i>: qué ve la clínica y qué te falta para que te llamen antes.' },
  { v:'herramientas', sel:'#hr-g-1', t:'<b>Para decidir bien.</b> <i>Comparar ofertas</i>: hasta 3 lado a lado (sueldo neto, distancia, encaje, contrato y cómo contesta cada clínica). <i>Sueldo neto</i>: de bruto anual a lo que cobrarías cada mes. <i>Tu valor en el mercado</i>: qué se paga en tu provincia y cómo pedirlo.' },
  { sel:{d:'.nav-item[data-v="perfil"]', m:'.tab[data-v="perfil"]'}, t:'En Mi perfil pones tu foto, tu vídeo y tu CV, y ves el resultado del test.' },
  { sel:{d:'.nav-user-btn', m:'#mtop-av'}, t:'Tocando tu foto o tus iniciales abres tu cuenta: avisos, privacidad, contraseña y cerrar sesión.' },
  { sel:null, t:'Ya está. Empieza por lo que tienes arriba del todo. Si quieres volver a ver esta guía, la tienes en el menú de tu cuenta.', fin:true }
];
var G = { i:0, on:false };
function guiaSiToca(){
  var p = S.perfil;
  if(!p || !p.profesion || p.guia || G.on || window.__guiaVista) return;
  setTimeout(function(){ if(S.vista === 'inicio' && !G.on) guiaEmpezar(false); }, 450);
}
function guiaEmpezar(){ G.i = 0; G.on = true; window.__guiaVista = true; try{ $('toast').classList.remove('on'); }catch(e){} guiaPaso(); }
function guiaCerrar(silencio){
  if(!G.on) return;
  G.on = false;
  ['gu-hl','gu-card'].forEach(function(id){ var e = $(id); if(e) e.remove(); });
  window.removeEventListener('resize', guiaColocar); window.removeEventListener('scroll', guiaColocar, true);
  if(S.perfil && !S.perfil.guia){ S.perfil.guia = true; try{ Nube.guardarPerfil(S.perfil).catch(function(){}); }catch(e){} }
}
function guiaObjetivo(){
  var s = GUIA[G.i].sel; if(!s) return null;
  if(typeof s === 'object') s = innerWidth <= 860 ? s.m : s.d;
  var el = document.querySelector(s);
  if(!el) return null;
  var r = el.getBoundingClientRect();
  return (r.width && r.height) ? el : null;
}
function guiaPaso(){
  var st = GUIA[G.i];
  // algunos pasos enseñan otra pantalla: primero vamos allí
  var quiere = st.v || 'inicio';
  if(S.vista !== quiere){
    ['gu-hl','gu-card'].forEach(function(id){ var e = $(id); if(e) e.style.visibility = 'hidden'; });
    window._guiaNavega = true;
    try{ if(quiere === 'herramientas') abrirHerramienta(null); else ir(quiere); }finally{ window._guiaNavega = false; }
    window.scrollTo(0, 0);
    setTimeout(function(){ ['gu-hl','gu-card'].forEach(function(id){ var e = $(id); if(e) e.style.visibility = ''; }); if(G.on) guiaPaso(); }, 260);
    return;
  }
  var hl = $('gu-hl'); if(!hl){ hl = document.createElement('div'); hl.id = 'gu-hl'; hl.className = 'gu-hl'; document.body.appendChild(hl); }
  var c = $('gu-card'); if(c) c.remove();
  c = document.createElement('div'); c.id = 'gu-card'; c.className = 'gu-card';
  c.setAttribute('role','dialog'); c.setAttribute('aria-label','Guía de CERCO');
  c.innerHTML = '<div class="gu-h"><div class="gu-av">'+svg('sparkles','#fff',16)+'</div><div class="gu-n">Seimian</div><button class="gu-x" aria-label="Cerrar la guía" onclick="guiaCerrar()">'+svg('x','#9CA3AF',16)+'</button></div>'
    + '<div class="gu-t">'+st.t+'</div>'
    + '<div class="gu-f"><span class="gu-s">'+(G.i+1)+' de '+GUIA.length+'</span><span style="display:flex;gap:8px;">'
    + (G.i > 0 && !st.fin ? '<button class="btn btn-s" onclick="guiaMover(-1)">Atrás</button>' : '')
    + '<button class="btn btn-p" id="gu-next" onclick="guiaMover(1)">'+(st.fin ? 'Ver ofertas' : (G.i === 0 ? 'Empezar' : 'Siguiente'))+'</button></span></div>';
  document.body.appendChild(c);
  var el = guiaObjetivo();
  // lo de dentro de la página se trae a la vista; los menús ya están fijos
  if(el && getComputedStyle(el).position !== 'fixed' && !el.closest('.nav, .tabbar')){
    var r = el.getBoundingClientRect();
    if(r.top < 70 || r.top > innerHeight * 0.45) window.scrollTo(0, Math.max(0, scrollY + r.top - 90));
  }
  guiaColocar();
  window.addEventListener('resize', guiaColocar); window.addEventListener('scroll', guiaColocar, true);
  try{ $('gu-next').focus({preventScroll:true}); }catch(e){}
}
function guiaColocar(){
  if(!G.on) return;
  var hl = $('gu-hl'), c = $('gu-card'); if(!hl || !c) return;
  var el = guiaObjetivo(), vw = innerWidth, vh = innerHeight, cw = c.offsetWidth, ch = c.offsetHeight, m = 16;
  if(!el){
    hl.classList.add('centro');
    c.style.left = Math.round((vw - cw)/2) + 'px'; c.style.top = Math.round((vh - ch)/2) + 'px';
    return;
  }
  hl.classList.remove('centro');
  var r = el.getBoundingClientRect(), pad = 6;
  // si es muy alto (la lista de ofertas), marcamos solo lo que se ve
  var top = Math.max(r.top, 8), bot = Math.min(r.bottom, vh - 8);
  hl.style.left = (r.left - pad) + 'px'; hl.style.top = (top - pad) + 'px';
  hl.style.width = (r.width + pad*2) + 'px'; hl.style.height = Math.max(0, bot - top + pad*2) + 'px';
  var x, y;
  if(vw > 860 && r.right < 260){                // menú lateral: la tarjeta a la derecha
    x = r.right + 18; y = r.top + r.height/2 - ch/2;
  } else if(top > vh - bot){                     // más sitio arriba
    x = r.left + r.width/2 - cw/2; y = top - pad - ch - 12;
  } else {
    x = r.left + r.width/2 - cw/2; y = bot + pad + 12;
  }
  x = Math.min(Math.max(m, x), vw - cw - m);
  y = Math.min(Math.max(m, y), vh - ch - m);
  c.style.left = Math.round(x) + 'px'; c.style.top = Math.round(y) + 'px';
}
function guiaMover(d){
  if(GUIA[G.i].fin && d > 0){ guiaCerrar(); ir('ofertas'); return; }
  if(d < 0 && G.i === 0) return;
  G.i = Math.max(0, Math.min(GUIA.length - 1, G.i + d));
  guiaPaso();
}
document.addEventListener('keydown', function(e){
  if(!G.on) return;
  if(e.key === 'Escape') guiaCerrar();
  else if(e.key === 'ArrowRight') guiaMover(1);
  else if(e.key === 'ArrowLeft' && G.i > 0) guiaMover(-1);
});

/* ---------- Enter envía ---------- */
[['li-email','li-pwd'], ['re-nom','re-email','re-pwd']].forEach(function(g, i){
  g.forEach(function(id){ var el = $(id); if(el) el.addEventListener('keydown', function(e){ if(e.key === 'Enter'){ e.preventDefault(); i === 0 ? entrar() : registrar(); } }); });
});
document.addEventListener('keydown', function(e){ if(e.key === 'Escape') cerrarModal(); });
