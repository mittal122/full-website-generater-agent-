import { sql } from "drizzle-orm";
import { pgTable, text, varchar, timestamp, json, integer } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// User management
export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
});

// Project state management
export const projects = pgTable("projects", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  description: text("description").notNull(),
  config: json("config").notNull(), // ProjectConfig JSON
  status: text("status").notNull().default("pending"), // pending, running, paused, completed, error
  state: json("state"), // Current agent state
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Agent execution logs
export const agentLogs = pgTable("agent_logs", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  projectId: varchar("project_id").notNull().references(() => projects.id, { onDelete: "cascade" }),
  agentName: text("agent_name").notNull(),
  level: text("level").notNull(), // info, warn, error, success
  message: text("message").notNull(),
  metadata: json("metadata"), // Additional context
  timestamp: timestamp("timestamp").defaultNow().notNull(),
});

// Generated files tracking
export const projectFiles = pgTable("project_files", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  projectId: varchar("project_id").notNull().references(() => projects.id, { onDelete: "cascade" }),
  path: text("path").notNull(),
  content: text("content").notNull(),
  size: integer("size").notNull(),
  language: text("language"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Schema exports
export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
});

export const insertProjectSchema = createInsertSchema(projects).pick({
  name: true,
  description: true,
  config: true,
});

export const insertAgentLogSchema = createInsertSchema(agentLogs).pick({
  projectId: true,
  agentName: true,
  level: true,
  message: true,
  metadata: true,
});

export const insertProjectFileSchema = createInsertSchema(projectFiles).pick({
  projectId: true,
  path: true,
  content: true,
  size: true,
  language: true,
});

// Type exports
export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;
export type Project = typeof projects.$inferSelect;
export type InsertProject = z.infer<typeof insertProjectSchema>;
export type AgentLog = typeof agentLogs.$inferSelect;
export type InsertAgentLog = z.infer<typeof insertAgentLogSchema>;
export type ProjectFile = typeof projectFiles.$inferSelect;
export type InsertProjectFile = z.infer<typeof insertProjectFileSchema>;

// Agent status types
export const AgentStatus = z.enum(["pending", "running", "completed", "error"]);
export const LogLevel = z.enum(["info", "warn", "error", "success"]);
export const ProjectStatus = z.enum(["pending", "running", "paused", "completed", "error"]);

// Agent state interface
export interface AgentState {
  currentAgent: string | null;
  completedAgents: string[];
  agentProgress: Record<string, number>;
  agentOutputs: Record<string, any>;
  errors: Array<{ agent: string; error: string; timestamp: string }>;
}
