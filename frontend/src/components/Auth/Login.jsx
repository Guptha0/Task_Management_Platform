import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import {
  CheckSquare,
  Lock,
  Mail,
  Zap,
  ArrowRight,
  ShieldCheck,
  Sparkles,
  Server,
} from 'lucide-react';

const Login = ({ onSwitchToRegister }) => {
  const { login, loginAsDemo, isBackendConnected } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDemoLoading, setIsDemoLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');

    if (!email || !password) {
      setErrorMsg('Please enter both email and password.');
      return;
    }

    setIsSubmitting(true);
    const result = await login(email, password);
    setIsSubmitting(false);

    if (!result.success) {
      setErrorMsg(result.message || 'Invalid credentials.');
    }
  };

  const handleDemoLogin = async () => {
    setIsDemoLoading(true);
    setErrorMsg('');
    await loginAsDemo();
    setIsDemoLoading(false);
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4 sm:p-6 lg:p-8">
      <div className="max-w-4xl w-full bg-white rounded-3xl shadow-xl border border-slate-200/80 overflow-hidden grid grid-cols-1 md:grid-cols-2">
        {/* Left: Branding & Feature Highlights */}
        <div className="bg-gradient-to-br from-indigo-900 via-indigo-800 to-indigo-950 p-8 sm:p-10 text-white flex flex-col justify-between relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />

          {/* Top Logo */}
          <div className="relative z-10">
            <div className="h-12 w-12 rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center text-white mb-6 shadow-inner">
              <CheckSquare className="h-6 w-6 text-indigo-300" />
            </div>
            <div className="flex items-center gap-2 mb-1">
              <h1 className="text-2xl font-black tracking-tight">
                TaskFlow <span className="text-indigo-400">Pro</span>
              </h1>
              <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-200 border border-indigo-400/30">
                Full-Stack
              </span>
            </div>
            <p className="text-sm text-indigo-200">
              Next-generation task operations with Kanban, telemetry analytics, and smart offline sync.
            </p>
          </div>

          {/* Feature List */}
          <div className="relative z-10 my-8 space-y-4">
            <div className="flex items-start gap-3">
              <div className="h-7 w-7 rounded-lg bg-indigo-500/20 flex items-center justify-center text-indigo-300 shrink-0 mt-0.5">
                <Sparkles className="h-4 w-4" />
              </div>
              <div>
                <p className="text-xs font-bold text-white">Full Kanban Drag & Drop</p>
                <p className="text-[11px] text-indigo-200">Fluid card reordering with quick status buttons.</p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="h-7 w-7 rounded-lg bg-indigo-500/20 flex items-center justify-center text-indigo-300 shrink-0 mt-0.5">
                <Zap className="h-4 w-4" />
              </div>
              <div>
                <p className="text-xs font-bold text-white">Smart Hybrid Fallback</p>
                <p className="text-[11px] text-indigo-200">Runs against live Express/MongoDB or static LocalStorage.</p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="h-7 w-7 rounded-lg bg-indigo-500/20 flex items-center justify-center text-indigo-300 shrink-0 mt-0.5">
                <ShieldCheck className="h-4 w-4" />
              </div>
              <div>
                <p className="text-xs font-bold text-white">Secure JWT Authentication</p>
                <p className="text-[11px] text-indigo-200">Bcrypt password hashing and route protection.</p>
              </div>
            </div>
          </div>

          {/* Bottom Connection Status */}
          <div className="relative z-10 pt-4 border-t border-white/10 flex items-center justify-between text-xs text-indigo-200">
            <span className="flex items-center gap-1.5 font-medium">
              <span
                className={`h-2 w-2 rounded-full ${
                  isBackendConnected ? 'bg-emerald-400 animate-pulse' : 'bg-amber-400'
                }`}
              />
              {isBackendConnected ? 'REST API Active' : 'Hybrid Local Mode Active'}
            </span>
            <span className="text-[11px] text-indigo-300">Ready to test</span>
          </div>
        </div>

        {/* Right: Login Form & One-Click Demo */}
        <div className="p-8 sm:p-10 flex flex-col justify-center">
          <div className="mb-6">
            <h2 className="text-2xl font-bold text-slate-900 tracking-tight">Welcome back</h2>
            <p className="text-xs text-slate-500 mt-1">
              Sign in to manage your tasks or test instantly with one click.
            </p>
          </div>

          {/* Quick Demo Login Hero Button */}
          <button
            type="button"
            onClick={handleDemoLogin}
            disabled={isDemoLoading || isSubmitting}
            className="w-full mb-6 p-3 rounded-2xl bg-gradient-to-r from-indigo-50 to-indigo-100/70 border border-indigo-200 hover:border-indigo-300 text-indigo-900 flex items-center justify-between group transition-all shadow-sm hover:shadow"
          >
            <div className="flex items-center gap-3">
              <div className="h-9 w-9 rounded-xl bg-indigo-600 text-white flex items-center justify-center group-hover:scale-105 transition-transform shadow-sm">
                <Zap className="h-4.5 w-4.5 fill-white" />
              </div>
              <div className="text-left">
                <div className="text-xs font-bold flex items-center gap-1.5 text-indigo-950">
                  One-Click Demo Login
                  <span className="bg-indigo-600 text-white text-[9px] px-1.5 py-0.2 rounded-full font-extrabold uppercase">
                    Instant
                  </span>
                </div>
                <div className="text-[11px] text-indigo-700/80 font-medium">
                  demo@taskflow.com • pre-seeded data
                </div>
              </div>
            </div>
            <ArrowRight className="h-4 w-4 text-indigo-600 group-hover:translate-x-1 transition-transform mr-1" />
          </button>

          <div className="relative my-3 flex items-center justify-center">
            <div className="border-t border-slate-200 w-full" />
            <span className="bg-white px-3 text-[11px] font-semibold text-slate-400 uppercase tracking-wider absolute">
              Or sign in with email
            </span>
          </div>

          {errorMsg && (
            <div className="mb-4 p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-medium">
              {errorMsg}
            </div>
          )}

          {/* Login Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="login-email" className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">
                Email Address
              </label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                <input
                  id="login-email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="alex@company.com"
                  className="w-full pl-10 pr-3.5 py-2.5 rounded-xl text-sm border border-slate-200 bg-slate-50/50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all font-medium"
                />
              </div>
            </div>

            <div>
              <label htmlFor="login-password" className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                <input
                  id="login-password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-10 pr-3.5 py-2.5 rounded-xl text-sm border border-slate-200 bg-slate-50/50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all font-medium"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isSubmitting || isDemoLoading}
              className="w-full py-2.5 rounded-xl bg-indigo-600 text-white text-sm font-semibold hover:bg-indigo-700 active:scale-95 shadow-md shadow-indigo-200 transition-all flex items-center justify-center gap-2"
            >
              {isSubmitting ? 'Signing in...' : 'Sign In'}
            </button>
          </form>

          {/* Footer Link */}
          <div className="mt-6 text-center text-xs text-slate-500">
            Don't have an account yet?{' '}
            <button
              onClick={onSwitchToRegister}
              className="text-indigo-600 font-bold hover:underline ml-1"
            >
              Create Account
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
