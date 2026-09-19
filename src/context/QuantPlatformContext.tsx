import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { 
  AssetId, 
  TimeframeId, 
  IntervalId, 
  BenchmarkId, 
  ActiveView, 
  BacktestParams, 
  BacktestResult, 
  PriceBar, 
  QuantitativeMetrics, 
  NotificationAlert 
} from '../types/quant';
import { CurrencyCode } from '../utils/formatters';
import { 
  fetchAssetBars, 
  fetchQuantitativeMetrics, 
  runBacktestSimulation 
} from '../services/apiClient';

interface QuantPlatformContextType {
  activeView: ActiveView;
  setActiveView: (view: ActiveView) => void;
  selectedAsset: AssetId;
  setSelectedAsset: (asset: AssetId) => void;
  selectedTimeframe: TimeframeId;
  setSelectedTimeframe: (tf: TimeframeId) => void;
  selectedInterval: IntervalId;
  setSelectedInterval: (interval: IntervalId) => void;
  selectedBenchmark: BenchmarkId;
  setSelectedBenchmark: (bm: BenchmarkId) => void;
  currency: CurrencyCode;
  setCurrency: (c: CurrencyCode) => void;
  
  // Data
  bars: PriceBar[];
  metrics: Record<AssetId, QuantitativeMetrics>;
  currentMetric: QuantitativeMetrics | null;
  
  // Backtest
  backtestParams: BacktestParams;
  setBacktestParams: (params: Partial<BacktestParams>) => void;
  backtestResult: BacktestResult | null;
  isBacktesting: boolean;
  runBacktest: () => Promise<void>;

  // Status & Actions
  isAnalyzing: boolean;
  runAnalysis: () => Promise<void>;
  resetFilters: () => void;

  // Alerts
  alerts: NotificationAlert[];
  unreadAlertsCount: number;
  markAlertRead: (id: string) => void;
  dismissAlert: (id: string) => void;
  addAlert: (alert: Omit<NotificationAlert, 'id' | 'timestamp' | 'read'>) => void;

  // UI state
  isSidebarCollapsed: boolean;
  toggleSidebar: () => void;
  isNotificationOpen: boolean;
  toggleNotificationDrawer: () => void;
}

const defaultBacktestParams: BacktestParams = {
  asset: 'NVDA',
  strategy: 'SMA_CROSSOVER',
  initialCapital: 100000,
  positionSizePct: 100,
  transactionCostPct: 0.1,
  startDate: '2022-01-01',
  endDate: '2026-03-01',
  fastPeriod: 10,
  slowPeriod: 50,
  momentumWindow: 14,
};

const initialAlerts: NotificationAlert[] = [
  {
    id: 'alert-1',
    type: 'warning',
    title: 'High Realized Volatility',
    message: 'Bitcoin 30-day annualized volatility has exceeded 65.4%. Position risk models recommend scaling down exposure.',
    timestamp: '10 mins ago',
    category: 'VOLATILITY',
    read: false,
  },
  {
    id: 'alert-2',
    type: 'info',
    title: 'Historical Data Ingestion Verified',
    message: '1,260 daily bars verified with zero look-ahead bias and clean dividend/split adjustments.',
    timestamp: '1 hour ago',
    category: 'DATA',
    read: false,
  },
  {
    id: 'alert-3',
    type: 'critical',
    title: 'Drawdown Warning Notice',
    message: 'NVIDIA experienced a historical max drawdown of 42.1% during the 2022 cycle. Strategy stop-loss recommended.',
    timestamp: '3 hours ago',
    category: 'DRAWDOWN',
    read: true,
  },
];

const QuantPlatformContext = createContext<QuantPlatformContextType | undefined>(undefined);

