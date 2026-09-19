import React, { useState } from 'react';
import { 
  Settings, 
  Server, 
  DollarSign, 
  Percent, 
  Database, 
  CheckCircle2, 
  AlertCircle, 
  RefreshCw,
  ShieldCheck 
} from 'lucide-react';
import { useQuantPlatform } from '../../context/QuantPlatformContext';
import { CurrencyCode } from '../../utils/formatters';
import { getBackendConfig, setBackendConfig } from '../../services/apiClient';

export const SettingsView: React.FC = () => {
  const { currency, setCurrency, resetFilters } = useQuantPlatform();
  const [fastApiEnabled, setFastApiEnabled] = useState(getBackendConfig().useFastApiBackend);
  const [fastApiUrl, setFastApiUrl] = useState(getBackendConfig().fastApiBaseUrl);
  const [riskFreeRate, setRiskFreeRate] = useState('5.0');
  const [connectionStatus, setConnectionStatus] = useState<'idle' | 'testing' | 'success' | 'failed'>('idle');

  const handleSaveBackend = () => {
    setBackendConfig({
      useFastApiBackend: fastApiEnabled,
      fastApiBaseUrl: fastApiUrl,
    });
  };

  const testBackendConnection = async () => {
    setConnectionStatus('testing');
    try {
      const resp = await fetch(`${fastApiUrl}/health`, { signal: AbortSignal.timeout(2000) });
      if (resp.ok) {
        setConnectionStatus('success');
      } else {
        setConnectionStatus('failed');
      }
    } catch {
      // Expected when FastAPI is not currently running locally
      setConnectionStatus('failed');
    }
  };

  return (
    <div className="space-y-6 max-w-4xl">
      {/* Header */}
      <div>
        <div className="inline-flex items-center gap-2 px-2.5 py-0.5 rounded-full bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 text-xs font-mono mb-1.5">
          <Settings className="w-3 h-3" />
          SYSTEM CONFIGURATION & ARCHITECTURE
        </div>
        <h2 className="text-xl md:text-2xl font-bold text-white tracking-tight">
          Platform Settings & Backend Integration
        </h2>
        <p className="text-xs text-slate-400 mt-1">
          Configure financial display parameters, quantitative assumptions, and future Python/FastAPI backend connections.
        </p>
      </div>

      {/* 1. Financial & Display Preferences */}
      <div className="glass-panel rounded-xl p-5 border border-slate-800 space-y-4">
        <h3 className="text-sm font-semibold text-white tracking-wide uppercase flex items-center gap-2">
          <DollarSign className="w-4 h-4 text-cyan-400" />
          <span>Financial Display & Modeling Rates</span>
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
          <div>
            <label className="block text-slate-400 mb-1 font-medium">Display Currency</label>
            <select
              value={currency}
              onChange={(e) => setCurrency(e.target.value as CurrencyCode)}
              className="w-full bg-dark-950 border border-slate-800 rounded-lg px-3 py-2 text-slate-200 focus:outline-none focus:border-cyan-500 font-mono"
            >
              <option value="INR">₹ INR (Indian Rupee)</option>
              <option value="USD">$ USD (US Dollar)</option>
              <option value="EUR">€ EUR (Euro)</option>
            </select>
          </div>

          <div>
            <label className="block text-slate-400 mb-1 font-medium">Risk-Free Rate (%) for Sharpe</label>
            <input
              type="number"
              step="0.25"
              value={riskFreeRate}
              onChange={(e) => setRiskFreeRate(e.target.value)}
              className="w-full bg-dark-950 border border-slate-800 rounded-lg px-3 py-2 text-slate-200 focus:outline-none focus:border-cyan-500 font-mono"
            />
          </div>
        </div>
      </div>

      {/* 2. Python/FastAPI Backend Connectivity */}
      <div className="glass-panel rounded-xl p-5 border border-slate-800 space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <h3 className="text-sm font-semibold text-white tracking-wide uppercase flex items-center gap-2">
            <Server className="w-4 h-4 text-indigo-400" />
            <span>Python / FastAPI Backend Bridge</span>
          </h3>
          <span className="text-xs font-mono text-slate-400">
            Current: {fastApiEnabled ? 'FastAPI Remote' : 'Client-Side Autonomous Engine'}
          </span>
        </div>

        <p className="text-xs text-slate-300 leading-relaxed">
          The frontend runs completely autonomously with an embedded TypeScript quantitative engine. When you are ready to connect to a high-performance Python/FastAPI server with NumPy/Pandas/TA-Lib, enable the toggle below.
        </p>

        <div className="space-y-3">
          <label className="flex items-center gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={fastApiEnabled}
              onChange={(e) => {
                setFastApiEnabled(e.target.checked);
                setBackendConfig({ useFastApiBackend: e.target.checked });
              }}
              className="rounded border-slate-700 text-cyan-500 focus:ring-0 w-4 h-4 bg-dark-950"
            />
            <span className="text-xs font-semibold text-white">
              Route Requests to Python/FastAPI Backend
            </span>
          </label>

          <div className="flex flex-col sm:flex-row items-center gap-2 pt-2">
            <input
              type="text"
              value={fastApiUrl}
              onChange={(e) => setFastApiUrl(e.target.value)}
              placeholder="http://localhost:8000/api/v1"
              className="w-full bg-dark-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-cyan-500 font-mono"
            />
            <button
              onClick={testBackendConnection}
              disabled={connectionStatus === 'testing'}
              className="w-full sm:w-auto px-4 py-2 rounded-lg bg-dark-800 hover:bg-dark-750 text-slate-300 text-xs font-medium border border-slate-700 whitespace-nowrap transition-colors"
            >
              {connectionStatus === 'testing' ? 'Testing...' : 'Test Connection'}
            </button>
          </div>

          {connectionStatus === 'success' && (
            <div className="p-2.5 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-xs text-emerald-400 flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4" />
              <span>FastAPI Backend Connected Successfully!</span>
            </div>
          )}

          {connectionStatus === 'failed' && (
            <div className="p-2.5 rounded-lg bg-amber-500/10 border border-amber-500/30 text-xs text-amber-400 flex items-center gap-2">
              <AlertCircle className="w-4 h-4" />
              <span>FastAPI offline or unreachable. Platform is smoothly using the built-in mathematical engine.</span>
            </div>
          )}
        </div>
      </div>

      {/* 3. System Data Management */}
      <div className="glass-panel rounded-xl p-5 border border-slate-800 space-y-4">
        <h3 className="text-sm font-semibold text-white tracking-wide uppercase flex items-center gap-2">
          <Database className="w-4 h-4 text-emerald-400" />
          <span>Cache & Historical Memory</span>
        </h3>

        <div className="flex items-center justify-between text-xs">
          <div>
            <div className="text-slate-200 font-medium">Reset Filters & Parameter Cache</div>
            <p className="text-slate-400 text-[11px] mt-0.5">
              Restores default asset (Gold), standard timeframe (1Y), and default SMA 10/50 parameters.
            </p>
          </div>
          <button
            onClick={resetFilters}
            className="px-3.5 py-1.5 rounded-lg bg-dark-800 hover:bg-dark-750 text-slate-300 border border-slate-700 text-xs transition-colors"
          >
            Reset All
          </button>
        </div>
      </div>
    </div>
  );
};
