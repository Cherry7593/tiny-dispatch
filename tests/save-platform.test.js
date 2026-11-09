import test from 'node:test';import assert from 'node:assert/strict';
import {Platform} from '../src/platform.js';import {SaveStore,parseSave,emptySave} from '../src/save.js';
import {levels} from '../src/levels.js';import {initialDraft} from '../src/engine.js';
test('retry recovers untouched defaults but merges explicit per-cell edits and preferences, even during the read',async()=>{
 const draft=initialDraft(levels[11]);for(const key of Object.keys(draft.routes))draft.routes[key]='R';
 for(const key of Object.keys(draft.waits))draft.waits[key]=true;
 const original={...emptySave(),completed:[11],last:12,language:'en',muted:true,drafts:{12:draft}};
 let recover;const store=new SaveStore({load:()=>new Promise(resolve=>recover=resolve)});
 const loading=store.load();
 // A user can edit while a slow retry is still reading. Only that cell wins.
 const route=Object.keys(draft.routes)[0];
 store.update({last:12,language:'zh',muted:false,completed:[1],drafts:{12:{routes:{[route]:'S'}}}});
 recover(JSON.stringify(original));await loading;
 assert.equal(store.data.last,12);assert.equal(store.data.language,'zh');assert.equal(store.data.muted,false);
 assert.deepEqual(store.data.completed,[1,11]);
 assert.deepEqual(store.data.drafts[12],{routes:{...draft.routes,[route]:'S'},waits:draft.waits});
});
test('explicit reset to initial values wins over recovered routes and waits',async()=>{
 const original=initialDraft(levels[11]);for(const key of Object.keys(original.routes))original.routes[key]='R';
 for(const key of Object.keys(original.waits))original.waits[key]=true;
 let blocked=true;
 const store=new SaveStore({load:async()=>{if(blocked)throw Error('offline');return JSON.stringify({...emptySave(),completed:[11],last:12,drafts:{12:original}});}});
 await store.load();store.update({drafts:{12:initialDraft(levels[11])}});blocked=false;await store.load();
 assert.deepEqual(store.data.drafts[12],initialDraft(levels[11]));
});
function fake(){const calls=[],handlers={};let raw='';return {calls,handlers,get raw(){return raw;},set raw(v){raw=v;},IN_PLAYABLES_ENV:true,
 game:{firstFrameReady(){calls.push('first');},gameReady(){calls.push('ready');},async loadData(){calls.push('load');return raw;},async saveData(v){calls.push('save');raw=v;}},
 system:{isAudioEnabled:()=>false,onPause:fn=>handlers.pause=fn,onResume:fn=>handlers.resume=fn,onAudioEnabledChange:fn=>handlers.audio=fn,getLanguage:async()=> 'zh-CN'}};}
test('SDK readiness ordered, once; platform owns pause and mute; no visibility or local access',async()=>{
 const sdk=fake(),p=new Platform({sdk,storage:{getItem(){assert.fail();}},document:{addEventListener(){assert.fail();}}});
 p.gameReady();assert.deepEqual(sdk.calls,[]);p.firstFrameReady();p.firstFrameReady();p.gameReady();p.gameReady();assert.deepEqual(sdk.calls,['first','ready']);
 sdk.handlers.pause();assert.equal(p.paused,true);sdk.handlers.audio(true);assert.equal(p.paused,true);assert.equal(p.audio,true);sdk.handlers.resume();assert.equal(p.paused,false);assert.equal(await p.language(),'zh');
});
test('cloud save cannot run before successful load, including transient failures',async()=>{
 const sdk=fake(),p=new Platform({sdk});await assert.rejects(p.save('{}'),/load-required/);
 sdk.game.loadData=async()=>{throw Error('offline');};const s=new SaveStore(p);await s.load();s.data.completed=[1];await s.save();assert.equal(s.status,'load-failed');assert.ok(!sdk.calls.includes('save'));
 sdk.game.loadData=async()=>JSON.stringify({...emptySave(),completed:[2],last:3});await s.load();assert.deepEqual(s.data.completed,[1,2]);await s.save();assert.equal(s.status,'ok');assert.deepEqual(JSON.parse(sdk.raw).completed,[1,2]);assert.equal(JSON.parse(sdk.raw).language,undefined);
});
test('load failure never clears already valid in-memory progress',async()=>{
 const sdk=fake();sdk.raw=JSON.stringify({...emptySave(),completed:[1,2],last:3});const s=new SaveStore(new Platform({sdk}));await s.load();sdk.game.loadData=async()=>{throw Error('offline');};await s.load();assert.deepEqual(s.data.completed,[1,2]);
});
test('save calls serialized and latest snapshot wins even with a slow first write',async()=>{
 const writes=[];let inFlight=0;const p={playables:false,load:async()=>null,save:async raw=>{assert.equal(inFlight++,0);await new Promise(r=>setTimeout(r,5));writes.push(JSON.parse(raw));inFlight--;}};
 const s=new SaveStore(p);await s.load();s.data.completed=[1];s.save();s.data.completed=[1,2];await s.save();assert.equal(writes.length,2);assert.deepEqual(writes.at(-1).completed,[1,2]);
});
test('corrupt/future saves, bad drafts, duplicate progress, and blocked storage handled defensively',async()=>{
 assert.equal(parseSave('{bad').status,'corrupt');assert.equal(parseSave('{"version":99}').status,'incompatible');assert.equal(parseSave('{"version":1}').status,'corrupt');
 const v={...emptySave(),completed:[1,1,-2,13,'2'],last:12,drafts:{1:{routes:{'4,1':'BAD'},waits:{}}}};const r=parseSave(JSON.stringify(v));assert.deepEqual(r.data.completed,[1]);assert.equal(r.data.last,1);assert.equal(r.data.drafts[1].routes['4,1'],'S');
 const s=new SaveStore(new Platform({storage:{getItem(){throw Error('blocked');}}}));await s.load();assert.equal(s.status,'load-failed');await s.save();
});
test('write failure reported; next save recovers',async()=>{
 let blocked=true;const s=new SaveStore({load:async()=>'',save:async()=>{if(blocked)throw Error('quota');}});await s.load();await s.save();assert.equal(s.status,'save-failed');blocked=false;await s.save();assert.equal(s.status,'ok');
});
test('standalone visibility handler exists, SDK language error falls back to English',async()=>{
 let listener;const doc={hidden:true,addEventListener:(event,fn)=>{assert.equal(event,'visibilitychange');listener=fn;}};const p=new Platform({document:doc});listener();assert.equal(p.paused,true);doc.hidden=false;listener();assert.equal(p.paused,false);
 const sdk=fake();sdk.system.getLanguage=async()=>{throw Error();};assert.equal(await new Platform({sdk}).language(),'en');
});
test('future-version save cannot be overwritten',async()=>{
 let writes=0;const s=new SaveStore({load:async()=>'{"version":2}',save:async()=>writes++});await s.load();await s.save();assert.equal(writes,0);assert.equal(s.status,'incompatible');
});
