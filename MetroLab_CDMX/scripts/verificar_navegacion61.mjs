import assert from 'node:assert/strict';
import * as THREE from '../dist/vendor/three.module.js';
import {OrbitControls} from '../dist/vendor/OrbitControls.js';
import {WorkshopNavigation} from '../dist/workshop-navigation.js';
class Surface {
 constructor(){this.listeners=new Map();this.style={};this.dataset={};this.clientWidth=900;this.clientHeight=600;this.ownerDocument=this;}
 addEventListener(t,f){const s=this.listeners.get(t)||new Set();s.add(f);this.listeners.set(t,s);}
 removeEventListener(t,f){this.listeners.get(t)?.delete(f);}
 dispatch(t,data={}){const e={type:t,pointerId:1,pointerType:'mouse',button:0,clientX:200,clientY:200,pageX:200,pageY:200,preventDefault(){this.prevented=true;},...data};for(const f of [...(this.listeners.get(t)||[])])f(e);return e;}
 getRootNode(){return this;}setPointerCapture(){}releasePointerCapture(){}getBoundingClientRect(){return{left:0,top:0,width:900,height:600};}
}
const canvas=new Surface(),camera=new THREE.PerspectiveCamera(38,1.5,.03,250);camera.position.set(-20,12,22);
const controls=new OrbitControls(camera,canvas);const nav=new WorkshopNavigation(controls,canvas,THREE);
function drag(button,dx,dy){canvas.dispatch('pointerdown',{button});canvas.dispatch('pointermove',{button,clientX:200+dx,clientY:200+dy,pageX:200+dx,pageY:200+dy});const e=canvas.dispatch('pointerup',{button,clientX:200+dx,clientY:200+dy});return nav.consumeSelection(e);}
const position=camera.position.clone(),target=controls.target.clone(),view=camera.position.clone().sub(controls.target),quaternion=camera.quaternion.clone();
assert.equal(drag(1,100,50),false);assert.ok(camera.position.distanceTo(position)>.1);assert.ok(controls.target.distanceTo(target)>.1);assert.ok(camera.position.clone().sub(controls.target).distanceTo(view)<1e-8);assert.ok(camera.quaternion.angleTo(quaternion)<1e-7);
nav.setMode('pan');const q=camera.quaternion.clone();assert.equal(drag(0,-90,60),false);assert.ok(camera.quaternion.angleTo(q)<1e-7);assert.equal(nav.controls.touches.ONE,THREE.TOUCH.PAN);
assert.equal(drag(0,0,0),false);nav.setMode('orbit');assert.equal(drag(0,0,0),true);assert.equal(drag(2,0,0),false);
// Dragging out and back is still a drag, not a piece-selection click.
canvas.dispatch('pointerdown');canvas.dispatch('pointermove',{clientX:240});canvas.dispatch('pointermove',{clientX:200});assert.equal(nav.consumeSelection(canvas.dispatch('pointerup')),false);
const prev=camera.quaternion.clone();drag(0,90,30);assert.ok(camera.quaternion.angleTo(prev)>.01);
const distance=camera.position.distanceTo(controls.target);canvas.dispatch('wheel',{deltaY:-100,deltaMode:0});assert.ok(camera.position.distanceTo(controls.target)<distance);
nav.setMode('pan');assert.equal(canvas.dispatch('mousedown',{button:1}).prevented,true);
// Multiple touch pointers cannot refocus a piece on release.
nav.setMode('orbit');canvas.dispatch('pointerdown',{pointerType:'touch'});canvas.dispatch('pointerdown',{pointerId:2,pointerType:'touch'});assert.equal(nav.consumeSelection(canvas.dispatch('pointerup',{pointerId:2,pointerType:'touch'})),false);assert.equal(nav.consumeSelection(canvas.dispatch('pointerup',{pointerType:'touch'})),false);
controls.dispose();console.log('Pan central/izquierdo conserva orientación; giro, zoom, selección y gestos comprobados con OrbitControls real.');
