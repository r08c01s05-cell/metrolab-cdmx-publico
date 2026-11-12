import {installRouteEnergy249} from './energy-flow249.js?v=255';
import {STATION_REFERENCES213} from './station-reference213.js?v=215';
import {finishStation213,finishSurfaceArchitecture213,updateStationBounce213} from './station-finish213.js?v=215';
import {bogieHalf212} from './car-support212.js?v=212';
import {finishObservatorio209} from './terminal-surface209.js?v=209';
import {configureLayout208,isCoyuya208,isSurfaceIsland209,surfaceSpec209,platformEye209,trainTrack208,doorSide208,offsetAt208} from './station-layout208.js?v=209';
import {makeCoyuya208,widenCoyuya208} from './coyuya208.js?v=209';
import {PlatformPerson178} from './platform-person178.js?v=260';
import{platformSolids169,clampPlatformCamera169,constrainPlatformActors169}from'./platform-collision169.js?v=225';
import{finishPlatforms160}from'./platform-finish160.js?v=205';
import {Cockpit149} from './cockpit149.js?v=264';
import {updateCabDisplay147,disposeCabDisplay147} from './cab-display147.js?v=147';
import {gate142,prepareFrame142,waitUntil142} from './resource-gate142.js?v=150';
import {photographicRenderer130,inspectionShadows130,updateInspectionShadows130,shadowModel130} from './photographic130.js?v=205';
import {stationContacts122} from './world-contact122.js?v=222';
import {cameraCuts109} from './camera-cuts109.js?v=178';
import {cutawaySide108} from './cutaway108.js';
import{contactShadow105}from'./contact-shadow105.js?v=105';
import{updateWeather103}from'./weather-scene103.js?v=122';
import {RenderBudget101,freezeStatic101} from './render-budget101.js?v=222';
import {refineSurfaceMaterials100,setupCabinLighting100,updateQualityLighting100} from './visual-quality100.js?v=264';
import {updateTrainLod259} from './train-lod259.js?v=260';
import {freezeStatic260,peopleInterval260} from './frame-budget260.js?v=260';
import {updateWeathering259} from './weathering259.js?v=259';
import {tunnelProfile97,finishTunnel97} from './tunnel-finish97.js?v=122';
import {createAlignment97,bakeInfrastructure97,renderCurved97} from './route-geometry97.js?v=212';
import {buildTrack99,retireStationTracks99,buildStationSafety99,updateSignals99} from './track-details99.js?v=115';
import {substationPlan94,wallSpans94,makeSubstation94} from './substations94.js?v=264';
import {applyMotorRole90} from './motor-runtime90.js?v=111';
import {loadCompressedGLB} from './compressed-assets89.js?v=204';
import{WorkshopNavigation}from'./workshop-navigation.js?v=61';
import{stationLoadPlan,prepareStationTextures}from'./station-streaming.js?v=69';
import{carReference}from'./train-formation.js?v=64';
import {prepareTrainDisplays,updateTrainDisplay,disposeTrainDisplay} from './train-displays.js?v=52';
import {predictArrivals,prepareArrivalDisplays,drawArrivalDisplays} from './arrival-displays.js?v=51';
import * as THREE from 'three';
import {GLTFLoader} from './vendor/GLTFLoader.js';
import {OrbitControls} from './vendor/OrbitControls.js';
import {batchStationModel,disposeStationModel,prepareStationMaterials,TRACK_OFFSET,PLATFORM_EDGE,trackCenter,platformSide} from './station-assets.js?v=208';
import {createMetroEnvironment,enhanceMetroMaterials,makeNM79Overview,batchTrainStatics} from './metro-render.js?v=222';
import {doorOpenness,planPassengerStop} from './passenger-flow.js?v=260';
import {buildNaturalPassengerFrame} from './passenger-journeys.js?v=260';
import {preparePocketDoors,updatePocketDoor} from './train-doors.js?v=29';
import {TrainAudio} from './train-audio.js?v=206';
import {CabinCharacters} from './cabin-characters.js?v=264';
import {trainPrefix,loadTrainPair} from './train-assets.js?v=34';
const $=id=>document.getElementById(id);
const readiness214=new WeakMap();
export class StationScene {
 constructor(getState){this.getState=getState;this.lastLine=0;this.lastStation=-1;this.lastTrain='';this.cameraMode='full';this.frame=0;this.elapsed=0;this.trainMeshes=new Map();this.trainTemplates=new Map();this.geometry=new Map();this.materials=new Map();this.passengerStops=new Map();this.passengerTime=0;this.personMotionTime=0;this.previousMotionFrame=0;this.nameTextures=[];this.assets=new Map();this.loading=new Map();this.stationCache=new Map();this.tunnelMeshes=[];this.fixedAnchor=null;this.loader=new GLTFLoader();this.audio=new TrainAudio();
 const canvas=$('station-3d');this.renderer=new THREE.WebGLRenderer({canvas,antialias:true,alpha:false,powerPreference:'high-performance'});this.renderBudget101=new RenderBudget101(this.renderer,{fps:60});this.renderer.setClearColor(0xcbd9e4);this.renderer.shadowMap.enabled=false;this.renderer.shadowMap.type=THREE.PCFSoftShadowMap;this.renderer.outputColorSpace=THREE.SRGBColorSpace;photographicRenderer130(this.renderer);this.renderer.toneMappingExposure=1;this.scene=new THREE.Scene();this.reflectionEnvironment=createMetroEnvironment(this.renderer,'station');this.scene.environment=this.reflectionEnvironment.texture;this.scene.environmentIntensity=.75;this.scene.fog=new THREE.Fog(0xcbd9e4,290,850);this.camera=new THREE.PerspectiveCamera(38,1,.1,5000);this.controls=new OrbitControls(this.camera,canvas);this.controls.enableDamping=false;this.controls.autoRotate=false;this.controls.maxPolarAngle=Math.PI*.5;this.controls.minDistance=8;this.controls.maxDistance=390;this.controls.enablePan=true;this.navigation=new WorkshopNavigation(this.controls,canvas,THREE,()=>this.navigationHint());
 this.ambientLight=new THREE.HemisphereLight(0xeff2ee,0x343b38,.9);this.scene.add(this.ambientLight);this.sun=new THREE.DirectionalLight(0xfff1df,1.75);this.sun.position.set(100,130,55);this.sun.castShadow=true;this.sun.shadow.mapSize.set(1024,1024);this.sun.shadow.camera.left=-125;this.sun.shadow.camera.right=125;this.sun.shadow.camera.top=100;this.sun.shadow.camera.bottom=-100;this.sun.shadow.camera.near=1;this.sun.shadow.camera.far=400;this.sun.shadow.bias=-.0003;this.scene.add(this.sun);this.scene.add(this.sun.target);
 setupCabinLighting100(this);this.infrastructure=new THREE.Group();this.scene.add(this.infrastructure);this.stations=new THREE.Group();this.scene.add(this.stations);this.buildPeople();this.resize();this.setupEvents();this.loadLine(this.getState()?.currentLine||1);this.setCamera('full',true);this.observer=new ResizeObserver(()=>this.resize());this.observer.observe($('scene-viewport'));$('scene-loading').hidden=true;this.animate(0);
 }
 mat(color,options={}){const key=color+JSON.stringify(options);if(!this.materials.has(key))this.materials.set(key,new THREE.MeshStandardMaterial({color,roughness:.75,...options}));return this.materials.get(key);}
 box(parent,x,y,z,w,h,d,color,options={}){const key=[w,h,d].join(',');let g=this.geometry.get(key);if(!g){g=new THREE.BoxGeometry(w,h,d,(this.alignment97||this.islandLine208)?Math.min(2000,Math.max(1,Math.ceil(w/6))):1);this.geometry.set(key,g);}const m=new THREE.Mesh(g,this.mat(color,options));m.position.set(x,y,z);m.castShadow=h>1;m.receiveShadow=true;parent.add(m);return m;}
 cylinder(parent,x,y,z,r,h,color){let key=`cyl-${r}-${h}`,g=this.geometry.get(key);if(!g){g=new THREE.CylinderGeometry(r,r,h,10);this.geometry.set(key,g);}const m=new THREE.Mesh(g,this.mat(color));m.position.set(x,y,z);m.castShadow=true;parent.add(m);return m;}
 buildTracks(line){
 configureLayout208(line);this.islandLine208=line.stations.some(isSurfaceIsland209);
 const dead94=new Set();for(const room of this.substations94||[])room.traverse(o=>{if(o.geometry)dead94.add(o.geometry);if(o.material){dead94.add(o.material);if(o.material.map)dead94.add(o.material.map);}});this.infrastructure.traverse(o=>{if(o.userData.safetyLabel99||o.userData.signalLamp99){dead94.add(o.geometry);dead94.add(o.material);if(o.material.map)dead94.add(o.material.map);}});for(const item of dead94)item.dispose();this.nameTextures=this.nameTextures.filter(t=>!dead94.has(t));this.infrastructure.traverse(o=>{if(o.isInstancedMesh||o.userData.routeGeometry97)o.geometry.dispose();});this.infrastructure.clear();this.tunnelMeshes=[];const data97=this.getState?.()?.engine?.data;this.alignment97=createAlignment97(line,data97?.['recorrido_L'+line.stations[0].linea]);const p=this.infrastructure;this.substations94=[];const saf94=substationPlan94(line);
 this.box(p,line.total/2,-.65,0,line.total+500,1,24,'#536064');
 buildTrack99(this,line);buildStationSafety99(this,line);
 for(let i=0;i<line.stations.length-1;i++){
  const a=line.distances[i]+81,b=line.distances[i+1]-81;if(b<=a)continue;
  const start=line.stations[i].entorno_visual,end=line.stations[i+1].entorno_visual;
  const group=new THREE.Group();group.name='Tunel_'+line.stations[i].id+'_'+line.stations[i+1].id;p.add(group);
  const profile97=tunnelProfile97(line,i),surfaceA=profile97.surfaceA,surfaceB=profile97.surfaceB;group.userData.tunnelProfile97=profile97;
  const width=line.stations[i].linea===1?8.8:9.2,height=line.stations[i].linea===1?5.3:5.6;
  if(surfaceA&&surfaceB){for(const side of [-1,1]){const wall=this.box(group,(a+b)/2,1.5,side*width/2,b-a,3,.35,'#abb2aa');wall.userData.shell='wall';wall.userData.side=side;}}
  else {
   let from=a,to=b;if(surfaceA)from=a+(b-a)*.35;if(surfaceB)to=b-(b-a)*.35;
   const wallColor=line.stations[i].linea===1?'#96988c':'#9aab9a',length=to-from,center=(from+to)/2;
   for(const side of [-1,1])for(const [wa,wb]of wallSpans94(from,to,side,saf94)){const wall=this.box(group,(wa+wb)/2,height/2,side*width/2,wb-wa,height,.45,wallColor);wall.userData.shell='wall';wall.userData.side=side;}
   const roof=this.box(group,center,height,0,length,.4,width,wallColor);roof.userData.shell='roof';
   for(const side of [-1,1])for(const [ca,cb]of wallSpans94(from,to,side,saf94)){this.box(group,(ca+cb)/2,2.65,side*(width/2-.30),cb-ca,.08,.16,'#252a2b');this.box(group,(ca+cb)/2,1.55,side*(width/2-.32),cb-ca,.055,.15,'#3b3930');}
   const ribs=Math.max(1,Math.ceil(length/24));for(let j=0;j<ribs;j++){const x=from+j*length/ribs;for(const side of [-1,1]){if(saf94.some(p=>p.side===side&&Math.abs(p.x-x)<p.width/2+.3))continue;const rib=this.box(group,x,height/2,side*(width/2-.30),.25,height,.22,'#92978e');rib.userData.shell='wall';rib.userData.side=side;}const lamp=this.box(group,x,height-.42,0,2.4,.08,.16,'#e1dfc8',{emissive:'#f4e3ad',emissiveIntensity:.7});lamp.userData.shell='roof';}
   for(const boundary of [from,to])for(const side of [-1,1]){const portal=this.box(group,boundary,height/2,side*(width/2-.2),.4,height,.45,'#a1a79e');portal.userData.shell='wall';portal.userData.side=side;}
   if(surfaceA||surfaceB){const boundary=surfaceA?from:to,direction=surfaceA?-1:1;for(let j=0;j<8;j++){const wall=this.box(group,boundary+direction*(j+1)*8,height*(1-j/8)/2,width/2,8,height*(1-j/8),.35,'#7d877c');wall.userData.shell='wall';wall.userData.side=1;}}
  }
  this.wallSpans97=wallSpans94;finishTunnel97(this,group,a,b,width,saf94);this.tunnelMeshes.push({group,from:a,to:b});
 }
 const prefab94=saf94.length?makeSubstation94():null;for(const plan of saf94){const room=prefab94.clone(true);room.position.set(plan.x,0,plan.side*(plan.exterior?11.6:(line.stations[0].linea===8?4.6:4.4)));if(plan.side<0)room.rotation.y=Math.PI;room.userData={...room.userData,...plan};p.add(room);if(plan.exterior){this.box(room,0,-.08,1.8,9,.16,6,'#93978b');this.box(room,0,4.04,1.65,7,.2,3.8,'#a2aba0');for(const x of[-2,2])this.box(room,x,4.19,2.8,.8,.2,.6,'#5c6864');}this.substations94.push(room);const label=this.textPanel(room,(plan.exterior?'LOCAL EXTERIOR':plan.kind)+' · '+plan.station+' · ilustrativo',0,3.48,-.13,5.9,.38,'#174b4a');label.rotation.y=Math.PI;}
 widenCoyuya208(this.infrastructure,line,offsetAt208);refineSurfaceMaterials100(this.infrastructure,this.renderer?.capabilities?.getMaxAnisotropy?.()??4);this.infrastructure.position.set(0,0,0);bakeInfrastructure97(this.infrastructure,this.alignment97);freezeStatic101(this.infrastructure);this.shellState101=null;
 }
 textPanel(parent,text,x,y,z,width,height,color='#263f56',ink='white'){const canvas=document.createElement('canvas');canvas.width=1024;canvas.height=128;const c=canvas.getContext('2d');c.fillStyle=color;c.fillRect(0,0,1024,128);c.fillStyle=ink;c.textAlign='center';c.textBaseline='middle';c.font='bold 58px Arial';let size=58;while(c.measureText(text).width>940&&size>25)c.font=`bold ${--size}px Arial`;c.fillText(text,512,64);const texture=new THREE.CanvasTexture(canvas);texture.colorSpace=THREE.SRGBColorSpace;this.nameTextures.push(texture);const mesh=new THREE.Mesh(new THREE.PlaneGeometry(width,height),new THREE.MeshBasicMaterial({map:texture,side:THREE.DoubleSide}));mesh.position.set(x,y,z);parent.add(mesh);return mesh;}
 makeStation(station,pos,color){
 const p=new THREE.Group();p.name='Estacion_'+station.id;p.userData={stationId:station.id,loaded:false,error:false,attempts:1};p.position.x=pos;if(this.alignment97){const pose97=this.alignment97.pose(pos);p.position.set(pose97.x,0,pose97.z);p.rotation.y=pose97.yaw;}this.stations.add(p);
 if(isSurfaceIsland209(station)){
 const source=makeCoyuya208(station);finishSurfaceArchitecture213(source,station);prepareStationMaterials(source,this.renderer.capabilities.getMaxAnisotropy());refineSurfaceMaterials100(source,this.renderer.capabilities.getMaxAnisotropy());finishPlatforms160(source,this.renderer.capabilities.getMaxAnisotropy());finishStation213(source,station,this.renderer.capabilities.getMaxAnisotropy());p.userData.solids169=platformSolids169(source);p.userData.solids169.layout208='island';
 p.userData.arrivalDisplays=prepareArrivalDisplays(source);const model=batchStationModel(source);p.add(model);p.userData.model=model;p.userData.loaded=true;p.userData.layout208='island';const spec209=surfaceSpec209(station);station.geometria_3d={...station.geometria_3d,tipo_anden_modelado:spec209.kind==='terminal'?'dos islas y tres vías':'central',revision_modelo:'SUPERFICIE-209',confianza_visual:'referencia fotográfica · dimensiones aproximadas',observado:spec209.kind==='terminal'?'Terminal de dos islas con vía central y dos vías exteriores. Vía central representada sin servicio automático.':'Isla entre dos vías; paleta y estructura según referencia local de la estación.',supuestos:['Dimensiones de simulación: islas de 156 × 7.5 m, altura 1.2 m. No son cotas levantadas.','Escaleras, pasarelas y mobiliario con ubicación aproximada; pendientes de plano acotado.'],dimensiones_provisionales_m:{longitud:156,ancho_anden_central:7.5,altura_plataforma:1.2,centros_vias:spec209.kind==='terminal'?[-10.4,0,10.4]:[-5.2,5.2]}};p.userData.textureCount=prepareStationTextures(model,this.renderer);p.userData.loadTask=Promise.resolve();freezeStatic101(p);this.shellState101=null;return p;
 }
 const fallback=new THREE.Group();p.add(fallback);
 for(const side of [-1,1]){this.box(fallback,0,.59,side*5.65,150,1.18,4.8,'#c9d0d2');this.box(fallback,0,1.21,side*3.42,150,.02,.24,'#ffcf4b');}
 p.userData.fallback=fallback;
 const url=station.geometria_3d?.url_glb;
 if(!url){p.userData.error=true;return p;}
 p.userData.loadTask=loadCompressedGLB(this.loader,url).then(g=>{
  if(p.parent!==this.stations){disposeStationModel(g.scene);return;}
  retireStationTracks99(g.scene);finishObservatorio209(g.scene,station);prepareStationMaterials(g.scene,this.renderer.capabilities.getMaxAnisotropy());refineSurfaceMaterials100(g.scene,this.renderer.capabilities.getMaxAnisotropy());finishPlatforms160(g.scene,this.renderer.capabilities.getMaxAnisotropy());finishStation213(g.scene,station,this.renderer.capabilities.getMaxAnisotropy());p.userData.solids169=platformSolids169(g.scene);const displays=prepareArrivalDisplays(g.scene);const contacts122=stationContacts122(g.scene),model=batchStationModel(g.scene);model.add(contacts122);p.userData.arrivalDisplays=displays;if(station.linea===8)this.addMapPosters(model,station);p.remove(fallback);p.add(model);p.userData.model=model;p.userData.textureCount=prepareStationTextures(model,this.renderer);p.userData.loaded=true;freezeStatic101(p);this.shellState101=null;
 }).catch(error=>{if(p.parent===this.stations){p.userData.error=true;p.userData.retryAt=performance.now()+5000;console.error('Andenes no disponibles: '+station.id,error);}});
 return p;
 }
 addMapPosters(model,station){
 const texture=new THREE.TextureLoader().load('textures/revision18/mapa_movilidad.jpg');texture.colorSpace=THREE.SRGBColorSpace;
 const material=new THREE.MeshStandardMaterial({map:texture,roughness:.75,side:THREE.DoubleSide});
 const slots=station.geometria_3d?.posiciones_carteles_mapa||[-1,1].map(side=>({side,x:12,y:2.9,z:side*7.72}));
 for(const {side,x,y,z} of slots){const mesh=new THREE.Mesh(new THREE.PlaneGeometry(1.14,1.52),material);mesh.name='Cartel mapa aportado';mesh.position.set(x,y,z);mesh.rotation.y=side>0?Math.PI:0;mesh.userData={componente:'pared',shell:'wall',side};model.add(mesh);}
 }
 clearStations(){for(const p of this.stationCache.values())this.disposeStation(p);this.stationCache.clear();this.stations.clear();}
 disposeStation(p){this.stations.remove(p);if(p.userData.model)disposeStationModel(p.userData.model);}
 refreshStations(line,idx,anchor,focus){
 const keep=stationLoadPlan(line,idx,anchor,focus);
 for(const [i,p]of this.stationCache)if(!keep.has(i)){this.disposeStation(p);this.stationCache.delete(i);}
 for(const i of keep){let p=this.stationCache.get(i);if(p?.userData.error&&p.userData.attempts<3&&performance.now()>=p.userData.retryAt){const attempts=p.userData.attempts;this.disposeStation(p);p=this.makeStation(line.stations[i],line.distances[i],line.color);p.userData.attempts=attempts+1;this.stationCache.set(i,p);}if(!p){p=this.makeStation(line.stations[i],line.distances[i],line.color);this.stationCache.set(i,p);}p.visible=Math.abs(line.distances[i]-anchor)<900;}
 this.lastStation=idx;
 }
 updateShell(anchor){cameraCuts109(this.cameraMode,$);const cut=!['driver','cab-platform'].includes(this.cameraMode)&&$('environment-cutaway').checked;const side=cutawaySide108(this.camera.position,this.alignment97,anchor);
 for(const room of this.substations94||[])room.visible=($('substations-visible94')?.checked!==false)&&Math.abs(room.userData.x-anchor)<550;
 for(const t of this.tunnelMeshes){t.group.visible=t.to>anchor-550&&t.from<anchor+550;}
 const stationCut=!['driver','cab-platform'].includes(this.cameraMode)&&$('station-cutaway').checked,key101=[cut,stationCut,side].join(':');if(this.shellState101===key101)return;this.shellState101=key101;
 for(const [group,showCut] of [[this.infrastructure,cut],[this.stations,!['driver','cab-platform'].includes(this.cameraMode)&&$('station-cutaway').checked]])group.traverse(o=>{if(o.userData.shell)o.visible=!showCut||(o.userData.shell!=='roof'&&o.userData.side!==side);});
 }
 removeTrain(model){disposeCabDisplay147(model.group);disposeTrainDisplay(model.interiorDisplay);this.scene.remove(model.group);model.ownedGeometries?.forEach(g=>g.dispose());}
 loadLine(line){
 const keys=line===1?['NM22_cabina','NM22_intermedio']:['NM79_cabina','NM79_intermedio','MP82_cabina','MP82_intermedio'];
 if(keys.every(k=>this.assets.has(k))){$('model-status').textContent='Modelos actualizados · detalles mecánicos';return;}
 if(this.loading.has(line))return;
 $('model-status').textContent='Cargando modelos Blender de Línea '+line+'… Puedes usar los controles mientras tanto.';
 this.pendingTrainAssets??=new Map();
 const state=this.getState(),selected=state?.engine.trains.find(t=>t.id===state.selectedTrain&&t.line===line);
 const priority=selected?trainPrefix(selected):line===1?'NM22':'NM79';
 const prefixes=line===1?['NM22']:[priority,priority==='NM79'?'MP82':'NM79'];
 const load=async key=>{
  const response=await fetch('models/'+key+'.glb.gz'+'?v=204',{signal:AbortSignal.timeout(45000)});
  if(!response.ok)throw Error(key+': HTTP '+response.status);
  const buffer=await new Response(response.body.pipeThrough(new DecompressionStream('gzip'))).arrayBuffer();
  const g=await this.loader.parseAsync(buffer,'models/');
  g.scene.traverse(o=>{if(o.isMesh){o.castShadow=false;o.receiveShadow=false;}});enhanceMetroMaterials(g.scene,key);refineSurfaceMaterials100(g.scene,this.renderer.capabilities.getMaxAnisotropy());return g.scene;
 };
 // Load the selected train first, so downloading the other fleet does not leave
 // the selected Line 8 train waiting for four large files simultaneously.
 const task=(async()=>{
  const failures=[];for(const prefix of prefixes){try{await loadTrainPair(this.assets,this.pendingTrainAssets,prefix,load);if(this.lastLine===line)$('model-status').textContent=prefix+' listo · '+(prefixes.length>1?'cargando resto de la flota…':'detalles mecánicos');}catch(error){failures.push(error);console.error('Carga de tren',prefix,error);}}
  if(this.lastLine===line)$('model-status').textContent=failures.length?'No se pudo cargar parte de la flota. Pulsa Reintentar trenes.':'Modelos actualizados · detalles mecánicos';
  this.loading.delete(line);
 })();
 this.loading.set(line,task);
 }
 ready142(){if(readiness214.has(this))return readiness214.get(this);const task=Promise.resolve().then(()=>this.prepareReady214()).finally(()=>{if(readiness214.get(this)===task)readiness214.delete(this);});readiness214.set(this,task);return task;}
 async prepareReady214(){if(this.getState()?.engine.operator){this.cockpit149??=new Cockpit149(this);await this.cockpit149.ready();}for(const [i,p]of this.stationCache)if(p.userData.error){this.disposeStation(p);this.stationCache.delete(i);}this.update(performance.now()/1000);const line=this.getState().currentLine;this.loadLine(line);await this.loading.get(line);const keys=line===1?['NM22_cabina','NM22_intermedio']:['NM79_cabina','NM79_intermedio','MP82_cabina','MP82_intermedio'];if(keys.some(k=>!this.assets.has(k)))throw Error('La flota no terminó de cargar');await this.cabinCharacters.loading;if(this.cabinCharacters.error)await this.cabinCharacters.retry();if(!this.cabinCharacters.ready)throw Error('No se pudieron cargar los personajes. '+(this.cabinCharacters.error?.message||''));if(this.cabinCharacters.warning145)$('model-status').textContent='Trenes listos · recuperando algunos personajes en segundo plano.';await waitUntil142(()=>{const entries=[...this.stationCache.values()].filter(p=>p.visible);if(entries.some(p=>p.userData.error))throw Error('No se pudo cargar el andén');return entries.length&&entries.every(p=>p.userData.loaded);},'andenes');this.update(performance.now()/1000);await prepareFrame142(this);}
 modelPrefix(t){return trainPrefix(t);}
 detailedReady(t){const prefix=this.modelPrefix(t);return this.assets.has(prefix+'_cabina')&&this.assets.has(prefix+'_intermedio');}
 buildDetailedTemplate(t){
 const group=new THREE.Group(),roof=[],doors=[],cutWalls=[],ownedGeometries=[],variants101=new Map();const prefix=this.modelPrefix(t);let originalMeshes=0,meshes=0;
 for(let i=0;i<9;i++){
  const ref=carReference(i),isCab=ref.cab,reversed=prefix==='MP82'?i===0:i===8,key101=[isCab,ref.powered,reversed].join(':');let wrapper;
  if(variants101.has(key101))wrapper=variants101.get(key101).clone(true);
  else{const car=this.assets.get(prefix+(isCab?'_cabina':'_intermedio')).clone(true);wrapper=new THREE.Group();applyMotorRole90(car,i);car.scale.x=.965;car.rotation.y=reversed?Math.PI:0;wrapper.add(car);car.traverse(o=>{if(!isCab&&o.userData.familia_visual==='cab')o.visible=false;});ownedGeometries.push(...batchTrainStatics(wrapper,{bogieHalf212:bogieHalf212(t)}));variants101.set(key101,wrapper);}
  wrapper.userData.carIndex=i;wrapper.userData.formationReference=ref;if(!wrapper.getObjectByName('Sombra_de_contacto105'))wrapper.add(contactShadow105(16.2,3.5));wrapper.traverse(o=>{if(o.userData.contact105)o.raycast=()=>{};});
  wrapper.traverse(o=>{if(o.name.startsWith('Puerta_S')&&!o.isMesh){const match=o.name.match(/Puerta_S(-?1)_(\d+)_Hoja_(-?1)/);if(match)doors.push({mesh:o,x:o.position.x,half:Number(match[3]),side:-Number(match[1])*(reversed?-1:1),portalKey:i+'_'+match[2]});}});
  originalMeshes+=wrapper.userData.renderStats.originalMeshes;meshes+=wrapper.userData.renderStats.meshes;wrapper.position.x=(i-4)*16.7;group.add(wrapper);
 }
 group.traverse(o=>{if(o.userData.contact105)o.raycast=()=>{};const family=o.userData.familia_visual;if(family==='roof')roof.push(o);if(family==='wallPos'||family==='wallNeg')cutWalls.push(o);});group.userData.renderStats={originalMeshes,meshes,uniqueCarVariants101:variants101.size};
 return {group,roof,doors,cutWalls,detailed:true,ownedGeometries};
 }
 clearTrainTemplates(){for(const template of this.trainTemplates?.values()||[])template.ownedGeometries.forEach(g=>g.dispose());this.trainTemplates?.clear();}
 makeDetailed(t){
 this.trainTemplates??=new Map();const prefix=this.modelPrefix(t);
 let template=this.trainTemplates.get(prefix);if(!template){template=this.buildDetailedTemplate(t);this.trainTemplates.set(prefix,template);}
 const group=template.group.clone(true),roof=[],cutWalls=[];
 const doors=template.doors.map(d=>({...d,mesh:group.children[Number(d.portalKey.split('_')[0])].getObjectByName(d.mesh.name)}));
 group.traverse(o=>{if(o.userData.contact105)o.raycast=()=>{};const family=o.userData.familia_visual;if(family==='roof')roof.push(o);if(family==='wallPos'||family==='wallNeg')cutWalls.push(o);});
 const interiorDisplay=t.line===1?prepareTrainDisplays(group):null;preparePocketDoors(doors);this.scene.add(group);return {group,roof,doors,cutWalls,detailed:true,ownedGeometries:[],prefix,interiorDisplay};
 }
 ensureTrainModel(t,anchor){
 const distance=Math.abs(t.position-anchor);let model=this.trainMeshes.get(t.id);
 if(distance>900){if(model){this.removeTrain(model);this.trainMeshes.delete(t.id);}return null;}
 // Prepare before the 430 m visibility boundary; retain until 900 m to avoid churn.
 if(!model&&distance>=650)return null;
 if(!this.detailedReady(t))return null;
 if(model&&(!model.detailed||model.prefix!==this.modelPrefix(t))){this.removeTrain(model);this.trainMeshes.delete(t.id);model=null;}
 if(!model){model=this.makeDetailed(t);this.trainMeshes.set(t.id,model);}
 model.group.visible=distance<430;return model;
 }
 makeTrain(t,low=false){
 if(low&&t.model==='NM-79'){if(!this.nm79Overview)this.nm79Overview=makeNM79Overview();const group=this.nm79Overview.group.clone(true);this.scene.add(group);return {...this.nm79Overview,group,roof:group.children.filter(o=>o.userData.familia_visual==='roof')};}
 if(low){const group=new THREE.Group(),roof=[];for(let i=0;i<9;i++){const x=(i-4)*16.7;this.box(group,x,1.08,0,16.2,.25,2.5,'#37454c');this.box(group,x,2.22,0,16.2,2.1,2.5,'#FE5000');roof.push(this.box(group,x,3.45,0,16.2,.25,2.55,'#b9c7cc'));for(const side of [-1,1])this.box(group,x,2.65,side*1.26,14.5,.65,.025,'#274650');for(const local of [-5.4,5.4])this.box(group,x+local,.53,0,2.4,.65,2.2,'#29363c');}this.scene.add(group);return{group,roof,doors:[],detailed:false,low:true};}
const group=new THREE.Group(),roof=[],doors=[];const n=9,gap=.65,length=(150.9-(n-1)*gap)/n;const color='#FE5000';for(let i=0;i<n;i++){const x=(i-4)*(length+gap);this.box(group,x,.73,0,length,.4,2.25,'#38464e');this.box(group,x,1.13,0,length,.2,2.5,'#b7c1c4');this.box(group,x,1.63,0,length,.8,2.5,color);roof.push(this.box(group,x,3.62,0,length,.18,2.58,'#d2dce1'));this.box(group,x,2.83,1.18,length,.16,.15,'#e7edef');this.box(group,x,2.83,-1.18,length,.16,.15,'#e7edef');for(const sign of [-1,1]){this.box(group,x,3.3,sign*1.2,length,.45,.16,color);for(const local of [-5.9,-2,2,5.9]){this.box(group,x+local,2.55,sign*1.24,1.35,1.15,.07,'#203e50',{roughness:.3,metalness:.2});for(const half of [-1,1]){const m=this.box(group,x+local+half*.38,2.3,sign*1.28,.74,2.2,.06,'#e1e6e9');doors.push({mesh:m,x:m.position.x,half,side:sign});this.box(m,0,.35,0,.43,.6,.075,'#244252');}}for(const local of [-7.2,-4,0,4,7.2])this.box(group,x+local,2.55,sign*1.23,1.1,.96,.07,'#2b5366',{metalness:.25,roughness:.2});for(const local of [-4,0,4])this.box(group,x+local,1.38,sign*.77,2.2,.15,.5,'#365f83');}
 for(const local of [-5.5,5.5])for(const z of [-.98,.98]){const wheel=this.cylinder(group,x+local,.49,z,.47,.3,'#1e2c36');wheel.rotation.x=Math.PI/2;}if(i<8)this.box(group,x+length/2+gap/2,2.2,0,gap,1.8,1.65,'#3e515d');}
 for(const sign of [-1,1]){const x=sign*75.48;this.box(group,x,2.3,0,.12,2.4,2.45,color);this.box(group,x+sign*.08,2.78,0,.12,.85,1.7,'#153349');for(const z of [-.85,.85])this.box(group,x+sign*.12,1.8,z,.16,.16,.22,'#fff3c5',{emissive:'#ffefd4',emissiveIntensity:1});}this.scene.add(group);return{group,roof,doors,detailed:false};}
 buildPeople(){this.cabinCharacters=new CabinCharacters(this.scene,this.camera);}
 doorPortals(model,train){
 if(!model?.detailed)return [];model.group.updateWorldMatrix(true,true);
 const side208=doorSide208(train);if(model.portalSide208!==side208){model.portals200=null;model.portalSide208=side208;}if(!model.portals200){const pairs=new Map();for(const d of model.doors){if(d.side*train.direction!==side208)continue;
 const point=new THREE.Box3().setFromObject(d.mesh).getCenter(new THREE.Vector3());d.mesh.parent.worldToLocal(point);point.x-=d.mesh.position.x-d.x;d.mesh.parent.localToWorld(point);
 if(!pairs.has(d.portalKey))pairs.set(d.portalKey,[]);pairs.get(d.portalKey).push(point);}
 model.portals200=[...pairs.values()].filter(p=>p.length===2).map(p=>model.group.worldToLocal(p[0].clone().add(p[1]).multiplyScalar(.5)));}
 return model.portals200.map(p=>{const q=model.group.localToWorld(p.clone());return{x:q.x,z:q.z};}).sort((a,b)=>a.x-b.x);
 }
 updatePeople(state,line,idx,focus,now){
 const peopleKey151=state.currentLine+':'+idx+':'+focus.id;if(this.peopleKey151===peopleKey151&&now-(this.peopleAt151??-1)<peopleInterval260(this))return;this.peopleKey151=peopleKey151;this.peopleAt151=now;
 const e=state.engine,center=line.distances[idx],queue=e.waiting[line.stations[idx].id]||0;
 if(e.time<this.passengerTime||this.passengerEpoch!==e.epoch){this.passengerStops.clear();this.personMotionTime=0;}this.passengerTime=e.time;this.passengerEpoch=e.epoch;
 const stopped=e.trains.filter(t=>t.line===state.currentLine&&t.wait>0&&Math.abs(t.position-center)<1);if(stopped.length&&!stopped.includes(focus))focus=stopped[0];
 const dwell=e.stopDuration(focus),elapsed=dwell-focus.wait,key=[focus.id,focus.stops,focus.target,focus.direction,dwell].join(':');
 let plan=this.passengerStops.get(key);
 const portals=!plan&&focus.wait>0&&Math.abs(focus.position-center)<1?this.doorPortals(this.trainMeshes.get(focus.id),focus):[];
 if(focus.wait>0&&Math.abs(focus.position-center)<1&&portals.length&&!plan){plan=planPassengerStop(e,focus,queue,portals);this.passengerStops.set(key,plan);if(this.passengerStops.size>24)this.passengerStops.delete(this.passengerStops.keys().next().value);}
 const dt=this.previousMotionFrame?Math.min(.10,Math.max(0,now-this.previousMotionFrame)):0;this.previousMotionFrame=now;if(state.running)this.personMotionTime+=dt;
 this.passengerJourneys??=new Map();
 const actors=buildNaturalPassengerFrame({engine:e,train:focus,stationCenter:center,queue,portals,plan,elapsed,visibleStation:Math.abs(center-this.controls.target.x)<350,motionTime:this.personMotionTime,running:state.running},this.passengerJourneys);
 this.cabinCharacters.train203=focus.id;this.cabinCharacters.trainState211=focus;this.cabinCharacters.alignment121=this.alignment97;this.actors180=constrainPlatformActors169(actors,center,this.stationCache.get(idx)?.userData.solids169||[]);const total=this.cabinCharacters.update(this.actors180,this.personMotionTime,state.running);
 const station=line.stations[idx],info=e.demandInfo(station),clock=e.clockSeconds(),hh=String(Math.floor(clock/3600)).padStart(2,'0'),mm=String(Math.floor(clock%3600/60)).padStart(2,'0');
 const background=actors.filter(a=>a.id.startsWith('wait:')&&a.location!=='cabin'&&!a.flow).length,group=background?Math.max(1,queue/background):0;
 $('scene-visible-people').textContent=hh+':'+mm+' · '+Math.round(info.hourly).toLocaleString('es-MX')+' ingresos/h · '+Math.round(queue).toLocaleString('es-MX')+' en espera · '+total+' figuras · '+focus.load+' a bordo (conteo al salir)'+(group>1?' (≈'+Math.round(group)+' personas por figura de andén)':'')+(this.cabinCharacters.pending120?' · Cargando variantes de pasajeros…':this.cabinCharacters.error?' · Respaldo de pasajeros activo · reintentar modelos disponible':'');
 $('scene-visible-people').title=info.label+'; carga inicial de trenes intermedios estimada: 60 % de los ingresos de tres minutos, con límite del 75 % de capacidad; la afluencia por hora es un flujo de entrada, no una ocupación simultánea. La espera cambia con las llegadas y los embarques.';
 }
 setCamera(mode,force=false){
 if(mode!=='passenger')this.passenger178?.ride200?.reset();this.cameraMode=mode;if(this.passenger178?.pad180)this.passenger178.pad180.hidden=mode!=='passenger';if(this.passenger178?.help181)this.passenger178.help181.hidden=mode!=='passenger';this.previousPlatform169=null;if(['platform','passenger'].includes(mode))this.platformSide169=-1;const cutIds=['station-cutaway','environment-cutaway','cutaway'];if(['driver','cab-platform','passenger'].includes(mode)){if(!this.savedCuts)this.savedCuts=Object.fromEntries(cutIds.map(id=>[id,$(id).checked]));for(const id of cutIds){$(id).checked=false;$(id).disabled=true;}}else{for(const id of cutIds){if(this.savedCuts)$(id).checked=this.savedCuts[id];$(id).disabled=false;}this.savedCuts=null;}cameraCuts109(mode,$);$('scene-help').textContent=mode==='cab-platform'?'Desde la cabina · mirando hacia atrás por el andén':mode==='driver'?'Cabina de conducción · utiliza los mandos del operador':mode==='passenger'?'WASD: caminar · mouse derecho: mirar · Shift: paso rápido · Ctrl: agacharte · H: ayuda':'Arrastra para girar · Rueda o pellizca para acercar';const state=this.getState(),t=state?.engine.trains.find(t=>t.id===state.selectedTrain),line=state?.engine.lines[state.currentLine];
 let idx=Math.max(0,line?.stations.findIndex(s=>s.id===state?.selectedStation)||0);
 if(t&&$('follow-train').checked)idx=t.wait>0?t.target:Math.max(0,Math.min(line.stations.length-1,t.target-t.direction));
 if(mode==='full')$('follow-train').checked=false;
 if(['platform','passenger'].includes(mode)){this.platformStation=idx;$('follow-train').checked=false;window.pinSceneStation?.(line.stations[idx].id);}
 $('follow-train').disabled=['platform','passenger','car','train','driver','cab-platform'].includes(mode);if(mode==='car'||mode==='train'||mode==='driver'||mode==='cab-platform')$('follow-train').checked=true;
 const center=(mode==='train'||mode==='car'||mode==='driver'||mode==='cab-platform')?(t?.position||0):(line?.distances[idx]||0);this.fixedAnchor=center;this.cameraStation=idx;
 let target=new THREE.Vector3(center,1.5,0),offset=new THREE.Vector3(0,95,60);
 if(['platform','passenger'].includes(mode)){target.set(center+22,2.65,-1.4);offset.set(-80,.20,-3.55);}
 if(mode==='car'){target.set(center+(t?.direction||1)*55,2.65,t?trainTrack208(t):-TRACK_OFFSET);offset.set(-(t?.direction||1)*6,.20,.18);}
 if(mode==='train'){target.set(center,2,t?trainTrack208(t):-TRACK_OFFSET);offset.set(-t.direction*36,12,-t.direction*34);}
 if(mode==='cab-platform'){const d=t?.direction||1,side=doorSide208(t),z=trainTrack208(t);target.set(center-d*45,2.4,z+side*3.5);offset.set(d*116,.4,-side*1.95);}
 if(mode==='driver'){target.set(center+(t?.direction||1)*105,2.75,t?trainTrack208(t):-TRACK_OFFSET);offset.set(-(t?.direction||1)*31.3,0,0);}
 if(mode==='passenger'){target.set(center+25,2.83,-2.7);offset.set(-45,0,-2.9);}
 if(isSurfaceIsland209(line?.stations[idx])&&['platform','passenger'].includes(mode)){target.set(center+18,mode==='passenger'?2.83:2.75,platformEye209(line.stations[idx]));offset.set(-40,.05,0);}
 this.controls.enabled=mode!=='passenger';this.controls.enableRotate=!['driver','cab-platform','passenger'].includes(mode);this.controls.enableZoom=!['driver','cab-platform'].includes(mode);
 this.controls.minDistance=mode==='car'?.35:2;this.controls.maxDistance=mode==='car'?9:390;this.controls.enablePan=mode!=='car'&&!['driver','cab-platform'].includes(mode);this.camera.fov=['driver','passenger'].includes(mode)?60:38;this.camera.near=mode==='driver'?.04:(mode==='car'||mode==='cab-platform')?.04:.1;this.camera.updateProjectionMatrix();this.controls.target.copy(target);this.camera.position.copy(target).add(offset);this.controls.update();this.lastTarget=target.clone();
 if(mode==='passenger')this.passenger178?.enter();
 if(mode==='full')this.fitOverview();else{this.scene.fog.near=290;this.scene.fog.far=850;}
 this.navigationHint();
 for(const [id,name]of [['camera-full','full'],['camera-platform','platform'],['camera-passenger','passenger'],['camera-train','train'],['camera-car','car'],['camera-driver','driver'],['camera-cab-platform','cab-platform']])$(id).setAttribute('aria-pressed',name===mode);
 }
 navigationHint(){const locked=['driver','cab-platform','car','passenger'].includes(this.cameraMode),mode=this.navigation?.mode||'orbit';for(const key of ['orbit','pan']){const button=$('scene-nav-'+key);button.disabled=locked;button.setAttribute('aria-pressed',String(mode===key));}$('scene-help').textContent=this.cameraMode==='passenger'?'Persona en andén · WASD/flechas: caminar · botón derecho: mirar · sin seguir al tren':locked?'Vista anclada al tren · selecciona Estación, Andén o Seguir tren para desplazar la cámara.':mode==='pan'?'Pan: arrastra para desplazar · Botón central: desplazar · Rueda: acercar':'Arrastra para girar · Botón central o derecho: Pan · Rueda: acercar';}
 updateCamera(focus,line,idx,follow){
 if(this.cameraMode==='passenger'&&this.passenger178?.ride200?.trainId)return focus.position;
 if(['platform','passenger'].includes(this.cameraMode))return this.fixedAnchor;
 if((this.cameraMode==='train'||this.cameraMode==='car'||this.cameraMode==='driver'||this.cameraMode==='cab-platform')&&follow){const desired=focus.position+(this.cameraMode==='car'?focus.direction*55:this.cameraMode==='driver'?focus.direction*105:this.cameraMode==='cab-platform'?-focus.direction*45:0);const delta=desired-this.lastTarget.x;this.camera.position.x+=delta;this.controls.target.x+=delta;this.lastTarget.x=desired;return focus.position;}
 // Fixed viewpoints: train moves through the frame. Only discrete cuts change viewpoint.
 let center=this.fixedAnchor??line.distances[idx];
 if(follow){
  if(focus.wait>0&&this.cameraStation!==idx){center=line.distances[idx];this.cameraStation=idx;}
 }else if(this.cameraStation!==idx){center=line.distances[idx];this.cameraStation=idx;}
 if(center!==this.fixedAnchor){const delta=center-this.lastTarget.x;this.camera.position.x+=delta;this.controls.target.x+=delta;this.lastTarget.x=center;this.fixedAnchor=center;}
 return center;
 }
 clampDriver(){if(!['driver','cab-platform'].includes(this.cameraMode))return;const state=this.getState(),t=state?.engine.trains.find(t=>t.id===state.selectedTrain);if(!t)return;const d=t.direction,z=trainTrack208(t);if(this.cameraMode==='cab-platform'){const side=doorSide208(t);this.camera.position.set(t.position+d*71,2.8,z+side*1.55);this.controls.target.set(t.position-d*45,2.4,z+side*3.5);this.lastTarget=this.controls.target.clone();this.camera.lookAt(this.controls.target);return;}this.camera.position.set(t.position+d*73.7,2.75,z);this.controls.target.set(t.position+d*105,2.75,z);this.lastTarget=this.controls.target.clone();this.camera.lookAt(this.controls.target);}
 clampInterior(){if(this.cameraMode!=='car')return;const state=this.getState(),t=state?.engine.trains.find(t=>t.id===state.selectedTrain);if(!t)return;const center=t.position+t.direction*50,z=trainTrack208(t);this.camera.position.x=THREE.MathUtils.clamp(this.camera.position.x,center-6,center+6);this.camera.position.y=THREE.MathUtils.clamp(this.camera.position.y,2,3.15);this.camera.position.z=THREE.MathUtils.clamp(this.camera.position.z,z-.72,z+.72);this.camera.lookAt(this.controls.target);}
 async prepareAudio142(){await this.audio.enable();const line=this.getState().engine.lines[this.getState().currentLine];await Promise.all(line.stations.filter(s=>this.audio.manifest?.stations?.[s.id]).map(s=>this.audio.reference(s.id)));if(this.audio.motionError)throw Error('No se pudo preparar el audio de marcha');}
 async enableAudio(){await this.prepareAudio142();$('audio-toggle').textContent='Silenciar sonido';$('audio-toggle').setAttribute('aria-pressed','true');}
 setupEvents(){this.passenger178=new PlatformPerson178(this);$('station-3d').addEventListener('pointerdown',()=>{if(this.cameraMode==='full')$('follow-train').checked=false;});$('station-3d').addEventListener('wheel',()=>{if(this.cameraMode==='full')$('follow-train').checked=false;},{passive:true});$('scene-nav-orbit').onclick=()=>this.navigation.setMode('orbit');$('scene-nav-pan').onclick=()=>this.navigation.setMode('pan');$('scene-nav-home').onclick=()=>this.setCamera(this.cameraMode,true);$('retry-trains').onclick=()=>{this.cabinCharacters.retry?.();this.loadLine(this.getState().currentLine);for(const p of this.stationCache.values())if(p.userData.error){p.userData.attempts=0;p.userData.retryAt=0;}};const audioButton=$('audio-toggle');audioButton.onclick=async()=>{try{if(this.audio.enabled){this.audio.setEnabled(false);}else await this.prepareAudio142();audioButton.textContent=this.audio.enabled?'Silenciar sonido':'Activar sonido';audioButton.setAttribute('aria-pressed',this.audio.enabled);}catch{audioButton.textContent='Audio no disponible';}};$('audio-volume').oninput=()=>this.audio.setVolume(Number($('audio-volume').value));for(const [id,m]of [['camera-full','full'],['camera-platform','platform'],['camera-passenger','passenger'],['camera-train','train'],['camera-car','car'],['camera-driver','driver'],['camera-cab-platform','cab-platform']])$(id).onclick=()=>this.setCamera(m);$('follow-train').onchange=()=>{this.lastStation=-1;this.setCamera(this.cameraMode);};$('cutaway').onchange=()=>{};$('scene-train').onchange=()=>window.selectSceneTrain?.($('scene-train').value);$('next-arrival').onclick=()=>window.advanceToNextArrival?.();}
 // Fit the entire 162 m station, including both lateral platforms, at any aspect ratio.
 fitOverview(){
 const normal=new THREE.Vector3(0,95,60).normalize(),right=new THREE.Vector3(1,0,0),up=new THREE.Vector3().crossVectors(normal,right);
 const tanV=Math.tan(THREE.MathUtils.degToRad(this.camera.fov/2)),tanH=tanV*this.camera.aspect;let distance=0;
 for(const x of [-81,81])for(const y of [-1.5,12])for(const z of [-8.6,8.6]){
  const v=new THREE.Vector3(x,y,z),depth=v.dot(normal);
  distance=Math.max(distance,depth+Math.abs(v.dot(right))/tanH,depth+Math.abs(v.dot(up))/tanV);
 }
 distance*=1.12;this.controls.maxDistance=Math.max(390,distance*1.6);
 this.camera.position.copy(this.controls.target).addScaledVector(normal,distance);this.controls.update();
 this.scene.fog.near=Math.max(290,distance+120);this.scene.fog.far=Math.max(850,distance+700);
 }
 resize(){const box=$('scene-viewport').getBoundingClientRect();if(box.width&&box.height){this.renderer.setSize(box.width,box.height,false);this.camera.aspect=box.width/box.height;this.camera.updateProjectionMatrix();if(this.cameraMode==='full'&&this.lastTarget)this.fitOverview();}}
 update(now){const state=this.getState();if(!state?.engine)return;const e=state.engine,line=e.lines[state.currentLine],focus=e.trains.find(t=>t.id===(this.passenger178?.ride200?.trainId||state.selectedTrain)&&t.line===state.currentLine)||e.trains.find(t=>t.line===state.currentLine);let idx=0;const follow=!!this.passenger178?.ride200?.trainId||$('follow-train').checked&&!['platform','passenger'].includes(this.cameraMode);if(follow){idx=focus.wait>0?focus.target:Math.max(0,Math.min(line.stations.length-1,focus.target-focus.direction));}else idx=Math.max(0,line.stations.findIndex(s=>s.id===state.selectedStation));
 if(!this.passenger178?.ride200?.trainId&&['platform','passenger'].includes(this.cameraMode)&&this.lastLine===state.currentLine)idx=this.platformStation??idx;
 if(this.lastLine!==state.currentLine){for(const m of this.trainMeshes.values())this.removeTrain(m);this.trainMeshes.clear();this.clearTrainTemplates();this.clearStations();this.buildTracks(line);this.lastLine=state.currentLine;this.loadLine(state.currentLine);if(!this.preparingLine142){this.preparingLine142=true;void gate142('Preparando Línea '+state.currentLine,()=>this.ready142()).finally(()=>{this.preparingLine142=false;});}this.lastStation=-1;this.lastTrain='';this.setCamera(this.cameraMode);$('scene-train').innerHTML=e.trains.filter(t=>t.line===state.currentLine).map(t=>`<option value="${t.id}">${t.id} · ${t.model}</option>`).join('');}
 if(this.lastDirection!==focus.direction){this.lastDirection=focus.direction;if(this.cameraMode==='car'||this.cameraMode==='train'||this.cameraMode==='driver'||this.cameraMode==='cab-platform')this.setCamera(this.cameraMode);}if(this.lastTrain!==focus.id){this.lastTrain=focus.id;if(!['platform','passenger'].includes(this.cameraMode))this.setCamera(this.cameraMode);}const listed=Array.from($('scene-train').options).map(o=>o.value);const fleet=e.trains.filter(t=>t.line===state.currentLine);if(listed.join(',')!==fleet.map(t=>t.id).join(','))$('scene-train').innerHTML=fleet.map(t=>`<option value="${t.id}">${t.id} · ${t.model}</option>`).join('');$('scene-train').value=focus.id;
 const preview208=$('coyuya-review208');if(preview208){const active208=document.body.dataset.gameScreen==='simulation'&&Boolean(STATION_REFERENCES213[line.stations[idx].id]);if(preview208.hidden===active208)preview208.hidden=!active208;if(document.body.dataset.coyuyaPreview208!==String(active208))document.body.dataset.coyuyaPreview208=String(active208);}
 const anchor=this.updateCamera(focus,line,idx,follow);this.refreshStations(line,idx,anchor,focus);this.updateShell(anchor);updateSignals99(this,e,anchor);const openStation=['superficial','superficie','elevada'].includes(line.stations[idx].geometria_3d?.tipo)||[10,11,12,13,19].includes(line.stations[idx].linea===8?line.stations[idx].orden:-1);this.sun.intensity=THREE.MathUtils.lerp(this.sun.intensity,openStation?1.75:.65,.08);this.sun.color.set(openStation?0xfff1df:0xf0f2ef);this.sun.position.x=anchor+100;this.sun.target.position.x=anchor;this.sun.target.updateMatrixWorld();
 const targets=new Set();for(const t of e.trains.filter(t=>t.line===state.currentLine)){targets.add(t.id);const m=this.ensureTrainModel(t,anchor);if(!m)continue;if(!m.group.visible)continue;m.group.position.set(t.position,0,trainTrack208(t));m.group.rotation.y=(m.detailed||m.authenticOverview)&&t.direction===-1?Math.PI:0;const cut101=$('cutaway').checked,mask101=[cut101,Math.sign(this.camera.position.z-m.group.position.z),t.direction].join(':');if(m.cutMask101!==mask101){m.cutMask101=mask101;for(const wall of m.cutWalls||[]){if(!cut101){wall.visible=true;continue;}wall.updateWorldMatrix(true,false);if(wall.geometry&&!wall.geometry.boundingBox)wall.geometry.computeBoundingBox();const pos=wall.geometry?.boundingBox?wall.geometry.boundingBox.getCenter(new THREE.Vector3()).applyMatrix4(wall.matrixWorld):wall.getWorldPosition(new THREE.Vector3());wall.visible=(pos.z-m.group.position.z)*(this.camera.position.z-m.group.position.z)<0;}for(const roof of m.roof)roof.visible=!cut101;}
 if(m.detailed)updateCabDisplay147(m.group,t);const openingSide=doorSide208(t);const openness=doorOpenness(e,t);for(const d of m.doors){const amount=d.side*(m.detailed?t.direction:1)===openingSide?openness:0;updatePocketDoor(d,amount);}}
 for(const [id,m]of this.trainMeshes)if(!targets.has(id)){this.removeTrain(m);this.trainMeshes.delete(id);}
 if(!this.arrivalPrediction||this.arrivalEpoch!==e.epoch||(this.arrivalTime!==Math.floor(e.time/5)&&now-(this.arrivalRefreshAt||0)>.5)||this.arrivalEmergency!==e.emergency||this.arrivalPower!==JSON.stringify(e.power)){this.arrivalPrediction=predictArrivals(e);this.arrivalTime=Math.floor(e.time/5);this.arrivalRefreshAt=now;this.arrivalEpoch=e.epoch;this.arrivalEmergency=e.emergency;this.arrivalPower=JSON.stringify(e.power);}for(const t of e.trains)if(t.line===1){const m=this.trainMeshes.get(t.id);if(m?.group.visible&&m.interiorDisplay)updateTrainDisplay(m.interiorDisplay,t,e.lines[1],e,this.arrivalPrediction);}for(const [si,p]of this.stationCache)if(p.visible&&p.userData.arrivalDisplays)drawArrivalDisplays(p.userData.arrivalDisplays,this.arrivalPrediction,state.currentLine,si,e);
 this.audio.update({...state,cameraMode:this.cameraMode},(this.cameraMode==='car'||this.cameraMode==='train'||this.cameraMode==='driver'||this.cameraMode==='cab-platform')?focus.position:line.distances[idx],Number($('time-scale').value));this.updatePeople(state,line,idx,focus,now);if(now-(this.hudAt151??-1)<.16)return;this.hudAt151=now;const visual=line.stations[idx].entorno_visual,stationModel=line.stations[idx].geometria_3d,activeStation=this.stationCache.get(idx),upcomingStation=this.stationCache.get(focus.target);if(state.engine.operator?.trainId===focus.id&&focus.wait<=0)$('model-status').textContent=upcomingStation?.userData.loaded?'Próxima estación preparada · '+line.stations[focus.target].nombre+' · modelos y texturas':upcomingStation?.userData.error?'No se pudo preparar '+line.stations[focus.target].nombre+' · reintentando la carga de andenes':'Precargando modelos y texturas de '+line.stations[focus.target].nombre+'…';$('station-status').textContent=activeStation?.userData.loaded?(isSurfaceIsland209(line.stations[idx])?'Andenes de superficie · revisión 209 · ':'Andenes GLB · ')+ ' · '+line.stations[idx].nombre+(state.currentLine===1?' · Fotografías · accesos revisados 54':' · Fotografías · acabados y accesos 57'):activeStation?.userData.error?'Andenes detallados no disponibles temporalmente · vista provisional':'Cargando andenes de '+line.stations[idx].nombre+'…';const inStation=Math.abs(focus.position-line.distances[idx])<100;const adjacent=focus.target;const route=['platform','passenger'].includes(this.cameraMode)?line.stations[idx].nombre:focus.wait>0?line.stations[idx].nombre:line.stations[idx].nombre+' → '+line.stations[adjacent].nombre;const cameraLabel=this.cameraMode==='passenger'?(this.passenger178?.ride200?.aboard?'Pasajero a bordo':'Vista de persona en andén'):(this.cameraMode==='train'||this.cameraMode==='car'||this.cameraMode==='driver'||this.cameraMode==='cab-platform')?'Cámara siguiendo al tren':['platform','passenger'].includes(this.cameraMode)?'Cámara fija en el andén':'Cámara fija · encuadre manual';$('environment-status').textContent=route+' · '+(inStation?'Andenes según referencias':'Túnel aproximado · perfil constructivo de referencia')+' · '+cameraLabel+' · Geometría aproximada';const s=line.stations[idx],next=line.stations[focus.target];$('scene-line').textContent='LÍNEA '+state.currentLine+' · ESTACIÓN EN 3D';$('scene-title').textContent=follow&&focus.wait<=0?'Hacia '+next.nombre:s.nombre;$('scene-travel').textContent=focus.wait>0?`${focus.id} · Detenido en ${next.nombre}`:`${focus.id} · ${Math.round(focus.speed*3.6)} km/h · Próxima parada: ${next.nombre}`;$('scene-direction').textContent='DIRECCIÓN '+(focus.direction===1?line.stations.at(-1).nombre:line.stations[0].nombre).toUpperCase();$('scene-direction').style.background=line.color;$('scene-doors').textContent=e.emergency?'Freno de emergencia':!e.power[focus.line]?'Alimentación interrumpida':e.operator?.trainId===focus.id&&e.operator.phase==='warning'?'Advertencia de cierre · '+Math.ceil(Math.max(0,focus.wait-1.5))+' s':focus.wait>0?(focus.wait<=1.5?'Cerrando puertas':focus.wait<=4?'Aviso de cierre':e.stopDuration(focus)-focus.wait<1.5?'Abriendo puertas':'Puertas abiertas')+' · '+Math.ceil(focus.wait)+' s':'Puertas cerradas · En circulación';$('model-note').textContent=`${focus.model}${focus.model==='MP-82'?' · modelo Blender desde fotografías; medidas aproximadas':''}. Equipos mecánicos según fotografías; ubicación aproximada. Andenes L1 y L8 actualizados desde fotografías; cotas y zonas ocultas aproximadas. Referencia visual ${stationModel?.confianza_visual||'pendiente'}; fecha de grabación no confirmada. Pasajeros agrupados. Curvas desde los planos aportados; radios de enlace y pendientes por verificar.`;$('scene-car-count').textContent=state.currentLine===1?'9 vagones · NM-22':'9 carros · M–R–N–N–PR–N–N–R–M · referencia';}
 animate(now){requestAnimationFrame(t=>this.animate(t));if(document.body.dataset.workspace!=='simulation'||document.body.dataset.loading142==='true'||document.hidden||document.body.dataset.pause105==='true'||!this.renderBudget101.allows(now))return;this.elapsed=now;this.update(now/1000);const running203=this.getState().running;this.cabinCharacters.animate203?.(this.personMotionTime+(running203?Math.min(.05,Math.max(0,now/1000-(this.previousMotionFrame||now/1000))):0),running203);if(this.cameraMode==='passenger')this.passenger178.update(now);else this.controls.update();clampPlatformCamera169(this);this.clampDriver();this.clampInterior();updateQualityLighting100(this);updateStationBounce213(this);updateWeather103(this);updateTrainLod259(this);updateWeathering259(this);freezeStatic260(this);this.cockpit149?.update(now);try{installRouteEnergy249(this);renderCurved97(this);}finally{this.cockpit149?.restoreCab();}this.cockpit149?.render();}
}
function start(){if(document.body.dataset.workspace==='simulation'&&window.metroViewState&&!window.stationScene){try{window.stationScene=new StationScene(window.metroViewState);if(window.pendingExperienceCamera){window.stationScene.setCamera(window.pendingExperienceCamera);delete window.pendingExperienceCamera;}}catch(e){$('scene-loading').textContent='La vista 3D requiere WebGL. Puedes seguir usando el recorrido y los controles.';console.error(e);}}}
window.addEventListener('enter-simulation',start);window.addEventListener('metro-ready',start);start();
