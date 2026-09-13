
export interface ScrapedPost {
  sourcePostId: string;
  authorName: string;
  authorProfileUrl: string;
  content: string;
  postUrl: string;
  likes: number;
  comments: number;
  postedAt: Date;
  source?: string;
}

export interface JobScraper {
  get sourceName(): string;
  scrapeJobPosts(keywords: string[]): Promise<ScrapedPost[]>;
}
