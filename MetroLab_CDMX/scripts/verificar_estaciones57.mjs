import './node-textures40.mjs';import fs from 'node:fs';import assert from 'node:assert/strict';import {GLTFLoader}from '../dist/vendor/GLTFLoader.js';import{Raycaster,Vector3}from'three';
import{batchStationModel,disposeStationModel}from'../dist/station-assets.js';
globalThis.self=globalThis;globalThis.ProgressEvent=class{constructor(t,p){Object.assign(this,p)}};
const data=JSON.parse(fs.readFileSync('dist/datos.json'));let rays=0;const reports=[];
for(const st of data.estaciones.filter(s=>s.linea===8)){
 const b=fs.readFileSync('dist/'+st.geometria_3d.url_glb.split('?')[0]);const g=await new GLTFLoader().parseAsync(b.buffer.slice(b.byteOffset,b.byteOffset+b.byteLength),'');g.scene.updateMatrixWorld(true);
 g.scene.traverse(o=>{assert(!/^(Peldaño_acceso_aproximado|Nariz_peldaño|Descanso_acceso|Pasamanos_acceso|Montante_barandal)/.test(o.name),st.id+' escalera obsoleta: '+o.name);if(o.material?.name==='Piedra geometrica andenes57'){assert(o.material.map&&o.material.normalMap&&o.material.roughnessMap,st.id+' mapas PBR faltantes');assert(o.geometry.attributes.uv,st.id+' piso sin UV');}});
 const hit=(p,d,len)=>{rays++;return new Raycaster(new Vector3(...p),new Vector3(...d),0,len).intersectObject(g.scene,true);};
 for(const a of st.geometria_3d.accesos_anden){
  if(a.tipo==='pasillo_lateral'){
   for(const offset of [-.8,0,.8])for(const y of [1.5,2.6,3.6])assert(!hit([a.x+offset,y,a.z-a.lado*.5],[0,0,a.lado],2).length,st.id+' acceso lateral tapado');
   for(let i=0;i<a.ruta_local.length-1;i++){
    const p=a.ruta_local[i],q=a.ruta_local[i+1],dx=q[0]-p[0],dz=q[2]-p[2],len=Math.hypot(dx,dz);
    for(const h of [.4,1.7,2.35]){const hs=hit([p[0],p[1]+h,p[2]],[dx/len,0,dz/len],len);assert(!hs.length,st.id+' pasillo sin continuidad: '+hs[0]?.object.name);}
    for(const t of [.1,.5,.9]){const x=p[0]+dx*t,z=p[2]+dz*t,hs=hit([x,1.45,z],[0,-1,0],.3);assert(hs.length&&Math.abs(hs[0].point.y-1.21)<.04,st.id+' piso pasillo discontinuo');}
   }
  }else{
   const ascending=a.tipo==='escalera_ascendente',n=a.peldaños,r=ascending?a.contrahuella_m:.16,t=ascending?a.huella_m:.29;
   for(let k=0;k<n;k++){
    const perpendicular=a.orientacion==='perpendicular',x=perpendicular?a.x:a.x+(k+.5)*t,z=perpendicular?a.z+a.lado*(k+.5)*t:a.z,y=1.21+(ascending?1:-1)*(k+1)*r;
    const floor=hit([x,y+.1,z],[0,-1,0],.2);assert(floor.length&&Math.abs(floor[0].point.y-y)<.015,st.id+' escalon sin apoyo '+k+': '+floor[0]?.object.name);
    const head=hit([x,y+.15,z],[0,1,0],1.95);assert(!head.length,st.id+' altura libre escalera '+k+': '+head[0]?.object.name);
   }
  }
 }
 const batched=batchStationModel(g.scene);assert(batched.children.some(o=>o.userData.componente==='acceso'&&!o.userData.shell),st.id+' acceso perdido en el corte');reports.push({id:st.id,acceso:st.geometria_3d.accesos_anden[0].tipo,lotes:batched.children.length});disposeStationModel(batched);
}
fs.writeFileSync('dist/docs/Verificacion_estaciones57.json',JSON.stringify({estaciones:19,rayos:rays,resultado:'OK',detalle:reports},null,2));console.log({stations:19,rays,result:'OK'});
