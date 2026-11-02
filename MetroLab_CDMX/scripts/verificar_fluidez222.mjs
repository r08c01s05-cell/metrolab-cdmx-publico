// Fluidez 222: esqueletos compartidos por personaje, vidrio en una pasada,
// e histéresis de resolución.
// Pruebas CPU/geometría; no miden FPS de GPU.
import assert from 'node:assert/strict';
import * as T from 'three';
import {cloneCharacter} from '../dist/cabin-characters.js';
import {enhanceMetroMaterials} from '../dist/metro-render.js';
import {RenderBudget101} from '../dist/render-budget101.js';
import {setVisual105} from '../dist/visual-settings105.js?v=105';

// 1. Un esqueleto por personaje cuando las pieles usan los mismos huesos.
function rig(){
 const root=new T.Group(),hip=new T.Bone(),spine=new T.Bone();hip.name='hip';spine.name='spine';hip.add(spine);root.add(hip);
 const bones=[hip,spine],skin=(name,inverses)=>{const g=new T.BoxGeometry(.2,.4,.2);const n=g.attributes.position.count;g.setAttribute('skinIndex',new T.Uint16BufferAttribute(new Uint16Array(n*4),4));g.setAttribute('skinWeight',new T.Float32BufferAttribute(new Float32Array(n*4).map((_,i)=>i%4?0:1),4));const m=new T.SkinnedMesh(g,new T.MeshStandardMaterial());m.name=name;root.add(m);m.bind(new T.Skeleton(bones,inverses),m.matrixWorld);return m;};
 root.updateMatrixWorld(true);const inv=bones.map(b=>b.matrixWorld.clone().invert());
 skin('cuerpo',inv.map(m=>m.clone()));skin('camisa',inv.map(m=>m.clone()));skin('cabello',inv.map(m=>m.clone()));
 const odd=inv.map(m=>m.clone());odd[1].makeTranslation(0,.3,0);skin('accesorio',odd);
 return root;
}
const source=rig(),a=cloneCharacter(source),b=cloneCharacter(source);
const skins=o=>{const s=[];o.traverse(x=>{if(x.isSkinnedMesh)s.push(x);});return s;};
const sa=skins(a),sb=skins(b),ss=skins(source);
assert.equal(new Set(sa.map(m=>m.skeleton)).size,2,'Pieles iguales comparten esqueleto; la de matrices inversas distintas conserva el suyo');
assert.equal(sa[0].skeleton,sa[2].skeleton,'Cuerpo y cabello usan el mismo esqueleto');
assert.notEqual(sa[3].skeleton,sa[0].skeleton,'Una piel con matrices inversas distintas no se mezcla');
const boneSet=new Set();a.traverse(o=>{if(o.isBone)boneSet.add(o);});
for(const m of sa)assert(m.skeleton.bones.every(x=>boneSet.has(x)),'Cada esqueleto apunta a los huesos de su propia copia');
assert(sa.every(m=>sb.every(n=>n.skeleton!==m.skeleton)),'Dos personajes nunca comparten esqueleto ni animación');
assert(sa.every(m=>ss.every(n=>n.skeleton!==m.skeleton)),'La copia no toca el esqueleto de la plantilla');
for(let i=0;i<sa.length;i++)assert(sa[i].bindMatrix.equals(ss[i].bindMatrix),'Se conserva la matriz de enlace de cada pieza');
a.getObjectByName('spine').rotation.z=.4;a.updateMatrixWorld(true);sa[0].skeleton.update();
const shared=sa[0].skeleton.boneMatrices.slice(),own=new T.Skeleton(sa[1].skeleton.bones,ss[1].skeleton.boneInverses);own.update();
assert.deepEqual([...shared],[...own.boneMatrices],'El esqueleto compartido calcula las mismas matrices que uno propio');

// 2. Vidrio delgado del tren en una sola pasada; el resto de materiales intacto.
const train=new T.Group();
for(const name of ['Cristal azul gris transparente','Vidrio testero neutro42','Acero inoxidable cepillado']){const m=new T.Mesh(new T.PlaneGeometry(),new T.MeshStandardMaterial({name,side:T.DoubleSide}));m.name=name;train.add(m);}
enhanceMetroMaterials(train,'NM22');
const mat=n=>train.getObjectByName(n).material;
assert(mat('Cristal azul gris transparente').forceSinglePass&&mat('Cristal azul gris transparente').transparent,'Cristal de puertas en una pasada');
assert(mat('Vidrio testero neutro42').forceSinglePass,'Vidrio de testero en una pasada');
assert(!mat('Acero inoxidable cepillado').forceSinglePass,'Materiales opacos sin cambio');
assert(mat('Cristal azul gris transparente').clone().forceSinglePass,'El ajuste se conserva al clonar el material');

// 3. Resolución adaptativa: sin oscilar cada dos segundos en un equipo al límite de 60 Hz.
setVisual105({quality:'balanced'});
let ratio=1.2,resizes=0;const budget=new RenderBudget101({setPixelRatio(x){ratio=x;resizes++;}});resizes=0;
let now=0;for(let i=0;i<60*120;i++){const cost=18*ratio*ratio;now+=Math.ceil(cost/(1000/60))*(1000/60);budget.allows(now);}
assert(resizes<=20,'Pocos cambios de resolución en dos minutos: '+resizes);
assert(ratio>=.7&&ratio<=1.2,'La resolución sigue dentro del piso y techo del perfil');
let slow=1.2;const heavy=new RenderBudget101({setPixelRatio(x){slow=x;}});for(let i=0;i<400;i++)heavy.allows(i*50);
assert(slow<1&&slow>=.7,'Con gráficos lentos sostenidos sigue bajando la resolución');
let fast=1.2;const light=new RenderBudget101({setPixelRatio(x){fast=x;}});light.ratio=.8;fast=.8;for(let i=0;i<60*20;i++)light.allows(i*1000/60);
assert(fast>.8,'Con margen vuelve a subir la resolución');

console.log(`222 PASS: esqueleto compartido por personaje (${sa.length} pieles, 2 esqueletos), vidrio en una pasada, ${resizes} cambios de resolución en 2 min simulados. CPU/geometría; sin medición de GPU.`);
