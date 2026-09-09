import { useQuery } from '@tanstack/react-query';
import api from '../api/api';
import JobCard from '../components/JobCard';
import type { SavedJob } from '../types';
import { BookmarkMinus } from 'lucide-react';

export default function SavedJobs() {
  const { data, isLoading, error, refetch } = useQuery<{ success: boolean; data: SavedJob[] }>({
    queryKey: ['saved-jobs'],
    queryFn: async () => {
      const res = await api.get('/saved-jobs');
      return res.data;
    },
  });

  const unsaveJob = async (id: string) => {
    try {
      await api.delete(`/saved-jobs/${id}`);
      refetch();
    } catch (error) {
      console.error('Failed to unsave job', error);
    }
  };

  return (
    <div className="p-8 h-full flex flex-col">
      <header className="mb-8">
        <h1 className="text-3xl font-bold text-white mb-2">Saved Opportunities</h1>
        <p className="text-gray-400">Jobs you've bookmarked for later review.</p>
      </header>

      <div className="flex-1 overflow-y-auto pb-8 pr-2">
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="h-[350px] skeleton"></div>
            ))}
          </div>
        ) : error ? (
          <div className="text-center py-20 text-red-400 bg-red-500/10 rounded-xl border border-red-500/20">
            Failed to load saved jobs. Please try again.
          </div>
        ) : data?.data.length === 0 ? (
          <div className="text-center py-20 bg-[#111118] rounded-xl border border-[#2a2a3a]">
            <BookmarkMinus className="mx-auto h-16 w-16 text-gray-600 mb-4" />
            <h3 className="text-xl font-medium text-white mb-2">No saved jobs</h3>
            <p className="text-gray-400">You haven't saved any jobs yet. Browse the dashboard to find opportunities.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {data?.data.map((saved) => (
              <JobCard 
                key={saved.id} 
                job={saved.jobPost} 
                saved={true}
                onSave={unsaveJob} // passing unsave as onSave
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
