// Mock data for UI development

export const mockProjects = [
  {
    id: '1',
    name: 'Soroban Token',
    description: 'Standard token contract for Stellar with transfer and balance functions',
    code: `#![no_std]
use soroban_sdk::{contract, contractimpl, symbol_short, Env, Symbol, Address};

#[contract]
pub struct TokenContract;

#[contractimpl]
impl TokenContract {
    pub fn initialize(env: Env, admin: Address) {
        env.storage().instance().set(&symbol_short!("admin"), &admin);
    }
}`,
    language: 'rust' as const,
    isPublic: true,
    likesCount: 42,
    forksCount: 12,
    createdAt: new Date('2024-12-01'),
    updatedAt: new Date('2024-12-20'),
  },
  {
    id: '2',
    name: 'Payment Escrow',
    description: 'Secure escrow contract for cross-border payments on Stellar',
    code: '// Escrow contract with timelock and dispute resolution...',
    language: 'rust' as const,
    isPublic: false,
    likesCount: 0,
    forksCount: 0,
    createdAt: new Date('2024-12-15'),
    updatedAt: new Date('2024-12-21'),
  },
  {
    id: '3',
    name: 'Lumens Staking',
    description: 'Liquid staking protocol for Lumens (XLM) with rewards distribution',
    code: '// Staking contract with persistent storage...',
    language: 'rust' as const,
    isPublic: true,
    likesCount: 128,
    forksCount: 34,
    createdAt: new Date('2024-11-20'),
    updatedAt: new Date('2024-12-18'),
  },
];

export const mockChatMessages = [
  {
    id: '1',
    role: 'user' as const,
    content: 'Create a Soroban token contract with transfer and balance functions',
    timestamp: new Date('2024-12-22T10:00:00'),
  },
  {
    id: '2',
    role: 'assistant' as const,
    content: `I'll create a Soroban token contract for you. This will include:

1. Token initialization with admin address
2. Balance tracking using Persistent storage
3. Transfer functionality with authorization
4. Balance query functions

The contract will be written in Rust and compiled to WebAssembly (WASM) for deployment on Stellar. Let me generate the code...`,
    timestamp: new Date('2024-12-22T10:00:05'),
  },
];

export const mockBounties = [
  {
    id: '1',
    title: 'Build a Stellar DEX Aggregator',
    description: 'Create an aggregator that finds the best prices across Stellar native DEX (order book + AMM) and third-party DEXs like Aquarius',
    budget: 500, // XLM
    status: 'open' as const,
    deadline: new Date('2025-01-31'),
    tags: ['DeFi', 'Advanced', 'Soroban'],
    clientName: 'StellarSwap',
    proposalsCount: 8,
  },
  {
    id: '2',
    title: 'Cross-Border Payment Interface',
    description: 'Build a user-friendly interface for instant remittances using Stellar anchors and USDC/EURC stablecoins',
    budget: 200, // XLM
    status: 'in_progress' as const,
    deadline: new Date('2025-01-15'),
    tags: ['Payments', 'Frontend', 'Anchors'],
    clientName: 'RemitChain',
    proposalsCount: 3,
  },
  {
    id: '3',
    title: 'Chainlink Oracle Integration',
    description: 'Integrate Chainlink Data Feeds with Soroban contracts for real-world asset (RWA) tokenization',
    budget: 800, // XLM
    status: 'open' as const,
    deadline: new Date('2025-02-28'),
    tags: ['Oracle', 'Advanced', 'RWA'],
    clientName: 'TokenizeRWA',
    proposalsCount: 12,
  },
];

export const mockHubContracts = [
  {
    id: '1',
    name: 'Soroban Token Standard',
    description: 'Standard token contract for Stellar with SEP-41 compliance',
    author: 'stellar_dev',
    authorAvatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=stellar',
    likes: 234,
    forks: 89,
    tags: ['Token', 'Beginner', 'SEP-41'],
    language: 'rust' as const,
    updatedAt: new Date('2024-12-20'),
  },
  {
    id: '2',
    name: 'Payment Escrow',
    description: 'Secure escrow for cross-border payments and remittances on Stellar',
    author: 'soroban_master',
    authorAvatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=soroban',
    likes: 456,
    forks: 123,
    tags: ['Escrow', 'Payments', 'Intermediate'],
    language: 'rust' as const,
    updatedAt: new Date('2024-12-19'),
  },
  {
    id: '3',
    name: 'DAO Governance',
    description: 'On-chain voting and proposal system with Lumens staking',
    author: 'dao_builder',
    authorAvatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=dao',
    likes: 789,
    forks: 234,
    tags: ['DAO', 'Governance', 'Advanced'],
    language: 'rust' as const,
    updatedAt: new Date('2024-12-18'),
  },
];

export const mockUser = {
  id: '1',
  githubUsername: 'stellar_developer',
  githubAvatarUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=user',
  stellarAddress: 'GDQP2KPQGKIHYJGXNUIYOMHARUARCA7DJT5FO2FFOOKY3B2WSQHG4W37',
  credits: 150.5, // AI Credits for Gemini usage
  reputation: 420,
  bio: 'Building the future of DeFi on Stellar',
};
