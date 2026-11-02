// Wait for the real data engine, rather than dropping a menu click during startup.
export function waitForSimulation95(host=window,timeoutMs=15000){
 if(typeof host.launchTrainExperience==='function')return Promise.resolve();
 return new Promise((resolve,reject)=>{const done=()=>{if(typeof host.launchTrainExperience!=='function')return;cleanup();resolve();},cleanup=()=>{clearTimeout(timer);host.removeEventListener('metro-ready',done);};const timer=setTimeout(()=>{cleanup();reject(Error('No terminaron de cargar los datos del recorrido. Pulsa Reintentar.'));},timeoutMs);host.addEventListener('metro-ready',done);done();});
}
