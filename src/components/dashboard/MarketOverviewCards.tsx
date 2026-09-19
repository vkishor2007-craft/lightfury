import React from 'react';
import { Coins, Flame, Cpu, PieChart } from 'lucide-react';
import { useQuantPlatform } from '../../context/QuantPlatformContext';
import { MetricCard } from '../common/MetricCard';
import { formatCurrency, formatPercentage } from '../../utils/formatters';
import { AssetId } from '../../types/quant';

export const MarketOverviewCards: React.FC = () => {
  const { metrics, currency, selectedAsset, setSelectedAsset } = useQuantPlatform();

  const gold = metrics['GOLD'];
  const btc = metrics['BTC'];
  const nvda = metrics['NVDA'];
  const portfolio = metrics['PORTFOLIO'];

  if (!gold || !btc || !nvda || !portfolio) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[1, 2, 3, 4].map(i => (
          <div key={i} className="glass-panel h-28 rounded-xl animate-pulse bg-slate-900/50" />
        ))}
      </div>
    );
  }

  const cards: {
    id: AssetId;
    title: string;
    icon: React.ReactNode;
    price: number;
    change: number;
    totalReturn: number;
    sparkline: number[];
    isPortfolio?: boolean;
    variant: 'amber' | 'cyan' | 'indigo' | 'emerald';
  }[] = [
    {
      id: 'GOLD',
      title: 'GOLD (XAU/USD)',
      icon: <Coins className="w-4 h-4 text-amber-400" />,
      price: gold.currentPrice,
      change: gold.dailyChangePct,
      totalReturn: gold.totalReturn,
      sparkline: gold.sparkline,
      variant: 'amber',
    },
    {
      id: 'BTC',
      title: 'BITCOIN (BTC/USD)',
      icon: <Flame className="w-4 h-4 text-cyan-400" />,
      price: btc.currentPrice,
      change: btc.dailyChangePct,
      totalReturn: btc.totalReturn,
      sparkline: btc.sparkline,
      variant: 'cyan',
    },
    {
      id: 'NVDA',
      title: 'NVIDIA (NVDA)',
      icon: <Cpu className="w-4 h-4 text-indigo-400" />,
      price: nvda.currentPrice,
      change: nvda.dailyChangePct,
      totalReturn: nvda.totalReturn,
      sparkline: nvda.sparkline,
      variant: 'indigo',
    },
    {
      id: 'PORTFOLIO',
      title: 'MULTI-ASSET PORTFOLIO',
      icon: <PieChart className="w-4 h-4 text-emerald-400" />,
      price: portfolio.currentPrice,
      change: portfolio.dailyChangePct,
      totalReturn: portfolio.totalReturn,
      sparkline: portfolio.sparkline,
      isPortfolio: true,
      variant: 'emerald',
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {cards.map((c) => {
        const isSelected = selectedAsset === c.id;
        return (
          <div
            key={c.id}
            onClick={() => setSelectedAsset(c.id)}
            className={`cursor-pointer transition-transform hover:-translate-y-0.5 relative rounded-xl ${
              isSelected ? 'ring-2 ring-cyan-500/60 shadow-glow-cyan' : ''
            }`}
          >
            {isSelected && (
              <span className="absolute -top-2 right-3 z-10 text-[9px] font-bold px-2 py-0.5 rounded-full bg-cyan-500 text-black uppercase tracking-wider font-mono">
                Active Focus
              </span>
            )}
            <MetricCard
              title={c.title}
              value={formatCurrency(c.price, currency, c.price > 10000)}
              change={c.change}
              changeText={`Total Return: ${formatPercentage(c.totalReturn)}`}
              description={c.isPortfolio ? 'Balanced 40% Gold / 20% BTC / 40% NVDA' : `Historical price tracking & technicals`}
              sparklineData={c.sparkline}
              icon={c.icon}
              variant={c.variant}
            />
          </div>
        );
      })}
    </div>
  );
};
