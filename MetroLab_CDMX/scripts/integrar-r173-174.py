from pathlib import Path
import shutil,subprocess,re,json,gzip
R=Path(__file__).resolve().parents[1];Z=R.parent/'review173/MetroLab_Desarrollo_R173_2026-10-24';B=Z/'Metro_CDMX_v134_VSCode/Metro_CDMX_v134/dist';D=R/'dist'
# Preserve interrupted transfer duplicates outside the source tree.
for rel in subprocess.check_output(['git','ls-files','--others','--exclude-standard'],cwd=R,text=True).splitlines():
 p=R/rel
 if p.name.startswith('.')and any(q in p.name for q in ['.glb.','.glb.gz.','.blend.','.pdf.']):
  target=R.parent/'recovered-transfers174'/rel;target.parent.mkdir(parents=True,exist_ok=True);shutil.move(p,target)
modules=['electrical171.js','cable173.js','pdf173.js','installation173.js','installation173.css','substation-cad168.js','presentation171.css','fixed-clock170.js','exhibition171.js','explosion172.js','geometry-audit171.js','platform-collision169.js','platform-finish160.js']
for n in modules:shutil.copy2(B/n,D/n)
# Only CAD styles; retain the existing SR exploration and maintenance layouts.
s=(B/'substation168.css').read_text();start=s.index('.cad168{');css=s[start:];(D/'cad174.css').write_text(css)
# Documents remain local; gzip avoids duplicating six MB in the static budget.
folder=D/'normativa';folder.mkdir(exist_ok=True);pdf=(B/'normativa/NOM-001-SEDE-2012.pdf').read_bytes();(folder/'NOM-001-SEDE-2012.pdf.gz').write_bytes(gzip.compress(pdf,9,mtime=0));shutil.copy2(B/'normativa/criterios173.html',folder/'criterios173.html')
for p in [D/'cable173.js',D/'electrical171.js',D/'substation-cad168.js',folder/'criterios173.html']:
 s=p.read_text().replace('NOM-001-SEDE-2012.pdf','NOM-001-SEDE-2012.pdf.gz');p.write_text(s)
