/* Live browser regression for the shared canvas CSS and the CAD header that was
 * hidden when entering from the home menu. Drawing is omitted; this is a DOM,
 * navigation and renderer-size test, not a GPU performance measurement.
 * METROLAB_PLAYWRIGHT_PATH=/path/to/playwright node scripts/verificar_apartados195.cjs [baseURL]
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
   const game=await(await fetch(new URL('game86.js',location.href))).text(),entry=game.match(/import\(['"]\.(\/rectifier126\.js\?v=\d+)['"]/)[1];
   const source=await(await fetch(new URL('.'+entry,location.href))).text(),url=source.match(/import\(['"]\.(\/rectifier-view126\.js\?v=\d+)['"]/)[1];
   const {RectifierView126}=await import(new URL('.'+url,location.href).href),create=RectifierView126.create;
   RectifierView126.create=async(...args)=>{const v=await create.apply(RectifierView126,args);v.renderer.compileAsync=async()=>{};v.renderer.render=()=>{};window.view195=v;return v;};
   await metroGame.choose('substations');
  });
  await page.waitForFunction(()=>window.view195?.dialog.open);
  const check=async label=>{
   await page.waitForFunction(()=>{const v=view195,c=v.canvas,r=c.getBoundingClientRect(),d=v.renderer.getPixelRatio();return Math.abs(c.width-r.width*d)<2&&Math.abs(c.height-r.height*d)<2&&Math.abs(v.camera.aspect-r.width/r.height)<.002;},null,{timeout:5000});
   const r=await page.evaluate(()=>{
    const v=view195,c=v.canvas,stage=c.parentElement,rect=e=>{const r=e.getBoundingClientRect();return{x:r.x,y:r.y,width:r.width,height:r.height,bottom:r.bottom};};
    return{stage:rect(stage),canvas:rect(c),root:rect(v.dialog),width:c.width,height:c.height,dpr:v.renderer.getPixelRatio(),aspect:v.camera.aspect,maintenance:v.service128.active};
   });
   for(const key of ['x','y','width','height'])assert(Math.abs(r.canvas[key]-r.stage[key])<1,label+' canvas '+key);
   assert(Math.abs(r.width-r.stage.width*r.dpr)<2,'Full drawing-buffer width');
   assert(Math.abs(r.height-r.stage.height*r.dpr)<2,'Full drawing-buffer height');
   assert(Math.abs(r.aspect-r.stage.width/r.stage.height)<.002,'Camera aspect follows stage');
   if(r.maintenance)assert(Math.abs(r.stage.bottom-r.root.bottom)<1,'No reserved bottom strip');
   console.log('195 PASS',label,r.stage.width+'×'+r.stage.height);
  };
  for(const size of [{width:390,height:540},{width:1440,height:900}]){
   await page.setViewportSize(size);await check('explore '+size.width);
   await page.locator('[data-sr-maintain-mode]').click();
   await page.waitForFunction(()=>view195.service128.carry188?.enabled&&!view195.service128.busy&&!view195.dialog.querySelector('.sr126-layout').inert);
   assert(!await page.locator('[data-carry188-hint]').innerText().then(s=>s.includes('Preparando equipo')),'Completed loading must not look stuck');
   await check('maintain '+size.width);
   await page.locator('[data-sr-cad168]').click();
   assert(await page.locator('.cad168').isVisible());
   // A real click catches the broad home header rule that hid this button.
   await page.locator('[data-cad-back]').click();await check('CAD return '+size.width);
   await page.locator('[data-sr-explore-mode]').click();await check('explore return '+size.width);
  }
  await page.locator('[data-sr-close]').click();await page.evaluate(()=>metroGame.choose('substations'));await check('reopen');
  assert.deepEqual(errors,[],'No browser application errors');
 }finally{await browser.close();}
})().catch(error=>{console.error(error);process.exit(1);});
