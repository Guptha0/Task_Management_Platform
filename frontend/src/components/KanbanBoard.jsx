import React, { useState } from 'react';
import { useTasks } from '../context/TaskContext';
import {
  Calendar,
  Clock,
  Plus,
  Pencil,
  Trash2,
  ChevronLeft,
  ChevronRight,
  ListChecks,
  MessageSquare,
  Tag,
  User,
  Timer,
  Zap,
  GitPullRequest,
  GitCommit,
  AlertCircle,
  CheckCircle2,
} from 'lucide-react';

const COLUMNS = [
  {
    id: 'To Do',
    title: 'To Do',
    theme: {
      border: 'border-slate-200',
      badge: 'bg-slate-100 text-slate-700',
      dot: 'bg-slate-400',
      dropActive: 'border-indigo-400 bg-indigo-50/40',
    },
  },
  {
    id: 'In Progress',
    title: 'In Progress',
    theme: {
      border: 'border-blue-200',
      badge: 'bg-blue-100 text-blue-700',
      dot: 'bg-blue-500',
      dropActive: 'border-blue-400 bg-blue-50/40',
    },
  },
  {
    id: 'Completed',
    title: 'Completed',
    theme: {
      border: 'border-emerald-200',
      badge: 'bg-emerald-100 text-emerald-700',
      dot: 'bg-emerald-500',
      dropActive: 'border-emerald-400 bg-emerald-50/40',
    },
  },
];

const priorityStyles = {
  Urgent: 'bg-rose-50 text-rose-700 border-rose-200',
  High: 'bg-amber-50 text-amber-700 border-amber-200',
  Medium: 'bg-blue-50 text-blue-700 border-blue-200',
  Low: 'bg-slate-100 text-slate-600 border-slate-200',
};

const formatDueDate = (dateStr) => {
  if (!dateStr) return null;
  const d = new Date(dateStr);
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const target = new Date(d.getFullYear(), d.getMonth(), d.getDate());
  const diffDays = Math.round((target - today) / (1000 * 60 * 60 * 24));

  if (diffDays < 0) {
    return {
      text: `${Math.abs(diffDays)}d overdue`,
      isOverdue: true,
      color: 'text-rose-600 bg-rose-50 border-rose-200',
    };
  } else if (diffDays === 0) {
    return {
      text: 'Today',
      isOverdue: false,
      color: 'text-amber-700 bg-amber-50 border-amber-200',
    };
  } else if (diffDays === 1) {
    return {
      text: 'Tomorrow',
      isOverdue: false,
      color: 'text-blue-700 bg-blue-50 border-blue-200',
    };
  } else {
    return {
      text: d.toLocaleDateString(undefined, { month: 'short', day: 'numeric' }),
      isOverdue: false,
      color: 'text-slate-600 bg-slate-50 border-slate-200',
    };
  }
};

