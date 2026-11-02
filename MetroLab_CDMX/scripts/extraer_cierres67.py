from pathlib import Path
import subprocess,json
root=Path(__file__).resolve().parents[1];source=root/'assets-source/audio/cierres_trenes_referencia.mp4';out=root/'dist/audio/cierre67';out.mkdir(exist_ok=True)
manifest=json.loads((root/'dist/audio/cierre38/manifest.json').read_text())
for model,clip in manifest['models'].items():
 clip['url']=clip['url'].replace('cierre38','cierre67');clip['duration']=5;clip['end']=round(clip['start']+5,2)
 subprocess.run(['ffmpeg','-y','-v','error','-ss',str(clip['start']),'-i',str(source),'-t','5','-vn','-ar','44100','-c:a','libmp3lame','-q:a','2',str(root/'dist'/clip['url'])],check=True)
manifest['method']='Fragmentos continuos de cinco segundos de la grabación aportada; sin repetición ni síntesis.'
(out/'manifest.json').write_text(json.dumps(manifest,ensure_ascii=False,indent=2))
