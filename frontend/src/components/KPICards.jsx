import React from 'react';
import { useTasks } from '../context/TaskContext';
import {
  CheckCircle2,
  Clock,
  AlertTriangle,
  Layers,
  TrendingUp,
} from 'lucide-react';

const KPICards = () => {
  const { stats, setFilterStatus, setFilterPriority } = useTasks();

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      {/* 1. Total Tasks */}
      <div
        onClick={() => {
          setFilterStatus('All');
          setFilterPriority('All');
        }}
        className="cursor-pointer bg-white rounded-2xl p-5 border border-slate-200/80 shadow-sm hover:shadow-md hover:border-indigo-300 transition-all duration-200 group"
      >
        <div className="flex items-center justify-between mb-3">
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
            Total Tasks
          </span>
          <div className="h-9 w-9 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center group-hover:scale-110 transition-transform">
            <Layers className="h-4.5 w-4.5" />
          </div>
        </div>
        <div className="flex items-baseline justify-between">
          <span className="text-3xl font-extrabold text-slate-900 tracking-tight">
            {stats.total}
          </span>
          <span className="inline-flex items-center gap-1 text-xs font-medium text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-full">
            <TrendingUp className="h-3 w-3" />
            Active
          </span>
        </div>
        <div className="mt-3 w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
          <div
            className="bg-indigo-600 h-1.5 rounded-full transition-all duration-500"
            style={{ width: `${Math.min(stats.total > 0 ? 100 : 0, 100)}%` }}
          />
        </div>
      </div>

      {/* 2. In Progress */}
      <div
        onClick={() => {
          setFilterStatus('In Progress');
          setFilterPriority('All');
        }}
        className="cursor-pointer bg-white rounded-2xl p-5 border border-slate-200/80 shadow-sm hover:shadow-md hover:border-blue-300 transition-all duration-200 group"
      >
        <div className="flex items-center justify-between mb-3">
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
            In Progress
          </span>
          <div className="h-9 w-9 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center group-hover:scale-110 transition-transform">
            <Clock className="h-4.5 w-4.5" />
          </div>
        </div>
        <div className="flex items-baseline justify-between">
          <span className="text-3xl font-extrabold text-blue-600 tracking-tight">
            {stats.inProgress}
          </span>
          <span className="text-xs text-slate-500">
            {stats.total > 0
              ? `${Math.round((stats.inProgress / stats.total) * 100)}% of total`
              : '0%'}
          </span>
        </div>
        <div className="mt-3 w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
          <div
            className="bg-blue-500 h-1.5 rounded-full transition-all duration-500"
            style={{
              width: `${stats.total > 0 ? (stats.inProgress / stats.total) * 100 : 0}%`,
            }}
          />
        </div>
      </div>

      {/* 3. Completed */}
      <div
        onClick={() => {
          setFilterStatus('Completed');
          setFilterPriority('All');
        }}
        className="cursor-pointer bg-white rounded-2xl p-5 border border-slate-200/80 shadow-sm hover:shadow-md hover:border-emerald-300 transition-all duration-200 group"
      >
        <div className="flex items-center justify-between mb-3">
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
            Completed
          </span>
          <div className="h-9 w-9 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center group-hover:scale-110 transition-transform">
            <CheckCircle2 className="h-4.5 w-4.5" />
          </div>
        </div>
        <div className="flex items-baseline justify-between">
          <span className="text-3xl font-extrabold text-emerald-600 tracking-tight">
            {stats.completed}
          </span>
          <span className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200/50">
            {stats.completionRate}% rate
          </span>
        </div>
        <div className="mt-3 w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
          <div
            className="bg-emerald-500 h-1.5 rounded-full transition-all duration-500"
            style={{ width: `${stats.completionRate}%` }}
          />
        </div>
      </div>

      {/* 4. Urgent & Overdue */}
      <div
        onClick={() => {
          setFilterStatus('All');
          setFilterPriority('Urgent');
        }}
        className="cursor-pointer bg-white rounded-2xl p-5 border border-slate-200/80 shadow-sm hover:shadow-md hover:border-rose-300 transition-all duration-200 group"
      >
        <div className="flex items-center justify-between mb-3">
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
            Urgent & Overdue
          </span>
          <div
            className={`h-9 w-9 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform ${
              stats.urgent > 0 || stats.overdue > 0
                ? 'bg-rose-50 text-rose-600'
                : 'bg-slate-100 text-slate-500'
            }`}
          >
            <AlertTriangle className="h-4.5 w-4.5" />
          </div>
        </div>
        <div className="flex items-baseline justify-between">
          <div className="flex items-baseline gap-2">
            <span
              className={`text-3xl font-extrabold tracking-tight ${
                stats.urgent > 0 ? 'text-rose-600' : 'text-slate-800'
              }`}
            >
              {stats.urgent}
            </span>
            <span className="text-xs text-slate-500 font-medium">Urgent</span>
          </div>
          {stats.overdue > 0 && (
            <span className="inline-flex items-center gap-1 text-xs font-semibold text-rose-700 bg-rose-50 px-2 py-0.5 rounded-full border border-rose-200/60 animate-pulse">
              {stats.overdue} overdue
            </span>
          )}
        </div>
        <div className="mt-3 w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
          <div
            className="bg-rose-500 h-1.5 rounded-full transition-all duration-500"
            style={{
              width: `${stats.total > 0 ? ((stats.urgent + stats.overdue) / stats.total) * 100 : 0}%`,
            }}
          />
        </div>
      </div>
    </div>
  );
};

export default KPICards;
