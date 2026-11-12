// Mando y control 262: desde dónde se controla la energía de tracción del Metro. Todo sale del
// material del curso (presentaciones METRO 7EM1 y METRO II 7EM4); lo que el material no dice se
// marca como no documentado. No cambia el movimiento de los trenes.
export const SOURCE262=Object.freeze({title:'Material del curso de Tracción Eléctrica: presentaciones METRO 7EM1 y METRO II 7EM4',detail:'Edificio del P.C.C. 1, partes de la subestación de 85/15 kV, mandos, S.R. de Línea 1, división eléctrica de Línea 12 y coordinación de maniobras.'});

// Puestos de mando que nombra el material.
export const POSTS262=Object.freeze([
 {id:'pcc',name:'P.C.C. · Puesto Central de Control',where:'Edificio del P.C.C. 1, en Buen Tono',text:'Coordina y controla los movimientos de personal, trenes y equipos de las líneas 1 a 6. En el mismo edificio se recibe la energía de CFE en 85 kV y se transforma a 15 kV para las líneas 1, 2 y 3.'},
 {id:'pdc',name:'P.D.C. · Puesto de Despacho de Carga',where:'5.º piso del P.C.C.',text:'Desde su tablero de distribución se telemandan los interruptores de 85 kV, los seccionadores Soulé, los interruptores de 15 kV y las S.R. Su regulador atiende las alarmas, lleva el libro de maniobras y concede las libranzas.'},
 {id:'sala',name:'Sala de interruptores',where:'Edificio del P.C.C.',text:'Aquí están los interruptores de 15 kV (Seco Gear) que alimentan cada cable de S.R. Para devolver una S.R. al servicio primero se conecta aquí su interruptor al bus y después se cierra desde el P.D.C.'},
 {id:'tcd',name:'T.C.D. de cada línea',where:'P.C.C.',text:'Su regulador bloquea las condiciones de cierre de una S.R. con avería de grupo cuando el P.D.C. lo solicita. El material no desarrolla la sigla ni describe el tablero.'},
 {id:'pcl',name:'P.C.L.',where:'Línea 12',text:'Desde aquí se operan a distancia los interruptores de aislamiento telemandado (IAT) que unen secciones de una misma zona de catenaria. El material no desarrolla la sigla.'},
 {id:'cee',name:'Sala del C.E.E. de la S.E.A.T. Estrella',where:'Línea 12',text:'Manda a distancia el disyuntor de mediana tensión (D.M.T.) de las S.R. de 23 kV de la Línea 12.'},
 {id:'local',name:'Mando local',where:'En el propio equipo o en el local de la S.R.',text:'Todo equipo telemandado conserva un mando local: conmutador eléctrico en su armario, manivela o caja de mando. Se usa en mantenimiento o cuando falla el telemando.'}]);

