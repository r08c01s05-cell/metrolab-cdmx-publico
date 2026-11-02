import * as T from 'three';
import {inheritSurfaceDetail205}from'./surface-detail205.js?v=205';
import {STATION_REFERENCES213,referenceTexture213}from'./station-reference213.js?v=215';
const plain=s=>s.normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase();
function metricUV213(o,scale){
 const g=o.geometry.clone(),p=g.attributes.position,n=g.attributes.normal,uv=new Float32Array(p.count*2),v=new T.Vector3(),normal=new T.Vector3(),matrix=new T.Matrix3().getNormalMatrix(o.matrixWorld);
 for(let i=0;i<p.count;i++){v.fromBufferAttribute(p,i).applyMatrix4(o.matrixWorld);normal.fromBufferAttribute(n,i).applyMatrix3(matrix);const x=Math.abs(normal.x),y=Math.abs(normal.y),z=Math.abs(normal.z);uv[i*2]=(y>x&&y>z?v.x:z>x?v.x:v.z)/scale;uv[i*2+1]=(y>x&&y>z?v.z:-v.y)/scale;}
 g.setAttribute('uv2',new T.Float32BufferAttribute(uv,2));o.geometry=g;
}

export function finishStation213(root,station,anisotropy=4){
 const profile=STATION_REFERENCES213[station?.id];if(!profile||typeof document==='undefined')return null;
 if(root.userData.stationReference213)return root.userData.stationReference213;
 root.updateMatrixWorld(true);const clones=new Map(),stats={id:station.id,changed:0,floors:0,walls:0,columns:0,ceilings:0,bands:0,photo:profile.photo,note:profile.note};
 root.traverse(o=>{
  if(!o.isMesh||Array.isArray(o.material))return;
  const original=o.material,name=plain(o.name+' '+(original.name||'')),mat=plain(original.name||'');
  // Keep supplied artwork, pictograms, maps, screens and safety notices intact.
  if(/mural|pictograma|mapa|display|cartel|publicidad|letrero|viaja|exclusiv/.test(name)&&!mat.includes('franja_verde'))return;
  let role=null;
  if(/podot|tactil|franja.*(?:amarill|seguridad)|borde.*amarill/.test(name))role='warning';
  else if(/piso.*(?:anden|gris|pasillo)|anden.*piso|pavimento|loseta|terrazo|piedra geometrica/.test(name))role='floor';
  else if(/franja_verde_linea_8|franja rosa|linea 8 verde/.test(mat))role='band';
  else if(/columna|pilar|machon/.test(plain(o.name))&&!/zocalo|franja negra/.test(name))role='column';
  else if(/revestimiento/.test(mat))role='wall';
  else if(/plafon porcelanico|cubierta metalica/.test(mat))role='ceiling';
  if(!role)return;
  const key=original.uuid+':'+role;let m=clones.get(key);
  if(!m){
   m=original.clone();inheritSurfaceDetail205(original,m);m.name=original.name+' · referencia '+station.id+' 213';m.userData={...m.userData,stationReference213:station.id,referenceRole213:role};
   if(role==='floor'){m.side=T.DoubleSide;m.color.set('#ffffff');m.map=referenceTexture213(T,profile.floor);m.roughnessMap=null;m.roughness=/Rect/.test(profile.floor)?.43:.38;m.metalness=0;}
   if(role==='wall'){m.color.set('#ffffff');m.map=referenceTexture213(T,profile.wall==='stone'?'stoneWall':profile.wall==='metal'?'metal':'panel',profile.wallColor);m.roughnessMap=null;m.roughness=profile.wall==='stone'?.44:.52;m.metalness=profile.wall==='metal'?.35:0;}
   if(role==='column'){m.color.set(profile.column);m.roughness=.57;m.metalness=0;}
   if(role==='ceiling'){const surface=profile.wall==='surface';m.side=T.DoubleSide;m.color.set('#ffffff');m.map=referenceTexture213(T,surface?'roof':'ceiling',surface?(station.id==='L8-13'?'#d3c2a5':'#e5e3d7'):'#e3e5de');m.roughness=.65;m.metalness=.12;}
   if(role==='band'){m.color.set(profile.band);m.roughness=.5;m.metalness=.05;}
   if(role==='warning'){m.color.set(profile.line===1?'#dec141':'#ceac45');m.roughness=.65;m.metalness=0;}
   if(m.map?.userData.reference213)m.map.anisotropy=Math.min(8,anisotropy);m.needsUpdate=true;clones.set(key,m);
  }
  o.material=m;if(['floor','wall','ceiling'].includes(role))metricUV213(o,role==='floor'?2.4:role==='ceiling'?1.2:.8);
  o.userData.referenceRole213=role;stats.changed++;if(role==='floor')stats.floors++;if(role==='wall')stats.walls++;if(role==='column')stats.columns++;if(role==='ceiling')stats.ceilings++;if(role==='band')stats.bands++;
 });
 root.userData.stationReference213=stats;return stats;
}

