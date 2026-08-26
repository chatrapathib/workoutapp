import { ExerciseItem, WorkoutLog, WorkoutSplit } from '../types';

export async function fetchExercises(params?: { category?: string; search?: string }): Promise<ExerciseItem[]> {
  const query = new URLSearchParams();
  if (params?.category && params.category !== 'All') query.set('category', params.category);
  if (params?.search) query.set('search', params.search);

  const res = await fetch(`/api/exercises?${query.toString()}`);
  if (!res.ok) throw new Error('Failed to fetch exercises');
  const data = await res.json();
  return data.exercises || [];
}

export async function addCustomExercise(payload: {
  name: string;
  category: string;
  primaryMuscle: string;
  secondaryMuscles: string[];
}): Promise<ExerciseItem> {
  const res = await fetch('/api/exercises', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.error || 'Failed to add exercise');
  }
  return res.json();
}

export async function deleteExercise(id: string): Promise<boolean> {
  const res = await fetch(`/api/exercises/${id}`, { method: 'DELETE' });
  return res.ok;
}

export async function fetchActiveSplit(): Promise<WorkoutSplit | null> {
  const res = await fetch('/api/splits/active');
  if (!res.ok) return null;
  return res.json();
}

export async function fetchAllSplits(): Promise<{ splits: WorkoutSplit[]; activeSplitId: string }> {
  const res = await fetch('/api/splits');
  if (!res.ok) throw new Error('Failed to fetch splits');
  return res.json();
}

export async function saveSplit(payload: { name: string; rawText: string; makeActive?: boolean }): Promise<WorkoutSplit> {
  const res = await fetch('/api/splits', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.error || 'Failed to save split');
  }
  return res.json();
}

export async function updateSplit(
  id: string,
  payload: { name?: string; rawText?: string; makeActive?: boolean }
): Promise<WorkoutSplit> {
  const res = await fetch(`/api/splits/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.error || 'Failed to update split');
  }
  return res.json();
}

export async function parseSplitPreview(rawText: string, name?: string): Promise<WorkoutSplit> {
  const res = await fetch('/api/splits/parse', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ rawText, name }),
  });
  if (!res.ok) throw new Error('Failed to parse split');
  return res.json();
}

export async function fetchWorkoutLogs(): Promise<WorkoutLog[]> {
  const res = await fetch('/api/logs');
  if (!res.ok) throw new Error('Failed to fetch logs');
  const data = await res.json();
  return data.logs || [];
}

export async function saveWorkoutLog(payload: Partial<WorkoutLog>): Promise<WorkoutLog> {
  const res = await fetch('/api/logs', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.error || 'Failed to save workout log');
  }
  return res.json();
}

export async function deleteWorkoutLog(id: string): Promise<boolean> {
  const res = await fetch(`/api/logs/${id}`, { method: 'DELETE' });
  return res.ok;
}

export async function fetchVolumeStats(days = '7', source = 'completed'): Promise<any> {
  const res = await fetch(`/api/stats/volume?days=${days}&source=${source}`);
  if (!res.ok) throw new Error('Failed to fetch volume stats');
  return res.json();
}

export async function resetDatabase(): Promise<any> {
  const res = await fetch('/api/reset', { method: 'POST' });
  if (!res.ok) throw new Error('Failed to reset database');
  return res.json();
}
