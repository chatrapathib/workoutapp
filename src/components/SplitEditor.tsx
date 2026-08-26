import React, { useState, useEffect } from 'react';
import {
  FileText,
  Save,
  Play,
  RotateCcw,
  CheckCircle2,
  ChevronRight,
  Layers,
  BarChart2,
  Edit3,
} from 'lucide-react';
import { WorkoutDay, WorkoutSplit, ExerciseItem } from '../types';
import { DEFAULT_RAW_SPLIT_TEXT } from '../data/defaultExerciseDatabase';
import { parseWorkoutSplitText, calculateSplitMuscleVolume } from '../utils/splitParser';
import { getLandmarkForMuscle } from '../data/muscleInfo';

interface SplitEditorProps {
  split: WorkoutSplit | null;
  exerciseDatabase: ExerciseItem[];
  onSaveSplit: (rawText: string, name: string) => Promise<void>;
  onStartWorkoutDay: (day: WorkoutDay) => void;
}

export const SplitEditor: React.FC<SplitEditorProps> = ({
  split,
  exerciseDatabase,
  onSaveSplit,
  onStartWorkoutDay,
}) => {
  const [splitName, setSplitName] = useState<string>(split?.name || 'Push / Pull / Legs (6-Day Split)');
  const [rawText, setRawText] = useState<string>(split?.rawText || DEFAULT_RAW_SPLIT_TEXT);
  const [previewSplit, setPreviewSplit] = useState<WorkoutSplit>(() => {
    return parseWorkoutSplitText(split?.rawText || DEFAULT_RAW_SPLIT_TEXT, splitName, exerciseDatabase);
  });
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [saveSuccess, setSaveSuccess] = useState<boolean>(false);
  const [mobileView, setMobileView] = useState<'days' | 'editor' | 'volume'>('days');

  // Update preview on text change
  useEffect(() => {
    try {
      const parsed = parseWorkoutSplitText(rawText, splitName, exerciseDatabase);
      setPreviewSplit(parsed);
    } catch (e) {
      console.error('Parse error:', e);
    }
  }, [rawText, splitName, exerciseDatabase]);

  // Sync if prop split changes
  useEffect(() => {
    if (split) {
      setSplitName(split.name);
      setRawText(split.rawText);
    }
  }, [split]);

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await onSaveSplit(rawText, splitName);
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (err) {
      alert('Error saving split');
    } finally {
      setIsSaving(false);
    }
  };

  const handleLoadDefaultSplit = () => {
    setSplitName('Push / Pull / Legs (6-Day Split)');
    setRawText(DEFAULT_RAW_SPLIT_TEXT);
  };

  const plannedMuscleVolume = calculateSplitMuscleVolume(previewSplit);
  const sortedMuscles = Object.entries(plannedMuscleVolume).sort((a, b) => b[1].total - a[1].total);

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Top Header Card */}
      <div className="bg-[#121216] border border-[#22222A] p-4 sm:p-5 rounded-xl shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="font-display text-lg sm:text-xl font-extrabold text-[#F4EFE6] tracking-tight uppercase">
              Workout Routine & Split
            </h2>
            <span className="text-[10px] font-mono-num font-bold text-[#E02438] bg-[#E02438]/10 border border-[#E02438]/25 px-2 py-0.5 rounded">
              {previewSplit.days.length} DAYS
            </span>
          </div>
          <p className="text-xs text-[#858076] mt-1 font-mono-num">
            Target exercises & set volume. Synchronizes directly with hypertrophy landmarks.
          </p>
        </div>

        <div className="flex items-center gap-2 self-stretch sm:self-auto">
          <button
            id="load-default-split-btn"
            onClick={handleLoadDefaultSplit}
            className="flex-1 sm:flex-none inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg text-xs font-mono-num font-medium text-[#858076] bg-[#1A1A22] hover:bg-[#22222C] border border-[#272733] transition min-h-[42px]"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset</span>
          </button>

          <button
            id="save-split-btn"
            onClick={handleSave}
            disabled={isSaving}
            className="flex-1 sm:flex-none inline-flex items-center justify-center gap-1.5 px-4 py-2 rounded-lg text-xs font-mono-num font-bold bg-[#E02438] hover:bg-[#C81D25] active:scale-98 text-[#FFFFFF] transition shadow-xs disabled:opacity-50 min-h-[42px]"
          >
            {saveSuccess ? <CheckCircle2 className="w-3.5 h-3.5 text-[#FFFFFF]" /> : <Save className="w-3.5 h-3.5" />}
            <span>{isSaving ? 'SAVING...' : saveSuccess ? 'SAVED' : 'SAVE ROUTINE'}</span>
          </button>
        </div>
      </div>

      {/* Routine Title Input */}
      <div className="bg-[#121216] border border-[#22222A] p-3 sm:p-4 rounded-xl flex flex-col sm:flex-row sm:items-center gap-2.5">
        <label className="text-xs font-mono-num font-bold text-[#858076] uppercase whitespace-nowrap">
          Routine Name
        </label>
        <input
          id="split-name-input"
          type="text"
          value={splitName}
          onChange={(e) => setSplitName(e.target.value)}
          placeholder="e.g. Push / Pull / Legs (6-Day Hypertrophy)"
          className="flex-1 bg-[#1A1A22] border border-[#272733] focus:border-[#E02438] focus:bg-[#121216] rounded-lg px-3 py-2 text-xs sm:text-sm font-mono-num font-medium text-[#F4EFE6] focus:outline-none transition"
        />
      </div>

      {/* Mobile Segmented Control */}
      <div className="flex sm:hidden bg-[#121216] p-1 rounded-xl border border-[#22222A]">
        <button
          onClick={() => setMobileView('days')}
          className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg text-xs font-display font-bold transition min-h-[40px] ${
            mobileView === 'days' ? 'bg-[#1E1E26] text-[#E02438] shadow-xs border border-[#E02438]/30' : 'text-[#858076]'
          }`}
        >
          <Layers className="w-3.5 h-3.5" />
          <span>DAYS ({previewSplit.days.length})</span>
        </button>
        <button
          onClick={() => setMobileView('editor')}
          className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg text-xs font-display font-bold transition min-h-[40px] ${
            mobileView === 'editor' ? 'bg-[#1E1E26] text-[#E02438] shadow-xs border border-[#E02438]/30' : 'text-[#858076]'
          }`}
        >
          <Edit3 className="w-3.5 h-3.5" />
          <span>SYNTAX</span>
        </button>
        <button
          onClick={() => setMobileView('volume')}
          className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg text-xs font-display font-bold transition min-h-[40px] ${
            mobileView === 'volume' ? 'bg-[#1E1E26] text-[#E02438] shadow-xs border border-[#E02438]/30' : 'text-[#858076]'
          }`}
        >
          <BarChart2 className="w-3.5 h-3.5" />
          <span>VOLUME</span>
        </button>
      </div>

      {/* Desktop & Mobile Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Left Column: Raw Text Syntax Editor */}
        <div
          className={`lg:col-span-5 space-y-3 ${
            mobileView === 'editor' ? 'block' : 'hidden sm:hidden lg:block'
          }`}
        >
          <div className="bg-[#121216] border border-[#22222A] rounded-xl p-4 sm:p-5 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <FileText className="w-4 h-4 text-[#E02438]" />
                <h3 className="font-bold text-xs text-[#F4EFE6] uppercase tracking-wider font-mono-num">
                  Split Syntax Format
                </h3>
              </div>
              <span className="text-[11px] text-[#6B665E] font-mono-num">
                {rawText.split('\n').length} lines
              </span>
            </div>

            <textarea
              id="raw-split-textarea"
              value={rawText}
              onChange={(e) => setRawText(e.target.value)}
              rows={18}
              spellCheck={false}
              className="w-full bg-[#0E0E12] border border-[#22222A] focus:border-[#E02438] focus:bg-[#121216] rounded-xl p-3 sm:p-4 text-xs font-mono-num text-[#F4EFE6] leading-relaxed resize-y focus:outline-none transition placeholder-[#6B665E]"
              placeholder="PUSH A — CHEST PRIORITY..."
            />

            <div className="text-[11px] text-[#858076] bg-[#181820] p-3 rounded-lg border border-[#252530] space-y-1">
              <div className="font-bold text-[#F4EFE6] font-mono-num uppercase">Syntax Rules:</div>
              <ul className="list-disc pl-4 space-y-0.5 font-mono-num text-[10px]">
                <li><code className="text-[#E02438]">DAY NAME</code> starts each routine block</li>
                <li><code className="text-[#E02438]">1. Exercise Name</code> lists movement</li>
                <li><code className="text-[#858076]">3 sets × 8–12 reps</code> assigns target sets</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Right Column: Parsed Day Cards & Projected Volume */}
        <div
          className={`lg:col-span-7 space-y-4 ${
            mobileView === 'days' ? 'block' : mobileView === 'volume' ? 'hidden sm:hidden lg:block' : 'hidden sm:hidden lg:block'
          }`}
        >
          {/* Day Cards Section */}
          <div className="space-y-3">
            <div className="flex items-center justify-between px-1">
              <h3 className="text-xs uppercase font-mono-num font-bold text-[#858076] tracking-wider">
                Workout Days ({previewSplit.days.length})
              </h3>
              <span className="text-[11px] text-[#6B665E] font-mono-num">
                Tap day to start tracking
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              {previewSplit.days.map((day, dIdx) => {
                const totalSets = day.exercises.reduce((sum, e) => sum + e.sets, 0);

                return (
                  <div
                    key={day.id || dIdx}
                    className="bg-[#121216] border border-[#22222A] hover:border-[#E02438]/60 rounded-xl p-4 flex flex-col justify-between transition group shadow-xs"
                  >
                    <div>
                      {/* Day Header */}
                      <div className="flex items-start justify-between gap-2 pb-2.5 mb-2.5 border-b border-[#1E1E26]">
                        <div>
                          <div className="text-[10px] font-mono-num font-bold uppercase tracking-wider text-[#E02438]">
                            0{dIdx + 1} / DAY
                          </div>
                          <h4 className="font-display font-bold text-[#F4EFE6] text-sm group-hover:text-[#E02438] transition mt-0.5">
                            {day.name}
                          </h4>
                        </div>
                        <div className="text-right">
                          <span className="font-mono-num font-bold text-xs text-[#F4EFE6]">
                            {totalSets} Sets
                          </span>
                          <div className="text-[10px] text-[#6B665E] font-mono-num">
                            {day.exercises.length} movements
                          </div>
                        </div>
                      </div>

                      {/* Exercise Item List */}
                      <div className="space-y-1.5 my-3">
                        {day.exercises.map((ex, eIdx) => (
                          <div
                            key={eIdx}
                            className="flex items-start justify-between text-xs gap-2 py-0.5"
                          >
                            <div className="truncate flex-1">
                              <span className="font-mono-num text-[#6B665E] mr-1">{eIdx + 1}.</span>
                              <span className="font-medium text-[#F4EFE6]">{ex.exerciseName}</span>
                              <span className="text-[10px] text-[#858076] ml-1.5 font-mono-num">
                                ({ex.primaryMuscle})
                              </span>
                            </div>
                            <span className="font-mono-num text-[11px] text-[#858076] whitespace-nowrap">
                              {ex.sets} × {ex.repRangeRaw}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Start Day Button */}
                    <button
                      id={`start-day-${dIdx}-btn`}
                      onClick={() => onStartWorkoutDay(day)}
                      className="mt-3 w-full inline-flex items-center justify-center gap-2 bg-[#1A1A22] hover:bg-[#E02438] hover:text-[#FFFFFF] text-[#F4EFE6] font-mono-num font-bold text-xs py-2.5 px-3 rounded-lg transition min-h-[44px] active:scale-98 border border-[#272733] hover:border-transparent"
                    >
                      <Play className="w-3.5 h-3.5 fill-current" />
                      <span>START {day.name.split('—')[0].trim()}</span>
                      <ChevronRight className="w-3.5 h-3.5 ml-auto" />
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Volume Projection */}
        <div
          className={`lg:col-span-12 space-y-3 ${
            mobileView === 'volume' ? 'block' : 'hidden sm:hidden lg:block'
          }`}
        >
          <div className="bg-[#121216] border border-[#22222A] rounded-xl p-4 sm:p-5 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
              <div>
                <h3 className="font-display font-bold text-sm sm:text-base text-[#F4EFE6] uppercase tracking-tight">
                  Planned Volume Distribution
                </h3>
                <p className="text-xs text-[#858076] font-mono-num">
                  Projected weekly sets across full split cycle.
                </p>
              </div>
              <span className="text-xs font-mono-num font-semibold text-[#E02438] bg-[#E02438]/10 border border-[#E02438]/25 px-2.5 py-1 rounded-lg">
                {sortedMuscles.length} Muscle Groups Targeted
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-2.5">
              {sortedMuscles.map(([muscle, counts]) => {
                const landmark = getLandmarkForMuscle(muscle);

                return (
                  <div
                    key={muscle}
                    className="bg-[#181820] border border-[#252530] rounded-xl p-3 space-y-1.5"
                  >
                    <div className="text-[11px] font-bold text-[#F4EFE6] truncate">{muscle}</div>
                    <div className="flex items-baseline justify-between">
                      <span className="text-lg font-mono-num font-bold text-[#E02438]">
                        {counts.total}
                      </span>
                      <span className="text-[10px] text-[#6B665E] font-mono-num">
                        sets
                      </span>
                    </div>
                    <div className="text-[10px] text-[#858076] flex justify-between font-mono-num pt-1 border-t border-[#22222A]">
                      <span>Pri: {counts.primary}</span>
                      <span>Sec: {counts.secondary}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
