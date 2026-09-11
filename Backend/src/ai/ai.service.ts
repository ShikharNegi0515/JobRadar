import { Injectable, Logger } from '@nestjs/common';
import { GoogleGenerativeAI } from '@google/generative-ai';

export interface ExtractedJob {
  is_job_post: boolean;
  confidence: number;
  job_title: string | null;
  company_name: string | null;
  location: string | null;
  work_mode: 'REMOTE' | 'HYBRID' | 'ONSITE' | 'NOT_SPECIFIED';
  employment_type: 'FULL_TIME' | 'PART_TIME' | 'CONTRACT' | 'INTERNSHIP';
  salary_min: number | null;
  salary_max: number | null;
  salary_currency: string | null;
  experience_min: number | null;
  experience_max: number | null;
  description: string | null;
  skills: string[];
  application_url: string | null;
  application_email: string | null;
}

export interface AIMatchResult {
  match_score: number;
  matching_skills: string[];
  missing_skills: string[];
  recommendations: string[];
  resume_bullet_suggestions: string[];
  summary: string;
}

export interface ParsedResume {
  name: string | null;
  skills: string[];
  experience_level: 'fresher' | 'junior' | 'mid' | 'senior' | 'lead';
  years_of_experience: number | null;
  roles: string[];  // e.g. ["React Developer", "Frontend Engineer"]
  search_keywords: string[]; // LinkedIn search queries to find relevant India jobs
  summary: string;
}

export interface SkillGapItem {
  skill: string;
  demand_count: number;
  percentage: number;
  priority: 'HIGH' | 'MEDIUM' | 'LOW';
  recommended_resources: string[];
}

@Injectable()
export class AIService {
  private readonly logger = new Logger(AIService.name);
  private genAI: GoogleGenerativeAI;

