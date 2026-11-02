// Visual teaching fixtures. Values and times are scenario data, never STC acceptance limits.
export function reviseProcedures148(m){
 const c=m.control;c.targets.isolator148='S1 · fuente auxiliar';c.targets.release='Recoger puntas';c.steps.splice(4,0,
 {text:'Abre S1 para aislar la fuente virtual antes de abrir el portafusible.',tool:'inspect',target:'isolator148',effect:'isolate148'},
 {text:'Comprueba 0 V en la fuente del ramal aislado.',tool:'meter',target:'tpSource',effect:'zero148'},
 {text:'Recoge las puntas antes de intervenir.',tool:'inspect',target:'release',effect:'release148'});
 c.steps.splice(c.steps.findIndex(s=>s.effect==='close')+1,0,{text:'Con el portafusible cerrado, habilita S1 para el ensayo funcional.',tool:'inspect',target:'isolator148',effect:'energise148'});
 const b=m.battery;b.title='Caída de tensión en una conexión auxiliar';b.summary='Compara la caída de tensión antes y después de recuperar una conexión, con la misma carga de ensayo de 10 A. La continuidad por sí sola no evalúa la calidad de la unión. Banco ficticio de 24 V, sin conexión a una SR real.';b.measurement148=true;
 b.targets={...b.targets,isolator148:'S1 · carga de prueba',measure:'Medir caída de tensión',release:'Retirar puntas'};
 b.steps=[
 {text:'Inspecciona el puente y las superficies de contacto.',tool:'inspect',target:'terminalL',effect:'inspectL'},
 {text:'Habilita la carga virtual de 10 A mediante S1.',tool:'inspect',target:'isolator148',effect:'loadOn148'},
 {text:'Coloca la punta roja en el extremo izquierdo.',tool:'red',target:'terminalL',effect:'red'},
 {text:'Coloca la punta negra en el extremo derecho.',tool:'black',target:'terminalR',effect:'black'},
 {text:'Mide la caída con la carga de 10 A.',tool:'meter',target:'measure',effect:'dropBefore148'},
 {text:'Se miden 120 mV con 10 A. ¿Qué describe la evidencia?',tool:'inspect',target:'resistive148',effect:'diagnose',choices:{resistive148:'Conexión resistiva en este escenario',batteryFlat148:'La batería ha perdido toda su capacidad',good148:'Un pitido de continuidad basta para declararla correcta'}},
 {text:'Desconecta la carga y aísla el circuito virtual con S1.',tool:'inspect',target:'isolator148',effect:'isolate148'},
 {text:'Comprueba ausencia de tensión de ensayo entre los terminales.',tool:'meter',target:'measure',effect:'zero148'},
 {text:'Retira las dos puntas antes de limpiar o ajustar.',tool:'meter',target:'release',effect:'release'},
 {text:'Limpia la superficie del contacto izquierdo con el cepillo.',tool:'brush',target:'terminalL',repeat:3,effect:'cleanL'},
 {text:'Limpia el contacto derecho.',tool:'brush',target:'terminalR',repeat:3,effect:'cleanR'},
 {text:'Recupera la fijación izquierda del banco. El par real requiere ficha técnica.',tool:'driver',target:'terminalL',effect:'tightenL'},
 {text:'Recupera la fijación derecha.',tool:'driver',target:'terminalR',effect:'tightenR'},
 {text:'Habilita la misma carga virtual de 10 A.',tool:'inspect',target:'isolator148',effect:'loadOn148'},
 {text:'Conecta roja al extremo izquierdo.',tool:'red',target:'terminalL',effect:'red'},
 {text:'Conecta negra al extremo derecho.',tool:'black',target:'terminalR',effect:'black'},
 {text:'Repite la medida con la misma carga para comparar.',tool:'meter',target:'measure',effect:'dropAfter148'},
 {text:'Desconecta la carga virtual.',tool:'inspect',target:'isolator148',effect:'isolate148'},
 {text:'Recoge las puntas.',tool:'meter',target:'release',effect:'release'},
 {text:'Registra 120 → 12 mV, con 10 A en ambos ensayos. Esto no prueba capacidad de batería.',tool:'test',target:'indicator',effect:'test'}];
 const a=m.insulation;a.title='Aislamiento · tendencia y descarga';a.summary='Muestras aisladas: evolución de resistencia durante 60 s simulados, interpretación y descarga antes de retirar las puntas. Reloj del ensayo acelerado 10:1. Sin tensión ni umbral real de aceptación asignados.';
 const steps=[];for(const original of a.steps){const s={...original};if(s.effect==='replace'){steps.push({text:'Antes de intervenir, ¿qué debe investigarse además de esta lectura?',tool:'inspect',target:'investigate148',effect:'diagnose',choices:{investigate148:'Contaminación, humedad, temperatura e historial',replaceAll148:'Cambiar el transformador sólo por esta lectura',universal148:'Aplicar un límite único a cualquier equipo'}});s.text='Tras investigar el escenario, sustituye sólo la muestra aislante deteriorada del banco.';}
 if(s.effect==='reading'){s.duration148=6;s.text='Inicia el ensayo de 60 s simulados y observa la evolución (6 s de juego).';}steps.push(s);if(s.effect==='reading')steps.push({text:'Con las puntas conectadas, inicia la descarga y espera la indicación de carga residual nula del banco.',tool:'test',target:'measure',effect:'discharge148',duration148:2.5});}
 let checkpoint=0;steps.forEach((s,i)=>{if(s.effect==='red')checkpoint=i;if(['red','black','reading','release'].includes(s.effect))s.checkpoint=checkpoint;});a.steps=steps;
}

