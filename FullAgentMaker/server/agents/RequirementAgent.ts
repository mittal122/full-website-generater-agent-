import { BaseAgent, AgentResult } from "./AgentOrchestrator";
import { geminiService } from "../gemini";

export class RequirementAgent extends BaseAgent {
  async execute(projectId: string, config: any, previousOutputs: Record<string, any>): Promise<AgentResult> {
    try {
      await this.log(projectId, "info", "Starting requirement analysis...");
      await this.updateProgress(projectId, 10);

      const prompt = `
Analyze the following project requirements and create a structured technical specification:

Project Description: ${config.description}
Project Name: ${config.projectName}
Tech Stack: ${config.stack}
Database: ${config.database}
Features: ${config.features?.join(", ") || "None"}

Please provide a detailed technical specification including:
1. Core features breakdown
2. Database schema requirements (if applicable)
3. API endpoints needed
4. Frontend components structure
5. Technical architecture decisions
6. Third-party integrations required

Format your response as a comprehensive technical specification document.
`;

      await this.updateProgress(projectId, 50);

      const systemInstruction = `You are a senior technical architect. Analyze the user requirements and create a detailed, implementable technical specification. Be specific about technologies, architecture patterns, and implementation details.`;

      const response = await geminiService.generateContent(prompt, systemInstruction);

      if (!response.success) {
        throw new Error(response.error || "Failed to analyze requirements");
      }

      await this.updateProgress(projectId, 80);

      // Parse and structure the requirements
      const structuredRequirements = this.parseRequirements(response.content);

      await this.log(projectId, "success", "Requirements analysis completed successfully");
      await this.updateProgress(projectId, 100);

      return {
        success: true,
        output: {
          specification: response.content,
          structured: structuredRequirements,
          config
        }
      };

    } catch (error: any) {
      await this.log(projectId, "error", `Requirement analysis failed: ${error.message}`);
      return {
        success: false,
        error: error.message
      };
    }
  }

  private parseRequirements(specification: string) {
    // Extract key information from the specification
    return {
      features: this.extractFeatures(specification),
      database: this.extractDatabaseInfo(specification),
      apis: this.extractAPIs(specification),
      components: this.extractComponents(specification)
    };
  }

  private extractFeatures(spec: string): string[] {
    // Simple extraction - in a real implementation, this would be more sophisticated
    const features: string[] = [];
    const lines = spec.split('\n');
    
    for (const line of lines) {
      if (line.toLowerCase().includes('feature') || line.toLowerCase().includes('functionality')) {
        const cleaned = line.replace(/[^\w\s]/g, '').trim();
        if (cleaned.length > 5) {
          features.push(cleaned);
        }
      }
    }
    
    return features.slice(0, 10); // Limit to top 10 features
  }

  private extractDatabaseInfo(spec: string) {
    const dbKeywords = ['table', 'schema', 'model', 'entity', 'collection'];
    const tables: string[] = [];
    
    const lines = spec.split('\n');
    for (const line of lines) {
      const lower = line.toLowerCase();
      if (dbKeywords.some(keyword => lower.includes(keyword))) {
        tables.push(line.trim());
      }
    }
    
    return { tables: tables.slice(0, 15) };
  }

  private extractAPIs(spec: string): string[] {
    const apiKeywords = ['endpoint', 'api', 'route', 'get', 'post', 'put', 'delete'];
    const apis: string[] = [];
    
    const lines = spec.split('\n');
    for (const line of lines) {
      const lower = line.toLowerCase();
      if (apiKeywords.some(keyword => lower.includes(keyword))) {
        apis.push(line.trim());
      }
    }
    
    return apis.slice(0, 20);
  }

  private extractComponents(spec: string): string[] {
    const componentKeywords = ['component', 'page', 'form', 'modal', 'button', 'header', 'footer'];
    const components: string[] = [];
    
    const lines = spec.split('\n');
    for (const line of lines) {
      const lower = line.toLowerCase();
      if (componentKeywords.some(keyword => lower.includes(keyword))) {
        components.push(line.trim());
      }
    }
    
    return components.slice(0, 25);
  }
}