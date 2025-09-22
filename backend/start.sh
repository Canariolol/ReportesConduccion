#!/bin/bash

echo "Limpiando instalacion previa..."
pip cache purge

echo ""
echo "Instalando dependencias del backend..."
pip install --upgrade pip
pip install -r requirements.txt --no-cache-dir

echo ""
echo "Verificando instalacion..."
python -c "import fastapi; print('FastAPI OK')"
python -c "import uvicorn; print('Uvicorn OK')"
python -c "import pandas; print('Pandas OK')"
python -c "import firebase_admin; print('Firebase Admin OK')"

echo ""
echo "Iniciando servidor backend..."
python -m uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
