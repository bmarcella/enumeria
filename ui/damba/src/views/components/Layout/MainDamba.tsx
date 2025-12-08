import React, { ReactNode } from 'react'

interface Props {
    sidebar: ReactNode
    content: ReactNode
}

const MainDamba = ({ sidebar, content }: Props) => {
    return (
        <main className="w-full min-h-screen">
            <div className="w-full grid grid-cols-1 lg:grid-cols-[auto_1fr] gap-4">
                {/* Left Sidebar */}
                <aside className="lg:sticky lg:top-0 lg:h-screen bg-white p-1 rounded-lg border border-gray-200 dark:border-gray-700">
                    {sidebar}
                </aside>

                {/* Content */}
                <section className="min-w-0 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900">
                    <div className="w-full p-4">{content}</div>
                </section>
            </div>
        </main>
    )
}

export default MainDamba
