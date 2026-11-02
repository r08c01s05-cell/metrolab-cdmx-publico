from pathlib import Path
import argparse,json,hashlib
parser=argparse.ArgumentParser();parser.add_argument('output',type=Path);args=parser.parse_args()
base=Path(__file__).resolve().parents[1]/'assets-source/documentos89';args.output.mkdir(parents=True,exist_ok=True)
for doc in json.loads((base/'originales-partes.json').read_text()):
 data=b''.join((base/part).read_bytes() for part in doc['parts'])
 if hashlib.sha256(data).hexdigest()!=doc['sha256']:raise ValueError('Integridad incorrecta: '+doc['name'])
 (args.output/doc['name']).write_bytes(data)
 print('Verificado:',doc['name'])
