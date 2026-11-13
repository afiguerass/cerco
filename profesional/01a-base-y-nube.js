/* Portal del profesional: iconos, utilidades, cálculo DISC y nube (Firebase).
   Parte del antiguo profesional/01-portal.js (Fase 1, paso 1.6b). El orden de carga
   importa: los archivos 01a…01f se cargan seguidos y en este orden. */
/* ================================================================
   CERCO · PORTAL DEL PROFESIONAL
   El candidato se registra, completa su CV resumido, hace el test
   de personalidad, ve las ofertas que publican las clínicas y sigue
   sus solicitudes. Usa el mismo proyecto de Firebase que el panel
   de clínicas:
     candidatos/{uid}          su perfil
     ofertas_publicas/{id}     lo que publican las clínicas
     candidaturas/{oferta_uid} cada solicitud enviada
   ================================================================ */

/* ---------- iconos (Lucide) ---------- */
var ICO = {
  play:'<rect x="3" y="3" width="18" height="18" rx="5"/><path d="m10 8.5 5 3.5-5 3.5z"/>',
  mute:'<path d="M11 4.7a.7.7 0 0 0-1.2-.5L6.4 7.6A1.4 1.4 0 0 1 5.4 8H3a1 1 0 0 0-1 1v6a1 1 0 0 0 1 1h2.4a1.4 1.4 0 0 1 1 .4l3.4 3.4a.7.7 0 0 0 1.2-.5z"/><path d="m22 9-6 6"/><path d="m16 9 6 6"/>',
  volume:'<path d="M11 4.7a.7.7 0 0 0-1.2-.5L6.4 7.6A1.4 1.4 0 0 1 5.4 8H3a1 1 0 0 0-1 1v6a1 1 0 0 0 1 1h2.4a1.4 1.4 0 0 1 1 .4l3.4 3.4a.7.7 0 0 0 1.2-.5z"/><path d="M16 9a5 5 0 0 1 0 6"/><path d="M19.4 18.4a9 9 0 0 0 0-12.7"/>',
  up:'<path d="m18 15-6-6-6 6"/>',
  tools:'<path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"/>',
  house:'<path d="M15 21v-8a1 1 0 0 0-1-1h-4a1 1 0 0 0-1 1v8"/><path d="M3 10a2 2 0 0 1 .709-1.528l7-5.999a2 2 0 0 1 2.582 0l7 5.999A2 2 0 0 1 21 10v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>',
  search:'<circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/>',
  send:'<path d="M14.536 21.686a.5.5 0 0 0 .937-.024l6.5-19a.496.496 0 0 0-.635-.635l-19 6.5a.5.5 0 0 0-.024.937l7.93 3.18a2 2 0 0 1 1.112 1.11z"/><path d="m21.854 2.147-10.94 10.939"/>',
  user:'<path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>',
  pin:'<path d="M20 10c0 4.993-5.539 10.193-7.399 11.799a1 1 0 0 1-1.202 0C9.539 20.193 4 14.993 4 10a8 8 0 0 1 16 0"/><circle cx="12" cy="10" r="3"/>',
  clock:'<circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>',
  euro:'<path d="M4 10h12"/><path d="M4 14h9"/><path d="M19 6a7.7 7.7 0 0 0-5.2-2A7.9 7.9 0 0 0 6 12c0 4.4 3.5 8 7.8 8 2 0 3.8-.8 5.2-2"/>',
  cal:'<path d="M8 2v4"/><path d="M16 2v4"/><rect width="18" height="18" x="3" y="4" rx="2"/><path d="M3 10h18"/>',
  briefcase:'<path d="M16 20V4a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/><rect width="20" height="14" x="2" y="6" rx="2"/>',
  building:'<path d="M6 22V4a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v18Z"/><path d="M6 12H4a2 2 0 0 0-2 2v6a2 2 0 0 0 2 2h2"/><path d="M18 9h2a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2h-2"/><path d="M10 6h4"/><path d="M10 10h4"/><path d="M10 14h4"/><path d="M10 18h4"/>',
  right:'<path d="m9 18 6-6-6-6"/>',
  left:'<path d="m15 18-6-6 6-6"/>',
  check:'<path d="M20 6 9 17l-5-5"/>',
  x:'<path d="M18 6 6 18"/><path d="m6 6 12 12"/>',
  logout:'<path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" x2="9" y1="12" y2="12"/>',
  sparkles:'<path d="M9.937 15.5A2 2 0 0 0 8.5 14.063l-6.135-1.582a.5.5 0 0 1 0-.962L8.5 9.936A2 2 0 0 0 9.937 8.5l1.582-6.135a.5.5 0 0 1 .963 0L14.063 8.5A2 2 0 0 0 15.5 9.937l6.135 1.581a.5.5 0 0 1 0 .964L15.5 14.063a2 2 0 0 0-1.437 1.437l-1.582 6.135a.5.5 0 0 1-.963 0z"/><path d="M20 3v4"/><path d="M22 5h-4"/><path d="M4 17v2"/><path d="M5 18H3"/>',
  info:'<circle cx="12" cy="12" r="10"/><path d="M12 16v-4"/><path d="M12 8h.01"/>',
  mail:'<rect width="20" height="16" x="2" y="4" rx="2"/><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/>',
  phone:'<path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/>',
  file:'<path d="M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z"/><path d="M14 2v4a2 2 0 0 0 2 2h4"/><path d="M10 9H8"/><path d="M16 13H8"/><path d="M16 17H8"/>',
  eye:'<path d="M2.062 12.348a1 1 0 0 1 0-.696 10.75 10.75 0 0 1 19.876 0 1 1 0 0 1 0 .696 10.75 10.75 0 0 1-19.876 0"/><circle cx="12" cy="12" r="3"/>',
  video:'<path d="m16 13 5.223 3.482a.5.5 0 0 0 .777-.416V7.87a.5.5 0 0 0-.752-.432L16 10.5"/><rect x="2" y="6" width="14" height="12" rx="2"/>',
  pencil:'<path d="M21.174 6.812a1 1 0 0 0-3.986-3.987L3.842 16.174a2 2 0 0 0-.5.83l-1.321 4.352a.5.5 0 0 0 .623.622l4.353-1.32a2 2 0 0 0 .83-.497z"/>',
  compass:'<circle cx="12" cy="12" r="10"/><path d="m16.24 7.76-2.12 6.36-6.36 2.12 2.12-6.36 6.36-2.12z"/>',
  plus:'<path d="M5 12h14"/><path d="M12 5v14"/>',
  minus:'<path d="M5 12h14"/>',
  upload:'<path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><path d="m17 8-5-5-5 5"/><path d="M12 3v12"/>',
  triang:'<path d="M8 5v14l11-7z"/>',
  scissors:'<circle cx="6" cy="6" r="3"/><path d="M8.12 8.12 12 12"/><path d="M20 4 8.12 15.88"/><circle cx="6" cy="18" r="3"/><path d="M14.8 14.8 20 20"/>',
  image:'<rect width="18" height="18" x="3" y="3" rx="2"/><circle cx="9" cy="9" r="2"/><path d="m21 15-3.09-3.09a2 2 0 0 0-2.82 0L6 21"/>',
  camera:'<path d="M14.5 4h-5L7 7H4a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2h-3l-2.5-3z"/><circle cx="12" cy="13" r="3"/>',
  trash:'<path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/>',
  msg:'<path d="M7.9 20A9 9 0 1 0 4 16.1L2 22Z"/>',
  users:'<path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/>'
};
function svg(n, c, s){
  return '<svg class="ico" xmlns="http://www.w3.org/2000/svg" width="'+(s||18)+'" height="'+(s||18)+'" viewBox="0 0 24 24" fill="none" stroke="'+(c||'currentColor')+'" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">'+(ICO[n]||'')+'</svg>';
}
function pintarIconos(root){
  (root||document).querySelectorAll('[data-ico]').forEach(function(el){
    if(el.dataset.fet) return;
    el.dataset.fet = '1';
    el.outerHTML = svg(el.dataset.ico, el.dataset.c, parseInt(el.dataset.s,10) || 18);
  });
}

