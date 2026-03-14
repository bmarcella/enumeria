/* eslint-disable @typescript-eslint/no-explicit-any */
import React, {
    createContext,
    useContext,
    useEffect,
    useMemo,
    useRef,
    useState,
    useCallback,
} from 'react'
import { v4 as uuid } from 'uuid'

import { useAuth } from '@/auth'
import appConfig from '@/configs/app.config'
import { TOKEN_NAME_IN_STORAGE, TOKEN_TYPE } from '@/constants/api.constant'
import { socket } from '@/services/socket.io'
import { useSessionUser } from '@/stores/authStore'
import { AckResponse } from '../../../../common/Damba/v2/Entity/ISocket';

type SocketContextValue = {
    socket: typeof socket
    isConnected: boolean

    /**
     * Send a message with auto correlationId.
     * Returns correlationId immediately and resolves with ack response (if ack is used).
     */
    send: <T = any>(
        name: string,
        payload: T,
        opts?: {
            ack?: (resp: AckResponse) => void
            isAuth?: boolean
            correlationId?: string // allow caller override (rare)
        },
    ) => { correlationId: string }

    /**
     * Convenience promise-based send (requires server ack).
     */
    sendAsync: <T = any>(
        name: string,
        payload: T,
        opts?: { isAuth?: boolean; correlationId?: string; timeoutMs?: number },
    ) => Promise<AckResponse>

    /**
     * Useful for debugging / tracking server-generated requestIds.
     * correlationId -> requestId
     */
    requestIds: Map<string, string>
}

const SocketContext = createContext<SocketContextValue | null>(null)

function getTokenFromStorage(): string | undefined {
    const storage = appConfig.accessTokenPersistStrategy
    if (storage !== 'localStorage' && storage !== 'sessionStorage') return

    const raw =
        storage === 'localStorage'
            ? localStorage.getItem(TOKEN_NAME_IN_STORAGE) || ''
            : sessionStorage.getItem(TOKEN_NAME_IN_STORAGE) || ''

    return raw ? `${TOKEN_TYPE}${raw}` : undefined
}

export function SocketProvider({ children }: { children: React.ReactNode }) {
    const [isConnected, setIsConnected] = useState(socket.connected)

    const { authenticated } = useAuth()
    const user = useSessionUser((s) => s.user)

    const token = useMemo(
        () => getTokenFromStorage(),
        [authenticated, user?.id],
    )

    // Stable per-connection id (helps debugging; not used for message routing)
    const connectionIdRef = useRef<string>(uuid())

    // correlationId -> requestId (server-generated)
    const requestIdsRef = useRef<Map<string, string>>(new Map())

    const tenantId = useMemo(
        () => user?.currentSetting?.orgId ?? 'default',
        [user?.currentSetting?.orgId],
    )

    // Keep auth data fresh on the socket instance
    useEffect(() => {
        // If no token, disconnect but don't spam listeners
        if (!token) {
            socket.auth = { tenantId, token: undefined, userId: user?.id }
            if (socket.connected) socket.disconnect()
            setIsConnected(false)
            return
        }
        // Update auth before connecting/reconnecting
        // connectionId is stable for this browser session; regenerate on each connect if you prefer
        const correlationId =  uuid()
        socket.auth = {
            tenantId,
            token,
            userId: user?.id,
            connectionId: connectionIdRef.current,
            correlationId
        }

        // Ensure we have listeners exactly once
        const onConnect = () => {
            setIsConnected(true)
            // new connection -> reset connectionId if you want per actual connection:
            // connectionIdRef.current = uuid();
            // socket.auth = { ...socket.auth, connectionId: connectionIdRef.current };
        }
        const onDisconnect = () => setIsConnected(false)

        socket.off('connect', onConnect)
        socket.off('disconnect', onDisconnect)
        socket.on('connect', onConnect)
        socket.on('disconnect', onDisconnect)

        // Connect if not connected
        if (!socket.connected) socket.connect()

        return () => {
            socket.off('connect', onConnect)
            socket.off('disconnect', onDisconnect)
            // optional: don't force disconnect on unmount if app relies on persistent socket
            socket.disconnect()
        }
    }, [token, tenantId, user?.id])

   const  getCorrelationId = () => {
        return uuid()
    }

    const send = useCallback(
        <T,>(
            name: string,
            payload: T,
            opts?: {
                ack?: (resp: AckResponse) => void
                isAuth?: boolean
                correlationId?: string
            },
        ) => {
            if (!socket.connected) {
                console.warn(
                    'Socket not connected. Message not sent:',
                    name,
                    payload,
                )
                return { correlationId: opts?.correlationId ?? 'not-sent' }
            }

            const correlationId = opts?.correlationId ?? uuid()

            const messagePayload: any = {
                ...payload,
                tenantId,
                correlationId,
                // Only send token per-message if explicitly requested
                ...(opts?.isAuth ? { token } : {}),
            }

            const ack = (resp: AckResponse) => {
                // Save server requestId for later tracking
                if (resp?.correlationId && resp?.requestId) {
                    requestIdsRef.current.set(
                        resp.correlationId,
                        resp.requestId,
                    )
                }
                opts?.ack?.(resp)
            }

            if (opts?.ack) socket.emit(name, messagePayload, ack)
            else socket.emit(name, messagePayload)

            return { correlationId }
        },
        [tenantId, token],
    )

    const sendAsync = useCallback(
        <T,>(
            name: string,
            payload: T,
            opts?: {
                isAuth?: boolean
                correlationId?: string
                timeoutMs?: number
            },
        ) => {
            const timeoutMs = opts?.timeoutMs ?? 15000

            return new Promise<AckResponse>((resolve, reject) => {
                if (!socket.connected) {
                    reject(new Error('Socket not connected'))
                    return
                }

                const timer = setTimeout(() => {
                    reject(
                        new Error(
                            `Socket ack timeout after ${timeoutMs}ms for "${name}"`,
                        ),
                    )
                }, timeoutMs)

                send<T>(name, payload, {
                    isAuth: opts?.isAuth,
                    correlationId: opts?.correlationId,
                    ack: (resp) => {
                        clearTimeout(timer)
                        resolve(resp)
                    },
                })
            })
        },
        [send],
    )

    const value = useMemo<SocketContextValue>(
        () => ({
            socket,
            isConnected,
            send,
            sendAsync,
            requestIds: requestIdsRef.current,
        }),
        [isConnected, send, sendAsync],
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
