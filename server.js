const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = process.env.PORT || 3000;
const ROOT = __dirname;
const EXACT_GAME = 'Earthpol_Legends_Oxbit_Exact_Encounter.html';
const OXBIT_THEME = 'oxbit-theme-upload.ogg';
const OXBIT_PREVIEW = 'oxbit-preview.jpg';

function exists(file){ return fs.existsSync(path.join(ROOT,file)); }
function sendFile(res, file, type, cache='public, max-age=300', extra={}){
  const full=path.join(ROOT,file);
  if(!fs.existsSync(full)){
    res.writeHead(404, {'Content-Type':'text/plain; charset=utf-8'});
    return res.end('Not found');
  }
  res.writeHead(200, {'Content-Type':type,'Cache-Control':cache,...extra});
  fs.createReadStream(full).pipe(res);
}
function sendExactGame(res){
  if(!exists(EXACT_GAME)){
    res.writeHead(503, {'Content-Type':'text/plain; charset=utf-8'});
    return res.end('Exact Earthpol Legends Oxbit encounter asset is not installed yet.');
  }
  return sendFile(res, EXACT_GAME, 'text/html; charset=utf-8', 'public, max-age=300');
}

const server=http.createServer((req,res)=>{
  const u=new URL(req.url,'http://localhost');
  if(u.pathname==='/health'){
    res.writeHead(200,{'Content-Type':'application/json'});
    return res.end(JSON.stringify({ok:true, exactEncounter:exists(EXACT_GAME), oxbitTheme:exists(OXBIT_THEME), preview:exists(OXBIT_PREVIEW)}));
  }
  if(u.pathname==='/game.html' || u.pathname==='/oxbit-exact.html') return sendExactGame(res);
  if(u.pathname==='/oxbit-theme.ogg') return sendFile(res,OXBIT_THEME,'audio/ogg','public, max-age=86400');
  if(u.pathname==='/oxbit-preview.jpg') return sendFile(res,OXBIT_PREVIEW,'image/jpeg','public, max-age=86400');
  if(u.pathname==='/oxbit' || u.pathname==='/oxbit/' || u.pathname==='/oxbit-discord-v10') return sendFile(res,'oxbit.html','text/html; charset=utf-8','no-cache');
  if(u.pathname==='/' || u.pathname==='/index.html') return sendFile(res,'index.html','text/html; charset=utf-8');
  res.writeHead(404,{'Content-Type':'text/plain; charset=utf-8'}); res.end('Not found');
});
server.listen(PORT,()=>console.log(`Earthpol Legends exact Oxbit wiki server listening on ${PORT}`));
