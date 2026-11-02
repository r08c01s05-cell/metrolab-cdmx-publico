import fs from 'node:fs';
import {GLTFLoader} from '../dist/vendor/GLTFLoader.js';
import {Box3,Vector3} from 'three';
import {batchStationModel} from '../dist/station-assets.js';
globalThis.self=globalThis;globalThis.createImageBitmap=async()=>({width:1,height:1,close(){}});globalThis.ProgressEvent=class {constructor(type,properties){Object.assign(this,properties);}};
const data=JSON.parse(fs.readFileSync('dist/datos.json')),report=[];
for(const s of data.estaciones.filter(s=>[1,8].includes(s.linea))){
 const b=fs.readFileSync('dist/'+s.geometria_3d.url_glb.split('?')[0]),loader=new GLTFLoader();const g=await loader.parseAsync(b.buffer.slice(b.byteOffset,b.byteOffset+b.byteLength),'');
 let icons=0,maps=0,tracks=0;g.scene.traverse(o=>{if(o.name.startsWith('Pictograma'))icons++;if(o.name.startsWith('Cartel_mapa')||o.name.startsWith('Cartel mapa'))maps++;if(o.userData.componente==='via')tracks++;});
 const model=batchStationModel(g.scene),bb=new Box3().setFromObject(model),size=bb.getSize(new Vector3());if(![size.x,size.y,size.z].every(Number.isFinite)||size.x<149||(s.linea===1&&(icons!==8||maps!==4))||tracks<100)throw Error('Invalid model '+s.id+JSON.stringify({icons,maps,tracks,size}));
 report.push({id:s.id,icons,maps,tracks,batches:model.children.length,dimensions:size.toArray()});
}
fs.writeFileSync('dist/docs/Verificacion_estaciones_23.json',JSON.stringify({loader:'Three.js GLTFLoader real; decodificación de imagen simulada en Node; no prueba WebGL',models:report},null,2));console.log(JSON.stringify(report));
