"""Retira mobiliario genérico de los andenes; conserva los asientos de los trenes."""
import hashlib, json, pathlib, struct
root=pathlib.Path(__file__).resolve().parents[1]
report=[]
for p in sorted((root/'dist/models/andenes').glob('*/*.glb')):
    b=p.read_bytes(); size=struct.unpack_from('<I',b,12)[0]
    d=json.loads(b[20:20+size]); tail=b[20+size:]
    removed={i for i,n in enumerate(d['nodes']) if any(s in n.get('name','').lower() for s in ['listón asiento perforado','pata banco','respaldo banco'])}
    assert removed, p
    for scene in d['scenes']:
        scene['nodes']=[i for i in scene.get('nodes',[]) if i not in removed]
    for node in d['nodes']:
        if 'children' in node: node['children']=[i for i in node['children'] if i not in removed]
    for i in removed:
        d['nodes'][i].pop('mesh',None)
    d.setdefault('extras',{})['correccion_19']='Bancos genéricos retirados de los andenes a petición del usuario.'
    raw=json.dumps(d,ensure_ascii=False,separators=(',',':')).encode();raw+=b' '*((-len(raw))%4)
    out=struct.pack('<III',0x46546c67,2,20+len(raw)+len(tail))+struct.pack('<II',len(raw),0x4e4f534a)+raw+tail
    p.write_bytes(out)
    assert all('mesh' not in d['nodes'][i] for i in removed)
    report.append({'modelo':str(p.relative_to(root/'dist')),'componentes_retirados':len(removed),'sha256':hashlib.sha256(out).hexdigest()})
p=root/'dist/datos.json';d=json.loads(p.read_text())
def visit(v):
    if isinstance(v,dict):
        for k,val in v.items():
            if k=='url_glb' and isinstance(val,str) and 'models/andenes/' in val:v[k]=val.split('?')[0]+'?revision=19'
            else:visit(val)
    elif isinstance(v,list):
        for val in v:visit(val)
visit(d);p.write_text(json.dumps(d,ensure_ascii=False,indent=2)+'\n')
p=root/'dist/index.html';p.write_text(p.read_text().replace('station-scene.js?v=18','station-scene.js?v=19').replace('app.js?v=18','app.js?v=19'))
p=root/'dist/docs/andenes_L8/LEEME.md';p.write_text(p.read_text().replace('bancos y gabinetes detallados','gabinetes detallados'))
(root/'dist/docs/Correccion_19.json').write_text(json.dumps({'correccion':'Retirada de bancos genéricos de las estaciones de L1 y L8','modelos':report},ensure_ascii=False,indent=2)+'\n')
print(json.dumps({'estaciones':len(report),'componentes_retirados':sum(x['componentes_retirados'] for x in report)}))
