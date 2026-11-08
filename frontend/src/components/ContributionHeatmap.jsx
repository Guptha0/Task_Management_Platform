import React, { useState } from 'react';
import { useTasks } from '../context/TaskContext';
import {
  Flame,
  Award,
  Calendar,
  GitCommit,
  GitPullRequest,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';

const MONTHS = ['Nov', 'Dec', 'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct'];

const levelColors = [
  'bg-slate-100 border-slate-200/60', // Level 0 (0)
  'bg-emerald-200 border-emerald-300', // Level 1 (1-2)
  'bg-emerald-400 border-emerald-500', // Level 2 (3-4)
  'bg-emerald-600 border-emerald-700', // Level 3 (5-6)
  'bg-emerald-800 border-emerald-900', // Level 4 (7+)
];

const ContributionHeatmap = () => {
  const { stats } = useTasks();
  const [hoveredDay, setHoveredDay] = useState(null);
  const [isExpanded, setIsExpanded] = useState(true);

  // Fallback generation if stats not yet loaded
  const heatmapData = stats.contributionHeatmap || {
    totalContributions: 486,
    currentStreak: 14,
    longestStreak: 28,
    days: [],
  };

  // Generate 52 weeks (52 columns x 7 days = 364 days)
  let days = heatmapData.days;
  if (!days || days.length === 0) {
    const list = [];
    const today = new Date();
    for (let i = 363; i >= 0; i--) {
      const d = new Date();
      d.setDate(today.getDate() - i);
      const dateStr = d.toISOString().split('T')[0];
      const dayOfWeek = d.getDay();
      const week = Math.floor((363 - i) / 7);
      const count = dayOfWeek === 0 || dayOfWeek === 6 ? (week % 4 === 0 ? 1 : 0) : ((week * 2 + dayOfWeek * 5) % 5);
      let level = 0;
      if (count >= 5) level = 4;
      else if (count >= 3) level = 3;
      else if (count >= 2) level = 2;
      else if (count >= 1) level = 1;

      list.push({ date: dateStr, count, level, dayOfWeek });
    }
    days = list;
  }

  // Group days into 52 columns of 7 days
  const weeks = [];
  for (let i = 0; i < days.length; i += 7) {
    weeks.push(days.slice(i, i + 7));
  }

  return (
    <div className="bg-white rounded-3xl p-5 sm:p-6 border border-slate-200/80 shadow-sm mb-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
        <div className="flex items-center gap-3">
          <div className="h-9 w-9 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">
            <GitCommit className="h-5 w-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-extrabold text-slate-900 text-sm sm:text-base">
                Developer Contribution Activity
              </h3>
              <span className="text-[10px] font-bold uppercase tracking-wider bg-emerald-50 text-emerald-700 px-2 py-0.5 rounded-full border border-emerald-200/60">
                52-Week Grid
              </span>
            </div>
            <p className="text-xs text-slate-500 font-medium">
              {heatmapData.totalContributions} code commits, reviews & deliverables in the last year
            </p>
          </div>
        </div>

        {/* Streaks & Collapse toggle */}
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-amber-50 text-amber-800 border border-amber-200 text-xs font-bold">
            <Flame className="h-3.5 w-3.5 text-amber-500 fill-amber-500" />
            <span>{heatmapData.currentStreak} day streak</span>
          </div>

          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-indigo-50 text-indigo-800 border border-indigo-200 text-xs font-bold hidden sm:flex">
            <Award className="h-3.5 w-3.5 text-indigo-500" />
            <span>Best: {heatmapData.longestStreak} days</span>
          </div>

          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="p-1.5 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
            title={isExpanded ? 'Collapse Heatmap' : 'Expand Heatmap'}
            aria-label={isExpanded ? 'Collapse Heatmap' : 'Expand Heatmap'}
          >
            {isExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
          </button>
        </div>
      </div>

      {isExpanded && (
        <div className="pt-4 animate-fade-in">
          {/* Months header */}
          <div className="flex justify-between text-[10px] font-bold text-slate-400 pl-6 pr-2 mb-1.5">
            {MONTHS.map((m, idx) => (
              <span key={idx}>{m}</span>
            ))}
          </div>

          {/* Heatmap Grid */}
          <div className="flex gap-2">
            {/* Weekday indicators */}
            <div className="flex flex-col justify-between text-[9px] font-bold text-slate-400 py-0.5 select-none">
              <span>Mon</span>
              <span>Wed</span>
              <span>Fri</span>
            </div>

            {/* 52 Columns */}
            <div className="flex-1 overflow-x-auto pb-2">
              <div className="flex gap-1 min-w-[680px]">
                {weeks.map((week, wIdx) => (
                  <div key={wIdx} className="flex flex-col gap-1">
                    {week.map((day, dIdx) => (
                      <div
                        key={dIdx}
                        onMouseEnter={() => setHoveredDay(day)}
                        onMouseLeave={() => setHoveredDay(null)}
                        className={`h-2.5 w-2.5 rounded-xs border transition-transform hover:scale-125 cursor-pointer ${
                          levelColors[day.level] || levelColors[0]
                        }`}
                      />
                    ))}
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Footer: Tooltip info + Legend */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between pt-3 border-t border-slate-100 gap-2 text-xs">
            {/* Hover Tooltip Info */}
            <div className="text-slate-600 font-medium min-h-[18px]">
              {hoveredDay ? (
                <span className="animate-fade-in">
                  <span className="font-bold text-slate-900">{hoveredDay.count} contributions</span> on{' '}
                  {new Date(hoveredDay.date).toLocaleDateString(undefined, {
                    weekday: 'short',
                    month: 'short',
                    day: 'numeric',
                    year: 'numeric',
                  })}
                </span>
              ) : (
                <span className="text-slate-400">Hover over any square to view daily contribution details</span>
              )}
            </div>

            {/* Color Legend */}
            <div className="flex items-center gap-1.5 text-[11px] text-slate-400">
              <span>Less</span>
              {levelColors.map((cls, idx) => (
                <span key={idx} className={`h-2.5 w-2.5 rounded-xs border ${cls}`} />
              ))}
              <span>More</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ContributionHeatmap;
