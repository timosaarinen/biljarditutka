'use strict';
// Exercise the EXACT inline kernel shipped in index.html, not a duplicate test model.
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const path = require('node:path');
const html = fs.readFileSync(path.join(__dirname, 'index.html'), 'utf8');
const source = html.match(/<script id="pool-physics">([\s\S]*?)<\/script>/);
assert.ok(source, 'The self-contained physics kernel must be present');
vm.runInThisContext(source[1]);
const P = globalThis.BiljarditutkaPhysics;
const close = (a,b,tolerance=1e-9) => assert.ok(Math.abs(a-b)<=tolerance, `${a} != ${b} (tol ${tolerance})`);
const speed = b => Math.hypot(b.vx,b.vy);
const momentum = balls => balls.reduce((p,b)=>[p[0]+b.mass*b.vx,p[1]+b.mass*b.vy],[0,0]);
const totalEnergy = balls => balls.reduce((sum,b)=>sum+P.energy(b),0);
const free = (balls,config={}) => ({...P.world(balls,config),rails:[],pockets:[]});
function advance(state,seconds){const steps=Math.round(seconds/state.config.dt);for(let i=0;i<steps;i++)P.step(state);return state;}
const r = P.DEFAULTS.radius;

test('elastic equal-mass head-on contact transfers velocity, not a keyframe speed',()=>{
  const a=P.ball('cue',0,0,{vx:1.5}),b=P.ball('8',2*r,0);
  const e=P.collide(a,b,1);assert.ok(e);close(a.vx,0);close(b.vx,1.5);close(a.vy,0);close(b.vy,0);
  close(e.energyBefore,e.energyAfter);
});
test('inelastic equal-mass contact conserves momentum and loses, never creates, energy',()=>{
  const a=P.ball('cue',0,0,{vx:2}),b=P.ball('8',2*r,0),before=momentum([a,b]);
  const e=P.collide(a,b,.96);close(a.vx,.04);close(b.vx,1.96);
  momentum([a,b]).forEach((v,i)=>close(v,before[i]));assert.ok(e.energyAfter<e.energyBefore);
});
test('a cut transfers only normal momentum; elastic outgoing directions are perpendicular',()=>{
  const n=[Math.cos(.5),Math.sin(.5)],a=P.ball('cue',0,0,{vx:1.3}),b=P.ball('8',2*r*n[0],2*r*n[1]);
  const before=momentum([a,b]);const e=P.collide(a,b,1);
  close(b.vx,1.3*n[0]*n[0]);close(b.vy,1.3*n[0]*n[1]);close(a.vx*b.vx+a.vy*b.vy,0);
  close(e.energyBefore,e.energyAfter);momentum([a,b]).forEach((v,i)=>close(v,before[i]));
});
test('two moving balls with different masses conserve elastic energy and vector momentum',()=>{
  const a=P.ball('a',0,0,{vx:2,vy:.3,mass:.2}),b=P.ball('b',2*r,0,{vx:-.5,vy:-.2,mass:.16});
  const before=momentum([a,b]),e=P.collide(a,b,1);
  close(e.energyBefore,e.energyAfter);momentum([a,b]).forEach((v,i)=>close(v,before[i]));
});
test('separating contacts do not get a second impulse',()=>{
  const a=P.ball('a',0,0,{vx:-1}),b=P.ball('b',2*r,0,{vx:1});
  assert.equal(P.collide(a,b,1),null);close(a.vx,-1);close(b.vx,1);
});
test('central frictionless impacts retain the pre-impact angular velocities',()=>{
  const a=P.ball('a',0,0,{vx:1,sx:.7,sy:-.3}),b=P.ball('b',2*r,0,{sx:-.1,sy:.2});
  P.collide(a,b,.96);assert.deepEqual([a.sx,a.sy,b.sx,b.sy],[.7,-.3,-.1,.2]);
});
test('rolling speed and distance follow constant cloth resistance in SI units',()=>{
  const state=free([P.ball('a',0,0,{vx:.6,sx:.6})]);advance(state,1);
  const a=state.config.rolling*state.config.gravity,b=state.balls[0];
  close(b.vx,.6-a);close(b.x,.6-.5*a);close(b.sx,b.vx);close(b.y,0);
});
test('rolling terminates at rest without creeping backwards or overshooting its stop',()=>{
  const state=free([P.ball('a',0,0,{vx:.2,sx:.2})]);advance(state,4);
  const b=state.balls[0],expected=.2*.2/(2*state.config.rolling*state.config.gravity);
  close(b.x,expected,1e-6);close(b.vx,0);close(b.sx,0);const x=b.x;advance(state,1);close(b.x,x);
});
test('a spinless sliding sphere rolls at 5/7 of its starting speed when rolling drag is zero',()=>{
  const b=P.ball('a',0,0,{vx:1});const c={...P.DEFAULTS,rolling:0};const before=P.energy(b);
  P.cloth(b,1,c);close(b.vx,5/7);close(b.sx,5/7);assert.ok(P.energy(b)<before);
});
test('topspin can create cue-ball follow through cloth torque without adding total energy',()=>{
  const b=P.ball('a',0,0,{sx:1}),before=P.energy(b);
  P.cloth(b,.1,P.DEFAULTS);assert.ok(b.vx>0);assert.ok(b.sx<1);assert.ok(P.energy(b)<before);
});
test('backspin produces draw rather than a scripted freeze',()=>{
  const b=P.ball('a',0,0,{sx:-1}),before=P.energy(b);
  P.cloth(b,.1,P.DEFAULTS);assert.ok(b.vx<0);assert.ok(P.energy(b)<before);
});
test('swept time-of-impact prevents a fast ball from tunnelling through another',()=>{
  const state=free([P.ball('a',.2,.5,{vx:100}),P.ball('b',.75,.5)],{sliding:0,rolling:0,restitution:1});
  P.step(state,1/60);assert.equal(state.events.length,1);
  close(state.events[0].time,(.55-2*r)/100);close(state.events[0].distance,2*r);
  close(state.balls[0].vx,0);close(state.balls[1].vx,100);
});
test('flat cushions reflect only the inward normal velocity with restitution',()=>{
  const state=P.world([P.ball('a',.35,.04,{vx:.2,vy:-.5})],{sliding:0,rolling:0});
  P.step(state,1/30);const e=state.events.find(e=>e.type==='rail');assert.ok(e);
  close(e.after[0],.2);close(e.after[1],.5*state.config.cushion);
  assert.ok(state.balls[0].y>=r-1e-9);
});
test('cushion jaw endpoints are physical contacts, not a full invisible rail across a pocket',()=>{
  const state=P.world([P.ball('a',.945,.12,{vy:-1})],{sliding:0,rolling:0});
  advance(state,.2);const e=state.events.find(e=>e.type==='rail');assert.ok(e);
  assert.ok(Math.abs(e.nx)>.1 && Math.abs(e.ny)>.1);
});
for(const [index,x,y] of [[0,.25,.25],[1,1,.25],[2,1.75,.25],[3,.25,.75],[4,1,.75],[5,1.75,.75]]){
  test(`pocket ${index}: its actual mouth admits the ball without an invisible cushion`,()=>{
    const state=P.world([P.ball('a',x,y)],{sliding:0,rolling:0});
    const [px,py]=state.pockets[index],length=Math.hypot(px-x,py-y);
    state.balls[0].vx=(px-x)/length;state.balls[0].vy=(py-y)/length;
    advance(state,1);assert.equal(state.balls[0].pocketIndex,index);
    assert.equal(state.events.filter(e=>e.type==='rail').length,0);
  });
}
test('nearby pockets exert no magnet force or automatic pot',()=>{
  const state=P.world([P.ball('a',1,.09,{vx:.1})],{sliding:0,rolling:0});advance(state,.5);
  close(state.balls[0].x,1.05);close(state.balls[0].y,.09);assert.equal(state.events.length,0);
});
const demo=P.replay();
test('the authored layout produces actual contact, a pot, and a safe cue-ball cushion rebound',()=>{
  assert.ok(demo.settled);assert.equal(demo.events.filter(e=>e.type==='ball').length,1);
  const pots=demo.events.filter(e=>e.type==='pocket');assert.equal(pots.length,1);assert.equal(pots[0].a,'8');
  assert.ok(demo.events.some(e=>e.type==='rail'&&e.a==='cue'));
  for(const b of demo.frames.at(-1).balls)close(speed(b),0);
});
test('the eight never launches faster than the incident cue ball',()=>{
  const e=demo.events.find(e=>e.type==='ball');const eight=e.a==='8'?0:2,cue=e.a==='cue'?0:2;
  const cueIn=Math.hypot(e.before[cue],e.before[cue+1]);
  const eightOut=Math.hypot(e.after[eight],e.after[eight+1]);
  assert.ok(cueIn>.9,'The cue must still be moving at impact');assert.ok(eightOut>0 && eightOut<=cueIn);
  close(e.distance,2*r);assert.ok(e.energyAfter<=e.energyBefore);
});
test('total translational plus rotational energy never increases in the replay',()=>{
  let previous=Infinity;
  for(const f of demo.frames){const energy=totalEnergy(f.balls);assert.ok(energy<=previous+1e-10);previous=energy;}
});
test('sampling around contact does not anticipate the eight-ball motion or ease the cue to rest',()=>{
  const e=demo.events.find(e=>e.type==='ball'),delta=1e-7;
  const before=P.sample(demo,e.time-delta),after=P.sample(demo,e.time+delta);
  const get=(s,id)=>s.balls.find(b=>b.id===id);
  close(get(before,'8').vx,0);close(get(before,'8').x,P.defaultBalls().find(b=>b.id==='8').x,1e-9);
  assert.ok(speed(get(after,'8'))>.8);assert.ok(speed(get(before,'cue'))>.9);
  close(get(after,'8').vx,e.after[e.a==='8'?0:2]);
});
test('pocket state switches at geometric capture, not at a progress percentage',()=>{
  const e=demo.events.find(e=>e.type==='pocket'),id=e.a;
  assert.equal(P.sample(demo,e.time-1e-7).balls.find(b=>b.id===id).pocketedAt,null);
  close(P.sample(demo,e.time+1e-7).balls.find(b=>b.id===id).pocketedAt,e.time);
});
test('all visible balls are dynamic bodies with finite states and unit paint normals',()=>{
  assert.equal(demo.frames[0].balls.length,7);
  for(const frame of demo.frames){for(const b of frame.balls){
    for(const key of ['x','y','vx','vy','sx','sy'])assert.ok(Number.isFinite(b[key]));
    close(Math.hypot(...b.mark),1,1e-9);
  }}
});
test('cloth/collision splitting converges when the fixed timestep is halved',()=>{
  const finer=P.replay(P.defaultBalls(),{dt:1/480});
  const a=demo.events.find(e=>e.type==='ball'),b=finer.events.find(e=>e.type==='ball');
  close(a.time,b.time,2e-5);
  demo.frames.at(-1).balls.forEach((ball,i)=>{
    const other=finer.frames.at(-1).balls[i];close(ball.x,other.x,.001);close(ball.y,other.y,.001);
  });
});
test('restarting produces exactly the same physics and event history',()=>{
  const again=P.replay();assert.deepEqual(again.events,demo.events);assert.deepEqual(again.frames,demo.frames);
});
test('30/60/90/120 Hz rendering and backwards scrubbing cannot change a physical state',()=>{
  const times=[0,.5,1,1.5,2],reference=times.map(t=>P.sample(demo,t));
  for(const hz of [30,60,90,120]){
    const captured=[];
    for(let frame=0;frame<=hz*2;frame++){
      const state=P.sample(demo,frame/hz);
      if(frame%(hz/2)===0)captured.push(state);
    }
    assert.deepEqual(captured,reference);
    P.sample(demo,0);assert.deepEqual(P.sample(demo,2),reference.at(-1));
  }
  // Sampling is pure: it must not mutate any stored frames or their paint normals.
  const frame=JSON.stringify(demo.frames[100]);P.sample(demo,demo.frames[100].time+.001);
  assert.equal(JSON.stringify(demo.frames[100]),frame);
});
test('a weaker shot is allowed to fail: no programmed destination or pot event',()=>{
  const weak=P.replay(P.defaultBalls(.4));assert.ok(weak.settled);
  assert.ok(!weak.events.some(e=>e.type==='pocket'&&e.a==='8'));
  assert.ok(weak.frames.at(-1).balls.find(b=>b.id==='8').x<1.8);
});
test('changing the initial aim changes the physical outcome',()=>{
  const balls=P.defaultBalls(),cue=balls.find(b=>b.id==='cue'),angle=.06;
  const vx=cue.vx*Math.cos(angle)-cue.vy*Math.sin(angle),vy=cue.vx*Math.sin(angle)+cue.vy*Math.cos(angle);
  Object.assign(cue,{vx,vy,sx:vx,sy:vy});const miss=P.replay(balls);
  assert.ok(!miss.events.some(e=>e.type==='pocket'&&e.a==='8'));
});
test('the final hold starts only after physical rest and preserves the stopped state',()=>{
  const end=P.sample(demo,demo.duration),prior=P.sample(demo,demo.duration-.4);
  assert.deepEqual(end.balls,prior.balls);
});
test('the page has no old independent easing curves or hard-coded impact/pot phases',()=>{
  assert.ok(!html.includes('const cueT=ease'));assert.ok(!html.includes('progress<.42'));
  assert.ok(html.includes('id="slow"'));assert.ok(html.includes('rigid-sphere-v1'));
});
