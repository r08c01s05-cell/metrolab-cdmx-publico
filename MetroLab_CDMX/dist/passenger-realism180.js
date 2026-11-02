import * as T from 'three';
// Cabello 225: the hair cards ship with a 512 px map of single-pixel strands whose alpha never
// reaches 1. Cut out with alpha testing, most strand pixels fall below the threshold and the hair
// renders as scattered dots ("static"). The map is rebuilt once: strands are softened into locks,
// their coverage is raised, and empty texels take the mean strand colour so mipmaps keep no halo.
const hairMaps225=new WeakMap();
export function hairMap225(texture){
 if(!texture?.image)return texture;if(hairMaps225.has(texture))return hairMaps225.get(texture);
 let result=texture;
 try{
  const img=texture.image,w=img.width||img.videoWidth,h=img.height||img.videoHeight;if(!w||!h)throw 0;
  const canvas=typeof OffscreenCanvas!=='undefined'?new OffscreenCanvas(w,h):globalThis.document?.createElement?.('canvas');if(!canvas)throw 0;canvas.width=w;canvas.height=h;
  const ctx=canvas.getContext('2d',{willReadFrequently:true});ctx.filter='blur('+Math.max(1,w/400).toFixed(2)+'px)';ctx.drawImage(img,0,0,w,h);ctx.filter='none';ctx.drawImage(img,0,0,w,h);
  const data=ctx.getImageData(0,0,w,h),px=data.data;let r=0,g=0,b=0,n=0;
  for(let i=0;i<px.length;i+=4)if(px[i+3]>24){r+=px[i];g+=px[i+1];b+=px[i+2];n++;}
  if(!n)throw 0;r/=n;g/=n;b/=n;
  for(let i=0;i<px.length;i+=4){const a=px[i+3];px[i+3]=Math.min(255,a*HAIR_GAIN225);if(a<24){const t=a/24;px[i]=r+(px[i]-r)*t;px[i+1]=g+(px[i+1]-g)*t;px[i+2]=b+(px[i+2]-b)*t;}}
  ctx.putImageData(data,0,0);
  result=new T.CanvasTexture(canvas);for(const key of ['flipY','colorSpace','wrapS','wrapT','channel','magFilter','minFilter'])result[key]=texture[key];result.anisotropy=Math.max(4,texture.anisotropy||1);result.repeat.copy(texture.repeat);result.offset.copy(texture.offset);result.needsUpdate=true;
 }catch{result=texture;}
 hairMaps225.set(texture,result);return result;
}
// The higher cut-off only applies to a rebuilt map; without a canvas the original map keeps .18.
export const HAIR_GAIN225=3.2,HAIR_CUTOFF225=.42;
// Retain textures, rigs and walking clips; refine the exaggerated child head/eyes in bind space.
export function refinePassengers180(template,record){const child=record.kind137==='child';template.scene.traverse(o=>{if(!o.isMesh)return;for(const m of Array.isArray(o.material)?o.material:[o.material]){if(/hair|strand/i.test(m.name)&&!m.userData.hair225&&m.map){m.userData.hair225=true;const source=m.map;m.map=hairMap225(source);m.alphaTest=m.map!==source?HAIR_CUTOFF225:.18;m.depthWrite=true;m.alphaToCoverage=true;m.transparent=false;m.opacity=1;m.side=T.DoubleSide;m.roughness=.82;m.forceSinglePass=true;if(/hair[123]_m|strand[12]_m/.test(m.name))m.color.set('#40312a');}if(/skin|face|arms|hands/i.test(m.name)){m.metalness=0;m.roughness=Math.min(.78,Math.max(.58,m.roughness));m.envMapIntensity=.38;if(m.map){m.map.anisotropy=Math.max(4,m.map.anisotropy||1);m.map.needsUpdate=true;}}}if(!child||o.userData.natural180)return;const g=o.geometry.clone(),p=g.attributes.position,name=o.name,eye=/CC_Base_Eye|Eye.lash|Eyebrows/i.test(name);for(let i=0;i<p.count;i++){let x=p.getX(i),y=p.getY(i),z=p.getZ(i);if(y>1.39){const blend=T.MathUtils.smoothstep(y,1.39,1.46);if(eye){const cx=x<0?-.053:.050,cy=/Eyebrows/.test(name)?1.584:1.540;x=cx+(x-cx)*.59;y=cy+(y-cy)*.62;z=.04+(z-.04)*.72;}else if(/Body/.test(name)&&z>.025&&y>1.48&&y<1.60&&Math.abs(x)>.025&&Math.abs(x)<.10){const cx=x<0?-.053:.050,w=Math.exp(-(((x-cx)/.047)**2)-(((y-1.540)/.052)**2))*.42;x=cx+(x-cx)*(1-w);y=1.540+(y-1.540)*(1-w);}x*=1-.14*blend;y=1.39+(y-1.39)*(1-.09*blend);z*=1-.12*blend;}p.setXYZ(i,x,y,z);}p.needsUpdate=true;g.computeVertexNormals();g.computeBoundingBox();g.computeBoundingSphere();o.geometry=g;o.userData.natural180=true;});template.natural180=true;}
