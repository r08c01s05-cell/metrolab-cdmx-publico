import * as T from 'three';
import {HAND_GLB230,HAND_AXES230} from './hand-generic230.js?v=232';

// Guante dieléctrico 230: the generic-hand skinned mesh (W3C licensed, from the Planta de
// emergencia project) dressed as a class 0 insulating rubber glove under a leather protector,
// with the orange rubber gauntlet showing past the leather cuff and the work-shirt sleeve.
// It is mounted on the existing glove rig (palm104 space): the old finger bones keep driving the
// grip, and their angles are copied to the new skeleton every frame.

// generic-hand space -> palm104 space: mirror x (the model is the other hand), turn fingers from
// -y to +y with the palm toward +z, scale to the rig's finger lengths and place the index knuckle.
export const HAND_FIT230={scale:1.3,offset:[-.0228,.1631,.0416]};
const BASIS230=new T.Matrix4().set(0,0,1,0, 0,-1,0,0, 1,0,0,0, 0,0,0,1).multiply(new T.Matrix4().makeScale(-1,1,1));
const CHAINS230=[[1,2,3,4],[5,6,7,8,9],[10,11,12,13,14],[15,16,17,18,19],[20,21,22,23,24]];
// Rig finger i (0 index … 3 pinky, 4 thumb) and joint j -> generic chain and bone index in it.
export const FINGER_MAP230=[[1,[1,2,3]],[2,[1,2,3]],[3,[1,2,3]],[4,[1,2,3]],[0,[0,1,2]]];

let data230=null;
function handData230(){
 if(data230)return data230;
 const bin=globalThis.atob?atob(HAND_GLB230):Buffer.from(HAND_GLB230,'base64').toString('binary'),u=new Uint8Array(bin.length);for(let i=0;i<bin.length;i++)u[i]=bin.charCodeAt(i);
 const dv=new DataView(u.buffer),jl=dv.getUint32(12,true),json=JSON.parse(new TextDecoder().decode(u.subarray(20,20+jl))),B=u.buffer.slice(20+jl+8);
 const acc=i=>{const a=json.accessors[i],v=json.bufferViews[a.bufferView],n={VEC3:3,VEC2:2,VEC4:4,SCALAR:1,MAT4:16}[a.type],C={5126:Float32Array,5121:Uint8Array,5123:Uint16Array}[a.componentType],o=v.byteOffset||0;return new C(B.slice(o,o+a.count*n*C.BYTES_PER_ELEMENT));};
 const P=acc(0),N=acc(1),J=acc(3),W=acc(4),I=acc(5),IB=acc(6),count=P.length/3;
 const geometry=new T.BufferGeometry();geometry.setAttribute('position',new T.BufferAttribute(P,3));geometry.setAttribute('normal',new T.BufferAttribute(N,3));
 geometry.setAttribute('skinIndex',new T.Uint16BufferAttribute(Uint16Array.from(J),4));geometry.setAttribute('skinWeight',new T.BufferAttribute(W,4));geometry.setIndex(new T.BufferAttribute(I,1));
 // Leather protector: tan on the back, a darker reinforced palm patch and darker fingertips.
 const colours=new Float32Array(count*3),back=new T.Color('#b88a55'),palm=new T.Color('#7e5a35'),tip=new T.Color('#6d4c2c'),c=new T.Color();
 const tipY=-.10;for(let i=0;i<count;i++){const nx=N[i*3],y=P[i*3+1],palmSide=T.MathUtils.smoothstep(-nx,.15,.55),tipMix=T.MathUtils.smoothstep(tipY-y,0,.02);c.copy(back).lerp(palm,palmSide*.85).lerp(tip,tipMix*.6);colours.set([c.r,c.g,c.b],i*3);}
 geometry.setAttribute('color',new T.BufferAttribute(colours,3));
 const nodes=json.nodes.slice(0,25),rest=nodes.map(n=>new T.Matrix4().compose(new T.Vector3(...n.translation),new T.Quaternion(...n.rotation),new T.Vector3(...(n.scale||[1,1,1]))));
 const relative=rest.map(m=>m.clone());CHAINS230.forEach(ch=>{for(let k=1;k<ch.length;k++)relative[ch[k]]=rest[ch[k-1]].clone().invert().multiply(rest[ch[k]]);});
 const inverses=Array.from({length:25},(_,i)=>new T.Matrix4().fromArray(IB,i*16));
 const wrist=new T.Vector3().setFromMatrixPosition(rest[0]);
 return data230={geometry,rest,relative,inverses,wrist};
}

