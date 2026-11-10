# Fluidez 256: igual que sync-runtime181, con rutas relativas a MetroLab_CDMX dentro del repositorio compartido.
from pathlib import Path
import re,subprocess
R=Path(__file__).resolve().parents[1];D=R/'dist';changed={Path(p).name for p in subprocess.check_output(['git','diff','--relative','--name-only'],cwd=R,text=True).splitlines() if p.startswith('dist/') and p.endswith('.js')}
changed|={Path(p).name for p in subprocess.check_output(['git','ls-files','--others','--exclude-standard','--','dist'],cwd=R,text=True).splitlines() if p.endswith('.js')}
changed|={'grid-substation256.js','rectifier-view126.js','rectifier-assets127.js'}
while True:
 more=set()
 for p in D.glob('*.js'):
  s=p.read_text();n=re.sub(r"(\./([^/'\"]+\.js))(?:\?v=\d+)?(?=['\"])",lambda m:m[1]+'?v=256' if m[2] in changed else m[0],s)
  if n!=s:p.write_text(n);more.add(p.name)
 if more<=changed:break
 changed|=more
p=D/'index.html';s=p.read_text();s=re.sub(r'(src="(?:\./)?([^/"?]+\.js))(?:\?v=\d+)?',lambda m:m[1]+'?v=256' if m[2]in changed else m[0],s);p.write_text(s)
print(len(changed),'updated modules')
