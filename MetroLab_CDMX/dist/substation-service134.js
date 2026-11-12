import {crossflowVentilation230} from './crossflow230.js?v=231';
import {ventilationInterior202} from './ventilation-interior202.js?v=204';
import {serviceControls148} from './service-controls148.js?v=148';
import {drawInstrument146} from './instrument-readout146.js?v=148';
import {serviceMotion145} from './service-motion145.js?v=188';
import {serviceMeasurement143} from './service-measurement143.js?v=264';
import {upgradeService142} from './instruments142.js?v=264';
import {houseSubstation138} from './equipment-housing138.js?v=264';
import * as THREE from 'three';
import {GLTFLoader} from './vendor/GLTFLoader.js';
import {refineSurfaceMaterials100} from './visual-quality100.js?v=264';
const cache=new Map();
// The mounted asset retired its test panel. Keep a real, fixed sheet under
// the four fasteners, with separate openings for the removable filter and fan.
function ventilationFrame196(group,targets){
 const outline=new THREE.Shape();outline.moveTo(-.77,-.60);outline.lineTo(.77,-.60);outline.lineTo(.77,.43);outline.lineTo(-.77,.43);outline.closePath();
 const opening=new THREE.Path();opening.moveTo(-.556,-.215);opening.lineTo(-.556,.335);opening.lineTo(.556,.335);opening.lineTo(.556,-.215);opening.closePath();outline.holes.push(opening);
 const fanHole=new THREE.Path();fanHole.absarc(0,-.37,.135,0,Math.PI*2,true);outline.holes.push(fanHole);
 const material=new THREE.MeshStandardMaterial({name:'Chapa fija de soporte del filtro196',color:'#899698',metalness:.72,roughness:.58});
 const plate=new THREE.Mesh(new THREE.ExtrudeGeometry(outline,{depth:.026,bevelEnabled:true,bevelThickness:.001,bevelSize:.001,bevelSegments:2,curveSegments:32}),material);plate.name='Placa fija con aberturas de filtro y ventilación196';plate.position.z=-.067;plate.userData.fastenerSupport196=true;plate.castShadow=true;plate.receiveShadow=true;group.add(plate);
 const shaftMaterial=new THREE.MeshStandardMaterial({name:'Acero roscado de fijación196',color:'#a6b1b2',metalness:.8,roughness:.42}),shaftGeometry=new THREE.CylinderGeometry(.0085,.0085,.065,20),threadGeometry=new THREE.TorusGeometry(.009,.0008,4,20);
 for(const key of ['screwL','screwR','screw3','screw4']){const target=targets.get(key);if(!target)continue;target.userData.support196=plate.name;const shaft=new THREE.Mesh(shaftGeometry,shaftMaterial);shaft.name='Vástago cautivo apoyado en la brida196';shaft.rotation.x=Math.PI/2;shaft.position.z=.032;target.add(shaft);const thread=new THREE.InstancedMesh(threadGeometry,shaftMaterial,9),pose=new THREE.Matrix4();for(let i=0;i<9;i++)thread.setMatrixAt(i,pose.makeTranslation(0,0,.008+i*.006));thread.name='Rosca ilustrativa del tornillo cautivo196';target.add(thread);}
 return plate;
}
export async function loadServiceBench134(id){
 if(!['ventilation','control','battery'].includes(id))throw Error('Práctica no disponible');
 if(!cache.has(id))cache.set(id,(async()=>{const r=await fetch('./models/revision150/'+id+'150.glb.gz?v=150');if(!r.ok)throw Error('Banco Blender '+r.status);return new Response(r.body.pipeThrough(new DecompressionStream('gzip'))).arrayBuffer();})().catch(e=>{cache.delete(id);throw e;}));
 const gltf=await new GLTFLoader().parseAsync((await cache.get(id)).slice(0),''),group=gltf.scene,targets=new Map(),dust=[],indicators=[],fuseLeaves=[];let rotor,display;group.traverse(o=>{if(o.userData.serviceCable146)o.raycast=()=>{};if(o.userData.srTarget128)targets.set(o.userData.srTarget128,o);if(o.name.startsWith('sr134_dust'))dust.push(o);if(o.isMesh&&o.name.startsWith('sr134_indicator'))indicators.push(o);if(o.name==='sr134_fuseLeaf')fuseLeaves.push(o);if(o.name==='sr134_meterDisplay')display=o;if(o.name==='sr134_rotor')rotor=o;});if(id==='ventilation')ventilationFrame196(group,targets);refineSurfaceMaterials100(group);group.userData.asset134=true;const home=new Map([...targets].map(([k,v])=>[k,v.position.clone()]));let spinning=false,screen,texture,ctx;if(display&&globalThis.document?.createElement){const canvas=document.createElement('canvas');canvas.width=512;canvas.height=256;ctx=canvas.getContext('2d');if(ctx?.fillText){texture=new THREE.CanvasTexture(canvas);texture.colorSpace=THREE.SRGBColorSpace;const mat=new THREE.MeshBasicMaterial({map:texture,toneMapped:false});screen=new THREE.Mesh(new THREE.PlaneGeometry(.265,.14),mat);screen.rotation.y=Math.PI;screen.position.z=-.005;screen.raycast=()=>{};display.add(screen);}}
 function lcd(value){if(!ctx?.fillText)return;drawInstrument146(ctx,512,256,value,id==='ventilation'?'anemometer':'dmm');texture.needsUpdate=true;}lcd('—');
 function apply(state,result){if(!result?.ok)return;lcd(state.reading);const e=result.effect,filter=targets.get('filter');if(e==='remove'&&filter)filter.userData.destination134=home.get('filter').clone().add(new THREE.Vector3(.50,-.28,-.30));if(e==='install'&&filter)filter.userData.destination134=home.get('filter').clone();
  if(e.startsWith('clean'))for(const d of dust){let parent=d;while(parent&&!parent.userData.srTarget128)parent=parent.parent;if(e==='clean'||e==='cleanL'&&parent?.userData.srTarget128==='terminalL'||e==='cleanR'&&parent?.userData.srTarget128==='terminalR')d.scale.setScalar(Math.max(.001,1-result.partial));}
  const key=({loosenL:'screwL',loosenR:'screwR',loosen3:'screw3',loosen4:'screw4',tightenL:id==='battery'?'terminalL':'screwL',tightenR:id==='battery'?'terminalR':'screwR',tighten3:'screw3',tighten4:'screw4'})[e];if(key&&targets.has(key)){const screw=targets.get(key);screw.userData.turn134=(e.startsWith('loosen')?-1:1)*Math.PI*2;if(id==='ventilation')screw.userData.destination134=home.get(key).clone().add(new THREE.Vector3(0,0,e.startsWith('loosen')?-.045:0));}
  if(e==='open')for(const f of fuseLeaves)f.position.z=-.15;if(e==='close')for(const f of fuseLeaves)f.position.z=0;
  if(e==='replace')for(const f of fuseLeaves){f.userData.replaced134=true;f.traverse(o=>{if(o.isMesh&&o.name.startsWith('Cartucho')){o.material=o.material.clone();o.material.color.set('#c4c8b7');}});}
  if(e==='test'){spinning=true;for(const o of indicators){o.material=o.material.clone();o.material.color.set('#458d5c');o.material.emissive.set('#14451e');o.material.emissiveIntensity=.4;}}
 }
 function update(dt){for(const g of targets.values()){if(g.userData.destination134)g.position.lerp(g.userData.destination134,1-Math.exp(-12*dt));const turn=g.userData.turn134||0;if(Math.abs(turn)>.002){const delta=turn*(1-Math.exp(-12*dt));g.rotation.z+=delta;g.userData.turn134-=delta;}}if(spinning&&rotor)rotor.rotation.z+=dt*11;}
 const bench={group,installed150:true,targets,homes136:home,apply,update,dispose(){const gs=new Set(),ms=new Set();group.traverse(o=>{if(o.geometry)gs.add(o.geometry);for(const m of(o.material?(Array.isArray(o.material)?o.material:[o.material]):[]))ms.add(m);});for(const g of gs)g.dispose();for(const m of ms){for(const k of['map','normalMap','roughnessMap'])if(m[k]&&!m[k].userData.quality100Shared)m[k].dispose();m.dispose();}group.removeFromParent();}};const ready=serviceControls148(serviceMotion145(await serviceMeasurement143(await upgradeService142(await houseSubstation138(bench,'sr_'+id),id),id),id),id);return id==='ventilation'?crossflowVentilation230(ventilationInterior202(ready)):ready;
}
