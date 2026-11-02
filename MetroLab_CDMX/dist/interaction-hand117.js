import {SCREW_GRIP202} from './screw-grip202.js?v=204';
import {Arm177,WRIST195} from './arm177.js?v=205';
import * as THREE from'three';
export const INSTRUMENT_GRIP199={contact:new THREE.Vector3(.39,-.14,.21),scaleX:-1,quaternion:new THREE.Quaternion().setFromEuler(new THREE.Euler(-.08,Math.PI,-.16))};
const ease=t=>{t=THREE.MathUtils.clamp(t,0,1);return t*t*t*(10+t*(-15+6*t));};
export function shoulder196(camera,side=1){camera.updateMatrixWorld(true);const forward=camera.getWorldDirection(new THREE.Vector3());forward.y=0;if(forward.lengthSq()<.0001)forward.set(0,0,-1);forward.normalize();const right=forward.clone().cross(new THREE.Vector3(0,1,0)),world=camera.getWorldPosition(new THREE.Vector3()).addScaledVector(right,side*.28).add(new THREE.Vector3(0,-.32,0)).addScaledVector(forward,-.08);return camera.worldToLocal(world);}
// A spatial hand belongs to a contact on the bench, never to the screen cursor.
export class InteractionHand117{
 constructor(view){this.view=view;this.contact=null;this.started=0;this.until=0;this.pointerInside=false;this.reticle=null;this.arm177=new Arm177(view.camera,view.handSide196||1);const doc=globalThis.document;
  if(doc?.createElement&&view.canvas.parentElement){const r=doc.createElement('span');r.className='m117-reticle';r.setAttribute('aria-hidden','true');r.hidden=true;view.canvas.parentElement.append(r);this.reticle=r;}
  view.glove.root.scale.setScalar(.85);view.glove.root.rotation.y=Math.PI;view.glove.root.visible=false;
 }
 aim(e){this.pointerInside=true;const r=this.view.canvas.getBoundingClientRect();if(this.reticle){this.reticle.style.left=(e.clientX-r.left)+'px';this.reticle.style.top=(e.clientY-r.top)+'px';this.reticle.hidden=this.view.glove.root.visible;}if(this.view.canvas.style)this.view.canvas.style.cursor='none';}
 hover(valid){if(this.reticle)this.reticle.dataset.valid=String(valid);}
 engage(hit,now=performance.now()){
  if(!hit?.target||!hit.point)return;if(hit.target.userData.bagTool157){this.grasp196(hit.target,new THREE.Vector3(0,.035,0),'stock');return;}hit.target.updateWorldMatrix(true,false);this.view.glove.fit139?.(hit.target);const local=hit.target.userData.grip118?new THREE.Vector3(...hit.target.userData.grip118):hit.target.worldToLocal(hit.point.clone()),key=hit.target.userData.handTarget||hit.target.userData.srTarget128||'';if(/screw|bolt|terminal[LR]/i.test(key)){local.x=0;local.y=0;}const normal=new THREE.Vector3(0,0,1).transformDirection(hit.target.matrixWorld),toward=this.view.camera.getWorldPosition(new THREE.Vector3()).sub(hit.target.getWorldPosition(new THREE.Vector3()));if(normal.dot(toward)<0)normal.negate();this.contact={object:hit.target,local,normal};if(this.lastObject!==hit.target||now>this.until+240)this.started=now;this.lastObject=hit.target;this.until=now+440;
  this.view.glove.root.visible=true;if(this.view.canvas.style)this.view.canvas.style.cursor='none';if(this.reticle)this.reticle.hidden=true;
 }
 grasp196(target,local,kind='instrument',profile206=null){target.updateWorldMatrix(true,false);this.contact={object:target,local:local.clone(),grasp196:kind,profile206};this.lastObject=target;this.until=performance.now()+440;this.pointerInside=true;}
 equipped196(){const v=this.view,tool=v.glove.activeTool;if(!['screwdriver','wrench','brush','meter'].includes(tool))return false;return typeof v.equipped196==='function'?v.equipped196(tool):v.state?.tool===tool&&!v.state?.complete&&(!v.bagBrowser157||v.bagBrowser157.phase==='closed');}
 idle196(){const v=this.view,root=v.glove.root;root.rotation.set(-.16,Math.PI,-.20);root.position.set(.20,-.25,-.39);root.visible=true;root.updateWorldMatrix(true,true);const wrist=v.camera.worldToLocal(root.localToWorld(new THREE.Vector3(0,WRIST195,0)));this.arm177.pose(wrist,shoulder196(v.camera,v.handSide196||1));root.position.add(this.arm177.wrist.clone().sub(wrist));root.updateWorldMatrix(true,true);if(this.reticle)this.reticle.hidden=true;}
 step(now,held=false){
  const v=this.view,root=v.glove.root;root.scale.x=Math.abs(root.scale.x)*(['instrument','door'].includes(this.contact?.grasp196)?INSTRUMENT_GRIP199.scaleX:(v.handSide196||1));this.arm177.hide();if(!this.contact){if(this.equipped196())this.idle196();else{root.visible=false;if(this.reticle)this.reticle.hidden=!this.pointerInside;}return;}
  if(held)this.until=now+120;
  if(now>this.until+240){this.contact=null;if(this.equipped196())this.idle196();else{root.visible=false;if(this.reticle)this.reticle.hidden=!this.pointerInside;}return;}
  const c=this.contact;c.object.updateWorldMatrix(true,false);v.camera.updateMatrixWorld(true);
  const world=c.object.localToWorld(c.local.clone()),target=v.camera.worldToLocal(world);if(target.z>=-.1){this.hide();return;}
  if(c.profile206){root.quaternion.copy(v.camera.getWorldQuaternion(new THREE.Quaternion()).invert()).multiply(c.object.getWorldQuaternion(new THREE.Quaternion())).multiply(c.profile206.quaternion);}else if(c.grasp196==='door'){root.quaternion.setFromEuler(new THREE.Euler(-.15,Math.PI,-Math.PI/2));}else if(c.grasp196){root.quaternion.copy(v.camera.getWorldQuaternion(new THREE.Quaternion()).invert()).multiply(c.object.getWorldQuaternion(new THREE.Quaternion())).multiply(c.grasp196==='instrument'?INSTRUMENT_GRIP199.quaternion:new THREE.Quaternion().setFromEuler(new THREE.Euler(c.grasp196==='filter'?-Math.PI/2:c.grasp196==='door'?0:-.08,Math.PI,c.grasp196==='door'?Math.PI/2:-.16)));}else if(v.glove.activeTool&&v.glove.activeTool!=='hand'){const localNormal=c.normal.clone().transformDirection(v.camera.matrixWorldInverse).negate();if(v.glove.activeTool==='screwdriver'){const right=new THREE.Vector3(1,0,0).addScaledVector(localNormal,-localNormal.x).normalize(),up=new THREE.Vector3(0,1,0).addScaledVector(localNormal,-localNormal.y).normalize();localNormal.addScaledVector(right,-.40).addScaledVector(up,.22).normalize();}const axis=v.glove.activeTool==='screwdriver'?SCREW_GRIP202.axis:new THREE.Vector3(0,0,1);root.quaternion.setFromUnitVectors(axis,localNormal).multiply(new THREE.Quaternion().setFromAxisAngle(axis,(v.glove.roll139||0)+(v.rollOffset145||0)));}const tip=(c.profile206?c.profile206.anchor.clone():c.grasp196?new THREE.Vector3(.008,c.grasp196==='door'?.065:.028,c.grasp196==='door'?.045:.022):v.glove.tip()).multiply(root.scale).applyQuaternion(root.quaternion);
  const approach=1-ease((now-this.started)/230),withdraw=ease((now-this.until)/240),offset=c.grasp196?(c.release196?ease((now-c.release196)/240):0):Math.max(approach,withdraw);
  root.position.copy(target).sub(tip);root.position.x+=offset*.24;root.position.y-=offset*.26;root.position.z+=offset*.18;root.visible=true;root.updateWorldMatrix(true,true);const wrist=v.camera.worldToLocal(root.localToWorld(new THREE.Vector3(0,WRIST195,0))),shoulder=shoulder196(v.camera,v.handSide196||1);if(wrist.distanceTo(shoulder)>.66){root.visible=false;if(v.canvas.style)v.canvas.style.cursor='';if(v.onReach179)v.onReach179();return;}this.arm177.pose(wrist,shoulder);root.position.add(this.arm177.wrist.clone().sub(wrist));root.updateWorldMatrix(true,true);
  if(this.reticle)this.reticle.hidden=true;
 }
 leave(){if(this.contact)this.until=Math.min(this.until,performance.now());this.pointerInside=false;if(this.reticle)this.reticle.hidden=true;}
 hide(){this.arm177.hide();this.lastObject=null;this.contact=null;this.pointerInside=false;this.view.glove.root.visible=false;if(this.reticle)this.reticle.hidden=true;if(this.view.canvas.style)this.view.canvas.style.cursor='';}
}
export function gripAngles117(tool,finger,j,grasp){
 if(!grasp)return finger===4?.02:finger===0?.025:[.13,.22,.12][j];
 if(tool==='carryInstrument')return finger===4?[.35,.40,.24][j]:[.80,1,.65][j]*[.92,1,1.04,.91][finger];
 if(tool==='carryDoor')return finger===4?[.55,.55,.30][j]:[.95,1.15,.80][j]*[.92,1,1.03,.94][finger];
 if(['carryFrame','carryRim','carryHandle','carryPinch'].includes(tool)){if(finger===4)return[.45,.45,.25][j];if(tool==='carryHandle')return[.05,.95,.65][j];if(tool==='carryPinch')return(finger<2?[.35,.9,.65]:[.8,1.05,.65])[j];return(tool==='carryRim'?[.40,1,.72]:[.55,.95,.65])[j]*[.96,1,1.02,.94][finger];}
 if(tool==='carryFilter')return finger===4?[.46,.35,.20][j]:[.58,.83,.60][j]*[.92,1,1.03,.94][finger];
 if(tool==='meter')return finger===4?[.55,.42,.20][j]:finger<2?[.45,.64,.38][j]:[.20,.35,.20][j];
 if(tool==='screwdriver')return finger===4?[.35,.55,.30][j]:[.95,1.10,1.10][j]*[.96,1,1.02,.94][finger];
 if(tool==='wrench')return finger===4?[.48,.32,.20][j]:[.70,.88,.52][j];
 return finger===4?[.38,.28,.16][j]:[.60,.82,.55][j]*[.96,1,1.02,.91][finger];
}
