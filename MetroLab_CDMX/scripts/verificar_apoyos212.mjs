import './node-textures40.mjs';import assert from 'node:assert/strict';import fs from 'node:fs';import {gunzipSync}from'node:zlib';import * as T from'three';
import {GLTFLoader}from'../dist/vendor/GLTFLoader.js';import{batchTrainStatics}from'../dist/metro-render.js';
import{bogieHalf212,carSupportPose212}from'../dist/car-support212.js?v=212';import{configureLayout208}from'../dist/station-layout208.js?v=209';
import{renderCurved97}from'../dist/route-geometry97.js';
configureLayout208({stations:[{id:'L8-18',linea:8},{id:'L8-19',linea:8}],distances:[0,1000]});
const route={pose(x,z){const a=x/90;return{x:90*Math.sin(a)-Math.sin(a)*z,z:90*(1-Math.cos(a))+Math.cos(a)*z,yaw:-a};},map(v){const p=this.pose(v.x,v.z);return new T.Vector3(p.x,v.y,p.z);}};
globalThis.window={metroTiming170:{pendingSeconds:0}};
const inventory=root=>{let vertices=0;const b=new T.Box3();root.updateMatrixWorld(true);root.traverse(o=>{if(!o.isMesh||!o.visible)return;vertices+=o.geometry.index?.count??o.geometry.attributes.position.count;b.union(new T.Box3().setFromObject(o));});return{vertices,b};};
for(const[model,prefix]of[['NM-22','NM22'],['NM-79','NM79'],['MP-82','MP82']]){
 const h=bogieHalf212({model});
 for(const unit of['cabina','intermedio']){
  const bytes=gunzipSync(fs.readFileSync(`dist/models/${prefix}_${unit}.glb.gz`)),asset=(await new GLTFLoader().parseAsync(bytes.buffer.slice(bytes.byteOffset,bytes.byteOffset+bytes.byteLength),'')).scene;
  const wrapper=new T.Group();asset.scale.x=.965;wrapper.add(asset);const before=inventory(wrapper),owned=batchTrainStatics(wrapper,{bogieHalf212:h}),after=inventory(wrapper);
  assert.equal(after.vertices,before.vertices,'Every original triangle retained');assert(after.b.min.distanceTo(before.b.min)<1e-4&&after.b.max.distanceTo(before.b.max)<1e-4,'Original dimensions and assembled geometry retained');
  const bogies=wrapper.children.filter(o=>o.userData.bogie212);assert.equal(bogies.length,2);for(const b of bogies){assert(Math.abs(Math.abs(b.position.x)-h)<1e-8);assert(b.children.some(m=>m.userData.familia_visual==='mecanica'),'Bogie includes mechanical parts');assert(b.children.some(m=>m.userData.familia_visual==='exterior'),'Original running wheels articulate too');assert(b.children.every(m=>m.geometry.attributes.uv&&m.geometry.attributes.normal),'Normals and UVs retained');}
  console.log('212 PASS original geometry/triangles/UV and two articulated bogies:',prefix,unit,'batched meshes',wrapper.userData.renderStats.meshes);
  if(unit==='cabina'){owned.forEach(g=>g.dispose());continue;}
  for(const direction of[-1,1]){
   const train={id:prefix,line:prefix==='NM22'?1:8,model,direction,position:700,speed:0,wait:0},state={running:false,engine:{trains:[train]},selectedTrain:train.id};
   const scene=new T.Scene(),group=new T.Group();scene.add(group);for(let index=0;index<9;index++){const car=wrapper.clone(true);car.userData.carIndex=index;car.position.x=(index-4)*16.7;group.add(car);}
   const camera=new T.PerspectiveCamera();camera.position.set(700,30,50);const sun=new T.Object3D();sun.target=new T.Object3D();const view={alignment97:route,getState:()=>state,trainMeshes:new Map([[train.id,{group}]]),scene,camera,cameraMode:'full',controls:{target:new T.Vector3(700,2,0)},sun};
   view.renderer={render(){scene.updateMatrixWorld(true);for(const car of group.children){const p=carSupportPose212(route,train,car.userData.carIndex);assert(Math.abs(Math.hypot(p.supports[1].x-p.supports[0].x,p.supports[1].z-p.supports[0].z)-2*h)<1e-4,'Rigid pivot spacing');for(const b of car.children.filter(o=>o.userData.bogie212)){const support=p.supports[b.userData.bogie212*direction>0?1:0],point=b.getWorldPosition(new T.Vector3());assert(Math.hypot(point.x-support.x,point.z-support.z)<1e-4,'Both actual bogie pivots lie on their track');const forward=new T.Vector3(1,0,0).applyQuaternion(b.getWorldQuaternion(new T.Quaternion()));assert(Math.abs(Math.atan2(forward.z,forward.x)+support.yaw+(direction<0?-Math.PI:0))<1e-4||Math.abs(Math.abs(Math.atan2(forward.z,forward.x)+support.yaw)-Math.PI)<1e-4,'Each bogie follows its own track tangent');}}}};
   for(let position=630;position<=1370;position+=20){train.position=position;renderCurved97(view);for(const car of group.children)for(const b of car.children.filter(o=>o.userData.bogie212))assert.equal(b.rotation.y,0,'Render restores logical bogie pose');}
  }
  owned.forEach(g=>g.dispose());
 }
}
console.log('212 PASS: 6 actual GLBs; 3 models × 2 directions × 38 transition positions × 9 cars, both supports on track, fixed wheelbase, independent bogie steering, no geometry deformation.');
