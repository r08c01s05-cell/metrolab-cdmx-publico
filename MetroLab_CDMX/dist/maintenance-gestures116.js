// Gesture math is independent of pointer-event frequency and viewport offsets.
export function angularStep116(previous,x,y,cx,cy,deadZone=14){
 const radius=Math.hypot(x-cx,y-cy);
 if(radius<deadZone)return{angle:null,turn:0};
 const angle=Math.atan2(y-cy,x-cx);
 return{angle,turn:previous===null||previous===undefined?0:Math.abs(Math.atan2(Math.sin(angle-previous),Math.cos(angle-previous)))};
}
export function holdStep116(now,hold,active){
 if(!active||now-hold.heldAt<220)return 0;
 const elapsed=now-hold.lastHold;if(elapsed<16)return 0;
 hold.lastHold=now;
 // A suspended tab or delayed frame must never complete an intervention by itself.
 return Math.min(50,Math.max(0,elapsed))/950;
}
export function benchStructure116(s){return JSON.stringify([s.id,s.power,s.obstacle,s.coverOpen,s.screws,s.wheelRemoved,s.wheelReplaced,s.wheelBolts,s.fuseRemoved,s.fuseReplaced,s.plugConnected,s.probes]);}
