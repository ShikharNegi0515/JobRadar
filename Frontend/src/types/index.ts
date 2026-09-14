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
  author_profile_url?: string;
  author_avatar_url?: string;
  job_title: string;
  company_name?: string;
  description?: string;
  raw_content?: string;
  location?: string;
  work_mode?: 'REMOTE' | 'HYBRID' | 'ONSITE' | 'NOT_SPECIFIED';
  employment_type?: 'FULL_TIME' | 'PART_TIME' | 'CONTRACT' | 'INTERNSHIP' | 'FREELANCE';
  experience_min?: number;
  experience_max?: number;
  salary_min?: number;
  salary_max?: number;
  salary_currency?: string;
  application_url?: string;
  application_email?: string;
  posted_at: string;
  likes?: number;
  comments?: number;
  popularity_score: number;
  match_score?: number;
  ai_match?: AIMatchResult;
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

export interface AIMatchResult {
  match_score: number;
  matching_skills: string[];
  missing_skills: string[];
  recommendations: string[];
  resume_bullet_suggestions: string[];
  summary: string;
}

export interface SkillGapItem {
  skill: string;
  category: string;
  demandCount: number;
  matchPercentage: number;
  priority: 'HIGH' | 'MEDIUM' | 'LOW';
  recommendation: string;
}

export interface SkillGapOverview {
  overallPreparednessScore: number;
  totalTargetJobsAnalyzed: number;
  topMissingSkills: SkillGapItem[];
  userCurrentSkills: string[];
}

