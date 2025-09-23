# Usar una imagen base con herramientas de compilación incluidas
FROM python:3.13

# Establecer el directorio de trabajo
WORKDIR /app

# Copiar archivos de requisitos primero para aprovechar el caché de Docker
COPY requirements.txt .

# Instalar dependencias de Python con opciones para evitar compilación
RUN pip install --no-cache-dir --upgrade pip && \
    pip install --no-cache-dir \
    --prefer-binary \
    --only-binary :all: \
    -r requirements.txt

# Copiar el código de la aplicación
COPY . .

# Crear un usuario no root para seguridad
RUN useradd -m -u 1000 appuser && chown -R appuser:appuser /app
USER appuser

# Exponer el puerto que usa FastAPI (Cloud Run usa 8080)
EXPOSE 8080

# Comando para ejecutar la aplicación
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8080"]
