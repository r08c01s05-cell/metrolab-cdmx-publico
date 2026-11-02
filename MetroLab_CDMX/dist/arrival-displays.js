import * as THREE from 'three';
// Project the existing engine, including dwell, braking, spacing and turnbacks.
// No demand/exchange side effects; results are simulation estimates only.
export function predictArrivals(engine,horizon=1800){
 const sim=Object.assign(Object.create(Object.getPrototypeOf(engine)),engine,{trains:engine.trains.map(t=>({...t})),waiting:{...engine.waiting}});
 sim.stationArrivals=()=>0;sim.exchange=()=>{};const arrivals=new Map();
 const add=(t,seconds)=>{const key=`${t.line}:${t.target}:${t.direction}`;if(!arrivals.has(key))arrivals.set(key,[]);const row=arrivals.get(key);if(row.length<3)row.push({seconds,id:t.id,atPlatform:seconds===0});};
 for(const t of sim.trains)if(t.wait>0)add(t,0);
 if(engine.emergency)return {arrivals,suspended:true,generatedAt:engine.time};
 for(let s=1;s<=horizon;s++){const before=sim.trains.map(t=>t.wait>0);sim.step(1);sim.trains.forEach((t,i)=>{if(!before[i]&&t.wait>0)add(t,s);});}
 for(const rows of arrivals.values())rows.sort((a,b)=>a.seconds-b.seconds);
 return {arrivals,suspended:false,generatedAt:engine.time};
}
export function arrivalRows(prediction,line,index,direction,power,engine=null){
 if(prediction.suspended||!power)return ['SERVICIO DETENIDO','CONSULTAR AVISOS',''];
 const elapsed=engine?engine.time-prediction.generatedAt:0;const present=engine?.trains.find(t=>t.line===line&&t.target===index&&t.direction===direction&&t.wait>0);const rows=(prediction.arrivals.get(`${line}:${index}:${direction}`)||[]).filter(r=>r.seconds>=elapsed&&r.id!==present?.id).map(r=>({...r,seconds:Math.max(0,r.seconds-elapsed),atPlatform:false}));if(present)rows.unshift({seconds:0,id:present.id,atPlatform:true});else if(!engine&&prediction.arrivals.get(`${line}:${index}:${direction}`)?.[0]?.atPlatform)rows[0].atPlatform=true;
 return [0,1,2].map(i=>rows[i]?(rows[i].atPlatform?'EN ANDÉN':`${Math.floor(Math.ceil(rows[i].seconds)/60)}:${String(Math.ceil(rows[i].seconds)%60).padStart(2,'0')} min`):i===0?'SIN TREN PRÓXIMO':'—');
}
export function prepareArrivalDisplays(root){
 const materials=new Set();root.traverse(o=>{if(o.isMesh)for(const m of Array.isArray(o.material)?o.material:[o.material])if(m.userData.monitor_llegadas)materials.add(m)});
 const displays=[];
 for(const m of materials){
  const c=document.createElement('canvas');c.width=768;c.height=480;const ctx=c.getContext('2d'),texture=new THREE.CanvasTexture(c);texture.colorSpace=THREE.SRGBColorSpace;texture.flipY=false;const old=new Set([m.map,m.emissiveMap]);m.map=texture;m.emissiveMap=texture;m.emissive.setRGB(.65,.65,.65);m.needsUpdate=true;old.forEach(t=>t?.dispose());displays.push({material:m,canvas:c,ctx,texture,direction:m.userData.direccion,destination:m.userData.destino,last:''});
 }
 return displays;
}
export function drawArrivalDisplays(displays,prediction,line,index,engine){
 const clock=engine.clockSeconds(),time=`${String(Math.floor(clock/3600)).padStart(2,'0')}:${String(Math.floor(clock/60)%60).padStart(2,'0')}:${String(Math.floor(clock)%60).padStart(2,'0')}`;
 for(const d of displays){
  const rows=arrivalRows(prediction,line,index,d.direction,engine.power[line],engine),key=rows.join('|')+time;if(d.last===key)continue;d.last=key;const c=d.ctx,color=line===1?'#dd3392':'#009142';
  c.fillStyle='#eeeee7';c.fillRect(0,0,768,480);c.fillStyle=color;c.fillRect(0,0,768,48);c.fillRect(504,0,5,422);c.fillStyle='white';c.font='bold 25px Arial';c.fillText('PRÓXIMOS TRENES',20,34);c.font='22px Arial';c.fillText('DIRECCIÓN',525,33);
  for(let i=0;i<3;i++){const y=100+i*100;c.fillStyle='#28312c';c.fillRect(25,y-22,32,22);c.fillRect(29,y-30,24,7);c.beginPath();c.moveTo(30,y+4);c.lineTo(23,y+12);c.moveTo(52,y+4);c.lineTo(60,y+12);c.strokeStyle='#28312c';c.lineWidth=3;c.stroke();c.font='bold 28px Arial';c.fillText(rows[i],82,y);c.strokeStyle=color;c.lineWidth=2;c.strokeRect(12,y-48,475,85);}
  c.fillStyle=color;c.fillRect(551,88,167,149);c.fillStyle='white';c.font='bold 85px Arial';c.textAlign='center';c.fillText(String(line),635,197);c.fillStyle='#202722';c.font='20px Arial';let y=280;
  for(const word of d.destination.split(' ')){c.fillText(word,635,y);y+=27;}c.textAlign='left';c.fillStyle='#161918';c.fillRect(0,422,768,58);c.fillStyle='#e6e187';c.font='22px Arial';c.fillText(time+' · ESTIMACIÓN SIMULADA',20,458);d.texture.needsUpdate=true;
 }
}
