from pathlib import Path
import csv,hashlib,sys
root=Path(__file__).resolve().parent
errors=[]
with (root/'INVENTARIO.csv').open(encoding='utf-8',newline='') as f:
    rows=list(csv.DictReader(f))
for row in rows:
    p=root/row['ruta']
    if not p.is_file(): errors.append('FALTA '+row['ruta']);continue
    if p.stat().st_size!=int(row['bytes']) or hashlib.sha256(p.read_bytes()).hexdigest()!=row['sha256']: errors.append('DIFIERE '+row['ruta'])
print('\n'.join(errors) if errors else f'OK: {len(rows)} archivos originales verificados.')
sys.exit(bool(errors))
