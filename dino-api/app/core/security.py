import base64
import hashlib
import hmac
import json
import time
from typing import Any, Dict, Optional

import bcrypt

from .config import SECRET_KEY, JWT_ALGORITHM, ACCESS_TOKEN_EXPIRE_MINUTES


def _b64url_encode(data: bytes) -> str:
    return base64.urlsafe_b64encode(data).rstrip(b"=").decode("ascii")


def _b64url_decode(data: str) -> bytes:
    padding = '=' * (-len(data) % 4)
    return base64.urlsafe_b64decode(data + padding)


def create_access_token(subject: str, expires_minutes: Optional[int] = None, extra: Optional[Dict[str, Any]] = None) -> str:
    header = {"alg": JWT_ALGORITHM, "typ": "JWT"}
    now = int(time.time())
    exp = now + 60 * (expires_minutes or ACCESS_TOKEN_EXPIRE_MINUTES)
    payload: Dict[str, Any] = {"sub": subject, "exp": exp}
    if extra:
        payload.update(extra)

    header_b64 = _b64url_encode(json.dumps(header, separators=(",", ":")).encode("utf-8"))
    payload_b64 = _b64url_encode(json.dumps(payload, separators=(",", ":")).encode("utf-8"))
    signing_input = f"{header_b64}.{payload_b64}".encode("ascii")
    if JWT_ALGORITHM != "HS256":
        raise ValueError("Solo HS256 soportado en esta implementación")
    signature = hmac.new(SECRET_KEY.encode("utf-8"), signing_input, hashlib.sha256).digest()
    sig_b64 = _b64url_encode(signature)
    return f"{header_b64}.{payload_b64}.{sig_b64}"


class TokenError(Exception):
    pass


def decode_token(token: str) -> Dict[str, Any]:
    try:
        header_b64, payload_b64, sig_b64 = token.split(".")
    except ValueError as e:
        raise TokenError("Formato de token inválido") from e

    signing_input = f"{header_b64}.{payload_b64}".encode("ascii")
    expected_sig = hmac.new(SECRET_KEY.encode("utf-8"), signing_input, hashlib.sha256).digest()
    if not hmac.compare_digest(_b64url_encode(expected_sig), sig_b64):
        raise TokenError("Firma inválida")
    payload = json.loads(_b64url_decode(payload_b64))
    if int(time.time()) >= int(payload.get("exp", 0)):
        raise TokenError("Token expirado")
    return payload


def get_user_id_from_bearer(bearer: Optional[str]) -> Optional[str]:
    if not bearer:
        return None
    parts = bearer.strip().split()
    if len(parts) != 2 or parts[0].lower() != "bearer":
        return None
    token = parts[1]
    try:
        payload = decode_token(token)
        sub = payload.get("sub")
        return str(sub) if sub else None
    except TokenError:
        return None


def hash_password(raw: str) -> str:
    salt = bcrypt.gensalt(rounds=12)
    return bcrypt.hashpw(raw.encode("utf-8"), salt).decode("utf-8")


def verify_password(raw: str, hashed: str) -> bool:
    try:
        return bcrypt.checkpw(raw.encode("utf-8"), hashed.encode("utf-8"))
    except Exception:
        return False

