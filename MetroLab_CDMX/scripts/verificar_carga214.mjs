import './node-textures40.mjs';import assert from 'node:assert/strict';
globalThis.window={addEventListener(){}};globalThis.document={body:{dataset:{workspace:'none'}},addEventListener(){},getElementById(){return null;}};
const{StationScene}=await import('../dist/station-scene.js');
const scene=Object.create(StationScene.prototype);let starts=0,finish,compiling=false;
scene.prepareReady214=async function(){starts++;assert(!compiling,'Do not dispose/rebuild another shader batch while one is compiling');compiling=true;this.reentrant=this.ready142();await new Promise(resolve=>finish=resolve);compiling=false;return 'prepared';};
const a=scene.ready142(),b=scene.ready142();assert.equal(a,b,'Menu and line gate join the same preparation');await Promise.resolve();assert.equal(scene.reentrant,a,'Reentrant line gate joins after the task is registered');assert.equal(starts,1);let settled=false;a.then(()=>settled=true);await Promise.resolve();assert.equal(settled,false,'Do not dismiss loading before shader preparation finishes');finish();assert.equal(await a,'prepared');assert.equal(await b,'prepared');
const c=scene.ready142();assert.notEqual(c,a,'A later station can be prepared again');await Promise.resolve();finish();await c;assert.equal(starts,2);
scene.prepareReady214=async()=>{throw Error('shader failure');};await assert.rejects(scene.ready142(),/shader failure/);scene.prepareReady214=async()=>true;assert.equal(await scene.ready142(),true,'Failure clears the pending task so retry works');
console.log('214 PASS: simultaneous menu/line/review preparation shares one shader batch, reentrancy cannot rebuild/dispose it, loading waits for completion, retries remain available.');
