import React from 'react';
import { ShieldCheck, Cpu, Terminal } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer className="mt-12 border-t border-slate-800/80 bg-dark-950/70 py-6 px-4 md:px-8 text-xs text-slate-400">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
        {/* Left: Disclaimers */}
        <div className="flex flex-col space-y-1 text-center md:text-left">
          <div className="flex items-center justify-center md:justify-start gap-2 text-slate-300 font-medium">
            <ShieldCheck className="w-4 h-4 text-cyan-400" />
            <span>Built for quantitative research and historical analysis.</span>
          </div>
          <p className="text-[11px] text-slate-400 leading-relaxed max-w-2xl">
            IMPORTANT: Backtested performance does not guarantee future results. This platform is an educational
            and quantitative testing environment. It does not provide investment advice or solicit real-capital trades.
          </p>
        </div>

        {/* Right: Quant Terminal Info */}
        <div className="flex items-center gap-4 text-[11px] font-mono text-slate-400">
          <div className="flex items-center gap-1.5">
            <Cpu className="w-3.5 h-3.5 text-indigo-400" />
            <span>Latency: &lt;4ms</span>
          </div>
          <div className="flex items-center gap-1.5">
            <Terminal className="w-3.5 h-3.5 text-emerald-400" />
            <span>Build: v2.4.0-QFX</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
