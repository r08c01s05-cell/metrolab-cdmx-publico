import * as Three from 'three';

const smooth=(value,min,max)=>Three.MathUtils.smoothstep(value,min,max);

// Secuencia cualitativa. Los porcentajes sólo expresan intensidad relativa.
export function tractionFrame278(seconds) {
 const accelerationTime=Three.MathUtils.clamp(seconds-4,0,13);
 const coastTime=Three.MathUtils.clamp(seconds-17,0,8);
 const brakeTime=Three.MathUtils.clamp(seconds-25,0,18);
 const travel=accelerationTime**2/26+coastTime+brakeTime-brakeTime**2/36;
 const current=smooth(seconds,4,6)*(1-.45*smooth(seconds,6,17))*(1-smooth(seconds,17,18));
 const heat=smooth(seconds,25,30)*(1-smooth(seconds,34,47));
 return {
  distance:3.2*travel/23.5,
  current, heat,
  braking:smooth(seconds,25,27)*(1-smooth(seconds,35,43)),
 };
}

const palette={
 frame:'#596870', rail:'#889ca4', tread:'#202b31', hub:'#606e77',
 guide:'#364851', concrete:'#9b9687', ballast:'#5f6866', copper:'#d99b42',
 isolation:'#e1ded4', case:'#3f6274', orange:'#df7835'
};

