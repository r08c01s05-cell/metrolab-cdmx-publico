import * as T from 'three';
import {predioTransmision,torresCampo} from './circuito-3d.js?v=284';

const towers=[torresCampo.origen,torresCampo.llegada];
const accessZ=3.7;
const fade=(d,a,b)=>T.MathUtils.smoothstep(d,a,b);

export function nivelCampo284(x,z){
 const {oeste,este,norte,sur}=predioTransmision;
 const edge=Math.min(x-oeste,este-x,z-norte,sur-z);
 const pad=Math.min(...towers.map(([tx,,tz])=>Math.max(Math.abs(x-tx),Math.abs(z-tz))));
 const spur=Math.min(...towers.map(([tx])=>Math.abs(x-tx)));
 const road=fade(Math.abs(z-accessZ),2.1,5);
 const branch=z>towers[0][2]-1&&z<accessZ+2?fade(spur,1.25,4):1;
 const undulation=.78+.45*Math.sin((x+100)*.12)*Math.cos(z*.23)+.35*Math.sin(z*.22-(x+80)*.044);
 return -.20+Math.max(0,undulation)*fade(edge,0,10)*fade(pad,7,13)*road*branch;
}

export function construirCampo284(campo,caja,materials){
 const {oeste,este,norte,sur}=predioTransmision;
 const width=este-oeste,depth=sur-norte,cx=(oeste+este)/2,cz=(norte+sur)/2;
 caja(campo,cx,-4.29,cz,width,.22,depth,'oscuro');
 // La capa de suelo ocupa el lateral. La malla de pasto aporta el relieve superior.
 caja(campo,cx,-2.246,cz,width,4.08,depth,'estrato').castShadow=false;
 const ground=new T.PlaneGeometry(width,depth,76,38);
 ground.rotateX(-Math.PI/2);ground.translate(cx,0,cz);
 const positions=ground.attributes.position,uv=ground.attributes.uv;
 const tint=[];
 for(let i=0;i<positions.count;i++){
  const x=positions.getX(i),z=positions.getZ(i);
  positions.setY(i,nivelCampo284(x,z));
  uv.setXY(i,uv.getX(i)*width/5,uv.getY(i)*depth/5);
  const grass=.87+.09*Math.sin(x*.30+z*.15)*Math.cos(z*.42)+.04*Math.cos(x*.63-z*.25);
  tint.push(grass,grass+.035,grass-.055);
 }
 ground.setAttribute('color',new T.Float32BufferAttribute(tint,3));
 ground.computeVertexNormals();
 const cover=materials.pasto.clone();cover.vertexColors=true;
 const surface=new T.Mesh(ground,cover);surface.name='Terreno de transmisión con relieve';surface.receiveShadow=true;campo.add(surface);

 const roadLimit=-4,roadCenter=(oeste+roadLimit)/2,roadWidth=roadLimit-oeste;
 caja(campo,roadCenter,-.181,accessZ,roadWidth,.04,3.6,'brecha');
 const track=materials.brecha.clone();track.color.multiplyScalar(.70);
 for(const offset of [-.86,.86]){
  const strip=caja(campo,roadCenter,-.156,accessZ+offset,roadWidth,.01,.38,'brecha');
  strip.material=track;
 }
 for(const [x,,z] of towers){
  const pad=caja(campo,x,-.179,z,13,.04,13,'grava');
  pad.name='Plataforma de torre de transmisión';
  const padEdge=z+6.5, junction=accessZ-1.8;
  caja(campo,x,-.176,(junction+padEdge)/2,2.1,.037,junction-padEdge,'brecha');
  for(const sign of [-1,1]){
   caja(campo,x+sign*1.38,-.03,accessZ-1,.12,.35,.12,'acero');
   caja(campo,x+sign*1.38,.12,accessZ-1,.15,.09,.15,'metal');
  }
 }
 const positionsBush=[];
 for(let i=0;i<900;i++){
  const x=oeste+2+((i*7.491)%(width-4)),z=norte+2+((i*3.137)%(depth-4));
  if(Math.abs(z-accessZ)<2.7||towers.some(([tx,,tz])=>Math.abs(x-tx)<7.4&&(Math.abs(z-tz)<7.4||Math.abs(x-tx)<2&&z<accessZ+1&&z>tz)))continue;
  positionsBush.push([x,z,i]);
 }
 const bush=new T.InstancedMesh(new T.DodecahedronGeometry(1,0),new T.MeshStandardMaterial({color:0x858957,roughness:.96}),positionsBush.length);
 bush.name='Vegetación baja dispersa';
 const matrix=new T.Matrix4(),tintBush=new T.Color();
 for(const [index,[x,z,i]] of positionsBush.entries()){
  const size=.09+(i%11)**2*.004;
  matrix.makeScale(size*1.24,size*(.50+(i%4)*.20),size);
  matrix.setPosition(x,nivelCampo284(x,z)+size*.14,z);
  bush.setMatrixAt(index,matrix);
  tintBush.setRGB(.64+(i%11)*.025,.69+(i%13)*.02,.49+(i%9)*.044);
  bush.setColorAt(index,tintBush);
 }
 bush.receiveShadow=true;campo.add(bush);
}
