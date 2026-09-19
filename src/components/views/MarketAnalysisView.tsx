import React, { useState } from 'react';
import { LineChart, BarChart2, TrendingUp, TrendingDown, Layers, Zap } from 'lucide-react';
import { useQuantPlatform } from '../../context/QuantPlatformContext';
import { PriceTrendChart } from '../dashboard/PriceTrendChart';
import { MetricCard } from '../common/MetricCard';
import { formatCurrency, formatPercentage } from '../../utils/formatters';

export const MarketAnalysisView: React.FC = () => {
  const { selectedAsset, currentMetric, bars, currency } = useQuantPlatform();

  if (!currentMetric || bars.length === 0) {
    return <div className="p-8 text-center text-slate-500">Loading market analysis...</div>;
  }

  const latestBar = bars[bars.length - 1];
  const firstBar = bars[0];

  const highestPrice = Math.max(...bars.map(b => b.high));
  const lowestPrice = Math.min(...bars.map(b => b.low));
  const averageVolume = bars.reduce((s, b) => s + b.volume, 0) / bars.length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <div className="inline-flex items-center gap-2 px-2.5 py-0.5 rounded-full bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 text-xs font-mono mb-1.5">
          <LineChart className="w-3 h-3" />
          TECHNICAL & PRICE ACTION ENGINE
        </div>
        <h2 className="text-xl md:text-2xl font-bold text-white tracking-tight">
          Market Analysis — {selectedAsset}
        </h2>
        <p className="text-xs text-slate-400 mt-1 max-w-3xl">
          Deep-dive technical action, moving average confluence, liquidity volume profiles, and algorithmic crossover triggers.
        </p>
      </div>

      {/* Stats bar */}
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-3">
        <div className="glass-panel p-3 rounded-xl border border-slate-800">
          <span className="text-[11px] text-slate-400 font-medium">Session Open</span>
          <div className="text-base font-bold font-mono text-white mt-1">
            {formatCurrency(latestBar.open, currency)}
          </div>
        </div>

        <div className="glass-panel p-3 rounded-xl border border-slate-800">
          <span className="text-[11px] text-slate-400 font-medium">Session High</span>
          <div className="text-base font-bold font-mono text-emerald-400 mt-1">
            {formatCurrency(latestBar.high, currency)}
          </div>
        </div>

        <div className="glass-panel p-3 rounded-xl border border-slate-800">
          <span className="text-[11px] text-slate-400 font-medium">Session Low</span>
          <div className="text-base font-bold font-mono text-rose-400 mt-1">
            {formatCurrency(latestBar.low, currency)}
          </div>
        </div>

        <div className="glass-panel p-3 rounded-xl border border-slate-800">
          <span className="text-[11px] text-slate-400 font-medium">Sample High</span>
          <div className="text-base font-bold font-mono text-amber-400 mt-1">
            {formatCurrency(highestPrice, currency)}
          </div>
        </div>

        <div className="glass-panel p-3 rounded-xl border border-slate-800">
          <span className="text-[11px] text-slate-400 font-medium">Sample Low</span>
          <div className="text-base font-bold font-mono text-indigo-400 mt-1">
            {formatCurrency(lowestPrice, currency)}
          </div>
        </div>

        <div className="glass-panel p-3 rounded-xl border border-slate-800">
          <span className="text-[11px] text-slate-400 font-medium">Avg Daily Vol</span>
          <div className="text-base font-bold font-mono text-slate-300 mt-1">
            {(averageVolume / 1_000_000).toFixed(1)}M
          </div>
        </div>
      </div>

      {/* Price & Trend Chart */}
      <PriceTrendChart />
    </div>
  );
};
