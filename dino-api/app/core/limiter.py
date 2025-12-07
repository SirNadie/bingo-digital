from slowapi import Limiter
from slowapi.util import get_remote_address

# Initialize limiter with remote address as key
# Default global limit: 200 requests per minute per IP
limiter = Limiter(key_func=get_remote_address, default_limits=["200/minute"])
