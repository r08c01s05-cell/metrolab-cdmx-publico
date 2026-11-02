from pathlib import Path
import zipfile,hashlib,json,fitz,subprocess,os,concurrent.futures
import argparse
parser=argparse.ArgumentParser();parser.add_argument("source",type=Path);parser.add_argument("output",type=Path);args=parser.parse_args();out=args.output;out.mkdir(parents=True,exist_ok=True);items={}
for archive in args.source.glob('*.zip'):
 with zipfile.ZipFile(archive) as z:
  for name in z.namelist():
   if not name.lower().endswith('.pdf'):continue
   b=z.read(name);sha=hashlib.sha256(b).hexdigest()
   if sha in items:continue
   (out/(sha+'.pdf')).write_bytes(b);items[sha]={'id':'via-'+sha[:12],'name':name,'archive':archive.name,'sha256':sha}
def read(item):
 sha,meta=item;pdf=fitz.open(out/(sha+'.pdf'));pages=[]
 for n,p in enumerate(pdf):
  text=p.get_text();method='Texto PDF'
  if len(text.strip())<80:
   pix=p.get_pixmap(dpi=105,colorspace=fitz.csGRAY);r=subprocess.run(['tesseract','stdin','stdout','-l','eng','--psm','6'],input=pix.tobytes('png'),stdout=subprocess.PIPE,stderr=subprocess.DEVNULL,env={**os.environ,'OMP_THREAD_LIMIT':'1'},check=True);text=r.stdout.decode();method='OCR automático sin corregir'
  pages.append({'page':n+1,'text':text,'method':method})
 meta.update(pages=len(pages),content=pages,file='',copy='Texto de consulta; original en ZIP '+meta['archive']);(out/(sha+'.json')).write_text(json.dumps(meta,ensure_ascii=False));return meta
with concurrent.futures.ThreadPoolExecutor(max_workers=6) as pool:
 result=[]
 for m in pool.map(read,items.items()):
  result.append(m)
  if len(result)%20==0:print(len(result),sum(x['pages'] for x in result),flush=True)
(out/'corpus.json').write_text(json.dumps(result,ensure_ascii=False));print('TOTAL',len(result),sum(x['pages'] for x in result),flush=True)
