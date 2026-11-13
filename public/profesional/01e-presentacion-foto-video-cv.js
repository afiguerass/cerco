/* Portal del profesional: tu presentación (foto, vídeo y CV).
   Parte del antiguo profesional/01-portal.js (Fase 1, paso 1.6b). El orden de carga
   importa: los archivos 01a…01f se cargan seguidos y en este orden. */
/* ================================================================
   TU PRESENTACIÓN: foto, vídeo y CV completo
   Lo que la clínica ve primero. Los archivos se guardan en trozos
   dentro de la base de datos (candidatos/{uid}/media) y solo los
   pueden leer las clínicas a las que has enviado algo.
   ================================================================ */
var TROZO = 400000;          // caracteres por trozo, por debajo del límite de 1 MB por documento
var VIDEO_MAX_S = 60, VIDEO_MIN_S = 15, VIDEO_MAX_MB = 15, CV_MAX_MB = 3;

Nube.subirMedia = function(tipo, dataUrl, avance){
  var coma = dataUrl.indexOf(','), mime = dataUrl.slice(5, dataUrl.indexOf(';'));
  var b64 = dataUrl.slice(coma + 1), n = Math.ceil(b64.length / TROZO);
  var col = this.db().collection('candidatos').doc(this.uid).collection('media');
  var i = 0, avisado = false;
  function conTiempo(p, ms){ return new Promise(function(ok, ko){ var t = setTimeout(function(){ ko('tiempo'); }, ms); p.then(function(x){ clearTimeout(t); ok(x); }, function(e){ clearTimeout(t); ko(e); }); }); }
  var sig = function(){
    if(i >= n) return Promise.resolve();
    var k = i, intento = 0;
    if(avance) avance(k + 1, n);
    var una = function(){
      return conTiempo(col.doc(tipo + '_' + k).set({ d: b64.slice(k*TROZO, (k+1)*TROZO), i: k, n: n }), 40000).catch(function(e){
        if(++intento >= 4) throw e;
        if(!avisado){ avisado = true; try{ toast('La conexión va lenta. Seguimos subiendo, no cierres la página.'); }catch(x){} }
        return new Promise(function(r){ setTimeout(r, 1500 * intento); }).then(una);
      });
    };
    return una().then(function(){ i++; return sig(); });
  };
  return sig().then(function(){ return { n:n, mime:mime, size:Math.round(b64.length * 0.75), v:Date.now() }; });
};
Nube.leerMedia = function(uid, tipo, meta){
  var col = this.db().collection('candidatos').doc(uid).collection('media'), ps = [];
  for(var k=0;k<meta.n;k++) ps.push(col.doc(tipo + '_' + k).get());
  return Promise.all(ps).then(function(docs){
    var b64 = docs.map(function(d){ if(!d.exists) throw 'falta'; return d.data().d; }).join('');
    var bin = atob(b64), arr = new Uint8Array(bin.length);
    for(var j=0;j<bin.length;j++) arr[j] = bin.charCodeAt(j);
    return new Blob([arr], {type: meta.mime});
  });
};
function aDataUrl(blob){
  return new Promise(function(res, rej){ var fr = new FileReader(); fr.onload = function(){ res(fr.result); }; fr.onerror = rej; fr.readAsDataURL(blob); });
}
function mb(bytes){ bytes = +bytes || 0; if(bytes < 1048576) return Math.max(1, Math.round(bytes/1024)) + ' KB'; return (bytes/1048576).toFixed(bytes > 1048576*10 ? 0 : 1).replace('.', ',') + ' MB'; }
function mmss(s){ s = Math.round(s||0); return Math.floor(s/60) + ':' + String(s%60).padStart(2,'0'); }
function guardarYRepintar(p, msgOk){
  var antes = S.perfil || {};
  return Nube.guardarPerfil(p).then(function(){ S.perfil = p; pintarUsuario(); if(S.vista === 'perfil') pintarPerfil(); if(msgOk) toast(msgOk); mediaASolicitudes(antes, p); });
}
/* La solicitud guarda una copia de tu vídeo, CV y foto: si los cambias, se actualiza en las que siguen abiertas */
function mediaASolicitudes(a, p){
  var c = {}, k = function(x){ return JSON.stringify(x || null); };
  if(k(a.video) !== k(p.video)) c.video = p.video || null;
  if(k(a.cv) !== k(p.cv)) c.cv = p.cv || null;
  if((a.foto || '') !== (p.foto || '')) c.foto = p.foto || '';
  if(!Object.keys(c).length) return;
  (S.sols || []).filter(function(s){ return ['enviada','vista','entrevista','contratada'].indexOf(s.estado) > -1; }).forEach(function(s){
    Nube.db().collection('candidaturas').doc(s.id).update(c).then(function(){ Object.assign(s, c); }).catch(function(){});
  });
}


