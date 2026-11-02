import * as T from 'three';
import {shadowModel130} from './photographic130.js?v=205';

// Fenómenos 226: physically motivated looks for the fault study scene, replacing cartoon cues.
// - Real shadows from the key light onto the reference floor.
// - Overheated cast resin darkens progressively from the top of the winding (where the heat
//   collects) with an irregular front, turning brown then charred; only the unprotected case
//   reaches small glowing embers in the charred zone.
// - Smoke as soft, turbulent puffs that grow, rotate, drift and thin out while they rise.

// Shadows: one 2048 px soft map fitted to the equipment and the floor around it.
export function studyShadows226(renderer,light,root,box){
 renderer.shadowMap.enabled=true;renderer.shadowMap.type=T.PCFSoftShadowMap;
 light.castShadow=true;light.shadow.mapSize.set(2048,2048);light.shadow.bias=-.0004;light.shadow.normalBias=.02;light.shadow.radius=3;
 const c=box.getCenter(new T.Vector3()),s=box.getSize(new T.Vector3()),r=Math.max(s.x,s.z)*.75+1.5;
 const dir=light.position.clone().sub(light.target.position).normalize();light.target.position.copy(c);light.position.copy(c).addScaledVector(dir,r*2.4);light.target.updateMatrixWorld();
 Object.assign(light.shadow.camera,{left:-r,right:r,top:r,bottom:-r,near:.1,far:r*5});light.shadow.camera.updateProjectionMatrix();light.shadow.needsUpdate=true;
 return shadowModel130(root,600);
}

// Scorch shader on an owned material. Uniforms are shared with the caller to drive it per frame.
export function scorchMaterial226(material,bottom,top){
 if(material.userData.scorch226)return material.userData.scorch226;
 const uniforms={uScorch:{value:0},uEmber:{value:0},uBottom:{value:bottom},uTop:{value:top}};
 const previous=material.onBeforeCompile,previousKey=material.customProgramCacheKey;
 material.onBeforeCompile=(shader,renderer)=>{
  previous?.call(material,shader,renderer);Object.assign(shader.uniforms,uniforms);
  shader.vertexShader='varying vec3 vWorld226;\n'+shader.vertexShader.replace('#include <project_vertex>','#include <project_vertex>\n vWorld226=(modelMatrix*vec4(transformed,1.0)).xyz;');
  shader.fragmentShader='varying vec3 vWorld226;\nuniform float uScorch,uEmber,uBottom,uTop;\nfloat h226(vec3 p){p=fract(p*.3183099+.1);p*=17.;return fract(p.x*p.y*p.z*(p.x+p.y+p.z));}\nfloat n226(vec3 x){vec3 i=floor(x),f=fract(x);f=f*f*(3.-2.*f);return mix(mix(mix(h226(i),h226(i+vec3(1,0,0)),f.x),mix(h226(i+vec3(0,1,0)),h226(i+vec3(1,1,0)),f.x),f.y),mix(mix(h226(i+vec3(0,0,1)),h226(i+vec3(1,0,1)),f.x),mix(h226(i+vec3(0,1,1)),h226(i+vec3(1,1,1)),f.x),f.y),f.z);}\nfloat fbm226(vec3 p){return .55*n226(p)+.3*n226(p*2.3)+.15*n226(p*5.1);}\n'+shader.fragmentShader
   .replace('#include <color_fragment>',`#include <color_fragment>
 float h=clamp((vWorld226.y-uBottom)/max(.001,uTop-uBottom),0.,1.),grain=fbm226(vWorld226*7.);
 float scorch226=clamp(uScorch*1.7-(1.-h)*1.05+(grain-.5)*.55,0.,1.);
 vec3 browned=diffuseColor.rgb*vec3(.55,.36,.22),charred=vec3(.035,.03,.026);
 diffuseColor.rgb=mix(diffuseColor.rgb,mix(browned,charred,smoothstep(.45,.95,scorch226)),smoothstep(0.,.6,scorch226));`)
   .replace('#include <roughnessmap_fragment>','#include <roughnessmap_fragment>\n roughnessFactor=mix(roughnessFactor,.95,smoothstep(.3,.9,scorch226));')
   .replace('#include <emissivemap_fragment>',`#include <emissivemap_fragment>
 float crack226=smoothstep(.70,.80,fbm226(vWorld226*23.+3.1));
 totalEmissiveRadiance+=vec3(1.,.28,.06)*uEmber*smoothstep(.8,1.,scorch226)*crack226*(1.6+.6*sin(vWorld226.y*40.));`);
 };
 material.customProgramCacheKey=()=>(previousKey?previousKey.call(material):'')+'|scorch226';material.needsUpdate=true;
 material.userData.scorch226=uniforms;return uniforms;
}
export function releaseScorch226(material){if(!material.userData.scorch226)return;material.userData.scorch226.uScorch.value=0;material.userData.scorch226.uEmber.value=0;}