// Architectural treatment only. Platform solids, stairs and all tracks retain
// their original positions; exterior supports stay outside the running envelope.
export function finishSurfaceArchitecture213(root,station){
 const profile=STATION_REFERENCES213[station.id];if(profile?.wall!=='surface')return;
 const terminal=station.id==='L8-19',columns=new T.MeshStandardMaterial({name:'Estructura según fotografía '+station.id,color:profile.column,roughness:terminal?.72:.58,metalness:terminal?.02:.35}),wall=new T.MeshStandardMaterial({name:'Murete según fotografía '+station.id,color:profile.wallColor,roughness:.8});
 const removed=[],surfaces=[];let outer=0;
 root.traverse(o=>{if(!o.isMesh)return;
  if(/Columna exterior|Diagonal exterior|Pilar de isla|Cercha transversal|Cordón superior de cercha|Diagonal de cercha/.test(o.name))o.material=columns;
  if(o.name==='Muro exterior bajo'){o.material=wall;outer=Math.abs(o.position.z);}
  if(o.name==='Malla lateral'||o.name==='Barrote de cerramiento')removed.push(o);
  if(terminal&&/Columna exterior|Diagonal exterior/.test(o.name)){const p=o.geometry.parameters;o.geometry=new T.BoxGeometry(.40,p.height,.40);}
  if(terminal&&o.name==='Pilar de isla'){const p=o.geometry.parameters;o.geometry=new T.BoxGeometry(.28,p.height,.28);}
 });
 for(const o of removed){o.removeFromParent();surfaces.push(o.geometry);}for(const g of new Set(surfaces))g.dispose();
 if(outer){
  const c=document.createElement('canvas');c.width=c.height=128;const p=c.getContext('2d');p.clearRect(0,0,128,128);p.strokeStyle=terminal?'#bdc4ba':'#63766a';p.lineWidth=2;for(let x=-128;x<256;x+=32)for(const sign of[-1,1]){p.beginPath();p.moveTo(x,0);p.lineTo(x+sign*128,128);p.stroke();}
  const map=new T.CanvasTexture(c);map.colorSpace=T.SRGBColorSpace;map.wrapS=map.wrapT=T.RepeatWrapping;map.repeat.set(160/.7,2.8/.7);const material=new T.MeshStandardMaterial({name:'Malla romboidal '+station.id,map,alphaTest:.5,side:T.DoubleSide,roughness:.7,metalness:.3});
  for(const sign of[-1,1]){const mesh=new T.Mesh(new T.PlaneGeometry(160,2.8),material);mesh.name='Cerramiento de malla romboidal213';mesh.position.set(0,2.9,sign*(outer-.01));mesh.userData.componente='pared';mesh.raycast=()=>{};root.add(mesh);}
 }
 root.userData.architectureReference213={id:station.id,photo:profile.photo};
}

// Approximate the diffuse bounce from light walls/paving without extra lights
// or shadows. Restore the tunnel/vehicle lighting when leaving the station.
export function updateStationBounce213(view){
 if(!view.ambientLight?.groundColor)return;
 const state=view.getState(),line=state?.engine?.lines[state.currentLine];if(!line)return;const index=view.lastStation>=0?view.lastStation:view.cameraStation??0,station=line.stations[index];
 const inside=['car','driver','cab-platform'].includes(view.cameraMode),near=Boolean(STATION_REFERENCES213[station?.id])&&Math.abs(view.camera.position.x-line.distances[index])<95;
 const color=near&&!inside?'#969b90':'#343b38';if(view.bounce213===color)return;view.ambientLight.groundColor.set(color);view.bounce213=color;
}
