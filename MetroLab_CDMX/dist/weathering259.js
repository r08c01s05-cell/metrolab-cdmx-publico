import {visualState105,watchVisual105} from './visual-settings105.js?v=105';

// Desgaste y uso 259. Las superficies ya tenían textura fina (124) y variación por metro (205), pero
// todo se veía recién estrenado. Esta tercera capa agrega, en coordenadas del mundo, las marcas que
// deja el servicio: escurrimientos, hollín y sales en el concreto del túnel; polvo de frenado y
// manchas de aceite en los durmientes; hule depositado en las pistas de rodamiento; óxido en el alma
// de los rieles; y zonas pulidas por el paso de la gente en los pisos de andén.
// Se calcula en el sombreador, sin imágenes nuevas, así que no ocupa memoria de texturas. Es un
// acabado ilustrativo: no representa el estado real de ninguna estación. Se apaga en «rendimiento».
export const WEATHER_KINDS259=Object.freeze({tunnel:1,sleeper:2,runway:3,rail:4,guide:5,floor:6,wall:7});
const plain=s=>String(s||'').normalize('NFD').replace(/[̀-ͯ]/g,'').toLowerCase();
// Which layer a material gets, from its name and the role the station finish gave it.
export function weatherKind259(material){
 if(!material?.isMeshStandardMaterial||material.transparent)return 0;
 const name=plain(material.name),role=material.userData?.referenceRole213,kind=material.userData?.realism110;
 if(/label|glass|diffuser/.test(kind||''))return 0;
 if(/concreto tunel/.test(name))return WEATHER_KINDS259.tunnel;
 if(/concreto durmientes/.test(name))return WEATHER_KINDS259.sleeper;
 if(/pista rodamiento/.test(name))return WEATHER_KINDS259.runway;
 if(/acero (alma )?riel/.test(name))return WEATHER_KINDS259.rail;
 if(/barra guia/.test(name))return WEATHER_KINDS259.guide;
 if(/acero|aluminio|metal|vidrio|borde|franja/.test(name))return 0;
 if(/piso|pavimento|loseta|terrazo/.test(name))return WEATHER_KINDS259.floor;
 if(role==='wall'||role==='column'||/revestimiento|concreto fino/.test(name))return WEATHER_KINDS259.wall;
 return 0;
}
const enabled={value:visualState105().quality==='performance'?0:1};
watchVisual105(p=>{enabled.value=p.quality==='performance'?0:1;});
const seen=new WeakSet(),bound=new WeakSet();

const FRAGMENT_HEAD=`
 uniform float weatherEnabled259;
 varying vec3 vWorld259;
 float h259(vec2 p){return fract(sin(dot(p,vec2(127.1,311.7)))*43758.5453);}
 float n259(vec2 p){vec2 i=floor(p),f=fract(p);f=f*f*(3.0-2.0*f);return mix(mix(h259(i),h259(i+vec2(1.0,0.0)),f.x),mix(h259(i+vec2(0.0,1.0)),h259(i+vec2(1.0,1.0)),f.x),f.y);}`;
