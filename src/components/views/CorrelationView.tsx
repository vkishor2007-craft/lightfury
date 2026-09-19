import React, { useState, useEffect } from 'react';
import { 
  ResponsiveContainer, 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  Tooltip, 
  CartesianGrid, 
  Legend 
} from 'recharts';
import { GitFork, Info, Calendar } from 'lucide-react';
import { fetchCorrelationData } from '../../services/apiClient';
import { CorrelationMatrixData, AssetId } from '../../types/quant';
import { TermTooltip } from '../common/TermTooltip';

export const CorrelationView: React.FC = () => {
  const [lookback, setLookback] = useState<number>(60);
  const [corrData, setCorrData] = useState<CorrelationMatrixData | null>(null);
  const [hoveredCell, setHoveredCell] = useState<{ a: string; b: string; val: number } | null>(null);

  useEffect(() => {
    fetchCorrelationData(lookback).then(data => setCorrData(data));
  }, [lookback]);

  if (!corrData) {
    return <div className="p-8 text-center text-slate-500">Computing correlation matrices...</div>;
  }

  const assets: AssetId[] = ['GOLD', 'BTC', 'NVDA'];

  // Helper to color heatmap cells based on correlation (-1 to +1)
  const getCellColor = (val: number) => {
    if (val === 1.0) return 'bg-cyan-600/60 text-white font-bold';
    if (val > 0.6) return 'bg-indigo-600/50 text-indigo-100';
    if (val > 0.2) return 'bg-indigo-900/40 text-indigo-200';
    if (val >= -0.2 && val <= 0.2) return 'bg-slate-800/60 text-slate-300';
    if (val >= -0.6) return 'bg-rose-950/40 text-rose-300';
    return 'bg-rose-600/50 text-white font-bold';
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-2.5 py-0.5 rounded-full bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 text-xs font-mono mb-1.5">
            <GitFork className="w-3 h-3" />
            CROSS-ASSET DEPENDENCY MODEL
          </div>
          <h2 className="text-xl md:text-2xl font-bold text-white tracking-tight">
            Cross-Asset Correlation Analysis
          </h2>
          <p className="text-xs text-slate-400 mt-1 max-w-2xl">
            Correlation shows how two assets have historically moved relative to each other. Values close to 0 offer superior diversification.
          </p>
        </div>

        {/* Lookback Selector */}
        <div className="flex items-center gap-2 bg-dark-950 p-1.5 rounded-lg border border-slate-800 text-xs">
          <Calendar className="w-3.5 h-3.5 text-slate-400 ml-1" />
          <span className="text-slate-400 font-mono">Lookback:</span>
          {([30, 60, 90, 180] as const).map((days) => (
            <button
              key={days}
              onClick={() => setLookback(days)}
              className={`px-3 py-1 rounded text-xs font-semibold transition-colors ${
                lookback === days
                  ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/30'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              {days}-Day
            </button>
          ))}
        </div>
      </div>

      {/* Row: Correlation Matrix & Interactive Heatmap */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Heatmap & Matrix */}
        <div className="lg:col-span-5 glass-panel rounded-xl p-5 border border-slate-800 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <h3 className="text-sm font-semibold text-white tracking-wide uppercase flex items-center gap-2">
                <span>Correlation Heatmap</span>
                <TermTooltip term="Correlation" />
              </h3>
              <span className="text-xs font-mono text-cyan-400">
                {lookback}D Window
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-2 mb-4">
              Hover over cells to inspect pairwise Pearson correlation coefficients.
            </p>

            {/* Matrix Grid */}
            <div className="overflow-x-auto">
              <table className="w-full text-center border-collapse">
                <thead>
                  <tr>
                    <th className="p-2 text-xs font-mono text-slate-500 text-left">Asset</th>
                    {assets.map(a => (
                      <th key={a} className="p-2 text-xs font-mono text-slate-300 font-semibold">
                        {a}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {assets.map(rowAsset => (
                    <tr key={rowAsset}>
                      <td className="p-2 text-xs font-mono text-slate-300 font-semibold text-left">
                        {rowAsset}
                      </td>
                      {assets.map(colAsset => {
                        const val = corrData.matrix[rowAsset]?.[colAsset] ?? 0;
                        return (
                          <td
                            key={colAsset}
                            onMouseEnter={() => setHoveredCell({ a: rowAsset, b: colAsset, val })}
                            onMouseLeave={() => setHoveredCell(null)}
                            className="p-1"
                          >
                            <div
                              className={`py-3 px-2 rounded-lg text-xs font-mono transition-transform hover:scale-105 cursor-pointer ${getCellColor(val)}`}
                            >
                              {val.toFixed(2)}
                            </div>
                          </td>
                        );
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Inspection Card */}
            {hoveredCell ? (
              <div className="mt-4 p-3 rounded-lg bg-dark-950 border border-cyan-500/30 text-xs font-mono">
                <span className="text-cyan-400 font-semibold">{hoveredCell.a}</span> vs{' '}
                <span className="text-cyan-400 font-semibold">{hoveredCell.b}</span>:
                <strong className="text-white ml-2">{hoveredCell.val.toFixed(2)}</strong>
                <p className="text-[11px] text-slate-400 mt-1">
                  {hoveredCell.val > 0.5
                    ? 'Strong positive co-movement; limited portfolio diversification.'
                    : hoveredCell.val < -0.2
                    ? 'Negative co-movement; exceptional historical hedge properties.'
                    : 'Low correlation; optimal non-correlated asset allocation.'}
                </p>
              </div>
            ) : (
              <div className="mt-4 p-3 rounded-lg bg-dark-950/50 border border-slate-800 text-[11px] text-slate-500 font-mono">
                Hover over any matrix cell above for pair interpretation.
              </div>
            )}
          </div>

          {/* Color bar legend */}
          <div className="mt-6 pt-4 border-t border-slate-800 text-xs flex items-center justify-between text-slate-400">
            <span className="text-rose-400 font-mono">-1.0 (Inverse)</span>
            <span className="text-slate-500 font-mono">0.0 (Uncorrelated)</span>
            <span className="text-cyan-400 font-mono">+1.0 (Direct)</span>
          </div>
        </div>

        {/* Rolling Correlation Chart */}
        <div className="lg:col-span-7 glass-panel rounded-xl p-5 border border-slate-800">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <div>
              <h3 className="text-sm font-semibold text-white tracking-wide uppercase">
                Rolling Correlation Timeline (30D)
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Displays structural correlation shifts and decoupling over historical market cycles.
              </p>
            </div>
          </div>

          <div className="h-80 w-full mt-4">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={corrData.rollingSeries} margin={{ top: 10, right: 10, left: 10, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1f293d" vertical={false} opacity={0.5} />
                <XAxis
                  dataKey="date"
                  stroke="#64748b"
                  fontSize={11}
                  tickLine={false}
                  tickFormatter={(str) => str.slice(2, 7)}
                />
                <YAxis
                  domain={[-1, 1]}
                  stroke="#64748b"
                  fontSize={11}
                  tickLine={false}
                  ticks={[-1, -0.5, 0, 0.5, 1]}
                />
                <Tooltip
                  content={({ active, payload, label }) => {
                    if (!active || !payload || payload.length === 0) return null;
                    return (
                      <div className="glass-dropdown p-3 rounded-lg shadow-xl text-xs space-y-1.5 border border-slate-700 font-mono">
                        <div className="font-semibold text-white border-b border-slate-800 pb-1">{label}</div>
                        {payload.map((p, i) => (
                          <div key={i} className="flex justify-between gap-4" style={{ color: p.color }}>
                            <span>{p.name}:</span>
                            <span className="font-bold">{(p.value as number).toFixed(2)}</span>
                          </div>
                        ))}
                      </div>
                    );
                  }}
                />
                <Legend
                  wrapperStyle={{ fontSize: '11px', fontFamily: 'monospace', paddingTop: '10px' }}
                />
                <Line
                  type="monotone"
                  dataKey="goldBtc"
                  name="Gold vs BTC"
                  stroke="#f59e0b"
                  strokeWidth={2}
                  dot={false}
                />
                <Line
                  type="monotone"
                  dataKey="goldNvda"
                  name="Gold vs NVDA"
                  stroke="#10b981"
                  strokeWidth={2}
                  dot={false}
                />
                <Line
                  type="monotone"
                  dataKey="btcNvda"
                  name="BTC vs NVDA"
                  stroke="#06b6d4"
                  strokeWidth={2}
                  dot={false}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>

          <div className="mt-2 text-xs text-slate-500 font-mono flex items-center justify-between">
            <span>Asset decoupling occurs when correlation diverges from historical means.</span>
            <span>Rolling 30D Window</span>
          </div>
        </div>
      </div>
    </div>
  );
};
