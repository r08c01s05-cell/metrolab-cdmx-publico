export const lineFacts = {
 1:{stations:20,total:'18.828 km',service:'16.654 km',ends:'Pantitlán ↔ Observatorio',source:'https://www.metro.cdmx.gob.mx/la-red/linea-1'},
 8:{stations:19,total:'20.078 km',service:'17.679 km',ends:'Garibaldi ↔ Constitución de 1917',source:'https://metro.cdmx.gob.mx/la-red/linea-8'}
};

// Cada señal empieza en un segundo del capítulo y sigue el conjunto marcado.
export const trainCues = [
 [0,'Caja del coche','Aloja y protege a pasajeros, mobiliario y equipos. El bastidor transmite su peso a los bogies.', 'body'],
 [8,'Puertas de pasajeros','Dan acceso al andén. El enclavamiento impide solicitar tracción mientras las puertas están abiertas.', 'door'],
 [16,'Bogie','Sostiene y guía el coche. Agrupa ruedas, ejes y suspensión, además de la transmisión en un bogie motriz.', 'bogie']
];
export const fleetClassic279 = {
 NM79:{
  cues:[
   [0,'Concarril · fabricación mexicana','El NM-79 pertenece a una generación de formación tradicional de nueve coches y rodadura neumática. La escena muestra un coche motriz con cabina.', 'body'],
   [8,'Chopper de corriente continua','La arquitectura histórica documentada regula la tensión media aplicada a los motores de CC mediante un chopper. La electrónica de una unidad concreta puede variar con sus rehabilitaciones.', null],
   [17,'Motor de CC con colector','El GLB de referencia separa las delgas del colector y las escobillas. Las escobillas llevan corriente al inducido y el colector conmuta sus conexiones durante el giro.', 'brushes']
  ],
  references:[['NM-79 · estudio del IPN','https://tesis.ipn.mx/jspui/bitstream/123456789/12397/1/PROPUESTA%20DEL%20MANTENIMIENTO%20DEL%20MODULO%20ONDULADOR%20EMPLEADOS%20EN%20LOS%20CONVOY%20NM%2079%20DE%20STC.pdf']]
 },
 MP82:{
  cues:[
   [0,'Alstom · origen francés','El MP-82 es un tren neumático de la Línea 8. La ficha del Metro describe una formación de nueve coches M–R–N–N–PR–N–N–R–M.', 'body'],
   [8,'Chopper de tracción y frenado','El diseño estudiado por el IPN usa tiristores para regular los motores de CC. Describe frenado con recuperación y frenado dinámico, según las condiciones del circuito y de la red.', null],
   [17,'Motor de CC con colector','El despiece de referencia muestra el inducido, el colector y las escobillas. En el NM-22, en cambio, el inversor VVVF alimenta el motor asíncrono con CA trifásica.', 'brushes']
  ],
  references:[
   ['MP-82 · ficha del Metro','https://www.metro.cdmx.gob.mx/operacion/parque-vehicular/mp-82'],
   ['Chopper MP-82 · estudio del IPN','https://tesis.ipn.mx/jspui/bitstream/123456789/13861/1/tesis_%20METRO.pdf']
  ]
 }
};
const prescripciones='https://metro.cdmx.gob.mx/storage/app/media/licitacion/2020/30102015_002_20/ANEX1/ACTUALIZADA/15-prescripciones-mr-25sept-cambios.pdf';
export const runningSources=[
 ['Rodadura neumática y férrea','https://www.metro.cdmx.gob.mx/operacion/carro-neumatico-y-ferrero'],
 ['Especificación de Línea 1 · § 4.5',prescripciones]
];
export const tractionSources=[['Especificación de Línea 1 · § 5.12',prescripciones]];
export const supplySources=[
 ['Metro-Energía · 230 y 15 kV','https://www.metro.cdmx.gob.mx/comunicacion/nota/construyen-gobierno-capitalino-y-cfe-la-subestacion-de-alta-tension-seat-mas-moderna-y-grande-del-pais-denominado-proyecto-metro-energia'],
 ['Informe FIMETRO · p. 91','https://metro.cdmx.gob.mx/storage/app/media/FIMETRO/INFORME-TRIMESTRAL-FIMETRO/2025/Cuarto%20Informe%20Trimestral%202024.pdf#page=91']
];
export const runningCues=[
 [0,'Bogie motriz ensamblado','Bastidor, suspensión y dos ejes sostienen el coche. Las piezas se van a separar para que se distingan sus funciones.',null],
 [6,'Neumático portador','La llanta soporta el peso del coche sobre la pista y transmite el esfuerzo de tracción y frenado.', 'tire'],
 [13,'Rueda de seguridad de acero','Es concéntrica con la rueda portadora. Puede apoyarse en el riel en caso de pérdida de presión y guiar con su pestaña donde falta barra guía.', 'steelWheel'],
 [20,'Rueda guía horizontal','Se apoya lateralmente en la barra guía y centra el bogie. Su eje vertical la distingue de las ruedas portadoras.', 'guide'],
 [27,'Zapata captadora (+)','El cabezal conductor desliza sobre la barra guía. La maqueta muestra captación en ambos costados del bogie.', 'shoe'],
 [34,'Barra guía (+) · 750 V CC','Distribuye la energía de tracción. Los aisladores separan la barra de su soporte.', 'bar'],
 [40,'Riel de retorno (−)','El riel de acero cierra el circuito. En el coche, los frotadores negativos hacen contacto con él.', 'return'],
 [47,'Acople sobre la vía','Las llantas vuelven a su pista, la rueda guía queda junto a la barra y la zapata regresa a la superficie de contacto.', 'pista']
];
export const steelCues=[
 [0,'Rueda de acero y pestaña','Aquí se aísla la rueda de seguridad del NM-22 para ver el contacto acero–riel. En los trenes de rodadura férrea, las ruedas de acero soportan el peso durante la marcha normal.', 'steelWheel'],
 [9,'Riel y fijaciones','El riel transmite la carga a los durmientes o a la base de vía. En los trenes férreos de este Metro, la captación se hace por pantógrafo y catenaria.', 'rail']
];
export const tractionCues=[
 [0,'Tren detenido','La barra guía está energizada. La demanda de tracción empieza con la orden de arranque.', 'bar'],
 [4,'Arranque · captación','El flujo amarillo va de la barra a la zapata. La demanda de corriente sube conforme se aplica par para mover el tren.', 'shoe'],
 [10,'Conversión de potencia','El inversor VVVF usa la CC del enlace para alimentar los motores asíncronos con CA de tensión y frecuencia variables. El flujo sobre el cofre del GLB representa esa función.', 'converter'],
 [18,'Marcha por inercia','El tren sigue avanzando con la orden de tracción en cero. La demostración sólo representa el circuito de tracción.', 'motor'],
 [25,'Motor en modo generador','Al frenar eléctricamente, parte de la energía cinética pasa al enlace de CC. La red podría recibirla si fuera receptiva.', 'motor'],
 [31,'Frenado reostático','En este ejemplo la red no admite energía. El chopper de frenado deriva corriente a las resistencias. El brillo en la rejilla del GLB representa la disipación de calor.', 'resistor'],
 [43,'Fin de la frenada','La corriente de frenado baja al detenerse el tren. Las resistencias se enfrían después de la maniobra.', 'resistor']
];
export const motorCues = [
 [0,'Motor de tracción · maqueta','El motor convierte la energía eléctrica en giro. Las piezas se separan para mostrar su posición relativa.', null],
 [7,'Carcasa','Protege el conjunto y ayuda a evacuar el calor al exterior.', 'housing'],
 [15,'Estator','Sus devanados crean el campo magnético giratorio que induce corriente en el rotor.', 'stator'],
 [23,'Rotor de jaula','La corriente inducida en sus barras interactúa con el campo y produce par.', 'rotor'],
 [31,'Eje','Transmite el giro hacia la transmisión. Los rodamientos lo sostienen y permiten que gire con poca fricción.', 'shaft'],
 [39,'Tapas y rodamientos','Cierran el conjunto y mantienen el rotor centrado dentro del estator.', 'cover']
];
export const tunnelCues = [
 [0,'Revestimiento','Las dovelas forman el anillo que contiene el terreno alrededor del túnel.', 'lining'],
 [7,'Pasarela','Permite el paso del personal y forma parte de la ruta de evacuación prevista para el tramo.', 'walkway'],
 [14,'Solera y drenaje','La solera soporta la base de vía. El drenaje recoge el agua en la parte baja del túnel.', 'slab']
];
export const supplyCues = [
 [0,'CFE · 230 kV CA','En el ejemplo Metro-Energía, las tres fases llegan desde la red de alta tensión. La maqueta sigue los conductores desde las torres al patio.', 'cfe'],
 [9,'Buen Tono · 230 → 15 kV CA','La subestación de alta tensión reduce el voltaje para distribuir energía por alimentadores de media tensión.', 'seat'],
 [18,'Alimentador · 15 kV CA','El cable de media tensión lleva energía del patio a las subestaciones rectificadoras. El amarillo identifica la etapa de corriente alterna.', 'cable'],
 [28,'Transformador de tracción · 15 kV → 570 V CA','En el caso documentado de Línea 1, el secundario alimenta el rectificador con 570 V CA.', 'tr'],
 [38,'Rectificador · 750 V CC','Los diodos convierten la CA en CC para la tracción. La salida se protege y se distribuye a los tramos de barra guía.', 'rec'],
 [48,'Barra guía y captación (+)','El flujo naranja llega a la vía y a la zapata del tren. La barra guía se representa con su tensión nominal de 750 V CC.', 'contact'],
 [58,'Retorno por rieles (−)','El flujo azul cierra el circuito desde la vía hasta la subestación rectificadora.', 'returnPath']
];
export const substationCues = [
 [0,'Frente de la subestación','Vista desde el lado de acceso. El despiece separa los equipos para mostrar su papel en la cadena de tracción.', null],
 [8,'Celda de media tensión','Recibe el alimentador. Permite seccionar y proteger la entrada de la subestación.', 'mt'],
 [18,'Transformador de tracción','Adapta la tensión alterna al nivel de entrada del rectificador.', 'transformer'],
 [28,'Rectificador','El conjunto de diodos convierte la corriente alterna en corriente continua de tracción.', 'rectifier'],
 [38,'Gabinete de corriente continua','Protege y secciona la salida que alimenta los tramos de la barra guía.', 'dc'],
 [47,'Tablero de control','Recibe señales de los equipos y permite supervisar sus estados, alarmas y maniobras.', 'control']
];
