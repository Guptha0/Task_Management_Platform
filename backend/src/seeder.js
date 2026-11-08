const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });
const mongoose = require('mongoose');
const User = require('./models/User');
const Task = require('./models/Task');

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(
      process.env.MONGODB_URI || 'mongodb://localhost:27017/taskflow_pro'
    );
    console.log(`[Seeder] MongoDB Connected: ${conn.connection.host}`);
    return conn;
  } catch (error) {
    console.error(`[Seeder] MongoDB Connection Error: ${error.message}`);
    process.exit(1);
  }
};

const getSampleDate = (daysOffset) => {
  const d = new Date();
  d.setDate(d.getDate() + daysOffset);
  return d;
};

const TEAM_MEMBERS = [
  { name: 'Alex Morgan', email: 'alex@taskflow.com', avatar: 'AM', role: 'Lead Architect' },
  { name: 'Sarah Chen', email: 'sarah.chen@taskflow.com', avatar: 'SC', role: 'Product Designer' },
  { name: 'David Miller', email: 'david.m@taskflow.com', avatar: 'DM', role: 'Backend Lead' },
  { name: 'Priya Patel', email: 'priya.p@taskflow.com', avatar: 'PP', role: 'Frontend Specialist' },
  { name: 'Marcus Vance', email: 'marcus.v@taskflow.com', avatar: 'MV', role: 'DevOps Engineer' },
  { name: 'Elena Rostova', email: 'elena.r@taskflow.com', avatar: 'ER', role: 'QA Lead' },
];

