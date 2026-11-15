import * as T from 'three';
import { mergeGeometries } from '../vendor/BufferGeometryUtils.js';
import { fases, salidasReductor } from './circuito-3d.js';

const ejeVertical = new T.Vector3(0,1,0);
const metal = (color, roughness=.46) => new T.MeshStandardMaterial({color,roughness,metalness:.66});
const pintura = color => new T.MeshStandardMaterial({color,roughness:.55,metalness:.25});
const acabados = {
  galvanizado:metal(0x8b9796,.61),
  uniones:metal(0xa0aaa8,.57),
  tornillos:metal(0x444e52),
  tanque:pintura(0x687574),
  radiador:pintura(0x778381),
  tapa:pintura(0x88918b),
  ceramica:new T.MeshStandardMaterial({color:0x6b3524,roughness:.29,metalness:.08}),
  terminal:metal(0xb69764,.35),
  junta:pintura(0x282e2d),
  indicador:pintura(0xd6d9c1),
};

function lote(grupo) {
  const porMaterial=new Map();
  function pieza(geometria,material,centro,rotacion) {
    if(rotacion) geometria.applyQuaternion(rotacion);
    geometria.translate(...centro);
    const triangulos=geometria.index?geometria.toNonIndexed():geometria;
    if(triangulos!==geometria) geometria.dispose();
    const lista=porMaterial.get(material)??[];
    lista.push(triangulos);
    porMaterial.set(material,lista);
  }
  function caja(centro,ancho,alto,fondo,material) {
    pieza(new T.BoxGeometry(ancho,alto,fondo),material,centro);
  }
  function cilindro(centro,radio,alto,material,lados=16,rotacion) {
    pieza(new T.CylinderGeometry(radio,radio,alto,lados),material,centro,rotacion);
  }
  function tramo(inicio,fin,material,geometria) {
    const a=new T.Vector3(...inicio), b=new T.Vector3(...fin);
    const centro=a.clone().lerp(b,.5);
    const direccion=b.sub(a);
    const longitud=direccion.length();
    const giro=new T.Quaternion().setFromUnitVectors(ejeVertical,direccion.normalize());
    pieza(geometria(longitud),material,centro.toArray(),giro);
  }
  function terminar() {
    for(const [material,geometrias] of porMaterial) {
      const malla=new T.Mesh(mergeGeometries(geometrias),material);
      malla.castShadow=true;
      malla.receiveShadow=true;
      grupo.add(malla);
      for(const geometria of geometrias) geometria.dispose();
    }
  }
  return {pieza,caja,cilindro,tramo,terminar};
}

export function construirTorre(grupo,hormigon) {
  const taller=lote(grupo);
  const {galvanizado,uniones,tornillos,ceramica,terminal}=acabados;
  function perfil(a,b,ancho) {
    taller.tramo(a,b,galvanizado,longitud=>new T.BoxGeometry(ancho,longitud,ancho*.43));
  }
  const alturas=[.052,1.22,2.42,3.62,4.76,5.75,6.43];
  const semianchos=[1.09,.92,.73,.55,.39,.29,.23];
  const esquinas=[[-1,-1],[1,-1],[1,1],[-1,1]];
  const nodo=(nivel,esquina)=>{
    const [x,z]=esquinas[esquina];
    return [1.65+x*semianchos[nivel],alturas[nivel],-.65+z*semianchos[nivel]*.83];
  };
  for(let esquina=0;esquina<4;esquina++) {
    const vecina=(esquina+1)%4;
    const [x,,z]=nodo(0,esquina);
    taller.caja([x,-.16,z],.7,.28,.65,hormigon);
    taller.caja([x,.012,z],.45,.09,.42,uniones);
    for(const dx of [-.15,.15]) for(const dz of [-.135,.135]) {
      taller.cilindro([x+dx,.085,z+dz],.038,.09,tornillos,6);
    }
    for(let nivel=0;nivel<alturas.length;nivel++) {
      const punto=nodo(nivel,esquina);
      perfil(punto,nodo(nivel,vecina),.058);
      taller.caja(punto,.13,.13,.11,uniones);
      if(nivel===alturas.length-1) continue;
      const siguiente=nodo(nivel+1,esquina);
      perfil(punto,siguiente,.115);
      perfil(nodo(nivel,vecina),siguiente,.065);
      perfil(punto,nodo(nivel+1,vecina),.065);
    }
  }
  // Cada aislador termina en el anclaje compartido con su conductor.
  for(const {torre:[x,y,z]} of fases) {
    const cruceta=y+.39;
    for(const lado of [-1,1]) {
      const extremo=1.65+lado*(x-1.65);
      for(const profundidad of [-.16,.16]) {
        const punta=[extremo,cruceta,z+profundidad];
        perfil([1.65,cruceta,z+profundidad],punta,.082);
        perfil([1.65+lado*.3,cruceta-.49,z+profundidad],punta,.065);
        perfil([1.65+lado*.63,cruceta,z-profundidad],punta,.045);
      }
      taller.caja([extremo,cruceta,z],.16,.11,.4,uniones);
      taller.cilindro([extremo,y+.19,z],.025,.39,tornillos);
      for(let disco=0;disco<5;disco++) {
        taller.pieza(new T.CylinderGeometry(.067,.115,.039,18),ceramica,[extremo,y+.065+disco*.06,z]);
      }
      taller.caja([extremo,y,z],.19,.068,.085,terminal);
    }
  }
  perfil([1.65,6.43,-.65],[1.65,6.69,-.65],.048);
  taller.terminar();
}

