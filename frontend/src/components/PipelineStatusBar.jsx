import React, { useState } from 'react';
import {
  GitBranch,
  GitPullRequest,
  CheckCircle2,
  RefreshCw,
  Zap,
  ShieldCheck,
  Cpu,
  Layers,
} from 'lucide-react';
import { useTasks } from '../context/TaskContext';

const PipelineStatusBar = () => {
  const { stats } = useTasks();
  const [isRunningCI, setIsRunningCI] = useState(false);
  const [ciStatus, setCiStatus] = useState('Passing');

  const handleTriggerCI = () => {
    setIsRunningCI(true);
    setTimeout(() => {
      setIsRunningCI(false);
      setCiStatus('Passing');
    }, 1500);
  };

  const totalPoints = stats.totalStoryPoints || 32;
  const completedPoints = stats.completedStoryPoints || 20;

  return (
    <div className="bg-slate-900 text-white rounded-2xl px-4 py-2.5 mb-6 border border-slate-800 shadow-sm flex flex-wrap items-center justify-between gap-3 text-xs">
      {/* Left: Branch & Pipeline status */}
      <div className="flex flex-wrap items-center gap-3 sm:gap-4">
        {/* Repo & Branch */}
        <div className="flex items-center gap-1.5 font-semibold text-slate-300">
          <GitBranch className="h-3.5 w-3.5 text-indigo-400" />
          <span className="text-white">taskflow-pro</span>
          <span className="text-slate-500">/</span>
          <span className="text-indigo-300 font-mono text-[11px]">main#7f3a9b1</span>
        </div>

        <div className="h-3.5 w-[1px] bg-slate-700 hidden sm:block" />

        {/* CI/CD Build Status */}
        <div className="flex items-center gap-1.5">
          <span className="relative flex h-2 w-2">
            <span
              className={`absolute inline-flex h-full w-full rounded-full opacity-75 ${
                isRunningCI ? 'animate-ping bg-amber-400' : 'bg-emerald-400'
              }`}
            />
            <span
              className={`relative inline-flex rounded-full h-2 w-2 ${
                isRunningCI ? 'bg-amber-500' : 'bg-emerald-500'
              }`}
            />
          </span>
          <span className="text-slate-400">CI/CD:</span>
          <span
            className={`font-bold ${
              isRunningCI ? 'text-amber-400 animate-pulse' : 'text-emerald-400'
            }`}
          >
            {isRunningCI ? 'Building & Testing...' : 'Build Passing'}
          </span>
        </div>

        <div className="h-3.5 w-[1px] bg-slate-700 hidden sm:block" />

        {/* Staging Deployment */}
        <div className="hidden md:flex items-center gap-1.5 text-slate-300">
          <Zap className="h-3.5 w-3.5 text-amber-400" />
          <span className="text-slate-400">Deploy:</span>
          <span className="font-semibold text-slate-200">Staging Synced (v1.4.0)</span>
        </div>

        <div className="h-3.5 w-[1px] bg-slate-700 hidden lg:block" />

        {/* Automated Tests */}
        <div className="hidden lg:flex items-center gap-1.5 text-slate-300">
          <ShieldCheck className="h-3.5 w-3.5 text-emerald-400" />
          <span className="text-slate-400">Unit Tests:</span>
          <span className="font-semibold text-emerald-300">48/48 Passing (100%)</span>
        </div>
      </div>

      {/* Right: Sprint Story Points & Trigger Button */}
      <div className="flex items-center gap-3">
        {/* Sprint Story Points Pill */}
        <div className="flex items-center gap-1.5 bg-slate-800/90 px-2.5 py-1 rounded-xl border border-slate-700 text-[11px]">
          <Layers className="h-3 w-3 text-indigo-400" />
          <span className="text-slate-400 font-medium">Sprint 4:</span>
          <span className="font-extrabold text-white">
            {completedPoints} / {totalPoints} Story Points
          </span>
        </div>

        {/* Simulate CI Re-run button */}
        <button
          onClick={handleTriggerCI}
          disabled={isRunningCI}
          title="Trigger automated CI/CD test run"
          className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
        >
          <RefreshCw className={`h-3.5 w-3.5 ${isRunningCI ? 'animate-spin text-amber-400' : ''}`} />
        </button>
      </div>
    </div>
  );
};

export default PipelineStatusBar;
