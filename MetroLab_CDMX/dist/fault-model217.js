import * as T from 'three';
import {trainAsset} from './depot86.js?v=222';
import {partCategory} from './workshop-core.js?v=112';
import {loadRectifier127} from './rectifier-assets127.js?v=261';
import {inheritSurfaceDetail205} from './surface-detail205.js?v=205';

// A separate study model: no transforms/materials of the live train or existing
// maintenance scene are ever changed. Train geometry is borrowed read-only.
export async function loadFaultModel217(domain,id='NM22'){
 let root,targets,ownedGeometry=false;
 if(domain==='substation'){
  root=await loadRectifier127();targets=root.userData.parts;ownedGeometry=true;
  for(const key of ['civil','roof','cables','aux','earth','fire'])if(targets.get(key))targets.get(key).visible=false;
  for(const door of root.userData.doors||[])door.visible=false;
  if(root.userData.frontWall)root.userData.frontWall.visible=false;
 }else{
  const source=await trainAsset(id,'cabina');source.updateMatrixWorld(true);
  root=new T.Group();targets=new Map();
  source.traverse(o=>{if(!o.isMesh)return;let family=o.userData.familia_visual||'';for(let p=o.parent;!family&&p;p=p.parent)family=p.userData.familia_visual||'';
   const key=partCategory(o.name,family);if(!targets.has(key)){const g=new T.Group();root.add(g);targets.set(key,g);}
   const mesh=new T.Mesh(o.geometry,o.material);mesh.name=o.name;mesh.userData={...o.userData,faultFamily218:family};mesh.matrixAutoUpdate=false;mesh.matrix.copy(o.matrixWorld);targets.get(key).add(mesh);
  });
 }
 const ownedMaterials=new Set(),rows=[],originals=new Set(),textures=new Set(),materialCache=new Map();
 for(const [part,group] of targets){
  group.traverse(o=>{if(!o.isMesh)return;const copy=m=>{originals.add(m);if(ownedGeometry)for(const v of Object.values(m))if(v?.isTexture&&!v.userData.quality100Shared)textures.add(v);let byPart=materialCache.get(m);if(!byPart){byPart=new Map();materialCache.set(m,byPart);}if(byPart.has(part))return byPart.get(part);const clone=inheritSurfaceDetail205(m,m.clone());ownedMaterials.add(clone);byPart.set(part,clone);rows.push({part,material:clone,base:clone.color?.clone()});return clone;};o.material=Array.isArray(o.material)?o.material.map(copy):copy(o.material);});
 }
 root.updateMatrixWorld(true);
 const amber=new T.Color('#ee9046');
 return {root,targets,rows,
  tint(part,amount){for(const row of rows)if(row.base)row.material.color.copy(row.base).lerp(amber,row.part===part?amount:0);},
  bounds(part){root.updateMatrixWorld(true);const target=part&&targets.get(part),box=new T.Box3();(target||root).traverseVisible(o=>{if(!o.isMesh)return;o.geometry.computeBoundingBox();box.union(o.geometry.boundingBox.clone().applyMatrix4(o.matrixWorld));});return box.isEmpty()?new T.Box3().setFromObject(root):box;},
  dispose(){for(const m of ownedMaterials)m.dispose();if(ownedGeometry){const geometries=new Set();root.traverse(o=>{if(o.geometry)geometries.add(o.geometry);});for(const g of geometries)g.dispose();for(const m of originals)m.dispose();for(const t of textures)t.dispose();}}
 };
}
