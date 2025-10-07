import React, { useState } from 'react';

interface ApiKeyModalProps {
    onSave: (apiKey: string) => void;
}

const ApiKeyModal: React.FC<ApiKeyModalProps> = ({ onSave }) => {
    const [key, setKey] = useState('');

    const handleSave = () => {
        if (key.trim()) {
            onSave(key.trim());
        }
    };

    return (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
            <div className="bg-vscode-sidebar p-6 rounded-lg shadow-xl w-full max-w-md">
                <h2 className="text-xl font-semibold mb-4 text-vscode-text">Enter Gemini API Key</h2>
                <p className="text-sm text-vscode-text-secondary mb-4">
                    To use AI features, please provide your Google AI API key. Your key will be stored securely in your browser's local storage.
                </p>
                <input
                    type="password"
                    value={key}
                    onChange={(e) => setKey(e.target.value)}
                    placeholder="Your API Key"
                    className="w-full p-2 rounded bg-vscode-bg border border-vscode-border focus:outline-none focus:ring-2 focus:ring-vscode-statusbar"
                />
                <button
                    onClick={handleSave}
                    className="w-full mt-4 p-2 bg-vscode-statusbar text-white rounded hover:bg-opacity-80 disabled:opacity-50"
                    disabled={!key.trim()}
                >
                    Save and Continue
                </button>
            </div>
        </div>
    );
};

export default ApiKeyModal;
