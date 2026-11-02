import * as THREE from 'three';
import {mergeGeometries} from './vendor/BufferGeometryUtils.js';
// Small, reusable geometry additions shared by the GLB bench and its fallback.
function tube(points,r=.004){return new THREE.TubeGeometry(new THREE.CatmullRomCurve3(points.map(p=>new THREE.Vector3(...p))),24,r,6,false);}
function mesh(parent,g,m,name){const o=new THREE.Mesh(g,m);o.name=name;parent.add(o);return o;}
export function detailBench118(rig){
 if(rig.id!=='doors'||rig.detail118)return rig;rig.detail118=true;
 const p=rig.parts,bag=p.obstacle;
 // Dispose only the replaced prop; the rest of the original Blender model remains intact.
 const materials=new Set();for(const o of [...bag.children]){o.traverse(n=>{n.geometry?.dispose();if(n.material)materials.add(n.material);});bag.remove(o);}for(const m of materials)m.dispose();
 const cloth=new THREE.MeshStandardMaterial({name:'Lona tejida118',color:'#bd6736',roughness:.94}),trim=new THREE.MeshStandardMaterial({name:'Costura y correa118',color:'#493c32',roughness:.88});
 const body=new THREE.SphereGeometry(1,32,20),a=body.attributes.position;
 for(let i=0;i<a.count;i++){const x=a.getX(i),y=a.getY(i),z=a.getZ(i),shape=v=>Math.sign(v)*Math.pow(Math.abs(v),.46),fold=Math.sin(y*19+x*13)*.0025+Math.cos(y*27-z*17)*.0015;a.setXYZ(i,shape(x)*.125,shape(y)*.105,shape(z)*.075+fold);}
 body.computeVertexNormals();mesh(bag,body,cloth,'Bolsa de lona atrapada');
 const lines=[];for(const x of[-.078,.078])lines.push(tube([[x,-.085,.055],[x,-.02,.081],[x,.065,.065],[x,.10,0],[x,.085,-.05]],.002));
 lines.push(tube([[-.095,.04,.065],[-.14,.095,.075],[-.13,.17,.045],[-.065,.18,.01],[.015,.12,0]],.009));
 lines.push(tube([[-.105,.065,.055],[0,.09,.068],[.105,.065,.055]],.003));
 mesh(bag,mergeGeometries(lines,false),trim,'Correa y costuras');lines.forEach(g=>g.dispose());
 bag.position.z=.13;rig.homes.set(bag,bag.position.clone());bag.userData.grip118=[-.12,.105,.065];
 const rubber=new THREE.MeshStandardMaterial({name:'Goma de cierre118',color:'#20292c',roughness:.91});
 for(const [key,sign]of[['doorSlideLeft',1],['doorSlideRight',-1]]){const leaf=p[key];const gasket=mesh(leaf,new THREE.BoxGeometry(.028,2.05,.052),rubber,'Junta flexible de cierre');gasket.position.set(sign*.48,-.005,.045);}
 const lampMaterial=new THREE.MeshStandardMaterial({name:'Testigo de guía118',color:'#d88a44',emissive:'#552411',roughness:.35});
 const light=mesh(rig.group,new THREE.CylinderGeometry(.045,.045,.018,20),lampMaterial,'Estado de obstrucción');light.rotation.x=Math.PI/2;light.position.set(.28,2.45,.115);rig.obstructionLamp118=light;
 return rig;
}
export function doorFeedback118(rig,state){const m=rig.obstructionLamp118?.material;if(!m)return;const key=state.obstacle?'blocked':state.complete?'passed':'clear';if(rig.feedback118===key)return;rig.feedback118=key;m.color.set(state.obstacle?'#d88a44':'#8fbda7');m.emissive.set(state.obstacle?'#552411':'#163a2a');}
