import firebase_admin
from firebase_admin import credentials, firestore, storage
import os
import json
import logging
import re
from .config import settings

# Configurar logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class FirebaseManager:
    def __init__(self):
        if not firebase_admin._apps:
            logger.info("🚀 Inicializando Firebase Manager...")
            
            is_cloud_run = os.getenv('K_SERVICE') is not None
            logger.info(f"📍 Entorno: {'Cloud Run' if is_cloud_run else 'Local'}")
            
            if is_cloud_run:
                logger.info("🔐 Intentando leer secret de Cloud Run...")
                firebase_secret_path = '/secrets/firebase/key'
                cors_secret_path = '/secrets/cors/origins'
                
                try:
                    with open(firebase_secret_path, 'r') as f:
                        secret_content = f.read()
                    logger.info(f"✅ Secret de Firebase leído exitosamente desde {firebase_secret_path}")

                    # Procesar saltos de línea en la clave privada del secret
                    private_key = re.sub(r'\\n', '\n', secret_content)
                    logger.info("🔄 Procesados saltos de línea en la clave privada del secret")

                    with open(cors_secret_path, 'r') as f:
                        cors_content = f.read()
                    logger.info(f"✅ Configuración de CORS leída exitosamente desde {cors_secret_path}")
                    
                    cors_origins = json.loads(cors_content)
                    settings.BACKEND_CORS_ORIGINS = cors_origins
                    logger.info(f"📋 CORS configurado con: {cors_origins}")
                    
                    cred = credentials.Certificate({
                        "type": "service_account",
                        "project_id": settings.FIREBASE_PROJECT_ID,
                        "private_key_id": settings.FIREBASE_PRIVATE_KEY_ID,
                        "private_key": private_key,
                        "client_email": settings.FIREBASE_CLIENT_EMAIL,
                        "client_id": settings.FIREBASE_CLIENT_ID,
                        "auth_uri": settings.FIREBASE_AUTH_URI,
                        "token_uri": settings.FIREBASE_TOKEN_URI,
                        "auth_provider_x509_cert_url": settings.FIREBASE_AUTH_PROVIDER_X509_CERT_URL,
                        "client_x509_cert_url": settings.FIREBASE_CLIENT_X509_CERT_URL
                    })
                    
                except Exception as e:
                    logger.error(f"❌ Error al leer los secretos: {str(e)}")
                    logger.info("🔄 Usando variables de entorno como fallback...")
                    self._use_environment_variables()
                    return
            else:
                logger.info(" Usando variables de entorno para desarrollo local...")
                self._use_environment_variables()
                return
            
            try:
                logger.info("🔧 Inicializando Firebase app...")
                firebase_admin.initialize_app(cred, {
                    'storageBucket': f'{settings.FIREBASE_PROJECT_ID}.appspot.com'
                })
                logger.info("✅ Firebase app inicializada exitosamente")
            except Exception as e:
                logger.error(f"❌ Error al inicializar Firebase app: {str(e)}")
                raise
        
        try:
            self.db = firestore.client()
            self.storage = storage.bucket()
            logger.info("🎉 Firebase Manager inicializado completamente")
        except Exception as e:
            logger.error(f"❌ Error al inicializar Firestore y Storage: {str(e)}")
            raise
    
    def _use_environment_variables(self):
        """Usar variables de entorno como fallback"""
        logger.info("� Configurando credenciales desde variables de entorno...")
        
        private_key_env = settings.FIREBASE_PRIVATE_KEY
        logger.info(f"� Longitud de la clave privada: {len(private_key_env)} caracteres")
        
        if private_key_env.startswith('"') and private_key_env.endswith('"'):
            private_key_env = private_key_env[1:-1]
            logger.info("🔄 Quitadas comillas de la clave privada")
        
        private_key = re.sub(r'\\n', '\n', private_key_env)
        logger.info("🔄 Procesados saltos de línea en la clave privada")
        
        cred_dict = {
            "type": "service_account",
            "project_id": settings.FIREBASE_PROJECT_ID,
            "private_key_id": settings.FIREBASE_PRIVATE_KEY_ID,
            "private_key": private_key,
            "client_email": settings.FIREBASE_CLIENT_EMAIL,
            "client_id": settings.FIREBASE_CLIENT_ID,
            "auth_uri": settings.FIREBASE_AUTH_URI,
            "token_uri": settings.FIREBASE_TOKEN_URI,
            "auth_provider_x509_cert_url": settings.FIREBASE_AUTH_PROVIDER_X509_CERT_URL,
            "client_x509_cert_url": settings.FIREBASE_CLIENT_X509_CERT_URL
        }

        cred_dict = {k: v for k, v in cred_dict.items() if v}
        
        cred = credentials.Certificate(cred_dict)
        
        try:
            firebase_admin.initialize_app(cred, {
                'storageBucket': f'{settings.FIREBASE_PROJECT_ID}.appspot.com'
            })
            logger.info("✅ Firebase app inicializada con variables de entorno")
            
            # Inicializar db y storage después de la inicialización
            self.db = firestore.client()
            self.storage = storage.bucket()
            logger.info("✅ Firestore y Storage inicializados con variables de entorno")
        except Exception as e:
            logger.error(f"❌ Error al inicializar Firebase con variables de entorno: {str(e)}")
            raise
    
    def get_db(self):
        return self.db
    
    def get_storage(self):
        return self.storage

# Global Firebase instance
try:
    firebase_manager = FirebaseManager()
    logger.info("� Firebase Manager global creado exitosamente")
except Exception as e:
    logger.error(f"💥 Error crítico al crear Firebase Manager: {str(e)}")
    raise
