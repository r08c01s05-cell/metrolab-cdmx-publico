# Trabajar juntos en MetroLab

El repositorio compartido es https://github.com/r08c01s05-cell/metrolab-cdmx.
Cada persona usa su propia cuenta y su propia copia local o Codespace.

## Ramas y revisión

- `main`: versión compartida que se considera estable.
- `mejora/trenes`, `mejora/subestacion`: ejemplos de ramas para trabajos diferentes.
- `correccion/puertas`: ejemplo de rama para una corrección concreta.

No son carpetas ni aplicaciones separadas. Al cambiar de rama cambian los archivos
de tu copia del proyecto. Cada colaborador debe tener su propia copia local o Codespace.
La rama contiene todo el simulador y se puede ejecutar antes de integrarla.

### Flujo en GitHub Desktop

1. Selecciona `main` y pulsa Fetch origin / Pull para traer lo nuevo.
2. Current branch → New branch. Crea una rama para la tarea, por ejemplo
   `mejora/subestacion`. Evita mezclar varios objetivos sin relación.
3. Abre la carpeta en VS Code, edita y ejecuta el simulador localmente.
4. Revisa los archivos cambiados, haz un commit descriptivo y pulsa Publish branch
   o Push origin. Esto guarda tu rama; todavía no la incorpora a `main`.
5. Al publicar una rama `mejora/`, `correccion/`, `feat/`, `fix/` o `chore/`,
   GitHub Actions ejecuta las verificaciones. Puedes abrir un Pull Request para
   documentar el trabajo, pero no se necesita una confirmación adicional.
6. Si pasan las pruebas, Actions combina la revisión con el último `main`, vuelve
   a verificar la combinación y la integra automáticamente. Un conflicto, una
   prueba fallida o un avance concurrente de `main` detiene la integración sin
   sobrescribir archivos. Corrige el problema y vuelve a publicar la rama; si sólo
   avanzó `main`, también puedes volver a ejecutar el workflow de ese push.
7. Ambos actualizan `main` antes de empezar otra tarea.

Las Pull Requests ejecutan `Verificaciones del simulador`. Configurar su obligatoriedad
y la protección de `main` requiere hacerlo en GitHub y puede depender del plan
para repositorios privados. La integración automática respeta esas reglas y necesita
GitHub Actions habilitado con permiso de escritura del token en contenidos. No
requiere guardar tokens personales. Los pushes hechos por el token de Actions no
disparan otro workflow: por eso se prueba la combinación antes de publicarla.
Los eventos de Pull Request sólo verifican; no reciben permiso de escritura.

## Editar y ejecutar

La fuente activa está en `MetroLab_CDMX/dist/`. No se debe borrar como si fuera
una carpeta de compilación. Lee `MetroLab_CDMX/AGENTS.md` y `CONTEXTO_CODEX.md`.

Desde `MetroLab_CDMX`, con Python 3.10 o superior:

```sh
python iniciar_simulador.py
```

También puedes abrir `INICIAR_SIMULADOR.bat`. Cada computadora necesita sus
propias herramientas. La dirección 127.0.0.1 sólo funciona en esa computadora.
No hace falta npm install para ejecutar el simulador.

Para verificar, con Node.js moderno:

```sh
node scripts/verificar_colaboracion.mjs
```

En Windows se omite únicamente la prueba Linux del servicio de Codespaces;
esa prueba sí se ejecuta en GitHub Actions. Las demás pruebas son CPU/DOM/geometría
y no sustituyen la revisión visual de las escenas con WebGL.

El ZIP no incluye el historial del repositorio anterior. La prueba histórica
`verificar_frente198.mjs` compara con un commit de aquel historial y se conserva
para consulta. En el repositorio nuevo se usa `verificar_frente_colaboracion.mjs`,
que comprueba la geometría frontal actual y ambos extremos del convoy. No certifica
la igualdad con el binario histórico que no está disponible.

## Modelos y conflictos

Git puede combinar muchos cambios de texto, pero si ambos editan las mismas líneas
puede pedir resolver un conflicto. Los GLB, Blender, imágenes y audio no se fusionan
como texto: repártanse esos archivos para evitar sobrescribir trabajo.
No se configura Git LFS automáticamente: la copia actual no tiene archivos de más
de 50 MB. Revisen el tamaño y la estrategia antes de añadir modelos grandes.

## Publicación

La validación de ramas está separada del despliegue. El flujo existente de GitHub
Pages conserva sus pruebas, pero se ejecuta sólo manualmente desde Actions.
Publicar una web requiere configurar el alojamiento y decidir su audiencia;
tener un repositorio privado no implica que la web publicada también lo sea.

No agregues claves, tokens, `.env`, registros locales ni ZIP de entregas al repositorio.
Mantén licencias y no asumas que el ZIP original transfiere permisos adicionales.

