import * as T from 'three';
import {finishUV124} from './surface-finish124.js?v=194';
import {visualState105,watchVisual105} from './visual-settings105.js?v=105';

// A second, metre-sized layer leaves the authored UV0 artwork and PBR maps intact.
// RGB stores neutral surface variation; alpha stores signed roughness variation.
const profiles={
 paint:{family:'paint',metres:1.3,colour:.16,rough:.10},
 panel:{family:'paint',metres:1.1,colour:.10,rough:.10},
 brushed:{family:'metal',metres:.8,colour:.16,rough:.20},
 polished:{family:'metal',metres:.7,colour:.08,rough:.10},
 steel:{family:'metal',metres:.9,colour:.14,rough:.18},
 copper:{family:'metal',metres:.6,colour:.12,rough:.15},
 cast:{family:'cast',metres:.65,colour:.18,rough:.16},
 rubber:{family:'rubber',metres:.4,colour:.12,rough:.12},
 seat:{family:'rubber',metres:.55,colour:.09,rough:.12},
 ceramic:{family:'ceramic',metres:.7,colour:.10,rough:.10},
 floor:{family:'terrazzo',metres:1.7,colour:.32,rough:.18},
 mineral:{family:'concrete',metres:2.7,colour:.28,rough:.16},
 canvas:{family:'fabric',metres:.3,colour:.16,rough:.12},
 filter:{family:'fabric',metres:.22,colour:.08,rough:.08}
};
const textures=new Map(),bound=new WeakSet();
const enabled={value:visualState105().quality==='performance'?0:1};
watchVisual105(p=>{enabled.value=p.quality==='performance'?0:1;});
const fract=n=>n-Math.floor(n),smooth=n=>n*n*(3-2*n);
const hash=(x,y,seed)=>{let h=Math.imul(x+seed*157,374761393)^Math.imul(y+seed*53,668265263);h=Math.imul(h^(h>>>13),1274126177);return((h^(h>>>16))>>>0)/4294967295;};
function noise(u,v,cells,seed){
 const x=u*cells,y=v*cells,i=Math.floor(x),j=Math.floor(y),a=smooth(fract(x)),b=smooth(fract(y));
 const h=(x,y)=>hash((x+cells)%cells,(y+cells)%cells,seed);
 return T.MathUtils.lerp(T.MathUtils.lerp(h(i,j),h(i+1,j),a),T.MathUtils.lerp(h(i,j+1),h(i+1,j+1),a),b);
}
export function detailTexture205(family){
 if(textures.has(family))return textures.get(family);
 if(!Object.values(profiles).some(p=>p.family===family))return null;
 const size=256,data=new Uint8Array(size*size*4);
 for(let y=0;y<size;y++)for(let x=0;x<size;x++){
  const u=x/size,v=y/size,low=noise(u,v,4,3),mid=noise(u,v,18,5),fine=noise(u,v,72,9);
  let colour=.5+(low-.5)*.50+(mid-.5)*.30,rough=.5+(mid-.5)*.55;
  if(family==='metal'){
   // Longitudinal machining with sparse, short cross-grain handling marks.
   const grain=noise(u,v,128,21),line=noise(0,v,128,15),cross=Math.pow(Math.max(0,Math.cos(u*128*Math.PI)),28)*Math.max(0,mid-.55);
   colour=.5+(line-.5)*.60+(grain-.5)*.12-cross*.9;
   rough=.5+(line-.5)*.68+cross;
  }else if(family==='terrazzo'){
   const cells=48,cx=Math.floor(u*cells),cy=Math.floor(v*cells);let nearest=2,chip=.5;
   for(let oy=-1;oy<=1;oy++)for(let ox=-1;ox<=1;ox++){
    const ix=cx+ox,iy=cy+oy,jx=.12+.76*hash((ix+cells)%cells,(iy+cells)%cells,24),jy=.12+.76*hash((ix+cells)%cells,(iy+cells)%cells,25);
    const d=Math.hypot((u*cells-ix-jx)*1.1,v*cells-iy-jy);
    if(d<nearest){nearest=d;chip=hash((ix+cells)%cells,(iy+cells)%cells,26);}
   }
   const aggregate=T.MathUtils.smoothstep(.44-nearest,0,.20);
   colour=.5+(low-.5)*.20+(mid-.5)*.15+aggregate*(chip-.5)*1.35;
   rough=.5+(low-.5)*.20-aggregate*.18+(fine-.5)*.12;
  }else if(family==='concrete'){
   const pores=Math.max(0,fine-.64),flow=noise(u,v,8,19);
   colour=.5+(low-.5)*.7+(mid-.5)*.35-pores*.7;
   rough=.5+(flow-.5)*.55+pores;
  }else if(family==='fabric'){
   const weave=Math.cos(u*64*Math.PI)*Math.cos(v*64*Math.PI);
   colour=.5+(low-.5)*.30+weave*.13+(fine-.5)*.20;
   rough=.5+weave*.10+(mid-.5)*.30;
  }else if(family==='cast'){
   colour=.5+(mid-.5)*.55+(fine-.5)*.45;
   rough=.5+(mid-.5)*.6+(fine-.5)*.3;
  }else if(family==='rubber'){
   colour=.5+(mid-.5)*.3+(fine-.5)*.18;
   rough=.5+(low-.5)*.35+(mid-.5)*.35;
  }else if(family==='ceramic'){
   colour=.5+(low-.5)*.28+(mid-.5)*.10;
   rough=.5+(mid-.5)*.3+(fine-.5)*.1;
  }
  const i=(y*size+x)*4,c=Math.round(T.MathUtils.clamp(colour,0,1)*255);
  data.set([c,c,c,Math.round(T.MathUtils.clamp(rough,0,1)*255)],i);
 }
 const texture=new T.DataTexture(data,size,size,T.RGBAFormat);
 texture.name='Acabado multiescala205 · '+family;
 texture.wrapS=texture.wrapT=T.RepeatWrapping;texture.minFilter=T.LinearMipmapLinearFilter;
 texture.magFilter=T.LinearFilter;texture.generateMipmaps=true;texture.colorSpace=T.NoColorSpace;
 texture.anisotropy=4;texture.userData={quality100Shared:true,surface205:family};texture.needsUpdate=true;
 textures.set(family,texture);return texture;
}
function bind(material,kind){
 const profile=profiles[kind];if(!profile||bound.has(material))return material;
 const prior=material.onBeforeCompile,priorKey=material.customProgramCacheKey;
 const params=new T.Vector3(1/profile.metres,profile.colour,profile.rough);
 material.onBeforeCompile=function(shader,renderer){
  prior.call(this,shader,renderer);
  shader.uniforms.detailMap205={value:detailTexture205(profile.family)};
  shader.uniforms.detailParams205={value:params};shader.uniforms.detailEnabled205=enabled;
  shader.vertexShader=shader.vertexShader.replace('#include <common>',`#include <common>
   #ifndef USE_UV3
    attribute vec2 uv3;
   #endif
   varying vec2 vSurface205;`).replace('#include <uv_vertex>','#include <uv_vertex>\nvSurface205=uv3;');
  shader.fragmentShader=shader.fragmentShader.replace('#include <common>',`#include <common>
   uniform sampler2D detailMap205;
   uniform vec3 detailParams205;
   uniform float detailEnabled205;
   varying vec2 vSurface205;`)
   .replace('#include <color_fragment>',`#include <color_fragment>
    vec4 detail205=vec4(0.5);
    if(detailEnabled205>0.5)detail205=texture2D(detailMap205,vSurface205*detailParams205.x);
    diffuseColor.rgb*=vec3(1.0)+(detail205.rgb-vec3(0.5))*detailParams205.y;`)
   .replace('#include <roughnessmap_fragment>',`#include <roughnessmap_fragment>
    roughnessFactor=clamp(roughnessFactor+(detail205.a-0.5)*detailParams205.z,0.06,1.0);`);
 };
 material.customProgramCacheKey=function(){return priorKey.call(this)+'|surface205';};
 material.userData={...material.userData,surface205:{kind,family:profile.family,metres:profile.metres}};
 material.needsUpdate=true;bound.add(material);return material;
}
export function applySurfaceDetail205(mesh,material,kind=material?.userData.realism110){
 if(!material?.isMeshStandardMaterial||material.transparent||!profiles[kind])return material;
 finishUV124(mesh,kind);if(mesh.geometry.attributes.uv3)bind(material,kind);return material;
}
// Material.clone() preserves metadata and texture maps, but not shader callbacks.
export function inheritSurfaceDetail205(source,clone){
 const kind=source.userData.surface205?.kind;return kind?bind(clone,kind):clone;
}
export function surfaceDetailBudget205(){return{sets:textures.size,bytes:[...textures.values()].reduce((n,t)=>n+t.image.data.byteLength,0),enabled:enabled.value===1};}
