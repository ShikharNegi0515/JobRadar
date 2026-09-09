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
  description: string | null;
  skills: string[];
  application_url: string | null;
  application_email: string | null;
}

@Injectable()
export class AIService {
  private readonly logger = new Logger(AIService.name);
  private genAI: GoogleGenerativeAI;

  constructor() {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey || apiKey === 'your_gemini_api_key_here') {
      this.logger.warn('GEMINI_API_KEY not set — AI extraction will be skipped');
    }
    this.genAI = new GoogleGenerativeAI(apiKey || '');
  }

  async extractJobFromPost(postContent: string, authorName: string): Promise<ExtractedJob | null> {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey || apiKey === 'your_gemini_api_key_here') {
      // Return a mock classification for dev mode
      return this.mockExtract(postContent, authorName);
    }

    try {
      const model = this.genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

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
  "description": string or null,
  "skills": array of strings,
  "application_url": string or null,
  "application_email": string or null
}

Rules:
- is_job_post = true ONLY if someone is actively recruiting/hiring for a real role
- confidence is between 0 and 1
- Extract salary ONLY if explicitly mentioned (convert to numbers, e.g. "20k" = 20000)
- skills = technical skills only (React, Python, AWS etc.)
- description = clean 1-2 sentence summary of the role
- If not a job post, still return valid JSON with is_job_post: false and confidence < 0.5`;

      const result = await model.generateContent(prompt);
      const text = result.response.text().trim();

      // Strip markdown code fences if present
      const jsonStr = text.replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/, '').trim();
      return JSON.parse(jsonStr) as ExtractedJob;
    } catch (error) {
      this.logger.error(`AI extraction failed: ${error instanceof Error ? error.message : error}`);
      return null;
    }
  }

  /**
   * Simple regex-based mock extractor for dev mode (no API key needed)
   */
  private mockExtract(content: string, authorName: string): ExtractedJob {
    const lowerContent = content.toLowerCase();

    const hiringKeywords = ['hiring', 'we are hiring', 'looking for', 'job opening', 'open position', 'join our team', 'urgent requirement', 'vacancy'];
    const isJobPost = hiringKeywords.some(k => lowerContent.includes(k));

    // Try to extract job title
    const titleMatch = content.match(/(?:hiring|looking for|seeking|need)(?: a| an)?\s+([A-Z][a-z]+(?:\s+[A-Z][a-z]+){0,3})\s+(?:developer|engineer|designer|manager|analyst)/i);
    const job_title = titleMatch ? titleMatch[0].replace(/hiring|looking for|seeking|need(?: a| an)?/i, '').trim() : null;

    // Extract salary
    const salaryMatch = content.match(/(?:salary|ctc|pay|₹|rs\.?|inr)\s*:?\s*(\d+)(?:k|lpa|l)?(?:\s*[-–to]+\s*(\d+)(?:k|lpa|l)?)?/i);
    let salary_min: number | null = null;
    let salary_max: number | null = null;
    if (salaryMatch) {
      salary_min = parseInt(salaryMatch[1]) * (salaryMatch[1].length <= 3 ? 1000 : 1);
      salary_max = salaryMatch[2] ? parseInt(salaryMatch[2]) * (salaryMatch[2].length <= 3 ? 1000 : 1) : null;
    }

    // Extract skills
    const commonSkills = ['react', 'node', 'python', 'java', 'javascript', 'typescript', 'aws', 'docker', 'sql', 'mongodb', 'nextjs', 'angular', 'vue', 'flutter', 'kotlin', 'swift', 'golang', 'rust', 'kubernetes'];
    const skills = commonSkills.filter(s => lowerContent.includes(s)).map(s => s.charAt(0).toUpperCase() + s.slice(1));

    // Detect work mode
    let work_mode: ExtractedJob['work_mode'] = 'NOT_SPECIFIED';
    if (lowerContent.includes('remote')) work_mode = 'REMOTE';
    else if (lowerContent.includes('hybrid')) work_mode = 'HYBRID';
    else if (lowerContent.includes('onsite') || lowerContent.includes('on-site') || lowerContent.includes('office')) work_mode = 'ONSITE';

    // Email extraction
    const emailMatch = content.match(/[\w.-]+@[\w.-]+\.\w{2,}/);

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
      description: isJobPost ? content.slice(0, 300) : null,
      skills,
      application_url: null,
      application_email: emailMatch ? emailMatch[0] : null,
    };
  }
}
