import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';

export function PortfolioPage() {
  const { state, dispatch } = useApp();
  const navigate = useNavigate();
  const { user, walletCents, positions, ledger, charities, markets } = state;
  const [depositAmt, setDepositAmt] = useState('');
  const [showDeposit, setShowDeposit] = useState(false);

  if (!user) {
    return (
      <div className="max-w-md mx-auto px-4 py-20 text-center">
        <p className="text-3xl mb-3">🔒</p>
        <h2 className="text-xl font-bold text-gray-700 mb-2">Sign in to view your portfolio</h2>
        <button onClick={() => dispatch({ type: 'OPEN_AUTH', payload: 'login' })} className="btn-primary mt-2">
          Sign in
        </button>
      </div>
    );
  }

  // Aggregate stats
  const totalTradingEscrow = positions.reduce((s, p) => s + p.tradingEscrowCents, 0);
  const totalCharityEscrow = positions.reduce((s, p) => s + p.charityEscrowCents, 0);

  const positionsWithMarket = positions.map((pos) => {
    const market = markets.find((m) => m.id === pos.marketId);
    const currentPrice = market ? (pos.side === 'yes' ? market.yesPrice : 100 - market.yesPrice) : pos.avgCostCents;
    const currentValue = currentPrice * pos.shares;
    const pnlCents = currentValue - pos.tradingEscrowCents;
    const charity = charities.find((c) => c.id === pos.charityId);
    return { ...pos, market, currentPrice, currentValue, pnlCents, charity };
  });

  const totalPnl = positionsWithMarket.reduce((s, p) => s + p.pnlCents, 0);
  const totalPortfolio = walletCents + totalTradingEscrow + totalCharityEscrow;

  function handleDeposit() {
    const cents = Math.round(parseFloat(depositAmt) * 100);
    if (isNaN(cents) || cents < 100) {
      dispatch({ type: 'NOTIFY', payload: { msg: 'Minimum deposit is $1.00', kind: 'error' } });
      return;
    }
    dispatch({ type: 'DEPOSIT', payload: cents });
    setDepositAmt('');
    setShowDeposit(false);
  }

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Portfolio</h1>
          <p className="text-gray-500 text-sm mt-0.5">Welcome back, {user.fullName.split(' ')[0]}</p>
        </div>
        <button onClick={() => setShowDeposit(!showDeposit)} className="btn-primary">
          + Deposit
        </button>
      </div>

      {/* Deposit panel */}
      {showDeposit && (
        <div className="card p-5 mb-5 border-green-200 bg-green-50/50">
          <p className="text-sm font-bold text-green-800 mb-3">Deposit Funds</p>
          <p className="text-xs text-green-700 mb-3">
            A 2% deposit fee applies (ChangeBids fee structure). Your net balance will reflect the amount after the fee.
          </p>
          <div className="flex gap-2">
            <div className="relative flex-1">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">$</span>
              <input
                type="number" step="0.01" min="1"
                className="input pl-7"
                placeholder="50.00"
                value={depositAmt}
                onChange={(e) => setDepositAmt(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleDeposit()}
              />
            </div>
            {['10', '25', '50', '100'].map((n) => (
              <button key={n} onClick={() => setDepositAmt(n)}
                className="px-3 py-2 text-sm border border-gray-200 rounded-lg hover:bg-white font-medium text-gray-600">
                ${n}
              </button>
            ))}
            <button onClick={handleDeposit} className="btn-primary shrink-0">Deposit</button>
          </div>
        </div>
      )}

      {/* Summary stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-8">
        <div className="card p-4">
          <p className="text-xs text-gray-400 font-medium mb-1">Available Balance</p>
          <p className="text-2xl font-extrabold text-gray-800">${(walletCents / 100).toFixed(2)}</p>
        </div>
        <div className="card p-4 border-blue-100">
          <p className="text-xs text-blue-500 font-medium mb-1">Trading Escrow</p>
          <p className="text-2xl font-extrabold text-blue-700">${(totalTradingEscrow / 100).toFixed(2)}</p>
        </div>
        <div className="card p-4 border-green-200 bg-green-50/40">
          <p className="text-xs text-green-600 font-medium mb-1">Charity Escrow</p>
          <p className="text-2xl font-extrabold text-green-700">${(totalCharityEscrow / 100).toFixed(2)}</p>
          <p className="text-xs text-green-500 mt-0.5">Always donated</p>
        </div>
        <div className="card p-4">
          <p className="text-xs text-gray-400 font-medium mb-1">Unrealized P&L</p>
          <p className={`text-2xl font-extrabold ${totalPnl >= 0 ? 'text-green-700' : 'text-red-600'}`}>
            {totalPnl >= 0 ? '+' : ''}${(totalPnl / 100).toFixed(2)}
          </p>
        </div>
      </div>

      {/* Active positions */}
      <div className="mb-8">
        <h2 className="text-base font-bold text-gray-800 mb-3">Active Positions</h2>

        {positionsWithMarket.length === 0 ? (
          <div className="card p-8 text-center text-gray-400">
            <p className="text-2xl mb-2">📭</p>
            <p className="font-medium">No positions yet.</p>
            <Link to="/markets" className="btn-primary inline-block mt-3 text-sm">
              Browse markets →
            </Link>
          </div>
        ) : (
          <div className="space-y-3">
            {positionsWithMarket.map((pos) => (
              <div
                key={pos.id}
                onClick={() => pos.market && navigate(`/markets/${pos.market.id}`)}
                className="card p-5 cursor-pointer hover:border-green-300 hover:shadow-md transition-all"
              >
                <div className="flex items-start justify-between gap-3 mb-4">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-gray-800 leading-snug truncate">
                      {pos.market?.title ?? 'Unknown Market'}
                    </p>
                    <div className="flex gap-2 mt-1">
                      <span className={`badge font-bold ${pos.side === 'yes' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-600'}`}>
                        {pos.side.toUpperCase()}
                      </span>
                      <span className="text-xs text-gray-400">{pos.shares} shares @ {pos.avgCostCents}¢ avg</span>
                    </div>
                  </div>
                  <div className="text-right shrink-0">
                    <p className="text-sm font-bold text-gray-800">${(pos.currentValue / 100).toFixed(2)}</p>
                    <p className={`text-xs font-semibold ${pos.pnlCents >= 0 ? 'text-green-600' : 'text-red-500'}`}>
                      {pos.pnlCents >= 0 ? '+' : ''}${(pos.pnlCents / 100).toFixed(2)} P&L
                    </p>
                  </div>
                </div>

                {/* Dual escrow visual */}
                <div className="grid grid-cols-2 gap-2">
                  <div className="bg-blue-50 rounded-lg px-3 py-2">
                    <div className="flex justify-between items-center">
                      <span className="text-xs text-blue-500 font-medium">💹 Trading Escrow</span>
                      <span className="text-sm font-bold text-blue-700">
                        ${(pos.tradingEscrowCents / 100).toFixed(2)}
                      </span>
                    </div>
                    <div className="text-xs text-blue-400 mt-0.5">Current: {pos.currentPrice}¢/sh</div>
                  </div>
                  <div className="bg-green-50 rounded-lg px-3 py-2">
                    <div className="flex justify-between items-center">
                      <span className="text-xs text-green-600 font-medium">🌱 Charity Escrow</span>
                      <span className="text-sm font-bold text-green-700">
                        ${(pos.charityEscrowCents / 100).toFixed(2)}
                      </span>
                    </div>
                    <div className="text-xs text-green-500 mt-0.5">
                      {pos.charity?.emoji} {pos.charity?.name ?? '—'}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Ledger */}
      <div>
        <h2 className="text-base font-bold text-gray-800 mb-3">Transaction History</h2>
        <div className="card overflow-hidden">
          {ledger.length === 0 ? (
            <p className="text-center py-6 text-gray-400 text-sm">No transactions yet.</p>
          ) : (
            <div className="divide-y divide-gray-50">
              {ledger.map((entry) => {
                const isCredit = entry.amountCents > 0;
                const typeColors: Record<string, string> = {
                  deposit: 'text-green-700 bg-green-50',
                  order_lock: 'text-blue-600 bg-blue-50',
                  payout: 'text-green-700 bg-green-50',
                  fee: 'text-orange-600 bg-orange-50',
                  admin: 'text-gray-500 bg-gray-50',
                };
                const colorClass = typeColors[entry.type] ?? 'text-gray-600 bg-gray-50';

                return (
                  <div key={entry.id} className="flex items-center justify-between gap-3 px-4 py-3">
                    <div className="flex items-center gap-3">
                      <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${colorClass}`}>
                        {entry.type.replace('_', ' ')}
                      </span>
                      <span className="text-sm text-gray-600">{entry.description}</span>
                    </div>
                    <div className="text-right shrink-0">
                      {entry.amountCents !== 0 && (
                        <p className={`text-sm font-bold ${isCredit ? 'text-green-700' : 'text-gray-600'}`}>
                          {isCredit ? '+' : ''}${(Math.abs(entry.amountCents) / 100).toFixed(2)}
                        </p>
                      )}
                      <p className="text-xs text-gray-300">
                        {new Date(entry.ts).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
