import {renderPublicSources201} from './public-sources201.js?v=201';
export const normalize89=s=>s.normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase();
export function searchPages89(docs,query,source=''){const words=normalize89(query).trim().split(/\s+/).filter(Boolean);return docs.filter(d=>!source||d.id===source).flatMap(d=>d.content.filter(p=>words.every(w=>normalize89(p.text).includes(w))).map(p=>({...p,source:d.id,name:d.name,file:d.file})));}
export function energyState89({era='modern',traction=true,auxiliary=true,fault=false}={}){return {input:era==='historic'?85:230,distribution:15,traction:traction&&!fault?750:0,auxiliary,canTraction:traction&&!fault};}
export function setStudyRequest89(){}
export async function mountKnowledge89(host){renderPublicSources201(host);}
