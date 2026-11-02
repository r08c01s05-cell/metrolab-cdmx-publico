import * as T from 'three';

// Split already transformed static triangles into body / two bogies. No cuts,
// scaling or new geometry are introduced: every original triangle is retained.
export function splitBogieGeometry212(geo,family,half){
 if(!half||!['mecanica','exterior'].includes(family))return[{sign:0,geometry:geo}];
 const p=geo.attributes.position,lists=new Map(),box=new T.Box3().setFromBufferAttribute(p),size=box.getSize(new T.Vector3()),center=box.getCenter(new T.Vector3());
 const mechanical=family==='mecanica'&&size.x<4.7&&box.max.y<1.75&&Math.abs(Math.abs(center.x)-half)<2.1;
 for(let i=0;i<p.count;i+=3){
  let sign=0;
  if(mechanical)sign=Math.sign(center.x);
  else if(family==='exterior'){
   const x0=p.getX(i),x1=p.getX(i+1),x2=p.getX(i+2),x=(x0+x1+x2)/3,y=Math.max(p.getY(i),p.getY(i+1),p.getY(i+2));
   if(y<.985&&Math.max(x0,x1,x2)-Math.min(x0,x1,x2)<4.1&&Math.abs(Math.abs(x)-half)<2.1)sign=Math.sign(x);
  }
  if(!lists.has(sign))lists.set(sign,[]);lists.get(sign).push(i,i+1,i+2);
 }
 if(lists.size===1)return[{sign:lists.keys().next().value,geometry:geo}];
 const parts=[];for(const[sign,indices]of lists){const g=new T.BufferGeometry();for(const[name,a]of Object.entries(geo.attributes)){const values=new Float32Array(indices.length*a.itemSize);for(let i=0;i<indices.length;i++){const n=indices[i];for(let j=0;j<a.itemSize;j++)values[i*a.itemSize+j]=j===0?a.getX(n):j===1?a.getY(n):j===2?a.getZ(n):a.getW(n);}g.setAttribute(name,new T.Float32BufferAttribute(values,a.itemSize));}parts.push({sign,geometry:g});}geo.dispose();return parts;
}
