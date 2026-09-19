export type AssetId = 'GOLD' | 'BTC' | 'NVDA' | 'PORTFOLIO';

export type TimeframeId = '1M' | '6M' | '1Y' | '3Y' | '5Y' | 'CUSTOM';

export type IntervalId = 'DAILY' | 'WEEKLY' | 'MONTHLY';

export type BenchmarkId = 'BUY_AND_HOLD' | 'NONE';

export interface PriceBar {
  date: string;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
  returns?: number;
  smaFast?: number;
  smaSlow?: number;
  ema?: number;
  signal?: 'BUY' | 'SELL' | null;
}

export interface QuantitativeMetrics {
  currentPrice: number;
  dailyChange: number;
  dailyChangePct: number;
  totalReturn: number;
  dailyReturn: number;
  cumulativeReturn: number;
  historicalVolatility: number;
  annualizedVolatility: number;
  sharpeRatio: number;
  maxDrawdown: number;
  drawdownDuration: number;
  rollingReturn: number;
  sparkline: number[];
}

export type StrategyType = 'SMA_CROSSOVER' | 'EMA_TREND' | 'MOMENTUM' | 'MEAN_REVERSION';

export interface BacktestParams {
  asset: AssetId;
  strategy: StrategyType;
  initialCapital: number;
  positionSizePct: number;
  transactionCostPct: number;
  startDate: string;
  endDate: string;
  fastPeriod: number;
  slowPeriod: number;
  rsiPeriod?: number;
  momentumWindow?: number;
}

export interface TradeRecord {
  id: string;
  date: string;
  asset: AssetId;
  action: 'BUY' | 'SELL';
  entryPrice: number;
  exitPrice: number;
  quantity: number;
  transactionCost: number;
  profit: number;
  profitPct: number;
  portfolioValue: number;
  cumulativePnL: number;
}

export interface EquityPoint {
  date: string;
  strategyEquity: number;
  benchmarkEquity: number;
  drawdown: number;
  benchmarkDrawdown: number;
  cash: number;
  positionValue: number;
}

export interface MonthlyReturn {
  year: number;
  month: number;
  returnPct: number;
}

export interface BacktestResult {
  initialCapital: number;
  finalValue: number;
  totalProfitLoss: number;
  totalReturnPct: number;
  benchmarkReturnPct: number;
  cagr: number;
  numTrades: number;
  winRate: number;
  profitFactor: number;
  transactionCosts: number;
  sharpeRatio: number;
  benchmarkSharpeRatio: number;
  maxDrawdown: number;
  benchmarkMaxDrawdown: number;
  volatility: number;
  benchmarkVolatility: number;
  equityCurve: EquityPoint[];
  monthlyReturns: MonthlyReturn[];
  trades: TradeRecord[];
}

export type MarketRegimeType = 'BULL' | 'BEAR' | 'HIGH_VOL' | 'LOW_VOL';

export interface RegimePeriod {
  id: string;
  startDate: string;
  endDate: string;
  type: MarketRegimeType;
  label: string;
  description: string;
  strategyReturn: number;
  benchmarkReturn: number;
  volatility: number;
  sharpeRatio: number;
  maxDrawdown: number;
  numTrades: number;
}

export interface CorrelationMatrixData {
  assets: AssetId[];
  lookbackDays: number;
  matrix: Record<AssetId, Record<AssetId, number>>;
  rollingSeries: { date: string; goldBtc: number; goldNvda: number; btcNvda: number }[];
}

export interface RobustnessPoint {
  fastPeriod: number;
  slowPeriod: number;
  transactionCost: number;
  positionSize: number;
  totalReturn: number;
  sharpeRatio: number;
  maxDrawdown: number;
  numTrades: number;
}

export interface NotificationAlert {
  id: string;
  type: 'warning' | 'info' | 'critical' | 'success';
  title: string;
  message: string;
  timestamp: string;
  category: 'VOLATILITY' | 'DRAWDOWN' | 'DATA' | 'PARAM';
  read: boolean;
}

export type ActiveView = 
  | 'dashboard'
  | 'market_analysis'
  | 'quant_indicators'
  | 'correlation'
  | 'backtesting'
  | 'risk_analysis'
  | 'market_regimes'
  | 'robustness'
  | 'trade_history'
  | 'portfolio'
  | 'settings'
  | 'strategy_lab';
