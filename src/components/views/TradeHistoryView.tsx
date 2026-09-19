import React, { useState, useMemo } from 'react';
import { 
  History, 
  Search, 
  Filter, 
  Download, 
  ArrowUpDown, 
  ChevronLeft, 
  ChevronRight,
  TrendingUp,
  TrendingDown
} from 'lucide-react';
import { useQuantPlatform } from '../../context/QuantPlatformContext';
import { formatCurrency, formatPercentage, formatDate } from '../../utils/formatters';
import { exportTradesToCSV } from '../../services/exportService';

export const TradeHistoryView: React.FC = () => {
  const { backtestResult, currency, backtestParams } = useQuantPlatform();

  const [searchTerm, setSearchTerm] = useState('');
  const [filterAction, setFilterAction] = useState<'ALL' | 'BUY' | 'SELL'>('ALL');
  const [sortField, setSortField] = useState<'date' | 'profit' | 'portfolioValue'>('date');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  const trades = backtestResult?.trades || [];

  // Filtered & Sorted trades
  const processedTrades = useMemo(() => {
    let result = [...trades];

    // Filter by action
    if (filterAction !== 'ALL') {
      result = result.filter(t => t.action === filterAction);
    }

    // Search by date or trade id
    if (searchTerm.trim()) {
      const q = searchTerm.toLowerCase();
      result = result.filter(t => 
        t.date.toLowerCase().includes(q) || 
        t.id.toLowerCase().includes(q) ||
        t.asset.toLowerCase().includes(q)
      );
    }

    // Sort
    result.sort((a, b) => {
      let comp = 0;
      if (sortField === 'date') {
        comp = new Date(a.date).getTime() - new Date(b.date).getTime();
      } else if (sortField === 'profit') {
        comp = a.profit - b.profit;
      } else if (sortField === 'portfolioValue') {
        comp = a.portfolioValue - b.portfolioValue;
      }
      return sortOrder === 'asc' ? comp : -comp;
    });

    return result;
  }, [trades, filterAction, searchTerm, sortField, sortOrder]);

  // Pagination slice
  const totalPages = Math.max(1, Math.ceil(processedTrades.length / pageSize));
  const paginatedTrades = processedTrades.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );

  const toggleSort = (field: 'date' | 'profit' | 'portfolioValue') => {
    if (sortField === field) {
      setSortOrder(prev => prev === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortOrder('desc');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-2.5 py-0.5 rounded-full bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 text-xs font-mono mb-1.5">
            <History className="w-3 h-3" />
            AUDITABLE EXECUTION LEDGER
          </div>
          <h2 className="text-xl md:text-2xl font-bold text-white tracking-tight">
            Algorithmic Trade History
          </h2>
          <p className="text-xs text-slate-400 mt-1 max-w-3xl">
            Simulated order log with trade-by-trade transaction costs, entry/exit fills, net PnL, and cumulative portfolio equity.
          </p>
        </div>

        {/* Export */}
        <button
          onClick={() => exportTradesToCSV(trades, backtestParams.asset)}
          className="flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-dark-800 hover:bg-dark-750 text-slate-200 border border-slate-700/80 text-xs font-medium transition-colors"
        >
          <Download className="w-3.5 h-3.5 text-cyan-400" />
          <span>Export Trades CSV</span>
        </button>
      </div>

      {/* Filter & Search Bar */}
      <div className="glass-panel rounded-xl p-4 border border-slate-800 flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="flex flex-wrap items-center gap-3">
          {/* Search */}
          <div className="relative w-56">
            <Search className="w-3.5 h-3.5 text-slate-500 absolute left-2.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search by date, ID..."
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full bg-dark-950 border border-slate-800 rounded-lg pl-8 pr-3 py-1.5 text-slate-200 focus:outline-none focus:border-cyan-500 font-mono"
            />
          </div>

          {/* Action Filter */}
          <div className="flex items-center gap-1.5 bg-dark-950 p-1 rounded-lg border border-slate-800">
            <Filter className="w-3 h-3 text-slate-400 ml-1" />
            {(['ALL', 'BUY', 'SELL'] as const).map(action => (
              <button
                key={action}
                onClick={() => {
                  setFilterAction(action);
                  setCurrentPage(1);
                }}
                className={`px-2.5 py-1 rounded text-xs font-semibold transition-colors ${
                  filterAction === action
                    ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/30'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                {action}
              </button>
            ))}
          </div>
        </div>

        {/* Page Size & Record Count */}
        <div className="flex items-center gap-3 text-slate-400 font-mono">
          <span>Showing {processedTrades.length} records</span>
          <select
            value={pageSize}
            onChange={(e) => {
              setPageSize(Number(e.target.value));
              setCurrentPage(1);
            }}
            className="bg-dark-950 border border-slate-800 rounded px-2 py-1 text-slate-300 focus:outline-none focus:border-cyan-500"
          >
            <option value={10}>10 / page</option>
            <option value={25}>25 / page</option>
            <option value={50}>50 / page</option>
          </select>
        </div>
      </div>

      {/* Trade Table */}
      <div className="glass-panel rounded-xl border border-slate-800 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-xs font-mono border-collapse">
            <thead>
              <tr className="border-b border-slate-800 bg-dark-950/70 text-slate-400 text-left">
                <th className="py-3 px-4">Trade ID</th>
                <th
                  onClick={() => toggleSort('date')}
                  className="py-3 px-4 cursor-pointer hover:text-white"
                >
                  <div className="flex items-center gap-1">
                    <span>Date</span>
                    <ArrowUpDown className="w-3 h-3" />
                  </div>
                </th>
                <th className="py-3 px-4">Asset</th>
                <th className="py-3 px-4">Action</th>
                <th className="py-3 px-4 text-right">Entry Price</th>
                <th className="py-3 px-4 text-right">Exit Price</th>
                <th className="py-3 px-4 text-right">Quantity</th>
                <th className="py-3 px-4 text-right">Cost</th>
                <th
                  onClick={() => toggleSort('profit')}
                  className="py-3 px-4 text-right cursor-pointer hover:text-white"
                >
                  <div className="flex items-center justify-end gap-1">
                    <span>Profit / Loss</span>
                    <ArrowUpDown className="w-3 h-3" />
                  </div>
                </th>
                <th
                  onClick={() => toggleSort('portfolioValue')}
                  className="py-3 px-4 text-right cursor-pointer hover:text-white"
                >
                  <div className="flex items-center justify-end gap-1">
                    <span>Portfolio Value</span>
                    <ArrowUpDown className="w-3 h-3" />
                  </div>
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 text-slate-200">
              {paginatedTrades.length === 0 ? (
                <tr>
                  <td colSpan={10} className="py-8 text-center text-slate-500">
                    No trades match the selected criteria.
                  </td>
                </tr>
              ) : (
                paginatedTrades.map((t) => {
                  const isBuy = t.action === 'BUY';
                  const isProfitable = t.profit > 0;

                  return (
                    <tr key={t.id} className="hover:bg-slate-800/30 transition-colors">
                      <td className="py-2.5 px-4 text-slate-400">{t.id}</td>
                      <td className="py-2.5 px-4">{formatDate(t.date)}</td>
                      <td className="py-2.5 px-4 font-semibold text-white">{t.asset}</td>
                      <td className="py-2.5 px-4">
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-bold border inline-flex items-center gap-1 ${
                            isBuy
                              ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                              : 'bg-rose-500/10 text-rose-400 border-rose-500/30'
                          }`}
                        >
                          {isBuy ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                          {t.action}
                        </span>
                      </td>
                      <td className="py-2.5 px-4 text-right text-slate-300">
                        {formatCurrency(t.entryPrice, currency)}
                      </td>
                      <td className="py-2.5 px-4 text-right text-slate-300">
                        {t.exitPrice > 0 ? formatCurrency(t.exitPrice, currency) : '—'}
                      </td>
                      <td className="py-2.5 px-4 text-right">{t.quantity}</td>
                      <td className="py-2.5 px-4 text-right text-slate-400">
                        {formatCurrency(t.transactionCost, currency)}
                      </td>
                      <td className="py-2.5 px-4 text-right">
                        {t.action === 'SELL' ? (
                          <span className={`font-bold ${isProfitable ? 'text-emerald-400' : 'text-rose-400'}`}>
                            {formatCurrency(t.profit, currency)} ({formatPercentage(t.profitPct)})
                          </span>
                        ) : (
                          <span className="text-slate-500">Open Position</span>
                        )}
                      </td>
                      <td className="py-2.5 px-4 text-right font-bold text-cyan-400">
                        {formatCurrency(t.portfolioValue, currency)}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Footer */}
        <div className="p-3 bg-dark-950/70 border-t border-slate-800 flex items-center justify-between text-xs font-mono text-slate-400">
          <div>
            Page {currentPage} of {totalPages}
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
              disabled={currentPage === 1}
              className="p-1 rounded bg-dark-900 border border-slate-800 hover:bg-slate-800 disabled:opacity-30"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
              disabled={currentPage === totalPages}
              className="p-1 rounded bg-dark-900 border border-slate-800 hover:bg-slate-800 disabled:opacity-30"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
