"""Refresh searchable text from the original supplied specification, preserving original PDF bytes."""
from pathlib import Path
import json,hashlib,gzip
from pypdf import PdfReader
ROOT=Path(__file__).resolve().parents[1];base=ROOT/'dist/documentacion/estudio89';path=base/'prescripciones-2020.pdf';reader=PdfReader(path)
doc={'id':'prescripciones2020','name':'Especificaciones de material rodante · proyecto Línea 1 · septiembre 2020','file':path.name,'pages':len(reader.pages),'sha256':hashlib.sha256(path.read_bytes()).hexdigest(),'copy':'Original aportado · requisitos de proyecto, no ficha as-built'}
(base/'prescripciones2020.json.gz').write_bytes(gzip.compress(json.dumps(dict(doc,content=[{'page':i+1,'text':page.extract_text(),'method':'Texto nativo · numeración del PDF'} for i,page in enumerate(reader.pages)]),ensure_ascii=False,separators=(',',':')).encode(),mtime=0))
path=base/'catalogo.json';catalog=json.loads(path.read_text());catalog=[d for d in catalog if d['id']!='prescripciones2020']+[doc];path.write_text(json.dumps(catalog,ensure_ascii=False,separators=(',',':')))
