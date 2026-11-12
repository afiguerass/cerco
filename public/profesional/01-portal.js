/* Portal del profesional: alta, test DISC, nube (Firebase), ofertas, solicitudes, perfil, vídeo… */
/* Archivo sacado tal cual de candidato.html (Fase 1, paso 1.6). El orden de carga
   importa: se carga en el mismo sitio de la página donde estaba. */
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
      if(window.firebase && firebase.firestore && firebase.auth) return inicia();
      var urls = [
        'https://www.gstatic.com/firebasejs/10.12.0/firebase-app-compat.js',
        'https://www.gstatic.com/firebasejs/10.12.0/firebase-auth-compat.js',
        'https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore-compat.js'
      ], i = 0;
      var seg = function(){
        if(i >= urls.length) return inicia();
        var s = document.createElement('script');
        s.src = urls[i++]; s.async = false;
        s.onload = seg; s.onerror = function(){ acaba(false); };
        document.head.appendChild(s);
      };
      setTimeout(function(){ acaba(false); }, 12000);
      seg();
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

/* ================================================================
   ESTADO
   ================================================================ */
var S = { perfil:null, ofertas:[], ofertasCargadas:false, sols:[], solsCargadas:false, filtro:'todas', actual:null, vista:null, clinicas:{}, tiempos:{} };
var _unsubSol = null;
var _estadosVistos = {}, _msgsVistos = {}, _citasVistas = {};

var EJEMPLOS = [
  {id:'ej1', ejemplo:true, titulo:'Higienista dental', clinica:'Clínica Dental Mar Blau', ubicacion:'Girona', jornada:'Completa', salario:'20.000–24.000 €', disponibilidad:'Inmediata', perfiles:['I','S'],
   descripcion:'Buscamos higienista para un equipo de seis personas. Trato muy cercano con el paciente, agenda bien organizada y formación continua pagada por la clínica.', requisitos:'Técnico Superior en Higiene Bucodental\nExperiencia en periodoncia valorable\nGanas de trabajar en equipo', fecha:new Date(Date.now()-2*86400000).toISOString()},
  {id:'ej2', ejemplo:true, titulo:'Auxiliar de clínica dental', clinica:'Centro Odontológico Sants', ubicacion:'Barcelona', jornada:'Parcial', salario:'A convenir', disponibilidad:'En 15 días', perfiles:['S','C'],
   descripcion:'Asistencia en gabinete, esterilización y preparación de material. Horario de tardes.', requisitos:'Título de Auxiliar de Enfermería o similar\nRigor con los protocolos de esterilización', fecha:new Date(Date.now()-5*86400000).toISOString()},
  {id:'ej3', ejemplo:true, titulo:'Coordinador/a de recepción', clinica:'Clínica Dental Retiro', ubicacion:'Madrid', jornada:'Completa', salario:'22.000 €', disponibilidad:'En 1 mes', perfiles:['D','I'],
   descripcion:'Llevarás la agenda de cuatro doctores, la relación con los pacientes y los presupuestos.', requisitos:'Experiencia en atención al paciente\nManejo de software de gestión clínica', fecha:new Date(Date.now()-86400000).toISOString()}
];

/* Ofertas que se ven: todas menos las de clínicas que la persona ha bloqueado (Fase 1: una sola versión) */
function ofertasVisibles(){
  var b = (S.perfil||{}).bloqueadas || [], l = S.ofertas;
  return b.length ? l.filter(function(o){ return b.indexOf(String(o.clinicaId)) === -1; }) : l;
}
function hayReales(){ return S.ofertas.length > 0; }

/* ---------- distancias ----------
   Tu pueblo (perfil) -> el pueblo de la oferta, en línea recta.
   La clínica guarda las coordenadas al publicar; si una oferta antigua
   no las tiene, las sacamos del nombre del municipio. */
function geoLimpio(g){
  if(!g || g.lat == null || isNaN(+g.lat)) return null;
  return { lat:Math.round(+g.lat*1000)/1000, lng:Math.round(+g.lng*1000)/1000, prov:String(g.prov||g.p||'').slice(0,40), n:String(g.n||'').slice(0,80) };
}
function radioLimpio(r){ if(r === 'prov' || r === 'todo') return r; r = parseInt(r,10); return r > 0 && r <= 1000 ? r : 25; }
function geoOferta(o){
  if(!o) return null;
  if(o.lat != null && !isNaN(+o.lat)) return { lat:+o.lat, lng:+o.lng, prov:o.prov||'', n:o.ubicacion||'' };
  if(o._g === undefined){ var l = CGeo.lugar(o.ubicacion || o.ciudad); Object.defineProperty(o, '_g', {value: l ? CGeo.geo(l) : null, enumerable:false, writable:true}); }
  return o._g;
}
function zona(){
  if(!S.zona){ var p = S.perfil || {}; S.zona = { origen:p.geo || null, radio:p.radio || 25 }; }
  return S.zona;
}
function kmDe(o, desde){ return CGeo.km(desde || zona().origen, geoOferta(o)); }
function enRadio(o, desde, radio){ if(o.ejemplo || !desde) return true; return CGeo.dentro(desde, geoOferta(o), radio); }
function txtRadio(r, g){
  return r === 'todo' ? 'en toda España' : (r === 'prov' ? 'en la provincia de ' + ((g && g.prov) || 'tu provincia') : 'a menos de ' + r + ' km' + (g && g.n ? ' de ' + g.n : ''));
}
function txtRadioCorto(r){ return r === 'todo' ? 'cualquier sitio' : (r === 'prov' ? 'toda su provincia' : 'hasta ' + r + ' km'); }
// ofertas dentro de lo que marcaste en tu perfil (para Inicio y Seimian)
function ofertasCerca(l){
  var p = S.perfil || {};
  if(!p.geo) return { dentro:l, fuera:[] };
  var r = p.radio || 25, dentro = [], fuera = [];
  l.forEach(function(o){ (enRadio(o, p.geo, r) ? dentro : fuera).push(o); });
  fuera.sort(function(a,b){ return (kmDe(a,p.geo)||1e9) - (kmDe(b,p.geo)||1e9); });
  return { dentro:dentro, fuera:fuera };
}
function buscarOferta(id){
  var l = S.ofertas.concat(EJEMPLOS);
  for(var i=0;i<l.length;i++) if(String(l[i].id) === String(id)) return l[i];
  return null;
}
/* Una oferta solo se puede solicitar una vez: si la retiraste, se queda retirada */
function esVisita(s){ return s && s.tipo === 'visita'; }
function solDeOferta(id){
  for(var i=0;i<S.sols.length;i++) if(String(S.sols[i].ofertaId) === String(id) && !esVisita(S.sols[i])) return S.sols[i];
  return null;
}
function visitaDeOferta(id){
  for(var i=0;i<S.sols.length;i++) if(String(S.sols[i].ofertaId) === String(id) && esVisita(S.sols[i])) return S.sols[i];
  return null;
}

/* Cuánto contesta cada clínica. Cuenta lo respondido y lo que lleva más de
   3 días sin respuesta; lo reciente todavía no cuenta en su contra.
   Con menos de 3 casos no decimos nada: sería injusto con una clínica nueva. */
function statsResp(cid){
  var l = S.tiempos[cid]; if(!l) return null;
  var ahora = Date.now(), horas = [], sin = 0;
  l.forEach(function(t){
    if(t.respondida){ var hh = (new Date(t.respondida) - new Date(t.enviada)) / 3600000; if(hh >= 0) horas.push(hh); }
    else if(!t.retirada && ahora - new Date(t.enviada) > 72*3600000) sin++;
  });
  var n = horas.length + sin;
  if(n < 3) return { nueva:true, n:n };
  horas.sort(function(a,b){ return a-b; });
  var med = horas.length ? horas[Math.floor((horas.length-1)/2)] : null;
  return { pct:Math.round(horas.length/n*100), med:med, n:n };
}
function ultimaRespuesta(cid){ var l = (S.tiempos[cid] || []).map(function(t){ return t.respondida; }).filter(Boolean).sort(); return l.length ? l[l.length-1] : null; }
function textoHoras(hh){ if(hh === null) return ''; if(hh < 1) return 'menos de 1 h'; if(hh < 24) return Math.round(hh) + ' h'; var d = Math.round(hh/24); return d === 1 ? '1 día' : d + ' días'; }
function colorResp(p){ return p >= 80 ? '#0E9F6E' : (p >= 50 ? '#8A5A00' : '#B42318'); }
function solsActivas(){ return S.sols.filter(function(s){ return s.estado !== 'retirada'; }); }

/* ================================================================
   NAVEGACIÓN
   ================================================================ */
var VISTAS_APP = ['inicio','descubrir','ofertas','oferta','solicitudes','solicitud','perfil','herramientas'];
var _saltant = false;
/* Ir a una pantalla del portal (y pintar Herramientas al entrar) (Fase 1: una sola versión) */
function ir(v, arg, noHist){
  var r = _irBase.apply(this, arguments);
  if(window.CERCO_irHerramientas) CERCO_irHerramientas.apply(this, arguments);
  return r;
}
function _irBase(v, arg, noHist){
  if(VISTAS_APP.indexOf(v) > -1 && !Nube.uid) v = 'login';
  if(v === 'oferta') S.actual = arg;
  if(v === 'solicitud') S.actualSol = arg;
  S.vista = v;
  document.querySelectorAll('.view').forEach(function(s){ s.classList.toggle('active', s.id === 'v-' + v); });
  var nav = { oferta:'ofertas', solicitud:'solicitudes' }[v] || v;
  document.querySelectorAll('.nav-item[data-v], .tab[data-v]').forEach(function(b){ b.classList.toggle('active', b.dataset.v === nav); });
  document.body.classList.toggle('sin-nav', VISTAS_APP.indexOf(v) === -1);
  if(v === 'inicio'){ pintarInicio(); guiaSiToca(); }
  if(v !== 'inicio' && !window._guiaNavega) guiaCerrar(true);
  if(v === 'ofertas') pintarOfertas();
  document.body.classList.toggle('en-dx', v === 'descubrir');
  if(v === 'descubrir'){ try{ pintarDescubrir(); }catch(e){} } else { try{ document.querySelectorAll('#dx video').forEach(function(x){ x.pause(); }); }catch(e){} }
  try{ var tt = {inicio:'Inicio', descubrir:'Descubrir', ofertas:'Ofertas', oferta:'Oferta', solicitudes:'Mis solicitudes', solicitud:'Solicitud', perfil:'Mi perfil', herramientas:'Herramientas'}[v]; $('mtop-t').textContent = tt || ''; }catch(e){}
  if(v === 'oferta') pintarDetalle();
  if(v === 'solicitudes') pintarSolicitudes();
  if(v === 'solicitud') pintarSolicitud();
  if(v === 'perfil') pintarPerfil();
  if(!noHist && !_saltant){
    try{
      var st = {v:v, a:arg||null};
      if(!history.state || !history.state.v) history.replaceState(st, '');
      else if(history.state.v !== v || history.state.a !== (arg||null)) history.pushState(st, '');
    }catch(e){}
  }
  window.scrollTo(0,0);
  pintarIconos();
}
window.addEventListener('popstate', function(ev){
  var st = ev.state; if(!st || !st.v) return;
  // Sin sesión no se vuelve a pantallas de dentro
  if(VISTAS_APP.indexOf(st.v) > -1 && !Nube.uid) return;
  if((st.v === 'login' || st.v === 'registro' || st.v === 'portada') && Nube.uid) return;
  _saltant = true; try{ ir(st.v, st.a, true); }catch(e){} _saltant = false;
});

/* ================================================================
   ENTRAR / REGISTRARSE
   ================================================================ */
function verPwd(id){ var i = $(id); if(i) i.type = i.type === 'password' ? 'text' : 'password'; }

function traducirError(x, ctx){
  var c = (x && x.code) || '';
  if(c === 'auth/wrong-password' || c === 'auth/invalid-credential' || c === 'auth/invalid-login-credentials') return 'El correo o la contraseña no son correctos. Si creaste la cuenta con Google, pulsa «Continuar con Google». Si no la recuerdas, pulsa «¿Olvidaste tu contraseña?».';
  if(c === 'auth/user-not-found') return 'No existe ninguna cuenta con ese correo. Pulsa "Regístrate gratis" para crearla.';
  if(c === 'auth/email-already-in-use') return 'Ya existe una cuenta con ese correo (de profesional o de clínica). Inicia sesión; si no recuerdas la contraseña, pulsa «¿Olvidaste tu contraseña?». Para probar los dos lados, usa otro correo.';
  if(c === 'auth/weak-password') return 'La contraseña necesita al menos 6 caracteres.';
  if(c === 'auth/invalid-email') return 'Ese correo no parece correcto.';
  if(c === 'auth/too-many-requests') return 'Demasiados intentos. Espera un minuto y vuelve a probar.';
  if(c === 'auth/network-request-failed' || c === 'sin-nube') return 'No hay conexión. Revisa tu internet y vuelve a intentarlo.';
  if(c === 'auth/popup-blocked') return 'Tu navegador ha bloqueado la ventana de Google. Permite las ventanas emergentes y vuelve a pulsar.';
  if(c === 'auth/unauthorized-domain') return 'Esta dirección no está autorizada todavía en Firebase.';
  return ctx === 'reg' ? 'No hemos podido crear la cuenta. Inténtalo de nuevo.' : 'No hemos podido entrar. Inténtalo de nuevo.';
}
function bloquear(id, txt){ var b = $(id); if(!b) return; b.disabled = !!txt; if(txt){ b.dataset.t = b.dataset.t || b.textContent; b.textContent = txt; } else if(b.dataset.t){ b.textContent = b.dataset.t; } }

function entrar(){
  var e = val('li-email'), p = ($('li-pwd')||{}).value || '';
  error('li-err', '');
  if(!emailOk(e)) return error('li-err', 'Escribe un correo válido.');
  if(!p) return error('li-err', 'Escribe tu contraseña.');
  if(!unaVez('entrar')) return;
  bloquear('li-btn', 'Comprobando…');
  Nube.cargar().then(function(ok){
    if(!ok) throw {code:'sin-nube'};
    return firebase.auth().signInWithEmailAndPassword(e, p);
  }).then(function(){ $('li-pwd').value = ''; })
  .catch(function(x){ error('li-err', traducirError(x)); })
  .then(function(){ bloquear('li-btn'); });
}

function registrar(){
  var n = val('re-nom'), e = val('re-email'), p = ($('re-pwd')||{}).value || '';
  error('re-err', '');
  if(n.length < 3) return error('re-err', 'Escribe tu nombre y apellido.');
  if(!emailOk(e)) return error('re-err', 'Ese correo no parece correcto. Revísalo.');
  if(p.length < 6) return error('re-err', 'La contraseña necesita al menos 6 caracteres.');
  if(!$('re-ok').checked) return error('re-err', 'Marca la casilla para poder continuar.');
  if(!unaVez('registrar')) return;
  bloquear('re-btn', 'Creando tu cuenta…');
  window.__nomRegistro = n;
  Nube.cargar().then(function(ok){
    if(!ok) throw {code:'sin-nube'};
    return firebase.auth().createUserWithEmailAndPassword(e, p);
  }).then(function(r){
    $('re-pwd').value = '';
    try{ if(r && r.user && r.user.updateProfile) r.user.updateProfile({displayName:n}).catch(function(){}); }catch(x){}
  }).catch(function(x){ error('re-err', traducirError(x, 'reg')); })
  .then(function(){ bloquear('re-btn'); });
}