export const QuantPlatformProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [activeView, setActiveView] = useState<ActiveView>('dashboard');
  const [selectedAsset, setSelectedAsset] = useState<AssetId>('GOLD');
  const [selectedTimeframe, setSelectedTimeframe] = useState<TimeframeId>('1Y');
  const [selectedInterval, setSelectedInterval] = useState<IntervalId>('DAILY');
  const [selectedBenchmark, setSelectedBenchmark] = useState<BenchmarkId>('BUY_AND_HOLD');
  const [currency, setCurrency] = useState<CurrencyCode>('INR');

  const [bars, setBars] = useState<PriceBar[]>([]);
  const [metrics, setMetrics] = useState<Record<AssetId, QuantitativeMetrics>>({} as any);
  const [currentMetric, setCurrentMetric] = useState<QuantitativeMetrics | null>(null);

  const [backtestParams, setBacktestParamsState] = useState<BacktestParams>(defaultBacktestParams);
  const [backtestResult, setBacktestResult] = useState<BacktestResult | null>(null);
  const [isBacktesting, setIsBacktesting] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  const [alerts, setAlerts] = useState<NotificationAlert[]>(initialAlerts);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isNotificationOpen, setIsNotificationOpen] = useState(false);

  const setBacktestParams = (newParams: Partial<BacktestParams>) => {
    setBacktestParamsState(prev => ({ ...prev, ...newParams }));
  };

  const loadData = useCallback(async () => {
    setIsAnalyzing(true);
    try {
      // Fetch bars for currently selected asset and timeframe
      const barData = await fetchAssetBars(
        selectedAsset,
        selectedTimeframe,
        backtestParams.fastPeriod,
        backtestParams.slowPeriod
      );
      setBars(barData);

      // Fetch overview metrics for all 4 assets
      const [goldM, btcM, nvdaM, portM] = await Promise.all([
        fetchQuantitativeMetrics('GOLD', selectedTimeframe),
        fetchQuantitativeMetrics('BTC', selectedTimeframe),
        fetchQuantitativeMetrics('NVDA', selectedTimeframe),
        fetchQuantitativeMetrics('PORTFOLIO', selectedTimeframe),
      ]);

      const allMetrics = {
        GOLD: goldM,
        BTC: btcM,
        NVDA: nvdaM,
        PORTFOLIO: portM,
      };
      setMetrics(allMetrics);
      setCurrentMetric(allMetrics[selectedAsset]);
    } catch (err) {
      console.error('Error loading quant data:', err);
    } finally {
      setIsAnalyzing(false);
    }
  }, [selectedAsset, selectedTimeframe, backtestParams.fastPeriod, backtestParams.slowPeriod]);

  const runBacktest = useCallback(async () => {
    setIsBacktesting(true);
    try {
      const result = await runBacktestSimulation(backtestParams);
      setBacktestResult(result);
    } catch (err) {
      console.error('Error running backtest:', err);
    } finally {
      setIsBacktesting(false);
    }
  }, [backtestParams]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  useEffect(() => {
    runBacktest();
  }, []); // Run initial backtest on load

  const runAnalysis = async () => {
    await loadData();
  };

  const resetFilters = () => {
    setSelectedAsset('GOLD');
    setSelectedTimeframe('1Y');
    setSelectedInterval('DAILY');
    setSelectedBenchmark('BUY_AND_HOLD');
  };

  const toggleSidebar = () => setIsSidebarCollapsed(prev => !prev);
  const toggleNotificationDrawer = () => setIsNotificationOpen(prev => !prev);

  const markAlertRead = (id: string) => {
    setAlerts(prev => prev.map(a => a.id === id ? { ...a, read: true } : a));
  };

  const dismissAlert = (id: string) => {
    setAlerts(prev => prev.filter(a => a.id !== id));
  };

  const addAlert = (alert: Omit<NotificationAlert, 'id' | 'timestamp' | 'read'>) => {
    const newAlert: NotificationAlert = {
      ...alert,
      id: `alert-${Date.now()}`,
      timestamp: 'Just now',
      read: false,
    };
    setAlerts(prev => [newAlert, ...prev]);
  };

  const unreadAlertsCount = alerts.filter(a => !a.read).length;

  return (
    <QuantPlatformContext.Provider
      value={{
        activeView,
        setActiveView,
        selectedAsset,
        setSelectedAsset,
        selectedTimeframe,
        setSelectedTimeframe,
        selectedInterval,
        setSelectedInterval,
        selectedBenchmark,
        setSelectedBenchmark,
        currency,
        setCurrency,
        bars,
        metrics,
        currentMetric,
        backtestParams,
        setBacktestParams,
        backtestResult,
        isBacktesting,
        runBacktest,
        isAnalyzing,
        runAnalysis,
        resetFilters,
        alerts,
        unreadAlertsCount,
        markAlertRead,
        dismissAlert,
        addAlert,
        isSidebarCollapsed,
        toggleSidebar,
        isNotificationOpen,
        toggleNotificationDrawer,
      }}
    >
      {children}
    </QuantPlatformContext.Provider>
  );
};

export function useQuantPlatform() {
  const context = useContext(QuantPlatformContext);
  if (!context) {
    throw new Error('useQuantPlatform must be used within a QuantPlatformProvider');
  }
  return context;
}
