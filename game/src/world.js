import {CELL,SIZE,ROAD,places,chapters,objectives} from './config.js';
import {rng} from './random.js';
const routes=[['motel','crew'],['crew','vault','vault','safe'],['club','club'],['tower','pier']];
const colors=['#f38174','#f4c765','#45c9b3','#e3ded0','#aa83ba','#618cb8'];
export const distance=(a,b)=>Math.hypot(a.x-b.x,a.y-b.y);
const clamp=(n,a,b)=>Math.max(a,Math.min(n,b));
const car=(x,y,a,color,more={})=>({x,y,a,color,v:0,...more});
export function createWorld(seed, beep){
  const r=rng(seed), buildings=[], blocks=[], cars=[], walkers=[];
  for(let j=0;j<6;j++) for(let i=0;i<6;i++){
    const x=i*CELL+ROAD/2,y=j*CELL+ROAD/2;
    const kind=i===0?'garden':(i+j*3)%7===0?'plaza':'urban';
    blocks.push({x,y,kind,i,j,seed:Math.floor(r()*1e8)});
    if(kind==='urban'){
      for(let b=0;b<2;b++){
        const named=Object.entries(places).find(([,p])=>p.x===i*320 && p.y>=y && p.y<y+230);
        buildings.push({x:x+(b?124:16),y:y+17+r()*12,w:b?82:96,h:166+r()*25,style:Math.floor(r()*6),height:12+r()*18,name:!b&&named?named[1].name.split(' / ').at(-1):'',key:!b?named?.[0]:undefined});
      }
    }
  }
  function traffic(x,y,a,v){cars.push(car(x,y,a,colors[Math.floor(r()*colors.length)],{ai:true,cruise:v}));}
  for(let i=1;i<6;i++){
    for(let j=0;j<5;j++){
      traffic(100+j*354+r()*82,i*CELL+20,0,65+r()*35);
      traffic(i*CELL+20,90+j*353+r()*95,-Math.PI/2,65+r()*28);
    }
  }
  cars.push(car(303,401,-Math.PI/2,'#ef876b'),car(622,435,Math.PI/2,'#f6cb70'),car(940,465,Math.PI/2,'#31c5b0'),car(627,1096,-Math.PI/2,'#bd8bc6'),car(1260,1415,Math.PI/2,'#e8d8bb'));
  for(let i=0;i<50;i++){
    const row=1+Math.floor(r()*5), x=60+r()*1760;
    walkers.push({x,y:row*CELL-40,a:r()<.5?0:Math.PI,v:14+r()*16,color:colors[i%colors.length],hp:1});
  }
  const s={p:{x:317,y:432,a:-Math.PI/2,hp:100},cars,walkers,buildings,blocks, cops:[],guards:[],fx:[],chapter:0,phase:0,crew:[],owned:new Set(),cash:900,heat:0,quiet:0,clock:18.54,time:0,weather:'Clear',weapon:1,dialog:'Mara: “I’m at the Pink Mirage. Come see me.”',dialogUntil:11,bank:0,payout:0,cool:0,unit:0,stage:'',speed:0};
  const say=(dialog)=>{s.dialog=dialog;s.dialogUntil=s.time+7;beep(390,.14,'triangle');};
  const target=()=>places[routes[s.chapter]?.[s.phase]];
  const point=()=>s.drive??s.p;
  const title=()=>chapters[s.chapter]??'The coast is yours';
  const objective=()=>objectives[s.chapter]?.[s.phase]??'Free roam / expand your portfolio';
  s.title=title;
  s.objective=objective;
  function blocked(x,y,radius){
    return x<55+radius||y<radius||x>SIZE-radius||y>SIZE-radius||buildings.some(b=>x+radius>b.x&&x-radius<b.x+b.w&&y+radius>b.y&&y-radius<b.y+b.h);
  }
  function move(o,dx,dy,rad){
    let hit=false;
    if(!blocked(o.x+dx,o.y,rad)) o.x+=dx;else hit=true;
    if(!blocked(o.x,o.y+dy,rad)) o.y+=dy;else hit=true;
    return hit;
  }
  function register(level){s.heat=Math.max(s.heat,level);s.quiet=0;}
  function confrontation(){
    s.guards=[{x:980,y:387,hp:2,color:'#e27a72'},{x:938,y:398,hp:2,color:'#e27a72'},{x:979,y:460,hp:2,color:'#e27a72'}];
  }
  function buy(p){
    if(s.cash<p.price){say('You need $'+p.price.toLocaleString()+' to buy '+p.name+'.');return false;}
    s.cash-=p.price; s.owned.add(p); s.payout=s.time;return true;
  }
  function action(){
    const here=point(), t=target();
    if(t&&distance(t,here)<49){
      if(s.chapter===0){
        if(s.phase===0){s.phase++;say('Mara: “Inez left you a ride at Dune Social. Take the coast road.”');}
        else {s.chapter++;s.phase=0;s.cash+=250;say('Mara: “That car is yours. Ask Inez about the Exchange.”');}
      } else if(s.chapter===1){
        if(s.phase===0){s.crew.push('Inez');s.phase++;say('Inez: “I’m in. I’ll open the vault. Meet me at the Exchange.”');}
        else if(s.phase===1){s.phase++;confrontation();register(2);say('Inez: “Vault’s open. Get the case and head for Dry Dock.”');}
        else if(s.phase===2){
          if(s.drive){say('Get out to take the case.');return;}
          s.phase++;register(3);say('Inez: “Case secured. Lose the patrol before coming back.”');
        } else if(s.heat){say('Inez: “Keep moving. We can’t open the dock with patrols on you.”');}
        else {s.cash+=4800;s.chapter++;s.phase=0;s.guards=[];say('Inez: “Your cut. Buy the Mariposa and we have a front.”');}
      } else if(s.chapter===2){
        if(s.phase===0){if(s.owned.has(t)||buy(t)){s.phase++;say('Purchase recorded. First dividend arrives in 12 seconds.');}}
        else if(s.bank>0){s.cash+=s.bank;s.bank=0;s.chapter++;s.phase=0;say('Mara: “Meet me at Meridian. Tonight we take the whole city off their books.”');}
        else say('The club is still counting tonight’s take.');
      } else if(s.phase===0){s.phase++;s.weather='Storm';register(3);say('Mara: “That ledger is our insurance. Get it to South Pier.”');}
      else {s.chapter++;s.phase=0;s.cash+=10000;s.heat=0;s.cops=[];say('Mara: “It’s done. Aurelia belongs to the night shift now.”');}
      return;
    }
    for(const p of [places.club,places.garage]) if(distance(p,here)<49){
      if(s.owned.has(p)){s.cash+=s.bank;say(s.bank?'Dividend collected: $'+s.bank:'Next dividend is on the way.');s.bank=0;}
      else if(buy(p))say(p.name+' is yours.');
      return;
    }
  }
  function toggleCar(){
    if(s.drive){
      if(Math.abs(s.drive.v)>48){say('Slow down to exit.');return;}
      const c=s.drive;
      for(const side of [1,-1,0]){
        const x=c.x+Math.cos(c.a+Math.PI/2)*30*side,y=c.y+Math.sin(c.a+Math.PI/2)*30*side;
        if(!blocked(x,y,8)){Object.assign(s.p,{x,y,a:c.a});s.drive=null;s.speed=0;say('On foot');return;}
      }
    }else{
      const c=cars.filter(c=>distance(c,s.p)<41).sort((a,b)=>distance(a,s.p)-distance(b,s.p))[0];
      if(c){const stolen=c.ai;c.ai=false;s.drive=c;if(stolen)register(1);say(stolen?'Dispatch: “Vehicle reported stolen.”':'Engine running');}
      else say('No vehicle within reach.');
    }
  }
  function combat(dt, fire, aim){
    const p=s.p;
    if(fire&&!s.drive&&s.cool<=0){
      const ranged=s.weapon===2, len=ranged?300:33, a=aim?Math.atan2(aim.y-p.y,aim.x-p.x):p.a;
      p.a=a;s.cool=ranged?.24:.37;
      const dx=Math.cos(a),dy=Math.sin(a),targets=[...s.guards,...s.cops,...s.walkers];
      let reach=len,victim;
      for(let j=8;j<=len;j+=5){
        const x=p.x+j*dx,y=p.y+j*dy;
        if(blocked(x,y,1)){reach=j;break;}
        victim=targets.find(n=>n.hp>0&&Math.hypot(n.x-x,n.y-y)<(ranged?12:16));
        if(victim){reach=j;break;}
      }
      if(victim){victim.hp--;register(victim.hp===0?2:1);}
      if(ranged)register(1);
      s.fx.push({x:p.x,y:p.y,ex:p.x+dx*reach,ey:p.y+dy*reach,life:ranged?.14:.19,ranged});
      beep(ranged?100:165,ranged?.11:.09,ranged?'sawtooth':'triangle');
    }
    s.fx=s.fx.filter(f=>(f.life-=dt)>0);
  }
  function step(dt, controls){
    s.time+=dt;s.clock=(s.clock+dt*.023)%24;s.cool-=dt;
    if(s.stage!=='storm'&&!(s.chapter===3&&s.phase===1)) s.weather=s.time%150>129?'Storm':s.time%150>103?'Rain':'Clear';
    const {x,y,fast,brake,interact,vehicle,fire,aim}=controls;
    if(interact)action();
    if(vehicle)toggleCar();
    const focus=point();
    if(s.drive){
      const c=s.drive, grip=s.weather==='Clear'?1:.66;
      c.v=clamp((c.v-y*210*dt)*Math.exp(-(brake?5:y?.28:1.1)*dt),-96,310);
      c.a+=x*dt*2.65*grip*Math.min(1,Math.abs(c.v)/53)*Math.sign(c.v);
      const prev={x:c.x,y:c.y}; const hit=move(c,Math.cos(c.a)*c.v*dt,Math.sin(c.a)*c.v*dt,16);
      if(hit||cars.some(n=>n!==c&&distance(n,c)<28)){
        if(!hit)Object.assign(c,prev);
        if(Math.abs(c.v)>30){s.p.hp-=Math.abs(c.v)*.025;beep(61,.11,'square');}
        c.v*=-.29;
      }
      s.speed=Math.round(Math.abs(c.v)*.48);
    }else if(x||y){
      const v=(fast?190:125)*dt/Math.hypot(x,y);s.p.a=Math.atan2(y,x);move(s.p,x*v,y*v,8);
    }
    for(const c of cars)if(c.ai){
      const dx=Math.cos(c.a),dy=Math.sin(c.a), stalled=cars.some(n=>n!==c&&Math.hypot(n.x-c.x-dx*33,n.y-c.y-dy*33)<22);
      c.v=stalled?0:c.cruise;c.x+=dx*c.v*dt;c.y+=dy*c.v*dt;
      if(c.x>SIZE+20)c.x=55;if(c.y< -25)c.y=SIZE;
      if(distance(c,focus)<23 && !s.drive && c.v){s.p.hp-=22*dt;move(s.p,dx*46*dt,dy*46*dt,8);}
    }
    for(const n of walkers)if(n.hp>0){
      n.x+=Math.cos(n.a)*n.v*dt*(s.heat?2:1);if(n.x<65||n.x>SIZE-20){n.x=clamp(n.x,65,SIZE-20);n.a+=Math.PI;}
    }
    if(s.owned.size&&s.time-s.payout>=12){s.payout=s.time;s.bank+=[...s.owned].reduce((v,p)=>v+p.income,0);}
    if(s.heat){
      s.quiet+=dt;s.unit-=dt;
      if(s.unit<=0 && s.cops.filter(n=>n.hp>0).length<s.heat+1){
        s.unit=4;
        const vertical=Math.abs(focus.x-Math.round(focus.x/CELL)*CELL)<60,sign=s.cops.length%2?1:-1;
        const px=vertical?Math.round(focus.x/CELL)*CELL-20:clamp(focus.x+sign*(260+s.heat*20),65,SIZE-20);
        const py=vertical?clamp(focus.y+sign*(270+s.heat*20),15,SIZE-15):Math.round(focus.y/CELL)*CELL-19;
        s.cops.push({x:px,y:py,a:0,hp:3,police:true,color:'#b4d7f4'});
      }
      if(s.quiet>9 && (!s.cops.some(c=>c.hp>0&&distance(c,focus)<180)||s.quiet>23)){s.heat--;s.quiet=0;s.cops=[];if(!s.heat)say('Dispatch lost your trail.');}
    }
    for(const n of [...s.cops,...s.guards])if(n.hp>0){
      const d=distance(n,focus);
      if(d>520)continue;
      n.a=Math.atan2(focus.y-n.y,focus.x-n.x);
      if(d>16){
        const pace=(n.police?99:67)*dt;
        if(move(n,Math.cos(n.a)*pace,Math.sin(n.a)*pace,n.police?11:6)){
          for(const off of [1.57,-1.57])if(!move(n,Math.cos(n.a+off)*pace,Math.sin(n.a+off)*pace,7))break;
        }
      }
      if(d<28)s.p.hp-=(s.drive?3:12)*dt;
    }
    combat(dt,fire,aim);
    if(s.p.hp<=0){
      s.cash=Math.max(0,s.cash-250);Object.assign(s.p,{x:320,y:432,hp:100,a:-Math.PI/2});s.drive=null;s.speed=0;s.cops=[];s.heat=0;say('Back at the Mirage. Clinic fee: $250.');
    }
  }
  return {s,step,target,point,title,objective,confrontation};
}

