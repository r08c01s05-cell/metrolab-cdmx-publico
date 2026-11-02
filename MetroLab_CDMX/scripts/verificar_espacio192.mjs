import assert from 'node:assert/strict';
import {view,ui,THREE as T} from './fixture-substation188.mjs';
import {floorHazards192,floorLevel192} from '../dist/work-area192.js';
const floor=floorLevel192(view),bag=view.bagBrowser157.model.root,pad=ui.carry188.pad;
bag.updateWorldMatrix(true,true);const base=new T.Box3().setFromObject(bag.getObjectByName('Base_reforzada157'));
assert(Math.abs(base.min.y-floor-.004)<1e-5,'Bag rests on the real floor without being buried');
const padBox=new T.Box3().setFromObject(pad),bagBox=new T.Box3().setFromObject(bag),hazards=floorHazards192(view,floor);
assert(Math.abs(padBox.min.y-floor-.003)<1e-5,'Mat rests on floor');
for(const [name,b] of [['bag',bagBox],['mat',padBox]])assert(!hazards.some(o=>b.max.x>o.min.x&&b.min.x<o.max.x&&b.max.z>o.min.z&&b.min.z<o.max.z),name+' clears conduits, equipment and door sweep');
assert(!bagBox.intersectsBox(padBox),'Mat and bag have separate work spaces');
assert(pad.position.z< -2.65,'Work mat stays in the front aisle, away from cabinet access');assert(!view.bagBrowser157.model.mat.visible,'Obsolete preparation board stays hidden');
assert.equal(view.bagBrowser157.model.mat.parent,null,'Retired preparation board cannot draw or alter bag bounds');
assert(bagBox.min.y>=floor+.003,'Every bag part stays above the floor, including the lining and pockets');
assert(padBox.max.y-padBox.min.y<.009,'Work mat is thin fabric, not a raised board');
assert.equal(pad.material.userData.realism110,'canvas','Work mat has a woven surface finish');
const initialBagAngle=bag.rotation.y,lid=view.bagBrowser157.model.lid,initialLid=lid.rotation.x;
for(let i=0;i<8;i++)for(const opening of [0,-1,-2.1]){bag.rotation.y=i*Math.PI/4;lid.rotation.x=opening;bag.updateWorldMatrix(true,true);const b=new T.Box3().setFromObject(bag);assert(!hazards.some(o=>b.max.x>o.min.x&&b.min.x<o.max.x&&b.max.z>o.min.z&&b.min.z<o.max.z),'Bag rotation and lid motion clear the conduits and doors');assert(!b.intersectsBox(padBox),'Opening the bag cannot cover the filter mat');}
bag.rotation.y=initialBagAngle;lid.rotation.x=initialLid;bag.updateWorldMatrix(true,true);
const filter=ui.bench.targets.get('filter'),filterPosition=filter.position.clone(),filterQuaternion=filter.quaternion.clone();
ui.carry188.put(filter,ui.carry188.padSurface195(),true);const restingFilter=new T.Box3().setFromObject(filter);
assert(restingFilter.min.y>padBox.max.y,'Filter rests above the actual fabric surface');
for(const axis of ['x','z'])assert(restingFilter.min[axis]>=padBox.min[axis]&&restingFilter.max[axis]<=padBox.max[axis],'Filter fits fully on the work mat: '+axis);
filter.position.copy(filterPosition);filter.quaternion.copy(filterQuaternion);filter.updateWorldMatrix(true,true);
for(const door of view.model.userData.doors||[]){const original=door.rotation.y;for(const delta of [-Math.PI/2,0,Math.PI/2]){door.rotation.y=original+delta;door.updateWorldMatrix(true,true);const b=new T.Box3().setFromObject(door);for(const area of [bagBox,padBox])assert(!(area.max.x>b.min.x&&area.min.x<b.max.x&&area.max.z>b.min.z&&area.min.z<b.max.z),'Door motion cannot cross the work area');}door.rotation.y=original;door.updateWorldMatrix(true,true);}
ui.setActive(false);console.log('195 PASS: grounded bag through 24 opening/rotation poses, thin woven work mat, complete filter support, and no door-sweep or low-conduit intersections.');
