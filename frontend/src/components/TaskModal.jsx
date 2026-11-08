import React, { useState, useEffect } from 'react';
import { useTasks } from '../context/TaskContext';
import { TEAM_MEMBERS } from '../services/team';
import {
  X,
  Calendar,
  AlertCircle,
  Tag,
  CheckCircle2,
  Clock,
  Sparkles,
  ListChecks,
  MessageSquare,
  History,
  Send,
  Trash2,
  Plus,
  User,
  Timer,
  CheckSquare,
  Square,
  Bot,
  Zap,
  GitPullRequest,
  GitCommit,
  Code2,
  ExternalLink,
} from 'lucide-react';

const PRIORITY_OPTIONS = [
  { value: 'Low', label: 'Low', color: 'bg-slate-100 text-slate-700 border-slate-200' },
  { value: 'Medium', label: 'Medium', color: 'bg-blue-50 text-blue-700 border-blue-200' },
  { value: 'High', label: 'High', color: 'bg-amber-50 text-amber-700 border-amber-200' },
  { value: 'Urgent', label: 'Urgent', color: 'bg-rose-50 text-rose-700 border-rose-200' },
];

const STATUS_OPTIONS = [
  { value: 'To Do', label: 'To Do' },
  { value: 'In Progress', label: 'In Progress' },
  { value: 'Completed', label: 'Completed' },
];

const DEFAULT_CATEGORIES = [
  'General',
  'Engineering',
  'Design',
  'Marketing',
  'DevOps',
  'QA',
  'Research',
  'Operations',
];

