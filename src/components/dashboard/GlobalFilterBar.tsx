import React from 'react';
import { Play, RotateCcw, Filter, BarChart3, Clock, Target } from 'lucide-react';
import { useQuantPlatform } from '../../context/QuantPlatformContext';
import { AssetId, TimeframeId, IntervalId, BenchmarkId } from '../../types/quant';

export const GlobalFilterBar: React.FC = () => {
  const {
    selectedAsset,
    setSelectedAsset,
    selectedTimeframe,
    setSelectedTimeframe,
    selectedInterval,
    setSelectedInterval,
    selectedBenchmark,
    setSelectedBenchmark,
    runAnalysis,
    resetFilters,
    isAnalyzing,
  } = useQuantPlatform();

  const assets: { id: AssetId; label: string; ticker: string }[] = [
    { id: 'GOLD', label: 'Gold', ticker: 'XAU/USD' },
    { id: 'BTC', label: 'Bitcoin', ticker: 'BTC/USD' },
    { id: 'NVDA', label: 'NVIDIA', ticker: 'NASDAQ: NVDA' },
    { id: 'PORTFOLIO', label: 'Multi-Asset Portfolio', ticker: 'BALANCED' },
  ];

  const timeframes: { id: TimeframeId; label: string }[] = [
    { id: '1M', label: '1 Month' },
    { id: '6M', label: '6 Months' },
    { id: '1Y', label: '1 Year' },
    { id: '3Y', label: '3 Years' },
    { id: '5Y', label: '5 Years' },
    { id: 'CUSTOM', label: 'Custom' },
  ];

  const intervals: { id: IntervalId; label: string }[] = [
    { id: 'DAILY', label: 'Daily' },
    { id: 'WEEKLY', label: 'Weekly' },
    { id: 'MONTHLY', label: 'Monthly' },
  ];

  const benchmarks: { id: BenchmarkId; label: string }[] = [
    { id: 'BUY_AND_HOLD', label: 'Buy & Hold' },
    { id: 'NONE', label: 'None' },
  ];

  return (
    <div className="space-y-4">
      {/* Header text */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-2.5 py-0.5 rounded-full bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 text-xs font-mono mb-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse"></span>
            INSTITUTIONAL QUANT ENGINE
          </div>
          <h1 className="text-2xl md:text-3xl font-extrabold text-white tracking-tight">
            Quantitative Financial Intelligence
          </h1>
          <p className="text-xs md:text-sm text-slate-400 mt-1 max-w-3xl">
            Analyze multi-asset markets, measure risk and test quantitative strategies using historical data.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2.5">
          <button
            onClick={resetFilters}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-dark-800 hover:bg-dark-750 text-slate-300 hover:text-white border border-slate-700/80 text-xs font-medium transition-all"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset</span>
          </button>

          <button
            onClick={runAnalysis}
            disabled={isAnalyzing}
            className="flex items-center gap-2 px-5 py-2 rounded-lg bg-gradient-to-r from-cyan-500 to-indigo-600 hover:from-cyan-400 hover:to-indigo-500 text-white text-xs font-semibold shadow-glow-cyan transition-all disabled:opacity-50"
          >
            <Play className={`w-3.5 h-3.5 ${isAnalyzing ? 'animate-spin' : 'fill-white'}`} />
            <span>{isAnalyzing ? 'Analyzing Data...' : 'Run Analysis'}</span>
          </button>
        </div>
      </div>

      {/* Filter Toolbar */}
      <div className="glass-panel rounded-xl p-3.5 border border-slate-800 flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="flex flex-wrap items-center gap-3">
          {/* Asset selector */}
          <div className="flex items-center gap-1.5">
            <Filter className="w-3.5 h-3.5 text-cyan-400" />
            <span className="text-slate-400 font-medium">Asset:</span>
            <select
              value={selectedAsset}
              onChange={(e) => setSelectedAsset(e.target.value as AssetId)}
              className="bg-dark-950 border border-slate-800 rounded-lg px-2.5 py-1.5 text-slate-200 font-medium focus:outline-none focus:border-cyan-500 transition-colors"
            >
              {assets.map((a) => (
                <option key={a.id} value={a.id}>
                  {a.label} ({a.ticker})
                </option>
              ))}
            </select>
          </div>

          {/* Timeframe selector */}
          <div className="flex items-center gap-1.5">
            <Clock className="w-3.5 h-3.5 text-indigo-400" />
            <span className="text-slate-400 font-medium">Date:</span>
            <select
              value={selectedTimeframe}
              onChange={(e) => setSelectedTimeframe(e.target.value as TimeframeId)}
              className="bg-dark-950 border border-slate-800 rounded-lg px-2.5 py-1.5 text-slate-200 font-medium focus:outline-none focus:border-cyan-500 transition-colors"
            >
              {timeframes.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.label}
                </option>
              ))}
            </select>
          </div>

          {/* Interval selector */}
          <div className="flex items-center gap-1.5">
            <BarChart3 className="w-3.5 h-3.5 text-emerald-400" />
            <span className="text-slate-400 font-medium">Interval:</span>
            <select
              value={selectedInterval}
              onChange={(e) => setSelectedInterval(e.target.value as IntervalId)}
              className="bg-dark-950 border border-slate-800 rounded-lg px-2.5 py-1.5 text-slate-200 font-medium focus:outline-none focus:border-cyan-500 transition-colors"
            >
              {intervals.map((i) => (
                <option key={i.id} value={i.id}>
                  {i.label}
                </option>
              ))}
            </select>
          </div>

          {/* Benchmark selector */}
          <div className="flex items-center gap-1.5">
            <Target className="w-3.5 h-3.5 text-amber-400" />
            <span className="text-slate-400 font-medium">Benchmark:</span>
            <select
              value={selectedBenchmark}
              onChange={(e) => setSelectedBenchmark(e.target.value as BenchmarkId)}
              className="bg-dark-950 border border-slate-800 rounded-lg px-2.5 py-1.5 text-slate-200 font-medium focus:outline-none focus:border-cyan-500 transition-colors"
            >
              {benchmarks.map((b) => (
                <option key={b.id} value={b.id}>
                  {b.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Status indicator */}
        <div className="hidden xl:flex items-center gap-2 text-[11px] text-slate-400 font-mono">
          <span className="h-1.5 w-1.5 rounded-full bg-emerald-400"></span>
          <span>Sample: 1,260 Days Active</span>
        </div>
      </div>
    </div>
  );
};
