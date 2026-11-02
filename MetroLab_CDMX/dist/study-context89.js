export const STUDY_CONTEXT89={
 doors:{source:'energia2',page:121,text:'Circuitos históricos MP-68/NM-73A. El ejercicio de obstrucción es didáctico; no reproduce su cableado.'},
 ventilation:{source:'energia2',page:128,text:'Servicios auxiliares en esquemas históricos. La práctica de conexión es una simplificación educativa.'},
 running:{source:'metro-slides',page:56,text:'Rodadura neumática: ruedas portadoras, guía y seguridad. Las cotas, presiones y pares requieren documentación específica del modelo.'},
 electrical:{source:'energia2',page:7,text:'Diferencia entre distribución de energía, tracción y servicios. Este banco opera con 24 V CC simulados; no representa la tracción ni la batería real del tren.'}
};
export function requestStudy89(source,page){document.dispatchEvent(new CustomEvent('metro-study-open',{detail:{source,page}}));}
