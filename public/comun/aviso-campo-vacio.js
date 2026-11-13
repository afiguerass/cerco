/* ================================================================
   CERCO · AVISO DE CAMPO VACÍO (los dos lados)
   Si se pulsa «Enviar» (o la flecha de Seimian, o «Revisar») con el campo
   vacío, sale un aviso corto debajo y el cursor vuelve al campo. El aviso
   se quita en cuanto se empieza a escribir.
   ================================================================ */
window.CERCO_avisoVacio = function(input, texto){
  if(!input || !input.parentNode) return;
  var id = (input.id || 'campo') + '-vacio';
  var n = document.getElementById(id);
  if(!n){
    n = document.createElement('div');
    n.id = id; n.className = 'aviso-vacio'; n.setAttribute('role', 'alert');
    n.style.cssText = 'font-size:12.5px;color:#B45309;margin-top:6px;line-height:1.4;';
    // debajo del campo; si va en una fila con su botón (formulario), debajo de la fila
    var ancla = input.tagName === 'TEXTAREA' ? input : (input.closest('form') || input.parentNode);
    ancla.parentNode.insertBefore(n, ancla.nextSibling);
    var quitar = function(){ var x = document.getElementById(id); if(x) x.remove(); input.removeEventListener('input', quitar); };
    input.addEventListener('input', quitar);
  }
  n.textContent = texto || 'Escribe algo antes de enviar.';
  try{ input.focus({ preventScroll: true }); }catch(e){}
};
