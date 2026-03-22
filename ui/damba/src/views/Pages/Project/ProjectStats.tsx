import { useEffect, useState } from 'react';
import { ApiGet } from '@/services/ApiRequest';
import endpointConfig from '@/configs/endpoint.config';
import { HiOutlineViewGrid, HiOutlineUsers } from 'react-icons/hi';
import classNames from 'classnames';

interface ProjectStatsProps {
    projectId: string;
    className?: string;
}

export const ProjectStats = ({ projectId, className }: ProjectStatsProps) => {
    const [stats, setStats] = useState<{ totalApps: number; totalContributors: number } | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        let isMounted = true;
        
        const fetchStats = async () => {
            try {
                setLoading(true);
                const response = await ApiGet(`${endpointConfig.projects}/${projectId}/stats`) as { totalApps: number; totalContributors: number };
                if (isMounted && response) {
                    setStats(response);
                }
            } catch (error) {
                console.error("Failed to fetch project stats", error);
            } finally {
                if (isMounted) {
                    setLoading(false);
                }
            }
        };

        if (projectId) {
            fetchStats();
        }

        return () => {
            isMounted = false;
        };
    }, [projectId]);

    if (loading) {
        return (
            <div className={classNames("flex items-center gap-4 text-gray-400 dark:text-gray-500 animate-pulse text-sm", className)}>
                <div className="flex items-center gap-1"><HiOutlineViewGrid /><span>...</span></div>
                <div className="flex items-center gap-1"><HiOutlineUsers /><span>...</span></div>
            </div>
        );
    }

    if (!stats) return null;

    return (
        <div className={classNames("flex items-center gap-4 text-sm font-medium text-gray-600 dark:text-gray-400", className)}>
            <div className="flex items-center gap-1.5" title="Total Applications">
                <HiOutlineViewGrid className="text-lg text-gray-400 dark:text-gray-500" />
                <span>{stats.totalApps} Apps</span>
            </div>
            <div className="flex items-center gap-1.5" title="Total Collaborators">
                <HiOutlineUsers className="text-lg text-gray-400 dark:text-gray-500" />
                <span>{stats.totalContributors} Members</span>
            </div>
        </div>
    );
};
