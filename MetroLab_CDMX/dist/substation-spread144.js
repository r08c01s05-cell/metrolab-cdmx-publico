import * as THREE from 'three';
// Adapt the incoming branch's semantic despiece to the current Blender asset.
// Never add duplicate components, replace cabinets or alter a door hinge.
const rules=[['Envolvente y bastidor',/puerta|chapa|bastidor|envolvente|carcasa|resguardo|panel exterior/i,[0,0,-.32]],['Barras y conexiones',/barra|cobre|terminal|borna|conexion|conexión/i,[0,.32,0]],['Núcleo y bobinados',/nucleo|núcleo|bobina|devanado/i,[0,0,.3]],['Potencia y refrigeración',/diodo|potencia|disipador|rectifica|aleta/i,[.3,0,0]],['Control e instrumentación',/control|rele|relé|indicador|instrument|medidor|display|rtu/i,[-.3,0,0]],['Cableado y auxiliares',/cable|conductor|ventila|filtro|bateria|batería/i,[0,.16,.3]]];
export function partitionSubstation144(model,parts,doors){
 const rows=[];
 for(const id of ['mt','transformer','rectifier','dc','control','battery','aux']){
  const part=parts.get(id),buckets=new Map();
  for(const child of [...part.children]){
   let match=rules.find(r=>r[1].test(child.name));if(doors.includes(child))match=rules[0];
   const [label,,offset]=match||['Aisladores y soportes',null,[0,-.16,0]];
   if(!buckets.has(label)){const group=new THREE.Group();group.name='Despiece144 · '+label;part.add(group);const row={id,label,group,offset:new THREE.Vector3(...offset)};buckets.set(label,row);rows.push(row);}
   buckets.get(label).group.add(child);
  }
 }
 model.userData.spread144=rows;return rows;
}
export function detailSpread144(model,amount){amount=THREE.MathUtils.clamp(Number(amount)||0,0,1);for(const row of model.userData.spread144||[])row.group.position.copy(row.offset).multiplyScalar(amount);model.updateMatrixWorld(true);}
export function installSpread144(view){
 const doc=view.dialog.ownerDocument||document,label=doc.createElement('label');label.className='sr144-spread';label.textContent='Separación del despiece';const input=doc.createElement('input');input.type='range';input.min='0';input.max='100';input.step='5';input.value='0';input.setAttribute('aria-label','Separación de conjuntos y componentes de la subestación');label.append(input);view.dialog.querySelector('.sr137-advanced>div').append(label);
 const list=doc.createElement('p');list.dataset.srDetails144='';view.dialog.querySelector('[data-sr-description]').after(list);
 const render=()=>{list.textContent=(view.model.userData.spread144||[]).filter(r=>r.id===view.selected).map(r=>r.label).join(' · ');};
 view.dialog.addEventListener('click',render);const apply=value=>{
  if(view.service128?.active)return;const amount=Number(value)/100;input.value=String(value);view.exploded=amount>0;view.interior=true;view.cameraPreset134='general';
  for(const[id,g]of view.parts){const i=[...view.parts.keys()].indexOf(id);g.position.set(amount&&i<7?(i-3)*.9*amount:0,amount&&id==='roof'?2.5*amount:0,amount&&i<7?(i%2?-2:1.5)*amount:0);}
  detailSpread144(view.model,amount);view.applyVisibility();view.outlineUntil140=performance.now()+1400;render();
 };
 input.addEventListener('input',()=>apply(input.value));view.dialog.querySelector('[data-sr-explode]').addEventListener('click',()=>{apply(view.exploded?75:0);});
 const reset=()=>{input.value='0';detailSpread144(view.model,0);};for(const key of ['home','entry','maintain-mode'])view.dialog.querySelector('[data-sr-'+key+']')?.addEventListener('click',reset);
 view.spread144={input,reset,apply};
 const service=view.service128,originalSetActive=service.setActive.bind(service);let savedAmount=0;service.setActive=function(active){if(active===this.active)return originalSetActive(active);if(active&&!this.active){savedAmount=Number(input.value);detailSpread144(view.model,0);}originalSetActive(active);input.disabled=this.active;if(!this.active){input.value=String(savedAmount);detailSpread144(view.model,savedAmount/100);}};render();
}
