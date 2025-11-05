import os


# Seguridad
SECRET_KEY = os.getenv("SECRET_KEY", "dev-secret-change-me")
JWT_ALGORITHM = os.getenv("JWT_ALGORITHM", "HS256")
ACCESS_TOKEN_EXPIRE_MINUTES = int(os.getenv("ACCESS_TOKEN_EXPIRE_MINUTES", "60"))


# CORS
_origins = os.getenv("CORS_ORIGINS", "*")
if _origins.strip() == "*":
    CORS_ORIGINS = ["*"]
else:
    CORS_ORIGINS = [o.strip() for o in _origins.split(",") if o.strip()]

# Dev helpers
AUTO_REGISTER_ON_LOGIN = os.getenv("AUTO_REGISTER_ON_LOGIN", "true").lower() == "true"
