import { EventEmitter } from "events";
import { storage } from "../storage";
import { geminiService } from "../gemini";
import type { Project, AgentState, InsertAgentLog } from "@shared/schema";
import { RequirementAgent } from "./RequirementAgent";
import { FrontendAgent } from "./FrontendAgent";
import { BackendAgent } from "./BackendAgent";
import { ValidatorAgent } from "./ValidatorAgent";
import { DeploymentAgent } from "./DeploymentAgent";

export interface AgentConfig {
  name: string;
  description: string;
  dependencies: string[];
}

export interface AgentResult {
  success: boolean;
  output?: any;
  error?: string;
  files?: Array<{ path: string; content: string; language?: string }>;
}

export abstract class BaseAgent {
  constructor(
    protected name: string,
    protected orchestrator: AgentOrchestrator
  ) {}

  abstract execute(projectId: string, config: any, previousOutputs: Record<string, any>): Promise<AgentResult>;

  protected async log(projectId: string, level: "info" | "warn" | "error" | "success", message: string, metadata?: any) {
    const logEntry: InsertAgentLog = {
      projectId,
      agentName: this.name,
      level,
      message,
      metadata
    };
    
    await storage.addAgentLog(logEntry);
    this.orchestrator.emit('log', logEntry);
  }

  protected async updateProgress(projectId: string, progress: number) {
    this.orchestrator.emit('progress', { agent: this.name, progress });
  }
}

export class AgentOrchestrator extends EventEmitter {
  private agents: Map<string, BaseAgent> = new Map();
  private agentConfigs: AgentConfig[] = [
    { name: "Requirement", description: "Parse user requirements", dependencies: [] },
    { name: "Frontend", description: "Generate frontend code", dependencies: ["Requirement"] },
    { name: "Backend", description: "Generate backend code", dependencies: ["Requirement"] },
    { name: "Validator", description: "Validate generated code", dependencies: ["Frontend", "Backend"] },
    { name: "Deployment", description: "Package for deployment", dependencies: ["Validator"] }
  ];

  constructor() {
    super();
    this.initializeAgents();
  }

  private initializeAgents() {
    this.agents.set("Requirement", new RequirementAgent("Requirement", this));
    this.agents.set("Frontend", new FrontendAgent("Frontend", this));
    this.agents.set("Backend", new BackendAgent("Backend", this));
    this.agents.set("Validator", new ValidatorAgent("Validator", this));
    this.agents.set("Deployment", new DeploymentAgent("Deployment", this));
  }

  async startProject(projectId: string): Promise<void> {
    try {
      const project = await storage.getProject(projectId);
      if (!project) {
        throw new Error("Project not found");
      }

      await storage.updateProjectStatus(projectId, "running");

      const initialState: AgentState = {
        currentAgent: null,
        completedAgents: [],
        agentProgress: {},
        agentOutputs: {},
        errors: []
      };

      await storage.updateProjectState(projectId, initialState);
      this.emit('project-started', { projectId });

      await this.executeAgentPipeline(projectId, project);

    } catch (error: any) {
      console.error("Project execution failed:", error);
      await storage.updateProjectStatus(projectId, "error");
      this.emit('project-error', { projectId, error: error.message });
    }
  }

  private async executeAgentPipeline(projectId: string, project: Project): Promise<void> {
    const state = project.state as AgentState || {
      currentAgent: null,
      completedAgents: [],
      agentProgress: {},
      agentOutputs: {},
      errors: []
    };

    for (const agentConfig of this.agentConfigs) {
      // Skip if already completed
      if (state.completedAgents.includes(agentConfig.name)) {
        continue;
      }

      // Check if dependencies are met
      const dependenciesMet = agentConfig.dependencies.every(dep => 
        state.completedAgents.includes(dep)
      );

      if (!dependenciesMet) {
        const missingDeps = agentConfig.dependencies.filter(dep => 
          !state.completedAgents.includes(dep)
        );
        throw new Error(`Agent ${agentConfig.name} dependencies not met: ${missingDeps.join(", ")}`);
      }

      // Execute agent
      state.currentAgent = agentConfig.name;
      await storage.updateProjectState(projectId, state);
      this.emit('agent-started', { projectId, agent: agentConfig.name });

      const agent = this.agents.get(agentConfig.name);
      if (!agent) {
        throw new Error(`Agent ${agentConfig.name} not found`);
      }

      try {
        const result = await agent.execute(projectId, project.config, state.agentOutputs);
        
        if (result.success) {
          state.completedAgents.push(agentConfig.name);
          state.agentOutputs[agentConfig.name] = result.output;
          state.agentProgress[agentConfig.name] = 100;

          // Save generated files
          if (result.files) {
            for (const file of result.files) {
              await storage.addProjectFile({
                projectId,
                path: file.path,
                content: file.content,
                size: file.content.length,
                language: file.language
              });
            }
          }

          this.emit('agent-completed', { projectId, agent: agentConfig.name });
        } else {
          state.errors.push({
            agent: agentConfig.name,
            error: result.error || "Unknown error",
            timestamp: new Date().toISOString()
          });
          throw new Error(`Agent ${agentConfig.name} failed: ${result.error}`);
        }

      } catch (error: any) {
        state.errors.push({
          agent: agentConfig.name,
          error: error.message,
          timestamp: new Date().toISOString()
        });
        await storage.updateProjectState(projectId, state);
        this.emit('agent-error', { projectId, agent: agentConfig.name, error: error.message });
        throw error;
      }

      state.currentAgent = null;
      await storage.updateProjectState(projectId, state);
    }

    // All agents completed successfully
    await storage.updateProjectStatus(projectId, "completed");
    this.emit('project-completed', { projectId });
  }

  async pauseProject(projectId: string): Promise<void> {
    await storage.updateProjectStatus(projectId, "paused");
    this.emit('project-paused', { projectId });
  }

  async resumeProject(projectId: string): Promise<void> {
    const project = await storage.getProject(projectId);
    if (!project) {
      throw new Error("Project not found");
    }

    await storage.updateProjectStatus(projectId, "running");
    this.emit('project-resumed', { projectId });
    
    // Continue from where we left off
    await this.executeAgentPipeline(projectId, project);
  }

  getAgentConfigs(): AgentConfig[] {
    return this.agentConfigs;
  }
}

export const agentOrchestrator = new AgentOrchestrator();