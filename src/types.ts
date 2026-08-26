export type MuscleCategory =
  | 'Chest'
  | 'Back'
  | 'Shoulders'
  | 'Arms - Biceps'
  | 'Arms - Triceps'
  | 'Forearms'
  | 'Legs - Quads'
  | 'Legs - Hamstrings/Glutes'
  | 'Legs - Calves'
  | 'Core / Abs'
  | 'Full Body / Compound'
  | 'Cardio';

export interface ExerciseItem {
  id: string;
  name: string;
  category: MuscleCategory;
  primaryMuscle: string;
  secondaryMuscles: string[];
  isCustom?: boolean;
}

export interface PlannedExercise {
  id: string;
  exerciseName: string;
  sets: number;
  repRangeRaw?: string;
  repMin?: number;
  repMax?: number;
  notes?: string;
  matchedExercise?: ExerciseItem;
  primaryMuscle: string;
  secondaryMuscles: string[];
}

export interface WorkoutDay {
  id: string;
  name: string; // e.g. "PUSH A — CHEST PRIORITY"
  title: string; // e.g. "Push A"
  focus: string; // e.g. "Chest Priority"
  exercises: PlannedExercise[];
  totalSets: number;
  rawText?: string;
}

export interface WorkoutSplit {
  id: string;
  name: string;
  rawText: string;
  days: WorkoutDay[];
  createdAt: string;
  updatedAt: string;
  isActive?: boolean;
}

export interface LoggedSet {
  id: string;
  setNumber: number;
  reps: number;
  weight?: number;
  weightUnit?: 'lbs' | 'kg';
  completed: boolean;
  rpe?: number;
}

export interface LoggedExercise {
  id: string;
  exerciseName: string;
  primaryMuscle: string;
  secondaryMuscles: string[];
  sets: LoggedSet[];
  targetSets: number;
  targetRepsRaw?: string;
}

export interface WorkoutLog {
  id: string;
  splitId?: string;
  dayId?: string;
  dayName: string;
  date: string; // ISO date YYYY-MM-DD
  startTime: string; // ISO timestamp
  endTime?: string;
  durationMinutes?: number;
  exercises: LoggedExercise[];
  notes?: string;
  totalCompletedSets: number;
  muscleSetCounts: Record<string, { primary: number; secondary: number; total: number }>;
}

export interface MuscleVolumeStat {
  muscle: string;
  category: MuscleCategory;
  primarySets: number;
  secondarySets: number;
  effectiveVolume: number; // e.g. primary + 0.5 * secondary or primary
  lastTrainedDate?: string;
  weeklyTarget?: number;
}

export interface MuscleGroupInfo {
  name: string;
  category: MuscleCategory;
  description: string;
  typicalWeeklyTarget: { min: number; optimal: number; max: number };
}
