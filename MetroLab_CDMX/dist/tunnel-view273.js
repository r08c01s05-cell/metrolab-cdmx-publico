import * as Three from 'three';
import {OrbitControls} from './vendor/OrbitControls.js';
import {GLTFLoader} from './vendor/GLTFLoader.js';
import {RenderBudget101} from './render-budget101.js?v=222';

const MODELS = {
 cajon: './models/Tunel_cajon273.glb',
 circular: './models/Tunel_circular273.glb?v=274'
};

function disposeModel(model) {
 const geometries=new Set(), materials=new Set();
 model.traverse(object=>{
  if(!object.isMesh)return;
  geometries.add(object.geometry);
  for(const material of [object.material].flat())materials.add(material);
 });
 geometries.forEach(geometry=>geometry.dispose());
 materials.forEach(material=>material.dispose());
}

export function openTunnelView273(canvas, status) {
 const renderer=new Three.WebGLRenderer({canvas,antialias:true,alpha:false});
 renderer.setClearColor('#263943');
 const budget=new RenderBudget101(renderer,{maxDpr:1.5});
 const scene=new Three.Scene();
 scene.add(new Three.HemisphereLight('#fff7e4','#52616b',2.2));
 const key=new Three.DirectionalLight('#fff2dc',2.4);
 key.position.set(-4,8,8);scene.add(key);
 const camera=new Three.OrthographicCamera(-6,6,6,-6,.1,100);
 const controls=new OrbitControls(camera,canvas);
 controls.enablePan=false;
 controls.minZoom=.65;
 controls.maxZoom=3;
 const loader=new GLTFLoader();
 const aborter=new AbortController();
 const models=new Map();
 let model, requested, frame=0, closed=false;
 const render=()=>{
  if(frame||closed)return;
  const draw=now=>{frame=0;if(budget.allows(now))renderer.render(scene,camera);else render();};
  frame=requestAnimationFrame(draw);
 };
 const resize=()=>{
  const {width,height}=canvas.getBoundingClientRect();
  if(!width||!height)return;
  const ratio=width/height;
  const halfHeight=Math.max(3.65,5.9/ratio);
  Object.assign(camera,{left:-halfHeight*ratio,right:halfHeight*ratio,top:halfHeight,bottom:-halfHeight});
  camera.updateProjectionMatrix(); renderer.setSize(width,height,false); render();
 };
 const observer=new ResizeObserver(resize);
 observer.observe(canvas);
 controls.addEventListener('change',render);
 function orient(view) {
  controls.target.set(0,2.05,0);
  camera.position.copy(controls.target).add(view==='front'?new Three.Vector3(0,0,22):new Three.Vector3(10,7,23));
  camera.zoom=view==='front'?1:.86;
  camera.updateProjectionMatrix();controls.update();render();
 }
 orient('orbit');
 return {
  orient,
  async show(form) {
   const request=requested={form};
   if(model){scene.remove(model); model=null;}
   status.textContent='Cargando modelo 3D…'; render();
   try {
    if(!models.has(form))models.set(form,(async()=>{
     const response=await fetch(MODELS[form],{signal:aborter.signal});
     if(!response.ok)throw Error(`Modelo ${form}: HTTP ${response.status}`);
     return (await loader.parseAsync(await response.arrayBuffer(),'')).scene;
    })().catch(error=>{models.delete(form);throw error;}));
    const result=await models.get(form);
    if(closed||requested!==request)return;
    model=result;scene.add(model);status.textContent='';render();
   } catch(error) {
    if(!closed&&requested===request){status.textContent='No se pudo cargar el modelo 3D. Selecciona de nuevo el tipo de túnel para reintentar.';console.error(error);}
   }
  },
  close() {
   closed=true;aborter.abort();observer.disconnect();controls.dispose();cancelAnimationFrame(frame);
   if(model)scene.remove(model);
   for(const pending of models.values())void pending.then(disposeModel,()=>{});
   renderer.dispose();
  }
 };
}
