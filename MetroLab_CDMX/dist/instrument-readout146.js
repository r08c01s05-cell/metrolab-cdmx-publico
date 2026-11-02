export function readingParts146(value,kind='dmm'){
 const text=String(value||'—');if(/^Descarg|Ensayo/.test(text))return{value:text.match(/\d+ ?%/)?.[0]||'…',unit:'',status:text};const match=text.match(/^(\d+(?:\.\d+)?|OL)\s*(V CD|mV|V|Ω|MΩ|m\/s)?(?:\s*·\s*(.*))?$/);
 if(match)return{value:match[1],unit:match[2]||'',status:match[3]||({dmm:'MEDICIÓN',megohm:'AISLAMIENTO',anemometer:'FLUJO DE AIRE'})[kind]||'MEDICIÓN'};
 if(text==='—')return{value:'—',unit:'',status:'PREPARADO'};
 return{value:'OK',unit:'',status:text};
}
export function drawInstrument146(ctx,width,height,value,kind){
 const data=readingParts146(value,kind);ctx.fillStyle='#adb79e';ctx.fillRect(0,0,width,height);ctx.fillStyle='#26342b';ctx.textAlign='left';ctx.font=`${Math.round(height*.10)}px monospace`;ctx.fillText(kind==='megohm'?'MΩ · ENSAYO VIRTUAL':kind==='anemometer'?'ANEMÓMETRO':'MULTÍMETRO',width*.055,height*.15);ctx.textAlign='center';ctx.font=`${Math.round(height*.42)}px monospace`;ctx.fillText(data.value,width*.47,height*.64);ctx.font=`${Math.round(height*.16)}px monospace`;ctx.textAlign='right';ctx.fillText(data.unit,width*.94,height*.64);ctx.textAlign='center';ctx.font=`${Math.round(height*.095)}px sans-serif`;ctx.fillText(data.status,width*.50,height*.87,width*.90);return data;
}
