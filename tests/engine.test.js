import test from 'node:test';
import assert from 'node:assert/strict';
import {levels} from '../src/levels.js';
import {initialDraft,initialState,step,simulate} from '../src/engine.js';
for(const l of levels)test(`level ${l.id} proven solution reaches both matching depots`,()=>{
 const result=simulate(l,l.solution);assert.equal(result.status,'success');assert.ok(result.tick<=64);
 assert.deepEqual(result.vans.map(v=>({x:v.x,y:v.y})),l.depots);
});
test('same-cell collision freezes exactly at crossing; further steps do nothing',()=>{
 const l=levels[2],r=simulate(l,initialDraft(l));assert.equal(r.failure.reason,'collision');assert.equal(r.tick,3);assert.deepEqual(r.failure.at,[3,3]);assert.equal(step(l,initialDraft(l),r),r);
});
test('one waiting beat resolves a real collision and visibly occupies the pad',()=>{
 const l=levels[2],d=structuredClone(l.solution),r=simulate(l,d);assert.equal(r.status,'success');
 assert.equal(r.frames[1].vans[0].wait,1);assert.equal(r.frames[1].vans[0].x,r.frames[2].vans[0].x);assert.equal(r.tick,7);
});
test('edge swap detected between cells',()=>{
 const l={rows:['#######'],starts:[{x:2,y:0,dir:1},{x:3,y:0,dir:3}],depots:[{x:6,y:0},{x:0,y:0}],pads:[]};
 const r=step(l,initialDraft(l),initialState(l));assert.equal(r.failure.reason,'swap');assert.deepEqual(r.failure.at,[2.5,0]);
});
test('wrong depot is distinct from collision',()=>{const l=levels[1],d=initialDraft(l);d.routes['3,3']='L';assert.equal(simulate(l,d).failure.reason,'depot');});
test('offroad failure keeps attempted position and van identity',()=>{const l=levels[0],r=simulate(l,initialDraft(l));assert.equal(r.failure.reason,'offroad');assert.equal(r.failure.van,'A');assert.deepEqual(r.failure.at,[7,1]);});
test('different approaches cross a straight sign and degree-two corners turn automatically',()=>{
 assert.equal(simulate(levels[1],levels[1].solution).status,'success');assert.equal(simulate(levels[4],levels[4].solution).status,'success');
});
test('one or the other wait is required in level 6; both waits collide',()=>{
 const l=levels[5],d=initialDraft(l);assert.equal(simulate(l,d).failure.reason,'collision');d.waits['1,3']=true;assert.equal(simulate(l,d).status,'success');d.waits['2,2']=true;assert.equal(simulate(l,d).failure.reason,'collision');
});
