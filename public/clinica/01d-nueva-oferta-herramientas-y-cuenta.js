/* «Nueva oferta», Herramientas, perfil de la empresa guardado en el navegador y «Mi cuenta».
   Parte del antiguo clinica/01-panel.js (Fase 1, paso 1.6b). El orden de carga
   importa: los archivos 01a…01i se cargan uno detrás de otro, como antes. */
// ===== crear-oferta =====

const DISC_COLOR_MAP = {D:'#FF5A5F', I:'#F0A800', S:'#00B488', C:'#5B5FE0'};
const ROLE_DISC_MAP = [
  {match:['higienista'], profiles:['I','C'],
   why:'La higiene dental exige dos cosas a la vez que rara vez van juntas: saber calmar al paciente y no saltarse ni un paso del protocolo.',
   reasons:{I:'Tranquiliza al paciente nervioso, explica el tratamiento y hace que vuelva.', C:'Sigue el protocolo de higiene y esterilización sin atajos ni olvidos.'}},

  {match:['auxiliar','asistente'], profiles:['S','C'],
   why:'El auxiliar sostiene el ritmo de la consulta sin protagonismo: constancia y rigor material.',
   reasons:{S:'Aguanta jornadas largas, anticipa lo que necesita el dentista, no genera fricción.', C:'Controla instrumental, esterilización y stock sin que nadie tenga que revisarlo.'}},

  {match:['recepcion','recepción','administrativ'], profiles:['I','S'],
   why:'Recepción es la primera y la última impresión de tu clínica, y el filtro de toda la presión del día.',
   reasons:{I:'Da la bienvenida, resuelve dudas y desactiva quejas con buena mano.', C:'Cuadra agenda, cobros y seguimiento sin que se pierda nada.', S:'Mantiene la calma cuando suenan tres teléfonos y hay cola en el mostrador.'}},

  {match:['odontolog','dentista','endodon','periodon','ortodon','implantolog'], profiles:['D','C'],
   why:'La consulta clínica pide decidir con seguridad delante del paciente sin perder el rigor diagnóstico.',
   reasons:{D:'Toma decisiones clínicas con criterio y transmite seguridad al paciente.', C:'Diagnostica con rigor, documenta bien y no improvisa con el protocolo.'}},

  {match:['director','gerente','coordinador','responsable'], profiles:['D','I'],
   why:'Dirigir una clínica es decidir rápido y conseguir que el equipo te siga en esa decisión.',
   reasons:{D:'Decide, prioriza y asume la responsabilidad de los números.', I:'Motiva al equipo, negocia con proveedores y representa a la clínica fuera.'}},

  {match:['protesis','prótesis','laboratorio','técnico'], profiles:['C','S'],
   why:'El trabajo de laboratorio premia la exactitud y la constancia por encima del trato o la iniciativa.',
   reasons:{C:'Trabaja con precisión milimétrica y detecta el error antes de entregar.', S:'Cumple plazos de forma constante sin necesitar supervisión.'}},
];
const DISC_FULL = {D:'Dominante', I:'Influyente', S:'Estable', C:'Concienzudo'};
let offerDiscProfiles = ['I','C'];

function toggleOfferDisc(el){
  const d = el.dataset.disc;
  const i = offerDiscProfiles.indexOf(d);
  if(i > -1){
    if(offerDiscProfiles.length <= 2){
      showToast('Marca al menos 2 perfiles: buscamos personas que combinen rasgos, no uno suelto');
      return;
    }
    offerDiscProfiles.splice(i,1);
    el.classList.remove('selected');
  } else {
    offerDiscProfiles.push(d);
    el.classList.add('selected');
  }
  renderDiscResult();
}
function renderDiscResult(){
  const box = document.getElementById('co-disc-result');
  if(!box) return;
  const names = offerDiscProfiles.map(function(p){ return DISC_FULL[p]; });
  const letters = offerDiscProfiles.join(' + ');
  box.innerHTML = '<b>Perfiles recomendados: ' + letters + '</b> — ' + names.join(' y ') + '.<br>'
    + '<span style="color:#6B7280;font-size:12.5px;">Seimian mostrará como buen encaje a los candidatos que tengan cualquiera de estos perfiles entre sus dos rasgos principales.</span>';
}
function suggestDiscFromRole(){
  const t = (document.getElementById('co-titulo')?.value || '').toLowerCase();
  const box = document.getElementById('co-disc-suggestion');
  if(!box) return;
  if(!t){ box.style.display='none'; return; }
  const hit = ROLE_DISC_MAP.find(function(r){ return r.match.some(function(m){ return t.includes(m); }); });
  if(!hit){ box.style.display='none'; return; }
  box.style.display = 'block';
  const p = hit.profiles;
  let out = '<div style="font-size:12px;font-weight:800;color:#1A56DB;margin-bottom:6px;">SEIMIAN RECOMIENDA ' + p.join(' + ') + ' PARA ESTE PUESTO</div>'
    + '<div style="font-size:12.5px;color:#1E40AF;line-height:1.55;margin-bottom:10px;">' + hit.why + '</div>';
  p.forEach(function(letter){
    out += '<div style="display:flex;gap:9px;align-items:flex-start;margin-bottom:7px;">'
      + '<span style="min-width:24px;height:24px;border-radius:7px;background:' + DISC_COLOR_MAP[letter] + ';color:white;font-size:12px;font-weight:800;display:flex;align-items:center;justify-content:center;">' + letter + '</span>'
      + '<span style="font-size:12.5px;color:#1E40AF;line-height:1.5;"><b>' + DISC_FULL[letter] + '</b> — ' + hit.reasons[letter] + '</span></div>';
  });
  out += '<span onclick="applyDiscSuggestion([\'' + p.join("','") + '\'])" style="display:inline-block;margin-top:8px;color:#1A56DB;font-size:12.5px;font-weight:700;cursor:pointer;">Aplicar estos perfiles →</span>';
  box.innerHTML = out;
}
/* En obrir l oferta, marquem sols el perfil que li falta a l equip.
   No es una imposicio: es una proposta amb el motiu escrit i es pot canviar. */
