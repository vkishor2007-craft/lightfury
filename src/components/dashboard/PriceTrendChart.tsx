import React, { useState } from 'react';
import { 
  ResponsiveContainer, 
  ComposedChart, 
  Line, 
  Bar, 
  XAxis, 
  YAxis, 
  Tooltip, 
  ReferenceDot,
  CartesianGrid
} from 'recharts';
import { Layers, Eye, EyeOff, Calendar } from 'lucide-react';
import { useQuantPlatform } from '../../context/QuantPlatformContext';
import { TimeframeId } from '../../types/quant';
import { formatCurrency, formatNumber } from '../../utils/formatters';
import { TermTooltip } from '../common/TermTooltip';

export const PriceTrendChart: React.FC = () => {
  const { 
    bars, 
    selectedAsset, 
    selectedTimeframe, 
    setSelectedTimeframe, 
    currency 
  } = useQuantPlatform();

  // Toggles
  const [showPrice, setShowPrice] = useState(true);
  const [showSMA, setShowSMA] = useState(true);
  const [showEMA, setShowEMA] = useState(true);
  const [showVolume, setShowVolume] = useState(true);
  const [showSignals, setShowSignals] = useState(true);

  // Filter signals for reference dots
  const buySignals = showSignals ? bars.filter(b => b.signal === 'BUY') : [];
  const sellSignals = showSignals ? bars.filter(b => b.signal === 'SELL') : [];

  const timeframes: TimeframeId[] = ['1M', '6M', '1Y', '3Y', '5Y'];

  return (
    <div className="glass-panel rounded-xl p-5 border border-slate-800">
      {/* Header with Title, Toggles and Timeframes */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-base font-bold text-white tracking-wide flex items-center gap-2">
              <span>Price & Trend Analysis</span>
              <span className="text-xs font-mono font-normal px-2 py-0.5 rounded bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
                {selectedAsset}
              </span>
            </h2>
            <TermTooltip term="SMA" />
          </div>
          <p className="text-xs text-slate-400 mt-0.5">
            Historical price action with dual moving averages, volume confirmation, and algorithmic crossover signals.
          </p>
        </div>

        {/* Controls: Timeframe + Layer toggles */}
        <div className="flex flex-wrap items-center gap-3">
          {/* Timeframe selector */}
          <div className="flex items-center gap-1 bg-dark-950 p-1 rounded-lg border border-slate-800 text-xs">
            <Calendar className="w-3.5 h-3.5 text-slate-400 ml-1.5" />
            {timeframes.map((tf) => (
              <button
                key={tf}
                onClick={() => setSelectedTimeframe(tf)}
                className={`px-2.5 py-1 rounded text-xs font-semibold transition-colors ${
                  selectedTimeframe === tf
                    ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/30'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                {tf}
              </button>
            ))}
          </div>

          {/* Layer toggles */}
          <div className="flex items-center gap-2 bg-dark-950 px-2.5 py-1 rounded-lg border border-slate-800 text-xs">
            <label className="flex items-center gap-1 cursor-pointer text-slate-300 hover:text-white">
              <input
                type="checkbox"
                checked={showPrice}
                onChange={() => setShowPrice(!showPrice)}
                className="rounded border-slate-700 text-cyan-500 focus:ring-0 w-3.5 h-3.5 bg-dark-900"
              />
              <span className="text-[11px] text-cyan-400">Price</span>
            </label>

            <label className="flex items-center gap-1 cursor-pointer text-slate-300 hover:text-white">
              <input
                type="checkbox"
                checked={showSMA}
                onChange={() => setShowSMA(!showSMA)}
                className="rounded border-slate-700 text-amber-500 focus:ring-0 w-3.5 h-3.5 bg-dark-900"
              />
              <span className="text-[11px] text-amber-400">SMA</span>
            </label>

            <label className="flex items-center gap-1 cursor-pointer text-slate-300 hover:text-white">
              <input
                type="checkbox"
                checked={showEMA}
                onChange={() => setShowEMA(!showEMA)}
                className="rounded border-slate-700 text-indigo-400 focus:ring-0 w-3.5 h-3.5 bg-dark-900"
              />
              <span className="text-[11px] text-indigo-400">EMA</span>
            </label>

            <label className="flex items-center gap-1 cursor-pointer text-slate-300 hover:text-white">
              <input
                type="checkbox"
                checked={showVolume}
                onChange={() => setShowVolume(!showVolume)}
                className="rounded border-slate-700 text-slate-400 focus:ring-0 w-3.5 h-3.5 bg-dark-900"
              />
              <span className="text-[11px] text-slate-400">Volume</span>
            </label>

            <label className="flex items-center gap-1 cursor-pointer text-slate-300 hover:text-white">
              <input
                type="checkbox"
                checked={showSignals}
                onChange={() => setShowSignals(!showSignals)}
                className="rounded border-slate-700 text-emerald-400 focus:ring-0 w-3.5 h-3.5 bg-dark-900"
              />
              <span className="text-[11px] text-emerald-400">Signals</span>
            </label>
          </div>
        </div>
      </div>

      {/* Chart Canvas */}
      <div className="h-80 md:h-96 w-full mt-4">
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart data={bars} margin={{ top: 10, right: 10, left: 10, bottom: 0 }}>
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
            {/* Price Axis */}
            <YAxis
              yAxisId="price"
              domain={['auto', 'auto']}
              stroke="#64748b"
              fontSize={11}
              orientation="right"
              tickLine={false}
              tickFormatter={(v) => formatCurrency(v, currency, true)}
            />
            {/* Volume Axis */}
            {showVolume && (
              <YAxis
                yAxisId="volume"
                domain={[0, (dataMax: number) => dataMax * 4]}
                orientation="left"
                stroke="#475569"
                fontSize={10}
                tickLine={false}
                tickFormatter={(v) => `${(v / 1_000_000).toFixed(0)}M`}
              />
            )}

            <Tooltip
              content={({ active, payload, label }) => {
                if (!active || !payload || payload.length === 0) return null;
                const data = payload[0].payload;
                return (
                  <div className="glass-dropdown p-3 rounded-lg shadow-xl text-xs space-y-1.5 border border-slate-700 font-mono">
                    <div className="font-semibold text-white border-b border-slate-800 pb-1 flex items-center justify-between">
                      <span>{label}</span>
                      {data.signal && (
                        <span
                          className={`text-[10px] px-1.5 py-0.2 rounded font-bold ${
                            data.signal === 'BUY'
                              ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                              : 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                          }`}
                        >
                          SIGNAL: {data.signal}
                        </span>
                      )}
                    </div>
                    <div className="flex justify-between gap-4 text-cyan-300">
                      <span>Close:</span>
                      <span className="font-bold">{formatCurrency(data.close, currency)}</span>
                    </div>
                    {data.smaFast !== undefined && showSMA && (
                      <div className="flex justify-between gap-4 text-amber-400">
                        <span>Fast SMA:</span>
                        <span>{formatCurrency(data.smaFast, currency)}</span>
                      </div>
                    )}
                    {data.smaSlow !== undefined && showSMA && (
                      <div className="flex justify-between gap-4 text-orange-400">
                        <span>Slow SMA:</span>
                        <span>{formatCurrency(data.smaSlow, currency)}</span>
                      </div>
                    )}
                    {data.ema !== undefined && showEMA && (
                      <div className="flex justify-between gap-4 text-indigo-400">
                        <span>EMA:</span>
                        <span>{formatCurrency(data.ema, currency)}</span>
                      </div>
                    )}
                    {showVolume && (
                      <div className="flex justify-between gap-4 text-slate-400">
                        <span>Volume:</span>
                        <span>{formatNumber(data.volume, 0)}</span>
                      </div>
                    )}
                  </div>
                );
              }}
            />

            {/* Volume bars at bottom */}
            {showVolume && (
              <Bar
                yAxisId="volume"
                dataKey="volume"
                fill="#1e293b"
                opacity={0.6}
                radius={[2, 2, 0, 0]}
              />
            )}

            {/* Price Line */}
            {showPrice && (
              <Line
                yAxisId="price"
                type="monotone"
                dataKey="close"
                stroke="#06b6d4"
                strokeWidth={2}
                dot={false}
                name="Price"
              />
            )}

            {/* SMA Lines */}
            {showSMA && (
              <>
                <Line
                  yAxisId="price"
                  type="monotone"
                  dataKey="smaFast"
                  stroke="#f59e0b"
                  strokeWidth={1.5}
                  strokeDasharray="4 2"
                  dot={false}
                  name="SMA Fast"
                />
                <Line
                  yAxisId="price"
                  type="monotone"
                  dataKey="smaSlow"
                  stroke="#fb923c"
                  strokeWidth={1.5}
                  strokeDasharray="6 3"
                  dot={false}
                  name="SMA Slow"
                />
              </>
            )}

            {/* EMA Line */}
            {showEMA && (
              <Line
                yAxisId="price"
                type="monotone"
                dataKey="ema"
                stroke="#818cf8"
                strokeWidth={1.5}
                dot={false}
                name="EMA"
              />
            )}

            {/* Buy Signals */}
            {showSignals &&
              buySignals.map((bar, idx) => (
                <ReferenceDot
                  key={`buy-${idx}`}
                  yAxisId="price"
                  x={bar.date}
                  y={bar.close}
                  r={5}
                  fill="#10b981"
                  stroke="#ffffff"
                  strokeWidth={1.5}
                />
              ))}

            {/* Sell Signals */}
            {showSignals &&
              sellSignals.map((bar, idx) => (
                <ReferenceDot
                  key={`sell-${idx}`}
                  yAxisId="price"
                  x={bar.date}
                  y={bar.close}
                  r={5}
                  fill="#f43f5e"
                  stroke="#ffffff"
                  strokeWidth={1.5}
                />
              ))}
          </ComposedChart>
        </ResponsiveContainer>
      </div>

      {/* Legend & Indicator Guide */}
      <div className="flex flex-wrap items-center justify-between gap-4 mt-3 pt-3 border-t border-slate-800/80 text-xs text-slate-400 font-mono">
        <div className="flex flex-wrap items-center gap-4">
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-0.5 bg-cyan-400"></span>
            <span>Price Close</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-0.5 bg-amber-400 stroke-dasharray"></span>
            <span>Fast SMA</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-0.5 bg-orange-400 stroke-dasharray"></span>
            <span>Slow SMA</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-0.5 bg-indigo-400"></span>
            <span>EMA (20)</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 border border-white"></span>
            <span>Buy Signal</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-rose-400 border border-white"></span>
            <span>Sell Signal</span>
          </div>
        </div>

        <div className="text-[11px] text-slate-500">
          Dual-Axis Composed Canvas
        </div>
      </div>
    </div>
  );
};
