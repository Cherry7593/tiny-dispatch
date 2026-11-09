import {test,expect} from '@playwright/test';
import {levels} from '../../src/levels.js';
import {emptySave} from '../../src/save.js';
import {mkdirSync} from 'node:fs';
const read=page=>page.evaluate(()=>window.__dispatch.read());
async function open(page){await page.goto('/');await expect(page.locator('#app')).toBeVisible();await expect(page.locator('canvas')).toBeVisible();}
async function setSolution(page,l){
 const current=(await read(page)).draft;
 for(const [k,v] of Object.entries(l.solution.routes)){
  const b=page.locator(`.junction[data-cell="${k}"]`);
  const modes=['S','L','R'];let mode=current.routes[k];
  while(mode!==v){await b.click();mode=modes[(modes.indexOf(mode)+1)%3];}
 }
 for(const [k,v] of Object.entries(l.solution.waits))if(current.waits[k]!==v)await page.locator(`.pad[data-cell="${k}"]`).click();
}
async function run(page,status='success'){await page.locator('#start').click();await expect.poll(async()=>(await read(page)).state.status).toBe(status);}
async function seed(page,last=12){await page.addInitScript(data=>localStorage.setItem('tiny-dispatch-v1',JSON.stringify(data)),{...emptySave(),completed:Array.from({length:12},(_,i)=>i+1),last});}
async function assertSignTargets(page){
 const failures=await page.locator('.sign').evaluateAll(buttons=>{
  const errors=[],rects=buttons.map(b=>b.getBoundingClientRect());
  buttons.forEach((b,i)=>{
   const r=rects[i];
   for(let j=i+1;j<buttons.length;j++){
    const s=rects[j];
    if(Math.min(r.right,s.right)-Math.max(r.left,s.left)>.1&&Math.min(r.bottom,s.bottom)-Math.max(r.top,s.top)>.1)errors.push(`overlap ${b.dataset.cell} / ${buttons[j].dataset.cell}`);
   }
   // Test the left/right/top/bottom interior as well as centre, not just nominal sizes.
   for(const [x,y] of [[r.left+2,r.top+r.height/2],[r.right-2,r.top+r.height/2],[r.left+r.width/2,r.top+2],[r.left+r.width/2,r.bottom-2],[r.left+r.width/2,r.top+r.height/2]]){
    if(document.elementFromPoint(x,y)?.closest('.sign')!==b)errors.push(`wrong target ${b.dataset.cell} at ${x},${y}`);
   }
  });
  return errors;
 });
 expect(failures).toEqual([]);
}
function noErrors(page){const errors=[];page.on('pageerror',e=>errors.push(e.message));page.on('console',m=>{if(m.type()==='error')errors.push(m.text());});return errors;}

