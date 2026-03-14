/* eslint-disable @typescript-eslint/no-explicit-any */
import { useSocket } from '@/providers/SocketProvider'

import { JobAckPayload } from '@/services/socket.io/JobAckPlayload'
import { useEffect, useState } from 'react'

interface ItemQueueProps {
    job: JobAckPayload
    index: number
}

function ItemQueue({ job, index }: ItemQueueProps) {
    const { socket, isConnected } = useSocket()
    const [item, setItem] = useState<any>(job)

    useEffect(() => {
        if (!isConnected) return
        const eventName = `update:job:create-project:${job.id}` // example (must match server emit)
        const handler = (payload: any) => {
            console.log('Got server event:', eventName, payload)
            setItem((prev:any) => ({ ...prev, ...payload }))
        }

        socket.on(eventName, handler)
        return () => {
            socket.off(eventName, handler)
        }
    }, [socket, isConnected])
    return (
        <div>
            {' '}
            <li key={index} className="p-2 border rounded-md bg-white">
                <p className="text-sm font-semibold">Job ID: {item.id}</p>
                <p className="text-sm">Prompt: {item.prompt}</p>
                <p className="text-sm font-semibold">
                    Correlation ID: {item.correlationId}
                </p>
                <p className="text-sm text-gray-600">Status: {item.status}</p>
            </li>
        </div>
    )
}

export default ItemQueue
