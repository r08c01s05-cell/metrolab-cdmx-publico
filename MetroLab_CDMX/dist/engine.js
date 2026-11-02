(function(root){
class MetroEngine{
 constructor(data){this.data=data;this.hourly=data.demanda_horaria||null;this.documented=data.demanda_documentada||null;this.demandMode=this.hourly?'hourly':this.documented?'documented':'historical';this.weather='dry';this.rainScope='line';this.rainLimit=35;this.startHour=8;this.demandDay=null;this.dwell=30;this.demand=1;this.capacity=1200;this.fleet=4;this.power={1:true,8:true};this.emergency=false;this.lines={};for(const l of [1,8]){const stations=data.estaciones.filter(s=>s.linea===l);const segments=data.interestaciones.filter(s=>s.linea===l);let distances=[0];for(const seg of segments)distances.push(distances.at(-1)+seg.longitud_interestacion_publicada_m+150);this.lines[l]={stations,distances,total:distances.at(-1),color:l===1?'#F04E98':'#009A44'};}this.reset();}
 weatherExposure(t){const line=this.lines[t.line];let i=0;while(i<line.distances.length-2&&t.position>line.distances[i+1])i++;const u=(t.position-line.distances[i])/Math.max(1,line.distances[i+1]-line.distances[i]),surface=s=>s?.linea===8&&s.entorno_visual?.tipo==='superficial',a=surface(line.stations[i]),b=surface(line.stations[i+1]);return a&&b||a&&u<.35||b&&u>.65;}
 weatherRestricted(t){return this.weather==='rain'&&(this.rainScope==='line'||this.weatherExposure(t));}
 speedLimit(t){const dry=t.line===1?80:60;return this.weatherRestricted(t)?Math.min(dry,this.rainLimit||35):dry;}
 accelerationFactor(t){return this.weatherRestricted(t)?.65:1;}
 stationDwell(t){return this.dwell*(this.weatherRestricted(t)?1.25:1);}
 stopDuration(t){return t.stopDwell??this.dwell;}
 setWeather(weather,scope=this.rainScope,limit=this.rainLimit){
  this.weather=weather==='rain'?'rain':'dry';this.rainScope=scope==='exterior'?'exterior':'line';this.rainLimit=Math.max(15,Math.min(50,Number(limit)||35));
  for(const t of this.trains)if(t.wait>0&&this.operator?.trainId!==t.id){const elapsed=this.stopDuration(t)-t.wait;t.stopDwell=this.stationDwell(t);t.wait=Math.max(.1,t.stopDwell-elapsed);}
 }
 documentedStation(s){const n=s.nombre.normalize("NFD").replace(/[\u0300-\u036f]/g,"").toUpperCase().trim();return this.documented?.stations[s.linea+":"+n];}
 documentedDaily(s){const ref=this.documentedStation(s);return ref?(this.demandDay===null?ref.dailyMean:(ref.weekdayMeans[String(this.demandDay)]??ref.dailyMean)):this.historicalDaily(s);}
 documentedHourlyShape(s){return this.hourly?.estaciones?.[s.id]||this.hourly?.promedios_linea?.[String(s.linea)]||null;}
 historicalDaily(s){const ref=s.afluencia_referencia;return this.demandDay===null?(ref?.promedio_diario||0):(ref?.perfil_dia_semana?.[String(this.demandDay)]??ref?.promedio_diario??0);}
 hourlyProfile(s){if(this.demandMode!=='hourly')return null;return this.hourly?.estaciones?.[s.id]||this.hourly?.promedios_linea?.[String(s.linea)]||null;}
 stationDaily(s){if(this.demandMode==="documented")return this.documentedDaily(s);return this.hourlyProfile(s)?.total??this.historicalDaily(s);}
 clockSeconds(time=this.time){return ((this.startHour*3600+time)%86400+86400)%86400;}
 stationRate(s,time=this.time){if(this.demandMode==="documented"){const h=Math.floor(this.clockSeconds(time)/3600),p=this.documentedHourlyShape(s),total=p?Object.values(p.valores_por_hora).reduce((a,b)=>a+Number(b||0),0):0;const share=total>0?Number(p.valores_por_hora[String(h)]||0)/total:(h>=5&&h<23?1/18:0);return this.documentedDaily(s)*share/3600*this.demand;}const profile=this.hourlyProfile(s);return profile?(profile.valores_por_hora[String(Math.floor(this.clockSeconds(time)/3600))]||0)/3600*this.demand:this.historicalDaily(s)/64800*this.demand;}
 stationArrivals(s,from,to){let total=0;while(from<to){const wall=this.clockSeconds(from),end=Math.min(to,from+3600-wall%3600);total+=this.stationRate(s,from)*(end-from);from=end;}return total;}
 demandInfo(s){if(this.demandMode==="documented")return {label:"CSV · mayo–julio 2026 · "+(this.demandDay===null?"media diaria":"día de semana seleccionado")+" · horario estimado "+(this.documentedHourlyShape(s)?"con perfil del Excel":"uniforme de 05:00 a 23:00"),hourly:this.stationRate(s)*3600};const profile=this.hourlyProfile(s);if(!profile)return {label:'Histórico mensual · reparto uniforme en 18 h',hourly:this.stationRate(s)*3600};return {label:(this.hourly.estaciones[s.id]?'Excel · '+profile.nombre_excel:'Promedio Excel de intermedias L'+s.linea)+' · Hoja1, fila '+profile.fila_excel,hourly:this.stationRate(s)*3600};}
 boardingLimit(t){return Math.floor(Math.max(0,(t?this.stopDuration(t):this.dwell)-8)*36*.7);}
 reset(){this.operator=null;this.epoch=(this.epoch||0)+1;this.time=0;this.emergency=false;this.power={1:true,8:true};this.waiting={};this.arrivals=0;this.boarded=0;this.alighted=0;this.initialOnboard=0;this.trains=[];for(const l of [1,8]){const line=this.lines[l];for(const s of line.stations){const initial=Math.floor(this.stationArrivals(s,-180,0));this.waiting[s.id]=initial;this.arrivals+=initial;}for(let i=0;i<this.fleet;i++){const idx=Math.floor(i*(line.stations.length-1)/this.fleet);const direction=i%2===0?1:-1;const seed=idx===0||idx===line.stations.length-1?0:Math.min(Math.floor(this.capacity*.75),Math.floor(this.stationRate(line.stations[idx])*180*.6));this.initialOnboard+=seed;this.trains.push({id:`L${l}-${String(i+1).padStart(2,'0')}`,line:l,model:l===1?'NM-22':(i%2?'MP-82':'NM-79'),position:line.distances[idx],speed:0,direction:idx===0?1:direction,target:idx,wait:this.dwell,state:'En estación',load:seed,stops:0});}}for(const t of this.trains){t.stopDwell=this.stationDwell(t);t.wait=t.stopDwell;}}
 exchange(t){const s=this.lines[t.line].stations[t.target];const terminal=t.target===0||t.target===this.lines[t.line].stations.length-1;const exiting=terminal?t.load:Math.floor(t.load*.2);t.load-=exiting;this.alighted+=exiting;const entering=Math.min(Math.floor(this.waiting[s.id]),this.capacity-t.load,this.boardingLimit(t));this.waiting[s.id]-=entering;t.load+=entering;this.boarded+=entering;}
 step(dt){if(dt<=0)return;const previousTime=this.time;this.time+=dt;for(const l of [1,8])for(const s of this.lines[l].stations){const n=this.stationArrivals(s,previousTime,this.time);this.waiting[s.id]+=n;this.arrivals+=n;}
 for(const t of this.trains){if(this.operator?.trainId===t.id&&root.MetroManual){root.MetroManual.stepManual(this,t,dt);continue;}const line=this.lines[t.line];if(t.wait>0){t.state=this.emergency?'Emergencia':!this.power[t.line]?'Sin alimentación':'En estación';if(this.emergency||!this.power[t.line])continue;t.wait=Math.max(0,t.wait-dt);if(t.wait===0){this.exchange(t);if(t.target===line.stations.length-1)t.direction=-1;if(t.target===0)t.direction=1;t.target+=t.direction;}continue;}
 const remain=Math.abs(line.distances[t.target]-t.position),b=t.line===1?1.8:1.2,a=t.line===1?1.4:1;let desired=Math.min(this.speedLimit(t)/3.6,Math.sqrt(2*b*Math.max(0,remain-.1)));let blocked=false;
 for(const other of this.trains){if(other===t||other.line!==t.line||other.direction!==t.direction)continue;const gap=(other.position-t.position)*t.direction;if(gap>0&&gap<500){desired=Math.min(desired,Math.sqrt(2*b*Math.max(0,gap-180)));blocked=gap<200;}}
 if(this.emergency||!this.power[t.line])desired=0;
 t.speed=desired<t.speed?Math.max(desired,t.speed-(this.emergency?2:b)*dt):Math.min(desired,t.speed+a*this.accelerationFactor(t)*dt);
 const move=t.speed*dt;t.state=this.emergency?'Freno de emergencia':!this.power[t.line]?'Frenando · sin energía':blocked?'Separación simulada':desired<t.speed+.01?'En circulación':'Acelerando';
 if(this.emergency)t.state='Freno de emergencia';
 if((move>=remain||remain<.15)&&!this.emergency&&this.power[t.line]){t.position=line.distances[t.target];t.speed=0;t.stopDwell=this.stationDwell(t);t.wait=t.stopDwell;t.stops++;t.state='En estación';}else t.position+=move*t.direction;
 }
 }
}
root.MetroEngine=MetroEngine;if(typeof module!=='undefined')module.exports=MetroEngine;
})(typeof window!=='undefined'?window:globalThis);
