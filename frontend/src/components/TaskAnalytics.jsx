import React from 'react';
import { useTasks } from '../context/TaskContext';
import { TEAM_MEMBERS } from '../services/team';
import {
  Sparkles,
  Timer,
  CheckCircle2,
  TrendingUp,
  Users,
  Layers,
  Flame,
  Award,
  BarChart3,
  PieChart as PieIcon,
  Zap,
  GitPullRequest,
  Code2,
  GitCommit,
  CheckCircle,
} from 'lucide-react';

const TaskAnalytics = () => {
  const { stats, tasks } = useTasks();

  const priorities = [
    { name: 'Urgent', count: stats.priorityBreakdown?.Urgent || 0, color: '#f43f5e', bg: 'bg-rose-500' },
    { name: 'High', count: stats.priorityBreakdown?.High || 0, color: '#f59e0b', bg: 'bg-amber-500' },
    { name: 'Medium', count: stats.priorityBreakdown?.Medium || 0, color: '#3b82f6', bg: 'bg-blue-500' },
    { name: 'Low', count: stats.priorityBreakdown?.Low || 0, color: '#94a3b8', bg: 'bg-slate-400' },
  ];

  const totalPriorityTasks = priorities.reduce((sum, p) => sum + p.count, 0);

  // SVG Donut calculation
  let cumulativePercent = 0;
  const donutSegments = priorities.map((p) => {
    const percent = totalPriorityTasks > 0 ? (p.count / totalPriorityTasks) * 100 : 0;
    const strokeDasharray = `${percent} ${100 - percent}`;
    const strokeDashoffset = -cumulativePercent;
    cumulativePercent += percent;
    return { ...p, percent: Math.round(percent), strokeDasharray, strokeDashoffset };
  });

  const categories = Object.entries(stats.categoryBreakdown || {});
  const maxCategoryCount = Math.max(...categories.map(([, count]) => count), 1);

  // Velocity data (last 7 days)
  const velocityData = stats.velocityLast7Days || [];
  const maxVelocity = Math.max(...velocityData.map((v) => v.completedCount), 3);

  // Assignee workload
  const assigneeStats = Object.entries(stats.assigneeBreakdown || {}).map(([name, count]) => {
    const member = TEAM_MEMBERS.find((m) => m.name === name) || {
      name,
      avatar: name.split(' ').map((n) => n[0]).join('').substring(0, 2).toUpperCase(),
      role: 'Contributor',
    };
    const memberTasks = tasks.filter((t) => t.assignee?.name === name);
    const completedMemberTasks = memberTasks.filter((t) => t.status === 'Completed').length;
    const memberLoggedHours = memberTasks.reduce((acc, t) => acc + (t.timeLogged || 0), 0);

    return {
      member,
      totalCount: count,
      completedCount: completedMemberTasks,
      loggedHours: Math.round(memberLoggedHours * 10) / 10,
    };
  });

  // Story Points & Sprint Velocity Meter
  const totalSP = stats.totalStoryPoints || tasks.reduce((sum, t) => sum + (Number(t.storyPoints) || 3), 0);
  const completedSP = stats.completedStoryPoints || tasks.filter((t) => t.status === 'Completed').reduce((sum, t) => sum + (Number(t.storyPoints) || 3), 0);
  const inProgressSP = stats.inProgressStoryPoints || tasks.filter((t) => t.status === 'In Progress').reduce((sum, t) => sum + (Number(t.storyPoints) || 3), 0);
  const spVelocityPercent = totalSP > 0 ? Math.round((completedSP / totalSP) * 100) : 0;

  // Tech Stack Breakdown
  const techStackCounts = {};
  tasks.forEach((t) => {
    if (Array.isArray(t.techStack)) {
      t.techStack.forEach((tech) => {
        if (tech) techStackCounts[tech] = (techStackCounts[tech] || 0) + 1;
      });
    }
  });
  const techEntries = Object.entries(techStackCounts).sort((a, b) => b[1] - a[1]);
  const maxTechCount = Math.max(...techEntries.map(([, c]) => c), 1);

  // PR Pipeline Breakdown
  const prBreakdown = { Merged: 0, Open: 0, 'Failed CI/CD': 0, Draft: 0 };
  tasks.forEach((t) => {
    if (t.linkedPR?.status && prBreakdown[t.linkedPR.status] !== undefined) {
      prBreakdown[t.linkedPR.status]++;
    }
  });
  const totalLinkedPRs = Object.values(prBreakdown).reduce((a, b) => a + b, 0);

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Velocity Banner */}
      <div className="bg-gradient-to-r from-indigo-900 via-indigo-800 to-slate-900 rounded-3xl p-6 sm:p-8 text-white shadow-xl relative overflow-hidden">
        <div className="absolute right-0 top-0 bottom-0 w-1/3 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/10 text-indigo-200 text-xs font-semibold backdrop-blur-sm mb-3">
              <Flame className="h-3.5 w-3.5 text-amber-300" />
              <span>Sprint Velocity & Telemetry Dashboard</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              {stats.completionRate >= 75
                ? 'High Sprint Velocity! 🚀'
                : stats.completionRate >= 40
                ? 'Consistent Progress! ⚡'
                : 'Sprint Kickoff Underway! 🎯'}
            </h2>
            <p className="text-sm text-indigo-200 mt-1 max-w-xl">
              {stats.completed} of {stats.total} deliverables completed ({stats.completionRate}% completion rate). {stats.totalSubtasks > 0 && `${stats.completedSubtasks} of ${stats.totalSubtasks} checklist subtasks executed.`}
            </p>
          </div>

          <div className="bg-white/10 backdrop-blur-md rounded-2xl p-4 sm:p-5 border border-white/10 flex items-center gap-3 sm:gap-4 self-stretch md:self-auto justify-around flex-wrap sm:flex-nowrap">
            <div className="text-center">
              <div className="text-3xl font-black text-amber-300 flex items-center justify-center gap-1">
                <Zap className="h-5 w-5 fill-amber-400 text-amber-400" />
                <span>{completedSP}/{totalSP}</span>
              </div>
              <div className="text-[11px] text-indigo-200 uppercase tracking-wider font-semibold">Story Points</div>
            </div>
            <div className="h-10 w-[1px] bg-white/20 hidden sm:block" />
            <div className="text-center">
              <div className="text-3xl font-black text-emerald-300">{spVelocityPercent}%</div>
              <div className="text-[11px] text-indigo-200 uppercase tracking-wider font-semibold">SP Velocity</div>
            </div>
            <div className="h-10 w-[1px] bg-white/20 hidden sm:block" />
            <div className="text-center">
              <div className="text-3xl font-black text-white">{stats.totalTimeLogged}h</div>
              <div className="text-[11px] text-indigo-200 uppercase tracking-wider font-semibold">Hours Logged</div>
            </div>
          </div>
        </div>
      </div>

      {/* Grid: Charts & Distributions */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* 1. Sprint Story Point Velocity Meter */}
        <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="h-7 w-7 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center font-bold">
                <Zap className="h-4 w-4 fill-amber-500 text-amber-500" />
              </div>
              <h3 className="font-bold text-slate-800 text-sm">Sprint Story Point Velocity Meter</h3>
            </div>
            <span className="text-xs font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200">
              {completedSP} / {totalSP} SP Burnt
            </span>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-around gap-6 pt-2">
            {/* Circular Gauge */}
            <div className="relative w-36 h-36">
              <svg viewBox="0 0 36 36" className="w-full h-full -rotate-90">
                <path
                  className="text-slate-100"
                  strokeWidth="3.5"
                  stroke="currentColor"
                  fill="none"
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                />
                <path
                  className="text-amber-500 transition-all duration-700 ease-out"
                  strokeDasharray={`${spVelocityPercent}, 100`}
                  strokeWidth="3.5"
                  strokeLinecap="round"
                  stroke="currentColor"
                  fill="none"
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                <span className="text-2xl font-black text-slate-900 leading-none">{spVelocityPercent}%</span>
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mt-0.5">Throughput</span>
              </div>
            </div>

            {/* Metrics Breakdown */}
            <div className="space-y-2.5 flex-1 max-w-xs">
              <div className="flex items-center justify-between text-xs font-semibold p-2 rounded-xl bg-slate-50 border border-slate-100">
                <span className="text-slate-600 flex items-center gap-1.5">
                  <span className="h-2 w-2 rounded-full bg-emerald-500" />
                  Completed Story Points:
                </span>
                <span className="font-bold text-emerald-700">{completedSP} SP</span>
              </div>
              <div className="flex items-center justify-between text-xs font-semibold p-2 rounded-xl bg-slate-50 border border-slate-100">
                <span className="text-slate-600 flex items-center gap-1.5">
                  <span className="h-2 w-2 rounded-full bg-blue-500" />
                  In Progress Story Points:
                </span>
                <span className="font-bold text-blue-700">{inProgressSP} SP</span>
              </div>
              <div className="flex items-center justify-between text-xs font-semibold p-2 rounded-xl bg-slate-50 border border-slate-100">
                <span className="text-slate-600 flex items-center gap-1.5">
                  <span className="h-2 w-2 rounded-full bg-slate-400" />
                  Remaining in Sprint:
                </span>
                <span className="font-bold text-slate-800">{totalSP - completedSP} SP</span>
              </div>
            </div>
          </div>
        </div>

        {/* 2. Tech Stack Mastery & Pull Request Status */}
        <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="h-7 w-7 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center">
                <Code2 className="h-4 w-4" />
              </div>
              <h3 className="font-bold text-slate-800 text-sm">Tech Stack & CI/CD Pipeline Health</h3>
            </div>
            <span className="text-xs text-slate-400 font-medium">{totalLinkedPRs} PRs linked</span>
          </div>

          {/* PR Pipeline Badges */}
          <div className="grid grid-cols-4 gap-2 pt-1">
            <div className="p-2.5 rounded-xl bg-purple-50 border border-purple-200 text-center">
              <div className="text-lg font-extrabold text-purple-700">{prBreakdown.Merged}</div>
              <div className="text-[10px] uppercase font-bold text-purple-600">Merged</div>
            </div>
            <div className="p-2.5 rounded-xl bg-emerald-50 border border-emerald-200 text-center">
              <div className="text-lg font-extrabold text-emerald-700">{prBreakdown.Open}</div>
              <div className="text-[10px] uppercase font-bold text-emerald-600">Open</div>
            </div>
            <div className="p-2.5 rounded-xl bg-rose-50 border border-rose-200 text-center">
              <div className="text-lg font-extrabold text-rose-700">{prBreakdown['Failed CI/CD']}</div>
              <div className="text-[10px] uppercase font-bold text-rose-600">Failed CI</div>
            </div>
            <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200 text-center">
              <div className="text-lg font-extrabold text-slate-700">{prBreakdown.Draft}</div>
              <div className="text-[10px] uppercase font-bold text-slate-600">Draft</div>
            </div>
          </div>

          {/* Top Tech Skills */}
          <div className="space-y-2 pt-1">
            <div className="text-xs font-bold text-slate-700 flex items-center justify-between">
              <span>Technologies Utilized:</span>
              <span className="text-slate-400 text-[11px] font-normal">by task frequency</span>
            </div>
            <div className="space-y-1.5">
              {techEntries.slice(0, 4).map(([tech, count]) => {
                const pct = Math.round((count / maxTechCount) * 100);
                return (
                  <div key={tech} className="space-y-1">
                    <div className="flex items-center justify-between text-xs font-semibold">
                      <span className="text-slate-700">{tech}</span>
                      <span className="text-indigo-600 font-bold">{count} tasks</span>
                    </div>
                    <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
                      <div
                        className="bg-indigo-600 h-1.5 rounded-full transition-all duration-500"
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* 3. Burndown / 7-Day Velocity Chart */}
        <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="h-7 w-7 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center">
                <TrendingUp className="h-4 w-4" />
              </div>
              <h3 className="font-bold text-slate-800 text-sm">7-Day Completion Velocity</h3>
            </div>
            <span className="text-xs text-slate-400 font-medium">Daily throughput</span>
          </div>

          {/* SVG Bar / Curve Visualization */}
          <div className="pt-4">
            <div className="flex items-end justify-between h-44 gap-2 border-b border-slate-100 pb-2">
              {velocityData.map((v, idx) => {
                const heightPct = maxVelocity > 0 ? (v.completedCount / maxVelocity) * 100 : 0;
                return (
                  <div key={idx} className="flex-1 flex flex-col items-center gap-2 h-full justify-end group">
                    <div className="text-[10px] font-bold text-indigo-600 opacity-0 group-hover:opacity-100 transition-opacity">
                      {v.completedCount} done
                    </div>
                    <div className="w-full max-w-[36px] bg-slate-100 rounded-xl overflow-hidden flex flex-col justify-end h-32">
                      <div
                        className="w-full bg-gradient-to-t from-indigo-600 to-indigo-400 rounded-xl transition-all duration-500 group-hover:from-indigo-700 group-hover:to-indigo-500"
                        style={{ height: `${Math.max(heightPct, 6)}%` }}
                      />
                    </div>
                    <span className="text-[10px] font-semibold text-slate-500 truncate w-full text-center">
                      {v.day.split(',')[0]}
                    </span>
                  </div>
                );
              })}
            </div>
            <div className="flex items-center justify-between pt-3 text-xs text-slate-500">
              <span>Velocity trend reflects tasks moved to Completed</span>
              <span className="font-bold text-slate-800">{stats.completed} total closed</span>
            </div>
          </div>
        </div>

        {/* 2. Task Distribution by Priority (Donut Chart) */}
        <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="h-7 w-7 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center">
                <PieIcon className="h-4 w-4" />
              </div>
              <h3 className="font-bold text-slate-800 text-sm">Priority Intensity Breakdown</h3>
            </div>
            <span className="text-xs text-slate-400 font-medium">{stats.total} total</span>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-around gap-6 pt-2">
            {/* SVG Donut */}
            <div className="relative w-36 h-36">
              <svg viewBox="0 0 42 42" className="w-full h-full -rotate-90">
                <circle cx="21" cy="21" r="15.91549430918954" fill="transparent" stroke="#f1f5f9" strokeWidth="6" />
                {donutSegments.map((seg) => (
                  <circle
                    key={seg.name}
                    cx="21"
                    cy="21"
                    r="15.91549430918954"
                    fill="transparent"
                    stroke={seg.color}
                    strokeWidth="6"
                    strokeDasharray={seg.strokeDasharray}
                    strokeDashoffset={seg.strokeDashoffset}
                    className="transition-all duration-500"
                  />
                ))}
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                <span className="text-xl font-extrabold text-slate-900 leading-none">{stats.total}</span>
                <span className="text-[10px] font-bold text-slate-400 uppercase mt-0.5">Tasks</span>
              </div>
            </div>

            {/* Donut Legend */}
            <div className="space-y-2.5 flex-1 max-w-xs">
              {priorities.map((p) => {
                const pct = totalPriorityTasks > 0 ? Math.round((p.count / totalPriorityTasks) * 100) : 0;
                return (
                  <div key={p.name} className="flex items-center justify-between text-xs font-semibold">
                    <div className="flex items-center gap-2">
                      <span className={`h-2.5 w-2.5 rounded-full ${p.bg}`} />
                      <span className="text-slate-700">{p.name}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-slate-900 font-bold">{p.count}</span>
                      <span className="text-slate-400 font-normal">({pct}%)</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* 3. Workload by Category (Horizontal Bar Chart) */}
        <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="h-7 w-7 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center">
                <BarChart3 className="h-4 w-4" />
              </div>
              <h3 className="font-bold text-slate-800 text-sm">Workload by Domain</h3>
            </div>
            <span className="text-xs text-slate-400 font-medium">{categories.length} categories</span>
          </div>

          <div className="space-y-3 pt-1">
            {categories.map(([category, count]) => {
              const pct = Math.round((count / maxCategoryCount) * 100);
              return (
                <div key={category} className="space-y-1">
                  <div className="flex items-center justify-between text-xs font-semibold">
                    <span className="text-slate-700">{category}</span>
                    <span className="text-slate-500 font-bold">{count} tasks</span>
                  </div>
                  <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                    <div
                      className="bg-indigo-600 h-2 rounded-full transition-all duration-500"
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* 4. Time Tracking & Velocity Ratio */}
        <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="h-7 w-7 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center">
                <Timer className="h-4 w-4" />
              </div>
              <h3 className="font-bold text-slate-800 text-sm">Time Velocity & Accuracy</h3>
            </div>
            <span className="text-xs text-slate-400 font-medium">Sprint hours</span>
          </div>

          <div className="grid grid-cols-2 gap-4 pt-1">
            <div className="p-4 rounded-2xl bg-indigo-50/60 border border-indigo-100 text-center">
              <div className="text-2xl font-black text-indigo-700">{stats.totalEstimatedHours}h</div>
              <div className="text-xs text-indigo-900 font-bold mt-1">Estimated Hours</div>
              <p className="text-[11px] text-indigo-600/75 mt-0.5">Budgeted sprint time</p>
            </div>

            <div className="p-4 rounded-2xl bg-emerald-50/60 border border-emerald-100 text-center">
              <div className="text-2xl font-black text-emerald-700">{stats.totalTimeLogged}h</div>
              <div className="text-xs text-emerald-900 font-bold mt-1">Logged Hours</div>
              <p className="text-[11px] text-emerald-600/75 mt-0.5">Actual time spent</p>
            </div>
          </div>

          <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-between text-xs">
            <span className="text-slate-600 font-medium">Estimation Accuracy Ratio:</span>
            <span className="font-extrabold text-slate-900">
              {stats.totalEstimatedHours > 0
                ? `${Math.round((stats.totalTimeLogged / stats.totalEstimatedHours) * 100)}% of estimate`
                : 'On target'}
            </span>
          </div>
        </div>

        {/* 5. Team Capacity & Assignee Breakdown */}
        <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-sm space-y-4 lg:col-span-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="h-7 w-7 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center">
                <Users className="h-4 w-4" />
              </div>
              <h3 className="font-bold text-slate-800 text-sm">Team Collaboration & Assignee Workload</h3>
            </div>
            <span className="text-xs text-slate-400 font-medium">{assigneeStats.length} team members</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 pt-1">
            {assigneeStats.map((item) => (
              <div
                key={item.member.name}
                className="p-4 rounded-2xl bg-slate-50 border border-slate-100 hover:border-indigo-200 hover:bg-white transition-all space-y-2.5"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <span className="h-8 w-8 rounded-full bg-indigo-600 text-white font-bold text-xs flex items-center justify-center">
                      {item.member.avatar}
                    </span>
                    <div>
                      <div className="text-xs font-bold text-slate-900">{item.member.name}</div>
                      <div className="text-[10px] text-slate-400">{item.member.role}</div>
                    </div>
                  </div>
                  <span className="text-xs font-black text-slate-700 bg-white px-2 py-1 rounded-lg border border-slate-200">
                    {item.totalCount} tasks
                  </span>
                </div>

                <div className="w-full bg-slate-200 rounded-full h-1.5 overflow-hidden">
                  <div
                    className="bg-emerald-500 h-1.5 rounded-full transition-all"
                    style={{
                      width: `${item.totalCount > 0 ? (item.completedCount / item.totalCount) * 100 : 0}%`,
                    }}
                  />
                </div>

                <div className="flex items-center justify-between text-[11px] text-slate-500">
                  <span>{item.completedCount} completed</span>
                  <span className="font-semibold text-slate-700">{item.loggedHours}h logged</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default TaskAnalytics;
