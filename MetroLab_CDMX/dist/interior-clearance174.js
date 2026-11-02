import * as T from 'three';
const corrections=new Map();
export function correctedSeat174(key,seat){const c=corrections.get(key);return !c||!seat?seat:{...seat,z:seat.z-Math.sign(seat.z)*c.shift,height:seat.height+c.verticalShift};}
// R173's clearance idea, applied to whole authored R157 seat assemblies.
// The moulded shell, brackets and anchors remain rigid; no texture is removed.
export function repairClearance174(root,id=''){
 if(!/^NM79_(cabina|intermedio)$/.test(id))return null;
 if(root.userData.interior174){corrections.set(id,root.userData.interior174);return root.userData.interior174;}
 root.updateMatrixWorld(true);const inv=root.matrixWorld.clone().invert(),seats=[],panels=[];let floorTop=1.24;
 const bounds=o=>new T.Box3().setFromObject(o).applyMatrix4(inv);
 root.traverse(o=>{if(o.userData.seatIndex147!==undefined)seats.push(o);if(o.isMesh&&/^Panel_inferior_ventanas39/.test(o.name))panels.push(o);if(o.isMesh&&/interior__Piso/i.test(o.name))floorTop=bounds(o).max.y;});
 if(!seats.length||!panels.length)return null;const wall=Math.min(...panels.map(o=>{const b=bounds(o);return Math.min(Math.abs(b.min.z),Math.abs(b.max.z));})),outer=Math.max(...seats.map(o=>{const b=bounds(o);return Math.max(Math.abs(b.min.z),Math.abs(b.max.z));})),bottom=Math.min(...seats.map(o=>bounds(o).min.y));
 const shift=Math.max(0,outer-(wall-.015)),verticalShift=floorTop-bottom;
 if(shift>.06||Math.abs(verticalShift)>.04)throw Error('El ajuste de asiento requiere revisar el modelo '+id);
 for(const o of seats){const p=root.worldToLocal(o.getWorldPosition(new T.Vector3()));p.z-=Math.sign(p.z)*shift;p.y+=verticalShift;o.position.copy(o.parent.worldToLocal(root.localToWorld(p)));o.userData.seatHeight147=(o.userData.seatHeight147||1.70)+verticalShift;}
 root.updateMatrixWorld(true);const audit={id,seats:seats.length,wallInner:wall,clearance:.015,shift,verticalShift,floorTop};root.userData.interior174=audit;root.userData.interior172=audit;corrections.set(id,audit);return audit;
}
