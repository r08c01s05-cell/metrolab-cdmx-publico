import './node-textures40.mjs';
import * as T from 'three';
import fs from 'node:fs';import zlib from 'node:zlib';import assert from 'node:assert/strict';import {execFileSync} from 'node:child_process';
import {GLTFLoader} from '../dist/vendor/GLTFLoader.js';
import {enhanceMetroMaterials} from '../dist/metro-render.js';
import {PARTS,partCategory} from '../dist/workshop-core.js';
import {prepareExplosion172} from '../dist/explosion172.js';
import {repairClearance174,correctedSeat174} from '../dist/interior-clearance174.js';
import {safePlatformPoint169,constrainPlatformActors169} from '../dist/platform-collision169.js';
const results=[];
for(const model of ['NM22','NM79','MP82'])for(const unit of ['cabina','intermedio']){
 const id=model+'_'+unit,path='dist/models/'+id+'.glb.gz',bytes=fs.readFileSync(path);
 assert(bytes.equals(execFileSync('git',['show','HEAD:'+path],{maxBuffer:50e6})),id+' keeps latest binary');
 const raw=zlib.gunzipSync(bytes),root=(await new GLTFLoader().parseAsync(raw.buffer.slice(raw.byteOffset,raw.byteOffset+raw.byteLength),'')).scene;
 enhanceMetroMaterials(root,id);const audit=repairClearance174(root,id);
 if(model==='NM79'){assert(audit?.seats>0,'whole seats detected');const p=correctedSeat174(id,{z:1,height:1.7});assert.equal(p.z,1-audit.shift);assert.equal(p.height,1.7+audit.verticalShift);assert.equal(repairClearance174(root,id),audit,'idempotent');}
 root.updateMatrixWorld(true);const view={root:new T.Group(),groups:{},meshes:{}};
 for(const key of Object.keys(PARTS)){view.groups[key]=new T.Group();view.meshes[key]=[];view.root.add(view.groups[key]);}
 root.traverse(o=>{if(!o.isMesh)return;let f=o.userData.familia_visual||'';for(let p=o.parent;!f&&p;p=p.parent)f=p.userData.familia_visual||'';const key=partCategory(o.name,f),m=new T.Mesh(o.geometry,o.material);m.name=o.name;m.matrix.copy(o.matrixWorld);m.matrixAutoUpdate=false;m.userData={...o.userData};view.groups[key].add(m);view.meshes[key].push(m);});
 const initial=new T.Box3().setFromObject(view.root),state=prepareExplosion172(view),report=view.root.userData.explosion172;
 assert.equal(report.triangleCountBefore,report.triangleCountAfter,'no triangles lost');assert(state.radius>Math.hypot(Math.max(Math.abs(initial.min.x),Math.abs(initial.max.x)),Math.max(Math.abs(initial.min.z),Math.abs(initial.max.z))));
 for(let i=0;i<3;i++){state.apply(1);assert(new T.Box3().setFromObject(view.root).getSize(new T.Vector3()).length()>initial.getSize(new T.Vector3()).length());state.apply(0);const b=new T.Box3().setFromObject(view.root);assert(b.min.distanceTo(initial.min)<1e-4&&b.max.distanceTo(initial.max)<1e-4,'assembly returns to original');}
 results.push({id,triangles:report.triangleCountAfter,panels:report.panels,seatAudit:audit});
}
const solids=[{minX:-2,maxX:2,minZ:4.3,maxZ:5.2},{minX:1,maxX:3,minZ:4.5,maxZ:5.5}];
for(let x=-3;x<4;x+=.2)for(let z=4;z<7;z+=.2){const p=safePlatformPoint169({x,z},1,solids);assert(!solids.some(b=>p.x>b.minX-.28+1e-7&&p.x<b.maxX+.28-1e-7&&p.z>b.minZ-.28+1e-7&&p.z<b.maxZ+.28-1e-7));}
const boarding={x:0,z:4.8,location:'platform',flow:true};constrainPlatformActors169([boarding],0,solids);assert.equal(boarding.z,4.8,'preserve boarding path');
assert(zlib.gunzipSync(fs.readFileSync('dist/demanda_mensual.json.gz')).equals(fs.readFileSync('assets-source/integracion174/runtime-data/demanda_mensual.json')),'monthly demand preserved byte for byte');
fs.writeFileSync('assets-source/integracion174/geometria174.json',JSON.stringify({results,collision:'passed',monthlyDemand:'lossless'},null,2));console.log(JSON.stringify(results));console.log('PASS: six original train assets, reversible complete explosion, seat alignment, platform obstacles, lossless demand.');
