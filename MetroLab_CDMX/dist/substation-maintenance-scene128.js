import * as THREE from 'three';
export function makeServiceBench128(id){
 const group=new THREE.Group();group.name='Banco_didactico_SR128';const targets=new Map(),materials=[],geometries=[],home=new Map();
 const material=(color,metalness=.2,roughness=.5)=>{const m=new THREE.MeshStandardMaterial({color,metalness,roughness});materials.push(m);return m;};const steel=material('#9eacaf',.8,.32),dark=material('#273b44'),white=material('#dde4da'),yellow=material('#c9ad4d'),red=material('#ba5346'),blue=material('#47779f'),green=material('#4fba8c'),dirt=material('#8c7650',0,.95);
 function box(parent,name,x,y,z,w,h,d,mat){const geometry=new THREE.BoxGeometry(w,h,d);geometries.push(geometry);const m=new THREE.Mesh(geometry,mat);m.name=name;m.position.set(x,y,z);parent.add(m);return m;}
 function cyl(parent,name,x,y,z,r,h,mat){const geometry=new THREE.CylinderGeometry(r,r,h,20);geometries.push(geometry);const m=new THREE.Mesh(geometry,mat);m.name=name;m.position.set(x,y,z);m.rotation.x=Math.PI/2;parent.add(m);return m;}
 function target(key,x,y,z){const g=new THREE.Group();g.position.set(x,y,z);g.name=key;g.userData.srTarget128=key;group.add(g);targets.set(key,g);home.set(key,g.position.clone());return g;}
 box(group,'Panel de práctica',0,0,.09,1.6,1.05,.09,dark);box(group,'Zócalo del banco',0,-.59,.09,1.74,.14,.6,steel);for(const x of[-.6,.6])box(group,'Pata del banco',x,-.78,.09,.09,.26,.4,steel);
 const dirtMarks=[];let rotor,indicator,fuse;
 if(id==='ventilation'){
  const filter=target('filter',0,.08,-.06);box(filter,'Marco de filtro',0,0,0,1.14,.56,.04,steel);for(let i=0;i<15;i++)box(filter,'Pliegue de filtro',-.51+i*.073,0,-.035,.018,.46,.014,white);for(let i=0;i<24;i++)dirtMarks.push(box(filter,'Polvo de práctica',-.47+(i%8)*.13,-.17+Math.floor(i/8)*.16,-.05,.095,.09,.012,dirt));
  for(const [key,x]of[['screwL',-.66],['screwR',.66],['screw3',-.66],['screw4',.66]]){const t=target(key,x,key==='screw3'||key==='screw4'?-.18:.30,-.08);cyl(t,'Tornillo',0,0,0,.065,.035,steel);box(t,'Ranura',0,0,-.02,.08,.012,.005,dark);}
  const fan=target('fan',0,-.34,-.07);cyl(fan,'Carcasa del ventilador',0,0,0,.145,.045,steel);rotor=new THREE.Group();fan.add(rotor);for(let a=0;a<3;a++){const m=box(rotor,'Aspa',0,0,-.04,.2,.04,.02,dark);m.rotation.z=a*Math.PI/3;}cyl(fan,'Eje',0,0,-.06,.035,.025,white);
 }else if(id==='control'){
  for(const[key,x,mat]of[['tpSource',-.57,red],['tpLoad',.57,blue]]){const g=target(key,x,.24,-.065);cyl(g,'Punto de medida',0,0,0,.08,.045,mat);cyl(g,'Contacto de medida',0,0,-.03,.035,.025,steel);}
  const holder=target('fuse',0,.15,-.08);box(holder,'Portafusible',0,0,0,.36,.46,.12,white);fuse=box(holder,'Fusible extraíble',0,0,-.075,.17,.28,.09,red);box(holder,'Contacto superior',0,.17,-.07,.24,.05,.06,steel);box(holder,'Contacto inferior',0,-.17,-.07,.24,.05,.06,steel);
  const lamp=target('lamp',0,-.34,-.08);indicator=cyl(lamp,'Lámpara',0,0,0,.11,.055,dark);
  for(const x of[-.57,.57]){box(group,'Conductor del circuito',x,-.12,-.01,.025,.57,.018,x<0?red:blue);box(group,'Conductor de entrada',x/2,.42,-.01,.57,.025,.018,x<0?red:blue);}
 }else if(id==='battery'){
  for(const[key,x]of[['terminalL',-.4],['terminalR',.4]]){const g=target(key,x,.12,-.06);cyl(g,'Conexión del banco',0,0,0,.13,.08,steel);box(g,'Puente',0,-.15,0,.13,.18,.04,steel);box(g,'Ranura de fijación',0,0,-.05,.1,.016,.005,dark);for(let i=0;i<5;i++)dirtMarks.push(box(g,'Suciedad de práctica',-.08+i*.04,.045,-.055,.025,.06,.012,dirt));}
  box(group,'Puente de conexiones',0,-.1,-.01,.8,.07,.03,steel);const t=target('indicator',0,-.34,-.08);indicator=cyl(t,'Indicador de continuidad',0,0,0,.11,.055,dark);
 }
 let testing=false;
 function apply(state,result){if(!result?.ok)return;const effect=result.effect;
  if(effect==='remove')targets.get('filter').userData.destination128=home.get('filter').clone().add(new THREE.Vector3(.78,-.25,-.38));
  if(effect==='install')targets.get('filter').userData.destination128=home.get('filter').clone();
  if(effect==='clean')for(const m of dirtMarks)m.scale.setScalar(Math.max(.001,1-result.partial));
  if(effect==='cleanL'||effect==='cleanR'){const key=effect==='cleanL'?'terminalL':'terminalR';for(const m of dirtMarks)if(m.parent===targets.get(key))m.scale.setScalar(Math.max(.001,1-result.partial));}
  const screwKey=effect==='loosenL'||effect==='tightenL'?'screwL':effect==='loosenR'||effect==='tightenR'?'screwR':null;
  const extraKey=effect.endsWith('3')?'screw3':effect.endsWith('4')?'screw4':null;if(extraKey&&targets.has(extraKey))targets.get(extraKey).userData.turn128=(effect.startsWith('loosen')?-1:1)*Math.PI*2;
  if(screwKey&&targets.has(screwKey)){const g=targets.get(screwKey);g.userData.turn128=(effect.startsWith('loosen')?-1:1)*Math.PI*2;}
  if((effect==='tightenL'||effect==='tightenR')&&id==='battery')targets.get(effect==='tightenL'?'terminalL':'terminalR').userData.turn128=Math.PI*2;
  if(effect==='open'&&fuse)fuse.position.z=-.28;
  if(effect==='replace'&&fuse)fuse.material=green;
  if(effect==='close'&&fuse)fuse.position.z=-.075;
  if(effect==='test'){testing=true;if(indicator){indicator.material=green;green.emissive.set('#319b70');green.emissiveIntensity=.7;}}
 }
 function update(dt){for(const g of targets.values()){if(g.userData.destination128)g.position.lerp(g.userData.destination128,1-Math.exp(-12*dt));if(Math.abs(g.userData.turn128||0)>.01){const step=g.userData.turn128*(1-Math.exp(-12*dt));g.rotation.z+=step;g.userData.turn128-=step;}}if(testing&&rotor)rotor.rotation.z+=dt*11;}
 return{group,targets,homes136:home,apply,update,dispose(){for(const g of geometries)g.dispose();for(const m of materials)m.dispose();group.removeFromParent();}};
}
