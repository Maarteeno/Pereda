@echo off
cd /d "%~dp0"
echo.
echo === Publicar en GitHub Pages (Maarteeno/Pereda) ===
echo.
echo 1. Autenticarse (solo la primera vez):
echo    gh auth login
echo.
echo 2. Subir cambios:
echo    git push -u origin main
echo.
echo 3. Activar GitHub Pages (solo la primera vez):
echo    gh api repos/Maarteeno/Pereda/pages -X POST -f build_type=legacy -f source[branch]=main -f source[path]=/
echo.
echo URL final: https://maarteeno.github.io/Pereda/
echo.
pause
