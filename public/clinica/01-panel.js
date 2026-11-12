/* Panel de la clínica: alta, test DISC, nube (Firebase), datos, navegación, ofertas, candidatos, Seimian… */
/* Archivo sacado tal cual de index.html (Fase 1, paso 1.6). El orden de carga
   importa: se carga en el mismo sitio de la página donde estaba. */
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
function _esc(t){ return String(t).replace(/[<>&]/g, function(c){ return {'<':'&lt;','>':'&gt;','&':'&amp;'}[c]; }); }

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
  if(!text || chatTyping) return;
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
      + '<div class="offer-cand-count">' + (parseInt(o.candidatos,10)||0) + ((parseInt(o.candidatos,10)||0) === 1 ? ' candidato' : ' candidatos') + '</div>'
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
/* ====================== CUENTAS: registro y sesión ======================
   Mientras no haya Firestore, la cuenta vive en este dispositivo.
   La estructura es la misma que usará Firebase Auth, para poder
   cambiarlo sin tocar las pantallas.
   ====================================================================== */
window.CAuth = {
  K:{ cuenta:'cerco_cuenta', sesion:'cerco_sesion' },
  _hash: function(t){
    var h = 5381;
    for(var i=0;i<t.length;i++){ h = ((h<<5)+h) ^ t.charCodeAt(i); }
    return (h>>>0).toString(36);
  },
  cuenta: function(){
    try{ return JSON.parse(localStorage.getItem(this.K.cuenta)||'null'); }catch(e){ return null; }
  },
  existe: function(){ var c=this.cuenta(); return !!(c && c.email); },
  // Compte creat per Google: no hi ha contrasenya nostra
  crearExterno: function(nombre, email){
    var c = { nombre:nombre, email:(email||'').toLowerCase(), pwd:'__google__',
              proveedor:'google', alta:new Date().toISOString() };
    try{ localStorage.setItem(this.K.cuenta, JSON.stringify(c)); }catch(e){}
    this.entrar();
    return c;
  },
  esDeGoogle: function(){ var c = this.cuenta(); return !!(c && c.proveedor === 'google'); },
  crear: function(nombre, email, pwd){
    var c = { nombre:nombre, email:email.toLowerCase(), pwd:this._hash(pwd), alta:new Date().toISOString() };
    try{ localStorage.setItem(this.K.cuenta, JSON.stringify(c)); }catch(e){}
    this.entrar();
    return c;
  },
  comprueba: function(email, pwd){
    var c = this.cuenta();
    if(!c) return 'sin-cuenta';
    if(c.email !== email.toLowerCase()) return 'email';
    if(c.pwd !== this._hash(pwd)) return 'pwd';
    return 'ok';
  },
  entrar: function(){ try{ localStorage.setItem(this.K.sesion,'1'); }catch(e){} },
  salir:  function(){ try{ localStorage.removeItem(this.K.sesion); }catch(e){} },
  activa: function(){ try{ return localStorage.getItem(this.K.sesion)==='1'; }catch(e){ return false; } }
};


/* Un avis que l'usuari no veu es un boto que sembla mort.
   Aquesta funcio l'escriu i s'assegura que quedi a la vista. */
window.verAviso = function(el){
  if(typeof el === 'string') el = document.getElementById(el);
  if(!el) return;
  var txt = (el.textContent || '').trim();
  if(!txt) return;
  try{
    var r = el.getBoundingClientRect();
    var fuera = r.top < 60 || r.bottom > (window.innerHeight - 20);
    if(fuera) el.scrollIntoView({behavior:'smooth', block:'center'});
  }catch(e){
    try{ el.scrollIntoView(); }catch(x){}
  }
  // parpelleig breu perque es noti
  try{
    el.style.transition = 'none';
    el.style.opacity = '0.25';
    setTimeout(function(){ el.style.transition='opacity .25s'; el.style.opacity='1'; }, 60);
  }catch(e){}
};

function _emailValido(e){ return /^[^\s@]+@[^\s@]+\.[a-zA-Z]{2,}$/.test(e); }


/* Si algu obre l'enllaç d'equip pero ja te el seu compte en aquest
   dispositiu, li donem la sortida cap al seu panell. */
function volverAMiPanel(){
  window.__salioDeInvitado = true;
  try{ sessionStorage.removeItem('cerco_invitado_nombre'); }catch(e){}
  try{ sessionStorage.removeItem('cerco_invitado_clinica'); }catch(e){}
  try{ sessionStorage.removeItem('cerco_invitado_cid'); }catch(e){}
  try{ document.body.classList.remove('mode-invitado'); }catch(e){}
  window.esInvitado = false;
  var base = location.origin + location.pathname;
  try{ history.replaceState({}, '', base); }catch(e){}
  if(CDB.registrado()) showScreen('inicio'); else showScreen('login');
}

function verPwdRegistro(){
  var i = document.getElementById('reg-pwd');
  var i2 = document.getElementById('reg-pwd2');
  if(!i) return;
  var mostrar = i.type === 'password';
  i.type = mostrar ? 'text' : 'password';
  if(i2) i2.type = i.type;
}


/* Correo para cambiar la contraseña: en español, con vuelta a esta misma página.
   Si Firebase no acepta la dirección de vuelta, se manda igualmente sin ella. */
window.CERCO_enviarReset = function(email){
  try{ firebase.auth().languageCode = 'es'; }catch(x){}
  var vuelta = { url: location.origin + location.pathname };
  return firebase.auth().sendPasswordResetEmail(email, vuelta).catch(function(x){
    var c = (x && x.code) || '';
    if(/continue-uri|unauthorized-domain|invalid-dynamic-link|argument-error/.test(c)) return firebase.auth().sendPasswordResetEmail(email);
    throw x;
  });
};
window.CERCO_textoReset = function(email){
  return 'Listo. Si ' + email + ' tiene cuenta con contraseña, en 1 o 2 minutos te llegará un correo de CERCO (remitente: noreply@cerco-c5724.firebaseapp.com). Búscalo también en Spam y en la pestaña Promociones. ¿Creaste la cuenta con Google? Entonces no tienes contraseña: pulsa «Continuar con Google».';
};
window.CERCO_esperaReenvio = function(boton){
  if(!boton) return; var n = 60;
  boton.disabled = true; boton.style.opacity = '.5'; boton.style.pointerEvents = 'none';
  var iv = setInterval(function(){ n--; boton.textContent = 'Reenviar en ' + n + ' s'; if(n <= 0){ clearInterval(iv); boton.disabled = false; boton.style.opacity = ''; boton.style.pointerEvents = ''; boton.textContent = '¿No te llega? Reenviar'; } }, 1000);
};
/* Envia de veritat el correo para restablecer la contraseña */
function recuperarContrasena(){
  var campo = document.getElementById('login-email');
  var err = document.getElementById('login-error');
  var email = (campo && campo.value || '').trim();
  var avisa = function(txt, color){
    if(err){ err.style.color = color || '#DC2626'; err.textContent = txt; err.style.display = 'block'; if(window.verAviso) verAviso(err); }
    else if(typeof showToast === 'function') showToast(txt);
  };

  if(!_emailValido(email)){
    avisa('Escribe primero tu correo aquí arriba y vuelve a pulsar.');
    if(campo){ try{ campo.focus({preventScroll:true}); }catch(e){ campo.focus(); } }
    return;
  }
  if(!window.Nube){ avisa('No hemos podido conectar. Revisa tu conexión.'); return; }

  avisa('Enviando…', '#6B7280');
  Nube.cargar().then(function(ok){
    if(!ok) throw new Error('sin-nube');
    return CERCO_enviarReset(email);
  }).then(function(){
    avisa(CERCO_textoReset(email), '#0E9F6E');
    var b = [].filter.call(document.querySelectorAll('#screen-login a, #screen-login button'), function(x){ return /olvidaste|reenviar/i.test(x.textContent); })[0];
    try{ CERCO_esperaReenvio(b); }catch(z){}
  }).catch(function(x){
    var c = (x && x.code) || '';
    if(c === 'auth/user-not-found')
      avisa('No hay ninguna cuenta con ese correo. Pulsa "Regístrate aquí" para crearla.');
    else if(c === 'auth/too-many-requests')
      avisa('Demasiados intentos. Espera unos minutos.');
    else
      avisa('No hemos podido enviarlo. Comprueba tu conexión a internet.');
  });
}

function handleRegistro(){
  var n = (document.getElementById('reg-nombre')||{}).value || '';
  var e = (document.getElementById('reg-email')||{}).value || '';
  var p1 = (document.getElementById('reg-pwd')||{}).value || '';
  var p2 = (document.getElementById('reg-pwd2')||{}).value || '';
  var ac = document.getElementById('reg-acepto');
  var err = document.getElementById('reg-error');
  var poner = function(m, foco){
    if(err){ err.textContent = m; if(window.verAviso) verAviso(err); }
    var f = document.getElementById(foco); if(f){ try{ f.focus({preventScroll:true}); }catch(e){ f.focus(); } }
  };
  if(err) err.textContent = '';

  n = n.trim(); e = e.trim();
  if(n.length < 3)            return poner('Escribe tu nombre y apellido.','reg-nombre');
  if(!_emailValido(e))        return poner('Ese correo no parece correcto. Revísalo.','reg-email');
  if(p1.length < 6)           return poner('La contraseña necesita al menos 6 caracteres.','reg-pwd');
  if(p1 !== p2)               return poner('Las dos contraseñas no coinciden.','reg-pwd2');
  if(ac && !ac.checked)       return poner('Marca la casilla para poder continuar.','reg-acepto');

  var ya = CAuth.cuenta();
  if(ya && ya.email === e.toLowerCase()){
    return poner('Ya existe una cuenta con ese correo en este dispositivo. Inicia sesión.','reg-email');
  }

  if(!window._unaSolaVez('registro')) return;
  var btnR = document.querySelector('#screen-registro .btn-login, #screen-registro button[onclick*="handleRegistro"]');
  var seguir = function(){
    CAuth.crear(n, e, p1);
    try{
      var emp = CDB.clinica(); emp.nomResp = n; emp.email = e;
      localStorage.setItem(CDB.K.emp, JSON.stringify(emp));
      CDB.fechaAlta(); CDB.setDemo(false);
    }catch(x){}
    if(typeof applyUserName === 'function') applyUserName(n);
    document.getElementById('reg-pwd').value = '';
    document.getElementById('reg-pwd2').value = '';
    if(btnR){ btnR.disabled = false; btnR.textContent = btnR.__txt || btnR.textContent; }
    showScreen('benvinguda');
    if(typeof showToast === 'function') showToast('Cuenta creada. Ahora configuramos tu clínica.');
  };
  if(!window.Nube) return seguir();
  // Primero preguntamos a Firebase: si el correo ya tiene cuenta, no fingimos que se ha creado
  if(btnR){ btnR.__txt = btnR.textContent; btnR.disabled = true; btnR.textContent = 'Creando tu cuenta…'; }
  if(err){ err.style.color = '#6B7280'; err.textContent = 'Creando tu cuenta…'; }
  Nube.registrar(e, p1).then(function(){
    if(err){ err.style.color = '#0E9F6E'; err.textContent = ''; }
    seguir();
    setTimeout(function(){ _subirClinica(); }, 600);
  }).catch(function(x){
    var c = (x && x.code) || x || '';
    if(btnR){ btnR.disabled = false; btnR.textContent = btnR.__txt || 'Crear cuenta'; }
    if(err) err.style.color = '';
    if(c === 'sin-nube') return seguir();
    if(c === 'auth/email-already-in-use') return poner('Ya existe una cuenta con ese correo (de clínica o de profesional). Inicia sesión; si no recuerdas la contraseña, pulsa «¿Olvidaste tu contraseña?». Para probar los dos lados, usa otro correo.', 'reg-email');
    if(c === 'auth/weak-password') return poner('La contraseña necesita al menos 6 caracteres.', 'reg-pwd');
    if(c === 'auth/invalid-email') return poner('Ese correo no parece correcto. Revísalo.', 'reg-email');
    if(c === 'auth/network-request-failed') return poner('No hay conexión. Revisa tu internet y vuelve a intentarlo.', 'reg-email');
    if(c === 'auth/too-many-requests') return poner('Demasiados intentos. Espera un minuto y vuelve a probar.', 'reg-email');
    return poner('No hemos podido crear la cuenta. Inténtalo de nuevo.', 'reg-email');
  });
}

function handleLogin(){
  var e = (document.getElementById('login-email')||{}).value || '';
  var p = (document.getElementById('login-pwd')||{}).value || '';
  var err = document.getElementById('login-error');
  var btn = document.querySelector('#screen-login .btn-login');

  var poner = function(m, foco){
    if(typeof _desbloquearEntrada === 'function') _desbloquearEntrada();
    if(btn){ btn.disabled = false; btn.textContent = 'Iniciar sesión'; }
    if(err){ err.style.color = '#DC2626'; err.textContent = m; err.style.display='block'; if(window.verAviso) verAviso(err); }
    else if(typeof showToast === 'function') showToast(m);
    var f = document.getElementById(foco); if(f){ try{ f.focus({preventScroll:true}); }catch(x){ f.focus(); } }
  };
  if(err){ err.textContent=''; err.style.display='none'; }

  e = e.trim();
  if(!_emailValido(e)) return poner('Escribe un correo válido.','login-email');
  if(!p)               return poner('Escribe tu contraseña.','login-pwd');
  // Igual que amb Google: nomes tallem el doble toc, no els reintents
  var araL = Date.now();
  if(window.__loginEnMarcha && window.__loginUltim && (araL - window.__loginUltim) < 1000) return;
  window.__loginUltim = araL;
  window.__googleEnMarcha = false;        // si veniem de Google, es deixa anar
  window.__loginEnMarcha = true;

  // Si la nuvol no contesta, el boto no pot quedar-se en "Comprobando..."
  try { clearTimeout(window.__loginVigia); } catch(x){}
  window.__loginVigia = setTimeout(function(){
    if(!window.__loginEnMarcha) return;
    poner('No hemos podido comprobar tus datos a tiempo. Revisa tu conexión y vuelve a intentarlo.','login-email');
  }, 25000);

  var entrar = function(){
    try { clearTimeout(window.__loginVigia); } catch(x){}
    window.__loginEnMarcha = false;
    CAuth.entrar();
    document.getElementById('login-pwd').value = '';
    try{ CDB.setDemo(false); CDB.renderTodo(); }catch(x){}
    if(btn){ btn.disabled = false; btn.textContent = 'Iniciar sesión'; }
    if(CDB.registrado()){
      showScreen('inicio');
      var q = ((CAuth.cuenta()||{}).nombre||'').split(/\s+/)[0];
      if(typeof showToast === 'function') showToast(q ? ('Hola de nuevo, ' + q) : 'Sesión iniciada');
    } else {
      showScreen('benvinguda');
    }
  };

  var local = CAuth.comprueba(e, p);

  // Si en este dispositivo ya te conocemos, entras al momento
  if(local === 'ok'){
    entrar();
    if(window.Nube){
      Nube.entrar(e, p).then(function(){
        if(typeof showToast === 'function') showToast('Datos actualizados desde la nube');
      }).catch(function(){});
    }
    return;
  }

  // Si no, puede que sea tu primer acceso desde este móvil u ordenador:
  // lo preguntamos a la nube antes de decirte que no existes.
  if(btn){ btn.disabled = true; btn.textContent = 'Comprobando…'; }
  if(err){ err.style.color = '#6B7280'; err.textContent = 'Comprobando tus datos…'; err.style.display='block'; }

  if(!window.Nube){
    return poner(local === 'pwd' ? 'La contraseña no es correcta.'
                                 : 'No hay ninguna cuenta con ese correo en este dispositivo.',
                 local === 'pwd' ? 'login-pwd' : 'login-email');
  }

  Nube.entrar(e, p).then(function(){
    // La nube te reconoce: creamos tu acceso también en este dispositivo
    var nom = '';
    try { nom = (CAuth.cuenta()||{}).nombre || ''; } catch(x){}
    CAuth.crear(nom || e.split('@')[0], e, p);
    entrar();
    if(typeof showToast === 'function') showToast('Recuperando tus datos…');
  }).catch(function(x){
    var c = (x && x.code) || '';
    if(c === 'auth/wrong-password' || c === 'auth/invalid-credential' || c === 'auth/invalid-login-credentials' || local === 'pwd')
      return poner('El correo o la contraseña no son correctos. Si creaste la cuenta con Google, pulsa «Continuar con Google». Si no la recuerdas, pulsa «¿Olvidaste tu contraseña?».','login-pwd');
    if(c === 'auth/user-not-found')
      return poner('No existe ninguna cuenta con ese correo. Pulsa "Regístrate aquí" para crearla.','login-email');
    if(c === 'auth/too-many-requests')
      return poner('Demasiados intentos. Espera un minuto y vuelve a probar.','login-pwd');
    if(local === 'sin-cuenta' || local === 'email')
      return poner('No encontramos ninguna cuenta con ese correo. Comprueba que esté bien escrito o regístrate.','login-email');
    return poner('No hemos podido comprobar tus datos. Revisa tu conexión.','login-email');
  });
}

function handleLoginSocial(provider){
  if(provider === 'Google') return entrarConGoogle();
  var err = document.getElementById('login-error');
  if(err){ err.style.color='#6B7280'; err.style.display='block';
    err.textContent = 'Entrar con ' + provider + ' llegará más adelante. De momento usa tu correo o Google.';
    if(window.verAviso) verAviso(err); }
}

/* Deixa l entrada com estava abans de qualsevol intent: cap pany posat,
   cap boto desactivat, cap missatge a mitges. Es crida sempre que es canvia
   de metode, perque un intent fallit no pugui bloquejar el seguent. */
function _desbloquearEntrada(){
  window.__loginEnMarcha  = false;
  window.__googleEnMarcha = false;
  try { clearTimeout(window.__googleVigia); } catch(e){}
  ['#screen-login .btn-login', '#screen-registro .btn-login'].forEach(function(sel){
    var b = document.querySelector(sel);
    if(b){ b.disabled = false; if(/Comprobando/.test(b.textContent)) b.textContent = 'Iniciar sesión'; }
  });
  document.querySelectorAll('.btn-social').forEach(function(b){
    b.disabled = false; b.style.opacity = ''; b.style.pointerEvents = '';
  });
  // I el missatge d estat no pot quedar-se penjat sense res al darrere
  ['login-error','reg-error'].forEach(function(id){
    var e = document.getElementById(id);
    if(e && /Abriendo la ventana|Volviendo a abrir|Comprobando/.test(e.textContent||'')){
      e.textContent = ''; e.style.display = 'none';
    }
  });
}

