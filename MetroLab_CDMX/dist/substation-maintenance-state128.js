import {reviseProcedures148,augmentMaintenance148} from './maintenance-procedures148.js?v=148';
import {SR_TECHNICAL129} from './substation-technical129.js?v=129';
// Educational scenarios only: no switching orders or live-HV intervention procedure.
export const SR_TOOLS128={inspect:'Inspección visual',hand:'Manos libres',driver:'Destornillador',brush:'Cepillo',meter:'Multímetro',spare:'Repuesto',test:'Prueba funcional',red:'Punta roja',black:'Punta negra'};
export const SR_MISSIONS128={
 ventilation:{title:'Ventilación del transformador',part:'transformer',summary:'El filtro del banco está obstruido. Retíralo, límpialo y comprueba el ventilador.',targets:{filter:'Filtro extraíble',screwL:'Tornillo izquierdo',screwR:'Tornillo superior derecho',screw3:'Tornillo inferior izquierdo',screw4:'Tornillo inferior derecho',fan:'Ventilador'},steps:[
  {text:'Toma el anemómetro de la bolsa, llévalo al ventilador y mantén E para medir el flujo inicial.',tool:'meter',target:'fan',effect:'airBefore'},
  {text:'Inspecciona el filtro para identificar la obstrucción.',tool:'inspect',target:'filter',effect:'diagnose'},
  {text:'El flujo es bajo y el filtro tiene depósitos visibles. ¿Qué revisarías primero?',tool:'inspect',target:'filterRestriction',effect:'diagnose',choices:{filterRestriction:'Restricción del filtro',replaceMotor:'Cambiar el motor sin comprobar',ignoreFlow:'Ignorar la lectura de flujo'}},
  {text:'Afloja el tornillo izquierdo con el destornillador.',tool:'driver',target:'screwL',effect:'loosenL'},
  {text:'Afloja el tornillo derecho con el destornillador.',tool:'driver',target:'screwR',effect:'loosenR'},
  {text:'Afloja el tornillo inferior izquierdo.',tool:'driver',target:'screw3',effect:'loosen3'},
  {text:'Afloja el tornillo inferior derecho.',tool:'driver',target:'screw4',effect:'loosen4'},
  {text:'Toma el filtro liberado con E, llévalo al tapete y apóyalo con E.',tool:'inspect',target:'filter',effect:'remove'},
  {text:'Prepara el cepillo y mantén E sobre el filtro apoyado para realizar tres pasadas.',tool:'brush',target:'filter',repeat:3,effect:'clean'},
  {text:'Recoge el filtro limpio, llévalo a su alojamiento y pulsa E para montarlo.',tool:'inspect',target:'filter',effect:'install'},
  {text:'Aprieta el tornillo izquierdo.',tool:'driver',target:'screwL',effect:'tightenL'},
  {text:'Aprieta el tornillo derecho.',tool:'driver',target:'screwR',effect:'tightenR'},
  {text:'Aprieta el tornillo inferior izquierdo.',tool:'driver',target:'screw3',effect:'tighten3'},
  {text:'Aprieta el tornillo inferior derecho.',tool:'driver',target:'screw4',effect:'tighten4'},
  {text:'Recoge el anemómetro donde lo dejaste y repite la medida manteniendo E junto al ventilador.',tool:'meter',target:'fan',effect:'airAfter'},
  {text:'Deja el anemómetro apoyado o guardado y mantén E en el ventilador para el ensayo funcional.',tool:'test',target:'fan',effect:'test'}]},
 control:{title:'Circuito auxiliar de práctica',part:'control',summary:'Una lámpara de prueba no enciende. Diagnostica el fusible de un circuito ficticio de 24 V CD.',targets:{tpSource:'Punto de medida de fuente',tpLoad:'Punto de medida de salida',fuse:'Portafusible',lamp:'Lámpara de prueba'},steps:[
  {text:'Con el multímetro, mide el punto de fuente del banco (respecto a COM simulado).',tool:'meter',target:'tpSource',effect:'source'},
  {text:'Mide ahora la salida del circuito para comparar las lecturas.',tool:'meter',target:'tpLoad',effect:'load'},
  {text:'Hay 24 V en la fuente y 0 V en la salida. ¿Qué comprobación procede?',tool:'inspect',target:'checkProtection',effect:'diagnose',choices:{checkProtection:'Revisar protección y conexiones del ramal',replaceSource:'Sustituir directamente la fuente',declareLamp:'Afirmar que la lámpara está fundida'}},
  {text:'Con Inspección, observa el portafusible indicado.',tool:'inspect',target:'fuse',effect:'diagnose'},
  {text:'Con el destornillador, abre el portafusible del banco simulado.',tool:'driver',target:'fuse',effect:'open'},
  {text:'Selecciona Repuesto y coloca el fusible de práctica nuevo.',tool:'spare',target:'fuse',effect:'replace'},
  {text:'Cierra el portafusible con el destornillador.',tool:'driver',target:'fuse',effect:'close'},
  {text:'Repite la medida de salida con el multímetro.',tool:'meter',target:'tpLoad',effect:'verify'},
  {text:'Selecciona Prueba de banco y pulsa la lámpara.',tool:'test',target:'lamp',effect:'test'}]},
 battery:{title:'Conexiones del banco auxiliar',part:'battery',summary:'Dos conexiones de práctica tienen suciedad y una fijación floja. Revisa y recupera el contacto del banco.',targets:{terminalL:'Conexión izquierda',terminalR:'Conexión derecha',indicator:'Indicador de continuidad'},steps:[
  {text:'Inspecciona la conexión izquierda.',tool:'inspect',target:'terminalL',effect:'inspectL'},
  {text:'Inspecciona la conexión derecha.',tool:'inspect',target:'terminalR',effect:'inspectR'},
  {text:'Hay depósitos y una fijación floja. ¿Qué intervención justifica la inspección?',tool:'inspect',target:'recoverContact',effect:'diagnose',choices:{recoverContact:'Limpiar y recuperar la fijación del contacto',replaceBank:'Sustituir todo el banco sin más pruebas',ignoreContact:'Dejar la conexión tal como está'}},
  {text:'Limpia la conexión izquierda con el cepillo: tres pasadas o tres clics.',tool:'brush',target:'terminalL',repeat:3,effect:'cleanL'},
  {text:'Limpia la conexión derecha con el cepillo: tres pasadas o tres clics.',tool:'brush',target:'terminalR',repeat:3,effect:'cleanR'},
  {text:'Ajusta la fijación izquierda con el destornillador.',tool:'driver',target:'terminalL',effect:'tightenL'},
  {text:'Ajusta la fijación derecha con el destornillador.',tool:'driver',target:'terminalR',effect:'tightenR'},
  {text:'Selecciona Prueba de banco y comprueba el indicador.',tool:'test',target:'indicator',effect:'test'}]}
};
Object.assign(SR_MISSIONS128,SR_TECHNICAL129);reviseProcedures148(SR_MISSIONS128);
for(const mission of Object.values(SR_MISSIONS128)){mission.summary=mission.summary.replaceAll('del banco','del equipo instalado').replaceAll('Muestras aisladas','Ramales aislados del transformador');for(const step of mission.steps)step.text=step.text.replaceAll('multímetro de banco','multímetro').replaceAll('Prueba de banco','Prueba funcional').replaceAll('del banco','del equipo instalado').replaceAll('relé de práctica','relé montado en su zócalo DIN');}
SR_MISSIONS128.diodes.summary='Dos módulos montados en el rectificador, aislados del puente en este escenario: compara directa e inversa y verifica el componente intervenido.';
SR_MISSIONS128.ventilation.summary='Intervén el filtro en la envolvente instalada y compara el flujo inicial y final; el transformador permanece en su recinto.';
SR_MISSIONS128.insulation.targets.sample='Aislador accesible del transformador';
for(const step of SR_MISSIONS128.insulation.steps)if(step.effect==='replace'){step.text='Con el ramal aislado y descargado, limpia el aislador accesible sin desmontar el transformador.';step.tool='brush';step.repeat=3;step.effect='restoreInsulation150';}

