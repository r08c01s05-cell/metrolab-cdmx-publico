/* Native cab preview with actual WebGL drawing; no measurement of user GPU FPS. */
const assert=require('node:assert/strict');
const {chromium}=require(process.env.METROLAB_PLAYWRIGHT_PATH||'playwright');
(async()=>{
 const browser=await chromium.launch({executablePath:'/usr/bin/chromium',headless:true,args:['--no-sandbox','--use-angle=swiftshader','--enable-unsafe-swiftshader']});
 try{
  const page=await browser.newPage({viewport:{width:900,height:650}}),errors=[];page.setDefaultTimeout(120000);
  page.on('pageerror',e=>errors.push(e.message));
  page.on('console',m=>{if(m.type()==='error'&&/Shader Error|VALIDATE_STATUS/i.test(m.text()))errors.push(m.text());});
  await page.addInitScript(()=>{window.gl206=[];for(const C of[window.WebGLRenderingContext,window.WebGL2RenderingContext])if(C)for(const key of['drawArrays','drawElements','drawArraysInstanced','drawElementsInstanced'])if(C.prototype[key]){gl206.push([C.prototype,key,C.prototype[key]]);C.prototype[key]=()=>{};}});
  await page.goto(process.argv[2]||'http://127.0.0.1:8111/',{waitUntil:'domcontentloaded'});
  await page.waitForFunction(()=>window.metroGame&&window.workshopGame);await page.evaluate(()=>metroGame.choose('operator',1));
  await page.waitForFunction(()=>window.stationScene?.cockpit149?.loaded&&document.body.dataset.loading142==='false');
  const result=await page.evaluate(async()=>{
   window.requestAnimationFrame=()=>0;for(const [prototype,key,draw]of gl206)prototype[key]=draw;
   const T=await import('/vendor/three.module.js'),{createMetroEnvironment}=await import('/metro-render.js?v=205'),c=stationScene.cockpit149,op=metroViewState().engine.operator;
   op.throttle=0;op.brake=0;c.hover=null;c.press=null;for(let i=0;i<80;i++)c.update(performance.now()+i*20);
   const renderer=new T.WebGLRenderer({antialias:true,preserveDrawingBuffer:true});renderer.setSize(900,650);renderer.setPixelRatio(1);renderer.outputColorSpace=T.SRGBColorSpace;renderer.toneMapping=T.NeutralToneMapping;
   renderer.domElement.style.cssText='position:fixed;inset:0;z-index:2147483647';document.body.append(renderer.domElement);
   c.scene.environment=createMetroEnvironment(renderer,'bench').texture;c.scene.environmentIntensity=.8;c.scene.background=new T.Color('#cad3d1');
   const camera=new T.PerspectiveCamera(45,900/650,.02,15);camera.position.set(-.25,.16,-.03);camera.lookAt(-.43,-.14,-.55);camera.updateMatrixWorld(true);
   await renderer.compileAsync(c.scene,camera);renderer.render(c.scene,camera);
   const h=c.hands[0],goal=c.pivot.localToWorld(new T.Vector3(0,.255,0)),palm=h.root.localToWorld(h.grip.clone());
   const context=new OfflineAudioContext(1,44100*5,44100),data=await(await fetch('/audio/cabina71/aviso_cierre206.wav')).arrayBuffer(),buffer=await context.decodeAudioData(data),source=context.createBufferSource();source.buffer=buffer;source.connect(context.destination);source.start(0);source.stop(5);const recorded=(await context.startRendering()).getChannelData(0),rms=[];
   for(let second=0;second<5;second++){let e=0;for(let i=second*44100;i<(second+1)*44100;i++)e+=recorded[i]**2;rms.push(Math.sqrt(e/44100));}
   return{palmError:palm.distanceTo(goal),draws:renderer.info.render.calls,decodedSeconds:buffer.duration,rms};
  });
  assert(result.palmError<.006);assert(result.draws>0);assert.equal(result.decodedSeconds,5);assert(result.rms.every(x=>x>.04));assert.deepEqual(errors,[]);
  if(process.argv[3])await page.screenshot({path:process.argv[3]});console.log('206 PASS native cab WebGL and actual browser audio decoding/rendering:',JSON.stringify(result));
 }finally{await browser.close();}
})().catch(e=>{console.error(e);process.exit(1);});
