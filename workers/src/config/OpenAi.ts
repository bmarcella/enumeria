import { mustEnv } from '@Damba/v1/config/ConfigHelper';
import { ChatOpenAI } from '@langchain/openai';

const aiApiKey = mustEnv('OPENAI_API_KEY');
export const OpenAI = new ChatOpenAI({
  apiKey: aiApiKey,
  model: 'gpt-4o-mini',
  temperature: 0.2,
});
