import {execFileSync} from 'node:child_process';import {resolve} from 'node:path';import {rmSync,readFileSync} from 'node:fs';
const html=readFileSync('dist-playables/index.html','utf8');
if(!html.includes('https://www.youtube.com/game_api/v1'))throw Error('SDK missing');
if(html.indexOf('game_api/v1')>html.indexOf('type="module"'))throw Error('SDK must precede module');
const out=resolve('tiny-dispatch-playables.zip');rmSync(out,{force:true});execFileSync('zip',['-qr',out,'.'],{cwd:'dist-playables'});
console.log('Packaged tiny-dispatch-playables.zip with index.html at archive root.');
