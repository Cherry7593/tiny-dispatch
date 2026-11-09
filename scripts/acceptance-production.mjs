import {chromium,webkit,firefox} from '@playwright/test';
import assert from 'node:assert/strict';
import {mkdirSync,writeFileSync} from 'node:fs';
import {levels} from '../src/levels.js';
const url=process.env.BASE_URL||'http://127.0.0.1:4187/';
const report={url,results:[]};
const engines=process.env.TEST_FIREFOX==='1'?{chromium,webkit,firefox}:{chromium,webkit};
for(const [name,type] of Object.entries(engines)) {
 const browser=await type.launch();
 try {
  const context=await browser.newContext({viewport:{width:390,height:844},hasTouch:true});
  const page=await context.newPage(),errors=[];
  page.on('pageerror',e=>errors.push(e.message));
  await page.goto(url); await page.locator('#app').waitFor({state:'visible'});
  const verified=[];
  for(const level of levels.slice(0,name==='chromium'?12:3)) {
   assert.equal(await page.locator('#level-number').innerText(),`${String(level.id).padStart(2,'0')} / 12`);
   for(const [cell,mode] of Object.entries(level.solution.routes)) {
    const button=page.locator(`.junction[data-cell="${cell}"]`);
    for(let i=0;i<['S','L','R'].indexOf(mode);i++)await button.tap();
   }
   for(const [cell,enabled] of Object.entries(level.solution.waits))if(enabled)await page.locator(`.pad[data-cell="${cell}"]`).tap();
   await page.locator('#start').tap();
   await page.waitForFunction(()=>document.documentElement.dataset.status==='success',null,{timeout:30000});
   verified.push(level.id);
   if(level.id<(name==='chromium'?12:3))await page.locator('#start').tap();
  }
  await page.reload(); await page.locator('#app').waitFor({state:'visible'});
  const saved=JSON.parse(await page.evaluate(()=>localStorage.getItem('tiny-dispatch-v1')));
  assert.equal(saved.completed.length,verified.length);
  for(const [width,height] of [[390,844],[844,390],[320,568]]) {
   await page.setViewportSize({width,height});
   const bounds=await page.evaluate(()=>({w:document.documentElement.scrollWidth,h:document.documentElement.scrollHeight}));
   assert.ok(bounds.w<=width&&bounds.h<=height,JSON.stringify(bounds));
  }
  assert.deepEqual(errors,[]);
  mkdirSync('artifacts',{recursive:true});
  await page.screenshot({path:`artifacts/acceptance-${name}.png`});
  report.results.push({browser:name,levels:verified,reload:true,rotation:true,errors});
  console.log(`${name}: levels ${verified.join(',')}, reload, rotation PASS`);
 } finally {await browser.close();}
}
writeFileSync('artifacts/independent-production-acceptance.json',JSON.stringify(report,null,2));
