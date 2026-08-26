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
    { id: 'split', num: '01', label: 'SPLIT', desc: 'ROUTINE SYNTAX' },
    { id: 'log', num: '02', label: 'LOGGER', desc: 'LIVE SESSION' },
    { id: 'volume', num: '03', label: 'VOLUME', desc: 'HYPERTROPHY MAV' },
    { id: 'database', num: '04', label: 'MOVEMENTS', desc: 'EXERCISE INDEX' },
    { id: 'history', num: '05', label: 'ARCHIVE', desc: 'LOGGED SESSIONS' },
  ] as const;

  return (
    <>
      {/* Top Editorial Header Bar */}
      <header className="border-b border-[#212127] bg-[#0E0E12]/95 backdrop-blur-md sticky top-0 z-40">
        {/* Top Micro-Metadata Header (Swiss poster top columns) */}
        <div className="hidden lg:grid grid-cols-4 max-w-7xl mx-auto px-4 sm:px-6 py-2 border-b border-[#1C1C22] text-[10px] font-mono-num text-[#858076]">
          <div className="border-r border-[#1C1C22] pr-4">
            <span className="text-[#F4EFE6] font-bold mr-1">1</span>
            <span className="font-bold text-[#E02438] uppercase">PROGRESSIVE OVERLOAD</span>
            <p className="text-[#6B665E] text-[9px] mt-0.5 leading-tight truncate">Track load & target volume brackets</p>
          </div>
          <div className="border-r border-[#1C1C22] px-4">
            <span className="text-[#F4EFE6] font-bold mr-1">2</span>
            <span className="font-bold text-[#F4EFE6] uppercase">HYPERTROPHY</span>
            <p className="text-[#6B665E] text-[9px] mt-0.5 leading-tight truncate">MEV / MAV / MRV scientific landmarks</p>
          </div>
          <div className="border-r border-[#1C1C22] px-4">
            <span className="text-[#F4EFE6] font-bold mr-1">3</span>
            <span className="font-bold text-[#F4EFE6] uppercase">ZERO DISTRACTION</span>
            <p className="text-[#6B665E] text-[9px] mt-0.5 leading-tight truncate">Tactile phone steppers & instant rest clock</p>
          </div>
          <div className="pl-4 flex items-center justify-between">
            <div>
              <span className="text-[#F4EFE6] font-bold mr-1">4</span>
              <span className="font-bold text-[#F4EFE6] uppercase">SYSTEM</span>
              <p className="text-[#6B665E] text-[9px] mt-0.5 leading-tight">SYS.V3 • DARK EDITORIAL</p>
            </div>
            <button
              id="header-reset-db-btn"
              onClick={onResetDatabase}
              title="Reset default database"
              className="text-[#6B665E] hover:text-[#F4EFE6] p-1 transition"
            >
              <RotateCcw className="w-3 h-3" />
            </button>
          </div>
        </div>

        {/* Main Title & Nav Grid */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="flex items-center justify-between h-14 sm:h-16 gap-3">
            {/* Minimal Brand & Active Routine */}
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-md bg-[#E02438] text-[#FFFFFF] flex items-center justify-center font-display font-extrabold text-sm tracking-tighter shadow-sm">
                V
              </div>
              <div className="leading-tight">
                <div className="flex items-center gap-2">
                  <span className="font-display font-extrabold text-base sm:text-lg text-[#F4EFE6] tracking-tight uppercase">
                    Volume
                  </span>
                  <span className="text-[10px] font-mono-num font-bold text-[#E02438] bg-[#E02438]/10 border border-[#E02438]/25 px-1.5 py-0.2 rounded">
                    Engine
                  </span>
                </div>
                <p className="text-[11px] font-mono-num text-[#858076] truncate max-w-[140px] sm:max-w-xs">
                  {activeSplitName || 'Standard Split'}
                </p>
              </div>
            </div>

            {/* Quick Metrics Bar (Tablet & Desktop) */}
            <div className="hidden sm:flex items-center gap-5 text-xs text-[#858076] border-x border-[#212127] px-5 py-1 font-mono-num">
              <div>
                <div className="text-[9px] uppercase tracking-wider text-[#6B665E]">Weekly Sets</div>
                <div className="text-[#F4EFE6] font-bold text-xs">
                  <span className="text-[#E02438]">{weekSetsCount}</span> sets
                </div>
              </div>
              <div>
                <div className="text-[9px] uppercase tracking-wider text-[#6B665E]">Sessions</div>
                <div className="text-[#F4EFE6] font-bold text-xs">
                  <span className="text-[#858076]">{totalWorkoutsCount}</span> logged
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center gap-2">
              <button
                id="header-start-workout-btn"
                onClick={onStartQuickWorkout}
                className="inline-flex items-center gap-1.5 bg-[#E02438] hover:bg-[#C81D25] active:scale-98 text-[#FFFFFF] font-mono-num font-bold text-xs px-3 sm:px-4 py-2 rounded-lg transition-all shadow-sm min-h-[38px]"
              >
                <Play className="w-3.5 h-3.5 fill-current" />
                <span>Start</span>
              </button>

              <button
                id="mobile-reset-btn"
                onClick={onResetDatabase}
                title="Reset database"
                className="lg:hidden w-8 h-8 flex items-center justify-center text-[#858076] hover:text-[#F4EFE6] hover:bg-[#1A1A20] rounded-lg transition-colors border border-transparent"
              >
                <RotateCcw className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Desktop Swiss Tab Navigation */}
          <nav className="hidden md:grid grid-cols-5 gap-1.5 py-2 -mb-px border-t border-[#212127]">
            {tabs.map((tab) => {
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  id={`tab-${tab.id}`}
                  onClick={() => setActiveTab(tab.id)}
                  className={`text-left p-2 rounded-lg transition-all border ${
                    isActive
                      ? 'bg-[#16161C] border-[#E02438]/50 text-[#F4EFE6]'
                      : 'bg-transparent border-transparent text-[#858076] hover:bg-[#141418] hover:text-[#F4EFE6]'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className={`text-[10px] font-mono-num font-bold ${isActive ? 'text-[#E02438]' : 'text-[#6B665E]'}`}>
                      {tab.num}
                    </span>
                    {isActive && <span className="w-1.5 h-1.5 rounded-full bg-[#E02438]" />}
                  </div>
                  <div className="font-display font-bold text-xs tracking-tight mt-0.5">{tab.label}</div>
                  <div className="text-[9px] font-mono-num text-[#6B665E] truncate">{tab.desc}</div>
                </button>
              );
            })}
          </nav>
        </div>
      </header>

      {/* Mobile Fixed Bottom Navigation Bar (Phone Optimized) */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-[#0E0E12]/95 backdrop-blur-md border-t border-[#212127] px-2 py-1.5 pb-[calc(0.35rem+env(safe-area-inset-bottom))] shadow-2xl">
        <div className="grid grid-cols-5 gap-1 max-w-md mx-auto">
          {tabs.map((tab) => {
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                id={`mobile-tab-${tab.id}`}
                onClick={() => setActiveTab(tab.id)}
                className={`flex flex-col items-center justify-center py-2 px-1 rounded-lg transition-all min-h-[48px] ${
                  isActive
                    ? 'bg-[#16161C] text-[#E02438] border border-[#E02438]/30 shadow-xs'
                    : 'text-[#858076] active:bg-[#141418] hover:text-[#F4EFE6]'
                }`}
              >
                <span className={`text-[9px] font-mono-num font-bold ${isActive ? 'text-[#E02438]' : 'text-[#6B665E]'}`}>
                  {tab.num}
                </span>
                <span className="text-[11px] font-display font-bold tracking-tight mt-0.5 leading-none">{tab.label}</span>
              </button>
            );
          })}
        </div>
      </nav>
    </>
  );
};
