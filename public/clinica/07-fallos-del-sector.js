/* Archivo sacado tal cual de index.html (Fase 1, paso 1.6). El orden de carga
   importa: se carga en el mismo sitio de la página donde estaba. */
/* ================================================================
   CERCO · LO QUE FALLA EN EL SECTOR, RESUELTO AQUÍ (lado clínica)
   - Plazos en días laborables y modo vacaciones (el candidato lo ve).
   - Verificación de la clínica: CIF y registro sanitario.
   - Ofertas que no discriminan: aviso antes de publicar.
   - Mensajes sin preguntas prohibidas.
   - Ofertas que no se quedan abiertas para siempre.
   - Denunciar un perfil falso o un trato inadecuado.
   ================================================================ */
(function(){
  var e = function(t){ return _esc(t); };
  function db(){ try{ return Nube.db(); }catch(x){ return null; } }
  function uid(){ return (window.Nube && Nube.uid) || null; }
  function enDemo(){ try{ return CDB.demo(); }catch(x){ return true; } }
  function clinica(){ try{ return CDB.clinica() || {}; }catch(x){ return {}; } }
  function guardarClinica(c){ try{ localStorage.setItem(CDB.K.emp, JSON.stringify(c)); }catch(x){} }
  function lista(){ try{ return (window.CERCO_candidaturas ? CERCO_candidaturas() : []); }catch(x){ return []; } }
  function hoyIso(){ return new Date().toISOString().slice(0,10); }
  function fechaCorta(iso){ var d = new Date(iso + 'T12:00:00'); return isNaN(d) ? '' : d.getDate() + ' de ' + ['enero','febrero','marzo','abril','mayo','junio','julio','agosto','septiembre','octubre','noviembre','diciembre'][d.getMonth()]; }

  /* ---------- 1. días laborables y vacaciones ---------- */
  function horasHabiles(desde){
    var t = new Date(desde).getTime(), fin = Date.now(), n = 0;
    if(isNaN(t) || fin <= t) return 0;
    for(var x = t, tope = Math.min(fin, t + 90*86400000); x < tope; x += 3600000){ var d = new Date(x).getDay(); if(d !== 0 && d !== 6) n++; }
    return n;
  }
  window._enVacaciones = function(){ var v = clinica().vacacionesHasta; return v && v >= hoyIso() ? v : null; };
  // horas laborables que lleva esperando un candidato (desde la vuelta de vacaciones, si las hubo)
  window._hHab = function(c, desde){
    if(window._enVacaciones()) return 0;
    var u = desde || c.fecha, v = clinica().vacacionesHasta;
    if(v){ var f = new Date(v + 'T23:59:59').toISOString(); if(f > u && f < new Date().toISOString()) u = f; }
    return horasHabiles(u);
  };
  function publicarVacaciones(){
    var d = db(); if(!d || !uid()) return;
    d.collection('clinicas_publicas').doc(uid()).set({ vacacionesHasta: clinica().vacacionesHasta || '' }, {merge:true}).catch(function(){});
  }
  var _pubOrig = window._publicarClinica;
  window._publicarClinica = function(){ var r; try{ r = _pubOrig && _pubOrig.apply(this, arguments); }catch(x){} setTimeout(publicarVacaciones, 1500); return r; };
  window.guardarVacaciones = function(){
    var v = (document.getElementById('vac-hasta')||{}).value || '';
    if(v && v < hoyIso()){ if(typeof showToast === 'function') showToast('Elige una fecha de hoy en adelante.'); return; }
    var c = clinica(); c.vacacionesHasta = v; guardarClinica(c); publicarVacaciones();
    if(typeof showToast === 'function') showToast(v ? 'Plazos en pausa hasta el ' + fechaCorta(v) + '. Los candidatos lo ven en tus ofertas.' : 'Plazos reactivados.');
    try{ CDB.renderTodo(); }catch(x){}
  };

  /* ---------- 2. verificación de la clínica ---------- */
  var V = { estado:null, sub:null };
  function escucharVerificacion(){
    if(V.sub || !db() || !uid()) return;
    try{
      V.sub = db().collection('verificaciones').doc(uid()).onSnapshot(function(d){ var ok = d.exists && !!d.data().verificada; if(V.estado !== ok){ V.estado = ok; try{ renderInicioReal(); }catch(x){} } }, function(){ V.estado = false; });
    }catch(x){}
  }
  function cifValido(t){ return /^[A-HJNP-SUVW]\d{7}[0-9A-J]$|^\d{8}[A-Z]$|^[XYZ]\d{7}[A-Z]$/i.test(String(t||'').replace(/[\s.-]/g,'')); }
  window.pedirVerificacion = function(){
    var cif = ((document.getElementById('ver-cif')||{}).value || '').replace(/[\s.-]/g,'').toUpperCase(), reg = ((document.getElementById('ver-reg')||{}).value || '').trim();
    var err = document.getElementById('ver-err');
    if(!cifValido(cif)){ if(err) err.textContent = 'Ese CIF o NIF no parece correcto. Revísalo.'; return; }
    if(reg.length < 4){ if(err) err.textContent = 'Escribe el número de registro sanitario del centro (lo tienes en la autorización de tu comunidad autónoma).'; return; }
    if(err) err.textContent = '';
    var c = clinica(); c.cif = cif; c.registroSanitario = reg.slice(0,40); c.verifPedida = new Date().toISOString(); guardarClinica(c);
    db().collection('solicitudes_verificacion').doc(uid()).set({ cif:cif, registro:reg.slice(0,40), nom:String(c.nom||'').slice(0,120), ciutat:String(c.ciutat||'').slice(0,80), fecha:c.verifPedida })
      .then(function(){ if(typeof showToast === 'function') showToast('Enviado. Lo revisa una persona de CERCO; te aparecerá la insignia «Clínica verificada».'); try{ renderInicioReal(); }catch(x){} })
      .catch(function(){ if(err) err.textContent = 'No se ha podido enviar. Revisa tu conexión.'; });
  };

  /* ---------- 3. ofertas que no discriminan ---------- */
  var VETADAS = [
    [/\b(jóvenes?|jovenes?|juvenil)\b/i, 'edad'], [/\b(menor(es)? de \d+|mayor(es)? de \d+ años|hasta \d+ años|entre \d+ y \d+ años|edad (máxima|maxima|mínima|minima|comprendida))\b/i, 'edad'],
    [/\b(chic[ao]s?|señoritas?|mujer(es)? (joven|jóvenes)|solo mujeres|solo hombres|sexo (femenino|masculino))\b/i, 'sexo'],
    [/\b(buena presencia|buen físico|buen fisico|foto de cuerpo)\b/i, 'aspecto físico'],
    [/\b(solter[ao]s?|sin hijos|sin cargas familiares|casad[ao]s?)\b/i, 'situación familiar'],
    [/\b(nacionalidad española|español(a|es)? nativ\w*|español(a)? de nacimiento|no extranjeros)\b/i, 'origen'],
    [/\b(embaraz\w*|sin (problemas|limitaciones) de salud)\b/i, 'salud o embarazo']
  ];
  function vetada(t){ for(var i=0;i<VETADAS.length;i++){ var m = String(t||'').match(VETADAS[i][0]); if(m) return {palabra:m[0], motivo:VETADAS[i][1]}; } return null; }
  window.CERCO_ofertaVetada = vetada; // la usa submitNewOffer (clinica/01-panel.js)
    
  /* ---------- 4. mensajes sin preguntas prohibidas ---------- */
  var PREG_NO = /(embaraz|quedarte embarazada|tener hijos|tienes hijos|planes? de familia|qué edad|que edad|cuántos años tienes|cuantos años tienes|estás casad|estas casad|tienes pareja|enfermedad|baja médica|baja medica|religi|de dónde eres|de donde eres|nacionalidad|sindicat)/i;
  ['enviarMensajeClinica'].forEach(function(fn){
    var orig = window[fn]; if(typeof orig !== 'function') return;
    window[fn] = function(){
      var i = document.getElementById('ficha-msg-in'), t = i ? i.value : '';
      var m = String(t).match(PREG_NO);
      if(m){ if(typeof showToast === 'function') showToast('No se puede preguntar por «' + m[0] + '» en un proceso de selección. Cambia el mensaje.'); return; }
      return orig.apply(this, arguments);
    };
  });

  /* ---------- 5. denunciar desde la ficha ---------- */
  var MOTIVOS = ['Los datos o la titulación parecen falsos','No se presentó a la entrevista sin avisar','Trato inadecuado o mensajes ofensivos','Se hace pasar por otra persona','Otro motivo'];
  window._pieFicha = function(c){
    return '<div style="margin-top:16px;padding-top:12px;border-top:1px solid #F3F4F6;font-size:12px;color:#6B7280;line-height:1.5;">'
      + 'En la entrevista no preguntes por edad, embarazo, salud, familia ni origen: la ley lo prohíbe. '
      + '<button type="button" onclick="abrirDenunciaCand(\''+e(c.id)+'\')" style="background:none;border:none;padding:0;font:inherit;font-size:12px;color:#6B7280;text-decoration:underline;cursor:pointer;">Denunciar este perfil</button></div>';
  };
  window.abrirDenunciaCand = function(id){
    var c = lista().filter(function(x){ return x.id === id; })[0]; if(!c) return;
    var m = document.createElement('div'); m.id = 'modal-den';
    m.style.cssText = 'position:fixed;inset:0;background:rgba(10,14,30,.55);display:flex;align-items:center;justify-content:center;z-index:10004;padding:16px;box-sizing:border-box;';
    m.onclick = function(ev){ if(ev.target === m) m.remove(); };
    m.innerHTML = '<div style="background:white;border-radius:18px;max-width:440px;width:100%;padding:20px;box-shadow:0 24px 60px rgba(0,0,0,.25);">'
      + '<div style="font-size:18px;font-weight:800;color:#111827;margin-bottom:4px;">Denunciar este perfil</div>'
      + '<div style="font-size:13px;color:#6B7280;line-height:1.55;margin-bottom:12px;">Lo revisa una persona de CERCO. El candidato no sabrá que has sido tú.</div>'
      + '<select id="den-m" style="width:100%;border:1px solid #E5E7EB;border-radius:10px;padding:10px 12px;font-size:14px;font-family:inherit;margin-bottom:10px;">' + MOTIVOS.map(function(t){ return '<option>'+e(t)+'</option>'; }).join('') + '</select>'
      + '<textarea id="den-t" maxlength="600" placeholder="Cuéntanos qué ha pasado (opcional)" style="width:100%;box-sizing:border-box;min-height:80px;border:1px solid #E5E7EB;border-radius:10px;padding:10px 12px;font-size:14px;font-family:inherit;"></textarea>'
      + '<div id="den-err" style="font-size:12.5px;color:#DC2626;margin:6px 0;"></div>'
      + '<div style="display:flex;gap:8px;"><button onclick="document.getElementById(\'modal-den\').remove()" style="flex:1;background:white;color:#374151;border:1px solid #E5E7EB;border-radius:10px;padding:12px;font-size:13.5px;font-weight:700;cursor:pointer;font-family:inherit;">Cancelar</button>'
      + '<button id="den-ok" onclick="enviarDenunciaCand(\''+e(id)+'\')" style="flex:2;background:#1A56DB;color:white;border:none;border-radius:10px;padding:12px;font-size:13.5px;font-weight:800;cursor:pointer;font-family:inherit;">Enviar</button></div></div>';
    document.body.appendChild(m);
  };
  window.enviarDenunciaCand = function(id){
    var c = lista().filter(function(x){ return x.id === id; })[0]; if(!c || !window._unaSolaVez('den', 1500)) return;
    db().collection('denuncias').add({ de:uid(), rol:'clinica', tipo:'candidato', objetoId:String(id), candidatoUid:String(c.candidatoUid||''), clinicaId:uid(), motivo:(document.getElementById('den-m')||{}).value || '', texto:((document.getElementById('den-t')||{}).value || '').slice(0,600), fecha:new Date().toISOString(), estado:'nueva' })
      .then(function(){ var m = document.getElementById('modal-den'); if(m) m.remove(); if(typeof showToast === 'function') showToast('Recibido. Una persona de CERCO lo revisará.'); })
      .catch(function(){ var x = document.getElementById('den-err'); if(x) x.textContent = 'No se ha podido enviar. Revisa tu conexión.'; });
  };

  /* ---------- 6. ofertas que no se quedan abiertas para siempre ---------- */
  var DIAS_REVISAR = 45;
  function ofertasViejas(){
    var l = []; try{ l = getSavedOffers(); }catch(x){}
    return l.filter(function(o){ return o.estado === 'activa' && (Date.now() - new Date(o.revisada || o.editada || o.fecha)) / 86400000 > DIAS_REVISAR; });
  }
  window.ofertaSigue = function(id, sigue){
    if(!sigue){ try{ cambiarEstadoOferta(id, 'cerrada'); }catch(x){} return; }
    var l = getSavedOffers(); l.forEach(function(o){ if(String(o.id) === String(id)) o.revisada = new Date().toISOString(); }); setSavedOffers(l);
    try{ if(window._subirOferta) _subirOferta(); }catch(x){}
    if(typeof showToast === 'function') showToast('Perfecto, sigue publicada.');
    try{ CDB.renderTodo(); }catch(x){}
  };

  /* ---------- Inicio: confianza y plazos ---------- */
  var _inicio6 = window.renderInicioReal;
  window.renderInicioReal = function(){
    var r; try{ r = _inicio6 && _inicio6.apply(this, arguments); }catch(x){}
    try{
      var box = document.getElementById('inicio-real'), v = document.getElementById('inicio-confianza');
      // no borrar lo que se está escribiendo
      var ae = document.activeElement; if(v && ae && v.contains(ae) && /INPUT|TEXTAREA/.test(ae.tagName)) return r;
      if(v) v.remove();
      if(!box || box.style.display === 'none' || enDemo() || !uid()) return r;
      escucharVerificacion();
      var c = clinica(), vac = window._enVacaciones(), h = '';
      ofertasViejas().slice(0,2).forEach(function(o){
        h += '<div style="padding:12px 18px;border-top:1px solid #F3F4F6;"><div style="font-size:14px;font-weight:800;color:#111827;">¿Sigue abierta «'+e(o.titulo)+'»?</div><div style="font-size:12.5px;color:#6B7280;margin:2px 0 8px;">Lleva más de '+DIAS_REVISAR+' días publicada. Las ofertas que ya no existen hacen perder el tiempo a los candidatos.</div>'
          + '<div style="display:flex;gap:8px;"><button onclick="ofertaSigue(\''+e(o.id)+'\', true)" style="background:#1A56DB;color:white;border:none;border-radius:9px;padding:8px 14px;font-size:13px;font-weight:800;cursor:pointer;font-family:inherit;">Sí, sigue abierta</button><button onclick="ofertaSigue(\''+e(o.id)+'\', false)" style="background:white;color:#374151;border:1px solid #E5E7EB;border-radius:9px;padding:8px 14px;font-size:13px;font-weight:700;cursor:pointer;font-family:inherit;">Cerrarla</button></div></div>';
      });
      // verificación
      h += '<div style="padding:14px 18px;border-top:1px solid #F3F4F6;">';
      if(V.estado) h += '<div style="font-size:14px;font-weight:800;color:#0B5B43;">Clínica verificada</div><div style="font-size:12.5px;color:#6B7280;margin-top:2px;">Los candidatos ven la insignia «Clínica verificada por CERCO» en tus ofertas.</div>';
      else if(c.verifPedida) h += '<div style="font-size:14px;font-weight:800;color:#111827;">Verificación en revisión</div><div style="font-size:12.5px;color:#6B7280;margin-top:2px;">Enviaste tu CIF y tu registro sanitario el '+e(fechaCorta(String(c.verifPedida).slice(0,10)))+'. Lo revisa una persona de CERCO. Mientras, los candidatos ven «Aún sin verificar».</div>';
      else h += '<div style="font-size:14px;font-weight:800;color:#111827;">Verifica tu clínica</div><div style="font-size:12.5px;color:#6B7280;margin:2px 0 10px;line-height:1.5;">Los candidatos desconfían de las ofertas falsas. Con tu CIF y tu número de registro sanitario comprobamos que la clínica existe y les mostramos la insignia «Clínica verificada».</div>'
        + '<div style="display:flex;gap:8px;flex-wrap:wrap;"><input id="ver-cif" placeholder="CIF o NIF" maxlength="12" style="flex:1;min-width:120px;border:1px solid #E5E7EB;border-radius:9px;padding:9px 11px;font-size:14px;font-family:inherit;"><input id="ver-reg" placeholder="Nº de registro sanitario" maxlength="40" style="flex:2;min-width:160px;border:1px solid #E5E7EB;border-radius:9px;padding:9px 11px;font-size:14px;font-family:inherit;"><button onclick="pedirVerificacion()" style="background:#1A56DB;color:white;border:none;border-radius:9px;padding:9px 14px;font-size:13px;font-weight:800;cursor:pointer;font-family:inherit;">Enviar</button></div><div id="ver-err" style="font-size:12.5px;color:#DC2626;margin-top:6px;"></div>';
      h += '</div>';
      // vacaciones
      h += '<div style="padding:14px 18px;border-top:1px solid #F3F4F6;"><div style="font-size:14px;font-weight:800;color:#111827;">'+(vac ? 'Plazos en pausa hasta el '+e(fechaCorta(vac)) : 'Vacaciones o cierre')+'</div>'
        + '<div style="font-size:12.5px;color:#6B7280;margin:2px 0 10px;line-height:1.5;">'+(vac ? 'Ninguna solicitud se cierra mientras tanto y los candidatos ven que estás de vacaciones.' : 'Tienes 2 días laborables para contestar a cada candidato y a los '+(window.CERCO_DIAS_CADUCA||5)+' la solicitud se cierra. Los fines de semana no cuentan. Si cierras unos días, pausa los plazos.')+'</div>'
        + '<div style="display:flex;gap:8px;flex-wrap:wrap;align-items:center;"><label for="vac-hasta" style="font-size:13px;color:#374151;">Hasta el</label><input type="date" id="vac-hasta" min="'+hoyIso()+'" value="'+e(vac || '')+'" style="border:1px solid #E5E7EB;border-radius:9px;padding:8px 10px;font-size:14px;font-family:inherit;"><button onclick="guardarVacaciones()" style="background:white;color:#374151;border:1px solid #E5E7EB;border-radius:9px;padding:8px 14px;font-size:13px;font-weight:700;cursor:pointer;font-family:inherit;">'+(vac ? 'Cambiar' : 'Pausar plazos')+'</button>'
        + (vac ? '<button onclick="document.getElementById(\'vac-hasta\').value=\'\'; guardarVacaciones()" style="background:none;border:none;color:#1A56DB;font-size:13px;font-weight:700;cursor:pointer;font-family:inherit;">Reactivar ya</button>' : '') + '</div></div>';
      var el = document.createElement('div'); el.id = 'inicio-confianza';
      el.style.cssText = 'background:white;border:1px solid #EAECF0;border-radius:16px;overflow:hidden;margin-bottom:16px;box-shadow:0 1px 4px rgba(0,0,0,.04);';
      el.innerHTML = '<div style="padding:14px 18px;font-size:13px;font-weight:800;color:#111827;letter-spacing:.3px;">CONFIANZA Y PLAZOS</div>' + h;
      box.appendChild(el);
    }catch(x){}
    return r;
  };
  try{ CDB.renderTodo(); }catch(x){}
})();
