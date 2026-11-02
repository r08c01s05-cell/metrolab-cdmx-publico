(function(root){
 function electrical(voltage,current,resistance,distance){const drop=current*resistance*distance;return{drop,load:voltage-drop,loss:current*current*resistance*distance};}
 function kinetic(massTonnes,kmh){return .5*massTonnes*1000*(kmh/3.6)**2/1e6;}
 root.MetroPortal144={electrical,kinetic};if(typeof document==='undefined')return;
 const $=id=>document.getElementById(id),value=(id,min,max,fallback)=>{const n=Number($(id).value);return Number.isFinite(n)?Math.min(max,Math.max(min,n)):fallback;};
 function chart(id,points,title,yUnit,maxY){const w=760,h=220,left=66,top=20,cw=660,ch=155,maxX=Math.max(.1,...points.map(p=>p[0]));const x=v=>left+v/maxX*cw,y=v=>top+ch-v/maxY*ch;$(id).innerHTML=`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${w} ${h}" role="img" aria-label="${title}"><title>${title}</title><path d="M${left},${top}V${top+ch}H${left+cw}" fill="none" stroke="#75919c"/><text x="12" y="17" fill="#b3c9d1" font-size="12">${yUnit}</text><text x="${left}" y="${top+ch+22}" fill="#b3c9d1" font-size="12">0</text><text x="${left+cw-40}" y="${top+ch+22}" fill="#b3c9d1" font-size="12">${maxX} ${id==='voltage-chart'?'km':'km/h'}</text><text x="8" y="${top+12}" fill="#b3c9d1" font-size="12">${maxY.toFixed(0)}</text><polyline points="${points.map(p=>x(p[0])+','+y(p[1])).join(' ')}" fill="none" stroke="#8ad8bf" stroke-width="3"/></svg>`;}
 function calculate(){const V=value('voltage',1,1500,750),I=value('current',0,4000,1000),R=value('resistance',0,1,.015),L=value('distance',0,2,1.2),e=electrical(V,I,R,L);$('current-value').textContent=I+' A';$('distance-value').textContent=L.toFixed(2)+' km';$('energy-result').textContent=e.load<0?'El supuesto de corriente constante produce una tensión negativa. Cambia los parámetros: ese punto queda fuera del modelo de carga pasiva.':`Caída: ${e.drop.toFixed(1)} V · carga: ${e.load.toFixed(1)} V · pérdidas: ${(e.loss/1000).toFixed(1)} kW`;
 const samples=Array.from({length:21},(_,i)=>[i/10,electrical(V,I,R,i/10).load]);chart('voltage-chart',samples.filter(p=>p[1]>=0),'Tensión de carga frente a distancia · ejemplo resistivo','V',V);
 const mass=value('mass',1,1000,300),speed=value('speed',0,100,60);$('speed-value').textContent=speed+' km/h';$('kinetic-result').textContent=`${mass} t a ${speed} km/h: ${kinetic(mass,speed).toFixed(2)} MJ de energía cinética. Duplicar la velocidad multiplica esta energía por cuatro.`;chart('kinetic-chart',Array.from({length:21},(_,i)=>[i*5,kinetic(mass,i*5)]),'Energía cinética frente a velocidad · masa de ejemplo','MJ',kinetic(mass,100));}
 document.querySelectorAll('.controls input').forEach(i=>i.addEventListener('input',calculate));calculate();
 const roles={M:'Carro motriz con cabina de la formación de referencia.',N:'Carro motriz intermedio de la formación de referencia.',R:'Remolque de la formación de referencia.',PR:'Remolque con referencia al captor de pilotaje automático.'};['M','R','N','N','PR','N','N','R','M'].forEach((type,i)=>{const b=document.createElement('button');b.textContent=type;b.setAttribute('aria-label',`Carro ${i+1}: ${type}`);b.onclick=()=>{document.querySelectorAll('#formation button').forEach(a=>a.setAttribute('aria-pressed',String(a===b)));$('car-info').textContent=`${i+1} · ${roles[type]}`;};$('formation').append(b);});$('formation').firstElementChild.click();
 $('spring-toggle').onclick=()=>{const active=$('spring').classList.toggle('applied');$('spring-toggle').setAttribute('aria-pressed',String(active));$('spring-toggle').textContent=active?'Restablecer presión':'Simular pérdida de presión';$('chamber').textContent=active?'Cámara sin presión':'Cámara con presión';$('shoe').textContent=active?'Freno aplicado':'Freno liberado';$('spring-info').textContent=active?'En este esquema, el resorte se expande y aplica el freno.':'La presión mantiene comprimido el resorte en este esquema.';};
 $('pulse-toggle').onclick=()=>{const active=$('pulse-toggle').getAttribute('aria-pressed')!=='true';$('pulse-toggle').setAttribute('aria-pressed',String(active));$('pulse-toggle').textContent=active?'Ver ejemplo de seis pulsos':'Ver ejemplo de doce pulsos';$('pulse-result').textContent=active?'Doce pulsos · órdenes ilustrados: 11, 13, 23, 25.':'Seis pulsos · órdenes ilustrados: 5, 7, 11, 13.';};
 $('search').oninput=()=>{const normalize=s=>s.normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase(),q=normalize($('search').value),sections=[...document.querySelectorAll('main section')];for(const s of sections)s.hidden=!normalize(s.textContent).includes(q);$('no-results').hidden=sections.some(s=>!s.hidden);};
})(typeof window==='undefined'?globalThis:window);

// Additional study experiments use only local DOM; no network or continuous animation loop.
(()=>{
 if(typeof document==='undefined')return;
 const $=id=>document.getElementById(id);
 const fields=['motor-frequency','motor-poles','thermal-current','thermal-resistance','thermal-time'];
 function update(){
  const valid=fields.every(id=>$(id).value.trim()!==''&&$(id).checkValidity());
  if(!valid){$('motor-result').textContent=$('thermal-result').textContent='Revisa los valores: deben estar dentro del intervalo indicado.';return;}
  const f=Number($('motor-frequency').value),p=Number($('motor-poles').value),I=Number($('thermal-current').value),R=Number($('thermal-resistance').value),t=Number($('thermal-time').value),P=I*I*R;
  $('motor-result').textContent=`nₛ = ${(120*f/p).toLocaleString('es-MX')} r/min · ejemplo ideal`;
  $('thermal-result').textContent=`Potencia: ${(P/1000).toLocaleString('es-MX')} kW · energía: ${(P*t/1e6).toLocaleString('es-MX')} MJ`;
 }
 fields.forEach(id=>$(id).addEventListener('input',update));update();
 document.querySelectorAll('header nav a').forEach(a=>a.addEventListener('click',()=>{if($('search').value){$('search').value='';$('search').dispatchEvent(new Event('input'));}}));
})();
