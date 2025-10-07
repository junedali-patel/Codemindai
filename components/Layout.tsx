import React from 'react';
import ActivityBar from './ActivityBar';
import Sidebar from './Sidebar';
import EditorPane from './EditorPane';
import StatusBar from './StatusBar';
import { useAppContext } from '../hooks/useAppContext';
import CommandPalette from './CommandPalette';
import TerminalPanel from './TerminalPanel';
import MenuBar from './MenuBar';

const Layout: React.FC = () => {
    const { isSidebarVisible, isTerminalOpen } = useAppContext();

    return (
        <div className="flex flex-col h-screen">
            <MenuBar />
            <main className="flex flex-1 overflow-hidden">
                <ActivityBar />
                {isSidebarVisible && <Sidebar />}
                <div className="flex flex-col flex-1 min-w-0">
                    <div className="flex-1 relative">
                        <EditorPane />
                    </div>
                    {isTerminalOpen && <TerminalPanel />}
                </div>
            </main>
            <StatusBar />
            <CommandPalette />
        </div>
    );
};

export default Layout;
