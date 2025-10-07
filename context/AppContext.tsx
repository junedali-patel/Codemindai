import React, { createContext, useState, useCallback, ReactNode, useEffect, useRef } from 'react';
import { FileSystemTree, EditorTab, Theme, ActiveView, FileSystemNode, ChatMessage, AppContextType } from '../types';
import { INITIAL_FILE_SYSTEM } from '../constants';
import { GoogleGenAI } from '@google/genai';

// FIX: Per guidelines, initialize GoogleGenAI with API key from environment variables.
// The API key must not be managed through the UI.
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY! });

export const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [fileSystem, setFileSystem] = useState<FileSystemTree>(INITIAL_FILE_SYSTEM);
    const [openTabs, setOpenTabs] = useState<EditorTab[]>([]);
    const [activeTabId, setActiveTabId] = useState<string | null>(null);
    const [theme, setTheme] = useState<Theme>('vs-dark');
    const [activeView, setActiveView] = useState<ActiveView>('explorer');
    const [isSidebarVisible, setIsSidebarVisible] = useState<boolean>(true);
    const [isTerminalOpen, setIsTerminalOpen] = useState<boolean>(false);
    const [isCommandPaletteOpen, setIsCommandPaletteOpen] = useState<boolean>(false);
    const [cursorPosition, setCursorPosition] = useState({lineNumber: 1, column: 1});
    const editorRef = useRef<any>(null);
    const editorDecorations = useRef<Record<string, string[]>>({}); // { [tabId]: decorationIds[] }

    // Git state
    const [unstagedChanges, setUnstagedChanges] = useState<Set<string>>(new Set());
    const [stagedChanges, setStagedChanges] = useState<Set<string>>(new Set());
    const [commitMessage, setCommitMessage] = useState('');

    // AI State
    const [chatHistory, setChatHistory] = useState<ChatMessage[]>([]);
    const [isAiLoading, setIsAiLoading] = useState(false);

    const getFileContent = useCallback((path: string, fs: FileSystemTree = fileSystem): string | null => {
        const parts = path.split('/').filter(p => p);
        let currentNode: FileSystemNode | FileSystemTree = fs;
        for (const part of parts) {
            if (typeof currentNode === 'object' && 'type' in currentNode) {
                if (currentNode.type === 'folder') {
                     currentNode = currentNode.children[part];
                } else {
                    return null;
                }
            } else {
                 currentNode = (currentNode as FileSystemTree)[part];
            }
             if (!currentNode) return null;
        }
        return (currentNode as any).type === 'file' ? (currentNode as any).content : null;
    }, [fileSystem]);


    const openFile = useCallback((path: string, name: string) => {
        if (openTabs.some(tab => tab.id === path)) {
            setActiveTabId(path);
            return;
        }
        const content = getFileContent(path);
        if (content !== null) {
            const newTab: EditorTab = { id: path, name, content, isDirty: false };
            setOpenTabs(prev => [...prev, newTab]);
            setActiveTabId(path);
        }
    }, [openTabs, getFileContent]);

    const closeTab = useCallback((tabId: string) => {
        // Clear any decorations associated with the closed tab
        if (editorDecorations.current[tabId]) {
            delete editorDecorations.current[tabId];
        }

        setOpenTabs(prev => {
            const newTabs = prev.filter(tab => tab.id !== tabId);
            if (activeTabId === tabId) {
                setActiveTabId(newTabs.length > 0 ? newTabs[newTabs.length - 1].id : null);
            }
            return newTabs;
        });
    }, [activeTabId]);

    const setActiveTab = useCallback((tabId: string) => {
        setActiveTabId(tabId);
    }, []);

    const updateTabContent = useCallback((tabId: string, content: string) => {
        // Clear decorations when content changes, as their positions become invalid
        if (editorRef.current && editorDecorations.current[tabId]) {
            editorRef.current.deltaDecorations(editorDecorations.current[tabId], []);
            editorDecorations.current[tabId] = [];
        }

        setOpenTabs(prev => prev.map(tab => {
            if (tab.id === tabId) {
                const originalContent = getFileContent(tabId) ?? '';
                return { ...tab, content, isDirty: content !== originalContent };
            }
            return tab;
        }));
    }, [getFileContent]);

    const saveFile = (path: string, content: string) => {
        setFileSystem(prevFs => {
            const newFs = JSON.parse(JSON.stringify(prevFs)); // Deep copy
            const parts = path.split('/').filter(p => p);
            let currentNode = newFs;
            for (let i = 0; i < parts.length - 1; i++) {
                currentNode = currentNode[parts[i]].children;
            }
            (currentNode[parts[parts.length - 1]] as any).content = content;
            return newFs;
        });
    }

    const saveActiveFile = useCallback(() => {
        const activeTab = openTabs.find(tab => tab.id === activeTabId);
        if (activeTab && activeTab.isDirty) {
            saveFile(activeTab.id, activeTab.content);
            setOpenTabs(prev => prev.map(tab => tab.id === activeTabId ? { ...tab, isDirty: false } : tab));

            if (!stagedChanges.has(activeTab.id)) {
                setUnstagedChanges(prev => new Set(prev).add(activeTab.id));
            }
        }
    }, [activeTabId, openTabs, stagedChanges]);
    
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if ((e.ctrlKey || e.metaKey) && e.key === 's') {
                e.preventDefault();
                saveActiveFile();
            }
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [saveActiveFile]);


    const handleSetTheme = useCallback((newTheme: Theme) => {
        setTheme(newTheme);
        const root = window.document.documentElement;
        if (newTheme === 'vs-dark') {
            root.classList.add('dark');
        } else {
            root.classList.remove('dark');
        }
    }, []);
    
    const handleSetActiveView = useCallback((view: ActiveView) => {
        if (view === activeView && isSidebarVisible) {
            setIsSidebarVisible(false);
        } else {
            setActiveView(view);
            setIsSidebarVisible(true);
        }
    }, [activeView, isSidebarVisible]);

    const toggleSidebar = useCallback(() => {
        setIsSidebarVisible(prev => !prev);
    }, []);

    const toggleTerminal = useCallback(() => {
        setIsTerminalOpen(prev => !prev);
    }, []);
    
    const toggleCommandPalette = useCallback(() => {
        setIsCommandPaletteOpen(prev => !prev);
    }, []);

    // Git functions
    const stageChange = useCallback((path: string) => {
        setUnstagedChanges(prev => {
            const newSet = new Set(prev);
            newSet.delete(path);
            return newSet;
        });
        setStagedChanges(prev => new Set(prev).add(path));
    }, []);

    const unstageChange = useCallback((path: string) => {
        setStagedChanges(prev => {
            const newSet = new Set(prev);
            newSet.delete(path);
            return newSet;
        });
        setUnstagedChanges(prev => new Set(prev).add(path));
    }, []);

    const stageAllChanges = useCallback(() => {
        setStagedChanges(prev => new Set([...prev, ...unstagedChanges]));
        setUnstagedChanges(new Set());
    }, [unstagedChanges]);

    const unstageAllChanges = useCallback(() => {
        setUnstagedChanges(prev => new Set([...prev, ...stagedChanges]));
        setStagedChanges(new Set());
    }, [stagedChanges]);

    const commit = useCallback(() => {
        if (stagedChanges.size > 0 && commitMessage.trim() !== '') {
            setStagedChanges(new Set());
            setCommitMessage('');
            alert('Changes committed!');
        } else {
            alert('Nothing to commit. Stage changes and enter a commit message.');
        }
    }, [stagedChanges, commitMessage]);
    
    const pushChanges = useCallback(() => {
        alert("Pushing changes... (mocked)");
    }, []);

    // AI Functions
    const sendChatMessage = useCallback(async (message: string) => {
        const activeTab = openTabs.find(tab => tab.id === activeTabId);
        const context = activeTab ? `\n\n--- Current File: ${activeTab.name} ---\n\n${activeTab.content}` : '';
        const fullMessage = message + context;

        const userMessage: ChatMessage = { role: 'user', parts: [{ text: message }] };
        setChatHistory(prev => [...prev, userMessage]);
        setIsAiLoading(true);

        try {
            const chat = ai.chats.create({
                model: 'gemini-2.5-flash',
                config: {
                    systemInstruction: 'You are an expert AI programmer acting as a helpful assistant in a code editor. Your responses must be concise, direct, and use natural language. When explaining code, be brief and clear. Avoid conversational filler or any unnecessary text.'
                }
            });
            const response = await chat.sendMessageStream({ message: fullMessage });

            let modelResponse = '';
            setChatHistory(prev => [...prev, { role: 'model', parts: [{ text: '' }], isLoading: true }]);

            for await (const chunk of response) {
                modelResponse += chunk.text;
                setChatHistory(prev => {
                    const newHistory = [...prev];
                    const lastMessage = newHistory[newHistory.length - 1];
                    if (lastMessage.role === 'model') {
                        lastMessage.parts = [{ text: modelResponse }];
                    }
                    return newHistory;
                });
            }
             setChatHistory(prev => {
                const newHistory = [...prev];
                const lastMessage = newHistory[newHistory.length - 1];
                if (lastMessage.role === 'model') {
                    lastMessage.isLoading = false;
                }
                return newHistory;
            });

        } catch (error) {
            console.error(error);
            const errorMessage: ChatMessage = { role: 'model', parts: [{ text: `Error: ${error instanceof Error ? error.message : String(error)}` }]};
            setChatHistory(prev => [...prev.slice(0, -1), errorMessage]);
        } finally {
            setIsAiLoading(false);
        }

    }, [activeTabId, openTabs]);
    
    const generateCommitMessage = useCallback(async () => {
        if (stagedChanges.size === 0) {
            alert('No staged changes to create a commit message from.');
            return;
        }
        setIsAiLoading(true);
        setCommitMessage("Generating commit message...");

        try {
            let diff = '';
            for (const path of stagedChanges) {
                const originalContent = getFileContent(path, INITIAL_FILE_SYSTEM) ?? '';
                const newContent = getFileContent(path, fileSystem) ?? '';
                diff += `--- a/${path}\n+++ b/${path}\n${generateDiff(originalContent, newContent)}\n`;
            }

            const prompt = `Based on the following diff, generate a concise, conventional commit message.`;
            
            const response = await ai.models.generateContent({ model: 'gemini-2.5-flash', contents: prompt });
            setCommitMessage(response.text.trim());

        } catch (error) {
            console.error(error);
            setCommitMessage("Error generating message.");
        } finally {
            setIsAiLoading(false);
        }
    }, [stagedChanges, fileSystem, getFileContent]);

    const runAiCodeCommand = useCallback(async (command: 'explain' | 'refactor' | 'add-comments') => {
        if (!editorRef.current) return;
    
        const editor = editorRef.current;
        const selection = editor.getSelection();
        if (!selection || selection.isEmpty()) {
            alert("Please select some code to run the AI command on.");
            return;
        }
        const selectedText = editor.getModel().getValueInRange(selection);
    
        const activeTab = openTabs.find(tab => tab.id === activeTabId);
        if (!activeTab) return;

        let prompt = '';
        switch (command) {
            case 'explain':
                setIsAiLoading(true);
                try {
                    prompt = `Explain the following code in a single, concise paragraph. The explanation will be used in a tooltip. Do not include any titles, markdown formatting, or conversational filler. Output only the explanation text itself.\n\nCode:\n${selectedText}`;
                    const response = await ai.models.generateContent({ model: 'gemini-2.5-flash', contents: prompt });
                    const explanation = response.text.trim();

                    const newDecorationIds = editor.deltaDecorations([], [{
                        range: selection,
                        options: {
                            isWholeLine: true,
                            className: 'dark:bg-sky-900/50 bg-sky-200/50',
                            hoverMessage: { 
                                value: explanation
                            },
                            glyphMarginClassName: 'explained-code-glyph',
                            glyphMarginHoverMessage: { value: 'AI Explanation Available' }
                        },
                    }]);
                    
                    const currentDecorations = editorDecorations.current[activeTab.id] || [];
                    editorDecorations.current[activeTab.id] = [...currentDecorations, ...newDecorationIds];

                } catch (error) {
                    console.error(error);
                    alert(`An error occurred: ${error instanceof Error ? error.message : String(error)}`);
                } finally {
                    setIsAiLoading(false);
                }
                return;
            case 'refactor':
                prompt = `Refactor the following code to improve its clarity, efficiency, and adherence to best practices. Only output the refactored code, without any explanations or markdown formatting.\n\n\`\`\`\n${selectedText}\n\`\`\``;
                break;
            case 'add-comments':
                prompt = `Add clear and concise comments to the following code. Only output the commented code, without any explanations or markdown formatting.\n\n\`\`\`\n${selectedText}\n\`\`\``;
                break;
        }
    
        setIsAiLoading(true);
        try {
            const response = await ai.models.generateContent({ model: 'gemini-2.5-flash', contents: prompt });
            let newCode = response.text.trim();
            
            newCode = newCode.replace(/^```(?:\w+\n)?/, '').replace(/```$/, '').trim();

            editor.executeEdits('ai-plugin', [{
                range: selection,
                text: newCode,
            }]);
        } catch (error) {
            console.error(error);
            alert(`An error occurred: ${error instanceof Error ? error.message : String(error)}`);
        } finally {
            setIsAiLoading(false);
        }
    }, [activeTabId, openTabs, sendChatMessage, setActiveView]);


    const generateDiff = (original: string, modified: string) => {
        // This is a very basic diff generator for demonstration purposes.
        const originalLines = original.split('\n');
        const modifiedLines = modified.split('\n');
        let diff = '';
        let i = 0, j = 0;
        while (i < originalLines.length || j < modifiedLines.length) {
            if (i < originalLines.length && j < modifiedLines.length && originalLines[i] === modifiedLines[j]) {
                diff += ` ${originalLines[i]}\n`;
                i++; j++;
            } else {
                if (i < originalLines.length) {
                    diff += `-${originalLines[i]}\n`;
                    i++;
                }
                if (j < modifiedLines.length) {
                    diff += `+${modifiedLines[j]}\n`;
                    j++;
                }
            }
        }
        return diff;
    }

    return (
        <AppContext.Provider value={{
            fileSystem,
            setFileSystem,
            openTabs,
            activeTabId,
            theme,
            activeView,
            isSidebarVisible,
            isTerminalOpen,
            isCommandPaletteOpen,
            cursorPosition,
            unstagedChanges,
            stagedChanges,
            commitMessage,
            chatHistory,
            isAiLoading,
            editorRef,
            openFile,
            closeTab,
            setActiveTab,
            updateTabContent,
            saveActiveFile,
            setTheme: handleSetTheme,
            setActiveView: handleSetActiveView,
            toggleSidebar,
            toggleTerminal,
            toggleCommandPalette,
            setCursorPosition,
            stageChange,
            unstageChange,
            stageAllChanges,
            unstageAllChanges,
            commit,
            pushChanges,
            setCommitMessage,
            sendChatMessage,
            generateCommitMessage,
            runAiCodeCommand,
        }}>
            {children}
        </AppContext.Provider>
    );
};