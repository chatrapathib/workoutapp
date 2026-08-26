import React, { useState } from 'react';
import {
  Calendar,
  Clock,
  Dumbbell,
  Trash2,
  ChevronDown,
  ChevronUp,
  FileText,
  History,
} from 'lucide-react';
import { WorkoutLog } from '../types';

interface WorkoutHistoryProps {
  logs: WorkoutLog[];
  onDeleteLog: (id: string) => Promise<void>;
  onStartNewWorkout: () => void;
}

export const WorkoutHistory: React.FC<WorkoutHistoryProps> = ({
  logs,
  onDeleteLog,
  onStartNewWorkout,
}) => {
  const [expandedLogId, setExpandedLogId] = useState<string | null>(logs[0]?.id || null);

  const toggleExpand = (id: string) => {
    setExpandedLogId((prev) => (prev === id ? null : id));
  };

  return (
    <div className="space-y-4 sm:space-y-6 pb-12 sm:pb-6">
      {/* Top Header Card */}
      <div className="bg-[#121216] border border-[#22222A] p-4 sm:p-5 rounded-xl shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="font-display text-base sm:text-xl font-extrabold text-[#F4EFE6] tracking-tight uppercase">
              Workout Session Archive
            </h2>
            <span className="text-[10px] font-mono-num font-bold text-[#E02438] bg-[#E02438]/10 border border-[#E02438]/25 px-2 py-0.5 rounded">
              {logs.length} SESSIONS
            </span>
          </div>
          <p className="text-xs text-[#858076] mt-1 font-mono-num">
            Archived logs with weights, reps, and completed volume.
          </p>
        </div>

        <button
          onClick={onStartNewWorkout}
          className="inline-flex items-center justify-center gap-1.5 px-4 py-2 rounded-lg text-xs font-mono-num font-bold bg-[#E02438] hover:bg-[#C81D25] active:scale-98 text-[#FFFFFF] transition shadow-xs min-h-[40px]"
        >
          <Dumbbell className="w-3.5 h-3.5" />
          <span>Log New Session</span>
        </button>
      </div>

      {logs.length === 0 ? (
        <div className="bg-[#121216] border border-dashed border-[#272733] rounded-xl p-10 text-center text-[#858076] space-y-3 font-mono-num">
          <History className="w-8 h-8 mx-auto text-[#6B665E]" />
          <h3 className="font-display font-bold text-[#F4EFE6] text-sm sm:text-base uppercase tracking-tight">
            No Workout Sessions Recorded Yet
          </h3>
          <p className="text-xs max-w-sm mx-auto text-[#858076]">
            Complete sets in the active tracker to record workouts and compute weekly muscle volumes automatically.
          </p>
          <button
            onClick={onStartNewWorkout}
            className="px-4 py-2.5 bg-[#E02438] hover:bg-[#C81D25] text-[#FFFFFF] font-mono-num font-bold rounded-lg text-xs transition"
          >
            Start Workout
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          {logs.map((log, idx) => {
            const isExpanded = expandedLogId === log.id;

            return (
              <div
                key={log.id}
                className="bg-[#121216] border border-[#22222A] rounded-xl overflow-hidden shadow-xs hover:border-[#E02438]/50 transition"
              >
                {/* Header Row */}
                <div
                  onClick={() => toggleExpand(log.id)}
                  className="p-3.5 sm:p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 cursor-pointer hover:bg-[#181820] select-none"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 flex-wrap font-mono-num">
                      <span className="text-[10px] text-[#6B665E] font-bold">
                        #{String(logs.length - idx).padStart(2, '0')}
                      </span>
                      <span className="text-xs font-bold text-[#E02438] uppercase">
                        {log.dayName}
                      </span>
                      <span className="text-[#6B665E]">•</span>
                      <span className="text-xs text-[#858076] flex items-center gap-1">
                        <Calendar className="w-3.5 h-3.5 text-[#6B665E]" />
                        {log.date}
                      </span>
                      {log.durationMinutes && (
                        <>
                          <span className="text-[#6B665E]">•</span>
                          <span className="text-xs text-[#858076] flex items-center gap-1">
                            <Clock className="w-3.5 h-3.5 text-[#6B665E]" />
                            {log.durationMinutes} min
                          </span>
                        </>
                      )}
                    </div>

                    <div className="flex items-center gap-2 text-xs font-mono-num">
                      <strong className="text-[#F4EFE6]">
                        {log.totalCompletedSets} Completed Sets
                      </strong>
                      <span className="text-[#6B665E]">({log.exercises.length} movements)</span>
                    </div>
                  </div>

                  {/* Muscle Badges */}
                  <div className="flex items-center gap-2">
                    <div className="flex items-center gap-1 flex-wrap">
                      {Object.entries(log.muscleSetCounts || {})
                        .slice(0, 3)
                        .map(([muscle, counts]) => {
                          const c = counts as { primary: number; secondary: number; total: number };
                          return (
                            <span
                              key={muscle}
                              className="bg-[#1A1A22] border border-[#272733] text-[#F4EFE6] px-1.5 py-0.2 rounded text-[10px] font-mono-num"
                            >
                              <strong className="text-[#E02438]">{c.primary}</strong> {muscle}
                            </span>
                          );
                        })}
                    </div>

                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        if (confirm('Delete this workout log?')) {
                          onDeleteLog(log.id);
                        }
                      }}
                      className="p-1.5 text-[#6B665E] hover:text-[#E02438] transition rounded"
                      title="Delete log"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>

                    <div className="text-[#858076] p-1">
                      {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                    </div>
                  </div>
                </div>

                {/* Expanded Session Detail */}
                {isExpanded && (
                  <div className="px-3.5 pb-4 sm:px-4 pt-2 border-t border-[#1E1E26] space-y-3 bg-[#0E0E12]">
                    {log.notes && (
                      <div className="bg-[#181820] p-2.5 rounded-lg border border-[#252530] text-xs text-[#F4EFE6] flex items-start gap-2">
                        <FileText className="w-3.5 h-3.5 text-[#E02438] shrink-0 mt-0.5" />
                        <div className="font-mono-num">
                          <strong className="text-[11px] text-[#858076]">Notes:</strong> {log.notes}
                        </div>
                      </div>
                    )}

                    {/* Muscle Groups Trained */}
                    <div>
                      <div className="text-[10px] uppercase font-mono-num font-bold text-[#858076] tracking-wider mb-1.5">
                        Volume Distribution:
                      </div>
                      <div className="flex flex-wrap gap-1.5">
                        {Object.entries(log.muscleSetCounts || {}).map(([muscle, counts]) => {
                          const c = counts as { primary: number; secondary: number; total: number };
                          return (
                            <div
                              key={muscle}
                              className="bg-[#121216] border border-[#272733] px-2.5 py-1 rounded-lg text-xs font-mono-num flex items-center gap-1.5"
                            >
                              <span className="font-semibold text-[#F4EFE6]">{muscle}:</span>
                              <span className="text-[#E02438] font-bold">{c.primary} sets</span>
                              {c.secondary > 0 && (
                                <span className="text-[#6B665E] text-[10px]">(+{c.secondary} sec)</span>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    </div>

                    {/* Movements & Sets */}
                    <div className="space-y-2">
                      <div className="text-[10px] uppercase font-mono-num font-bold text-[#858076] tracking-wider">
                        Movement Records:
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
                        {log.exercises.map((ex, exIdx) => (
                          <div
                            key={ex.id || exIdx}
                            className="bg-[#121216] border border-[#22222A] rounded-lg p-3 space-y-1.5 text-xs shadow-2xs"
                          >
                            <div className="flex items-center justify-between font-semibold text-[#F4EFE6]">
                              <span className="font-display">
                                {exIdx + 1}. {ex.exerciseName}
                              </span>
                              <span className="text-[#E02438] font-mono-num font-bold">
                                {ex.sets.filter((s) => s.completed).length} sets
                              </span>
                            </div>

                            <div className="space-y-0.5 divide-y divide-[#1E1E26] font-mono-num text-[11px]">
                              {ex.sets.map((set, sIdx) => (
                                <div
                                  key={set.id || sIdx}
                                  className="pt-1 flex items-center justify-between text-[#858076]"
                                >
                                  <span>Set {sIdx + 1}</span>
                                  <span className="text-[#F4EFE6] font-medium">
                                    {set.weight ? `${set.weight} ${set.weightUnit || 'lbs'}` : 'BW'} × {set.reps} reps
                                  </span>
                                  {set.rpe && <span className="text-[#6B665E]">@{set.rpe}</span>}
                                  <span className={set.completed ? 'text-[#E02438] font-bold' : 'text-[#6B665E]'}>
                                    {set.completed ? 'Done' : '—'}
                                  </span>
                                </div>
                              ))}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
