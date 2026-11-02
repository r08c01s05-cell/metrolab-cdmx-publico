import './node-textures40.mjs';
import fs from 'node:fs';
import assert from 'node:assert/strict';
import {readTrainGLB} from './read-train-glb.mjs';
import {GLTFLoader} from '../dist/vendor/GLTFLoader.js';
import {enhanceMetroMaterials} from '../dist/metro-render.js';
for(const prefix of ['NM22','NM79','MP82'])for(const type of ['cabina','intermedio']){
 const stem=prefix+'_'+type,b=readTrainGLB('dist/models/'+stem+'.glb');
 const json=JSON.parse(b.subarray(20,20+b.readUInt32LE(12)));
 const base=fs.readFileSync('assets-source/trenes/base41/'+stem+'.glb');
 const previous=JSON.parse(base.subarray(20,20+base.readUInt32LE(12)));
 assert.equal(json.images.length,12);assert(b.equals(fs.readFileSync('assets-source/trenes/'+stem+'.glb')));
 const leaves=nodes=>nodes.filter(n=>/^Puerta_S-?1_\d_Hoja_-?1$/.test(n.name));
 const transforms=nodes=>leaves(nodes).map(({children,...n})=>n);
 assert.deepEqual(transforms(json.nodes),transforms(previous.nodes));
 const g=await new GLTFLoader().parseAsync(b.buffer.slice(b.byteOffset,b.byteOffset+b.byteLength),'');
 let surfaces=0;g.scene.traverse(mesh=>{
  if(!mesh.isMesh)return;
  const materials=Array.isArray(mesh.material)?mesh.material:[mesh.material];
  for(const m of materials)if(m.name.includes('PBR41')){
   assert(m.map&&m.normalMap&&m.roughnessMap);
   assert.equal(mesh.geometry.attributes.uv.count,mesh.geometry.attributes.position.count);surfaces++;
  }
  for(const attr of Object.values(mesh.geometry.attributes))assert(attr.array.every(Number.isFinite));
 });assert(surfaces>20);
 enhanceMetroMaterials(g.scene);g.scene.traverse(mesh=>{if(mesh.isMesh&&mesh.material.name.includes('Asientos')&&mesh.material.name.includes('PBR41'))assert(mesh.material.isMeshPhysicalMaterial&&mesh.material.normalMap);});
 console.log(stem+': texturas PBR y UV válidas; puertas sin cambios; '+surfaces+' superficies detalladas.');
}
