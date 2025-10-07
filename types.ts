export interface FileNode {
  type: 'file';
  content: string;
}

export interface FolderNode {
  type: 'folder';
  children: { [key: string]: FileSystemNode };
}

export type FileSystemNode = FileNode | FolderNode;

export interface FileSystemTree {
  [key: string]: FileSystemNode;
}

export interface EditorTab {
  id: string; // The full path of the file
  name: string;
  content: string;
  isDirty: boolean;
}

export type Theme = 'vs-dark' | 'vs-light';

export type ActiveView = 'explorer' | 'search' | 'source-control' | 'debug' | 'extensions' | 'ai-assistant';

export interface Command {
    id: string;
    label: string;
    action: () => void;
}

export interface ChatMessage {
  role: 'user' | 'model';
  parts: { text: string }[];
  isLoading?: boolean;
}

export interface AppContextType {
    fileSystem: FileSystemTree;
    openTabs: EditorTab[];
    activeTabId: string | null;
    theme: Theme;
    activeView: ActiveView;
    isSidebarVisible: boolean;
    isTerminalOpen: boolean;
    isCommandPaletteOpen: boolean;
    cursorPosition: { lineNumber: number, column: number };
    unstagedChanges: Set<string>;
    stagedChanges: Set<string>;
    commitMessage: string;
    chatHistory: ChatMessage[];
    isAiLoading: boolean;
    editorRef: React.MutableRefObject<any>;
    setFileSystem: React.Dispatch<React.SetStateAction<FileSystemTree>>;
    openFile: (path: string, name: string) => void;
    closeTab: (tabId: string) => void;
    setActiveTab: (tabId: string) => void;
    updateTabContent: (tabId: string, content: string) => void;
    saveActiveFile: () => void;
    setTheme: (theme: Theme) => void;
    setActiveView: (view: ActiveView) => void;
    toggleSidebar: () => void;
    toggleTerminal: () => void;
    toggleCommandPalette: () => void;
    setCursorPosition: (pos: { lineNumber: number, column: number }) => void;
    stageChange: (path: string) => void;
    unstageChange: (path: string) => void;
    stageAllChanges: () => void;
    unstageAllChanges: () => void;
    commit: () => void;
    pushChanges: () => void;
    setCommitMessage: React.Dispatch<React.SetStateAction<string>>;
    sendChatMessage: (message: string, context?: string) => Promise<void>;
    generateCommitMessage: () => Promise<void>;
    runAiCodeCommand: (command: 'explain' | 'refactor' | 'add-comments') => Promise<void>;
}
