import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useAppContext } from '../hooks/useAppContext';
import { Command } from '../types';

const CommandPalette: React.FC = () => {
    const { 
        setTheme, 
        runAiCodeCommand,
        isCommandPaletteOpen,
        toggleCommandPalette
    } = useAppContext();
    const [search, setSearch] = useState('');
    const [selectedIndex, setSelectedIndex] = useState(0);
    
    const commands: Command[] = useMemo(() => [
        { id: 'theme.dark', label: 'Change Color Theme to Dark', action: () => setTheme('vs-dark') },
        { id: 'theme.light', label: 'Change Color Theme to Light', action: () => setTheme('vs-light') },
        { id: 'ai.explain', label: 'AI: Explain Code', action: () => runAiCodeCommand('explain') },
        { id: 'ai.refactor', label: 'AI: Refactor Code', action: () => runAiCodeCommand('refactor') },
        { id: 'ai.add-comments', label: 'AI: Add Comments', action: () => runAiCodeCommand('add-comments') },
    ], [setTheme, runAiCodeCommand]);

    const filteredCommands = useMemo(() => 
        commands.filter(cmd => cmd.label.toLowerCase().includes(search.toLowerCase()))
    , [commands, search]);

    const handleKeyDown = useCallback((e: KeyboardEvent) => {
        if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key.toLowerCase() === 'p') {
            e.preventDefault();
            toggleCommandPalette();
        }
        if (isCommandPaletteOpen) {
            if (e.key === 'Escape') {
                toggleCommandPalette();
            } else if (e.key === 'ArrowDown') {
                e.preventDefault();
                setSelectedIndex(prev => (prev + 1) % filteredCommands.length);
            } else if (e.key === 'ArrowUp') {
                e.preventDefault();
                setSelectedIndex(prev => (prev - 1 + filteredCommands.length) % filteredCommands.length);
            } else if (e.key === 'Enter') {
                e.preventDefault();
                if(filteredCommands[selectedIndex]){
                    filteredCommands[selectedIndex].action();
                    toggleCommandPalette();
                }
            }
        }
    }, [isCommandPaletteOpen, filteredCommands, selectedIndex, toggleCommandPalette]);

    useEffect(() => {
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [handleKeyDown]);
    
    useEffect(() => {
        if(!isCommandPaletteOpen) {
            setSearch('');
            setSelectedIndex(0);
        } else {
            // Reset selection when search changes
            setSelectedIndex(0);
        }
    }, [isCommandPaletteOpen, search]);

    if (!isCommandPaletteOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/50 flex justify-center pt-20 z-50" onClick={toggleCommandPalette}>
            <div className="w-full max-w-xl bg-vscode-light-sidebar dark:bg-vscode-sidebar rounded-lg shadow-2xl flex flex-col h-min max-h-[50vh]" onClick={e => e.stopPropagation()}>
                <input
                    type="text"
                    autoFocus
                    value={search}
                    onChange={e => setSearch(e.target.value)}
                    placeholder="Type a command"
                    className="p-3 bg-transparent border-b border-vscode-light-border dark:border-vscode-border focus:outline-none focus:ring-1 focus:ring-vscode-statusbar"
                />
                <ul className="flex-1 overflow-y-auto">
                    {filteredCommands.map((cmd, index) => (
                        <li
                            key={cmd.id}
                            onClick={() => {
                                cmd.action();
                                toggleCommandPalette();
                            }}
                            className={`p-3 cursor-pointer ${
                                index === selectedIndex ? 'bg-vscode-statusbar/80 text-white' : 'hover:bg-vscode-statusbar/30'
                            }`}
                        >
                            {cmd.label}
                        </li>
                    ))}
                    {filteredCommands.length === 0 && <li className="p-3 text-center text-vscode-light-text-secondary dark:text-vscode-text-secondary">No commands found</li>}
                </ul>
            </div>
        </div>
    );
};

export default CommandPalette;
