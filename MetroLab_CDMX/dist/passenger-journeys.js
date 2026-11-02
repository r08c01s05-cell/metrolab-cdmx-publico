import {trainTrack208,doorSide208,waitingZ208,islandAt208} from './station-layout208.js?v=209';
import {allocateRoster91,portalAllowed91} from './reserved-zone91.js?v=92';
import {buildPassengerFrame,doorOpenness,onboardCount} from './passenger-flow.js?v=225';
import {cabinPlacement} from './passenger-seats.js?v=211';
const distance=(a,b)=>Math.hypot(a.x-b.x,a.z-b.z);
const mix=(a,b,u)=>a+(b-a)*u;
const metadata=a=>({id:a.id,modelType:a.modelType,carryingBaby:a.carryingBaby,guardianId:a.guardianId,age:a.age});
function route(points,start,descriptor,kind,target){
 const lengths=points.slice(1).map((p,i)=>distance(points[i],p)),length=lengths.reduce((a,b)=>a+b,0);
 return {points,lengths,length,start,walkDuration:length/1.35,duration:length/1.35+(kind==='board'?(target.pose==='seated'?.65:target.grip?.45:0):0),descriptor,kind,target,progress:0};
}
function walkRoute(r,elapsed,running,gate){
 let seconds=Math.max(0,Math.min(r.duration,elapsed-r.start));
 if(!gate&&r.progress<r.duration)seconds=r.progress;else r.progress=seconds;
 let travel=Math.min(seconds,r.walkDuration)*1.35,segment=0;
 while(segment<r.lengths.length-1&&travel>r.lengths[segment]){travel-=r.lengths[segment];segment++;}
 const a=r.points[segment],b=r.points[segment+1],u=r.lengths[segment]?Math.min(1,travel/r.lengths[segment]):1;
 const moving=running&&seconds>0&&seconds<r.walkDuration&&gate;
 let yaw=Math.atan2(b.x-a.x,b.z-a.z),pose='standing',seatBlend;
 if(r.kind==='alight'&&seconds===0){pose=r.points[0].pose;seatBlend=Math.min(1,Math.max(0,(r.start-elapsed)/.65));yaw=r.points[0].yaw;}
 if(r.kind==='board'&&seconds>=r.walkDuration){pose=r.target.pose;seatBlend=r.duration>r.walkDuration?Math.min(1,(seconds-r.walkDuration)/.65):1;yaw=r.target.yaw;}
 const grip=r.kind==='board'&&seconds>=r.walkDuration?r.target.grip:r.kind==='alight'&&seconds===0?r.points[0].grip:undefined;
 const gripBlend=r.kind==='board'?Math.min(1,Math.max(0,(seconds-r.walkDuration)/.45)):1;
 return {...r.descriptor,carAnchor211:r.kind==='board'&&seconds>=r.duration?r.target.carAnchor211:undefined,grip,gripBlend,x:mix(a.x,b.x,u),y:1.21,z:mix(a.z,b.z,u),yaw,moving,pose,seatHeight:r.kind==='alight'&&seconds===0?r.points[0].seatHeight:r.target.seatHeight,seatBlend,flow:seconds<r.duration?r.kind:undefined,location:r.kind==='board'&&seconds>=r.duration?'cabin':'platform',routeProgress:seconds,routeDuration:r.duration};
}

