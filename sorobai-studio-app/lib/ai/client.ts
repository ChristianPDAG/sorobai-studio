// AI Client for Gemini Flash via OpenRouter

import { AI_CONFIG } from '@/lib/constants';

export interface AIRequest {
  messages: Array<{
    role: 'user' | 'assistant' | 'system';
    content: string;
  }>;
  temperature?: number;
  maxTokens?: number;
}

export interface AIResponse {
  content: string;
  tokensUsed: {
    input: number;
    output: number;
    total: number;
  };
}

export const generateAIResponse = async (
  request: AIRequest
): Promise<AIResponse> => {
  const apiKey = process.env.OPENROUTER_API_KEY;

  if (!apiKey) {
    throw new Error('OpenRouter API key not configured');
  }

  const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`,
      'HTTP-Referer': process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000',
    },
    body: JSON.stringify({
      model: AI_CONFIG.model,
      messages: request.messages,
      temperature: request.temperature || AI_CONFIG.temperature,
      max_tokens: request.maxTokens || AI_CONFIG.maxTokens,
    }),
  });

  if (!response.ok) {
    throw new Error('AI request failed');
  }

  const data = await response.json();

  return {
    content: data.choices[0].message.content,
    tokensUsed: {
      input: data.usage.prompt_tokens,
      output: data.usage.completion_tokens,
      total: data.usage.total_tokens,
    },
  };
};
