// Realismo 224: caminata ligada a la velocidad, brazos que se balancean, pantalón largo,
// catálogo sin el modelo retirado y pasajeros que no atraviesan muros del andén.
// Pruebas CPU/geometría; la revisión visual se hace en navegador.
import assert from 'node:assert/strict';
import * as T from 'three';
import {createCharacter,poseCharacter} from '../dist/cabin-characters.js';
import {passengerManifest145,PASSENGERS145} from '../dist/passenger-assets145.js';
import {prepareWardrobe} from '../dist/passenger-wardrobe.js';
import {WALK_LANE224,platformWalk} from '../dist/passenger-flow.js';
import {constrainPlatformActors169} from '../dist/platform-collision169.js';

// 1. Esqueleto sintético con los nombres de hueso de los modelos del proyecto.
function rig(){
 const scene=new T.Group(),bone=(name,parent,y=0,x=0)=>{const b=new T.Bone();b.name=name;b.position.set(x,y,0);(parent||scene).add(b);return b;};
 const hips=bone('Hips',null,1),spine=bone('Spine',hips,.1),chest=bone('Chest',spine,.2);bone('Head',chest,.3);
 for(const [side,x] of [['L',.18],['R',-.18]]){const ua=bone('UpperArm_'+side,chest,.2,x),la=bone('LowerArm_'+side,ua,-.28);bone('Hand_'+side,la,-.25);const ul=bone('UpperLeg_'+side,hips,-.05,x/2),ll=bone('LowerLeg_'+side,ul,-.45);bone('Foot_'+side,ll,-.45);}
 const bones=[];scene.traverse(o=>{if(o.isBone)bones.push(o);});
 const g=new T.BoxGeometry(.3,1.7,.2),n=g.attributes.position.count;g.setAttribute('skinIndex',new T.Uint16BufferAttribute(new Uint16Array(n*4),4));g.setAttribute('skinWeight',new T.Float32BufferAttribute(new Float32Array(n*4).map((_,i)=>i%4?0:1),4));
 const mesh=new T.SkinnedMesh(g,new T.MeshStandardMaterial());scene.add(mesh);scene.updateMatrixWorld(true);mesh.bind(new T.Skeleton(bones));
 // Paso de 1 s: las piernas se alternan ±0.4 rad, los brazos quedan fijos como en los clips aportados.
 const q=a=>new T.Quaternion().setFromEuler(new T.Euler(a,0,0)).toArray(),times=[0,.25,.5,.75,1];
 const tracks=[['L',1],['R',-1]].map(([s,k])=>new T.QuaternionKeyframeTrack('UpperLeg_'+s+'.quaternion',times,[0,-.4*k,0,.4*k,0].flatMap(q)));
 return {scene,animations:[new T.AnimationClip('Walk',1,tracks)],name:'prueba224',kind137:'man',imported137:true};
}
const template=rig(),item=createCharacter(template);
const walker=(speed,id='a')=>({id,x:0,y:0,z:0,yaw:0,moving:true,speed,pose:'standing',modelType:'man'});
poseCharacter(item,walker(1.3),0);
const legSwing=()=>item.bones.UpperLeg_L.rotation.x,armSwing=()=>item.bones.UpperArm_L.rotation.x;
let checked=0;for(let t=.05;t<1;t+=.1){poseCharacter(item,walker(1.3),t);const leg=legSwing(),arm=armSwing();if(Math.abs(leg)>.1){assert(Math.sign(arm)===-Math.sign(leg),'Cada brazo se balancea contra la pierna de su lado');checked++;}}
assert(checked>=4,'Se comprobó el balanceo en varias fases');
assert(Math.abs(item.bones.UpperArm_L.rotation.z+.65)<.05,'Al caminar los brazos bajan junto al cuerpo en lugar de quedar abiertos');
// La fase del clip avanza con la distancia: a la mitad de velocidad, la mitad de ciclo por segundo.
const slow=createCharacter(template),fast=createCharacter(template);
poseCharacter(slow,walker(.7,'s'),10);poseCharacter(fast,walker(1.4,'f'),10);
for(let i=1;i<=10;i++){poseCharacter(slow,walker(.7,'s'),10+i*.05);poseCharacter(fast,walker(1.4,'f'),10+i*.05);}
assert(slow.walkTime224-10<fast.walkTime224-10-.1,'Quien camina más lento da pasos más lentos');
const speed=1.4/((fast.walkTime224-10)/.5);
assert(speed>.3&&speed<3,'Velocidad natural del clip medida a partir del pie: '+speed.toFixed(2)+' m/s');

