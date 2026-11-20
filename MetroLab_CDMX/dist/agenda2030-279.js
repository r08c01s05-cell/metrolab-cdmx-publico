// Agenda 2030 en el simulador 279. Relaciona lo que muestra el centro de control con los Objetivos de
// Desarrollo Sostenible (ODS) de la Agenda 2030 de la ONU. La relación es un análisis del proyecto: el
// material del curso y la presentación del usuario no mencionan la Agenda 2030.
// Factor de emisión: Aviso del Factor de Emisión del Sistema Eléctrico Nacional 2024 (SEMARNAT),
// 0.444 tCO2e/MWh, vigente mientras no se publique el de 2025.

export const FESEN279=Object.freeze({value:.444,unit:'kg CO2e/kWh',year:2024,title:'Aviso del Factor de Emisión del Sistema Eléctrico Nacional 2024 (SEMARNAT)',url:'https://www.gob.mx/cms/uploads/attachment/file/981194/aviso_fesen_2024.pdf'});
export const ODS279=Object.freeze([
 {ods:7,name:'Energía asequible y no contaminante',meta:'7.3 · Mejorar la eficiencia energética',where:['Frenado regenerativo de los NM-22 contra el reostático de los NM-79 y MP-82','Energía que entregan las S.R. y la que regresa a la barra guía','Pérdidas en diodos y transformador de la S.R.'],metric:'regen'},
 {ods:9,name:'Industria, innovación e infraestructura',meta:'9.1 · Infraestructura fiable, sostenible y resiliente',where:['CBTC de la Nueva Línea 1 y gabinetes de respaldo en el P.C.C. 2','Regulación del intervalo y ATP en el centro de control','Zonas de alimentación con C.S. para que una S.R. fuera no deje sin tensión a la línea'],metric:'resilience'},
 {ods:11,name:'Ciudades y comunidades sostenibles',meta:'11.2 · Transporte público seguro, asequible, accesible y sostenible',where:['Pasajeros que mueve cada línea con la afluencia documentada','Intervalo entre trenes y tiempo de espera en andén','Freno de urgencia, hombre muerto y protección ATP'],metric:'passengers'},
 {ods:13,name:'Acción por el clima',meta:'13.2 · Incorporar medidas de mitigación',where:['Emisiones evitadas por la energía regenerada','Emisiones asociadas a la energía que se disipa en resistencias'],metric:'co2'}]);
// El historial del Metro que aportó el usuario sí trae un «2030», pero es otro: el plan del STC con
// horizonte 2030 que anunció la ampliación de la Línea 8.
export const STC2030=Object.freeze({text:'El Sistema de Transporte Colectivo presentó su plan con proyección al año 2030, donde se anunció una ampliación de la Línea 8.',source:'Presentación «Historia del Metro» que aportó el usuario'});

// Indicadores a partir de la energía acumulada por línea (kWh) y los pasajeros del escenario.
export function indicators279(energies,{boarded=0,factor=FESEN279.value}={}){const sum=k=>energies.reduce((s,e)=>s+(e?.[k]||0),0);
 const draw=sum('drawKWh'),regen=sum('regenKWh'),rheo=sum('rheoKWh'),sr=sum('srKWh'),brake=regen+rheo;
 return{drawKWh:draw,regenKWh:regen,rheoKWh:rheo,srKWh:sr,recoveredShare:draw>0?regen/draw:0,brakeReuse:brake>0?regen/brake:0,co2AvoidedKg:regen*factor,co2LostKg:rheo*factor,co2GridKg:sr*factor,passengers:boarded,kWhPerPassenger:boarded>0?sr/boarded:null,gPerPassenger:boarded>0?sr*factor*1000/boarded:null};}