function google(errId){
  error(errId, '');
  if(!unaVez('google', 1000)) return;
  Nube.cargar().then(function(ok){
    if(!ok) throw {code:'sin-nube'};
    var prov = new firebase.auth.GoogleAuthProvider();
    prov.setCustomParameters({prompt:'select_account'});
    return firebase.auth().signInWithPopup(prov).catch(function(x){
      var c = (x && x.code) || '';
      if(c === 'auth/popup-blocked' || c === 'auth/operation-not-supported-in-this-environment')
        return firebase.auth().signInWithRedirect(prov);
      throw x;
    });
  }).catch(function(x){
    var c = (x && x.code) || '';
    if(c === 'auth/popup-closed-by-user' || c === 'auth/cancelled-popup-request' || c === 'auth/user-cancelled') return;
    error(errId, traducirError(x));
  });
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
function recuperar(){
  var e = val('li-email');
  if(!emailOk(e)){ error('li-err', 'Escribe primero tu correo aquí arriba y vuelve a pulsar.'); try{ $('li-email').focus(); }catch(x){} return; }
  var el = $('li-err'); el.style.color = '#6B7280'; el.textContent = 'Enviando…';
  Nube.cargar().then(function(ok){
    if(!ok) throw {code:'sin-nube'};
    return CERCO_enviarReset(e);
  }).then(function(){
    el.style.color = '#0E9F6E'; el.textContent = CERCO_textoReset(e);
    var b = [].filter.call(document.querySelectorAll('#v-login button, #v-login a'), function(x){ return /olvidaste|reenviar/i.test(x.textContent); })[0];
    try{ CERCO_esperaReenvio(b); }catch(z){}
  }).catch(function(x){
    el.style.color = ''; el.textContent = traducirError(x);
  });
}

function salir(){
  try{ if(_unsubSol) _unsubSol(); }catch(e){} _unsubSol = null;
  try{ if(_unsubOf) _unsubOf(); }catch(e){} _unsubOf = null;
  try{ firebase.auth().signOut(); }catch(e){}
  Nube.uid = null; S.perfil = null; S.sols = []; S.solsCargadas = false; _estadosVistos = {};
  try{ cerrarSeimian(); }catch(e){} var fab = $('sei-fab'); if(fab) fab.hidden = true; _mediaUrl = {video:null, cv:null};
  ir('portada');
  toast('Sesión cerrada');
}

/* Cuando Firebase confirma quién eres, decidimos a qué pantalla vas */
function alEntrar(u){
  Nube.uid = u.uid; Nube.email = u.email || '';
  Nube.perfil().then(function(p){
    if(p) return p;
    // Una cuenta que ya es de clínica no se convierte en candidato sin querer
    return Nube.esClinica().then(function(es){ if(es){ ir('esclinica'); throw 'clinica'; } return null; });
  }).then(function(p){
    S.perfil = p || { nombre: window.__nomRegistro || u.displayName || '', email: u.email || '' };
    // perfiles de antes de los km: sacamos las coordenadas del nombre de su ciudad
    if(S.perfil.ciudad && !S.perfil.geo){ var gl0 = CGeo.lugar(S.perfil.ciudad); if(gl0) S.perfil.geo = CGeo.geo(gl0); }
    S.zona = null;
    if(!S.perfil.email) S.perfil.email = u.email || '';
    pintarUsuario();
    escucharSols();
    escucharInvs();
    cargarOfertas();
    try{ publicarTalento(); }catch(e){}
    if(!S.perfil.profesion){ if(!S.perfil.bienvenida) abrirBienvenida(); else abrirAlta(false); return; }
    if(!S.perfil.disc){ abrirTest(false); return; }
    // al tocar un aviso: abre justo esa pantalla
    var hs = (location.hash || '').slice(1).split(':');
    if((hs[0] === 'solicitud' || hs[0] === 'oferta') && hs[1]){ try{ history.replaceState(null, '', location.pathname + location.search); }catch(e){} ir(hs[0], hs.slice(1).join(':')); return; }
    var dest = (history.state && VISTAS_APP.indexOf(history.state.v) > -1) ? history.state.v : 'inicio';
    var arg = history.state && history.state.a;
    if((dest === 'oferta' || dest === 'solicitud') && !arg) dest = 'inicio';
    ir(dest, arg, true);
  }).catch(function(x){
    if(x === 'clinica') return;
    ir('login');
    error('li-err', 'No hemos podido cargar tu perfil. Revisa tu conexión y vuelve a entrar.');
  });
}

function arrancar(){
  Nube.cargar().then(function(ok){
    if(!ok){
      ir('login', null, true);
      error('li-err', 'No hemos podido conectar con CERCO. Revisa tu conexión y recarga la página.');
      return;
    }
    try{ firebase.auth().getRedirectResult().catch(function(x){ error('li-err', traducirError(x)); }); }catch(e){}
    firebase.auth().onAuthStateChanged(function(u){
      if(u && !u.isAnonymous){ alEntrar(u); }
      else {
        Nube.uid = null;
        var q = new URLSearchParams(location.search);
        ir(q.get('registro') !== null ? 'registro' : 'portada', null, true);
      }
    });
  });
}

/* ================================================================
   DATOS: ofertas y solicitudes
   ================================================================ */
function cargarOfertas(){
  return Nube.ofertas().then(function(l){
    S.ofertas = l.filter(function(o){ return o && o.titulo && o.clinicaId; });
    S.ofertasCargadas = true;
  }).catch(function(){ S.ofertasCargadas = true; S.errOfertas = true; })
  .then(function(){ refrescar(); escucharOfertasDirecto(); return cargarClinicas(); });
}
/* Si una clínica cierra o publica una oferta, se ve sin recargar */
var _unsubOf = null;
function escucharOfertasDirecto(){
  if(_unsubOf) return;
  try{
    var primera = true;
    _unsubOf = Nube.escucharOfertas(function(l){
      if(primera){ primera = false; return; }
      var antes = {}; S.ofertas.forEach(function(o){ antes[o.id] = 1; });
      S.ofertas = l.filter(function(o){ return o && o.titulo && o.clinicaId; });
      var nuevas = S.ofertas.filter(function(o){ return !antes[o.id]; });
      var faltan = S.ofertas.some(function(o){ return !S.tiempos[o.clinicaId]; });
      var mias = ((S.perfil||{}).alertas !== false) ? nuevas.filter(ofertaParaMi) : [];
      if(mias.length === 1){ var km1 = kmDe(mias[0], (S.perfil||{}).geo); avisar('Nueva oferta para ti' + (km1 !== null ? ' a ' + km1 + ' km' : '') + ': ' + mias[0].titulo + ' en ' + (mias[0].clinica || 'una clínica'), 'oferta:' + mias[0].id); }
      else if(mias.length > 1) avisar(mias.length + ' ofertas nuevas para ti', 'inicio');
      else if(nuevas.length === 1) toast('Nueva oferta: ' + nuevas[0].titulo + ' en ' + (nuevas[0].clinica || 'una clínica'));
      else if(nuevas.length > 1) toast(nuevas.length + ' ofertas nuevas');
      refrescar();
      if(faltan) cargarClinicas();
    });
  }catch(e){}
}
/* La página de cada clínica y cómo responde: llegan después, sin bloquear las ofertas */
function cargarClinicas(){
  var ids = {}; S.ofertas.forEach(function(o){ ids[o.clinicaId] = 1; });
  return Promise.all(Object.keys(ids).map(function(cid){
    return Promise.all([
      Nube.clinicaPublica(cid).then(function(c){ S.clinicas[cid] = c; }).catch(function(){}),
      Nube.tiempos(cid).then(function(t){ S.tiempos[cid] = t; }).catch(function(){})
    ]);
  })).then(function(){ S.clinicasCargadas = true; refrescar(); });
}

var TXT_ESTADO = { caducada:'Cerrada sin respuesta', enviada:'Enviada', vista:'Abierta', entrevista:'Te invitan a entrevista', descartada:'No seleccionada', retirada:'Retirada', contratada:'¡Te han contratado!' };
var TXT_VISITA = { caducada:'Sin respuesta', enviada:'Petición enviada', vista:'Vista por la clínica', entrevista:'Te proponen día y hora', descartada:'Ahora no pueden', retirada:'Retirada' };
function txtEstado(s){ if(!esVisita(s) && s.estado === 'vista' && s.interesa) return 'Les interesas'; return (esVisita(s) ? TXT_VISITA : TXT_ESTADO)[s.estado] || s.estado; }
var _intVistos = {};
function escucharSols(){
  if(_unsubSol){ try{ _unsubSol(); }catch(e){} }
  var primer = true;
  _unsubSol = Nube.escucharSolicitudes(function(l){
    l.sort(function(a,b){ return String(b.fecha||'').localeCompare(String(a.fecha||'')); });
    if(!primer){
      l.forEach(function(s){
        var ant = _estadosVistos[s.id], antM = _msgsVistos[s.id], antC = _citasVistas[s.id];
        var cita = s.cita ? s.cita.v + '|' + s.cita.estado : '';
        var quien = s.clinicaNombre || 'La clínica';
        var cambioEst = ant && ant !== s.estado && ['vista','entrevista','descartada','contratada'].indexOf(s.estado) > -1;
        var intNuevo = !!s.interesa && _intVistos[s.id] === false && s.estado === 'vista';
        var citaNueva = antC !== undefined && cita !== antC && s.cita && s.cita.estado === 'propuesta';
        var msgNuevo = antM !== undefined && (s.mensajes||[]).length > antM && ((s.mensajes||[]).slice(-1)[0]||{}).de === 'clinica';
        // lo más importante primero; si además hay mensaje, se dice
        var dst = 'solicitud:' + s.id;
        var frase = { vista:' ha abierto tu solicitud', entrevista: esVisita(s) ? ' te propone día y hora para conocerla' : ' quiere hacerte una entrevista', descartada:' ha elegido otro perfil', contratada:' te ha elegido. ¡Enhorabuena!' }[s.estado] || (': ' + txtEstado(s).toLowerCase());
        if(intNuevo) avisar(quien + ' ha marcado tu perfil como «Me interesa»: sigues en el proceso', dst);
        else if(cambioEst && s.estado !== 'vista') avisar(quien + frase, dst);
        else if(citaNueva) avisar(quien + ' te propone ' + fechaCitaC(s.cita.fecha).toLowerCase(), dst);
        else if(msgNuevo) avisar(quien + (cambioEst ? ' ha visto tu solicitud y te ha escrito' : ' te ha escrito'), dst);
        else if(cambioEst) avisar(quien + frase, dst);
      });
    }
    l.forEach(function(s){ _intVistos[s.id] = !!s.interesa; _estadosVistos[s.id] = s.estado; _msgsVistos[s.id] = (s.mensajes||[]).length; _citasVistas[s.id] = s.cita ? s.cita.v + '|' + s.cita.estado : ''; });
    primer = false;
    S.sols = l; S.solsCargadas = true;
    refrescar();
  }, function(){ S.solsCargadas = true; refrescar(); });
}

function refrescarBadge(){
  var n = Nube.uid ? pendientesC() : 0;
  ['nav-cnt','tab-cnt'].forEach(function(id){ var e = $(id); if(!e) return; e.textContent = n; e.style.display = n ? '' : 'none'; });
}
/* Repintar lo que se ve: base, ajustes y rebote, herramientas y recordatorios de cita (Fase 1: una sola versión) */
function refrescar(){
  var r = _refrescarBase.apply(this, arguments);
  if(window.CERCO_refrescarRebote) CERCO_refrescarRebote.apply(this, arguments);
  if(window.CERCO_refrescarHerramientas) CERCO_refrescarHerramientas.apply(this, arguments);
  if(window.CERCO_refrescarRecordatorios) CERCO_refrescarRecordatorios.apply(this, arguments);
  return r;
}
function _refrescarBase(){
  var n = Nube.uid ? pendientesC() : 0;
  [['nav-cnt'],['tab-cnt']].forEach(function(a){ var e = $(a[0]); if(!e) return; e.textContent = n; e.style.display = n ? '' : 'none'; });
  if(S.vista === 'inicio') pintarInicio();
  if(S.vista === 'ofertas') pintarOfertas();
  if(S.vista === 'oferta') pintarDetalle();
  if(S.vista === 'solicitudes') pintarSolicitudes();
  if(S.vista === 'solicitud') pintarSolicitud();
  pintarIconos();
}

function pintarUsuario(){
  var p = S.perfil || {};
  ['nav-av','mtop-av'].forEach(function(id){ avatar($(id), p); });
  var fab = $('sei-fab'); if(fab) fab.hidden = !Nube.uid;
  $('nav-nom').textContent = p.nombre || '';
  $('nav-rol').textContent = p.profesion || 'Profesional';
}

function avatar(el, p){
  if(!el) return;
  if(p && p.foto) el.innerHTML = '<img src="'+esc(p.foto)+'" alt="" style="width:100%;height:100%;object-fit:cover;border-radius:50%;display:block;">';
  else el.textContent = inicial(p && p.nombre);
}

/* ================================================================
   ALTA (pasos 1 y 2) — también sirve para editar el perfil
   ================================================================ */
var _editant = false;
function abrirAlta(editar){
  _editant = !!editar;
  var p = S.perfil || {};
  $('al-nom').value = p.nombre || '';
  $('al-prof').value = p.profesion || '';
  $('al-exp').value = p.experiencia || '';
  $('al-ciu').value = p.ciudad || '';
  var ci = $('al-ciu'); CGeo.autocompletar(ci, null, function(){ return (S.perfil||{}).geo; }); if(p.geo){ ci.dataset.lat = p.geo.lat; ci.dataset.lng = p.geo.lng; ci.dataset.prov = p.geo.prov; } else delete ci.dataset.lat;
  marcarChips('al-rad', [String(p.radio || 25)]);
  $('al-rad-n').value = chipsSel('al-rad').length ? '' : (typeof p.radio === 'number' ? p.radio : '');
  $('al-tel').value = p.telefono || '';
  $('al-tit').value = p.titulacion || '';
  $('al-res').value = p.resumen || '';
  $('al-res-n').textContent = ($('al-res').value||'').length;
  marcarChips('al-jor', p.jornada ? [p.jornada] : []);
  marcarChips('al-disp', p.disponibilidad ? [p.disponibilidad] : []);
  (p.fuertes || []).forEach(function(f){ pfChip(f); });
  marcarChips('al-pf', p.fuertes || []);
  _exps = (p.trabajos || []).map(function(t){ return {puesto:t.puesto||'', centro:t.centro||'', tiempo:t.tiempo||''}; });
  $('al-sin-exp').checked = !!p.sinExperiencia && !_exps.length;
  pintarExps();
  document.querySelector('#v-alta .steps').style.display = editar ? 'none' : '';
  document.querySelectorAll('#v-alta .step-lbl').forEach(function(e){ e.style.display = editar ? 'none' : ''; });
  $('alta-tit').textContent = editar ? 'Editar mi perfil' : 'Sobre ti';
  $('al-btn2').textContent = editar ? 'Guardar cambios' : 'Continuar';
  botonSalirOb('al-salir', editar);
  error('al-err1',''); error('al-err2','');
  altaPaso(1, true);
  ir('alta', null, true);
}
function altaPaso(n, sinValidar){
  if(n === 2 && !sinValidar){
    error('al-err1','');
    if(val('al-nom').length < 3) return error('al-err1', 'Escribe tu nombre y apellido.');
    if(!val('al-prof')) return error('al-err1', 'Elige tu profesión.');
    if(!val('al-exp')) return error('al-err1', 'Elige cuánta experiencia tienes.');
    if(val('al-ciu').length < 2) return error('al-err1', 'Escribe el pueblo o la ciudad donde vives.');
    if(!geoCiudad()) return error('al-err1', 'No encontramos «' + val('al-ciu') + '». Empieza a escribir y elígelo de la lista.');
    var tel = val('al-tel').replace(/[^\d+]/g,'');
    if(tel.replace(/\D/g,'').length < 9) return error('al-err1', 'Escribe un teléfono de al menos 9 cifras.');
  }
  $('alta-1').style.display = n === 1 ? '' : 'none';
  $('alta-2').style.display = n === 2 ? '' : 'none';
  ['st-1','st-2','st-3'].forEach(function(id, i){ $(id).classList.toggle('on', i < n); });
  window.scrollTo(0,0);
}
function marcarChips(id, vals){
  document.querySelectorAll('#'+id+' .chip').forEach(function(c){ c.classList.toggle('on', vals.indexOf(c.dataset.v) > -1); });
}
function chipsSel(id){
  return [].slice.call(document.querySelectorAll('#'+id+' .chip.on')).map(function(c){ return c.dataset.v; });
}
document.addEventListener('click', function(ev){
  var c = ev.target.closest && ev.target.closest('.chips[id^="al-"] .chip');
  if(!c) return;
  var g = c.parentNode;
  if(g.dataset.uno){ g.querySelectorAll('.chip').forEach(function(x){ if(x !== c) x.classList.remove('on'); }); c.classList.add('on'); return; }
  var max = parseInt(g.dataset.max,10) || 99;
  if(!c.classList.contains('on') && g.querySelectorAll('.chip.on').length >= max){ toast('Puedes elegir hasta ' + max); return; }
  c.classList.toggle('on');
});
document.addEventListener('input', function(ev){
  if(!ev.target) return;
  if(ev.target.id === 'al-res') $('al-res-n').textContent = ev.target.value.length;
  // escribir los km quita la opción marcada, y al revés
  if(ev.target.id === 'al-rad-n' && ev.target.value) marcarChips('al-rad', []);
});
document.addEventListener('click', function(ev){ if(ev.target.closest && ev.target.closest('#al-rad .chip')){ var n = $('al-rad-n'); if(n) n.value = ''; } });
document.addEventListener('change', function(ev){
  if(ev.target && ev.target.id === 'of-rad-n'){ var n = parseInt(ev.target.value, 10); if(n > 0 && n <= 1000) ponerRadio(String(n)); }
});

/* experiencia */
var _exps = [];
function pintarExps(){
  var h = '';
  _exps.forEach(function(t, i){
    h += '<div class="exp-i"><div class="field"><label>Puesto</label><input class="inp" type="text" value="'+esc(t.puesto)+'" oninput="_exps['+i+'].puesto=this.value" placeholder="Ej: Higienista"></div>'
      + '<div class="row2"><div class="field"><label>Clínica</label><input class="inp" type="text" value="'+esc(t.centro)+'" oninput="_exps['+i+'].centro=this.value" placeholder="Nombre de la clínica"></div>'
      + '<div class="field"><label>Tiempo</label><input class="inp" type="text" value="'+esc(t.tiempo)+'" oninput="_exps['+i+'].tiempo=this.value" placeholder="Ej: 2 años"></div></div>'
      + '<button class="btn btn-g" style="padding:4px 0;color:#DC2626;font-size:13px;" onclick="delExp('+i+')">'+svg('trash','#DC2626',14)+'Quitar</button></div>';
  });
  $('al-exps').innerHTML = h;
  $('al-exp-add').style.display = _exps.length >= 5 ? 'none' : '';
  var se = $('al-sin-exp-l'); if(se){ se.style.display = _exps.length ? 'none' : ''; if(_exps.length) $('al-sin-exp').checked = false; }
}
function addExp(){ if(_exps.length >= 5) return; _exps.push({puesto:'',centro:'',tiempo:''}); pintarExps(); var ins = $('al-exps').querySelectorAll('.exp-i'); var ult = ins[ins.length-1]; if(ult){ var f = ult.querySelector('input'); try{ f.focus({preventScroll:true}); }catch(e){} ult.scrollIntoView({behavior:'smooth', block:'center'}); } }
function delExp(i){ _exps.splice(i,1); pintarExps(); }


/* ---------- puntos fuertes propios ---------- */
function pfChip(txt){
  txt = String(txt||'').trim().slice(0,40); if(!txt) return null;
  var g = $('al-pf'), ya = null;
  g.querySelectorAll('.chip').forEach(function(c){ if(c.dataset.v.toLowerCase() === txt.toLowerCase()) ya = c; });
  if(ya) return ya;
  var c = document.createElement('span'); c.className = 'chip chip-mio'; c.dataset.v = txt; c.textContent = txt; g.appendChild(c); return c;
}
function pfAnadir(){
  var i = $('al-pf-n'), c = pfChip(i.value); if(!c){ i.focus(); return; }
  var g = $('al-pf');
  if(!c.classList.contains('on')){
    if(g.querySelectorAll('.chip.on').length >= 5){ toast('Puedes elegir hasta 5. Quita uno para añadir este.'); return; }
    c.classList.add('on');
  }
  i.value = ''; i.focus();
}
document.addEventListener('keydown', function(e){ if(e.target && e.target.id === 'al-pf-n' && e.key === 'Enter'){ e.preventDefault(); pfAnadir(); } });

/* ---------- preséntate con Seimian ----------
   Tres preguntas de un toque y Seimian escribe tres versiones con lo que
   ya sabe de ti (profesión, experiencia, puntos fuertes). Tú eliges una y
   la retocas. En la versión real lo escribe un modelo de IA. */
var PIA = { gusta:'', busca:'', extra:'' };
function abrirPresentacionIA(){
  cerrarModal();
  var ops = function(id, l){ return '<div class="chips" id="'+id+'" data-uno="1">'+l.map(function(x){ return '<span class="chip" data-v="'+esc(x)+'">'+esc(x)+'</span>'; }).join('')+'</div>'; };
  var m = document.createElement('div'); m.className = 'modal-bg'; m.id = 'modal';
  m.onclick = function(e){ if(e.target === m) cerrarModal(); };
  m.innerHTML = '<div class="modal" role="dialog" aria-modal="true" aria-labelledby="pia-t" style="max-width:520px;">'
    + '<h2 id="pia-t">'+svg('sparkles','#B45309',18)+' Te ayudo a presentarte</h2><p>Contesta con un toque. Con eso y tu perfil te escribo tres versiones.</p>'
    + '<div class="field"><label>Lo que más te gusta de tu trabajo</label>'+ops('pia-g', ['Ver al paciente salir tranquilo','Explicar bien los tratamientos','Que todo esté organizado','Aprender técnicas nuevas','Trabajar en equipo'])+'</div>'
    + '<div class="field"><label>Qué buscas</label>'+ops('pia-b', ['Un equipo estable','Seguir formándome','Más responsabilidad','Buen horario','Una clínica cerca de casa'])+'</div>'
    + '<div class="field"><label for="pia-x">Algo más de ti <span class="opc">(opcional)</span></label><input class="inp" id="pia-x" maxlength="120" placeholder="Ej: hablo inglés, me encanta la ortodoncia…"></div>'
    + '<div class="err" id="pia-err"></div><div id="pia-res"></div>'
    + '<div class="acts"><button class="btn btn-s" onclick="cerrarModal()">Cancelar</button><button class="btn btn-p" id="pia-btn" onclick="generarPresentacion()">'+svg('sparkles','#fff',15)+'Escribir</button></div></div>';
  document.body.appendChild(m);
  m.addEventListener('click', function(ev){ var c = ev.target.closest && ev.target.closest('#pia-g .chip, #pia-b .chip'); if(!c) return; c.parentNode.querySelectorAll('.chip').forEach(function(x){ x.classList.toggle('on', x === c); }); });
}
function generarPresentacion(){
  var g = (document.querySelector('#pia-g .chip.on')||{}).dataset, b = (document.querySelector('#pia-b .chip.on')||{}).dataset;
  if(!g || !b) return error('pia-err', 'Elige una opción en cada pregunta.');
  error('pia-err', '');
  var prof = (val('al-prof') || 'profesional del sector dental').toLowerCase(), exp = val('al-exp'), x = val('pia-x').replace(/[.\s]+$/,'');
  var fu = chipsSel('al-pf').map(function(f){ return f.toLowerCase(); });
  var pf = fu.length ? (fu.length === 1 ? fu[0] : fu.slice(0,-1).join(', ') + ' y ' + fu[fu.length-1]) : '';
  var anos = /Sin experiencia/.test(exp) ? 'Acabo de terminar mis prácticas' : (/Menos de 1/.test(exp) ? 'Llevo menos de un año trabajando' : (exp ? 'Llevo ' + exp.replace(/^De /,'de ').replace(/^Más de/,'más de').toLowerCase() + ' trabajando' : 'Trabajo'));
  var gusta = g.v.charAt(0).toLowerCase() + g.v.slice(1), busca = b.v.charAt(0).toLowerCase() + b.v.slice(1);
  var v = [
    'Soy ' + prof + '. ' + anos + ' y lo que más me gusta es ' + gusta + '.' + (pf ? ' Destaco por ' + pf + '.' : '') + ' Busco ' + busca + '.' + (x ? ' ' + x.charAt(0).toUpperCase() + x.slice(1) + '.' : ''),
    'Me gusta ' + gusta + ', y eso se nota en mi día a día como ' + prof + '.' + (pf ? ' Mis compañeros dirían que lo mío es ' + pf + '.' : '') + ' Ahora busco ' + busca + '.' + (x ? ' ' + x.charAt(0).toUpperCase() + x.slice(1) + '.' : ''),
    anos + ' como ' + prof + '.' + (pf ? ' Aporto ' + pf + '.' : '') + ' Disfruto cuando consigo ' + gusta + '. Busco ' + busca + (x ? '. ' + x.charAt(0).toUpperCase() + x.slice(1) : '') + '.'
  ].map(function(t){ return t.replace(/\.\./g,'.').slice(0, 400); });
  $('pia-res').innerHTML = '<div class="pia-l">'+v.map(function(t, i){ return '<button type="button" class="pia-v" onclick="usarPresentacion('+i+')"><span class="pia-n">Versión '+(i+1)+'</span>'+esc(t)+'</button>'; }).join('')+'</div><p class="hint">Elige una. Luego puedes cambiar lo que quieras.</p>';
  PIA.v = v; $('pia-btn').textContent = 'Escribir otras';
}
function usarPresentacion(i){ var t = PIA.v[i]; $('al-res').value = t; $('al-res-n').textContent = t.length; cerrarModal(); toast('Listo. Puedes retocarlo.'); try{ $('al-res').focus(); }catch(e){} }

function altaGuardar(){
  error('al-err2','');
  if(!chipsSel('al-jor').length) return error('al-err2', 'Elige qué jornada buscas.');
  if(!chipsSel('al-disp').length) return error('al-err2', 'Dinos cuándo puedes empezar.');
  var kmN = parseInt($('al-rad-n').value, 10);
  if(!chipsSel('al-rad').length && !(kmN > 0)) return error('al-err2', 'Dinos hasta dónde te desplazas: elige una opción o escribe los km.');
  if(!chipsSel('al-rad').length && kmN > 1000) return error('al-err2', 'Escribe una distancia de hasta 1.000 km, o elige «Me mudaría».');
  if(_exps.filter(function(t){ return (t.puesto||'').trim() || (t.centro||'').trim(); }).length === 0 && !$('al-sin-exp').checked)
    return error('al-err2', val('al-exp').indexOf('Sin experiencia') === 0 ? 'Añade tus prácticas o marca que todavía no has trabajado en una clínica.' : 'Has dicho que tienes experiencia: añade al menos un sitio donde hayas trabajado.');
  if(!unaVez('altaG')) return;
  var p = Object.assign({}, S.perfil || {});
  p.nombre = val('al-nom'); p.profesion = val('al-prof'); p.experiencia = val('al-exp');
  var gl = geoCiudad(); p.ciudad = gl ? gl.n : val('al-ciu'); p.geo = CGeo.geo(gl);
  var rd = chipsSel('al-rad')[0] || String(kmN); p.radio = /^\d+$/.test(rd) ? +rd : rd;
  p.telefono = val('al-tel'); p.titulacion = val('al-tit');
  p.jornada = chipsSel('al-jor')[0]; p.disponibilidad = chipsSel('al-disp')[0];
  p.fuertes = chipsSel('al-pf'); p.resumen = val('al-res');
  p.trabajos = _exps.filter(function(t){ return (t.puesto||'').trim() || (t.centro||'').trim(); })
                    .map(function(t){ return {puesto:t.puesto.trim(), centro:t.centro.trim(), tiempo:(t.tiempo||'').trim()}; });
  p.sinExperiencia = !p.trabajos.length && $('al-sin-exp').checked;
  p.email = p.email || Nube.email || '';
  if(!p.ref){ try{ var rf = sessionStorage.getItem('cerco_ref'); if(rf && rf !== String(Nube.uid).slice(0,12)) p.ref = rf; }catch(e){} }
  bloquear('al-btn2', 'Guardando…');
  Nube.guardarPerfil(p).then(function(){
    if(!p.alta) p.alta = new Date().toISOString();
    S.perfil = p; S.zona = null; pintarUsuario();
    if(_editant){ toast('Perfil actualizado'); ir('perfil'); }
    else if(!p.disc) abrirTest(false);
    else ir('inicio');
  }).catch(function(){
    error('al-err2', 'No hemos podido guardar. Revisa tu conexión y vuelve a pulsar.');
  }).then(function(){ bloquear('al-btn2'); });
}
function editarPerfil(){ abrirAlta(true); }
// el sitio que ha elegido (o que ha escrito exacto)
function geoCiudad(){
  var i = $('al-ciu'); if(!i) return null;
  if(i.dataset.lat) return { n:i.value, lat:+i.dataset.lat, lng:+i.dataset.lng, p:i.dataset.prov };
  var h = CGeo.buscar(i.value, 2); var k = CGeo.norm(i.value);
  return h.length && (h[0].k === k || h.length === 1 && k.length > 3) ? h[0] : null;
}

/* ================================================================
   TEST
   ================================================================ */
var T = { i:0, resp:[], repetir:false, res:null };
/* Repetir el test: la primera vez cuando quieras (por si te equivocaste);
   después, cada 30 días como mínimo. Así el resultado refleja cómo trabajas
   y no lo que pide cada oferta. Todas las veces quedan registradas. */
var DISC_ESPERA_DIAS = 30;
function discRepetible(p){
  p = p || S.perfil || {}; var d = p.disc;
  if(!d || (p.discVeces || 1) < 2) return {ok:true};
  var t = new Date(d.fecha).getTime() + DISC_ESPERA_DIAS * 86400000;
  return {ok: !t || Date.now() >= t, fecha: new Date(t)};
}
function abrirTest(repetir){
  if(repetir){ var rp = discRepetible(); if(!rp.ok){ toast('Podrás repetir el test a partir del ' + fechaCorta(rp.fecha) + '.'); return; } }
  T.repetir = !!repetir; T.i = 0; T.res = null;
  T.resp = PREG.map(function(){ return {}; });
  $('t-intro').style.display = ''; $('t-preg').style.display = 'none'; $('t-res').style.display = 'none';
  $('t-steps').style.display = repetir ? 'none' : '';
  $('t-paso').style.display = repetir ? 'none' : '';
  $('t-luego').textContent = repetir ? 'Cancelar' : 'Lo haré más tarde';
  if($('t-rep-aviso')) $('t-rep-aviso').hidden = !repetir;
  botonSalirOb('t-salir', repetir || !!(S.perfil && S.perfil.disc));
  ir('test', null, true);
}
function testLuego(){
  if(T.repetir){ ir('perfil'); return; }
  ir('inicio');
  toast('Sin el test no podrás enviar solicitudes. Hazlo cuando quieras.');
}
/* Empezar el test: antes, la casilla de consentimiento (Fase 1: una sola versión) */
function testEmpezar(){
  var c = $('t-consent');
  if(c && !c.checked && !((S.perfil||{}).consentTest)){ error('t-cons-err', 'Marca la casilla para hacer el test. Si prefieres no hacerlo ahora, puedes seguir viendo las ofertas.'); try{ c.focus(); }catch(e){} return; }
  error('t-cons-err', '');
  if(S.perfil && !S.perfil.consentTest) S.perfil.consentTest = new Date().toISOString();
  $('t-intro').style.display = 'none'; $('t-preg').style.display = ''; pintarPregunta(); window.scrollTo(0,0);
}
function pintarPregunta(){
  var r = T.resp[T.i], h = '';
  if(!T.ord || T.ord.length !== PREG.length) T.ord = CERCO_discBarajar(PREG.length);
  T.ord[T.i].forEach(function(k){
    var txt = PREG[T.i][k];
    h += '<div class="opt" data-k="'+k+'"><div class="opt-t">'+esc(txt)+'</div><div class="opt-n"><small>Menos</small>';
    for(var n=1;n<=4;n++) h += '<button type="button" class="'+(r[k]===n?'on':'')+'" onclick="puntuar('+k+','+n+')" aria-label="'+n+'">'+n+'</button>';
    h += '<small>Más</small></div></div>';
  });
  $('t-ops').innerHTML = h;
  $('t-lbl').textContent = 'Pregunta ' + (T.i+1) + ' de ' + PREG.length;
  var pct = Math.round((T.i+1)/PREG.length*100);
  $('t-pct').textContent = pct + '%'; $('t-bar').style.width = pct + '%';
  $('t-next').textContent = T.i === PREG.length-1 ? 'Ver resultado' : 'Continuar';
  error('t-err', '');
}

/* El cálculo del test DISC está en src/comun/disc.js (compartido por los dos lados). */
var CERCO_DISC_PLANA = 'Has puesto la misma nota a las cuatro, así que esta pregunta no contará. Si alguna te describe un poco más, súbele la nota.';
var CERCO_DISC_FLOJO = 'Tu resultado sale poco definido: has dado notas muy parecidas a casi todo. Si quieres, vuelve atrás y marca más la diferencia entre lo que es muy tú y lo que no.';

/* Se puede repetir número: solo guardamos la nota y avisamos si las cuatro son iguales. */
function puntuar(k, n){
  var r = T.resp[T.i];
  r[k] = n;
  $('t-ops').querySelectorAll('.opt').forEach(function(op){
    var i = +op.dataset.k;
    op.querySelectorAll('button').forEach(function(b, j){ b.classList.toggle('on', r[i] === j+1); b.setAttribute('aria-pressed', r[i] === j+1); });
  });
  var igual = Object.keys(r).length === 4 && r[0] === r[1] && r[1] === r[2] && r[2] === r[3];
  error('t-err', igual ? CERCO_DISC_PLANA : '');
}
function testPlanas(){ var l = []; T.resp.forEach(function(r, i){ if(Object.keys(r).length === 4 && r[0] === r[1] && r[1] === r[2] && r[2] === r[3]) l.push(i); }); return l; }
function testRepasar(){
  var pl = testPlanas(); T.solo = pl.length ? pl : null; T.i = pl.length ? pl[0] : 0;
  $('t-res').style.display = 'none'; $('t-preg').style.display = ''; pintarPregunta(); window.scrollTo(0,0);
}
/* Notas casi iguales en todo: no inventamos un perfil y no se guarda nada. */
function testSinPerfil(){
  var n = testPlanas().length;
  $('tr-big').style.background = '#6B7280'; $('tr-big').textContent = '?';
  $('tr-nom').textContent = 'Perfil sin definir';
  // Solo la frase «Perfil sin definir» y la opción de repasar (sin párrafos de explicación)
  $('tr-desc').textContent = ''; $('tr-desc').style.display = 'none';
  $('tr-h').style.display = 'none';
  $('tr-bars').innerHTML = '<button type="button" class="btn btn-p btn-block" onclick="testRepasar()">'+(n ? 'Repasar '+n+' pregunta'+(n === 1 ? '' : 's')+(n <= 8 ? ' · 2 minutos' : '') : 'Repasar mis respuestas')+'</button>';
  $('tr-btn').textContent = 'Ahora no'; $('tr-btn').className = 'btn btn-block';
  error('tr-err', '');
  $('t-preg').style.display = 'none'; $('t-res').style.display = '';
  window.scrollTo(0,0);
}
function testSeguir(){
  if(Object.keys(T.resp[T.i]).length < 4) return error('t-err', 'Puntúa las 4 frases (del 1 al 4) antes de continuar.');
  if(T.solo){
    var sg = T.solo.filter(function(i){ return i > T.i; })[0];
    if(sg !== undefined){ T.i = sg; pintarPregunta(); window.scrollTo(0,0); return; }
    T.solo = null;
  } else if(T.i < PREG.length-1){ T.i++; pintarPregunta(); window.scrollTo(0,0); return; }
  T.res = calcularDisc(T.resp);
  if(T.res.definido === false) return testSinPerfil();
  var d = T.res;
  $('tr-big').style.background = COLOR[d.dom]; $('tr-big').textContent = d.dom;
  $('tr-nom').textContent = NOMBRE[d.dom] + ' con rasgo ' + NOMBRE[d.sec].toLowerCase();
  $('tr-desc').textContent = DESC[d.dom]; $('tr-desc').style.display = '';
  $('tr-bars').innerHTML = barras(d.norm); $('tr-h').textContent = 'Cómo te repartes'; $('tr-h').style.display = ''; $('tr-btn').className = 'btn btn-p btn-block';
  $('tr-btn').textContent = T.repetir ? 'Guardar resultado' : 'Ir a mi panel';
  error('tr-err', '');
  $('t-preg').style.display = 'none'; $('t-res').style.display = '';
  window.scrollTo(0,0);
}
function testAtras(){
  if(T.i > 0){ T.i--; pintarPregunta(); window.scrollTo(0,0); return; }
  $('t-preg').style.display = 'none'; $('t-intro').style.display = ''; window.scrollTo(0,0);
}
function testAcabar(){
  if(T.res && T.res.definido === false){ T.res = null; return testLuego(); }
  if(!T.res || !unaVez('testA')) return;
  var p = Object.assign({}, S.perfil || {}), antes = p.disc;
  p.disc = T.res;
  // cada repetición queda registrada: el resultado anterior pasa al historial
  if(antes && antes.dom){
    p.discHist = (p.discHist || []).concat([{ dom:antes.dom, sec:antes.sec, norm:antes.norm, fecha:antes.fecha || '' }]).slice(-20);
    p.discVeces = (p.discVeces || 1) + 1;
  } else if(!p.discVeces) p.discVeces = 1;
  bloquear('tr-btn', 'Guardando…');
  Nube.guardarPerfil(p).then(function(){
    S.perfil = p; pintarUsuario();
    if(antes && antes.dom) discASolicitudes(p);
    toast(T.repetir ? 'Resultado actualizado' : 'Perfil completo. Ya puedes solicitar ofertas.');
    ir(T.repetir ? 'perfil' : 'inicio');
  }).catch(function(){ error('tr-err', 'No hemos podido guardar el resultado. Revisa tu conexión y vuelve a pulsar.'); })
  .then(function(){ bloquear('tr-btn'); });
}

/* ================================================================
   DESCUBRIR · ofertas y vídeos de clínicas, una por pantalla (estilo TikTok)
   Una sola cosa a la vez, a pantalla completa. Se pasa a la siguiente
   deslizando hacia arriba. Las acciones van a la derecha, donde llega
   el pulgar; la información, abajo a la izquierda.
   ================================================================ */
var DX = { saltadas:{}, sonido:false, obs:null, i:0, n:0 };

function dxLista(){
  var libres = ofertasVisibles().filter(function(o){ return !o.ejemplo && !solDeOferta(o.id) && !DX.saltadas[o.id]; });
  var zc = ofertasCerca(libres);
  return ordenarOfertas(zc.dentro).concat(zc.fuera);
}
function dxFondo(o, cl){
  var v = cl && cl.video && cl.video.src;
  var foto = cl && (cl.fotos || [])[0];
  if(v) return '<video class="dx-media" src="'+esc(v)+'" muted loop playsinline preload="metadata"'+(foto ? ' poster="'+esc(foto)+'"' : '')+'></video>';
  if(foto) return '<img class="dx-media" src="'+esc(foto)+'" alt="">';
  var ps = perfilesDe(o), c1 = COLOR[ps[0]] || '#1A56DB', c2 = COLOR[ps[1]] || '#0F1C3F';
  var ini = String(o.clinica || 'C').replace(/^(clínica|centro|dental|clinica)\s+(dental\s+)?/i, '').trim().charAt(0).toUpperCase() || 'C';
  return '<div class="dx-media dx-sin" style="background:radial-gradient(circle at 30% 25%, '+c1+'55, transparent 55%), radial-gradient(circle at 75% 70%, '+c2+'55, transparent 55%), linear-gradient(160deg,#0B1220,#1A2A52);"><span>'+esc(ini)+'</span></div>';
}
function dxItem(o, i, n){
  var d = S.perfil && S.perfil.disc, cl = S.clinicas[o.clinicaId] || null, p = encaje(d, o), km = kmDe(o);
  var tieneVideo = !!(cl && cl.video && cl.video.src), guard = estaGuardada(o.id);
  var desc = (cl && (cl.dia || cl.pubDia)) || o.descripcion || '';
  var datos = [o.salario, km !== null ? (km < 1 ? 'En tu zona' : 'A ' + Math.round(km) + ' km') : '', o.jornada].filter(Boolean);
  var acc = !d
    ? '<button class="dx-a dx-a-p" onclick="abrirTest(false)" aria-label="Haz el test para poder solicitar">'+svg('compass','#fff',24)+'<span>Haz el test</span></button>'
    : '<button class="dx-a dx-a-p" onclick="modalSolicitar(\''+esc(o.id)+'\')" aria-label="Solicitar esta oferta">'+svg('send','#fff',24)+'<span>Solicitar</span></button>';
  return '<article class="dx-it" data-id="'+esc(o.id)+'" aria-label="'+esc(o.titulo + ' en ' + (o.clinica||'una clínica'))+'" aria-roledescription="oferta '+(i+1)+' de '+n+'">'
    + dxFondo(o, cl) + '<div class="dx-sombra"></div>'
    + (tieneVideo ? '<div class="dx-cap">'+svg('video','#fff',13)+'Vídeo de la clínica</div>' : '')
    + '<div class="dx-info">'
    +   (p !== null ? '<div class="dx-enc"><b>'+p+'%</b> encaje contigo</div>' : '')
    +   '<button class="dx-cl" onclick="ir(\'oferta\',\''+esc(o.id)+'\')">'+svg('building','#fff',15)+esc(o.clinica||'Clínica')+'</button>'
    +   '<h2>'+esc(o.titulo)+'</h2>'
    +   '<div class="dx-datos">'+datos.map(function(x){ return '<span>'+esc(x)+'</span>'; }).join('')+'</div>'
    +   (desc ? '<p class="dx-desc">'+esc(desc)+'</p>' : '')
    +   '<button class="dx-mas" onclick="ir(\'oferta\',\''+esc(o.id)+'\')">Ver la oferta completa '+svg('right','#fff',14)+'</button>'
    + '</div>'
    + '<div class="dx-acts">'
    +   acc
    +   '<button class="dx-a'+(guard ? ' on' : '')+'" onclick="dxGuardar(\''+esc(o.id)+'\', this)" aria-pressed="'+guard+'" aria-label="'+(guard ? 'Quitar de guardadas' : 'Guardar oferta')+'">'+svg('bookmark', guard ? '#F0A800' : '#fff', 24)+'<span>'+(guard ? 'Guardada' : 'Guardar')+'</span></button>'
    +   (tieneVideo ? '<button class="dx-a dx-son" onclick="dxSonido()" aria-pressed="'+DX.sonido+'" aria-label="'+(DX.sonido ? 'Quitar el sonido' : 'Poner el sonido')+'">'+svg(DX.sonido ? 'volume' : 'mute', '#fff', 24)+'<span>'+(DX.sonido ? 'Sonido' : 'Silencio')+'</span></button>' : '')
    +   '<button class="dx-a" onclick="dxSaltar(\''+esc(o.id)+'\')" aria-label="No me interesa, ver la siguiente">'+svg('x','#fff',24)+'<span>No me interesa</span></button>'
    + '</div>'
    + '</article>';
}
function pintarDescubrir(){
  var box = $('dx'); if(!box) return;
  if(!S.ofertasCargadas){ box.innerHTML = '<div class="dx-fin"><div class="spin"></div></div>'; return; }
  var l = dxLista(); DX.n = l.length;
  var fin = '<article class="dx-it dx-fin"><div>'+svg('check','#fff',34)
    + '<h2>'+(l.length ? 'Has visto todas las ofertas para ti' : 'Ahora mismo no hay ofertas nuevas para ti')+'</h2>'
    + '<p>Te avisamos cuando una clínica publique una oferta de tu profesión dentro de tu distancia.</p>'
    + '<div class="dx-fin-a"><button class="btn btn-p" onclick="ir(\'ofertas\')">Ver todas en lista</button>'
    + (Object.keys(DX.saltadas).length ? '<button class="btn btn-s" onclick="DX.saltadas = {}; pintarDescubrir();">Volver a ver las que pasé</button>' : '')
    + '</div></div></article>';
  box.innerHTML = l.map(function(o, i){ return dxItem(o, i, l.length); }).join('') + fin;
  box.scrollTop = 0;
  dxObservar();
  dxPista();
}
function dxObservar(){
  try{ if(DX.obs) DX.obs.disconnect(); }catch(e){}
  if(!('IntersectionObserver' in window)) return;
  DX.obs = new IntersectionObserver(function(es){
    es.forEach(function(e){
      var v = e.target.querySelector('video');
      if(e.isIntersecting && e.intersectionRatio > .6){
        DX.i = [].indexOf.call(e.target.parentNode.children, e.target);
        if(v){ v.muted = !DX.sonido; var pr = v.play(); if(pr && pr.catch) pr.catch(function(){}); }
      } else if(v){ try{ v.pause(); }catch(x){} }
    });
  }, { root: $('dx'), threshold: [0, .6, 1] });
  document.querySelectorAll('#dx .dx-it').forEach(function(it){ DX.obs.observe(it); });
}
function dxIrA(i){ var box = $('dx'), it = box && box.children[i]; if(it) box.scrollTo({top: it.offsetTop, behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth'}); }
function dxSaltar(id){ DX.saltadas[id] = 1; var i = DX.i; var it = document.querySelector('#dx .dx-it[data-id="'+id+'"]'); if(it){ it.classList.add('fuera'); setTimeout(function(){ pintarDescubrir(); dxIrA(Math.min(i, DX.n)); }, 220); } }
function dxGuardar(id, b){
  alternarGuardada(id);
  var on = !b.classList.contains('on'); b.classList.toggle('on', on); b.setAttribute('aria-pressed', on);
  b.innerHTML = svg('bookmark', on ? '#F0A800' : '#fff', 24) + '<span>'+(on ? 'Guardada' : 'Guardar')+'</span>';
}
function dxSonido(){
  DX.sonido = !DX.sonido;
  document.querySelectorAll('#dx video').forEach(function(v){ v.muted = !DX.sonido; });
  document.querySelectorAll('#dx .dx-son').forEach(function(b){ b.setAttribute('aria-pressed', DX.sonido); b.innerHTML = svg(DX.sonido ? 'volume' : 'mute', '#fff', 24) + '<span>'+(DX.sonido ? 'Sonido' : 'Silencio')+'</span>'; });
}
function dxPista(){
  var visto = false; try{ visto = localStorage.getItem('cerco_dx_pista') === '1'; }catch(e){}
  if(visto || DX.n < 2) return;
  var p = document.createElement('div'); p.className = 'dx-pista'; var tactil = matchMedia('(pointer:coarse)').matches;
  p.innerHTML = svg('up','#fff',22)+'<span>'+(tactil ? 'Desliza hacia arriba para ver la siguiente' : 'Baja con la rueda o las flechas ↑ ↓ para ver la siguiente')+'</span>';
  document.querySelector('#v-descubrir .dx-marco').appendChild(p);
  var quitar = function(){ p.remove(); try{ localStorage.setItem('cerco_dx_pista','1'); }catch(e){} };
  setTimeout(quitar, 4500); $('dx').addEventListener('scroll', quitar, {once:true});
}
document.addEventListener('keydown', function(e){
  if(S.vista !== 'descubrir' || /INPUT|TEXTAREA|SELECT/.test((e.target||{}).tagName||'') || $('modal')) return;
  if(e.key === 'ArrowDown' || e.key === 'PageDown'){ e.preventDefault(); dxIrA(DX.i + 1); }
  if(e.key === 'ArrowUp' || e.key === 'PageUp'){ e.preventDefault(); dxIrA(Math.max(0, DX.i - 1)); }
});

/* Historial del test: solo letras, porcentajes y fecha */
function histDiscLimpio(h){
  return (Array.isArray(h) ? h : []).slice(-20).filter(function(x){ return x && LETRAS.indexOf(x.dom) > -1; }).map(function(x){
    var n = {}; LETRAS.forEach(function(l){ n[l] = Math.max(0, Math.min(100, Math.round(+((x.norm||{})[l]) || 0))); });
    return { dom:x.dom, sec:LETRAS.indexOf(x.sec) > -1 ? x.sec : '', norm:n, fecha:String(x.fecha||'').slice(0,30) };
  });
}
/* Resultados anteriores, del más reciente al más antiguo */
function histDiscHtml(p){
  var h = (p.discHist || []).slice().reverse(); if(!h.length) return '';
  return '<details class="disc-hist"><summary>Tus resultados anteriores ('+h.length+')</summary>'
    + h.map(function(x){ return '<div class="disc-hist-i"><span class="disc-dot" style="background:'+COLOR[x.dom]+'">'+x.dom+'</span><span><b>'+NOMBRE[x.dom]+(x.sec ? ' con rasgo '+NOMBRE[x.sec].toLowerCase() : '')+'</b><small>'+esc(x.fecha ? fechaCorta(x.fecha.slice(0,10)) : 'Sin fecha')+'</small></span></div>'; }).join('')
    + '<p>Las clínicas a las que has enviado una solicitud ven estos cambios.</p></details>';
}
/* Al repetir el test, las clínicas a las que has escrito ven el cambio en tu solicitud */
function discASolicitudes(p){
  var ahora = new Date().toISOString();
  (S.sols || []).filter(function(s){ return s.estado !== 'retirada'; }).forEach(function(s){
    var c = { disc:p.disc, discHist:histDiscLimpio(p.discHist), discVeces:p.discVeces || 1, discCambio:ahora };
    var e = encaje(p.disc, s); if(e !== null) c.encaje = e;
    Nube.db().collection('candidaturas').doc(s.id).update(c).then(function(){ Object.assign(s, c); }).catch(function(){});
  });
}

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

/* ================================================================
   TU PRESENTACIÓN: foto, vídeo y CV completo
   Lo que la clínica ve primero. Los archivos se guardan en trozos
   dentro de la base de datos (candidatos/{uid}/media) y solo los
   pueden leer las clínicas a las que has enviado algo.
   ================================================================ */
var TROZO = 400000;          // caracteres por trozo, por debajo del límite de 1 MB por documento
var VIDEO_MAX_S = 60, VIDEO_MIN_S = 15, VIDEO_MAX_MB = 15, CV_MAX_MB = 3;

Nube.subirMedia = function(tipo, dataUrl, avance){
  var coma = dataUrl.indexOf(','), mime = dataUrl.slice(5, dataUrl.indexOf(';'));
  var b64 = dataUrl.slice(coma + 1), n = Math.ceil(b64.length / TROZO);
  var col = this.db().collection('candidatos').doc(this.uid).collection('media');
  var i = 0, avisado = false;
  function conTiempo(p, ms){ return new Promise(function(ok, ko){ var t = setTimeout(function(){ ko('tiempo'); }, ms); p.then(function(x){ clearTimeout(t); ok(x); }, function(e){ clearTimeout(t); ko(e); }); }); }
  var sig = function(){
    if(i >= n) return Promise.resolve();
    var k = i, intento = 0;
    if(avance) avance(k + 1, n);
    var una = function(){
      return conTiempo(col.doc(tipo + '_' + k).set({ d: b64.slice(k*TROZO, (k+1)*TROZO), i: k, n: n }), 40000).catch(function(e){
        if(++intento >= 4) throw e;
        if(!avisado){ avisado = true; try{ toast('La conexión va lenta. Seguimos subiendo, no cierres la página.'); }catch(x){} }
        return new Promise(function(r){ setTimeout(r, 1500 * intento); }).then(una);
      });
    };
    return una().then(function(){ i++; return sig(); });
  };
  return sig().then(function(){ return { n:n, mime:mime, size:Math.round(b64.length * 0.75), v:Date.now() }; });
};
Nube.leerMedia = function(uid, tipo, meta){
  var col = this.db().collection('candidatos').doc(uid).collection('media'), ps = [];
  for(var k=0;k<meta.n;k++) ps.push(col.doc(tipo + '_' + k).get());
  return Promise.all(ps).then(function(docs){
    var b64 = docs.map(function(d){ if(!d.exists) throw 'falta'; return d.data().d; }).join('');
    var bin = atob(b64), arr = new Uint8Array(bin.length);
    for(var j=0;j<bin.length;j++) arr[j] = bin.charCodeAt(j);
    return new Blob([arr], {type: meta.mime});
  });
};
function aDataUrl(blob){
  return new Promise(function(res, rej){ var fr = new FileReader(); fr.onload = function(){ res(fr.result); }; fr.onerror = rej; fr.readAsDataURL(blob); });
}
function mb(bytes){ bytes = +bytes || 0; if(bytes < 1048576) return Math.max(1, Math.round(bytes/1024)) + ' KB'; return (bytes/1048576).toFixed(bytes > 1048576*10 ? 0 : 1).replace('.', ',') + ' MB'; }
function mmss(s){ s = Math.round(s||0); return Math.floor(s/60) + ':' + String(s%60).padStart(2,'0'); }
function guardarYRepintar(p, msgOk){
  var antes = S.perfil || {};
  return Nube.guardarPerfil(p).then(function(){ S.perfil = p; pintarUsuario(); if(S.vista === 'perfil') pintarPerfil(); if(msgOk) toast(msgOk); mediaASolicitudes(antes, p); });
}
/* La solicitud guarda una copia de tu vídeo, CV y foto: si los cambias, se actualiza en las que siguen abiertas */
function mediaASolicitudes(a, p){
  var c = {}, k = function(x){ return JSON.stringify(x || null); };
  if(k(a.video) !== k(p.video)) c.video = p.video || null;
  if(k(a.cv) !== k(p.cv)) c.cv = p.cv || null;
  if((a.foto || '') !== (p.foto || '')) c.foto = p.foto || '';
  if(!Object.keys(c).length) return;
  (S.sols || []).filter(function(s){ return ['enviada','vista','entrevista','contratada'].indexOf(s.estado) > -1; }).forEach(function(s){
    Nube.db().collection('candidaturas').doc(s.id).update(c).then(function(){ Object.assign(s, c); }).catch(function(){});
  });
}


/* ---------- perfil: cabecera ---------- */
function pfIr(id){ var el = $(id); if(el){ var y = el.getBoundingClientRect().top + window.scrollY - 70; window.scrollTo({top:y, behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth'}); } return false; }
function pintarCabPerfil(p){
  var acc = $('pf-foto-acc');
  if(acc) acc.innerHTML = '<label class="btn btn-s pf-fb">'+svg('camera','currentColor',15)+(p.foto ? 'Cambiar foto' : 'Poner foto')+'<input type="file" accept="image/*" onchange="elegirFoto(this)" class="sr"></label>'
    + (p.foto ? '<button class="btn btn-g pf-fb" style="color:#B42318;" onclick="quitarFoto()">Quitar</button>' : '<span class="pf-fh">La clínica la ve junto a tu nombre</span>');
  var it = [
    {ok:!!p.foto, t:'Foto', a:"document.querySelector('.pf-foto input').click()"},
    {ok:!!p.video, t:'Vídeo', a:"pfIr('pf-media')"},
    {ok:!!p.cv, t:'CV en PDF', a:"pfIr('pf-media')"},
    {ok:!!p.disc, t:'Test', a:"abrirTest(false)"},
    {ok:!!p.resumen, t:'Presentación', a:"editarPerfil()"},
    {ok:!!(p.fuertes||[]).length, t:'Puntos fuertes', a:"editarPerfil()"},
    {ok:!!p.telefono, t:'Teléfono', a:"editarPerfil()"}
  ];
  var n = it.filter(function(x){ return x.ok; }).length, pct = Math.round(n / it.length * 100);
  var falta = it.filter(function(x){ return !x.ok; });
  $('pf-comp').innerHTML = '<div class="pf-comp"><div class="pf-comp-t"><b>'+(pct === 100 ? 'Tu perfil está completo' : 'Tu perfil está al '+pct+' %')+'</b><span>'+n+' de '+it.length+'</span></div>'
    + '<div class="meter"><div style="width:'+pct+'%"></div></div>'
    + (falta.length ? '<div class="pf-falta"><span>Te falta:</span>'+falta.map(function(x){ return '<button onclick="'+x.a+'">'+svg('plus','currentColor',13)+x.t+'</button>'; }).join('')+'</div>'
      : '<div class="pf-fh" style="margin-top:6px;">Las clínicas ven todo lo que necesitan para decidir.</div>')
    + '</div>';
}

/* ---------- foto: encuadre antes de guardar ---------- */
var FT = { img:null, z:1, x:0, y:0, arr:null };
function elegirFoto(inp){
  var f = inp.files && inp.files[0]; inp.value = '';
  if(!f) return;
  if(!/^image\//.test(f.type)) return toast('Elige una imagen (JPG o PNG).');
  if(f.size > 15*1048576) return toast('La imagen pesa demasiado. Elige una de menos de 15 MB.');
  var fr = new FileReader();
  fr.onload = function(){
    var img = new Image();
    img.onload = function(){ FT.img = img; FT.z = 1; FT.x = 0; FT.y = 0; abrirEncuadre(); };
    img.onerror = function(){ toast('No hemos podido leer esa imagen.'); };
    img.src = fr.result;
  };
  fr.readAsDataURL(f);
}
function abrirEncuadre(){
  cerrarModal();
  var m = document.createElement('div'); m.className = 'modal-bg'; m.id = 'modal';
  m.onclick = function(e){ if(e.target === m) cerrarModal(); };
  m.innerHTML = '<div class="modal" role="dialog" aria-modal="true" aria-labelledby="ft-t"><h2 id="ft-t">Tu foto de perfil</h2>'
    + '<p>Arrastra la foto para centrar tu cara y usa la barra para acercarla.</p>'
    + '<div class="ft-marco"><canvas id="ft-cv" width="560" height="560" aria-label="Vista previa de la foto"></canvas></div>'
    + '<div class="ft-zoom">'+svg('minus','#6B7280',16)+'<input type="range" id="ft-z" min="1" max="3" step="0.01" value="1" aria-label="Acercar" oninput="FT.z=+this.value; ftPintar();">'+svg('plus','#6B7280',16)+'</div>'
    + '<div class="ft-ej"><span>Así la verá la clínica:</span><canvas id="ft-mini" width="88" height="88"></canvas><canvas id="ft-mini2" width="68" height="68"></canvas></div>'
    + '<div class="acts" style="margin-top:14px;"><button class="btn btn-p" id="ft-ok" onclick="guardarEncuadre()">Guardar foto</button>'
    + '<label class="btn btn-s">Elegir otra<input type="file" accept="image/*" onchange="elegirFoto(this)" class="sr"></label>'
    + '<button class="btn btn-g" onclick="cerrarModal()">Cancelar</button></div></div>';
  document.body.appendChild(m);
  var cv = $('ft-cv'), ini = null;
  cv.addEventListener('pointerdown', function(e){ ini = {x:e.clientX, y:e.clientY, fx:FT.x, fy:FT.y}; cv.setPointerCapture(e.pointerId); });
  cv.addEventListener('pointermove', function(e){ if(!ini) return; var k = cv.width / cv.getBoundingClientRect().width; FT.x = ini.fx + (e.clientX - ini.x) * k; FT.y = ini.fy + (e.clientY - ini.y) * k; ftPintar(); });
  cv.addEventListener('pointerup', function(){ ini = null; }); cv.addEventListener('pointercancel', function(){ ini = null; });
  cv.addEventListener('wheel', function(e){ e.preventDefault(); FT.z = Math.min(3, Math.max(1, FT.z - e.deltaY * 0.002)); $('ft-z').value = FT.z; ftPintar(); }, {passive:false});
  cv.tabIndex = 0;
  cv.addEventListener('keydown', function(e){ var d = 12, m2 = {ArrowLeft:[d,0], ArrowRight:[-d,0], ArrowUp:[0,d], ArrowDown:[0,-d]}[e.key]; if(m2){ e.preventDefault(); FT.x += m2[0]; FT.y += m2[1]; ftPintar(); } });
  ftPintar();
}
// dibuja la imagen cubriendo el cuadrado y sin dejar huecos al moverla
function ftDibujar(ctx, L){
  var img = FT.img, base = Math.max(L / img.width, L / img.height) * FT.z, w = img.width * base, h = img.height * base;
  var k = L / 560, mx = (w - L) / 2, my = (h - L) / 2;
  FT.x = Math.max(-mx / k, Math.min(mx / k, FT.x)); FT.y = Math.max(-my / k, Math.min(my / k, FT.y));
  ctx.fillStyle = '#fff'; ctx.fillRect(0, 0, L, L);
  ctx.drawImage(img, (L - w) / 2 + FT.x * k, (L - h) / 2 + FT.y * k, w, h);
}
function ftPintar(){
  var cv = $('ft-cv'); if(!cv || !FT.img) return;
  ftDibujar(cv.getContext('2d'), 560);
  ['ft-mini','ft-mini2'].forEach(function(id){ var c = $(id); if(c){ var x = c.getContext('2d'); x.clearRect(0,0,c.width,c.height); x.save(); x.beginPath(); x.arc(c.width/2, c.height/2, c.width/2, 0, Math.PI*2); x.clip(); x.drawImage(cv, 0, 0, c.width, c.height); x.restore(); } });
}
function guardarEncuadre(){
  if(!FT.img || !unaVez('foto', 800)) return;
  var out = document.createElement('canvas'); out.width = out.height = 360;
  ftDibujar(out.getContext('2d'), 360);
  var p = Object.assign({}, S.perfil); p.foto = out.toDataURL('image/jpeg', 0.85);
  var b = $('ft-ok'); if(b){ b.disabled = true; b.textContent = 'Guardando…'; }
  guardarYRepintar(p, 'Foto guardada').then(function(){ cerrarModal(); FT.img = null; })
    .catch(function(){ if(b){ b.disabled = false; b.textContent = 'Guardar foto'; } toast('No hemos podido guardar la foto. Revisa tu conexión.'); });
}
function quitarFoto(){ if(!confirm('¿Quitar tu foto de perfil? La clínica verá tus iniciales.')) return; var p = Object.assign({}, S.perfil); p.foto = ''; guardarYRepintar(p, 'Foto quitada'); }

/* ---------- vídeo ---------- */
var GV = { stream:null, rec:null, trozos:[], t0:0, reloj:null, blob:null, dur:0 };
function tipoGrabacion(){
  var ops = ['video/webm;codecs=vp8,opus','video/webm','video/mp4'];
  for(var i=0;i<ops.length;i++){ try{ if(window.MediaRecorder && MediaRecorder.isTypeSupported(ops[i])) return ops[i]; }catch(e){} }
  return '';
}
function abrirGrabadora(){
  cerrarModal();
  var m = document.createElement('div');
  m.className = 'modal-bg'; m.id = 'modal';
  m.innerHTML = '<div class="modal gv" role="dialog" aria-modal="true" aria-label="Vídeo de presentación">'
    + '<h2>Tu vídeo de presentación</h2>'
    + '<p>Entre 15 segundos y 1 minuto. Preséntate: quién eres, tu experiencia y qué tipo de clínica buscas. Mejor con el móvil en vertical, buena luz y sin ruido de fondo.</p>'
    + '<div class="gv-pant"><video id="gv-v" playsinline muted autoplay></video><div class="gv-reloj" id="gv-reloj" hidden>0:00 / 0:30</div>'
    + '<div class="gv-vacio" id="gv-vacio">'+svg('video','#fff',30)+'<span>Pulsa "Encender cámara"</span></div></div>'
    + '<div class="err" id="gv-err" style="margin-top:10px;"></div>'
    + '<div class="gv-acts" id="gv-acts"></div>'
    + '<div class="gv-sub" id="gv-sub"><span>o</span><label class="btn btn-s gv-subir">'+svg('upload','currentColor',16)+'Subir un vídeo de mis archivos<input type="file" accept="video/*" class="sr" onchange="subirVideoArchivo(this)"></label><small>Del móvil o del ordenador. Si dura más de 30 segundos, eliges el trozo.</small></div>'
    + '</div>';
  document.body.appendChild(m);
  gvBotones('inicio');
}
function gvBotones(fase){
  var a = $('gv-acts'); if(!a) return;
  var cancelar = '<button class="btn btn-s" onclick="cerrarGrabadora()">Cancelar</button>';
  if(fase === 'inicio') a.innerHTML = cancelar + '<button class="btn btn-p" onclick="encenderCamara()">'+svg('video','#fff',16)+'Encender cámara</button>';
  if(fase === 'lista') a.innerHTML = cancelar + '<button class="btn btn-p gv-rec" onclick="empezarGrabar()"><span class="gv-punto"></span>Grabar</button>';
  if(fase === 'grabando') a.innerHTML = '<button class="btn btn-d btn-block" onclick="pararGrabar()">Parar</button>';
  if(fase === 'corto') a.innerHTML = cancelar + '<button class="btn btn-p" onclick="repetirGrabar()">Grabar otra vez</button>';
  if(fase === 'hecho') a.innerHTML = '<button class="btn btn-s" onclick="repetirGrabar()">Repetir</button><button class="btn btn-p" id="gv-usar" onclick="usarVideo()">Usar este vídeo</button>';
}
function encenderCamara(){
  error('gv-err', '');
  if(!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia || !tipoGrabacion())
    return error('gv-err', esIOS() && !hayAudioWeb()
      ? 'Con el Modo de aislamiento activado, el iPhone no deja a las webs usar la cámara. Graba el vídeo con la cámara del móvil y súbelo con el botón de abajo, o desactiva el Modo de aislamiento para CERCO (toca «aA» → Ajustes del sitio web).'
      : 'Este navegador no deja grabar aquí. Graba el vídeo con la cámara del móvil y súbelo con el botón de abajo.');
  navigator.mediaDevices.getUserMedia({ video:{ width:{ideal:640}, height:{ideal:480}, facingMode:'user' }, audio:true }).then(function(st){
    GV.stream = st;
    var v = $('gv-v'); v.srcObject = st; v.muted = true; v.controls = false;
    $('gv-vacio').hidden = true;
    gvBotones('lista');
  }).catch(function(){
    error('gv-err', 'No tenemos permiso para usar la cámara. Actívalo en tu navegador o sube un vídeo grabado con el móvil.');
  });
}
function empezarGrabar(){
  GV.trozos = [];
  try{ GV.rec = new MediaRecorder(GV.stream, { mimeType: tipoGrabacion(), videoBitsPerSecond: 350000, audioBitsPerSecond: 48000 }); }
  catch(e){ return error('gv-err', 'No se ha podido empezar a grabar. Sube un vídeo del móvil.'); }
  GV.rec.ondataavailable = function(e){ if(e.data && e.data.size) GV.trozos.push(e.data); };
  GV.rec.onstop = function(){
    GV.dur = (Date.now() - GV.t0) / 1000;
    GV.blob = new Blob(GV.trozos, { type: (GV.rec.mimeType || 'video/webm').split(';')[0] });
    apagarCamara();
    var v = $('gv-v'); if(!v) return;
    v.srcObject = null; v.src = URL.createObjectURL(GV.blob); v.muted = false; v.controls = true; v.autoplay = false;
    $('gv-reloj').hidden = true;
    GV.ini = 0; GV.fin = 0;
    if(GV.dur < VIDEO_MIN_S){ gvBotones('corto'); return error('gv-err', 'Ha durado ' + Math.round(GV.dur) + ' segundos. Graba entre ' + VIDEO_MIN_S + ' y ' + VIDEO_MAX_S + ': las clínicas necesitan un poco más para conocerte.'); }
    gvBotones('hecho');
  };
  GV.rec.start(1000); GV.t0 = Date.now();
  var r = $('gv-reloj'); r.hidden = false;
  clearInterval(GV.reloj);
  GV.reloj = setInterval(function(){
    var s = (Date.now() - GV.t0) / 1000;
    if(r) r.textContent = mmss(s) + ' / ' + mmss(VIDEO_MAX_S);
    if(s >= VIDEO_MAX_S) pararGrabar();
  }, 250);
  gvBotones('grabando');
}
function pararGrabar(){ clearInterval(GV.reloj); try{ if(GV.rec && GV.rec.state !== 'inactive') GV.rec.stop(); }catch(e){} }
function repetirGrabar(){ error('gv-err', ''); var sb = $('gv-sub'); if(sb) sb.hidden = false; GV.blob = null; var v = $('gv-v'); if(v){ v.removeAttribute('src'); v.controls = false; } encenderCamara(); }
function apagarCamara(){ try{ if(GV.stream) GV.stream.getTracks().forEach(function(t){ t.stop(); }); }catch(e){} GV.stream = null; }
function cerrarGrabadora(){ clearInterval(GV.reloj); try{ if(GV.rec && GV.rec.state !== 'inactive') GV.rec.stop(); }catch(e){} apagarCamara(); cerrarModal(); }
function subirVideoPerfil(inp){
  var f = inp.files && inp.files[0]; inp.value = ''; if(!f) return;
  abrirGrabadora(); subirVideoArchivo({files:[f], value:''});
}
var VIDEO_ARCHIVO_MAX_MB = 500;
function subirVideoArchivo(inp){
  var f = inp.files && inp.files[0]; try{ inp.value = ''; }catch(e){}
  if(!f) return;
  error('gv-err', '');
  if(!/^video\//.test(f.type) && !/\.(mp4|mov|webm|m4v|3gp)$/i.test(f.name || '')) return error('gv-err', 'Ese archivo no es un vídeo.');
  if(f.size > VIDEO_ARCHIVO_MAX_MB * 1048576) return error('gv-err', 'El vídeo pesa ' + mb(f.size) + '. Elige uno de menos de ' + VIDEO_ARCHIVO_MAX_MB + ' MB.');
  apagarCamara();
  var url = URL.createObjectURL(f), v = document.createElement('video'); v.preload = 'metadata'; v.muted = true;
  v.onloadedmetadata = function(){
    var d = v.duration;
    if(isFinite(d) && d < VIDEO_MIN_S) return error('gv-err', 'El vídeo dura ' + Math.round(d) + ' segundos. Tiene que durar entre ' + VIDEO_MIN_S + ' y ' + VIDEO_MAX_S + '.');
    if(isFinite(d) && d > 180) return error('gv-err', 'El vídeo dura ' + mmss(d) + '. Sube uno de menos de 3 minutos.');
    GV.archivo = f; GV.url = url; GV.dur = isFinite(d) ? d : 0; GV.ini = 0; GV.fin = 0; GV.blob = null;
    var largo = GV.dur > VIDEO_MAX_S + 0.5, pesado = f.size > VIDEO_MAX_MB * 1048576;
    var pv = $('gv-v'); if(pv){ pv.srcObject = null; pv.src = url + '#t=0.001'; pv.muted = false; pv.controls = true; pv.autoplay = false; pv.preload = 'auto'; }
    var vac = $('gv-vacio'); if(vac) vac.hidden = true;
    var sub = $('gv-sub'); if(sub) sub.hidden = true;
    if(!largo && !pesado){ GV.blob = f; gvBotones('hecho'); return; }
    gvTramo(largo);
  };
  v.onerror = function(){ error('gv-err', 'No podemos leer ese vídeo. Prueba con otro formato (MP4) o grábalo desde aquí.'); };
  v.src = url;
}
// vídeo largo o muy pesado: eliges el minuto y CERCO lo prepara (más ligero)
function gvTramo(largo){
  var a = $('gv-acts'); if(!a) return;
  var max = Math.max(0, GV.dur - VIDEO_MAX_S);
  a.innerHTML = '<div class="gv-tramo">'
    + (largo ? '<label for="gv-ini"><b>Elige el minuto</b> que verá la clínica</label>'
      + '<div class="gv-tr-f"><input type="range" id="gv-ini" min="0" max="'+max.toFixed(1)+'" step="0.1" value="0" oninput="gvMoverTramo()"><span id="gv-tr-t">0:00 – '+mmss(Math.min(GV.dur, VIDEO_MAX_S))+'</span></div>'
      : '<p><b>Tu vídeo pesa ' + mb(GV.archivo.size) + '.</b> Lo preparamos para que pese menos y se vea igual de bien en el móvil de la clínica.</p>')
    + '<div class="gv-prog" id="gv-prog" hidden><div id="gv-prog-b"></div></div>'
    + '<div class="gv-tr-a"><button class="btn btn-s" onclick="cerrarGrabadora()">Cancelar</button><button class="btn btn-p" id="gv-prep" onclick="gvPreparar()">'+(largo ? 'Usar este trozo' : 'Preparar mi vídeo')+'</button></div></div>';
  if(largo){ var pv = $('gv-v'); if(pv){ pv.currentTime = 0; pv.ontimeupdate = function(){ if(pv.currentTime > GV.ini + VIDEO_MAX_S){ pv.pause(); pv.currentTime = GV.ini; } }; } }
}
function gvMoverTramo(){
  GV.ini = +$('gv-ini').value; var pv = $('gv-v');
  $('gv-tr-t').textContent = mmss(GV.ini) + ' – ' + mmss(GV.ini + VIDEO_MAX_S);
  try{ pv.pause(); pv.currentTime = GV.ini; }catch(e){}
}
/* El iPhone (Safari) solo deja reproducir un vídeo con sonido si la orden nace del toque.
   Preparar el vídeo pasa por pasos que esperan (cargar, saltar al trozo), así que
   «armamos» el vídeo y el audio en el mismo toque y luego ya se pueden usar. */
function hayAudioWeb(){ return !!(window.AudioContext || window.webkitAudioContext); }
function msgSinAudio(){
  return esIOS()
    ? 'Tu iPhone tiene activado el Modo de aislamiento, que no deja a las webs preparar vídeos con sonido. Desactívalo solo para CERCO: toca «aA» (o el icono de la izquierda en la barra de dirección) → Ajustes del sitio web → desactiva «Modo de aislamiento». O graba con menos calidad: Ajustes → Cámara → Grabar vídeo → 720p HD a 30 fps.'
    : 'Este navegador no deja a las webs preparar vídeos con sonido. Prueba en Chrome o Safari, o graba el vídeo con menos calidad para que pese menos de ' + VIDEO_MAX_MB + ' MB.';
}
function armarVideo(url){
  var src = document.createElement('video');
  src.playsInline = true; src.setAttribute('playsinline', ''); src.preload = 'auto'; src.muted = true; // en silencio hasta que el audio pase a la grabación
  // dentro de la página (invisible): algunos móviles no pintan los vídeos que no están en ella
  src.style.cssText = 'position:fixed;left:-10000px;top:0;width:2px;height:2px;opacity:0;pointer-events:none;';
  document.body.appendChild(src);
  var ac = null; try{ ac = new (window.AudioContext || window.webkitAudioContext)(); if(ac.resume) ac.resume(); }catch(e){ ac = null; }
  var listo = { src:src, ac:ac, arrancado:false };
  if(url) src.src = url;
  try{ var p = src.play(); if(p && p.then) p.then(function(){ if(!listo.arrancado) src.pause(); }).catch(function(){}); }catch(e){}
  listo.quitar = function(){ try{ src.pause(); src.removeAttribute('src'); src.load(); src.remove(); }catch(e){} try{ ac && ac.close(); }catch(e){} };
  return listo;
}
// se vuelve a grabar el trozo elegido, a menos calidad, mientras se reproduce sin sonido por los altavoces
function gvPreparar(){
  var b = $('gv-prep'); if(!b || b.disabled) return;
  var tipo = tipoGrabacion();
  if(!window.MediaRecorder || !tipo || !document.createElement('canvas').captureStream) return error('gv-err', 'Este navegador no puede preparar el vídeo. Prueba en Chrome o en Safari actualizado, o recorta el vídeo en tu móvil a 1 minuto y súbelo otra vez.');
  // sin audio web el vídeo saldría mudo: mejor decirlo que guardarlo sin sonido
  if(!hayAudioWeb()) return error('gv-err', msgSinAudio());
  var pv = $('gv-v'); if(!pv) return;
  var ini = GV.ini || 0, dur = Math.max(1, Math.min(VIDEO_MAX_S, GV.dur - ini));
  // Todo nace de este toque (el iPhone lo exige): audio, salto al trozo y reproducción.
  // Se prepara el vídeo que tienes delante: lo ves y lo oyes mientras tanto.
  var ac = GV.ac2; if(!ac || ac.state === 'closed'){ try{ ac = GV.ac2 = new (window.AudioContext || window.webkitAudioContext)(); }catch(e){ return error('gv-err', msgSinAudio()); } }
  try{ if(ac.resume) ac.resume(); }catch(e){}
  var so = pv.__so; if(!so){ try{ so = pv.__so = ac.createMediaElementSource(pv); so.connect(ac.destination); }catch(e){ return error('gv-err', msgSinAudio()); } }
  var de = ac.createMediaStreamDestination(); so.connect(de);
  pv.ontimeupdate = null; pv.controls = false; pv.muted = false; pv.loop = false;
  try{ pv.currentTime = ini; }catch(e){}
  var arranque = pv.play();
  b.disabled = true; b.textContent = 'Preparando…'; $('gv-prog').hidden = false; error('gv-err', '');
  var cancel = document.querySelector('.gv-tr-a .btn-s'); if(cancel) cancel.onclick = function(){ fin('cancel'); };
  var w = pv.videoWidth || 720, h = pv.videoHeight || 1280, k = Math.min(1, 720 / Math.min(w, h));
  var cv = document.createElement('canvas'); cv.width = Math.round(w * k / 2) * 2; cv.height = Math.round(h * k / 2) * 2;
  cv.style.cssText = 'position:fixed;left:-10000px;top:0;width:2px;height:2px;opacity:0;pointer-events:none;';
  document.body.appendChild(cv);
  var cx = cv.getContext('2d'), st = cv.captureStream(30);
  de.stream.getAudioTracks().forEach(function(t){ st.addTrack(t); });
  var rec, trozos = [], hecho = false, ultimo = -1, quieto = 0, vigia = null;
  try{ rec = new MediaRecorder(st, {mimeType:tipo, videoBitsPerSecond:1100000, audioBitsPerSecond:96000}); }catch(e){ rec = new MediaRecorder(st); }
  rec.ondataavailable = function(e){ if(e.data && e.data.size) trozos.push(e.data); };
  function limpiar(){
    clearInterval(vigia); document.removeEventListener('visibilitychange', alVolver);
    try{ so.disconnect(de); }catch(e){} try{ cv.remove(); }catch(e){}
    try{ pv.pause(); }catch(e){}
  }
  function reiniciarBoton(txt){ b.disabled = false; b.textContent = txt || 'Preparar mi vídeo'; $('gv-prog').hidden = true; var pb = $('gv-prog-b'); if(pb) pb.style.width = '0'; pv.controls = true; }
  function fin(motivo){
    if(hecho) return; hecho = true;
    if(motivo !== 'ok'){
      trozos = []; try{ if(rec.state !== 'inactive') rec.stop(); }catch(e){} limpiar();
      if(motivo === 'cancel'){ cerrarGrabadora(); return; }
      reiniciarBoton('Probar otra vez');
      return error('gv-err', motivo === 'fuera' ? 'Has salido de la página y el móvil ha parado el vídeo. Pulsa «Probar otra vez» y quédate en esta pantalla hasta que acabe (dura lo mismo que tu vídeo).'
        : 'El móvil ha parado el vídeo a medias. Pulsa «Probar otra vez»; si vuelve a pasar, prueba con Chrome o Safari actualizado.');
    }
    rec.onstop = function(){
      limpiar();
      var blob = new Blob(trozos, {type: (tipo || 'video/webm').split(';')[0]});
      if(!blob.size){ reiniciarBoton('Probar otra vez'); return error('gv-err', 'No ha salido bien. Pulsa «Probar otra vez».'); }
      GV.blob = blob; GV.dur = dur; GV.ini = 0; GV.fin = 0; GV.w = cv.width; GV.h = cv.height;
      // vídeo nuevo en un reproductor nuevo (el anterior quedó unido al audio de la preparación)
      var nv = document.createElement('video'); nv.id = 'gv-v'; nv.setAttribute('playsinline', ''); nv.playsInline = true; nv.controls = true; nv.preload = 'auto';
      nv.src = URL.createObjectURL(blob) + '#t=0.001';
      pv.parentNode.replaceChild(nv, pv);
      $('gv-acts').innerHTML = ''; gvBotones('hecho');
      if(blob.size > VIDEO_MAX_MB * 1048576) error('gv-err', 'Sigue pesando ' + mb(blob.size) + '. Elige un trozo más corto o graba con menos calidad (Ajustes → Cámara → Grabar vídeo → 720p HD).');
      else toast('Listo: ' + mb(blob.size) + '. Míralo y pulsa «Usar este vídeo».');
    };
    try{ rec.stop(); }catch(e){ rec.onstop(); }
  }
  function alVolver(){ if(document.visibilityState === 'hidden') fin('fuera'); }
  document.addEventListener('visibilitychange', alVolver);
  function dibuja(){
    if(hecho) return;
    try{ cx.drawImage(pv, 0, 0, cv.width, cv.height); }catch(e){}
    var t = pv.currentTime - ini, pb = $('gv-prog-b'); if(pb) pb.style.width = Math.max(0, Math.min(100, t / dur * 100)) + '%';
    b.textContent = 'Preparando… ' + Math.max(0, Math.round(dur - t)) + ' s';
    if(t >= dur - 0.05 || pv.ended){ fin('ok'); return; }
    requestAnimationFrame(dibuja);
  }
  function empezar(){
    if(hecho || rec.state !== 'inactive') return;
    try{ rec.start(500); }catch(e){ return fin('error'); }
    dibuja();
    // si el vídeo se queda parado (llamada, bloqueo, el móvil lo pausa) lo decimos en vez de quedarnos colgados
    vigia = setInterval(function(){
      if(hecho) return;
      if(Math.abs(pv.currentTime - ultimo) < 0.01){ quieto++; if(quieto === 2){ try{ var p = pv.play(); if(p && p.catch) p.catch(function(){}); }catch(e){} } if(quieto >= 6) fin('parado'); }
      else { quieto = 0; ultimo = pv.currentTime; }
    }, 1000);
  }
  (arranque && arranque.then ? arranque : Promise.resolve()).then(empezar).catch(function(){ fin('parado'); });
}
function usarVideo(){
  if(!GV.blob || !unaVez('usarV', 1500)) return;
  var b = $('gv-usar'); if(b){ b.disabled = true; b.textContent = 'Preparando…'; }
  aDataUrl(GV.blob).then(function(url){
    return Nube.subirMedia('video', url, function(k, n){ if(b) b.textContent = n > 1 ? ('Subiendo ' + k + ' de ' + n + '…') : 'Subiendo…'; });
  }).then(function(meta){
    meta.dur = Math.round(GV.dur);
    var gvv = $('gv-v'); if(gvv && gvv.videoWidth){ meta.w = gvv.videoWidth; meta.h = gvv.videoHeight; } else if(GV.w){ meta.w = GV.w; meta.h = GV.h; }
    if(GV.url){ try{ URL.revokeObjectURL(GV.url); }catch(e){} GV.url = null; GV.archivo = null; }
    if(GV.fin){ meta.ini = 0; meta.fin = GV.fin; }
    var p = Object.assign({}, S.perfil); p.video = meta;
    return guardarYRepintar(p);
  }).then(function(){
    cerrarGrabadora(); toast('Vídeo guardado. Lo verán las clínicas a las que escribas.');
    _mediaUrl.video = null;
  }).catch(function(){
    if(b){ b.disabled = false; b.textContent = 'Usar este vídeo'; }
    error('gv-err', 'No hemos podido subir el vídeo: la conexión se ha cortado. Pulsa «Usar este vídeo» otra vez cuando tengas buena cobertura o wifi.');
  });
}
function quitarVideo(){ if(!confirm('¿Quitar tu vídeo? Las clínicas dejarán de verlo.')) return; var p = Object.assign({}, S.perfil); p.video = null; _mediaUrl.video = null; guardarYRepintar(p, 'Vídeo quitado'); }

/* ---------- CV completo en PDF ---------- */
function elegirCV(inp){
  var f = inp.files && inp.files[0]; inp.value = '';
  if(!f) return;
  if(f.type !== 'application/pdf' && !/\.pdf$/i.test(f.name)) return toast('El CV tiene que estar en PDF.');
  if(f.size > CV_MAX_MB * 1048576) return toast('El PDF pesa ' + mb(f.size) + '. El máximo son ' + CV_MAX_MB + ' MB.');
  toast('Subiendo tu CV…');
  aDataUrl(f).then(function(url){
    if(url.indexOf('data:;') === 0 || url.indexOf('data:application/octet-stream') === 0) url = 'data:application/pdf' + url.slice(url.indexOf(';'));
    return Nube.subirMedia('cv', url);
  }).then(function(meta){
    meta.nombre = String(f.name).slice(0, 80);
    var p = Object.assign({}, S.perfil); p.cv = meta; _mediaUrl.cv = null;
    return guardarYRepintar(p, 'CV guardado');
  }).catch(function(){ toast('No hemos podido subir el CV. Revisa tu conexión.'); });
}
function quitarCV(){ var p = Object.assign({}, S.perfil); p.cv = null; _mediaUrl.cv = null; guardarYRepintar(p, 'CV quitado'); }

var _mediaUrl = { video:null, cv:null };
function urlMedia(tipo){
  if(_mediaUrl[tipo]) return Promise.resolve(_mediaUrl[tipo]);
  var meta = S.perfil && S.perfil[tipo];
  if(!meta) return Promise.reject('sin');
  return Nube.leerMedia(Nube.uid, tipo, meta).then(function(b){ _mediaUrl[tipo] = URL.createObjectURL(b); return _mediaUrl[tipo]; });
}
function verMiVideo(){
  var box = $('pf-vid'); if(!box) return;
  box.innerHTML = '<div class="cargando" style="padding:40px 10px;color:#fff;"><div class="spin"></div>Cargando vídeo…</div>';
  urlMedia('video').then(function(u){
    box.innerHTML = '<video src="'+u+'" controls playsinline autoplay style="width:100%;height:100%;display:block;background:#000;"></video>';
  }).catch(function(){ box.innerHTML = '<div class="cargando" style="padding:40px 10px;color:#fff;">No hemos podido cargar el vídeo.</div>'; });
}
/* ---------- ver el CV sin descargarlo ----------
   Se pinta cada página dentro de CERCO con PDF.js (funciona igual en el
   móvil, donde el navegador no enseña PDF dentro de la página). Si PDF.js
   no carga, se abre el visor del propio navegador. */
var PDFJS_V = '3.11.174', _pdfjs = null;
function cargarPdfJs(){
  if(window.pdfjsLib) return Promise.resolve(window.pdfjsLib);
  if(_pdfjs) return _pdfjs;
  _pdfjs = new Promise(function(res, rej){
    var sc = document.createElement('script');
    sc.src = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/' + PDFJS_V + '/pdf.min.js';
    sc.onload = function(){ try{ window.pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/' + PDFJS_V + '/pdf.worker.min.js'; res(window.pdfjsLib); }catch(e){ rej(e); } };
    sc.onerror = function(){ _pdfjs = null; rej('pdfjs'); };
    document.head.appendChild(sc);
  });
  return _pdfjs;
}
function abrirVisorPdf(url, nombre, descargable){
  cerrarModal();
  var m = document.createElement('div'); m.className = 'modal-bg pdfv-bg'; m.id = 'modal';
  m.onclick = function(e){ if(e.target === m) cerrarModal(); };
  m.innerHTML = '<div class="pdfv" role="dialog" aria-modal="true" aria-label="'+esc(nombre)+'">'
    + '<div class="pdfv-cab"><div class="pdfv-t">'+svg('file','#1A56DB',18)+'<span>'+esc(nombre)+'</span></div>'
    + (descargable ? '<a class="btn btn-s pdfv-b" href="'+esc(url)+'" download="'+esc(nombre)+'">'+svg('download','currentColor',15)+'<span class="pdfv-bt">Descargar</span></a>' : '')
    + '<button class="pdfv-x" onclick="cerrarModal()" aria-label="Cerrar">'+svg('x','#374151',20)+'</button></div>'
    + '<div class="pdfv-c" id="pdfv-c"><div class="cargando"><div class="spin"></div>Abriendo el CV…</div></div></div>';
  document.body.appendChild(m);
  var box = $('pdfv-c');
  cargarPdfJs().then(function(lib){ return lib.getDocument(url).promise; }).then(function(pdf){
    box.innerHTML = '';
    var ancho = Math.min(box.clientWidth - 24, 820), dpr = Math.min(window.devicePixelRatio || 1, 2), cad = Promise.resolve();
    for(var i = 1; i <= pdf.numPages; i++) (function(n){
      cad = cad.then(function(){ return pdf.getPage(n); }).then(function(pg){
        var v1 = pg.getViewport({scale:1}), esc2 = ancho / v1.width, vp = pg.getViewport({scale: esc2 * dpr});
        var cv = document.createElement('canvas'); cv.width = vp.width; cv.height = vp.height;
        cv.style.width = Math.round(vp.width / dpr) + 'px'; cv.className = 'pdfv-p'; cv.setAttribute('aria-label', 'Página ' + n + ' de ' + pdf.numPages);
        box.appendChild(cv);
        return pg.render({canvasContext: cv.getContext('2d'), viewport: vp}).promise;
      });
    })(i);
    return cad;
  }).catch(function(){
    // sin PDF.js: el visor del navegador
    box.innerHTML = '<iframe class="pdfv-if" src="'+esc(url)+'#view=FitH" title="'+esc(nombre)+'"></iframe>';
  });
}
function verMiCV(){
  toast('Abriendo tu CV…');
  urlMedia('cv').then(function(u){ abrirVisorPdf(u, (S.perfil.cv && S.perfil.cv.nombre) || 'CV.pdf', true); })
    .catch(function(){ toast('No hemos podido abrir el CV.'); });
}

/* ---------- la tarjeta en Mi perfil ---------- */
function pintarMedia(){
  var box = $('pf-media'); if(!box) return;
  var p = S.perfil || {}, v = p.video, c = p.cv;
  var h = '<h3>'+svg('video','currentColor',16)+'Tu presentación</h3>'
    + '<p class="sub" style="margin:-4px 0 16px;font-size:13.5px;">Es lo primero que ve la clínica, antes que el CV.</p>';
  // vídeo
  if(v){
    h += '<div class="pm-vid'+(v.poster ? ' con-portada' : '')+'" id="pf-vid" data-w="'+(v.w||'')+'" data-h="'+(v.h||'')+'"'+(v.poster ? ' style="background-image:linear-gradient(rgba(15,28,63,.15),rgba(15,28,63,.45)),url(\''+esc(v.poster)+'\')"' : '')+'><button type="button" class="pm-play" onclick="verMiVideo()">'+svg('video','#fff',22)+'<span>Ver mi vídeo'+(v.dur ? ' ('+mmss(v.dur)+')' : '')+'</span></button>'+(v.poster ? '<span class="pm-portada">Portada que ve la clínica</span>' : '')+'</div>'
      + '<div class="pm-row"><button class="btn btn-s" onclick="abrirGrabadora()">'+svg('video','currentColor',15)+'Grabar otro</button><label class="btn btn-s">'+svg('upload','currentColor',15)+'Subir otro<input type="file" accept="video/*" class="sr" onchange="subirVideoPerfil(this)"></label><button class="btn btn-g" style="color:#DC2626;" onclick="quitarVideo()">Quitar</button></div>';
  } else {
    h += '<div class="pm-vacio"><div class="pm-vacio-ic">'+svg('video','#fff',24)+'</div><div style="min-width:0;"><b>Graba tu vídeo de presentación</b><span>Quién eres, qué te gusta de tu trabajo y qué buscas. La clínica lo ve antes que tu CV.</span></div>'
      + '<div class="pm-vacio-b"><button class="btn btn-p" onclick="abrirGrabadora()">'+svg('video','#1A3A9B',16)+'Grabar ahora</button><label class="btn pm-subir">'+svg('upload','#fff',16)+'Subir de mis archivos<input type="file" accept="video/*" class="sr" onchange="subirVideoPerfil(this)"></label></div></div>';
  }
  // la foto se pone arriba, en la cabecera del perfil
  // CV
  h += '<div class="pm-line"><div class="pm-doc">'+svg('file','#1A56DB',20)+'</div>'
    + '<div style="flex:1;min-width:0;"><b>'+(c ? esc(c.nombre || 'CV.pdf') : 'CV completo en PDF')+'</b><span>'+(c ? mb(c.size) + ' · la clínica puede verlo y descargarlo' : 'Opcional. Además de tu CV resumido.')+'</span></div>'
    + (c ? '<button class="btn btn-p pm-btn" onclick="verMiCV()">'+svg('eye','#fff',15)+'Ver</button>' : '')
    + '<label class="btn btn-s pm-btn">'+(c ? 'Cambiar' : 'Subir PDF')+'<input type="file" accept="application/pdf,.pdf" onchange="elegirCV(this)" hidden></label>'
    + (c ? '<button class="btn btn-g pm-btn" style="color:#DC2626;" onclick="quitarCV()">Quitar</button>' : '')
    + '</div>';
  box.innerHTML = h;
}

/* ================================================================
   SEIMIAN para el candidato
   Un asistente automático de CERCO: solo usa tu perfil y las ofertas
   publicadas, y dice claramente cuando algo no lo sabe.
   ================================================================ */
var SEI = { abierto:false };
function abrirSeimian(){
  if(SEI.abierto) return;
  SEI.abierto = true;
  var fab = $('sei-fab'); if(fab) fab.hidden = true;
  var m = document.createElement('div');
  m.id = 'sei'; m.className = 'sei-bg';
  m.onclick = function(e){ if(e.target === m) cerrarSeimian(); };
  m.innerHTML = '<div class="sei" role="dialog" aria-modal="true" aria-label="Seimian">'
    + '<div class="sei-h"><div class="sei-av">'+svg('sparkles','#fff',17)+'</div><div style="flex:1;min-width:0;"><div class="sei-n">Seimian</div><div class="sei-s">Asistente automático de CERCO · no es una persona · solo ve tu perfil y las ofertas</div></div>'
    + '<button class="gu-x" aria-label="Cerrar" onclick="cerrarSeimian()">'+svg('x','#9CA3AF',18)+'</button></div>'
    + '<div class="sei-msgs" id="sei-msgs"></div>'
    + '<form class="sei-in" onsubmit="event.preventDefault(); seiPreguntar();"><input class="inp" id="sei-q" autocomplete="off" placeholder="Pregunta por tus solicitudes, ofertas o entrevista"><button class="btn btn-p" type="submit" aria-label="Enviar">'+svg('send','#fff',16)+'</button></form>'
    + '</div>';
  document.body.appendChild(m);
  var p = S.perfil || {};
  seiCaja();
  var hola = 'Hola' + (p.nombre ? ', ' + esc(primerNom(p.nombre)) : '') + '. ';
  if(!p.disc) hola += 'Aún no has hecho el test de personalidad. Sin él no puedo decirte qué ofertas te encajan ni prepararte la entrevista.';
  else if(!p.video) hola += 'Tu perfil está casi listo. Lo que más te ayudaría ahora es un vídeo corto: las clínicas lo ven antes que el CV.';
  else hola += 'Eres ' + NOMBRE[p.disc.dom].toLowerCase() + ' con rasgo ' + NOMBRE[p.disc.sec].toLowerCase() + '. ¿Miramos qué ofertas te encajan más?';
  seiDice(hola, true);
  try{ $('sei-q').focus({preventScroll:true}); }catch(e){}
}
function cerrarSeimian(){ var m = $('sei'); if(m) m.remove(); SEI.abierto = false; var fab = $('sei-fab'); if(fab) fab.hidden = !Nube.uid; }
function seiCaja(){
  var c = $('sei-msgs'); if(!c) return;
  var d = document.createElement('div'); d.className = 'sei-caja';
  d.innerHTML = '<div class="sei-caja-t">'+svg('sparkles','#8AB4FF',14)+'ESTO ES LO QUE HAGO</div>'
    + '<div><b>Te digo qué ofertas te encajan</b> y por qué, con tu test</div>'
    + '<div><b>Te preparo la entrevista</b> con las preguntas que suelen hacer</div>'
    + '<div><b>Te digo qué mejorar</b> en tu perfil para que te contesten antes</div>'
    + '<div class="sei-caja-p">Soy un asistente automático: respondo con tus datos y las ofertas publicadas. Si algo no lo sé, te lo digo.</div>';
  c.appendChild(d);
}
function seiDice(html, conAtajos){
  var c = $('sei-msgs'); if(!c) return;
  var a = $('sei-at'); if(a) a.remove();
  var d = document.createElement('div'); d.className = 'sei-m'; d.innerHTML = html; c.appendChild(d);
  if(conAtajos !== false) seiAtajos();
  c.scrollTop = c.scrollHeight;
}
function seiYo(t){
  var c = $('sei-msgs'); if(!c) return;
  var a = $('sei-at'); if(a) a.remove();
  var d = document.createElement('div'); d.className = 'sei-m yo'; d.textContent = t; c.appendChild(d);
  c.scrollTop = c.scrollHeight;
}
/* ---- lo que Seimian sabe además de ofertas, entrevista, perfil y test ---- */
function seiLink(txt, js){ return ' <button class="sei-link" onclick="'+js+'">'+txt+'</button>'; }
function seiQuien(){ return 'Soy el asistente automático de CERCO, no una persona. Puedo decirte: <b>cómo van tus solicitudes</b>, <b>qué oferta te encaja</b>, prepararte <b>la entrevista</b>, <b>qué mejorar</b> en tu perfil, cuánto es un sueldo <b>en neto</b>, <b>quién ve tu perfil</b> y cómo funciona el test.'; }
function seiSols(){
  var l = S.sols.filter(function(s){ return !esVisita(s); });
  if(!l.length) return 'Todavía no has enviado ninguna solicitud. ¿Miramos qué ofertas te encajan?' + seiLink('Ver ofertas', "cerrarSeimian(); ir('ofertas')");
  var viv = l.filter(function(s){ return ['enviada','vista','entrevista'].indexOf(s.estado) > -1; });
  var h = 'Tienes ' + l.length + ' solicitud' + (l.length === 1 ? '' : 'es') + (viv.length ? ', ' + viv.length + ' en marcha:' : ', ninguna en marcha ahora.') + '<br>';
  viv.slice(0,5).forEach(function(s){
    var q = diasQuedan(s);
    h += '• <b>' + esc(s.clinicaNombre || 'Clínica') + '</b> · ' + (s.estado === 'entrevista' ? 'te proponen entrevista' : s.estado === 'vista' ? 'han abierto tu perfil' : 'aún no la han abierto')
      + (s.estado !== 'entrevista' && q !== null ? ' · ' + (q === 0 ? 'se cierra hoy si no contestan' : 'les quedan ' + q + (q === 1 ? ' día' : ' días') + ' para contestar') : '') + '<br>';
  });
  var ent = viv.filter(function(s){ return s.estado === 'entrevista'; })[0];
  if(ent) h += 'Lo primero: la entrevista con ' + esc(ent.clinicaNombre || 'la clínica') + '.' + seiLink('Abrirla', "cerrarSeimian(); ir('solicitud','" + esc(ent.id) + "')") + seiLink('Ensayarla', "cerrarSeimian(); abrirHerramienta('ensayo','" + esc(ent.ofertaId) + "')");
  else h += seiLink('Ver mis solicitudes', "cerrarSeimian(); ir('solicitudes')");
  return h;
}
function seiHoy(p){
  var ent = S.sols.filter(function(s){ return s.estado === 'entrevista' && !esVisita(s); })[0];
  if(ent) return 'Lo más importante hoy: la entrevista con <b>' + esc(ent.clinicaNombre || 'la clínica') + '</b>. Confírmala y ensáyala con sus preguntas.' + seiLink('Abrirla', "cerrarSeimian(); ir('solicitud','" + esc(ent.id) + "')") + seiLink('Ensayar', "cerrarSeimian(); abrirHerramienta('ensayo','" + esc(ent.ofertaId) + "')");
  if(!p.disc) return 'Lo primero es el test: sin él no puedes enviar solicitudes. Son 5 minutos.' + seiLink('Hacer el test', "cerrarSeimian(); abrirTest(false)");
  if(!p.video) return 'Graba tu vídeo de presentación (hasta 1 minuto): es lo que más hace que una clínica te conteste.' + seiLink('Ir a mi perfil', "cerrarSeimian(); ir('perfil')");
  if(!p.cv) return 'Sube tu CV: la clínica lo puede leer dentro de CERCO sin descargarlo.' + seiLink('Ir a mi perfil', "cerrarSeimian(); ir('perfil')");
  var viv = S.sols.filter(function(s){ return ['enviada','vista'].indexOf(s.estado) > -1; }).length;
  if(viv < 3) return (viv ? 'Tienes ' + viv + ' solicitud' + (viv === 1 ? '' : 'es') + ' esperando. ' : '') + 'Con el perfil completo, lo que toca es solicitar 2 o 3 ofertas que te encajen: más no hace falta.' + seiLink('Ver ofertas', "cerrarSeimian(); ir('ofertas')");
  return 'Vas bien: tienes ' + viv + ' solicitudes esperando respuesta. Las clínicas tienen 2 días laborables para contestar; te aviso en cuanto lo hagan.';
}
function seiExtra(tema, p){
  if(tema === 'sols') return seiSols();
  if(tema === 'hoy') return seiHoy(p);
  if(tema === 'quien') return seiQuien();
  if(tema === 'plazo') return 'La clínica se compromete a contestarte en <b>2 días laborables</b>. Si a los <b>5 días</b> no ha dicho nada, CERCO cierra la solicitud, te avisa y a la clínica le baja su tasa de respuesta, que todo el mundo ve en sus ofertas. Nadie se queda semanas sin saber.';
  if(tema === 'descarte'){
    var d = S.sols.filter(function(s){ return s.estado === 'descartada' && !esVisita(s); }).sort(function(a,b){ return new Date(b.fecha) - new Date(a.fecha); })[0];
    if(!d) return 'No tienes ninguna solicitud descartada. Si una clínica dice que no, tiene que elegir un motivo del puesto y lo verás en la solicitud.';
    var m = MOTIVOS[d.motivo];
    return 'La última fue <b>' + esc(d.clinicaNombre || 'una clínica') + '</b>. ' + (m ? 'Motivo: ' + esc(m[0]) + ' ' + esc(m[1]) : 'No indicaron un motivo concreto.') + ' Un «no» habla de ese puesto en ese momento, no de ti.' + seiLink('Ver la solicitud', "cerrarSeimian(); ir('solicitud','" + esc(d.id) + "')");
  }
  if(tema === 'neto') return 'Te paso cualquier sueldo bruto anual a lo que cobrarías cada mes, en 12 o 14 pagas.' + seiLink('Abrir Sueldo neto', "cerrarSeimian(); abrirHerramienta('neto')");
  if(tema === 'comparar') return 'Puedes poner hasta 3 ofertas lado a lado: sueldo neto, distancia, contrato y cómo responde cada clínica.' + seiLink('Comparar ofertas', "cerrarSeimian(); abrirHerramienta('comparar')");
  if(tema === 'mensaje') return 'Te escribo tres versiones del mensaje para la clínica con lo que ellos buscan y lo que tú aportas; tú eliges y retocas.' + seiLink('Escribir mensaje', "cerrarSeimian(); abrirHerramienta('mensaje')");
  if(tema === 'test') return 'El test tiene 15 preguntas. Puntúas cada frase del 1 al 4 y puedes repetir nota: lo que cuenta es la diferencia entre unas frases y otras, así que poner lo mismo a todo no suma. No hay respuestas buenas: cada clínica busca formas de trabajar distintas. Puedes repetirlo una vez sin esperar y después cada ' + DISC_ESPERA_DIAS + ' días; la clínica ve cuántas veces lo has cambiado.';
  if(tema === 'priv') return 'Las clínicas ven tu perfil completo (nombre, vídeo, CV y contacto) <b>solo cuando les envías una solicitud</b>, o si CERCO te presenta y tú lo has activado. En Perfil → Ajustes eliges quién puede verte y puedes ocultarte de clínicas concretas, por ejemplo donde trabajas ahora. También puedes eliminar tu cuenta y tus datos cuando quieras.' + seiLink('Ir a Ajustes', "cerrarSeimian(); ir('perfil'); setTimeout(function(){ pfIr('pf-ajustes'); }, 300)");
  if(tema === 'rebote') return 'Si una clínica te dice que no, CERCO puede presentarte a otra cercana que busca tu profesión, para que no empieces de cero. Tú decides en Perfil → Ajustes: que te pregunte antes, que lo haga solo o que no lo haga. La nueva clínica nunca sabe que vienes de un «no».' + seiLink('Ir a Ajustes', "cerrarSeimian(); ir('perfil'); setTimeout(function(){ pfIr('pf-ajustes'); }, 300)");
  if(tema === 'video') return 'Para tu vídeo de presentación, tres ideas bastan:<br>1. Quién eres y qué haces («Soy Laia, higienista con 4 años en clínica»).<br>2. Qué se te da mejor, con un ejemplo real.<br>3. Qué buscas ahora (horario, tipo de clínica).<br>Luz de frente, móvil a la altura de los ojos y sin leer. Después puedes recortarlo y elegir la portada.' + seiLink('Ir a mi perfil', "cerrarSeimian(); ir('perfil')");
  if(tema === 'primerdia') return 'Antes de empezar, pide por escrito lo mismo que salía en la oferta: sueldo, horario, convenio y periodo de prueba. El primer día pregunta quién es tu persona de referencia y cómo son los protocolos de esterilización y agenda. A los 90 días CERCO os preguntará a los dos si seguís y si las condiciones se cumplieron.';
  return null;
}
function seiAtajos(){
  var c = $('sei-msgs'); if(!c) return;
  var d = document.createElement('div'); d.className = 'sei-at'; d.id = 'sei-at';
  [['¿Qué hago hoy?','hoy'],['¿Cómo van mis solicitudes?','sols'],['¿Qué oferta me encaja más?','ofertas'],['Prepárame la entrevista','entrevista'],['¿Cómo mejoro mi perfil?','mejorar'],['Explícame mi perfil','disc']].forEach(function(x){
    var b = document.createElement('button'); b.type = 'button'; b.textContent = x[0];
    b.onclick = function(){ seiTema(x[1], x[0]); };
    d.appendChild(b);
  });
  c.appendChild(d);
}
function seiPreguntar(){
  var i = $('sei-q'); var q = (i && i.value || '').trim(); if(!q) return;
  i.value = '';
  var t = q.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g,'');
  var tema = /hoy|que hago|por donde|siguiente paso|que me falta hacer/.test(t) ? 'hoy'
    : /descart|rechaz|por que no|no me (han )?(cogid|elegid|llam)/.test(t) ? 'descarte'
    : /mis solicitudes|como va|contestad|respondid|me han|estado de|novedad/.test(t) ? 'sols'
    : /plazo|cuanto tardan|cuando (me )?contest|cuantos dias|tardan/.test(t) ? 'plazo'
    : /neto|al mes|14 pagas|12 pagas/.test(t) ? 'neto'
    : /compar/.test(t) ? 'comparar'
    : /que digo en el video|grabar|video/.test(t) ? 'video'
    : /mensaje|que (le )?(escribo|digo|pongo)|carta/.test(t) ? 'mensaje'
    : /repetir|trampa|como funciona el test|cuantas veces|sin perfil|repasar/.test(t) ? 'test'
    : /quien (puede )?ve|privacidad|ocult|mi jefe|mi clinica actual|datos|borrar|eliminar/.test(t) ? 'priv'
    : /rebote|presenta|otra clinica|otras clinicas/.test(t) ? 'rebote'
    : /primer dia|contratad|me han cogido|empiezo/.test(t) ? 'primerdia'
    : /quien eres|eres (una )?(ia|persona|robot)|que (sabes|puedes)/.test(t) ? 'quien'
    : /salari|sueldo|cobr|pagan|€|euros/.test(t) ? 'salario'
           : /entrevist|pregunt|prepar/.test(t) ? 'entrevista'
           : /ofert|encaj|trabajo|puesto|cl[ií]nica/.test(t) ? 'ofertas'
           : /mejor|v[ií]deo|foto|cv|curr[ií]c|perfil (incompleto|mejor)|complet/.test(t) ? 'mejorar'
           : /disc|personalidad|test|soy|rasgo|perfil/.test(t) ? 'disc' : null;
  seiTema(tema, q);
}
function seiTema(tema, pregunta){
  seiYo(pregunta);
  var p = S.perfil || {}, d = p.disc, r;
  var t = document.createElement('div'); t.className = 'sei-m sei-esc'; t.innerHTML = '<span></span><span></span><span></span>';
  var c = $('sei-msgs'); if(c){ c.appendChild(t); c.scrollTop = c.scrollHeight; }
  setTimeout(function(){
    t.remove();
    var ex = tema ? seiExtra(tema, p) : null;
    if(ex) r = ex;
    else if(!tema) r = 'Eso no lo sé contestar con seguridad, y prefiero decírtelo a inventarlo. ' + seiQuien();
    else if(tema === 'salario') r = seiSalario();
    else if(tema !== 'mejorar' && !d) r = 'Primero necesito tu test de personalidad: son 5 minutos. <button class="sei-link" onclick="cerrarSeimian(); abrirTest(false)">Hacer el test</button>';
    else if(tema === 'ofertas') r = seiOfertas(d);
    else if(tema === 'entrevista') r = seiEntrevista(d);
    else if(tema === 'mejorar') r = seiMejorar(p);
    else r = seiDisc(d);
    seiDice(r);
  }, 650);
}
function seiOfertas(d){
  var pf = S.perfil || {}, zc = ofertasCerca(ofertasVisibles().filter(function(o){ return !solDeOferta(o.id); }));
  var lejos = !zc.dentro.length && zc.fuera.length;
  var l = (lejos ? zc.fuera : zc.dentro)
    .map(function(o){ return {o:o, p:encaje(d, o)}; }).filter(function(x){ return x.p !== null; })
    .sort(function(a,b){ return b.p - a.p; }).slice(0,3);
  if(!l.length) return 'Ahora mismo no hay ofertas nuevas que no hayas solicitado. Te aviso aquí cuando se publiquen.';
  var h = (!hayReales() ? 'Todavía no hay ofertas reales; con las de ejemplo, así lo vería:'
    : lejos ? 'No hay ofertas ' + esc(txtRadio(pf.radio||25, pf.geo)) + '. De las que hay más lejos, estas te encajan mejor:'
    : 'Estas son las que mejor te encajan' + (pf.geo ? ' ' + esc(txtRadio(pf.radio||25, pf.geo)) : '') + ':') + '<ol class="sei-ol">';
  l.forEach(function(x){
    var ps = perfilesDe(x.o), coinc = ps.filter(function(k){ return k === d.dom || k === d.sec; });
    var st = statsResp(x.o.clinicaId);
    h += '<li><button class="sei-link" onclick="cerrarSeimian(); ir(\'oferta\',\''+esc(x.o.id)+'\')">'+esc(x.o.titulo)+' · '+esc(x.o.clinica||'')+'</button> <b>'+x.p+' %</b><br>'
      + (coinc.length ? 'Buscan ' + coinc.map(function(k){ return NOMBRE[k].toLowerCase(); }).join(' y ') + ', como tú.' : 'Buscan otro perfil, pero tu punto fuerte puede sumar.')
      + (st && !st.nueva ? ' Contestan al ' + st.pct + ' %.' : '')
      + (!x.o.ejemplo && pf.geo && kmDe(x.o, pf.geo) !== null ? ' Te queda a ' + kmDe(x.o, pf.geo) + ' km.' : '') + '</li>';
  });
  return h + '</ol>El porcentaje es orientativo: la entrevista es lo que cuenta.';
}
var PREG_DISC = {
  D:['Cuéntame una vez que tuviste que decidir rápido con un paciente. ¿Qué hiciste?','¿Cómo reaccionas cuando alguien del equipo no sigue tu ritmo?'],
  I:['¿Cómo tranquilizas a un paciente con miedo al dentista?','Háblame de una vez que tu forma de comunicar evitó un problema.'],
  S:['¿Qué haces cuando la agenda se complica y todos van con prisa?','¿Cómo te adaptas a un cambio de protocolo que no te convence?'],
  C:['¿Cómo te aseguras de no saltarte ningún paso de esterilización?','Cuéntame un error que detectaste antes que nadie.']
};
var CUIDA = {
  D:'no parecer impaciente: escucha la pregunta entera antes de contestar.',
  I:'no irte por las ramas: responde con un ejemplo concreto y cierra.',
  S:'venderte más: di en voz alta lo que haces bien, no solo lo que hace el equipo.',
  C:'no quedarte solo en el detalle técnico: habla también del trato con el paciente.'
};
function seiEntrevista(d){
  var ent = S.sols.filter(function(s){ return s.estado === 'entrevista' && !esVisita(s); })[0];
  var o = ent ? buscarOferta(ent.ofertaId) : null;
  var ps = o ? perfilesDe(o) : [];
  var h = ent ? 'Para tu entrevista en <b>' + esc(ent.clinicaNombre||'la clínica') + '</b> (' + esc(ent.ofertaTitulo||'') + ')' + (ent.cita ? ', el <b>' + esc(fechaCitaC(ent.cita.fecha).toLowerCase()) + '</b> (' + esc((MODO_C[ent.cita.modo]||'').toLowerCase()) + ')' : '') + ':' : 'No tienes ninguna entrevista todavía. Te preparo lo que suelen preguntar en clínicas dentales:';
  h += '<ol class="sei-ol"><li>Háblame de ti y de por qué quieres este puesto.</li>';
  (ps.length ? ps : [d.dom]).slice(0,2).forEach(function(k){ h += '<li>' + PREG_DISC[k][0] + '</li>'; });
  h += '<li>' + PREG_DISC[d.dom][1] + '</li><li>¿Qué esperas del equipo y de la clínica?</li></ol>';
  h += '<b>Tu punto fuerte:</b> ' + APORTA[d.dom] + '. Llévalo con un ejemplo real.<br><b>Cuida:</b> ' + CUIDA[d.dom];
  if(ps.length && ps.indexOf(d.dom) === -1) h += '<br><b>Ojo:</b> buscan ' + ps.map(function(k){ return NOMBRE[k].toLowerCase(); }).join(' y ') + '. Prepara un ejemplo donde lo demostraras.';
  return h;
}
function seiMejorar(p){
  var f = [];
  if(!p.disc) f.push(['Hacer el test de personalidad', 'sin él no puedes solicitar', "cerrarSeimian(); abrirTest(false)", 'Hacer el test']);
  if(!p.video) f.push(['Grabar tu vídeo de presentación', 'es lo primero que ve la clínica', "cerrarSeimian(); ir('perfil'); setTimeout(abrirGrabadora, 200)", 'Grabar']);
  if(!p.resumen) f.push(['Presentarte en pocas líneas', 'las clínicas lo leen antes de llamarte', "cerrarSeimian(); editarPerfil()", 'Escribirlo']);
  if(!(p.trabajos||[]).length && p.experiencia && p.experiencia.indexOf('Sin experiencia') !== 0) f.push(['Añadir dónde has trabajado', 'da confianza aunque sea poco tiempo', "cerrarSeimian(); editarPerfil()", 'Añadir']);
  if(!p.foto) f.push(['Poner una foto', 'ayuda a que te recuerden después de la entrevista', "cerrarSeimian(); ir('perfil')", 'Añadir foto']);
  if(!p.cv) f.push(['Subir tu CV completo en PDF', 'algunas clínicas lo piden para decidir', "cerrarSeimian(); ir('perfil')", 'Subir']);
  if(!f.length) return 'Tu perfil está completo. Ahora lo que más cuenta es contestar rápido cuando una clínica te escriba.';
  var h = 'Por orden de importancia:<ol class="sei-ol">';
  f.slice(0,4).forEach(function(x){ h += '<li><b>' + x[0] + '</b>: ' + x[1] + '. <button class="sei-link" onclick="' + x[2] + '">' + x[3] + '</button></li>'; });
  return h + '</ol>';
}
function seiSalario(){
  var l = ofertasVisibles().filter(function(o){ return o.salario; });
  if(!l.length){ var rp0 = (S.perfil||{}).profesion, g0 = txtGuia(guiaSalarial(PROF_RE[rp0] ? rp0 : null, null), rp0); return g0 || 'Ninguna oferta publicada indica salario todavía.'; }
  var d = S.perfil && S.perfil.disc;
  l = l.slice().sort(function(a,b){ return (encaje(d,b)||0) - (encaje(d,a)||0); }).slice(0,4);
  var rolP = (S.perfil||{}).profesion, gs = txtGuia(guiaSalarial(PROF_RE[rolP] ? rolP : null, ((S.perfil||{}).geo||{}).prov), rolP);
  return (gs ? gs + '<br><br>' : '') + 'Lo que pagan las ofertas que más te encajan' + (hayReales() ? '' : ' (de ejemplo)') + ':<ol class="sei-ol">'
    + l.map(function(o){ return '<li><button class="sei-link" onclick="cerrarSeimian(); ir(\'oferta\',\''+esc(o.id)+'\')">'+esc(o.titulo)+'</button>: <b>'+esc(o.salario)+'</b></li>'; }).join('')
    + '</ol>Todas las clínicas de CERCO tienen que indicar el salario antes de la entrevista. En la entrevista no te pueden preguntar cuánto cobrabas antes.';
}
function seiDisc(d){
  var n = d.norm;
  return 'Eres <b>' + NOMBRE[d.dom] + '</b> con rasgo ' + NOMBRE[d.sec].toLowerCase() + '. ' + DESC[d.dom]
    + '<br><br>En tu test: ' + LETRAS.slice().sort(function(a,b){ return n[b]-n[a]; }).map(function(k){ return NOMBRE[k] + ' ' + n[k] + ' %'; }).join(' · ') + '.'
    + '<br><br>En un equipo dental sueles aportar ' + APORTA[d.dom] + '. Te encajan mejor las ofertas que buscan ' + NOMBRE[d.dom].toLowerCase() + ' o ' + NOMBRE[d.sec].toLowerCase() + '.'
    + '<br><br><span style="color:#6B7280;">No es una etiqueta fija: si crees que no te refleja, repite el test desde Mi perfil.</span>';
}

/* ================================================================
   CITA, MENSAJES Y CONTRATACIÓN (lo que te manda la clínica)
   ================================================================ */
var DIAS_C = ['domingo','lunes','martes','miércoles','jueves','viernes','sábado'];
var MESES_C = ['enero','febrero','marzo','abril','mayo','junio','julio','agosto','septiembre','octubre','noviembre','diciembre'];
var MODO_C = { video:'Videollamada', clinica:'En la clínica', tel:'Por teléfono' };
function fechaCitaC(iso){
  var d = new Date(iso); if(isNaN(d)) return '';
  var t = DIAS_C[d.getDay()] + ' ' + d.getDate() + ' de ' + MESES_C[d.getMonth()] + ', a las ' + String(d.getHours()).padStart(2,'0') + ':' + String(d.getMinutes()).padStart(2,'0');
  return t.charAt(0).toUpperCase() + t.slice(1);
}
Nube.cambiar = function(s, campos){
  var c = Object.assign({}, campos, { actualizado: new Date().toISOString() });
  return this.db().collection('candidaturas').doc(s.id).update(c).then(function(){ Object.assign(s, c); return c; });
};

/* ---------- mensajes ---------- */
function vistosC(){ try{ return JSON.parse(localStorage.getItem('cerco_c_vistos_' + Nube.uid) || '{}'); }catch(e){ return {}; } }
function marcarVistosC(s){ var v = vistosC(); v[s.id] = (s.mensajes || []).length; try{ localStorage.setItem('cerco_c_vistos_' + Nube.uid, JSON.stringify(v)); }catch(e){} }
function sinLeerC(s){ var v = vistosC()[s.id] || 0; return (s.mensajes || []).slice(v).filter(function(x){ return x.de === 'clinica'; }).length; }
function pendientesC(){
  var n = 0;
  S.sols.forEach(function(s){ n += sinLeerC(s); if(s.estado === 'entrevista' && s.cita && s.cita.estado === 'propuesta') n++; });
  return n;
}
function bloqueMensajesC(s){
  if(s.estado === 'retirada') return '';
  var m = s.mensajes || [];
  return '<div class="card"><h3>'+svg('msg','currentColor',16)+'Mensajes con '+esc(s.clinicaNombre||'la clínica')+'</h3>'
    + '<div class="msgs" id="sd-msgs">'
    + (m.length ? m.map(function(x){ var yo = x.de === 'candidato'; return '<div class="msg'+(yo?' yo':'')+'">'+esc(x.t)+'<small>'+esc(cuando(x.f))+'</small></div>'; }).join('')
               : '<div class="msg-vacio">Todavía no os habéis escrito. Si tienes una duda sobre el puesto, pregúntala aquí: la clínica la recibe en CERCO.</div>')
    + '</div>'
    + '<form class="msg-in" onsubmit="event.preventDefault(); enviarMensajeC(\''+esc(s.id)+'\')"><input class="inp" id="sd-msg-in" maxlength="600" placeholder="Escribe a la clínica…" aria-label="Mensaje para la clínica"><button class="btn btn-p" type="submit">Enviar</button></form></div>';
}
function enviarMensajeC(id){
  var s = buscarSol(id), i = $('sd-msg-in'); if(!s || !i) return;
  var t = (i.value || '').trim(); if(!t || !unaVez('msgC', 600)) return;
  var m = (s.mensajes || []).concat([{de:'candidato', t:t.slice(0,600), f:new Date().toISOString()}]).slice(-100);
  i.value = '';
  Nube.cambiar(s, {mensajes: m}).then(function(){ marcarVistosC(s); pintarSolicitud(); setTimeout(function(){ var b = $('sd-msgs'); if(b) b.scrollTop = b.scrollHeight; var ii = $('sd-msg-in'); if(ii) try{ ii.focus({preventScroll:true}); }catch(e){} }, 30); })
    .catch(function(){ i.value = t; toast('No se ha podido enviar. Revisa tu conexión.'); });
}

/* ---------- la cita ---------- */
/* Archivo .ics: lo abren Apple Calendar, Outlook y casi cualquier calendario */
function icsCitaC(id){
  var s = buscarSol(id); if(!s || !s.cita) return;
  var t = s.cita, d = new Date(t.fecha), f = new Date(d.getTime() + 45*60000);
  var z = function(x){ return x.toISOString().replace(/[-:]/g,'').replace(/\.\d{3}/,''); };
  var lim = function(x){ return String(x || '').replace(/\\/g,'\\\\').replace(/[,;]/g, function(m){ return '\\' + m; }).replace(/\n/g,'\\n'); };
  var txt = ['BEGIN:VCALENDAR','VERSION:2.0','PRODID:-//CERCO//Entrevistas//ES','CALSCALE:GREGORIAN','METHOD:PUBLISH','BEGIN:VEVENT',
    'UID:' + s.id + '-' + (t.v || 1) + '@cerco', 'DTSTAMP:' + z(new Date()), 'DTSTART:' + z(d), 'DTEND:' + z(f),
    'SUMMARY:' + lim((esVisita(s) ? 'Visita a ' : 'Entrevista en ') + (s.clinicaNombre || 'la clínica')),
    'DESCRIPTION:' + lim((s.ofertaTitulo || '') + (t.sala ? '\nSala: ' + t.sala : '')),
    'LOCATION:' + lim(t.lugar || (t.modo === 'video' ? (t.sala || 'Videollamada') : 'Por teléfono')),
    'BEGIN:VALARM','TRIGGER:-PT1H','ACTION:DISPLAY','DESCRIPTION:Recordatorio de tu entrevista','END:VALARM',
    'END:VEVENT','END:VCALENDAR'].join('\r\n');
  var a = document.createElement('a'); a.href = URL.createObjectURL(new Blob([txt], {type:'text/calendar;charset=utf-8'}));
  a.download = 'entrevista-cerco.ics'; document.body.appendChild(a); a.click(); a.remove();
  toast('Ábrelo y se añadirá a tu calendario, con un aviso una hora antes.');
}
function enlaceCalendario(s){
  var t = s.cita, d = new Date(t.fecha), f = new Date(d.getTime() + 45*60000);
  var z = function(x){ return x.toISOString().replace(/[-:]/g,'').replace(/\.\d{3}/,''); };
  var q = 'action=TEMPLATE&text=' + encodeURIComponent((esVisita(s) ? 'Visita a ' : 'Entrevista en ') + (s.clinicaNombre || 'la clínica'))
    + '&dates=' + z(d) + '/' + z(f) + '&details=' + encodeURIComponent((s.ofertaTitulo || '') + (t.sala ? '\nSala: ' + t.sala : ''))
    + '&location=' + encodeURIComponent(t.lugar || (t.modo === 'video' ? 'Videollamada' : 'Por teléfono'));
  return 'https://calendar.google.com/calendar/render?' + q;
}
function bloqueCitaC(s){
  var t = s.cita; if(!t) return '';
  var pasada = new Date(t.fecha) < new Date(Date.now() - 3600000);
  var h = '<div class="card cita'+(t.estado === 'confirmada' ? ' ok' : (t.estado === 'cambio' ? ' cambio' : ''))+'">'
    + '<div class="eyebrow">'+(esVisita(s) ? 'TU VISITA' : 'TU ENTREVISTA')+(pasada ? ' · YA PASÓ' : '')+'</div>'
    + '<div class="cita-f">'+esc(fechaCitaC(t.fecha))+'</div>'
    + '<div class="cita-m">'+svg(t.modo === 'video' ? 'video' : (t.modo === 'tel' ? 'phone' : 'pin'), '#4B5563', 15)+esc(MODO_C[t.modo] || '')+(t.lugar ? ' · ' + esc(t.lugar) : '')
    + (t.modo === 'tel' ? ' · te llamarán al ' + esc((S.perfil||{}).telefono || 'teléfono de tu perfil') : '') + '</div>';
  if(t.modo === 'video' && t.sala) h += '<a class="btn btn-p cita-sala" href="'+esc(t.sala)+'" target="_blank" rel="noopener">'+svg('video','#fff',16)+'Entrar en la sala</a><div class="hint" style="margin:6px 0 0;">Se abre en el navegador, sin instalar nada. Entra un par de minutos antes.</div>';
  if(!pasada){
    if(t.estado === 'propuesta')
      h += '<div class="cita-acts"><button class="btn btn-p" id="cita-si" onclick="confirmarCita(\''+esc(s.id)+'\')">'+svg('check','#fff',16)+'Confirmo que voy</button><button class="btn btn-s" onclick="pedirOtroDia(\''+esc(s.id)+'\')">Necesito otro día</button></div>'
      + '<div class="hint" style="margin:8px 0 0;">Cuando confirmes, podrás apuntarla en tu calendario del móvil (Google, Apple u Outlook) con un toque.</div>';
    else if(t.estado === 'confirmada')
      h += '<div class="cita-est">'+svg('check','#0E9F6E',16)+'<span>Has confirmado. La clínica ya lo sabe.</span></div><div class="cita-acts"><a class="btn btn-s" href="'+esc(enlaceCalendario(s))+'" target="_blank" rel="noopener">'+svg('cal','currentColor',15)+'Google Calendar</a><button class="btn btn-s" onclick="icsCitaC(\''+esc(s.id)+'\')">'+svg('cal','currentColor',15)+'Apple u Outlook</button><button class="btn btn-g" onclick="pedirOtroDia(\''+esc(s.id)+'\')">Necesito cambiarla</button></div>';
    else if(t.estado === 'cambio')
      h += '<div class="cita-est camb">'+svg('clock','#8A5A00',16)+'<span>Has pedido otro día'+(t.msgCambio ? ': «' + esc(t.msgCambio) + '»' : '')+'. Esperando a que la clínica te proponga uno nuevo.</span></div>';
  }
  return h + '<div id="cita-cambio"></div></div>';
}
function confirmarCita(id){
  var s = buscarSol(id); if(!s || !s.cita || !unaVez('citaOk', 1200)) return;
  bloquear('cita-si', 'Confirmando…');
  var c = Object.assign({}, s.cita, { estado:'confirmada', msgCambio:'' });
  Nube.cambiar(s, {cita: c}).then(function(){ toast('Confirmado. ' + (s.clinicaNombre || 'La clínica') + ' ya lo sabe.'); refrescar(); })
    .catch(function(){ bloquear('cita-si'); toast('No se ha podido confirmar. Revisa tu conexión.'); });
}
function pedirOtroDia(id){
  var box = $('cita-cambio'); if(!box) return;
  box.innerHTML = '<div class="field" style="margin:14px 0 8px;"><label for="cita-alt">¿Qué días y horas te van bien?</label><textarea class="inp" id="cita-alt" maxlength="300" placeholder="Ej: cualquier tarde a partir de las 16:00, o el viernes por la mañana"></textarea></div>'
    + '<div class="err" id="cita-err"></div><div class="cita-acts"><button class="btn btn-s" onclick="pintarSolicitud()">Cancelar</button><button class="btn btn-p" id="cita-alt-ok" onclick="enviarOtroDia(\''+esc(id)+'\')">Enviar a la clínica</button></div>';
  try{ $('cita-alt').focus(); }catch(e){}
}
function enviarOtroDia(id){
  var s = buscarSol(id); if(!s || !s.cita) return;
  var t = val('cita-alt'); if(t.length < 4) return error('cita-err', 'Dinos qué días te van bien.');
  if(!unaVez('citaAlt', 1200)) return;
  bloquear('cita-alt-ok', 'Enviando…');
  var c = Object.assign({}, s.cita, { estado:'cambio', msgCambio:t.slice(0,300) });
  Nube.cambiar(s, {cita: c}).then(function(){ toast('Enviado. La clínica te propondrá otro día.'); refrescar(); })
    .catch(function(){ bloquear('cita-alt-ok'); error('cita-err', 'No se ha podido enviar. Revisa tu conexión.'); });
}

pintarIconos();
arrancar();
