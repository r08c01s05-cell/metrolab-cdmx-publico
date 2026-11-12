// Subestación de rectificación real 261. Datos tomados del material del curso de Tracción Eléctrica
// que aportó el usuario (presentaciones «METRO 7EM1» y «METRO II 7EM4», que a su vez reproducen el
// documento «Puesto de rectificación Línea 1» del IPN). Describen las S.R. de las líneas 1, 2 y 3
// alimentadas en 15 kV. Sirven para tres cosas: decir qué equipos tiene de verdad una S.R., ubicar
// las S.R. de la Línea 1 por zona, y señalar qué piezas de la maqueta 3D no aparecen en esa
// documentación. Lo que el material no dice se marca como supuesto y no se inventa.
export const SOURCE261=Object.freeze({title:'Material del curso de Tracción Eléctrica: METRO 7EM1 y METRO II 7EM4',detail:'Presentaciones aportadas por el usuario; citan el documento «Puesto de rectificación Línea 1» (IPN), tablas 3.1 y 3.2 y figuras 3.1 a 3.16.'});

// Groups of a 2,500 kW rectifier substation fed at 15 kV, in the order the energy crosses them.
export const SR_GROUPS261=Object.freeze([
 {id:'intersec',name:'Grupo seccionador (Intersec)',data:'Mufa terminal del cable de 15 kV · seccionador tripolar · transformador auxiliar 15 kV / 220 V CA',text:'Aquí llega el cable de 15 kV desde el P.C.C. El seccionador tripolar aísla la S.R. de su cable y el transformador auxiliar alimenta los circuitos auxiliares. En la S.R. no hay interruptor de 15 kV: el interruptor (Seco Gear) está en la sala de interruptores del P.C.C. y se manda desde el Puesto de Despacho de Carga.'},
 {id:'transformer',name:'Grupo transformador principal',data:'2,750 kVA · 15 kV / 571 V CA · primario en delta, secundarios en delta y en estrella · aislamiento de silicón · aire natural',text:'Baja la tensión de 15 kV a 571 V CA y la entrega por dos secundarios, uno en delta y otro en estrella. A su salida tiene un seccionador hexapolar que lo aísla del bloque rectificador.'},
 {id:'rectifier',name:'Grupo rectificador',data:'Rectificador dodecafásico · 168 diodos de silicio en dos puentes de Graetz · bobina de equilibrio seca clase B · salida 750 V CD',text:'Convierte la CA en corriente continua de 750 V. La bobina de equilibrio, conectada a la salida, reparte y filtra la corriente entre los dos puentes.'},
 {id:'dur',name:'Disyuntor ultrarrápido (D.U.R.)',data:'5,000 A · tensión máxima 1,800 V CD',text:'Protege al grupo rectificador de sobrecargas y cortocircuitos en la línea y alimenta las barras guía a través del seccionador de 5,000 A. Sus dispositivos enlazan entre sí las S.R. de una misma zona.'},
 {id:'sec5000',name:'Grupo seccionador de 5,000 A',data:'Cuchillas hacia la barra guía (+) y hacia los rieles (−)',text:'Aísla la S.R. de la vía. En una S.R. de alimentación en «T» son la conexión directa a las barras guía y a los rieles negativos.'},
 {id:'control',name:'Gabinete de control',data:'Relevadores de control y auxiliares · telemando por hilo piloto',text:'Protege y controla el bloque de rectificación. El cable de 15 kV lleva un hilo piloto para la señalización y el telemando de la S.R. desde el tablero del P.D.C. El equipo de control es fijo y se une a los bloques móviles con conectores (fichas «Keops»).'},
 {id:'fan',name:'Grupo ventilador',data:'Motor de dos velocidades',text:'Envía aire por una cámara para enfriar el transformador principal y el bloque rectificador. La velocidad depende de la temperatura de uno u otro.'},
 {id:'cs',name:'Contactor de seccionamiento (C.S.)',data:'Solo en las S.R. que están en la frontera entre dos zonas',text:'Une eléctricamente dos zonas vecinas. Sus contactos trabajan en una cámara apagachispas y puede abrir con carga, aunque se desgasta. Junto a él, el seccionador del tramo de protección (C.T.P.) evita que un tren energice con su paso una zona que está sin tensión.'}
]);
export const SR_RATINGS261=Object.freeze({kw:[2500,4000,5000],note:'Líneas 1, 2 y 3: S.R. de 2,500 y 4,000 kW en 15 kV. En Línea 1 algunas de 2,500 kW tienen otra de 2,500 kW (marca B.G.I.) en paralelo sobre el mismo cable, para 5,000 kW. Las líneas 4 a 7 y las ampliaciones se alimentan en 23 kV con S.R. de 4,000 kW.'});

