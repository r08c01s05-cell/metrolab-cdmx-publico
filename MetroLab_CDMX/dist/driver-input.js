(function(root){
function command(op,value){if(!op)return 0;const old=Math.round((op.throttle-op.brake)*100);if(value===''||!Number.isFinite(Number(value)))return old;value=Math.max(-100,Math.min(100,Math.round(Number(value))));if(value>0&&(op.phase!=='closed'||op.systemsEnabled&&(!op.deadman||op.inverter===0||op.needsCabChange))){op.message='Tracción bloqueada: comprueba puertas, hombre muerto, inversor y cabina.';return old;}op.assisted=false;op.throttle=Math.max(0,value)/100;op.brake=Math.max(0,-value)/100;op.message='';return value;}
function step(op,direction,amount=1){return command(op,Math.round((op.throttle-op.brake)*100)+(direction>0?amount:-amount));}
root.MetroDriverInput={command,step};
})(typeof window!=='undefined'?window:globalThis);
