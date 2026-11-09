export class Sound {
  constructor(platform) {this.platform=platform;this.muted=false;this.context=null;this.suspended=false;}
  unlock() {
    if(this.muted||!this.platform.audio||this.suspended)return;
    const Audio=globalThis.AudioContext||globalThis.webkitAudioContext;
    if(!Audio)return;
    this.context??=new Audio();
    if(this.context.state==='suspended')this.context.resume().catch(()=>{});
  }
  sync(muted,paused) {
    this.muted=muted;this.suspended=paused;
    if((muted||paused||!this.platform.audio)&&this.context)this.context.suspend().catch(()=>{});
    // Resumption is only attempted on the next explicit user gesture.
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
