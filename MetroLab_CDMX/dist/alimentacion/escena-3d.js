import * as T from 'three';
import { fases, origenTorre, torresCampo } from './circuito-3d.js?v=284';
import { construirCampo284 } from './terreno-284.js?v=284';
import { construirTorre, construirReductor } from './equipos-exteriores.js?v=284';
import { superficies3D, texturaCaja } from './superficies-3d.js';

export function construirMaqueta(escena) {
  const materiales = {};
  const colores = {
    tierra:0x8a634b, estrato:0xa27b55, pasto:0x7b8b53, losa:0xa4a296,
    muro:0xa8aaa6, acero:0x6d7b7e, oscuro:0x29363c, metal:0xb7bec0, grava:0xa5a092, brecha:0xb1a47b,
    cobre:0xbc794c, ceramica:0x77482f, bobina:0xb13323, tren:0xe96523,
    vidrio:0x2b4b5c, luz:0xffebba, verde:0x529a67, aislador:0xd1c8aa,
  };
  for(const [nombre,color] of Object.entries(colores)) {
    materiales[nombre]=new T.MeshStandardMaterial({
      color, roughness:nombre==='vidrio'?.27:.79,
      metalness:['acero','metal','cobre'].includes(nombre)?.43:.03,
    });
  }
  superficies3D(materiales);
  const grupos = Object.fromEntries(['base','campo','cfe','portico','seat','cable','tr','rec','track','return','aux','aerea','lateral','llegadaMedia'].map(nombre=>[nombre,new T.Group()]));
  for(const [nombre,grupo] of Object.entries(grupos)) {
    grupo.name=nombre;
    escena.add(grupo);
  }
  function malla(grupo,geometria,material,x,y,z) {
    const objeto=new T.Mesh(geometria,materiales[material]);
    objeto.position.set(x,y,z);
    objeto.receiveShadow=true;
    objeto.castShadow=!['tierra','estrato','pasto','grava','brecha'].includes(material);
    grupo.add(objeto);
    return objeto;
  }
  function caja(g,x,y,z,w,h,d,m) {
    const geometria=new T.BoxGeometry(w,h,d);
    if(materiales[m].map) texturaCaja(geometria,w,h,d,m==='pasto'?4.2:m==='brecha'?2.8:1.75);
    return malla(g,geometria,m,x,y,z);
  }
  function cilindro(g,x,y,z,r,h,m) {
    return malla(g,new T.CylinderGeometry(r,r,h,18),m,x,y,z);
  }
  function varilla(g,inicio,fin,radio,m) {
    const a=new T.Vector3(...inicio),b=new T.Vector3(...fin);
    const centro=a.clone().add(b).multiplyScalar(.5);
    const pieza=cilindro(g,...centro,radio,a.distanceTo(b),m);
    pieza.quaternion.setFromUnitVectors(new T.Vector3(0,1,0),b.sub(a).normalize());
    return pieza;
  }
  function pasatapas(g,x,y,z) {
    cilindro(g,x,y+.27,z,.058,.54,'oscuro');
    for(let i=0;i<5;i++) cilindro(g,x,y+.07+i*.086,z,.115,.045,'ceramica');
    cilindro(g,x,y+.54,z,.078,.08,'cobre');
  }
  const {base,campo,cfe,portico,seat,cable,tr,rec,track,aux,aerea,lateral,llegadaMedia}=grupos;
  caja(base,19,-4.28,0,40.35,.22,9.2,'oscuro');
  caja(base,19,-3.71,0,40,1,9,'tierra');
  caja(base,5.5,-1.78,-.94,13,2.88,7.12,'estrato');
  caja(base,5.5,-.26,-.94,13,.19,7.12,'pasto');
  caja(base,25.5,-3.05,0,27,.32,8.2,'losa');
  // Grava del frente del terreno en una sola llamada de dibujo.
  const grava=new T.InstancedMesh(new T.DodecahedronGeometry(1,0),materiales.tierra,130);
  const matriz=new T.Matrix4();
  for(let i=0;i<130;i++) {
    const tam=.035+(i%9)*.009;
    matriz.makeScale(tam*1.6,tam,tam*.6);
    matriz.setPosition(-.6+(i*1.731)%39,-3.91+(i*.137)%1.33,4.52);
    grava.setMatrixAt(i,matriz);
  }
  base.add(grava);
  // Cuarto en corte, con fondo, cubierta recortada y losas.
  caja(base,17.8,-2.72,0,11.6,.2,7.6,'losa');
  caja(base,17.8,.05,-3.65,11.6,5.45,.27,'muro');
  caja(base,12.1,.05,-.15,.25,5.45,7.25,'muro');
  caja(base,17.8,2.78,-2.78,11.6,.24,2.03,'muro');
  for(let x=13;x<23;x+=1.15) caja(base,x,-2.612,0,.017,.006,7.2,'acero');
  for(const x of [14,17.7,21.4]) caja(base,x,2.61,-2.34,1.5,.09,.23,'luz');
  for(const y of [1.86,2.08,2.3]) {
    caja(base,17.8,y,-3.43,10.4,.075,.08,'cobre');
    for(const x of [13,15.5,18,20.5,22.6]) caja(base,x,y,-3.38,.045,.15,.055,'acero');
  }
  // Bóveda posterior. El frente abierto da acceso visual al tren y las vías.
  const arco=(a,r=3.5)=>[-.15+Math.cos(a)*r,-2.62+Math.sin(a)*r*1.45];
  for(let i=0;i<12;i++) {
    const a=Math.PI-i*.15,b=a-.15;
    const [za,ya]=arco(a),[zb,yb]=arco(b);
    const segmento=caja(base,31.25,(ya+yb)/2,(za+zb)/2,15.6,.23,Math.hypot(zb-za,yb-ya)+.025,'muro');
    segmento.rotation.x=-Math.atan2(yb-ya,zb-za);
  }
  for(const x of [23.5,26.6,29.7,32.8,35.9,39]) {
    for(let i=0;i<12;i++) {
      const [za,ya]=arco(Math.PI-i*.15,3.42),[zb,yb]=arco(Math.PI-(i+1)*.15,3.42);
      varilla(base,[x,ya,za],[x,yb,zb],.029,'acero');
    }
  }
  for(const x of [25,29,33,37]) caja(base,x,2,-1.38,1.1,.075,.18,'luz');
  // Torre y patio.
  const torre=new T.Group();
  construirTorre(torre,materiales.losa);
  for(const posicion of [torresCampo.origen,torresCampo.llegada]) {
    const montaje=new T.Group();
    montaje.position.set(...posicion);
    montaje.scale.setScalar(torresCampo.escala);
    const copia=torre.clone();
    copia.position.set(...origenTorre).negate();
    montaje.add(copia);
    cfe.add(montaje);
  }
  construirCampo284(campo,caja,materiales);
  const tono=new T.Color();
  const piedras=new T.InstancedMesh(new T.DodecahedronGeometry(1,0),new T.MeshStandardMaterial({
    color:0x9d9485,roughness:.97,
  }),220);
  piedras.receiveShadow=true;
  for(let i=0;i<piedras.count;i++) {
    const x=4.02+(i*.581)%6.25,z=-2.91+(i*.331)%5.21;
    const bajoTransformador=x>5.52&&x<8.88&&z>-1.65&&z<.8;
    const ancho=bajoTransformador?0:.018+(i%9)*.004;
    matriz.makeScale(ancho*1.43,ancho*.54,ancho);
    matriz.setPosition(x,.079,z);
    piedras.setMatrixAt(i,matriz);
    tono.setScalar(.58+(i%13)*.04);
    piedras.setColorAt(i,tono);
  }
  seat.add(piedras);
  caja(llegadaMedia,1.65,1,-.65,1.75,2.4,1.35,'acero');
  caja(llegadaMedia,1.65,1,.06,1.59,2.25,.12,'metal');
  caja(llegadaMedia,1.65,1.44,.14,.48,.23,.075,'oscuro');
  caja(seat,7.1,-.07,-.2,6.55,.25,5.8,'losa');
  caja(seat,7.1,.065,-.2,6.42,.025,5.66,'grava');
  caja(seat,7.2,.145,-.43,3.2,.14,2.38,'losa');
  construirReductor(seat);
  const postes=[[.71,-2.12],[4.42,1.38]];
  const [[x1,z1],[x2,z2]]=postes;
  for(const [x,z] of postes) {
    caja(portico,x,-.05,z,.88,.37,.88,'losa');
    caja(portico,x,3.77,z,.27,7.35,.28,'acero');
    caja(portico,x,3.77,z,.4,7.35,.085,'acero');
  }
  for(const {portico:[x,y,z]} of fases) {
    const viga=caja(portico,(x1+x2)/2,y-.57,(z1+z2)/2,Math.hypot(x2-x1,z2-z1)+.28,.15,.2,'acero');
    viga.rotation.y=-Math.atan2(z2-z1,x2-x1);
    pasatapas(portico,x,y-.54,z);
    varilla(portico,[x+.18,y-.51,z],[x+.18,.18,z],.082,'oscuro');
    caja(portico,x+.14,.02,z,.43,.34,.38,'losa');
  }
  varilla(portico,[x1,7.05,z1],[x2,5.74,z2],.042,'acero');
  varilla(portico,[x1,5.74,z1],[x2,7.05,z2],.042,'acero');
  caja(seat,8.94,.16,2.19,2.43,.12,.51,'losa');
  for(const x of [8.9,9.24,9.58]) {
    caja(seat,x,1.51,.4,.17,2.75,.14,'acero');
    pasatapas(seat,x,2.38,.4);
  }
  for(let x=4.15;x<10.6;x+=.45) {
    caja(seat,x,.42,2.65,.028,.78,.025,'acero');
    varilla(seat,[x,.06,2.65],[x+.44,.8,2.65],.012,'metal');
  }
  caja(seat,7.23,.84,2.65,6.55,.07,.07,'acero');
  for(const x of [4.15,10.4]) caja(seat,x,.55,2.65,.09,1.05,.09,'oscuro');
  const mallaCerca=[];
  for(let x=4.17;x<10.38;x+=.12) {
    const extremo=Math.min(x+.64,10.4);
    mallaCerca.push(x,.05,2.654,extremo,.05+(extremo-x)*1.16,2.654);
    const inicio=Math.max(x-.64,4.13);
    mallaCerca.push(x,.05,2.654,inicio,.05+(x-inicio)*1.16,2.654);
  }
  const geometriaCerca=new T.BufferGeometry();
  geometriaCerca.setAttribute('position',new T.Float32BufferAttribute(mallaCerca,3));
  seat.add(new T.LineSegments(geometriaCerca,new T.LineBasicMaterial({color:0x75817d})));
  // Transformador seco con tres devanados y ventiladores inferiores.
  caja(tr,14.76,-2.4,.15,3.1,.27,2.18,'oscuro');
  for(const x of [13.86,14.76,15.66]) {
    cilindro(tr,x,-.93,.1,.38,1.5,'bobina');
    for(const y of [-1.69,-.16]) cilindro(tr,x,y,.1,.41,.13,'oscuro');
    pasatapas(tr,x,-.08,.1);
    caja(tr,x,-.92,.49,.2,.19,.016,'aislador');
    const disco=cilindro(tr,x,-2.17,1.05,.27,.15,'acero');
    disco.rotation.x=Math.PI/2;
    for(let i=0;i<5;i++) {
      const angulo=i*Math.PI*2/5;
      const aspa=caja(tr,x+Math.cos(angulo)*.12,-2.17+Math.sin(angulo)*.12,1.146,.21,.058,.04,'oscuro');
      aspa.rotation.z=angulo;
    }
  }
  for(const y of [-1.88,.01]) caja(tr,14.76,y,.1,3.04,.19,.48,'oscuro');
  for(const y of [-.74,-.92,-1.1]) {
    caja(tr,16.15,y,.48,.22,.095,.15,'cobre');
    caja(rec,17.09,y,.82,.18,.105,.08,'oscuro');
  }
  function gabinete(g,x,w,alto,rejillas) {
    caja(g,x,-2.55+alto/2,0,w,alto,1.58,'acero');
    caja(g,x,-2.53+alto/2,.82,w-.12,alto-.17,.12,'metal');
    caja(g,x,-.91,.9,w*.38,.24,.06,'oscuro');
    caja(g,x+.16,-1.34,.94,.06,.27,.065,'oscuro');
    cilindro(g,x+.3,-1.18,.913,.048,.045,'verde').rotation.x=Math.PI/2;
    if(rejillas) for(const y of [-2.04,-.48]) for(let i=0;i<5;i++) {
      caja(g,x,y+i*.062,.9,w*.71,.031,.05,'oscuro');
    }
  }
  gabinete(rec,18.2,2.3,3.21,true);
  gabinete(rec,21.05,1.28,2.79,false);
  gabinete(aux,10.55,.88,2.65,false);
  aux.position.set(0,2.46,-1.5);
  // Vía, bastidores y tren.
  for(let x=23.8;x<39;x+=.56) {
    caja(base,x,-2.54,0,.18,.12,3.45,'oscuro');
    for(const z of [-.96,.96]) caja(base,x,-2.469,z,.205,.038,.25,'metal');
  }
  for(const z of [-.96,.96]) caja(grupos.return,31.4,-2.42,z,15.35,.11,.105,'acero');
  caja(lateral,31.4,-1.98,2.05,15.35,.13,.19,'metal');
  for(let x=23.8;x<39;x+=1.3) caja(lateral,x,-2.22,2.05,.12,.43,.14,'aislador');
  caja(lateral,27.55,-1.97,1.59,.27,.12,.9,'cobre').name='zapata-esquematica';
  for(const x of [24,30,36,38.8]) {
    caja(aerea,x,-.15,-1.98,.1,4.7,.13,'acero');
    caja(aerea,x,2.17,-.91,.085,.065,2.2,'acero');
  }
  caja(aerea,31.4,2.04,0,15.35,.05,.06,'cobre');
  for(const [a,b] of [[[29,.33,0],[29.6,1.16,0]],[[29.6,1.16,0],[29.08,2.04,0]],[[28.81,2.04,0],[29.34,2.04,0]]]) varilla(aerea,a,b,.043,'acero');
  for(const [inicio,largo,cabina] of [[25.65,6.26,true],[32.05,6.47,false]]) {
    const x=inicio+largo/2;
    caja(track,x,-.93,0,largo,2.25,2.76,'tren');
    caja(track,x,.24,0,largo-.14,.18,2.57,'oscuro');
    caja(track,x,-1.93,0,largo-.02,.35,2.81,'acero');
    if(cabina) {
      const frente=caja(track,inicio-.014,-.52,0,.08,.81,2.35,'vidrio');
      frente.rotation.z=-.065;
      caja(track,inicio-.075,-.11,0,.055,.17,.93,'oscuro');
      caja(track,inicio-.1,-1.79,0,.19,.24,.45,'oscuro');
      for(const z of [-.94,.94]) {
        caja(track,inicio-.051,-1.31,z,.062,.26,.39,'oscuro');
        caja(track,inicio-.09,-1.31,z,.061,.16,.26,'luz');
      }
    }
    for(const z of [-1.394,1.394]) {
      for(let i=0;i<5;i++) {
        const p=inicio+.76+i*1.17;
        if(i%2===1) {
          caja(track,p,-.96,z,.88,1.56,.045,'metal');
          for(const o of [-.23,.23]) caja(track,p+o,-.54,z*1.022,.33,.58,.027,'vidrio');
          caja(track,p,-.96,z*1.024,.027,1.56,.034,'oscuro');
          caja(track,p,-1.82,z,.78,.07,.046,'acero');
        } else {
          caja(track,p,-.56,z,.84,.72,.036,'oscuro');
          caja(track,p,-.56,z*1.021,.73,.61,.026,'vidrio');
        }
      }
      for(const px of [inicio+.91,inicio+1.54,inicio+largo-1.46,inicio+largo-.83]) {
        cilindro(track,px,-2.04,z*.82,.31,.24,'oscuro').rotation.x=Math.PI/2;
        cilindro(track,px,-2.04,z*.94,.155,.09,'acero').rotation.x=Math.PI/2;
      }
    }
  }
  caja(cable,11.94,-1.87,3.59,2.24,.12,.91,'losa');
  for(const x of [11.21,12.11,12.83]) caja(cable,x,-1.69,3.64,.085,.13,.78,'metal');
  return grupos;
}
