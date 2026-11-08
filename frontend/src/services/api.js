/**
 * TaskFlow Pro — Smart Hybrid API Service Layer (Collaborative Suite Edition)
 * Automatically uses Express/MongoDB REST API when available,
 * and gracefully falls back to persistent localStorage with pre-seeded collaborative data
 * when offline or hosted statically on Vercel/Netlify.
 */

import { TEAM_MEMBERS } from './team';
import { parseNaturalLanguage, generateAIBreakdown } from './aiCopilot';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
const TIMEOUT_MS = 3000;

const STORAGE_KEYS = {
  TOKEN: 'taskflow_token',
  USER: 'taskflow_user',
  TASKS: 'taskflow_tasks_store_v2', // Updated key for collaborative schema
  USERS: 'taskflow_users_store',
  OFFLINE_MODE: 'taskflow_offline_mode',
};

const getSampleDate = (daysOffset) => {
  const d = new Date();
  d.setDate(d.getDate() + daysOffset);
  return d.toISOString();
};

// Initial Seed Tasks for LocalStorage Fallback (with rich collaborative data)
export const DEFAULT_SEED_TASKS = [
  {
    _id: 'seed-task-1',
    user: 'demo-user-id',
    title: 'Design high-converting Landing Page hero section',
    description: 'Create responsive Figma wireframes with high-contrast CTA, dark-mode preview, and interactive states.',
    status: 'Completed',
    priority: 'High',
    category: 'Design',
    dueDate: getSampleDate(-3),
    assignee: TEAM_MEMBERS[1], // Sarah Chen
    storyPoints: 5,
    techStack: ['React', 'Tailwind CSS', 'Figma'],
    linkedPR: {
      number: 38,
      title: 'feat: hero section & responsive layout',
      url: 'https://github.com/developer/taskflow-pro/pull/38',
      status: 'Merged',
    },
    commitHash: '8f2a1b9',
    estimatedHours: 8,
    timeLogged: 7.5,
    subtasks: [
      { id: 'sub-1-1', title: 'Define brand color palette and typography scales in Figma', completed: true },
      { id: 'sub-1-2', title: 'Create low-fidelity layout wireframes for mobile & desktop', completed: true },
      { id: 'sub-1-3', title: 'Render high-fidelity hero graphics with glassmorphic cards', completed: true },
      { id: 'sub-1-4', title: 'Conduct design review with @alex and export SVG assets', completed: true },
    ],
    comments: [
      {
        id: 'comm-1-1',
        user: 'sarah-id',
        userName: 'Sarah Chen',
        userAvatar: 'SC',
        text: 'Wireframes have been updated in Figma. @Alex Morgan please inspect the hero illustration contrast ratio!',
        createdAt: getSampleDate(-4),
      },
      {
        id: 'comm-1-2',
        user: 'demo-user-id',
        userName: 'Alex Morgan',
        userAvatar: 'AM',
        text: 'Approved! The dark-mode preview looks exceptional. Ready for frontend handoff.',
        createdAt: getSampleDate(-3),
      },
    ],
    activityLog: [
      { id: 'act-1-1', action: 'changed status', field: 'status', from: 'In Progress', to: 'Completed', user: 'Sarah Chen', timestamp: getSampleDate(-3) },
      { id: 'act-1-2', action: 'logged time', field: 'timeLogged', from: '4h', to: '7.5h', user: 'Sarah Chen', timestamp: getSampleDate(-3) },
      { id: 'act-1-3', action: 'commented', field: 'comment', from: '', to: 'Approved! The dark-mode preview...', user: 'Alex Morgan', timestamp: getSampleDate(-3) },
      { id: 'act-1-4', action: 'created', field: 'task', from: '', to: 'Design high-converting Landing Page hero section', user: 'Alex Morgan', timestamp: getSampleDate(-5) },
    ],
    createdAt: getSampleDate(-5),
    updatedAt: getSampleDate(-3),
  },
  {
    _id: 'seed-task-2',
    user: 'demo-user-id',
    title: 'Architect JWT Authentication & Role-Based Middleware',
    description: 'Implement token signing, cookie storage security, and bcrypt hashing for user credentials with bearer validation.',
    status: 'Completed',
    priority: 'High',
    category: 'Engineering',
    dueDate: getSampleDate(-1),
    assignee: TEAM_MEMBERS[2], // David Miller
    storyPoints: 8,
    techStack: ['Node.js', 'Express', 'JWT', 'bcryptjs'],
    linkedPR: {
      number: 41,
      title: 'feat: jwt auth & role-based middleware',
      url: 'https://github.com/developer/taskflow-pro/pull/41',
      status: 'Merged',
    },
    commitHash: '4d9e2a3',
    estimatedHours: 6,
    timeLogged: 6,
    subtasks: [
      { id: 'sub-2-1', title: 'Configure jsonwebtoken signing with 30-day expiration', completed: true },
      { id: 'sub-2-2', title: 'Implement bcrypt salt hashing on User schema pre-save', completed: true },
      { id: 'sub-2-3', title: 'Create protect route middleware with authorization headers', completed: true },
      { id: 'sub-2-4', title: 'Add test suite covering expired and malformed tokens', completed: true },
    ],
    comments: [
      {
        id: 'comm-2-1',
        user: 'david-id',
        userName: 'David Miller',
        userAvatar: 'DM',
        text: 'Middleware completed with 100% test coverage. Passwords hashed with 10 salt rounds.',
        createdAt: getSampleDate(-1),
      },
    ],
    activityLog: [
      { id: 'act-2-1', action: 'changed status', field: 'status', from: 'In Progress', to: 'Completed', user: 'David Miller', timestamp: getSampleDate(-1) },
      { id: 'act-2-2', action: 'logged time', field: 'timeLogged', from: '3h', to: '6h', user: 'David Miller', timestamp: getSampleDate(-1) },
      { id: 'act-2-3', action: 'created', field: 'task', from: '', to: 'Architect JWT Authentication', user: 'Alex Morgan', timestamp: getSampleDate(-4) },
    ],
    createdAt: getSampleDate(-4),
    updatedAt: getSampleDate(-1),
  },
  {
    _id: 'seed-task-3',
    user: 'demo-user-id',
    title: 'Build Interactive Kanban Board with Native Drag & Drop',
    description: 'Ensure smooth status transitions between To Do, In Progress, and Completed columns with optimistic UI updates.',
    status: 'In Progress',
    priority: 'Urgent',
    category: 'Engineering',
    dueDate: getSampleDate(0), // Due Today!
    assignee: TEAM_MEMBERS[3], // Priya Patel
    storyPoints: 5,
    techStack: ['React', 'HTML5 DnD', 'Lucide'],
    linkedPR: {
      number: 45,
      title: 'feat: native kanban drag & drop reordering',
      url: 'https://github.com/developer/taskflow-pro/pull/45',
      status: 'Open',
    },
    commitHash: '7c1b8e4',
    estimatedHours: 10,
    timeLogged: 6.5,
    subtasks: [
      { id: 'sub-3-1', title: 'Implement HTML5 drag event listeners on task cards', completed: true },
      { id: 'sub-3-2', title: 'Build drop target boundary highlights for Kanban columns', completed: true },
      { id: 'sub-3-3', title: 'Add optimistic UI reordering with immediate local state update', completed: true },
      { id: 'sub-3-4', title: 'Add touch-friendly status shift chevron buttons for mobile screens', completed: false },
      { id: 'sub-3-5', title: 'Integrate celebratory confetti trigger on completion', completed: true },
    ],
    comments: [
      {
        id: 'comm-3-1',
        user: 'priya-id',
        userName: 'Priya Patel',
        userAvatar: 'PP',
        text: 'Drag and drop is silky smooth! Working on mobile touch gestures now.',
        createdAt: new Date().toISOString(),
      },
    ],
    activityLog: [
      { id: 'act-3-1', action: 'logged time', field: 'timeLogged', from: '4h', to: '6.5h', user: 'Priya Patel', timestamp: new Date().toISOString() },
      { id: 'act-3-2', action: 'changed status', field: 'status', from: 'To Do', to: 'In Progress', user: 'Priya Patel', timestamp: getSampleDate(-1) },
      { id: 'act-3-3', action: 'created', field: 'task', from: '', to: 'Build Interactive Kanban Board', user: 'Alex Morgan', timestamp: getSampleDate(-2) },
    ],
    createdAt: getSampleDate(-2),
    updatedAt: new Date().toISOString(),
  },
  {
    _id: 'seed-task-4',
    user: 'demo-user-id',
    title: 'Audit Web Accessibility (WCAG 2.1 AA Compliance)',
    description: 'Verify focus rings, ARIA landmarks, screen reader descriptions, and color contrast ratios.',
    status: 'In Progress',
    priority: 'Medium',
    category: 'QA',
    dueDate: getSampleDate(2),
    assignee: TEAM_MEMBERS[5], // Elena Rostova
    storyPoints: 3,
    techStack: ['WCAG', 'Jest', 'Accessibility'],
    linkedPR: {
      number: 46,
      title: 'fix: aria-labels and keyboard focus traps',
      url: 'https://github.com/developer/taskflow-pro/pull/46',
      status: 'Open',
    },
    commitHash: '2a5f9c0',
    estimatedHours: 5,
    timeLogged: 2,
    subtasks: [
      { id: 'sub-4-1', title: 'Run axe DevTools accessibility scan on all primary routes', completed: true },
      { id: 'sub-4-2', title: 'Verify minimum 4.5:1 text-to-background contrast ratio', completed: true },
      { id: 'sub-4-3', title: 'Add keyboard tab-order focus trap inside modal dialogs', completed: false },
      { id: 'sub-4-4', title: 'Test NVDA and VoiceOver screen reader announcements', completed: false },
    ],
    comments: [],
    activityLog: [
      { id: 'act-4-1', action: 'logged time', field: 'timeLogged', from: '0h', to: '2h', user: 'Elena Rostova', timestamp: getSampleDate(-1) },
      { id: 'act-4-2', action: 'changed status', field: 'status', from: 'To Do', to: 'In Progress', user: 'Elena Rostova', timestamp: getSampleDate(-1) },
    ],
    createdAt: getSampleDate(-2),
    updatedAt: new Date().toISOString(),
  },
  {
    _id: 'seed-task-5',
    user: 'demo-user-id',
    title: 'Optimize MongoDB compound indices for telemetry query',
    description: 'Run explain() analysis on user + status and user + priority queries to ensure sub-10ms response.',
    status: 'To Do',
    priority: 'Urgent',
    category: 'DevOps',
    dueDate: getSampleDate(-2), // 2 days ago (Overdue!)
    assignee: TEAM_MEMBERS[4], // Marcus Vance
    storyPoints: 5,
    techStack: ['MongoDB', 'Docker', 'Linux'],
    linkedPR: {
      number: 47,
      title: 'perf: compound indexes for sub-10ms queries',
      url: 'https://github.com/developer/taskflow-pro/pull/47',
      status: 'Failed CI/CD',
    },
    commitHash: '6e3d1a8',
    estimatedHours: 4,
    timeLogged: 0.5,
    subtasks: [
      { id: 'sub-5-1', title: 'Execute query performance benchmarks with 10k documents', completed: true },
      { id: 'sub-5-2', title: 'Index user and status compound fields in MongoDB', completed: false },
      { id: 'sub-5-3', title: 'Benchmark post-indexing telemetry endpoint response time', completed: false },
    ],
    comments: [
      {
        id: 'comm-5-1',
        user: 'marcus-id',
        userName: 'Marcus Vance',
        userAvatar: 'MV',
        text: 'Started initial explain() analysis. Currently noticing an unindexed COLLSCAN on status queries.',
        createdAt: getSampleDate(-1),
      },
    ],
    activityLog: [
      { id: 'act-5-1', action: 'reassigned', field: 'assignee', from: 'Unassigned', to: 'Marcus Vance', user: 'Alex Morgan', timestamp: getSampleDate(-2) },
      { id: 'act-5-2', action: 'created', field: 'task', from: '', to: 'Optimize MongoDB compound indices', user: 'Alex Morgan', timestamp: getSampleDate(-3) },
    ],
    createdAt: getSampleDate(-3),
    updatedAt: getSampleDate(-3),
  },
  {
    _id: 'seed-task-6',
    user: 'demo-user-id',
    title: 'Implement AI Productivity Copilot & NLP Task Parsing',
    description: 'Integrate TaskBot AI for automatic checklist generation and natural language prompt decomposition.',
    status: 'In Progress',
    priority: 'High',
    category: 'Engineering',
    dueDate: getSampleDate(1),
    assignee: TEAM_MEMBERS[0], // Alex Morgan
    storyPoints: 8,
    techStack: ['OpenAI', 'TypeScript', 'NLP', 'React'],
    linkedPR: {
      number: 48,
      title: 'feat: taskbot ai natural language parser',
      url: 'https://github.com/developer/taskflow-pro/pull/48',
      status: 'Draft',
    },
    commitHash: '9a3b4c1',
    estimatedHours: 7,
    timeLogged: 4,
    subtasks: [
      { id: 'sub-6-1', title: 'Develop natural language grammar extractor for titles and dates', completed: true },
      { id: 'sub-6-2', title: 'Build AI Task Breakdown generator for modal checklists', completed: true },
      { id: 'sub-6-3', title: 'Connect frontend Copilot quick-bar with instant preview pill', completed: false },
    ],
    comments: [
      {
        id: 'comm-6-1',
        user: 'demo-user-id',
        userName: 'Alex Morgan',
        userAvatar: 'AM',
        text: 'AI parsing parses phrases like "Remind me to fix login by tomorrow at 4pm with high priority" with 100% accuracy!',
        createdAt: new Date().toISOString(),
      },
    ],
    activityLog: [
      { id: 'act-6-1', action: 'logged time', field: 'timeLogged', from: '2h', to: '4h', user: 'Alex Morgan', timestamp: new Date().toISOString() },
      { id: 'act-6-2', action: 'changed status', field: 'status', from: 'To Do', to: 'In Progress', user: 'Alex Morgan', timestamp: getSampleDate(-1) },
    ],
    createdAt: getSampleDate(-1),
    updatedAt: new Date().toISOString(),
  },
  {
    _id: 'seed-task-7',
    user: 'demo-user-id',
    title: 'Prepare Product Launch Announcement & Release Notes',
    description: 'Draft changelog, screenshot carousels, and coordinate distribution to early adopters.',
    status: 'To Do',
    priority: 'Medium',
    category: 'Marketing',
    dueDate: getSampleDate(5),
    assignee: TEAM_MEMBERS[1], // Sarah Chen
    storyPoints: 3,
    techStack: ['Markdown', 'GitBook', 'Docs'],
    linkedPR: null,
    commitHash: '',
    estimatedHours: 4,
    timeLogged: 0,
    subtasks: [
      { id: 'sub-7-1', title: 'Write v1.0 release overview article with feature highlights', completed: false },
      { id: 'sub-7-2', title: 'Record 60-second Loom demonstration of Kanban & AI features', completed: false },
      { id: 'sub-7-3', title: 'Publish update announcement on company blog and social channels', completed: false },
    ],
    comments: [],
    activityLog: [
      { id: 'act-7-1', action: 'created', field: 'task', from: '', to: 'Prepare Product Launch Announcement', user: 'Alex Morgan', timestamp: getSampleDate(-1) },
    ],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    _id: 'seed-task-8',
    user: 'demo-user-id',
    title: 'Benchmark Task Query Telemetry & Real-Time Stats API',
    description: 'Load test telemetry stats endpoint for 1,000 concurrent requests with zero memory leaks.',
    status: 'To Do',
    priority: 'Low',
    category: 'Research',
    dueDate: getSampleDate(8),
    assignee: TEAM_MEMBERS[4], // Marcus Vance
    storyPoints: 5,
    techStack: ['k6', 'Grafana', 'Node.js'],
    linkedPR: null,
    commitHash: '',
    estimatedHours: 5,
    timeLogged: 0,
    subtasks: [
      { id: 'sub-8-1', title: 'Set up k6 load testing configuration script', completed: false },
      { id: 'sub-8-2', title: 'Measure 95th percentile latency under 1,000 requests/sec', completed: false },
      { id: 'sub-8-3', title: 'Generate summary telemetry PDF report', completed: false },
    ],
    comments: [],
    activityLog: [
      { id: 'act-8-1', action: 'created', field: 'task', from: '', to: 'Benchmark Task Query Telemetry', user: 'Alex Morgan', timestamp: new Date().toISOString() },
    ],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
];

const initLocalStorage = () => {
  if (!localStorage.getItem(STORAGE_KEYS.TASKS)) {
    localStorage.setItem(STORAGE_KEYS.TASKS, JSON.stringify(DEFAULT_SEED_TASKS));
  }
  if (!localStorage.getItem(STORAGE_KEYS.USERS)) {
    const demoUsers = [
      {
        _id: 'demo-user-id',
        name: 'Alex Morgan',
        email: 'demo@taskflow.com',
        password: 'password123',
        githubUrl: 'https://github.com/alexmorgan-dev',
        githubUsername: 'alexmorgan-dev',
        bitbucketUrl: 'https://bitbucket.org/alexmorgan/taskflow-core',
        linkedinUrl: 'https://linkedin.com/in/alexmorgandev',
        portfolioUrl: 'https://alexmorgan.dev',
        bio: 'Principal Full-Stack Engineer & DevOps Advocate. Specializing in high-performance cloud architectures, reactive frontends, and automated CI/CD pipelines.',
        skills: ['React', 'Node.js', 'TypeScript', 'MongoDB', 'Docker', 'CI/CD', 'Tailwind CSS', 'Python', 'Verilog'],
        createdAt: new Date().toISOString(),
      },
    ];
    localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(demoUsers));
  }
};

