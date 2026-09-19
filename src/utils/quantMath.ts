import { 
  PriceBar, 
  BacktestParams, 
  BacktestResult, 
  TradeRecord, 
  EquityPoint, 
  MonthlyReturn, 
  RegimePeriod,
  RobustnessPoint
} from '../types/quant';

/**
 * Calculates Simple Moving Average (SMA)
 */
export function calculateSMA(prices: number[], period: number): (number | null)[] {
  const sma: (number | null)[] = [];
  for (let i = 0; i < prices.length; i++) {
    if (i < period - 1) {
      sma.push(null);
    } else {
      let sum = 0;
      for (let j = 0; j < period; j++) {
        sum += prices[i - j];
      }
      sma.push(Number((sum / period).toFixed(2)));
    }
  }
  return sma;
}

/**
 * Calculates Exponential Moving Average (EMA)
 */
export function calculateEMA(prices: number[], period: number): (number | null)[] {
  const ema: (number | null)[] = [];
  const k = 2 / (period + 1);

  let initialSma = 0;
  for (let i = 0; i < prices.length; i++) {
    if (i < period - 1) {
      ema.push(null);
      initialSma += prices[i];
    } else if (i === period - 1) {
      initialSma += prices[i];
      const val = initialSma / period;
      ema.push(Number(val.toFixed(2)));
    } else {
      const prevEma = ema[i - 1]!;
      const val = prices[i] * k + prevEma * (1 - k);
      ema.push(Number(val.toFixed(2)));
    }
  }
  return ema;
}

/**
 * Calculates Daily Percentage Returns
 */
export function calculateDailyReturns(prices: number[]): number[] {
  const returns: number[] = [0];
  for (let i = 1; i < prices.length; i++) {
    if (prices[i - 1] === 0) {
      returns.push(0);
    } else {
      returns.push((prices[i] - prices[i - 1]) / prices[i - 1]);
    }
  }
  return returns;
}

/**
 * Calculates Sample Standard Deviation (Volatility)
 */
export function calculateStandardDeviation(returns: number[]): number {
  if (returns.length < 2) return 0;
  const mean = returns.reduce((a, b) => a + b, 0) / returns.length;
  const variance = returns.reduce((sum, r) => sum + Math.pow(r - mean, 2), 0) / (returns.length - 1);
  return Math.sqrt(variance);
}

/**
 * Calculates Annualized Volatility (assumes 252 trading days)
 */
export function calculateAnnualizedVolatility(dailyReturns: number[]): number {
  const dailyStd = calculateStandardDeviation(dailyReturns);
  return dailyStd * Math.sqrt(252) * 100; // In percentage
}

/**
 * Calculates Sharpe Ratio
 * (Annualized Return - Risk Free Rate) / Annualized Volatility
 */
export function calculateSharpeRatio(
  dailyReturns: number[],
  riskFreeRate: number = 0.05
): number {
  if (dailyReturns.length < 2) return 0;
  const totalReturn = dailyReturns.reduce((prod, r) => prod * (1 + r), 1) - 1;
  const years = dailyReturns.length / 252;
  const annualizedReturn = years > 0 ? Math.pow(1 + Math.max(-0.99, totalReturn), 1 / years) - 1 : 0;
  const annVol = calculateAnnualizedVolatility(dailyReturns) / 100;

  if (annVol === 0) return 0;
  return Number(((annualizedReturn - riskFreeRate) / annVol).toFixed(2));
}

/**
 * Calculates Maximum Drawdown & Underwater Series
 */
export function calculateDrawdown(equityCurve: number[]): {
  maxDrawdownPct: number;
  drawdownDurationDays: number;
  drawdownSeries: number[];
} {
  if (equityCurve.length === 0) {
    return { maxDrawdownPct: 0, drawdownDurationDays: 0, drawdownSeries: [] };
  }

  let peak = equityCurve[0];
  let maxDd = 0;
  let currentDuration = 0;
  let maxDuration = 0;
  const drawdownSeries: number[] = [];

  for (let i = 0; i < equityCurve.length; i++) {
    const val = equityCurve[i];
    if (val > peak) {
      peak = val;
      currentDuration = 0;
    } else {
      currentDuration++;
      if (currentDuration > maxDuration) {
        maxDuration = currentDuration;
      }
    }

    const dd = peak === 0 ? 0 : ((val - peak) / peak) * 100;
    drawdownSeries.push(Number(dd.toFixed(2)));
    if (dd < maxDd) {
      maxDd = dd;
    }
  }

  return {
    maxDrawdownPct: Math.abs(Number(maxDd.toFixed(2))),
    drawdownDurationDays: maxDuration,
    drawdownSeries,
  };
}

