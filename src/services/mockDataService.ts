import { 
  AssetId, 
  PriceBar, 
  TimeframeId, 
  QuantitativeMetrics,
  CorrelationMatrixData 
} from '../types/quant';
import { 
  calculateSMA, 
  calculateEMA, 
  calculateDailyReturns, 
  calculateAnnualizedVolatility, 
  calculateSharpeRatio, 
  calculateDrawdown,
  calculateRollingReturns,
  calculatePearsonCorrelation
} from '../utils/quantMath';

// Seeded pseudo-random generator for deterministic yet realistic historical series
function createRng(seed: number) {
  let s = seed;
  return function () {
    s = (s * 9301 + 49297) % 233280;
    return s / 233280;
  };
}

/**
 * Generates high-fidelity daily historical price bars
 */
function generateAssetHistory(
  basePrice: number,
  driftAnnual: number,
  volatilityAnnual: number,
  days: number,
  seed: number,
  volumeBase: number
): PriceBar[] {
  const rng = createRng(seed);
  const bars: PriceBar[] = [];
  const dt = 1 / 252;
  const driftDaily = (driftAnnual - 0.5 * Math.pow(volatilityAnnual, 2)) * dt;
  const volDaily = volatilityAnnual * Math.sqrt(dt);

  let currentPrice = basePrice;
  // Starting 5 years back from today
  const startDate = new Date(2021, 0, 4);

  for (let i = 0; i < days; i++) {
    // Generate standard normal using Box-Muller
    const u1 = Math.max(1e-7, rng());
    const u2 = rng();
    const z = Math.sqrt(-2.0 * Math.log(u1)) * Math.cos(2.0 * Math.PI * u2);

    const ret = driftDaily + volDaily * z;
    const open = currentPrice;
    currentPrice = Math.max(1.0, currentPrice * Math.exp(ret));
    const close = currentPrice;
    
    // Intraday high & low
    const intraVar = Math.abs(z) * volDaily * currentPrice * 0.75;
    const high = Math.max(open, close) + intraVar * rng();
    const low = Math.min(open, close) - intraVar * rng();

    // Volume with volatility clustering
    const volNoise = 0.5 + rng();
    const volume = Math.round(volumeBase * volNoise * (1 + Math.abs(ret) * 10));

    const barDate = new Date(startDate);
    barDate.setDate(startDate.getDate() + Math.floor(i * 1.43)); // Skip weekends roughly
    const dateStr = barDate.toISOString().split('T')[0];

    bars.push({
      date: dateStr,
      open: Number(open.toFixed(2)),
      high: Number(high.toFixed(2)),
      low: Number(low.toFixed(2)),
      close: Number(close.toFixed(2)),
      volume,
    });
  }

  return bars;
}

// Generate base 5-year histories (approx 1,260 trading days)
const DAYS_COUNT = 1260;

const RAW_GOLD_BARS = generateAssetHistory(1820, 0.12, 0.15, DAYS_COUNT, 42, 850_000);
const RAW_BTC_BARS = generateAssetHistory(29000, 0.42, 0.58, DAYS_COUNT, 137, 4_500_000);
const RAW_NVDA_BARS = generateAssetHistory(135, 0.48, 0.42, DAYS_COUNT, 987, 15_000_000);

// Multi-Asset Portfolio: 40% Gold + 20% BTC + 40% NVDA normalized to ₹100,000 base
const RAW_PORTFOLIO_BARS: PriceBar[] = [];
for (let i = 0; i < DAYS_COUNT; i++) {
  const gNorm = RAW_GOLD_BARS[i].close / RAW_GOLD_BARS[0].close;
  const bNorm = RAW_BTC_BARS[i].close / RAW_BTC_BARS[0].close;
  const nNorm = RAW_NVDA_BARS[i].close / RAW_NVDA_BARS[0].close;

  const portVal = 100_000 * (0.4 * gNorm + 0.2 * bNorm + 0.4 * nNorm);
  RAW_PORTFOLIO_BARS.push({
    date: RAW_GOLD_BARS[i].date,
    open: Number(portVal.toFixed(2)),
    high: Number((portVal * 1.008).toFixed(2)),
    low: Number((portVal * 0.992).toFixed(2)),
    close: Number(portVal.toFixed(2)),
    volume: 120_000_000,
  });
}

