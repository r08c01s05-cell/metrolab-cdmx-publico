"""Shared, animation-aware GLB graft/compaction utilities extracted from revision 140.
Load definitions only, never execute the historical integration/build pipeline.
"""
import ast
from pathlib import Path
_source=Path(__file__).with_name('integrate-trains140.py')
_tree=ast.parse(_source.read_text())
_definitions=ast.Module(body=[n for n in _tree.body if isinstance(n,(ast.Import,ast.ImportFrom,ast.FunctionDef))],type_ignores=[])
exec(compile(_definitions,str(_source),'exec'),globals())
