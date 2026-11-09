import {chromium} from '@playwright/test';import assert from 'node:assert/strict';import {mkdirSync,writeFileSync} from 'node:fs';
import {serve} from './server.js';
const local=process.env.BASE_URL?null:await serve('dist');
const url=process.env.BASE_URL??local.url,browser=await chromium.launch();const errors=[],external=[];
try {
 const page=await browser.newPage({viewport:{width:390,height:844}});
 page.on('pageerror',e=>errors.push(e.message));page.on('console',m=>{if(m.type()==='error')errors.push(m.text());});
 page.on('request',r=>{if(new URL(r.url()).origin!==new URL(url).origin)external.push(r.url());});
 await page.goto(url);await page.locator('#app').waitFor({state:'visible'});await page.locator('canvas').waitFor({state:'visible'});
 assert.equal(await page.evaluate(()=>typeof window.__dispatch),'undefined','DEV hook must not ship');
 await page.locator('#language').click();assert.equal(await page.locator('#title').textContent(),'Tiny Dispatch');
 const sign=page.locator('.junction');await sign.focus();await sign.press('ArrowRight');await page.locator('#start').click();
 await page.waitForFunction(()=>document.documentElement.dataset.status==='success',null,{timeout:15000});
 await page.locator('#start').click();assert.equal(await page.locator('#level-number').textContent(),'02 / 12');
 await page.reload();await page.locator('#app').waitFor({state:'visible'});assert.equal(await page.locator('#level-number').textContent(),'02 / 12');
 assert.deepEqual(external,[]);assert.deepEqual(errors,[]);mkdirSync('artifacts',{recursive:true});await page.screenshot({path:'artifacts/production-smoke.png'});
 const report={target:process.env.BASE_URL??'local dist',passed:true,checks:['production hook absent','English toggle','keyboard route edit','real dispatch success','next unlock','reload progress','no external requests','no console errors']};
 writeFileSync('artifacts/production-smoke.json',JSON.stringify(report,null,2)+'\n');console.log(JSON.stringify(report,null,2));
}finally{await browser.close();await local?.close();}
