from pathlib import Path
import re,subprocess
R=Path(__file__).resolve().parents[1];D=R/'dist';changed={Path(p).name for p in subprocess.check_output(['git','diff','--name-only'],cwd=R,text=True).splitlines() if p.startswith('dist/') and p.endswith('.js')};changed|={p.name for p in D.glob('*149.js')}
changed|={Path(p).name for p in subprocess.check_output(['git','ls-files','--others','--exclude-standard','dist'],cwd=R,text=True).splitlines() if p.endswith('.js')}
while True:
 more=set()
 for p in D.glob('*.js'):
  s=p.read_text();n=re.sub(r"(\./([^/'\"]+\.js))(?:\?v=\d+)?(?=['\"])",lambda m:m[1]+'?v=149' if m[2] in changed else m[0],s)
  if n!=s:p.write_text(n);more.add(p.name)
 if more<=changed:break
 changed|=more
p=D/'index.html';s=p.read_text();s=re.sub(r'(src="(?:\./)?([^/"?]+\.js))(?:\?v=\d+)?',lambda m:m[1]+'?v=149' if m[2]in changed else m[0],s);p.write_text(s)
print(len(changed),'updated modules')
