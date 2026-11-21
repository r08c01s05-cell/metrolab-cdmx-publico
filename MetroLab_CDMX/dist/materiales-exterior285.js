import * as T from 'three';

const specs={
 concreto:{base:222,grain:21,roughness:.88,bump:.048},
 aplanado:{base:235,grain:15,roughness:.83,bump:.02},
 ladrillo:{base:216,grain:15,roughness:.89,bump:.038},
 metal:{base:232,grain:10,roughness:.54,bump:.025,metalness:.25},
 terracota:{base:227,grain:13,roughness:.67,bump:.052,metalness:.15},
 asfalto:{base:203,grain:44,roughness:.98,bump:.038},
 loseta:{base:229,grain:13,roughness:.85,bump:.019},
 tierra:{base:207,grain:42,roughness:.97,bump:.09}
};
const pixels=new Map();

function hash(x,y){
 const k=Math.imul(x+17,374761393)+Math.imul(y+29,668265263);
 const h=Math.imul(k^(k>>>13),1274126177);
 return ((h^(h>>>16))>>>0)/4294967295;
}
function manchas(x,y,periodo){
 const fx=x*periodo/128,fy=y*periodo/128,i=Math.floor(fx),j=Math.floor(fy);
 const u=T.MathUtils.smoothstep(fx-i,0,1),v=T.MathUtils.smoothstep(fy-j,0,1);
 const sample=(a,b)=>hash(a%periodo,b%periodo);
 return T.MathUtils.lerp(T.MathUtils.lerp(sample(i,j),sample(i+1,j),u),T.MathUtils.lerp(sample(i,j+1),sample(i+1,j+1),u),v)-.5;
}
function canales(tipo,spec){
 if(pixels.has(tipo))return pixels.get(tipo);
 const albedo=new Uint8Array(128*128*4),height=new Uint8Array(albedo.length);
 for(let y=0;y<128;y++)for(let x=0;x<128;x++){
  const broad=manchas(x,y,4),fine=manchas(x,y,23),grain=hash(x,y)-.5;
  let joint=0,tile=0;
  if(tipo==='ladrillo'){
   const row=y>>4,col=(x+(row%2)*16)%32;
   joint=y%16<2||col<2?1:0;
   tile=hash(Math.floor((x+(row%2)*16)/32)%4,row%8)-.5;
  }else if(tipo==='loseta'){
   joint=x%32<2||y%32<2?1:0;
   tile=hash(x>>5,y>>5)-.5;
  }else if(tipo==='terracota'){
   joint=x%16===0?.80:x%16===1?.36:0;
   tile=(hash(x>>4,2)-.5)*.6;
  }else if(tipo==='metal'){
   joint=x<2?.55:0;
  }
  const tone=T.MathUtils.clamp(spec.base+grain*spec.grain+broad*30+fine*24+tile*35-joint*45,0,255);
  const depth=T.MathUtils.clamp(141+grain*52+fine*65-joint*92,0,255);
  const i=(y*128+x)*4;
  albedo.set([tone,tone,tone,255],i);height.set([depth,depth,depth,255],i);
 }
 const result=[albedo,height];pixels.set(tipo,result);
 return result;
}
export function exteriorMaterial285(tipo,color,meters=1){
 const spec=specs[tipo];
 const material=new T.MeshStandardMaterial({
  name:'Exterior · '+tipo,color,roughness:spec?.roughness??(tipo==='cristal'?.27:.79),
  metalness:spec?.metalness??(tipo==='cristal'?.24:0)
 });
 if(!spec)return material;
 const [map,bumpMap]=canales(tipo,spec).map((data,index)=>{
  const texture=new T.DataTexture(data,128,128);
  texture.wrapS=texture.wrapT=T.RepeatWrapping;
  texture.repeat.setScalar(1/meters);
  texture.magFilter=T.LinearFilter;texture.minFilter=T.LinearMipmapLinearFilter;
  texture.generateMipmaps=true;texture.anisotropy=4;
  if(!index)texture.colorSpace=T.SRGBColorSpace;
  texture.needsUpdate=true;
  return texture;
 });
 Object.assign(material,{map,bumpMap,bumpScale:spec.bump});
 return material;
}

export const repetirExterior285={concreto:4,aplanado:3,ladrillo:1.18,metal:2.4,terracota:2.6,asfalto:5,loseta:2.4,tierra:8};
