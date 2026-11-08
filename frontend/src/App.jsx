import React, { useState } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { TaskProvider, useTasks } from './context/TaskContext';
import Navbar from './components/Navbar';
import PipelineStatusBar from './components/PipelineStatusBar';
import ContributionHeatmap from './components/ContributionHeatmap';
import DeveloperProfileModal from './components/DeveloperProfileModal';
import KPICards from './components/KPICards';
import TaskToolbar from './components/TaskToolbar';
import AITaskCreator from './components/AITaskCreator';
import KanbanBoard from './components/KanbanBoard';
import TaskListView from './components/TaskListView';
import CalendarView from './components/CalendarView';
import TaskAnalytics from './components/TaskAnalytics';
import TaskModal from './components/TaskModal';
import Login from './components/Auth/Login';
import Register from './components/Auth/Register';
import { CheckSquare, Loader2, Plus } from 'lucide-react';

const DashboardContent = () => {
  const { activeView, isLoading } = useTasks();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [taskToEdit, setTaskToEdit] = useState(null);
  const [initialStatus, setInitialStatus] = useState('To Do');
  const [initialDueDate, setInitialDueDate] = useState(null);

  const handleOpenCreateModal = (status = 'To Do', dueDate = null) => {
    setTaskToEdit(null);
    setInitialStatus(status);
    setInitialDueDate(dueDate);
    setIsModalOpen(true);
  };

  const handleEditTask = (task) => {
    setTaskToEdit(task);
    setInitialDueDate(null);
    setIsModalOpen(true);
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <Navbar
        onOpenCreateModal={() => handleOpenCreateModal('To Do')}
        onOpenProfileModal={() => setIsProfileModalOpen(true)}
      />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        {/* DevOps CI/CD Persistent Status Bar */}
        <PipelineStatusBar />

        {/* KPI Summary Cards */}
        <KPICards />

        {/* 52-Week GitHub-style Contribution Heatmap */}
        <ContributionHeatmap />

        {/* TaskBot AI Copilot: Natural Language Task Creator */}
        <AITaskCreator />

        {/* Toolbar: Search, Filter, Sort, View Toggle */}
        <TaskToolbar onOpenCreateModal={() => handleOpenCreateModal('To Do')} />

        {/* Main Workspace Views */}
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-20">
            <Loader2 className="h-8 w-8 text-indigo-600 animate-spin mb-3" />
            <p className="text-sm font-semibold text-slate-500">Syncing task workspace...</p>
          </div>
        ) : (
          <div className="animate-fade-in">
            {activeView === 'kanban' && (
              <KanbanBoard
                onEditTask={handleEditTask}
                onOpenCreateWithStatus={(status) => handleOpenCreateModal(status)}
              />
            )}

            {activeView === 'list' && (
              <TaskListView onEditTask={handleEditTask} />
            )}

            {activeView === 'calendar' && (
              <CalendarView
                onEditTask={handleEditTask}
                onOpenCreateForDate={(dateStr) => handleOpenCreateModal('To Do', dateStr)}
              />
            )}

            {activeView === 'analytics' && <TaskAnalytics />}
          </div>
        )}
      </main>

      {/* Task Create / Edit Modal */}
      <TaskModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setTaskToEdit(null);
          setInitialDueDate(null);
        }}
        taskToEdit={taskToEdit}
        initialStatus={initialStatus}
        initialDueDate={initialDueDate}
      />

      {/* Developer Profile & Portfolio Resume Modal */}
      <DeveloperProfileModal
        isOpen={isProfileModalOpen}
        onClose={() => setIsProfileModalOpen(false)}
      />

      {/* Floating Action Button on Mobile */}
      <div className="fixed bottom-6 right-6 sm:hidden z-20">
        <button
          onClick={() => handleOpenCreateModal('To Do')}
          className="h-14 w-14 rounded-full bg-indigo-600 text-white shadow-xl flex items-center justify-center active:scale-95"
        >
          <Plus className="h-6 w-6" />
        </button>
      </div>
    </div>
  );
};

const MainRouter = () => {
  const { isAuthenticated, isLoading } = useAuth();
  const [authView, setAuthView] = useState('login'); // 'login' | 'register'

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-900 flex flex-col items-center justify-center text-white p-4">
        <div className="h-12 w-12 rounded-2xl bg-indigo-600 flex items-center justify-center mb-4 shadow-lg shadow-indigo-500/30 animate-bounce">
          <CheckSquare className="h-6 w-6" />
        </div>
        <p className="text-lg font-bold tracking-tight">TaskFlow Pro</p>
        <p className="text-xs text-indigo-300 mt-1">Initializing environment...</p>
      </div>
    );
  }

  if (!isAuthenticated) {
    return authView === 'login' ? (
      <Login onSwitchToRegister={() => setAuthView('register')} />
    ) : (
      <Register onSwitchToLogin={() => setAuthView('login')} />
    );
  }

  return (
    <TaskProvider>
      <DashboardContent />
    </TaskProvider>
  );
};

export default function App() {
  return (
    <AuthProvider>
      <MainRouter />
    </AuthProvider>
  );
}
