import assert from 'node:assert/strict';
import * as T from 'three';
import {refineMaterials110} from '../dist/material-realism110.js';
import {applySurfaceDetail205,detailTexture205,inheritSurfaceDetail205,surfaceDetailBudget205} from '../dist/surface-detail205.js?v=205';
import {industrialFinish176} from '../dist/industrial-finish176.js';
import {depotDetail205} from '../dist/depot-detail205.js';
import {photographicRenderer130,inspectionShadows130,updateInspectionShadows130} from '../dist/photographic130.js';
import {setVisual105} from '../dist/visual-settings105.js?v=105';
const shader=()=>({uniforms:{},vertexShader:T.ShaderLib.standard.vertexShader,fragmentShader:T.ShaderLib.standard.fragmentShader});
const root=new T.Group(),authored=new T.DataTexture(new Uint8Array([170,160,140,255]),1,1);
const samples=[];
for(const name of ['Pintura naranja','Acero cepillado','Piso terrazo','Concreto','Goma','Lona','Fibra filtrante','Porcelana']){
 const m=new T.MeshStandardMaterial({name,map:authored,color:'#b5b1a3'}),mesh=new T.Mesh(new T.BoxGeometry(),m);
 root.add(mesh);samples.push({mesh,colour:m.color.clone(),positions:mesh.geometry.attributes.position.array.slice(),uv:mesh.geometry.attributes.uv.array.slice()});
}
refineMaterials110(root);
for(const {mesh,colour,positions,uv} of samples){
 const m=mesh.material,s=shader();m.onBeforeCompile(s);
 assert(m.userData.surface205);assert.equal(m.map,authored);assert(m.color.equals(colour));
 assert.deepEqual(mesh.geometry.attributes.position.array,positions);assert.deepEqual(mesh.geometry.attributes.uv.array,uv);
 assert(mesh.geometry.attributes.uv3);assert(s.fragmentShader.includes('diffuseColor.rgb*='));assert(s.uniforms.detailMap205.value.isDataTexture);
 const clone=inheritSurfaceDetail205(m,m.clone()),cs=shader();clone.onBeforeCompile(cs);
 assert.equal(cs.uniforms.detailMap205.value,s.uniforms.detailMap205.value,'Cloned materials share the same detail texture');
 assert.equal(clone.customProgramCacheKey(),m.customProgramCacheKey(),'Shader programs are shared after cloning');
}
const stable=samples[0].mesh.material.onBeforeCompile;refineMaterials110(root);assert.equal(samples[0].mesh.material.onBeforeCompile,stable,'Refinement is idempotent');
industrialFinish176(root);const cloned=shader();samples[0].mesh.material.onBeforeCompile(cloned);assert(cloned.uniforms.detailMap205,'Industrial finish retains the shader layer');
const sign=new T.Mesh(new T.PlaneGeometry(),new T.MeshStandardMaterial({name:'Mapa y rotulación',map:authored}));refineMaterials110(sign);assert(!sign.material.userData.surface205,'Signs and authored artwork receive no procedural layer');
const skin=new T.Mesh(new T.BoxGeometry(),new T.MeshStandardMaterial({name:'skin',map:authored}));refineMaterials110(skin);assert(!skin.material.userData.surface205,'No artificial speckle is added to faces');
for(const family of ['paint','metal','terrazzo','concrete','cast','rubber','ceramic','fabric']){
 const t=detailTexture205(family);assert.equal(t,detailTexture205(family));assert.equal(t.colorSpace,T.NoColorSpace);assert.equal(t.wrapS,T.RepeatWrapping);assert(t.generateMipmaps);
 let min=255,max=0;for(let i=3;i<t.image.data.length;i+=4){min=Math.min(min,t.image.data[i]);max=Math.max(max,t.image.data[i]);}assert(max-min>10,'Surface roughness genuinely varies: '+family);
}
assert(surfaceDetailBudget205().bytes<=2*1024*1024,'All eight shared detail packs stay within 2 MiB before mipmaps');
setVisual105({quality:'performance'});assert(!surfaceDetailBudget205().enabled);assert.equal(cloned.uniforms.detailEnabled205.value,0,'Performance mode skips the added texture sample');setVisual105({quality:'balanced'});assert.equal(cloned.uniforms.detailEnabled205.value,1);
const depot=new T.Group(),stats=depotDetail205(depot);assert(stats.batches<=7);assert(stats.instances<3200);assert.equal(depotDetail205(depot),stats,'Dressing is not duplicated');depot.updateMatrixWorld(true);assert.equal(new T.Raycaster(new T.Vector3(11,4,1),new T.Vector3(0,-1,0)).intersectObject(depot,true).length,0,'Visual fittings never intercept interactions');
for(const o of depot.children[0].children){assert(o.isInstancedMesh);assert(o.geometry.attributes.position.count<=64);assert(Number.isFinite(o.boundingSphere.radius));}
const renderer={shadowMap:{},toneMappingExposure:1},scene=new T.Scene(),key=new T.DirectionalLight(),view={renderer,scene,renderBudget101:{reduced:false}};scene.add(key);photographicRenderer130(renderer);inspectionShadows130(view,key);assert.equal(key.shadow.mapSize.x,1024);setVisual105({quality:'cinematic'});updateInspectionShadows130(view);assert.equal(key.shadow.mapSize.x,2048);setVisual105({quality:'performance'});updateInspectionShadows130(view);assert(!renderer.shadowMap.enabled);setVisual105({quality:'balanced'});updateInspectionShadows130(view);assert.equal(key.shadow.mapSize.x,1024);
console.log('205 PASS: original maps/colours/UVs/topology retained; shared multiscale texture/shader survives material cloning; 2 MiB detail budget, performance bypass, seven instanced fitting batches and quality-dependent shadows.');

// Canvas albedo is not used as a height map. Native PBR maps are retained.
globalThis.document={createElement(){return{getContext(){return{fillRect(){},beginPath(){},ellipse(){},fill(){},strokeRect(){},arc(){}};}};}};
const {finishPlatforms160}=await import('../dist/platform-finish160.js');
const platform=new T.Group(),floor=new T.Mesh(new T.BoxGeometry(),new T.MeshStandardMaterial({name:'Terrazo andén',map:authored})),warning=new T.Mesh(new T.BoxGeometry(),new T.MeshStandardMaterial({name:'Franja podotáctil',map:authored}));platform.add(floor,warning);refineMaterials110(platform);finishPlatforms160(platform);
for(const mesh of [floor,warning]){assert.equal(mesh.material.map,authored);assert(mesh.material.normalMap.userData.platformRelief205);assert.equal(mesh.material.normalMap.colorSpace,T.NoColorSpace);assert.equal(mesh.material.normalMap.channel,2);assert(mesh.geometry.attributes.uv2);assert(mesh.material.userData.surface205);}
const native=new T.DataTexture(new Uint8Array([128,128,255,255]),1,1),protectedFloor=new T.Mesh(new T.BoxGeometry(),new T.MeshStandardMaterial({name:'Terrazo original',map:authored,normalMap:native}));finishPlatforms160(protectedFloor);assert.equal(protectedFloor.material.normalMap,native,'Authored normal maps are not replaced');
console.log('205 PASS: platform tile joints and tactile domes use independent linear normal maps, preserving original albedo, original normal maps and detail shader.');
