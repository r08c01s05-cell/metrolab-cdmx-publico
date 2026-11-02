import fs from 'node:fs';import * as THREE from '../dist/vendor/three.module.js';
const shape=new THREE.Shape();[[-.64,.08],[-.66,.98],[-.53,1.25],[-.20,1.25],[-.15,1.02],[.15,1.02],[.20,1.25],[.53,1.25],[.66,.98],[.64,.08],[.44,0],[.18,0],[.12,.08],[-.12,.08],[-.18,0],[-.44,0]].forEach(([x,y],i)=>i?shape.lineTo(x,y):shape.moveTo(x,y));shape.closePath();
for(const side of [-1,1]){const hole=new THREE.Path();const x=side*.4;hole.moveTo(x-.115,1.05);hole.lineTo(x-.115,1.17);hole.lineTo(x+.115,1.17);hole.lineTo(x+.115,1.05);hole.closePath();shape.holes.push(hole);}
const body=new THREE.ExtrudeGeometry(shape,{depth:.10,bevelEnabled:true,bevelSegments:3,steps:1,bevelSize:.015,bevelThickness:.015,curveSegments:12});body.translate(0,0,-.05);
const parts=[];function add(name,geo,color,pos=[0,0,0],label=false,back=false){if(geo.index)geo=geo.toNonIndexed();parts.push({name,position:pos,back,label,color,positionData:Array.from(geo.attributes.position.array),normalData:Array.from(geo.attributes.normal.array),uv:Array.from(geo.attributes.uv?.array||[])});}
add('Barrera_plastico_naranja',body,[.91,.15,.035,1]);
for(const side of [-1,1])add('Pie_estabilizador_'+side,new THREE.BoxGeometry(.30,.065,.45),[.91,.15,.035,1],[side*.42,.035,0]);
for(const back of [false,true]){const sign=back?-1:1;add('Marco_cartel_'+sign,new THREE.BoxGeometry(1.11,.285,.025),[.88,.9,.9,1],[0,.69,sign*.07]);add('Cartel_espacio_exclusivo_'+sign,new THREE.PlaneGeometry(1.075,.255),[1,1,1,1],[0,.69,sign*.085],true,back);add('Panel_inferior_'+sign,new THREE.BoxGeometry(1.10,.205,.025),[.24,.28,.29,1],[0,.29,sign*.07]);}
fs.writeFileSync('/tmp/barrera91.json',JSON.stringify(parts));
