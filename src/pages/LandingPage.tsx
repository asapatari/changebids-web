import { Link } from 'react-router-dom';
import { useApp } from '../context/AppContext';

const STATS = [
  { label: 'Active Markets', value: '7', emoji: '📊' },
  { label: 'Charity Partners', value: '5', emoji: '🤝' },
  { label: 'Min. Donation', value: '5%', emoji: '💚' },
  { label: 'Patent Pending', value: 'USPTO', emoji: '⚖️' },
];

const HOW_IT_WORKS = [
  {
    step: '01',
    title: 'Pick any prediction market',
    desc: 'Browse markets spanning environment, society, economics, and current events. Each market poses a specific, verifiable yes-or-no question with a clear resolution date.',
    emoji: '🎯',
  },
  {
    step: '02',
    title: 'Your trade includes a mandatory donation',
    desc: 'Every trade splits into two escrow accounts: a variable trading escrow (wins or loses on the outcome) and a fixed charity escrow that is always donated to your chosen organization — no matter what.',
    emoji: '⚖️',
  },
  {
    step: '03',
    title: 'Outcome resolves. Charity always wins.',
    desc: 'When the market resolves, winners collect their payout. But every single participant — winners and losers alike — has already made their charitable contribution. Giving is guaranteed.',
    emoji: '💚',
  },
];

const CATEGORIES = [
  { label: 'Environment', slug: 'temperature', emoji: '🌍', color: 'bg-green-50 text-green-700 border-green-100' },
  { label: 'Society', slug: 'water', emoji: '🤝', color: 'bg-blue-50 text-blue-700 border-blue-100' },
  { label: 'Economy', slug: 'food', emoji: '💹', color: 'bg-yellow-50 text-yellow-700 border-yellow-100' },
  { label: 'Events', slug: 'weather', emoji: '🗓️', color: 'bg-purple-50 text-purple-700 border-purple-100' },
];

