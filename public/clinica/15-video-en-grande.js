/* Archivo sacado tal cual de index.html (Fase 1, paso 1.6). El orden de carga
   importa: se carga en el mismo sitio de la página donde estaba. */
/* ================================================================
   VER EL VÍDEO EN GRANDE
   Se toca en cualquier parte de la portada y el vídeo se abre a toda
   la ventana, sobre fondo oscuro, a la altura de la pantalla.
   Se cierra con la X, con Esc o tocando fuera del vídeo.
   ================================================================ */
(function(){
  var st = document.createElement('style');
  st.textContent = ''
    + '#ficha-video, .pm-vid{position:relative;}'
    + '#ficha-video > button:not(.fs-btn), .pm-vid > .pm-play{position:absolute;inset:0;width:100%;height:100%;justify-content:center;}'
    + '.vid-visor{position:fixed !important;inset:0 !important;width:100vw !important;height:100vh !important;height:100dvh !important;max-height:none !important;aspect-ratio:auto !important;margin:0 !important;border-radius:0 !important;z-index:2147482000 !important;background:rgba(5,8,20,.96) !important;display:flex !important;align-items:center;justify-content:center;}'
    + '.vid-visor video{width:auto !important;height:100% !important;max-width:100% !important;max-height:100% !important;object-fit:contain;border-radius:0;}'
    + '.vid-visor .fs-btn{right:70px !important;top:14px !important;}'
    + '.visor-x{position:fixed;top:12px;right:12px;z-index:2147482001;width:46px;height:46px;border-radius:50%;border:0;background:rgba(255,255,255,.18);color:#fff;font-size:26px;line-height:1;cursor:pointer;}';
  document.head.appendChild(st);
  var abierto = null, boton = null;
  function cerrar(){
    var box = abierto; if(!box) return; abierto = null;
    if(boton){ boton.remove(); boton = null; }
    box.classList.remove('vid-visor');
    document.removeEventListener('keydown', tecla, true);
    document.documentElement.style.overflow = '';
    var v = box.querySelector('video'); if(v){ try{ v.pause(); }catch(x){} }
  }
  function tecla(ev){ if(ev.key === 'Escape' && !document.fullscreenElement){ ev.stopPropagation(); cerrar(); } }
  window.CERCO_visor = function(box){
    if(!box || abierto === box) return;
    cerrar(); abierto = box;
    box.classList.add('vid-visor');
    document.documentElement.style.overflow = 'hidden';
    boton = document.createElement('button'); boton.type = 'button'; boton.className = 'visor-x'; boton.setAttribute('aria-label', 'Cerrar el vídeo'); boton.textContent = '×';
    boton.onclick = function(ev){ ev.stopPropagation(); cerrar(); };
    document.body.appendChild(boton);
    if(!box.__visor){
      box.__visor = 1;
      // tocar el fondo (fuera del vídeo) también cierra
      box.addEventListener('click', function(ev){ if(abierto === box && ev.target === box) cerrar(); });
    }
    document.addEventListener('keydown', tecla, true);
  };
  window.CERCO_cerrarVisor = cerrar;
})();

(function(){
  // la clínica: al darle al vídeo, se abre en grande
  var _ver = window.verVideoCandidato;
  if(typeof _ver === 'function') window.verVideoCandidato = function(id){
    var r = _ver.apply(this, arguments);
    try{ CERCO_visor(document.getElementById('ficha-video')); }catch(x){}
    return r;
  };
})();
