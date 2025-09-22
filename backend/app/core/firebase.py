import firebase_admin
from firebase_admin import credentials, firestore, storage
from .config import settings

class FirebaseManager:
    def __init__(self):
        if not firebase_admin._apps:
            # Initialize Firebase with service account
            cred = credentials.Certificate({
                "type": "service_account",
                "project_id": settings.FIREBASE_PROJECT_ID,
                "private_key_id": settings.FIREBASE_PRIVATE_KEY_ID,
                "private_key": settings.FIREBASE_PRIVATE_KEY,
                "client_email": settings.FIREBASE_CLIENT_EMAIL,
                "client_id": settings.FIREBASE_CLIENT_ID,
                "auth_uri": settings.FIREBASE_AUTH_URI,
                "token_uri": settings.FIREBASE_TOKEN_URI,
                "auth_provider_x509_cert_url": settings.FIREBASE_AUTH_PROVIDER_X509_CERT_URL,
                "client_x509_cert_url": settings.FIREBASE_CLIENT_X509_CERT_URL
            })
            firebase_admin.initialize_app(cred, {
                'storageBucket': f'{settings.FIREBASE_PROJECT_ID}.appspot.com'
            })
        
        self.db = firestore.client()
        self.storage = storage.bucket()
    
    def get_db(self):
        return self.db
    
    def get_storage(self):
        return self.storage

# Global Firebase instance
firebase_manager = FirebaseManager()
