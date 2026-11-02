import * as THREE from 'three';
export function prepareTrainDisplays(group){
 const materials=new Map();group.traverse(o=>{if(!o.isMesh)return;const src=o.material;if(!src?.userData.monitor_vagon)return;if(!materials.has(src)){const m=src.clone();materials.set(src,m);}o.material=materials.get(src);});
 if(!materials.size)return null;
 const canvas=document.createElement('canvas');canvas.width=768;canvas.height=480;const texture=new THREE.CanvasTexture(canvas);texture.colorSpace=THREE.SRGBColorSpace;texture.flipY=false;
 for(const m of materials.values()){m.map=texture;m.emissiveMap=texture;m.needsUpdate=true;}
 return {canvas,ctx:canvas.getContext('2d'),texture,materials:[...materials.values()],last:''};
}
export function trainDisplayInfo(train,line,engine,prediction){
 const here=train.wait>0,direction=here&&(train.target===0||train.target===line.stations.length-1)?(train.target===0?1:-1):train.direction;
 const rows=[];for(let k=0;k<3;k++){const index=train.target+k*direction;if(index<0||index>=line.stations.length)break;const r=(prediction.arrivals.get(`${train.line}:${index}:${k===0?train.direction:direction}`)||[]).find(r=>r.id===train.id&&r.seconds>=engine.time-prediction.generatedAt);
 let timing=k===0&&here?'EN ESTACIÓN':engine.emergency||!engine.power[train.line]?'SERVICIO DETENIDO':r?`${Math.floor(Math.ceil(Math.max(0,r.seconds-(engine.time-prediction.generatedAt)))/60)}:${String(Math.ceil(Math.max(0,r.seconds-(engine.time-prediction.generatedAt)))%60).padStart(2,'0')} min`:'—';rows.push({name:line.stations[index].nombre,timing});}
 return {rows,destination:direction===1?line.stations.at(-1).nombre:line.stations[0].nombre,here,clock:engine.clockSeconds()};
}
export function updateTrainDisplay(display,train,line,engine,prediction){
 if(!display)return;const info=trainDisplayInfo(train,line,engine,prediction),key=JSON.stringify({...info,clock:Math.floor(info.clock)});if(key===display.last)return;display.last=key;const c=display.ctx;
 c.fillStyle='#eeeee7';c.fillRect(0,0,768,480);c.fillStyle='#dd3392';c.fillRect(0,0,768,54);c.fillRect(511,54,4,365);c.fillStyle='white';c.font='bold 28px Arial';c.fillText(info.here?'EN ESTACIÓN':'PRÓXIMA PARADA',20,37);c.font='22px Arial';c.fillText('DIRECCIÓN',541,36);
 for(let i=0;i<info.rows.length;i++){const r=info.rows[i],y=90+i*105;c.fillStyle='#27312b';let size=29;do{c.font=`bold ${size--}px Arial`;}while(c.measureText(r.name).width>465&&size>16);c.fillText(r.name,22,y);c.font='25px Arial';c.fillText(r.timing,22,y+37);c.strokeStyle='#dd3392';c.lineWidth=2;c.strokeRect(12,y-30,486,86);}
 c.fillStyle='#dd3392';c.fillRect(555,84,167,144);c.fillStyle='white';c.font='bold 84px Arial';c.textAlign='center';c.fillText('1',638,189);c.fillStyle='#202722';c.font='21px Arial';let y=275;for(const w of info.destination.split(' ')){c.fillText(w,638,y);y+=29;}c.textAlign='left';c.fillStyle='#161918';c.fillRect(0,422,768,58);c.fillStyle='#e6e187';c.font='22px Arial';const hh=String(Math.floor(info.clock/3600)).padStart(2,'0'),mm=String(Math.floor(info.clock/60)%60).padStart(2,'0'),ss=String(Math.floor(info.clock)%60).padStart(2,'0');c.fillText(`${hh}:${mm}:${ss} · TIEMPOS DE LA SIMULACIÓN`,20,458);display.texture.needsUpdate=true;
}
export function disposeTrainDisplay(display){if(!display)return;display.texture.dispose();display.materials.forEach(m=>m.dispose());}
