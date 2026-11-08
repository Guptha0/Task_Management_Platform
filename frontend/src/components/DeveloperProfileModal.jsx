import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useTasks } from '../context/TaskContext';
import {
  X,
  User,
  Globe,
  GitBranch,
  Code2,
  FileText,
  Printer,
  CheckCircle2,
} from 'lucide-react';
import { GithubIcon, LinkedinIcon, BitbucketIcon } from './SocialIcons';

const PRESET_SKILLS = [
  'React',
  'Node.js',
  'Docker',
  'TypeScript',
  'MongoDB',
  'TailwindCSS',
  'Python',
  'Kubernetes',
  'GraphQL',
  'Verilog',
  'CI/CD',
  'AWS',
  'Jest',
  'Express',
  'Git',
];

const DeveloperProfileModal = ({ isOpen, onClose }) => {
  const { user, updateProfile } = useAuth();
  const { tasks, stats } = useTasks();

  const [activeTab, setActiveTab] = useState('profile');

  const [name, setName] = useState(user?.name || 'Alex Morgan');
  const [githubUrl, setGithubUrl] = useState(user?.githubUrl || 'https://github.com/alexmorgan-dev');
  const [githubUsername, setGithubUsername] = useState(user?.githubUsername || 'alexmorgan-dev');
  const [bitbucketUrl, setBitbucketUrl] = useState(user?.bitbucketUrl || 'https://bitbucket.org/alexmorgan/taskflow-pro');
  const [linkedinUrl, setLinkedinUrl] = useState(user?.linkedinUrl || 'https://linkedin.com/in/alexmorgan-dev');
  const [portfolioUrl, setPortfolioUrl] = useState(user?.portfolioUrl || 'https://alexmorgan.dev');
  const [bio, setBio] = useState(
    user?.bio || 'Full-Stack Developer & DevOps Practitioner | Building cloud-native web systems'
  );
  const [skills, setSkills] = useState(
    user?.skills || ['React', 'Node.js', 'Docker', 'MongoDB', 'TypeScript', 'TailwindCSS']
  );
  const [newSkillInput, setNewSkillInput] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  if (!isOpen) return null;

  const handleAddSkill = (skillToAdd) => {
    const s = (skillToAdd || newSkillInput).trim();
    if (!s) return;
    if (!skills.includes(s)) {
      setSkills((prev) => [...prev, s]);
    }
    setNewSkillInput('');
  };

  const handleRemoveSkill = (skillToRemove) => {
    setSkills((prev) => prev.filter((s) => s !== skillToRemove));
  };

  const handleSaveProfile = async (e) => {
    e.preventDefault();
    setIsSaving(true);
    setSaveSuccess(false);

    const payload = {
      name: name.trim(),
      githubUrl: githubUrl.trim(),
      githubUsername: githubUsername.trim(),
      bitbucketUrl: bitbucketUrl.trim(),
      linkedinUrl: linkedinUrl.trim(),
      portfolioUrl: portfolioUrl.trim(),
      bio: bio.trim(),
      skills,
    };

    if (updateProfile) {
      await updateProfile(payload);
    }
    setIsSaving(false);
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 3000);
  };

  const completedTasks = tasks.filter((t) => t.status === 'Completed');
  const totalStoryPoints = stats.totalStoryPoints || 32;
  const completedStoryPoints = stats.completedStoryPoints || 20;

  const handlePrintPortfolio = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 animate-fade-in">
      <div
        className="bg-white rounded-3xl shadow-2xl border border-slate-200 max-w-2xl w-full overflow-hidden animate-slide-up flex flex-col max-h-[90vh]"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50/50">
          <div className="flex items-center gap-2.5">
            <div className="h-9 w-9 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold">
              <Code2 className="h-5 w-5" />
            </div>
            <div>
              <h3 className="font-extrabold text-slate-900 text-lg leading-tight">
                Developer Profile & Portfolio Hub
              </h3>
              <p className="text-xs text-slate-500">
                GitHub, Bitbucket, LinkedIn integrations & Resume Portfolio exporter
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            aria-label="Close developer profile modal"
            className="p-1.5 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-200/50 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="flex items-center border-b border-slate-100 px-6 gap-2 bg-white">
          <button
            type="button"
            onClick={() => setActiveTab('profile')}
            className={`py-3 px-3 text-xs font-bold border-b-2 flex items-center gap-1.5 transition-all ${
              activeTab === 'profile'
                ? 'border-indigo-600 text-indigo-600'
                : 'border-transparent text-slate-500 hover:text-slate-900'
            }`}
          >
            <User className="h-3.5 w-3.5" />
            <span>Developer Integrations</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('portfolio')}
            className={`py-3 px-3 text-xs font-bold border-b-2 flex items-center gap-1.5 transition-all ${
              activeTab === 'portfolio'
                ? 'border-indigo-600 text-indigo-600'
                : 'border-transparent text-slate-500 hover:text-slate-900'
            }`}
          >
            <FileText className="h-3.5 w-3.5" />
            <span>Task Portfolio Resume ({completedTasks.length} Completed)</span>
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6">
          {activeTab === 'profile' && (
            <form onSubmit={handleSaveProfile} className="space-y-4">
              {saveSuccess && (
                <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-semibold flex items-center gap-1.5 animate-fade-in">
                  <CheckCircle2 className="h-4 w-4" />
                  Developer integrations and social profile links updated successfully!
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1">
                    Developer Full Name
                  </label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl text-sm border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 font-medium"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1">
                    GitHub Username
                  </label>
                  <div className="relative">
                    <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 text-xs font-bold">
                      @
                    </span>
                    <input
                      type="text"
                      value={githubUsername}
                      onChange={(e) => setGithubUsername(e.target.value)}
                      placeholder="username"
                      className="w-full pl-8 pr-3.5 py-2.5 rounded-xl text-sm border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 font-medium"
                    />
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1">
                  Developer Bio / Headline
                </label>
                <input
                  type="text"
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  placeholder="e.g. Full-Stack Developer & DevOps Practitioner"
                  className="w-full px-3.5 py-2 rounded-xl text-xs sm:text-sm border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none font-medium"
                />
              </div>

              <div className="space-y-3 pt-2 border-t border-slate-100">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-700 block">
                  Professional Integration Hub
                </span>

                <div>
                  <label className="block text-[11px] font-bold text-slate-500 mb-1 flex items-center gap-1.5">
                    <GithubIcon className="h-3.5 w-3.5 text-slate-800" />
                    GitHub Profile URL
                  </label>
                  <input
                    type="url"
                    value={githubUrl}
                    onChange={(e) => setGithubUrl(e.target.value)}
                    placeholder="https://github.com/username"
                    className="w-full px-3.5 py-2 rounded-xl text-xs border border-slate-200 bg-slate-50 focus:bg-white font-medium"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-500 mb-1 flex items-center gap-1.5">
                    <BitbucketIcon className="h-3.5 w-3.5 text-blue-600" />
                    Bitbucket / GitLab Repository URL
                  </label>
                  <input
                    type="url"
                    value={bitbucketUrl}
                    onChange={(e) => setBitbucketUrl(e.target.value)}
                    placeholder="https://bitbucket.org/username/project"
                    className="w-full px-3.5 py-2 rounded-xl text-xs border border-slate-200 bg-slate-50 focus:bg-white font-medium"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-500 mb-1 flex items-center gap-1.5">
                    <LinkedinIcon className="h-3.5 w-3.5 text-blue-700" />
                    LinkedIn Professional Profile
                  </label>
                  <input
                    type="url"
                    value={linkedinUrl}
                    onChange={(e) => setLinkedinUrl(e.target.value)}
                    placeholder="https://linkedin.com/in/username"
                    className="w-full px-3.5 py-2 rounded-xl text-xs border border-slate-200 bg-slate-50 focus:bg-white font-medium"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-500 mb-1 flex items-center gap-1.5">
                    <Globe className="h-3.5 w-3.5 text-emerald-600" />
                    Personal Portfolio Website
                  </label>
                  <input
                    type="url"
                    value={portfolioUrl}
                    onChange={(e) => setPortfolioUrl(e.target.value)}
                    placeholder="https://yourportfolio.dev"
                    className="w-full px-3.5 py-2 rounded-xl text-xs border border-slate-200 bg-slate-50 focus:bg-white font-medium"
                  />
                </div>
              </div>

              <div className="pt-2 border-t border-slate-100 space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold uppercase tracking-wider text-slate-700">
                    Skill Tagging & Tech Stack ({skills.length})
                  </label>
                </div>

                <div className="flex flex-wrap gap-1.5">
                  {skills.map((s) => (
                    <span
                      key={s}
                      className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-indigo-50 text-indigo-700 border border-indigo-200 text-xs font-bold"
                    >
                      {s}
                      <button
                        type="button"
                        onClick={() => handleRemoveSkill(s)}
                        className="text-indigo-400 hover:text-indigo-800 ml-0.5"
                      >
                        ×
                      </button>
                    </span>
                  ))}
                </div>

                <div className="flex gap-2 pt-1">
                  <input
                    type="text"
                    value={newSkillInput}
                    onChange={(e) => setNewSkillInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        handleAddSkill();
                      }
                    }}
                    placeholder="Add a technology (e.g., Verilog, Docker)..."
                    className="flex-1 px-3 py-1.5 rounded-xl text-xs border border-slate-200 bg-slate-50 focus:bg-white font-medium"
                  />
                  <button
                    type="button"
                    onClick={() => handleAddSkill()}
                    className="px-3 py-1.5 rounded-xl bg-slate-800 text-white text-xs font-bold hover:bg-slate-700 transition-colors"
                  >
                    Add Skill
                  </button>
                </div>

                <div className="flex flex-wrap items-center gap-1 pt-1 text-[11px] text-slate-400">
                  <span className="font-semibold text-slate-500">Quick add:</span>
                  {PRESET_SKILLS.filter((p) => !skills.includes(p))
                    .slice(0, 6)
                    .map((preset) => (
                      <button
                        key={preset}
                        type="button"
                        onClick={() => handleAddSkill(preset)}
                        className="px-2 py-0.5 rounded-md bg-slate-100 hover:bg-indigo-50 hover:text-indigo-600 text-slate-600 font-medium transition-colors"
                      >
                        +{preset}
                      </button>
                    ))}
                </div>
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSaving}
                  className="px-5 py-2 rounded-xl text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 active:scale-95 shadow-sm shadow-indigo-200 transition-all flex items-center gap-1.5"
                >
                  {isSaving ? 'Saving...' : 'Save Developer Profile'}
                </button>
              </div>
            </form>
          )}

          {activeTab === 'portfolio' && (
            <div className="space-y-5">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <div>
                  <h4 className="font-extrabold text-slate-900 text-sm">
                    Verified Task Portfolio & Resume Summary
                  </h4>
                  <p className="text-xs text-slate-500">
                    Compiled from your completed tasks, linked PRs, and verified technical deliverables
                  </p>
                </div>

                <button
                  type="button"
                  onClick={handlePrintPortfolio}
                  className="px-3.5 py-2 rounded-xl bg-indigo-600 text-white text-xs font-bold hover:bg-indigo-700 active:scale-95 shadow-xs transition-all flex items-center gap-1.5"
                >
                  <Printer className="h-3.5 w-3.5" />
                  <span>Export Task Portfolio as PDF</span>
                </button>
              </div>

              <div
                id="printable-portfolio"
                className="p-6 rounded-2xl bg-slate-50 border border-slate-200 space-y-5 text-slate-900"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-200 gap-3">
                  <div>
                    <h2 className="text-xl font-black tracking-tight text-slate-900">{name}</h2>
                    <p className="text-xs font-semibold text-indigo-600 mt-0.5">{bio}</p>
                    <p className="text-[11px] text-slate-500 mt-0.5">{user?.email || 'demo@taskflow.com'}</p>
                  </div>

                  <div className="flex flex-wrap items-center gap-2 text-xs">
                    {githubUrl && (
                      <a
                        href={githubUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-white border border-slate-200 text-slate-700 font-semibold"
                      >
                        <GithubIcon className="h-3 w-3" />
                        <span>GitHub</span>
                      </a>
                    )}
                    {linkedinUrl && (
                      <a
                        href={linkedinUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-white border border-slate-200 text-slate-700 font-semibold"
                      >
                        <LinkedinIcon className="h-3 w-3" />
                        <span>LinkedIn</span>
                      </a>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-3 text-center">
                  <div className="p-3 rounded-xl bg-white border border-slate-200">
                    <div className="text-lg font-black text-indigo-600">{completedTasks.length}</div>
                    <div className="text-[10px] font-bold text-slate-500 uppercase">Deliverables Closed</div>
                  </div>
                  <div className="p-3 rounded-xl bg-white border border-slate-200">
                    <div className="text-lg font-black text-emerald-600">{completedStoryPoints} SP</div>
                    <div className="text-[10px] font-bold text-slate-500 uppercase">Story Points Earned</div>
                  </div>
                  <div className="p-3 rounded-xl bg-white border border-slate-200">
                    <div className="text-lg font-black text-amber-600">{stats.totalTimeLogged}h</div>
                    <div className="text-[10px] font-bold text-slate-500 uppercase">Productivity Hours</div>
                  </div>
                </div>

                <div>
                  <h5 className="text-xs font-bold uppercase tracking-wider text-slate-600 mb-2">
                    Technical Stack & Skills
                  </h5>
                  <div className="flex flex-wrap gap-1.5">
                    {skills.map((s) => (
                      <span
                        key={s}
                        className="px-2 py-0.5 rounded-md bg-white border border-slate-200 text-slate-800 text-xs font-semibold"
                      >
                        {s}
                      </span>
                    ))}
                  </div>
                </div>

                <div>
                  <h5 className="text-xs font-bold uppercase tracking-wider text-slate-600 mb-2">
                    Verified Project Deliverables
                  </h5>
                  <div className="space-y-2">
                    {completedTasks.map((t) => (
                      <div
                        key={t._id}
                        className="p-3 rounded-xl bg-white border border-slate-200 text-xs space-y-1"
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-slate-900">{t.title}</span>
                          <span className="font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
                            {t.storyPoints || 3} SP
                          </span>
                        </div>
                        {t.description && <p className="text-slate-500 leading-relaxed">{t.description}</p>}
                        <div className="flex flex-wrap items-center gap-2 pt-1 text-[11px] text-slate-400">
                          {t.linkedPR?.title && (
                            <span className="text-indigo-600 font-semibold">
                              🐙 PR #{t.linkedPR.number || 38}: {t.linkedPR.title}
                            </span>
                          )}
                          {t.commitHash && (
                            <span className="font-mono bg-slate-100 px-1.5 rounded text-slate-600">
                              commit: {t.commitHash}
                            </span>
                          )}
                          {Array.isArray(t.techStack) && t.techStack.length > 0 && (
                            <span>Tags: {t.techStack.join(', ')}</span>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default DeveloperProfileModal;
