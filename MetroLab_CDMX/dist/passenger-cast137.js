import * as THREE from 'three';

export function passengerKind137(actor,hash){
 if(actor.modelType==='child')return 'child';
 if(actor.carryingBaby)return 'parent';
 const student=((hash>>>6)%3)===0;
 return (student?'student-':'')+(actor.modelType==='woman'?'woman':'man');
}

export function selectPassenger137(templates,actor,hash){
 const kind=passengerKind137(actor,hash),choices=templates.filter(t=>t.kind137===kind);
 if(choices.length)return choices[hash%choices.length];
 // A pending student asset can use its adult counterpart without crossing
 // between children, adults and parents carrying an infant.
 const fallback=templates.filter(t=>t.kind137===kind.replace('student-',''));
 return fallback.length?fallback[hash%fallback.length]:null;
}

export function prepareImported137(template,record){
 template.imported137=Boolean(record.imported137);template.kind137=record.kind137;
 template.student137=Boolean(record.student137);
 template.carryingInfant138=Boolean(record.infant138);
 if(!template.imported137)return;
 // These imports keep their authored surfaces; distant crowds are baked and
 // simplified separately. Retired source LOD tags must not hide their hair.
 template.scene.traverse(o=>{delete o.userData.crowdLOD119;});
 template.walkDuration137=template.animations.find(a=>a.name==='Walk')?.duration||1;
 // Provide a real idle clip so walking can fade out rather than snapping back
 // to the bind pose. Every clone still owns its mixer and skeleton.
 const tracks=[];
 template.scene.traverse(o=>{if(!o.isBone)return;const q=o.quaternion.clone();
 if(/^UpperArm_/.test(o.name))q.setFromEuler(new THREE.Euler(0,0,(o.name.endsWith('L')?-1:1)*(template.newFemale119?1.3:.58)));
  tracks.push(new THREE.QuaternionKeyframeTrack(o.name+'.quaternion',[0,1],[...q.toArray(),...q.toArray()]));
  tracks.push(new THREE.VectorKeyframeTrack(o.name+'.position',[0,1],[...o.position.toArray(),...o.position.toArray()]));
 });
 template.animations=[...template.animations.filter(a=>a.name!=='Idle'),new THREE.AnimationClip('Idle',1,tracks)];
 if(record.student137)addStudentBackpack137(template.scene);
}

export function attachInfant138(template,infant){
 let chest;template.scene.traverse(o=>{if(o.isBone&&o.name==='Chest')chest=o;});if(!chest)return;
 infant.traverse(o=>{
  if(o.isBone){
   if(o.name==='Head')o.scale.setScalar(1.4);
   if(/^UpperArm_/.test(o.name))o.rotation.z=(o.name.endsWith('L')?-1:1)*1.3;
   if(/^UpperLeg_/.test(o.name)){o.rotation.x=-.4;o.scale.y=.7;}
   if(/^LowerLeg_/.test(o.name)){o.rotation.x=.7;o.scale.y=.8;}
  }
  if(o.isMesh){const aliases={shirt:'kidshirt',pants:'kidpants',shoe:'kidshoe'};const clone=m=>{if(!aliases[m.name])return m;const copy=m.clone();copy.name=aliases[m.name];return copy;};o.material=Array.isArray(o.material)?o.material.map(clone):clone(o.material);}
  o.name='Infant_'+o.name;
 });
 infant.name='Infant_carried138';infant.scale.setScalar(.28);infant.position.set(0,-.30,.27);chest.add(infant);
}

function roundedBox(w,h,d,r=.035){
 const g=new THREE.BoxGeometry(w,h,d,4,4,4),p=g.attributes.position,inner=new THREE.Vector3(w/2-r,h/2-r,d/2-r),v=new THREE.Vector3(),clamped=new THREE.Vector3();
 for(let i=0;i<p.count;i++){v.fromBufferAttribute(p,i);clamped.copy(v).clamp(inner.clone().negate(),inner);v.sub(clamped).normalize().multiplyScalar(r).add(clamped);p.setXYZ(i,...v.toArray());}g.computeVertexNormals();return g;
}
export function addStudentBackpack137(scene){
 let chest,shoulder;scene.traverse(o=>{if(o.isBone&&o.name==='Chest')chest=o;if(o.isBone&&o.name==='UpperArm_L')shoulder=o;});if(!chest)return;
 const bag=new THREE.Group();bag.name='Mochila_estudiante137';chest.add(bag);
 scene.updateMatrixWorld(true);
 const chestPoint=chest.getWorldPosition(new THREE.Vector3()),shoulderPoint=shoulder?.getWorldPosition(new THREE.Vector3());
 bag.position.y=(shoulderPoint?shoulderPoint.y-chestPoint.y:.12)-.17;
 const fabric=new THREE.MeshStandardMaterial({color:'#457a89',roughness:.9});fabric.name='pack';
 const pocket=fabric.clone();pocket.name='pack2';pocket.color.multiplyScalar(.72);
 const strap=new THREE.MeshStandardMaterial({color:'#343d48',roughness:.85});strap.name='strap';
 const trim=new THREE.MeshStandardMaterial({color:'#d6b875',roughness:.55,metalness:.15});trim.name='trim';
 const add=(name,g,m,x,y,z)=>{const mesh=new THREE.Mesh(g,m);mesh.name=name;mesh.position.set(x,y,z);mesh.castShadow=true;bag.add(mesh);return mesh;};
 add('Mochila_cuerpo137',roundedBox(.255,.34,.125),fabric,0,-.025,-.175);
 add('Mochila_bolsillo137',roundedBox(.196,.13,.045,.017),pocket,0,-.1,-.253);
 add('Mochila_cierre137',roundedBox(.12,.009,.01,.003),trim,0,-.043,-.278);
 for(const sign of [-1,1]){
  const curve=new THREE.CatmullRomCurve3([new THREE.Vector3(sign*.09,.13,-.18),new THREE.Vector3(sign*.126,.19,-.04),new THREE.Vector3(sign*.13,.12,.095),new THREE.Vector3(sign*.114,-.12,.115),new THREE.Vector3(sign*.09,-.17,-.14)]);
  add('Mochila_tirante137_'+sign,new THREE.TubeGeometry(curve,16,.012,5,false),strap,0,0,0);
 }
 const handle=new THREE.CatmullRomCurve3([new THREE.Vector3(-.04,.14,-.175),new THREE.Vector3(0,.205,-.175),new THREE.Vector3(.04,.14,-.175)]);
 add('Mochila_asa137',new THREE.TubeGeometry(handle,10,.009,5,false),strap,0,0,0);
}
