import React, { useState } from 'react';
import { useTasks } from '../context/TaskContext';
import {
  ChevronLeft,
  ChevronRight,
  Calendar as CalendarIcon,
  Plus,
  AlertTriangle,
  Clock,
  CheckCircle2,
  User,
} from 'lucide-react';

const priorityColors = {
  Urgent: 'bg-rose-50 text-rose-700 border-rose-200',
  High: 'bg-amber-50 text-amber-700 border-amber-200',
  Medium: 'bg-blue-50 text-blue-700 border-blue-200',
  Low: 'bg-slate-50 text-slate-700 border-slate-200',
};

const statusDots = {
  'To Do': 'bg-slate-400',
  'In Progress': 'bg-blue-500',
  Completed: 'bg-emerald-500',
};

const CalendarView = ({ onEditTask, onOpenCreateForDate }) => {
  const { tasks } = useTasks();
  const [currentDate, setCurrentDate] = useState(new Date());

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  // Helper to change month
  const prevMonth = () => {
    setCurrentDate(new Date(year, month - 1, 1));
  };

  const nextMonth = () => {
    setCurrentDate(new Date(year, month + 1, 1));
  };

  const goToToday = () => {
    setCurrentDate(new Date());
  };

  // Calendar calculations
  const firstDayIndex = new Date(year, month, 1).getDay(); // 0 is Sunday
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const daysInPrevMonth = new Date(year, month, 0).getDate();

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December',
  ];
  const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  // Map tasks to dates (YYYY-MM-DD)
  const tasksByDate = {};
  tasks.forEach((task) => {
    if (task.dueDate) {
      const d = new Date(task.dueDate);
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
      if (!tasksByDate[key]) tasksByDate[key] = [];
      tasksByDate[key].push(task);
    }
  });

  const today = new Date();
  const todayKey = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;

  // Month tasks count
  const monthTasksCount = tasks.filter((t) => {
    if (!t.dueDate) return false;
    const d = new Date(t.dueDate);
    return d.getFullYear() === year && d.getMonth() === month;
  }).length;

  return (
    <div className="bg-white rounded-3xl border border-slate-200/80 shadow-sm overflow-hidden">
      {/* Calendar Header Controls */}
      <div className="p-5 sm:p-6 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold">
            <CalendarIcon className="h-5 w-5" />
          </div>
          <div>
            <h2 className="text-xl font-extrabold text-slate-900 tracking-tight">
              {monthNames[month]} {year}
            </h2>
            <p className="text-xs text-slate-500 font-medium">
              {monthTasksCount} deadlines scheduled this month
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={goToToday}
            className="px-3 py-1.5 rounded-xl border border-slate-200 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors"
          >
            Today
          </button>
          <div className="flex items-center rounded-xl border border-slate-200 bg-slate-50 p-0.5">
            <button
              onClick={prevMonth}
              className="p-1.5 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-white transition-colors"
              title="Previous month"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <button
              onClick={nextMonth}
              className="p-1.5 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-white transition-colors"
              title="Next month"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Weekday Names Header */}
      <div className="grid grid-cols-7 border-b border-slate-200 bg-slate-50/75 text-center text-xs font-bold uppercase tracking-wider text-slate-500 py-3">
        {dayNames.map((day) => (
          <div key={day}>{day}</div>
        ))}
      </div>

      {/* Days Grid */}
      <div className="grid grid-cols-7 divide-x divide-y divide-slate-100 min-h-[600px]">
        {/* Leading empty days from previous month */}
        {Array.from({ length: firstDayIndex }).map((_, i) => {
          const prevMonthDay = daysInPrevMonth - firstDayIndex + i + 1;
          return (
            <div
              key={`prev-${i}`}
              className="p-2 sm:p-2.5 bg-slate-50/40 text-slate-300 min-h-[110px]"
            >
              <span className="text-xs font-semibold">{prevMonthDay}</span>
            </div>
          );
        })}

        {/* Days of current month */}
        {Array.from({ length: daysInMonth }).map((_, i) => {
          const dayNum = i + 1;
          const dayKey = `${year}-${String(month + 1).padStart(2, '0')}-${String(dayNum).padStart(2, '0')}`;
          const isToday = dayKey === todayKey;
          const dayTasks = tasksByDate[dayKey] || [];

          return (
            <div
              key={`current-${dayNum}`}
              onClick={() => onOpenCreateForDate(dayKey)}
              className={`p-1.5 sm:p-2 min-h-[110px] flex flex-col justify-between transition-colors hover:bg-indigo-50/20 group cursor-pointer ${
                isToday ? 'bg-indigo-50/40' : 'bg-white'
              }`}
            >
              {/* Day Number Header */}
              <div className="flex items-center justify-between">
                <span
                  className={`text-xs font-bold h-6 w-6 rounded-full flex items-center justify-center transition-all ${
                    isToday
                      ? 'bg-indigo-600 text-white shadow-sm shadow-indigo-300'
                      : 'text-slate-700 group-hover:text-indigo-600'
                  }`}
                >
                  {dayNum}
                </span>

                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onOpenCreateForDate(dayKey);
                  }}
                  className="opacity-0 group-hover:opacity-100 p-0.5 rounded text-slate-400 hover:text-indigo-600 transition-opacity"
                  title="Add task on this date"
                >
                  <Plus className="h-3 w-3" />
                </button>
              </div>

              {/* Tasks for this day */}
              <div className="flex-1 mt-1 space-y-1 overflow-hidden">
                {dayTasks.slice(0, 3).map((task) => {
                  const isCompleted = task.status === 'Completed';
                  const isOverdue =
                    !isCompleted &&
                    new Date(task.dueDate) < new Date(today.getFullYear(), today.getMonth(), today.getDate());

                  return (
                    <div
                      key={task._id}
                      onClick={(e) => {
                        e.stopPropagation();
                        onEditTask(task);
                      }}
                      className={`px-2 py-1 rounded-lg text-[11px] font-semibold border truncate flex items-center justify-between gap-1 shadow-xs transition-transform hover:scale-[1.02] cursor-pointer ${
                        isOverdue
                          ? 'bg-rose-50 text-rose-700 border-rose-200'
                          : isCompleted
                          ? 'bg-emerald-50 text-emerald-700 border-emerald-200 line-through opacity-75'
                          : 'bg-slate-50 text-slate-800 border-slate-200 hover:border-indigo-300 hover:bg-white'
                      }`}
                    >
                      <div className="flex items-center gap-1.5 truncate">
                        <span
                          className={`h-1.5 w-1.5 rounded-full shrink-0 ${
                            statusDots[task.status] || 'bg-slate-400'
                          }`}
                        />
                        <span className="truncate">{task.title}</span>
                      </div>

                      {task.assignee?.avatar && (
                        <span className="shrink-0 text-[9px] font-bold h-4 w-4 rounded-full bg-slate-200 text-slate-700 flex items-center justify-center">
                          {task.assignee.avatar}
                        </span>
                      )}
                    </div>
                  );
                })}

                {dayTasks.length > 3 && (
                  <div className="text-[10px] text-slate-400 font-bold px-1 text-right">
                    +{dayTasks.length - 3} more
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default CalendarView;
