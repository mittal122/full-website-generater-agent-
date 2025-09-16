import type { Express } from "express";
import { createServer, type Server } from "http";
import { WebSocketServer } from "ws";
import { storage } from "./storage";
import { agentOrchestrator } from "./agents/AgentOrchestrator";
import { insertProjectSchema, insertAgentLogSchema } from "@shared/schema";
import { z } from "zod";

// WebSocket connections for real-time updates
const wsClients = new Map<string, any>();

export async function registerRoutes(app: Express): Promise<Server> {
  // Project management routes
  
  // Create new project
  app.post("/api/projects", async (req, res) => {
    try {
      const projectData = insertProjectSchema.parse(req.body);
      const project = await storage.createProject(projectData);
      
      res.json({ success: true, project });
    } catch (error: any) {
      console.error("Create project error:", error);
      res.status(400).json({ 
        success: false, 
        error: error.message || "Failed to create project" 
      });
    }
  });

  // Start project execution
  app.post("/api/projects/:id/start", async (req, res) => {
    try {
      const projectId = req.params.id;
      const project = await storage.getProject(projectId);
      
      if (!project) {
        return res.status(404).json({ success: false, error: "Project not found" });
      }

      // Start project execution asynchronously
      agentOrchestrator.startProject(projectId).catch(error => {
        console.error("Project execution error:", error);
      });

      res.json({ success: true, message: "Project started" });
    } catch (error: any) {
      console.error("Start project error:", error);
      res.status(500).json({ 
        success: false, 
        error: error.message || "Failed to start project" 
      });
    }
  });

  // Get project status
  app.get("/api/projects/:id", async (req, res) => {
    try {
      const projectId = req.params.id;
      const project = await storage.getProject(projectId);
      
      if (!project) {
        return res.status(404).json({ success: false, error: "Project not found" });
      }

      res.json({ success: true, project });
    } catch (error: any) {
      console.error("Get project error:", error);
      res.status(500).json({ 
        success: false, 
        error: error.message || "Failed to get project" 
      });
    }
  });

  // Pause/resume project
  app.post("/api/projects/:id/pause", async (req, res) => {
    try {
      const projectId = req.params.id;
      await agentOrchestrator.pauseProject(projectId);
      res.json({ success: true, message: "Project paused" });
    } catch (error: any) {
      res.status(500).json({ success: false, error: error.message });
    }
  });

  app.post("/api/projects/:id/resume", async (req, res) => {
    try {
      const projectId = req.params.id;
      agentOrchestrator.resumeProject(projectId).catch(error => {
        console.error("Resume project error:", error);
      });
      res.json({ success: true, message: "Project resumed" });
    } catch (error: any) {
      res.status(500).json({ success: false, error: error.message });
    }
  });

  // Get project logs
  app.get("/api/projects/:id/logs", async (req, res) => {
    try {
      const projectId = req.params.id;
      const logs = await storage.getProjectLogs(projectId);
      res.json({ success: true, logs });
    } catch (error: any) {
      console.error("Get logs error:", error);
      res.status(500).json({ 
        success: false, 
        error: error.message || "Failed to get logs" 
      });
    }
  });

  // Get project files
  app.get("/api/projects/:id/files", async (req, res) => {
    try {
      const projectId = req.params.id;
      const files = await storage.getProjectFiles(projectId);
      res.json({ success: true, files });
    } catch (error: any) {
      console.error("Get files error:", error);
      res.status(500).json({ 
        success: false, 
        error: error.message || "Failed to get files" 
      });
    }
  });

  // Download project as ZIP (placeholder - would need archiving library)
  app.get("/api/projects/:id/download", async (req, res) => {
    try {
      const projectId = req.params.id;
      const files = await storage.getProjectFiles(projectId);
      const project = await storage.getProject(projectId);
      
      if (!project) {
        return res.status(404).json({ success: false, error: "Project not found" });
      }

      // For now, return file list - in production would generate ZIP
      res.json({ 
        success: true, 
        files: files.map(f => ({
          path: f.path,
          content: f.content,
          size: f.size,
          language: f.language
        })),
        project: {
          name: project.name,
          description: project.description
        }
      });
    } catch (error: any) {
      console.error("Download project error:", error);
      res.status(500).json({ 
        success: false, 
        error: error.message || "Failed to download project" 
      });
    }
  });

  // Get agent configurations
  app.get("/api/agents", (req, res) => {
    try {
      const configs = agentOrchestrator.getAgentConfigs();
      res.json({ success: true, agents: configs });
    } catch (error: any) {
      res.status(500).json({ success: false, error: error.message });
    }
  });

  // Health check
  app.get("/api/health", (req, res) => {
    res.json({ 
      status: "ok", 
      timestamp: new Date().toISOString(),
      version: "1.0.0"
    });
  });

  const httpServer = createServer(app);

  // Set up WebSocket server for real-time updates
  const wss = new WebSocketServer({ server: httpServer });

  wss.on("connection", (ws, req) => {
    const url = new URL(req.url || "", `http://${req.headers.host}`);
    const projectId = url.searchParams.get("projectId");
    
    if (projectId) {
      wsClients.set(projectId, ws);
      console.log(`WebSocket connected for project ${projectId}`);
      
      ws.on("close", () => {
        wsClients.delete(projectId);
        console.log(`WebSocket disconnected for project ${projectId}`);
      });
    }
  });

  // Set up agent orchestrator event listeners for real-time updates
  agentOrchestrator.on("log", (log) => {
    const ws = wsClients.get(log.projectId);
    if (ws && ws.readyState === 1) {
      ws.send(JSON.stringify({ type: "log", data: log }));
    }
  });

  agentOrchestrator.on("progress", (data) => {
    // Broadcast to all connected clients for now
    wsClients.forEach((ws) => {
      if (ws.readyState === 1) {
        ws.send(JSON.stringify({ type: "progress", data }));
      }
    });
  });

  agentOrchestrator.on("agent-started", (data) => {
    const ws = wsClients.get(data.projectId);
    if (ws && ws.readyState === 1) {
      ws.send(JSON.stringify({ type: "agent-started", data }));
    }
  });

  agentOrchestrator.on("agent-completed", (data) => {
    const ws = wsClients.get(data.projectId);
    if (ws && ws.readyState === 1) {
      ws.send(JSON.stringify({ type: "agent-completed", data }));
    }
  });

  agentOrchestrator.on("project-completed", (data) => {
    const ws = wsClients.get(data.projectId);
    if (ws && ws.readyState === 1) {
      ws.send(JSON.stringify({ type: "project-completed", data }));
    }
  });

  return httpServer;
}
