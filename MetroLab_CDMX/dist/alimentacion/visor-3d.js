import * as T from 'three';
import { RenderBudget101 } from '../render-budget101.js?v=222';
import { OrbitControls } from '../vendor/OrbitControls.js';
import { construirMaqueta } from './escena-3d.js';
import { torresCampo, tramosDeAlimentacion } from './circuito-3d.js';
import { subestacionGLB, trenDeReferencia, trenGLB } from './modelos-glb.js?v=279';

const raiz = document.getElementById('corte-electrico-metro');
const panel = raiz.querySelector('[data-visor]');
const respaldo = raiz.querySelector('[data-scene]');
const controlesUI = raiz.querySelector('[data-controles-3d]');
const flujoUI = raiz.querySelector('[data-flujo]');
const guiasUI = raiz.querySelector('[data-guias]');
const reducirMovimiento = matchMedia('(prefers-reduced-motion: reduce)');
const escena = new T.Scene();
const cielo=new T.DataTexture(new Uint8Array([
  225,229,226,255, 207,218,222,255, 174,198,216,255, 144,181,208,255,
]),1,4);
cielo.colorSpace=T.SRGBColorSpace;
cielo.minFilter=cielo.magFilter=T.LinearFilter;
cielo.needsUpdate=true;
escena.background=cielo;
const render = new T.WebGLRenderer({antialias:true});
render.setPixelRatio(Math.min(devicePixelRatio,1.75));
render.outputColorSpace = T.SRGBColorSpace;
render.toneMapping = T.ACESFilmicToneMapping;
render.toneMappingExposure = 1.08;
render.shadowMap.enabled=true;
render.shadowMap.type=T.PCFShadowMap;
render.shadowMap.autoUpdate=false;
render.domElement.className = 'escena-3d';
render.domElement.setAttribute('aria-hidden','true');
escena.add(new T.HemisphereLight(0xe4efff,0x716151,1.57));
const sol = new T.DirectionalLight(0xffedcf,2.7);
sol.position.set(-28,54,30);
sol.target.position.set(-9,0,-2);
sol.castShadow=true;
sol.shadow.mapSize.set(2048,2048);
Object.assign(sol.shadow.camera,{left:-57,right:57,top:36,bottom:-34,near:1,far:118});
sol.shadow.camera.updateProjectionMatrix();
sol.shadow.normalBias=.075;
sol.shadow.bias=-.0002;
escena.add(sol.target);
escena.add(sol);
const relleno = new T.DirectionalLight(0xd5e9f7,.59);
relleno.position.set(34,7,-8);
escena.add(relleno);
const grupos = construirMaqueta(escena);
function iluminarModelo(grupo) {
  grupo.traverse(objeto=>{
    if(!objeto.isMesh) return;
    objeto.receiveShadow=true;
    const materiales=Array.isArray(objeto.material)?objeto.material:[objeto.material];
    objeto.castShadow=materiales.every(material=>!material.transparent);
  });
  render.shadowMap.needsUpdate=true;
}
const estadoModelos=raiz.querySelector('[data-estado-3d]');
const trenEsquematico=[...grupos.track.children];
const zapataEsquematica=grupos.lateral.getObjectByName('zapata-esquematica');
let trenMontado;
let solicitudTren=0;
let estadoSubestacion='Cargando el GLB de la subestación.';
let estadoTren='';
const camara = new T.PerspectiveCamera(35,1,.12,680);
const controles = new OrbitControls(camara,render.domElement);
controles.maxPolarAngle=Math.PI*.487;
controles.minDistance=2;
controles.maxDistance=600;
const direccion = new T.Vector3(-.22,.4,1).normalize();
const derechaCamara = new T.Vector3(0,1,0).cross(direccion).normalize();
const arribaCamara = direccion.clone().cross(derechaCamara);
const vistaGeneral = new T.Box3(new T.Vector3(-56.5,-4.4,-12.1),new T.Vector3(39.2,24.2,4.6));
const vistaPatio = new T.Box3(new T.Vector3(.9,-3.2,-3.5),new T.Vector3(15.9,8.3,4.1));
let vistaActual='general';
const marcador = new T.Mesh(
  new T.SphereGeometry(.19,16,12),
  new T.MeshBasicMaterial({color:0xffdb77,depthTest:false})
);
marcador.renderOrder=5;
escena.add(marcador);
const posiciones = {
  cfe:[torresCampo.llegada[0],6.43*torresCampo.escala,torresCampo.llegada[2]],
  seat:[7.2,2.89,-.4], cable:[11.6,-1.75,3.62],
  tr:[14.76,.58,.25], rec:[18.2,1.02,.85], track:[29,.66,1.38],
  return:[22.92,-2.47,2.72], aux:[10.55,2.94,-1.5],
};
const capaRotulos = document.createElement('div');
capaRotulos.className='rotulos-3d';
capaRotulos.setAttribute('aria-hidden','true');
const clavesRotulos = ['cfe','seat','cable','tr','rec','track','return','aux'];
const rotulos = new Map(clavesRotulos.map(clave=>{
  const rotulo=document.createElement('span');
  rotulo.dataset.rotulo=clave;
  capaRotulos.append(rotulo);
  return [clave,rotulo];
}));
const proyeccion = new T.Vector3();
let seleccion;
let animar = !reducirMovimiento.matches;
let guias=true;
let instante = 0;
let ultimo = 0;
let cuadro = 0;
let pendiente = true;
let rutas = [];
const colores = {ac:0x196fe1,dc:0xeb5e0c,ret:0x14956c};

