import firebase_admin
from firebase_admin import credentials, firestore, storage
import os
import json
import logging
from .config import settings

# Configurar logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class FirebaseManager:
    def __init__(self):
        if firebase_admin._apps:
            self.db = firestore.client()
            self.storage = storage.bucket()
            return

        logger.info("🚀 Inicializando Firebase Manager...")
        is_cloud_run = os.getenv('K_SERVICE') is not None
        logger.info(f"📍 Entorno: {'Cloud Run' if is_cloud_run else 'Local'}")

        try:
            if is_cloud_run:
                self._init_from_secret_manager_api()
            else:
                self._init_from_local_service_account_file()

            self.db = firestore.client()
            self.storage = storage.bucket()
            logger.info("🎉 Firebase Manager inicializado completamente")
        except Exception as e:
            logger.critical(f"💥 Error fatal durante la inicialización de Firebase: {e}")
            self.db = None
            self.storage = None
            raise

    def _init_from_secret_manager_api(self):
        """Inicializa la configuración leyendo directamente desde la API de Secret Manager."""
        logger.info("🔐 Usando la API de Secret Manager para leer los secretos...")
        try:
            from google.cloud import secretmanager
            client = secretmanager.SecretManagerServiceClient()
            project_id = "west-reportes-conduccion"

            def get_secret(secret_name):
                version_path = client.secret_version_path(project_id, secret_name, "latest")
                response = client.access_secret_version(request={"name": version_path})
                return response.payload.data.decode("UTF-8")

            # 1. Leer el JSON completo de la cuenta de servicio desde un solo secreto
            service_account_json_string = get_secret("firebase-service-account")
            cred_dict = json.loads(service_account_json_string)
            
            # 2. Inicializar Firebase directamente con el diccionario de credenciales
            cred = credentials.Certificate(cred_dict)
            firebase_admin.initialize_app(cred, {
                'storageBucket': f'{cred_dict["project_id"]}.appspot.com'
            })
            logger.info("✅ Firebase app inicializada con el JSON de la cuenta de servicio completa.")

            # 3. Leer y configurar secreto de CORS
            cors_content = get_secret("cors-origins")
            cors_origins = json.loads(cors_content)
            settings.BACKEND_CORS_ORIGINS = cors_origins
            logger.info(f"📋 CORS configurado con: {cors_origins}")

        except Exception as e:
            logger.error(f"❌ Falló la inicialización usando la API de Secret Manager: {e}")
            raise

    def _init_from_local_service_account_file(self):
        """Usa el archivo serviceAccount.json para el desarrollo local."""
        logger.info("🔧 Usando el archivo serviceAccount.json para desarrollo local...")
        try:
            cred = credentials.Certificate("serviceAccount.json")
            firebase_admin.initialize_app(cred, {
                'storageBucket': f'{settings.FIREBASE_PROJECT_ID}.appspot.com'
            })
            logger.info("✅ Firebase app inicializada con el archivo serviceAccount.json local.")
        except Exception as e:
            logger.error(f"❌ Falló la inicialización local. Asegúrate de tener un archivo serviceAccount.json válido en la raíz de /backend. Error: {e}")
            raise

    def get_db(self):
        return self.db
    
    def get_storage(self):
        return self.storage

# Instancia global
try:
    firebase_manager = FirebaseManager()
except Exception:
    firebase_manager = None # La inicialización ya registra el error crítico