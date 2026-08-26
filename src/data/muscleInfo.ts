export interface MuscleVolumeLandmark {
  muscle: string;
  category: string;
  mev: number; // Minimum Effective Volume (sets/week)
  mavMin: number; // Maximum Adaptive Volume min
  mavMax: number; // Maximum Adaptive Volume max
  mrv: number; // Maximum Recoverable Volume
  color: string;
}

export const MUSCLE_LANDMARKS: Record<string, MuscleVolumeLandmark> = {
  'Chest': { muscle: 'Chest', category: 'Chest', mev: 8, mavMin: 12, mavMax: 20, mrv: 24, color: '#ef4444' },
  'Upper Chest': { muscle: 'Upper Chest', category: 'Chest', mev: 4, mavMin: 6, mavMax: 12, mrv: 16, color: '#f87171' },
  'Lower Chest': { muscle: 'Lower Chest', category: 'Chest', mev: 3, mavMin: 4, mavMax: 8, mrv: 12, color: '#dc2626' },
  'Back': { muscle: 'Back', category: 'Back', mev: 10, mavMin: 14, mavMax: 22, mrv: 26, color: '#3b82f6' },
  'Lats': { muscle: 'Lats', category: 'Back', mev: 8, mavMin: 12, mavMax: 18, mrv: 22, color: '#60a5fa' },
  'Mid Back': { muscle: 'Mid Back', category: 'Back', mev: 6, mavMin: 10, mavMax: 16, mrv: 20, color: '#2563eb' },
  'Upper/Mid Back': { muscle: 'Upper/Mid Back', category: 'Back', mev: 6, mavMin: 10, mavMax: 16, mrv: 20, color: '#1d4ed8' },
  'Back/Lats': { muscle: 'Back/Lats', category: 'Back', mev: 8, mavMin: 12, mavMax: 18, mrv: 22, color: '#3b82f6' },
  'Lower Back': { muscle: 'Lower Back', category: 'Back', mev: 4, mavMin: 6, mavMax: 10, mrv: 14, color: '#1e40af' },
  'Back/Posterior Chain': { muscle: 'Back/Posterior Chain', category: 'Back', mev: 6, mavMin: 8, mavMax: 14, mrv: 18, color: '#1d4ed8' },
  'Shoulders': { muscle: 'Shoulders', category: 'Shoulders', mev: 6, mavMin: 10, mavMax: 16, mrv: 20, color: '#f59e0b' },
  'Side Delts': { muscle: 'Side Delts', category: 'Shoulders', mev: 8, mavMin: 14, mavMax: 22, mrv: 28, color: '#fbbf24' },
  'Rear Delts': { muscle: 'Rear Delts', category: 'Shoulders', mev: 6, mavMin: 10, mavMax: 18, mrv: 22, color: '#d97706' },
  'Rear Delts/Upper Back': { muscle: 'Rear Delts/Upper Back', category: 'Shoulders', mev: 6, mavMin: 10, mavMax: 18, mrv: 22, color: '#b45309' },
  'Front Delts': { muscle: 'Front Delts', category: 'Shoulders', mev: 0, mavMin: 4, mavMax: 8, mrv: 12, color: '#f59e0b' },
  'Shoulders/Traps': { muscle: 'Shoulders/Traps', category: 'Shoulders', mev: 4, mavMin: 8, mavMax: 14, mrv: 18, color: '#d97706' },
  'Traps': { muscle: 'Traps', category: 'Shoulders', mev: 4, mavMin: 8, mavMax: 14, mrv: 20, color: '#b45309' },
  'Biceps': { muscle: 'Biceps', category: 'Arms - Biceps', mev: 8, mavMin: 12, mavMax: 18, mrv: 24, color: '#10b981' },
  'Biceps/Forearms': { muscle: 'Biceps/Forearms', category: 'Arms - Biceps', mev: 8, mavMin: 12, mavMax: 18, mrv: 24, color: '#059669' },
  'Triceps': { muscle: 'Triceps', category: 'Arms - Triceps', mev: 6, mavMin: 10, mavMax: 16, mrv: 20, color: '#8b5cf6' },
  'Forearms': { muscle: 'Forearms', category: 'Forearms', mev: 4, mavMin: 8, mavMax: 14, mrv: 18, color: '#64748b' },
  'Quads': { muscle: 'Quads', category: 'Legs - Quads', mev: 8, mavMin: 12, mavMax: 18, mrv: 22, color: '#ec4899' },
  'Hamstrings': { muscle: 'Hamstrings', category: 'Legs - Hamstrings/Glutes', mev: 6, mavMin: 10, mavMax: 16, mrv: 20, color: '#a855f7' },
  'Glutes': { muscle: 'Glutes', category: 'Legs - Hamstrings/Glutes', mev: 6, mavMin: 10, mavMax: 16, mrv: 22, color: '#d946ef' },
  'Calves': { muscle: 'Calves', category: 'Legs - Calves', mev: 8, mavMin: 12, mavMax: 18, mrv: 24, color: '#06b6d4' },
  'Core': { muscle: 'Core', category: 'Core / Abs', mev: 4, mavMin: 8, mavMax: 16, mrv: 20, color: '#14b8a6' },
  'Upper Abs': { muscle: 'Upper Abs', category: 'Core / Abs', mev: 4, mavMin: 8, mavMax: 14, mrv: 18, color: '#0d9488' },
  'Lower Abs': { muscle: 'Lower Abs', category: 'Core / Abs', mev: 4, mavMin: 8, mavMax: 14, mrv: 18, color: '#0f766e' },
  'Abs': { muscle: 'Abs', category: 'Core / Abs', mev: 4, mavMin: 8, mavMax: 14, mrv: 18, color: '#14b8a6' },
  'Abs/Obliques': { muscle: 'Abs/Obliques', category: 'Core / Abs', mev: 4, mavMin: 8, mavMax: 14, mrv: 18, color: '#0d9488' },
  'Obliques': { muscle: 'Obliques', category: 'Core / Abs', mev: 4, mavMin: 6, mavMax: 12, mrv: 16, color: '#115e59' },
  'Full Body': { muscle: 'Full Body', category: 'Full Body / Compound', mev: 6, mavMin: 10, mavMax: 16, mrv: 20, color: '#6366f1' },
  'Cardio': { muscle: 'Cardio', category: 'Cardio', mev: 3, mavMin: 5, mavMax: 10, mrv: 15, color: '#e11d48' },
};

export function getLandmarkForMuscle(muscle: string): MuscleVolumeLandmark {
  return (
    MUSCLE_LANDMARKS[muscle] || {
      muscle,
      category: 'Other',
      mev: 6,
      mavMin: 10,
      mavMax: 16,
      mrv: 20,
      color: '#64748b',
    }
  );
}
