export function input(canvas, sound) {
  const held=new Set(), pressed=new Set(), mouse={x:0,y:0,down:false,seen:false};
  const clear=()=>{held.clear();pressed.clear();mouse.down=false;};
  addEventListener('keydown',e=>{
    if(e.target.tagName==='BUTTON' && e.code==='Space') return;
    if(['ArrowUp','ArrowDown','ArrowLeft','ArrowRight','Space','Tab'].includes(e.code) && e.code!=='Tab') e.preventDefault();
    if(!held.has(e.code)) pressed.add(e.code);
    held.add(e.code); sound();
  });
  addEventListener('keyup',e=>held.delete(e.code));
  addEventListener('blur',clear);
  canvas.addEventListener('pointermove',e=>Object.assign(mouse,{x:e.clientX,y:e.clientY,seen:true}));
  canvas.addEventListener('pointerdown',e=>{Object.assign(mouse,{x:e.clientX,y:e.clientY,down:true,seen:true});sound();});
  addEventListener('pointerup',()=>mouse.down=false);
  return {held,mouse,tap:k=>pressed.delete(k),clear};
}

