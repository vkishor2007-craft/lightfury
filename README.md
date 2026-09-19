# Quantitative Multi-Asset Financial Intelligence & Backtesting Platform

A modern, institutional-grade FinTech quantitative research and strategy backtesting terminal. Designed with dark glassmorphic aesthetics, mathematical precision, interactive simulations, and comprehensive risk analysis.

---

## 🚀 Quick Start (How to Run)

The development server is already active, but whenever you want to start or run the platform yourself, follow these steps:

### 1. Open Terminal in Project Directory
```powershell
cd d:\new
```

### 2. Start the Development Server
```powershell
npm run dev
```
*(On Windows PowerShell, if script execution policy is restricted, use `npm.cmd run dev`)*

### 3. Open in Browser
Visit **[http://localhost:5173/](http://localhost:5173/)** (or `http://127.0.0.1:5173/`).

---

## 🛠 Available Scripts

- **`npm run dev`**: Starts the local Vite development server with Hot Module Replacement (HMR).
- **`npm run build`**: Compiles TypeScript and builds production-ready bundles into `/dist`.
- **`npm run preview`**: Locally serves the production build for testing.

---

## 📊 Core Features & Views

1. **Executive Dashboard**:
   - **Global Filters**: Asset (Gold, Bitcoin, NVIDIA, Multi-Asset Portfolio), Date Range (1M to 5Y), Interval, Benchmark.
   - **Market Overview**: 4 large institutional metric cards with live prices, daily changes, total returns, and SVG sparklines.
   - **Price & Trend Analysis**: Interactive charts with SMA, EMA, volume profile, and algorithmic Buy/Sell signals.
2. **Quantitative Indicator Engine**:
   - Real-time statistics: Daily Return, Cumulative Return, Historical Volatility (30D), Annualized Volatility, Sharpe Ratio, Maximum Drawdown, and Rolling Return.
   - Interactive Rolling Return chart (30D / 60D / 90D windows).
3. **Cross-Asset Correlation Analysis**:
   - 30D, 60D, 90D, 180D lookbacks.
   - Interactive 3x3 correlation heatmap matrix with hover inspection.
   - Rolling correlation timeline across Gold, Bitcoin, and NVIDIA.
4. **Strategy Backtesting Engine**:
   - Models: SMA Crossover, EMA Trend, Momentum, Mean Reversion.
   - Parameters: Initial capital, position sizing (20%–100%), transaction costs (0.05%–0.5%), fast/slow periods.
   - Outputs: Final equity, net PnL, Sharpe ratio, max drawdown, win rate, profit factor, transaction costs paid.
   - Charts: Equity curve vs. Buy & Hold benchmark, monthly returns calendar bar chart.
5. **Strategy vs. Buy & Hold Benchmark**:
   - Head-to-head performance scorecard comparing return, volatility, Sharpe, drawdown, and final portfolio values.
6. **Strategy Robustness Testing**:
   - 2D Fast SMA vs Slow SMA parameter sensitivity heatmap.
   - Sharpe ratio stability chart and sensitivity matrix table.
7. **Market Regime Analysis**:
   - Macro decomposition: 🟢 Bull Market, 🔴 Bear Market, 🟠 High Volatility, 🔵 Low Volatility.
   - Historical regime timeline bar and performance breakdown per regime.
8. **Trade History**:
   - Searchable, filterable (BUY/SELL), sortable, and paginated order log with trade-by-trade transaction costs, entry/exit fills, net PnL, and CSV export.
9. **Portfolio Analysis**:
   - Target asset allocation donut (40% Gold, 20% BTC, 40% NVDA), asset roles, and rebalanced equity trajectory.
10. **Financial Strategy Laboratory** *(Unique Feature)*:
    - Interactive 10-step visual pipeline:
      `MARKET DATA → QUANT INDICATORS → RISK ANALYSIS → STRATEGY SELECTION → BACKTEST → TRADE SIMULATION → BUY & HOLD COMPARISON → ROBUSTNESS TEST → MARKET REGIME ANALYSIS → FINAL INSIGHTS`.
11. **Settings & Python/FastAPI Backend Readiness**:
    - Currency toggle (₹ INR / $ USD / € EUR), risk-free rate adjustment, and FastAPI endpoint toggle with health check.
12. **Export Capabilities**:
    - `[Export Trades CSV]`, `[Export Summary CSV]`, and `[Download JSON Report]`.

---

## ⚖️ Regulatory & Quant Disclaimer

*This platform is built for historical quantitative research and backtesting analysis only. Backtested performance does not guarantee future results. It does not constitute investment advice or solicit real-money trades.*
