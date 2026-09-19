import React from 'react';
import { 
  ArrowRight, 
  Sparkles, 
  Activity, 
  GitFork, 
  PlaySquare, 
  ShieldAlert, 
  Sliders, 
  Layers, 
  History,
  Download,
  FileText
} from 'lucide-react';
import { useQuantPlatform } from '../../context/QuantPlatformContext';
import { GlobalFilterBar } from '../dashboard/GlobalFilterBar';
import { MarketOverviewCards } from '../dashboard/MarketOverviewCards';
import { PriceTrendChart } from '../dashboard/PriceTrendChart';
import { MetricCard } from '../common/MetricCard';
import { ReliabilityChecklist } from '../common/ReliabilityChecklist';
import { DataStatusBar } from '../common/DataStatusBar';
import { formatCurrency, formatPercentage } from '../../utils/formatters';
import { TermTooltip } from '../common/TermTooltip';
import { exportBacktestSummaryCSV, exportTradesToCSV, downloadResearchReport } from '../../services/exportService';

// Small inline charts/previews for the dashboard modules
import { 
  ResponsiveContainer, 
  AreaChart, 
  Area, 
  ComposedChart, 
  Line, 
  XAxis, 
  YAxis, 
  Tooltip, 
  CartesianGrid 
} from 'recharts';

