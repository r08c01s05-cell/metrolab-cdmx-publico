// A reflection reverses triangle winding. Preserve the visible side when baking a hierarchy for batching.
export function geometryTransform146(source,matrix){
 const geometry=source.clone().applyMatrix4(matrix);
 if(matrix.determinant()<0){if(!geometry.index)geometry.setIndex(Array.from({length:geometry.attributes.position.count},(_,i)=>i));const index=geometry.index;for(let i=0;i<index.count;i+=3){const b=index.getX(i+1);index.setX(i+1,index.getX(i+2));index.setX(i+2,b);}index.needsUpdate=true;}
 return geometry;
}