function prepararOfertaSegunEquipo(){
  var box = document.getElementById('co-equipo-aviso');
  if(!box) return;
  try { if(document.getElementById('co-disc-result')) renderDiscResult(); } catch(e){}
  var d = null;
  try { d = CDB.perfilQueFalta(); } catch(e){ return; }
  if(!d) return;

  var col = {D:'#FF5A5F', I:'#F0A800', S:'#00B488', C:'#5B5FE0'};
  var nom = {D:'Dominante', I:'Influyente', S:'Estable', C:'Concienzudo'};

  // Si ell ja ha triat a ma, no li toquem la seleccio
  if(window.__ofertaTocadaAMa){
    box.style.cssText = 'display:block;background:#F4F6F9;border:1px solid #E5E7EB;border-radius:11px;padding:11px 14px;margin:10px 0 2px;font-size:12.5px;line-height:1.5;color:#4B5563;';
    box.innerHTML = 'Mantengo los perfiles que elegiste tú. '
      + '<span onclick="window.__ofertaTocadaAMa=false;prepararOfertaSegunEquipo();" style="color:#1A56DB;font-weight:700;cursor:pointer;">Vuelve a proponérmelo →</span>';
    return;
  }

  if(d.fiable){
    var a = d.falta, b = d.segona;
    applyDiscSuggestionSilenci([a, b]);
    box.style.cssText = 'display:block;background:#E8F8F1;border:1px solid #BFE9D7;border-radius:11px;padding:12px 14px;margin:10px 0 2px;font-size:12.5px;line-height:1.55;color:#0B6B4F;';
    box.innerHTML = '<b>Marcado por ti según tu equipo.</b> Ahora mismo tienes un '
      + d.comp[a] + '% de <b style="color:' + col[a] + '">' + nom[a] + ' (' + a + ')</b> y un '
      + d.comp[b] + '% de <b style="color:' + col[b] + '">' + nom[b] + ' (' + b + ')</b>: son los dos huecos más grandes. '
      + 'Si este puesto pide otra cosa, cámbialo tú.';
  } else {
    applyDiscSuggestionSilenci(['I','C']);
    box.style.cssText = 'display:block;background:#FFF7E6;border:1px solid #FDE7BB;border-radius:11px;padding:12px 14px;margin:10px 0 2px;font-size:12.5px;line-height:1.55;color:#8A5A00;';
    box.innerHTML = 'Con ' + d.tests + ' test' + (d.tests === 1 ? '' : 's') + ' hecho' + (d.tests === 1 ? '' : 's')
      + ' todavía no puedo decirte qué perfil te falta — necesito al menos 3. '
      + 'He dejado marcados <b>I + C</b>, que es lo habitual en atención al paciente. Cámbialo si quieres.';
  }
}
function applyDiscSuggestionSilenci(profiles){
  offerDiscProfiles = profiles.slice();
  document.querySelectorAll('#co-disc-picker .disc-option').forEach(function(o){
    o.classList.toggle('selected', profiles.indexOf(o.dataset.disc) > -1);
  });
  try { renderDiscResult(); } catch(e){}
}

function _marcarOfertaTocadaAMa(){ window.__ofertaTocadaAMa = true; }

function applyDiscSuggestion(profiles){
  window.__ofertaTocadaAMa = true;
  offerDiscProfiles = profiles.slice();
  document.querySelectorAll('#co-disc-picker .disc-option').forEach(function(o){
    o.classList.toggle('selected', profiles.indexOf(o.dataset.disc) > -1);
  });
  renderDiscResult();
  showToast('Perfiles ' + profiles.join(' + ') + ' aplicados');
}
function generateOfferDescAI(){
  const titulo = document.getElementById('co-titulo').value.trim() || 'este puesto';
  const field = document.getElementById('co-descripcion');
  field.value = `Buscamos a alguien para el puesto de ${titulo}, con ganas de aprender y crecer dentro de un equipo cercano y dinámico. Valoramos sobre todo la actitud, el trato con el paciente y las ganas de formar parte de un proyecto serio a largo plazo.`;
  showToast('Descripción preparada por Seimian');
}
/* Afegir una habilitat a la sol·licitud: abans el boto no feia res
   i el que escrivies no s afegia mai. */
function anadirSkill(){
  var inp = document.getElementById('skill-nueva-aplicar');
  if(!inp) return;
  var txt = (inp.value || '').trim();
  if(!txt){ if(typeof showToast==='function') showToast('Escribe una habilidad primero'); return; }
  if(txt.length > 40) txt = txt.slice(0,40);
  var cont = inp.closest('.skill-add') ? inp.closest('.skill-add').parentElement : null;
  if(!cont) return;
  var tag = document.createElement('span');
  tag.className = 'skill-tag';
  tag.style.cssText = 'display:inline-flex;align-items:center;gap:6px;background:#EEF2FF;color:#1A56DB;border-radius:999px;padding:6px 12px;font-size:12px;font-weight:700;margin:0 6px 6px 0;';
  tag.innerHTML = _esc(txt) + '<span onclick="this.parentElement.remove()" style="cursor:pointer;opacity:.6;font-weight:800;">×</span>';
  cont.insertBefore(tag, inp.closest('.skill-add'));
  inp.value = '';
  inp.focus();
}

