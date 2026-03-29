import { ReactNode } from 'react'
import classNames from 'classnames'

interface Props {
    sidebar?: ReactNode
    content: ReactNode
}

const MainDamba = ({ sidebar, content }: Props) => {
    return (
        <main className="w-full h-full flex-1 overflow-hidden">
            <div
                className={classNames(
                    'w-full h-full grid',
                    sidebar
                        ? 'grid-cols-1 lg:grid-cols-[auto_1fr]'
                        : 'grid-cols-1',
                )}
            >
                {/* Left Sidebar */}
                {sidebar && (
                    <aside className="mr-2 lg:sticky lg:top-0 lg:h-screen bg-white dark:bg-gray-900 p-1 rounded-lg border border-gray-200 dark:border-gray-700">
                        {sidebar}
                    </aside>
                )}

                {/* Content */}
                <section className="min-w-0 h-full overflow-hidden rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900">
                    {content}
                </section>
            </div>
        </main>
    )
}

export default MainDamba