/* ---------- perfil: cabecera ---------- */
function pfIr(id){ var el = $(id); if(el){ var y = el.getBoundingClientRect().top + window.scrollY - 70; window.scrollTo({top:y, behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth'}); } return false; }
function pintarCabPerfil(p){
  var acc = $('pf-foto-acc');
  if(acc) acc.innerHTML = '<label class="btn btn-s pf-fb">'+svg('camera','currentColor',15)+(p.foto ? 'Cambiar foto' : 'Poner foto')+'<input type="file" accept="image/*" onchange="elegirFoto(this)" class="sr"></label>'
    + (p.foto ? '<button class="btn btn-g pf-fb" style="color:#B42318;" onclick="quitarFoto()">Quitar</button>' : '<span class="pf-fh">La clínica la ve junto a tu nombre</span>');
  var it = [
    {ok:!!p.foto, t:'Foto', a:"document.querySelector('.pf-foto input').click()"},
    {ok:!!p.video, t:'Vídeo', a:"pfIr('pf-media')"},
    {ok:!!p.cv, t:'CV en PDF', a:"pfIr('pf-media')"},
    {ok:!!p.disc, t:'Test', a:"abrirTest(false)"},
    {ok:!!p.resumen, t:'Presentación', a:"editarPerfil()"},
    {ok:!!(p.fuertes||[]).length, t:'Puntos fuertes', a:"editarPerfil()"},
    {ok:!!p.telefono, t:'Teléfono', a:"editarPerfil()"}
  ];
  var n = it.filter(function(x){ return x.ok; }).length, pct = Math.round(n / it.length * 100);
  var falta = it.filter(function(x){ return !x.ok; });
  $('pf-comp').innerHTML = '<div class="pf-comp"><div class="pf-comp-t"><b>'+(pct === 100 ? 'Tu perfil está completo' : 'Tu perfil está al '+pct+' %')+'</b><span>'+n+' de '+it.length+'</span></div>'
    + '<div class="meter"><div style="width:'+pct+'%"></div></div>'
    + (falta.length ? '<div class="pf-falta"><span>Te falta:</span>'+falta.map(function(x){ return '<button onclick="'+x.a+'">'+svg('plus','currentColor',13)+x.t+'</button>'; }).join('')+'</div>'
      : '<div class="pf-fh" style="margin-top:6px;">Las clínicas ven todo lo que necesitan para decidir.</div>')
    + '</div>';
}

/* ---------- foto: encuadre antes de guardar ---------- */
var FT = { img:null, z:1, x:0, y:0, arr:null };
function elegirFoto(inp){
  var f = inp.files && inp.files[0]; inp.value = '';
  if(!f) return;
  if(!/^image\//.test(f.type)) return toast('Elige una imagen (JPG o PNG).');
  if(f.size > 15*1048576) return toast('La imagen pesa demasiado. Elige una de menos de 15 MB.');
  var fr = new FileReader();
  fr.onload = function(){
    var img = new Image();
    img.onload = function(){ FT.img = img; FT.z = 1; FT.x = 0; FT.y = 0; abrirEncuadre(); };
    img.onerror = function(){ toast('No hemos podido leer esa imagen.'); };
    img.src = fr.result;
  };
  fr.readAsDataURL(f);
}
function abrirEncuadre(){
  cerrarModal();
  var m = document.createElement('div'); m.className = 'modal-bg'; m.id = 'modal';
  m.onclick = function(e){ if(e.target === m) cerrarModal(); };
  m.innerHTML = '<div class="modal" role="dialog" aria-modal="true" aria-labelledby="ft-t"><h2 id="ft-t">Tu foto de perfil</h2>'
    + '<p>Arrastra la foto para centrar tu cara y usa la barra para acercarla.</p>'
    + '<div class="ft-marco"><canvas id="ft-cv" width="560" height="560" aria-label="Vista previa de la foto"></canvas></div>'
    + '<div class="ft-zoom">'+svg('minus','#6B7280',16)+'<input type="range" id="ft-z" min="1" max="3" step="0.01" value="1" aria-label="Acercar" oninput="FT.z=+this.value; ftPintar();">'+svg('plus','#6B7280',16)+'</div>'
    + '<div class="ft-ej"><span>Así la verá la clínica:</span><canvas id="ft-mini" width="88" height="88"></canvas><canvas id="ft-mini2" width="68" height="68"></canvas></div>'
    + '<div class="acts" style="margin-top:14px;"><button class="btn btn-p" id="ft-ok" onclick="guardarEncuadre()">Guardar foto</button>'
    + '<label class="btn btn-s">Elegir otra<input type="file" accept="image/*" onchange="elegirFoto(this)" class="sr"></label>'
    + '<button class="btn btn-g" onclick="cerrarModal()">Cancelar</button></div></div>';
  document.body.appendChild(m);
  var cv = $('ft-cv'), ini = null;
  cv.addEventListener('pointerdown', function(e){ ini = {x:e.clientX, y:e.clientY, fx:FT.x, fy:FT.y}; cv.setPointerCapture(e.pointerId); });
  cv.addEventListener('pointermove', function(e){ if(!ini) return; var k = cv.width / cv.getBoundingClientRect().width; FT.x = ini.fx + (e.clientX - ini.x) * k; FT.y = ini.fy + (e.clientY - ini.y) * k; ftPintar(); });
  cv.addEventListener('pointerup', function(){ ini = null; }); cv.addEventListener('pointercancel', function(){ ini = null; });
  cv.addEventListener('wheel', function(e){ e.preventDefault(); FT.z = Math.min(3, Math.max(1, FT.z - e.deltaY * 0.002)); $('ft-z').value = FT.z; ftPintar(); }, {passive:false});
  cv.tabIndex = 0;
  cv.addEventListener('keydown', function(e){ var d = 12, m2 = {ArrowLeft:[d,0], ArrowRight:[-d,0], ArrowUp:[0,d], ArrowDown:[0,-d]}[e.key]; if(m2){ e.preventDefault(); FT.x += m2[0]; FT.y += m2[1]; ftPintar(); } });
  ftPintar();
}
// dibuja la imagen cubriendo el cuadrado y sin dejar huecos al moverla
function ftDibujar(ctx, L){
  var img = FT.img, base = Math.max(L / img.width, L / img.height) * FT.z, w = img.width * base, h = img.height * base;
  var k = L / 560, mx = (w - L) / 2, my = (h - L) / 2;
  FT.x = Math.max(-mx / k, Math.min(mx / k, FT.x)); FT.y = Math.max(-my / k, Math.min(my / k, FT.y));
  ctx.fillStyle = '#fff'; ctx.fillRect(0, 0, L, L);
  ctx.drawImage(img, (L - w) / 2 + FT.x * k, (L - h) / 2 + FT.y * k, w, h);
}
function ftPintar(){
  var cv = $('ft-cv'); if(!cv || !FT.img) return;
  ftDibujar(cv.getContext('2d'), 560);
  ['ft-mini','ft-mini2'].forEach(function(id){ var c = $(id); if(c){ var x = c.getContext('2d'); x.clearRect(0,0,c.width,c.height); x.save(); x.beginPath(); x.arc(c.width/2, c.height/2, c.width/2, 0, Math.PI*2); x.clip(); x.drawImage(cv, 0, 0, c.width, c.height); x.restore(); } });
}
function guardarEncuadre(){
  if(!FT.img || !unaVez('foto', 800)) return;
  var out = document.createElement('canvas'); out.width = out.height = 360;
  ftDibujar(out.getContext('2d'), 360);
  var p = Object.assign({}, S.perfil); p.foto = out.toDataURL('image/jpeg', 0.85);
  var b = $('ft-ok'); if(b){ b.disabled = true; b.textContent = 'Guardando…'; }
  guardarYRepintar(p, 'Foto guardada').then(function(){ cerrarModal(); FT.img = null; })
    .catch(function(){ if(b){ b.disabled = false; b.textContent = 'Guardar foto'; } toast('No hemos podido guardar la foto. Revisa tu conexión.'); });
}
function quitarFoto(){ if(!confirm('¿Quitar tu foto de perfil? La clínica verá tus iniciales.')) return; var p = Object.assign({}, S.perfil); p.foto = ''; guardarYRepintar(p, 'Foto quitada'); }

/* ---------- vídeo ---------- */
var GV = { stream:null, rec:null, trozos:[], t0:0, reloj:null, blob:null, dur:0 };
function tipoGrabacion(){
  var ops = ['video/webm;codecs=vp8,opus','video/webm','video/mp4'];
  for(var i=0;i<ops.length;i++){ try{ if(window.MediaRecorder && MediaRecorder.isTypeSupported(ops[i])) return ops[i]; }catch(e){} }
  return '';
}
function abrirGrabadora(){
  cerrarModal();
  var m = document.createElement('div');
  m.className = 'modal-bg'; m.id = 'modal';
  m.innerHTML = '<div class="modal gv" role="dialog" aria-modal="true" aria-label="Vídeo de presentación">'
    + '<h2>Tu vídeo de presentación</h2>'
    + '<p>Entre 15 segundos y 1 minuto. Preséntate: quién eres, tu experiencia y qué tipo de clínica buscas. Mejor con el móvil en vertical, buena luz y sin ruido de fondo.</p>'
    + '<div class="gv-pant"><video id="gv-v" playsinline muted autoplay></video><div class="gv-reloj" id="gv-reloj" hidden>0:00 / 0:30</div>'
    + '<div class="gv-vacio" id="gv-vacio">'+svg('video','#fff',30)+'<span>Pulsa "Encender cámara"</span></div></div>'
    + '<div class="err" id="gv-err" style="margin-top:10px;"></div>'
    + '<div class="gv-acts" id="gv-acts"></div>'
    + '<div class="gv-sub" id="gv-sub"><span>o</span><label class="btn btn-s gv-subir">'+svg('upload','currentColor',16)+'Subir un vídeo de mis archivos<input type="file" accept="video/*" class="sr" onchange="subirVideoArchivo(this)"></label><small>Del móvil o del ordenador. Si dura más de 30 segundos, eliges el trozo.</small></div>'
    + '</div>';
  document.body.appendChild(m);
  gvBotones('inicio');
}
function gvBotones(fase){
  var a = $('gv-acts'); if(!a) return;
  var cancelar = '<button class="btn btn-s" onclick="cerrarGrabadora()">Cancelar</button>';
  if(fase === 'inicio') a.innerHTML = cancelar + '<button class="btn btn-p" onclick="encenderCamara()">'+svg('video','#fff',16)+'Encender cámara</button>';
  if(fase === 'lista') a.innerHTML = cancelar + '<button class="btn btn-p gv-rec" onclick="empezarGrabar()"><span class="gv-punto"></span>Grabar</button>';
  if(fase === 'grabando') a.innerHTML = '<button class="btn btn-d btn-block" onclick="pararGrabar()">Parar</button>';
  if(fase === 'corto') a.innerHTML = cancelar + '<button class="btn btn-p" onclick="repetirGrabar()">Grabar otra vez</button>';
  if(fase === 'hecho') a.innerHTML = '<button class="btn btn-s" onclick="repetirGrabar()">Repetir</button><button class="btn btn-p" id="gv-usar" onclick="usarVideo()">Usar este vídeo</button>';
}
function encenderCamara(){
  error('gv-err', '');
  if(!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia || !tipoGrabacion())
    return error('gv-err', esIOS() && !hayAudioWeb()
      ? 'Con el Modo de aislamiento activado, el iPhone no deja a las webs usar la cámara. Graba el vídeo con la cámara del móvil y súbelo con el botón de abajo, o desactiva el Modo de aislamiento para CERCO (toca «aA» → Ajustes del sitio web).'
      : 'Este navegador no deja grabar aquí. Graba el vídeo con la cámara del móvil y súbelo con el botón de abajo.');
  navigator.mediaDevices.getUserMedia({ video:{ width:{ideal:640}, height:{ideal:480}, facingMode:'user' }, audio:true }).then(function(st){
    GV.stream = st;
    var v = $('gv-v'); v.srcObject = st; v.muted = true; v.controls = false;
    $('gv-vacio').hidden = true;
    gvBotones('lista');
  }).catch(function(){
    error('gv-err', 'No tenemos permiso para usar la cámara. Actívalo en tu navegador o sube un vídeo grabado con el móvil.');
  });
}
function empezarGrabar(){
  GV.trozos = [];
  try{ GV.rec = new MediaRecorder(GV.stream, { mimeType: tipoGrabacion(), videoBitsPerSecond: 350000, audioBitsPerSecond: 48000 }); }
  catch(e){ return error('gv-err', 'No se ha podido empezar a grabar. Sube un vídeo del móvil.'); }
  GV.rec.ondataavailable = function(e){ if(e.data && e.data.size) GV.trozos.push(e.data); };
  GV.rec.onstop = function(){
    GV.dur = (Date.now() - GV.t0) / 1000;
    GV.blob = new Blob(GV.trozos, { type: (GV.rec.mimeType || 'video/webm').split(';')[0] });
    apagarCamara();
    var v = $('gv-v'); if(!v) return;
    v.srcObject = null; v.src = URL.createObjectURL(GV.blob); v.muted = false; v.controls = true; v.autoplay = false;
    $('gv-reloj').hidden = true;
    GV.ini = 0; GV.fin = 0;
    if(GV.dur < VIDEO_MIN_S){ gvBotones('corto'); return error('gv-err', 'Ha durado ' + Math.round(GV.dur) + ' segundos. Graba entre ' + VIDEO_MIN_S + ' y ' + VIDEO_MAX_S + ': las clínicas necesitan un poco más para conocerte.'); }
    gvBotones('hecho');
  };
  GV.rec.start(1000); GV.t0 = Date.now();
  var r = $('gv-reloj'); r.hidden = false;
  clearInterval(GV.reloj);
  GV.reloj = setInterval(function(){
    var s = (Date.now() - GV.t0) / 1000;
    if(r) r.textContent = mmss(s) + ' / ' + mmss(VIDEO_MAX_S);
    if(s >= VIDEO_MAX_S) pararGrabar();
  }, 250);
  gvBotones('grabando');
}
function pararGrabar(){ clearInterval(GV.reloj); try{ if(GV.rec && GV.rec.state !== 'inactive') GV.rec.stop(); }catch(e){} }
function repetirGrabar(){ error('gv-err', ''); var sb = $('gv-sub'); if(sb) sb.hidden = false; GV.blob = null; var v = $('gv-v'); if(v){ v.removeAttribute('src'); v.controls = false; } encenderCamara(); }
function apagarCamara(){ try{ if(GV.stream) GV.stream.getTracks().forEach(function(t){ t.stop(); }); }catch(e){} GV.stream = null; }
function cerrarGrabadora(){ clearInterval(GV.reloj); try{ if(GV.rec && GV.rec.state !== 'inactive') GV.rec.stop(); }catch(e){} apagarCamara(); cerrarModal(); }
function subirVideoPerfil(inp){
  var f = inp.files && inp.files[0]; inp.value = ''; if(!f) return;
  abrirGrabadora(); subirVideoArchivo({files:[f], value:''});
}
var VIDEO_ARCHIVO_MAX_MB = 500;
function subirVideoArchivo(inp){
  var f = inp.files && inp.files[0]; try{ inp.value = ''; }catch(e){}
  if(!f) return;
  error('gv-err', '');
  if(!/^video\//.test(f.type) && !/\.(mp4|mov|webm|m4v|3gp)$/i.test(f.name || '')) return error('gv-err', 'Ese archivo no es un vídeo.');
  if(f.size > VIDEO_ARCHIVO_MAX_MB * 1048576) return error('gv-err', 'El vídeo pesa ' + mb(f.size) + '. Elige uno de menos de ' + VIDEO_ARCHIVO_MAX_MB + ' MB.');
  apagarCamara();
  var url = URL.createObjectURL(f), v = document.createElement('video'); v.preload = 'metadata'; v.muted = true;
  v.onloadedmetadata = function(){
    var d = v.duration;
    if(isFinite(d) && d < VIDEO_MIN_S) return error('gv-err', 'El vídeo dura ' + Math.round(d) + ' segundos. Tiene que durar entre ' + VIDEO_MIN_S + ' y ' + VIDEO_MAX_S + '.');
    if(isFinite(d) && d > 180) return error('gv-err', 'El vídeo dura ' + mmss(d) + '. Sube uno de menos de 3 minutos.');
    GV.archivo = f; GV.url = url; GV.dur = isFinite(d) ? d : 0; GV.ini = 0; GV.fin = 0; GV.blob = null;
    var largo = GV.dur > VIDEO_MAX_S + 0.5, pesado = f.size > VIDEO_MAX_MB * 1048576;
    var pv = $('gv-v'); if(pv){ pv.srcObject = null; pv.src = url + '#t=0.001'; pv.muted = false; pv.controls = true; pv.autoplay = false; pv.preload = 'auto'; }
    var vac = $('gv-vacio'); if(vac) vac.hidden = true;
    var sub = $('gv-sub'); if(sub) sub.hidden = true;
    if(!largo && !pesado){ GV.blob = f; gvBotones('hecho'); return; }
    gvTramo(largo);
  };
  v.onerror = function(){ error('gv-err', 'No podemos leer ese vídeo. Prueba con otro formato (MP4) o grábalo desde aquí.'); };
  v.src = url;
}
// vídeo largo o muy pesado: eliges el minuto y CERCO lo prepara (más ligero)
function gvTramo(largo){
  var a = $('gv-acts'); if(!a) return;
  var max = Math.max(0, GV.dur - VIDEO_MAX_S);
  a.innerHTML = '<div class="gv-tramo">'
    + (largo ? '<label for="gv-ini"><b>Elige el minuto</b> que verá la clínica</label>'
      + '<div class="gv-tr-f"><input type="range" id="gv-ini" min="0" max="'+max.toFixed(1)+'" step="0.1" value="0" oninput="gvMoverTramo()"><span id="gv-tr-t">0:00 – '+mmss(Math.min(GV.dur, VIDEO_MAX_S))+'</span></div>'
      : '<p><b>Tu vídeo pesa ' + mb(GV.archivo.size) + '.</b> Lo preparamos para que pese menos y se vea igual de bien en el móvil de la clínica.</p>')
    + '<div class="gv-prog" id="gv-prog" hidden><div id="gv-prog-b"></div></div>'
    + '<div class="gv-tr-a"><button class="btn btn-s" onclick="cerrarGrabadora()">Cancelar</button><button class="btn btn-p" id="gv-prep" onclick="gvPreparar()">'+(largo ? 'Usar este trozo' : 'Preparar mi vídeo')+'</button></div></div>';
  if(largo){ var pv = $('gv-v'); if(pv){ pv.currentTime = 0; pv.ontimeupdate = function(){ if(pv.currentTime > GV.ini + VIDEO_MAX_S){ pv.pause(); pv.currentTime = GV.ini; } }; } }
}
function gvMoverTramo(){
  GV.ini = +$('gv-ini').value; var pv = $('gv-v');
  $('gv-tr-t').textContent = mmss(GV.ini) + ' – ' + mmss(GV.ini + VIDEO_MAX_S);
  try{ pv.pause(); pv.currentTime = GV.ini; }catch(e){}
}
/* El iPhone (Safari) solo deja reproducir un vídeo con sonido si la orden nace del toque.
   Preparar el vídeo pasa por pasos que esperan (cargar, saltar al trozo), así que
   «armamos» el vídeo y el audio en el mismo toque y luego ya se pueden usar. */
function hayAudioWeb(){ return !!(window.AudioContext || window.webkitAudioContext); }
function msgSinAudio(){
  return esIOS()
    ? 'Tu iPhone tiene activado el Modo de aislamiento, que no deja a las webs preparar vídeos con sonido. Desactívalo solo para CERCO: toca «aA» (o el icono de la izquierda en la barra de dirección) → Ajustes del sitio web → desactiva «Modo de aislamiento». O graba con menos calidad: Ajustes → Cámara → Grabar vídeo → 720p HD a 30 fps.'
    : 'Este navegador no deja a las webs preparar vídeos con sonido. Prueba en Chrome o Safari, o graba el vídeo con menos calidad para que pese menos de ' + VIDEO_MAX_MB + ' MB.';
}
function armarVideo(url){
  var src = document.createElement('video');
  src.playsInline = true; src.setAttribute('playsinline', ''); src.preload = 'auto'; src.muted = true; // en silencio hasta que el audio pase a la grabación
  // dentro de la página (invisible): algunos móviles no pintan los vídeos que no están en ella
  src.style.cssText = 'position:fixed;left:-10000px;top:0;width:2px;height:2px;opacity:0;pointer-events:none;';
  document.body.appendChild(src);
  var ac = null; try{ ac = new (window.AudioContext || window.webkitAudioContext)(); if(ac.resume) ac.resume(); }catch(e){ ac = null; }
  var listo = { src:src, ac:ac, arrancado:false };
  if(url) src.src = url;
  try{ var p = src.play(); if(p && p.then) p.then(function(){ if(!listo.arrancado) src.pause(); }).catch(function(){}); }catch(e){}
  listo.quitar = function(){ try{ src.pause(); src.removeAttribute('src'); src.load(); src.remove(); }catch(e){} try{ ac && ac.close(); }catch(e){} };
  return listo;
}
// se vuelve a grabar el trozo elegido, a menos calidad, mientras se reproduce sin sonido por los altavoces
function gvPreparar(){
  var b = $('gv-prep'); if(!b || b.disabled) return;
  var tipo = tipoGrabacion();
  if(!window.MediaRecorder || !tipo || !document.createElement('canvas').captureStream) return error('gv-err', 'Este navegador no puede preparar el vídeo. Prueba en Chrome o en Safari actualizado, o recorta el vídeo en tu móvil a 1 minuto y súbelo otra vez.');
  // sin audio web el vídeo saldría mudo: mejor decirlo que guardarlo sin sonido
  if(!hayAudioWeb()) return error('gv-err', msgSinAudio());
  var pv = $('gv-v'); if(!pv) return;
  var ini = GV.ini || 0, dur = Math.max(1, Math.min(VIDEO_MAX_S, GV.dur - ini));
  // Todo nace de este toque (el iPhone lo exige): audio, salto al trozo y reproducción.
  // Se prepara el vídeo que tienes delante: lo ves y lo oyes mientras tanto.
  var ac = GV.ac2; if(!ac || ac.state === 'closed'){ try{ ac = GV.ac2 = new (window.AudioContext || window.webkitAudioContext)(); }catch(e){ return error('gv-err', msgSinAudio()); } }
  try{ if(ac.resume) ac.resume(); }catch(e){}
  var so = pv.__so; if(!so){ try{ so = pv.__so = ac.createMediaElementSource(pv); so.connect(ac.destination); }catch(e){ return error('gv-err', msgSinAudio()); } }
  var de = ac.createMediaStreamDestination(); so.connect(de);
  pv.ontimeupdate = null; pv.controls = false; pv.muted = false; pv.loop = false;
  try{ pv.currentTime = ini; }catch(e){}
  var arranque = pv.play();
  b.disabled = true; b.textContent = 'Preparando…'; $('gv-prog').hidden = false; error('gv-err', '');
  var cancel = document.querySelector('.gv-tr-a .btn-s'); if(cancel) cancel.onclick = function(){ fin('cancel'); };
  var w = pv.videoWidth || 720, h = pv.videoHeight || 1280, k = Math.min(1, 720 / Math.min(w, h));
  var cv = document.createElement('canvas'); cv.width = Math.round(w * k / 2) * 2; cv.height = Math.round(h * k / 2) * 2;
  cv.style.cssText = 'position:fixed;left:-10000px;top:0;width:2px;height:2px;opacity:0;pointer-events:none;';
  document.body.appendChild(cv);
  var cx = cv.getContext('2d'), st = cv.captureStream(30);
  de.stream.getAudioTracks().forEach(function(t){ st.addTrack(t); });
  var rec, trozos = [], hecho = false, ultimo = -1, quieto = 0, vigia = null;
  try{ rec = new MediaRecorder(st, {mimeType:tipo, videoBitsPerSecond:1100000, audioBitsPerSecond:96000}); }catch(e){ rec = new MediaRecorder(st); }
  rec.ondataavailable = function(e){ if(e.data && e.data.size) trozos.push(e.data); };
  function limpiar(){
    clearInterval(vigia); document.removeEventListener('visibilitychange', alVolver);
    try{ so.disconnect(de); }catch(e){} try{ cv.remove(); }catch(e){}
    try{ pv.pause(); }catch(e){}
  }
  function reiniciarBoton(txt){ b.disabled = false; b.textContent = txt || 'Preparar mi vídeo'; $('gv-prog').hidden = true; var pb = $('gv-prog-b'); if(pb) pb.style.width = '0'; pv.controls = true; }
  function fin(motivo){
    if(hecho) return; hecho = true;
    if(motivo !== 'ok'){
      trozos = []; try{ if(rec.state !== 'inactive') rec.stop(); }catch(e){} limpiar();
      if(motivo === 'cancel'){ cerrarGrabadora(); return; }
      reiniciarBoton('Probar otra vez');
      return error('gv-err', motivo === 'fuera' ? 'Has salido de la página y el móvil ha parado el vídeo. Pulsa «Probar otra vez» y quédate en esta pantalla hasta que acabe (dura lo mismo que tu vídeo).'
        : 'El móvil ha parado el vídeo a medias. Pulsa «Probar otra vez»; si vuelve a pasar, prueba con Chrome o Safari actualizado.');
    }
    rec.onstop = function(){
      limpiar();
      var blob = new Blob(trozos, {type: (tipo || 'video/webm').split(';')[0]});
      if(!blob.size){ reiniciarBoton('Probar otra vez'); return error('gv-err', 'No ha salido bien. Pulsa «Probar otra vez».'); }
      GV.blob = blob; GV.dur = dur; GV.ini = 0; GV.fin = 0; GV.w = cv.width; GV.h = cv.height;
      // vídeo nuevo en un reproductor nuevo (el anterior quedó unido al audio de la preparación)
      var nv = document.createElement('video'); nv.id = 'gv-v'; nv.setAttribute('playsinline', ''); nv.playsInline = true; nv.controls = true; nv.preload = 'auto';
      nv.src = URL.createObjectURL(blob) + '#t=0.001';
      pv.parentNode.replaceChild(nv, pv);
      $('gv-acts').innerHTML = ''; gvBotones('hecho');
      if(blob.size > VIDEO_MAX_MB * 1048576) error('gv-err', 'Sigue pesando ' + mb(blob.size) + '. Elige un trozo más corto o graba con menos calidad (Ajustes → Cámara → Grabar vídeo → 720p HD).');
      else toast('Listo: ' + mb(blob.size) + '. Míralo y pulsa «Usar este vídeo».');
    };
    try{ rec.stop(); }catch(e){ rec.onstop(); }
  }
  function alVolver(){ if(document.visibilityState === 'hidden') fin('fuera'); }
  document.addEventListener('visibilitychange', alVolver);
  function dibuja(){
    if(hecho) return;
    try{ cx.drawImage(pv, 0, 0, cv.width, cv.height); }catch(e){}
    var t = pv.currentTime - ini, pb = $('gv-prog-b'); if(pb) pb.style.width = Math.max(0, Math.min(100, t / dur * 100)) + '%';
    b.textContent = 'Preparando… ' + Math.max(0, Math.round(dur - t)) + ' s';
    if(t >= dur - 0.05 || pv.ended){ fin('ok'); return; }
    requestAnimationFrame(dibuja);
  }
  function empezar(){
    if(hecho || rec.state !== 'inactive') return;
    try{ rec.start(500); }catch(e){ return fin('error'); }
    dibuja();
    // si el vídeo se queda parado (llamada, bloqueo, el móvil lo pausa) lo decimos en vez de quedarnos colgados
    vigia = setInterval(function(){
      if(hecho) return;
      if(Math.abs(pv.currentTime - ultimo) < 0.01){ quieto++; if(quieto === 2){ try{ var p = pv.play(); if(p && p.catch) p.catch(function(){}); }catch(e){} } if(quieto >= 6) fin('parado'); }
      else { quieto = 0; ultimo = pv.currentTime; }
    }, 1000);
  }
  (arranque && arranque.then ? arranque : Promise.resolve()).then(empezar).catch(function(){ fin('parado'); });
}
/* Usar el vídeo grabado o subido y, después, avisar de que se puede editar (Fase 1: una sola versión) */
function usarVideo(){
  var r = _usarVideoBase.apply(this, arguments);
  if(window.CERCO_videoGuardadoAviso) CERCO_videoGuardadoAviso.apply(this, arguments);
  return r;
}
function _usarVideoBase(){
  if(!GV.blob || !unaVez('usarV', 1500)) return;
  var b = $('gv-usar'); if(b){ b.disabled = true; b.textContent = 'Preparando…'; }
  aDataUrl(GV.blob).then(function(url){
    return Nube.subirMedia('video', url, function(k, n){ if(b) b.textContent = n > 1 ? ('Subiendo ' + k + ' de ' + n + '…') : 'Subiendo…'; });
  }).then(function(meta){
    meta.dur = Math.round(GV.dur);
    var gvv = $('gv-v'); if(gvv && gvv.videoWidth){ meta.w = gvv.videoWidth; meta.h = gvv.videoHeight; } else if(GV.w){ meta.w = GV.w; meta.h = GV.h; }
    if(GV.url){ try{ URL.revokeObjectURL(GV.url); }catch(e){} GV.url = null; GV.archivo = null; }
    if(GV.fin){ meta.ini = 0; meta.fin = GV.fin; }
    var p = Object.assign({}, S.perfil); p.video = meta;
    return guardarYRepintar(p);
  }).then(function(){
    cerrarGrabadora(); toast('Vídeo guardado. Lo verán las clínicas a las que escribas.');
    _mediaUrl.video = null;
  }).catch(function(){
    if(b){ b.disabled = false; b.textContent = 'Usar este vídeo'; }
    error('gv-err', 'No hemos podido subir el vídeo: la conexión se ha cortado. Pulsa «Usar este vídeo» otra vez cuando tengas buena cobertura o wifi.');
  });
}
function quitarVideo(){ if(!confirm('¿Quitar tu vídeo? Las clínicas dejarán de verlo.')) return; var p = Object.assign({}, S.perfil); p.video = null; _mediaUrl.video = null; guardarYRepintar(p, 'Vídeo quitado'); }

/* ---------- CV completo en PDF ---------- */
function elegirCV(inp){
  var f = inp.files && inp.files[0]; inp.value = '';
  if(!f) return;
  if(f.type !== 'application/pdf' && !/\.pdf$/i.test(f.name)) return toast('El CV tiene que estar en PDF.');
  if(f.size > CV_MAX_MB * 1048576) return toast('El PDF pesa ' + mb(f.size) + '. El máximo son ' + CV_MAX_MB + ' MB.');
  toast('Subiendo tu CV…');
  aDataUrl(f).then(function(url){
    if(url.indexOf('data:;') === 0 || url.indexOf('data:application/octet-stream') === 0) url = 'data:application/pdf' + url.slice(url.indexOf(';'));
    return Nube.subirMedia('cv', url);
  }).then(function(meta){
    meta.nombre = String(f.name).slice(0, 80);
    var p = Object.assign({}, S.perfil); p.cv = meta; _mediaUrl.cv = null;
    return guardarYRepintar(p, 'CV guardado');
  }).catch(function(){ toast('No hemos podido subir el CV. Revisa tu conexión.'); });
}
function quitarCV(){ var p = Object.assign({}, S.perfil); p.cv = null; _mediaUrl.cv = null; guardarYRepintar(p, 'CV quitado'); }

var _mediaUrl = { video:null, cv:null };
function urlMedia(tipo){
  if(_mediaUrl[tipo]) return Promise.resolve(_mediaUrl[tipo]);
  var meta = S.perfil && S.perfil[tipo];
  if(!meta) return Promise.reject('sin');
  return Nube.leerMedia(Nube.uid, tipo, meta).then(function(b){ _mediaUrl[tipo] = URL.createObjectURL(b); return _mediaUrl[tipo]; });
}
/* Ver mi vídeo: se carga, se le aplica el recorte guardado y se abre en grande (Fase 1: una sola versión) */
function verMiVideo(){
  _verMiVideoBase.apply(this, arguments);
  if(window.CERCO_videoRecorteAlVer) CERCO_videoRecorteAlVer.apply(this, arguments);
  try{ CERCO_visor(document.getElementById('pf-vid')); }catch(x){}
}
function _verMiVideoBase(){
  var box = $('pf-vid'); if(!box) return;
  box.innerHTML = '<div class="cargando" style="padding:40px 10px;color:#fff;"><div class="spin"></div>Cargando vídeo…</div>';
  urlMedia('video').then(function(u){
    box.innerHTML = '<video src="'+u+'" controls playsinline autoplay style="width:100%;height:100%;display:block;background:#000;"></video>';
  }).catch(function(){ box.innerHTML = '<div class="cargando" style="padding:40px 10px;color:#fff;">No hemos podido cargar el vídeo.</div>'; });
}
/* ---------- ver el CV sin descargarlo ----------
   Se pinta cada página dentro de CERCO con PDF.js (funciona igual en el
   móvil, donde el navegador no enseña PDF dentro de la página). Si PDF.js
   no carga, se abre el visor del propio navegador. */
var PDFJS_V = '3.11.174', _pdfjs = null;
function cargarPdfJs(){
  if(window.pdfjsLib) return Promise.resolve(window.pdfjsLib);
  if(_pdfjs) return _pdfjs;
  _pdfjs = new Promise(function(res, rej){
    var sc = document.createElement('script');
    sc.src = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/' + PDFJS_V + '/pdf.min.js';
    sc.onload = function(){ try{ window.pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/' + PDFJS_V + '/pdf.worker.min.js'; res(window.pdfjsLib); }catch(e){ rej(e); } };
    sc.onerror = function(){ _pdfjs = null; rej('pdfjs'); };
    document.head.appendChild(sc);
  });
  return _pdfjs;
}
function abrirVisorPdf(url, nombre, descargable){
  cerrarModal();
  var m = document.createElement('div'); m.className = 'modal-bg pdfv-bg'; m.id = 'modal';
  m.onclick = function(e){ if(e.target === m) cerrarModal(); };
  m.innerHTML = '<div class="pdfv" role="dialog" aria-modal="true" aria-label="'+esc(nombre)+'">'
    + '<div class="pdfv-cab"><div class="pdfv-t">'+svg('file','#1A56DB',18)+'<span>'+esc(nombre)+'</span></div>'
    + (descargable ? '<a class="btn btn-s pdfv-b" href="'+esc(url)+'" download="'+esc(nombre)+'">'+svg('download','currentColor',15)+'<span class="pdfv-bt">Descargar</span></a>' : '')
    + '<button class="pdfv-x" onclick="cerrarModal()" aria-label="Cerrar">'+svg('x','#374151',20)+'</button></div>'
    + '<div class="pdfv-c" id="pdfv-c"><div class="cargando"><div class="spin"></div>Abriendo el CV…</div></div></div>';
  document.body.appendChild(m);
  var box = $('pdfv-c');
  cargarPdfJs().then(function(lib){ return lib.getDocument(url).promise; }).then(function(pdf){
    box.innerHTML = '';
    var ancho = Math.min(box.clientWidth - 24, 820), dpr = Math.min(window.devicePixelRatio || 1, 2), cad = Promise.resolve();
    for(var i = 1; i <= pdf.numPages; i++) (function(n){
      cad = cad.then(function(){ return pdf.getPage(n); }).then(function(pg){
        var v1 = pg.getViewport({scale:1}), esc2 = ancho / v1.width, vp = pg.getViewport({scale: esc2 * dpr});
        var cv = document.createElement('canvas'); cv.width = vp.width; cv.height = vp.height;
        cv.style.width = Math.round(vp.width / dpr) + 'px'; cv.className = 'pdfv-p'; cv.setAttribute('aria-label', 'Página ' + n + ' de ' + pdf.numPages);
        box.appendChild(cv);
        return pg.render({canvasContext: cv.getContext('2d'), viewport: vp}).promise;
      });
    })(i);
    return cad;
  }).catch(function(){
    // sin PDF.js: el visor del navegador
    box.innerHTML = '<iframe class="pdfv-if" src="'+esc(url)+'#view=FitH" title="'+esc(nombre)+'"></iframe>';
  });
}
function verMiCV(){
  toast('Abriendo tu CV…');
  urlMedia('cv').then(function(u){ abrirVisorPdf(u, (S.perfil.cv && S.perfil.cv.nombre) || 'CV.pdf', true); })
    .catch(function(){ toast('No hemos podido abrir el CV.'); });
}

/* ---------- la tarjeta en Mi perfil ---------- */
/* «Tu presentación»: vídeo y CV, con el botón «Editar» y la portada (Fase 1: una sola versión) */
function pintarMedia(){
  var r = _pintarMediaBase.apply(this, arguments);
  if(window.CERCO_mediaEditar) CERCO_mediaEditar.apply(this, arguments);
  return r;
}
function _pintarMediaBase(){
  var box = $('pf-media'); if(!box) return;
  var p = S.perfil || {}, v = p.video, c = p.cv;
  var h = '<h3>'+svg('video','currentColor',16)+'Tu presentación</h3>'
    + '<p class="sub" style="margin:-4px 0 16px;font-size:13.5px;">Es lo primero que ve la clínica, antes que el CV.</p>';
  // vídeo
  if(v){
    h += '<div class="pm-vid'+(v.poster ? ' con-portada' : '')+'" id="pf-vid" data-w="'+(v.w||'')+'" data-h="'+(v.h||'')+'"'+(v.poster ? ' style="background-image:linear-gradient(rgba(15,28,63,.15),rgba(15,28,63,.45)),url(\''+esc(v.poster)+'\')"' : '')+'><button type="button" class="pm-play" onclick="verMiVideo()">'+svg('video','#fff',22)+'<span>Ver mi vídeo'+(v.dur ? ' ('+mmss(v.dur)+')' : '')+'</span></button>'+(v.poster ? '<span class="pm-portada">Portada que ve la clínica</span>' : '')+'</div>'
      + '<div class="pm-row"><button class="btn btn-s" onclick="abrirGrabadora()">'+svg('video','currentColor',15)+'Grabar otro</button><label class="btn btn-s">'+svg('upload','currentColor',15)+'Subir otro<input type="file" accept="video/*" class="sr" onchange="subirVideoPerfil(this)"></label><button class="btn btn-g" style="color:#DC2626;" onclick="quitarVideo()">Quitar</button></div>';
  } else {
    h += '<div class="pm-vacio"><div class="pm-vacio-ic">'+svg('video','#fff',24)+'</div><div style="min-width:0;"><b>Graba tu vídeo de presentación</b><span>Quién eres, qué te gusta de tu trabajo y qué buscas. La clínica lo ve antes que tu CV.</span></div>'
      + '<div class="pm-vacio-b"><button class="btn btn-p" onclick="abrirGrabadora()">'+svg('video','#1A3A9B',16)+'Grabar ahora</button><label class="btn pm-subir">'+svg('upload','#fff',16)+'Subir de mis archivos<input type="file" accept="video/*" class="sr" onchange="subirVideoPerfil(this)"></label></div></div>';
  }
  // la foto se pone arriba, en la cabecera del perfil
  // CV
  h += '<div class="pm-line"><div class="pm-doc">'+svg('file','#1A56DB',20)+'</div>'
    + '<div style="flex:1;min-width:0;"><b>'+(c ? esc(c.nombre || 'CV.pdf') : 'CV completo en PDF')+'</b><span>'+(c ? mb(c.size) + ' · la clínica puede verlo y descargarlo' : 'Opcional. Además de tu CV resumido.')+'</span></div>'
    + (c ? '<button class="btn btn-p pm-btn" onclick="verMiCV()">'+svg('eye','#fff',15)+'Ver</button>' : '')
    + '<label class="btn btn-s pm-btn">'+(c ? 'Cambiar' : 'Subir PDF')+'<input type="file" accept="application/pdf,.pdf" onchange="elegirCV(this)" hidden></label>'
    + (c ? '<button class="btn btn-g pm-btn" style="color:#DC2626;" onclick="quitarCV()">Quitar</button>' : '')
    + '</div>';
  box.innerHTML = h;
}
