import { ReactNode } from 'react'
import classNames from 'classnames'


interface Props {
    sidebar?: ReactNode
    content: ReactNode
}

const MainDamba = ({ sidebar, content }: Props) => {
    return (
        <main className="w-full min-h-screen">
            <div
                className={classNames(
                    'w-full grid gap-4',
                    sidebar
                        ? 'grid-cols-1 lg:grid-cols-[auto_1fr]'
                        : 'grid-cols-1'
                )}
            >
                {/* Left Sidebar */}
                {sidebar && (
                    <aside className="lg:sticky lg:top-0 lg:h-screen bg-white dark:bg-gray-900 p-1 rounded-lg border border-gray-200 dark:border-gray-700">
                        {sidebar}
                    </aside>
                )}

                {/* Content */}
                <section className="min-w-0 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 h-[calc(100vh-2rem)] overflow-hidden">
                    <div className="w-full h-full">{content}</div>
                </section>
            </div>
        </main>
    )
}

export default MainDamba
