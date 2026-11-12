import {substationFinish200} from './substation-finish200.js?v=205';
import {coverBattery177} from './battery-cover177.js?v=196';
import {industrialFinish176} from './industrial-finish176.js?v=205';
import {geometryTransform146} from './geometry-transform146.js?v=148';
import {partitionSubstation144} from './substation-spread144.js?v=144';
import {refineSurfaceMaterials100} from './visual-quality100.js?v=205';
import * as THREE from 'three';
import {GLTFLoader} from './vendor/GLTFLoader.js';
import {mergeGeometries} from './vendor/BufferGeometryUtils.js';
import {detailSubstation251} from './substation-detail251.js?v=251';
import {recordSf6Anchors256} from './grid-substation256.js?v=263';
import {SR_PARTS126} from './rectifier-model126.js?v=261';
let bytes;
export async function loadRectifier127(){
 bytes||=(async()=>{const r=await fetch('./models/revision142/subestacion142.glb.gz?v=150');if(!r.ok)throw Error('No se pudo cargar el GLB de la subestación ('+r.status+').');return new Response(r.body.pipeThrough(new DecompressionStream('gzip'))).arrayBuffer();})().catch(e=>{bytes=null;throw e;});
 const gltf=await new GLTFLoader().parseAsync((await bytes).slice(0),''),model=gltf.scene,parts=new Map();
 for(const p of SR_PARTS126){const g=model.getObjectByName(p.id);if(!g)throw Error('Falta el conjunto '+p.id);g.userData={...g.userData,...p,partId:p.id};parts.set(p.id,g);}
 const doors=[];model.traverse(o=>{if(!o.isMesh&&o.name.includes('Puerta')&&o.name.includes('abatida'))doors.push(o);});if(doors.length!==11)throw Error('Faltan puertas de gabinete');const cut=model.getObjectByName('Cerramiento_retirado');if(!cut)throw Error('Falta el cerramiento independiente');
 const details144=partitionSubstation144(model,parts,doors);refineSurfaceMaterials100(model);industrialFinish176(model);substationFinish200(model,parts);model.updateMatrixWorld(true);
 model.updateMatrixWorld(true);for(const door of doors){let handle;door.traverse(o=>{if(o.isMesh&&/^(Tirador[_ ]de[_ ]puerta|Asa[_ ]de[_ ]puerta)/.test(o.name))handle=o;});if(handle){handle.geometry.computeBoundingBox();const p=handle.geometry.boundingBox.getCenter(new THREE.Vector3());p.z=handle.geometry.boundingBox.min.z+.012;door.userData.handle200=door.worldToLocal(handle.localToWorld(p)).toArray();}}
 // Keep equipment assemblies and the architectural cut independently selectable.
 function batch(group,skip){const bins=new Map(),remove=[],inv=group.matrixWorld.clone().invert();group.traverse(o=>{if(!o.isMesh||skip&&isUnder(o,skip))return;const geometry=geometryTransform146(o.geometry,inv.clone().multiply(o.matrixWorld)),list=bins.get(o.material)||[];list.push(geometry);bins.set(o.material,list);remove.push(o);});for(const o of remove){o.parent.remove(o);o.geometry.dispose();}for(const[material,list]of bins){const names=new Set(list.flatMap(g=>Object.keys(g.attributes)));for(const g of list){if(!g.index)g.setIndex(Array.from({length:g.attributes.position.count},(_,i)=>i));for(const name of names)if(!g.attributes[name]){const example=list.find(q=>q.attributes[name]).attributes[name];g.setAttribute(name,new THREE.BufferAttribute(new Float32Array(g.attributes.position.count*example.itemSize),example.itemSize));}}const geometry=mergeGeometries(list);for(const g of list)g.dispose();if(!geometry)throw Error('Geometría incompatible en '+group.name);const m=new THREE.Mesh(geometry,material);m.name=group.name+'_'+material.name;group.add(m);}}
 function isUnder(o,parent){const parents=Array.isArray(parent)?parent:[parent];for(let p=o;p;p=p.parent)if(parents.includes(p))return true;return false;}
 detailSubstation251(model,parts);recordSf6Anchors256(model,parts);model.updateMatrixWorld(true);
 for(const g of parts.values())batch(g,g===parts.get('civil')?[...doors,cut]:[...doors,...details144.map(r=>r.group)]);for(const row of details144)batch(row.group,doors);for(const door of doors)batch(door);batch(cut);cut.visible=false;parts.get('roof').visible=false;
 model.userData={...model.userData,parts,doors,frontWall:cut,asset127:true,kind:'SR',illustrative:true};coverBattery177(model);return model;
}
