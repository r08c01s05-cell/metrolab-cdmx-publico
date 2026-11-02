import './simulation106.js?v=187';
export class StationLife121{
 constructor(doc=document,win=window){
  this.doc=doc;this.win=win;this.$=id=>doc.getElementById(id);
  if(!this.$('sim106-session-settings')||this.$('life121'))return;
  const panel=doc.createElement('section');panel.setAttribute('id','life121');panel.innerHTML='<h3>Hora, afluencia y clima</h3><div id="life121-controls"></div><p id="life121-source"></p><p>El Excel aporta personas por hora; la espera se calcula con las llegadas y el abordaje. Hasta 900 figuras en los andenes; la demanda superior se representa de forma agrupada.</p>';
  this.$('sim106-session-settings').prepend(panel);
  for(const id of ['start-hour','demand-mode','demand']){const input=this.$(id);if(input)this.$('life121-controls').append(input.parentElement);}
  if(this.$('hourly-info'))panel.append(this.$('hourly-info'));
  const caption=doc.createElement('div');caption.setAttribute('id','life121-inline');caption.innerHTML='<span id="life121-clock"></span><span id="life121-crowd"></span><span id="life121-weather"></span><button id="life121-edit" type="button">Hora y clima</button>';
  this.$('sim106-next')?.parentElement.append(caption);
  this.$('life121-edit')?.addEventListener('click',()=>{win.metroSimulation106?.attachWeather();win.metroGameShell105?.openSettings();this.$('sim106-session-settings').scrollIntoView?.({block:'start'});});
  win.addEventListener?.('metro-ready',()=>this.update());this.timer=win.setInterval(()=>{if(!this.$('simulation')?.hidden)this.update();},500);this.update();
 }
 update(){
  const {win}=this;win.metroSimulation106?.attachWeather();const state=win.metroViewState?.();if(!state?.engine)return;const e=state.engine,line=e.lines[state.currentLine];
  const idx=win.stationScene?.cameraMode==='platform'?win.stationScene.platformStation:win.stationScene?.lastStation;
  const s=line.stations[idx>=0?idx:0];if(!s)return;
  const clock=Math.floor(e.clockSeconds()),hh=String(Math.floor(clock/3600)%24).padStart(2,'0'),mm=String(Math.floor(clock/60)%60).padStart(2,'0'),queue=Math.floor(e.waiting[s.id]||0),info=e.demandInfo(s);
  if(this.$('life121-clock'))this.$('life121-clock').textContent=hh+':'+mm;
  if(this.$('life121-crowd'))this.$('life121-crowd').textContent=queue.toLocaleString('es-MX')+' en espera · sim.'+(queue>900?' · 900 figuras':'');
  if(this.$('life121-weather')){this.$('life121-weather').textContent=e.weather==='rain'?'Lluvia · marcha lenta':'Seco';this.$('life121-weather').dataset.rain=e.weather==='rain'?'true':'false';}
  if(this.$('life121-source'))this.$('life121-source').textContent=s.nombre+' · '+Math.round(info.hourly).toLocaleString('es-MX')+' entradas/h · '+info.label;
 }
}
if(typeof document!=='undefined'&&document.getElementById('simulation'))new StationLife121();
