
import { useQuery } from '@tanstack/react-query';
import api from '../api/api';
import type { Application } from '../types';
import { Briefcase, Building, MapPin, Clock } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

const COLUMNS = [
  { id: 'INTERESTED', label: 'Interested', color: 'status-INTERESTED' },
  { id: 'APPLIED', label: 'Applied', color: 'status-APPLIED' },
  { id: 'SCREENING', label: 'Screening', color: 'status-SCREENING' },
  { id: 'INTERVIEW', label: 'Interview', color: 'status-INTERVIEW' },
  { id: 'OFFER', label: 'Offer', color: 'status-OFFER' },
  { id: 'REJECTED', label: 'Rejected', color: 'status-REJECTED' },
];

export default function Applications() {
  const { data, isLoading, refetch } = useQuery<{ success: boolean; data: Application[] }>({
    queryKey: ['applications'],
    queryFn: async () => {
      const res = await api.get('/applications');
      return res.data;
    },
  });

  const updateStatus = async (appId: string, status: string) => {
    try {
      await api.patch(`/applications/${appId}`, { status });
      refetch();
    } catch (error) {
      console.error('Failed to update status', error);
    }
  };

  const applications = data?.data || [];

  return (
    <div className="p-8 h-full flex flex-col">
      <header className="mb-8">
        <h1 className="text-3xl font-bold text-white mb-2">Application Tracking</h1>
        <p className="text-gray-400">Manage your pipeline and track job applications.</p>
      </header>

      <div className="flex-1 overflow-x-auto overflow-y-hidden pb-4">
        {isLoading ? (
          <div className="flex gap-6 h-full">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="kanban-col flex-1 h-full skeleton opacity-50"></div>
            ))}
          </div>
        ) : applications.length === 0 ? (
           <div className="text-center py-20 bg-[#111118] rounded-xl border border-[#2a2a3a] h-64 flex flex-col items-center justify-center">
            <Briefcase className="mx-auto h-16 w-16 text-gray-600 mb-4" />
            <h3 className="text-xl font-medium text-white mb-2">No applications yet</h3>
            <p className="text-gray-400">Track jobs from the discover page to see them here.</p>
          </div>
        ) : (
          <div className="flex gap-6 h-full min-w-max pb-4">
            {COLUMNS.map((col) => {
              const colApps = applications.filter((app) => app.status === col.id);
              return (
                <div key={col.id} className="kanban-col flex flex-col h-full w-80">
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="font-semibold text-gray-300">{col.label}</h3>
                    <span className="bg-gray-800 text-gray-400 text-xs py-0.5 px-2 rounded-full font-medium">
                      {colApps.length}
                    </span>
                  </div>

                  <div className="flex-1 overflow-y-auto space-y-3 pr-1">
                    {colApps.map((app) => (
                      <div key={app.id} className="glass-card p-4 hover:border-indigo-500/30">
                        <div className="flex justify-between items-start mb-2">
                          <h4 className="font-semibold text-white line-clamp-1 flex-1">{app.jobPost.job_title}</h4>
                        </div>
                        <div className="flex items-center text-sm text-gray-400 mb-2">
                          <Building size={14} className="mr-1.5" />
                          <span className="truncate">{app.jobPost.company_name}</span>
                        </div>
                        {app.jobPost.location && (
                          <div className="flex items-center text-xs text-gray-500 mb-4">
                            <MapPin size={12} className="mr-1" />
                            <span className="truncate">{app.jobPost.location}</span>
                          </div>
                        )}
                        
                        <div className="flex justify-between items-center mt-4 pt-3 border-t border-gray-800">
                          <div className="text-xs text-gray-500 flex items-center">
                            <Clock size={12} className="mr-1" />
                            {formatDistanceToNow(new Date(app.created_at))} ago
                          </div>
                          
                          <select 
                            className="bg-gray-800 border border-gray-700 text-xs rounded px-2 py-1 text-gray-300 outline-none"
                            value={app.status}
                            onChange={(e) => updateStatus(app.id, e.target.value)}
                          >
                            {COLUMNS.map(c => (
                              <option key={c.id} value={c.id}>{c.label}</option>
                            ))}
                          </select>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
