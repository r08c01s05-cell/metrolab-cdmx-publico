// Read both generations of passenger catalog; never request retired asset files.
export const PASSENGERS145=[
 {name:'hombre_joe137',url:'./models/personajes/joe_walk137.glb.gz',kind137:'man',imported137:true},
 {name:'mujer_aprobada137',url:'./models/personajes/kamala_walk138.glb.gz',kind137:'woman',imported137:true},
 {name:'nino_hoodie138',url:'./models/personajes/child_walk138.glb.gz',kind137:'child',imported137:true,newFemale119:true},
 {name:'madre_infante138',url:'./models/personajes/kamala_walk138.glb.gz',kind137:'parent',imported137:true,infant138:true},
 {name:'pasajero_hitman138',url:'./models/personajes/hitman_walk138.glb.gz',kind137:'man',imported137:true},
 {name:'pasajera_kamala138',url:'./models/personajes/kamala_walk138.glb.gz',kind137:'woman',imported137:true}];
const legacy={personaje_metro_rig:0,personaje_femenino119:1,personaje_metro_adolescente:2,personaje_metro_madre_nino:3};
export function passengerManifest145(records){if(!Array.isArray(records)||!records.length)throw Error('Catálogo vacío');const seen=new Set(),out=[];for(const r of records){if(!r||!r.name)continue;const current=PASSENGERS145.find(p=>p.name===r.name);const n=current?{...current}:Object.hasOwn(legacy,r.name)?{...PASSENGERS145[legacy[r.name]]}:{...r};if(n.url==='./models/personajes/mujer_walk137.glb.gz'&&n.kind137!=='child'){n.url='./models/personajes/kamala_walk138.glb.gz';delete n.newFemale119;}if(!/^\.\/models\/personajes\/[^/?]+\.glb(?:\.gz)?$/.test(n.url||'')||seen.has(n.name))continue;seen.add(n.name);out.push(n);}if(!out.length)throw Error('Catálogo sin modelos compatibles');return out;}
