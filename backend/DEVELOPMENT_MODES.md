# Modos de Desarrollo del Backend

Este proyecto soporta dos modos de desarrollo local, cada uno con ventajas específicas.

## Opción 1: Desarrollo Local Tradicional (Recomendado para desarrollo diario)

### Características:
- ✅ Recarga en caliente (hot reload) instantánea
- ✅ Cambios se aplican sin reconstruir
- ✅ Desarrollo rápido y ágil
- ✅ Ideal para desarrollo diario y depuración

### Cómo usar:
```bash
# Usando el script switcher
cd backend
.\dev-switcher.bat
# Seleccionar opción 1

# O directamente
cd backend
.\start.bat
```

### Puerto: `http://localhost:8000`

---

## Opción 2: Desarrollo con Docker (Recomendado para pruebas finales)

### Características:
- ✅ Entorno idéntico a producción
- ✅ Mismas dependencias y configuración
- ✅ Detecta problemas de entorno temprano
- ✅ Ideal para pruebas finales antes de despliegue

### Requisitos:
- Docker Desktop instalado
- Archivo `serviceAccount.json` en el directorio `backend`

### Cómo usar:
```bash
# Usando el script switcher
cd backend
.\dev-switcher.bat
# Seleccionar opción 2

# O manualmente
cd backend
docker build -t reportes-conduccion-backend:local .
docker run -d -p 8000:8080 --name backend-local -v "%cd%/serviceAccount.json:/app/serviceAccount.json" reportes-conduccion-backend:local
```

### Comandos útiles:
```bash
# Ver logs del contenedor
docker logs backend-local

# Detener contenedor
docker stop backend-local

# Eliminar contenedor
docker rm backend-local
```

### Puerto: `http://localhost:8000`

---

## Cambio entre modos

### Usando el script switcher (recomendado):
```bash
cd backend
.\dev-switcher.bat
```

El script te mostrará un menú interactivo para seleccionar el modo deseado.

### Manualmente:
1. **Detener cualquier servidor existente**:
   - Para modo local: `Ctrl+C` en la terminal
   - Para modo Docker: `docker stop backend-local`

2. **Iniciar el modo deseado** siguiendo las instrucciones anteriores

---

## Importante

### 🔒 Seguridad:
- El archivo `serviceAccount.json` está excluido del despliegue a través de `.dockerignore`
- En modo Docker, el archivo se monta como volumen y no se incluye en la imagen
- Esto garantiza que las credenciales no se suban a los registros de contenedores

### 🚀 Despliegue a Cloud Run:
- **Ninguno de estos modos afecta el despliegue a Cloud Run**
- La configuración de producción permanece intacta
- El proceso de despliegue con `gcloud builds submit` sigue funcionando igual

### 📁 Archivos clave:
- `firebase.py`: Código corregido para leer `project_id` del `serviceAccount.json`
- `start.bat`: Script para desarrollo local tradicional
- `dev-switcher.bat`: Script para cambiar entre modos
- `Dockerfile`: Configuración para construir la imagen (no modificada)
- `.dockerignore`: Excluye `serviceAccount.json` del despliegue (no modificado)

---

## Flujo de trabajo recomendado

### Para desarrollo diario:
1. Usar **Modo 1: Desarrollo Local Tradicional**
2. Hacer cambios y verlos aplicarse instantáneamente
3. Probar funcionalidades rápidamente

### Para pruebas finales antes de despliegue:
1. Usar **Modo 2: Desarrollo con Docker**
2. Verificar que todo funciona en entorno idéntico a producción
3. Si todo funciona correctamente, proceder con despliegue a Cloud Run

### Para despliegue a producción:
```bash
gcloud builds submit --tag gcr.io/west-reportes-conduccion/reportes-conduccion-backend:latest .
gcloud run deploy reportes-conduccion-backend-v2 --image gcr.io/west-reportes-conduccion/reportes-conduccion-backend:latest --platform managed --region us-central1 --allow-unauthenticated
