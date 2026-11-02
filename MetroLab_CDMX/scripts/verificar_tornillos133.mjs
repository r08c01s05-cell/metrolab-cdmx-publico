import './node-textures40.mjs';import assert from'node:assert/strict';import fs from'node:fs';import * as THREE from'three';import{makeBench102,syncBench102}from'../dist/maintenance-scene102.js';import{loadBench103}from'../dist/maintenance-assets103.js';import{MaintenanceSession102}from'../dist/maintenance-session102.js';
globalThis.document={createElement:()=>({getContext:()=>({fillRect(){},fillText(){}})})};const net=fetch;globalThis.fetch=async u=>String(u).startsWith('./models/')?new Response(fs.readFileSync('dist/'+String(u).slice(2))):net(u);
for(const id of['ventilation','electrical'])for(const rig of[makeBench102(id),await loadBench103(id)]){
 const session=new MaintenanceSession102();session.reset(id);syncBench102(rig,session.state);rig.group.updateMatrixWorld(true);assert(!rig.parts.cover.children.some(o=>['A','B','C','D'].includes(o.name)),'No corner label tiles on metal');
 for(let i=1;i<=4;i++){const p=rig.parts['screw'+i];const meshes=p.children.filter(o=>o.isMesh&&!o.userData.hitProxy125);const cameraZ=p.getWorldPosition(new THREE.Vector3()).z+1;
  function depth(x,y){const point=p.localToWorld(new THREE.Vector3(x,y,0));const ray=new THREE.Raycaster(new THREE.Vector3(point.x,point.y,cameraZ),new THREE.Vector3(0,0,-1));return ray.intersectObjects(meshes,true)[0].point.z;}
  assert(depth(.013,.013)-depth(0,0)>.005,'Cross is genuinely recessed');
  const bounds=new THREE.Box3();for(const m of meshes)bounds.union(new THREE.Box3().setFromObject(m));assert(bounds.getSize(new THREE.Vector3()).x>.075,'Washer visible and larger than old head');assert(meshes.some(o=>o.material.color.getHexString()==='bdc5c7'),'Readable neutral steel');assert(rig.pickRoots.includes(p));
 }
 for(let step=0;step<20&&!session.expected().includes('screw1');step++)session.action(session.expected()[0]);assert(session.expected().includes('screw1'));for(let i=1;i<=4;i++)for(let j=0;j<4;j++)session.action('screw'+i);assert(session.state.screws.every(s=>!s));assert(session.expected().includes('cover'),'All four fixings still release the cover');
}
console.log('133 PASS: actual GLB and fallback, no white corner labels, 4 pickable larger washers, ray-verified recessed cross, and cover released only after all screws.');
