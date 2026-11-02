import {trainTrack208} from './station-layout208.js?v=209';

// Existing GLB bogie centres, including the runtime's longitudinal .965 scale.
// These describe our models, not certified prototype wheelbase dimensions.
export const bogieHalf212=train=>(train.model==='MP-82'?5.35:5.7)*.965;
const caches=new WeakMap();
export function carSupportPose212(route,train,index,position=train.position){
 const center=position+train.direction*(index-4)*16.7,h=bogieHalf212(train);
 if(!route)return{x:center,z:trainTrack208(train),yaw:0,supports:[]};
 let cache=caches.get(route);if(!cache){cache=new Map();caches.set(route,cache);}
 const key=[train.id,train.line,train.model,train.direction].join('/');let record=cache.get(key);
 if(!record||record.position!==position){record={position,poses:new Map()};cache.set(key,record);if(cache.size>80)cache.delete(cache.keys().next().value);}
 if(record.poses.has(index))return record.poses.get(index);
 const sample=s=>route.pose(s,trainTrack208(train,s));
 let delta=h,a,b;
 // Preserve the rigid distance between pivots. Arc distance alone would place
 // the bogies too close together on a curve or at a track-spacing transition.
 for(let i=0;i<10;i++){a=sample(center-delta);b=sample(center+delta);const length=Math.hypot(b.x-a.x,b.z-a.z);if(Math.abs(length-2*h)<1e-6||length<1e-8)break;delta=Math.max(h*.25,Math.min(h*4,delta*(2*h/length)));}
 a=sample(center-delta);b=sample(center+delta);
 const support=(p,s)=>{const u=sample(s-.25),v=sample(s+.25);return{...p,s,yaw:Math.atan2(-(v.z-u.z),v.x-u.x)};};
 const p={x:(a.x+b.x)/2,z:(a.z+b.z)/2,yaw:Math.atan2(-(b.z-a.z),b.x-a.x),supports:[support(a,center-delta),support(b,center+delta)]};
 record.poses.set(index,p);return p;
}