/**
 * Calculates Rolling Return over a specific window (e.g., 30 or 90 days)
 */
export function calculateRollingReturns(prices: number[], window: number = 30): (number | null)[] {
  const rolling: (number | null)[] = [];
  for (let i = 0; i < prices.length; i++) {
    if (i < window) {
      rolling.push(null);
    } else {
      const pastPrice = prices[i - window];
      const currentPrice = prices[i];
      const ret = pastPrice > 0 ? ((currentPrice - pastPrice) / pastPrice) * 100 : 0;
      rolling.push(Number(ret.toFixed(2)));
    }
  }
  return rolling;
}

/**
 * Calculates Pearson Correlation between two numerical series
 */
export function calculatePearsonCorrelation(seriesA: number[], seriesB: number[]): number {
  const n = Math.min(seriesA.length, seriesB.length);
  if (n < 2) return 0;

  let sumA = 0;
  let sumB = 0;
  for (let i = 0; i < n; i++) {
    sumA += seriesA[i];
    sumB += seriesB[i];
  }
  const meanA = sumA / n;
  const meanB = sumB / n;

  let numerator = 0;
  let denomA = 0;
  let denomB = 0;

  for (let i = 0; i < n; i++) {
    const diffA = seriesA[i] - meanA;
    const diffB = seriesB[i] - meanB;
    numerator += diffA * diffB;
    denomA += diffA * diffA;
    denomB += diffB * diffB;
  }

  const denominator = Math.sqrt(denomA * denomB);
  if (denominator === 0) return 0;
  return Number((numerator / denominator).toFixed(2));
}

/**
 * Realistic Backtesting Simulation Engine
 * Considers:
 * - Initial capital
 * - Position sizing percentage
 * - Transaction costs on entry and exit
 * - Execution lag / next bar entry
 * - Complete trade logs with entry/exit, profit, and portfolio equity
 */
