#!/usr/bin/env bash
set -euo pipefail

# Ejecutado sólo para pushes a ramas de trabajo del propio repositorio.
revision="${METROLAB_SOURCE_SHA:?Falta la revisión verificada}"
[[ "$revision" =~ ^[0-9a-f]{40}$ ]] || { echo 'Revisión inválida'; exit 1; }
[[ -z "$(git status --porcelain)" ]] || { echo 'Hay cambios locales pendientes'; exit 1; }
git fetch origin main "$revision"
git config user.name 'github-actions[bot]'
git config user.email '41898282+github-actions[bot]@users.noreply.github.com'
git switch --detach origin/main
if git merge-base --is-ancestor "$revision" HEAD; then
  echo 'La revisión ya está integrada.'
  exit 0
fi
git merge --no-ff "$revision" -m "Integrar revisión verificada ${revision:0:7}"
# Validar la combinación real con el trabajo más reciente del colaborador.
git diff --check HEAD^ HEAD
(cd MetroLab_CDMX && node scripts/verificar_colaboracion.mjs)
# Si main avanza durante las pruebas, Git rechaza el push; nunca sobrescribirlo.
git push origin HEAD:refs/heads/main
echo 'Cambios verificados e integrados en main.'
