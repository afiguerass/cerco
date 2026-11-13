/* Nube (Firebase): guardar y leer los datos de la clínica, y enganche de la app con la nube.
   Parte del antiguo clinica/01-panel.js (Fase 1, paso 1.6b). El orden de carga
   importa: los archivos 01a…01i se cargan uno detrás de otro, como antes. */
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
    }).then(function(ok){
      // y la lista de municipios (comun/geo.js), para que los km salgan desde el principio
      return (window.CGeo && CGeo.listo ? CGeo.listo : Promise.resolve()).then(function(){ return ok; });
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

  /* --- test DISC de la responsable de la clínica: también en la nube (antes solo en el navegador) --- */
  guardarMiDisc: function(m){
    var r = this.refClinica();
    if(!r || !m || !m.dominant) return Promise.resolve(false);
    var d = { dominant:m.dominant, secondary:m.secondary || null, norm:m.norm || null, guardado:new Date().toISOString() };
    return r.set({ discResponsable:d }, {merge:true}).then(function(){ return true; }).catch(function(){ return false; });
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
    // quien se contrató en CERCO (clinica/04-clinica-y-candidato.js)
    if(m.origen === 'cerco'){ doc.origen = 'cerco'; doc.candidaturaId = String(m.candidaturaId || '').slice(0,200); }
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

  /* El test DISC de la responsable (clinicas/{uid}.discResponsable).
     - Si en este navegador hay un test que aún no está en la nube (clínicas de antes,
       o una subida que falló), se sube tal cual: los resultados no cambian.
     - Si la nube lo tiene y este navegador no (otro ordenador, o tras cerrar sesión),
       se trae de la nube. */
  var K_PEND = 'cerco_disc_empresa_pendiente', K_DUENO = 'cerco_disc_empresa_uid';
  function leer(k){ try{ return localStorage.getItem(k); }catch(e){ return null; } }
  function poner(k, v){ try{ if(v === null) localStorage.removeItem(k); else localStorage.setItem(k, v); }catch(e){} }
  // Sube el test de este navegador, que es de la cuenta que ha entrado (lo llama quien lo sabe)
  window.CERCO_subirMiDisc = function(){
    var m = null; try{ m = CDB.miDisc(); }catch(e){}
    if(!m || !m.dominant) return Promise.resolve(false);
    poner(K_PEND, '1');
    if(!Nube.activa || !Nube.uid) return Promise.resolve(false);
    poner(K_DUENO, Nube.uid);
    return Nube.guardarMiDisc(m).then(function(ok){ if(ok) poner(K_PEND, null); return ok; });
  };
  function mismoNombre(c){
    var a = '', b = '';
    try{ a = (CDB.clinica().nom || '').trim().toLowerCase(); b = ((c && c.nom) || '').trim().toLowerCase(); }catch(e){}
    return !!a && a === b;
  }
  // Se llama al entrar, con la ficha de la nube y ANTES de mezclarla con lo de este navegador
  window.CERCO_sincronizarMiDisc = function(c){
    if(!Nube.uid) return;
    var local = null; try{ local = CDB.miDisc(); }catch(e){}
    if(local && !local.dominant) local = null;
    var nube = c && c.discResponsable && c.discResponsable.dominant ? c.discResponsable : null;
    var dueno = leer(K_DUENO), pendiente = !!leer(K_PEND);
    // ¿De quién es el test de este navegador? Marcado: de esa cuenta. Sin marcar (clínicas
    // de antes): de esta cuenta si el nombre de la clínica coincide con el de la nube.
    var mio = local ? (dueno ? dueno === Nube.uid : mismoNombre(c)) : false;
    if(local && dueno && dueno !== Nube.uid){
      // test de otra cuenta que usó este navegador: no se sube; se guarda una copia y se deja de mostrar
      poner('cerco_disc_empresa_de_' + dueno, JSON.stringify(local));
      poner(CDB.K.me, null); poner(K_PEND, null); poner(K_DUENO, null);
      local = null;
    }
    if(local && !mio && !dueno && nube){
      // sin marcar y de otra clínica (el nombre no coincide), y esta cuenta ya tiene el suyo en la nube
      poner('cerco_disc_empresa_de_otra', JSON.stringify(local));
      local = null;
    }
    if(local && mio && (!nube || pendiente)){ window.CERCO_subirMiDisc(); return; }
    if(nube && (!local || mio)){
      // el de la nube manda: se trae a este navegador (otro ordenador, o el mismo tras cerrar sesión)
      poner(CDB.K.me, JSON.stringify({ dominant:nube.dominant, secondary:nube.secondary, norm:nube.norm }));
      poner(K_DUENO, Nube.uid);
    }
  };

  /* Traer lo que hay en la nube a este dispositivo */
  window._bajarDeLaNube = function(){
    if(!Nube.activa) return;
    Nube.leerClinica().then(function(c){
      try{ CERCO_sincronizarMiDisc(c); }catch(e){}
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