test('real controls solve all 12 levels, unlock next, celebrate, replay, and reload',async({page})=>{
 const errors=noErrors(page);await open(page);
 await page.locator('#level-select').click();await expect(page.locator('[data-level="2"]')).toBeDisabled();await page.locator('#close-levels').click();
 for(const l of levels){
  await expect.poll(async()=>(await read(page)).level).toBe(l.id);
  await setSolution(page,l);await run(page);
  await expect.poll(async()=>(await read(page)).completed.includes(l.id)).toBe(true);
  if(l.id<12)await page.locator('#start').click();
 }
 await expect(page.locator('#feedback-title')).toHaveText('十二站，全都送到了！');
 await page.screenshot({path:'artifacts/final-completion.png'});
 await page.reload();await expect(page.locator('#app')).toBeVisible();expect((await read(page)).completed).toHaveLength(12);expect((await read(page)).level).toBe(12);
 await setSolution(page,levels[11]);await run(page);await page.locator('#start').click();expect((await read(page)).level).toBe(1);expect(errors).toEqual([]);
});
test('offroad frozen cause, keyboard route edit, undo, retry, reset and draft persistence',async({page})=>{
 await open(page);await run(page,'failed');await expect(page.locator('#feedback-body')).toContainText('开出道路');
 const failed=await read(page);await page.waitForTimeout(200);expect((await read(page)).state).toEqual(failed.state);
 const sign=page.locator('.junction');await sign.focus();await sign.press('ArrowRight');expect((await read(page)).state.status).toBe('planning');expect((await read(page)).draft.routes['4,1']).toBe('R');
 await page.locator('#undo').click();expect((await read(page)).draft.routes['4,1']).toBe('S');
 await sign.press('ArrowRight');await page.reload();await expect(page.locator('#app')).toBeVisible();expect((await read(page)).draft.routes['4,1']).toBe('R');
 await run(page);await page.locator('#retry').click();await expect.poll(async()=>(await read(page)).state.status).toBe('success');
 await page.locator('#reset').click();expect((await read(page)).draft.routes['4,1']).toBe('S');await page.locator('#undo').click();expect((await read(page)).draft.routes['4,1']).toBe('R');
});
test('crossing collision, wait toggle + undo, wrong depot, and edge swap through UI',async({page})=>{
 await seed(page,3);await open(page);await run(page,'failed');await expect(page.locator('#feedback-body')).toContainText('同一格');
 const pad=page.locator('.pad');await pad.click();expect((await read(page)).draft.waits['1,3']).toBe(true);await page.locator('#undo').click();expect((await read(page)).draft.waits['1,3']).toBe(false);await pad.click();await run(page);
 await page.locator('#back').click();await page.locator('.junction').click();await run(page,'failed');await expect(page.locator('#feedback-body')).toContainText('送错');
 await page.locator('#start').click();await page.locator('.junction').click();await run(page,'failed');await expect(page.locator('#feedback-body')).toContainText('迎面');
});
test('explicit pause freezes beat and canvas, resumes; help, English, hints and mute work',async({page})=>{
 await seed(page,11);await open(page);await setSolution(page,levels[10]);await page.locator('#start').click();await page.locator('#pause').click();
 const state=await read(page),canvas=await page.locator('canvas').screenshot();await page.waitForTimeout(250);expect((await read(page)).state).toEqual(state.state);expect(await page.locator('canvas').screenshot()).toEqual(canvas);
 await page.locator('#pause').click();await expect.poll(async()=>(await read(page)).state.status).toBe('success');
 await page.locator('#language').click();await expect(page.locator('#title')).toHaveText('Tiny Dispatch');await page.locator('#hint').click();await expect(page.locator('#hint-panel')).toContainText('One proven route');
 await page.locator('#sound').click();await expect(page.locator('#sound')).toHaveAttribute('aria-pressed','true');
 await page.locator('#help').click();await expect(page.locator('#help-dialog')).toBeVisible();await expect(page.locator('#rules')).toContainText('swapping places');await page.keyboard.press('Escape');
});
test('corrupt, blocked and failed writes are honest, safe and recoverable',async({page})=>{
 await page.addInitScript(()=>{localStorage.setItem('tiny-dispatch-v1','{bad');const set=Storage.prototype.setItem;Storage.prototype.setItem=function(k,v){if(window.blockWrite)throw Error('quota');return set.call(this,k,v);};});
 await open(page);expect((await read(page)).level).toBe(1);await page.evaluate(()=>window.blockWrite=true);await page.locator('.junction').click();await expect(page.locator('#save-status')).toContainText('未能保存');
 await page.evaluate(()=>window.blockWrite=false);await page.locator('#save-retry').click();await expect(page.locator('#save-status')).toHaveText('进度已保存');
 const saved=await page.evaluate(()=>localStorage.getItem('tiny-dispatch-v1'));expect(JSON.parse(saved).drafts[1].routes['4,1']).toBe('L');
});
test('blocked localStorage loads playable board without crash',async({page})=>{
 await page.addInitScript(()=>Object.defineProperty(window,'localStorage',{get(){throw Error('blocked');}}));await open(page);await expect(page.locator('#save-status')).toContainText('无法读取');await setSolution(page,levels[0]);await run(page);
});
test('fake SDK: readiness, load failure guard, platform pause cannot be locally resumed, audio restrictions',async({page})=>{
 await page.addInitScript(()=>{
  const calls=[],h={};window.mockSDK={calls,h,failLoad:true,saved:null};
  const listen=key=>fn=>{h[key]=fn;return ()=>{};};
  window.ytgame={IN_PLAYABLES_ENV:true,game:{firstFrameReady:()=>calls.push(['first',!!document.getElementById('loading')]),gameReady:()=>calls.push(['ready',!document.getElementById('app').hidden]),loadData:async()=>{calls.push(['load']);if(window.mockSDK.failLoad)throw Error('cloud');return '';},saveData:async raw=>{calls.push(['save']);window.mockSDK.saved=raw;}},system:{getLanguage:async()=>{throw Error('locale');},isAudioEnabled:()=>false,onPause:listen('pause'),onResume:listen('resume'),onAudioEnabledChange:listen('audio')}};
  document.addEventListener=new Proxy(document.addEventListener,{apply(target,self,args){if(args[0]==='visibilitychange')calls.push(['visibility']);return Reflect.apply(target,self,args);}});
 });
 await open(page);await expect(page.locator('#title')).toHaveText('Tiny Dispatch');
 await expect.poll(()=>page.evaluate(()=>window.mockSDK.calls.some(c=>c[0]==='ready'))).toBe(true);
 const calls=await page.evaluate(()=>window.mockSDK.calls);expect(calls).toContainEqual(['first',true]);expect(calls).toContainEqual(['ready',true]);expect(calls.some(v=>v[0]==='save'||v[0]==='visibility')).toBe(false);
 await page.locator('#sound').click();await expect(page.locator('#sound')).toHaveAttribute('aria-pressed','true');
 await page.evaluate(()=>window.mockSDK.h.pause());expect((await read(page)).platformPaused).toBe(true);await expect(page.locator('#pause-cover')).toBeVisible();expect(await page.locator('#app').evaluate(el=>el.inert)).toBe(true);
 await page.evaluate(()=>window.mockSDK.h.audio(true));expect((await read(page)).platformPaused).toBe(true);
 await page.evaluate(()=>window.mockSDK.h.resume());expect((await read(page)).platformPaused).toBe(false);
 await page.evaluate(()=>window.mockSDK.failLoad=false);await page.locator('#save-retry').click();await expect.poll(()=>page.evaluate(()=>window.mockSDK.saved!==null)).toBe(true);
 const saved=JSON.parse(await page.evaluate(()=>window.mockSDK.saved));expect(saved.language).toBeUndefined();
});
for(const [width,height,label] of [[1440,900,'desktop'],[390,844,'portrait'],[360,800,'portrait-small'],[844,390,'landscape'],[320,568,'compact'],[667,375,'landscape-small'],[568,320,'landscape-compact']])test(`viewport ${label}: visible essentials, touch controls, no overflow or errors`,async({browser})=>{
 const context=await browser.newContext({viewport:{width,height},hasTouch:true,isMobile:width<500,reducedMotion:'reduce'});const page=await context.newPage();const errors=noErrors(page);await seed(page,12);await open(page);
 for(const language of ['zh','en']){
  if(language==='en')await page.locator('#language').tap();
  const bounds=await page.evaluate(()=>({width:document.documentElement.scrollWidth,height:document.documentElement.scrollHeight}));expect(bounds.width).toBeLessThanOrEqual(width);expect(bounds.height).toBeLessThanOrEqual(height);
  for(const id of ['map','start','pause','reset','sound','language','save-status','feedback']){
   const b=await page.locator('#'+id).boundingBox();expect(b.x).toBeGreaterThanOrEqual(0);expect(b.y).toBeGreaterThanOrEqual(0);expect(b.x+b.width).toBeLessThanOrEqual(width+1);expect(b.y+b.height).toBeLessThanOrEqual(height+1);
  }
  await assertSignTargets(page);
 }
 await page.locator('#hint').tap();await expect(page.locator('#hint-panel')).toBeVisible();
 await page.locator('.hint-close').tap();await expect(page.locator('#hint-panel')).toBeHidden();
 await page.evaluate(()=>window.scrollTo(0,0));
 await page.locator('.junction').first().tap();expect((await read(page)).history).toBeUndefined();
 if(label==='landscape-small'||label==='landscape-compact'){
  // The reported left-interior point of the central junction used to edit its neighbour.
  const junction=page.locator('.junction[data-cell="3,3"]'),box=await junction.boundingBox();
  const before=(await read(page)).draft;await page.touchscreen.tap(box.x+2,box.y+box.height/2);
  const after=(await read(page)).draft;expect(after.routes['3,3']).not.toBe(before.routes['3,3']);expect(after.waits).toEqual(before.waits);
 }
 mkdirSync('artifacts',{recursive:true});await page.screenshot({path:`artifacts/${label}.png`});
 await run(page,'failed');
 const failedBounds=await page.evaluate(()=>({width:document.documentElement.scrollWidth,height:document.documentElement.scrollHeight}));
 expect(failedBounds.width).toBeLessThanOrEqual(width);expect(failedBounds.height).toBeLessThanOrEqual(height);
 if(label==='compact')await page.screenshot({path:'artifacts/compact-failure.png'});
 if(label==='landscape-small'||label==='landscape-compact'){
  await page.evaluate(()=>{Storage.prototype.setItem=()=>{throw Error('quota');};});
  await page.locator('.junction').first().tap();await expect(page.locator('#save-retry')).toBeVisible();
  for(const language of ['en','zh']){
   if(language==='zh')await page.locator('#language').tap();
   const bounds=await page.evaluate(()=>({width:document.documentElement.scrollWidth,height:document.documentElement.scrollHeight}));
   expect(bounds.width).toBeLessThanOrEqual(width);expect(bounds.height).toBeLessThanOrEqual(height);
   for(const selector of ['.save-line','#save-retry','#feedback','#start','.planning-tools button']){
    for(const control of await page.locator(selector).all()){
     const b=await control.boundingBox();expect(b.y).toBeGreaterThanOrEqual(0);expect(b.y+b.height).toBeLessThanOrEqual(height);
    }
   }
  }
  await page.screenshot({path:`artifacts/${label}-save-error.png`});
 }
 expect(errors).toEqual([]);await context.close();
});
