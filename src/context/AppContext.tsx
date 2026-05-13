import React, { createContext, useContext, useReducer, useEffect, useCallback } from 'react';
import type { AppState, AppAction, PlaceOrderPayload, Side } from '../types';
import {
  MARKETS, ORDER_BOOKS, RECENT_TRADES, CHARITIES, DEMO_USERS,
  SEED_POSITIONS, SEED_LEDGER,
} from '../data/mockData';

// ── Initial State ─────────────────────────────────────────────────────────────

const DEMO_USER_WALLET_CENTS = 50000 - (25 * 62 + Math.round(25 * 62 * 0.05)) - (15 * 54 + Math.round(15 * 54 * 0.08));

const INITIAL_STATE: AppState = {
  user: null,
  walletCents: 0,
  positions: [],
  markets: MARKETS,
  orderBooks: ORDER_BOOKS,
  recentTrades: RECENT_TRADES,
  ledger: [],
  charities: CHARITIES,
  authModal: null,
  notification: null,
};

// ── Helpers ───────────────────────────────────────────────────────────────────

let _nextId = 1000;
function uid() { return `id-${_nextId++}`; }

function clamp(v: number, lo: number, hi: number) { return Math.max(lo, Math.min(hi, v)); }

// ── Reducer ───────────────────────────────────────────────────────────────────