/* ---------- utilitats ---------- */
function esc(t){ return String(t==null?'':t).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;').replace(/'/g,'&#39;'); }
function $(id){ return document.getElementById(id); }
function val(id){ var e = $(id); return e ? String(e.value||'').trim() : ''; }
function inicial(n){ n = String(n||'').trim(); if(!n) return '?'; var p = n.split(/\s+/); return (p[0].charAt(0) + (p.length>1 ? p[p.length-1].charAt(0) : '')).toUpperCase(); }
function primerNom(n){ return String(n||'').trim().split(/\s+/)[0] || ''; }
function emailOk(e){ return /^[^\s@]+@[^\s@]+\.[a-zA-Z]{2,}$/.test(e); }
var _tt = null;
function toast(m, boton, accion){
  var t = $('toast'); if(!t) return;
  t.textContent = m;
  if(boton){ var b = document.createElement('button'); b.type = 'button'; b.className = 'toast-b'; b.textContent = boton; b.onclick = function(){ t.classList.remove('on'); accion(); }; t.appendChild(b); }
  t.classList.add('on');
  clearTimeout(_tt); _tt = setTimeout(function(){ t.classList.remove('on'); }, 3200);
}
function error(id, m){
  var e = $(id); if(!e) return;
  e.textContent = m || '';
  if(m){ try{ var r = e.getBoundingClientRect(); if(r.top < 60 || r.bottom > innerHeight - 80) e.scrollIntoView({behavior:'smooth', block:'center'}); }catch(x){} }
}
function cuando(iso){
  if(!iso) return '';
  var d = new Date(iso); if(isNaN(d)) return '';
  var ara = new Date(), min = Math.round((ara - d)/60000);
  if(min < 1) return 'Ahora mismo';
  if(min < 60) return 'Hace ' + min + ' min';
  var h = Math.round(min/60);
  if(h < 24 && d.getDate() === ara.getDate()) return 'Hoy, ' + d.toLocaleTimeString('es-ES',{hour:'2-digit',minute:'2-digit'});
  var ahir = new Date(ara); ahir.setDate(ara.getDate()-1);
  if(d.toDateString() === ahir.toDateString()) return 'Ayer, ' + d.toLocaleTimeString('es-ES',{hour:'2-digit',minute:'2-digit'});
  var d0 = new Date(d.getFullYear(), d.getMonth(), d.getDate()), a0 = new Date(ara.getFullYear(), ara.getMonth(), ara.getDate());
  var dies = Math.round((a0 - d0)/86400000);
  if(dies > 1 && dies < 7) return 'Hace ' + dies + ' días';
  return d.toLocaleDateString('es-ES',{day:'numeric',month:'short'});
}
function unaVez(k, ms){
  window.__oc = window.__oc || {};
  var a = Date.now();
  if(window.__oc[k] && a - window.__oc[k] < (ms||1200)) return false;
  window.__oc[k] = a; return true;
}

