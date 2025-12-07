from fastapi import APIRouter, Depends, HTTPException, Header, Request
from sqlmodel import Session, select

from app.schemas import LoginRequest, LoginResponse, MeResponse, UpdateProfileRequest
from app.core.database import get_session
from app.core.security import create_access_token, hash_password, verify_password, get_user_id_from_bearer
from app.core.config import AUTO_REGISTER_ON_LOGIN
from app.core.limiter import limiter
from app.models.user import User
from app.models.wallet import Wallet


router = APIRouter(prefix="/auth", tags=["auth"])


@router.post("/register", response_model=LoginResponse, status_code=201)
@limiter.limit("5/minute")
def register(request: Request, payload: LoginRequest, session: Session = Depends(get_session)):
    # email único; crea usuario + wallet y devuelve token
    existing = session.exec(select(User).where(User.email == payload.email)).first()
    if existing:
        raise HTTPException(status_code=409, detail="El email ya está registrado")
    u = User(email=payload.email, hashed_password=hash_password(payload.password))
    session.add(u)
    session.commit()
    session.refresh(u)
    # wallet 1:1
    w = Wallet(user_id=u.id, balance=0.0)
    session.add(w)
    session.commit()
    token = create_access_token(subject=u.id, extra={"is_admin": u.is_admin})
    return LoginResponse(access_token=token)


def _auth(bearer: str | None = Header(None, alias="Authorization")) -> str:
    user_id = get_user_id_from_bearer(bearer)
    if not user_id:
        raise HTTPException(status_code=401, detail="No autorizado")
    return user_id


@router.get("/me", response_model=MeResponse)
def me(user_id: str = Depends(_auth), session: Session = Depends(get_session)):
    u = session.exec(select(User).where(User.id == user_id)).first()
    if not u:
        raise HTTPException(status_code=404, detail="Usuario no encontrado")
    w = session.exec(select(Wallet).where(Wallet.user_id == user_id)).first()
    balance = w.balance if w else 0.0
    return MeResponse(
        id=u.id,
        email=u.email,
        balance=balance,
        alias=u.alias,
        is_verified=u.is_verified,
        is_admin=u.is_admin,
    )


@router.patch("/me", response_model=MeResponse)
def update_me(payload: UpdateProfileRequest, user_id: str = Depends(_auth), session: Session = Depends(get_session)):
    u = session.get(User, user_id)
    if not u:
        raise HTTPException(status_code=404, detail="Usuario no encontrado")
    if payload.alias is not None:
        u.alias = payload.alias.strip() or None
    session.add(u)
    session.commit()
    w = session.exec(select(Wallet).where(Wallet.user_id == user_id)).first()
    bal = w.balance if w else 0.0
    return MeResponse(
        id=u.id,
        email=u.email,
        balance=bal,
        alias=u.alias,
        is_verified=u.is_verified,
        is_admin=u.is_admin,
    )


@router.post("/login", response_model=LoginResponse)
@limiter.limit("10/minute")
def login(request: Request, payload: LoginRequest, session: Session = Depends(get_session)):
    u = session.exec(select(User).where(User.email == payload.email)).first()
    if not u:
        if AUTO_REGISTER_ON_LOGIN:
            # Registro automático en desarrollo
            u = User(email=payload.email, hashed_password=hash_password(payload.password))
            session.add(u)
            session.commit()
            session.refresh(u)
            w = Wallet(user_id=u.id, balance=0.0)
            session.add(w)
            session.commit()
        else:
            raise HTTPException(status_code=401, detail="Credenciales inválidas")
    else:
        if not verify_password(payload.password, u.hashed_password):
            raise HTTPException(status_code=401, detail="Credenciales inválidas")
    token = create_access_token(subject=u.id, extra={"is_admin": u.is_admin})
    return LoginResponse(access_token=token)