const seedData = async () => {
  await connectDB();

  try {
    console.log('[Seeder] Cleaning existing database records...');
    await Task.deleteMany();
    await User.deleteMany();

    console.log('[Seeder] Creating demo user with developer portfolio links...');
    const demoUser = await User.create({
      name: 'Alex Morgan',
      email: 'demo@taskflow.com',
      password: 'password123',
      githubUrl: 'https://github.com/alexmorgan-dev',
      githubUsername: 'alexmorgan-dev',
      bitbucketUrl: 'https://bitbucket.org/alexmorgan/taskflow-pro',
      linkedinUrl: 'https://linkedin.com/in/alexmorgan-dev',
      portfolioUrl: 'https://alexmorgan.dev',
      bio: 'Full-Stack Developer & DevOps Practitioner | Building cloud-native web systems',
      skills: ['React', 'Node.js', 'Docker', 'MongoDB', 'TypeScript', 'TailwindCSS', 'Express', 'Git'],
    });

    console.log(`[Seeder] Demo user created: ${demoUser.email} (id: ${demoUser._id})`);

    const sampleTasks = [
      {
        user: demoUser._id,
        title: 'Design high-converting Landing Page hero section',
        description: 'Create responsive Figma wireframes with high-contrast CTA, dark-mode preview, and interactive states.',
        status: 'Completed',
        priority: 'High',
        category: 'Design',
        dueDate: getSampleDate(-3),
        assignee: TEAM_MEMBERS[1],
        estimatedHours: 8,
        timeLogged: 7.5,
        storyPoints: 5,
        techStack: ['Figma', 'TailwindCSS', 'React', 'CSS3'],
        linkedPR: {
          title: 'feat: hero banner responsive design tokens',
          url: 'https://github.com/alexmorgan-dev/taskflow-pro/pull/38',
          number: 38,
          status: 'Merged',
        },
        commitHash: '8a2f1c0',
        subtasks: [
          { title: 'Define brand color palette and typography scales in Figma', completed: true },
          { title: 'Create low-fidelity layout wireframes for mobile & desktop', completed: true },
          { title: 'Render high-fidelity hero graphics with glassmorphic cards', completed: true },
          { title: 'Conduct design review with @alex and export SVG assets', completed: true },
        ],
        comments: [
          {
            user: 'sarah-id',
            userName: 'Sarah Chen',
            userAvatar: 'SC',
            text: 'Wireframes have been updated in Figma. @Alex Morgan please inspect the hero illustration contrast ratio!',
            createdAt: getSampleDate(-4),
          },
          {
            user: demoUser._id.toString(),
            userName: 'Alex Morgan',
            userAvatar: 'AM',
            text: 'Approved! The dark-mode preview looks exceptional. Ready for frontend handoff.',
            createdAt: getSampleDate(-3),
          },
        ],
        activityLog: [
          { action: 'changed status', field: 'status', from: 'In Progress', to: 'Completed', user: 'Sarah Chen', timestamp: getSampleDate(-3) },
          { action: 'logged time', field: 'timeLogged', from: '4h', to: '7.5h', user: 'Sarah Chen', timestamp: getSampleDate(-3) },
          { action: 'commented', field: 'comment', from: '', to: 'Approved! The dark-mode preview...', user: 'Alex Morgan', timestamp: getSampleDate(-3) },
          { action: 'created', field: 'task', from: '', to: 'Design high-converting Landing Page hero section', user: 'Alex Morgan', timestamp: getSampleDate(-5) },
        ],
      },
      {
        user: demoUser._id,
        title: 'Architect JWT Authentication & Role-Based Middleware',
        description: 'Implement token signing, cookie storage security, and bcrypt hashing for user credentials with bearer validation.',
        status: 'Completed',
        priority: 'High',
        category: 'Engineering',
        dueDate: getSampleDate(-1),
        assignee: TEAM_MEMBERS[2],
        estimatedHours: 6,
        timeLogged: 6,
        storyPoints: 5,
        techStack: ['Node.js', 'Express', 'JWT', 'bcrypt', 'MongoDB'],
        linkedPR: {
          title: 'security: jwt authentication bearer verification middleware',
          url: 'https://github.com/alexmorgan-dev/taskflow-pro/pull/41',
          number: 41,
          status: 'Merged',
        },
        commitHash: '3d5e9b2',
        subtasks: [
          { title: 'Configure jsonwebtoken signing with 30-day expiration', completed: true },
          { title: 'Implement bcrypt salt hashing on User schema pre-save', completed: true },
          { title: 'Create protect route middleware with authorization headers', completed: true },
          { title: 'Add test suite covering expired and malformed tokens', completed: true },
        ],
        comments: [
          {
            user: 'david-id',
            userName: 'David Miller',
            userAvatar: 'DM',
            text: 'Middleware completed with 100% test coverage. Passwords hashed with 10 salt rounds.',
            createdAt: getSampleDate(-1),
          },
        ],
        activityLog: [
          { action: 'changed status', field: 'status', from: 'In Progress', to: 'Completed', user: 'David Miller', timestamp: getSampleDate(-1) },
          { action: 'logged time', field: 'timeLogged', from: '3h', to: '6h', user: 'David Miller', timestamp: getSampleDate(-1) },
          { action: 'created', field: 'task', from: '', to: 'Architect JWT Authentication', user: 'Alex Morgan', timestamp: getSampleDate(-4) },
        ],
      },
      {
        user: demoUser._id,
        title: 'Build Interactive Kanban Board with Native Drag & Drop',
        description: 'Ensure smooth status transitions between To Do, In Progress, and Completed columns with optimistic UI updates.',
        status: 'In Progress',
        priority: 'Urgent',
        category: 'Engineering',
        dueDate: getSampleDate(0),
        assignee: TEAM_MEMBERS[3],
        estimatedHours: 10,
        timeLogged: 6.5,
        storyPoints: 8,
        techStack: ['React', 'Vite', 'HTML5 DnD', 'TailwindCSS'],
        linkedPR: {
          title: 'feat: interactive kanban board card drag and drop',
          url: 'https://github.com/alexmorgan-dev/taskflow-pro/pull/45',
          number: 45,
          status: 'Open',
        },
        commitHash: '7f3a9b1',
        subtasks: [
          { title: 'Implement HTML5 drag event listeners on task cards', completed: true },
          { title: 'Build drop target boundary highlights for Kanban columns', completed: true },
          { title: 'Add optimistic UI reordering with immediate local state update', completed: true },
          { title: 'Add touch-friendly status shift chevron buttons for mobile screens', completed: false },
          { title: 'Integrate celebratory confetti trigger on completion', completed: true },
        ],
        comments: [
          {
            user: 'priya-id',
            userName: 'Priya Patel',
            userAvatar: 'PP',
            text: 'Drag and drop is silky smooth! Working on mobile touch gestures now.',
            createdAt: new Date(),
          },
        ],
        activityLog: [
          { action: 'logged time', field: 'timeLogged', from: '4h', to: '6.5h', user: 'Priya Patel', timestamp: new Date() },
          { action: 'changed status', field: 'status', from: 'To Do', to: 'In Progress', user: 'Priya Patel', timestamp: getSampleDate(-1) },
          { action: 'created', field: 'task', from: '', to: 'Build Interactive Kanban Board', user: 'Alex Morgan', timestamp: getSampleDate(-2) },
        ],
      },
      {
        user: demoUser._id,
        title: 'Audit Web Accessibility (WCAG 2.1 AA Compliance)',
        description: 'Verify focus rings, ARIA landmarks, screen reader descriptions, and color contrast ratios.',
        status: 'In Progress',
        priority: 'Medium',
        category: 'QA',
        dueDate: getSampleDate(2),
        assignee: TEAM_MEMBERS[5],
        estimatedHours: 5,
        timeLogged: 2,
        storyPoints: 3,
        techStack: ['Axe-Core', 'Jest', 'WCAG', 'HTML5'],
        linkedPR: {
          title: 'a11y: aria landmark roles and focus trap audit',
          url: 'https://github.com/alexmorgan-dev/taskflow-pro/pull/46',
          number: 46,
          status: 'Open',
        },
        commitHash: '4e1c7f9',
        subtasks: [
          { title: 'Run axe DevTools accessibility scan on all primary routes', completed: true },
          { title: 'Verify minimum 4.5:1 text-to-background contrast ratio', completed: true },
          { title: 'Add keyboard tab-order focus trap inside modal dialogs', completed: false },
          { title: 'Test NVDA and VoiceOver screen reader announcements', completed: false },
        ],
        comments: [],
        activityLog: [
          { action: 'logged time', field: 'timeLogged', from: '0h', to: '2h', user: 'Elena Rostova', timestamp: getSampleDate(-1) },
          { action: 'changed status', field: 'status', from: 'To Do', to: 'In Progress', user: 'Elena Rostova', timestamp: getSampleDate(-1) },
        ],
      },
      {
        user: demoUser._id,
        title: 'Optimize MongoDB compound indices for telemetry query',
        description: 'Run explain() analysis on user + status and user + priority queries to ensure sub-10ms response.',
        status: 'To Do',
        priority: 'Urgent',
        category: 'DevOps',
        dueDate: getSampleDate(-2),
        assignee: TEAM_MEMBERS[4],
        estimatedHours: 4,
        timeLogged: 0.5,
        storyPoints: 5,
        techStack: ['MongoDB', 'Docker', 'Linux', 'Database Indexing'],
        linkedPR: {
          title: 'perf: compound indexes for telemetry analytics query',
          url: 'https://github.com/alexmorgan-dev/taskflow-pro/pull/47',
          number: 47,
          status: 'Failed CI/CD',
        },
        commitHash: '9b2c8d4',
        subtasks: [
          { title: 'Execute query performance benchmarks with 10k documents', completed: true },
          { title: 'Index user and status compound fields in MongoDB', completed: false },
          { title: 'Benchmark post-indexing telemetry endpoint response time', completed: false },
        ],
        comments: [
          {
            user: 'marcus-id',
            userName: 'Marcus Vance',
            userAvatar: 'MV',
            text: 'Started initial explain() analysis. Currently noticing an unindexed COLLSCAN on status queries.',
            createdAt: getSampleDate(-1),
          },
        ],
        activityLog: [
          { action: 'reassigned', field: 'assignee', from: 'Unassigned', to: 'Marcus Vance', user: 'Alex Morgan', timestamp: getSampleDate(-2) },
          { action: 'created', field: 'task', from: '', to: 'Optimize MongoDB compound indices', user: 'Alex Morgan', timestamp: getSampleDate(-3) },
        ],
      },
      {
        user: demoUser._id,
        title: 'Implement AI Productivity Copilot & NLP Task Parsing',
        description: 'Integrate TaskBot AI for automatic checklist generation and natural language prompt decomposition.',
        status: 'In Progress',
        priority: 'High',
        category: 'Engineering',
        dueDate: getSampleDate(1),
        assignee: TEAM_MEMBERS[0],
        estimatedHours: 7,
        timeLogged: 4,
        storyPoints: 8,
        techStack: ['TypeScript', 'NLP', 'React', 'Node.js'],
        linkedPR: {
          title: 'feat: taskbot ai natural language copilot parser',
          url: 'https://github.com/alexmorgan-dev/taskflow-pro/pull/48',
          number: 48,
          status: 'Open',
        },
        commitHash: '1f4e8b3',
        subtasks: [
          { title: 'Develop natural language grammar extractor for titles and dates', completed: true },
          { title: 'Build AI Task Breakdown generator for modal checklists', completed: true },
          { title: 'Connect frontend Copilot quick-bar with instant preview pill', completed: false },
        ],
        comments: [
          {
            user: demoUser._id.toString(),
            userName: 'Alex Morgan',
            userAvatar: 'AM',
            text: 'AI parsing parses phrases like "Remind me to fix login by tomorrow at 4pm with high priority" with 100% accuracy!',
            createdAt: new Date(),
          },
        ],
        activityLog: [
          { action: 'logged time', field: 'timeLogged', from: '2h', to: '4h', user: 'Alex Morgan', timestamp: new Date() },
          { action: 'changed status', field: 'status', from: 'To Do', to: 'In Progress', user: 'Alex Morgan', timestamp: getSampleDate(-1) },
        ],
      },
      {
        user: demoUser._id,
        title: 'Configure GitHub Actions CI/CD automated test pipeline',
        description: 'Set up multi-stage container build with automated unit testing and staging environment deploy trigger.',
        status: 'To Do',
        priority: 'Medium',
        category: 'DevOps',
        dueDate: getSampleDate(5),
        assignee: TEAM_MEMBERS[4],
        estimatedHours: 4,
        timeLogged: 0,
        storyPoints: 3,
        techStack: ['GitHub Actions', 'Docker', 'CI/CD', 'Bash'],
        linkedPR: {
          title: 'ci: github actions multi-stage container build workflow',
          url: 'https://github.com/alexmorgan-dev/taskflow-pro/pull/49',
          number: 49,
          status: 'Draft',
        },
        commitHash: '5a9d2c1',
        subtasks: [
          { title: 'Write GitHub Actions workflow yaml for node and vite builds', completed: false },
          { title: 'Configure caching for node_modules to reduce CI runtime', completed: false },
          { title: 'Add status check webhook badges to project README', completed: false },
        ],
        comments: [],
        activityLog: [
          { action: 'created', field: 'task', from: '', to: 'Configure GitHub Actions CI/CD', user: 'Alex Morgan', timestamp: getSampleDate(-1) },
        ],
      },
      {
        user: demoUser._id,
        title: 'Benchmark Task Query Telemetry & Real-Time Stats API',
        description: 'Load test telemetry stats endpoint for 1,000 concurrent requests with zero memory leaks.',
        status: 'To Do',
        priority: 'Low',
        category: 'Research',
        dueDate: getSampleDate(8),
        assignee: TEAM_MEMBERS[4],
        estimatedHours: 5,
        timeLogged: 0,
        storyPoints: 3,
        techStack: ['k6', 'Grafana', 'Node.js', 'Benchmarking'],
        linkedPR: {
          title: 'test: k6 concurrency benchmark suite',
          url: '',
          number: 0,
          status: 'None',
        },
        commitHash: '2e7f4a0',
        subtasks: [
          { title: 'Set up k6 load testing configuration script', completed: false },
          { title: 'Measure 95th percentile latency under 1,000 requests/sec', completed: false },
          { title: 'Generate summary telemetry PDF report', completed: false },
        ],
        comments: [],
        activityLog: [
          { action: 'created', field: 'task', from: '', to: 'Benchmark Task Query Telemetry', user: 'Alex Morgan', timestamp: new Date() },
        ],
      },
    ];

    console.log('[Seeder] Inserting enhanced DevOps & student tasks...');
    await Task.insertMany(sampleTasks);

    console.log('====================================================');
    console.log('✅ DEVOPS & STUDENT PRODUCTIVITY SEEDING COMPLETE!');
    console.log(`👤 Demo Account:    demo@taskflow.com`);
    console.log(`🔑 Password:        password123`);
    console.log(`🐙 GitHub Profile:  https://github.com/alexmorgan-dev`);
    console.log(`🔗 LinkedIn:        https://linkedin.com/in/alexmorgan-dev`);
    console.log(`📋 Tasks Seeded:    ${sampleTasks.length}`);
    console.log('====================================================');

    process.exit(0);
  } catch (error) {
    console.error(`[Seeder] Error during seeding: ${error.message}`);
    process.exit(1);
  }
};

const destroyData = async () => {
  await connectDB();
  try {
    console.log('[Seeder] Destroying all tasks and users...');
    await Task.deleteMany();
    await User.deleteMany();
    console.log('🗑️ All database records removed successfully.');
    process.exit(0);
  } catch (error) {
    console.error(`[Seeder] Error destroying data: ${error.message}`);
    process.exit(1);
  }
};

if (process.argv[2] === '-d') {
  destroyData();
} else {
  seedData();
}
