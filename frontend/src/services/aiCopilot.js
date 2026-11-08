import { TEAM_MEMBERS } from './team';

/**
 * TaskBot AI Copilot Engine
 * Client-side intelligent NLP parsing and task decomposition with zero latency,
 * compatible with backend API.
 */

export const parseNaturalLanguage = (prompt) => {
  if (!prompt || !prompt.trim()) {
    return null;
  }

  const text = prompt.trim();
  const lower = text.toLowerCase();

  // 1. Detect Priority
  let priority = 'Medium';
  if (
    lower.includes('urgent') ||
    lower.includes('asap') ||
    lower.includes('critical') ||
    lower.includes('blocker') ||
    lower.includes('p0')
  ) {
    priority = 'Urgent';
  } else if (
    lower.includes('high priority') ||
    lower.includes('important') ||
    lower.includes('high') ||
    lower.includes('p1')
  ) {
    priority = 'High';
  } else if (
    lower.includes('low priority') ||
    lower.includes('minor') ||
    lower.includes('low') ||
    lower.includes('when possible')
  ) {
    priority = 'Low';
  }

  // 2. Detect Due Date
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
  } else if (lower.includes('in 2 days') || lower.includes('in two days')) {
    const d = new Date();
    d.setDate(d.getDate() + 2);
    dueDate = d;
  } else if (lower.includes('in 3 days') || lower.includes('in three days')) {
    const d = new Date();
    d.setDate(d.getDate() + 3);
    dueDate = d;
  }

  // 3. Detect Assignee
  let assignee = TEAM_MEMBERS[0]; // Default Alex Morgan
  for (const member of TEAM_MEMBERS) {
    const firstName = member.name.split(' ')[0].toLowerCase();
    if (
      lower.includes(`assign to ${firstName}`) ||
      lower.includes(`assigned to ${firstName}`) ||
      lower.includes(`for ${firstName}`) ||
      lower.includes(`@${firstName}`)
    ) {
      assignee = member;
      break;
    }
  }

  // 4. Detect Category
  let category = 'General';
  if (
    lower.includes('design') ||
    lower.includes('figma') ||
    lower.includes('ui') ||
    lower.includes('ux') ||
    lower.includes('wireframe') ||
    lower.includes('mockup')
  ) {
    category = 'Design';
  } else if (
    lower.includes('backend') ||
    lower.includes('api') ||
    lower.includes('database') ||
    lower.includes('mongo') ||
    lower.includes('auth') ||
    lower.includes('jwt') ||
    lower.includes('server')
  ) {
    category = 'Engineering';
  } else if (
    lower.includes('marketing') ||
    lower.includes('launch') ||
    lower.includes('announcement') ||
    lower.includes('social') ||
    lower.includes('email campaign')
  ) {
    category = 'Marketing';
  } else if (
    lower.includes('devops') ||
    lower.includes('docker') ||
    lower.includes('ci/cd') ||
    lower.includes('deploy') ||
    lower.includes('pipeline') ||
    lower.includes('aws')
  ) {
    category = 'DevOps';
  } else if (
    lower.includes('qa') ||
    lower.includes('test') ||
    lower.includes('audit') ||
    lower.includes('wcag') ||
    lower.includes('cypress')
  ) {
    category = 'QA';
  }

  // 5. Detect Estimated Hours
  let estimatedHours = priority === 'Urgent' ? 3 : priority === 'High' ? 6 : 4;
  const hoursMatch = lower.match(/(\d+(\.\d+)?)\s*(h|hr|hrs|hour|hours)/);
  if (hoursMatch) {
    estimatedHours = parseFloat(hoursMatch[1]);
  }

  // 6. Clean Title
  let cleanedTitle = text
    .replace(/^(remind me to|please|need to|task:|create a task to|add a task to)\s+/i, '')
    .replace(
      /\b(by tomorrow( at \d+(:?\d+)?\s*(am|pm)?)?|by today( at \d+(:?\d+)?\s*(am|pm)?)?|next week|by friday|by monday|with high priority|with urgent priority|with low priority|assigned to \w+|assign to \w+|for \w+|@\w+|\d+\s*h(ours?)? estimate)\b/gi,
      ''
    )
    .replace(/\s+/g, ' ')
    .trim();

  if (!cleanedTitle) {
    cleanedTitle = text;
  }
  // Capitalize first character
  cleanedTitle = cleanedTitle.charAt(0).toUpperCase() + cleanedTitle.slice(1);

  return {
    title: cleanedTitle,
    priority,
    dueDate: dueDate ? dueDate.toISOString() : null,
    assignee,
    category,
    estimatedHours,
  };
};