/* ---------- DISC ---------- */
var LETRAS = ['D','I','S','C'];
var COLOR = {D:'#FF5A5F', I:'#F0A800', S:'#00B488', C:'#5B5FE0'};
var NOMBRE = {D:'Dominante', I:'Influyente', S:'Estable', C:'Concienzudo'};
var DESC = {
  D:'Orientado/a a resultados, decidido/a y directo/a. Te motivan los retos y la autonomía.',
  I:'Comunicativo/a, entusiasta y con facilidad para conectar con las personas. Aportas energía al equipo.',
  S:'Paciente, fiable y constante. Eres el pilar que mantiene la calma y la cohesión del equipo.',
  C:'Preciso/a, metódico/a y analítico/a. Cuidas la calidad y el detalle por encima de todo.'
};
var APORTA = {
  D:'decidir rápido y tirar del equipo cuando hay presión',
  I:'el trato cercano con el paciente y la energía en el equipo',
  S:'la paciencia y la constancia en el día a día',
  C:'la precisión y el método, sin saltarse un protocolo'
};

/* Las mismas 15 preguntas que el test del panel de clínicas:
   así un candidato y un equipo se miden con la misma regla. */
var PREG = [
  ["Tomo decisiones rápidas, incluso bajo presión","Me gusta animar y motivar al equipo","Prefiero rutinas claras y previsibles","Reviso los detalles antes de dar algo por terminado"],
  ["Me orienta más el resultado que el proceso","Conecto fácilmente con pacientes y compañeros nuevos","Soy la persona en quien el equipo confía para mantener la calma","Sigo protocolos y normas con rigor"],
  ["No tengo miedo de decir las cosas directamente","Hablo mucho y me gusta que el ambiente sea distendido","Evito el conflicto y busco la armonía del grupo","Prefiero tenerlo todo documentado y ordenado"],
  ["Me aburro si no tengo retos constantes","Se me ocurren ideas nuevas con facilidad","Soy constante y no abandono fácilmente una tarea","Analizo bien antes de actuar, no voy con prisas"],
  ["Tomo el control cuando nadie lidera","Disfruto siendo el centro de atención en reuniones de equipo","Me adapto bien a los cambios si se hacen con tiempo y explicación","Me molesta trabajar con información incompleta"],
  ["Quiero ver resultados ya, no esperar","Convenzo mejor hablando que escribiendo","Escucho más de lo que hablo","Prefiero la calidad a la velocidad"],
  ["Asumo riesgos con facilidad","Creo en el poder de las relaciones personales","Necesito sentirme seguro/a antes de cambiar de método","Me cuesta delegar si no estoy seguro/a de que lo harán bien"],
  ["Puedo ser percibido/a como impaciente","Me distraigo fácilmente con conversaciones sociales","Me cuesta decir que no","Soy crítico/a conmigo mismo/a y con los demás"],
  ["Prefiero marcar yo el ritmo del día","Me gusta improvisar más que planificar al detalle","Valoro mucho la lealtad al equipo","Prefiero hechos y datos antes que opiniones"],
  ["Compito, incluso en cosas pequeñas","Inspiro confianza fácilmente a primera vista","Soy paciente con pacientes/compañeros difíciles","Detecto errores que otros no ven"],
  ["Voy directo al grano, sin rodeos","Me expreso con entusiasmo y gestos","Me cuesta trabajar bajo presión constante","Prefiero seguir un plan antes que improvisar"],
  ["Asumo responsabilidad aunque sea difícil","Recuerdo nombres y detalles personales de la gente","Prefiero un entorno de trabajo estable y sin sorpresas","Verifico dos veces antes de entregar un trabajo"],
  ["Me frustra la gente lenta para decidir","Prefiero trabajar acompañado/a que solo/a","Soy de confianza, hago lo que prometo","Tengo estándares altos, a veces demasiado exigentes"],
  ["Me gusta tener el control de la situación","Tengo facilidad para hacer reír o animar","Me adapto al ritmo de los demás sin quejarme","Me incomoda cuando no siguen el procedimiento correcto"],
  ["Quiero verme a mí mismo/a como líder del equipo","Me motiva sentirme valorado/a por los demás","Soy el pilar estable cuando hay tensión en la clínica","Prefiero la precisión a la rapidez"]
];

