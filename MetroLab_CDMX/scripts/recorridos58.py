"""Extrae las dos polilíneas del eje de cada PDF CAD; usa su línea central.
Excluye cotas, leyendas, marcos y texto convertido a geometría SHX.
"""
from pathlib import Path
import fitz,json,numpy as np,shutil
ROOT=Path(__file__).resolve().parents[1];D=ROOT/'dist';SOURCE=Path('/workspace/scratch/fc8783fbaffa/upload')
def extract(pdf,line,n):
 page=fitz.open(pdf)[0];candidates=[]
 for drawing in page.get_drawings():
  c=drawing.get('color')
  if not c:continue
  isroute=(c[0]>.7 and c[0]<.8 and c[1]<.1 and c[2]>.9)if line==1 else(c[0]<.1 and c[1]>.9 and c[2]<.1)
  if not isroute:continue
  items=drawing['items']
  if len(items)!=n-1 or not all(i[0]=='l'for i in items):continue
  assert all(abs(items[i][2]-items[i+1][1])<.1 for i in range(len(items)-1))
  candidates.append(np.array([tuple(items[0][1]),*[tuple(i[2])for i in items]]))
 assert len(candidates)==2,(line,len(candidates))
 assert np.max(np.linalg.norm(candidates[0]-candidates[1],axis=1))<1.5
 centers=(candidates[0]+candidates[1])/2
 low=centers.min(0);high=centers.max(0)
 if line==1:
  scale=min(940/(high[0]-low[0]),265/(high[1]-low[1]));offset=np.array([80,140])
 else:
  scale=min(680/(high[0]-low[0]),820/(high[1]-low[1]));offset=np.array([150,105])
 points=(centers-low)*scale+offset
 return {'type':'trazado_vectorial_pdf_aportado_no_georreferenciado','source':pdf.name,'width':1100,'height':610 if line==1 else 1100,'native_canvas':True,'stations':{f'L{line}-{i:02}':[round(float(x),4),round(float(y),4)]for i,(x,y)in enumerate(points,1)},'pdf_station_centers':centers.tolist(),'note':'Eje obtenido promediando los dos bordes del trazado CAD. Se conserva forma, proporción y orden de estaciones. Sin tablas, cotas, rótulo o imagen de fondo. Las posiciones de tren se interpolan con las distancias del motor existente.'}
def main():
 out=ROOT/'assets-source/recorridos58';out.mkdir(exist_ok=True,parents=True)
 for line,n in [(1,20),(8,19)]:
  p=SOURCE/f'Linea{line}_AutoCAD-Layout1.pdf';shutil.copyfile(p,out/p.name)
  r=extract(p,line,n);(D/f'recorrido_L{line}.json').write_text(json.dumps(r,ensure_ascii=False,indent=2)+'\n');print('Línea',line,len(r['stations']),'centros extraídos')
if __name__=='__main__':main()
