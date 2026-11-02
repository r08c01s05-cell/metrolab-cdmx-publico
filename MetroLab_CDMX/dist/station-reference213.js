// Visual observations from the supplied photos. No track/layout dimensions here.
const l1Stone=new Set([1,2,3,10,11,13,15,18,19]);
const l1Notes={1:'Piedra beige, franja rosa y piso pétreo oscuro.',2:'Paños pétreos beige entre marcos rosas; plafón blanco.',3:'Piedra beige, marcos rosas y pavimento gris.',4:'Paneles blancos lisos, señal rosa y plafón metálico claro.',5:'Paneles claros, franja rosa y techo central oscuro.',6:'Paneles blancos con juntas verticales y plafón longitudinal.',7:'Paños claros, señalización rosa y correspondencia amarilla.',8:'Paños blancos y nivel superior abierto; conservar el acceso existente.',9:'Paneles blancos amplios entre marcos rosas; piso pétreo oscuro.',10:'Piedra beige, franja rosa y losas grises rectangulares.',11:'Piedra gris beige, franja rosa y piso oscuro.',12:'Paneles blancos, zócalo negro y plafones claros.',13:'Piedra beige, gabinete rojo y marcos rosas.',14:'Paneles blancos satinados con zócalo oscuro.',15:'Piedra beige veteada, franja rosa y piso pulido.',16:'Paños blancos satinados y luminarias longitudinales.',17:'Paños claros, vigas y nivel superior visible en la fotografía.',18:'Revestimiento beige, vigas oscuras y franja rosa.',19:'Piedra beige, banda rosa y cubierta oscura de vigas.',20:'Cubierta metálica, paños claros, vidrios superiores y banda rosa; se conserva la planta existente.'};
const l8=[
 ['panel','#d7dcd3','#d9dfd8','stone','Columnas claras, basamento verde y plafón modular; usar la perspectiva complementaria, no mezclar con la foto antigua de acabado amarillo.'],
 ['panel','#dedfd6','#e0e2dc','stone','Paneles claros segmentados, columnas claras y techo modular.'],
 ['panel','#e0e1d9','#e1e4df','stone','Columnas blancas con zócalo negro, conductos vistos y piso de piedra gris.'],
 ['metal','#b6bcbb','#d8dbd6','stone','Paneles metálicos cuadriculados, marcos oscuros y techo de concreto.'],
 ['panel','#81add0','#83b4d4','stone','Paneles azules, banda horizontal negra y franja verde.'],
 ['panel','#d6a44f','#d9a854','stone','Paños ocres, banda negra y mosaico geométrico existente.'],
 ['panel','#ce6948','#dfdfd5','stone','Plafón de vigas, piso geométrico y pared naranja observada; conservar la planta existente.'],
 ['panel','#989fc5','#a6a8c9','stone','Columnas lilas, paneles azul/lila y pasarela con escalera existente.'],
 ['stone','#d7cfb8','#90b6aa','stone','Revestimiento beige de veta vertical y columnas turquesa.'],
 ['surface','#a4aca5','#687b72','greenStone','Estructura gris verdosa, cerchas, cerramiento de malla y pavimento verde/gris.'],
 ['surface','#d5d6c8','#69618d','roseStone','Estructura violeta, muretes claros y pavimento rosa/gris geométrico.'],
 ['surface','#d1d2c7','#4e798e','brownStone','Vigas azules, malla y pavimento pétreo gris/marrón.'],
 ['surface','#bd5c3e','#3d5364','roseStone','Estructura oscura, murete anaranjado y cubierta clara.'],
 ['panel','#c3cbd0','#e0e2dc','stone','Paños azul grisáceos, columnas claras y mural existente de aeronaves.'],
 ['panel','#dfd8bd','#e3e1d5','stone','Paneles crema con juntas, banda negra y plafón claro.'],
 ['panel','#ddca91','#e3d8b7','stone','Paneles amarillo crema, franja negra y gabinetes rojos.'],
 ['panel','#a4c1b0','#9bbca9','stone','Columnas verde claro y mosaicos turquesa/azul/rosa existentes.'],
 ['panel','#92afcf','#a6aed4','stone','Paños azules, columnas azul/lila, banda negra y mural figurativo existente.'],
 ['surface','#e1e3d8','#e0e2d9','stone','Diagonales blancas, bases verde claro, muretes blancos, escaleras y pavimento pétreo gris.']
];
export const STATION_REFERENCES213=Object.freeze(Object.fromEntries([
 ...Array.from({length:20},(_,i)=>{const n=i+1,id='L1-'+String(n).padStart(2,'0');return[id,{id,line:1,wall:l1Stone.has(n)?'stone':'panel',wallColor:l1Stone.has(n)?'#dbd2bd':'#e2e4df',column:'#dedfd8',floor:[1,2,3,7,9,11,13,15,18,19].includes(n)?'darkRect':'greyRect',note:l1Notes[n],photo:`referencias/fotos18/${id}.jpg`,band:'#c56896'}];}),
 ...l8.map(([wall,wallColor,column,floor,note],i)=>{const id='L8-'+String(i+1).padStart(2,'0');return[id,{id,line:8,wall,wallColor,column,floor,note,photo:i===0?'referencias/L8/L8-01_1485s_perspectiva2.jpg':`referencias/linea8_57/${id}.jpg`,band:'#21764f'}];})
]));

