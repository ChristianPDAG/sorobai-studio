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
  userId: string;
  name: string;
  description: string;
  code: string;
  language: 'rust' | 'typescript';
  isPublic: boolean;
  likes: number;
  forks: number;
  githubRepoUrl?: string;
  createdAt: Date;
  updatedAt: Date;
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
