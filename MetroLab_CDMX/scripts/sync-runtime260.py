# Fluidez 260: igual que sync-runtime181, con rutas relativas a MetroLab_CDMX dentro del repositorio compartido.
from pathlib import Path
import re,subprocess
R=Path(__file__).resolve().parents[1];D=R/'dist';changed={Path(p).name for p in subprocess.check_output(['git','diff','--relative','--name-only'],cwd=R,text=True).splitlines() if p.startswith('dist/') and p.endswith('.js')}
changed|={'frame-budget260.js','train-lod259.js','station-scene.js','instanced-passengers121.js','passenger-flow.js','tool-bag156.js','substation-carry188.js','instrument-placement180.js'}
changed|={'frame-budget260.js','train-lod259.js','station-scene.js','instanced-passengers121.js','passenger-flow.js','tool-bag156.js','substation-carry188.js','instrument-placement180.js'}
while True:
 more=set()
 for p in D.glob('*.js'):
  s=p.read_text();n=re.sub(r"(\./([^/'\"]+\.js))(?:\?v=\d+)?(?=['\"])",lambda m:m[1]+'?v=260' if m[2] in changed else m[0],s)
  if n!=s:p.write_text(n);more.add(p.name)
 if more<=changed:break
 changed|=more
p=D/'index.html';s=p.read_text();s=re.sub(r'(src="(?:\./)?([^/"?]+\.js))(?:\?v=\d+)?',lambda m:m[1]+'?v=260' if m[2]in changed else m[0],s);p.write_text(s)
print(len(changed),'updated modules')
