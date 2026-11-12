/* Archivo sacado tal cual de index.html (Fase 1, paso 1.6). El orden de carga
   importa: se carga en el mismo sitio de la página donde estaba. */
/* ================================================================
   FORMULARIO DE OFERTA MÁS FÁCIL
   - Título: al pulsar sale la lista de puestos; se elige con un toque
     o se escribe uno propio.
   - Salario: rangos de referencia del sector para ese puesto, con un
     toque se rellenan; se puede escribir cualquier cifra.
   ================================================================ */
(function(){
  function $(id){ return document.getElementById(id); }
  function e(t){ return String(t == null ? '' : t).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;'); }
  function norm(t){ return String(t || '').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g,''); }
  var PUESTOS = [
    ['Higienista dental','Higiene y prevención'],
    ['Auxiliar de clínica dental','Gabinete y esterilización'],
    ['Odontólogo/a general','Odontología'],
    ['Ortodoncista','Odontología'],
    ['Endodoncista','Odontología'],
    ['Periodoncista','Odontología'],
    ['Implantólogo/a','Odontología'],
    ['Cirujano/a oral y maxilofacial','Odontología'],
    ['Odontopediatra','Odontología'],
    ['Prostodoncista','Odontología'],
    ['Recepcionista de clínica dental','Recepción y gestión'],
    ['Asesor/a de pacientes','Recepción y gestión'],
    ['Coordinador/a de clínica','Recepción y gestión'],
    ['Gerente de clínica dental','Recepción y gestión'],
    ['Protésico/a dental','Laboratorio']
  ];
  var BANDAS = {
    hig:[[18000,20000],[20000,24000],[24000,28000]],
    aux:[[15500,17500],[17500,20000],[20000,23000]],
    recep:[[15500,18000],[18000,21000],[21000,24000]],
    odo:[[30000,40000],[40000,55000],[55000,70000]],
    orto:[[35000,50000],[50000,65000],[65000,85000]],
    coord:[[20000,24000],[24000,28000],[28000,34000]],
    prot:[[17000,20000],[20000,24000],[24000,30000]]
  };
  function grupo(t){ try{ return CERCO_grupo(t).k; }catch(x){ return 'otros'; } }
  function disparar(el){ if(!el) return; el.dispatchEvent(new Event('input', {bubbles:true})); el.dispatchEvent(new Event('change', {bubbles:true})); }

  var css = document.createElement('style');
  css.textContent = ''
  + '.tit-wrap{position:relative;}'
  + '#co-tit-dd{position:absolute;left:0;right:0;top:calc(100% + 4px);z-index:60;background:#fff;border:1px solid #E5E7EB;border-radius:12px;box-shadow:0 12px 32px rgba(15,28,63,.14);max-height:320px;overflow:auto;padding:6px 0;}'
  + '#co-tit-dd .dd-g{font-size:11px;font-weight:800;letter-spacing:.7px;color:#6B7280;padding:10px 14px 4px;text-transform:uppercase;}'
  + '#co-tit-dd button{display:block;width:100%;text-align:left;border:0;background:none;padding:10px 14px;font:inherit;font-size:14.5px;color:#111827;cursor:pointer;}'
  + '#co-tit-dd button:hover,#co-tit-dd button.act{background:#EEF3FE;color:#1A56DB;}'
  + '#co-tit-dd .dd-pie{font-size:12px;color:#6B7280;padding:8px 14px 6px;border-top:1px solid #F1F3F5;margin-top:4px;line-height:1.45;}'
  + '.sal-sug{display:flex;flex-wrap:wrap;gap:7px;margin-top:8px;}'
  + '.sal-sug button{border:1px solid #D5DAE1;background:#fff;color:#374151;border-radius:999px;padding:8px 12px;font:inherit;font-size:13px;font-weight:600;cursor:pointer;min-height:38px;}'
  + '.sal-sug button.on{background:#1A56DB;border-color:#1A56DB;color:#fff;}'
  + '.sal-sug button small{font-weight:500;opacity:.75;margin-left:4px;}';
  document.head.appendChild(css);

  /* ---------- título con lista de puestos ---------- */
  var act = -1;
  function lista(){
    var i = $('co-titulo'), q = norm(i && i.value), l = PUESTOS.filter(function(p){ return !q || norm(p[0]).indexOf(q) > -1 || norm(p[1]).indexOf(q) > -1; });
    var exacto = PUESTOS.some(function(p){ return norm(p[0]) === q; });
    return { l: l, q: q, exacto: exacto };
  }
  function pintarDD(){
    var i = $('co-titulo'); if(!i) return; var dd = $('co-tit-dd');
    var r = lista();
    if(r.exacto || (!r.l.length && r.q)){ if(dd) dd.remove(); return; }
    if(!dd){ dd = document.createElement('div'); dd.id = 'co-tit-dd'; dd.setAttribute('role','listbox'); i.parentElement.appendChild(dd); i.setAttribute('aria-expanded','true'); }
    var h = '', g = '';
    r.l.forEach(function(p, k){
      if(p[1] !== g){ g = p[1]; h += '<div class="dd-g">' + e(g) + '</div>'; }
      h += '<button type="button" role="option" data-v="' + e(p[0]) + '" class="' + (k === act ? 'act' : '') + '">' + e(p[0]) + '</button>';
    });
    h += '<div class="dd-pie">¿No está? Escríbelo tal cual, por ejemplo «Higienista dental (tardes)».</div>';
    dd.innerHTML = h;
  }
  function cerrarDD(){ var dd = $('co-tit-dd'); if(dd) dd.remove(); act = -1; var i = $('co-titulo'); if(i) i.setAttribute('aria-expanded','false'); }
  function elegir(v){ var i = $('co-titulo'); if(!i) return; i.value = v; cerrarDD(); disparar(i); try{ suggestDiscFromRole(); }catch(x){} pintarSal(); }
  function montarTitulo(){
    var i = $('co-titulo'); if(!i || i.dataset.dd) return; i.dataset.dd = '1';
    i.setAttribute('autocomplete','off'); i.setAttribute('aria-autocomplete','list'); i.setAttribute('aria-expanded','false');
    i.placeholder = 'Pulsa para elegir el puesto o escríbelo';
    if(i.parentElement) i.parentElement.classList.add('tit-wrap');
    i.addEventListener('focus', function(){ act = -1; pintarDD(); });
    i.addEventListener('click', function(){ pintarDD(); });
    i.addEventListener('input', function(){ act = -1; pintarDD(); pintarSal(); });
    i.addEventListener('keydown', function(ev){
      var dd = $('co-tit-dd'); if(!dd) return; var bs = dd.querySelectorAll('button');
      if(ev.key === 'ArrowDown'){ ev.preventDefault(); act = Math.min(bs.length - 1, act + 1); pintarDD(); }
      else if(ev.key === 'ArrowUp'){ ev.preventDefault(); act = Math.max(0, act - 1); pintarDD(); }
      else if(ev.key === 'Enter' && act > -1 && bs[act]){ ev.preventDefault(); elegir(bs[act].dataset.v); }
      else if(ev.key === 'Escape' || ev.key === 'Tab'){ cerrarDD(); }
    });
    i.addEventListener('blur', function(){ setTimeout(cerrarDD, 150); });
    i.parentElement.addEventListener('mousedown', function(ev){ var b = ev.target.closest && ev.target.closest('#co-tit-dd button'); if(b){ ev.preventDefault(); elegir(b.dataset.v); } });
  }

  /* ---------- salario: rangos de referencia ---------- */
  function num(v){ return String(v).replace(/\B(?=(\d{3})+(?!\d))/g, '.'); }
  function pintarSal(){
    var fila = document.querySelector('#screen-crear-oferta .sal-row'); if(!fila) return;
    var box = $('co-sal-sug');
    if(!box){ box = document.createElement('div'); box.id = 'co-sal-sug'; fila.parentElement.insertBefore(box, fila.nextSibling); }
    var b = BANDAS[grupo(($('co-titulo') || {}).value)];
    if(!b){ box.innerHTML = ''; return; }
    var mi = String(($('co-sal-min') || {}).value || '').replace(/\D/g,''), ma = String(($('co-sal-max') || {}).value || '').replace(/\D/g,''), per = ($('co-sal-per') || {}).value;
    var nombres = ['parte baja','media','parte alta'];
    box.innerHTML = '<div style="font-size:12px;color:#6B7280;margin-top:8px;">Referencia del sector para este puesto (jornada completa). Pulsa una o escribe tu cifra:</div><div class="sal-sug" role="group" aria-label="Rangos de referencia">'
      + b.map(function(r, k){ var on = per === 'año' && +mi === r[0] && +ma === r[1]; return '<button type="button" aria-pressed="' + on + '" class="' + (on ? 'on' : '') + '" onclick="CERCO_salBanda(' + r[0] + ',' + r[1] + ')">' + num(r[0]) + '–' + num(r[1]) + ' €/año<small>' + nombres[k] + '</small></button>'; }).join('')
      + '</div>';
  }
  window.CERCO_salBanda = function(a, b){
    var mi = $('co-sal-min'), ma = $('co-sal-max'), per = $('co-sal-per');
    if(per){ per.value = 'año'; disparar(per); }
    if(mi){ mi.value = num(a); disparar(mi); }
    if(ma){ ma.value = num(b); disparar(ma); }
    pintarSal();
  };
  document.addEventListener('input', function(ev){ if(ev.target && /^co-sal-(min|max)$/.test(ev.target.id)) pintarSal(); });
  document.addEventListener('change', function(ev){ if(ev.target && ev.target.id === 'co-sal-per') pintarSal(); });

  function listo(){ try{ montarTitulo(); pintarSal(); }catch(x){} }
  if(document.readyState === 'loading') document.addEventListener('DOMContentLoaded', listo); else listo();
  var _sc = window.showScreen;
  if(typeof _sc === 'function') window.showScreen = showScreen = function(n){ var r = _sc.apply(this, arguments); if(n === 'crear-oferta') setTimeout(listo, 50); return r; };
})();