function _discColor(l){ return ({D:'#FF5A5F', I:'#F0A800', S:'#00B488', C:'#5B5FE0'})[l] || '#9CA3AF'; }

function getSavedOffers(){
  try { var l = JSON.parse(localStorage.getItem('cerco_ofertas') || '[]'); return Array.isArray(l)? l : []; }
  catch(e){ return []; }
}
function setSavedOffers(list){
  try { localStorage.setItem('cerco_ofertas', JSON.stringify(list)); } catch(e){}
}
function saveOfferToStorage(offer){
  var list = getSavedOffers();
  offer.id = offer.id || ('of' + Date.now() + Math.floor(Math.random()*999));
  list.push(offer);
  setSavedOffers(list);
  try{ if(window._subirOferta) _subirOferta(offer); }catch(e){}
  return offer;
}

/* Pinta les ofertes reals a la columna que els toca segons el seu estat.
   Es torna a executar sencer cada vegada, aixi mai queden restes. */
/* «Mis ofertas»: pinta las ofertas y las agrupa por profesión (Fase 1: una sola versión). */
function pintarOfertasReales(){
  var r = _pintarListaOfertas();
  try{ CERCO_agruparOfertas(); }catch(x){}
  return r;
}
function _pintarListaOfertas(){
  var board = document.querySelector('#screen-ofertes .board');
  if(!board) return;
  var esc = (typeof _esc === 'function') ? _esc : function(t){
    return String(t==null?'':t).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
  };
  var enDemo = true;
  try { enDemo = window.CDB ? CDB.demo() : true; } catch(e){ enDemo = true; }
  board.querySelectorAll('.offer-card:not(.ejemplo)').forEach(function(c){ c.remove(); });
  board.querySelectorAll('.oferta-vacia').forEach(function(c){ c.remove(); });

  var cols = board.querySelectorAll('.board-col');
  var orden = {activa:0, pausada:1, cerrada:2};
  var lista = getSavedOffers();

  lista.forEach(function(o){
    var est = o.estado || 'activa';
    var col = cols[orden[est] !== undefined ? orden[est] : 0];
    if(!col) return;
    var card = document.createElement('div');
    card.className = 'offer-card';
    card.dataset.oid = o.id || '';
    if(est === 'cerrada') card.style.opacity = '.7';
    card.onclick = function(){ showScreen('portal'); };
    // candidatos de esta oferta: contados con las solicitudes reales (clinica/02-solicitudes-reales.js)
    var nCand = window.CERCO_candidatosDeOferta ? CERCO_candidatosDeOferta(o.id) : (parseInt(o.candidatos,10)||0);

    var fecha = '';
    try {
      var d = o.fecha ? new Date(o.fecha) : null;
      if(d && !isNaN(d)){
        var dias = Math.floor((Date.now() - d.getTime())/86400000);
        fecha = dias <= 0 ? 'hoy' : (dias === 1 ? 'ayer' : 'hace ' + dias + ' días');
      }
    } catch(e){}

    var acciones = '';
    if(est === 'activa'){
      acciones = '<button class="oa-btn primary" onclick="event.stopPropagation(); verCandidatosDeOferta(\''+o.id+'\')">Ver candidatos</button>'
               + '<button class="oa-btn" onclick="event.stopPropagation(); cambiarEstadoOferta(\''+o.id+'\',\'pausada\')">Pausar</button>';
    } else if(est === 'pausada'){
      acciones = '<button class="oa-btn primary" onclick="event.stopPropagation(); cambiarEstadoOferta(\''+o.id+'\',\'activa\')">Reactivar</button>'
               + '<button class="oa-btn" onclick="event.stopPropagation(); cambiarEstadoOferta(\''+o.id+'\',\'cerrada\')">Cerrar</button>';
    } else {
      acciones = '<button class="oa-btn primary" onclick="event.stopPropagation(); cambiarEstadoOferta(\''+o.id+'\',\'activa\')">Volver a publicar</button>';
    }
    acciones += '<button class="oa-btn" onclick="event.stopPropagation(); editarOferta(\''+o.id+'\')">Editar</button>';
    acciones += '<button class="oa-btn" title="Eliminar" onclick="event.stopPropagation(); eliminarOferta(\''+o.id+'\')" style="color:#DC2626;">Eliminar</button>';

    var disc = (o.disc || '').trim();
    var letra = disc ? disc.charAt(0) : '';

    card.innerHTML =
      '<div class="offer-title-row">'
      + '<div class="offer-title">' + esc(o.titulo || 'Sin título') + '</div>'
      + (letra ? '<span class="offer-disc" style="background:'+_discColor(letra)+';">'+esc(disc)+'</span>' : '')
      + '</div>'
      + '<div class="offer-meta-row">' + esc(o.ubicacion||'') + (o.jornada? ' · '+esc(o.jornada):'') + (fecha? ' · publicada '+fecha : '') + '</div>'
      + '<div class="offer-cand-count">' + nCand + (nCand === 1 ? ' candidato' : ' candidatos') + '</div>'
      + '<div class="offer-actions">' + acciones + '</div>';

    var header = col.querySelector('.board-col-header');
    if(header) header.insertAdjacentElement('afterend', card);
    else col.appendChild(card);
  });

  // missatge quan una columna queda buida en mode real
  if(!enDemo){
    var textos = ['Aún no tienes ofertas activas.','Ninguna oferta pausada.','Ninguna oferta cerrada.'];
    cols.forEach(function(col, i){
      if(col.querySelectorAll('.offer-card:not(.ejemplo)').length) return;
      var v = document.createElement('div');
      v.className = 'oferta-vacia';
      v.style.cssText = 'font-size:13px;color:#6B7280;padding:18px 14px;text-align:center;border:1px dashed #E5E7EB;border-radius:12px;margin-top:10px;line-height:1.5;';
      v.textContent = textos[i] || '';
      col.appendChild(v);
    });
  }

  if(window.CDB && typeof renderOfertasReal === 'function') renderOfertasReal();
}