function ruta(tipo,etapa,puntos,curvo=false) {
  const curvas = new T.CurvePath();
  const vertices=puntos.map(punto=>new T.Vector3(...punto));
  if(curvo) {
    curvas.add(new T.CatmullRomCurve3(vertices));
  } else {
    for(let i=1;i<vertices.length;i++) curvas.add(new T.LineCurve3(vertices[i-1],vertices[i]));
  }
  const color=colores[tipo];
  const material=new T.MeshStandardMaterial({
    color:curvo?0x667375:tipo==='ac'?0x30383d:tipo==='dc'?0x76533a:0x515e5d,
    roughness:curvo?.37:.69,metalness:curvo?.78:.24,
  });
  const radio=curvo?.047:.046;
  const tubo=new T.Mesh(new T.TubeGeometry(curvas,Math.max(24,puntos.length*12),radio,8),material);
  tubo.receiveShadow=true;
  tubo.castShadow=curvo;
  const guia=new T.Mesh(tubo.geometry,new T.MeshBasicMaterial({
    color,transparent:true,opacity:curvo?.42:.55,depthWrite:false,toneMapped:false,
  }));
  guia.visible=guias;
  tubo.userData.etapa=etapa;
  const longitud=curvas.getLength();
  const cantidad=Math.max(1,Math.floor(longitud/2.15));
  const pulsos=new T.InstancedMesh(
    new T.ConeGeometry(.104,.28,8),new T.MeshBasicMaterial({color,toneMapped:false}),cantidad
  );
  pulsos.frustumCulled=false;
  pulsos.visible=guias;
  const grupo=new T.Group();
  grupo.add(tubo,guia,pulsos);
  escena.add(grupo);
  const trans=new T.Object3D(), eje=new T.Vector3(0,1,0);
  return {
    tubo,
    mostrarGuias(mostrar) {
      guia.visible=pulsos.visible=mostrar;
    },
    actualizar(segundos) {
      for(let i=0;i<cantidad;i++) {
        const t=(i/cantidad+segundos*3.2/longitud)%1;
        trans.position.copy(curvas.getPoint(t));
        trans.quaternion.setFromUnitVectors(eje,curvas.getTangent(t).normalize());
        trans.updateMatrix();
        pulsos.setMatrixAt(i,trans.matrix);
      }
      pulsos.instanceMatrix.needsUpdate=true;
    },
    retirar() {
      escena.remove(grupo);
      for(const objeto of [tubo,pulsos]) {
        objeto.geometry.dispose();
        objeto.material.dispose();
      }
      guia.material.dispose();
      pulsos.dispose();
    }
  };
}

