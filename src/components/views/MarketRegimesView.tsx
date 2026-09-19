import React, { useMemo } from 'react';
import { Layers, TrendingUp, TrendingDown, AlertTriangle, ShieldCheck, Activity } from 'lucide-react';
import { useQuantPlatform } from '../../context/QuantPlatformContext';
import { identifyMarketRegimes } from '../../utils/quantMath';
import { formatPercentage, formatDate } from '../../utils/formatters';
import { MarketRegimeType } from '../../types/quant';

export const MarketRegimesView: React.FC = () => {
  const { bars, selectedAsset } = useQuantPlatform();

  const regimes = useMemo(() => {
    return identifyMarketRegimes(bars);
  }, [bars]);

  const regimeBadges: Record<MarketRegimeType, { label: string; color: string; border: string; icon: React.ReactNode }> = {
    BULL: {
      label: 'Bull Market',
      color: 'bg-emerald-500/15 text-emerald-400',
      border: 'border-emerald-500/30',
      icon: <TrendingUp className="w-3.5 h-3.5 text-emerald-400" />,
    },
    BEAR: {
      label: 'Bear Market',
      color: 'bg-rose-500/15 text-rose-400',
      border: 'border-rose-500/30',
      icon: <TrendingDown className="w-3.5 h-3.5 text-rose-400" />,
    },
    HIGH_VOL: {
      label: 'High Volatility',
      color: 'bg-amber-500/15 text-amber-400',
      border: 'border-amber-500/30',
      icon: <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />,
    },
    LOW_VOL: {
      label: 'Low Volatility',
      color: 'bg-cyan-500/15 text-cyan-400',
      border: 'border-cyan-500/30',
      icon: <ShieldCheck className="w-3.5 h-3.5 text-cyan-400" />,
    },
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <div className="inline-flex items-center gap-2 px-2.5 py-0.5 rounded-full bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 text-xs font-mono mb-1.5">
          <Layers className="w-3 h-3" />
          MACROECONOMIC & STRUCTURAL PHASE DECOMPOSITION
        </div>
        <h2 className="text-xl md:text-2xl font-bold text-white tracking-tight">
          Market Regime Analysis
        </h2>
        <p className="text-xs text-slate-400 mt-1 max-w-3xl">
          Classifies historical market environments into distinct phases to assess strategy robustness across different macro regimes.
        </p>
      </div>

      {/* Regime Timeline Bar */}
      <div className="glass-panel rounded-xl p-5 border border-slate-800">
        <h3 className="text-xs font-semibold text-slate-300 uppercase tracking-wide mb-2 flex items-center justify-between">
          <span>Historical Regime Timeline</span>
          <span className="font-mono text-cyan-400 text-[11px]">{selectedAsset} (2021 – 2026)</span>
        </h3>
        
        {/* Visual Timeline Bar */}
        <div className="grid grid-cols-4 gap-2 h-12 my-3">
          {regimes.map((r, i) => {
            const badge = regimeBadges[r.type];
            return (
              <div
                key={r.id}
                className={`rounded-lg p-2 flex flex-col justify-between border ${badge.border} ${badge.color} transition-transform hover:scale-[1.02] cursor-pointer`}
                title={`${r.label}: ${formatDate(r.startDate)} to ${formatDate(r.endDate)}`}
              >
                <div className="flex items-center justify-between text-[11px] font-semibold font-mono">
                  <span className="flex items-center gap-1">
                    {badge.icon}
                    <span>{badge.label}</span>
                  </span>
                  <span>P{i + 1}</span>
                </div>
                <div className="text-[10px] text-slate-400 font-mono truncate">
                  {formatDate(r.startDate)}
                </div>
              </div>
            );
          })}
        </div>

        <div className="flex items-center justify-between text-[11px] text-slate-500 font-mono pt-2 border-t border-slate-800/80">
          <span>🟢 Bull Expansion</span>
          <span>🔴 Bear Contraction</span>
          <span>🟠 High Volatility Shocks</span>
          <span>🔵 Low Volatility Range</span>
        </div>
      </div>

      {/* Regime Performance Breakdown Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {regimes.map((r) => {
          const badge = regimeBadges[r.type];
          return (
            <div key={r.id} className="glass-panel rounded-xl p-5 border border-slate-800 space-y-3">
              <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                <div className="flex items-center gap-2">
                  <span className={`px-2.5 py-1 rounded-full text-xs font-bold border flex items-center gap-1.5 ${badge.color} ${badge.border}`}>
                    {badge.icon}
                    <span>{badge.label}</span>
                  </span>
                  <span className="text-xs text-slate-400 font-mono">
                    {formatDate(r.startDate)} — {formatDate(r.endDate)}
                  </span>
                </div>
                <span className="text-xs font-mono text-cyan-400 font-semibold">
                  {r.numTrades} Trades
                </span>
              </div>

              <p className="text-xs text-slate-300 leading-relaxed">
                {r.description}
              </p>

              {/* Metrics grid for this regime */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-2 text-xs font-mono">
                <div className="p-2 rounded bg-dark-950/80 border border-slate-800">
                  <span className="text-slate-500 text-[10px] block">Strategy Return</span>
                  <span className={`font-bold ${r.strategyReturn >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                    {formatPercentage(r.strategyReturn)}
                  </span>
                </div>

                <div className="p-2 rounded bg-dark-950/80 border border-slate-800">
                  <span className="text-slate-500 text-[10px] block">Sharpe Ratio</span>
                  <span className="font-bold text-cyan-400">
                    {r.sharpeRatio.toFixed(2)}
                  </span>
                </div>

                <div className="p-2 rounded bg-dark-950/80 border border-slate-800">
                  <span className="text-slate-500 text-[10px] block">Realized Vol</span>
                  <span className="font-bold text-amber-400">
                    {r.volatility.toFixed(1)}%
                  </span>
                </div>

                <div className="p-2 rounded bg-dark-950/80 border border-slate-800">
                  <span className="text-slate-500 text-[10px] block">Max Drawdown</span>
                  <span className="font-bold text-rose-400">
                    -{r.maxDrawdown.toFixed(1)}%
                  </span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
