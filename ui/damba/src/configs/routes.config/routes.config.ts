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
    ...othersRoute,
]