function configurarRed(datos) {
  for(const tramo of rutas) tramo.retirar();
  rutas=tramosDeAlimentacion({...datos,captador:trenMontado?.captador}).map(tramo=>ruta(...tramo));
  grupos.cfe.visible=!datos.mediumOnly;
  grupos.campo.visible=!datos.mediumOnly;
  grupos.portico.visible=!datos.mediumOnly;
  grupos.llegadaMedia.visible=Boolean(datos.mediumOnly);
  grupos.aerea.visible=Boolean(datos.overhead);
  grupos.lateral.visible=!datos.overhead;
  render.shadowMap.needsUpdate=true;
}

function informarModelos() {
  estadoModelos.textContent=[estadoSubestacion,estadoTren].filter(Boolean).join(' ');
}
async function incorporarSubestacion() {
  try {
    const piezas=await subestacionGLB();
    grupos.tr.clear();
    grupos.rec.clear();
    grupos.tr.add(piezas.get('transformer'));
    grupos.rec.add(piezas.get('rectifier'),piezas.get('dc'));
    iluminarModelo(grupos.tr);
    iluminarModelo(grupos.rec);
    estadoSubestacion='Subestación GLB en corte.';
  } catch(error) {
    console.warn(error);
    estadoSubestacion='Subestación esquemática. El archivo GLB no se pudo cargar.';
  }
  informarModelos();
  solicitarDibujo();
}
async function incorporarTren(datos) {
  const solicitud=++solicitudTren;
  const clave=trenDeReferencia(datos);
  trenMontado?.grupo.removeFromParent();
  trenMontado=undefined;
  for(const pieza of trenEsquematico) pieza.visible=true;
  zapataEsquematica.visible=true;
  render.shadowMap.needsUpdate=true;
  estadoTren=clave?'Cargando el coche del Metro.':'Tren con pantógrafo representado de forma esquemática.';
  informarModelos();
  if(!clave) return;
  try {
    const modelo=await trenGLB(clave);
    if(solicitud!==solicitudTren) return;
    trenMontado=modelo;
    grupos.track.add(modelo.grupo);
    iluminarModelo(modelo.grupo);
    for(const pieza of trenEsquematico) pieza.visible=false;
    zapataEsquematica.visible=!modelo.captador;
    configurarRed(seleccion);
    estadoTren=clave==='mp82'?'Coche MP-82 del simulador.':'Coche NM-22 del simulador como referencia.';
  } catch(error) {
    if(solicitud!==solicitudTren) return;
    console.warn(error);
    estadoTren='Tren esquemático. El archivo GLB no se pudo cargar.';
  }
  informarModelos();
  solicitarDibujo();
}

