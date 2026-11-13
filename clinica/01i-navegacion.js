/* Comportamiento de la app (tecla Intro, botón atrás del móvil) y navegación entre pantallas (showScreen).
   Parte del antiguo clinica/01-panel.js (Fase 1, paso 1.6b). El orden de carga
   importa: los archivos 01a…01i se cargan uno detrás de otro, como antes. */
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
  // Si la lista de municipios (comun/geo.js) aún no había llegado, se vuelve a
  // pintar cuando llega, para que los km salgan igual que antes.
  try{ if(!window.CERCO_MUNICIPIOS && window.CGeo && CGeo.listo) CGeo.listo.then(function(){ try{ CDB.renderTodo(); }catch(e){} }); }catch(e){}
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
