import fs from 'node:fs';import * as THREE from '../dist/vendor/three.module.js';
const parts=[];
function add(name,geo,color,pos=[0,0,0],label=false,back=false){if(geo.index)geo=geo.toNonIndexed();parts.push({name,position:pos,back,label,color,positionData:[...geo.attributes.position.array],normalData:[...geo.attributes.normal.array],uv:[...(geo.attributes.uv?.array||[])]});}
const white=[.91,.93,.91,1],steel=[.48,.54,.55,1],green=[.0,.52,.32,1];
function box(name,pos,size,c){add(name,new THREE.BoxGeometry(...size),c,pos);}
// White fixed panels with clear upper sections. Central walking passage: 1.50 m.
for(const x of [-1.35,1.35]){
 box('Panel_blanco_Viaja_Segura',[x,.68,0],[1.12,1.25,.055],white);
 box('Franja_verde_Linea_8',[x,1.22,.034],[1.12,.15,.015],green);
 box('Vidrio_superior',[x,1.65,0],[1.12,.65,.018],[.64,.83,.79,.18]);
 for(const dx of [-.575,.575]){
  const height=Math.abs(x+dx)>1.9?2.78:2.08;
  box('Poste_acero',[x+dx,height/2,0],[.045,height,.055],steel);
  box('Placa_anclaje',[x+dx,.012,0],[.16,.024,.18],steel);
  for(const sx of [-.055,.055])for(const sz of [-.065,.065])add('Perno_anclaje',new THREE.CylinderGeometry(.009,.009,.015,8),steel,[x+dx+sx,.031,sz]);
 }
 for(const back of [false,true])add('Cartel_VIAJA_SEGURA',new THREE.PlaneGeometry(1.06,.64),[1,1,1,1],[x,.82,back?-.037:.037],true,back);
}
// Freestanding frame above the passage, clear at 2.23 m.
box('Dintel',[0,2.76,0],[3.94,.055,.07],steel);
box('Letrero_superior',[0,2.48,0],[1.5,.48,.06],white);
for(const back of [false,true])add('Letrero_exclusivo',new THREE.PlaneGeometry(1.45,.43),[1,1,1,1],[0,2.48,back?-.038:.038],true,back);
box('Limite_en_piso',[0,.009,0],[3.9,.012,.075],green);
// Floor decal sits inside the designated area, away from the tactile strip.
const decal=new THREE.PlaneGeometry(1.5,.8);decal.rotateX(-Math.PI/2);add('Marca_piso_VIAJA_SEGURA',decal,[1,1,1,1],[0,.012,-1.4],true);
fs.writeFileSync('/tmp/separador93.json',JSON.stringify(parts));
