// Screen-space translation keeps camera and target together, without rotating.
export class WorkshopNavigation {
 constructor(controls,canvas,THREE,onMode=()=>{}) {
  this.controls=controls;this.canvas=canvas;this.THREE=THREE;this.onMode=onMode;
  this.pointers=new Map();this.click=null;
  controls.enablePan=true;controls.screenSpacePanning=true;controls.panSpeed=1;
  controls.mouseButtons.MIDDLE=THREE.MOUSE.PAN;
  controls.mouseButtons.RIGHT=THREE.MOUSE.PAN;
  canvas.addEventListener('mousedown',e=>{if(e.button===1)e.preventDefault();});
  canvas.addEventListener('pointerdown',e=>{
   this.click=null;
   if(this.pointers.size)for(const p of this.pointers.values())p.select=false;
   this.pointers.set(e.pointerId,{x:e.clientX,y:e.clientY,select:this.mode==='orbit'&&e.button===0&&!e.ctrlKey&&!e.metaKey&&!e.shiftKey&&this.pointers.size===0});
   canvas.dataset.dragging='true';
  });
  canvas.addEventListener('pointermove',e=>{const p=this.pointers.get(e.pointerId);if(p&&Math.hypot(e.clientX-p.x,e.clientY-p.y)>6)p.select=false;});
  canvas.addEventListener('pointerup',e=>{
   const p=this.pointers.get(e.pointerId);
   this.click=p?.select&&Math.hypot(e.clientX-p.x,e.clientY-p.y)<=6?e.pointerId:null;
   this.pointers.delete(e.pointerId);canvas.dataset.dragging=String(this.pointers.size>0);
  });
  for(const event of ['pointercancel','lostpointercapture'])canvas.addEventListener(event,e=>{this.pointers.delete(e.pointerId);canvas.dataset.dragging=String(this.pointers.size>0);if(event==='pointercancel')this.click=null;});
  this.setMode('orbit');
 }
 setMode(mode) {
  this.mode=mode==='pan'?'pan':'orbit';this.click=null;
  for(const p of this.pointers.values())p.select=false;
  this.controls.mouseButtons.LEFT=this.mode==='pan'?this.THREE.MOUSE.PAN:this.THREE.MOUSE.ROTATE;
  this.controls.touches.ONE=this.mode==='pan'?this.THREE.TOUCH.PAN:this.THREE.TOUCH.ROTATE;
  this.controls.touches.TWO=this.THREE.TOUCH.DOLLY_PAN;
  this.canvas.dataset.navigation=this.mode;this.onMode(this.mode);
 }
 consumeSelection(event) {const allowed=this.click===event.pointerId;this.click=null;return allowed;}
}
