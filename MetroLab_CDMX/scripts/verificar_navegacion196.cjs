/* Real browser input regression. Draw calls are omitted; no GPU speed claim.
 * METROLAB_PLAYWRIGHT_PATH=/path/to/playwright node scripts/verificar_navegacion196.cjs [baseURL]
 */
const assert=require('node:assert/strict');
const {chromium}=require(process.env.METROLAB_PLAYWRIGHT_PATH||'playwright');
(async()=>{
 const browser=await chromium.launch({executablePath:process.env.METROLAB_CHROMIUM||'/usr/bin/chromium',headless:true,args:['--no-sandbox','--use-angle=swiftshader','--enable-unsafe-swiftshader']});
 try{
  const page=await browser.newPage({viewport:{width:1440,height:900}}),errors=[];
  page.setDefaultTimeout(90000);page.on('pageerror',e=>errors.push(e.message));
  await page.addInitScript(()=>{for(const C of [window.WebGLRenderingContext,window.WebGL2RenderingContext])if(C)for(const k of ['drawArrays','drawElements','drawArraysInstanced','drawElementsInstanced'])if(C.prototype[k])C.prototype[k]=()=>{};});
  await page.goto(process.argv[2]||'http://127.0.0.1:8100/',{waitUntil:'domcontentloaded'});
  await page.waitForFunction(()=>window.metroGame&&window.workshopGame);
  await page.evaluate(async()=>{
   const source=await(await fetch(new URL('maintenance-scene102.js',location.href))).text(),url=source.match(/from ['"]\.(\/workshop-walk187\.js\?v=\d+)['"]/)[1],{WorkshopWalk187}=await import(new URL('.'+url,location.href).href),update=WorkshopWalk187.prototype.update;
   WorkshopWalk187.prototype.update=function(dt){window.bench196=this.view;return update.call(this,dt);};
  });
  await page.evaluate(()=>metroGame.choose('maintenance'));
  if(await page.locator('#m117-begin').isVisible())await page.locator('#m117-begin').click();
  await page.waitForFunction(()=>window.bench196?.walk176?.active());
  const plan=page.locator('.m117-objective');
  assert.equal(await plan.evaluate(e=>e.inert),true,'Long plan is closed by default');
  assert.equal((await page.locator('#repair102-canvas').boundingBox()).width,1440,'No permanent side rail');
  await page.keyboard.press('j');assert.equal(await plan.evaluate(e=>e.inert),false);
  await page.keyboard.press('j');assert.equal(await plan.evaluate(e=>e.inert),true);
  const point=await page.evaluate(()=>{
   const v=bench196,c=v.canvas,r=c.getBoundingClientRect();
   for(const y of [.25,.4,.55,.7])for(const x of [.25,.4,.55,.7]){const clientX=r.left+r.width*x,clientY=r.top+r.height*y;if(document.elementFromPoint(clientX,clientY)===c&&v.pick({clientX,clientY}))return{x:clientX,y:clientY};}
   return null;
  });
  assert(point,'A visible equipment target is available');
  await page.mouse.click(point.x,point.y);await page.waitForFunction(()=>document.pointerLockElement===bench196.canvas);
  const yaw=await page.evaluate(()=>bench196.walk176.yaw);
  await page.mouse.move(point.x+90,point.y+20);await page.waitForTimeout(80);
  assert(Math.abs(await page.evaluate(()=>bench196.walk176.yaw)-yaw)>.03,'Mouse turns over the equipment');
  await page.mouse.click(point.x,point.y);assert(await page.evaluate(()=>bench196.walk176.locked182()),'Interacting does not release mouse look');
  await page.keyboard.press('Escape');await page.waitForFunction(()=>!document.pointerLockElement);
  const dragYaw=await page.evaluate(()=>bench196.walk176.yaw);
  await page.mouse.move(700,450);await page.mouse.down({button:'right'});await page.mouse.move(790,450,{steps:8});await page.mouse.up({button:'right'});
  assert(Math.abs(await page.evaluate(()=>bench196.walk176.yaw)-dragYaw)>.04,'Right drag remains available with cursor free');
  const walking=await page.evaluate(()=>bench196.camera.position.toArray());
  await page.locator('#train156-overview').click();await page.waitForTimeout(250);
  const overview=await page.evaluate(()=>({inspecting:bench196.walk176.inspecting196,p:bench196.camera.position.toArray()}));
  assert(overview.inspecting);assert(Math.hypot(...overview.p.map((v,i)=>v-walking[i]))>10,'Overview remains away from the working aisle');
  const beforeOrbit=overview.p;
  await page.mouse.move(700,450);await page.mouse.down();await page.mouse.move(830,490,{steps:10});await page.mouse.up();
  const afterOrbit=await page.evaluate(()=>bench196.camera.position.toArray());
  assert(Math.hypot(...afterOrbit.map((v,i)=>v-beforeOrbit[i]))>1,'Overview can orbit with the mouse');
  await page.keyboard.down('w');await page.waitForTimeout(100);await page.keyboard.up('w');
  assert.equal(await page.evaluate(()=>bench196.walk176.inspecting196),false,'WASD restores working position');
  assert(Math.abs(await page.evaluate(()=>bench196.camera.position.z))<3,'Overview does not leave the player outside the aisle');
  await page.keyboard.press('j');await page.keyboard.down('w');await page.waitForTimeout(80);await page.keyboard.up('w');
  assert.equal(await plan.evaluate(e=>e.inert),true,'Walking closes the plan');
  await page.setViewportSize({width:390,height:540});await page.waitForTimeout(250);
  assert.equal((await page.locator('#repair102-canvas').boundingBox()).width,390);
  assert.equal(await plan.evaluate(e=>e.inert),true);
  console.log('196 PASS: equipment click captures mouse, full rotation and cursor fallback, optional J plan, usable overview and WASD return, full-width mobile scene.');
  await page.setViewportSize({width:1440,height:900});
  await page.evaluate(async()=>{
   const game=await(await fetch(new URL('game86.js',location.href))).text(),entry=game.match(/import\(['"]\.(\/rectifier126\.js\?v=\d+)['"]/)[1],source=await(await fetch(new URL('.'+entry,location.href))).text(),url=source.match(/import\(['"]\.(\/rectifier-view126\.js\?v=\d+)['"]/)[1],{RectifierView126}=await import(new URL('.'+url,location.href).href),create=RectifierView126.create;
   RectifierView126.create=async(...args)=>{const v=await create.apply(RectifierView126,args);v.renderer.compileAsync=async()=>{};v.renderer.render=()=>{};window.sub196=v;return v;};
   await metroGame.choose('substations');
  });
  await page.locator('[data-sr-maintain-mode]').click();
  await page.waitForFunction(()=>window.sub196?.service128?.carry188?.enabled&&!sub196.service128.busy&&!sub196.dialog.querySelector('.sr126-layout').inert);
  await page.evaluate(()=>{const v=sub196,a=v.bagBrowser157.anchor178;v.camera.position.copy(a).add(new (a.constructor)(0,1.55,-.6));v.controls.target.copy(a);v.camera.lookAt(a);v.walk176.resume178();v.canvas.focus();});
  await page.keyboard.press('Tab');await page.waitForFunction(()=>sub196.bagBrowser157.phase==='searching');
  await page.locator('#sr126-dialog [data-bag186-tool="meter"]').click();
  await page.waitForFunction(()=>sub196.bagBrowser157.phase==='closed'&&sub196.service128.carry188.held?.kind==='instrument');
  await page.waitForFunction(()=>document.pointerLockElement===sub196.canvas);
  const equippedYaw=await page.evaluate(()=>sub196.walk176.yaw);
  await page.mouse.move(620,410);await page.waitForTimeout(80);
  assert(Math.abs(await page.evaluate(()=>sub196.walk176.yaw)-equippedYaw)>.03,'Tool selection immediately restores native mouse look without an extra canvas click');
  await page.keyboard.press('Escape');await page.waitForFunction(()=>!document.pointerLockElement);
  const target=await page.evaluate(()=>{
   const v=sub196,o=v.service128.bench.targets.get('filter'),p=o.getWorldPosition(v.camera.position.clone());v.controls.target.copy(p);v.camera.lookAt(p);v.walk176.resume178();v.camera.updateMatrixWorld(true);p.project(v.camera);const r=v.canvas.getBoundingClientRect();return{x:r.left+(p.x+1)*r.width/2,y:r.top+(1-p.y)*r.height/2};
  });
  await page.mouse.click(target.x,target.y);await page.waitForFunction(()=>document.pointerLockElement===sub196.canvas);
  const subYaw=await page.evaluate(()=>sub196.walk176.yaw);
  await page.mouse.move(target.x+100,target.y+15);await page.waitForTimeout(100);
  assert(Math.abs(await page.evaluate(()=>sub196.walk176.yaw)-subYaw)>.03,'Holding the anemometer does not disable turning');
  await page.keyboard.press('Escape');await page.waitForFunction(()=>!document.pointerLockElement);
  const subDragYaw=await page.evaluate(()=>sub196.walk176.yaw);
  await page.mouse.move(720,460);await page.mouse.down({button:'right'});await page.mouse.move(810,460,{steps:8});await page.mouse.up({button:'right'});
  assert(Math.abs(await page.evaluate(()=>sub196.walk176.yaw)-subDragYaw)>.04,'Held instrument retains right-drag fallback');
  assert.equal(await page.evaluate(()=>sub196.service128.carry188.held?.kind),'instrument','Cursor release keeps the real held object');
  assert.deepEqual(errors,[]);console.log('196 PASS: native bag selection followed by full mouse turn and right-drag fallback while carrying the anemometer.');
 }finally{await browser.close();}
})().catch(e=>{console.error(e);process.exit(1);});
