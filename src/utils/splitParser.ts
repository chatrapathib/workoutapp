import { ExerciseItem, PlannedExercise, WorkoutDay, WorkoutSplit } from '../types';
import { DEFAULT_EXERCISES } from '../data/defaultExerciseDatabase';

/**
 * Normalizes string for matching (lowercased, alphanumeric only)
 */
function normalize(str: string): string {
  return str.toLowerCase().replace(/[^a-z0-9]/g, '');
}

/**
 * Intelligent exercise matcher
 */
export function findMatchingExercise(name: string, database: ExerciseItem[] = DEFAULT_EXERCISES): {
  matchedExercise?: ExerciseItem;
  primaryMuscle: string;
  secondaryMuscles: string[];
} {
  const cleanName = name.trim();
  const norm = normalize(cleanName);

  // 1. Exact or normalized match
  for (const ex of database) {
    if (normalize(ex.name) === norm) {
      return {
        matchedExercise: ex,
        primaryMuscle: ex.primaryMuscle,
        secondaryMuscles: ex.secondaryMuscles,
      };
    }
  }

  // 2. Substring or includes match
  for (const ex of database) {
    const exNorm = normalize(ex.name);
    if (norm.includes(exNorm) || exNorm.includes(norm)) {
      return {
        matchedExercise: ex,
        primaryMuscle: ex.primaryMuscle,
        secondaryMuscles: ex.secondaryMuscles,
      };
    }
  }

  // 3. Word overlap match
  const nameWords = cleanName.toLowerCase().split(/\s+/).filter(w => w.length > 2);
  let bestMatch: ExerciseItem | null = null;
  let maxOverlap = 0;

  for (const ex of database) {
    const exWords = ex.name.toLowerCase().split(/\s+/).filter(w => w.length > 2);
    const overlap = nameWords.filter(w => exWords.includes(w)).length;
    if (overlap > maxOverlap && overlap >= 2) {
      maxOverlap = overlap;
      bestMatch = ex;
    }
  }

  if (bestMatch) {
    return {
      matchedExercise: bestMatch,
      primaryMuscle: bestMatch.primaryMuscle,
      secondaryMuscles: bestMatch.secondaryMuscles,
    };
  }

  // 4. Keyword heuristic fallback
  const lower = cleanName.toLowerCase();
  if (lower.includes('chest') || lower.includes('bench') || lower.includes('pec deck') || lower.includes('fly') || lower.includes('pushup') || lower.includes('push-up')) {
    const isUpper = lower.includes('incline');
    const isLower = lower.includes('decline') || lower.includes('dip');
    return {
      primaryMuscle: isUpper ? 'Upper Chest' : isLower ? 'Lower Chest' : 'Chest',
      secondaryMuscles: ['Triceps', 'Shoulders'],
    };
  }
  if (lower.includes('lat') || lower.includes('pulldown') || lower.includes('pull-up') || lower.includes('pullup') || lower.includes('chin-up')) {
    return { primaryMuscle: 'Lats', secondaryMuscles: ['Biceps'] };
  }
  if (lower.includes('row') || lower.includes('pullover') || lower.includes('deadlift') || lower.includes('hyperextension')) {
    return { primaryMuscle: 'Back', secondaryMuscles: ['Biceps', 'Rear Delts'] };
  }
  if (lower.includes('lateral raise') || lower.includes('side delt')) {
    return { primaryMuscle: 'Side Delts', secondaryMuscles: ['Traps'] };
  }
  if (lower.includes('rear delt') || lower.includes('face pull')) {
    return { primaryMuscle: 'Rear Delts', secondaryMuscles: ['Upper Back'] };
  }
  if (lower.includes('shoulder') || lower.includes('overhead press') || lower.includes('military') || lower.includes('arnold')) {
    return { primaryMuscle: 'Shoulders', secondaryMuscles: ['Triceps'] };
  }
  if (lower.includes('shrug')) {
    return { primaryMuscle: 'Traps', secondaryMuscles: ['Forearms'] };
  }
  if (lower.includes('curl') || lower.includes('bicep')) {
    return { primaryMuscle: 'Biceps', secondaryMuscles: ['Forearms'] };
  }
  if (lower.includes('tricep') || lower.includes('pushdown') || lower.includes('skull crusher') || lower.includes('kickback')) {
    return { primaryMuscle: 'Triceps', secondaryMuscles: [] };
  }
  if (lower.includes('squat') || lower.includes('leg press') || lower.includes('lunge') || lower.includes('quad') || lower.includes('leg extension')) {
    return { primaryMuscle: 'Quads', secondaryMuscles: ['Glutes'] };
  }
  if (lower.includes('rdl') || lower.includes('romanian') || lower.includes('leg curl') || lower.includes('hamstring')) {
    return { primaryMuscle: 'Hamstrings', secondaryMuscles: ['Glutes'] };
  }
  if (lower.includes('hip thrust') || lower.includes('glute') || lower.includes('kickback')) {
    return { primaryMuscle: 'Glutes', secondaryMuscles: ['Hamstrings'] };
  }
  if (lower.includes('calf') || lower.includes('calves')) {
    return { primaryMuscle: 'Calves', secondaryMuscles: [] };
  }
  if (lower.includes('abs') || lower.includes('plank') || lower.includes('crunch') || lower.includes('leg raise') || lower.includes('core')) {
    return { primaryMuscle: 'Core', secondaryMuscles: [] };
  }

  return { primaryMuscle: 'Full Body', secondaryMuscles: [] };
}

