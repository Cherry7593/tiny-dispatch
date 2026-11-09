import Phaser from 'phaser';
import {exits,road,DIRS} from './engine.js';
const C={ground:0xb9cfaf,light:0xc9dbbc,asphalt:0x304c5c,edge:0x8eac98,ivory:0xfff9e9,coral:0xe97c65,teal:0x247f80,ink:0x203c49};
export class Town extends Phaser.Scene {
  constructor(app){super('Town');this.app=app;}
  create() {
    this.base=this.add.graphics();this.ink=this.add.graphics().setDepth(4);this.labels=[];this.vans=[];this.stampAges=[0,0];
    for(let i=0;i<2;i++) {
      const body=this.add.graphics().setDepth(2),label=this.add.text(0,0,i?'B':'A',{fontFamily:'sans-serif',fontSize:'23px',fontStyle:'bold',color:'#203c49'}).setOrigin(.5).setDepth(3);
      this.vans.push({body,label});
    }
    this.app.scene=this;this.paint();this.app.ready();
  }
  paint() {
    const l=this.app.level,g=this.base;this.stampAges=[0,0];g.clear();this.labels.forEach(t=>t.destroy());this.labels=[];
    g.fillStyle(C.ground);g.fillRect(0,0,700,700);
    g.fillStyle(C.light);g.fillRoundedRect(12,12,676,676,28);
    // Authored miniature scenery. A fixed pattern, with no runtime randomness.
    l.rows.forEach((row,y)=>[...row].forEach((c,x)=>{
      if(c==='#')return;
      const cx=50+x*100,cy=50+y*100;
      if((x*3+y*5)%4===0) {
        g.fillStyle(0xa6c598);g.fillEllipse(cx+5,cy+16,36,16);
        g.fillStyle(0x789e7d);g.fillRoundedRect(cx-3,cy+4,6,17,2);
        g.fillStyle(0x87ac83);g.fillCircle(cx,cy,19);g.fillStyle(0x9bbb8e);g.fillCircle(cx-5,cy-6,13);
      } else if((x+y)%5===0){g.lineStyle(3,0xb3cda7);g.strokeCircle(cx,cy,12);g.lineBetween(cx-15,cy+21,cx+15,cy+21);}
      else {g.fillStyle(0xb3cda7);g.fillCircle(cx-8,cy+4,2);g.fillCircle(cx+9,cy-7,2);}
    }));
    for(const [width,color] of [[76,C.edge],[64,C.asphalt]]) {
      g.lineStyle(width,color,1);
      l.rows.forEach((row,y)=>[...row].forEach((c,x)=>{
        if(c!=='#')return;const cx=50+x*100,cy=50+y*100;
        g.fillStyle(color);g.fillCircle(cx,cy,width/2);
        for(const d of exits(l,x,y)) {const [dx,dy]=DIRS[d];g.lineBetween(cx,cy,cx+dx*50,cy+dy*50);}
      }));
    }
    g.lineStyle(3,C.ivory,.4);
    l.rows.forEach((row,y)=>[...row].forEach((c,x)=>{if(c!=='#')return;for(const d of exits(l,x,y).filter(d=>d===1||d===2)){const[dx,dy]=DIRS[d],cx=50+x*100,cy=50+y*100;g.lineBetween(cx+dx*42,cy+dy*42,cx+dx*58,cy+dy*58);}}));
    l.depots.forEach((p,i)=>{
      const x=50+p.x*100,y=50+p.y*100,color=i?C.teal:C.coral;
      g.fillStyle(0x203c49,.17);g.fillRoundedRect(x-31,y-24,66,62,10);
      g.fillStyle(C.ivory);g.fillRoundedRect(x-33,y-32,66,62,8);
      g.fillStyle(color);g.fillRoundedRect(x-29,y-28,58,15,4);
      g.lineStyle(2,C.ink,.4);g.strokeRect(x-24,y-9,17,23);g.lineBetween(x-16,y-9,x-16,y-1);
      this.labels.push(this.add.text(x+12,y+7,i?'B':'A',{fontFamily:'sans-serif',fontSize:'28px',fontStyle:'bold',color:i?'#247f80':'#a74635'}).setOrigin(.5));
    });
    this.draw();
  }
  update(_time,delta) {
    const dt=Math.min(delta,100);this.app.advance(dt);
    for(let i=0;i<2;i++)this.stampAges[i]=this.app.state.vans[i].done?Math.min(400,this.stampAges[i]+dt):0;
    this.draw();
  }
  draw() {
    const a=this.app,g=this.ink;if(!a.state)return;g.clear();
    const phase=a.pending?Math.min(1,a.elapsed/a.beatMs):1;
    const p=a.reduced? (phase<1?0:1) : phase*phase*(3-2*phase);
    const targets=a.pending?.vans??a.state.vans;
    for(let i=0;i<2;i++) {
      const from=a.state.vans[i],to=targets[i],v=this.vans[i];
      const x=Math.max(30,Math.min(670,50+(from.x+(to.x-from.x)*p)*100)),y=Math.max(30,Math.min(670,50+(from.y+(to.y-from.y)*p)*100));
      const b=v.body;b.clear();
      const bob=a.pending&&!a.reduced&&!from.done?Math.sin(phase*Math.PI)*2:0;
      b.setPosition(x,y+bob).setRotation(to.dir*Math.PI/2);
      b.fillStyle(0x172f3b,.22);b.fillRoundedRect(-22,-25,48,60,10);
      b.fillStyle(i?C.teal:C.coral);b.fillRoundedRect(-22,-30,44,58,9);
      b.fillStyle(0xfff9e9,.95);b.fillRoundedRect(-16,-23,32,17,4);
      b.fillStyle(C.asphalt);b.fillRoundedRect(-13,-22,26,9,3);
      b.fillStyle(C.ivory);b.fillRoundedRect(-16,-1,32,22,4);
      b.fillStyle(0xf9e8a1);b.fillRect(-18,-29,7,5);b.fillRect(11,-29,7,5);
      b.fillStyle(0x1e3743);b.fillRect(-25,-16,4,12);b.fillRect(21,-16,4,12);b.fillRect(-25,14,4,10);b.fillRect(21,14,4,10);
      v.label.setPosition(x,y+9+bob);
      if(from.done) {
        b.setAlpha(.5);v.label.setAlpha(.5);
        const settle=a.reduced||a.state.status==='failed'?1:1-Math.pow(1-this.stampAges[i]/400,3);
        g.lineStyle(4,i?C.teal:C.coral);g.strokeCircle(x,y,40+(1-settle)*16);
        g.beginPath();g.moveTo(x+20,y-32);g.lineTo(x+29,y-23);g.lineTo(x+44,y-43);g.strokePath();
      }else {b.setAlpha(1);v.label.setAlpha(1);}
      if(from.wait&&!from.done) {
        g.fillStyle(C.ivory);g.fillCircle(x+29,y-29,14);
        g.lineStyle(3,C.ink);g.lineBetween(x+29,y-37,x+29,y-28);g.lineBetween(x+29,y-28,x+35,y-28);
      }
    }
    if(a.state.failure) {
      const [fx,fy]=a.state.failure.at;
      const x=Math.max(28,Math.min(672,50+fx*100)),y=Math.max(28,Math.min(672,50+fy*100));
      g.lineStyle(5,0xa53f32);g.strokeCircle(x,y,43);g.lineBetween(x-12,y-12,x+12,y+12);g.lineBetween(x+12,y-12,x-12,y+12);
    }
  }
}
// Phaser 3.90 Game.start (MIT) adapted: the app's Platform is the sole clock owner.
// No automatic VisibilityHandler or focus resume, including in Playables builds.
class DispatchGame extends Phaser.Game {
  start() {
    this.isRunning=true;
    this.config.postBoot(this);
    this.loop.start(this.renderer?this.step.bind(this):this.headlessStep.bind(this));
  }
}
export function createGame(app) {
  // Official sample's Phaser.Game bootstrap + scene architecture, adapted for the board.
  return new DispatchGame({type:Phaser.AUTO,width:700,height:700,parent:'canvas',backgroundColor:'#b9cfaf',
    scale:{mode:Phaser.Scale.FIT,autoCenter:Phaser.Scale.CENTER_BOTH},
    audio:{noAudio:true},fps:{smoothStep:false},render:{antialias:true},scene:[new Town(app)],banner:false});
}
