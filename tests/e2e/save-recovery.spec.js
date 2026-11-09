import {test,expect} from '@playwright/test';
import {emptySave} from '../../src/save.js';
import {initialDraft} from '../../src/engine.js';
import {levels} from '../../src/levels.js';
const read=page=>page.evaluate(()=>window.__dispatch.read());

function originalSave(){
 const first=initialDraft(levels[0]);first.routes['4,1']='R';
 const third=initialDraft(levels[2]);third.waits['1,3']=true;
 return {...emptySave(),completed:[1,2],last:3,language:'en',muted:true,drafts:{1:first,3:third}};
}
async function openOutage(page,cloud,completed=[1,2]){
 const original={...originalSave(),completed};
 await page.addInitScript(({original,cloud})=>{
  window.recovery={blocked:true,saved:null};
  if(cloud){
   const listen=()=>{};
   window.ytgame={IN_PLAYABLES_ENV:true,game:{firstFrameReady(){},gameReady(){},async loadData(){if(window.recovery.blocked)throw Error('offline');return JSON.stringify(original);},async saveData(raw){window.recovery.saved=JSON.parse(raw);}},system:{isAudioEnabled:()=>true,onPause:listen,onResume:listen,onAudioEnabledChange:listen,getLanguage:async()=> 'en'}};
  }else{
   localStorage.setItem('tiny-dispatch-v1',JSON.stringify(original));
   const get=Storage.prototype.getItem,set=Storage.prototype.setItem;
   Storage.prototype.getItem=function(key){if(window.recovery.blocked)throw Error('offline');return get.call(this,key);};
   Storage.prototype.setItem=function(key,value){window.recovery.saved=JSON.parse(value);return set.call(this,key,value);};
  }
 },{original,cloud});
 await page.goto('/');await expect(page.locator('canvas')).toBeVisible();
 await expect.poll(async()=>(await read(page)).saveStatus).toBe('load-failed');
 expect(await page.evaluate(()=>window.recovery.saved)).toBeNull();
 return original;
}
async function recover(page){
 await page.evaluate(()=>window.recovery.blocked=false);await page.locator('#save-retry').click();
 await expect.poll(async()=>(await read(page)).saveStatus).toBe('ok');
 return page.evaluate(()=>window.recovery.saved);
}
for(const cloud of [false,true]){
 const label=cloud?'cloud':'local';
 test(`${label}: no-op load retry restores stored board, routes and preferences`,async({page})=>{
  const original=await openOutage(page,cloud),saved=await recover(page);
  expect((await read(page)).level).toBe(3);expect((await read(page)).draft).toEqual(original.drafts[3]);
  await expect(page.locator('#title')).toHaveText('Tiny Dispatch');await expect(page.locator('#sound')).toHaveAttribute('aria-pressed','true');
  expect(saved).toEqual(cloud?Object.fromEntries(Object.entries(original).filter(([k])=>k!=='language')):original);
 });
 test(`${label}: retry merges genuine edits, default-valued preferences and earned progress`,async({page})=>{
  const original=await openOutage(page,cloud,[2]);
  // A real edit back to a default value must still override the recovered preference.
  await page.locator('#sound').click();await page.locator('#sound').click();
  if(!cloud)await page.locator('#language').click();
  await page.locator('#language').click();
  await page.locator('.junction').press('ArrowRight');
  await page.locator('#start').click();await expect.poll(async()=>(await read(page)).state.status).toBe('success');
  const saved=await recover(page);
  expect(saved.completed).toEqual([1,2]);expect(saved.last).toBe(1);expect(saved.drafts[1].routes['4,1']).toBe('R');
  expect(saved.drafts[3]).toEqual(original.drafts[3]);expect(saved.muted).toBe(false);
  await expect(page.locator('#title')).toHaveText('小小快递站');await expect(page.locator('#sound')).toHaveAttribute('aria-pressed','false');
  expect(saved.language).toBe(cloud?undefined:'zh');expect((await read(page)).level).toBe(1);
 });
 test(`${label}: preference-only edits preserve recovered last level and all routes`,async({page})=>{
  const original=await openOutage(page,cloud);
  if(!cloud)await page.locator('#language').click();
  await page.locator('#language').click();
  const saved=await recover(page);
  expect(saved.last).toBe(3);expect(saved.drafts).toEqual(original.drafts);expect(saved.muted).toBe(true);
  expect((await read(page)).level).toBe(3);await expect(page.locator('#title')).toHaveText('小小快递站');
 });
 test(`${label}: editing one setting does not overwrite untouched recovered board or preferences`,async({page})=>{
  const original=await openOutage(page,cloud);await page.locator('.junction').click();
  const saved=await recover(page);
  expect(saved.last).toBe(1);expect(saved.drafts[1].routes['4,1']).toBe('L');expect(saved.drafts[3]).toEqual(original.drafts[3]);
  expect(saved.muted).toBe(true);await expect(page.locator('#title')).toHaveText('Tiny Dispatch');
 });
}
