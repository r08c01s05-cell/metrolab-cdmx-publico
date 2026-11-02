import * as THREE from'three';import{mergeGeometries}from'./vendor/BufferGeometryUtils.js';
// Small reusable tools; bevels catch the soft environment instead of box edges.
export function repairTools116(){
 const steel=new THREE.MeshStandardMaterial({name:'Acero pulido herramienta116',color:'#b3bdc0',metalness:.88,roughness:.28}),rubber=new THREE.MeshStandardMaterial({name:'Caucho mango herramienta116',color:'#4e6064',roughness:.8}),dark=new THREE.MeshStandardMaterial({name:'Aislante herramienta116',color:'#253035',roughness:.86});
 const groups={screwdriver:new THREE.Group(),wrench:new THREE.Group(),meter:new THREE.Group(),brush:new THREE.Group()},buckets=new Map();
 function add(tool,g,m,x=0,y=0,z=0,rz=0){if(g.index){const source=g;g=g.toNonIndexed();source.dispose();}g.rotateZ(rz);g.translate(x,y,z);const key=tool+':'+m.uuid;if(!buckets.has(key))buckets.set(key,{tool,m,gs:[]});buckets.get(key).gs.push(g);}
 const x=.008,z=.025;
 // Fluted grip, ferrule, ground shaft and cross-head point matching the panel screws.
 const grip=new THREE.LatheGeometry([new THREE.Vector2(.006,.025),new THREE.Vector2(.016,.03),new THREE.Vector2(.022,.05),new THREE.Vector2(.022,.10),new THREE.Vector2(.016,.135),new THREE.Vector2(.008,.14)],20);
 add('screwdriver',grip,rubber,x,0,z);for(let i=0;i<8;i++){const a=i*Math.PI/4;add('screwdriver',new THREE.CapsuleGeometry(.0025,.052,2,6),dark,x+Math.cos(a)*.021,.077,z+Math.sin(a)*.021);}
 add('screwdriver',new THREE.CylinderGeometry(.008,.009,.016,16),steel,x,.145,z);add('screwdriver',new THREE.CylinderGeometry(.004,.004,.14,12),steel,x,.223,z);
 const section=[[-.0015,-.005],[.0015,-.005],[.0015,-.0015],[.005,-.0015],[.005,.0015],[.0015,.0015],[.0015,.005],[-.0015,.005],[-.0015,.0015],[-.005,.0015],[-.005,-.0015],[-.0015,-.0015]],vertices=[];for(let i=0;i<section.length;i++){const a=section[i],b=section[(i+1)%section.length],lo=v=>[v[0],.289,v[1]],hi=v=>[v[0]*.22,.305,v[1]*.22];vertices.push(...lo(a),...hi(a),...lo(b),...lo(b),...hi(a),...hi(b));}const blade=new THREE.BufferGeometry();blade.setAttribute('position',new THREE.Float32BufferAttribute(vertices,3));blade.computeVertexNormals();blade.setAttribute('uv',new THREE.Float32BufferAttribute(new Float32Array(vertices.length/3*2),2));add('screwdriver',blade,steel,x,0,z);
 // Rounded shank and a real open jaw; the opening remains visible from both sides.
 const shank=new THREE.Shape();for(const [i,[a,b]]of [[-.011,.062],[-.009,.11],[-.008,.23],[-.017,.277],[.017,.277],[.008,.23],[.009,.11],[.011,.062]].entries())i?shank.lineTo(a,b):shank.moveTo(a,b);shank.closePath();add('wrench',new THREE.ExtrudeGeometry(shank,{depth:.005,bevelEnabled:true,bevelThickness:.001,bevelSize:.001,bevelSegments:2,steps:1}),steel,x,0,z-.0025);
 const jaw=new THREE.Shape();const points=[[-.022,.270],[-.030,.297],[-.027,.321],[-.014,.330],[-.014,.306],[.014,.306],[.014,.330],[.027,.321],[.030,.297],[.022,.270]];
 points.forEach(([a,b],i)=>i?jaw.lineTo(a,b):jaw.moveTo(a,b));jaw.closePath();const j=new THREE.ExtrudeGeometry(jaw,{depth:.008,bevelEnabled:true,bevelThickness:.0015,bevelSize:.0015,bevelSegments:2,steps:1,curveSegments:8});add('wrench',j,steel,x,0,z-.004);
 const ring=new THREE.Shape();ring.absarc(0,0,.023,0,Math.PI*2);const bore=new THREE.Path();for(let i=0;i<24;i++){const a=i*Math.PI/12,r=i%2?.014:.016;const px=Math.cos(a)*r,py=Math.sin(a)*r;i?bore.lineTo(px,py):bore.moveTo(px,py);}bore.closePath();ring.holes.push(bore);add('wrench',new THREE.ExtrudeGeometry(ring,{depth:.006,bevelEnabled:true,bevelThickness:.001,bevelSize:.001,bevelSegments:2,steps:1,curveSegments:24}),steel,x,.038,z-.003);
 // Insulated probe with finger guard; only the short end is bare metal.
 add('meter',new THREE.CapsuleGeometry(.012,.10,3,12),rubber,x,.09,z);add('meter',new THREE.CylinderGeometry(.023,.023,.006,16),dark,x,.15,z);add('meter',new THREE.CylinderGeometry(.004,.011,.112,12),dark,x,.21,z);add('meter',new THREE.CylinderGeometry(.0015,.003,.024,10),steel,x,.278,z);
 for(const y of[.04,.125])add('screwdriver',new THREE.TorusGeometry(.017,.0018,5,24).rotateX(Math.PI/2),dark,x,y,z);for(let i=0;i<6;i++)add('meter',new THREE.TorusGeometry(.012,.0011,5,20).rotateX(Math.PI/2),dark,x,.06+i*.012,z);
 add('brush',new THREE.CylinderGeometry(.009,.012,.16,16),rubber,x,.11,z);add('brush',new THREE.BoxGeometry(.038,.045,.020),steel,x,.21,z);for(let i=0;i<8;i++)add('brush',new THREE.BoxGeometry(.004,.060,.015),dark,x-.016+i*.0045,.262,z);
 for(const{tool,m,gs}of buckets.values()){const mesh=new THREE.Mesh(mergeGeometries(gs,false),m);mesh.name='Herramienta116_'+tool;groups[tool].add(mesh);gs.forEach(g=>g.dispose());}
 for(const child of groups.screwdriver.children)child.geometry.translate(-x,0,-z);groups.screwdriver.position.set(x,0,z);return groups;
}