export function construirReductor(grupo) {
  const taller=lote(grupo);
  const {tanque,radiador,tapa,junta,tornillos,ceramica,terminal,indicador}=acabados;
  const giroHorizontal=new T.Quaternion().setFromAxisAngle(new T.Vector3(0,0,1),Math.PI/2);
  const giroFrontal=new T.Quaternion().setFromAxisAngle(new T.Vector3(1,0,0),Math.PI/2);
  function carcasa(centro,ancho,alto,fondo,bisel,material) {
    const forma=new T.Shape();
    forma.moveTo(-ancho/2,-alto/2);
    forma.lineTo(ancho/2,-alto/2);
    forma.lineTo(ancho/2,alto/2);
    forma.lineTo(-ancho/2,alto/2);
    forma.closePath();
    const geometria=new T.ExtrudeGeometry(forma,{
      depth:fondo-2*bisel,bevelEnabled:true,bevelThickness:bisel,bevelSize:bisel,bevelSegments:2,steps:1,
    });
    geometria.translate(0,0,-(fondo-2*bisel)/2);
    taller.pieza(geometria,material,centro);
  }
  carcasa([7.2,1.16,-.43],2.36,1.69,1.67,.065,tanque);
  carcasa([7.2,2.02,-.43],2.55,.07,1.83,.023,tapa);
  taller.caja([7.2,1.966,-.43],2.49,.023,1.77,junta);
  for(const z of [-1.19,.37]) for(let i=0;i<9;i++) {
    taller.cilindro([6.05+i*.287,2.097,z],.032,.036,tornillos,6);
  }
  for(const x of [6.37,8.03]) {
    taller.caja([x,.18,-.43],.26,.23,2.05,tanque);
    for(const z of [-1.39,.53]) taller.cilindro([x,.139,z],.052,.063,tornillos,6);
  }
  // Los colectores superior e inferior conectan el banco de radiadores al tanque.
  for(const y of [.53,1.69]) {
    taller.tramo([6.03,y,.87],[8.37,y,.87],radiador,longitud=>new T.CylinderGeometry(.071,.071,longitud,14));
    for(const x of [6.19,8.22]) {
      taller.tramo([x,y,.39],[x,y,.87],tanque,longitud=>new T.CylinderGeometry(.094,.094,longitud,14));
    }
  }
  for(let i=0;i<15;i++) {
    const x=6.09+i*.157;
    carcasa([x,1.105,.91],.05,1.05,.63,.022,i%2===0?radiador:tanque);
    for(const z of [.72,.87,1.02]) taller.caja([x,1.105,z],.085,.83,.028,radiador);
  }
  // Conservador de aceite y tubería de comunicación de la maqueta.
  taller.cilindro([7.2,2.39,-1.39],.255,1.88,tapa,24,giroHorizontal);
  for(const x of [6.22,8.18]) {
    taller.cilindro([x,2.39,-1.39],.271,.085,tanque,24,giroHorizontal);
  }
  taller.caja([7.2,2.686,-1.39],.16,.075,.15,tapa);
  taller.cilindro([7.2,2.766,-1.39],.063,.097,tornillos,12);
  for(const x of [6.58,7.88]) {
    taller.caja([x,2.16,-1.19],.105,.37,.29,tanque);
  }
  taller.tramo([7.86,2.21,-1.4],[7.86,2.13,-.96],tanque,longitud=>new T.CylinderGeometry(.055,.055,longitud,14));
  taller.cilindro([8.235,2.39,-1.39],.09,.035,junta,18,giroHorizontal);
  taller.cilindro([8.257,2.39,-1.39],.065,.022,indicador,18,giroHorizontal);
  // Bridas y aisladores hasta los puntos de llegada de las tres fases.
  for(const {primario:[x,y,z]} of fases) {
    taller.cilindro([x,2.108,z],.16,.069,tapa);
    taller.cilindro([x,2.452,z],.063,.69,ceramica);
    for(let falda=0;falda<8;falda++) {
      const radio=.145-falda*.005;
      taller.pieza(new T.CylinderGeometry(radio*.69,radio,.054,20),ceramica,[x,2.16+falda*.083,z]);
    }
    taller.cilindro([x,y-.038,z],.061,.124,terminal);
    taller.caja([x,y,z],.12,.051,.11,terminal);
  }
  carcasa([8.02,.59,1.285],.58,.31,.21,.024,tanque);
  for(const [x,y,z] of salidasReductor) {
    taller.cilindro([x,y,z-.046],.071,.108,junta,14,giroFrontal);
    taller.cilindro([x,y,z],.058,.055,terminal,14,giroFrontal);
  }
  taller.caja([5.95,1.17,-.43],.15,.48,.59,tanque);
  taller.caja([5.857,1.17,-.43],.057,.424,.542,tapa);
  taller.caja([5.817,1.13,-.22],.036,.112,.032,junta);
  taller.caja([5.815,1.25,-.45],.02,.085,.21,indicador);
  taller.cilindro([8.354,1.6,.19],.102,.057,tornillos,20,giroHorizontal);
  taller.cilindro([8.389,1.6,.19],.073,.019,indicador,20,giroHorizontal);
  taller.tramo([8.404,1.57,.17],[8.404,1.635,.215],junta,longitud=>new T.CylinderGeometry(.009,.009,longitud,8));
  taller.terminar();
}
