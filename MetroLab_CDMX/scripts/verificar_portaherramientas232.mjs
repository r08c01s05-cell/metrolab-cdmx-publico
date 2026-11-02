// Portaherramientas 232: dirección del mouse a herramienta en la rueda.
import assert from 'node:assert/strict';
import {wheelIndex232,HOLD_MS232} from '../dist/tool-wheel232.js';
assert.equal(wheelIndex232(0,-100,6),0,'Arriba elige la primera');
assert.equal(wheelIndex232(100,0,4),1,'Derecha es la segunda de cuatro (sentido horario)');
assert.equal(wheelIndex232(0,100,4),2,'Abajo es la tercera de cuatro');
assert.equal(wheelIndex232(-100,0,4),3,'Izquierda es la cuarta de cuatro');
assert.equal(wheelIndex232(3,4,6),-1,'Un movimiento mínimo no cambia la selección');
assert.equal(wheelIndex232(10,-100,0),-1,'Sin herramientas no hay selección');
for(let n=2;n<=10;n++)for(let i=0;i<n;i++){const a=i/n*Math.PI*2;assert.equal(wheelIndex232(Math.sin(a)*90,-Math.cos(a)*90,n),i,'Cada sector apunta a su herramienta');}
assert(HOLD_MS232>=120&&HOLD_MS232<=300,'Mantener Tab un instante abre la rueda; un toque abre la bolsa');
console.log('232 PASS: rueda de herramientas por dirección del mouse en 2 a 10 sectores, zona muerta central y diferencia entre toque y pulsación sostenida de Tab. CPU.');
