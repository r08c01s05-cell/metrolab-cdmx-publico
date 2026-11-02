export const trainPrefix=train=>train.line===1?'NM22':train.model==='MP-82'?'MP82':'NM79';
export async function loadTrainPair(assets,pending,prefix,loadScene,wait=ms=>new Promise(resolve=>setTimeout(resolve,ms))){
 return Promise.all(['cabina','intermedio'].map(kind=>{
  const key=prefix+'_'+kind;if(assets.has(key))return assets.get(key);
  if(pending.has(key))return pending.get(key);
  const task=(async()=>{let last;
   for(let attempt=0;attempt<3;attempt++){
    try{const scene=await loadScene(key);assets.set(key,scene);return scene;}
    catch(error){last=error;if(attempt<2)await wait(500*(attempt+1));}
   }throw last;
  })();pending.set(key,task);task.then(()=>pending.delete(key),()=>pending.delete(key));return task;
 }));
}