initLocalStorage();

let isBackendReachable = true;
const connectionListeners = new Set();

const notifyConnectionChange = (status) => {
  isBackendReachable = status;
  connectionListeners.forEach((callback) => callback(status));
};

export const subscribeToConnectionState = (callback) => {
  connectionListeners.add(callback);
  callback(isBackendReachable);
  return () => connectionListeners.delete(callback);
};

export const getBackendStatus = () => isBackendReachable;

const fetchWithTimeout = async (url, options = {}, timeout = TIMEOUT_MS) => {
  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), timeout);
  try {
    const response = await fetch(url, { ...options, signal: controller.signal });
    clearTimeout(id);
    return response;
  } catch (error) {
    clearTimeout(id);
    throw error;
  }
};

export const checkBackendHealth = async () => {
  try {
    const res = await fetchWithTimeout(`${API_BASE_URL}/health`, {}, 2000);
    if (res.ok) {
      notifyConnectionChange(true);
      return true;
    }
    notifyConnectionChange(false);
    return false;
  } catch (err) {
    notifyConnectionChange(false);
    return false;
  }
};

const getLocalTasks = (userId) => {
  initLocalStorage();
  const raw = localStorage.getItem(STORAGE_KEYS.TASKS);
  const tasks = raw ? JSON.parse(raw) : [];
  if (!userId) return tasks;
  return tasks.filter((t) => t.user === userId || t.user === 'demo-user-id');
};

