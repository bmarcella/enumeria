/* eslint-disable @typescript-eslint/no-explicit-any */
import {
    listToolArtifacts,
    getToolArtifact,
    createToolArtifact,
    updateToolArtifact,
    deleteToolArtifact,
} from '@/services/agents/ToolArtifacts'
import { create } from 'zustand'

type ToolArtifact = any

type State = {
    items: ToolArtifact[]
    selected: ToolArtifact | null
    loading: boolean
    error: string | null
    fetchList: () => Promise<void>
    fetchOne: (id: string) => Promise<ToolArtifact | null>
    createOne: (payload: any) => Promise<ToolArtifact | null>
    updateOne: (id: string, payload: any) => Promise<ToolArtifact | null>
    deleteOne: (id: string) => Promise<void>
}

export const useToolArtifactsStore = create<State>((set, get) => ({
    items: [],
    selected: null,
    loading: false,
    error: null,

    fetchList: async () => {
        set({ loading: true, error: null })
        try {
            const res: any = await listToolArtifacts()
            // Depending your API response shape:
            const items = res.toolArtifacts ?? []
            set({ items, loading: false })
        } catch (e: any) {
            set({
                loading: false,
                error: e?.message ?? 'Failed to load tool artifacts',
            })
        }
    },

    fetchOne: async (id: string) => {
        set({ loading: true, error: null })
        try {
            const res: any = await getToolArtifact(id)
            const selected = res.data // Adjust based on your API response
            set({ selected, loading: false })
            return selected
        } catch (e: any) {
            set({
                loading: false,
                error: e?.message ?? 'Failed to load tool artifact',
            })
            return null
        }
    },

    createOne: async (payload: any) => {
        set({ loading: true, error: null })
        try {
            const res: any = await createToolArtifact(payload)
            const created = res?.data ?? res?.toolArtifact ?? res
            set({ loading: false })
            await get().fetchList()
            return created
        } catch (e: any) {
            set({
                loading: false,
                error: e?.message ?? 'Failed to create tool artifact',
            })
            return null
        }
    },

    updateOne: async (id: string, payload: any) => {
        set({ loading: true, error: null })
        try {
            const res: any = await updateToolArtifact(id, payload)
            const updated = res?.data ?? res?.toolArtifact ?? res
            set({ loading: false, selected: updated })
            await get().fetchList()
            return updated
        } catch (e: any) {
            set({
                loading: false,
                error: e?.message ?? 'Failed to update tool artifact',
            })
            return null
        }
    },

    deleteOne: async (id: string) => {
        set({ loading: true, error: null })
        try {
            await deleteToolArtifact(id)
            set({ loading: false })
            await get().fetchList()
        } catch (e: any) {
            set({
                loading: false,
                error: e?.message ?? 'Failed to delete tool artifact',
            })
        }
    },
}))
