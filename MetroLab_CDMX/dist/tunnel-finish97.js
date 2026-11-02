import * as THREE from 'three';
export function tunnelProfile97(line,index){const a=line.stations[index],b=line.stations[index+1],surface=s=>s.linea===8&&s.entorno_visual?.tipo==='superficial',sa=surface(a),sb=surface(b);return{from:a.id,to:b.id,type:sa&&sb?'abierto':sa!==sb?'transicion':'cajon',surfaceA:sa,surfaceB:sb,scope:line.stations[0].linea===1&&b.id==='L1-20'?'Acceso cubierto según referencia visual; no se usa la ficha superficial histórica para abrir el túnel.':'Clasificación exterior contrastada con referencias; sección y punto exacto de transición aproximados.'};}
let texture;
function concreteTexture97(){if(texture)return texture;const canvas=document.createElement('canvas');canvas.width=256;canvas.height=256;const c=canvas.getContext('2d');let seed=9701;const rand=()=>{seed=(seed*1664525+1013904223)>>>0;return seed/4294967296;};const data=c.createImageData(256,256);for(let i=0;i<data.data.length;i+=4){const gray=222+Math.floor(rand()*22);data.data.set([gray,gray,gray-2,255],i);}c.putImageData(data,0,0);c.strokeStyle='#8f948e';c.lineWidth=1;c.strokeRect(.5,.5,255,255);texture=new THREE.CanvasTexture(canvas);texture.wrapS=texture.wrapT=THREE.RepeatWrapping;texture.colorSpace=THREE.SRGBColorSpace;return texture;}
export function finishTunnel97(view,group,from,to,width,saf){
 // Surface imperfections are procedural and restrained; no unverified damage is represented.
 const map=globalThis.document?.createElement&&typeof document.createElement('canvas').getContext?.('2d')?.createImageData==='function'?concreteTexture97():null;
 group.traverse(o=>{if(o.isMesh&&o.userData.shell&&!o.material.name)o.material.name=o.material.emissiveIntensity>0&&o.material.emissive?.getHex()?'Difusor tunel':'Concreto tunel';if(!o.isMesh||!o.userData.shell||o.geometry.parameters?.width<8||!map)return;o.material.map=map;o.material.bumpMap=map;o.material.bumpScale=.0025;o.material.roughness=.92;o.material.needsUpdate=true;const g=o.geometry;if(!g.userData.tiled97){const uv=g.attributes.uv;for(let i=0;i<uv.count;i++){uv.setXY(i,uv.getX(i)*g.parameters.width/3.2,uv.getY(i)*Math.max(.2,g.parameters.height)/3.2);}g.userData.tiled97=true;}});
 for(const side of[-1,1]){
  view.box(group,(from+to)/2,.44,side*(width/2-.59),to-from,.20,.53,'#777d76');
  view.box(group,(from+to)/2,.555,side*(width/2-.82),to-from,.018,.035,'#c3ae5c');
  for(const [a,b]of view.wallSpans97(from,to,side,saf)){for(let j=0;j<3;j++)view.box(group,(a+b)/2,2.61+j*.05,side*(width/2-.38),b-a,.022,.026,'#171d1b');}
 }
}