/* Mismo cálculo que el panel: +2 a la frase con un 4, -1 a la del 1 */
function calcularDisc(resp){
  var r = CERCO_discCalc(resp.map(function(x){ return [0,1,2,3].map(function(k){ return x[k] || 0; }); }), LETRAS);
  var ord = r.ord;
  return { dom:ord[0], sec:ord[1], norm:r.norm, definido:r.definido, v:2, fecha:new Date().toISOString() };
}

/* Encaje con una oferta: cuánto de lo que pide el puesto es de lo
   más fuerte en ti. 100 sería que tus dos rasgos más altos son
   justo los que marcó la clínica; nunca lo enseñamos como certeza. */
function perfilesDe(o){ return CERCO_perfilesDeOferta(o); }
/* El encaje solo tiene sentido dentro de tu profesión: un odontólogo no «encaja» en una
   oferta de auxiliar por mucho que coincida su forma de trabajar. */
function otraProfesion(o){ var p = S.perfil || {}; return !!(p.profesion && PROF_RE[p.profesion] && !o.ejemplo && !mismaProfesion(o, p)); }
function encaje(disc, o){
  if(o && otraProfesion(o)) return null;
  return CERCO_encaje(disc && disc.norm, perfilesDe(o));
}
function colorEncaje(p){ return p === null ? '#9CA3AF' : (p >= 80 ? '#0E9F6E' : (p >= 65 ? '#1A56DB' : '#9CA3AF')); }
function porQueEncaje(disc, o){
  var ps = perfilesDe(o);
  if(!disc || !ps.length) return '';
  var nomPs = ps.map(function(l){ return '<b>'+NOMBRE[l]+' ('+l+')</b>'; }).join(' y ');
  var t = 'La clínica busca ' + nomPs + ' para este puesto. ';
  var d = ps.indexOf(disc.dom) > -1, s = ps.indexOf(disc.sec) > -1;
  if(d && s) t += 'Tus dos rasgos principales coinciden con lo que piden: aportas ' + APORTA[disc.dom] + ' y ' + APORTA[disc.sec] + '.';
  else if(d) t += 'Tu rasgo principal, ' + NOMBRE[disc.dom].toLowerCase() + ', es justo uno de ellos: aportas ' + APORTA[disc.dom] + '.';
  else if(s) t += 'Tu segundo rasgo, ' + NOMBRE[disc.sec].toLowerCase() + ', es uno de ellos. Tu punto fuerte principal (' + NOMBRE[disc.dom].toLowerCase() + ') puede sumar al equipo de otra manera.';
  else t += 'Tu perfil es distinto (' + NOMBRE[disc.dom].toLowerCase() + '). No te descarta: a veces un equipo necesita justo lo que le falta.';
  return t;
}
function anillo(p, size){
  size = size || 52;
  var r = size/2 - 5, c = 2*Math.PI*r, col = colorEncaje(p), v = p === null ? 0 : p;
  return '<svg width="'+size+'" height="'+size+'" viewBox="0 0 '+size+' '+size+'">'
    + '<circle cx="'+size/2+'" cy="'+size/2+'" r="'+r+'" fill="none" stroke="#EEF0F3" stroke-width="5"/>'
    + '<circle cx="'+size/2+'" cy="'+size/2+'" r="'+r+'" fill="none" stroke="'+col+'" stroke-width="5" stroke-linecap="round" stroke-dasharray="'+(c*v/100)+' '+c+'" transform="rotate(-90 '+size/2+' '+size/2+')"/>'
    + '<text x="50%" y="50%" dominant-baseline="central" text-anchor="middle" font-size="'+(size*0.27)+'" font-weight="800" fill="'+(p===null?'#9CA3AF':'#111827')+'">'+(p===null?'–':p+'%')+'</text></svg>';
}
function barras(norm){
  return LETRAS.slice().sort(function(a,b){ return norm[b]-norm[a]; }).map(function(l){
    return '<div class="br"><div class="bl"><span>'+NOMBRE[l]+' ('+l+')</span><span>'+norm[l]+'%</span></div>'
      + '<div class="bt"><div style="width:'+norm[l]+'%;background:'+COLOR[l]+'"></div></div></div>';
  }).join('');
}
function chipDisc(l, txt){ return '<span class="pill" style="background:'+COLOR[l]+';color:#fff;">'+l+(txt ? ' · '+txt : '')+'</span>'; }

