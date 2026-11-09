import {defineConfig} from '@playwright/test';
export default defineConfig({
 testDir:'./tests/e2e',timeout:40000,expect:{timeout:8000},fullyParallel:true,workers:2,
 use:{baseURL:'http://127.0.0.1:8080',headless:true,viewport:{width:1440,height:900},screenshot:'only-on-failure',trace:'retain-on-failure'},
 reporter:[['list'],['json',{outputFile:'artifacts/e2e-results.json'}]],
 webServer:{command:'VITE_BEAT_MS=90 npm run dev -- --host 127.0.0.1',url:'http://127.0.0.1:8080',reuseExistingServer:false,timeout:30000},
});
