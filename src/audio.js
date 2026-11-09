export class Sound {
  constructor(platform,onChange=()=>{}) {this.platform=platform;this.onChange=onChange;this.muted=false;this.context=null;this.suspended=false;this.unlocked=false;this.active=platform.audio;}
  get allowed(){return !this.muted&&!this.suspended&&this.platform.audio;}
  get blocked(){return this.allowed&&Boolean(this.context)&&this.context.state!=='running';}
  resume() {
    if(!this.allowed||!this.context)return;
    // Some browsers reject resume, others leave it pending until a gesture.
    // The icon follows the actual state in either case; a click can retry.
    this.context.resume().catch(()=>{}).finally(()=>this.onChange());
    this.onChange();
  }
  unlock() {
    if(!this.allowed)return;
    const Audio=globalThis.AudioContext||globalThis.webkitAudioContext;
    if(!Audio)return;
    if(!this.context||this.context.state==='closed') {
      this.context=new Audio();
      this.context.addEventListener('statechange',()=>{
        if(this.context.state==='running') {
          this.unlocked=true;
          // A pending resume may settle after the platform pauses again.
          if(!this.allowed)this.context.suspend().catch(()=>{});
        }
        this.onChange();
      });
    }
    if(this.context.state==='running')this.unlocked=true;
    else this.resume();
  }
  sync(muted,paused) {
    const wasAllowed=this.active;
    this.muted=muted;this.suspended=paused;this.active=this.allowed;
    if(!this.allowed&&this.context)this.context.suspend().catch(()=>{});
    else if(!wasAllowed&&this.allowed&&this.unlocked)this.resume();
  }
  play(kind) {
    if(this.muted||this.suspended||!this.platform.audio||this.context?.state!=='running')return;
    const patterns={dispatch:[330,440,660],delivery:[523,659,784],failure:[220,165],beat:[240]};
    for(const [i,f] of (patterns[kind]??patterns.beat).entries()) {
      const t=this.context.currentTime+i*.075,o=this.context.createOscillator(),g=this.context.createGain();
      o.type='sine';o.frequency.setValueAtTime(f,t);g.gain.setValueAtTime(0,t);g.gain.linearRampToValueAtTime(.045,t+.008);g.gain.exponentialRampToValueAtTime(.001,t+.13);
      o.connect(g);g.connect(this.context.destination);o.start(t);o.stop(t+.14);
    }
  }
}
