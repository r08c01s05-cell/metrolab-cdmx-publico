import './node-textures40.mjs';
import fs from 'node:fs';import zlib from 'node:zlib';import assert from 'node:assert/strict';
import * as T from 'three';import {GLTFLoader} from '../dist/vendor/GLTFLoader.js';
import {refineSurfaceMaterials100} from '../dist/visual-quality100.js';
import {surfaceMaps124,surfaceBudget124,finishProfiles124} from '../dist/surface-finish124.js';
for(const kind of Object.keys(finishProfiles124)){
 const maps=surfaceMaps124(kind);assert.equal(maps,surfaceMaps124(kind));
 assert.equal(maps.normal.image.width,['floor','mineral'].includes(kind)?512:256);
 assert.equal(maps.normal.colorSpace,T.NoColorSpace);assert.equal(maps.rough.colorSpace,T.NoColorSpace);
 if(maps.albedo)assert.equal(maps.albedo.colorSpace,T.SRGBColorSpace);
 const pixels=maps.rough.image.data;let min=255,max=0;
 for(let i=1;i<pixels.length;i+=4){min=Math.min(min,pixels[i]);max=Math.max(max,pixels[i]);}assert(max>min,kind+' has actual roughness variation');
}
assert(surfaceBudget124().bytes<=20*1024*1024,'Shared detail maps stay below 20 MiB before mipmaps');
for(const file of ['models/NM22_cabina.glb.gz','models/MP82_cabina.glb.gz','models/andenes/L1/L1_01_Pantitlan.glb.gz','models/revision142/subestacion142.glb.gz','models/herramientas139/herramientas139.glb.gz']){
 const b=zlib.gunzipSync(fs.readFileSync('dist/'+file)),root=(await new GLTFLoader().parseAsync(b.buffer.slice(b.byteOffset,b.byteOffset+b.byteLength),'')).scene;
 const originals=[];root.traverse(o=>{if(o.isMesh)for(const m of Array.isArray(o.material)?o.material:[o.material])originals.push({o,name:m.name,map:m.map,normal:m.normalMap,rough:m.roughnessMap,ao:m.aoMap,color:m.color?.clone()});});
 refineSurfaceMaterials100(root);assert.equal(refineSurfaceMaterials100(root),0,'Repeated refinement is idempotent');let detailed=0;
 for(const old of originals){const m=(Array.isArray(old.o.material)?old.o.material:[old.o.material]).find(m=>m.name===old.name);assert(m);if(old.color)assert(m.color.equals(old.color));for(const [key,value]of [['map',old.map],['normalMap',old.normal],['roughnessMap',old.rough],['aoMap',old.ao]])if(value)assert.equal(m[key],value,file+' retains authored '+key);if(!old.ao)assert(!m.aoMap,'Colour must not masquerade as AO');if(m.normalMap?.userData.detail185){detailed++;if(m.normalMap.channel===3)assert(old.o.geometry.attributes.uv3);}}
 assert(detailed>0,file+' uses new material detail');console.log('185 material PASS',file,detailed,'material assignments');
}
console.log('185 PASS: detailed floors/concrete/metal/rubber/fabric, cached maps, correct color spaces, authored artwork preserved, no fabricated AO.',surfaceBudget124());
