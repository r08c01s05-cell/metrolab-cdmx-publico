import {mountInfoShell139} from './info-shell139.js?v=222';
import {renderPublicSources201} from './public-sources201.js?v=201';
const $=id=>document.getElementById(id);
let info144;
function render(){if(info144)return;renderPublicSources201($('documents-content'));info144=mountInfoShell139($('documents-content'),()=>{const b=$('guide-fault-toggle144');if(b)b.onclick=toggleFault;faultStatus();});info144.showPortal();}
function faultStatus(){updateFault144('guide-fault-toggle144','guide-fault-status144');}
function updateFault144(buttonId,statusId){const state=window.metroViewState?.(),op=state?.engine.operator,t=state?.engine.trains.find(t=>t.id===op?.trainId),valid=t?.line===1&&document.body.dataset.driving==='true';const button=$(buttonId);if(!button)return;button.disabled=!valid||(op.doorFault&&t.speed>.08);button.textContent=op?.doorFault?'Restablecer confirmación de bloqueo':'Simular pérdida de bloqueo';$(statusId).textContent=!valid?'Disponible al conducir el NM-22 de Línea 1.':op.doorFault?t.speed>.08?'Falla activa: freno de servicio. Espera a que el tren se detenga para restablecer.':'Falla activa: tren detenido, tracción bloqueada.':'Sin falla inducida. Señal de puertas: '+(op.phase==='closed'?'cerradas y bloqueadas':'ciclo de apertura/cierre');}
function toggleFault(){const state=window.metroViewState?.(),op=state?.engine.operator,t=state?.engine.trains.find(t=>t.id===op?.trainId);if(!op||t?.line!==1||document.body.dataset.driving!=='true'||op.doorFault&&t.speed>.08)return;op.doorFault=!op.doorFault;op.doorsLocked=!op.doorFault&&op.phase==='closed';op.throttle=0;op.brake=1;op.assisted=false;op.message=op.doorFault?'Falla simulada: pérdida de bloqueo de puertas. Tracción inhibida y freno de servicio.':'Confirmación restablecida. Freno mantenido; aplica tracción para salir.';faultStatus();}

$('documents-open').onclick=()=>{$('documents-dialog').showModal();render();$('documents-status').textContent='Portal técnico · prácticas educativas · fuentes públicas gubernamentales';};
$('documents-close').onclick=()=>$('documents-dialog').close();
setInterval(()=>{if($('documents-dialog').open)faultStatus();},500);
document.addEventListener('metro-study-open',()=>{$('documents-open').click();});
document.addEventListener('metro-info-open',async e=>{await $('documents-open').onclick();info144?.open(e.detail?.part);});