export function makeTraction278(root,mode) {
 const materials=Object.fromEntries(Object.entries(palette).map(([key,color])=>
  [key,new Three.MeshStandardMaterial({color,roughness:key==='tread'?.9:.58,metalness:key==='rail'?.55:.18})]));
 const at=(x,y,z)=>new Three.Vector3(x,y,z);
 function part(parent,x,y,z) {
  const group=new Three.Group();
  group.position.set(x,y,z);
  parent.add(group);
  return group;
 }
 function mesh(parent,geometry,material,x,y,z) {
  const object=new Three.Mesh(geometry,materials[material]);
  object.position.set(x,y,z);
  parent.add(object);
  return object;
 }
 const box=(parent,x,y,z,dx,dy,dz,material)=>mesh(parent,new Three.BoxGeometry(dx,dy,dz),material,x,y,z);
 function cylinder(parent,x,y,z,r,w,material,axis='z') {
  const object=mesh(parent,new Three.CylinderGeometry(r,r,w,32),material,x,y,z);
  if(axis==='z')object.rotation.x=Math.PI/2;
  if(axis==='x')object.rotation.z=Math.PI/2;
  return object;
 }
 const running=mode==='traction', ferreo=mode==='steel';
 const length=running?10.8:5.8;
 const shoeX=.22, barZ=1.50, shoeZ=1.40, contactY=.60, railZ=.71;
 box(root,0,-.31,0,length+.2,.25,3.55,'ballast');
 for(let x=-length/2+.25;x<length/2;x+=.58)box(root,x,-.12,0,.24,.17,3.18,'concrete');
 const track=root;
 for(const side of [-1,1]) {
  const top=ferreo?.14:.075;
  box(track,0,top-.075,side*railZ,length,.15,.045,'rail');
  box(track,0,top-.017,side*railZ,length,.034,.098,'rail');
  box(track,0,top-.137,side*railZ,length,.032,.145,'rail');
  if(ferreo){
   for(let x=-length/2+.25;x<length/2;x+=.58)
    box(track,x,-.02,side*railZ,.12,.04,.21,'frame');
   continue;
  }
  box(track,0,.012,side*1.06,length,.195,.35,'concrete');
  box(track,0,contactY,side*barZ,length,.17,.078,'copper');
  for(let x=-length/2+.45;x<length/2;x+=1.12){
   box(track,x,.24,side*1.56,.075,.56,.075,'frame');
   box(track,x,.58,side*1.55,.16,.16,.095,'isolation');
  }
 }

 const keyParts={}, exploded=[], rolling=[];
 const bogie=part(root,running?-1.6:0,0,0);
 const axleY=ferreo?.53:.58;
 box(bogie,0,.93,0,2.28,.21,1.38,'frame');
 for(const side of [-1,1]) {
  box(bogie,0,.88,side*.8,2.42,.205,.16,'frame');
  for(const x of [-.68,.68]){
   cylinder(bogie,x,.99,side*.72,.13,.18,'isolation','y');
   cylinder(bogie,x,1.06,side*.72,.17,.08,'rail','y');
  }
 }
 function wheel(x,z,r,w,material){
  const group=part(bogie,x,axleY,z);
  cylinder(group,0,0,0,r,w,material);
  const side=Math.sign(z);
  cylinder(group,0,0,side*(w/2+.022),r*.54,.044,'hub');
  for(let i=0;i<6;i++){
   const angle=i*Math.PI/3;
   cylinder(group,Math.cos(angle)*r*.32,Math.sin(angle)*r*.32,side*(w/2+.051),r*.055,.017,'rail');
  }
  rolling.push({object:group,r});
  return group;
 }
 for(const x of [-.94,.94]) {
  cylinder(bogie,x,axleY,0,.067,ferreo?1.65:2.35,'rail');
  for(const side of [-1,1]) {
   const steel=wheel(x,side*railZ,ferreo?.39:.44,ferreo?.17:.13,'rail');
   cylinder(steel,0,0,side*(ferreo?-.077:-.058),ferreo?.425:.485,.04,'rail');
   if(ferreo){if(x>0&&side>0)keyParts.steelWheel=steel;continue;}
   const tire=wheel(x,side*1.06,.471,.30,'tread');
   for(const offset of [-.09,0,.09])cylinder(tire,0,0,offset,.474,.035,'guide');
   const guide=part(bogie,x,contactY,side*1.29);
   cylinder(guide,0,0,0,.174,.105,'tread','y');
   cylinder(guide,0,.057,0,.086,.045,'rail','y');
   box(bogie,x,.64,side*1.0,.12,.105,.56,'frame');
   if(x>0&&side>0)Object.assign(keyParts,{tire,steelWheel:steel,guide});
   if(mode==='runningGear'){
    exploded.push([tire,at(x*.22,.23,side*.58)],[steel,at(x*.12,0,side*.10)],
     [guide,at(x*.36,.30,side*.92)]);
   }
  }
 }
 if(ferreo){
  keyParts.rail=part(track,1.85,.14,railZ);
  return {anchors:keyParts,animate(){}};
 }

 for(const side of [-1,1]){
  const shoe=part(bogie,shoeX,contactY,side*shoeZ);
  box(shoe,0,0,0,.41,.105,.116,'tread');
  box(shoe,0,-.07,side*-.064,.35,.065,.17,'copper');
  box(shoe,0,-.16,side*-.16,.22,.14,.13,'isolation');
  box(shoe,.02,-.25,side*-.25,.16,.105,.26,'frame');
  if(side>0)keyParts.shoe=shoe;
  if(mode==='runningGear')exploded.push([shoe,at(-.44,.13,side*.66)]);
  const returnShoe=part(bogie,-.30,.105,side*railZ);
  box(returnShoe,0,0,0,.22,.06,.105,'copper');
  box(returnShoe,.04,.15,0,.08,.30,.075,'frame');
  if(side>0)keyParts.return=returnShoe;
 }
 keyParts.bar=part(track,1.73,contactY,barZ);
 keyParts.pista=part(track,1.64,.11,1.06);
 for(const [group] of exploded)group.userData.assembled=group.position.clone();
 if(!running)return {anchors:keyParts,animate(seconds){
  const amount=smooth(seconds,3,10)*(1-smooth(seconds,45,51));
  for(const [group,offset] of exploded)group.position.copy(group.userData.assembled).addScaledVector(offset,amount);
 }};

 for(const x of [-.94,.94]) {
  const motor=part(bogie,x,.67,0);
  cylinder(motor,0,0,0,.192,.58,'case');
  for(let i=-4;i<=4;i++)cylinder(motor,0,0,i*.061,.208,.028,'rail');
  box(motor,0,.21,0,.23,.16,.35,'case');
  if(x>0)keyParts.motor=motor;
 }
 box(bogie,0,1.37,-.52,3.45,.19,1.49,'orange');
 box(bogie,0,1.55,-1.24,3.45,.21,.085,'orange');
 const converter=keyParts.converter=part(bogie,-.16,1.12,.86);
 box(converter,0,0,0,.65,.25,.45,'case');
 for(let i=-4;i<=4;i++)box(converter,i*.069,.08,.231,.033,.085,.035,'rail');
 const resistor=keyParts.resistor=part(bogie,-1.17,1.12,.89);
 box(resistor,0,.07,0,.74,.06,.51,'frame');
 const glow=new Three.MeshStandardMaterial({color:'#756057',emissive:'#ff572c',emissiveIntensity:0,roughness:.51});
 materials.glow=glow;
 for(let i=-5;i<=5;i++)box(resistor,i*.057,-.025,0,.032,.115,.41,'glow');
 const contact=()=>at(shoeX,contactY,barZ-.04);
 const pickup=()=>at(shoeX,contactY,shoeZ);
 const inverter=()=>converter.position.clone();
 const motor=()=>keyParts.motor.position.clone();
 function flow(points,color){
  const path=new Three.CurvePath();
  for(let i=1;i<points.length;i++)path.add(new Three.LineCurve3(points[i-1],points[i]));
  const group=part(bogie,0,0,0);
  const line=new Three.Line(new Three.BufferGeometry().setFromPoints(points),
   new Three.LineBasicMaterial({color,transparent:true,opacity:.8,depthTest:false}));
  const marker=new Three.SphereGeometry(.037,10,8);
  const dots=Array.from({length:7},()=>new Three.Mesh(marker,new Three.MeshBasicMaterial({color,depthTest:false,transparent:true})));
  group.add(line,...dots);
  return (seconds,amount)=>{
   group.visible=amount>.015;
   if(!group.visible)return;
   line.material.opacity=.32+amount*.53;
   dots.forEach((dot,i)=>{
    dot.material.opacity=.5+amount*.5;
    dot.position.copy(path.getPointAt((seconds*.65+i/dots.length)%1));
   });
  };
 }
 const fromBar=flow([at(-2.9,contactY,barZ-.04),contact(),pickup(),at(.10,.93,1.01),inverter(),at(.52,.95,.71),motor()],'#ffca58');
 const railReturn=flow([inverter(),at(-.30,.24,railZ),at(-.30,.105,railZ),at(-2.9,.095,railZ)],'#86d9ee');
 const toHeat=flow([motor(),at(.52,.95,.71),inverter(),at(-.59,1.12,.89),resistor.position.clone()],'#ff7654');
 return {anchors:keyParts,animate(seconds){
  const {distance,current,heat,braking}=tractionFrame278(seconds);
  bogie.position.x=-1.6+distance;
  for(const {object,r} of rolling)object.rotation.z=-distance/r;
  fromBar(seconds,current);
  railReturn(seconds,current);
  toHeat(seconds,braking);
  glow.emissiveIntensity=2.7*heat;
 }};
}
