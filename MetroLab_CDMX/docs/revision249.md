# Flujo de energía y electrónica de tracción

## Uso

En observar la red o conducir, activar **Flujo de energía en vía**. Ámbar representa el circuito de alimentación desde una inyección didáctica en la estación más próxima, por la barra guía y la zona de captación, al convertidor y motor de cada carro motriz. Cian representa la continuidad del retorno. Los rieles no consumen la potencia útil: los motores y auxiliares la convierten; hay pérdidas eléctricas. En corte de alimentación se apagan los trazos. Sin tracción se representa alimentación de auxiliares hasta el convertidor, sin mostrar consumo del motor. No se presupone regeneración a la red durante el frenado.

Los trazos siguen el mapa de curvatura y la separación lateral de las vías existentes. Los extremos del coche usan su transformación durante el render, incluidos los dos apoyos. No se altera circulación, velocidad, pasajeros ni geometría de vía. Ubicación de la inyección y terminales de captación aproximada: no identifica alimentadores, seccionamientos, conexiones de retorno, reparto entre captadores o subestaciones reales. La conexión dibujada no es un plano de instalación. Los pulsos indican dirección del circuito, no velocidad de electrones ni propagación del campo. La distancia por sí sola no calcula pérdidas; se conservan las estimaciones existentes del tablero.

En **Explorar flota → Corte de alimentación → Electrónica de potencia**, abrir el despiece y seleccionar Q1–Q6. El detalle muestra un enlace CC y seis posiciones de interruptor IGBT/diodo en tres ramas U/V/W de un inversor de dos niveles. Las piezas se separan lateralmente al despiezar, manteniendo el recorrido de alimentación conectado a los conjuntos. Seleccionar una posición acerca la cámara. VVVF significa tensión y frecuencia variables: no es un componente alternativo a IGBT. El chopper y el reostático conservan sus opciones, sin insertarles el inversor trifásico. Es una comparación genérica; no se afirma la tecnología de semiconductor o el esquema exacto de cada vehículo.

## Los 10 000 A

`ASSUMED245.motorLimitA = 10000` es un parámetro previo del modelo: suma indicativa de corrientes de 24 motores, aproximadamente 416,7 A por motor bajo reparto uniforme. No es un dato de placa ni el máximo de corriente CC de captación. Para CA no se suman corrientes de fase o módulos como si todas estuvieran directamente en paralelo sobre la línea CC. Se añade esta explicación al tablero.

En la línea CC, la estimación media es `I = P_entrada / V_captación`. Si la potencia especificada es mecánica debe incluirse el rendimiento y los auxiliares. Ejemplo aritmético: 10 000 A a 750 V implican 7,5 MW de entrada. La potencia mecánica `F v` es cero con velocidad cero, pero existen pérdidas de cobre, conmutación y auxiliares; no se deduce que el arranque demande cero corriente de línea.

No se dispone aquí de un máximo verificable de corriente de entrada para NM-22, NM-79 y MP-82. Hacen falta límites del fabricante, control, tensión mínima, régimen transitorio/continuo, equipos activos y carga. No presentar los 3 400 kW comparativos del tablero como potencia documentada de la flota neumática. No se modifica la calibración previa de la simulación.

## Fuentes primarias

- STC, [Conformación de un tren](https://www.metro.cdmx.gob.mx/operacion/conformacion-de-un-tren): alimentación general, barra guía/captación y equipos. No aporta aquí el máximo de captación por modelo.
- Mitsubishi Electric, [Railway traction / power transmission](https://www.mitsubishielectric.com/semiconductors/powerdevices/application/railway/index.html): uso de HVIGBT y esquemas de inversores de dos y tres niveles. Referencia general, no identificación del proveedor del tren.

## Comprobación

`verificar_energia249.mjs`: pulsos por tiempo absoluto, continuidad entre carga y retorno, anclajes durante despiece, seis posiciones solo en VVVF, alimentación cortada, curvas y liberación de recursos; se mantienen transformaciones del coche. `verificar_electrico245.mjs` y las seis combinaciones detalladas de `verificar_alimentacion216.mjs` pasaron. Imports122: 212 módulos con URL única. Se conserva el presupuesto de render de 60 FPS y no se añaden luces. No hay medición nueva de FPS GPU ni validación contra mediciones eléctricas reales.
