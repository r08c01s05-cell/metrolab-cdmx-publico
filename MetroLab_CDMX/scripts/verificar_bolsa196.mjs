// Native tool meshes and production pocket picking. CPU only, no renderer.
import './node-textures40.mjs';
import fs from 'node:fs';
import assert from 'node:assert/strict';
import * as T from 'three';
import {PhysicalBag157} from '../dist/physical-bag157.js';
const originalFetch=fetch,originalClock=performance;
globalThis.fetch=async u=>/^(?:\.\/)?models\//.test(String(u))?new Response(fs.readFileSync('dist/'+String(u).replace(/^\.\//,'').split('?')[0])):originalFetch(u);
let now=1000;
Object.defineProperty(globalThis,'performance',{value:{now:()=>now},configurable:true});
const events={},parent={addEventListener(k,f){(events[k]??=[]).push(f);}},canvas={parentElement:parent,style:{},getBoundingClientRect:()=>({left:20,top:30,width:1100,height:700})};
const camera=new T.PerspectiveCamera(65,1100/700,.04,100),scene=new T.Scene();scene.add(camera);camera.position.set(0,1.62,0);camera.lookAt(0,.2,-.7);
const controls={target:new T.Vector3(0,.2,-.7),enabled:true},equipped=[],contacts=[];
const bag=new PhysicalBag157({scene,camera,canvas,controls},{ids:['driver','wrench','brush','meter','red','black'],hand:{hide(){},step(){},engage(hit){contacts.push(hit.target);}},glove:{set(){}},onEquip:id=>equipped.push(id)});
try{
 await bag.park178(new T.Vector3(0,.07,-.7));
 const inverse=bag.model.root.matrixWorld.clone().invert(),bounds=[];
 for(const [id,item]of bag.items){item.updateWorldMatrix(true,true);const b=new T.Box3();item.traverse(o=>{if(o.isMesh&&o.material?.visible!==false){o.geometry.computeBoundingBox();b.union(o.geometry.boundingBox.clone().applyMatrix4(o.matrixWorld).applyMatrix4(inverse));}});assert(item.userData.laidFlat200,'Tool lies on the padded lining: '+id);assert(b.min.y>=-.028&&b.max.y<.07,'Tool stays above lining and below the closed flap: '+id);assert(b.min.x>=-.221&&b.max.x<=.221&&b.min.z>-.12&&b.max.z<.12,'Tool fits inside the bag: '+id);for(const old of bounds)assert(!b.intersectsBox(old),'Tools do not intersect one another');bounds.push(b);}
 let detailedRaycasts=0;
 for(const item of bag.items.values())item.traverse(o=>{if(o.isMesh&&!bag.pickTargets196.includes(o)){const raycast=o.raycast;o.raycast=function(...args){detailedRaycasts++;return raycast.apply(this,args);};}});
 const pointAt=item=>{scene.updateMatrixWorld(true);camera.updateMatrixWorld(true);const p=item.getWorldPosition(new T.Vector3()).project(camera),r=canvas.getBoundingClientRect();return{target:canvas,button:0,clientX:r.left+(p.x+1)*r.width/2,clientY:r.top+(1-p.y)*r.height/2,preventDefault(){},stopImmediatePropagation(){this.consumed=true;}};};
 for(const id of ['driver','wrench','brush','meter','red','black']){
  await bag.open();const opening=now;
  bag.update(now+=181);bag.update(now+=201);
  assert.equal(bag.phase,'searching');assert(now-opening<400,'Inventory is ready within 400 ms of animation time');
  const event=pointAt(bag.items.get(id));
  assert.equal(bag.pick(event)?.id,id,'Native pocket ray selects '+id);
  const count=equipped.length,selectedAt=now;events.pointerdown[0](event);
  assert(event.consumed);assert.equal(bag.phase,'extracting');assert.equal(contacts.at(-1),bag.items.get(id));
  bag.update(now+=261);assert.equal(bag.phase,'rising');assert.equal(equipped.length,count,'No equipment before the extraction gesture finishes');
  bag.update(now+=221);assert.equal(bag.phase,'closed');assert.equal(equipped.at(-1),id);assert(now-selectedAt<500,'Selection equips directly within 500 ms of animation time');
  assert(controls.enabled);assert.equal(equipped.length,count+1,'Exactly one callback per extraction');
 }
 assert.equal(detailedRaycasts,0,'Pointer selection never scans the detailed tool triangles');
 await bag.open();bag.update(now+=181);bag.update(now+=201);bag.take('brush');bag.close();assert.equal(equipped.length,6,'Cancelling extraction never equips or completes work');
 console.log('196 PASS: six native tools picked by pocket volumes without detailed-mesh raycasts, direct extraction under 500 ms, one equip callback, and safe cancellation. Animation time/CPU, not a GPU speed claim.');
}finally{bag.dispose();globalThis.fetch=originalFetch;Object.defineProperty(globalThis,'performance',{value:originalClock,configurable:true});}
