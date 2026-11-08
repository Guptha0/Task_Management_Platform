/**
 * Team Members Directory
 * Predefined profiles for collaboration, assignees, and task ownership.
 */

export const TEAM_MEMBERS = [
  {
    id: 'user-alex',
    name: 'Alex Morgan',
    email: 'alex@taskflow.com',
    avatar: 'AM',
    role: 'Lead Architect',
    color: 'bg-indigo-600 text-white',
    ring: 'ring-indigo-400',
  },
  {
    id: 'user-sarah',
    name: 'Sarah Chen',
    email: 'sarah.chen@taskflow.com',
    avatar: 'SC',
    role: 'Product Designer',
    color: 'bg-purple-600 text-white',
    ring: 'ring-purple-400',
  },
  {
    id: 'user-david',
    name: 'David Miller',
    email: 'david.m@taskflow.com',
    avatar: 'DM',
    role: 'Backend Lead',
    color: 'bg-blue-600 text-white',
    ring: 'ring-blue-400',
  },
  {
    id: 'user-priya',
    name: 'Priya Patel',
    email: 'priya.p@taskflow.com',
    avatar: 'PP',
    role: 'Frontend Specialist',
    color: 'bg-rose-500 text-white',
    ring: 'ring-rose-400',
  },
  {
    id: 'user-marcus',
    name: 'Marcus Vance',
    email: 'marcus.v@taskflow.com',
    avatar: 'MV',
    role: 'DevOps Engineer',
    color: 'bg-amber-600 text-white',
    ring: 'ring-amber-400',
  },
  {
    id: 'user-elena',
    name: 'Elena Rostova',
    email: 'elena.r@taskflow.com',
    avatar: 'ER',
    role: 'QA Lead',
    color: 'bg-emerald-600 text-white',
    ring: 'ring-emerald-400',
  },
];

export const getMemberByName = (name) => {
  if (!name) return TEAM_MEMBERS[0];
  return (
    TEAM_MEMBERS.find((m) => m.name.toLowerCase() === name.toLowerCase()) || {
      name,
      email: '',
      avatar: name.split(' ').map((n) => n[0]).join('').substring(0, 2).toUpperCase(),
      role: 'Member',
      color: 'bg-slate-600 text-white',
      ring: 'ring-slate-400',
    }
  );
};