// 2. Pantalón largo en lugar de shorts, con la pierna separada de la piel.
const legs=new T.Mesh(new T.CylinderGeometry(.06,.05,.9).translate(0,.45,0),new T.MeshStandardMaterial({name:'Legs',map:new T.Texture()}));
const shorts=new T.Mesh(new T.BoxGeometry(.3,.3,.2),new T.MeshStandardMaterial({name:'Shorts',map:new T.Texture()}));
const body=new T.Group();body.add(legs,shorts);const before=legs.geometry.attributes.position.array.slice();
const materials=prepareWardrobe(body);
assert(materials.every(m=>m.userData.wardrobeRole==='bottom'&&!m.map),'Piernas y shorts son una sola tela de pantalón');
const after=legs.geometry.attributes.position.array;let lower=0,upper=0;for(let i=0;i<after.length;i+=3){const d=Math.hypot(after[i]-before[i],after[i+2]-before[i+2]);if(before[i+1]<.15)lower=Math.max(lower,d);if(before[i+1]>.6)upper=Math.max(upper,d);}
assert(lower>upper&&upper>=.009,'El pantalón se separa de la pierna y se abre hacia el tobillo');

// 3. Catálogo sin el modelo retirado.
assert(!PASSENGERS145.some(p=>/hitman/.test(p.url)),'El modelo retirado no está en el catálogo base');
const old=passengerManifest145([{name:'pasajero_hitman138',url:'./models/personajes/hitman_walk138.glb.gz',kind137:'man',imported137:true},{name:'hombre_joe137',url:'./models/personajes/joe_walk137.glb.gz'}]);
assert.deepEqual(old.map(r=>r.name),['hombre_joe137'],'Un catálogo antiguo no vuelve a cargar el modelo retirado');

// 4. Andén lateral: el carril de paseo está sobre el andén y los flujos rodean muros y pilares.
assert(WALK_LANE224<=7.40-.30,'El carril de paseo queda delante del muro del fondo');
assert(Math.abs(platformWalk(3,1).offset)<=4,'El paseo sigue siendo de 8 m');
const solids=[{minX:-10,maxX:10,minZ:-8.15,maxZ:-8},{minX:2,maxX:3,minZ:-6.5,maxZ:-5.5},{minX:-3,maxX:-2,minZ:5,maxZ:6}];
const flows=[{id:'f1',flow:'board',location:'platform',x:2.5,z:-6,modelType:'man'},{id:'f2',flow:'board',location:'platform',x:0,z:-8.05,modelType:'woman'},{id:'f3',flow:'board',location:'platform',x:2.5,z:-3,modelType:'man'},{id:'f4',flow:'alight',location:'platform',x:-2.5,z:5.5,modelType:'child'}];
const edge={...flows[2]};
constrainPlatformActors169(flows,0,solids);
for(const a of flows.filter(a=>a.z*a.z>16)){const r=a.modelType==='child'?.16:.22;assert(!solids.some(b=>a.x>b.minX-r+1e-9&&a.x<b.maxX+r-1e-9&&a.z>b.minZ-r+1e-9&&a.z<b.maxZ+r-1e-9),'Flujo '+a.id+' fuera de muros y pilares');assert(Math.abs(a.z)<=7.40-r+1e-9,'Flujo '+a.id+' delante del muro del fondo');}
assert.deepEqual([flows[2].x,flows[2].z],[edge.x,edge.z],'El cruce entre el borde y el vagón no se altera');

console.log('224 PASS: brazos que bajan y se balancean contra las piernas, pasos al ritmo de la velocidad (clip a '+speed.toFixed(2)+' m/s), pantalón largo holgado, catálogo sin el modelo retirado, carril de paseo sobre el andén y flujos que rodean muros y pilares. CPU/geometría.');
