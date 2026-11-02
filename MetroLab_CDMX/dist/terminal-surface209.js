// Observatorio already has the correct two lateral platforms in the authored GLB.
// Retain its geometry/maps; remove an inherited Line 8 green stripe in Line 1.
export function finishObservatorio209(root,station){
 if(station?.id!=='L1-20')return 0;
 const clones=new Map();let corrected=0;
 root.traverse(o=>{if(!o.isMesh)return;const original=Array.isArray(o.material)?o.material:[o.material];
  const list=original.map(m=>{
   if(!/Franja_verde_Linea_8/.test(m?.name||''))return m;
   if(!clones.has(m)){const n=m.clone();n.name='Franja rosa Línea 1 Observatorio209';n.color.set('#df438d');clones.set(m,n);}corrected++;return clones.get(m);
  });o.material=Array.isArray(o.material)?list:list[0];
 });
 station.tipo_anden='dos laterales';station.geometria_3d={...station.geometria_3d,tipo_anden_modelado:'dos laterales',revision_andenes209:'Geometría lateral conservada; UV2 del pavimento preservadas y franjas de Línea 1 corregidas. Dimensiones y accesos aproximados.'};
 root.userData.layout209='lateral';root.userData.observatorio209={corrected};return corrected;
}
