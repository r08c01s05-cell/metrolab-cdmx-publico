import fs from 'node:fs';import * as THREE from '../dist/vendor/three.module.js';
const parts=[];
function add(name,g,color,pos,rotation=[0,0,0,1],metal=1,rough=.16){if(g.index)g=g.toNonIndexed();parts.push({name,pos,rotation,color,metal,rough,vertices:Array.from(g.attributes.position.array),normals:Array.from(g.attributes.normal.array)});}
const chrome=[.61,.64,.65,1],dark=[.035,.045,.052,1];
function plate(w,h,d,r=.004){const s=new THREE.Shape();s.moveTo(-w/2+r,-h/2);s.lineTo(w/2-r,-h/2);s.quadraticCurveTo(w/2,-h/2,w/2,-h/2+r);s.lineTo(w/2,h/2-r);s.quadraticCurveTo(w/2,h/2,w/2-r,h/2);s.lineTo(-w/2+r,h/2);s.quadraticCurveTo(-w/2,h/2,-w/2,h/2-r);s.lineTo(-w/2,-h/2+r);s.quadraticCurveTo(-w/2,-h/2,-w/2+r,-h/2);const g=new THREE.ExtrudeGeometry(s,{depth:d,bevelEnabled:true,bevelSize:.0012,bevelThickness:.0012,bevelSegments:3,steps:1});g.translate(0,0,-d/2);return g;}
const turn=new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(1,0,0),Math.PI/2).toArray();
function cylinder(name,r,h,pos,color=chrome,segments=32){add(name,new THREE.CylinderGeometry(r,r,h,segments),color,pos,turn);}
add('Placa_cromada',plate(.12,.245,.006),chrome,[0,0,.004]);
for(const x of [-.045,.045])for(const y of [-.103,.103]){cylinder('Tornillo_ranurado',.009,.004,[x,y,.010]);add('Ranura_tornillo',new THREE.BoxGeometry(.012,.0016,.001),dark,[x,y,.0125],[0,0,0,1],.5,.38);}
cylinder('Casquillo_superior',.024,.039,[0,.052,.025]);cylinder('Alojamiento_oscuro',.017,.001,[0,.052,.045],dark);
const triangle=new THREE.Shape();triangle.moveTo(0,.010);triangle.lineTo(-.010,-.007);triangle.lineTo(.010,-.007);triangle.closePath();const tri=new THREE.ExtrudeGeometry(triangle,{depth:.002,bevelEnabled:true,bevelSize:.0005,bevelThickness:.0005,bevelSegments:2,steps:1});add('Inserto_triangular_visible',tri,[.44,.46,.43,1],[0,.052,.046]);cylinder('Centro_inserto',.0024,.001,[0,.050,.049],dark,16);
cylinder('Base_manija',.025,.025,[0,-.035,.023]);cylinder('Pivote_manija',.026,.042,[0,-.035,.051]);
const lever=new THREE.Shape();lever.moveTo(.005,-.013);lever.bezierCurveTo(.06,-.015,.13,-.018,.185,-.006);lever.quadraticCurveTo(.2,-.002,.199,.009);lever.quadraticCurveTo(.196,.016,.189,.014);lever.bezierCurveTo(.14,.003,.06,.008,.006,.012);lever.closePath();const geometry=new THREE.ExtrudeGeometry(lever,{depth:.015,bevelEnabled:true,bevelSize:.003,bevelThickness:.003,bevelSegments:4,steps:1,curveSegments:20});add('Manija_horizontal_curvada',geometry,chrome,[0,-.035,.062]);
add('Placa_cerradero_marco',plate(.028,.10,.005,.002),chrome,[-.079,-.035,.01]);for(const y of [-.072,.002]){cylinder('Tornillo_cerradero',.0065,.003,[-.079,y,.015]);add('Ranura_cerradero',new THREE.BoxGeometry(.009,.0012,.001),dark,[-.079,y,.017]);}add('Pestillo_visible',new THREE.BoxGeometry(.026,.018,.025),chrome,[-.061,-.035,.023]);
fs.writeFileSync('/tmp/cerradura92.json',JSON.stringify(parts));
