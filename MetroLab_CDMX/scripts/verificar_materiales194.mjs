import './verificar_materiales185.mjs';
import assert from 'node:assert/strict';
import * as T from 'three';
import {refineSurfaceMaterials100} from '../dist/visual-quality100.js';
import {industrialFinish176} from '../dist/industrial-finish176.js';
import {surfaceBudget124} from '../dist/surface-finish124.js';
const root=new T.Group();
function add(name){const mesh=new T.Mesh(new T.BoxGeometry(.4,.4,.4),new T.MeshStandardMaterial({name,color:'#818979'}));root.add(mesh);return mesh;}
const paint=add('Chapa galvanizada pintada'),canvas=add('Lona negra tejido bolsa157'),fiber=add('Fibra filtrante plisada142'),seal=add('Sello perimetral filtro142'),label=add('Serigrafia150'),authored=add('Acero satinado propio');
const originalColour=paint.material.color.clone(),rough=new T.DataTexture(new Uint8Array([255,180,255,255]),1,1);rough.needsUpdate=true;authored.material.roughnessMap=rough;authored.material.roughness=.47;
refineSurfaceMaterials100(root);assert.equal(paint.material.userData.realism110,'paint');assert.equal(canvas.material.userData.realism110,'canvas');assert.equal(fiber.material.userData.realism110,'filter');assert.equal(seal.material.userData.realism110,'rubber');assert.equal(label.material.userData.realism110,'label');assert(!label.material.map&&!label.material.normalMap&&!label.material.roughnessMap,'Instrument printing gets no generated grain');assert(paint.material.color.equals(originalColour));
industrialFinish176(root);assert.equal(paint.material.roughness,1,'Generated absolute roughness is not multiplied twice');assert.equal(authored.material.roughness,.47,'Authored map multiplier is retained');assert.equal(authored.material.roughnessMap,rough);const material=paint.material,normal=material.normalScale.clone();industrialFinish176(root);assert.equal(paint.material,material,'Industrial finish reuses prepared materials');assert(paint.material.normalScale.equals(normal),'Repeated finish does not flatten relief again');
for(const mesh of [canvas,fiber]){assert(mesh.material.map&&mesh.material.normalMap&&mesh.material.roughnessMap);assert.equal(mesh.material.normalMap.channel,3);assert(mesh.geometry.attributes.uv3,'World-sized textile detail has its own coordinates');}
assert(surfaceBudget124().bytes<20*1024*1024);console.log('194 PASS: canvas/filter PBR, paint/seal/printing roles, preserved authored roughness, no double roughness multiplier, idempotent industrial finish.',surfaceBudget124());