export function LandingPage() {
  const { dispatch } = useApp();

  return (
    <div className="min-h-screen">
      {/* Hero */}
      <section className="bg-gradient-to-br from-green-900 via-green-800 to-green-700 text-white pt-16 pb-24 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 bg-green-700/60 border border-green-600/40 rounded-full px-4 py-1.5 text-sm text-green-200 mb-6">
            <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
            7 prediction markets live · Patent pending technology
          </div>

          <h1 className="text-4xl md:text-5xl font-extrabold leading-tight mb-4">
            The prediction market that
            <br />
            <span className="text-green-300">forces giving. Every time.</span>
          </h1>

          <p className="text-green-200 text-lg max-w-2xl mx-auto mb-8">
            ChangeBids is the only prediction market where a charitable donation is mandatory on every
            single trade. The moment you place a bet, your donation is locked in for your chosen charity —
            win or lose, your contribution always goes through.
          </p>

          <div className="flex flex-wrap gap-3 justify-center">
            <Link
              to="/markets"
              className="bg-white text-green-800 font-bold px-6 py-3 rounded-xl hover:bg-green-50 transition-colors shadow-lg"
            >
              Browse Markets →
            </Link>
            <button
              onClick={() => dispatch({ type: 'OPEN_AUTH', payload: 'register' })}
              className="bg-green-600/40 border border-green-500/40 text-white font-bold px-6 py-3 rounded-xl hover:bg-green-600/60 transition-colors"
            >
              Create free account
            </button>
          </div>
        </div>

        {/* Stats bar */}
        <div className="max-w-3xl mx-auto mt-14 grid grid-cols-2 md:grid-cols-4 gap-3">
          {STATS.map((s) => (
            <div key={s.label} className="bg-green-800/50 border border-green-700/30 rounded-xl p-4 text-center">
              <div className="text-2xl mb-1">{s.emoji}</div>
              <div className="text-xl font-extrabold text-white">{s.value}</div>
              <div className="text-xs text-green-300">{s.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Categories */}
      <section className="bg-white py-10 px-4 border-b border-gray-100">
        <div className="max-w-4xl mx-auto">
          <p className="text-center text-xs font-semibold text-gray-400 uppercase tracking-widest mb-4">Browse by category</p>
          <div className="flex flex-wrap justify-center gap-3">
            {CATEGORIES.map((c) => (
              <Link
                key={c.label}
                to={`/markets?category=${c.slug}`}
                className={`flex items-center gap-2 px-4 py-2 rounded-full border font-medium text-sm transition-all hover:scale-105 ${c.color}`}
              >
                <span>{c.emoji}</span>
                {c.label}
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="py-16 px-4">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-2xl font-bold text-center text-gray-800 mb-2">How ChangeBids works</h2>
          <p className="text-center text-gray-500 mb-12">The world's first prediction market where charitable giving is mandatory, not optional.</p>
          <div className="grid md:grid-cols-3 gap-8">
            {HOW_IT_WORKS.map((step) => (
              <div key={step.step} className="text-center">
                <div className="w-14 h-14 bg-green-100 rounded-2xl flex items-center justify-center text-2xl mx-auto mb-4">
                  {step.emoji}
                </div>
                <div className="text-xs font-bold text-green-600 tracking-widest mb-2">STEP {step.step}</div>
                <h3 className="font-bold text-gray-800 mb-2">{step.title}</h3>
                <p className="text-gray-500 text-sm leading-relaxed">{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Dual Escrow explainer */}
      <section className="py-16 px-4 bg-gray-50 border-y border-gray-100">
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-10">
            <span className="badge bg-green-100 text-green-700 text-xs mb-3">Utility Patent Pending — USPTO #63/187283</span>
            <h2 className="text-2xl font-bold text-gray-800 mt-2">The Dual-Escrow Architecture</h2>
            <p className="text-gray-500 mt-2 text-sm">Every trade splits into two distinct accounts. One is yours to win or lose. The other always goes to charity.</p>
          </div>

          <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
            {/* Example trade */}
            <div className="px-6 py-4 bg-gray-800 text-white">
              <p className="text-sm text-gray-300">Example: Buy <span className="font-bold text-white">10 YES shares @ 65¢</span></p>
            </div>

            <div className="grid md:grid-cols-2 divide-y md:divide-y-0 md:divide-x divide-gray-100">
              {/* Trading escrow */}
              <div className="p-6">
                <div className="flex items-center gap-2 mb-3">
                  <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center text-base">💹</div>
                  <div>
                    <p className="font-bold text-gray-800 text-sm">Trading Escrow</p>
                    <span className="badge bg-blue-100 text-blue-600 text-xs">Variable</span>
                  </div>
                </div>
                <p className="text-3xl font-extrabold text-gray-800 mb-1">$6.50</p>
                <p className="text-sm text-gray-500">10 shares × 65¢</p>
                <div className="mt-4 space-y-2 text-xs">
                  <div className="flex items-center gap-2 text-green-700 bg-green-50 rounded-lg px-3 py-2">
                    <span>✓</span> If YES wins: receive $10.00 (profit $3.50, minus 10% fee)
                  </div>
                  <div className="flex items-center gap-2 text-red-600 bg-red-50 rounded-lg px-3 py-2">
                    <span>✗</span> If NO wins: lose $6.50
                  </div>
                </div>
              </div>

              {/* Charity escrow */}
              <div className="p-6 bg-green-50">
                <div className="flex items-center gap-2 mb-3">
                  <div className="w-8 h-8 bg-green-200 rounded-lg flex items-center justify-center text-base">🌱</div>
                  <div>
                    <p className="font-bold text-green-800 text-sm">Charity Escrow</p>
                    <span className="badge bg-green-200 text-green-700 text-xs">Fixed · Always donated</span>
                  </div>
                </div>
                <p className="text-3xl font-extrabold text-green-700 mb-1">$0.33</p>
                <p className="text-sm text-green-600">5% of $6.50 trade cost</p>
                <div className="mt-4 space-y-2 text-xs">
                  <div className="flex items-center gap-2 text-green-700 bg-green-100 rounded-lg px-3 py-2">
                    <span>✓</span> If YES wins: $0.33 donated to charity
                  </div>
                  <div className="flex items-center gap-2 text-green-700 bg-green-100 rounded-lg px-3 py-2">
                    <span>✓</span> If NO wins: $0.33 still donated to charity
                  </div>
                </div>
              </div>
            </div>

            <div className="px-6 py-3 bg-green-700 text-white text-sm font-medium text-center">
              Your charity contribution is <strong>always made</strong> — it is never at risk in the market.
            </div>
          </div>
        </div>
      </section>

      {/* Why ChangeBids */}
      <section className="py-12 px-4 text-center">
        <div className="max-w-2xl mx-auto">
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-3">Why it matters</p>
          <h2 className="text-xl font-bold text-gray-800 mb-3">
            Prediction markets are powerful. Charity should be too.
          </h2>
          <p className="text-gray-500 text-sm mb-6">
            Existing prediction markets let users profit from their knowledge — but the gains stay with the individual.
            ChangeBids introduces a simple, patented mechanism that compels every participant to direct a portion of
            every trade to a cause they care about. It transforms speculative markets into a force for social good,
            without removing the competitive incentive that makes them accurate.
          </p>
          <Link
            to="/markets"
            className="btn-primary inline-block"
          >
            Explore live markets →
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-gray-100 py-8 px-4 text-center text-sm text-gray-400">
        <p className="font-medium text-gray-600 mb-1">🌿 ChangeBids Platform Inc.</p>
        <p>Non-profit prediction market · Patent Pending USPTO #63/187283 · ari@changebids.org</p>
        <p className="mt-2 text-xs">
          ChangeBids follows the CFTC research market model. $850 position cap per market · 5,000 trader limit.
        </p>
      </footer>
    </div>
  );
}
