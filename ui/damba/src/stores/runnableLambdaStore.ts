/* eslint-disable @typescript-eslint/no-explicit-any */
import { fetchRunnableLambdas, fetchRunnableLambdaById, createRunnableLambda, updateRunnableLambda, deleteRunnableLambda } from "@/services/agents/runnableLambda"
import { create } from "zustand"

type RunnableLambda = {
  id: string
  name: string
  version?: string
  kind?: string
  status?: string
  description?: string
}

type RunnableLambdaStore = {
  runnableLambdas: RunnableLambda[]
  current?: RunnableLambda | null

  loading: boolean
  loadingOne: boolean

  loadRunnableLambdas: () => Promise<void>
  loadRunnableLambda: (id: string) => Promise<void>

  createRunnableLambda: (data: any) => Promise<any>
  updateRunnableLambda: (id: string, data: any) => Promise<any>
  deleteRunnableLambda: (id: string) => Promise<void>
}

export const useRunnableLambdaStore = create<RunnableLambdaStore>((set, get) => ({
  runnableLambdas: [],
  current: null,

  loading: false,
  loadingOne: false,

  // ---------------------------
  // LIST
  // ---------------------------
  loadRunnableLambdas: async () => {
    try {
      set({ loading: true })

      const res = await fetchRunnableLambdas()

      const rows =
        res?.runnableLambdas ??
        res?.data?.runnableLambdas ??
        res ??
        []

      set({
        runnableLambdas: rows,
        loading: false,
      })
    } catch (err) {
      console.error("Failed to load runnable lambdas", err)
      set({ loading: false })
    }
  },

  // ---------------------------
  // GET ONE
  // ---------------------------
  loadRunnableLambda: async (id: string) => {
    try {
      set({ loadingOne: true })

      const res = await fetchRunnableLambdaById(id)

      const lambda =
        res?.runnableLambda ??
        res?.data?.runnableLambda ??
        res

      set({
        current: lambda,
        loadingOne: false,
      })
    } catch (err) {
      console.error("Failed to load runnable lambda", err)
      set({ loadingOne: false })
    }
  },

  // ---------------------------
  // CREATE
  // ---------------------------
  createRunnableLambda: async (data: any) => {
    const res = await createRunnableLambda(data)

    const created =
      res?.runnableLambda ??
      res?.data?.runnableLambda ??
      res

    if (created?.id) {
      set({
        runnableLambdas: [created, ...get().runnableLambdas],
      })
    }

    return created
  },

  // ---------------------------
  // UPDATE
  // ---------------------------
  updateRunnableLambda: async (id: string, data: any) => {
    const res = await updateRunnableLambda(id, data)

    const updated =
      res?.runnableLambda ??
      res?.data?.runnableLambda ??
      res

    if (updated?.id) {
      set({
        runnableLambdas: get().runnableLambdas.map((x) =>
          x.id === id ? updated : x
        ),
        current: updated,
      })
    }

    return updated
  },

  // ---------------------------
  // DELETE
  // ---------------------------
  deleteRunnableLambda: async (id: string) => {
    await deleteRunnableLambda(id)

    set({
      runnableLambdas: get().runnableLambdas.filter((x) => x.id !== id),
    })
  },
}))