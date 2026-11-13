/* Modo entrevista, calendario, buscador de municipios y navegación en el móvil.
   Parte del antiguo clinica/01-panel.js (Fase 1, paso 1.6b). El orden de carga
   importa: los archivos 01a…01i se cargan uno detrás de otro, como antes. */
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
