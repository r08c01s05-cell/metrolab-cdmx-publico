import {renderPublicSources201} from './public-sources201.js?v=201';
const $=id=>document.getElementById(id);
const normalize=s=>s.normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase();
export function filterPlans(items,{query='',station='',category='',context=[]}={}){const q=normalize(query);return items.filter(p=>(!q||normalize(p.code+' '+p.description+' '+p.file).includes(q))&&(!station||p.stations.includes(station))&&(!category||p.category===category)&&(!context.length||p.stations.some(s=>context.includes(s))));}
function open(){const d=$('technical-dialog');if(!d)return;let host=d.querySelector('[data-public201]');if(!host){for(const n of [...d.children])if(!n.classList.contains('dialog-head'))n.hidden=true;host=document.createElement('section');host.dataset.public201='true';d.append(host);renderPublicSources201(host);}d.showModal();}
if($('technical-open'))$('technical-open').onclick=open;
if($('route-plans'))$('route-plans').hidden=true;
if($('technical-close'))$('technical-close').onclick=()=>$('technical-dialog').close();
