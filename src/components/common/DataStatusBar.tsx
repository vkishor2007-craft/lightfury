import React from 'react';
import { Database, CheckCircle2, Server, Activity, Shield } from 'lucide-react';

export const DataStatusBar: React.FC = () => {
  return (
    <div className="glass-panel rounded-lg px-4 py-2.5 flex flex-wrap items-center justify-between gap-4 text-xs border border-slate-800/80">
      {/* Connection & Source */}
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
          </span>
          <span className="font-semibold text-slate-200">Data Feed:</span>
          <span className="text-emerald-400 font-mono font-medium">● Connected</span>
        </div>

        <div className="hidden sm:flex items-center gap-1.5 text-slate-400">
          <Server className="w-3.5 h-3.5 text-cyan-400" />
          <span>Source: Institutional Quant Feeds</span>
        </div>

        <div className="hidden md:flex items-center gap-1.5 text-slate-400">
          <Activity className="w-3.5 h-3.5 text-indigo-400" />
          <span>Records: <strong className="text-slate-200 font-mono">1,260</strong> Daily Bars</span>
        </div>
      </div>

      {/* Asset Status Checks */}
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-1 text-slate-300">
          <span>Gold:</span>
          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
        </div>
        <div className="flex items-center gap-1 text-slate-300">
          <span>Bitcoin:</span>
          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
        </div>
        <div className="flex items-center gap-1 text-slate-300">
          <span>NVIDIA:</span>
          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
        </div>

        <div className="hidden lg:flex items-center gap-1.5 pl-2 border-l border-slate-800 text-slate-400">
          <Shield className="w-3.5 h-3.5 text-emerald-400" />
          <span>Quality: <strong className="text-emerald-400 font-mono">99.98%</strong></span>
        </div>
      </div>
    </div>
  );
};