// How the 3D teaching model compares with those groups. `real` false: not described for an S.R.
export const MODEL_CHECK261=Object.freeze([
 {part:'mt',real:'intersec',verdict:'Corresponde al grupo seccionador (Intersec). En la maqueta aparece como tres celdas con interruptor, transformadores de medida y relés; la S.R. real solo tiene la mufa, el seccionador tripolar y el transformador auxiliar. El interruptor de 15 kV está en el P.C.C.'},
 {part:'transformer',real:'transformer',verdict:'Existe. La maqueta lo dibuja como transformador seco con sondas PT100; el documentado es de 2,750 kVA, 15 kV / 571 V, con aislamiento de silicón y un seccionador hexapolar a la salida.'},
 {part:'rectifier',real:'rectifier',verdict:'Existe. La maqueta dibuja 12 diodos, uno por rama; el rectificador real de 2,500 kW tiene 168 diodos de silicio repartidos en los dos puentes. La bobina de equilibrio sí está.'},
 {part:'dc',real:'dur',verdict:'Corresponde al D.U.R. y a los seccionadores de 5,000 A. La maqueta muestra varias celdas con interruptores por alimentador; lo documentado es un D.U.R. por grupo rectificador y las cuchillas hacia barra guía y rieles, más el C.S. en las S.R. de frontera.'},
 {part:'control',real:'control',verdict:'Existe como gabinete de relevadores. El PLC / RTU de la maqueta es una actualización supuesta; el material describe relevadores y telemando por hilo piloto.'},
 {part:'aux',real:'intersec',verdict:'El transformador auxiliar (15 kV / 220 V CA) existe y va dentro del grupo seccionador.'},
 {part:'roof',real:'fan',verdict:'La ventilación existe como grupo ventilador de dos velocidades para el transformador y el rectificador.'},
 {part:'battery',real:null,verdict:'El material no describe un banco de baterías dentro de la S.R. Las baterías que sí menciona están en la «Cabina J» de las subestaciones de alumbrado y fuerza de cada estación (120 V, 90 Ah, unas 3 horas).'},
 {part:'fire',real:null,verdict:'El material no describe detección ni extinción dentro de la S.R. Es un agregado de la maqueta.'},
 {part:'cables',real:null,verdict:'Canalizaciones ilustrativas; el material solo menciona el cable de 15 kV con hilo piloto y los cables de salida hacia la vía.'},
 {part:'earth',real:null,verdict:'El material no detalla la red de tierras de la S.R.; menciona las protecciones de «cable a tierra» y el relé de tierra.'},
 {part:'civil',real:null,verdict:'Local ilustrativo. No corresponde a una S.R. concreta.'}
]);

// Line 1 (Pantitlán–Observatorio): rectifier substations by zone, east to west (table 3.1), and the
// ones that hold the sectioning contactor between zones (table 3.2). `station` is the Line 1 station
// the name refers to; `between` marks a site that is not a station, placed midway as an assumption.
export const L1_ZONES261=Object.freeze([
 {zone:'A',sr:[{name:'Subestación de pruebas',between:null,station:'Pantitlán',approx:'El material no dice su sitio exacto; se dibuja junto a Pantitlán.'},{name:'Pantitlán',station:'Pantitlán'}]},
 {zone:'B',sr:[{name:'Pablo Fierro',between:['Pantitlán','Zaragoza'],cs:'A-B',approx:'No es una estación; se dibuja a la mitad del tramo Pantitlán–Zaragoza.'},{name:'Zaragoza',station:'Zaragoza'},{name:'Aeropuerto',station:'Boulevard Puerto Aéreo'}]},
 {zone:'C',sr:[{name:'Balbuena',station:'Balbuena',cs:'B-C'},{name:'San Lázaro',station:'San Lázaro'}]},
 {zone:'D',sr:[{name:'Candelaria',station:'Candelaria',cs:'C-D'},{name:'Pino Suárez 1',station:'Pino Suárez'}]},
 {zone:'E',sr:[{name:'Salto del Agua',station:'Salto del Agua',cs:'D-E'},{name:'Cuauhtémoc',station:'Cuauhtémoc'},{name:'Insurgentes',station:'Insurgentes'},{name:'Chapultepec',station:'Chapultepec'}]},
 {zone:'F',sr:[{name:'Constituyentes',between:['Chapultepec','Juanacatlán'],cs:'E-F',approx:'No es una estación de la Línea 1; se dibuja a la mitad del tramo Chapultepec–Juanacatlán.'},{name:'Juan Acatlán',station:'Juanacatlán'},{name:'Tacubaya',station:'Tacubaya'},{name:'Observatorio',station:'Observatorio'}]}
]);
export const L1_SR261=Object.freeze(L1_ZONES261.flatMap(z=>z.sr.map(s=>Object.freeze({...s,zone:z.zone}))));
export const L1_CS261=Object.freeze(L1_SR261.filter(s=>s.cs).map(s=>Object.freeze({between:s.cs,at:s.name})));

