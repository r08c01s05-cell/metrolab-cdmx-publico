import * as THREE from 'three';
// Reflection sources have real spatial extent. These are lighting rigs, not scenery.
export function reflectionScene122(kind='workshop'){
 const scene=new THREE.Scene(),warm=kind==='bench',station=kind==='station';scene.background=new THREE.Color(station?'#242b2e':warm?'#303638':'#30383b');
 const panels=station?[[0,6,0,36,.08,3.5,'#f4f4ec',2.0],[-8,2,0,.08,3,32,'#aebcc0',.7],[8,2,0,.08,3,32,'#d5d4c5',.65],[0,-2,0,40,.08,32,'#303638',.38]]:
 warm?[[0,5,1,5,.08,2.2,'#f4f1e9',2.3],[-4,2,2,.08,3,3,'#e2eaed',1.3],[4,2,1,.08,2.3,2,'#d7e0df',.8],[0,1,5,3,1.5,.08,'#f2eee4',1.0],[0,-2,0,12,.08,12,'#272e30',.35]]:
 [[0,11,0,34,.08,3.5,'#f4f1e9',2.3],[0,10,-9,34,.08,1,'#e6eef0',1.3],[-12,4,0,.08,5,24,'#d1dadc',.85],[12,3,0,.08,4,22,'#e0ded5',.7],[0,-2,0,46,.08,46,'#293335',.32]];
 const geometry=new THREE.BoxGeometry(1,1,1);
 for(const[x,y,z,w,h,d,color,energy]of panels){const m=new THREE.MeshBasicMaterial({color:new THREE.Color(color).multiplyScalar(energy)}),p=new THREE.Mesh(geometry,m);p.position.set(x,y,z);p.scale.set(w,h,d);scene.add(p);}
 scene.userData.dispose122=()=>{geometry.dispose();scene.children.forEach(o=>o.material.dispose());};return scene;
}
