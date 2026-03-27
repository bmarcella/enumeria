/* eslint-disable @typescript-eslint/no-explicit-any */
import { useSocket } from '@/providers/SocketProvider'

import { JobAckPayload } from '@/services/socket.io/JobAckPlayload'
import { useEffect, useMemo, useState } from 'react'
import SubJobQueue from './SubJobQueue'

interface ItemQueueProps {
    job: JobAckPayload
    index: number
}

function ItemQueue({ job, index }: ItemQueueProps) {
    const { socket, isConnected } = useSocket()
    const [subJobs, setsubJobs] = useState<any[]>()
    const item = useMemo(() => job, [job])

    useEffect(() => {
        if (!isConnected) return
        const eventName = `progress:job:create-project:${job.id}`
        const handler = (payload: any) => {
            console.log('Got server event:', eventName, payload)
            // setsubJobs((prev: any) => [...prev, ...payload])
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
                {subJobs && subJobs?.length > 0 && (
                    <SubJobQueue jobs={subJobs}></SubJobQueue>
                )}
            </li>
        </div>
    )
}

export default ItemQueue