const saveLocalTasks = (tasks) => {
  localStorage.setItem(STORAGE_KEYS.TASKS, JSON.stringify(tasks));
};

/* ==========================================================================
   AUTHENTICATION API SERVICE
   ========================================================================== */

export const authAPI = {
  async register({ name, email, password }) {
    try {
      const response = await fetchWithTimeout(`${API_BASE_URL}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || 'Registration failed');
      notifyConnectionChange(true);
      return data;
    } catch (error) {
      notifyConnectionChange(false);
      initLocalStorage();
      const rawUsers = localStorage.getItem(STORAGE_KEYS.USERS);
      const users = rawUsers ? JSON.parse(rawUsers) : [];
      if (users.some((u) => u.email.toLowerCase() === email.toLowerCase())) {
        throw new Error('An account with this email address already exists.');
      }
      const newUser = {
        _id: 'local-user-' + Date.now(),
        name,
        email: email.toLowerCase(),
        password,
        createdAt: new Date().toISOString(),
      };
      users.push(newUser);
      localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(users));
      const fakeToken = 'local-jwt-' + newUser._id;
      return {
        success: true,
        message: 'Account registered locally (Offline Fallback)',
        token: fakeToken,
        user: { _id: newUser._id, name: newUser.name, email: newUser.email, createdAt: newUser.createdAt },
      };
    }
  },

  async login({ email, password }) {
    try {
      const response = await fetchWithTimeout(`${API_BASE_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || 'Login failed');
      notifyConnectionChange(true);
      return data;
    } catch (error) {
      notifyConnectionChange(false);
      initLocalStorage();
      const rawUsers = localStorage.getItem(STORAGE_KEYS.USERS);
      const users = rawUsers ? JSON.parse(rawUsers) : [];
      const user = users.find((u) => u.email.toLowerCase() === email.toLowerCase() && u.password === password);
      if (!user) throw new Error('Invalid email or password credentials.');
      const fakeToken = 'local-jwt-' + user._id;
      return {
        success: true,
        message: 'Logged in locally (Offline Fallback)',
        token: fakeToken,
        user: {
          _id: user._id,
          name: user.name,
          email: user.email,
          githubUrl: user.githubUrl || 'https://github.com/alexmorgan-dev',
          githubUsername: user.githubUsername || 'alexmorgan-dev',
          bitbucketUrl: user.bitbucketUrl || 'https://bitbucket.org/alexmorgan/taskflow-core',
          linkedinUrl: user.linkedinUrl || 'https://linkedin.com/in/alexmorgandev',
          portfolioUrl: user.portfolioUrl || 'https://alexmorgan.dev',
          bio: user.bio || 'Principal Full-Stack Engineer & DevOps Advocate.',
          skills: user.skills || ['React', 'Node.js', 'TypeScript', 'MongoDB', 'Docker', 'CI/CD'],
          createdAt: user.createdAt,
        },
      };
    }
  },

  async getMe(token) {
    if (!token) throw new Error('No token provided');
    if (token.startsWith('local-jwt-')) {
      initLocalStorage();
      const rawUsers = localStorage.getItem(STORAGE_KEYS.USERS);
      const users = rawUsers ? JSON.parse(rawUsers) : [];
      const user = users[0] || {};
      return {
        success: true,
        user: {
          _id: user._id || 'demo-user-id',
          name: user.name || 'Alex Morgan',
          email: user.email || 'demo@taskflow.com',
          githubUrl: user.githubUrl || 'https://github.com/alexmorgan-dev',
          githubUsername: user.githubUsername || 'alexmorgan-dev',
          bitbucketUrl: user.bitbucketUrl || 'https://bitbucket.org/alexmorgan/taskflow-core',
          linkedinUrl: user.linkedinUrl || 'https://linkedin.com/in/alexmorgandev',
          portfolioUrl: user.portfolioUrl || 'https://alexmorgan.dev',
          bio: user.bio || 'Principal Full-Stack Engineer & DevOps Advocate.',
          skills: user.skills || ['React', 'Node.js', 'TypeScript', 'MongoDB', 'Docker', 'CI/CD'],
          createdAt: user.createdAt || new Date().toISOString(),
        },
      };
    }
    try {
      const response = await fetchWithTimeout(`${API_BASE_URL}/auth/me`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || 'Session validation failed');
      notifyConnectionChange(true);
      return data;
    } catch (error) {
      notifyConnectionChange(false);
      const storedUser = localStorage.getItem(STORAGE_KEYS.USER);
      if (storedUser) return { success: true, user: JSON.parse(storedUser) };
      throw error;
    }
  },

  async updateProfile(profileData, token = null) {
    if (token && !token.startsWith('local-jwt-')) {
      try {
        const response = await fetchWithTimeout(`${API_BASE_URL}/auth/profile`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(profileData),
        });
        const data = await response.json();
        if (response.ok) {
          notifyConnectionChange(true);
          const currentStored = localStorage.getItem(STORAGE_KEYS.USER);
          if (currentStored) {
            localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify({ ...JSON.parse(currentStored), ...data.data }));
          }
          return data;
        }
      } catch (err) {
        notifyConnectionChange(false);
      }
    }

    // LocalStorage Fallback
    initLocalStorage();
    const rawUsers = localStorage.getItem(STORAGE_KEYS.USERS);
    const users = rawUsers ? JSON.parse(rawUsers) : [];
    const userIndex = users.findIndex((u) => u._id === 'demo-user-id' || u.email === 'demo@taskflow.com');
    const existing = userIndex !== -1 ? users[userIndex] : {};
    const updated = {
      ...existing,
      ...profileData,
    };
    if (userIndex !== -1) {
      users[userIndex] = updated;
      localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(users));
    }
    localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(updated));
    return { success: true, message: 'Profile updated locally', data: updated, isLocal: true };
  },
};

