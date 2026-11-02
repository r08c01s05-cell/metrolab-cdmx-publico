import assert from 'node:assert/strict';
import {repairHarness93 as h} from './verificar_repair87.mjs';
import {OrbitControls} from '../dist/vendor/OrbitControls.js';
import * as THREE from 'three';
const {ui,bench,get,point}=h,s=ui.state;
// Exercise the installed native-input bindings together with the real camera controller.
// This fixture implements capture/target phases; it does not render WebGL or test CSS hit testing.
class Canvas {
 constructor(){this.events=new Map();this.style={};this.clientWidth=1000;this.clientHeight=650;this.ownerDocument=document;this.captured=new Set();}
 addEventListener(type,fn,opts={}){const a=this.events.get(type)||[];a.push({fn,capture:opts===true||!!opts.capture});this.events.set(type,a);}
 removeEventListener(type,fn){this.events.set(type,(this.events.get(type)||[]).filter(e=>e.fn!==fn));}
 dispatch(type,data={}){const e={type,button:0,pointerId:1,pointerType:'mouse',clientX:0,clientY:0,preventDefault(){},stopImmediatePropagation(){this.stopped=true;},...data};e.pageX=e.clientX;e.pageY=e.clientY;for(const capture of [true,false])for(const l of [...(this.events.get(type)||[])]){if(l.capture!==capture||!(this.events.get(type)||[]).includes(l))continue;l.fn(e);if(e.stopped)return e;}return e;}
 setPointerCapture(id){this.captured.add(id);}
 releasePointerCapture(id){if(this.captured.delete(id))this.dispatch('lostpointercapture',{pointerId:id});}
 getBoundingClientRect(){return {left:0,top:0,width:1000,height:650};}
 getRootNode(){return document;}
}
document.addEventListener=()=>{};document.removeEventListener=()=>{};
const canvas=new Canvas();bench.canvas=canvas;bench.controls=new OrbitControls(bench.camera,canvas);bench.controls.enableRotate=false;bench.controls.mouseButtons.LEFT=null;bench.controls.mouseButtons.RIGHT=THREE.MOUSE.PAN;bench.controls.target.set(.65,0,0);bench.controls.update();bench.bindInput();
function click(key){const p=point(key);canvas.dispatch('pointerdown',p);canvas.dispatch('pointerup',p);assert.equal(bench.controls._pointers.length,0,'Primary click never captured by OrbitControls');assert(!canvas.captured.size,'Capture released on mouse-up');}
function four(key){for(let i=0;i<4;i++)click(key);}
let frames=[],now=0;globalThis.requestAnimationFrame=f=>{frames.push(f);return frames.length;};globalThis.cancelAnimationFrame=()=>{frames=[];};
function flush(){for(let i=0;frames.length&&i<100;i++){const batch=frames;frames=[];now+=100;for(const f of batch)f(now);}assert(!frames.length);}
ui.restart('doors');click('obstacle');assert(s.obstacle&&/Desconecta/.test(s.message),'Unsafe action explains prerequisite');click('power');click('obstacle');assert.equal(s.selectedItem,'obstacle');click('tray');assert(!s.obstacle);click('power');click('doorSlideRight');flush();assert(s.doorOpened);click('doorSlideLeft');flush();assert(s.complete);
ui.restart('ventilation');click('power');four('screw1');four('screw2');click('cover');click('tray');click('plug');click('port');click('coverTray');click('coverSeat');four('screw1');four('screw2');click('power');click('testFan');assert(s.complete);
ui.restart('running');click('power');click('stand');click('wheel');click('tray');click('newWheel');click('wheelHub');four('bolt1');four('bolt2');four('wheelHub');assert(s.complete);
ui.restart('electrical');click('power');click('sourcePlus');click('return');assert(s.zeroVerified);four('screw1');four('screw2');click('cover');click('tray');get('hands-meter-mode').value='Ω';get('hands-meter-mode').onchange();click('fuseA');click('fuseB');assert(s.continuityConfirmed);click('fuse');click('tray');click('newFuse');click('fuseSocket');get('hands-clear-probes').onclick();click('coverTray');click('coverSeat');four('screw1');four('screw2');click('power');get('hands-meter-mode').value='V';get('hands-meter-mode').onchange();click('lampPlus');click('lampMinus');assert(s.complete);
// Right mouse still pans, without invoking a repair action.
const before=bench.camera.position.clone(),log=s.log.length;canvas.dispatch('pointerdown',{button:2,clientX:400,clientY:250});canvas.dispatch('pointermove',{button:2,clientX:460,clientY:270});canvas.dispatch('pointerup',{button:2,clientX:460,clientY:270});assert(bench.camera.position.distanceTo(before)>.01);assert.equal(s.log.length,log);assert.equal(bench.controls._pointers.length,0);ui.recenter();
// Drag remains functional using the registered events, and cancellation restores it.
ui.restart('doors');click('power');let p=point('obstacle');canvas.dispatch('pointerdown',p);canvas.dispatch('pointermove',point('tray'));canvas.dispatch('pointerup',point('tray'));assert(!s.obstacle);
ui.restart('doors');click('power');p=point('obstacle');canvas.dispatch('pointerdown',p);canvas.dispatch('pointercancel',p);assert(!bench.drag);assert.equal(s.selectedItem,null);assert(s.obstacle);
// The real DOM button callbacks provide the same complete workflows without raycasting.
function button(id){const b=get('hands-pieces').children.find(b=>b.dataset.target===id);assert(b,'Visible named action '+id);b.onclick();}
function bf(id){for(let i=0;i<4;i++)button(id);}
ui.restart('doors');button('power');button('obstacle');assert(get('hands-pieces').children.find(x=>x.dataset.target==='tray').dataset.drop==='true');button('tray');button('power');button('doorSlideRight');flush();button('doorSlideRight');flush();assert(s.complete);
ui.restart('ventilation');button('power');bf('screw1');bf('screw2');button('cover');button('tray');button('plug');button('port');button('cover');button('coverSeat');bf('screw1');bf('screw2');button('power');get('hands-fan-test').onclick();assert(s.complete);
ui.restart('running');button('power');button('stand');button('wheel');button('tray');button('newWheel');button('wheelHub');bf('bolt1');bf('bolt2');bf('wheelHub');assert(s.complete);
ui.restart('electrical');button('power');button('sourcePlus');button('return');bf('screw1');bf('screw2');button('cover');button('tray');get('hands-meter-mode').value='Ω';get('hands-meter-mode').onchange();button('fuseA');button('fuseB');button('fuse');button('tray');button('newFuse');button('fuseSocket');get('hands-clear-probes').onclick();button('cover');button('coverSeat');bf('screw1');bf('screw2');button('power');get('hands-meter-mode').value='V';get('hands-meter-mode').onchange();button('lampPlus');button('lampMinus');assert(s.complete);
console.log('v93: four full missions via registered pointer bindings + real OrbitControls, four via visible buttons; click turns, animated door tests, drag, cancel, pan and prerequisite feedback pass. Browser rendering/CSS hit testing not exercised.');
// The fallback diagram must also preserve the first click, rather than cancel on mouse-up.
const board=get('hands-board');let current;
document.elementFromPoint=()=>current;
function schematic(id){const node={dataset:{target:id},style:{},outerHTML:'<g></g>',closest(){return this;},getBoundingClientRect(){return {left:0,top:0,width:40,height:40};}};current=node;const e={button:0,pointerId:4,clientX:20,clientY:20,target:node,preventDefault(){}};board.onpointerdown(e);board.onpointerup(e);}
ui.restart('doors');schematic('power');schematic('obstacle');assert.equal(s.selectedItem,'obstacle');schematic('tray');assert(!s.obstacle);schematic('power');schematic('doorSlideRight');flush();schematic('doorSlideLeft');flush();assert(s.complete);
ui.restart('ventilation');schematic('power');for(let i=0;i<4;i++)schematic('screw1');assert(!s.screws[0]);console.log('v93: fallback diagram also accepts two-click placement and repeated click turns.');
