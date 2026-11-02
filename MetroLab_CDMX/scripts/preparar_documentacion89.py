from pathlib import Path
import fitz,json,zipfile,xml.etree.ElementTree as ET,hashlib,shutil,subprocess,concurrent.futures,os
from PIL import Image
import io, argparse
parser=argparse.ArgumentParser();parser.add_argument("source",type=Path);parser.add_argument("output",type=Path);args=parser.parse_args()
out=args.output;out.mkdir(parents=True,exist_ok=True)
inputs=[p for p in args.source.iterdir() if p.suffix.lower() in ('.pdf','.pptx')]; catalog=[]
def ocr(job):
 ident,num,png=job
 p=out/f'{ident}-{num}.txt'
 if p.exists():return p.read_text()
 r=subprocess.run(['tesseract','stdin','stdout','-l','eng','--psm','6'],input=png,stdout=subprocess.PIPE,stderr=subprocess.DEVNULL,env={**os.environ,'OMP_THREAD_LIMIT':'1'},check=True)
 t=r.stdout.decode();p.write_text(t);return t
for file in inputs:
 name=file.name
 ident='energia2' if 'Parte  2' in name else 'energia1' if 'Control' in name else 'equipo' if 'EQUIPO' in name else 'metro-texto' if file.suffix.lower()=='.pdf' else 'metro-slides'
 dest=out/(ident+file.suffix.lower()); pages=[]
 if ident.startswith('energia'):
  pdf=fitz.open(file);copy=fitz.open();jobs=[]
  for n,p in enumerate(pdf):
   pix=p.get_pixmap(dpi=145,colorspace=fitz.csGRAY)
   img=Image.open(io.BytesIO(pix.tobytes('png')))
   if ident=='energia2' and n>=61:img=img.rotate(-90,expand=True)
   b=io.BytesIO();img.save(b,format='JPEG',quality=78)
   page=copy.new_page(width=img.width*72/145,height=img.height*72/145);page.insert_image(page.rect,stream=b.getvalue())
   b=io.BytesIO();img.save(b,format='PNG');jobs.append((ident,n+1,b.getvalue()))
  copy.set_metadata({'title':name+' - copia de consulta','subject':'Rasterizada; original preservado en fuentes. OCR separado no corregido.'});copy.save(dest)
  with concurrent.futures.ThreadPoolExecutor(max_workers=6) as pool:
   for n,t in enumerate(pool.map(ocr,jobs)):pages.append({'page':n+1,'text':t,'method':'OCR automático sin corregir; verificar cifras y símbolos en la imagen'})
 elif file.suffix.lower()=='.pdf':
  shutil.copyfile(file,dest);pages=[{'page':n+1,'text':p.get_text(),'method':'Texto PDF'} for n,p in enumerate(fitz.open(file))]
 else:
  shutil.copyfile(file,dest)
  with zipfile.ZipFile(file) as z:
   slides=sorted([n for n in z.namelist() if __import__('re').match(r'ppt/slides/slide\d+\.xml$',n)],key=lambda n:int(__import__('re').search(r'slide(\d+)',n).group(1)))
   for n,s in enumerate(slides):pages.append({'page':n+1,'text':'\n'.join(e.text or '' for e in ET.fromstring(z.read(s)).iter() if e.tag.endswith('}t')),'method':'Texto de diapositiva; ilustraciones en el original'})
 doc={'id':ident,'name':name,'file':dest.name,'pages':len(pages),'sha256':hashlib.sha256(file.read_bytes()).hexdigest(),'copy':'Consulta rasterizada' if ident.startswith('energia') else 'Original','content':pages}
 (out/f'{ident}.json').write_text(json.dumps(doc,ensure_ascii=False));catalog.append({k:v for k,v in doc.items() if k!='content'});print(ident,len(pages),flush=True)
(out/'catalogo.json').write_text(json.dumps(catalog,ensure_ascii=False))