// Soft turbulent puff texture, deterministic.
export function puffTexture226(size=128){
 const canvas=globalThis.document?.createElement?.('canvas');let texture;
 const ctx=canvas?.getContext?.('2d');
 if(ctx?.createRadialGradient?.(0,0,0,0,0,1)?.addColorStop){canvas.width=canvas.height=size;let seed=226;const rnd=()=>(seed=(seed*16807)%2147483647)/2147483647;
  for(let i=0;i<46;i++){const a=rnd()*Math.PI*2,d=rnd()*size*.22,x=size/2+Math.cos(a)*d,y=size/2+Math.sin(a)*d,r=size*(.1+rnd()*.22),g=ctx.createRadialGradient(x,y,0,x,y,r);g.addColorStop(0,`rgba(255,255,255,${.10+rnd()*.12})`);g.addColorStop(1,'rgba(255,255,255,0)');ctx.fillStyle=g;ctx.fillRect(0,0,size,size);}
  texture=new T.CanvasTexture(canvas);
 }else{const data=new Uint8Array(size*size*4);for(let y=0;y<size;y++)for(let x=0;x<size;x++){const r=Math.hypot(x/size-.5,y/size-.5)*2,n=(y*size+x)*4;data[n]=data[n+1]=data[n+2]=255;data[n+3]=255*Math.max(0,1-r)**2*.6;}texture=new T.DataTexture(data,size,size);}
 texture.needsUpdate=true;return texture;
}

// Rising smoke: puffs born at the given points, positions from absolute time (no drift on seek).
export class Smoke226{
 constructor(parent,texture,sources,count=36,drift=new T.Vector3()){
  this.sources=sources;this.drift=drift;this.group=new T.Group();this.group.name='Humo226';parent.add(this.group);this.materials=[];this.puffs=[];
  for(let i=0;i<count;i++){const m=new T.SpriteMaterial({map:texture,color:'#4b4c4a',transparent:true,opacity:0,depthWrite:false,rotation:i*1.7});this.materials.push(m);const o=new T.Sprite(m);this.group.add(o);this.puffs.push({o,phase:(i*.6180339)%1,src:i%sources.length,spin:(i%2?1:-1)*(.4+(i*.37)%1*.6),drift:(i*.77)%1-.5});}
 }
 apply(time,amount,height=1.6){
  this.group.visible=amount>.002;if(!this.group.visible)return;
  for(const p of this.puffs){const life=4.5,t=((time/life)+p.phase)%1,src=this.sources[p.src],rise=height*(t+.35*t*t),spread=.08+t*.55;
   p.o.position.set(src.x+p.drift*spread+Math.sin(time*.7+p.phase*9)*.08*t+this.drift.x*t,src.y+rise,src.z+Math.cos(time*.6+p.phase*7)*.06*t+this.drift.z*t);
   p.o.scale.setScalar(.18+t*1.1);p.o.material.rotation=p.spin*time*.35+p.phase*6;
   p.o.material.opacity=amount*Math.min(1,t*6)*(1-t)**1.4*.55;p.o.material.color.setScalar(.22+.25*t);}
 }
 dispose(){this.group.removeFromParent();for(const m of this.materials)m.dispose();}
}
