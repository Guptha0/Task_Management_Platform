import React, { useState } from 'react';
import { useTasks } from '../context/TaskContext';
import {
  Sparkles,
  Bot,
  Send,
  Calendar,
  AlertTriangle,
  User,
  Clock,
  ArrowRight,
  CheckCircle2,
  X,
} from 'lucide-react';
import confetti from 'canvas-confetti';

const PROMPT_SUGGESTIONS = [
  'Fix the JWT authentication token refresh bug by tomorrow with high priority assigned to David',
  'Design responsive mobile navigation drawer by Friday with 4h estimate',
  'Urgent: optimize MongoDB compound indices for production telemetry query',
];

const priorityColorMap = {
  Urgent: 'bg-rose-50 text-rose-700 border-rose-200',
  High: 'bg-amber-50 text-amber-700 border-amber-200',
  Medium: 'bg-blue-50 text-blue-700 border-blue-200',
  Low: 'bg-slate-100 text-slate-700 border-slate-200',
};

const AITaskCreator = () => {
  const { createTask, requestNLPParse } = useTasks();
  const [prompt, setPrompt] = useState('');
  const [parsedPreview, setParsedPreview] = useState(null);
  const [isParsing, setIsParsing] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');

  const handleParse = async (textToParse = prompt) => {
    if (!textToParse.trim()) return;
    setIsParsing(true);
    setSuccessMessage('');
    try {
      const parsed = await requestNLPParse(textToParse);
      setParsedPreview(parsed);
    } catch (err) {
      console.error('AI Parse error:', err);
    } finally {
      setIsParsing(false);
    }
  };

  const handleCreate = async () => {
    if (!parsedPreview) return;
    setIsCreating(true);

    const taskPayload = {
      title: parsedPreview.title,
      description: `Created via TaskBot AI Copilot from prompt: "${prompt}"`,
      priority: parsedPreview.priority || 'Medium',
      category: parsedPreview.category || 'General',
      dueDate: parsedPreview.dueDate,
      assignee: parsedPreview.assignee,
      estimatedHours: parsedPreview.estimatedHours || 4,
      status: 'To Do',
      subtasks: [
        { id: 'sub-auto-1', title: 'Review specifications and reproduce criteria', completed: false },
        { id: 'sub-auto-2', title: 'Complete primary implementation', completed: false },
        { id: 'sub-auto-3', title: 'Run validation tests and verify completion', completed: false },
      ],
    };

    const res = await createTask(taskPayload);
    setIsCreating(false);

    if (res?.success) {
      try {
        confetti({ particleCount: 50, spread: 60, origin: { y: 0.6 } });
      } catch (e) {}

      setSuccessMessage(`Task "${parsedPreview.title}" created successfully!`);
      setPrompt('');
      setParsedPreview(null);
      setTimeout(() => setSuccessMessage(''), 4000);
    }
  };

  const handleSuggestionClick = (suggestion) => {
    setPrompt(suggestion);
    handleParse(suggestion);
  };

  return (
    <div className="bg-gradient-to-r from-indigo-900 via-indigo-800 to-slate-900 rounded-2xl p-4 sm:p-5 text-white shadow-md border border-indigo-700/50 mb-6 relative overflow-hidden">
      {/* Background glow */}
      <div className="absolute right-0 top-0 bottom-0 w-80 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />

      {/* Header */}
      <div className="relative z-10 flex items-center justify-between gap-2 mb-3">
        <div className="flex items-center gap-2">
          <div className="h-7 w-7 rounded-lg bg-indigo-500/20 text-indigo-300 flex items-center justify-center border border-indigo-400/30">
            <Bot className="h-4 w-4 text-indigo-300" />
          </div>
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-indigo-200 flex items-center gap-1.5">
              TaskBot AI Copilot
              <span className="bg-indigo-500/30 text-indigo-200 text-[10px] px-2 py-0.5 rounded-full border border-indigo-400/20">
                Natural Language Quick-Add
              </span>
            </span>
          </div>
        </div>

        {successMessage && (
          <span className="text-xs text-emerald-300 flex items-center gap-1 font-semibold animate-fade-in">
            <CheckCircle2 className="h-3.5 w-3.5" />
            {successMessage}
          </span>
        )}
      </div>

      {/* Input bar */}
      <div className="relative z-10 flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
        <div className="relative flex-1">
          <Sparkles className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-indigo-300 pointer-events-none" />
          <input
            type="text"
            value={prompt}
            onChange={(e) => {
              setPrompt(e.target.value);
              if (parsedPreview) setParsedPreview(null);
            }}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                if (parsedPreview) {
                  handleCreate();
                } else {
                  handleParse();
                }
              }
            }}
            placeholder='e.g., "Remind me to fix the login bug by tomorrow at 4pm with high priority assigned to David"'
            className="w-full pl-10 pr-24 py-2.5 rounded-xl text-xs sm:text-sm bg-white/10 text-white placeholder:text-indigo-200/60 border border-white/15 focus:bg-white/15 focus:outline-none focus:ring-2 focus:ring-indigo-400/30 transition-all font-medium"
          />
          {prompt && (
            <button
              onClick={() => {
                setPrompt('');
                setParsedPreview(null);
              }}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-indigo-200/60 hover:text-white"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>

        <div className="flex items-center gap-2">
          {!parsedPreview ? (
            <button
              onClick={() => handleParse()}
              disabled={isParsing || !prompt.trim()}
              className="px-4 py-2.5 rounded-xl bg-indigo-500 hover:bg-indigo-400 active:scale-95 disabled:opacity-50 text-white text-xs font-bold transition-all flex items-center justify-center gap-1.5 shadow-sm"
            >
              <Sparkles className="h-3.5 w-3.5" />
              <span>{isParsing ? 'Parsing...' : '✨ AI Parse'}</span>
            </button>
          ) : (
            <button
              onClick={handleCreate}
              disabled={isCreating}
              className="px-4 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 active:scale-95 disabled:opacity-50 text-white text-xs font-bold transition-all flex items-center justify-center gap-1.5 shadow-sm"
            >
              <Send className="h-3.5 w-3.5" />
              <span>{isCreating ? 'Adding...' : 'Create Task'}</span>
            </button>
          )}
        </div>
      </div>

      {/* AI Parsed Live Preview Pill */}
      {parsedPreview && (
        <div className="relative z-10 mt-3 p-3 rounded-xl bg-white/10 border border-white/15 animate-slide-up flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex flex-wrap items-center gap-2">
            <span className="font-semibold text-white truncate max-w-xs sm:max-w-md">
              📝 {parsedPreview.title}
            </span>

            <span
              className={`px-2 py-0.5 rounded-md font-bold text-[11px] border ${
                priorityColorMap[parsedPreview.priority] || priorityColorMap.Medium
              }`}
            >
              {parsedPreview.priority}
            </span>

            {parsedPreview.dueDate && (
              <span className="flex items-center gap-1 px-2 py-0.5 rounded-md bg-white/15 text-indigo-100 text-[11px] font-medium">
                <Calendar className="h-3 w-3 text-indigo-300" />
                {new Date(parsedPreview.dueDate).toLocaleDateString(undefined, {
                  month: 'short',
                  day: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit',
                })}
              </span>
            )}

            {parsedPreview.assignee && (
              <span className="flex items-center gap-1 px-2 py-0.5 rounded-md bg-white/15 text-indigo-100 text-[11px] font-medium">
                <User className="h-3 w-3 text-indigo-300" />
                {parsedPreview.assignee.name}
              </span>
            )}

            <span className="flex items-center gap-1 px-2 py-0.5 rounded-md bg-white/15 text-indigo-100 text-[11px] font-medium">
              <Clock className="h-3 w-3 text-indigo-300" />
              {parsedPreview.estimatedHours}h est.
            </span>
          </div>

          <button
            onClick={handleCreate}
            disabled={isCreating}
            className="ml-auto inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-emerald-500 text-white font-bold text-xs hover:bg-emerald-400 transition-colors shadow-sm"
          >
            <span>Confirm & Add Task</span>
            <ArrowRight className="h-3 w-3" />
          </button>
        </div>
      )}

      {/* Suggestion Chips */}
      {!parsedPreview && (
        <div className="relative z-10 mt-2.5 flex items-center gap-2 overflow-x-auto text-[11px] text-indigo-200">
          <span className="text-indigo-300 font-semibold shrink-0">Try prompt:</span>
          {PROMPT_SUGGESTIONS.map((s, idx) => (
            <button
              key={idx}
              onClick={() => handleSuggestionClick(s)}
              className="shrink-0 px-2.5 py-1 rounded-lg bg-white/5 hover:bg-white/15 border border-white/10 hover:border-white/20 text-indigo-100 transition-colors truncate max-w-xs"
            >
              {s}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default AITaskCreator;
