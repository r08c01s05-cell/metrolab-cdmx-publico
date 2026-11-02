"""Preserve complete integrated models as editable native Blender scenes."""
from pathlib import Path
import bpy
R=Path(__file__).resolve().parents[1];O=R/'assets-source/revision141'
for stem in ['NM79_cabina','NM79_intermedio','MP82_cabina','MP82_intermedio','Garibaldi_Lagunilla141']:
 bpy.ops.wm.read_factory_settings(use_empty=True);bpy.ops.import_scene.gltf(filepath=str(O/(stem+'.glb')));bpy.context.scene.unit_settings.system='METRIC';bpy.ops.wm.save_as_mainfile(filepath=str(O/(stem+'.blend')),compress=True);print('EDITABLE141',stem,flush=True)