/* Entrar o registrar-se amb el compte de Google */
function entrarConGoogle(){
  var err = document.getElementById('login-error') || document.getElementById('reg-error');
  var avisa = function(txt, color){
    if(err){ err.style.color = color || '#DC2626'; err.textContent = txt; err.style.display='block';
             if(window.verAviso) verAviso(err); }
    else if(typeof showToast === 'function') showToast(txt);
  };

  if(!window.Nube){ avisa('No hemos podido conectar. Revisa tu conexión.'); return; }

  // Nomes ignorem el doble toc sense voler. Un clic de veritat sempre torna
  // a intentar-ho: si hi havia una finestra oberta, Google la substitueix.
  var ara = Date.now();
  if(window.__googleEnMarcha && window.__googleUltim && (ara - window.__googleUltim) < 1000) return;
  window.__googleUltim = ara;

  // Venir de provar amb el correu no ha de deixar res tancat
  var enMarxa = window.__googleEnMarcha;
  _desbloquearEntrada();
  window.__googleEnMarcha = true;

  avisa(enMarxa ? 'Volviendo a abrir la ventana de Google…' : 'Abriendo la ventana de Google…', '#6B7280');

  // Si Google no contesta mai (finestra tancada a mà, bloquejada pel
  // navegador), al cap d una estona alliberem tot i ho diem.
  window.__googleVigia = setTimeout(function(){
    if(!window.__googleEnMarcha) return;
    _desbloquearEntrada();
    avisa('La ventana de Google no ha respondido. Puedes volver a intentarlo o entrar con tu correo.');
  }, 30000);

  Nube.entrarConGoogle().then(function(res){
    try { clearTimeout(window.__googleVigia); } catch(e){}
    window.__googleEnMarcha = false;
    if(!res) return;                       // ha anat per redirecció: torna sol
    if(err){ err.style.display='none'; err.textContent=''; }
    _entrarDespuesDeGoogle(res.user);
  }).catch(function(x){
    try { clearTimeout(window.__googleVigia); } catch(e){}
    window.__googleEnMarcha = false;
    var c = (x && x.code) || '';
    if(c === 'auth/popup-closed-by-user' || c === 'auth/cancelled-popup-request'
       || c === 'auth/user-cancelled'){
      if(err){ err.style.display='none'; err.textContent=''; }
      return;
    }
    if(c === 'auth/popup-blocked')
      return avisa('Tu navegador ha bloqueado la ventana de Google. Permite las ventanas emergentes para esta página y vuelve a pulsar.');
    if(c === 'auth/network-request-failed')
      return avisa('Sin conexión con Google. Comprueba tu internet y vuelve a intentarlo.');
    if(c === 'auth/unauthorized-domain')
      return avisa('Esta dirección aún no está autorizada en Firebase. Hay que añadirla en Authentication → Settings → Authorized domains.');
    if(c === 'auth/operation-not-allowed')
      return avisa('Entrar con Google no está activado todavía en Firebase.');
    if(c === 'sin-nube')
      return avisa('Sin conexión. Entra con tu correo y contraseña.');
    return avisa('No hemos podido entrar con Google. Prueba con tu correo.');
  });
}

function _entrarDespuesDeGoogle(u){
  if(!u) return;
  try {
    CAuth.crearExterno(u.displayName || (u.email||'').split('@')[0], u.email || '');
    var d = CDB.clinica();
    if(!d.nomResp && u.displayName) d.nomResp = u.displayName;
    if(!d.email && u.email) d.email = u.email;
    localStorage.setItem(CDB.K.emp, JSON.stringify(d));
    if(typeof applyUserName === 'function' && u.displayName) applyUserName(u.displayName);
    CDB.setDemo(false); CDB.renderTodo();
  } catch(e){}
  if(CDB.registrado()){
    showScreen('inicio');
    var q = (u.displayName || '').split(/\s+/)[0];
    if(typeof showToast === 'function') showToast(q ? ('Hola, ' + q) : 'Sesión iniciada con Google');
  } else {
    showScreen('benvinguda');
    if(typeof showToast === 'function') showToast('Cuenta creada con Google. Ahora configuramos tu clínica.');
  }
}

/* Cerrar sesión: deja de escuchar las solicitudes, borra su copia local y cierra (Fase 1: una sola versión) */
function cerrarSesion(){
  if(window.CERCO_soltarCandidaturas) CERCO_soltarCandidaturas();
  return _cerrarSesionBase.apply(this, arguments);
}
function _cerrarSesionBase(){
  CAuth.salir();
  try{ if(window.Nube) Nube.salir(); }catch(e){}
  showScreen('login');
  if(typeof showToast === 'function') showToast('Sesión cerrada. Tus datos siguen guardados.');
}

/* Redueix la imatge abans de guardar-la: una foto de mobil sencera
   no hi cap a l'emmagatzematge del navegador. */
function _reducirImagen(file, maxPx, cb){
  var fr = new FileReader();
  fr.onload = function(ev){
    var img = new Image();
    img.onload = function(){
      try {
        var esc = Math.min(1, maxPx / Math.max(img.width, img.height));
        var w = Math.round(img.width * esc), h = Math.round(img.height * esc);
        var cv = document.createElement('canvas');
        cv.width = w; cv.height = h;
        cv.getContext('2d').drawImage(img, 0, 0, w, h);
        cb(cv.toDataURL('image/jpeg', 0.82));
      } catch(e){ cb(ev.target.result); }
    };
    img.onerror = function(){ cb(null); };
    img.src = ev.target.result;
  };
  fr.onerror = function(){ cb(null); };
  fr.readAsDataURL(file);
}

function _pintarAvatar(dataUrl){
  var avatar = document.getElementById('mc-avatar-circle');
  var letter = document.getElementById('mc-avatar-letter');
  if(!avatar) return;
  avatar.style.backgroundImage = "url('" + dataUrl + "')";
  avatar.style.backgroundSize = 'cover';
  avatar.style.backgroundPosition = 'center';
  if(letter) letter.style.display = 'none';
}

function handleMcPhotoUpload(input){
  const file = input.files && input.files[0];
  if(!file) return;
  if(!file.type.startsWith('image/')){
    if(typeof showToast==='function') showToast('Por favor, sube un archivo de imagen');
    return;
  }
  _reducirImagen(file, 320, function(dataUrl){
    if(!dataUrl){ if(typeof showToast==='function') showToast('No se ha podido leer la imagen'); return; }
    _pintarAvatar(dataUrl);
    try {
      guardarCampoPerfil('foto', dataUrl);
      if(typeof showToast==='function') showToast('Foto de perfil actualizada');
    } catch(e){
      if(typeof showToast==='function') showToast('Foto puesta, pero no se ha podido guardar en este navegador');
    }
  });
}
// Hover sobre avatar
document.addEventListener('DOMContentLoaded', function(){
  const av = document.getElementById('mc-avatar-circle');
  const hv = document.getElementById('mc-avatar-hover');
  if(av && hv){
    av.addEventListener('mouseenter', ()=> hv.style.opacity='1');
    av.addEventListener('mouseleave', ()=> hv.style.opacity='0');
  }
});

function updateMcBadge(){
  const nom = document.getElementById('mc-nombre')?.value.trim() || '';
  const rol = document.getElementById('mc-rol')?.value || 'Gerente';
  const letter = document.getElementById('mc-avatar-letter');
  const heroName = document.getElementById('mc-hero-name');
  const heroRole = document.getElementById('mc-hero-role');
  const av = document.getElementById('mc-avatar-circle');

  let clinica = 'Clínica Dental Madrid Centro';
  try { if(window.CDB && !CDB.demo()) clinica = CDB.nombreClinica() || ''; } catch(e){}

  if(letter && !(av && av.style.backgroundImage)) letter.textContent = nom ? nom.charAt(0).toUpperCase() : '?';
  if(heroName) heroName.textContent = nom || 'Tu nombre';
  // El valor guardado sigue siendo «Responsable de RRHH»; en pantalla se dice «Coordinador/a de clínica»
  if(heroRole) heroRole.textContent = (rol === 'Responsable de RRHH' ? 'Coordinador/a de clínica' : rol) + (clinica ? ' · ' + clinica : '');

  // El rol elegido se guarda con el resto del perfil
  try {
    if(window.CDB && !CDB.demo()){
      const d = CDB.clinica();
      d.rol = rol;
      if(nom) d.nomResp = nom;
      localStorage.setItem(CDB.K.emp, JSON.stringify(d));
    }
  } catch(e){}
}
function updateBadgeFromSettings(){ updateMcBadge(); }

function loadPersonalDiscIntoBadge(){
  let data;
  try {
    data = JSON.parse(localStorage.getItem('cerco_disc_individual'))
        || JSON.parse(localStorage.getItem('cerco_disc_empresa'));
  } catch(e){ return; }
  if(!data || !data.dominant){ return; }
  const color = DISC_COLORS_cuenta[data.dominant];
  const name = DISC_NAMES_cuenta[data.dominant];
  // Hero avatar color
  const avatar = document.getElementById('mc-avatar-circle');
  if(avatar) avatar.style.setProperty('--badge-color', color);
  if(avatar) avatar.style.background = color;
  // Hero chip
  const chip = document.getElementById('mc-disc-chip');
  if(chip) chip.textContent = `${data.dominant} · ${name}`;
  // Status text
  const status = document.getElementById('mc-disc-status');
  if(status) status.textContent = `${name} (${data.dominant}/${data.secondary})`;
}
loadPersonalDiscIntoBadge();











function initInicioScreen(){
  const fecha = document.getElementById('inicio-fecha');
  if(fecha){
    const dias = ['domingo','lunes','martes','miércoles','jueves','viernes','sábado'];
    const meses = ['enero','febrero','marzo','abril','mayo','junio','julio','agosto','septiembre','octubre','noviembre','diciembre'];
    const d = new Date();
    fecha.textContent = dias[d.getDay()].charAt(0).toUpperCase() + dias[d.getDay()].slice(1) + ', ' + d.getDate() + ' de ' + meses[d.getMonth()];
  }
  const nomEl = document.getElementById('inicio-nombre');
  if(nomEl){
    try {
      const data = JSON.parse(localStorage.getItem('cerco_empresa') || '{}');
      const nom = data.nomResp || data.nom;
      if(nom) nomEl.textContent = ', ' + nom.split(' ')[0];
    } catch(e){}
  }
}
initInicioScreen();



// ---- Modo Entrevista en directo ----
var IM_QUESTIONS = [
  {q:"Explícame una situación con un paciente nervioso o difícil. ¿Cómo la gestionaste?", why:"VALIDA LA EMPATÍA DEL VÍDEO Y EL CV"},
  {q:"Tu perfil combina Influyente y Concienzudo. Quien tiene los dos a veces sacrifica el detalle por mantener el ritmo y la conversación con el paciente. Cuéntame una vez que tuviste que frenar para no saltarte un protocolo.", why:"COMPENSA EL PUNTO DÉBIL DE LA COMBINACIÓN I + C"},
  {q:"¿Cómo te organizas cuando tienes varios pacientes e imprevistos la misma mañana?", why:"COMPRUEBA ENCAJE CON EL RITMO DE LA CLÍNICA"}
];
let imIdx = 0;
let imRatings = [null, null, null];
let imNotes = ['', '', ''];

/* Les preguntes surten del perfil de la persona i del que li falta a
   l equip. No son un guio general: son per a aquesta conversa. */
var _PREG_PERFIL = {
  D: {forta:'Explícame una decisión difícil que tomaste tú solo/a. ¿Qué pasó después?',
      feble:'Cuéntame una vez que fuiste demasiado directo/a con alguien del equipo. ¿Cómo lo arreglaste?',
      pfeble:'El perfil Dominante decide rápido, pero puede atropellar al equipo'},
  I: {forta:'Explícame una situación con un paciente nervioso o difícil. ¿Cómo la gestionaste?',
      feble:'Cuéntame una vez que tuviste que frenar para no saltarte un protocolo por mantener la conversación.',
      pfeble:'El perfil Influyente conecta muy bien, pero puede saltarse pasos'},
  S: {forta:'Cuéntame una época de mucha tensión en la clínica. ¿Cuál fue tu papel?',
      feble:'Explícame una vez que tuviste que decir que no, o dar una mala noticia a alguien.',
      pfeble:'El perfil Estable sostiene el equipo, pero le cuesta decir que no'},
  C: {forta:'Cuéntame un error que detectaste tú y que a los demás se les había pasado.',
      feble:'Explícame una vez que tuviste que entregar algo sin que estuviera perfecto. ¿Cómo lo llevaste?',
      pfeble:'El perfil Concienzudo cuida el detalle, pero puede bloquearse buscando la perfección'}
};

function _preguntasEntrevista(dom, sec, falta){
  var L = _PREG_PERFIL, out = [];
  var nom = {D:'Dominante', I:'Influyente', S:'Estable', C:'Concienzudo'};

  if(L[dom]) out.push({ q: L[dom].forta, why: 'CONFIRMA SU PUNTO FUERTE · PERFIL ' + dom });
  if(L[sec] && sec !== dom) out.push({ q: L[sec].feble, why: (L[sec].pfeble || '').toUpperCase() });
  else if(L[dom]) out.push({ q: L[dom].feble, why: (L[dom].pfeble || '').toUpperCase() });

  if(falta && falta !== dom && falta !== sec && L[falta]){
    out.push({ q: 'A tu equipo le falta perfil ' + nom[falta] + '. ' + L[falta].forta,
               why: 'MIRA SI PUEDE CUBRIR EL HUECO DE TU EQUIPO (' + falta + ')' });
  } else {
    out.push({ q: '¿Cómo te organizas cuando tienes varios pacientes e imprevistos la misma mañana?',
               why: 'COMPRUEBA EL ENCAJE CON EL RITMO DE LA CLÍNICA' });
  }
  return out;
}

function startInterviewMode(){
  // De quin candidat parlem i que li falta a l equip
  var dom = 'I', sec = 'C';
  try {
    var b = document.getElementById('cand-disc-badge') || document.querySelector('#screen-candidat .disc-dot-pick');
    var m = (document.getElementById('screen-candidat')||{innerText:''}).innerText.match(/Perfil\s+([DISC])\b/);
    if(m) dom = m[1];
    var m2 = (document.getElementById('screen-candidat')||{innerText:''}).innerText.match(/rasgo de ([A-Za-zá-ú]+)/);
    if(m2){
      var inv = {Dominante:'D', Influyente:'I', Estable:'S', Concienzudo:'C'};
      if(inv[m2[1]]) sec = inv[m2[1]];
    }
  } catch(e){}
  var falta = null;
  try { var d = CDB.perfilQueFalta(); if(d && d.fiable) falta = d.falta; } catch(e){}

  IM_QUESTIONS = _preguntasEntrevista(dom, sec, falta);
  imIdx = 0;
  imRatings = IM_QUESTIONS.map(function(){ return null; });
  imNotes   = IM_QUESTIONS.map(function(){ return ''; });
  window.__imPerfil = {dom:dom, sec:sec, falta:falta};

  // Portada primer
  var intro = document.getElementById('im-intro');
  var preg  = document.getElementById('im-preguntes');
  if(intro) intro.style.display = 'block';
  if(preg)  preg.style.display = 'none';

  var pasos = document.getElementById('im-intro-pasos');
  if(pasos){
    pasos.innerHTML =
        '<div><b>1.</b> Lee la pregunta en voz alta y escucha sin interrumpir.</div>'
      + '<div><b>2.</b> Puntúa la respuesta: floja, correcta o brillante.</div>'
      + '<div><b>3.</b> Apunta lo que te llame la atención mientras habla.</div>'
      + '<div><b>4.</b> Al acabar te doy el resumen con todo junto.</div>';
  }
  var pf = document.getElementById('im-intro-perfil');
  if(pf){
    var nom = {D:'Dominante', I:'Influyente', S:'Estable', C:'Concienzudo'};
    pf.innerHTML = 'Te he preparado <b>' + IM_QUESTIONS.length + ' preguntas</b> a medida: una para confirmar su punto fuerte ('
      + nom[dom] + '), otra para el punto débil de su combinación, y '
      + (falta ? 'una para ver si puede cubrir el <b>' + nom[falta] + '</b> que le falta a tu equipo.'
               : 'una para ver cómo encaja con el ritmo de tu clínica.');
  }

  document.getElementById('interview-mode').style.display = 'flex';
}

function empezarPreguntasEntrevista(){
  var intro = document.getElementById('im-intro');
  var preg  = document.getElementById('im-preguntes');
  if(intro) intro.style.display = 'none';
  if(preg)  preg.style.display = 'block';
  renderInterviewQ();
}
function renderInterviewQ(){
  const q = IM_QUESTIONS[imIdx];
  document.getElementById('im-question').textContent = q.q;
  document.getElementById('im-why').textContent = q.why;
  document.getElementById('im-progress').textContent = 'Pregunta ' + (imIdx+1) + ' de ' + IM_QUESTIONS.length;
  document.getElementById('im-notes').value = imNotes[imIdx];
  document.getElementById('im-prev').style.visibility = imIdx === 0 ? 'hidden' : 'visible';
  document.getElementById('im-next').textContent = imIdx === IM_QUESTIONS.length-1 ? 'Finalizar entrevista' : 'Siguiente pregunta →';
  // reset rating visual
  document.querySelectorAll('#im-rating button').forEach((b,i)=>{
    const selected = imRatings[imIdx] === i+1;
    b.style.background = selected ? '#F5A623' : 'rgba(255,255,255,.06)';
    b.style.color = selected ? '#0F1C3F' : 'rgba(255,255,255,.7)';
    b.style.borderColor = selected ? '#F5A623' : 'rgba(255,255,255,.1)';
  });
}
function rateAnswer(n, btn){
  imRatings[imIdx] = n;
  renderInterviewQ();
}
function nextInterviewQ(){
  imNotes[imIdx] = document.getElementById('im-notes').value;
  if(imIdx < IM_QUESTIONS.length - 1){
    imIdx++;
    renderInterviewQ();
  } else {
    finishInterview();
  }
}
function prevInterviewQ(){
  imNotes[imIdx] = document.getElementById('im-notes').value;
  if(imIdx > 0){ imIdx--; renderInterviewQ(); }
}
function closeInterviewMode(){
  document.getElementById('interview-mode').style.display = 'none';
}
function finishInterview(){
  closeInterviewMode();
  // Generar resum segons les valoracions
  const labels = ['floja','correcta','brillante'];
  const rated = imRatings.filter(r=>r!==null);
  const avg = rated.length ? rated.reduce((a,b)=>a+b,0)/rated.length : 0;
  const nomD = {D:'Dominante', I:'Influyente', S:'Estable', C:'Concienzudo'};
  const pf = window.__imPerfil || {};
  let veredicte;
  if(!rated.length){
    veredicte = 'No has valorado ninguna respuesta, así que no puedo darte una lectura. Puedes repetir el modo entrevista cuando quieras.';
  } else {
    const nota = avg.toFixed(1);
    if(avg >= 2.5)      veredicte = 'Has puntuado <b>' + nota + ' sobre 3</b>: las respuestas han sido <b>sólidas</b>. Lo que viste en su perfil se ha confirmado hablando con ella.';
    else if(avg >= 1.8) veredicte = 'Has puntuado <b>' + nota + ' sobre 3</b>: respuestas <b>correctas</b> en general. Antes de decidir, valdría la pena una prueba práctica.';
    else                veredicte = 'Has puntuado <b>' + nota + ' sobre 3</b>: las respuestas se han quedado <b>cortas</b>. El perfil encajaba sobre el papel, pero la conversación no lo ha confirmado.';
    if(pf.falta) veredicte += ' Recuerda que buscabas cubrir el perfil <b>' + (nomD[pf.falta]||pf.falta) + '</b> de tu equipo.';
    veredicte += '<div style="margin-top:12px;font-size:12.5px;color:#6B7280;line-height:1.55;">Esto es tu propia valoración ordenada, no un juicio mío sobre la persona. La decisión es tuya.</div>';
  }
  const conNotas = imNotes.filter(n=>n && n.trim());
  const notesText = conNotas.length
    ? '<div style="margin-top:14px;background:#F8F9FA;border-radius:10px;padding:12px 14px;"><b style="font-size:12.5px;">Tus notas</b><div style="font-size:13px;color:#374151;line-height:1.6;margin-top:5px;">'
      + conNotas.map(function(n){ return '· ' + _esc(n); }).join('<br>') + '</div></div>'
    : '';
  document.getElementById('im-summary-text').innerHTML = veredicte + notesText;
  document.getElementById('interview-summary').style.display = 'flex';
}



function openHireModal(){ document.getElementById('hire-modal').style.display = 'flex'; }
function completeHire(){
  document.getElementById('hire-modal').style.display = 'none';
  showToast('María García contratada — la oferta pasa a Cerradas');
  setTimeout(()=> showScreen('stats'), 1200);
}



function toggleIAPanel(){
  const p = document.getElementById('ia-panel');
  if(!p) return;
  p.style.display = p.style.display === 'flex' ? 'none' : 'flex';
}



