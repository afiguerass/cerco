/* Cuentas: registro, inicio de sesión y recuperar contraseña.
   Parte del antiguo clinica/01-panel.js (Fase 1, paso 1.6b). El orden de carga
   importa: los archivos 01a…01i se cargan uno detrás de otro, como antes. */
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

/* ================= LOS DATOS DEL NAVEGADOR SON DE UNA SOLA CUENTA =================
   Todo lo que la clínica guarda en el navegador queda marcado con su cuenta
   (cerco_datos_uid). Si se registra o entra otra cuenta en el mismo navegador, antes de
   nada se guarda una copia de lo de la cuenta anterior (cerco_copia_<cuenta>) y se
   empieza con el navegador vacío: ninguna cuenta ve ni hereda datos de otra. Si la cuenta
   anterior vuelve a entrar en este navegador, se le devuelve su copia (y encima, lo de la
   nube). Lo del lado del profesional no se toca: ya va separado por cuenta. */
var CERCO_CLAVES_CLINICA = ['cerco_empresa', 'cerco_equipo', 'cerco_ofertas', 'cerco_plantilla', 'cerco_demo', 'cerco_alta',
  'cerco_disc_empresa', 'cerco_disc_individual', 'cerco_disc_empresa_pendiente', 'cerco_disc_empresa_uid',
  'cerco_candidaturas', 'cerco_acogida', 'cerco_cand_guardados', 'cerco_valoraciones', 'cerco_msg_vistos',
  'cerco_entrevista_link', 'cerco_entrevista_modo', 'cerco_entrevista_propio', 'cerco_mensaje_entrevista',
  'cerco_sala_entrevista', 'cerco_cuenta', 'cerco_sesion'];