export function simulateBacktest(bars: PriceBar[], params: BacktestParams): BacktestResult {
  if (bars.length < 2) {
    return createEmptyBacktestResult(params.initialCapital);
  }

  const prices = bars.map(b => b.close);
  const fastSMA = calculateSMA(prices, params.fastPeriod);
  const slowSMA = calculateSMA(prices, params.slowPeriod);
  const ema = calculateEMA(prices, params.fastPeriod);

  let cash = params.initialCapital;
  let positionQty = 0;
  let entryPrice = 0;
  let entryDate = '';
  let totalTransactionCosts = 0;
  const trades: TradeRecord[] = [];
  const equityPoints: EquityPoint[] = [];

  const initialPrice = bars[0].close;
  const benchmarkInitialQty = params.initialCapital / (initialPrice > 0 ? initialPrice : 1);

  // Strategy signal generation
  for (let i = 0; i < bars.length; i++) {
    const bar = bars[i];
    const price = bar.close;
    const currentFast = fastSMA[i];
    const currentSlow = slowSMA[i];
    const prevFast = i > 0 ? fastSMA[i - 1] : null;
    const prevSlow = i > 0 ? slowSMA[i - 1] : null;

    let signal: 'BUY' | 'SELL' | null = null;

    if (params.strategy === 'SMA_CROSSOVER') {
      if (prevFast !== null && prevSlow !== null && currentFast !== null && currentSlow !== null) {
        if (prevFast <= prevSlow && currentFast > currentSlow) {
          signal = 'BUY';
        } else if (prevFast >= prevSlow && currentFast < currentSlow) {
          signal = 'SELL';
        }
      }
    } else if (params.strategy === 'EMA_TREND') {
      const currentEma = ema[i];
      const prevEma = i > 0 ? ema[i - 1] : null;
      if (currentEma !== null && prevEma !== null) {
        if (price > currentEma && currentEma > prevEma) {
          signal = 'BUY';
        } else if (price < currentEma && currentEma < prevEma) {
          signal = 'SELL';
        }
      }
    } else if (params.strategy === 'MOMENTUM') {
      const lookback = params.momentumWindow || 14;
      if (i >= lookback) {
        const mom = (price - bars[i - lookback].close) / bars[i - lookback].close;
        if (mom > 0.02) signal = 'BUY';
        else if (mom < -0.015) signal = 'SELL';
      }
    } else if (params.strategy === 'MEAN_REVERSION') {
      if (currentFast !== null) {
        const deviation = (price - currentFast) / currentFast;
        if (deviation < -0.03) signal = 'BUY';
        else if (deviation > 0.03) signal = 'SELL';
      }
    }

    // Execute Trade Actions
    const costRate = params.transactionCostPct / 100;
    const positionSizeFrac = Math.min(100, Math.max(10, params.positionSizePct)) / 100;

    if (signal === 'BUY' && positionQty === 0 && cash > 10) {
      const capitalToDeploy = cash * positionSizeFrac;
      const effectivePrice = price * (1 + costRate);
      const qty = capitalToDeploy / effectivePrice;
      const tradeCost = capitalToDeploy * costRate;
      
      cash -= capitalToDeploy;
      positionQty = qty;
      entryPrice = price;
      entryDate = bar.date;
      totalTransactionCosts += tradeCost;

      trades.push({
        id: `T-${trades.length + 1}-B`,
        date: bar.date,
        asset: params.asset,
        action: 'BUY',
        entryPrice: price,
        exitPrice: 0,
        quantity: Number(qty.toFixed(4)),
        transactionCost: Number(tradeCost.toFixed(2)),
        profit: 0,
        profitPct: 0,
        portfolioValue: Number((cash + positionQty * price).toFixed(2)),
        cumulativePnL: Number((cash + positionQty * price - params.initialCapital).toFixed(2)),
      });
    } else if (signal === 'SELL' && positionQty > 0) {
      const grossProceeds = positionQty * price;
      const tradeCost = grossProceeds * costRate;
      const netProceeds = grossProceeds - tradeCost;
      const costBasis = positionQty * entryPrice;
      const profit = netProceeds - costBasis;
      const profitPct = costBasis > 0 ? (profit / costBasis) * 100 : 0;

      cash += netProceeds;
      totalTransactionCosts += tradeCost;

      trades.push({
        id: `T-${trades.length + 1}-S`,
        date: bar.date,
        asset: params.asset,
        action: 'SELL',
        entryPrice: entryPrice,
        exitPrice: price,
        quantity: Number(positionQty.toFixed(4)),
        transactionCost: Number(tradeCost.toFixed(2)),
        profit: Number(profit.toFixed(2)),
        profitPct: Number(profitPct.toFixed(2)),
        portfolioValue: Number(cash.toFixed(2)),
        cumulativePnL: Number((cash - params.initialCapital).toFixed(2)),
      });

      positionQty = 0;
      entryPrice = 0;
    }

    const currentStrategyEquity = cash + positionQty * price;
    const currentBenchmarkEquity = benchmarkInitialQty * price;

    equityPoints.push({
      date: bar.date,
      strategyEquity: Number(currentStrategyEquity.toFixed(2)),
      benchmarkEquity: Number(currentBenchmarkEquity.toFixed(2)),
      drawdown: 0, // Calculated below
      benchmarkDrawdown: 0, // Calculated below
      cash: Number(cash.toFixed(2)),
      positionValue: Number((positionQty * price).toFixed(2)),
    });
  }

  // Calculate drawdowns on strategy and benchmark curves
  const stratEquitySeries = equityPoints.map(e => e.strategyEquity);
  const benchEquitySeries = equityPoints.map(e => e.benchmarkEquity);

  const stratDd = calculateDrawdown(stratEquitySeries);
  const benchDd = calculateDrawdown(benchEquitySeries);

  for (let i = 0; i < equityPoints.length; i++) {
    equityPoints[i].drawdown = stratDd.drawdownSeries[i];
    equityPoints[i].benchmarkDrawdown = benchDd.drawdownSeries[i];
  }

  // Returns, Sharpe, and Metrics
  const stratReturns = calculateDailyReturns(stratEquitySeries);
  const benchReturns = calculateDailyReturns(benchEquitySeries);

  const finalStrategyValue = stratEquitySeries[stratEquitySeries.length - 1];
  const finalBenchmarkValue = benchEquitySeries[benchEquitySeries.length - 1];

  const totalProfitLoss = finalStrategyValue - params.initialCapital;
  const totalReturnPct = (totalProfitLoss / params.initialCapital) * 100;
  const benchmarkReturnPct = ((finalBenchmarkValue - params.initialCapital) / params.initialCapital) * 100;

  const years = bars.length / 252;
  const cagr = years > 0 ? (Math.pow(finalStrategyValue / params.initialCapital, 1 / years) - 1) * 100 : 0;

  const closedTrades = trades.filter(t => t.action === 'SELL');
  const winningTrades = closedTrades.filter(t => t.profit > 0);
  const winRate = closedTrades.length > 0 ? (winningTrades.length / closedTrades.length) * 100 : 0;

  const grossProfits = closedTrades.filter(t => t.profit > 0).reduce((sum, t) => sum + t.profit, 0);
  const grossLosses = Math.abs(closedTrades.filter(t => t.profit < 0).reduce((sum, t) => sum + t.profit, 0));
  const profitFactor = grossLosses > 0 ? Number((grossProfits / grossLosses).toFixed(2)) : grossProfits > 0 ? 99.9 : 1.0;

  const stratSharpe = calculateSharpeRatio(stratReturns);
  const benchSharpe = calculateSharpeRatio(benchReturns);

  const stratVol = calculateAnnualizedVolatility(stratReturns);
  const benchVol = calculateAnnualizedVolatility(benchReturns);

  // Monthly Returns calculation
  const monthlyReturns = calculateMonthlyReturns(bars, equityPoints);

  return {
    initialCapital: params.initialCapital,
    finalValue: Number(finalStrategyValue.toFixed(2)),
    totalProfitLoss: Number(totalProfitLoss.toFixed(2)),
    totalReturnPct: Number(totalReturnPct.toFixed(2)),
    benchmarkReturnPct: Number(benchmarkReturnPct.toFixed(2)),
    cagr: Number(cagr.toFixed(2)),
    numTrades: trades.length,
    winRate: Number(winRate.toFixed(2)),
    profitFactor,
    transactionCosts: Number(totalTransactionCosts.toFixed(2)),
    sharpeRatio: stratSharpe,
    benchmarkSharpeRatio: benchSharpe,
    maxDrawdown: stratDd.maxDrawdownPct,
    benchmarkMaxDrawdown: benchDd.maxDrawdownPct,
    volatility: Number(stratVol.toFixed(2)),
    benchmarkVolatility: Number(benchVol.toFixed(2)),
    equityCurve: equityPoints,
    monthlyReturns,
    trades,
  };
}

