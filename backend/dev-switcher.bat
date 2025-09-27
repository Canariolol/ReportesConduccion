@echo off
echo ========================================
echo   Reportes de Conduccion - Dev Switcher
echo ========================================
echo.
echo 1. Desarrollo local tradicional (con recarga en caliente)
echo 2. Desarrollo con Docker (simula entorno de produccion)
echo 3. Salir
echo.
set /p choice="Seleccione una opcion (1-3): "

if "%choice%"=="1" goto dev_local
if "%choice%"=="2" goto dev_docker
if "%choice%"=="3" goto exit
echo Opcion invalida. Por favor seleccione 1, 2 o 3.
goto start

:dev_local
echo.
echo Iniciando desarrollo local tradicional...
echo.
echo Caracteristicas:
echo - Recarga en caliente (hot reload)
echo - Cambios se aplican instantaneamente
echo - Entorno de desarrollo rapido
echo.
echo Presione cualquier tecla para iniciar el servidor local...
pause > nul
call "%~dp0start.bat"
goto end

:dev_docker
echo.
echo Iniciando desarrollo con Docker...
echo.
echo Caracteristicas:
echo - Entorno identico a produccion
echo - Cambios requieren reconstruir imagen
echo - Ideal para pruebas finales
echo.
echo Deteniendo contenedores existentes...
docker stop backend-local 2>nul
docker rm backend-local 2>nul

echo Construyendo imagen Docker...
docker build -t reportes-conduccion-backend:local .

echo Iniciando contenedor Docker...
docker run -d -p 8000:8080 --name backend-local -v "%~dp0serviceAccount.json:/app/serviceAccount.json" reportes-conduccion-backend:local

echo Contenedor iniciado. Puede acceder al backend en http://localhost:8000
echo Para ver los logs: docker logs backend-local
echo Para detener el contenedor: docker stop backend-local
echo.
goto end

:exit
echo Saliendo...
goto end

:end
echo.
echo Presione cualquier tecla para cerrar...
pause > nul
