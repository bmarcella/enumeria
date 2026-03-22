/* eslint-disable @typescript-eslint/no-explicit-any */
import { getAgentDefinitions, getAgentDefinition, createAgentDefinition, updateAgentDefinition, submitAgentDefinition } from "@/services/agents/AgentDefinition";
import { create } from "zustand";

type LoadState = "idle" | "loading" | "error";

type AgentDefinition = any;

type AgentStore = {
  agent: AgentDefinition | null;
  agents: AgentDefinition[];
  state: LoadState;
  listState: LoadState;
  error: string | null;
  listError: string | null;

  load: (id: string) => Promise<void>;
  loadList: () => Promise<void>;
  createDraft: (payload: any) => Promise<AgentDefinition>;
  savePatch: (id: string, patch: any) => Promise<AgentDefinition>;
  submit: (id: string) => Promise<AgentDefinition>;
};

export const useAgentDefinitionStore = create<AgentStore>((set, get) => ({
  agent: null,
  agents: [],
  state: "idle",
  listState: "idle",
  error: null,
  listError: null,

  load: async (id) => {
    set({ state: "loading", error: null });
    try {
      const res = await getAgentDefinition(id);
      set({ agent: res?.agentDefinition ?? res, state: "idle" });
    } catch (err: any) {
      set({ state: "error", error: err?.message ?? "Failed to load agent" });
    }
  },

  loadList: async () => {
    set({ listState: "loading", listError: null });
    try {
      const res = await getAgentDefinitions();
      const data = res?.data?.agentDefinitions || res?.data || res || [];
      const agents = Array.isArray(data) ? data : [];
      set({ agents, listState: "idle" });
    } catch (err: any) {
      set({ listState: "error", listError: err?.message ?? "Failed to load agents list" });
    }
  },

  createDraft: async (payload) => {
    const res = await createAgentDefinition(payload);
    const agent = res?.agentDefinition ?? res;
    set({ agent });
    return agent;
  },

  savePatch: async (id, patch) => {
    const res = await updateAgentDefinition(id, patch);
    const agent = res?.agentDefinition ?? res;
    set({ agent });
    return agent;
  },

  submit: async (id) => {
    const res = await submitAgentDefinition(id);
    const agent = res?.agentDefinition ?? res;
    set({ agent });
    return agent;
  },
}));