const TaskModal = ({ isOpen, onClose, taskToEdit, initialStatus = 'To Do', initialDueDate = null }) => {
  const {
    createTask,
    updateTask,
    availableCategories,
    addComment,
    deleteComment,
    logTime,
    requestAIBreakdown,
  } = useTasks();

  const [activeTab, setActiveTab] = useState('details'); // 'details' | 'devops' | 'subtasks' | 'comments' | 'activity'

  // Form Fields
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [status, setStatus] = useState(initialStatus);
  const [priority, setPriority] = useState('Medium');
  const [category, setCategory] = useState('General');
  const [customCategory, setCustomCategory] = useState('');
  const [isCustomCategory, setIsCustomCategory] = useState(false);
  const [dueDate, setDueDate] = useState('');
  const [assignee, setAssignee] = useState(TEAM_MEMBERS[0]);
  const [estimatedHours, setEstimatedHours] = useState(4);
  const [timeLogged, setTimeLogged] = useState(0);

  // DevOps & Student Hub Fields
  const [storyPoints, setStoryPoints] = useState(3);
  const [techStack, setTechStack] = useState([]);
  const [newTechTag, setNewTechTag] = useState('');
  const [prNumber, setPrNumber] = useState('');
  const [prTitle, setPrTitle] = useState('');
  const [prUrl, setPrUrl] = useState('');
  const [prStatus, setPrStatus] = useState('Open');
  const [commitHash, setCommitHash] = useState('');

  // Subtasks State
  const [subtasks, setSubtasks] = useState([]);
  const [newSubtaskTitle, setNewSubtaskTitle] = useState('');
  const [isGeneratingAI, setIsGeneratingAI] = useState(false);

  // Comments State
  const [newCommentText, setNewCommentText] = useState('');
  const [isAddingComment, setIsAddingComment] = useState(false);

  // Validation
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (taskToEdit) {
      setTitle(taskToEdit.title || '');
      setDescription(taskToEdit.description || '');
      setStatus(taskToEdit.status || 'To Do');
      setPriority(taskToEdit.priority || 'Medium');
      setAssignee(taskToEdit.assignee || TEAM_MEMBERS[0]);
      setEstimatedHours(taskToEdit.estimatedHours || 0);
      setTimeLogged(taskToEdit.timeLogged || 0);
      setSubtasks(taskToEdit.subtasks ? [...taskToEdit.subtasks] : []);

      // DevOps & Student Hub Fields
      setStoryPoints(taskToEdit.storyPoints !== undefined ? taskToEdit.storyPoints : 3);
      setTechStack(Array.isArray(taskToEdit.techStack) ? [...taskToEdit.techStack] : []);
      if (taskToEdit.linkedPR) {
        setPrNumber(taskToEdit.linkedPR.number || '');
        setPrTitle(taskToEdit.linkedPR.title || '');
        setPrUrl(taskToEdit.linkedPR.url || '');
        setPrStatus(taskToEdit.linkedPR.status || 'Open');
      } else {
        setPrNumber('');
        setPrTitle('');
        setPrUrl('');
        setPrStatus('Open');
      }
      setCommitHash(taskToEdit.commitHash || '');

      if (taskToEdit.category && !DEFAULT_CATEGORIES.includes(taskToEdit.category)) {
        setIsCustomCategory(true);
        setCustomCategory(taskToEdit.category);
        setCategory('Custom');
      } else {
        setIsCustomCategory(false);
        setCategory(taskToEdit.category || 'General');
      }

      if (taskToEdit.dueDate) {
        const d = new Date(taskToEdit.dueDate);
        setDueDate(d.toISOString().split('T')[0]);
      } else {
        setDueDate('');
      }
    } else {
      // Create mode
      setTitle('');
      setDescription('');
      setStatus(initialStatus || 'To Do');
      setPriority('Medium');
      setCategory('General');
      setIsCustomCategory(false);
      setCustomCategory('');
      setAssignee(TEAM_MEMBERS[0]);
      setEstimatedHours(4);
      setTimeLogged(0);
      setSubtasks([]);
      setStoryPoints(3);
      setTechStack(['React', 'Node.js']);
      setPrNumber('');
      setPrTitle('');
      setPrUrl('');
      setPrStatus('Open');
      setCommitHash('');
      setDueDate(initialDueDate || '');
    }
    setActiveTab('details');
    setErrors({});
  }, [taskToEdit, initialStatus, initialDueDate, isOpen]);

  if (!isOpen) return null;

  // Date Quick Helpers
  const setQuickDate = (daysFromNow) => {
    const d = new Date();
    d.setDate(d.getDate() + daysFromNow);
    setDueDate(d.toISOString().split('T')[0]);
  };

  // Subtasks logic
  const handleAddSubtask = () => {
    if (!newSubtaskTitle.trim()) return;
    const item = {
      id: 'sub-' + Date.now(),
      title: newSubtaskTitle.trim(),
      completed: false,
    };
    setSubtasks((prev) => [...prev, item]);
    setNewSubtaskTitle('');
  };

  const handleToggleSubtaskLocal = (subId) => {
    setSubtasks((prev) =>
      prev.map((s) => ((s._id || s.id) === subId ? { ...s, completed: !s.completed } : s))
    );
  };

  const handleDeleteSubtaskLocal = (subId) => {
    setSubtasks((prev) => prev.filter((s) => (s._id || s.id) !== subId));
  };

  const handleAIBreakdownClick = async () => {
    if (!title.trim()) {
      setErrors((prev) => ({ ...prev, title: 'Enter a task title first to generate AI breakdown' }));
      return;
    }
    setIsGeneratingAI(true);
    try {
      const result = await requestAIBreakdown(title, description);
      if (result?.subtasks?.length) {
        setSubtasks(result.subtasks);
        if (result.estimatedHours && estimatedHours === 0) {
          setEstimatedHours(result.estimatedHours);
        }
        if (result.priority && priority === 'Medium') {
          setPriority(result.priority);
        }
      }
    } catch (err) {
      console.error('AI breakdown error:', err);
    } finally {
      setIsGeneratingAI(false);
    }
  };

  // Quick Time Log
  const handleQuickLogTime = async (hours) => {
    const nextVal = Math.round((Number(timeLogged) + hours) * 10) / 10;
    setTimeLogged(nextVal);
    if (taskToEdit?._id) {
      await logTime(taskToEdit._id, hours);
    }
  };

  // Comments
  const handleAddCommentSubmit = async (e) => {
    e.preventDefault();
    if (!newCommentText.trim() || !taskToEdit?._id) return;
    setIsAddingComment(true);
    await addComment(taskToEdit._id, newCommentText.trim());
    setNewCommentText('');
    setIsAddingComment(false);
  };

  const validate = () => {
    const errs = {};
    if (!title.trim()) errs.title = 'Task title is required';
    if (isCustomCategory && !customCategory.trim()) errs.category = 'Enter category name';
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    setIsSubmitting(true);
    const finalCategory = isCustomCategory ? customCategory.trim() : category;

    const payload = {
      title: title.trim(),
      description: description.trim(),
      status,
      priority,
      category: finalCategory || 'General',
      dueDate: dueDate ? new Date(dueDate).toISOString() : null,
      assignee,
      estimatedHours: Number(estimatedHours) || 0,
      timeLogged: Number(timeLogged) || 0,
      subtasks,
      storyPoints: Number(storyPoints) || 3,
      techStack,
      linkedPR: prNumber || prTitle ? {
        number: Number(prNumber) || 0,
        title: prTitle.trim(),
        url: prUrl.trim() || (prNumber ? `https://github.com/developer/taskflow-pro/pull/${prNumber}` : ''),
        status: prStatus,
      } : null,
      commitHash: commitHash.trim(),
    };

    let res;
    if (taskToEdit) {
      res = await updateTask(taskToEdit._id, payload);
    } else {
      res = await createTask(payload);
    }

    setIsSubmitting(false);
    if (res?.success) {
      onClose();
    }
  };

  const categoriesList = Array.from(new Set([...DEFAULT_CATEGORIES, ...availableCategories]));

  const completedSubtasksCount = subtasks.filter((s) => s.completed).length;
  const subtasksPercent =
    subtasks.length > 0 ? Math.round((completedSubtasksCount / subtasks.length) * 100) : 0;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 animate-fade-in">
      <div
        className="bg-white rounded-3xl shadow-2xl border border-slate-200 max-w-2xl w-full overflow-hidden animate-slide-up flex flex-col max-h-[90vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50/50">
          <div className="flex items-center gap-2.5">
            <div className="h-9 w-9 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold">
              <Sparkles className="h-5 w-5" />
            </div>
            <div>
              <h3 className="font-extrabold text-slate-900 text-lg leading-tight">
                {taskToEdit ? 'Task Details & Activity' : 'Create Collaborative Task'}
              </h3>
              <p className="text-xs text-slate-500">
                {taskToEdit ? `ID: #${taskToEdit._id.slice(-6)}` : 'Assign subtasks, estimates, and team ownership'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            aria-label="Close task modal"
            className="p-1.5 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-200/50 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center border-b border-slate-100 px-6 gap-2 bg-white overflow-x-auto">
          <button
            type="button"
            onClick={() => setActiveTab('details')}
            className={`py-3 px-3 text-xs font-bold border-b-2 flex items-center gap-1.5 whitespace-nowrap transition-all ${
              activeTab === 'details'
                ? 'border-indigo-600 text-indigo-600'
                : 'border-transparent text-slate-500 hover:text-slate-900'
            }`}
          >
            <Clock className="h-3.5 w-3.5" />
            <span>Details & Time</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('devops')}
            className={`py-3 px-3 text-xs font-bold border-b-2 flex items-center gap-1.5 whitespace-nowrap transition-all ${
              activeTab === 'devops'
                ? 'border-indigo-600 text-indigo-600'
                : 'border-transparent text-slate-500 hover:text-slate-900'
            }`}
          >
            <GitPullRequest className="h-3.5 w-3.5" />
            <span>DevOps & PRs {prNumber ? `(#${prNumber})` : ''}</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('subtasks')}
            className={`py-3 px-3 text-xs font-bold border-b-2 flex items-center gap-1.5 whitespace-nowrap transition-all ${
              activeTab === 'subtasks'
                ? 'border-indigo-600 text-indigo-600'
                : 'border-transparent text-slate-500 hover:text-slate-900'
            }`}
          >
            <ListChecks className="h-3.5 w-3.5" />
            <span>
              Subtasks ({completedSubtasksCount}/{subtasks.length})
            </span>
          </button>

          {taskToEdit && (
            <>
              <button
                type="button"
                onClick={() => setActiveTab('comments')}
                className={`py-3 px-3 text-xs font-bold border-b-2 flex items-center gap-1.5 whitespace-nowrap transition-all ${
                  activeTab === 'comments'
                    ? 'border-indigo-600 text-indigo-600'
                    : 'border-transparent text-slate-500 hover:text-slate-900'
                }`}
              >
                <MessageSquare className="h-3.5 w-3.5" />
                <span>Discussion ({taskToEdit.comments?.length || 0})</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab('activity')}
                className={`py-3 px-3 text-xs font-bold border-b-2 flex items-center gap-1.5 whitespace-nowrap transition-all ${
                  activeTab === 'activity'
                    ? 'border-indigo-600 text-indigo-600'
                    : 'border-transparent text-slate-500 hover:text-slate-900'
                }`}
              >
                <History className="h-3.5 w-3.5" />
                <span>Activity History</span>
              </button>
            </>
          )}
        </div>

        {/* Scrollable Modal Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-5">
          {/* TAB 1: DETAILS & TIME */}
          {activeTab === 'details' && (
            <div className="space-y-4">
              {/* Title */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">
                  Task Title <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => {
                    setTitle(e.target.value);
                    if (errors.title) setErrors((prev) => ({ ...prev, title: null }));
                  }}
                  placeholder="e.g. Architect JWT Authentication"
                  className={`w-full px-3.5 py-2.5 rounded-xl text-sm border focus:outline-none focus:ring-2 transition-all ${
                    errors.title
                      ? 'border-rose-300 bg-rose-50/20'
                      : 'border-slate-200 bg-slate-50/50 focus:bg-white focus:ring-indigo-500/20 focus:border-indigo-500'
                  }`}
                />
                {errors.title && (
                  <p className="text-xs text-rose-600 mt-1 flex items-center gap-1 font-medium">
                    <AlertCircle className="h-3.5 w-3.5" />
                    {errors.title}
                  </p>
                )}
              </div>

              {/* Description */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">
                  Description
                </label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={2}
                  placeholder="Add context, acceptance criteria, or technical details..."
                  className="w-full px-3.5 py-2.5 rounded-xl text-sm border border-slate-200 bg-slate-50/50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all resize-none"
                />
              </div>

              {/* Assignee & Status Row */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Assignee Selector */}
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5 flex items-center gap-1">
                    <User className="h-3 w-3" />
                    Assignee
                  </label>
                  <select
                    value={assignee?.name || ''}
                    onChange={(e) => {
                      const selected = TEAM_MEMBERS.find((m) => m.name === e.target.value);
                      if (selected) setAssignee(selected);
                    }}
                    className="w-full px-3.5 py-2.5 rounded-xl text-sm border border-slate-200 bg-slate-50/50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 font-medium"
                  >
                    {TEAM_MEMBERS.map((m) => (
                      <option key={m.id} value={m.name}>
                        {m.name} ({m.role})
                      </option>
                    ))}
                  </select>
                </div>

                {/* Status Selector */}
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">
                    Status
                  </label>
                  <select
                    value={status}
                    onChange={(e) => setStatus(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl text-sm border border-slate-200 bg-slate-50/50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 font-medium"
                  >
                    {STATUS_OPTIONS.map((opt) => (
                      <option key={opt.value} value={opt.value}>
                        {opt.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Priority & Category */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">
                    Priority
                  </label>
                  <div className="grid grid-cols-4 gap-1">
                    {PRIORITY_OPTIONS.map((opt) => (
                      <button
                        type="button"
                        key={opt.value}
                        onClick={() => setPriority(opt.value)}
                        className={`py-2 px-1 text-xs font-bold rounded-xl border text-center transition-all ${
                          priority === opt.value
                            ? `${opt.color} ring-2 ring-indigo-500/30 scale-105 shadow-xs`
                            : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
                        }`}
                      >
                        {opt.label}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">
                    Category
                  </label>
                  <select
                    value={isCustomCategory ? 'Custom' : category}
                    onChange={(e) => {
                      if (e.target.value === 'Custom') {
                        setIsCustomCategory(true);
                      } else {
                        setIsCustomCategory(false);
                        setCategory(e.target.value);
                      }
                    }}
                    className="w-full px-3.5 py-2.5 rounded-xl text-sm border border-slate-200 bg-slate-50/50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 font-medium"
                  >
                    {categoriesList.map((cat) => (
                      <option key={cat} value={cat}>
                        {cat}
                      </option>
                    ))}
                    <option value="Custom">+ Custom Category...</option>
                  </select>
                </div>
              </div>

              {/* Due Date */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-600">
                    Due Date
                  </label>
                  <div className="flex items-center gap-1.5 text-[11px]">
                    <button
                      type="button"
                      onClick={() => setQuickDate(0)}
                      className="text-indigo-600 hover:underline font-semibold"
                    >
                      Today
                    </button>
                    <span className="text-slate-300">•</span>
                    <button
                      type="button"
                      onClick={() => setQuickDate(1)}
                      className="text-indigo-600 hover:underline font-semibold"
                    >
                      Tomorrow
                    </button>
                    <span className="text-slate-300">•</span>
                    <button
                      type="button"
                      onClick={() => setQuickDate(7)}
                      className="text-indigo-600 hover:underline font-semibold"
                    >
                      Next Week
                    </button>
                  </div>
                </div>
                <div className="relative">
                  <Calendar className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 pointer-events-none" />
                  <input
                    type="date"
                    value={dueDate}
                    onChange={(e) => setDueDate(e.target.value)}
                    className="w-full pl-10 pr-3.5 py-2.5 rounded-xl text-sm border border-slate-200 bg-slate-50/50 focus:bg-white focus:outline-none font-medium"
                  />
                </div>
              </div>

              {/* Time Tracking Widget */}
              <div className="p-4 rounded-2xl bg-indigo-50/50 border border-indigo-100 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Timer className="h-4 w-4 text-indigo-600" />
                    <span className="text-xs font-bold uppercase tracking-wider text-indigo-900">
                      Time Tracking & Velocity
                    </span>
                  </div>
                  <span className="text-xs font-bold text-indigo-700">
                    {timeLogged}h logged / {estimatedHours}h est.
                  </span>
                </div>

                {/* Progress bar */}
                <div className="w-full bg-indigo-100 rounded-full h-2 overflow-hidden">
                  <div
                    className={`h-2 rounded-full transition-all duration-300 ${
                      timeLogged > estimatedHours ? 'bg-amber-500' : 'bg-indigo-600'
                    }`}
                    style={{
                      width: `${Math.min(
                        estimatedHours > 0 ? (timeLogged / estimatedHours) * 100 : 0,
                        100
                      )}%`,
                    }}
                  />
                </div>

                <div className="grid grid-cols-2 gap-3 pt-1">
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                      Estimated Hours
                    </label>
                    <input
                      type="number"
                      step="0.5"
                      min="0"
                      value={estimatedHours}
                      onChange={(e) => setEstimatedHours(parseFloat(e.target.value) || 0)}
                      className="w-full px-3 py-1.5 rounded-lg text-xs border border-slate-200 bg-white font-medium"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                      Quick Log Time
                    </label>
                    <div className="flex items-center gap-1.5">
                      <button
                        type="button"
                        onClick={() => handleQuickLogTime(0.5)}
                        className="px-2 py-1 rounded-lg bg-white border border-indigo-200 text-indigo-700 hover:bg-indigo-50 text-xs font-bold"
                      >
                        +0.5h
                      </button>
                      <button
                        type="button"
                        onClick={() => handleQuickLogTime(1)}
                        className="px-2 py-1 rounded-lg bg-white border border-indigo-200 text-indigo-700 hover:bg-indigo-50 text-xs font-bold"
                      >
                        +1h
                      </button>
                      <button
                        type="button"
                        onClick={() => handleQuickLogTime(2)}
                        className="px-2 py-1 rounded-lg bg-white border border-indigo-200 text-indigo-700 hover:bg-indigo-50 text-xs font-bold"
                      >
                        +2h
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB: DEVOPS & REPOSITORY / PR LINKING */}
          {activeTab === 'devops' && (
            <div className="space-y-5">
              {/* Sprint Story Points */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5 flex items-center justify-between">
                  <span className="flex items-center gap-1.5">
                    <Zap className="h-3.5 w-3.5 text-amber-500 fill-amber-500" />
                    Sprint Story Points (Velocity Complexity)
                  </span>
                  <span className="text-amber-700 font-extrabold text-sm">{storyPoints} SP</span>
                </label>
                <div className="grid grid-cols-6 gap-2">
                  {[1, 2, 3, 5, 8, 13].map((pts) => (
                    <button
                      type="button"
                      key={pts}
                      onClick={() => setStoryPoints(pts)}
                      className={`py-2 rounded-xl text-xs font-bold border transition-all ${
                        storyPoints === pts
                          ? 'bg-amber-500 text-white border-amber-600 shadow-sm scale-105'
                          : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                      }`}
                    >
                      {pts} SP
                    </button>
                  ))}
                </div>
                <p className="text-[11px] text-slate-400 mt-1">
                  Fibonacci estimation scale used to calculate team sprint throughput and burndown rate.
                </p>
              </div>

              {/* Linked Pull Request (PR) */}
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <GitPullRequest className="h-4 w-4 text-purple-600" />
                    <span className="text-xs font-bold uppercase tracking-wider text-slate-800">
                      GitHub / Bitbucket Pull Request
                    </span>
                  </div>
                  {prNumber && (
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                        prStatus === 'Merged'
                          ? 'bg-purple-100 text-purple-700 border-purple-200'
                          : prStatus === 'Failed CI/CD'
                          ? 'bg-rose-100 text-rose-700 border-rose-200'
                          : 'bg-emerald-100 text-emerald-700 border-emerald-200'
                      }`}
                    >
                      {prStatus}
                    </span>
                  )}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                      PR Number
                    </label>
                    <input
                      type="number"
                      placeholder="e.g. 42"
                      value={prNumber}
                      onChange={(e) => setPrNumber(e.target.value)}
                      className="w-full px-3 py-1.5 rounded-lg text-xs border border-slate-200 bg-white font-medium"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                      PR Status
                    </label>
                    <select
                      value={prStatus}
                      onChange={(e) => setPrStatus(e.target.value)}
                      className="w-full px-3 py-1.5 rounded-lg text-xs border border-slate-200 bg-white font-medium"
                    >
                      <option value="Open">Open</option>
                      <option value="Merged">Merged</option>
                      <option value="Failed CI/CD">Failed CI/CD</option>
                      <option value="Draft">Draft</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                      Commit SHA / Hash
                    </label>
                    <div className="relative">
                      <GitCommit className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
                      <input
                        type="text"
                        placeholder="e.g. 7c1b8e4"
                        value={commitHash}
                        onChange={(e) => setCommitHash(e.target.value)}
                        className="w-full pl-8 pr-3 py-1.5 rounded-lg text-xs font-mono border border-slate-200 bg-white"
                      />
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                    PR Title & Branch
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. feat: implement auth token signing middleware"
                    value={prTitle}
                    onChange={(e) => setPrTitle(e.target.value)}
                    className="w-full px-3 py-1.5 rounded-lg text-xs border border-slate-200 bg-white font-medium"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                    PR URL (GitHub / Bitbucket / GitLab)
                  </label>
                  <input
                    type="url"
                    placeholder="https://github.com/org/repo/pull/42"
                    value={prUrl}
                    onChange={(e) => setPrUrl(e.target.value)}
                    className="w-full px-3 py-1.5 rounded-lg text-xs border border-slate-200 bg-white font-medium"
                  />
                </div>
              </div>

              {/* Technical Skills & Tech Stack Tags */}
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Code2 className="h-4 w-4 text-indigo-600" />
                    <span className="text-xs font-bold uppercase tracking-wider text-slate-800">
                      Technical Skills & Tech Stack
                    </span>
                  </div>
                  <span className="text-xs text-slate-400 font-semibold">{techStack.length} skills tagged</span>
                </div>

                {/* Current Tags */}
                <div className="flex flex-wrap gap-1.5 min-h-[32px] p-2 bg-white rounded-xl border border-slate-200">
                  {techStack.length === 0 ? (
                    <span className="text-xs text-slate-400 italic">No technology tags added yet</span>
                  ) : (
                    techStack.map((tech, idx) => (
                      <span
                        key={idx}
                        className="inline-flex items-center gap-1 text-xs font-semibold bg-indigo-50 text-indigo-700 px-2 py-0.5 rounded-lg border border-indigo-200/60"
                      >
                        {tech}
                        <button
                          type="button"
                          onClick={() => setTechStack((prev) => prev.filter((_, i) => i !== idx))}
                          className="hover:text-rose-600"
                        >
                          ×
                        </button>
                      </span>
                    ))
                  )}
                </div>

                {/* Quick Add Tech Suggestions */}
                <div>
                  <p className="text-[11px] text-slate-500 font-medium mb-1.5">Quick add common technologies:</p>
                  <div className="flex flex-wrap gap-1.5">
                    {['React', 'Node.js', 'TypeScript', 'MongoDB', 'Docker', 'Python', 'Verilog', 'Tailwind CSS', 'Jest', 'AWS', 'CI/CD'].map(
                      (tech) => {
                        const isAdded = techStack.includes(tech);
                        return (
                          <button
                            type="button"
                            key={tech}
                            onClick={() => {
                              if (isAdded) {
                                setTechStack((prev) => prev.filter((t) => t !== tech));
                              } else {
                                setTechStack((prev) => [...prev, tech]);
                              }
                            }}
                            className={`text-[11px] px-2 py-0.5 rounded-md font-medium border transition-colors ${
                              isAdded
                                ? 'bg-indigo-600 text-white border-indigo-600'
                                : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-100'
                            }`}
                          >
                            {isAdded ? `✓ ${tech}` : `+ ${tech}`}
                          </button>
                        );
                      }
                    )}
                  </div>
                </div>

                {/* Custom Tech Tag Input */}
                <div className="flex items-center gap-2 pt-1">
                  <input
                    type="text"
                    placeholder="Or type a custom technology and press Enter..."
                    value={newTechTag}
                    onChange={(e) => setNewTechTag(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        if (newTechTag.trim() && !techStack.includes(newTechTag.trim())) {
                          setTechStack((prev) => [...prev, newTechTag.trim()]);
                          setNewTechTag('');
                        }
                      }
                    }}
                    className="flex-1 px-3 py-1.5 rounded-lg text-xs border border-slate-200 bg-white font-medium"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      if (newTechTag.trim() && !techStack.includes(newTechTag.trim())) {
                        setTechStack((prev) => [...prev, newTechTag.trim()]);
                        setNewTechTag('');
                      }
                    }}
                    className="px-3 py-1.5 rounded-lg bg-indigo-600 text-white text-xs font-bold hover:bg-indigo-700"
                  >
                    Add
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: SUBTASKS & CHECKLIST */}
          {activeTab === 'subtasks' && (
            <div className="space-y-4">
              {/* Subtask Header with AI Breakdown Button */}
              <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                <div>
                  <h4 className="font-bold text-slate-900 text-sm">Actionable Checklist</h4>
                  <p className="text-xs text-slate-500">
                    {completedSubtasksCount} of {subtasks.length} subtasks completed ({subtasksPercent}%)
                  </p>
                </div>

                <button
                  type="button"
                  onClick={handleAIBreakdownClick}
                  disabled={isGeneratingAI}
                  className="px-3 py-1.5 rounded-xl bg-gradient-to-r from-indigo-600 to-indigo-500 text-white text-xs font-bold hover:from-indigo-700 hover:to-indigo-600 transition-all flex items-center gap-1.5 shadow-xs"
                >
                  <Bot className="h-3.5 w-3.5" />
                  <span>{isGeneratingAI ? 'Generating...' : '✨ AI Breakdown'}</span>
                </button>
              </div>

              {/* Progress Bar */}
              <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                <div
                  className="bg-emerald-500 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${subtasksPercent}%` }}
                />
              </div>

              {/* Add New Subtask Input */}
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={newSubtaskTitle}
                  onChange={(e) => setNewSubtaskTitle(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      handleAddSubtask();
                    }
                  }}
                  placeholder="Add a checklist item (press Enter)..."
                  className="flex-1 px-3.5 py-2 rounded-xl text-xs sm:text-sm border border-slate-200 bg-slate-50/50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 font-medium"
                />
                <button
                  type="button"
                  onClick={handleAddSubtask}
                  className="px-3.5 py-2 rounded-xl bg-indigo-600 text-white text-xs font-bold hover:bg-indigo-700 transition-colors flex items-center gap-1"
                >
                  <Plus className="h-3.5 w-3.5" />
                  <span>Add</span>
                </button>
              </div>

              {/* Subtasks List */}
              <div className="space-y-2 max-h-60 overflow-y-auto">
                {subtasks.length === 0 ? (
                  <div className="text-center py-8 border border-dashed border-slate-200 rounded-xl">
                    <ListChecks className="h-6 w-6 text-slate-300 mx-auto mb-2" />
                    <p className="text-xs text-slate-500 font-medium">No subtasks yet.</p>
                    <p className="text-[11px] text-slate-400">
                      Click "✨ AI Breakdown" to decompose this task into checklist items automatically!
                    </p>
                  </div>
                ) : (
                  subtasks.map((sub) => {
                    const subId = sub._id || sub.id;
                    return (
                      <div
                        key={subId}
                        className={`p-2.5 rounded-xl border flex items-center justify-between gap-3 transition-colors ${
                          sub.completed
                            ? 'bg-emerald-50/40 border-emerald-200 text-slate-500'
                            : 'bg-white border-slate-200 hover:border-slate-300'
                        }`}
                      >
                        <button
                          type="button"
                          onClick={() => handleToggleSubtaskLocal(subId)}
                          className="flex items-center gap-2.5 text-left flex-1"
                        >
                          {sub.completed ? (
                            <CheckSquare className="h-4.5 w-4.5 text-emerald-600 shrink-0" />
                          ) : (
                            <Square className="h-4.5 w-4.5 text-slate-400 shrink-0 hover:text-indigo-600" />
                          )}
                          <span
                            className={`text-xs font-medium leading-snug ${
                              sub.completed ? 'line-through text-slate-400' : 'text-slate-800'
                            }`}
                          >
                            {sub.title}
                          </span>
                        </button>

                        <button
                          type="button"
                          onClick={() => handleDeleteSubtaskLocal(subId)}
                          className="p-1 text-slate-300 hover:text-rose-600 transition-colors"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          )}

          {/* TAB 3: DISCUSSION & COMMENTS */}
          {activeTab === 'comments' && taskToEdit && (
            <div className="space-y-4">
              <div className="space-y-3 max-h-60 overflow-y-auto">
                {(!taskToEdit.comments || taskToEdit.comments.length === 0) && (
                  <div className="text-center py-8 border border-dashed border-slate-200 rounded-xl">
                    <MessageSquare className="h-6 w-6 text-slate-300 mx-auto mb-2" />
                    <p className="text-xs text-slate-500 font-medium">No comments posted yet.</p>
                    <p className="text-[11px] text-slate-400">
                      Start the conversation by posting an update or feedback.
                    </p>
                  </div>
                )}

                {taskToEdit.comments?.map((comment) => (
                  <div
                    key={comment._id || comment.id}
                    className="p-3.5 rounded-2xl bg-slate-50 border border-slate-100 space-y-1.5"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="h-6 w-6 rounded-full bg-indigo-600 text-white font-bold text-[10px] flex items-center justify-center">
                          {comment.userAvatar || 'AM'}
                        </span>
                        <span className="text-xs font-bold text-slate-800">{comment.userName}</span>
                        <span className="text-[10px] text-slate-400">
                          {new Date(comment.createdAt).toLocaleDateString(undefined, {
                            month: 'short',
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </span>
                      </div>

                      <button
                        type="button"
                        onClick={() => deleteComment(taskToEdit._id, comment._id || comment.id)}
                        className="text-slate-300 hover:text-rose-500 transition-colors p-1"
                        title="Delete comment"
                      >
                        <Trash2 className="h-3 w-3" />
                      </button>
                    </div>

                    <p className="text-xs text-slate-700 leading-relaxed pl-8">{comment.text}</p>
                  </div>
                ))}
              </div>

              {/* Mention Chips */}
              <div className="flex items-center gap-1.5 text-[11px] text-slate-500 overflow-x-auto pt-1">
                <span className="font-semibold text-slate-400">Mention:</span>
                {TEAM_MEMBERS.map((m) => (
                  <button
                    key={m.id}
                    type="button"
                    onClick={() => setNewCommentText((prev) => `${prev} @${m.name} `)}
                    className="px-2 py-0.5 rounded-md bg-slate-100 hover:bg-indigo-50 hover:text-indigo-600 text-slate-600 transition-colors shrink-0"
                  >
                    @{m.name.split(' ')[0]}
                  </button>
                ))}
              </div>

              {/* Comment Input */}
              <form onSubmit={handleAddCommentSubmit} className="flex items-center gap-2">
                <input
                  type="text"
                  value={newCommentText}
                  onChange={(e) => setNewCommentText(e.target.value)}
                  placeholder="Write a comment or update (use @ to mention)..."
                  className="flex-1 px-3.5 py-2.5 rounded-xl text-xs sm:text-sm border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 font-medium"
                />
                <button
                  type="submit"
                  disabled={isAddingComment || !newCommentText.trim()}
                  className="px-4 py-2.5 rounded-xl bg-indigo-600 text-white text-xs font-bold hover:bg-indigo-700 transition-colors disabled:opacity-50 flex items-center gap-1"
                >
                  <Send className="h-3.5 w-3.5" />
                  <span>Post</span>
                </button>
              </form>
            </div>
          )}

          {/* TAB 4: ACTIVITY AUDIT LOG */}
          {activeTab === 'activity' && taskToEdit && (
            <div className="space-y-3">
              <h4 className="font-bold text-slate-900 text-sm">Chronological Audit Trail</h4>

              {(!taskToEdit.activityLog || taskToEdit.activityLog.length === 0) && (
                <p className="text-xs text-slate-400">No activity recorded yet.</p>
              )}

              <div className="relative pl-6 space-y-4 before:absolute before:left-2.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-200">
                {taskToEdit.activityLog?.map((act, idx) => (
                  <div key={act._id || act.id || idx} className="relative text-xs">
                    <span className="absolute -left-6 top-1 h-3 w-3 rounded-full bg-indigo-600 ring-4 ring-white" />
                    <div>
                      <span className="font-bold text-slate-800">{act.user}</span>{' '}
                      <span className="text-slate-600">{act.action}</span>
                      {act.field && (
                        <span className="font-medium text-indigo-600 ml-1">[{act.field}]</span>
                      )}
                      {act.from && act.to && (
                        <span className="text-slate-500 ml-1">
                          from <span className="font-medium">{act.from}</span> to{' '}
                          <span className="font-medium text-slate-900">{act.to}</span>
                        </span>
                      )}
                    </div>
                    <span className="text-[10px] text-slate-400">
                      {new Date(act.timestamp).toLocaleDateString(undefined, {
                        month: 'short',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="flex items-center justify-between px-6 py-4 border-t border-slate-100 bg-slate-50/50">
          <div className="text-xs text-slate-400">
            {taskToEdit ? 'Changes will be audited' : 'All fields can be updated later'}
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-200/60 transition-colors"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleSubmit}
              disabled={isSubmitting}
              className="px-5 py-2 rounded-xl text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 active:scale-95 shadow-sm shadow-indigo-200 transition-all flex items-center gap-1.5"
            >
              {isSubmitting ? (
                <span>Saving...</span>
              ) : (
                <span>{taskToEdit ? 'Save Changes' : 'Create Task'}</span>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TaskModal;
