/* eslint-disable @typescript-eslint/no-namespace */
/* eslint-disable @typescript-eslint/no-explicit-any */
import 'reflect-metadata';
import 'tsconfig-paths/register';
import dotenv from 'dotenv';
import { DataSource } from 'typeorm';
import { AppConfig } from './config/app.config';
import Damba from '@Damba/v2';
import { AgentModule, _SPS_AGENT_MODULE_ } from './AgentModule';
import { _SPS_INDEX_, indexModule } from './services';
import { initOrm } from '@Database/DataSource';
import { oauth2Google } from './config/google.auth';
import { TavilySearch } from '@langchain/tavily';
import { ChatOllama } from '@langchain/ollama';
import { ChatOpenAI } from '@langchain/openai';

declare global {
  namespace Express {
    interface Request {
      // ── AI Providers (optional, set by app config) ──────────────────
      /** OpenAI LLM client */
      openAi: ChatOpenAI;
      /** Ollama LLM client */
      ollama: ChatOllama;
      /** Tavily search client */
      tavily: TavilySearch;

      /** Anthropic LLM client */
      anthropic?: any;
      retrieverTool: any;
      qdrantRetriever: any;
    }
  }
}

async function main() {
  dotenv.config();
  const db = await initOrm<DataSource>(process.env as any);
  try {
    await Damba.start({
      modules: [indexModule, AgentModule],
      googleAuth: oauth2Google,
      AppConfig,
      db,
    });
  } catch (err) {
    console.error(err);
    process.exitCode = 1;
  }
}

main().catch((err) => {
  console.error(err);
  process.exitCode = 1;
});
