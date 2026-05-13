import type { Market, OrderBook, Charity, User, Position, LedgerEntry, RecentTrade } from '../types';

// ── Helpers ──────────────────────────────────────────────────────────────────

function genHistory(start: number, days = 30): number[] {
  const h: number[] = [start];
  for (let i = 1; i < days; i++) {
    const last = h[i - 1];
    const delta = Math.round((Math.random() - 0.48) * 4);
    h.push(Math.max(5, Math.min(95, last + delta)));
  }
  return h;
}

function uid() {
  return Math.random().toString(36).slice(2, 10);
}

// ── Charities ────────────────────────────────────────────────────────────────

export const CHARITIES: Charity[] = [
  {
    id: 'ch-wwf',
    name: 'World Wildlife Fund',
    description: 'Protecting nature and reducing the most pressing threats to the diversity of life on Earth.',
    emoji: '🐼',
  },
  {
    id: 'ch-edf',
    name: 'Environmental Defense Fund',
    description: 'Finding practical solutions to the most serious environmental problems.',
    emoji: '🌿',
  },
  {
    id: 'ch-ra',
    name: 'Rainforest Alliance',
    description: 'Working to conserve biodiversity and ensure sustainable livelihoods.',
    emoji: '🌳',
  },
  {
    id: 'ch-350',
    name: '350.org',
    description: 'Building a global grassroots movement to solve the climate crisis.',
    emoji: '☀️',
  },
  {
    id: 'ch-ocean',
    name: 'Ocean Conservancy',
    description: 'Protecting the ocean from todays greatest global challenges.',
    emoji: '🌊',
  },
];

// ── Markets ──────────────────────────────────────────────────────────────────

export const MARKETS: Market[] = [
  {
    id: 'm-001',
    slug: 'global-temp-1-5c-2026',
    title: 'Will global avg temperature anomaly exceed 1.5°C in 2026?',
    description:
      'Resolves YES if NASA GISS reports the 2026 annual global mean surface temperature anomaly exceeds 1.5°C above the 1951–1980 baseline.',
    category: 'temperature',
    rules:
      'Resolution source: NASA GISS Surface Temperature Analysis annual report published by March 31, 2026. Anomaly must strictly exceed 1.5°C.',
    resolutionDate: '2026-12-31',
    status: 'open',
    maxPositionCents: 85000,
    maxTraders: 5000,
    yesPrice: 68,
    volume24hCents: 184500,
    traderCount: 412,
    priceHistory: genHistory(58),
  },
  {
    id: 'm-002',
    slug: 'colorado-river-shortage-q3',
    title: 'Will the Colorado River Basin hit Tier 2 water shortage in 2026?',
    description:
      'Resolves YES if the US Bureau of Reclamation declares a Tier 2 or higher water shortage condition on the Colorado River for any month in 2026.',
    category: 'water',
    rules:
      'Resolution source: USBR official shortage declaration. Any Tier 2 or Tier 3 declaration in calendar year 2026 resolves YES.',
    resolutionDate: '2026-11-30',
    status: 'open',
    maxPositionCents: 85000,
    maxTraders: 5000,
    yesPrice: 44,
    volume24hCents: 92300,
    traderCount: 287,
    priceHistory: genHistory(38),
  },
  {
    id: 'm-003',
    slug: 'global-food-prices-8pct-2026',
    title: 'Will global food prices rise more than 8% in 2026?',
    description:
      'Resolves YES if the FAO Food Price Index for December 2026 shows a year-over-year increase exceeding 8% compared to December 2024.',
    category: 'food',
    rules:
      'Resolution source: FAO Food Price Index monthly report for December 2026, published by January 31, 2026.',
    resolutionDate: '2026-12-31',
    status: 'open',
    maxPositionCents: 85000,
    maxTraders: 5000,
    yesPrice: 31,
    volume24hCents: 61200,
    traderCount: 198,
    priceHistory: genHistory(35),
  },
  {
    id: 'm-004',
    slug: 'cat5-hurricane-us-landfall-2026',
    title: 'Will a Category 5 hurricane make US landfall in 2026?',
    description:
      'Resolves YES if the National Hurricane Center records any Category 5 storm making landfall on the continental US or US territories during the 2026 Atlantic or Pacific hurricane season.',
    category: 'weather',
    rules:
      'Resolution source: NOAA / NHC post-season analysis. US territories including Puerto Rico and USVI qualify.',
    resolutionDate: '2026-11-30',
    status: 'open',
    maxPositionCents: 85000,
    maxTraders: 5000,
    yesPrice: 22,
    volume24hCents: 47800,
    traderCount: 341,
    priceHistory: genHistory(18),
  },
  {
    id: 'm-005',
    slug: 'arctic-sea-ice-4m-sept-2026',
    title: 'Will Arctic sea ice extent fall below 4M km² in Sept 2026?',
    description:
      'Resolves YES if NSIDC reports a monthly average Arctic sea ice extent below 4.0 million km² for September 2026.',
    category: 'temperature',
    rules:
      'Resolution source: NSIDC Sea Ice Index September 2026 monthly average report.',
    resolutionDate: '2026-09-30',
    status: 'open',
    maxPositionCents: 85000,
    maxTraders: 5000,
    yesPrice: 57,
    volume24hCents: 138900,
    traderCount: 509,
    priceHistory: genHistory(52),
  },
  {
    id: 'm-006',
    slug: 'us-drought-40pct-farmland-2026',
    title: 'Will drought affect more than 40% of US farmland in 2026?',
    description:
      'Resolves YES if the US Drought Monitor reports D1–D4 drought conditions covering more than 40% of US agricultural land for any week in the growing season (April–September 2026).',
    category: 'food',
    rules:
      'Resolution source: USDA/NOAA US Drought Monitor weekly report. Any single week with >40% coverage during April–September 2026.',
    resolutionDate: '2026-09-30',
    status: 'open',
    maxPositionCents: 85000,
    maxTraders: 5000,
    yesPrice: 49,
    volume24hCents: 83400,
    traderCount: 276,
    priceHistory: genHistory(44),
  },
  {
    id: 'm-007',
    slug: 'amazon-deforestation-record-2026',
    title: 'Will Amazon deforestation hit a 15-year high in 2026?',
    description:
      'Resolves YES if Brazil INPE reports annual Amazon deforestation in 2026 exceeding the 10-year rolling high.',
    category: 'weather',
    rules: 'Resolution source: INPE PRODES annual deforestation report for 2026.',
    resolutionDate: '2026-12-31',
    status: 'open',
    maxPositionCents: 85000,
    maxTraders: 5000,
    yesPrice: 38,
    volume24hCents: 29600,
    traderCount: 154,
    priceHistory: genHistory(42),
  },
];

