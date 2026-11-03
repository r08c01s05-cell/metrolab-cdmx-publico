import * as T from 'three';

// Puertas de bolsillo 237. In the NM-22, NM-79 and MP-82 the leaves slide into a pocket between
// the outer skin and the inner lining, so an open leaf is never seen over the side windows.
// The GLB leaves are separate meshes on the outside of the body, so when they are animated
// they used to slide across the windows. Each animated leaf gets its own material copy with a
// clipping plane at its closed outer edge (the door jamb): whatever passes that edge is inside
// the pocket and is not drawn. The renderer must have localClippingEnabled.
export function pocketLeaf237(objects,box,direction){
 const dir=direction.clone().normalize(),size=box.getSize(new T.Vector3()),half=Math.abs(size.dot(new T.Vector3(Math.abs(dir.x),Math.abs(dir.y),Math.abs(dir.z))))/2;
 const edge=box.getCenter(new T.Vector3()).addScaledVector(dir,half),plane=new T.Plane(dir.clone().negate(),dir.dot(edge)),base=plane.constant,saved=[],owned=[];
 for(const o of objects){if(!o.material)continue;saved.push({o,material:o.material});const copy=m=>{const c=m.clone();c.clippingPlanes=[plane];c.clipShadows=true;owned.push(c);return c;};o.material=Array.isArray(o.material)?o.material.map(copy):copy(o.material);}
 return {plane,dir,edge,
  // The whole car moved by `offset` (world): the jamb moves with it.
  follow(offset){plane.constant=base+dir.dot(offset);},
  restore(){for(const {o,material}of saved)o.material=material;for(const m of owned)m.dispose();saved.length=0;owned.length=0;}};
}
// Group leaf meshes by door leaf ("…_Hoja_1", "…_Hoja_-1") from their names or family.
export function leafKey237(o){const name=o.userData?.faultFamily218||o.name||'',m=name.match(/^(.*_Hoja_-?1)/);return m?m[1]:null;}
