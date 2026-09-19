import React from 'react';
import { 
  ResponsiveContainer, 
  PieChart as RechartsPieChart, 
  Pie, 
  Cell, 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  Tooltip, 
  CartesianGrid 
} from 'recharts';
import { PieChart, ShieldCheck, TrendingUp, Zap, ArrowUpRight } from 'lucide-react';
import { useQuantPlatform } from '../../context/QuantPlatformContext';
import { formatCurrency, formatPercentage } from '../../utils/formatters';
import { TermTooltip } from '../common/TermTooltip';

export const PortfolioView: React.FC = () => {
  const { metrics, currency, bars } = useQuantPlatform();
  const portfolioMetric = metrics['PORTFOLIO'];

  const allocations = [
    { name: 'Gold (XAU)', value: 40, color: '#f59e0b', ticker: 'XAU/USD', role: 'Inflation & tail-risk hedge' },
    { name: 'Bitcoin (BTC)', value: 20, color: '#06b6d4', ticker: 'BTC/USD', role: 'Asymmetric capital appreciation' },
    { name: 'NVIDIA (NVDA)', value: 40, color: '#818cf8', ticker: 'NASDAQ: NVDA', role: 'Growth & thematic momentum' },
  ];

  if (!portfolioMetric) {
    return <div className="p-8 text-center text-slate-500">Compiling multi-asset portfolio metrics...</div>;
  }

  // Generate portfolio equity series from bars
  const portfolioEquityData = bars.map(b => ({
    date: b.date,
    value: b.close,
  }));

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <div className="inline-flex items-center gap-2 px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-xs font-mono mb-1.5">
          <PieChart className="w-3 h-3" />
          MULTI-ASSET ASSET ALLOCATION & RISK ATTRIBUTION
        </div>
        <h2 className="text-xl md:text-2xl font-bold text-white tracking-tight">
          Portfolio Analysis
        </h2>
        <p className="text-xs text-slate-400 mt-1 max-w-3xl">
          Multi-asset portfolio construction blending traditional safe-havens, crypto assets, and tech equities for balanced risk-adjusted compounding.
        </p>
      </div>

      {/* Portfolio Top KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        <div className="glass-panel p-4 rounded-xl border border-slate-800">
          <span className="text-xs text-slate-400 font-medium">Portfolio Value</span>
          <div className="text-xl font-bold font-mono text-white mt-1">
            {formatCurrency(portfolioMetric.currentPrice, currency)}
          </div>
          <span className="text-[11px] text-emerald-400 font-mono mt-0.5 block">
            Base: {formatCurrency(100000, currency)}
          </span>
        </div>

        <div className="glass-panel p-4 rounded-xl border border-slate-800">
          <span className="text-xs text-slate-400 font-medium">Total Return</span>
          <div className="text-xl font-bold font-mono text-emerald-400 mt-1">
            {formatPercentage(portfolioMetric.totalReturn)}
          </div>
          <span className="text-[11px] text-slate-400 font-mono mt-0.5 block">
            24h: {formatPercentage(portfolioMetric.dailyChangePct)}
          </span>
        </div>

        <div className="glass-panel p-4 rounded-xl border border-slate-800">
          <span className="text-xs text-slate-400 font-medium flex items-center gap-1">
            <span>Portfolio Volatility</span>
            <TermTooltip term="Volatility" />
          </span>
          <div className="text-xl font-bold font-mono text-amber-400 mt-1">
            {portfolioMetric.annualizedVolatility.toFixed(2)}%
          </div>
          <span className="text-[11px] text-slate-400 font-mono mt-0.5 block">
            Annualized Realized
          </span>
        </div>

        <div className="glass-panel p-4 rounded-xl border border-slate-800">
          <span className="text-xs text-slate-400 font-medium flex items-center gap-1">
            <span>Sharpe Ratio</span>
            <TermTooltip term="Sharpe Ratio" />
          </span>
          <div className="text-xl font-bold font-mono text-cyan-400 mt-1">
            {portfolioMetric.sharpeRatio.toFixed(2)}
          </div>
          <span className="text-[11px] text-emerald-400 font-mono mt-0.5 block">
            Optimal Risk-Adjusted
          </span>
        </div>

        <div className="glass-panel p-4 rounded-xl border border-slate-800">
          <span className="text-xs text-slate-400 font-medium flex items-center gap-1">
            <span>Max Drawdown</span>
            <TermTooltip term="Maximum Drawdown" />
          </span>
          <div className="text-xl font-bold font-mono text-rose-400 mt-1">
            -{portfolioMetric.maxDrawdown.toFixed(2)}%
          </div>
          <span className="text-[11px] text-slate-400 font-mono mt-0.5 block">
            Duration: {portfolioMetric.drawdownDuration}d
          </span>
        </div>
      </div>

      {/* Row: Allocation Donut & Asset Contribution */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Allocation Donut */}
        <div className="lg:col-span-5 glass-panel rounded-xl p-5 border border-slate-800">
          <div className="pb-3 border-b border-slate-800 mb-4">
            <h3 className="text-sm font-semibold text-white tracking-wide uppercase">
              Target Asset Allocation
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Strategic weights designed to optimize the diversification ratio.
            </p>
          </div>

          <div className="h-56 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <RechartsPieChart>
                <Pie
                  data={allocations}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={85}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {allocations.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} stroke="#0f172a" strokeWidth={2} />
                  ))}
                </Pie>
                <Tooltip
                  content={({ active, payload }) => {
                    if (!active || !payload || payload.length === 0) return null;
                    const d = payload[0].payload;
                    return (
                      <div className="glass-dropdown p-2.5 rounded-lg shadow-xl text-xs space-y-1 border border-slate-700 font-mono">
                        <div className="font-semibold text-white">{d.name}</div>
                        <div className="text-cyan-400">Target Weight: {d.value}%</div>
                        <div className="text-slate-400 text-[10px]">{d.role}</div>
                      </div>
                    );
                  }}
                />
              </RechartsPieChart>
            </ResponsiveContainer>
          </div>

          <div className="space-y-2 mt-2">
            {allocations.map(a => (
              <div key={a.name} className="flex items-center justify-between text-xs p-2 rounded bg-dark-950/60 border border-slate-800/80">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: a.color }} />
                  <span className="text-slate-200 font-medium">{a.name}</span>
                  <span className="text-[10px] text-slate-500 font-mono">({a.ticker})</span>
                </div>
                <span className="font-mono font-bold text-white">{a.value}%</span>
              </div>
            ))}
          </div>
        </div>

        {/* Portfolio Equity Curve */}
        <div className="lg:col-span-7 glass-panel rounded-xl p-5 border border-slate-800">
          <div className="pb-3 border-b border-slate-800 mb-4">
            <h3 className="text-sm font-semibold text-white tracking-wide uppercase">
              Combined Multi-Asset Equity Trajectory
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Historical performance of the balanced portfolio with quarterly rebalancing.
            </p>
          </div>

          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={portfolioEquityData} margin={{ top: 10, right: 10, left: 10, bottom: 0 }}>
                <defs>
                  <linearGradient id="portGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0.0} />
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
                  tickFormatter={(v) => formatCurrency(v, currency, true)}
                />
                <Tooltip
                  content={({ active, payload, label }) => {
                    if (!active || !payload || payload.length === 0) return null;
                    const val = payload[0].value as number;
                    return (
                      <div className="glass-dropdown p-2.5 rounded-lg shadow-xl text-xs space-y-1 border border-slate-700 font-mono">
                        <div className="font-semibold text-white">{label}</div>
                        <div className="text-emerald-400 flex items-center justify-between gap-4">
                          <span>Portfolio Value:</span>
                          <span className="font-bold">{formatCurrency(val, currency)}</span>
                        </div>
                      </div>
                    );
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="value"
                  stroke="#10b981"
                  strokeWidth={2}
                  fill="url(#portGrad)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          <div className="mt-3 pt-3 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400 font-mono">
            <span>Rebalancing: Quarterly Reset to Target Weights</span>
            <span className="text-emerald-400">Total Return: {formatPercentage(portfolioMetric.totalReturn)}</span>
          </div>
        </div>
      </div>
    </div>
  );
};
