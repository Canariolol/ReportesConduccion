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
        if not firebase_admin._apps:
            logger.info("🚀 Inicializando Firebase Manager...")
            
            # Verificar si estamos en Cloud Run
            is_cloud_run = os.getenv('K_SERVICE') is not None
            logger.info(f"📍 Entorno: {'Cloud Run' if is_cloud_run else 'Local'}")
            
            if is_cloud_run:
                logger.info("🔐 Intentando leer secret de Cloud Run...")
                
                # Intentar leer el secret
                secret_path = '/etc/secrets/firebase-private-key'
                try:
                    with open(secret_path, 'r') as f:
                        secret_content = f.read()
                    logger.info(f"✅ Secret leído exitosamente desde {secret_path}")
                    logger.info(f"📋 Longitud del secret: {len(secret_content)} caracteres")
                    
                    # Verificar si es JSON o solo la clave privada
                    try:
                        secret_data = json.loads(secret_content)
                        logger.info("📄 El secret es un JSON completo")
                        cred = credentials.Certificate(secret_data)
                    except json.JSONDecodeError:
                        logger.info("🔑 El secret es solo la clave privada")
                        # Construir el objeto de credencial manualmente
                        cred = credentials.Certificate({
                            "type": "service_account",
                            "project_id": settings.FIREBASE_PROJECT_ID,
                            "private_key_id": settings.FIREBASE_PRIVATE_KEY_ID,
                            "private_key": secret_content,
                            "client_email": settings.FIREBASE_CLIENT_EMAIL,
                            "client_id": settings.FIREBASE_CLIENT_ID,
                            "auth_uri": settings.FIREBASE_AUTH_URI,
                            "token_uri": settings.FIREBASE_TOKEN_URI,
                            "auth_provider_x509_cert_url": settings.FIREBASE_AUTH_PROVIDER_X509_CERT_URL,
                            "client_x509_cert_url": settings.FIREBASE_CLIENT_X509_CERT_URL
                        })
                    
                except FileNotFoundError:
                    logger.error(f"❌ No se encontró el secret en {secret_path}")
                    logger.info("🔄 Usando variables de entorno como fallback...")
                    self._use_environment_variables()
                    return
                except Exception as e:
                    logger.error(f"❌ Error al leer el secret: {str(e)}")
                    logger.info("🔄 Usando variables de entorno como fallback...")
                    self._use_environment_variables()
                    return
            else:
                logger.info("💻 Usando variables de entorno para desarrollo local...")
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
        
        self.db = firestore.client()
        self.storage = storage.bucket()
        logger.info("🎉 Firebase Manager inicializado completamente")
    
    def _use_environment_variables(self):
        """Usar variables de entorno como fallback"""
        logger.info("📝 Configurando credenciales desde variables de entorno...")
        
        private_key = settings.FIREBASE_PRIVATE_KEY
        logger.info(f"📋 Longitud de la clave privada: {len(private_key)} caracteres")
        
        # Procesar la clave privada
        if private_key.startswith('"') and private_key.endswith('"'):
            private_key = private_key[1:-1]
            logger.info("🔄 Quitadas comillas de la clave privada")
        
        # Reemplazar \n con saltos de línea reales
        import re
        private_key = re.sub(r'\\n', '\n', private_key)
        logger.info("🔄 Procesados saltos de línea en la clave privada")
        
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
        
        try:
            firebase_admin.initialize_app(cred, {
                'storageBucket': f'{settings.FIREBASE_PROJECT_ID}.appspot.com'
            })
            logger.info("✅ Firebase app inicializada con variables de entorno")
        except Exception as e:
            logger.error(f"❌ Error al inicializar Firebase con variables de entorno: {str(e)}")
            raise
    
    def get_db(self):
        """Get Firestore database instance"""
        return self.db
    
    def get_storage(self):
        """Get Firebase Storage bucket instance"""
        return self.storage

# Global Firebase instance
try:
    firebase_manager = FirebaseManager()
    logger.info("🌟 Firebase Manager global creado exitosamente")
except Exception as e:
    logger.error(f"💥 Error crítico al crear Firebase Manager: {str(e)}")
    raise
