from pathlib import Path
import json
D=Path(__file__).resolve().parents[1]/'dist'
p=D/'app.js';s=p.read_text();a=s.index('function buildPoints()');b=s.index('function trainPoint',a)
s=s[:a]+'''function buildPoints(){for(const l of [1,8]){const n=engine.lines[l].stations.length;engine.lines[l].stations.forEach((s,i)=>{if(l===1&&data.recorrido_L1){const [x,y]=data.recorrido_L1.stations[s.id];points[s.id]={x:85+(x-98)*1.24,y:170+(y-51)*.82};}else{const row=i<10?0:1,col=i<10?i:(n-1-i);points[s.id]={x:95+col*100,y:185+row*170};}});}}
'''+s[b:]
s=s.replace("data=await response.json();try", "data=await response.json();const routeResponse=await fetch('recorrido_L1.json?v=18');if(!routeResponse.ok)throw Error('Recorrido no disponible');data.recorrido_L1=await routeResponse.json();try")
s=s.replace("return{x:a.x+(b.x-a.x)*f,y:a.y+(b.y-a.y)*f+(t.direction>0?-14:14)};", "const dx=b.x-a.x,dy=b.y-a.y,len=Math.hypot(dx,dy)||1,offset=t.direction>0?-14:14;return{x:a.x+dx*f-dy/len*offset,y:a.y+dy*f+dx/len*offset};")
old="splitName(s.nombre).forEach((text,i)=>ctx.fillText(text,p.x,p.y+35+i*15));if(s.correspondencias_metro.length)"
new="if(currentLine===1){ctx.save();ctx.translate(p.x,p.y+24);ctx.rotate(Math.PI/3);ctx.textAlign='left';ctx.font=(is?'bold ':'')+'12px Arial';ctx.fillText(s.nombre,0,0);ctx.restore();}else splitName(s.nombre).forEach((text,i)=>ctx.fillText(text,p.x,p.y+35+i*15));if(currentLine!==1&&s.correspondencias_metro.length)"
assert old in s;s=s.replace(old,new);p.write_text(s)
p=D/'station-scene.js';s=p.read_text();s=s.replace("const model=batchStationModel(g.scene);", "const model=batchStationModel(g.scene);if(station.linea===8)this.addMapPosters(model);")
a=s.index(' clearStations()');s=s[:a]+''' addMapPosters(model){
 const texture=new THREE.TextureLoader().load('textures/revision18/mapa_movilidad.jpg');texture.colorSpace=THREE.SRGBColorSpace;
 const material=new THREE.MeshStandardMaterial({map:texture,roughness:.75,side:THREE.DoubleSide});
 for(const side of [-1,1]){const mesh=new THREE.Mesh(new THREE.PlaneGeometry(1.14,1.52),material);mesh.name='Cartel mapa aportado';mesh.position.set(12,2.9,side*7.72);mesh.rotation.y=side>0?Math.PI:0;mesh.userData={componente:'pared',shell:'wall',side};model.add(mesh);}
 }
'''+s[a:]
s=s.replace("'Andenes Blender · '+line.stations[idx].nombre+' · Referencia del video'","'Andenes GLB · '+line.stations[idx].nombre+(state.currentLine===1?' · Fotografías · revisión 18':' · Referencia del video')")
s=s.replace("Andenes reconstruidos desde video; cotas y zonas ocultas aproximadas.","Andenes L1 actualizados desde fotografías; cotas y zonas ocultas aproximadas.")
p.write_text(s)
p=D/'index.html';s=p.read_text().replace('src="station-scene.js"','src="station-scene.js?v=18"').replace('src="app.js"','src="app.js?v=18"').replace('Selecciona una estación o un tren para inspeccionarlo.','Línea 1: recorrido según tu mapa. Selecciona una estación o un tren.');s=s.replace('</div><div class="legend">','</div><p class="scene-footnote">El esquema L1 reproduce la forma aportada. La vista 3D usa tramos rectificados y distancias aproximadas.</p><div class="legend">',1);p.write_text(s)
p=D/'revision.json';j=json.loads(p.read_text());j['revision_estaciones']=18;j['mapa_linea_1']='Esquema aportado por el usuario';p.write_text(json.dumps(j,ensure_ascii=False,indent=2))
