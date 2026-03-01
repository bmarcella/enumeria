/* eslint-disable @typescript-eslint/no-explicit-any */
import appConfig from '@/configs/app.config'
import { TOKEN_NAME_IN_STORAGE, TOKEN_TYPE } from '@/constants/api.constant'
import { socket } from '@/services/socket.io'
import { useSessionUser } from '@/stores/authStore'
import React, {
    createContext,
    useContext,
    useEffect,
    useMemo,
    useState,
} from 'react'
import { v4 as uuid } from 'uuid'

type SocketContextValue = {
    socket: typeof socket
    isConnected: boolean
    OnMessage: <T = any>(name: string, payload: T, isAuth?: boolean) => void
}

const SocketContext = createContext<SocketContextValue | null>(null)

export function SocketProvider({ children }: { children: React.ReactNode }) {
    const [isConnected, setIsConnected] = useState(socket.connected)
    const user = useSessionUser((s) => s.user)
    const token = useMemo(() => {
        const storage = appConfig.accessTokenPersistStrategy

        if (storage === 'localStorage' || storage === 'sessionStorage') {
            let accessToken = ''

            if (storage === 'localStorage') {
                accessToken = localStorage.getItem(TOKEN_NAME_IN_STORAGE) || ''
            }

            if (storage === 'sessionStorage') {
                accessToken =
                    sessionStorage.getItem(TOKEN_NAME_IN_STORAGE) || ''
            }

            if (accessToken) {
                return `${TOKEN_TYPE}${accessToken}`
            }
        }
    }, [user])

    useEffect(() => {
        const tenantId = user.currentSetting?.orgId ?? 'default'
        const correlationId = uuid() // new per connection (or per page load)
        //  inject auth BEFORE connect
        socket.auth = {
            tenantId,
            correlationId,
            token,
        }
        socket.connect()
        const onConnect = () => setIsConnected(true)
        const onDisconnect = () => setIsConnected(false)
        socket.on('connect', onConnect)
        socket.on('disconnect', onDisconnect)
        return () => {
            socket.off('connect', onConnect)
            socket.off('disconnect', onDisconnect)
            socket.disconnect()
        }
    }, [token])

    const OnMessage = <T,>(name: string, payload: T, isAuth?: boolean) => {
        if (!socket.connected) {
            console.warn(
                'Socket not connected. Message not sent:',
                name,
                payload,
            )
            return
        }
        const tenantId = user.currentSetting?.orgId ?? 'default'
        const correlationId = uuid() // new per connection (or per page load)
        const new_payload = {
            ...payload,
            tenantId,
            correlationId,
            ...(isAuth && { token }), // in case backend needs to verify for this message
        }
        socket.emit(name, new_payload)
    }

    const value = useMemo(
        () => ({ socket, isConnected, OnMessage }),
        [isConnected, token],
    )

    return (
        <SocketContext.Provider value={value}>
            {children}
        </SocketContext.Provider>
    )
}

export function useSocket() {
    const ctx = useContext(SocketContext)
    if (!ctx) throw new Error('useSocket must be used within SocketProvider')
    return ctx
}