export function createDielectricHand230(){
 const D=handData230(),owned=[],mat=o=>{const m=new T.MeshStandardMaterial({roughness:.8,metalness:0,...o});owned.push(m);return m;};
 const root=new T.Group();root.name='Guante dieléctrico230';
 const arm=new T.Group();arm.matrixAutoUpdate=false;arm.matrix.makeTranslation(...HAND_FIT230.offset).multiply(new T.Matrix4().makeScale(HAND_FIT230.scale,HAND_FIT230.scale,HAND_FIT230.scale)).multiply(BASIS230);root.add(arm);
 const bones=D.rest.map(m=>{const b=new T.Bone();m.decompose(b.position,b.quaternion,b.scale);arm.add(b);return b;});
 const leather=mat({vertexColors:true,roughness:.78,side:T.DoubleSide});
 const hand=new T.SkinnedMesh(D.geometry,leather);hand.name='Protector de cuero sobre guante aislante230';hand.frustumCulled=false;hand.bind(new T.Skeleton(bones,D.inverses),new T.Matrix4());arm.add(hand);
 // Cuffs along the forearm (palm104 -y from the wrist): leather protector cuff with strap,
 // the longer flared orange rubber gauntlet, then the sleeve.
 const wrist=D.wrist.clone().applyMatrix4(arm.matrix),add=(geo,m,y,name)=>{owned.push(geo);const o=new T.Mesh(geo,m);o.position.set(wrist.x+.006,y,wrist.z+.004);o.name=name;root.add(o);return o;};
 const tan=mat({color:'#a97b48',roughness:.8}),rubber=mat({color:'#e56b1f',roughness:.42,metalness:0}),strap=mat({color:'#3a2b1f',roughness:.7}),buckle=mat({color:'#b8bcbd',metalness:.8,roughness:.3}),sleeve=mat({color:'#24364d',roughness:.9}),cuff=mat({color:'#1c2a3c',roughness:.9});
 add(new T.CylinderGeometry(.043,.04,.055,28,1,true),tan,wrist.y-.02,'Puño del protector de cuero230').material.side=T.DoubleSide;
 add(new T.CylinderGeometry(.0445,.0445,.012,28,1,true),strap,wrist.y-.03,'Correa del protector230').material.side=T.DoubleSide;
 add(new T.BoxGeometry(.016,.014,.006),buckle,wrist.y-.03,'Hebilla230').position.z+=.045;
 add(new T.CylinderGeometry(.056,.046,.13,28,1,true),rubber,wrist.y-.105,'Puño de hule aislante230').material.side=T.DoubleSide;
 add(new T.TorusGeometry(.056,.004,8,28),rubber,wrist.y-.17,'Borde enrollado del guante230').rotation.x=Math.PI/2;
 add(new T.CylinderGeometry(.062,.06,.03,28,1,true),cuff,wrist.y-.19,'Puño de la camisa230').material.side=T.DoubleSide;
 add(new T.CylinderGeometry(.07,.062,.24,28,1,true),sleeve,wrist.y-.32,'Manga de camisa de trabajo230').material.side=T.DoubleSide;
 for(const o of root.children)if(o.isMesh)o.castShadow=false;
 const Wp=[],R=new T.Matrix4(),axis=new T.Vector3();
 // angles[f][k]: flexion (rad) per generic chain f and bone k; missing entries stay straight.
 function pose(angles){CHAINS230.forEach((ch,f)=>{for(let k=0;k<ch.length;k++){const i=ch[k],M=k===0?D.rest[i].clone():Wp[ch[k-1]].clone().multiply(D.relative[i]),a=angles?.[f]?.[k]||0;if(a){axis.fromArray(HAND_AXES230[i]);M.multiply(R.makeRotationAxis(axis,a));}Wp[i]=M;M.decompose(bones[i].position,bones[i].quaternion,bones[i].scale);}});}
 const angles=CHAINS230.map(ch=>ch.map(()=>0));
 // Copy the rig fingers' flexion (rotation.x, positive = toward the palm).
 function follow(fingers){if(!fingers)return;for(const [i,[f,ks]] of FINGER_MAP230.entries())for(let j=0;j<3;j++){const b=fingers[i]?.[j];angles[f][ks[j]]=b?Math.max(-.1,b.rotation.x)*(f===0?.8:1):0;}pose(angles);}
 pose(angles);
 return {root,hand,bones,pose,follow,angles,dispose(){root.removeFromParent();for(const o of owned)o.dispose();}};
}
