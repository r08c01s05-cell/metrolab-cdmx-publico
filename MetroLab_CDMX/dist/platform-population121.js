import {eligibleForReserved91} from './reserved-zone91.js?v=92';
export const PLATFORM_LIMIT121=900;
export const platformCount121=queue=>Math.min(PLATFORM_LIMIT121,Math.floor(Math.max(0,Number(queue)||0)));
// Slots span the full usable length and both platforms, behind the tactile edge.
export function platformSlot121(center,index,type,side,occupied){
 const direction=-side,preferred=(Math.floor(index/2)*13)%72,start=Math.min(7,Math.floor(index/144));
 for(let row=0;row<8;row++){
  const r=(start+row)%8;
  for(let k=0;k<72;k++){
   const col=(preferred+k*13)%72,x=-62+col*(124/71),key=side+':'+r+':'+col;
   if(occupied.has(key)||!eligibleForReserved91({modelType:type})&&x*direction>20)continue;
   occupied.add(key);return{x:center+x,z:side*(4.45+r*.46),col,row:r};
  }
 }
 return{x:center-60*direction,z:side*8.1,col:0,row:7};
}
