import CodePreview from '../CodePreview';

export default function CodePreviewExample() {
  //todo: remove mock functionality
  const mockFiles = [
    {
      name: "src",
      type: "folder" as const,
      path: "/src",
      children: [
        {
          name: "components",
          type: "folder" as const,
          path: "/src/components",
          children: [
            {
              name: "Button.tsx",
              type: "file" as const,
              path: "/src/components/Button.tsx",
              size: "2.1 KB",
              content: `import React from 'react';

interface ButtonProps {
  children: React.ReactNode;
  onClick?: () => void;
  variant?: 'primary' | 'secondary';
  disabled?: boolean;
}

export default function Button({ 
  children, 
  onClick, 
  variant = 'primary',
  disabled = false 
}: ButtonProps) {
  return (
    <button
      className={\`btn btn-\${variant} \${disabled ? 'opacity-50' : ''}\`}
      onClick={onClick}
      disabled={disabled}
    >
      {children}
    </button>
  );
}`
            },
            {
              name: "Header.tsx", 
              type: "file" as const,
              path: "/src/components/Header.tsx",
              size: "1.8 KB",
              content: `import React from 'react';
import Button from './Button';

export default function Header() {
  return (
    <header className="bg-white shadow-sm border-b">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <h1 className="text-xl font-semibold">My App</h1>
          <Button variant="primary">Sign In</Button>
        </div>
      </div>
    </header>
  );
}`
            }
          ]
        },
        {
          name: "App.tsx",
          type: "file" as const,
          path: "/src/App.tsx",
          size: "856 B",
          content: `import React from 'react';
import Header from './components/Header';

function App() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <div className="border-4 border-dashed border-gray-200 rounded-lg h-96">
            <h2 className="text-2xl font-bold text-center pt-20">
              Welcome to your new app!
            </h2>
          </div>
        </div>
      </main>
    </div>
  );
}

export default App;`
        }
      ]
    },
    {
      name: "package.json",
      type: "file" as const,
      path: "/package.json", 
      size: "1.2 KB",
      content: `{
  "name": "my-awesome-app",
  "version": "1.0.0",
  "private": true,
  "dependencies": {
    "react": "^18.2.0",
    "react-dom": "^18.2.0",
    "typescript": "^4.9.5"
  },
  "scripts": {
    "start": "react-scripts start",
    "build": "react-scripts build",
    "test": "react-scripts test",
    "eject": "react-scripts eject"
  },
  "browserslist": {
    "production": [
      ">0.2%",
      "not dead",
      "not op_mini all"
    ],
    "development": [
      "last 1 chrome version",
      "last 1 firefox version",
      "last 1 safari version"
    ]
  }
}`
    }
  ];

  return (
    <div className="h-[600px]">
      <CodePreview 
        files={mockFiles}
        selectedFile="/src/components/Button.tsx"
        onFileSelect={(path) => console.log('Selected file:', path)}
        onDownload={() => console.log('Download project')}
      />
    </div>
  );
}