import React, { useState, useEffect } from 'react';
import {
  FileText,
  Save,
  Play,
  RotateCcw,
  CheckCircle2,
  ChevronRight,
  Info,
  Calendar,
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
      <div className="bg-[#FAF8F5] border border-[#E3DCD1] p-4 sm:p-5 rounded-xl shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="font-serif-title text-lg sm:text-xl font-bold text-[#211D1B] tracking-wide">
              Workout Routine & Split
            </h2>
            <span className="text-[11px] font-mono-num font-semibold text-[#781D2E] bg-[#781D2E]/10 border border-[#781D2E]/20 px-2 py-0.5 rounded">
              {previewSplit.days.length} Days
            </span>
          </div>
          <p className="text-xs text-[#6B635B] mt-1">
            Configure routine days, exercises, and rep brackets. All sets feed directly into volume calculations.
          </p>
        </div>

        <div className="flex items-center gap-2 self-stretch sm:self-auto">
          <button
            id="load-default-split-btn"
            onClick={handleLoadDefaultSplit}
            className="flex-1 sm:flex-none inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium text-[#6B635B] bg-[#ECE7DC] hover:bg-[#E3DCD1] border border-[#D4CBC0] transition min-h-[42px]"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset Template</span>
          </button>

          <button
            id="save-split-btn"
            onClick={handleSave}
            disabled={isSaving}
            className="flex-1 sm:flex-none inline-flex items-center justify-center gap-1.5 px-4 py-2 rounded-lg text-xs font-semibold bg-[#781D2E] hover:bg-[#5C1221] active:scale-98 text-[#FAF8F5] transition shadow-xs disabled:opacity-50 min-h-[42px]"
          >
            {saveSuccess ? <CheckCircle2 className="w-3.5 h-3.5 text-[#FAF8F5]" /> : <Save className="w-3.5 h-3.5" />}
            <span>{isSaving ? 'Saving...' : saveSuccess ? 'Saved' : 'Save Split'}</span>
          </button>
        </div>
      </div>

      {/* Routine Title Input */}
      <div className="bg-[#FAF8F5] border border-[#E3DCD1] p-3 sm:p-4 rounded-xl flex flex-col sm:flex-row sm:items-center gap-2">
        <label className="text-xs font-semibold text-[#6B635B] whitespace-nowrap">Routine Title</label>
        <input
          id="split-name-input"
          type="text"
          value={splitName}
          onChange={(e) => setSplitName(e.target.value)}
          placeholder="e.g. Push / Pull / Legs (6-Day Hypertrophy)"
          className="flex-1 bg-[#ECE7DC]/50 border border-[#D4CBC0] focus:border-[#781D2E] focus:bg-[#FAF8F5] rounded-lg px-3 py-2 text-xs sm:text-sm font-medium text-[#211D1B] focus:outline-none transition"
        />
      </div>

      {/* Mobile Segmented Control */}
      <div className="flex sm:hidden bg-[#ECE7DC] p-1 rounded-xl border border-[#D4CBC0]">
        <button
          onClick={() => setMobileView('days')}
          className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg text-xs font-semibold transition min-h-[40px] ${
            mobileView === 'days' ? 'bg-[#FAF8F5] text-[#781D2E] shadow-xs' : 'text-[#6B635B]'
          }`}
        >
          <Layers className="w-3.5 h-3.5" />
          <span>Routine Days ({previewSplit.days.length})</span>
        </button>
        <button
          onClick={() => setMobileView('editor')}
          className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg text-xs font-semibold transition min-h-[40px] ${
            mobileView === 'editor' ? 'bg-[#FAF8F5] text-[#781D2E] shadow-xs' : 'text-[#6B635B]'
          }`}
        >
          <Edit3 className="w-3.5 h-3.5" />
          <span>Edit Syntax</span>
        </button>
        <button
          onClick={() => setMobileView('volume')}
          className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg text-xs font-semibold transition min-h-[40px] ${
            mobileView === 'volume' ? 'bg-[#FAF8F5] text-[#781D2E] shadow-xs' : 'text-[#6B635B]'
          }`}
        >
          <BarChart2 className="w-3.5 h-3.5" />
          <span>Volume</span>
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
          <div className="bg-[#FAF8F5] border border-[#E3DCD1] rounded-xl p-4 sm:p-5 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <FileText className="w-4 h-4 text-[#781D2E]" />
                <h3 className="font-semibold text-xs text-[#211D1B] uppercase tracking-wider font-mono-num">
                  Split Syntax Format
                </h3>
              </div>
              <span className="text-[11px] text-[#8C8278] font-mono-num">
                {rawText.split('\n').length} lines
              </span>
            </div>

            <textarea
              id="raw-split-textarea"
              value={rawText}
              onChange={(e) => setRawText(e.target.value)}
              rows={18}
              spellCheck={false}
              className="w-full bg-[#ECE7DC]/40 border border-[#D4CBC0] focus:border-[#781D2E] focus:bg-[#FAF8F5] rounded-xl p-3 sm:p-4 text-xs font-mono-num text-[#211D1B] leading-relaxed resize-y focus:outline-none transition placeholder-[#8C8278]"
              placeholder="PUSH A — CHEST PRIORITY..."
            />

            <div className="text-[11px] text-[#6B635B] bg-[#ECE7DC]/60 p-3 rounded-lg border border-[#D4CBC0]/70 space-y-1">
              <div className="font-bold text-[#211D1B] font-mono-num">Syntax Rules:</div>
              <ul className="list-disc pl-4 space-y-0.5 font-mono-num text-[10px]">
                <li><code className="text-[#781D2E]">DAY NAME</code> starts each day block</li>
                <li><code className="text-[#781D2E]">1. Exercise Name</code> lists each exercise</li>
                <li><code className="text-[#182333]">3 sets × 8–12 reps</code> assigns set and rep targets</li>
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
              <h3 className="text-xs uppercase font-mono-num font-bold text-[#6B635B] tracking-wider">
                Workout Days ({previewSplit.days.length})
              </h3>
              <span className="text-[11px] text-[#8C8278] font-mono-num">
                Tap day to initiate tracker
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              {previewSplit.days.map((day, dIdx) => {
                const totalSets = day.exercises.reduce((sum, e) => sum + e.sets, 0);

                return (
                  <div
                    key={day.id || dIdx}
                    className="bg-[#FAF8F5] border border-[#E3DCD1] hover:border-[#781D2E] rounded-xl p-4 flex flex-col justify-between transition group shadow-xs"
                  >
                    <div>
                      {/* Day Header */}
                      <div className="flex items-start justify-between gap-2 pb-2.5 mb-2.5 border-b border-[#E3DCD1]">
                        <div>
                          <div className="text-[10px] font-mono-num font-bold uppercase tracking-wider text-[#781D2E]">
                            Day {dIdx + 1}
                          </div>
                          <h4 className="font-bold text-[#211D1B] text-sm group-hover:text-[#781D2E] transition">
                            {day.name}
                          </h4>
                        </div>
                        <div className="text-right">
                          <span className="font-mono-num font-bold text-xs text-[#211D1B]">
                            {totalSets} Sets
                          </span>
                          <div className="text-[10px] text-[#8C8278] font-mono-num">
                            {day.exercises.length} exercises
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
                              <span className="font-mono-num text-[#8C8278] mr-1">{eIdx + 1}.</span>
                              <span className="font-medium text-[#211D1B]">{ex.exerciseName}</span>
                              <span className="text-[10px] text-[#6B635B] ml-1.5 font-mono-num">
                                ({ex.primaryMuscle})
                              </span>
                            </div>
                            <span className="font-mono-num text-[11px] text-[#6B635B] whitespace-nowrap">
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
                      className="mt-3 w-full inline-flex items-center justify-center gap-2 bg-[#ECE7DC] hover:bg-[#781D2E] hover:text-[#FAF8F5] text-[#211D1B] font-mono-num font-semibold text-xs py-2.5 px-3 rounded-lg transition min-h-[44px] active:scale-98 border border-[#D4CBC0] hover:border-transparent"
                    >
                      <Play className="w-3.5 h-3.5 fill-current" />
                      <span>Start {day.name.split('—')[0].trim()}</span>
                      <ChevronRight className="w-3.5 h-3.5 ml-auto" />
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Volume Projection (Shown when volume view selected on mobile or full view on desktop) */}
        <div
          className={`lg:col-span-12 space-y-3 ${
            mobileView === 'volume' ? 'block' : 'hidden sm:hidden lg:block'
          }`}
        >
          <div className="bg-[#FAF8F5] border border-[#E3DCD1] rounded-xl p-4 sm:p-5 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
              <div>
                <h3 className="font-serif-title font-bold text-sm sm:text-base text-[#211D1B]">
                  Planned Weekly Volume Distribution
                </h3>
                <p className="text-xs text-[#6B635B]">
                  Projected sets per muscle group across the full routine cycle.
                </p>
              </div>
              <span className="text-xs font-mono-num font-semibold text-[#781D2E] bg-[#781D2E]/10 border border-[#781D2E]/20 px-2.5 py-1 rounded-lg">
                {sortedMuscles.length} Muscle Groups Targeted
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-2.5">
              {sortedMuscles.map(([muscle, counts]) => {
                const landmark = getLandmarkForMuscle(muscle);
                const isOptimal = counts.total >= landmark.mev && counts.total <= landmark.mrv;

                return (
                  <div
                    key={muscle}
                    className="bg-[#ECE7DC]/40 border border-[#D4CBC0] rounded-xl p-3 space-y-1.5"
                  >
                    <div className="text-[11px] font-bold text-[#211D1B] truncate">{muscle}</div>
                    <div className="flex items-baseline justify-between">
                      <span className="text-lg font-mono-num font-bold text-[#781D2E]">
                        {counts.total}
                      </span>
                      <span className="text-[10px] text-[#8C8278] font-mono-num">
                        target sets
                      </span>
                    </div>
                    <div className="text-[10px] text-[#6B635B] flex justify-between font-mono-num pt-1 border-t border-[#D4CBC0]/60">
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
