import assert from 'node:assert/strict';
import fs from 'node:fs';
import {IdleClock201} from '../dist/idle-guide201.js';
import {PUBLIC_SOURCES201} from '../dist/public-sources201.js';
const c=new IdleClock201();
assert.equal(c.check(100,'a',true),false);
assert.equal(c.check(5099,'a',true),false);
assert.equal(c.check(5100,'a',true),true);
assert.equal(c.check(5200,'b',true),false,'A new target resets the guide');
assert.equal(c.check(10200,'b',true),true);
c.reset();assert.equal(c.check(20000,'b',true),false,'An action hides and resets the hint');
assert.equal(c.check(25000,'b',false),false,'Pause or hidden surface never shows a hint');
assert.equal(c.check(30000,'b',true),false,'Returning starts a fresh interval');
for(const source of PUBLIC_SOURCES201){const u=new URL(source.url);assert.equal(u.protocol,'https:');assert(u.hostname.endsWith('.gob.mx'));}
for(const path of ['documentacion/estudio89/energia1.pdf','documentacion/estudio89/energia1.json','documentacion/boletin-locales-tecnicos.pdf','documentacion/especificacion-funcional-cbtc.pdf','documentacion/locales.json','tecnica/linea1/catalogo.json'])assert(!fs.existsSync('dist/'+path),'Restricted file still distributed: '+path);
const sources=fs.readFileSync('dist/documentos.js','utf8');assert(!sources.includes('mountKnowledge89'));assert(!sources.includes('catalogo-planos'));assert(!sources.includes('estudio89/'));
const selection=fs.readFileSync('dist/rectifier-view126.js','utf8');assert(!selection.includes('this.outline.visible=true'),'Selection frame must never be shown');
console.log('201 PASS: five-second idle guide, actions/progress/pause resets, governmental source allowlist, restricted originals/OCR/previews absent and selection outline disabled.');
