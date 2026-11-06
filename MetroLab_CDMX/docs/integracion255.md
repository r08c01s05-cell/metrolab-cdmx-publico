# Integración de revisión249–254 con main

Se incorpora main be19ec9 a la rama de revisión antes de integrar el PR3 solicitado por el usuario. Se conservan los botones de carga, la animación eléctrica en la subestación, el detalle de componentes y la separación de puertas nuevos de main. Se conservan captación bilateral, flujo auxiliar hasta el último coche, SR ancladas a locales existentes y espaciado uniforme de la revisión.

Conflictos resueltos en driving107, CSS del análisis e index; URLs sincronizadas255 para no duplicar módulos. Los modos Flujo de energía en vía y Flujo de corriente se desactivan mutuamente: siguen disponibles sin dibujarse a la vez. Permanecen las notas de representación educativa y datos reales pendientes.

Validación: suite completa verificar_colaboracion.mjs sobre la combinación, con semiespacio Node reducido para los GLB grandes, además de sintaxis, imports y diferencias sin marcadores de conflicto.
