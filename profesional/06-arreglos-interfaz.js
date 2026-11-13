/* Archivo sacado tal cual de candidato.html (Fase 1, paso 1.6). El orden de carga
   importa: se carga en el mismo sitio de la página donde estaba. */
/* Arreglos del test UI/UX: al bajar, Seimian se aparta; al subir, vuelve */
(function(){ var y0 = 0; window.addEventListener('scroll', function(){ var y = window.scrollY || 0; if(Math.abs(y - y0) < 8) return; document.body.classList.toggle('baja', y > y0 && y > 80); y0 = y; }, {passive:true}); })();
