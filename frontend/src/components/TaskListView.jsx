import React from 'react';
import { useTasks } from '../context/TaskContext';
import {
  Calendar,
  CheckCircle,
  Circle,
  Pencil,
  Trash2,
  Tag,
  AlertTriangle,
  ListChecks,
  MessageSquare,
  Timer,
  User,
  Zap,
  GitPullRequest,
  GitCommit,
} from 'lucide-react';

const priorityBadges = {
  Urgent: 'bg-rose-50 text-rose-700 border-rose-200',
  High: 'bg-amber-50 text-amber-700 border-amber-200',
  Medium: 'bg-blue-50 text-blue-700 border-blue-200',
  Low: 'bg-slate-100 text-slate-600 border-slate-200',
};

const statusBadges = {
  'To Do': 'bg-slate-100 text-slate-700 border-slate-200',
  'In Progress': 'bg-blue-50 text-blue-700 border-blue-200',
  Completed: 'bg-emerald-50 text-emerald-700 border-emerald-200',
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
      color: 'text-rose-600 font-semibold',
    };
  } else if (diffDays === 0) {
    return {
      text: 'Today',
      isOverdue: false,
      color: 'text-amber-600 font-semibold',
    };
  } else if (diffDays === 1) {
    return {
      text: 'Tomorrow',
      isOverdue: false,
      color: 'text-blue-600',
    };
  } else {
    return {
      text: d.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' }),
      isOverdue: false,
      color: 'text-slate-600',
    };
  }
};

