import {levels} from './levels.js';
import {initialDraft,MODES} from './engine.js';
export const emptySave=()=>({version:1,completed:[],last:1,drafts:{},muted:false,language:'zh'});
export function parseSave(raw) {
  if(!raw) return {data:emptySave(),status:'ok'};
  try {
    const v=JSON.parse(raw);
    if(v?.version!==1)return {data:emptySave(),status:'incompatible'};
    if(!Array.isArray(v.completed)||typeof v.drafts!=='object'||v.drafts===null)throw Error('shape');
    const data=emptySave();
    data.completed=[...new Set(v.completed.filter(n=>Number.isInteger(n)&&n>=1&&n<=12))].sort((a,b)=>a-b);
    const unlocked=Math.min(12,data.completed.length?Math.max(...data.completed)+1:1);
    data.last=Number.isInteger(v.last)&&v.last>=1&&v.last<=unlocked?v.last:1;
    data.muted=v.muted===true;data.language=v.language==='en'?'en':'zh';
    for(const l of levels) {
      const saved=v.drafts[l.id];if(!saved||typeof saved!=='object')continue;
      const draft=initialDraft(l);
      for(const k of Object.keys(draft.routes))if(MODES.includes(saved.routes?.[k]))draft.routes[k]=saved.routes[k];
      for(const k of l.pads)draft.waits[k]=saved.waits?.[k]===true;
      data.drafts[l.id]=draft;
    }
    return {data,status:'ok'};
  }catch{return {data:emptySave(),status:'corrupt'};}
}
export class SaveStore {
  constructor(platform,onStatus=()=>{}) {this.platform=platform;this.data=emptySave();this.status='loading';this.onStatus=onStatus;this.queue=Promise.resolve();this.writable=false;}
  setStatus(s){this.status=s;this.onStatus(s);}
  async load() {
    try {
      const result=parseSave(await this.platform.load());
      // A successful retry merges remote progress with progress earned in this session.
      const local=this.data;
      this.data={...result.data,completed:[...new Set([...result.data.completed,...local.completed])].sort((a,b)=>a-b),drafts:{...result.data.drafts,...local.drafts}};
      this.writable=result.status!=='incompatible';
      this.setStatus(result.status);
      return this.data;
    }catch {this.writable=false;this.setStatus('load-failed');return this.data;}
  }
  save() {
    if(!this.writable) {this.setStatus(this.status==='incompatible'?'incompatible':'load-failed');return this.queue;}
    const snapshot=structuredClone(this.data);
    if(this.platform.playables)delete snapshot.language;
    this.queue=this.queue.catch(()=>{}).then(async()=>{
      // Report a slow write, but do not release the queue while it is still in flight:
      // a late cloud completion must never overwrite a newer snapshot.
      const timer=setTimeout(()=>this.setStatus('save-failed'),5000);
      try {await this.platform.save(JSON.stringify(snapshot));this.setStatus('ok');}
      catch {this.setStatus('save-failed');}
      finally {clearTimeout(timer);}
    });
    return this.queue;
  }
}
