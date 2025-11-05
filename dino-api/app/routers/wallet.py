from fastapi import APIRouter, Depends, Header, HTTPException
from typing import Optional
from sqlmodel import Session, select

from app.core.database import get_session
from app.core.security import get_user_id_from_bearer
from app.models.wallet import Wallet
from app.schemas import TopUpRequest, TopUpResponse


router = APIRouter(prefix="/wallet", tags=["wallet"])


def _auth(bearer: Optional[str] = Header(None, alias="Authorization")) -> str:
    user_id = get_user_id_from_bearer(bearer)
    if not user_id:
        raise HTTPException(status_code=401, detail="No autorizado")
    return user_id


@router.post("/topup", response_model=TopUpResponse)
def topup(payload: TopUpRequest, user_id: str = Depends(_auth), session: Session = Depends(get_session)):
    w = session.exec(select(Wallet).where(Wallet.user_id == user_id)).first()
    if not w:
        # crear si no existe
        w = Wallet(user_id=user_id, balance=0.0)
        session.add(w)
        session.commit()
        session.refresh(w)
    w.balance = float(w.balance or 0.0) + float(payload.amount)
    session.add(w)
    session.commit()
    session.refresh(w)
    return TopUpResponse(balance=w.balance)

