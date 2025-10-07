
import React, { useEffect, useRef, useState, useCallback } from 'react';
import { useAppContext } from '../hooks/useAppContext';
import { FileSystemNode } from '../types';
import { CloseIcon } from './icons';

// Since we are using CDN, we declare these on the window object for TypeScript
declare global {
    interface Window {
        Terminal: any;
        FitAddon: any;
    }
}

const TerminalPanel: React.FC = () => {
    const { fileSystem, openFile, toggleTerminal, theme } = useAppContext();
    const terminalRef = useRef<HTMLDivElement>(null);
    const term = useRef<any>(null);
    const fitAddon = useRef<any>(null);
    const currentCommand = useRef('');

    const [panelHeight, setPanelHeight] = useState(200);
    const [isResizing, setIsResizing] = useState(false);

    const prompt = '\r\n\x1b[1;34muser@vscode-web\x1b[0m:\x1b[1;32m~$\x1b[0m ';

    const handleResize = useCallback((e: MouseEvent) => {
        if (isResizing) {
            const newHeight = window.innerHeight - e.clientY;
            if (newHeight > 50 && newHeight < window.innerHeight - 100) {
                setPanelHeight(newHeight);
            }
        }
    }, [isResizing]);
    
    const stopResizing = useCallback(() => {
        setIsResizing(false);
        window.removeEventListener('mousemove', handleResize);
        window.removeEventListener('mouseup', stopResizing);
        document.body.style.userSelect = '';
        document.body.style.cursor = '';
    }, [handleResize]);

    useEffect(() => {
        if (isResizing) {
            window.addEventListener('mousemove', handleResize);
            window.addEventListener('mouseup', stopResizing);
            document.body.style.userSelect = 'none';
            document.body.style.cursor = 'row-resize';
        }
        return () => {
            window.removeEventListener('mousemove', handleResize);
            window.removeEventListener('mouseup', stopResizing);
        };
    }, [isResizing, handleResize, stopResizing]);
    
    useEffect(() => {
        if(fitAddon.current) {
            fitAddon.current.fit();
        }
    }, [panelHeight]);

    const executeCommand = (command: string) => {
        const [cmd, ...args] = command.trim().split(' ').filter(Boolean);

        const findNode = (path: string): FileSystemNode | null => {
            const parts = path.split('/').filter(p => p);
            let currentNode: any = fileSystem;
            for (const part of parts) {
                if (currentNode && currentNode.type === 'folder') {
                    currentNode = currentNode.children[part];
                } else if(currentNode && currentNode[part]){
                    currentNode = currentNode[part];
                } else {
                    return null;
                }
            }
            return currentNode;
        };

        switch (cmd) {
            case 'help':
                term.current.writeln('Available commands:');
                term.current.writeln('  \x1b[1;32mls [path]\x1b[0m   - List directory contents');
                term.current.writeln('  \x1b[1;32mcat [file]\x1b[0m   - Display file content');
                term.current.writeln('  \x1b[1;32mcode [file]\x1b[0m  - Open file in editor');
                term.current.writeln('  \x1b[1;32mecho [text]\x1b[0m  - Display a line of text');
                term.current.writeln('  \x1b[1;32mclear\x1b[0m        - Clear the terminal screen');
                term.current.writeln('  \x1b[1;32mexit\x1b[0m         - Close the terminal');
                break;
            case 'ls': {
                const targetPath = args[0] || '';
                const node = targetPath ? findNode(targetPath) : fileSystem;
                
                if (!node) {
                    term.current.writeln(`ls: cannot access '${targetPath}': No such file or directory`);
                    break;
                }

                let listable: { [key: string]: FileSystemNode };

                if ('type' in node && node.type) { 
                    if (node.type === 'folder') {
                        listable = node.children;
                    } else { 
                        term.current.writeln(targetPath);
                        break;
                    }
                } else { 
                    listable = node as any;
                }
                
                const output = Object.keys(listable).map(key => {
                    const child = listable[key as keyof typeof listable];
                    return child.type === 'folder' ? `\x1b[1;34m${key}/\x1b[0m` : key;
                }).join('  ');

                term.current.writeln(output);
                break;
            }
            case 'cat':
                if (args.length === 0) {
                    term.current.writeln('usage: cat [file]');
                    break;
                }
                const fileNode = findNode(args[0]);
                if (fileNode && fileNode.type === 'file') {
                    term.current.write(fileNode.content.replace(/\n/g, '\r\n'));
                } else {
                    term.current.writeln(`cat: ${args[0]}: No such file or directory`);
                }
                break;
            case 'code':
                if (args.length === 0) {
                    term.current.writeln('usage: code [file]');
                    break;
                }
                const fileToOpen = findNode(args[0]);
                if (fileToOpen && fileToOpen.type === 'file') {
                     openFile(args[0], args[0].split('/').pop() || args[0]);
                     term.current.writeln(`Opening ${args[0]}...`);
                } else {
                     term.current.writeln(`code: ${args[0]}: No such file or directory`);
                }
                break;
            case 'echo':
                term.current.writeln(args.join(' '));
                break;
            case 'clear':
                term.current.clear();
                break;
            case 'exit':
                toggleTerminal();
                break;
            case undefined:
                 break;
            default:
                term.current.writeln(`command not found: ${cmd}`);
        }
    };
    
    useEffect(() => {
        if (terminalRef.current && !term.current) {
            const xterm = new window.Terminal({
                cursorBlink: true,
                fontSize: 14,
                fontFamily: 'Menlo, "DejaVu Sans Mono", Consolas, "Lucida Console", monospace',
                theme: theme === 'vs-dark' ? {
                    background: '#1e1e1e',
                    foreground: '#cccccc',
                    cursor: '#cccccc',
                } : {
                    background: '#ffffff',
                    foreground: '#333333',
                    cursor: '#333333',
                }
            });
            const xtermFitAddon = new window.FitAddon.FitAddon();
            fitAddon.current = xtermFitAddon;
            xterm.loadAddon(xtermFitAddon);
            xterm.open(terminalRef.current);
            xtermFitAddon.fit();
            
            xterm.write('Welcome to the VS Code Web Terminal!');
            xterm.write(prompt);

            xterm.onKey(({ key, domEvent }: { key: string; domEvent: KeyboardEvent }) => {
                const printable = !domEvent.altKey && !domEvent.ctrlKey && !domEvent.metaKey;

                if (domEvent.key === 'Enter') {
                    xterm.write('\r\n');
                    executeCommand(currentCommand.current);
                    currentCommand.current = '';
                    xterm.write(prompt);
                } else if (domEvent.key === 'Backspace') {
                    if (currentCommand.current.length > 0) {
                        xterm.write('\b \b');
                        currentCommand.current = currentCommand.current.slice(0, -1);
                    }
                } else if (printable && domEvent.key.length === 1) {
                    xterm.write(key);
                    currentCommand.current += key;
                }
            });
            term.current = xterm;
        }
        
    }, []);

    return (
        <div
            className="w-full bg-vscode-light-bg dark:bg-vscode-bg flex flex-col z-10"
            style={{ height: `${panelHeight}px` }}
        >
            <div
                className="w-full h-1 bg-vscode-light-border dark:bg-vscode-border cursor-row-resize hover:bg-vscode-statusbar"
                onMouseDown={() => setIsResizing(true)}
            />
            <div className="flex items-center px-4 h-8 border-y border-vscode-light-border dark:border-vscode-border bg-vscode-light-tab-inactive dark:bg-vscode-tab-inactive">
                <span className="text-sm">TERMINAL</span>
                <div className="flex-1" />
                <button onClick={toggleTerminal} className="p-1 rounded hover:bg-gray-500/30">
                    <CloseIcon className="w-4 h-4" />
                </button>
            </div>
            <div ref={terminalRef} className="w-full flex-1 p-2 overflow-hidden" />
        </div>
    );
};

export default TerminalPanel;
