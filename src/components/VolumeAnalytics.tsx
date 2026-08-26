import React, { useState } from 'react';
import {
  TrendingUp,
  Info,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  Play,
  Layers,
  BarChart2,
} from 'lucide-react';
import { WorkoutLog, WorkoutSplit } from '../types';
import { MUSCLE_LANDMARKS, getLandmarkForMuscle, MuscleVolumeLandmark } from '../data/muscleInfo';
import { calculateWeeklyVolumeFromLogs } from '../utils/splitParser';

interface VolumeAnalyticsProps {
  logs: WorkoutLog[];
  activeSplit: WorkoutSplit | null;
  onNavigateToLogger: () => void;
}

export const VolumeAnalytics: React.FC<VolumeAnalyticsProps> = ({
  logs,
  activeSplit,
  onNavigateToLogger,
}) => {
  const [selectedTimeframe, setSelectedTimeframe] = useState<'7days' | '14days' | 'all'>('7days');
  const [selectedMuscle, setSelectedMuscle] = useState<string | null>('Chest');

  // Filter logs by timeframe
  const now = new Date();
  const filteredLogs = logs.filter((log) => {
    if (selectedTimeframe === 'all') return true;
    const logDate = new Date(log.date);
    const diffDays = (now.getTime() - logDate.getTime()) / (1000 * 3600 * 24);
    if (selectedTimeframe === '7days') return diffDays <= 7;
    if (selectedTimeframe === '14days') return diffDays <= 14;
    return true;
  });

  // Calculate aggregated volume
  const volumeMap = calculateWeeklyVolumeFromLogs(filteredLogs);

  // Merge with landmark definitions
  const chartData = Object.entries(MUSCLE_LANDMARKS).map(([muscleName, landmark]) => {
    const counts = volumeMap[muscleName] || { primary: 0, secondary: 0, total: 0 };
    let status: 'under_mev' | 'mev_range' | 'mav_optimal' | 'mrv_overreaching' = 'under_mev';

    if (counts.total < landmark.mev) {
      status = 'under_mev';
    } else if (counts.total < landmark.mavMin) {
      status = 'mev_range';
    } else if (counts.total <= landmark.mavMax) {
      status = 'mav_optimal';
    } else {
      status = 'mrv_overreaching';
    }

    return {
      muscle: muscleName,
      primary: counts.primary,
      secondary: counts.secondary,
      total: counts.total,
      mev: landmark.mev,
      mavMin: landmark.mavMin,
      mavMax: landmark.mavMax,
      mrv: landmark.mrv,
      status,
      category: landmark.category,
    };
  });

  // Sort by highest volume first
  chartData.sort((a, b) => b.total - a.total);

  const totalVolumeSets = chartData.reduce((acc, curr) => acc + curr.total, 0);
  const activeMusclesCount = chartData.filter((m) => m.total > 0).length;
  const optimalMusclesCount = chartData.filter((m) => m.status === 'mav_optimal').length;

  const activeLandmarkDetail: MuscleVolumeLandmark | null = selectedMuscle ? getLandmarkForMuscle(selectedMuscle) : null;
  const activeMuscleData = chartData.find((m) => m.muscle === selectedMuscle);

  const maxChartValue = Math.max(
    25,
    ...chartData.map((d) => Math.max(d.total, d.mrv))
  );

  return (
    <div className="space-y-4 sm:space-y-6 pb-12 sm:pb-6">
      {/* Top Header Card */}
      <div className="bg-[#121216] border border-[#22222A] p-4 sm:p-5 rounded-xl shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="font-display text-base sm:text-xl font-extrabold text-[#F4EFE6] tracking-tight uppercase">
              Scientific Volume Analytics
            </h2>
            <span className="text-[10px] font-mono-num font-bold text-[#E02438] bg-[#E02438]/10 border border-[#E02438]/25 px-2 py-0.5 rounded">
              MAV ENGINE
            </span>
          </div>
          <p className="text-xs text-[#858076] mt-1 font-mono-num">
            Target weekly sets against Minimum Effective Volume (MEV) and Maximum Adaptive Volume (MAV).
          </p>
        </div>

        {/* Timeframe Filter */}
        <div className="flex items-center bg-[#1A1A22] p-1 rounded-lg border border-[#272733] text-xs font-mono-num self-start sm:self-auto">
          <button
            onClick={() => setSelectedTimeframe('7days')}
            className={`px-3 py-1.5 rounded transition ${
              selectedTimeframe === '7days' ? 'bg-[#E02438] text-[#FFFFFF] font-bold' : 'text-[#858076]'
            }`}
          >
            Past 7 Days
          </button>
          <button
            onClick={() => setSelectedTimeframe('14days')}
            className={`px-3 py-1.5 rounded transition ${
              selectedTimeframe === '14days' ? 'bg-[#E02438] text-[#FFFFFF] font-bold' : 'text-[#858076]'
            }`}
          >
            14 Days
          </button>
          <button
            onClick={() => setSelectedTimeframe('all')}
            className={`px-3 py-1.5 rounded transition ${
              selectedTimeframe === 'all' ? 'bg-[#E02438] text-[#FFFFFF] font-bold' : 'text-[#858076]'
            }`}
          >
            All Logs
          </button>
        </div>
      </div>

      {/* Summary KPI Strip */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="bg-[#121216] border border-[#22222A] p-3 sm:p-4 rounded-xl space-y-1">
          <div className="text-[10px] font-mono-num uppercase font-semibold text-[#858076]">
            Total Completed Sets
          </div>
          <div className="text-xl sm:text-2xl font-mono-num font-extrabold text-[#E02438]">
            {totalVolumeSets} <span className="text-xs text-[#858076] font-normal">sets</span>
          </div>
        </div>

        <div className="bg-[#121216] border border-[#22222A] p-3 sm:p-4 rounded-xl space-y-1">
          <div className="text-[10px] font-mono-num uppercase font-semibold text-[#858076]">
            Active Muscle Groups
          </div>
          <div className="text-xl sm:text-2xl font-mono-num font-extrabold text-[#F4EFE6]">
            {activeMusclesCount} <span className="text-xs text-[#858076] font-normal">/ {chartData.length}</span>
          </div>
        </div>

        <div className="bg-[#121216] border border-[#22222A] p-3 sm:p-4 rounded-xl space-y-1">
          <div className="text-[10px] font-mono-num uppercase font-semibold text-[#858076]">
            Optimal MAV Target
          </div>
          <div className="text-xl sm:text-2xl font-mono-num font-extrabold text-[#48BB78]">
            {optimalMusclesCount} <span className="text-xs text-[#858076] font-normal">muscles</span>
          </div>
        </div>

        <div className="bg-[#121216] border border-[#22222A] p-3 sm:p-4 rounded-xl space-y-1">
          <div className="text-[10px] font-mono-num uppercase font-semibold text-[#858076]">
            Sessions in Window
          </div>
          <div className="text-xl sm:text-2xl font-mono-num font-extrabold text-[#F4EFE6]">
            {filteredLogs.length} <span className="text-xs text-[#858076] font-normal">sessions</span>
          </div>
        </div>
      </div>

      {/* Main Volume Distribution Bars (Swiss Editorial Layout) */}
      <div className="bg-[#121216] border border-[#22222A] p-4 sm:p-5 rounded-xl space-y-4 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h3 className="font-display font-bold text-sm sm:text-base text-[#F4EFE6] uppercase tracking-tight">
              Weekly Set Volume & Hypertrophy Landmarks
            </h3>
            <p className="text-xs text-[#858076] font-mono-num">
              Bar fill indicates completed sets. Target zones: MEV (Min Effective) to MAV (Optimal).
            </p>
          </div>

          <div className="flex items-center gap-3 text-[11px] font-mono-num">
            <span className="flex items-center gap-1.5 text-[#F4EFE6]">
              <span className="w-2.5 h-2.5 rounded bg-[#E02438]" /> Primary Volume
            </span>
            <span className="flex items-center gap-1.5 text-[#858076]">
              <span className="w-2.5 h-2.5 rounded bg-[#2E384D]" /> Secondary (+0.5)
            </span>
          </div>
        </div>

        {/* Custom Swiss Volume Horizontal Visualizer */}
        <div className="space-y-2.5 pt-2">
          {chartData.map((d, idx) => {
            const isSelected = selectedMuscle === d.muscle;
            const primaryPct = Math.min(100, (d.primary / maxChartValue) * 100);
            const secondaryPct = Math.min(100 - primaryPct, (d.secondary * 0.5 / maxChartValue) * 100);
            const mevPct = (d.mev / maxChartValue) * 100;
            const mavMinPct = (d.mavMin / maxChartValue) * 100;
            const mavMaxPct = (d.mavMax / maxChartValue) * 100;

            return (
              <div
                key={d.muscle}
                onClick={() => setSelectedMuscle(d.muscle)}
                className={`p-2.5 rounded-lg border transition cursor-pointer ${
                  isSelected
                    ? 'bg-[#181822] border-[#E02438]'
                    : 'bg-[#141418] border-[#1F1F26] hover:border-[#2E2E38]'
                }`}
              >
                <div className="flex items-center justify-between text-xs font-mono-num mb-1.5">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] text-[#6B665E] font-bold">
                      {String(idx + 1).padStart(2, '0')}
                    </span>
                    <span className="font-bold text-[#F4EFE6] font-display text-sm">{d.muscle}</span>
                    <span className="text-[10px] text-[#858076] hidden sm:inline">({d.category})</span>
                  </div>

                  <div className="flex items-center gap-3">
                    <span className="text-[#858076] text-[11px]">
                      Target: <strong className="text-[#F4EFE6]">{d.mavMin}–{d.mavMax}</strong> sets
                    </span>
                    <span className="font-extrabold text-[#E02438] text-xs">
                      {d.total} <span className="text-[10px] text-[#858076] font-normal">sets</span>
                    </span>
                  </div>
                </div>

                {/* Progress Bar Container with Landmarks */}
                <div className="relative w-full bg-[#0E0E12] h-4 rounded-md overflow-hidden border border-[#22222A]">
                  {/* MAV Target Zone Background */}
                  <div
                    className="absolute top-0 bottom-0 bg-[#38A169]/10 border-x border-[#38A169]/20"
                    style={{ left: `${mavMinPct}%`, width: `${mavMaxPct - mavMinPct}%` }}
                    title={`Optimal MAV: ${d.mavMin} - ${d.mavMax} sets`}
                  />

                  {/* MEV Marker Line */}
                  <div
                    className="absolute top-0 bottom-0 w-0.5 bg-[#D69E2E]/60 z-10"
                    style={{ left: `${mevPct}%` }}
                    title={`MEV: ${d.mev} sets`}
                  />

                  {/* Active Volume Fills */}
                  <div className="flex h-full">
                    <div
                      className="bg-[#E02438] h-full transition-all duration-300"
                      style={{ width: `${primaryPct}%` }}
                    />
                    <div
                      className="bg-[#2E384D] h-full transition-all duration-300"
                      style={{ width: `${secondaryPct}%` }}
                    />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Selected Muscle Deep Dive Inspection */}
      {selectedMuscle && activeLandmarkDetail && (
        <div className="bg-[#121216] border border-[#E02438]/50 p-4 sm:p-5 rounded-xl space-y-3 shadow-md">
          <div className="flex items-start justify-between">
            <div>
              <div className="text-[10px] font-mono-num uppercase font-bold text-[#E02438]">
                Hypertrophy Specification
              </div>
              <h4 className="font-display font-bold text-lg text-[#F4EFE6]">{selectedMuscle}</h4>
            </div>
            <span className="text-xs font-mono-num text-[#858076]">
              Current: <strong className="text-[#E02438]">{activeMuscleData?.total || 0}</strong> sets
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 font-mono-num text-xs">
            <div className="bg-[#181820] p-3 rounded-lg border border-[#252530]">
              <span className="text-[10px] text-[#858076] block">Min Effective (MEV)</span>
              <strong className="text-[#F4EFE6] text-sm">{activeLandmarkDetail.mev} sets/wk</strong>
            </div>
            <div className="bg-[#181820] p-3 rounded-lg border border-[#252530]">
              <span className="text-[10px] text-[#858076] block">Optimal Range (MAV)</span>
              <strong className="text-[#E02438] text-sm">{activeLandmarkDetail.mavMin}–{activeLandmarkDetail.mavMax} sets/wk</strong>
            </div>
            <div className="bg-[#181820] p-3 rounded-lg border border-[#252530]">
              <span className="text-[10px] text-[#858076] block">Max Recoverable (MRV)</span>
              <strong className="text-[#F4EFE6] text-sm">{activeLandmarkDetail.mrv} sets/wk</strong>
            </div>
            <div className="bg-[#181820] p-3 rounded-lg border border-[#252530]">
              <span className="text-[10px] text-[#858076] block">Status In Current Window</span>
              <strong className={`text-sm ${
                activeMuscleData?.status === 'mav_optimal' ? 'text-[#48BB78]' : 'text-[#E02438]'
              }`}>
                {activeMuscleData?.status === 'mav_optimal'
                  ? 'Optimal MAV'
                  : activeMuscleData?.status === 'mrv_overreaching'
                  ? 'Near MRV'
                  : activeMuscleData?.status === 'mev_range'
                  ? 'At MEV'
                  : 'Under MEV'}
              </strong>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