p=folder/'criterios173.html';p.write_text(p.read_text().replace('</body>','<script type="module" src="../local-doc174.js?v=174"></script></body>'))
# CAD adapter: existing cabinets, physical bag, mounted practice scenes and pause remain intact.
p=D/'substation-cad168.js';s=p.read_text().replace("import{references171}","import './local-doc174.js?v=174';\nimport{references171}")
s=s.replace("view.setExplosion140(0);", "view.home();")
s=s.replace("view.service128?.hand134?.hide();view.stop();", "view.service128?.play135?.bag156?.close();view.stop();")
s=s.replace("const d=view.dialog,button=", "const d=view.dialog,button=")
s=s.replace("const d=view.dialog,button=document.createElement('button');", "if(view.cad174)return view.cad174;const d=view.dialog,button=document.createElement('button');")
s=s.replace("d.addEventListener('close',()=>", "d.addEventListener('close',()=>")
s=s.replace("return{close};", "view.cad174={close,overlay,button,installation};return view.cad174;")
p.write_text(s)
p=D/'rectifier-view126.js';s=p.read_text();s="import {installCad168} from './substation-cad168.js?v=174';\n"+s;s=s.replace('this.home();this.cabinets135.setAll(false);','this.home();this.cabinets135.setAll(false);installCad168(this);');p.write_text(s)
p=D/'index.html';s=p.read_text().replace('</head>','<link rel="stylesheet" href="cad174.css?v=174"><link rel="stylesheet" href="presentation171.css?v=174"><link rel="stylesheet" href="installation173.css?v=174"></head>');s=s.replace('<script src="app.js', '<script src="fixed-clock170.js?v=174" defer></script><script src="app.js');p.write_text(s)
# Fixed domain clock from R173, retaining the current resource-ready gate.
p=D/'app.js';s=p.read_text();z=(B/'app.js').read_text();clock=z[z.index('const fixedClock170='):];clock=clock.replace("running&&engine&&!document.hidden&&document.body.dataset.pause105!=='true'", "running&&engine&&!document.hidden&&document.body.dataset.pause105!=='true'&&document.body.dataset.loading142!=='true'")
s=s[:s.index('function loop(now)')]+clock;p.write_text(s)
# Keep user-selected DPR/quality, adopt the strict frame cap without automatic blur on stalls.
p=D/'render-budget101.js';p.write_text('''import{visualState105}from'./visual-settings105.js?v=105';
export class RenderBudget101{
 constructor(renderer,{fps=60,maxDpr=Infinity}={}){this.maxDpr=maxDpr;this.baseFps=Math.min(60,Math.max(1,fps));this.fps=this.baseFps;this.renderer=renderer;this.prefRevision105=-1;this.ratio=Math.min(globalThis.devicePixelRatio||1,maxDpr);this.last=null;this.reduced=false;this.metrics171={frames:0,lastIntervalMs:0};renderer.setPixelRatio(this.ratio);}
 allows(now){const pref=visualState105();if(pref.revision!==this.prefRevision105){this.prefRevision105=pref.revision;this.fps=Math.min(this.baseFps,pref.profile.fps,60);this.ratio=Math.min(globalThis.devicePixelRatio||1,this.maxDpr,pref.profile.dpr);this.renderer.setPixelRatio(this.ratio);this.baseExposure105??=this.renderer.toneMappingExposure??1;this.renderer.toneMappingExposure=this.baseExposure105*pref.exposure;}if(this.last!==null&&now-this.last<1000/this.fps-1e-7)return false;this.metrics171.lastIntervalMs=this.last===null?0:now-this.last;this.last=now;this.metrics171.frames++;return true;}
}
export function freezeStatic101(root){root.updateMatrixWorld(true);root.traverse(o=>{o.updateMatrix();o.matrixAutoUpdate=false;o.matrixWorldAutoUpdate=false;});}
''')
# Exhibition methods imported individually; retain readiness, cab display and maintenance integration.
p=D/'workshop.js';s=p.read_text();z=(B/'workshop.js').read_text();s="import{prepareExplosion172,visible172}from'./explosion172.js?v=174';\nimport{auditInspection171}from'./geometry-audit171.js?v=174';\nimport{exhibition166}from'./exhibition171.js?v=174';\n"+s
for name in ['resize','home','setModel','explode','focus','pickWorkshop']:
 pattern=r'\n '+name+r'\([^\n]*';old=re.search(pattern,s);new=re.search(pattern,z)
 assert old and new,name
 s=s[:old.start()]+new[0]+s[old.end():]
s=s.replace('this.updateMaintenanceTest();','this.updateMaintenanceTest();this.exhibition166?.tick(now);')
# The actual frame uses a different test call in some source revisions.
if 'this.exhibition166?.tick(now)'not in s:s=s.replace('this.renderer.render(this.scene,this.camera);','this.exhibition166?.tick(now);this.renderer.render(this.scene,this.camera);',1)
# Adopt camera presets, preserving selectModel's resource gate.
a=s.index('view(id){',s.index('window.workshopGame='));b=s.index('view(id){',z.index('window.workshopGame='));s=s[:a]+z[b:];p.write_text(s)
# Add only the station finishing/collision hooks; preserve physical cab, FOV and readiness.
p=D/'station-scene.js';s=p.read_text();s="import{platformSolids169,clampPlatformCamera169,constrainPlatformActors169}from'./platform-collision169.js?v=174';\nimport{finishPlatforms160}from'./platform-finish160.js?v=174';\n"+s
s=s.replace('const displays=prepareArrivalDisplays(g.scene);', 'finishPlatforms160(g.scene,this.renderer.capabilities.getMaxAnisotropy());p.userData.solids169=platformSolids169(g.scene);const displays=prepareArrivalDisplays(g.scene);')
s=s.replace('this.cabinCharacters.update(actors,this.personMotionTime,state.running)','this.cabinCharacters.update(constrainPlatformActors169(actors,center,this.stationCache.get(idx)?.userData.solids169||[]),this.personMotionTime,state.running)')
s=s.replace('this.cameraMode=mode;',"this.cameraMode=mode;this.previousPlatform169=null;if(mode==='platform')this.platformSide169=-1;")
s=s.replace('this.controls.update();this.clampDriver();','this.controls.update();clampPlatformCamera169(this);this.clampDriver();')
p.write_text(s)
# Preserve supplied provenance, original hourly demand, sounds and all current GLB assets.
O=R/'assets-source/integracion174';O.mkdir(exist_ok=True);shutil.copy2(R.parent/'comparison174.json',O/'comparacion-r173.json')