// ---- Calendario de entrevistas ----
let calDate = new Date();
let calSelectedDay = null;
const CAL_MESES = ['enero','febrero','marzo','abril','mayo','junio','julio','agosto','septiembre','octubre','noviembre','diciembre'];
function renderCalendar(){
  const grid = document.getElementById('cal-grid');
  const label = document.getElementById('cal-month-label');
  if(!grid || !label) return;
  const y = calDate.getFullYear(), m = calDate.getMonth();
  label.textContent = CAL_MESES[m].charAt(0).toUpperCase() + CAL_MESES[m].slice(1) + ' ' + y;
  const first = new Date(y, m, 1);
  let startDay = first.getDay(); startDay = startDay === 0 ? 6 : startDay - 1;
  const daysInMonth = new Date(y, m+1, 0).getDate();
  const today = new Date(); today.setHours(0,0,0,0);
  let out = '';
  for(let i=0;i<startDay;i++) out += '<div></div>';
  for(let d=1; d<=daysInMonth; d++){
    const date = new Date(y, m, d);
    const isPast = date < today;
    const isWeekend = date.getDay()===0 || date.getDay()===6;
    const disabled = isPast || isWeekend;
    const sel = calSelectedDay === d && !disabled;
    out += `<div class="cal-day${disabled?' cal-day-off':''}" onclick="${disabled?'':`selectCalDay(${d})`}" style="text-align:center;padding:9px 0;border-radius:9px;font-size:13px;font-weight:${sel?'800':'600'};cursor:${disabled?'default':'pointer'};background:${sel?'#1A56DB':'transparent'};color:${sel?'white':(disabled?'#D1D5DB':'#374151')};transition:all .12s;" ${disabled?'':`onmouseenter="if(!this.style.background.includes('26, 86')) this.style.background='#EEF2FF'" onmouseleave="if('${sel}'!=='true') this.style.background='${sel?'#1A56DB':'transparent'}'"`}>${d}</div>`;
  }
  grid.innerHTML = out;
}
function selectCalDay(d){
  calSelectedDay = d;
  renderCalendar();
  const wrap = document.getElementById('cal-slots-wrap');
  if(wrap) wrap.style.display = 'block';
}
function changeMonth(delta){
  calDate = new Date(calDate.getFullYear(), calDate.getMonth()+delta, 1);
  calSelectedDay = null;
  renderCalendar();
  const wrap = document.getElementById('cal-slots-wrap');
  if(wrap) wrap.style.display = 'none';
}
function pickSlot(el){
  document.querySelectorAll('#cal-slots-wrap .slot').forEach(s=>s.classList.remove('active'));
  el.classList.add('active');
  showToast('Franja seleccionada: ' + calSelectedDay + ' de ' + CAL_MESES[calDate.getMonth()] + ' a las ' + el.textContent);
}
renderCalendar();



// ---- Buscador de ubicaciones de España ----
const ES_LOCATIONS = [
  {c:'Madrid', p:'Madrid', r:'Comunidad de Madrid'},
  {c:'Barcelona', p:'Barcelona', r:'Cataluña'},
  {c:'Valencia', p:'Valencia', r:'C. Valenciana'},
  {c:'Sevilla', p:'Sevilla', r:'Andalucía'},
  {c:'Zaragoza', p:'Zaragoza', r:'Aragón'},
  {c:'Málaga', p:'Málaga', r:'Andalucía'},
  {c:'Murcia', p:'Murcia', r:'R. de Murcia'},
  {c:'Palma', p:'Baleares', r:'Islas Baleares'},
  {c:'Las Palmas de Gran Canaria', p:'Las Palmas', r:'Canarias'},
  {c:'Bilbao', p:'Vizcaya', r:'País Vasco'},
  {c:'Alicante', p:'Alicante', r:'C. Valenciana'},
  {c:'Córdoba', p:'Córdoba', r:'Andalucía'},
  {c:'Valladolid', p:'Valladolid', r:'Castilla y León'},
  {c:'Vigo', p:'Pontevedra', r:'Galicia'},
  {c:'Gijón', p:'Asturias', r:'Asturias'},
  {c:'Hospitalet de Llobregat', p:'Barcelona', r:'Cataluña'},
  {c:'A Coruña', p:'A Coruña', r:'Galicia'},
  {c:'Vitoria-Gasteiz', p:'Álava', r:'País Vasco'},
  {c:'Granada', p:'Granada', r:'Andalucía'},
  {c:'Elche', p:'Alicante', r:'C. Valenciana'},
  {c:'Oviedo', p:'Asturias', r:'Asturias'},
  {c:'Badalona', p:'Barcelona', r:'Cataluña'},
  {c:'Cartagena', p:'Murcia', r:'R. de Murcia'},
  {c:'Terrassa', p:'Barcelona', r:'Cataluña'},
  {c:'Jerez de la Frontera', p:'Cádiz', r:'Andalucía'},
  {c:'Sabadell', p:'Barcelona', r:'Cataluña'},
  {c:'Santa Cruz de Tenerife', p:'S.C. Tenerife', r:'Canarias'},
  {c:'Móstoles', p:'Madrid', r:'Comunidad de Madrid'},
  {c:'Alcalá de Henares', p:'Madrid', r:'Comunidad de Madrid'},
  {c:'Pamplona', p:'Navarra', r:'Navarra'},
  {c:'Fuenlabrada', p:'Madrid', r:'Comunidad de Madrid'},
  {c:'Almería', p:'Almería', r:'Andalucía'},
  {c:'Leganés', p:'Madrid', r:'Comunidad de Madrid'},
  {c:'San Sebastián', p:'Guipúzcoa', r:'País Vasco'},
  {c:'Getafe', p:'Madrid', r:'Comunidad de Madrid'},
  {c:'Burgos', p:'Burgos', r:'Castilla y León'},
  {c:'Santander', p:'Cantabria', r:'Cantabria'},
  {c:'Castellón de la Plana', p:'Castellón', r:'C. Valenciana'},
  {c:'Albacete', p:'Albacete', r:'Castilla-La Mancha'},
  {c:'Alcorcón', p:'Madrid', r:'Comunidad de Madrid'},
  {c:'Logroño', p:'La Rioja', r:'La Rioja'},
  {c:'Badajoz', p:'Badajoz', r:'Extremadura'},
  {c:'Salamanca', p:'Salamanca', r:'Castilla y León'},
  {c:'Huelva', p:'Huelva', r:'Andalucía'},
  {c:'Marbella', p:'Málaga', r:'Andalucía'},
  {c:'Lleida', p:'Lleida', r:'Cataluña'},
  {c:'Tarragona', p:'Tarragona', r:'Cataluña'},
  {c:'León', p:'León', r:'Castilla y León'},
  {c:'Cádiz', p:'Cádiz', r:'Andalucía'},
  {c:'Jaén', p:'Jaén', r:'Andalucía'},
  {c:'Ourense', p:'Ourense', r:'Galicia'},
  {c:'Girona', p:'Girona', r:'Cataluña'},
  {c:'Lugo', p:'Lugo', r:'Galicia'},
  {c:'Cáceres', p:'Cáceres', r:'Extremadura'},
  {c:'Santiago de Compostela', p:'A Coruña', r:'Galicia'},
  {c:'Toledo', p:'Toledo', r:'Castilla-La Mancha'},
  {c:'Pontevedra', p:'Pontevedra', r:'Galicia'},
  {c:'Ceuta', p:'Ceuta', r:'Ceuta'},
  {c:'Melilla', p:'Melilla', r:'Melilla'},
  {c:'Guadalajara', p:'Guadalajara', r:'Castilla-La Mancha'},
  {c:'Ávila', p:'Ávila', r:'Castilla y León'},
  {c:'Cuenca', p:'Cuenca', r:'Castilla-La Mancha'},
  {c:'Segovia', p:'Segovia', r:'Castilla y León'},
  {c:'Soria', p:'Soria', r:'Castilla y León'},
  {c:'Teruel', p:'Teruel', r:'Aragón'},
  {c:'Huesca', p:'Huesca', r:'Aragón'},
  {c:'Zamora', p:'Zamora', r:'Castilla y León'},
  {c:'Palencia', p:'Palencia', r:'Castilla y León'},
  {c:'Ciudad Real', p:'Ciudad Real', r:'Castilla-La Mancha'},
  {c:'Alcobendas', p:'Madrid', r:'Comunidad de Madrid'},
  {c:'Torrejón de Ardoz', p:'Madrid', r:'Comunidad de Madrid'},
  {c:'Parla', p:'Madrid', r:'Comunidad de Madrid'},
  {c:'Las Rozas', p:'Madrid', r:'Comunidad de Madrid'},
  {c:'Pozuelo de Alarcón', p:'Madrid', r:'Comunidad de Madrid'},
  {c:'Coslada', p:'Madrid', r:'Comunidad de Madrid'},
  {c:'Rivas-Vaciamadrid', p:'Madrid', r:'Comunidad de Madrid'},
  {c:'Majadahonda', p:'Madrid', r:'Comunidad de Madrid'},
  {c:'San Sebastián de los Reyes', p:'Madrid', r:'Comunidad de Madrid'},
  {c:'Arganda del Rey', p:'Madrid', r:'Comunidad de Madrid'},
  {c:'Collado Villalba', p:'Madrid', r:'Comunidad de Madrid'},
  {c:'Aranjuez', p:'Madrid', r:'Comunidad de Madrid'},
  {c:'Valdemoro', p:'Madrid', r:'Comunidad de Madrid'},
  {c:'Mataró', p:'Barcelona', r:'Cataluña'},
  {c:'Santa Coloma de Gramenet', p:'Barcelona', r:'Cataluña'},
  {c:'Reus', p:'Tarragona', r:'Cataluña'},
  {c:'Cornellà de Llobregat', p:'Barcelona', r:'Cataluña'},
  {c:'Sant Cugat del Vallès', p:'Barcelona', r:'Cataluña'},
  {c:'Manresa', p:'Barcelona', r:'Cataluña'},
  {c:'Rubí', p:'Barcelona', r:'Cataluña'},
  {c:'Vilanova i la Geltrú', p:'Barcelona', r:'Cataluña'},
  {c:'Granollers', p:'Barcelona', r:'Cataluña'},
  {c:'Castelldefels', p:'Barcelona', r:'Cataluña'},
  {c:'Figueres', p:'Girona', r:'Cataluña'},
  {c:'Vic', p:'Barcelona', r:'Cataluña'},
  {c:'Banyoles', p:'Girona', r:'Cataluña'},
  {c:'Blanes', p:'Girona', r:'Cataluña'},
  {c:'Olot', p:'Girona', r:'Cataluña'},
  {c:'Salt', p:'Girona', r:'Cataluña'},
  {c:'Tortosa', p:'Tarragona', r:'Cataluña'},
  {c:'Igualada', p:'Barcelona', r:'Cataluña'},
  {c:'Sitges', p:'Barcelona', r:'Cataluña'},
  {c:'Torrevieja', p:'Alicante', r:'C. Valenciana'},
  {c:'Orihuela', p:'Alicante', r:'C. Valenciana'},
  {c:'Torrent', p:'Valencia', r:'C. Valenciana'},
  {c:'Gandía', p:'Valencia', r:'C. Valenciana'},
  {c:'Benidorm', p:'Alicante', r:'C. Valenciana'},
  {c:'Paterna', p:'Valencia', r:'C. Valenciana'},
  {c:'Sagunto', p:'Valencia', r:'C. Valenciana'},
  {c:'Alcoy', p:'Alicante', r:'C. Valenciana'},
  {c:'Elda', p:'Alicante', r:'C. Valenciana'},
  {c:'Dénia', p:'Alicante', r:'C. Valenciana'},
  {c:'Dos Hermanas', p:'Sevilla', r:'Andalucía'},
  {c:'Algeciras', p:'Cádiz', r:'Andalucía'},
  {c:'Roquetas de Mar', p:'Almería', r:'Andalucía'},
  {c:'Vélez-Málaga', p:'Málaga', r:'Andalucía'},
  {c:'El Puerto de Santa María', p:'Cádiz', r:'Andalucía'},
  {c:'Mijas', p:'Málaga', r:'Andalucía'},
  {c:'Fuengirola', p:'Málaga', r:'Andalucía'},
  {c:'Torremolinos', p:'Málaga', r:'Andalucía'},
  {c:'Estepona', p:'Málaga', r:'Andalucía'},
  {c:'Chiclana de la Frontera', p:'Cádiz', r:'Andalucía'},
  {c:'San Fernando', p:'Cádiz', r:'Andalucía'},
  {c:'Utrera', p:'Sevilla', r:'Andalucía'},
  {c:'Linares', p:'Jaén', r:'Andalucía'},
  {c:'Motril', p:'Granada', r:'Andalucía'},
  {c:'Écija', p:'Sevilla', r:'Andalucía'},
  {c:'Sanlúcar de Barrameda', p:'Cádiz', r:'Andalucía'},
  {c:'Antequera', p:'Málaga', r:'Andalucía'},
  {c:'Ronda', p:'Málaga', r:'Andalucía'},
  {c:'Úbeda', p:'Jaén', r:'Andalucía'},
  {c:'Barakaldo', p:'Vizcaya', r:'País Vasco'},
  {c:'Getxo', p:'Vizcaya', r:'País Vasco'},
  {c:'Irún', p:'Guipúzcoa', r:'País Vasco'},
  {c:'Portugalete', p:'Vizcaya', r:'País Vasco'},
  {c:'Santurtzi', p:'Vizcaya', r:'País Vasco'},
  {c:'Basauri', p:'Vizcaya', r:'País Vasco'},
  {c:'Tudela', p:'Navarra', r:'Navarra'},
  {c:'Torrelavega', p:'Cantabria', r:'Cantabria'},
  {c:'Calahorra', p:'La Rioja', r:'La Rioja'},
  {c:'Eibar', p:'Guipúzcoa', r:'País Vasco'},
  {c:'Ferrol', p:'A Coruña', r:'Galicia'},
  {c:'Narón', p:'A Coruña', r:'Galicia'},
  {c:'Vilagarcía de Arousa', p:'Pontevedra', r:'Galicia'},
  {c:'Avilés', p:'Asturias', r:'Asturias'},
  {c:'Siero', p:'Asturias', r:'Asturias'},
  {c:'Langreo', p:'Asturias', r:'Asturias'},
  {c:'Ponferrada', p:'León', r:'Castilla y León'},
  {c:'Aranda de Duero', p:'Burgos', r:'Castilla y León'},
  {c:'Miranda de Ebro', p:'Burgos', r:'Castilla y León'},
  {c:'Talavera de la Reina', p:'Toledo', r:'Castilla-La Mancha'},
  {c:'Puertollano', p:'Ciudad Real', r:'Castilla-La Mancha'},
  {c:'Valdepeñas', p:'Ciudad Real', r:'Castilla-La Mancha'},
  {c:'Alcázar de San Juan', p:'Ciudad Real', r:'Castilla-La Mancha'},
  {c:'Hellín', p:'Albacete', r:'Castilla-La Mancha'},
  {c:'Medina del Campo', p:'Valladolid', r:'Castilla y León'},
  {c:'Laguna de Duero', p:'Valladolid', r:'Castilla y León'},
  {c:'Calatayud', p:'Zaragoza', r:'Aragón'},
  {c:'Utebo', p:'Zaragoza', r:'Aragón'},
  {c:'Mérida', p:'Badajoz', r:'Extremadura'},
  {c:'Plasencia', p:'Cáceres', r:'Extremadura'},
  {c:'Don Benito', p:'Badajoz', r:'Extremadura'},
  {c:'Almendralejo', p:'Badajoz', r:'Extremadura'},
  {c:'Lorca', p:'Murcia', r:'R. de Murcia'},
  {c:'Molina de Segura', p:'Murcia', r:'R. de Murcia'},
  {c:'Alcantarilla', p:'Murcia', r:'R. de Murcia'},
  {c:'Yecla', p:'Murcia', r:'R. de Murcia'},
  {c:'Águilas', p:'Murcia', r:'R. de Murcia'},
  {c:'San Javier', p:'Murcia', r:'R. de Murcia'},
  {c:'Ibiza', p:'Baleares', r:'Islas Baleares'},
  {c:'Manacor', p:'Baleares', r:'Islas Baleares'},
  {c:'Calvià', p:'Baleares', r:'Islas Baleares'},
  {c:'Mahón', p:'Baleares', r:'Islas Baleares'},
  {c:'Inca', p:'Baleares', r:'Islas Baleares'},
  {c:'Ciudadela', p:'Baleares', r:'Islas Baleares'},
  {c:'San Cristóbal de La Laguna', p:'S.C. Tenerife', r:'Canarias'},
  {c:'Telde', p:'Las Palmas', r:'Canarias'},
  {c:'Arona', p:'S.C. Tenerife', r:'Canarias'},
  {c:'Santa Lucía de Tirajana', p:'Las Palmas', r:'Canarias'},
  {c:'Arrecife', p:'Las Palmas', r:'Canarias'},
  {c:'Puerto del Rosario', p:'Las Palmas', r:'Canarias'},
  {c:'Adeje', p:'S.C. Tenerife', r:'Canarias'},
  {c:'La Orotava', p:'S.C. Tenerife', r:'Canarias'}
];
const ES_REGIONS = ['Andalucía','Aragón','Asturias','Islas Baleares','Canarias','Cantabria','Castilla y León','Castilla-La Mancha','Cataluña','C. Valenciana','Extremadura','Galicia','La Rioja','Comunidad de Madrid','R. de Murcia','Navarra','País Vasco'];

