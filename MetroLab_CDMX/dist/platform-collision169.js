import {platformBounds208} from './station-layout208.js?v=209';
import {separateSurfaceCrowd210} from './surface-crowd210.js?v=210';
import * as T from 'three';
const clamp=(x,a,b)=>Math.max(a,Math.min(b,x));
// Capture individual solids before batching; a merged wall's AABB can span doors.
export function platformSolids169(root){root.updateMatrixWorld(true);const result=[];root.traverse(o=>{if(!o.isMesh)return;const c=o.userData.componente||'',name=o.name;const b=new T.Box3().setFromObject(o),s=b.getSize(new T.Vector3());if(root.userData.layout208==='island'&&!(root.userData.regions209||[{minZ:-3.4,maxZ:3.4}]).some(r=>b.max.z>=r.minZ-.35&&b.min.z<=r.maxZ+.35))return;if((b.max.y<1.6&&!/Escalera acceso central/.test(name))||b.min.y>3.1)return;if(c==='pared'||/pared|columna|pilar|machon|mampara|volumen_terminal|banco|escalera/i.test(name)||c==='estructura'&&s.y>1.7&&s.x<2.5&&s.z<2.5){result.push({minX:b.min.x,maxX:b.max.x,minZ:b.min.z,maxZ:b.max.z});}});if(root.userData.layout208){result.layout208=root.userData.layout208;result.regions209=root.userData.regions209;}return result;}
export function safePlatformPoint169(point,side,solids=[],radius=.28){
 const bounds208=platformBounds208(solids,side);if(bounds208){
  const bounds={minX:bounds208.minX+radius,maxX:bounds208.maxX-radius,minZ:bounds208.minZ+radius,maxZ:bounds208.maxZ-radius};
  const clear=(x,z)=>!solids.some(b=>x>b.minX-radius&&x<b.maxX+radius&&z>b.minZ-radius&&z<b.maxZ+radius);
  let x=clamp(point.x,bounds.minX,bounds.maxX),z=clamp(point.z,bounds.minZ,bounds.maxZ);
  for(let n=0;n<12&&!clear(x,z);n++){for(const b of solids){if(x<=b.minX-radius||x>=b.maxX+radius||z<=b.minZ-radius||z>=b.maxZ+radius)continue;const opts=[[b.minX-radius,z],[b.maxX+radius,z],[x,b.minZ-radius],[x,b.maxZ+radius]].filter(([a,c])=>a>=bounds.minX&&a<=bounds.maxX&&c>=bounds.minZ&&c<=bounds.maxZ).sort((a,b)=>(a[0]-x)**2+(a[1]-z)**2-(b[0]-x)**2-(b[1]-z)**2);const best=opts.find(([a,c])=>clear(a,c))||opts[0];if(best)[x,z]=best;}}
  return{x,z};
 }

 let x=clamp(point.x,-69,69),z=side*clamp(point.z*side,3.85+radius,7.40-radius);
 for(let pass=0;pass<6;pass++){let hit=false;for(const b of solids){const minX=b.minX-radius,maxX=b.maxX+radius,minZ=b.minZ-radius,maxZ=b.maxZ+radius;if(x<=minX||x>=maxX||z<=minZ||z>=maxZ)continue;const choices=[[x-minX,'x',minX],[maxX-x,'x',maxX],[z-minZ,'z',minZ],[maxZ-z,'z',maxZ]].sort((a,b)=>a[0]-b[0]);const choice=choices.find(([,axis,v])=>axis==='x'?v>=-69&&v<=69:v*side>=3.85+radius&&v*side<=7.40-radius);if(choice){if(choice[1]==='x')x=choice[2];else z=choice[2];hit=true;}}if(!hit)break;}
 const clear=(px,pz)=>!solids.some(b=>px>b.minX-radius+1e-7&&px<b.maxX+radius-1e-7&&pz>b.minZ-radius+1e-7&&pz<b.maxZ+radius-1e-7);
 if(!clear(x,z)){
  // Overlapping pillars / wall returns can make successive face projections
  // oscillate. Resolve the union, rather than accepting the last projection.
  const candidates=[];for(let n=0;n<=20;n++)for(const dx of n?[n*.35,-n*.35]:[0])for(const lateral of[4.2,4.65,5.1,5.55,6,6.45,6.9]){const px=clamp(point.x+dx,-69,69),pz=side*clamp(lateral,3.85+radius,7.40-radius);candidates.push({x:px,z:pz,d:(px-point.x)**2+(pz-point.z)**2});}
  candidates.sort((a,b)=>a.d-b.d);const free=candidates.find(p=>clear(p.x,p.z));if(free){x=free.x;z=free.z;}
 }
 return{x,z};
}
export function sweepPlatform169(from,to,side,solids=[],radius=.28){let p=safePlatformPoint169(from,side,solids,radius);to=platformBounds208(solids)?safePlatformPoint169(to,side,solids,radius):{x:clamp(to.x,-69,69),z:side*clamp(to.z*side,3.85+radius,7.40-radius)};const count=Math.max(1,Math.ceil(Math.hypot(to.x-p.x,to.z-p.z)/.12)),dx=(to.x-p.x)/count,dz=(to.z-p.z)/count;for(let i=0;i<count;i++)p=safePlatformPoint169({x:p.x+dx,z:p.z+dz},side,solids,radius);return p;}
export function clampPlatformCamera169(view){
 if(view.cameraMode==='passenger'&&view.passenger178?.ride200?.trainId){view.previousPlatform169=null;return;}
 if(!['platform','passenger'].includes(view.cameraMode)){view.previousPlatform169=null;return;}const center=view.fixedAnchor??0,side=view.platformSide169??-1,station=view.stationCache.get(view.platformStation??view.cameraStation),solids=station?.userData.solids169||[],c=view.camera.position;
 const desired={x:c.x-center,z:c.z},from=view.previousPlatform169||desired,p=sweepPlatform169(from,desired,side,solids,.30),dx=p.x+center-c.x,dz=p.z-c.z,dy=clamp(c.y,view.cameraMode==='passenger'?2.15:2.25,3.15)-c.y;c.x+=dx;c.z+=dz;c.y+=dy;view.controls.target.add(new T.Vector3(dx,dy,dz));view.camera.lookAt(view.controls.target);view.previousPlatform169=p;
}
function clearFlow224(a,center,solids,radius){
 let x=a.x-center,z=a.z;const side=z<0?-1:1;
 z=side*clamp(z*side,0,7.40-radius);
 for(let pass=0;pass<4;pass++){let moved=false;for(const b of solids){const minX=b.minX-radius,maxX=b.maxX+radius,minZ=b.minZ-radius,maxZ=b.maxZ+radius;if(x<=minX||x>=maxX||z<=minZ||z>=maxZ)continue;
  const options=[[x-minX,minX,z],[maxX-x,maxX,z],[z-minZ,x,minZ],[maxZ-z,x,maxZ]].filter(([,,nz])=>nz*side>=4&&nz*side<=7.40-radius).sort((p,q)=>p[0]-q[0]);
  if(options.length){x=options[0][1];z=options[0][2];moved=true;}}if(!moved)break;}
 a.x=x+center;a.z=z;
}
export function constrainPlatformActors169(actors,center,solids){
 if(platformBounds208(solids))return separateSurfaceCrowd210(actors,center,solids,safePlatformPoint169,platformBounds208);
 // Realismo 224: people walking to or from a door kept their straight route through walls,
 // pillars and benches. On the platform itself (beyond the edge) they now step around them;
 // the crossing between the edge and the car is left untouched.
 for(const a of actors)if(a.flow&&a.location==='platform'&&a.z*a.z>16)clearFlow224(a,center,solids,a.modelType==='child'?.16:.22);
 const grid=new Map();for(const a of actors){if(a.location!=='platform'||a.flow||(!platformBounds208(solids)&&a.z*a.z<14))continue;const side=a.z<0?-1:1,p=safePlatformPoint169({x:a.x-center,z:a.z},side,solids,a.modelType==='child'?.19:.26);a.x=p.x+center;a.z=p.z;
  // A small local separation prevents walking figures occupying a waiting body.
  const key=(x,z)=>Math.floor(x/.6)+':'+Math.floor(z/.6);for(let attempt=0;attempt<3;attempt++){const ix=Math.floor(a.x/.6),iz=Math.floor(a.z/.6);let moved=false;for(let x=ix-1;x<=ix+1;x++)for(let z=iz-1;z<=iz+1;z++)for(const b of grid.get(x+':'+z)||[]){const d=Math.hypot(a.x-b.x,a.z-b.z),min=a.guardianId===b.id?.40:.48;if(d<min){const q=safePlatformPoint169({x:a.x-center+(d>.001?(a.x-b.x)/d:1)*(min-d+.01),z:a.z+(d>.001?(a.z-b.z)/d:0)*(min-d+.01)},side,solids,.26);a.x=q.x+center;a.z=q.z;moved=true;}}if(!moved)break;}const k=key(a.x,a.z);if(!grid.has(k))grid.set(k,[]);grid.get(k).push(a);
 }return actors;
}
