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
 [0,'Línea de transmisión','La corriente alterna llega al sistema desde la red de alta tensión.', 'cfe'],
 [9,'Patio de transformación','Reduce la tensión a media tensión para distribuir la energía hacia las subestaciones rectificadoras.', 'seat'],
 [18,'Alimentador de media tensión','Une el patio con la subestación. En la maqueta las líneas amarillas identifican el recorrido de corriente alterna.', 'cable'],
 [27,'Rectificación','En la subestación se reduce la tensión nuevamente y se rectifica para obtener corriente continua de tracción.', 'rec'],
 [36,'Barra guía y captador','El contacto deslizante del tren recibe la alimentación desde la barra guía. En las líneas 1 y 8 la tracción se representa a 750 V CC.', 'contact'],
 [46,'Retorno por vía','La corriente regresa a la subestación por el circuito de retorno asociado a la vía. El flujo azul lo indica en la maqueta.', 'returnPath']
];
export const substationCues = [
 [0,'Frente de la subestación','Vista desde el lado de acceso. El despiece separa los equipos para mostrar su papel en la cadena de tracción.', null],
 [8,'Celda de media tensión','Recibe el alimentador. Permite seccionar y proteger la entrada de la subestación.', 'mt'],
 [18,'Transformador de tracción','Adapta la tensión alterna al nivel de entrada del rectificador.', 'transformer'],
 [28,'Rectificador','El conjunto de diodos convierte la corriente alterna en corriente continua de tracción.', 'rectifier'],
 [38,'Gabinete de corriente continua','Protege y secciona la salida que alimenta los tramos de la barra guía.', 'dc'],
 [47,'Tablero de control','Recibe señales de los equipos y permite supervisar sus estados, alarmas y maniobras.', 'control']
];
