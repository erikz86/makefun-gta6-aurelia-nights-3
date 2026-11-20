import {SIZE,ROAD,places,district} from './config.js';
const C={ink:'#11151d',road:'#353943',lane:'#d3b77b',side:'#87938e',water:'#164854',sand:'#dca774',house:['#d9685f','#e7bd73','#66a49b','#a983b9','#567da5','#d8d7bf']};
const fmt=n=>'$'+Math.round(n).toLocaleString();
export function renderer(canvas){
 const ctx=canvas.getContext('2d'); let dpr=1;
 function resize(){dpr=devicePixelRatio||1;canvas.width=innerWidth*dpr;canvas.height=innerHeight*dpr;}
 addEventListener('resize',resize);resize();
 function text(t,x,y,size,color='#f5e8cf',weight='600',align='left'){ctx.font=weight+' '+size+'px ui-sans-serif,system-ui';ctx.fillStyle=color;ctx.textAlign=align;ctx.fillText(t,x,y);}
 function bar(x,y,w,h,v,color){ctx.fillStyle='#171c24';ctx.fillRect(x,y,w,h);ctx.fillStyle=color;ctx.fillRect(x,y,w*Math.max(0,Math.min(1,v)),h);}
 function draw(s,mode='game',scene=''){
  const W=innerWidth,H=innerHeight,scale=Math.min(W/1280,H/720),ox=(W-1280*scale)/2,oy=(H-720*scale)/2;
  ctx.setTransform(dpr*scale,0,0,dpr*scale,dpr*ox,dpr*oy);ctx.clearRect(-ox/scale,-oy/scale,W/scale,H/scale);
  const p=s.drive||s.p, tx=Math.max(640,Math.min(SIZE-640,p.x)),ty=Math.max(360,Math.min(SIZE-360,p.y));
  const camX=tx-640,camY=ty-360;
  ctx.save();ctx.translate(-camX,-camY);
  ctx.fillStyle=C.water;ctx.fillRect(0,0,SIZE,SIZE);
  for(let y=0;y<SIZE;y+=320)for(let x=0;x<SIZE;x+=320){
   ctx.fillStyle=(x+y)%640===0?'#c58b68':'#d3a277';ctx.fillRect(x+8,y+8,304,304);
   ctx.fillStyle=C.road;ctx.fillRect(x,y+320-ROAD,320,ROAD);ctx.fillRect(x+320-ROAD,y,ROAD,320);
   ctx.strokeStyle='rgba(232,208,146,.55)';ctx.setLineDash([20,20]);ctx.lineWidth=2;
   ctx.beginPath();ctx.moveTo(x,y+320-ROAD/2);ctx.lineTo(x+320,y+320-ROAD/2);ctx.moveTo(x+320-ROAD/2,y);ctx.lineTo(x+320-ROAD/2,y+320);ctx.stroke();ctx.setLineDash([]);
  }
  for(const b of s.buildings){
   ctx.fillStyle='rgba(19,25,30,.35)';ctx.fillRect(b.x+9,b.y+10,b.w,b.h);
   ctx.fillStyle=C.house[b.style];ctx.fillRect(b.x,b.y,b.w,b.h);
   ctx.fillStyle='#263344';ctx.fillRect(b.x+8,b.y+20,b.w-16,14);
   for(let yy=b.y+49;yy<b.y+b.h-13;yy+=30){ctx.fillStyle=b.style%2?'#f6cf76':'#70b6b0';for(let xx=b.x+12;xx<b.x+b.w-12;xx+=23)ctx.fillRect(xx,yy,10,9);}
   if(b.name){ctx.fillStyle='#f2d77c';ctx.fillRect(b.x-3,b.y+b.h-20,b.w+6,18);text(b.name,b.x+b.w/2,b.y+b.h-7,9,'#33271c','700','center');}
  }
  for(const w of s.walkers)if(w.hp>0){ctx.fillStyle=w.color;ctx.beginPath();ctx.arc(w.x,w.y,7,0,7);ctx.fill();ctx.fillStyle='#20242c';ctx.fillRect(w.x-4,w.y+6,8,11);}
  for(const c of s.cars){ctx.save();ctx.translate(c.x,c.y);ctx.rotate(c.a);ctx.fillStyle='rgba(0,0,0,.28)';ctx.fillRect(-23,-11,50,26);ctx.fillStyle=c.color;ctx.fillRect(-25,-9,50,18);ctx.fillStyle='#b9d2cf';ctx.fillRect(-7,-7,15,14);ctx.fillStyle='#1d222a';ctx.fillRect(-20,-12,9,4);ctx.fillRect(11,-12,9,4);ctx.fillRect(-20,8,9,4);ctx.fillRect(11,8,9,4);ctx.restore();}
  for(const n of [...s.cops,...s.guards])if(n.hp>0){ctx.fillStyle=n.color;ctx.beginPath();ctx.arc(n.x,n.y,10,0,7);ctx.fill();ctx.fillStyle='#20242c';ctx.fillRect(n.x-7,n.y-12,14,5);}
  for(const f of s.fx){ctx.strokeStyle=f.ranged?'#f5e072':'#ff9d6b';ctx.lineWidth=3;ctx.beginPath();ctx.moveTo(f.x,f.y);ctx.lineTo(f.ex,f.ey);ctx.stroke();}
  ctx.save();ctx.translate(s.p.x,s.p.y);ctx.rotate(s.p.a);ctx.fillStyle='#f0dbb4';ctx.beginPath();ctx.arc(0,-10,7,0,7);ctx.fill();ctx.fillStyle='#d94c59';ctx.fillRect(-8,-3,16,21);ctx.fillStyle='#272b34';ctx.fillRect(-7,17,5,10);ctx.fillRect(2,17,5,10);ctx.fillStyle='#1b1e27';ctx.fillRect(7,-2,s.weapon===2?17:8,4);ctx.restore();
  const t=scene?scene.target:null;if(t){ctx.strokeStyle='#f2d268';ctx.lineWidth=5;ctx.beginPath();ctx.arc(t.x,t.y,28+Math.sin(s.time*4)*4,0,7);ctx.stroke();text('◆',t.x,t.y-39,22,'#ffe079','700','center');}
  if(s.weather==='Rain'||s.weather==='Storm'){ctx.strokeStyle=s.weather==='Storm'?'rgba(180,210,230,.7)':'rgba(180,210,230,.34)';ctx.lineWidth=2;for(let i=0;i<170;i++){const xx=(i*97+s.time*220)%SIZE, yy=(i*47+s.time*430)%SIZE;ctx.beginPath();ctx.moveTo(xx,yy);ctx.lineTo(xx-8,yy+23);ctx.stroke();}}
  ctx.restore();
  ctx.fillStyle='rgba(12,16,22,.88)';ctx.fillRect(0,0,1280,74);ctx.fillRect(0,650,1280,70);
  text('AURELIA NIGHTS',30,34,16,'#f0d178','800');text('III',30,57,22,'#fff0c8','800');text(district(p.x,p.y),168,45,16,'#9acfc1','700');text(s.clock.toFixed(2).padStart(5,'0'),1130,32,15,'#e0c998','700');text(s.weather.toUpperCase(),1130,53,12,s.weather==='Storm'?'#b7d9e7':'#b8c7c1','700');
  text('HEALTH',30,95,11,'#a5adaf','700');bar(30,103,170,12,s.p.hp/100,'#d95e68');text(Math.max(0,Math.ceil(s.p.hp))+'%',210,114,12);
  text('CASH',270,95,11,'#a5adaf','700');text(fmt(s.cash),270,118,23,'#f1d279','800');
  text('WANTED',510,95,11,'#a5adaf','700');text('◆'.repeat(s.heat)+'◇'.repeat(3-s.heat),510,119,21,s.heat?'#ef7770':'#85969b','700');
  text('DISTRICT',750,95,11,'#a5adaf','700');text(district(p.x,p.y),750,118,16,'#f1ead5','700');
  ctx.fillStyle='rgba(15,19,25,.88)';ctx.fillRect(24,535,415,100);text('CURRENT JOB',42,558,11,'#e4c56e','800');text(s.title(),42,584,19,'#fff3d2','800');text(s.objective(),42,610,13,'#c2c9c3','500');
  ctx.fillStyle='rgba(15,19,25,.88)';ctx.fillRect(1045,535,211,100);text('MINIMAP',1064,557,11,'#e4c56e','800');ctx.fillStyle='#254c52';ctx.fillRect(1064,568,172,57);for(let i=0;i<12;i++){ctx.fillStyle='#c09f70';ctx.fillRect(1064+(i%4)*43,568+Math.floor(i/4)*19,33,4)}ctx.fillStyle='#f3d46e';ctx.beginPath();ctx.arc(1128+(p.x-960)/25,596+(p.y-960)/25,4,0,7);ctx.fill();
  if(s.drive)text('DRIVE  '+s.speed+' KM/H  |  E exit',640,686,15,'#ffe6ad','700','center');else text('WASD / ARROWS move   E enter / interact   F drive-by aim   SPACE fire   1 melee  2 pistol',640,686,13,'#d1d6cf','500','center');
  if(s.dialogUntil>s.time){ctx.fillStyle='rgba(252,240,206,.95)';ctx.fillRect(326,135,628,57);text(s.dialog,640,170,16,'#22272c','600','center');}
 }
 return {draw};
}