function normalizeTxt(s){
  return (s||'').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g,'');
}
function initLocationPicker(inputId){
  const input = document.getElementById(inputId);
  if(!input || input.dataset.lpReady) return;
  if(!input.parentNode || typeof input.parentNode.insertBefore !== 'function') return;
  input.dataset.lpReady = '1';
  input.setAttribute('autocomplete','off');
  const wrap = document.createElement('div');
  wrap.style.cssText = 'position:relative;flex:1;';
  input.parentNode.insertBefore(wrap, input);
  wrap.appendChild(input);
  const dd = document.createElement('div');
  dd.style.cssText = 'display:none;position:absolute;top:calc(100% + 4px);left:0;right:0;min-width:260px;background:white;border:1px solid #E5E7EB;border-radius:12px;box-shadow:0 12px 32px rgba(16,24,40,.14);max-height:280px;overflow-y:auto;z-index:9200;';
  wrap.appendChild(dd);

  // Solo el filtro de Candidatos admite «Toda España» o una comunidad.
  // La ubicación de una oferta o de la clínica tiene que ser un municipio: de ahí salen los km.
  const soloMuni = inputId !== 'location-input-portal';
  function render(q){
    const nq = normalizeTxt(q);
    let out = '';
    if(!nq && soloMuni){
      let mia = ''; try{ mia = (JSON.parse(localStorage.getItem('cerco_empresa') || '{}').ciutat || '').trim(); }catch(e){}
      out += '<div style="padding:10px 14px 4px;font-size:10px;font-weight:800;text-transform:uppercase;letter-spacing:.5px;color:#6B7280;">'+(inputId === 'co-ubicacion' ? 'Municipio donde se trabaja' : 'Municipio de la clínica')+'</div>';
      if(mia && inputId === 'co-ubicacion') out += '<div onclick="pickLocation(\''+inputId+'\',\''+mia.replace(/\\/g,'').replace(/'/g,"\\'").replace(/"/g,'&quot;')+'\')" style="padding:10px 14px;font-size:13.5px;font-weight:700;color:#1A56DB;cursor:pointer;" onmouseenter="this.style.background=\'#F5F7FF\'" onmouseleave="this.style.background=\'white\'">'+mia.replace(/</g,'&lt;')+' <span style="color:#6B7280;font-size:11.5px;font-weight:500;">· tu clínica</span></div>';
      out += '<div style="padding:6px 14px 12px;font-size:12.5px;color:#6B7280;line-height:1.5;">Escribe el pueblo o la ciudad (por ejemplo: Girona, Salt o Lleida). Con eso cada candidato ve a cuántos km le queda.</div>';
    } else if(!nq){
      out += '<div style="padding:9px 14px 6px;font-size:10px;font-weight:800;text-transform:uppercase;letter-spacing:.5px;color:#6B7280;">Toda España</div>';
      out += '<div onclick="pickLocation(\''+inputId+'\',\'Toda España\')" style="padding:10px 14px;font-size:13.5px;font-weight:700;color:#1A56DB;cursor:pointer;" onmouseenter="this.style.background=\'#F5F7FF\'" onmouseleave="this.style.background=\'white\'"><span style="display:inline-flex;align-items:center;gap:7px;"><svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="display:inline-block;vertical-align:-0.15em;flex-shrink:0;"><circle cx="12" cy="12" r="10"/><path d="M12 2a14.5 14.5 0 0 0 0 20 14.5 14.5 0 0 0 0-20"/><path d="M2 12h20"/></svg>Buscar en toda España</span></div>';
      out += '<div style="padding:9px 14px 6px;font-size:10px;font-weight:800;text-transform:uppercase;letter-spacing:.5px;color:#6B7280;border-top:1px solid #F3F4F6;margin-top:4px;">Comunidades autónomas</div>';
      ES_REGIONS.forEach(function(r){
        out += '<div onclick="pickLocation(\''+inputId+'\',\''+r.replace(/'/g,"\\'")+'\')" style="padding:9px 14px;font-size:13px;color:#374151;cursor:pointer;" onmouseenter="this.style.background=\'#F5F7FF\'" onmouseleave="this.style.background=\'white\'">'+r+'</div>';
      });
    } else {
      const hitsR = soloMuni ? [] : ES_REGIONS.filter(function(r){ return normalizeTxt(r).includes(nq); });
      const hitsC = ES_LOCATIONS.filter(function(l){ return normalizeTxt(l.c).includes(nq) || normalizeTxt(l.p).includes(nq); }).slice(0,12);
      if(!soloMuni && ('toda españa'.includes(nq) || 'espana'.includes(nq))){
        out += '<div onclick="pickLocation(\''+inputId+'\',\'Toda España\')" style="padding:10px 14px;font-size:13.5px;font-weight:700;color:#1A56DB;cursor:pointer;"><span style="display:inline-flex;align-items:center;gap:7px;"><svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="display:inline-block;vertical-align:-0.15em;flex-shrink:0;"><circle cx="12" cy="12" r="10"/><path d="M12 2a14.5 14.5 0 0 0 0 20 14.5 14.5 0 0 0 0-20"/><path d="M2 12h20"/></svg>Buscar en toda España</span></div>';
      }
      hitsR.forEach(function(r){
        out += '<div onclick="pickLocation(\''+inputId+'\',\''+r.replace(/'/g,"\\'")+'\')" style="padding:9px 14px;font-size:13px;color:#374151;cursor:pointer;" onmouseenter="this.style.background=\'#F5F7FF\'" onmouseleave="this.style.background=\'white\'">'+r+' <span style="color:#6B7280;font-size:11.5px;">· comunidad</span></div>';
      });
      hitsC.forEach(function(l){
        out += '<div onclick="pickLocation(\''+inputId+'\',\''+l.c.replace(/'/g,"\\'")+'\')" style="padding:9px 14px;font-size:13px;color:#374151;cursor:pointer;" onmouseenter="this.style.background=\'#F5F7FF\'" onmouseleave="this.style.background=\'white\'"><b style="font-weight:600;">'+l.c+'</b> <span style="color:#6B7280;font-size:11.5px;">· '+l.p+', '+l.r+'</span></div>';
      });
      // Opción libre: usar exactamente lo que ha escrito (calle, pueblo, código postal...)
      const libre = q.trim();
      if(libre.length >= 2 && (!soloMuni || (window.CGeo && CGeo.lugar(libre)))){
        const yaEsta = hitsC.some(function(l){ return normalizeTxt(l.c) === nq; })
                    || hitsR.some(function(r){ return normalizeTxt(r) === nq; });
        if(!yaEsta){
          const esc = libre.replace(/\\/g,'').replace(/'/g,"\\'").replace(/"/g,'&quot;');
          const bloque = '<div onclick="pickLocation(\'' + inputId + '\',\'' + esc + '\')" '
            + 'style="padding:11px 14px;cursor:pointer;border-top:' + (out ? '1px solid #F3F4F6' : 'none') + ';" '
            + 'onmouseenter="this.style.background=\'#F5F7FF\'" onmouseleave="this.style.background=\'white\'">'
            + '<div style="font-size:13.5px;color:#1A56DB;font-weight:600;">Usar &quot;' + libre + '&quot;</div>'
            + '<div style="font-size:11.5px;color:#6B7280;margin-top:2px;">Dirección, pueblo o código postal</div></div>';
          out = out ? out + bloque : bloque;
        }
      }
      if(!out) out = '<div style="padding:14px;font-size:13px;color:#6B7280;line-height:1.5;">'+(soloMuni ? 'No encontramos ese municipio. Escribe el pueblo o la ciudad, sin la comunidad ni la provincia.' : 'Sigue escribiendo tu dirección…')+'</div>';
    }
    dd.innerHTML = out;
  }
  input.addEventListener('focus', function(){ render(''); dd.style.display='block'; });
  input.addEventListener('input', function(){ render(input.value); dd.style.display='block'; });
  // Enter confirma lo escrito aunque no esté en la lista
  input.addEventListener('keydown', function(e){
    if(e.key === 'Enter'){
      e.preventDefault();
      dd.style.display = 'none';
      input.blur();
      if(inputId === 'location-input-portal' && typeof applyFilters_portal === 'function') applyFilters_portal();
      if(inputId === 'clinic-address-portal' && typeof updateOriginNote === 'function') updateOriginNote();
    }
    if(e.key === 'Escape'){ dd.style.display = 'none'; input.blur(); }
  });
  document.addEventListener('click', function(e){ if(!wrap.contains(e.target)) dd.style.display='none'; });
}
/* Elegir un municipio de la lista; si es la dirección de la clínica, se vuelven a filtrar los candidatos por km (Fase 1: una sola versión) */
function pickLocation(inputId, value){
  var r = _pickLocationBase.apply(this, arguments);
  if(inputId === 'clinic-address-portal' && typeof applyFilters_portal === 'function') applyFilters_portal();
  return r;
}
function _pickLocationBase(inputId, value){
  const input = document.getElementById(inputId);
  if(!input) return;
  input.value = value;
  const wrap = input.parentNode;
  const dd = wrap.querySelector('div[style*="position:absolute"]');
  if(dd) dd.style.display = 'none';
  if(inputId === 'location-input-portal' && typeof applyFilters_portal === 'function') applyFilters_portal();
  if(inputId === 'co-ubicacion' && typeof suggestDiscFromRole === 'function') suggestDiscFromRole();
}
['location-input-portal','co-ubicacion','f-ciutat-onboarding','clinic-address-portal'].forEach(function(id){
  try { initLocationPicker(id); } catch(e){ console.warn('Buscador de ubicación no disponible para', id); }
});



// ---- Navegación móvil ----
const MTAB_TITLES = {
  inicio:'Inicio', ofertes:'Mis ofertas', portal:'Candidatos', stats:'Estadísticas',
  herramientas:'Herramientas', 'crear-oferta':'Nueva oferta', onboarding:'Mi clínica',
  publicat:'Perfil publicado', 'mi-cuenta':'Mi cuenta', login:'Acceso', benvinguda:'Bienvenida',
  oferta:'Detalle de oferta', candidat:'Perfil de candidato', testdisc:'Test DISC',
  entrevista:'Entrevista', aplicar:'Solicitud', estat:'Estado'
};
function mobileGo(id){
  closeMobileSheet();
  if(window.showScreen) window.showScreen(id);
}
function openMobileSheet(){
  document.getElementById('mobile-sheet-bg').classList.add('open');
  document.getElementById('mobile-sheet').classList.add('open');
}
function closeMobileSheet(){
  document.getElementById('mobile-sheet-bg').classList.remove('open');
  document.getElementById('mobile-sheet').classList.remove('open');
}
function syncMobileChrome(id){
  const t = document.getElementById('mtop-title');
  if(t) t.textContent = MTAB_TITLES[id] || 'CERCO';
  document.querySelectorAll('.mtab').forEach(function(tab){
    tab.classList.toggle('active', tab.dataset.tab === id);
  });
  const av = document.getElementById('mtop-avatar');
  if(av){
    try {
      const d = JSON.parse(localStorage.getItem('cerco_empresa') || '{}');
      const n = d.nomResp || d.nom;
      if(n) av.textContent = n.charAt(0).toUpperCase();
    } catch(e){}
  }
}






window.LUCIDE_SVG = {"search": "<svg xmlns=\"http://www.w3.org/2000/svg\" width=\"22\" height=\"22\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"#1A56DB\" stroke-width=\"2\" stroke-linecap=\"round\" stroke-linejoin=\"round\" style=\"display:inline-block;vertical-align:-0.15em;flex-shrink:0;\"><path d=\"m21 21-4.34-4.34\"/><circle cx=\"11\" cy=\"11\" r=\"8\"/></svg>", "target": "<svg xmlns=\"http://www.w3.org/2000/svg\" width=\"22\" height=\"22\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"#1A56DB\" stroke-width=\"2\" stroke-linecap=\"round\" stroke-linejoin=\"round\" style=\"display:inline-block;vertical-align:-0.15em;flex-shrink:0;\"><circle cx=\"12\" cy=\"12\" r=\"10\"/><circle cx=\"12\" cy=\"12\" r=\"6\"/><circle cx=\"12\" cy=\"12\" r=\"2\"/></svg>", "compass": "<svg xmlns=\"http://www.w3.org/2000/svg\" width=\"22\" height=\"22\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"#1A56DB\" stroke-width=\"2\" stroke-linecap=\"round\" stroke-linejoin=\"round\" style=\"display:inline-block;vertical-align:-0.15em;flex-shrink:0;\"><path d=\"m16.24 7.76-1.804 5.411a2 2 0 0 1-1.265 1.265L7.76 16.24l1.804-5.411a2 2 0 0 1 1.265-1.265z\"/><circle cx=\"12\" cy=\"12\" r=\"10\"/></svg>", "bar-chart-3": "<svg xmlns=\"http://www.w3.org/2000/svg\" width=\"22\" height=\"22\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"#1A56DB\" stroke-width=\"2\" stroke-linecap=\"round\" stroke-linejoin=\"round\" style=\"display:inline-block;vertical-align:-0.15em;flex-shrink:0;\"><path d=\"M3 3v16a2 2 0 0 0 2 2h16\"/><path d=\"M18 17V9\"/><path d=\"M13 17V5\"/><path d=\"M8 17v-3\"/></svg>", "pencil": "<svg xmlns=\"http://www.w3.org/2000/svg\" width=\"22\" height=\"22\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"#1A56DB\" stroke-width=\"2\" stroke-linecap=\"round\" stroke-linejoin=\"round\" style=\"display:inline-block;vertical-align:-0.15em;flex-shrink:0;\"><path d=\"M21.174 6.812a1 1 0 0 0-3.986-3.987L3.842 16.174a2 2 0 0 0-.5.83l-1.321 4.352a.5.5 0 0 0 .623.622l4.353-1.32a2 2 0 0 0 .83-.497z\"/><path d=\"m15 5 4 4\"/></svg>", "message-circle": "<svg xmlns=\"http://www.w3.org/2000/svg\" width=\"22\" height=\"22\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"#1A56DB\" stroke-width=\"2\" stroke-linecap=\"round\" stroke-linejoin=\"round\" style=\"display:inline-block;vertical-align:-0.15em;flex-shrink:0;\"><path d=\"M7.9 20A9 9 0 1 0 4 16.1L2 22z\"/></svg>", "clipboard-list": "<svg xmlns=\"http://www.w3.org/2000/svg\" width=\"22\" height=\"22\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"#1A56DB\" stroke-width=\"2\" stroke-linecap=\"round\" stroke-linejoin=\"round\" style=\"display:inline-block;vertical-align:-0.15em;flex-shrink:0;\"><rect width=\"8\" height=\"4\" x=\"8\" y=\"2\" rx=\"1\" ry=\"1\"/><path d=\"M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2\"/><path d=\"M12 11h4\"/><path d=\"M12 16h4\"/><path d=\"M8 11h.01\"/><path d=\"M8 16h.01\"/></svg>", "building-2": "<svg xmlns=\"http://www.w3.org/2000/svg\" width=\"22\" height=\"22\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"#1A56DB\" stroke-width=\"2\" stroke-linecap=\"round\" stroke-linejoin=\"round\" style=\"display:inline-block;vertical-align:-0.15em;flex-shrink:0;\"><path d=\"M6 22V4a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v18Z\"/><path d=\"M6 12H4a2 2 0 0 0-2 2v6a2 2 0 0 0 2 2h2\"/><path d=\"M18 9h2a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2h-2\"/><path d=\"M10 6h4\"/><path d=\"M10 10h4\"/><path d=\"M10 14h4\"/><path d=\"M10 18h4\"/></svg>"};


function toggleToolCard(id){
  const more = document.getElementById('more-'+id);
  const chev = document.getElementById('chev-'+id);
  if(!more) return;
  const open = more.style.display === 'block';
  document.querySelectorAll('#screen-herramientas .tc-more').forEach(function(m){ m.style.display='none'; });
  document.querySelectorAll('#screen-herramientas .tc-chev').forEach(function(c){ c.style.transform='rotate(0deg)'; });
  if(!open){
    more.style.display = 'block';
    if(chev) chev.style.transform = 'rotate(180deg)';
  }
}


function updateOriginNote(){ if(typeof applyFilters_portal === 'function') applyFilters_portal(); }


function downloadFullCV(){
  try {
    var nom = 'María García';
    try {
      var t = document.querySelector('#screen-candidat h1, #screen-candidat .cand-name, #screen-candidat .cand-strip-name');
      if(t && t.textContent.trim()){
        // ens quedem nomes amb el nom: fora edat, comes i tot el que vingui darrere
        nom = t.textContent.trim().split(/[,·|\n]/)[0].replace(/\s*\d+\s*$/,'').trim() || nom;
      }
    } catch(e){}
    var bytes = construirPDFCurriculum(nom);
    var blob = new Blob([bytes], {type:'application/pdf'});
    var url = URL.createObjectURL(blob);
    var a = document.createElement('a');
    a.href = url;
    a.download = 'CV_' + nom.replace(/[^A-Za-zÀ-ÿ0-9]+/g,'_') + '.pdf';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    setTimeout(function(){ URL.revokeObjectURL(url); }, 4000);
    if(typeof showToast === 'function') showToast('CV descargado');
  } catch(e){
    if(typeof showToast === 'function') showToast('No se ha podido generar el PDF');
  }
}

/* Construeix un PDF valid sense cap llibreria externa. */
function construirPDFCurriculum(nombre){
  var lineas = [
    ['H1', nombre],
    ['P',  'Higienista Dental · Perfil DISC I/C'],
    ['', ''],
    ['H2', 'EXPERIENCIA'],
    ['P',  'Clínica Dental Sants — Higienista (2022-2026)'],
    ['S',  'Higienes, sellados y educación en salud bucodental.'],
    ['S',  'Seguimiento de pacientes con periodontitis.'],
    ['P',  'Clínica Odontomas — Auxiliar (2020-2022)'],
    ['S',  'Instrumentación y esterilización según protocolo.'],
    ['', ''],
    ['H2', 'FORMACIÓN'],
    ['P',  'CFGS Higiene Bucodental — IES Bonanova (2020)'],
    ['S',  'Curso de periodoncia avanzada (2023)'],
    ['', ''],
    ['H2', 'IDIOMAS'],
    ['S',  'Castellano y catalán nativos. Inglés B2.'],
    ['', ''],
    ['H2', 'PERFIL DE PERSONALIDAD'],
    ['S',  'Influyente con rasgo Concienzudo (I/C).'],
    ['S',  'Trato cercano con el paciente y precisión en el protocolo.'],
    ['', ''],
    ['S',  'Documento generado por CERCO'],
    ['S',  'Porque el talento dental también merece encontrarse']
  ];

  var esc = function(t){
    return String(t)
      .replace(/[—–]/g,'-').replace(/[""]/g,'\"').replace(/['']/g,"'").replace(/…/g,'...')
      .replace(/\\/g,'\\\\').replace(/\(/g,'\\(').replace(/\)/g,'\\)');
  };

  var y = 770;
  var cont = 'BT\n';
  lineas.forEach(function(l){
    var tipo = l[0], txt = l[1];
    if(!txt){ y -= 10; return; }
    var fuente, tam, sangria;
    if(tipo === 'H1'){ fuente='/F2'; tam=20; sangria=60; y -= 6; }
    else if(tipo === 'H2'){ fuente='/F2'; tam=11; sangria=60; y -= 8; }
    else if(tipo === 'P'){ fuente='/F2'; tam=10; sangria=60; }
    else { fuente='/F1'; tam=10; sangria=68; }
    cont += '/'.slice(0,0) + fuente + ' ' + tam + ' Tf\n';
    cont += '1 0 0 1 ' + sangria + ' ' + y + ' Tm\n';
    cont += '(' + esc(txt) + ') Tj\n';
    y -= (tipo === 'H1' ? 26 : (tipo === 'H2' ? 18 : 15));
  });
  cont += 'ET';

  var objetos = [
    '<< /Type /Catalog /Pages 2 0 R >>',
    '<< /Type /Pages /Kids [3 0 R] /Count 1 >>',
    '<< /Type /Page /Parent 2 0 R /MediaBox [0 0 595 842] /Resources << /Font << /F1 5 0 R /F2 6 0 R >> >> /Contents 4 0 R >>',
    '<< /Length ' + cont.length + ' >>\nstream\n' + cont + '\nendstream',
    '<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica /Encoding /WinAnsiEncoding >>',
    '<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica-Bold /Encoding /WinAnsiEncoding >>'
  ];

  var pdf = '%PDF-1.4\n';
  var pos = [];
  objetos.forEach(function(o, i){
    pos.push(pdf.length);
    pdf += (i+1) + ' 0 obj\n' + o + '\nendobj\n';
  });
  var xref = pdf.length;
  pdf += 'xref\n0 ' + (objetos.length+1) + '\n0000000000 65535 f \n';
  pos.forEach(function(x){
    pdf += ('0000000000' + x).slice(-10) + ' 00000 n \n';
  });
  pdf += 'trailer\n<< /Size ' + (objetos.length+1) + ' /Root 1 0 R >>\nstartxref\n' + xref + '\n%%EOF';

  // Latin-1: cada caracter es un byte
  var buf = new Uint8Array(pdf.length);
  for(var i=0;i<pdf.length;i++){
    var c = pdf.charCodeAt(i);
    buf[i] = c < 256 ? c : 63;   // el que no hi cap, interrogant
  }
  return buf;
}


function syncWorkspaceName(){
  try {
    const d = JSON.parse(localStorage.getItem('cerco_empresa') || '{}');
    const n = document.getElementById('ws-name');
    const i = document.getElementById('ws-initial');
    const p = document.getElementById('ws-plan');
    if(d.nom){
      if(n) n.textContent = d.nom;
      if(i) i.textContent = d.nom.charAt(0).toUpperCase();
      if(p) p.textContent = 'Plan gratuito';
    } else if(window.CDB && !CDB.demo()){
      if(n) n.textContent = 'Tu clínica';
      if(i) i.textContent = 'C';
      if(p) p.textContent = 'Sin configurar';
    } else {
      if(n) n.textContent = 'Clínica Dental Madrid Centro';
      if(i) i.textContent = 'C';
      if(p) p.textContent = 'Ejemplo';
    }
  } catch(e){}
}


// ---- Enlace de invitación al equipo (funciona sin servidor) ----
function getBaseUrl(){
  return location.origin + location.pathname;
}
function buildInviteLink(){
  let nombre = '';
  try { const d = JSON.parse(localStorage.getItem('cerco_empresa')||'{}'); nombre = d.nom||''; } catch(e){}
  if(!nombre) nombre = document.getElementById('f-nom-onboarding')?.value.trim()||'';
  if(!nombre) return null;
  var base = location.origin + location.pathname;
  // Si hay nube, el enlace lleva el identificador de la clínica: así el
  // resultado del trabajador llega solo, sin códigos de por medio.
  try {
    if(window.Nube && Nube.activa && Nube.uid){
      return base + '?c=' + encodeURIComponent(Nube.uid) + '&n=' + encodeURIComponent(nombre);
    }
  } catch(e){}
  return base + '?equipo=' + encodeURIComponent(nombre);
}
function refreshInviteLink(){
  const link = buildInviteLink();
  ['invite-link-input','invite-link-stats'].forEach(function(id){
    const inp = document.getElementById(id);
    if(inp) inp.value = link || 'Completa el nombre de tu clínica en Mi clínica';
  });
}
function copyInviteLink(btn){
  const link = buildInviteLink();
  if(!link){
    showToast('Primero escribe el nombre de tu clínica en el paso 1');
    return;
  }
  const done = function(){
    if(btn){ const t = btn.textContent; btn.textContent = 'Copiado'; setTimeout(function(){ btn.textContent = t; }, 1600); }
    showToast('Enlace copiado — ya puedes enviarlo por WhatsApp');
  };
  if(navigator.clipboard && navigator.clipboard.writeText){
    navigator.clipboard.writeText(link).then(done).catch(function(){
      const inp = document.getElementById('invite-link-stats') || document.getElementById('invite-link-input');
      if(inp){ inp.select(); document.execCommand('copy'); done(); }
    });
  } else {
    const inp = document.getElementById('invite-link-stats') || document.getElementById('invite-link-input');
    if(inp){ inp.select(); document.execCommand('copy'); done(); }
  }
}

// Detectar si alguien llega por un enlace de invitación
function detectarInvitacion(){
  const params = new URLSearchParams(location.search);
  const cid = params.get('c');
  const equipo = params.get('equipo') || params.get('n');
  if(!cid && !equipo) return false;

  window.cercoClinicaId = cid || null;
  const el = document.getElementById('invitado-clinica');
  if(el) el.textContent = equipo || 'Tu clínica';
  try { sessionStorage.setItem('cerco_invitado_clinica', equipo || ''); } catch(e){}
  if(cid){ try { sessionStorage.setItem('cerco_invitado_cid', cid); } catch(e){} }

  // Si no nos han dicho el nombre, lo preguntamos a la nube
  if(cid && !equipo && window.Nube){
    Nube.nombreClinicaPorId(cid).then(function(n){
      if(n && el) el.textContent = n;
      try { sessionStorage.setItem('cerco_invitado_clinica', n||''); } catch(e){}
    }).catch(function(){});
  }

  try{
    var propi = CDB.registrado() || CAuth.existe();
    var sal = document.getElementById('invitado-salida');
    if(sal && propi) sal.style.display = 'block';
  }catch(e){}
  return true;
}
function empezarTestInvitado(){
  const nombre = document.getElementById('invitado-nombre')?.value.trim();
  if(!nombre){ showToast('Escribe tu nombre para empezar'); return; }
  try { sessionStorage.setItem('cerco_invitado_nombre', nombre); } catch(e){}
  window.esInvitado = true;
  showScreen('testdisc');
}


/* ============================================================
   CERCO · DATOS DE LA CLÍNICA
   Todo lo que ve el propietario sale de aquí. Si acaba de
   registrarse, las cifras son cero y van subiendo con lo que
   hace. Los datos de ejemplo viven aparte y siempre van
   marcados como ejemplo.
   ============================================================ */
window.CDB = {
  K: { emp:'cerco_empresa', eq:'cerco_equipo', of:'cerco_ofertas',
       pl:'cerco_plantilla', demo:'cerco_demo', me:'cerco_disc_empresa',
       alta:'cerco_alta' },
  LETRAS: ['D','I','S','C'],
  COLOR: { D:'#FF5A5F', I:'#F0A800', S:'#00B488', C:'#5B5FE0' },
  NOMBRE: { D:'Dominante', I:'Influyente', S:'Estable', C:'Concienzudo' },

  _get: function(k, def){ try{ var v = localStorage.getItem(k); return v===null? def : JSON.parse(v); }catch(e){ return def; } },
  _set: function(k, v){ try{ localStorage.setItem(k, JSON.stringify(v)); }catch(e){} },

  clinica: function(){ var c = this._get(this.K.emp, {}); return (c && typeof c==='object') ? c : {}; },
  nombreClinica: function(){ return (this.clinica().nom || '').trim(); },
  registrado: function(){ return !!this.nombreClinica(); },
  miDisc: function(){ return this._get(this.K.me, null); },
  equipo: function(){ var e = this._get(this.K.eq, []); return Array.isArray(e)? e : []; },
  ofertas: function(){ var o = this._get(this.K.of, []); return Array.isArray(o)? o : []; },
  plantilla: function(){ var n = parseInt(this._get(this.K.pl, 0),10); return isNaN(n)?0:n; },
  setPlantilla: function(n){
    var v = parseInt(n,10);
    if(isNaN(v) || v < 0) v = 0;
    if(v > 999) v = 999;
    this._set(this.K.pl, v);
  },

  fechaAlta: function(){
    var f = this._get(this.K.alta, null);
    if(!f){ f = new Date().toISOString(); this._set(this.K.alta, f); }
    return f;
  },
  diasDesdeAlta: function(){
    var d = Math.floor((Date.now() - new Date(this.fechaAlta()).getTime()) / 86400000);
    return d < 0 ? 0 : d;
  },

  /* modo ejemplo: encendido mientras no hay clínica registrada */
  demo: function(){
    var v = null;
    try{ v = localStorage.getItem(this.K.demo); }catch(e){}
    if(v === null) return !this.registrado();
    return v === '1';
  },
  setDemo: function(b){
    try{ localStorage.setItem(this.K.demo, b ? '1':'0'); }catch(e){}
    this.aplicarModo();
    this.renderTodo();
  },
  aplicarModo: function(){
    document.body.classList.toggle('solo-real', !this.demo());
  },

  /* --- equipo --- */
  addMiembro: function(m){
    var l = this.equipo();
    m.id = 'm' + Date.now() + Math.floor(Math.random()*1000);
    m.fecha = new Date().toISOString();
    l.push(m);
    this._set(this.K.eq, l);
    try{ if(window._subirMiembro) _subirMiembro(m); }catch(e){}
    return m;
  },
  delMiembro: function(id){
    this._set(this.K.eq, this.equipo().filter(function(x){ return x.id !== id; }));
    try{ if(window.Nube && Nube.activa) Nube.borrarMiembro(id); }catch(e){}
  },

  /* el responsable cuenta como miembro en cuanto hace su test */
  equipoCompleto: function(){
    var l = this.equipo().slice();
    var mio = this.miDisc();
    if(mio && mio.dominant){
      l.unshift({ id:'__yo__', nombre:(this.clinica().nomResp || 'Tú'), rol:'Responsable',
                  dom:mio.dominant, sec:mio.secondary, pct:(mio.norm? mio.norm[mio.dominant]:null), yo:true });
    }
    return l;
  },

  /* --- cálculo de la composición DISC ---
     el perfil principal pesa el doble que el secundario */
  composicion: function(){
    var eq = this.equipoCompleto(), p = {D:0,I:0,S:0,C:0}, tot = 0;
    eq.forEach(function(m){
      if(p[m.dom] !== undefined){ p[m.dom] += 2; tot += 2; }
      if(p[m.sec] !== undefined){ p[m.sec] += 1; tot += 1; }
    });
    var out = {};
    this.LETRAS.forEach(function(l){ out[l] = tot ? Math.round(p[l]/tot*100) : 0; });
    if(tot){
      var suma = out.D+out.I+out.S+out.C;
      if(suma !== 100){
        var mayor = this.LETRAS.slice().sort(function(a,b){ return out[b]-out[a]; })[0];
        out[mayor] += (100 - suma);
      }
    }
    return out;
  },

  /* Quin perfil te menys pes a l equip. Amb menys de 3 tests no hi ha
     prou base per dir res: ho diem, en lloc d inventar-nos-ho. */
  perfilQueFalta: function(){
    var eq = this.equipoCompleto();
    var ambTest = eq.filter(function(m){ return !!m.dom; }).length;
    var comp = this.composicion();
    var orden = this.LETRAS.slice().sort(function(a,b){ return comp[a]-comp[b]; });
    return {
      fiable: ambTest >= 3,
      tests: ambTest,
      falta: orden[0],
      segona: orden[1],
      pct: comp[orden[0]],
      comp: comp
    };
  },

  ofertasPorEstado: function(){
    var r = { activa:0, pausada:0, cerrada:0 };
    this.ofertas().forEach(function(o){ var e = o.estado || 'activa'; if(r[e]!==undefined) r[e]++; });
    return r;
  },

  candidatosRecibidos: function(){
    // con solicitudes reales se cuentan personas (clinica/02-solicitudes-reales.js)
    if(!(this.demo && this.demo()) && window.CERCO_contarCandidatosReales) return CERCO_contarCandidatosReales();
    var n = 0;
    this.ofertas().forEach(function(o){ n += (parseInt(o.candidatos,10) || 0); });
    return n;
  },

  resumen: function(){
    var eq = this.equipoCompleto();
    var est = this.ofertasPorEstado();
    var pl = this.plantilla();
    var r = {
      clinica: this.nombreClinica(),
      responsable: (this.clinica().nomResp || '').trim(),
      miembros: eq.length,
      plantilla: pl,
      pendientes: pl > eq.length ? pl - eq.length : 0,
      comp: this.composicion(),
      ofertas: this.ofertas().length,
      activas: est.activa, pausadas: est.pausada, cerradas: est.cerrada,
      candidatos: this.candidatosRecibidos(),
      contratados: 0,
      miDiscHecho: !!this.miDisc(),
      dias: this.diasDesdeAlta()
    };
    // contratados: de las solicitudes reales (clinica/04-clinica-y-candidato.js)
    try{ if(!this.demo() && window.CERCO_contarContratados) r.contratados = CERCO_contarContratados(); }catch(x){}
    return r;
  },

  /* --- código de resultado del test: MG-IC-08 --- */
  parseCodigo: function(txt){
    if(!txt) return null;
    var c = txt.trim().toUpperCase().replace(/\s+/g,'');
    var m = c.match(/^([A-ZÑ]{1,3})-([DISC])([DISC])-(\d{1,3})$/);
    if(!m) return null;
    if(m[2] === m[3]) return null;           // el perfil principal i el secundari no poden ser el mateix
    var pct = parseInt(m[4],10);
    if(isNaN(pct) || pct > 100) return null; // un percentatge per sobre de 100 no existeix
    return { ini:m[1], dom:m[2], sec:m[3], pct:pct };
  },

  reset: function(){
    var self = this;
    [this.K.emp, this.K.eq, this.K.of, this.K.pl, this.K.me, this.K.alta,
     'cerco_disc_individual'].forEach(function(k){
      try{ localStorage.removeItem(k); }catch(e){}
    });
    try{ localStorage.removeItem(self.K.demo); }catch(e){}
  },

  renderTodo: function(){
    // avisos de lo que ha hecho el candidato desde la última vez (clinica/04-clinica-y-candidato.js)
    try{ if(window.CERCO_avisosCandidatos) CERCO_avisosCandidatos(); }catch(x){}
    try{ if(typeof renderInicioReal==='function') renderInicioReal(); }catch(e){}
    try{ if(typeof renderStatsReal==='function') renderStatsReal(); }catch(e){}
    try{ if(typeof renderEquipo==='function') renderEquipo(); }catch(e){}
    try{ if(typeof pintarOfertasReales==='function') pintarOfertasReales(); }catch(e){}
    try{ if(typeof renderPortalReal==='function') renderPortalReal(); }catch(e){}
    try{ if(typeof renderMiCuenta==='function') renderMiCuenta(); }catch(e){}
    try{ if(typeof renderPerfilPublico==='function') renderPerfilPublico(); }catch(e){}
    try{ if(typeof renderSwitchDemo==='function') renderSwitchDemo(); }catch(e){}
    try{ if(typeof syncWorkspaceName==='function') syncWorkspaceName(); }catch(e){}
  }
};

/* ---------- utilidades de pintado ---------- */
function _ini(nombre){
  return (nombre||'?').trim().split(/\s+/).map(function(p){ return p.charAt(0).toUpperCase(); }).join('').slice(0,2) || '?';
}
function _svg(d, color, size){
  return '<svg xmlns="http://www.w3.org/2000/svg" width="'+(size||16)+'" height="'+(size||16)+'" viewBox="0 0 24 24" fill="none" stroke="'+(color||'currentColor')+'" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round" style="display:inline-block;vertical-align:-0.15em;flex-shrink:0;">'+d+'</svg>';
}
var ICO = {
  check:'<path d="M20 6 9 17l-5-5"/>',
  users:'<path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/>',
  chart:'<path d="M3 3v16a2 2 0 0 0 2 2h16"/><path d="M18 17V9"/><path d="M13 17V5"/><path d="M8 17v-3"/>',
  spark:'<path d="m12 3-1.9 5.8a2 2 0 0 1-1.3 1.3L3 12l5.8 1.9a2 2 0 0 1 1.3 1.3L12 21l1.9-5.8a2 2 0 0 1 1.3-1.3L21 12l-5.8-1.9a2 2 0 0 1-1.3-1.3z"/>',
  link:'<path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/>',
  brief:'<path d="M12 17v5"/><path d="M9 10.76a2 2 0 0 1-1.11 1.79l-1.78.9A2 2 0 0 0 5 15.24V16a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1v-.76a2 2 0 0 0-1.11-1.79l-1.78-.9A2 2 0 0 1 15 10.76V7a1 1 0 0 1 1-1 2 2 0 0 0 0-4H8a2 2 0 0 0 0 4 1 1 0 0 1 1 1z"/>',
  build:'<path d="M6 22V4a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v18Z"/><path d="M10 6h4"/><path d="M10 10h4"/><path d="M10 14h4"/><path d="M10 18h4"/>',
  trash:'<path d="M3 6h18"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6"/><path d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>',
  info:'<circle cx="12" cy="12" r="10"/><path d="M12 16v-4"/><path d="M12 8h.01"/>'
};

/* ============================ INICIO ============================ */
/* Inicio de la clínica (Fase 1: una sola versión). Antes eran siete versiones
   envueltas; ahora se pinta la base y después cada bloque, en el mismo orden.
   Un fallo en un bloque no impide pintar los demás, igual que antes. */
function renderInicioReal(){
  try{ _pintarInicioBase(); }catch(x){}
  ['CERCO_inicioSolicitudes', 'CERCO_inicioCitas', 'CERCO_inicioPlazos', 'CERCO_inicioLider', 'CERCO_inicioConfianza', 'CERCO_inicioAgenda']
    .forEach(function(bloque){ try{ if(window[bloque]) window[bloque](); }catch(x){} });
}
function _pintarInicioBase(){
  var box = document.getElementById('inicio-real');
  if(!box) return;
  if(CDB.demo()){ box.innerHTML=''; box.style.display='none'; return; }
  box.style.display='';

  var r = CDB.resumen();
  var hoy = new Date();
  var dias=['domingo','lunes','martes','miércoles','jueves','viernes','sábado'];
  var meses=['enero','febrero','marzo','abril','mayo','junio','julio','agosto','septiembre','octubre','noviembre','diciembre'];
  var fecha = dias[hoy.getDay()] + ', ' + hoy.getDate() + ' de ' + meses[hoy.getMonth()];
  fecha = fecha.charAt(0).toUpperCase() + fecha.slice(1);
  var h = hoy.getHours();
  var saludo = h < 14 ? 'Buenos días' : (h < 21 ? 'Buenas tardes' : 'Buenas noches');
  var nom = r.responsable ? (', ' + r.responsable.split(/\s+/)[0]) : '';

  var pasos = [
    { ok: !!r.clinica, tit:'Completa los datos de tu clínica',
      sub: r.clinica ? r.clinica : 'Nombre, dirección y especialidades',
      btn:'Completar', scr:'onboarding' },
    { ok: r.miDiscHecho, tit:'Haz tu test de personalidad',
      sub: r.miDiscHecho ? 'Hecho — ya contamos tu perfil en el equipo' : 'Son 5 minutos. Es la base de todo lo demás',
      btn:'Hacer el test', scr:'testdisc' },
    { ok: r.miembros > 1, tit:'Invita a tu equipo',
      sub: r.miembros > 1 ? (r.miembros + ' personas con el test hecho') : 'Envíales el enlace y añade sus resultados',
      btn:'Invitar', scr:'equipo' },
    { ok: r.ofertas > 0, tit:'Publica tu primera oferta',
      sub: r.ofertas > 0 ? (r.ofertas + ' oferta' + (r.ofertas>1?'s':'') + ' publicada' + (r.ofertas>1?'s':'')) : 'Cuando necesites cubrir un puesto',
      btn:'Publicar', scr:'crear-oferta' }
  ];
  var hechos = pasos.filter(function(p){ return p.ok; }).length;

  var html = '';
  html += '<div style="margin-bottom:24px;">'
        + '<div style="font-size:13px;color:#6B7280;margin-bottom:4px;">'+fecha+'</div>'
        + '<h1 style="font-size:24px;font-weight:800;color:#111827;margin:0;">'+saludo+_esc(nom)+'</h1>'
        + '</div>';

  /* --- primeros pasos, mientras queden --- */
  if(hechos < 4){
    html += '<div style="background:white;border-radius:16px;border:1px solid #EAECF0;overflow:hidden;margin-bottom:16px;box-shadow:0 1px 4px rgba(0,0,0,.04);">'
          + '<div style="padding:18px 20px 14px;border-bottom:1px solid #F3F4F6;">'
          + '<div style="display:flex;justify-content:space-between;align-items:center;gap:12px;">'
          + '<div><div style="font-size:15px;font-weight:800;color:#111827;">Primeros pasos</div>'
          + '<div style="font-size:12.5px;color:#6B7280;margin-top:2px;">Tu panel se irá llenando a medida que los completes</div></div>'
          + '<div style="font-size:13px;font-weight:800;color:#1A56DB;white-space:nowrap;">'+hechos+' de 4</div></div>'
          + '<div style="background:#F3F4F6;border-radius:99px;height:6px;margin-top:12px;">'
          + '<div style="width:'+(hechos/4*100)+'%;background:#1A56DB;height:100%;border-radius:99px;transition:width .3s;"></div></div>'
          + '</div>';
    pasos.forEach(function(p,i){
      html += '<div class="paso-row'+(p.ok?' hecho':'')+'">'
            + '<div class="paso-num">'+(p.ok? _svg(ICO.check,'#0E9F6E',15) : (i+1))+'</div>'
            + '<div style="flex:1;min-width:0;"><div class="paso-tit">'+p.tit+'</div><div class="paso-sub">'+_esc(p.sub)+'</div></div>'
            + (p.ok ? '' : '<button class="paso-btn" onclick="showScreen(\''+p.scr+'\')">'+p.btn+'</button>')
            + '</div>';
    });
    html += '</div>';
  }

  /* --- cifras reales --- */
  html += '<div style="display:grid;grid-template-columns:repeat(4,1fr);gap:12px;margin-bottom:16px;" class="inicio-kpis">'
    + _kpi(r.activas, 'Ofertas activas', 'ofertes')
    + _kpi(r.candidatos, 'Candidatos recibidos', 'portal')
    + _kpi(r.miembros + (r.plantilla ? '/'+r.plantilla : ''), 'Test del equipo', 'equipo')
    + '<div onclick="showScreen(\'crear-oferta\')" style="background:#1A56DB;border-radius:14px;padding:16px;text-align:center;cursor:pointer;box-shadow:0 4px 12px rgba(26,86,219,.25);">'
    + '<div style="font-size:24px;font-weight:800;color:white;">+</div>'
    + '<div style="font-size:11.5px;color:rgba(255,255,255,.85);margin-top:2px;">Nueva oferta</div></div>'
    + '</div>';

  /* --- qué pasa hoy --- */
  if(r.candidatos === 0){
    html += '<div class="cerco-empty" style="margin-bottom:16px;">'
          + _svg(ICO.users,'#C3CBD9',30)
          + '<h3>Aún no tienes candidatos</h3>'
          + '<p>Cuando publiques una oferta y alguien se inscriba, aparecerá aquí con su encaje calculado. '
          + 'Todo lo que veas en esta pantalla será tuyo, nunca datos inventados.</p>'
          + '<button class="paso-btn" style="margin-top:16px;" onclick="showScreen(\'crear-oferta\')">Publicar una oferta</button>'
          + '</div>';
  }

  /* --- Seimian: solo dice algo cuando hay datos para decirlo --- */
  html += '<div style="background:linear-gradient(135deg,#0F1C3F,#1A3A6B);border-radius:16px;padding:20px;">'
        + '<div style="font-size:11px;font-weight:800;text-transform:uppercase;letter-spacing:.5px;color:rgba(255,255,255,.5);margin-bottom:10px;">'
        + '<span style="display:inline-flex;align-items:center;gap:7px;">'+_svg(ICO.spark,'#F5A623',15)+'Seimian</span></div>'
        + '<div style="font-size:13.5px;color:white;line-height:1.6;">' + _mensajeSeimian(r) + '</div>'
        + '</div>';

  box.innerHTML = html;
}

function _kpi(valor, etiqueta, pantalla){
  return '<div onclick="showScreen(\''+pantalla+'\')" style="background:white;border-radius:14px;border:1px solid #EAECF0;padding:16px;text-align:center;cursor:pointer;box-shadow:0 1px 3px rgba(0,0,0,.04);">'
       + '<div style="font-size:24px;font-weight:800;color:#111827;">'+valor+'</div>'
       + '<div style="font-size:11.5px;color:#6B7280;margin-top:2px;">'+etiqueta+'</div></div>';
}

function _mensajeSeimian(r){
  // El teu test compta si el tens guardat O si ja surts a la llista
  // de l equip amb perfil. Abans mirava nomes una cosa i es
  // contradeia amb el que es veia a la llista del costat.
  var joHiSoc = !!r.miDiscHecho;
  if(!joHiSoc){
    try {
      joHiSoc = (CDB.equipoCompleto()||[]).some(function(m){ return m.yo && m.dom; });
    } catch(e){}
  }
  var falta = joHiSoc ? '' :
    ' Te falta tu propio test: sin él no cuento contigo en la lectura del equipo.';
  if(r.miembros === 0)
    return 'Empieza por tu test de personalidad. Sin él no puedo calcular el encaje de nadie con tu equipo, y es lo que hace que CERCO sirva de algo.';
  if(r.miembros < 3)
    return 'Con '+r.miembros+' persona'+(r.miembros===1?'':'s')+' todavía no puedo leer el equipo. A partir de 3 test hechos empiezo a decirte qué perfil te falta.'+falta;
  var comp = r.comp, min = 101;
  ['D','I','S','C'].forEach(function(l){ if(comp[l] < min) min = comp[l]; });
  var fluixos = ['D','I','S','C'].filter(function(l){ return comp[l] === min; });
  if(fluixos.length === 4)
    return 'Tu equipo está repartido entre los cuatro perfiles, sin huecos claros. Cuando publiques una oferta te diré qué perfil encaja mejor con ese puesto concreto.' + falta;

  var noms = fluixos.map(function(l){
    return '<b style="color:#F5A623;">' + (CDB.NOMBRE[l]||l) + ' (' + l + ')</b>';
  });
  var unir = function(union){
    return noms.length > 1 ? noms.slice(0,-1).join(', ') + ' ' + union + ' ' + noms[noms.length-1] : noms[0];
  };
  var cua = ' En la próxima incorporación, dale peso a ' + (noms.length>1?'esos perfiles':'ese perfil') + '.';

  if(min === 0)
    return 'En tu equipo no hay nadie con perfil ' + unir('ni') + '.' + cua + falta;
  if(min < 15)
    return 'Tu equipo tiene poca presencia ' + (noms.length>1?'de los perfiles ':'del perfil ') + unir('y')
         + ' — un ' + min + '%' + (noms.length>1?' cada uno':'') + '.' + cua + falta;
  return 'Tu equipo está repartido entre los cuatro perfiles, sin huecos claros. Cuando publiques una oferta te diré qué perfil encaja mejor con ese puesto concreto.'+falta;
}

/* ========================== ESTADÍSTICAS ========================== */
/* Estadísticas: las pinta y añade las cifras de contratación (Fase 1: una sola versión) */
function renderStatsReal(){
  var r = _renderStatsRealBase.apply(this, arguments);
  try{ CERCO_cifrasEstadisticas(); }catch(x){}
  return r;
}
function _renderStatsRealBase(){
  var box = document.getElementById('stats-real');
  if(!box) return;
  if(CDB.demo()){ box.innerHTML=''; box.style.display='none'; return; }
  box.style.display='';

  var r = CDB.resumen();
  var eq = CDB.equipoCompleto();
  var html = '';

  html += '<div style="margin-bottom:24px;">'
        + '<h1 style="font-size:22px;font-weight:800;color:#111827;margin:0 0 4px;">Estadísticas</h1>'
        + '<div style="font-size:13.5px;color:#6B7280;">'
        + (r.clinica ? _esc(r.clinica) + ' · ' : '')
        + (r.dias === 0 ? 'desde hoy' : 'desde hace ' + r.dias + ' día' + (r.dias===1?'':'s'))
        + '</div></div>';

  /* sin equipo: no hay nada que medir */
  if(eq.length === 0){
    html += '<div class="cerco-empty">'
          + _svg(ICO.chart,'#C3CBD9',32)
          + '<h3>Todavía no hay nada que medir</h3>'
          + '<p>Las estadísticas se construyen con los test de personalidad de tu equipo. '
          + 'Haz el tuyo y pásale el enlace a tu gente: en cuanto haya resultados, esta pantalla cobra vida.</p>'
          + '<div style="display:flex;gap:10px;justify-content:center;flex-wrap:wrap;margin-top:18px;">'
          + '<button class="paso-btn" onclick="showScreen(\'testdisc\')">Hacer mi test</button>'
          + '<button class="paso-btn ghost" onclick="showScreen(\'equipo\')">Invitar a mi equipo</button>'
          + '</div></div>';
    box.innerHTML = html;
    return;
  }

  /* KPIs honestos: solo lo que podemos contar */
  html += '<div style="display:grid;grid-template-columns:repeat(4,1fr);gap:12px;margin-bottom:20px;" class="stats-kpis">'
        + _kpiStat(eq.length, eq.length === 1 ? 'persona con el test hecho' : 'personas con el test hecho', r.pendientes ? r.pendientes+' pendientes' : 'todo el equipo', r.pendientes?'#D97706':'#059669')
        + _kpiStat(r.ofertas, 'ofertas publicadas', r.activas + ' activas', '#6B7280')
        + _kpiStat(r.candidatos, 'candidatos recibidos', r.candidatos ? 'en tus ofertas' : 'aún ninguno', '#6B7280')
        + _kpiStat(r.contratados, 'contrataciones', r.contratados ? '' : 'aún ninguna', '#6B7280')
        + '</div>';

  /* composición real */
  var comp = r.comp;
  html += '<div style="display:grid;grid-template-columns:1fr 1fr;gap:14px;" class="stats-cols">';
  html += '<div style="background:white;border-radius:14px;border:1px solid #EAECF0;padding:20px;box-shadow:0 1px 3px rgba(0,0,0,.04);">'
        + '<div style="font-size:14px;font-weight:800;color:#111827;margin-bottom:4px;">Composición de tu equipo</div>'
        + '<div style="font-size:12px;color:#6B7280;margin-bottom:16px;">Calculado con '+eq.length+' test'+(eq.length===1?'':'s')+'. El perfil principal cuenta el doble que el secundario.</div>'
        + '<div style="display:flex;flex-direction:column;gap:10px;">';
  ['D','I','S','C'].forEach(function(l){
    html += '<div><div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:4px;">'
          + '<div style="display:flex;align-items:center;gap:8px;"><div style="width:10px;height:10px;border-radius:50%;background:'+CDB.COLOR[l]+';"></div>'
          + '<span style="font-size:13px;color:#374151;">'+CDB.NOMBRE[l]+' ('+l+')</span></div>'
          + '<span style="font-size:13px;font-weight:700;color:'+CDB.COLOR[l]+';">'+comp[l]+'%</span></div>'
          + '<div style="background:#F3F4F6;border-radius:99px;height:7px;"><div style="width:'+comp[l]+'%;background:'+CDB.COLOR[l]+';height:100%;border-radius:99px;"></div></div></div>';
  });
  html += '</div>';
  if(eq.length < 3){
    html += '<div style="margin-top:14px;background:#F8F9FA;border-radius:8px;padding:10px 12px;font-size:12px;color:#6B7280;">'
          + '<span style="display:inline-flex;align-items:flex-start;gap:7px;">'+_svg(ICO.info,'#9CA3AF',14)
          + '<span>Con '+eq.length+' test'+(eq.length===1?'':'s')+' esta lectura aún es orientativa. A partir de 3 personas empieza a ser fiable.</span></span></div>';
  }
  html += '</div>';

  /* El mateix bloc que a Mi equipo: capcalera amb el compte,
     barra de progres, i cada persona amb el seu nom i els seus
     xips de color. */
  var plEq = 0; try { plEq = CDB.plantilla() || 0; } catch(e){}

  html += '<div style="background:white;border-radius:14px;border:1px solid #EAECF0;padding:20px;box-shadow:0 1px 3px rgba(0,0,0,.04);">'
        + '<div style="display:flex;justify-content:space-between;align-items:center;gap:10px;flex-wrap:wrap;">'
        + '<div style="font-size:14.5px;font-weight:800;color:#111827;">Personas con el test hecho</div>'
        + '<div style="display:flex;align-items:center;gap:10px;">'
        + '<div style="font-size:13px;font-weight:800;color:#1A56DB;">' + eq.length + (plEq ? ' de ' + plEq : '') + '</div>'
        + '<button class="paso-btn ghost" onclick="showScreen(\'equipo\')">Gestionar</button></div></div>';

  if(plEq > 0){
    var pctEq = Math.min(100, Math.round(eq.length / plEq * 100));
    html += '<div style="background:#F3F4F6;border-radius:99px;height:7px;margin:10px 0 16px;">'
          + '<div style="width:' + pctEq + '%;background:linear-gradient(90deg,#1A56DB,#3B82F6);height:100%;border-radius:99px;transition:width .3s;"></div></div>';
  } else {
    html += '<div style="height:12px;"></div>';
  }

  eq.slice(0, 8).forEach(function(m){ html += _filaMiembro(m, false); });
  if(eq.length > 8)
    html += '<div style="text-align:center;padding-top:12px;"><span onclick="showScreen(\'equipo\')" style="font-size:12.5px;color:#1A56DB;font-weight:700;cursor:pointer;">Ver las ' + eq.length + ' personas &rarr;</span></div>';

  html += '</div></div>';

  /* Seimian solo si hay base */
  if(eq.length >= 3){
    html += '<div style="background:linear-gradient(135deg,#0F1C3F,#1A3A6B);border-radius:16px;padding:20px 22px;margin-top:16px;">'
          + '<div style="font-size:10px;font-weight:800;color:rgba(255,255,255,.5);letter-spacing:.6px;text-transform:uppercase;margin-bottom:6px;">'
          + '<span style="display:inline-flex;align-items:center;gap:7px;">'+_svg(ICO.spark,'#F5A623',15)+'Seimian · Recomendación</span></div>'
          + '<div style="font-size:14px;color:white;line-height:1.6;">'+_mensajeSeimian(r)+'</div></div>';
  }

  box.innerHTML = html;
}

function _kpiStat(valor, etiqueta, nota, color){
  return '<div style="background:white;border-radius:14px;border:1px solid #EAECF0;padding:18px 16px;text-align:center;box-shadow:0 1px 3px rgba(0,0,0,.04);">'
       + '<div style="font-size:28px;font-weight:800;color:#111827;">'+valor+'</div>'
       + '<div style="font-size:12px;color:#6B7280;margin-top:2px;">'+etiqueta+'</div>'
       + (nota ? '<div style="font-size:11px;color:'+color+';font-weight:600;margin-top:4px;">'+nota+'</div>' : '')
       + '</div>';
}

/* Un xip de color per al perfil: ple si es el dominant, clar si
   es el secundari. Aixi es veu d un cop d ull i no cal desxifrar
   un "C/D" en gris. */
var _NOMCURT = { D:'Dominante', I:'Influyente', S:'Estable', C:'Concienzudo' };

function _xipPerfil(lletra, esDominant){
  if(!lletra || !_NOMCURT[lletra]) return '';
  var col = (window.CDB && CDB.COLOR && CDB.COLOR[lletra]) || '#9CA3AF';
  var base = 'display:inline-flex;align-items:center;gap:4px;border-radius:999px;'
           + 'padding:2px 8px 2px 5px;font-size:10.5px;font-weight:700;line-height:1.5;white-space:nowrap;';
  if(esDominant){
    return '<span style="'+base+'background:'+col+';color:#fff;">'
         + '<span style="width:13px;height:13px;border-radius:50%;background:rgba(255,255,255,.28);display:inline-flex;align-items:center;justify-content:center;font-size:8.5px;font-weight:800;">'+lletra+'</span>'
         + _NOMCURT[lletra] + '</span>';
  }
  return '<span style="'+base+'background:'+col+'1F;color:'+col+';">'
       + '<span style="width:13px;height:13px;border-radius:50%;background:'+col+';color:#fff;display:inline-flex;align-items:center;justify-content:center;font-size:8.5px;font-weight:800;">'+lletra+'</span>'
       + _NOMCURT[lletra] + '</span>';
}

function _filaMiembro(m, conBorrar){
  var col = CDB.COLOR[m.dom] || '#9CA3AF';
  return '<div class="miembro-row">'
       + '<div class="mini-disc" style="background:'+col+';">'+(m.dom||'?')+'</div>'
       + '<div style="flex:1;min-width:0;">'
       + '<div style="font-size:13.5px;font-weight:600;color:#111827;">'+_esc(m.nombre)+(m.yo?' <span style="font-size:11px;color:#1A56DB;font-weight:700;">· tú</span>':'')+'</div>'
       + '<div style="font-size:11.5px;color:#6B7280;display:flex;align-items:center;gap:6px;flex-wrap:wrap;">'
       + '<span>'+_esc(m.rol||'Sin rol')+'</span>'
       + _xipPerfil(m.dom, true) + _xipPerfil(m.sec, false)
       + '</div></div>'
       + (conBorrar && !m.yo
          ? '<button onclick="borrarMiembro(\''+m.id+'\')" title="Quitar" style="background:none;border:none;cursor:pointer;padding:6px;border-radius:6px;">'+_svg(ICO.trash,'#C3CBD9',15)+'</button>'
          : '')
       + '</div>';
}

/* ============================ MI EQUIPO ============================ */
function renderEquipo(){
  var box = document.getElementById('equipo-body');
  if(!box) return;
  var eq = CDB.equipoCompleto();
  var pl = CDB.plantilla();
  var link = (typeof buildInviteLink === 'function') ? buildInviteLink() : null;
  var nomClinica = CDB.nombreClinica();
  var html = '';

  /* cabecera */
  html += '<div style="margin-bottom:22px;">'
        + '<h1 style="font-size:22px;font-weight:800;color:#111827;margin:0 0 4px;">Mi equipo</h1>'
        + '<div style="font-size:13.5px;color:#6B7280;">Cada persona que hace el test suma a las estadísticas de tu clínica</div></div>';

  /* paso 1: enlace */
  html += '<div style="background:white;border-radius:16px;border:1px solid #EAECF0;padding:20px;margin-bottom:14px;box-shadow:0 1px 3px rgba(0,0,0,.04);">'
        + '<div style="display:flex;align-items:center;gap:9px;margin-bottom:4px;">'
        + '<div style="width:22px;height:22px;border-radius:50%;background:#EEF2FF;color:#1A56DB;display:flex;align-items:center;justify-content:center;font-size:11px;font-weight:800;">1</div>'
        + '<div style="font-size:14.5px;font-weight:800;color:#111827;">Envía el enlace a tu gente</div></div>'
        + '<div style="font-size:12.5px;color:#6B7280;margin-bottom:14px;padding-left:31px;">Quien lo abra hace el test directamente, sin registrarse ni instalar nada. Al terminar recibe un código.</div>';

  if(!nomClinica){
    html += '<div style="background:#FFF8EC;border:1px solid #FDE9C8;border-radius:10px;padding:13px 15px;font-size:13px;color:#92400E;line-height:1.55;">'
          + 'Primero pon el nombre de tu clínica en <b>Mi clínica</b>: es lo que verán tus compañeros al abrir el enlace.'
          + '<div style="margin-top:11px;"><button class="paso-btn" onclick="showScreen(\'onboarding\')">Ir a Mi clínica</button></div></div>';
  } else {
    html += '<div style="display:flex;gap:8px;align-items:center;flex-wrap:wrap;">'
          + '<input type="text" readonly id="invite-link-equipo" value="'+_esc(link||'')+'" style="flex:1;min-width:220px;border:1px solid #E5E7EB;border-radius:9px;padding:11px 12px;font-size:12px;color:#4B5563;background:#F9FAFB;font-family:inherit;outline:none;">'
          + '<button onclick="copyInviteLink(this)" style="background:#1A56DB;color:white;border:none;border-radius:9px;padding:12px 18px;font-size:13px;font-weight:700;cursor:pointer;">Copiar</button>'
          + '<button onclick="compartirWhatsapp()" style="background:#E8F8F1;color:#0E9F6E;border:none;border-radius:9px;padding:12px 18px;font-size:13px;font-weight:700;cursor:pointer;">WhatsApp</button>'
          + '</div>';
  }
  html += '</div>';

  /* paso 2: añadir código */
  html += '<div style="background:white;border-radius:16px;border:1px solid #EAECF0;padding:20px;margin-bottom:14px;box-shadow:0 1px 3px rgba(0,0,0,.04);">'
        + '<div style="display:flex;align-items:center;gap:9px;margin-bottom:4px;">'
        + '<div style="width:22px;height:22px;border-radius:50%;background:#EEF2FF;color:#1A56DB;display:flex;align-items:center;justify-content:center;font-size:11px;font-weight:800;">2</div>'
        + '<div style="font-size:14.5px;font-weight:800;color:#111827;">Añade el código que te envíen</div></div>'
        + '<div style="font-size:12.5px;color:#6B7280;margin-bottom:14px;padding-left:31px;">Te llegará algo como <b style="font-family:ui-monospace,Menlo,monospace;color:#374151;">MG-IC-84</b>. Lo pegas aquí con el nombre y el puesto.</div>'
        + '<div style="display:grid;grid-template-columns:1.4fr 1.2fr 1fr auto;gap:8px;align-items:center;" class="equipo-form">'
        + '<input type="text" id="eq-nombre" placeholder="Nombre y apellido" style="border:1px solid #E5E7EB;border-radius:9px;padding:11px 12px;font-size:13px;font-family:inherit;outline:none;">'
        + '<select id="eq-rol" style="border:1px solid #E5E7EB;border-radius:9px;padding:11px 12px;font-size:13px;font-family:inherit;outline:none;background:white;color:#374151;">'
        + '<option value="">Puesto…</option>'
        + '<option>Odontólogo/a</option><option>Higienista dental</option><option>Auxiliar dental</option>'
        + '<option>Recepción</option><option>Gerencia</option><option>Ortodoncista</option>'
        + '<option>Protésico/a</option><option>Otro</option></select>'
        + '<input type="text" id="eq-codigo" placeholder="Código" maxlength="12" oninput="this.value=this.value.toUpperCase()" style="border:1px solid #E5E7EB;border-radius:9px;padding:11px 12px;font-size:13px;font-family:ui-monospace,Menlo,monospace;letter-spacing:1px;outline:none;">'
        + '<button onclick="anadirMiembro()" style="background:#1A56DB;color:white;border:none;border-radius:9px;padding:12px 20px;font-size:13px;font-weight:700;cursor:pointer;white-space:nowrap;">Añadir</button>'
        + '</div>'
        + '<div id="eq-error" style="font-size:12.5px;color:#DC2626;margin-top:9px;min-height:1px;"></div>'
        + '</div>';

  /* tamaño de plantilla */
  html += '<div style="background:white;border-radius:16px;border:1px solid #EAECF0;padding:18px 20px;margin-bottom:14px;box-shadow:0 1px 3px rgba(0,0,0,.04);">'
        + '<div style="display:flex;align-items:center;gap:12px;flex-wrap:wrap;">'
        + '<div style="flex:1;min-width:200px;"><div style="font-size:13.5px;font-weight:700;color:#111827;">¿Cuántas personas sois en total?</div>'
        + '<div style="font-size:12.5px;color:#6B7280;margin-top:2px;">Para saber cuántos test faltan por hacer</div></div>'
        + '<input type="number" min="0" max="999" id="eq-plantilla" value="'+(pl||'')+'" placeholder="0" onchange="guardarPlantilla()" style="width:88px;border:1px solid #E5E7EB;border-radius:9px;padding:10px 12px;font-size:14px;font-family:inherit;text-align:center;outline:none;">'
        + '</div></div>';

  /* lista */
  html += '<div style="background:white;border-radius:16px;border:1px solid #EAECF0;padding:20px;box-shadow:0 1px 3px rgba(0,0,0,.04);">'
        + '<div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:6px;">'
        + '<div style="font-size:14.5px;font-weight:800;color:#111827;">Personas con el test hecho</div>'
        + '<div style="font-size:13px;font-weight:800;color:#1A56DB;">'+eq.length+(pl?' de '+pl:'')+'</div></div>';

  if(pl > 0){
    var pct = Math.min(100, Math.round(eq.length/pl*100));
    html += '<div style="background:#F3F4F6;border-radius:99px;height:7px;margin:10px 0 16px;">'
          + '<div style="width:'+pct+'%;background:linear-gradient(90deg,#1A56DB,#3B82F6);height:100%;border-radius:99px;transition:width .3s;"></div></div>';
  } else {
    html += '<div style="height:12px;"></div>';
  }

  if(eq.length === 0){
    html += '<div style="text-align:center;padding:26px 10px;">'
          + _svg(ICO.users,'#C3CBD9',28)
          + '<div style="font-size:14px;font-weight:700;color:#374151;margin-top:12px;">Todavía no hay nadie</div>'
          + '<div style="font-size:13px;color:#6B7280;margin-top:5px;line-height:1.55;">Empieza por ti: haz tu test y entrarás automáticamente en la lista.</div>'
          + '<button class="paso-btn" style="margin-top:15px;" onclick="showScreen(\'testdisc\')">Hacer mi test</button></div>';
  } else {
    eq.forEach(function(m){ html += _filaMiembro(m, true); });
  }
  html += '</div>';

  box.innerHTML = html;
}

function guardarPlantilla(){
  var el = document.getElementById('eq-plantilla');
  if(!el) return;
  CDB.setPlantilla(el.value);
  CDB.renderTodo();
  try{ if(window._subirClinica) _subirClinica(); }catch(e){}
}

function anadirMiembro(){
  var nEl = document.getElementById('eq-nombre'),
      rEl = document.getElementById('eq-rol'),
      cEl = document.getElementById('eq-codigo'),
      err = document.getElementById('eq-error');
  if(!nEl || !cEl) return;
  var nombre = nEl.value.trim(), rol = rEl ? rEl.value : '', codigo = cEl.value.trim();
  err.textContent = ''; if(window.verAviso) verAviso(err);

  if(!nombre){ err.textContent = 'Escribe el nombre de la persona.'; if(window.verAviso) verAviso(err); nEl.focus(); return; }
  var p = CDB.parseCodigo(codigo);
  if(!p){ err.textContent = 'Ese código no tiene el formato correcto. Debe ser algo como MG-IC-84.'; if(window.verAviso) verAviso(err); cEl.focus(); return; }

  // Aviso solo si no coincide NI la primera inicial: quien hizo el test pudo
  // escribir solo su nombre de pila y el responsable escribe nombre y apellido.
  var ini = _ini(nombre);
  var encaja = (p.ini === ini) || (p.ini.charAt(0) === ini.charAt(0));
  if(!encaja){
    if(cEl.dataset.avisado !== codigo + nombre){
      cEl.dataset.avisado = codigo + nombre;
      err.innerHTML = 'Ese código parece de otra persona: empieza por <b>'+p.ini+'</b> y el nombre que has escrito por <b>'+ini+'</b>.'
                    + '<br><span style="color:#6B7280; if(window.verAviso) verAviso(err);">Si estás seguro, pulsa <b>Añadir</b> otra vez y lo guardo igualmente.</span>';
      return;
    }
  }

  var repe = CDB.equipo().some(function(m){ return m.codigo === codigo.toUpperCase(); });
  if(repe){ err.textContent = 'Ese código ya está añadido.'; if(window.verAviso) verAviso(err); return; }

  var norm = function(t){ return (t||'').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/\s+/g,' ').trim(); };

  // El responsable ya cuenta con su propio test: no puede entrar dos veces
  if(CDB.miDisc() && norm(nombre) === norm(CDB.clinica().nomResp)){
    err.innerHTML = 'Tú ya estás en el equipo con tu propio test. Si quieres cambiar tu resultado, vuelve a hacer el test desde <b>Mi cuenta</b>.'; if(window.verAviso) verAviso(err);
    return;
  }
  // Y tampoco dos personas con el mismo nombre
  var mismoNombre = CDB.equipo().some(function(m){ return norm(m.nombre) === norm(nombre); });
  if(mismoNombre){
    err.textContent = 'Ya hay alguien con ese nombre en el equipo. Añade el apellido para distinguirlos.'; if(window.verAviso) verAviso(err);
    return;
  }

  CDB.addMiembro({ nombre:nombre, rol:rol||'Sin puesto', dom:p.dom, sec:p.sec, pct:p.pct, codigo:codigo.toUpperCase() });
  nEl.value=''; cEl.value=''; if(rEl) rEl.value='';
  CDB.renderTodo();
  if(typeof showToast === 'function') showToast(nombre.split(/\s+/)[0] + ' añadido al equipo · Perfil ' + p.dom + '/' + p.sec);
}

function borrarMiembro(id){
  CDB.delMiembro(id);
  CDB.renderTodo();
  if(typeof showToast === 'function') showToast('Persona quitada del equipo');
}

function compartirWhatsapp(){
  var link = (typeof buildInviteLink === 'function') ? buildInviteLink() : null;
  if(!link){ if(typeof showToast==='function') showToast('Pon antes el nombre de tu clínica'); return; }
  var txt = 'Hola, estamos usando CERCO para conocer mejor cómo trabajamos en equipo. '
          + '¿Puedes hacer este test? Son 5 minutos y al final te da un código: pásamelo y ya está.\n\n' + link;
  window.open('https://wa.me/?text=' + encodeURIComponent(txt), '_blank');
}

/* ====================== MIS OFERTAS (reales) ====================== */
function renderOfertasReal(){
  if(!window.CDB) return;
  var strip = document.getElementById('ofertes-strip-real');
  var sub = document.getElementById('ofertes-sub');
  if(sub) sub.textContent = CDB.nombreClinica() ? (CDB.nombreClinica() + ' — control total, de un solo vistazo') : 'Control total, de un solo vistazo';
  if(!strip) return;

  if(CDB.demo()){ strip.innerHTML=''; strip.style.display='none'; }
  else {
    strip.style.display='';
    var r = CDB.resumen();
    strip.innerHTML = '<div class="glance-strip">'
      + _pill('#E8F8F1', r.activas, 'Ofertas activas')
      + _pill('#EAF0FF', r.candidatos, 'Candidatos totales')
      + _pill('#FFF4E5', r.pausadas, 'Pausadas')
      + _pill('#F3F1FF', r.cerradas, 'Cerradas')
      + '</div>';
  }

  /* contadores de columna: solo las tarjetas visibles */
  ['activa','pausada','cerrada'].forEach(function(est){
    var badge = document.querySelector('.board-count[data-col="'+est+'"]');
    if(!badge) return;
    var col = badge.closest('.board-col');
    if(!col) return;
    var n = 0;
    col.querySelectorAll('.offer-card').forEach(function(c){
      if(CDB.demo() || !c.classList.contains('ejemplo')) n++;
    });
    badge.textContent = n;
  });
}
function _pill(bg, val, label){
  return '<div class="glance-pill"><div class="gp-icon" style="background:'+bg+';">'+_svg(ICO.brief,'#1A56DB',17)+'</div>'
       + '<div><div class="gp-val">'+val+'</div><div class="gp-label">'+label+'</div></div></div>';
}


/* ====================== MI CUENTA (dades reals) ====================== */
function renderMiCuenta(){
  var demo = CDB.demo();
  var c = CDB.clinica(), r = CDB.resumen();
  var set = function(id, val){ var e=document.getElementById(id); if(e) e.textContent = val; };
  var setv = function(id, val){ var e=document.getElementById(id); if(e && !e.value) e.value = val; };

  if(demo){
    set('mc-hero-name','Tu nombre');
    set('mc-hero-role','Gerente · Clínica Dental Madrid Centro');
    set('mc-st-ofertas','3'); set('mc-st-cand','45'); set('mc-st-equipo','3');
    set('mc-st-equipo-lbl','Esperan respuesta');
    return;
  }

  var nom = (c.nomResp||'').trim();
  var rolSel = document.getElementById('mc-rol');
  if(rolSel && c.rol){
    var hi = [].some.call(rolSel.options, function(o){ return o.value === c.rol; });
    if(hi) rolSel.value = c.rol;
  }
  var rol = rolSel ? rolSel.value : 'Gerente';
  set('mc-hero-name', nom || 'Tu nombre');
  set('mc-hero-role', (rol === 'Responsable de RRHH' ? 'Coordinador/a de clínica' : rol) + (c.nom ? ' · ' + c.nom : ''));
  set('mc-st-ofertas', r.activas);
  set('mc-st-cand', r.candidatos);
  set('mc-st-equipo', r.miembros);
  set('mc-st-equipo-lbl', 'Test del equipo');

  // camps del formulari: omplim només si estan buits, per no trepitjar el que escrigui
  var nEl = document.getElementById('mc-nombre');
  if(nEl && !nEl.value && nom) nEl.value = nom;
  var eEl = document.getElementById('mc-email');
  if(eEl && eEl.value === 'contacto@dentalmadrid.es') eEl.value = '';
  var tEl = document.getElementById('mc-telefono');
  if(tEl && tEl.value === '+34 600 000 000') tEl.value = '';

  // inicial de l'avatar
  var av = document.getElementById('mc-avatar-letter');
  if(av && !document.getElementById('mc-avatar-circle').style.backgroundImage)
    av.textContent = nom ? nom.trim().charAt(0).toUpperCase() : '?';

  // membres amb accés
  var acc = document.getElementById('mc-miembros-acceso');
  if(acc) acc.textContent = '1 de 1';
}

/* ====================== CANDIDATOS ====================== */
/* «Candidatos» (Fase 1: una sola versión). Antes eran siete versiones
   envueltas; ahora se pinta la base y después cada parte, en el mismo orden.
   Un fallo en una parte no impide pintar las demás, igual que antes. */
function renderPortalReal(){
  try{ _pintarCandidatosBase(); }catch(x){}
  ['CERCO_candidatosReales', 'CERCO_candidatosTasaRespuesta', 'CERCO_candidatosEtiquetas', 'CERCO_candidatosTalento', 'CERCO_candidatosPorProfesion', 'CERCO_candidatosEntrada']
    .forEach(function(parte){ try{ if(window[parte]) window[parte](); }catch(x){} });
}
function _pintarCandidatosBase(){
  var h1 = document.getElementById('portal-h1');
  var sub = document.getElementById('portal-sub');
  var aviso = document.getElementById('portal-aviso-real');
  if(CDB.demo()){
    if(h1) h1.textContent = '23 candidatos han aplicado';
    if(sub) sub.textContent = 'Ordenados por encaje con el perfil que necesitas';
    if(aviso){ aviso.innerHTML=''; aviso.style.display='none'; }
    return;
  }
  var n = CDB.candidatosRecibidos();
  if(h1) h1.textContent = n === 0 ? 'Todavía no tienes candidatos' : (n + (n===1?' candidato ha aplicado':' candidatos han aplicado'));
  if(sub) sub.textContent = n === 0
    ? 'En cuanto alguien se inscriba en una de tus ofertas, aparecerá aquí'
    : 'Ordenados por encaje con el perfil que necesitas';
  if(aviso){
    aviso.style.display='';
    aviso.innerHTML = '<div style="background:#F8F9FA;border:1px solid #E5E7EB;border-radius:12px;padding:16px 18px;margin-bottom:16px;">'
      + '<div style="display:flex;align-items:flex-start;gap:11px;">'
      + _svg(ICO.info,'#9CA3AF',17)
      + '<div style="flex:1;font-size:13px;color:#4B5563;line-height:1.6;">'
      + '<b style="color:#111827;">Los perfiles que ves debajo son de ejemplo.</b> '
      + 'Sirven para enseñarte cómo CERCO ordena y puntúa a los candidatos. '
      + 'Los tuyos aparecerán aquí en cuanto publiques una oferta y alguien se inscriba.'
      + (CDB.resumen().ofertas === 0
          ? '<div style="margin-top:12px;"><button class="paso-btn" onclick="showScreen(\'crear-oferta\')">Publicar mi primera oferta</button></div>'
          : '')
      + '</div></div></div>';
  }
}

/* ====================== INTERRUPTOR DE EJEMPLO ====================== */
function renderSwitchDemo(){
  var el = document.getElementById('demo-switch');
  if(!el) return;
  var on = CDB.demo();
  el.innerHTML = '<div onclick="CDB.setDemo('+(on?'false':'true')+')" style="display:flex;align-items:center;gap:10px;cursor:pointer;padding:9px 10px;border-radius:9px;">'
    + '<div class="sw-track'+(on?' on':'')+'"><div class="sw-knob"></div></div>'
    + '<div style="min-width:0;"><div style="font-size:12px;font-weight:700;color:'+(on?'#92400E':'#6B7280')+';">Datos de ejemplo</div>'
    + '<div style="font-size:10.5px;color:#6B7280;line-height:1.35;">'+(on?'Verás una clínica inventada':'Solo ves lo tuyo')+'</div></div></div>';

  /* aviso visible en las pantallas de ejemplo */
  document.querySelectorAll('.aviso-ejemplo').forEach(function(a){ a.style.display = on ? '' : 'none'; });
}



/* ================================================================
   CERCO · NUBE (Firebase)
   Guarda los datos de cada clínica en Firestore para que estén
   en cualquier dispositivo, y recoge solo los resultados que
   envían los trabajadores desde su móvil.

   Si la nube no responde, la app sigue funcionando con los datos
   de este navegador: nadie se queda tirado.
   ================================================================ */
window.CERCO_FB = {
  apiKey: "AIzaSyBfMikfSWFisysjXvRbMDtupjiGFvT7uTI",
  authDomain: "cerco-c5724.firebaseapp.com",
  projectId: "cerco-c5724",
  storageBucket: "cerco-c5724.firebasestorage.app",
  messagingSenderId: "786949705772",
  appId: "1:786949705772:web:2fafd09d59a0922b284189"
};

window.Nube = {
  lista: false,        // el SDK ha cargado
  activa: false,       // además hay sesión válida
  uid: null,
  _cbs: [],

  alEstarLista: function(fn){
    if(this.activa) { try{ fn(); }catch(e){} return; }
    this._cbs.push(fn);
  },
  _avisar: function(){
    var c = this._cbs.slice(); this._cbs = [];
    c.forEach(function(f){ try{ f(); }catch(e){} });
  },

  /* Carga el SDK solo cuando hace falta */
  cargar: function(){
    if(this._cargando) return this._cargando;
    var self = this;
    this._cargando = new Promise(function(res){
      // Firebase va dentro de la web (src/comun/firebase.js) y avisa cuando está listo
      var iniciar = function(){
        try {
          if(!firebase.apps.length) firebase.initializeApp(window.CERCO_FB);
          self.lista = true;
          res(true);
        } catch(e){ self.lista = false; res(false); }
      };
      if(window.__cercoFirebaseListo) return iniciar();
      window.addEventListener('cerco-firebase-listo', iniciar, { once: true });
      // si en 8 segundos no ha cargado, seguimos sin nube
      setTimeout(function(){ if(!self.lista) res(false); }, 8000);
    });
    return this._cargando;
  },

  db: function(){ return (window.firebase && firebase.firestore) ? firebase.firestore() : null; },

  /* --- sesión del propietario --- */
  registrar: function(email, pwd){
    return this.cargar().then(function(ok){
      if(!ok) return Promise.reject('sin-nube');
      return firebase.auth().createUserWithEmailAndPassword(email, pwd);
    });
  },
  entrar: function(email, pwd){
    return this.cargar().then(function(ok){
      if(!ok) return Promise.reject('sin-nube');
      return firebase.auth().signInWithEmailAndPassword(email, pwd);
    });
  },
  salir: function(){
    try{ if(window.firebase && firebase.auth) firebase.auth().signOut(); }catch(e){}
    this.activa = false; this.uid = null;
  },

  /* --- entrar amb el compte de Google --- */
  entrarConGoogle: function(){
    return this.cargar().then(function(ok){
      if(!ok) return Promise.reject({code:'sin-nube'});
      var prov = new firebase.auth.GoogleAuthProvider();
      prov.setCustomParameters({ prompt: 'select_account' });
      return firebase.auth().signInWithPopup(prov).catch(function(x){
        var c = (x && x.code) || '';
        // Si el navegador bloqueja la finestra, ho fem redirigint
        if(c === 'auth/popup-blocked' || c === 'auth/operation-not-supported-in-this-environment'){
          return firebase.auth().signInWithRedirect(prov).then(function(){ return null; });
        }
        return Promise.reject(x);
      });
    });
  },
  resultadoRedireccion: function(){
    return this.cargar().then(function(ok){
      if(!ok) return null;
      return firebase.auth().getRedirectResult().catch(function(){ return null; });
    });
  },

  /* --- sesión anónima, para el trabajador que solo hace el test --- */
  entrarComoInvitado: function(){
    return this.cargar().then(function(ok){
      if(!ok) return Promise.reject('sin-nube');
      if(firebase.auth().currentUser) return firebase.auth().currentUser;
      return firebase.auth().signInAnonymously();
    });
  },

  /* --- datos de la clínica --- */
  refClinica: function(){
    var d = this.db();
    if(!d || !this.uid) return null;
    return d.collection('clinicas').doc(this.uid);
  },

  guardarClinica: function(datos){
    var r = this.refClinica();
    if(!r) return Promise.resolve(false);
    var limpio = {};
    ['nom','nomResp','ciutat','email','telefono','rol','descripcion','web','plantilla','alta']
      .forEach(function(k){ if(datos[k] !== undefined && datos[k] !== null) limpio[k] = datos[k]; });
    if(Array.isArray(datos.avisos)) limpio.avisos = datos.avisos;
    limpio.actualizado = new Date().toISOString();
    return r.set(limpio, {merge:true}).then(function(){ return true; }).catch(function(){ return false; });
  },

  leerClinica: function(){
    var r = this.refClinica();
    if(!r) return Promise.resolve(null);
    return r.get().then(function(d){ return d.exists ? d.data() : null; }).catch(function(){ return null; });
  },

  /* --- equipo --- */
  guardarMiembro: function(cid, m){
    var d = this.db();
    if(!d) return Promise.resolve(false);
    var doc = {
      nombre: String(m.nombre||'').slice(0,80),
      rol:    String(m.rol||'').slice(0,60),
      dom:    String(m.dom||'').slice(0,1),
      sec:    String(m.sec||'').slice(0,1),
      pct:    Math.max(0, Math.min(100, parseInt(m.pct,10) || 0)),
      codigo: String(m.codigo||'').slice(0,16),
      fecha:  new Date().toISOString()
    };
    return d.collection('clinicas').doc(cid).collection('equipo').doc(doc.codigo || String(Date.now()))
      .set(doc).then(function(){ return true; }).catch(function(){ return false; });
  },

  borrarMiembro: function(id){
    var r = this.refClinica();
    if(!r) return Promise.resolve(false);
    return r.collection('equipo').doc(id).delete().then(function(){ return true; }).catch(function(){ return false; });
  },

  leerEquipo: function(){
    var r = this.refClinica();
    if(!r) return Promise.resolve(null);
    return r.collection('equipo').get().then(function(s){
      var out = [];
      s.forEach(function(d){ var x = d.data(); x.id = d.id; out.push(x); });
      return out;
    }).catch(function(){ return null; });
  },

  /* Escucha en directo: cuando un trabajador acaba su test, aparece solo */
  escucharEquipo: function(fn){
    var r = this.refClinica();
    if(!r) return null;
    try {
      return r.collection('equipo').onSnapshot(function(s){
        var out = [];
        s.forEach(function(d){ var x = d.data(); x.id = d.id; out.push(x); });
        fn(out);
      }, function(){});
    } catch(e){ return null; }
  },

  /* --- ofertas --- */
  guardarOferta: function(o){
    var r = this.refClinica();
    if(!r) return Promise.resolve(false);
    var doc = {};
    ['titulo','ubicacion','jornada','disc','estado','fecha'].forEach(function(k){
      if(o[k] !== undefined) doc[k] = String(o[k]).slice(0,200);
    });
    doc.candidatos = parseInt(o.candidatos,10) || 0;
    return r.collection('ofertas').doc(o.id).set(doc).then(function(){ return true; }).catch(function(){ return false; });
  },
  borrarOferta: function(id){
    // también la oferta pública, la que ven los profesionales
    var d = this.db();
    try{ if(d && this.uid) d.collection('ofertas_publicas').doc(String(id)).delete().catch(function(){}); }catch(x){}
    var r = this.refClinica();
    if(!r) return Promise.resolve(false);
    return r.collection('ofertas').doc(id).delete().then(function(){ return true; }).catch(function(){ return false; });
  },
  leerOfertas: function(){
    var r = this.refClinica();
    if(!r) return Promise.resolve(null);
    return r.collection('ofertas').get().then(function(s){
      var out = [];
      s.forEach(function(d){ var x = d.data(); x.id = d.id; out.push(x); });
      return out;
    }).catch(function(){ return null; });
  },

  /* --- lo que usa el trabajador: enviar su resultado --- */
  enviarResultado: function(cid, nombre, dom, sec, pct){
    var self = this;
    return this.entrarComoInvitado().then(function(){
      var d = self.db();
      if(!d) return false;
      var doc = {
        nombre: String(nombre||'').trim().slice(0,80),
        rol: '',
        dom: String(dom||'').slice(0,1),
        sec: String(sec||'').slice(0,1),
        pct: Math.max(0, Math.min(100, parseInt(pct,10) || 0)),
        codigo: '',
        origen: 'enlace',
        fecha: new Date().toISOString()
      };
      return d.collection('clinicas').doc(cid).collection('equipo').add(doc)
        .then(function(){ return true; }).catch(function(){ return false; });
    }).catch(function(){ return false; });
  },

  /* nombre de la clínica para enseñárselo al invitado */
  nombreClinicaPorId: function(cid){
    var self = this;
    return this.entrarComoInvitado().then(function(){
      var d = self.db();
      if(!d) return null;
      return d.collection('clinicas_publicas').doc(cid).get()
        .then(function(s){ return s.exists ? (s.data().nom || null) : null; })
        .catch(function(){ return null; });
    }).catch(function(){ return null; });
  }
};

/* ============ ENGANCHE: la app habla con la nube ============ */
(function(){
  var _syncBadge = function(estado){
    var el = document.getElementById('nube-estado');
    if(!el) return;
    var t = { ok:['Sincronizado','#0E9F6E'],
              off:['Solo en este dispositivo','#9CA3AF'],
              espera:['Se guardarán al entrar','#9CA3AF'],
              sync:['Guardando…','#1A56DB'] }[estado] || t;
    if(!t) return;
    el.textContent = t[0]; el.style.color = t[1];
  };
  window._syncBadge = _syncBadge;

  /* Cuando Firebase confirma quién eres, bajamos tus datos */
  window._arrancarNube = function(){
    Nube.cargar().then(function(ok){
      if(!ok){ _syncBadge('off'); return; }
      // Si hem tornat de la pantalla de Google, recollim el resultat
      Nube.resultadoRedireccion().then(function(r){
        if(r && r.user && typeof _entrarDespuesDeGoogle === 'function') _entrarDespuesDeGoogle(r.user);
      }).catch(function(){});
      firebase.auth().onAuthStateChanged(function(u){
        if(u && !u.isAnonymous){
          Nube.uid = u.uid; Nube.activa = true;
          _syncBadge('ok');
          Nube._avisar();
          _bajarDeLaNube();
          _escucharEquipoEnDirecto();
        } else if(!u){
          Nube.uid = null; Nube.activa = false;
          // Si el SDK ha cargado, es que simplemente aún no has entrado
          _syncBadge(Nube.lista ? 'espera' : 'off');
        }
      });
    });
  };

  /* Traer lo que hay en la nube a este dispositivo */
  window._bajarDeLaNube = function(){
    if(!Nube.activa) return;
    Nube.leerClinica().then(function(c){
      if(c){
        try{
          var local = CDB.clinica();
          var fus = Object.assign({}, local, c);
          localStorage.setItem(CDB.K.emp, JSON.stringify(fus));
          if(c.plantilla !== undefined) CDB.setPlantilla(c.plantilla);
        }catch(e){}
      }
      return Nube.leerEquipo();
    }).then(function(eq){
      if(Array.isArray(eq)){
        try{ localStorage.setItem(CDB.K.eq, JSON.stringify(eq)); }catch(e){}
      }
      return Nube.leerOfertas();
    }).then(function(of){
      if(Array.isArray(of)){
        try{ localStorage.setItem(CDB.K.of, JSON.stringify(of)); }catch(e){}
      }
      try{ CDB.setDemo(false); }catch(e){}
      try{ CDB.renderTodo(); if(typeof loadCompanyFromStorage==='function') loadCompanyFromStorage(); }catch(e){}
      try{ if(typeof pintarOfertasReales==='function') pintarOfertasReales(); }catch(e){}
    }).catch(function(){});
  };

  /* El propietario ve aparecer a su gente sin tocar nada */
  var _unsub = null;
  // Al confirmar la sesión de la clínica: escuchar el equipo y las solicitudes,
  // publicar una vez las ofertas antiguas y la página pública (Fase 1: una sola versión)
  var _publicadas = false;
  window._escucharEquipoEnDirecto = function(){
    try{ _escucharEquipoBase(); }catch(x){}
    try{ window._escucharCandidaturas(); }catch(x){}
    // Las ofertas creadas antes de existir el portal del candidato también se publican
    if(!_publicadas){
      _publicadas = true;
      setTimeout(function(){ try{ if(Nube.activa) window._subirOferta(); }catch(x){} }, 4000);
    }
    setTimeout(function(){ try{ _publicarClinica(); }catch(x){} }, 3000);
  };
  var _escucharEquipoBase = function(){
    if(_unsub){ try{ _unsub(); }catch(e){} _unsub = null; }
    _unsub = Nube.escucharEquipo(function(eq){
      if(!Array.isArray(eq)) return;
      var antes = 0;
      try{ antes = CDB.equipo().length; }catch(e){}
      try{ localStorage.setItem(CDB.K.eq, JSON.stringify(eq)); }catch(e){}
      try{ CDB.renderTodo(); }catch(e){}
      if(eq.length > antes && antes >= 0 && typeof showToast === 'function'){
        var nuevos = eq.length - antes;
        if(nuevos > 0 && antes > 0) showToast(nuevos === 1 ? 'Alguien de tu equipo acaba de hacer el test' : nuevos + ' personas acaban de hacer el test');
      }
    });
  };

  /* Subir cambios locales, sin bloquear nunca la interfaz */
  // Subir los datos de la clínica a la nube, actualizar sus ofertas públicas
  // (por si ha cambiado el nombre) y su página pública (Fase 1: una sola versión)
  window._subirClinica = function(){
    try{ _subirClinicaBase(); }catch(x){}
    try{ if(Nube.activa) window._subirOferta(); }catch(x){}
    try{ _publicarClinica(); }catch(x){}
  };
  var _subirClinicaBase = function(){
    if(!Nube.activa) return;
    _syncBadge('sync');
    var d = {};
    try{ d = CDB.clinica(); d.plantilla = CDB.plantilla(); }catch(e){}
    Nube.guardarClinica(d).then(function(){ _syncBadge('ok'); });
  };
  window._subirMiembro = function(m){
    if(!Nube.activa) return;
    Nube.guardarMiembro(Nube.uid, m);
  };
  })();

/* ============ COMPORTAMENT D'APP ============
   Tecla Enter, boto enrere del mobil i proteccio contra
   el doble toc. Coses que a una app nativa dona per fetes.
   ============================================ */

/* --- 1. Enter envia el formulari --- */
(function(){
  var mapa = [
    {ids:['reg-nombre','reg-email','reg-pwd','reg-pwd2'], fn:function(){ handleRegistro(); }},
    {ids:['login-email','login-pwd'],                     fn:function(){ handleLogin(); }},
    {ids:['eq-nombre','eq-codigo'],                       fn:function(){ anadirMiembro(); }},
    {ids:['co-titulo','co-ubicacion'],                    fn:function(){ submitNewOffer(); }},
    {ids:['invitado-nombre'],                             fn:function(){ empezarTestInvitado(); }}
  ];
  function enganxa(){
    mapa.forEach(function(g){
      g.ids.forEach(function(id){
        var el = document.getElementById(id);
        if(!el || el.dataset.enterOk) return;
        el.dataset.enterOk = '1';
        el.addEventListener('keydown', function(ev){
          if(ev.key === 'Enter'){ ev.preventDefault(); try{ g.fn(); }catch(e){} }
        });
      });
    });
  }
  window._engancharEnter = enganxa;
  enganxa();
  document.addEventListener('click', function(){ setTimeout(enganxa, 60); });
})();

/* --- 2. El boto enrere del movil navega dins l'app --- */
(function(){
  var saltando = false;

  // Cada pantalla que s'obre deixa una marca a l'historial del navegador.
  window._historialPush = function(id){
    if(saltando) return;
    try{
      var actual = history.state && history.state.cercoScreen;
      if(actual === id){ return; }              // ja hi som, no dupliquem
      if(!actual){ history.replaceState({cercoScreen:id}, '', location.href); }
      else { history.pushState({cercoScreen:id}, '', location.href); }
    }catch(e){}
  };

  // Enrere i endavant: ensenyem la pantalla que digui l'historial,
  // sense tocar-lo, perque els dos botons segueixin funcionant.
  window.addEventListener('popstate', function(ev){
    var destino = ev.state && ev.state.cercoScreen;
    if(!destino) return;
    saltando = true;
    try{ showScreen(destino); }catch(e){}
    saltando = false;
  });
})();

/* --- 3. Un boto no es pot prémer dues vegades mentre treballa --- */
window._unaSolaVez = function(clave, ms){
  window.__ocupado = window.__ocupado || {};
  var ara = Date.now();
  if(window.__ocupado[clave] && ara - window.__ocupado[clave] < (ms||1200)) return false;
  window.__ocupado[clave] = ara;
  return true;
};

/* Qui obre l'enllaç d'equip és un treballador: només ha de poder fer
   el test. No ha de veure les ofertes, ni els candidats, ni res del panell. */
window.esModoInvitado = function(){
  try {
    if(window.__salioDeInvitado) return false;
    var q = new URLSearchParams(location.search);
    if(q.get('c') || q.get('equipo')) return true;
    return !!sessionStorage.getItem('cerco_invitado_nombre');
  } catch(e){ return false; }
};
window.aplicarModoInvitado = function(){
  try { document.body.classList.toggle('mode-invitado', esModoInvitado()); } catch(e){}
};

// ---- Navigation (always runs, isolated from any error above) ----
/* Cambiar de pantalla (Fase 1: una sola versión). Antes eran cinco versiones
   envueltas; los pasos van en el mismo orden. Cada pieza de otro archivo se
   comprueba antes de usarla: durante la carga, si aún no existe, se hace lo
   mismo que hacía la versión original. */
window.showScreen = function(id){
  // Al salir de la ficha de un candidato, se quita la ficha provisional (clinica/16-ficha-candidato.js)
  if(window.CERCO_fichaAlCambiarPantalla) CERCO_fichaAlCambiarPantalla(id);
  var pedida = id;
  // Las entrevistas de ejemplo llevan a la Agenda real (clinica/12-todo-conectado.js)
  if(window.CERCO_agendaRedirigir) id = CERCO_agendaRedirigir(id);
  var r = _mostrarPantallaBase.apply(this, [id].concat([].slice.call(arguments, 1)));
  // Ajustes de la interfaz: bienvenida y municipio de la oferta nueva (clinica/08-arreglos-interfaz.js)
  try{ if(window.CERCO_interfazTrasPantalla) CERCO_interfazTrasPantalla(id); }catch(x){}
  // La Agenda se pinta al entrar (clinica/12-todo-conectado.js)
  if(id === 'agenda' && window.CERCO_agendaAlMostrar) CERCO_agendaAlMostrar();
  // El formulario de oferta se prepara al abrirlo (clinica/13-formulario-oferta.js)
  if(pedida === 'crear-oferta' && window.CERCO_formularioOfertaListo) setTimeout(CERCO_formularioOfertaListo, 50);
  return r;
};
var _mostrarPantallaBase = function(id){
  // Un convidat només pot estar a la seva pantalla o al test
  try {
    if(window.esModoInvitado && esModoInvitado()){
      var permeses = ['invitado','testdisc','gracias'];
      if(permeses.indexOf(id) === -1){
        id = sessionStorage.getItem('cerco_invitado_nombre') ? 'testdisc' : 'invitado';
      }
    }
  } catch(e){}
  document.querySelectorAll('.app-screen').forEach(s => s.classList.toggle('active', s.id === 'screen-' + id));
  document.querySelectorAll('.shell-nav-item').forEach(n => n.classList.toggle('active', n.dataset.screen === id));
  if(typeof syncMobileChrome === 'function') syncMobileChrome(id);
  if(typeof syncWorkspaceName === 'function') syncWorkspaceName();
  if(id === 'stats' && typeof refreshInviteLink === 'function') setTimeout(refreshInviteLink, 40);
  if(id === 'crear-oferta' && !window.__editandoOferta){
    try{ if(typeof prepararOfertaSegunEquipo==='function') prepararOfertaSegunEquipo(); }catch(e){}
  }
  if(id === 'portal'){
    try{ if(typeof prepararPortalSegunEquipo==='function') prepararPortalSegunEquipo(); }catch(e){}
    try{ if(typeof _cabeceraPortal==='function') _cabeceraPortal(); }catch(e){}
  }
  try{ if(window.aplicarModoInvitado) aplicarModoInvitado(); }catch(e){}
  try{ if(window.CDB){ CDB.aplicarModo(); CDB.renderTodo(); } }catch(e){}
  if(id === 'onboarding' || id === 'mi-cuenta'){
    try{ if(typeof loadCompanyFromStorage === 'function') loadCompanyFromStorage(); }catch(e){}
  }
  if(id === 'mi-cuenta'){ try{ if(typeof _refrescarDiscMiCuenta==='function') _refrescarDiscMiCuenta(); }catch(e){} }
  // Mi clinica s obre sempre al formulari, no al resultat del test d abans
  if(id === 'onboarding'){
    try{
      var _t = document.getElementById('screen-test-onboarding'); if(_t) _t.style.display='none';
      if(typeof goStep_onboarding === 'function') goStep_onboarding(1);
    }catch(e){}
  }
  try{ if(window._historialPush) window._historialPush(id); }catch(e){}
  try{ if(window._engancharEnter) setTimeout(window._engancharEnter, 30); }catch(e){}
  document.body.classList.toggle('on-login', id === 'login' || id === 'registro' || id === 'invitado');
  // Deixem Google a punt abans que el toqui: aixi la finestra s obre a l instant
  if(id === 'login' || id === 'registro'){
    try { if(window.Nube && Nube.cargar) Nube.cargar(); } catch(e){}
    try { if(typeof _desbloquearEntrada === 'function') _desbloquearEntrada(); } catch(e){}
  }
  window.scrollTo(0,0);
  const main = document.querySelector('.shell-main');
  if(main) main.scrollTo(0,0);
};
document.querySelectorAll('.shell-nav-item').forEach(item=>{
  item.addEventListener('click', ()=> showScreen(item.dataset.screen));
});
// Arranque inteligente: si ya hay sesión en este dispositivo → Inicio; si no → Login
(function(){
  // Si llega por un enlace de invitación, va directo a la pantalla del invitado
  if(detectarInvitacion()){
    showScreen('invitado');
    return;
  }
  try{ CDB.aplicarModo(); CDB.renderTodo(); }catch(e){}
  try{ if(window._arrancarNube) _arrancarNube(); }catch(e){}

  var tieneClinica = false;
  try { tieneClinica = CDB.registrado(); } catch(e){}
  var tieneCuenta  = false, sesion = false;
  try { tieneCuenta = CAuth.existe(); sesion = CAuth.activa(); } catch(e){}

  // Quien ya usaba la app antes de que existieran las cuentas no se queda fuera
  if(tieneClinica && !tieneCuenta){ try{ CAuth.entrar(); }catch(e){} sesion = true; }

  if(sesion && tieneClinica){
    showScreen('inicio');
    var quien = '';
    try { quien = ((CAuth.cuenta()||{}).nombre || CDB.clinica().nomResp || '').split(/\s+/)[0]; } catch(e){}
    setTimeout(function(){ showToast(quien ? ('Hola de nuevo, ' + quien) : 'Bienvenido/a de nuevo'); }, 600);
  } else if(sesion && tieneCuenta){
    showScreen('benvinguda');
  } else {
    showScreen('login');
  }
})();
