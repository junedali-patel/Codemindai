import React, { useEffect, useRef } from 'react';
import { useAppContext } from '../hooks/useAppContext';
import Editor, { OnChange, OnMount } from '@monaco-editor/react';
import TabBar from './TabBar';

const EditorPane: React.FC = () => {
    const {
        openTabs,
        activeTabId,
        theme,
        updateTabContent,
        setCursorPosition,
        editorRef,
    } = useAppContext();

    const activeTab = openTabs.find(tab => tab.id === activeTabId);

    const handleEditorChange: OnChange = (value) => {
        if (activeTab && value !== undefined) {
            updateTabContent(activeTab.id, value);
        }
    };
    
    const handleEditorDidMount: OnMount = (editor, monaco) => {
        editorRef.current = editor;
        editor.onDidChangeCursorPosition(e => {
            setCursorPosition(e.position);
        });
    }

    const getLanguageFromPath = (path: string): string => {
        const extension = path.split('.').pop()?.toLowerCase();
        switch (extension) {
            case 'js':
            case 'jsx':
                return 'javascript';
            case 'ts':
            case 'tsx':
                return 'typescript';
            case 'css':
                return 'css';
            case 'json':
                return 'json';
            case 'md':
                return 'markdown';
            case 'html':
                return 'html';
            default:
                return 'plaintext';
        }
    };

    return (
        <div className="flex flex-col h-full w-full bg-vscode-light-tab-active dark:bg-vscode-tab-active">
            <TabBar />
            <div className="flex-1">
                {activeTab ? (
                    <Editor
                        height="100%"
                        language={getLanguageFromPath(activeTab.name)}
                        value={activeTab.content}
                        theme={theme}
                        onChange={handleEditorChange}
                        onMount={handleEditorDidMount}
                        options={{
                            minimap: { enabled: true },
                            fontSize: 14,
                            wordWrap: 'on',
                            scrollBeyondLastLine: false,
                            glyphMargin: true, // Enable gutter for explanation icons
                        }}
                    />
                ) : (
                    <div className="flex items-center justify-center h-full text-vscode-light-text-secondary dark:text-vscode-text-secondary">
                        <div className="text-center">
                            <h2 className="text-2xl font-light mb-2">VS Code Web Edition</h2>
                            <p>Select a file to begin editing.</p>
                            <p className="mt-4 text-sm">Use <kbd className="px-2 py-1.5 text-xs font-semibold text-gray-800 bg-gray-100 border border-gray-200 rounded-lg">Ctrl/Cmd</kbd> + <kbd className="px-2 py-1.5 text-xs font-semibold text-gray-800 bg-gray-100 border border-gray-200 rounded-lg">S</kbd> to save changes.</p>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default EditorPane;