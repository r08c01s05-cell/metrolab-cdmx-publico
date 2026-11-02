// CPU QA only: GLTFLoader receives texture dimensions without WebGL rendering.
// Embedded image payloads are verified separately with Pillow.
globalThis.self=globalThis;
globalThis.createImageBitmap=async blob=>{
 const b=new Uint8Array(await blob.arrayBuffer());
 const v=new DataView(b.buffer);
 if(b[0]===137&&b[1]===80)return {width:v.getUint32(16),height:v.getUint32(20),close(){}};
 if(b[0]===255&&b[1]===216){
  let i=2;while(i<b.length){
   if(b[i++]!==255)continue;
   const marker=b[i++],size=v.getUint16(i);
   if([192,193,194].includes(marker))return {width:v.getUint16(i+5),height:v.getUint16(i+3),close(){}};
   i+=size;
  }
 }
 throw new Error('Unsupported image in CPU QA');
};
