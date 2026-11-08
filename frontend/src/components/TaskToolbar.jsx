import React from 'react';
import { useTasks } from '../context/TaskContext';
import { TEAM_MEMBERS } from '../services/team';
import {
  Search,
  X,
  Kanban,
  List,
  Calendar,
  BarChart3,
  ArrowUpDown,
  Filter,
  User,
} from 'lucide-react';

const TaskToolbar = ({ onOpenCreateModal }) => {
  const {
    filterStatus,
    setFilterStatus,
    filterPriority,
    setFilterPriority,
    filterCategory,
    setFilterCategory,
    filterAssignee,
    setFilterAssignee,
    searchQuery,
    setSearchQuery,
    sortBy,
    setSortBy,
    activeView,
    setActiveView,
    availableCategories,
  } = useTasks();

  const activePill = () => {
    if (filterStatus === 'Completed') return 'completed';
    if (filterPriority === 'High') return 'high';
    if (filterPriority === 'Urgent') return 'urgent';
    if (filterStatus === 'In Progress') return 'in-progress';
    if (filterStatus === 'To Do') return 'todo';
    if (filterStatus === 'All' && filterPriority === 'All') return 'all';
    return '';
  };

  const handlePillClick = (type) => {
    if (type === 'all') {
      setFilterStatus('All');
      setFilterPriority('All');
    } else if (type === 'todo') {
      setFilterStatus('To Do');
      setFilterPriority('All');
    } else if (type === 'in-progress') {
      setFilterStatus('In Progress');
      setFilterPriority('All');
    } else if (type === 'completed') {
      setFilterStatus('Completed');
      setFilterPriority('All');
    } else if (type === 'high') {
      setFilterStatus('All');
      setFilterPriority('High');
    } else if (type === 'urgent') {
      setFilterStatus('All');
      setFilterPriority('Urgent');
    }
  };

  return (
    <div className="bg-white rounded-3xl p-4 sm:p-5 border border-slate-200/80 shadow-sm mb-6 space-y-4">
      {/* Top Bar: Search Input & View Switcher */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
        {/* Search Input */}
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search tasks, descriptions, assignees, or categories..."
            className="w-full pl-10 pr-9 py-2.5 rounded-xl text-xs sm:text-sm bg-slate-50 border border-slate-200 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all placeholder:text-slate-400 font-medium"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>

        {/* View Switcher Tabs (Kanban, List, Calendar, Analytics) */}
        <div className="flex items-center bg-slate-100 p-1 rounded-2xl self-start md:self-auto border border-slate-200/60 overflow-x-auto">
          <button
            onClick={() => setActiveView('kanban')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
              activeView === 'kanban'
                ? 'bg-white text-indigo-700 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Kanban className="h-3.5 w-3.5" />
            <span>Kanban</span>
          </button>

          <button
            onClick={() => setActiveView('list')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
              activeView === 'list'
                ? 'bg-white text-indigo-700 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <List className="h-3.5 w-3.5" />
            <span>List Table</span>
          </button>

          <button
            onClick={() => setActiveView('calendar')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
              activeView === 'calendar'
                ? 'bg-white text-indigo-700 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Calendar className="h-3.5 w-3.5" />
            <span>Calendar</span>
          </button>

          <button
            onClick={() => setActiveView('analytics')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
              activeView === 'analytics'
                ? 'bg-white text-indigo-700 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <BarChart3 className="h-3.5 w-3.5" />
            <span>Analytics</span>
          </button>
        </div>
      </div>

      {/* Filter Pills & Dropdown Controls */}
      <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-slate-100">
        {/* Quick Filter Pills */}
        <div className="flex flex-wrap items-center gap-1.5">
          <button
            onClick={() => handlePillClick('all')}
            className={`px-3 py-1 rounded-full text-xs font-semibold transition-all ${
              activePill() === 'all'
                ? 'bg-indigo-600 text-white shadow-xs'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            All Tasks
          </button>

          <button
            onClick={() => handlePillClick('todo')}
            className={`px-3 py-1 rounded-full text-xs font-semibold transition-all ${
              activePill() === 'todo'
                ? 'bg-slate-800 text-white shadow-xs'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            To Do
          </button>

          <button
            onClick={() => handlePillClick('in-progress')}
            className={`px-3 py-1 rounded-full text-xs font-semibold transition-all ${
              activePill() === 'in-progress'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            In Progress
          </button>

          <button
            onClick={() => handlePillClick('completed')}
            className={`px-3 py-1 rounded-full text-xs font-semibold transition-all ${
              activePill() === 'completed'
                ? 'bg-emerald-600 text-white shadow-xs'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            Completed
          </button>

          <button
            onClick={() => handlePillClick('urgent')}
            className={`px-3 py-1 rounded-full text-xs font-semibold transition-all ${
              activePill() === 'urgent'
                ? 'bg-rose-600 text-white shadow-xs'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            Urgent
          </button>
        </div>

        {/* Dropdown Filters (Category, Assignee, Sort) */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Assignee Filter Dropdown */}
          <div className="flex items-center gap-1.5 bg-slate-50 border border-slate-200 rounded-xl px-2.5 py-1 text-xs text-slate-600">
            <User className="h-3 w-3 text-slate-400" />
            <select
              value={filterAssignee}
              onChange={(e) => setFilterAssignee(e.target.value)}
              className="bg-transparent focus:outline-none font-medium cursor-pointer"
            >
              <option value="All">All Assignees</option>
              {TEAM_MEMBERS.map((m) => (
                <option key={m.id} value={m.name}>
                  {m.name}
                </option>
              ))}
            </select>
          </div>

          {/* Category Dropdown */}
          <div className="flex items-center gap-1.5 bg-slate-50 border border-slate-200 rounded-xl px-2.5 py-1 text-xs text-slate-600">
            <Filter className="h-3 w-3 text-slate-400" />
            <select
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value)}
              className="bg-transparent focus:outline-none font-medium cursor-pointer"
            >
              <option value="All">All Categories</option>
              {availableCategories.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </div>

          {/* Sort Dropdown */}
          <div className="flex items-center gap-1.5 bg-slate-50 border border-slate-200 rounded-xl px-2.5 py-1 text-xs text-slate-600">
            <ArrowUpDown className="h-3 w-3 text-slate-400" />
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="bg-transparent focus:outline-none font-medium cursor-pointer"
            >
              <option value="createdAt_desc">Recently Created</option>
              <option value="dueDate_asc">Due Date (Earliest)</option>
              <option value="dueDate_desc">Due Date (Latest)</option>
              <option value="priority_desc">Priority (Urgent First)</option>
              <option value="title_asc">Title (A-Z)</option>
            </select>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TaskToolbar;
