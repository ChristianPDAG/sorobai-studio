// Application Constants

export const APP_CONFIG = {
  name: 'Sorobai Studio',
  description: 'AI-Powered IDE for Stellar Soroban',
  url: process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000',
} as const;

export const STELLAR_CONFIG = {
  network: process.env.NEXT_PUBLIC_STELLAR_NETWORK || 'testnet',
  horizonUrl: process.env.NEXT_PUBLIC_STELLAR_HORIZON_URL || 'https://horizon-testnet.stellar.org',
  platformAddress: process.env.NEXT_PUBLIC_PLATFORM_STELLAR_ADDRESS || '',
} as const;

export const AI_CONFIG = {
  model: 'google/gemini-flash-1.5',
  maxTokens: 8000,
  temperature: 0.7,
} as const;

export const CREDIT_PRICING = {
  usdcPerCredit: 0.01, // 1 credit = $0.01 USD
  minPurchase: 100, // minimum 100 credits ($1)
  aiCostMargin: 1.3, // 30% margin on AI costs
} as const;

export const ROUTES = {
  home: '/',
  studio: '/studio',
  hub: '/hub',
  bounties: '/bounties',
  dashboard: '/dashboard',
  auth: {
    signIn: '/auth/sign-in',
    signUp: '/auth/sign-up',
  },
} as const;
