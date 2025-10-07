import React, { useState, useRef, useEffect } from 'react';
import { useAppContext } from '../hooks/useAppContext';
import { SparkleIcon } from './icons';

const MarkdownRenderer: React.FC<{ content: string }> = ({ content }) => {
    // Split the content by code blocks, keeping the delimiters
    const parts = content.split(/(```[\s\S]*?```)/g);

    return (
        <div className="text-sm">
            {parts.map((part, index) => {
                if (part.startsWith('```') && part.endsWith('```')) {
                    // It's a code block
                    const codeBlock = part.slice(3, -3);
                    const firstLineEnd = codeBlock.indexOf('\n');
                    // Language is optional, code is the rest
                    const code = codeBlock.substring(firstLineEnd + 1).trim();
                    
                    return (
                        <pre key={index} className="bg-vscode-bg dark:bg-vscode-bg p-2 rounded-md my-2 overflow-x-auto text-white">
                            <code>{code}</code>
                        </pre>
                    );
                } else if (part.trim()) {
                    // It's a regular text part
                    return <p key={index} className="whitespace-pre-wrap my-1">{part}</p>;
                }
                return null;
            })}
        </div>
    );
};


const AiAssistantView: React.FC = () => {
    const { chatHistory, sendChatMessage, isAiLoading, activeTabId, openTabs } = useAppContext();
    const [input, setInput] = useState('');
    const chatContainerRef = useRef<HTMLDivElement>(null);

    const activeTab = openTabs.find(tab => tab.id === activeTabId);

    useEffect(() => {
        if (chatContainerRef.current) {
            chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
        }
    }, [chatHistory]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (input.trim() && !isAiLoading) {
            sendChatMessage(input);
            setInput('');
        }
    };

    return (
        <div className="flex flex-col h-full p-2">
            <div ref={chatContainerRef} className="flex-1 overflow-y-auto space-y-4 pr-2">
                {chatHistory.map((msg, index) => (
                    <div key={index} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                        <div
                            className={`p-2 rounded-lg max-w-xs md:max-w-sm lg:max-w-md ${
                                msg.role === 'user'
                                    ? 'bg-vscode-statusbar text-white'
                                    : 'bg-vscode-light-tab-inactive dark:bg-vscode-tab-inactive'
                            }`}
                        >
                            <MarkdownRenderer content={msg.parts[0].text} />
                             {msg.isLoading && <div className="dot-flashing"></div>}
                        </div>
                    </div>
                ))}
                {chatHistory.length === 0 && (
                    <div className="text-center text-sm text-vscode-text-secondary mt-8">
                        <SparkleIcon className="w-10 h-10 mx-auto mb-2" />
                        <p>Welcome to the AI Assistant!</p>
                        <p>Ask a question about your code or general programming topics.</p>
                        {activeTab && <p className="mt-4 text-xs">Context from <strong>{activeTab.name}</strong> will be included.</p>}
                    </div>
                )}
            </div>
             <style>{`
                .dot-flashing {
                    position: relative;
                    width: 5px; height: 5px;
                    border-radius: 5px;
                    background-color: #9880ff;
                    color: #9880ff;
                    animation: dotFlashing 1s infinite linear alternate;
                    animation-delay: .5s;
                    display: inline-block;
                    margin-left: 5px;
                }
                .dot-flashing::before, .dot-flashing::after {
                    content: '';
                    display: inline-block;
                    position: absolute;
                    top: 0;
                }
                .dot-flashing::before {
                    left: -10px;
                    width: 5px; height: 5px;
                    border-radius: 5px;
                    background-color: #9880ff;
                    color: #9880ff;
                    animation: dotFlashing 1s infinite alternate;
                    animation-delay: 0s;
                }
                .dot-flashing::after {
                    left: 10px;
                    width: 5px; height: 5px;
                    border-radius: 5px;
                    background-color: #9880ff;
                    color: #9880ff;
                    animation: dotFlashing 1s infinite alternate;
                    animation-delay: 1s;
                }
                @keyframes dotFlashing {
                    0% { background-color: #9880ff; }
                    50%, 100% { background-color: rgba(152, 128, 255, 0.2); }
                }
            `}</style>
            <form onSubmit={handleSubmit} className="mt-2 flex">
                <input
                    type="text"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    placeholder="Ask a question..."
                    disabled={isAiLoading}
                    className="flex-1 p-2 text-sm rounded-l-md bg-vscode-light-tab-active dark:bg-vscode-bg border border-vscode-light-border dark:border-vscode-border focus:outline-none focus:ring-1 focus:ring-vscode-statusbar"
                />
                <button
                    type="submit"
                    disabled={isAiLoading || !input.trim()}
                    className="p-2 bg-vscode-statusbar text-white rounded-r-md disabled:opacity-50 hover:bg-opacity-80"
                >
                    Send
                </button>
            </form>
        </div>
    );
};

export default AiAssistantView;