/* Optional browser check. Start the simulator first, then:
 * METROLAB_PLAYWRIGHT_PATH=/path/to/playwright node scripts/verificar_vista_taller194.cjs http://127.0.0.1:8100/
 * Draw calls are omitted: this checks live DOM, Pointer Lock and the renderer size, not GPU performance.
 */
const assert=require('node:assert/strict');
const {chromium}=require(process.env.METROLAB_PLAYWRIGHT_PATH||'playwright');
(async()=>{
 const browser=await chromium.launch({executablePath:process.env.METROLAB_CHROMIUM||'/usr/bin/chromium',headless:true,args:['--no-sandbox','--use-angle=swiftshader','--enable-unsafe-swiftshader']});
 try{
  const page=await browser.newPage({viewport:{width:1440,height:900}}),errors=[];
  page.setDefaultTimeout(90000);page.on('pageerror',e=>errors.push(e.message));
  await page.addInitScript(()=>{for(const C of [window.WebGLRenderingContext,window.WebGL2RenderingContext])if(C)for(const key of ['drawArrays','drawElements','drawArraysInstanced','drawElementsInstanced'])if(C.prototype[key])C.prototype[key]=()=>{};});
  await page.goto(process.argv[2]||'http://127.0.0.1:8100/',{waitUntil:'domcontentloaded'});
  await page.evaluate(async()=>{
   const source=await(await fetch('/maintenance-scene102.js',{cache:'no-store'})).text(),url=source.match(/from ['"]\.(\/workshop-walk187\.js\?v=\d+)['"]/)[1],{WorkshopWalk187}=await import(url),update=WorkshopWalk187.prototype.update;
   WorkshopWalk187.prototype.update=function(dt){window.bench194=this.view;return update.call(this,dt);};
  });
  await page.waitForFunction(()=>window.metroGame&&window.workshopGame);
  await page.evaluate(()=>window.metroGame.choose('maintenance'));
  if(await page.locator('#m117-begin').isVisible())await page.locator('#m117-begin').click();
  await page.waitForFunction(()=>window.bench194?.walk176?.active());
  const inspect=()=>page.evaluate(()=>{
   const canvas=document.querySelector('#repair102-canvas'),stage=canvas.parentElement,root=document.querySelector('#maintenance-hands-panel'),rect=e=>{const r=e.getBoundingClientRect();return {x:r.x,y:r.y,width:r.width,height:r.height,bottom:r.bottom};};
   return {root:rect(root),stage:rect(stage),canvas:rect(canvas),bitmap:{width:canvas.width,height:canvas.height},pixelRatio:bench194.renderer.getPixelRatio(),cameraAspect:bench194.camera.aspect,locked:document.pointerLockElement===canvas};
  });
  for(const size of [{width:1440,height:900},{width:1200,height:540},{width:390,height:844},{width:390,height:540}]){
   await page.setViewportSize(size);await page.waitForTimeout(250);
   for(const locked of [false,true]){
    if(locked){const point=await page.evaluate(()=>{const c=bench194.canvas,r=c.getBoundingClientRect();for(const y of [.1,.3,.5,.7,.9])for(const x of [.08,.25,.5,.75,.92]){const clientX=r.left+r.width*x,clientY=r.top+r.height*y;if(document.elementFromPoint(clientX,clientY)===c&&!bench194.pick({clientX,clientY}))return {x:r.width*x,y:r.height*y};}return null;});assert(point,'A visible free point is available for native mouse capture');await page.locator('#repair102-canvas').click({position:point});await page.waitForFunction(()=>document.pointerLockElement===document.querySelector('#repair102-canvas'));}
    const r=await inspect();
    assert(Math.abs(r.stage.bottom-r.root.bottom)<1,'Scene must reach the maintenance panel bottom');
    for(const key of ['x','y','width','height'])assert(Math.abs(r.canvas[key]-r.stage[key])<1,'Canvas fills stage: '+key);
    assert(Math.abs(r.bitmap.width-r.canvas.width*r.pixelRatio)<2,'Drawing buffer uses the full canvas width');
    assert(Math.abs(r.bitmap.height-r.canvas.height*r.pixelRatio)<2,'Drawing buffer uses the full canvas height');
    assert(Math.abs(r.cameraAspect-r.canvas.width/r.canvas.height)<.002,'Camera aspect follows full viewport');
    assert(r.stage.width>0&&r.stage.height>0);assert.equal(r.locked,locked);
    console.log('194 PASS',size,locked?'mouse captured':'cursor free',r);
    if(locked){await page.keyboard.press('Escape');await page.waitForFunction(()=>!document.pointerLockElement);}
   }
  }
  assert.deepEqual(errors,[],'No browser application errors');
 }finally{await browser.close();}
})().catch(error=>{console.error(error);process.exit(1);});
