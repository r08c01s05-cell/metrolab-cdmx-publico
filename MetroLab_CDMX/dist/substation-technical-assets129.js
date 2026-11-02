import {drawInstrument146} from './instrument-readout146.js?v=148';
import {technicalMotion145} from './service-motion145.js?v=188';
import {ProbeMotion143,probeParking143,probeContact143,probeTail143} from './measurement-probes143.js?v=143';
import {upgradeTechnical142} from './instruments142.js?v=205';
import {updateCable142} from './flexible-cable142.js?v=142';
import {houseSubstation138} from './equipment-housing138.js?v=205';
import {refineSurfaceMaterials100} from './visual-quality100.js?v=205';
import * as THREE from 'three';
import {GLTFLoader} from './vendor/GLTFLoader.js';
const cache=new Map();
export async function loadTechnicalBench129(id){
 if(!['diodes','insulation','relay'].includes(id))throw Error('Banco desconocido');
 if(!cache.has(id))cache.set(id,(async()=>{const r=await fetch('./models/revision150/'+id+'150.glb.gz?v=150');if(!r.ok)throw Error('No se pudo cargar el banco Blender');return new Response(r.body.pipeThrough(new DecompressionStream('gzip'))).arrayBuffer();})().catch(e=>{cache.delete(id);throw e;}));
 const gltf=await new GLTFLoader().parseAsync((await cache.get(id)).slice(0),''),group=gltf.scene,targets=new Map(),probes={},homes={},lines=new Map(),created=[];let display,dial,armature;
 group.traverse(o=>{if(o.userData.srTarget128)targets.set(o.userData.srTarget128,o);if(o.name==='sr129_redProbe')probes.red=o;if(o.name==='sr129_blackProbe')probes.black=o;if(o.name==='sr129_display')display=o;if(o.name==='sr129_armature')armature=o;if(o.name==='sr129_staticDisplay')o.visible=false;});
 if(!display||!probes.red||!probes.black||!targets.has('measure'))throw Error('GLB incompleto');
 const originalMaterials=new Set();group.traverse(o=>{if(o.isMesh)for(const m of(Array.isArray(o.material)?o.material:[o.material]))originalMaterials.add(m);});refineSurfaceMaterials100(group);group.updateMatrixWorld(true);for(const color of['red','black'])homes[color]=probes[color].position.clone();dial=targets.get('dial');const dialHome=dial.quaternion.clone(),armHome=armature?.quaternion.clone();
 let ctx,texture,screen;
 if(typeof document!=='undefined'&&document.createElement){const canvas=document.createElement('canvas');canvas.width=512;canvas.height=200;ctx=canvas.getContext('2d');if(ctx){texture=new THREE.CanvasTexture(canvas);texture.colorSpace=THREE.SRGBColorSpace;texture.minFilter=THREE.LinearFilter;const mat=new THREE.MeshBasicMaterial({map:texture,toneMapped:false}),geo=new THREE.PlaneGeometry(.39,.15);screen=new THREE.Mesh(geo,mat);screen.rotation.y=Math.PI;display.add(screen);created.push(mat,geo,texture);}}
 let reading='—';function lcd(value){if(value===reading&&texture)return;reading=value;if(!ctx)return;drawInstrument146(ctx,512,200,value,id==='insulation'?'megohm':'dmm');texture.needsUpdate=true;}
 function cables(){group.updateMatrixWorld(true);for(const color of['red','black']){let line=lines.get(color);if(!line){line=new THREE.Mesh(new THREE.BufferGeometry(),new THREE.MeshStandardMaterial({color:color==='red'?'#a83228':'#151c20',roughness:.8}));line.name='Cable_'+color;line.raycast=()=>{};group.add(line);lines.set(color,line);}const port=group.getObjectByName('sr129_'+color+'Port'),a=port.getWorldPosition(new THREE.Vector3()),b=probeTail143(probes[color]),mid=a.clone().lerp(b,.5).add(new THREE.Vector3(0,-.23,-.11)),inv=group.matrixWorld.clone().invert();updateCable142(line,[a,mid,b].map(p=>p.applyMatrix4(inv)),{radius:.0025});}}

 let motions143,meter143;
 function initialiseProbes143(meter){meter143=meter;motions143={};for(const colour of ['red','black']){const probe=probes[colour];motions143[colour]=new ProbeMotion143(probe);motions143[colour].set(probeParking143(meter,colour),{immediate:true});probe.userData.srProbe143=colour;homes[colour]=probe.position.clone();}cables();}
 function syncProbes(state){if(!motions143)return;for(const colour of ['red','black']){const target=targets.get(state.leads[colour]);motions143[colour].set(target?probeContact143(target,colour,-1):probeParking143(meter143,colour),{connected:!!target});}cables();}

 function apply(state,result){if(!result?.ok)return;if(['red','black','release'].includes(result.effect))syncProbes(state);if(result.effect==='mode'){dial.quaternion.copy(dialHome).multiply(new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(0,0,1),Math.PI/3));}if(result.effect==='restoreInsulation150')targets.get('sample')?.traverse(o=>{if(o.userData.fault148&&result.complete)o.visible=false;});if(result.effect==='replace'){const part=targets.get(id==='diodes'?'module':id==='insulation'?'sample':'relay');part.traverse(o=>{if(o.userData.fault148)o.visible=false;if(o.isMesh){const m=o.material.clone();m.color.lerp(new THREE.Color('#77a390'),.22);o.material=m;}});part.userData.replaced129=true;}if(result.effect==='command'||result.effect==='technicalDone'){if(armature){armature.quaternion.copy(armHome);if(state.commanded)armature.rotateZ(.3);}}lcd(state.reading);}
 function update135(dt){let moved=false;for(const motion of Object.values(motions143||{}))moved=motion.update(dt)||moved;if(moved)cables();}

 lcd('—');cables();const bench={group,installed150:true,targets,probes,refreshCables142:cables,get probeMotions143(){return motions143;},initialiseProbes143,get reading(){return reading;},apply,update:update135,dispose(){for(const line of lines.values()){line.geometry.dispose();line.material.dispose();}group.traverse(o=>{if(o.isMesh){o.geometry.dispose();for(const m of(Array.isArray(o.material)?o.material:[o.material])){for(const key of['map','roughnessMap','metalnessMap','normalMap'])if(m[key]&&!m[key].userData.quality100Shared)m[key].dispose();m.dispose();}}});for(const m of originalMaterials)m.dispose();for(const obj of created)obj.dispose();group.removeFromParent();}};return technicalMotion145(await upgradeTechnical142(await houseSubstation138(bench,'tech_'+id),id),id);
}
