import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useAppContext } from '../hooks/useAppContext';
import { SparkleIcon } from './icons';

type MenuItem = {
    // FIX: Made label optional to allow for separator items without labels.
    label?: string;
    action?: () => void;
    submenu?: MenuItem[];
    separator?: boolean;
    disabled?: boolean;
};

const MenuBar: React.FC = () => {
    const { 
        saveActiveFile,
        toggleSidebar,
        toggleTerminal,
        setActiveView,
        toggleCommandPalette
    } = useAppContext();
    const [openMenu, setOpenMenu] = useState<string | null>(null);
    const menuRef = useRef<HTMLDivElement>(null);

    const menuItems: MenuItem[] = [
        {
            label: 'File',
            submenu: [
                { label: 'New File', action: () => alert('New File clicked') },
                { label: 'New Window', action: () => alert('New Window clicked') },
                { separator: true },
                { label: 'Open File...', action: () => alert('Open File... clicked') },
                { label: 'Open Folder...', action: () => alert('Open Folder... clicked') },
                { separator: true },
                { label: 'Save', action: saveActiveFile },
                { label: 'Save As...', action: () => alert('Save As... clicked') },
                { label: 'Save All', action: () => alert('Save All clicked') },
                { separator: true },
                { label: 'Exit', action: () => alert('Exit clicked') },
            ],
        },
        {
            label: 'Edit',
            submenu: [
                { label: 'Undo', action: () => alert('Undo clicked') },
                { label: 'Redo', action: () => alert('Redo clicked') },
                { separator: true },
                { label: 'Cut', action: () => alert('Cut clicked') },
                { label: 'Copy', action: () => alert('Copy clicked') },
                { label: 'Paste', action: () => alert('Paste clicked') },
            ],
        },
        {
            label: 'View',
            submenu: [
                { label: 'Command Palette...', action: toggleCommandPalette },
                { separator: true },
                { label: 'Appearance', submenu: [
                    { label: 'Toggle Sidebar', action: toggleSidebar },
                ]},
                { separator: true },
                { label: 'Explorer', action: () => setActiveView('explorer') },
                { label: 'Search', action: () => setActiveView('search') },
                { label: 'Source Control', action: () => setActiveView('source-control') },
                { label: 'AI Assistant', action: () => setActiveView('ai-assistant') },
                { separator: true },
                { label: 'Terminal', action: toggleTerminal },
            ],
        },
        { label: 'Go', submenu: [{ label: 'Go to File...', action: () => alert('Go to File... clicked') }] },
        { label: 'Run', submenu: [{ label: 'Start Debugging', action: () => alert('Start Debugging clicked') }] },
        { label: 'Terminal', submenu: [{ label: 'New Terminal', action: toggleTerminal }] },
        { label: 'Help', submenu: [{ label: 'Welcome', action: () => alert('Welcome clicked') }] },
    ];

    const handleClickOutside = useCallback((event: MouseEvent) => {
        if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
            setOpenMenu(null);
        }
    }, []);

    useEffect(() => {
        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [handleClickOutside]);

    const handleMenuClick = (label: string) => {
        setOpenMenu(openMenu === label ? null : label);
    };

    const handleItemClick = (item: MenuItem) => {
        if (item.action) {
            item.action();
            setOpenMenu(null);
        }
    };

    const renderDropdown = (items: MenuItem[], isSubmenu = false) => (
        <div className={`absolute top-full mt-1 bg-vscode-light-sidebar dark:bg-vscode-sidebar border border-vscode-light-border dark:border-vscode-border rounded-md shadow-lg py-1 z-50 text-sm w-56 ${isSubmenu ? 'left-full -mt-2' : 'left-0'}`}>
            {items.map((item, index) =>
                item.separator ? (
                    <div key={index} className="h-px bg-vscode-light-border dark:bg-vscode-border my-1" />
                ) : (
                    <div
                        key={index}
                        onClick={() => handleItemClick(item)}
                        className={`px-3 py-1 flex justify-between items-center cursor-pointer hover:bg-vscode-statusbar/80 hover:text-white ${item.disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
                    >
                        <span>{item.label}</span>
                    </div>
                )
            )}
        </div>
    );
    
    return (
        <div ref={menuRef} className="relative h-8 bg-vscode-light-sidebar dark:bg-vscode-sidebar flex items-center px-4 text-sm border-b border-vscode-light-border dark:border-vscode-border select-none">
             <div className="flex items-center text-lg font-bold mr-6">
                <SparkleIcon className="w-5 h-5 mr-2 text-blue-400" />
            </div>
            {menuItems.map((menu) => (
                <div key={menu.label} className="relative">
                    <button
                        onClick={() => handleMenuClick(menu.label!)}
                        className={`px-3 py-1 rounded-md ${openMenu === menu.label ? 'bg-gray-500/30' : 'hover:bg-gray-500/20'}`}
                    >
                        {menu.label}
                    </button>
                    {openMenu === menu.label && menu.submenu && renderDropdown(menu.submenu)}
                </div>
            ))}
        </div>
    );
};

export default MenuBar;