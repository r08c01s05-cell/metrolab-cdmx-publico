import * as T from 'three';
import { GLTFLoader } from '../vendor/GLTFLoader.js';

const base = new URL('../models/',import.meta.url);
const archivos = {
  subestacion:'revision142/subestacion142.glb.gz',
  nm22:'NM22_cabina.glb.gz',
  mp82:'MP82_cabina.glb.gz',
};
const cache = new Map();

function cargar(clave) {
  if(!cache.has(clave)) {
    cache.set(clave,(async()=>{
      const url=new URL(archivos[clave],base);
      const respuesta=await fetch(url);
      if(!respuesta.ok) throw new Error('No se pudo cargar '+archivos[clave]+' ('+respuesta.status+')');
      const bytes=await new Response(respuesta.body.pipeThrough(new DecompressionStream('gzip'))).arrayBuffer();
      return (await new GLTFLoader().parseAsync(bytes,base.href)).scene;
    })().catch(error=>{
      cache.delete(clave);
      throw error;
    }));
  }
  return cache.get(clave);
}

export async function subestacionGLB() {
  const origen=(await cargar('subestacion')).clone();
  origen.updateMatrixWorld(true);
  const piezas=new Map();
  for(const nombre of ['transformer','rectifier','dc']) {
    const equipo=origen.getObjectByName(nombre);
    if(!equipo) throw new Error('Falta el conjunto '+nombre);
    const contenedor=new T.Group();
    contenedor.name='GLB '+nombre;
    contenedor.attach(equipo);
    const centro=new T.Box3().setFromObject(equipo).getCenter(new T.Vector3());
    const frente=new T.Group();
    frente.position.set(centro.x,0,centro.z);
    contenedor.add(frente);
    frente.attach(equipo);
    frente.rotation.y=Math.PI;
    // El cuarto en corte aporta los muros y la cubierta. Se conservan los equipos abiertos.
    contenedor.scale.setScalar(.9);
    contenedor.position.set(17.42,-2.63,-.78);
    piezas.set(nombre,contenedor);
  }
  return piezas;
}

export function trenDeReferencia({sistema,overhead}) {
  return overhead ? null : sistema==='l8' ? 'mp82' : 'nm22';
}

export async function trenGLB(clave) {
  const modelo=(await cargar(clave)).clone();
  if(clave==='mp82') modelo.rotation.y=Math.PI;
  const caja=new T.Box3().setFromObject(modelo);
  const centro=caja.getCenter(new T.Vector3());
  const escala=12.95/caja.getSize(new T.Vector3()).x;
  const grupo=new T.Group();
  grupo.name=clave==='mp82'?'GLB MP-82':'GLB NM-22';
  grupo.scale.setScalar(escala);
  grupo.position.set(32.05-centro.x*escala,-2.355-caja.min.y*escala,-centro.z*escala);
  grupo.add(modelo);
  grupo.updateMatrixWorld(true);
  const captadores=[];
  modelo.traverse(objeto=>{
    if(/^Captador_positivo_B[12]_S-?1$/.test(objeto.name)) {
      captadores.push(new T.Box3().setFromObject(objeto));
    }
  });
  const frente=captadores.filter(c=>c.min.z>0).sort((a,b)=>a.min.x-b.min.x)[0];
  const captador=frente?.getCenter(new T.Vector3());
  if(captador) captador.z=frente.max.z;
  return {grupo,captador:captador?.toArray()};
}
