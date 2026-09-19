import { BacktestResult, TradeRecord } from '../types/quant';

/**
 * Trigger browser file download
 */
function downloadBlob(content: string, filename: string, mimeType: string) {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.setAttribute('download', filename);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

/**
 * Export Trade History to CSV
 */
export function exportTradesToCSV(trades: TradeRecord[], assetName: string = 'Strategy') {
  if (!trades || trades.length === 0) {
    alert('No trades available to export.');
    return;
  }

  const headers = [
    'Trade ID',
    'Date',
    'Asset',
    'Action',
    'Entry Price',
    'Exit Price',
    'Quantity',
    'Transaction Cost',
    'Profit / Loss',
    'Profit %',
    'Portfolio Value',
    'Cumulative PnL',
  ];

  const rows = trades.map(t => [
    t.id,
    t.date,
    t.asset,
    t.action,
    t.entryPrice.toFixed(2),
    t.exitPrice.toFixed(2),
    t.quantity.toFixed(4),
    t.transactionCost.toFixed(2),
    t.profit.toFixed(2),
    t.profitPct.toFixed(2) + '%',
    t.portfolioValue.toFixed(2),
    t.cumulativePnL.toFixed(2),
  ]);

  const csvContent = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
  const filename = `quant_${assetName.toLowerCase()}_trades_${new Date().toISOString().split('T')[0]}.csv`;
  downloadBlob(csvContent, filename, 'text/csv;charset=utf-8;');
}

/**
 * Export Backtest Summary to CSV
 */
export function exportBacktestSummaryCSV(result: BacktestResult, strategyName: string) {
  const summaryRows = [
    ['Metric', 'Value'],
    ['Strategy', strategyName],
    ['Initial Capital', result.initialCapital.toFixed(2)],
    ['Final Portfolio Value', result.finalValue.toFixed(2)],
    ['Total Net Profit', result.totalProfitLoss.toFixed(2)],
    ['Total Return %', result.totalReturnPct.toFixed(2) + '%'],
    ['Benchmark Return %', result.benchmarkReturnPct.toFixed(2) + '%'],
    ['CAGR %', result.cagr.toFixed(2) + '%'],
    ['Sharpe Ratio', result.sharpeRatio.toFixed(2)],
    ['Benchmark Sharpe Ratio', result.benchmarkSharpeRatio.toFixed(2)],
    ['Maximum Drawdown %', result.maxDrawdown.toFixed(2) + '%'],
    ['Annualized Volatility %', result.volatility.toFixed(2) + '%'],
    ['Number of Trades', result.numTrades.toString()],
    ['Win Rate %', result.winRate.toFixed(2) + '%'],
    ['Profit Factor', result.profitFactor.toFixed(2)],
    ['Total Transaction Costs Paid', result.transactionCosts.toFixed(2)],
  ];

  const csvContent = summaryRows.map(r => r.join(',')).join('\n');
  const filename = `quant_backtest_summary_${new Date().toISOString().split('T')[0]}.csv`;
  downloadBlob(csvContent, filename, 'text/csv;charset=utf-8;');
}

/**
 * Download comprehensive Quantitative Research Report in JSON format
 */
export function downloadResearchReport(result: BacktestResult, metadata: Record<string, any>) {
  const report = {
    platform: 'Quantitative Multi-Asset Financial Intelligence & Backtesting Platform',
    generatedAt: new Date().toISOString(),
    disclaimer: 'This report is generated for historical research and backtesting purposes only. Past performance does not guarantee future results.',
    metadata,
    performanceMetrics: {
      initialCapital: result.initialCapital,
      finalValue: result.finalValue,
      netProfitLoss: result.totalProfitLoss,
      totalReturnPct: result.totalReturnPct,
      benchmarkReturnPct: result.benchmarkReturnPct,
      cagr: result.cagr,
      sharpeRatio: result.sharpeRatio,
      benchmarkSharpeRatio: result.benchmarkSharpeRatio,
      maxDrawdownPct: result.maxDrawdown,
      annualizedVolatilityPct: result.volatility,
      totalTrades: result.numTrades,
      winRatePct: result.winRate,
      profitFactor: result.profitFactor,
      transactionCostsPaid: result.transactionCosts,
    },
    monthlyReturns: result.monthlyReturns,
    tradeLogSnippet: result.trades.slice(0, 25),
  };

  const jsonStr = JSON.stringify(report, null, 2);
  const filename = `quant_research_report_${new Date().toISOString().split('T')[0]}.json`;
  downloadBlob(jsonStr, filename, 'application/json;charset=utf-8;');
}
