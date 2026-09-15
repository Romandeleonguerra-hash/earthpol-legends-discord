const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = process.env.PORT || 3000;
const ROOT = __dirname;

function sendFile(res, file, type, cache = 'public, max-age=300') {
  const full = path.join(ROOT, file);
  if (!fs.existsSync(full)) {
    res.writeHead(404, {'Content-Type':'text/plain; charset=utf-8'});
    return res.end('Not found');
  }
  res.writeHead(200, {'Content-Type': type, 'Cache-Control': cache});
  fs.createReadStream(full).pipe(res);
}

const server = http.createServer((req, res) => {
  const u = new URL(req.url, 'http://localhost');
  if (u.pathname === '/health') {
    res.writeHead(200, {'Content-Type':'text/plain'});
    return res.end('ok');
  }
  // Lightweight boss-specific build for Discord/wiki embedding.
  if (u.pathname === '/game.html' || u.pathname === '/oxbit-microgame.html')
    return sendFile(res, 'oxbit-microgame.html', 'text/html; charset=utf-8', 'public, max-age=300');
  if (u.pathname === '/oxbit-preview.png')
    return sendFile(res, 'oxbit-preview.png', 'image/png', 'public, max-age=86400');
  if (u.pathname === '/oxbit' || u.pathname === '/oxbit/')
    return sendFile(res, 'oxbit.html', 'text/html; charset=utf-8');
  if (u.pathname === '/' || u.pathname === '/index.html')
    return sendFile(res, 'index.html', 'text/html; charset=utf-8');
  res.writeHead(404, {'Content-Type':'text/plain'});
  res.end('Not found');
});

server.listen(PORT, () => console.log(`Earthpol Legends Discord Wiki listening on ${PORT}`));
