// SDK boundary adapted from the official MIT Phaser sample's YouTubePlayables.js.
// Changed: injected dependencies, strict cloud-load guard, error propagation, offline isolation.
export class Platform {
  constructor({sdk,storage,document:doc}={}) {
    this.sdk=sdk;this.playables=Boolean(sdk?.IN_PLAYABLES_ENV);this.storage=storage;this.doc=doc;
    this.loaded=false;this.paused=false;this.audio=true;this.listeners=new Set();this.first=false;this.ready=false;
    if(this.playables) {
      this.audio=sdk.system.isAudioEnabled();
      sdk.system.onAudioEnabledChange(on=>{this.audio=on;this.emit();});
      sdk.system.onPause(()=>{this.paused=true;this.emit();});
      sdk.system.onResume(()=>{this.paused=false;this.emit();});
    } else if(doc) {
      doc.addEventListener('visibilitychange',()=>{this.paused=doc.hidden;this.emit();});
    }
  }
  subscribe(fn) {this.listeners.add(fn);return ()=>this.listeners.delete(fn);}
  emit() {for(const fn of this.listeners) fn();}
  firstFrameReady() {if(this.playables&&!this.first){this.sdk.game.firstFrameReady();this.first=true;}}
  gameReady() {if(this.playables&&this.first&&!this.ready){this.sdk.game.gameReady();this.ready=true;}}
  async language() {if(!this.playables)return 'zh';try {return (await bounded(this.sdk.system.getLanguage())).toLowerCase().startsWith('zh')?'zh':'en';}catch{return 'en';}}
  async load() {
    if(!this.playables&&!this.storage)throw Error('storage-unavailable');
    const raw=this.playables?await bounded(this.sdk.game.loadData()):this.storage.getItem('tiny-dispatch-v1');
    this.loaded=true;return raw;
  }
  async save(raw) {
    if(!this.loaded)throw Error('load-required');
    if(this.playables)await this.sdk.game.saveData(raw);
    else {if(!this.storage)throw Error('storage-unavailable');this.storage.setItem('tiny-dispatch-v1',raw);}
  }
}
export function bounded(promise,ms=5000) {
  let timer;
  return Promise.race([promise,new Promise((_,reject)=>{timer=setTimeout(()=>reject(Error('timeout')),ms);})]).finally(()=>clearTimeout(timer));
}
