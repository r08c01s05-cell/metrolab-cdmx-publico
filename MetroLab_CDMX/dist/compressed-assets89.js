export async function loadCompressedGLB(loader,url){
 const plain=url.split(/[?#]/)[0].replace(/\.gz$/,''),r=await fetch(plain+'.gz?v=204',{signal:AbortSignal.timeout(45000)});
 if(!r.ok)throw Error('No se pudo cargar '+plain+': '+r.status);
 return loader.parseAsync(await new Response(r.body.pipeThrough(new DecompressionStream('gzip'))).arrayBuffer(),plain.slice(0,plain.lastIndexOf('/')+1));
}
export function compressedDownloadPath(path){
 path=path.split('?')[0].split('#')[0];
 if(/^models\/andenes\/.+\.glb$/.test(path))return path+'.gz';
 if(/^models\/(NM22|NM79|MP82)_(cabina|intermedio)\.glb(\.gz)?$/.test(path))return path.replace(/\.gz$/,'')+'.gz';
 return null;
}