const plain=s=>String(s||'').normalize('NFD').replace(/[̀-ͯ]/g,'').toLowerCase().replace(/\bblvd\.?|\bboulevard\b/g,'boulevard').replace(/[^a-z0-9]+/g,' ').trim();
// Position (m along the line) of every Line 1 S.R. for a line object {stations:[{nombre}],distances:[]}.
export function srPositions261(line){
 if(!line?.stations?.length||line.stations[0]?.linea!==1&&line.id!==1&&line.linea!==1)return[];
 const at=name=>{const key=plain(name),i=line.stations.findIndex(s=>{const n=plain(s.nombre||s.name);return n===key||n.includes(key)||key.includes(n);});return i<0?null:line.distances[i];};
 const out=[];
 for(const s of L1_SR261){let x=null;if(s.between){const a=at(s.between[0]),b=at(s.between[1]);if(a!=null&&b!=null)x=(a+b)/2;}else x=at(s.station);
  if(x!=null)out.push({...s,x,approximate:!!s.approx});}
 return out.sort((a,b)=>a.x-b.x);
}
// The two substations that feed a point of the line: the nearest in service on each side.
export function feedersAt261(positions,x,out=new Set()){
 let left=null,right=null;for(const p of positions){if(out.has(p.name))continue;if(p.x<=x){if(!left||p.x>left.x)left=p;}else if(!right||p.x<right.x)right=p;}
 return{left,right,zone:(left&&right?(Math.abs(x-left.x)<=Math.abs(right.x-x)?left:right):left||right)?.zone??null};
}
// Which zones have traction voltage, given the substations out of service and the open contactors.
// A zone is live when one of its own S.R. is in service, or a closed C.S. ties it to a live zone.
export function zonesFed261(out=new Set(),openCs=new Set()){
 const zones=L1_ZONES261.map(z=>z.zone),own=new Map(L1_ZONES261.map(z=>[z.zone,z.sr.some(s=>!out.has(s.name))])),fed=new Set(zones.filter(z=>own.get(z)));
 let changed=true;while(changed){changed=false;for(const cs of L1_CS261){if(openCs.has(cs.between)||out.has(cs.at))continue;const [a,b]=cs.between.split('-');if(fed.has(a)!==fed.has(b)){fed.add(a);fed.add(b);changed=true;}}}
 return{fed,own:new Set(zones.filter(z=>own.get(z))),tied:new Set([...fed].filter(z=>!own.get(z)))};
}

// Feed of lines 1, 2 and 3 as the course material describes it (Buen Tono, P.C.C. 1).
export const BUEN_TONO261=Object.freeze({kvIn:85,kvOut:15,transformers:4,mvaEach:38.5,feeders:['Jamaica (lado A)','Nonoalco (lado B)'],cable:'2 cables subterráneos en tubo de acero con aceite a presión, 800 MCM, 100 MVA cada uno',traction:'4 buses de tracción y 2 de alumbrado en 15 kV',breaker:'Interruptor general Oerlikon de 85 kV por lado; seccionadores Soulé por transformador; seccionador rotativo medio (S.R.M.) entre los lados A y B'});
// 85 kV ring substations, from the table the user supplied (capacities as printed there).
export const RING261=Object.freeze([['Nonoalco','CO','T86',120],['Peralvillo','AU','T221',180],['Merced','AU','T221',180],['Jamaica','CO','T28',300],['Iztapalapa','AU','T21',180],['Santa Cruz','AU','T421',1320]]);

// Estado compartido de zonas (263): S.R. fuera de servicio y C.S. abiertos; lo usan el panel de la S.R. y el P.C.C.
export const ZONE_STATE261={out:new Set(),open:new Set()};
