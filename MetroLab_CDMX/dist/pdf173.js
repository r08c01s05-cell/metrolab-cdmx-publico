// Small vector PDF 1.4 writer, local and dependency-free. Built-in Helvetica/WinAnsi.
// No rasterized diagram, network service, print-dialog dependency, or remote font.
const mm=72/25.4,esc=s=>String(s).replace(/[\\()]/g,'\\$&');
const cp=new Map([[0x20ac,128],[0x2013,150],[0x2014,151],[0x2018,145],[0x2019,146],[0x201c,147],[0x201d,148],[0x2022,149]]);
function bytes(s){return Uint8Array.from([...s].map(c=>c.charCodeAt(0)<=255?c.charCodeAt(0):cp.get(c.charCodeAt(0))||63));}
const clean=s=>String(s??'Pendiente').replaceAll('→',' -> ').replaceAll('−','-').replaceAll('×',' x ').replaceAll('φ','phi').replaceAll('Ω','ohm').replaceAll('Δ','delta').replaceAll('≥','>=').replaceAll('≤','<=');
export class PDF173{
 constructor(){this.pages=[];}
 page(w=420,h=297){this.w=w;this.h=h;this.p=[];this.pages.push({w,h,p:this.p});this.p.push('0 G 0 g 0.6 w');return this;}
 line(x,y,u,v){this.p.push(`${x*mm} ${(this.h-y)*mm} m ${u*mm} ${(this.h-v)*mm} l S`);}
 circle(x,y,r){const k=.5522847498,a=x-r,b=x+r,c=y-r,d=y+r;this.p.push(`${x*mm} ${(this.h-c)*mm} m ${(x+k*r)*mm} ${(this.h-c)*mm} ${b*mm} ${(this.h-y+k*r)*mm} ${b*mm} ${(this.h-y)*mm} c ${b*mm} ${(this.h-y-k*r)*mm} ${(x+k*r)*mm} ${(this.h-d)*mm} ${x*mm} ${(this.h-d)*mm} c ${(x-k*r)*mm} ${(this.h-d)*mm} ${a*mm} ${(this.h-y-k*r)*mm} ${a*mm} ${(this.h-y)*mm} c ${a*mm} ${(this.h-y+k*r)*mm} ${(x-k*r)*mm} ${(this.h-c)*mm} ${x*mm} ${(this.h-c)*mm} c S`);}
 text(x,y,s,h=3.4){this.p.push(`BT /F1 ${h*mm} Tf 1 0 0 1 ${x*mm} ${(this.h-y)*mm} Tm (${esc(clean(s))}) Tj ET`);}
 wrap(s,max=105){const out=[];let line='';for(const word of clean(s).split(/\s+/)){if((line+' '+word).length>max&&line){out.push(line);line='';}if(word.length>max){if(line){out.push(line);line='';}for(let i=0;i<word.length;i+=max)out.push(word.slice(i,i+max));}else line+=(line?' ':'')+word;}if(line)out.push(line);return out;}
 diagram(entities){this.page(594,420);for(const o of entities){if(o.t==='L')this.line(o.x,o.y,o.u,o.v);if(o.t==='C')this.circle(o.x,o.y,o.r);if(o.t==='T')this.text(o.x,o.y,o.s,o.h);}return this;}
 report(title,sections){let y;const start=()=>{this.page();this.text(12,15,title,4.5);this.text(12,23,'ESTIMACIÓN PARA SIMULACIÓN EDUCATIVA · entradas supuestas o editadas; no usar para construcción.',3.2);this.line(12,27,408,27);y=35;};start();for(const [name,value]of sections){const lines=this.wrap(`${name}: ${value}`,178);for(const line of lines){if(y>280){start();}this.text(12,y,line,3.35);y+=5;}y+=2;}return this;}
 finish(){const objects=[],add=s=>(objects.push(s),objects.length),catalog=add(''),pages=add(''),font=add('<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica /Encoding /WinAnsiEncoding >>'),ids=[];
 for(const page of this.pages){const stream=page.p.join('\n'),content=add(`<< /Length ${bytes(stream).length} >>\nstream\n${stream}\nendstream`),id=add(`<< /Type /Page /Parent ${pages} 0 R /MediaBox [0 0 ${page.w*mm} ${page.h*mm}] /Resources << /Font << /F1 ${font} 0 R >> >> /Contents ${content} 0 R >>`);ids.push(id);}
 objects[catalog-1]=`<< /Type /Catalog /Pages ${pages} 0 R >>`;objects[pages-1]=`<< /Type /Pages /Count ${ids.length} /Kids [${ids.map(id=>id+' 0 R').join(' ')}] >>`;
 let s='%PDF-1.4\n%âãÏÓ\n',offsets=[0];for(let i=0;i<objects.length;i++){offsets.push(bytes(s).length);s+=`${i+1} 0 obj\n${objects[i]}\nendobj\n`;}const xref=bytes(s).length;s+=`xref\n0 ${objects.length+1}\n0000000000 65535 f \n`+offsets.slice(1).map(o=>String(o).padStart(10,'0')+' 00000 n \n').join('')+`trailer\n<< /Size ${objects.length+1} /Root ${catalog} 0 R >>\nstartxref\n${xref}\n%%EOF\n`;return bytes(s);}
}
