// Piezas exteriores en coordenadas longitudinales del andén.
function puentePeatonal(box,beam,x,side,extremo){
 const base=extremo,landing=25,h=4.66;
 box(x,h,side*(base+landing)/2,2,.18,landing-base,'#b5b5a8','concreto');
 for(const lateral of [-1,1]){
  const rail=x+lateral*.91;
  beam([rail,h+1,side*base],[rail,h+1,side*landing],.07,'#6a7777','metal');
  for(let z=base+.6;z<landing;z+=1.3)box(rail,h+.55,side*z,.06,.96,.06,'#899494','metal');
 }
 for(const z of [base+1.4,landing-1.4])
  for(const dx of [-.86,.86])box(x+dx,h/2,side*z,.24,h,.25,'#a3a497','concreto');
 const steps=28,run=.30;
 for(let i=0;i<steps;i++){
  const y=h-i*(h-.10)/steps;
  box(x+(i+.5)*run,y-.10,side*landing,run+.006,.20,1.9,'#b4b0a0','concreto');
 }
 for(const dz of [-.91,.91]){
  const z=side*landing+dz;
  beam([x,h+.98,z],[x+steps*run,1.07,z],.067,'#687776','metal');
  for(let i=1;i<steps;i+=4)box(x+i*run,h+.52-i*(h-.10)/steps,z,.06,.90,.06,'#758786','metal');
 }
}

function autobus(box,x,z,color){
 box(x,1.53,z,10.2,2.71,2.41,color,'metal');
 box(x,2.91,z,9.98,.24,2.36,'#dadbd1','metal');
 box(x-4.7,2.06,z,1.09,1.1,2.42,'#334a55','cristal');
 for(const side of [-1,1]){
  for(let dx=-3.45;dx<4.5;dx+=1.34)box(x+dx,2.13,z+side*1.209,1.16,.81,.025,'#45616c','cristal');
  for(const dx of [-3.15,3.06])box(x+dx,.41,z+side*.99,1.08,.82,.38,'#232729','pintura');
 }
}

