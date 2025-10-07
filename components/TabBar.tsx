
import React from 'react';
import { useAppContext } from '../hooks/useAppContext';
import { CloseIcon } from './icons';

const TabBar: React.FC = () => {
    const { openTabs, activeTabId, setActiveTab, closeTab } = useAppContext();

    if (openTabs.length === 0) {
        return <div className="h-[35px] bg-vscode-light-tab-inactive dark:bg-vscode-tab-inactive border-b border-vscode-light-border dark:border-vscode-border"></div>;
    }

    return (
        <div className="flex h-[35px] bg-vscode-light-tab-inactive dark:bg-vscode-tab-inactive border-b border-vscode-light-border dark:border-vscode-border">
            {openTabs.map(tab => (
                <div
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex items-center justify-between px-3 cursor-pointer border-r border-vscode-light-border dark:border-vscode-border ${
                        activeTabId === tab.id
                            ? 'bg-vscode-light-tab-active dark:bg-vscode-tab-active'
                            : 'hover:bg-gray-200/50 dark:hover:bg-gray-500/20'
                    }`}
                >
                    <span className="text-sm mr-2 whitespace-nowrap">{tab.name}</span>
                    <button
                        onClick={(e) => {
                            e.stopPropagation();
                            closeTab(tab.id);
                        }}
                        className="w-5 h-5 flex items-center justify-center rounded hover:bg-gray-300 dark:hover:bg-gray-600"
                    >
                       {tab.isDirty ? <span className="text-xs">&#9679;</span> : <CloseIcon className="w-4 h-4" />}
                    </button>
                </div>
            ))}
        </div>
    );
};

export default TabBar;
