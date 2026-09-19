import React from 'react';
import { TrendingUp, TrendingDown } from 'lucide-react';
import { TermTooltip } from './TermTooltip';

interface MetricCardProps {
  title: string;
  value: string | number;
  change?: number;
  changeText?: string;
  description?: string;
  tooltipTerm?: string;
  sparklineData?: number[];
  variant?: 'cyan' | 'emerald' | 'rose' | 'amber' | 'indigo' | 'default';
  icon?: React.ReactNode;
}

export const MetricCard: React.FC<MetricCardProps> = ({
  title,
  value,
  change,
  changeText,
  description,
  tooltipTerm,
  sparklineData,
  variant = 'default',
  icon,
}) => {
  // Sparkline SVG coordinates
  let sparklinePath = '';
  if (sparklineData && sparklineData.length > 1) {
    const min = Math.min(...sparklineData);
    const max = Math.max(...sparklineData);
    const range = max - min || 1;
    const width = 100;
    const height = 30;

    const points = sparklineData.map((val, idx) => {
      const x = (idx / (sparklineData.length - 1)) * width;
      const y = height - ((val - min) / range) * (height - 6) - 3;
      return `${x.toFixed(1)},${y.toFixed(1)}`;
    });

    sparklinePath = `M ${points.join(' L ')}`;
  }

  const isPositive = change !== undefined ? change >= 0 : true;
  const strokeColor = isPositive ? '#10B981' : '#F43F5E';

  const variantBorders = {
    default: 'border-slate-800/80 hover:border-slate-700',
    cyan: 'border-cyan-500/30 hover:border-cyan-500/60 shadow-glow-cyan',
    emerald: 'border-emerald-500/30 hover:border-emerald-500/60 shadow-glow-emerald',
    rose: 'border-rose-500/30 hover:border-rose-500/60 shadow-glow-rose',
    amber: 'border-amber-500/30 hover:border-amber-500/60',
    indigo: 'border-indigo-500/30 hover:border-indigo-500/60',
  };

  return (
    <div className={`glass-panel rounded-xl p-4 transition-all duration-200 ${variantBorders[variant]} group relative overflow-hidden`}>
      {/* Top row */}
      <div className="flex items-center justify-between gap-2 mb-2">
        <div className="flex items-center gap-1.5 text-xs font-medium text-slate-400">
          {icon && <span className="text-slate-400 group-hover:text-cyan-400 transition-colors">{icon}</span>}
          <span>{title}</span>
          {tooltipTerm && <TermTooltip term={tooltipTerm} />}
        </div>
        {change !== undefined && (
          <div
            className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold tabular-nums ${
              isPositive
                ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                : 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
            }`}
          >
            {isPositive ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
            <span>{isPositive ? '+' : ''}{change.toFixed(2)}%</span>
          </div>
        )}
      </div>

      {/* Main value */}
      <div className="flex items-end justify-between gap-3">
        <div>
          <div className="text-xl md:text-2xl font-bold font-mono tracking-tight text-white tabular-nums">
            {value}
          </div>
          {changeText && (
            <p className="text-xs text-slate-400 mt-0.5">{changeText}</p>
          )}
          {description && (
            <p className="text-[11px] text-slate-500 mt-1 line-clamp-1">{description}</p>
          )}
        </div>

        {/* Sparkline */}
        {sparklinePath && (
          <div className="w-24 h-9 flex-shrink-0">
            <svg viewBox="0 0 100 30" className="w-full h-full overflow-visible">
              <path
                d={sparklinePath}
                fill="none"
                stroke={strokeColor}
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </div>
        )}
      </div>
    </div>
  );
};
