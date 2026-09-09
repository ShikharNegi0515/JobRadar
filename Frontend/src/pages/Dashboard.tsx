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

  const { data, isLoading, error } = useQuery<PaginatedResponse<JobPost>>({
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
      // Toast notification would go here
    } catch (error) {
      console.error('Failed to save job', error);
    }
  };

  const trackApplication = async (id: string) => {
    try {
      await api.post('/applications', { jobPostId: id });
      // Toast notification would go here
    } catch (error) {
      console.error('Failed to track application', error);
    }
  };

  return (
    <div className="p-8 h-full flex flex-col">
      <header className="mb-8">
        <h1 className="text-3xl font-bold text-white mb-2">Discover Opportunities</h1>
        <p className="text-gray-400">Showing the most relevant jobs strictly from the <span className="text-indigo-400 font-semibold border-b border-indigo-500/50">last 24 hours</span>.</p>
      </header>

      <div className="flex gap-4 mb-8">
        <form onSubmit={handleSearch} className="flex-1 relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="h-5 w-5 text-gray-500" />
          </div>
          <input
            type="text"
            className="input-field pl-10 h-12 text-base"
            placeholder="Search by title, skill, or company..."
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
          />
          <button type="submit" className="absolute inset-y-2 right-2 btn-primary py-1 px-4 text-sm">
            Search
          </button>
        </form>
        <button className="btn-secondary h-12 px-4 bg-[#111118]">
          <Filter size={18} /> Filters
        </button>
        <select 
          className="input-field w-40 h-12 cursor-pointer bg-[#111118]"
          value={sort}
          onChange={(e) => setSort(e.target.value as any)}
        >
          <option value="recent">Most Recent</option>
          <option value="popular">Most Popular</option>
        </select>
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
