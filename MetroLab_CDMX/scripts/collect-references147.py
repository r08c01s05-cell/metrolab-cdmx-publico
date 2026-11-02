from pathlib import Path
import json,shutil,hashlib
from PIL import Image
O=Path('assets-source/revision147')
U=Path('/workspace/scratch/fc8783fbaffa/upload')
refs=O/'referencias';refs.mkdir(exist_ok=True)
images=sorted(U.glob('image(20261019-*.png'))
videos=json.loads(Path('/tmp/metro147/videos.json').read_text())
files=[]
for p in images+[U/x['name']for x in videos]:
 shutil.copy2(p,refs/p.name)
 files.append({'name':p.name,'bytes':p.stat().st_size,'sha256':hashlib.sha256(p.read_bytes()).hexdigest()})
(O/'referencias147.json').write_text(json.dumps({'files':files,'videos':videos},ensure_ascii=False,indent=2))
D=Path('dist/docs/revision147');D.mkdir(exist_ok=True)
for p in (O/'vistas').glob('*.png'):
 Image.open(p).convert('RGB').save(D/(p.stem+'.jpg'),quality=82)
for i,p in enumerate(images):
 im=Image.open(p).convert('RGB');im.thumbnail((1000,800))
 im.save(D/('ref'+str(i)+'.jpg'),quality=82)
print('Originals retained:',len(files),'Render previews:',len(list(D.glob('*.jpg'))))
