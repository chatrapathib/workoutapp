import express from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import { getDb, initStorage, resetToDefaults, saveStorage } from './src/server/storage';
import { findMatchingExercise, parseWorkoutSplitText } from './src/utils/splitParser';
import { ExerciseItem, WorkoutLog } from './src/types';

async function startServer() {
  initStorage();

  const app = express();
  const PORT = 3000;

  app.use(express.json({ limit: '10mb' }));

  // API Routes
  app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
  });

  // Exercises
  app.get('/api/exercises', (req, res) => {
    const db = getDb();
    const { category, search } = req.query;

    let exercises = db.exercises;
    if (category && typeof category === 'string' && category !== 'All') {
      exercises = exercises.filter((e) => e.category.toLowerCase() === category.toLowerCase());
    }
    if (search && typeof search === 'string') {
      const q = search.toLowerCase();
      exercises = exercises.filter(
        (e) =>
          e.name.toLowerCase().includes(q) ||
          e.primaryMuscle.toLowerCase().includes(q) ||
          e.secondaryMuscles.some((m) => m.toLowerCase().includes(q))
      );
    }

    res.json({ exercises, total: exercises.length });
  });

  app.post('/api/exercises', (req, res) => {
    const db = getDb();
    const { name, category, primaryMuscle, secondaryMuscles } = req.body;

    if (!name || !primaryMuscle) {
      return res.status(400).json({ error: 'Exercise name and primary muscle are required' });
    }

    const newEx: ExerciseItem = {
      id: `custom-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      name: name.trim(),
      category: category || 'Chest',
      primaryMuscle: primaryMuscle.trim(),
      secondaryMuscles: Array.isArray(secondaryMuscles) ? secondaryMuscles : [],
      isCustom: true,
    };

    db.exercises.push(newEx);
    saveStorage(db);

    res.status(201).json(newEx);
  });

  app.delete('/api/exercises/:id', (req, res) => {
    const db = getDb();
    const { id } = req.params;
    const initialLen = db.exercises.length;
    db.exercises = db.exercises.filter((e) => e.id !== id);

    if (db.exercises.length === initialLen) {
      return res.status(404).json({ error: 'Exercise not found' });
    }

    saveStorage(db);
    res.json({ success: true, id });
  });

  // Splits
  app.get('/api/splits', (req, res) => {
    const db = getDb();
    res.json({ splits: db.splits, activeSplitId: db.activeSplitId });
  });

  app.get('/api/splits/active', (req, res) => {
    const db = getDb();
    const active = db.splits.find((s) => s.id === db.activeSplitId) || db.splits[0];
    res.json(active || null);
  });

  app.post('/api/splits', (req, res) => {
    const db = getDb();
    const { name, rawText, makeActive } = req.body;

    if (!rawText) {
      return res.status(400).json({ error: 'Workout split text is required' });
    }

    const parsed = parseWorkoutSplitText(rawText, name || 'Custom Split', db.exercises);
    db.splits.unshift(parsed);

    if (makeActive !== false) {
      db.activeSplitId = parsed.id;
    }

    saveStorage(db);
    res.status(201).json(parsed);
  });

  app.put('/api/splits/:id', (req, res) => {
    const db = getDb();
    const { id } = req.params;
    const { name, rawText, makeActive } = req.body;

    const existingIndex = db.splits.findIndex((s) => s.id === id);
    if (existingIndex === -1) {
      return res.status(404).json({ error: 'Split not found' });
    }

    if (rawText) {
      const parsed = parseWorkoutSplitText(rawText, name || db.splits[existingIndex].name, db.exercises);
      parsed.id = id;
      parsed.createdAt = db.splits[existingIndex].createdAt;
      parsed.updatedAt = new Date().toISOString();
      db.splits[existingIndex] = parsed;
    }

    if (makeActive) {
      db.activeSplitId = id;
    }

    saveStorage(db);
    res.json(db.splits[existingIndex]);
  });

  app.post('/api/splits/parse', (req, res) => {
    const db = getDb();
    const { rawText, name } = req.body;
    if (!rawText) {
      return res.status(400).json({ error: 'rawText is required' });
    }

    const parsed = parseWorkoutSplitText(rawText, name || 'Preview Split', db.exercises);
    res.json(parsed);
  });

  // Workout Logs
  app.get('/api/logs', (req, res) => {
    const db = getDb();
    // sort by date descending
    const logs = [...db.logs].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    res.json({ logs });
  });

  app.post('/api/logs', (req, res) => {
    const db = getDb();
    const logData: Partial<WorkoutLog> = req.body;

    if (!logData.dayName || !logData.exercises) {
      return res.status(400).json({ error: 'dayName and exercises are required' });
    }

    // Calculate completed sets and muscle set counts
    const muscleSetCounts: Record<string, { primary: number; secondary: number; total: number }> = {};
    let totalCompletedSets = 0;

    for (const ex of logData.exercises) {
      const completedSets = ex.sets.filter((s) => s.completed).length;
      totalCompletedSets += completedSets;

      const pMuscle = ex.primaryMuscle || 'Other';
      if (!muscleSetCounts[pMuscle]) {
        muscleSetCounts[pMuscle] = { primary: 0, secondary: 0, total: 0 };
      }
      muscleSetCounts[pMuscle].primary += completedSets;
      muscleSetCounts[pMuscle].total += completedSets;

      if (ex.secondaryMuscles) {
        for (const sMuscle of ex.secondaryMuscles) {
          if (!muscleSetCounts[sMuscle]) {
            muscleSetCounts[sMuscle] = { primary: 0, secondary: 0, total: 0 };
          }
          muscleSetCounts[sMuscle].secondary += completedSets;
          muscleSetCounts[sMuscle].total += completedSets * 0.5;
        }
      }
    }

    const newLog: WorkoutLog = {
      id: `log-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      splitId: logData.splitId,
      dayId: logData.dayId,
      dayName: logData.dayName,
      date: logData.date || new Date().toISOString().split('T')[0],
      startTime: logData.startTime || new Date().toISOString(),
      endTime: logData.endTime || new Date().toISOString(),
      durationMinutes: logData.durationMinutes || 45,
      notes: logData.notes || '',
      exercises: logData.exercises,
      totalCompletedSets,
      muscleSetCounts,
    };

    db.logs.unshift(newLog);
    saveStorage(db);

    res.status(201).json(newLog);
  });

  app.delete('/api/logs/:id', (req, res) => {
    const db = getDb();
    const { id } = req.params;
    const initialLen = db.logs.length;
    db.logs = db.logs.filter((l) => l.id !== id);

    if (db.logs.length === initialLen) {
      return res.status(404).json({ error: 'Log not found' });
    }

    saveStorage(db);
    res.json({ success: true, id });
  });

  // Volume Analytics
  app.get('/api/stats/volume', (req, res) => {
    const db = getDb();
    const { days = '7', source = 'completed' } = req.query; // 'completed' or 'planned'

    if (source === 'planned') {
      const activeSplit = db.splits.find((s) => s.id === db.activeSplitId) || db.splits[0];
      const volume: Record<string, { primary: number; secondary: number; totalEffective: number }> = {};

      if (activeSplit) {
        for (const day of activeSplit.days) {
          for (const ex of day.exercises) {
            const p = ex.primaryMuscle || 'Other';
            if (!volume[p]) volume[p] = { primary: 0, secondary: 0, totalEffective: 0 };
            volume[p].primary += ex.sets;
            volume[p].totalEffective += ex.sets;

            for (const s of ex.secondaryMuscles || []) {
              if (!volume[s]) volume[s] = { primary: 0, secondary: 0, totalEffective: 0 };
              volume[s].secondary += ex.sets;
              volume[s].totalEffective += ex.sets * 0.5;
            }
          }
        }
      }

      return res.json({ volume, type: 'planned', splitName: activeSplit?.name });
    }

    // Completed logs volume
    const dayLimit = parseInt(days as string, 10) || 7;
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - dayLimit);
    const cutoffIso = cutoffDate.toISOString().split('T')[0];

    const filteredLogs = db.logs.filter((l) => l.date >= cutoffIso);
    const volume: Record<string, { primary: number; secondary: number; totalEffective: number; lastTrained?: string }> = {};

    for (const log of filteredLogs) {
      for (const [muscle, counts] of Object.entries(log.muscleSetCounts)) {
        if (!volume[muscle]) {
          volume[muscle] = { primary: 0, secondary: 0, totalEffective: 0, lastTrained: log.date };
        }
        volume[muscle].primary += counts.primary;
        volume[muscle].secondary += counts.secondary;
        volume[muscle].totalEffective += counts.primary + counts.secondary * 0.5;
        if (!volume[muscle].lastTrained || log.date > volume[muscle].lastTrained) {
          volume[muscle].lastTrained = log.date;
        }
      }
    }

    res.json({
      volume,
      days: dayLimit,
      totalWorkouts: filteredLogs.length,
      totalSets: filteredLogs.reduce((acc, l) => acc + l.totalCompletedSets, 0),
    });
  });

  // Reset API
  app.post('/api/reset', (req, res) => {
    const freshData = resetToDefaults();
    res.json({ success: true, message: 'Database reset to default workouts and exercises', data: freshData });
  });

  // Vite middleware for development / static serving for production
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Workout Volume Tracker server running on port ${PORT}`);
  });
}

startServer();
