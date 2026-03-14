import { mustEnv } from '@Damba/v1/config/ConfigHelper';
import { ChatOpenAI } from '@langchain/openai';
import { TavilySearch } from 'node_modules/@langchain/tavily/dist/tavily-search.cjs';

const aiApiKey = mustEnv('OPENAI_API_KEY');
export const OpenAI = new ChatOpenAI({
  apiKey: aiApiKey,
  model: 'gpt-4o-mini',
  temperature: 0.2,
});

 export const tavily = new TavilySearch({
        maxResults: 5,
        tavilyApiKey: process.env.TAVILY_API_KEY,
      });

