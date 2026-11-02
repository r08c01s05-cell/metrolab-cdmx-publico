import * as T from 'three';
import {refineSurfaceMaterials100} from './visual-quality100.js?v=205';

// A thin fabric work mat, separate from the retired preparation board in the bag.
export function workMat195(width,depth){
 const r=.035,x=width/2,z=depth/2,shape=new T.Shape();
 shape.moveTo(-x+r,-z);shape.lineTo(x-r,-z);shape.quadraticCurveTo(x,-z,x,-z+r);shape.lineTo(x,z-r);shape.quadraticCurveTo(x,z,x-r,z);shape.lineTo(-x+r,z);shape.quadraticCurveTo(-x,z,-x,z-r);shape.lineTo(-x,-z+r);shape.quadraticCurveTo(-x,-z,-x+r,-z);
 const geometry=new T.ExtrudeGeometry(shape,{depth:.004,bevelEnabled:true,bevelThickness:.001,bevelSize:.001,bevelSegments:2,curveSegments:6});
 geometry.rotateX(-Math.PI/2);geometry.center();
 const mat=new T.Mesh(geometry,new T.MeshStandardMaterial({name:'Tapete textil de intervención195',color:'#3f6867',roughness:.94,metalness:0}));
 mat.name='Tapete de lona cosida para apoyar el filtro195';mat.userData.carryPad188=true;
 const thread=new T.MeshStandardMaterial({name:'Hilo cosido del tapete195',color:'#bcaa7d',roughness:.95,metalness:0}),positions=[];
 for(const side of [-1,1]){
  for(let a=-x+.055;a<x-.04;a+=.018)positions.push([a,.0035,side*(z-.022),0]);
  for(let a=-z+.055;a<z-.04;a+=.018)positions.push([side*(x-.022),.0035,a,Math.PI/2]);
 }
 const stitches=new T.InstancedMesh(new T.BoxGeometry(.008,.0012,.0012),thread,positions.length),pose=new T.Matrix4(),rotation=new T.Quaternion(),scale=new T.Vector3(1,1,1);
 positions.forEach(([a,y,b,angle],i)=>{rotation.setFromAxisAngle(new T.Vector3(0,1,0),angle);pose.compose(new T.Vector3(a,y,b),rotation,scale);stitches.setMatrixAt(i,pose);});
 stitches.name='Costura perimetral de la lona195';mat.add(stitches);refineSurfaceMaterials100(mat);
 return mat;
}

export function disposeWorkMat195(mat){const geometries=new Set(),materials=new Set();mat.traverse(o=>{if(o.geometry)geometries.add(o.geometry);for(const m of(o.material?(Array.isArray(o.material)?o.material:[o.material]):[]))materials.add(m);});mat.removeFromParent();for(const g of geometries)g.dispose();for(const m of materials)m.dispose();}