  constructor() {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey || apiKey === 'your_gemini_api_key_here') {
      this.logger.warn('GEMINI_API_KEY not set — AI extraction will run in dev fallback mode');
    }
    this.genAI = new GoogleGenerativeAI(apiKey || '');
  }

  async extractJobFromPost(postContent: string, authorName: string): Promise<ExtractedJob | null> {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey || apiKey === 'your_gemini_api_key_here') {
      return this.mockExtract(postContent, authorName);
    }

    try {
      // Try gemini-3.6-flash or gemini-2.0-flash
      const modelName = process.env.GEMINI_MODEL || 'gemini-3.6-flash';
      const model = this.genAI.getGenerativeModel({ model: modelName });

      const prompt = `You are a job post classifier and extractor. Analyze this LinkedIn post and determine if it contains a genuine job opportunity or hiring announcement.

Post Author: ${authorName}
Post Content: """
${postContent}
"""

Respond with ONLY a valid JSON object (no markdown, no explanation, no code blocks):
{
  "is_job_post": boolean,
  "confidence": number,
  "job_title": string or null,
  "company_name": string or null,
  "location": string or null,
  "work_mode": "REMOTE" or "HYBRID" or "ONSITE" or "NOT_SPECIFIED",
  "employment_type": "FULL_TIME" or "PART_TIME" or "CONTRACT" or "INTERNSHIP",
  "salary_min": number or null,
  "salary_max": number or null,
  "salary_currency": "INR" or "USD" or "GBP" or "EUR" or null,
  "experience_min": number or null (minimum years of experience required),
  "experience_max": number or null (maximum years of experience allowed/mentioned),
  "description": string or null,
  "skills": array of strings,
  "application_url": string or null,
  "application_email": string or null
}

Rules:
- is_job_post = true ONLY if someone is actively recruiting/hiring for a real role
- confidence is between 0 and 1
- Extract salary ONLY if explicitly mentioned (convert to numbers, e.g. "20k" = 20000)
- Extract experience_min and experience_max in years (e.g. "0-2 years" -> min: 0, max: 2, "2+ years" -> min: 2, max: null)
- skills = technical skills only (React, Python, AWS etc.)
- description = clean 1-2 sentence summary of the role
- If not a job post, still return valid JSON with is_job_post: false and confidence < 0.5`;

      const result = await model.generateContent(prompt);
      const text = result.response.text().trim();

      const jsonStr = text.replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/, '').trim();
      return JSON.parse(jsonStr) as ExtractedJob;
    } catch (error) {
      this.logger.warn(`AI extraction warning: ${error instanceof Error ? error.message : error}. Falling back to rule-based extractor.`);
      return this.mockExtract(postContent, authorName);
    }
  }

  async parseResume(resumeText: string): Promise<ParsedResume> {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey || apiKey === 'your_gemini_api_key_here') {
      return this.mockParseResume(resumeText);
    }

    try {
      const modelName = process.env.GEMINI_MODEL || 'gemini-3.6-flash';
      const model = this.genAI.getGenerativeModel({ model: modelName });

      const prompt = `You are an expert resume parser for the Indian job market. Analyze this resume and extract key information.

Resume Text:
"""
${resumeText.slice(0, 6000)}
"""

Respond with ONLY a valid JSON object (no markdown, no explanation):
{
  "name": string or null,
  "skills": string[] (technical skills only, e.g. React, Node.js, Python, AWS),
  "experience_level": "fresher" | "junior" | "mid" | "senior" | "lead",
  "years_of_experience": number or null,
  "roles": string[] (2-5 job roles this person is suited for, e.g. "React Developer", "Frontend Engineer"),
  "search_keywords": string[] (4-8 LinkedIn search queries to find matching jobs in India, e.g. "hiring react developer india", "frontend engineer opening bangalore"),
  "summary": string (1-2 sentence summary of the candidate's profile)
}

IMPORTANT:
- search_keywords must be optimized for LinkedIn post search in India
- Include city names like bangalore, mumbai, delhi, pune, hyderabad in some keywords
- Mix seniority levels (fresher, junior, senior) based on experience
- Focus ONLY on what the candidate can actually do based on their resume`;

      const result = await model.generateContent(prompt);
      const text = result.response.text().trim();
      const jsonStr = text.replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/, '').trim();
      return JSON.parse(jsonStr) as ParsedResume;
    } catch (error) {
      this.logger.error(`Resume parsing failed: ${error instanceof Error ? error.message : error}`);
      return this.mockParseResume(resumeText);
    }
  }

  private mockParseResume(resumeText: string): ParsedResume {
    const lower = resumeText.toLowerCase();
    const skills: string[] = [];
    const allSkills = ['react', 'node.js', 'python', 'java', 'typescript', 'javascript', 'aws', 'docker', 'mongodb', 'postgresql', 'nextjs', 'angular', 'vue', 'flutter', 'golang', 'kubernetes', 'redis', 'graphql', 'django', 'spring'];
    allSkills.forEach(s => { if (lower.includes(s)) skills.push(s.charAt(0).toUpperCase() + s.slice(1)); });

    const yearsMatch = lower.match(/(\d+)\+?\s*years?/i);
    const years = yearsMatch ? parseInt(yearsMatch[1]) : null;
    const level = !years || years < 1 ? 'fresher' : years < 3 ? 'junior' : years < 6 ? 'mid' : years < 10 ? 'senior' : 'lead';

    const topSkills = skills.slice(0, 3).join(', ') || 'software developer';
    return {
      name: null,
      skills,
      experience_level: level,
      years_of_experience: years,
      roles: [`${skills[0] || 'Software'} Developer`, 'Software Engineer'],
      search_keywords: [
        `hiring ${topSkills.toLowerCase().split(',')[0].trim()} developer india`,
        `${level} ${topSkills.toLowerCase().split(',')[0].trim()} developer opening`,
        'software engineer hiring india',
        `we are hiring ${topSkills.toLowerCase().split(',')[0].trim()} bangalore`,
      ],
      summary: `Candidate with ${years ? years + ' years' : 'some'} of experience in ${topSkills}.`,
    };
  }

  async analyzeResumeMatch(
    jobTitle: string,
    jobDescription: string,
    jobSkills: string[],
    userSkills: string[],
    resumeText?: string
  ): Promise<AIMatchResult> {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey || apiKey === 'your_gemini_api_key_here') {
      return this.mockMatch(jobTitle, jobDescription, jobSkills, userSkills, resumeText);
    }

    try {
      const modelName = process.env.GEMINI_MODEL || 'gemini-3.6-flash';
      const model = this.genAI.getGenerativeModel({ model: modelName });

      const prompt = `You are an expert AI Resume Matcher and Career Coach. Analyze candidate's resume/skills against a job role.

Job Title: ${jobTitle}
Job Skills Required: ${jobSkills.join(', ')}
Job Description: ${jobDescription}

Candidate Profile Skills: ${userSkills.join(', ')}
Candidate Resume Text: ${resumeText || 'None provided'}

Respond with ONLY a valid JSON object matching this schema:
{
  "match_score": number (0 to 100),
  "matching_skills": string[],
  "missing_skills": string[],
  "recommendations": string[],
  "resume_bullet_suggestions": string[],
  "summary": string
}`;

      const result = await model.generateContent(prompt);
      const text = result.response.text().trim();
      const jsonStr = text.replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/, '').trim();
      return JSON.parse(jsonStr) as AIMatchResult;
    } catch (error) {
      this.logger.error(`AI resume match failed: ${error instanceof Error ? error.message : error}`);
      return this.mockMatch(jobTitle, jobDescription, jobSkills, userSkills, resumeText);
    }
  }

  mockMatch(
    jobTitle: string,
    jobDescription: string,
    jobSkills: string[],
    userSkills: string[],
    resumeText?: string
  ): AIMatchResult {
    const userSkillsLower = new Set(
      userSkills.map((s) => s.toLowerCase().trim()).concat(
        resumeText ? resumeText.toLowerCase().split(/\W+/).filter(Boolean) : []
      )
    );

    const matching: string[] = [];
    const missing: string[] = [];

    const effectiveJobSkills = jobSkills.length > 0
      ? jobSkills
      : ['React', 'TypeScript', 'Node.js', 'PostgreSQL', 'Docker'];

    effectiveJobSkills.forEach((skill) => {
      if (userSkillsLower.has(skill.toLowerCase().trim())) {
        matching.push(skill);
      } else {
        missing.push(skill);
      }
    });

    const total = matching.length + missing.length;
    const baseScore = total > 0 ? Math.round((matching.length / total) * 100) : 75;
    const match_score = Math.min(100, Math.max(35, baseScore + (userSkills.length > 3 ? 15 : 5)));

    const recommendations: string[] = [];
    if (missing.length > 0) {
      recommendations.push(`Build a hands-on project incorporating ${missing.slice(0, 2).join(' and ')}.`);
      recommendations.push(`Highlight any related experience with ${missing[0]} in your summary section.`);
    } else {
      recommendations.push('Your technical skill set is an exceptional match for this role!');
    }
    recommendations.push(`Tailor your top 3 bullet points to directly mention ${jobTitle} responsibilities.`);

    const resume_bullet_suggestions = [
      `Engineered robust features utilizing ${matching.slice(0, 2).join(' & ') || 'modern web stack'} to improve performance.`,
      `Demonstrated capability in system design aligning with ${jobTitle} requirements.`,
    ];

    return {
      match_score,
      matching_skills: matching.length > 0 ? matching : ['Problem Solving', 'Communication'],
      missing_skills: missing,
      recommendations,
      resume_bullet_suggestions,
      summary: `Your profile demonstrates a ${match_score}% alignment with the ${jobTitle} position based on required tech stack and responsibilities.`,
    };
  }

  private mockExtract(content: string, authorName: string): ExtractedJob {
    const lowerContent = content.toLowerCase();
    const hiringKeywords = ['hiring', 'we are hiring', 'looking for', 'job opening', 'open position', 'join our team', 'urgent requirement', 'vacancy'];
    const isJobPost = hiringKeywords.some(k => lowerContent.includes(k));

    const titleMatch = content.match(/(?:hiring|looking for|seeking|need)(?: a| an)?\s+([A-Z][a-z]+(?:\s+[A-Z][a-z]+){0,3})\s+(?:developer|engineer|designer|manager|analyst)/i);
    const job_title = titleMatch ? titleMatch[0].replace(/hiring|looking for|seeking|need(?: a| an)?/i, '').trim() : null;

    const salaryMatch = content.match(/(?:salary|ctc|pay|₹|rs\.?|inr)\s*:?\s*(\d+)(?:k|lpa|l)?(?:\s*[-–to]+\s*(\d+)(?:k|lpa|l)?)?/i);
    let salary_min: number | null = null;
    let salary_max: number | null = null;
    if (salaryMatch) {
      salary_min = parseInt(salaryMatch[1]) * (salaryMatch[1].length <= 3 ? 1000 : 1);
      salary_max = salaryMatch[2] ? parseInt(salaryMatch[2]) * (salaryMatch[2].length <= 3 ? 1000 : 1) : null;
    }

    const commonSkills = ['react', 'node', 'python', 'java', 'javascript', 'typescript', 'aws', 'docker', 'sql', 'mongodb', 'nextjs', 'angular', 'vue', 'flutter', 'kotlin', 'swift', 'golang', 'rust', 'kubernetes'];
    const skills = commonSkills.filter(s => lowerContent.includes(s)).map(s => s.charAt(0).toUpperCase() + s.slice(1));

    let work_mode: ExtractedJob['work_mode'] = 'NOT_SPECIFIED';
    if (lowerContent.includes('remote')) work_mode = 'REMOTE';
    else if (lowerContent.includes('hybrid')) work_mode = 'HYBRID';
    else if (lowerContent.includes('onsite') || lowerContent.includes('on-site') || lowerContent.includes('office')) work_mode = 'ONSITE';

    const emailMatch = content.match(/[\w.-]+@[\w.-]+\.\w{2,}/);

    const expMatch = content.match(/(\d+)(?:\s*[-–to]+\s*(\d+))?\s*(?:years?|yrs?)(?:\s*of\s*experience)?/i);
    let experience_min: number | null = null;
    let experience_max: number | null = null;
    
    if (expMatch) {
      experience_min = parseInt(expMatch[1]);
      if (expMatch[2]) {
        experience_max = parseInt(expMatch[2]);
      }
    } else if (content.toLowerCase().includes('fresher') || content.toLowerCase().includes('0 years')) {
      experience_min = 0;
      experience_max = 1;
    }

    return {
      is_job_post: isJobPost,
      confidence: isJobPost ? 0.80 : 0.20,
      job_title: job_title || (isJobPost ? 'Software Developer' : null),
      company_name: authorName,
      location: null,
      work_mode,
      employment_type: lowerContent.includes('intern') ? 'INTERNSHIP' : lowerContent.includes('contract') ? 'CONTRACT' : 'FULL_TIME',
      salary_min,
      salary_max,
      salary_currency: salary_min ? 'INR' : null,
      experience_min,
      experience_max,
      description: isJobPost ? content.slice(0, 300) : null,
      skills,
      application_url: null,
      application_email: emailMatch ? emailMatch[0] : null,
    };
  }
}

