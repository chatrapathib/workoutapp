import React, { useState } from 'react';
import {
  Search,
  Plus,
  Trash2,
  Filter,
  X,
  Dumbbell,
  Check,
} from 'lucide-react';
import { ExerciseItem, MuscleCategory } from '../types';
import { MUSCLE_CATEGORIES } from '../data/defaultExerciseDatabase';

interface ExerciseDatabaseViewProps {
  exercises: ExerciseItem[];
  onAddExercise: (ex: {
    name: string;
    category: MuscleCategory;
    primaryMuscle: string;
    secondaryMuscles: string[];
  }) => Promise<void>;
  onDeleteExercise: (id: string) => Promise<void>;
}

export const ExerciseDatabaseView: React.FC<ExerciseDatabaseViewProps> = ({
  exercises,
  onAddExercise,
  onDeleteExercise,
}) => {
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedCategory, setSelectedCategory] = useState<MuscleCategory | 'All'>('All');
  const [showAddModal, setShowAddModal] = useState<boolean>(false);

  // Form State for New Exercise
  const [newName, setNewName] = useState<string>('');
  const [newCategory, setNewCategory] = useState<MuscleCategory>('Chest');
  const [newPrimaryMuscle, setNewPrimaryMuscle] = useState<string>('Chest');
  const [newSecondaryMuscles, setNewSecondaryMuscles] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  const filteredExercises = exercises.filter((item) => {
    const matchesCategory = selectedCategory === 'All' || item.category === selectedCategory;
    const matchesSearch =
      item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.primaryMuscle.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.secondaryMuscles.some((s) => s.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesCategory && matchesSearch;
  });

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim()) return;

    setIsSubmitting(true);
    try {
      const secondary = newSecondaryMuscles
        .split(',')
        .map((s) => s.trim())
        .filter((s) => s.length > 0);

      await onAddExercise({
        name: newName.trim(),
        category: newCategory,
        primaryMuscle: newPrimaryMuscle.trim() || newCategory,
        secondaryMuscles: secondary,
      });

      setNewName('');
      setNewSecondaryMuscles('');
      setShowAddModal(false);
    } catch (err) {
      alert('Failed to add exercise');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-4 sm:space-y-6 pb-12 sm:pb-6">
      {/* Top Header Card */}
      <div className="bg-[#121216] border border-[#22222A] p-4 sm:p-5 rounded-xl shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="font-display text-base sm:text-xl font-extrabold text-[#F4EFE6] tracking-tight uppercase">
              Exercise Library & Index
            </h2>
            <span className="text-[10px] font-mono-num font-bold text-[#E02438] bg-[#E02438]/10 border border-[#E02438]/25 px-2 py-0.5 rounded">
              {exercises.length} MOVEMENTS
            </span>
          </div>
          <p className="text-xs text-[#858076] mt-1 font-mono-num">
            Indexed movements with primary and secondary muscle mappings.
          </p>
        </div>

        <button
          onClick={() => setShowAddModal(true)}
          className="inline-flex items-center justify-center gap-1.5 px-4 py-2 rounded-lg text-xs font-mono-num font-bold bg-[#E02438] hover:bg-[#C81D25] active:scale-98 text-[#FFFFFF] transition shadow-xs min-h-[40px]"
        >
          <Plus className="w-4 h-4" />
          <span>Add Custom Movement</span>
        </button>
      </div>

      {/* Search & Filter Bar */}
      <div className="bg-[#121216] border border-[#22222A] p-3 sm:p-4 rounded-xl space-y-3">
        <div className="flex flex-col sm:flex-row gap-2.5">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-[#6B665E] absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search movement or muscle group..."
              className="w-full bg-[#0E0E12] border border-[#272733] focus:border-[#E02438] focus:bg-[#121216] rounded-lg pl-9 pr-3 py-2 text-xs font-mono-num text-[#F4EFE6] placeholder-[#6B665E] focus:outline-none min-h-[40px]"
            />
          </div>

          {/* Category Chips Horizontal Scroll on Phone */}
          <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pb-1 sm:pb-0">
            <button
              onClick={() => setSelectedCategory('All')}
              className={`px-3 py-1.5 rounded-lg text-xs font-mono-num whitespace-nowrap transition min-h-[36px] ${
                selectedCategory === 'All'
                  ? 'bg-[#E02438] text-[#FFFFFF] font-bold'
                  : 'bg-[#1A1A22] text-[#858076] hover:text-[#F4EFE6] border border-[#272733]'
              }`}
            >
              All ({exercises.length})
            </button>
            {MUSCLE_CATEGORIES.map((cat) => {
              const count = exercises.filter((e) => e.category === cat).length;
              return (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-mono-num whitespace-nowrap transition min-h-[36px] ${
                    selectedCategory === cat
                      ? 'bg-[#E02438] text-[#FFFFFF] font-bold'
                      : 'bg-[#1A1A22] text-[#858076] hover:text-[#F4EFE6] border border-[#272733]'
                  }`}
                >
                  {cat} ({count})
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Exercise Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
        {filteredExercises.map((ex, idx) => (
          <div
            key={ex.id || idx}
            className="bg-[#121216] border border-[#22222A] hover:border-[#E02438]/50 rounded-xl p-3.5 space-y-2 flex flex-col justify-between transition group shadow-xs"
          >
            <div>
              <div className="flex items-start justify-between gap-2">
                <span className="text-[10px] font-mono-num font-bold text-[#E02438] uppercase">
                  {ex.category}
                </span>
                {ex.isCustom && (
                  <button
                    onClick={() => {
                      if (confirm(`Delete ${ex.name}?`)) {
                        onDeleteExercise(ex.id);
                      }
                    }}
                    className="text-[#6B665E] hover:text-[#E02438] p-1"
                    title="Delete custom exercise"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>

              <h4 className="font-display font-bold text-[#F4EFE6] text-sm group-hover:text-[#E02438] transition mt-0.5">
                {ex.name}
              </h4>
            </div>

            <div className="pt-2 border-t border-[#1E1E26] text-xs font-mono-num space-y-1">
              <div className="flex items-center justify-between text-[#858076]">
                <span>Primary Target:</span>
                <span className="font-bold text-[#F4EFE6]">{ex.primaryMuscle}</span>
              </div>
              {ex.secondaryMuscles && ex.secondaryMuscles.length > 0 && (
                <div className="flex items-center justify-between text-[#6B665E] text-[11px]">
                  <span>Secondary (+0.5):</span>
                  <span className="truncate max-w-[140px] text-right">{ex.secondaryMuscles.join(', ')}</span>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Add Custom Exercise Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-[#0A0A0C]/80 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-4">
          <div className="bg-[#121216] border-t sm:border border-[#22222A] rounded-t-2xl sm:rounded-2xl w-full max-w-md p-4 sm:p-5 shadow-2xl animate-in slide-in-from-bottom duration-200">
            <div className="flex items-center justify-between pb-3 border-b border-[#22222A]">
              <h3 className="font-display font-bold text-[#F4EFE6] text-base uppercase tracking-tight">
                Add Custom Movement
              </h3>
              <button
                onClick={() => setShowAddModal(false)}
                className="text-[#858076] hover:text-[#F4EFE6] p-1"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreate} className="space-y-3.5 mt-4">
              <div className="space-y-1">
                <label className="text-xs font-mono-num font-bold text-[#858076] uppercase">
                  Movement Name
                </label>
                <input
                  type="text"
                  required
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  placeholder="e.g. Incline Smith Machine Press"
                  className="w-full bg-[#0E0E12] border border-[#272733] focus:border-[#E02438] rounded-lg px-3 py-2 text-xs font-mono-num text-[#F4EFE6] focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-2.5">
                <div className="space-y-1">
                  <label className="text-xs font-mono-num font-bold text-[#858076] uppercase">
                    Category
                  </label>
                  <select
                    value={newCategory}
                    onChange={(e) => {
                      const cat = e.target.value as MuscleCategory;
                      setNewCategory(cat);
                      setNewPrimaryMuscle(cat);
                    }}
                    className="w-full bg-[#0E0E12] border border-[#272733] rounded-lg px-2.5 py-2 text-xs font-mono-num text-[#F4EFE6] focus:outline-none focus:border-[#E02438]"
                  >
                    {MUSCLE_CATEGORIES.map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-mono-num font-bold text-[#858076] uppercase">
                    Primary Muscle
                  </label>
                  <input
                    type="text"
                    required
                    value={newPrimaryMuscle}
                    onChange={(e) => setNewPrimaryMuscle(e.target.value)}
                    placeholder="Chest, Upper Chest, etc."
                    className="w-full bg-[#0E0E12] border border-[#272733] rounded-lg px-3 py-2 text-xs font-mono-num text-[#F4EFE6] focus:outline-none focus:border-[#E02438]"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-mono-num font-bold text-[#858076] uppercase">
                  Secondary Muscles (Comma separated)
                </label>
                <input
                  type="text"
                  value={newSecondaryMuscles}
                  onChange={(e) => setNewSecondaryMuscles(e.target.value)}
                  placeholder="Triceps, Shoulders, Front Delts"
                  className="w-full bg-[#0E0E12] border border-[#272733] rounded-lg px-3 py-2 text-xs font-mono-num text-[#F4EFE6] focus:outline-none focus:border-[#E02438]"
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 text-xs font-mono-num text-[#858076] hover:text-[#F4EFE6]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-5 py-2 bg-[#E02438] hover:bg-[#C81D25] text-[#FFFFFF] text-xs font-mono-num font-bold rounded-lg transition"
                >
                  {isSubmitting ? 'Saving...' : 'Save Movement'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
