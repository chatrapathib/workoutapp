import React from 'react';
import {
  Layers,
  BarChart3,
  Database,
  History,
  Play,
  RotateCcw,
} from 'lucide-react';

interface HeaderProps {
  activeTab: 'split' | 'log' | 'volume' | 'database' | 'history';
  setActiveTab: (tab: 'split' | 'log' | 'volume' | 'database' | 'history') => void;
  activeSplitName: string;
  totalWorkoutsCount: number;
  weekSetsCount: number;
  onResetDatabase: () => void;
  onStartQuickWorkout: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  setActiveTab,
  activeSplitName,
  totalWorkoutsCount,
  weekSetsCount,
  onResetDatabase,
  onStartQuickWorkout,
}) => {
  const tabs = [
    { id: 'split', label: 'Split', icon: Layers, subtitle: 'Routine' },
    { id: 'log', label: 'Logger', icon: Play, subtitle: 'Live' },
    { id: 'volume', label: 'Volume', icon: BarChart3, subtitle: 'Analytics' },
    { id: 'database', label: 'Exercises', icon: Database, subtitle: 'Library' },
    { id: 'history', label: 'History', icon: History, subtitle: 'Logs' },
  ] as const;

  return (
    <>
      {/* Top Header */}
      <header className="border-b border-[#E3DCD1] bg-[#F5F2EB]/90 backdrop-blur-md sticky top-0 z-40">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="flex items-center justify-between h-14 sm:h-16 gap-3">
            {/* Minimal Brand & Active Routine */}
            <div className="flex items-center gap-2.5 sm:gap-3">
              <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-lg bg-[#781D2E] text-[#FAF8F5] flex items-center justify-center font-bold text-xs shadow-sm">
                <span className="font-serif-title text-sm tracking-tighter">V</span>
              </div>
              <div className="leading-tight">
                <div className="flex items-center gap-1.5">
                  <span className="font-serif-title font-bold text-[#211D1B] text-base sm:text-lg tracking-wide uppercase">
                    Volume
                  </span>
                  <span className="text-[10px] uppercase font-mono-num font-semibold text-[#781D2E] bg-[#781D2E]/10 border border-[#781D2E]/20 px-1.5 py-0.2 rounded">
                    Engine
                  </span>
                </div>
                <p className="text-[11px] text-[#6B635B] truncate max-w-[140px] sm:max-w-xs">
                  {activeSplitName || 'Standard Split'}
                </p>
              </div>
            </div>

            {/* Quick Metrics Bar (Tablet & Desktop) */}
            <div className="hidden sm:flex items-center gap-5 text-xs text-[#6B635B] border-x border-[#E3DCD1] px-5 py-1">
              <div>
                <div className="text-[9px] uppercase tracking-wider text-[#8C8278] font-mono-num">Weekly Sets</div>
                <div className="text-[#211D1B] font-mono-num font-bold text-xs">
                  <span className="text-[#781D2E]">{weekSetsCount}</span> sets
                </div>
              </div>
              <div>
                <div className="text-[9px] uppercase tracking-wider text-[#8C8278] font-mono-num">Sessions</div>
                <div className="text-[#211D1B] font-mono-num font-bold text-xs">
                  <span className="text-[#182333]">{totalWorkoutsCount}</span> logged
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-2">
              <button
                id="header-start-workout-btn"
                onClick={onStartQuickWorkout}
                className="inline-flex items-center gap-1.5 bg-[#781D2E] hover:bg-[#5C1221] active:scale-98 text-[#FAF8F5] font-medium text-xs px-3 sm:px-4 py-2 rounded-lg transition-all shadow-sm"
              >
                <Play className="w-3.5 h-3.5 fill-current" />
                <span className="font-mono-num font-semibold">Start</span>
              </button>

              <button
                id="header-reset-db-btn"
                onClick={onResetDatabase}
                title="Reset to default routine & database"
                className="w-8 h-8 flex items-center justify-center text-[#6B635B] hover:text-[#211D1B] hover:bg-[#ECE7DC] rounded-lg transition-colors border border-transparent hover:border-[#E3DCD1]"
              >
                <RotateCcw className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Desktop Tab Navigation */}
          <nav className="hidden md:flex space-x-1 py-1.5 -mb-px border-t border-[#E3DCD1]">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  id={`tab-${tab.id}`}
                  onClick={() => setActiveTab(tab.id)}
                  className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                    isActive
                      ? 'bg-[#781D2E] text-[#FAF8F5] shadow-xs'
                      : 'text-[#6B635B] hover:text-[#211D1B] hover:bg-[#ECE7DC]'
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </nav>
        </div>
      </header>

      {/* Mobile Fixed Bottom Navigation Bar (Phone Optimized) */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-[#F5F2EB]/95 backdrop-blur-md border-t border-[#E3DCD1] px-2 py-1 pb-[calc(0.25rem+env(safe-area-inset-bottom))] shadow-lg">
        <div className="grid grid-cols-5 gap-1 max-w-md mx-auto">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                id={`mobile-tab-${tab.id}`}
                onClick={() => setActiveTab(tab.id)}
                className={`flex flex-col items-center justify-center py-2 px-1 rounded-lg transition-all min-h-[48px] ${
                  isActive
                    ? 'bg-[#781D2E] text-[#FAF8F5]'
                    : 'text-[#6B635B] active:bg-[#ECE7DC] hover:text-[#211D1B]'
                }`}
              >
                <Icon className={`w-4 h-4 mb-0.5 ${isActive ? 'text-[#FAF8F5]' : 'text-[#6B635B]'}`} />
                <span className="text-[10px] font-medium tracking-tight leading-none">{tab.label}</span>
              </button>
            );
          })}
        </div>
      </nav>
    </>
  );
};
