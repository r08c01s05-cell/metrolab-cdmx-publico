import {preserveFinishUV124} from './surface-finish124.js?v=194';
import * as THREE from 'three';
import {mergeGeometries} from './vendor/BufferGeometryUtils.js';
export const TRACK_OFFSET=1.8;
export const PLATFORM_EDGE=3.25;
export const trackCenter=direction=>-direction*TRACK_OFFSET;
export const platformSide=direction=>-direction;

// Station geometry is static. Batch only compatible materials and components,
// retaining independent roof/wall sides for the cutaway controls.
export function batchStationModel(source){
 source.updateMatrixWorld(true);
 const buckets=new Map(),originalGeometry=new Set(),result=new THREE.Group();
 result.name=source.name||'Andenes_video';result.userData={...source.userData};
 let inputMeshes=0;
 source.traverse(o=>{
  if(!o.isMesh)return;
  inputMeshes++;
  const component=o.userData.componente||'estructura';
  const wall=component==='pared'||o.name.startsWith('Machon_de_pared');
  const shell=component==='techo'||o.name.startsWith('Volumen_terminal')?'roof':wall?'wall':null;
  const center=new THREE.Box3().setFromObject(o).getCenter(new THREE.Vector3());
  const side=wall?(center.z>=0?1:-1):0;
  const material=Array.isArray(o.material)?o.material[0]:o.material;
  let geo=o.geometry.index?o.geometry.toNonIndexed():o.geometry.clone();
  if(!geo.attributes.normal)geo.computeVertexNormals();
  // Preserve UVs for textured Blender materials; fill absent UVs for legacy models.
  for(const name of Object.keys(geo.attributes))if(!['position','normal','uv','uv2','uv3'].includes(name))geo.deleteAttribute(name);
  for(const name of ['position','normal']){
   const attr=geo.attributes[name],values=new Float32Array(attr.count*3);
   for(let i=0;i<attr.count;i++){values[i*3]=attr.getX(i);values[i*3+1]=attr.getY(i);values[i*3+2]=attr.getZ(i);}
   geo.setAttribute(name,new THREE.Float32BufferAttribute(values,3));
  }
  // Decode quantized attributes to floats before applying world transforms.
  geo.applyMatrix4(o.matrixWorld);
  if(!geo.attributes.uv)geo.setAttribute('uv',new THREE.Float32BufferAttribute(new Float32Array(geo.attributes.position.count*2),2));
  preserveFinishUV124(geo);const oldUV=geo.attributes.uv,uv=new Float32Array(oldUV.count*2);
  for(let i=0;i<oldUV.count;i++){uv[i*2]=oldUV.getX(i);uv[i*2+1]=oldUV.getY(i);}
  geo.setAttribute('uv',new THREE.Float32BufferAttribute(uv,2));
  const key=[material.uuid,component,shell,side].join('|');
  if(!buckets.has(key))buckets.set(key,{material,component,shell,side,geometries:[]});
  buckets.get(key).geometries.push(geo);originalGeometry.add(o.geometry);
 });
 for(const b of buckets.values()){
  const geo=mergeGeometries(b.geometries,false);
  if(!geo)throw Error('Incompatible station geometry');
  const mesh=new THREE.Mesh(geo,b.material);mesh.name='Andenes_'+b.component;
  mesh.userData={componente:b.component,...(b.shell?{shell:b.shell,side:b.side}:{})};
  mesh.castShadow=false;mesh.receiveShadow=false;result.add(mesh);
  b.geometries.forEach(g=>g.dispose());
 }
 originalGeometry.forEach(g=>g.dispose());
 result.userData.batching={meshes_originales:inputMeshes,meshes_vista:result.children.length};
 return result;
}
export function disposeStationModel(model){
 const geometries=new Set(),materials=new Set(),textures=new Set();
 model.traverse(o=>{if(o.geometry)geometries.add(o.geometry);if(o.material)for(const m of Array.isArray(o.material)?o.material:[o.material]){materials.add(m);for(const v of Object.values(m))if(v?.isTexture)textures.add(v);}});
 geometries.forEach(g=>g.dispose());materials.forEach(m=>m.dispose());textures.forEach(t=>{if(!t.userData.quality100Shared)t.dispose();});
}

// Improve oblique platform views without changing the embedded GLB palette.
export function prepareStationMaterials(source,anisotropy=4){
 const seen=new Set();source.traverse(o=>{if(!o.isMesh)return;for(const m of Array.isArray(o.material)?o.material:[o.material]){if(seen.has(m))continue;seen.add(m);m.envMapIntensity=.45;for(const key of ['map','normalMap','roughnessMap','metalnessMap'])if(m[key])m[key].anisotropy=Math.max(1,Math.min(8,anisotropy));}});
}
