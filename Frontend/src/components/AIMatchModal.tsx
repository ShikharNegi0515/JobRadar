import { useState, useEffect } from 'react';
import type { JobPost, AIMatchResult } from '../types';
import api from '../api/api';
import { Sparkles, X, CheckCircle2, AlertTriangle, Lightbulb, Copy, Check, RefreshCw, FileText } from 'lucide-react';

interface AIMatchModalProps {
  job: JobPost;
  onClose: () => void;
}

export default function AIMatchModal({ job, onClose }: AIMatchModalProps) {
  const [loading, setLoading] = useState(true);
  const [matchData, setMatchData] = useState<AIMatchResult | null>(null);
  const [resumeText, setResumeText] = useState('');
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);
  const [reanalyzing, setReanalyzing] = useState(false);

  const fetchMatch = async (customResume?: string) => {
    try {
      if (customResume) setReanalyzing(true);
      else setLoading(true);

      const jobSkillsList = job.skills ? job.skills.map((s) => s.name) : [];
      const res = await api.post('/ai/match-job', {
        jobId: job.id,
        jobTitle: job.job_title,
        jobDescription: job.description,
        jobSkills: jobSkillsList,
        resumeText: customResume || resumeText,
      });

      if (res.data?.data) {
        setMatchData(res.data.data);
      }
    } catch (err) {
      console.error('Failed to run AI match analysis', err);
    } finally {
      setLoading(false);
      setReanalyzing(false);
    }
  };

  useEffect(() => {
    fetchMatch();
  }, [job]);

  const copyToClipboard = (text: string, index: number) => {
    navigator.clipboard.writeText(text);
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  const getScoreColor = (score: number) => {
    if (score >= 75) return { text: 'text-emerald-400', border: 'border-emerald-500', bg: 'bg-emerald-500/10' };
    if (score >= 55) return { text: 'text-amber-400', border: 'border-amber-500', bg: 'bg-amber-500/10' };
    return { text: 'text-rose-400', border: 'border-rose-500', bg: 'bg-rose-500/10' };
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
      <div className="bg-[#111118] border border-[#2a2a3a] rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col shadow-2xl">
        {/* Header */}
        <div className="p-6 border-b border-[#2a2a3a] flex justify-between items-center bg-[#161622]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-600/20 border border-indigo-500/30 flex items-center justify-center text-indigo-400 shadow-[0_0_15px_rgba(99,102,241,0.3)]">
              <Sparkles size={20} />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white leading-tight">AI Resume Matcher</h2>
              <p className="text-sm text-gray-400">{job.job_title} • {job.company_name || job.author_name}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-white rounded-lg hover:bg-gray-800 transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1">
          {loading ? (
            <div className="py-16 text-center space-y-4">
              <div className="w-12 h-12 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
              <p className="text-gray-300 font-medium animate-pulse">Analyzing skill overlap and AI resume compatibility...</p>
            </div>
          ) : matchData ? (
            <>
              {/* Score Gauge & Summary Banner */}
              <div className={`p-6 rounded-xl border ${getScoreColor(matchData.match_score).border} ${getScoreColor(matchData.match_score).bg} flex flex-col sm:flex-row items-center gap-6`}>
                <div className="relative flex items-center justify-center flex-shrink-0">
                  <svg className="w-24 h-24 transform -rotate-90">
                    <circle cx="48" cy="48" r="40" stroke="currentColor" strokeWidth="8" className="text-gray-800" fill="transparent" />
                    <circle
                      cx="48"
                      cy="48"
                      r="40"
                      stroke="currentColor"
                      strokeWidth="8"
                      className={getScoreColor(matchData.match_score).text}
                      fill="transparent"
                      strokeDasharray={251.2}
                      strokeDashoffset={251.2 - (251.2 * matchData.match_score) / 100}
                      strokeLinecap="round"
                    />
                  </svg>
                  <span className={`absolute text-2xl font-black ${getScoreColor(matchData.match_score).text}`}>
                    {matchData.match_score}%
                  </span>
                </div>

                <div className="flex-1 text-center sm:text-left">
                  <h3 className="text-lg font-bold text-white mb-1">Resume Alignment Score</h3>
                  <p className="text-sm text-gray-300 leading-relaxed">{matchData.summary}</p>
                </div>
              </div>

              {/* Skills Breakdown */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Matching Skills */}
                <div className="p-4 rounded-xl bg-[#161622] border border-[#2a2a3a]">
                  <div className="flex items-center gap-2 mb-3 text-emerald-400 font-semibold text-sm">
                    <CheckCircle2 size={16} /> Matched Skills ({matchData.matching_skills.length})
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {matchData.matching_skills.map((skill, idx) => (
                      <span key={idx} className="px-2.5 py-1 rounded-md text-xs bg-emerald-500/10 text-emerald-300 border border-emerald-500/30">
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Missing Skills (Skill Gap) */}
                <div className="p-4 rounded-xl bg-[#161622] border border-[#2a2a3a]">
                  <div className="flex items-center gap-2 mb-3 text-amber-400 font-semibold text-sm">
                    <AlertTriangle size={16} /> Skill Gaps ({matchData.missing_skills.length})
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {matchData.missing_skills.length > 0 ? (
                      matchData.missing_skills.map((skill, idx) => (
                        <span key={idx} className="px-2.5 py-1 rounded-md text-xs bg-amber-500/10 text-amber-300 border border-amber-500/30">
                          {skill}
                        </span>
                      ))
                    ) : (
                      <span className="text-xs text-gray-400">No major missing skills identified!</span>
                    )}
                  </div>
                </div>
              </div>

              {/* AI Recommendations */}
              <div className="p-4 rounded-xl bg-[#161622] border border-[#2a2a3a]">
                <h4 className="text-sm font-semibold text-white mb-3 flex items-center gap-2">
                  <Lightbulb size={16} className="text-indigo-400" /> AI Strategic Recommendations
                </h4>
                <ul className="space-y-2 text-xs text-gray-300">
                  {matchData.recommendations.map((rec, i) => (
                    <li key={i} className="flex items-start gap-2">
                      <span className="text-indigo-400 font-bold">•</span>
                      <span>{rec}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Resume Bullet Point Suggestions */}
              <div className="p-4 rounded-xl bg-[#161622] border border-[#2a2a3a]">
                <h4 className="text-sm font-semibold text-white mb-3 flex items-center gap-2">
                  <FileText size={16} className="text-emerald-400" /> Tailored Resume Bullet Points
                </h4>
                <div className="space-y-2">
                  {matchData.resume_bullet_suggestions.map((bullet, idx) => (
                    <div key={idx} className="p-3 bg-[#0d0d12] rounded-lg border border-[#222232] flex items-center justify-between text-xs text-gray-200">
                      <span>"{bullet}"</span>
                      <button
                        onClick={() => copyToClipboard(bullet, idx)}
                        className="ml-3 p-1.5 text-gray-400 hover:text-white rounded hover:bg-gray-800 transition-colors flex items-center gap-1 text-[11px]"
                      >
                        {copiedIndex === idx ? (
                          <><Check size={14} className="text-emerald-400" /> Copied</>
                        ) : (
                          <><Copy size={14} /> Copy</>
                        )}
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              {/* Custom Resume Paste Section */}
              <div className="p-4 rounded-xl bg-[#161622] border border-[#2a2a3a]">
                <h4 className="text-sm font-semibold text-white mb-2">Test Custom Resume / Bio Text</h4>
                <textarea
                  className="w-full h-24 p-3 bg-[#0d0d12] border border-[#2a2a3a] rounded-lg text-xs text-gray-200 focus:outline-none focus:border-indigo-500 resize-none mb-3"
                  placeholder="Paste your resume bullet points or summary text here to refine match score..."
                  value={resumeText}
                  onChange={(e) => setResumeText(e.target.value)}
                />
                <button
                  onClick={() => fetchMatch(resumeText)}
                  disabled={reanalyzing}
                  className="btn-primary w-full py-2 text-xs flex items-center justify-center gap-2"
                >
                  <RefreshCw size={14} className={reanalyzing ? 'animate-spin' : ''} />
                  {reanalyzing ? 'Re-Analyzing Match...' : 'Re-Analyze Match Score'}
                </button>
              </div>
            </>
          ) : (
            <div className="py-12 text-center text-gray-400">Failed to load AI match analysis.</div>
          )}
        </div>
      </div>
    </div>
  );
}
