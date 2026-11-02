import * as T from 'three';
const cache=new WeakMap();
// Contacts belong to the actual object, not to the diagonal of its camera AABB.
export function materialGrip206(object,side=1,kind='panel'){
 let item=cache.get(object);
 if(!item){
  object.updateWorldMatrix(true,true);const inverse=object.matrixWorld.clone().invert(),box=new T.Box3();
  object.traverse(o=>{if(!o.isMesh||!o.geometry)return;o.geometry.computeBoundingBox();box.union(o.geometry.boundingBox.clone().applyMatrix4(inverse.clone().multiply(o.matrixWorld)));});
  const size=box.getSize(new T.Vector3()),axes=['x','y','z'],thin=axes.toSorted((a,b)=>size[a]-size[b])[0],vertical=thin==='y'?'z':'y',up=new T.Vector3(),face=new T.Vector3();up[vertical]=1;face[thin]=1;const right=new T.Vector3().crossVectors(up,face);item={box,size,center:box.getCenter(new T.Vector3()),vertical,right,toCamera:new T.Quaternion().setFromRotationMatrix(new T.Matrix4().makeBasis(right,up,face)).invert(),profiles:new Map()};cache.set(object,item);
 }
 const key=side+':'+kind;if(item.profiles.has(key))return item.profiles.get(key);
 const {box,size,center}=item,point=center.clone(),normal=new T.Vector3(),along=new T.Vector3(),anchor=new T.Vector3(.008,.028,.022);
 let pose='carryFrame';
 if(kind==='bag'){
  // The authored obstruction bag has an actual curved strap. Take its upper bend.
  let best=-Infinity;
  const inverse=object.matrixWorld.clone().invert(),p=new T.Vector3();
  object.traverse(o=>{if(!o.isMesh||!/correa|asa|handle/i.test(o.name))return;const matrix=inverse.clone().multiply(o.matrixWorld),a=o.geometry.attributes.position;for(let i=0;i<a.count;i++){p.fromBufferAttribute(a,i).applyMatrix4(matrix);if(p.y>best){best=p.y;point.copy(p);}}});
  if(best===-Infinity)point.set(center.x,box.max.y,center.z);
  normal.set(0,-1,0);along.set(0,0,-1);pose='carryHandle';anchor.set(0,.06,.018);
 }else{
  const across=['x','y','z'].find(axis=>item.right[axis]!==0),sign=side*item.right[across];
  point[across]=sign>0?box.max[across]:box.min[across];normal[across]=-sign;along[item.vertical]=-1;
  if(kind==='small')pose='carryPinch';else if(kind==='wheel')pose='carryRim';
  // Fasteners may extend beyond a frame's side. Resolve the real side surface.
  const origin=object.localToWorld(point.clone().addScaledVector(normal,-Math.max(size.x,size.y,size.z)*.15-.03)),direction=normal.clone().transformDirection(object.matrixWorld);
  const hit=new T.Raycaster(origin,direction).intersectObject(object,true).find(h=>{for(let p=h.object;p;p=p.parent)if(!p.visible)return false;return h.object.material?.visible!==false;});
  if(hit)point.copy(object.worldToLocal(hit.point.clone()));
 }
 const lateral=new T.Vector3().crossVectors(along,normal).normalize(),quaternion=new T.Quaternion().setFromRotationMatrix(new T.Matrix4().makeBasis(lateral,along,normal));
 const profile={point,quaternion,anchor,pose,kind,side,toCamera:item.toCamera};item.profiles.set(key,profile);return profile;
}
