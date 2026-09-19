import { 
  AssetId, 
  TimeframeId, 
  BacktestParams, 
  BacktestResult, 
  PriceBar, 
  QuantitativeMetrics,
  CorrelationMatrixData
} from '../types/quant';
import { 
  getRawBarsForAsset, 
  filterBarsByTimeframe, 
  enrichBarsWithIndicators, 
  getQuantitativeMetrics, 
  getCorrelationData 
} from './mockDataService';
import { simulateBacktest } from '../utils/quantMath';

export interface BackendConfig {
  useFastApiBackend: boolean;
  fastApiBaseUrl: string;
}

let backendConfig: BackendConfig = {
  useFastApiBackend: false,
  fastApiBaseUrl: 'http://localhost:8000/api/v1',
};

export function setBackendConfig(config: Partial<BackendConfig>) {
  backendConfig = { ...backendConfig, ...config };
}

export function getBackendConfig(): BackendConfig {
  return { ...backendConfig };
}

/**
 * Fetch historical bars for an asset
 */
export async function fetchAssetBars(
  asset: AssetId,
  timeframe: TimeframeId,
  fastPeriod: number = 10,
  slowPeriod: number = 50,
  emaPeriod: number = 20
): Promise<PriceBar[]> {
  if (backendConfig.useFastApiBackend) {
    try {
      const resp = await fetch(
        `${backendConfig.fastApiBaseUrl}/bars?asset=${asset}&timeframe=${timeframe}`
      );
      if (resp.ok) {
        return await resp.json();
      }
    } catch (err) {
      console.warn('FastAPI backend request failed, falling back to local quant engine:', err);
    }
  }

  // Autonomous client-side quantitative engine
  const rawBars = getRawBarsForAsset(asset);
  const filteredBars = filterBarsByTimeframe(rawBars, timeframe);
  return enrichBarsWithIndicators(filteredBars, fastPeriod, slowPeriod, emaPeriod);
}

/**
 * Fetch quantitative metrics
 */
export async function fetchQuantitativeMetrics(
  asset: AssetId,
  timeframe: TimeframeId
): Promise<QuantitativeMetrics> {
  if (backendConfig.useFastApiBackend) {
    try {
      const resp = await fetch(
        `${backendConfig.fastApiBaseUrl}/metrics?asset=${asset}&timeframe=${timeframe}`
      );
      if (resp.ok) {
        return await resp.json();
      }
    } catch (err) {
      console.warn('FastAPI backend request failed, falling back to local quant engine:', err);
    }
  }

  return getQuantitativeMetrics(asset, timeframe);
}

/**
 * Execute Backtest simulation
 */
export async function runBacktestSimulation(params: BacktestParams): Promise<BacktestResult> {
  if (backendConfig.useFastApiBackend) {
    try {
      const resp = await fetch(`${backendConfig.fastApiBaseUrl}/backtest`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(params),
      });
      if (resp.ok) {
        return await resp.json();
      }
    } catch (err) {
      console.warn('FastAPI backtest request failed, falling back to local quant engine:', err);
    }
  }

  const rawBars = getRawBarsForAsset(params.asset);
  // Slicing to the relevant period
  return simulateBacktest(rawBars, params);
}

/**
 * Fetch correlation matrix data
 */
export async function fetchCorrelationData(lookbackDays: number): Promise<CorrelationMatrixData> {
  if (backendConfig.useFastApiBackend) {
    try {
      const resp = await fetch(
        `${backendConfig.fastApiBaseUrl}/correlation?lookback=${lookbackDays}`
      );
      if (resp.ok) {
        return await resp.json();
      }
    } catch (err) {
      console.warn('FastAPI correlation request failed, falling back to local quant engine:', err);
    }
  }

  return getCorrelationData(lookbackDays);
}
