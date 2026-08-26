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
      {/* Header & Quick Action */}
      <div className="bg-[#FAF8F5] p-4 sm:p-5 rounded-xl border border-[#E3DCD1] shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="font-serif-title text-base sm:text-xl font-bold text-[#211D1B] tracking-wide">
              Workout Logs
            </h2>
            <span className="text-[11px] font-mono-num font-semibold text-[#781D2E] bg-[#781D2E]/10 border border-[#781D2E]/20 px-2 py-0.5 rounded">
              {logs.length} Sessions
            </span>
          </div>
          <p className="text-xs text-[#6B635B] mt-1">
            Archived logs with weights, reps, and completed volume.
          </p>
        </div>

        <button
          onClick={onStartNewWorkout}
          className="inline-flex items-center justify-center gap-1.5 px-4 py-2 rounded-lg text-xs font-mono-num font-semibold bg-[#781D2E] hover:bg-[#5C1221] active:scale-98 text-[#FAF8F5] transition shadow-xs min-h-[40px]"
        >
          <Dumbbell className="w-3.5 h-3.5" />
          <span>Log New Session</span>
        </button>
      </div>

      {logs.length === 0 ? (
        <div className="bg-[#FAF8F5] border border-dashed border-[#D4CBC0] rounded-xl p-10 text-center text-[#6B635B] space-y-3">
          <History className="w-8 h-8 mx-auto text-[#8C8278]" />
          <h3 className="font-serif-title font-semibold text-[#211D1B] text-sm sm:text-base">
            No Workout Sessions Recorded Yet
          </h3>
          <p className="text-xs max-w-sm mx-auto text-[#6B635B]">
            Complete sets in the active tracker to record workouts and compute weekly muscle volumes automatically.
          </p>
          <button
            onClick={onStartNewWorkout}
            className="px-4 py-2.5 bg-[#781D2E] hover:bg-[#5C1221] text-[#FAF8F5] font-mono-num font-semibold rounded-lg text-xs transition"
          >
            Start Workout
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          {logs.map((log) => {
            const isExpanded = expandedLogId === log.id;

            return (
              <div
                key={log.id}
                className="bg-[#FAF8F5] border border-[#E3DCD1] rounded-xl overflow-hidden shadow-xs hover:border-[#781D2E] transition"
              >
                {/* Header Row */}
                <div
                  onClick={() => toggleExpand(log.id)}
                  className="p-3.5 sm:p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 cursor-pointer hover:bg-[#ECE7DC]/30 select-none"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-xs font-bold text-[#781D2E] font-mono-num uppercase">
                        {log.dayName}
                      </span>
                      <span className="text-[#8C8278]">•</span>
                      <span className="text-xs text-[#6B635B] flex items-center gap-1 font-mono-num">
                        <Calendar className="w-3.5 h-3.5 text-[#8C8278]" />
                        {log.date}
                      </span>
                      {log.durationMinutes && (
                        <>
                          <span className="text-[#8C8278]">•</span>
                          <span className="text-xs text-[#6B635B] flex items-center gap-1 font-mono-num">
                            <Clock className="w-3.5 h-3.5 text-[#8C8278]" />
                            {log.durationMinutes} min
                          </span>
                        </>
                      )}
                    </div>

                    <div className="flex items-center gap-2 text-xs font-mono-num">
                      <strong className="text-[#211D1B]">
                        {log.totalCompletedSets} Completed Sets
                      </strong>
                      <span className="text-[#8C8278]">({log.exercises.length} exercises)</span>
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
                              className="bg-[#ECE7DC] border border-[#D4CBC0] text-[#211D1B] px-1.5 py-0.2 rounded text-[10px] font-mono-num"
                            >
                              <strong className="text-[#781D2E]">{c.primary}</strong> {muscle}
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
                      className="p-1.5 text-[#8C8278] hover:text-[#781D2E] transition rounded"
                      title="Delete log"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>

                    <div className="text-[#8C8278] p-1">
                      {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                    </div>
                  </div>
                </div>

                {/* Expanded Session Detail */}
                {isExpanded && (
                  <div className="px-3.5 pb-4 sm:px-4 pt-1 border-t border-[#E3DCD1] space-y-3 bg-[#ECE7DC]/20">
                    {log.notes && (
                      <div className="bg-[#ECE7DC]/60 p-2.5 rounded-lg border border-[#D4CBC0] text-xs text-[#211D1B] flex items-start gap-2">
                        <FileText className="w-3.5 h-3.5 text-[#781D2E] shrink-0 mt-0.5" />
                        <div>
                          <strong className="font-mono-num text-[11px] text-[#6B635B]">Notes:</strong> {log.notes}
                        </div>
                      </div>
                    )}

                    {/* Muscle Groups Trained */}
                    <div>
                      <div className="text-[10px] uppercase font-mono-num font-bold text-[#6B635B] tracking-wider mb-1.5">
                        Volume Distribution:
                      </div>
                      <div className="flex flex-wrap gap-1.5">
                        {Object.entries(log.muscleSetCounts || {}).map(([muscle, counts]) => {
                          const c = counts as { primary: number; secondary: number; total: number };
                          return (
                            <div
                              key={muscle}
                              className="bg-[#FAF8F5] border border-[#D4CBC0] px-2.5 py-1 rounded-lg text-xs font-mono-num flex items-center gap-1.5"
                            >
                              <span className="font-semibold text-[#211D1B]">{muscle}:</span>
                              <span className="text-[#781D2E] font-bold">{c.primary} sets</span>
                              {c.secondary > 0 && (
                                <span className="text-[#8C8278] text-[10px]">(+{c.secondary} sec)</span>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    </div>

                    {/* Exercises & Sets */}
                    <div className="space-y-2">
                      <div className="text-[10px] uppercase font-mono-num font-bold text-[#6B635B] tracking-wider">
                        Movement Records:
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
                        {log.exercises.map((ex, exIdx) => (
                          <div
                            key={ex.id || exIdx}
                            className="bg-[#FAF8F5] border border-[#D4CBC0] rounded-lg p-3 space-y-1.5 text-xs shadow-2xs"
                          >
                            <div className="flex items-center justify-between font-semibold text-[#211D1B]">
                              <span>
                                {exIdx + 1}. {ex.exerciseName}
                              </span>
                              <span className="text-[#781D2E] font-mono-num font-bold">
                                {ex.sets.filter((s) => s.completed).length} sets
                              </span>
                            </div>

                            <div className="space-y-0.5 divide-y divide-[#E3DCD1] font-mono-num text-[11px]">
                              {ex.sets.map((set, sIdx) => (
                                <div
                                  key={set.id || sIdx}
                                  className="pt-1 flex items-center justify-between text-[#6B635B]"
                                >
                                  <span>Set {sIdx + 1}</span>
                                  <span className="text-[#211D1B] font-medium">
                                    {set.weight ? `${set.weight} ${set.weightUnit || 'lbs'}` : 'BW'} × {set.reps} reps
                                  </span>
                                  {set.rpe && <span className="text-[#8C8278]">@{set.rpe}</span>}
                                  <span className={set.completed ? 'text-[#781D2E] font-bold' : 'text-[#8C8278]'}>
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
