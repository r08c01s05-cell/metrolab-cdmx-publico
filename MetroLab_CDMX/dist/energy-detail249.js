import * as T from 'three';
import {FlowPath249} from './energy-flow249.js?v=255';

// Equipo didáctico: la disposición es conceptual y no reproduce planos de fabricante.
export class EnergyDetail249 {
 constructor(model,type,architecture){
  this.model=model;this.type=type;this.architecture=architecture;this.paths=[new FlowPath249(model.root,'#ffae32'),new FlowPath249(model.root,'#43d8f1'),new FlowPath249(model.root,'#ffae32'),new FlowPath249(model.root,'#43d8f1')];
  this.electronics=new T.Group();this.electronics.name='Equipo de tracción didáctico';model.groups.get('power').add(this.electronics);this.owned=[];this.devices=[];
  const mat=(color,metalness=.3)=>{const m=new T.MeshStandardMaterial({color,metalness,roughness:.53});this.owned.push(m);return m;};
  const steel=mat('#7e8d88',.65),dark=mat('#283a3e'),copper=mat('#bf8d55',.7),insulator=mat('#ddd4b7'),module=mat('#52636a'),green=mat('#4e7066');
  const box=(parent,name,p,size,m)=>{const geo=new T.BoxGeometry(...size),o=new T.Mesh(geo,m);this.owned.push(geo);o.name=name;o.position.set(...p);parent.add(o);return o;};
  const cylinder=(parent,name,p,r,h,m)=>{const geo=new T.CylinderGeometry(r,r,h,20),o=new T.Mesh(geo,m);this.owned.push(geo);o.name=name;o.position.set(...p);parent.add(o);return o;};
  const item=(name,description)=>{const group=new T.Group();group.name=name;group.userData.energyPart='power';group.userData.description=description;this.electronics.add(group);this.devices.push(group);return group;};
  const base=box(this.electronics,'Bastidor del equipo',[0,.84,.35],[1.55,.08,1.05],steel);
  // Bus y filtros aparecen en las dos familias; sus tamaños son representativos.
  let g=item('Filtro de entrada','Inductancia y condensadores reducen variaciones de corriente y tensión en el enlace de alimentación.');
  for(let i=0;i<3;i++)cylinder(g,'Condensador',[-.57+i*.12,.98,.08],.047,.24,dark);
  for(let i=0;i<7;i++)cylinder(g,'Inductancia de filtro',[-.57+i*.045,.98,.47],.105,.032,copper).rotation.z=Math.PI/2;
  box(this.electronics,'Barra positiva',[-.05,1.15,.72],[1.26,.035,.045],copper);box(this.electronics,'Barra de retorno',[-.05,.89,.72],[1.26,.035,.045],steel);
  if(architecture==='inverter'){
   g=item('Enlace de continua','Conjunto de condensadores y barras que estabiliza la tensión continua antes del inversor.');
   for(let i=0;i<3;i++)cylinder(g,'Condensador de enlace',[.48+i*.085,1.0,.1],.038,.25,dark);
   for(let phase=0;phase<3;phase++)for(let half=0;half<2;half++){
    const i=phase*2+half;g=item(`Q${i+1} · fase ${'UVW'[phase]}`,`Interruptor IGBT con diodo antiparalelo, posición ${half?'inferior':'superior'} de la fase ${'UVW'[phase]}; representación de un inversor trifásico de dos niveles.`);
    const x=-.3+phase*.25,z=.22+half*.28;box(g,'Módulo IGBT',[x,1.03,z],[.19,.17,.21],module);box(g,'Placa y bornes',[x,1.13,z],[.15,.035,.16],steel);for(const dx of[-.055,.055])cylinder(g,'Tornillo de terminal',[x+dx,1.153,z],.012,.012,copper);
   }
   g=item('Disipador del inversor','La refrigeración extrae las pérdidas de conmutación y conducción de los módulos de potencia.');
   box(g,'Placa del disipador',[-.05,.91,.36],[.79,.06,.6],steel);for(let i=0;i<9;i++)box(g,'Aleta',[-.4+i*.09,.87,.36],[.025,.07,.58],steel);
  }else if(architecture==='chopper'){
   g=item('Conmutador del chopper','Semiconductor de potencia representativo que regula la tensión media aplicada al motor de corriente continua; el dispositivo concreto depende de la versión.');
   box(g,'Módulo conmutador',[-.21,1.02,.27],[.32,.17,.27],module);box(g,'Bornes de potencia',[-.21,1.13,.27],[.25,.04,.19],copper);for(let i=0;i<4;i++)cylinder(g,'Terminal',[-.3+i*.06,1.16,.27],.014,.016,steel);
   g=item('Diodo de rueda libre','Proporciona un camino a la corriente inductiva durante la conmutación. El circuito exacto debe verificarse para cada serie.');
   box(g,'Diodo de potencia',[.19,1.02,.27],[.23,.17,.23],dark);box(g,'Terminal del diodo',[.19,1.13,.27],[.19,.04,.14],copper);
   g=item('Reactor de alisado','La inductancia limita las variaciones de corriente en el circuito del motor.');
   box(g,'Núcleo magnético',[.35,1.0,.57],[.4,.2,.26],steel);for(let i=0;i<7;i++)box(g,'Espira representativa',[.18+i*.055,1.02,.57],[.025,.23,.28],copper);
   g=item('Disipador del chopper','Superficie de refrigeración del semiconductor de potencia; diseño y montaje ilustrativos.');
   box(g,'Placa del disipador',[0,.91,.27],[.76,.06,.35],steel);for(let i=0;i<8;i++)box(g,'Aleta',[-.33+i*.09,.87,.27],[.026,.07,.34],steel);
  }else{
   g=item('Banco de resistencias','Resistencias representativas para comparar el control reostático de motores de CC.');
   for(let i=0;i<8;i++)box(g,'Elemento resistivo',[-.32+i*.09,1.02,.37],[.035,.22,.65],steel);
  }
  // Aislar materiales por conjunto para que el resaltado no afecte a piezas vecinas.
  for(const group of this.devices){const copies=new Map();group.traverse(o=>{if(!o.isMesh)return;if(!copies.has(o.material)){const copy=o.material.clone();copies.set(o.material,copy);this.owned.push(copy);}o.material=copies.get(o.material);});}
  this.originalExplode=model.explode;model.explode=value=>{this.originalExplode(value);this.electronics.position.x=value*1.3;};
 }
 select(i){for(const [n,g] of this.devices.entries())g.traverse(o=>{if(o.isMesh){o.userData.oldEmissive??=o.material.emissive?.getHex();if(o.material.emissive)o.material.emissive.setHex(n===i?0x4e3511:o.userData.oldEmissive||0);}});}
 update(time,enabled){this.model.root.updateMatrixWorld(true);const pos=(id,x,y,z)=>this.model.groups.get(id).localToWorld(new T.Vector3(x,y,z)).applyMatrix4(this.model.root.matrixWorld.clone().invert()),side=this.type==='pneumatic',bar=pos('supply',side?1.47:0,side?.55:4.55,-3),end=pos('supply',side?1.47:0,side?.55:4.55,0),collector=pos('collector',side?1.44:0,side?.55:4.52,0),power=pos('power',0,1.03,.35),motor=pos('bogie',0,.7,1.05),rail=pos('track',.72,.18,1.05),returnEnd=pos('track',.72,.18,-3);
  this.paths[0].update([bar,end,collector,power,motor],time,enabled);this.paths[1].update([motor,rail,returnEnd],time,enabled);if(side){const leftBar=pos('supply',-1.47,.55,-3),leftEnd=pos('supply',-1.47,.55,0),leftCollector=pos('collector',-1.44,.55,0),leftRail=pos('track',-.72,.18,1.05),leftReturn=pos('track',-.72,.18,-3);this.paths[2].update([leftBar,leftEnd,leftCollector,power,motor],time,enabled);this.paths[3].update([motor,leftRail,leftReturn],time,enabled);}else{this.paths[2].root.visible=false;this.paths[3].root.visible=false;}}
 dispose(){this.model.explode=this.originalExplode;this.paths.forEach(p=>p.dispose());this.electronics.removeFromParent();this.owned.forEach(o=>o.dispose());}
}
