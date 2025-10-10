import { lazy } from 'react'
import authRoute from './authRoute'
import othersRoute from './othersRoute'
import type { Routes } from '@/@types/routes'

export const publicRoutes: Routes = [...authRoute]

export const protectedRoutes: Routes = [
    {
        key: 'home2',
        path: '/home2',
        component: lazy(() => import('@/views/Home')),
        authority: [],
    },
    ...othersRoute,
]
