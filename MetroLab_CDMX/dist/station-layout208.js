// Surface platform layouts. Dimensions are educational estimates, not surveyed plans.
const configured=new Map();
export const COYUYA208=Object.freeze({id:'L8-10',halfLength:78,halfWidth:3.75,track:5.2,height:1.2});
export const SURFACE209=Object.freeze({
 'L8-10':{name:'Coyuya',kind:'island',track:5.2,steel:'#657874',floor:['#5f776d','#c3c4b5'],stairs:[-47,47]},
 'L8-11':{name:'Iztacalco',kind:'island',track:5.2,steel:'#636285',floor:['#71766c','#c7c4b7'],stairs:[-35,35]},
 'L8-12':{name:'Apatlaco',kind:'island',track:5.2,steel:'#587582',floor:['#9a9485','#c9c3b4'],stairs:[-43,43]},
 'L8-13':{name:'Aculco',kind:'island',track:5.2,steel:'#667874',floor:['#9a998c','#c4c1b4'],stairs:[-49,49]},
 'L8-19':{name:'Constitución de 1917',kind:'terminal',track:10.4,steel:'#d0d4ce',floor:['#a4a69b','#babdb1'],stairs:[-44,44]},
 'L1-20':{name:'Observatorio',kind:'lateral',track:1.8}
});
export const isCoyuya208=station=>station?.id===COYUYA208.id;
export const surfaceSpec209=station=>SURFACE209[typeof station==='string'?station:station?.id];
export const isSurfaceIsland209=station=>['island','terminal'].includes(surfaceSpec209(station)?.kind);
export const platformRegions209=station=>surfaceSpec209(station)?.kind==='terminal'?[{minZ:-8.6,maxZ:-1.8,center:-5.2},{minZ:1.8,maxZ:8.6,center:5.2}]:[{minZ:-3.4,maxZ:3.4,center:0}];
export const platformEye209=station=>surfaceSpec209(station)?.kind==='terminal'?-7.8:surfaceSpec209(station)?.kind==='lateral'?-5.6:-2.3;
export function configureLayout208(line){
 const rows=[];for(let i=0;i<(line?.stations?.length||0);i++){const station=line.stations[i],spec=surfaceSpec209(station);if(spec&&spec.kind!=='lateral')rows.push({...spec,id:station.id,index:i,center:line.distances[i]});}
 const number=line?.stations?.[0]?.linea??(rows.length?8:undefined);if(number!==undefined)configured.set(Number(number),rows);
}
function nearest(line,x){return configured.get(Number(line))?.find(s=>Math.abs(x-s.center)<=80);}
export const islandId209=(line,x)=>nearest(line,x)?.id;
export const islandAt208=(line,x)=>Boolean(nearest(line,x));
export function offsetAt208(line,x){
 const rows=configured.get(Number(line))||[];let value=1.8;
 for(let i=0;i<rows.length;i++){
  let end=i;while(end+1<rows.length&&rows[end+1].index===rows[end].index+1&&rows[end+1].track===rows[i].track)end++;
  const distance=x<rows[i].center?rows[i].center-x:x>rows[end].center?x-rows[end].center:0;
  if(distance<=160)value=Math.max(value,rows[i].track);else if(distance<400){const u=(distance-160)/240;value=Math.max(value,rows[i].track-(rows[i].track-1.8)*(u*u*(3-2*u)));}
  i=end;
 }
 return value;
}
export const trainTrack208=(train,x=train.position)=>-train.direction*offsetAt208(train.line,x);
export const doorSide208=train=>islandAt208(train.line,train.position)?train.direction:-train.direction;
export const waitingZ208=(train,row=0)=>islandAt208(train.line,train.position)?trainTrack208(train)+train.direction*(2.1+row*.42):-train.direction*(4.65+row*.42);
export function waitingSlot208(stationId,z){const s=surfaceSpec209(stationId);if(!s||s.kind==='lateral')return z;const a=Math.abs(z),out=s.kind==='terminal'?8.3:3.1,minimum=s.kind==='terminal'?2.15:.25,factor=s.kind==='terminal'?1.9:.84;return Math.sign(z)*Math.max(minimum,Math.min(out,out-(a-4.45)*factor));}
export function platformBounds208(solids,side=-1){
 if(solids?.layout208!=='island')return null;
 const regions=solids.regions209||[{minZ:-3.4,maxZ:3.4}];
 const r=regions.length===1?regions[0]:regions.find(r=>r.center*side>0)||regions[0];return{minX:-73,maxX:73,...r};
}
