import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import api from '../api/api';
import JobCard from '../components/JobCard';
import type { JobPost, PaginatedResponse } from '../types';
import { Search, Filter, Radar } from 'lucide-react';

export default function Dashboard() {
  const [search, setSearch] = useState('');
  const [searchInput, setSearchInput] = useState('');
  const [page, setPage] = useState(1);
  const [sort, setSort] = useState<'recent' | 'popular'>('recent');

  const [isIngesting, setIsIngesting] = useState(false);
  const [ingestionMsg, setIngestionMsg] = useState<string | null>(null);

  const { data, isLoading, error, refetch, isRefetching } = useQuery<PaginatedResponse<JobPost>>({
    queryKey: ['jobs', search, page, sort],
    queryFn: async () => {
      const res = await api.get('/jobs', {
        params: { search, page, limit: 12, sort }
      });
      return res.data;
    },
  });

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setSearch(searchInput);
    setPage(1);
  };

  const saveJob = async (id: string) => {
    try {
      await api.post(`/saved-jobs/${id}`);
    } catch (error) {
      console.error('Failed to save job', error);
    }
  };

  const trackApplication = async (id: string) => {
    try {
      await api.post('/applications', { jobPostId: id });
    } catch (error) {
      console.error('Failed to track application', error);
    }
  };

  const handleTriggerIngestion = async () => {
    setIsIngesting(true);
    setIngestionMsg('Scraping live jobs from LinkedIn...');
    try {
      const res = await api.post('/ingestion/trigger');
      const data = res.data?.data;
      if (data) {
        setIngestionMsg(`Ingestion complete! ${data.saved} new jobs saved, ${data.skipped} skipped.`);
      } else {
        setIngestionMsg('Ingestion triggered successfully!');
      }
      await refetch();
    } catch (err) {
      console.error('Ingestion failed:', err);
      setIngestionMsg('Failed to trigger ingestion.');
    } finally {
      setIsIngesting(false);
      setTimeout(() => setIngestionMsg(null), 6000);
    }
  };

  return (
    <div className="p-8 h-full flex flex-col">
      <header className="mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">Discover Opportunities</h1>
          <p className="text-gray-400">
            Showing the most relevant jobs strictly from the{' '}
            <span className="text-indigo-400 font-semibold border-b border-indigo-500/50">last 24 hours</span>.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => refetch()}
            disabled={isRefetching}
            className="btn-secondary flex items-center gap-2 h-10 px-4 text-sm bg-[#111118] border border-[#2a2a3a] hover:border-indigo-500/40 text-gray-200"
            title="Refresh jobs feed"
          >
            <span className={isRefetching ? 'animate-spin' : ''}>🔄</span>
            {isRefetching ? 'Refreshing...' : 'Refresh Feed'}
          </button>
          <button
            onClick={handleTriggerIngestion}
            disabled={isIngesting}
            className="btn-primary flex items-center gap-2 h-10 px-4 text-sm bg-indigo-600 hover:bg-indigo-500 text-white font-medium shadow-lg shadow-indigo-600/30"
          >
            <Radar className={`h-4 w-4 ${isIngesting ? 'animate-spin' : ''}`} />
            {isIngesting ? 'Scraping LinkedIn...' : 'Run Scraper Ingestion'}
          </button>
        </div>
      </header>

      {ingestionMsg && (
        <div className="mb-6 p-3 px-4 rounded-lg bg-indigo-500/10 border border-indigo-500/30 text-indigo-300 text-sm flex items-center justify-between animate-fade-in">
          <span>{ingestionMsg}</span>
          <button onClick={() => setIngestionMsg(null)} className="text-indigo-400 hover:text-white font-bold ml-4">
            ✕
          </button>
        </div>
      )}

      <div className="flex flex-col md:flex-row gap-3 mb-8">
        <form onSubmit={handleSearch} className="flex-1 relative flex items-center">
          <Search className="absolute left-3.5 h-4 w-4 text-gray-400 pointer-events-none" />
          <input
            type="text"
            className="w-full bg-[#111118] border border-[#2a2a3a] focus:border-indigo-500 rounded-xl pl-10 pr-24 h-12 text-sm text-white placeholder-gray-500 focus:outline-none transition-all shadow-inner"
            placeholder="Search by title, skill (e.g. react, python), or company..."
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
          />
          <button type="submit" className="absolute right-1.5 btn-primary py-1.5 px-4 text-xs font-semibold h-9 rounded-lg">
            Search
          </button>
        </form>
        <div className="flex gap-2 shrink-0">
          <button className="btn-secondary h-12 px-4 bg-[#111118] border-[#2a2a3a] text-xs font-medium flex items-center gap-1.5">
            <Filter size={16} /> Filters
          </button>
          <select 
            className="bg-[#111118] border border-[#2a2a3a] focus:border-indigo-500 rounded-xl px-3.5 h-12 text-xs font-medium text-gray-200 cursor-pointer outline-none transition-all"
            value={sort}
            onChange={(e) => setSort(e.target.value as any)}
          >
            <option value="recent">Sort: Most Recent</option>
            <option value="popular">Sort: Most Popular</option>
          </select>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto pb-8 pr-2">
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="h-[350px] skeleton"></div>
            ))}
          </div>
        ) : error ? (
          <div className="text-center py-20 text-red-400 bg-red-500/10 rounded-xl border border-red-500/20">
            Failed to load jobs. Please try again.
          </div>
        ) : data?.data.jobs.length === 0 ? (
          <div className="text-center py-20 bg-[#111118] rounded-xl border border-[#2a2a3a]">
            <Radar className="mx-auto h-16 w-16 text-gray-600 mb-4" />
            <h3 className="text-xl font-medium text-white mb-2">No active jobs found</h3>
            <p className="text-gray-400">Try adjusting your search criteria or check back later.</p>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {data?.data.jobs.map((job) => (
                <JobCard 
                  key={job.id} 
                  job={job} 
                  onSave={saveJob}
                  onApply={trackApplication} 
                />
              ))}
            </div>
            
            {/* Pagination controls */}
            {data && data.data.pagination.totalPages > 1 && (
              <div className="flex justify-center items-center gap-4 mt-8 pt-6 border-t border-[#2a2a3a]">
                <button 
                  className="btn-secondary"
                  disabled={page === 1}
                  onClick={() => setPage(p => p - 1)}
                >
                  Previous
                </button>
                <span className="text-gray-400 font-medium">
                  Page {page} of {data.data.pagination.totalPages}
                </span>
                <button 
                  className="btn-secondary"
                  disabled={page === data.data.pagination.totalPages}
                  onClick={() => setPage(p => p + 1)}
                >
                  Next
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
