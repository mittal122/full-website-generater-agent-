import { 
  type User, 
  type InsertUser,
  type Project,
  type InsertProject,
  type AgentLog,
  type InsertAgentLog,
  type ProjectFile,
  type InsertProjectFile,
  type AgentState
} from "@shared/schema";
import { randomUUID } from "crypto";

export interface IStorage {
  // User management
  getUser(id: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  // Project management
  getProject(id: string): Promise<Project | undefined>;
  createProject(project: InsertProject): Promise<Project>;
  updateProjectStatus(id: string, status: string): Promise<void>;
  updateProjectState(id: string, state: AgentState): Promise<void>;
  
  // Agent logs
  getProjectLogs(projectId: string): Promise<AgentLog[]>;
  addAgentLog(log: InsertAgentLog): Promise<AgentLog>;
  
  // Project files
  getProjectFiles(projectId: string): Promise<ProjectFile[]>;
  addProjectFile(file: InsertProjectFile): Promise<ProjectFile>;
  updateProjectFile(id: string, content: string): Promise<void>;
}

export class MemStorage implements IStorage {
  private users: Map<string, User>;
  private projects: Map<string, Project>;
  private agentLogs: Map<string, AgentLog>;
  private projectFiles: Map<string, ProjectFile>;

  constructor() {
    this.users = new Map();
    this.projects = new Map();
    this.agentLogs = new Map();
    this.projectFiles = new Map();
  }

  // User methods
  async getUser(id: string): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = randomUUID();
    const user: User = { ...insertUser, id };
    this.users.set(id, user);
    return user;
  }

  // Project methods
  async getProject(id: string): Promise<Project | undefined> {
    return this.projects.get(id);
  }

  async createProject(insertProject: InsertProject): Promise<Project> {
    const id = randomUUID();
    const now = new Date();
    const project: Project = {
      ...insertProject,
      id,
      status: "pending",
      state: null,
      createdAt: now,
      updatedAt: now
    };
    this.projects.set(id, project);
    return project;
  }

  async updateProjectStatus(id: string, status: string): Promise<void> {
    const project = this.projects.get(id);
    if (project) {
      project.status = status;
      project.updatedAt = new Date();
      this.projects.set(id, project);
    }
  }

  async updateProjectState(id: string, state: AgentState): Promise<void> {
    const project = this.projects.get(id);
    if (project) {
      project.state = state;
      project.updatedAt = new Date();
      this.projects.set(id, project);
    }
  }

  // Agent log methods
  async getProjectLogs(projectId: string): Promise<AgentLog[]> {
    return Array.from(this.agentLogs.values())
      .filter(log => log.projectId === projectId)
      .sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());
  }

  async addAgentLog(insertLog: InsertAgentLog): Promise<AgentLog> {
    const id = randomUUID();
    const log: AgentLog = {
      ...insertLog,
      id,
      metadata: insertLog.metadata || null,
      timestamp: new Date()
    };
    this.agentLogs.set(id, log);
    return log;
  }

  // Project file methods
  async getProjectFiles(projectId: string): Promise<ProjectFile[]> {
    return Array.from(this.projectFiles.values())
      .filter(file => file.projectId === projectId)
      .sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
  }

  async addProjectFile(insertFile: InsertProjectFile): Promise<ProjectFile> {
    const id = randomUUID();
    const file: ProjectFile = {
      ...insertFile,
      id,
      language: insertFile.language || null,
      createdAt: new Date()
    };
    this.projectFiles.set(id, file);
    return file;
  }

  async updateProjectFile(id: string, content: string): Promise<void> {
    const file = this.projectFiles.get(id);
    if (file) {
      file.content = content;
      file.size = content.length;
      this.projectFiles.set(id, file);
    }
  }
}

export const storage = new MemStorage();
