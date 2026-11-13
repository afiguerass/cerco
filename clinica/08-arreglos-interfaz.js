/* Archivo sacado tal cual de index.html (Fase 1, paso 1.6). El orden de carga
   importa: se carga en el mismo sitio de la página donde estaba. */
/* ===== Arreglos del test UI/UX: comportamiento ===== */
(function(){
  // 5. cada etiqueta apunta a su campo (lectores de pantalla y tocar la etiqueta)
  var n = 0;
  function ligar(){
    document.querySelectorAll('label:not([for])').forEach(function(l){
      if(l.querySelector('input,select,textarea')) return;
      var c = l.nextElementSibling;
      if(c && !/^(INPUT|SELECT|TEXTAREA)$/.test(c.tagName)) c = c.querySelector ? c.querySelector('input,select,textarea') : null;
      if(!c || c.type === 'hidden') return;
      if(!c.id) c.id = 'cmp-' + (++n);
      l.setAttribute('for', c.id);
    });
    document.querySelectorAll('input:not([type=hidden]):not([type=file]),select,textarea').forEach(function(c){
      if(c.getAttribute('aria-label') || (c.id && document.querySelector('label[for="'+c.id+'"]')) || c.closest('label')) return;
      var t = c.placeholder || '';
      if(t) c.setAttribute('aria-label', t.replace(/^Ej:\s*/,'').replace(/…$/,''));
    });
  }
  // 3. la oferta nueva empieza con la ciudad de la clínica
  function ciudadClinica(){
    try{ var c = (window.CDB && CDB.clinica && CDB.clinica()) || {}; if(c.ciutat) return c.ciutat; }catch(x){}
    try{ var e = JSON.parse(localStorage.getItem('cerco_empresa') || '{}'); return e.ciutat || ''; }catch(x){ return ''; }
  }
  // La usa showScreen (clinica/01i-navegacion.js) después de cambiar de pantalla
  window.CERCO_interfazTrasPantalla = function(id){
    document.body.classList.toggle('en-bienvenida', id === 'benvinguda'); document.body.classList.remove('baja');
    if(id === 'crear-oferta'){ var u = document.getElementById('co-ubicacion'); if(u && !u.value.trim()){ var c = ciudadClinica(); if(c) u.value = c; } }
    ligar();
  };
  // 7. al bajar, los botones flotantes se apartan; al subir, vuelven
  // el panel se desplaza dentro de .shell-main, no la ventana: escuchamos cualquier desplazamiento
  var y0 = 0, el0 = null;
  document.addEventListener('scroll', function(ev){
    var t = ev.target === document ? (document.scrollingElement || document.documentElement) : ev.target;
    if(!t || t.id === 'mobile-sheet' || (t.closest && t.closest('#modal-cand'))) return;
    var y = t.scrollTop || 0;
    if(t !== el0){ el0 = t; y0 = y; return; }
    if(Math.abs(y - y0) < 8) return;
    document.body.classList.toggle('baja', y > y0 && y > 80);
    y0 = y;
  }, {passive:true, capture:true});
  if(document.readyState !== 'loading') ligar(); else document.addEventListener('DOMContentLoaded', ligar);
})();
