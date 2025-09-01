import jwt
from datetime import datetime, timedelta

# Probamos que JWT funciona
secret = "test_secret"
payload = {"user_id": "test123", "exp": datetime.now() + timedelta(days=1)}

token = jwt.encode(payload, secret, algorithm="HS256")
print("✅ Token generado:", token)

decoded = jwt.decode(token, secret, algorithms=["HS256"])
print("✅ Token decodificado:", decoded)

print("🎉 PyJWT funciona correctamente")