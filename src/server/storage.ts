import fs from 'fs';
import path from 'path';
import { ExerciseItem, WorkoutLog, WorkoutSplit } from '../types';
import { DEFAULT_EXERCISES, DEFAULT_RAW_SPLIT_TEXT } from '../data/defaultExerciseDatabase';
import { parseWorkoutSplitText } from '../utils/splitParser';

export interface DatabaseData {
  exercises: ExerciseItem[];
  splits: WorkoutSplit[];
  activeSplitId: string;
  logs: WorkoutLog[];
  meta: {
    lastUpdated: string;
    version: number;
  };
}

const DATA_DIR = path.join(process.cwd(), 'data');
const DB_FILE = path.join(DATA_DIR, 'workout_database.json');

function getDefaultData(): DatabaseData {
  const initialSplit = parseWorkoutSplitText(DEFAULT_RAW_SPLIT_TEXT, 'Push / Pull / Legs (6-Day Split)', DEFAULT_EXERCISES);
  initialSplit.id = 'default-split-1';

  // Seed 2 realistic past completed workouts so the volume graphs and history look immediately great and live!
  const pastLog1: WorkoutLog = {
    id: 'log-past-1',
    splitId: initialSplit.id,
    dayId: initialSplit.days[0].id,
    dayName: initialSplit.days[0].name,
    date: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    startTime: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000 - 65 * 60 * 1000).toISOString(),
    endTime: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    durationMinutes: 65,
    notes: 'Great chest pump, progressive overload on Machine Press.',
    totalCompletedSets: 16,
    muscleSetCounts: {
      'Chest': { primary: 8, secondary: 0, total: 8 },
      'Upper Chest': { primary: 3, secondary: 0, total: 3 },
      'Side Delts': { primary: 3, secondary: 0, total: 3 },
      'Triceps': { primary: 5, secondary: 8, total: 9 },
      'Shoulders': { primary: 0, secondary: 8, total: 4 },
    },
    exercises: initialSplit.days[0].exercises.map((ex) => ({
      id: `logged-${ex.id}`,
      exerciseName: ex.exerciseName,
      primaryMuscle: ex.primaryMuscle,
      secondaryMuscles: ex.secondaryMuscles,
      targetSets: ex.sets,
      targetRepsRaw: ex.repRangeRaw,
      sets: Array.from({ length: ex.sets }).map((_, idx) => ({
        id: `s-${idx + 1}`,
        setNumber: idx + 1,
        reps: 8 + (idx % 3),
        weight: 135 + idx * 10,
        weightUnit: 'lbs',
        completed: true,
        rpe: 8,
      })),
    })),
  };

  return {
    exercises: [...DEFAULT_EXERCISES],
    splits: [initialSplit],
    activeSplitId: initialSplit.id,
    logs: [pastLog1],
    meta: {
      lastUpdated: new Date().toISOString(),
      version: 1,
    },
  };
}

let inMemoryDb: DatabaseData = getDefaultData();

export function initStorage(): void {
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }

    if (fs.existsSync(DB_FILE)) {
      const fileData = fs.readFileSync(DB_FILE, 'utf-8');
      inMemoryDb = JSON.parse(fileData);
    } else {
      saveStorage(inMemoryDb);
    }
  } catch (err) {
    console.warn('Could not read from disk, falling back to memory database:', err);
  }
}

export function saveStorage(data: DatabaseData): void {
  inMemoryDb = { ...data, meta: { ...data.meta, lastUpdated: new Date().toISOString() } };
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    fs.writeFileSync(DB_FILE, JSON.stringify(inMemoryDb, null, 2), 'utf-8');
  } catch (err) {
    console.warn('Could not write to disk, saved in memory:', err);
  }
}

export function getDb(): DatabaseData {
  return inMemoryDb;
}

export function resetToDefaults(): DatabaseData {
  const defaults = getDefaultData();
  saveStorage(defaults);
  return defaults;
}
