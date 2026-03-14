import { lazy } from 'react'
import authRoute from './authRoute'
import othersRoute from './othersRoute'
import type { Routes } from '@/@types/routes'

export const publicRoutes: Routes = [...authRoute]

export const protectedRoutes: Routes = [
    {
        key: 'projects',
        path: '/projects',
        component: lazy(() => import('@/views/InProject')),
        authority: ['user', 'admin', 'super_admin', 'bill_admin'],
    },
    {
        key: 'home',
        path: '/home',
        component: lazy(() => import('@/views/Home')),
        authority: ['user', 'admin', 'super_admin', 'bill_admin'],
    },
    {
        key: 'create-agent',
        path: '/developer/create/agent',
        component: lazy(
            () => import('@/views/Pages/Agents/AgentsDefinition/create'),
        ),
        authority: ['user', 'admin', 'super_admin', 'bill_admin'],
    },
    {
        key: 'update-agent-manifest',
        path: '/developer/update/agent-manifest/:agentId',
        component: lazy(
            () =>
                import(
                    '@/views/Pages/Agents/AgentsDefinition/update/AgentManifestBuilderPage'
                ),
        ),
        authority: ['user', 'admin', 'super_admin', 'bill_admin'],
    },
    {
        key: 'list-tool-artifact',
        path: '/developer/list/tool',
        component: lazy(() => import('@/views/Pages/Agents/ToolArtifact/list')),
        authority: ['user', 'admin', 'super_admin', 'bill_admin'],
    },
    {
        key: 'create-tool-artifact',
        path: '/developer/create/tool',
        component: lazy(
            () => import('@/views/Pages/Agents/ToolArtifact/create'),
        ),
        authority: ['user', 'admin', 'super_admin', 'bill_admin'],
    },
    {
        key: 'create-runnable-artifact',
        path: '/developer/create/runnable',
        component: lazy(
            () => import('@/views/Pages/Agents/RunnableLambda/create'),
        ),
        authority: ['user', 'admin', 'super_admin', 'bill_admin'],
    },
    {
        key: 'editor-tool-artifact',
        path: '/developer/tool/editor/:id',
        component: lazy(
            () => import('@/views/Pages/Agents/ToolArtifact/editor'),
        ),
        authority: ['user', 'admin', 'super_admin', 'bill_admin'],
    },
    ...othersRoute,
]
