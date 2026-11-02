// Local educational model. Normative numbers are isolated from editable assumptions.
import {circuits171} from './electrical171.js?v=196';
export const scope173='Estimación para simulación educativa. No es un proyecto ejecutivo ni una declaración de cumplimiento.';
export const sources173=[
 ['Instalación y tablas','NOM-001-SEDE-2012','https://platiica.economia.gob.mx/wp-content/uploads/sites/2/PDF_Normas_Publicas/001sede2012.pdf','https://platiica.economia.gob.mx/wp-content/uploads/sites/2/PDF_Normas_Publicas/001sede2012.pdf'],
 ['Unidades vigentes','NOM-008-SE-2021; vigente desde 26 junio 2024','./normativa/criterios173.html','https://platiica.economia.gob.mx/normalizacion/nom-008-se-2021/']
];
// mm², commercial designation, Cu 60/75/90 °C, Al 60/75/90 °C.
// NOM-001-SEDE-2012 table 310-15(b)(16). Deliberately bounded catalogue, no parallel sets.
export const wires173=[
 [2.08,'14 AWG',15,20,25,0,0,0],[3.31,'12 AWG',20,25,30,0,0,0],
 [5.26,'10 AWG',30,35,40,0,0,0],[8.37,'8 AWG',40,50,55,0,0,0],
 [13.3,'6 AWG',55,65,75,40,50,55],[21.2,'4 AWG',70,85,95,55,65,75],
 [26.7,'3 AWG',85,100,115,65,75,85],[33.6,'2 AWG',95,115,130,75,90,100],
 [42.4,'1 AWG',110,130,145,85,100,115],[53.49,'1/0 AWG',125,150,170,100,120,135],
 [67.43,'2/0 AWG',145,175,195,115,135,150],[85.01,'3/0 AWG',165,200,225,130,155,175],
 [107.2,'4/0 AWG',195,230,260,150,180,205],[127,'250 kcmil',215,255,290,170,205,230],
 [152,'300 kcmil',240,285,320,195,230,260],[177,'350 kcmil',260,310,350,210,250,280],
 [203,'400 kcmil',280,335,380,225,270,305],[253,'500 kcmil',320,380,430,260,310,350],
 [304,'600 kcmil',350,420,475,285,340,385],[355,'700 kcmil',385,460,520,315,375,425],
 [380,'750 kcmil',400,475,535,320,385,435],[405,'800 kcmil',410,490,555,330,395,445],
 [456,'900 kcmil',435,520,585,355,425,480],[507,'1000 kcmil',455,545,615,375,445,500]
];
export const ocp173=[15,16,20,25,30,32,35,40,45,50,60,63,70,80,90,100,110,125,150,175,200,225,250,300,350,400,450,500,600,700,800,1000,1200,1600,2000,2500,3000,4000,5000,6000];
const egc173=[[15,2.08],[20,3.31],[60,5.26],[100,8.37],[200,13.3],[300,21.2],[400,33.6],[500,33.6],[600,42.4],[800,53.49],[1000,67.43],[1200,85.01],[1600,107.2],[2000,127],[2500,177],[3000,203],[4000,253],[5000,355],[6000,405]];
const ambient173=[[10,1.29,1.20,1.15],[15,1.22,1.15,1.12],[20,1.15,1.11,1.08],[25,1.08,1.05,1.04],[30,1,1,1],[35,.91,.94,.96],[40,.82,.88,.91],[45,.71,.82,.87],[50,.58,.75,.82],[55,.41,.67,.76],[60,0,.58,.71],[65,0,.47,.65],[70,0,.33,.58],[75,0,0,.5],[80,0,0,.41],[85,0,0,.29]];
export const insulations173={'THWN-2':{temp:90,volts:600},'XHHW-2':{temp:90,volts:600},'THW-LS':{temp:75,volts:600},'RHW-2 / 2 kV':{temp:90,volts:2000},'MV / 35 kV':{temp:90,volts:35000}};
// Chapter 10 table 4, EMT. Metric designation, internal diameter mm, full area mm².
export const conduits173=[[16,15.8,196],[21,20.9,343],[27,26.6,556],[35,35.1,968],[41,40.9,1314],[53,52.5,2165],[63,69.4,3783],[78,85.2,5701],[91,97.4,7451],[103,110.1,9521]];
export const defaults173={
 C01:[30,23000,3,50,0],C02:[30,23000,3,12,0],C03:[200,580,3,8,100],
 C04:[250,750,0,30,100],C05:[250,750,0,30,100],C06:[30,480,3,20,100],
 C07:[60,220,3,15,100],C08:[5,220,3,20,100],C09:[8,127,1,25,100],
 C10:[16,127,1,25,0],C11:[10,220,1,12,100],C12:[20,110,0,10,100],C13:[2,24,0,30,100]
};
export function initial173(){return Object.fromEntries(circuits171.map(c=>{const a=defaults173[c.id]||[0,0,0,0,0];return[c.id,{
 nominal:a[0],voltage:a[1],phases:a[2],length:a[3],continuous:a[4],material:'Cu',
 insulation:c.criterion==='MT'?'MV / 35 kV':a[1]>600?'RHW-2 / 2 kV':'THWN-2',
 ambient:30,group:3,terminal:'auto',neutral:c.id==='C07'?1:0,neutralCounts:1,
 raceway:'EMT',ductID:26.6,ductArea:556,odExtra:2.5,peODExtra:2.5,trayCableOD:20,trayOtherArea:0,
 pf:c.id==='C08'?.85:.95,hz:a[2]?60:0,x:.08,conductorTemp:75,upstreamDrop:0,dropLimit:3,
 motorFLC:5,motorPlate:5,serviceFactor:1,transformerCurrent:30,
 manualSection:c.id==='C13'?2.08:c.id==='C05'?253:53.49,manualAmpacity:c.id==='C13'?15:c.id==='C05'?400:150,manualFactor:1,manualOCP:c.id==='C13'?3:c.id==='C05'?350:40,
 edited:{},notes:'Escenario propuesto, sin placa ni levantamiento de instalación. Un solo juego de conductores; no calcula paralelos.'
 }];}));}