const textureCache=new Map();
function map213(T,key,paint){if(textureCache.has(key))return textureCache.get(key);const c=document.createElement('canvas');c.width=c.height=512;paint(c.getContext('2d'));const t=new T.CanvasTexture(c);t.colorSpace=T.SRGBColorSpace;t.wrapS=t.wrapT=T.RepeatWrapping;t.channel=2;t.userData={quality100Shared:true,reference213:key};textureCache.set(key,t);return t;}
export function referenceTexture213(T,kind,color='#e0e2dc'){
 return map213(T,kind+color,c=>{
  let seed=213;const r=()=>((seed=Math.imul(seed,1664525)+1013904223>>>0)/4294967296);
  // Narrow stone variations replace the artificial checkerboard. Surface
  // stations retain their photographed geometric, contrasting stone inlays.
  const palette={darkRect:['#888b87','#929590','#828782','#979a94'],greyRect:['#aeb2ab','#b7bab3','#a5aca4','#bdc0b8'],stone:['#969c94','#a7aca2','#8e978d','#b0b5a9'],greenStone:['#74867a','#919b87','#637b6b','#a4a58e'],roseStone:['#a38b86','#b4a294','#8d8880','#beb29f'],brownStone:['#938c7e','#a99d8b','#85897d','#b7a996']};
  if(palette[kind]){
   const colors=palette[kind],rect=/Rect/.test(kind),geometric=/Stone$/.test(kind),nx=4,ny=rect?8:4,w=512/nx,h=512/ny;
   for(let y=0;y<ny;y++)for(let x=0;x<nx;x++){
    const px=x*w,py=y*h;c.fillStyle=colors[Math.floor(r()*colors.length)];c.fillRect(px,py,w,h);
    if(geometric){c.beginPath();c.moveTo(px,py);c.lineTo(px+w,py+(x+y)%2*h);c.lineTo(px+(x+y+1)%2*w,py+h);c.closePath();c.fillStyle=colors[(x+y+2)%4];c.fill();}
    c.save();c.beginPath();c.rect(px+1,py+1,w-2,h-2);c.clip();for(let vein=0;vein<5;vein++){c.strokeStyle=vein%2?'#e3dfcd40':'#344a3d28';c.lineWidth=.4+r()*.8;c.beginPath();const sy=py+r()*h;for(let j=0;j<=16;j++){const xx=px+j*w/16,yy=sy+Math.sin(j*.7+x+y)*3+j*.7;j?c.lineTo(xx,yy):c.moveTo(xx,yy);}c.stroke();}c.restore();c.strokeStyle='#5b635b55';c.lineWidth=1;c.strokeRect(px,py,w,h);
   }
   for(let i=0;i<14000;i++){c.fillStyle=i%2?'#ffffff0b':'#161f1809';c.fillRect(r()*512,r()*512,.5+r(),.5+r());}
  }else{
   c.fillStyle=color;c.fillRect(0,0,512,512);
   if(kind==='stoneWall')for(let i=0;i<100;i++){const x=r()*512;c.strokeStyle=i%3?'#8d806b26':'#f5eed84a';c.lineWidth=.4+r()*2;c.beginPath();for(let y=0;y<=512;y+=8){const xx=x+Math.sin(y*.027+i)*3;y?c.lineTo(xx,y):c.moveTo(xx,y);}c.stroke();}
   if(kind==='metal')for(let y=0;y<512;y+=16)for(let x=0;x<512;x+=16){c.strokeStyle='#555e5b30';c.lineWidth=.7;c.strokeRect(x+2,y+2,11,11);}
   c.strokeStyle=kind==='ceiling'?'#747d7138':'#69726745';c.lineWidth=kind==='ceiling'?1:1.5;if(kind==='ceiling'||kind==='metal')c.strokeRect(.5,.5,511,511);else{c.beginPath();c.moveTo(.5,0);c.lineTo(.5,512);c.stroke();}if(kind==='ceiling'){for(let y=8;y<512;y+=8)for(let x=8;x<512;x+=8){c.fillStyle='#6e776f16';c.fillRect(x,y,.7,.7);}}
   if(kind==='roof'){for(let y=0;y<512;y+=32){c.fillStyle='#74756b2b';c.fillRect(0,y,512,2);c.fillStyle='#ffffff40';c.fillRect(0,y+2,512,1);}c.strokeStyle='#6f746b40';c.lineWidth=1;c.strokeRect(.5,.5,511,511);}
   for(let i=0;i<10000;i++){c.fillStyle=i%2?'#ffffff08':'#121c1606';c.fillRect(r()*512,r()*512,1,1);}
  }
 });
}
