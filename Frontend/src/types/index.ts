export interface Skill {
  id: string;
  name: string;
}

export interface JobPost {
  id: string;
  source: string;
  source_post_id: string;
  source_url?: string;
  author_name?: string;
  author_avatar_url?: string;
  job_title: string;
  company_name?: string;
  description?: string;
  location?: string;
  work_mode?: 'REMOTE' | 'HYBRID' | 'ONSITE';
  employment_type?: 'FULL_TIME' | 'PART_TIME' | 'CONTRACT' | 'INTERNSHIP' | 'FREELANCE';
  experience_min?: number;
  experience_max?: number;
  salary_min?: number;
  salary_max?: number;
  salary_currency?: string;
  application_url?: string;
  application_email?: string;
  posted_at: string;
  popularity_score: number;
  skills: Skill[];
  status: 'ACTIVE' | 'EXPIRED' | 'FLAGGED';
}

export interface PaginatedResponse<T> {
  success: boolean;
  data: {
    jobs: T[];
    pagination: {
      total: number;
      page: number;
      limit: number;
      totalPages: number;
    };
    meta: any;
  };
}

export interface User {
  id: string;
  email: string;
  name: string;
}

export interface Application {
  id: string;
  jobPost: JobPost;
  status: 'INTERESTED' | 'APPLIED' | 'SCREENING' | 'INTERVIEW' | 'REJECTED' | 'OFFER';
  applied_at?: string;
  notes?: string;
  created_at: string;
}

export interface SavedJob {
  id: string;
  jobPost: JobPost;
  created_at: string;
}
