/* Archivo sacado tal cual de index.html (Fase 1, paso 1.6). El orden de carga
   importa: se carga en el mismo sitio de la página donde estaba. */
/* ================================================================
   CORREO, CONTRATO Y ACOGIDA
   1. «Correo» deja elegir Gmail, Outlook o el programa de correo:
      en un ordenador sin programa de correo, mailto no hace nada.
   2. Al contratar, la persona pasa a «Contratados».
   3. La clínica envía el contrato y las condiciones por CERCO y la
      persona los tiene en su cuenta. El plan de acogida se guarda en
      la nube y el profesional ve cada paso que marcas.
   ================================================================ */
(function(){
  function $(i){ return document.getElementById(i); }
  function e(t){ return String(t == null ? '' : t).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;').replace(/'/g,'&#39;'); }
  function cands(){ try{ return window.CERCO_candidaturas ? CERCO_candidaturas() : JSON.parse(localStorage.getItem('cerco_candidaturas') || '[]'); }catch(x){ return []; } }
  function buscar(id){ var l = cands(); for(var i = 0; i < l.length; i++) if(l[i].id === id) return l[i]; return null; }
  function primer(n){ return String(n || '').trim().split(/\s+/)[0] || ''; }
  function toast(t){ try{ showToast(t); }catch(x){} }
  function fechaLarga(iso){ var d = new Date(iso); if(isNaN(d)) return ''; return d.toLocaleDateString('es-ES', {day:'numeric', month:'long', year:'numeric'}); }
  function clinica(){ try{ return CDB.nombreClinica() || ''; }catch(x){ return ''; } }

  /* ---------------- 1. CORREO ---------------- */
  function cerrarMenuCorreo(){ var m = $('correo-menu'); if(m) m.remove(); document.removeEventListener('keydown', escCorreo, true); }
  // Esc cierra solo el menú: se queda la tecla para que no cierre también la ficha que hay debajo
  function escCorreo(ev){ if(ev.key === 'Escape'){ ev.stopPropagation(); cerrarMenuCorreo(); } }
  function abrirMenuCorreo(a){
    cerrarMenuCorreo();
    var href = a.getAttribute('href') || '', resto = href.replace(/^mailto:/i, ''), q = resto.indexOf('?');
    var para = decodeURIComponent(q > -1 ? resto.slice(0, q) : resto), params = new URLSearchParams(q > -1 ? resto.slice(q + 1) : '');
    var asunto = params.get('subject') || '', cuerpo = params.get('body') || '';
    var enc = encodeURIComponent;
    var gmail = 'https://mail.google.com/mail/?view=cm&fs=1&to=' + enc(para) + (asunto ? '&su=' + enc(asunto) : '') + (cuerpo ? '&body=' + enc(cuerpo) : '');
    var outlook = 'https://outlook.live.com/mail/0/deeplink/compose?to=' + enc(para) + (asunto ? '&subject=' + enc(asunto) : '') + (cuerpo ? '&body=' + enc(cuerpo) : '');
    var m = document.createElement('div'); m.id = 'correo-menu';
    m.setAttribute('role', 'menu');
    var r = a.getBoundingClientRect(), ancho = 260;
    var izq = Math.max(8, Math.min(window.innerWidth - ancho - 8, r.left + r.width / 2 - ancho / 2));
    var arriba = r.bottom + 6; if(arriba + 230 > window.innerHeight) arriba = Math.max(8, r.top - 236);
    m.style.cssText = 'position:fixed;z-index:2147483001;left:'+izq+'px;top:'+arriba+'px;width:'+ancho+'px;background:#fff;border:1px solid #E5E7EB;border-radius:14px;box-shadow:0 16px 40px rgba(15,23,42,.18);padding:6px;font-family:inherit;';
    var op = 'display:flex;align-items:center;gap:10px;width:100%;box-sizing:border-box;padding:11px 12px;border:0;background:none;border-radius:10px;font:inherit;font-size:14px;font-weight:600;color:#111827;text-decoration:none;cursor:pointer;text-align:left;';
    m.innerHTML = '<div style="padding:8px 12px 6px;font-size:12px;color:#6B7280;overflow-wrap:anywhere;">Escribir a <b style="color:#111827;">'+e(para)+'</b></div>'
      + '<a role="menuitem" href="'+e(gmail)+'" target="_blank" rel="noopener" style="'+op+'"><span style="width:22px;text-align:center;"><svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#4B5563" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="vertical-align:-0.2em;" aria-hidden="true"><rect width="20" height="16" x="2" y="4" rx="2"/><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/></svg></span>Abrir en Gmail</a>'
      + '<a role="menuitem" href="'+e(outlook)+'" target="_blank" rel="noopener" style="'+op+'"><span style="width:22px;text-align:center;"><svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#4B5563" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="vertical-align:-0.2em;" aria-hidden="true"><polyline points="22 12 16 12 14 15 10 15 8 12 2 12"/><path d="M5.45 5.11 2 12v6a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-6l-3.45-6.89A2 2 0 0 0 16.76 4H7.24a2 2 0 0 0-1.79 1.11z"/></svg></span>Abrir en Outlook</a>'
      + '<a role="menuitem" href="'+e(href)+'" data-directo="1" style="'+op+'"><span style="width:22px;text-align:center;"><svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#4B5563" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="vertical-align:-0.2em;" aria-hidden="true"><path d="M20 16V7a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2v9m16 0H4m16 0 1.28 2.55a1 1 0 0 1-.9 1.45H3.62a1 1 0 0 1-.9-1.45L4 16"/></svg></span>Programa de correo del ordenador</a>'
      + '<button role="menuitem" type="button" id="correo-copiar" style="'+op+'"><span style="width:22px;text-align:center;"><svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#4B5563" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="vertical-align:-0.2em;" aria-hidden="true"><rect width="14" height="14" x="8" y="8" rx="2" ry="2"/><path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2"/></svg></span>Copiar la dirección</button>';
    document.body.appendChild(m);
    m.querySelectorAll('a').forEach(function(x){ x.addEventListener('click', function(){ setTimeout(cerrarMenuCorreo, 50); }); x.onmouseenter = function(){ x.style.background = '#F3F4F6'; }; x.onmouseleave = function(){ x.style.background = 'none'; }; });
    var cp = $('correo-copiar');
    cp.onmouseenter = function(){ cp.style.background = '#F3F4F6'; }; cp.onmouseleave = function(){ cp.style.background = 'none'; };
    cp.onclick = function(){
      var ok = function(){ toast('Dirección copiada: ' + para); cerrarMenuCorreo(); };
      try{ navigator.clipboard.writeText(para).then(ok, function(){ prompt('Copia la dirección:', para); cerrarMenuCorreo(); }); }
      catch(x){ prompt('Copia la dirección:', para); cerrarMenuCorreo(); }
    };
    document.addEventListener('keydown', escCorreo, true);
    setTimeout(function(){ var f = m.querySelector('a'); if(f) f.focus(); }, 30);
  }
  document.addEventListener('click', function(ev){
    var menu = $('correo-menu');
    if(menu && !menu.contains(ev.target)){ cerrarMenuCorreo(); }
    var a = ev.target && ev.target.closest ? ev.target.closest('a[href^="mailto:"]') : null;
    if(!a || a.dataset.directo) return;
    ev.preventDefault(); ev.stopPropagation();
    abrirMenuCorreo(a);
  }, true);
  window.addEventListener('resize', cerrarMenuCorreo);

  /* ---------------- 3a. contrato: ficheros por trozos ---------------- */
  var TROZO = 700000, MAX = 8 * 1024 * 1024;
  function docs(sid){ return Nube.db().collection('candidaturas').doc(sid).collection('docs'); }
  function leerArchivo(f){
    return new Promise(function(res, rej){ var r = new FileReader(); r.onload = function(){ res(String(r.result).split(',')[1] || ''); }; r.onerror = rej; r.readAsDataURL(f); });
  }
  function subirContrato(c, f){
    return leerArchivo(f).then(function(b64){
      var n = Math.ceil(b64.length / TROZO), ps = [];
      for(var k = 0; k < n; k++) ps.push(docs(c.id).doc('contrato_' + k).set({ d: b64.slice(k * TROZO, (k + 1) * TROZO), k: k }));
      return Promise.all(ps).then(function(){ return { nombre: String(f.name || 'contrato').slice(0, 120), mime: f.type || 'application/pdf', tam: f.size, n: n }; });
    });
  }
  var _urlC = {};
  window.CERCO_contratoUrl = function(c){
    var a = c.contrato && c.contrato.archivo; if(!a) return Promise.reject('sin');
    var k = c.id + '_' + (c.contrato.f || '');
    if(_urlC[k]) return Promise.resolve(_urlC[k]);
    var ps = []; for(var i = 0; i < a.n; i++) ps.push(docs(c.id).doc('contrato_' + i).get());
    return Promise.all(ps).then(function(ds){
      var b64 = ds.map(function(d){ if(!d.exists) throw 'falta'; return d.data().d; }).join('');
      var bin = atob(b64), arr = new Uint8Array(bin.length); for(var j = 0; j < bin.length; j++) arr[j] = bin.charCodeAt(j);
      _urlC[k] = URL.createObjectURL(new Blob([arr], {type: a.mime || 'application/pdf'}));
      return _urlC[k];
    });
  };
  window.CERCO_verContrato = function(id, bajar){
    var c = buscar(id); if(!c) return;
    var w = bajar ? null : window.open('', '_blank');
    CERCO_contratoUrl(c).then(function(u){
      if(w){ w.location.href = u; return; }
      var a = document.createElement('a'); a.href = u; a.download = (c.contrato.archivo.nombre || 'contrato.pdf'); document.body.appendChild(a); a.click(); a.remove();
    }).catch(function(){ if(w) w.close(); toast('No se ha podido abrir el contrato. Revisa tu conexión.'); });
  };

  /* ---------------- 3b. condiciones a partir de la oferta ---------------- */
  function oferta(c){ try{ return (CDB.ofertas() || []).filter(function(o){ return String(o.id) === String(c.ofertaId); })[0] || {}; }catch(x){ return {}; } }
  function condicionesDe(c){
    var o = oferta(c), l = [];
    l.push('Puesto: ' + (c.ofertaTitulo || o.titulo || o.title || ''));
    if(o.salario) l.push('Sueldo: ' + o.salario);
    var h = [(o.turnos || []).join(', '), o.horario || ''].filter(Boolean).join(' · ');
    if(h) l.push('Horario: ' + h);
    if(o.contrato) l.push('Contrato: ' + o.contrato);
    if(o.convenio) l.push('Convenio: ' + o.convenio);
    if(o.prueba) l.push('Periodo de prueba: ' + o.prueba);
    return l.join('\n');
  }

  /* ---------------- 3c. tarjeta «Contrato y condiciones» ---------------- */
  var caja = 'border:1px solid #EAECF0;border-radius:14px;padding:14px;margin-top:12px;background:#fff;';
  var btnP = 'background:#1A56DB;color:#fff;border:0;border-radius:10px;padding:11px 14px;font:inherit;font-size:13.5px;font-weight:800;cursor:pointer;';
  var btnS = 'background:#fff;color:#1A56DB;border:1px solid #E5E7EB;border-radius:10px;padding:10px 13px;font:inherit;font-size:13px;font-weight:700;cursor:pointer;';
  function recibido(c){ return !!(c.contrato && c.contratoRecibido && String(c.contratoRecibido) >= String(c.contrato.f)); }
  function bloqueContrato(c, editar){
    var k = c.contrato, nom = primer(c.nombre) || 'la persona', rec = recibido(c);
    if(k && !editar){
      return '<div id="ct-card" style="'+caja+'">'
        + '<div style="display:flex;justify-content:space-between;gap:10px;align-items:flex-start;"><div style="font-size:14.5px;font-weight:800;color:#111827;">Contrato y condiciones</div>'
        + '<span style="font-size:11.5px;font-weight:800;border-radius:99px;padding:3px 9px;white-space:nowrap;'+(rec ? 'background:#E8F8F1;color:#0B5B43;">Recibido' : 'background:#FFFBEB;color:#8A5A00;">Sin abrir')+'</span></div>'
        + '<div style="font-size:12.5px;color:#6B7280;margin:4px 0 10px;line-height:1.5;">Enviado el '+e(fechaLarga(k.f))+'. '
        + (rec ? e(nom)+' confirmó que lo tiene el '+e(fechaLarga(c.contratoRecibido))+'.' : e(nom)+' lo tiene en su CERCO, en «Tu incorporación». Aún no ha confirmado que lo ha visto.')+'</div>'
        + (k.inicio ? '<div style="font-size:13.5px;color:#111827;margin-bottom:6px;"><b>Empieza el</b> '+e(fechaLarga(k.inicio))+'</div>' : '')
        + (k.cond ? '<div style="font-size:13px;color:#374151;line-height:1.6;white-space:pre-line;background:#F8FAFC;border-radius:10px;padding:10px 12px;">'+e(k.cond)+'</div>' : '')
        + (k.archivo ? '<div style="display:flex;gap:8px;flex-wrap:wrap;align-items:center;margin-top:10px;"><span style="font-size:13px;color:#374151;flex:1;min-width:140px;overflow-wrap:anywhere;"><svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#6B7280" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="display:inline-block;vertical-align:-0.2em;margin-right:4px;" aria-hidden="true"><path d="M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z"/><path d="M14 2v4a2 2 0 0 0 2 2h4"/><path d="M10 9H8"/><path d="M16 13H8"/><path d="M16 17H8"/></svg>'+e(k.archivo.nombre)+'</span>'
            + '<button type="button" style="'+btnS+'" onclick="CERCO_verContrato(\''+e(c.id)+'\')">Ver</button><button type="button" style="'+btnS+'" onclick="CERCO_verContrato(\''+e(c.id)+'\',1)">Descargar</button></div>' : '')
        + '<button type="button" style="'+btnS+'margin-top:10px;width:100%;" onclick="CERCO_editarContrato(\''+e(c.id)+'\')">Cambiar y volver a enviar</button>'
        + '</div>';
    }
    var hoy = new Date(); hoy.setDate(hoy.getDate() + 1);
    var ini = k && k.inicio ? String(k.inicio).slice(0, 10) : '';
    return '<div id="ct-card" style="'+caja+'">'
      + '<div style="font-size:14.5px;font-weight:800;color:#111827;">Contrato y condiciones</div>'
      + '<div style="font-size:12.5px;color:#6B7280;margin:4px 0 12px;line-height:1.5;">Envíaselo por aquí y '+e(nom)+' lo tendrá siempre en su cuenta de CERCO. Las condiciones salen de la oferta: cámbialas si habéis acordado otra cosa.</div>'
      + '<label style="display:block;font-size:12.5px;font-weight:700;color:#374151;margin-bottom:4px;" for="ct-ini">Fecha de incorporación</label>'
      + '<input type="date" id="ct-ini" value="'+e(ini)+'" style="width:100%;box-sizing:border-box;border:1px solid #E5E7EB;border-radius:10px;padding:10px 12px;font:inherit;font-size:14px;margin-bottom:10px;">'
      + '<label style="display:block;font-size:12.5px;font-weight:700;color:#374151;margin-bottom:4px;" for="ct-cond">Condiciones</label>'
      + '<textarea id="ct-cond" maxlength="1500" style="width:100%;box-sizing:border-box;min-height:120px;border:1px solid #E5E7EB;border-radius:10px;padding:10px 12px;font:inherit;font-size:13.5px;line-height:1.55;margin-bottom:10px;">'+e(k ? k.cond : condicionesDe(c))+'</textarea>'
      + '<label style="display:block;font-size:12.5px;font-weight:700;color:#374151;margin-bottom:4px;" for="ct-file">Contrato (PDF o foto, opcional)</label>'
      + '<input type="file" id="ct-file" accept="application/pdf,image/*" style="width:100%;font:inherit;font-size:13px;margin-bottom:4px;">'
      + (k && k.archivo ? '<div style="font-size:12px;color:#6B7280;margin-bottom:6px;">Si no eliges otro, se mantiene «'+e(k.archivo.nombre)+'».</div>' : '')
      + '<div style="font-size:11.5px;color:#6B7280;margin-bottom:10px;">Hasta 8 MB. CERCO no firma el contrato: la firma la hacéis como siempre.</div>'
      + '<div id="ct-err" style="font-size:12.5px;color:#DC2626;min-height:1px;margin-bottom:6px;"></div>'
      + '<div style="display:flex;gap:8px;">' + (k ? '<button type="button" style="'+btnS+'flex:1;" onclick="CERCO_editarContrato(\''+e(c.id)+'\',1)">Cancelar</button>' : '')
      + '<button type="button" id="ct-ok" style="'+btnP+'flex:2;" onclick="CERCO_enviarContrato(\''+e(c.id)+'\')">Enviar a '+e(nom)+'</button></div>'
      + '</div>';
  }
  window.CERCO_editarContrato = function(id, cancelar){
    var c = buscar(id), b = $('ct-card'); if(c && b) b.outerHTML = bloqueContrato(c, !cancelar);
  };
  window.CERCO_enviarContrato = function(id){
    var c = buscar(id); if(!c) return;
    var err = $('ct-err'), ok = $('ct-ok'), f = ($('ct-file') || {}).files, file = f && f[0];
    var cond = (($('ct-cond') || {}).value || '').trim(), ini = ($('ct-ini') || {}).value || '';
    if(!cond && !file && !(c.contrato && c.contrato.archivo)){ err.textContent = 'Escribe las condiciones o adjunta el contrato.'; return; }
    if(file && file.size > MAX){ err.textContent = 'El archivo pesa más de 8 MB. Escanéalo con menos calidad o envíalo en PDF.'; return; }
    if(file && !/^(application\/pdf|image\/)/.test(file.type || '')){ err.textContent = 'Solo PDF o foto (JPG, PNG).'; return; }
    err.textContent = ''; ok.disabled = true; ok.textContent = file ? 'Subiendo el contrato…' : 'Enviando…';
    var antes = c.contrato && c.contrato.archivo;
    (file ? subirContrato(c, file) : Promise.resolve(antes || null)).then(function(arch){
      var k = { cond: cond.slice(0, 1500), inicio: ini ? new Date(ini + 'T09:00:00').toISOString() : '', archivo: arch, f: new Date().toISOString() };
      var ac = acogida(c); ac.h[0] = true; ac.f[0] = ac.f[0] || k.f;
      return Nube.cambiarCandidatura(c, { contrato: k, acogida: ac }).then(function(){
        // si el nuevo archivo tiene menos trozos, borramos los que sobran
        if(file && antes && antes.n > arch.n) for(var i = arch.n; i < antes.n; i++) docs(c.id).doc('contrato_' + i).delete().catch(function(){});
      });
    }).then(function(){
      toast('Enviado. ' + (primer(c.nombre) || 'La persona') + ' ya lo tiene en su CERCO.');
      try{ abrirFichaCandidato(id, 'ver'); }catch(x){}
    }).catch(function(){ ok.disabled = false; ok.textContent = 'Enviar a ' + (primer(c.nombre) || 'la persona'); err.textContent = 'No se ha podido enviar. Revisa tu conexión y vuelve a probar.'; });
  };

  /* ---------------- 3d. plan de acogida en la nube ---------------- */
  function acogida(c){
    var loc = {}; try{ loc = JSON.parse(localStorage.getItem('cerco_acogida') || '{}') || {}; }catch(x){}
    var a = c.acogida || {};
    return { h: (a.h || loc[c.id] || []).slice(0, 8), f: (a.f || []).slice(0, 8) };
  }
  window.CERCO_acogidaDe = acogida;
  window.CERCO_plan = function(id, i, on){
    var c = buscar(id); if(!c) return CERCO_planLocal.apply(this, arguments);
    var a = acogida(c); a.h[i] = !!on; a.f[i] = on ? new Date().toISOString() : null;
    for(var j = 0; j < 8; j++){ if(a.h[j] == null) a.h[j] = false; if(a.f[j] === undefined) a.f[j] = null; }
    try{ var t = JSON.parse(localStorage.getItem('cerco_acogida') || '{}') || {}; t[id] = a.h; localStorage.setItem('cerco_acogida', JSON.stringify(t)); }catch(x){}
    var b = $('mk-plan'); if(b) b.outerHTML = planHtml(Object.assign({}, c, { acogida: a }));
    Nube.cambiarCandidatura(c, { acogida: a }).catch(function(){ toast('No se ha podido guardar. Revisa tu conexión.'); });
  };
  var PASOS = [
    ['Antes del primer día','Contrato y condiciones por escrito: sueldo, horario, convenio y periodo de prueba, tal como salían en la oferta.'],
    ['Antes del primer día','Uniforme, taquilla y acceso al programa de la clínica preparados.'],
    ['Día 1','Presentarle al equipo y decirle quién es su persona de referencia.'],
    ['Día 1','Enseñarle los protocolos: esterilización, agenda y urgencias.'],
    ['Semana 1','10 minutos a solas: qué tal va y qué necesita.'],
    ['Mes 1','Conversación de media hora: qué funciona, qué cambiaríais los dos.'],
    ['Mes 3','Antes de acabar el periodo de prueba, decirle claramente cómo va.'],
    ['Día 90','Contestar en CERCO si seguís trabajando juntos.']
  ];
  function planHtml(c){
    var a = acogida(c), n = a.h.filter(Boolean).length, nom = primer(c.nombre) || 'La persona';
    return '<div class="mk-card mk-plan" id="mk-plan"><h4>Plan de acogida · primeros 90 días</h4>'
      + '<div style="font-size:12.5px;color:#6B7280;line-height:1.5;margin-bottom:6px;">Es tu lista para que se quede: la mayoría de las bajas llegan en los tres primeros meses y casi siempre por el ambiente, no por el sueldo. Marca cada paso cuando lo hagas. <b style="color:#374151;">'+e(nom)+' ve en su CERCO los pasos que vas marcando</b>, así sabe qué viene después. '+n+' de '+PASOS.length+' hechos.</div>'
      + PASOS.map(function(p, i){
          var f = a.h[i] && a.f[i] ? ' · ' + new Date(a.f[i]).toLocaleDateString('es-ES', {day:'numeric', month:'short'}) : '';
          var auto = i === 0 ? '<em style="display:block;font-style:normal;font-size:11.5px;color:#6B7280;margin-top:2px;">Se marca solo al enviarle el contrato arriba.</em>' : '';
          return '<label><input type="checkbox" '+(a.h[i] ? 'checked' : '')+' onchange="CERCO_plan(\''+e(c.id)+'\','+i+',this.checked)"><span><small>'+p[0]+e(f)+'</small>'+e(p[1])+auto+'</span></label>';
        }).join('')
      + '</div>';
  }

  /* ---------------- la ficha de una persona contratada ---------------- */
  var _ficha = window.abrirFichaCandidato;
  window.abrirFichaCandidato = function(id, modo){
    var r = _ficha.apply(this, arguments);
    try{
      var c = buscar(id), box = $('cand-acciones'); if(!c || !box) return r;
      // asunto del correo: así la persona sabe de qué va
      var mail = document.querySelector('#modal-cand a[href^="mailto:"]');
      if(mail && c.email) mail.setAttribute('href', 'mailto:' + c.email + '?subject=' + encodeURIComponent((c.ofertaTitulo || 'Tu solicitud') + ' · ' + (clinica() || 'CERCO')));
      if(c.estado === 'contratada'){
        var p = $('mk-plan');
        if(p) p.outerHTML = planHtml(c);
        p = $('mk-plan');
        var ct = bloqueContrato(c);
        if(p) p.insertAdjacentHTML('beforebegin', ct); else box.insertAdjacentHTML('beforeend', ct);
      }
    }catch(x){}
    return r;
  };

  /* ---------------- 2. al contratar, a «Contratados» ---------------- */
  window.CERCO_trasContratar = function(id){
    var c = buscar(id), nom = c ? primer(c.nombre) : '';
    try{ CERCO_verEtapa('contr'); }catch(x){ try{ cerrarFichaCandidato(); }catch(y){} }
    setTimeout(function(){
      var card = document.querySelector('.cand-real[data-id="' + (window.CSS && CSS.escape ? CSS.escape(id) : id) + '"]');
      if(card){
        card.scrollIntoView({block:'center', behavior:'smooth'});
        card.style.transition = 'box-shadow .4s'; card.style.boxShadow = '0 0 0 3px #059669';
        setTimeout(function(){ card.style.boxShadow = ''; }, 2600);
      }
      toast((nom || 'La persona') + ' está en «Contratados». Ábrela para enviarle el contrato y seguir el plan de acogida.');
    }, 450);
  };
})();

