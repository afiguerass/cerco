/* ================================================================
   CERCO · MUNICIPIOS Y DISTANCIAS (km)
   Busca municipios, entiende direcciones («Calle Mayor 3, Salt (Girona)» → Salt)
   y calcula a cuántos km está una oferta o un candidato, sin llamar a ningún
   servicio externo. Los datos están en datos/municipios.js.
   ================================================================ */
window.CGeo = (function(){
  var P = window.CERCO_MUNICIPIOS.provincias;
  var RAW = window.CERCO_MUNICIPIOS.lista;
  var L = null;
  function norm(s){ return String(s||'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase().replace(/[^a-z0-9ñ ]+/g,' ').replace(/\s+/g,' ').trim(); }
  function carga(){
    if(L) return L;
    var REN = { 'Gasteiz / Vitoria':'Vitoria-Gasteiz', 'Castello de la Plana':'Castellón de la Plana', 'Mao':'Maó', 'Fuenterrabia':'Hondarribia' };
    L = RAW.split(';').map(function(x){ var a = x.split('|'), n = REN[a[0]] || a[0]; return { n:n, lat:+a[1], lng:+a[2], p:P[+a[3]], k:norm(n) }; });
    // nombres en otra lengua o antiguos -> el que tenemos
    var ALI = { 'donostia':'san sebastian', 'alacant':'alicante', 'castello':'castellon de la plana', 'castellon':'castellon de la plana', 'vitoria':'vitoria gasteiz', 'gasteiz':'vitoria gasteiz',
      'iruna':'pamplona', 'orense':'ourense', 'lerida':'lleida', 'gerona':'girona', 'la coruna':'a coruna', 'coruna':'a coruna', 'palma de mallorca':'palma', 'xixon':'gijon', 'elx':'elche', 'vich':'vic', 'mahon':'mao', 'eivissa':'ibiza', 'fuenterrabia':'hondarribia', 'lerida':'lleida', 'sanxenxo':'sanxenxo' };
    Object.keys(ALI).forEach(function(a){ var o = L.filter(function(l){ return l.k === ALI[a]; })[0]; if(o && a !== o.k) L.push({ n:o.n, lat:o.lat, lng:o.lng, p:o.p, k:a, ali:1 }); });
    return L;
  }
  var GRANDES = { 'palma':'Illes Balears', 'bilbao':'Bizkaia', 'san sebastian':'Gipuzkoa', 'vitoria gasteiz':'Álava', 'santander':'Cantabria', 'oviedo':'Asturias', 'gijon':'Asturias', 'logrono':'La Rioja', 'pamplona':'Navarra',
    'castellon de la plana':'Castellón', 'las palmas de gran canaria':'Las Palmas', 'merida':'Badajoz', 'santiago de compostela':'A Coruña', 'vigo':'Pontevedra', 'elche':'Alicante', 'cartagena':'Murcia', 'jerez de la frontera':'Cádiz', 'reus':'Tarragona', 'sabadell':'Barcelona', 'terrassa':'Barcelona' };
  // cerca: {lat,lng} opcional; primero capitales y lo que te queda cerca
  function buscar(q, max, cerca){
    var k = norm(q); if(!k) return [];
    var ex = [], ini = [], con = [];
    carga().forEach(function(l){ if(l.k === k) ex.push(l); else if(l.k.indexOf(k) === 0) ini.push(l); else if(l.k.indexOf(k) > -1) con.push(l); });
    var peso = function(l){
      var w = l.k.length;
      if(norm(l.p) === l.k || GRANDES[l.k] === l.p) w -= 100;
      else if(cerca && cerca.lat != null){ var d = km(cerca, l); if(d !== null && d <= 60) w -= 50; }
      return w;
    };
    var porPeso = function(a,b){ return peso(a) - peso(b); };
    var vis = {};
    return ex.sort(porPeso).concat(ini.sort(porPeso), con.sort(porPeso)).filter(function(l){ var id = l.n + '|' + l.p; if(vis[id]) return false; vis[id] = 1; return true; }).slice(0, max || 8);
  }
  // "Calle Mayor 3, Salt (Girona)" -> Salt
  function lugar(txt){
    if(!txt) return null;
    var t = String(txt), prov = null;
    var m = t.match(/\(([^)]+)\)/); if(m){ prov = norm(m[1]); t = t.replace(m[0], ','); }
    var partes = t.split(/,| - /).map(function(x){ return x.trim(); }).filter(Boolean).reverse();
    partes.push(t);
    for(var i=0;i<partes.length;i++){
      var k = norm(partes[i].replace(/^\d{5}\s*/, ''));
      if(!k || /^\d+$/.test(k)) continue;
      var hits = carga().filter(function(l){ return l.k === k; });
      if(hits.length){
        if(prov){ var hp = hits.filter(function(l){ return norm(l.p) === prov; }); if(hp.length) return hp[0]; }
        return hits[0];
      }
      var pk = P.filter(function(p){ return norm(p) === k; })[0];
      if(pk){ var cap = carga().filter(function(l){ return l.p === pk && l.k === norm(pk); })[0]; if(cap) return cap; }
    }
    return null;
  }
  function km(a, b){
    if(!a || !b || a.lat == null || b.lat == null) return null;
    var R = 6371, r = Math.PI/180, dLa = (b.lat-a.lat)*r, dLo = (b.lng-a.lng)*r;
    var x = Math.sin(dLa/2)*Math.sin(dLa/2) + Math.cos(a.lat*r)*Math.cos(b.lat*r)*Math.sin(dLo/2)*Math.sin(dLo/2);
    return Math.round(2*R*Math.asin(Math.sqrt(x)));
  }
  function txtKm(d){ return d === null ? '' : (d < 1 ? 'en tu misma zona' : 'a ' + d + ' km'); }
  // lo mínimo para guardar
  function geo(l){ return l ? { lat:l.lat, lng:l.lng, prov:l.p, n:l.n } : null; }
  // ¿entra en el radio? radio: número de km, "prov" o "todo"
  function dentro(o, d, radio){
    if(radio === 'todo' || radio == null) return true;
    if(!o || !d) return false;
    if(radio === 'prov') return o.prov === d.prov;
    var k = km(o, d); return k !== null && k <= +radio;
  }
  function autocompletar(input, alElegir, cerca){
    if(!input || input.dataset.geo) return;
    input.dataset.geo = '1'; input.setAttribute('autocomplete','off');
    var w = document.createElement('div'); w.style.cssText = 'position:relative;';
    input.parentNode.insertBefore(w, input); w.appendChild(input);
    var dd = document.createElement('div'); dd.className = 'geo-dd'; dd.hidden = true; dd.setAttribute('role','listbox'); w.appendChild(dd);
    var sel = -1, hits = [];
    function pinta(){
      hits = buscar(input.value, 8, cerca ? cerca() : null); sel = -1;
      if(!hits.length || !norm(input.value)){ dd.hidden = true; return; }
      dd.innerHTML = hits.map(function(l, i){ return '<div class="geo-op" role="option" data-i="'+i+'"><b>'+l.n.replace(/</g,'&lt;')+'</b><span>'+l.p+'</span></div>'; }).join('');
      dd.hidden = false;
    }
    function elige(l){ input.value = l.n; dd.hidden = true; input.dataset.lat = l.lat; input.dataset.lng = l.lng; input.dataset.prov = l.p; if(alElegir) alElegir(l); }
    input.addEventListener('input', function(){ delete input.dataset.lat; pinta(); });
    input.addEventListener('focus', pinta);
    input.addEventListener('keydown', function(e){
      if(dd.hidden) return;
      var ops = dd.querySelectorAll('.geo-op');
      if(e.key === 'ArrowDown'){ e.preventDefault(); sel = Math.min(ops.length-1, sel+1); }
      else if(e.key === 'ArrowUp'){ e.preventDefault(); sel = Math.max(0, sel-1); }
      else if(e.key === 'Enter'){ if(sel > -1 || hits.length){ e.preventDefault(); e.stopPropagation(); elige(hits[Math.max(sel,0)]); } return; }
      else if(e.key === 'Escape'){ dd.hidden = true; return; }
      else return;
      ops.forEach(function(o, i){ o.classList.toggle('on', i === sel); });
    });
    dd.addEventListener('mousedown', function(e){ var o = e.target.closest('.geo-op'); if(o){ e.preventDefault(); elige(hits[+o.dataset.i]); } });
    document.addEventListener('click', function(e){ if(!w.contains(e.target)) dd.hidden = true; });
  }
  return { buscar:buscar, lugar:lugar, km:km, txtKm:txtKm, geo:geo, dentro:dentro, autocompletar:autocompletar, norm:norm, provincias:P, todos:function(){ return carga(); } };
})();