/* Pausar, reactivar o cerrar una oferta. Si se cierra con gente esperando
   respuesta, antes sale la ventana de cierre (Fase 1: una sola versión). */
function cambiarEstadoOferta(id, estado){
  if(estado === 'cerrada' && !window.__noAvisarCierre && window.CERCO_avisarCierreOferta && CERCO_avisarCierreOferta(id, function(){ _aplicarEstadoOferta(id, estado); }, false)) return;
  return _aplicarEstadoOferta(id, estado);
}
function _aplicarEstadoOferta(id, estado){
  var list = getSavedOffers();
  var n = 0;
  list.forEach(function(o){ if(o.id === id){ o.estado = estado; n++; } });
  if(!n) return;
  setSavedOffers(list);
  try{ if(window._subirOferta) list.forEach(function(o){ if(o.id===id) _subirOferta(o); }); }catch(e){}
  pintarOfertasReales();
  try{ if(window.CDB) CDB.renderTodo(); }catch(e){}
  var msg = estado === 'pausada' ? 'Oferta pausada — ya no recibirá candidatos nuevos'
          : estado === 'activa'  ? 'Oferta activa de nuevo'
          : 'Oferta cerrada';
  if(typeof showToast === 'function') showToast(msg);
}

/* Eliminar una oferta. Si hay gente esperando respuesta, antes sale la
   ventana de cierre (Fase 1: una sola versión). */
function eliminarOferta(id){
  if(window.CERCO_avisarCierreOferta && CERCO_avisarCierreOferta(id, function(){ _eliminarOfertaYa(id); }, true)) return;
  return _eliminarOfertaYa(id);
}
function _eliminarOfertaYa(id){
  var list = getSavedOffers();
  var o = list.filter(function(x){ return x.id === id; })[0];
  if(!o) return;
  if(!confirm('¿Eliminar la oferta "' + (o.titulo||'') + '"?\n\nEsta acción no se puede deshacer.')) return;
  setSavedOffers(list.filter(function(x){ return x.id !== id; }));
  try{ if(window.Nube && Nube.activa) Nube.borrarOferta(id); }catch(e){}
  pintarOfertasReales();
  try{ if(window.CDB) CDB.renderTodo(); }catch(e){}
  if(typeof showToast === 'function') showToast('Oferta eliminada');
}

/* es manté el nom antic perquè hi ha crides que hi apunten */
function renderOfferCard(){ pintarOfertasReales(); }
function loadSavedOffersOnInit(){ pintarOfertasReales(); }
function toggleOfferStatus(btn, nuevo){
  var card = btn && btn.closest ? btn.closest('.offer-card') : null;
  if(card && card.dataset.oid) return cambiarEstadoOferta(card.dataset.oid, nuevo);
  if(typeof showToast === 'function')
    showToast(nuevo === 'pausada' ? 'Esta oferta es de ejemplo' : 'Esta oferta es de ejemplo');
}

/* Editar una oferta ja publicada: carrega les seves dades al formulari
   i en desar substitueix l original en lloc de crear-ne una de nova. */
/* Editar una oferta: carga sus datos en el formulario y, un momento después,
   rellena los campos de salario (Fase 1: una sola versión). */
function editarOferta(id){
  var r = _cargarOfertaEnFormulario(id);
  setTimeout(function(){ if(window.CERCO_llenarSalarioDesdeTexto) CERCO_llenarSalarioDesdeTexto((document.getElementById('co-salario')||{}).value); }, 120);
  return r;
}
function _cargarOfertaEnFormulario(id){
  var l = getSavedOffers();
  var o = null;
  for(var i=0;i<l.length;i++){ if(String(l[i].id) === String(id)) o = l[i]; }
  if(!o){ if(typeof showToast==='function') showToast('No encuentro esa oferta'); return; }

  window.__editandoOferta = o.id;
  showScreen('crear-oferta');

  setTimeout(function(){
    var v = function(id2, val){ var e = document.getElementById(id2); if(e && val !== undefined && val !== null) e.value = val; };
    v('co-titulo', o.titulo || '');
    v('co-ubicacion', o.ubicacion || '');
    v('co-salario', o.salario || '');
    v('co-descripcion', o.descripcion || '');
    v('co-requisitos', o.requisitos || '');
    v('co-contrato', o.contrato || ''); v('co-convenio', o.convenio || ''); v('co-prueba', o.prueba || '');
    try{ if(window.CERCO_ofCargar) CERCO_ofCargar(o); }catch(x){}
    var j = document.getElementById('co-jornada');
    if(j && o.jornada){
      for(var k=0;k<j.options.length;k++){ if(j.options[k].value === o.jornada) j.selectedIndex = k; }
    }
    var dp = document.getElementById('co-disponibilidad');
    if(dp && o.disponibilidad){
      for(var k2=0;k2<dp.options.length;k2++){ if(dp.options[k2].value === o.disponibilidad) dp.selectedIndex = k2; }
    }
    if(o.perfiles && o.perfiles.length){
      window.__ofertaTocadaAMa = true;
      applyDiscSuggestionSilenci(o.perfiles);
    }
    var av = document.getElementById('co-equipo-aviso');
    if(av){
      av.style.cssText = 'display:block;background:#EEF2FF;border:1px solid #DBEAFE;border-radius:11px;padding:12px 14px;margin:10px 0 2px;font-size:12.5px;line-height:1.55;color:#1E40AF;';
      av.innerHTML = 'Estás <b>editando</b> una oferta que ya está publicada. Al guardar se actualizará, no se creará otra.';
    }
    var h1 = document.querySelector('#screen-crear-oferta h1');
    if(h1) h1.textContent = 'Editar oferta';
    var bs = document.querySelector('#screen-crear-oferta .btn-submit');
    if(bs) bs.textContent = 'Guardar cambios';
  }, 80);
}

