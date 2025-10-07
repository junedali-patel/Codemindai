import React, { useState } from 'react';
import { useAppContext } from '../hooks/useAppContext';
import { CheckIcon, PlusIcon, MinusIcon, ChevronDownIcon, ChevronRightIcon, FileIcon, SparkleIcon } from './icons';

interface ChangeListItemProps {
    path: string;
    onStage?: () => void;
    onUnstage?: () => void;
}

const ChangeListItem: React.FC<ChangeListItemProps> = ({ path, onStage, onUnstage }) => {
    const fileName = path.split('/').pop() || path;
    const { openFile } = useAppContext();

    return (
        <div className="group flex items-center justify-between px-2 py-1 cursor-pointer hover:bg-gray-500/20" onClick={() => openFile(path, fileName)}>
            <div className="flex items-center">
                <FileIcon className="w-4 h-4 mr-2 text-yellow-400 flex-shrink-0" />
                <span className="text-sm truncate">{fileName}</span>
            </div>
            <div className="flex items-center opacity-0 group-hover:opacity-100 transition-opacity">
                {onStage && (
                    <button onClick={(e) => { e.stopPropagation(); onStage(); }} className="p-1 rounded hover:bg-gray-500/30" aria-label="Stage change">
                        <PlusIcon className="w-4 h-4" />
                    </button>
                )}
                {onUnstage && (
                    <button onClick={(e) => { e.stopPropagation(); onUnstage(); }} className="p-1 rounded hover:bg-gray-500/30" aria-label="Unstage change">
                        <MinusIcon className="w-4 h-4" />
                    </button>
                )}
            </div>
        </div>
    )
}

const SourceControlView: React.FC = () => {
    const { 
        commitMessage, setCommitMessage, commit, generateCommitMessage,
        stagedChanges, unstagedChanges,
        stageChange, unstageChange, stageAllChanges, unstageAllChanges 
    } = useAppContext();

    const [isStagedOpen, setIsStagedOpen] = useState(true);
    const [isChangesOpen, setIsChangesOpen] = useState(true);

    const unstagedArray = [...unstagedChanges];
    const stagedArray = [...stagedChanges];

    return (
        <div className="p-2 text-sm">
            <div className="mb-2 p-2 border rounded-md border-vscode-light-border dark:border-vscode-border relative">
                 <button 
                    onClick={generateCommitMessage}
                    disabled={stagedArray.length === 0}
                    className="absolute top-1 right-1 p-1 rounded-md disabled:opacity-50 hover:bg-gray-500/20"
                    aria-label="Generate commit message"
                 >
                    <SparkleIcon className="w-4 h-4" />
                </button>
                <textarea
                    value={commitMessage}
                    onChange={e => setCommitMessage(e.target.value)}
                    placeholder="Message"
                    className="w-full bg-transparent focus:outline-none resize-none text-sm h-16"
                />
                <div className="flex items-center justify-between mt-1">
                     <button 
                        onClick={commit}
                        disabled={stagedArray.length === 0 || !commitMessage.trim()}
                        className="flex items-center space-x-1 px-3 py-1 bg-vscode-statusbar text-white rounded-md text-sm disabled:opacity-50 hover:bg-opacity-80"
                     >
                        <CheckIcon className="w-4 h-4" />
                        <span>Commit</span>
                    </button>
                </div>
            </div>

            {stagedArray.length > 0 && (
                <div className="mb-2">
                    <div className="group flex items-center justify-between cursor-pointer py-1" onClick={() => setIsStagedOpen(!isStagedOpen)}>
                        <div className="flex items-center">
                            {isStagedOpen ? <ChevronDownIcon className="w-4 h-4 mr-1" /> : <ChevronRightIcon className="w-4 h-4 mr-1" />}
                            <h3 className="font-bold text-xs uppercase tracking-wide">Staged Changes</h3>
                            <span className="ml-2 bg-gray-500/50 text-xs rounded-full px-2">{stagedArray.length}</span>
                        </div>
                         <button onClick={(e) => { e.stopPropagation(); unstageAllChanges(); }} className="p-1 rounded opacity-0 group-hover:opacity-100 hover:bg-gray-500/30" aria-label="Unstage all changes">
                            <MinusIcon className="w-4 h-4" />
                        </button>
                    </div>
                    {isStagedOpen && (
                        <div>
                            {stagedArray.map(path => (
                                <ChangeListItem key={path} path={path} onUnstage={() => unstageChange(path)} />
                            ))}
                        </div>
                    )}
                </div>
            )}
            
            {unstagedArray.length > 0 && (
                <div>
                    <div className="group flex items-center justify-between cursor-pointer py-1" onClick={() => setIsChangesOpen(!isChangesOpen)}>
                         <div className="flex items-center">
                            {isChangesOpen ? <ChevronDownIcon className="w-4 h-4 mr-1" /> : <ChevronRightIcon className="w-4 h-4 mr-1" />}
                            <h3 className="font-bold text-xs uppercase tracking-wide">Changes</h3>
                            <span className="ml-2 bg-gray-500/50 text-xs rounded-full px-2">{unstagedArray.length}</span>
                        </div>
                        <button onClick={(e) => { e.stopPropagation(); stageAllChanges(); }} className="p-1 rounded opacity-0 group-hover:opacity-100 hover:bg-gray-500/30" aria-label="Stage all changes">
                            <PlusIcon className="w-4 h-4" />
                        </button>
                    </div>
                    {isChangesOpen && (
                         <div>
                            {unstagedArray.map(path => (
                                <ChangeListItem key={path} path={path} onStage={() => stageChange(path)} />
                            ))}
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default SourceControlView;