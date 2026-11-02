// One circuit registry is shared by drawing, schedules, selection and exports.
const P='Pendiente · sin documentación de instalación';
const rows=[
 ['C01','Red / punto de entrega','89-1 / celdas MT','mt','CA','23 kV · referencia del simulador','Tracción: revisar exclusión 1.2.2(c)','MT'],
 ['C02','52-1 / barra MT','T-1 / primario','transformer','CA','23 kV · referencia del simulador','Tracción: revisar exclusión 1.2.2(c)','MT'],
 ['C03','T-1 / secundarios A y B','REC-1 / puentes','rectifier','CA',P,'Tracción: revisar exclusión 1.2.2(c)','BT'],
 ['C04','REC-1 / reactor','TD-CD / alimentadores de vía','dc','CD','750 V · referencia del simulador','Tracción: revisar exclusión 1.2.2(c)','CD'],
 ['C05','Vía / rieles de retorno','REC-1 / retorno','dc','CD',P,'Tracción: revisar exclusión 1.2.2(c)','CD'],
 ['C06','Fuente de auxiliares por verificar','TA-1 / transformador auxiliar','aux','CA',P,'Servicios fijos: evaluar alcance 1.2.1','BT'],
 ['C07','TA-1 / secundario','TD-AUX / tablero auxiliar','aux','CA',P,'Servicios fijos: evaluar alcance 1.2.1','BT'],
 ['C08','TD-AUX','Ventilación forzada T-1 / REC-1','transformer','CA',P,'Uso real por verificar: tracción o servicios fijos','MOTOR'],
 ['C09','TD-AUX','Luminarias del local','aux','CA',P,'Servicios fijos: evaluar alcance 1.2.1','BT'],
 ['C10','TD-AUX','Contacto de servicio','aux','CA',P,'Servicios fijos: evaluar alcance 1.2.1','BT'],
 ['C11','TD-AUX','CH-1 / cargador de baterías','battery','CA',P,'Uso real por verificar: tracción o servicios fijos','BT'],
 ['C12','CH-1 / batería B-1','TD-CTRL / control, relés, RTU','control','CD',P,'Señalización exclusiva: evaluar exclusión 1.2.2(c)','CD'],
 ['C13','TD-CTRL','Central de detección de incendio','fire','CD',P,'Servicios fijos: evaluar alcance y artículo 760','FIRE'],
 ['PE01','Barra PE / sistema de electrodos','Envolventes y masas','earth','PE','No aplica · conductor de protección','Según alcance del equipo servido','PE']
];
export const circuits171=rows.map(([id,origin,destination,part,type,voltage,scope,criterion])=>({id,origin,destination,part,type,voltage,scope,criterion,topology:'Funcional didáctica; trazado y protecciones reales por confirmar',phases:type==='CD'||type==='PE'?'No aplica':P,frequency:type==='CD'||type==='PE'?'No aplica':P,power:P,designCurrent:P,conductors:P,phaseSection:type==='CA'?P:'No aplica',neutral:type==='CA'?P:'No aplica',dcPoles:type==='CD'?P:'No aplica',protectiveConductor:P,insulation:P,temperature:P,tabulatedAmpacity:P,correctedAmpacity:P,temperatureFactor:P,groupingFactor:P,otherFactors:P,overcurrentProtection:type==='PE'?'No aplica':P,voltageDrop:type==='PE'?'No aplica':P,raceway:P,racewayDimensions:P,fill:P}));
export const references171=[
 ['Alcance','NOM-001-SEDE-2012, 1.2.1 y 1.2.2(b),(c). Clasificar tracción exclusiva y servicios fijos antes de aplicar criterios.','https://sidof.segob.gob.mx/notas/docFuente/5280607'],
 ['BT','110-14(c): terminales. 210-19(a)(1), 210-20(a), 215-2 y 215-3: conductores y protección según tipo de circuito. Artículo 220: cargas. 240-4: protección del conductor. Sin selección numérica.','https://sidof.segob.gob.mx/notas/docFuente/5280607'],
 ['Ampacidad','Tabla 310-15(b)(16): sólo en sus condiciones de aplicación, 0 a 2 000 V; 310-15(b)(2)(a): temperatura; 310-15(b)(3)(a): agrupamiento. No usar esta tabla de BT para 23 kV.','https://sidof.segob.gob.mx/notas/docFuente/5280609'],
 ['MT','310-60 y 328-80: evaluar ampacidad de cables MT. Aplicabilidad subordinada al alcance; no se dimensiona el circuito de tracción excluido por analogía automática.','https://sidof.segob.gob.mx/notas/docFuente/5280611'],
 ['Canalización','300-17 y capítulo 10, tabla 1: ocupación de tuberías según condiciones y notas; 392-22 y 392-80: ocupación y ampacidad en charolas. Tipo, diámetro interior y diámetro exterior de cables pendientes.','https://platiica.economia.gob.mx/wp-content/uploads/sites/2/PDF_Normas_Publicas/001sede2012.pdf'],
 ['PE','250-122 y su tabla: conductor de puesta a tierra de equipos; 250-66: conductor del electrodo, función distinta. Identificación: 200-6 y 250-119. No unir por defecto retorno de tracción y PE.','https://sidof.segob.gob.mx/notas/docFuente/5280609'],
 ['Motores / transformadores','430-22, 430-32 y 430-52: motor, sobrecarga y cortocircuito son verificaciones distintas. 450-3: protección de transformadores.','https://sidof.segob.gob.mx/notas/docFuente/5280613'],
 ['Incendio','Artículo 760: clasificar alimentación de incendio antes de seleccionar conductores.','https://sidof.segob.gob.mx/notas/docFuente/5280621'],
 ['Caída de tensión','Notas de 210-19(a)(1) y 215-2(a)(3), nota 2: recomendaciones de caída de tensión; no son un límite obligatorio universal. Faltan longitud, impedancia, carga y factor de potencia.','https://sidof.segob.gob.mx/notas/docFuente/5280607'],
 ['Unidades','NOM-008-SE-2021 vigente: capítulos 5 y 6, 6.2 y 6.3; aclaración de 23 abril 2024. V, A, Hz, W, V·A, mm², mm y °C. No confundir unidades con símbolos eléctricos.','https://platiica.economia.gob.mx/normalizacion/nom-008-se-2021/'],
 ['Simbología','IEEE/ANSI 315-1975: convención gráfica estadounidense (Inactive-Reserved). IEEE C37.2-2022: 89 seccionador de línea, 52 interruptor CA, 72 interruptor CD y 50/51 sobrecorriente. No son requisitos mexicanos de instalación. Cotejo con texto autorizado pendiente.','https://standards.ieee.org/ieee/315/515/'],
 ['México / símbolos','NMX-J-136-ANCE-2019: referencia nacional de abreviaturas y símbolos; cotejo pendiente. Este modelo documental no acredita conformidad.','https://platiica.economia.gob.mx/normalizacion/nmx-j-136-ance-2019/']
];
// Function numbers identify devices; the Cxx registry still identifies circuits.
// 52 applies to AC circuit breakers; the DC traction breaker is function 72.
export const deviceFunctions196=Object.freeze([
 {tag:'89-1',number:89,name:'Seccionador de línea',circuit:'C01',symbol:'knife'},
 {tag:'52-1',number:52,name:'Interruptor de corriente alterna',circuit:'C01',symbol:'breaker'},
 {tag:'72-CD',number:72,name:'Interruptor de corriente directa',circuit:'C04',symbol:'breaker'},
 {tag:'52-AUX',number:52,name:'Interruptor de auxiliares CA',circuit:'C06',symbol:'breaker'}
].map(Object.freeze));
export function drawing171(){
 const a=[];let id=null;const L=(x,y,u,v,l='SIMBOLOS')=>a.push({t:'L',x,y,u,v,l,c:id}),C=(x,y,r)=>a.push({t:'C',x,y,r,l:'SIMBOLOS',c:id}),T=(x,y,s,h=2.6)=>a.push({t:'T',x,y,s,h:Math.max(3,h),l:'TEXTOS',c:id});
 const R=(x,y,w,h)=>{L(x,y,x+w,y);L(x+w,y,x+w,y+h);L(x+w,y+h,x,y+h);L(x,y+h,x,y);},wire=(key,x,y,u,v)=>{id=key;L(x,y,u,v);id=null;},tag=(key,x,y)=>{id=key;T(x,y,key,2.6);id=null;};
 // American open knife contact and arc breaker; symbols used consistently.
 const knife=(x,y)=>{C(x,y,.6);C(x,y+10,.6);L(x,y+10,x+5,y+1);};
 const breaker=(x,y)=>{L(x,y,x,y+3);L(x,y+9,x,y+12);for(let i=0;i<12;i++){const t=i*Math.PI/12,u=(i+1)*Math.PI/12;L(x+3*Math.sin(t),y+6-3*Math.cos(t),x+3*Math.sin(u),y+6-3*Math.cos(u));}};
 const device=(tag,x,y,tx,ty,label=tag)=>{const spec=deviceFunctions196.find(d=>d.tag===tag),start=a.length;id=spec.circuit;(spec.symbol==='knife'?knife:breaker)(x,y);T(tx,ty,label);for(let i=start;i<a.length;i++)a[i].device196=tag;id=null;};
 const coil=(x,y,n=3)=>{for(let j=0;j<n;j++)for(let i=0;i<12;i++){const t=-Math.PI/2+i*Math.PI/12,u=-Math.PI/2+(i+1)*Math.PI/12;L(x+2.2*Math.cos(t),y+j*4+2+2*Math.sin(t),x+2.2*Math.cos(u),y+j*4+2+2*Math.sin(u));}};
 const load=(x,y,name)=>{R(x-14,y,28,10);T(x-12,y+6,name,2.5);};
 R(7,7,406,283);L(7,34,413,34);L(7,258,413,258);L(214,34,214,258);
 T(14,18,'SUBESTACIÓN RECTIFICADORA',4.5);T(14,26,'SR-UN-001 · REV. 171 · UNIFILAR FUNCIONAL / CÉDULAS POR CIRCUITO',2.8);
 T(14,42,'01 / TRACCIÓN',3.2);T(224,42,'02 / SERVICIOS AUXILIARES',3.2);
 T(24,53,'RED / PUNTO DE ENTREGA');T(24,59,'23 kV de referencia · fases / Hz pendientes',2.3);
 wire('C01',45,62,45,70);tag('C01',49,67);device('89-1',45,70,57,77);wire('C01',45,80,45,86);device('52-1',45,86,57,93);C(45,104,2.3);L(47.3,104,77,104,'CONTROL');C(83,104,6);T(78,105,'50/51',2);T(95,105,'TC / relé CA',2.4);
 wire('C02',45,98,45,116);tag('C02',25,113);C(45,120,4);C(45,127,4);T(61,121,'T-1 · SECO');T(61,127,'Secundarios / V·A / conexión: pendientes',2.2);
 wire('C03',45,131,45,138);tag('C03',52,135);load(48,138,'REC-1');T(69,144,'12 diodos / dos puentes',2.3);T(69,150,'Bloque funcional CA / CD',2.2);
 wire('C04',48,148,48,155);coil(48,155);T(61,162,'REACTOR');wire('C04',48,167,48,176);wire('C04',48,176,174,176);tag('C04',51,173);T(69,182,'BARRA + / 750 V de referencia',2.4);
 wire('C04',174,176,174,188);device('72-CD',174,188,145,196);wire('C04',174,200,174,211);load(174,211,'VÍA / TREN');
 wire('C05',174,221,174,232);wire('C05',174,232,22,232);wire('C05',22,232,22,143);wire('C05',22,143,34,143);tag('C05',25,228);T(46,239,'RETORNO CD− / RIELES · independiente de PE',2.4);
 // Aux source deliberately separate: no unsupported tap from the traction bus.
 T(225,53,'FUENTE AUXILIAR POR VERIFICAR',2.6);wire('C06',242,57,242,64);tag('C06',247,62);device('52-AUX',242,64,252,72,'52-AUX · calibre pendiente');wire('C06',242,76,242,81);C(242,85,4);C(242,92,4);T(255,87,'TA-1 / transformador auxiliar',2.4);
 wire('C07',242,96,242,101);tag('C07',250,98);load(245,101,'TD-AUX');wire('C07',245,111,245,120);wire('C07',229,120,399,120);T(270,116,'BARRA AUX / tensión pendiente',2.4);
 for(const [key,x,name,part]of[['C08',235,'VENTILACIÓN','transformer'],['C09',279,'LUMINARIAS','aux'],['C10',323,'CONTACTO','aux'],['C11',387,'CARGADOR','battery']]){wire(key,x,120,x,127);id=key;breaker(x,127);id=null;wire(key,x,139,x,151);tag(key,x-6,147);id=key;load(x,151,name);id=null;}
 wire('C12',387,161,387,177);tag('C12',391,174);L(382,177,392,177);L(384,180,390,180);L(382,184,392,184);L(384,187,390,187);T(352,184,'B-1',2.4);wire('C12',387,187,387,199);wire('C12',387,199,280,199);wire('C12',280,199,280,205);id='C12';load(280,205,'TD-CTRL');id=null;T(301,211,'Control / relés / RTU',2.2);tag('C12',310,196);
 wire('C13',280,215,280,221);id='C13';breaker(280,221);id=null;wire('C13',280,233,280,239);id='C13';load(280,239,'INCENDIO');id=null;tag('C13',285,237);
 id='PE01';L(22,250,191,250,'PE');L(191,245,191,252,'PE');L(187,252,195,252,'PE');L(188,254,194,254,'PE');L(189,256,193,256,'PE');T(28,247,'PE01 / MASAS · SIN ENLACE AL RETORNO',2.2);id=null;
 T(14,265,'LEYENDA / IEEE/ANSI 315-1975 (Inactive-Reserved) · funciones IEEE C37.2-2022',2.5);
 T(14,271,'89: seccionador · 52: interruptor CA · 72: interruptor CD · 50/51: protección de sobrecorriente',2.4);
 T(14,277,'TC: medida · círculos: transformador · bobina: reactor · cajas: bloques funcionales, no resistencias',2.4);
 T(14,283,'NOM-008-SE-2021 / SI · NOM-001-SEDE: alcance por verificar · NO ES PLANO PARA CONSTRUCCIÓN',2.4);
 return a;
}
const esc=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&apos;'}[c]));
export function svg171(){return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 420 297" role="img" aria-label="Unifilar de subestación, negro sobre blanco"><style>line,circle{stroke:#000;stroke-width:.3;fill:none}text{fill:#000;stroke:none;font-family:Arial,sans-serif}.circuit171{cursor:pointer}.circuit171:hover line,.circuit171[aria-pressed=true] line{stroke-width:.7}.circuit171:focus{outline:1px dashed #000}</style><rect width="420" height="297" fill="#fff"/>${drawing171().map(o=>{const s=o.t==='T'?`<text x="${o.x}" y="${o.y}" font-size="${o.h}">${esc(o.s)}</text>`:o.t==='C'?`<circle cx="${o.x}" cy="${o.y}" r="${o.r}"/>`:`<line x1="${o.x}" y1="${o.y}" x2="${o.u}" y2="${o.v}"/>`;return o.c?`<g class="circuit171" role="button" tabindex="0" data-circuit171="${o.c}" aria-label="Cédula ${o.c}">${s}</g>`:s;}).join('')}</svg>`;}
export function mountSchedules171(overlay,onPart){
 const tools=overlay.querySelector('.cad168-tools'),btn=document.createElement('button');btn.textContent='Cédulas de cableado';btn.dataset.cadSchedules171='';btn.setAttribute('aria-expanded','false');tools.append(btn);
 const pane=document.createElement('aside');pane.className='schedule171';pane.hidden=true;pane.innerHTML=`<header><h3>Cédulas por circuito</h3><button data-schedule-close>×</button></header><p>Identificadores del plano funcional. «Pendiente» indica ausencia de dato; no equivale a cero ni a una selección de ingeniería.</p><label>Circuito <select data-schedule-select>${circuits171.map(c=>`<option value="${c.id}">${c.id} · ${esc(c.destination)}</option>`).join('')}</select></label><div data-schedule-data></div><button data-schedule-model>Ubicar equipo en 3D</button><button data-schedule-csv>Descargar todas · CSV</button><details><summary>Criterios y fuentes oficiales</summary>${references171.map(([name,body,url])=>`<p><strong>${name}</strong> · ${body} <a href="${url}" target="_blank" rel="noopener">Fuente oficial ↗</a></p>`).join('')}<p>No se declara cumplimiento normativo. Simbología gráfica, unidades y requisitos de instalación son documentos diferentes. Fecha de consulta: 21 octubre 2026.</p></details>`;overlay.querySelector('.cad168-body').append(pane);
 const fields=[['origin','Origen'],['destination','Destino'],['topology','Estado de la topología'],['scope','Alcance normativo'],['voltage','Tensión / V'],['type','Naturaleza de corriente'],['phases','Fases'],['frequency','Frecuencia / Hz'],['power','Potencia / W o V·A'],['designCurrent','Corriente de diseño / A'],['conductors','Cantidad y material de conductores'],['phaseSection','Fases: cantidad y sección / mm²'],['neutral','Neutro: cantidad y sección / mm²'],['dcPoles','CD: polos / retorno, cantidad y sección / mm²'],['protectiveConductor','PE: cantidad, material y sección / mm²'],['insulation','Tipo y tensión de aislamiento'],['temperature','Temperatura nominal / °C'],['tabulatedAmpacity','Ampacidad tabulada / A y tabla'],['temperatureFactor','Factor de temperatura'],['groupingFactor','Factor de agrupamiento'],['otherFactors','Otros ajustes'],['correctedAmpacity','Ampacidad corregida / A'],['overcurrentProtection','Protección / A, polos, capacidad interruptiva'],['voltageDrop','Caída de tensión / V y %'],['raceway','Tubería / charola: tipo'],['racewayDimensions','Diámetro o dimensiones / mm'],['fill','Ocupación / % y criterio']];
 let selected=circuits171[0];const select=key=>{selected=circuits171.find(c=>c.id===key)||selected;pane.hidden=false;btn.setAttribute('aria-expanded','true');pane.querySelector('select').value=selected.id;pane.querySelector('[data-schedule-data]').innerHTML=`<h4>${selected.id} · ${esc(selected.origin)} → ${esc(selected.destination)}</h4><table><tbody>${fields.map(([k,label])=>`<tr><th scope="row">${label}</th><td>${esc(selected[k])}</td></tr>`).join('')}</tbody></table><p>Criterio asociado: ${selected.criterion}. Consulta las fuentes al pie. No se ha calculado corriente, ampacidad, caída de tensión ni ocupación por falta de datos.</p>`;for(const el of overlay.querySelectorAll('[data-circuit171]'))el.setAttribute('aria-pressed',String(el.dataset.circuit171===selected.id));};
 btn.onclick=()=>{pane.hidden?!select(selected.id):(pane.hidden=true);btn.setAttribute('aria-expanded',String(!pane.hidden));};pane.querySelector('[data-schedule-close]').onclick=()=>{pane.hidden=true;btn.setAttribute('aria-expanded','false');};pane.querySelector('select').onchange=e=>select(e.target.value);pane.querySelector('[data-schedule-model]').onclick=()=>onPart(selected.part);
 overlay.addEventListener('click',e=>{const c=e.target.closest('[data-circuit171]');if(c)select(c.dataset.circuit171);});overlay.addEventListener('keydown',e=>{const c=e.target.closest('[data-circuit171]');if(c&&['Enter',' '].includes(e.key)){e.preventDefault();select(c.dataset.circuit171);}});
 pane.querySelector('[data-schedule-csv]').onclick=()=>{const f=[['id','Circuito'],...fields],quote=s=>'"'+String(s).replaceAll('"','""')+'"',csv='\uFEFF'+[f.map(x=>quote(x[1])).join(','),...circuits171.map(c=>f.map(([k])=>quote(c[k])).join(','))].join('\r\n'),u=URL.createObjectURL(new Blob([csv],{type:'text/csv;charset=utf-8'})),a=document.createElement('a');a.href=u;a.download='MetroLab_Cedulas_R171.csv';a.click();setTimeout(()=>URL.revokeObjectURL(u),1000);};
 return{select};
}
