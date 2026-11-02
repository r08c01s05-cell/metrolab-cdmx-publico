# v135 · Inspección y trabajo sobre la subestación

- Los siete grupos de puerta del GLB nativo de Blender conservan su bisagra y geometría. Inician cerrados; un clic sobre la hoja o sobre su botón abre o cierra únicamente ese gabinete. El mando general actúa sobre los siete. Se interpolan entre 0 y 105 grados, sin ocultar hojas.
- La lista individual aproxima la cámara al conjunto elegido. La puerta bajo el cursor tiene marco y leyenda contextual. Se conserva PAN, zoom, entrada y vista general.
- En el mantenimiento de la subestación: HUD con objetivo, progreso y enfoque de pieza (F), selección de misiones y botones de ayuda plegables. La herramienta automática puede desactivarse.
- Mouse: mantener pulsado trabaja una fijación; arrastrar cepilla la pieza bajo el puntero. Un clic breve sigue siendo alternativa. Cada gesto confirma como máximo una acción; las pasadas repetidas requieren gestos sucesivos. La mano con guante sigue el contacto 3D obtenido del rayo al cepillar.
- Captura exclusiva del puntero sobre una pieza válida; controles de cámara restaurados al soltar, cancelar, cambiar práctica, cerrar, perder foco o cambiar de pestaña. El progreso por frame está limitado para que un frame suspendido no termine el trabajo.
- Las puntas de los tres bancos técnicos se interpolan hacia el contacto y regresan a su alojamiento; se actualizan los cables. Las cuatro fijaciones del filtro también se desplazan axialmente al aflojar/apretar.

Verificación: siete bisagras reales, selección por rayo, callback de mouse + HUD, herramientas automáticas, mantenimiento aislado, cancelación y ausencia de doble avance; seis misiones completas y retirada/reconexión de puntas; cuatro actividades existentes de tren; guante real; cámaras y grafo de imports sin versiones duplicadas. No se dispone de control-browser para QA visual WebGL/FPS: no se ha validado el aspecto en pantalla ni el rendimiento en el equipo del usuario.

Los cambios de esta revisión afectan la inspección y las prácticas de subestación. Se reutilizan los GLB y materiales existentes; no se afirma haber remodelado todos los trenes o estaciones ni disponer de un gemelo constructivo certificado.