/* ================================================================
   NUBE
   ================================================================ */
window.CERCO_FB = {
  apiKey: "AIzaSyBfMikfSWFisysjXvRbMDtupjiGFvT7uTI",
  authDomain: "cerco-c5724.firebaseapp.com",
  projectId: "cerco-c5724",
  storageBucket: "cerco-c5724.firebasestorage.app",
  messagingSenderId: "786949705772",
  appId: "1:786949705772:web:2fafd09d59a0922b284189"
};

var Nube = {
  uid:null, email:null,
  cargar: function(){
    if(this._c) return this._c;
    this._c = new Promise(function(res){
      var fin = false, acaba = function(ok){ if(!fin){ fin = true; res(ok); } };
      var inicia = function(){
        try{ if(!firebase.apps.length) firebase.initializeApp(window.CERCO_FB); acaba(true); }
        catch(e){ acaba(false); }
      };
      // Firebase va dentro de la web (src/comun/firebase.js) y avisa cuando está listo
      if(window.__cercoFirebaseListo) return inicia();
      window.addEventListener('cerco-firebase-listo', inicia, { once: true });
      setTimeout(function(){ acaba(false); }, 12000);
    }).then(function(ok){
      // y la lista de municipios (comun/geo.js), para que los km salgan desde el principio
      return (window.CGeo && CGeo.listo ? CGeo.listo : Promise.resolve()).then(function(){ return ok; });
    });
    return this._c;
  },
  db: function(){ return firebase.firestore(); },

  perfil: function(){
    return this.db().collection('candidatos').doc(this.uid).get()
      .then(function(d){ return d.exists ? d.data() : null; });
  },
  /* Guardar el perfil (Fase 1: una sola versión). Primero lo básico y después,
     en el mismo orden que antes, los ajustes, las entrevistas preparadas y el
     consentimiento del test con las clínicas bloqueadas. */
  guardarPerfil: function(p){
    return this._guardarPerfilBase(p)
      .then(function(r){ return window.CERCO_perfilAjustes ? CERCO_perfilAjustes(p, r) : r; })
      .then(function(r){ return window.CERCO_perfilEnsayos ? CERCO_perfilEnsayos(p, r) : r; })
      .then(function(r){ return window.CERCO_perfilConsentimiento ? CERCO_perfilConsentimiento(p, r) : r; });
  },
  _guardarPerfilBase: function(p){
    var d = {};
    ['nombre','email','telefono','ciudad','profesion','experiencia','titulacion','jornada','disponibilidad','resumen']
      .forEach(function(k){ if(p[k] !== undefined) d[k] = String(p[k]||'').slice(0, k==='resumen' ? 400 : 120); });
    if(Array.isArray(p.fuertes)) d.fuertes = p.fuertes.slice(0,5).map(function(x){ return String(x).slice(0,40); });
    if(Array.isArray(p.trabajos)) d.trabajos = p.trabajos.slice(0,5).map(function(t){
      return { puesto:String(t.puesto||'').slice(0,80), centro:String(t.centro||'').slice(0,80), tiempo:String(t.tiempo||'').slice(0,40) };
    });
    if(p.disc) d.disc = p.disc;
    if(Array.isArray(p.discHist)) d.discHist = histDiscLimpio(p.discHist);
    if(p.discVeces) d.discVeces = Math.max(1, Math.min(999, parseInt(p.discVeces, 10) || 1));
    if(p.geo !== undefined) d.geo = geoLimpio(p.geo);
    if(p.radio !== undefined) d.radio = radioLimpio(p.radio);
    if(p.foto !== undefined) d.foto = String(p.foto||'').slice(0, 250000);
    if(p.video !== undefined) d.video = p.video || null;
    if(p.cv !== undefined) d.cv = p.cv || null;
    if(Array.isArray(p.clinicas)) d.clinicas = p.clinicas.slice(-200);
    if(p.bienvenida) d.bienvenida = true;
    if(p.sinExperiencia !== undefined) d.sinExperiencia = !!p.sinExperiencia;
    if(p.guia) d.guia = true;
    d.tipo = 'candidato';
    d.actualizado = new Date().toISOString();
    if(!p.alta) d.alta = d.actualizado;
    return this.db().collection('candidatos').doc(this.uid).set(d, {merge:true});
  },
  esClinica: function(){
    return this.db().collection('clinicas').doc(this.uid).get()
      .then(function(d){ return d.exists && !!(d.data()||{}).nom; }).catch(function(){ return false; });
  },
  escucharOfertas: function(fn){
    return this.db().collection('ofertas_publicas').where('estado','==','activa').onSnapshot(function(s){
      var out = []; s.forEach(function(d){ var x = d.data(); x.id = d.id; out.push(x); }); fn(out);
    }, function(){});
  },
  ofertas: function(){
    return this.db().collection('ofertas_publicas').where('estado','==','activa').get().then(function(s){
      var out = []; s.forEach(function(d){ var x = d.data(); x.id = d.id; out.push(x); }); return out;
    });
  },
  escucharSolicitudes: function(fn, fallo){
    return this.db().collection('candidaturas').where('candidatoUid','==',this.uid).onSnapshot(function(s){
      var out = []; s.forEach(function(d){ var x = d.data(); x.id = d.id; out.push(x); }); fn(out);
    }, function(e){ if(fallo) fallo(e); });
  },
  clinicaPublica: function(cid){
    return this.db().collection('clinicas_publicas').doc(cid).get().then(function(d){ return d.exists ? d.data() : null; });
  },
  tiempos: function(cid){
    return this.db().collection('tiempos_respuesta').where('clinicaId','==',cid).get().then(function(s){
      var out = []; s.forEach(function(d){ out.push(d.data()); }); return out;
    });
  },
  solicitar: function(o, perfil, mensaje, pct, tipo, modo, extra){
    var visita = tipo === 'visita';
    var id = (visita ? 'v_' : '') + String(o.id) + '_' + this.uid;
    var ahora = new Date().toISOString();
    var doc = {
      ofertaId:String(o.id), clinicaId:String(o.clinicaId||''), candidatoUid:this.uid,
      ofertaTitulo:String(o.titulo||'').slice(0,120), clinicaNombre:String(o.clinica||'').slice(0,120),
      ofertaCiudad:String(o.ubicacion||o.ciudad||'').slice(0,120),
      perfiles:perfilesDe(o),
      nombre:perfil.nombre||'', email:perfil.email||this.email||'', telefono:perfil.telefono||'',
      ciudad:perfil.ciudad||'', profesion:perfil.profesion||'', experiencia:perfil.experiencia||'',
      titulacion:perfil.titulacion||'', resumen:perfil.resumen||'', fuertes:perfil.fuertes||[],
      trabajos:perfil.trabajos||[], sinExperiencia:!!perfil.sinExperiencia && !(perfil.trabajos||[]).length, jornada:perfil.jornada||'', disponibilidad:perfil.disponibilidad||'',
      disc:perfil.disc||null, encaje:pct,
      discHist:histDiscLimpio(perfil.discHist), discVeces:perfil.discVeces || (perfil.disc ? 1 : 0),
      geo:geoLimpio(perfil.geo), radio:perfil.radio ? radioLimpio(perfil.radio) : null, kmOferta:CGeo.km(perfil.geo, geoOferta(o)),
      foto:perfil.foto||'', video:perfil.video||null, cv:perfil.cv||null,
      mensaje:String(mensaje||'').slice(0,500),
      estado:'enviada', fecha:ahora, actualizado:ahora,
      historial:[{estado:'enviada', fecha:ahora}]
    };
    if(visita){ doc.tipo = 'visita'; doc.modo = String(modo||'Visita presencial').slice(0,40); }
    if(extra) Object.assign(doc, extra);
    var db = this.db(), self = this;
    // la clínica a la que escribes pasa a poder ver tu vídeo y tu CV completo
    var cls = (perfil.clinicas || []).slice();
    var antes = cls.indexOf(doc.clinicaId) > -1 ? Promise.resolve() : (cls.push(doc.clinicaId), perfil.clinicas = cls, self.guardarPerfil(perfil));
    return antes.then(function(){ return db.collection('candidaturas').doc(id).set(doc); }).then(function(){
      // registro sin datos personales: solo sirve para calcular cuánto tarda la clínica en contestar
      db.collection('tiempos_respuesta').doc(id).set({clinicaId:doc.clinicaId, enviada:ahora, respondida:null, retirada:false, tipo:visita?'visita':'solicitud'}).catch(function(){});
      doc.id = id; return doc;
    });
  },
  retirar: function(s){
    var ahora = new Date().toISOString();
    var h = (s.historial||[]).slice(); h.push({estado:'retirada', fecha:ahora});
    var db = this.db();
    return db.collection('candidaturas').doc(s.id).update({estado:'retirada', actualizado:ahora, historial:h}).then(function(){
      db.collection('tiempos_respuesta').doc(s.id).update({retirada:true}).catch(function(){});
    });
  }
};
