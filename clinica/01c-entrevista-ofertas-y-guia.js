/* Entrevista de ejemplo, «Mis ofertas», bienvenida y guía de la app.
   Parte del antiguo clinica/01-panel.js (Fase 1, paso 1.6b). El orden de carga
   importa: los archivos 01a…01i se cargan uno detrás de otro, como antes. */
// ===== entrevista =====
let selectedSlot_entrevista = null;
document.querySelectorAll('#screen-entrevista .slot').forEach(slot=>{
  slot.addEventListener('click', ()=>{
    document.querySelectorAll('#screen-entrevista .slot').forEach(s=>s.classList.remove('selected'));
    slot.classList.add('selected');
    selectedSlot_entrevista = slot.textContent;
    const btn = document.getElementById('btn-confirm-entrevista');
    btn.disabled = false;
    btn.textContent = 'Confirmar entrevista a les ' + selectedSlot_entrevista;
  });
});
document.querySelectorAll('#screen-entrevista .day-tab').forEach(tab=>{
  tab.addEventListener('click', ()=>{
    document.querySelectorAll('#screen-entrevista .day-tab').forEach(t=>t.classList.remove('active'));
    tab.classList.add('active');
    document.querySelectorAll('#screen-entrevista .slot').forEach(s=>s.classList.remove('selected'));
    selectedSlot_entrevista = null;
    const btn = document.getElementById('btn-confirm-entrevista');
    btn.disabled = true;
    btn.textContent = 'Selecciona una franja para confirmar';
  });
});
function confirmInterview_entrevista(){
  if(!selectedSlot_entrevista) return;
  document.getElementById('confirm-box-entrevista').classList.add('show');
  document.getElementById('btn-confirm-entrevista').innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="display:inline-block;vertical-align:-0.15em;flex-shrink:0;"><path d="M20 6 9 17l-5-5"/></svg> Hora reservada';

  // Quan i com: sense prometre cap avis que no enviem
  var quan = document.getElementById('entrevista-cuando');
  if(quan){
    var dia = '';
    try { if(typeof calSelectedDay !== 'undefined' && calSelectedDay) dia = String(calSelectedDay); } catch(e){}
    quan.innerHTML = (dia ? 'Día <b>' + dia + '</b> a las <b>' + selectedSlot_entrevista + '</b>.' : 'A las <b>' + selectedSlot_entrevista + '</b>.');
  }

  // Recordem com la va fer l ultima vegada
  try {
    var prop = localStorage.getItem('cerco_entrevista_propio');
    if(prop && !usaEnlacePropio) alternarEnlacePropio();
    var g = localStorage.getItem('cerco_entrevista_link');
    var inp = document.getElementById('entrevista-link');
    if(g && inp && !inp.value) inp.value = g;
    var mg = localStorage.getItem('cerco_entrevista_modo');
    elegirModoEntrevista(mg || 'video');
  } catch(e){ elegirModoEntrevista('video'); }
  _pintarMensajeEntrevista();

  showToast('Hora reservada — copia el mensaje y envíaselo');
}
/* Com sera l entrevista. Per defecte, a la clinica: es el que fan
   gairebe sempre i aixi no ha de decidir res. */
var modoEntrevista = 'video';
var usaEnlacePropio = false;

/* La sala de la videotrucada.
   Fem servir Jitsi Meet: es obert, no demana compte a ningu i s obre
   al navegador. Per a un pilot va sobrat; el dia que hi hagi volum de
   debo, es canvia per un servei de pagament sense tocar res mes. */
function _nombreSala(){
  // El nom de la sala NO porta el nom de la clinica ni el del candidat:
  // l adreca d una sala circula per WhatsApp i acaba en llocs imprevisibles.
  // Nomes lletres a l atzar: 20 caracters, impossible d endevinar.
  var az = '';
  var letras = 'abcdefghijkmnpqrstuvwxyz23456789';
  var n = 20;
  try {
    if(window.crypto && crypto.getRandomValues){
      var a = new Uint32Array(n);
      crypto.getRandomValues(a);
      for(var i=0;i<n;i++) az += letras.charAt(a[i] % letras.length);
      return 'cerco-' + az;
    }
  } catch(e){}
  for(var j=0;j<n;j++) az += letras.charAt(Math.floor(Math.random()*letras.length));
  return 'cerco-' + az;
}

