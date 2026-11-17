import * as T from 'three';

// Escena aislada: coordenadas y tiempos de exhibición, no distancias de seguridad.
export class PersonaVia270 {
 constructor(effects) {
  this.root = new T.Group();
  this.root.name = 'Respuesta educativa a persona en vía';
  effects.root.add(this.root);
  const b = effects.initialBounds;
  this.x = b.min.x - 6;
  this.floor = effects.envelope.min.y + .2;
  const person = (color) => {
   const group = new T.Group();
   this.root.add(group);
   const box = (size, pos, tint = color) => effects.box(size, tint, pos, group);
   box([.36,.58,.23],[0,1.08,0]);
   for (const side of [-1,1]) {
    box([.12,.68,.15],[side*.11,.45,0],'#324552');
    box([.12,.52,.13],[side*.25,1.04,0]);
    box([.15,.12,.27],[side*.11,.07,.05],'#263039');
   }
   const head = effects.mesh(new T.SphereGeometry(.145,16,12),'#ba8c70',group);
   head.position.y = 1.55;
   return group;
  };
  this.person = person('#638aad');
  this.responders = [person('#d9a646'), person('#d9a646')];
  for (const g of this.responders) effects.box([.38,.12,.25],'#eee9c7',[0,1.1,0],g);
  this.platform = effects.box([9,.6,2.1],'#939995',[this.x+2,this.floor+.3,3.1],this.root);
  effects.box([9,.025,.18],'#e2b83d',[this.x+2,this.floor+.61,2.12],this.root);
  this.beacon = effects.mesh(new T.SphereGeometry(.12,12,8),'#e34034',this.root,{emissive:'#e34034',emissiveIntensity:1});
  this.beacon.position.set(this.x-1,this.floor+2.1,2.6);
  for (const z of [-1.15,1.15]) effects.box([9,.07,.24],'#89918e',[b.min.x-4.5,this.floor-.035,z],this.root);
  for (let x=b.min.x-9;x<b.min.x;x+=.8) effects.box([.17,.08,2.9],'#697470',[x,this.floor-.11,0],this.root);
  this.bounds = effects.envelope.clone();
  this.bounds.min.x = b.min.x-9;
  this.bounds.max.x = b.max.x+1;
  this.bounds.max.z = Math.max(this.bounds.max.z,4.2);
  this.bounds.max.y = Math.max(this.bounds.max.y,this.floor+2.3);
 }
 apply(sample) {
  const active = sample.scenario.id === 'train-person';
  this.root.visible = active;
  if (!active) return;
  const p = sample.progress;
  const fatal = sample.outcome.fatal;
  const fall = T.MathUtils.smoothstep(p,.2,.32);
  this.person.visible = p >= .2;
  if (fatal) {
   // La figura gira hacia el eje de la vía y queda tendida entre los rieles.
   this.person.rotation.set(-Math.PI/2*fall,Math.PI/2*fall,0,'YXZ');
   this.person.position.set(this.x,this.floor+T.MathUtils.lerp(.61,.15,fall),2.15*(1-fall));
  } else {
   this.person.rotation.set(0,0,0);
   this.person.position.set(this.x,this.floor,0);
  }
  this.beacon.visible = p >= .2;
  this.responders.forEach((g,i) => {
   g.visible = p >= .75;
   g.position.set(this.x+4 - Math.min(1,Math.max(0,(p-.75)/.25))*2+i*.7,this.floor+.61,3.1);
  });
 }
}
