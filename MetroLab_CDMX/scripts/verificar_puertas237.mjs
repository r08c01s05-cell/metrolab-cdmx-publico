// Puertas de bolsillo 237: al abrir, la hoja se guarda tras el marco y no se dibuja sobre las
// ventanas; el corte sigue al vagón y los materiales originales vuelven al cerrar.
import assert from 'node:assert/strict';
import * as T from 'three';
import {pocketLeaf237,leafKey237} from '../dist/door-pocket237.js';

const shared=new T.MeshStandardMaterial(),frame=new T.Mesh(new T.BoxGeometry(.1,2,.1),shared);
const leaf=[new T.Mesh(new T.BoxGeometry(.6,1.9,.04),shared),new T.Mesh(new T.BoxGeometry(.4,.6,.02),shared)];leaf[0].name='Puerta_S1_2_Hoja_1_Panel';leaf[1].name='Puerta_S1_2_Hoja_1_Vidrio';
const group=new T.Group();group.add(frame,...leaf);leaf.forEach(o=>o.position.set(.3,1,1.3));group.updateMatrixWorld(true);
assert.equal(leafKey237(leaf[0]),'Puerta_S1_2_Hoja_1');assert.equal(leafKey237(leaf[1]),'Puerta_S1_2_Hoja_1','Vidrio y panel son la misma hoja');assert.equal(leafKey237(frame),null);
const box=new T.Box3();leaf.forEach(o=>box.union(new T.Box3().setFromObject(o)));
const pocket=pocketLeaf237(leaf,box,new T.Vector3(1,0,0)),plane=pocket.plane;
assert(leaf.every(o=>o.material!==shared&&o.material.clippingPlanes[0]===plane),'Cada pieza de la hoja recibe su propio material con el corte');
assert.equal(frame.material,shared,'El marco y el resto del vagón no se tocan');
assert(plane.distanceToPoint(new T.Vector3(.3,1,1.3))>0,'Con la puerta cerrada la hoja se ve completa');
assert(plane.distanceToPoint(new T.Vector3(.59,1,1.3))>0&&plane.distanceToPoint(new T.Vector3(.65,1,1.3))<0,'Lo que pasa del marco (x = 0.6 m) queda dentro del bolsillo');
pocket.follow(new T.Vector3(2,0,0));assert(plane.distanceToPoint(new T.Vector3(2.55,1,1.3))>0&&plane.distanceToPoint(new T.Vector3(2.65,1,1.3))<0,'El marco se mueve con el vagón');
const other=pocketLeaf237([new T.Mesh(new T.BoxGeometry(.6,1.9,.04),new T.MeshStandardMaterial())],new T.Box3(new T.Vector3(-.6,0,1.28),new T.Vector3(0,2,1.32)),new T.Vector3(-1,0,0));
assert(other.plane.distanceToPoint(new T.Vector3(-.55,1,1.3))>0&&other.plane.distanceToPoint(new T.Vector3(-.65,1,1.3))<0,'La hoja contraria se guarda hacia su lado');
pocket.restore();assert(leaf.every(o=>o.material===shared),'Al terminar vuelven los materiales originales');
console.log('237 PASS: hojas de puerta que entran al bolsillo tras el marco en vez de cubrir las ventanas, por hoja (panel y vidrio), siguiendo al vagón y restaurando materiales.');
