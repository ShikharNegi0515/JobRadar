import { useEffect } from 'react';
import type { JobPost } from '../types';
import {
  X, MapPin, Briefcase, Clock, ExternalLink, Bookmark,
  PlusCircle, Sparkles, Building2, Users, DollarSign,
  Calendar, Hash, Globe, CheckCircle2, Tag
} from 'lucide-react';
import { formatDistanceToNow, format } from 'date-fns';

// Inline LinkedIn SVG (lucide-react doesn't export it)
function LinkedInIcon({ size = 14, className = '' }: { size?: number; className?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" className={className}>
      <path d="M16 8a6 6 0 016 6v7h-4v-7a2 2 0 00-2-2 2 2 0 00-2 2v7h-4v-7a6 6 0 016-6zM2 9h4v12H2zm2-3a2 2 0 100-4 2 2 0 000 4z"/>
    </svg>
  );
}

interface JobDetailDrawerProps {
  job: JobPost;
  onClose: () => void;
  onSave?: (id: string) => void;
  onApply?: (id: string) => void;
  onAIMatch?: (job: JobPost) => void;
  saved?: boolean;
}

const workModeConfig = {
  REMOTE:        { label: 'Remote',    cls: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30' },
  HYBRID:        { label: 'Hybrid',    cls: 'bg-amber-500/15 text-amber-400 border-amber-500/30' },
  ONSITE:        { label: 'On-site',   cls: 'bg-rose-500/15 text-rose-400 border-rose-500/30' },
  NOT_SPECIFIED: { label: 'Flexible',  cls: 'bg-gray-500/15 text-gray-400 border-gray-500/30' },
};

const empTypeConfig: Record<string, string> = {
  FULL_TIME:  'Full Time',
  PART_TIME:  'Part Time',
  CONTRACT:   'Contract',
  INTERNSHIP: 'Internship',
};

export default function JobDetailDrawer({ job, onClose, onSave, onApply, onAIMatch, saved = false }: JobDetailDrawerProps) {
  // Close on Escape key
  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [onClose]);

  const timeAgo    = formatDistanceToNow(new Date(job.posted_at), { addSuffix: true });
  const dateStr    = format(new Date(job.posted_at), 'dd MMM yyyy, hh:mm a');
  const sourceUrl  = job.source_url || job.application_url || job.author_profile_url;
  const companyDisplay =
    job.company_name && !['LinkedIn User', 'LinkedIn Member'].includes(job.company_name)
      ? job.company_name
      : job.author_name && !['LinkedIn User', 'LinkedIn Member'].includes(job.author_name ?? '')
      ? job.author_name
      : 'LinkedIn Recruiter';

  const formatSalary = () => {
    if (!job.salary_min && !job.salary_max) return null;
    const c = job.salary_currency === 'INR' ? '₹' : (job.salary_currency || '$');
    const min = job.salary_min ? (job.salary_min / 1000) + 'k' : '';
    const max = job.salary_max ? (job.salary_max / 1000) + 'k' : '';
    if (min && max) return `${c}${min} – ${c}${max} / yr`;
    if (min) return `${c}${min}+ / yr`;
    return `Up to ${c}${max} / yr`;
  };

  const salary = formatSalary();
  const wm = workModeConfig[job.work_mode ?? 'NOT_SPECIFIED'] ?? workModeConfig.NOT_SPECIFIED;


  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Drawer panel */}
      <div
        className="fixed right-0 top-0 bottom-0 z-50 w-full max-w-2xl flex flex-col bg-[#0e0e1a] border-l border-[#2a2a3a] shadow-2xl shadow-black/60"
        style={{ animation: 'slideInRight 0.28s cubic-bezier(0.25,0.46,0.45,0.94)' }}
      >
        {/* Top accent stripe */}
        <div className="h-[3px] w-full bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 shrink-0" />

        {/* Header */}
        <div className="flex items-start gap-4 px-6 py-5 border-b border-[#1e1e2e] shrink-0">
          {/* Company avatar */}
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-indigo-600/40 to-purple-600/40 border border-indigo-500/30 flex items-center justify-center text-2xl font-bold text-indigo-300 shrink-0 select-none">
            {companyDisplay.charAt(0).toUpperCase()}
          </div>

          <div className="flex-1 min-w-0">
            <h2 className="text-xl font-bold text-white leading-tight mb-1 pr-8">{job.job_title}</h2>
            <div className="flex items-center gap-2 text-sm text-gray-400 flex-wrap">
              <span className="flex items-center gap-1 font-medium text-gray-300">
                <Building2 size={13} className="text-indigo-400" /> {companyDisplay}
              </span>
              {job.location && (
                <>
                  <span className="text-gray-700">·</span>
                  <span className="flex items-center gap-1">
                    <MapPin size={12} className="text-rose-400" /> {job.location}
                  </span>
                </>
              )}
            </div>
          </div>

          <button
            onClick={onClose}
            className="absolute top-5 right-4 p-2 rounded-xl text-gray-500 hover:text-white hover:bg-[#1e1e2e] transition-all"
          >
            <X size={18} />
          </button>
        </div>

        {/* Scrollable body */}
        <div className="flex-1 overflow-y-auto px-6 py-5 space-y-6">

          {/* Quick meta badges */}
          <div className="flex flex-wrap gap-2">
            <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold border ${wm.cls}`}>
              <Globe size={12} /> {wm.label}
            </span>
            {job.employment_type && (
              <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-sky-500/10 text-sky-300 border border-sky-500/20">
                <Briefcase size={12} /> {empTypeConfig[job.employment_type] ?? job.employment_type.replace('_',' ')}
              </span>
            )}
            {salary && (
              <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                <DollarSign size={12} /> {salary}
              </span>
            )}
            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-[#111118] text-gray-400 border border-[#2a2a3a] capitalize">
              {job.source !== 'remotive' && <LinkedInIcon size={12} className="text-blue-400" />} {job.source || 'LinkedIn'}
            </span>
            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-[#111118] text-gray-400 border border-[#2a2a3a]">
              <Clock size={12} /> {timeAgo}
            </span>
          </div>

          {/* AI action bar */}
          <div className="flex gap-2">
            {onAIMatch && (
              <button
                onClick={() => onAIMatch(job)}
                className="flex-1 py-2.5 rounded-xl bg-indigo-500/10 hover:bg-indigo-500/20 border border-indigo-500/30 text-indigo-300 hover:text-white text-sm font-medium flex items-center justify-center gap-2 transition-all"
              >
                <Sparkles size={15} /> AI Resume Match
              </button>
            )}
            {onSave && (
              <button
                onClick={() => onSave(job.id)}
                className={`flex-1 py-2.5 rounded-xl border text-sm font-medium flex items-center justify-center gap-2 transition-all
                  ${saved
                    ? 'bg-indigo-500/20 border-indigo-500/40 text-indigo-300'
                    : 'bg-[#111118] border-[#2a2a3a] text-gray-400 hover:text-white hover:border-indigo-500/40'
                  }`}
              >
                <Bookmark size={15} fill={saved ? 'currentColor' : 'none'} />
                {saved ? 'Saved' : 'Save Job'}
              </button>
            )}
            {onApply && (
              <button
                onClick={() => onApply(job.id)}
                className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white text-sm font-semibold flex items-center justify-center gap-2 transition-all shadow-lg shadow-indigo-600/20"
              >
                <PlusCircle size={15} /> Track Application
              </button>
            )}
          </div>

          {/* Original Post content */}
          {(job as any).raw_content ? (
            <section>
              <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-widest mb-3 flex items-center gap-2">
                <Tag size={12} /> Original Post
              </h3>
              <div className="bg-[#111118] border border-[#1e1e2e] rounded-xl p-4 text-sm text-gray-300 leading-relaxed whitespace-pre-wrap">
                {(job as any).raw_content}
              </div>
            </section>
          ) : job.description && (
            <section>
              <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-widest mb-3 flex items-center gap-2">
                <Hash size={12} /> Role Summary
              </h3>
              <p className="text-gray-300 text-sm leading-relaxed bg-[#111118] border border-[#1e1e2e] rounded-xl p-4 whitespace-pre-wrap">
                {job.description}
              </p>
            </section>
          )}

          {/* Skills */}
          {job.skills && job.skills.length > 0 && (
            <section>
              <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-widest mb-3 flex items-center gap-2">
                <CheckCircle2 size={12} /> Required Skills ({job.skills.length})
              </h3>
              <div className="flex flex-wrap gap-2">
                {job.skills.map(skill => (
                  <span
                    key={skill.id}
                    className="px-3 py-1.5 bg-indigo-500/10 border border-indigo-500/25 text-indigo-300 text-xs rounded-lg font-medium"
                  >
                    {skill.name}
                  </span>
                ))}
              </div>
            </section>
          )}

          {/* Application info */}
          {(job.application_email || job.application_url) && (
            <section>
              <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-widest mb-3 flex items-center gap-2">
                <Users size={12} /> How to Apply
              </h3>
              <div className="bg-[#111118] border border-[#1e1e2e] rounded-xl p-4 space-y-2 text-sm">
                {job.application_email && (
                  <p className="text-gray-300">
                    📧 Send CV to:{' '}
                    <a href={`mailto:${job.application_email}`} className="text-indigo-400 hover:text-indigo-300 underline">
                      {job.application_email}
                    </a>
                  </p>
                )}
                {job.application_url && job.application_url !== sourceUrl && (
                  <a
                    href={job.application_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 text-sky-400 hover:text-sky-300"
                  >
                    <ExternalLink size={13} /> Apply via link
                  </a>
                )}
              </div>
            </section>
          )}

          {/* Metadata */}
          <section>
            <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-widest mb-3 flex items-center gap-2">
              <Calendar size={12} /> Post Details
            </h3>
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-[#111118] border border-[#1e1e2e] rounded-xl p-3">
                <p className="text-[10px] text-gray-600 uppercase tracking-wider mb-1">Posted</p>
                <p className="text-sm text-gray-300 font-medium">{dateStr}</p>
              </div>
              <div className="bg-[#111118] border border-[#1e1e2e] rounded-xl p-3">
                <p className="text-[10px] text-gray-600 uppercase tracking-wider mb-1">Posted by</p>
                <p className="text-sm text-gray-300 font-medium truncate">{job.author_name || '—'}</p>
              </div>
              <div className="bg-[#111118] border border-[#1e1e2e] rounded-xl p-3">
                <p className="text-[10px] text-gray-600 uppercase tracking-wider mb-1">Engagement</p>
                <p className="text-sm text-gray-300 font-medium">
                  👍 {job.popularity_score ?? 0} pts
                </p>
              </div>
              <div className="bg-[#111118] border border-[#1e1e2e] rounded-xl p-3">
                <p className="text-[10px] text-gray-600 uppercase tracking-wider mb-1">Source</p>
                <p className="text-sm text-gray-300 font-medium capitalize">{job.source}</p>
              </div>
            </div>
          </section>
        </div>

        {/* Sticky bottom CTA */}
        {sourceUrl && (
          <div className="px-6 py-4 border-t border-[#1e1e2e] bg-[#0e0e1a] shrink-0">
            <a
              href={sourceUrl}
              target="_blank"
              rel="noopener noreferrer"
              className={`w-full py-3 rounded-xl text-white font-bold text-sm flex items-center justify-center gap-2 transition-all shadow-lg ${job.source === 'remotive' ? 'bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 shadow-purple-600/20' : 'bg-gradient-to-r from-sky-600 to-blue-600 hover:from-sky-500 hover:to-blue-500 shadow-sky-600/20'}`}
            >
              {job.source !== 'remotive' && <LinkedInIcon size={16} />} View Original {job.source === 'remotive' ? 'Remotive' : 'LinkedIn'} Post
              <ExternalLink size={14} className="ml-1 opacity-70" />
            </a>
          </div>
        )}
      </div>
    </>
  );
}
