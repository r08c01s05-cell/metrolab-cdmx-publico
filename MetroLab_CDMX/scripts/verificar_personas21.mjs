import * as THREE from 'three';
import assert from 'node:assert/strict';
import {PassengerModels} from '../dist/passenger-models.js';
const people=new PassengerModels(new THREE.Scene(),4);
people.update([{id:'sin-bebe',x:0,y:0,z:0,modelType:'man'},{id:'cuidadora',x:1,y:0,z:0,modelType:'woman',carryingBaby:true}],0);
const mat=new THREE.Matrix4(),scale=new THREE.Vector3(),q=new THREE.Quaternion(),pos=new THREE.Vector3();
for(const name of ['babyBody','babyHead','babyHand','babyLeg','babyArm','babyCap']){
 people.parts[name].getMatrixAt(0,mat);mat.decompose(pos,q,scale);assert.equal(scale.lengthSq(),0,name+' debe quedar completamente oculto');
}
for(const part of Object.values(people.parts)){
 for(const name of ['position','normal'])for(const value of part.geometry.attributes[name].array)assert(Number.isFinite(value),part.name+' geometría inválida');
}
assert(people.parts.head.geometry.attributes.position.count>1000);
assert(people.parts.hand.geometry.attributes.position.count>500);
console.log('Geometría detallada válida; piezas opcionales ocultas en los tres ejes.');