export const generateAIBreakdown = (title, description = '') => {
  if (!title || !title.trim()) {
    return {
      subtasks: [],
      estimatedHours: 4,
      priority: 'Medium',
      suggestedCategory: 'General',
    };
  }

  const t = (title + ' ' + description).toLowerCase();
  let subtasks = [];
  let estimatedHours = 4;
  let priority = 'Medium';
  let suggestedCategory = 'General';

  if (
    t.includes('auth') ||
    t.includes('jwt') ||
    t.includes('login') ||
    t.includes('register') ||
    t.includes('security')
  ) {
    subtasks = [
      { id: 'sub-' + Date.now() + '-1', title: 'Define JWT expiration policy and secret key env configuration', completed: false },
      { id: 'sub-' + Date.now() + '-2', title: 'Implement bcrypt password hashing with salt rounds', completed: false },
      { id: 'sub-' + Date.now() + '-3', title: 'Create Bearer authorization verification middleware', completed: false },
      { id: 'sub-' + Date.now() + '-4', title: 'Add test cases for expired tokens and malformed signatures', completed: false },
      { id: 'sub-' + Date.now() + '-5', title: 'Document auth endpoints and API response schemas', completed: false },
    ];
    estimatedHours = 6;
    priority = 'High';
    suggestedCategory = 'Engineering';
  } else if (
    t.includes('ui') ||
    t.includes('design') ||
    t.includes('page') ||
    t.includes('landing') ||
    t.includes('figma') ||
    t.includes('modal')
  ) {
    subtasks = [
      { id: 'sub-' + Date.now() + '-1', title: 'Audit Figma component variants and spacing design tokens', completed: false },
      { id: 'sub-' + Date.now() + '-2', title: 'Build responsive layout and typography hierarchy', completed: false },
      { id: 'sub-' + Date.now() + '-3', title: 'Add hover transitions, focus rings, and active states', completed: false },
      { id: 'sub-' + Date.now() + '-4', title: 'Test across mobile (375px), tablet, and desktop viewports', completed: false },
      { id: 'sub-' + Date.now() + '-5', title: 'Verify WCAG 2.1 AA color contrast and screen reader labels', completed: false },
    ];
    estimatedHours = 5;
    priority = 'Medium';
    suggestedCategory = 'Design';
  } else if (
    t.includes('bug') ||
    t.includes('fix') ||
    t.includes('crash') ||
    t.includes('error') ||
    t.includes('fail')
  ) {
    subtasks = [
      { id: 'sub-' + Date.now() + '-1', title: 'Reproduce issue in local environment with debug logs', completed: false },
      { id: 'sub-' + Date.now() + '-2', title: 'Isolate root cause in controller or UI component', completed: false },
      { id: 'sub-' + Date.now() + '-3', title: 'Apply minimal viable code patch and run regression suite', completed: false },
      { id: 'sub-' + Date.now() + '-4', title: 'Verify fix on staging build and monitor error telemetry', completed: false },
    ];
    estimatedHours = 3;
    priority = 'Urgent';
    suggestedCategory = 'QA';
  } else if (
    t.includes('database') ||
    t.includes('mongo') ||
    t.includes('index') ||
    t.includes('query') ||
    t.includes('schema')
  ) {
    subtasks = [
      { id: 'sub-' + Date.now() + '-1', title: 'Profile slow queries using explain("executionStats")', completed: false },
      { id: 'sub-' + Date.now() + '-2', title: 'Design compound index for user and status fields', completed: false },
      { id: 'sub-' + Date.now() + '-3', title: 'Benchmark query latency before and after indexing', completed: false },
      { id: 'sub-' + Date.now() + '-4', title: 'Deploy schema index updates to production', completed: false },
    ];
    estimatedHours = 4;
    priority = 'High';
    suggestedCategory = 'DevOps';
  } else if (
    t.includes('api') ||
    t.includes('endpoint') ||
    t.includes('crud') ||
    t.includes('service')
  ) {
    subtasks = [
      { id: 'sub-' + Date.now() + '-1', title: 'Design RESTful endpoint schema and request validation', completed: false },
      { id: 'sub-' + Date.now() + '-2', title: 'Implement controller logic with try/catch error handling', completed: false },
      { id: 'sub-' + Date.now() + '-3', title: 'Add authentication checks and rate limiting', completed: false },
      { id: 'sub-' + Date.now() + '-4', title: 'Write integration test cases covering 200, 400, and 401 scenarios', completed: false },
    ];
    estimatedHours = 5;
    priority = 'Medium';
    suggestedCategory = 'Engineering';
  } else {
    subtasks = [
      { id: 'sub-' + Date.now() + '-1', title: 'Outline technical specifications and acceptance criteria', completed: false },
      { id: 'sub-' + Date.now() + '-2', title: 'Execute primary implementation and core business logic', completed: false },
      { id: 'sub-' + Date.now() + '-3', title: 'Conduct peer code review and functional verification', completed: false },
      { id: 'sub-' + Date.now() + '-4', title: 'Deploy changes to environment and confirm deliverable', completed: false },
    ];
    estimatedHours = 4;
    priority = 'Medium';
    suggestedCategory = 'General';
  }

  return {
    subtasks,
    estimatedHours,
    priority,
    suggestedCategory,
  };
};
