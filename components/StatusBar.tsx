
import React from 'react';
import { useAppContext } from '../hooks/useAppContext';
import { SourceControlIcon, TerminalIcon } from './icons';

const StatusBar: React.FC = () => {
    const { cursorPosition, activeTabId, openTabs, theme, setTheme, toggleTerminal } = useAppContext();

    const activeTab = openTabs.find(tab => tab.id === activeTabId);

    const getLanguageFromPath = (path: string | undefined): string => {
        if(!path) return '';
        const extension = path.split('.').pop()?.toLowerCase();
        switch (extension) {
            case 'js':
            case 'jsx':
                return 'JavaScript';
            case 'ts':
            case 'tsx':
                return 'TypeScript';
            case 'css':
                return 'CSS';
            case 'json':
                return 'JSON';
            case 'md':
                return 'Markdown';
            case 'html':
                return 'HTML';
            default:
                return 'Plain Text';
        }
    };

    return (
        <div className="h-6 bg-vscode-light-statusbar dark:bg-vscode-statusbar text-white flex items-center justify-between px-2 text-xs">
            <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-1">
                    <SourceControlIcon className="w-4 h-4" />
                    <span>main</span>
                </div>
                {/* Add other status items here */}
            </div>
            <div className="flex items-center space-x-4">
                {activeTab && (
                    <>
                        <span>Ln {cursorPosition.lineNumber}, Col {cursorPosition.column}</span>
                        <span>{getLanguageFromPath(activeTab.name)}</span>
                    </>
                )}
                <button onClick={toggleTerminal} className="flex items-center" aria-label="Toggle Terminal">
                    <TerminalIcon className="w-4 h-4" />
                </button>
                 <button onClick={() => setTheme(theme === 'vs-dark' ? 'vs-light' : 'vs-dark')} className="capitalize">
                    {theme === 'vs-dark' ? 'Dark' : 'Light'} Mode
                </button>
                <span>UTF-8</span>
            </div>
        </div>
    );
};

export default StatusBar;