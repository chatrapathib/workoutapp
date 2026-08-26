import React, { useState, useEffect } from 'react';
import {
  Clock,
  Plus,
  Trash2,
  Timer,
  Save,
  Check,
  X,
  Search,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  RotateCcw,
} from 'lucide-react';
import { WorkoutDay, WorkoutSplit, WorkoutLog, LoggedExercise, LoggedSet, ExerciseItem } from '../types';

interface WorkoutLoggerProps {
  activeSplit: WorkoutSplit | null;
  selectedDay: WorkoutDay | null;
  exerciseDatabase: ExerciseItem[];
  onSaveLog: (log: Partial<WorkoutLog>) => Promise<void>;
  onCancel: () => void;
  onSelectDay: (day: WorkoutDay | null) => void;
}

export const WorkoutLogger: React.FC<WorkoutLoggerProps> = ({
  activeSplit,
  selectedDay,
  exerciseDatabase,
  onSaveLog,
  onCancel,
  onSelectDay,
}) => {
  // Session State
  const [dayName, setDayName] = useState<string>(selectedDay?.name || 'Workout Session');
  const [exercises, setExercises] = useState<LoggedExercise[]>([]);
  const [notes, setNotes] = useState<string>('');
  const [workoutDate, setWorkoutDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [startTime] = useState<string>(new Date().toISOString());
  const [durationSeconds, setDurationSeconds] = useState<number>(0);
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [weightUnit, setWeightUnit] = useState<'lbs' | 'kg'>('lbs');

  // Rest Timer State
  const [restTimeLeft, setRestTimeLeft] = useState<number | null>(null);
  const [restInitialTime, setRestInitialTime] = useState<number>(90);
  const [isRestTimerActive, setIsRestTimerActive] = useState<boolean>(false);

  // Exercise Search Add Modal
  const [showAddModal, setShowAddModal] = useState<boolean>(false);
  const [searchExerciseQuery, setSearchExerciseQuery] = useState<string>('');

  // Duration Timer Interval
  useEffect(() => {
    const timer = setInterval(() => {
      setDurationSeconds((prev) => prev + 1);
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Rest Countdown Interval
  useEffect(() => {
    let interval: any = null;
    if (isRestTimerActive && restTimeLeft !== null && restTimeLeft > 0) {
      interval = setInterval(() => {
        setRestTimeLeft((prev) => (prev !== null && prev > 0 ? prev - 1 : 0));
      }, 1000);
    } else if (restTimeLeft === 0 && isRestTimerActive) {
      setIsRestTimerActive(false);
      try {
        const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
        const osc = audioCtx.createOscillator();
        const gain = audioCtx.createGain();
        osc.connect(gain);
        gain.connect(audioCtx.destination);
        osc.frequency.setValueAtTime(880, audioCtx.currentTime);
        gain.gain.setValueAtTime(0.15, audioCtx.currentTime);
        osc.start();
        osc.stop(audioCtx.currentTime + 0.3);
      } catch (e) {
        // audio fallback
      }
    }
    return () => clearInterval(interval);
  }, [isRestTimerActive, restTimeLeft]);

  // Initialize exercises when selectedDay changes
  useEffect(() => {
    if (selectedDay) {
      setDayName(selectedDay.name);
      const initialExercises: LoggedExercise[] = selectedDay.exercises.map((pEx, idx) => {
        const targetSets = pEx.sets || 3;
        const defaultReps = pEx.repMin || 10;
        return {
          id: `lex-${idx}-${Date.now()}`,
          exerciseName: pEx.exerciseName,
          primaryMuscle: pEx.primaryMuscle,
          secondaryMuscles: pEx.secondaryMuscles || [],
          targetSets,
          targetRepsRaw: pEx.repRangeRaw,
          sets: Array.from({ length: targetSets }).map((_, sIdx) => ({
            id: `s-${sIdx + 1}`,
            setNumber: sIdx + 1,
            reps: defaultReps,
            weight: 100,
            weightUnit,
            completed: false,
            rpe: 8,
          })),
        };
      });
      setExercises(initialExercises);
    } else if (activeSplit && activeSplit.days.length > 0) {
      onSelectDay(activeSplit.days[0]);
    } else {
      setExercises([
        {
          id: `lex-1-${Date.now()}`,
          exerciseName: 'Barbell Bench Press',
          primaryMuscle: 'Chest',
          secondaryMuscles: ['Triceps', 'Shoulders'],
          targetSets: 3,
          targetRepsRaw: '8–12 reps',
          sets: [
            { id: 's-1', setNumber: 1, reps: 10, weight: 135, completed: false, weightUnit: 'lbs' },
            { id: 's-2', setNumber: 2, reps: 10, weight: 135, completed: false, weightUnit: 'lbs' },
            { id: 's-3', setNumber: 3, reps: 8, weight: 135, completed: false, weightUnit: 'lbs' },
          ],
        },
      ]);
    }
  }, [selectedDay]);

  // Set management
  const toggleSetComplete = (exIdx: number, setIdx: number) => {
    setExercises((prev) => {
      const updated = [...prev];
      const ex = { ...updated[exIdx] };
      const sets = [...ex.sets];
      const current = sets[setIdx];
      const nextCompleted = !current.completed;
      sets[setIdx] = { ...current, completed: nextCompleted };
      ex.sets = sets;
      updated[exIdx] = ex;

      if (nextCompleted) {
        setRestTimeLeft(restInitialTime);
        setIsRestTimerActive(true);
      }

      return updated;
    });
  };

  const updateSetData = (exIdx: number, setIdx: number, field: keyof LoggedSet, value: any) => {
    setExercises((prev) => {
      const updated = [...prev];
      const ex = { ...updated[exIdx] };
      const sets = [...ex.sets];
      sets[setIdx] = { ...sets[setIdx], [field]: value };
      ex.sets = sets;
      updated[exIdx] = ex;
      return updated;
    });
  };

  const adjustNumericValue = (exIdx: number, setIdx: number, field: 'weight' | 'reps', delta: number) => {
    setExercises((prev) => {
      const updated = [...prev];
      const ex = { ...updated[exIdx] };
      const sets = [...ex.sets];
      const currVal = (sets[setIdx][field] as number) || 0;
      const nextVal = Math.max(0, currVal + delta);
      sets[setIdx] = { ...sets[setIdx], [field]: nextVal };
      ex.sets = sets;
      updated[exIdx] = ex;
      return updated;
    });
  };

  const addSetToExercise = (exIdx: number) => {
    setExercises((prev) => {
      const updated = [...prev];
      const ex = { ...updated[exIdx] };
      const lastSet = ex.sets[ex.sets.length - 1];
      const newSetNum = ex.sets.length + 1;
      const newSet: LoggedSet = {
        id: `s-${newSetNum}-${Date.now()}`,
        setNumber: newSetNum,
        reps: lastSet ? lastSet.reps : 10,
        weight: lastSet ? lastSet.weight : 100,
        weightUnit,
        completed: false,
        rpe: 8,
      };
      ex.sets = [...ex.sets, newSet];
      ex.targetSets = ex.sets.length;
      updated[exIdx] = ex;
      return updated;
    });
  };

  const removeSetFromExercise = (exIdx: number, setIdx: number) => {
    setExercises((prev) => {
      const updated = [...prev];
      const ex = { ...updated[exIdx] };
      if (ex.sets.length <= 1) return prev;
      ex.sets = ex.sets.filter((_, idx) => idx !== setIdx).map((s, idx) => ({ ...s, setNumber: idx + 1 }));
      ex.targetSets = ex.sets.length;
      updated[exIdx] = ex;
      return updated;
    });
  };

  const removeExercise = (exIdx: number) => {
    setExercises((prev) => prev.filter((_, idx) => idx !== exIdx));
  };

  const handleAddExerciseFromDatabase = (item: ExerciseItem) => {
    const newEx: LoggedExercise = {
      id: `lex-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      exerciseName: item.name,
      primaryMuscle: item.primaryMuscle,
      secondaryMuscles: item.secondaryMuscles || [],
      targetSets: 3,
      targetRepsRaw: '8–12 reps',
      sets: [
        { id: 's-1', setNumber: 1, reps: 10, weight: 100, completed: false, weightUnit },
        { id: 's-2', setNumber: 2, reps: 10, weight: 100, completed: false, weightUnit },
        { id: 's-3', setNumber: 3, reps: 10, weight: 100, completed: false, weightUnit },
      ],
    };
    setExercises((prev) => [...prev, newEx]);
    setShowAddModal(false);
    setSearchExerciseQuery('');
  };

  const completedSetsCount = exercises.reduce((acc, ex) => acc + ex.sets.filter((s) => s.completed).length, 0);
  const totalPlannedSets = exercises.reduce((acc, ex) => acc + ex.sets.length, 0);

  const liveMuscleCounts: Record<string, { primary: number; secondary: number }> = {};
  for (const ex of exercises) {
    const done = ex.sets.filter((s) => s.completed).length;
    if (done > 0) {
      const p = ex.primaryMuscle || 'Other';
      if (!liveMuscleCounts[p]) liveMuscleCounts[p] = { primary: 0, secondary: 0 };
      liveMuscleCounts[p].primary += done;

      for (const s of ex.secondaryMuscles) {
        if (!liveMuscleCounts[s]) liveMuscleCounts[s] = { primary: 0, secondary: 0 };
        liveMuscleCounts[s].secondary += done;
      }
    }
  }

  const formatTimer = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const handleFinishWorkout = async () => {
    if (completedSetsCount === 0) {
      if (!confirm('No completed sets are marked done. Do you still want to save this session?')) {
        return;
      }
    }

    setIsSaving(true);
    try {
      await onSaveLog({
        splitId: activeSplit?.id,
        dayId: selectedDay?.id,
        dayName,
        date: workoutDate,
        startTime,
        endTime: new Date().toISOString(),
        durationMinutes: Math.max(1, Math.round(durationSeconds / 60)),
        exercises,
        notes,
      });
    } catch (e) {
      alert('Failed to save workout session');
    } finally {
      setIsSaving(false);
    }
  };

  const filteredSearchExercises = exerciseDatabase.filter(
    (e) =>
      e.name.toLowerCase().includes(searchExerciseQuery.toLowerCase()) ||
      e.primaryMuscle.toLowerCase().includes(searchExerciseQuery.toLowerCase()) ||
      e.category.toLowerCase().includes(searchExerciseQuery.toLowerCase())
  );

  return (
    <div className="space-y-4 pb-12 sm:pb-6">
      {/* Top Header Card */}
      <div className="bg-[#121216] border border-[#22222A] p-4 sm:p-5 rounded-xl shadow-xs space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-[#E02438] animate-ping" />
              <span className="text-[10px] uppercase font-mono-num font-bold text-[#E02438] tracking-wider">
                LIVE SESSION
              </span>
              <span className="text-[#6B665E]">•</span>
              <span className="text-xs font-mono-num text-[#F4EFE6] flex items-center gap-1">
                <Clock className="w-3.5 h-3.5 text-[#858076]" />
                {formatTimer(durationSeconds)}
              </span>
            </div>

            <h2 className="font-display text-base sm:text-xl font-extrabold text-[#F4EFE6] tracking-tight uppercase">
              {dayName}
            </h2>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {activeSplit && activeSplit.days.length > 0 && (
              <select
                id="active-day-select"
                value={selectedDay?.id || ''}
                onChange={(e) => {
                  const targetDay = activeSplit.days.find((d) => d.id === e.target.value);
                  if (targetDay) onSelectDay(targetDay);
                }}
                className="flex-1 sm:flex-none bg-[#1A1A22] border border-[#272733] text-xs font-mono-num text-[#F4EFE6] rounded-lg px-2.5 py-2 focus:outline-none focus:border-[#E02438] min-h-[40px]"
              >
                {activeSplit.days.map((d) => (
                  <option key={d.id} value={d.id}>
                    {d.name.split('—')[0].trim()} ({d.totalSets} sets)
                  </option>
                ))}
              </select>
            )}

            {/* Weight Unit Switcher */}
            <div className="flex items-center bg-[#1A1A22] p-1 rounded-lg border border-[#272733] text-xs font-mono-num">
              <button
                onClick={() => setWeightUnit('lbs')}
                className={`px-2.5 py-1 rounded transition ${
                  weightUnit === 'lbs' ? 'bg-[#E02438] text-[#FFFFFF] font-bold' : 'text-[#858076]'
                }`}
              >
                LBS
              </button>
              <button
                onClick={() => setWeightUnit('kg')}
                className={`px-2.5 py-1 rounded transition ${
                  weightUnit === 'kg' ? 'bg-[#E02438] text-[#FFFFFF] font-bold' : 'text-[#858076]'
                }`}
              >
                KG
              </button>
            </div>

            <button
              id="finish-workout-btn"
              onClick={handleFinishWorkout}
              disabled={isSaving}
              className="flex-1 sm:flex-none inline-flex items-center justify-center gap-1.5 px-4 py-2 rounded-lg text-xs font-mono-num font-bold bg-[#E02438] hover:bg-[#C81D25] active:scale-98 text-[#FFFFFF] shadow-xs transition disabled:opacity-50 min-h-[40px]"
            >
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>{isSaving ? 'SAVING...' : 'FINISH WORKOUT'}</span>
            </button>
          </div>
        </div>

        {/* Workout Progress Indicator */}
        <div className="space-y-1 pt-1 border-t border-[#1E1E26]">
          <div className="flex justify-between text-[11px] font-mono-num text-[#858076]">
            <span>
              Progress: <strong className="text-[#F4EFE6]">{completedSetsCount}</strong> / {totalPlannedSets} sets completed
            </span>
            <span>{totalPlannedSets > 0 ? Math.round((completedSetsCount / totalPlannedSets) * 100) : 0}%</span>
          </div>
          <div className="w-full bg-[#1A1A22] h-1.5 rounded-full overflow-hidden">
            <div
              className="bg-[#E02438] h-full transition-all duration-300 rounded-full"
              style={{
                width: `${totalPlannedSets > 0 ? (completedSetsCount / totalPlannedSets) * 100 : 0}%`,
              }}
            />
          </div>
        </div>
      </div>

      {/* Rest Timer Bar (Tactile Phone-Friendly) */}
      <div className="bg-[#121216] border border-[#22222A] p-3 sm:p-4 rounded-xl shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-[#1E1E26] border border-[#2A2A36] text-[#E02438] flex items-center justify-center">
            <Timer className="w-4 h-4" />
          </div>
          <div>
            <div className="text-[9px] uppercase font-mono-num font-bold text-[#858076] tracking-wider">
              Rest Countdown
            </div>
            <div className="text-base sm:text-lg font-mono-num font-bold text-[#F4EFE6] flex items-center gap-2">
              <span>{restTimeLeft !== null ? formatTimer(restTimeLeft) : formatTimer(restInitialTime)}</span>
              {isRestTimerActive && (
                <span className="text-[10px] text-[#E02438] uppercase font-mono-num font-bold animate-pulse">
                  Resting
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Quick Presets */}
        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar">
          {[45, 60, 90, 120, 180].map((seconds) => (
            <button
              key={seconds}
              onClick={() => {
                setRestInitialTime(seconds);
                setRestTimeLeft(seconds);
                setIsRestTimerActive(true);
              }}
              className={`px-2.5 py-1.5 rounded-lg text-xs font-mono-num font-medium transition min-h-[36px] ${
                restInitialTime === seconds && isRestTimerActive
                  ? 'bg-[#E02438] text-[#FFFFFF] font-bold'
                  : 'bg-[#1A1A22] text-[#858076] hover:text-[#F4EFE6] border border-[#272733]'
              }`}
            >
              {seconds >= 60 ? `${seconds / 60}m` : `${seconds}s`}
            </button>
          ))}

          {isRestTimerActive ? (
            <button
              onClick={() => setIsRestTimerActive(false)}
              className="px-3 py-1.5 bg-[#E02438]/15 hover:bg-[#E02438]/25 text-[#E02438] border border-[#E02438]/30 rounded-lg text-xs font-mono-num font-bold transition min-h-[36px]"
            >
              Stop
            </button>
          ) : (
            <button
              onClick={() => {
                setRestTimeLeft(restInitialTime);
                setIsRestTimerActive(true);
              }}
              className="px-3 py-1.5 bg-[#1E1E26] text-[#F4EFE6] border border-[#2A2A36] rounded-lg text-xs font-mono-num font-bold transition min-h-[36px]"
            >
              Start
            </button>
          )}
        </div>
      </div>

      {/* Live Volume Logged Banner */}
      {Object.keys(liveMuscleCounts).length > 0 && (
        <div className="bg-[#15151A] border border-[#22222A] p-3 rounded-xl space-y-1.5">
          <div className="text-[10px] uppercase font-mono-num font-bold text-[#858076] tracking-wider">
            Volume Earned in Current Session:
          </div>
          <div className="flex flex-wrap gap-1.5">
            {Object.entries(liveMuscleCounts).map(([muscle, counts]) => (
              <span
                key={muscle}
                className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-xs bg-[#1A1A22] border border-[#272733] text-[#F4EFE6] font-mono-num"
              >
                <strong className="text-[#E02438]">{muscle}:</strong>
                <span>{counts.primary} sets</span>
                {counts.secondary > 0 && (
                  <span className="text-[#858076] text-[10px]">(+{counts.secondary} sec)</span>
                )}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Exercises & Set Logging Cards */}
      <div className="space-y-3.5">
        {exercises.map((ex, exIdx) => {
          const completedExSets = ex.sets.filter((s) => s.completed).length;

          return (
            <div
              key={ex.id}
              className="bg-[#121216] border border-[#22222A] rounded-xl p-3.5 sm:p-5 space-y-3 shadow-xs"
            >
              {/* Exercise Header */}
              <div className="flex items-start justify-between gap-2 pb-2.5 border-b border-[#1E1E26]">
                <div className="flex items-start gap-2.5">
                  <span className="w-6 h-6 rounded-md bg-[#E02438] text-[#FFFFFF] text-xs font-mono-num font-bold flex items-center justify-center shrink-0 mt-0.5">
                    {exIdx + 1}
                  </span>
                  <div>
                    <h3 className="font-display font-bold text-[#F4EFE6] text-sm sm:text-base">{ex.exerciseName}</h3>
                    <div className="flex flex-wrap items-center gap-1.5 mt-0.5 text-xs font-mono-num">
                      <span className="bg-[#1A1A22] text-[#F4EFE6] px-1.5 py-0.2 rounded text-[10px] font-semibold border border-[#272733]">
                        {ex.primaryMuscle}
                      </span>
                      {ex.targetRepsRaw && (
                        <span className="text-[#858076] text-[11px]">
                          Target: {ex.targetRepsRaw}
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-xs font-mono-num text-[#858076]">
                    {completedExSets}/{ex.sets.length}
                  </span>
                  <button
                    onClick={() => removeExercise(exIdx)}
                    title="Remove movement"
                    className="p-1.5 text-[#6B665E] hover:text-[#E02438] rounded-md transition"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {/* Set Rows (Mobile Touch Steppers + Table) */}
              <div className="space-y-2">
                {ex.sets.map((set, sIdx) => (
                  <div
                    key={set.id}
                    className={`p-2.5 sm:p-3 rounded-lg border transition flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 ${
                      set.completed
                        ? 'bg-[#E02438]/10 border-[#E02438]/40'
                        : 'bg-[#181820]/60 border-[#22222A]'
                    }`}
                  >
                    {/* Set Label */}
                    <div className="flex items-center justify-between sm:w-16">
                      <span className="text-xs font-mono-num font-bold text-[#858076]">
                        SET {sIdx + 1}
                      </span>
                      {/* Mobile delete button */}
                      {ex.sets.length > 1 && (
                        <button
                          onClick={() => removeSetFromExercise(exIdx, sIdx)}
                          className="sm:hidden text-[#6B665E] hover:text-[#E02438] p-1"
                        >
                          <Trash2 className="w-3 h-3" />
                        </button>
                      )}
                    </div>

                    {/* Weight & Reps Stepper Controls (Tactile Phone-Friendly) */}
                    <div className="flex items-center gap-3 sm:gap-4 flex-1">
                      {/* Weight Control */}
                      <div className="flex-1 space-y-1">
                        <span className="text-[9px] uppercase font-mono-num font-semibold text-[#858076] block">
                          Weight ({weightUnit.toUpperCase()})
                        </span>
                        <div className="flex items-center gap-1">
                          <button
                            onClick={() => adjustNumericValue(exIdx, sIdx, 'weight', -5)}
                            className="w-7 h-8 bg-[#1A1A22] hover:bg-[#252530] text-[#F4EFE6] rounded font-mono-num font-bold text-xs flex items-center justify-center border border-[#272733] active:scale-95"
                          >
                            -5
                          </button>
                          <input
                            type="number"
                            value={set.weight ?? 0}
                            onChange={(e) =>
                              updateSetData(exIdx, sIdx, 'weight', parseFloat(e.target.value) || 0)
                            }
                            className="w-16 sm:w-20 bg-[#0E0E12] border border-[#272733] focus:border-[#E02438] rounded px-2 py-1 text-center font-mono-num font-bold text-xs sm:text-sm text-[#F4EFE6] focus:outline-none"
                          />
                          <button
                            onClick={() => adjustNumericValue(exIdx, sIdx, 'weight', 5)}
                            className="w-7 h-8 bg-[#1A1A22] hover:bg-[#252530] text-[#F4EFE6] rounded font-mono-num font-bold text-xs flex items-center justify-center border border-[#272733] active:scale-95"
                          >
                            +5
                          </button>
                        </div>
                      </div>

                      {/* Reps Control */}
                      <div className="flex-1 space-y-1">
                        <span className="text-[9px] uppercase font-mono-num font-semibold text-[#858076] block">
                          Reps
                        </span>
                        <div className="flex items-center gap-1">
                          <button
                            onClick={() => adjustNumericValue(exIdx, sIdx, 'reps', -1)}
                            className="w-7 h-8 bg-[#1A1A22] hover:bg-[#252530] text-[#F4EFE6] rounded font-mono-num font-bold text-xs flex items-center justify-center border border-[#272733] active:scale-95"
                          >
                            -1
                          </button>
                          <input
                            type="number"
                            value={set.reps ?? 0}
                            onChange={(e) =>
                              updateSetData(exIdx, sIdx, 'reps', parseInt(e.target.value, 10) || 0)
                            }
                            className="w-14 sm:w-16 bg-[#0E0E12] border border-[#272733] focus:border-[#E02438] rounded px-2 py-1 text-center font-mono-num font-bold text-xs sm:text-sm text-[#F4EFE6] focus:outline-none"
                          />
                          <button
                            onClick={() => adjustNumericValue(exIdx, sIdx, 'reps', 1)}
                            className="w-7 h-8 bg-[#1A1A22] hover:bg-[#252530] text-[#F4EFE6] rounded font-mono-num font-bold text-xs flex items-center justify-center border border-[#272733] active:scale-95"
                          >
                            +1
                          </button>
                        </div>
                      </div>

                      {/* RPE Select */}
                      <div className="w-16 space-y-1 hidden sm:block">
                        <span className="text-[9px] uppercase font-mono-num font-semibold text-[#858076] block">
                          RPE
                        </span>
                        <select
                          value={set.rpe || 8}
                          onChange={(e) => updateSetData(exIdx, sIdx, 'rpe', parseFloat(e.target.value))}
                          className="w-full bg-[#0E0E12] border border-[#272733] rounded px-1.5 py-1 text-xs font-mono-num text-[#F4EFE6] focus:outline-none focus:border-[#E02438]"
                        >
                          {[6, 6.5, 7, 7.5, 8, 8.5, 9, 9.5, 10].map((rpe) => (
                            <option key={rpe} value={rpe}>
                              @{rpe}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>

                    {/* Completion Action Button */}
                    <div className="flex items-center justify-end gap-2 pt-1 sm:pt-0">
                      <button
                        id={`check-set-${exIdx}-${sIdx}`}
                        onClick={() => toggleSetComplete(exIdx, sIdx)}
                        className={`flex-1 sm:flex-none inline-flex items-center justify-center gap-1.5 px-4 py-2 sm:py-1.5 rounded-lg text-xs font-mono-num font-bold transition min-h-[44px] sm:min-h-[36px] active:scale-98 ${
                          set.completed
                            ? 'bg-[#E02438] text-[#FFFFFF] shadow-xs'
                            : 'bg-[#1A1A22] hover:bg-[#252530] text-[#858076] border border-[#272733]'
                        }`}
                      >
                        <Check className="w-4 h-4 stroke-[2.5]" />
                        <span>{set.completed ? 'DONE' : 'MARK DONE'}</span>
                      </button>

                      {ex.sets.length > 1 && (
                        <button
                          onClick={() => removeSetFromExercise(exIdx, sIdx)}
                          className="hidden sm:block text-[#6B665E] hover:text-[#E02438] p-1.5 rounded"
                          title="Remove set"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              {/* Add Set Button */}
              <button
                onClick={() => addSetToExercise(exIdx)}
                className="w-full py-2 rounded-lg border border-dashed border-[#272733] hover:border-[#E02438] text-[#858076] hover:text-[#E02438] text-xs font-mono-num font-medium flex items-center justify-center gap-1.5 transition min-h-[40px]"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Set</span>
              </button>
            </div>
          );
        })}
      </div>

      {/* Add Movement & Session Notes */}
      <div className="flex flex-col sm:flex-row gap-3 items-stretch">
        <button
          id="add-exercise-to-workout-btn"
          onClick={() => setShowAddModal(true)}
          className="py-3 px-4 rounded-xl border border-[#272733] bg-[#1A1A22] hover:bg-[#22222C] text-[#F4EFE6] text-xs font-mono-num font-semibold flex items-center justify-center gap-2 transition min-h-[44px]"
        >
          <Plus className="w-4 h-4 text-[#E02438]" />
          <span>Add Exercise from Database</span>
        </button>

        <div className="flex-1">
          <input
            type="text"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Session notes (e.g. paused reps, increased bench press load)..."
            className="w-full bg-[#121216] border border-[#272733] focus:border-[#E02438] rounded-xl px-3.5 py-2.5 text-xs text-[#F4EFE6] placeholder-[#6B665E] focus:outline-none min-h-[44px] font-mono-num"
          />
        </div>
      </div>

      {/* Bottom Save Session Action */}
      <div className="pt-2 flex items-center justify-between gap-3">
        <button
          onClick={onCancel}
          className="px-4 py-2.5 rounded-lg text-xs font-mono-num font-medium text-[#858076] hover:text-[#F4EFE6] hover:bg-[#1A1A22] transition min-h-[44px]"
        >
          Cancel
        </button>

        <button
          onClick={handleFinishWorkout}
          disabled={isSaving}
          className="inline-flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl text-xs sm:text-sm font-mono-num font-bold bg-[#E02438] hover:bg-[#C81D25] active:scale-98 text-[#FFFFFF] shadow-sm transition disabled:opacity-50 min-h-[44px]"
        >
          <Save className="w-4 h-4" />
          <span>{isSaving ? 'SAVING...' : `SAVE WORKOUT (${completedSetsCount} SETS COMPLETED)`}</span>
        </button>
      </div>

      {/* Add Exercise Modal (Bottom Sheet on Phone) */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-[#0A0A0C]/80 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-4">
          <div className="bg-[#121216] border-t sm:border border-[#22222A] rounded-t-2xl sm:rounded-2xl w-full max-w-lg max-h-[85vh] flex flex-col shadow-2xl animate-in slide-in-from-bottom duration-200">
            <div className="p-4 border-b border-[#22222A] flex items-center justify-between">
              <h3 className="font-display font-bold text-[#F4EFE6] text-sm sm:text-base uppercase tracking-tight">
                Select Exercise
              </h3>
              <button
                onClick={() => setShowAddModal(false)}
                className="text-[#858076] hover:text-[#F4EFE6] p-1.5"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-3 border-b border-[#22222A]">
              <div className="relative">
                <Search className="w-4 h-4 text-[#6B665E] absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={searchExerciseQuery}
                  onChange={(e) => setSearchExerciseQuery(e.target.value)}
                  placeholder="Search by exercise or muscle group..."
                  autoFocus
                  className="w-full bg-[#0E0E12] border border-[#272733] focus:border-[#E02438] focus:bg-[#121216] rounded-lg pl-9 pr-3 py-2 text-xs font-mono-num text-[#F4EFE6] placeholder-[#6B665E] focus:outline-none"
                />
              </div>
            </div>

            <div className="overflow-y-auto p-3 space-y-1.5 flex-1 max-h-96">
              {filteredSearchExercises.length === 0 ? (
                <div className="p-6 text-center text-xs text-[#6B665E] font-mono-num">
                  No matching exercises found
                </div>
              ) : (
                filteredSearchExercises.map((ex) => (
                  <button
                    key={ex.id}
                    onClick={() => handleAddExerciseFromDatabase(ex)}
                    className="w-full text-left p-3 rounded-xl bg-[#1A1A22]/50 hover:bg-[#1A1A22] border border-[#272733] flex items-center justify-between text-xs transition active:scale-98 min-h-[48px]"
                  >
                    <div>
                      <div className="font-bold text-[#F4EFE6] font-display">{ex.name}</div>
                      <div className="text-[11px] text-[#858076] font-mono-num mt-0.5">
                        Primary: <span className="text-[#E02438] font-semibold">{ex.primaryMuscle}</span>
                        {ex.secondaryMuscles?.length > 0 && (
                          <span className="text-[#6B665E]"> ({ex.secondaryMuscles.join(', ')})</span>
                        )}
                      </div>
                    </div>
                    <span className="text-[10px] font-mono-num font-semibold bg-[#121216] text-[#858076] px-2 py-0.5 rounded border border-[#272733]">
                      {ex.category}
                    </span>
                  </button>
                ))
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
