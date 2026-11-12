// Servidor web mínimo: sirve la web compilada por Vite (carpeta dist-pruebas),
// igual que la serviría GitHub Pages, para que las pruebas abran exactamente
// lo que se publica. Con WEB=. se sirve la carpeta del código sin compilar.
const http = require('http');
const fs = require('fs');
const path = require('path');

const RAIZ = path.resolve(__dirname, '..', '..', process.env.WEB || 'dist-pruebas');
const PUERTO = Number(process.env.PUERTO_WEB || 5500);
const TIPOS = { '.html': 'text/html; charset=utf-8', '.js': 'text/javascript', '.css': 'text/css',
  '.json': 'application/json', '.png': 'image/png', '.svg': 'image/svg+xml', '.pdf': 'application/pdf',
  '.woff2': 'font/woff2', '.mp4': 'video/mp4', '.webm': 'video/webm' };

http.createServer((req, res) => {
  let ruta = decodeURIComponent(new URL(req.url, 'http://x').pathname);
  if (ruta.endsWith('/')) ruta += 'index.html';
  const archivo = path.join(RAIZ, ruta);
  if (!archivo.startsWith(RAIZ) || archivo.includes(`${path.sep}node_modules${path.sep}`)) {
    res.writeHead(403); return res.end();
  }
  fs.readFile(archivo, (err, datos) => {
    if (err) { res.writeHead(404); return res.end('No encontrado'); }
    res.writeHead(200, { 'Content-Type': TIPOS[path.extname(archivo)] || 'application/octet-stream', 'Cache-Control': 'no-store' });
    res.end(datos);
  });
}).listen(PUERTO, '127.0.0.1', () => console.log(`Web de pruebas en http://127.0.0.1:${PUERTO}/`));
