import OpenAI from 'openai';
import { env } from './env';

export function getOpenAIClient() {
  if (!env.openaiApiKey) {
    throw new Error('OPENAI_API_KEY is required.');
  }

  return new OpenAI({ apiKey: env.openaiApiKey });
}
