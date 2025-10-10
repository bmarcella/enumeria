import { Suspense } from 'react'
import Loading from '@/components/shared/Loading'
import type { CommonProps } from '@/@types/common'
import { useAuth } from '@/auth'
import { useThemeStore } from '@/stores/themeStore'
import PostLoginLayout from './PostLoginLayout'
import PreLoginLayout from './PreLoginLayout'

const Layout = ({ children }: CommonProps) => {
    const layoutType = useThemeStore((state) => state.layout.type)
 
    const { authenticated, byPassLogin } = useAuth();
    return (
        <Suspense
            fallback={
                <div className="flex flex-auto flex-col h-[100vh]">
                    <Loading loading={true} />
                </div>
            }
        >
            {authenticated || byPassLogin ? (
                <PostLoginLayout layoutType={layoutType}>
                    {children}
                  
                </PostLoginLayout>
            ) : (
                <PreLoginLayout>{children}</PreLoginLayout>
            )}
        </Suspense>
    )
}

export default Layout
