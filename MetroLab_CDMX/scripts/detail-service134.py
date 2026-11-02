"""Add a visible bench instrument without changing any interactive node IDs."""
from pathlib import Path
import bpy
source=Path(__file__).with_name('build-substation134.py').read_text();exec(source.split('# Main room:')[0])
for kind in ['ventilation','control','battery']:
 bpy.ops.wm.open_mainfile(filepath=str(OUT/('servicio_'+kind+'.blend')));root=bpy.data.objects['Servicio_SR134_'+kind];steel=bpy.data.materials['Acero satinado banco134'];dark=bpy.data.materials['Caucho grafito banco134'];white=bpy.data.materials.get('Ceramica banco134') or material('Ceramica banco134',(.72,.74,.67),0,.65);red=bpy.data.materials.get('Aislante rojo banco134') or material('Aislante rojo banco134',(.42,.035,.02),0,.7)
 # A widened bench supports the meter fully; it is not suspended beyond its worktop.
 table=bpy.data.objects['Mesa de servicio'];table.dimensions.x=2.75;bpy.ops.object.select_all(action='DESELECT');table.select_set(True);bpy.context.view_layer.objects.active=table;bpy.ops.object.transform_apply(location=False,rotation=False,scale=True)
 meter=empty('sr134_meter',root,(1.1,-.10,-.19));box(meter,'Funda elastomero',(0,0,0),(.40,.66,.13),dark,.025);box(meter,'Frente de instrumento',(0,0,-.074),(.34,.58,.022),white,.015);box(meter,'Marco de LCD',(0,.16,-.09),(.30,.18,.025),dark,.008);lcd=empty('sr134_meterDisplay',meter,(0,.16,-.106));box(lcd,'Fondo LCD',(0,0,0),(.27,.145,.003),white,.002)
 cyl(meter,'Selector de instrumento',(0,-.12,-.105),.066,.025,dark);box(meter,'Indice selector',(0,-.08,-.122),(.012,.065,.008),steel,.001)
 for x in [-.10,0,.10]:cyl(meter,'Tecla de instrumento',(x,.005,-.105),.019,.014,dark)
 for x,m in [(-.08,dark),(.08,red)]:cyl(meter,'Entrada de medida',(x,-.25,-.11),.023,.025,m)
 text(root,'Leyenda multimetro','VIRTUAL / V CC',(1.1,.31,-.20),.034,dark)
 export(root,'servicio_'+kind,WEB/('servicio_'+kind+'.glb.gz'))
