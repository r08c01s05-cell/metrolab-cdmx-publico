# Revisión 215: refinamiento de acabados en L1 y L8

Los perfiles de las 39 estaciones comparten ahora pavimentos de contraste moderado. Losas rectangulares L1 de 0.60 × 0.30 m de escala visual aproximada (no medida certificada), distribuidas con variación determinista en vez del damero anterior de 1.20 × 0.60 m. Las estaciones de superficie conservan sus incrustaciones geométricas verde/gris, rosa/gris y marrón según el perfil existente. Los pavimentos pétreos genéricos tienen variación más discreta y sin triángulos uniformes.

Se refuerza la veta de los revestimientos pétreos. Los plafones subterráneos conservan juntas/perforaciones; las cubiertas de superficie usan juntas lineales y tonos claros, con tono cálido de cubierta para Aculco conforme a la imagen aportada. No se cambian perfiles de color por estación ni el arte de los GLB.

## Recursos y límites

Veinticinco mapas compartidos de 512 px al recorrer las 39 estaciones en QA, frente a veintitrés anteriormente; sin mapas individuales por malla, nuevos objetos de escena, luces, sombras ni dependencias externas. No se modifica la configuración de calidad, el límite de 60 FPS o los cálculos de movimiento. No se ha medido aquí el rendimiento GPU de todas las estaciones.

Se conservan vías, plataformas, escaleras, accesos, apoyos de vagones y contención de pasajeros. Esta revisión es de materiales; no reconstruye arquitectura ausente de las fotos ni certifica fidelidad métrica/fotorealismo. La iluminación y el detalle estructural siguen siendo aproximaciones de las referencias parciales.

## Verificaciones

- verificar_imports122: 190 módulos válidos y URL única por módulo.
- verificar_referencias213: perfiles y fotos de las 39 estaciones, posiciones/vértices de andenes y escaleras, arte original, caras superiores visibles, doce módulos de vías/movimiento protegidos y restitución de iluminación de túnel.
- verificar_carga214: preparación compartida y recuperación tras error conservadas.
- WebGL: Gómez Farías, Pino Suárez y Aculco; cambio L1/L8, vista a pie y foto de referencia. Las demás estaciones se verificaron mediante carga/inspección CPU, sin afirmar revisión visual individual de las 39.

Misma rama revision/andenes-superficie-l1-l8 y PR de revisión; no se integra en main.