function _salirDeEdicion(){
  window.__editandoOferta = null;
  var h1 = document.querySelector('#screen-crear-oferta h1');
  if(h1) h1.textContent = '+ Crear nueva oferta';
  var bs = document.querySelector('#screen-crear-oferta .btn-submit');
  if(bs) bs.textContent = 'Publicar oferta';
}

/* PUBLICAR UNA OFERTA («Publicar oferta»). Una sola versión con todos los pasos,
   en el mismo orden en que se hacían antes, cuando había cinco versiones
   envueltas unas en otras (Fase 1, paso 1.7). */
function submitNewOffer(){
  var $v = function(id){ return ((document.getElementById(id)||{}).value || ''); };
  var err = document.getElementById('co-err');
  var aviso = function(texto, idFoco){
    if(err){ err.textContent = texto; if(window.verAviso) verAviso(err); }
    if(idFoco){ var f = document.getElementById(idFoco); if(f){ try{ f.focus({preventScroll:true}); }catch(x){} } }
  };
  var titulo = $v('co-titulo').trim(), ubic = $v('co-ubicacion').trim();

  // 1. Palabras que un anuncio de empleo no puede usar (Ley 15/2022)
  var v = window.CERCO_ofertaVetada ? CERCO_ofertaVetada([$v('co-titulo'), $v('co-descripcion'), $v('co-requisitos')].join(' \n ')) : null;
  if(v){
    if(err){ err.textContent = 'La oferta menciona «' + v.palabra + '». Un anuncio de empleo no puede pedir ni excluir por ' + v.motivo + ' (Ley 15/2022 y Estatuto de los Trabajadores). Describe las tareas y la titulación, y vuelve a publicar.'; if(window.verAviso) verAviso(err); }
    return;
  }

  // 2. Tipo de contrato y convenio colectivo, obligatorios
  if(titulo && ubic){
    var falta = !$v('co-contrato') ? ['co-contrato', 'Elige el tipo de contrato.']
              : !$v('co-convenio').trim() ? ['co-convenio', 'Indica el convenio colectivo (o «Sin convenio aplicable» si es una colaboración como autónomo).'] : null;
    if(falta){ aviso(falta[1], falta[0]); return; }
  }

  // 3. La ubicación tiene que ser un municipio (de ahí salen los km)
  if(titulo && ubic && !CGeo.lugar(ubic)){
    aviso('No encontramos «' + ubic + '». Escribe el municipio donde está la clínica (por ejemplo: Salt o Girona): así el candidato sabe a cuántos km le queda.', 'co-ubicacion');
  }
  else {
    // 4. Salario obligatorio y bien escrito
    var salarioOk = true;
    if(titulo && ubic){
      var sal = _componerSalario();
      if(sal.error){ aviso(sal.error, sal.foco); salarioOk = false; }
      else { var hid = document.getElementById('co-salario'); if(hid) hid.value = sal.texto; }
    }
    if(salarioOk){
      // 5. Publicar (o guardar los cambios, si se está editando)
      _publicarOfertaBase();
      // Después de publicar, los campos de salario quedan limpios
      if(!window.__editandoOferta){ ['co-sal-min','co-sal-max'].forEach(function(id){ var e = document.getElementById(id); if(e && !$v('co-titulo')) e.value = ''; }); }
    }
  }
  // Y también contrato, convenio y periodo de prueba (como antes, aunque no se haya publicado)
  if(!window.__editandoOferta) ['co-contrato','co-convenio','co-prueba'].forEach(function(id){ var x = document.getElementById(id); if(x && !$v('co-titulo')) x.value = ''; });
}
function _publicarOfertaBase(){
  window.__ofertaTocadaAMa = false;
  const titulo = document.getElementById('co-titulo').value.trim();
  const ubicacion = document.getElementById('co-ubicacion').value.trim();
  const err = document.getElementById('co-err');
  if(!titulo || !ubicacion){
    err.textContent = 'Completa al menos el título y la ubicación.';
    if(window.verAviso) verAviso(err);
    return;
  }
  err.textContent = '';
  if(!window._unaSolaVez('oferta', 900)) return;
  const jornada = document.getElementById('co-jornada').value;
  const val = function(id){ var e = document.getElementById(id); return e ? (e.value||'').trim() : ''; };

  var datos = {
    titulo: titulo, ubicacion: ubicacion, jornada: jornada,
    salario: val('co-salario'),
    disponibilidad: val('co-disponibilidad'),
    descripcion: val('co-descripcion'),
    requisitos: val('co-requisitos'),
    perfiles: offerDiscProfiles.slice(),
    disc: offerDiscProfiles.join(' + '),
    contrato: val('co-contrato'), convenio: val('co-convenio'), prueba: val('co-prueba')
  };
  try{ if(window.CERCO_ofExtra) Object.assign(datos, CERCO_ofExtra()); }catch(x){}

  if(window.__editandoOferta){
    // Editant: substituim la que ja existia, conservant estat i candidats
    var l = getSavedOffers();
    for(var i=0;i<l.length;i++){
      if(String(l[i].id) === String(window.__editandoOferta)){
        for(var k in datos) l[i][k] = datos[k];
        l[i].editada = new Date().toISOString();
      }
    }
    setSavedOffers(l);
    try{ if(window._subirOferta) _subirOferta(); }catch(e){}
    _salirDeEdicion();
    pintarOfertasReales();
    try{ if(window.CDB) CDB.renderTodo(); }catch(e){}
    showToast('Cambios guardados');
    showScreen('ofertes');
    return;
  }

  datos.estado = 'activa'; datos.candidatos = 0; datos.fecha = new Date().toISOString();
  saveOfferToStorage(datos);
  pintarOfertasReales();
  try{ if(window.CDB) CDB.renderTodo(); }catch(e){}

  showToast('¡Oferta publicada correctamente!');
  try{ if(window.CERCO_ofCargar) CERCO_ofCargar({}); }catch(x){}
  ['co-titulo','co-descripcion','co-requisitos','co-salario'].forEach(function(id){
    var e = document.getElementById(id); if(e) e.value = '';
  });
  showScreen('ofertes');
}



