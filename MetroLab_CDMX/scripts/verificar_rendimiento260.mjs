// Rendimiento 260 y guardado de instrumentos: bloques estáticos congelados, intervalo de la multitud,
// costado lejano del tren, niveles de pasajeros, reparto de asientos en caché y «Guardar instrumento».
import assert from 'node:assert/strict';import * as THREE from 'three';
import {FREEZE260,freezeStatic260,thawStatic260,PEOPLE260,peopleInterval260,farWallSign260} from '../dist/frame-budget260.js';
import {LOD_DISTANCES221,LOD_FACTORS221,lodTier221} from '../dist/instanced-passengers121.js';
import {roster260} from '../dist/passenger-flow.js';
import {InstrumentPlacement180} from '../dist/instrument-placement180.js';
import {SubstationCarry188} from '../dist/substation-carry188.js';

// Static groups stop recomputing their matrices once settled.
{const infrastructure=new THREE.Group(),stations=new THREE.Group(),scene=new THREE.Scene();scene.add(infrastructure,stations);
 const tunnel=new THREE.Group(),wall=new THREE.Mesh(new THREE.BoxGeometry(),new THREE.MeshBasicMaterial());wall.position.set(5,0,0);tunnel.add(wall);tunnel.position.set(100,0,0);infrastructure.add(tunnel);
 const view={infrastructure,stations};let calls=0;const count=o=>{const f=o.updateMatrix;o.updateMatrix=function(){calls++;return f.call(this);};};count(wall);
 for(let i=0;i<FREEZE260.settleFrames-1;i++){assert.equal(freezeStatic260(view).frozen,0);scene.updateMatrixWorld();}
 assert.equal(freezeStatic260(view).frozen,1,'Se congela tras un rato sin cambios');scene.updateMatrixWorld();assert.equal(wall.matrixWorld.elements[12],105);
 calls=0;for(let i=0;i<20;i++){freezeStatic260(view);scene.updateMatrixWorld();}assert.equal(calls,0,'Congelado: sus piezas ya no se recalculan');
 const late=new THREE.Mesh(new THREE.BoxGeometry(),new THREE.MeshBasicMaterial());late.position.set(1,2,3);tunnel.add(late);scene.updateMatrixWorld();assert.equal(late.matrixWorld.elements[12],101,'Una pieza nueva se coloca en el mismo cuadro');
 infrastructure.position.x=10;scene.updateMatrixWorld();assert.equal(wall.matrixWorld.elements[12],115,'Si el padre se mueve, se recalcula');
 wall.position.x=7;calls=0;for(let i=0;i<FREEZE260.refreshFrames+2;i++)scene.updateMatrixWorld();assert(calls>=1&&wall.matrixWorld.elements[12]===117,'El repaso periódico recoge cambios internos');
 thawStatic260(view);calls=0;scene.updateMatrixWorld();assert.equal(calls,1,'Se puede descongelar');}
// Crowd update interval.
{const view=(mode,d)=>({cameraMode:mode,controls:{target:new THREE.Vector3()},camera:{position:new THREE.Vector3(0,0,d)}});
 assert.equal(peopleInterval260(view('full',40)),PEOPLE260.near);assert.equal(peopleInterval260(view('full',100)),PEOPLE260.mid);assert.equal(peopleInterval260(view('full',200)),PEOPLE260.far);assert.equal(peopleInterval260(view('passenger',200)),PEOPLE260.near,'A pie siempre a ritmo completo');}
// Far wall of a car.
{const group=new THREE.Group(),car=new THREE.Group();assert.equal(farWallSign260(group,car,30),-1,'Cámara en +z: el costado −z queda oculto');assert.equal(farWallSign260(group,car,-30),1);assert.equal(farWallSign260(group,car,3),0,'Cerca del eje no se oculta ninguno');
 group.rotation.y=Math.PI;group.updateMatrix();group.quaternion.setFromEuler(group.rotation);assert.equal(farWallSign260(group,car,30),1,'Con el tren girado se invierte');}
// Passenger tiers.
assert.deepEqual(LOD_DISTANCES221,[22,50,110]);assert.equal(LOD_FACTORS221.length,4);assert.equal(lodTier221(10),0);assert.equal(lodTier221(30),1);assert.equal(lodTier221(70),2);assert.equal(lodTier221(150),3);assert.equal(lodTier221(30,0,1.5),0,'En calidad cinemática los niveles se alejan');assert.equal(lodTier221(23,1),1,'Con histéresis');
// Cached roster.
{const a=roster260('L1-01',40),b=roster260('L1-01',40);assert.equal(a,b,'Mismo tren y carga: no se recalcula');assert.equal(a.length,40);assert.equal(new Set(a.map(p=>p.slot)).size,40);assert.notEqual(roster260('L1-01',41),a);assert(a[0].id.startsWith('inside:L1-01:'));}
// «Guardar instrumento»: placed multimeter goes back to the belt.
{const prepared=new Set(['meter']),instrument={visible:true},msgs=[];const self={bench:{instrument142:instrument,group:{traverse(){}},probes:{},placement180:null},view:{bagBrowser157:{items:new Map([['meter',{visible:false,userData:{outside188:true,outside196:true}}]])}},placed:true,active:false,pending:false,button:{textContent:'Mover instrumento',disabled:false},
  ui:{carry188:{enabled:false},play135:{bag156:{prepared176:prepared}},state:{leads:{red:'a',black:null},tool:'meter',choose(t){this.tool=t;}},render(){}},message:t=>msgs.push(t),cancel(){}};self.bench.placement180=self;
 assert.equal(InstrumentPlacement180.prototype.store260.call(self),false,'Con puntas conectadas no se guarda');assert(/puntas/.test(msgs.at(-1))&&prepared.has('meter'));
 self.ui.state.leads.red=null;assert.equal(InstrumentPlacement180.prototype.store260.call(self),true);assert(!prepared.has('meter')&&!self.placed&&!instrument.visible&&self.ui.state.tool==='hand'&&self.button.disabled,'Instrumento fuera de la escena y de vuelta en el portaherramientas');
 const item=self.view.bagBrowser157.items.get('meter');assert(item.visible&&!item.userData.outside188&&!item.userData.outside196);assert.equal(InstrumentPlacement180.prototype.store260.call(self),false,'Sin instrumento fuera no hace nada');}
// Anemometer left resting is stored too, even while a measurement is running.
{const prepared=new Set(['meter']),o={visible:true,position:new THREE.Vector3(),quaternion:new THREE.Quaternion()};let ended=0,synced=null;
 const self={held:null,instrumentPlaced:true,sampling:{},bench:{instrument142:o},view:{bagBrowser157:{items:new Map()}},endSample(){ended++;this.sampling=null;},message(){},
  ui:{placement180:{placed:true},play135:{bag156:{prepared176:prepared,sync:id=>{synced=id;}}},state:{choose(){}}}};
 assert.equal(SubstationCarry188.prototype.storeInstrument238.call(self),true);assert(ended===1&&!self.instrumentPlaced&&!o.visible&&!prepared.has('meter')&&synced==='hand'&&!self.ui.placement180.placed);
 assert.equal(SubstationCarry188.prototype.storeInstrument238.call(self),false);self.held={kind:'filter'};assert.equal(SubstationCarry188.prototype.storeInstrument238.call(self),false,'El filtro no es un instrumento');}
console.log('260 PASS: bloques estáticos congelados con repaso, multitud a menor ritmo de lejos, costado lejano del tren, 4 niveles de pasajeros por calidad, asientos en caché y «Guardar instrumento» para multímetro y anemómetro apoyados.');