// ── Order Books ───────────────────────────────────────────────────────────────

function genOrderBook(yesPrice: number): OrderBook {
  const bids = Array.from({ length: 6 }, (_, i) => ({
    priceCents: yesPrice - i * 2 - 1,
    shares: Math.round(20 + Math.random() * 180),
  })).filter((e) => e.priceCents > 0);

  const asks = Array.from({ length: 6 }, (_, i) => ({
    priceCents: yesPrice + i * 2 + 1,
    shares: Math.round(20 + Math.random() * 180),
  })).filter((e) => e.priceCents < 100);

  return { bids, asks };
}

export const ORDER_BOOKS: Record<string, OrderBook> = Object.fromEntries(
  MARKETS.map((m) => [m.id, genOrderBook(m.yesPrice)])
);

// ── Recent Trades ─────────────────────────────────────────────────────────────

function genTrades(marketId: string, yesPrice: number): RecentTrade[] {
  const trades: RecentTrade[] = [];
  let price = yesPrice;
  const now = Date.now();
  for (let i = 0; i < 12; i++) {
    price = Math.max(5, Math.min(95, price + Math.round((Math.random() - 0.5) * 4)));
    trades.push({
      id: uid(),
      priceCents: price,
      shares: Math.round(5 + Math.random() * 50),
      side: Math.random() > 0.5 ? 'yes' : 'no',
      ts: now - i * 1000 * 60 * (1 + Math.random() * 20),
    });
  }
  return trades;
}

export const RECENT_TRADES: Record<string, RecentTrade[]> = Object.fromEntries(
  MARKETS.map((m) => [m.id, genTrades(m.id, m.yesPrice)])
);

// ── Demo Users ─────────────────────────────────────────────────────────────────

export const DEMO_USERS: Record<string, User & { password: string }> = {
  'demo@changebids.org': {
    id: 'u-demo',
    email: 'demo@changebids.org',
    fullName: 'Alex Rivera',
    role: 'user',
    kycStatus: 'approved',
    password: 'password',
  },
  'admin@changebids.org': {
    id: 'u-admin',
    email: 'admin@changebids.org',
    fullName: 'ChangeBids Admin',
    role: 'admin',
    kycStatus: 'approved',
    password: 'password',
  },
};

// ── Seed Positions (demo user already has 2 positions) ───────────────────────

export const SEED_POSITIONS: Position[] = [
  {
    id: 'pos-001',
    marketId: 'm-001',
    side: 'yes',
    shares: 25,
    avgCostCents: 62,
    tradingEscrowCents: 25 * 62,
    charityEscrowCents: Math.round(25 * 62 * 0.05),
    charityId: 'ch-wwf',
  },
  {
    id: 'pos-002',
    marketId: 'm-005',
    side: 'yes',
    shares: 15,
    avgCostCents: 54,
    tradingEscrowCents: 15 * 54,
    charityEscrowCents: Math.round(15 * 54 * 0.08),
    charityId: 'ch-350',
  },
];

// ── Seed Ledger ───────────────────────────────────────────────────────────────

export const SEED_LEDGER: LedgerEntry[] = [
  {
    id: 'l-001',
    type: 'deposit',
    amountCents: 50000,
    description: 'Initial deposit (net of 2% fee)',
    ts: Date.now() - 1000 * 60 * 60 * 48,
  },
  {
    id: 'l-002',
    type: 'order_lock',
    amountCents: -(25 * 62 + Math.round(25 * 62 * 0.05)),
    description: 'Buy 25 YES shares @ 62¢ + 5% charity (WWF)',
    ts: Date.now() - 1000 * 60 * 60 * 36,
  },
  {
    id: 'l-003',
    type: 'order_lock',
    amountCents: -(15 * 54 + Math.round(15 * 54 * 0.08)),
    description: 'Buy 15 YES shares @ 54¢ + 8% charity (350.org)',
    ts: Date.now() - 1000 * 60 * 60 * 12,
  },
];
