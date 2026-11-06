import * as T from 'three';

// Detalle 251 de la planta rectificadora. Agrega a cada conjunto las piezas que se ven en una
// instalación de este tipo y que la maqueta no tenía: terminales de cable en las celdas de media
// tensión, sensores y relevador de temperatura en el transformador, redes RC junto a los diodos,
// derivador (shunt) y zapatas con termocontráctil en las celdas de CD, pilotos y etiquetas en el
// control, tapones de ventilación y marcas de nivel en las baterías, tapetes aislantes y franjas
// de seguridad en el piso. Todo se ancla a las piezas existentes por su nombre, así que sigue al
// modelo aunque cambie de lugar. Es detalle visual didáctico: no fija marcas, valores ni modelos
// de fabricante.
const MAT251={};
function mat(key){if(MAT251[key])return MAT251[key];const spec={
 rubber:['Hule terminal 251','#5c2b24',0,.78],sheath:['Cubierta cable 251','#1b1d1f',0,.7],copper:['Cobre 251','#b8743f',.85,.32],tin:['Estañado 251','#b9bdb8',.8,.35],
 brass:['Laton 251','#b99a4b',.8,.35],red:['Termocontractil rojo 251','#a8322b',0,.55],blue:['Termocontractil azul 251','#2f5d9c',0,.55],black:['Plastico negro 251','#16191b',0,.6],
 white:['Plastico blanco 251','#dfe3dc',0,.55],grey:['Plastico gris 251','#7c8580',0,.6],mat:['Tapete aislante 251','#222527',0,.92],yellow:['Pintura seguridad 251','#e2b531',0,.6],
 ledg:['LED verde 251','#3bd36b',0,.4,'#3bd36b'],ledr:['LED rojo 251','#ff4a3a',0,.4,'#ff4a3a'],leda:['LED ambar 251','#ffb238',0,.4,'#ffb238'],screen:['Pantalla 251','#7fd6c8',.1,.3,'#4fb8a8'],
 resistor:['Resistencia 251','#c6b48a',0,.6],cap:['Capacitor 251','#3b6fae',.1,.45],steel:['Acero 251','#8e989c',.7,.38]}[key];
 const m=new T.MeshStandardMaterial({name:spec[0],color:spec[1],metalness:spec[2],roughness:spec[3]});if(spec[4]){m.emissive=new T.Color(spec[4]);m.emissiveIntensity=.9;}return MAT251[key]=m;}
