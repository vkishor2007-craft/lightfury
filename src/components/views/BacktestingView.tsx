import React, { useState } from 'react';
import { 
  ResponsiveContainer, 
  ComposedChart, 
  Line, 
  Area, 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  Tooltip, 
  CartesianGrid, 
  Legend 
} from 'recharts';
import { 
  PlaySquare, 
  Sliders, 
  TrendingUp, 
  ShieldCheck, 
  Percent, 
  DollarSign, 
  ArrowRight,
  Download,
  FileText,
  AlertCircle
} from 'lucide-react';
import { useQuantPlatform } from '../../context/QuantPlatformContext';
import { AssetId, StrategyType } from '../../types/quant';
import { formatCurrency, formatPercentage, formatNumber } from '../../utils/formatters';
import { TermTooltip } from '../common/TermTooltip';
import { exportBacktestSummaryCSV, exportTradesToCSV, downloadResearchReport } from '../../services/exportService';

export const BacktestingView: React.FC = () => {
  const { 
    backtestParams, 
    setBacktestParams, 
    backtestResult, 
    isBacktesting, 
    runBacktest, 
    currency 
  } = useQuantPlatform();

  const [activeTab, setActiveTab] = useState<'equity' | 'benchmark' | 'monthly'>('equity');

  if (!backtestResult) {
    return (
      <div className="p-12 text-center text-slate-500 font-mono">
        Initializing Backtesting Simulation Engine...
      </div>
    );
  }

  const strategies: { id: StrategyType; label: string; desc: string }[] = [
    { id: 'SMA_CROSSOVER', label: 'SMA Crossover', desc: 'Fast SMA crossing Slow SMA trend filter' },
    { id: 'EMA_TREND', label: 'EMA Trend', desc: 'Exponential moving average directional momentum' },
    { id: 'MOMENTUM', label: 'Rate of Change Momentum', desc: 'N-day price velocity break confirmation' },
    { id: 'MEAN_REVERSION', label: 'Mean Reversion', desc: 'Price deviation counter-trend reversion' },
  ];

  const assets: AssetId[] = ['GOLD', 'BTC', 'NVDA'];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-2.5 py-0.5 rounded-full bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 text-xs font-mono mb-1.5">
            <PlaySquare className="w-3 h-3" />
            QUANTITATIVE SIMULATION LABORATORY
          </div>
          <h2 className="text-xl md:text-2xl font-bold text-white tracking-tight">
            Strategy Backtesting Engine
          </h2>
          <p className="text-xs text-slate-400 mt-1 max-w-3xl">
            Simulate algorithmic trading models on multi-year historical bars with realistic transaction costs, position sizing, and slippage.
          </p>
        </div>

        {/* Action / Export Buttons */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => exportBacktestSummaryCSV(backtestResult, backtestParams.strategy)}
            className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-dark-800 hover:bg-dark-750 text-slate-300 border border-slate-700/80 text-xs font-medium transition-colors"
            title="Export CSV Summary"
          >
            <Download className="w-3.5 h-3.5 text-cyan-400" />
            <span className="hidden sm:inline">Export CSV</span>
          </button>
          <button
            onClick={() => downloadResearchReport(backtestResult, backtestParams)}
            className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-dark-800 hover:bg-dark-750 text-slate-300 border border-slate-700/80 text-xs font-medium transition-colors"
            title="Download JSON Report"
          >
            <FileText className="w-3.5 h-3.5 text-indigo-400" />
            <span className="hidden sm:inline">JSON Report</span>
          </button>
        </div>
      </div>

      {/* Input Parameters Panel */}
      <div className="glass-panel rounded-xl p-5 border border-slate-800">
        <div className="flex items-center justify-between pb-3 border-b border-slate-800 mb-4">
          <div className="flex items-center gap-2 text-sm font-semibold text-white tracking-wide uppercase">
            <Sliders className="w-4 h-4 text-cyan-400" />
            <span>Backtest Configuration Parameters</span>
          </div>
          <span className="text-xs font-mono text-slate-400">
            Execution Lag: 1-Bar Close Fill
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-xs">
          {/* Asset */}
          <div>
            <label className="block text-slate-400 mb-1 font-medium">Asset Under Test</label>
            <select
              value={backtestParams.asset}
              onChange={(e) => setBacktestParams({ asset: e.target.value as AssetId })}
              className="w-full bg-dark-950 border border-slate-800 rounded-lg px-3 py-2 text-slate-200 focus:outline-none focus:border-cyan-500 font-mono"
            >
              {assets.map(a => (
                <option key={a} value={a}>{a}</option>
              ))}
            </select>
          </div>

          {/* Strategy */}
          <div>
            <label className="block text-slate-400 mb-1 font-medium">Quantitative Model</label>
            <select
              value={backtestParams.strategy}
              onChange={(e) => setBacktestParams({ strategy: e.target.value as StrategyType })}
              className="w-full bg-dark-950 border border-slate-800 rounded-lg px-3 py-2 text-slate-200 focus:outline-none focus:border-cyan-500 font-mono"
            >
              {strategies.map(s => (
                <option key={s.id} value={s.id}>{s.label}</option>
              ))}
            </select>
          </div>

          {/* Initial Capital */}
          <div>
            <label className="block text-slate-400 mb-1 font-medium">Initial Capital</label>
            <input
              type="number"
              step="10000"
              value={backtestParams.initialCapital}
              onChange={(e) => setBacktestParams({ initialCapital: Number(e.target.value) || 100000 })}
              className="w-full bg-dark-950 border border-slate-800 rounded-lg px-3 py-2 text-slate-200 focus:outline-none focus:border-cyan-500 font-mono"
            />
          </div>

          {/* Position Sizing */}
          <div>
            <label className="block text-slate-400 mb-1 font-medium">
              Position Sizing ({backtestParams.positionSizePct}%)
            </label>
            <input
              type="range"
              min="20"
              max="100"
              step="10"
              value={backtestParams.positionSizePct}
              onChange={(e) => setBacktestParams({ positionSizePct: Number(e.target.value) })}
              className="w-full accent-cyan-500 mt-2"
            />
          </div>

          {/* Transaction Cost */}
          <div>
            <label className="block text-slate-400 mb-1 font-medium">
              Transaction Cost ({backtestParams.transactionCostPct}%)
            </label>
            <input
              type="number"
              step="0.05"
              min="0"
              max="2"
              value={backtestParams.transactionCostPct}
              onChange={(e) => setBacktestParams({ transactionCostPct: Number(e.target.value) || 0.1 })}
              className="w-full bg-dark-950 border border-slate-800 rounded-lg px-3 py-2 text-slate-200 focus:outline-none focus:border-cyan-500 font-mono"
            />
          </div>

          {/* Fast Period */}
          <div>
            <label className="block text-slate-400 mb-1 font-medium">Fast Period (Days)</label>
            <input
              type="number"
              min="3"
              max="50"
              value={backtestParams.fastPeriod}
              onChange={(e) => setBacktestParams({ fastPeriod: Number(e.target.value) || 10 })}
              className="w-full bg-dark-950 border border-slate-800 rounded-lg px-3 py-2 text-slate-200 focus:outline-none focus:border-cyan-500 font-mono"
            />
          </div>

          {/* Slow Period */}
          <div>
            <label className="block text-slate-400 mb-1 font-medium">Slow Period (Days)</label>
            <input
              type="number"
              min="15"
              max="200"
              value={backtestParams.slowPeriod}
              onChange={(e) => setBacktestParams({ slowPeriod: Number(e.target.value) || 50 })}
              className="w-full bg-dark-950 border border-slate-800 rounded-lg px-3 py-2 text-slate-200 focus:outline-none focus:border-cyan-500 font-mono"
            />
          </div>

          {/* Run Button */}
          <div className="flex items-end">
            <button
              onClick={runBacktest}
              disabled={isBacktesting}
              className="w-full h-10 flex items-center justify-center gap-2 rounded-lg bg-gradient-to-r from-cyan-500 to-indigo-600 hover:from-cyan-400 hover:to-indigo-500 text-white font-bold tracking-wider uppercase text-xs shadow-glow-cyan transition-all disabled:opacity-50"
            >
              <PlaySquare className={`w-4 h-4 ${isBacktesting ? 'animate-spin' : ''}`} />
              <span>{isBacktesting ? 'SIMULATING...' : 'RUN BACKTEST'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Backtest Results KPI Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        <div className="glass-panel p-3.5 rounded-xl border border-slate-800">
          <div className="text-[11px] text-slate-400 font-medium">Final Portfolio</div>
          <div className="text-lg font-bold font-mono text-white mt-1">
            {formatCurrency(backtestResult.finalValue, currency, true)}
          </div>
          <div className="text-[10px] text-slate-500 mt-0.5">
            Initial: {formatCurrency(backtestResult.initialCapital, currency, true)}
          </div>
        </div>

        <div className="glass-panel p-3.5 rounded-xl border border-slate-800">
          <div className="text-[11px] text-slate-400 font-medium">Net Profit / Loss</div>
          <div className={`text-lg font-bold font-mono mt-1 ${backtestResult.totalProfitLoss >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
            {formatCurrency(backtestResult.totalProfitLoss, currency, true)}
          </div>
          <div className="text-[10px] text-slate-500 mt-0.5">
            Return: {formatPercentage(backtestResult.totalReturnPct)}
          </div>
        </div>

        <div className="glass-panel p-3.5 rounded-xl border border-slate-800">
          <div className="text-[11px] text-slate-400 font-medium flex items-center gap-1">
            <span>Sharpe Ratio</span>
            <TermTooltip term="Sharpe Ratio" />
          </div>
          <div className="text-lg font-bold font-mono text-cyan-400 mt-1">
            {backtestResult.sharpeRatio.toFixed(2)}
          </div>
          <div className="text-[10px] text-slate-500 mt-0.5">
            B&H: {backtestResult.benchmarkSharpeRatio.toFixed(2)}
          </div>
        </div>

        <div className="glass-panel p-3.5 rounded-xl border border-slate-800">
          <div className="text-[11px] text-slate-400 font-medium flex items-center gap-1">
            <span>Max Drawdown</span>
            <TermTooltip term="Maximum Drawdown" />
          </div>
          <div className="text-lg font-bold font-mono text-rose-400 mt-1">
            -{backtestResult.maxDrawdown.toFixed(2)}%
          </div>
          <div className="text-[10px] text-slate-500 mt-0.5">
            B&H: -{backtestResult.benchmarkMaxDrawdown.toFixed(2)}%
          </div>
        </div>

        <div className="glass-panel p-3.5 rounded-xl border border-slate-800">
          <div className="text-[11px] text-slate-400 font-medium flex items-center gap-1">
            <span>Win Rate</span>
          </div>
          <div className="text-lg font-bold font-mono text-indigo-400 mt-1">
            {backtestResult.winRate.toFixed(1)}%
          </div>
          <div className="text-[10px] text-slate-500 mt-0.5">
            PF: {backtestResult.profitFactor.toFixed(2)}x
          </div>
        </div>

        <div className="glass-panel p-3.5 rounded-xl border border-slate-800">
          <div className="text-[11px] text-slate-400 font-medium flex items-center gap-1">
            <span>Trades Executed</span>
          </div>
          <div className="text-lg font-bold font-mono text-white mt-1">
            {backtestResult.numTrades}
          </div>
          <div className="text-[10px] text-slate-500 mt-0.5">
            Costs: {formatCurrency(backtestResult.transactionCosts, currency, true)}
          </div>
        </div>
      </div>

      {/* Main Charts: Tabs for Equity Curve, Benchmark Comparison, Monthly Returns */}
      <div className="glass-panel rounded-xl p-5 border border-slate-800">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setActiveTab('equity')}
              className={`text-xs font-semibold px-3 py-1.5 rounded-lg transition-colors ${
                activeTab === 'equity'
                  ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/30'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Portfolio Equity Curve
            </button>
            <button
              onClick={() => setActiveTab('benchmark')}
              className={`text-xs font-semibold px-3 py-1.5 rounded-lg transition-colors ${
                activeTab === 'benchmark'
                  ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/30'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Strategy vs. Buy & Hold
            </button>
            <button
              onClick={() => setActiveTab('monthly')}
              className={`text-xs font-semibold px-3 py-1.5 rounded-lg transition-colors ${
                activeTab === 'monthly'
                  ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/30'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Monthly Returns
            </button>
          </div>

          <span className="text-xs font-mono text-slate-400">
            Simulated Historical Performance
          </span>
        </div>

        {/* Tab 1: Equity Curve */}
        {activeTab === 'equity' && (
          <div className="h-80 w-full mt-4">
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart data={backtestResult.equityCurve} margin={{ top: 10, right: 10, left: 10, bottom: 0 }}>
                <defs>
                  <linearGradient id="equityGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#06b6d4" stopOpacity={0.0} />
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
                  domain={['auto', 'auto']}
                  tickFormatter={(v) => formatCurrency(v, currency, true)}
                />
                <Tooltip
                  content={({ active, payload, label }) => {
                    if (!active || !payload || payload.length === 0) return null;
                    const d = payload[0].payload;
                    return (
                      <div className="glass-dropdown p-3 rounded-lg shadow-xl text-xs space-y-1.5 border border-slate-700 font-mono">
                        <div className="font-semibold text-white border-b border-slate-800 pb-1">{label}</div>
                        <div className="text-cyan-300 flex justify-between gap-4">
                          <span>Strategy Equity:</span>
                          <span className="font-bold">{formatCurrency(d.strategyEquity, currency)}</span>
                        </div>
                        <div className="text-slate-400 flex justify-between gap-4">
                          <span>Benchmark Equity:</span>
                          <span>{formatCurrency(d.benchmarkEquity, currency)}</span>
                        </div>
                        <div className="text-rose-400 flex justify-between gap-4">
                          <span>Drawdown:</span>
                          <span>{d.drawdown.toFixed(2)}%</span>
                        </div>
                      </div>
                    );
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="strategyEquity"
                  stroke="#06b6d4"
                  strokeWidth={2}
                  fill="url(#equityGrad)"
                  name="Strategy Equity"
                />
                <Line
                  type="monotone"
                  dataKey="benchmarkEquity"
                  stroke="#64748b"
                  strokeWidth={1.5}
                  strokeDasharray="4 2"
                  dot={false}
                  name="Buy & Hold"
                />
              </ComposedChart>
            </ResponsiveContainer>
          </div>
        )}

        {/* Tab 2: Strategy vs Buy & Hold */}
        {activeTab === 'benchmark' && (
          <div className="space-y-4 mt-4">
            <div className="h-72 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <ComposedChart data={backtestResult.equityCurve} margin={{ top: 10, right: 10, left: 10, bottom: 0 }}>
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
                      const d = payload[0].payload;
                      return (
                        <div className="glass-dropdown p-3 rounded-lg shadow-xl text-xs space-y-1.5 border border-slate-700 font-mono">
                          <div className="font-semibold text-white border-b border-slate-800 pb-1">{label}</div>
                          <div className="text-cyan-300 flex justify-between gap-4">
                            <span>Strategy:</span>
                            <span className="font-bold">{formatCurrency(d.strategyEquity, currency)}</span>
                          </div>
                          <div className="text-amber-400 flex justify-between gap-4">
                            <span>Buy & Hold:</span>
                            <span className="font-bold">{formatCurrency(d.benchmarkEquity, currency)}</span>
                          </div>
                        </div>
                      );
                    }}
                  />
                  <Legend wrapperStyle={{ fontSize: '11px', fontFamily: 'monospace' }} />
                  <Line
                    type="monotone"
                    dataKey="strategyEquity"
                    name="Algorithmic Strategy"
                    stroke="#06b6d4"
                    strokeWidth={2}
                    dot={false}
                  />
                  <Line
                    type="monotone"
                    dataKey="benchmarkEquity"
                    name="Passive Buy & Hold"
                    stroke="#f59e0b"
                    strokeWidth={2}
                    strokeDasharray="4 2"
                    dot={false}
                  />
                </ComposedChart>
              </ResponsiveContainer>
            </div>

            {/* Comparison Table */}
            <div className="overflow-x-auto">
              <table className="w-full text-xs font-mono border-collapse">
                <thead>
                  <tr className="border-b border-slate-800 text-slate-400 text-left">
                    <th className="py-2 px-3">Performance Dimension</th>
                    <th className="py-2 px-3 text-cyan-400">Strategy ({backtestParams.strategy})</th>
                    <th className="py-2 px-3 text-amber-400">Buy & Hold Benchmark</th>
                    <th className="py-2 px-3 text-slate-300">Differential</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60 text-slate-200">
                  <tr>
                    <td className="py-2 px-3 font-semibold text-slate-400">Total Net Return</td>
                    <td className="py-2 px-3 text-cyan-400 font-bold">{formatPercentage(backtestResult.totalReturnPct)}</td>
                    <td className="py-2 px-3 text-amber-400">{formatPercentage(backtestResult.benchmarkReturnPct)}</td>
                    <td className="py-2 px-3">
                      {formatPercentage(backtestResult.totalReturnPct - backtestResult.benchmarkReturnPct)}
                    </td>
                  </tr>
                  <tr>
                    <td className="py-2 px-3 font-semibold text-slate-400">Annualized Volatility</td>
                    <td className="py-2 px-3 text-cyan-400">{backtestResult.volatility.toFixed(2)}%</td>
                    <td className="py-2 px-3 text-amber-400">{backtestResult.benchmarkVolatility.toFixed(2)}%</td>
                    <td className="py-2 px-3 text-emerald-400">
                      {(backtestResult.volatility - backtestResult.benchmarkVolatility).toFixed(2)}%
                    </td>
                  </tr>
                  <tr>
                    <td className="py-2 px-3 font-semibold text-slate-400">Sharpe Ratio</td>
                    <td className="py-2 px-3 text-cyan-400 font-bold">{backtestResult.sharpeRatio.toFixed(2)}</td>
                    <td className="py-2 px-3 text-amber-400">{backtestResult.benchmarkSharpeRatio.toFixed(2)}</td>
                    <td className="py-2 px-3">
                      {(backtestResult.sharpeRatio - backtestResult.benchmarkSharpeRatio).toFixed(2)}
                    </td>
                  </tr>
                  <tr>
                    <td className="py-2 px-3 font-semibold text-slate-400">Maximum Drawdown</td>
                    <td className="py-2 px-3 text-rose-400">-{backtestResult.maxDrawdown.toFixed(2)}%</td>
                    <td className="py-2 px-3 text-rose-400">-{backtestResult.benchmarkMaxDrawdown.toFixed(2)}%</td>
                    <td className="py-2 px-3 text-emerald-400">
                      {(backtestResult.benchmarkMaxDrawdown - backtestResult.maxDrawdown).toFixed(2)}% Better
                    </td>
                  </tr>
                  <tr>
                    <td className="py-2 px-3 font-semibold text-slate-400">Final Portfolio Value</td>
                    <td className="py-2 px-3 text-cyan-400 font-bold">
                      {formatCurrency(backtestResult.finalValue, currency)}
                    </td>
                    <td className="py-2 px-3 text-amber-400">
                      {formatCurrency(backtestResult.equityCurve[backtestResult.equityCurve.length - 1]?.benchmarkEquity || 0, currency)}
                    </td>
                    <td className="py-2 px-3">
                      {formatCurrency(backtestResult.finalValue - (backtestResult.equityCurve[backtestResult.equityCurve.length - 1]?.benchmarkEquity || 0), currency)}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Tab 3: Monthly Returns Chart */}
        {activeTab === 'monthly' && (
          <div className="h-80 w-full mt-4">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={backtestResult.monthlyReturns} margin={{ top: 10, right: 10, left: 10, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1f293d" vertical={false} opacity={0.5} />
                <XAxis
                  dataKey="month"
                  stroke="#64748b"
                  fontSize={11}
                  tickLine={false}
                  tickFormatter={(m, idx) => {
                    const item = backtestResult.monthlyReturns[idx];
                    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
                    return `${monthNames[m]} '${item ? String(item.year).slice(2) : ''}`;
                  }}
                />
                <YAxis
                  stroke="#64748b"
                  fontSize={11}
                  tickLine={false}
                  tickFormatter={(v) => `${v.toFixed(0)}%`}
                />
                <Tooltip
                  content={({ active, payload }) => {
                    if (!active || !payload || payload.length === 0) return null;
                    const d = payload[0].payload;
                    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
                    return (
                      <div className="glass-dropdown p-2.5 rounded-lg shadow-xl text-xs space-y-1 border border-slate-700 font-mono">
                        <div className="font-semibold text-white">{monthNames[d.month]} {d.year}</div>
                        <div className={`font-bold ${d.returnPct >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                          Monthly Return: {formatPercentage(d.returnPct)}
                        </div>
                      </div>
                    );
                  }}
                />
                <Bar
                  dataKey="returnPct"
                  fill="#06b6d4"
                  radius={[3, 3, 0, 0]}
                  // Color conditionally based on positive/negative
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>
    </div>
  );
};
