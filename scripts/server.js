import {createServer} from 'node:http';import {readFile,stat} from 'node:fs/promises';import {resolve,extname,sep} from 'node:path';
export async function serve(directory,port=0){
 const root=resolve(directory),types={'.html':'text/html','.js':'text/javascript','.css':'text/css','.svg':'image/svg+xml','.ttf':'font/ttf','.txt':'text/plain'};
 const server=createServer(async(req,res)=>{
  try{const url=new URL(req.url,'http://localhost'),file=resolve(root,'.'+decodeURIComponent(url.pathname==='/'?'/index.html':url.pathname));
   if(file!==root&&!file.startsWith(root+sep)){res.writeHead(403).end();return;}
   const info=await stat(file);if(!info.isFile())throw Error();res.setHeader('Content-Type',types[extname(file)]??'application/octet-stream');res.end(await readFile(file));
  }catch{res.writeHead(404).end('Not found');}
 });
 await new Promise(r=>server.listen(port,'127.0.0.1',r));
 return {url:`http://127.0.0.1:${server.address().port}`,close:()=>new Promise(r=>server.close(r))};
}
