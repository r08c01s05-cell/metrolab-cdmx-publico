// Remove only exact duplicate draw surfaces in the inspection copy.
// Authored dimensions and attachment positions are preserved.
export function auditInspection171(root){
 const seen=new Map(),duplicates=[],invalid=[];let meshes=0;root.updateMatrixWorld(true);
 root.traverse(o=>{if(!o.isMesh)return;meshes++;const p=o.geometry.attributes.position;if(!p)return;for(let i=0;i<p.array.length;i++)if(!Number.isFinite(p.array[i])){invalid.push(o.name);break;}const materials=(Array.isArray(o.material)?o.material:[o.material]).map(m=>m.uuid).join(','),key=o.geometry.uuid+'|'+materials+'|'+o.matrixWorld.elements.join(',');if(seen.has(key))duplicates.push(o);else seen.set(key,o);});
 for(const mesh of duplicates)mesh.removeFromParent();
 root.userData.geometryAudit171={meshes,duplicateSurfacesRemoved:duplicates.map(o=>o.name),invalidGeometry:invalid};return root.userData.geometryAudit171;
}
