# Revisión 206 · agarres y aviso de cierre

## Bolsa atrapada en la puerta

El controlador del taller rechazaba E y F si Ctrl estaba pulsado. Eso impedía
interactuar precisamente mientras el alumno se agachaba. Ahora acepta esas
acciones si Ctrl pertenece al controlador de postura activo y cancela su acción
predeterminada de navegador. Se conserva el rechazo de combinaciones ajenas al
controlador y de entrada en campos de texto.

La pasarela permite acercarse hasta z=0.40 manteniéndose fuera de la hoja. Para
el objeto bajo de esta práctica, Ctrl permite una postura más profunda (ojos a
0.84 m sobre la pasarela). El alcance del brazo no aumenta. La guía usa el punto
de superficie de la selección real y distingue «agáchate», «acércate agachado» y
«E · Tomar bolsa», en vez de medir siempre al centro del objeto.

La prueba de taller ahora camina desde S1 hasta la bolsa con el controlador real,
comprueba que no se puede alcanzar de pie, la toma, la devuelve, vuelve a tomarla
y la lleva a la bandeja sin teletransportar la cámara ni completar estados a mano.
La prueba de navegador utiliza Ctrl + WASD y pulsa E manteniendo Ctrl.

## Mano de la palanca y piezas transportadas

La mano izquierda sigue la orientación de la empuñadura durante freno, neutro y
tracción. Las falanges rodean la parte delantera y el pulgar se opone por detrás;
se retira el aplastamiento artificial de la malla del guante. La palanca se acerca
0.11 unidades locales de tablero para permitir todo su recorrido con los brazos
de longitud fija. La mano derecha conserva la operación de los seis botones.

`material-grip206.js` calcula contactos sobre geometría real: asa de la bolsa,
bordes opuestos de marcos/tapas y ruedas, y agarre de piezas pequeñas. Las palmas
se orientan hacia la pieza y el pulgar se opone a los dedos. Las piezas grandes
se centran entre ambos brazos y se orientan según su plano principal, en vez de
usar la diagonal de su caja visible para colocar las manos. El filtro de
subestación comparte los contactos en bordes reales y soporte con ambas manos.
Se conserva el agarre específico del anemómetro y el funcionamiento de medición.

## Aviso audible

El extracto anterior duraba cinco segundos, pero su tono de aviso empezaba cerca
del segundo 1 y terminaba cerca de 4.2: el resto era ambiente de la grabación.
El nuevo `aviso_cierre206.wav` utiliza el tramo 1.05–4.15 del archivo aportado y
lo extiende a cinco segundos mediante ajuste temporal que conserva la altura del
tono. No se sintetiza una alarma ni se repite un bucle. Se conservan el extracto
anterior y el mensaje hablado manual. Reproducción de referencia a ritmo 1×;
no se modifica la escala temporal de la simulación ni su interbloqueo de puertas.

Generador: `preparar_aviso206.py` (FFmpeg). La verificación normal no requiere
FFmpeg: `verificar_audio206.mjs` lee el WAV y comprueba señal audible y tono
grabado en cada uno de los cinco segundos, las tres asignaciones de modelo,
programación de inicio/fin, reanudación, silencio y decodificación tardía.

## Validación

Se amplían las regresiones existentes de conducción, taller y transporte de
filtro: contacto de palma, oposición del pulgar, brazos fijos, recogida cancelada
y retomada, transporte y colocación. `verificar_palanca206.cjs` dibuja la cabina
nativa mediante WebGL por software y decodifica/renderiza realmente el WAV con
OfflineAudioContext. No mide FPS en la GPU del usuario ni sustituye esa revisión
visual. La caché de módulos afectados y del manifiesto de cierre cambia a 206.
La corrección del sistema documental de refrigeración sigue siendo una tarea
distinta; esta revisión no presenta el módulo genérico actual como equipo real.
