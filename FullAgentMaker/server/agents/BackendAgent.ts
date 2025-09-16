import { BaseAgent, AgentResult } from "./AgentOrchestrator";
import { geminiService } from "../gemini";

export class BackendAgent extends BaseAgent {
  async execute(projectId: string, config: any, previousOutputs: Record<string, any>): Promise<AgentResult> {
    try {
      await this.log(projectId, "info", "Starting backend development...");
      await this.updateProgress(projectId, 10);

      const requirements = previousOutputs.Requirement;
      if (!requirements) {
        throw new Error("Requirements not found from previous agent");
      }

      // Check if backend is needed
      const needsBackend = this.checkIfBackendNeeded(config, requirements);
      
      if (!needsBackend) {
        await this.log(projectId, "info", "Backend not required for this project type");
        return {
          success: true,
          output: {
            type: "frontend-only",
            message: "No backend required"
          }
        };
      }

      const prompt = `
Based on the following technical specification, generate a complete Node.js backend application:

${requirements.specification}

Configuration:
- Tech Stack: ${config.stack}
- Database: ${config.database}
- Project Name: ${config.projectName}

Please generate:
1. Express.js server with TypeScript
2. RESTful API endpoints
3. Database models and schemas
4. Authentication middleware (if needed)
5. Input validation and error handling
6. Environment configuration
7. Database connection setup

Provide the complete file structure and all backend code. Make it production-ready with proper error handling, validation, logging, and security measures.

Focus on:
- RESTful API design principles
- Proper HTTP status codes
- Input validation and sanitization
- Security best practices
- Clean architecture patterns
- Database optimization
`;

      await this.updateProgress(projectId, 40);

      const systemInstruction = `You are a senior backend developer. Generate complete, production-ready Node.js/Express backend code with TypeScript. Include proper error handling, validation, security measures, and follow REST API best practices. All code should be well-structured and follow Node.js conventions.`;

      const response = await geminiService.generateContent(prompt, systemInstruction);

      if (!response.success) {
        throw new Error(response.error || "Failed to generate backend code");
      }

      await this.updateProgress(projectId, 70);

      // Parse the generated code into files
      const files = this.parseCodeIntoFiles(response.content, config);

      await this.log(projectId, "success", `Backend development completed. Generated ${files.length} files.`);
      await this.updateProgress(projectId, 100);

      return {
        success: true,
        output: {
          codeGenerated: response.content,
          fileCount: files.length,
          architecture: this.extractArchitectureInfo(response.content),
          endpoints: this.extractEndpoints(response.content)
        },
        files
      };

    } catch (error: any) {
      await this.log(projectId, "error", `Backend development failed: ${error.message}`);
      return {
        success: false,
        error: error.message
      };
    }
  }

  private checkIfBackendNeeded(config: any, requirements: any): boolean {
    // Check if backend features are required
    const backendKeywords = [
      'database', 'api', 'authentication', 'auth', 'login', 'register',
      'server', 'backend', 'storage', 'persistence', 'user management'
    ];

    const description = (config.description || '').toLowerCase();
    const specification = (requirements.specification || '').toLowerCase();
    
    return backendKeywords.some(keyword => 
      description.includes(keyword) || specification.includes(keyword)
    ) || config.database !== 'none' || (config.features && config.features.length > 0);
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
      if (firstLine.includes('.ts') && !firstLine.includes('.tsx')) {
        filename = this.extractFilename(firstLine) || `server${i + 1}.ts`;
        language = 'typescript';
      } else if (firstLine.includes('.js')) {
        filename = this.extractFilename(firstLine) || `server${i + 1}.js`;
        language = 'javascript';
      } else if (firstLine.includes('.json')) {
        filename = this.extractFilename(firstLine) || `config${i + 1}.json`;
        language = 'json';
      } else if (firstLine.includes('.env')) {
        filename = this.extractFilename(firstLine) || '.env.example';
        language = 'text';
      } else if (firstLine.includes('.sql')) {
        filename = this.extractFilename(firstLine) || `schema${i + 1}.sql`;
        language = 'sql';
      } else {
        // Infer from content
        const codeContent = lines.slice(1, -1).join('\n');
        if (codeContent.includes('app.') || codeContent.includes('express')) {
          filename = `server${i + 1}.ts`;
          language = 'typescript';
        } else if (codeContent.includes('module.exports') || codeContent.includes('require(')) {
          filename = `utils${i + 1}.js`;
          language = 'javascript';
        }
      }
      
      if (filename) {
        const codeContent = lines.slice(1, -1).join('\n');
        const path = filename.startsWith('/') ? filename : `/server/${filename}`;
        files.push({
          path,
          content: codeContent,
          language
        });
      }
    }