function puntoEtapa(clave) {
  if(clave==='cfe' && seleccion.mediumOnly) return [1.65,2.44,.1];
  if(clave==='track') return seleccion.overhead?[31.5,2.08,0]:[31.5,-1.88,2.05];
  return posiciones[clave];
}
function actualizarRotulos() {
  if(!seleccion) return;
  const ancho=panel.clientWidth, alto=panel.clientHeight;
  const cerca=camara.position.distanceTo(controles.target)<28;
  const ocupados=[];
  const orden=[seleccion.etapa,...clavesRotulos.filter(clave=>clave!==seleccion.etapa)];
  for(const clave of orden) {
    const rotulo=rotulos.get(clave);
    proyeccion.set(...puntoEtapa(clave)).project(camara);
    const x=(1+proyeccion.x)*ancho/2, y=(1-proyeccion.y)*alto/2;
    const activo=clave===seleccion.etapa;
    rotulo.hidden=(!activo&&(cerca||ancho<620||clave==='aux')) ||
      proyeccion.z>1 || x<0 || x>ancho || y<28 || y>alto-10;
    if(rotulo.hidden) continue;
    const izquierda=Math.max(4,Math.min(x-rotulo.offsetWidth/2,ancho-rotulo.offsetWidth-4));
    const abajo=['cable','return','track'].includes(clave) && y<alto-54;
    const largo=clave==='rec'&&!cerca?38:12;
    const arriba=abajo?y+largo:y-rotulo.offsetHeight-largo;
    const caja={izquierda,arriba,derecha:izquierda+rotulo.offsetWidth,fondo:arriba+rotulo.offsetHeight};
    if(ocupados.some(r=>caja.izquierda<r.derecha+6&&caja.derecha>r.izquierda-6&&caja.arriba<r.fondo+4&&caja.fondo>r.arriba-4)) {
      rotulo.hidden=true;
      continue;
    }
    ocupados.push(caja);
    rotulo.style.left=izquierda+'px';
    rotulo.style.top=arriba+'px';
    rotulo.style.setProperty('--anclaje',(x-izquierda)+'px');
    rotulo.style.setProperty('--guia',largo+'px');
    rotulo.classList.toggle('debajo',abajo);
    rotulo.classList.toggle('activo',activo);
  }
}
const presupuesto = new RenderBudget101(render, {fps:60, maxDpr:2});

function dibujar() {
  render.render(escena,camara);
  actualizarRotulos();
}
function solicitarDibujo() {
  pendiente=true;
  if(!cuadro) cuadro=requestAnimationFrame(tick);
}
function tick(ahora) {
  cuadro=0;
  if (!presupuesto.allows(ahora)) {
    if (pendiente || (animar && guias)) cuadro=requestAnimationFrame(tick);
    return;
  }
  if(animar && guias) {
    if(ultimo) instante+=Math.min(.05,(ahora-ultimo)/1000);
    ultimo=ahora;
  }
  if((animar && guias) || pendiente) {
    if(guias) for(const tramo of rutas) tramo.actualizar(instante);
    dibujar();
    pendiente=false;
  }
  if(animar && guias) cuadro=requestAnimationFrame(tick);
}
function estadoFlujo() {
  flujoUI.textContent=animar?'Pausar flujo':'Reanudar flujo';
  ultimo=0;
  solicitarDibujo();
}
function enfocar(caja) {
  const centro=caja.getCenter(new T.Vector3());
  const pendienteVertical=Math.tan(T.MathUtils.degToRad(camara.fov/2))*.83;
  const pendienteHorizontal=pendienteVertical*camara.aspect;
  let distancia=4;
  for(const x of [caja.min.x,caja.max.x]) for(const y of [caja.min.y,caja.max.y]) for(const z of [caja.min.z,caja.max.z]) {
    const vertice=new T.Vector3(x,y,z).sub(centro);
    const lateral=Math.abs(vertice.dot(derechaCamara))/pendienteHorizontal;
    const vertical=Math.abs(vertice.dot(arribaCamara))/pendienteVertical;
    distancia=Math.max(distancia,vertice.dot(direccion)+Math.max(lateral,vertical));
  }
  controles.target.copy(centro);
  camara.position.copy(centro).addScaledVector(direccion,distancia);
  controles.update();
  solicitarDibujo();
}
function general() {
  vistaActual='general';
  enfocar(seleccion?.mediumOnly
    ? new T.Box3(new T.Vector3(-1,-4.4,-4.6),new T.Vector3(39.2,3.3,4.6))
    : vistaGeneral);
}
function patio() {
  vistaActual='patio';
  enfocar(vistaPatio);
}
function acercar() {
  if(!seleccion) return;
  vistaActual='equipo';
  const clave=seleccion.etapa==='cfe' && seleccion.mediumOnly?'llegadaMedia':seleccion.etapa;
  const caja=new T.Box3().setFromObject(grupos[clave]);
  if(caja.isEmpty()) caja.setFromCenterAndSize(marcador.position,new T.Vector3(3,3,3));
  enfocar(caja.expandByScalar(.65));
}

