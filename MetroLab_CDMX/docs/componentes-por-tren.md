# Componentes de tracción por tren

La vista «Corte de alimentación · vía al motor» selecciona VVVF y motor de CA para NM-22, y chopper y motor de CC para NM-79 y MP-82. La opción de arquitectura permite una comparación explícita, sin atribuirla al tren. Las modificaciones y subseries requieren verificación específica.

El corte usa las mallas disponibles de los GLB, clasificando la familia visual heredada de sus grupos padres. Los motores conservan el rotor de jaula del NM-22 y el inducido de los otros dos modelos. El equipo electrónico se representa de forma didáctica: filtro, enlace CC, módulos IGBT y disipador para el inversor; filtro, conmutador, diodo, reactor y disipador para el chopper. Seleccionar una pieza aísla y enfoca el conjunto; «Mostrar conjunto completo» devuelve la vista del coche.

Las geometrías, conexiones, cotas y ubicación del equipo electrónico son esquemáticas; no son planos de fabricante. El frenado regenerativo no es exclusivo de motores asíncronos. No se adjudica una tecnología concreta de conmutador a todas las versiones de NM-79 o MP-82.

Referencias: documento ESIME-IPN sobre tracción MP-82 https://tesis.ipn.mx/jspui/bitstream/123456789/13861/1/tesis_%20METRO.pdf y requerimientos L1 2020 identificados en motor-runtime90.js. Faltan fichas y planos específicos para verificar las subseries y su instalación física.

Pruebas: verificar_alimentacion216.mjs comprueba los GLB de los tres trenes, la correspondencia de sus rotores, sus grupos y ciclos de montaje; verificar_energia249.mjs comprueba topologías, piezas y continuidad didáctica del flujo. Se verificó el selector de los tres trenes y el enfoque del VVVF y chopper en navegador.
