import React, { useState } from 'react';
import {
  Search,
  Plus,
  Trash2,
  CheckCircle2,
  Copy,
} from 'lucide-react';
import { ExerciseItem, MuscleCategory } from '../types';

interface ExerciseDatabaseViewProps {
  exercises: ExerciseItem[];
  onAddExercise: (payload: {
    name: string;
    category: MuscleCategory;
    primaryMuscle: string;
    secondaryMuscles: string[];
  }) => Promise<void>;
  onDeleteExercise: (id: string) => Promise<void>;
}

const CATEGORIES: MuscleCategory[] = [
  'Chest',
  'Back',
  'Shoulders',
  'Arms - Biceps',
  'Arms - Triceps',
  'Forearms',
  'Legs - Quads',
  'Legs - Hamstrings/Glutes',
  'Legs - Calves',
  'Core / Abs',
  'Full Body / Compound',
  'Cardio',
];

export const ExerciseDatabaseView: React.FC<ExerciseDatabaseViewProps> = ({
  exercises,
  onAddExercise,
  onDeleteExercise,
}) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [showAddForm, setShowAddForm] = useState<boolean>(false);
  const [copiedRaw, setCopiedRaw] = useState<boolean>(false);

  // New Exercise Form State
  const [name, setName] = useState<string>('');
  const [category, setCategory] = useState<MuscleCategory>('Chest');
  const [primaryMuscle, setPrimaryMuscle] = useState<string>('Chest');
  const [secondaryMusclesInput, setSecondaryMusclesInput] = useState<string>('Triceps, Shoulders');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  const filteredExercises = exercises.filter((ex) => {
    const matchesCat = selectedCategory === 'All' || ex.category === selectedCategory;
    const q = searchQuery.toLowerCase().trim();
    const matchesSearch =
      !q ||
      ex.name.toLowerCase().includes(q) ||
      ex.primaryMuscle.toLowerCase().includes(q) ||
      ex.secondaryMuscles.some((m) => m.toLowerCase().includes(q));
    return matchesCat && matchesSearch;
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !primaryMuscle.trim()) return;

    setIsSubmitting(true);
    try {
      const secondaries = secondaryMusclesInput
        .split(',')
        .map((s) => s.trim())
        .filter((s) => s.length > 0);

      await onAddExercise({
        name: name.trim(),
        category,
        primaryMuscle: primaryMuscle.trim(),
        secondaryMuscles: secondaries,
      });

      setName('');
      setShowAddForm(false);
    } catch (err) {
      alert('Error adding exercise');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCopyRawDatabase = () => {
    let text = 'EXERCISE DATABASE - MOVEMENTS & MUSCLE TARGETS\n==============================================\n\nFormat: Exercise Name — Primary Muscle (Secondary Muscles)\n\n';

    for (const cat of CATEGORIES) {
      const catExs = exercises.filter((e) => e.category === cat);
      if (catExs.length === 0) continue;
      text += `------------------------------------------------\n${cat.toUpperCase()}\n------------------------------------------------\n`;
      for (const ex of catExs) {
        const sec = ex.secondaryMuscles.length > 0 ? ` (${ex.secondaryMuscles.join(', ')})` : '';
        text += `${ex.name} — ${ex.primaryMuscle}${sec}\n`;
      }
      text += '\n';
    }

    navigator.clipboard.writeText(text);
    setCopiedRaw(true);
    setTimeout(() => setCopiedRaw(false), 2500);
  };

  return (
    <div className="space-y-4 sm:space-y-6 pb-12 sm:pb-6">
      {/* Header & Quick Actions */}
      <div className="bg-[#FAF8F5] p-4 sm:p-5 rounded-xl border border-[#E3DCD1] shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="font-serif-title text-base sm:text-xl font-bold text-[#211D1B] tracking-wide">
              Exercise Library
            </h2>
            <span className="text-[11px] font-mono-num font-semibold text-[#781D2E] bg-[#781D2E]/10 border border-[#781D2E]/20 px-2 py-0.5 rounded">
              {exercises.length} Movements
            </span>
          </div>
          <p className="text-xs text-[#6B635B] mt-1">
            Exercise Name — Primary Muscle (Secondary Muscles)
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleCopyRawDatabase}
            className="flex-1 sm:flex-none inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg text-xs font-mono-num text-[#6B635B] bg-[#ECE7DC] hover:bg-[#E3DCD1] border border-[#D4CBC0] transition min-h-[40px]"
          >
            {copiedRaw ? <CheckCircle2 className="w-3.5 h-3.5 text-[#781D2E]" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copiedRaw ? 'Copied' : 'Export Text'}</span>
          </button>

          <button
            id="add-custom-exercise-btn"
            onClick={() => setShowAddForm(!showAddForm)}
            className="flex-1 sm:flex-none inline-flex items-center justify-center gap-1.5 px-4 py-2 rounded-lg text-xs font-mono-num font-semibold bg-[#781D2E] hover:bg-[#5C1221] active:scale-98 text-[#FAF8F5] transition shadow-xs min-h-[40px]"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>{showAddForm ? 'Close' : 'Add Movement'}</span>
          </button>
        </div>
      </div>

      {/* Add Custom Exercise Form */}
      {showAddForm && (
        <form
          onSubmit={handleSubmit}
          className="bg-[#FAF8F5] border border-[#781D2E]/30 rounded-xl p-4 sm:p-5 space-y-4 shadow-xs"
        >
          <div className="flex items-center justify-between pb-2 border-b border-[#E3DCD1]">
            <h3 className="font-serif-title font-bold text-[#211D1B] text-sm">
              Add Custom Movement
            </h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
            <div>
              <label className="block text-xs font-semibold text-[#6B635B] mb-1">Exercise Name *</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Pendlay Row"
                required
                className="w-full bg-[#ECE7DC]/50 border border-[#D4CBC0] rounded-lg px-3 py-2 text-xs text-[#211D1B] placeholder-[#8C8278] focus:outline-none focus:border-[#781D2E] min-h-[40px]"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#6B635B] mb-1">Category</label>
              <select
                value={category}
                onChange={(e) => {
                  const cat = e.target.value as MuscleCategory;
                  setCategory(cat);
                  if (cat.includes('Chest')) setPrimaryMuscle('Chest');
                  else if (cat.includes('Back')) setPrimaryMuscle('Back');
                  else if (cat.includes('Shoulders')) setPrimaryMuscle('Shoulders');
                  else if (cat.includes('Biceps')) setPrimaryMuscle('Biceps');
                  else if (cat.includes('Triceps')) setPrimaryMuscle('Triceps');
                  else if (cat.includes('Quads')) setPrimaryMuscle('Quads');
                  else if (cat.includes('Hamstrings')) setPrimaryMuscle('Hamstrings');
                  else if (cat.includes('Calves')) setPrimaryMuscle('Calves');
                  else if (cat.includes('Abs') || cat.includes('Core')) setPrimaryMuscle('Core');
                }}
                className="w-full bg-[#ECE7DC]/50 border border-[#D4CBC0] rounded-lg px-3 py-2 text-xs font-mono-num text-[#211D1B] focus:outline-none focus:border-[#781D2E] min-h-[40px]"
              >
                {CATEGORIES.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#6B635B] mb-1">Primary Muscle *</label>
              <input
                type="text"
                value={primaryMuscle}
                onChange={(e) => setPrimaryMuscle(e.target.value)}
                placeholder="e.g. Upper Back, Lats"
                required
                className="w-full bg-[#ECE7DC]/50 border border-[#D4CBC0] rounded-lg px-3 py-2 text-xs text-[#211D1B] placeholder-[#8C8278] focus:outline-none focus:border-[#781D2E] min-h-[40px]"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#6B635B] mb-1">
                Secondary Muscles (comma separated)
              </label>
              <input
                type="text"
                value={secondaryMusclesInput}
                onChange={(e) => setSecondaryMusclesInput(e.target.value)}
                placeholder="e.g. Biceps, Rear Delts"
                className="w-full bg-[#ECE7DC]/50 border border-[#D4CBC0] rounded-lg px-3 py-2 text-xs text-[#211D1B] placeholder-[#8C8278] focus:outline-none focus:border-[#781D2E] min-h-[40px]"
              />
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-1">
            <button
              type="button"
              onClick={() => setShowAddForm(false)}
              className="px-3 py-2 rounded-lg text-xs font-mono-num text-[#6B635B] hover:text-[#211D1B]"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-4 py-2 rounded-lg text-xs font-mono-num font-semibold bg-[#781D2E] hover:bg-[#5C1221] text-[#FAF8F5] transition min-h-[40px]"
            >
              {isSubmitting ? 'Saving...' : 'Add to Database'}
            </button>
          </div>
        </form>
      )}

      {/* Search & Category Pills */}
      <div className="space-y-2.5">
        <div className="relative">
          <Search className="w-4 h-4 text-[#8C8278] absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            id="exercise-search-input"
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search exercises by name, muscle group..."
            className="w-full bg-[#FAF8F5] border border-[#E3DCD1] focus:border-[#781D2E] rounded-xl pl-10 pr-4 py-2.5 text-xs text-[#211D1B] placeholder-[#8C8278] focus:outline-none min-h-[44px]"
          />
        </div>

        {/* Category Pill Tabs */}
        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pb-0.5">
          <button
            onClick={() => setSelectedCategory('All')}
            className={`px-3 py-1.5 rounded-lg text-xs font-mono-num whitespace-nowrap transition min-h-[34px] ${
              selectedCategory === 'All'
                ? 'bg-[#781D2E] text-[#FAF8F5] font-bold shadow-xs'
                : 'bg-[#FAF8F5] text-[#6B635B] hover:text-[#211D1B] border border-[#E3DCD1]'
            }`}
          >
            All ({exercises.length})
          </button>
          {CATEGORIES.map((cat) => {
            const count = exercises.filter((e) => e.category === cat).length;
            return (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-3 py-1.5 rounded-lg text-xs font-mono-num whitespace-nowrap transition min-h-[34px] ${
                  selectedCategory === cat
                    ? 'bg-[#781D2E] text-[#FAF8F5] font-bold shadow-xs'
                    : 'bg-[#FAF8F5] text-[#6B635B] hover:text-[#211D1B] border border-[#E3DCD1]'
                }`}
              >
                {cat} ({count})
              </button>
            );
          })}
        </div>
      </div>

      {/* Exercise Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5 sm:gap-3.5">
        {filteredExercises.map((ex) => (
          <div
            key={ex.id}
            className="bg-[#FAF8F5] border border-[#E3DCD1] rounded-xl p-3.5 flex flex-col justify-between hover:border-[#781D2E] transition shadow-xs group"
          >
            <div>
              <div className="flex items-start justify-between gap-2 mb-1.5">
                <h4 className="font-bold text-[#211D1B] text-xs sm:text-sm group-hover:text-[#781D2E] transition">
                  {ex.name}
                </h4>
                {ex.isCustom && (
                  <button
                    onClick={() => onDeleteExercise(ex.id)}
                    title="Delete custom movement"
                    className="text-[#8C8278] hover:text-[#781D2E] p-1"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>

              <div className="space-y-1 text-xs">
                <div className="flex items-center gap-1.5">
                  <span className="text-[#8C8278] text-[10px] font-mono-num">Primary:</span>
                  <span className="font-semibold text-[#211D1B] bg-[#ECE7DC] border border-[#D4CBC0] px-1.5 py-0.2 rounded text-[10px] font-mono-num">
                    {ex.primaryMuscle}
                  </span>
                </div>

                {ex.secondaryMuscles && ex.secondaryMuscles.length > 0 && (
                  <div className="flex items-center gap-1 flex-wrap">
                    <span className="text-[#8C8278] text-[10px] font-mono-num">Secondary:</span>
                    {ex.secondaryMuscles.map((sec) => (
                      <span
                        key={sec}
                        className="text-[#6B635B] bg-[#ECE7DC]/50 border border-[#D4CBC0]/70 px-1 py-0.2 rounded text-[9px] font-mono-num"
                      >
                        {sec}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <div className="mt-2.5 pt-2 border-t border-[#E3DCD1] flex items-center justify-between text-[10px] font-mono-num text-[#8C8278]">
              <span>{ex.category}</span>
              {ex.isCustom ? (
                <span className="text-[#781D2E] font-semibold">Custom</span>
              ) : (
                <span>Standard</span>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