/**
 * Returns raw bars for an asset
 */
export function getRawBarsForAsset(asset: AssetId): PriceBar[] {
  switch (asset) {
    case 'GOLD':
      return RAW_GOLD_BARS;
    case 'BTC':
      return RAW_BTC_BARS;
    case 'NVDA':
      return RAW_NVDA_BARS;
    case 'PORTFOLIO':
      return RAW_PORTFOLIO_BARS;
  }
}

/**
 * Filter bars by timeframe
 */
export function filterBarsByTimeframe(bars: PriceBar[], timeframe: TimeframeId): PriceBar[] {
  let count = bars.length;
  switch (timeframe) {
    case '1M':
      count = 22;
      break;
    case '6M':
      count = 126;
      break;
    case '1Y':
      count = 252;
      break;
    case '3Y':
      count = 756;
      break;
    case '5Y':
    case 'CUSTOM':
      count = bars.length;
      break;
  }
  return bars.slice(Math.max(0, bars.length - count));
}

/**
 * Enriches bars with technical indicators (SMA, EMA, Signals)
 */
export function enrichBarsWithIndicators(
  bars: PriceBar[],
  fastPeriod: number = 10,
  slowPeriod: number = 50,
  emaPeriod: number = 20
): PriceBar[] {
  const prices = bars.map(b => b.close);
  const fastSma = calculateSMA(prices, fastPeriod);
  const slowSma = calculateSMA(prices, slowPeriod);
  const ema = calculateEMA(prices, emaPeriod);

  return bars.map((bar, i) => {
    let signal: 'BUY' | 'SELL' | null = null;
    if (i > 0 && fastSma[i] !== null && slowSma[i] !== null && fastSma[i - 1] !== null && slowSma[i - 1] !== null) {
      if (fastSma[i - 1]! <= slowSma[i - 1]! && fastSma[i]! > slowSma[i]!) {
        signal = 'BUY';
      } else if (fastSma[i - 1]! >= slowSma[i - 1]! && fastSma[i]! < slowSma[i]!) {
        signal = 'SELL';
      }
    }

    return {
      ...bar,
      smaFast: fastSma[i] ?? undefined,
      smaSlow: slowSma[i] ?? undefined,
      ema: ema[i] ?? undefined,
      signal,
    };
  });
}

/**
 * Computes full quantitative metrics for an asset
 */
export function getQuantitativeMetrics(asset: AssetId, timeframe: TimeframeId = '1Y'): QuantitativeMetrics {
  const rawBars = getRawBarsForAsset(asset);
  const bars = filterBarsByTimeframe(rawBars, timeframe);
  const prices = bars.map(b => b.close);
  const returns = calculateDailyReturns(prices);

  const currentPrice = prices[prices.length - 1];
  const prevPrice = prices.length > 1 ? prices[prices.length - 2] : currentPrice;
  const dailyChange = currentPrice - prevPrice;
  const dailyChangePct = prevPrice > 0 ? (dailyChange / prevPrice) * 100 : 0;

  const startPrice = prices[0];
  const totalReturn = startPrice > 0 ? ((currentPrice - startPrice) / startPrice) * 100 : 0;

  const dailyReturn = dailyChangePct;
  const cumulativeReturn = totalReturn;
  const histVol = calculateAnnualizedVolatility(returns.slice(-30));
  const annVol = calculateAnnualizedVolatility(returns);
  const sharpe = calculateSharpeRatio(returns);
  const dd = calculateDrawdown(prices);
  const rolling = calculateRollingReturns(prices, 30);
  const latestRolling = rolling.length > 0 ? rolling[rolling.length - 1] ?? 0 : 0;

  // Mini sparkline (last 20 points)
  const sparkline = prices.slice(-20);

  return {
    currentPrice: Number(currentPrice.toFixed(2)),
    dailyChange: Number(dailyChange.toFixed(2)),
    dailyChangePct: Number(dailyChangePct.toFixed(2)),
    totalReturn: Number(totalReturn.toFixed(2)),
    dailyReturn: Number(dailyReturn.toFixed(2)),
    cumulativeReturn: Number(cumulativeReturn.toFixed(2)),
    historicalVolatility: Number(histVol.toFixed(2)),
    annualizedVolatility: Number(annVol.toFixed(2)),
    sharpeRatio: sharpe,
    maxDrawdown: dd.maxDrawdownPct,
    drawdownDuration: dd.drawdownDurationDays,
    rollingReturn: latestRolling,
    sparkline,
  };
}

