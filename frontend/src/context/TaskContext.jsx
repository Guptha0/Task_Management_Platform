import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { tasksAPI } from '../services/api';
import { useAuth } from './AuthContext';
import confetti from 'canvas-confetti';

const TaskContext = createContext(null);

export const TaskProvider = ({ children }) => {
  const { token, user, isAuthenticated } = useAuth();

  const [tasks, setTasks] = useState([]);
  const [stats, setStats] = useState({
    total: 0,
    completed: 0,
    inProgress: 0,
    toDo: 0,
    pending: 0,
    urgent: 0,
    overdue: 0,
    completionRate: 0,
    totalStoryPoints: 0,
    completedStoryPoints: 0,
    inProgressStoryPoints: 0,
    storyPointsVelocityRate: 0,
    totalEstimatedHours: 0,
    totalTimeLogged: 0,
    totalSubtasks: 0,
    completedSubtasks: 0,
    subtaskCompletionRate: 0,
    priorityBreakdown: { Low: 0, Medium: 0, High: 0, Urgent: 0 },
    categoryBreakdown: {},
    assigneeBreakdown: {},
    techStackBreakdown: {},
    prStatusBreakdown: { Open: 0, Merged: 0, 'Failed CI/CD': 0, Draft: 0 },
    velocityLast7Days: [],
    contributionHeatmap: { totalContributions: 0, currentStreak: 0, longestStreak: 0, days: [] },
  });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // Active Filters & Sorting
  const [filterStatus, setFilterStatus] = useState('All');
  const [filterPriority, setFilterPriority] = useState('All');
  const [filterCategory, setFilterCategory] = useState('All');
  const [filterAssignee, setFilterAssignee] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('createdAt_desc');
  const [activeView, setActiveView] = useState('kanban'); // 'kanban' | 'list' | 'calendar' | 'analytics'

  const triggerCelebration = () => {
    try {
      confetti({
        particleCount: 65,
        spread: 60,
        origin: { y: 0.75 },
      });
    } catch (e) {}
  };

  const fetchStats = useCallback(async () => {
    if (!isAuthenticated) return;
    try {
      const res = await tasksAPI.getStats(token, user?._id);
      if (res?.data) {
        setStats(res.data);
      }
    } catch (err) {
      console.warn('[TaskContext] Error fetching stats:', err.message);
    }
  }, [token, user, isAuthenticated]);

  const fetchTasks = useCallback(async () => {
    if (!isAuthenticated) return;
    setIsLoading(true);
    try {
      const params = {
        status: filterStatus,
        priority: filterPriority,
        category: filterCategory,
        assignee: filterAssignee,
        search: searchQuery,
        sortBy: sortBy,
      };

      const res = await tasksAPI.getAll(params, token, user?._id);
      if (res?.data) {
        setTasks(res.data);
      }
      fetchStats();
    } catch (err) {
      setError(err.message || 'Failed to load tasks');
    } finally {
      setIsLoading(false);
    }
  }, [
    filterStatus,
    filterPriority,
    filterCategory,
    filterAssignee,
    searchQuery,
    sortBy,
    token,
    user,
    isAuthenticated,
    fetchStats,
  ]);

  useEffect(() => {
    if (isAuthenticated) {
      fetchTasks();
    } else {
      setTasks([]);
      setIsLoading(false);
    }
  }, [isAuthenticated, fetchTasks]);

  // Create Task
  const createTask = async (taskData) => {
    setError(null);
    const currentUserName = user?.name || 'Alex Morgan';
    try {
      const res = await tasksAPI.create(taskData, token, user?._id, currentUserName);
      if (res?.data) {
        setTasks((prev) => [res.data, ...prev]);
        fetchStats();
      }
      return { success: true, task: res?.data };
    } catch (err) {
      setError(err.message || 'Failed to create task');
      return { success: false, message: err.message };
    }
  };

  // Update Task
  const updateTask = async (id, taskData) => {
    setError(null);
    const currentUserName = user?.name || 'Alex Morgan';
    try {
      const res = await tasksAPI.update(id, taskData, token, user?._id, currentUserName);
      if (res?.data) {
        setTasks((prev) => prev.map((t) => (t._id === id ? { ...t, ...res.data } : t)));
        fetchStats();
        if (taskData.status === 'Completed') {
          triggerCelebration();
        }
      }
      return { success: true, task: res?.data };
    } catch (err) {
      setError(err.message || 'Failed to update task');
      return { success: false, message: err.message };
    }
  };

  // Delete Task
  const deleteTask = async (id) => {
    setError(null);
    try {
      await tasksAPI.delete(id, token);
      setTasks((prev) => prev.filter((t) => t._id !== id));
      fetchStats();
      return { success: true };
    } catch (err) {
      setError(err.message || 'Failed to delete task');
      return { success: false, message: err.message };
    }
  };

  // Move Status (Kanban / List)
  const moveTaskStatus = async (id, newStatus) => {
    setTasks((prev) =>
      prev.map((t) => (t._id === id ? { ...t, status: newStatus } : t))
    );

    if (newStatus === 'Completed') {
      triggerCelebration();
    }

    try {
      await tasksAPI.update(id, { status: newStatus }, token, user?._id, user?.name);
      fetchStats();
    } catch (err) {
      fetchTasks();
    }
  };

  // Toggle Subtask
  const toggleSubtask = async (taskId, subtaskId) => {
    const targetTask = tasks.find((t) => t._id === taskId);
    if (!targetTask) return;

    const updatedSubtasks = (targetTask.subtasks || []).map((s) => {
      if ((s._id || s.id) === subtaskId) {
        return { ...s, completed: !s.completed };
      }
      return s;
    });

    // Check if all subtasks are now completed
    const allDone = updatedSubtasks.length > 0 && updatedSubtasks.every((s) => s.completed);

    const payload = { subtasks: updatedSubtasks };
    if (allDone && targetTask.status !== 'Completed') {
      payload.status = 'Completed';
      triggerCelebration();
    }

    await updateTask(taskId, payload);
  };

  // Add Comment
  const addComment = async (taskId, text) => {
    const currentUserName = user?.name || 'Alex Morgan';
    try {
      const res = await tasksAPI.addComment(taskId, text, token, currentUserName);
      if (res?.task) {
        setTasks((prev) => prev.map((t) => (t._id === taskId ? res.task : t)));
      } else {
        fetchTasks();
      }
      return { success: true };
    } catch (err) {
      return { success: false, message: err.message };
    }
  };

  // Delete Comment
  const deleteComment = async (taskId, commentId) => {
    try {
      const res = await tasksAPI.deleteComment(taskId, commentId, token);
      if (res?.data) {
        setTasks((prev) => prev.map((t) => (t._id === taskId ? res.data : t)));
      } else {
        fetchTasks();
      }
      return { success: true };
    } catch (err) {
      return { success: false, message: err.message };
    }
  };

  // Log Time
  const logTime = async (taskId, hours) => {
    const currentUserName = user?.name || 'Alex Morgan';
    try {
      const res = await tasksAPI.logTime(taskId, hours, token, currentUserName);
      if (res?.data) {
        setTasks((prev) => prev.map((t) => (t._id === taskId ? res.data : t)));
        fetchStats();
      }
      return { success: true };
    } catch (err) {
      return { success: false, message: err.message };
    }
  };

  // AI Breakdown
  const requestAIBreakdown = async (title, description) => {
    return await tasksAPI.breakdownAI(title, description, token);
  };

  // AI Parse NLP Prompt
  const requestNLPParse = async (prompt) => {
    return await tasksAPI.parseNLP(prompt, token);
  };

  const resetDemoTasks = () => {
    tasksAPI.resetDemoData();
    fetchTasks();
  };

  const availableCategories = Array.from(
    new Set([
      'General',
      'Engineering',
      'Design',
      'Marketing',
      'DevOps',
      'QA',
      'Research',
      ...tasks.map((t) => t.category).filter(Boolean),
    ])
  );

  return (
    <TaskContext.Provider
      value={{
        tasks,
        stats,
        isLoading,
        error,
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
        fetchTasks,
        fetchStats,
        createTask,
        updateTask,
        deleteTask,
        moveTaskStatus,
        toggleSubtask,
        addComment,
        deleteComment,
        logTime,
        requestAIBreakdown,
        requestNLPParse,
        resetDemoTasks,
      }}
    >
      {children}
    </TaskContext.Provider>
  );
};

export const useTasks = () => {
  const context = useContext(TaskContext);
  if (!context) throw new Error('useTasks must be used within TaskProvider');
  return context;
};
