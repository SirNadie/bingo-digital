// Common API error type for axios responses
export type ApiError = {
  response?: {
    data?: {
      detail?: string;
    };
  };
};

export type Game = {
  id: string;
  creator_id: string;
  price: number;
  status: string;
  sold_tickets: number;
  min_tickets: number;
};

export type Ticket = {
  id: string;
  game_id: string;
  user_id: string;
  numbers: number[][];
};

export type Me = {
  id: string;
  email: string;
  balance: number;
  alias?: string;
  is_admin: boolean;
  is_verified: boolean;
};

export type GameState = {
  id: string;
  status: string;
  price: number;
  min_tickets: number;
  sold_tickets: number;
  drawn_numbers: number[];
  paid_diagonal: boolean;
  paid_line: boolean;
  paid_bingo: boolean;
  creator_id: string;
};

export type AdminTransaction = {
  id: string;
  user: string;
  timestamp: string;
  amount: number;
  type: "deposit" | "withdraw";
  status: "pending" | "approved" | "rejected";
};

export type AdminActivityTone = "primary" | "success" | "warning";

export type AdminActivityItem = {
  id: string;
  icon: string;
  tone: AdminActivityTone;
  title: string;
  description: string;
  time: string;
  amount?: string;
  badge?: string;
};

export type AdminStatusTone = "success" | "warning" | "danger" | "info";
export type TrendTone = "up" | "down" | "neutral";

export type AdminUserMetric = {
  icon: string;
  label: string;
  value: string;
  trend: string;
  tone: TrendTone;
};

export type AdminUser = {
  id: string;
  alias: string;
  email: string;
  status: string;
  tone: AdminStatusTone;
  balance: number;
  lastSeen: string;
  gamesPlayed: number;
};

export type AdminGame = {
  id: string;
  name: string;
  host: string;
  schedule: string;
  reward: string;
  status: string;
  tone: AdminStatusTone;
  buyIn: number;
  pot: number;
  players: number;
  capacity: number;
  progress: number;
};

export type AdminStats = {
  total_users: number;
  active_games: number;
  total_revenue: number;
  today_transactions: number;
  total_games_finished: number;
  total_pot: number;
  total_system_revenue: number;
};

export type AdminView = "dashboard" | "transactions" | "users" | "games";

export type AdminViewAction = { label: string; icon: string };

export type AdminViewMeta = {
  eyebrow?: string;
  title: string;
  subtitle?: string;
  primaryAction: AdminViewAction;
  secondaryAction?: AdminViewAction;
};

export type AdminNavItem = { icon: string; label: string; view: AdminView };
export type AdminSupportItem = { icon: string; label: string; action?: "logout" };

export type UserTransactionType = "deposit" | "withdraw" | "purchase" | "prize" | "refund" | "topup" | "commission";

export type UserTransaction = {
  id: string;
  timestamp: string;
  type: UserTransactionType;
  description: string;
  amount: number;
  status: "pending" | "approved" | "rejected";
};

export type UserView = "balance" | "stats" | "join" | "create" | "room";

export type UserStats = {
  games_played: number;
  games_won: number;
  win_rate: number;
  total_earned: number;
  total_spent: number;
  net_balance: number;
  biggest_prize: number;
  bingos_won: number;
  lines_won: number;
  diagonals_won: number;
};

export type JoinableGameCard = {
  id: string;
  roomName: string;
  description: string;
  creator: string;
  pot: number;
  price: number;
  sold: string;
  rewards: string;
  breakdown: string;
  actionLabel: string;
};
