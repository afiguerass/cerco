/* Archivo sacado tal cual de candidato.html (Fase 1, paso 1.6). El orden de carga
   importa: se carga en el mismo sitio de la página donde estaba. */
/* ================================================================
   EDITOR DE VÍDEO COMPLETO (como TikTok o Instagram)
   Además de recortar y elegir portada:
   - Filtros: 6 estilos y ajustes de luz, contraste, color y calidez.
   - Encuadre: acercar y mover la imagen.
   - Texto en pantalla: tu nombre y profesión, arriba, en medio o abajo.
   - Sonido: volumen y «voz más clara» (quita zumbidos y empareja el volumen).
   Si solo cambias el recorte o la portada, se guarda al momento.
   Si tocas filtros, encuadre, texto o sonido, se crea un vídeo nuevo
   con los cambios ya puestos, para que la clínica lo vea igual que tú.
   ================================================================ */
(function(){
  var NEUTRO = { luz:0, con:0, col:0, cal:0, zoom:1, zx:0.5, zy:0.5, txt:'', pos:'abajo', est:'sombra', vol:100, voz:false, preset:'orig' };
  var PRESETS = [
    ['orig','Original',{luz:0,con:0,col:0,cal:0}],
    ['lumi','Luminoso',{luz:18,con:6,col:8,cal:4}],
    ['calido','Cálido',{luz:6,con:4,col:10,cal:30}],
    ['frio','Frío',{luz:4,con:6,col:-4,cal:-28}],
    ['nitido','Nítido',{luz:2,con:24,col:14,cal:0}],
    ['suave','Suave',{luz:10,con:-14,col:-10,cal:8}],
    ['bn','Blanco y negro',{luz:6,con:18,col:-100,cal:0}]
  ];
  var X = null;
  function fx(){ return X || (X = Object.assign({}, NEUTRO)); }
  function cambiado(){ var a = fx(); return a.luz || a.con || a.col || a.cal || a.zoom > 1.001 || a.txt.trim() || a.vol !== 100 || a.voz; }
  // el mismo filtro sirve para la vista previa (CSS) y para el vídeo final (canvas)
  function filtro(a){
    a = a || fx(); var f = [];
    if(a.luz) f.push('brightness(' + (1 + a.luz / 100).toFixed(3) + ')');
    if(a.con) f.push('contrast(' + (1 + a.con / 100).toFixed(3) + ')');
    if(a.col) f.push('saturate(' + Math.max(0, 1 + a.col / 100).toFixed(3) + ')');
    if(a.cal > 0) f.push('sepia(' + (a.cal / 100 * 0.45).toFixed(3) + ')');
    if(a.cal < 0) f.push('hue-rotate(' + (a.cal / 100 * 18).toFixed(1) + 'deg) saturate(' + (1 + a.cal / 100 * 0.15).toFixed(3) + ')');
    return f.join(' ') || 'none';
  }
  window.CERCO_evFiltro = filtro;

  var css = document.createElement('style');
  css.textContent = ''
  + '.ev2-tabs{overflow-x:auto;scrollbar-width:none;padding:12px 12px 4px;}.ev2-tabs::-webkit-scrollbar{display:none;}'
  + '.ev2-tabs{gap:5px;}.ev2-tabs button{flex:1 1 0;min-width:56px;flex-direction:column;gap:3px;padding:8px 2px;font-size:11.5px;min-height:54px;}'
  + '.ev2-pan{overflow-y:auto;max-height:44dvh;}'
  + '.ev3-wrap{position:relative;height:100%;max-width:100%;display:inline-flex;align-items:center;justify-content:center;overflow:hidden;}'
  + '.ev3-wrap video{transform-origin:50% 50%;}'
  + '.ev3-txt{position:absolute;left:6%;right:6%;text-align:center;font-weight:800;line-height:1.2;pointer-events:none;word-break:break-word;}'
  + '.ev3-txt span{display:inline-block;padding:.25em .55em;border-radius:.35em;}'
  + '.ev3-txt.arriba{top:7%;}.ev3-txt.medio{top:50%;transform:translateY(-50%);}.ev3-txt.abajo{bottom:9%;}'
  + '.ev3-txt.sombra span{color:#fff;text-shadow:0 2px 6px rgba(0,0,0,.85),0 0 2px rgba(0,0,0,.9);}'
  + '.ev3-txt.oscura span{color:#fff;background:rgba(15,28,63,.82);}'
  + '.ev3-txt.clara span{color:#0F1C3F;background:rgba(255,255,255,.92);}'
  + '.ev3-pres{display:flex;gap:10px;overflow-x:auto;padding:2px 2px 10px;scrollbar-width:none;}.ev3-pres::-webkit-scrollbar{display:none;}'
  + '.ev3-pre{flex:0 0 auto;width:66px;background:none;border:0;color:#A9AFBC;font:inherit;font-size:11.5px;font-weight:700;cursor:pointer;padding:0;text-align:center;}'
  + '.ev3-pre i{display:block;width:66px;height:84px;border-radius:10px;background:#1C1C24 center/cover;margin-bottom:5px;border:2px solid transparent;}'
  + '.ev3-pre[aria-pressed="true"]{color:#fff;}.ev3-pre[aria-pressed="true"] i{border-color:#fff;}'
  + '.ev3-sl{display:grid;grid-template-columns:78px 1fr 52px;align-items:center;gap:10px;margin:6px 0;font-size:13px;color:#C9CED8;}'
  + '.ev3-sl input{width:100%;accent-color:#fff;height:28px;}'
  + '.ev3-sl output{text-align:right;font-variant-numeric:tabular-nums;color:#fff;font-weight:700;}'
  + '.ev3-in{width:100%;box-sizing:border-box;background:#1C1C24;border:1px solid #2C2C36;color:#fff;border-radius:12px;padding:12px 14px;font:inherit;font-size:15px;}'
  + '.ev3-in::placeholder{color:#7D8494;}'
  + '.ev3-chips{display:flex;flex-wrap:wrap;gap:7px;margin-top:10px;}'
  + '.ev3-chip{background:#1C1C24;border:1px solid #2C2C36;color:#C9CED8;border-radius:999px;padding:9px 13px;font:inherit;font-size:13px;font-weight:700;cursor:pointer;min-height:40px;}'
  + '.ev3-chip[aria-pressed="true"]{background:#fff;color:#0B0B0F;border-color:#fff;}'
  + '.ev3-lbl{font-size:11.5px;font-weight:800;letter-spacing:.6px;color:#7D8494;margin:14px 0 2px;}'
  + '.ev3-sw{display:flex;align-items:flex-start;gap:12px;background:#1C1C24;border-radius:12px;padding:12px 14px;margin-top:10px;cursor:pointer;}'
  + '.ev3-sw input{width:20px;height:20px;accent-color:#fff;margin-top:2px;flex-shrink:0;}'
  + '.ev3-sw b{display:block;font-size:14px;color:#fff;}.ev3-sw span{font-size:12.5px;color:#A9AFBC;line-height:1.45;}'
  + '.ev3-reset{background:none;border:0;color:#9FB6E8;font:inherit;font-size:13px;font-weight:700;cursor:pointer;padding:10px 0 0;}'
  + '.ev3-aviso{font-size:12.5px;color:#A9AFBC;line-height:1.5;margin-top:10px;}'
  + '.ev3-prog{position:absolute;inset:0;background:rgba(0,0,0,.78);display:flex;flex-direction:column;align-items:center;justify-content:center;gap:12px;z-index:5;text-align:center;padding:24px;}'
  + '.ev3-prog b{font-size:16px;}.ev3-prog span{font-size:13px;color:#C9CED8;max-width:300px;line-height:1.5;}'
  + '.ev3-bar{width:min(280px,80%);height:6px;border-radius:99px;background:#2C2C36;overflow:hidden;}.ev3-bar i{display:block;height:100%;width:0;background:#fff;transition:width .25s;}'
  + '.ev2-stage.zoom video{cursor:grab;}';
  document.head.appendChild(css);

  var I = {
    f:'<circle cx="13.5" cy="6.5" r=".5"/><circle cx="17.5" cy="10.5" r=".5"/><circle cx="8.5" cy="7.5" r=".5"/><circle cx="6.5" cy="12.5" r=".5"/><path d="M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10c.926 0 1.648-.746 1.648-1.688 0-.437-.18-.835-.437-1.125-.29-.289-.438-.652-.438-1.125a1.64 1.64 0 0 1 1.668-1.668h1.996c3.051 0 5.555-2.503 5.555-5.554C21.965 6.012 17.461 2 12 2z"/>',
    e:'<path d="M15 3h6v6"/><path d="M9 21H3v-6"/><path d="M21 3l-7 7"/><path d="M3 21l7-7"/>',
    x:'<path d="M4 7V4h16v3"/><path d="M9 20h6"/><path d="M12 4v16"/>',
    s:'<path d="M11 5 6 9H2v6h4l5 4V5z"/><path d="M15.54 8.46a5 5 0 0 1 0 7.07"/><path d="M19.07 4.93a10 10 0 0 1 0 14.14"/>'
  };
  function ico(k){ return '<svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' + I[k] + '</svg>'; }
  function pressed(on){ return ' aria-pressed="' + (on ? 'true' : 'false') + '"'; }
  function sugTexto(){ var p = S.perfil || {}, n = String(p.nombre || '').trim().split(/\s+/)[0]; return [n, p.profesion].filter(Boolean).join(' · '); }

  /* ---------- montar las pestañas nuevas dentro del editor ---------- */
  var _abrir = window.abrirEditorVideo;
  window.abrirEditorVideo = abrirEditorVideo = function(){
    X = Object.assign({}, NEUTRO);
    var r = _abrir.apply(this, arguments);
    var tabs = document.querySelector('.ev2-tabs'), err = $('m-err'); if(!tabs || !err) return r;
    [['f','Filtros'],['e','Encuadre'],['x','Texto'],['s','Sonido']].forEach(function(t){
      tabs.insertAdjacentHTML('beforeend', '<button role="tab" type="button" id="ev2-tab-' + t[0] + '" aria-selected="false" onclick="evTab(\'' + t[0] + '\')">' + ico(t[0]) + t[1] + '</button>');
    });
    err.insertAdjacentHTML('beforebegin',
        '<div class="ev2-pan" id="ev2-f" hidden><div class="ev3-pres" id="ev3-pres"></div><div id="ev3-sls"></div><button type="button" class="ev3-reset" onclick="CERCO_evReset(\'f\')">Quitar filtros</button></div>'
      + '<div class="ev2-pan" id="ev2-e" hidden><div class="ev2-info"><span>Acerca la imagen para que se te vea mejor. Con el zoom puesto, arrastra el vídeo para colocarte.</span></div><div id="ev3-zoom"></div><button type="button" class="ev3-reset" onclick="CERCO_evReset(\'e\')">Volver al encuadre original</button></div>'
      + '<div class="ev2-pan" id="ev2-x" hidden><input class="ev3-in" id="ev3-txt" maxlength="42" placeholder="Escribe un texto (por ejemplo, tu nombre)" aria-label="Texto en pantalla">'
      + '<div class="ev3-chips" id="ev3-sug"></div><div class="ev3-lbl">DÓNDE</div><div class="ev3-chips" id="ev3-pos"></div><div class="ev3-lbl">ESTILO</div><div class="ev3-chips" id="ev3-est"></div></div>'
      + '<div class="ev2-pan" id="ev2-s" hidden><div id="ev3-vol"></div>'
      + '<label class="ev3-sw"><input type="checkbox" id="ev3-voz" onchange="CERCO_evSet(\'voz\', this.checked)"><span><b>Voz más clara</b><span>Quita zumbidos graves y empareja el volumen para que se te entienda bien en cualquier móvil.</span></span></label>'
      + '<div class="ev3-aviso">El sonido se aplica al guardar. Para escuchar el resultado, guarda y mira tu vídeo en el perfil.</div></div>');
    // la vista previa: el vídeo dentro de un marco que recorta el zoom y lleva el texto encima
    var espera = setInterval(function(){
      var v = $('ev-vid'); if(!$('modal')){ clearInterval(espera); return; }
      if(!v) return; clearInterval(espera);
      var w = document.createElement('span'); w.className = 'ev3-wrap'; w.id = 'ev3-wrap';
      v.parentNode.insertBefore(w, v); w.appendChild(v);
      w.insertAdjacentHTML('beforeend', '<div class="ev3-txt" id="ev3-ov" hidden><span></span></div>');
      arrastreZoom(w);
      pintar();
    }, 120);
    return r;
  };

  var _tab = window.evTab;
  window.evTab = evTab = function(t){
    var nuevas = ['f','e','x','s'];
    if(nuevas.indexOf(t) === -1){
      nuevas.forEach(function(k){ var p = $('ev2-' + k), b = $('ev2-tab-' + k); if(p) p.hidden = true; if(b) b.setAttribute('aria-selected', 'false'); });
      return _tab.apply(this, arguments);
    }
    EV.tab = t;
    ['r','p'].concat(nuevas).forEach(function(k){ var p = $('ev2-' + k), b = $('ev2-tab-' + k); if(p) p.hidden = k !== t; if(b) b.setAttribute('aria-selected', k === t ? 'true' : 'false'); });
    var pl = $('ev2-play'); if(pl) pl.style.visibility = '';
    pintar();
    if(t === 'x'){ var i = $('ev3-txt'); if(i && !i.value) setTimeout(function(){ try{ i.focus(); }catch(x){} }, 50); }
  };

  function slider(id, k, txt, min, max, suf){
    var v = fx()[k];
    return '<label class="ev3-sl"><span>' + txt + '</span><input type="range" min="' + min + '" max="' + max + '" step="1" value="' + v + '" oninput="CERCO_evSet(\'' + k + '\', +this.value, this)" aria-label="' + txt + '"><output>' + (k === 'vol' ? v + ' %' : (v > 0 ? '+' : '') + v) + (suf || '') + '</output></label>';
  }
  function pintar(){
    var a = fx(), v = $('ev-vid');
    if(v){
      v.style.filter = filtro(a);
      v.style.transform = a.zoom > 1.001 ? 'translate(' + ((0.5 - a.zx) * (a.zoom - 1) * 100 / a.zoom).toFixed(2) + '%,' + ((0.5 - a.zy) * (a.zoom - 1) * 100 / a.zoom).toFixed(2) + '%) scale(' + a.zoom.toFixed(3) + ')' : '';
    }
    var st = $('ev2-stage'); if(st) st.classList.toggle('zoom', a.zoom > 1.001);
    var ov = $('ev3-ov');
    if(ov){ ov.hidden = !a.txt.trim(); ov.className = 'ev3-txt ' + a.pos + ' ' + a.est; ov.firstChild.textContent = a.txt; var w = $('ev3-wrap'); ov.style.fontSize = Math.max(14, Math.round(((w && w.clientWidth) || 300) * 0.062)) + 'px'; }
    var pres = $('ev3-pres');
    if(pres){
      var img = EV.frames && EV.frames.length ? evFrameEn(EV.posterT != null ? EV.posterT : EV.ini) : '';
      pres.innerHTML = PRESETS.map(function(p){ var f = filtro(Object.assign({}, a, p[2])); return '<button type="button" class="ev3-pre"' + pressed(a.preset === p[0]) + ' onclick="CERCO_evPreset(\'' + p[0] + '\')"><i style="' + (img ? 'background-image:url(\'' + img + '\');' : '') + 'filter:' + f + ';"></i>' + p[1] + '</button>'; }).join('');
    }
    var sls = $('ev3-sls');
    if(sls && !sls.contains(document.activeElement)) sls.innerHTML = slider('', 'luz', 'Luz', -40, 40) + slider('', 'con', 'Contraste', -40, 40) + slider('', 'col', 'Color', -100, 60) + slider('', 'cal', 'Calidez', -50, 50);
    var zm = $('ev3-zoom');
    if(zm && !zm.contains(document.activeElement)) zm.innerHTML = '<label class="ev3-sl"><span>Acercar</span><input type="range" min="100" max="200" step="1" value="' + Math.round(a.zoom * 100) + '" oninput="CERCO_evSet(\'zoom\', this.value / 100, this)" aria-label="Acercar"><output>' + Math.round(a.zoom * 100) + ' %</output></label>';
    var tx = $('ev3-txt'); if(tx && document.activeElement !== tx){ tx.value = a.txt; } if(tx) tx.oninput = function(){ CERCO_evSet('txt', tx.value); };
    var sg = $('ev3-sug'), s = sugTexto();
    if(sg) sg.innerHTML = (s ? '<button type="button" class="ev3-chip" onclick="CERCO_evSet(\'txt\', this.dataset.t); document.getElementById(\'ev3-txt\').value = this.dataset.t;" data-t="' + esc(s) + '">Poner «' + esc(s) + '»</button>' : '') + (a.txt ? '<button type="button" class="ev3-chip" onclick="CERCO_evSet(\'txt\', \'\'); document.getElementById(\'ev3-txt\').value = \'\';">Quitar texto</button>' : '');
    var ps = $('ev3-pos'); if(ps) ps.innerHTML = [['arriba','Arriba'],['medio','En medio'],['abajo','Abajo']].map(function(x){ return '<button type="button" class="ev3-chip"' + pressed(a.pos === x[0]) + ' onclick="CERCO_evSet(\'pos\', \'' + x[0] + '\')">' + x[1] + '</button>'; }).join('');
    var es = $('ev3-est'); if(es) es.innerHTML = [['sombra','Letra blanca'],['oscura','Fondo azul'],['clara','Fondo blanco']].map(function(x){ return '<button type="button" class="ev3-chip"' + pressed(a.est === x[0]) + ' onclick="CERCO_evSet(\'est\', \'' + x[0] + '\')">' + x[1] + '</button>'; }).join('');
    var vo = $('ev3-vol'); if(vo && !vo.contains(document.activeElement)) vo.innerHTML = slider('', 'vol', 'Volumen', 0, 200);
    var vz = $('ev3-voz'); if(vz) vz.checked = !!a.voz;
    var ok = $('m-btn'); if(ok && EV.listo) ok.textContent = cambiado() ? 'Guardar cambios' : 'Guardar';
  }
  window.CERCO_evSet = function(k, v, el){
    var a = fx(); a[k] = v;
    if(['luz','con','col','cal'].indexOf(k) > -1) a.preset = 'aj';
    if(el && el.nextElementSibling && el.nextElementSibling.tagName === 'OUTPUT') el.nextElementSibling.textContent = k === 'vol' ? v + ' %' : (k === 'zoom' ? Math.round(v * 100) + ' %' : (v > 0 ? '+' : '') + v);
    pintar();
  };
  window.CERCO_evPreset = function(id){
    var p = PRESETS.filter(function(x){ return x[0] === id; })[0]; if(!p) return;
    Object.assign(fx(), p[2], {preset:id});
    var sls = $('ev3-sls'); if(sls) sls.innerHTML = '';
    if(document.activeElement && document.activeElement.blur) document.activeElement.blur();
    pintar();
  };
  window.CERCO_evReset = function(k){
    var a = fx();
    if(k === 'f') Object.assign(a, {luz:0, con:0, col:0, cal:0, preset:'orig'});
    if(k === 'e') Object.assign(a, {zoom:1, zx:.5, zy:.5});
    if(document.activeElement && document.activeElement.blur) document.activeElement.blur();
    pintar();
  };
  function arrastreZoom(w){
    var ini = null;
    w.addEventListener('pointerdown', function(ev){ var a = fx(); if(a.zoom <= 1.001) return; ini = {x:ev.clientX, y:ev.clientY, zx:a.zx, zy:a.zy, mov:false}; try{ w.setPointerCapture(ev.pointerId); }catch(x){} });
    w.addEventListener('pointermove', function(ev){
      if(!ini) return; var a = fx(), r = w.getBoundingClientRect();
      var dx = (ev.clientX - ini.x) / r.width, dy = (ev.clientY - ini.y) / r.height;
      if(Math.abs(dx) + Math.abs(dy) > 0.01) ini.mov = true;
      var k = a.zoom / (a.zoom - 1);
      a.zx = Math.max(0, Math.min(1, ini.zx - dx * k)); a.zy = Math.max(0, Math.min(1, ini.zy - dy * k)); pintar();
    });
    var fin = function(ev){ if(ini && ini.mov){ ev.preventDefault(); ev.stopPropagation(); } ini = null; };
    w.addEventListener('pointerup', fin); w.addEventListener('pointercancel', fin);
    w.addEventListener('click', function(ev){ if(fx().zoom > 1.001 && EV.tab === 'e'){ ev.stopPropagation(); } }, true);
  }

  /* ---------- dibujar un fotograma con todos los cambios (vídeo final y portada) ---------- */
  function dibujar(cx, src, W, H, a){
    var vw = src.videoWidth || W, vh = src.videoHeight || H;
    var sw = vw / a.zoom, sh = vh / a.zoom, sx = (vw - sw) * a.zx, sy = (vh - sh) * a.zy;
    cx.save(); try{ cx.filter = filtro(a); }catch(x){}
    try{ cx.drawImage(src, sx, sy, sw, sh, 0, 0, W, H); }catch(x){}
    cx.restore();
    var t = String(a.txt || '').trim(); if(!t) return;
    var fs = Math.round(Math.min(W, H) * 0.062 * (W > H ? 0.8 : 1)), padX = fs * 0.55, padY = fs * 0.3;
    cx.save(); cx.font = '800 ' + fs + 'px Inter, system-ui, -apple-system, Segoe UI, Roboto, sans-serif'; cx.textAlign = 'center'; cx.textBaseline = 'middle';
    // si no cabe, se parte en dos líneas
    var lineas = [t], max = W * 0.86;
    if(cx.measureText(t).width > max){ var p = t.split(' '), a1 = '', i = 0; while(i < p.length && cx.measureText((a1 + ' ' + p[i]).trim()).width <= max){ a1 = (a1 + ' ' + p[i]).trim(); i++; } lineas = [a1 || t, p.slice(i).join(' ')].filter(Boolean); }
    var lh = fs * 1.2, alto = lineas.length * lh + padY * 2;
    var y0 = a.pos === 'arriba' ? H * 0.07 : (a.pos === 'medio' ? H / 2 - alto / 2 : H * 0.91 - alto);
    lineas.forEach(function(l, i){
      var y = y0 + padY + lh * i + lh / 2, w = cx.measureText(l).width + padX * 2;
      if(a.est !== 'sombra'){ cx.fillStyle = a.est === 'oscura' ? 'rgba(15,28,63,.82)' : 'rgba(255,255,255,.92)'; redondo(cx, W / 2 - w / 2, y - lh / 2 - padY / 2, w, lh + padY, fs * 0.35); cx.fill(); }
      else { cx.shadowColor = 'rgba(0,0,0,.85)'; cx.shadowBlur = fs * 0.3; cx.shadowOffsetY = fs * 0.06; }
      cx.fillStyle = a.est === 'clara' ? '#0F1C3F' : '#fff'; cx.fillText(l, W / 2, y);
    });
    cx.restore();
  }
  function redondo(cx, x, y, w, h, r){ cx.beginPath(); cx.moveTo(x + r, y); cx.arcTo(x + w, y, x + w, y + h, r); cx.arcTo(x + w, y + h, x, y + h, r); cx.arcTo(x, y + h, x, y, r); cx.arcTo(x, y, x + w, y, r); cx.closePath(); }

  function progreso(txt, pct){
    var st = $('ev2-stage'); if(!st) return; var p = $('ev3-prog');
    if(txt === null){ if(p) p.remove(); return; }
    if(!p){ st.insertAdjacentHTML('beforeend', '<div class="ev3-prog" id="ev3-prog" role="status" aria-live="polite"><b></b><div class="ev3-bar"><i></i></div><span>No cierres esta pantalla. Tarda lo mismo que dura el vídeo.</span></div>'); p = $('ev3-prog'); }
    p.querySelector('b').textContent = txt; p.querySelector('i').style.width = Math.round((pct || 0) * 100) + '%';
  }

  /* ---------- crear el vídeo nuevo con los cambios ---------- */
  function renderizar(arm){
    return new Promise(function(ok, ko){
      var tipo = tipoGrabacion();
      if(!window.MediaRecorder || !tipo || !document.createElement('canvas').captureStream) return ko('soporte');
      if(!hayAudioWeb()) return ko('audio');
      var a = Object.assign({}, fx()), ini = EV.ini, dur = Math.max(1, EV.fin - EV.ini);
      arm = arm || armarVideo('');
      urlMedia('video').then(function(u){
        var src = arm.src; if(!arm.visible) src.crossOrigin = 'anonymous';
        var cerrar = function(m){ clearInterval(vig); document.removeEventListener('visibilitychange', fuera); if(arm.visible) EV.listo = true; arm.quitar(); ko(m); };
        var vig = null, fuera = function(){ if(document.visibilityState === 'hidden'){ try{ rec && rec.state !== 'inactive' && rec.stop(); }catch(x){} cerrar('fuera'); } };
        var rec = null;
        if(arm.visible) EV.listo = false; // que el bucle del editor no salte al principio mientras se graba
        src.onerror = function(){ cerrar('leer'); };
        src.onloadedmetadata = function(){
          src.onloadedmetadata = null;
          var w = src.videoWidth || 720, h = src.videoHeight || 1280, k = Math.min(1, 720 / Math.min(w, h));
          var cv = document.createElement('canvas'); cv.width = Math.round(w * k / 2) * 2; cv.height = Math.round(h * k / 2) * 2;
          var cx = cv.getContext('2d'), st = cv.captureStream(30), ac = null;
          try{
            ac = arm.ac || new (window.AudioContext || window.webkitAudioContext)();
            var nodo = src.__so || (src.__so = ac.createMediaElementSource(src)), ult = nodo;
            if(arm.visible && !src.__oye){ src.__oye = 1; nodo.connect(ac.destination); } // lo sigues oyendo mientras se aplica
            if(a.voz){
              var hp = ac.createBiquadFilter(); hp.type = 'highpass'; hp.frequency.value = 90;
              var pr = ac.createBiquadFilter(); pr.type = 'peaking'; pr.frequency.value = 3000; pr.gain.value = 3; pr.Q.value = 0.9;
              var co = ac.createDynamicsCompressor(); co.threshold.value = -26; co.knee.value = 18; co.ratio.value = 3.5; co.attack.value = 0.005; co.release.value = 0.2;
              ult.connect(hp); hp.connect(pr); pr.connect(co); ult = co;
            }
            var g = ac.createGain(); g.gain.value = (a.vol / 100) * (a.voz ? 1.25 : 1); ult.connect(g);
            var de = ac.createMediaStreamDestination(); g.connect(de);
            de.stream.getAudioTracks().forEach(function(t){ st.addTrack(t); });
          }catch(x){}
          var trozos = [];
          try{ rec = new MediaRecorder(st, {mimeType:tipo, videoBitsPerSecond:1300000, audioBitsPerSecond:96000}); }catch(x){ rec = new MediaRecorder(st); }
          rec.ondataavailable = function(e){ if(e.data && e.data.size) trozos.push(e.data); };
          if(!st.getAudioTracks().length){ return cerrar('audio'); }
          rec.onstop = function(){ clearInterval(vig); document.removeEventListener('visibilitychange', fuera); if(!arm.visible){ try{ ac && ac.close(); }catch(x){} try{ src.remove(); }catch(x){} } else { try{ g.disconnect(); }catch(x){} } ok({ blob:new Blob(trozos, {type:(tipo || 'video/webm').split(';')[0]}), dur:dur, w:cv.width, h:cv.height }); };
          var paso = function(){
            if(rec.state !== 'recording') return;
            dibujar(cx, src, cv.width, cv.height, a);
            var t = src.currentTime - ini; progreso('Aplicando los cambios… ' + Math.max(0, Math.round(dur - t)) + ' s', Math.min(1, t / dur));
            if(t >= dur || src.ended){ src.pause(); rec.stop(); return; }
            requestAnimationFrame(paso);
          };
          src.onseeked = function(){ src.onseeked = null; arm.arrancado = true; src.muted = false; try{ if(ac && ac.resume) ac.resume(); }catch(x){} var p = src.play(); (p && p.then ? p : Promise.resolve()).then(function(){ rec.start(500); paso();
              document.addEventListener('visibilitychange', fuera);
              var ult = -1, quieto = 0;
              vig = setInterval(function(){ if(rec.state !== 'recording') return clearInterval(vig);
                if(Math.abs(src.currentTime - ult) < 0.01){ if(++quieto === 2){ try{ var q = src.play(); if(q && q.catch) q.catch(function(){}); }catch(x){} } if(quieto >= 6){ try{ rec.onstop = null; rec.stop(); }catch(x){} cerrar('parado'); } }
                else { quieto = 0; ult = src.currentTime; } }, 1000); }).catch(function(){ arm.quitar(); ko('play'); }); };
          arm.arrancado = true; try{ src.pause(); }catch(x){}
          try{ src.currentTime = ini; }catch(x){ cerrar('seek'); }
        };
        if(src.getAttribute('src') !== u){ src.src = u; try{ var p0 = src.play(); if(p0 && p0.catch) p0.catch(function(){}); }catch(x){} }
        else if(src.readyState >= 1) src.onloadedmetadata();
      }).catch(function(){ arm.quitar(); ko('leer'); });
    });
  }
  // el vídeo que tienes delante, preparado en el mismo toque (el iPhone lo exige)
  function armarVisible(){
    var v = $('ev-vid'); if(!v || !hayAudioWeb()) return null;
    var ac = v.__ac; if(!ac || ac.state === 'closed'){ try{ ac = v.__ac = new (window.AudioContext || window.webkitAudioContext)(); }catch(x){ return null; } }
    try{ if(ac.resume) ac.resume(); }catch(x){}
    var arm = { src:v, ac:ac, visible:true, arrancado:false, quitar:function(){ try{ v.pause(); }catch(x){} } };
    try{ var p = v.play(); if(p && p.then) p.then(function(){ if(!arm.arrancado) v.pause(); }).catch(function(){}); }catch(x){}
    return arm;
  }
  function portadaCon(a, t){
    return new Promise(function(ok){
      var v = $('ev-vid'); if(!v || !v.videoWidth){ ok(EV.poster || ''); return; }
      var hecho = function(){
        try{ var W = 540, H = Math.round(W * v.videoHeight / v.videoWidth), c = document.createElement('canvas'); c.width = W; c.height = H; dibujar(c.getContext('2d'), v, W, H, a); ok(c.toDataURL('image/jpeg', 0.8)); }catch(x){ ok(EV.poster || ''); }
      };
      if(Math.abs(v.currentTime - t) < 0.05) return hecho();
      v.addEventListener('seeked', function f(){ v.removeEventListener('seeked', f); setTimeout(hecho, 60); });
      try{ v.currentTime = t; }catch(x){ hecho(); }
    });
  }

  var _guardar = window.evGuardar;
  window.evGuardar = evGuardar = function(){
    if(!cambiado()) return _guardar.apply(this, arguments);
    if(!unaVez('evG3', 1500)) return;
    var b = $('m-btn'); if(b){ b.disabled = true; b.textContent = 'Guardando…'; }
    error('m-err', '');
    var v = $('ev-vid'); try{ v && v.pause(); }catch(x){}
    var a = Object.assign({}, fx()), tP = EV.posterT != null ? Math.max(EV.ini, Math.min(EV.fin, EV.posterT)) : EV.ini, foto = EV.posterFoto ? EV.poster : '';
    // armado en el mismo toque (iPhone): con la url si ya la tenemos
    var arm = hayAudioWeb() ? (armarVisible() || armarVideo(_mediaUrl.video || '')) : null;
    (foto ? Promise.resolve(foto) : portadaCon(a, tP)).then(function(poster){
      return renderizar(arm).then(function(r){
        progreso('Subiendo el vídeo…', 1);
        return aDataUrl(r.blob).then(function(url){
          if(r.blob.size > VIDEO_MAX_MB * 1048576) throw 'grande';
          return Nube.subirMedia('video', url, function(k, n){ progreso(n > 1 ? 'Subiendo ' + k + ' de ' + n + '…' : 'Subiendo…', k / n); });
        }).then(function(meta){
          meta.dur = Math.round(r.dur); meta.ini = 0; meta.fin = 0; if(r.w && r.h){ meta.w = r.w; meta.h = r.h; } meta.poster = poster || ''; meta.posterT = foto ? null : Math.round((tP - EV.ini) * 10) / 10;
          meta.editado = { filtro: a.preset !== 'orig' || a.luz || a.con || a.col || a.cal ? 1 : 0, texto: a.txt ? 1 : 0, zoom: a.zoom > 1.001 ? 1 : 0, voz: a.voz ? 1 : 0, f: new Date().toISOString() };
          var p = Object.assign({}, S.perfil); p.video = meta; _mediaUrl.video = null;
          return guardarYRepintar(p, 'Vídeo guardado con tus cambios');
        });
      });
    }).then(function(){ progreso(null); X = null; cerrarModal(); })
    .catch(function(e){
      progreso(null); if(b){ b.disabled = false; b.textContent = 'Guardar cambios'; }
      error('m-err', e === 'audio' ? msgSinAudio() + ' El recorte y la portada sí se pueden guardar si quitas los filtros, el texto, el encuadre y el sonido.'
        : e === 'play' ? 'El móvil no ha dejado reproducir el vídeo para aplicar los cambios. Vuelve a pulsar «Guardar cambios».'
        : e === 'fuera' ? 'Has salido de la página y el móvil ha parado el vídeo. Pulsa «Guardar cambios» otra vez y quédate en esta pantalla hasta que acabe.'
        : e === 'parado' ? 'El móvil ha parado el vídeo a medias. Pulsa «Guardar cambios» otra vez.'
        : e === 'soporte' ? 'Este navegador no puede aplicar filtros ni texto al vídeo. Prueba en Chrome o en Safari actualizado; el recorte y la portada sí se pueden guardar si quitas los demás cambios.'
        : e === 'grande' ? 'El vídeo con los cambios pesa demasiado. Recórtalo un poco y vuelve a guardar.'
        : 'No se han podido guardar los cambios. Revisa tu conexión y vuelve a intentarlo.');
    });
  };

  // al subir o grabar un vídeo, el siguiente paso natural es editarlo
  var _usar = window.usarVideo;
  if(typeof _usar === 'function') window.usarVideo = usarVideo = function(){
    var r = _usar.apply(this, arguments);
    var mira = setInterval(function(){ if($('gv-usar')) return; clearInterval(mira); setTimeout(function(){ if((S.perfil||{}).video) toast('Vídeo guardado. ¿Le pones filtro, texto o lo recortas?', 'Editar', function(){ abrirEditorVideo(); }); }, 400); }, 500);
    setTimeout(function(){ clearInterval(mira); }, 120000);
    return r;
  };
})();

