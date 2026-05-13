import { useState } from 'react';
import { useApp } from '../context/AppContext';
import type { Market, Side } from '../types';

interface Props {
  market: Market;
  onSuccess?: () => void;
}

export function TradeForm({ market, onSuccess }: Props) {
  const { state, dispatch, placeOrder } = useApp();
  const { user, walletCents, charities } = state;

  const [side, setSide] = useState<Side>('yes');
  const [priceCents, setPriceCents] = useState(market.yesPrice);
  const [shares, setShares] = useState(10);
  const [charityId, setCharityId] = useState(charities[0]?.id ?? '');
  const [charityPct, setCharityPct] = useState(5);

  const tradingCents = priceCents * shares;
  const charityCents = Math.round(tradingCents * (charityPct / 100));
  const totalCents = tradingCents + charityCents;
  const maxWinCents = (100 - priceCents) * shares;
  const impliedProb = side === 'yes' ? priceCents : 100 - priceCents;
  const canAfford = totalCents <= walletCents;
  const charity = charities.find((c) => c.id === charityId);

  function handleTrade() {
    if (!user) {
      dispatch({ type: 'OPEN_AUTH', payload: 'login' });
      return;
    }
    placeOrder({ marketId: market.id, side, priceCents, shares, charityId, charityPct });
    onSuccess?.();
  }

  const noPrice = 100 - market.yesPrice;

  return (
    <div className="space-y-4">
      {/* YES / NO selector */}
      <div>
        <p className="label">Your prediction</p>
        <div className="grid grid-cols-2 gap-2">
          {(['yes', 'no'] as Side[]).map((s) => {
            const price = s === 'yes' ? market.yesPrice : noPrice;
            const active = side === s;
            return (
              <button
                key={s}
                onClick={() => { setSide(s); setPriceCents(price); }}
                className={`py-3 rounded-xl font-bold text-sm border-2 transition-all ${
                  active
                    ? s === 'yes'
                      ? 'bg-green-700 text-white border-green-700 shadow-md'
                      : 'bg-red-600 text-white border-red-600 shadow-md'
                    : 'bg-white border-gray-200 text-gray-600 hover:border-gray-400'
                }`}
              >
                <span className="block text-lg">{s === 'yes' ? '✓' : '✗'}</span>
                {s.toUpperCase()}
                <span className="block text-xs font-normal mt-0.5 opacity-80">{price}¢ / share</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Price slider */}
      <div>
        <div className="flex justify-between items-center mb-1">
          <label className="label mb-0">Price per share</label>
          <span className="text-sm font-bold text-green-700">{priceCents}¢</span>
        </div>
        <input
          type="range" min={1} max={99} value={priceCents}
          onChange={(e) => setPriceCents(Number(e.target.value))}
          className="w-full h-2 bg-gray-200 rounded-full appearance-none cursor-pointer accent-green-600"
        />
        <div className="flex justify-between text-xs text-gray-400 mt-1">
          <span>1¢ (1% likely)</span>
          <span className="text-green-700 font-medium">{impliedProb}% implied probability</span>
          <span>99¢ (99% likely)</span>
        </div>
      </div>

      {/* Shares */}
      <div>
        <label className="label">Number of shares</label>
        <div className="flex gap-2">
          <input
            type="number" min={1} max={850} value={shares}
            onChange={(e) => setShares(Math.max(1, Number(e.target.value)))}
            className="input"
          />
          {[5, 10, 25, 50].map((n) => (
            <button
              key={n}
              onClick={() => setShares(n)}
              className={`px-2 py-1 text-xs rounded-lg border font-medium transition-colors ${
                shares === n ? 'bg-green-100 border-green-400 text-green-700' : 'border-gray-200 text-gray-500 hover:border-gray-400'
              }`}
            >
              {n}
            </button>
          ))}
        </div>
      </div>

      {/* Charity selector */}
      <div>
        <label className="label">Donate to charity</label>
        <select
          value={charityId}
          onChange={(e) => setCharityId(e.target.value)}
          className="input"
        >
          {charities.map((c) => (
            <option key={c.id} value={c.id}>{c.emoji} {c.name}</option>
          ))}
        </select>
      </div>

      {/* Charity % slider */}
      <div>
        <div className="flex justify-between items-center mb-1">
          <label className="label mb-0">Charity contribution</label>
          <span className="text-sm font-bold text-green-700">{charityPct}%</span>
        </div>
        <input
          type="range" min={5} max={50} value={charityPct}
          onChange={(e) => setCharityPct(Number(e.target.value))}
          className="w-full h-2 bg-gray-200 rounded-full appearance-none cursor-pointer accent-green-600"
        />
        <div className="flex justify-between text-xs text-gray-400 mt-1">
          <span>5% minimum</span>
          <span>50% max</span>
        </div>
      </div>

      {/* ── Dual-Escrow Breakdown (the patent) ── */}
      <div className="rounded-xl overflow-hidden border border-gray-200">
        <div className="bg-gray-50 px-4 py-2 border-b border-gray-200">
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Cost Breakdown — Dual Escrow</p>
        </div>

        {/* Trading escrow */}
        <div className="px-4 py-3 bg-white flex items-start justify-between gap-3">
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-blue-500 shrink-0" />
              <span className="text-sm font-semibold text-gray-800">Trading Escrow</span>
              <span className="badge bg-blue-100 text-blue-700">Variable</span>
            </div>
            <p className="text-xs text-gray-500 mt-1 ml-4">
              Locked until market resolves. Win ${(maxWinCents / 100).toFixed(2)} profit if {side.toUpperCase()} wins.
            </p>
          </div>
          <span className="text-base font-bold text-gray-800 shrink-0">
            ${(tradingCents / 100).toFixed(2)}
          </span>
        </div>

        {/* Divider */}
        <div className="h-px bg-gray-100 mx-4" />

        {/* Charity escrow */}
        <div className="px-4 py-3 bg-green-50 flex items-start justify-between gap-3">
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-green-600 shrink-0" />
              <span className="text-sm font-semibold text-green-800">Charity Escrow</span>
              <span className="badge bg-green-200 text-green-700">Fixed · Always donated</span>
            </div>
            <p className="text-xs text-green-700 mt-1 ml-4">
              {charity?.emoji} Goes to {charity?.name ?? '—'} upon market resolution, win or lose.
            </p>
          </div>
          <span className="text-base font-bold text-green-700 shrink-0">
            ${(charityCents / 100).toFixed(2)}
          </span>
        </div>

        {/* Total */}
        <div className="px-4 py-3 bg-gray-800 flex items-center justify-between">
          <span className="text-sm font-bold text-white">Total cost</span>
          <span className="text-lg font-extrabold text-white">${(totalCents / 100).toFixed(2)}</span>
        </div>
      </div>

      {/* Max win / CFTC note */}
      <div className="flex gap-3 text-xs">
        <div className="flex-1 bg-blue-50 rounded-lg px-3 py-2">
          <p className="text-blue-500 font-medium">Max potential win</p>
          <p className="text-blue-800 font-bold text-base">${(maxWinCents / 100).toFixed(2)}</p>
        </div>
        <div className="flex-1 bg-amber-50 rounded-lg px-3 py-2">
          <p className="text-amber-600 font-medium">CFTC cap remaining</p>
          <p className="text-amber-800 font-bold text-base">
            ${((market.maxPositionCents - tradingCents) / 100).toFixed(2)}
          </p>
        </div>
      </div>

      {/* Balance warning */}
      {user && !canAfford && (
        <p className="text-sm text-red-600 bg-red-50 rounded-lg px-3 py-2">
          Insufficient balance. You need ${(totalCents / 100).toFixed(2)} but have ${(walletCents / 100).toFixed(2)}.
        </p>
      )}

      {/* CTA */}
      <button
        onClick={handleTrade}
        disabled={!!user && !canAfford}
        className={`w-full py-3.5 rounded-xl font-bold text-sm transition-all shadow-sm ${
          side === 'yes'
            ? 'bg-green-700 hover:bg-green-800 text-white disabled:opacity-40'
            : 'bg-red-600 hover:bg-red-700 text-white disabled:opacity-40'
        }`}
      >
        {!user
          ? 'Sign in to trade'
          : `Buy ${shares} ${side.toUpperCase()} shares — $${(totalCents / 100).toFixed(2)}`}
      </button>

      {!user && (
        <p className="text-center text-xs text-gray-400">
          Charity donation is always included in every trade.
        </p>
      )}
    </div>
  );
}