const TaskListView = ({ onEditTask }) => {
  const { tasks, moveTaskStatus, deleteTask } = useTasks();

  const handleToggleCompleted = (task) => {
    const nextStatus = task.status === 'Completed' ? 'To Do' : 'Completed';
    moveTaskStatus(task._id, nextStatus);
  };

  if (tasks.length === 0) {
    return (
      <div className="bg-white rounded-3xl border border-slate-200 p-12 text-center">
        <p className="text-slate-500 font-medium">No tasks found matching your filters.</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-3xl border border-slate-200/80 shadow-sm overflow-hidden">
      {/* Desktop Table View */}
      <div className="hidden md:block overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-50/75 border-b border-slate-200 text-[11px] font-bold uppercase tracking-wider text-slate-500">
              <th className="py-3 px-4 w-12 text-center">Done</th>
              <th className="py-3 px-4">Task Details</th>
              <th className="py-3 px-4">Assignee</th>
              <th className="py-3 px-4">Subtasks</th>
              <th className="py-3 px-4">Status</th>
              <th className="py-3 px-4">Priority</th>
              <th className="py-3 px-4">Hours</th>
              <th className="py-3 px-4">Due Date</th>
              <th className="py-3 px-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 text-sm">
            {tasks.map((task) => {
              const isCompleted = task.status === 'Completed';
              const due = formatDueDate(task.dueDate);

              const subtasksTotal = task.subtasks?.length || 0;
              const subtasksDone = (task.subtasks || []).filter((s) => s.completed).length;
              const commentsCount = task.comments?.length || 0;

              return (
                <tr
                  key={task._id}
                  onClick={() => onEditTask(task)}
                  className="hover:bg-slate-50/80 transition-colors group cursor-pointer"
                >
                  {/* Done Checkbox */}
                  <td
                    className="py-3.5 px-4 text-center"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <button
                      onClick={() => handleToggleCompleted(task)}
                      className="text-slate-400 hover:text-indigo-600 transition-colors"
                    >
                      {isCompleted ? (
                        <CheckCircle className="h-5 w-5 text-emerald-500" />
                      ) : (
                        <Circle className="h-5 w-5 text-slate-300 group-hover:text-slate-400" />
                      )}
                    </button>
                  </td>

                  {/* Title, Category, Dev Badges & Description */}
                  <td className="py-3.5 px-4 max-w-xs sm:max-w-md">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className={`font-semibold text-slate-900 leading-snug ${isCompleted ? 'line-through text-slate-400' : ''}`}>
                        {task.title}
                      </span>
                      <span
                        className="inline-flex items-center gap-0.5 text-[10px] font-bold text-amber-700 bg-amber-50 px-1.5 py-0.5 rounded border border-amber-200"
                        title={`${task.storyPoints || 3} Sprint Story Points`}
                      >
                        <Zap className="h-2.5 w-2.5 fill-amber-500 text-amber-500" />
                        <span>{task.storyPoints || 3} SP</span>
                      </span>
                      {commentsCount > 0 && (
                        <span className="inline-flex items-center gap-0.5 text-[10px] text-slate-400 font-bold bg-slate-100 px-1.5 py-0.5 rounded-md">
                          <MessageSquare className="h-2.5 w-2.5" />
                          {commentsCount}
                        </span>
                      )}
                    </div>
                    {task.description && (
                      <p className="text-xs text-slate-500 truncate mt-0.5 max-w-sm">
                        {task.description}
                      </p>
                    )}
                    {/* Linked PR & Tech Stack mini pills */}
                    <div className="flex items-center gap-1.5 flex-wrap mt-1">
                      {task.linkedPR && (
                        <span
                          className={`inline-flex items-center gap-1 px-1.5 py-0.2 rounded text-[10px] font-semibold border ${
                            task.linkedPR.status === 'Merged'
                              ? 'bg-purple-50 text-purple-700 border-purple-200'
                              : task.linkedPR.status === 'Failed CI/CD'
                              ? 'bg-rose-50 text-rose-700 border-rose-200'
                              : 'bg-emerald-50 text-emerald-700 border-emerald-200'
                          }`}
                        >
                          <GitPullRequest className="h-2.5 w-2.5" />
                          <span>PR #{task.linkedPR.number}</span>
                        </span>
                      )}
                      {task.commitHash && (
                        <span className="font-mono text-[9px] text-slate-500 bg-slate-100 px-1.5 py-0.2 rounded border border-slate-200">
                          {task.commitHash.slice(0, 7)}
                        </span>
                      )}
                      {task.techStack && task.techStack.slice(0, 3).map((tech, idx) => (
                        <span key={idx} className="text-[9px] bg-slate-100 text-slate-600 px-1 py-0.2 rounded">
                          {tech}
                        </span>
                      ))}
                    </div>
                  </td>

                  {/* Assignee */}
                  <td className="py-3.5 px-4 whitespace-nowrap">
                    {task.assignee ? (
                      <div className="flex items-center gap-2">
                        <span className="h-6 w-6 rounded-full bg-indigo-600 text-white font-bold text-[10px] flex items-center justify-center shrink-0">
                          {task.assignee.avatar || 'AM'}
                        </span>
                        <div className="text-xs leading-tight">
                          <div className="font-semibold text-slate-800">{task.assignee.name}</div>
                          <div className="text-[10px] text-slate-400">{task.assignee.role}</div>
                        </div>
                      </div>
                    ) : (
                      <span className="text-xs text-slate-400">Unassigned</span>
                    )}
                  </td>

                  {/* Subtasks Progress */}
                  <td className="py-3.5 px-4 whitespace-nowrap">
                    {subtasksTotal > 0 ? (
                      <div className="flex items-center gap-2">
                        <div className="w-16 bg-slate-200 rounded-full h-1.5 overflow-hidden">
                          <div
                            className="bg-emerald-500 h-1.5 rounded-full"
                            style={{ width: `${(subtasksDone / subtasksTotal) * 100}%` }}
                          />
                        </div>
                        <span className="text-[11px] font-bold text-slate-500">
                          {subtasksDone}/{subtasksTotal}
                        </span>
                      </div>
                    ) : (
                      <span className="text-xs text-slate-400">—</span>
                    )}
                  </td>

                  {/* Status Dropdown */}
                  <td
                    className="py-3.5 px-4 whitespace-nowrap"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <select
                      value={task.status}
                      onChange={(e) => moveTaskStatus(task._id, e.target.value)}
                      className={`text-xs font-semibold px-2.5 py-1 rounded-full border cursor-pointer focus:outline-none ${
                        statusBadges[task.status] || statusBadges['To Do']
                      }`}
                    >
                      <option value="To Do">To Do</option>
                      <option value="In Progress">In Progress</option>
                      <option value="Completed">Completed</option>
                    </select>
                  </td>

                  {/* Priority */}
                  <td className="py-3.5 px-4 whitespace-nowrap">
                    <span
                      className={`text-xs font-semibold px-2.5 py-1 rounded-full border ${
                        priorityBadges[task.priority] || priorityBadges.Medium
                      }`}
                    >
                      {task.priority}
                    </span>
                  </td>

                  {/* Hours */}
                  <td className="py-3.5 px-4 whitespace-nowrap text-xs text-slate-600 font-medium">
                    <div className="flex items-center gap-1">
                      <Timer className="h-3 w-3 text-indigo-500" />
                      <span>{task.timeLogged || 0}/{task.estimatedHours || 0}h</span>
                    </div>
                  </td>

                  {/* Due Date */}
                  <td className="py-3.5 px-4 whitespace-nowrap">
                    {due ? (
                      <div className={`flex items-center gap-1.5 text-xs ${due.color}`}>
                        {due.isOverdue ? (
                          <AlertTriangle className="h-3.5 w-3.5 text-rose-500" />
                        ) : (
                          <Calendar className="h-3.5 w-3.5 text-slate-400" />
                        )}
                        <span>{due.text}</span>
                      </div>
                    ) : (
                      <span className="text-xs text-slate-400">None</span>
                    )}
                  </td>

                  {/* Actions */}
                  <td
                    className="py-3.5 px-4 text-right whitespace-nowrap"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <div className="flex items-center justify-end gap-1 opacity-70 group-hover:opacity-100 transition-opacity">
                      <button
                        onClick={() => onEditTask(task)}
                        title="Edit task"
                        className="p-1.5 rounded-lg text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 transition-colors"
                      >
                        <Pencil className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => {
                          if (window.confirm(`Delete task "${task.title}"?`)) {
                            deleteTask(task._id);
                          }
                        }}
                        title="Delete task"
                        className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Mobile Stacked List View */}
      <div className="block md:hidden divide-y divide-slate-100">
        {tasks.map((task) => {
          const isCompleted = task.status === 'Completed';
          const due = formatDueDate(task.dueDate);

          return (
            <div
              key={task._id}
              onClick={() => onEditTask(task)}
              className="p-4 space-y-2.5 active:bg-slate-50 transition-colors cursor-pointer"
            >
              <div className="flex items-start gap-3">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleToggleCompleted(task);
                  }}
                  className="mt-0.5 text-slate-400 hover:text-indigo-600"
                >
                  {isCompleted ? (
                    <CheckCircle className="h-5 w-5 text-emerald-500" />
                  ) : (
                    <Circle className="h-5 w-5 text-slate-300" />
                  )}
                </button>
                <div className="flex-1">
                  <h4
                    className={`font-semibold text-sm text-slate-900 leading-snug ${
                      isCompleted ? 'line-through text-slate-400' : ''
                    }`}
                  >
                    {task.title}
                  </h4>
                  {task.description && (
                    <p className="text-xs text-slate-500 mt-1 line-clamp-2">
                      {task.description}
                    </p>
                  )}
                </div>
              </div>

              {/* Tags & Metadata */}
              <div className="flex flex-wrap items-center gap-2 pt-1 text-xs">
                <span
                  className="inline-flex items-center gap-0.5 text-[11px] font-bold text-amber-700 bg-amber-50 px-1.5 py-0.5 rounded-md border border-amber-200"
                >
                  <Zap className="h-2.5 w-2.5 fill-amber-500 text-amber-500" />
                  <span>{task.storyPoints || 3} SP</span>
                </span>

                <span
                  className={`px-2 py-0.5 rounded-md font-semibold border ${
                    priorityBadges[task.priority] || priorityBadges.Medium
                  }`}
                >
                  {task.priority}
                </span>

                <span className="bg-slate-100 text-slate-600 px-2 py-0.5 rounded-md">
                  {task.category || 'General'}
                </span>

                {task.linkedPR && (
                  <span
                    className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded-md text-[10px] font-semibold border ${
                      task.linkedPR.status === 'Merged'
                        ? 'bg-purple-50 text-purple-700 border-purple-200'
                        : task.linkedPR.status === 'Failed CI/CD'
                        ? 'bg-rose-50 text-rose-700 border-rose-200'
                        : 'bg-emerald-50 text-emerald-700 border-emerald-200'
                    }`}
                  >
                    <GitPullRequest className="h-2.5 w-2.5" />
                    <span>PR #{task.linkedPR.number}</span>
                  </span>
                )}

                {task.assignee && (
                  <span className="flex items-center gap-1 text-slate-600 bg-slate-50 border border-slate-200 px-2 py-0.5 rounded-md">
                    <User className="h-3 w-3" />
                    {task.assignee.name.split(' ')[0]}
                  </span>
                )}

                {due && (
                  <span
                    className={`flex items-center gap-1 px-2 py-0.5 rounded-md border text-[11px] ${
                      due.isOverdue
                        ? 'bg-rose-50 border-rose-200 text-rose-600 font-semibold'
                        : 'bg-slate-50 border-slate-200 text-slate-600'
                    }`}
                  >
                    <Calendar className="h-3 w-3" />
                    {due.text}
                  </span>
                )}
              </div>

              {/* Mobile Actions Footer */}
              <div
                className="flex items-center justify-between pt-2 border-t border-slate-100 text-xs"
                onClick={(e) => e.stopPropagation()}
              >
                <select
                  value={task.status}
                  onChange={(e) => moveTaskStatus(task._id, e.target.value)}
                  className="text-xs font-semibold px-2 py-1 rounded-lg border bg-slate-50"
                >
                  <option value="To Do">To Do</option>
                  <option value="In Progress">In Progress</option>
                  <option value="Completed">Completed</option>
                </select>

                <div className="flex items-center gap-1">
                  <button
                    onClick={() => onEditTask(task)}
                    className="p-1.5 text-slate-500 hover:text-indigo-600"
                  >
                    <Pencil className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => {
                      if (window.confirm(`Delete task "${task.title}"?`)) {
                        deleteTask(task._id);
                      }
                    }}
                    className="p-1.5 text-slate-500 hover:text-rose-600"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default TaskListView;
