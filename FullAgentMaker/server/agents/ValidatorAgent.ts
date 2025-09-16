import { BaseAgent, AgentResult } from "./AgentOrchestrator";
import { geminiService } from "../gemini";

export class ValidatorAgent extends BaseAgent {
  async execute(projectId: string, config: any, previousOutputs: Record<string, any>): Promise<AgentResult> {
    try {
      await this.log(projectId, "info", "Starting code validation...");
      await this.updateProgress(projectId, 10);

      const frontendOutput = previousOutputs.Frontend;
      const backendOutput = previousOutputs.Backend;

      if (!frontendOutput) {
        throw new Error("Frontend output not found from previous agent");
      }

      // Collect all generated code for validation
      const codeToValidate = {
        frontend: frontendOutput.codeGenerated || '',
        backend: backendOutput?.codeGenerated || '',
        hasBackend: backendOutput?.type !== 'frontend-only'
      };

      await this.updateProgress(projectId, 30);

      const validationPrompt = `
Please perform a comprehensive code review and validation of the following generated code:

FRONTEND CODE:
${codeToValidate.frontend}

${codeToValidate.hasBackend ? `
BACKEND CODE:
${codeToValidate.backend}
` : 'NO BACKEND - Frontend only application'}

Please validate:
1. Code quality and best practices
2. TypeScript type safety
3. Error handling
4. Security vulnerabilities
5. Performance issues
6. Accessibility compliance
7. Code structure and organization
8. Integration between frontend and backend (if applicable)
9. Missing dependencies or imports
10. Potential runtime errors

Provide:
- List of critical issues that must be fixed
- List of minor improvements
- Overall code quality score (1-10)
- Recommendations for production readiness
- Specific fixes for any identified issues
`;

      const systemInstruction = `You are a senior code reviewer and quality assurance engineer. Perform a thorough code review focusing on security, performance, maintainability, and best practices. Identify critical issues that could cause runtime errors or security vulnerabilities. Provide specific, actionable feedback.`;

      const response = await geminiService.generateContent(validationPrompt, systemInstruction);

      if (!response.success) {
        throw new Error(response.error || "Failed to validate code");
      }

      await this.updateProgress(projectId, 70);

      // Parse validation results
      const validationResults = this.parseValidationResults(response.content);

      // Check if there are critical issues
      const hasCriticalIssues = validationResults.criticalIssues.length > 0;

      if (hasCriticalIssues) {
        await this.log(projectId, "warn", `Found ${validationResults.criticalIssues.length} critical issues that need fixing`);
        
        // Attempt to generate fixes for critical issues
        const fixes = await this.generateFixes(validationResults.criticalIssues, codeToValidate);
        
        await this.updateProgress(projectId, 90);
        
        await this.log(projectId, "success", "Code validation completed with fixes applied");
        
        return {
          success: true,
          output: {
            validationReport: response.content,
            criticalIssues: validationResults.criticalIssues,
            minorIssues: validationResults.minorIssues,
            qualityScore: validationResults.qualityScore,
            fixes: fixes,
            isProductionReady: false
          },
          files: fixes
        };
      } else {
        await this.log(projectId, "success", "Code validation passed - no critical issues found");
        await this.updateProgress(projectId, 100);
        
        return {
          success: true,
          output: {
            validationReport: response.content,
            criticalIssues: [],
            minorIssues: validationResults.minorIssues,
            qualityScore: validationResults.qualityScore,
            isProductionReady: true
          }
        };
      }

    } catch (error: any) {
      await this.log(projectId, "error", `Code validation failed: ${error.message}`);
      return {
        success: false,
        error: error.message
      };
    }
  }

  private parseValidationResults(content: string) {
    const results = {
      criticalIssues: [] as string[],
      minorIssues: [] as string[],
      qualityScore: 7 // Default score
    };

    const lines = content.split('\n');
    let currentSection = '';

    for (const line of lines) {
      const lower = line.toLowerCase();
      
      if (lower.includes('critical') || lower.includes('error') || lower.includes('security')) {
        currentSection = 'critical';
      } else if (lower.includes('minor') || lower.includes('improvement') || lower.includes('suggestion')) {
        currentSection = 'minor';
      } else if (lower.includes('score') || lower.includes('rating')) {
        const scoreMatch = line.match(/(\d+(?:\.\d+)?)/);
        if (scoreMatch) {
          results.qualityScore = parseFloat(scoreMatch[1]);
        }
      }

      // Extract issues based on common patterns
      if (line.trim().startsWith('-') || line.trim().startsWith('*') || line.trim().startsWith('•')) {
        const issue = line.trim().substring(1).trim();
        if (issue.length > 10) {
          if (currentSection === 'critical') {
            results.criticalIssues.push(issue);
          } else if (currentSection === 'minor') {
            results.minorIssues.push(issue);
          }
        }
      }
    }

    return results;
  }

  private async generateFixes(criticalIssues: string[], codeToValidate: any): Promise<Array<{ path: string; content: string; language: string }>> {
    if (criticalIssues.length === 0) {
      return [];
    }

    try {
      const fixPrompt = `
The following critical issues were found in the generated code:

${criticalIssues.map((issue, index) => `${index + 1}. ${issue}`).join('\n')}

Original code context:
${codeToValidate.frontend}

Please generate fixes for these critical issues. Provide the corrected code files with the fixes applied. Focus only on fixing the critical issues without changing the overall structure or functionality.
`;

      const systemInstruction = `You are a senior developer fixing critical code issues. Generate only the corrected files that fix the specific issues mentioned. Maintain the original functionality while addressing security, error handling, and critical bugs.`;

      const response = await geminiService.generateContent(fixPrompt, systemInstruction);

      if (response.success && response.content) {
        return this.parseFixedFiles(response.content);
      }
    } catch (error) {
      console.error("Failed to generate fixes:", error);
    }

    return [];
  }

  private parseFixedFiles(content: string): Array<{ path: string; content: string; language: string }> {
    const files: Array<{ path: string; content: string; language: string }> = [];
    const codeBlocks = content.match(/```[\s\S]*?```/g) || [];
    
    for (let i = 0; i < codeBlocks.length; i++) {
      const block = codeBlocks[i];
      const lines = block.split('\n');
      const firstLine = lines[0];
      
      let filename = '';
      let language = 'javascript';
      
      if (firstLine.includes('.tsx')) {
        filename = this.extractFilename(firstLine) || `Fixed${i + 1}.tsx`;
        language = 'typescript';
      } else if (firstLine.includes('.ts')) {
        filename = this.extractFilename(firstLine) || `Fixed${i + 1}.ts`;
        language = 'typescript';
      } else if (firstLine.includes('.jsx')) {
        filename = this.extractFilename(firstLine) || `Fixed${i + 1}.jsx`;
        language = 'javascript';
      } else if (firstLine.includes('.js')) {
        filename = this.extractFilename(firstLine) || `Fixed${i + 1}.js`;
        language = 'javascript';
      }
      
      if (filename) {
        const codeContent = lines.slice(1, -1).join('\n');
        files.push({
          path: `/src/fixed/${filename}`,
          content: codeContent,
          language
        });
      }
    }
    
    return files;
  }

  private extractFilename(line: string): string | null {
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
}