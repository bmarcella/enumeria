/* eslint-disable @typescript-eslint/no-explicit-any */
import { JobAckPayload } from '@/services/socket.io/JobAckPlayload'
import ItemQueue from './ItemQueue'

function CardQueue({ data }: { data: JobAckPayload[] }) {
    return (
        <div className="p-1  rounded-md bg-gray-50">
            <h3 className="text-lg font-medium mb-2">Queue</h3>
            <ul className="space-y-1">
                {data.map((item, index) => (
                    <ItemQueue key={index} job={item} index={index} />
                ))}
            </ul>
        </div>
    )
}

export default CardQueue
