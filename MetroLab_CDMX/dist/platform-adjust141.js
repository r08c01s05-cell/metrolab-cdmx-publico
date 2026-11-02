(function(root){
const MAX_DISTANCE=150,MAX_SPEED=2/3.6;
function stop(engine,message){const op=engine.operator;if(!op?.platformAdjust)return;const t=engine.trains.find(t=>t.id===op.trainId);op.inverter=op.platformAdjust.inverter;op.platformAdjust=null;op.throttle=0;op.brake=1;op.assisted=false;if(t){t.speed=0;t.state=message;}op.message=message;}
function blocked(engine,t,sign){return engine.trains.some(o=>o!==t&&o.line===t.line&&o.direction===t.direction&&(o.position-t.position)*sign>0&&(o.position-t.position)*sign<180);}
function request(engine){const op=engine.operator,t=engine.trains.find(t=>t.id===op?.trainId);if(!op||!t)return false;
 if(op.platformAdjust){stop(engine,'Ajuste cancelado · freno aplicado.');return false;}
 const n=root.MetroManual.nearestStation(engine,t),position=engine.lines[t.line].distances[n.index],sign=Math.sign(position-t.position);
 let reason=t.speed>.08?'Detén el tren antes de ajustar la parada.':op.phase!=='closed'?'Cierra las puertas antes de mover el tren.':op.doorFault||op.doorsLocked===false?'Restablece el bloqueo de puertas antes del ajuste.':engine.emergency?'Rearma la emergencia antes del ajuste.':!engine.power[t.line]?'Restablece la alimentación de tracción.':op.systemsEnabled&&!op.deadman?'Mantén el hombre muerto para ajustar la parada.':op.needsCabChange?'Completa el cambio de cabina antes del ajuste.':n.distance>MAX_DISTANCE?'Ajuste disponible a un máximo de 150 m de la marca del andén.':blocked(engine,t,sign)?'Ajuste bloqueado por otro tren en la vía.':'';
 if(reason){op.message=reason;return false;}
 if(n.distance<=.02){op.message='Tren alineado con el andén. Puedes abrir las puertas.';return false;}
 op.platformAdjust={index:n.index,position,origin:t.position,inverter:op.inverter,sign};op.assisted=false;op.throttle=0;op.brake=1;op.easyTargetSpeed=0;op.inverter=sign*t.direction;
 op.message='Ajustando '+(op.inverter===-1?'hacia atrás':'hacia adelante')+' · máximo 2 km/h.';return true;
}
function step(engine,t,dt){const op=engine.operator,a=op?.platformAdjust;if(!a)return false;
 if(engine.emergency||!engine.power[t.line]||op.phase!=='closed'||op.doorFault||op.doorsLocked===false||op.systemsEnabled&&!op.deadman||op.needsCabChange||op.throttle>0||op.brake<1||op.inverter!==a.sign*t.direction||blocked(engine,t,a.sign)){stop(engine,'Ajuste interrumpido · comprueba energía, puertas, vigilancia y mandos.');return true;}
 const remaining=Math.abs(a.position-t.position);dt=Number.isFinite(dt)?Math.max(0,Math.min(.25,dt)):0;
 t.speed=Math.min(MAX_SPEED,t.speed+.35*dt,Math.sqrt(2*.6*remaining));const travel=Math.min(remaining,t.speed*dt);t.position+=a.sign*travel;
 op.message='Ajustando '+(op.inverter===-1?'hacia atrás':'hacia adelante')+' · faltan '+Math.max(0,remaining-travel).toFixed(2)+' m.';t.state=op.message;
 if(remaining-travel<=.02){t.position=a.position;t.target=a.index;stop(engine,'Tren alineado con el andén · freno aplicado. Puedes abrir las puertas.');}
 return true;
}
root.MetroPlatformAdjust={request,step,stop};
})(typeof window!=='undefined'?window:globalThis);
