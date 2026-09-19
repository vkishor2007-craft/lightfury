import React, { useState } from 'react';
import { 
  ResponsiveContainer, 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  Tooltip, 
  CartesianGrid 
} from 'recharts';
import { 
  Percent, 
  TrendingUp, 
  Activity, 
  ShieldCheck, 
  ArrowDownRight, 
  RotateCw,
  Zap
} from 'lucide-react';
import { useQuantPlatform } from '../../context/QuantPlatformContext';
import { MetricCard } from '../common/MetricCard';
import { formatPercentage, formatNumber } from '../../utils/formatters';
import { calculateRollingReturns } from '../../utils/quantMath';

export const QuantIndicatorsView: React.FC = () => {
  const { currentMetric, bars, selectedAsset } = useQuantPlatform();
  const [rollingWindow, setRollingWindow] = useState<30 | 60 | 90>(30);

  if (!currentMetric) {
    return <div className="p-8 text-center text-slate-500">Calculating quantitative indicators...</div>;
  }

  // Calculate rolling returns data for chart
  const prices = bars.map(b => b.close);
  const rollingValues = calculateRollingReturns(prices, rollingWindow);
  const rollingChartData = bars.map((b, i) => ({
    date: b.date,
    rollingReturn: rollingValues[i],
  })).filter(d => d.rollingReturn !== null);

  const indicatorCards = [
    {
      title: 'Daily Return',
      value: formatPercentage(currentMetric.dailyReturn),
      change: currentMetric.dailyReturn,
      description: 'Single-session percentage price change from prior close.',
      tooltipTerm: 'Volatility',
      icon: <Percent className="w-4 h-4 text-cyan-400" />,
      sparkline: currentMetric.sparkline,
      variant: 'cyan' as const,
    },
    {
      title: 'Cumulative Return',
      value: formatPercentage(currentMetric.cumulativeReturn),
      change: currentMetric.cumulativeReturn,
      description: 'Total compound return across the active historical timeframe.',
      tooltipTerm: 'Backtesting',
      icon: <TrendingUp className="w-4 h-4 text-emerald-400" />,
      sparkline: currentMetric.sparkline,
      variant: 'emerald' as const,
    },
    {
      title: 'Historical Volatility (30D)',
      value: `${currentMetric.historicalVolatility.toFixed(2)}%`,
      description: 'Short-term realized price dispersion annualized over 30 days.',
      tooltipTerm: 'Volatility',
      icon: <Activity className="w-4 h-4 text-amber-400" />,
      sparkline: currentMetric.sparkline.slice(-10),
      variant: 'amber' as const,
    },
    {
      title: 'Annualized Volatility',
      value: `${currentMetric.annualizedVolatility.toFixed(2)}%`,
      description: 'Full-sample return standard deviation scaled by sqrt(252).',
      tooltipTerm: 'Volatility',
      icon: <Zap className="w-4 h-4 text-indigo-400" />,
      sparkline: currentMetric.sparkline,
      variant: 'indigo' as const,
    },
    {
      title: 'Sharpe Ratio',
      value: currentMetric.sharpeRatio.toFixed(2),
      description: 'Risk-adjusted excess return per unit of total risk (Rf = 5%).',
      tooltipTerm: 'Sharpe Ratio',
      icon: <ShieldCheck className="w-4 h-4 text-cyan-400" />,
      sparkline: [1.1, 1.2, 1.15, 1.3, 1.45, currentMetric.sharpeRatio],
      variant: 'cyan' as const,
    },
    {
      title: 'Maximum Drawdown',
      value: `-${currentMetric.maxDrawdown.toFixed(2)}%`,
      description: 'Largest peak-to-trough equity decline observed in the sample.',
      tooltipTerm: 'Maximum Drawdown',
      icon: <ArrowDownRight className="w-4 h-4 text-rose-400" />,
      sparkline: [0, -3, -8, -14, -6, -currentMetric.maxDrawdown],
      variant: 'rose' as const,
    },
    {
      title: 'Rolling Return (30D)',
      value: formatPercentage(currentMetric.rollingReturn),
      change: currentMetric.rollingReturn,
      description: 'Point-to-point percentage change over rolling 30-day windows.',
      tooltipTerm: 'Rolling Return',
      icon: <RotateCw className="w-4 h-4 text-emerald-400" />,
      sparkline: currentMetric.sparkline,
      variant: 'emerald' as const,
    },
  ];

  return (
    <div className="space-y-6">
      {/* Section Header */}
      <div>
        <div className="inline-flex items-center gap-2 px-2.5 py-0.5 rounded-full bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 text-xs font-mono mb-1.5">
          <Activity className="w-3 h-3 animate-pulse" />
          MATHEMATICAL RISK & RETURN ENGINE
        </div>
        <h2 className="text-xl md:text-2xl font-bold text-white tracking-tight">
          Quantitative Indicator Engine
        </h2>
        <p className="text-xs text-slate-400 mt-1 max-w-3xl">
          Core quantitative finance statistics computed in real-time from historical bar series for{' '}
          <strong className="text-cyan-400 font-mono">{selectedAsset}</strong>.
        </p>
      </div>

      {/* Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {indicatorCards.map((card, idx) => (
          <MetricCard
            key={idx}
            title={card.title}
            value={card.value}
            change={card.change}
            description={card.description}
            tooltipTerm={card.tooltipTerm}
            icon={card.icon}
            sparklineData={card.sparkline}
            variant={card.variant}
          />
        ))}
      </div>

      {/* Rolling Return Interactive Chart */}
      <div className="glass-panel rounded-xl p-5 border border-slate-800">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-800">
          <div>
            <h3 className="text-sm font-semibold text-white tracking-wide uppercase flex items-center gap-2">
              <span>Rolling Return Distribution Chart</span>
              <span className="text-xs text-cyan-400 font-mono">({rollingWindow}-Day Window)</span>
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Tracks performance stability and regime shifts by measuring rolling point-to-point percentage returns.
            </p>
          </div>

          <div className="flex items-center gap-1.5 bg-dark-950 p-1 rounded-lg border border-slate-800 text-xs">
            <span className="text-slate-400 px-2 font-mono">Window:</span>
            {([30, 60, 90] as const).map((w) => (
              <button
                key={w}
                onClick={() => setRollingWindow(w)}
                className={`px-2.5 py-1 rounded text-xs font-semibold transition-colors ${
                  rollingWindow === w
                    ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/30'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                {w}D
              </button>
            ))}
          </div>
        </div>

        <div className="h-72 w-full mt-4">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={rollingChartData} margin={{ top: 10, right: 10, left: 10, bottom: 0 }}>
              <defs>
                <linearGradient id="rollingGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.4} />
                  <stop offset="95%" stopColor="#06b6d4" stopOpacity={0.0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#1f293d" vertical={false} opacity={0.5} />
              <XAxis
                dataKey="date"
                stroke="#64748b"
                fontSize={11}
                tickLine={false}
                tickFormatter={(str) => {
                  try {
                    const parts = str.split('-');
                    return `${parts[1]}/${parts[0]?.slice(2)}`;
                  } catch {
                    return str;
                  }
                }}
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
                      <div className="text-cyan-300 flex items-center justify-between gap-4">
                        <span>{rollingWindow}D Rolling Return:</span>
                        <span className="font-bold">{formatPercentage(val)}</span>
                      </div>
                    </div>
                  );
                }}
              />
              <Area
                type="monotone"
                dataKey="rollingReturn"
                stroke="#06b6d4"
                strokeWidth={2}
                fill="url(#rollingGradient)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};