export const DashboardView: React.FC = () => {
  const { 
    currentMetric, 
    backtestResult, 
    currency, 
    selectedAsset, 
    backtestParams,
    setBacktestParams,
    runBacktest,
    isBacktesting,
    setActiveView 
  } = useQuantPlatform();

  return (
    <div className="space-y-8">
      {/* 1. Global Filter Bar & Main Title */}
      <GlobalFilterBar />

      {/* 2. Market Overview 4 Large Metric Cards */}
      <MarketOverviewCards />

      {/* 3. Price & Trend Interactive Chart */}
      <PriceTrendChart />

      {/* 4. Quantitative Indicators Engine Strip */}
      {currentMetric && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold text-white tracking-wide uppercase flex items-center gap-2">
              <Activity className="w-4 h-4 text-cyan-400" />
              <span>Quantitative Indicator Engine</span>
            </h3>
            <button
              onClick={() => setActiveView('quant_indicators')}
              className="text-xs text-cyan-400 hover:text-cyan-300 flex items-center gap-1 font-mono"
            >
              <span>Explore Engine</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
            <MetricCard
              title="Daily Return"
              value={formatPercentage(currentMetric.dailyReturn)}
              change={currentMetric.dailyReturn}
              description="Single-day price change"
              tooltipTerm="Volatility"
              variant="cyan"
            />
            <MetricCard
              title="Annualized Volatility"
              value={`${currentMetric.annualizedVolatility.toFixed(2)}%`}
              description="Realized standard deviation"
              tooltipTerm="Volatility"
              variant="amber"
            />
            <MetricCard
              title="Sharpe Ratio"
              value={currentMetric.sharpeRatio.toFixed(2)}
              description="Risk-adjusted return (Rf 5%)"
              tooltipTerm="Sharpe Ratio"
              variant="indigo"
            />
            <MetricCard
              title="Max Drawdown"
              value={`-${currentMetric.maxDrawdown.toFixed(2)}%`}
              description="Peak to trough drop"
              tooltipTerm="Maximum Drawdown"
              variant="rose"
            />
            <MetricCard
              title="Rolling 30D Return"
              value={formatPercentage(currentMetric.rollingReturn)}
              change={currentMetric.rollingReturn}
              description="Trailing 30-day performance"
              tooltipTerm="Rolling Return"
              variant="emerald"
            />
          </div>
        </div>
      )}

      {/* 5. Dual Grid: Risk Analysis Snapshot & Cross-Asset Correlation Snapshot */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Risk Analysis Card */}
        <div className="glass-panel rounded-xl p-5 border border-slate-800 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-slate-800 mb-3">
              <h3 className="text-sm font-semibold text-white tracking-wide uppercase flex items-center gap-2">
                <ShieldAlert className="w-4 h-4 text-rose-400" />
                <span>Risk & Downside Exposure</span>
              </h3>
              <button
                onClick={() => setActiveView('risk_analysis')}
                className="text-xs text-rose-400 hover:text-rose-300 font-mono flex items-center gap-1"
              >
                <span>Full Risk View</span>
                <ArrowRight className="w-3 h-3" />
              </button>
            </div>

            <p className="text-xs text-slate-300 leading-relaxed mb-4">
              Maximum Drawdown measures the largest historical decline from a portfolio peak. Understanding underwater duration prevents premature strategy abandonment.
            </p>

            <div className="grid grid-cols-3 gap-2 text-center font-mono">
              <div className="p-3 rounded-lg bg-dark-950/80 border border-slate-800">
                <span className="text-[10px] text-slate-500 block">Peak-Trough Drop</span>
                <span className="text-base font-bold text-rose-400">
                  -{currentMetric?.maxDrawdown.toFixed(2)}%
                </span>
              </div>
              <div className="p-3 rounded-lg bg-dark-950/80 border border-slate-800">
                <span className="text-[10px] text-slate-500 block">Duration</span>
                <span className="text-base font-bold text-slate-200">
                  {currentMetric?.drawdownDuration}d
                </span>
              </div>
              <div className="p-3 rounded-lg bg-dark-950/80 border border-slate-800">
                <span className="text-[10px] text-slate-500 block">Realized Vol</span>
                <span className="text-base font-bold text-amber-400">
                  {currentMetric?.annualizedVolatility.toFixed(1)}%
                </span>
              </div>
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-800 flex items-center justify-between text-[11px] text-slate-500 font-mono">
            <span>Historical Stress Bounds: 99% VaR</span>
            <span className="text-emerald-400">Capital Protected</span>
          </div>
        </div>

        {/* Correlation Snapshot Card */}
        <div className="glass-panel rounded-xl p-5 border border-slate-800 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-slate-800 mb-3">
              <h3 className="text-sm font-semibold text-white tracking-wide uppercase flex items-center gap-2">
                <GitFork className="w-4 h-4 text-cyan-400" />
                <span>Cross-Asset Correlation</span>
              </h3>
              <button
                onClick={() => setActiveView('correlation')}
                className="text-xs text-cyan-400 hover:text-cyan-300 font-mono flex items-center gap-1"
              >
                <span>Heatmap & Matrix</span>
                <ArrowRight className="w-3 h-3" />
              </button>
            </div>

            <p className="text-xs text-slate-300 leading-relaxed mb-4">
              Correlation shows how two assets have historically moved relative to each other. Low correlation between Gold and Tech drives institutional portfolio resilience.
            </p>

            <div className="grid grid-cols-3 gap-2 text-center font-mono">
              <div className="p-3 rounded-lg bg-dark-950/80 border border-slate-800">
                <span className="text-[10px] text-slate-500 block">Gold vs. BTC</span>
                <span className="text-base font-bold text-cyan-400">+0.12</span>
              </div>
              <div className="p-3 rounded-lg bg-dark-950/80 border border-slate-800">
                <span className="text-[10px] text-slate-500 block">Gold vs. NVDA</span>
                <span className="text-base font-bold text-emerald-400">+0.04</span>
              </div>
              <div className="p-3 rounded-lg bg-dark-950/80 border border-slate-800">
                <span className="text-[10px] text-slate-500 block">BTC vs. NVDA</span>
                <span className="text-base font-bold text-indigo-400">+0.48</span>
              </div>
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-800 flex items-center justify-between text-[11px] text-slate-500 font-mono">
            <span>Optimal Diversification: Near Zero</span>
            <span className="text-cyan-400">Low Co-Movement</span>
          </div>
        </div>
      </div>

      {/* 6. Backtesting Engine Fast Runner & Strategy vs Buy & Hold */}
      {backtestResult && (
        <div className="glass-panel rounded-xl p-5 border border-slate-800 space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-800">
            <div>
              <h3 className="text-sm font-semibold text-white tracking-wide uppercase flex items-center gap-2">
                <PlaySquare className="w-4 h-4 text-cyan-400" />
                <span>Strategy Backtesting Engine Snapshot</span>
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Simulated execution: <strong className="text-white">{backtestParams.strategy}</strong> on <strong className="text-white">{backtestParams.asset}</strong> with 0.10% transaction friction.
              </p>
            </div>

            <button
              onClick={() => setActiveView('backtesting')}
              className="px-3.5 py-1.5 rounded-lg bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 text-xs font-mono hover:bg-cyan-500/30 flex items-center gap-1.5 self-start sm:self-auto"
            >
              <span>Open Full Backtester</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Quick Metrics Bar */}
          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-3">
            <div className="p-3 rounded-lg bg-dark-950/80 border border-slate-800">
              <span className="text-[10px] text-slate-500 font-mono block">Final Value</span>
              <span className="text-base font-bold font-mono text-white">
                {formatCurrency(backtestResult.finalValue, currency, true)}
              </span>
            </div>
            <div className="p-3 rounded-lg bg-dark-950/80 border border-slate-800">
              <span className="text-[10px] text-slate-500 font-mono block">Total Net Return</span>
              <span className={`text-base font-bold font-mono ${backtestResult.totalReturnPct >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                {formatPercentage(backtestResult.totalReturnPct)}
              </span>
            </div>
            <div className="p-3 rounded-lg bg-dark-950/80 border border-slate-800">
              <span className="text-[10px] text-slate-500 font-mono block">Buy & Hold Return</span>
              <span className="text-base font-bold font-mono text-amber-400">
                {formatPercentage(backtestResult.benchmarkReturnPct)}
              </span>
            </div>
            <div className="p-3 rounded-lg bg-dark-950/80 border border-slate-800">
              <span className="text-[10px] text-slate-500 font-mono block">Strategy Sharpe</span>
              <span className="text-base font-bold font-mono text-cyan-400">
                {backtestResult.sharpeRatio.toFixed(2)}
              </span>
            </div>
            <div className="p-3 rounded-lg bg-dark-950/80 border border-slate-800">
              <span className="text-[10px] text-slate-500 font-mono block">Max Drawdown</span>
              <span className="text-base font-bold font-mono text-rose-400">
                -{backtestResult.maxDrawdown.toFixed(2)}%
              </span>
            </div>
            <div className="p-3 rounded-lg bg-dark-950/80 border border-slate-800">
              <span className="text-[10px] text-slate-500 font-mono block">Trades Executed</span>
              <span className="text-base font-bold font-mono text-white">
                {backtestResult.numTrades}
              </span>
            </div>
          </div>

          {/* Equity Curve Preview Chart */}
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart data={backtestResult.equityCurve} margin={{ top: 10, right: 10, left: 10, bottom: 0 }}>
                <defs>
                  <linearGradient id="dashEquityGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#06b6d4" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#1f293d" vertical={false} opacity={0.5} />
                <XAxis dataKey="date" stroke="#64748b" fontSize={11} tickLine={false} tickFormatter={(str) => str.slice(2, 7)} />
                <YAxis stroke="#64748b" fontSize={11} tickLine={false} tickFormatter={(v) => formatCurrency(v, currency, true)} />
                <Tooltip
                  content={({ active, payload, label }) => {
                    if (!active || !payload || payload.length === 0) return null;
                    const d = payload[0].payload;
                    return (
                      <div className="glass-dropdown p-2.5 rounded-lg shadow-xl text-xs space-y-1 border border-slate-700 font-mono">
                        <div className="font-semibold text-white">{label}</div>
                        <div className="text-cyan-400">Strategy: {formatCurrency(d.strategyEquity, currency)}</div>
                        <div className="text-amber-400">Benchmark: {formatCurrency(d.benchmarkEquity, currency)}</div>
                      </div>
                    );
                  }}
                />
                <Area type="monotone" dataKey="strategyEquity" stroke="#06b6d4" strokeWidth={2} fill="url(#dashEquityGrad)" name="Strategy Equity" />
                <Line type="monotone" dataKey="benchmarkEquity" stroke="#f59e0b" strokeWidth={1.5} strokeDasharray="4 2" dot={false} name="Buy & Hold" />
              </ComposedChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {/* 7. Unique Feature Showcase Banner: Financial Strategy Laboratory */}
      <div className="glass-panel rounded-2xl p-6 border border-cyan-500/30 bg-gradient-to-r from-dark-900 via-cyan-950/20 to-indigo-950/20 relative overflow-hidden">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="space-y-1.5">
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 text-[11px] font-mono">
              <Sparkles className="w-3 h-3 text-cyan-400 animate-pulse" />
              SIGNATURE QUANT PIPELINE
            </div>
            <h3 className="text-lg font-bold text-white tracking-wide">
              Financial Strategy Laboratory
            </h3>
            <p className="text-xs text-slate-300 max-w-2xl leading-relaxed">
              Step through our 10-stage quantitative lifecycle: from raw market data, indicators, risk thresholds, trade simulations, and buy & hold comparisons to parameter robustness and regime tests.
            </p>
          </div>

          <button
            onClick={() => setActiveView('strategy_lab')}
            className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-indigo-600 hover:from-cyan-400 hover:to-indigo-500 text-white text-xs font-bold font-mono tracking-wider shadow-glow-cyan transition-all flex items-center gap-2 whitespace-nowrap"
          >
            <span>LAUNCH LABORATORY</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* 8. Backtest Reliability & Data Status & Export Center */}
      <div className="space-y-4">
        <ReliabilityChecklist />
        <DataStatusBar />
      </div>

      {/* Quick Export Bar */}
      <div className="flex flex-wrap items-center justify-between gap-4 p-4 rounded-xl glass-panel border border-slate-800">
        <div className="text-xs text-slate-300 font-medium">
          Export Quantitative Research Artifacts:
        </div>
        <div className="flex items-center gap-2">
          {backtestResult && (
            <>
              <button
                onClick={() => exportTradesToCSV(backtestResult.trades, backtestParams.asset)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-dark-800 hover:bg-dark-750 text-slate-200 border border-slate-700 text-xs font-mono transition-colors"
              >
                <Download className="w-3.5 h-3.5 text-cyan-400" />
                <span>Export Trades CSV</span>
              </button>
              <button
                onClick={() => exportBacktestSummaryCSV(backtestResult, backtestParams.strategy)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-dark-800 hover:bg-dark-750 text-slate-200 border border-slate-700 text-xs font-mono transition-colors"
              >
                <Download className="w-3.5 h-3.5 text-emerald-400" />
                <span>Export Summary CSV</span>
              </button>
              <button
                onClick={() => downloadResearchReport(backtestResult, backtestParams)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-dark-800 hover:bg-dark-750 text-slate-200 border border-slate-700 text-xs font-mono transition-colors"
              >
                <FileText className="w-3.5 h-3.5 text-indigo-400" />
                <span>Download Report</span>
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};
