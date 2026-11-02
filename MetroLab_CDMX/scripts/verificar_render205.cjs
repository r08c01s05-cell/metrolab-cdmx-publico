/* Real WebGL draws in software: verifies shader compilation, not the user's GPU FPS. */
const assert=require('node:assert/strict');
const {chromium}=require(process.env.METROLAB_PLAYWRIGHT_PATH||'playwright');
(async()=>{
 const browser=await chromium.launch({executablePath:'/usr/bin/chromium',headless:true,args:['--no-sandbox','--use-angle=swiftshader','--enable-unsafe-swiftshader']});
 try{
  const base=process.argv[2]||'http://127.0.0.1:8105/',page=await browser.newPage({viewport:{width:900,height:630}}),errors=[];
  page.setDefaultTimeout(120000);page.on('pageerror',e=>errors.push(e.message));
  page.on('console',m=>{if(m.type()==='error'&&/Shader Error|VALIDATE_STATUS|GL_INVALID|Error compiling/i.test(m.text()))errors.push(m.text());});
  await page.route('**/__realismo205',route=>route.fulfill({contentType:'text/html',body:`<!doctype html><html><head><base href="${base}"><style>body{margin:0}canvas{display:block}</style><script type="importmap">{"imports":{"three":"./vendor/three.module.js"}}</script></head><body><script type="module">
   import * as T from 'three';
   import {trainAsset} from './depot86.js?v=205';
   import {createMetroEnvironment,batchTrainStatics} from './metro-render.js?v=205';
   import {loadRectifier127} from './rectifier-assets127.js?v=205';
   import {refineSurfaceMaterials100} from './visual-quality100.js?v=205';
   import {finishPlatforms160} from './platform-finish160.js?v=205';
   import {depotDetail205} from './depot-detail205.js?v=205';
   import {surfaceDetailBudget205} from './surface-detail205.js?v=205';
   import {setVisual105} from './visual-settings105.js?v=105';
   import {photographicRenderer130} from './photographic130.js?v=205';
   const r=new T.WebGLRenderer({antialias:true,preserveDrawingBuffer:true});r.setSize(900,630);r.setPixelRatio(1);document.body.append(r.domElement);photographicRenderer130(r);
   const scene=new T.Scene();scene.background=new T.Color('#d1d9d7');scene.environment=createMetroEnvironment(r).texture;scene.environmentIntensity=.8;
   scene.add(new T.HemisphereLight(0xf5f2e9,0x3b4546,.8));const key=new T.DirectionalLight(0xfff2df,2.5);key.position.set(6,9,7);scene.add(key);const fill=new T.DirectionalLight(0xc9dfeb,.6);fill.position.set(-5,5,-7);scene.add(fill);
   const camera=new T.PerspectiveCamera(40,900/630,.05,200);let model;
   window.draw205=async kind=>{
    model?.removeFromParent();
    if(kind==='train'){model=await trainAsset('MP82');batchTrainStatics(model);scene.add(model);camera.position.set(13,3.4,5);camera.lookAt(6,2.1,0);}
    else if(kind==='substation'){model=await loadRectifier127();scene.add(model);model.userData.parts.get('civil').visible=false;for(const d of model.userData.doors)d.visible=false;camera.position.set(-4,2.3,-3.2);camera.lookAt(-1.8,1.2,.5);}
    else{model=new T.Group();scene.add(model);const floor=new T.Mesh(new T.BoxGeometry(8,.08,8),new T.MeshStandardMaterial({name:'Piso terrazo andén',color:'#9c9f96'})),strip=new T.Mesh(new T.BoxGeometry(.5,.085,8),new T.MeshStandardMaterial({name:'Franja podotáctil',color:'#c4a42f'}));strip.position.x=1;floor.position.y=-.06;model.add(floor,strip);refineSurfaceMaterials100(model);finishPlatforms160(model);depotDetail205(model,{length:8,width:8,tracks:[0],axis:'x',lights:false});refineSurfaceMaterials100(model);camera.position.set(2.2,2.1,3.2);camera.lookAt(.7,0,0);}
    camera.updateMatrixWorld(true);await r.compileAsync(scene,camera);r.render(scene,camera);
    return{calls:r.info.render.calls,triangles:r.info.render.triangles,textures:r.info.memory.textures,budget:surfaceDetailBudget205(),valid:r.info.programs.every(p=>p.diagnostics?.runnable!==false)};
   };
   window.performance205=()=>{setVisual105({quality:'performance'});r.render(scene,camera);return surfaceDetailBudget205().enabled;};window.ready205=true;
  </script></body></html>`}));
  await page.goto(new URL('__realismo205',base).href,{waitUntil:'domcontentloaded'});await page.waitForFunction(()=>window.ready205);
  for(const kind of ['train','substation','platform']){
   const result=await page.evaluate(kind=>draw205(kind),kind);assert(result.valid);assert(result.calls>0&&result.calls<1000);assert(result.budget.bytes<=2*1024*1024);
   if(process.argv[3])await page.screenshot({path:process.argv[3]+'-'+kind+'.png'});
   console.log('205 PASS actual WebGL shaders/draws:',kind,JSON.stringify(result));
  }
  assert.equal(await page.evaluate(()=>performance205()),false);assert.deepEqual(errors,[]);
 }finally{await browser.close();}
})().catch(e=>{console.error(e);process.exit(1);});
