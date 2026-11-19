import * as Three from 'three';
import {GLTFLoader} from './vendor/GLTFLoader.js';

export const chapters = [
 {title:'Una estación de Línea 1', label:'Línea 1', duration:14, color:'#fd79ac', text:'La estación de Zaragoza abre el recorrido. Los andenes, accesos y vías se organizan alrededor del paso de los trenes.', path:'models/andenes/L1/L1_02_Zaragoza.glb.gz', cut:'station', shot:[.74,.45,.58,.38,.34,.42]},
 {title:'Otra forma de viajar en Línea 8', label:'Línea 8', duration:14, color:'#74dba1', text:'En Coyuya, las vías flanquean el andén central. La estación permite ver cómo cambia la distribución cuando el andén sirve a ambos sentidos.', source:'coyuya', cut:'station', shot:[-.72,.47,.67,-.35,.35,.48]},
 {title:'El tren en movimiento', label:'Tren NM-22', duration:15, color:'#ffae74', text:'Observa el coche de cabina del NM-22. La carrocería aloja a los pasajeros, y el bogie guía y sostiene el coche desde abajo.', path:'models/NM22_cabina.glb.gz', moving:true, shot:[.75,.26,1.47,.10,.27,1.27]},
 {title:'Por dentro del túnel', label:'Túnel circular', duration:13, color:'#99d0ef', text:'El corte deja a la vista las dovelas, la pasarela y la solera que sostiene la vía. Debajo queda espacio para el drenaje.', path:'models/Tunel_circular273.glb?v=274', shot:[.89,.58,1.64,.08,.18,1.57]},
 {title:'De la red eléctrica al tren', label:'Alimentación', duration:16, color:'#ffe190', text:'Torres y líneas llevan la energía hasta el patio de transformación. Desde allí, los equipos de tracción la adaptan para alimentar los trenes.', source:'supply', shot:[-.49,.75,1.50,.25,.37,1.28]},
 {title:'La subestación rectificadora', label:'Subestación', duration:15, color:'#ffe190', text:'Dentro de la subestación, el transformador adapta la tensión y el rectificador convierte la corriente alterna en continua para la barra guía.', path:'models/revision142/subestacion142.glb.gz', cut:'substation', shot:[.78,.60,1.44,-.10,.36,1.25]},
 {title:'La red desde el puesto de control', label:'Puesto de control', duration:15, color:'#caafff', text:'El Puesto Central de Control reúne información de circulación y alimentación para coordinar el servicio. La vista se abre para mostrar la distribución del edificio.', source:'pcc', shot:[.60,.52,1.46,-.37,.47,1.38]}
];

async function loadModel(path, signal) {
 const url = new URL(path, import.meta.url);
 const response = await fetch(url,{signal});
 if(!response.ok)throw new Error(`Modelo 3D no disponible (${response.status})`);
 const bytes = url.pathname.endsWith('.gz')
  ? await new Response(response.body.pipeThrough(new DecompressionStream('gzip'))).arrayBuffer()
  : await response.arrayBuffer();
 signal.throwIfAborted();
 return (await new GLTFLoader().parseAsync(bytes,new URL('.',url).href)).scene;
}

function visibleBounds(root) {
 const box = new Three.Box3();
 root.updateMatrixWorld(true);
 root.traverseVisible(object => {
  if(!object.isMesh)return;
  if(!object.geometry.boundingBox)object.geometry.computeBoundingBox();
  box.union(object.geometry.boundingBox.clone().applyMatrix4(object.matrixWorld));
 });
 return box;
}

function track(root,width,length,y) {
 const deck = new Three.Mesh(new Three.BoxGeometry(length,.14,width),new Three.MeshStandardMaterial({color:'#4b595e'}));
 deck.position.y=y-.13;
 root.add(deck);
 const rails = new Three.InstancedMesh(new Three.BoxGeometry(length,.06,.035),new Three.MeshStandardMaterial({color:'#aebcc1',metalness:.45}),2);
 for(const [i,sign] of [-1,1].entries())rails.setMatrixAt(i,new Three.Matrix4().makeTranslation(0,y-.03,sign*width*.22));
 root.add(rails);
}

