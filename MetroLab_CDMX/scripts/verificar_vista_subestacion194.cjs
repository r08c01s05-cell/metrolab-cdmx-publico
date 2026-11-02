/* Optional browser check. Start the simulator first, then:
 * METROLAB_PLAYWRIGHT_PATH=/path/to/playwright node scripts/verificar_vista_subestacion194.cjs http://127.0.0.1:8100/
 * Draw calls, shader precompilation and scene rendering are omitted: this checks live DOM, Pointer Lock and the renderer size, not GPU performance.
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
  await page.waitForFunction(()=>window.metroGame&&window.workshopGame);
  await page.evaluate(async()=>{
   const game=await(await fetch('/game86.js',{cache:'no-store'})).text(),rectifier=game.match(/import\(['"]\.(\/rectifier126\.js\?v=\d+)['"]/)[1],source=await(await fetch(rectifier,{cache:'no-store'})).text(),url=source.match(/import\(['"]\.(\/rectifier-view126\.js\?v=\d+)['"]/)[1],{RectifierView126}=await import(url),create=RectifierView126.create;
   RectifierView126.create=async(...args)=>{const view=await create.apply(RectifierView126,args);view.renderer.compileAsync=async()=>{};view.renderer.render=()=>{};window.sub194=view;return view;};
   await window.metroGame.choose('substations');
  });
  await page.locator('[data-sr-maintain-mode]').click();
  await page.waitForFunction(()=>window.sub194?.service128?.carry188?.enabled&&!sub194.service128.busy&&!document.querySelector('#sr126-dialog .sr126-layout').inert);
  const inspect=()=>page.evaluate(()=>{
   const canvas=window.sub194.canvas,stage=canvas.parentElement,root=document.querySelector('#sr126-dialog'),rect=e=>{const r=e.getBoundingClientRect();return {x:r.x,y:r.y,width:r.width,height:r.height,bottom:r.bottom};};
   return {root:rect(root),stage:rect(stage),canvas:rect(canvas),bitmap:{width:canvas.width,height:canvas.height},pixelRatio:sub194.renderer.getPixelRatio(),cameraAspect:sub194.camera.aspect,locked:document.pointerLockElement===canvas};
  });
  for(const size of [{width:1440,height:900},{width:1200,height:540},{width:390,height:844},{width:390,height:540}]){
   await page.setViewportSize(size);await page.waitForTimeout(250);
   for(const locked of [false,true]){
    if(locked){const point=await page.evaluate(()=>{const c=sub194.canvas,r=c.getBoundingClientRect();for(const y of [.1,.3,.5,.7,.9])for(const x of [.08,.25,.5,.75,.92]){const clientX=r.left+r.width*x,clientY=r.top+r.height*y;if(document.elementFromPoint(clientX,clientY)===c&&!sub194.service128.play135.pick({clientX,clientY}))return {x:r.width*x,y:r.height*y};}return null;});assert(point,'A visible free point is available for native mouse capture');await page.locator('#sr126-dialog canvas').click({position:point});await page.waitForFunction(()=>document.pointerLockElement===window.sub194.canvas);}
    // ResizeObserver and Pointer Lock settle on browser frames. Waiting for
    // their result avoids treating a busy software renderer as a layout bug;
    // a persistently wrong framebuffer still fails without forcing resize().
    await page.waitForFunction(()=>{const v=window.sub194,c=v.canvas,r=c.getBoundingClientRect(),d=v.renderer.getPixelRatio();return Math.abs(c.width-r.width*d)<2&&Math.abs(c.height-r.height*d)<2&&Math.abs(v.camera.aspect-r.width/r.height)<.002;},null,{timeout:5000});
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
  const dock=await page.evaluate(()=>{const viewport=document.querySelector('#sr126-dialog .sr126-viewport'),belt=document.querySelector('#sr126-dialog .sr136-toolbelt');return {inside:viewport.contains(belt),journal:sub194.dialog.dataset.journal182};});
  assert(!dock.inside,'Toolbelt must live in the optional plan, not below the 3D scene');
  await page.evaluate(()=>{const v=sub194,anchor=v.bagBrowser157.anchor178;v.camera.position.copy(anchor).add(new (anchor.constructor)(0,1.55,-.6));v.controls.target.copy(anchor);v.camera.lookAt(anchor);v.walk176.resume178();v.service128.checklist179.setJournal182(false);v.canvas.focus();});
  await page.keyboard.press('Tab');
  await page.waitForFunction(()=>sub194.bagBrowser157.phase==='searching');
  assert.equal(await page.evaluate(()=>sub194.dialog.dataset.journal182),'false','Inventory must work without opening the plan');
  await page.keyboard.press('Tab');await page.waitForFunction(()=>sub194.bagBrowser157.phase==='closed');
  console.log('194 PASS: optional toolbelt outside viewport; native Tab inventory opens near bag with plan closed and closes again.');
  assert.deepEqual(errors,[],'No browser application errors');
 }finally{await browser.close();}
})().catch(error=>{console.error(error);process.exit(1);});
