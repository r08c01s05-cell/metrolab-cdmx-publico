"""Restore station GLBs for legacy modelling scripts, or package them losslessly."""
from pathlib import Path
import argparse,gzip,hashlib,json,shutil
parser=argparse.ArgumentParser();parser.add_argument('--restore',action='store_true');args=parser.parse_args()
root=Path(__file__).resolve().parents[1];dist=root/'dist';models=dist/'models/andenes';source=root/'assets-source/andenes89'
if args.restore:
 for p in source.rglob('*.glb'):
  target=models/p.relative_to(source);target.parent.mkdir(parents=True,exist_ok=True);shutil.copyfile(p,target)
 print('GLB editables restaurados. Tras editar, ejecuta este script sin --restore antes de publicar.')
else:
 for p in models.rglob('*.glb'):
  target=source/p.relative_to(models);target.parent.mkdir(parents=True,exist_ok=True);shutil.copyfile(p,target);p.unlink()
 manifest=[]
 for p in source.rglob('*.glb'):
  b=p.read_bytes();target=models/p.relative_to(source);target.parent.mkdir(parents=True,exist_ok=True);target.with_suffix('.glb.gz').write_bytes(gzip.compress(b,compresslevel=9,mtime=0));manifest.append({'file':str(target.relative_to(dist)),'sha256':hashlib.sha256(b).hexdigest(),'bytes':len(b)})
 (dist/'documentacion/andenes-compresion89.json').write_text(json.dumps(manifest))
 print(len(manifest),'andenes comprimidos sin pérdida.')
