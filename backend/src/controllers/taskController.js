const Task = require('../models/Task');

// Predefined Team Members directory for reference
const TEAM_MEMBERS = [
  { name: 'Alex Morgan', email: 'alex@taskflow.com', avatar: 'AM', role: 'Lead Architect' },
  { name: 'Sarah Chen', email: 'sarah.chen@taskflow.com', avatar: 'SC', role: 'Product Designer' },
  { name: 'David Miller', email: 'david.m@taskflow.com', avatar: 'DM', role: 'Backend Lead' },
  { name: 'Priya Patel', email: 'priya.p@taskflow.com', avatar: 'PP', role: 'Frontend Specialist' },
  { name: 'Marcus Vance', email: 'marcus.v@taskflow.com', avatar: 'MV', role: 'DevOps Engineer' },
  { name: 'Elena Rostova', email: 'elena.r@taskflow.com', avatar: 'ER', role: 'QA Lead' },
];

const createActivityEntry = (action, field = '', from = '', to = '', user = 'Alex Morgan') => ({
  action,
  field,
  from: String(from || ''),
  to: String(to || ''),
  user: user || 'Alex Morgan',
  timestamp: new Date(),
});

// @desc    Get all tasks for logged-in user
// @route   GET /api/tasks
// @access  Private
const getTasks = async (req, res, next) => {
  try {
    const { status, priority, category, assignee, tech, search, sortBy } = req.query;

    const query = { user: req.user._id };

    if (status && status !== 'All') {
      query.status = status;
    }

    if (priority && priority !== 'All') {
      query.priority = priority;
    }

    if (category && category !== 'All') {
      query.category = category;
    }

    if (assignee && assignee !== 'All') {
      query['assignee.name'] = assignee;
    }

    if (tech && tech !== 'All') {
      query.techStack = tech;
    }

    if (search && search.trim() !== '') {
      const searchRegex = new RegExp(search.trim(), 'i');
      query.$or = [
        { title: searchRegex },
        { description: searchRegex },
        { category: searchRegex },
        { 'assignee.name': searchRegex },
        { techStack: searchRegex },
        { commitHash: searchRegex },
        { 'linkedPR.title': searchRegex },
      ];
    }

    let sortOptions = { createdAt: -1 };
    if (sortBy === 'dueDate_asc') {
      sortOptions = { dueDate: 1, createdAt: -1 };
    } else if (sortBy === 'dueDate_desc') {
      sortOptions = { dueDate: -1, createdAt: -1 };
    } else if (sortBy === 'priority_desc') {
      sortOptions = { priority: 1, createdAt: -1 };
    } else if (sortBy === 'storyPoints_desc') {
      sortOptions = { storyPoints: -1, createdAt: -1 };
    } else if (sortBy === 'title_asc') {
      sortOptions = { title: 1 };
    }

    const tasks = await Task.find(query).sort(sortOptions);

    res.json({
      success: true,
      count: tasks.length,
      data: tasks,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get telemetry stats with story points, velocity, tech stacks, and 52-week heatmap
// @route   GET /api/tasks/stats/summary
// @access  Private
const getTaskStats = async (req, res, next) => {
  try {
    const userId = req.user._id;
    const now = new Date();

    const tasks = await Task.find({ user: userId });

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

    // Velocity / Burndown for last 7 days
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

      if (priorityCounts[task.priority] !== undefined) {
        priorityCounts[task.priority]++;
      }
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

      // Hours & Subtasks
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

    // Generate 52-week (364 days) GitHub-style contribution data
    const contributionMap = [];
    const today = new Date();
    // Deterministic pseudo-random seed based on day offset for realistic commit heatmaps
    let totalYearContributions = 0;
    for (let i = 363; i >= 0; i--) {
      const d = new Date();
      d.setDate(today.getDate() - i);
      const dateStr = d.toISOString().split('T')[0];
      const dayOfWeek = d.getDay(); // 0 is Sunday

      // Modulo pattern to simulate active developer streak with sprint peaks
      const weekNum = Math.floor((363 - i) / 7);
      let count = 0;
      if (dayOfWeek !== 0 && dayOfWeek !== 6) {
        // Weekdays: 1-6 contributions with sprint surges
        count = ((weekNum * 3 + dayOfWeek * 7) % 5);
      } else {
        // Weekends: light coding
        count = (weekNum % 3 === 0) ? 1 : 0;
      }

      // Add actual completed task count on recent days
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

    res.json({
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
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single task details
// @route   GET /api/tasks/:id
// @access  Private
const getTaskById = async (req, res, next) => {
  try {
    const task = await Task.findById(req.params.id);

    if (!task) {
      return res.status(404).json({ success: false, message: 'Task not found.' });
    }

    if (task.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Not authorized.' });
    }

    res.json({ success: true, data: task });
  } catch (error) {
    next(error);
  }
};

// @desc    Create a new task with DevOps attributes
// @route   POST /api/tasks
// @access  Private
const createTask = async (req, res, next) => {
  try {
    const {
      title,
      description,
      status,
      priority,
      category,
      dueDate,
      assignee,
      estimatedHours,
      timeLogged,
      storyPoints,
      techStack,
      linkedPR,
      commitHash,
      subtasks,
    } = req.body;

    if (!title || title.trim() === '') {
      return res.status(400).json({ success: false, message: 'Task title is required.' });
    }

    const userName = req.user.name || 'Alex Morgan';

    const initialActivity = [
      createActivityEntry('created', 'task', '', title.trim(), userName),
    ];

    if (linkedPR?.number) {
      initialActivity.unshift(
        createActivityEntry('linked pull request', 'linkedPR', '', `PR #${linkedPR.number}`, userName)
      );
    }

    const task = await Task.create({
      user: req.user._id,
      title: title.trim(),
      description: description ? description.trim() : '',
      status: status || 'To Do',
      priority: priority || 'Medium',
      category: category ? category.trim() : 'General',
      dueDate: dueDate || null,
      assignee: assignee || {
        name: userName,
        email: req.user.email,
        avatar: userName.split(' ').map((n) => n[0]).join('').substring(0, 2).toUpperCase(),
        role: 'Assignee',
      },
      estimatedHours: Number(estimatedHours) || 0,
      timeLogged: Number(timeLogged) || 0,
      storyPoints: Number(storyPoints) || 3,
      techStack: Array.isArray(techStack) && techStack.length > 0 ? techStack : ['Full-Stack'],
      linkedPR: linkedPR || { title: '', url: '', number: 0, status: 'None' },
      commitHash: commitHash ? commitHash.trim() : '',
      subtasks: Array.isArray(subtasks) ? subtasks : [],
      comments: [],
      activityLog: initialActivity,
    });

    res.status(201).json({
      success: true,
      message: 'Task created successfully',
      data: task,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update a task with DevOps & audit logging
// @route   PUT /api/tasks/:id
// @access  Private
const updateTask = async (req, res, next) => {
  try {
    let task = await Task.findById(req.params.id);

    if (!task) {
      return res.status(404).json({ success: false, message: 'Task not found.' });
    }

    if (task.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Not authorized.' });
    }

    const userName = req.user.name || 'Alex Morgan';
    const {
      title,
      description,
      status,
      priority,
      category,
      dueDate,
      assignee,
      estimatedHours,
      timeLogged,
      storyPoints,
      techStack,
      linkedPR,
      commitHash,
      subtasks,
    } = req.body;

    if (status !== undefined && status !== task.status) {
      task.activityLog.unshift(
        createActivityEntry('changed status', 'status', task.status, status, userName)
      );
      task.status = status;
    }

    if (priority !== undefined && priority !== task.priority) {
      task.activityLog.unshift(
        createActivityEntry('changed priority', 'priority', task.priority, priority, userName)
      );
      task.priority = priority;
    }

    if (storyPoints !== undefined && Number(storyPoints) !== Number(task.storyPoints)) {
      task.activityLog.unshift(
        createActivityEntry('updated story points', 'storyPoints', `${task.storyPoints} SP`, `${storyPoints} SP`, userName)
      );
      task.storyPoints = Number(storyPoints);
    }

    if (linkedPR !== undefined && linkedPR?.number !== task.linkedPR?.number) {
      task.activityLog.unshift(
        createActivityEntry('updated pull request', 'linkedPR', task.linkedPR?.number ? `PR #${task.linkedPR.number}` : 'None', linkedPR?.number ? `PR #${linkedPR.number} (${linkedPR.status})` : 'None', userName)
      );
      task.linkedPR = linkedPR;
    }

    if (commitHash !== undefined && commitHash !== task.commitHash) {
      task.activityLog.unshift(
        createActivityEntry('linked commit', 'commitHash', task.commitHash || 'None', commitHash || 'None', userName)
      );
      task.commitHash = commitHash.trim();
    }

    if (assignee !== undefined && assignee?.name !== task.assignee?.name) {
      task.activityLog.unshift(
        createActivityEntry('reassigned', 'assignee', task.assignee?.name || 'None', assignee?.name || 'None', userName)
      );
      task.assignee = assignee;
    }

    if (dueDate !== undefined && String(dueDate) !== String(task.dueDate)) {
      task.activityLog.unshift(
        createActivityEntry('updated due date', 'dueDate', task.dueDate ? new Date(task.dueDate).toLocaleDateString() : 'None', dueDate ? new Date(dueDate).toLocaleDateString() : 'None', userName)
      );
      task.dueDate = dueDate || null;
    }

    if (timeLogged !== undefined && Number(timeLogged) !== Number(task.timeLogged)) {
      task.activityLog.unshift(
        createActivityEntry('logged time', 'timeLogged', `${task.timeLogged}h`, `${timeLogged}h`, userName)
      );
      task.timeLogged = Number(timeLogged);
    }

    if (title !== undefined) task.title = title.trim();
    if (description !== undefined) task.description = description.trim();
    if (category !== undefined) task.category = category.trim();
    if (estimatedHours !== undefined) task.estimatedHours = Number(estimatedHours);
    if (Array.isArray(techStack)) task.techStack = techStack;
    if (subtasks !== undefined) task.subtasks = subtasks;

    const updatedTask = await task.save();

    res.json({
      success: true,
      message: 'Task updated successfully',
      data: updatedTask,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Add comment to a task
// @route   POST /api/tasks/:id/comments
// @access  Private
const addComment = async (req, res, next) => {
  try {
    const { text } = req.body;
    if (!text || !text.trim()) {
      return res.status(400).json({ success: false, message: 'Comment text is required.' });
    }

    const task = await Task.findById(req.params.id);
    if (!task) return res.status(404).json({ success: false, message: 'Task not found.' });
    if (task.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Not authorized.' });
    }

    const userName = req.user.name || 'Alex Morgan';
    const userAvatar = userName.split(' ').map((n) => n[0]).join('').substring(0, 2).toUpperCase();

    const newComment = {
      user: req.user._id.toString(),
      userName,
      userAvatar,
      text: text.trim(),
      createdAt: new Date(),
    };

    task.comments.push(newComment);
    task.activityLog.unshift(
      createActivityEntry('commented', 'comment', '', text.trim().substring(0, 40) + '...', userName)
    );

    await task.save();

    res.status(201).json({
      success: true,
      message: 'Comment added',
      data: task.comments[task.comments.length - 1],
      task,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete comment from a task
// @route   DELETE /api/tasks/:id/comments/:commentId
// @access  Private
const deleteComment = async (req, res, next) => {
  try {
    const task = await Task.findById(req.params.id);
    if (!task) return res.status(404).json({ success: false, message: 'Task not found.' });
    if (task.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Not authorized.' });
    }

    task.comments = task.comments.filter((c) => c._id.toString() !== req.params.commentId);
    await task.save();

    res.json({ success: true, message: 'Comment deleted', data: task });
  } catch (error) {
    next(error);
  }
};

// @desc    Log time for task
// @route   POST /api/tasks/:id/time
// @access  Private
const logTime = async (req, res, next) => {
  try {
    const { hours } = req.body;
    const addedHours = Number(hours);
    if (isNaN(addedHours) || addedHours <= 0) {
      return res.status(400).json({ success: false, message: 'Valid positive hours required.' });
    }

    const task = await Task.findById(req.params.id);
    if (!task) return res.status(404).json({ success: false, message: 'Task not found.' });
    if (task.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Not authorized.' });
    }

    const previousHours = task.timeLogged;
    task.timeLogged = Math.round((previousHours + addedHours) * 10) / 10;
    const userName = req.user.name || 'Alex Morgan';

    task.activityLog.unshift(
      createActivityEntry('logged time', 'timeLogged', `+${addedHours}h`, `Total: ${task.timeLogged}h`, userName)
    );

    await task.save();
    res.json({ success: true, message: 'Time logged successfully', data: task });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete task
// @route   DELETE /api/tasks/:id
// @access  Private
const deleteTask = async (req, res, next) => {
  try {
    const task = await Task.findById(req.params.id);
    if (!task) return res.status(404).json({ success: false, message: 'Task not found.' });
    if (task.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Not authorized.' });
    }

    await Task.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: 'Task deleted successfully', data: { id: req.params.id } });
  } catch (error) {
    next(error);
  }
};

// @desc    AI Copilot: Automatic Task Breakdown into Actionable Subtasks
// @route   POST /api/tasks/ai/breakdown
// @access  Private
const aiTaskBreakdown = async (req, res, next) => {
  try {
    const { title, description } = req.body;
    if (!title || !title.trim()) {
      return res.status(400).json({ success: false, message: 'Title is required for AI breakdown.' });
    }

    const t = title.toLowerCase();
    let subtasks = [];
    let estimatedHours = 4;
    let priority = 'Medium';
    let storyPoints = 3;
    let techStack = ['Full-Stack'];

    if (t.includes('auth') || t.includes('jwt') || t.includes('login') || t.includes('security')) {
      subtasks = [
        { title: 'Define JWT token expiration and secret key environment variables', completed: false },
        { title: 'Implement password hashing using bcrypt with salt rounds', completed: false },
        { title: 'Create bearer token verification middleware', completed: false },
        { title: 'Add test cases for invalid passwords and expired tokens', completed: false },
        { title: 'Document authentication API endpoints and responses', completed: false },
      ];
      estimatedHours = 6;
      priority = 'High';
      storyPoints = 5;
      techStack = ['Node.js', 'Express', 'JWT', 'MongoDB'];
    } else if (t.includes('ui') || t.includes('design') || t.includes('page') || t.includes('landing') || t.includes('component')) {
      subtasks = [
        { title: 'Review Figma wireframes and design system tokens', completed: false },
        { title: 'Build responsive layout and typography hierarchy', completed: false },
        { title: 'Implement dark/light contrast and interactive hover states', completed: false },
        { title: 'Test across mobile (375px), tablet, and desktop viewports', completed: false },
        { title: 'Validate WCAG 2.1 accessibility and keyboard navigation', completed: false },
      ];
      estimatedHours = 5;
      priority = 'Medium';
      storyPoints = 3;
      techStack = ['React', 'TailwindCSS', 'Vite'];
    } else if (t.includes('bug') || t.includes('fix') || t.includes('error') || t.includes('crash')) {
      subtasks = [
        { title: 'Reproduce issue in local environment with debug logs', completed: false },
        { title: 'Isolate root cause in controller or UI component', completed: false },
        { title: 'Apply code patch and run regression tests', completed: false },
        { title: 'Verify fix on staging build and monitor telemetry', completed: false },
      ];
      estimatedHours = 3;
      priority = 'Urgent';
      storyPoints = 2;
      techStack = ['TypeScript', 'Jest', 'Git'];
    } else if (t.includes('database') || t.includes('mongo') || t.includes('index') || t.includes('query')) {
      subtasks = [
        { title: 'Profile slow queries using explain("executionStats")', completed: false },
        { title: 'Design compound index for user and status fields', completed: false },
        { title: 'Benchmark query latency before and after indexing', completed: false },
        { title: 'Deploy schema index updates to production', completed: false },
      ];
      estimatedHours = 4;
      priority = 'High';
      storyPoints = 5;
      techStack = ['MongoDB', 'Mongoose', 'Docker'];
    } else if (t.includes('pipeline') || t.includes('ci/cd') || t.includes('docker') || t.includes('deploy')) {
      subtasks = [
        { title: 'Create multi-stage Dockerfile with cached layers', completed: false },
        { title: 'Configure GitHub Actions CI workflow for automated tests', completed: false },
        { title: 'Set up staging deployment webhook triggers', completed: false },
        { title: 'Verify health check probe and container logs', completed: false },
      ];
      estimatedHours = 5;
      priority = 'High';
      storyPoints = 5;
      techStack = ['Docker', 'GitHub Actions', 'CI/CD'];
    } else {
      subtasks = [
        { title: 'Clarify project requirements and acceptance criteria', completed: false },
        { title: 'Execute primary implementation and core logic', completed: false },
        { title: 'Conduct peer review and self-test functionality', completed: false },
        { title: 'Deploy to environment and verify completion', completed: false },
      ];
      estimatedHours = 4;
      priority = 'Medium';
      storyPoints = 3;
      techStack = ['JavaScript', 'React'];
    }

    res.json({
      success: true,
      data: {
        subtasks,
        estimatedHours,
        priority,
        storyPoints,
        techStack,
        suggestedCategory: t.includes('design') ? 'Design' : t.includes('bug') ? 'QA' : 'Engineering',
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    AI Copilot: Parse Natural Language Task Prompt
// @route   POST /api/tasks/ai/parse
// @access  Private
const aiParseNaturalLanguage = async (req, res, next) => {
  try {
    const { prompt } = req.body;
    if (!prompt || !prompt.trim()) {
      return res.status(400).json({ success: false, message: 'Prompt text is required.' });
    }

    const text = prompt.trim();
    const lower = text.toLowerCase();

    let priority = 'Medium';
    if (lower.includes('urgent') || lower.includes('asap') || lower.includes('critical') || lower.includes('blocker')) {
      priority = 'Urgent';
    } else if (lower.includes('high priority') || lower.includes('important')) {
      priority = 'High';
    } else if (lower.includes('low priority') || lower.includes('minor') || lower.includes('when you can')) {
      priority = 'Low';
    }

    let dueDate = null;
    const now = new Date();
    if (lower.includes('today')) {
      dueDate = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 18, 0, 0);
    } else if (lower.includes('tomorrow')) {
      const d = new Date();
      d.setDate(d.getDate() + 1);
      dueDate = new Date(d.getFullYear(), d.getMonth(), d.getDate(), 17, 0, 0);
    } else if (lower.includes('next week') || lower.includes('in a week')) {
      const d = new Date();
      d.setDate(d.getDate() + 7);
      dueDate = d;
    } else if (lower.includes('friday')) {
      const d = new Date();
      const currentDay = d.getDay();
      const distance = (5 + 7 - currentDay) % 7 || 7;
      d.setDate(d.getDate() + distance);
      dueDate = d;
    } else if (lower.includes('monday')) {
      const d = new Date();
      const currentDay = d.getDay();
      const distance = (1 + 7 - currentDay) % 7 || 7;
      d.setDate(d.getDate() + distance);
      dueDate = d;
    }

    let assignee = TEAM_MEMBERS[0];
    for (const member of TEAM_MEMBERS) {
      const firstName = member.name.split(' ')[0].toLowerCase();
      if (lower.includes(`assign to ${firstName}`) || lower.includes(`assigned to ${firstName}`) || lower.includes(`@${firstName}`)) {
        assignee = member;
        break;
      }
    }

    let category = 'General';
    let techStack = ['Full-Stack'];
    if (lower.includes('design') || lower.includes('figma') || lower.includes('ui') || lower.includes('mockup')) {
      category = 'Design';
      techStack = ['Figma', 'TailwindCSS', 'React'];
    } else if (lower.includes('backend') || lower.includes('api') || lower.includes('db') || lower.includes('mongo') || lower.includes('auth')) {
      category = 'Engineering';
      techStack = ['Node.js', 'Express', 'MongoDB'];
    } else if (lower.includes('devops') || lower.includes('docker') || lower.includes('ci/cd') || lower.includes('deploy')) {
      category = 'DevOps';
      techStack = ['Docker', 'CI/CD', 'GitHub Actions'];
    } else if (lower.includes('qa') || lower.includes('test') || lower.includes('audit')) {
      category = 'QA';
      techStack = ['Jest', 'Cypress'];
    }

    // Story points estimation
    let storyPoints = priority === 'Urgent' ? 5 : priority === 'High' ? 5 : 3;

    let cleanedTitle = text
      .replace(/^(remind me to|please|need to|task:|create a task to)\s+/i, '')
      .replace(/\b(by tomorrow|by today|next week|by friday|with high priority|with urgent priority|assigned to \w+|@\w+)\b/gi, '')
      .trim();

    if (!cleanedTitle) {
      cleanedTitle = text;
    }
    cleanedTitle = cleanedTitle.charAt(0).toUpperCase() + cleanedTitle.slice(1);

    res.json({
      success: true,
      data: {
        title: cleanedTitle,
        priority,
        dueDate,
        assignee,
        category,
        storyPoints,
        techStack,
        estimatedHours: priority === 'Urgent' ? 3 : 5,
      },
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getTasks,
  getTaskStats,
  getTaskById,
  createTask,
  updateTask,
  deleteTask,
  addComment,
  deleteComment,
  logTime,
  aiTaskBreakdown,
  aiParseNaturalLanguage,
  TEAM_MEMBERS,
};