// ===== herramientas =====
function hubSearchGo(){
  const q = document.getElementById('hub-search').value.trim();
  showScreen('portal');
  setTimeout(()=>{
    const searchInput = document.getElementById('search-portal');
    if(searchInput){
      searchInput.value = q;
      searchInput.dispatchEvent(new Event('input'));
    }
  }, 150);
}
document.getElementById('hub-search')?.addEventListener('keydown', (e)=>{
  if(e.key === 'Enter') hubSearchGo();
});


// ---- Persistencia local del perfil de empresa ----
function saveCompanyToStorage(){
  const nom = document.getElementById('f-nom-onboarding')?.value.trim();
  let nomResp = document.getElementById('f-nombre-responsable')?.value.trim();
  const ciutat = document.getElementById('f-ciutat-onboarding')?.value.trim();
  const llegir = function(id){ var e = document.getElementById(id); return e ? (e.value||'').trim() : ''; };
  const adreca = llegir('f-adreca-onboarding');
  const tel    = llegir('f-tel-onboarding');
  const correu = llegir('f-email-onboarding');
  const web    = llegir('f-web-onboarding');
  const desc   = llegir('f-desc-onboarding');
  const treb   = llegir('f-treb-onboarding');
  let prev = {};
  try { prev = JSON.parse(localStorage.getItem('cerco_empresa') || '{}') || {}; } catch(e){}
  if(!nomResp){
    try { nomResp = (CAuth.cuenta()||{}).nombre || prev.nomResp || ''; } catch(e){ nomResp = prev.nomResp || ''; }
  }
  if(nomResp) applyUserName(nomResp);
  if(!nom) return;
  try {
    const dades = Object.assign({}, prev, {
      nom: nom,
      nomResp: nomResp,
      ciutat: ciutat || prev.ciutat || '',
      direccion: adreca || prev.direccion || '',
      telefono: tel || prev.telefono || '',
      email: correu || prev.email || '',
      web: web || prev.web || '',
      descripcion: desc || prev.descripcion || '',
      trabajadores: treb || prev.trabajadores || ''
    });
    localStorage.setItem('cerco_empresa', JSON.stringify(dades));
    try{ if(window.CDB){ CDB.fechaAlta(); CDB.setDemo(false); CDB.renderTodo(); } }catch(e){}
    try{ if(window._subirClinica) _subirClinica(); }catch(e){}
  } catch(e){}
}
function loadCompanyFromStorage(){
  let data;
  try { data = JSON.parse(localStorage.getItem('cerco_empresa')); } catch(e){ return; }
  if(!data || !data.nom) return;

  var put = function(id, val){
    var e = document.getElementById(id);
    if(e && val) e.value = val;
  };

  // Mi clínica: el formulario debe salir con lo que ya guardaste
  put('f-nom-onboarding', data.nom);
  put('f-nombre-responsable', data.nomResp);
  put('f-ciutat-onboarding', data.ciutat);
  put('f-adreca-onboarding', data.direccion);
  put('f-tel-onboarding', data.telefono);
  put('f-email-onboarding', data.email);
  put('f-treb-onboarding', data.trabajadores);
  put('f-desc-onboarding', data.descripcion);
  put('f-descripcio-onboarding', data.descripcion);
  put('f-web-onboarding', data.web);

  // Mi cuenta: datos personales
  put('mc-nombre', data.nomResp || '');
  put('mc-email', data.email);
  put('mc-telefono', data.telefono);

  const sub = document.querySelector('#screen-ofertes .ofertes-sub');
  if(sub) sub.textContent = `${data.nom}${data.ciutat ? ' — ' + data.ciutat : ''} — control total, de un solo vistazo`;

  const letter = document.getElementById('mc-avatar-letter');
  if(letter && data.nomResp) letter.textContent = data.nomResp.charAt(0).toUpperCase();

  // Foto de perfil y logo guardados
  try {
    if(data.foto) _pintarAvatar(data.foto);
    if(data.logo){
      var lb = document.getElementById('logo-upload-box');
      if(lb){
        lb.style.backgroundImage = "url('" + data.logo + "')";
        lb.style.backgroundSize = 'cover';
        lb.style.backgroundPosition = 'center';
        lb.style.color = 'transparent';
      }
    }
  } catch(e){}

  // Interruptores de notificaciones
  try {
    if(Array.isArray(data.avisos)){
      document.querySelectorAll('#screen-mi-cuenta .mc-toggle').forEach(function(t, i){
        // Nomes la classe: com es veu ho decideix el full d estils
        t.classList.toggle('on', data.avisos[i] !== false);
        t.style.background = '';
        var k = t.querySelector('div');
        if(k){ k.style.left = ''; k.style.transform = ''; }
      });
    }
  } catch(e){}
}