function reducer(state: AppState, action: AppAction): AppState {
  switch (action.type) {

    case 'OPEN_AUTH':
      return { ...state, authModal: action.payload };

    case 'CLOSE_AUTH':
      return { ...state, authModal: null };

    case 'LOGIN': {
      const isDemo = action.payload.id === 'u-demo';
      return {
        ...state,
        user: action.payload,
        walletCents: isDemo ? DEMO_USER_WALLET_CENTS : 100000,
        positions: isDemo ? SEED_POSITIONS : [],
        ledger: isDemo ? SEED_LEDGER : [],
        authModal: null,
      };
    }

    case 'LOGOUT':
      return {
        ...INITIAL_STATE,
        markets: state.markets,
        orderBooks: state.orderBooks,
        recentTrades: state.recentTrades,
        charities: state.charities,
      };

    case 'DEPOSIT': {
      const gross = action.payload;
      const fee = Math.round(gross * 0.02);
      const net = gross - fee;
      return {
        ...state,
        walletCents: state.walletCents + net,
        ledger: [
          {
            id: uid(),
            type: 'deposit',
            amountCents: net,
            description: `Deposit $${(gross / 100).toFixed(2)} (net of 2% fee)`,
            ts: Date.now(),
          },
          ...state.ledger,
        ],
        notification: { msg: `Deposited $${(net / 100).toFixed(2)} (after 2% fee)`, kind: 'success' },
      };
    }

    case 'PLACE_ORDER': {
      const p: PlaceOrderPayload = action.payload;
      const tradingCents = p.priceCents * p.shares;
      const charityCents = Math.round(tradingCents * (p.charityPct / 100));
      const totalCost = tradingCents + charityCents;

      if (totalCost > state.walletCents) {
        return { ...state, notification: { msg: 'Insufficient wallet balance.', kind: 'error' } };
      }

      // Check $850 CFTC cap
      const existingExposure = state.positions
        .filter((pos) => pos.marketId === p.marketId)
        .reduce((sum, pos) => sum + pos.tradingEscrowCents, 0);
      const market = state.markets.find((m) => m.id === p.marketId);
      if (!market) return state;
      if (existingExposure + tradingCents > market.maxPositionCents) {
        return {
          ...state,
          notification: { msg: `Position would exceed $850 CFTC cap for this market.`, kind: 'error' },
        };
      }

      // Update or create position
      const existingPos = state.positions.find(
        (pos) => pos.marketId === p.marketId && pos.side === p.side
      );
      let newPositions;
      if (existingPos) {
        const newShares = existingPos.shares + p.shares;
        const newTrading = existingPos.tradingEscrowCents + tradingCents;
        const newCharity = existingPos.charityEscrowCents + charityCents;
        newPositions = state.positions.map((pos) =>
          pos.id === existingPos.id
            ? {
                ...pos,
                shares: newShares,
                avgCostCents: Math.round(newTrading / newShares),
                tradingEscrowCents: newTrading,
                charityEscrowCents: newCharity,
              }
            : pos
        );
      } else {
        newPositions = [
          ...state.positions,
          {
            id: uid(),
            marketId: p.marketId,
            side: p.side,
            shares: p.shares,
            avgCostCents: p.priceCents,
            tradingEscrowCents: tradingCents,
            charityEscrowCents: charityCents,
            charityId: p.charityId,
          },
        ];
      }

      // Add trade to recent trades
      const newTrade = {
        id: uid(),
        priceCents: p.priceCents,
        shares: p.shares,
        side: p.side,
        ts: Date.now(),
      };

      // Nudge price based on side (simulated market impact)
      const nudge = p.side === 'yes' ? Math.round(p.shares / 20) : -Math.round(p.shares / 20);
      const newMarkets = state.markets.map((m) =>
        m.id === p.marketId
          ? {
              ...m,
              yesPrice: clamp(m.yesPrice + nudge, 3, 97),
              volume24hCents: m.volume24hCents + tradingCents,
              traderCount: existingPos ? m.traderCount : m.traderCount + 1,
            }
          : m
      );

      const charityName = CHARITIES.find((c) => c.id === p.charityId)?.name ?? '';
      return {
        ...state,
        walletCents: state.walletCents - totalCost,
        positions: newPositions,
        markets: newMarkets,
        recentTrades: {
          ...state.recentTrades,
          [p.marketId]: [newTrade, ...(state.recentTrades[p.marketId] ?? []).slice(0, 19)],
        },
        ledger: [
          {
            id: uid(),
            type: 'order_lock',
            amountCents: -totalCost,
            description: `Buy ${p.shares} ${p.side.toUpperCase()} @ ${p.priceCents}¢ + ${p.charityPct}% charity (${charityName})`,
            ts: Date.now(),
          },
          ...state.ledger,
        ],
        notification: {
          msg: `Order placed! ${p.shares} ${p.side.toUpperCase()} shares. $${(charityCents / 100).toFixed(2)} locked for ${charityName}.`,
          kind: 'success',
        },
      };
    }

    case 'RESOLVE_MARKET': {
      const { marketId, outcome } = action.payload;
      const userPositions = state.positions.filter((p) => p.marketId === marketId);
      let walletDelta = 0;
      const newLedger = [...state.ledger];

      for (const pos of userPositions) {
        const isWinner = pos.side === outcome;
        if (isWinner) {
          const grossPayout = pos.shares * 100;
          const grossProfit = grossPayout - pos.tradingEscrowCents;
          const profitFee = Math.round(grossProfit * 0.10);
          const netPayout = grossPayout - profitFee;
          walletDelta += netPayout;
          newLedger.unshift({
            id: uid(),
            type: 'payout',
            amountCents: netPayout,
            description: `Won ${pos.shares} ${pos.side.toUpperCase()} shares (market resolved ${outcome.toUpperCase()})`,
            ts: Date.now(),
          });
          if (profitFee > 0) {
            newLedger.unshift({
              id: uid(),
              type: 'fee',
              amountCents: -profitFee,
              description: `10% profit fee`,
              ts: Date.now(),
            });
            walletDelta -= profitFee;
          }
        }
        // Charity escrow always disbursed
        const charityName = CHARITIES.find((c) => c.id === pos.charityId)?.name ?? 'charity';
        newLedger.unshift({
          id: uid(),
          type: 'admin',
          amountCents: 0,
          description: `$${(pos.charityEscrowCents / 100).toFixed(2)} charity escrow disbursed to ${charityName}`,
          ts: Date.now(),
        });
      }

      const resolvedMarket = state.markets.find((m) => m.id === marketId);
      const msg = resolvedMarket
        ? `"${resolvedMarket.title.slice(0, 40)}…" resolved ${outcome.toUpperCase()}.${walletDelta > 0 ? ` You won $${(walletDelta / 100).toFixed(2)}!` : ''}`
        : `Market resolved ${outcome.toUpperCase()}.`;

      return {
        ...state,
        markets: state.markets.map((m) =>
          m.id === marketId ? { ...m, status: 'resolved', resolvedOutcome: outcome } : m
        ),
        positions: state.positions.filter((p) => p.marketId !== marketId),
        walletCents: state.walletCents + walletDelta,
        ledger: newLedger,
        notification: { msg, kind: 'success' },
      };
    }

    case 'ADD_MARKET': {
      const { title, description, category, rules, resolutionDate } = action.payload;
      const slug = title.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '').slice(0, 60);
      const newMarket = {
        id: uid(),
        slug,
        title, description, category, rules, resolutionDate,
        status: 'open' as const,
        maxPositionCents: 85000,
        maxTraders: 5000,
        yesPrice: 50,
        volume24hCents: 0,
        traderCount: 0,
        priceHistory: [50],
      };
      return {
        ...state,
        markets: [...state.markets, newMarket],
        orderBooks: { ...state.orderBooks, [newMarket.id]: { bids: [], asks: [] } },
        recentTrades: { ...state.recentTrades, [newMarket.id]: [] },
        notification: { msg: `New market created: "${title.slice(0, 40)}"`, kind: 'success' },
      };
    }

    case 'TICK_PRICES': {
      const newMarkets = state.markets.map((m) => {
        if (m.status !== 'open') return m;
        const delta = Math.round((Math.random() - 0.5) * 3);
        const newPrice = clamp(m.yesPrice + delta, 3, 97);
        return {
          ...m,
          yesPrice: newPrice,
          priceHistory: [...m.priceHistory.slice(-59), newPrice],
        };
      });
      // Also nudge order books slightly
      const newBooks = { ...state.orderBooks };
      for (const m of newMarkets) {
        if (m.status !== 'open') continue;
        const ob = state.orderBooks[m.id];
        if (!ob) continue;
        newBooks[m.id] = {
          bids: ob.bids.map((b) => ({ ...b, priceCents: clamp(b.priceCents + (Math.random() > 0.7 ? 1 : 0), 1, 98) })),
          asks: ob.asks.map((a) => ({ ...a, priceCents: clamp(a.priceCents + (Math.random() > 0.7 ? -1 : 0), 2, 99) })),
        };
      }
      return { ...state, markets: newMarkets, orderBooks: newBooks };
    }

    case 'NOTIFY':
      return { ...state, notification: action.payload };

    case 'CLEAR_NOTIFY':
      return { ...state, notification: null };

    default:
      return state;
  }
}

