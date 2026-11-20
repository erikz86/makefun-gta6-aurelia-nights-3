import {createWorld} from './world.js';
import {renderer} from './render.js';
import {input} from './input.js';
import {places} from './config.js';
const q=new URLSearchParams(location.search), shot=q.get('shot'), seed=Number(q.get('seed')||1);
const canvas=document.querySelector('#game'); const audio=()=>{if(!window.__ac)window.__ac=new AudioContext();};
const beep=(f,d,t)=>{try{const a=window.__ac;if(!a)return;const o=a.createOscillator(),g=a.createGain();o.frequency.value=f;o.type=t;o.connect(g);g.connect(a.destination);g.gain.value=.035;o.start();o.stop(a.currentTime+d)}catch{}};
const world=createWorld(seed,beep), view=renderer(canvas);
const setups={start:{x:317,y:432,chapter:0,phase:0,weather:'Clear'},heist:{x:960,y:425,chapter:1,phase:2,weather:'Clear',heat:2,crew:['Inez'],dialog:'Inez: Vault open. Take the case and run!'},empire:{x:640,y:1065,chapter:2,phase:1,weather:'Clear',owned:[places.club],cash:6200,bank:180,dialog:'Mara: Club Mariposa is paying. Build the empire.'},storm:{x:1280,y:1375,chapter:3,phase:1,weather:'Storm',heat:3,dialog:'Mara: Lightning over Meridian. Deliver the ledger to South Pier.'}};
function apply(name){const z=setups[name]||setups.start;Object.assign(world.s,{chapter:z.chapter,phase:z.phase,weather:z.weather,heat:z.heat||0,crew:z.crew||[],cash:z.cash||900,bank:z.bank||0,dialog:z.dialog||world.s.dialog});Object.assign(world.s.p,{x:z.x,y:z.y});world.s.owned=new Set((z.owned||[]).map(k=>typeof k==='string'?places[k]:k));}
if(shot)apply(shot);
const keys=input(canvas,audio), scene=()=>({target:world.target()});let last=performance.now(),ready=false;
function frame(now){const dt=Math.min(.035,(now-last)/1000);last=now;const x=(keys.held.has('ArrowRight')||keys.held.has('KeyD')?1:0)-(keys.held.has('ArrowLeft')||keys.held.has('KeyA')?1:0), y=(keys.held.has('ArrowDown')||keys.held.has('KeyS')?1:0)-(keys.held.has('ArrowUp')||keys.held.has('KeyW')?1:0),e=keys.tap('KeyE');world.step(dt,{x,y,fast:keys.held.has('ShiftLeft'),brake:keys.held.has('Space'),interact:e,vehicle:e,fire:keys.held.has('Space')||keys.mouse.down,aim:keys.mouse.seen?keys.mouse:null});view.draw(world.s,'game',scene());keys.clear();if(shot&&!ready){ready=true;window.__shotReady=true;}requestAnimationFrame(frame);}requestAnimationFrame(frame);