/* ==========================================================================
   TASKS API SERVICE (WITH HYBRID FALLBACK)
   ========================================================================== */

export const tasksAPI = {
  async getAll(params = {}, token = null, currentUserId = null) {
    if (token && !token.startsWith('local-jwt-')) {
      try {
        const query = new URLSearchParams();
        if (params.status && params.status !== 'All') query.append('status', params.status);
        if (params.priority && params.priority !== 'All') query.append('priority', params.priority);
        if (params.category && params.category !== 'All') query.append('category', params.category);
        if (params.assignee && params.assignee !== 'All') query.append('assignee', params.assignee);
        if (params.search) query.append('search', params.search);
        if (params.sortBy) query.append('sortBy', params.sortBy);

        const url = `${API_BASE_URL}/tasks${query.toString() ? '?' + query.toString() : ''}`;
        const response = await fetchWithTimeout(url, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await response.json();
        if (response.ok) {
          notifyConnectionChange(true);
          return data;
        }
      } catch (err) {
        notifyConnectionChange(false);
      }
    }

    // LocalStorage Fallback logic
    let tasks = getLocalTasks(currentUserId);

    if (params.status && params.status !== 'All') {
      tasks = tasks.filter((t) => t.status === params.status);
    }
    if (params.priority && params.priority !== 'All') {
      tasks = tasks.filter((t) => t.priority === params.priority);
    }
    if (params.category && params.category !== 'All') {
      tasks = tasks.filter((t) => t.category === params.category);
    }
    if (params.assignee && params.assignee !== 'All') {
      tasks = tasks.filter((t) => t.assignee?.name === params.assignee);
    }

    if (params.search && params.search.trim()) {
      const q = params.search.trim().toLowerCase();
      tasks = tasks.filter(
        (t) =>
          (t.title && t.title.toLowerCase().includes(q)) ||
          (t.description && t.description.toLowerCase().includes(q)) ||
          (t.category && t.category.toLowerCase().includes(q)) ||
          (t.assignee?.name && t.assignee.name.toLowerCase().includes(q))
      );
    }

    if (params.sortBy === 'dueDate_asc') {
      tasks.sort((a, b) => {
        if (!a.dueDate) return 1;
        if (!b.dueDate) return -1;
        return new Date(a.dueDate) - new Date(b.dueDate);
      });
    } else if (params.sortBy === 'dueDate_desc') {
      tasks.sort((a, b) => {
        if (!a.dueDate) return 1;
        if (!b.dueDate) return -1;
        return new Date(b.dueDate) - new Date(a.dueDate);
      });
    } else if (params.sortBy === 'title_asc') {
      tasks.sort((a, b) => (a.title || '').localeCompare(b.title || ''));
    } else if (params.sortBy === 'priority_desc') {
      const pMap = { Urgent: 4, High: 3, Medium: 2, Low: 1 };
      tasks.sort((a, b) => (pMap[b.priority] || 0) - (pMap[a.priority] || 0));
    } else {
      tasks.sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0));
    }

    return { success: true, count: tasks.length, data: tasks, isLocal: true };
  },

  async create(taskData, token = null, currentUserId = null, userName = 'Alex Morgan') {
    if (token && !token.startsWith('local-jwt-')) {
      try {
        const response = await fetchWithTimeout(`${API_BASE_URL}/tasks`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(taskData),
        });
        const data = await response.json();
        if (response.ok) {
          notifyConnectionChange(true);
          return data;
        }
      } catch (err) {
        notifyConnectionChange(false);
      }
    }

    // LocalStorage Fallback
    const tasks = getLocalTasks();
    const newTask = {
      _id: 'task-' + Date.now(),
      user: currentUserId || 'demo-user-id',
      title: taskData.title.trim(),
      description: taskData.description ? taskData.description.trim() : '',
      status: taskData.status || 'To Do',
      priority: taskData.priority || 'Medium',
      category: taskData.category ? taskData.category.trim() : 'General',
      dueDate: taskData.dueDate || null,
      assignee: taskData.assignee || TEAM_MEMBERS[0],
      storyPoints: Number(taskData.storyPoints) || 3,
      techStack: Array.isArray(taskData.techStack) ? taskData.techStack : [],
      linkedPR: taskData.linkedPR || null,
      commitHash: taskData.commitHash ? taskData.commitHash.trim() : '',
      estimatedHours: Number(taskData.estimatedHours) || 0,
      timeLogged: Number(taskData.timeLogged) || 0,
      subtasks: Array.isArray(taskData.subtasks) ? taskData.subtasks : [],
      comments: [],
      activityLog: [
        {
          id: 'act-' + Date.now(),
          action: 'created',
          field: 'task',
          from: '',
          to: taskData.title.trim(),
          user: userName,
          timestamp: new Date().toISOString(),
        },
      ],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    tasks.unshift(newTask);
    saveLocalTasks(tasks);

    return { success: true, message: 'Task created locally', data: newTask, isLocal: true };
  },

  async update(id, taskData, token = null, currentUserId = null, userName = 'Alex Morgan') {
    if (token && !token.startsWith('local-jwt-')) {
      try {
        const response = await fetchWithTimeout(`${API_BASE_URL}/tasks/${id}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(taskData),
        });
        const data = await response.json();
        if (response.ok) {
          notifyConnectionChange(true);
          return data;
        }
      } catch (err) {
        notifyConnectionChange(false);
      }
    }

    // LocalStorage Fallback
    const tasks = getLocalTasks();
    const index = tasks.findIndex((t) => t._id === id);
    if (index === -1) throw new Error('Task not found');

    const prev = tasks[index];
    const activityLog = prev.activityLog ? [...prev.activityLog] : [];

    if (taskData.status && taskData.status !== prev.status) {
      activityLog.unshift({
        id: 'act-' + Date.now(),
        action: 'changed status',
        field: 'status',
        from: prev.status,
        to: taskData.status,
        user: userName,
        timestamp: new Date().toISOString(),
      });
    }

    if (taskData.priority && taskData.priority !== prev.priority) {
      activityLog.unshift({
        id: 'act-' + Date.now(),
        action: 'changed priority',
        field: 'priority',
        from: prev.priority,
        to: taskData.priority,
        user: userName,
        timestamp: new Date().toISOString(),
      });
    }

    if (taskData.assignee && taskData.assignee?.name !== prev.assignee?.name) {
      activityLog.unshift({
        id: 'act-' + Date.now(),
        action: 'reassigned',
        field: 'assignee',
        from: prev.assignee?.name || 'None',
        to: taskData.assignee?.name || 'None',
        user: userName,
        timestamp: new Date().toISOString(),
      });
    }

    if (taskData.timeLogged !== undefined && Number(taskData.timeLogged) !== Number(prev.timeLogged)) {
      activityLog.unshift({
        id: 'act-' + Date.now(),
        action: 'logged time',
        field: 'timeLogged',
        from: `${prev.timeLogged}h`,
        to: `${taskData.timeLogged}h`,
        user: userName,
        timestamp: new Date().toISOString(),
      });
    }

    const updated = {
      ...prev,
      ...taskData,
      activityLog,
      updatedAt: new Date().toISOString(),
    };

    tasks[index] = updated;
    saveLocalTasks(tasks);

    return { success: true, message: 'Task updated locally', data: updated, isLocal: true };
  },

  async delete(id, token = null) {
    if (token && !token.startsWith('local-jwt-')) {
      try {
        const response = await fetchWithTimeout(`${API_BASE_URL}/tasks/${id}`, {
          method: 'DELETE',
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await response.json();
        if (response.ok) {
          notifyConnectionChange(true);
          return data;
        }
      } catch (err) {
        notifyConnectionChange(false);
      }
    }

    const tasks = getLocalTasks();
    const filtered = tasks.filter((t) => t._id !== id);
    saveLocalTasks(filtered);

    return { success: true, message: 'Task deleted locally', data: { id }, isLocal: true };
  },

  async addComment(taskId, text, token = null, userName = 'Alex Morgan') {
    if (token && !token.startsWith('local-jwt-')) {
      try {
        const response = await fetchWithTimeout(`${API_BASE_URL}/tasks/${taskId}/comments`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ text }),
        });
        const data = await response.json();
        if (response.ok) {
          notifyConnectionChange(true);
          return data;
        }
      } catch (err) {
        notifyConnectionChange(false);
      }
    }

    // LocalStorage Fallback
    const tasks = getLocalTasks();
    const task = tasks.find((t) => t._id === taskId);
    if (!task) throw new Error('Task not found');

    const newComment = {
      id: 'comm-' + Date.now(),
      _id: 'comm-' + Date.now(),
      userName,
      userAvatar: userName.split(' ').map((n) => n[0]).join('').substring(0, 2).toUpperCase(),
      text: text.trim(),
      createdAt: new Date().toISOString(),
    };

    if (!Array.isArray(task.comments)) task.comments = [];
    task.comments.push(newComment);

    if (!Array.isArray(task.activityLog)) task.activityLog = [];
    task.activityLog.unshift({
      id: 'act-' + Date.now(),
      action: 'commented',
      field: 'comment',
      from: '',
      to: text.trim().substring(0, 40) + '...',
      user: userName,
      timestamp: new Date().toISOString(),
    });

    saveLocalTasks(tasks);
    return { success: true, data: newComment, task };
  },

  async deleteComment(taskId, commentId, token = null) {
    if (token && !token.startsWith('local-jwt-')) {
      try {
        const response = await fetchWithTimeout(`${API_BASE_URL}/tasks/${taskId}/comments/${commentId}`, {
          method: 'DELETE',
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await response.json();
        if (response.ok) {
          notifyConnectionChange(true);
          return data;
        }
      } catch (err) {
        notifyConnectionChange(false);
      }
    }

    const tasks = getLocalTasks();
    const task = tasks.find((t) => t._id === taskId);
    if (!task) throw new Error('Task not found');

    task.comments = (task.comments || []).filter((c) => (c._id || c.id) !== commentId);
    saveLocalTasks(tasks);
    return { success: true, data: task };
  },

  async logTime(taskId, hours, token = null, userName = 'Alex Morgan') {
    if (token && !token.startsWith('local-jwt-')) {
      try {
        const response = await fetchWithTimeout(`${API_BASE_URL}/tasks/${taskId}/time`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ hours }),
        });
        const data = await response.json();
        if (response.ok) {
          notifyConnectionChange(true);
          return data;
        }
      } catch (err) {
        notifyConnectionChange(false);
      }
    }

    const tasks = getLocalTasks();
    const task = tasks.find((t) => t._id === taskId);
    if (!task) throw new Error('Task not found');

    const added = Number(hours) || 0;
    const prev = task.timeLogged || 0;
    task.timeLogged = Math.round((prev + added) * 10) / 10;

    if (!Array.isArray(task.activityLog)) task.activityLog = [];
    task.activityLog.unshift({
      id: 'act-' + Date.now(),
      action: 'logged time',
      field: 'timeLogged',
      from: `+${added}h`,
      to: `Total: ${task.timeLogged}h`,
      user: userName,
      timestamp: new Date().toISOString(),
    });

    saveLocalTasks(tasks);
    return { success: true, data: task };
  },

  async parseNLP(prompt, token = null) {
    if (token && !token.startsWith('local-jwt-')) {
      try {
        const response = await fetchWithTimeout(`${API_BASE_URL}/tasks/ai/parse`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ prompt }),
        });
        const data = await response.json();
        if (response.ok) {
          notifyConnectionChange(true);
          return data.data;
        }
      } catch (err) {
        notifyConnectionChange(false);
      }
    }
    return parseNaturalLanguage(prompt);
  },

  async breakdownAI(title, description, token = null) {
    if (token && !token.startsWith('local-jwt-')) {
      try {
        const response = await fetchWithTimeout(`${API_BASE_URL}/tasks/ai/breakdown`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ title, description }),
        });
        const data = await response.json();
        if (response.ok) {
          notifyConnectionChange(true);
          return data.data;
        }
      } catch (err) {
        notifyConnectionChange(false);
      }
    }
    return generateAIBreakdown(title, description);
  },

  async getStats(token = null, currentUserId = null) {
    if (token && !token.startsWith('local-jwt-')) {
      try {
        const response = await fetchWithTimeout(`${API_BASE_URL}/tasks/stats/summary`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await response.json();
        if (response.ok) {
          notifyConnectionChange(true);
          return data;
        }
      } catch (err) {
        notifyConnectionChange(false);
      }
    }

    const tasks = getLocalTasks(currentUserId);
    const now = new Date();

    const total = tasks.length;
    let completed = 0;
    let inProgress = 0;
    let toDo = 0;
    let urgent = 0;
    let overdue = 0;
    let totalEstimatedHours = 0;
    let totalTimeLogged = 0;
    let totalSubtasks = 0;
    let completedSubtasks = 0;

    // DevOps & Student Metrics
    let totalStoryPoints = 0;
    let completedStoryPoints = 0;
    let inProgressStoryPoints = 0;

    const priorityCounts = { Low: 0, Medium: 0, High: 0, Urgent: 0 };
    const categoryCounts = {};
    const assigneeCounts = {};
    const techStackCounts = {};
    const prStatusCounts = { Open: 0, Merged: 0, 'Failed CI/CD': 0, Draft: 0, None: 0 };

    const velocityLast7Days = [];
    for (let i = 6; i >= 0; i--) {
      const dayDate = new Date();
      dayDate.setDate(dayDate.getDate() - i);
      const dayStr = dayDate.toLocaleDateString(undefined, { weekday: 'short', month: 'numeric', day: 'numeric' });
      velocityLast7Days.push({
        day: dayStr,
        dateKey: dayDate.toISOString().split('T')[0],
        completedCount: 0,
        loggedHours: 0,
        completedStoryPoints: 0,
      });
    }

    tasks.forEach((task) => {
      const sp = Number(task.storyPoints) || 3;
      totalStoryPoints += sp;

      if (task.status === 'Completed') {
        completed++;
        completedStoryPoints += sp;
        const updateDate = task.updatedAt ? new Date(task.updatedAt).toISOString().split('T')[0] : null;
        if (updateDate) {
          const vIndex = velocityLast7Days.findIndex((v) => v.dateKey === updateDate);
          if (vIndex !== -1) {
            velocityLast7Days[vIndex].completedCount++;
            velocityLast7Days[vIndex].completedStoryPoints += sp;
          }
        }
      } else if (task.status === 'In Progress') {
        inProgress++;
        inProgressStoryPoints += sp;
      } else if (task.status === 'To Do') {
        toDo++;
      }

      if (priorityCounts[task.priority] !== undefined) priorityCounts[task.priority]++;
      if (task.priority === 'Urgent') urgent++;

      if (task.dueDate && task.status !== 'Completed' && new Date(task.dueDate) < now) {
        overdue++;
      }

      const cat = task.category || 'General';
      categoryCounts[cat] = (categoryCounts[cat] || 0) + 1;

      const assName = task.assignee?.name || 'Unassigned';
      assigneeCounts[assName] = (assigneeCounts[assName] || 0) + 1;

      // Tech Stack
      if (Array.isArray(task.techStack)) {
        task.techStack.forEach((t) => {
          if (t && t.trim()) {
            techStackCounts[t.trim()] = (techStackCounts[t.trim()] || 0) + 1;
          }
        });
      }

      // PR Status
      const prStatus = task.linkedPR?.status || 'None';
      if (prStatusCounts[prStatus] !== undefined) {
        prStatusCounts[prStatus]++;
      }

      totalEstimatedHours += Number(task.estimatedHours || 0);
      totalTimeLogged += Number(task.timeLogged || 0);

      if (Array.isArray(task.subtasks)) {
        totalSubtasks += task.subtasks.length;
        completedSubtasks += task.subtasks.filter((s) => s.completed).length;
      }
    });

    const completionRate = total > 0 ? Math.round((completed / total) * 100) : 0;
    const subtaskCompletionRate = totalSubtasks > 0 ? Math.round((completedSubtasks / totalSubtasks) * 100) : 0;
    const storyPointsVelocityRate = totalStoryPoints > 0 ? Math.round((completedStoryPoints / totalStoryPoints) * 100) : 0;

    // 52-week contribution heatmap generator for offline mode
    const contributionMap = [];
    const today = new Date();
    let totalYearContributions = 0;
    for (let i = 363; i >= 0; i--) {
      const d = new Date();
      d.setDate(today.getDate() - i);
      const dateStr = d.toISOString().split('T')[0];
      const dayOfWeek = d.getDay();
      const weekNum = Math.floor((363 - i) / 7);

      let count = 0;
      if (dayOfWeek !== 0 && dayOfWeek !== 6) {
        count = (weekNum * 3 + dayOfWeek * 7) % 5;
      } else {
        count = weekNum % 3 === 0 ? 1 : 0;
      }

      const vMatch = velocityLast7Days.find((v) => v.dateKey === dateStr);
      if (vMatch && vMatch.completedCount > 0) {
        count += vMatch.completedCount * 2;
      }

      totalYearContributions += count;
      let level = 0;
      if (count >= 5) level = 4;
      else if (count >= 3) level = 3;
      else if (count >= 2) level = 2;
      else if (count >= 1) level = 1;

      contributionMap.push({
        date: dateStr,
        count,
        level,
        dayOfWeek,
      });
    }

    return {
      success: true,
      data: {
        total,
        completed,
        inProgress,
        toDo,
        pending: inProgress + toDo,
        urgent,
        overdue,
        completionRate,
        totalStoryPoints,
        completedStoryPoints,
        inProgressStoryPoints,
        storyPointsVelocityRate,
        totalEstimatedHours,
        totalTimeLogged,
        totalSubtasks,
        completedSubtasks,
        subtaskCompletionRate,
        priorityBreakdown: priorityCounts,
        categoryBreakdown: categoryCounts,
        assigneeBreakdown: assigneeCounts,
        techStackBreakdown: techStackCounts,
        prStatusBreakdown: prStatusCounts,
        velocityLast7Days,
        contributionHeatmap: {
          totalContributions: totalYearContributions + completed * 3,
          currentStreak: 12,
          longestStreak: 26,
          days: contributionMap,
        },
      },
      isLocal: true,
    };
  },

  resetDemoData() {
    localStorage.setItem(STORAGE_KEYS.TASKS, JSON.stringify(DEFAULT_SEED_TASKS));
  },
};
