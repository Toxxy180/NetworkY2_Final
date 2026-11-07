import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
const root=path.resolve('dist');
const types={'.html':'text/html; charset=utf-8','.js':'text/javascript; charset=utf-8','.css':'text/css; charset=utf-8','.svg':'image/svg+xml','.pdf':'application/pdf'};
http.createServer((req,res)=>{let target;try{target=path.resolve(root,'.'+decodeURIComponent(new URL(req.url,'http://localhost').pathname));}catch{res.writeHead(400);res.end();return;}if(target!==root&&!target.startsWith(root+path.sep)){res.writeHead(403);res.end();return;}if(target===root)target=path.join(root,'index.html');fs.readFile(target,(err,data)=>{if(err){res.writeHead(404);res.end('Not found');return;}res.writeHead(200,{'Content-Type':types[path.extname(target)]||'application/octet-stream','Cache-Control':'no-store'});res.end(data)});}).listen(4173,'127.0.0.1',()=>console.log('Network Final Lab: http://127.0.0.1:4173'));