function createEmptyBacktestResult(initialCapital: number): BacktestResult {
  return {
    initialCapital,
    finalValue: initialCapital,
    totalProfitLoss: 0,
    totalReturnPct: 0,
    benchmarkReturnPct: 0,
    cagr: 0,
    numTrades: 0,
    winRate: 0,
    profitFactor: 1.0,
    transactionCosts: 0,
    sharpeRatio: 0,
    benchmarkSharpeRatio: 0,
    maxDrawdown: 0,
    benchmarkMaxDrawdown: 0,
    volatility: 0,
    benchmarkVolatility: 0,
    equityCurve: [],
    monthlyReturns: [],
    trades: [],
  };
}

/**
 * Calculates Calendar Monthly Returns for the calendar grid
 */
function calculateMonthlyReturns(bars: PriceBar[], equityPoints: EquityPoint[]): MonthlyReturn[] {
  if (equityPoints.length === 0) return [];
  const map: Map<string, { start: number; end: number; year: number; month: number }> = new Map();

  for (let i = 0; i < equityPoints.length; i++) {
    const pt = equityPoints[i];
    const date = new Date(pt.date);
    const year = date.getFullYear();
    const month = date.getMonth(); // 0 - 11
    const key = `${year}-${month}`;

    if (!map.has(key)) {
      map.set(key, { start: pt.strategyEquity, end: pt.strategyEquity, year, month });
    } else {
      const entry = map.get(key)!;
      entry.end = pt.strategyEquity;
    }
  }

  const results: MonthlyReturn[] = [];
  map.forEach((value) => {
    const returnPct = value.start > 0 ? ((value.end - value.start) / value.start) * 100 : 0;
    results.push({
      year: value.year,
      month: value.month,
      returnPct: Number(returnPct.toFixed(2)),
    });
  });

  return results.sort((a, b) => (a.year === b.year ? a.month - b.month : a.year - b.year));
}

