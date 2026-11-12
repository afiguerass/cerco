/* Archivo sacado tal cual de index.html (Fase 1, paso 1.6). El orden de carga
   importa: se carga en el mismo sitio de la página donde estaba. */
/* ================================================================
   PANTALLA COMPLETA EN TODOS LOS VÍDEOS
   Cada vídeo con controles lleva su botón «Pantalla completa».
   Doble clic también. Si el navegador no deja (por ejemplo, dentro
   de otra página), el vídeo ocupa toda la ventana igualmente.
   ================================================================ */
(function(){
  var ICO = '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M8 3H5a2 2 0 0 0-2 2v3M21 8V5a2 2 0 0 0-2-2h-3M3 16v3a2 2 0 0 0 2 2h3M16 21h3a2 2 0 0 0 2-2v-3"/></svg>';
  function permitido(){ return !!(document.fullscreenEnabled || document.webkitFullscreenEnabled); }
  function salirFalsa(){
    var f = document.querySelector('.fs-falsa'); if(!f) return;
    var v = f.querySelector('video'), sitio = f.__sitio;
    if(v && sitio && sitio.parentNode) sitio.parentNode.insertBefore(v, sitio);
    if(sitio) sitio.remove(); f.remove(); document.removeEventListener('keydown', escFalsa);
  }
  function escFalsa(ev){ if(ev.key === 'Escape') salirFalsa(); }
  function falsa(v){
    // el vídeo pasa a ocupar toda la ventana, sin perder por dónde iba
    var sitio = document.createElement('span'); sitio.style.display = 'none'; v.parentNode.insertBefore(sitio, v);
    var f = document.createElement('div'); f.className = 'fs-falsa'; f.__sitio = sitio;
    f.style.cssText = 'position:fixed;inset:0;z-index:2147483000;background:#000;display:flex;align-items:center;justify-content:center;';
    var x = document.createElement('button'); x.type = 'button'; x.setAttribute('aria-label', 'Salir de pantalla completa');
    x.style.cssText = 'position:absolute;top:12px;right:12px;z-index:2;width:44px;height:44px;border-radius:50%;border:0;background:rgba(255,255,255,.18);color:#fff;font-size:24px;cursor:pointer;';
    x.textContent = '×'; x.onclick = salirFalsa;
    f.appendChild(v); f.appendChild(x); document.body.appendChild(f);
    v.style.maxHeight = '100%';
    document.addEventListener('keydown', escFalsa);
  }
  window.CERCO_pantallaCompleta = function(v){
    if(!v) return;
    if(document.querySelector('.fs-falsa')){ salirFalsa(); return; }
    var ya = document.fullscreenElement || document.webkitFullscreenElement;
    if(ya){ try{ (document.exitFullscreen || document.webkitExitFullscreen).call(document); }catch(x){} return; }
    var pide = v.requestFullscreen || v.webkitRequestFullscreen || v.msRequestFullscreen;
    if(pide && permitido()){
      try{
        var p = pide.call(v);
        if(p && p.catch) p.catch(function(){ if(v.webkitEnterFullscreen){ try{ v.webkitEnterFullscreen(); return; }catch(x){} } falsa(v); });
        return;
      }catch(x){}
    }
    // iPhone: el vídeo tiene su propia pantalla completa
    if(v.webkitEnterFullscreen){ try{ v.webkitEnterFullscreen(); return; }catch(x){} }
    falsa(v);
  };
  function preparar(v){
    if(v.dataset.fsListo || !v.hasAttribute('controls')) return;
    var caja = v.parentNode; if(!caja || caja.classList.contains('fs-falsa')) return;
    v.dataset.fsListo = '1';
    if(getComputedStyle(caja).position === 'static') caja.style.position = 'relative';
    var b = document.createElement('button'); b.type = 'button'; b.className = 'fs-btn';
    b.setAttribute('aria-label', 'Ver en pantalla completa'); b.title = 'Pantalla completa';
    b.innerHTML = ICO + '<span>Pantalla completa</span>';
    b.style.cssText = 'position:absolute;top:10px;right:10px;z-index:3;display:inline-flex;align-items:center;gap:6px;background:rgba(15,23,42,.72);color:#fff;border:0;border-radius:999px;padding:8px 12px;font:700 12.5px/1 inherit;font-family:inherit;cursor:pointer;backdrop-filter:blur(4px);';
    b.onclick = function(ev){ ev.preventDefault(); ev.stopPropagation(); CERCO_pantallaCompleta(v); };
    caja.appendChild(b);
    v.addEventListener('dblclick', function(ev){ ev.preventDefault(); CERCO_pantallaCompleta(v); });
  }
  function revisar(raiz){ (raiz || document).querySelectorAll('video[controls]').forEach(preparar); }
  try{
    new MutationObserver(function(ms){
      for(var i = 0; i < ms.length; i++){
        var ns = ms[i].addedNodes;
        for(var j = 0; j < ns.length; j++){
          var n = ns[j]; if(n.nodeType !== 1) continue;
          if(n.tagName === 'VIDEO') preparar(n); else if(n.querySelector && n.querySelector('video')) revisar(n);
        }
      }
    }).observe(document.documentElement, {childList:true, subtree:true});
  }catch(x){}
  if(document.readyState !== 'loading') revisar(); else document.addEventListener('DOMContentLoaded', function(){ revisar(); });
})();

