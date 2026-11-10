import {visualState105} from './visual-settings105.js?v=105';

// Presupuesto de pasajeros detallados 259. Cada persona detallada (modelo GLB con esqueleto) cuesta
// decenas de miles de triángulos; antes siempre se permitían 24 a la vez. Ahora el tope sigue a la
// calidad elegida, y en cabina baja más porque el andén pasa rápido y de lejos. Las demás personas
// se siguen viendo con el modelo instanciado ligero.
export const DETAILED259=Object.freeze({performance:8,balanced:14,cinematic:24,cab:10});
export function detailedBudget259(mode,quality=visualState105().quality){
 const base=DETAILED259[quality]??DETAILED259.balanced;
 return mode==='driver'||mode==='cab-platform'?Math.min(base,DETAILED259.cab):base;
}
