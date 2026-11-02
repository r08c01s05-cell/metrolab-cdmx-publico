import fs from 'node:fs';
import {GLTFLoader} from '../dist/vendor/GLTFLoader.js';
import {Box3,Mesh,PlaneGeometry,MeshBasicMaterial} from 'three';
globalThis.self=globalThis;globalThis.createImageBitmap=async()=>({width:1,height:1,close(){}});globalThis.ProgressEvent=class{constructor(t,p){Object.assign(this,p)}};
const data=JSON.parse(fs.readFileSync('dist/datos.json')),results=[];
const overlaps=(a,b)=>a.min.x<b.max.x&&a.max.x>b.min.x&&a.min.y<b.max.y&&a.max.y>b.min.y;
for(const s of data.estaciones){
 const b=fs.readFileSync('dist/'+s.geometria_3d.url_glb.split('?')[0]);const g=await new GLTFLoader().parseAsync(b.buffer.slice(b.byteOffset,b.byteOffset+b.byteLength),'');g.scene.updateMatrixWorld(true);
 const blockers=[],signs=[];
 g.scene.traverse(o=>{if(!o.isMesh)return;const n=o.name.replaceAll('_',' ').toLowerCase(),box=new Box3().setFromObject(o),side=(box.min.z+box.max.z)>0?1:-1;
 if(/machón|machon|columna|poste|pilar/.test(n)&&box.max.y>1.8&&Math.abs((box.min.z+box.max.z)/2)>3.5)blockers.push({box,side,name:n});
 if(o.userData.cartel_despejado_revision===24)signs.push({box,side,name:n});});
 for(const {side,x,y,z} of s.geometria_3d.posiciones_carteles_mapa||[]){const m=new Mesh(new PlaneGeometry(1.14,1.52),new MeshBasicMaterial());m.position.set(x,y,z);m.updateMatrixWorld(true);signs.push({box:new Box3().setFromObject(m),side,name:'mapa runtime'});}
 for(const sign of signs)for(const block of blockers){const {box:a,side}=sign,{box:b}=block;if(side===block.side&&overlaps(a,b)&&Math.min(Math.abs(b.min.z),Math.abs(b.max.z))<Math.max(Math.abs(a.min.z),Math.abs(a.max.z)))throw Error(s.id+' '+sign.name+' oculto por '+block.name);}
 results.push({id:s.id,carteles_verificados:signs.length});
}
fs.writeFileSync('dist/docs/Verificacion_carteles24.json',JSON.stringify({verificacion:'Bounding boxes reales del GLTFLoader; proyección frontal. No prueba WebGL.',estaciones:results},null,2));console.log('39 estaciones: '+results.reduce((a,x)=>a+x.carteles_verificados,0)+' piezas de señalización sin obstrucción frontal por soportes.');
