import * as THREE from 'three';
import {visualState105} from './visual-settings105.js?v=105';

// Ahorro por cuadro 260. Segunda pasada de rendimiento, ahora sobre el trabajo del procesador:
//  1. Estaciones, túneles y vía no se mueven, pero three.js recalculaba la matriz de sus ~9,000
//     piezas en cada cuadro. Cada bloque se «congela» cuando lleva un rato sin cambios y solo se
//     recalcula si recibe piezas nuevas, si su padre se mueve o en un repaso periódico.
//  2. La multitud se actualizaba hasta 22 veces por segundo sin importar la distancia. De lejos una
//     persona mide unos cuantos pixeles, así que el intervalo crece con la distancia de la cámara.
//  3. A distancia, con el interior ya omitido, también se omite el costado del tren que queda del
//     otro lado de la cámara.
export const FREEZE260=Object.freeze({settleFrames:45,refreshFrames:180});
const original=THREE.Object3D.prototype.updateMatrixWorld;
// three.js passes force=true to every child on every frame while the parent keeps its automatic
// matrix update, so `force` cannot be trusted here: what matters is whether the parent really moved.
const parentKey=o=>{const e=o.parent?.matrixWorld.elements;return e?e[12]+e[13]*3+e[14]*7+e[0]*11+e[5]*13+e[10]*17+e[2]*19:0;};
function frozenUpdate(force){
 const state=this.userData.freeze260,key=parentKey(this);
 if(key!==state.parentKey||this.children.length!==state.children||--state.countdown<=0){
  state.parentKey=key;state.children=this.children.length;state.countdown=FREEZE260.refreshFrames;state.refreshes++;original.call(this,true);return;
 }
 state.skipped++;
}
// Freeze the direct children of the static roots once they have settled. Returns counters.
export function freezeStatic260(view){
 const stats={frozen:0,pending:0};
 for(const root of[view.infrastructure,view.stations]){
  if(!root)continue;
  for(let i=0;i<root.children.length;i++){
   const group=root.children[i];let state=group.userData.freeze260;
   if(state?.active){stats.frozen++;continue;}
   state=group.userData.freeze260??={active:false,age:0,children:-1,countdown:0,skipped:0,refreshes:0};
   if(state.children!==group.children.length){state.children=group.children.length;state.age=0;}
   if(++state.age<FREEZE260.settleFrames){stats.pending++;continue;}
   // Stagger the periodic refresh so the groups do not all recompute on the same frame.
   state.active=true;state.parentKey=NaN;state.countdown=1+(i*7)%FREEZE260.refreshFrames;group.updateMatrixWorld=frozenUpdate;stats.frozen++;
  }
 }
 view.freezeStats260=stats;return stats;
}
export function thawStatic260(view){for(const root of[view.infrastructure,view.stations])for(const g of root?.children||[])if(g.userData.freeze260?.active){delete g.updateMatrixWorld;g.userData.freeze260.active=false;g.userData.freeze260.age=0;}}

// Seconds between crowd updates for a camera at a given distance from what it looks at.
export const PEOPLE260=Object.freeze({near:.045,mid:.085,far:.13,midFrom:70,farFrom:150});
export function peopleInterval260(view){
 const mode=view.cameraMode;if(mode==='passenger'||mode==='car'||mode==='driver'||mode==='cab-platform')return PEOPLE260.near;
 const target=view.controls?.target,camera=view.camera?.position;if(!target||!camera)return PEOPLE260.near;
 const d=camera.distanceTo(target)*(visualState105().quality==='cinematic'?.6:1);
 return d>PEOPLE260.farFrom?PEOPLE260.far:d>PEOPLE260.midFrom?PEOPLE260.mid:PEOPLE260.near;
}
// Which side wall of a car faces away from the camera (logical, straight-track coordinates).
const side=new THREE.Vector3();
export function farWallSign260(group,car,cameraZ,margin=8){
 const dz=cameraZ-(group.position.z+car.position.z);if(Math.abs(dz)<margin)return 0;
 side.set(0,0,1).applyQuaternion(car.quaternion).applyQuaternion(group.quaternion);
 return (side.z>=0?1:-1)*(dz>0?-1:1);// +1: the car's +z wall is the far one, −1: its −z wall
}
