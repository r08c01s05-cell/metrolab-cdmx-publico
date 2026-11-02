export class MeterPanel123{
 constructor(root,doc,action){this.$=id=>doc.getElementById(id);const panel=doc.createElement('section');panel.setAttribute('id','meter123-panel');panel.setAttribute('aria-label','Multímetro y puntas');panel.innerHTML='<div class="meter123-title">MULTÍMETRO · 24 V CC VIRTUAL</div><div id="meter123-reading"></div><div class="meter123-leads"><button id="meter123-red" type="button"></button><button id="meter123-black" type="button"></button></div><div id="meter123-clear-slot"></div><div id="meter123-records" aria-label="Mediciones comprobadas"></div>';
 root.querySelector('.m118-coach').append(panel);this.$('meter123-reading').append(this.$('hands-meter-value'));this.$('meter123-clear-slot').append(this.$('repair102-clear'));this.$('repair102-clear').textContent='Retirar ambas puntas';this.$('meter123-red').onclick=()=>action('removeRedProbe');this.$('meter123-black').onclick=()=>action('removeBlackProbe');this.panel=panel;
 }
 update(state,labels){this.panel.hidden=state.id!=='electrical';if(this.panel.hidden)return;for(const colour of ['red','black']){const button=this.$('meter123-'+colour),target=state.probes[colour];button.textContent=(colour==='red'?'Roja':'Negra')+' · '+(target?(labels[target]||target)+' · retirar':'en soporte');button.disabled=!target;button.dataset.connected=String(Boolean(target));}
 const history=(state.verifiedReadings||[]).map(r=>r.step+': '+r.value).join(' · ');if(this.$('meter123-records').textContent!==history)this.$('meter123-records').textContent=history;
 }
}