export async function buildChapter(chapter,signal) {
 let model, pccShell, liveFlow;
 if(chapter.source==='pcc') {
  const {buildPcc1} = await import('./pcc-building265.js?v=268');
  signal.throwIfAborted();
  model=buildPcc1();
  model.getObjectByName('Terreno').visible=false;
  const surroundings=model.getObjectByName('Entorno268');
  if(surroundings)surroundings.visible=false;
  model.traverse(object=>{
   if(object.isSprite&&!object.name.startsWith('Rotulo:P.C.C.'))object.visible=false;
  });
  pccShell=model.userData.shell;
 } else if(chapter.source==='coyuya') {
  const {makeCoyuya208} = await import('./coyuya208.js?v=209');
  signal.throwIfAborted();
  model=makeCoyuya208();
 } else if(chapter.source==='supply') {
  const [{construirMaqueta},{tramosDeAlimentacion}] = await Promise.all([
   import('./alimentacion/escena-3d.js'),import('./alimentacion/circuito-3d.js')
  ]);
  signal.throwIfAborted();
  model=new Three.Group();
  const parts=construirMaqueta(model);
  parts.aerea.visible=false;
  const marker=new Three.SphereGeometry(.26,8,6);
  const colors={ac:new Three.MeshBasicMaterial({color:'#fff093'}),dc:new Three.MeshBasicMaterial({color:'#ff9e65'}),ret:new Three.MeshBasicMaterial({color:'#92ddeb'})};
  liveFlow=tramosDeAlimentacion({mediumOnly:false,overhead:false}).filter(([,group])=>group!=='aerea').map(([kind,,points])=>{
   const path=new Three.CatmullRomCurve3(points.map(point=>new Three.Vector3(...point)));
   const line=new Three.Line(new Three.BufferGeometry().setFromPoints(path.getPoints(24)),new Three.LineBasicMaterial({color:colors[kind]?.color??'#83b9c9',transparent:true,opacity:.55}));
   const dot=new Three.Mesh(marker,colors[kind]??colors.ret);
   model.add(line,dot);
   return {path,dot};
  });
 } else {
  model=await loadModel(chapter.path,signal);
 }
 if(chapter.cut==='station')model.traverse(object=>{
  if(/^(Techo|Cubierta|Plaf[oó]n|Pared exterior|Pared de fondo)/i.test(object.name))object.visible=false;
 });
 if(chapter.cut==='substation')for(const name of ['roof','Cerramiento_retirado']) {
  const object=model.getObjectByName(name);
  if(object)object.visible=false;
 }
 const content=new Three.Group();
 content.add(model);
 const bounds=visibleBounds(model);
 const center=bounds.getCenter(new Three.Vector3()),size=bounds.getSize(new Three.Vector3());
 model.position.sub(center);
 if(chapter.moving)track(content,size.z*1.48,size.x*1.4,-size.y/2);
 const root=new Three.Group();
 root.add(content);
 content.scale.setScalar(10/Math.max(size.x,size.y,size.z,1));
 const trainStart=model.position.x;
 return {root,animate(progress){
  if(chapter.moving)model.position.x=trainStart+(progress-.5)*size.x*.26;
  if(pccShell)pccShell.visible=progress<.38;
  liveFlow?.forEach(({path,dot},i)=>path.getPointAt((progress*5+i*.13)%1,dot.position));
 }};
}

export function disposeChapter(root) {
 const geometries=new Set(), materials=new Set(), textures=new Set();
 root.traverse(object=>{
  if(object.geometry)geometries.add(object.geometry);
  for(const material of [object.material].flat())if(material)materials.add(material);
 });
 for(const material of materials)for(const value of Object.values(material))if(value?.isTexture)textures.add(value);
 textures.forEach(texture=>texture.dispose());
 materials.forEach(material=>material.dispose());
 geometries.forEach(geometry=>geometry.dispose());
}
