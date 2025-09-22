import os
from dotenv import load_dotenv

load_dotenv()

class Settings:
    # Firebase Configuration
    FIREBASE_PROJECT_ID: str = "west-reportes-conduccion"
    FIREBASE_PRIVATE_KEY_ID: str = "12d6ff8c9146d5c1a7529fa400bc5bd291d1ce42"
    FIREBASE_PRIVATE_KEY: str = """-----BEGIN PRIVATE KEY-----
MIIEvQIBADANBgkqhkiG9w0BAQEFAASCBKcwggSjAgEAAoIBAQDLJxGz6ytbosBu
rV0UGg/84JVzLtdwqf+yTL7hnM3kSEvL1WBzky9LWZAdBzI1hX59TlwjaHZADsNR
owy1Et1/vEz91X3mw6NudDlLZHT+Bkup33Yxtw/4GRZDWWbBdIUDRgtc4K2P1Vjn
QGZMcQzLK5yeW+Vy9hovvGe7I69AmNVHySOsd7Htiqdh0mLxkuUUC78XmFuz+r91
uhz3bwZ++kTNAXJbFdoozknzqNHGn0KseCB86w1KXlBMmpIVhkGOuVo6Qq4ZpLLw
AiQsDSKLo9oEGsLO0r+Jg2iRpl63PTsrnXlPQVGQ/1U0HeqL3aIuxfvVtVRCxRf0
Uv5ZnN6LAgMBAAECggEAYGsQD1znrKu/eigE27QM73+l3s+WB85fYb/j/o9d9uFL
PBhvGRt7oF8HM4fFUDqmEJHe0B1VtkxrbjUdJFmqT+ROhFDN2vbye8tkoAAzOJdD
VQIOhkT0qtM5SkjFqL6FHMsjPHcUWQYwljzt8IzdPhZaVJyX92qPfiWE9ABZPqYS
WQmcV/K90ZDkeqg3KoyI6mrbcfWLmNTWkWPpxeoe5jDMyAWL0LnuShkHZEInVkrD
k2AY3EVPM+KVu+j4l0H5T6MnBLi6QDnHjdMU5/916hWPg8QlxXyecnRXDgI7J1MB
S+mryifikwND+ZbjCXNoEHzz58LgG5+mjvvGFd+pyQKBgQDpLVmyEAgXPTBHCDu6
0RYX4XosAl2MJ5kmB8jj4oe6VVn0ankpGp+ZmR/0B7jJLOusM3WkQHeo5z/uxvM4
sWHcPMZcuge17QmW0i1/jMdeCb9oy50/sFiPKK0NUokYfTYm8YwUr0dza0Vn5FDF
94fHVyn6jg9f1j5OXbmrIGas8wKBgQDfCWcsXWMK5xQs7CHCQ6REJ6UPmuYAPW2m
O+TTpxEPR8WyQ/Q7dJ6a9n3VnebHHtN8SFzsF2V9yMsvC6qUXzQVC3X9r+cHU58Z
Z14QFKeKWPNpk3zLu+uMwkcg0hwRNvgCH/pkSwJG+lEX6LBcRGHkPftqdiwFAQDk
F8mbkiaOCQKBgC62WBa04XoOVwKT4qtdQajNEdWJL8ZpFGQrARKuCfTJLnkpb1ZN
sBVsOJuBhIJAzoGz2WhrRc1/bi5eitEbr/gX8MEYv3yxnM8rEdRQlov/Neo/iCP/
Ju6e/nQBydcvFk8c6qwmJRE5NzFF6uyN1xSXIKDCHtBbMiYu3ogquIcDAoGAUt5N
hUBVclGVP3Okv2cee2w3eerVljU8rk0GolUqk4DZRXjWH9kerPj0nBAFFOqxLTY9
wEKZJPkb9Sjigio1UbRmbJGUxzYcoPW1D0h9T3vpRMrVzWTPCgeNIfavEv5Xe4Ki
J+1utSyAQN/l1wJZVNJqvY2WoW1UBWuJLtJInPECgYEA26ynR/jS2pAYRbEKtWNb
KGGppqSgFwAg3wMqShVFiTJ6ZBrH+9GJExTdoyExJcNc2Lu4OLgoEXvq7zGXCir3
S5cHx17R1/fIIWGUROjEWeJBNUkdvzXAd+0eG8ZPLIx8fzDUsavPjMJiMk2pnRHJ
AQX5rr7138Rc0Wr7VODDXYA=
-----END PRIVATE KEY-----"""
    FIREBASE_CLIENT_EMAIL: str = "firebase-adminsdk-fbsvc@west-reportes-conduccion.iam.gserviceaccount.com"
    FIREBASE_CLIENT_ID: str = "101515555088448488425"
    FIREBASE_AUTH_URI: str = "https://accounts.google.com/o/oauth2/auth"
    FIREBASE_TOKEN_URI: str = "https://oauth2.googleapis.com/token"
    FIREBASE_AUTH_PROVIDER_X509_CERT_URL: str = "https://www.googleapis.com/oauth2/v1/certs"
    FIREBASE_CLIENT_X509_CERT_URL: str = "https://www.googleapis.com/robot/v1/metadata/x509/firebase-adminsdk-fbsvc%40west-reportes-conduccion.iam.gserviceaccount.com"
    
    # API Configuration
    API_V1_STR: str = "/api/v1"
    PROJECT_NAME: str = "Reportes de Conducción - West Ingeniería"
    
    # CORS Configuration
    BACKEND_CORS_ORIGINS: list = [
        "http://localhost:3000",
        "http://localhost:8080",
        "http://127.0.0.1:3000",
        "http://127.0.0.1:8080",
    ]

    # File Upload Configuration
    MAX_FILE_SIZE: int = 50 * 1024 * 1024  # 50MB
    UPLOAD_DIR: str = "uploads"
    
    class Config:
        case_sensitive = True

settings = Settings()
