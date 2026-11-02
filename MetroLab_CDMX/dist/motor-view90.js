import * as THREE from 'three';
export function motorPartMatrix90(base,origin,explode,amount,angle,rotating){
 const m=base.clone();
 if(rotating)m.premultiply(new THREE.Matrix4().makeTranslation(-origin.x,-origin.y,-origin.z)).premultiply(new THREE.Matrix4().makeRotationZ(angle)).premultiply(new THREE.Matrix4().makeTranslation(origin.x,origin.y,origin.z));
 return m.premultiply(new THREE.Matrix4().makeTranslation(...explode.map(v=>v*amount)));
}
