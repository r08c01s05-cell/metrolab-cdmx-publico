import assert from 'node:assert/strict';
import fs from 'node:fs';import crypto from 'node:crypto';import zlib from 'node:zlib';
import {searchPages89,energyState89} from '../dist/knowledge89.js';
import {loadCompressedGLB,compressedDownloadPath} from '../dist/compressed-assets89.js';
import {GLTFLoader} from '../dist/vendor/GLTFLoader.js';
function originalBytes(name){const base='assets-source/documentos89/';if(fs.existsSync(base+name))return fs.readFileSync(base+name);const row=JSON.parse(fs.readFileSync(base+'originales-partes.json')).find(x=>x.name===name);return Buffer.concat(row.parts.map(p=>fs.readFileSync(base+p)));}
const root='dist/documentacion/estudio89/',catalog=JSON.parse(fs.readFileSync(root+'catalogo.json')),docs=catalog.map(d=>JSON.parse(fs.readFileSync(root+d.id+'.json')));
assert.equal(docs.length,5);assert.equal(docs.reduce((n,d)=>n+d.content.length,0),401);
for(const d of docs){assert(fs.existsSync(root+d.file));assert.equal(crypto.createHash('sha256').update(originalBytes(d.name)).digest('hex'),d.sha256);assert.deepEqual(d.content.map(p=>p.page),Array.from({length:d.pages},(_,i)=>i+1));}
assert(searchPages89(docs,'bateria').length>0);assert.deepEqual(searchPages89(docs,'batería'),searchPages89(docs,'BATERIA'));assert.equal(searchPages89(docs,'xyznevermatch123').length,0);
const criteria=JSON.parse(fs.readFileSync(root+'criterios.json'));for(const c of criteria.conflicts)if(c.source)assert(docs.find(d=>d.id===c.source).content.some(p=>p.page===c.page));
assert.equal(energyState89({fault:true}).traction,0);assert.equal(energyState89({fault:true}).auxiliary,true);assert.equal(energyState89({auxiliary:false}).traction,750);assert.equal(energyState89({era:'historic'}).input,85);
globalThis.self=globalThis;globalThis.createImageBitmap=async()=>({width:1,height:1,close(){}});globalThis.ProgressEvent=class{constructor(t,p){Object.assign(this,p);}};
const realFetch=globalThis.fetch;globalThis.fetch=async url=>typeof url==='string'&&url.startsWith('models/')?new Response(fs.readFileSync('dist/'+url.split('?')[0])):realFetch(url);
const manifest=JSON.parse(fs.readFileSync('dist/documentacion/andenes-compresion89.json'));assert.equal(manifest.length,39);
for(const m of manifest){const b=zlib.gunzipSync(fs.readFileSync('dist/'+m.file+'.gz'));assert.equal(crypto.createHash('sha256').update(b).digest('hex'),m.sha256);assert.equal(b.length,m.bytes);const model=await loadCompressedGLB(new GLTFLoader(),m.file+'?revision=55');assert(model.scene.children.length>0);}
globalThis.fetch=async()=>new Response('',{status:404});await assert.rejects(()=>loadCompressedGLB(new GLTFLoader(),'models/missing.glb'),/404/);globalThis.fetch=realFetch;
assert.equal(compressedDownloadPath('models/andenes/L1/A.glb?x=1'),'models/andenes/L1/A.glb.gz');for(const m of ['NM22','NM79','MP82'])assert.equal(compressedDownloadPath('models/'+m+'_cabina.glb'),'models/'+m+'_cabina.glb.gz');
console.log('v89: 5 documents / 401 units; original hashes; evidence links; search; independent energy branches; 39 lossless station models parsed using actual loader; download paths and load failure checked. Image decoding stubbed; no WebGL QA.');