export const fmt173=(v,n=2)=>Number.isFinite(v)?Number(v.toFixed(n)).toString().replace(/^(-?\d+)(\.\d+)?$/,(_,a,b)=>a.replace(/\B(?=(\d{3})+(?!\d))/g,' ')+(b||'')):'Pendiente';
export function factorAmbient173(t,rating){const row=ambient173.find(r=>t<=r[0]);return row?.[{60:1,75:2,90:3}[rating]]||0;}
export function factorGroup173(n){return n<=3?1:n<=6?.8:n<=9?.7:n<=20?.5:n<=30?.45:n<=40?.4:.35;}
const ceilWire=area=>wires173.find(w=>w[0]+1e-6>=area);
const sectionName=w=>w?`${fmt173(w[0])} mm² (${w[1]})`:'Fuera del catálogo';
function od173(w,extra){return Math.sqrt(4*w[0]/Math.PI)*1.12+extra;}
// Engineering estimate, NOT Chapter 10 table 8 or 9 data. Editable temperature and X.
// Resistivity at 20 °C in ohm·mm²/m, linear temperature coefficient per °C.
export function drop173(s,area,returnOnly=false){const [rho,alpha]=s.material==='Al'?[.028264,.00403]:[.017241,.00393],r=rho*(1+alpha*(s.conductorTemp-20))/area;
 const k=returnOnly?1:s.phases===3?Math.sqrt(3):2,cos=s.phases===0?1:s.pf,sin=Math.sqrt(Math.max(0,1-cos*cos));
 return k*s.length*s.nominal*(r*cos+(s.phases===0?0:s.x/1000*sin));}