const KanbanBoard = ({ onEditTask, onOpenCreateWithStatus }) => {
  const { tasks, moveTaskStatus, deleteTask } = useTasks();
  const [draggedTaskId, setDraggedTaskId] = useState(null);
  const [activeDropCol, setActiveDropCol] = useState(null);

  const getTasksByStatus = (status) => tasks.filter((t) => t.status === status);

  const handleDragStart = (e, taskId) => {
    e.dataTransfer.setData('text/plain', taskId);
    e.dataTransfer.effectAllowed = 'move';
    setDraggedTaskId(taskId);
  };

  const handleDragOver = (e, colId) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    if (activeDropCol !== colId) {
      setActiveDropCol(colId);
    }
  };

  const handleDragLeave = (e, colId) => {
    if (e.currentTarget.contains(e.relatedTarget)) return;
    if (activeDropCol === colId) {
      setActiveDropCol(null);
    }
  };

  const handleDrop = (e, colId) => {
    e.preventDefault();
    setActiveDropCol(null);
    const taskId = e.dataTransfer.getData('text/plain') || draggedTaskId;
    if (taskId) {
      moveTaskStatus(taskId, colId);
    }
    setDraggedTaskId(null);
  };

  const handleShiftLeft = (task) => {
    if (task.status === 'Completed') moveTaskStatus(task._id, 'In Progress');
    else if (task.status === 'In Progress') moveTaskStatus(task._id, 'To Do');
  };

  const handleShiftRight = (task) => {
    if (task.status === 'To Do') moveTaskStatus(task._id, 'In Progress');
    else if (task.status === 'In Progress') moveTaskStatus(task._id, 'Completed');
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      {COLUMNS.map((column) => {
        const columnTasks = getTasksByStatus(column.id);
        const isDropTarget = activeDropCol === column.id;

        return (
          <div
            key={column.id}
            onDragOver={(e) => handleDragOver(e, column.id)}
            onDragLeave={(e) => handleDragLeave(e, column.id)}
            onDrop={(e) => handleDrop(e, column.id)}
            className={`flex flex-col rounded-3xl bg-slate-100/70 p-4 border-2 transition-all duration-200 min-h-[520px] ${
              isDropTarget ? column.theme.dropActive : column.theme.border
            }`}
          >
            {/* Column Header */}
            <div className="flex items-center justify-between pb-3 mb-3 border-b border-slate-200/60">
              <div className="flex items-center gap-2">
                <span className={`h-2.5 w-2.5 rounded-full ${column.theme.dot}`} />
                <h3 className="font-bold text-sm text-slate-800">{column.title}</h3>
                <span className={`text-xs px-2 py-0.5 rounded-full font-bold ${column.theme.badge}`}>
                  {columnTasks.length}
                </span>
              </div>

              <button
                onClick={() => onOpenCreateWithStatus(column.id)}
                title={`Add task to ${column.title}`}
                className="p-1 rounded-lg text-slate-500 hover:text-indigo-600 hover:bg-white transition-colors"
              >
                <Plus className="h-4 w-4" />
              </button>
            </div>

            {/* Column Tasks */}
            <div className="flex-1 space-y-3">
              {columnTasks.length === 0 ? (
                <div className="h-44 flex flex-col items-center justify-center border border-dashed border-slate-300 rounded-2xl text-center p-4">
                  <p className="text-xs text-slate-400 font-medium">No tasks in this column</p>
                  <button
                    onClick={() => onOpenCreateWithStatus(column.id)}
                    className="mt-2 text-xs text-indigo-600 font-semibold hover:underline"
                  >
                    + Add a task
                  </button>
                </div>
              ) : (
                columnTasks.map((task) => {
                  const dueInfo = formatDueDate(task.dueDate);
                  const isCompleted = task.status === 'Completed';

                  const subtasksTotal = task.subtasks?.length || 0;
                  const subtasksDone = (task.subtasks || []).filter((s) => s.completed).length;
                  const subtasksPct = subtasksTotal > 0 ? Math.round((subtasksDone / subtasksTotal) * 100) : 0;
                  const commentsCount = task.comments?.length || 0;

                  return (
                    <div
                      key={task._id}
                      draggable
                      onDragStart={(e) => handleDragStart(e, task._id)}
                      onDragEnd={() => setDraggedTaskId(null)}
                      onClick={() => onEditTask(task)}
                      className={`group bg-white rounded-2xl p-4 border border-slate-200/90 shadow-xs hover:shadow-md hover:border-indigo-300 transition-all duration-150 cursor-grab active:cursor-grabbing ${
                        draggedTaskId === task._id ? 'opacity-40 scale-95' : ''
                      }`}
                    >
                      {/* Top Badges: Category, Story Points & Priority */}
                      <div className="flex items-center justify-between gap-1.5 mb-2">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <span className="inline-flex items-center gap-1 text-[11px] font-medium text-slate-600 bg-slate-100 px-2 py-0.5 rounded-md">
                            <Tag className="h-2.5 w-2.5 text-slate-400" />
                            {task.category || 'General'}
                          </span>
                          <span
                            className="inline-flex items-center gap-0.5 text-[11px] font-bold text-amber-700 bg-amber-50 px-1.5 py-0.5 rounded-md border border-amber-200"
                            title={`${task.storyPoints || 3} Sprint Story Points`}
                          >
                            <Zap className="h-2.5 w-2.5 fill-amber-500 text-amber-500" />
                            <span>{task.storyPoints || 3} SP</span>
                          </span>
                        </div>

                        <span
                          className={`text-[11px] font-semibold px-2 py-0.5 rounded-md border shrink-0 ${
                            priorityStyles[task.priority] || priorityStyles.Medium
                          }`}
                        >
                          {task.priority}
                        </span>
                      </div>

                      {/* Title & Description */}
                      <h4
                        className={`font-semibold text-sm text-slate-900 leading-snug mb-1.5 ${
                          isCompleted ? 'line-through text-slate-400' : ''
                        }`}
                      >
                        {task.title}
                      </h4>

                      {task.description && (
                        <p className="text-xs text-slate-500 line-clamp-2 mb-2 leading-relaxed">
                          {task.description}
                        </p>
                      )}

                      {/* Tech Stack Tags */}
                      {task.techStack && task.techStack.length > 0 && (
                        <div className="flex flex-wrap gap-1 mb-2.5">
                          {task.techStack.map((tech, idx) => (
                            <span
                              key={idx}
                              className="text-[10px] font-medium bg-slate-100 text-slate-700 px-1.5 py-0.5 rounded border border-slate-200"
                            >
                              {tech}
                            </span>
                          ))}
                        </div>
                      )}

                      {/* Linked PR & Commit Hash Bar */}
                      {(task.linkedPR || task.commitHash) && (
                        <div
                          className="flex items-center gap-1.5 flex-wrap mb-2.5 p-1.5 rounded-xl bg-slate-50 border border-slate-200/80 text-[11px]"
                          onClick={(e) => e.stopPropagation()}
                        >
                          {task.linkedPR && (
                            <a
                              href={task.linkedPR.url || '#'}
                              target="_blank"
                              rel="noopener noreferrer"
                              className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded-md font-semibold text-[10px] border transition-colors ${
                                task.linkedPR.status === 'Merged'
                                  ? 'bg-purple-50 text-purple-700 border-purple-200 hover:bg-purple-100'
                                  : task.linkedPR.status === 'Failed CI/CD'
                                  ? 'bg-rose-50 text-rose-700 border-rose-200 hover:bg-rose-100'
                                  : task.linkedPR.status === 'Open'
                                  ? 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100'
                                  : 'bg-slate-100 text-slate-600 border-slate-200 hover:bg-slate-200'
                              }`}
                              title={task.linkedPR.title || `PR #${task.linkedPR.number}`}
                            >
                              <GitPullRequest className="h-2.5 w-2.5" />
                              <span>PR #{task.linkedPR.number}</span>
                              <span className="opacity-75">({task.linkedPR.status || 'Open'})</span>
                            </a>
                          )}
                          {task.commitHash && (
                            <span
                              className="inline-flex items-center gap-0.5 font-mono text-[10px] text-slate-500 bg-white px-1.5 py-0.5 rounded border border-slate-200"
                              title={`Commit ${task.commitHash}`}
                            >
                              <GitCommit className="h-2.5 w-2.5 text-slate-400" />
                              <span>{task.commitHash.slice(0, 7)}</span>
                            </span>
                          )}
                        </div>
                      )}

                      {/* Subtask Progress Bar (if task has subtasks) */}
                      {subtasksTotal > 0 && (
                        <div className="mb-2.5 p-2 rounded-xl bg-slate-50 border border-slate-100 space-y-1">
                          <div className="flex items-center justify-between text-[10px] font-bold text-slate-600">
                            <span className="flex items-center gap-1">
                              <ListChecks className="h-3 w-3 text-indigo-600" />
                              Checklist
                            </span>
                            <span>
                              {subtasksDone}/{subtasksTotal} ({subtasksPct}%)
                            </span>
                          </div>
                          <div className="w-full bg-slate-200 rounded-full h-1.5 overflow-hidden">
                            <div
                              className="bg-emerald-500 h-1.5 rounded-full transition-all duration-300"
                              style={{ width: `${subtasksPct}%` }}
                            />
                          </div>
                        </div>
                      )}

                      {/* Metadata Row: Assignee, Time, Comments */}
                      <div className="flex items-center justify-between py-1.5 border-t border-slate-100 text-[11px] text-slate-500">
                        {/* Assignee Avatar */}
                        {task.assignee ? (
                          <div
                            className="flex items-center gap-1.5"
                            title={`Assigned to ${task.assignee.name} (${task.assignee.role})`}
                          >
                            <span className="h-5 w-5 rounded-full bg-indigo-600 text-white font-bold text-[9px] flex items-center justify-center shrink-0">
                              {task.assignee.avatar || 'AM'}
                            </span>
                            <span className="text-slate-700 font-semibold truncate max-w-[90px]">
                              {task.assignee.name.split(' ')[0]}
                            </span>
                          </div>
                        ) : (
                          <span className="text-slate-400">Unassigned</span>
                        )}

                        <div className="flex items-center gap-2">
                          {/* Time Tracking */}
                          {(task.estimatedHours > 0 || task.timeLogged > 0) && (
                            <span
                              className="inline-flex items-center gap-0.5 text-slate-600"
                              title={`${task.timeLogged || 0}h logged of ${task.estimatedHours || 0}h estimated`}
                            >
                              <Timer className="h-3 w-3 text-indigo-500" />
                              <span>{task.timeLogged || 0}/{task.estimatedHours || 0}h</span>
                            </span>
                          )}

                          {/* Comments Counter */}
                          {commentsCount > 0 && (
                            <span className="inline-flex items-center gap-0.5 text-slate-600">
                              <MessageSquare className="h-3 w-3 text-slate-400" />
                              <span>{commentsCount}</span>
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Card Footer: Due Date & Action Chevrons */}
                      <div className="flex items-center justify-between pt-2 border-t border-slate-100 text-xs">
                        {dueInfo ? (
                          <div
                            className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-medium border ${dueInfo.color}`}
                          >
                            <Calendar className="h-3 w-3" />
                            <span>{dueInfo.text}</span>
                          </div>
                        ) : (
                          <span className="text-[11px] text-slate-400">No date</span>
                        )}

                        {/* Action buttons */}
                        <div
                          className="flex items-center gap-1"
                          onClick={(e) => e.stopPropagation()}
                        >
                          {task.status !== 'To Do' && (
                            <button
                              onClick={() => handleShiftLeft(task)}
                              title="Move back"
                              className="p-1 rounded text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
                            >
                              <ChevronLeft className="h-3.5 w-3.5" />
                            </button>
                          )}

                          {task.status !== 'Completed' && (
                            <button
                              onClick={() => handleShiftRight(task)}
                              title="Advance status"
                              className="p-1 rounded text-slate-400 hover:text-indigo-600 hover:bg-slate-100 transition-colors"
                            >
                              <ChevronRight className="h-3.5 w-3.5" />
                            </button>
                          )}

                          <button
                            onClick={() => onEditTask(task)}
                            title="Edit task"
                            className="p-1 rounded text-slate-400 hover:text-indigo-600 hover:bg-slate-100 transition-colors"
                          >
                            <Pencil className="h-3.5 w-3.5" />
                          </button>

                          <button
                            onClick={() => {
                              if (window.confirm(`Delete task "${task.title}"?`)) {
                                deleteTask(task._id);
                              }
                            }}
                            title="Delete task"
                            className="p-1 rounded text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default KanbanBoard;
