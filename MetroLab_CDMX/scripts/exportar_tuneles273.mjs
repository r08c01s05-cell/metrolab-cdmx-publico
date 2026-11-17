import fs from 'node:fs';
import * as Three from '../dist/vendor/three.module.js';

const colors = {
 concreto: '#a9aaa0', dovela: '#aaa9a2', junta: '#616763', losa: '#797e7e',
 traviesa: '#555451', acero: '#abb5b9', pasarela: '#92978e', borde: '#e8b844',
 drenaje: '#567e96', charola: '#364450', luminaria: '#f9ebc5'
};
const boxGeometry = new Three.BoxGeometry(1,1,1);
const depth = 12;

function exportGLB(name, build) {
 const data = {asset:{version:'2.0',generator:'Metro en la ciudad'},scene:0,scenes:[{nodes:[]}],nodes:[],meshes:[],materials:[],accessors:[],bufferViews:[],buffers:[]};
 const chunks = [];
 const geometryCache = new Map();
 const materials = new Map();
 let bytes = 0;
 function accessor(attribute,target) {
  const array=attribute.array;
  const buffer=Buffer.from(array.buffer,array.byteOffset,array.byteLength);
  const padding=Buffer.alloc((4-buffer.length%4)%4);
  const bufferView=data.bufferViews.push({buffer:0,byteOffset:bytes,byteLength:buffer.length,target})-1;
  chunks.push(buffer,padding); bytes+=buffer.length+padding.length;
  const item={bufferView,count:attribute.count,type:attribute.itemSize===3?'VEC3':'SCALAR',componentType:array instanceof Float32Array?5126:5123};
  if(target===34962&&attribute===position) Object.assign(item,{min:bounds.min.toArray(),max:bounds.max.toArray()});
  return data.accessors.push(item)-1;
 }
 let bounds,position;
 function mesh(label, geometry, material, translation, scale) {
  if(!materials.has(material)) {
   const c=new Three.Color(colors[material]);
   materials.set(material,data.materials.push({name:material,pbrMetallicRoughness:{baseColorFactor:[c.r,c.g,c.b,1],metallicFactor:material==='acero'?.55:0,roughnessFactor:material==='acero'?.36:.85},...(material==='luminaria'?{emissiveFactor:[.48,.41,.24]}:{})})-1);
  }
  if(!geometryCache.has(geometry)) {
   geometry.computeBoundingBox(); bounds=geometry.boundingBox; position=geometry.attributes.position;
   geometryCache.set(geometry,{attributes:{POSITION:accessor(position,34962),NORMAL:accessor(geometry.attributes.normal,34962)},indices:accessor(geometry.index,34963),meshes:new Map()});
  }
  const entry=geometryCache.get(geometry);
  if(!entry.meshes.has(material))entry.meshes.set(material,data.meshes.push({primitives:[{attributes:entry.attributes,indices:entry.indices,material:materials.get(material)}]})-1);
  data.scenes[0].nodes.push(data.nodes.push({name:label,mesh:entry.meshes.get(material),translation,scale})-1);
 }
 build((label,size,position,material)=>mesh(label,boxGeometry,material,position,size),mesh);
 data.buffers.push({byteLength:bytes});
 const json=Buffer.from(JSON.stringify(data));
 const jsonChunk=Buffer.concat([json,Buffer.alloc((4-json.length%4)%4,0x20)]);
 const header=Buffer.alloc(20),binHeader=Buffer.alloc(8);
 header.write('glTF');header.writeUInt32LE(2,4);header.writeUInt32LE(28+jsonChunk.length+bytes,8);
 header.writeUInt32LE(jsonChunk.length,12);header.write('JSON',16);
 binHeader.writeUInt32LE(bytes);binHeader.write('BIN\0',4);
 fs.writeFileSync(new URL('../dist/models/'+name+'.glb',import.meta.url),Buffer.concat([header,jsonChunk,binHeader,...chunks]));
}

function track(box,x) {
 for(const side of [-1,1])box('Riel',[.09,.13,depth],[x+side*.70,.15,0],'acero');
 for(let z=-5.7;z<6;z+=.6)box('Traviesa',[1.85,.095,.24],[x,.045,z],'traviesa');
}
function walkway(box,x) {
 box('Pasarela',[.72,.23,depth],[x,.19,0],'pasarela');
 box('Borde de pasarela',[.06,.025,depth],[x-Math.sign(x)*.32,.32,0],'borde');
}
function installations(box,cableX,lightY) {
 box('Charola de instalaciones',[.15,.18,depth],[cableX,1.72,0],'charola');
 for(const z of [-4.5,0,4.5])box('Luminaria',[.17,.11,1.8],[0,lightY,z],'luminaria');
}

exportGLB('Tunel_cajon273',(box)=>{
 // Sección de Línea 1 del simulador (station-scene.js): ancho 8.8 m, altura 5.3 m.
 box('Losa inferior',[9.25,.40,depth],[0,-.20,0],'losa');
 box('Losa superior',[8.8,.40,depth],[0,5.3,0],'concreto');
 for(const side of [-1,1]) {
  box('Muro lateral',[.45,5.3,depth],[side*4.4,2.65,0],'concreto');
  for(const z of [-5.85,0,5.85])box('Refuerzo lateral',[.16,5.05,.24],[side*4.10,2.52,z],'junta');
  track(box,side*1.9);walkway(box,side*3.68);
 }
 box('Canal de drenaje',[.22,.055,depth],[0,.025,0],'drenaje');
 installations(box,4.10,4.88);
});

exportGLB('Tunel_circular273',(box,mesh)=>{
 const radius=3.2, outer=3.52, cy=1.9, band=2;
 // Cada dovela es un volumen cerrado con caras de intradós, extradós y juntas.
 const segments=8;
 for(let i=0;i<segments;i++) {
  const start=i*2*Math.PI/segments+.004,end=(i+1)*2*Math.PI/segments-.004;
  const ring=new Three.Shape();
  const point=(r,a)=>[r*Math.cos(a),r*Math.sin(a)+cy];
  ring.moveTo(...point(outer,start));
  for(let k=1;k<=12;k++)ring.lineTo(...point(outer,start+(end-start)*k/12));
  for(let k=12;k>=0;k--)ring.lineTo(...point(radius,start+(end-start)*k/12));
  ring.closePath();
  const raw=new Three.ExtrudeGeometry(ring,{depth:band-.018,bevelEnabled:false});
  raw.setIndex(Array.from({length:raw.attributes.position.count},(_,j)=>j));
  for(let z=-depth/2;z<depth/2;z+=band)mesh('Dovela de concreto',raw,'dovela',[0,0,z],[1,1,1]);
 }
 box('Solera',[4.55,.42,depth],[0,-.22,0],'losa');
 box('Colector de drenaje bajo la solera',[.38,.19,depth],[0,-.61,0],'drenaje');
 track(box,-.20);walkway(box,1.63);installations(box,2.62,4.75);
});
