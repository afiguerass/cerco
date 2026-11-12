/* Archivo sacado tal cual de index.html (Fase 1, paso 1.6). El orden de carga
   importa: se carga en el mismo sitio de la página donde estaba. */
/* ================================================================
   CERCO · KILÓMETROS REALES ENTRE CLÍNICA Y CANDIDATO
   - Cada oferta se publica con las coordenadas de su municipio:
     el candidato ve "a 12 km" y puede filtrar por distancia.
   - El candidato dice dónde vive y hasta dónde se desplaza; aquí la
     clínica lo ve en la tarjeta y en la ficha, y filtra por km
     desde la dirección de la clínica.
   ================================================================ */
(function(){
  if(!window.CGeo) return;
  var e = function(s){ return String(s == null ? '' : s).replace(/[&<>"']/g, function(c){ return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]; }); };

  /* ---------- 1. el buscador de ubicación conoce todos los municipios ---------- */
  try{
    var AL = {'Bizkaia':'Vizcaya', 'Gipuzkoa':'Guipúzcoa', 'Illes Balears':'Baleares', 'Santa Cruz de Tenerife':'S.C. Tenerife'};
    var reg = {}, ya = {};
    ES_LOCATIONS.forEach(function(l){ reg[l.p] = l.r; ya[CGeo.norm(l.c) + '|' + l.p] = 1; });
    CGeo.todos().forEach(function(l){
      if(l.ali) return;
      var p = AL[l.p] || l.p, k = l.k + '|' + p;
      if(ya[k]) return; ya[k] = 1;
      ES_LOCATIONS.push({c:l.n, p:p, r:reg[p] || ''});
    });
  }catch(x){}

  /* ---------- 2. al publicar: la ubicación tiene que ser un municipio ---------- */
    
  /* ---------- 3. desde dónde medimos: la dirección de la clínica ---------- */
  var DEF = 'Calle Gran Vía 28, Madrid';
  function origen(){
    var i = document.getElementById('clinic-address-portal');
    var g = i && i.value.trim() ? CGeo.lugar(i.value) : null;
    if(!g){ try{ var c = CDB.clinica() || {}; if(!i || !i.value.trim()) g = CGeo.lugar(c.ciutat); }catch(x){} }
    return g ? CGeo.geo(g) : null;
  }
  function rellenarOrigen(){
    var i = document.getElementById('clinic-address-portal'); if(!i || i.dataset.geoReal) return;
    var c = {}; try{ c = CDB.clinica() || {}; }catch(x){}
    if(!c.ciutat) return;
    i.dataset.geoReal = '1';
    if(!i.value.trim() || i.value.trim() === DEF) i.value = [c.direccion || c.adreca, c.ciutat].filter(Boolean).join(', ');
  }
  // candidato: dónde vive (lo guarda el portal; si es antiguo, por el nombre)
  function geoCand(c){
    if(c && c.geo && c.geo.lat != null) return c.geo;
    var l = c ? CGeo.lugar(c.ciudad) : null; return l ? CGeo.geo(l) : null;
  }
  function txtRadioCand(r){ return r === 'todo' ? 'se mudaría' : (r === 'prov' ? 'se desplaza por su provincia' : 'se desplaza hasta ' + r + ' km'); }
  window._geoLinea = function(c, grande){
    var g = geoCand(c), o = origen(); if(!g) return '';
    var k = CGeo.km(o, g), r = c.radio;
    var fuera = o && r && !CGeo.dentro(g, o, r);
    var t = (k === null ? 'Vive en ' + e(g.n) : 'Vive en ' + e(g.n) + ', ' + (k < 1 ? 'al lado de tu clínica' : 'a <b>' + k + ' km</b>'))
      + (r ? ' · ' + txtRadioCand(r) : '');
    var col = fuera ? '#B45309' : '#1A56DB';
    return '<div class="geo-linea" style="display:flex;align-items:flex-start;gap:5px;font-size:' + (grande ? '13px' : '12.5px') + ';color:' + (fuera ? '#B45309' : '#4B5563') + ';margin:' + (grande ? '6px 0 0' : '0 0 6px') + ';line-height:1.45;">'
      + '<svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="' + col + '" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="flex-shrink:0;margin-top:2px;"><path d="M20 10c0 4.993-5.539 10.193-7.399 11.799a1 1 0 0 1-1.202 0C9.539 20.193 4 14.993 4 10a8 8 0 0 1 16 0"/><circle cx="12" cy="10" r="3"/></svg>'
      + '<span>' + t + (fuera ? ' · <b>le queda más lejos de lo que marcó</b>' : '') + '</span></div>';
  };
  window._geoAttrs = function(c){
    var g = geoCand(c); return g ? ' data-lat="' + g.lat + '" data-lng="' + g.lng + '" data-prov="' + e(g.prov) + '" data-n="' + e(g.n) + '"' : '';
  };

  /* ---------- 4. filtro por km sobre los candidatos reales ---------- */
  function radioActivo(){
    var ch = document.querySelector('#screen-portal .radius-chip.active');
    var k = ch ? ch.dataset.km : '9999';
    return k === 'prop' ? 'prop' : (k === '150' ? 'prov' : (+k >= 9999 ? 'todo' : +k));
  }
  function geoCard(card){ return card.dataset.lat ? { lat:+card.dataset.lat, lng:+card.dataset.lng, prov:card.dataset.prov, n:card.dataset.n } : null; }
  window._geoOkReal = function(card){
    var r = radioActivo(), o = origen();
    if(r === 'prop' || r === 'todo' || !o) return true;
    var g = geoCard(card); if(!g) return false;
    return CGeo.dentro(o, g, r);
  };
  window._geoDespuesReal = function(){
    var box = document.getElementById('portal-reales-lista');
    if(!box){
      // hay candidatos reales, pero ninguno en esta oferta: la nota de los ejemplos no vale
      var hayR = false; try{ hayR = !CDB.demo() && (CERCO_candidaturas() || []).some(function(x){ return x.estado !== 'retirada'; }); }catch(x){}
      var nt = document.getElementById('location-result-note'); if(hayR && nt) nt.innerHTML = '';
      return;
    }
    var cards = [].slice.call(box.querySelectorAll('.cand-real'));
    var o = origen(), r = radioActivo();
    cards.forEach(function(c, i){ if(!c.dataset.ord) c.dataset.ord = i; c.dataset.km = o && geoCard(c) ? CGeo.km(o, geoCard(c)) : 99999; });
    cards.sort(function(a,b){ return r === 'prop' ? (+a.dataset.km - +b.dataset.km) || (+a.dataset.ord - +b.dataset.ord) : (+a.dataset.ord - +b.dataset.ord); });
    cards.forEach(function(c){ box.appendChild(c); });
    var vis = cards.filter(function(c){ return c.style.display !== 'none'; });
    // si la distancia deja fuera a alguien, se dice cuántos y a qué km está el más cercano
    var q = ((document.getElementById('search-portal')||{}).value || '').trim();
    var fuera = cards.filter(function(c){ return c.style.display === 'none' && !window._geoOkReal(c); });
    var vac = document.getElementById('reales-vacio');
    if(!vis.length && cards.length){
      if(!vac){ vac = document.createElement('div'); vac.id = 'reales-vacio'; vac.style.cssText = 'background:white;border:1px dashed #D8DEE9;border-radius:16px;padding:28px 22px;text-align:center;margin-bottom:16px;'; box.parentNode.insertBefore(vac, box.nextSibling); }
      var cer = fuera.slice().sort(function(a,b){ return +a.dataset.km - +b.dataset.km; })[0];
      vac.innerHTML = '<div style="font-size:15px;font-weight:800;color:#111827;margin-bottom:6px;">' + (fuera.length && !q ? 'Nadie tan cerca de tu clínica' : 'Sin resultados') + '</div>'
        + '<div style="font-size:13.5px;color:#6B7280;line-height:1.6;">' + (fuera.length ? fuera.length + (fuera.length === 1 ? ' candidato vive' : ' candidatos viven') + ' más lejos' + (cer && +cer.dataset.km < 99999 ? '; el más cercano, en ' + e(cer.dataset.n) + ' (a ' + cer.dataset.km + ' km)' : '') + '.' : 'Prueba con otra palabra o quita el filtro de perfil.') + '</div>'
        + '<div style="margin-top:14px;"><button onclick="(document.querySelector(\'#screen-portal .radius-chip[data-km=&quot;9999&quot;]\')||{click:function(){}}).click()" style="background:#1A56DB;color:white;border:none;border-radius:9px;padding:10px 20px;font-size:13px;font-weight:700;cursor:pointer;font-family:inherit;">Ver todos</button></div>';
      vac.style.display = '';
    } else if(vac) vac.style.display = 'none';
    var note = document.getElementById('location-result-note');
    if(note){
      var oi = document.getElementById('clinic-address-portal'), ot = oi ? oi.value.trim() : '';
      if(!o) note.innerHTML = ot ? 'No encontramos «' + e(ot) + '». Escribe el municipio de tu clínica para medir los km · ' + vis.length + ' candidatos' : 'Escribe la dirección de tu clínica para ver a cuántos km vive cada candidato';
      else {
        var desde = '<b>' + e(o.n) + '</b>';
        note.innerHTML = (r === 'prop' ? 'Del más cerca al más lejos de ' + desde
          : r === 'todo' ? 'Candidatos de <b>toda España</b>'
          : r === 'prov' ? 'Candidatos de la provincia de <b>' + e(o.prov) + '</b>'
          : 'Candidatos a menos de <b>' + r + ' km</b> de ' + desde)
          + ' · ' + vis.length + (vis.length === 1 ? ' visible' : ' visibles') + (fuera.length && vis.length ? ' · ' + fuera.length + ' más lejos' : '');
      }
    }
  };
  window._geoPrepReal = function(hay){
    rellenarOrigen();
  };
  // los chips de km de la pantalla llaman a su propio filtro (el de los ejemplos): después pasamos el nuestro
  document.addEventListener('click', function(ev){
    if(ev.target.closest && ev.target.closest('#screen-portal .radius-chip')) setTimeout(function(){ try{ window.applyFilters_portal(); }catch(x){} }, 0);
  });
  try{ if(typeof applyFilters_portal === 'function') applyFilters_portal(); }catch(x){}
})();
