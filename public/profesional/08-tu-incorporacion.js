/* Archivo sacado tal cual de candidato.html (Fase 1, paso 1.6). El orden de carga
   importa: se carga en el mismo sitio de la página donde estaba. */
/* ================================================================
   TU INCORPORACIÓN
   Cuando una clínica te contrata: el contrato y las condiciones que
   te envía, los pasos de tu acogida que va marcando y qué hacer con
   tus otras solicitudes. El «¡Enhorabuena!» de Inicio se va cuando
   lo has visto; la solicitud se queda en tu historial.
   ================================================================ */
var PASOS_ACOGIDA = [
  ['Antes del primer día','Recibes el contrato y las condiciones por escrito.'],
  ['Antes del primer día','Te preparan el uniforme, la taquilla y el acceso al programa de la clínica.'],
  ['Día 1','Conoces al equipo y a tu persona de referencia.'],
  ['Día 1','Te enseñan los protocolos: esterilización, agenda y urgencias.'],
  ['Semana 1','Una charla a solas: qué tal vas y qué necesitas.'],
  ['Mes 1','Media hora para hablar de qué funciona y qué cambiaríais.'],
  ['Mes 3','Antes de acabar el periodo de prueba, te dicen claramente cómo vas.'],
  ['Día 90','CERCO te pregunta si seguís trabajando juntos.']
];
function contratoRecibido(s){ return !!(s.contrato && s.contratoRecibido && String(s.contratoRecibido) >= String(s.contrato.f)); }
function fechaLargaC(iso){ var d = new Date(iso); return isNaN(d) ? '' : d.toLocaleDateString('es-ES', {day:'numeric', month:'long', year:'numeric'}); }
var _urlContrato = {};
function urlContrato(s){
  var a = s.contrato && s.contrato.archivo; if(!a) return Promise.reject('sin');
  var k = s.id + '_' + s.contrato.f; if(_urlContrato[k]) return Promise.resolve(_urlContrato[k]);
  var col = Nube.db().collection('candidaturas').doc(s.id).collection('docs'), ps = [];
  for(var i = 0; i < a.n; i++) ps.push(col.doc('contrato_' + i).get());
  return Promise.all(ps).then(function(ds){
    var b64 = ds.map(function(d){ if(!d.exists) throw 'falta'; return d.data().d; }).join('');
    var bin = atob(b64), arr = new Uint8Array(bin.length); for(var j = 0; j < bin.length; j++) arr[j] = bin.charCodeAt(j);
    return (_urlContrato[k] = URL.createObjectURL(new Blob([arr], {type: a.mime || 'application/pdf'})));
  });
}
function verContratoC(id, bajar){
  var s = buscarSol(id); if(!s) return;
  var w = bajar ? null : window.open('', '_blank');
  urlContrato(s).then(function(u){
    if(w){ w.location.href = u; }
    else { var a = document.createElement('a'); a.href = u; a.download = s.contrato.archivo.nombre || 'contrato.pdf'; document.body.appendChild(a); a.click(); a.remove(); }
    if(!contratoRecibido(s)) confirmarContrato(id, true);
  }).catch(function(){ if(w) w.close(); toast('No hemos podido abrir el contrato. Revisa tu conexión.'); });
}
function confirmarContrato(id, callado){
  var s = buscarSol(id); if(!s || !s.contrato) return;
  Nube.cambiar(s, {contratoRecibido: new Date().toISOString()})
    .then(function(){ if(!callado) toast('Hecho. ' + (s.clinicaNombre || 'La clínica') + ' ya sabe que lo tienes.'); refrescar(); })
    .catch(function(){ if(!callado) toast('No se ha podido guardar. Revisa tu conexión.'); });
}
function otrasAbiertas(s){ return S.sols.filter(function(x){ return x.id !== s.id && ['enviada','vista','entrevista'].indexOf(x.estado) > -1; }); }
function retirarOtras(id){
  var s = buscarSol(id); if(!s || !unaVez('retOtras', 3000)) return;
  var l = otrasAbiertas(s), b = $('inc-ret'); if(!l.length) return;
  if(b){ b.disabled = true; b.textContent = 'Retirando…'; }
  Promise.all(l.map(function(x){ return Nube.retirar(x).then(function(){ x.estado = 'retirada'; try{ _estadosVistos[x.id] = 'retirada'; }catch(e){} }).catch(function(){ return 'fallo'; }); }))
    .then(function(r){
      var mal = r.filter(function(x){ return x === 'fallo'; }).length;
      toast(mal ? 'Se han retirado ' + (l.length - mal) + ' de ' + l.length + '. Vuelve a probar con las demás.' : 'Listo: esas clínicas ya saben que no sigues en su proceso.');
      refrescar();
    });
}
function bloqueIncorporacion(s){
  if(s.estado !== 'contratada' || esVisita(s)) return '';
  var k = s.contrato, a = s.acogida || {}, h = a.h || [], f = a.f || [], cl = esc(s.clinicaNombre || 'La clínica');
  var hechos = h.filter(Boolean).length;
  var html = '<div class="card inc-card" id="inc-card"><h3>'+svg('briefcase','currentColor',16)+'Tu incorporación</h3>';
  // contrato y condiciones
  if(k){
    var rec = contratoRecibido(s);
    html += '<div class="inc-ct">'
      + '<div class="inc-ct-h">'+svg('file','#1A56DB',18)+'<b>Contrato y condiciones</b><span class="inc-pill'+(rec?' ok':'')+'">'+(rec?'Recibido':'Nuevo')+'</span></div>'
      + '<p class="txt" style="font-size:12.5px;color:#6B7280;margin:2px 0 10px;">Te lo envió '+cl+' el '+esc(fechaLargaC(k.f))+'. Lo tienes siempre aquí.</p>'
      + (k.inicio ? '<div class="inc-ini">'+svg('cal','#0B5B43',16)+'<span>Empiezas el <b>'+esc(fechaLargaC(k.inicio))+'</b></span></div>' : '')
      + (k.cond ? '<div class="inc-cond">'+esc(k.cond)+'</div>' : '')
      + (k.archivo ? '<div class="inc-arch"><span>'+svg('file','#6B7280',15)+' '+esc(k.archivo.nombre)+'</span><button class="btn btn-s" onclick="verContratoC(\''+esc(s.id)+'\')">Ver</button><button class="btn btn-s" onclick="verContratoC(\''+esc(s.id)+'\',1)">Descargar</button></div>' : '')
      + (rec ? '' : '<button class="btn btn-p" style="width:100%;margin-top:10px;" onclick="confirmarContrato(\''+esc(s.id)+'\')">'+svg('check','#fff',16)+'Lo he recibido</button>')
      + '<p class="txt" style="font-size:11.5px;color:#6B7280;margin-top:8px;">CERCO no firma el contrato: lo firmáis con la clínica como siempre. Si algo no coincide con lo que acordasteis, díselo por mensaje antes de firmar.</p>'
      + '</div>';
  } else {
    html += '<div class="inc-ct inc-esp">'+svg('file','#9CA3AF',18)+'<span>Cuando '+cl+' te envíe el contrato y las condiciones por escrito, aparecerán aquí y te avisaremos en Inicio.</span></div>';
  }
  // pasos de la acogida
  html += '<div class="inc-sub">Tus primeros 90 días <span>'+hechos+' de '+PASOS_ACOGIDA.length+'</span></div>'
    + '<p class="txt" style="font-size:12.5px;color:#6B7280;margin:0 0 8px;">'+cl+' marca cada paso cuando lo hace. Así sabes qué viene después.</p>'
    + '<ol class="inc-pasos">' + PASOS_ACOGIDA.map(function(p, i){
        var ok = !!h[i], fe = ok && f[i] ? ' · ' + new Date(f[i]).toLocaleDateString('es-ES', {day:'numeric', month:'short'}) : '';
        return '<li class="'+(ok?'ok':'')+'"><span class="inc-mk">'+(ok ? svg('check','#fff',13) : '')+'</span><span><small>'+esc(p[0] + fe)+'</small>'+esc(p[1])+'</span></li>';
      }).join('') + '</ol>';
  // ¿y tus otras solicitudes?
  var otras = otrasAbiertas(s);
  if(otras.length){
    html += '<div class="inc-otras"><b>Tienes '+(otras.length === 1 ? 'otra solicitud abierta' : otras.length + ' solicitudes más abiertas')+'.</b> Si ya no buscas, retíralas: esas clínicas sabrán que no sigues y no te esperarán.'
      + '<button class="btn btn-s" id="inc-ret" style="width:100%;margin-top:10px;" onclick="retirarOtras(\''+esc(s.id)+'\')">Retirar '+(otras.length === 1 ? 'la otra' : 'las otras ' + otras.length)+'</button></div>';
  }
  return html + '</div>';
}
(function(){
  // Solicitud contratada: «Tu incorporación». La usa pintarSolicitud (profesional/01-portal.js)
  window.CERCO_solicitudIncorporacion = function(){
    try{
      var s = buscarSol(S.actualSol), box = $('sd'); if(!s || !box || s.estado !== 'contratada') return;
      var g = box.querySelector('.gana-card'), html = bloqueIncorporacion(s);
      if(html){ if(g) g.insertAdjacentHTML('afterend', html); else box.insertAdjacentHTML('beforeend', html); pintarIconos(box); }
      // ya lo has visto: el «¡Enhorabuena!» deja de ocupar Inicio
      if(!s.ganVista && S.vista === 'solicitud' && document.visibilityState !== 'hidden') Nube.cambiar(s, {ganVista: new Date().toISOString()}).catch(function(){});
    }catch(e){}
  };
})();

