// Prueba portable de la geometría actual. No requiere commits históricos ausentes
// del ZIP. La comparación binaria anterior sigue en verificar_frente198.mjs.
import './node-textures40.mjs';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {gunzipSync} from 'node:zlib';
import * as T from 'three';
import {GLTFLoader} from '../dist/vendor/GLTFLoader.js';
import {packCars} from '../dist/depot86.js';

const raw=gunzipSync(fs.readFileSync('dist/models/MP82_cabina.glb.gz'));
const doc=JSON.parse(raw.subarray(20,20+raw.readUInt32LE(12)));
assert.equal(doc.asset.frontRepaired198,true,'MP82 conserva la reparación del frente');
assert(doc.meshes.length&&doc.materials.length&&doc.nodes.length,'Modelo completo');
const parsed=await new GLTFLoader().parseAsync(raw.buffer.slice(raw.byteOffset,raw.byteOffset+raw.byteLength),'');
const source=parsed.scene;source.updateMatrixWorld(true);
const glass=source.getObjectByName('Frente_parabrisas_unico201');assert(glass,'Existe parabrisas frontal');
const center=new T.Box3().setFromObject(glass).getCenter(new T.Vector3());
assert(center.x>7.9,'El parabrisas está en el extremo de cabina +X');
const cab=source.getObjectByName('Cabina_clasica147');assert(cab,'Existe cabina');
assert(cab.getWorldPosition(new T.Vector3()).x>0,'Cabina en el extremo correcto');
const lower=source.getObjectByName('Frente_panel_inferior201');assert(lower,'Existe cierre inferior');
const lowerPoint=new T.Box3().setFromObject(lower).getCenter(new T.Vector3());
assert(new T.Raycaster(lowerPoint.clone().add(new T.Vector3(1,0,0)),new T.Vector3(-1,0,0)).intersectObject(lower).length,'El frente inferior cierra la carrocería');
const optics=[];let ribs=0;source.traverse(o=>{if(o.name.startsWith('Frente_optica_circular201_'))optics.push(o);if(o.name.startsWith('Techo_nervadura201_'))ribs++;});assert.equal(optics.length,4,'Cuatro ópticas redondas');assert.equal(ribs,9,'Nueve nervaduras de techo');assert(source.getObjectByName('Frente_numero_386201'),'Rotulación conservada');
const first=24,length=16.7,convoy=packCars(source,2,'MP82',first,length,true);convoy.updateMatrixWorld(true);
const bounds=new T.Box3().setFromObject(source),c=bounds.getCenter(new T.Vector3());
const normalize=new T.Matrix4().makeRotationY(-Math.PI/2).multiply(new T.Matrix4().makeTranslation(-c.x,-bounds.min.y,-c.z));
const front=center.clone().applyMatrix4(normalize);
for(const end of[0,1]){
 const point=front.clone();if(end)point.applyAxisAngle(new T.Vector3(0,1,0),Math.PI);
 point.z+=first-(end?8:0)*length;
 assert(end?point.z<first-8*length-7.9:point.z>first+7.9,'Frente hacia fuera del convoy');
 const origin=point.clone().add(new T.Vector3(0,0,end?-3:3));
 const hits=new T.Raycaster(origin,new T.Vector3(0,0,end?1:-1)).intersectObject(convoy,true);
 assert(hits.some(h=>h.instanceId===end&&h.point.distanceTo(point)<.12),'El rayo alcanza el parabrisas del extremo '+end);
}
console.log('PASS frente portable: cierre MP82, cabina +X y parabrisas exteriores en ambos extremos. La comparación con un binario histórico no se ejecuta sin su historial.');
