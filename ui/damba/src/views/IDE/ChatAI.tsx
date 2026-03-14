import ChatView from '../ai/Chat/components/ChatView'
export function ChatAi() {
    return (
        <aside className="h-screen sticky top-0 w-2/4 min-w-[450px] max-w-[550px] shrink-0 border-r border-l border-slate-200 bg-white">
            <div className="h-[calc(86%-49px)] overflow-auto width-full p-1">
                <ChatView />
            </div>
        </aside>
    )
}
