export const DIRS = [[0,-1],[1,0],[0,1],[-1,0]];
export const MODES = ['S','L','R'];
export const key = (x,y) => `${x},${y}`;
export function road(level,x,y) { return level.rows[y]?.[x] === '#'; }
export function exits(level,x,y) { return DIRS.map((d,i) => road(level,x+d[0],y+d[1]) ? i : -1).filter(i=>i>=0); }
export function junctions(level) {
  const result=[];
  level.rows.forEach((row,y)=>[...row].forEach((c,x)=>{ if(c==='#' && exits(level,x,y).length>=3) result.push(key(x,y)); }));
  return result;
}
export function initialDraft(level) { return { routes: Object.fromEntries(junctions(level).map(k=>[k,'S'])), waits:Object.fromEntries(level.pads.map(k=>[k,false])) }; }
export function initialState(level) {
  return { tick:0, status:'running', vans:level.starts.map((s,i)=>({ ...s, id:i===0?'A':'B', wait:0, done:false })), failure:null };
}
export function step(level,draft,state) {
  if(state.status!=='running') return state;
  const tick=state.tick+1;
  const next=state.vans.map(v=>{
    if(v.done) return {...v};
    if(v.wait) return {...v,wait:v.wait-1};
    const options=exits(level,v.x,v.y).filter(d=>d!==(v.dir+2)%4);
    let dir=v.dir;
    const mode=draft.routes[key(v.x,v.y)];
    if(mode) dir=(v.dir+(mode==='L'?3:mode==='R'?1:0))%4;
    else if(!options.includes(dir) && options.length===1) dir=options[0];
    const [dx,dy]=DIRS[dir];
    const x=v.x+dx,y=v.y+dy;
    return {...v,x,y,dir,wait:draft.waits[key(x,y)]?1:0};
  });
  const fail=(reason,at,van)=>({tick,status:'failed',vans:next,failure:{reason,at,van}});
  // Delivered vans leave the road; two newly arriving vans still collide.
  const active=next.map((v,i)=>!state.vans[i].done);
  if(active[0]&&active[1]) {
    if(next[0].x===next[1].x && next[0].y===next[1].y) return fail('collision',[next[0].x,next[0].y]);
    if(next[0].x===state.vans[1].x && next[0].y===state.vans[1].y && next[1].x===state.vans[0].x && next[1].y===state.vans[0].y) return fail('swap',[(next[0].x+next[1].x)/2,(next[0].y+next[1].y)/2]);
  }
  for(const v of next) {
    if(v.done) continue;
    if(!road(level,v.x,v.y)) return fail('offroad',[v.x,v.y],v.id);
    const depot=level.depots.findIndex(p=>p.x===v.x&&p.y===v.y);
    if(depot>=0) {
      if(depot!==(v.id==='A'?0:1)) return fail('depot',[v.x,v.y],v.id);
      v.done=true; v.wait=0;
    }
  }
  if(next.every(v=>v.done)) return {tick,status:'success',vans:next,failure:null};
  if(tick>=64) return fail('loop',[next.find(v=>!v.done).x,next.find(v=>!v.done).y]);
  return {tick,status:'running',vans:next,failure:null};
}
export function simulate(level,draft) {
  const frames=[initialState(level)];
  while(frames.at(-1).status==='running') frames.push(step(level,draft,frames.at(-1)));
  return { ...frames.at(-1), frames };
}
export function solve(level) {
  const draft=initialDraft(level), js=Object.keys(draft.routes), ps=level.pads;
  let checked=0,solutions=0,first=null,minTicks=Infinity;
  const outcomes={};
  function visit(i) {
    if(i<js.length) { for(const mode of MODES) {draft.routes[js[i]]=mode;visit(i+1);} return; }
    if(i<js.length+ps.length) { const k=ps[i-js.length];for(const on of [false,true]) {draft.waits[k]=on;visit(i+1);} return; }
    checked++;
    const result=simulate(level,draft);
    const code=result.failure?.reason??result.status; outcomes[code]=(outcomes[code]??0)+1;
    if(result.status==='success') {solutions++;if(result.tick<minTicks) {minTicks=result.tick;first=structuredClone(draft);} }
  }
  visit(0);
  return {checked,solutions,minTicks:Number.isFinite(minTicks)?minTicks:null,solution:first,outcomes,junctions:js.length,pads:ps.length};
}