/**
 * Computes Cross-Asset Correlation Analysis data
 */
export function getCorrelationData(lookbackDays: number = 60): CorrelationMatrixData {
  const goldPrices = RAW_GOLD_BARS.map(b => b.close);
  const btcPrices = RAW_BTC_BARS.map(b => b.close);
  const nvdaPrices = RAW_NVDA_BARS.map(b => b.close);
  const portPrices = RAW_PORTFOLIO_BARS.map(b => b.close);

  const goldReturns = calculateDailyReturns(goldPrices.slice(-lookbackDays));
  const btcReturns = calculateDailyReturns(btcPrices.slice(-lookbackDays));
  const nvdaReturns = calculateDailyReturns(nvdaPrices.slice(-lookbackDays));
  const portReturns = calculateDailyReturns(portPrices.slice(-lookbackDays));

  const corrGB = calculatePearsonCorrelation(goldReturns, btcReturns);
  const corrGN = calculatePearsonCorrelation(goldReturns, nvdaReturns);
  const corrGP = calculatePearsonCorrelation(goldReturns, portReturns);

  const corrBN = calculatePearsonCorrelation(btcReturns, nvdaReturns);
  const corrBP = calculatePearsonCorrelation(btcReturns, portReturns);

  const corrNP = calculatePearsonCorrelation(nvdaReturns, portReturns);

  const matrix: Record<AssetId, Record<AssetId, number>> = {
    GOLD: { GOLD: 1.0, BTC: corrGB, NVDA: corrGN, PORTFOLIO: corrGP },
    BTC: { GOLD: corrGB, BTC: 1.0, NVDA: corrBN, PORTFOLIO: corrBP },
    NVDA: { GOLD: corrGN, BTC: corrBN, NVDA: 1.0, PORTFOLIO: corrNP },
    PORTFOLIO: { GOLD: corrGP, BTC: corrBP, NVDA: corrNP, PORTFOLIO: 1.0 },
  };

  // Rolling correlation timeline for Gold vs BTC and BTC vs NVDA
  const rollingSeries: { date: string; goldBtc: number; goldNvda: number; btcNvda: number }[] = [];
  const step = 7; // Weekly points for smooth chart
  const windowSize = 30;

  for (let i = windowSize; i < RAW_GOLD_BARS.length; i += step) {
    const gSub = calculateDailyReturns(goldPrices.slice(i - windowSize, i));
    const bSub = calculateDailyReturns(btcPrices.slice(i - windowSize, i));
    const nSub = calculateDailyReturns(nvdaPrices.slice(i - windowSize, i));

    rollingSeries.push({
      date: RAW_GOLD_BARS[i].date,
      goldBtc: calculatePearsonCorrelation(gSub, bSub),
      goldNvda: calculatePearsonCorrelation(gSub, nSub),
      btcNvda: calculatePearsonCorrelation(bSub, nSub),
    });
  }

  return {
    assets: ['GOLD', 'BTC', 'NVDA', 'PORTFOLIO'],
    lookbackDays,
    matrix,
    rollingSeries: rollingSeries.slice(-40), // Last 40 points
  };
}
