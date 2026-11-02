from pathlib import Path
import bpy
R=Path(__file__).resolve().parents[1];O=R/'assets-source/revision140'
for stem in ['NM79_cabina','NM79_intermedio','MP82_cabina','MP82_intermedio']:
 bpy.ops.wm.read_factory_settings(use_empty=True);bpy.ops.import_scene.gltf(filepath=str(O/(stem+'.glb')));bpy.context.scene.unit_settings.system='METRIC';bpy.ops.wm.save_as_mainfile(filepath=str(O/(stem+'.blend')),compress=True);print('EDITABLE140',stem,flush=True)
