import {trainTrack208,doorSide208,islandAt208,waitingSlot208,waitingZ208,islandId209} from './station-layout208.js?v=209';
import {platformCount121,platformSlot121} from './platform-population121.js?v=121';
import {eligibleForReserved91,allocateRoster91,portalAllowed91} from './reserved-zone91.js?v=92';
import {cabinPlacement} from './passenger-seats.js?v=211';
// Visual passenger groups follow real door portals. Engine counts remain authoritative.
const clamp=v=>Math.max(0,Math.min(1,v));
const lerp=(a,b,t)=>a+(b-a)*t;
// Saturation keeps the web renderer responsive; figures represent groups at high demand.
export const crowdCount=platformCount121;
export function platformWalk(time,index){
 const cycle=18,phase=((time+index*1.73)%cycle+cycle)%cycle;
 // Eight metres, with pauses and a slow start/stop at each end.
 const leg=phase<9?phase:phase-9,forward=phase<9;
 const u=clamp(leg/7),ease=u*u*(3-2*u);
 return {offset:8*(forward?ease:1-ease)-4,moving:leg>0&&leg<7,
 speed:leg<7?48*u*(1-u)/7:0,yaw:(forward?Math.PI/2:-Math.PI/2)+(forward?-1:1)*Math.PI*clamp((leg-7)/2)};
}
export function doorOpenness(engine,train){if(engine.operator?.trainId===train.id){const phase=engine.operator.phase;if(phase==='warning')return 1;if(phase==='closing')return clamp(train.wait/1.5);if(phase==='closed')return 0;}return train.wait>0&&Math.abs(train.speed||0)<.01?Math.max(0,Math.min(1,((engine.stopDuration?.(train)??engine.dwell)-train.wait)/1.5,train.wait/1.5)):0;}
export const onboardCount=load=>Math.min(144,Math.ceil(Math.max(0,load)/4));
export function planPassengerStop(engine,train,queue,portals){
 const dwell=engine.stopDuration?.(train)??engine.dwell;
 const terminal=train.target===0||train.target===engine.lines[train.line].stations.length-1;
 const exiting=terminal?train.load:Math.floor(train.load*.2),entering=Math.min(Math.floor(queue),engine.capacity-train.load+exiting,engine.boardingLimit(train));
 const leaving=Math.min(36,Math.ceil(exiting/12)),boarding=Math.min(48,Math.ceil(entering/12));
 const phaseSpan=Math.max(0,(dwell-4.7)/2),duration=Math.min(6,phaseSpan*.75);
 const flows=[];if(!portals.length||duration<.8)return {flows,initialLoad:train.load,exiting,entering,survivors:onboardCount(train.load)};
 const firstBoard=2+phaseSpan;
 for(const [kind,count,start] of [['alight',leaving,2],['board',boarding,firstBoard]]){
  for(let i=0;i<count;i++){
   const spacing=count>1?Math.min(.12,Math.max(0,phaseSpan-duration-.2)/(count-1)):0;
   const at=start+i*spacing;
   if(at+duration>dwell-2.2)break;
   const modelType=i%2?'woman':'man',allowed=portals.filter(p=>portalAllowed91(p,train,{modelType}));if(!allowed.length)continue;flows.push({kind,portal:allowed[count<=allowed.length?Math.floor(i*allowed.length/count):(i*13)%allowed.length],modelType,start:at,duration,index:i});
  }
 }
 return {flows,initialLoad:train.load,exiting,entering,survivors:onboardCount(train.load-exiting)};
}
export function passengerPath(flow,elapsed,track,side,outsideZ){
 const t=clamp((elapsed-flow.start)/flow.duration),p=flow.portal;
 const inside=track+side*.15,outside=outsideZ??side*4.65;
 let x,z;
 if(flow.kind==='board'){
  if(t<.25){x=lerp(p.x+1.2,p.x,t/.25);z=outside;}
  else if(t<.8){x=p.x;z=lerp(outside,inside,(t-.25)/.55);}
  else{x=lerp(p.x,p.x+.85,(t-.8)/.2);z=inside;}
 }else{
  if(t<.2){x=lerp(p.x+.85,p.x,t/.2);z=inside;}
  else if(t<.75){x=p.x;z=lerp(inside,outside,(t-.2)/.55);}
  else{x=lerp(p.x,p.x+1.2,(t-.75)/.25);z=outside;}
 }
 const vx=flow.kind==='board'?(t<.25?-1.2/.25:t<.8?0:.85/.2):(t<.2?-.85/.2:t<.75?0:1.2/.25);
 const vz=flow.kind==='board'?(t>=.25&&t<.8?(inside-outside)/.55:0):(t>=.2&&t<.75?(outside-inside)/.55:0);
 return {x,y:1.21,z,moving:t>0&&t<1,yaw:Math.atan2(vx,vz),progress:t,portal:p};
}
export function buildPassengerFrame({engine,train,stationCenter,queue,portals=[],plan,elapsed,visibleStation,motionTime=engine.time,running=true,avoidPortals121=[]}){
 const time=motionTime,track=trainTrack208(train),side=doorSide208(train),actors=[],island208=islandAt208(train.line,stationCenter);
 const atStation=Math.abs(train.position-stationCenter)<1&&train.wait>0&&Math.abs(train.speed||0)<.01;
 const gate=atStation&&doorOpenness(engine,train)>=.95;
 const exchangeAllowed=!engine.emergency&&engine.power[train.line];
 const activePlan=atStation&&plan;
 const flows=activePlan?plan.flows:[];
 const boards=flows.filter(f=>f.kind==='board'),alights=flows.filter(f=>f.kind==='alight');
 const waiting=visibleStation?crowdCount(queue):0;
 // Waiting and walking stay well back from the platform edge (|z| >= 4.2 m).
 const occupied121=new Set(),blockedPortals121=[...portals,...avoidPortals121];let placed121=0;
 for(let i=0;placed121<Math.max(0,waiting-boards.length);i++){
  const platform=i%2?1:-1,j=Math.floor(i/2),modelType=(j+Math.floor(j/16))%2?'man':'woman';
  const slot=platformSlot121(stationCenter,i,modelType,platform,occupied121),walk=i%12===0||j%36===4,path=platformWalk(time,i);
  // Fill the platform's depth from the first groups, rather than filling every
  // near-edge row before using the rest of the island. Stable small offsets
  // break military-looking lines without changing identities or logical demand.
  const row210=[0,4,2,6,1,5,3,7][slot.row];
  let x=slot.x+(walk?path.offset:island208?.16*Math.sin(i*2.4):0),z=island208?waitingSlot208(islandId209(train.line,stationCenter),walk?platform*6.2:platform*(4.45+row210*.46))+(walk?0:.10*Math.sin(i*1.8)):(walk?platform*8.45:slot.z);
  if(!walk&&blockedPortals121.some(p=>p.z*platform>0&&Math.abs(x-p.x)<.7))x+=.82;
  x=Math.max(stationCenter-66,Math.min(stationCenter+66,x));
  if(!eligibleForReserved91({modelType})&&(x-stationCenter)*(-platform)>18.5)x=stationCenter+(-platform)*18.5;
  const family=j%12===4&&placed121+1<waiting-boards.length,carrying=j%16===2&&modelType==='woman';
  const adult={id:'wait:'+stationCenter+':'+i,modelType,carryingBaby:carrying,x,y:1.21,z,moving:walk&&path.moving&&running,speed:walk?path.speed:0,yaw:walk?path.yaw:(island208?(platform===1?0:Math.PI):(platform===1?Math.PI:0))+.04*Math.sin(time*.35+i),location:'platform'};
  actors.push(adult);placed121++;
  if(family){actors.push({...adult,id:adult.id+':child',modelType:'child',carryingBaby:false,guardianId:adult.id,x:adult.x+.55,z:adult.z+platform*.18});placed121++;}
 }
 // Interpolate cabin occupancy from completed door groups; settle engine totals at departure.
 const complete=kind=>{const set=flows.filter(f=>f.kind===kind);return set.length?set.filter(f=>elapsed>=f.start+f.duration).length/set.length:0;};
 const cabinLoad=activePlan?Math.max(0,plan.initialLoad-plan.exiting*complete('alight')+plan.entering*complete('board')):train.load;
 const onboard=onboardCount(cabinLoad);
 for(const person of allocateRoster91(Array.from({length:onboard},(_,i)=>({id:'inside:'+train.id+':'+i,modelType:i%2?'woman':'man',carryingBaby:i%9===3}))))actors.push({...person,...cabinPlacement(train,person.slot),moving:false});
 for(const f of flows){
  // Completed boarding groups become the distributed cabin population.
  if(f.kind==='board'&&elapsed>=f.start+f.duration+.45)continue;
  // Never cross a closed door, a moving train or an emergency stop.
  let safeElapsed=elapsed;
  if(!gate)safeElapsed=elapsed>=f.start+f.duration?f.start+f.duration:f.start;
  const actor=passengerPath(f,safeElapsed,track,side,waitingZ208(train));
  if(!gate||!exchangeAllowed||!running)actor.moving=false;actor.flow=f.kind;actor.id=train.id+':'+train.stops+':'+f.kind+':'+f.index;actor.modelType=f.modelType||(f.index%2?'woman':'man');actor.carryingBaby=f.index%5===1;actors.push(actor);
  if(f.index%4===2){let childElapsed=safeElapsed-.45;if(!gate)childElapsed=elapsed>=f.start+f.duration+.45?f.start+f.duration:f.start;const child=passengerPath(f,childElapsed,track,side,waitingZ208(train));child.id=actor.id+':child';child.modelType='child';child.guardianId=actor.id;child.flow=f.kind;child.moving=child.moving&&gate&&exchangeAllowed&&running;const u=child.progress;child.x+=f.kind==='board'?(u<.25?.55*(1-u/.25):u>.8?.50*(u-.8)/.2:0):(u<.2?.50*(1-u/.2):u>.75?.55*(u-.75)/.25:0);actors.push(child);}
 }
 // Doorway actors have priority over background groups, even at peak demand.
 return [...actors.filter(a=>a.flow),...actors.filter(a=>a.id.startsWith('inside:')),...actors.filter(a=>!a.flow&&!a.id.startsWith('inside:'))].slice(0,1160);
}
