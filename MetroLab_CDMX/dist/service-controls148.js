import * as THREE from 'three';
export function serviceControls148(bench,id){
 if(!['control','battery'].includes(id))return bench;const device=bench.instrument142;
 if(id==='battery'){let measure;device?.traverse(o=>{if(o.userData.instrumentControl142==='measure')measure=o;});if(!measure)throw Error('Falta el botón de medida');measure.userData.srTarget128='measure';bench.targets.set('measure',measure);}
 const release=new THREE.Group();release.name='Recoger puntas148';release.position.set(0,-.41,.12);release.userData.srTarget128='release';device.add(release);release.add(new THREE.Mesh(new THREE.BoxGeometry(.26,.055,.018),new THREE.MeshStandardMaterial({color:'#435c5a',roughness:.6})));bench.targets.set('release',release);
 const lever=bench.targets.get('isolator148');if(!lever)throw Error('Falta S1 del banco');const apply=bench.apply;bench.apply=(state,result)=>{apply(state,result);if(result?.ok)lever.traverse(o=>{if(o.userData.isolatorLever148)o.rotation.z=state.load148?-.6:.6;});};return bench;
}
