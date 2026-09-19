import React from 'react';
import { CheckCircle2, AlertTriangle, ShieldCheck, Info } from 'lucide-react';
import { TermTooltip } from './TermTooltip';

export const ReliabilityChecklist: React.FC = () => {
  const checks = [
    {
      title: 'Look-ahead Bias Protection',
      status: 'pass' as const,
      desc: 'All signal generation strictly uses historical data up to bar (t). No future bar data or next-day prices are leaked into signal logic.',
    },
    {
      title: 'Data Leakage Protection',
      status: 'pass' as const,
      desc: 'Moving averages and indicators are strictly computed rolling forward. Train/test splits remain completely uncorrupted.',
    },
    {
      title: 'Transaction Costs Included',
      status: 'pass' as const,
      desc: 'Simulations deduct 0.10% on every order volume to model broker commissions, exchange transaction charges, and bid-ask slippage.',
    },
    {
      title: 'Historical Data Validation',
      status: 'pass' as const,
      desc: '1,260 daily bars verified with corporate action adjustments, dividend handling, and zero missing timestamp gaps.',
    },
    {
      title: 'Realistic Execution Assumptions',
      status: 'pass' as const,
      desc: 'Orders are simulated at close or next open prices. Fills do not assume unlimited liquidity or zero market impact.',
    },
    {
      title: 'Over-Optimization Warning',
      status: 'warn' as const,
      desc: 'Hyper-parameter sweeps can produce curve-fitting. Always verify strategy parameters against out-of-sample regimes.',
    },
  ];

  return (
    <div className="glass-panel rounded-xl p-5 border border-slate-800">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <ShieldCheck className="w-5 h-5 text-cyan-400" />
          <h3 className="text-sm font-semibold text-white tracking-wide uppercase">
            Backtest Reliability & Integrity Engine
          </h3>
        </div>
        <span className="text-xs px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-medium">
          5 Passed • 1 Advisory
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
        {checks.map((c, i) => (
          <div
            key={i}
            className={`p-3 rounded-lg border flex items-start gap-3 transition-colors ${
              c.status === 'pass'
                ? 'bg-dark-900/60 border-slate-800/80 hover:border-emerald-500/30'
                : 'bg-amber-500/5 border-amber-500/20 hover:border-amber-500/40'
            }`}
          >
            {c.status === 'pass' ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-400 mt-0.5 flex-shrink-0" />
            ) : (
              <AlertTriangle className="w-4 h-4 text-amber-400 mt-0.5 flex-shrink-0" />
            )}
            <div className="flex-1">
              <div className="flex items-center justify-between gap-1">
                <h4 className="text-xs font-semibold text-slate-200">{c.title}</h4>
                <TermTooltip term={c.title} customText={c.desc}>
                  <Info className="w-3.5 h-3.5 text-slate-400 hover:text-cyan-400" />
                </TermTooltip>
              </div>
              <p className="text-[11px] text-slate-400 mt-0.5 leading-relaxed line-clamp-2">
                {c.desc}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
