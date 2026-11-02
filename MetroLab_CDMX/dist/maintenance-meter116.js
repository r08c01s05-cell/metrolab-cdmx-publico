import * as THREE from'three';
// The bench LCD uses the same electrical reading as the mission, not a decoration.
export function updateMeter116(rig,state){
 if(rig.id!=='electrical'||!rig.parts.meter)return;
 if(rig.selector125)rig.selector125.rotation.z=state.meterMode==='Ω'?-.78:.78;
 let display=rig.meter116;
 if(!display){
  const canvas=globalThis.document?.createElement?.('canvas'),ctx=canvas?.getContext?.('2d');if(!ctx?.fillText||!ctx.fillRect)return;
  canvas.width=512;canvas.height=256;const texture=new THREE.CanvasTexture(canvas);texture.colorSpace=THREE.SRGBColorSpace;texture.minFilter=THREE.LinearFilter;texture.generateMipmaps=false;
  const mesh=new THREE.Mesh(new THREE.PlaneGeometry(.318,.152),new THREE.MeshBasicMaterial({map:texture,toneMapped:false}));mesh.name='LCD_multimetro116';mesh.position.set(0,rig.parts.meter.userData.type142?.168:.15,rig.parts.meter.userData.type142?.124:.116);mesh.raycast=()=>{};rig.parts.meter.add(mesh);display=rig.meter116={canvas,ctx,texture,key:null,mesh};
 }
 const reading=state.reading(),key=state.meterMode+':'+reading.value;if(key===display.key)return;display.key=key;
 const c=display.ctx;c.fillStyle='#9bab95';c.fillRect(0,0,512,256);c.fillStyle='#1a2b25';c.font='bold '+(reading.value.length>7?70:88)+'px monospace';c.textAlign='right';c.fillText(reading.value,486,177);c.font='26px monospace';c.textAlign='left';c.fillText(state.meterMode==='Ω'?'CONTINUIDAD / Ω':'V ⎓ / CC',25,44);display.texture.needsUpdate=true;
}
