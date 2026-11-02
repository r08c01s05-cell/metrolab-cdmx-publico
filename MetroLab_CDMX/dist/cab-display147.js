import * as THREE from 'three';
const bindings=new WeakMap();
export function updateCabDisplay147(group,train){
 if(!group||!globalThis.document?.createElement)return;let rows=bindings.get(group);
 if(!rows){rows=[];group.traverse(o=>{if(!o.isMesh||o.userData.cabScreen147!=='speed')return;const canvas=document.createElement('canvas');canvas.width=256;canvas.height=160;const ctx=canvas.getContext?.('2d');if(!ctx?.fillText)return;const texture=new THREE.CanvasTexture(canvas);texture.colorSpace=THREE.SRGBColorSpace;texture.minFilter=THREE.LinearFilter;const original=o.material;const material=new THREE.MeshBasicMaterial({map:texture,toneMapped:false});o.material=material;rows.push({o,ctx,canvas,texture,original,material,key:''});});bindings.set(group,rows);}
 const speed=Math.max(0,Math.round(Math.abs(train.speed||0)*3.6)),key=String(speed);
 for(const row of rows){if(row.key===key)continue;row.key=key;const c=row.ctx;c.fillStyle='#112327';c.fillRect(0,0,256,160);c.textAlign='center';c.fillStyle='#90b9b4';c.font='16px sans-serif';c.fillText('VELOCIDAD',128,27);c.fillStyle='#e5edce';c.font='64px monospace';c.fillText(String(speed).padStart(2,'0'),128,97);c.font='18px monospace';c.fillText('km/h',128,128);row.texture.needsUpdate=true;}
}
export function disposeCabDisplay147(group){for(const row of bindings.get(group)||[]){row.o.material=row.original;row.material.dispose();row.texture.dispose();}bindings.delete(group);}
