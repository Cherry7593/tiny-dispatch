// Boot/scene separation adapted from the official Phaser Playables sample (MIT).
import './style.css';
import {levels} from './levels.js';
import {initialDraft,initialState,step,MODES} from './engine.js';
import {Platform} from './platform.js';
import {SaveStore} from './save.js';
import {Sound} from './audio.js';
import {copy} from './i18n.js';
import {createGame} from './town.js';
const $=id=>document.getElementById(id);
const icons={
 help:'<circle cx="12" cy="12" r="9"/><path d="M9 9a3 3 0 0 1 6 0c0 2-3 2-3 4m0 3v.2"/>',
 sound:'<path d="M4 9h4l5-4v14l-5-4H4ZM17 8c3 2 3 6 0 8m3-11c5 4 5 10 0 14"/>',
 mute:'<path d="M4 9h4l5-4v14l-5-4H4Zm13 0 6 6m0-6-6 6"/>',
 back:'<path d="m15 5-7 7 7 7"/>',forward:'<path d="m9 5 7 7-7 7"/>',close:'<path d="m6 6 12 12M18 6 6 18"/>',
 S:'<path d="M12 21V3m-6 6 6-6 6 6"/>',L:'<path d="M16 21V12a5 5 0 0 0-5-5H4m6-5L4 7l6 5"/>',R:'<path d="M8 21V12a5 5 0 0 1 5-5h7m-6-5 6 5-6 5"/>',wait:'<path d="M8 5v14m8-14v14"/>',play:'<path d="m8 4 12 8-12 8Z"/>',undo:'<path d="M8 5 3 10l5 5m-5-5h11a6 6 0 0 1 0 12"/>',reset:'<path d="M4 4v6h6M4 10a8 8 0 1 1-1 6"/>'
};
const svg=(name)=>`<svg viewBox="0 0 24 24" aria-hidden="true">${icons[name]??icons.help}</svg>`;
function iconButton(id,icon,label){$(id).innerHTML=svg(icon);$(id).setAttribute('aria-label',label);$(id).title=label;}
let storage;try{storage=window.localStorage;}catch{/* The save layer reports blocked storage. */}
const platform=new Platform({sdk:window.ytgame,storage,document});
let lang='zh';
const store=new SaveStore(platform,()=>renderSave());
const sound=new Sound(platform,()=>render());
const app={
 level:levels[0],draft:initialDraft(levels[0]),state:initialState(levels[0]),pending:null,elapsed:0,
 beatMs:import.meta.env.DEV?Number(import.meta.env.VITE_BEAT_MS)||650:650,
 ownPause:false,history:[],hint:false,scene:null,game:null,
 reduced:matchMedia('(prefers-reduced-motion: reduce)').matches,
 ready(){
   $('loading').remove();$('app').hidden=false;render();
   requestAnimationFrame(()=>{platform.gameReady();syncPause();});
 },
 advance(delta){
   if(this.ownPause||platform.paused||!this.pending)return;
   this.elapsed+=delta;
   if(this.elapsed<this.beatMs)return;
   const before=this.state;this.state=this.pending;this.elapsed=0;this.pending=null;
   if(this.state.status==='success'){
     persist({completed:[this.level.id],last:this.level.id});sound.play('delivery');
   }else if(this.state.status==='failed')sound.play('failure');
   else {
     if(this.state.vans.some((v,i)=>v.done&&!before.vans[i].done))sound.play('delivery');
     this.pending=step(this.level,this.draft,this.state);
   }
   render();
 }
};
const compactLayout=matchMedia('(max-height:500px) and (min-width:501px)');
const t=()=>compactLayout.matches?{...copy[lang],...copy[lang].compact}:copy[lang];
const localized=arr=>arr[lang==='zh'?0:1];
function unlocked(id){return id===1||store.data.completed.includes(id)||store.data.completed.includes(id-1);}
function persist(patch){store.update(patch);store.save();}
function loadLevel(id,remember=true){
 app.level=levels[id-1];app.draft=structuredClone(store.data.drafts[id]??initialDraft(app.level));
 app.state=initialState(app.level);app.state.status='planning';app.pending=null;app.elapsed=0;app.ownPause=false;app.history=[];app.hint=false;
 buildSigns();app.scene?.paint();render();syncPause();if(remember)persist({last:id});
}
function plan(){app.pending=null;app.state=initialState(app.level);app.state.status='planning';app.elapsed=0;app.ownPause=false;syncPause();}
function dispatch(){plan();persist({last:app.level.id});sound.unlock();sound.play('dispatch');app.state.status='running';app.pending=step(app.level,app.draft,app.state);render();}
function editable(){return !platform.paused&&!app.ownPause&&!app.pending&&app.state.status!=='running';}
function editDraft(kind,k,value){
 if(!editable())return;
 if(app.state.status!=='planning')plan();
 app.history.push(structuredClone(app.draft));app.draft[kind][k]=value;
 render();persist({last:app.level.id,drafts:{[app.level.id]:{[kind]:{[k]:value}}}});
}
function buildSigns(){
 const layer=$('signs');layer.replaceChildren();
 for(const [kind,entries] of [['routes',Object.keys(app.draft.routes)],['waits',app.level.pads]])for(const k of entries){
  const [x,y]=k.split(',').map(Number),b=document.createElement('button');
  b.className=kind==='routes'?'sign junction':'sign pad';b.dataset.kind=kind;b.dataset.cell=k;
  b.style.left=`${(x+.5)/7*100}%`;b.style.top=`${(y+.5)/7*100}%`;
  b.addEventListener('click',()=>editDraft(kind,k,kind==='routes'?MODES[(MODES.indexOf(app.draft.routes[k])+1)%3]:!app.draft.waits[k]));
  b.addEventListener('keydown',e=>{if(kind!=='routes')return;const mode={ArrowUp:'S',ArrowLeft:'L',ArrowRight:'R'}[e.key];if(mode){e.preventDefault();editDraft(kind,k,mode);}});
  layer.append(b);
 }
}
function renderSigns(){
 for(const b of $('signs').children){
  const k=b.dataset.cell,kind=b.dataset.kind,[x,y]=k.split(',').map(Number),value=app.draft[kind][k];
  b.innerHTML=svg(kind==='routes'?value:'wait')+(kind==='waits'?'<span>1</span>':'');
  b.classList.toggle('enabled',kind==='waits'&&value);
  const label=`${kind==='routes'?t().junction:t().wait} ${x+1},${y+1}: ${kind==='routes'?t()[value]:value?t().on:t().off}`;
  b.setAttribute('aria-label',label);b.title=label;b.disabled=!editable();
  if(kind==='waits')b.setAttribute('aria-pressed',String(value));
 }
}
function renderSave(){
 const c=t(),messages={loading:c.saving,ok:c.saved,corrupt:c.corrupt,incompatible:c.incompatible,'load-failed':c.loadFail,'save-failed':c.saveFail};
 $('save-status').textContent=messages[store.status]??c.saved;
 const failed=store.status==='load-failed'||store.status==='save-failed';
 $('save-retry').hidden=!failed;$('save-retry').textContent=store.status==='load-failed'?c.loadRetry:c.saveRetry;
 $('save-status').classList.toggle('save-error',failed||store.status==='incompatible');
}
function render(){
 const c=t(),s=app.state,paused=app.ownPause||platform.paused;
 document.documentElement.lang=lang==='zh'?'zh-CN':'en';document.documentElement.dataset.status=s.status;document.title=`${c.title} · ${app.level.id}/12`;
 $('title').textContent=c.title;$('language').textContent=c.language;
 $('progress').textContent=`${store.data.completed.length} / 12`;$('level-select').setAttribute('aria-label',`${c.levels} · ${store.data.completed.length} / 12 ${c.progress}`);
 const quiet=sound.muted||!platform.audio||sound.blocked;
 iconButton('sound',quiet?'mute':'sound',sound.blocked?c.audioRetry:quiet?c.mute:c.sound);
 $('sound').setAttribute('aria-pressed',String(quiet));
 iconButton('help','help',c.help);iconButton('back','back',c.back);iconButton('forward','forward',c.forward);
 $('back').disabled=app.level.id===1||paused||Boolean(app.pending);$('forward').disabled=app.level.id===12||!unlocked(app.level.id+1)||paused||Boolean(app.pending);
 $('level-number').textContent=`${String(app.level.id).padStart(2,'0')} / 12`;
 $('level-name').textContent=localized(app.level.name);$('instruction').textContent=localized(app.level.tip);
 $('beat-label').textContent=c.beat;$('beat-number').textContent=String(s.tick).padStart(2,'0');
 document.querySelectorAll('.beat-dots i').forEach((d,i)=>d.classList.toggle('current',i===s.tick%4));
 for(let i=0;i<2;i++)$('van-'+(i?'b':'a')).textContent=`${i?'B':'A'} · ${s.vans[i].done?c.delivered:s.status==='failed'?c.stopped:paused?c.paused:s.vans[i].wait?c.waitCount:s.status==='running'?c.running:c.planning}`;
 const final=s.status==='success'&&app.level.id===12;
 $('feedback').className='feedback '+s.status;
 $('feedback-title').textContent=s.status==='failed'?`${lang==='zh'?'第':'Beat '}${s.tick}${lang==='zh'?' 拍 · 配送暂停':''}`:s.status==='success'?(final?c.complete:c.success):paused?c.paused:s.status==='running'?c.running:c.subtitle;
 $('feedback-body').textContent=s.failure?`${c.failure[s.failure.reason]} ${c.at} ${s.failure.at.map(v=>v+1).join(', ')}${s.failure.van?' · '+s.failure.van:''}`:final?c.completeSub:s.status==='planning'?c.newPlan:'';
 $('start').innerHTML=svg(s.status==='success'?'forward':'play')+`<span>${s.status==='failed'?c.replan:s.status==='success'?(final?c.replay:c.next):c.dispatch}</span>`;
 $('start').disabled=paused||Boolean(app.pending)||s.status==='running';
 $('pause').textContent=app.ownPause?c.resume:c.pause;$('pause').disabled=platform.paused||(!app.ownPause&&!app.pending);
 $('retry').textContent=c.retry;$('retry').disabled=paused||!['failed','success'].includes(s.status);
 for(const [id,label] of [['undo',c.undo],['reset',c.reset],['hint',app.hint?c.hideHint:c.hint]]){$(id).textContent=label;$(id).disabled=!editable()||(id==='undo'&&!app.history.length);}
 $('route-tip').textContent=c.routeTip;
 $('hint-panel').hidden=!app.hint;
 if(app.hint){
  const solution=app.level.solution;
  const choices=[...Object.entries(solution.routes).map(([k,v])=>`${k.split(',').map(n=>Number(n)+1).join(',')}: ${c[v]}`),...Object.entries(solution.waits).map(([k,v])=>`${c.wait} ${k.split(',').map(n=>Number(n)+1).join(',')}: ${v?c.on:c.off}`)];
  const close=document.createElement('button');close.className='icon-button hint-close';close.setAttribute('aria-label',c.hideHint);close.innerHTML=svg('close');
  close.onclick=()=>{app.hint=false;render();$('hint').focus();};
  const text=document.createElement('p');text.textContent=localized(app.level.hint)+' '+c.hintIntro+' '+choices.join(' · ');
  $('hint-panel').replaceChildren(close,text);
 }
 $('pause-cover').hidden=!paused;$('pause-title').textContent=platform.paused?c.platformPaused:c.paused;$('pause-sub').textContent=platform.paused?c.platformResume:c.pauseSub;
 $('signs').inert=paused;$('app').inert=platform.paused;
 iconButton('close-help','close',c.close);iconButton('close-levels','close',c.close);$('help-title').textContent=c.helpTitle;$('levels-title').textContent=c.levels;
 $('rules').replaceChildren(...c.rules.map(rule=>{const li=document.createElement('li');li.textContent=rule;return li;}));
 renderSigns();renderSave();
}
function syncPause(){
 const paused=platform.paused||app.ownPause;
 sound.sync(sound.muted,paused);
 if(app.game){if(paused)app.game.loop.sleep();else if(!app.game.loop.running){app.game.loop.resetDelta();app.game.loop.wake();}}
 render();
}
platform.subscribe(syncPause);
$('start').onclick=()=>{
 if(platform.paused||app.ownPause)return;
 if(app.state.status==='failed'){plan();render();}
 else if(app.state.status==='success')loadLevel(app.level.id===12?1:app.level.id+1);
 else dispatch();
};
$('retry').onclick=dispatch;
$('pause').onclick=()=>{if(platform.paused)return;app.ownPause=!app.ownPause;syncPause();if(!app.ownPause)sound.unlock();};
$('undo').onclick=()=>{
 if(!editable()||!app.history.length)return;
 const before=app.draft,changes={routes:{},waits:{}};
 plan();app.draft=app.history.pop();
 for(const kind of ['routes','waits'])for(const [k,value] of Object.entries(app.draft[kind]))if(before[kind][k]!==value)changes[kind][k]=value;
 render();persist({last:app.level.id,drafts:{[app.level.id]:changes}});
};
$('reset').onclick=()=>{if(!editable())return;app.history.push(structuredClone(app.draft));plan();app.draft=initialDraft(app.level);render();persist({last:app.level.id,drafts:{[app.level.id]:app.draft}});};
$('hint').onclick=()=>{app.hint=!app.hint;render();};
$('language').onclick=()=>{lang=lang==='zh'?'en':'zh';render();persist({language:lang});};
$('sound').onclick=()=>{if(sound.blocked){sound.unlock();return;}sound.muted=!sound.muted;syncPause();if(!sound.muted)sound.unlock();persist({muted:sound.muted});};
$('back').onclick=()=>loadLevel(app.level.id-1);$('forward').onclick=()=>loadLevel(app.level.id+1);
function showDialog(id){if(app.pending){app.ownPause=true;syncPause();}$(id).showModal();}
$('help').onclick=()=>showDialog('help-dialog');$('close-help').onclick=()=>$('help-dialog').close();
$('level-select').onclick=()=>{
 const c=t();$('level-grid').replaceChildren(...levels.map(l=>{
  const b=document.createElement('button'),done=store.data.completed.includes(l.id);
  b.dataset.level=String(l.id);b.disabled=!unlocked(l.id);b.className=done?'level-tile complete':l.id===app.level.id?'level-tile selected':'level-tile';
  const num=document.createElement('strong'),name=document.createElement('span'),status=document.createElement('small');
  num.textContent=String(l.id).padStart(2,'0');name.textContent=localized(l.name);status.textContent=done?c.done:b.disabled?c.locked:c.available;
  b.append(num,name,status);b.onclick=()=>{$('levels-dialog').close();loadLevel(l.id);};return b;
 }));showDialog('levels-dialog');
};
$('close-levels').onclick=()=>$('levels-dialog').close();
$('save-retry').onclick=async()=>{
 if(store.status==='load-failed'){
  const data=await store.load();
  if(!store.writable)return;
  if(!platform.playables)lang=data.language;
  sound.muted=data.muted;loadLevel(data.last,false);
 }
 await store.save();
};
compactLayout.addEventListener('change',()=>render());
matchMedia('(prefers-reduced-motion: reduce)').addEventListener('change',e=>{app.reduced=e.matches;});
if(import.meta.env.DEV)window.__dispatch={read:()=>structuredClone({level:app.level.id,draft:app.draft,state:app.state,paused:app.ownPause||platform.paused,platformPaused:platform.paused,completed:store.data.completed,saveStatus:store.status,platform:platform.playables,pending:Boolean(app.pending)})};
// Loading text is already painted in HTML. Notify on that real display, before asynchronous save loading.
async function boot(){
 await new Promise(resolve=>requestAnimationFrame(resolve));platform.firstFrameReady();
 const [data,locale]=await Promise.all([store.load(),platform.language()]);
 lang=platform.playables?locale:data.language;sound.muted=data.muted;
 loadLevel(data.last,false);app.game=createGame(app);
}
boot();
