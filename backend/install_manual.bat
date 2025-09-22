@echo off
echo Instalacion Manual Paso a Paso
echo =================================

echo 1. Actualizando pip...
pip install --upgrade pip

echo.
echo 2. Instalando uvicorn...
pip install uvicorn==0.24.0

echo.
echo 3. Instalando fastapi...
pip install fastapi==0.104.1

echo.
echo 4. Instalando pandas...
pip install pandas==2.0.3

echo.
echo 5. Instalando openpyxl...
pip install openpyxl==3.1.2

echo.
echo 6. Instalando firebase-admin...
pip install firebase-admin==6.2.0

echo.
echo 7. Instalando pydantic...
pip install pydantic==2.4.2

echo.
echo 8. Instalando dependencias adicionales...
pip install python-multipart==0.0.6
pip install python-jose[cryptography]==3.3.0
pip install passlib[bcrypt]==1.7.4
pip install python-dotenv==1.0.0
pip install aiofiles==23.2.1

echo.
echo 9. Verificando instalacion...
python -c "import fastapi; print('✓ FastAPI OK')"
python -c "import uvicorn; print('✓ Uvicorn OK')"
python -c "import pandas; print('✓ Pandas OK')"
python -c "import firebase_admin; print('✓ Firebase Admin OK')"
python -c "import pydantic; print('✓ Pydantic OK')"
python -c "import openpyxl; print('✓ OpenPyXL OK')"

echo.
echo 10. Iniciando servidor...
python -m uvicorn app.main:app --reload --host 0.0.0.0 --port 8000

pause
