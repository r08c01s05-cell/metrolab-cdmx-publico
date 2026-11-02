// Keep the near station and two upcoming stops ready, even across long intervals.
export function stationLoadPlan(line,index,anchor,focus){
 const keep=new Set([index]);
 line.distances.forEach((p,i)=>{if(Math.abs(p-anchor)<900)keep.add(i);});
 if(focus){for(const i of[focus.target,focus.target+focus.direction,focus.target-focus.direction])if(i>=0&&i<line.stations.length)keep.add(i);}
 return keep;
}
export function prepareStationTextures(model,renderer){const textures=new Set();model.traverse(o=>{for(const m of o.material?(Array.isArray(o.material)?o.material:[o.material]):[])for(const value of Object.values(m))if(value?.isTexture&&value.image)textures.add(value);});for(const t of textures)renderer.initTexture(t);return textures.size;}
