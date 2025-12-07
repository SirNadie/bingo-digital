import {
  AdminActivityItem,
  AdminGame,
  AdminNavItem,
  AdminSupportItem,
  AdminTransaction,
  AdminUser,
  AdminUserMetric,
  AdminView,
  AdminViewMeta,
} from "../../types";

export const ADMIN_NAV_ITEMS: AdminNavItem[] = [
  { icon: "dashboard", label: "Dashboard", view: "dashboard" },
  { icon: "group", label: "Gestión de Usuarios", view: "users" },
  { icon: "stadia_controller", label: "Gestión de Partidas", view: "games" },
  { icon: "account_balance_wallet", label: "Transacciones", view: "transactions" },
];

export const ADMIN_SUPPORT_ITEMS: AdminSupportItem[] = [
  { icon: "settings", label: "Configuración" },
  { icon: "help", label: "Ayuda" },
  { icon: "logout", label: "Cerrar sesión", action: "logout" },
];

export const ADMIN_VIEW_META: Record<AdminView, AdminViewMeta> = {
  dashboard: {
    eyebrow: "Panel en vivo",
    title: "Actividad general",
    subtitle: "Los datos se actualizan automáticamente.",
    primaryAction: { label: "Exportar reporte", icon: "ios_share" },
  },
  transactions: {
    eyebrow: "Fondos en movimiento",
    title: "Gestión de transacciones",
    subtitle: "Controla depósitos y retiros en tiempo real.",
    primaryAction: { label: "Aprobar pendientes", icon: "task_alt" },
  },
  users: {
    title: "Gestión de usuarios",
    primaryAction: { label: "Invitar usuario", icon: "person_add" },
  },
  games: {
    eyebrow: "Operación de salas",
    title: "Gestión de partidas",
    subtitle: "Configura modos, cupos y potes acumulados.",
    primaryAction: { label: "Crear sala", icon: "add_circle" },
  },
};

export const ADMIN_USER_METRICS: AdminUserMetric[] = [
  { icon: "group", label: "Usuarios activos", value: "8,432", trend: "+3.2%", tone: "up" },
  { icon: "person_add", label: "Altas hoy", value: "128", trend: "+12%", tone: "up" },
  { icon: "verified_user", label: "KYC completado", value: "92%", trend: "+1.5%", tone: "neutral" },
  { icon: "report", label: "Alertas de riesgo", value: "12", trend: "-4.1%", tone: "down" },
];

export const ADMIN_SAMPLE_USERS: AdminUser[] = [
  {
    id: "USR-1024",
    alias: "PlayerOne",
    email: "player.one@dino.gg",
    status: "Activo",
    tone: "success",
    balance: 245.6,
    lastSeen: "Hace 5 min",
    gamesPlayed: 92,
  },
  {
    id: "USR-1025",
    alias: "LuckyStar",
    email: "lucky.star@dino.gg",
    status: "En revisión",
    tone: "warning",
    balance: 58.2,
    lastSeen: "Hace 2 h",
    gamesPlayed: 38,
  },
  {
    id: "USR-1026",
    alias: "RetroQueen",
    email: "retro.queen@dino.gg",
    status: "Suspendido",
    tone: "danger",
    balance: 0,
    lastSeen: "Hace 1 día",
    gamesPlayed: 12,
  },
  {
    id: "USR-1027",
    alias: "NovaShield",
    email: "nova.shield@dino.gg",
    status: "Activo",
    tone: "success",
    balance: 512.4,
    lastSeen: "Hace 10 min",
    gamesPlayed: 144,
  },
  {
    id: "USR-1028",
    alias: "SonicWave",
    email: "sonic.wave@dino.gg",
    status: "Activo",
    tone: "info",
    balance: 98.6,
    lastSeen: "En línea",
    gamesPlayed: 64,
  },
];

export const ADMIN_SAMPLE_GAMES: AdminGame[] = [
  {
    id: "ROOM-8790",
    name: "Sala Progresiva",
    host: "LunaNova",
    schedule: "En vivo · inició hace 12 min",
    reward: "Jackpot garantizado 50%",
    status: "En vivo",
    tone: "success",
    buyIn: 5,
    pot: 1250,
    players: 82,
    capacity: 120,
    progress: 68,
  },
  {
    id: "ROOM-8791",
    name: "Modo Relámpago",
    host: "RetroKing",
    schedule: "Arranca 18:30",
    reward: "Rondas rápidas · 40 cartones",
    status: "Programada",
    tone: "info",
    buyIn: 3,
    pot: 640,
    players: 32,
    capacity: 80,
    progress: 40,
  },
  {
    id: "ROOM-8792",
    name: "Clásica Prime",
    host: "Mamba88",
    schedule: "Finalizó hace 1 h",
    reward: "Pagó triple línea",
    status: "Finalizada",
    tone: "warning",
    buyIn: 4,
    pot: 890,
    players: 120,
    capacity: 120,
    progress: 100,
  },
];

export const ADMIN_ACTIVITY_ITEMS: AdminActivityItem[] = [
  {
    id: "activity-001",
    icon: "emoji_events",
    tone: "primary",
    title: "PlayerOne",
    description: "Ganó Bingo mayor en sala Progresiva #1024.",
    time: "Hace 2 minutos",
    amount: "+50 cr",
    badge: "Premio",
  },
  {
    id: "activity-002",
    icon: "shopping_cart",
    tone: "success",
    title: "BingoMaster",
    description: "Compró el Pro Pack · 40 cartones + 10 boosters.",
    time: "Hace 15 minutos",
    amount: "+120 cr",
    badge: "Venta",
  },
  {
    id: "activity-003",
    icon: "person_add",
    tone: "warning",
    title: "Newbie23",
    description: "Completó registro y verificación de identidad.",
    time: "Hace 30 minutos",
    badge: "Nuevo jugador",
  },
  {
    id: "activity-004",
    icon: "payments",
    tone: "success",
    title: "LuckyStar",
    description: "Retiró ganancias del torneo Prime #1023.",
    time: "Hace 1 hora",
    amount: "-120 cr",
    badge: "Payout",
  },
];

export const ADMIN_SAMPLE_TRANSACTIONS: AdminTransaction[] = [
  {
    id: "TX-001",
    user: "PlayerOne",
    timestamp: "2024-07-15 10:30",
    amount: 250,
    type: "deposit",
    status: "approved",
  },
  {
    id: "TX-002",
    user: "LuckyStar",
    timestamp: "2024-07-15 10:05",
    amount: -150,
    type: "withdraw",
    status: "pending",
  },
  {
    id: "TX-003",
    user: "RetroQueen",
    timestamp: "2024-07-14 22:12",
    amount: 90,
    type: "deposit",
    status: "approved",
  },
  {
    id: "TX-004",
    user: "NovaShield",
    timestamp: "2024-07-14 20:48",
    amount: -60,
    type: "withdraw",
    status: "approved",
  },
];