const GEO251=new Map();
function geo(key,make){if(!GEO251.has(key))GEO251.set(key,make());return GEO251.get(key);}
// Find meshes by name (before the assemblies are merged) and their world boxes.
function meshes(root,re){const out=[];root?.traverse(o=>{if(o.isMesh&&re.test(o.name))out.push(o);});return out;}
function box3(o){return new T.Box3().setFromObject(o);}
export function detailSubstation251(model,parts){
 if(model.userData.detail251)return model.userData.detail251;model.updateMatrixWorld(true);const report={};
 const holder=id=>{const part=parts.get(id);if(!part)return null;let g=part.getObjectByName('Detalle251_'+id);if(!g){g=new T.Group();g.name='Detalle251_'+id;g.matrixAutoUpdate=false;g.matrix.copy(part.matrixWorld).invert();part.add(g);g.updateMatrixWorld(true);}return g;};
 const put=(g,name,geometry,m,x,y,z,rot)=>{const o=new T.Mesh(geometry,mat(m));o.name=name;o.position.set(x,y,z);if(rot)o.rotation.set(...rot);g.add(o);return o;};
 const box=(g,name,x,y,z,w,h,d,m)=>put(g,name,geo(`b${w},${h},${d}`,()=>new T.BoxGeometry(w,h,d)),m,x,y,z);
 const cyl=(g,name,x,y,z,r,h,m,rot,seg=14)=>put(g,name,geo(`c${r},${h},${seg}`,()=>new T.CylinderGeometry(r,r,h,seg)),m,x,y,z,rot);
 const count=(id,n)=>{report[id]=(report[id]||0)+n;};
 // 1 · MT cells: cable terminations with sheds under each pole, plus incoming cable.
 {const g=holder('mt');for(const c of meshes(parts.get('mt'),/^Conexion_MT/)){const b=box3(c),x=(b.min.x+b.max.x)/2,z=(b.min.z+b.max.z)/2;
   cyl(g,'Cable_MT_aislado251',x,.36,z,.024,.5,'sheath');cyl(g,'Cono_de_esfuerzo251',x,.66,z,.034,.14,'rubber');
   for(let k=0;k<3;k++)cyl(g,'Campana_terminal251',x,.76+k*.07,z,.058-k*.006,.012,'rubber',null,18);
   cyl(g,'Zapata_terminal_MT251',x,.99,z,.016,.08,'tin');box(g,'Pala_zapata251',x,1.05,z,.034,.05,.008,'tin');count('mt',8);}}
 // 2 · Transformer: PT100 sensors on each winding, wiring to a temperature relay, anti-vibration pads.
 {const g=holder('transformer'),coils=meshes(parts.get('transformer'),/^Devanado_encapsulado/);let relay=null;
  if(coils.length){const all=new T.Box3();for(const c of coils)all.union(box3(c));relay={x:all.max.x+.28,y:1.55,z:all.min.z+.05};
   box(g,'Rele_temperatura251',relay.x,relay.y,relay.z,.2,.28,.1,'grey');box(g,'Display_rele251',relay.x,relay.y+.06,relay.z-.052,.15,.07,.006,'screen');
   for(const [k,m] of ['ledg','leda','ledr'].entries())box(g,'Piloto_rele251',relay.x-.05+k*.05,relay.y-.06,relay.z-.052,.018,.018,.006,m);
   for(const c of coils){const b=box3(c),x=(b.min.x+b.max.x)/2,top=b.max.y;cyl(g,'Sonda_PT100_251',x+.08,top+.03,b.min.z+.1,.012,.07,'steel');
    const wire=new T.CatmullRomCurve3([new T.Vector3(x+.08,top+.07,b.min.z+.1),new T.Vector3(x+.08,top+.16,b.min.z+.05),new T.Vector3(relay.x-.05,top+.12,relay.z+.02),new T.Vector3(relay.x,relay.y+.15,relay.z+.02)]);
    put(g,'Cable_PT100_251',new T.TubeGeometry(wire,24,.006,6,false),'black',0,0,0);
    for(let r=0;r<4;r++)box(g,'Puente_de_tomas251',x-.09+r*.06,(b.min.y+b.max.y)/2-.08,b.min.z-.006,.035,.012,.012,'copper');count('transformer',7);}
   for(const sx of[all.min.x+.1,all.max.x-.1])for(const sz of[all.min.z+.1,all.max.z-.1])box(g,'Amortiguador_vibracion251',sx,.11,sz,.14,.05,.14,'black');}}
 // 3 · Rectifier: RC snubber beside every diode and monitoring wire of each fuse.
 {const g=holder('rectifier');for(const d of meshes(parts.get('rectifier'),/^Diodo_potencia/)){const b=box3(d),x=(b.min.x+b.max.x)/2,y=(b.min.y+b.max.y)/2,z=b.min.z;
   box(g,'Placa_RC251',x-.2,y,z+.03,.1,.12,.012,'white');cyl(g,'Resistencia_RC251',x-.2,y+.03,z+.015,.012,.08,'resistor',[0,0,Math.PI/2]);cyl(g,'Capacitor_RC251',x-.2,y-.03,z+.012,.014,.03,'cap',[Math.PI/2,0,0]);count('rectifier',3);}}
 // 4 · DC cells: current shunt on the positive bar, lugs with red/blue heat-shrink on the outgoing cables.
 {const g=holder('dc');for(const bar of meshes(parts.get('dc'),/^Barra_CD_(positivo|retorno)/)){const b=box3(bar),x=(b.min.x+b.max.x)/2,z=(b.min.z+b.max.z)/2,positive=/positivo/.test(bar.name);
   if(positive){box(g,'Derivador_shunt251',x,.95,z-.03,.1,.14,.03,'brass');for(const dy of[-.045,0,.045])box(g,'Lamina_shunt251',x,.95+dy,z-.05,.08,.012,.008,'copper');for(const dx of[-.035,.035])cyl(g,'Borne_shunt251',x+dx,1.04,z-.05,.008,.03,'brass');}
   cyl(g,'Zapata_CD251',x,.68,z,.02,.08,'tin');cyl(g,'Termocontractil_CD251',x,.56,z,.026,.16,positive?'red':'blue');cyl(g,'Cable_CD251',x,.32,z,.022,.34,'sheath');count('dc',positive?8:3);}}
 // 5 · Control: status LEDs and white labels on the DIN modules, LEDs on the PLC.
 {const g=holder('control');for(const m of meshes(parts.get('control'),/^Modulo_DIN/)){const b=box3(m),x=(b.min.x+b.max.x)/2,z=b.min.z;
   box(g,'Etiqueta_modulo251',x,b.min.y+.03,z-.002,(b.max.x-b.min.x)*.8,.022,.004,'white');box(g,'LED_modulo251',x,b.max.y-.03,z-.002,.012,.012,.005,(Math.round(x*100)%3)?'ledg':'leda');count('control',2);}}
 // 6 · Batteries: vent plugs, min/max level lines and polarity marks on every cell.
 {const g=holder('battery');for(const c of meshes(parts.get('battery'),/^Celda_bateria/)){const b=box3(c),x=(b.min.x+b.max.x)/2,top=b.max.y,front=b.max.z;
   for(const dz of[-.06,.06])cyl(g,'Tapon_ventilacion251',x,top+.018,(b.min.z+b.max.z)/2+dz,.016,.03,'grey',null,10);
   for(const [y,name] of [[b.min.y+(b.max.y-b.min.y)*.62,'Marca_nivel_max251'],[b.min.y+(b.max.y-b.min.y)*.42,'Marca_nivel_min251']])box(g,name,x,y,front+.002,(b.max.x-b.min.x)*.7,.006,.003,'white');
   box(g,'Ventana_nivel251',x,b.min.y+(b.max.y-b.min.y)*.52,front+.001,.03,(b.max.y-b.min.y)*.3,.003,'grey');
   for(const [dx,m] of [[-.075,'red'],[.075,'blue']])cyl(g,'Marca_polaridad251',x+dx,top+.004,b.min.z+.06,.012,.004,m,null,12);count('battery',7);}}
 // 7 · Floor: insulating mats and yellow safety stripes in front of the MT and DC line-ups.
 {const g=holder('civil');for(const id of['mt','dc']){const bases=meshes(parts.get(id),/^Gabinete_base/);if(!bases.length)continue;const all=new T.Box3();for(const b of bases)all.union(box3(b));const w=all.max.x-all.min.x,cx=(all.min.x+all.max.x)/2,front=all.min.z;
   box(g,'Tapete_aislante251',cx,.012,front-.45,w,.012,.75,'mat');for(let i=0;i<Math.floor(w/.05);i++)box(g,'Estria_tapete251',all.min.x+.025+i*.05,.02,front-.45,.012,.004,.72,'mat');
   box(g,'Franja_seguridad251',cx,.006,front-.9,w+.2,.004,.06,'yellow');count('civil',3);}}
 model.userData.detail251=report;return report;
}