    // Add essential backend files if not present
    this.addEssentialBackendFiles(files, config);
    
    return files;
  }

  private extractFilename(line: string): string | null {
    // Look for common filename patterns
    const patterns = [
      /([a-zA-Z0-9_.-]+\.[a-zA-Z]+)/,
      /`([^`]+)`/,
      /"([^"]+)"/,
      /'([^']+)'/
    ];
    
    for (const pattern of patterns) {
      const match = line.match(pattern);
      if (match && (match[1].includes('.') || match[1].startsWith('.'))) {
        return match[1];
      }
    }
    
    return null;
  }

  private addEssentialBackendFiles(files: Array<{ path: string; content: string; language: string }>, config: any) {
    const existingPaths = files.map(f => f.path);
    
    // Add server.ts if not present
    if (!existingPaths.some(p => p.includes('server.') || p.includes('index.') || p.includes('app.'))) {
      files.push({
        path: '/server/index.ts',
        content: `import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// Error handling middleware
app.use((err: any, req: any, res: any, next: any) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Something went wrong!' });
});

app.listen(PORT, () => {
  console.log(\`Server running on port \${PORT}\`);
});`,
        language: 'typescript'
      });
    }

    // Add package.json if not present
    if (!existingPaths.some(p => p.includes('package.json'))) {
      files.push({
        path: '/package.json',
        content: JSON.stringify({
          name: `${config.projectName.toLowerCase().replace(/[^a-z0-9-]/g, '-')}-backend`,
          version: '1.0.0',
          description: `Backend for ${config.projectName}`,
          main: 'dist/index.js',
          scripts: {
            start: 'node dist/index.js',
            dev: 'ts-node-dev --respawn --transpile-only src/index.ts',
            build: 'tsc',
            test: 'jest'
          },
          dependencies: {
            express: '^4.18.2',
            cors: '^2.8.5',
            dotenv: '^16.3.1',
            helmet: '^7.0.0',
            morgan: '^1.10.0'
          },
          devDependencies: {
            '@types/express': '^4.17.17',
            '@types/cors': '^2.8.13',
            '@types/node': '^20.5.0',
            'ts-node-dev': '^2.0.0',
            typescript: '^5.1.6',
            jest: '^29.6.2',
            '@types/jest': '^29.5.3'
          }
        }, null, 2),
        language: 'json'
      });
    }

    // Add .env.example if not present
    if (!existingPaths.some(p => p.includes('.env'))) {
      files.push({
        path: '/.env.example',
        content: `# Server Configuration
PORT=3001
NODE_ENV=development

# Database Configuration
DATABASE_URL=your_database_url_here

# JWT Secret
JWT_SECRET=your_jwt_secret_here

# CORS Origin
CORS_ORIGIN=http://localhost:3000`,
        language: 'text'
      });
    }
  }

  private extractArchitectureInfo(content: string) {
    return {
      routes: this.countOccurrences(content, /router\.|app\.(get|post|put|delete|patch)/g),
      middleware: this.countOccurrences(content, /app\.use|middleware/g),
      models: this.countOccurrences(content, /Schema|model|Model/g),
      controllers: this.countOccurrences(content, /Controller|controller/g)
    };
  }

  private extractEndpoints(content: string): string[] {
    const endpoints: string[] = [];
    const routeRegex = /app\.(get|post|put|delete|patch)\(['"`]([^'"`]+)['"`]/g;
    
    let match;
    while ((match = routeRegex.exec(content)) !== null) {
      endpoints.push(`${match[1].toUpperCase()} ${match[2]}`);
    }
    
    return endpoints;
  }

  private countOccurrences(text: string, regex: RegExp): number {
    return (text.match(regex) || []).length;
  }
}