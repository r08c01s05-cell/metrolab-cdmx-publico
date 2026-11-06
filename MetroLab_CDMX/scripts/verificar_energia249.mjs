import assert from 'node:assert/strict';
import * as T from '../dist/vendor/three.module.js';
import {pointOnPath249,FlowPath249,RouteEnergy249} from '../dist/energy-flow249.js';
import {EnergyDetail249} from '../dist/energy-detail249.js';
import {createEnergyModel160} from '../dist/energy-section160.js';
import {electricState245,ASSUMED245} from '../dist/electric-dashboard245.js';
const pts=[new T.Vector3(0,0,0),new T.Vector3(10,0,0),new T.Vector3(10,0,10)];
assert.deepEqual(pointOnPath249(pts,.5).toArray(),[10,0,0]);assert.deepEqual(pointOnPath249(pts,1).toArray(),[10,0,10]);
const root=new T.Group(),p=new FlowPath249(root,'orange');p.update(pts,3,true);const before=Array.from(p.pulseGeometry.attributes.position.array);p.update(pts,8,true);p.update(pts,3,true);assert.deepEqual(Array.from(p.pulseGeometry.attributes.position.array),before);p.update(pts,3,false);assert(!p.root.visible);p.dispose();assert.equal(root.children.length,0);
for(const kind of ['inverter','chopper','rheostat']){const m=createEnergyModel160('pneumatic',kind),d=new EnergyDetail249(m,'pneumatic',kind);assert.equal(d.devices.length,kind==='inverter'?6:0);for(const amount of [0,.5,1,0]){m.explode(amount);d.update(5,true);const end=d.paths[0].points.at(-1);assert(end.distanceTo(d.paths[1].points[0])<1e-6);for(const path of d.paths)for(const point of path.points)assert(point.toArray().every(Number.isFinite));}d.dispose();m.dispose();}
const off=electricState245({v:5,a:1,traction:1,powered:false});assert.equal(off.I,0);const atRest=electricState245({v:0,a:1,load:1000,capacity:1500,traction:1,powered:true});assert(atRest.motorA>atRest.I);assert.equal(ASSUMED245.motorLimitA,10000);
console.log('249 PASS: absolute-time pulses, continuous power/return, explosion anchors, six IGBT positions only for inverter, zero line current without power, motor current distinguished from line current.');

const fakeNode=()=>({style:{},hidden:false,setAttribute(){},append(){},remove(){}});globalThis.document={querySelector:()=>fakeNode(),getElementById:()=>fakeNode(),createElement:()=>fakeNode()};globalThis.window={};
const train={id:'T',line:1,direction:1,position:100,speed:2,load:100},scene=new T.Scene(),group=new T.Group(),car=new T.Group();car.userData={carIndex:4,formationReference:{powered:true}};group.add(car);scene.add(group);const state={selectedTrain:'T',engine:{trains:[train],time:0,power:{1:true},capacity:1500}};
const view={scene,trainMeshes:new Map([['T',{group}]]),getState:()=>state,alignment97:{map:p=>new T.Vector3(p.x,p.y,p.z+Math.sin(p.x/50)*3)}};const live=new RouteEnergy249(view);live.active=true;const matrix=car.matrix.clone();live.update();assert(live.paths[0][0].root.visible);assert(live.paths[0][0].points[0].z!==-1.8);assert(car.matrix.equals(matrix));state.engine.power[1]=false;live.update();assert(!live.paths[0][0].root.visible);live.dispose();console.log('249 PASS route curves, power cut, lifecycle; car transform intact.');
