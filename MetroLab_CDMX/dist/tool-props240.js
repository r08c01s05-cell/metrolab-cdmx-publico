import * as T from 'three';

// Herramientas detalladas 240 para el portaherramientas. Modelos procedurales con piezas
// torneadas (LatheGeometry), materiales distintos para plástico, hule, metal y pantalla, y la
// forma de la herramienta que de verdad se usa en cada práctica:
//  - destornillador aislado 1000 V (mango bicolor con estrías y vaina aislante hasta la punta);
//  - llave de matraca con dado, para tuercas de rueda; cepillo de cerdas de nylon sin partes
//    metálicas, apto cerca de partes eléctricas; multímetro con funda, selector y bornes;
//    anemómetro de hélice; medidor de aislamiento; puntas de prueba con protector de dedos;
//    linterna de inspección; hoja de prueba funcional; y el repuesto de cada práctica.
// Convención: la punta de trabajo mira a -z y el mango a +z (el portaherramientas la gira para que
// asome de su bolsa). El cinturón limpia la profundidad antes de dibujarlas, así se ven encima de
// la escena y cada pieza tapa correctamente a las de atrás.
export function detailedTool240(id,{kind='',spare=''}={},owned=[]){
 const g=new T.Group();g.name='Herramienta240 '+id;
 const mat=(color,o={})=>{const m=new T.MeshStandardMaterial({color,roughness:.5,metalness:0,...o});if(m.metalness>.6){m.metalness=.6;m.roughness=Math.max(m.roughness,.28);}owned.push(m);return m;};
 const add=(geo,m,p=[0,0,0],r=[0,0,0],parent=g)=>{owned.push(geo);const o=new T.Mesh(geo,m);o.position.set(...p);o.rotation.set(...r);o.renderOrder=1001;o.frustumCulled=false;parent.add(o);return o;};
 // Revolved part along z from a profile [[radius, z], …] (z grows toward the handle end).
 const lathe=(profile,seg=24)=>{const geo=new T.LatheGeometry(profile.map(([r,z])=>new T.Vector2(Math.max(r,1e-4),z)),seg);geo.rotateX(Math.PI/2);return geo;};
 const fluted=(r,len,n=8)=>{const s=new T.Shape();for(let i=0;i<=n*2;i++){const a=i/(n*2)*Math.PI*2,rr=i%2?r*.86:r;s[i?'lineTo':'moveTo'](Math.cos(a)*rr,Math.sin(a)*rr);}const geo=new T.ExtrudeGeometry(s,{depth:len,bevelEnabled:true,bevelSize:r*.08,bevelThickness:r*.12,bevelSegments:2,curveSegments:6});return geo;};
 const steel=mat('#c9d1d6',{roughness:.22,metalness:.95}),chrome=mat('#e6eaec',{roughness:.12,metalness:1}),black=mat('#17191b',{roughness:.7}),rubber=mat('#232527',{roughness:.92}),
  red=mat('#c62a22',{roughness:.45}),yellow=mat('#f3c21b',{roughness:.45}),orange=mat('#e8681c',{roughness:.5}),glass=mat('#9fd6c0',{roughness:.08,emissive:'#25463a',emissiveIntensity:.6}),white=mat('#f2f0e8',{roughness:.8});
 if(id==='screwdriver'||id==='driver'){
  // Mango bicolor con estrías y vaina aislante (destornillador aislado 1000 V).
  add(fluted(.0155,.075,8),red,[0,0,-.005]);add(lathe([[0,.07],[.016,.071],[.0165,.085],[.012,.098],[0,.1]]),red);
  add(lathe([[.0158,-.006],[.0166,.004],[.0166,.03],[.0158,.04]],20),yellow,[0,0,-.0]);add(lathe([[.0105,-.03],[.0158,-.006]],20),yellow);
  add(lathe([[.0052,-.2],[.0052,-.03]],14),yellow);add(lathe([[.0032,-.225],[.0032,-.2]],12),steel);add(new T.BoxGeometry(.0068,.0012,.016),steel,[0,0,-.232]);
  add(new T.BoxGeometry(.012,.0006,.02),white,[0,.0158,.03]);
 }else if(id==='wrench'){
  // Matraca con dado hexagonal (tuercas de rueda) y mango con empuñadura de hule.
  add(new T.CylinderGeometry(.024,.024,.02,32),chrome,[0,0,-.17]);add(new T.CylinderGeometry(.006,.006,.004,16),black,[0,.012,-.17]);add(new T.BoxGeometry(.012,.003,.006),chrome,[.006,.0135,-.17]);
  add(new T.CylinderGeometry(.017,.017,.045,6),chrome,[0,-.032,-.17]);add(new T.CylinderGeometry(.011,.011,.046,6),black,[0,-.032,-.17]);
  add(new T.BoxGeometry(.022,.013,.11),chrome,[0,0,-.1]);add(lathe([[.009,-.05],[.012,-.04],[.012,.06],[.010,.07]],18),rubber,[0,0,0]);
  for(let i=0;i<7;i++)add(new T.TorusGeometry(.0122,.0012,4,16),black,[0,0,-.03+i*.013]);
 }else if(id==='brush'){
  // Cepillo de nylon con mango y casquillo de plástico: nada conductor cerca de partes eléctricas.
  add(lathe([[0,.09],[.012,.088],[.014,.03],[.011,-.02],[.009,-.06]],18),mat('#2a6fb0',{roughness:.4}));add(lathe([[.0105,-.06],[.012,-.075],[.012,-.09]],18),mat('#1d4f80',{roughness:.5}));
  add(new T.BoxGeometry(.04,.016,.06),mat('#1d4f80',{roughness:.5}),[0,0,-.12]);
  const tuft=new T.CylinderGeometry(.0028,.0022,.028,6);owned.push(tuft);const bristle=new T.InstancedMesh(tuft,mat('#e9e2c8',{roughness:.9}),40);bristle.renderOrder=1001;bristle.frustumCulled=false;const m4=new T.Matrix4();let k=0;
  for(let i=0;i<5;i++)for(let j=0;j<8;j++){m4.makeTranslation(-.016+i*.008,-.02,-.146+j*.0075);bristle.setMatrixAt(k++,m4);}g.add(bristle);
 }else if(['flashlight','inspect','light'].includes(id)){
  // Linterna de inspección: cuerpo moleteado, cabeza con reflector y lente encendida.
  add(lathe([[0,.07],[.016,.068],[.016,-.04],[.019,-.06],[.024,-.085],[.024,-.1],[.022,-.102]],28),mat('#30353a',{roughness:.35,metalness:.6}));
  for(let i=0;i<9;i++)add(new T.TorusGeometry(.0163,.0012,4,22),black,[0,0,.05-i*.01]);
  add(new T.CircleGeometry(.021,24),mat('#fffbe6',{emissive:'#fff1c0',emissiveIntensity:2}),[0,0,-.103],[0,Math.PI,0]);add(new T.TorusGeometry(.022,.0025,6,24),chrome,[0,0,-.101]);
  add(new T.BoxGeometry(.008,.004,.016),orange,[0,.017,.0]);add(new T.TorusGeometry(.007,.0015,6,12),steel,[0,0,.077],[Math.PI/2,0,0]);
 }else if(id==='meter'&&kind==='anemometer'){
  // Anemómetro de hélice: aro con aspas y mango con pantalla.
  const ring=new T.Group();ring.position.set(0,0,-.13);g.add(ring);add(new T.TorusGeometry(.045,.006,10,40),mat('#2d3135',{roughness:.4,metalness:.5}),[0,0,0],[0,0,0],ring);
  for(let i=0;i<6;i++){const b=add(new T.BoxGeometry(.012,.04,.002),mat('#d8dcde',{roughness:.3,metalness:.4}),[0,0,0],[0,.5,i*Math.PI/3],ring);b.position.set(Math.sin(i*Math.PI/3)*.02,Math.cos(i*Math.PI/3)*.02,0);}
  add(new T.CylinderGeometry(.008,.008,.012,14),black,[0,0,0],[Math.PI/2,0,0],ring);add(new T.BoxGeometry(.006,.006,.08),black,[0,-.045,.04],[0,0,0],ring);
  add(new T.BoxGeometry(.05,.026,.11),mat('#35383c',{roughness:.5}),[0,-.045,.0]);add(new T.BoxGeometry(.036,.002,.034),glass,[0,-.031,-.02]);
  for(let i=0;i<3;i++)add(new T.BoxGeometry(.01,.002,.006),mat('#7c8288'),[-.013+i*.013,-.031,.015]);
 }else if(id==='meter'&&kind==='megohm'){
  // Medidor de aislamiento: estuche naranja, pantalla, selector, botón de prueba y bornes.
  add(new T.BoxGeometry(.085,.04,.13),orange,[0,0,-.06]);add(new T.BoxGeometry(.089,.042,.02),rubber,[0,0,-.125]);add(new T.BoxGeometry(.089,.042,.02),rubber,[0,0,.005]);
  add(new T.BoxGeometry(.06,.002,.035),glass,[0,.021,-.095]);add(new T.CylinderGeometry(.015,.015,.008,24),black,[0,.023,-.05]);add(new T.BoxGeometry(.003,.002,.012),white,[0,.028,-.055]);
  add(new T.CylinderGeometry(.007,.007,.006,16),red,[.028,.022,-.02]);add(new T.BoxGeometry(.03,.003,.008),mat('#ffd34a'),[-.02,.022,-.02]);
  for(const [x,c] of [[-.025,red],[0,black],[.025,mat('#2b6cc4')]])add(new T.CylinderGeometry(.005,.005,.01,12),c,[x,.012,-.135],[Math.PI/2,0,0]);
 }else if(id==='laser'){
  // Medidor láser de distancia: cuerpo amarillo con extremos de hule, pantalla y ventana roja.
  add(new T.BoxGeometry(.045,.026,.11),mat('#f3c21b',{roughness:.45}),[0,0,-.05]);add(new T.BoxGeometry(.047,.028,.02),rubber,[0,0,-.105]);add(new T.BoxGeometry(.047,.028,.02),rubber,[0,0,.005]);
  add(new T.BoxGeometry(.032,.002,.024),glass,[0,.0135,-.06]);add(new T.CircleGeometry(.006,16),mat('#ff2a2a',{emissive:'#ff2a2a',emissiveIntensity:1.2}),[0,0,-.1155],[0,Math.PI,0]);add(new T.CylinderGeometry(.006,.006,.003,16),red,[0,.0135,-.025]);
 }else if(['meter','dmm','thermal'].includes(id)){
  // Multímetro con funda de hule, pantalla con dígitos, selector giratorio y bornes.
  const body=id==='thermal'?mat('#2b3035',{roughness:.5}):mat('#f2c11d',{roughness:.5});
  add(new T.BoxGeometry(.075,.026,.14),body,[0,0,-.06]);add(new T.BoxGeometry(.081,.03,.018),rubber,[0,0,-.13]);add(new T.BoxGeometry(.081,.03,.018),rubber,[0,0,.008]);
  add(new T.BoxGeometry(.055,.002,.036),glass,[0,.0135,-.105]);for(let i=0;i<4;i++)add(new T.BoxGeometry(.006,.0006,.014),mat('#1c2a22'),[-.018+i*.012,.0146,-.105]);
  add(new T.CylinderGeometry(.018,.019,.008,28),mat('#303336',{roughness:.6}),[0,.016,-.055]);add(new T.BoxGeometry(.028,.004,.008),mat('#202224'),[0,.021,-.055]);add(new T.BoxGeometry(.003,.0025,.012),white,[0,.023,-.062]);
  for(let i=0;i<3;i++)add(new T.CylinderGeometry(.0045,.0045,.004,12),[red,black,red][i],[-.02+i*.02,.0145,-.012]);
  for(let i=0;i<4;i++)add(new T.BoxGeometry(.01,.002,.005),mat('#4a4e52'),[-.024+i*.016,.0137,-.08]);
 }else if(id==='red'||id==='black'){
  // Punta de prueba con protector de dedos, capuchón CAT y cable.
  const c=id==='red'?red:black;add(lathe([[.0055,.05],[.0068,.04],[.0072,-.02],[.0062,-.03],[.0104,-.034],[.0104,-.038],[.006,-.042],[.0045,-.06],[.0024,-.068]],18),c);
  add(lathe([[.0012,-.09],[.0012,-.068]],8),steel);add(lathe([[.0055,.05],[.003,.07],[.003,.11]],10),c);
  for(let i=0;i<5;i++)add(new T.TorusGeometry(.0072,.0009,4,14),mat(id==='red'?'#8f1c16':'#050607'),[0,0,.03-i*.009]);
 }else if(id==='spare'){
  if(spare==='relay'){add(new T.BoxGeometry(.03,.034,.03),mat('#1f5fb3',{roughness:.3,transparent:true,opacity:.9}),[0,0,-.03]);add(new T.BoxGeometry(.032,.012,.034),black,[0,-.02,-.03]);for(let i=0;i<4;i++)add(new T.BoxGeometry(.002,.012,.004),chrome,[-.009+(i%2)*.018,-.031,-.04+Math.floor(i/2)*.02]);add(new T.BoxGeometry(.02,.001,.012),white,[0,.0172,-.03]);}
  else if(spare==='module'){add(new T.BoxGeometry(.06,.022,.09),mat('#2b2f33',{roughness:.45}),[0,0,-.045]);for(const z of [-.08,-.045,-.01])add(new T.CylinderGeometry(.006,.006,.008,6),chrome,[0,.015,z]);add(new T.BoxGeometry(.03,.001,.012),white,[0,.0115,-.06]);}
  else{add(lathe([[.007,-.06],[.007,-.01]],20),mat('#efe9da',{roughness:.6}),[0,0,0]);add(lathe([[.0078,-.068],[.0078,-.052]],20),chrome);add(lathe([[.0078,-.018],[.0078,-.002]],20),chrome);add(new T.BoxGeometry(.008,.0004,.02),mat('#2a2a2a'),[0,.0072,-.035]);}
 }else if(id==='test'){
  // Hoja de prueba funcional en tablilla, con casillas y pluma.
  add(new T.BoxGeometry(.075,.004,.11),mat('#7a5a34',{roughness:.7}),[0,0,-.05]);add(new T.BoxGeometry(.066,.0012,.096),white,[0,.0025,-.052]);add(new T.BoxGeometry(.04,.008,.012),chrome,[0,.004,-.1]);
  for(let i=0;i<6;i++){add(new T.BoxGeometry(.006,.0008,.006),mat(i<3?'#3ccf7e':'#9aa0a6'),[-.024,.0035,-.085+i*.013]);add(new T.BoxGeometry(.04,.0006,.002),mat('#9aa0a6'),[.005,.0035,-.085+i*.013]);}
  add(lathe([[0,-.03],[.003,-.025],[.0035,.07]],10),mat('#1e4aa8'),[.03,.008,-.01]);
 }else if(id==='detector'){
  add(lathe([[0,.06],[.012,.055],[.013,-.03],[.009,-.07],[.006,-.1],[0,-.104]],20),yellow);add(new T.SphereGeometry(.005,12,8),mat('#ff2a1a',{emissive:'#ff2a1a',emissiveIntensity:.8}),[0,.011,-.05]);add(new T.BoxGeometry(.004,.025,.002),black,[0,.012,.02]);
 }else if(id==='lock'){
  add(new T.BoxGeometry(.05,.05,.024),red,[0,-.012,-.06]);add(new T.TorusGeometry(.017,.0045,10,20,Math.PI),chrome,[0,.013,-.06]);add(new T.BoxGeometry(.04,.055,.002),white,[0,-.07,-.06],[0,0,.1]);add(new T.BoxGeometry(.04,.01,.0025),red,[0,-.047,-.06],[0,0,.1]);
 }else add(new T.BoxGeometry(.05,.03,.1),black,[0,0,-.05]);
 return g;
}
// Which spare part each practice uses.
export function spareKind240(missionId){return {diodes:'module',relay:'relay',control:'fuse',electrical:'fuse'}[missionId]||'fuse';}
