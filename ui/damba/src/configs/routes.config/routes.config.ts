import { lazy } from 'react'
import authRoute from './authRoute'
import othersRoute from './othersRoute'
import type { Routes } from '@/@types/routes'

export const publicRoutes: Routes = [...authRoute]

export const protectedRoutes: Routes = [
    // ── IDE Routes ──────────────────────────────────────────────
    {
        key: 'home',
        path: '/home',
        component: lazy(() => import('@/views/Pages/Project/Dashboard')),
        authority: ['user', 'admin', 'super_admin', 'bill_admin'],
        meta: { layout: 'blank' },
    },
    {
        key: 'workspace',
        path: '/workspace',
        component: lazy(() => import('@/views/Pages/Workspace/WorkspaceIDE')),
        authority: ['user', 'admin', 'super_admin', 'bill_admin'],
        meta: { layout: 'blank' },
    },
    {
        key: 'new-project',
        path: '/new-project',
        component: lazy(() => import('@/views/Pages/Project/NewProject')),
        authority: ['user', 'admin', 'super_admin', 'bill_admin'],
        meta: { layout: 'blank' },
    },
    {
        key: 'pipeline-wizard',
        path: '/pipeline',
        component: lazy(() => import('@/views/Pages/Pipeline/PipelineWizard')),
        authority: [],
        meta: { layout: 'blank' },
    },
    {
        key: 'manual-pipeline',
        path: '/manual-pipeline',
        component: lazy(
            () => import('@/views/Pages/Pipeline/ManualPipelineWizard'),
        ),
        authority: ['user', 'admin', 'super_admin', 'bill_admin'],
        meta: { layout: 'blank' },
    },

    // ── Legacy Routes (kept for compatibility) ──────────────────
    {
        key: 'projects',
        path: '/projects',
        component: lazy(() => import('@/views/InProject')),
        authority: ['user'],
    },
    {
        key: 'create-tool-artifact',
        path: '/developer/create/tool',
        component: lazy(() => import('@/views/Pages/Developer/Tool/create')),
        authority: ['user', 'admin', 'super_admin', 'bill_admin'],
    },
    {
        key: 'editor-tool-artifact',
        path: '/developer/tool/editor/:id',
        component: lazy(() => import('@/views/Pages/Developer/Tool/editor')),
        authority: ['user', 'admin', 'super_admin', 'bill_admin'],
    },
    ...othersRoute,
]