export function buildNaturalPassengerFrame(options,states){
 const {engine,train,plan,elapsed,stationCenter,running}=options;
 const dwell=engine.stopDuration?.(train)??engine.dwell;
 if(states.epoch!==engine.epoch){states.clear();states.epoch=engine.epoch;}
 let state=states.get(train.id);
 if(!state){state={roster:allocateRoster91(Array.from({length:onboardCount(train.load)},(_,slot)=>({id:'inside:'+train.id+':'+slot,slot,modelType:slot%2?'woman':'man',carryingBaby:slot%9===3}))),claimed:new Set()};states.set(train.id,state);}
 const background=buildPassengerFrame({...options,plan:null,avoidPortals121:options.plan?.flows.map(f=>f.portal)||[]}).filter(a=>a.id.startsWith('wait:')&&!state.claimed.has(a.id));
 const stopped=train.wait>0&&Math.abs(train.position-stationCenter)<1;
 const key=[engine.epoch,train.stops,train.target,train.direction].join(':');
 if(stopped&&plan?.flows.length&&state.exchange?.key!==key){
  const portals=plan.flows.map(f=>f.portal).filter((p,i,a)=>a.findIndex(q=>q.x===p.x&&q.z===p.z)===i);
  const side=doorSide208(train),track=trainTrack208(train),outside=waitingZ208(train),island208=islandAt208(train.line,stationCenter);
  const nearest=(x,actor)=>{const allowed=actor?portals.filter(p=>portalAllowed91(p,train,actor)):portals;return allowed.length?allowed.reduce((a,b)=>Math.abs(a.x-x)<Math.abs(b.x-x)?a:b):null;};
  const leaving=Math.min(state.roster.length,Math.ceil(state.roster.length*plan.exiting/Math.max(1,plan.initialLoad)));
  const exits=state.roster.slice(0,leaving),survivors=state.roster.slice(leaving),routes=[],doorQueues=new Map();
  let exitEnd=2;
  for(const descriptor of exits){
   const from=cabinPlacement(train,descriptor.slot),p=nearest(from.x),n=doorQueues.get(p.x)||0;doorQueues.set(p.x,n+1);
   const to={x:p.x+1.5,z:outside+side*.35,pose:'standing'};
   const r=route([from,{x:from.x,z:track},{x:p.x,z:track},{x:p.x,z:outside},to],Math.max(2,elapsed+.15)+n*.60,descriptor,'alight',to);
   if(r.start+r.duration<dwell-2.2){routes.push(r);exitEnd=Math.max(exitEnd,r.start+r.duration);}else survivors.push(descriptor);
  }
  const used=new Set(survivors.map(r=>r.slot)),boarders=[];doorQueues.clear();
  const waiting=background.filter(a=>!a.guardianId&&(island208?a.z*(-train.direction)>.6:a.z*side>4.2)).sort((a,b)=>(nearest(a.x,a)?Math.abs(a.x-nearest(a.x,a).x):Infinity)-(nearest(b.x,b)?Math.abs(b.x-nearest(b.x,b).x):Infinity));
  const limit=Math.min(waiting.length,144-survivors.length,onboardCount(plan.entering));
  for(const from of waiting){
   if(boarders.length>=limit)break;
   const p=nearest(from.x,from);if(!p)continue;const car=Math.max(0,Math.min(8,Math.round((p.x-train.position)/train.direction/16.7)+4));
   const choices=Array.from({length:16},(_,i)=>car+i*9).filter(i=>!used.has(i));if(!choices.length)continue;
   const slot=choices.reduce((a,b)=>distance(cabinPlacement(train,a),p)<distance(cabinPlacement(train,b),p)?a:b),target=cabinPlacement(train,slot);
   const n=doorQueues.get(p.x)||0,start=Math.max(2+(dwell-4.7)/2,exitEnd+.6,elapsed+.15)+n*.65;
   const descriptor={...metadata(from),slot};
   const r=route([from,{x:p.x,z:outside},{x:p.x,z:track},{x:target.x,z:track},{x:target.x,z:target.z}],start,descriptor,'board',target);
   if(r.start+r.duration>=dwell-2.2)continue;
   used.add(slot);doorQueues.set(p.x,n+1);boarders.push(descriptor);routes.push(r);state.claimed.add(from.id);
   // A child follows the same doorway and remains with the guardian, rather
   // than appearing as another adult or crossing a different door.
   const child=background.find(a=>a.guardianId===from.id);
   if(child&&survivors.length+boarders.length<144){
    const childSlot=Array.from({length:16},(_,i)=>car+i*9).find(i=>!used.has(i)&&cabinPlacement(train,i).pose==='standing');
    if(childSlot!==undefined){const dest=cabinPlacement(train,childSlot);const d={...metadata(child),slot:childSlot};const cr=route([child,{x:p.x,z:outside},{x:p.x,z:track},{x:dest.x,z:track},dest],start+.5,d,'board',dest);if(cr.start+cr.duration<dwell-2.2){used.add(childSlot);boarders.push(d);routes.push(cr);state.claimed.add(child.id);}}
   }
  }
  state.roster=[...survivors,...boarders];state.exchange={key,routes,survivors};
 }
 const exchange=stopped&&state.exchange?.key===key?state.exchange:null;
 const gate=stopped&&doorOpenness(engine,train)>=.95&&!engine.emergency&&engine.power[train.line];
 const inside=(exchange?exchange.survivors:state.roster).map(d=>({...d,...cabinPlacement(train,d.slot),moving:false,location:'cabin'}));
 const flow=exchange?exchange.routes.map(r=>walkRoute(r,elapsed,running,gate)):[];
 // Claimed passengers keep the same identity in their route and later in the
 // train roster, so they do not duplicate or change clothes at the doorway.
 const waiting=background.filter(a=>!state.claimed.has(a.id));
 return [...flow,...inside,...waiting].slice(0,1160);
}