// Observation and physical handling are separate tools, including in guided mode.
for(const mission of Object.values(SR_MISSIONS128))for(const step of mission.steps){
 if(step.tool==='inspect'&&!step.choices&&!['diagnose','inspectL','inspectR'].includes(step.effect)){
  step.tool='hand';step.text=step.text.replaceAll('Con Inspección','Con Mano con guante');
  if(!step.text.includes('Mano con guante'))step.text='Con Mano con guante: '+step.text.charAt(0).toLowerCase()+step.text.slice(1);
 }
}

export class SubstationMaintenance128{
 constructor(){this.start('ventilation');}
 start(id){if(!SR_MISSIONS128[id])throw Error('Misión desconocida');this.id=id;this.leads={red:null,black:null};this.log=[];this.replaced=false;this.commanded=false;this.mode=false;this.index=0;this.work=0;this.tool='inspect';this.effects=[];this.reading='—';this.feedback='Elige la herramienta y actúa sobre la pieza indicada.';return this;}
 get mission(){return SR_MISSIONS128[this.id];}get step(){return this.mission.steps[this.index];}get done(){return this.index>=this.mission.steps.length;}
 choose(tool){if(!SR_TOOLS128[tool])return false;this.tool=tool;return true;}
 act(target){if(this.mission.asset129&&target==='release')return this.releaseProbes();if(this.done){this.feedback='Misión completada. Puedes repetirla o elegir otra.';return{ok:false,done:true};}const s=this.step;if(this.tool!==s.tool||target!==s.target){this.feedback=this.tool!==s.tool?'Esta herramienta no corresponde a este paso. Consulta el manual.':s.choices?'Compara las lecturas registradas y vuelve a elegir el diagnóstico.':'Actúa sobre '+this.mission.targets[s.target]+'.';return{ok:false};}
  if(this.mission.asset129){if(s.effect==='reading'&&(!this.mode||this.leads.red!==s.expectedLeads.red||this.leads.black!==s.expectedLeads.black)){this.feedback='Conecta ambas puntas en los puntos indicados antes de medir.';return{ok:false};}if(s.effect==='replace'&&(this.leads.red||this.leads.black)){this.feedback='Retira primero las puntas del instrumento.';return{ok:false};}if(s.effect==='mode')this.mode=true;if(s.effect==='red')this.leads.red=target;if(s.effect==='black')this.leads.black=target;if(s.effect==='reading'){this.reading=s.reading;this.log.push({red:this.leads.red,black:this.leads.black,value:s.reading});}if(s.effect==='replace'||s.effect==='restoreInsulation150')this.replaced=true;if(s.effect==='command'){this.commanded=true;this.reading=s.reading;}if(s.effect==='technicalDone'){this.commanded=false;this.reading=s.reading;}}this.work++;if(this.work<(s.repeat||1)){this.feedback=`Pasada ${this.work} de ${s.repeat}. Continúa sobre la misma pieza.`;return{ok:true,effect:s.effect,partial:this.work/(s.repeat||1),complete:false};}
  this.effects.push(s.effect);if(s.effect==='airBefore')this.reading='0.6 m/s · flujo reducido';if(s.effect==='airAfter')this.reading='2.4 m/s · flujo recuperado';if(s.effect==='source')this.reading='24.0 V CD';if(s.effect==='load')this.reading='0.0 V CD';if(s.effect==='verify')this.reading='24.0 V CD';if(s.effect==='test')this.reading=this.id==='control'?'24.0 V CD · lámpara encendida':this.id==='battery'?'Continuidad: correcta':'Ventilación: recuperada';this.index++;this.work=0;this.feedback=this.done?'Misión completada: la comprobación del equipo instalado es correcta.':'Acción realizada. '+this.step.text;return{ok:true,effect:s.effect,partial:1,complete:true,done:this.done};
 }
 releaseProbes(){if(!this.leads.red&&!this.leads.black){this.feedback='Las puntas ya están retiradas.';return{ok:false};}this.leads={red:null,black:null};this.work=0;if(this.step?.target==='release'){this.effects.push('release');this.index++;this.feedback='Puntas retiradas. '+(this.step?.text||'Prueba completada.');return{ok:true,effect:'release',complete:true};}const checkpoint=this.step?.checkpoint;if(Number.isInteger(checkpoint))this.index=checkpoint;this.reading='—';this.feedback='Puntas retiradas. Vuelve a conectarlas para repetir esta medición.';return{ok:true,effect:'release',complete:false};}
}

augmentMaintenance148(SubstationMaintenance128);
