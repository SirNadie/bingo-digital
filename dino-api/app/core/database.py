from sqlmodel import SQLModel, create_engine, Session, select
from sqlalchemy import inspect, text
import os

DATABASE_URL = os.getenv("DATABASE_URL", "sqlite:///./dino.db")

# For SQLite, allow usage across threads (common in ASGI servers)
_connect_args = {"check_same_thread": False} if DATABASE_URL.startswith("sqlite") else {}
engine = create_engine(DATABASE_URL, echo=False, connect_args=_connect_args)

def init_db():
    # Ensure models are imported so SQLModel metadata is populated
    import app.models  # noqa: F401
    SQLModel.metadata.create_all(engine)
    _ensure_users_table()
    _ensure_admin_account()

def get_session():
    with Session(engine) as session:
        yield session


def _ensure_users_table():
    inspector = inspect(engine)
    try:
        columns = {col["name"] for col in inspector.get_columns("users")}
    except Exception:
        return
    if "is_admin" in columns:
        return
    ddl = "ALTER TABLE users ADD COLUMN is_admin BOOLEAN DEFAULT 0"
    backend = engine.url.get_backend_name()
    if backend not in {"sqlite", "postgresql", "mysql"}:
        return
    if backend == "postgresql":
        ddl = "ALTER TABLE users ADD COLUMN IF NOT EXISTS is_admin BOOLEAN DEFAULT FALSE"
    elif backend == "mysql":
        ddl = "ALTER TABLE users ADD COLUMN is_admin TINYINT(1) DEFAULT 0"
    with engine.begin() as conn:
        conn.execute(text(ddl))


def _ensure_admin_account():
    from app.core.config import ADMIN_EMAIL, ADMIN_PASSWORD
    from app.core.security import hash_password, verify_password
    from app.models.user import User
    from app.models.wallet import Wallet

    with Session(engine) as session:
        admin = session.exec(select(User).where(User.email == ADMIN_EMAIL)).first()
        if not admin:
            admin = User(
                email=ADMIN_EMAIL,
                hashed_password=hash_password(ADMIN_PASSWORD),
                is_admin=True,
                alias="Administrador",
            )
            session.add(admin)
            session.commit()
            session.refresh(admin)
        else:
            updated = False
            if not admin.is_admin:
                admin.is_admin = True
                updated = True
            if not verify_password(ADMIN_PASSWORD, admin.hashed_password):
                admin.hashed_password = hash_password(ADMIN_PASSWORD)
                updated = True
            if not admin.alias:
                admin.alias = "Administrador"
                updated = True
            if updated:
                session.add(admin)
                session.commit()

        wallet = session.exec(select(Wallet).where(Wallet.user_id == admin.id)).first()
        if not wallet:
            session.add(Wallet(user_id=admin.id, balance=0.0))
            session.commit()