/* Guarda en el perfil de la clínica cualquier campo que el usuario toque */
function guardarCampoPerfil(clave, valor){
  try {
    if(!window.CDB || CDB.demo()) return;
    var d = CDB.clinica();
    d[clave] = valor;
    localStorage.setItem(CDB.K.emp, JSON.stringify(d));
    if(clave !== 'foto' && clave !== 'logo' && window._subirClinica) _subirClinica();
  } catch(e){}
}

/* Los interruptores de avisos se recuerdan */
function guardarAvisos(){
  try {
    if(!window.CDB || CDB.demo()) return;
    var estados = [];
    document.querySelectorAll('#screen-mi-cuenta .mc-toggle').forEach(function(t){ estados.push(t.classList.contains('on')); });
    guardarCampoPerfil('avisos', estados);
  } catch(e){}
}

/* El perfil público es el de tu clínica, no el del ejemplo */
/* El perfil public: o es el seu de veritat, o es un exemple ben etiquetat.
   Mai una barreja del seu nom amb les dades d una clinica inventada. */
function renderPerfilPublico(){
  try { _pintarPerfilPublico(); } catch(e){}
  return _perfilPublicoDemo();
}

/* Perfil público: guarda lo que se estaba escribiendo, lo repinta y pinta el editor (Fase 1: una sola versión) */
function _pintarPerfilPublico(){
  // lo que estabas escribiendo no se pierde si la pantalla se repinta
  try{ CERCO_perfilPublico.guardarBorrador(); }catch(x){}
  var r = _pintarPerfilPublicoBase.apply(this, arguments);
  try{ CERCO_perfilPublico.pintarEditor(); }catch(x){}
  return r;
}
function _pintarPerfilPublicoBase(){
  var pant = document.getElementById('screen-publicat');
  if(!pant) return;
  var demo = true; try { demo = CDB.demo(); } catch(e){}
  var maqueta = pant.querySelector('.wrap');
  var real = document.getElementById('publicat-real');

  if(demo){
    if(maqueta) maqueta.style.display = '';
    if(real) real.style.display = 'none';
    return;
  }

  if(maqueta) maqueta.style.display = 'none';
  if(!real){
    real = document.createElement('div');
    real.id = 'publicat-real';
    real.className = 'wrap';
    pant.appendChild(real);
  }
  real.style.display = '';

  var c = {}; try { c = CDB.clinica() || {}; } catch(e){}
  var ofs = []; try { ofs = CDB.ofertas() || []; } catch(e){}
  var d = null; try { d = CDB.perfilQueFalta(); } catch(e){}

  var falta = function(t){
    return '<span style="color:#6B7280;font-weight:500;">' + t + '</span>';
  };
  var inicial = (c.nomResp || c.nom || '?').charAt(0).toUpperCase();

  var h = '';
  h += '<div style="background:linear-gradient(135deg,#0F1C3F,#1A56DB);border-radius:18px;padding:26px 22px;color:white;margin-bottom:16px;">'
     + '<div style="font-size:22px;font-weight:800;line-height:1.2;">' + (c.nom ? _esc(c.nom) : 'Tu clínica') + '</div>'
     + '<div style="font-size:13px;color:rgba(255,255,255,.72);margin-top:6px;">'
     + (c.ciutat ? _esc(c.ciutat) : '<span style="color:rgba(255,255,255,.45);">Añade tu ciudad en Mi clínica</span>')
     + (c.direccion ? ' · ' + _esc(c.direccion) : '') + '</div></div>';

  h += '<div style="background:white;border:1px solid #EAECF0;border-radius:16px;padding:18px;margin-bottom:14px;">'
     + '<div style="display:flex;align-items:center;gap:12px;">'
     + '<div style="width:42px;height:42px;border-radius:50%;background:#EEF2FF;color:#1A56DB;display:flex;align-items:center;justify-content:center;font-weight:800;font-size:16px;">' + _esc(inicial) + '</div>'
     + '<div><div style="font-size:11px;letter-spacing:.5px;color:#6B7280;">QUIÉN RESPONDE A LOS CANDIDATOS</div>'
     + '<div style="font-size:14.5px;font-weight:700;color:#111827;">' + (c.nomResp ? _esc(c.nomResp) : falta('Sin completar')) + '</div></div></div></div>';

  h += '<div style="background:white;border:1px solid #EAECF0;border-radius:16px;padding:18px;margin-bottom:14px;">'
     + '<div style="font-size:11px;letter-spacing:.5px;color:#6B7280;margin-bottom:7px;">SOBRE LA CLÍNICA</div>'
     + '<div style="font-size:13.5px;color:#374151;line-height:1.6;">'
     + (c.descripcion ? _esc(c.descripcion)
        : falta('Todavía no has escrito la descripción. Es lo primero que leerán los candidatos.')) + '</div></div>';

  h += '<div style="background:white;border:1px solid #EAECF0;border-radius:16px;padding:18px;margin-bottom:14px;">'
     + '<div style="font-size:11px;letter-spacing:.5px;color:#6B7280;margin-bottom:9px;">OFERTAS PUBLICADAS</div>';
  if(!ofs.length){
    h += '<div style="font-size:13.5px;color:#6B7280;line-height:1.6;">Aún no has publicado ninguna oferta. Cuando lo hagas, aparecerá aquí.</div>';
  } else {
    ofs.slice(0,6).forEach(function(o){
      h += '<div style="border-top:1px solid #F3F4F6;padding:11px 0;">'
         + '<div style="font-size:13.5px;font-weight:700;color:#111827;">' + _esc(o.titulo || 'Oferta') + '</div>'
         + '<div style="font-size:12px;color:#6B7280;margin-top:2px;">' + _esc(o.ubicacion || '') + '</div></div>';
    });
  }
  h += '</div>';

  h += '<div style="background:white;border:1px solid #EAECF0;border-radius:16px;padding:18px;margin-bottom:14px;">'
     + '<div style="font-size:11px;letter-spacing:.5px;color:#6B7280;margin-bottom:9px;">PERFIL DEL EQUIPO</div>';
  if(d && d.fiable){
    var cp = d.comp;
    h += '<div style="font-size:13.5px;color:#374151;line-height:1.7;">'
       + '<b>D</b> ' + cp.D + '% · <b>I</b> ' + cp.I + '% · <b>S</b> ' + cp.S + '% · <b>C</b> ' + cp.C + '%</div>';
  } else {
    h += '<div style="font-size:13.5px;color:#6B7280;line-height:1.6;">Aparecerá cuando al menos 3 personas de tu equipo hayan hecho el test.</div>';
  }
  h += '</div>';

  var contacte = [];
  if(c.email)    contacte.push(_esc(c.email));
  if(c.telefono) contacte.push(_esc(c.telefono));
  if(c.web)      contacte.push(_esc(c.web));
  h += '<div style="background:white;border:1px solid #EAECF0;border-radius:16px;padding:18px;">'
     + '<div style="font-size:11px;letter-spacing:.5px;color:#6B7280;margin-bottom:7px;">CONTACTO</div>'
     + '<div style="font-size:13.5px;color:#374151;line-height:1.6;">'
     + (contacte.length ? contacte.join(' · ')
        : falta('Añade un correo y un teléfono en Mi clínica para que puedan contactarte.')) + '</div></div>';

  h += '<div style="margin-top:18px;text-align:center;"><button class="btn btn-outline" onclick="showScreen(\'onboarding\')" style="font-size:13px;">Editar mi perfil</button></div>';

  real.innerHTML = h;
}

