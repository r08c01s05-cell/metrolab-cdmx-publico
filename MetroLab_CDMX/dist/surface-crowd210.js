// Reserve free space before accepting a background passenger's position.
// Counts, doorway journeys and train occupants remain controlled by the engine.
export function separateSurfaceCrowd210(actors,center,solids,safePoint,boundsFor){
 const cells=new Map(),step=.64,cellKey=(ix,iz)=>(ix+256)*128+iz+64,key=(x,z)=>cellKey(Math.floor(x/step),Math.floor(z/step));
 const occupied=(x,z,actor)=>{const cx=Math.floor(x/step),cz=Math.floor(z/step);for(let ix=cx-1;ix<=cx+1;ix++)for(let iz=cz-1;iz<=cz+1;iz++){const cell=cells.get(cellKey(ix,iz));if(!cell)continue;for(const b of cell){const min=actor.guardianId===b.id?.43:.60;if((x-b.x)**2+(z-b.z)**2<(min-1e-6)**2)return true;}}return false;};
 for(const a of actors){
  if(a.location!=='platform'||a.flow)continue;
  const side=a.z<0?-1:1,radius=a.modelType==='child'?.19:.28,bounds=boundsFor(solids,side),origin={x:a.x-center,z:a.z};
  const allowed=(p)=>p.x>=bounds.minX+radius&&p.x<=bounds.maxX-radius&&p.z>=bounds.minZ+radius&&p.z<=bounds.maxZ-radius&&p.z*side>=radius&&
   (a.modelType!=='man'||p.x*(-side)<=18.5)&&
   !occupied(p.x,p.z,a)&&
   !solids.some(b=>p.x>b.minX-radius+1e-6&&p.x<b.maxX+radius-1e-6&&p.z>b.minZ-radius+1e-6&&p.z<b.maxZ+radius-1e-6);
  let p=safePoint(origin,side,solids,radius);
  if(!allowed(p)){
   let free=null;
   // Search along and across the island, rather than pushing everyone to a
   // stair's same corner. Fixed order preserves identity between frames.
   for(let ring=1;ring<=24&&!free;ring++){
    for(let dx=-ring;dx<=ring&&!free;dx++)for(const dz of[-ring,ring]){const q={x:p.x+dx*step,z:p.z+dz*step};if(allowed(q)){free=q;break;}}
    for(let dz=-ring+1;dz<ring&&!free;dz++)for(const dx of[-ring,ring]){const q={x:p.x+dx*step,z:p.z+dz*step};if(allowed(q)){free=q;break;}}
   }
   // A full island scan is only needed for unusually high educational demand.
   if(!free)for(let x=bounds.minX+.4;x<bounds.maxX-.4&&!free;x+=step)for(let z=bounds.minZ+.4;z<bounds.maxZ-.4;z+=step){const q={x,z};if(allowed(q)){free=q;break;}}
   if(free)p=free;
  }
  a.x=center+p.x;a.z=p.z;const k=key(p.x,p.z);if(!cells.has(k))cells.set(k,[]);cells.get(k).push({id:a.id,...p});
 }
 return actors;
}
