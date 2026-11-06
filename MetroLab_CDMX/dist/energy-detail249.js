import * as T from 'three';
import {FlowPath249} from './energy-flow249.js?v=250';
export class EnergyDetail249{
 constructor(model,type,architecture){this.model=model;this.paths=[new FlowPath249(model.root,'#ffae32'),new FlowPath249(model.root,'#43d8f1')];this.electronics=new T.Group();this.electronics.name='Detalle electrónico comparativo';model.groups.get('power').add(this.electronics);this.owned=[];this.devices=[];
  const add=(name,p,size,color)=>{const g=new T.BoxGeometry(...size),m=new T.MeshStandardMaterial({color,metalness:.5,roughness:.45}),o=new T.Mesh(g,m);o.name=name;o.position.set(...p);this.electronics.add(o);this.owned.push(g,m);return o;};
  add('Enlace CC · condensador / bus',[0,.4,.3],[1.45,.12,.9],'#889789');
  if(architecture==='inverter')for(let phase=0;phase<3;phase++)for(let half=0;half<2;half++){const i=phase*2+half,o=add(`Q${i+1} · IGBT y diodo antiparalelo · fase ${'UVW'[phase]}`,[phase*.38-.38,.57,half*.4+.1],[.26,.17,.25],'#384f62');o.userData.device249=i;this.devices.push(o);add('Terminales C / E / G',[phase*.38-.38,.69,half*.4+.1],[.14,.035,.11],'#cdac66');}
  this.electronics.scale.setScalar(.5);this.type=type;this.architecture=architecture;this.originalExplode=model.explode;model.explode=value=>{this.originalExplode(value);this.electronics.position.x=value*1.5;};
 }
 select(i){for(let n=0;n<this.devices.length;n++)this.devices[n].material.color.set(n===i?'#ffc45f':'#384f62');}
 update(time,enabled){this.model.root.updateMatrixWorld(true);const pos=(id,x,y,z)=>this.model.groups.get(id).localToWorld(new T.Vector3(x,y,z)).applyMatrix4(this.model.root.matrixWorld.clone().invert()),side=this.type==='pneumatic',bar=pos('supply',side?1.47:0,side?.55:4.55,-3),end=pos('supply',side?1.47:0,side?.55:4.55,0),collector=pos('collector',side?1.44:0,side?.55:4.52,0),power=pos('power',0,1.03,.35),motor=pos('bogie',0,.7,1.05),rail=pos('track',.72,.18,1.05),returnEnd=pos('track',.72,.18,-3);
  this.paths[0].update([bar,end,collector,power,motor],time,enabled);this.paths[1].update([motor,rail,returnEnd],time,enabled);
 }
 dispose(){this.model.explode=this.originalExplode;this.paths.forEach(p=>p.dispose());this.electronics.removeFromParent();this.owned.forEach(o=>o.dispose());}
}
