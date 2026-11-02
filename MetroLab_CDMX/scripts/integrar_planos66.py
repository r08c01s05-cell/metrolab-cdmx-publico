from pathlib import Path
from lxml import etree
import fitz,zipfile,json,hashlib,re,unicodedata,io
from PIL import Image,ImageOps
ROOT=Path('/workspace/sites/metro-cdmx-simulador');INPUT=Path('/workspace/scratch/fc8783fbaffa/upload');SOURCE=Path('/workspace/scratch/fc8783fbaffa/planos66/2026-10-12_metro.cdmx.gob.mx_anexo1_planos');OUT=ROOT/'dist/tecnica/linea1';OUT.mkdir(parents=True,exist_ok=True)
def normal(t):return ''.join(c for c in unicodedata.normalize('NFD',t.lower()) if unicodedata.category(c)!='Mn')
def key(t):return re.sub('[^a-z0-9]','',normal(t))
with zipfile.ZipFile(INPUT/'PLANOS L1 (1).docx') as z:r=etree.fromstring(z.read('word/document.xml'))
ns={'w':'http://schemas.openxmlformats.org/wordprocessingml/2006/main'};index=[]
for row in r.xpath('//w:tr',namespaces=ns):
 cells=[' '.join(c.xpath('.//w:t/text()',namespaces=ns)).strip() for c in row.xpath('w:tc',namespaces=ns)]
 if len(cells)==3 and cells[0].isdigit():index.append({'number':int(cells[0]),'code':cells[1],'description':cells[2]})
assert len(index)==93
names=['Pantitlán','Zaragoza','Gómez Farías','Boulevard Puerto Aéreo','Balbuena','Moctezuma','San Lázaro','Candelaria','Merced','Pino Suárez','Isabel la Católica','Salto del Agua','Balderas','Cuauhtémoc','Insurgentes','Sevilla','Chapultepec','Juanacatlán','Tacubaya','Observatorio']
aliases={n:[key(n)] for n in names};aliases['Boulevard Puerto Aéreo']+=['aeropuerto','puertoaereo'];aliases['Candelaria']+=['calendaria'];aliases['Juanacatlán']+=['juanacatlan']
files=sorted(SOURCE.glob('*.pdf'));items=[];matched=set();hashes={}
for i,p in enumerate(files):
 candidates=[x for x in index if key(x['code'].split(',')[0])==key(p.stem)]
 if not candidates:
  nums=re.findall(r'\d+',p.stem)
  if normal(p.stem).startswith('curva') and nums:
   candidates=[x for x in index if normal(x['code']).startswith('tv') and any(re.search(r'(?<!\d)'+re.escape(n)+r'(?!\d)',x['description'].split('CURVA')[-1]) for n in nums)]
 row=candidates[0] if len(candidates)==1 else None
 if row:matched.add(row['number'])
 title=row['description'] if row else p.stem
 text=key(title+' '+p.stem);stations=[n for n,a in aliases.items() if any(v in text for v in a)]
 lo=normal(title+' '+p.stem)
 category='Curvas y peraltes' if any(v in lo for v in ['curva','courb','elevacion','peralte','devers']) else 'Talleres' if any(v in lo for v in ['taller','atelier','deposito','garage']) else 'Aparatos de vía' if any(v in lo for v in ['comunica','communication','desvio','branchement','ramificacion','aparato','appareil']) else 'Terminales y conexiones' if any(v in lo for v in ['terminal','terminus','conexion','raccord','recordement']) else 'Implantación y perfiles'
 code=f'p{i+1:03d}';doc=fitz.open(p);pdf=fitz.open();thumb=None
 for j,page in enumerate(doc):
  factor=min(1.8,4000/max(page.rect.width,page.rect.height));pix=page.get_pixmap(matrix=fitz.Matrix(factor,factor),colorspace=fitz.csGRAY)
  im=Image.frombytes('L',[pix.width,pix.height],pix.samples);data=io.BytesIO();im.save(data,format='JPEG',quality=65)
  new=pdf.new_page(width=page.rect.width,height=page.rect.height);new.insert_image(new.rect,stream=data.getvalue())
  if j==0:
   if im.height>im.width*1.4:im=im.rotate(90,expand=True)
   im.thumbnail((1800,1100));im.save(OUT/(code+'.jpg'),quality=88)
 pdf.save(OUT/(code+'.pdf'),deflate=True);digest=hashlib.sha256(p.read_bytes()).hexdigest();hashes.setdefault(digest,[]).append(p.name)
 items.append({'id':code,'file':p.name,'code':row['code'] if row else p.stem,'description':title,'category':category,'stations':stations,'pages':len(doc),'sha256_original':digest,'indexNumber':row['number'] if row else None,'preview':'tecnica/linea1/'+code+'.jpg','pdf':'tecnica/linea1/'+code+'.pdf','status':'Plano histórico · vigencia pendiente de contraste','review':'Lectura visual prioritaria' if p.name in ['TV 375.pdf','SMV 452.pdf','TV 747.pdf','TV 748.pdf','TV 403.pdf','TV 419.pdf','TV 630.pdf'] else 'Catalogado; cotas pendientes de transcripción verificada'})
 if (i+1)%25==0:print('Procesados',i+1,flush=True)
for item in items:
 if item['file'] in ['TV 420.pdf','CURVAS No. 1 Y No. 2.pdf']:
  item['verifiedReadings']=[{'parameter': 'Radio indicado', 'value': '400 m'}, {'parameter': 'Peralte indicado', 'value': '120 mm'}, {'parameter': 'Transición a cada lado', 'value': '30 m'}, {'parameter': 'Plena curva de vía 2', 'value': '18.064 m'}, {'parameter': 'Fecha del dibujo', 'value': '16 de julio de 1968'}]
  item['readingScope']='TV 420: curvas 1 y 2, Gómez Farías–Aeropuerto. Valores leídos visualmente del dibujo histórico; no se aplican como parámetros vigentes del recorrido.'
  item['review']='Dibujo y cotas principales revisados visualmente'
report={'title':'Planos técnicos de vías · Línea 1','source_docx':'PLANOS L1 (1).docx','source_zip':'2026-10-12_metro.cdmx.gob.mx_anexo1_planos.zip','indexEntries':len(index),'pdfFiles':len(files),'pages':sum(x['pages'] for x in items),'scanned':True,'scope':'Documentación histórica de vías. No acredita la geometría actual de estaciones ni especificaciones del NM-22. Kilometrajes con orígenes diferentes; radios y peraltes requieren transcripción y validación.','items':items,'index':index,'indexNotMatched':[x for x in index if x['number'] not in matched],'exactDuplicates':[v for v in hashes.values() if len(v)>1]}
(OUT/'catalogo.json').write_text(json.dumps(report,ensure_ascii=False,indent=2));print('Final',len(items),'PDF',report['pages'],'páginas','sin coincidencia directa',len(report['indexNotMatched']),'MB',round(sum(p.stat().st_size for p in OUT.glob('*'))/1e6,1),flush=True)
