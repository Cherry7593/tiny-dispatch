import {test,expect} from '@playwright/test';
async function setup(page,cloud=false){
 await page.addInitScript(cloud=>{
  window.audioContexts=[];window.audioEffects=0;
  const NativeAudio=window.AudioContext;
  window.AudioContext=class extends NativeAudio {
   constructor(...args){super(...args);window.audioContexts.push(this);}
   createOscillator(...args){window.audioEffects++;return super.createOscillator(...args);}
  };
  window.setVisibility=hidden=>{Object.defineProperty(document,'hidden',{configurable:true,value:hidden});document.dispatchEvent(new Event('visibilitychange'));};
  if(cloud){
   const h={};window.audioSDK=h;
   window.ytgame={IN_PLAYABLES_ENV:true,game:{firstFrameReady(){},gameReady(){},loadData:async()=>'',saveData:async()=>{}},system:{isAudioEnabled:()=>true,onPause:fn=>h.pause=fn,onResume:fn=>h.resume=fn,onAudioEnabledChange:fn=>h.audio=fn,getLanguage:async()=> 'en'}};
  }
 },cloud);
 await page.goto('/');await expect(page.locator('canvas')).toBeVisible();
}
const audioState=page=>page.evaluate(()=>window.audioContexts[0]?.state??'absent');
for(const cloud of [false,true])test(`${cloud?'SDK':'visibility'} resume restores a real unlocked AudioContext and respects mute`,async({page})=>{
 await setup(page,cloud);
 const pause=()=>page.evaluate(cloud=>cloud?window.audioSDK.pause():window.setVisibility(true),cloud);
 const resume=()=>page.evaluate(cloud=>cloud?window.audioSDK.resume():window.setVisibility(false),cloud);
 await pause();await resume();expect(await audioState(page)).toBe('absent');
 await page.locator('#start').click();await expect.poll(()=>audioState(page)).toBe('running');
 await pause();await expect.poll(()=>audioState(page)).toBe('suspended');
 if(cloud){
  // Phaser/browser visibility must not override the SDK's pause ownership.
  await page.evaluate(()=>{window.setVisibility(true);window.setVisibility(false);});
  expect(await page.evaluate(()=>window.__dispatch.read().platformPaused)).toBe(true);expect(await audioState(page)).toBe('suspended');
 }
 await resume();await expect.poll(()=>audioState(page)).toBe('running');
 await expect.poll(()=>page.evaluate(()=>window.__dispatch.read().state.status)).toBe('failed');
 const effects=await page.evaluate(()=>window.audioEffects);await page.locator('#retry').click();
 expect(await page.evaluate(()=>window.audioEffects)).toBeGreaterThan(effects);
 await page.locator('#sound').click();await expect.poll(()=>audioState(page)).toBe('suspended');
 await pause();await resume();expect(await audioState(page)).toBe('suspended');await expect(page.locator('#sound')).toHaveAttribute('aria-pressed','true');
 await page.locator('#sound').click();await expect.poll(()=>audioState(page)).toBe('running');
 if(cloud){
  await page.evaluate(()=>window.audioSDK.audio(false));await expect.poll(()=>audioState(page)).toBe('suspended');
  await pause();await resume();expect(await audioState(page)).toBe('suspended');
  await page.evaluate(()=>window.audioSDK.audio(true));await expect.poll(()=>audioState(page)).toBe('running');
 }
});
for(const refusal of ['rejected','pending'])test(`a ${refusal} platform audio resume is shown accurately and can be retried by gesture`,async({page})=>{
 await setup(page);await page.locator('#start').click();await expect.poll(()=>audioState(page)).toBe('running');
 await page.evaluate(()=>window.setVisibility(true));await expect.poll(()=>audioState(page)).toBe('suspended');
 await page.evaluate(refusal=>{const ctx=window.audioContexts[0];window.restoreResume=()=>delete ctx.resume;ctx.resume=()=>refusal==='pending'?new Promise(()=>{}):Promise.reject(Error('NotAllowedError'));window.setVisibility(false);},refusal);
 await expect(page.locator('#sound')).toHaveAttribute('aria-pressed','true');await expect(page.locator('#sound')).toHaveAttribute('aria-label','点击恢复声音');
 expect(await audioState(page)).toBe('suspended');
 await page.evaluate(()=>window.restoreResume());await page.locator('#sound').click();await expect.poll(()=>audioState(page)).toBe('running');await expect(page.locator('#sound')).toHaveAttribute('aria-pressed','false');
});
