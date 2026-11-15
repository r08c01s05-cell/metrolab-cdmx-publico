import * as T from 'three';

// Variación reproducible en el campo, con grano fino y manchas de mayor escala.
function ruido(x,y) {
  let valor=Math.imul(x,374761393)+Math.imul(y,668265263);
  valor=Math.imul(valor^(valor>>>13),1274126177);
  return ((valor^(valor>>>16))>>>0)/4294967295;
}

function manchas(u,v,periodo) {
  const x=Math.floor(u*periodo),y=Math.floor(v*periodo);
  let dx=u*periodo-x,dy=v*periodo-y;
  dx=dx*dx*(3-2*dx);
  dy=dy*dy*(3-2*dy);
  const muestra=(a,b)=>ruido(a%periodo,b%periodo);
  return T.MathUtils.lerp(
    T.MathUtils.lerp(muestra(x,y),muestra(x+1,y),dx),
    T.MathUtils.lerp(muestra(x,y+1),muestra(x+1,y+1),dx),dy,
  );
}

export function superficies3D(materiales) {
  const perfiles={
    tierra:[[164,140,119],.42,.19,.10], estrato:[[164,140,119],.32,.16,.08],
    pasto:[[178,176,146],.37,.27,.07], grava:[[193,185,166],.12,.33,.12],
    brecha:[[193,179,153],.23,.19,.06], muro:[[212,210,199],.13,.15,.023],
    losa:[[214,210,197],.12,.17,.027],
  };
  const lado=192;
  for(const [nombre,[color,variacion,grano,relieve]] of Object.entries(perfiles)) {
    const albedo=new Uint8Array(lado*lado*4), altura=new Uint8Array(albedo.length);
    for(let y=0;y<lado;y++) for(let x=0;x<lado;x++) {
      const u=x/lado,v=y/lado,detalle=ruido(x+23,y+71)-.5;
      const amplio=manchas(u,v,5)-.5;
      const fino=manchas(u,v,32)-.5;
      const brillo=1+amplio*variacion+fino*grano+detalle*grano*.53;
      const c=(y*lado+x)*4;
      albedo.set([...color.map((valor,i)=>Math.min(255,valor*brillo+(i===0?amplio*9:0))),255],c);
      const b=128+fino*100+detalle*65;
      altura.set([b,b,b,255],c);
    }
    const texturas=[albedo,altura].map(datos=>{
      const textura=new T.DataTexture(datos,lado,lado);
      textura.wrapS=textura.wrapT=T.RepeatWrapping;
      textura.magFilter=T.LinearFilter;
      textura.minFilter=T.LinearMipmapLinearFilter;
      textura.generateMipmaps=true;
      textura.anisotropy=4;
      textura.needsUpdate=true;
      return textura;
    });
    texturas[0].colorSpace=T.SRGBColorSpace;
    materiales[nombre].map=texturas[0];
    materiales[nombre].bumpMap=texturas[1];
    materiales[nombre].bumpScale=relieve;
    // El mapa multiplica el color base del material.
    materiales[nombre].color.lerp(new T.Color(0xffffff),.54);
  }
}

export function texturaCaja(geometria,ancho,alto,fondo,metros) {
  const uv=geometria.attributes.uv;
  const caras=[[fondo,alto],[fondo,alto],[ancho,fondo],[ancho,fondo],[ancho,alto],[ancho,alto]];
  for(const [cara,[u,v]] of caras.entries()) for(let punto=0;punto<4;punto++) {
    const i=cara*4+punto;
    uv.setXY(i,uv.getX(i)*u/metros,uv.getY(i)*v/metros);
  }
}
