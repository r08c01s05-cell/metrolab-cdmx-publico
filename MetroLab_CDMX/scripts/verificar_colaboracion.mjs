// Ejecutar desde MetroLab_CDMX. Usa sólo Node y Python; no instala paquetes.
import {spawnSync} from 'node:child_process';
const checks=[
 ['node','scripts/verificar_imports122.mjs'],
 ['node','scripts/verificar_privacidad_ayuda201.mjs'],
 ['node','scripts/verificar_audio206.mjs'],
 ...['intervalos254','energia250','energia249','animaciones218','fallos217','alimentacion216','carga214','referencias213','apoyos212','pasajeros_curva211','afluencia210','superficie209','embarque209','coyuya208','embarque208','cargas197','frente_colaboracion','bolsa196','herrajes196','simbologia196','colision196',
     'espacio192','transporte188','juego187','mezcla187','materiales194',
     'controles181','anden181','tren_montado156','conduccion177',
     'agarre199','taller199','puertas200','embarque200','fluidez202','multitud202',
     'destornillador202','interior202','personas203','presentacion203','realismo205','fluidez222','realismo224','fenomenos225','laboratorio229','guante230','portaherramientas232','animaciones235','portaherramientas236','puertas237','cinturon239','electrico245','flujos250','subestacion251','red256','dinamica257']
   .map(name=>['node','--experimental-loader','./scripts/test-loader.mjs',`scripts/verificar_${name}.mjs`]),
 ['python','scripts/verificar_servidor144.py']
];
if(process.platform!=='win32')checks.push(['python','scripts/verificar_servicio_codespace.py']);
else console.log('Codespaces: su prueba de fcntl se ejecuta en Linux/GitHub Actions.');
function python(){
 if(process.env.METROLAB_PYTHON)return [process.env.METROLAB_PYTHON];
 for(const command of(process.platform==='win32'?['py','python','python3']:['python3','python'])){
  const args=command==='py'?['-3']:[];
  const probe=spawnSync(command,[...args,'-c','import sys; sys.exit(sys.version_info < (3,10))'],{stdio:'ignore'});
  if(probe.status===0)return [command,...args];
 }
 throw Error('Falta Python 3.10+. Instálalo o define METROLAB_PYTHON con su ruta.');
}
for(const [kind,...args]of checks){
 console.log(`\nVerificando: ${args.at(-1)}`);
 const [command,...prefix]=kind==='node'?[process.execPath]:python();
 const result=spawnSync(command,[...prefix,...args],{stdio:'inherit'});
 if(result.error){console.error(result.error.message);process.exit(1);}
 if(result.status!==0)process.exit(result.status||1);
}
console.log('\nVerificaciones de colaboración completadas.');

