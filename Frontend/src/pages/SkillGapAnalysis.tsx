import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import api from '../api/api';
import type { SkillGapOverview } from '../types';
import { Sparkles, TrendingUp, CheckCircle, AlertCircle, Plus, BookOpen, Target, Layers } from 'lucide-react';

export default function SkillGapAnalysis() {
  const [newSkill, setNewSkill] = useState('');
  const [addedSkills, setAddedSkills] = useState<string[]>([]);

  const { data, isLoading, error } = useQuery<{ success: boolean; data: SkillGapOverview }>({
    queryKey: ['skill-gaps'],
    queryFn: async () => {
      const res = await api.get('/ai/skill-gaps');
      return res.data;
    },
  });

  const handleAddSkill = (e: React.FormEvent) => {
    e.preventDefault();
    if (newSkill.trim() && !addedSkills.includes(newSkill.trim())) {
      setAddedSkills([...addedSkills, newSkill.trim()]);
      setNewSkill('');
    }
  };

  const getPriorityBadge = (priority: 'HIGH' | 'MEDIUM' | 'LOW') => {
    switch (priority) {
      case 'HIGH':
        return 'bg-rose-500/10 text-rose-400 border-rose-500/30';
      case 'MEDIUM':
        return 'bg-amber-500/10 text-amber-400 border-amber-500/30';
      case 'LOW':
        return 'bg-indigo-500/10 text-indigo-400 border-indigo-500/30';
    }
  };

  return (
    <div className="p-8 h-full flex flex-col overflow-y-auto">
      <header className="mb-8 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-xs font-semibold mb-2">
            <Sparkles size={14} /> AI Career Intelligence
          </div>
          <h1 className="text-3xl font-bold text-white">Skill Gap Analysis</h1>
          <p className="text-gray-400">Market demand insights and up-skilling recommendations based on live job posts.</p>
        </div>
      </header>

      {isLoading ? (
        <div className="py-20 text-center space-y-4">
          <div className="w-10 h-10 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="text-gray-400">Aggregating market skill gaps...</p>
        </div>
      ) : error || !data?.data ? (
        <div className="p-6 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400">
          Failed to load skill gap analysis. Please try refreshing.
        </div>
      ) : (
        <div className="space-y-8 pb-12">
          {/* Top Overview Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Preparedness Score */}
            <div className="glass-card p-6 flex items-center gap-5">
              <div className="w-14 h-14 rounded-2xl bg-indigo-600/20 border border-indigo-500/30 flex items-center justify-center text-indigo-400 font-black text-xl shadow-[0_0_20px_rgba(99,102,241,0.2)]">
                {data.data.overallPreparednessScore}%
              </div>
              <div>
                <div className="text-xs font-medium text-gray-400">Market Preparedness</div>
                <div className="text-lg font-bold text-white">Job Readiness</div>
                <div className="text-xs text-emerald-400 flex items-center gap-1 mt-0.5">
                  <TrendingUp size={12} /> Top 20% profile match
                </div>
              </div>
            </div>

            {/* Target Jobs Analyzed */}
            <div className="glass-card p-6 flex items-center gap-5">
              <div className="w-14 h-14 rounded-2xl bg-purple-600/20 border border-purple-500/30 flex items-center justify-center text-purple-400 font-bold text-xl">
                <Target size={24} />
              </div>
              <div>
                <div className="text-xs font-medium text-gray-400">Sample Size</div>
                <div className="text-lg font-bold text-white">{data.data.totalTargetJobsAnalyzed} Jobs</div>
                <div className="text-xs text-gray-400 mt-0.5">Scanned from last 24h</div>
              </div>
            </div>

            {/* Current Active Skills */}
            <div className="glass-card p-6 flex items-center gap-5">
              <div className="w-14 h-14 rounded-2xl bg-emerald-600/20 border border-emerald-500/30 flex items-center justify-center text-emerald-400 font-bold text-xl">
                <Layers size={24} />
              </div>
              <div>
                <div className="text-xs font-medium text-gray-400">Verified Profile Stack</div>
                <div className="text-lg font-bold text-white">{data.data.userCurrentSkills.length + addedSkills.length} Skills</div>
                <div className="text-xs text-emerald-400 mt-0.5">Active on resume</div>
              </div>
            </div>
          </div>

          {/* User Skills Manager */}
          <div className="p-6 bg-[#111118] border border-[#2a2a3a] rounded-2xl">
            <h3 className="text-base font-bold text-white mb-3">Your Current Tech Stack</h3>
            <div className="flex flex-wrap gap-2 mb-4">
              {data.data.userCurrentSkills.concat(addedSkills).map((skill, i) => (
                <span key={i} className="badge bg-indigo-500/10 text-indigo-300 border border-indigo-500/30 px-3 py-1 text-xs flex items-center gap-1.5">
                  <CheckCircle size={12} className="text-indigo-400" /> {skill}
                </span>
              ))}
            </div>

            <form onSubmit={handleAddSkill} className="flex gap-2 max-w-md">
              <input
                type="text"
                className="input-field text-xs h-9 flex-1"
                placeholder="Add a new skill (e.g., GraphQL, Docker, Rust)..."
                value={newSkill}
                onChange={(e) => setNewSkill(e.target.value)}
              />
              <button type="submit" className="btn-secondary h-9 px-3 text-xs flex items-center gap-1">
                <Plus size={14} /> Add
              </button>
            </form>
          </div>

          {/* In-Demand Missing Skills List */}
          <div>
            <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
              <AlertCircle size={20} className="text-amber-400" /> Top Market Skill Gaps
            </h2>

            <div className="grid grid-cols-1 gap-4">
              {data.data.topMissingSkills.map((gap, index) => (
                <div key={index} className="glass-card p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 hover:border-[#3a3a4e] transition-colors">
                  <div className="flex-1 space-y-2">
                    <div className="flex items-center gap-3">
                      <h3 className="text-base font-bold text-white">{gap.skill}</h3>
                      <span className="text-xs px-2 py-0.5 rounded bg-gray-800 text-gray-400 border border-gray-700">
                        {gap.category}
                      </span>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded border ${getPriorityBadge(gap.priority)}`}>
                        {gap.priority} PRIORITY
                      </span>
                    </div>

                    <p className="text-xs text-gray-300 flex items-start gap-1.5">
                      <BookOpen size={14} className="text-indigo-400 shrink-0 mt-0.5" />
                      <span><strong>AI Action Plan:</strong> {gap.recommendation}</span>
                    </p>
                  </div>

                  <div className="w-full md:w-56 shrink-0 space-y-1 bg-[#0d0d12] p-3 rounded-xl border border-[#222232]">
                    <div className="flex justify-between text-xs font-semibold">
                      <span className="text-gray-400">Market Demand</span>
                      <span className="text-indigo-400">{gap.demandCount} job postings</span>
                    </div>
                    <div className="w-full bg-gray-800 h-2 rounded-full overflow-hidden">
                      <div
                        className="bg-indigo-500 h-full rounded-full"
                        style={{ width: `${Math.min(100, gap.demandCount * 5)}%` }}
                      ></div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