const FRAGMENT_BODY=`
 float rough259=0.0;
 if(weatherEnabled259>0.5){
  vec3 p259=vWorld259,nrm259=normalize(cross(dFdx(p259),dFdy(p259)));
  float up259=abs(nrm259.y),along259=p259.x*0.83+p259.z*0.56,across259=p259.z*0.83-p259.x*0.56;
  #if WEATHER259==1
   // Tunnel lining: run-off streaks, soot near the track, lime deposits, broad patches.
   float wall=1.0-smoothstep(0.35,0.7,up259);
   float streak=smoothstep(0.5,0.85,n259(vec2(along259*2.3,p259.y*0.18)))*smoothstep(0.25,0.75,n259(vec2(along259*0.21,3.7)));
   float soot=1.0-smoothstep(0.2,2.3,p259.y);
   float patch259=n259(vec2(along259*0.13,p259.y*0.35+across259*0.05))-0.5;
   float roofSoot=(1.0-wall)*smoothstep(2.6,3.4,p259.y)*(0.06+0.10*n259(vec2(along259*0.4,across259*0.6)));
   diffuseColor.rgb*=(1.0-wall*(streak*0.40+soot*0.30)-roofSoot+patch259*0.16)*mix(vec3(1.0),vec3(0.82,0.76,0.66),clamp(wall*streak*0.6+soot*0.25,0.0,1.0));
   float salt=smoothstep(0.78,0.95,n259(vec2(along259*1.1+17.0,p259.y*0.25)))*wall*n259(vec2(along259*0.09,9.1));
   diffuseColor.rgb=mix(diffuseColor.rgb,vec3(0.86,0.86,0.82),salt*0.35);
   rough259=-streak*wall*0.10;
  #elif WEATHER259==2
   // Sleepers and track bed: brake dust and oil stains.
   float oil=smoothstep(0.5,0.88,n259(p259.xz*0.9))*0.26,dust=n259(p259.xz*0.17)-0.5;
   diffuseColor.rgb*=(0.93-oil+dust*0.14)*vec3(0.96,0.90,0.83);
   rough259=-oil*0.9;
  #elif WEATHER259==3
   // Running tracks: rubber laid down by the tyres on top, rust on the sides.
   float top=smoothstep(0.6,0.9,up259),band=n259(vec2(along259*0.5,across259*9.0));
   diffuseColor.rgb=mix(diffuseColor.rgb,vec3(0.05,0.05,0.055),top*(0.42+0.22*band));
   diffuseColor.rgb=mix(diffuseColor.rgb,vec3(0.30,0.17,0.09),(1.0-top)*(0.30+0.40*n259(vec2(along259*1.3,p259.y*6.0))));
   rough259=top*0.22+(1.0-top)*0.18;
  #elif WEATHER259==4
   // Safety rails: bright running surface, rusty web and foot.
   float top=smoothstep(0.75,0.95,up259);
   diffuseColor.rgb=mix(diffuseColor.rgb,vec3(0.29,0.16,0.085),(1.0-top)*(0.38+0.34*n259(vec2(along259*1.7,p259.y*9.0))));
   rough259=(1.0-top)*0.22-top*0.10;
  #elif WEATHER259==5
   // Guide bars: the shoes keep the contact faces clean; only a light film elsewhere.
   float film=n259(vec2(along259*0.9,p259.y*5.0));
   diffuseColor.rgb=mix(diffuseColor.rgb,vec3(0.26,0.16,0.10),up259*0.22*film);
   rough259=up259*0.12*film;
  #elif WEATHER259==6
   // Platform floors: paths polished by foot traffic and faint scuffing.
   float flat259=smoothstep(0.6,0.9,up259),wear=n259(p259.xz*0.35),scuff=smoothstep(0.6,0.9,n259(p259.xz*vec2(2.1,0.6)));
   diffuseColor.rgb*=1.0+flat259*((wear-0.5)*0.13-scuff*0.06);
   rough259=-flat259*(wear-0.35)*0.20;
  #elif WEATHER259==7
   // Station walls and columns: uneven ageing and faint vertical marks.
   float wall=1.0-smoothstep(0.35,0.7,up259);
   float age=n259(vec2(along259*0.3,p259.y*0.4))-0.5,mark=smoothstep(0.7,0.95,n259(vec2(along259*3.1,p259.y*0.22)));
   diffuseColor.rgb*=1.0+wall*(age*0.10-mark*0.07);
  #endif
 }`;

export function bindWeather259(material,kind){
 if(!kind||bound.has(material))return material;
 const prior=material.onBeforeCompile,priorKey=material.customProgramCacheKey;
 material.onBeforeCompile=function(shader,renderer){
  prior.call(this,shader,renderer);
  if(shader.fragmentShader.includes('vWorld259'))return; // a clone made from an already patched shader
  shader.uniforms.weatherEnabled259=enabled;
  shader.vertexShader=shader.vertexShader.replace('#include <common>','#include <common>\nvarying vec3 vWorld259;').replace('#include <project_vertex>',`#include <project_vertex>
   vec4 wp259=vec4(transformed,1.0);
   #ifdef USE_BATCHING
    wp259=batchingMatrix*wp259;
   #endif
   #ifdef USE_INSTANCING
    wp259=instanceMatrix*wp259;
   #endif
   vWorld259=(modelMatrix*wp259).xyz;`);
  shader.fragmentShader=shader.fragmentShader.replace('#include <common>','#include <common>\n#define WEATHER259 '+kind+FRAGMENT_HEAD)
   .replace('#include <color_fragment>','#include <color_fragment>'+FRAGMENT_BODY)
   .replace('#include <roughnessmap_fragment>','#include <roughnessmap_fragment>\nroughnessFactor=clamp(roughnessFactor+rough259,0.05,1.0);');
 };
 material.customProgramCacheKey=function(){return priorKey.call(this)+'|weather259:'+kind;};
 material.userData={...material.userData,weather259:kind};material.needsUpdate=true;bound.add(material);return material;
}
// Bind every matching material under a root. Each material is examined once. Trains and people
// are skipped: they move, and a layer fixed to the world would slide over them.
const SKIP=/^Pasajeros|^Contacto_suelo/;
export function weatherRoot259(root,skip=null){
 let added=0;
 const walk=o=>{if(!o||SKIP.test(o.name)||skip?.has(o))return;
  if(o.isMesh){const list=Array.isArray(o.material)?o.material:[o.material];for(const m of list){if(!m||seen.has(m))continue;seen.add(m);const kind=weatherKind259(m);if(kind){bindWeather259(m,kind);added++;}}}
  for(const c of o.children)walk(c);};
 walk(root);return added;
}
// Stations and tunnels are built as the train advances and several finishing passes clone their
// materials, so the view sweeps its infrastructure now and then for materials that are still new.
export function updateWeathering259(view,every=90){
 view.weatherFrame259=(view.weatherFrame259||0)+1;if(view.weatherFrame259%every!==1)return 0;
 const trains=new Set();for(const m of view.trainMeshes?.values?.()||[])trains.add(m.group);const added=weatherRoot259(view.scene,trains);view.weatherBound259=(view.weatherBound259||0)+added;return added;
}
export const weatheringEnabled259=()=>enabled.value===1;
