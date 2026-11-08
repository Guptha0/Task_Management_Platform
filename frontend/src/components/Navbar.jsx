import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useTasks } from '../context/TaskContext';
import {
  CheckSquare,
  LogOut,
  Plus,
  RefreshCw,
  Server,
  Zap,
  User as UserIcon,
  RotateCcw,
  FileText,
  Code2,
} from 'lucide-react';
import { GithubIcon, LinkedinIcon } from './SocialIcons';

const Navbar = ({ onOpenCreateModal, onOpenProfileModal }) => {
  const { user, logout, isBackendConnected, refreshConnection } = useAuth();
  const { resetDemoTasks } = useTasks();
  const [isChecking, setIsChecking] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);

  const handleRefreshConnection = async () => {
    setIsChecking(true);
    await refreshConnection();
    setTimeout(() => setIsChecking(false), 600);
  };

  return (
    <header className="sticky top-0 z-30 bg-white/90 backdrop-blur-md border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo & Brand */}
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-gradient-to-tr from-indigo-600 to-indigo-500 flex items-center justify-center text-white shadow-md shadow-indigo-200">
              <CheckSquare className="h-5 w-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xl font-bold tracking-tight text-slate-900">
                  TaskFlow<span className="text-indigo-600">Pro</span>
                </span>
                <span className="hidden sm:inline-block text-[10px] font-semibold uppercase tracking-wider bg-indigo-50 text-indigo-700 px-2 py-0.5 rounded-full border border-indigo-200/60">
                  v1.0
                </span>
              </div>
              <p className="text-xs text-slate-500 hidden md:block">
                Production Full-Stack Task Workspace
              </p>
            </div>
          </div>

          {/* Center: Smart Hybrid Mode Badge */}
          <div className="flex items-center gap-2">
            <button
              onClick={handleRefreshConnection}
              title="Click to test backend connection"
              aria-label="Test backend connection"
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-all duration-200 border ${
                isBackendConnected
                  ? 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100'
                  : 'bg-amber-50 text-amber-800 border-amber-200 hover:bg-amber-100'
              }`}
            >
              {isBackendConnected ? (
                <>
                  <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                  </span>
                  <Server className="h-3.5 w-3.5 text-emerald-600 hidden sm:inline" />
                  <span>REST API Connected</span>
                </>
              ) : (
                <>
                  <Zap className="h-3.5 w-3.5 text-amber-600" />
                  <span>Hybrid LocalStorage Mode</span>
                </>
              )}
              <RefreshCw
                className={`h-3 w-3 text-slate-400 hover:text-slate-600 ml-1 ${
                  isChecking ? 'animate-spin' : ''
                }`}
              />
            </button>

            {/* Quick Reset Demo Data button */}
            <button
              onClick={() => {
                if (window.confirm('Reset sample demo tasks to initial state?')) {
                  resetDemoTasks();
                }
              }}
              title="Reset sample tasks"
              aria-label="Reset sample tasks"
              className="hidden lg:flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-medium text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors border border-slate-200"
            >
              <RotateCcw className="h-3 w-3" />
              <span>Reset Data</span>
            </button>
          </div>

          {/* Right Action Controls */}
          <div className="flex items-center gap-2.5 sm:gap-3">
            {/* Quick Developer Social Badges */}
            <div className="hidden xl:flex items-center gap-1.5 border-r border-slate-200 pr-3 mr-0.5">
              {user?.githubUrl && (
                <a
                  href={user.githubUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  title={`GitHub: ${user.githubUsername || user.name}`}
                  className="p-1.5 rounded-lg text-slate-600 hover:text-slate-950 hover:bg-slate-100 transition-colors"
                >
                  <GithubIcon className="h-4 w-4" />
                </a>
              )}
              {user?.linkedinUrl && (
                <a
                  href={user.linkedinUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  title="LinkedIn Profile"
                  className="p-1.5 rounded-lg text-slate-600 hover:text-sky-600 hover:bg-sky-50 transition-colors"
                >
                  <LinkedinIcon className="h-4 w-4" />
                </a>
              )}
              <button
                onClick={onOpenProfileModal}
                className="flex items-center gap-1 text-[11px] font-semibold text-indigo-600 bg-indigo-50 hover:bg-indigo-100 px-2.5 py-1 rounded-lg border border-indigo-200/60 transition-colors"
                title="Open Developer Hub & Portfolio"
              >
                <Code2 className="h-3 w-3" />
                <span>Dev Profile</span>
              </button>
            </div>

            {/* Create Task Button */}
            <button
              onClick={onOpenCreateModal}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-indigo-600 text-white text-xs sm:text-sm font-semibold hover:bg-indigo-700 active:scale-95 shadow-sm shadow-indigo-200 transition-all"
            >
              <Plus className="h-4 w-4" />
              <span className="hidden sm:inline">New Task</span>
            </button>

            {/* User Profile Dropdown */}
            <div className="relative">
              <button
                onClick={() => setShowProfileMenu(!showProfileMenu)}
                className="flex items-center gap-2 p-1.5 sm:px-3 sm:py-1.5 rounded-xl border border-slate-200 hover:bg-slate-50 transition-colors text-slate-700 text-sm font-medium"
              >
                <div className="h-7 w-7 rounded-lg bg-indigo-100 text-indigo-700 flex items-center justify-center font-bold text-xs uppercase">
                  {user?.name ? user.name.charAt(0) : 'U'}
                </div>
                <div className="hidden md:block text-left">
                  <div className="text-xs font-semibold text-slate-900 leading-tight">
                    {user?.name || 'Alex Morgan'}
                  </div>
                  <div className="text-[11px] text-slate-500 leading-tight">
                    {user?.email || 'demo@taskflow.com'}
                  </div>
                </div>
              </button>

              {/* Profile Menu Dropdown */}
              {showProfileMenu && (
                <div
                  className="absolute right-0 mt-2 w-64 rounded-2xl bg-white shadow-xl border border-slate-100 py-2 animate-fade-in z-50"
                  onMouseLeave={() => setShowProfileMenu(false)}
                >
                  <div className="px-4 py-2 border-b border-slate-100">
                    <p className="text-[11px] text-slate-400 uppercase tracking-wider font-semibold">
                      Signed in as
                    </p>
                    <p className="text-sm font-bold text-slate-800 truncate">
                      {user?.name || 'Demo User'}
                    </p>
                    <p className="text-xs text-slate-500 truncate">
                      {user?.email || 'demo@taskflow.com'}
                    </p>
                  </div>

                  <div className="px-2 py-1.5 space-y-1">
                    <button
                      onClick={() => {
                        setShowProfileMenu(false);
                        if (onOpenProfileModal) onOpenProfileModal();
                      }}
                      className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-indigo-50 hover:text-indigo-700 rounded-xl transition-colors"
                    >
                      <Code2 className="h-4 w-4 text-indigo-500" />
                      <span>Developer Profile & Socials</span>
                    </button>

                    <button
                      onClick={() => {
                        setShowProfileMenu(false);
                        if (onOpenProfileModal) onOpenProfileModal();
                      }}
                      className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-emerald-50 hover:text-emerald-700 rounded-xl transition-colors"
                    >
                      <FileText className="h-4 w-4 text-emerald-500" />
                      <span>Export Resume / Portfolio PDF</span>
                    </button>
                  </div>

                  <div className="px-2 pt-1 border-t border-slate-100">
                    <button
                      onClick={() => {
                        setShowProfileMenu(false);
                        logout();
                      }}
                      className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-semibold text-rose-600 hover:bg-rose-50 rounded-xl transition-colors"
                    >
                      <LogOut className="h-4 w-4" />
                      Sign Out
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Navbar;
