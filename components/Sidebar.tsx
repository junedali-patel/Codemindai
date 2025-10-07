import React from 'react';
import { useAppContext } from '../hooks/useAppContext';
import FileExplorer from './FileExplorer';
import SourceControlView from './SourceControlView';
import AiAssistantView from './AiAssistantView';

const Sidebar: React.FC = () => {
    const { activeView } = useAppContext();

    const renderView = () => {
        switch (activeView) {
            case 'explorer':
                return <FileExplorer />;
            case 'search':
                return <div className="p-2">Search View</div>;
            case 'source-control':
                return <SourceControlView />;
            case 'ai-assistant':
                return <AiAssistantView />;
            case 'debug':
                return <div className="p-2">Debug View</div>;
            case 'extensions':
                return <div className="p-2">Extensions View</div>;
            default:
                return null;
        }
    };
    
    const viewTitles: { [key in typeof activeView]: string } = {
        explorer: 'EXPLORER',
        search: 'SEARCH',
        'source-control': 'SOURCE CONTROL',
        'ai-assistant': 'AI ASSISTANT',
        debug: 'RUN AND DEBUG',
        extensions: 'EXTENSIONS'
    }

    return (
        <div className="w-64 h-full bg-vscode-light-sidebar dark:bg-vscode-sidebar flex flex-col border-r border-vscode-light-border dark:border-vscode-border">
            <div className="p-2.5 text-xs font-bold tracking-wider text-vscode-light-text-secondary dark:text-vscode-text-secondary">
                {viewTitles[activeView]}
            </div>
            <div className="flex-1 overflow-y-auto">
                {renderView()}
            </div>
        </div>
    );
};

export default Sidebar;