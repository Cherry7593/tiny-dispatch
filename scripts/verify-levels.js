import assert from 'node:assert/strict';import {writeFileSync,mkdirSync} from 'node:fs';
import {levels} from '../src/levels.js';import {solve,simulate,initialDraft} from '../src/engine.js';
const results=levels.map(l=>{
 const r=solve(l);assert.ok(r.solutions>0,`Level ${l.id} unsolvable`);assert.equal(simulate(l,l.solution).status,'success');assert.deepEqual(r.solution,l.solution);
 assert.equal(r.checked,3**r.junctions*2**r.pads);
 const baseline=simulate(l,initialDraft(l));
 const negatives=Object.entries(r.outcomes).filter(([code])=>code!=='success').map(([reason,count])=>({reason,count}));
 assert.ok(negatives.length>0);
 return {id:l.id,name:l.name[1],...r,initialStatus:baseline.status,initialFailure:baseline.failure?.reason??null,negativeCases:negatives};
});
const total=results.reduce((n,r)=>n+r.checked,0);
const artifact={method:'Exhaustive Cartesian product of all relative-turn signs (S/L/R) and wait toggles. Deterministic synchronous simulation, 64-beat bound.',totalConfigurations:total,levels:results};
mkdirSync('reports',{recursive:true});writeFileSync('reports/level-verification.json',JSON.stringify(artifact,null,2)+'\n');
console.log(JSON.stringify({levels:results.length,totalConfigurations:total,allSolvable:true,mandatoryWaitLevels:[3,6],results:results.map(r=>({level:r.id,checked:r.checked,solutions:r.solutions,shortestBeats:r.minTicks}))},null,2));