export function calculate173(c,s){
 const pending=['Placas y corrientes medidas; régimen real de carga y simultaneidad.','Corriente de cortocircuito, capacidad interruptiva y coordinación/selectividad.','Identificación y tensión de aislamiento; terminales Cu/Al, par de apriete y certificación del cable.','Longitud levantada, impedancia CA de fabricante, armónicos, ambiente, agrupamiento y ocupación compartida.','Diámetro exterior real de cables y accesorios; puesta a tierra y condiciones del sitio.'];
 const result={id:c.id,origin:c.origin,destination:c.destination,input:{...s},scope:c.scope,warnings:[],pending,refs:['110-14(c)','210-19(a)(1) / 215-2(a)(1)','210-20(a) / 215-3','240-4(d), 240-6(a)','310-15(b)(16), (b)(2)(a), (b)(3)(a), (b)(5),(6)','250-122, tabla y (b)','300-17; capítulo 10, tablas 1 y 4'],status:'Propuesta educativa',rows:[]};
 const warn=m=>result.warnings.push(m),num=x=>Number.isFinite(x);
 if(c.id==='PE01'){result.status='Derivado de las cédulas de equipos';result.pending=['El conductor al electrodo requiere datos propios de 250-66 y del sistema de electrodos. No se une al retorno de tracción.'];result.rows=[['Función','PE de envolventes: consultar cada circuito; no es el conductor del electrodo.']];return result;}
 const numericKeys=['nominal','voltage','phases','hz','length','ambient','group','pf','continuous','odExtra','peODExtra','x','conductorTemp','upstreamDrop','dropLimit','neutral','neutralCounts','ductID','ductArea','trayCableOD','trayOtherArea','motorFLC','motorPlate','serviceFactor','transformerCurrent','manualSection','manualAmpacity','manualFactor','manualOCP'];
 if(!numericKeys.every(k=>num(s[k]))||!['Cu','Al'].includes(s.material)||!['auto','60','75'].includes(String(s.terminal))||!['EMT','Tubería manual','Charola'].includes(s.raceway)||s.nominal<=0||s.voltage<=0||s.length<0||![0,1,3].includes(s.phases)||s.pf<=0||s.pf>1||s.continuous<0||s.continuous>100||!Number.isInteger(s.group)||s.group<1||s.odExtra<0||s.peODExtra<0||s.dropLimit<=0||s.x<0||s.upstreamDrop<0||![0,1].includes(s.neutral)||![0,1].includes(s.neutralCounts)){result.status='Entrada inválida';warn('Corrige las entradas numéricas y opciones: corriente/tensión positivas, longitud no negativa, factor de potencia (0,1], agrupamiento entero y porcentaje continuo [0,100].');return result;}
 const special=c.criterion==='MT'||s.voltage>2000||['C05','C13'].includes(c.id)||c.criterion==='PE';
 const motor=c.id==='C08',trafo=c.id==='C06',load=s.nominal*(1+.25*s.continuous/100),design=motor?1.25*s.motorFLC:load;
 if(motor&&(!num(s.motorFLC)||s.motorFLC<=0||!num(s.motorPlate)||s.motorPlate<=0)){result.status='Entrada inválida';warn('Introduce corriente de plena carga y de placa del motor positivas.');return result;}
 result.design=design;result.power=(s.phases===3?Math.sqrt(3):1)*s.voltage*s.nominal*(s.phases===0?1:s.pf);result.apparent=(s.phases===3?Math.sqrt(3):1)*s.voltage*s.nominal;
 const insulation=insulations173[s.insulation];if(!insulation){result.status='Entrada inválida';warn('Aislamiento desconocido.');return result;}
 const minCount=s.phases===3?3:2,neutral=s.phases===3?Number(s.neutral):0,ccc=minCount+neutral*Number(s.neutralCounts),group=Math.max(s.group,ccc);
 const terminal=s.terminal==='auto'?((special?s.manualOCP:ocp173.find(a=>a>=design))>100?75:60):Number(s.terminal);
 const kt=factorAmbient173(s.ambient,insulation.temp),kg=factorGroup173(group),col=insulation.temp===75?3:4,termCol=terminal===60?2:3,al=s.material==='Al'?3:0;
 result.kt=kt;result.kg=kg;result.terminal=terminal;result.ccc=group;result.neutral=neutral;
 if(group!==s.group)warn(`Agrupamiento elevado automáticamente a ${group} conductores portadores; PE no cuenta. Neutro no lineal cuenta por defecto.`);
 if(terminal>insulation.temp)warn('Temperatura de terminal superior a la del aislamiento; se utiliza la menor columna.');
 if(insulation.volts<s.voltage)warn(`Aislamiento seleccionado de ${insulation.volts} V inferior a la tensión del circuito; propuesta NO utilizable.`);
 if(s.ambient>85||s.ambient<-20)warn('Temperatura fuera del rango educativo soportado (-20 a 85 °C).');
 let ocp=ocp173.find(a=>a+1e-8>=design),overload=null;
 if(motor){result.refs.push('430-6(a)(1), 430-22(a), 430-32(a)(1), tabla 430-52; 430-52(c)(1) excepción 1');ocp=ocp173.find(a=>a>=2.5*s.motorFLC-1e-8);overload=s.motorPlate*(s.serviceFactor>=1.15?1.25:1.15);warn('Motor equivalente único, CA de inducción, servicio continuo: FLC supuesta debe cotejarse con 430-6 y tablas aplicables; varios motores requieren 430-24. Interruptor de tiempo inverso: 250 % de FLC y tamaño normalizado superior por excepción 1 de 430-52(c)(1); arranque y coordinación pendientes. Sobrecarga separada calculada con corriente de placa; aumento de temperatura de placa pendiente.');if(s.phases===0)warn('Hipótesis de motor CA inválida al seleccionar CD; no utilizar esta propuesta.');}
 if(trafo){result.refs.push('450-3(b), protección primaria solamente; 240-21(c) para secundario');const m=s.transformerCurrent>=9?1.25:s.transformerCurrent>=2?1.67:3,limit=s.transformerCurrent*m;ocp=m===1.25?ocp173.find(a=>a>=limit):[...ocp173].reverse().find(a=>a<=limit);warn('TA-1 supuesto <=600 V, protección del primario solamente. La corriente nominal del transformador se introduce aparte de la carga. El secundario y sus conductores requieren protección independiente/verificación 240-21(c); no se consideran protegidos por la relación de transformación.');if(s.voltage>600||s.transformerCurrent<=0||s.nominal>s.transformerCurrent){warn('Hipótesis de TA-1 inválida: revisar tensión <=600 V y corriente de placa suficiente.');result.status='Hipótesis de transformador inválida';}}
 let base,selected,ampBase,corrected;
 const capacity=w=>Math.min(w[col+al]*kt*kg,w[Math.min(termCol,col)+al]);
 const smallLimit=w=>s.material==='Cu'?(w[0]<=2.08?15:w[0]<=3.31?20:w[0]<=5.26?30:Infinity):Infinity;
 const eligible=w=>w[col+al]>0&&capacity(w)>=design&&w[Math.min(termCol,col)+al]>=design&&(motor||capacity(w)>=ocp)&&(motor||smallLimit(w)>=ocp);
 if(special){
  selected=ceilWire(s.manualSection);base=selected;ocp=s.manualOCP;ampBase=s.manualAmpacity;corrected=s.manualAmpacity*s.manualFactor;
  result.status='Hipótesis manual: selección por verificar';result.refs=c.criterion==='MT'?['1.2.2(c); 310-60; 328-80; 450-3(a) si aplica']:c.id==='C13'?['Artículo 760: clasificar PLFA/NPLFA antes de dimensionar']:['Retorno de tracción: impedancia de rieles y enlaces del proyecto'];
  warn(c.criterion==='MT'||s.voltage>2000?'MT: NO se utiliza la tabla 310-15(b)(16). Sección, ampacidad, factor global y protección son entradas manuales supuestas; faltan cable, pantalla, ductos/suelo, tensiones y estudio 310-60.':c.id==='C13'?'Incendio: simulación resistiva manual; clasificación PLFA/NPLFA, cable listado, supervisión y artículos 760 pendientes. No se propone un circuito de incendio conforme.':'Retorno por rieles: sección introducida como equivalente resistivo de cobre/aluminio, NO calibre físico de riel. Faltan resistividad del acero, uniones y tierras de tracción.');
  if(!selected||!num(corrected)||corrected<=0||!num(ocp)||ocp<=0){result.status='Entrada manual inválida';warn('Sección, ampacidad, factor y protección manual deben ser positivos y estar dentro del catálogo.');selected=null;}
  else if(corrected<design||ocp>corrected)warn('Ampacidad manual insuficiente para carga/protección: NO utilizable.');
 }else{
  if(!ocp){warn('No hay protección en el catálogo aplicable; ajustar hipótesis o ampliar catálogo verificado.');}
  base=ocp?wires173.find(eligible):null;
  selected=base&&wires173.find(w=>w[0]>=base[0]&&eligible(w)&&100*drop173(s,w[0])/s.voltage<=s.dropLimit);
  if(!selected&&base){selected=base;warn('La caída no se resuelve dentro del catálogo. No se inventan juegos en paralelo.');}
  if(selected){ampBase=selected[col+al];corrected=capacity(selected);}
 }
 if(!selected){result.status='Sin selección';warn('Ninguna sección del catálogo satisface las condiciones introducidas. No es un resultado válido.');}
 result.ocp=ocp;result.overload=overload;result.section=selected?.[0];result.designation=selected?.[1];result.baseSection=base?.[0];result.ampBase=ampBase;result.corrected=corrected;
 if(selected){
  result.drop=drop173(s,selected[0],c.id==='C05');result.dropPct=100*result.drop/s.voltage;
  if(result.dropPct>s.dropLimit)warn(`Caída ${fmt173(result.dropPct)} % excede el objetivo editable de ${s.dropLimit} %.`);
  if(result.dropPct+s.upstreamDrop>5)warn('Caída acumulada estimada >5 %; no cumple la recomendación adoptada para alimentador + derivado.');
  let pe=egc173.find(([a])=>a>=ocp)?.[1];if(pe&&base)pe*=selected[0]/base[0];result.pe=pe&&c.id!=='C05'?ceilWire(Math.min(pe,selected[0])):null;
  if(special){warn('PE y canalización son analogías educativas; no validan equipos MT, retorno ni circuito de incendio.');}
  if(s.material==='Al')warn('PE se propone siempre de cobre aislado. Compatibilidad y restricciones de terminales de aluminio deben verificarse.');
  const phaseCount=s.phases===3?3:s.phases===1?neutral?1:2:2;
  // Single-phase defaults are two current-carrying conductors; identify grounded neutral explicitly.
  const n=s.phases===1?1:neutral;
  result.phaseCount=s.phases===1?1:phaseCount;result.neutral=s.phases===1?1:neutral;
  result.count=c.id==='C05'?1:s.phases===3?3+neutral:2;
  const od=od173(selected,s.odExtra),peOD=result.pe?od173(result.pe,s.peODExtra):0,area=result.count*Math.PI*od*od/4+(peOD?Math.PI*peOD*peOD/4:0),total=result.count+(peOD?1:0),fillLimit=total===1?.53:total===2?.31:.4;
  result.od=od;result.cableArea=area;result.fillLimit=fillLimit;
  if(s.raceway==='Charola'){
   // Bounded case: listed multiconductor power cable, all conductors <4/0,
   // ladder/mesh/ventilated bottom. Do not apply this rule to loose single wires.
   const trayTable=[[50,1500],[100,3000],[150,4500],[200,6000],[225,6800],[300,9000],[400,12000],[450,13500],[500,15000],[600,18000],[750,22500],[900,27000]];
   const trayArea=Math.PI*s.trayCableOD**2/4+s.trayOtherArea,tray=trayTable.find(([w,a])=>a>=trayArea),bounded=!special&&selected[0]<107&&s.voltage<=2000&&num(s.trayCableOD)&&s.trayCableOD>0&&num(s.trayOtherArea)&&s.trayOtherArea>=0;
   result.racewaySize=bounded?tray?.[0]:null;result.fill=bounded&&tray?100*trayArea/tray[1]:null;result.cableArea=trayArea;
   result.racewayText=bounded&&tray?`Charola ventilada ${tray[0]} mm · cable multiconductor listado por verificar · diámetro exterior supuesto ${s.trayCableOD} mm · área total ${fmt173(trayArea)} / ${tray[1]} mm² (${fmt173(result.fill)} % del área permisible tabulada)`:'Charola: caso fuera del cálculo automático; verificar cable/tamaño/tensión y dimensiones.';
   warn('Charola: sólo cable multiconductor listado de fuerza con conductores <107 mm², sin cables grandes mezclados; escalera/malla/fondo ventilado. Tabla 392-22(a), columna 1, 392-22(a)(1)(b). No se aplica 40 % de tubería. Ampacidad de multiconductor según 392-80(a)(1) y tabla 310-15(b)(16), corrección de ambiente y portadores; separación y agrupamiento reales por verificar. No autoriza instalar hilos sueltos pequeños en charola.');
   if(!bounded||!tray)warn('Charola fuera de alcance: no hay dimensionamiento utilizable. Casos unipolares, MT o sección >=4/0 requieren otras reglas de 392-22/392-80.');
   else if(Math.PI*s.trayCableOD**2/4<area)warn('Diámetro de cable multiconductor supuesto demasiado pequeño para alojar los conductores: verificar fabricante.');
   result.refs.push('392-10, tabla 392-22(a) columna 1, 392-22(a)(1)(b), 392-80(a)(1)');
  }else{
   let duct=s.raceway==='EMT'?conduits173.find(d=>area<=d[2]*fillLimit&&!(total===3&&d[1]/od>=2.8&&d[1]/od<=3.2)):[null,s.ductID,s.ductArea];
   if(!duct||!num(duct[1])||!num(duct[2])||duct[1]<=0||duct[2]<=0){warn('Canalización fuera del catálogo o dimensiones inválidas.');duct=null;}
   result.fill=duct?100*area/duct[2]:null;result.racewaySize=duct?.[0]||duct?.[1];
   result.racewayText=duct?`${s.raceway} · ${duct[0]?'designación '+duct[0]+' · ':''}diámetro interior ${fmt173(duct[1])} mm · área ${fmt173(duct[2])} mm² · ocupación ${fmt173(result.fill)} % / ${fillLimit*100} %`:'Sin tubería suficiente en catálogo';
   if(duct&&result.fill>fillLimit*100)warn('Tubería manual insuficiente: ocupación excedida.');
   if(s.raceway!=='EMT')warn('Tubería manual: diámetro y área interiores son supuestos editables; cotejar tabla 4/ficha del producto.');
  }
  warn('Diámetros exteriores aproximados: d = 1.12 × sqrt(4S/pi) + espesor adicional editable. No son valores tabulados; verificar tabla 5 o fabricante, incluyendo PE, antes de usar la ocupación.');
 }
 if(['C03','C04'].includes(c.id))warn('Tracción/rectificador: estimación térmica de un ramal equivalente. Reparto entre puentes, rizado, armónicos, ciclo de tracción y protección CA/CD específicos pendientes; 1.2.2(c) puede excluir su aplicación normativa.');
 if(c.id==='C05'){result.phaseCount=1;result.racewayText='No aplica: retorno por rieles/enlaces, sección resistiva equivalente; no es cable en tubería.';result.racewaySize=null;result.fill=null;}
 if(c.id==='C05')warn('Retorno: deltaV = L I R de un solo trayecto equivalente (rieles/enlaces), sin duplicar ida/vuelta. No hay PE conectado al riel. OCP manual sólo referencia la protección asociada al polo positivo: no se propone seccionar el retorno. Potencia V×I es transportada de referencia, no consumo propio.');
 if(c.id==='C12')warn('Control CD: 110 V supuesto, clasificación 725, características del cargador/batería y fusibles CD pendientes.');
 if(s.voltage<50&&!special)warn('Menos de 50 V: comprobar alcance y mínimos 720-4 o excepción/clasificación 725/760.');
 result.formulas=[`I diseño = ${motor?'1.25 × FLC (430-22)':`I nominal × (1 + 0.25 × fracción continua)`} = ${fmt173(design)} A.`,special?'Ampacidad manual × factor global; NO es cálculo de ampacidad MT.':`I corregida = min(I tabla ${insulation.temp} °C × ${kt} × ${kg}, I terminal ${terminal} °C). Antes del ajuste también se exige columna de terminal >= I diseño.`,`${c.id==='C05'?'1':s.phases===3?'sqrt(3)':'2'} × L × I nominal × ${s.phases===0?'R':'(R cos(phi) + X sin(phi))'}; R = rho20 × [1 + alpha × (T - 20)] / S. L es longitud de ida en m; X = ${s.x} ohm/km.`,`rho20 = ${s.material==='Cu'?.017241:.028264} ohm·mm²/m; alpha = ${s.material==='Cu'?.00393:.00403} /°C. Estimación resistiva, no tabla de impedancia medida; efectos pelicular/proximidad no resueltos.`,`Caída % = 100 × deltaV / V. Objetivo editable ${s.dropLimit} %, acumulada con aguas arriba ${s.upstreamDrop} %: recomendación 3 % por tramo y 5 % conjunto, notas 210-19(a)(1) y 215-2(a)(3), no límite universal obligatorio.`,`PE Cu: tabla 250-122 con OCP; aumentar por S final / S mínima por ampacidad para sobredimensionamiento, redondear hacia arriba sin superar fase (250-122(a),(b)).`,`Tubería: suma(pi × d exterior² / 4), incluido PE; ocupación <=53/31/40 % para 1/2/>2 conductores. Tabla 1, notas; EMT tabla 4. No se usa excepción de niples.`];
 const u=(v,unit)=>`${fmt173(v)} ${unit}`;
 result.rows=[['Estado',result.status],['Origen',c.origin],['Destino',c.destination],[c.id==='C05'?'Potencia transportada de referencia, no consumo propio':'Potencia eléctrica activa estimada',u(result.power,'W')],['Potencia aparente CA / V × I CD',u(result.apparent,'V·A')],['Tensión',u(s.voltage,'V')],['Fases / frecuencia',s.phases?`${s.phases} · ${s.hz} Hz`:'CD · frecuencia no aplica'],['Corriente nominal / diseño',`${u(s.nominal,'A')} / ${u(design,'A')}`],['Conductores de fase / polos',selected?`${c.id==='C05'?'1 retorno equivalente':s.phases===0?'2 polos':result.phaseCount+' fase(s)'} × ${sectionName(selected)} · ${s.material}`:'Pendiente'],['Neutro',s.phases?`${result.neutral} × ${selected?sectionName(selected):'pendiente'} · ${s.material}; sin reducción`:'No aplica'],['PE de equipo',result.pe?`1 × ${sectionName(result.pe)} · Cu (aislado)`:c.id==='C05'?'No aplica al riel; PE de envolventes independiente':'Pendiente'],['Aislamiento / terminal',`${s.insulation} · ${insulation.temp} °C; terminal ${terminal} °C`],['Ampacidad tabulada / corregida',`${u(ampBase,'A')} / ${u(corrected,'A')}${special?' · manual':' · tabla 310-15(b)(16)'}`],['Factores temperatura / agrupamiento',special?`Global manual ${s.manualFactor}`:`${kt} / ${kg}; ${group} portadores totales`],['Protección propuesta',ocp?`${u(ocp,'A')} · ${s.phases===0?'aptitud CD y polos pendientes':s.phases+' polo(s)'} · capacidad interruptiva PENDIENTE`:'Pendiente'],['Sobrecarga separada del motor',overload?`${u(overload,'A')} · ajuste máximo preliminar 430-32`:'No aplica / verificar equipo'],['Longitud de ida',u(s.length,'m')],['Caída de tensión',`${u(result.drop,'V')} · ${u(result.dropPct,'%')}; acumulada ${u((result.dropPct??NaN)+s.upstreamDrop,'%')}`],['Canalización',result.racewayText||'Pendiente'],['Diámetro exterior fase/polo estimado',u(result.od,'mm')],['Área de ocupación de cables',u(result.cableArea,'mm²')],['Referencias',result.refs.join('; ')]];
 return result;
}
export function all173(state){return circuits171.map(c=>calculate173(c,state[c.id]));}
export function csv173(results){const keys=['id','origin','destination','status','power','apparent','design','section','designation','phaseCount','neutral','count','ampBase','corrected','ocp','overload','drop','dropPct','racewayText'],inputKeys=['nominal','voltage','phases','hz','length','material','insulation','ambient','group','terminal','continuous','neutral','neutralCounts','odExtra','peODExtra','pf','conductorTemp','x','upstreamDrop','dropLimit','raceway','ductID','ductArea','trayCableOD','trayOtherArea','manualSection','manualAmpacity','manualFactor','manualOCP','motorFLC','motorPlate','serviceFactor','transformerCurrent','notes'];const cols=[...keys,...inputKeys.map(k=>'entrada_'+k),'PE_Cu_mm2','supuestos_y_procedencia','advertencias','pendientes','referencias','formulas'];const q=s=>'"'+(typeof s==='string'&&/^[=+@-]/.test(s)?"'":'')+String(s??'Pendiente').replaceAll('"','""')+'"';return '\uFEFF'+[cols.map(k=>q(({power:'Potencia_activa_W',apparent:'Potencia_aparente_VA',design:'Corriente_diseno_A',section:'Seccion_fase_mm2',phaseCount:'Cantidad_fases_polos',neutral:'Cantidad_neutros',count:'Total_portadores_fisicos',ampBase:'Ampacidad_tabulada_A',corrected:'Ampacidad_corregida_A',ocp:'Proteccion_A',overload:'Sobrecarga_motor_A',drop:'Caida_V',dropPct:'Caida_porcentaje'})[k]||k)).join(','),...results.map(r=>[...keys.map(k=>r[k]),...inputKeys.map(k=>r.input[k]),r.pe?.[0],JSON.stringify(r.input.edited)+'; No hay placas verificadas. Entradas iniciales supuestas salvo referencias de tensión.',r.warnings.join(' | '),r.pending.join(' | '),r.refs.join('; '),r.formulas?.join(' | ')].map(q).join(','))].join('\r\n');}
