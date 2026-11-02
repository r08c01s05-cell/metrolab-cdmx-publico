from pathlib import Path
import subprocess,json,io,wave,numpy as np
root=Path(__file__).resolve().parents[1];out=root/'dist/audio/cabina71';out.mkdir(exist_ok=True);source=root/'assets-source/audio/aviso_cierre_y_mensaje68.mp4'
def convert(source,dest,filter,start=None,duration=None):
 cmd=['ffmpeg','-y','-v','error']
 if start is not None:cmd+=['-ss',str(start)]
 cmd+=['-i',str(source)]
 if duration is not None:cmd+=['-t',str(duration)]
 cmd+=['-vn','-af',filter,'-ar','44100','-c:a','libmp3lame','-b:a','192k',str(dest)];subprocess.run(cmd,check=True)
voice='highpass=f=85,lowpass=f=7500,afftdn=nr=7:nf=-40,loudnorm=I=-18:TP=-2:LRA=11'
convert(source,out/'aviso_cierre.mp3','highpass=f=45,lowpass=f=9500,afftdn=nr=5:nf=-45,loudnorm=I=-19:TP=-2:LRA=11',0,5)
convert(source,out/'permita_cierre.mp3',voice,11.366667,3.4)
closing=json.loads((root/'dist/audio/cierre68/manifest.json').read_text())
for clip in closing['models'].values():clip['url']='audio/cabina71/aviso_cierre.mp3'
closing['manual_message']['url']='audio/cabina71/permita_cierre.mp3';closing['processing']='Filtrado moderado, reducción de ruido y nivelado; sin síntesis ni repetición.'
(out/'cierre_manifest.json').write_text(json.dumps(closing,ensure_ascii=False,indent=2))
station=json.loads((root/'dist/audio/revision30/manifest.json').read_text())
for id,clip in station['stations'].items():
 convert(root/'dist'/clip['url'],out/(id+'.mp3'),voice);clip['url']='audio/cabina71/'+id+'.mp3'
station['processing']='Filtrado moderado, reducción de ruido y nivelado de las grabaciones previas.'
(out/'estaciones_manifest.json').write_text(json.dumps(station,ensure_ascii=False,indent=2))
# Continuous recorded ambience, joined with a 350 ms crossfade rather than a click.
raw=subprocess.check_output(['ffmpeg','-v','error','-ss','46','-i',str(source),'-t','12','-vn','-af','highpass=f=35,lowpass=f=8000,afftdn=nr=5:nf=-45','-f','f32le','-ar','44100','-ac','2','pipe:1'])
s=np.frombuffer(raw,dtype='<f4').reshape(-1,2).copy();n=int(.35*44100);a=np.linspace(0,1,n)[:,None];s[-n:]=s[-n:]*(1-a)+s[:n]*a;s=s[n:];s*=.8/max(.001,np.abs(s).max());pcm=(np.clip(s,-1,1)*32767).astype('<i2')
with wave.open(str(out/'marcha_cabina.wav'),'wb') as w:w.setnchannels(2);w.setsampwidth(2);w.setframerate(44100);w.writeframes(pcm.tobytes())
(out/'marcha_manifest.json').write_text(json.dumps({'url':'audio/cabina71/marcha_cabina.wav','source':'assets-source/audio/aviso_cierre_y_mensaje68.mp4','start':46,'end':58,'duration':len(s)/44100,'scope':'Grabación de un tren pasando aportada por el usuario, adaptada a la cabina. No es una grabación específica dentro de NM-22/NM-79/MP-82.','loop_crossfade_seconds':.35},ensure_ascii=False,indent=2))
print(len(station['stations']),'anuncios, cierre, mensaje y marcha grabada procesados.')
