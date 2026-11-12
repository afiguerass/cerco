/* Archivo sacado tal cual de index.html (Fase 1, paso 1.6). El orden de carga
   importa: se carga en el mismo sitio de la página donde estaba. */
/* ================================================================
   CERCO · SALARIO OBLIGATORIO Y PÁGINA PÚBLICA DE LA CLÍNICA
   - Cada oferta lleva una franja de salario (ley europea de
     transparencia salarial: el candidato debe saberlo antes de la
     entrevista).
   - La clínica completa lo que verán los candidatos: cómo es un día,
     ventajas, fotos y el perfil del equipo en conjunto (solo con 3 o
     más tests, para que no se pueda identificar a nadie).
   ================================================================ */
(function(){
  /* ---------- salario en franja ---------- */
  function num(v){ var n = parseInt(String(v||'').replace(/[^\d]/g,''), 10); return isNaN(n) ? 0 : n; }
  function miles(n){ return String(n).replace(/\B(?=(\d{3})+(?!\d))/g, '.'); }
  window._componerSalario = function(){
    var mi = num((document.getElementById('co-sal-min')||{}).value);
    var ma = num((document.getElementById('co-sal-max')||{}).value);
    var per = (document.getElementById('co-sal-per')||{}).value || 'año';
    if(!mi && !ma) return { error:'Indica el salario: la ley obliga a darlo antes de la entrevista.', foco:'co-sal-min' };
    if(!mi) mi = ma; if(!ma) ma = mi;
    if(ma < mi) return { error:'El máximo no puede ser menor que el mínimo.', foco:'co-sal-max' };
    var lim = { 'año':[6000, 250000], 'mes':[500, 20000], 'hora':[5, 200] }[per] || [1, 1e9];
    if(mi < lim[0] || ma > lim[1]) return { error:'Revisa el salario: ' + miles(mi) + ' € por ' + per + ' no parece correcto.', foco:'co-sal-min' };
    var txt = (mi === ma ? miles(mi) : miles(mi) + '–' + miles(ma)) + ' € brutos/' + per;
    return { texto:txt, min:mi, max:ma, per:per };
  };
  function llenarDesdeTexto(t){
    var m = String(t||'').replace(/\./g,'').match(/(\d+)\s*(?:[–-]\s*(\d+))?/);
    var per = /hora/.test(t) ? 'hora' : (/mes/.test(t) ? 'mes' : 'año');
    var a = document.getElementById('co-sal-min'), b = document.getElementById('co-sal-max'), c = document.getElementById('co-sal-per');
    if(a) a.value = m ? miles(num(m[1])) : '';
    if(b) b.value = m ? miles(num(m[2] || m[1])) : '';
    if(c) c.value = per;
  }
  // formato de miles mientras escribes
  ['co-sal-min','co-sal-max'].forEach(function(id){
    var el = document.getElementById(id);
    if(el) el.addEventListener('input', function(){ var n = num(el.value); el.value = n ? miles(n) : ''; });
  });

  var _submitOrig = window.submitNewOffer;
  window.submitNewOffer = function(){
    var err = document.getElementById('co-err');
    var titulo = ((document.getElementById('co-titulo')||{}).value||'').trim();
    var ubic = ((document.getElementById('co-ubicacion')||{}).value||'').trim();
    if(titulo && ubic){
      var s = _componerSalario();
      if(s.error){
        if(err){ err.textContent = s.error; if(window.verAviso) verAviso(err); }
        var f = document.getElementById(s.foco); if(f){ try{ f.focus({preventScroll:true}); }catch(x){} }
        return;
      }
      var hid = document.getElementById('co-salario'); if(hid) hid.value = s.texto;
    }
    var r = _submitOrig.apply(this, arguments);
    // después de publicar, el formulario queda limpio
    if(!window.__editandoOferta){ ['co-sal-min','co-sal-max'].forEach(function(id){ var e = document.getElementById(id); if(e && !(document.getElementById('co-titulo')||{}).value) e.value = ''; }); }
    return r;
  };
  var _editOrig = window.editarOferta;
  if(typeof _editOrig === 'function'){
    window.editarOferta = function(id){
      var r = _editOrig.apply(this, arguments);
      setTimeout(function(){ llenarDesdeTexto((document.getElementById('co-salario')||{}).value); }, 120);
      return r;
    };
  }

  /* ---------- página pública ---------- */
  var VENTAJAS = ['Formación pagada','Horario sin partir','Plan de carrera','Tecnología digital','Buen ambiente de equipo','Tratamiento dental gratis','Parking','Flexibilidad de turnos'];
  function pub(){ var c = {}; try{ c = CDB.clinica() || {}; }catch(x){} return c; }
  function guardarLocal(c){ try{ localStorage.setItem(CDB.K.emp, JSON.stringify(c)); }catch(x){ if(typeof showToast==='function') showToast('Las fotos no caben en este navegador. Prueba con menos.'); throw x; } }

  // Lo que se publica: nada que identifique a un miembro del equipo
  function docPublico(){
    var c = pub(), eq = null;
    try{
      var d = CDB.perfilQueFalta();
      eq = { personas: CDB.equipoCompleto().length, tests: d.tests, fiable: !!d.fiable };
      if(d.fiable){ eq.comp = d.comp; eq.falta = d.falta; }
    }catch(x){}
    return {
      nom: String(c.nom||'').slice(0,120), ciutat: String(c.ciutat||'').slice(0,80),
      descripcion: String(c.descripcion||'').slice(0,1200), dia: String(c.pubDia||'').slice(0,1200),
      ventajas: (c.pubVentajas||[]).slice(0,8), fotos: (c.pubFotos||[]).slice(0,4),
      web: String(c.web||'').slice(0,200), responsable: String(c.nomResp||'').split(/\s+/)[0] || '', responsableRol: String(c.rol||'').slice(0,40),
      equipo: eq, actualizado: new Date().toISOString()
    };
  }
  window._publicarClinica = function(){
    try{
      if(!Nube.activa) return Promise.resolve(false);
      var d = Nube.db(); if(!d) return Promise.resolve(false);
      return d.collection('clinicas_publicas').doc(Nube.uid).set(docPublico())
        .then(function(){ return true; }).catch(function(){ return false; });
    }catch(x){ return Promise.resolve(false); }
  };
  // Se publica también cuando cambian los datos o el equipo
  var _subC = window._subirClinica;
  window._subirClinica = function(){ try{ _subC && _subC(); }catch(x){} try{ _publicarClinica(); }catch(x){} };
  var _eqL = window._escucharEquipoEnDirecto;
  window._escucharEquipoEnDirecto = function(){ try{ _eqL && _eqL(); }catch(x){} setTimeout(function(){ try{ _publicarClinica(); }catch(x){} }, 3000); };

  function bloqueEditor(){
    var c = pub(), fotos = c.pubFotos || [], ven = c.pubVentajas || [];
    var h = '<div id="pub-editor" style="background:white;border:1px solid #C9D6F5;border-radius:16px;padding:18px;margin-bottom:14px;box-shadow:0 4px 14px rgba(26,86,219,.06);">'
      + '<div style="font-size:11px;letter-spacing:.5px;color:#1A56DB;font-weight:800;margin-bottom:4px;">LO QUE VERÁN LOS CANDIDATOS EN TUS OFERTAS</div>'
      + '<div style="font-size:13px;color:#6B7280;line-height:1.55;margin-bottom:14px;">Una clínica con fotos del equipo y una descripción de cómo se trabaja recibe candidatos que ya saben dónde van.</div>'
      + '<label style="display:block;font-size:13px;font-weight:700;color:#374151;margin-bottom:6px;" for="pub-dia">Cómo es un día en vuestro equipo</label>'
      + '<textarea id="pub-dia" maxlength="1200" placeholder="Ej: somos seis. Abrimos a las 9, repasamos la agenda juntos y cada higienista lleva sus pacientes. Los viernes cerramos a las 15:00." style="width:100%;box-sizing:border-box;min-height:96px;border:1px solid #E5E7EB;border-radius:10px;padding:11px 13px;font-size:14px;font-family:inherit;line-height:1.5;resize:vertical;">'+_esc(c.pubDia||'')+'</textarea>'
      + '<div style="font-size:13px;font-weight:700;color:#374151;margin:14px 0 8px;">Lo que ofrecéis</div>'
      + '<div id="pub-ven" style="display:flex;flex-wrap:wrap;gap:8px;">'
      + VENTAJAS.map(function(v){ var on = ven.indexOf(v) > -1; return '<button type="button" data-v="'+_esc(v)+'" aria-pressed="'+on+'" onclick="this.setAttribute(\'aria-pressed\', this.getAttribute(\'aria-pressed\')===\'true\'?\'false\':\'true\'); _pintaVen(this)" style="'+_estVen(on)+'">'+_esc(v)+'</button>'; }).join('')
      + '</div>'
      + '<div style="font-size:13px;font-weight:700;color:#374151;margin:16px 0 8px;">Fotos de la clínica y del equipo <span style="font-weight:500;color:#6B7280;">(hasta 4)</span></div>'
      + '<div id="pub-fotos" style="display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:8px;">';
    for(var i=0;i<4;i++){
      h += fotos[i]
        ? '<div style="position:relative;aspect-ratio:1;border-radius:10px;overflow:hidden;background:#F4F6F9;"><img src="'+fotos[i]+'" alt="Foto '+(i+1)+'" style="width:100%;height:100%;object-fit:cover;display:block;"><button type="button" onclick="_quitarFoto('+i+')" aria-label="Quitar foto" style="position:absolute;top:5px;right:5px;width:26px;height:26px;border-radius:50%;border:none;background:rgba(17,24,39,.7);color:white;cursor:pointer;font-size:15px;line-height:1;">×</button></div>'
        : '<label style="aspect-ratio:1;border-radius:10px;border:1.5px dashed #D1D5DB;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:4px;color:#6B7280;font-size:11.5px;font-weight:700;cursor:pointer;text-align:center;padding:4px;"><span style="font-size:20px;line-height:1;">+</span>Añadir<input type="file" accept="image/*" onchange="_subirFoto(this)" style="display:none;"></label>';
    }
    h += '</div>'
      + '<div style="font-size:11.5px;color:#6B7280;margin-top:8px;line-height:1.5;">Pide permiso a las personas que salgan en las fotos antes de subirlas.</div>'
      + '<div style="background:#F8F9FA;border-radius:10px;padding:11px 13px;margin-top:14px;font-size:12.5px;color:#4B5563;line-height:1.55;">'
      + 'El <b>perfil del equipo</b> se muestra en conjunto y solo cuando al menos 3 personas han hecho el test. Nunca aparecen nombres ni resultados individuales.</div>'
      + '<div id="pub-msg" style="font-size:12.5px;margin-top:10px;min-height:1px;"></div>'
      + '<button type="button" onclick="_guardarPublico()" style="width:100%;margin-top:8px;background:#1A56DB;color:white;border:none;border-radius:10px;padding:13px;font-size:14px;font-weight:800;cursor:pointer;font-family:inherit;">Guardar y publicar</button>'
      + '</div>';
    return h;
  }
  window._estVen = function(on){ return 'border:1px solid '+(on?'#1A56DB':'#E5E7EB')+';background:'+(on?'#1A56DB':'white')+';color:'+(on?'white':'#374151')+';border-radius:99px;padding:7px 13px;font-size:12.5px;font-weight:700;cursor:pointer;font-family:inherit;'; };
  window._pintaVen = function(b){ b.style.cssText = _estVen(b.getAttribute('aria-pressed') === 'true'); };
  function leerEditor(c){
    var t = document.getElementById('pub-dia'); if(t) c.pubDia = t.value.trim();
    c.pubVentajas = [].slice.call(document.querySelectorAll('#pub-ven button[aria-pressed="true"]')).map(function(b){ return b.getAttribute('data-v'); });
    return c;
  }
  window._subirFoto = function(inp){
    var f = inp.files && inp.files[0]; if(!f) return;
    if(!/^image\//.test(f.type)){ if(typeof showToast==='function') showToast('Elige una imagen (JPG o PNG).'); return; }
    var msg = document.getElementById('pub-msg'); if(msg){ msg.style.color = '#6B7280'; msg.textContent = 'Preparando la foto…'; }
    _reducirImagen(f, 900, function(url){
      var c = leerEditor(pub()); c.pubFotos = (c.pubFotos || []).concat([url]).slice(0,4);
      try{ guardarLocal(c); }catch(x){ return; }
      _pintarEditor();
      var m2 = document.getElementById('pub-msg'); if(m2){ m2.style.color = '#6B7280'; m2.textContent = 'Foto añadida. Pulsa "Guardar y publicar" para que la vean los candidatos.'; }
    });
  };
  window._quitarFoto = function(i){
    var c = leerEditor(pub()); c.pubFotos = (c.pubFotos || []).filter(function(_, k){ return k !== i; });
    guardarLocal(c); _pintarEditor();
  };
  window._guardarPublico = function(){
    if(!window._unaSolaVez('pubG', 1200)) return;
    var c = leerEditor(pub()); guardarLocal(c);
    var msg = document.getElementById('pub-msg');
    if(!Nube.activa){ if(msg){ msg.style.color = '#8A5A00'; msg.textContent = 'Guardado en este dispositivo. Se publicará cuando haya conexión.'; } return; }
    if(msg){ msg.style.color = '#6B7280'; msg.textContent = 'Publicando…'; }
    _publicarClinica().then(function(ok){
      if(msg){ msg.style.color = ok ? '#0E9F6E' : '#DC2626'; msg.textContent = ok ? 'Publicado. Los candidatos ya lo ven en tus ofertas.' : 'No se ha podido publicar. Revisa tu conexión y vuelve a pulsar.'; }
      if(ok && typeof showToast === 'function') showToast('Página de la clínica publicada');
    });
  };
  window._pintarEditor = function(){
    var real = document.getElementById('publicat-real'); if(!real) return;
    var ant = document.getElementById('pub-editor');
    var tmp = document.createElement('div'); tmp.innerHTML = bloqueEditor();
    var nuevo = tmp.firstChild;
    if(ant) ant.parentNode.replaceChild(nuevo, ant);
    else {
      // justo debajo de la cabecera de la clínica
      var primero = real.firstChild;
      if(primero && primero.nextSibling) real.insertBefore(nuevo, primero.nextSibling); else real.appendChild(nuevo);
    }
  };
  var _ppOrig = window._pintarPerfilPublico;
  if(typeof _ppOrig === 'function'){
    window._pintarPerfilPublico = function(){
      // lo que estabas escribiendo no se pierde si la pantalla se repinta
      try{ if(document.getElementById('pub-editor')) guardarLocal(leerEditor(pub())); }catch(x){}
      var r = _ppOrig.apply(this, arguments);
      try{ var demo = CDB.demo(); if(!demo) _pintarEditor(); }catch(x){}
      return r;
    };
  }

  /* ---------- tu propia tasa de respuesta, en Candidatos ---------- */
  var _rpOrig = window.renderPortalReal;
  window.renderPortalReal = function(){
    var r; try{ r = _rpOrig && _rpOrig.apply(this, arguments); }catch(x){}
    try{
      if(CDB.demo()) return r;
      var l = (window.CERCO_candidaturas ? CERCO_candidaturas() : []).filter(function(c){ return c.estado !== 'retirada'; });
      var ahora = Date.now(), resp = 0, eval_ = 0;
      l.forEach(function(c){
        var h = c.historial || [], f = null;
        h.forEach(function(x){ if(!f && (x.estado === 'entrevista' || x.estado === 'descartada')) f = x.fecha; });
        if(f){ resp++; eval_++; } else if(ahora - new Date(c.fecha) > 72*3600000) eval_++;
      });
      var sub = document.getElementById('portal-sub');
      if(sub && eval_ >= 3){
        var pct = Math.round(resp/eval_*100);
        sub.innerHTML = _esc(sub.textContent) + ' · <span style="color:'+(pct>=80?'#0E9F6E':'#B42318')+';font-weight:700;">Respondes al ' + pct + ' %</span>'
          + ' <span style="color:#6B7280;">(lo ven los candidatos)</span>';
      }
    }catch(x){}
    return r;
  };
  try{ CDB.renderTodo(); }catch(x){}
})();
