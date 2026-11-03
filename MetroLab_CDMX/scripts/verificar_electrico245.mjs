// Análisis eléctrico 245: modelo de corriente, tensión, potencia y energía del tren en conducción.
import assert from 'node:assert/strict';
import {electricState245,DOCUMENTED245,ASSUMED245,REFERENCE_KW245} from '../dist/electric-dashboard245.js';

const rest=electricState245({v:0,a:0,load:0,traction:0,brake:1,powered:true});
assert.equal(rest.tractionKW,0);assert(Math.abs(rest.auxKW-ASSUMED245.auxKW)<1e-9,'Detenido solo consumen los auxiliares');
assert(rest.V<DOCUMENTED245.nominalV&&rest.V>740&&Math.abs(rest.I-rest.auxKW*1000/rest.V)<1e-6,'I = P/V con tensión nominal de 750 V CD');
const run=electricState245({v:10,a:1,load:600,traction:1,powered:true});
assert(run.tractionKW>2000&&run.I>run.tractionKW*1000/750*.99,'Al acelerar crecen potencia y corriente');assert(run.V<rest.V,'La tensión baja con la corriente');
assert(Math.abs(run.massT-(DOCUMENTED245.emptyT+600*.07))<1e-9,'La masa sube con los pasajeros (70 kg c/u)');
assert(electricState245({v:10,a:0,load:5000,traction:1}).massT===DOCUMENTED245.loadedT,'La masa no pasa de la carga completa documentada');
const cruise=electricState245({v:15,a:0,traction:1});assert(cruise.tractionKW>0&&cruise.tractionKW<run.tractionKW,'A velocidad constante solo se vence la resistencia al avance');
const brake=electricState245({v:15,a:-1.2,traction:0,brake:.8});assert(brake.tractionKW===0&&brake.brakeKW>0&&brake.I>0,'Al frenar no hay tracción y la energía se disipa en el reóstato');
const off=electricState245({v:5,a:0,traction:1,powered:false});assert(off.V===0&&off.I===0&&off.tractionKW===0,'Sin energía en la línea no hay corriente');
assert.equal(REFERENCE_KW245,3400);
const fast=electricState245({v:22,a:1.4,load:1200,traction:1});assert(fast.limited&&fast.tractionKW===ASSUMED245.maxKW&&fast.I<6000,'Si el movimiento pide más potencia que la máxima, se limita y se marca');
console.log('245 PASS: corriente = potencia de entrada / tensión en terminales con 750 V CD nominal y caída por la alimentación; masa con pasajeros acotada a la carga documentada; tracción, crucero, frenado reostático y línea sin energía.');
