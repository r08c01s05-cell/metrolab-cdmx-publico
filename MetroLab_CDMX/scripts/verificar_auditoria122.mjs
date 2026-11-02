import {stationContacts122} from '../dist/world-contact122.js';
import './node-textures40.mjs';
import fs from 'node:fs';import path from 'node:path';import zlib from 'node:zlib';import assert from 'node:assert/strict';
import * as THREE from 'three';import{GLTFLoader}from'../dist/vendor/GLTFLoader.js';import{refineMaterials110,materialCategory115}from'../dist/material-realism110.js';
const walk=p=>fs.readdirSync(p,{withFileTypes:true}).flatMap(e=>e.isDirectory()?walk(path.join(p,e.name)):[path.join(p,e.name)]);
const report={revision:122,scope:'Auditoría de todos los GLB servidos. Validación CPU; no certifica aspecto WebGL ni fidelidad de cotas.',assets:[],sharedTextures:0};const textures=new Set();
for(const file of walk('dist/models').filter(f=>/\.glb(?:\.gz)?$/.test(f))){
 let b=fs.readFileSync(file);if(file.endsWith('.gz'))b=zlib.gunzipSync(b);
 const root=(await new GLTFLoader().parseAsync(b.buffer.slice(b.byteOffset,b.byteOffset+b.byteLength),'')).scene;
 let meshes=0,vertices=0,bones=0,missingNormals=0;const originals=[];
 root.traverse(o=>{if(o.isBone)bones++;if(!o.isMesh)return;meshes++;const p=o.geometry.attributes.position;vertices+=p.count;assert(p.count>0);for(const attribute of [p,o.geometry.attributes.normal])if(attribute)for(let i=0;i<attribute.array.length;i++)assert(Number.isFinite(attribute.array[i]),`${file}: finite geometry`);if(!o.geometry.attributes.normal)missingNormals++;
 for(const m of Array.isArray(o.material)?o.material:[o.material])originals.push({o,m,map:m.map,normal:m.normalMap,rough:m.roughnessMap,color:m.color?.clone(),factor:m.roughness});});
 refineMaterials110(root);assert.equal(refineMaterials110(root),0,'Safe repeated refinement');
 const categories=new Set(),preserved=new Set();let nextVertices=0,nextMeshes=0;
 root.traverse(o=>{if(!o.isMesh)return;nextMeshes++;nextVertices+=o.geometry.attributes.position.count;for(const m of Array.isArray(o.material)?o.material:[o.material]){const kind=m.userData.realism110;if(kind==='preserved')preserved.add(m.name);else if(kind)categories.add(kind);if(m.isMeshStandardMaterial){assert(m.roughness>=0&&m.roughness<=1);assert(m.metalness>=0&&m.metalness<=1);}for(const t of[m.normalMap,m.roughnessMap])if(t?.userData.quality110Shared)textures.add(t);}});
 assert.equal(nextVertices,vertices);assert.equal(nextMeshes,meshes);
 for(const prior of originals){const m=(Array.isArray(prior.o.material)?prior.o.material:[prior.o.material]).find(m=>m.name===prior.m.name);assert(m);assert.equal(m.map,prior.map,'Embedded albedo remains');if(prior.normal)assert.equal(m.normalMap,prior.normal);if(prior.rough){assert.equal(m.roughnessMap,prior.rough);assert.equal(m.roughness,prior.factor,'Authored roughness multiplier preserved');}if(prior.color)assert(m.color.equals(prior.color));}
 const bases=file.includes('/andenes/')?stationContacts122(root).children.reduce((sum,o)=>sum+(o.count||0),0):0;
 report.assets.push({contactBases:bases,file:file.replace('dist/',''),meshes,vertices,bones,missingNormals,categories:[...categories].sort(),authoredMaterialsPreserved:[...preserved].sort()});
}
for(const[n,kind]of Object.entries({pants:'cloth',kidpants:'cloth',pack:'cloth',shoe:'leather',sole:'rubber',hair:'hair',eye:'eye','Vidrio opalino':'diffuser','Guante textil y palma antideslizante':'cloth','Revestimiento stone':'mineral','Pictograma estacion57':'label','Acero satinado104':'brushed'}))assert.equal(materialCategory115(new THREE.MeshStandardMaterial({name:n})),kind,n);
const opal=new THREE.Mesh(new THREE.BoxGeometry(),new THREE.MeshStandardMaterial({name:'Vidrio opalino',transparent:true,opacity:.25}));refineMaterials110(opal);assert(!opal.material.transparent&&opal.material.depthWrite&&opal.material.opacity===1);
const skin=new THREE.Mesh(new THREE.SphereGeometry(),new THREE.MeshStandardMaterial({name:'skin'}));refineMaterials110(skin);assert(skin.material.isMeshPhysicalMaterial&&skin.material.transmission===0&&skin.material.specularIntensity<1);
assert(textures.size<=32,'One shared pair per finish; no per-passenger texture copies');report.contactBases=report.assets.reduce((n,a)=>n+a.contactBases,0);assert(report.contactBases>0,'Real station supports detected from supplied GLB geometry');report.sharedTextures=textures.size;report.totalAssets=report.assets.length;report.totalVertices=report.assets.reduce((s,a)=>s+a.vertices,0);fs.writeFileSync('dist/documentacion/auditoria-realismo122.json',JSON.stringify(report,null,2)+'\n');console.log(JSON.stringify({assets:report.totalAssets,contactBases:report.contactBases,vertices:report.totalVertices,sharedTextures:report.sharedTextures,topology:'preserved',palette:'preserved',embeddedMaps:'preserved',missingNormals:report.assets.filter(a=>a.missingNormals).length}));
