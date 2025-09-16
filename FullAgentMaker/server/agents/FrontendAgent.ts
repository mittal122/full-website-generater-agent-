import { BaseAgent, AgentResult } from "./AgentOrchestrator";
import { geminiService } from "../gemini";

export class FrontendAgent extends BaseAgent {
  async execute(projectId: string, config: any, previousOutputs: Record<string, any>): Promise<AgentResult> {
    try {
      await this.log(projectId, "info", "Starting frontend development...");
      await this.updateProgress(projectId, 10);

      const requirements = previousOutputs.Requirement;
      if (!requirements) {
        throw new Error("Requirements not found from previous agent");
      }

      const prompt = `
Based on the following technical specification, generate a complete React frontend application:

${requirements.specification}

Configuration:
- Tech Stack: ${config.stack}
- Project Name: ${config.projectName}

Please generate:
1. Complete React components with TypeScript
2. Tailwind CSS styling (dark mode compatible)
3. React Router setup if needed
4. Form handling with validation
5. State management setup
6. API integration (mock endpoints)

Provide the complete file structure and all component code. Make it production-ready with proper TypeScript types, error handling, and responsive design.

Focus on:
- Modern React patterns (hooks, functional components)
- Accessibility (ARIA labels, semantic HTML)
- Performance optimization
- Clean, maintainable code structure
`;

      await this.updateProgress(projectId, 40);

      const systemInstruction = `You are a senior React developer. Generate complete, production-ready React components with TypeScript. Use modern patterns, include proper TypeScript types, implement error handling, and ensure responsive design. All code should be clean, well-structured, and follow React best practices.`;

      const response = await geminiService.generateContent(prompt, systemInstruction);

      if (!response.success) {
        throw new Error(response.error || "Failed to generate frontend code");
      }

      await this.updateProgress(projectId, 70);

      // Parse the generated code into files
      const files = this.parseCodeIntoFiles(response.content, config);

      await this.log(projectId, "success", `Frontend development completed. Generated ${files.length} files.`);
      await this.updateProgress(projectId, 100);

      return {
        success: true,
        output: {
          codeGenerated: response.content,
          fileCount: files.length,
          architecture: this.extractArchitectureInfo(response.content)
        },
        files
      };

    } catch (error: any) {
      await this.log(projectId, "error", `Frontend development failed: ${error.message}`);
      return {
        success: false,
        error: error.message
      };
    }
  }

  private parseCodeIntoFiles(content: string, config: any): Array<{ path: string; content: string; language: string }> {
    const files: Array<{ path: string; content: string; language: string }> = [];
    
    // Extract code blocks from the response
    const codeBlocks = content.match(/```[\s\S]*?```/g) || [];
    
    for (let i = 0; i < codeBlocks.length; i++) {
      const block = codeBlocks[i];
      const lines = block.split('\n');
      const firstLine = lines[0];
      
      let filename = '';
      let language = 'javascript';
      
      // Try to extract filename and language from the first line
      if (firstLine.includes('.tsx')) {
        filename = this.extractFilename(firstLine) || `Component${i + 1}.tsx`;
        language = 'typescript';
      } else if (firstLine.includes('.ts')) {
        filename = this.extractFilename(firstLine) || `utils${i + 1}.ts`;
        language = 'typescript';
      } else if (firstLine.includes('.jsx')) {
        filename = this.extractFilename(firstLine) || `Component${i + 1}.jsx`;
        language = 'javascript';
      } else if (firstLine.includes('.js')) {
        filename = this.extractFilename(firstLine) || `utils${i + 1}.js`;
        language = 'javascript';
      } else if (firstLine.includes('.css')) {
        filename = this.extractFilename(firstLine) || `styles${i + 1}.css`;
        language = 'css';
      } else if (firstLine.includes('.json')) {
        filename = this.extractFilename(firstLine) || `config${i + 1}.json`;
        language = 'json';
      } else {
        // Infer from content
        const codeContent = lines.slice(1, -1).join('\n');
        if (codeContent.includes('export default') || codeContent.includes('import React')) {
          filename = `Component${i + 1}.tsx`;
          language = 'typescript';
        } else if (codeContent.includes('function') || codeContent.includes('const')) {
          filename = `utils${i + 1}.ts`;
          language = 'typescript';
        }
      }
      
      if (filename) {
        const codeContent = lines.slice(1, -1).join('\n');
        files.push({
          path: `/src/${filename}`,
          content: codeContent,
          language
        });
      }
    }

    // Add essential files if not present
    this.addEssentialFiles(files, config);
    
    return files;
  }

  private extractFilename(line: string): string | null {
    // Look for common filename patterns
    const patterns = [
      /([a-zA-Z0-9_-]+\.[a-zA-Z]+)/,
      /`([^`]+)`/,
      /"([^"]+)"/,
      /'([^']+)'/
    ];
    
    for (const pattern of patterns) {
      const match = line.match(pattern);
      if (match && match[1].includes('.')) {
        return match[1];
      }
    }
    
    return null;
  }

  private addEssentialFiles(files: Array<{ path: string; content: string; language: string }>, config: any) {
    const existingPaths = files.map(f => f.path);
    
    // Add App.tsx if not present
    if (!existingPaths.some(p => p.includes('App.'))) {
      files.push({
        path: '/src/App.tsx',
        content: `import React from 'react';
import './App.css';

function App() {
  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900">
      <header className="bg-white dark:bg-gray-800 shadow">
        <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            ${config.projectName}
          </h1>
        </div>
      </header>
      <main>
        <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
          {/* Content will be generated by AI */}
        </div>
      </main>
    </div>
  );
}

export default App;`,
        language: 'typescript'
      });
    }

    // Add package.json if not present
    if (!existingPaths.some(p => p.includes('package.json'))) {
      files.push({
        path: '/package.json',
        content: JSON.stringify({
          name: config.projectName.toLowerCase().replace(/[^a-z0-9-]/g, '-'),
          version: '1.0.0',
          private: true,
          dependencies: {
            react: '^18.2.0',
            'react-dom': '^18.2.0',
            'react-scripts': '5.0.1',
            typescript: '^4.9.5',
            '@types/react': '^18.2.0',
            '@types/react-dom': '^18.2.0',
            tailwindcss: '^3.3.0',
            autoprefixer: '^10.4.0',
            postcss: '^8.4.0'
          },
          scripts: {
            start: 'react-scripts start',
            build: 'react-scripts build',
            test: 'react-scripts test',
            eject: 'react-scripts eject'
          },
          browserslist: {
            production: ['>0.2%', 'not dead', 'not op_mini all'],
            development: ['last 1 chrome version', 'last 1 firefox version', 'last 1 safari version']
          }
        }, null, 2),
        language: 'json'
      });
    }
  }

  private extractArchitectureInfo(content: string) {
    return {
      components: this.countOccurrences(content, /export.*function|export.*const.*=/g),
      hooks: this.countOccurrences(content, /use[A-Z][a-zA-Z]*/g),
      routes: this.countOccurrences(content, /Route|path=/g),
      apiCalls: this.countOccurrences(content, /fetch\(|axios\.|api\./g)
    };
  }

  private countOccurrences(text: string, regex: RegExp): number {
    return (text.match(regex) || []).length;
  }
}