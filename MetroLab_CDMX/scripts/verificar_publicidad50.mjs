import fs from 'node:fs';
import {GLTFLoader} from '../dist/vendor/GLTFLoader.js';
import {Vector3,Box3,Raycaster} from 'three';
import './node-textures40.mjs';
globalThis.self=globalThis;globalThis.ProgressEvent=class{constructor(t,p){Object.assign(this,p)}};
const data=JSON.parse(fs.readFileSync('dist/datos.json')),layout=JSON.parse(fs.readFileSync('dist/docs/Publicidad_centrada50.json'));let rays=0,frames=0;const results=[];
for(const s of data.estaciones){
 const buf=fs.readFileSync('dist/'+s.geometria_3d.url_glb.split('?')[0]);const g=await new GLTFLoader().parseAsync(buf.buffer.slice(buf.byteOffset,buf.byteOffset+buf.byteLength),'');g.scene.updateMatrixWorld(true);const signs=[];g.scene.traverse(o=>{if(o.isMesh&&o.name.startsWith('Marco_publicidad'))signs.push(o)});
 for(const sign of signs){
  const box=new Box3().setFromObject(sign),center=box.getCenter(new Vector3()),side=Math.sign(center.z);const r=layout.estaciones.find(x=>x.id===s.id).paneles.find(x=>x.lado===side);
  if(Math.abs(center.x-(r.limites_pano_x[0]+r.limites_pano_x[1])/2)>.001||Math.abs(center.y-(r.limites_pano_y[0]+r.limites_pano_y[1])/2)>.001)throw Error(s.id+' panel descentrado');
  for(const u of [-.49,0,.49])for(const v of [-.49,0,.49])for(const angle of [-45,-30,0,30,45]){
   const target=new Vector3(center.x+u*(box.max.x-box.min.x),center.y+v*(box.max.y-box.min.y),side>0?box.min.z:box.max.z);const origin=target.clone();origin.x+=Math.tan(angle*Math.PI/180)*4;origin.z-=side*4;
   const hits=new Raycaster(origin,target.clone().sub(origin).normalize(),0,8).intersectObject(g.scene,true);if(!/^(Marco_publicidad|Panel_publicidad_disponible)/.test(hits[0]?.object.name||''))throw Error(s.id+' publicidad tapada a '+angle+'°: '+hits[0]?.object.name+' punto '+u+','+v);rays++;
  }
  frames++;
 }
 results.push({id:s.id,paneles_verificados:signs.length});
}
fs.writeFileSync('dist/docs/Verificacion_publicidad50.json',JSON.stringify({metodo:'Carga real GLTFLoader; centro geométrico del paño; 9 puntos del marco a -45, -30, 0, 30 y 45 grados. No prueba WebGL.',paneles:frames,rayos:rays,estaciones:results},null,2));console.log(frames+' paneles centrados, '+rays+' rayos sin postes ni paredes ocultando el anuncio/marco.');
