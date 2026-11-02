# Revisión 198 · frente MP-82

En la selección de flota el MP-82 mostraba un hueco abierto en el extremo del conductor. El GLB carecía del cierre exterior en +X: girarlo mostraba el testero del otro extremo, por lo que esa alternativa no se incorporó.

Se añade al propio GLB el panel inferior, la banda superior, los montantes, dos paños transparentes de parabrisas con partelunas, juntas, ópticas y rejillas. Es una adaptación visual ajustada al marco del modelo existente; no corresponde a planos ni dimensiones verificadas del fabricante. La corrección del archivo sirve a flota, inspección, tren instalado y circulación, sin una máscara de interfaz sobre la vista.

Se conservan todas las mallas, nodos, materiales, animaciones y bytes de geometría/texturas anteriores. Los elementos nuevos tienen familia exterior, para que funcionen los controles de despiece y la ocultación temporal de la cabina en conducción. Las URL de carga del modelo y sus consumidores afectados se actualizan a 198 para evitar recuperar la versión incompleta de caché.

`python3 scripts/reparar_frente198.py` reproduce la adición y no modifica de nuevo un archivo ya reparado. `scripts/verificar_frente198.mjs` comprueba la conservación de datos y las intersecciones de los parabrisas en ambos extremos de la formación de flota. Se revisó el resultado con un render WebGL por software antes y después; no es una medición de FPS en la máquina del alumno.
