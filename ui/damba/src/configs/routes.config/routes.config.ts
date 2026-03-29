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
        key: 'pipeline-wizard',
        path: '/pipeline',
        component: lazy(() => import('@/views/Pages/Pipeline')),
        authority: [],
    },
    {
        key: 'home',
        path: '/home',
        component: lazy(() => import('@/views/Home')),
        authority: ['user', 'admin', 'super_admin', 'bill_admin'],
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
