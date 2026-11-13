/* Archivo sacado tal cual de index.html (Fase 1, paso 1.6). El orden de carga
   importa: se carga en el mismo sitio de la página donde estaba. */
/* ================================================================
   EL MARCO TOMA LA FORMA DEL VÍDEO
   Vídeo vertical (móvil de pie) → marco vertical, sin franjas negras.
   Vídeo horizontal → marco horizontal. Antes de reproducir, la
   portada ya da la forma.
   ================================================================ */
(function(){
  // contenedor → alto máximo del marco
  var MARCOS = [['#ficha-video', 'min(68vh, 600px)'], ['.pm-vid', 'min(62vh, 480px)'], ['.gv-pant', 'min(56vh, 520px)']];
  function marcoDe(el){
    for(var i = 0; i < MARCOS.length; i++){ var b = el.closest ? el.closest(MARCOS[i][0]) : null; if(b) return [b, MARCOS[i][1]]; }
    return null;
  }
  function ajustar(m, w, h){
    if(!m || !w || !h) return;
    var box = m[0], r = w / h;
    if(box.dataset.ratio === r.toFixed(3)) return;
    box.dataset.ratio = r.toFixed(3);
    box.style.aspectRatio = w + ' / ' + h;
    box.style.maxHeight = 'none';
    box.style.height = 'auto';
    box.style.width = 'min(100%, calc(' + m[1] + ' * ' + r.toFixed(4) + '))';
    box.style.marginLeft = 'auto'; box.style.marginRight = 'auto';
    box.classList.toggle('vid-vertical', r < 0.95);
  }
  function porVideo(ev){
    var v = ev.target; if(!v || v.tagName !== 'VIDEO' || !v.videoWidth) return;
    var m = marcoDe(v); if(m) ajustar(m, v.videoWidth, v.videoHeight);
  }
  // los eventos de vídeo no suben: los cogemos en la fase de captura
  document.addEventListener('loadedmetadata', porVideo, true);
  document.addEventListener('resize', porVideo, true);
  // antes de darle a reproducir: la forma de la portada
  function urlFondo(el){
    var bg = el.style.backgroundImage || ''; if(!bg || bg === 'none') bg = getComputedStyle(el).backgroundImage || '';
    var l = bg.match(/url\((['"]?)(.*?)\1\)/g); if(!l) return '';
    var u = l[l.length - 1].replace(/^url\((['"]?)/, '').replace(/(['"]?)\)$/, '');
    return u;
  }
  function porPortada(box){
    if(box.dataset.ratio || box.querySelector('video')) return;
    var m = marcoDe(box); if(!m) return;
    if(+box.dataset.w && +box.dataset.h){ ajustar(m, +box.dataset.w, +box.dataset.h); return; }
    var u = urlFondo(box); if(!u) return;
    var im = new Image(); im.onload = function(){ if(!box.querySelector('video')) ajustar(m, im.naturalWidth, im.naturalHeight); }; im.src = u;
  }
  var SELS = '#ficha-video, .pm-vid, .gv-pant, #ficha-video video, .pm-vid video, .gv-pant video';
  function revisar(raiz){
    (raiz || document).querySelectorAll('#ficha-video, .pm-vid').forEach(porPortada);
    (raiz || document).querySelectorAll('#ficha-video video, .pm-vid video, .gv-pant video').forEach(function(v){ if(v.videoWidth) porVideo({target:v}); });
  }
  try{
    new MutationObserver(function(ms){
      for(var i = 0; i < ms.length; i++){
        var ns = ms[i].addedNodes;
        for(var j = 0; j < ns.length; j++){ var n = ns[j]; if(n.nodeType === 1 && n.matches && (n.matches(SELS) || n.querySelector(SELS))) revisar(n.parentNode || n); }
      }
    }).observe(document.documentElement, {childList:true, subtree:true});
  }catch(x){}
  if(document.readyState !== 'loading') revisar(); else document.addEventListener('DOMContentLoaded', function(){ revisar(); });
  // iPhone ya trae su botón de pantalla completa en el vídeo: no ponemos otro encima
  var ios = /iP(hone|od|ad)/.test(navigator.userAgent) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
  if(ios){ var st = document.createElement('style'); st.textContent = '.fs-btn{display:none !important;}'; document.head.appendChild(st); }
})();

