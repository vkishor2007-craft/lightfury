import React, { useState } from 'react';
import { 
  Search, 
  Bell, 
  Calendar, 
  ShieldAlert, 
  User, 
  DollarSign, 
  Menu,
  Check
} from 'lucide-react';
import { useQuantPlatform } from '../../context/QuantPlatformContext';
import { CurrencyCode } from '../../utils/formatters';

export const Topbar: React.FC = () => {
  const { 
    selectedTimeframe, 
    setSelectedTimeframe, 
    currency, 
    setCurrency, 
    unreadAlertsCount, 
    toggleNotificationDrawer, 
    toggleSidebar,
    setActiveView 
  } = useQuantPlatform();

  const [searchQuery, setSearchQuery] = useState('');
  const [showCurrencyMenu, setShowCurrencyMenu] = useState(false);

  const currencies: { code: CurrencyCode; label: string; symbol: string }[] = [
    { code: 'INR', label: 'Indian Rupee', symbol: '₹' },
    { code: 'USD', label: 'US Dollar', symbol: '$' },
    { code: 'EUR', label: 'Euro', symbol: '€' },
  ];

  return (
    <header className="h-16 bg-dark-900/90 border-b border-slate-800/80 px-4 md:px-6 flex items-center justify-between gap-4 sticky top-0 z-20 backdrop-blur-md">
      {/* Left: Mobile hamburger & Search */}
      <div className="flex items-center gap-3 flex-1 max-w-md">
        <button
          onClick={toggleSidebar}
          aria-label="Toggle navigation menu"
          className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 md:hidden"
        >
          <Menu className="w-5 h-5" />
        </button>

        <div className="relative w-full">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            placeholder="Search indicators, assets, models (e.g. Sharpe, NVDA, Mean Reversion)..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-dark-950/80 border border-slate-800 rounded-lg pl-9 pr-4 py-1.5 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-cyan-500/50 focus:ring-1 focus:ring-cyan-500/50 transition-all font-mono"
          />
        </div>
      </div>

      {/* Center/Right: Date range, currency toggle, alerts, profile */}
      <div className="flex items-center gap-2 md:gap-3">
        {/* Research Disclaimer Pill */}
        <div className="hidden xl:flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-300 text-xs font-medium">
          <ShieldAlert className="w-3.5 h-3.5 text-indigo-400" />
          <span>Research Sandbox • Not Financial Advice</span>
        </div>

        {/* Date quick toggle */}
        <div className="hidden lg:flex items-center gap-1 bg-dark-950/80 p-1 rounded-lg border border-slate-800 text-xs">
          <Calendar className="w-3.5 h-3.5 text-slate-400 ml-1.5" />
          {(['1M', '6M', '1Y', '3Y', '5Y'] as const).map((tf) => (
            <button
              key={tf}
              onClick={() => setSelectedTimeframe(tf)}
              className={`px-2 py-0.5 rounded text-[11px] font-semibold transition-colors ${
                selectedTimeframe === tf
                  ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/30'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              {tf}
            </button>
          ))}
        </div>

        {/* Currency Switcher */}
        <div className="relative">
          <button
            onClick={() => setShowCurrencyMenu(!showCurrencyMenu)}
            className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-dark-950 border border-slate-800 text-xs font-mono font-medium text-slate-300 hover:border-slate-700 transition-colors"
            title="Switch Currency Display"
          >
            <DollarSign className="w-3.5 h-3.5 text-cyan-400" />
            <span>{currency}</span>
          </button>

          {showCurrencyMenu && (
            <div className="absolute right-0 mt-1 w-36 glass-dropdown rounded-lg shadow-xl p-1 z-50 animate-in fade-in zoom-in-95 duration-100">
              {currencies.map(c => (
                <button
                  key={c.code}
                  onClick={() => {
                    setCurrency(c.code);
                    setShowCurrencyMenu(false);
                  }}
                  className="w-full flex items-center justify-between px-2.5 py-1.5 text-xs text-slate-200 hover:bg-slate-800/80 rounded transition-colors"
                >
                  <span>{c.symbol} {c.code}</span>
                  {currency === c.code && <Check className="w-3.5 h-3.5 text-cyan-400" />}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Notifications Icon */}
        <button
          onClick={toggleNotificationDrawer}
          aria-label={unreadAlertsCount > 0 ? `Quantitative notifications (${unreadAlertsCount} unread)` : "Quantitative notifications"}
          className="relative p-2 rounded-lg bg-dark-950 border border-slate-800 text-slate-400 hover:text-slate-200 hover:border-slate-700 transition-colors"
          title="Quantitative Notifications & Warnings"
        >
          <Bell className="w-4 h-4" />
          {unreadAlertsCount > 0 && (
            <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-cyan-500 text-[9px] font-bold text-black">
              {unreadAlertsCount}
            </span>
          )}
        </button>

        {/* User Profile */}
        <button
          onClick={() => setActiveView('settings')}
          className="flex items-center gap-2 pl-2 border-l border-slate-800 text-left hover:opacity-90 transition-opacity"
        >
          <div className="w-8 h-8 rounded-lg bg-slate-800 border border-slate-700 flex items-center justify-center text-cyan-400">
            <User className="w-4 h-4" />
          </div>
          <div className="hidden sm:block">
            <div className="text-xs font-semibold text-slate-200 leading-tight">Dr. A. Vance</div>
            <div className="text-[10px] text-slate-500 font-mono">Lead Quant Fellow</div>
          </div>
        </button>
      </div>
    </header>
  );
};
