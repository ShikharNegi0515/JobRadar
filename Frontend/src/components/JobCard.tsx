import { useState } from 'react';
import type { JobPost } from '../types';
import {
  Bookmark, Clock, MapPin, Briefcase, ExternalLink,
  PlusCircle, Sparkles, Building2, ThumbsUp, MessageCircle, ChevronRight
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import AIMatchModal from './AIMatchModal';
import JobDetailDrawer from './JobDetailDrawer';

interface JobCardProps {
  job: JobPost;
  onSave?: (id: string) => void;
  onApply?: (id: string) => void;
  saved?: boolean;
}

const workModeColors: Record<string, string> = {
  REMOTE:        'bg-emerald-500/15 text-emerald-400 border-emerald-500/25',
  HYBRID:        'bg-amber-500/15 text-amber-400 border-amber-500/25',
  ONSITE:        'bg-rose-500/15 text-rose-400 border-rose-500/25',
  NOT_SPECIFIED: 'bg-gray-500/10 text-gray-400 border-gray-600/30',
};

export default function JobCard({ job, onSave, onApply, saved = false }: JobCardProps) {
  const [showAIMatch, setShowAIMatch] = useState(false);
  const [showDrawer, setShowDrawer] = useState(false);

  const timeAgo = formatDistanceToNow(new Date(job.posted_at), { addSuffix: true });

  const formatSalary = () => {
    if (!job.salary_min && !job.salary_max) return null;
    const c = job.salary_currency === 'INR' ? '₹' : (job.salary_currency || '$');
    const min = job.salary_min ? (job.salary_min / 1000) + 'k' : '';
    const max = job.salary_max ? (job.salary_max / 1000) + 'k' : '';
    if (min && max) return `${c}${min}–${c}${max}`;
    if (min) return `${c}${min}+`;
    return `Up to ${c}${max}`;
  };

  const salary = formatSalary();
  const directSourceUrl = job.source_url || job.application_url || job.author_profile_url;
  const wm = job.work_mode && job.work_mode !== 'NOT_SPECIFIED' ? job.work_mode : null;

  const companyDisplay =
    job.company_name && !['LinkedIn User', 'LinkedIn Member'].includes(job.company_name)
      ? job.company_name
      : job.author_name && !['LinkedIn User', 'LinkedIn Member'].includes(job.author_name ?? '')
      ? job.author_name
      : 'LinkedIn Recruiter';

  // Avatar letter
  const avatarLetter = companyDisplay.charAt(0).toUpperCase();

  // Color seed for avatar gradient (consistent per company)
  const hue = (companyDisplay.split('').reduce((a, c) => a + c.charCodeAt(0), 0) * 37) % 360;

  return (
    <>
      {/* ── Card ── */}
      <div
        onClick={() => setShowDrawer(true)}
        className="relative flex flex-col bg-[#13131d] border border-[#22223a] rounded-2xl overflow-hidden cursor-pointer group fade-in
          hover:border-indigo-500/50 hover:shadow-[0_0_28px_rgba(99,102,241,0.12)] transition-all duration-200 hover:-translate-y-0.5"
      >
        {/* Top gradient line */}
        <div
          className="h-[3px] w-full shrink-0 opacity-70 group-hover:opacity-100 transition-opacity"
          style={{ background: `linear-gradient(90deg, hsl(${hue},70%,55%), hsl(${(hue+60)%360},70%,65%))` }}
        />

        {/* Badges (top-right) */}
        <div className="absolute top-3 right-3 flex gap-1.5 z-10">
          <span className="bg-blue-600/80 text-white text-[9px] font-bold px-1.5 py-0.5 rounded-full border border-blue-400/50 backdrop-blur-sm">
            LI
          </span>
          <span className="bg-indigo-600/90 text-white text-[9px] font-bold px-1.5 py-0.5 rounded-full border border-indigo-400/50 shadow-[0_0_8px_rgba(99,102,241,0.5)]">
            NEW
          </span>
        </div>

        <div className="flex flex-col flex-1 p-5">
          {/* Company row */}
          <div className="flex items-center gap-3 mb-4">
            <div
              className="w-10 h-10 rounded-xl flex items-center justify-center text-sm font-bold text-white shrink-0 select-none"
              style={{ background: `linear-gradient(135deg, hsl(${hue},70%,40%), hsl(${(hue+60)%360},70%,50%))` }}
            >
              {avatarLetter}
            </div>
            <div className="min-w-0">
              <h3 className="text-[15px] font-bold text-white group-hover:text-indigo-300 transition-colors leading-tight line-clamp-1">
                {job.job_title}
              </h3>
              <p className="text-gray-500 text-xs font-medium flex items-center gap-1 mt-0.5 line-clamp-1">
                <Building2 size={10} className="shrink-0 text-gray-600" /> {companyDisplay}
              </p>
            </div>
          </div>

          {/* Meta badges */}
          <div className="flex flex-wrap gap-1.5 mb-3">
            {job.location && (
              <span className="inline-flex items-center gap-1 px-2 py-1 text-[11px] font-medium bg-[#1a1a27] text-gray-400 border border-[#2a2a3a] rounded-lg">
                <MapPin size={10} className="text-rose-400 shrink-0" /> {job.location}
              </span>
            )}
            {wm && (
              <span className={`inline-flex items-center gap-1 px-2 py-1 text-[11px] font-semibold rounded-lg border ${workModeColors[wm]}`}>
                {wm}
              </span>
            )}
            {job.employment_type && (
              <span className="inline-flex items-center gap-1 px-2 py-1 text-[11px] font-medium bg-[#1a1a27] text-gray-400 border border-[#2a2a3a] rounded-lg">
                <Briefcase size={10} className="shrink-0" /> {job.employment_type.replace('_', ' ')}
              </span>
            )}
            {salary && (
              <span className="inline-flex items-center gap-1 px-2 py-1 text-[11px] font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 rounded-lg">
                {salary}
              </span>
            )}
          </div>

          {/* Description snippet */}
          <p className="text-xs text-gray-500 line-clamp-2 leading-relaxed flex-1 mb-3">
            {job.description || 'Click to view the full job post and details.'}
          </p>

          {/* Skills */}
          {job.skills && job.skills.length > 0 && (
            <div className="flex flex-wrap gap-1 mb-4">
              {job.skills.slice(0, 4).map(skill => (
                <span
                  key={skill.id}
                  className="px-2 py-0.5 bg-indigo-500/10 border border-indigo-500/20 text-indigo-300 text-[10px] rounded-md font-medium"
                >
                  {skill.name}
                </span>
              ))}
              {job.skills.length > 4 && (
                <span className="px-2 py-0.5 bg-[#1a1a27] text-gray-500 text-[10px] rounded-md border border-[#2a2a3a]">
                  +{job.skills.length - 4}
                </span>
              )}
            </div>
          )}

          {/* Footer */}
          <div
            className="flex items-center justify-between pt-3 border-t border-[#1e1e2e] mt-auto"
            onClick={e => e.stopPropagation()} // prevent drawer open on action clicks
          >
            {/* Time + engagement */}
            <div className="flex items-center gap-3 text-[11px] text-gray-600">
              <span className="flex items-center gap-1">
                <Clock size={11} /> {timeAgo}
              </span>
              {((job as any).likes > 0 || (job as any).comments > 0) && (
                <span className="flex items-center gap-2">
                  {(job as any).likes > 0 && (
                    <span className="flex items-center gap-0.5">
                      <ThumbsUp size={10} /> {(job as any).likes}
                    </span>
                  )}
                  {(job as any).comments > 0 && (
                    <span className="flex items-center gap-0.5">
                      <MessageCircle size={10} /> {(job as any).comments}
                    </span>
                  )}
                </span>
              )}
            </div>

            {/* Action buttons */}
            <div className="flex items-center gap-1">
              <button
                onClick={() => setShowAIMatch(true)}
                className="p-1.5 rounded-lg text-indigo-400 hover:text-white hover:bg-indigo-500/20 transition-all"
                title="AI Match"
              >
                <Sparkles size={14} />
              </button>
              {onSave && (
                <button
                  onClick={() => onSave(job.id)}
                  className={`p-1.5 rounded-lg transition-all ${saved ? 'text-indigo-400 bg-indigo-500/20' : 'text-gray-500 hover:text-white hover:bg-[#1e1e2e]'}`}
                  title={saved ? 'Unsave' : 'Save'}
                >
                  <Bookmark size={14} fill={saved ? 'currentColor' : 'none'} />
                </button>
              )}
              {directSourceUrl && (
                <a
                  href={directSourceUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-1.5 rounded-lg text-sky-400 hover:text-white hover:bg-sky-500/20 transition-all"
                  title="Open source"
                >
                  <ExternalLink size={14} />
                </a>
              )}
              {onApply && (
                <button
                  onClick={() => onApply(job.id)}
                  className="p-1.5 rounded-lg text-emerald-400 hover:text-white hover:bg-emerald-500/20 transition-all"
                  title="Track application"
                >
                  <PlusCircle size={14} />
                </button>
              )}
              {/* View detail hint */}
              <span className="ml-0.5 p-1 text-gray-700 group-hover:text-indigo-500 transition-colors">
                <ChevronRight size={14} />
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* ── Detail Drawer ── */}
      {showDrawer && (
        <JobDetailDrawer
          job={job}
          onClose={() => setShowDrawer(false)}
          onSave={onSave}
          onApply={onApply}
          onAIMatch={() => { setShowDrawer(false); setShowAIMatch(true); }}
          saved={saved}
        />
      )}

      {/* ── AI Match Modal ── */}
      {showAIMatch && (
        <AIMatchModal job={job} onClose={() => setShowAIMatch(false)} />
      )}
    </>
  );
}