var CERCO_K_DUENO_DATOS = 'cerco_datos_uid';
// Prepara el navegador para la cuenta que entra. Devuelve true si había datos de otra cuenta.
// cuenta: el uid de Firebase (o, sin conexión, «correo:» + correo). nueva: si se acaba de crear.
window.CERCO_datosParaCuenta = function(cuenta, email, nueva){
  if(!cuenta) return false;
  var ls = window.localStorage, leer = function(k){ try{ return ls.getItem(k); }catch(x){ return null; } };
  var hay = CERCO_CLAVES_CLINICA.some(function(k){ return k !== 'cerco_sesion' && leer(k) !== null; });
  var dueno = leer(CERCO_K_DUENO_DATOS), cu = null;
  try{ cu = JSON.parse(leer('cerco_cuenta') || 'null'); }catch(x){}
  var mios;
  if(!hay) mios = true;
  else if(dueno) mios = dueno === cuenta;
  else if(nueva) mios = false;                                  // una cuenta recién creada no hereda nada
  else mios = !(cu && cu.email && email && cu.email !== String(email).toLowerCase());   // datos de antes, sin marcar
  if(!mios){
    // 1. copia de lo de la cuenta anterior (las solicitudes no: están en la nube y ocupan mucho)
    var copia = {};
    CERCO_CLAVES_CLINICA.forEach(function(k){ var v = leer(k); if(v !== null && k !== 'cerco_candidaturas' && k !== 'cerco_sesion') copia[k] = v; });
    var nombre = 'cerco_copia_' + (dueno || (cu && cu.email ? 'correo:' + cu.email : 'sin-cuenta'));
    try{ ls.setItem(nombre, JSON.stringify({ fecha:new Date().toISOString(), datos:copia })); }catch(x){}
    // 2. el navegador, vacío para la cuenta que entra
    try{ if(window.CERCO_soltarCandidaturas) CERCO_soltarCandidaturas(); }catch(x){}
    CERCO_CLAVES_CLINICA.forEach(function(k){ try{ ls.removeItem(k); }catch(x){} });
  }
  if(!mios || !hay){
    // 3. si esta cuenta ya había usado este navegador, recupera su copia
    var suya = leer('cerco_copia_' + cuenta) || (email ? leer('cerco_copia_correo:' + String(email).toLowerCase()) : null);
    if(suya){
      try{ var d = JSON.parse(suya).datos || {}; Object.keys(d).forEach(function(k){ if(CERCO_CLAVES_CLINICA.indexOf(k) > -1) ls.setItem(k, d[k]); }); }catch(x){}
    }
  }
  try{ ls.setItem(CERCO_K_DUENO_DATOS, cuenta); }catch(x){}
  if(!mios){ try{ CDB.renderTodo(); }catch(x){} }
  return !mios;
};

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
  if(!window.Nube){ CERCO_datosParaCuenta('correo:' + e.toLowerCase(), e, true); return seguir(); }
  // Primero preguntamos a Firebase: si el correo ya tiene cuenta, no fingimos que se ha creado
  if(btnR){ btnR.__txt = btnR.textContent; btnR.disabled = true; btnR.textContent = 'Creando tu cuenta…'; }
  if(err){ err.style.color = '#6B7280'; err.textContent = 'Creando tu cuenta…'; }
  Nube.registrar(e, p1).then(function(){
    if(err){ err.style.color = '#0E9F6E'; err.textContent = ''; }
    var u = null; try{ u = firebase.auth().currentUser; }catch(x){}
    CERCO_datosParaCuenta(u ? u.uid : 'correo:' + e.toLowerCase(), e, true);
    seguir();
    setTimeout(function(){ _subirClinica(); }, 600);
  }).catch(function(x){
    var c = (x && x.code) || x || '';
    if(btnR){ btnR.disabled = false; btnR.textContent = btnR.__txt || 'Crear cuenta'; }
    if(err) err.style.color = '';
    if(c === 'sin-nube'){ CERCO_datosParaCuenta('correo:' + e.toLowerCase(), e, true); return seguir(); }
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
    var seguir = function(registrada){
      if(btn){ btn.disabled = false; btn.textContent = 'Iniciar sesión'; }
      if(registrada){
        showScreen('inicio');
        var q = ((CAuth.cuenta()||{}).nombre||'').split(/\s+/)[0];
        if(typeof showToast === 'function') showToast(q ? ('Hola de nuevo, ' + q) : 'Sesión iniciada');
      } else {
        showScreen('benvinguda');
      }
    };
    // Desde un navegador que aún no conoce la clínica, se pregunta a la nube antes de
    // enseñar la bienvenida (clinica/01h-nube.js)
    if(CDB.registrado() || !window.CERCO_clinicaDeLaNube) return seguir(CDB.registrado());
    if(btn){ btn.disabled = true; btn.textContent = 'Recuperando tus datos…'; }
    CERCO_clinicaDeLaNube().then(function(r){ try{ CDB.renderTodo(); }catch(x){} seguir(r); });
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
    // Si este navegador tenía datos de otra cuenta, se guarda una copia y se empieza vacío
    var u = null; try{ u = firebase.auth().currentUser; }catch(x){}
    if(u) CERCO_datosParaCuenta(u.uid, e, false);
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
  CERCO_datosParaCuenta(u.uid, u.email || '', false);
  try {
    CAuth.crearExterno(u.displayName || (u.email||'').split('@')[0], u.email || '');
    var d = CDB.clinica();
    if(!d.nomResp && u.displayName) d.nomResp = u.displayName;
    if(!d.email && u.email) d.email = u.email;
    localStorage.setItem(CDB.K.emp, JSON.stringify(d));
    if(typeof applyUserName === 'function' && u.displayName) applyUserName(u.displayName);
    CDB.setDemo(false); CDB.renderTodo();
  } catch(e){}
  var seguir = function(registrada){
    if(registrada){
      showScreen('inicio');
      var q = (u.displayName || '').split(/\s+/)[0];
      if(typeof showToast === 'function') showToast(q ? ('Hola, ' + q) : 'Sesión iniciada con Google');
    } else {
      showScreen('benvinguda');
      if(typeof showToast === 'function') showToast('Cuenta creada con Google. Ahora configuramos tu clínica.');
    }
  };
  // Desde un navegador que aún no conoce la clínica, se pregunta a la nube antes (clinica/01h-nube.js)
  if(CDB.registrado() || !window.CERCO_clinicaDeLaNube) return seguir(CDB.registrado());
  CERCO_clinicaDeLaNube().then(function(r){ try{ CDB.renderTodo(); }catch(x){} seguir(r); });
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
