import {chromium} from '@playwright/test';import assert from 'node:assert/strict';import {readFileSync,writeFileSync} from 'node:fs';
import {serve} from './server.js';
const html=readFileSync('dist-playables/index.html','utf8');assert.ok(html.indexOf('game_api/v1')<html.indexOf('type="module"'));
for(const match of html.matchAll(/(?:src|href)="([^"]+)"/g))assert.ok(match[1]==='https://www.youtube.com/game_api/v1'||match[1].startsWith('./'),'relative asset: '+match[1]);
const server=await serve('dist-playables'),browser=await chromium.launch();
try{
 const page=await browser.newPage({viewport:{width:844,height:390}}),errors=[],external=[];
 page.on('pageerror',e=>errors.push(e.message));page.on('request',r=>{if(new URL(r.url()).origin!==new URL(server.url).origin)external.push(r.url());});
 // Explicit test-only mock. This is NOT the official YouTube certification suite.
 await page.addInitScript(()=>{
  window.sdkEvidence={events:[],handlers:{},writes:[]};const evidence=window.sdkEvidence;
  const add=document.addEventListener;document.addEventListener=function(name,...args){if(name==='visibilitychange')evidence.events.push('visibility');return add.call(this,name,...args);};
  Object.defineProperty(window,'localStorage',{get(){throw Error('Playables must not use localStorage');}});
 });
 await page.route('https://www.youtube.com/game_api/v1',route=>route.fulfill({contentType:'text/javascript',body:`{
 const e=window.sdkEvidence;const listen=k=>fn=>{e.handlers[k]=fn;return ()=>{};};
 window.ytgame={IN_PLAYABLES_ENV:true,game:{firstFrameReady:()=>e.events.push(document.querySelector('#loading')?'first-on-loading':'bad-first'),gameReady:()=>e.events.push(!document.querySelector('#app').hidden?'ready-interactable':'bad-ready'),loadData:async()=>{e.events.push('load');return '';},saveData:async raw=>{e.events.push('save');e.writes.push(raw);}},system:{getLanguage:async()=>'en-US',isAudioEnabled:()=>false,onPause:listen('pause'),onResume:listen('resume'),onAudioEnabledChange:listen('audio')}};
 }`}));
 await page.goto(server.url);await page.waitForFunction(()=>window.sdkEvidence.events.includes('ready-interactable'));
 assert.equal(await page.locator('#title').textContent(),'Tiny Dispatch');
 let evidence=await page.evaluate(()=>({events:window.sdkEvidence.events,writes:window.sdkEvidence.writes}));
 assert.equal(evidence.events[0],'first-on-loading');assert.ok(evidence.events.indexOf('load')<evidence.events.indexOf('save'));assert.ok(!evidence.events.includes('visibility'));
 await page.locator('.junction').press('ArrowRight');await page.locator('#start').click();await page.evaluate(()=>window.sdkEvidence.handlers.pause());
 const beat=await page.locator('#beat-number').textContent(),image=await page.locator('canvas').screenshot();await page.waitForTimeout(150);
 assert.equal(await page.locator('#beat-number').textContent(),beat);assert.deepEqual(await page.locator('canvas').screenshot(),image);
 assert.equal(await page.locator('#app').evaluate(e=>e.inert),true);
 await page.evaluate(()=>window.sdkEvidence.handlers.resume());await page.waitForFunction(()=>document.documentElement.dataset.status==='success',null,{timeout:15000});
 assert.equal(await page.locator('#sound').getAttribute('aria-pressed'),'true');
 assert.deepEqual(external,['https://www.youtube.com/game_api/v1']);assert.deepEqual(errors,[]);
 evidence=await page.evaluate(()=>({events:window.sdkEvidence.events,writes:window.sdkEvidence.writes.length}));
 const result={passed:true,testOnlyMock:true,officialCertification:false,...evidence};writeFileSync('artifacts/playables-smoke.json',JSON.stringify(result,null,2)+'\n');console.log(JSON.stringify(result,null,2));
}finally{await browser.close();await server.close();}
