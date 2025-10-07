
import React, { useState, useRef, useEffect } from 'react';
import { useAppContext } from '../hooks/useAppContext';
import { FileSystemNode, FileSystemTree } from '../types';
import { FileIcon, FolderIcon, ChevronDownIcon, ChevronRightIcon, PlusIcon, TrashIcon, PencilIcon, EllipsisVerticalIcon } from './icons';

interface FileTreeItemProps {
    name: string;
    node: FileSystemNode;
    path: string;
    depth: number;
}

const FileTreeItem: React.FC<FileTreeItemProps> = ({ name, node, path, depth }) => {
    const { 
        openFile, 
        activeTabId, 
        createFile, 
        createFolder, 
        renameFile, 
        deleteNode,
        saveFile
    } = useAppContext();
    
    const [isOpen, setIsOpen] = useState(true);
    const [isRenaming, setIsRenaming] = useState(false);
    const [newName, setNewName] = useState(name);
    const [showContextMenu, setShowContextMenu] = useState(false);
    const [contextMenuPos, setContextMenuPos] = useState({ x: 0, y: 0 });
    const [showAddMenu, setShowAddMenu] = useState(false);
    const contextMenuRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLInputElement>(null);

    const isFile = node.type === 'file';
    const isFolder = node.type === 'folder';
    const isActive = activeTabId === path;

    const handleToggle = (e: React.MouseEvent) => {
        e.stopPropagation();
        if (isFolder) {
            setIsOpen(!isOpen);
        }
    };

    const handleClick = (e: React.MouseEvent) => {
        e.stopPropagation();
        if (isRenaming) return;
        
        if (isFile) {
            openFile(path, name);
        } else {
            handleToggle(e);
        }
    };

    const handleContextMenu = (e: React.MouseEvent) => {
        e.preventDefault();
        setContextMenuPos({ x: e.clientX, y: e.clientY });
        setShowContextMenu(true);
    };

    const handleRename = () => {
        setIsRenaming(true);
        setShowContextMenu(false);
    };

    const handleRenameSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (newName && newName !== name) {
            renameFile(path, newName);
        }
        setIsRenaming(false);
    };

    const handleDelete = () => {
        if (window.confirm(`Are you sure you want to delete ${isFile ? 'file' : 'folder'} ${name}?`)) {
            deleteNode(path);
        }
        setShowContextMenu(false);
    };

    const handleNewFile = () => {
        const fileName = prompt('Enter file name:');
        if (fileName) {
            createFile(`${path}/${fileName}`);
        }
        setShowAddMenu(false);
    };

    const handleNewFolder = () => {
        const folderName = prompt('Enter folder name:');
        if (folderName) {
            createFolder(`${path}/${folderName}`);
        }
        setShowAddMenu(false);
    };

    useEffect(() => {
        if (isRenaming && inputRef.current) {
            inputRef.current.focus();
            inputRef.current.select();
        }
    }, [isRenaming]);

    useEffect(() => {
        const handleClickOutside = (e: MouseEvent) => {
            if (contextMenuRef.current && !contextMenuRef.current.contains(e.target as Node)) {
                setShowContextMenu(false);
                setShowAddMenu(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    return (
        <div className="relative" onContextMenu={handleContextMenu}>
            <div
                onClick={handleClick}
                onDoubleClick={isFile ? () => openFile(path, name) : undefined}
                className={`group flex items-center justify-between cursor-pointer py-1 pr-2 text-sm hover:bg-gray-500/20 ${
                    isActive ? 'bg-vscode-statusbar/30' : ''
                }`}
                style={{ paddingLeft: `${depth * 12 + 8}px` }}
            >
                <div className="flex items-center flex-1 min-w-0">
                    <span onClick={handleToggle} className="flex-shrink-0">
                        {isFolder ? (
                            isOpen ? (
                                <ChevronDownIcon className="w-4 h-4 mr-1" />
                            ) : (
                                <ChevronRightIcon className="w-4 h-4 mr-1" />
                            )
                        ) : (
                            <div className="w-4 mr-1"></div>
                        )}
                    </span>
                    {isFolder ? (
                        <FolderIcon className="w-4 h-4 mr-2 text-blue-400 flex-shrink-0" />
                    ) : (
                        <FileIcon className="w-4 h-4 mr-2 text-yellow-400 flex-shrink-0" />
                    )}
                    
                    {isRenaming ? (
                        <form onSubmit={handleRenameSubmit} className="flex-1">
                            <input
                                ref={inputRef}
                                type="text"
                                value={newName}
                                onChange={(e) => setNewName(e.target.value)}
                                onBlur={() => setIsRenaming(false)}
                                className="w-full bg-gray-700 text-white border border-blue-500 rounded px-1"
                                onClick={(e) => e.stopPropagation()}
                            />
                        </form>
                    ) : (
                        <span className="truncate">{name}</span>
                    )}
                </div>
                
                {!isRenaming && (
                    <div className="opacity-0 group-hover:opacity-100 flex items-center space-x-1">
                        {isFolder && (
                            <button 
                                onClick={(e) => {
                                    e.stopPropagation();
                                    setShowAddMenu(!showAddMenu);
                                }}
                                className="p-0.5 rounded hover:bg-gray-600"
                                title="Add file or folder"
                            >
                                <PlusIcon className="w-3 h-3" />
                            </button>
                        )}
                        <button 
                            onClick={(e) => {
                                e.stopPropagation();
                                handleRename();
                            }}
                            className="p-0.5 rounded hover:bg-gray-600"
                            title="Rename"
                        >
                            <PencilIcon className="w-3 h-3" />
                        </button>
                        <button 
                            onClick={(e) => {
                                e.stopPropagation();
                                handleDelete();
                            }}
                            className="p-0.5 rounded hover:bg-gray-600"
                            title="Delete"
                        >
                            <TrashIcon className="w-3 h-3" />
                        </button>
                    </div>
                )}
            </div>
            
            {showAddMenu && isFolder && (
                <div 
                    ref={contextMenuRef}
                    className="absolute z-10 bg-gray-800 border border-gray-600 rounded shadow-lg py-1 w-48"
                    style={{
                        left: '100%',
                        top: '0',
                        marginLeft: '4px'
                    }}
                    onClick={(e) => e.stopPropagation()}
                >
                    <div 
                        className="px-4 py-2 text-sm hover:bg-gray-700 cursor-pointer flex items-center"
                        onClick={handleNewFile}
                    >
                        <FileIcon className="w-3 h-3 mr-2 text-blue-400" />
                        New File
                    </div>
                    <div 
                        className="px-4 py-2 text-sm hover:bg-gray-700 cursor-pointer flex items-center"
                        onClick={handleNewFolder}
                    >
                        <FolderIcon className="w-3 h-3 mr-2 text-blue-400" />
                        New Folder
                    </div>
                </div>
            )}
            
            {showContextMenu && (
                <div 
                    ref={contextMenuRef}
                    className="fixed z-50 bg-gray-800 border border-gray-600 rounded shadow-lg py-1 w-48"
                    style={{
                        left: `${contextMenuPos.x}px`,
                        top: `${contextMenuPos.y}px`
                    }}
                    onClick={(e) => e.stopPropagation()}
                >
                    {isFile && (
                        <>
                            <div 
                                className="px-4 py-2 text-sm hover:bg-gray-700 cursor-pointer"
                                onClick={() => {
                                    saveFile(path, getFileContent(path) || '');
                                    setShowContextMenu(false);
                                }}
                            >
                                Save
                            </div>
                            <div className="border-t border-gray-600 my-1"></div>
                        </>
                    )}
                    <div 
                        className="px-4 py-2 text-sm hover:bg-gray-700 cursor-pointer"
                        onClick={handleRename}
                    >
                        Rename
                    </div>
                    {isFolder && (
                        <>
                            <div 
                                className="px-4 py-2 text-sm hover:bg-gray-700 cursor-pointer"
                                onClick={() => {
                                    setShowAddMenu(false);
                                    handleNewFile();
                                    setShowContextMenu(false);
                                }}
                            >
                                New File
                            </div>
                            <div 
                                className="px-4 py-2 text-sm hover:bg-gray-700 cursor-pointer"
                                onClick={() => {
                                    setShowAddMenu(false);
                                    handleNewFolder();
                                    setShowContextMenu(false);
                                }}
                            >
                                New Folder
                            </div>
                        </>
                    )}
                    <div className="border-t border-gray-600 my-1"></div>
                    <div 
                        className="px-4 py-2 text-sm text-red-400 hover:bg-gray-700 cursor-pointer"
                        onClick={handleDelete}
                    >
                        Delete
                    </div>
                </div>
            )}
            {isFolder && isOpen && (
                <div className="file-tree">
                    {Object.entries(node.children)
                        .sort(([aName, aNode], [bName, bNode]) => {
                             if (aNode.type === 'folder' && bNode.type !== 'folder') return -1;
                             if (aNode.type !== 'folder' && bNode.type === 'folder') return 1;
                             return aName.localeCompare(bName);
                        })
                        .map(([childName, childNode]) => (
                            <FileTreeItem
                                key={childName}
                                name={childName}
                                node={childNode}
                                path={`${path}/${childName}`}
                                depth={depth + 1}
                            />
                        ))}
                </div>
            )}
        </div>
    );
};

const FileExplorer: React.FC = () => {
    const { fileSystem, createFile, createFolder } = useAppContext();
    const [showAddMenu, setShowAddMenu] = useState(false);
    const menuRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handleClickOutside = (e: MouseEvent) => {
            if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
                setShowAddMenu(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handleNewFile = () => {
        const fileName = prompt('Enter file name:');
        if (fileName) {
            createFile(fileName);
        }
        setShowAddMenu(false);
    };

    const handleNewFolder = () => {
        const folderName = prompt('Enter folder name:');
        if (folderName) {
            createFolder(folderName);
        }
        setShowAddMenu(false);
    };

    return (
        <div className="w-full">
            <div className="flex justify-between items-center px-2 py-1 border-b border-gray-700">
                <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Explorer</span>
                <div className="relative" ref={menuRef}>
                    <button 
                        onClick={() => setShowAddMenu(!showAddMenu)}
                        className="p-1 rounded hover:bg-gray-700 text-gray-400 hover:text-white"
                        title="New File or Folder"
                    >
                        <PlusIcon className="w-4 h-4" />
                    </button>
                    
                    {showAddMenu && (
                        <div className="absolute right-0 mt-1 w-48 bg-gray-800 border border-gray-600 rounded shadow-lg py-1 z-10">
                            <div 
                                className="px-4 py-2 text-sm hover:bg-gray-700 cursor-pointer flex items-center"
                                onClick={handleNewFile}
                            >
                                <FileIcon className="w-3 h-3 mr-2 text-blue-400" />
                                New File
                            </div>
                            <div 
                                className="px-4 py-2 text-sm hover:bg-gray-700 cursor-pointer flex items-center"
                                onClick={handleNewFolder}
                            >
                                <FolderIcon className="w-3 h-3 mr-2 text-blue-400" />
                                New Folder
                            </div>
                        </div>
                    )}
                </div>
            </div>
            
            <div className="py-1">
                {Object.entries(fileSystem)
                    .sort(([aName, aNode], [bName, bNode]) => {
                        if (aNode.type === 'folder' && bNode.type !== 'folder') return -1;
                        if (aNode.type !== 'folder' && bNode.type === 'folder') return 1;
                        return aName.localeCompare(bName);
                    })
                    .map(([name, node]) => (
                        <FileTreeItem key={name} name={name} node={node} path={name} depth={0} />
                    ))}
            </div>
        </div>
    );
};

export default FileExplorer;
