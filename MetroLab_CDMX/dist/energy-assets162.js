import * as T from 'three';
import {inheritSurfaceDetail205} from './surface-detail205.js?v=205';
import {trainAsset} from './depot86.js?v=264';
import {GLTFLoader} from './vendor/GLTFLoader.js';
import {loadCompressedGLB} from './compressed-assets89.js?v=204';
import {partCategory} from './workshop-core.js?v=112';
let ballast162;function ballastMap99(){if(ballast162)return ballast162;const c=document.createElement('canvas'),ctx=c.getContext('2d');if(!ctx?.createImageData)return null;c.width=c.height=128;const im=ctx.createImageData(128,128);let seed=162;for(let i=0;i<im.data.length;i+=4){seed=(1664525*seed+1013904223)>>>0;const g=62+seed%67;im.data.set([g+7,g+6,g+2,255],i);}ctx.putImageData(im,0,0);ballast162=new T.CanvasTexture(c);ballast162.wrapS=ballast162.wrapT=T.RepeatWrapping;ballast162.colorSpace=T.SRGBColorSpace;return ballast162;}

// Clip actual asset triangles to a finite longitudinal study segment. Attribute
// interpolation preserves the authored surface UVs, normals and paint finishes.
export function cropGeometry162(source,matrix,min=-3,max=3){
 const baked=source.clone();
 // GLB assets use normalized integer positions. Transforming those buffers in
 // place clamps world coordinates to [-1,1]; expand before baking any matrix.
 for(const key of['position','normal','tangent']){const a=baked.attributes[key];if(!a)continue;const values=new Float32Array(a.count*a.itemSize);for(let i=0;i<a.count;i++)for(let j=0;j<a.itemSize;j++)values[i*a.itemSize+j]=a[['getX','getY','getZ','getW'][j]](i);baked.setAttribute(key,new T.Float32BufferAttribute(values,a.itemSize));}
 baked.applyMatrix4(matrix);baked.computeBoundingBox();
 if(matrix.determinant()<0){const indices=baked.index?Array.from(baked.index.array):Array.from({length:baked.attributes.position.count},(_,i)=>i);for(let i=0;i<indices.length;i+=3)[indices[i+1],indices[i+2]]=[indices[i+2],indices[i+1]];baked.setIndex(indices);}
 if(baked.boundingBox.max.z<min||baked.boundingBox.min.z>max){baked.dispose();return null;}
 if(baked.boundingBox.min.z>=min&&baked.boundingBox.max.z<=max)return baked;
 const geo=baked.index?baked.toNonIndexed():baked,names=Object.keys(geo.attributes).filter(k=>geo.attributes[k].itemSize<=4),result=Object.fromEntries(names.map(k=>[k,[]])),count=geo.attributes.position.count;
 const read=i=>Object.fromEntries(names.map(k=>{const a=geo.attributes[k];return[k,Array.from({length:a.itemSize},(_,j)=>a[['getX','getY','getZ','getW'][j]](i))];}));
 const mix=(a,b,t)=>Object.fromEntries(names.map(k=>[k,a[k].map((v,j)=>v+(b[k][j]-v)*t)]));
 function clip(poly,bound,sign){const out=[];for(let i=0;i<poly.length;i++){const a=poly[i],b=poly[(i+1)%poly.length],da=(a.position[2]-bound)*sign,db=(b.position[2]-bound)*sign;if(da>=-1e-7)out.push(a);if((da>=0)!==(db>=0))out.push(mix(a,b,da/(da-db)));}return out;}
 for(let i=0;i<count;i+=3){let poly=clip([read(i),read(i+1),read(i+2)],min,1);if(poly.length)poly=clip(poly,max,-1);for(let j=1;j<poly.length-1;j++)for(const v of[poly[0],poly[j],poly[j+1]])for(const k of names)result[k].push(...v[k]);}
 const out=new T.BufferGeometry();for(const k of names)out.setAttribute(k,new T.Float32BufferAttribute(result[k],geo.attributes[k].itemSize));out.normalizeNormals();out.computeBoundingBox();out.computeBoundingSphere();if(geo!==baked)geo.dispose();baked.dispose();return out.attributes.position.count?out:(out.dispose(),null);
}
let trackTask;
function stationTrack(){return trackTask??=(async()=>{const g=await loadCompressedGLB(new GLTFLoader(),'models/andenes/L1/L1_02_Zaragoza.glb');g.scene.updateMatrixWorld(true);return g.scene;})().catch(e=>{trackTask=null;throw e;});}
const TRACK_NAMES=/^(Barra gu[ií]a|Base de v[ií]a|Lecho de v[ií]a|Pista de rodamiento|Riel de respaldo|Riel de seguridad|Durmiente)([. _0-9]|$)/i;
function clear(group){for(const o of [...group.children]){o.traverse(n=>n.geometry?.dispose());o.removeFromParent();}}
export async function detailedEnergy162(base,type,id='NM22'){
 const [source,trackSource]=await Promise.all([trainAsset(id,'intermedio'),stationTrack()]);
 const materials=new Map(),owned=new Set(),bodyMaterials=new Set(),motorParts=[],groups=base.groups;
 function mat(source,part){const key=source.uuid+part;if(!materials.has(key)){const m=source.clone();inheritSurfaceDetail205(source,m);if(part==='body'){m.side=T.DoubleSide;bodyMaterials.add(m);}materials.set(key,m);owned.add(m);}return materials.get(key);}
 for(const key of['body','track',...(type==='pneumatic'?['collector']:[])])clear(groups.get(key));
 if(type==='pneumatic')clear(groups.get('bogie'));
 else{
  // An aerial supply is a didactic comparison. The available fleet bodies are
  // pneumatic; no claim is made that their original bogie is a steel-wheel train.
  for(const o of [...groups.get('bogie').children])if(o.geometry?.type==='CylinderGeometry'&&o.geometry.parameters.radiusTop<.3){o.geometry.dispose();o.removeFromParent();}
 }
 source.updateMatrixWorld(true);const rotation=new T.Matrix4().makeRotationY(Math.PI/2),shift=new T.Matrix4().makeTranslation(5.7,.0,0),normalization=rotation.clone().multiply(shift);
 let actual=0;
 source.traverse(o=>{if(!o.isMesh)return;for(let n=o;n;n=n.parent)if(!n.visible)return;
  const family=o.userData.familia_visual||'',category=partCategory(o.name,family),motor=category==='motors',collector=category==='collectors';
  let part=collector?'collector':motor||category==='mechanics'?'bogie':'body';
  if(type!=='pneumatic'&&(collector||part==='bogie'&&!motor))return;
  const matrix=normalization.clone().multiply(o.matrixWorld),geo=cropGeometry162(o.geometry,matrix,-3,3);if(!geo)return;
  const m=mat(Array.isArray(o.material)?o.material[0]:o.material,part),mesh=new T.Mesh(geo,m);mesh.name=o.name;mesh.userData={...o.userData,actualAsset162:true};groups.get(part).add(mesh);actual++;
  if(motor&&o.userData.motorExplode90){const v=new T.Vector3(...o.userData.motorExplode90).applyMatrix4(rotation);motorParts.push({mesh,v});}
 });
 const trackRotation=new T.Matrix4().makeRotationY(Math.PI/2).multiply(new T.Matrix4().makeTranslation(0,0,-1.8));let trackCount=0;
 trackSource.traverse(o=>{if(!o.isMesh||!TRACK_NAMES.test(o.name.replaceAll('_',' ')))return;const name=o.name.replaceAll('_',' '),b=new T.Box3().setFromObject(o),center=b.getCenter(new T.Vector3());if(center.z<.2||center.z>3.35)return;if(type==='overhead'&&/Pista|Barra gu/i.test(name))return;
  const geo=cropGeometry162(o.geometry,trackRotation.clone().multiply(o.matrixWorld),-3.6,3.6);if(!geo)return;
  const part=/Barra gu/i.test(name)?'supply':'track',material=mat(Array.isArray(o.material)?o.material[0]:o.material,part);
  if(/Lecho|Base de v/i.test(name)){material.map=ballastMap99();material.color.set('#c1c0af');material.roughness=1;material.metalness=0;const p=geo.attributes.position,uv=new Float32Array(p.count*2);for(let i=0;i<p.count;i++){uv[i*2]=p.getX(i)/.5;uv[i*2+1]=p.getZ(i)/.5;}geo.setAttribute('uv',new T.BufferAttribute(uv,2));}
  const mesh=new T.Mesh(geo,material);mesh.name=o.name;mesh.userData.actualTrack162=true;groups.get(part).add(mesh);trackCount++;
 });
 if(!actual||!trackCount)throw Error('Los activos detallados no contienen los conjuntos esperados.');
 // Replace the schematic guide bars with the same native bars as the track.
 if(type==='pneumatic')for(const o of [...groups.get('supply').children])if(!o.userData.actualTrack162){o.geometry?.dispose();o.removeFromParent();}
 if(type==='pneumatic'){const bar=groups.get('supply').children.find(o=>o.userData.actualTrack162);if(bar){const other=bar.clone();other.geometry=bar.geometry.clone();other.scale.x=-1;other.name='Barra guía · lado opuesto';groups.get('supply').add(other);}}
 const sleeperMat=new T.MeshStandardMaterial({name:'Concreto de durmientes',color:'#85867d',roughness:.95}),fixingMat=new T.MeshStandardMaterial({name:'Fundición de fijaciones',color:'#424a46',metalness:.6,roughness:.6});owned.add(sleeperMat);owned.add(fixingMat);
 for(let z=-3.3;z<=3.4;z+=.6){const tie=new T.Mesh(new T.BoxGeometry(2.93,.12,.22),sleeperMat);tie.name='Durmiente · detalle de vía existente';tie.position.set(0,.105,z);groups.get('track').add(tie);for(const x of[-1.39,-.72,.72,1.39]){const f=new T.Mesh(new T.BoxGeometry(.19,.055,.19),fixingMat);f.position.set(x,.19,z);f.name='Fijación de vía';groups.get('track').add(f);}}
 // Bed beneath the imported sleepers, with a subdued mineral finish.
 const bedMat=new T.MeshStandardMaterial({color:'#777c75',roughness:.96});owned.add(bedMat);const bed=new T.Mesh(new T.BoxGeometry(3.45,.15,7.2),bedMat);bed.name='Lecho de apoyo';bed.position.y=-.12;groups.get('track').add(bed);
 const plane=new T.Plane(new T.Vector3(0,0,-1),0),setSection=base.setSection.bind(base),explode=base.explode.bind(base),dispose=base.dispose.bind(base);
 base.setSection=on=>{setSection(on);for(const m of bodyMaterials){m.clippingPlanes=on?[plane]:null;m.clipShadows=true;m.needsUpdate=true;}};
 groups.get('power').scale.setScalar(.75);
 base.explode=value=>{explode(value);groups.get('power').position.add(new T.Vector3(0,-.18,-1.15));for(const {mesh,v}of motorParts)mesh.position.copy(v).multiplyScalar(value*1.4);base.root.updateMatrixWorld(true);};
 base.dispose=()=>{dispose();for(const m of owned)m.dispose();};
 base.root.userData={...base.root.userData,actualModel162:id,actualMeshes162:actual,actualTrackMeshes162:trackCount};base.setSection(true);base.explode(0);return base;
}
