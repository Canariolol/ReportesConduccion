# Resumen de Cambios y Solución de Despliegue

Este documento resume el proceso de depuración y la solución final implementada para desplegar el backend en Google Cloud Run de forma automática y segura.

---

## 1. Problema Inicial

El despliegue inicial fallaba debido a una serie de errores de configuración complejos:
*   Errores de credenciales de Firebase (`missing fields client_email`, `Unable to load PEM file`, etc.) al intentar desplegar en Cloud Run.
*   Conflictos entre la configuración local (usando archivos `.env`) y la configuración de producción.
*   Inconsistencias en el proceso de despliegue manual que causaban que se desplegaran versiones de código o configuraciones antiguas, a pesar de los cambios locales.

---

## 2. Proceso de Depuración (Resumen)

Para llegar a la solución, pasamos por varios pasos:
1.  Se corrigieron los comandos de Docker para el entorno local.
2.  Se intentó alinear la configuración de despliegue (`cloudbuild.yaml`) con el código, primero montando secretos como archivos y variables de entorno.
3.  Se detectó que las configuraciones antiguas quedaban "atascadas" en el servicio de Cloud Run, lo que impedía las actualizaciones.
4.  Se concluyó que la estrategia de reconstruir la credencial a partir de múltiples secretos era frágil y causaba errores de formato.

---

## 3. Solución Final Implementada

La solución final se basa en simplificar y centralizar la gestión de la configuración, siguiendo las mejores prácticas de Google Cloud.

### Arquitectura de Configuración

Se adoptó un enfoque de "fuente única de verdad" para las credenciales y la configuración sensible.

*   **En Cloud Run (Producción):** La aplicación ya no depende de archivos montados ni de variables de entorno para las credenciales. Al arrancar, se conecta directamente a la **API de Secret Manager** y lee los secretos que necesita.
*   **En Local (Desarrollo):** Para simplificar, la aplicación ahora lee directamente el archivo `serviceAccount.json` local, eliminando la necesidad de un archivo `.env` con múltiples variables.

### Secretos Requeridos

El sistema ahora depende únicamente de **dos secretos** en Google Secret Manager:

1.  `firebase-service-account`:
    *   **Contenido:** El JSON **completo** del archivo `serviceAccount.json`.
    *   **Propósito:** Provee todas las credenciales de Firebase en un solo lugar, eliminando errores de formato.

2.  `cors-origins`:
    *   **Contenido:** Un string en formato JSON con la lista de dominios permitidos (ej: `["https://mi-dominio.com"]`).
    *   **Propósito:** Configura los permisos de CORS para el backend.

### Código (`firebase.py`)

El archivo fue refactorizado para implementar la lógica descrita. Ahora detecta si se está ejecutando en Cloud Run y, en ese caso, llama a la API de Secret Manager. Si no, busca el archivo `serviceAccount.json` local.

### Despliegue Automatizado (`cloudbuild.yaml`)

Se creó un archivo `cloudbuild-force.yaml` que automatiza todo el proceso. Este archivo le dice a Google Cloud Build cómo:
1.  Construir la imagen de Docker.
2.  Subirla a Google Container Registry.
3.  Desplegar la nueva imagen en Cloud Run de forma simple y limpia.

---

## 4. Comando Final de Despliegue

Gracias a la automatización con Cloud Build, todo el proceso de despliegue para futuras actualizaciones se ha reducido a **un solo comando**, que debe ser ejecutado desde la carpeta `backend/`:

```bash
gcloud builds submit --config cloudbuild-force.yaml .
```
