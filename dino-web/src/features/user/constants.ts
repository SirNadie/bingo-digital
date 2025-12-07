import { JoinableGameCard, UserTransaction } from "../../types";

export const USER_SAMPLE_TRANSACTIONS: UserTransaction[] = [
  {
    id: "TXU-001",
    timestamp: "2025-12-06T10:30:00Z",
    type: "deposit",
    description: "Depósito con tarjeta (final 4242)",
    amount: 500,
    status: "approved",
  },
  {
    id: "TXU-002",
    timestamp: "2025-12-05T18:45:00Z",
    type: "purchase",
    description: "Compra de 5 cartones · Partida #AB12CD",
    amount: -50,
    status: "approved",
  },
  {
    id: "TXU-003",
    timestamp: "2025-12-04T21:12:00Z",
    type: "prize",
    description: "Premio Bingo · Sala \"Noche Retro\"",
    amount: 150,
    status: "approved",
  },
  {
    id: "TXU-004",
    timestamp: "2025-12-03T11:05:00Z",
    type: "withdraw",
    description: "Retiro a cuenta bancaria",
    amount: -200,
    status: "approved",
  },
  {
    id: "TXU-005",
    timestamp: "2025-12-01T15:20:00Z",
    type: "purchase",
    description: "Compra de 10 cartones · Partida #XY98ZT",
    amount: -100,
    status: "approved",
  },
];

export const USER_STATS_OVERVIEW = [
  { label: "Partidas jugadas", value: "152" },
  { label: "Porcentaje de victorias", value: "58.5%" },
  { label: "Créditos ganados", value: "15 400" },
  { label: "Créditos gastados", value: "9 800" },
];

export const USER_STATS_HIGHLIGHTS = [
  { icon: "emoji_events", label: "Mayor premio", value: "2 500 créditos" },
  { icon: "casino", label: "Bingos cantados", value: "95" },
];

export const JOINABLE_GAMES: JoinableGameCard[] = [
  {
    id: "join-001",
    roomName: "Sala Progresiva",
    description: "Pozo garantizado con incrementos cada 10 cartones.",
    creator: "Juan Pérez",
    pot: 125.5,
    price: 1,
    sold: "125 / ∞",
    rewards: "2 premios",
    breakdown: "Línea: 40% · Bingo: 60%",
    actionLabel: "Unirse a la partida",
  },
  {
    id: "join-002",
    roomName: "Noches Retro",
    description: "Partida temática con música y clima chill.",
    creator: "Ana García",
    pot: 45,
    price: 0.5,
    sold: "90 / 200",
    rewards: "3 premios",
    breakdown: "Línea: 20% · Doble: 30% · Bingo: 50%",
    actionLabel: "Comprar cartones",
  },
  {
    id: "join-003",
    roomName: "Bingo Club Prime",
    description: "Cartones limitados, premios altos, solo jugadores verificados.",
    creator: "Bingo Club",
    pot: 278,
    price: 2,
    sold: "139 / ∞",
    rewards: "1 premio",
    breakdown: "Bingo: 100%",
    actionLabel: "Unirse a la partida",
  },
];

export const USER_ROOM_SAMPLE_CARDS = [
  [
    [5, 18, 31, 48, 70],
    [7, 24, 33, 52, 67],
    [12, 20, 0, 58, 73],
    [2, 28, 39, 54, 69],
    [10, 17, 42, 50, 63],
  ],
  [
    [1, 19, 32, 49, 74],
    [11, 26, 38, 55, 68],
    [6, 21, 0, 57, 71],
    [3, 27, 35, 51, 66],
    [15, 22, 44, 59, 62],
  ],
];

export const USER_ROOM_SAMPLE_CHAT = [
  { id: "chat-1", user: "Host", message: "Bienvenidos, la partida inicia en 3 minutos.", time: "10:30" },
  { id: "chat-2", user: "Mamba88", message: "¿Listos para otro pozo progresivo?", time: "10:31" },
  { id: "chat-3", user: "RetroQueen", message: "Ya tengo mis cartones, suerte a todos.", time: "10:32" },
];

export const USER_ROOM_CALLED_NUMBERS = {
  pattern: "Línea Horizontal",
  lastBall: "B-12",
  linePrize: 150,
  bingoPrize: 1000,
  board: {
    B: [1, 2, 3, 4, 5],
    I: [16, 17, 18, 19, 20],
    N: [31, 32, 33, 34, 35],
    G: [46, 47, 48, 49, 50],
    O: [61, 62, 63, 64, 65],
  },
  highlights: new Set([3, 12, 17, 33, 47, 62]),
};
