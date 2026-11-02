import * as T from 'three';

// Repeated fittings are instanced: visual detail never adds collision/picking targets.
export function depotDetail205(root,{length=195,width=42,tracks=[-11,0,11],gauge=.72,axis='z',lights=true}={}){
 if(root.userData.detail205)return root.userData.detail205;
 const group=new T.Group();group.name='Acabados de nave205';if(axis==='x'){group.rotation.y=Math.PI/2;group.position.x=length/2-35;}
 root.add(group);
 const metal=new T.MeshStandardMaterial({name:'Acero galvanizado fijaciones205',color:'#899294',metalness:.78,roughness:.44});
 const rubber=new T.MeshStandardMaterial({name:'Goma asiento de fijación205',color:'#303638',roughness:.88});
 const paint=new T.MeshStandardMaterial({name:'Pintura canalización205',color:'#657375',metalness:.15,roughness:.6});
 const joint=new T.MeshStandardMaterial({name:'Junta losa de concreto205',color:'#505956',roughness:.96});
 const plate=[],bolts=[],flanges=[],trays=[],supports=[],joints=[],housings=[];
 for(const track of tracks){
  for(const side of[-1,1]){
   const x=track+side*gauge;flanges.push([x,-.013,35-length/2,.17,.014,length]);
   for(let z=32;z>35-length;z-=1.4){
    plate.push([x,-.002,z,.27,.026,.27]);
    for(const sign of[-1,1])bolts.push([x+sign*.105,.025,z,.018,.025,.018]);
   }
  }
 }
 for(let z=29;z>35-length;z-=6){
  joints.push([0,-.018,z,width-.6,.003,.012]);
  for(const side of[-1,1])supports.push([side*(width/2-.46),3.8,z,.38,.045,.07]);
 }
 for(let x=-width/2+3;x<width/2;x+=6)joints.push([x,-.018,35-length/2,.012,.003,length]);
 for(const side of[-1,1]){
  const x=side*(width/2-.34);
  trays.push([x,3.81,35-length/2,.26,.035,length]);
  for(const edge of[-1,1])trays.push([x+edge*.12,3.87,35-length/2,.018,.12,length]);
 }
 if(lights)for(let z=28;z>35-length;z-=15)for(const x of tracks){
  housings.push([x,12.065,z,3.13,.055,.45]);
  for(const end of[-1,1])housings.push([x+end*1.53,12,z,.07,.11,.45]);
 }
 function batch(name,entries,material,hex=false){
  if(!entries.length)return;
  const geometry=hex?new T.CylinderGeometry(1,1,1,6):new T.BoxGeometry(1,1,1);
  const mesh=new T.InstancedMesh(geometry,material,entries.length),matrix=new T.Matrix4(),q=new T.Quaternion();
  for(let i=0;i<entries.length;i++){const[x,y,z,w,h,d]=entries[i];matrix.compose(new T.Vector3(x,y,z),q,new T.Vector3(w,h,d));mesh.setMatrixAt(i,matrix);}
  mesh.name=name;mesh.raycast=()=>{};mesh.receiveShadow=true;mesh.userData.visualDetail205=true;
  mesh.computeBoundingBox();mesh.computeBoundingSphere();group.add(mesh);
 }
 batch('Placas de asiento205',plate,rubber);batch('Tornillos hexagonales de fijación205',bolts,metal,true);
 batch('Patín inferior del riel205',flanges,metal);batch('Bandeja longitudinal205',trays,paint);
 batch('Soportes de canalización205',supports,metal);batch('Juntas entre paños205',joints,joint);
 batch('Carcasas de luminaria205',housings,metal);
 root.userData.detail205={batches:group.children.length,instances:group.children.reduce((n,m)=>n+m.count,0)};
 return root.userData.detail205;
}
