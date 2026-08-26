import React, { useState, useEffect } from 'react';
import { Header } from './components/Header';
import { SplitEditor } from './components/SplitEditor';
import { WorkoutLogger } from './components/WorkoutLogger';
import { VolumeAnalytics } from './components/VolumeAnalytics';
import { ExerciseDatabaseView } from './components/ExerciseDatabaseView';
import { WorkoutHistory } from './components/WorkoutHistory';
import {
  fetchActiveSplit,
  fetchExercises,
  fetchWorkoutLogs,
  saveSplit,
  saveWorkoutLog,
  deleteWorkoutLog,
  addCustomExercise,
  deleteExercise,
  resetDatabase,
} from './utils/api';
import { DEFAULT_EXERCISES, DEFAULT_RAW_SPLIT_TEXT } from './data/defaultExerciseDatabase';
import { parseWorkoutSplitText } from './utils/splitParser';
import { ExerciseItem, MuscleCategory, WorkoutDay, WorkoutLog, WorkoutSplit } from './types';
import { Loader2 } from 'lucide-react';

export default function App() {
  const [activeTab, setActiveTab] = useState<'split' | 'log' | 'volume' | 'database' | 'history'>('split');
  const [exercises, setExercises] = useState<ExerciseItem[]>(DEFAULT_EXERCISES);
  const [activeSplit, setActiveSplit] = useState<WorkoutSplit | null>(null);
  const [logs, setLogs] = useState<WorkoutLog[]>([]);
  const [selectedDayForLogging, setSelectedDayForLogging] = useState<WorkoutDay | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [notification, setNotification] = useState<{ message: string; type: 'success' | 'info' } | null>(null);

  // Show temporary toast notification
  const showToast = (message: string, type: 'success' | 'info' = 'success') => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 3000);
  };

  // Load Initial Data from Backend DB
  const loadData = async () => {
    try {
      setLoading(true);
      const [fetchedExercises, fetchedSplit, fetchedLogs] = await Promise.all([
        fetchExercises().catch(() => DEFAULT_EXERCISES),
        fetchActiveSplit().catch(() => null),
        fetchWorkoutLogs().catch(() => []),
      ]);

      if (fetchedExercises && fetchedExercises.length > 0) {
        setExercises(fetchedExercises);
      }

      if (fetchedSplit) {
        setActiveSplit(fetchedSplit);
      } else {
        const fallback = parseWorkoutSplitText(DEFAULT_RAW_SPLIT_TEXT, 'Push / Pull / Legs (6-Day Split)', DEFAULT_EXERCISES);
        setActiveSplit(fallback);
      }

      setLogs(fetchedLogs);
    } catch (err) {
      console.error('Failed to load initial data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // Split Save Handler
  const handleSaveSplit = async (rawText: string, name: string) => {
    try {
      const saved = await saveSplit({ rawText, name, makeActive: true });
      setActiveSplit(saved);
      showToast(`Saved "${saved.name}" to database`);
    } catch (err: any) {
      const parsed = parseWorkoutSplitText(rawText, name, exercises);
      setActiveSplit(parsed);
      showToast(`Saved split locally (${parsed.days.length} days)`);
    }
  };

  // Start Logging a Specific Day
  const handleStartWorkoutDay = (day: WorkoutDay) => {
    setSelectedDayForLogging(day);
    setActiveTab('log');
  };

  // Save Completed Workout Session
  const handleSaveWorkoutLog = async (logData: Partial<WorkoutLog>) => {
    try {
      const newLog = await saveWorkoutLog(logData);
      setLogs((prev) => [newLog, ...prev]);
      showToast(`Session recorded: ${newLog.totalCompletedSets} sets`);
      setActiveTab('volume');
    } catch (err) {
      const localLog: WorkoutLog = {
        id: `local-log-${Date.now()}`,
        splitId: activeSplit?.id,
        dayId: selectedDayForLogging?.id,
        dayName: logData.dayName || 'Workout Session',
        date: logData.date || new Date().toISOString().split('T')[0],
        startTime: logData.startTime || new Date().toISOString(),
        durationMinutes: logData.durationMinutes || 45,
        notes: logData.notes || '',
        exercises: logData.exercises || [],
        totalCompletedSets: (logData.exercises || []).reduce(
          (acc, ex) => acc + ex.sets.filter((s) => s.completed).length,
          0
        ),
        muscleSetCounts: {},
      };
      setLogs((prev) => [localLog, ...prev]);
      showToast(`Session recorded locally`);
      setActiveTab('volume');
    }
  };

  // Delete Workout Log
  const handleDeleteLog = async (id: string) => {
    try {
      await deleteWorkoutLog(id);
      setLogs((prev) => prev.filter((l) => l.id !== id));
      showToast('Workout log removed', 'info');
    } catch (err) {
      setLogs((prev) => prev.filter((l) => l.id !== id));
    }
  };

  // Add Custom Exercise
  const handleAddExercise = async (payload: {
    name: string;
    category: MuscleCategory;
    primaryMuscle: string;
    secondaryMuscles: string[];
  }) => {
    try {
      const newEx = await addCustomExercise(payload);
      setExercises((prev) => [...prev, newEx]);
      showToast(`Added "${newEx.name}"`);
    } catch (err: any) {
      const fallbackEx: ExerciseItem = {
        id: `custom-local-${Date.now()}`,
        name: payload.name,
        category: payload.category,
        primaryMuscle: payload.primaryMuscle,
        secondaryMuscles: payload.secondaryMuscles,
        isCustom: true,
      };
      setExercises((prev) => [...prev, fallbackEx]);
      showToast(`Added exercise locally`);
    }
  };

  // Delete Exercise
  const handleDeleteExercise = async (id: string) => {
    try {
      await deleteExercise(id);
      setExercises((prev) => prev.filter((e) => e.id !== id));
      showToast('Exercise removed', 'info');
    } catch (err) {
      setExercises((prev) => prev.filter((e) => e.id !== id));
    }
  };

  // Reset to Defaults
  const handleResetDatabase = async () => {
    if (!confirm('Reset database to default split and exercise library?')) {
      return;
    }
    try {
      setLoading(true);
      await resetDatabase();
      await loadData();
      showToast('Database reset to defaults');
    } catch (err) {
      setExercises(DEFAULT_EXERCISES);
      const fallback = parseWorkoutSplitText(DEFAULT_RAW_SPLIT_TEXT, 'Push / Pull / Legs (6-Day Split)', DEFAULT_EXERCISES);
      setActiveSplit(fallback);
      setLogs([]);
      showToast('Reset completed locally');
    } finally {
      setLoading(false);
    }
  };

  // Calculate stats for header
  const weekCutoff = new Date();
  weekCutoff.setDate(weekCutoff.getDate() - 7);
  const weekCutoffStr = weekCutoff.toISOString().split('T')[0];
  const weekLogs = logs.filter((l) => l.date >= weekCutoffStr);
  const weekSetsCount = weekLogs.reduce((acc, l) => acc + l.totalCompletedSets, 0);

  return (
    <div className="min-h-screen text-[#211D1B] flex flex-col font-sans selection:bg-[#781D2E]/20 selection:text-[#781D2E] pb-20 md:pb-0">
      {/* Toast Notification */}
      {notification && (
        <div className="fixed bottom-20 md:bottom-5 right-5 z-50 bg-[#FAF8F5] border border-[#781D2E]/40 text-[#211D1B] px-4 py-2.5 rounded-xl shadow-lg flex items-center gap-2 text-xs font-mono-num animate-in slide-in-from-bottom-2 duration-200">
          <span className="w-2 h-2 rounded-full bg-[#781D2E]" />
          <span>{notification.message}</span>
        </div>
      )}

      {/* Main Header */}
      <Header
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        activeSplitName={activeSplit?.name || 'Push / Pull / Legs'}
        totalWorkoutsCount={logs.length}
        weekSetsCount={weekSetsCount}
        onResetDatabase={handleResetDatabase}
        onStartQuickWorkout={() => {
          setSelectedDayForLogging(activeSplit?.days[0] || null);
          setActiveTab('log');
        }}
      />

      {/* Main App Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-3.5 sm:px-6 lg:px-8 py-4 sm:py-6">
        {loading ? (
          <div className="min-h-[360px] flex flex-col items-center justify-center gap-2.5 text-[#6B635B]">
            <Loader2 className="w-7 h-7 text-[#781D2E] animate-spin" />
            <p className="text-xs font-mono-num uppercase tracking-wider">Loading Routine...</p>
          </div>
        ) : (
          <>
            {activeTab === 'split' && (
              <SplitEditor
                split={activeSplit}
                exerciseDatabase={exercises}
                onSaveSplit={handleSaveSplit}
                onStartWorkoutDay={handleStartWorkoutDay}
              />
            )}

            {activeTab === 'log' && (
              <WorkoutLogger
                activeSplit={activeSplit}
                selectedDay={selectedDayForLogging}
                exerciseDatabase={exercises}
                onSaveLog={handleSaveWorkoutLog}
                onCancel={() => setActiveTab('split')}
                onSelectDay={(day) => setSelectedDayForLogging(day)}
              />
            )}

            {activeTab === 'volume' && (
              <VolumeAnalytics
                logs={logs}
                activeSplit={activeSplit}
                onNavigateToLogger={() => {
                  setSelectedDayForLogging(activeSplit?.days[0] || null);
                  setActiveTab('log');
                }}
              />
            )}

            {activeTab === 'database' && (
              <ExerciseDatabaseView
                exercises={exercises}
                onAddExercise={handleAddExercise}
                onDeleteExercise={handleDeleteExercise}
              />
            )}

            {activeTab === 'history' && (
              <WorkoutHistory
                logs={logs}
                onDeleteLog={handleDeleteLog}
                onStartNewWorkout={() => {
                  setSelectedDayForLogging(activeSplit?.days[0] || null);
                  setActiveTab('log');
                }}
              />
            )}
          </>
        )}
      </main>

      {/* Minimalist Footer */}
      <footer className="border-t border-[#E3DCD1] py-4 text-center text-[#8C8278] text-[11px] font-mono-num hidden md:block">
        <div className="max-w-7xl mx-auto px-4 flex items-center justify-between">
          <span>Hypertrophy Split & Volume System</span>
          <span>Minimalist Edition • Zero Distractions</span>
        </div>
      </footer>
    </div>
  );
}
