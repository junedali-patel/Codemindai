import React from 'react';
import { useAppContext } from '../hooks/useAppContext';
import { ActiveView } from '../types';
import { FileIcon, SearchIcon, SourceControlIcon, DebugIcon, ExtensionsIcon, SparkleIcon } from './icons';

const ActivityBar: React.FC = () => {
    const { activeView, setActiveView } = useAppContext();

    const views: { id: ActiveView; icon: React.ReactNode }[] = [
        { id: 'explorer', icon: <FileIcon className="w-6 h-6" /> },
        { id: 'search', icon: <SearchIcon className="w-6 h-6" /> },
        { id: 'source-control', icon: <SourceControlIcon className="w-6 h-6" /> },
        { id: 'ai-assistant', icon: <SparkleIcon className="w-6 h-6" /> },
        { id: 'debug', icon: <DebugIcon className="w-6 h-6" /> },
        { id: 'extensions', icon: <ExtensionsIcon className="w-6 h-6" /> },
    ];

    return (
        <div className="w-12 h-full bg-vscode-light-activitybar dark:bg-vscode-activitybar flex flex-col items-center py-2 text-vscode-light-text-secondary dark:text-vscode-text-secondary">
            {views.map(({ id, icon }) => (
                <button
                    key={id}
                    onClick={() => setActiveView(id)}
                    className={`p-2 my-1 rounded-md transition-colors ${
                        activeView === id ? 'text-white bg-vscode-statusbar' : 'hover:bg-gray-500/20'
                    }`}
                    aria-label={id}
                >
                    {icon}
                </button>
            ))}
        </div>
    );
};

export default ActivityBar;