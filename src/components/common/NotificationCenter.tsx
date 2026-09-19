import React from 'react';
import { X, AlertTriangle, Info, Bell, Check, Trash2 } from 'lucide-react';
import { useQuantPlatform } from '../../context/QuantPlatformContext';

export const NotificationCenter: React.FC = () => {
  const { 
    alerts, 
    unreadAlertsCount, 
    isNotificationOpen, 
    toggleNotificationDrawer, 
    markAlertRead, 
    dismissAlert 
  } = useQuantPlatform();

  if (!isNotificationOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden flex justify-end">
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black/60 backdrop-blur-sm transition-opacity"
        onClick={toggleNotificationDrawer}
      />

      {/* Drawer */}
      <div className="relative w-full max-w-md bg-dark-900 border-l border-slate-800 p-6 shadow-2xl z-10 flex flex-col h-full overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <Bell className="w-5 h-5 text-cyan-400" />
            <h2 className="text-base font-semibold text-white">Quantitative Alerts & Advisory</h2>
            {unreadAlertsCount > 0 && (
              <span className="px-2 py-0.5 text-xs font-bold bg-cyan-500/20 text-cyan-400 border border-cyan-500/30 rounded-full">
                {unreadAlertsCount} new
              </span>
            )}
          </div>
          <button
            onClick={toggleNotificationDrawer}
            className="p-1 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Alert List */}
        <div className="flex-1 overflow-y-auto py-4 space-y-3">
          {alerts.length === 0 ? (
            <div className="text-center py-12 text-slate-500">
              <Bell className="w-10 h-10 mx-auto mb-2 opacity-30" />
              <p className="text-sm">No active quantitative alerts.</p>
            </div>
          ) : (
            alerts.map(alert => {
              const borderStyles = {
                warning: 'border-amber-500/30 bg-amber-500/5',
                critical: 'border-rose-500/30 bg-rose-500/5',
                info: 'border-cyan-500/30 bg-cyan-500/5',
                success: 'border-emerald-500/30 bg-emerald-500/5',
              };

              const iconColors = {
                warning: 'text-amber-400',
                critical: 'text-rose-400',
                info: 'text-cyan-400',
                success: 'text-emerald-400',
              };

              return (
                <div
                  key={alert.id}
                  className={`p-3.5 rounded-xl border transition-all ${borderStyles[alert.type]} ${
                    !alert.read ? 'ring-1 ring-cyan-500/40' : 'opacity-80'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-start gap-2.5">
                      <AlertTriangle className={`w-4 h-4 mt-0.5 flex-shrink-0 ${iconColors[alert.type]}`} />
                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="text-xs font-semibold text-slate-200">{alert.title}</h4>
                          <span className="text-[10px] px-1.5 py-0.2 rounded bg-slate-800 text-slate-400 font-mono">
                            {alert.category}
                          </span>
                        </div>
                        <p className="text-xs text-slate-300 mt-1 leading-relaxed">
                          {alert.message}
                        </p>
                        <span className="text-[10px] text-slate-500 mt-1 block">
                          {alert.timestamp}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-1">
                      {!alert.read && (
                        <button
                          onClick={() => markAlertRead(alert.id)}
                          title="Mark as read"
                          className="p-1 text-slate-400 hover:text-cyan-400 rounded hover:bg-slate-800"
                        >
                          <Check className="w-3.5 h-3.5" />
                        </button>
                      )}
                      <button
                        onClick={() => dismissAlert(alert.id)}
                        title="Dismiss alert"
                        className="p-1 text-slate-400 hover:text-rose-400 rounded hover:bg-slate-800"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Footer */}
        <div className="pt-4 border-t border-slate-800 text-center">
          <p className="text-[11px] text-slate-500">
            Automated monitoring tracks realized volatility, drawdown thresholds, and parameter safety bounds.
          </p>
        </div>
      </div>
    </div>
  );
};
