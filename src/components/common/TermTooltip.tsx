import React, { useState } from 'react';
import { HelpCircle } from 'lucide-react';

export const QUANT_DEFINITIONS: Record<string, string> = {
  'SMA': 'Simple Moving Average: The unweighted mean of the previous N price bars, smoothing out price noise to identify trends.',
  'EMA': 'Exponential Moving Average: A moving average that places greater weight and significance on the most recent data points.',
  'Volatility': 'Annualized standard deviation of returns, measuring the dispersion and uncertainty of price fluctuations over time.',
  'Sharpe Ratio': 'The excess return of an investment above the risk-free rate per unit of volatility. A Sharpe > 1.0 is considered good; > 2.0 is exceptional.',
  'Maximum Drawdown': 'The maximum observed loss from a peak to a trough before a new peak is achieved, reflecting worst-case capital decline.',
  'Drawdown Duration': 'The maximum consecutive number of calendar/trading days an investment remained below its prior peak equity value.',
  'Rolling Return': 'The annualized average return over a rolling window (e.g. 30 or 90 days), revealing return consistency across different market cycles.',
  'Correlation': 'A statistical measure (-1.0 to +1.0) showing how two assets move in relation to each other. Values near 0 indicate diversification benefits.',
  'Backtesting': 'The process of testing a quantitative trading strategy on relevant historical data to assess its historical viability.',
  'Look-ahead Bias': 'A modeling flaw where future data or prices are inadvertently used in historical calculations, creating unrealistically high returns.',
  'Transaction Costs': 'Commissions, exchange fees, and market impact/slippage incurred on every trade entry and exit.',
  'Position Sizing': 'The percentage of available capital allocated to a single trade or asset position to manage exposure and risk.',
  'Profit Factor': 'The ratio of gross profits to gross losses. Values above 1.5 indicate a robust historical edge.',
};

interface TermTooltipProps {
  term: keyof typeof QUANT_DEFINITIONS | string;
  customText?: string;
  children?: React.ReactNode;
}

export const TermTooltip: React.FC<TermTooltipProps> = ({ term, customText, children }) => {
  const [isOpen, setIsOpen] = useState(false);
  const text = customText || QUANT_DEFINITIONS[term] || `Quantitative definition for ${term}`;

  return (
    <span className="relative inline-flex items-center group cursor-pointer"
      onMouseEnter={() => setIsOpen(true)}
      onMouseLeave={() => setIsOpen(false)}
    >
      {children || (
        <span className="text-slate-400 hover:text-cyan-400 transition-colors ml-1">
          <HelpCircle className="w-3.5 h-3.5 inline" />
        </span>
      )}

      {isOpen && (
        <div className="absolute z-50 bottom-full left-1/2 -translate-x-1/2 mb-2 w-64 p-3 bg-dark-900 border border-slate-700/80 rounded-lg shadow-2xl text-xs text-slate-200 backdrop-blur-xl pointer-events-none animate-in fade-in zoom-in-95 duration-150">
          <div className="font-semibold text-cyan-400 mb-1 flex items-center gap-1.5">
            <span>{term}</span>
          </div>
          <p className="leading-relaxed text-slate-300">{text}</p>
          <div className="absolute top-full left-1/2 -translate-x-1/2 -mt-1 border-4 border-transparent border-t-dark-900" />
        </div>
      )}
    </span>
  );
};
