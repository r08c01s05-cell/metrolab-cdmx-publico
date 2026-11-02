import * as T from 'three';
const smooth=x=>{x=T.MathUtils.clamp(x,0,1);return x*x*(3-2*x);},ramp=(p,a,b)=>smooth((p-a)/(b-a));
export function visible172(object){for(let o=object;o;o=o.parent)if(!o.visible)return false;return true;}
export const routeOffset172=(route,p)=>{
 if(route==='roof')return new T.Vector3(0,6*ramp(p,.12,.36),0);
 if(route==='gear')return new T.Vector3(0,-5*ramp(p,.40,.72),0);
 // First lower the floor below the seats; then slide it clear of the bogies'
 // plan projection so the bottom assemblies remain visible from above.
 if(route==='floor')return new T.Vector3(0,-2*ramp(p,.73,1),-3.6*ramp(p,.86,1));
 const [kind,sideText]=route.split(':'),side=Number(sideText);
 if(kind==='door')return new T.Vector3(0,0,side*6*ramp(p,.20,.54));
 if(kind==='side')return new T.Vector3(0,0,side*3.2*ramp(p,.28,.62));
 if(kind==='end')return new T.Vector3(side*6.5*ramp(p,.28,.62),0,0);
 if(kind==='cab')return new T.Vector3(side*5*ramp(p,.65,1),0,0);
 return new T.Vector3();
};
// A merged exterior material is not one removable rigid panel. Partition triangles
// by physical panel, preserving every triangle, UV, normal and original transform.
function panelRoute(part,name,c){
 if(part==='roof')return'roof';
 if(['mechanics','motors','collectors'].includes(part))return'gear';
 if(part==='cab'||part==='locks')return'cab:'+Math.sign(c.x||-1);
 if(part==='doors')return'door:'+Math.sign(c.z||1);
 if(part==='interior'){
  if(/piso|floor/i.test(name))return'floor';
  if(/Panel_(superior|inferior|testero)|Detalle41|Cartel|Señalización|Interior113_|Remate_superior_testero|Acero_marco_testero/i.test(name))return Math.abs(c.x)>7.5?'end:'+Math.sign(c.x):'side:'+Math.sign(c.z||1);
  return'core';
 }
 if(c.y<.94)return'gear';
 if(c.y<1.30)return'floor';
 if(c.y>3.30&&Math.abs(c.x)<7.8)return'roof';
 if(Math.abs(c.x)>7.5)return'end:'+Math.sign(c.x);
 if(Math.abs(c.z)>.85)return'side:'+Math.sign(c.z);
 return c.y>2.9?'roof':'core';
}
function splitPanels(mesh,part){
 // Seats, motors and mechanisms remain rigid; only already-batched panel meshes
 // need their baked material geometry separated back into removable panels.
 const needs=part==='body'||part==='doors'||part==='interior'&&/piso|floor|Panel_|Detalle41|Cartel|Señalización|Interior113_|Remate_|Acero_marco/i.test(mesh.name);
 if(!needs){mesh.geometry.computeBoundingBox();const c=mesh.geometry.boundingBox.getCenter(new T.Vector3()).applyMatrix4(mesh.matrix);return[{mesh,route:panelRoute(part,mesh.name,c)}];}
 const src=mesh.geometry.clone();src.applyMatrix4(mesh.matrix);
 // Baking a mirrored transform removes the renderer's negative-determinant
 // front-face switch. Preserve that switch in the triangle winding instead.
 if(mesh.matrix.determinant()<0){if(src.index){for(let i=0;i<src.index.count;i+=3){const v=src.index.getX(i);src.index.setX(i,src.index.getX(i+2));src.index.setX(i+2,v);}}else{for(const attr of Object.values(src.attributes))for(let i=0;i<attr.count;i+=3)for(let j=0;j<attr.itemSize;j++){const v=attr.getComponent(i,j);attr.setComponent(i,j,attr.getComponent(i+2,j));attr.setComponent(i+2,j,v);}}const tangent=src.attributes.tangent;if(tangent?.itemSize===4)for(let i=0;i<tangent.count;i++)tangent.setW(i,-tangent.getW(i));}
 const position=src.attributes.position,index=src.index,indices=index?.array,n=index?.count||position.count,buckets=new Map(),c=new T.Vector3(),v=new T.Vector3();
 // Weld only for connectivity analysis: output keeps authored vertices/normals.
 // A complete wheel, frame or box must never be torn apart by a height threshold.
 const count=n/3,parents=Int32Array.from({length:count},(_,i)=>i),vertices=new Map(),components=new Map();
 const find=i=>{while(parents[i]!==i){parents[i]=parents[parents[i]];i=parents[i];}return i;},union=(a,b)=>{a=find(a);b=find(b);if(a!==b)parents[a]=b;};
 for(let t=0;t<count;t++)for(let j=0;j<3;j++){const k=indices?indices[t*3+j]:t*3+j;v.fromBufferAttribute(position,k);const key=[v.x,v.y,v.z].map(x=>Math.round(x*100000)).join(',');if(vertices.has(key))union(t,vertices.get(key));else vertices.set(key,t);}
 for(let t=0;t<count;t++){const key=find(t);if(!components.has(key))components.set(key,{triangles:[],box:new T.Box3()});const part=components.get(key);part.triangles.push(t);for(let j=0;j<3;j++)part.box.expandByPoint(v.fromBufferAttribute(position,indices?indices[t*3+j]:t*3+j));}
 const append=(route,triangle)=>{if(!buckets.has(route))buckets.set(route,[]);buckets.get(route).push(...triangle);};
 for(const component of components.values()){const size=component.box.getSize(new T.Vector3()),shell=part==='body'&&size.x>7&&size.z>1.9&&size.y>1.2,rigidRoute=panelRoute(part,mesh.name,component.box.getCenter(new T.Vector3()));for(const t of component.triangles){const triangle=[0,1,2].map(j=>indices?indices[t*3+j]:t*3+j);if(shell){c.set(0,0,0);for(const k of triangle)c.add(v.fromBufferAttribute(position,k));append(panelRoute(part,mesh.name,c.multiplyScalar(1/3)),triangle);}else append(rigidRoute,triangle);}}
 const result=[];for(const[route,ids]of buckets){const g=new T.BufferGeometry();for(const[name,attr]of Object.entries(src.attributes)){const values=new Float32Array(ids.length*attr.itemSize);for(let i=0;i<ids.length;i++)for(let j=0;j<attr.itemSize;j++)values[i*attr.itemSize+j]=attr.getComponent(ids[i],j);g.setAttribute(name,new T.Float32BufferAttribute(values,attr.itemSize));}g.computeBoundingBox();g.computeBoundingSphere();const m=new T.Mesh(g,mesh.material);m.name=mesh.name+' / '+route;m.userData={...mesh.userData,sourcePanel172:mesh.name};m.renderOrder=mesh.renderOrder;result.push({mesh:m,route});}src.dispose();return result;
}
export function prepareExplosion172(view){
 const triangles=m=>(m.geometry.index?.count||m.geometry.attributes.position.count)/3,triangleCountBefore=Object.values(view.meshes).flat().reduce((n,m)=>n+triangles(m),0);
 const routes=new Map(),units=[],allBounds=new T.Box3();view.root.rotation.y=0;view.root.updateMatrixWorld(true);
 for(const[part,group]of Object.entries(view.groups)){group.position.set(0,0,0);const next=[];for(const old of view.meshes[part]){old.removeFromParent();for(const{mesh,route}of splitPanels(old,part)){const key=part+'|'+route;let unit=routes.get(key);if(!unit){unit=new T.Group();unit.name='Despiece172 / '+key;unit.userData={route172:route,part172:part};routes.set(key,unit);group.add(unit);units.push(unit);}unit.add(mesh);mesh.userData.route172=route;next.push(mesh);}}view.meshes[part]=next;}
 view.root.updateMatrixWorld(true);allBounds.setFromObject(view.root);const originalBounds=allBounds.clone(),radial=Math.hypot(Math.max(Math.abs(allBounds.min.x),Math.abs(allBounds.max.x)),Math.max(Math.abs(allBounds.min.z),Math.abs(allBounds.max.z)));
 const state={progress:0,target:0,units,originalBounds,radius:Math.max(radial+1.2,Math.max(allBounds.max.x-allBounds.min.x,allBounds.max.z-allBounds.min.z)*.56+1.5),platformY:allBounds.min.y-.12,last:0,moving:false,
  apply(p){state.progress=T.MathUtils.clamp(p,0,1);for(const unit of units)unit.position.copy(routeOffset172(unit.userData.route172,state.progress));view.root.updateMatrixWorld(true);},
  reset(){state.target=0;state.moving=false;state.last=0;state.apply(0);},
  request(amount){const target=T.MathUtils.clamp(amount,0,1);if(target===state.target)return;state.target=target;state.moving=true;state.from=state.progress;state.at=performance.now();state.duration=Math.max(350,Math.abs(target-state.progress)*1800);view.exhibition166.spinning=false;if(target>0)view.exhibition166.frame(undefined,true);},
  tick(now){if(!state.moving)return;const f=T.MathUtils.clamp((now-state.at)/state.duration,0,1);state.apply(T.MathUtils.lerp(state.from,state.target,smooth(f)));if(f===1){state.moving=false;view.exhibition166.frame();}},
  surfaceOpacity(){return 1-ramp(state.progress,0,.10);},
  boundsForFrame(full=false){const p=state.progress;if(full){state.apply(1);const b=new T.Box3().setFromObject(view.root);state.apply(p);return b.union(new T.Box3().setFromObject(view.root));}return new T.Box3().setFromObject(view.root);}
 };
 state.reset();view.root.userData.explosion172={panels:units.length,routes:[...new Set(units.map(u=>u.userData.route172))],triangleCountBefore,triangleCountAfter:Object.values(view.meshes).flat().reduce((n,m)=>n+triangles(m),0)};return state;
}
