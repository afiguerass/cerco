/* Formulario de solicitud de ejemplo, «Candidatos» (filtros, búsqueda) y el chat de Seimian.
   Parte del antiguo clinica/01-panel.js (Fase 1, paso 1.6b). El orden de carga
   importa: los archivos 01a…01i se cargan uno detrás de otro, como antes. */
try {
// ===== aplicar =====

let discDone_aplicar = false;
function handleVideoUpload(input){
  const file = input.files && input.files[0];
  if(!file) return;
  if(!file.type.startsWith('video/')){
    showToast('Por favor, selecciona un archivo de vídeo');
    return;
  }
  const url = URL.createObjectURL(file);
  const box = document.getElementById('video-upload-box');
  box.innerHTML = `
    <video src="${url}" controls playsinline style="width:100%;border-radius:10px;max-height:260px;background:#000;"></video>
    <div style="display:flex;justify-content:space-between;align-items:center;margin-top:10px;">
      <span style="font-size:12px;color:#0E9F6E;font-weight:700;"><svg xmlns="http://www.w3.org/2000/svg" width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="#0E9F6E" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="display:inline-block;vertical-align:-0.15em;flex-shrink:0;"><path d="M20 6 9 17l-5-5"/></svg> Vídeo cargado: ${file.name.length > 28 ? file.name.slice(0,25)+'…' : file.name}</span>
      <button class="btn-sm outline" type="button" onclick="document.getElementById('video-upload-input').click()">Cambiar</button>
    </div>`;
  showToast('Vídeo cargado correctamente');
}

function toggleCvPanel(){
  const panel = document.getElementById('cv-panel');
  const icon = document.getElementById('cv-toggle-icon');
  if(!panel) return;
  const open = panel.style.display === 'block';
  panel.style.display = open ? 'none' : 'block';
  if(icon) icon.style.transform = open ? 'rotate(0deg)' : 'rotate(180deg)';
}

/* Un cop fet el test, Mi cuenta no pot seguir oferint-lo: es el que
   feia que la gent el tornes a fer una i altra vegada. */
function _refrescarDiscMiCuenta(){
  var caixa = document.getElementById('mc-disc-accion');
  if(!caixa) return;
  var d = null;
  try { d = CDB.miDisc(); } catch(e){}
  if(!d || !d.dominant){
    caixa.innerHTML = '<div onclick="showScreen(\'testdisc\')" style="display:inline-flex;align-items:center;gap:6px;color:#1A56DB;font-size:13.5px;font-weight:600;cursor:pointer;">Hacer el test de personalidad →</div>';
    return;
  }
  var nom = {D:'Dominante', I:'Influyente', S:'Estable', C:'Concienzudo'};
  caixa.innerHTML =
    '<div style="display:flex;align-items:center;gap:9px;flex-wrap:wrap;">'
    + '<span style="display:inline-flex;align-items:center;gap:6px;background:#E8F8F1;color:#0B6B4F;border-radius:999px;padding:6px 12px;font-size:12.5px;font-weight:700;">'
    + '<svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><path d="M20 6 9 17l-5-5"/></svg>'
    + 'Test hecho · ' + d.dominant + '/' + d.secondary + '</span>'
    + '<span style="font-size:12.5px;color:#6B7280;">' + (nom[d.dominant] || '') + '</span>'
    + '<span onclick="if(confirm(\'¿Seguro que quieres repetirlo? Se sustituirá tu resultado actual.\')) showScreen(\'testdisc\');" style="font-size:12.5px;color:#6B7280;cursor:pointer;text-decoration:underline;">Repetirlo</span>'
    + '</div>';
}

function handleSaveTestDisc(){
  if(typeof discTestReturnTo_aplicar !== 'undefined' && discTestReturnTo_aplicar){
    returnFromRealTest_aplicar();
    return;
  }
  // Un treballador convidat no te panell on anar: te la seva pantalla de gracies
  var esInvitado = false;
  try { esInvitado = !!(window.esModoInvitado && esModoInvitado()); } catch(e){}
  if(esInvitado){
    // Mientras el resultado se está enviando, todavía no se puede dar por terminado
    if(window.__envioEquipo === 'enviando' || window.__envioEquipo === 'error') return;
    mostrarGracias(); return;
  }
  // I el porta on hi ha el pas seguent, no a una pantalla d ajustos
  try { _refrescarDiscMiCuenta(); } catch(e){}
  var seguent = '';
  try {
    var r = CDB.resumen();
    seguent = (r.miembros <= 1)
      ? 'Tu perfil ya está. Ahora invita a tu equipo desde Mi equipo.'
      : 'Tu perfil ya está guardado.';
  } catch(e){ seguent = 'Tu perfil ya está guardado.'; }
  showScreen('inicio');
  if(typeof showToast === 'function') setTimeout(function(){ showToast(seguent); }, 500);
}

/* Pantalla final del treballador: ha de saber que ja esta i que pot tancar. */
function mostrarGracias(){
  var nom = '', clinica = '';
  try {
    nom = sessionStorage.getItem('cerco_invitado_nombre') || '';
    clinica = sessionStorage.getItem('cerco_invitado_clinica') || '';
  } catch(e){}
  var d;
  try { d = JSON.parse(localStorage.getItem('cerco_disc_individual')) || null; } catch(e){ d = null; }

  var h = document.getElementById('gracias-titulo');
  if(h) h.textContent = nom ? ('¡Gracias, ' + nom.split(/\s+/)[0] + '!') : '¡Gracias!';

  var sub = document.getElementById('gracias-texto');
  if(sub) sub.innerHTML = 'Tu resultado ya está con <b>' + (clinica ? _esc(clinica) : 'tu clínica')
    + '</b>. No tienes que hacer nada más: ya puedes cerrar esta página.';

  var perf = document.getElementById('gracias-perfil');
  if(perf){
    if(d && d.dominant){
      perf.style.display = 'block';
      perf.innerHTML = '<div style="font-size:11px;letter-spacing:.6px;color:rgba(255,255,255,.55);margin-bottom:7px;">TU PERFIL</div>'
        + '<div style="font-size:19px;font-weight:800;color:white;">' + d.dominant + '/' + d.secondary + '</div>';
    } else { perf.style.display = 'none'; }
  }
  showScreen('gracias');
}
// Protege un texto antes de meterlo en la página: también las comillas (dobles y
// simples), para que un nombre como «Clínica "La Sonrisa"» no rompa nada, y un
// valor vacío (null o undefined) queda vacío en lugar de escribir «null».
function _esc(t){ return String(t == null ? '' : t).replace(/[<>&"']/g, function(c){ return {'<':'&lt;','>':'&gt;','&':'&amp;','"':'&quot;',"'":'&#39;'}[c]; }); }

function goToRealDiscTest_aplicar(){
  discTestReturnTo_aplicar = true;
  showScreen('testdisc');
}
function returnFromRealTest_aplicar(){
  let data;
  try { data = JSON.parse(localStorage.getItem('cerco_disc_individual')); } catch(e){}
  discDone_aplicar = true;
  const btn = document.getElementById('disc-btn-aplicar');
  if(btn){
    const label = data ? `${data.dominant}/${data.secondary}` : 'completado';
    btn.outerHTML = `<div class="disc-done-badge"><svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="display:inline-block;vertical-align:-0.15em;flex-shrink:0;"><path d="M20 6 9 17l-5-5"/></svg> Test completado — Perfil ${label}</div>`;
  }
  document.getElementById('fit-hint-aplicar').style.display='none';
  document.getElementById('fit-result-aplicar').style.display='block';
  const box = document.getElementById('ready-box-aplicar');
  box.classList.add('ok');
  document.getElementById('missing-list-aplicar').style.display='none';
  document.getElementById('ready-text-aplicar').textContent = "¡Todo listo! La empresa recibirá tu perfil completo, incluyendo tu encaje de personalidad con este rol.";
  discTestReturnTo_aplicar = false;
  showScreen('aplicar');
  showToast('Test completado, encaje calculado con tu resultado real');
}
let discTestReturnTo_aplicar = false;
document.getElementById('submit-btn-aplicar').addEventListener('click', ()=>{
  if(!discDone_aplicar){
    document.getElementById('missing-list-aplicar').style.display='block';
    document.getElementById('missing-list-aplicar').scrollIntoView({behavior:'smooth', block:'center'});
    return;
  }
  showToast('¡Solicitud enviada! Te llevamos al seguimiento en tiempo real...');
  setTimeout(()=> showScreen('estat'), 900);
});
document.querySelectorAll('.skill-chip').forEach(chip=>{
  chip.addEventListener('click', ()=>chip.classList.toggle('active'));
});


// ===== portal =====

const candidates_portal = [
  {initials:"MG", name:"María García", role:"Higienista Dental, 2 años exp.", match:92, disc:"I", skills:["empatía","comunicación","disp.inmediata"], tags:["Disp. inmediata"], distKm:2.3, city:"Madrid"},
  {initials:"JS", name:"Jana Moreno", role:"Auxiliar dental, prácticas", match:88, disc:"I", skills:["proactiva","trabajo en equipo","ganas de aprender"], tags:["Recién graduada"], distKm:34, city:"Valencia"},
  {initials:"LP", name:"Lucía Pérez", role:"Higienista Dental, 1 año exp.", match:85, disc:"S", skills:["paciente","fiable","orientación al paciente"], tags:["Disp. inmediata"], distKm:6.8, city:"Sevilla"},
  {initials:"AC", name:"Ana Castro", role:"Técnico en Higiene Bucodental", match:81, disc:"I", skills:["comunicativa","positiva","cerca"], tags:[], distKm:4.1, city:"Barcelona"},
  {initials:"MR", name:"Marcos Roca", role:"Auxiliar dental, 3 años exp.", match:79, disc:"S", skills:["constante","trabajo en equipo","responsable"], tags:["Disp. parcial"], distKm:18, city:"Bilbao"},
  {initials:"EN", name:"Elena Navarro", role:"Higienista, recién graduada", match:77, disc:"C", skills:["detallista","organizada","precisión"], tags:["Recién graduada"], distKm:62, city:"Zaragoza"},
  {initials:"DV", name:"David Vidal", role:"Higienista Dental, 4 años exp.", match:74, disc:"D", skills:["resolutivo","ritmo rápido","experiencia"], tags:[], distKm:1.5, city:"Málaga"},
  {initials:"PS", name:"Paula Solís", role:"Auxiliar dental, prácticas", match:70, disc:"S", skills:["empática","paciente","disp.inmediata"], tags:["Disp. inmediata"], distKm:9.2, city:"Murcia"},
  {initials:"OG", name:"Óscar Gallego", role:"Técnico en Higiene Bucodental", match:66, disc:"C", skills:["meticuloso","analítico","puntual"], tags:["Disp. parcial"], distKm:41, city:"Valladolid"},
  {initials:"CR", name:"Carmen Ruiz", role:"Recepcionista clínica, 5 años exp.", match:83, disc:"I", skills:["atenciónalcliente","agenda","idiomas"], tags:["Disp. inmediata"], distKm:12, city:"Palma"},
  {initials:"IF", name:"Íñigo Fernández", role:"Odontólogo general, 6 años exp.", match:78, disc:"D", skills:["diagnóstico","implantes","liderazgo"], tags:[], distKm:28, city:"A Coruña"},
  {initials:"NB", name:"Nerea Blanco", role:"Higienista Dental, 3 años exp.", match:76, disc:"C", skills:["periodoncia","protocolo","rigor"], tags:["Disp. parcial"], distKm:7.4, city:"Alicante"},
];
const COLORS_portal = {D:"#FF5A5F", I:"#F0A800", S:"#00B488", C:"#5B5FE0"};
const NAMES_portal = {D:"Dominante", I:"Influyente", S:"Estable", C:"Concienzudo"};

const grid = document.getElementById('grid-portal');
candidates_portal.forEach((c, _i)=>{
  const card = document.createElement('div');
  card.className='candidate-card';
  card.dataset.idx = _i;
  card.dataset.km = c.distKm;
  card.dataset.disc = c.disc;
  card.addEventListener('click', ()=> showScreen('candidat'));
  card.innerHTML = `
    <div class="card-top">
      <div class="avatar-circle-big">${c.initials}</div>
      <div class="top-meta">
        <div class="match-badge"><svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="display:inline-block;vertical-align:-0.15em;flex-shrink:0;"><circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="6"/><circle cx="12" cy="12" r="2"/></svg> ${c.match}%</div>
        <div class="play-btn">▶</div>
      </div>
      <div class="overlay-bottom">
        <div class="cand-name-overlay">${c.name}</div>
        <div class="hashtags-row">
          <span class="hashtag disc-tag" style="background:${COLORS_portal[c.disc]}">#${c.disc}_${NAMES_portal[c.disc]}</span>
          ${c.skills.map(s=>`<span class="hashtag">${s}</span>`).join('')}
        </div>
      </div>
    </div>
    <div class="card-body">
      <div class="cand-role">${c.role}</div>
      <div class="disc-row">
        <span class="disc-pill" style="background:${COLORS_portal[c.disc]}">${c.disc} · ${NAMES_portal[c.disc]}</span>
        <span class="why-link" onclick="event.stopPropagation(); explain_portal('${c.name}','${c.match}','${c.disc}')">¿por qué?</span>
      </div>
      <div class="quick-tags"><span class="quick-tag dist-tag"><svg xmlns="http://www.w3.org/2000/svg" width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="display:inline-block;vertical-align:-0.15em;flex-shrink:0;"><path d="M20 10c0 4.993-5.539 10.193-7.399 11.799a1 1 0 0 1-1.202 0C9.539 20.193 4 14.993 4 10a8 8 0 0 1 16 0"/><circle cx="12" cy="10" r="3"/></svg> ${c.city}</span><span class="quick-tag">${c.distKm < 1 ? '&lt;1' : c.distKm} km</span>${c.tags.map(t=>`<span class="quick-tag">${t}</span>`).join('')}</div>
      <div class="card-actions">
        <button class="act-btn act-pass" onclick="event.stopPropagation(); discardCandidate_portal(this)"><svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="display:inline-block;vertical-align:-0.15em;flex-shrink:0;"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg> Descartar</button>
        <button class="act-btn act-like" onclick="event.stopPropagation(); likeCandidate_portal(this)"><svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="display:inline-block;vertical-align:-0.15em;flex-shrink:0;"><path d="M20 6 9 17l-5-5"/></svg> Me interesa</button>
      </div>
    </div>
  `;
  grid.appendChild(card);
});

function explain_portal(name, match, disc){
  _porQueModal(name, match, disc);
}

/* El "por que" en una finestra propia: un alert del navegador ensenya
   la ruta del fitxer i trenca l acabat de tota la resta. */
function _porQueModal(name, match, disc){
  var vell = document.getElementById('modal-porque');
  if(vell) vell.remove();
  var m = document.createElement('div');
  m.id = 'modal-porque';
  m.style.cssText = 'position:fixed;inset:0;background:rgba(10,14,30,.55);display:flex;align-items:center;justify-content:center;z-index:10001;padding:20px;box-sizing:border-box;';
  m.onclick = function(e){ if(e.target === m) m.remove(); };
  var nom = (NAMES_portal && NAMES_portal[disc]) ? NAMES_portal[disc] : disc;
  m.innerHTML =
    '<div style="background:white;border-radius:18px;max-width:380px;width:100%;padding:22px;box-shadow:0 24px 60px rgba(0,0,0,.25);">'
    + '<div style="font-size:11px;letter-spacing:.6px;color:#6B7280;margin-bottom:5px;">POR QUÉ ' + match + '%</div>'
    + '<div style="font-size:18px;font-weight:800;color:#111827;margin-bottom:14px;">' + _esc(name) + '</div>'
    + '<div style="font-size:13.5px;color:#374151;line-height:1.65;">'
    + '<div style="margin-bottom:8px;">· Perfil <b>' + disc + ' (' + nom + ')</b>, que encaja con lo que pide este rol.</div>'
    + '<div style="margin-bottom:8px;">· Disponibilidad y ubicación compatibles.</div>'
    + '<div>· Experiencia relevante en el CV.</div></div>'
    + '<div style="background:#F8F9FA;border-radius:10px;padding:11px 13px;margin-top:14px;font-size:12px;color:#6B7280;line-height:1.55;">'
    + 'Es un cálculo orientativo: no garantiza el encaje real. Haz la entrevista igualmente.</div>'
    + '<button onclick="document.getElementById(\'modal-porque\').remove()" style="width:100%;margin-top:16px;background:#1A56DB;color:white;border:none;border-radius:10px;padding:12px;font-size:14px;font-weight:700;cursor:pointer;font-family:inherit;">Entendido</button></div>';
  document.body.appendChild(m);
}

// ---- Filtros combinados (texto + color + ubicación) ----
let activeDiscFilter_portal = null;
let activeRadiusKm_portal = 9999;

function limpiarFiltrosPortal(){
  var b = document.getElementById('search-portal'); if(b) b.value = '';
  try{ activeDiscFilter_portal = null; }catch(e){}
  document.querySelectorAll('#screen-portal .filter-chip').forEach(function(c){ c.classList.remove('active'); });
  var tots = document.querySelector('#screen-portal .filter-chip:not(.orden-chip)');
  if(tots) tots.classList.add('active');
  var todas = document.querySelector('#screen-portal .radius-chip[data-km="9999"]');
  if(todas){
    document.querySelectorAll('#screen-portal .radius-chip').forEach(function(c){ c.classList.remove('active'); });
    todas.classList.add('active');
    try{ activeRadiusKm_portal = 9999; }catch(e){}
  }
  applyFilters_portal();
  if(typeof showToast === 'function') showToast('Filtros quitados');
}

/* Filtros de «Candidatos»: los de ejemplo, las solicitudes reales y la
   agrupación por profesión (Fase 1: una sola versión) */
function applyFilters_portal(){
  var r; try{ r = _filtrarCandidatosEjemplo.apply(this, arguments); }catch(x){}
  try{ CERCO_filtrarSolicitudesReales(); }catch(x){}
  if(window.CERCO_agruparTrasFiltrar) CERCO_agruparTrasFiltrar();
  return r;
}
function _filtrarCandidatosEjemplo(){
  const q = (document.getElementById('search-portal')?.value || '').toLowerCase().trim();
  document.querySelectorAll('#screen-portal .candidate-card').forEach((card)=>{
    const c = candidates_portal[parseInt(card.dataset.idx, 10)];
    if(!c) return;
    const haystack = (c.name + ' ' + c.role + ' ' + c.skills.join(' ') + ' ' + c.tags.join(' ') + ' ' + c.disc + ' ' + c.city).toLowerCase();
    const matchesText = !q || haystack.includes(q);
    const matchesDisc = !activeDiscFilter_portal || c.disc === activeDiscFilter_portal;
    const matchesRadius = (activeRadiusKm_portal === 'prop') ? true : (c.distKm <= activeRadiusKm_portal);
    card.style.display = (matchesText && matchesDisc && matchesRadius) ? '' : 'none';
  });
  const visibleCount = [...document.querySelectorAll('#screen-portal .candidate-card')].filter(c=>c.style.display !== 'none').length;

  // Una lista vacía sin explicación parece una app rota
  (function(){
    var grid = document.querySelector('#screen-portal .grid') || document.querySelector('#screen-portal .candidate-card')?.parentElement;
    var vacio = document.getElementById('portal-sin-resultados');
    if(visibleCount > 0){ if(vacio) vacio.remove(); return; }
    if(!grid) return;
    if(!vacio){
      vacio = document.createElement('div');
      vacio.id = 'portal-sin-resultados';
      vacio.style.cssText = 'grid-column:1/-1;background:white;border:1px dashed #D8DEE9;border-radius:16px;padding:34px 24px;text-align:center;';
      grid.appendChild(vacio);
    }
    var motivo = q
      ? 'Ningún candidato coincide con <b>&laquo;' + q.replace(/[<>&]/g,'') + '&raquo;</b>.'
      : 'Ningún candidato cumple los filtros que has puesto.';
    vacio.innerHTML =
      '<div style="font-size:15px;font-weight:800;color:#111827;margin-bottom:8px;">Sin resultados</div>'
      + '<div style="font-size:13.5px;color:#6B7280;line-height:1.6;max-width:380px;margin:0 auto;">' + motivo
      + ' Prueba con otra palabra, amplía la distancia o quita el filtro de perfil.</div>'
      + '<div style="margin-top:16px;"><button onclick="limpiarFiltrosPortal()" style="background:#1A56DB;color:white;border:none;border-radius:9px;padding:10px 20px;font-size:13px;font-weight:700;cursor:pointer;font-family:inherit;">Quitar los filtros</button></div>';
  })();

  const note = document.getElementById('location-result-note');
  if(note){
    const cityVal = document.getElementById('location-input-portal')?.value || 'tu zona';
    const origen = document.getElementById('clinic-address-portal')?.value.trim() || 'tu clínica';
    if(activeRadiusKm_portal === 'prop'){
      note.innerHTML = 'Ordenados por cercanía a <b>' + origen + '</b>, del más cerca al más lejos · ' + visibleCount + ' disponibles';
    } else {
      const esTodaEspana = activeRadiusKm_portal >= 9999;
      note.innerHTML = esTodaEspana
        ? 'Mostrando candidatos de <b>toda España</b> · ' + visibleCount + ' disponibles'
        : 'Mostrando candidatos a menos de <b>' + activeRadiusKm_portal + ' km</b> de <b>' + origen + '</b> · ' + visibleCount + ' disponibles';
    }
  }
}

/* Obrir el portal des d una oferta concreta: el titol i la recomanacio
   han de ser els d AQUELLA oferta, no un text escrit a ma. */
var ofertaEnPortal = null;

function verCandidatosDeOferta(id){
  var l = [];
  try { l = getSavedOffers(); } catch(e){}
  ofertaEnPortal = null;
  for(var i=0;i<l.length;i++){ if(String(l[i].id) === String(id)) ofertaEnPortal = l[i]; }
  showScreen('portal');
}

var _NOMDISC = {D:'Dominante', I:'Influyente', S:'Estable', C:'Concienzudo'};
var _QUEAPORTA = {
  D: 'decide rápido y tira del carro cuando hay presión',
  I: 'trato cercano con el paciente y energía en el equipo',
  S: 'paciencia y constancia, el que sostiene el día a día',
  C: 'precisión y método, el que no se salta un protocolo'
};

/* Cabecera de Candidatos y, debajo, las solicitudes reales (Fase 1: una sola versión) */
function _cabeceraPortal(){
  var r = _cabeceraPortalBase.apply(this, arguments);
  try{ CERCO_pintarSolicitudesReales(); }catch(x){}
  return r;
}
function _cabeceraPortalBase(){
  var tit = document.getElementById('portal-titulo');
  var rec = document.getElementById('portal-recomendacion');
  var o = ofertaEnPortal;

  if(tit) tit.textContent = o ? ('Portal de candidatos · ' + (o.titulo || 'Tu oferta')) : 'Portal de candidatos';
  if(!rec) return;

  if(!o){
    var d0 = null; try { d0 = CDB.perfilQueFalta(); } catch(e){}
    rec.innerHTML = '<b>Recomendación de CERCO</b>' + _fraseQueFalta(d0)
      + 'Abre una de tus ofertas desde <b>Mis ofertas</b> y te diré además qué pide ese puesto concreto.';
    return;
  }

  var ps = (o.perfiles && o.perfiles.length) ? o.perfiles
         : (o.disc ? o.disc.split('+').map(function(x){ return x.trim(); }).filter(Boolean) : []);
  if(!ps.length){
    rec.innerHTML = '<b>Recomendación de CERCO</b>Esta oferta no tiene perfiles marcados. Edítala y márcalos para que pueda ordenarte los candidatos.';
    return;
  }

  var nombres = ps.map(function(l){ return _NOMDISC[l] || l; });
  var txt = '<b>Recomendación de CERCO</b>Para <b>' + _esc(o.titulo || 'este puesto') + '</b> marcaste <b>'
          + ps.join(' + ') + '</b> (' + nombres.join(' y ') + '): ';
  txt += ps.map(function(l){ return (_QUEAPORTA[l] || ''); }).filter(Boolean).join(', y ') + '. ';
  txt += 'He ordenado los candidatos por su encaje con esos perfiles.';
  rec.innerHTML = txt;

  // I ordenem de debo pels perfils d aquesta oferta
  perfilesOferta_portal = ps;
  try { _ordenarPortal(); applyFilters_portal(); } catch(e){}
}

var perfilesOferta_portal = null;

/* ---- Ordenacio del portal ----
   Per defecte, per encaix. "Cerca de mi" ordena per distancia.
   "Recomendados" posa davant els perfils que li falten a l equip i ho explica
   a la targeta: una recomanacio sense motiu no val de res. */
var ordenRecomendados_portal = false;

function _ordenarPortal(){
  var grid = document.getElementById('grid-portal');
  if(!grid) return;
  var cards = [].slice.call(grid.querySelectorAll('.candidate-card'));
  if(!cards.length) return;

  var falten = [];
  if(ordenRecomendados_portal){
    try {
      var d = CDB.perfilQueFalta();
      if(d && d.fiable) falten = [d.falta, d.segona];
    } catch(e){}
  }

  cards.sort(function(a, b){
    var ca = candidates_portal[parseInt(a.dataset.idx,10)];
    var cb = candidates_portal[parseInt(b.dataset.idx,10)];
    if(!ca || !cb) return 0;
    if(perfilesOferta_portal && perfilesOferta_portal.length){
      var oa = perfilesOferta_portal.indexOf(ca.disc); oa = (oa === -1) ? 9 : oa;
      var ob = perfilesOferta_portal.indexOf(cb.disc); ob = (ob === -1) ? 9 : ob;
      if(oa !== ob) return oa - ob;
    }
    if(ordenRecomendados_portal && falten.length){
      var pa = falten.indexOf(ca.disc), pb = falten.indexOf(cb.disc);
      pa = (pa === -1) ? 9 : pa;
      pb = (pb === -1) ? 9 : pb;
      if(pa !== pb) return pa - pb;
    }
    if(activeRadiusKm_portal === 'prop') return ca.distKm - cb.distKm;
    return cb.match - ca.match;
  });
  cards.forEach(function(c){ grid.appendChild(c); });

  // el motiu, escrit a la targeta
  cards.forEach(function(card){
    var vell = card.querySelector('.rec-motiu');
    if(vell) vell.remove();
    var c = candidates_portal[parseInt(card.dataset.idx,10)];
    if(!c) return;
    var pos = falten.indexOf(c.disc);
    if(ordenRecomendados_portal && pos > -1){
      var nom = {D:'Dominante', I:'Influyente', S:'Estable', C:'Concienzudo'}[c.disc];
      var pct = null;
      try { var dd = CDB.perfilQueFalta(); if(dd) pct = dd.comp[c.disc]; } catch(e){}
      var el = document.createElement('div');
      el.className = 'rec-motiu';
      el.style.cssText = 'background:#E8F8F1;border-top:1px solid #BFE9D7;padding:9px 14px;font-size:11.5px;color:#0B6B4F;line-height:1.45;';
      var segon = '';
      try {
        var dd2 = CDB.perfilQueFalta();
        if(dd2 && dd2.fiable){
          var altre = (pos === 0) ? dd2.segona : dd2.falta;
          var etiq  = (pos === 0) ? 'El segundo que te falta' : 'El que más te falta';
          segon = '<div style="margin-top:5px;padding-top:5px;border-top:1px solid #BFE9D7;opacity:.85;">'
                + etiq + ' es <b>' + (_NOMDISC[altre] || altre) + ' (' + altre + ')</b>, un '
                + dd2.comp[altre] + '%.</div>';
        }
      } catch(e){}
      el.innerHTML = '<b>Te lo recomiendo:</b> es ' + nom + ' (' + c.disc + ')'
        + (pct !== null ? ', y de ese perfil solo tienes un ' + pct + '%' : '')
        + (pos === 0 ? ' — es el que menos tienes.' : ' — es el segundo que menos tienes.')
        + segon;
      card.appendChild(el);
    }
  });
}

/* «Recomendados para mi equipo»: se activa o desactiva y se repinta Candidatos (Fase 1: una sola versión) */
function alternarRecomendados(){
  var r = _alternarRecomendadosBase.apply(this, arguments);
  try{ renderPortalReal(); }catch(x){}
  return r;
}
function _alternarRecomendadosBase(){
  var chip = document.getElementById('chip-recomanats');
  var d = null;
  try { d = CDB.perfilQueFalta(); } catch(e){}
  if(!ordenRecomendados_portal && (!d || !d.fiable)){
    if(typeof showToast === 'function')
      showToast('Necesito al menos 3 tests de tu equipo para recomendarte');
    return;
  }
  ordenRecomendados_portal = !ordenRecomendados_portal;
  if(chip) chip.classList.toggle('active', ordenRecomendados_portal);
  _ordenarPortal();
  applyFilters_portal();
  if(ordenRecomendados_portal && typeof showToast === 'function' && d)
    showToast('Primero los de perfil ' + d.falta + ', que es el que te falta');
}

/* En obrir el portal, li diem que li falta abans que busqui a cegues. */
function prepararPortalSegunEquipo(){
  var chip = document.getElementById('chip-recomanats');
  if(!chip) return;
  var d = null;
  try { d = CDB.perfilQueFalta(); } catch(e){}
  chip.style.opacity = (d && d.fiable) ? '1' : '.55';
  _ordenarPortal();
}

// ---- Cercador en temps real ----
const searchInput_portal = document.getElementById('search-portal');
if(searchInput_portal){
  searchInput_portal.addEventListener('input', applyFilters_portal);
}

// ---- Radio de ubicación ----
document.querySelectorAll('#screen-portal .radius-chip').forEach(chip=>{
  chip.addEventListener('click', ()=>{
    document.querySelectorAll('#screen-portal .radius-chip').forEach(c=>c.classList.remove('active'));
    chip.classList.add('active');
    activeRadiusKm_portal = (chip.dataset.km === 'prop') ? 'prop' : parseFloat(chip.dataset.km);
    _ordenarPortal();
    applyFilters_portal();
  });
});
const locationInput_portal = document.getElementById('location-input-portal');
if(locationInput_portal){
  locationInput_portal.addEventListener('input', applyFilters_portal);
}

// ---- Filtres de color clicables ----
document.querySelectorAll('#screen-portal .filter-chip:not(.orden-chip)').forEach(chip=>{
  chip.addEventListener('click', ()=>{
    document.querySelectorAll('#screen-portal .filter-chip:not(.orden-chip)').forEach(c=>c.classList.remove('active'));
    chip.classList.add('active');
    // La lletra la llegim del text del xip ("Perfil D (2)"), que es
    // fiable; el color el normalitza el navegador i no serveix.
    var m = (chip.textContent || '').match(/Perfil\s+([DISC])\b/);
    activeDiscFilter_portal = m ? m[1] : null;
    applyFilters_portal();
  });
});
applyFilters_portal();


// ---- Descartar / M'interessa ----
function discardCandidate_portal(btn){
  const card = btn.closest('.candidate-card');
  card.style.opacity = '0.3';
  card.style.pointerEvents = 'none';
  showToast('Candidato descartado');
}
function likeCandidate_portal(btn){
  const card = btn.closest('.candidate-card');
  btn.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="display:inline-block;vertical-align:-0.15em;flex-shrink:0;"><path d="M20 6 9 17l-5-5"/></svg> Interesado/a';
  btn.style.background = '#0E9F6E';
  showToast('Has marcado interés — se le notificará automáticamente');
}

// ---- Toast de feedback ----
function showToast(msg){
  let toast = document.getElementById('global-toast');
  if(!toast){
    toast = document.createElement('div');
    toast.id = 'global-toast';
    toast.style.cssText = 'position:fixed;bottom:24px;left:50%;transform:translateX(-50%);background:#212529;color:white;padding:12px 22px;border-radius:999px;font-size:13.5px;font-weight:600;z-index:9999;box-shadow:0 8px 24px rgba(0,0,0,.25);opacity:0;transition:opacity .25s ease;';
    document.body.appendChild(toast);
  }
  // Si el missatge porta etiquetes, les traiem: el toast es nomes text
  var net = String(msg == null ? '' : msg);
  if(net.indexOf('<') !== -1) net = net.replace(/<[^>]*>/g, '').replace(/\s+/g,' ').trim();
  toast.textContent = net;
  toast.style.opacity = '1';
  clearTimeout(toast._t);
  toast._t = setTimeout(()=>{ toast.style.opacity = '0'; }, 2200);
}

// ---- Chat con IA ----
const CHAT_RESPONSES = [
  "¡Hola! Gracias por tu interés en la candidatura de María. He visto su perfil y me parece muy sólido. ¿Tienes alguna pregunta concreta sobre su experiencia?",
  "Entendido. Maria tiene disponibilidad inmediata y podría empezar esta misma semana si fuera necesario.",
  "Perfecto, te confirmo que su test DISC muestra un perfil Influyente — muy alineado con el ambiente que describes en tu clínica.",
  "¿Quieres que programemos una entrevista? Puedo ver su disponibilidad para esta semana.",
  "Claro, no hay problema. Maria mencionó que prefiere las mañanas, pero puede adaptarse a cualquier franja.",
  "Una cosa más: Maria ha hecho un curso de actualización en periodoncia este año, por si es relevante para el puesto.",
  "De acuerdo. Te avisaré en cuanto tenga confirmación de su parte. Normalmente responde en menos de una hora.",
];
let chatIdx = 0;
let chatTyping = false;


/* Seimian respon segons el que te el propietari en aquest moment,
   no amb frases fetes que no encaixen amb la seva situacio. */
/* Abrir Seimian y, un momento después, saludar con lo pendiente de hoy (Fase 1: una sola versión) */
function abrirSeimian(){
  var r = _abrirSeimianBase.apply(this, arguments);
  setTimeout(function(){ try{ CERCO_seimianSaludo(); }catch(x){} }, 120);
  return r;
}
function _abrirSeimianBase(){
  if(typeof openChat !== 'function'){ if(typeof showToast==='function') showToast('Seimian no está disponible'); return; }
  window.__chatSeimian = true;
  var vell = document.getElementById('global-chat-modal');
  if(vell) vell.remove();          // sempre comencem net
  try{ chatIdx = 0; }catch(e){}
  openChat('Seimian');
  setTimeout(function(){
    try{
      var t = document.getElementById('chat-title');
      if(t) t.textContent = 'Seimian';
      var st = document.getElementById('chat-estado');
      if(st) st.textContent = 'Solo ve los datos de tu clínica';
      // El logo de CERCO, reaprofitant el que ja hi ha a la barra de dalt:
      // aixi no dupliquem la imatge dins de l arxiu.
      var av = document.getElementById('chat-avatar');
      if(av){
        var src = '';
        try {
          var l = document.querySelector('#mobile-topbar img');
          if(l && l.src) src = l.src;
        } catch(e){}
        if(src){
          av.innerHTML = '<img src="' + src + '" alt="CERCO" style="width:24px;height:24px;object-fit:contain;display:block;">';
          av.style.background = '#0F1C3F';
        } else {
          av.textContent = 'S';
        }
      }
      var cont = document.getElementById('chat-messages');
      if(!cont) return;
      cont.innerHTML = '';
      var r = CDB.resumen();
      var msg;
      if(!r.clinica)            msg = 'Hola. Para poder ayudarte necesito saber de qué clínica hablamos: complétalo en Mi clínica y vuelve.';
      else if(!r.miDiscHecho)   msg = 'Hola. Todavía no has hecho tu test de personalidad, y es lo primero: sin él no puedo calcular el encaje de nadie con tu equipo.';
      else if(r.miembros < 3)   msg = 'Tienes ' + r.miembros + ' persona' + (r.miembros===1?'':'s') + ' con el test hecho. A partir de 3 empiezo a leer el equipo y a decirte qué perfil te falta. Pásales el enlace desde Mi equipo.';
      else if(r.ofertas === 0)  msg = 'Tu equipo ya está medido. Cuando publiques una oferta te diré qué perfil encaja mejor con ese puesto concreto.';
      else                      msg = 'Tienes ' + r.ofertas + ' oferta' + (r.ofertas>1?'s':'') + ' y ' + r.miembros + ' personas con el test hecho. Pregúntame por el encaje de cualquier candidato o por el hueco que tiene tu equipo.';
      _xuletaSeimian(cont);

      var bur = document.createElement('div');
      bur.style.cssText = 'background:white;border-radius:14px;padding:11px 14px;font-size:13.5px;color:#374151;line-height:1.6;box-shadow:0 1px 3px rgba(0,0,0,.06);align-self:flex-start;max-width:85%;';
      bur.textContent = msg;
      cont.appendChild(bur);
      _dreceresSeimian(cont);
    }catch(e){}
  }, 60);
}

/* La xuleta. Va primera de tot i respon la pregunta que es fa
   tothom en obrir una finestra de xat: "i ara que li dic?" */
function _xuletaSeimian(cont){
  if(!cont) cont = document.getElementById('chat-messages');
  if(!cont) return;

  var files = [
    ['M12 2 15.09 8.26 22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14l-5-4.87 6.91-1.01z',
     'Te digo qué hacer hoy', 'quién espera respuesta y cuánto tiempo queda'],
    ['M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2 M9 2h6v4H9z',
     'Te ordeno los candidatos', 'por lo que pide el puesto, y te digo qué preguntar'],
    ['M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2 M9 7a4 4 0 1 0 0 8 4 4 0 0 0 0-8z M22 21v-2a4 4 0 0 0-3-3.87',
     'Reviso tus ofertas y tu equipo', 'qué les falta, sueldos de referencia y tus cifras']
  ];

  var caixa = document.createElement('div');
  caixa.style.cssText = 'align-self:flex-start;max-width:92%;background:#0F1C3F;border-radius:14px;padding:14px 15px;box-shadow:0 1px 3px rgba(0,0,0,.08);';

  var h = '<div style="display:flex;align-items:center;gap:8px;margin-bottom:11px;">'
        + '<svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#8AB4FF" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m12 3-1.9 5.8a2 2 0 0 1-1.3 1.3L3 12l5.8 1.9a2 2 0 0 1 1.3 1.3L12 21l1.9-5.8a2 2 0 0 1 1.3-1.3L21 12l-5.8-1.9a2 2 0 0 1-1.3-1.3z"/></svg>'
        + '<span style="font-size:11px;font-weight:800;letter-spacing:.7px;color:#8AB4FF;">ESTO ES LO QUE HAGO</span></div>';

  files.forEach(function(f){
    h += '<div style="display:flex;gap:9px;align-items:flex-start;margin-bottom:9px;">'
      +  '<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#8AB4FF" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round" style="flex-shrink:0;margin-top:2px;"><path d="' + f[0] + '"/></svg>'
      +  '<div style="line-height:1.4;"><div style="font-size:12.5px;font-weight:700;color:white;">' + f[1] + '</div>'
      +  '<div style="font-size:11.5px;color:rgba(255,255,255,.62);">' + f[2] + '</div></div></div>';
  });

  h += '<div style="border-top:1px solid rgba(255,255,255,.14);margin-top:11px;padding-top:10px;font-size:11.5px;color:rgba(255,255,255,.55);line-height:1.5;">'
    +  'Toca uno de los botones de abajo, o escríbeme sobre <b style="color:rgba(255,255,255,.8);">tu equipo</b>, '
    +  '<b style="color:rgba(255,255,255,.8);">tus ofertas</b> o <b style="color:rgba(255,255,255,.8);">tus candidatos</b>. '
    +  'Solo hablo de lo que veo en tu clínica: no invento nada.</div>';

  caixa.innerHTML = h;
  cont.appendChild(caixa);
}

/* Les tres coses que un responsable vol saber, a un toc.
   Surten al principi i tornen a sortir despres de cada resposta,
   perque no hagi d endevinar mai que pot preguntar. */

/* Respon com si li ho haguessis escrit tu, perque quedi la conversa sencera */
function _seimianDiu(pregunta, resposta, despres){
  if(typeof addChatMsg !== 'function') return;
  var d = document.getElementById('seimian-dreceres');
  if(d) d.remove();
  addChatMsg(pregunta, 'me');
  var typing = document.getElementById('chat-typing');
  if(typing) typing.style.display = 'block';
  setTimeout(function(){
    if(typing) typing.style.display = 'none';
    addChatMsg(resposta, 'them');
    _dreceresSeimian();
    if(typeof despres === 'function') despres();
  }, 700);
}

/* 1. Que li falta a l equip: numeros reals, i si no n hi ha prou, ho diu */
function seimianEquipo(){
  var r, d;
  try { r = CDB.resumen(); d = CDB.perfilQueFalta(); } catch(e){}
  var txt;
  if(!r || r.miembros === 0){
    txt = 'Todavía no hay ningún test hecho, así que cualquier cosa que te dijera me la estaría inventando. Empieza por el tuyo en Mi cuenta.';
  } else if(!d || !d.fiable){
    txt = 'Tengo ' + d.tests + ' test' + (d.tests === 1 ? '' : 's') + ' hecho' + (d.tests === 1 ? '' : 's')
        + '. Con menos de 3 no puedo leer un equipo sin inventar. Pásales el enlace desde Mi equipo y vuelve.';
  } else {
    var c = d.comp;
    var nom = {D:'Dominante', I:'Influyente', S:'Estable', C:'Concienzudo'};
    txt = 'Con ' + d.tests + ' tests, tu equipo está así: <b>D ' + c.D + '%</b> · <b>I ' + c.I + '%</b> · <b>S ' + c.S + '%</b> · <b>C ' + c.C + '%</b>.<br><br>'
        + 'Lo que menos tienes es <b>' + nom[d.falta] + ' (' + d.falta + ')</b>, un ' + c[d.falta] + '%'
        + (c[d.falta] === 0 ? ': no lo tienes en absoluto' : '')
        + '. En la próxima incorporación dale peso a ese perfil — cuando crees la oferta ya te lo dejo marcado.';
  }
  _seimianDiu('¿Qué le falta a mi equipo?', txt);
}

/* 2. L oferta: no escriu un text fals, el porta on ja ve marcat */
function seimianOferta(){
  var r, d;
  try { r = CDB.resumen(); d = CDB.perfilQueFalta(); } catch(e){}
  var nom = {D:'Dominante', I:'Influyente', S:'Estable', C:'Concienzudo'};
  var txt = (d && d.fiable)
    ? 'Te abro una oferta nueva con el perfil <b>' + nom[d.falta] + ' (' + d.falta + ')</b> ya marcado, que es el que menos tienes. Escribe el puesto y la ubicación, y el resto lo puedes cambiar tú.'
    : 'Te abro una oferta nueva. Aún no tengo suficientes tests para decirte qué perfil te falta, así que la dejo con los perfiles habituales de atención al paciente — cámbialos si este puesto pide otra cosa.';
  _seimianDiu('Ayúdame con una oferta', txt, function(){
    setTimeout(function(){
      var m = document.getElementById('global-chat-modal');
      if(m) m.remove();
      try{ chatIdx = 0; }catch(e){}
      showScreen('crear-oferta');
    }, 900);
  });
}

/* 3. Convidar l equip: li copia l enllac, no li explica on es */
function seimianInvitar(){
  var link = '';
  try { link = buildInviteLink() || ''; } catch(e){}
  if(!link){
    _seimianDiu('¿Cómo invito a mi equipo?',
      'Primero necesito el nombre de tu clínica: sin él el enlace no sabe a quién enviar los resultados. Complétalo en <b>Mi clínica</b> y te lo preparo.');
    return;
  }
  // Amb nuvol l enllac porta l identificador i el resultat arriba sol.
  // Sense nuvol es el de reserva, i llavors torna un codi: no podem prometre
  // una cosa per l altra.
  var directe = link.indexOf('?c=') > -1;
  var txt = 'Te he copiado el enlace. Pégalo en el grupo de WhatsApp de la clínica:<br><br>'
          + '<span style="font-size:11.5px;color:#4B5563;word-break:break-all;">' + _esc(link) + '</span><br><br>'
          + (directe
              ? 'Cada persona lo abre, pone su nombre y hace el test en 3 minutos. El resultado te llega <b>solo</b>, sin que tengan que enviarte nada.'
              : 'Cada persona lo abre, pone su nombre y hace el test en 3 minutos. Ahora mismo no hay conexión con la nube, así que al acabar te devolverán un <b>código</b> que tú pegas en Mi equipo. Si entras con tu cuenta, el resultado te llegará solo.');
  _seimianDiu('¿Cómo invito a mi equipo?', txt, function(){
    try {
      if(navigator.clipboard && navigator.clipboard.writeText){
        navigator.clipboard.writeText(link).then(function(){
          if(typeof showToast === 'function') showToast('Enlace copiado');
        }).catch(function(){});
      }
    } catch(e){}
  });
}

function openChat(withName){
  if(withName !== 'Seimian') window.__chatSeimian = false;
  let modal = document.getElementById('global-chat-modal');
  if(!modal){
    modal = document.createElement('div');
    modal.id = 'global-chat-modal';
    modal.style.cssText = 'position:fixed;inset:0;background:rgba(10,14,30,.5);display:flex;align-items:flex-end;justify-content:flex-end;z-index:10000;padding:20px;box-sizing:border-box;';
    modal.innerHTML = `
      <div style="background:white;border-radius:20px;width:380px;max-width:95vw;height:520px;max-height:85vh;display:flex;flex-direction:column;overflow:hidden;box-shadow:0 24px 60px rgba(0,0,0,.2);animation:slideUpChat .25s ease;">
        <style>@keyframes slideUpChat{from{transform:translateY(20px);opacity:0}to{transform:translateY(0);opacity:1}}</style>
        <!-- Header -->
        <div style="padding:14px 16px;border-bottom:1px solid #F3F4F6;display:flex;align-items:center;gap:10px;">
          <div style="width:36px;height:36px;border-radius:50%;background:#EEF2FF;display:flex;align-items:center;justify-content:center;font-size:14px;font-weight:800;color:#1A56DB;flex-shrink:0;" id="chat-avatar">MG</div>
          <div style="flex:1;">
            <div style="font-size:14px;font-weight:700;color:#111827;" id="chat-title">María García</div>
            <div style="display:flex;align-items:center;gap:5px;"><div style="width:7px;height:7px;border-radius:50%;background:#10B981;"></div><span style="font-size:11px;color:#6B7280;" id="chat-estado">Activa ahora</span></div>
          </div>
          <button onclick="document.getElementById('global-chat-modal').remove(); chatIdx=0;" style="background:none;border:none;width:30px;height:30px;border-radius:8px;cursor:pointer;color:#6B7280;font-size:16px;display:flex;align-items:center;justify-content:center;"><svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="display:inline-block;vertical-align:-0.15em;flex-shrink:0;"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg></button>
        </div>
        <!-- Mensajes -->
        <div id="chat-messages" style="flex:1;overflow-y:auto;padding:16px;display:flex;flex-direction:column;gap:8px;background:#FAFBFC;"></div>
        <!-- Typing indicator -->
        <div id="chat-typing" style="display:none;padding:0 16px 4px;">
          <div style="display:inline-flex;align-items:center;gap:4px;background:white;border-radius:12px;padding:8px 12px;box-shadow:0 1px 3px rgba(0,0,0,.06);">
            <span style="width:6px;height:6px;border-radius:50%;background:#9CA3AF;animation:bounce .9s infinite;display:inline-block;"></span>
            <span style="width:6px;height:6px;border-radius:50%;background:#9CA3AF;animation:bounce .9s .15s infinite;display:inline-block;"></span>
            <span style="width:6px;height:6px;border-radius:50%;background:#9CA3AF;animation:bounce .9s .3s infinite;display:inline-block;"></span>
            <style>@keyframes bounce{0%,100%{transform:translateY(0)}50%{transform:translateY(-4px)}}
/* Avis visual quan un numero salta d una frase a una altra */
@keyframes cercoIntercanvi {
  0%   { background:#FEF3C7; border-color:#F59E0B; }
  100% { background:transparent; border-color:inherit; }
}
.option.intercanvi { animation: cercoIntercanvi .9s ease-out; }
</style>
          </div>
        </div>
        <!-- Input -->
        <div style="padding:12px 14px;border-top:1px solid #F3F4F6;display:flex;gap:8px;align-items:center;">
          <input id="chat-input" type="text" placeholder="Escribe un mensaje..." style="flex:1;border:1.5px solid #E5E7EB;border-radius:999px;padding:9px 16px;font-size:13.5px;font-family:inherit;outline:none;transition:border .15s;" onfocus="this.style.borderColor='#1A56DB'" onblur="this.style.borderColor='#E5E7EB'">
          <button onclick="sendChatMsg()" style="background:#1A56DB;color:white;border:none;border-radius:50%;width:38px;height:38px;cursor:pointer;font-size:16px;display:flex;align-items:center;justify-content:center;flex-shrink:0;">↑</button>
        </div>
      </div>`;
    document.body.appendChild(modal);
    document.getElementById('chat-input').addEventListener('keydown', (e)=>{ if(e.key==='Enter') sendChatMsg(); });
    // Mensaje inicial (no si quien abre es Seimian: ese escribe el suyo)
    if(!window.__chatSeimian) setTimeout(()=> addChatMsg(CHAT_RESPONSES[0], 'them'), 400);
    chatIdx = 1;
  }
  const name = withName || 'María García';
  const initials = name.split(' ').map(w=>w[0]).join('').slice(0,2).toUpperCase();
  document.getElementById('chat-title').textContent = name;
  document.getElementById('chat-avatar').textContent = initials;
  modal.style.display = 'flex';
}

function addChatMsg(text, who){
  const msgs = document.getElementById('chat-messages');
  if(!msgs) return;
  const isMe = who === 'me';
  const div = document.createElement('div');
  div.style.cssText = `align-self:${isMe?'flex-end':'flex-start'};max-width:78%;`;
  div.innerHTML = `<div style="background:${isMe?'#1A56DB':'white'};color:${isMe?'white':'#111827'};border-radius:${isMe?'16px 16px 4px 16px':'16px 16px 16px 4px'};padding:10px 14px;font-size:13.5px;line-height:1.5;box-shadow:${isMe?'none':'0 1px 3px rgba(0,0,0,.06)'};">${text}</div>
  <div style="font-size:10.5px;color:#6B7280;margin-top:3px;text-align:${isMe?'right':'left'};">${isMe?'Tú':(document.getElementById('chat-title')?.textContent || 'Maria')} · ahora</div>`;
  msgs.appendChild(div);
  msgs.scrollTop = msgs.scrollHeight;
}

/* Seimian contesta amb el que sap de la clinica. No inventa xifres:
   si no te dades, ho diu. */
/* Respuestas antiguas de Seimian: solo se usan de respaldo si las nuevas fallan (clinica/11-seimian.js) */
function _respuestaSeimianAntigua(pregunta){
  var q = (pregunta||'').toLowerCase();
  var r;
  try { r = CDB.resumen(); } catch(e){ r = null; }
  if(!r) return 'Ahora mismo no puedo leer los datos de tu clínica. Prueba a recargar la página.';

  if(/equipo|plantilla|perfil|disc|composici/.test(q)){
    if(r.miembros === 0) return 'Todavía no hay ningún test hecho, así que no puedo decirte nada de tu equipo. Empieza por el tuyo desde Mi cuenta.';
    if(r.miembros < 3)   return 'De momento tengo ' + r.miembros + ' test. Con menos de 3 personas cualquier lectura sería inventada. Pásales el enlace desde Mi equipo.';
    var c = r.comp, flojo = 'D', min = 101;
    ['D','I','S','C'].forEach(function(l){ if(c[l] < min){ min = c[l]; flojo = l; } });
    return 'Con ' + r.miembros + ' test: D ' + c.D + '%, I ' + c.I + '%, S ' + c.S + '%, C ' + c.C + '%. '
         + (min < 15 ? 'El perfil que más te falta es ' + CDB.NOMBRE[flojo] + ' (' + flojo + ').'
                     : 'Está bastante repartido, sin huecos claros.');
  }
  if(/oferta|publicar|puesto|vacante/.test(q)){
    return r.ofertas === 0
      ? 'No tienes ninguna oferta publicada. Cuando publiques una te diré qué perfil encaja mejor con ese puesto.'
      : 'Tienes ' + r.ofertas + ' oferta' + (r.ofertas>1?'s':'') + ', ' + r.activas + ' activa' + (r.activas===1?'':'s') + '.';
  }
  if(/candidat|curriculum|cv|encaje/.test(q)){
    return r.candidatos === 0
      ? 'Aún no has recibido candidatos. Los que ves en la pantalla de Candidatos son perfiles de ejemplo para enseñarte cómo los ordeno.'
      : 'Has recibido ' + r.candidatos + ' candidatos. Los tienes ordenados por encaje en la pantalla de Candidatos.';
  }
  if(/enlace|invitar|c[oó]digo|equipo test/.test(q)){
    return 'En Mi equipo tienes el enlace para tu gente. Lo abren, hacen el test y te devuelven un código que tú pegas ahí mismo.';
  }
  if(/hola|buenas|qu[eé] tal|hey/.test(q)){
    return 'Hola. Pregúntame por tu equipo, por una oferta o por los candidatos y te digo lo que veo.';
  }
  return 'De eso todavía no sé. Lo que sí puedo decirte: <b>qué perfil le falta a tu equipo</b>, '
       + 'cómo van <b>tus ofertas</b>, <b>tus candidatos</b>, o darte el <b>enlace</b> para que tu gente haga el test. '
       + 'Usa los botones de abajo y vamos seguros.';
}

function sendChatMsg(){
  const input = document.getElementById('chat-input');
  const text = input.value.trim();
  if(!text){ if(window.CERCO_avisoVacio) CERCO_avisoVacio(input); return; }
  if(chatTyping) return;
  addChatMsg(text, 'me');
  input.value = '';
  chatTyping = true;
  // Mostrar indicador de escritura
  const typing = document.getElementById('chat-typing');
  if(typing) typing.style.display = 'block';
  const delay = 800 + Math.random() * 1200;
  setTimeout(()=>{
    if(typing) typing.style.display = 'none';
    const response = window.__chatSeimian
      ? respuestaSeimian(text)
      : CHAT_RESPONSES[chatIdx % CHAT_RESPONSES.length];
    chatIdx++;
    addChatMsg(response, 'them');
    if(window.__chatSeimian && typeof _dreceresSeimian === 'function') _dreceresSeimian();
    chatTyping = false;
  }, delay);
}
} catch(e) { console.error('Error inicialitzant una secció:', e); }
