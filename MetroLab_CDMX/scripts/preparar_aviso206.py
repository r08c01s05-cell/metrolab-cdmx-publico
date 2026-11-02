"""Aviso de cinco segundos audibles derivado de la grabación ya aportada."""
from pathlib import Path
import subprocess

root = Path(__file__).resolve().parents[1]
audio = root / 'dist/audio/cabina71'
subprocess.run([
    'ffmpeg', '-y', '-v', 'error', '-i', str(audio / 'aviso_cierre.mp3'),
    '-af', ('atrim=start=1.05:end=4.15,asetpts=PTS-STARTPTS,atempo=0.62,'
            'apad,atrim=duration=5,afade=t=in:d=0.018,'
            'afade=t=out:st=4.982:d=0.018'),
    '-ar', '44100', '-ac', '1', '-c:a', 'pcm_s16le',
    str(audio / 'aviso_cierre206.wav')
], check=True)
