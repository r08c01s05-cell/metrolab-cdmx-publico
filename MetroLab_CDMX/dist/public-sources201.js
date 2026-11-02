// Only explicitly reviewed governmental pages belong in this source catalogue.
export const PUBLIC_SOURCES201=Object.freeze([
 {title:'Afluencia diaria del Metro CDMX',publisher:'SEMOVI · Datos Abiertos CDMX',url:'https://www.datos.cdmx.gob.mx/es_AR/dataset/afluencia-diaria-del-metro-cdmx',detail:'Series de entradas por línea y estación y desglose por medio de acceso. El portal declara licencia CC-BY-4.0-ESP. Las copias de datos del simulador conservan su fecha de corte; no son afluencia en tiempo real.'},
 {title:'Conformación de un tren',publisher:'STC Metro · Gobierno de la Ciudad de México',url:'https://www.metro.cdmx.gob.mx/operacion/conformacion-de-un-tren',detail:'Descripción pública general de carros motrices, remolques y bogies. No sustituye las fichas particulares de cada modelo.'},
 {title:'Cifras de operación',publisher:'STC Metro · Gobierno de la Ciudad de México',url:'https://metro.cdmx.gob.mx/operacion/cifras-de-operacion',detail:'Consulta de estadísticas y publicaciones de operación en el sitio institucional.'}
]);
export function renderPublicSources201(host,doc=host.ownerDocument){
 host.replaceChildren();const intro=doc.createElement('p');intro.textContent='Consulta únicamente publicaciones gubernamentales en sus sitios oficiales. No se distribuyen aquí manuales aportados, planos, láminas, presentaciones ni copias OCR. La consulta pública no implica licencia universal de reutilización; revisa los términos de cada fuente.';host.append(intro);
 for(const source of PUBLIC_SOURCES201){const article=doc.createElement('article'),h=doc.createElement('h3'),a=doc.createElement('a'),who=doc.createElement('p'),detail=doc.createElement('p');a.href=source.url;a.target='_blank';a.rel='noopener noreferrer';a.textContent=source.title;h.append(a);who.textContent=source.publisher;detail.textContent=source.detail;article.append(h,who,detail);host.append(article);}
}