/**
 * Parses user workout split raw text into structured days and exercises
 */
export function parseWorkoutSplitText(
  rawText: string,
  splitName = 'My Workout Split',
  exerciseDatabase: ExerciseItem[] = DEFAULT_EXERCISES
): WorkoutSplit {
  const lines = rawText.split('\n');
  const days: WorkoutDay[] = [];

  let currentDay: WorkoutDay | null = null;
  let currentDayLines: string[] = [];

  let currentExercise: Partial<PlannedExercise> | null = null;

  const commitCurrentExercise = () => {
    if (currentExercise && currentExercise.exerciseName && currentDay) {
      const match = findMatchingExercise(currentExercise.exerciseName, exerciseDatabase);
      const sets = currentExercise.sets || 3;

      const fullExercise: PlannedExercise = {
        id: `pe-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
        exerciseName: currentExercise.exerciseName,
        sets,
        repRangeRaw: currentExercise.repRangeRaw || '8–12 reps',
        repMin: currentExercise.repMin,
        repMax: currentExercise.repMax,
        notes: currentExercise.notes,
        matchedExercise: match.matchedExercise,
        primaryMuscle: match.primaryMuscle,
        secondaryMuscles: match.secondaryMuscles,
      };

      currentDay.exercises.push(fullExercise);
      currentDay.totalSets += sets;
      currentExercise = null;
    }
  };

  const commitCurrentDay = () => {
    commitCurrentExercise();
    if (currentDay) {
      currentDay.rawText = currentDayLines.join('\n').trim();
      days.push(currentDay);
      currentDay = null;
      currentDayLines = [];
    }
  };

  const isSeparator = (line: string) => /^[=\-_]{3,}$/.test(line.trim());

  const isDayHeader = (line: string, nextLine?: string) => {
    const trimmed = line.trim();
    if (!trimmed) return false;
    if (isSeparator(trimmed)) return false;
    if (/^total:\s*\d+\s*sets/i.test(trimmed)) return false;

    // Check if next line is a separator like "====="
    if (nextLine && isSeparator(nextLine.trim())) return true;

    // Check common workout day patterns
    if (/^(push|pull|legs|upper|lower|chest|back|arms|shoulders|full body|day\s*\d+|workout\s*[a-z0-9]+)/i.test(trimmed)) {
      return true;
    }

    return false;
  };

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const trimmed = line.trim();
    const nextLine = lines[i + 1];

    if (isSeparator(trimmed)) {
      if (currentDay) {
        currentDayLines.push(line);
      }
      continue;
    }

    // Check if line is "Total: XX sets"
    if (/^total:\s*\d+\s*sets/i.test(trimmed)) {
      if (currentDay) {
        currentDayLines.push(line);
      }
      continue;
    }

    // Check for day header
    if (isDayHeader(line, nextLine)) {
      commitCurrentDay();

      let title = trimmed;
      let focus = '';
      if (trimmed.includes('—')) {
        const parts = trimmed.split('—');
        title = parts[0].trim();
        focus = parts[1].trim();
      } else if (trimmed.includes('-')) {
        const parts = trimmed.split('-');
        title = parts[0].trim();
        focus = parts.slice(1).join('-').trim();
      } else if (trimmed.includes(':')) {
        const parts = trimmed.split(':');
        title = parts[0].trim();
        focus = parts.slice(1).join(':').trim();
      }

      currentDay = {
        id: `day-${days.length + 1}-${Math.random().toString(36).substring(2, 6)}`,
        name: trimmed,
        title,
        focus,
        exercises: [],
        totalSets: 0,
      };
      currentDayLines.push(line);
      continue;
    }

    if (!currentDay) {
      if (trimmed) {
        // Create an initial day if there wasn't an explicit header
        currentDay = {
          id: `day-1-${Math.random().toString(36).substring(2, 6)}`,
          name: 'WORKOUT ROUTINE',
          title: 'Workout',
          focus: 'Full Split',
          exercises: [],
          totalSets: 0,
        };
        currentDayLines.push('WORKOUT ROUTINE');
      }
    }

    if (currentDay) {
      currentDayLines.push(line);
    }

    if (!trimmed) {
      continue;
    }

    // Check if line starts an exercise: e.g. "1. Machine Chest Press", "2. Incline Dumbbell Press", or "- Bench Press"
    const exerciseNumMatch = trimmed.match(/^(\d+[\.\)]|\-|\*)\s+(.+)$/);
    if (exerciseNumMatch) {
      commitCurrentExercise();
      currentExercise = {
        exerciseName: exerciseNumMatch[2].trim(),
        sets: 3,
      };
      continue;
    }

    // Check if line is sets & reps: e.g. "3 sets × 6–10 reps", "3 sets x 8-12 reps", "3x10", "4 sets of 12"
    const setsRepsMatch = trimmed.match(/(\d+)\s*(?:sets?|x|×)\s*(?:of\s*)?(?:[x×]\s*)?([\d–\-—\s]+(?:\s*reps?)?)/i) ||
                          trimmed.match(/(\d+)\s*sets?/i);

    if (setsRepsMatch && currentExercise) {
      const sets = parseInt(setsRepsMatch[1], 10) || 3;
      const repRangeStr = setsRepsMatch[2] ? setsRepsMatch[2].trim() : trimmed;
      currentExercise.sets = sets;
      currentExercise.repRangeRaw = repRangeStr.includes('rep') ? repRangeStr : `${repRangeStr} reps`;

      // Extract min and max reps if formatted like 6–10 or 8-12
      const numMatch = repRangeStr.match(/(\d+)\s*[\–\-\—]\s*(\d+)/);
      if (numMatch) {
        currentExercise.repMin = parseInt(numMatch[1], 10);
        currentExercise.repMax = parseInt(numMatch[2], 10);
      } else {
        const singleNum = repRangeStr.match(/(\d+)/);
        if (singleNum) {
          currentExercise.repMin = parseInt(singleNum[1], 10);
          currentExercise.repMax = parseInt(singleNum[1], 10);
        }
      }
      continue;
    }

    // If we have an active exercise, treat additional text as notes
    if (currentExercise) {
      currentExercise.notes = currentExercise.notes ? `${currentExercise.notes} | ${trimmed}` : trimmed;
    } else if (trimmed.length > 2 && !isSeparator(trimmed)) {
      // Possible exercise line without leading number e.g. "Machine Chest Press"
      currentExercise = {
        exerciseName: trimmed,
        sets: 3,
      };
    }
  }

  commitCurrentDay();

  return {
    id: `split-${Date.now()}`,
    name: splitName,
    rawText,
    days,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    isActive: true,
  };
}

/**
 * Calculates planned volume per muscle group across a split
 */
export function calculateSplitMuscleVolume(split: WorkoutSplit): Record<string, { primary: number; secondary: number; total: number; exercises: string[] }> {
  const result: Record<string, { primary: number; secondary: number; total: number; exercises: string[] }> = {};

  for (const day of split.days) {
    for (const ex of day.exercises) {
      const sets = ex.sets;

      // Primary
      const primary = ex.primaryMuscle || 'Other';
      if (!result[primary]) {
        result[primary] = { primary: 0, secondary: 0, total: 0, exercises: [] };
      }
      result[primary].primary += sets;
      result[primary].total += sets;
      if (!result[primary].exercises.includes(ex.exerciseName)) {
        result[primary].exercises.push(ex.exerciseName);
      }

      // Secondary
      if (ex.secondaryMuscles) {
        for (const sec of ex.secondaryMuscles) {
          if (!result[sec]) {
            result[sec] = { primary: 0, secondary: 0, total: 0, exercises: [] };
          }
          result[sec].secondary += sets;
          result[sec].total += sets * 0.5; // fractional volume count
          if (!result[sec].exercises.includes(ex.exerciseName)) {
            result[sec].exercises.push(ex.exerciseName);
          }
        }
      }
    }
  }

  return result;
}

/**
 * Calculates completed volume per muscle group from workout logs
 */
export function calculateWeeklyVolumeFromLogs(
  logs: { exercises: { sets: { completed: boolean }[]; primaryMuscle: string; secondaryMuscles?: string[] }[] }[]
): Record<string, { primary: number; secondary: number; total: number }> {
  const map: Record<string, { primary: number; secondary: number; total: number }> = {};

  for (const log of logs) {
    for (const ex of log.exercises || []) {
      const completedCount = (ex.sets || []).filter((s) => s.completed).length;
      if (completedCount <= 0) continue;

      const p = ex.primaryMuscle || 'Other';
      if (!map[p]) map[p] = { primary: 0, secondary: 0, total: 0 };
      map[p].primary += completedCount;
      map[p].total += completedCount;

      if (ex.secondaryMuscles) {
        for (const sec of ex.secondaryMuscles) {
          if (!map[sec]) map[sec] = { primary: 0, secondary: 0, total: 0 };
          map[sec].secondary += completedCount;
          map[sec].total += completedCount * 0.5;
        }
      }
    }
  }

  return map;
}