function seleccionar(evento) {
  const nueva=evento.detail;
  const cambioDeLinea=nueva.sistema!==seleccion?.sistema;
  seleccion=nueva;
  if(cambioDeLinea) {
    incorporarTren(nueva);
    configurarRed(nueva);
    if(vistaActual==='general') general();
  }
  const {high,medium,dc,secondary,overhead,mediumOnly}=seleccion;
  const textos={
    cfe:'CFE · '+high, seat:mediumOnly?'Cabecera · '+medium:high+' → '+medium,
    cable:'Alimentador · '+medium, tr:secondary?medium+' → '+secondary+'*':'Transformador de tracción',
    rec:'Rectificador · '+dc, track:(overhead?'Catenaria':'Barra guía')+' · '+dc,
    return:'Retorno por rieles',aux:'Alumbrado y fuerza',
  };
  for(const [clave,rotulo] of rotulos) rotulo.textContent=textos[clave];
  marcador.position.set(...puntoEtapa(seleccion.etapa));
  solicitarDibujo();
}
const raycaster = new T.Raycaster();
let inicio;
render.domElement.addEventListener('pointerdown',evento => { inicio=[evento.clientX,evento.clientY]; });
render.domElement.addEventListener('pointerup',evento => {
  if(!inicio || evento.button!==0 || Math.hypot(evento.clientX-inicio[0],evento.clientY-inicio[1])>5) return;
  const rect=render.domElement.getBoundingClientRect();
  raycaster.setFromCamera(new T.Vector2(
    2*(evento.clientX-rect.left)/rect.width-1,1-2*(evento.clientY-rect.top)/rect.height
  ),camara);
  const objetos=[...Object.values(grupos).filter(g=>g.visible),...rutas.map(tramo=>tramo.tubo)];
  const interseccion=raycaster.intersectObjects(objetos,true).find(({object})=>{
    for(let nodo=object;nodo;nodo=nodo.parent) if(!nodo.visible) return false;
    return true;
  });
  if(!interseccion) return;
  let conjunto=interseccion.object;
  while(conjunto.parent && conjunto.parent!==escena && !conjunto.userData.etapa) conjunto=conjunto.parent;
  const clave=conjunto.userData.etapa??conjunto.name;
  const etapa={aerea:'track',lateral:'track',llegadaMedia:'cfe',portico:'seat'}[clave]??clave;
  raiz.querySelector('[data-etapa="'+etapa+'"]')?.click();
});
controles.addEventListener('change',solicitarDibujo);
raiz.addEventListener('maqueta:seleccion',seleccionar);
raiz.querySelector('[data-general]').addEventListener('click',general);
raiz.querySelector('[data-patio]').addEventListener('click',patio);
raiz.querySelector('[data-acercar]').addEventListener('click',acercar);
flujoUI.addEventListener('click',()=>{animar=!animar;estadoFlujo();});
guiasUI.addEventListener('click',()=>{
  guias=!guias;
  guiasUI.setAttribute('aria-pressed',String(guias));
  flujoUI.disabled=!guias;
  for(const tramo of rutas) tramo.mostrarGuias(guias);
  estadoFlujo();
});
reducirMovimiento.addEventListener('change',evento=>{animar=!evento.matches;estadoFlujo();});
new ResizeObserver(() => {
  const ancho=Math.max(1,panel.clientWidth), alto=Math.max(1,render.domElement.clientHeight);
  render.setSize(ancho,alto,false);
  camara.aspect=ancho/alto;
  camara.updateProjectionMatrix();
  if(vistaActual==='patio') patio();
  else if(vistaActual==='equipo') acercar();
  else general();
}).observe(panel);
panel.append(render.domElement);
panel.append(capaRotulos);
respaldo.hidden=true;
controlesUI.hidden=false;
general();
raiz.dispatchEvent(new Event('maqueta:consultar'));
incorporarSubestacion();
estadoFlujo();
