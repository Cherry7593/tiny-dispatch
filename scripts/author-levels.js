import {writeFileSync} from 'node:fs';
import {specs} from './level-specs.js';
import {solve} from '../src/engine.js';
const levels=specs.map((s,i)=>{
 const rows=Array.from({length:7},()=>Array(7).fill('.'));
 for(const path of s.paths) for(let j=1;j<path.length;j++) {
  let [x,y]=path[j-1];const [tx,ty]=path[j];
  rows[y][x]='#';while(x!==tx||y!==ty) {x+=Math.sign(tx-x);y+=Math.sign(ty-y);rows[y][x]='#';}
 }
 const level={id:i+1,name:s.name,tip:s.tip,hint:s.hint,rows:rows.map(r=>r.join('')),starts:s.starts.map(([x,y,dir])=>({x,y,dir})),depots:s.depots.map(([x,y])=>({x,y})),pads:s.pads};
 const result=solve(level);console.log(i+1,JSON.stringify(result));
 return {...level,solution:result.solution};
});
writeFileSync('src/levels.js','// Twelve fixed hand-authored boards. Authoring source: scripts/level-specs.js.\nexport const levels = '+JSON.stringify(levels,null,2)+';\n');
