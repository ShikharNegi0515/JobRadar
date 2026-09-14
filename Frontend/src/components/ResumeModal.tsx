import { useState, useRef } from 'react';
import { X, FileText, Upload, Sparkles, Loader2, CheckCircle2, ChevronRight, AlertCircle } from 'lucide-react';
import api from '../api/api';

interface ParsedResumeData {
  name: string | null;
  skills: string[];
  experience_level: string;
  years_of_experience: number | null;
  roles: string[];
  search_keywords: string[];
  summary: string;
}

interface ResumeModalProps {
  onClose: () => void;
  onIngestionStart: (resumeText: string, parsedData: ParsedResumeData) => void;
}

type Step = 'input' | 'parsing' | 'preview' | 'scraping' | 'done';

export default function ResumeModal({ onClose, onIngestionStart }: ResumeModalProps) {
  const [step, setStep] = useState<Step>('input');
  const [resumeText, setResumeText] = useState('');
  const [parsedData, setParsedData] = useState<ParsedResumeData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [dragOver, setDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileRead = (file: File) => {
    if (!file.type.includes('text') && !file.name.endsWith('.txt') && !file.name.endsWith('.md')) {
      setError('Please upload a .txt or .md file. For PDFs, copy-paste the text below.');
      return;
    }
    const reader = new FileReader();
    reader.onload = (e) => {
      setResumeText(e.target?.result as string || '');
      setError(null);
    };
    reader.readAsText(file);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files[0];
    if (file) handleFileRead(file);
  };

  const handleParseResume = async () => {
    if (resumeText.trim().length < 50) {
      setError('Please enter at least 50 characters of resume text.');
      return;
    }
    setError(null);
    setStep('parsing');

    try {
      const res = await api.post('/ai/parse-resume', { resumeText });
      setParsedData(res.data.data);
      setStep('preview');
    } catch (err: any) {
      setError(err?.response?.data?.message || 'Failed to parse resume. Please try again.');
      setStep('input');
    }
  };

  const handleStartScraping = async () => {
    if (!parsedData) return;
    setStep('scraping');
    onIngestionStart(resumeText, parsedData);
  };

  const levelColors: Record<string, string> = {
    fresher: 'text-green-400 bg-green-400/10 border-green-400/30',
    junior: 'text-blue-400 bg-blue-400/10 border-blue-400/30',
    mid: 'text-indigo-400 bg-indigo-400/10 border-indigo-400/30',
    senior: 'text-purple-400 bg-purple-400/10 border-purple-400/30',
    lead: 'text-amber-400 bg-amber-400/10 border-amber-400/30',
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/70 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative w-full max-w-2xl bg-[#0e0e1a] border border-[#2a2a40] rounded-2xl shadow-2xl shadow-indigo-950/50 overflow-hidden">
        {/* Header gradient bar */}
        <div className="h-1 w-full bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500" />

        {/* Header */}
        <div className="flex items-start justify-between p-6 pb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-500/20 border border-indigo-500/30 flex items-center justify-center">
              <Sparkles className="h-5 w-5 text-indigo-400" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white">Smart Resume Search</h2>
              <p className="text-sm text-gray-400">Let AI find jobs tailored to your profile</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg text-gray-400 hover:text-white hover:bg-gray-800 transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {/* Step indicators */}
        <div className="flex items-center gap-2 px-6 mb-5">
          {(['input', 'parsing', 'preview', 'scraping'] as const).map((s, i) => (
            <div key={s} className="flex items-center gap-2">
              <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold border transition-all
                ${step === s ? 'bg-indigo-600 border-indigo-400 text-white' :
                  (['parsing', 'preview', 'scraping', 'done'].indexOf(step) > i) ? 'bg-indigo-500/20 border-indigo-500/40 text-indigo-400' :
                  'bg-gray-800 border-gray-700 text-gray-500'}`}>
                {['parsing', 'preview', 'scraping', 'done'].indexOf(step) > i ? '✓' : i + 1}
              </div>
              {i < 3 && <div className={`flex-1 h-px w-8 ${['parsing', 'preview', 'scraping', 'done'].indexOf(step) > i ? 'bg-indigo-500/50' : 'bg-gray-700'}`} />}
            </div>
          ))}
          <span className="text-xs text-gray-500 ml-2">
            {step === 'input' ? 'Paste Resume' : step === 'parsing' ? 'Analyzing...' : step === 'preview' ? 'Review & Confirm' : 'Scraping Jobs'}
          </span>
        </div>

        {/* Content */}
        <div className="px-6 pb-6">

          {/* Step 1: Input */}
          {step === 'input' && (
            <div className="space-y-4">
              {/* Drop zone */}
              <div
                className={`border-2 border-dashed rounded-xl p-5 text-center cursor-pointer transition-all
                  ${dragOver ? 'border-indigo-400 bg-indigo-400/5' : 'border-[#2a2a40] hover:border-indigo-500/50 hover:bg-indigo-500/5'}`}
                onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
                onDragLeave={() => setDragOver(false)}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
              >
                <Upload className="mx-auto h-8 w-8 text-gray-500 mb-2" />
                <p className="text-sm text-gray-400">Drop your <span className="text-white font-medium">.txt</span> resume here or <span className="text-indigo-400 font-medium">click to browse</span></p>
                <p className="text-xs text-gray-600 mt-1">For PDFs: open in a reader, select all text (Ctrl+A), copy and paste below</p>
                <input ref={fileInputRef} type="file" accept=".txt,.md" className="hidden" onChange={(e) => { const f = e.target.files?.[0]; if (f) handleFileRead(f); }} />
              </div>

              {/* Text area */}
              <div>
                <label className="text-xs font-medium text-gray-400 mb-2 flex items-center gap-1.5">
                  <FileText size={13} /> Or paste your resume text directly
                </label>
                <textarea
                  className="w-full h-52 bg-[#111118] border border-[#2a2a3a] focus:border-indigo-500 rounded-xl p-4 text-sm text-gray-200 placeholder-gray-600 focus:outline-none resize-none transition-all font-mono leading-relaxed"
                  placeholder="Paste your resume here — include your skills, experience, education, and projects for the best results..."
                  value={resumeText}
                  onChange={(e) => { setResumeText(e.target.value); setError(null); }}
                />
                <div className="flex justify-between mt-1">
                  {error && (
                    <span className="text-xs text-red-400 flex items-center gap-1">
                      <AlertCircle size={12} /> {error}
                    </span>
                  )}
                  <span className={`text-xs ml-auto ${resumeText.length < 50 ? 'text-gray-600' : 'text-gray-400'}`}>
                    {resumeText.length} chars
                  </span>
                </div>
              </div>

              <button
                onClick={handleParseResume}
                disabled={resumeText.trim().length < 50}
                className="w-full py-3 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 disabled:opacity-40 disabled:cursor-not-allowed text-white font-semibold flex items-center justify-center gap-2 transition-all shadow-lg shadow-indigo-600/25"
              >
                <Sparkles size={16} /> Analyze Resume with AI
              </button>
            </div>
          )}

          {/* Step 2: Parsing */}
          {step === 'parsing' && (
            <div className="py-12 text-center space-y-4">
              <div className="relative mx-auto w-16 h-16">
                <div className="w-16 h-16 rounded-full border-4 border-indigo-500/20 border-t-indigo-500 animate-spin" />
                <Sparkles className="absolute inset-0 m-auto h-6 w-6 text-indigo-400" />
              </div>
              <div>
                <h3 className="text-white font-semibold text-lg">Analyzing your resume...</h3>
                <p className="text-gray-400 text-sm mt-1">Gemini AI is extracting your skills, experience, and generating personalized LinkedIn search keywords for India.</p>
              </div>
            </div>
          )}

          {/* Step 3: Preview */}
          {step === 'preview' && parsedData && (
            <div className="space-y-5">
              {/* Profile summary */}
              <div className="bg-[#111118] border border-[#2a2a3a] rounded-xl p-4">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-white font-semibold">
                    {parsedData.name ? `👋 Hey, ${parsedData.name}!` : '👋 Candidate Profile'}
                  </h3>
                  <span className={`text-xs font-bold px-2.5 py-1 rounded-full border capitalize ${levelColors[parsedData.experience_level] || levelColors.mid}`}>
                    {parsedData.experience_level}
                    {parsedData.years_of_experience ? ` · ${parsedData.years_of_experience}y` : ''}
                  </span>
                </div>
                <p className="text-sm text-gray-400">{parsedData.summary}</p>
              </div>

              {/* Identified roles */}
              <div>
                <p className="text-xs text-gray-500 font-medium uppercase tracking-wider mb-2">Suitable Roles Identified</p>
                <div className="flex flex-wrap gap-2">
                  {parsedData.roles.map((role, i) => (
                    <span key={i} className="px-3 py-1.5 bg-purple-500/10 border border-purple-500/25 text-purple-300 text-xs rounded-lg font-medium">
                      {role}
                    </span>
                  ))}
                </div>
              </div>

              {/* Skills */}
              <div>
                <p className="text-xs text-gray-500 font-medium uppercase tracking-wider mb-2">Skills Detected ({parsedData.skills.length})</p>
                <div className="flex flex-wrap gap-1.5">
                  {parsedData.skills.slice(0, 15).map((skill, i) => (
                    <span key={i} className="px-2 py-1 bg-indigo-500/10 border border-indigo-500/20 text-indigo-300 text-xs rounded-md">
                      {skill}
                    </span>
                  ))}
                  {parsedData.skills.length > 15 && (
                    <span className="px-2 py-1 bg-gray-800 text-gray-400 text-xs rounded-md">+{parsedData.skills.length - 15}</span>
                  )}
                </div>
              </div>

              {/* Generated keywords */}
              <div>
                {(() => {
                  const allKeywords = [...parsedData.search_keywords];
                  if (!allKeywords.includes('software developer')) allKeywords.push('software developer');
                  return (
                    <>
                      <p className="text-xs text-gray-500 font-medium uppercase tracking-wider mb-2 flex items-center gap-1.5">
                        <Sparkles size={11} /> LinkedIn Search Keywords ({allKeywords.length})
                      </p>
                      <div className="bg-[#111118] border border-[#2a2a3a] rounded-xl divide-y divide-[#1e1e2e]">
                        {allKeywords.map((kw, i) => (
                          <div key={i} className="flex items-center gap-3 px-4 py-2.5 text-sm">
                            <span className="text-indigo-500 font-mono text-xs w-5 shrink-0">{i + 1}.</span>
                            <span className="text-gray-300 flex-1">{kw}</span>
                            <ChevronRight size={14} className="text-gray-600 shrink-0" />
                          </div>
                        ))}
                      </div>
                    </>
                  );
                })()}
              </div>

              <div className="flex gap-3 pt-1">
                <button
                  onClick={() => setStep('input')}
                  className="flex-1 py-2.5 rounded-xl border border-[#2a2a40] text-gray-400 hover:text-white hover:border-gray-600 text-sm transition-all"
                >
                  Edit Resume
                </button>
                <button
                  onClick={handleStartScraping}
                  className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-semibold text-sm flex items-center justify-center gap-2 transition-all shadow-lg shadow-indigo-600/25"
                >
                  <Sparkles size={14} /> Start Personalized Scrape
                </button>
              </div>
            </div>
          )}

          {/* Step 4: Scraping */}
          {(step === 'scraping' || step === 'done') && (
            <div className="py-12 text-center space-y-4">
              {step === 'scraping' ? (
                <>
                  <div className="relative mx-auto w-16 h-16">
                    <div className="w-16 h-16 rounded-full border-4 border-purple-500/20 border-t-purple-500 animate-spin" />
                    <FileText className="absolute inset-0 m-auto h-6 w-6 text-purple-400" />
                  </div>
                  <div>
                    <h3 className="text-white font-semibold text-lg">Scraping LinkedIn for you...</h3>
                    <p className="text-gray-400 text-sm mt-1">Finding jobs matching <span className="text-white font-medium">{parsedData?.roles.join(', ')}</span> roles in India. This may take a few minutes.</p>
                  </div>
                </>
              ) : (
                <>
                  <CheckCircle2 className="mx-auto h-14 w-14 text-green-400" />
                  <div>
                    <h3 className="text-white font-semibold text-lg">All done! 🎉</h3>
                    <p className="text-gray-400 text-sm mt-1">Your dashboard has been refreshed with personalized job results.</p>
                  </div>
                  <button onClick={onClose} className="px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-medium text-sm transition-all">
                    View Jobs
                  </button>
                </>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