// ── Context ───────────────────────────────────────────────────────────────────

interface AppContextValue {
  state: AppState;
  dispatch: React.Dispatch<AppAction>;
  login: (email: string, password: string) => boolean;
  placeOrder: (p: PlaceOrderPayload) => void;
}

const AppContext = createContext<AppContextValue | null>(null);

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(reducer, INITIAL_STATE);

  // Simulate live price ticks every 4 seconds
  useEffect(() => {
    const id = setInterval(() => dispatch({ type: 'TICK_PRICES' }), 4000);
    return () => clearInterval(id);
  }, []);

  // Auto-clear notifications after 4 seconds
  useEffect(() => {
    if (!state.notification) return;
    const id = setTimeout(() => dispatch({ type: 'CLEAR_NOTIFY' }), 4000);
    return () => clearTimeout(id);
  }, [state.notification]);

  const login = useCallback((email: string, password: string): boolean => {
    const found = DEMO_USERS[email.toLowerCase()];
    if (!found || found.password !== password) return false;
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { password: _, ...user } = found;
    dispatch({ type: 'LOGIN', payload: user });
    return true;
  }, []);

  const placeOrder = useCallback((p: PlaceOrderPayload) => {
    dispatch({ type: 'PLACE_ORDER', payload: p });
  }, []);

  return (
    <AppContext.Provider value={{ state, dispatch, login, placeOrder }}>
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used inside AppProvider');
  return ctx;
}
