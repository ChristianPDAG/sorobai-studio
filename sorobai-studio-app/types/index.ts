// Core Types for Sorobai Studio

export interface User {
  id: string;
  githubId: string;
  stellarAddress?: string;
  username: string;
  email: string;
  avatar?: string;
  credits: number;
  reputation: number;
  createdAt: Date;
}

export interface Project {
  id: string;
  user_id: string;
  name: string;
  description: string;
  code: string;
  language: 'rust' | 'typescript' | 'javascript';
  is_public: boolean;
  created_at: Date;
  updated_at: Date;
}

export interface ProjectWithStats extends Project {
  author_username?: string;
  author_avatar?: string;
  author_wallet?: string;
  likes_count: number;
  forks_count: number;
  views_count: number;
  comments_count: number;
  avg_rating?: number;
  ratings_count: number;
  tags: string[];
}

export interface CreateProjectInput {
  name: string;
  description: string;
  code?: string;
  language: 'rust' | 'typescript' | 'javascript';
  is_public?: boolean;
}

export interface UpdateProjectInput {
  name?: string;
  description?: string;
  code?: string;
  language?: 'rust' | 'typescript' | 'javascript';
  is_public?: boolean;
}

export interface ProjectComment {
  id: string;
  project_id: string;
  user_id: string;
  content: string;
  parent_comment_id?: string;
  created_at: Date;
  updated_at: Date;
  author_username?: string;
  author_avatar?: string;
}

export interface ProjectRating {
  id: string;
  project_id: string;
  user_id: string;
  rating: number;
  created_at: Date;
  updated_at: Date;
}

export interface Bounty {
  id: string;
  clientId: string;
  developerId?: string;
  title: string;
  description: string;
  requirements: string;
  budget: number; // in USDC
  status: 'open' | 'in_progress' | 'completed' | 'disputed';
  escrowAddress?: string;
  createdAt: Date;
  deadline?: Date;
}

export interface AIMessage {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: Date;
  tokensUsed?: number;
}

export interface CreditTransaction {
  id: string;
  userId: string;
  amount: number;
  type: 'purchase' | 'usage' | 'reward';
  description: string;
  stellarTxHash?: string;
  createdAt: Date;
}