// Qué equipo se manda y desde dónde.
export const DEVICES262=Object.freeze([
 {id:'oerlikon',name:'Interruptor general Oerlikon de 85 kV',remote:'pdc',modes:['Mando a distancia: botones de cierre y apertura en la platina de mandos del P.D.C.','Mando local eléctrico: conmutador «cierre-apertura» en su armario','Mando local manual: electroválvulas accionadas a mano'],rule:'Puede abrir y cerrar con carga. También abre solo ante ciertas averías en 85 y 15 kV.'},
 {id:'soule',name:'Seccionadores Soulé (SA1, SA2, SB1, SB2)',remote:'pdc',modes:['Mando a distancia: botón de cierre o de apertura en el tablero del P.D.C.','Mando manual: manivela en el órgano de mando'],rule:'Solo se mueven con su interruptor de llegada abierto; un contacto de posición los bloquea si está cerrado.'},
 {id:'rotativo',name:'Seccionadores rotativos (SR-1A, SR-1B, SR-2A, SR-2B)',remote:null,modes:['El material no indica telemando'],rule:'Aíslan al interruptor Oerlikon. Se operan con o sin tensión, pero jamás con carga.'},
 {id:'srm',name:'Seccionador rotativo medio (S.R.M.)',remote:null,modes:['Solo manual, desde el exterior de la cámara, con llaves de bloqueo y seguros mecánicos'],rule:'Une los buses de 85 kV de los lados A y B. Exige que uno de los dos juegos de barras esté aislado y sin potencial de su cable.'},
 {id:'secogear',name:'Interruptor de 15 kV (Seco Gear) de cada S.R.',remote:'pdc',modes:['Tablero de distribución del P.D.C.','Sala de interruptores: conexión y desconexión del bus'],rule:'Abre solo por cable a tierra o por cortocircuito en el cable de 15 kV.'},
 {id:'sr',name:'Subestación de rectificación (S.R.)',remote:'pdc',modes:['Telemando y señalización por el hilo piloto del cable de 15 kV, desde el tablero del P.D.C.','Mando local en el gabinete de control de la S.R.'],rule:'Si el hilo piloto falla, la S.R. no responde al telemando.'},
 {id:'dmt',name:'D.M.T. de las S.R. de 23 kV (líneas 4 a 7)',remote:'pdc',modes:['Tablero de distribución del P.D.C.'],rule:'Interruptor en pequeño volumen de aceite con protecciones propias.'},
 {id:'dmt12',name:'D.M.T. de las S.R. de Línea 12',remote:'cee',modes:['Mando a distancia desde la sala del C.E.E. de la S.E.A.T. Estrella','Mando local en la S.R.'],rule:'Abre también por ausencia de 23 kV, avería de grupo, falta de 220 V CA al autómata (A.P.I.) o relé de tierra.'},
 {id:'dv',name:'Disyuntor de vía (D.V.) de Línea 12',remote:null,modes:['Lo gobierna el autómata programable (A.P.I.) de la S.R.'],rule:'Tras un disparo recierra a los 7 segundos. Si el cortocircuito sigue, vuelve a abrir y ya no recierra.'},
 {id:'iat',name:'Interruptor de aislamiento telemandado (IAT) de Línea 12',remote:'pcl',modes:['A distancia desde el P.C.L.','Local, desde una caja de mando cercana'],rule:'Solo enlaza dos secciones de una misma zona.'}]);

// Enclavamientos de la subestación de 85/15 kV.
export function canOperate262(device,s={}){
 if(device==='soule')return s.arrivalClosed?{ok:false,why:'El interruptor de llegada está cerrado: el contacto de posición bloquea al seccionador Soulé.'}:{ok:true,why:'Interruptor de llegada abierto: el Soulé puede maniobrar.'};
 if(device==='rotativo')return s.load?{ok:false,why:'Hay carga: los seccionadores rotativos jamás se operan con carga.'}:{ok:true,why:'Sin carga: se puede operar, con o sin tensión.'};
 if(device==='srm')return s.busIsolated?{ok:true,why:'Un juego de barras está aislado y sin potencial: se puede cerrar el S.R.M. a mano, con sus llaves.'}:{ok:false,why:'Ningún juego de barras de 85 kV está aislado de su cable: el S.R.M. no debe cerrarse.'};
 if(device==='oerlikon')return{ok:true,why:'El interruptor Oerlikon abre y cierra con o sin carga.'};
 return{ok:false,why:'Equipo no documentado.'};}
// ¿Responde una S.R. al telemando del P.D.C.?
export function telemando262({pilot=true,feederBlocked=false,flooded=false}={}){
 if(!pilot)return{ok:false,why:'Falla del hilo piloto: no hay señalización ni telemando.'};
 if(feederBlocked)return{ok:false,why:'El interruptor alimentador está bloqueado.'};
 if(flooded)return{ok:false,why:'Local de la S.R. inundado.'};
 return{ok:true,why:'Hilo piloto en servicio: la S.R. obedece al tablero del P.D.C.'};}

