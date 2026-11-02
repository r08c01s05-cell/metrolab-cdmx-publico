@echo off
setlocal
title MetroLab CDMX - Simulador
py -3 -c "import sys; sys.exit(sys.version_info < (3,10))" >nul 2>&1
if not errorlevel 1 (
    py -3 "%~dp0iniciar_simulador.py"
    goto fin
)
python -c "import sys; sys.exit(sys.version_info < (3,10))" >nul 2>&1
if not errorlevel 1 (
    python "%~dp0iniciar_simulador.py"
    goto fin
)
echo Este programa necesita Python 3.10 o superior instalado.
echo Instala Python desde su sitio oficial y vuelve a abrir este archivo.
:fin
echo.
echo El simulador se ha cerrado.
pause
endlocal
