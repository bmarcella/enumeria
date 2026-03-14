import ChatView from './components/ChatView'
import useResponsive from '@/utils/hooks/useResponsive'

const GenerativeChat = () => {
    const { larger } = useResponsive()

    return (
        <div className="h-full w-full flex">
            <ChatView />
            {/* { larger.xl && <ChatSideNav />}
                { <ChatHistoryRenameDialog /> } */}
        </div>
    )
}

export default GenerativeChat