export function agregarHitos285(id,box,beam){
 const side=id==='L8-11'||id==='L8-13'?-1:1;
 if(id==='L1-20'){
  const terminalZ=-43;
  box(-23,2.64,terminalZ,73,5.28,17,'#bab4a8','concreto');
  box(25.5,2.64,terminalZ-5,24,5.28,27,'#b0ac9e','aplanado');
  for(const z of [terminalZ-7.8,terminalZ+7.8])box(-23,4.35,z,71,.84,1.35,'#415c68','cristal');
  for(const [x,z,w,d] of [[-23,terminalZ,73,18],[25.5,terminalZ-5,24,28]]){
   box(x,5.68,z,w,.43,d,'#91472f','terracota');
   box(x,6.05,z,w-.2,.31,d*.54,'#a45337','terracota');
  }
  box(11,.01,-25,101,.12,15,'#b8b3a5','concreto');
  for(const [i,x] of [-38,-20,-2,20,40].entries())autobus(box,x,-26.7,['#536994','#597d61','#b2b0a4'][i%3]);
  const interZ=38;
  box(8,3.15,interZ,79,6.3,21,'#9c9d94','concreto');
  box(8,9.04,interZ,82,5.78,23,'#647d86','cristal');
  box(8,12.25,interZ,89,.75,25,'#b9bcb2','metal');
  for(let x=-32;x<=48;x+=5)box(x,9.09,interZ-11.56,.18,5.59,.19,'#c0c5c1','metal');
  for(const dx of [-26,-9,8,25,42])box(dx,2.60,interZ-11,.82,5.2,1.07,'#d4cfbe','concreto');
  box(7,4.5,22,7,3.8,12,'#849a9e','cristal');
  box(7,6.51,22,8,.40,13,'#bfc1b6','metal');
  return;
 }
 if(id==='L8-19'){
  for(const x of [-58,59])puentePeatonal(box,beam,x,1,14.7);
  const yardZ=38.5;
  box(-1,-.10,yardZ,132,.18,29,'#666967','asfalto');
  for(const [i,x] of [-51,-31,-11,10,29,49].entries()){
   box(x,.005,yardZ+3,16,.13,2.1,'#b2b1a4','concreto');
   box(x,3.15,yardZ+3,16,.18,2.8,'#798b91','metal');
   for(const dx of [-7,7])box(x+dx,1.55,yardZ+3,.21,3.1,.29,'#a7a89c','concreto');
   autobus(box,x,yardZ-1.05,['#306c97','#3c83ad','#677d59'][i%3]);
  }
  const positions=Array.from({length:23},(_,i)=>{
   const angle=i*Math.PI/22;
   return [-8+52*Math.cos(angle),7.2,29+19*Math.sin(angle)];
  });
  for(let i=1;i<positions.length;i++){
   const [ax,y,az]=positions[i-1],[bx,,bz]=positions[i];
   beam([ax,y,az],[bx,y,bz],4.5,'#a2a399','concreto',.66);
   const dx=bx-ax,dz=bz-az,len=Math.hypot(dx,dz);
   for(const s of [-1,1]){
    const ox=s*2.18*dz/len,oz=-s*2.18*dx/len;
    beam([ax+ox,y+.76,az+oz],[bx+ox,y+.76,bz+oz],.14,'#8c928f','metal');
    if(i%2===0)box(bx+ox,y+.53,bz+oz,.13,.60,.13,'#989f9a','metal');
   }
   if(i%3===0)box(bx,3.39,bz,.79,6.78,1.14,'#9d9e94','concreto');
  }
  for(const [index,direction] of [[0,1],[positions.length-1,-1]]){
   const [x,y,z]=positions[index],end=x+direction*42;
   beam([x,y,z],[end,.27,z],4.5,'#a2a399','concreto',.66);
   for(const offset of [-2.18,2.18])
    beam([x,y+.76,z+offset],[end,1.03,z+offset],.14,'#8c928f','metal');
   for(const distance of [12,26]){
    const height=y+(distance/42)*(.27-y)-.33;
    box(x+direction*distance,height/2,z,.79,height,1.14,'#9d9e94','concreto');
   }
  }
  return;
 }
 const stairs={'L8-10':54.5,'L8-11':42.5,'L8-12':50.5,'L8-13':56.5};
 puentePeatonal(box,beam,stairs[id],side,9.5);
 if(id==='L8-10'){
  const x=54.5;
  const flat=27.5,end=98;
  box(x,9.70,0,13.1,1.10,flat*2,'#a8a397','concreto');
  box(x,10.30,0,11.3,.16,flat*2,'#515759','asfalto');
  for(const dx of [-6.25,6.25]){
   box(x+dx,10.61,0,.33,.57,flat*2,'#b9b3a3','concreto');
   for(const dz of [-19.2,-8.15,8.15,19.2])box(x+dx*.69,4.54,dz,1.05,9.08,1.06,'#a39e93','concreto');
  }
  for(const s of [-1,1]){
   beam([x,9.70,s*flat],[x,-.56,s*end],13.1,'#a8a397','concreto',1.10);
   beam([x,10.307,s*flat],[x,.047,s*end],11.3,'#515759','asfalto',.16);
   for(const dx of [-6.25,6.25]){
    beam([x+dx,10.61,s*flat],[x+dx,.35,s*end],.33,'#b9b3a3','concreto',.57);
    for(const z of [42,61,80]){
     const height=9.15-10.26*(z-flat)/(end-flat);
     box(x+dx*.69,height/2,s*z,1.05,height,1.06,'#a39e93','concreto');
    }
   }
  }
  for(let z=-flat+3;z<=flat-3;z+=5.9)box(x,10.387,z,.115,.012,2.52,'#dbc376','pintura');
 }
}