function _salaGuardada(){
  try { return localStorage.getItem('cerco_sala_entrevista') || ''; } catch(e){ return ''; }
}

function salaEntrevista(){
  var u = _salaGuardada();
  if(!u){
    u = 'https://meet.jit.si/' + _nombreSala();
    try { localStorage.setItem('cerco_sala_entrevista', u); } catch(e){}
  }
  return u;
}

function nuevaSalaEntrevista(){
  var u = 'https://meet.jit.si/' + _nombreSala();
  try { localStorage.setItem('cerco_sala_entrevista', u); } catch(e){}
  _pintarSala();
  _pintarMensajeEntrevista();
  if(typeof showToast === 'function') showToast('Sala nueva creada');
}

function abrirSalaEntrevista(){
  var u = salaEntrevista();
  try { window.open(u, '_blank', 'noopener'); } catch(e){}
}

function _pintarSala(){
  var e = document.getElementById('ent-sala-url');
  if(e) e.textContent = salaEntrevista().replace(/^https?:\/\//,'');
}

function alternarEnlacePropio(){
  usaEnlacePropio = !usaEnlacePropio;
  var b = document.getElementById('ent-bloc-propio');
  var t = document.getElementById('ent-propio-toggle');
  if(b) b.style.display = usaEnlacePropio ? 'block' : 'none';
  if(t) t.textContent = usaEnlacePropio ? 'Usar la sala que me ha creado CERCO' : 'Prefiero usar mi Meet o mi Zoom';
  try { localStorage.setItem('cerco_entrevista_propio', usaEnlacePropio ? '1' : ''); } catch(e){}
  _pintarMensajeEntrevista();
}

/* Quin enllac va al missatge: el seu si n ha posat, si no el de CERCO */
function _enlaceEntrevista(){
  if(usaEnlacePropio){
    var i = document.getElementById('entrevista-link');
    return i ? (i.value||'').trim() : '';
  }
  return salaEntrevista();
}

function elegirModoEntrevista(m){
  modoEntrevista = m;
  document.querySelectorAll('.ent-modo').forEach(function(b){
    b.classList.toggle('activo', b.dataset.modo === m);
  });
  var v = document.getElementById('ent-bloc-video');
  if(v) v.style.display = (m === 'video') ? 'block' : 'none';
  if(m === 'video') _pintarSala();
  try { localStorage.setItem('cerco_entrevista_modo', m); } catch(e){}
  _pintarMensajeEntrevista();
}

function _avisarPegarEnlace(){
  var av = document.getElementById('entrevista-link-aviso');
  if(av){
    av.style.color = '#1A56DB';
    av.textContent = 'Se ha abierto en otra pestaña. Copia la dirección de arriba y vuelve aquí.';
  }
}

/* El missatge ja escrit: aixo es el que li estalvia la feina de debo. */
/* Si l ha tocat, no li tornem a escriure mai a sobre. */
var mensajeEditadoAMano = false;

function _mensajeTocadoAMano(){
  mensajeEditadoAMano = true;
  var r = document.getElementById('ent-restablir');
  if(r) r.style.display = 'inline';
  try {
    var c = document.getElementById('ent-mensaje');
    if(c) localStorage.setItem('cerco_mensaje_entrevista', c.value || '');
  } catch(e){}
}

function _restablecerMensaje(){
  mensajeEditadoAMano = false;
  try { localStorage.removeItem('cerco_mensaje_entrevista'); } catch(e){}
  var r = document.getElementById('ent-restablir');
  if(r) r.style.display = 'none';
  _pintarMensajeEntrevista();
  if(typeof showToast === 'function') showToast('Texto restablecido');
}

/* La frase surt del mateix calcul que les estadistiques (CDB.composicion),
   aixi que mai pot dir una cosa diferent del que hi ha al grafic. */
function _fraseQueFalta(d){
  if(!d || !d.fiable) return '';
  var comp = d.comp || {};
  var min = comp[d.falta];

  // Si n hi ha mes d un al minim, els diem tots
  var iguals = ['D','I','S','C'].filter(function(l){ return comp[l] === min; });

  // Si els quatre estan igual no en falta cap: l equip esta repartit
  if(iguals.length === 4) return 'Tu equipo está repartido entre los cuatro perfiles, sin huecos claros. ';

  var noms = iguals.map(function(l){ return '<b>' + (_NOMDISC[l] || l) + ' (' + l + ')</b>'; });
  // "ni" darrere d una negacio, "y" a la resta
  var unir = function(union){
    return noms.length > 1 ? noms.slice(0,-1).join(', ') + ' ' + union + ' ' + noms[noms.length-1] : noms[0];
  };

  if(min === 0) return 'En tu equipo no hay nadie con perfil ' + unir('ni') + '. ';

  return (noms.length > 1)
    ? 'Los perfiles menos presentes en tu equipo son ' + unir('y') + ', con un ' + min + '% cada uno. '
    : 'El perfil menos presente en tu equipo es ' + unir('y') + ', un ' + min + '%. ';
}

function _pintarMensajeEntrevista(){
  var caja = document.getElementById('ent-mensaje');
  if(!caja) return;

  // El que ha escrit ell mana sobre el que proposem nosaltres
  if(mensajeEditadoAMano) return;
  try {
    var guardat = localStorage.getItem('cerco_mensaje_entrevista');
    if(guardat){
      caja.value = guardat;
      mensajeEditadoAMano = true;
      var rr = document.getElementById('ent-restablir');
      if(rr) rr.style.display = 'inline';
      return;
    }
  } catch(e){}

  var nom = 'Hola';
  try {
    var el = document.querySelector('#screen-candidat .cand-name, #screen-candidat .cand-name-overlay');
    // Mai el nom de la fitxa d exemple: si no hi ha candidat de veritat,
    // el missatge es queda amb un "Hola" i prou.
    var esMostra = el && (el.getAttribute('data-mostra') === '1'
                          || el.closest('.ejemplo') || el.closest('.aviso-muestra'));
    var enReal = document.body.classList.contains('solo-real');
    if(el && !(enReal && esMostra)){
      var n = (el.textContent||'').split(',')[0].trim().split(/\s+/)[0];
      if(n) nom = 'Hola ' + n;
    }
  } catch(e){}

  var clinica = 'nuestra clínica';
  var direccion = '';
  try {
    var c = CDB.clinica() || {};
    if(c.nom) clinica = c.nom;
    direccion = c.direccion || c.ciutat || '';
  } catch(e){}

  var cuando = '';
  try {
    var mes = ((document.getElementById('cal-month-label')||{}).textContent || '').split(' ')[0].toLowerCase();
    var partes = [];
    if(typeof calSelectedDay !== 'undefined' && calSelectedDay) partes.push('el ' + calSelectedDay + (mes ? ' de ' + mes : ''));
    if(selectedSlot_entrevista) partes.push('a las ' + selectedSlot_entrevista);
    cuando = partes.join(' ');
  } catch(e){}

  var donde;
  if(modoEntrevista === 'video'){
    var l = _enlaceEntrevista();
    donde = l
      ? ('Es por videollamada. Entra desde aquí a esa hora — se abre en el navegador, no tienes que instalar nada:\n' + l)
      : 'Será por videollamada; te paso el enlace en cuanto lo tenga.';
  } else if(modoEntrevista === 'tel'){
    donde = 'Te llamo yo por teléfono a esa hora.';
  } else {
    donde = 'Te esperamos en ' + clinica + (direccion ? ' (' + direccion + ')' : '') + '.';
  }

  caja.value = nom + ',\n\nTe confirmamos la entrevista ' + (cuando || 'en la hora acordada').replace(/\s+/g,' ').trim() + '.\n'
    + donde + '\n\nCualquier cosa, dímelo por aquí. ¡Hasta entonces!';
}

function copiarMensajeEntrevista(){
  var caja = document.getElementById('ent-mensaje');
  var txt = caja ? (caja.value || '').trim() : '';
  if(!txt){
    if(typeof showToast === 'function') showToast('Primero reserva una hora');
    return;
  }
  if(navigator.clipboard && navigator.clipboard.writeText){
    navigator.clipboard.writeText(txt).then(function(){
      if(typeof showToast === 'function') showToast('Mensaje copiado — pégaselo por WhatsApp');
    }).catch(function(){
      try{ caja.select(); document.execCommand('copy');
        if(typeof showToast === 'function') showToast('Mensaje copiado'); }catch(e){}
    });
  } else {
    try{ caja.select(); document.execCommand('copy');
      if(typeof showToast === 'function') showToast('Mensaje copiado'); }catch(e){}
  }
}

/* L enllac de la videotrucada es el de l empresari. CERCO no en fabrica
   cap: nomes el guarda i el deixa a ma quan toca. */
function guardarEnlaceEntrevista(){
  var inp = document.getElementById('entrevista-link');
  var av  = document.getElementById('entrevista-link-aviso');
  if(!inp) return;
  var v = (inp.value || '').trim();
  try { localStorage.setItem('cerco_entrevista_link', v); } catch(e){}
  if(!av) return;
  if(!v){
    av.style.color = '#6B7280';
    av.textContent = 'Cuando lo pegues, te lo guardo y podrás copiarlo para enviárselo.';
  } else if(!/^https?:\/\/|^[a-z0-9.-]+\.[a-z]{2,}/i.test(v)){
    av.style.color = '#B45309';
    av.textContent = 'Eso no parece un enlace. Pega la dirección completa de la reunión.';
  } else {
    av.style.color = '#0B6B4F';
    av.textContent = 'Guardado. Ya está en el mensaje de abajo.';
  }
  _pintarMensajeEntrevista();
}

function copyInterviewLink(){
  var inp = document.getElementById('entrevista-link');
  var v = inp ? (inp.value||'').trim() : '';
  if(!v){
    if(typeof showToast === 'function') showToast('Primero pega el enlace de tu reunión');
    if(inp){ try{ inp.focus(); }catch(e){} }
    return;
  }
  if(navigator.clipboard && navigator.clipboard.writeText){
    navigator.clipboard.writeText(v).then(function(){
      if(typeof showToast === 'function') showToast('Enlace copiado');
    }).catch(function(){});
  }
}
const questionPool_entrevista = [
  {q:"Cuando tuviste que aprender algo nuevo rápidamente en el trabajo, ¿cómo lo afrontaste?", why:"Comprueba adaptabilidad real"},
  {q:"Describe un momento en que tuviste que dar una mala noticia a un paciente.", why:"Evalúa comunicación en situaciones difíciles"},
  {q:"¿Cómo te coordinas con compañeros cuando hay desacuerdo sobre un procedimiento?", why:"Mide trabajo en equipo bajo tensión"},
  {q:"¿Qué harías si un paciente se queja del trato recibido por un compañero delante tuyo?", why:"Evalúa criterio y discreción profesional"},
  {q:"Explica una decisión que tomaste sola sin consultar a nadie. ¿Cómo fue?", why:"Mide autonomía real"},
];
function regenQuestions_entrevista(){
  const container = document.getElementById('ai-questions-entrevista');
  const shuffled = [...questionPool_entrevista].sort(()=>Math.random()-0.5).slice(0,3);
  container.innerHTML = shuffled.map((item,i)=>`
    <div class="ai-q-item">
      <div class="ai-q-num">${i+1}</div>
      <div>
        <div class="ai-q-text">${item.q}</div>
        <div class="ai-q-why">${item.why}</div>
      </div>
    </div>`).join('');
}



// ===== ofertas =====



// ===== benvinguda =====
let currentWelcomeSlide = 0;
const totalWelcomeSlides = 4;
function showWelcomeSlide(n){
  document.querySelectorAll('#screen-benvinguda .welcome-slide').forEach(s=>{
    s.classList.toggle('active', parseInt(s.dataset.slide) === n);
  });
  document.querySelectorAll('#screen-benvinguda .w-dot').forEach(d=>{
    d.classList.toggle('active', parseInt(d.dataset.slide) === n);
  });
  const btn = document.getElementById('welcome-next-btn');
  if(btn) btn.textContent = (n === totalWelcomeSlides - 1) ? 'Empieza ahora' : 'Siguiente';
  const backBtn = document.getElementById('welcome-back-btn');
  const skipBtn = document.querySelector('#screen-benvinguda .btn-skip:not(#welcome-back-btn)');
  if(backBtn){
    backBtn.style.display = (n === 0) ? 'none' : 'block';
    if(skipBtn) skipBtn.style.display = (n === 0) ? 'block' : 'none';
  }
}
function nextWelcomeSlide(){
  if(currentWelcomeSlide < totalWelcomeSlides - 1){
    currentWelcomeSlide++;
    showWelcomeSlide(currentWelcomeSlide);
  } else {
    showScreen('ofertes');
    setTimeout(()=> startTour_ofertes(), 500);
    currentWelcomeSlide = 0;
    showWelcomeSlide(0);
  }
}
function prevWelcomeSlide(){
  if(currentWelcomeSlide > 0){
    currentWelcomeSlide--;
    showWelcomeSlide(currentWelcomeSlide);
  }
}



// ===== tour contextual (estil Hireflix) =====
var tourSteps_ofertes = [
  { selector: null, title: "Seimian",
    text: "Te enseño cómo funciona CERCO en un par de minutos. Empezamos por tu panel y acabamos en las herramientas.", center: true, screen: 'ofertes' },
  { selector: '.btn-new', title: "Tu panel · Nueva oferta",
    text: "Aquí creas una oferta en menos de un minuto. Empieza por aquí cada vez que necesites contratar a alguien.", pos: 'bottom', screen: 'ofertes' },
  { selector: '.glance-strip', title: "Tu panel · Resumen",
    text: "De un vistazo: ofertas activas, candidatos totales y cuántos esperan respuesta. Sin entrar en ningún sitio.", pos: 'bottom', screen: 'ofertes' },
  { selector: '.board-col', title: "Tu panel · Las tres columnas",
    text: "Tus ofertas se ordenan en tres columnas: Activas, Pausadas y Cerradas. Así sabes en todo momento en qué punto está cada una.", pos: 'right', screen: 'ofertes' },

  { selector: null, title: "Centro de herramientas",
    text: "Ahora las herramientas. Son nueve y te las explico una por una para que sepas cuándo usar cada una.", center: true, screen: 'herramientas' },

  { selector: '#tc-portal', title: "1 · Buscar candidatos",
    text: "El portal con todos los candidatos, ordenados por encaje real con tu oferta. Filtras por nombre, especialidad, perfil DISC o zona de España.", pos: 'bottom', screen: 'herramientas' },
  { selector: '#tc-candidat', title: "2 · Ver encaje de un candidato",
    text: "Ves el vídeo y el CV a la vez, el resultado de su test y por qué le sale ese porcentaje. Todo explicado, sin misterios.", pos: 'bottom', screen: 'herramientas' },
  { selector: '#tc-testdisc', title: "3 · Test de personalidad DISC",
    text: "15 preguntas, tres minutos. Sin el test de tu equipo no podemos saber qué perfil os falta, así que este paso es imprescindible.", pos: 'bottom', screen: 'herramientas' },

  { selector: '#tc-stats', title: "4 · Análisis del equipo",
    text: "Seimian analiza la personalidad de toda tu plantilla y te dice qué perfil falta, para que sepas a quién buscar en la próxima contratación.", pos: 'bottom', screen: 'herramientas' },
  { selector: '#tc-crear-oferta', title: "5 · Redactar oferta con Seimian",
    text: "Escribes tres palabras y Seimian redacta la oferta entera. Además te propone dos combinaciones de perfil válidas para ese puesto.", pos: 'bottom', screen: 'herramientas' },
  { selector: '#tc-entrevista', title: "6 · Preguntas de entrevista",
    text: "Seimian prepara preguntas concretas según el perfil de cada candidato, para que la entrevista te diga lo que el CV no dice.", pos: 'bottom', screen: 'herramientas' },

  { selector: '#tc-ofertes', title: "7 · Mis ofertas",
    text: "El acceso rápido a tu panel, con las alertas de los candidatos que llevan más de 20 horas esperando respuesta.", pos: 'bottom', screen: 'herramientas' },
  { selector: '#tc-nueva', title: "8 · Publicar nueva oferta",
    text: "Publica una vacante nueva eligiendo qué perfiles buscas. Los candidatos te llegarán ya ordenados por encaje.", pos: 'bottom', screen: 'herramientas' },
  { selector: '#tc-publicat', title: "9 · Perfil de la clínica",
    text: "Es la página que ven los candidatos antes de decidir si te escriben. Cuanto más completa, mejores candidaturas recibes.", pos: 'bottom', screen: 'herramientas' },

  { selector: null, title: "Ya está",
    text: "Ya está. Si pulsas cualquier tarjeta se abre y te explica los pasos con detalle. Y Seimian lo tienes siempre en el botón de abajo a la derecha.", center: true, screen: 'herramientas' },
];
let tourIndex_ofertes = 0;

function ensureTourDom(){
  if(document.getElementById('tour-overlay')) return;
  const overlay = document.createElement('div');
  overlay.id = 'tour-overlay'; overlay.className = 'tour-overlay';
  document.body.appendChild(overlay);
  const hl = document.createElement('div');
  hl.id = 'tour-highlight'; hl.className = 'tour-highlight';
  document.body.appendChild(hl);
  const card = document.createElement('div');
  card.id = 'tour-card'; card.className = 'tour-card';
  card.innerHTML = `
    <div class="tour-card-header">
      <div class="tour-avatar" id="tour-avatar">S</div>
      <div class="tour-card-name" id="tour-card-name"></div>
      <button class="tour-card-close" onclick="endTour_ofertes()"><svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="display:inline-block;vertical-align:-0.15em;flex-shrink:0;"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg></button>
    </div>
    <div class="tour-card-text" id="tour-card-text"></div>
    <div class="tour-card-footer">
      <div class="tour-card-step" id="tour-card-step"></div>
      <div style="display:flex;gap:8px;">
        <button class="tour-card-next" id="tour-card-back" onclick="prevTourStep_ofertes()" style="background:#F4F6F9;color:#4B5563;">← Atrás</button>
        <button class="tour-card-next" id="tour-card-next" onclick="nextTourStep_ofertes()">Siguiente</button>
      </div>
    </div>`;
  document.body.appendChild(card);
}

/* La guia explica TOTS els passos, al mobil i a l ordinador.
   El que s arregla al mobil es que no s encalli: la targeta va
   fixa a baix i nomes es mou el cercle que marca on mirar. */
var _tourComplet = null;
var _tourToken = 0;

/* Qui fa scroll de veritat no es la finestra: es <main class="shell-main"> */
function _scrollerDe(el){
  var n = el.parentElement;
  while(n && n !== document.body){
    var st = window.getComputedStyle(n);
    if(/(auto|scroll)/.test(st.overflowY) && n.scrollHeight > n.clientHeight + 4) return n;
    n = n.parentElement;
  }
  return document.scrollingElement || document.documentElement;
}

/* La capcalera tapa la part de dalt: no hi posem el cercle a sota */
function _altCapcalera(){
  var alt = 0;
  try {
    var tot = document.querySelectorAll('body > div, .shell-topbar, header');
    for(var i=0;i<tot.length;i++){
      var e = tot[i], st = window.getComputedStyle(e), r = e.getBoundingClientRect();
      if(st.position === 'fixed' && r.top <= 1 && r.height > 8 && r.height < 120 && r.width > window.innerWidth*0.6){
        if(r.bottom > alt) alt = r.bottom;
      }
    }
  } catch(e){}
  return alt > 0 ? Math.round(alt) : 52;
}

/* Un telefon girat fa 844 px d ample: no es un ordinador */
function _esApaisatCurt(){
  try { return window.matchMedia('(orientation: landscape) and (max-height: 560px) and (max-width: 1024px)').matches; }
  catch(e){ return window.innerHeight <= 560 && window.innerWidth > window.innerHeight && window.innerWidth <= 1024; }
}

function _esMobil(){
  try { return window.matchMedia('(max-width: 600px)').matches || _esApaisatCurt(); }
  catch(e){ return window.innerWidth <= 600 || _esApaisatCurt(); }
}

function startTour_ofertes(){
  ensureTourDom();

  // Guardem la llista sencera un sol cop, i sempre la sencera
  if(!_tourComplet) _tourComplet = tourSteps_ofertes.slice();
  tourSteps_ofertes = _tourComplet.slice();

  tourIndex_ofertes = 0;
  document.body.classList.add('tour-obert');
  document.getElementById('tour-overlay').classList.add('show');
  renderTourStep_ofertes();
}
function endTour_ofertes(){
  document.body.classList.remove('tour-obert');
  document.getElementById('tour-overlay')?.classList.remove('show');
  document.getElementById('tour-highlight')?.classList.remove('show');
  document.getElementById('tour-card')?.classList.remove('show');
}
function renderTourStep_ofertes(){
  const step = tourSteps_ofertes[tourIndex_ofertes];
  const card = document.getElementById('tour-card');
  const hl = document.getElementById('tour-highlight');

  // Cambiar de pantalla si el paso lo requiere
  if(step.screen){
    const target = document.getElementById('screen-' + step.screen);
    if(target && target.style.display !== 'block'){
      if(window.showScreen) window.showScreen(step.screen);
      setTimeout(function(){ positionTourStep(); }, 260);
    }
  }

  _tourToken++;
  document.getElementById('tour-card-name').textContent = step.title;
  document.getElementById('tour-card-text').textContent = step.text;
  document.getElementById('tour-card-step').textContent = (tourIndex_ofertes+1) + ' de ' + tourSteps_ofertes.length;
  document.getElementById('tour-card-next').textContent = (tourIndex_ofertes === tourSteps_ofertes.length-1) ? 'Acabar' : 'Siguiente';
  const backBtn = document.getElementById('tour-card-back');
  if(backBtn) backBtn.style.display = (tourIndex_ofertes === 0) ? 'none' : 'block';

  positionTourStep();
}

function positionTourStep(){
  const step = tourSteps_ofertes[tourIndex_ofertes];
  const card = document.getElementById('tour-card');
  const hl = document.getElementById('tour-highlight');
  if(!card || !hl) return;

  // Al mobil la targeta viu a baix i no es mou mai: nomes es mou
  // el cercle que marca on has de mirar.
  if(_esMobil()){
    card.style.top = ''; card.style.left = ''; card.style.transform = '';
    card.classList.add('show');
    if(step.center || !step.selector){ hl.classList.remove('show'); return; }
    var scrM = step.screen ? ('#screen-' + step.screen + ' ') : '#screen-ofertes ';
    var tM = document.querySelector(scrM + step.selector) || document.querySelector(step.selector);
    if(!tM){ hl.classList.remove('show'); return; }

    // Mentre baixa no ensenyem res: si no, el cercle es veu a mig cami
    hl.classList.remove('show');
    _tourToken++;
    var meu = _tourToken;

    var sc = _scrollerDe(tM);

    // La franja lliure: sota la capcalera i sense trepitjar la targeta
    var cr    = card.getBoundingClientRect();
    var costat = _esApaisatCurt();            // la targeta va a la dreta
    var dalt  = _altCapcalera() + 10;
    var baix  = costat ? (window.innerHeight - 10) : (cr.top - 14);
    var dret  = costat ? (cr.left - 14) : (window.innerWidth - 8);
    var lliure = Math.max(90, baix - dalt);

    // L element va a la franja de dalt, no al centre (al centre hi ha la targeta)
    var rr = tM.getBoundingClientRect();
    var desti = dalt + Math.max(0, (lliure - Math.min(rr.height, lliure)) / 2);
    var maxSc = Math.max(0, sc.scrollHeight - sc.clientHeight);
    var fi = Math.max(0, Math.min(maxSc, sc.scrollTop + (rr.top - desti)));
    try { sc.scrollTo({top: fi, behavior: 'smooth'}); } catch(e){ sc.scrollTop = fi; }

    // Esperem que el scroll pari de veritat abans de mesurar
    var voltes = 0;
    (function esperarScroll(){
      if(meu !== _tourToken) return;              // ja ha canviat de pas
      voltes++;
      if(Math.abs(sc.scrollTop - fi) > 2 && voltes < 20){ setTimeout(esperarScroll, 55); return; }
      var r = tM.getBoundingClientRect();

      // Si el bloc es mes alt que la franja lliure, el cercle quedaria
      // com un rectangle enorme amb el contingut tallat per dalt i per
      // baix. En aquest cas no en dibuixem cap: el text ja ho explica.
      if(r.height > (baix - dalt) - 24){ hl.classList.remove('show'); return; }

      var t = Math.max(dalt - 6, r.top - 6);
      var b = Math.min(baix, r.bottom + 6);       // mai per sota de la targeta
      if(b - t < 30 || r.bottom < dalt){ hl.classList.remove('show'); return; }
      var l = Math.max(8, r.left - 6);
      var w = Math.min(dret - l, r.width + 12);
      if(w < 40){ hl.classList.remove('show'); return; }
      hl.style.top    = t + 'px';
      hl.style.left   = l + 'px';
      hl.style.width  = w + 'px';
      hl.style.height = (b - t) + 'px';
      hl.classList.add('show');
    })();
    return;
  }

  if(step.center || !step.selector){
    hl.classList.remove('show');
    card.style.top = '50%'; card.style.left = '50%'; card.style.transform = 'translate(-50%,-50%)';
    card.classList.add('show');
    return;
  }
  const scr = step.screen ? ('#screen-' + step.screen + ' ') : '#screen-ofertes ';
  const target = document.querySelector(scr + step.selector) || document.querySelector(step.selector);
  // Desplazar el elemento a la vista antes de medir
  if(target && target.scrollIntoView) target.scrollIntoView({block:'center', behavior:'auto'});
  if(!target){ card.style.top='50%'; card.style.left='50%'; card.style.transform='translate(-50%,-50%)'; card.classList.add('show'); hl.classList.remove('show'); return; }
  const rect = target.getBoundingClientRect();
  hl.style.top = (rect.top - 6) + 'px';
  hl.style.left = (rect.left - 6) + 'px';
  hl.style.width = (rect.width + 12) + 'px';
  hl.style.height = (rect.height + 12) + 'px';
  hl.classList.add('show');

  card.style.transform = 'none';
  const cardWidth = 280;
  const margin = 16;
  const maxLeft = window.innerWidth - cardWidth - margin;

  // Medir la altura real de la tarjeta antes de colocarla
  card.style.visibility = 'hidden';
  card.classList.add('show');
  const cardH = card.getBoundingClientRect().height || 190;
  card.style.visibility = '';

  const gap = 16;
  const vh = window.innerHeight;
  const spaceBelow = vh - rect.bottom - gap;
  const spaceAbove = rect.top - gap;
  const spaceRight = window.innerWidth - rect.right - gap;
  const spaceLeft  = rect.left - gap;

  let top, left;

  // Elegir el lado con espacio suficiente para NO tapar el elemento
  if(spaceBelow >= cardH){
    top = rect.bottom + gap;
    left = Math.max(margin, Math.min(rect.left, maxLeft));
  } else if(spaceAbove >= cardH){
    top = rect.top - cardH - gap;
    left = Math.max(margin, Math.min(rect.left, maxLeft));
  } else if(spaceRight >= cardWidth + margin){
    left = rect.right + gap;
    top = Math.max(margin, Math.min(rect.top, vh - cardH - margin));
  } else if(spaceLeft >= cardWidth + margin){
    left = rect.left - cardWidth - gap;
    top = Math.max(margin, Math.min(rect.top, vh - cardH - margin));
  } else {
    // Sin hueco a los lados: desplazar la página para abrir espacio debajo
    const needed = cardH + gap * 2;
    const main = document.querySelector('.shell-main') || document.scrollingElement;
    if(main && main.scrollBy) main.scrollBy(0, Math.max(0, needed - spaceBelow));
    const r2 = target.getBoundingClientRect();
    hl.style.top = (r2.top - 6) + 'px';
    hl.style.left = (r2.left - 6) + 'px';
    top = Math.min(r2.bottom + gap, vh - cardH - margin);
    left = Math.max(margin, Math.min(r2.left, maxLeft));
  }

  card.style.top = Math.max(margin, top) + 'px';
  card.style.left = left + 'px';
  card.classList.add('show');
}
function nextTourStep_ofertes(){
  if(tourIndex_ofertes < tourSteps_ofertes.length - 1){
    tourIndex_ofertes++;
    renderTourStep_ofertes();
  } else {
    endTour_ofertes();
  }
}
function prevTourStep_ofertes(){
  if(tourIndex_ofertes > 0){
    tourIndex_ofertes--;
    renderTourStep_ofertes();
  }
}
