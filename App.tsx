import React, { useState, useEffect } from 'react';
import { AppProvider } from './context/AppContext';
import Layout from './components/Layout';
import { Theme } from './types';

const AppContent: React.FC = () => {
    // FIX: Removed API key management logic from the UI as per guidelines.
    // The original error was an incorrect import of 'useAppContext', which is no longer needed here.
    return (
        <div className="h-screen w-screen bg-vscode-light-bg dark:bg-vscode-bg text-vscode-light-text dark:text-vscode-text">
            <Layout />
        </div>
    );
};


const App: React.FC = () => {
    const [theme, setTheme] = useState<Theme>('vs-dark');

    useEffect(() => {
        const root = window.document.documentElement;
        if (theme === 'vs-dark') {
            root.classList.add('dark');
        } else {
            root.classList.remove('dark');
        }
    }, [theme]);
    
    return (
        <AppProvider>
            <AppContent />
        </AppProvider>
    );
};

export default App;
