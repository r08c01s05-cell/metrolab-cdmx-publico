import fs from 'node:fs';
import {GLTFLoader} from '../dist/vendor/GLTFLoader.js';
import {Vector3,Raycaster,Box3,Mesh,PlaneGeometry,MeshBasicMaterial} from 'three';
import './node-textures40.mjs';
globalThis.self=globalThis;globalThis.ProgressEvent=class {constructor(t,p){Object.assign(this,p)}};
let checked=0;const results=[];
for(const s of JSON.parse(fs.readFileSync('dist/datos.json')).estaciones){
 const b=fs.readFileSync('dist/'+s.geometria_3d.url_glb.split('?')[0]);const g=await new GLTFLoader().parseAsync(b.buffer.slice(b.byteOffset,b.byteOffset+b.byteLength),'');
 for(const p of s.geometria_3d.posiciones_carteles_mapa||[]){const m=new Mesh(new PlaneGeometry(1.14,1.52),new MeshBasicMaterial({side:2}));m.name='Cartel_mapa_runtime48';m.position.set(p.x,p.y,p.z);g.scene.add(m);}
 g.scene.updateMatrixWorld(true);const signs=[];g.scene.traverse(o=>{if(o.isMesh&&/^(Cartel_mapa|Panel_publicidad_disponible|Pictograma)/.test(o.name))signs.push(o)});
 for(const sign of signs){const box=new Box3().setFromObject(sign),c=box.getCenter(new Vector3()),side=Math.sign(c.z);for(const f of [-.30,0,.30]){const x=c.x+(box.max.x-box.min.x)*f;const ray=new Raycaster(new Vector3(x,c.y,side*3.8),new Vector3(0,0,side),0,5);const hits=ray.intersectObject(g.scene,true);if(hits[0]?.object!==sign)throw Error(s.id+' cartel oculto: '+sign.name+' por '+hits[0]?.object.name);checked++;}}
 results.push({id:s.id,carteles_visibles:signs.length});
}
fs.writeFileSync('dist/docs/Verificacion_carteles48.json',JSON.stringify({metodo:'Raycast frontal real Three.js en tres puntos por cartel; sin prueba WebGL.',puntos:checked,estaciones:results},null,2));console.log(checked+' puntos de carteles y pictogramas visibles, sin pared/marco/columna por delante.');
