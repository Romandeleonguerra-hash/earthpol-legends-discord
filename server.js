const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = process.env.PORT || 3000;
const ROOT = __dirname;
const GAME_GZIP_PARTS = ['game.html.gz.part1','game.html.gz.part2'];

function sendFile(res, file, type, cache = 'public, max-age=300') {
  const full = path.join(ROOT, file);
  if (!fs.existsSync(full)) {
    res.writeHead(503, {'Content-Type':'text/plain; charset=utf-8'});
    return res.end('Earthpol Legends asset is not uploaded yet.');
  }
  res.writeHead(200, {'Content-Type': type, 'Cache-Control': cache});
  fs.createReadStream(full).pipe(res);
}

function streamCompressedGame(res) {
  for (const part of GAME_GZIP_PARTS) {
    if (!fs.existsSync(path.join(ROOT, part))) {
      res.writeHead(503, {'Content-Type':'text/plain; charset=utf-8'});
      return res.end('Earthpol Legends game files are not uploaded yet.');
    }
  }
  res.writeHead(200, {
    'Content-Type': 'text/html; charset=utf-8',
    'Content-Encoding': 'gzip',
    'Cache-Control': 'public, max-age=3600',
    'Vary': 'Accept-Encoding'
  });
  let i = 0;
  const next = () => {
    if (i >= GAME_GZIP_PARTS.length) return res.end();
    const s = fs.createReadStream(path.join(ROOT, GAME_GZIP_PARTS[i++]));
    s.on('end', next);
    s.on('error', err => { console.error(err); res.destroy(); });
    s.pipe(res, {end:false});
  };
  next();
}

const server = http.createServer((req, res) => {
  const u = new URL(req.url, 'http://localhost');
  if (u.pathname === '/health') {
    res.writeHead(200, {'Content-Type':'text/plain'});
    return res.end('ok');
  }
  if (u.pathname === '/game.html') return streamCompressedGame(res);
  if (u.pathname === '/oxbit-preview.png') return sendFile(res, 'oxbit-preview.png', 'image/png', 'public, max-age=86400');
  if (u.pathname === '/oxbit' || u.pathname === '/oxbit/') return sendFile(res, 'oxbit.html', 'text/html; charset=utf-8');
  if (u.pathname === '/' || u.pathname === '/index.html') return sendFile(res, 'index.html', 'text/html; charset=utf-8');
  res.writeHead(404, {'Content-Type':'text/plain'});
  res.end('Not found');
});

server.listen(PORT, () => console.log(`Earthpol Legends Discord Wiki listening on ${PORT}`));
