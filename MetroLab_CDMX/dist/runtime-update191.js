// Check only the small entry document; never reload a student's active practice.
(()=>{
 const current=document.querySelector('meta[name="metro-revision"]')?.content;
 if(!current)return;
 let checking=false,button;
 function placeNotice(){if(!button)return;const dialogs=[...document.querySelectorAll('dialog[open]')],host=dialogs.at(-1)||document.body;if(button.parentElement!==host)host.append(button);}
 const noticeObserver=new MutationObserver(placeNotice);
 async function check(){
  if(document.hidden||checking||button)return;
  checking=true;
  try{
   const response=await fetch(location.pathname+'?metro-update='+Date.now(),{cache:'no-store'});
   if(!response.ok)return;
   const html=await response.text(),latest=new DOMParser().parseFromString(html,'text/html').querySelector('meta[name="metro-revision"]')?.content;
   if(!latest||latest===current)return;
   if(['home',''].includes(document.body.dataset.gameScreen||'')){location.reload();return;}
   button=document.createElement('button');button.type='button';button.textContent='Nueva versión disponible · Actualizar';button.title='Recarga el simulador. La práctica actual se reiniciará.';button.style.cssText='position:fixed;bottom:16px;left:16px;z-index:100000;padding:12px 16px;border:1px solid #c4bd97;border-radius:8px;background:#193139;color:#f4ebd4;font:14px system-ui;cursor:pointer';button.onclick=()=>location.reload();placeNotice();noticeObserver.observe(document.body,{subtree:true,childList:true,attributes:true,attributeFilter:['open']});
  }catch{/* Offline/Codespace asleep: keep the current practice intact. */}
  finally{checking=false;}
 }
 addEventListener('focus',check);document.addEventListener('visibilitychange',check);setInterval(check,30000);
})();
