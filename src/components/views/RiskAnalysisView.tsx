import React from 'react';
import { 
  ResponsiveContainer, 
  AreaChart, 
  Area, 
  LineChart, 
  Line, 
  ScatterChart, 
  Scatter, 
  XAxis, 
  YAxis, 
  ZAxis, 
  Tooltip, 
  CartesianGrid, 
  Cell 
} from 'recharts';
import { ShieldAlert, Info, Activity, AlertTriangle, TrendingDown, Clock, Target } from 'lucide-react';
import { useQuantPlatform } from '../../context/QuantPlatformContext';
import { TermTooltip } from '../common/TermTooltip';
import { formatPercentage, formatNumber } from '../../utils/formatters';
import { calculateDrawdown, calculateDailyReturns, calculateAnnualizedVolatility } from '../../utils/quantMath';

export const RiskAnalysisView: React.FC = () => {
  const { currentMetric, bars, metrics, selectedAsset } = useQuantPlatform();

  if (!currentMetric) {
    return <div className="p-8 text-center text-slate-500">Loading risk engine...</div>;
  }

  // Calculate underwater drawdown series
  const prices = bars.map(b => b.close);
  const ddResult = calculateDrawdown(prices);
  const drawdownChartData = bars.map((b, i) => ({
    date: b.date,
    drawdown: -ddResult.drawdownSeries[i], // Negative for underwater
  }));

  // Calculate rolling 30-day volatility trend
  const dailyReturns = calculateDailyReturns(prices);
  const volWindow = 30;
  const volTrendData: { date: string; volatility: number }[] = [];
  for (let i = volWindow; i < bars.length; i++) {
    const windowReturns = dailyReturns.slice(i - volWindow, i);
    const annVol = calculateAnnualizedVolatility(windowReturns);
    volTrendData.push({
      date: bars[i].date,
      volatility: Number(annVol.toFixed(2)),
    });
  }

  // Risk-Return Scatter Plot Data for Assets
  const scatterData = Object.entries(metrics).map(([assetKey, m]) => ({
    name: assetKey,
    volatility: m.annualizedVolatility,
    return: m.totalReturn,
    sharpe: m.sharpeRatio,
  }));

  const assetColors: Record<string, string> = {
    GOLD: '#f59e0b',
    BTC: '#06b6d4',
    NVDA: '#818cf8',
    PORTFOLIO: '#10b981',
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <div className="inline-flex items-center gap-2 px-2.5 py-0.5 rounded-full bg-rose-500/10 text-rose-400 border border-rose-500/20 text-xs font-mono mb-1.5">
          <ShieldAlert className="w-3 h-3" />
          DOWNSIDE PROTECTION & VOLATILITY MODELING
        </div>
        <h2 className="text-xl md:text-2xl font-bold text-white tracking-tight">
          Risk & Volatility Analysis
        </h2>
        <p className="text-xs text-slate-400 mt-1 max-w-3xl">
          Comprehensive risk assessment, historical underwater drawdowns, and cross-asset risk-return trade-offs.
        </p>
      </div>

      {/* Metric Cards with Educational Explanations */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <div className="glass-panel rounded-xl p-4 border border-slate-800">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-400">Historical Volatility (30D)</span>
            <Activity className="w-4 h-4 text-amber-400" />
          </div>
          <div className="text-2xl font-bold font-mono text-white mt-1">
            {currentMetric.historicalVolatility.toFixed(2)}%
          </div>
          <p className="text-[11px] text-slate-400 mt-2 leading-relaxed">
            Measures the standard deviation of daily logarithmic returns over the past 30 trading days, annualized.
          </p>
        </div>

        <div className="glass-panel rounded-xl p-4 border border-slate-800">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-400">Annualized Full Volatility</span>
            <AlertTriangle className="w-4 h-4 text-indigo-400" />
          </div>
          <div className="text-2xl font-bold font-mono text-white mt-1">
            {currentMetric.annualizedVolatility.toFixed(2)}%
          </div>
          <p className="text-[11px] text-slate-400 mt-2 leading-relaxed">
            Total realized price variance across the entire timeframe scaled by the square root of 252 trading sessions.
          </p>
        </div>

        <div className="glass-panel rounded-xl p-4 border border-slate-800">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-400">Sharpe Ratio</span>
            <Target className="w-4 h-4 text-cyan-400" />
          </div>
          <div className="text-2xl font-bold font-mono text-white mt-1">
            {currentMetric.sharpeRatio.toFixed(2)}
          </div>
          <p className="text-[11px] text-slate-400 mt-2 leading-relaxed">
            Quantifies the excess return generated per unit of volatility above the 5% risk-free rate.
          </p>
        </div>

        <div className="glass-panel rounded-xl p-4 border border-slate-800">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-400">Maximum Drawdown</span>
            <TrendingDown className="w-4 h-4 text-rose-400" />
          </div>
          <div className="text-2xl font-bold font-mono text-rose-400 mt-1">
            -{currentMetric.maxDrawdown.toFixed(2)}%
          </div>
          <p className="text-[11px] text-slate-400 mt-2 leading-relaxed">
            Maximum Drawdown measures the largest historical decline from a portfolio peak to its subsequent trough.
          </p>
        </div>

        <div className="glass-panel rounded-xl p-4 border border-slate-800">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-400">Drawdown Duration</span>
            <Clock className="w-4 h-4 text-slate-400" />
          </div>
          <div className="text-2xl font-bold font-mono text-white mt-1">
            {currentMetric.drawdownDuration} <span className="text-xs font-normal text-slate-400">Days</span>
          </div>
          <p className="text-[11px] text-slate-400 mt-2 leading-relaxed">
            The longest historical period the asset took to recover from a peak-to-trough decline to a new high.
          </p>
        </div>

        <div className="glass-panel rounded-xl p-4 border border-slate-800">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-400">Risk-Adjusted Efficiency</span>
            <Info className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-2xl font-bold font-mono text-emerald-400 mt-1">
            {(currentMetric.totalReturn / (currentMetric.annualizedVolatility || 1)).toFixed(2)}x
          </div>
          <p className="text-[11px] text-slate-400 mt-2 leading-relaxed">
            Return-to-volatility multiple assessing how efficiently capital generated gains relative to drawdown risk.
          </p>
        </div>
      </div>

      {/* 1. Underwater Drawdown Chart */}
      <div className="glass-panel rounded-xl p-5 border border-slate-800">
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div>
            <h3 className="text-sm font-semibold text-white tracking-wide uppercase flex items-center gap-2">
              <span>Historical Underwater Drawdown Curve</span>
              <span className="text-xs text-rose-400 font-mono">({selectedAsset})</span>
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Visualizes the depth and persistence of portfolio drawdowns from prior all-time peaks.
            </p>
          </div>
          <span className="text-xs font-mono text-rose-400 bg-rose-500/10 px-2.5 py-1 rounded border border-rose-500/20">
            Peak Drop: -{currentMetric.maxDrawdown.toFixed(2)}%
          </span>
        </div>

        <div className="h-64 w-full mt-4">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={drawdownChartData} margin={{ top: 10, right: 10, left: 10, bottom: 0 }}>
              <defs>
                <linearGradient id="drawdownGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#f43f5e" stopOpacity={0.0} />
                  <stop offset="95%" stopColor="#f43f5e" stopOpacity={0.4} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#1f293d" vertical={false} opacity={0.5} />
              <XAxis
                dataKey="date"
                stroke="#64748b"
                fontSize={11}
                tickLine={false}
                tickFormatter={(str) => str.slice(2, 7)}
              />
              <YAxis
                stroke="#64748b"
                fontSize={11}
                tickLine={false}
                domain={[-Math.max(20, currentMetric.maxDrawdown * 1.1), 0]}
                tickFormatter={(v) => `${v.toFixed(0)}%`}
              />
              <Tooltip
                content={({ active, payload, label }) => {
                  if (!active || !payload || payload.length === 0) return null;
                  const val = payload[0].value as number;
                  return (
                    <div className="glass-dropdown p-2.5 rounded-lg shadow-xl text-xs space-y-1 border border-slate-700 font-mono">
                      <div className="font-semibold text-white">{label}</div>
                      <div className="text-rose-400 flex items-center justify-between gap-4">
                        <span>Drawdown from Peak:</span>
                        <span className="font-bold">{val.toFixed(2)}%</span>
                      </div>
                    </div>
                  );
                }}
              />
              <Area
                type="monotone"
                dataKey="drawdown"
                stroke="#f43f5e"
                strokeWidth={2}
                fill="url(#drawdownGradient)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Row: Risk-Return Scatter Plot & Volatility Trend */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* 2. Risk-Return Scatter Plot */}
        <div className="glass-panel rounded-xl p-5 border border-slate-800">
          <div className="pb-3 border-b border-slate-800">
            <h3 className="text-sm font-semibold text-white tracking-wide uppercase">
              Risk vs. Return Efficient Frontier Scatter
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Annualized Volatility (X-axis) vs. Total Return (Y-axis) across multi-asset universe.
            </p>
          </div>

          <div className="h-64 w-full mt-4">
            <ResponsiveContainer width="100%" height="100%">
              <ScatterChart margin={{ top: 20, right: 20, bottom: 10, left: 10 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1f293d" opacity={0.5} />
                <XAxis
                  type="number"
                  dataKey="volatility"
                  name="Volatility"
                  unit="%"
                  stroke="#64748b"
                  fontSize={11}
                  tickLine={false}
                  label={{ value: 'Annualized Volatility (%)', position: 'insideBottom', offset: -5, fill: '#64748b', fontSize: 10 }}
                />
                <YAxis
                  type="number"
                  dataKey="return"
                  name="Return"
                  unit="%"
                  stroke="#64748b"
                  fontSize={11}
                  tickLine={false}
                  label={{ value: 'Total Return (%)', angle: -90, position: 'insideLeft', fill: '#64748b', fontSize: 10 }}
                />
                <ZAxis range={[150, 150]} />
                <Tooltip
                  cursor={{ strokeDasharray: '3 3' }}
                  content={({ active, payload }) => {
                    if (!active || !payload || payload.length === 0) return null;
                    const data = payload[0].payload;
                    return (
                      <div className="glass-dropdown p-3 rounded-lg shadow-xl text-xs space-y-1.5 border border-slate-700 font-mono">
                        <div className="font-semibold text-white border-b border-slate-800 pb-1">
                          {data.name}
                        </div>
                        <div className="flex justify-between gap-4 text-cyan-300">
                          <span>Return:</span>
                          <span>{formatPercentage(data.return)}</span>
                        </div>
                        <div className="flex justify-between gap-4 text-amber-400">
                          <span>Volatility:</span>
                          <span>{data.volatility.toFixed(2)}%</span>
                        </div>
                        <div className="flex justify-between gap-4 text-emerald-400">
                          <span>Sharpe Ratio:</span>
                          <span>{data.sharpe.toFixed(2)}</span>
                        </div>
                      </div>
                    );
                  }}
                />
                <Scatter data={scatterData}>
                  {scatterData.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={assetColors[entry.name] || '#06b6d4'}
                      stroke="#ffffff"
                      strokeWidth={1.5}
                    />
                  ))}
                </Scatter>
              </ScatterChart>
            </ResponsiveContainer>
          </div>

          <div className="flex items-center justify-center gap-4 mt-2 text-xs font-mono text-slate-400">
            {scatterData.map(d => (
              <div key={d.name} className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: assetColors[d.name] }} />
                <span>{d.name}</span>
              </div>
            ))}
          </div>
        </div>

        {/* 3. Volatility Trend Chart */}
        <div className="glass-panel rounded-xl p-5 border border-slate-800">
          <div className="pb-3 border-b border-slate-800">
            <h3 className="text-sm font-semibold text-white tracking-wide uppercase">
              Rolling 30-Day Volatility Trend
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Monitors volatility clustering, spikes, and regime transitions over time.
            </p>
          </div>

          <div className="h-64 w-full mt-4">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={volTrendData} margin={{ top: 10, right: 10, left: 10, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1f293d" vertical={false} opacity={0.5} />
                <XAxis
                  dataKey="date"
                  stroke="#64748b"
                  fontSize={11}
                  tickLine={false}
                  tickFormatter={(str) => str.slice(2, 7)}
                />
                <YAxis
                  stroke="#64748b"
                  fontSize={11}
                  tickLine={false}
                  tickFormatter={(v) => `${v.toFixed(0)}%`}
                />
                <Tooltip
                  content={({ active, payload, label }) => {
                    if (!active || !payload || payload.length === 0) return null;
                    const val = payload[0].value as number;
                    return (
                      <div className="glass-dropdown p-2.5 rounded-lg shadow-xl text-xs space-y-1 border border-slate-700 font-mono">
                        <div className="font-semibold text-white">{label}</div>
                        <div className="text-amber-400 flex items-center justify-between gap-4">
                          <span>30D Realized Volatility:</span>
                          <span className="font-bold">{val.toFixed(2)}%</span>
                        </div>
                      </div>
                    );
                  }}
                />
                <Line
                  type="monotone"
                  dataKey="volatility"
                  stroke="#f59e0b"
                  strokeWidth={2}
                  dot={false}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>

          <div className="flex items-center justify-between mt-2 text-[11px] text-slate-400 font-mono">
            <span>Low Vol Regimes: &lt;15%</span>
            <span>High Vol Regimes: &gt;35%</span>
          </div>
        </div>
      </div>
    </div>
  );
};