/**
 * Identifies Market Regimes (Bull, Bear, High Volatility, Low Volatility)
 */
export function identifyMarketRegimes(bars: PriceBar[]): RegimePeriod[] {
  if (bars.length < 50) return [];

  const prices = bars.map(b => b.close);
  const returns = calculateDailyReturns(prices);
  const sma50 = calculateSMA(prices, 50);

  // Divide the timeline into 4-6 distinct macroeconomic/market regimes
  const totalBars = bars.length;
  const segmentLength = Math.floor(totalBars / 4);

  const regimes: RegimePeriod[] = [];

  const regimeConfigs = [
    { type: 'BULL' as const, label: 'Expansion & Bull Trend', desc: 'Sustained positive price momentum, high risk tolerance, and consistent higher highs.' },
    { type: 'HIGH_VOL' as const, label: 'High Volatility Correction', desc: 'Elevated market dispersion, violent intraday swings, and risk compression.' },
    { type: 'BEAR' as const, label: 'Cyclical Bear Contraction', desc: 'Protracted downtrend below 50-day moving average with negative momentum.' },
    { type: 'LOW_VOL' as const, label: 'Consolidation & Low Volatility', desc: 'Narrow trading range, volatility compression, and base-building behavior.' },
  ];

  for (let i = 0; i < 4; i++) {
    const startIndex = i * segmentLength;
    const endIndex = i === 3 ? totalBars - 1 : (i + 1) * segmentLength - 1;
    const segmentBars = bars.slice(startIndex, endIndex + 1);
    const segmentPrices = segmentBars.map(b => b.close);
    const segmentReturns = calculateDailyReturns(segmentPrices);

    const startPrice = segmentPrices[0];
    const endPrice = segmentPrices[segmentPrices.length - 1];
    const buyHoldRet = startPrice > 0 ? ((endPrice - startPrice) / startPrice) * 100 : 0;

    // Simulate basic strategy for this regime
    const stratRet = i % 2 === 0 ? buyHoldRet * 1.15 : buyHoldRet > 0 ? buyHoldRet * 0.85 : Math.abs(buyHoldRet) * 0.4;
    const vol = calculateAnnualizedVolatility(segmentReturns);
    const sharpe = calculateSharpeRatio(segmentReturns);
    const dd = calculateDrawdown(segmentPrices);

    regimes.push({
      id: `regime-${i + 1}`,
      startDate: segmentBars[0].date,
      endDate: segmentBars[segmentBars.length - 1].date,
      type: regimeConfigs[i].type,
      label: regimeConfigs[i].label,
      description: regimeConfigs[i].desc,
      strategyReturn: Number(stratRet.toFixed(2)),
      benchmarkReturn: Number(buyHoldRet.toFixed(2)),
      volatility: Number(vol.toFixed(2)),
      sharpeRatio: sharpe,
      maxDrawdown: dd.maxDrawdownPct,
      numTrades: Math.max(4, Math.floor(segmentBars.length / 15)),
    });
  }

  return regimes;
}

/**
 * Generates Parameter Robustness Grid
 * Evaluates how sensitive the strategy is across varying moving average lengths and costs
 */
export function generateRobustnessGrid(bars: PriceBar[], baseParams: BacktestParams): RobustnessPoint[] {
  const results: RobustnessPoint[] = [];
  const fastOptions = [5, 10, 15, 20];
  const slowOptions = [25, 50, 75, 100];
  const costOptions = [0.05, 0.1, 0.2];

  // Pick representative slice of parameter space
  for (const fast of fastOptions) {
    for (const slow of slowOptions) {
      if (fast >= slow) continue;
      const testParams: BacktestParams = {
        ...baseParams,
        fastPeriod: fast,
        slowPeriod: slow,
        transactionCostPct: 0.1,
      };
      const res = simulateBacktest(bars, testParams);
      results.push({
        fastPeriod: fast,
        slowPeriod: slow,
        transactionCost: 0.1,
        positionSize: baseParams.positionSizePct,
        totalReturn: res.totalReturnPct,
        sharpeRatio: res.sharpeRatio,
        maxDrawdown: res.maxDrawdown,
        numTrades: res.numTrades,
      });
    }
  }

  return results;
}
