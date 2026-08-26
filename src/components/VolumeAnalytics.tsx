import React, { useState, useMemo } from 'react';
import {
  BarChart3,
  Calendar,
  Layers,
  ChevronRight,
  Filter,
  Dumbbell,
  Target,
  Info,
  X,
} from 'lucide-react';
import { WorkoutLog, WorkoutSplit } from '../types';
import { getLandmarkForMuscle, MUSCLE_LANDMARKS } from '../data/muscleInfo';

interface VolumeAnalyticsProps {
  logs: WorkoutLog[];
  activeSplit: WorkoutSplit | null;
  onNavigateToLogger: () => void;
}

export const VolumeAnalytics: React.FC<VolumeAnalyticsProps> = ({
  logs,
  activeSplit,
  onNavigateToLogger,
}) => {
  const [timeFilter, setTimeFilter] = useState<'7' | '14' | '30' | 'all' | 'planned'>('7');
  const [volumeMode, setVolumeMode] = useState<'primary' | 'effective' | 'combined'>('effective');
  const [selectedMuscle, setSelectedMuscle] = useState<string | null>(null);

  // Filter logs by timeframe
  const filteredLogs = useMemo(() => {
    if (timeFilter === 'all' || timeFilter === 'planned') return logs;
    const daysLimit = parseInt(timeFilter, 10);
    const cutoff = new Date();
    cutoff.setDate(cutoff.getDate() - daysLimit);
    const cutoffStr = cutoff.toISOString().split('T')[0];
    return logs.filter((l) => l.date >= cutoffStr);
  }, [logs, timeFilter]);

  // Aggregate Muscle Group Sets
  const muscleVolume = useMemo(() => {
    const counts: Record<
      string,
      {
        primary: number;
        secondary: number;
        effective: number;
        exercises: { exerciseName: string; date: string; sets: number; isPrimary: boolean }[];
        lastTrained?: string;
      }
    > = {};

    if (timeFilter === 'planned' && activeSplit) {
      for (const day of activeSplit.days) {
        for (const ex of day.exercises) {
          const sets = ex.sets;
          const p = ex.primaryMuscle || 'Other';
          if (!counts[p]) counts[p] = { primary: 0, secondary: 0, effective: 0, exercises: [] };
          counts[p].primary += sets;
          counts[p].effective += sets;
          counts[p].exercises.push({ exerciseName: ex.exerciseName, date: day.name, sets, isPrimary: true });

          for (const s of ex.secondaryMuscles || []) {
            if (!counts[s]) counts[s] = { primary: 0, secondary: 0, effective: 0, exercises: [] };
            counts[s].secondary += sets;
            counts[s].effective += sets * 0.5;
            counts[s].exercises.push({ exerciseName: ex.exerciseName, date: day.name, sets, isPrimary: false });
          }
        }
      }
      return counts;
    }

    for (const log of filteredLogs) {
      for (const ex of log.exercises) {
        const completedSets = ex.sets.filter((s) => s.completed).length;
        if (completedSets === 0) continue;

        const p = ex.primaryMuscle || 'Other';
        if (!counts[p]) counts[p] = { primary: 0, secondary: 0, effective: 0, exercises: [], lastTrained: log.date };
        counts[p].primary += completedSets;
        counts[p].effective += completedSets;
        counts[p].exercises.push({ exerciseName: ex.exerciseName, date: log.date, sets: completedSets, isPrimary: true });
        if (!counts[p].lastTrained || log.date > counts[p].lastTrained!) counts[p].lastTrained = log.date;

        for (const s of ex.secondaryMuscles || []) {
          if (!counts[s]) counts[s] = { primary: 0, secondary: 0, effective: 0, exercises: [], lastTrained: log.date };
          counts[s].secondary += completedSets;
          counts[s].effective += completedSets * 0.5;
          counts[s].exercises.push({ exerciseName: ex.exerciseName, date: log.date, sets: completedSets, isPrimary: false });
          if (!counts[s].lastTrained || log.date > counts[s].lastTrained!) counts[s].lastTrained = log.date;
        }
      }
    }

    return counts;
  }, [filteredLogs, timeFilter, activeSplit]);

  const categoryGroups: { category: string; muscles: string[] }[] = [
    { category: 'Chest', muscles: ['Chest', 'Upper Chest', 'Lower Chest'] },
    { category: 'Back', muscles: ['Back', 'Lats', 'Back/Lats', 'Mid Back', 'Upper/Mid Back', 'Lower Back', 'Back/Posterior Chain'] },
    { category: 'Shoulders', muscles: ['Shoulders', 'Side Delts', 'Rear Delts', 'Front Delts', 'Shoulders/Traps', 'Traps'] },
    { category: 'Arms - Biceps', muscles: ['Biceps', 'Biceps/Forearms', 'Forearms'] },
    { category: 'Arms - Triceps', muscles: ['Triceps'] },
    { category: 'Legs - Quads', muscles: ['Quads'] },
    { category: 'Legs - Hamstrings & Glutes', muscles: ['Hamstrings', 'Glutes'] },
    { category: 'Legs - Calves', muscles: ['Calves'] },
    { category: 'Core & Abs', muscles: ['Core', 'Upper Abs', 'Lower Abs', 'Abs', 'Obliques', 'Abs/Obliques'] },
    { category: 'Full Body & Cardio', muscles: ['Full Body', 'Cardio'] },
  ];

  const totalPrimarySets: number = (Object.values(muscleVolume) as { primary: number; secondary: number; effective: number }[]).reduce(
    (acc, curr) => acc + curr.primary,
    0
  );
  const totalEffectiveSets: number = (Object.values(muscleVolume) as { primary: number; secondary: number; effective: number }[]).reduce(
    (acc, curr) => acc + curr.effective,
    0
  );

  const getSetDisplay = (muscle: string): number => {
    const data = muscleVolume[muscle];
    if (!data) return 0;
    if (volumeMode === 'primary') return data.primary;
    if (volumeMode === 'effective') return Math.round(data.effective * 10) / 10;
    return data.primary + data.secondary;
  };

  const getStatusBadge = (sets: number, landmark: any) => {
    if (sets === 0) return { label: 'Untrained', color: 'bg-[#ECE7DC] text-[#8C8278] border-[#D4CBC0]' };
    if (sets < landmark.mev) return { label: 'Below MEV', color: 'bg-[#781D2E]/10 text-[#781D2E] border-[#781D2E]/30' };
    if (sets >= landmark.mev && sets < landmark.mavMin) return { label: 'Maintenance', color: 'bg-[#182333]/10 text-[#182333] border-[#182333]/30' };
    if (sets >= landmark.mavMin && sets <= landmark.mavMax) return { label: 'Optimal (MAV)', color: 'bg-[#781D2E] text-[#FAF8F5] border-transparent' };
    return { label: 'Peak / MRV', color: 'bg-[#182333] text-[#FAF8F5] border-transparent' };
  };

  return (
    <div className="space-y-4 sm:space-y-6 pb-12 sm:pb-6">
      {/* Top Metric Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5 sm:gap-4">
        <div className="bg-[#FAF8F5] p-3.5 sm:p-4 rounded-xl border border-[#E3DCD1] shadow-xs">
          <span className="text-[9px] sm:text-[10px] font-mono-num font-semibold uppercase text-[#8C8278] tracking-wider block">
            Direct Sets
          </span>
          <div className="text-xl sm:text-2xl font-mono-num font-bold text-[#781D2E] mt-0.5">
            {totalPrimarySets} <span className="text-xs font-normal text-[#6B635B]">sets</span>
          </div>
          <div className="text-[11px] font-mono-num text-[#6B635B] mt-0.5">{totalEffectiveSets.toFixed(1)} effective</div>
        </div>

        <div className="bg-[#FAF8F5] p-3.5 sm:p-4 rounded-xl border border-[#E3DCD1] shadow-xs">
          <span className="text-[9px] sm:text-[10px] font-mono-num font-semibold uppercase text-[#8C8278] tracking-wider block">
            Workouts Logged
          </span>
          <div className="text-xl sm:text-2xl font-mono-num font-bold text-[#182333] mt-0.5">
            {filteredLogs.length} <span className="text-xs font-normal text-[#6B635B]">sessions</span>
          </div>
          <div className="text-[11px] font-mono-num text-[#6B635B] mt-0.5">Selected range</div>
        </div>

        <div className="bg-[#FAF8F5] p-3.5 sm:p-4 rounded-xl border border-[#E3DCD1] shadow-xs">
          <span className="text-[9px] sm:text-[10px] font-mono-num font-semibold uppercase text-[#8C8278] tracking-wider block">
            Muscles Hit
          </span>
          <div className="text-xl sm:text-2xl font-mono-num font-bold text-[#211D1B] mt-0.5">
            {Object.keys(muscleVolume).filter((m) => muscleVolume[m].primary > 0).length}
            <span className="text-xs font-normal text-[#8C8278]">/{Object.keys(MUSCLE_LANDMARKS).length}</span>
          </div>
          <div className="text-[11px] font-mono-num text-[#6B635B] mt-0.5">Hypertrophy target</div>
        </div>

        <div className="bg-[#FAF8F5] p-3.5 sm:p-4 rounded-xl border border-[#E3DCD1] shadow-xs flex flex-col justify-between">
          <div>
            <span className="text-[9px] sm:text-[10px] font-mono-num font-semibold uppercase text-[#8C8278] tracking-wider block">
              Active Routine
            </span>
            <div className="text-xs sm:text-sm font-bold text-[#211D1B] truncate mt-0.5">
              {activeSplit?.name || 'Standard Split'}
            </div>
          </div>
          <button
            onClick={onNavigateToLogger}
            className="mt-2 text-left text-[11px] font-mono-num font-bold text-[#781D2E] hover:underline flex items-center gap-1"
          >
            <span>Log new session</span>
            <ChevronRight className="w-3 h-3" />
          </button>
        </div>
      </div>

      {/* Filter and Mode Controls */}
      <div className="bg-[#FAF8F5] border border-[#E3DCD1] p-3.5 sm:p-4 rounded-xl shadow-xs space-y-3">
        {/* Timeframe Filter Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pb-0.5">
          <span className="text-xs font-mono-num font-semibold text-[#8C8278] mr-1 hidden sm:inline">Range:</span>
          {[
            { id: '7', label: '7 Days' },
            { id: '14', label: '14 Days' },
            { id: '30', label: '30 Days' },
            { id: 'all', label: 'All History' },
            { id: 'planned', label: 'Planned Target' },
          ].map((t) => (
            <button
              key={t.id}
              onClick={() => setTimeFilter(t.id as any)}
              className={`px-3 py-1.5 rounded-lg text-xs font-mono-num font-medium whitespace-nowrap transition min-h-[36px] ${
                timeFilter === t.id
                  ? 'bg-[#781D2E] text-[#FAF8F5] font-bold shadow-xs'
                  : 'bg-[#ECE7DC] text-[#6B635B] hover:text-[#211D1B] border border-[#D4CBC0]'
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>

        {/* Volume Mode Toggle */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pt-2 border-t border-[#E3DCD1]">
          <span className="text-xs font-semibold text-[#6B635B]">Counting Calculation:</span>
          <div className="flex items-center bg-[#ECE7DC] p-1 rounded-lg border border-[#D4CBC0] text-xs font-mono-num">
            <button
              onClick={() => setVolumeMode('primary')}
              className={`px-2.5 py-1 rounded transition ${
                volumeMode === 'primary' ? 'bg-[#781D2E] text-[#FAF8F5] font-bold' : 'text-[#6B635B]'
              }`}
            >
              Direct (1.0x)
            </button>
            <button
              onClick={() => setVolumeMode('effective')}
              className={`px-2.5 py-1 rounded transition ${
                volumeMode === 'effective' ? 'bg-[#781D2E] text-[#FAF8F5] font-bold' : 'text-[#6B635B]'
              }`}
            >
              Effective (1.0/0.5x)
            </button>
            <button
              onClick={() => setVolumeMode('combined')}
              className={`px-2.5 py-1 rounded transition ${
                volumeMode === 'combined' ? 'bg-[#781D2E] text-[#FAF8F5] font-bold' : 'text-[#6B635B]'
              }`}
            >
              All Involvements
            </button>
          </div>
        </div>
      </div>

      {/* Main Content Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Left 8 Cols: Muscle Groups Breakdown */}
        <div className="lg:col-span-8 space-y-4">
          {categoryGroups.map((group) => {
            const relevantMuscles = group.muscles.filter(
              (m) => (muscleVolume[m]?.primary || 0) > 0 || (muscleVolume[m]?.secondary || 0) > 0 || timeFilter === 'planned'
            );

            const displayMuscles = relevantMuscles.length > 0 ? relevantMuscles : group.muscles.slice(0, 2);
            const groupTotalSets: number = group.muscles.reduce((sum: number, m: string) => sum + getSetDisplay(m), 0);

            return (
              <div key={group.category} className="bg-[#FAF8F5] border border-[#E3DCD1] rounded-xl p-4 sm:p-5 space-y-3 shadow-xs">
                <div className="flex items-center justify-between pb-2 border-b border-[#E3DCD1]">
                  <div className="flex items-center gap-2">
                    <h3 className="font-bold text-[#211D1B] text-xs sm:text-sm uppercase font-mono-num tracking-wider">
                      {group.category}
                    </h3>
                    <span className="text-[11px] bg-[#ECE7DC] text-[#211D1B] border border-[#D4CBC0] px-2 py-0.2 rounded font-mono-num font-bold">
                      {groupTotalSets.toFixed(groupTotalSets % 1 === 0 ? 0 : 1)} sets
                    </span>
                  </div>
                  <span className="text-[10px] font-mono-num text-[#8C8278]">
                    MAV: 10–20 sets/wk
                  </span>
                </div>

                <div className="space-y-2.5">
                  {displayMuscles.map((muscle) => {
                    const sets = getSetDisplay(muscle);
                    const rawData = muscleVolume[muscle] || { primary: 0, secondary: 0, effective: 0, exercises: [] };
                    const landmark = getLandmarkForMuscle(muscle);
                    const status = getStatusBadge(sets, landmark);
                    const percentage = Math.min(100, Math.round((sets / (landmark.mavMax || 20)) * 100));

                    return (
                      <div
                        key={muscle}
                        onClick={() => setSelectedMuscle(muscle)}
                        className={`p-3 rounded-lg border transition cursor-pointer ${
                          selectedMuscle === muscle
                            ? 'bg-[#781D2E]/10 border-[#781D2E]'
                            : 'bg-[#ECE7DC]/30 border-[#D4CBC0] hover:border-[#781D2E]/50'
                        }`}
                      >
                        <div className="flex items-center justify-between text-xs mb-1.5">
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-[#211D1B] text-xs sm:text-sm">{muscle}</span>
                            <span className={`px-1.5 py-0.2 rounded text-[10px] font-mono-num font-semibold border ${status.color}`}>
                              {status.label}
                            </span>
                          </div>

                          <div className="text-right font-mono-num">
                            <span className="font-bold text-[#781D2E] text-xs sm:text-sm">
                              {sets} <span className="text-[10px] font-normal text-[#6B635B]">sets</span>
                            </span>
                          </div>
                        </div>

                        {/* Minimalist Progress Bar */}
                        <div className="w-full bg-[#E3DCD1] h-2 rounded-full overflow-hidden relative">
                          <div
                            className="absolute top-0 bottom-0 w-0.5 bg-[#6B635B] z-10"
                            style={{ left: `${(landmark.mev / (landmark.mavMax || 20)) * 100}%` }}
                            title={`MEV: ${landmark.mev}`}
                          />
                          <div
                            className="h-full rounded-full transition-all duration-500 bg-[#781D2E]"
                            style={{ width: `${percentage}%` }}
                          />
                        </div>

                        <div className="flex items-center justify-between text-[9px] text-[#8C8278] mt-1 font-mono-num">
                          <span>MEV: {landmark.mev}s</span>
                          <span>MAV: {landmark.mavMin}–{landmark.mavMax}s</span>
                          <span>MRV: {landmark.mrv}s</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>

        {/* Right 4 Cols: Muscle Exercise Drilldown Panel */}
        <div className="lg:col-span-4 space-y-4">
          <div className="bg-[#FAF8F5] border border-[#E3DCD1] rounded-xl p-4 sm:p-5 space-y-3.5 sticky top-20 shadow-xs">
            <div className="flex items-center justify-between pb-2.5 border-b border-[#E3DCD1]">
              <h3 className="font-serif-title font-bold text-[#211D1B] text-sm sm:text-base">
                {selectedMuscle ? `${selectedMuscle} Drilldown` : 'Muscle Drilldown'}
              </h3>
              {selectedMuscle && (
                <button
                  onClick={() => setSelectedMuscle(null)}
                  className="text-xs text-[#6B635B] hover:text-[#211D1B]"
                >
                  Clear
                </button>
              )}
            </div>

            {selectedMuscle ? (
              <div className="space-y-3">
                <div className="bg-[#ECE7DC] p-3 rounded-lg border border-[#D4CBC0] text-xs font-mono-num">
                  <div className="text-[#6B635B]">Volume Recorded:</div>
                  <div className="text-lg font-bold text-[#781D2E]">
                    {muscleVolume[selectedMuscle]?.primary || 0} direct sets
                  </div>
                  {muscleVolume[selectedMuscle]?.secondary > 0 && (
                    <div className="text-[10px] text-[#6B635B] mt-0.5">
                      +{muscleVolume[selectedMuscle]?.secondary} secondary compound sets
                    </div>
                  )}
                  {muscleVolume[selectedMuscle]?.lastTrained && (
                    <div className="text-[10px] text-[#8C8278] mt-1">
                      Last trained: {muscleVolume[selectedMuscle]?.lastTrained}
                    </div>
                  )}
                </div>

                <div className="text-xs font-bold text-[#211D1B] font-mono-num">Session History:</div>
                <div className="space-y-1.5 max-h-64 overflow-y-auto pr-1">
                  {muscleVolume[selectedMuscle]?.exercises && muscleVolume[selectedMuscle].exercises.length > 0 ? (
                    muscleVolume[selectedMuscle].exercises.map((item, idx) => (
                      <div
                        key={idx}
                        className="bg-[#ECE7DC]/40 p-2 rounded-lg border border-[#D4CBC0] flex items-center justify-between text-xs"
                      >
                        <div>
                          <div className="font-semibold text-[#211D1B]">{item.exerciseName}</div>
                          <div className="text-[10px] text-[#8C8278] font-mono-num">{item.date}</div>
                        </div>
                        <div className="text-right shrink-0 font-mono-num">
                          <span className="font-bold text-[#781D2E]">+{item.sets} sets</span>
                          <div className="text-[9px] text-[#6B635B]">
                            {item.isPrimary ? 'Primary' : 'Secondary'}
                          </div>
                        </div>
                      </div>
                    ))
                  ) : (
                    <p className="text-xs text-[#8C8278] py-4 text-center font-mono-num">No logged movements for this muscle yet.</p>
                  )}
                </div>
              </div>
            ) : (
              <div className="text-center py-6 text-xs text-[#6B635B] space-y-1.5">
                <BarChart3 className="w-6 h-6 mx-auto text-[#8C8278]" />
                <p className="font-semibold text-[#211D1B]">Select any muscle card</p>
                <p className="text-[11px] text-[#8C8278]">Tap to view exact set history and compound contributions.</p>
              </div>
            )}

            {/* Hypertrophy Guidelines Note */}
            <div className="pt-3 border-t border-[#E3DCD1] text-xs space-y-1.5">
              <div className="font-bold text-[#211D1B] text-[11px] uppercase font-mono-num">
                Hypertrophy Landmarks:
              </div>
              <div className="space-y-1 text-[10px] leading-relaxed text-[#6B635B] font-mono-num">
                <p><strong className="text-[#211D1B]">MEV:</strong> Minimum effective volume (~6–10 sets/week).</p>
                <p><strong className="text-[#211D1B]">MAV:</strong> Maximum adaptive volume (~12–20 sets/week).</p>
                <p><strong className="text-[#211D1B]">MRV:</strong> Maximum recoverable volume (20–25+ sets/week).</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