function _perfilPublicoDemo(){
  if(!window.CDB) return;
  var demo = CDB.demo();
  var c = CDB.clinica();
  var set = function(id, val){ var e = document.getElementById(id); if(e && val) e.textContent = val; };
  if(demo){
    set('pub-clinic-name', 'Clínica Dental Madrid Centro');
    set('pub-owner-name', 'Tu nombre');
    return;
  }
  set('pub-clinic-name', c.nom || 'Tu clínica');
  set('pub-owner-name', c.nomResp || 'Tu nombre');
  var av = document.getElementById('pub-owner-avatar');
  if(av && c.nomResp) av.textContent = c.nomResp.charAt(0).toUpperCase();
}

// ---- Inicializacion: cargar datos guardados en este navegador ----
loadCompanyFromStorage();
loadSavedOffersOnInit();
try {
  if(localStorage.getItem('cerco_disc_empresa')){
    if(!new URLSearchParams(location.search).get('equipo')){
      setTimeout(function(){ var l = document.getElementById('screen-login'), r = document.getElementById('screen-registro'); if((l && l.offsetParent) || (r && r.offsetParent)) return; showToast('Ya tienes un test DISC guardado en este dispositivo'); }, 1800);
    }
  }
} catch(e){}


// ===== mi-cuenta =====
const DISC_COLORS_cuenta = {D:'#FF5A5F', I:'#F0A800', S:'#00B488', C:'#5B5FE0'};
const DISC_NAMES_cuenta = {D:'Dominante', I:'Influyente', S:'Estable', C:'Concienzudo'};

function applyUserName(nom){
  if(!nom) return;
  // Mi cuenta hero
  const heroName = document.getElementById('mc-hero-name');
  if(heroName) heroName.textContent = nom;
  // Mi cuenta input
  const inp = document.getElementById('mc-nombre');
  if(inp) inp.value = nom;
  // Mi cuenta avatar letter
  const letter = document.getElementById('mc-avatar-letter');
  if(letter) letter.textContent = nom.charAt(0).toUpperCase();
  // Tour greeting
  const tourText = document.querySelector('.tour-text');
  if(tourText && tourText.textContent.includes('¡Hola!'))
    tourText.textContent = tourText.textContent.replace('¡Hola!', `¡Hola, ${nom.split(' ')[0]}!`);
  // Guardar: aquest és el nom de la PERSONA, no el de la clínica
  try {
    let data = JSON.parse(localStorage.getItem('cerco_empresa') || '{}');
    data.nomResp = nom;
    localStorage.setItem('cerco_empresa', JSON.stringify(data));
    if(window._subirClinica) _subirClinica();
  } catch(e){}
}
