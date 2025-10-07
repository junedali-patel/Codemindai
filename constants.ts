
import { FileSystemTree } from './types';

export const INITIAL_FILE_SYSTEM: FileSystemTree = {
  'README.md': {
    type: 'file',
    content: '# VS Code Web Edition\n\nWelcome to your new web-based code editor!',
  },
  'src': {
    type: 'folder',
    children: {
      'App.tsx': {
        type: 'file',
        content: `import React from 'react';

const App = () => {
  return (
    <div className="app">
      <h1>Hello, World!</h1>
    </div>
  );
};

export default App;
`,
      },
      'index.css': {
        type: 'file',
        content: `body {
  font-family: sans-serif;
  margin: 0;
}`,
      },
    },
  },
  'package.json': {
    type: 'file',
    content: `{
  "name": "vscode-web-clone",
  "version": "1.0.0",
  "description": "",
  "main": "index.js",
  "scripts": {
    "start": "react-scripts start"
  },
  "dependencies": {
    "react": "^18.0.0"
  }
}`,
  },
};
