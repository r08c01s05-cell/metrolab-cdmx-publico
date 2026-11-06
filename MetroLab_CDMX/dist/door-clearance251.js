import * as THREE from 'three';

// Holgura de puertas 251. Todas las hojas del modelo abrían 105°. Así, la puerta del rectificador
// se cruzaba con la hoja derecha del resguardo del transformador, y la de servicios auxiliares
// tocaba el extintor. Antes de usarlas, cada hoja reduce su apertura, de 5° en 5° y como mínimo
// a 80°, hasta que su posición abierta no corte a otra hoja ya abierta ni a un equipo de la planta.
export const MIN_OPEN251=80,MAX_OPEN251=105,MARGIN251=.15;
function segDist(a,b,c,d){const cross=(p,q,r)=>(q.x-p.x)*(r.y-p.y)-(q.y-p.y)*(r.x-p.x);
 const d1=cross(c,d,a),d2=cross(c,d,b),d3=cross(a,b,c),d4=cross(a,b,d);if(d1*d2<0&&d3*d4<0)return 0;
 const pt=(p,q,r)=>{const v=q.clone().sub(p),t=Math.max(0,Math.min(1,r.clone().sub(p).dot(v)/(v.lengthSq()||1)));return p.clone().addScaledVector(v,t).distanceTo(r);};
 return Math.min(pt(a,b,c),pt(a,b,d),pt(c,d,a),pt(c,d,b));}
// Leaf of a door at a given opening fraction, as a 2D segment (x, z) in world space.
export function leaf251(row,fraction){const door=row.door,q=door.quaternion.clone();door.quaternion.copy(row.closed).slerp(row.opened,fraction);door.updateWorldMatrix(true,false);
 const hinge=new THREE.Vector3().setFromMatrixPosition(door.matrixWorld),tip=new THREE.Vector3(row.free251,0,0).applyMatrix4(door.matrixWorld);door.quaternion.copy(q);door.updateWorldMatrix(true,false);
 return {a:new THREE.Vector2(hinge.x,hinge.z),b:new THREE.Vector2(tip.x,tip.z),hinge,tip};}
export function limitDoorSwing251(rows,model,{obstacles=true}={}){
 const ray=new THREE.Raycaster(),doorParts=new Set(),done=[],report=[];for(const r of rows)r.door.traverse(o=>doorParts.add(o));
 const targets=[];if(obstacles)model.traverse(o=>{if(o.isMesh&&!doorParts.has(o)&&o.visible!==false&&!/Losa|Cubierta|Muro|Pa(ñ|n)o|Zoclo|Tapete|Franja|Estria/.test(o.name))targets.push(o);});
 for(const row of rows){const save=row.door.quaternion.clone();row.door.quaternion.copy(row.closed);row.door.updateWorldMatrix(true,true);
  const local=new THREE.Box3().setFromObject(row.door).applyMatrix4(row.door.matrixWorld.clone().invert());row.free251=Math.abs(local.min.x)>Math.abs(local.max.x)?local.min.x:local.max.x;row.height251=[local.min.y,local.max.y];row.door.quaternion.copy(save);row.door.updateWorldMatrix(true,true);
  const full=2*Math.acos(Math.min(1,Math.abs(row.closed.dot(row.opened))))*180/Math.PI||MAX_OPEN251;let degrees=full,blocker=null;
  for(;degrees>=MIN_OPEN251-1e-6;degrees-=5){const f=degrees/full,s=leaf251(row,f);blocker=null;
   for(const other of done)if(segDist(s.a,s.b,other.a,other.b)<MARGIN251){blocker=other.row.label;break;}
   if(!blocker&&targets.length){const dir=s.tip.clone().sub(s.hinge).setY(0),len=dir.length();dir.normalize();const side=new THREE.Vector3(-dir.z,0,dir.x);
    for(const y of[.1,.25,.4,.55,.7,.85])for(const off of[-.04,.04]){const h=row.height251[0]+(row.height251[1]-row.height251[0])*y,origin=s.hinge.clone().addScaledVector(dir,.1).addScaledVector(side,off);origin.y=row.door.matrixWorld.elements[13]+h;ray.set(origin,dir);ray.far=Math.max(0,len+.02);const hit=ray.intersectObjects(targets,false)[0];if(hit){blocker=hit.object.name;break;}}}
   if(!blocker)break;}
  degrees=Math.max(MIN_OPEN251,Math.min(full,degrees));if(degrees<full-1e-6){const f=degrees/full;row.opened=row.closed.clone().slerp(row.opened,f);report.push({label:row.label,degrees});}
  const s=leaf251(row,1);done.push({row,a:s.a,b:s.b});}
 return report;
}
