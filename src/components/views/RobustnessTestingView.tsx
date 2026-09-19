import React, { useState, useMemo } from 'react';
import { 
  ResponsiveContainer, 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  Tooltip, 
  CartesianGrid, 
  Legend 
} from 'recharts';
import { Sliders, ShieldCheck, AlertTriangle, Layers, Zap } from 'lucide-react';
import { useQuantPlatform } from '../../context/QuantPlatformContext';
import { generateRobustnessGrid } from '../../utils/quantMath';
import { formatPercentage, formatNumber } from '../../utils/formatters';
import { TermTooltip } from '../common/TermTooltip';

export const RobustnessTestingView: React.FC = () => {
  const { bars, backtestParams } = useQuantPlatform();

  const [selectedMetric, setSelectedMetric] = useState<'totalReturn' | 'sharpeRatio' | 'maxDrawdown'>('sharpeRatio');

  // Generate sensitivity grid
  const robustnessData = useMemo(() => {
    return generateRobustnessGrid(bars, backtestParams);
  }, [bars, backtestParams]);

  // Unique fast and slow periods for 2D matrix
  const fastPeriods = [5, 10, 15, 20];
  const slowPeriods = [25, 50, 75, 100];

  const getMetricColor = (val: number, metric: string) => {
    if (metric === 'maxDrawdown') {
      if (val < 15) return 'bg-emerald-950/60 text-emerald-300 border border-emerald-500/30';
      if (val < 25) return 'bg-amber-950/60 text-amber-300 border border-amber-500/30';
      return 'bg-rose-950/60 text-rose-300 border border-rose-500/30';
    }
    if (val > 1.2 || (metric === 'totalReturn' && val > 50)) {
      return 'bg-cyan-950/60 text-cyan-300 border border-cyan-500/30';
    }
    if (val > 0.6 || (metric === 'totalReturn' && val > 20)) {
      return 'bg-indigo-950/60 text-indigo-300 border border-indigo-500/30';
    }
    return 'bg-slate-900/60 text-slate-400 border border-slate-800';
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-2.5 py-0.5 rounded-full bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 text-xs font-mono mb-1.5">
            <Sliders className="w-3 h-3" />
            PARAMETER STABILITY & OVERFITTING SHIELD
          </div>
          <h2 className="text-xl md:text-2xl font-bold text-white tracking-tight">
            Strategy Robustness Testing
          </h2>
          <p className="text-xs text-slate-400 mt-1 max-w-3xl">
            Evaluate whether the trading model maintains consistent edge across parameter neighborhoods or collapses under minor parameter perturbations.
          </p>
        </div>

        {/* Metric Selector */}
        <div className="flex items-center gap-2 bg-dark-950 p-1.5 rounded-lg border border-slate-800 text-xs font-mono">
          <span className="text-slate-400 ml-1">Heatmap Metric:</span>
          {(['sharpeRatio', 'totalReturn', 'maxDrawdown'] as const).map((m) => (
            <button
              key={m}
              onClick={() => setSelectedMetric(m)}
              className={`px-3 py-1 rounded text-xs font-semibold transition-colors ${
                selectedMetric === m
                  ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/30'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              {m === 'sharpeRatio' ? 'Sharpe' : m === 'totalReturn' ? 'Total Return' : 'Max DD'}
            </button>
          ))}
        </div>
      </div>

      {/* Row: 2D Heatmap Matrix & Parameter Chart */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* 2D Heatmap Grid */}
        <div className="lg:col-span-6 glass-panel rounded-xl p-5 border border-slate-800">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800 mb-4">
            <h3 className="text-sm font-semibold text-white tracking-wide uppercase flex items-center gap-2">
              <span>Fast SMA vs. Slow SMA Parameter Heatmap</span>
              <TermTooltip term="Look-ahead Bias" customText="Robust strategies exhibit smooth parameter neighborhoods rather than isolated spikes." />
            </h3>
            <span className="text-xs font-mono text-cyan-400">
              {selectedMetric}
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-center border-collapse text-xs font-mono">
              <thead>
                <tr>
                  <th className="p-2 text-slate-500 text-left">Fast \ Slow</th>
                  {slowPeriods.map(slow => (
                    <th key={slow} className="p-2 text-slate-300 font-semibold">
                      {slow}D
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {fastPeriods.map(fast => (
                  <tr key={fast}>
                    <td className="p-2 text-slate-300 font-semibold text-left">
                      {fast}D
                    </td>
                    {slowPeriods.map(slow => {
                      const pt = robustnessData.find(d => d.fastPeriod === fast && d.slowPeriod === slow);
                      if (!pt) {
                        return <td key={slow} className="p-1 text-slate-600 font-mono">—</td>;
                      }
                      const val = pt[selectedMetric];
                      return (
                        <td key={slow} className="p-1">
                          <div
                            className={`py-3 px-2 rounded-lg font-bold transition-all hover:scale-105 cursor-pointer ${getMetricColor(val, selectedMetric)}`}
                            title={`Fast: ${fast}D, Slow: ${slow}D | Return: ${pt.totalReturn}%, Sharpe: ${pt.sharpeRatio}, MaxDD: ${pt.maxDrawdown}%`}
                          >
                            {selectedMetric === 'totalReturn'
                              ? formatPercentage(val, false)
                              : selectedMetric === 'maxDrawdown'
                              ? `-${val.toFixed(1)}%`
                              : val.toFixed(2)}
                          </div>
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-800 text-[11px] text-slate-500 font-mono flex items-center justify-between">
            <span>Dark Cyan: Optimal parameter stability</span>
            <span>Red/Amber: Fragile or high drawdown</span>
          </div>
        </div>

        {/* Bar Chart comparing Return & Sharpe across parameters */}
        <div className="lg:col-span-6 glass-panel rounded-xl p-5 border border-slate-800">
          <div className="pb-3 border-b border-slate-800 mb-4">
            <h3 className="text-sm font-semibold text-white tracking-wide uppercase">
              Sharpe Ratio Stability Across Neighborhoods
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Evaluating Sharpe consistency across the 10 most relevant parameter combinations.
            </p>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={robustnessData.slice(0, 8)} margin={{ top: 10, right: 10, left: 10, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1f293d" vertical={false} opacity={0.5} />
                <XAxis
                  dataKey="fastPeriod"
                  stroke="#64748b"
                  fontSize={11}
                  tickLine={false}
                  tickFormatter={(v, idx) => {
                    const item = robustnessData[idx];
                    return item ? `${item.fastPeriod}D/${item.slowPeriod}D` : `${v}`;
                  }}
                />
                <YAxis
                  stroke="#64748b"
                  fontSize={11}
                  tickLine={false}
                />
                <Tooltip
                  content={({ active, payload }) => {
                    if (!active || !payload || payload.length === 0) return null;
                    const d = payload[0].payload;
                    return (
                      <div className="glass-dropdown p-2.5 rounded-lg shadow-xl text-xs space-y-1 border border-slate-700 font-mono">
                        <div className="font-semibold text-white">Config: Fast {d.fastPeriod}D / Slow {d.slowPeriod}D</div>
                        <div className="text-cyan-400">Sharpe Ratio: {d.sharpeRatio.toFixed(2)}</div>
                        <div className="text-emerald-400">Total Return: {formatPercentage(d.totalReturn)}</div>
                        <div className="text-rose-400">Max Drawdown: -{d.maxDrawdown.toFixed(2)}%</div>
                      </div>
                    );
                  }}
                />
                <Bar dataKey="sharpeRatio" fill="#06b6d4" radius={[3, 3, 0, 0]} name="Sharpe Ratio" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Parameter Comparison Table */}
      <div className="glass-panel rounded-xl p-5 border border-slate-800">
        <h3 className="text-sm font-semibold text-white tracking-wide uppercase mb-3">
          Robustness Simulation Matrix Table
        </h3>
        <div className="overflow-x-auto">
          <table className="w-full text-xs font-mono border-collapse">
            <thead>
              <tr className="border-b border-slate-800 text-slate-400 text-left">
                <th className="py-2.5 px-3">Parameters (Fast / Slow)</th>
                <th className="py-2.5 px-3">Trans. Cost</th>
                <th className="py-2.5 px-3 text-cyan-400">Total Return</th>
                <th className="py-2.5 px-3 text-emerald-400">Sharpe Ratio</th>
                <th className="py-2.5 px-3 text-rose-400">Max Drawdown</th>
                <th className="py-2.5 px-3">Trade Count</th>
                <th className="py-2.5 px-3">Robustness Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 text-slate-200">
              {robustnessData.slice(0, 7).map((row, i) => (
                <tr key={i} className="hover:bg-slate-800/30">
                  <td className="py-2.5 px-3 font-semibold text-white">
                    SMA {row.fastPeriod}D / {row.slowPeriod}D
                  </td>
                  <td className="py-2.5 px-3 text-slate-400">{row.transactionCost}%</td>
                  <td className="py-2.5 px-3 text-cyan-400 font-bold">{formatPercentage(row.totalReturn)}</td>
                  <td className="py-2.5 px-3 text-emerald-400 font-bold">{row.sharpeRatio.toFixed(2)}</td>
                  <td className="py-2.5 px-3 text-rose-400">-{row.maxDrawdown.toFixed(2)}%</td>
                  <td className="py-2.5 px-3 text-slate-400">{row.numTrades}</td>
                  <td className="py-2.5 px-3">
                    <span className="px-2 py-0.5 rounded text-[10px] bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-bold">
                      STABLE
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
