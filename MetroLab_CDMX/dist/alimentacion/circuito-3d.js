// Dimensiones ilustrativas del campo de transmisión, en metros.
export const torresCampo = {
  origen:[-48,0,-4.2],
  llegada:[-21,0,-4.2],
  escala:3.6,
};
export const origenTorre = [1.65,0,-.65];
export function borneTorre(punto,base) {
  return punto.map((coordenada,eje)=>base[eje]+(coordenada-origenTorre[eje])*torresCampo.escala);
}

export const fases = [
  { torre:[3,5.89,-.65], portico:[1.42,7.6,-1.45], primario:[6.46,2.89,-.4] },
  { torre:[3,4.97,-.65], portico:[2.48,6.32,-.45], primario:[7.2,2.89,-.4] },
  { torre:[3,4.05,-.65], portico:[3.49,5.04,.5], primario:[7.94,2.89,-.4] },
];
export const salidasReductor = [
  [7.81,.55,1.44],
  [8.02,.55,1.44],
  [8.23,.55,1.44],
];

export function tramosDeAlimentacion({mediumOnly, overhead, captador}) {
  const vano=(inicio,fin,flecha)=>[
    inicio,inicio.map((valor,eje)=>(valor+fin[eje])/2-(eje===1?flecha:0)),fin,
  ];
  const llegada = mediumOnly
    ? [['ac','cfe',[[2.52,.72,.1],[3.5,.4,1.9],[6.15,.37,1.9],[7.1,.36,.76]]]]
    : fases.flatMap(({torre,portico,primario},i) => {
      const [x,y,z]=portico;
      const entrada=borneTorre(torre,torresCampo.origen);
      const salida=borneTorre(torre,torresCampo.llegada);
      // El vano llega a la cara de entrada de la segunda torre. Un puente recorre la cruceta.
      const terminalOpuesto=borneTorre([2*origenTorre[0]-torre[0],torre[1],torre[2]],torresCampo.llegada);
      const canal=2.79+i*.19;
      const llegadaX=8.9+i*.34;
      return [
        ['ac','cfe',vano(entrada,terminalOpuesto,1.8),true],
        ['ac','cfe',[terminalOpuesto,[torresCampo.llegada[0],salida[1]-1.18,salida[2]-2.8],salida],true],
        ['ac','cfe',vano(salida,portico,.85),true],
        ['ac','seat',[portico,[x+.18,y-.55,z],[x+.18,-.06,z],[x+.18,-.94,canal],
          [llegadaX,-.94,canal],[llegadaX,.13,canal],[llegadaX,2.92,primario[2]+.43],primario]]
      ];
    });
  const media=salidasReductor.map((salida,i)=>{
    const offset=i*.21;
    return ['ac','cable',[
    salida,[salida[0],.24,1.81+offset],[10.84+offset,.24,3.45+offset],[10.84+offset,-1.75,3.45+offset],
    [12.9+offset,-1.75,3.45+offset],[13.28+offset,-.83,2.74],[13.28+offset,1.03,1.35],
    [13.86+.9*i,1.03,.41],[13.86+.9*i,.46,.1],
    ]];
  });
  const cuarto=[0,.18,.36].map(offset=>['ac','tr',[
    [16.26,-.74-offset,.48],[16.68,-.74-offset,1.07],[17.06,-.74-offset,1.07],[17.06,-.74-offset,.79],
  ]]);
  const captacion=overhead
    ? [['dc','track',[[21.69,-1.43,.89],[23.9,-1.43,.89],[23.9,2.08,0],[39,2.08,0]]],
       ['dc','track',[[29.08,2.08,0],[29.6,1.16,0],[29,.33,0]]]]
    : [['dc','track',[[21.69,-1.43,.89],[23.62,-1.43,2.05],[23.62,-1.88,2.05],[38.9,-1.88,2.05]]],
       ['dc','track',captador
         ? [[captador[0],-1.88,2.05],[captador[0],captador[1],1.65],captador]
         : [[27.55,-1.88,2.05],[27.55,-1.88,1.25]]]];
  return [
    ...llegada,...media,...cuarto,
    ['dc','rec',[[19.36,-1.43,.87],[19.6,-1.43,1.01],[20.18,-1.43,1.01],[20.41,-1.43,.87]]],
    ...captacion,
    ['ret','return',[[38.8,-2.31,.96],[23.78,-2.31,.96],[22.92,-2.47,2.72],[18.2,-2.47,2.72],[18.2,-2.28,.86]]],
    ['ac','aux',[[10.66,-.82,3.45],[10.45,-.48,3.17],[10.55,-.48,-.68],[10.55,.2,-.68]]],
  ];
}
