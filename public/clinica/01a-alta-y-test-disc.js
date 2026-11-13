/* Alta de la clínica (onboarding) y test DISC del equipo y de la clínica.
   Parte del antiguo clinica/01-panel.js (Fase 1, paso 1.6b). El orden de carga
   importa: los archivos 01a…01i se cargan uno detrás de otro, como antes. */
try {

// ===== onboarding =====

const dots_onboarding = ['dot-1-onboarding','dot-2-onboarding','dot-3-onboarding'];
function setStepper_onboarding(n){
  dots_onboarding.forEach((id,i)=>{
    const el = document.getElementById(id);
    if(!el) return;
    el.classList.remove('active','done');
    if(i < n-1) el.classList.add('done');
    else if(i === n-1) el.classList.add('active');
  });
}
function goStep_onboarding(n){
  ['screen-1-onboarding','screen-2-onboarding','screen-test-onboarding','screen-results-onboarding','screen-4-onboarding'].forEach(id=>{const e=document.getElementById(id); if(e) e.style.display='none';});
  if(n===1) document.getElementById('screen-1-onboarding').style.display='block';
  if(n===2) document.getElementById('screen-2-onboarding').style.display='block';
  if(n===4){ var e4=document.getElementById('screen-4-onboarding'); if(e4) e4.style.display='block'; }
  setStepper_onboarding(n);
}
setStepper_onboarding(1);

function handleLogoUpload(input){
  const file = input.files && input.files[0];
  if(!file) return;
  if(!file.type.startsWith('image/')){
    if(typeof showToast==='function') showToast('Por favor, sube un archivo de imagen');
    return;
  }
  _reducirImagen(file, 400, function(dataUrl){
    if(!dataUrl){ if(typeof showToast==='function') showToast('No se ha podido leer la imagen'); return; }
    const box = document.getElementById('logo-upload-box');
    if(box){
      box.style.backgroundImage = "url('" + dataUrl + "')";
      box.style.backgroundSize = 'cover';
      box.style.backgroundPosition = 'center';
      box.style.color = 'transparent';
    }
    try { guardarCampoPerfil('logo', dataUrl); } catch(e){}
    if(typeof showToast==='function') showToast('Logo actualizado');
  });
}

function generateDescAI_onboarding(){
  const field = document.getElementById('f-desc-onboarding');
  const status = document.getElementById('desc-ai-status-onboarding');
  const raw = field.value.trim();
  if(!raw){
    status.textContent = "Escribe primero unas palabras clave (ej: 'joven, dinámico, formación').";
    status.style.color = '#DC2626';
    return;
  }
  status.textContent = 'Seimian lo está escribiendo…';
  status.style.color = '#6B7280';
  setTimeout(()=>{
    const keywords = raw.split(/[,.;\n]/).map(k=>k.trim()).filter(Boolean).map(k=>k.charAt(0).toLowerCase()+k.slice(1));
    const kwText = keywords.length > 1 ? keywords.slice(0,-1).join(', ') + ' y ' + keywords[keywords.length-1] : (keywords[0] || raw);
    field.value = `Así es trabajar con nosotros: ${kwText}. Cuidamos tanto al paciente como al equipo, y queremos que cada persona que entra pueda crecer y aportar lo mejor de sí misma.`;
    status.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#059669" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="display:inline-block;vertical-align:-0.15em;flex-shrink:0;"><path d="M21.801 10A10 10 0 1 1 17 3.335"/><path d="m9 11 3 3L22 4"/></svg> Texto preparado por Seimian a partir de tus palabras clave — puedes editarlo libremente.';
    status.style.color = '#0E9F6E';
  }, 900);
}

// ---------- DISC TEST DATA ----------
const blocks_onboarding = [
  {q:["Tomo decisiones rápidas, incluso bajo presión","Me gusta animar y motivar al equipo","Prefiero rutinas claras y previsibles","Reviso los detalles antes de dar algo por terminado"]},
  {q:["Me orienta más el resultado que el proceso","Conecto fácilmente con pacientes y compañeros nuevos","Soy la persona en quien el equipo confía para mantener la calma","Sigo protocolos y normas con rigor"]},
  {q:["No tengo miedo de decir las cosas directamente","Hablo mucho y me gusta que el ambiente sea distendido","Evito el conflicto y busco la armonía del grupo","Prefiero tenerlo todo documentado y ordenado"]},
  {q:["Me aburro si no tengo retos constantes","Se me ocurren ideas nuevas con facilidad","Soy constante y no abandono fácilmente una tarea","Analizo bien antes de actuar, no voy con prisas"]},
  {q:["Tomo el control cuando nadie lidera","Disfruto siendo el centro de atención en reuniones de equipo","Me adapto bien a los cambios si se hacen con tiempo y explicación","Me molesta trabajar con información incompleta"]},
  {q:["Quiero ver resultados ya, no esperar","Convenzo mejor hablando que escribiendo","Escucho más de lo que hablo","Prefiero la calidad a la velocidad"]},
  {q:["Asumo riesgos con facilidad","Creo en el poder de las relaciones personales","Necesito sentirme seguro/a antes de cambiar de método","Me cuesta delegar si no estoy seguro/a de que lo harán bien"]},
  {q:["Puedo ser percibido/a como impaciente","Me distraigo fácilmente con conversaciones sociales","Me cuesta decir que no","Soy crítico/a conmigo mismo/a y con los demás"]},
  {q:["Prefiero marcar yo el ritmo del día","Me gusta improvisar más que planificar al detalle","Valoro mucho la lealtad al equipo","Prefiero hechos y datos antes que opiniones"]},
  {q:["Compito, incluso en cosas pequeñas","Inspiro confianza fácilmente a primera vista","Soy paciente con pacientes/compañeros difíciles","Detecto errores que otros no ven"]},
  {q:["Voy directo al grano, sin rodeos","Me expreso con entusiasmo y gestos","Me cuesta trabajar bajo presión constante","Prefiero seguir un plan antes que improvisar"]},
  {q:["Asumo responsabilidad aunque sea difícil","Recuerdo nombres y detalles personales de la gente","Prefiero un entorno de trabajo estable y sin sorpresas","Verifico dos veces antes de entregar un trabajo"]},
  {q:["Me frustra la gente lenta para decidir","Prefiero trabajar acompañado/a que solo/a","Soy de confianza, hago lo que prometo","Tengo estándares altos, a veces demasiado exigentes"]},
  {q:["Me gusta tener el control de la situación","Tengo facilidad para hacer reír o animar","Me adapto al ritmo de los demás sin quejarme","Me incomoda cuando no siguen el procedimiento correcto"]},
  {q:["Quiero verme a mí mismo/a como líder del equipo","Me motiva sentirme valorado/a por los demás","Soy el pilar estable cuando hay tensión en la clínica","Prefiero la precisión a la rapidez"]},
];
const LETTERS_onboarding = ["D","I","S","C"];
const COLORS_onboarding = {D:"#FF5A5F", I:"#F0A800", S:"#00B488", C:"#5B5FE0"};
const PROFILE_onboarding = {
  D:{name:"Dominante", desc:"Orientado/a a resultados, decidido/a y directo/a. Le motivan los retos y la autonomía."},
  I:{name:"Influyente", desc:"Comunicativo/a, entusiasta y hábil conectando con las personas. Aporta energía al equipo."},
  S:{name:"Estable", desc:"Paciente, fiable y constante. El pilar que mantiene la calma y la cohesión del equipo."},
  C:{name:"Concienzudo", desc:"Preciso/a, metódico/a y analítico/a. Cuida la calidad y el detalle por encima de todo."}
};

let current_onboarding = 0;
let answers_onboarding = [];
for(let i=0;i<blocks_onboarding.length;i++) answers_onboarding.push({most:null, least:null});

function startTest_onboarding(){
  document.getElementById('screen-2-onboarding').style.display='none';
  document.getElementById('screen-test-onboarding').style.display='block';
  renderBlock_onboarding();
}
function renderBlock_onboarding(){
  const b = blocks_onboarding[current_onboarding];
  const container = document.getElementById('options-container-onboarding');
  container.innerHTML = '';
  document.getElementById('err-msg-onboarding').textContent='';
  _discOrden('onboarding', blocks_onboarding.length)[current_onboarding].forEach((idx)=>{
    const text = b.q[idx];
    
    const div = document.createElement('div');
    div.className='option'; div.dataset.k = idx;
    const a = answers_onboarding[current_onboarding];
    div.innerHTML = `
      <div class="option-text">${text}</div>
      <div class="option-controls" style="display:flex;gap:6px;align-items:center;">
        <span style="font-size:10px;color:#6B7280;margin-right:2px;">Menos</span>
        ${[1,2,3,4].map(n=>`<button class="tag-btn ${a.scores&&a.scores[idx]===n?'active':''}" style="width:34px;height:34px;border-radius:50%;font-size:13px;font-weight:800;" onclick="setScoreDisc(${idx},${n},'onboarding')">${n}</button>`).join('')}
        <span style="font-size:10px;color:#6B7280;margin-left:2px;">Más</span>
      </div>`;
    container.appendChild(div);
  });
  document.getElementById('progress-label-onboarding').textContent = `Pregunta ${current_onboarding+1} de ${blocks_onboarding.length}`;
  const pct = Math.round(((current_onboarding+1)/blocks_onboarding.length)*100);
  document.getElementById('progress-pct-onboarding').textContent = pct+'%';
  document.getElementById('progress-fill-onboarding').style.width = pct+'%';
  var _bo = document.getElementById('btn-back-onboarding');
  _bo.style.visibility = 'visible';
  _bo.textContent = current_onboarding===0 ? '← Volver' : 'Atrás';
  document.getElementById('btn-next-onboarding').textContent = current_onboarding===blocks_onboarding.length-1 ? 'Ver resultado' : 'Continuar';
}
function setAnswer_onboarding(idx, type){
  const a = answers_onboarding[current_onboarding];
  if(type==='most'){ if(a.least===idx) a.least=null; a.most = (a.most===idx) ? null : idx; }
  else { if(a.most===idx) a.most=null; a.least = (a.least===idx) ? null : idx; }
  renderBlock_onboarding();
}
function nextBlock_onboarding(){
  const a = answers_onboarding[current_onboarding];
  const nScored = a.scores ? Object.values(a.scores).filter(v=>v!==null&&v!==undefined).length : 0;
  if(nScored < 4){
    document.getElementById('err-msg-onboarding').textContent = 'Puntúa las 4 frases (del 1 al 4) antes de continuar.';
    return;
  }
  var _sg = CERCO_discSiguiente('onboarding', current_onboarding);
  if(_sg === -1){ showResults_onboarding(); return; }
  if(_sg !== null){ current_onboarding = _sg; renderBlock_onboarding(); return; }
  if(current_onboarding < blocks_onboarding.length-1){ current_onboarding++; renderBlock_onboarding(); }
  else { showResults_onboarding(); }
}
function prevBlock_onboarding(){
  if(current_onboarding>0){ current_onboarding--; renderBlock_onboarding(); return; }
  // A la primera pregunta, enrere vol dir sortir del test, no quedar-se encallat
  var t = document.getElementById('screen-test-onboarding'); if(t) t.style.display='none';
  goStep_onboarding(2);
}

/* Tornar del resultat a l ultima pregunta per poder-la repassar. */
function volverAlTest_onboarding(){
  current_onboarding = blocks_onboarding.length - 1;
  const r = document.getElementById('screen-results-onboarding'); if(r) r.style.display='none';
  const t = document.getElementById('screen-test-onboarding');    if(t) t.style.display='block';
  if(typeof setStepper_onboarding==='function') setStepper_onboarding(2);
  renderBlock_onboarding();
}

function showResults_onboarding(){
  const _r = CERCO_discCalc(answers_onboarding.map(a=>[0,1,2,3].map(k=>(a.scores||{})[k]||0)), LETTERS_onboarding);
  const scores = _r.p, norm = _r.norm;
  if(!_r.definido){ CERCO_discSinPerfil('onboarding', _r); return; }
  CERCO_discConPerfil('onboarding');
  const sorted = _r.ord.slice();
  const dominant = sorted[0], secondary = sorted[1];

  document.getElementById('screen-test-onboarding').style.display='none';
  document.getElementById('screen-results-onboarding').style.display='block';
  setStepper_onboarding(3);

  const badge = document.getElementById('badge-onboarding');
  badge.style.background = COLORS_onboarding[dominant];
  badge.textContent = `Perfil ${dominant}/${secondary}`;
  document.getElementById('result-name-onboarding').textContent = `${PROFILE_onboarding[dominant].name} con rasgo de ${PROFILE_onboarding[secondary].name.toLowerCase()}`;
  document.getElementById('result-desc-onboarding').textContent = PROFILE_onboarding[dominant].desc;

  const barsC = document.getElementById('bars-container-onboarding');
  barsC.innerHTML='';
  sorted.forEach(l=>{
    const row = document.createElement('div');
    row.className='bar-row';
    row.innerHTML = `
      <div class="bar-label"><span>${PROFILE_onboarding[l].name} (${l})</span><span>${norm[l]}%</span></div>
      <div class="bar-track"><div class="bar-fill" style="width:${norm[l]}%;background:${COLORS_onboarding[l]}"></div></div>`;
    barsC.appendChild(row);
  });

  try {
    localStorage.setItem('cerco_disc_empresa', JSON.stringify({dominant, secondary, norm}));
    try{ if(window.CDB) CDB.renderTodo(); }catch(e){}
  } catch(e){}
  if(typeof loadPersonalDiscIntoBadge === 'function') loadPersonalDiscIntoBadge();

  document.getElementById('insight-box-onboarding').innerHTML =
    `<b>Tu perfil como responsable:</b> ${PROFILE_onboarding[dominant].name} (${dominant}) con rasgos de ${PROFILE_onboarding[secondary].name} (${secondary}). Cuando tu equipo complete el test, te mostraremos qué color le falta para estar equilibrado y recomendaremos candidatos en consecuencia.`;
}


// ===== testdisc =====

// ---------- DATA: 15 blocks_testdisc, each with D/I/S/C phrases ----------
const blocks_testdisc = [
  {q:["Tomo decisiones rápidas, incluso bajo presión","Me gusta animar y motivar al equipo","Prefiero rutinas claras y previsibles","Reviso los detalles antes de dar algo por terminado"]},
  {q:["Me orienta más el resultado que el proceso","Conecto fácilmente con pacientes y compañeros nuevos","Soy la persona en quien el equipo confía para mantener la calma","Sigo protocolos y normas con rigor"]},
  {q:["No tengo miedo de decir las cosas directamente","Hablo mucho y me gusta que el ambiente sea distendido","Evito el conflicto y busco la armonía del grupo","Prefiero tenerlo todo documentado y ordenado"]},
  {q:["Me aburro si no tengo retos constantes","Se me ocurren ideas nuevas con facilidad","Soy constante y no abandono fácilmente una tarea","Analizo bien antes de actuar, no voy con prisas"]},
  {q:["Tomo el control cuando nadie lidera","Disfruto siendo el centro de atención en reuniones de equipo","Me adapto bien a los cambios si se hacen con tiempo y explicación","Me molesta trabajar con información incompleta"]},
  {q:["Quiero ver resultados ya, no esperar","Convenzo mejor hablando que escribiendo","Escucho más de lo que hablo","Prefiero la calidad a la velocidad"]},
  {q:["Asumo riesgos con facilidad","Creo en el poder de las relaciones personales","Necesito sentirme seguro/a antes de cambiar de método","Me cuesta delegar si no estoy seguro/a de que lo harán bien"]},
  {q:["Puedo ser percibido/a como impaciente","Me distraigo fácilmente con conversaciones sociales","Me cuesta decir que no","Soy crítico/a conmigo mismo/a y con los demás"]},
  {q:["Prefiero marcar yo el ritmo del día","Me gusta improvisar más que planificar al detalle","Valoro mucho la lealtad al equipo","Prefiero hechos y datos antes que opiniones"]},
  {q:["Compito, incluso en cosas pequeñas","Inspiro confianza fácilmente a primera vista","Soy paciente con pacientes/compañeros difíciles","Detecto errores que otros no ven"]},
  {q:["Voy directo al grano, sin rodeos","Me expreso con entusiasmo y gestos","Me cuesta trabajar bajo presión constante","Prefiero seguir un plan antes que improvisar"]},
  {q:["Asumo responsabilidad aunque sea difícil","Recuerdo nombres y detalles personales de la gente","Prefiero un entorno de trabajo estable y sin sorpresas","Verifico dos veces antes de entregar un trabajo"]},
  {q:["Me frustra la gente lenta para decidir","Prefiero trabajar acompañado/a que solo/a","Soy de confianza, hago lo que prometo","Tengo estándares altos, a veces demasiado exigentes"]},
  {q:["Me gusta tener el control de la situación","Tengo facilidad para hacer reír o animar","Me adapto al ritmo de los demás sin quejarme","Me incomoda cuando no siguen el procedimiento correcto"]},
  {q:["Quiero verme a mí mismo/a como líder del equipo","Me motiva sentirme valorado/a por los demás","Soy el pilar estable cuando hay tensión en la clínica","Prefiero la precisión a la rapidez"]},
];
const LETTERS_testdisc = ["D","I","S","C"];
const COLORS_testdisc = {D:"#FF5A5F", I:"#F0A800", S:"#00B488", C:"#5B5FE0"};
const PROFILE_testdisc = {
  D:{name:"Dominante", desc:"Orientado/a a resultados, decidido/a y directo/a. Le motivan los retos y la autonomía."},
  I:{name:"Influyente", desc:"Comunicativo/a, entusiasta y hábil conectando con las personas. Aporta energía al equipo."},
  S:{name:"Estable", desc:"Paciente, fiable y constante. El pilar que mantiene la calma y la cohesión del equipo."},
  C:{name:"Concienzudo", desc:"Preciso/a, metódico/a y analítico/a. Cuida la calidad y el detalle por encima de todo."}
};

let current_testdisc = 0;
let answers_testdisc = []; // {most: idx|null, least: idx|null}
for(let i=0;i<blocks_testdisc.length;i++) answers_testdisc.push({most:null, least:null});

function startTest_testdisc(){
  document.getElementById('screen-intro-testdisc').style.display='none';
  document.getElementById('screen-test-testdisc').style.display='block';
  renderBlock_testdisc();
}

function renderBlock_testdisc(){
  const b = blocks_testdisc[current_testdisc];
  const container = document.getElementById('options-container-testdisc');
  container.innerHTML = '';
  document.getElementById('err-msg-testdisc').textContent='';
  // Format numèric: 1=Menos identificado, 4=Más identificado
  const a = answers_testdisc[current_testdisc];
  _discOrden('testdisc', blocks_testdisc.length)[current_testdisc].forEach((idx)=>{
    const text = b.q[idx];
    
    const div = document.createElement('div');
    div.className='option'; div.dataset.k = idx;
    const val = a.scores ? (a.scores[idx] || null) : null;
    div.innerHTML = `
      <div class="option-text">${text}</div>
      <div class="option-controls" style="display:flex;gap:6px;align-items:center;">
        <span style="font-size:10px;color:#6B7280;margin-right:2px;">Menos</span>
        ${[1,2,3,4].map(n=>`<button class="tag-btn ${val===n?'active':''}" style="width:34px;height:34px;border-radius:50%;font-size:13px;font-weight:800;" onclick="setScoreDisc(${idx},${n},'testdisc')">${n}</button>`).join('')}
        <span style="font-size:10px;color:#6B7280;margin-left:2px;">Más</span>
      </div>`;
    container.appendChild(div);
  });
  document.getElementById('progress-label-testdisc').textContent = `Pregunta ${current_testdisc+1} de ${blocks_testdisc.length}`;
  const pct = Math.round(((current_testdisc+1)/blocks_testdisc.length)*100);
  document.getElementById('progress-pct-testdisc').textContent = pct+'%';
  document.getElementById('progress-fill-testdisc').style.width = pct+'%';
  var _bt = document.getElementById('btn-back-testdisc');
  _bt.style.visibility = 'visible';
  _bt.textContent = current_testdisc===0 ? '← Volver' : 'Atrás';
  document.getElementById('btn-next-testdisc').textContent = current_testdisc===blocks_testdisc.length-1 ? 'Ver resultado' : 'Continuar';
}


/* El cálculo del test DISC está en src/comun/disc.js (compartido por los dos lados). */
var CERCO_DISC_PLANA = 'Has puesto la misma nota a las cuatro, así que esta pregunta no contará. Si alguna te describe un poco más, súbele la nota.';
var CERCO_DISC_FLOJO = 'Tu resultado sale poco definido: has dado notas muy parecidas a casi todo. Si quieres, vuelve atrás y marca más la diferencia entre lo que es muy tú y lo que no.';

/* Ahora se puede repetir número: solo guardamos la nota. */
function _asignarPuntuacionUnica(scores, idx, score){
  scores[idx] = score;
  return null;
}
function _discResp(ctx){ return ctx === 'onboarding' ? answers_onboarding : answers_testdisc; }
function _discPlanas(ctx){
  var l = []; _discResp(ctx).forEach(function(a, i){ if(a.scores && _discPlana(a.scores)) l.push(i); }); return l;
}
/* Al repasar solo se pasa por las preguntas que quedaron con las cuatro notas iguales. */
function CERCO_discSiguiente(ctx, cur){
  var z = window.__discSolo; if(!z || z.ctx !== ctx) return null;
  var sig = z.idx.filter(function(i){ return i > cur; })[0];
  if(sig === undefined){ window.__discSolo = null; return -1; }
  return sig;
}
function CERCO_discRepasar(ctx){
  var pl = _discPlanas(ctx);
  window.__discSolo = pl.length ? {ctx:ctx, idx:pl} : null;
  var r = document.getElementById('screen-results-'+ctx), t = document.getElementById('screen-test-'+ctx);
  if(r) r.style.display = 'none'; if(t) t.style.display = 'block';
  if(ctx === 'onboarding'){ current_onboarding = pl.length ? pl[0] : 0; try{ setStepper_onboarding(2); }catch(x){} renderBlock_onboarding(); }
  else { current_testdisc = pl.length ? pl[0] : 0; renderBlock_testdisc(); }
  window.scrollTo(0,0);
}
function CERCO_discConPerfil(ctx){
  var dsc = document.getElementById('result-desc-'+ctx); if(dsc) dsc.style.display = '';
  var bars = document.getElementById('bars-container-'+ctx); if(bars) bars.style.display = '';
  var fin = document.querySelector('#screen-results-'+ctx+' button[onclick*="saveCompanyToStorage"]'); if(fin) fin.style.display = '';
  var b = document.getElementById('btn-guardar-'+ctx); if(b) b.style.display = '';
  var f = document.querySelector('#screen-results-'+ctx+' .footnote'); if(f) f.style.display = '';
}
/* Notas casi iguales en todo: no inventamos un perfil. No se guarda ni cuenta para el equipo. */
function CERCO_discSinPerfil(ctx, r){
  var N = {D:'Dominante', I:'Influyente', S:'Estable', C:'Concienzudo'}, COL = {D:'#FF505A', I:'#F0A000', S:'#00B496', C:'#5B5FE0'};
  var t = document.getElementById('screen-test-'+ctx), res = document.getElementById('screen-results-'+ctx);
  if(t) t.style.display = 'none'; if(res) res.style.display = 'block';
  if(ctx === 'onboarding'){ try{ setStepper_onboarding(3); }catch(x){} }
  var g = function(id){ return document.getElementById(id+'-'+ctx); };
  var badge = g('badge'); if(badge){ badge.style.background = '#6B7280'; badge.textContent = '?'; }
  if(g('result-name')) g('result-name').textContent = 'Perfil sin definir';
  // Solo la frase «Perfil sin definir» y la opción de repasar (sin párrafo de explicación)
  if(g('result-desc')){ g('result-desc').textContent = ''; g('result-desc').style.display = 'none'; }
  var bars = g('bars-container'); if(bars){ bars.innerHTML = ''; bars.style.display = 'none'; }
  var n = _discPlanas(ctx).length, inv = false; try{ inv = !!(window.esModoInvitado && esModoInvitado()); }catch(x){}
  var caja = g('insight-box');
  if(caja) caja.innerHTML = '<button type="button" onclick="CERCO_discRepasar(\''+ctx+'\')" style="width:100%;background:#1A56DB;color:#fff;border:none;border-radius:10px;padding:13px;font:inherit;font-size:14.5px;font-weight:800;cursor:pointer;">'+(n ? 'Repasar '+n+' pregunta'+(n === 1 ? '' : 's')+(n <= 8 ? ' · 2 minutos' : '') : 'Repasar mis respuestas')+'</button>'
    + (inv || ctx === 'onboarding' ? '' : '<button type="button" onclick="showScreen(\'inicio\')" style="width:100%;margin-top:8px;background:#fff;color:#374151;border:1px solid #E5E7EB;border-radius:10px;padding:12px;font:inherit;font-size:13.5px;font-weight:700;cursor:pointer;">Ahora no</button>');
  if(ctx !== 'onboarding'){
    var b = g('btn-guardar'); if(b) b.style.display = 'none';
    var f = document.querySelector('#screen-results-'+ctx+' .footnote'); if(f) f.style.display = 'none';
  }
  // sin perfil no se puede terminar: solo repasar
  var fin = document.querySelector('#screen-results-'+ctx+' button[onclick*="saveCompanyToStorage"]'); if(fin) fin.style.display = 'none';
}
function _discOrden(ctx, n){
  window.__discOrd = window.__discOrd || {};
  if(!window.__discOrd[ctx] || window.__discOrd[ctx].length !== n) window.__discOrd[ctx] = CERCO_discBarajar(n);
  return window.__discOrd[ctx];
}
function _discPlana(scores){
  var v = [0,1,2,3].map(function(k){ return scores[k]; });
  return v.every(function(x){ return x !== null && x !== undefined && x === v[0]; });
}

/* Repinta nomes els botons, sense refer el HTML.
   Aixi la pagina no salta cap amunt i al mobil no es perd cap toc. */
function _repintarPuntuacions(ctxId, scores){
  var cont = document.getElementById('options-container-'+ctxId);
  if(!cont) return;
var opcions = cont.querySelectorAll('.option');
  for(var i=0;i<opcions.length;i++){
    var val = scores[opcions[i].dataset.k !== undefined ? +opcions[i].dataset.k : i];
    var bts = opcions[i].querySelectorAll('.tag-btn');
    for(var j=0;j<bts.length;j++){
      var n = j+1;
      if(val === n) bts[j].classList.add('active');
      else bts[j].classList.remove('active');
    }
  }
}

/* Quan un numero salta d una frase a l altra, ho ensenyem un moment
   perque l usuari entengui per que li ha canviat una cosa que no ha tocat. */
function _avisarIntercanvi(ctxId, idxAltra){
  if(idxAltra === null || idxAltra === undefined) return;
  var cont = document.getElementById('options-container-'+ctxId);
  if(!cont) return;
  var op = cont.querySelectorAll('.option')[idxAltra];
  if(!op) return;
  op.classList.remove('intercanvi');
  void op.offsetWidth;
  op.classList.add('intercanvi');
  setTimeout(function(){ if(op) op.classList.remove('intercanvi'); }, 900);
}

function setScoreDisc(idx, score, ctx){
  if(ctx==='onboarding'){
    const a = answers_onboarding[current_onboarding];
    if(!a.scores) a.scores = {};
    const mogut = _asignarPuntuacionUnica(a.scores, idx, score);
    let maxVal=-1, minVal=99, most=null, least=null;
    Object.keys(a.scores).forEach(k=>{
      if(a.scores[k]!==null){
        if(a.scores[k]>maxVal){maxVal=a.scores[k];most=parseInt(k);}
        if(a.scores[k]<minVal){minVal=a.scores[k];least=parseInt(k);}
      }
    });
    a.most=most; a.least=least;
    _repintarPuntuacions('onboarding', a.scores);
    _avisarIntercanvi('onboarding', mogut);
    const eo = document.getElementById('err-msg-onboarding');
    if(eo) eo.textContent = _discPlana(a.scores) ? CERCO_DISC_PLANA : '';
    return;
  }
  if(ctx==='testdisc'){
    const a = answers_testdisc[current_testdisc];
    if(!a.scores) a.scores = {};
    const mogut = _asignarPuntuacionUnica(a.scores, idx, score);
    // Recalcular most/least des dels scores per compatibilitat
    const scores = a.scores;
    let maxVal=-1, minVal=99, most=null, least=null;
    Object.keys(scores).forEach(k=>{
      if(scores[k]!==null){
        if(scores[k]>maxVal){maxVal=scores[k];most=parseInt(k);}
        if(scores[k]<minVal){minVal=scores[k];least=parseInt(k);}
      }
    });
    a.most=most; a.least=least;
    _repintarPuntuacions('testdisc', a.scores);
    _avisarIntercanvi('testdisc', mogut);
    const et = document.getElementById('err-msg-testdisc');
    if(et) et.textContent = _discPlana(a.scores) ? CERCO_DISC_PLANA : '';
  }
}
function setAnswer_testdisc(idx, type){
  const a = answers_testdisc[current_testdisc];
  if(type==='most'){
    if(a.least===idx) a.least=null;
    a.most = (a.most===idx) ? null : idx;
  } else {
    if(a.most===idx) a.most=null;
    a.least = (a.least===idx) ? null : idx;
  }
  renderBlock_testdisc();
}

function nextBlock_testdisc(){
  const a = answers_testdisc[current_testdisc];
  const nScored = a.scores ? Object.values(a.scores).filter(v=>v!==null&&v!==undefined).length : 0;
  if(nScored < 4){
    document.getElementById('err-msg-testdisc').textContent = 'Puntúa las 4 frases (del 1 al 4) antes de continuar.';
    if(window.verAviso) verAviso('err-msg-testdisc');
    return;
  }
  var _sg = CERCO_discSiguiente('testdisc', current_testdisc);
  if(_sg === -1){ showResults_testdisc(); return; }
  if(_sg !== null){ current_testdisc = _sg; renderBlock_testdisc(); return; }
  if(current_testdisc < blocks_testdisc.length-1){
    current_testdisc++;
    renderBlock_testdisc();
  } else {
    showResults_testdisc();
  }
}
function prevBlock_testdisc(){
  if(current_testdisc>0){ current_testdisc--; renderBlock_testdisc(); return; }
  // A la primera pregunta, enrere torna a la portada del test
  var t = document.getElementById('screen-test-testdisc');  if(t) t.style.display='none';
  var i = document.getElementById('screen-intro-testdisc'); if(i) i.style.display='block';
  window.scrollTo(0,0);
}

function showResults_testdisc(){
  const _r = CERCO_discCalc(answers_testdisc.map(a=>[0,1,2,3].map(k=>(a.scores||{})[k]||0)), LETTERS_testdisc);
  const scores = _r.p, norm = _r.norm;
  if(!_r.definido){ CERCO_discSinPerfil('testdisc', _r); return; }
  CERCO_discConPerfil('testdisc');
  const sorted = _r.ord.slice();
  const dominant = sorted[0], secondary = sorted[1];

  document.getElementById('screen-test-testdisc').style.display='none';
  document.getElementById('screen-results-testdisc').style.display='block';

  const badge = document.getElementById('badge-testdisc');
  badge.style.background = COLORS_testdisc[dominant];
  badge.textContent = `Perfil ${dominant}/${secondary}`;

  document.getElementById('result-name-testdisc').textContent = `${PROFILE_testdisc[dominant].name} con rasgo de ${PROFILE_testdisc[secondary].name.toLowerCase()}`;
  document.getElementById('result-desc-testdisc').textContent = PROFILE_testdisc[dominant].desc;

  try {
    localStorage.setItem('cerco_disc_individual', JSON.stringify({dominant, secondary, norm}));
    // Si qui fa el test es el responsable (no un treballador convidat),
    // aquest ES el seu perfil de l equip: ha de comptar a tot arreu.
    try {
      var _esInv = !!(window.esModoInvitado && esModoInvitado());
      if(!_esInv){
        localStorage.setItem('cerco_disc_empresa', JSON.stringify({dominant, secondary, norm}));
        if(window.CDB){ CDB.renderTodo(); }
        if(window._subirClinica) _subirClinica();
      }
    } catch(e){}
    try{ if(window.CDB && !window.esInvitado) CDB.renderTodo(); }catch(e){}
  } catch(e){}
  if(typeof loadPersonalDiscIntoBadge === 'function') loadPersonalDiscIntoBadge();

  const barsC = document.getElementById('bars-container-testdisc');
  barsC.innerHTML='';
  sorted.forEach(l=>{
    const row = document.createElement('div');
    row.className='bar-row';
    row.innerHTML = `
      <div class="bar-label"><span>${PROFILE_testdisc[l].name} (${l})</span><span>${norm[l]}%</span></div>
      <div class="bar-track"><div class="bar-fill" style="width:${norm[l]}%;background:${COLORS_testdisc[l]}"></div></div>`;
    barsC.appendChild(row);
  });

  // Si la persona ha llegado por un enlace de invitación, le damos su código
  let invitado = null, clinica = null;
  try {
    invitado = sessionStorage.getItem('cerco_invitado_nombre');
    clinica = sessionStorage.getItem('cerco_invitado_clinica');
  } catch(e){}

  if(invitado){
    const codigo = generarCodigoResultado(invitado, dominant, secondary, norm);
    var cid = null;
    try { cid = sessionStorage.getItem('cerco_invitado_cid'); } catch(e){}

    if(cid && window.Nube){
      // Lo enviamos a la clínica directamente. El código queda de reserva
      // por si la conexión falla.
      var caja = document.getElementById('insight-box-testdisc');
      caja.innerHTML = '<div style="font-size:13.5px;color:#374151;line-height:1.6;">Enviando tu resultado a <b>'
        + (clinica || 'tu clínica') + '</b>…</div>';
      // «Guardar y continuar» espera a que el resultado llegue de verdad a la clínica
      var btG = document.getElementById('btn-guardar-testdisc');
      window.__envioEquipo = 'enviando';
      if(btG){ btG.disabled = true; btG.textContent = 'Enviando…'; btG.style.opacity = '.6'; btG.style.cursor = 'default'; }
      var finEnvio = function(ok){
        window.__envioEquipo = ok ? 'ok' : 'error';
        if(!btG) return;
        btG.disabled = false; btG.textContent = 'Guardar y continuar'; btG.style.opacity = ''; btG.style.cursor = '';
        // Si no ha llegado, no se pasa a la pantalla de «ya está»: se queda con su código
        if(!ok) btG.style.display = 'none';
      };
      Nube.enviarResultado(cid, invitado, dominant, secondary, norm[dominant]).then(function(ok){
        finEnvio(!!ok);
        if(ok){
          caja.innerHTML =
            '<div style="background:#E8F8F1;border-radius:12px;padding:18px;text-align:center;">'
            + '<div style="font-size:15px;font-weight:800;color:#0E9F6E;margin-bottom:6px;">Ya está, ' + invitado.split(/\s+/)[0] + '</div>'
            + '<div style="font-size:13.5px;color:#374151;line-height:1.6;">Tu resultado ya le ha llegado a <b>'
            + (clinica || 'tu clínica') + '</b>. No tienes que hacer nada más.</div></div>';
        } else {
          caja.innerHTML = _cajaCodigoInvitado(invitado, clinica, codigo);
        }
      }).catch(function(){
        finEnvio(false);
        caja.innerHTML = _cajaCodigoInvitado(invitado, clinica, codigo);
      });
      return;
    }

    document.getElementById('insight-box-testdisc').innerHTML =
      '<div style="font-size:13px;color:#374151;line-height:1.6;margin-bottom:14px;">Ya está, <b>' + invitado + '</b>. Envía este código a <b>' + (clinica || 'tu responsable') + '</b> por WhatsApp para que pueda añadir tu perfil al equipo.</div>'
      + '<div style="background:#0F1C3F;border-radius:12px;padding:16px;text-align:center;margin-bottom:12px;">'
      + '<div style="font-size:10.5px;color:rgba(255,255,255,.5);letter-spacing:1px;margin-bottom:8px;">TU CÓDIGO</div>'
      + '<div id="codigo-resultado" style="font-size:20px;font-weight:800;color:white;letter-spacing:2px;font-family:ui-monospace,SFMono-Regular,Menlo,monospace;">' + codigo + '</div></div>'
      + '<button onclick="copiarCodigoResultado()" style="width:100%;background:#1A56DB;color:white;border:none;border-radius:10px;padding:12px;font-size:14px;font-weight:700;cursor:pointer;">Copiar código</button>';
  } else {
    document.getElementById('insight-box-testdisc').innerHTML =
      `<b>Para tu clínica:</b> tu perfil dominante es <b>${PROFILE_testdisc[dominant].name} (${dominant})</b>, combinado con rasgos de <b>${PROFILE_testdisc[secondary].name} (${secondary})</b>. Este resultado se utilizará para recomendarte candidatos que complementen tu equipo y para sugerir el perfil ideal según el rol que quieras cubrir.`;
  }
}

/* Caja con el código: solo si no hemos podido enviarlo por internet */
function _cajaCodigoInvitado(invitado, clinica, codigo){
  return '<div style="font-size:13px;color:#374151;line-height:1.6;margin-bottom:14px;">Ya está, <b>' + invitado
    + '</b>. No hemos podido enviarlo por internet, así que pásale este código a <b>'
    + (clinica || 'tu responsable') + '</b> por WhatsApp.</div>'
    + '<div style="background:#0F1C3F;border-radius:12px;padding:16px;text-align:center;margin-bottom:12px;">'
    + '<div style="font-size:10.5px;color:rgba(255,255,255,.5);letter-spacing:1px;margin-bottom:8px;">TU CÓDIGO</div>'
    + '<div id="codigo-resultado" style="font-size:20px;font-weight:800;color:white;letter-spacing:2px;font-family:ui-monospace,SFMono-Regular,Menlo,monospace;">' + codigo + '</div></div>'
    + '<button onclick="copiarCodigoResultado()" style="width:100%;background:#1A56DB;color:white;border:none;border-radius:10px;padding:12px;font-size:14px;font-weight:700;cursor:pointer;">Copiar código</button>';
}

function generarCodigoResultado(nombre, dom, sec, norm){
  const ini = nombre.trim().split(/\s+/).map(function(p){ return p.charAt(0).toUpperCase(); }).join('').slice(0,2);
  const pct = String(norm[dom]).padStart(2,'0');
  return ini + '-' + dom + sec + '-' + pct;
}
function copiarCodigoResultado(){
  const el = document.getElementById('codigo-resultado');
  if(!el) return;
  const txt = el.textContent;
  if(navigator.clipboard && navigator.clipboard.writeText){
    navigator.clipboard.writeText(txt).then(function(){ showToast('Código copiado — envíalo por WhatsApp'); });
  } else {
    showToast('Tu código es: ' + txt);
  }
}
} catch(e) { console.error('Error inicialitzant una secció:', e); }
