import * as T from 'three';
import {exteriorMaterial285} from './materiales-exterior285.js?v=285';

// Alturas representativas en el sistema local de la estación.
const perfiles={
 'L8-10':[[ -79,6.16],[-61,6.16],[-53,7.18],[-39,7.18],[-30,6.30],[26,6.30],[36,7.12],[54,7.12],[63,6.2],[79,6.2]],
 'L8-11':[[ -79,6.24],[-25,6.24],[-17,6.96],[34,6.96],[44,6.36],[79,6.36]],
 'L8-12':[[ -79,6.2],[-47,6.2],[-40,6.74],[29,6.74],[39,6.28],[79,6.28]],
 'L8-13':[[ -79,6.17],[-23,6.17],[-13,7.08],[34,7.08],[46,7.55],[61,7.55],[70,6.22],[79,6.22]],
 'L8-19':[[ -79,6.63],[-64,6.88],[62,6.88],[79,6.56]]
};
const paneles={
 'L8-11':{side:-1,start:42,end:76,palette:['#263d75','#359e9f','#76b590','#9f82b9','#d9ac5e']},
 'L8-12':{side:1,start:-76,end:-31,palette:['#299c9e','#a63468','#d11f59','#1f3d57','#f2a367']},
 'L8-13':{side:-1,start:-77,end:-50,palette:['#223748','#23466e','#3d8ac2','#153458','#5c9f9e']}
};

function conUV(points,coords){
 const geometry=new T.BufferGeometry();
 geometry.setAttribute('position',new T.Float32BufferAttribute(points.flat(),3));
 geometry.setAttribute('uv',new T.Float32BufferAttribute(coords.flat(),2));
 geometry.setIndex([0,1,2,0,2,3]);geometry.computeVertexNormals();
 return geometry;
}

function graficaOriginal(colors){
 const canvas=document.createElement('canvas');canvas.width=512;canvas.height=128;
 const p=canvas.getContext('2d');p.fillStyle=colors[0];p.fillRect(0,0,512,128);
 for(let i=0;i<16;i++){
  const x=i*38-26,y=23+(i*47)%100;
  p.fillStyle=colors[(i%4)+1];p.beginPath();
  p.moveTo(x-56,128);p.quadraticCurveTo(x-12,y,x+40,y-28);
  p.quadraticCurveTo(x+28,y+5,x+68,128);p.closePath();p.fill();
 }
 p.fillStyle='rgba(255,255,255,.30)';
 for(let i=0;i<18;i++)p.fillRect((i*79)%512,(i*39)%112+7,1+(i%4),1+(i%3));
 const map=new T.CanvasTexture(canvas);map.colorSpace=T.SRGBColorSpace;map.anisotropy=4;
 return map;
}

export function configurarEnvolvente285(root,id,outer,stairBases,beam){
 const profile=perfiles[id]??perfiles['L8-10'];
 const yAt=x=>{
  const i=profile.findIndex(([boundary])=>x<=boundary);
  if(i<=0)return profile[i===0?0:profile.length-1][1];
  const [a,low]=profile[i-1],[b,high]=profile[i];
  return T.MathUtils.lerp(low,high,(x-a)/(b-a));
 };
 const roof=exteriorMaterial285('terracota',id==='L8-19'?'#a36145':'#b5764c',2.6);
 const fascia=exteriorMaterial285('metal','#b7774f');
 roof.side=T.DoubleSide;
 const breaks=stairBases.map(base=>base+Math.sign(base)*7.5).sort((a,b)=>a-b);
 const spans=[[-79,breaks[0]-1.6],[breaks[0]+1.6,breaks[1]-1.6],[breaks[1]+1.6,79]];
 const rise=id==='L8-19'?1.2:.72;
 for(const side of [-1,1])for(const [start,end] of spans){
  const edges=[start,...profile.map(([x])=>x).filter(x=>x>start&&x<end),end];
  for(let i=1;i<edges.length;i++){
   const a=edges[i-1],b=edges[i],ya=yAt(a),yb=yAt(b),edge=side*(outer+.27);
   const points=[[a,ya,edge],[b,yb,edge],[b,yb+rise,0],[a,ya+rise,0]];
   const mesh=new T.Mesh(conUV(points,[[0,a],[0,b],[outer,b],[outer,a]]),roof);
   mesh.name='Cubierta exterior terracota';mesh.userData.componente='techo';mesh.castShadow=mesh.receiveShadow=true;root.add(mesh);
   const canal=beam('Cubierta · remate curvo del alero',points[0],points[1],.19,.21,fascia);
   canal.userData.componente='techo';
  }
 }
 const panel=paneles[id];
 if(panel){
  const {side,start,end,palette}=panel,z=side*(outer+.17),low=1.62;
  const upper=(x)=>Math.min(yAt(x)-.13,6.01);
  const plate=new T.Mesh(conUV([[start+4,low,z],[end-4,low,z],[end,upper(end),z],[start,upper(start),z]],[[0,0],[1,0],[1,1],[0,1]]),
   new T.MeshStandardMaterial({name:'Paño inclinado · gráfica original',map:graficaOriginal(palette),side:T.DoubleSide,roughness:.76}));
  plate.name='Pared exterior · paño inclinado';plate.userData.componente='pared';plate.receiveShadow=true;root.add(plate);
 }
 root.userData.envolvente285={id,profile,spans};
 return {yAt,rise};
}
