import * as T from 'three';
// Fit the existing tools flat over the padded lining, below the closed flap.
export function layTools200(items,root){root.updateWorldMatrix(true);const inverse=root.matrixWorld.clone().invert(),slots=[];
 for(const item of items){item.position.set(0,0,0);item.rotation.set(-Math.PI/2,0,0);item.updateWorldMatrix(true,true);const box=new T.Box3().setFromObject(item).applyMatrix4(inverse);slots.push({item,box,size:box.getSize(new T.Vector3())});}
 const gap=.015,total=slots.reduce((s,p)=>s+p.size.x,0)+gap*Math.max(0,slots.length-1),factor=Math.min(1,.44/total);let x=-total*factor/2;
 for(const {item,box,size}of slots){if(factor<1)item.scale.multiplyScalar(factor);const width=size.x*factor;item.position.set(x+width/2-box.getCenter(new T.Vector3()).x*factor,-.027-box.min.y*factor,-box.getCenter(new T.Vector3()).z*factor);x+=width+gap*factor;item.userData.home157=item.position.clone();item.userData.rot157=item.rotation.clone();item.userData.laidFlat200=true;item.updateWorldMatrix(true,true);}
}
