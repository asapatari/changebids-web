export type MarketCategory = 'temperature' | 'water' | 'food' | 'weather';
export type MarketStatus = 'open' | 'resolved' | 'cancelled';
export type Side = 'yes' | 'no';

export interface Market {
  id: string;
  slug: string;
  title: string;
  description: string;
  category: MarketCategory;
  rules: string;
  resolutionDate: string;
  status: MarketStatus;
  resolvedOutcome?: Side;
  maxPositionCents: number;
  maxTraders: number;
  yesPrice: number; // cents 1-99
  volume24hCents: number;
  traderCount: number;
  priceHistory: number[]; // daily YES price closes, cents
}

export interface OrderBookEntry {
  priceCents: number;
  shares: number;
}

export interface OrderBook {
  bids: OrderBookEntry[]; // buy YES
  asks: OrderBookEntry[]; // sell YES
}

export interface RecentTrade {
  id: string;
  priceCents: number;
  shares: number;
  side: Side;
  ts: number;
}

export interface Position {
  id: string;
  marketId: string;
  side: Side;
  shares: number;
  avgCostCents: number;
  tradingEscrowCents: number;
  charityEscrowCents: number;
  charityId: string;
}

export interface Charity {
  id: string;
  name: string;
  description: string;
  emoji: string;
}

export interface User {
  id: string;
  email: string;
  fullName: string;
  role: 'user' | 'admin';
  kycStatus: 'pending' | 'approved';
}

export interface LedgerEntry {
  id: string;
  type: 'deposit' | 'order_lock' | 'payout' | 'fee' | 'withdrawal' | 'admin';
  amountCents: number;
  description: string;
  ts: number;
}

export interface AppState {
  user: User | null;
  walletCents: number;
  positions: Position[];
  markets: Market[];
  orderBooks: Record<string, OrderBook>;
  recentTrades: Record<string, RecentTrade[]>;
  ledger: LedgerEntry[];
  charities: Charity[];
  authModal: 'login' | 'register' | null;
  notification: { msg: string; kind: 'success' | 'error' } | null;
}

export interface PlaceOrderPayload {
  marketId: string;
  side: Side;
  priceCents: number;
  shares: number;
  charityId: string;
  charityPct: number;
}

export type AppAction =
  | { type: 'OPEN_AUTH'; payload: 'login' | 'register' }
  | { type: 'CLOSE_AUTH' }
  | { type: 'LOGIN'; payload: User }
  | { type: 'LOGOUT' }
  | { type: 'DEPOSIT'; payload: number }
  | { type: 'PLACE_ORDER'; payload: PlaceOrderPayload }
  | { type: 'RESOLVE_MARKET'; payload: { marketId: string; outcome: Side } }
  | { type: 'ADD_MARKET'; payload: Pick<Market, 'title' | 'description' | 'category' | 'rules' | 'resolutionDate'> }
  | { type: 'TICK_PRICES' }
  | { type: 'NOTIFY'; payload: { msg: string; kind: 'success' | 'error' } }
  | { type: 'CLEAR_NOTIFY' };
