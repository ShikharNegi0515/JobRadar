import { useState } from 'react';
import type { JobPost } from '../types';
import { Bookmark, Clock, MapPin, Briefcase, ExternalLink, PlusCircle, Sparkles } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import AIMatchModal from './AIMatchModal';

interface JobCardProps {
  job: JobPost;
  onSave?: (id: string) => void;
  onApply?: (id: string) => void;
  saved?: boolean;
}

export default function JobCard({ job, onSave, onApply, saved = false }: JobCardProps) {
  const [showAIMatch, setShowAIMatch] = useState(false);
  const timeAgo = formatDistanceToNow(new Date(job.posted_at), { addSuffix: true });
  
  // Format salary
  const formatSalary = () => {
    if (!job.salary_min && !job.salary_max) return null;
    const currency = job.salary_currency || '$';
    const min = job.salary_min ? (job.salary_min / 1000) + 'k' : '';
    const max = job.salary_max ? (job.salary_max / 1000) + 'k' : '';
    
    if (min && max) return `${currency}${min} - ${currency}${max}`;
    if (min) return `${currency}${min}+`;
    if (max) return `Up to ${currency}${max}`;
    return null;
  };
  
  const salary = formatSalary();

  return (
    <>
      <div className="glass-card p-5 flex flex-col h-full fade-in relative group">
        {/* 24h Badge */}
        <div className="absolute -top-3 -right-2 bg-indigo-600 text-white text-[10px] font-bold px-2 py-1 rounded-full shadow-[0_0_10px_rgba(79,70,229,0.5)] z-10 border border-indigo-400">
          NEW
        </div>

        <div className="flex justify-between items-start mb-4">
          <div>
            <h3 className="text-lg font-bold text-white group-hover:text-indigo-400 transition-colors line-clamp-1">{job.job_title}</h3>
            <p className="text-gray-400 text-sm font-medium">{job.company_name || job.author_name}</p>
          </div>
          {onSave && (
            <button 
              onClick={() => onSave(job.id)}
              className={`p-2 rounded-full transition-colors ${saved ? 'bg-indigo-500/20 text-indigo-400' : 'bg-gray-800 text-gray-400 hover:text-white hover:bg-gray-700'}`}
              title={saved ? 'Unsave' : 'Save Job'}
            >
              <Bookmark size={18} fill={saved ? 'currentColor' : 'none'} />
            </button>
          )}
        </div>

        <div className="flex flex-wrap gap-2 mb-4">
          {job.location && (
            <span className="badge bg-gray-800 text-gray-300 border border-gray-700">
              <MapPin size={12} /> {job.location}
            </span>
          )}
          {job.work_mode && (
            <span className={`badge badge-${job.work_mode.toLowerCase()}`}>
              {job.work_mode}
            </span>
          )}
          {job.employment_type && (
            <span className="badge bg-gray-800 text-gray-300 border border-gray-700">
              <Briefcase size={12} /> {job.employment_type.replace('_', ' ')}
            </span>
          )}
          {salary && (
            <span className="badge bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              {salary}
            </span>
          )}
        </div>

        <p className="text-sm text-gray-400 line-clamp-3 mb-4 flex-1">
          {job.description || "No description provided."}
        </p>

        {job.skills && job.skills.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mb-5">
            {job.skills.slice(0, 4).map(skill => (
              <span key={skill.id} className="badge badge-skill text-[10px]">
                {skill.name}
              </span>
            ))}
            {job.skills.length > 4 && (
               <span className="badge bg-gray-800 text-gray-400 text-[10px]">+{job.skills.length - 4}</span>
            )}
          </div>
        )}

        <div className="flex items-center justify-between mt-auto pt-4 border-t border-gray-800">
          <div className="flex items-center text-xs text-gray-500">
            <Clock size={12} className="mr-1" />
            {timeAgo}
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => setShowAIMatch(true)}
              className="btn-secondary px-2.5 py-1.5 text-xs text-indigo-400 hover:text-white hover:bg-indigo-600/30 border-indigo-500/30 flex items-center gap-1"
              title="AI Resume Matcher"
            >
              <Sparkles size={14} className="text-indigo-400" /> Match
            </button>
            {job.source_url && (
              <a 
                href={job.source_url} 
                target="_blank" 
                rel="noopener noreferrer"
                className="btn-secondary px-3 py-1.5 text-xs"
              >
                <ExternalLink size={14} className="mr-1" /> Source
              </a>
            )}
            {onApply && (
              <button 
                onClick={() => onApply(job.id)}
                className="btn-primary px-3 py-1.5 text-xs bg-indigo-600 hover:bg-indigo-500 text-white border-none"
              >
                <PlusCircle size={14} className="mr-1" /> Track
              </button>
            )}
          </div>
        </div>
      </div>

      {showAIMatch && (
        <AIMatchModal job={job} onClose={() => setShowAIMatch(false)} />
      )}
    </>
  );
}

