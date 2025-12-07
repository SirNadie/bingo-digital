import { UserView } from "../../../types";
import { formatCredits } from "../../../utils/format";

type UserHeaderProps = {
  view: UserView;
  balance: number;
  userEmail?: string;
  onNavigate: (view: UserView) => void;
  onLogout: () => void;
  roomMode?: boolean;
  onRequestExit?: () => void;
};

export function UserHeader({ view, balance, userEmail, onNavigate, onLogout, roomMode, onRequestExit }: UserHeaderProps) {
  const effectiveView = view === "stats" ? "stats" : "other";
  const formattedBalance = formatCredits(balance);
  const displayName = userEmail ? userEmail.split("@")[0] : "";

  return (
    <header className="user-topbar">
      <div className="user-brand">
        <div className="user-brand__icon" aria-hidden="true">
          <img src="/logo.png" alt="Dino Bingo" className="w-10 h-10 object-contain" />
        </div>
        <div>
          <h1 className="user-brand__title">Dino Bingo</h1>
          <p className="user-brand__subtitle">Tu panel personal</p>
        </div>
      </div>

      {!roomMode && (
        <nav className="user-topnav" aria-label="Navegación principal">
          <button
            type="button"
            className={`user-topnav__link ${effectiveView === "stats" ? "user-topnav__link--active" : ""}`}
            onClick={() => onNavigate("stats")}
          >
            Mis estadísticas
          </button>
          <button type="button" className="user-topnav__link">
            Ayuda
          </button>
        </nav>
      )}

      <div className="user-topnav__right">
        {!roomMode && (
          <>
            <button type="button" className="user-balance-pill" onClick={() => onNavigate("balance")}>
              <span className="material-symbols-outlined" aria-hidden="true">
                account_balance_wallet
              </span>
              <span className="user-balance-pill__label">{formattedBalance}</span>
            </button>
            <div className="user-profile">
              <div className="user-avatar" aria-hidden="true" />
              {displayName && <span className="user-profile__name">{displayName}</span>}
            </div>
          </>
        )}
        <button
          type="button"
          className={roomMode ? "user-room-exit" : "user-logout"}
          onClick={roomMode && onRequestExit ? onRequestExit : onLogout}
        >
          <span className="material-symbols-outlined" aria-hidden="true">
            logout
          </span>
          {roomMode && <span>Salir</span>}
        </button>
      </div>
    </header>
  );
}

export default UserHeader;

