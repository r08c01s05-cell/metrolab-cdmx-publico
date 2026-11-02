import * as T from 'three';
import {mergeGeometries} from './vendor/BufferGeometryUtils.js';
// Illustrative auxiliary ventilation module, without manufacturer ratings or
// a claimed schematic. It stays installed when the removable filter is carried.
export function ventilationInterior202(bench){
 const root=new T.Group();root.name='Interior del módulo de ventilación202';root.userData.illustrative202=true;bench.group.add(root);
 const duct=new T.Group(),control=new T.Group(),rotor=new T.Group();duct.name='Conducto y motor202';control.name='Control auxiliar protegido202';rotor.name='Impulsor interior202';root.add(duct,control,rotor);rotor.position.set(-.18,.06,.24);
 const steel=new T.MeshStandardMaterial({name:'Chapa galvanizada conducto202',color:'#67787d',metalness:.68,roughness:.48}),dark=new T.MeshStandardMaterial({name:'Motor ventilación202',color:'#26363c',metalness:.35,roughness:.6}),blade=new T.MeshStandardMaterial({name:'Palas aluminio202',color:'#9ca9aa',metalness:.72,roughness:.36,side:T.DoubleSide}),pcb=new T.MeshStandardMaterial({name:'Placa auxiliar didáctica202',color:'#235f46',roughness:.65}),copper=new T.MeshStandardMaterial({name:'Pistas cobre protegido202',color:'#ba9d61',metalness:.7,roughness:.4}),terminal=new T.MeshStandardMaterial({name:'Borneras aisladas202',color:'#72948c',roughness:.6}),wire=new T.MeshStandardMaterial({name:'Aislamiento cable auxiliar202',color:'#313a3f',roughness:.8});
 const box=(parent,name,x,y,z,w,h,d,m)=>{const o=new T.Mesh(new T.BoxGeometry(w,h,d),m);o.name=name;o.position.set(x,y,z);parent.add(o);return o;};
 const cylinder=(parent,name,x,y,z,r,depth,m)=>{const o=new T.Mesh(new T.CylinderGeometry(r,r,depth,24),m);o.rotation.x=Math.PI/2;o.name=name;o.position.set(x,y,z);parent.add(o);return o;};
 for(const x of[-.563,.563])box(duct,'Lateral plegado del conducto',x,.06,.19,.015,.55,.40,steel);
 for(const y of[-.22,.34])box(duct,'Guía y junta del filtro',0,y,.16,1.14,.014,.38,steel);
 const outline=new T.Shape();outline.moveTo(-.56,-.215);outline.lineTo(.56,-.215);outline.lineTo(.56,.335);outline.lineTo(-.56,.335);outline.closePath();const opening=new T.Path();opening.absarc(-.18,.06,.215,0,Math.PI*2,true);outline.holes.push(opening);const back=new T.Mesh(new T.ExtrudeGeometry(outline,{depth:.012,bevelEnabled:false,curveSegments:40}),steel);back.position.z=.36;back.name='Salida circular del conducto202';duct.add(back);
 const ring=new T.Mesh(new T.TorusGeometry(.218,.009,8,48),steel);ring.position.set(-.18,.06,.225);duct.add(ring);cylinder(duct,'Carcasa del motor202',-.18,.06,.37,.070,.10,dark);
 for(let i=0;i<2;i++){const arm=box(duct,'Soporte del motor',-.18,.06,.32,.025,.40,.012,steel);arm.rotation.z=i*Math.PI/2;}
 cylinder(rotor,'Cubo del impulsor',0,0,0,.055,.045,dark);
 for(let i=0;i<7;i++){const shape=new T.Shape();shape.moveTo(.045,-.016);shape.quadraticCurveTo(.13,-.095,.205,-.035);shape.lineTo(.196,.025);shape.quadraticCurveTo(.12,.008,.05,.020);shape.closePath();const o=new T.Mesh(new T.ShapeGeometry(shape,10),blade);o.rotation.z=i*Math.PI*2/7;rotor.add(o);}
 // Electronics occupy an isolated side compartment, outside the main airflow.
 box(control,'Separación del control respecto al flujo',.13,.06,.23,.014,.53,.26,steel);
 box(control,'Soporte de placa',.37,.065,.31,.36,.49,.018,steel);box(control,'Placa de control auxiliar',.37,.065,.282,.29,.40,.013,pcb);
 for(const x of[.25,.49])for(const y of[-.10,.23])cylinder(control,'Separador de placa',x,y,.267,.009,.035,steel);
 for(let i=0;i<3;i++){box(control,'Relé auxiliar',.29,.18-i*.085,.252,.07,.055,.042,dark);box(control,'Conector aislado',.46,.18-i*.085,.252,.055,.043,.035,terminal);}
 for(let i=0;i<6;i++){box(control,'Borna de conexión',.25+i*.047,-.10,.247,.033,.04,.035,terminal);cylinder(control,'Tornillo de borna',.25+i*.047,-.10,.225,.006,.008,steel);}
 for(let i=0;i<5;i++){box(control,'Pista de placa',.36,.18-i*.06,.273,.09,.003,.0015,copper);box(control,'Retorno de pista',.40,.17-i*.06,.273,.003,.025,.0015,copper);}
 for(const [i,x]of[.28,.34,.40].entries()){const points=[[x,-.12,.24],[x,-.18,.21],[.12,-.18,.26],[-.10+i*.012,-.08,.35]].map(a=>new T.Vector3(...a)),cable=new T.Mesh(new T.TubeGeometry(new T.CatmullRomCurve3(points),20,.005,6,false),wire);cable.name='Mazo conectado a bornera y motor';duct.add(cable);}
 function batch(g){const bins=new Map(),old=[];g.updateWorldMatrix(true,true);const inverse=g.matrixWorld.clone().invert();g.traverse(o=>{if(!o.isMesh)return;const list=bins.get(o.material)||[];list.push((o.geometry.index?o.geometry.toNonIndexed():o.geometry.clone()).applyMatrix4(inverse.clone().multiply(o.matrixWorld)));bins.set(o.material,list);old.push(o);});for(const o of old){o.removeFromParent();o.geometry.dispose();}for(const[m,list]of bins){const geometry=mergeGeometries(list,false);list.forEach(g=>g.dispose());if(geometry){const o=new T.Mesh(geometry,m);o.name=g.name+' · '+m.name;g.add(o);}}}
 batch(duct);batch(control);batch(rotor);let running=false;const apply=bench.apply.bind(bench),update=bench.update.bind(bench);bench.apply=(state,result)=>{apply(state,result);if(result?.ok&&result.effect==='test')running=true;};bench.update=dt=>{update(dt);if(running)rotor.rotation.z+=Math.min(dt,.1)*11;};bench.interior202={root,duct,control,rotor,airflowOpening:true};return bench;
}