// Causas por las que una S.R. sale de servicio y la coordinación que describe el material.
const REPONER=['Alta tensión informa al P.D.C. que la falla quedó resuelta y da su visto bueno','En la sala de interruptores se conecta al bus el interruptor de la S.R.','En el 5.º piso, el P.D.C. cierra el interruptor desde el tablero de distribución y energiza el cable','Con la S.R. en operación normal se anota en los libros de fallas y de maniobras'];
const CABLE=who=>['El regulador del P.D.C. calla la alarma del interruptor que abrió solo','Se genera un número de falla y se avisa a la sección de alta tensión','Se hacen las maniobras para obtener la llave de bloqueo y entregarla a alta tensión','Si hace falta, se pide subir la calibración de los D.U.R. de las S.R. vecinas para evitar cortes de corriente de tracción','Se anota el avance en el libro de maniobras',...REPONER];
export const CAUSES262=Object.freeze([
 {id:'tierra',name:'Cable a tierra',auto:true,text:'Una fase del cable de 15 kV pierde aislamiento y se aterriza. Se detecta en el tablero de distribución.',steps:CABLE()},
 {id:'corto',name:'Cortocircuito en el cable',auto:true,text:'Cortocircuito entre fases del cable de 15 kV que alimenta a la S.R.',steps:CABLE()},
 {id:'grupo',name:'Avería de grupo',auto:false,text:'Falla en el transformador principal, en el secundario, en el grupo rectificador o en el ventilador.',steps:['El P.D.C. pide al regulador del T.C.D. de la línea bloquear las condiciones de cierre de la S.R.','Se coloca una placa en el tablero de distribución que avisa que la S.R. está con avería','Solo si la S.R. va a estar fuera mucho tiempo se pide subir la calibración de los D.U.R. vecinos','Alta tensión y ventilación avisan al P.D.C. que la falla quedó reparada y dan su visto bueno','El P.D.C. pone en servicio la S.R. desde el tablero de distribución']},
 {id:'piloto',name:'No responde al telemando',auto:false,pilot:false,text:'Falla del hilo piloto, bloqueo del interruptor alimentador, inundación del local, filtraciones o falla en cables de 1 kV. No siempre aparece en la platina de señalización de averías.',steps:['El P.D.C. detecta que la S.R. no obedece y avisa a la sección que corresponde','La sección atiende el problema en sitio','Quien lo atendió informa al P.D.C.','Con el visto bueno de alta tensión, el P.D.C. hace las maniobras en el tablero de distribución y pone en servicio la S.R.']},
 {id:'mtto',name:'Mantenimiento (libranza)',auto:false,text:'Alta tensión o ventilación piden la libranza de la S.R.',steps:['El P.D.C. revisa que el trabajo esté en el programa de mantenimiento','Concede la libranza cuidando las normas de seguridad y lo anota en el libro de maniobras','El personal trabaja con la S.R. fuera de servicio','El personal devuelve la libranza y da su visto bueno','El P.D.C. pone en servicio la S.R. desde el tablero de distribución']}]);

// Estado de una maniobra: los pasos se cumplen en orden; la S.R. vuelve al completar el último.
export class Maneuver262{
 constructor(sr,causeId){this.sr=sr;this.cause=CAUSES262.find(c=>c.id===causeId);if(!this.cause)throw new Error('Causa desconocida: '+causeId);this.done=0;this.log=[this.cause.auto?`El interruptor de 15 kV de ${sr} abrió solo`:`${sr} queda fuera de servicio: ${this.cause.name.toLowerCase()}`];}
 get steps(){return this.cause.steps;}get finished(){return this.done>=this.steps.length;}get out(){return!this.finished;}
 get telemando(){return telemando262({pilot:this.cause.pilot!==false||this.done>=2});}
 advance(i=this.done){if(this.finished)return false;if(i!==this.done)return false;this.log.push(this.steps[i]);this.done++;return true;}}
