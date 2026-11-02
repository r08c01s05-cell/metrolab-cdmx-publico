/* Integración de la Biblioteca compartida con el simulador. Sin medición GPU. */
const assert=require('node:assert/strict');
const {chromium}=require(process.env.METROLAB_PLAYWRIGHT_PATH||'playwright');
(async()=>{
 const browser=await chromium.launch({executablePath:'/usr/bin/chromium',headless:true,args:['--no-sandbox','--use-angle=swiftshader','--enable-unsafe-swiftshader']});
 try{
  const page=await browser.newPage(),errors=[];page.setDefaultTimeout(90000);
  page.on('pageerror',e=>errors.push(e.message));
  await page.addInitScript(()=>{for(const C of[window.WebGLRenderingContext,window.WebGL2RenderingContext])if(C)for(const k of['drawArrays','drawElements','drawArraysInstanced','drawElementsInstanced'])if(C.prototype[k])C.prototype[k]=()=>{};});
  await page.goto(process.argv[2]||'http://127.0.0.1:8104/',{waitUntil:'domcontentloaded'});
  await page.waitForFunction(()=>window.metroGame&&document.querySelector('#game-home-menu [data-home180-info]'));
  assert.equal(await page.locator('#game-home-menu > button').count(),7,'Cinco modos, Biblioteca y Ajustes');
  await page.locator('[data-home180-info]').click();
  await page.waitForFunction(()=>document.querySelector('#documents-dialog').open);
  const portal=page.frameLocator('#info-portal139 iframe');
  await portal.locator('#motor-result').waitFor();
  assert.match(await portal.locator('#motor-result').innerText(),/1500|1[,. ]500/);
  await portal.locator('#motor-frequency').fill('60');
  await portal.locator('#motor-frequency').dispatchEvent('input');
  assert.match(await portal.locator('#motor-result').innerText(),/1800|1[,. ]800/);
  await page.locator('#info-tab-documents144').click();
  const sources=await page.locator('#info-documents144 a[href]').evaluateAll(nodes=>nodes.map(n=>n.href));
  assert(sources.length>=3);assert(sources.every(h=>new URL(h).hostname.endsWith('.gob.mx')));
  assert.equal(await page.locator('#info-tab-original200').count(),1,'Acceso al original del colaborador conservado');
  await page.locator('#info-tab-guide139').click();
  await page.waitForFunction(()=>document.querySelector('#info-guide-host139').childElementCount>0);
  await page.locator('#documents-close').click();
  await page.locator('[data-home180-settings]').click();
  await page.waitForFunction(()=>document.querySelector('dialog[open]'));
  assert.deepEqual(errors,[]);
  console.log('204 PASS: menú de siete opciones, Biblioteca, calculador local reactivo, catálogo gubernamental, guía, acceso al original y Ajustes conservados con las mejoras del simulador.');
 }finally{await browser.close();}
})().catch(e=>{console.error(e);process.exit(1);});
