import './node-textures40.mjs';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import * as T from 'three';
import {createEnergyModel160} from '../dist/energy-section160.js';
import {detailedEnergy162} from '../dist/energy-assets162.js';
const native=fetch;
globalThis.fetch=async(url,...args)=>{const name='dist/'+String(url).split('?')[0].replace(/^\.\//,'');return fs.existsSync(name)?new Response(fs.readFileSync(name)):native(url,...args);};
globalThis.document={createElement:()=>({getContext:()=>new Proxy({createImageData:(w,h)=>({data:new Uint8ClampedArray(w*h*4)})},{get:(o,k)=>o[k]||(()=>{})})})};
for(const id of ['NM22','NM79','MP82'])for(const type of ['pneumatic','overhead']){
 const model=createEnergyModel160(type);await detailedEnergy162(model,type,id);
 assert(model.root.userData.actualMeshes162>0,'Restored viewer uses real train triangles');
 assert(model.root.userData.actualTrackMeshes162>0,'Existing detailed track is present');
 const source=[];model.root.traverse(o=>{if(o.isMesh&&o.userData.actualAsset162)source.push(o);});
 assert(source.some(o=>o.parent===model.groups.get('body')),'Actual car body retained');
 if(type==='pneumatic')assert(source.some(o=>o.parent===model.groups.get('bogie')),'Actual bogie retained');
 const matrices=source.map(o=>o.matrix.clone());
 model.setSection(false);assert(source.filter(o=>o.parent===model.groups.get('body')).every(o=>!o.material.clippingPlanes?.length));
 model.setSection(true);assert(source.filter(o=>o.parent===model.groups.get('body')).some(o=>o.material.clippingPlanes?.length),'Actual car is sectioned');
 for(let cycle=0;cycle<3;cycle++){model.explode(1);const bounds=new T.Box3().setFromObject(model.root);assert(Number.isFinite(bounds.min.y)&&Number.isFinite(bounds.max.y));model.explode(0);}
 for(let i=0;i<source.length;i++)assert(source[i].matrix.equals(matrices[i]),'Repeated assembly preserves source geometry transforms');
 model.dispose();console.log('216 PASS restored detailed supply section',id,type);
}
