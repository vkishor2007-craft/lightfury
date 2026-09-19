import React from 'react';
import { 
  LayoutDashboard, 
  LineChart, 
  Activity, 
  GitFork, 
  PlaySquare, 
  ShieldAlert, 
  Layers, 
  Sliders, 
  History, 
  PieChart, 
  Settings, 
  ChevronLeft, 
  ChevronRight,
  Sparkles,
  Binary
} from 'lucide-react';
import { useQuantPlatform } from '../../context/QuantPlatformContext';
import { ActiveView } from '../../types/quant';

interface NavItem {
  id: ActiveView;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  badge?: string;
  isSpecial?: boolean;
}

const navItems: NavItem[] = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { id: 'market_analysis', label: 'Market Analysis', icon: LineChart },
  { id: 'quant_indicators', label: 'Quant Indicators', icon: Activity },
  { id: 'correlation', label: 'Correlation', icon: GitFork },
  { id: 'backtesting', label: 'Backtesting', icon: PlaySquare },
  { id: 'risk_analysis', label: 'Risk Analysis', icon: ShieldAlert },
  { id: 'market_regimes', label: 'Market Regimes', icon: Layers },
  { id: 'robustness', label: 'Robustness Testing', icon: Sliders },
  { id: 'trade_history', label: 'Trade History', icon: History },
  { id: 'portfolio', label: 'Portfolio', icon: PieChart },
  { 
    id: 'strategy_lab', 
    label: 'Strategy Laboratory', 
    icon: Sparkles, 
    badge: 'EXCLUSIVE', 
    isSpecial: true 
  },
  { id: 'settings', label: 'Settings', icon: Settings },
];

export const Sidebar: React.FC = () => {
  const { activeView, setActiveView, isSidebarCollapsed, toggleSidebar } = useQuantPlatform();

  return (
    <aside
      className={`relative z-30 flex flex-col bg-dark-900 border-r border-slate-800/80 transition-all duration-300 ease-in-out ${
        isSidebarCollapsed ? 'w-20' : 'w-64'
      }`}
    >
      {/* Brand Header */}
      <div className="h-16 flex items-center px-4 border-b border-slate-800/80 justify-between">
        {!isSidebarCollapsed ? (
          <div className="flex items-center gap-2.5 overflow-hidden">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-cyan-600 to-indigo-600 flex items-center justify-center text-white shadow-glow-cyan flex-shrink-0">
              <Binary className="w-4 h-4" />
            </div>
            <div className="flex flex-col">
              <span className="font-bold text-sm tracking-wider text-white font-mono uppercase">
                QUANT<span className="text-cyan-400">IQ</span>
              </span>
              <span className="text-[10px] text-slate-400 font-mono tracking-tight">
                RESEARCH TERMINAL
              </span>
            </div>
          </div>
        ) : (
          <div className="mx-auto w-8 h-8 rounded-lg bg-gradient-to-tr from-cyan-600 to-indigo-600 flex items-center justify-center text-white shadow-glow-cyan">
            <Binary className="w-4 h-4" />
          </div>
        )}

        <button
          onClick={toggleSidebar}
          aria-label={isSidebarCollapsed ? "Expand sidebar" : "Collapse sidebar"}
          className="p-1 text-slate-400 hover:text-white rounded hover:bg-slate-800 transition-colors hidden md:block"
        >
          {isSidebarCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
        </button>
      </div>

      {/* Nav list */}
      <nav className="flex-1 overflow-y-auto py-3 px-2 space-y-1">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeView === item.id;

          if (item.isSpecial) {
            return (
              <div key={item.id} className="pt-2 pb-1">
                <button
                  onClick={() => setActiveView(item.id)}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-xs font-semibold transition-all relative group overflow-hidden ${
                    isActive
                      ? 'bg-gradient-to-r from-cyan-900/50 to-indigo-900/50 text-white border border-cyan-500/50 shadow-glow-cyan'
                      : 'bg-dark-800/60 text-cyan-300 border border-cyan-500/20 hover:border-cyan-400/50 hover:bg-cyan-950/30'
                  }`}
                  title={isSidebarCollapsed ? item.label : undefined}
                >
                  <Icon className="w-4 h-4 text-cyan-400 flex-shrink-0 animate-pulse" />
                  {!isSidebarCollapsed && (
                    <div className="flex-1 flex items-center justify-between">
                      <span>{item.label}</span>
                      <span className="text-[9px] px-1.5 py-0.5 rounded bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 font-mono">
                        {item.badge}
                      </span>
                    </div>
                  )}
                </button>
              </div>
            );
          }

          return (
            <button
              key={item.id}
              onClick={() => setActiveView(item.id)}
              className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-xs font-medium transition-all ${
                isActive
                  ? 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/30 font-semibold'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50 border border-transparent'
              }`}
              title={isSidebarCollapsed ? item.label : undefined}
            >
              <Icon className={`w-4 h-4 flex-shrink-0 ${isActive ? 'text-cyan-400' : 'text-slate-400'}`} />
              {!isSidebarCollapsed && (
                <span className="truncate">{item.label}</span>
              )}
            </button>
          );
        })}
      </nav>

      {/* Footer Status Pill */}
      {!isSidebarCollapsed && (
        <div className="p-3 border-t border-slate-800/80 bg-dark-950/40">
          <div className="flex items-center gap-2 text-[11px] text-slate-400">
            <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse"></span>
            <span>Engine: Python/C++ V8</span>
          </div>
          <div className="text-[10px] text-slate-500 mt-1 font-mono">
            Zero Execution Slippage Bias
          </div>
        </div>
      )}
    </aside>
  );
};