export function augmentMaintenance148(State){
 const start=State.prototype.start,act=State.prototype.act,release=State.prototype.releaseProbes;
 State.prototype.start=function(id){this.pending148=null;this.charge148=false;this.trace148=[];this.load148=id==='control';this.isolated148=false;return start.call(this,id);};
 State.prototype.releaseProbes=function(){if(this.charge148||this.pending148){this.feedback='Mantén las puntas conectadas hasta completar la descarga.';return{ok:false};}return release.call(this);};
 State.prototype.act=function(target){
  if(this.pending148){this.feedback='Medición en curso: espera la estabilización o la descarga.';return{ok:false,pending:true};}
  if(this.mission.measurement148&&target==='release')return this.releaseProbes();
  const s=this.step;if(!s)return act.call(this,target);
  if(target!==s.target&&this.id==='control'&&this.tool==='meter'&&['tpSource','tpLoad'].includes(target)){
   this.reading=this.isolated148?'0.0 V CD':target==='tpSource'||this.effects.includes('replace')?'24.0 V CD':'0.0 V CD';this.feedback='Medición exploratoria registrada; el objetivo de la orden se mantiene.';this.log.push({red:target,black:'COM',value:this.reading,exploratory:true});return{ok:true,effect:target==='tpSource'?'source':'load',complete:false};
  }
  if(target!==s.target&&this.tool==='inspect'&&!s.choices&&Object.hasOwn(this.mission.targets,target)){this.feedback='Inspección: '+this.mission.targets[target]+'. Objetivo actual: '+s.text;return{ok:true,effect:'observe148',complete:false};}
  if(this.tool!==s.tool||target!==s.target)return act.call(this,target);
  if(s.duration148){
   if(s.effect==='reading'&&(!this.mode||this.leads.red!==s.expectedLeads.red||this.leads.black!==s.expectedLeads.black)){this.feedback='Conecta ambas puntas en los puntos indicados.';return{ok:false};}
   if(s.effect==='reading'){this.trace148=[];this.charge148=true;}
   this.pending148={elapsed:0,duration:s.duration148,step:s};this.reading=s.effect==='reading'?'Ensayo 0 / 60 s simulados':'Descargando · puntas conectadas';return{ok:true,effect:'pending148',complete:false,pending:true};
  }
  if(['dropBefore148','dropAfter148'].includes(s.effect)&&(!this.load148||!this.leads.red||!this.leads.black)){this.feedback='Conecta ambas puntas y habilita la carga de ensayo.';return{ok:false};}
  if(s.effect==='zero148'&&this.mission.measurement148&&(!this.leads.red||!this.leads.black||!this.isolated148)){this.feedback='Aísla la fuente y conserva las puntas conectadas para verificar.';return{ok:false};}
  const result=act.call(this,target);if(!result.ok)return result;
  if(s.effect==='red')this.leads.red=target;if(s.effect==='black')this.leads.black=target;
  if(['loadOn148','energise148'].includes(s.effect)){this.load148=true;this.isolated148=false;}
  if(s.effect==='isolate148'){this.load148=false;this.isolated148=true;}
  if(s.effect==='release148')this.leads={red:null,black:null};
  if(s.effect==='zero148'){this.reading='0.0 V · fuente aislada';this.log.push({red:target,black:'COM',value:this.reading});}
  if(['dropBefore148','dropAfter148'].includes(s.effect)){const resistance=s.effect==='dropBefore148'?.012:.0012;this.reading=(resistance*10*1000).toFixed(1)+' mV · 10.0 A';this.log.push({red:this.leads.red,black:this.leads.black,value:this.reading});}
  if(s.effect==='source'&&this.isolated148)this.reading='0.0 V CD';
  if(s.effect==='test'&&this.id==='battery')this.reading='120 → 12 mV · misma carga de 10 A';return result;
 };
 State.prototype.advance148=function(dt){
  const p=this.pending148;if(!p)return null;p.elapsed+=Math.max(0,Math.min(.1,dt));const t=Math.min(1,p.elapsed/p.duration);
  if(p.step.effect==='reading'){const value=parseFloat(p.step.reading)*(.72+.28*(1-Math.exp(-4*t))/(1-Math.exp(-4))),time=Math.round(t*60);this.reading=value.toFixed(1)+' MΩ · '+time+' / 60 s sim.';if(this.trace148.at(-1)?.time!==time)this.trace148.push({time,value});}
  else this.reading='Descarga '+Math.round(t*100)+' % · puntas conectadas';
  if(t<1)return{ok:true,effect:'progress148',complete:false};this.pending148=null;const selected=this.tool;this.tool=p.step.tool;const result=act.call(this,p.step.target);this.tool=selected;
  if(p.step.effect==='reading'){const row=this.log.at(-1);row.time='60 s simulados';row.conditions='Muestra de banco; condiciones constantes, sin tensión real especificada';}
  else{this.charge148=false;this.reading='Carga residual virtual: 0 · ensayo terminado';}
  return{...result,step148:p.step};
 };
}
