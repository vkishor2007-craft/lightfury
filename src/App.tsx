import React from 'react';
import { QuantPlatformProvider, useQuantPlatform } from './context/QuantPlatformContext';
import { Sidebar } from './components/layout/Sidebar';
import { Topbar } from './components/layout/Topbar';
import { Footer } from './components/layout/Footer';
import { NotificationCenter } from './components/common/NotificationCenter';

// Views
import { DashboardView } from './components/views/DashboardView';
import { MarketAnalysisView } from './components/views/MarketAnalysisView';
import { QuantIndicatorsView } from './components/views/QuantIndicatorsView';
import { CorrelationView } from './components/views/CorrelationView';
import { BacktestingView } from './components/views/BacktestingView';
import { RiskAnalysisView } from './components/views/RiskAnalysisView';
import { MarketRegimesView } from './components/views/MarketRegimesView';
import { RobustnessTestingView } from './components/views/RobustnessTestingView';
import { TradeHistoryView } from './components/views/TradeHistoryView';
import { PortfolioView } from './components/views/PortfolioView';
import { StrategyLaboratoryView } from './components/views/StrategyLaboratoryView';
import { SettingsView } from './components/views/SettingsView';

const AppContent: React.FC = () => {
  const { activeView } = useQuantPlatform();

  const renderActiveView = () => {
    switch (activeView) {
      case 'dashboard':
        return <DashboardView />;
      case 'market_analysis':
        return <MarketAnalysisView />;
      case 'quant_indicators':
        return <QuantIndicatorsView />;
      case 'correlation':
        return <CorrelationView />;
      case 'backtesting':
        return <BacktestingView />;
      case 'risk_analysis':
        return <RiskAnalysisView />;
      case 'market_regimes':
        return <MarketRegimesView />;
      case 'robustness':
        return <RobustnessTestingView />;
      case 'trade_history':
        return <TradeHistoryView />;
      case 'portfolio':
        return <PortfolioView />;
      case 'strategy_lab':
        return <StrategyLaboratoryView />;
      case 'settings':
        return <SettingsView />;
      default:
        return <DashboardView />;
    }
  };

  return (
    <div className="flex min-h-screen bg-dark-950 text-slate-100 font-sans antialiased selection:bg-cyan-500/30 selection:text-cyan-200">
      {/* Left Sidebar */}
      <Sidebar />

      {/* Main Workspace */}
      <div className="flex-1 flex flex-col min-w-0 overflow-x-hidden">
        <Topbar />

        <main className="flex-1 px-4 md:px-8 py-6 max-w-7xl w-full mx-auto">
          {renderActiveView()}
        </main>

        <Footer />
      </div>

      {/* Global Alerts Drawer */}
      <NotificationCenter />
    </div>
  );
};

export function App() {
  return (
    <QuantPlatformProvider>
      <AppContent />
    </QuantPlatformProvider>
  );
}

export default App;
